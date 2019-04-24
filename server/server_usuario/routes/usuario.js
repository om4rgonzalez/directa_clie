const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const _ = require('underscore');
// const { verificaToken, verifica_Permiso } = require('../middlewares/autenticacion');
const funciones = require('../../middlewares/funciones');
const Domicilio = require('../../server_direccion/models/domicilio');
const Persona = require('../../server_persona/models/persona');
const Contacto = require('../../server_contacto/models/contacto');
// const aut = require('../../middlewares/autenticacion');
const Login = require('../models/login');
const Sesion = require('../models/sesion');

let Usuario = require('../models/usuario')

// app.post('/usuario/todos/', async function(req, res) {
//         let usuario = await aut.validarToken(req.body.token);
//         if (!usuario) {
//             return res.status(401).json({
//                 ok: false,
//                 message: 'Usuario no valido'
//             });
//         } else {
//             usuario.url = '/usuario/todos/';
//             let acceso = await aut.verifica_Permiso(usuario);

//             if (!acceso) {
//                 return res.status(403).json({
//                     ok: false,
//                     message: 'Acceso denegado'
//                 });
//             } else {

//                 let idRol = usuario.precedencia;
//                 Usuario.find()
//                     .populate({
//                         path: 'rol',
//                         match: { precedencia: { $gt: idRol } }
//                     })
//                     .populate('contactos')
//                     .populate({ path: 'contactos', populate: { path: 'tipoContacto' } })
//                     .populate('persona')
//                     .populate({ path: 'persona', populate: { path: 'tipoDni' } })
//                     .populate({ path: 'persona', populate: { path: 'domicilio' } })
//                     .populate({
//                         path: 'persona',
//                         populate: { path: 'domicilio', populate: { path: 'estadoCasa' } }
//                     })
//                     // .populate('rol')
//                     .where({ 'estado': true })
//                     .exec((err, usuarios) => {

//                         // console.log(usuarios.length);

//                         if (err) {
//                             return res.status(500).json({
//                                 ok: false,
//                                 err
//                             });
//                         }

//                         if (!usuarios) {
//                             return res.status(400).json({
//                                 ok: false,
//                                 err: {
//                                     message: 'No hay usuarios'
//                                 }
//                             });
//                         }

//                         usuarios = usuarios.filter(function(usuarios) {
//                             return usuarios.rol != null;
//                         })

//                         let respuesta = [];
//                         for (var i in usuarios) {
//                             // console.log('Id usuario: ' + usuarios[i]._id);
//                             // console.log('DNI: ' + usuarios[i].persona.dni);
//                             // console.log(i);
//                             let item = new Object({
//                                 _id: usuarios[i]._id,
//                                 estado: usuarios[i].estado,
//                                 dni: usuarios[i].persona.dni,
//                                 apellidos: usuarios[i].persona.apellidos,
//                                 nombres: usuarios[i].persona.nombres,
//                                 nombreUsuario: usuarios[i].nombreUsuario,
//                                 rol: usuarios[i].rol.nombre
//                             });
//                             respuesta.push(item);
//                         }


//                         return res.json({
//                             ok: true,
//                             recordsTotal: usuarios.length,
//                             recordsFiltered: usuarios.length,
//                             draw: 0,
//                             respuesta
//                         });

//                     });
//             }
//         }
//     }

// );

// app.post('/usuario/buscar_por_dni/', async function(req, res) {
//     let usuario = await aut.validarToken(req.body.token);

//     if (!usuario) {
//         return res.status(401).json({
//             ok: false,
//             message: 'Usuario no valido'
//         });
//     } else {
//         usuario.url = '/usuario/buscar_por_dni/';
//         let acceso = await aut.verifica_Permiso(usuario);

