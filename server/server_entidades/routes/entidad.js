const express = require('express');
const app = express();

const Entidad = require('../models/entidad');
const funciones = require('../../middlewares/funciones');
const Domicilio = require('../../server_direccion/models/domicilio');


app.post('/entidad/nueva/', async function(req, res) {
    // console.log('Comienzo dando de alta el domicilio')
    let domicilio = Domicilio({
        pais: req.body.domicilio.pais,
        provincia: req.body.domicilio.provincia,
        localidad: req.body.domicilio.localidad,
        barrio: req.body.domicilio.barrio,
        calle: req.body.domicilio.calle,
        numeroCasa: req.body.domicilio.numeroCasa,
        piso: req.body.domicilio.piso,
        numeroDepartamento: req.body.domicilio.numeroDepartamento,
        latitud: req.body.domicilio.latitud,
        longitud: req.body.domicilio.longitud,
        codigoPostal: req.body.domicilio.codigoPostal
    });
    try {
        let respuestaDomicilio = await funciones.nuevoDomicilio(domicilio);
        if (respuestaDomicilio.ok) {
            //doy de alta la entidad
            let entidad = new Entidad({
                _id: req.body.entidad._id,
                cuit: req.body.entidad.cuit,
                razonSocial: req.body.entidad.razonSocial,
                domicilio: domicilio._id,
                actividadPrincipal: req.body.entidad.actividadPrincipal,
                tipoPersoneria: req.body.entidad.tipoPersoneria
            });

            entidad.save((err, entidadDB) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        err
                    });
                }


                res.json({
                    ok: true,
                    entidadDB
                });
            });
        } else {
            return res.status(412).json({
                ok: false,
                message: 'Fallo la carga del domicilio'
            });
        }
    } catch (e) {
        return res.status(500).json({
            ok: false,
            message: 'Fallo la ejecucion de una funcion: ' + e.message
        });
    }

});


app.post('/entidad/nueva_/', async function(req, res) {
    // console.log('Comienzo dando de alta el domicilio')

    // let domicilio = Domicilio({
    //     pais: req.body.pais,
    //     provincia: req.body.provincia,
    //     localidad: req.body.localidad,
    //     barrio: req.body.barrio,
    //     calle: req.body.calle,
    //     numeroCasa: req.body.numeroCasa,
    //     piso: req.body.piso,
    //     numeroDepartamento: req.body.numeroDepartamento,
    //     latitud: req.body.latitud,
    //     longitud: req.body.longitud,
    //     codigoPostal: req.body.codigoPostal
    // });

    try {
        // let respuestaDomicilio = await funciones.nuevoDomicilio(domicilio);
        console.log('cuit: ' + req.body.cuit);

        // if (respuestaDomicilio.ok) {
        //doy de alta la entidad
        let entidad = new Entidad({
            _id: req.body.idEntidad,
            cuit: req.body.cuit,
            razonSocial: req.body.razonSocial,
            domicilio: null,
            actividadPrincipal: req.body.actividadPrincipal,
            tipoPersoneria: req.body.tipoPersoneria
        });

        Entidad.find({ cuit: req.body.cuit })
            .exec(async(err, exito) => {
                if (err) {
                    console.log('La busqueda de comercio para dar de alta devolvio un error.');
                    console.log(err.message);
                    return res.json({
                        ok: false,
                        message: err.message,
                        entidadDB: null
                    });
                }

                if (exito.length == 0) {
                    //no hay resutlados. Se puede dar de alta la entidad
                    entidad.save((err1, entidadDB) => {
                        if (err1) {
                            console.log('El alta de entidad devolvio un error.');
                            console.log(err1.message);
                            return res.json({
                                ok: false,
                                message: 'Error al dar de alta la entidad',
                                entidadDB: null
                            });
                        }


                        res.json({
                            ok: true,
                            message: 'Alta de entidad completa',
                            entidadDB: entidadDB
                        });
                    });
                } else {
                    //hay resultados, debo devolver la entidad
                    res.json({
                        ok: true,
                        message: 'La entidad ya figura en la base de datos',
                        entidadDB: exito[0]
                    });
                }
            });


        // } else {
        //     return res.status(412).json({
        //         ok: false,
        //         message: 'Fallo la carga del domicilio'
        //     });
        // }
    } catch (e) {
        return res.status(500).json({
            ok: false,
            message: 'Fallo la ejecucion de una funcion: ' + e.message
        });
    }

});




module.exports = app;