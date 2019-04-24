const express = require('express');
const app = express();

const Invitacion = require('../models/invitacion');
const funciones = require('../../middlewares/funciones');
const Comercio = require('../../server_entidades/models/comercio');
const Proveedor = require('../models/proveedor');
const Alias = require('../models/alias');
// const Domicilio = require('../../server_direccion/models/domicilio');

// app.post('/invitacion/nueva_invitacion_de_comercio', function(req, res) {
//     let invitacion = new Invitacion({
//         comercio: req.body.comercio,
//             proveedor: req.body.proveedor,
//             texto: req.body.texto,
//             esProveedor: false
//     });
//     let respuesta = await funciones.nuevaInvitacion(invitacion);

// });


app.post('/invitacion/nueva/', async function(req, res) {
    let hoy = new Date();
    //verifico si el proveedor ya forma parte de la red del comercio

    let forma;
    if (!req.body.esProveedor) {
        //verifico si existe el comercio
        let existe = await funciones.verificarExistenciaComercio(req.body.comercio);
        if (existe.ok) {
            forma = await funciones.verificarExistenciaProveedorEnRedComercio(req.body.proveedor, req.body.comercio);
        } else {
            console.log(hoy + ' EL comercio que intenta enviar la invitacion no esta registrado en la plataforma');
            return res.json({
                ok: false,
                message: 'EL comercio que intenta enviar la invitacion no esta registrado en la plataforma'
            });
        }
    } else {
        //verifico si existe el proveedor
        let existe = await funciones.verificarExistenciaProveedor(req.body.comercio);
        if (existe.ok) {
            forma = await funciones.verificarExistenciaProveedorEnRedProveedor(req.body.proveedor, req.body.comercio);
        } else {
            console.log(hoy + ' EL proveedor que intenta enviar la invitacion no esta registrado en la plataforma');
            return res.json({
                ok: false,
                message: 'EL proveedor que intenta enviar la invitacion no esta registrado en la plataforma'
            });
        }
    }

    //verifico que exista el destino de la invitacion
    let existeProveedor = await funciones.verificarExistenciaProveedor(req.body.proveedor);
    if (existeProveedor.ok) {
        //verifico que el origen no le haya enviado una invitacion previa
        let existeInvitacion = await funciones.verificarExistenciaInivitacion(req.body.proveedor, req.body.comercio);
        if (!existeInvitacion.ok) {

            // console.log('La funcion devuelve ' + forma.ok);
            if (forma.ok) {
                let invitacion = Invitacion({
                    comercio: req.body.comercio,
                    proveedor: req.body.proveedor,
                    texto: req.body.texto,
                    esProveedor: req.body.esProveedor
                });
                try {
                    invitacion.save((err, invitacionDB) => {
                        if (err) {
                            console.log(hoy + ' Error en el proceso de guardar la invitacion');
                            console.log(hoy + ' ' + err.message);
                            return res.json({
                                ok: false,
                                message: 'EL proceso de guardar la invitacion produjo un error'
                            });
                        }
                        if (!req.body.esProveedor) {
                            //es comercio
                            let respuestaMensajePush = funciones.nuevoMensaje({
                                metodo: '/invitacion/nueva/',
                                tipoError: 0,
                                parametros: '$comercio',
                                valores: req.body.comercio,
                                buscar: 'SI',
                                esPush: true,
                                destinoEsProveedor: true,
                                destino: req.body.proveedor
                            });
                        } else {
                            //es proveedor
                            let respuestaMensajePush = funciones.nuevoMensaje({
                                metodo: '/invitacion/nueva/',
                                tipoError: 1,
                                parametros: '$proveedor',
                                valores: req.body.comercio,
                                buscar: 'SI',
                                esPush: true,
                                destinoEsProveedor: true,
                                destino: req.body.proveedor
                            });
                        }

                        res.json({
                            ok: true,
                            message: 'La invitacion se envio con exito'
                        });
                    });

                } catch (e) {
                    console.log(hoy + ' Fallo la ejecucion de una funcion: ' + e.message);
                    return res.json({
                        ok: false,
                        message: 'Fallo la ejecucion de una funcion: ' + e.message
                    });
                }
            } else {
                console.log(hoy + ' El proveedor ya forma parte de la red del comercio');
                return res.json({
                    ok: false,
                    message: 'El proveedor ya forma parte de la red del comercio'
                });
            }

        } else {
            console.log(hoy + ' El proveedor ya tiene una invitacion pendiente de revision');
            return res.json({
                ok: false,
                message: 'El proveedor ya tiene una invitacion pendiente de revision'
            });
        }

    } else {
        console.log(hoy + ' El proveedor no esta registrado en la plataforma');
        return res.json({
            ok: false,
            message: 'El proveedor no esta registrado en la plataforma'
        });
    }



});