//         if (!acceso) {
//             return res.status(403).json({
//                 ok: false,
//                 message: 'Acceso denegado'
//             });
//         } else {
//             let dni_ = req.body.dni;
//             let idRol = usuario.precedencia;
//             // console.log("dni buscado: " + dni_);
//             Usuario.find()
//                 .populate('contactos')
//                 .populate({
//                     path: 'rol',
//                     match: { precedencia: { $gt: idRol } }
//                 })
//                 .populate({ path: 'contactos', populate: { path: 'tipoContacto' } })
//                 // .populate('persona')
//                 .populate({
//                     path: 'persona',
//                     match: { dni: { $eq: dni_ } }
//                 })
//                 .populate({
//                     path: 'persona',
//                     populate: { path: 'tipoDni' },
//                     match: { dni: { $eq: dni_ } }
//                 })
//                 .populate({
//                     path: 'persona',
//                     populate: { path: 'domicilio' },
//                     match: { dni: { $eq: dni_ } }
//                 })
//                 .populate('tipoCliente')
//                 .populate({
//                     path: 'persona',
//                     populate: {
//                         path: 'domicilio',
//                         populate: { path: 'estadoCasa' }
//                     },
//                     match: { dni: { $eq: dni_ } }
//                 })
//                 .populate('referencia')
//                 // .populate('comercios')
//                 // .populate({ path: 'comercios', populate: { path: 'referencia' } })
//                 .where({ 'estado': true })
//                 .exec((err, usuario) => {

//                     // console.log(usuarios.length);

//                     if (err) {
//                         return res.status(500).json({
//                             ok: false,
//                             err
//                         });
//                     }

//                     usuario = usuario.filter(function(usuario) {
//                         return usuario.rol != null;
//                     });

//                     usuario = usuario.filter(function(usuario) {
//                         return usuario.persona != null;
//                     });

//                     if (usuario.length == 0) {
//                         return res.status(400).json({
//                             ok: false,
//                             err: {
//                                 message: 'No hay un usuario con ese DNI'
//                             }
//                         });
//                     }



//                     res.json({
//                         ok: true,
//                         recordsTotal: usuario.length,
//                         recordsFiltered: usuario.length,
//                         usuario
//                     });

//                 });
//         }
//     }
// })



app.post('/usuario/ingresar/', function(req, res) {
    let parametros = req.body;
    console.log('Parametros recibidos en el login');
    console.log(parametros);
    let hoy = new Date();

    Usuario.findOne({ nombreUsuario: parametros.nombreUsuario, estado: { $eq: true } })
        .populate('rol', 'precedencia')
        // .where('estado' == true)
        .exec(async(err, usuarioDb) => {

            if (err) {
                console.log(hoy + ' Error: ' + err.message);
                return res.json({
                    ok: false,
                    message: 'Error en el login. ' + err.message,
                    usuario: null,
                    token: null
                });
            }

            if (!usuarioDb) {
                console.log(hoy + ' No se encontro el usuario');
                return res.json({
                    ok: false,
                    message: 'Nombre de usuario o clave incorrecta',
                    usuario: null,
                    token: null
                });
            }


            if (!bcrypt.compareSync(parametros.clave, usuarioDb.clave)) {
                console.log(hoy + ' La clave no coincide');
                return res.json({
                    ok: false,
                    message: 'Nombre de usuario o clave incorrecta',
                    usuario: null,
                    token: null
                });
            }

            // console.log(process.env.CADUCIDAD_TOKEN);

            let token = jwt.sign({
                usuario: usuarioDb
            }, process.env.SEED, { expiresIn: 2592000 }); //process.env.CADUCIDAD_TOKEN });


            const idUsuarioDb = usuarioDb._id;
            res.json({
                ok: true,
                message: 'Usuario correcto',
                usuario: usuarioDb,
                token
            });


        })


});


