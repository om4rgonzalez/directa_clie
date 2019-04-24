const express = require('express');
const app = express();

const Entidad = require('../models/entidad');
const funciones = require('../../middlewares/funciones');
const Comercio = require('../models/comercio');
const Proveedor = require('../models/proveedor');
const Usuario = require('../../server_usuario/models/usuario');
const Persona = require('../../server_persona/models/persona');
const HorarioAtencion = require('../models/horarioAtencion');
const Contacto = require('../../server_contacto/models/contacto');
const Login = require('../../server_usuario/models/login');
const Sesion = require('../../server_usuario/models/sesion');
const Domicilio = require('../../server_direccion/models/domicilio');


app.post('/comercio/nuevo/', async function(req, res) {
    // console.log('Comienzo dando de alta el domicilio')
    //tengo que generar la entidad y el domicilio. Pasarle esa info al metodo de funciones
    //y generar los id en ese momento (solo el _id de entidad se genera aqui)
    var usuarios = [];
    if (req.body.domicilio) {
        let domicilio = {
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
        };
    }


    let entidad = Entidad({
        cuit: req.body.entidad.cuit,
        razonSocial: req.body.entidad.razonSocial,
        actividadPrincipal: req.body.entidad.actividadPrincipal,
        tipoPersoneria: req.body.entidad.tipoPersoneria
    });

    // console.log('Entidad antes de ser enviada a la funcion');

    // console.log(entidad);
    try {
        let respuestaEntidad = await funciones.nuevaEntidad(entidad);
        console.log('El alta de entidad devolvio Ok: ' + respuestaEntidad.ok);
        console.log('El alta de entidad devolvio el id de entidad ' + respuestaEntidad._id);
        if (respuestaEntidad.ok) {
            let comercio = new Comercio({
                entidad: respuestaEntidad._id
            });
            if (req.body.contactos) {
                // console.log('Hay contactos para guardar');
                let contactos = [];
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
                        // console.log('Contacto a guardar');
                        // console.log(contacto);
                        let respuesta = await funciones.nuevoContacto(contacto);
                        // console.log('Respuesta de la funcion guardar contacto: ' + respuesta.ok);
                        if (respuesta.ok) {
                            contactos.push(contacto._id);
                        }

                        // console.log('array de contactos antes de asignarselo al cliente: ' + contactos);
                    } catch (e) {
                        // console.log('Error al guardar el contacto: ' + contacto);
                        // console.log('Error de guardado: ' + e);
                        contactoGuardado = false;
                    }
                }
                comercio.contactos = contactos;
            }

            if (req.body.usuarios) {
                // console.log('usuarios');
                for (var i in req.body.usuarios) {
                    // console.log(req.body.usuarios[i]);
                    let persona = new Persona({
                        tipoDni: req.body.usuarios[i].persona.tipoDni,
                        dni: req.body.usuarios[i].persona.dni,
                        apellidos: req.body.usuarios[i].persona.apellidos,
                        nombres: req.body.usuarios[i].persona.nombres
                    });
                    let usuario = new Usuario({
                        persona: persona,
                        nombreUsuario: req.body.usuarios[i].nombreUsuario,
                        clave: req.body.usuarios[i].clave,
                        rol: req.body.usuarios[i].rol
                    });
                    let respuestaUsuario = await funciones.nuevoUsuario(usuario);
                    if (respuestaUsuario.ok) {
                        // console.log('Usuario creado');
                        usuarios.push(usuario._id);
                    } else
                        avanzar = false;
                }
            }
            if (req.body.usuarios)
                comercio.usuarios = usuarios;

            comercio.save((err, comercioDB) => {
                if (err) {
                    console.log('El alta de comercio produjo un error. Error: ' + err.message);
                    return res.json({
                        ok: false,
                        message: 'El alta de comercio produjo un error'
                    });
                }


                res.json({
                    ok: true,
                    message: 'Alta completa'
                });
            });
        } else {
            return res.json({
                ok: false,
                message: 'Fallo el alta de entidad para generar un comercio'
            });
        }
    } catch (e) {
        return res.json({
            ok: false,
            message: 'Fallo la ejecucion de una funcion: ' + e.message
        });
    }

});

