const express = require('express');
const app = express();
const Contacto = require('../../server_contacto/models/contacto');
const Cliente = require('../models/cliente');
const Domicilio = require('../../server_direccion/models/domicilio');
const Persona = require('../../server_persona/models/persona');
// const Comercio = require('../models/comercio');
// const Referencia = require('../models/referencia');
const funciones = require('../../middlewares/funciones');



app.post('/cliente/nuevo/', async function(req, res) {
    let contactoGuardado = true;
    let avanzar = true;
    var contactos = [];

    if (req.body.persona._id == '0') {
        try {
            //genero el modelo de domicilio
            if (req.body.domicilio) {
                let domicilio = new Domicilio({
                    pais: req.body.domicilio.pais,
                    provincia: req.body.domicilio.provincia,
                    localidad: req.body.domicilio.localidad,
                    barrio: req.body.domicilio.barrio,
                    calle: req.body.domicilio.calle,
                    numeroCasa: req.body.domicilio.numeroCasa,
                    piso: req.body.domicilio.piso,
                    numeroDepartamento: req.body.domicilio.numeroDepartamento,
                    latitud: req.body.domicilio.latitud,
                    longitud: req.body.domicilio.longitud
                });
                let respDomicilio = await funciones.nuevoDomicilio(domicilio);


                if (respDomicilio.ok) {
                    req.body.persona.domicilio = domicilio._id;
                    avanzar = true;
                } else
                    avanzar = false;
                //genero el modelo de persona
            } else {
                avanzar = false;
            }

            let persona = new Persona({
                tipoDni: req.body.persona.tipoDni,
                dni: req.body.persona.dni,
                apellidos: req.body.persona.apellidos,
                nombres: req.body.persona.nombres,
                fechaNacimiento: req.body.persona.fechaNacimiento,
                // domicilio: domicilio._id
            });
            if (avanzar) {
                persona.domicilio = domicilio._id;
            } else
                avanzar = true;
            try {
                let respPersona = await funciones.nuevaPersona(persona);
                if (respPersona.ok)
                    req.body.persona._id = persona._id;
                else {
                    avanzar = false;
                    return res.status(400).json({
                        ok: false,
                        message: 'Error al dar de alta una persona. Dni duplicado'
                    });
                }
            } catch (e) {
                avanzar = false;
            }

        } catch (e) {
            avanzar = false;
        }
    }


    if (avanzar) {

        //la persona ya existe, hay que darle de alta a los contactos y al cliente
        for (var i in req.body.contactos) {
            // console.log(req.body.contactos[i]);
            let contacto = new Contacto({
                tipoContacto: req.body.contactos[i].tipoContacto,
                codigoPais: req.body.contactos[i].codigoPais,
                codigoArea: req.body.contactos[i].codigoArea,
                numeroCelular: req.body.contactos[i].numeroCelular,
                numeroFijo: req.body.contactos[i].numeroFijo,
                email: req.body.contactos[i].email
            });
            try {
                let respuesta = await funciones.nuevoContacto(contacto);
                if (respuesta.ok) {
                    contactos.push(contacto._id);
                }

                // console.log('array de contactos antes de asignarselo al cliente: ' + contactos);
            } catch (e) {
                console.log('Error al guardar el contacto: ' + contacto);
                console.log('Error de guardado: ' + e);
                contactoGuardado = false;
            }
        }


        if (contactoGuardado) {

            //por ultimo, doy de alta al cliente
            // console.log(contactos);
            let cliente = new Cliente({
                titular: req.body.persona._id,
                idCliente: req.body.idCliente,
                plataforma: req.body.plataforma
                    // ,tipoCliente: req.body.cliente.tipoCliente
            });
            // console.log('estos son los id de contacto que le voy cargar al cliente: ' + contactos);
            for (var i in contactos) {
                // console.log('el cliente tiene este contacto: ' + contactos[i]);
                cliente.contactos.push(contactos[i]);
            }
            cliente.save((err, clienteDB) => {
                if (err) {
                    return res.json({
                        ok: false,
                        err
                    });
                }


                res.json({
                    ok: true,
                    clienteDB
                });
            });
        }
    } else
        res.json({
            ok: false,
            message: 'No se pudo generar el registro'
        });

    // }
})

app.post('/cliente/todos/', async function(req, res) {
    Cliente.find()
        .populate('contactos')
        .populate({ path: 'contactos', populate: { path: 'tipoContacto' } })
        .populate({ path: 'titular', populate: { path: 'domicilio' } })
        .where({ 'estado': true })
        .exec((err, clientes) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if (!clientes) {
                return res.json({
                    ok: false,
                    err: {
                        message: 'No hay clientes'
                    }
                });
            }

            clientes = clientes.filter(function(clientes) {
                return clientes.titular != null;
            })

            return res.json({
                ok: true,
                recordsTotal: clientes.length,
                recordsFiltered: clientes.length,
                clientes
            });

        });
});

app.post('/cliente/buscar_por_dni/', async function(req, res) {
    let usuario = await aut.validarToken(req.body.token);

    if (!usuario) {
        return res.status(401).json({
            ok: false,
            message: 'Usuario no valido'
        });
    } else {
        usuario.url = '/cliente/buscar_por_dni/';
        let acceso = await aut.verifica_Permiso(usuario);

        if (!acceso) {
            return res.status(403).json({
                ok: false,
                message: 'Acceso denegado'
            });
        } else {
            let dni_ = req.body.dni;
            // console.log("dni buscado: " + dni_);
            Cliente.find()
                .populate('contactos')
                .populate({ path: 'contactos', populate: { path: 'tipoContacto' } })
                // .populate({
                //     path: 'titular',
                //     match: { dni: { $eq: dni_ } }
                // })
                .populate({
                    path: 'titular',
                    populate: { path: 'domicilio' },
                    match: { dni: { $eq: dni_ } }
                })
                .where({ 'estado': true })
                .exec((err, clientes) => {
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            err
                        });
                    }

                    clientes = clientes.filter(function(clientes) {
                        return clientes.titular != null;
                    })

                    if (clientes.length == 0) {
                        return res.status(400).json({
                            ok: false,
                            err: {
                                message: 'No hay clientes'
                            }
                        });
                    }
                    res.json({
                        ok: true,
                        recordsTotal: clientes.length,
                        recordsFiltered: clientes.length,
                        clientes
                    });

                });
        }
    }
});


app.delete('/cliente/deshabilitar/', async function(req, res) {

    let id = req.body.idCliente;
    // var fecha = new Date();
    let cambiaEstado = {
        estado: false
    };
    // console.log("id a buscar: " + id);
    Cliente.findByIdAndUpdate(id, cambiaEstado, { new: true }, (err, clienteBorrado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        };

        if (!clienteBorrado) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no encontrado'
                }
            });
        }

        res.json({
            ok: true,
            message: 'El cliente fue deshabilitado'
        });

    });


    // let usuario = await aut.validarToken(req.body.token);
    // if (!usuario) {
    //     return res.status(401).json({
    //         ok: false,
    //         message: 'Usuario no valido'
    //     });
    // } else {
    //     usuario.url = '/cliente/deshabilitar/';
    //     let acceso = await aut.verifica_Permiso(usuario);

    //     if (!acceso) {
    //         return res.status(403).json({
    //             ok: false,
    //             message: 'Acceso denegado'
    //         });
    //     } else {

    //     }
    // }
});


app.post('/cliente/combos/', async function(req, res) {
    let respuesta = await funciones.combosNuevoCliente();
    res.json({
        ok: true,
        respuesta
    });
});


module.exports = app;