app.post('/usuario/buscar_login/', async function(req, res) {
    let hoy = new Date();
    Login.find({ usuario: req.body.idUsuario })
        .exec((err, login) => {
            if (err) {
                console.log(hoy + ' La funcion de busqueda de login devolvio un error: ' + err.message);
                return res.json({
                    error: 1,
                    message: 'Error en la busqueda de sesion',
                    login: null
                });

            }

            if (login.length == 0) {
                console.log(hoy + ' Es el primer login del usuario');
                return res.json({
                    error: 2,
                    message: 'Primer login',
                    login: null
                });
            }

            res.json({
                error: 0,
                message: 'Devolviendo login',
                //login: login[0]._id
                login: login[0]
            });
        });
});



// app.post('/usuario/nuevo/', async function(req, res) {
//     let objeto = req.body;
//     let avanzar = true;
//     let contactoGuardado = true;
//     var contactos = [];
//     let usuario = await aut.validarToken(req.body.token);
//     if (!usuario) {
//         return res.status(401).json({
//             ok: false,
//             message: 'Usuario no valido'
//         });
//     } else {
//         usuario.url = '/usuario/nuevo/';
//         let acceso = await aut.verifica_Permiso(usuario);

//         if (!acceso) {
//             return res.status(403).json({
//                 ok: false,
//                 message: 'Acceso denegado'
//             });
//         } else {
//             // console.log("Id de persona: " + req.body.persona._id);
//             if (req.body.persona._id == '0') {
//                 //genero el modelo de domicilio
//                 // console.log("Genero el domicilio");
//                 let domicilio = new Domicilio({
//                     pais: req.body.domicilio.pais,
//                     provincia: req.body.domicilio.provincia,
//                     localidad: req.body.domicilio.localidad,
//                     barrio: req.body.domicilio.barrio,
//                     calle: req.body.domicilio.calle,
//                     numeroCasa: req.body.domicilio.numeroCasa,
//                     piso: req.body.domicilio.piso,
//                     numeroDepartamento: req.body.domicilio.numeroDepartamento,
//                     latitud: req.body.domicilio.latitud,
//                     longitud: req.body.domicilio.longitud,
//                     estadoCasa: req.body.domicilio.estadoCasa
//                 });
//                 try {
//                     let respDomicilio = await funciones.nuevoDomicilio(domicilio);
//                     // console.log("ya se dio de alta el domicilio, ahora genero la persona");
//                     if (respDomicilio.ok) {
//                         req.body.persona.domicilio = domicilio._id;
//                         //genero el modelo de persona
//                         let persona = new Persona({
//                             tipoDni: req.body.persona.tipoDni,
//                             dni: req.body.persona.dni,
//                             apellidos: req.body.persona.apellidos,
//                             nombres: req.body.persona.nombres,
//                             fechaNacimiento: req.body.fechaNacimiento,
//                             domicilio: domicilio._id
//                         });
//                         try {
//                             let respPersona = await funciones.nuevaPersona(persona);
//                             // console.log("Ya se dio de alta la persona");
//                             if (respPersona.ok)
//                                 req.body.persona._id = persona._id;
//                             else
//                                 avanzar = false;
//                         } catch (e) {
//                             // console.log("Error al generar la persona: " + e);
//                             avanzar = false;
//                         }
//                     }
//                 } catch (e) {
//                     avanzar = false;
//                 }
//             }

//             if (avanzar) {
//                 // console.log("genero los contactos");
//                 for (var i in req.body.contactos) {
//                     // console.log(req.body.contactos[i]);

//                     let contacto = new Contacto({
//                         tipoContacto: req.body.contactos[i].tipoContacto,
//                         codigoPais: req.body.contactos[i].codigoPais,
//                         codigoArea: req.body.contactos[i].codigoArea,
//                         numeroCelular: req.body.contactos[i].numeroCelular,
//                         numeroFijo: req.body.contactos[i].numeroFijo,
//                         email: req.body.contactos[i].email
//                     });
//                     try {
//                         // console.log("Doy de alta los contactos");
//                         let respuesta = await funciones.nuevoContacto(contacto);
//                         if (respuesta.ok) {
//                             contactos.push(contacto._id);
//                         }

