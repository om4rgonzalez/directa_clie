const express = require('express');
const app = express();
const Contacto = require('../../server_contacto/models/contacto');
const Cliente = require('../models/cliente');
const Domicilio = require('../../server_direccion/models/domicilio');
const Persona = require('../../server_persona/models/persona');
// const Comercio = require('../models/comercio');
// const Referencia = require('../models/referencia');
const funciones = require('../../middlewares/funciones');



app.post('/cliente/importar/', async function(req, res) {

    let personas = [];
    let direcciones = [];
    let contactos = [];
    let clientes = [];
    for (var i in req.body.clientes) {
        let d = {
            pais: req.body.clientes[i].pais,
            provincia: req.body.clientes[i].provincia,
            localidad: req.body.clientes[i].localidad,
            barrio: req.body.clientes[i].barrio,
            calle: req.body.clientes[i].calle,
            numeroCasa: req.body.clientes[i].numeroCasa,
            latitud: req.body.clientes[i].latitud,
            longitud: req.body.clientes[i].longitud,
            URLUbicacion: req.body.clientes[i].URLUbicacion,
            codigoPostal: req.body.clientes[i].codigoPostal,
            referenciaUbicacion: req.body.clientes[i].referenciaUbicacion
        };
        let c = [{
            tipoContacto: req.body.clientes[i].tipoContacto,
            codigoPais: req.body.clientes[i].codigoPais,
            codigoArea: req.body.clientes[i].codigoArea,
            numeroCelular: req.body.clientes[i].numeroCelular
        }];

        let p = {
            tipoDni: 'DNI',
            dni: req.body.clientes[i].dni,
            apellidos: req.body.clientes[i].apellidos.toUpperCase(),
            nombres: req.body.clientes[i].nombres.toUpperCase()
        };

        let clie = {
            idCliente: req.body.clientes[i]._id,
            plataformaUsadaParaAlta: 'PROCESO DE IMPORTACION'
        };
        let resp = await funciones.nuevoCliente(d, c, p, clie);
        if (!resp.ok) {
            console.log('Algo fallo en el proceso de alta de clientes');
            return res.json({
                ok: false,
                message: 'Algo fallo en el proceso de importacion de clientes'
            });
        }
    }

    res.json({
        ok: true,
        message: 'Proceso terminado exitosamente'
    });
});


app.post('/cliente/nuevo/', async function(req, res) {
    var contactos = [];
    let domiciliosEntrega = [];
    //Valido que el json de entrada tenga todos los datos
    if (req.body.domicilio && req.body.contactos && req.body.cliente && req.body.persona) {
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
                    latitud: req.body.domicilio.latitud,
                    longitud: req.body.domicilio.longitud,
                    URLUbicacion: req.body.domicilio.URLUbicacion,
                    codigoPostal: req.body.domicilio.codigoPostal,
                    referenciaUbicacion: req.body.domicilio.referenciaUbicacion
                });
                let respDomicilio = await funciones.nuevoDomicilio(domicilio);


                if (respDomicilio.ok) {
                    domiciliosEntrega.push(domicilio._id);

                    //doy de alta los datos de contacto
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
                                //doy de alta a la persona
                                let persona = new Persona({
                                    tipoDni: req.body.persona.tipoDni,
                                    dni: req.body.persona.dni,
                                    apellidos: req.body.persona.apellidos.toUpperCase(),
                                    nombres: req.body.persona.nombres.toUpperCase(),
                                    fechaNacimiento: req.body.persona.fechaNacimiento
                                });
                                try {
                                    let respPersona = await funciones.nuevaPersona(persona);
                                    if (respPersona.ok) {
                                        let cliente = new Cliente({
                                            datosPersonales: persona._id,
                                            idCliente: req.body.cliente.idCliente,
                                            plataformaUsadaParaAlta: req.body.cliente.plataformaUsadaParaAlta.toUpperCase(),
                                            puntosEntrega: domiciliosEntrega,
                                            contactos: contactos,
                                            calificacion: 0
                                        });
                                        cliente.save((err, clienteDB) => {
                                            if (err) {
                                                console.log('El alta del cliente arrojo un error');
                                                console.log('Error: ' + err.message);
                                                return res.json({
                                                    ok: false,
                                                    message: 'El alta del cliente arrojo un error'
                                                });
                                            }

                                            console.log('El cliente con dni ' + persona.dni + ' ha sido dado de alta');
                                            res.json({
                                                ok: true,
                                                message: 'Alta completada'
                                            });
                                        });
                                    } else {
                                        return res.json({
                                            ok: false,
                                            message: 'Error al dar de alta los datos personales'
                                        });
                                    }
                                } catch (e) {
                                    return res.json({
                                        ok: false,
                                        message: 'Error al dar de alta los datos personales'
                                    });
                                }
                            }
                            // console.log('array de contactos antes de asignarselo al cliente: ' + contactos);
                        } catch (e) {
                            console.log('Error al guardar el contacto: ' + contacto);
                            console.log('Error de guardado: ' + e);
                            return res.json({
                                ok: false,
                                message: 'Se produjo un error al intentar guardar los datos de contacto del cliente'
                            });
                        }
                    }
                }
            }
        } catch (e) {
            return res.json({
                ok: false,
                message: 'Se produjo un error en el proceso de generar un nuevo cliente'
            });
        }
    } else {
        //si falta alguno de estos datos no se puede avanzar
        return res.json({
            ok: false,
            message: 'Los datos del cliente estan incompletos, debe tener cargado domicilio de entrega, datos de contacto y datos del titular'
        });
    }
});



app.post('/cliente/todos/', async function(req, res) {
    Cliente.find()
        .populate('puntosEntrega')
        .populate('contactos')
        .populate('datosPersonales')
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