app.post('/comercio/nuevo_v_nativo/', async function(req, res) {
    // console.log('Comienzo dando de alta el domicilio')
    //tengo que generar la entidad y el domicilio. Pasarle esa info al metodo de funciones
    //y generar los id en ese momento (solo el _id de entidad se genera aqui)
    var usuarios = [];
    let domicilio = {
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
    };

    let entidad = Entidad({
        cuit: req.body.entidad.cuit,
        razonSocial: req.body.entidad.razonSocial,
        actividadPrincipal: req.body.entidad.actividadPrincipal,
        tipoPersoneria: req.body.entidad.tipoPersoneria
    });

    // console.log('Entidad antes de ser enviada a la funcion');

    // console.log(entidad);
    try {
        let respuestaEntidad = await funciones.nuevaEntidad(entidad, domicilio);
        // console.log('Entidad creada');
        if (respuestaEntidad.ok) {
            let comercio = new Comercio({
                entidad: entidad._id
            });
            if (req.body.contactos) {
                // console.log('Hay contactos para guardar');
                let contactos = [];
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
                        // console.log('Contacto a guardar');
                        // console.log(contacto);
                        let respuesta = await funciones.nuevoContacto(contacto);
                        // console.log('Respuesta de la funcion guardar contacto: ' + respuesta.ok);
                        if (respuesta.ok) {
                            contactos.push(contacto._id);
                        }

                        // console.log('array de contactos antes de asignarselo al cliente: ' + contactos);
                    } catch (e) {
                        // console.log('Error al guardar el contacto: ' + contacto);
                        // console.log('Error de guardado: ' + e);
                        contactoGuardado = false;
                    }
                }
                comercio.contactos = contactos;
            }

            if (req.body.usuarios) {
                let persona = new Persona({
                    tipoDni: req.body.usuarios.persona.tipoDni,
                    dni: req.body.usuarios.persona.dni,
                    apellidos: req.body.usuarios.persona.apellidos,
                    nombres: req.body.usuarios.persona.nombres
                });
                let usuario = new Usuario({
                    persona: persona,
                    nombreUsuario: req.body.usuarios.nombreUsuario,
                    clave: req.body.usuarios.clave,
                    rol: req.body.usuarios.rol
                });
                let respuestaUsuario = await funciones.nuevoUsuario(usuario);
                if (respuestaUsuario.ok) {
                    // console.log('Usuario creado');
                    usuarios.push(usuario._id);
                } else
                    avanzar = false;
                // // console.log('usuarios');
                // for (var i in req.body.usuarios) {
                //     // console.log(req.body.usuarios[i]);

                // }
            }
            if (req.body.usuarios)
                comercio.usuarios = usuarios;

            comercio.save((err, comercioDB) => {
                if (err) {
                    console.log('El alta de comercio produjo un error. Error: ' + err.message);
                    return res.json({
                        ok: false,
                        message: 'El alta de comercio produjo un error'
                    });
                }


                res.json({
                    ok: true,
                    message: 'Alta completa'
                });
            });
        } else {
            return res.json({
                ok: false,
                message: 'Fallo el alta de entidad para generar un comercio'
            });
        }
    } catch (e) {
        return res.json({
            ok: false,
            message: 'Fallo la ejecucion de una funcion: ' + e.message
        });
    }

});