//                         // console.log('array de contactos antes de asignarselo al cliente: ' + contactos);
//                     } catch (e) {
//                         // console.log('Error al guardar el contacto: ' + contacto);
//                         // console.log('Error de guardado: ' + e);
//                         contactoGuardado = false;
//                     }
//                 }

//                 if (contactoGuardado) {

//                     //por ultimo, doy de alta al usuario
//                     // console.log(contactos);
//                     // console.log("Ahora genero el usuario");
//                     let usuario = new Usuario({
//                         persona: objeto.persona._id,
//                         nombreUsuario: objeto.usuario.nombreUsuario,
//                         clave: bcrypt.hashSync(objeto.usuario.clave, 10),
//                         rol: objeto.usuario.rol
//                     });
//                     // console.log('estos son los id de contacto que le voy cargar al cliente: ' + contactos);
//                     for (var i in contactos) {
//                         // console.log('el cliente tiene este contacto: ' + contactos[i]);
//                         usuario.contactos.push(contactos[i]);
//                     }
//                     // console.log("Doy de alta al usuario");
//                     usuario.save((err, usuarioDB) => {
//                         if (err) {
//                             return res.status(400).json({
//                                 ok: false,
//                                 err
//                             });
//                         }


//                         res.json({
//                             ok: true,
//                             usuarioDB
//                         });
//                     });
//                 }

//             } else
//                 res.json({
//                     ok: false,
//                     message: 'No se pudo generar el registro'
//                 });

//         }
//     }
// })

//Este metodo es el que se ejecuta cuando se esta dando de alta el comercio o el proveedor
//a diferencia del anterior, este no realiza validaciones de permisos de acceso
app.post('/usuario/nuevo_usuario_arranque/', async function(req, res) {
    let objeto = req.body;
    let avanzar = true;
    let contactoGuardado = true;
    var contactos = [];
    var idPersona;


    // console.log("Id de persona: " + req.body.persona._id);
    if (req.body.idPersona == '0') {

        try {
            let persona = new Persona({
                tipoDni: req.body.tipoDni,
                dni: req.body.dni,
                apellidos: req.body.apellidos,
                nombres: req.body.nombres
            });

            let respPersona = await funciones.nuevaPersona(persona);
            // console.log("Ya se dio de alta la persona");
            console.log('La funcion para dar de alta una persona devolvio. Ok: ' + respPersona.ok);
            console.log('La funcion para dar de alta una persona devolvio id de persona ' + respPersona.PersonaDB);
            if (respPersona.ok) {
                idPersona = respPersona.PersonaDB;
                console.log('Ya se asigno el id de persona');
            } else
                avanzar = false;


        } catch (e) {
            // console.log('Error al generar la persona ' + e.message);
            avanzar = false;
        }
    }

    if (avanzar) {
        if (req.body.contactos) {
            console.log("genero los contactos");
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
                    console.log("Doy de alta los contactos");
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
            //
        }

        if (contactoGuardado) {

            //por ultimo, doy de alta al usuario
            // console.log(contactos);
            console.log("Ahora genero el usuario");
            let usuario = new Usuario({
                _id: req.body._id,
                persona: idPersona,
                nombreUsuario: objeto.nombreUsuario,
                clave: bcrypt.hashSync(objeto.clave, 10),
                rol: objeto.rol
            });
            console.log('estos son los id de contacto que le voy cargar al cliente: ' + contactos);
            if (req.body.contactos) {
                for (var i in contactos) {
                    console.log('el cliente tiene este contacto: ' + contactos[i]);
                    usuario.contactos.push(contactos[i]);
                }
            }
            console.log("Doy de alta al usuario");
            usuario.save((err, usuarioDB) => {
                if (err) {
                    console.log('El alta de usuario genero un error.');
                    console.log(err.message);
                    return res.status(400).json({
                        ok: false,
                        err
                    });
                }


                res.json({
                    ok: true,
                    usuarioDB
                });
            });
        }

    } else
        res.json({
            ok: false,
            message: 'No se pudo generar el registro'
        });
})