app.get('/invitacion/consultar_pendientes/', async function(req, res) {
    let hoy = new Date();
    // console.log('El proveedor que consulta es: ' + req.query.proveedor);
    Invitacion.find({ proveedor: req.query.proveedor })
        // .populate('comercio')
        // .populate({ path: 'comercio', populate: { path: 'entidad' } })
        // .populate({ path: 'comercio', select: 'entidad', populate: { path: 'entidad' } })
        // .populate({ path: 'comercio', select: 'entidad', populate: { path: 'entidad', populate: { path: 'domicilio' } } })
        // .populate({ path: 'proveedor', select: 'entidad', populate: { path: 'entidad', populate: { path: 'domicilio' } } })
        .where({ 'pendienteDeRevision': true })
        .exec(async(err, invitaciones) => {
            if (err) {
                return res.json({
                    ok: false,
                    message: 'La busqueda produjo un error. Error: ' + err.message
                });
            }

            if (!invitaciones) {
                return res.json({
                    ok: false,
                    message: 'El proveedor no tiene invitaciones pendientes de revision'
                });
            }

            if (invitaciones.length == 0) {
                return res.json({
                    ok: false,
                    message: 'El proveedor no tiene invitaciones pendientes de revision'
                });
            }
            //Filtro los resultados
            let z = 0;
            let hasta = invitaciones.length;
            let invitaciones_ = [];
            // console.log('Antes de empezar el bucle, z vale: ' + z);
            while (z < hasta) {
                // console.log('Z en el bucle vale: ' + z);
                if (invitaciones[z].esProveedor) {
                    //busco los datos de entidad del proveedor
                    console.log(hoy + ' La invitacion es de un proveedor. Procedo a buscarlo');
                    let proveedor_ = await funciones.buscarProveedorPorId(invitaciones[z].comercio);
                    if (proveedor_.ok) {
                        invitaciones_.push({
                            esProveedor: true,
                            aceptada: invitaciones[z].aceptada,
                            pendienteDeRevision: invitaciones[z].pendienteDeRevision,
                            _id: invitaciones[z]._id,
                            entidad: proveedor_.proveedor.entidad,
                            texto: invitaciones[z].texto,
                            fechaAceptada: invitaciones[z].fechaAceptada,
                            fechaAlta: invitaciones[z].fechaAlta
                        });

                    }

                } else {
                    //busco el domicilio en el comercio
                    console.log('La invitacion es de un comercio. Procedo a buscarlo');
                    let comercio_ = await funciones.buscarComercioPorId(invitaciones[z].comercio);
                    if (comercio_.ok) {
                        invitaciones_.push({
                            esProveedor: false,
                            aceptada: invitaciones[z].aceptada,
                            pendienteDeRevision: invitaciones[z].pendienteDeRevision,
                            _id: invitaciones[z]._id,
                            entidad: comercio_.comercio.entidad,
                            texto: invitaciones[z].texto,
                            fechaAceptada: invitaciones[z].fechaAceptada,
                            fechaAlta: invitaciones[z].fechaAlta
                        });
                    }
                }

                z++;
            }
            res.json({
                ok: true,
                message: 'Invitaciones encontradas',
                invitaciones: invitaciones_
            });
        });
});


