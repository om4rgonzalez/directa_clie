const express = require('express');
const app = express();
const _ = require('underscore');
const Persona = require('../models/persona');

//busqueda de persona por dni
app.get('/persona', function(req, res) {



    Persona.find({ "dni": req.query.dni })
        // .populate('tipoDni', 'nombre')
        .populate('domicilio')
        .populate({ path: 'domicilio', populate: { path: 'estadoCasa' } })
        .exec((err, personaDB) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }


            // console.log("Se encontro el dni " + req.query.dni);
            res.json({
                ok: true,
                personaDB: personaDB[0]
            });

        });
})

//app.get('/persona/obtener_persona/', [verificaToken], function(req, res) {
app.post('/persona/obtener_persona/', async function(req, res) {

    let usuario = await aut.validarToken(req.body.token);

    if (!usuario) {
        return res.status(401).json({
            ok: false,
            message: 'Usuario no valido'
        });
    } else {
        Persona.find({ "dni": req.body.dni })
            // .populate('tipoDni', 'nombre')
            .populate('domicilio')
            .populate({ path: 'domicilio', populate: { path: 'estadoCasa' } })
            .exec((err, personaDB) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                }
                if (personaDB.length == 0) {
                    return res.status(400).json({
                        ok: false,
                        message: 'No existe una persona con ese DNI'
                    });
                }

                if (!personaDB) {
                    return res.status(400).json({
                        ok: false,
                        err: {
                            message: 'Dni no registrado'
                        }
                    });
                }
                // console.log("Se encontro el dni " + req.query.dni);
                res.json({
                    ok: true,
                    personaDB
                });

            });
    }


})

//busqueda de persona por _id
app.get('/persona/:id', function(req, res) {


    Persona.findById(req.params.id)
        // .populate('tipoDni', 'nombre')
        .populate('domicilio')
        .populate({ path: 'domicilio', populate: { path: 'estadoCasa' } })
        .exec((err, personaDB) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if (!personaDB) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'No se encontra ninguna persona'
                    }
                });
            }
            // console.log("Se encontro el dni " + req.query.dni);
            res.json({
                ok: true,
                personaDB
            });

        });
})


app.post('/persona/nueva/', function(req, res) {
    let objeto = req.body;
    let persona = new Persona({
        _id: objeto._id,
        tipoDni: objeto.tipoDni,
        dni: objeto.dni,
        apellidos: objeto.apellidos,
        nombres: objeto.nombres,
        fechaNacimiento: objeto.fechaNacimiento
    });

    Persona.find({ dni: objeto.dni })
        .exec(async(err, exito) => {
            if (err) {
                console.log('La busqueda de persona para dar de alta devolvio un error.');
                console.log(err.message);
                return res.json({
                    ok: false,
                    message: 'La busqueda de persona para dar de alta devolvio un error.',
                    personaDB: null
                });
            }

            if (exito.length == 0) {
                //la persona no existe, se puede dar de alta
                persona.save((err1, PersonaDB) => {
                    if (err1) {
                        console.log("Error al dar de alta la persona: " + err);
                        return res.json({
                            ok: false,
                            message: 'El alta de persona devolvio un error',
                            PersonaDB: null
                        });
                    }

                    res.json({
                        ok: true,
                        message: 'Alta completa',
                        PersonaDB: PersonaDB._id
                    });
                });
            } else {
                console.log("La persona ya esta cargada");
                console.log('Devolviendo el id ' + exito[0]._id);
                return res.json({
                    ok: true,
                    message: 'La persona ya figura en la base de datos',
                    PersonaDB: exito[0]._id
                });
            }
        });
});

//update de persona
app.put('/persona/actualizar/:id', function(req, res) {

    let id = req.params.id;
    let body = _.pick(req.body, ['apellidos', 'nombres', 'fechaNacimiento']);

    //Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, usuarioDB) => {
    Persona.findByIdAndUpdate(id, body, (err, PersonaDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                message: 'No se pudo realizar la actualizacion'
            });
        }



        res.json({
            ok: true,
            message: 'La actualizacion se realizo correctamente'
        });

    })

});





module.exports = app;