// //actualizacion de usuarios
// app.post('/usuario/cambiar_clave/', async function(req, res) {


//     // let usuario = req.usuario;
//     let usuario = await aut.validarToken(req.body.token);

//     if (!usuario) {
//         return res.status(401).json({
//             ok: false,
//             message: 'Usuario no valido'
//         });
//     } else {
//         let id = usuario._id;
//         let body = _.pick(req.body, ['viejaClave', 'clave']);
//         if (bcrypt.compareSync(body.viejaClave, usuario.clave)) {
//             //aqui hago el cambio de clave
//             body.clave = bcrypt.hashSync(body.clave, 10);
//             Usuario.findByIdAndUpdate(id, body, { new: true }, (err, PersonaDB) => {

//                 if (err) {
//                     return res.status(400).json({
//                         ok: false,
//                         message: 'No se pudo realizar la actualizacion'
//                     });
//                 }
//                 res.json({
//                     ok: true,
//                     message: 'La clave se actualizo correctamente'
//                 });
//             })
//         } else {
//             return res.status(400).json({
//                 ok: false,
//                 err: {
//                     message: 'No se puede cambiar la clave, permiso denegado'
//                 }
//             });
//         }
//     }
// });

// app.post('/usuario/blanquear_claves/', async function(req, res) {

//     let terminado = true;
//     let usuario = await aut.validarToken(req.body.token);

//     if (!usuario) {
//         return res.status(401).json({
//             ok: false,
//             message: 'Usuario no valido'
//         });
//     } else {
//         usuario.url = '/usuario/blanquear_claves';
//         let acceso = await aut.verifica_Permiso(usuario);
//         // console.log('Resultado de la comprobacion de acceso: ' + acceso);
//         if (!acceso) {
//             return res.status(403).json({
//                 ok: false,
//                 message: 'Acceso denegado'
//             });
//         } else {
//             for (var i in req.body.usuarios) {
//                 let body = {
//                     '_id': "",
//                     'clave': ""
//                 };
//                 body._id = req.body.usuarios[i]._id;
//                 body.clave = bcrypt.hashSync(req.body.usuarios[i].clave, 10);

//                 // body.clave = 
//                 Usuario.findByIdAndUpdate(body._id, body, { new: true }, (err, PersonaDB) => {

//                     if (err) {

//                         return res.status(400).json({
//                             ok: false,
//                             message: 'No se pudo realizar la actualizacion'
//                         });
//                     }
//                     res.json({
//                         ok: true,
//                         message: 'La clave se actualizo correctamente'
//                     });
//                 });
//             }
//         }
//     }
// });


app.post('/conf/blanquear_claves/', async function(req, res) {

    for (var i in req.body.usuarios) {
        let body = {
            '_id': "",
            'clave': ""
        };
        body._id = req.body.usuarios[i]._id;
        body.clave = bcrypt.hashSync(req.body.usuarios[i].clave, 10);

        // body.clave = 
        Usuario.findByIdAndUpdate(body._id, body, { new: true }, (err, PersonaDB) => {

            if (err) {

                return res.status(400).json({
                    ok: false,
                    message: 'No se pudo realizar la actualizacion'
                });
            }
            res.json({
                ok: true,
                message: 'La clave se actualizo correctamente'
            });
        });
    }
});



// app.put('/usuario', function(req, res) {
//     res.json('Modifica los datos de un usuario')
// })

// app.post('/usuario/deshabilitar/', async function(req, res) {
//     let id = req.body.idUsuario;
//     var fecha = new Date();

//     let usuario = await aut.validarToken(req.body.token);