app.post('/comercio/ingresar/', async function(req, res) {
    // console.log('Parametros recibidos en el login comercio');
    // console.log(req.body);

    let usuario_ = new Object({
        nombreUsuario: req.body.nombreUsuario,
        clave: req.body.clave,
        idPush: req.body.idPush
    });
    let resp = await funciones.login(usuario_);

    // console.log(resp);

    if (resp.ok) {
        // console.log(resp);
        let usuario = new Object({
            _id: resp._id,
            token: resp.token
        });

        // console.log(usuario);

        Comercio.find({})
            // .populate('entidad')
            .populate({ path: 'entidad', populate: { path: 'domicilio' } })
            // .populate('proveedores', 'entidad tiposEntrega')
            .populate({ path: 'proveedores', select: 'entidad tiposEntrega', populate: { path: 'entidad', populate: { path: 'domicilio' } } })
            .where('usuarios').in(usuario._id)
            .exec(async(err, comercioDB) => {

                if (err) {
                    console.log('Error al realizar la consulta. Error: ' + err.message);
                    return res.json({
                        ok: false,
                        message: 'Error al realizar la consulta. Error: ' + err.message,
                        comercioDB: null,
                        usuario: null
                    });
                }

                if (comercioDB.length == 0) {
                    console.log('El usuario no pertenece a un comercio')
                    return res.json({
                        ok: false,
                        message: 'Usuario o clave incorrecta',
                        comercioDB: null,
                        usuario: null
                    });
                }

                //busco el login del usuario
                let ok = true;
                let sesion = new Sesion({});

                let log = await funciones.buscarLoginUsuario(usuario._id);
                // console.log('La funcion de busqueda de sesion devolvio');
                // console.log(log);
                switch (log.error) {
                    case 0: //ya hizo login antes
                        console.log('Ya hizo un login previamente');
                        // console.log('Id login: ' + log.login);
                        // console.log('Id push: ' + parametros.idPush);
                        // console.log('Id de sesion: ' + sesion._id);
                        sesion.save((err, nuevoSesion) => {
                            if (err) {
                                console.log('Se produjo un error al guardar la sesion: ' + err.message);
                            } else {
                                console.log('Agregando la sesion: ' + nuevoSesion._id);
                                Login.findOneAndUpdate({ '_id': log.login._id, online: false }, {
                                        $set: {
                                            idPush: req.body.idPush,
                                            online: true
                                        },
                                        $push: {
                                            sesiones: nuevoSesion._id
                                        }
                                    },
                                    function(err_, logins) {
                                        if (err_) {
                                            console.log('Error en la actualizacion de login: ' + err_.message);
                                        } else {
                                            if (logins == null) {
                                                console.log('La sesion esta abierta');
                                            } else {
                                                console.log('Login encontrado');

                                                // logins.sesiones.push(sesion._id);
                                                // console.log(logins);
                                            }
                                        }
                                    });
                            }
                        });

                        break;
                    case 1: // error de busqueda
                        ok: false;

                        break;
                    case 2: // primer login
                        console.log('Primer login');

                        // console.log(sesion);
                        sesion.save();
                        let login = new Login({
                            usuario: usuario._id,
                            idPush: req.body.idPush,
                            nombreUsuario: req.body.nombreUsuario,
                            entidad: comercioDB[0].entidad.razonSocial,
                            esProveedor: false
                        });
                        // console.log(login);
                        login.sesiones.push(sesion._id);
                        login.save();

                        break;
                }


                return res.json({
                    ok: true,
                    message: 'login correcto',
                    comercioDB,
                    usuario
                });

            });
    } else {
        return res.json({
            ok: false,
            message: 'Usuario o clave incorrecta',
            comercioDB: null,
            usuario: null
        });

    }
});

