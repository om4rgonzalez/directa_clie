const express = require('express');
const app = express();

const Entidad = require('../models/entidad');
const funciones = require('../../middlewares/funciones');
const funcionesFecha = require('../../middlewares/funcionesFecha');
const Proveedor = require('../models/proveedor');
const PuntoVenta = require('../models/puntoVenta');
const Usuario = require('../../server_usuario/models/usuario');
const Persona = require('../../server_persona/models/persona');
const Comercio = require('../models/comercio');
const Contacto = require('../../server_contacto/models/contacto');
const Login = require('../../server_usuario/models/login');
const Sesion = require('../../server_usuario/models/sesion');
const ImagenProveedor = require('../models/imagenProveedor');
const VideoProveedor = require('../models/videoProveedor');
const Cobertura = require('../models/cobertura');
const Periodo = require('../models/periodoEntrega');
const fs = require('fs');


app.post('/proveedor/nuevo/', async function(req, res) {
    // console.log('Comienzo dando de alta el domicilio')
    //tengo que generar la entidad y el domicilio. Pasarle esa info al metodo de funciones
    //y generar los id en ese momento (solo el _id de entidad se genera aqui)
    var usuarios = [];
    var contactoGuardado = true;
    let domicilio = {
        pais: req.body.domicilio.pais.toUpperCase(),
        provincia: req.body.domicilio.provincia.toUpperCase(),
        localidad: req.body.domicilio.localidad.toUpperCase(),
        barrio: req.body.domicilio.barrio.toUpperCase(),
        calle: req.body.domicilio.calle.toUpperCase(),
        numeroCasa: req.body.domicilio.numeroCasa,
        piso: req.body.domicilio.piso,
        numeroDepartamento: req.body.domicilio.numeroDepartamento,
        latitud: req.body.domicilio.latitud,
        longitud: req.body.domicilio.longitud,
        codigoPostal: req.body.domicilio.codigoPostal
    };

    let entidad = Entidad({
        cuit: req.body.entidad.cuit,
        razonSocial: req.body.entidad.razonSocial.toUpperCase(),
        actividadPrincipal: req.body.entidad.actividadPrincipal.toUpperCase(),
        tipoPersoneria: req.body.entidad.tipoPersoneria.toUpperCase()
    });

    // console.log('Entidad antes de ser enviada a la funcion');

    // console.log(entidad);
    try {
        let respuestaEntidad = await funciones.nuevaEntidad(entidad, domicilio);
        console.log('Entidad creada');
        console.log('Id de entidad: ' + respuestaEntidad);
        if (respuestaEntidad.ok) {
            //doy de alta al punto de venta
            let puntoVenta = new PuntoVenta({
                nombrePuntoVenta: 'Casa Central',
                domicilio: respuestaEntidad.domicilio
            });
            let respuestaPunto = await funciones.nuevoPuntoVenta(puntoVenta);
            if (respuestaPunto.ok) {
                // console.log('Punto de venta creado');
                let proveedor = new Proveedor({
                    entidad: respuestaEntidad._id
                });

                proveedor.puntosVenta.push(puntoVenta._id);
                if (req.body.tiposEntrega) {
                    for (var i in req.body.tiposEntrega) {
                        proveedor.tiposEntrega.push(req.body.tiposEntrega[i].nombreTipo);
                    }
                    // console.log('tipos de entrega cargados');
                }
                if (req.body.contactos) {
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
                    proveedor.contactos = contactos;
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
                    proveedor.usuarios = usuarios;
                proveedor.save((err, proveedorDb) => {
                    if (err) {
                        return res.status(400).json({
                            ok: false,
                            err
                        });
                    }


                    res.json({
                        ok: true,
                        proveedorDb
                    });
                });
            }
        } else {
            return res.status(412).json({
                ok: false,
                message: 'Fallo la carga del punto de venta'
            });
        }



    } catch (e) {
        return res.status(500).json({
            ok: false,
            message: 'Fallo la ejecucion de una funcion: ' + e.message
        });
    }

});

app.post('/proveedor/agregar_tipos_entrega/', async function(req, res) {
    let avanzar = true;
    Proveedor.find({ id_: req.body.idProveedor })
    exec((err, proveedorDB) => {
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

        for (var i in proveedorDB[0].tiposEntrega) {
            for (var j in req.body.tiposEntrega) {
                if (proveedorDB[0].tiposEntrega[i] == req.body.tiposEntrega[j].item) {
                    avanzar = false;
                }
            }
        }

        if (avanzar) {
            for (var j in req.body.tiposEntrega) {
                Proveedor.findOneAndUpdate({ _id: proveedorDB[0]._id }, { $push: { tiposEntrega: req.body.tiposEntrega[j].item } },
                    function(err, success) {});
            }
        }
    });
});


app.get('/proveedor/obtener_productos/', async function(req, res) {
    Proveedor.find({ '_id': req.query.idProveedor })
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

//En este metodo debo contemplar que el proveedor tenga cobertura en la zona del comercio
app.get('/proveedor/listar_todos/', async function(req, res) {
    console.log('Listando los proveedores');
    Proveedor.find({}, 'tiposEntrega entidad _id')
        .populate({ path: 'entidad', populate: { path: 'domicilio' } })
        .populate('contactos')
        .exec((err, proveedorDB) => {

            if (err) {
                return res.json({
                    ok: false,
                    message: 'Error al realizar la consulta. Error: ' + err.message
                });
            }

            if (!proveedorDB) {
                return res.json({
                    ok: false,
                    err: {
                        message: 'No hay proveedores para mostrar'
                    }
                });
            }

            if (proveedorDB == null) {
                return res.json({
                    ok: false,
                    err: {
                        message: 'No hay proveedores para mostrar'
                    }
                });
            }
            return res.json({
                ok: true,
                proveedorDB
            });

        });
});

app.post('/proveedor/listar_todos_/', async function(req, res) {
    let hoy = new Date();
    Proveedor.find({}, 'tiposEntrega entidad _id')
        .populate({ path: 'entidad', populate: { path: 'domicilio' } })
        .populate('contactos')
        // Project.populate(project, [{path: 'galleries', match: {status: {$ne: 'published'}}}
        .populate({
            path: 'red',
            match: { comercio: { $ne: req.body.idComercio } }
        })
        .populate('imagenes')
        .populate('videos')
        .populate('periodosEntrega')
        .select('_id entidad red contactos imagenes videos periodosEntrega logo')
        .exec(async(err, proveedores) => {

            if (err) {
                return res.json({
                    ok: false,
                    message: 'Error al realizar la consulta. Error: ' + err.message,
                    cantidadRegistros: 0,
                    proveedores: null
                });
            }

            if (!proveedores) {
                return res.json({
                    ok: false,
                    message: 'No hay proveedores para mostrar',
                    cantidadRegistros: 0,
                    proveedores: null
                });
            }

            // console.log('Antes del fitro hay ' + proveedores.length + ' elementos');

            // proveedores = proveedores.filter(function(proveedores) {
            //     return proveedores.red.length != 0;
            // });

            let direccionComercio_ = '';
            console.log('El comercio del que necesito la direccion es: ' + req.body.idComercio);
            let direccion = await funciones.devolverDomicilioComercio(req.body.idComercio);
            if (direccion.ok) {
                direccionComercio_ = direccion.domicilio.toUpperCase();
            } else {
                return res.json({
                    ok: false,
                    message: 'Comercio no valido',
                    cantidadRegistros: 0,
                    proveedores: null
                });
            }

            let proveedoresNoFrecuentes = [];
            let proveedoresFrecuentes = [];
            let proveedores_ = [];
            let respuestaFrecuentes = await funciones.buscarProveedoresFrecuentes(req.body.idComercio);
            if (respuestaFrecuentes.ok == 0) {
                //la funcion devolvio proveedores frecuentes
                for (var j in respuestaFrecuentes.proveedores) {
                    let v_ = await funciones.verficiarComercioEnCoberturaProveedor(direccionComercio_, respuestaFrecuentes.proveedores[j]._id);
                    let v_periodos = await funciones.devolverPeriodosDeEntrega(respuestaFrecuentes.proveedores[j]._id);
                    if (v_periodos.ok) {
                        let fechaEntrega_ = await funcionesFecha.calcularFechaEntrega(v_periodos.periodos, new Date());
                        respuestaFrecuentes.proveedores[j].fechaEntrega = fechaEntrega_.fechaEntrega;
                    } else {
                        respuestaFrecuentes.proveedores[j].fechaEntrega = 'Fecha de entrega a confirmar por el proveedor'
                    }

                    respuestaFrecuentes.proveedores[j].esFrecuente = true;
                    respuestaFrecuentes.proveedores[j].tieneCobertura = false;
                    respuestaFrecuentes.proveedores[j].envioADomicilio = false;
                    respuestaFrecuentes.proveedores[j].costoEnvioADomicilio = 0.0;


                    if (v_.tieneCobertura) {
                        respuestaFrecuentes.proveedores[j].tieneCobertura = true;
                        respuestaFrecuentes.proveedores[j].envioADomicilio = v_.tieneEnvioADomicilio;
                        respuestaFrecuentes.proveedores[j].costoEnvioADomicilio = v_.costoEnvioADomicilio;
                    }
                    proveedoresFrecuentes.push(respuestaFrecuentes.proveedores[j]);
                }
            }

            //antes de armar el array con proveedores no frecuentes, debo filtrar a aquellos que se encuentran en 
            //la zona de cobertura

            let proveedores_F = [];
            let hasta = proveedores.length;
            let i = 0;

            // console.log('Hay ' + hasta + ' elementos');
            while (i < hasta) {
                //reviso que el comercio no sea frecuente
                let pertenece = false;
                for (var j in proveedoresFrecuentes) {
                    if (proveedoresFrecuentes[j]._id == proveedores[i]._id) {
                        pertenece = true;
                        break;
                    }
                }
                if (!pertenece) {
                    // console.log('');
                    // console.log(hoy + ' Agregando el proveedor: ' + proveedores[i].entidad.razonSocial);
                    //chequeo que se encuentre en la zona de cobertura
                    let v = await funciones.verficiarComercioEnCoberturaProveedor(direccionComercio_, proveedores[i]._id);
                    let fechaEntrega = '';
                    if (proveedores[i].periodosEntrega.length > 0) {
                        let _fechaEntrega = await funcionesFecha.calcularFechaEntrega(proveedores[i].periodosEntrega, new Date());
                        fechaEntrega = _fechaEntrega.fechaEntrega;
                    } else {
                        fechaEntrega = 'Fecha de entrega a confirmar por el proveedor';
                    }
                    if (v.tieneCobertura) {
                        //el comercio tiene la cobertura del proveedor
                        let p = {
                            _id: proveedores[i]._id,
                            esFrecuente: false,
                            entidad: proveedores[i].entidad,
                            red: proveedores[i].red,
                            contactos: proveedores[i].contactos,
                            imagenes: proveedores[i].imagenes,
                            videos: proveedores[i].videos,
                            tieneCobertura: v.tieneCobertura,
                            envioADomicilio: v.tieneEnvioADomicilio,
                            costoEnvioADomicilio: v.costoEnvioADomicilio,
                            fechaEntrega: fechaEntrega,
                            logo: proveedores[i].logo
                        };
                        proveedoresNoFrecuentes.push(p);
                    }
                }
                i++;
            }

            for (var k in proveedoresFrecuentes) {
                proveedores_.push(proveedoresFrecuentes[k]);
            }

            for (var k in proveedoresNoFrecuentes) {
                proveedores_.push(proveedoresNoFrecuentes[k]);
            }

            res.json({
                ok: true,
                message: 'Devolviendo proveedores',
                cantidadRegistros: proveedores_.length,
                proveedores: proveedores_
            });

        });
});

app.post('/proveedor/consultar_proveedores_frecuentes/', async function(req, res) {

    //{ proveedores: { $in: req.query.idProveedor } }
    let hoy = new Date();
    let proveedores_ = [];
    Proveedor.find()
        .populate({ path: 'entidad', populate: { path: 'domicilio' } })
        .populate('contactos')
        .populate({
            path: 'red',
            match: { comercio: req.body.idComercio }
        })
        .populate('imagenes')
        .populate('videos')
        .populate('periodosEntrega')
        .select('_id entidad red contactos imagenes videos periodosEntrega logo')
        .exec(async(err, proveedores) => {
            if (err) {
                console.log(hoy + ' La consulta de proveedores recurrentes arrojo un error');
                console.log(hoy + ' ' + err.message);
                return res.json({
                    ok: 2,
                    message: 'La consulta de proveedores recurrentes arrojo un error',
                    proveedores: null
                });
            }

            if (proveedores.length == 0) {
                console.log(hoy + ' No hay aproveedores recurrentes');
                return res.json({
                    ok: 1,
                    message: 'No hay proveedores recurrentes',
                    proveedores: null
                });
            }
            // let j = 0;
            // let k = proveedores.length;
            // while (j < k) {
            //     console.log(proveedores[j]);
            //     j++;
            // }

            proveedores = proveedores.filter(function(proveedores) {
                return proveedores.red.length != 0;
            });

            if (proveedores.length == 0) {
                console.log(hoy + ' No hay aproveedores recurrentes');
                return res.json({
                    ok: 1,
                    message: 'No hay proveedores recurrentes',
                    proveedores: null
                });
            }

            //tengo que ordenar la lista de proveedores frecuentes por la cantidad de pedidos realizados

            // let temp = [];
            proveedores_ = await proveedores.sort(function(a, b) {
                return (b.red.cantidadPedidos - a.red.cantidadPedidos)
            });

            return res.json({
                ok: 0,
                message: 'El comercio tiene proveedores recurrentes',
                proveedores: proveedores_
            });
        })

});



app.post('/proveedor/ingresar/', async function(req, res) {

    let hoy = new Date();
    console.log(hoy + ' Parametros recibidos en el login proveedor');
    console.log(hoy + ' ' + req.body);

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

        Proveedor.find({}, 'tiposEntrega entidad _id')
            .populate('entidad')
            .where('usuarios').in(usuario._id)
            .exec(async(err, proveedorDB) => {

                if (err) {
                    // console.log('Error al realizar la consulta. Error: ' + err.message);
                    return res.json({
                        ok: false,
                        message: 'Error al realizar la consulta. Error: ' + err.message
                    });
                }

                if (proveedorDB.length == 0) {
                    console.log(hoy + ' El usuario no pertenece a un proveedor')
                    return res.json({
                        ok: false,
                        err: {
                            message: 'No hay proveedores para mostrar'
                        }
                    });
                }
                // console.log('Los proveedores que se encontraron con ese usuario son:');
                // console.log(proveedorDB);

                //busco el login del usuario
                let ok = true;
                let sesion = new Sesion({});
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


                return res.json({
                    ok: true,
                    proveedorDB,
                    usuario
                });

            });
    } else {
        return res.json({
            ok: false,
            message: 'Usuario o clave incorrecta'
        });

    }
});

//la funcion busca el proveedor en la red del comercio
app.post('/proveedor/buscar_proveedor_en_red/', async function(req, res) {

    Proveedor.find({ '_id': req.body.proveedor })
        .populate('red')
        .exec((err, proveedores) => {
            if (err) {
                return res.json({
                    ok: false,
                    message: 'La busqueda arrojo un error: Error: ' + err.message
                });
            }

            if (!proveedores) {
                return res.json({
                    ok: false,
                    message: 'El comercio no tiene al proveedor en su red'
                });
            }
            for (var i in proveedores[0].red) {
                console.log('Comercio a analizar: ' + proveedores[0].red[i].comercio);
                console.log('Comercio a buscar: ' + req.body.comercio);
                if (proveedores[0].red[i].comercio == req.body.comercio)
                    return res.json({
                        ok: true,
                        message: 'El proveedor ya forma parte de la red'
                    });

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

app.post('/proveedor/buscar_proveedor/', async function(req, res) {

    Proveedor.findOne({ _id: req.body.idProveedor })
        .populate({ path: 'entidad', populate: { path: 'domicilio' } })
        .exec(async(err, proveedor) => {
            if (err) {
                console.log('La busqueda de un proveedor por Id arrojo un error');
                console.log(err.message);
                return res.json({
                    ok: false,
                    message: 'La busqueda de un proveedor por Id arrojo un error',
                    proveedor: null
                });
            }

            if (proveedor == null) {
                console.log('La busqueda de proveedor por id no produjo resultados');
                return res.json({
                    ok: false,
                    message: 'La busqueda de proveedor por id no produjo resultados',
                    proveedor: null
                });
            }

            res.json({
                ok: true,
                message: 'Proveedor encontrado',
                proveedor
            });
        });
});


app.post('/proveedor/buscar_alias/', async function(req, res) {
    Proveedor.findOne({ _id: req.body.idProveedor })
        .populate('red')
        .exec(async(err, proveedor) => {
            if (err) {
                console.log('La busqueda de proveedor para buscar un alias devolvio un error');
                console.log(err.message);
                return res.json({
                    ok: false,
                    message: 'La busqueda de proveedor para buscar un alias devolvio un error',
                    alias: null,
                    idAlias: null
                });
            }

            if (proveedor == null) {
                console.log('La busqueda de proveedor para buscar el alias no devolvio resultados');
                return res.json({
                    ok: false,
                    message: 'La busqueda de proveedor para buscar el alias no devolvio resultados',
                    alias: null,
                    idAlias: null
                });
            }

            let i = 0;
            let hasta = proveedor.red.length;
            let alias = '';
            let idAlias = '';
            // console.log('Buscando alias para el comercio: ' + req.body.idComercio);
            while (i < hasta) {
                // console.log('Comparando');
                // console.log('valor de i: ' + i);
                // console.log('Valor de hasta: ' + hasta);
                // console.log('Parametro a buscar: ' + req.body.idComercio);
                // console.log('Parametro de comparacion: ' + proveedor.red[i].comercio);
                if (req.body.idComercio == proveedor.red[i].comercio) {
                    alias = proveedor.red[i].alias;
                    idAlias = proveedor.red[i]._id;
                    break;
                }
                i++;
            }
            // console.log('Devolviendo el alias: ' + alias);

            res.json({
                ok: true,
                message: 'Alias encontrado',
                alias: alias,
                idAlias: idAlias
            });
        });
});



app.get('/proveedor/consultar_comercios_de_proveedor/', async function(req, res) {
    let hoy = new Date();
    Proveedor.find({ _id: req.query.idProveedor })
        .populate({
            path: 'red',
            populate: {
                path: 'comercio',
                select: 'contactos entidad _id fechaAlta',
                populate: { path: 'entidad', populate: { path: 'domicilio' } }
            }
        })
        .populate({
            path: 'red',
            populate: {
                path: 'comercio',
                select: 'contactos entidad _id fechaAlta',
                populate: {
                    path: 'contactos',
                    match: { tipoContacto: "Telefono Celular" }
                }
            }
        })
        .exec(async(err, proveedores) => {
            if (err) {
                console.log(hoy + ' Error en la consulta de proveedores para devolver los miembros de la red');
                console.log(hoy + ' ' + err.message);
                return res.json({
                    ok: false,
                    message: 'Error en la consulta de proveedores para devolver los miembros de la red',
                    cantidadComercios: 0,
                    comercios: null
                });
            }

            if (proveedores.length == 0) {
                console.log(hoy + ' No hay proveedores con el id ' + req.query.idProveedor);
                return res.json({
                    ok: false,
                    message: ' No hay proveedores con el id ' + req.query.idProveedor,
                    cantidadComercios: 0,
                    comercios: null
                });
            }

            if (proveedores[0].red.length == 0) {
                return res.json({
                    ok: false,
                    message: 'El proveedor no tiene comercios en su red',
                    cantidadComercios: 0,
                    comercios: null
                });
            }

            return res.json({
                ok: true,
                message: 'Devolviendo red de comercios',
                cantidadComercios: proveedores[0].red.length,
                comercios: proveedores[0].red
            });
        });
});

app.post('/proveedor/existe/', async function(req, res) {
    let hoy = new Date();
    console.log(hoy + ' Analizando si el proveedor esta en la base de datos');
    Proveedor.find({ '_id': req.body.proveedor })
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
                    message: 'La busqueda no encontro ningun proveedor con el id ' + req.body.comercio
                });
            }

            if (comerciosDB.length == 0) {
                return res.json({
                    ok: false,
                    message: 'La busqueda no encontro ningun proveedor con el id ' + req.body.comercio
                });
            }

            return res.json({
                ok: true,
                message: 'El proveedor esta cargado'
            });

        });
});


app.post('/proveedor/cargar_imagenes/', async function(req, res) {
    let hoy = new Date();
    for (var i in req.body.imagenes) {
        hoy = new Date();
        let imagenProveedor = new ImagenProveedor({
            formato: req.body.imagenes[i].extension
        });

        if (req.body.imagenes[i].extension == 'png' || req.body.imagenes[i].extension == 'jpg' || req.body.imagenes[i].extension == 'jpeg') {
            console.log(hoy + ' Paso la validacion de formato de imagen');
            var target_path = process.env.UrlImagenProveedor + imagenProveedor._id + '.' + req.body.imagenes[i].extension; // hacia donde subiremos nuestro archivo dentro de nuestro servidor
            console.log(hoy + ' Path Destino: ' + target_path);
            await fs.writeFile(target_path, new Buffer(req.body.imagenes[i].imagen, "base64"), async function(err) {
                //Escribimos el archivo

                if (err) {
                    console.log(hoy + ' La subida del archivo produjo un error: ' + err.message);
                    return {
                        ok: false,
                        message: 'La subida del archivo produjo un error'
                    };
                }
                console.log(hoy + ' La imagen se termino de mover');
                imagenProveedor.url = 'http://www.bintelligence.net/imagenes_proveedor/' + imagenProveedor._id + '.' + req.body.imagenes[i].extension;
                imagenProveedor.nombre = imagenProveedor._id;

                console.log(hoy + ' Se esta por guardar el registro de la imagen');
                try {
                    imagenProveedor.save((error, imagen_) => {
                        if (error) {
                            console.log(hoy + ' El alta de la imagen produjo un error: ' + error.message);

                            return res.json({
                                ok: false,
                                message: 'El alta de la publicidad produjo un error: ' + error.message
                            });
                        }
                        console.log(hoy + 'Imagen guardada');
                    });
                } catch (e) {
                    console.log('Salida por el catch: ' + e.message);
                }
            });
        }
    }
    console.log(hoy + ' Termino el proceso');
    res.json({
        ok: true,
        message: 'Las imagenes se cargaron correctamente'
    });
});


app.post('/proveedor/subir_video/', async function(req, res) {
    let hoy = new Date();
    for (var i in req.body.videos) {
        let video = new VideoProveedor({
            titulo: req.body.videos[i].titulo,
            canal: req.body.videos[i].canal,
            url: req.body.videos[i].url
        });

        video.save(async(err, ok) => {
            if (err) {
                console.log(hoy + ' El alta de video arrojo un error');
                console.log(hoy + ' ' + err.message);
                return res.json({
                    ok: false,
                    message: 'El alta de video produjo un error'
                });
            }

            //agrego el video a la lista del proveedor
            Proveedor.findOneAndUpdate({ _id: req.body.idProveedor }, {
                $push: {
                    videos: video._id
                }
            }, async function(errA, okA) {
                if (errA) {
                    console.log(hoy + ' La actualizacion del proveedor para agregar una imagen produjo un error');
                    console.log(hoy + ' Video que fallo: ' + ok.url);
                    console.log(hoy + ' ' + errA.message);
                    return res.json({
                        ok: false,
                        message: 'El proceso de subir un video del proveedor fallo. Video errone: ' + ok.url
                    });
                }
            });
        });
    }

    res.json({
        ok: true,
        message: 'Proceso finalizado con exito'
    });
});

//////////////// MANEJO DE CONFIGURACION DE PROVEEDORES ////////////////

app.post('/proveedor/agregar_cobertura/', async function(req, res) {
    console.log('Llega la peticion');
    let hoy = new Date();
    if (req.body.coberturas) {
        console.log('Hay coberturas');
        try {
            // let cobertura = new Cobertura();
            for (var i in req.body.coberturas) {
                //genero el objeto
                let cobertura = new Cobertura({
                    nombreZona: req.body.coberturas[i].nombreZona
                });
                if (req.body.coberturas[i].provincias) {
                    console.log('Hay provincias para analizar');
                    let provincias = [];
                    for (var j in req.body.coberturas[i].provincias) {

                        let provincia = {
                            provincia: req.body.coberturas[i].provincias[j].provincia,
                            localidades: []
                        };
                        if (req.body.coberturas[i].provincias[j].localidades) {
                            for (var k in req.body.coberturas[i].provincias[j].localidades) {
                                let localidad = {
                                    localidad: req.body.coberturas[i].provincias[j].localidades[k].localidad,
                                    barrios: []
                                };
                                if (req.body.coberturas[i].provincias[j].localidades[k].barrios) {
                                    for (var l in req.body.coberturas[i].provincias[j].localidades[k].barrios) {
                                        let barrio = {
                                            barrio: req.body.coberturas[i].provincias[j].localidades[k].barrios[l].barrio,
                                            entregaADomicilio: req.body.coberturas[i].provincias[j].localidades[k].barrios[l].entregaADomicilio,
                                            costoEntrega: req.body.coberturas[i].provincias[j].localidades[k].barrios[l].costoEntrega
                                        };
                                        localidad.barrios.push(barrio);
                                    }
                                    provincia.localidades.push(localidad);
                                } else {
                                    //no hay barrios, no se puede continuar con el proceso
                                    return res.json({
                                        ok: false,
                                        message: 'El area de cobertura esta incompleta. Faltan los barrios'
                                    });
                                }
                            }
                            provincias.push(provincia);
                        } else {
                            //no hay localidades, no se puede continuar con el proceso
                            return res.json({
                                ok: false,
                                message: 'El area de cobertura esta incompleta. Faltan las localidades'
                            });
                        }
                    }
                    cobertura.provincias = provincias;
                    //termino la carga del objeto, resta darle de alta
                    cobertura.save();
                    Proveedor.findOneAndUpdate({ _id: req.body.idProveedor }, {
                            $push: {
                                cobertura: cobertura._id
                            }
                        },
                        function(err, success) {
                            if (err) {
                                console.log('Fallo la ejecucion del proceso de asignacion de cobertura al proveedor');
                                console.log(err.message);
                            } else {
                                console.log('La cobertura se agrego correctamente');
                            }
                        });
                } else {
                    //no hay provincias, no se puede continuar con el proceso
                    console.log('No hay provincias para analizar');
                    return res.json({
                        ok: false,
                        message: 'El area de cobertura esta incompleta. Faltan la o las provincias'
                    });
                }
            }

            //aqui debo cargar la cobertura en el proveedor


            res.json({
                ok: true,
                message: 'Proceso de definicion de cobertura terminado'
            });
        } catch (e) {
            console.log('Fallo un metodo en el try');
            console.log(e.message);
            console.log(e.stack);
            return res.json({
                ok: false,
                message: 'Fallo en la ejecucion del proceso.Salida controlada'
            });
        }
    } else {
        //no hay coberturas, no se puede continuar con el proceso
        console.log('No hay datos de cobertura para procesar');
        return res.json({
            ok: false,
            message: 'No hay datos para armar la cobertura'
        });
    }
});

app.get('/proveedor/devolver_cobertura/', async function(req, res) {

    let hoy = new Date();
    Proveedor.findOne({ _id: req.query.idProveedor })
        .populate('cobertura')
        .exec(async(err, proveedores) => {
            if (err) {
                console.log(hoy + ' La busqueda de proveedores para devolver la cobertura arrojo un error');
                console.log(hoy + ' ' + err.message);
                return res.json({
                    ok: false,
                    message: 'La busqueda de proveedores para devolver la cobertura arrojo un error',
                    cobertura: null
                });
            }

            if (proveedores == null) {
                console.log(hoy + ' No se encontraron proveedores con el id ' + req.query.idProveedor);
                return res.json({
                    ok: false,
                    message: 'No se encontraron proveedores',
                    cobertura: null
                });
            }

            if (proveedores.cobertura == null) {
                console.log(hoy + ' El proveedor no tiene definida un area de cobertura');
                return res.json({
                    ok: false,
                    message: 'El proveedor no tiene definida un area de cobertura',
                    cobertura: null
                });
            }

            res.json({
                ok: true,
                message: 'Proveedor encontrado',
                cobertura: proveedores.cobertura
            });
        })
});

///El proceso de actualizacion de cobertura va a quitar la zona completa y va a agregar la zona modificada
app.post('/proveedor/modificar_cobertura/', async function(req, res) {

    let hoy = new Date();
    // Favorite.update({ cn: req.params.name }, { $pullAll: { uid: [req.params.deleteUid] } })
    Proveedor.findOneAndUpdate({ _id: req.body.idProveedor }, {
            $pullAll: {
                cobertura: req.body.coberturasAModificar
            }
        },
        async function(err, ok) {
            if (err) {
                console.log(hoy + ' El proceso de actualizacion de datos provoco un error');
                console.log(hoy + ' ' + err.message);
                return res.json({
                    ok: false,
                    message: 'El proceso de actualizacion de cobertura produjo un error'
                });
            } else {
                //todo salio ok, ahora tengo que dar de alta la nueva cobertura si es que existe
                if (req.body.nuevasCoberturas) {
                    console.log('Hay nuevas coberturas para agregar');
                    //hay nuevas coberturas, tengo que agregarlas
                    funciones.nuevaCobertura(req.body.nuevasCoberturas, req.body.idProveedor);
                } else {
                    console.log('No hay nuevas coberturas a agregar');
                }
            }
            res.json({
                ok: true,
                message: 'Proceso de actualizacion finalizo correctamente'
            });
        });

});


app.post('/proveedor/agregar_periodo_entrega/', async function(req, res) {

    let hoy = new Date();

    if (req.body.periodos) {
        for (var i in req.body.periodos) {
            let periodo = new Periodo({
                tipoPeriodo: req.body.periodos[i].tipoPeriodo,
                diaFijo: req.body.periodos[i].diaFijo
            });
            periodo.save(async(err, ok) => {
                if (err) {
                    console.log(hoy + ' El proceso de guardar el periodo arrojo un error');
                    console.log(hoy + ' ' + err.message);
                    return res.json({
                        ok: false,
                        message: 'El proceso de guardar un periodo de entrega produjo un error'
                    });
                }
                //periodo guardado, lo agrego al array en el proveedor
                Proveedor.findOneAndUpdate({ _id: req.body.idProveedor }, {
                        $push: {
                            periodosEntrega: periodo._id
                        }
                    },
                    async function(err1, ok) {
                        if (err1) {
                            console.log(hoy + ' El proceso para insertar el periodo en el proveedor provoco un error');
                            console.log(hoy + ' ' + err1.message);
                            return res.json({
                                ok: false,
                                message: 'El proceso para insertar el periodo en el proveedor provoco un error'
                            });
                        }
                    });
            })
        }
    } else {
        console.log(hoy + ' No hay periodos a agregar al proveedor ' + req.body.idProveedor);
        return res.json({
            ok: false,
            message: 'No hay periodos para asignar al proveedor'
        });
    }

    return res.json({
        ok: true,
        message: 'El proceso finalizo con exito'
    });

});
app.post('/proveedor/consultar_periodos_entrega/', async function(req, res) {
    let hoy = new Date();
    Proveedor.findOne({ _id: req.body.idProveedor })
        .populate('periodosEntrega')
        .exec(async(err, proveedor) => {
            if (err) {
                console.log(hoy + ' La busqueda de un proveedor para devolver los periodos de entrega arrojo un error');
                console.log(hoy + ' ' + err.message);
                return res.json({
                    ok: false,
                    message: 'La busqueda de un proveedor para devolver los periodos de entrega arrojo un error',
                    periodos: null
                });
            }
            if (proveedor == null) {
                console.log(hoy + ' La busqueda de un proveedor para devolver sus periodos de entrega no arrojo resultados');
                return res.json({
                    ok: false,
                    message: 'La busqueda de un proveedor para devolver sus periodos de entrega no arrojo resultados',
                    periodos: null
                });
            }

            if (proveedor.periodosEntrega.length == 0) {
                console.log(hoy + ' El proveedor no definio un periodo de entrega');
                return res.json({
                    ok: false,
                    message: 'El proveedor no definio un periodo de entrega',
                    periodos: null
                });
            }

            res.json({
                ok: true,
                message: 'Devolviendo periodos',
                periodos: proveedor.periodosEntrega
            });
        });
});

app.post('/proveedor/consultar_posible_fecha_entrega/', async function(req, res) {

    let hoy = new Date();
    Proveedor.findOne({ _id: req.body.idProveedor })
        .populate('periodosEntrega')
        .exec(async(err, proveedor) => {
            if (err) {
                console.log(hoy + ' La consulta de un proveedor para devolver una fecha de entrega produjo un error');
                console.log(hoy + ' ' + err.message);
                return res.json({
                    ok: false,
                    message: 'La consulta de un proveedor para devolver una fecha de entrega produjo un error',
                    fechaEntrega: null
                });
            }
            if (proveedor == null) {
                console.log(hoy + ' La busqueda de un proveedor para devolver la fecha de entrega no produjo resultados');
                return res.json({
                    ok: false,
                    message: 'Proveedor no encontrado',
                    fechaEntrega: null
                });
            }

            if (proveedor.periodosEntrega.length == 0) {
                console.log(hoy + ' El proveedor no definio periodo de entrega');
                return res.json({
                    ok: false,
                    message: 'El proveedor no definio fecha de entrega',
                    fechaEntrega: 'Pongase en contacto con el proveedor para coordina la fecha de entrega'
                });
            }

            let dia = req.body.dia;
            if (dia.length == 1) {
                dia = '0' + dia;
            }
            let mes = req.body.mes;
            if (mes.length == 1) {
                mes = '0' + mes;
            }
            let anio = req.body.anio;
            let fecha = new Date(mes + '/' + dia + '/' + anio);
            let fecha_ = await funcionesFecha.calcularFechaEntrega(proveedor.periodosEntrega, fecha);
            if (fecha_.ok) {
                return res.json({
                    ok: true,
                    message: 'Devolviendo fecha',
                    fechaEntrega: fecha_.fechaEntrega
                });
            } else {
                return res.json({
                    ok: false,
                    message: 'El proveedor no definio fecha de entrega',
                    fechaEntrega: 'Pongase en contacto con el proveedor para coordina la fecha de entrega'
                });
            }

        });
});

app.post('/proveedor/cargar_logo_proveedor/', async function(req, res) {
    let hoy = new Date();
    let urlImagen = '';
    if (req.body.imagen) {
        hoy = new Date();


        if (req.body.imagen.extension == 'png' || req.body.imagen.extension == 'jpg' || req.body.imagen.extension == 'jpeg') {
            console.log(hoy + ' Paso la validacion de formato de imagen');
            var target_path = process.env.UrlImagenProveedor + req.body.idProveedor + '_logo.' + req.body.imagen.extension; // hacia donde subiremos nuestro archivo dentro de nuestro servidor
            console.log(hoy + ' Path Destino: ' + target_path);
            await fs.writeFile(target_path, new Buffer(req.body.imagen.imagen, "base64"), async function(err) {
                //Escribimos el archivo

                if (err) {
                    console.log(hoy + ' La subida del archivo produjo un error: ' + err.message);
                    return {
                        ok: false,
                        message: 'La subida del archivo produjo un error'
                    };
                }
                console.log(hoy + ' La imagen se termino de mover');
                urlImagen = 'http://www.bintelligence.net/imagenes_proveedor/' + req.body.idProveedor + '_logo.' + req.body.imagen.extension;
                // imagenProveedor.nombre = imagenProveedor._id;

                console.log(hoy + ' Se esta por guardar el registro de la imagen');
                try {
                    Proveedor.findOneAndUpdate({ _id: req.body.idProveedor }, {
                        $set: {
                            logo: urlImagen
                        }
                    }, async function(errA, okA) {
                        if (errA) {
                            console.log(hoy + ' La actualizacion del proveedor para agregar una imagen del logo');
                            console.log(hoy + ' ' + errA.message);
                            return res.json({
                                ok: false,
                                message: 'El proceso de subir el logo del proveedor fallo.'
                            });
                        }
                    });

                } catch (e) {
                    console.log('Salida por el catch: ' + e.message);
                }
            });
        }
    }
    console.log(hoy + ' Termino el proceso');
    res.json({
        ok: true,
        message: 'El logo se cargo correctamente.'
    });
});


module.exports = app;