//     if (!usuario) {
//         return res.status(401).json({
//             ok: false,
//             message: 'Usuario no valido'
//         });
//     } else {
//         usuario.url = '/usuario/deshabilitar/';
//         let acceso = await aut.verifica_Permiso(usuario);
//         // console.log('Resultado de la comprobacion de acceso: ' + acceso);
//         if (!acceso) {
//             return res.status(403).json({
//                 ok: false,
//                 message: 'Acceso denegado'
//             });
//         } else {
//             let cambiaEstado = {
//                 estado: false,
//                 nombreUsuario: fecha.toString()
//             };

//             Usuario.findByIdAndUpdate(id, cambiaEstado, { new: true }, (err, usuarioBorrado) => {

//                 if (err) {
//                     return res.status(400).json({
//                         ok: false,
//                         err
//                     });
//                 };

//                 if (!usuarioBorrado) {
//                     return res.status(400).json({
//                         ok: false,
//                         err: {
//                             message: 'Usuario no encontrado'
//                         }
//                     });
//                 }

//                 res.json({
//                     ok: true,
//                     message: 'El usuario fue deshabilitado'
//                 });

//             });
//         }
//     }
// });

// app.post('/usuario/salir/', async function(req, res) {

//     let usuario = await aut.validarToken(req.body.token);

//     if (!usuario) {
//         return res.status(401).json({
//             ok: false,
//             message: 'Usuario no valido'
//         });
//     } else {
//         //tengo que modificar la fecha y hora de cierre de la sesion y actualizar el login a offline
//         //actualizando la fecha y hora de cierre
//         let log = await funciones.buscarLoginUsuario(usuario._id);
//         Login.find({ _id: log.login._id })
//             .populate('sesiones')
//             .exec((err, logins) => {
//                 if (err) {
//                     console.log('La busqueda de login para cerrar sesion fallo. Error: ' + err.message);
//                     return res.json({
//                         err: 1,
//                         message: 'La busqueda de login para cerrar sesion fallo'
//                     });
//                 }
//                 if (logins.length == 0) {
//                     console.log('La busque de login para cerrar sesion no encontro resultados');
//                     return res.json({
//                         err: 2,
//                         message: 'La busqueda de login para cerrar sesion no encontro resultados'
//                     });
//                 }

//                 //modifico la fecha de cierre de sesion y el estado de la sesion
//                 let i = 0;
//                 let hasta = logins[0].sesiones.length;
//                 let fecha = new Date();
//                 while (i < hasta) {
//                     if (logins[0].sesiones[i].activa) {
//                         Sesion.findOneAndUpdate({ '_id': logins[0].sesiones[i]._id }, { $set: { activa: false, fechaFin: fecha } }, function(err, sesion_) {
//                             if (err) {
//                                 console.log('La busqueda para cierre de sesion fallo: ' + err.message);
//                             } else {
//                                 if (sesion_ == null) {
//                                     console.log('La busqueda de sesion para el cierre no arrojo resultados');
//                                 } else {
//                                     console.log('Sesion cerrada y actualizada');
//                                     // console.log(sesion[0]);
//                                 }
//                             }
//                         });
//                         console.log('La sesion se cerro');
//                         break;
//                     }
//                     i++;
//                 }

//                 //ahora cambio el estado de login a offline
//                 Login.findOneAndUpdate({ '_id': logins[0]._id }, { $set: { online: false } }, function(err, login_) {
//                     if (err) {
//                         console.log('La busqueda de login para cierre de sesion fallo: ' + err.message);
//                     } else {
//                         if (login_ == null) {
//                             console.log('La busqueda de login para el cierre no arrojo resultados');
//                         } else {
//                             console.log('Login terminado y actualizado');
//                             // console.log(sesion[0]);
//                         }
//                     }
//                 });

//                 res.json({
//                     error: 0,
//                     message: 'Sesion terminada'
//                 });
//             });


//     }

// });

module.exports = app;