app.post('/comercio/login/', async function(req, res) {
    let hoy = new Date();
    console.log(hoy + ' Parametros recibidos en el login comercio');
    console.log(hoy + ' Usuario: ' + req.body.nombreUsuario);
    console.log(hoy + ' Clave: ' + req.body.nombreUsuario);

    let usuario_ = new Object({
        nombreUsuario: req.body.nombreUsuario,
        clave: req.body.clave,
        idPush: req.body.idPush
    });
    let resp = await funciones.login(usuario_);

    // console.log(resp);

    if (resp.ok) {
        // console.log(resp);
        let usuario = new Object({
            _id: resp._id,
            token: resp.token
        });

        // console.log(usuario);
        let entidad_ = new Object({
            idEntidad: '0',
            cuit: '0',
            razonSocial: '-',
            actividadPrincipal: '-'
        });

        let primerLogin = false;

        Comercio.find({})
            // .populate('entidad')
            .populate({ path: 'entidad', populate: { path: 'domicilio' } })
            // .populate('proveedores', 'entidad tiposEntrega')
            .populate({ path: 'proveedores', select: 'entidad tiposEntrega', populate: { path: 'entidad', populate: { path: 'domicilio' } } })
            .where('usuarios').in(usuario._id)
            .exec(async(err, comercioDB) => {

                if (err) {
                    console.log(hoy + ' Error al realizar la consulta. Error: ' + err.message);
                    return res.json({
                        ok: false,
                        message: 'Error al realizar la consulta. Error: ' + err.message,
                        esProveedor: false,
                        entidad: null,
                        usuario: null,
                        tiposEntrega: null,
                        primerLogin: primerLogin,
                        cargoConfiguracion: false,
                        logo: null
                    });
                }

                if (comercioDB.length == 0) {
                    console.log(hoy + ' El usuario no pertenece a un comercio. Debo buscar si pertenece a un proveedor');

                    ////////////////////////////////////////

                    Proveedor.find({}, 'tiposEntrega entidad _id logo')
                        .populate('entidad')
                        .where('usuarios').in(usuario._id)
                        .exec(async(errP, proveedorDB) => {

                            if (err) {
                                console.log(hoy + ' Error al realizar la consulta. Error: ' + errP.message);
                                return res.json({
                                    ok: false,
                                    message: 'Error al realizar la consulta. Error: ' + errP.message,
                                    esProveedor: false,
                                    entidad: null,
                                    usuario: null,
                                    tiposEntrega: null,
                                    primerLogin: primerLogin,
                                    cargoConfiguracion: false,
                                    logo: null
                                });
                            }

                            if (proveedorDB.length == 0) {
                                console.log(hoy + ' El usuario no pertenece a un proveedor')
                                return res.json({
                                    ok: false,
                                    message: 'El usuario no pertenece a un proveedor',
                                    esProveedor: false,
                                    entidad: null,
                                    usuario: null,
                                    tiposEntrega: null,
                                    primerLogin: primerLogin,
                                    cargoConfiguracion: false,
                                    logo: null
                                });
                            }
                            // console.log('Los proveedores que se encontraron con ese usuario son:');
                            // console.log(proveedorDB);

                            //busco el login del usuario
                            let ok = true;
                            let sesion = new Sesion({});
                            sesion.sistemaOperativo = req.body.sistemaOperativo;
                            sesion.fabricante = req.body.fabricante;
                            sesion.modelo = req.body.modelo;
                            sesion.versionKernel = req.body.versionKernel;
                            sesion.longitud = req.body.longitud;
                            sesion.latitud = req.body.latitud;
                            // console.log('Id de usuario a buscar: ' + usuario._id);
                            let log = await funciones.buscarLoginUsuario(usuario._id);
                            // console.log('La funcion de busqueda de sesion devolvio');
                            // console.log(log);
                            switch (log.error) {
                                case 0: //ya hizo login antes
                                    console.log(hoy + ' Ya hizo un login previamente');
                                    // console.log('Id login: ' + log.login);
                                    // console.log('Id push: ' + parametros.idPush);
                                    // console.log('Id de sesion: ' + sesion._id);
                                    sesion.save((err, nuevoSesion) => {
                                        if (err) {
                                            console.log(hoy + ' Se produjo un error al guardar la sesion: ' + err.message);
                                        } else {
                                            console.log(hoy + ' Agregando la sesion: ' + nuevoSesion._id);
                                            Login.findOneAndUpdate({ '_id': log.login._id, online: false }, {
                                                    $set: {
                                                        idPush: req.body.idPush,
                                                        online: true
                                                    },
                                                    $push: {
                                                        sesiones: nuevoSesion._id
                                                    }
                                                },
                                                function(err_, logins) {
                                                    if (err_) {
                                                        console.log(hoy + ' Error en la actualizacion de login: ' + err_.message);
                                                    } else {
                                                        if (logins == null) {
                                                            console.log(hoy + ' La sesion esta abierta');
                                                        } else {
                                                            console.log(hoy + ' Login encontrado');

                                                            // logins.sesiones.push(sesion._id);
                                                            // console.log(logins);
                                                        }
                                                    }
                                                });
                                        }
                                    });

                                    break;
                                case 1: // error de busqueda
                                    ok: false;

                                    break;
                                case 2: // primer login
                                    console.log(hoy + ' Primer login');
                                    primerLogin = true;
                                    // console.log(sesion);
                                    sesion.save();
                                    let login = new Login({
                                        usuario: usuario._id,
                                        idPush: req.body.idPush,
                                        nombreUsuario: req.body.nombreUsuario,
                                        entidad: proveedorDB[0].entidad.razonSocial,
                                        esProveedor: true
                                    });
                                    // console.log(login);
                                    login.sesiones.push(sesion._id);
                                    login.save();

                                    break;
                            }

                            entidad_.idEntidad = proveedorDB[0]._id;
                            entidad_.cuit = proveedorDB[0].entidad.cuit;
                            entidad_.razonSocial = proveedorDB[0].entidad.razonSocial;
                            entidad_.actividadPrincipal = proveedorDB[0].entidad.actividadPrincipal;

                            return res.json({
                                ok: true,
                                message: 'login correcto',
                                esProveedor: true,
                                entidad: entidad_,
                                usuario,
                                tiposEntrega: proveedorDB[0].tiposEntrega,
                                primerLogin: primerLogin,
                                cargoConfiguracion: true,
                                logo: proveedorDB[0].logo
                            });

                        });
                } else {
                    // console.log(comercioDB);
                    // console.log('El usuario es de un comercio');
                    // console.log('Comercio a analizar: ' + comercioDB[0]._id);
                    entidad_.idEntidad = comercioDB[0]._id;
                    entidad_.cuit = comercioDB[0].entidad.cuit;
                    entidad_.razonSocial = comercioDB[0].entidad.razonSocial;
                    entidad_.actividadPrincipal = comercioDB[0].entidad.actividadPrincipal;


                    //busco el login del usuario
                    let ok = true;
                    let sesion = new Sesion({});

                    let log = await funciones.buscarLoginUsuario(usuario._id);
                    // console.log('La funcion de busqueda de sesion devolvio');
                    // console.log(log);
                    switch (log.error) {
                        case 0: //ya hizo login antes
                            console.log(hoy + ' Ya hizo un login previamente. Debo agregar una nueva sesion.');
                            // console.log('Id login: ' + log.login);
                            // console.log('Id push: ' + parametros.idPush);
                            // console.log('Id de sesion: ' + sesion._id);
                            sesion.sistemaOperativo = req.body.sistemaOperativo;
                            sesion.fabricante = req.body.fabricante;
                            sesion.modelo = req.body.modelo;
                            sesion.versionKernel = req.body.versionKernel;
                            sesion.longitud = req.body.longitud;
                            sesion.latitud = req.body.latitud;

                            sesion.save(async(err, nuevoSesion) => {
                                if (err) {
                                    console.log(hoy + ' Se produjo un error al guardar la sesion: ' + err.message);
                                } else {
                                    console.log(hoy + ' Agregando la sesion: ' + nuevoSesion._id);
                                    Login.findOneAndUpdate({ '_id': log.login._id, online: false }, {
                                            $set: {
                                                idPush: req.body.idPush,
                                                online: true
                                            },
                                            $push: {
                                                sesiones: nuevoSesion._id
                                            }
                                        },
                                        function(err_, logins) {
                                            if (err_) {
                                                console.log(hoy + ' Error en la actualizacion de login: ' + err_.message);
                                            } else {
                                                if (logins == null) {
                                                    console.log(hoy + ' La sesion esta abierta');
                                                } else {
                                                    console.log(hoy + ' Login encontrado');

                                                    // logins.sesiones.push(sesion._id);
                                                    // console.log(logins);
                                                }
                                            }
                                        });
                                }
                            });

                            break;
                        case 1: // error de busqueda
                            ok: false;

                            break;
                        case 2: // primer login
                            console.log(hoy + ' Primer login');
                            primerLogin = true;
                            // console.log(sesion);
                            sesion.save();
                            let login = new Login({
                                usuario: usuario._id,
                                idPush: req.body.idPush,
                                nombreUsuario: req.body.nombreUsuario,
                                entidad: comercioDB[0].entidad.razonSocial,
                                esProveedor: false
                            });
                            // console.log(login);
                            login.sesiones.push(sesion._id);
                            login.save();

                            break;
                    }


                    return res.json({
                        ok: true,
                        message: 'login correcto',
                        esProveedor: false,
                        entidad: entidad_,
                        usuario,
                        tiposEntrega: null,
                        primerLogin: primerLogin,
                        cargoConfiguracion: comercioDB[0].cargoConfiguracion,
                        logo: null
                    });
                }
            });
    } else {
        return res.json({
            ok: false,
            message: 'Usuario o clave incorrecta',
            esProveedor: false,
            entidad: null,
            usuario: null,
            tiposEntrega: null,
            primerLogin: primerLogin,
            cargoConfiguracion: false,
            logo: null
        });

    }
});