app.post('/invitacion/aceptar_rechazar/', async function(req, res) {
    let fecha = new Date();
    Invitacion.findByIdAndUpdate(req.body.idInvitacion, {
        $set: {
            aceptada: req.body.aceptada,
            fechaAceptada: fecha,
            pendienteDeRevision: false
        }
    }, async function(err, invitacionDB) {
        if (err) {

            return res.json({
                ok: false,
                message: 'No se pudo completar la operacion'
            });
        }

        if (!invitacionDB) {
            return res.json({
                ok: false,
                message: 'No se encontro la ivitacion'
            });
        }

        // console.log(invitacionDB);

        if (req.body.aceptada) {
            ////////////////////
            if (invitacionDB.esProveedor) {
                //agrego el proveedor a la red de proveedores del proveedor que envio la solicitud
                Proveedor.findOneAndUpdate({ _id: invitacionDB.comercio }, { $push: { proveedores: invitacionDB.proveedor } },
                    function(err2, success) {
                        if (err2) {
                            return res.json({
                                ok: false,
                                message: 'No se pudo completar la operacion. Error: ' + err2.message
                            });
                        }

                        //ahora agrego el proveedor que envio la invitacion a la red del proveedor
                        //genero el alias
                        let alias = new Alias({
                            esProveedor: true,
                            comercio: invitacionDB.comercio,
                            alias: req.body.alias
                        });
                        alias.save();

                        Proveedor.findOneAndUpdate({ _id: invitacionDB.proveedor }, { $push: { red: alias._id } },
                            function(errP, exito) {
                                if (errP) {
                                    console.log('La funcion de agregar proveedor a la red devolvio un error');
                                    console.log(errP.message);
                                    return res.json({
                                        ok: false,
                                        message: 'La funcion de agregar proveedor a la red devolvio un error'
                                    });
                                }

                                //mando el push
                                let respuestaMensajePush = funciones.nuevoMensaje({
                                    metodo: '/invitacion/aceptar_rechazar/',
                                    tipoError: 0,
                                    parametros: '$proveedor',
                                    valores: invitacionDB.proveedor,
                                    buscar: 'SI',
                                    esPush: true,
                                    destinoEsProveedor: true,
                                    destino: invitacionDB.comercio
                                });

                                return res.json({
                                    ok: true,
                                    message: 'La invitacion fue aceptada'
                                });

                            });

                    });

            } else {
                Comercio.findOneAndUpdate({ _id: invitacionDB.comercio }, { $push: { proveedores: invitacionDB.proveedor } },
                    function(err2, success) {
                        if (err2) {
                            return res.json({
                                ok: false,
                                message: 'No se pudo completar la operacion. Error: ' + err2.message
                            });
                        }

                        //ahora agrego el proveedor que envio la invitacion a la red del proveedor
                        //genero el alias
                        let alias = new Alias({
                            esProveedor: false,
                            comercio: invitacionDB.comercio,
                            alias: req.body.alias
                        });
                        alias.save();

                        Proveedor.findOneAndUpdate({ _id: invitacionDB.proveedor }, { $push: { red: alias._id } },
                            function(errP, exito) {
                                if (errP) {
                                    console.log('La funcion de agregar proveedor a la red devolvio un error');
                                    console.log(errP.message);
                                    return res.json({
                                        ok: false,
                                        message: 'La funcion de agregar proveedor a la red devolvio un error'
                                    });
                                }
                                //mando el push
                                let respuestaMensajePush = funciones.nuevoMensaje({
                                    metodo: '/invitacion/aceptar_rechazar/',
                                    tipoError: 0,
                                    parametros: '$proveedor',
                                    valores: invitacionDB.proveedor,
                                    buscar: 'SI',
                                    esPush: true,
                                    destinoEsProveedor: false,
                                    destino: invitacionDB.comercio
                                });

                                return res.json({
                                    ok: true,
                                    message: 'La invitacion fue aceptada'
                                });

                            });


                    });
            }




            ////////////////////


            // Comercio.findOneAndUpdate(invitacionDB.comercio, { $push: { proveedores: invitacionDB.proveedor } });
        } else {
            if (invitacionDB.esProveedor) {
                let respuestaMensajePush = funciones.nuevoMensaje({
                    metodo: '/invitacion/aceptar_rechazar/',
                    tipoError: 1,
                    parametros: '$proveedor',
                    valores: invitacionDB.proveedor,
                    buscar: 'SI',
                    esPush: true,
                    destinoEsProveedor: true,
                    destino: invitacionDB.comercio
                });
            } else {
                let respuestaMensajePush = funciones.nuevoMensaje({
                    metodo: '/invitacion/aceptar_rechazar/',
                    tipoError: 1,
                    parametros: '$proveedor',
                    valores: invitacionDB.proveedor,
                    buscar: 'SI',
                    esPush: true,
                    destinoEsProveedor: false,
                    destino: invitacionDB.comercio
                });
            }



            return res.json({
                ok: true,
                message: 'La invitacion fue rechazada'
            });
        }


    });

});


app.post('/invitacion/aceptar_rechazar/', async function(req, res) {
    let fecha = new Date();
    Invitacion.findByIdAndUpdate(req.body.idInvitacion, {
        $set: {
            aceptada: req.body.aceptada,
            fechaAceptada: fecha,
            pendienteDeRevision: false
        }
    }, async function(err, invitacionDB) {
        if (err) {

            return res.json({
                ok: false,
                message: 'No se pudo completar la operacion'
            });
        }

        if (!invitacionDB) {
            return res.json({
                ok: false,
                message: 'No se encontro la ivitacion'
            });
        }

        // console.log(invitacionDB);

        if (req.body.aceptada) {

            ////////////////////

            Comercio.findOneAndUpdate({ _id: invitacionDB.comercio }, { $push: { proveedores: invitacionDB.proveedor } },
                function(err2, success) {
                    if (err2) {
                        return res.json({
                            ok: false,
                            message: 'No se pudo completar la operacion. Error: ' + err2.message
                        });
                    }

                    return res.json({
                        ok: true,
                        message: 'La invitacion fue aceptada'
                    });


                });

            //agrego el comercio o el proveedor a la red del proveedor
            let alias = new Alias({

            })

            ////////////////////


            // Comercio.findOneAndUpdate(invitacionDB.comercio, { $push: { proveedores: invitacionDB.proveedor } });
        } else {
            return res.json({
                ok: true,
                message: 'La invitacion fue rechazada'
            });
        }


    });

});

app.post('/invitacion/existe/', async function(req, res) {
    let hoy = new Date();
    Invitacion.find({ proveedor: req.body.idProveedor, comercio: req.body.idComercio })
        .where({ pendienteDeRevision: true })
        .exec(async(err, invitaciones) => {
            if (err) {
                console.log(hoy + ' La busqueda de invitaciones devolvio un error');
                console.log(hoy + ' ' + err.message);
                return res.json({
                    ok: false
                });
            }

            if (invitaciones.length == 0) {
                return res.json({
                    ok: false
                });
            }

            //si existen invitaciones
            res.json({
                ok: true
            });
        })

});

module.exports = app;