//la funcion busca el proveedor en la red del comercio
app.post('/comercio/buscar_proveedor/', async function(req, res) {
    let hoy = new Date();
    console.log(hoy + ' Analizando si el proveedor ya pertenece a la red del comercio')
        // console.log('Comercio a analizar: ' + req.body.comercio);
        // console.log('Proveedor a buscar: ' + req.body.proveedor);
    Comercio.find({ '_id': req.body.comercio })
        // .where('proveedores').in(req.body.proveedor)
        .exec((err, comerciosDB) => {
            if (err) {
                return res.json({
                    ok: false,
                    message: 'La busqueda arrojo un error: Error: ' + err.message
                });
            }

            if (!comerciosDB) {
                return res.json({
                    ok: false,
                    message: 'El comercio no tiene al proveedor en su red'
                });
            }

            if (comerciosDB.length == 0) {
                return res.json({
                    ok: false,
                    message: 'La busqueda no encontro ningun comercio con el id ' + req.body.comercio
                });
            }


            for (var i in comerciosDB[0].proveedores) {
                // console.log('Proveedor a analizar: ' + comerciosDB[0].proveedores[i]);
                // console.log('Proveedor buscado: ' + req.body.proveedor);
                if (comerciosDB[0].proveedores[i] == req.body.proveedor.trim()) {
                    // console.log('Proveedor encontrado');
                    return res.json({
                        ok: true,
                        message: 'El proveedor forma parte de la red del comercio'
                    });
                }
            }
            // console.log('proveedores:');
            // console.log(comerciosDB);
            // // console.log('_id comercio: ' + comerciosDB[0]._id);
            // // console.log(comerciosDB[0].proveedores)

            res.json({
                ok: false,
                message: 'El comercio no tiene al proveedor en su red'
            });

        });
});


app.post('/comercio/existe/', async function(req, res) {
    let hoy = new Date();
    console.log(hoy + ' Analizando si el comercio esta en la base de datos');
    Comercio.find({ '_id': req.body.comercio })
        // .where('proveedores').in(req.body.proveedor)
        .exec((err, comerciosDB) => {
            if (err) {
                return res.json({
                    ok: false,
                    message: 'La busqueda arrojo un error: Error: ' + err.message
                });
            }

            if (!comerciosDB) {
                return res.json({
                    ok: false,
                    message: 'El comercio no tiene al proveedor en su red'
                });
            }

            if (comerciosDB.length == 0) {
                return res.json({
                    ok: false,
                    message: 'La busqueda no encontro ningun comercio con el id ' + req.body.comercio
                });
            }

            return res.json({
                ok: true,
                message: 'El comercio esta cargado'
            });

        });
});




app.post('/comercio/buscar_por_nombre/', async function(req, res) {

    var x = req.body.nombreComercio.trim().split(" ");
    var regex = x.join("|");
    var entidades = [];



    Entidad.find({ "razonSocial": { "$regex": regex, "$options": "i" } },
        function(err, docs) {
            if (err) {
                return res.json({
                    ok: false,
                    message: 'La busqueda produjo un error. Err: ' + err.message
                });
            }
            if (docs.length == 0) {
                return res.json({
                    ok: false,
                    message: 'No hay un comercio con ese nombre'
                });
            }
            let hasta = docs.length;
            let i = 0;
            while (i < hasta) {
                entidades.push(docs[i]._id);
                i++;
            }
            Comercio.find({ entidad: { $in: entidades } })
                .populate('contactos')
                .populate({ path: 'entidad', populate: { path: 'domicilio' } })
                .exec((err2, comercios) => {
                    if (err2) {
                        return res.json({
                            ok: false,
                            message: 'La busqueda de comercio provoco un error: ' + err2.message
                        });
                    }
                    if (comercios.length == 0) {
                        return res.json({
                            ok: false,
                            message: 'No se encontraron coincidencias'
                        });
                    }
                    res.json({
                        ok: true,
                        comercios
                    });
                });
        });
});

app.get('/comercio/obtener_productos/', async function(req, res) {
    Comercio.find({ '_id': req.query.idComercio })
        .populate('productos')
        .exec((err, proveedorDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if (!proveedorDB) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Error en la conexion a la base de datos'
                    }
                });
            }
            // console.log(proveedorDB);
            // console.log(proveedorDB.productos);
            if (!proveedorDB[0].productos)
                return res.json({
                    ok: false,
                    message: 'El proveedor no tiene productos asociados'
                });

            let productos = proveedorDB[0].productos;
            return res.json({
                ok: true,
                productos
            });

        });
});

app.post('/comercio/buscar_comercio/', async function(req, res) {

    Comercio.findOne({ _id: req.body.idComercio })
        .populate({ path: 'entidad', populate: { path: 'domicilio' } })
        .exec(async(err, comercio) => {
            if (err) {
                console.log('La busqueda de un comercio por Id arrojo un error');
                console.log(err.message);
                return res.json({
                    ok: false,
                    message: 'La busqueda de un comercio por Id arrojo un error',
                    comercio: null
                });
            }

            if (comercio == null) {
                console.log('La busqueda de comercio por id no produjo resultados');
                return res.json({
                    ok: false,
                    message: 'La busqueda de comercio por id no produjo resultados',
                    comercio: null
                });
            }

            res.json({
                ok: true,
                message: 'Proveedor encontrado',
                comercio
            });
        });
});


app.post('/comercio/cargar_configuracion/', async function(req, res) {
    let hoy = new Date();
    if (req.body.domicilio) {
        Comercio.findOne({ _id: req.body.idComercio })
            .exec(async(err, comercio) => {
                if (err) {
                    console.log(hoy + ' La busqueda de comercio para cargar la configuracion arrojo un error');
                    console.log(hoy + ' ' + err.message);
                    return res.json({
                        ok: false,
                        message: 'La busqueda de comercio para cargar la configuracion arrojo un error'
                    });
                }

                if (comercio == null) {
                    console.log(hoy + ' La busqueda de comercio para cargar la configuracion no arrojo resultados');
                    return res.json({
                        ok: false,
                        message: 'La busqueda de comercio para cargar la configuracion no arrojo resultados'
                    });
                }

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
                    longitud: req.body.domicilio.longitud,
                    codigoPostal: req.body.domicilio.codigoPostal
                });

                try {
                    domicilio.save();
                    //debo actualizar el domicilio en la entidad
                    Entidad.findOneAndUpdate({ _id: comercio.entidad }, {
                            $set: {
                                domicilio: domicilio._id
                            }
                        },
                        async function(errUpdate, entidad) {
                            if (errUpdate) {
                                console.log(hoy + ' La actualiacion de la carga de configuracion arrojo un error');
                                console.log(hoy + ' ' + errUpdate.message);
                                return res.json({
                                    ok: false,
                                    message: 'La actualiacion de la carga de configuracion arrojo un error'
                                });
                            }

                            Comercio.findOneAndUpdate({ _id: req.body.idComercio }, { $set: { cargoConfiguracion: true } }, async function(errU, ok) {
                                if (errU) {
                                    console.log(hoy + ' La actualizacion del estado de carga de configuracion del comercio arrojo un error');
                                    console.log(hoy + ' ' + errU.message);
                                    return res.json({
                                        ok: false,
                                        message: 'La actualizacion del estado de carga de configuracion del comercio arrojo un error'
                                    });
                                }
                            })

                            res.json({
                                ok: true,
                                message: 'La carga de configuracion termino sin errores'
                            });
                        });
                } catch (e) {
                    console.log('El try de la carga de configuracion produjo un error');
                    console.log(e.message);
                    return res.json({
                        ok: false,
                        message: 'La actualiacion de la carga de configuracion arrojo un error'
                    });
                }


            });
    }
});


app.post('/comercio/obtener_direccion/', async function(req, res) {
    let hoy = new Date();
    Comercio.findOne({ _id: req.body.idComercio })
        .populate({ path: 'entidad', populate: { path: 'domicilio' } })
        .exec(async(err, comercio) => {
            if (err) {
                console.log(hoy + ' La busqueda de comercio para devolver el domicilio provoco un error');
                console.log(hoy + ' ' + err.message);
                return res.json({
                    ok: false,
                    message: 'La busqueda de comercio para devolver el domicilio provoco un error',
                    domicilio: null
                });
            }

            if (comercio == null) {
                console.log(hoy + ' La busqueda de comercio para devolver la direccion no produjo resultados');
                console.log(hoy + ' Id Comercio buscado: ' + req.body.idComercio);
                return res.json({
                    ok: false,
                    message: 'La busqueda de comercio para devolver la direccion no produjo resultados',
                    domicilio: null
                });
            } else {
                return res.json({
                    ok: true,
                    message: 'Devolviendo resultados',
                    domicilio: comercio.entidad.domicilio.provincia + '-' + comercio.entidad.domicilio.localidad + '-' + comercio.entidad.domicilio.barrio
                });
            }
        });

});


module.exports = app;