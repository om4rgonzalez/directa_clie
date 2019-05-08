const express = require('express');
const app = express();
const Producto = require('../models/producto');
const SubProducto = require('../models/subProducto');
const Proveedor = require('../../server_entidades/models/proveedor');
const HistoriaPrecioProveedorBulto = require('../models/historiaCambioPrecioProveedorBulto');
const HistoriaPrecioSugeridoBulto = require('../models/historiaCambioPrecioSugeridoBulto');
const HistoriaPrecioProveedorUnidad = require('../models/historiaCambioPrecioProveedorUnidad');
const HistoriaPrecioSugeridoUnidad = require('../models/historiaCambioPrecioSugeridoUnidad');
const HistoriaCambioPrecioAlPublico = require('../models/historiaCambioPrecioAlPublico');
const ImagenProducto = require('../models/imagenProducto');
const VideoProducto = require('../models/videoProducto');
const fs = require('fs');
const funciones = require('../../middlewares/funciones');
const Empaques = require('../src/empaque.json');

// app.post('/test/round/', function(req, res) {
//     var value = 1.01272121212;
//     console.log('El numero formateado es: ' + value.toFixed(3));
// })


app.post('/producto/nuevo_subproducto/', async function(req, res) {
    let hoy = new Date();
    let productos_ = [];
    if (req.body.productos) {
        try {
            for (var i in req.body.productos) {
                let producto = new SubProducto({
                    nombreProducto: req.body.productos[i].nombreProducto.toUpperCase(),
                    precioProveedorBulto: Number(req.body.productos[i].precioProveedorBulto).toFixed(3),
                    precioSugeridoBulto: Number(req.body.productos[i].precioSugeridoBulto).toFixed(3),
                    precioProveedorUnidad: Number(req.body.productos[i].precioProveedorUnidad).toFixed(3),
                    precioSugeridoUnidad: Number(req.body.productos[i].precioSugeridoUnidad).toFixed(3),
                    categoria: req.body.productos[i].categoria.toUpperCase(),
                    subcategoria: req.body.productos[i].subcategoria.toUpperCase(),
                    unidadMedida: req.body.productos[i].unidadMedida.toUpperCase(),
                    detalleProducto: req.body.productos[i].detalleProducto,
                    empaque: req.body.productos[i].empaque,
                    unidadesPorEmpaque: req.body.productos[i].unidadesPorEmpaque
                });

                if (req.body.productos[i].stock == -1) {
                    producto.stock = 100000000;
                } else {
                    producto.stock = req.body.productos[i].stock;
                }
                if (req.body.productos[i].codigoProveedor == 0) {
                    //debo obtener el indice para este producto sin codigo
                    hoy = new Date();
                    let dia = await hoy.getDate();


                    let mes = await hoy.getMonth();
                    mes++;
                    if (mes > 12)
                        mes = 1;

                    let anio = await hoy.getFullYear();
                    let hora = await hoy.getUTCHours();
                    let minuto = await hoy.getUTCMinutes();
                    let segundos = await hoy.getUTCSeconds();
                    let milisegundos = await hoy.getUTCMilliseconds();


                    if (dia.toString().length == 1) {
                        dia = '0' + dia;
                    }
                    if (mes.toString().length == 1) {
                        mes = '0' + mes;
                    }
                    let fechaNum = anio.toString() + mes.toString() + dia.toString() + hora.toString() + minuto.toString() + segundos.toString() + milisegundos.toString();
                    console.log('Producto sin id proveedor: ' + req.body.productos[i].nombreProducto.toUpperCase());
                    console.log('El id a asignar es: ' + fechaNum);
                    producto.codigoProveedor = fechaNum;
                    // producto.codigoProveedor = await funciones.obtenerIndice();
                } else {
                    producto.codigoProveedor = req.body.productos[i].codigoProveedor;
                }
                productos_.push(producto._id);

                //guardo la historia del precio
                // console.log('Estoy por guardar la historia del precio proveedor');
                // console.log('Producto a guardar el precio: ' + req.body.productos[i].nombreProducto);
                // console.log('Precio a guardar: ' + req.body.productos[i].precioProveedor);
                let historiaCambioPrecioProveedorBulto = new HistoriaPrecioProveedorBulto({
                    precio: Number(req.body.productos[i].precioProveedorBulto).toFixed(3)
                });
                let historiaCambioPrecioProveedorUnidad = new HistoriaPrecioProveedorUnidad({
                    precio: Number(req.body.productos[i].precioProveedorUnidad).toFixed(3)
                });

                historiaCambioPrecioProveedorBulto.save();
                historiaCambioPrecioProveedorUnidad.save();
                producto.historialPrecioProveedorBulto.push(historiaCambioPrecioProveedorBulto._id);
                producto.historialPrecioProveedorUnidad.push(historiaCambioPrecioProveedorUnidad._id);

                //guardo la historia de cambio de precio sugerido
                if (req.body.productos[i].precioSugeridoBulto) {
                    let historiaCambioPrecioSugeridoBulto = new HistoriaPrecioSugeridoBulto({
                        precio: Number(req.body.productos[i].precioSugeridoBulto).toFixed(3)
                    });
                    let historiaCambioPrecioSugeridoUnidad = new HistoriaPrecioSugeridoUnidad({
                        precio: Number(req.body.productos[i].precioSugeridoUnidad).toFixed(3)
                    });

                    producto.historiaPrecioSugeridoBulto.push(historiaCambioPrecioSugeridoBulto._id);
                    producto.historiaPrecioSugeridoUnidad.push(historiaCambioPrecioSugeridoUnidad._id);
                    historiaCambioPrecioSugeridoBulto.save();
                    historiaCambioPrecioSugeridoUnidad.save();
                }


                producto.save((errP, ok) => {
                    if (errP) {
                        console.log('Salto un error al intentar guardar el sub producto.');
                        console.log(errp.message);
                        console.log('---------------');
                        console.log(errp);
                        res.json({
                            ok: false,
                            errp
                        });
                    }
                });
                Proveedor.findOneAndUpdate({ _id: req.body.idProveedor }, { $push: { subProductos: producto._id } },
                    function(err, ok) {
                        if (err) {
                            console.log('La insercion del producto en el proveedor arrojo un error');
                            console.log(err.message);
                        }
                    });
            }
        } catch (e) {
            console.log('Salto un error en el catch.');
            console.log(e.message);
            console.log(e);

            return res.json({
                ok: false,
                message: 'Fallo la ejecucion de una funcion durante el guardado de un producto',
                error: e.message
            });
        }

        //resta asignarle los productos al proveedor

        res.json({
            ok: true,
            message: 'Alta terminada',
            error: 'Sin errores'
        });
    }
});


app.post('/subproducto/actualizar/', async function(req, res) {
    let hoy = new Date();
    if (req.body.productos) {
        for (var i in req.body.productos) {
            let update = {};
            let historiaCambioPrecioProveedorBulto = new HistoriaPrecioProveedorBulto({
                precio: Number(req.body.productos[i].precioProveedorBulto).toFixed(3)
            });
            let historiaCambioPrecioProveedorUnidad = new HistoriaPrecioProveedorUnidad({
                precio: Number(req.body.productos[i].precioProveedorUnidad).toFixed(3)
            });

            historiaCambioPrecioProveedorBulto.save();
            historiaCambioPrecioProveedorUnidad.save();

            if (req.body.productos[i].precioSugeridoBulto) {
                let historiaCambioPrecioSugeridoBulto = new HistoriaPrecioSugeridoBulto({
                    precio: Number(req.body.productos[i].precioSugeridoBulto).toFixed(3)
                });
                let historiaCambioPrecioSugeridoUnidad = new HistoriaPrecioSugeridoUnidad({
                    precio: Number(req.body.productos[i].precioSugeridoUnidad).toFixed(3)
                });

                historiaCambioPrecioSugeridoBulto.save();
                historiaCambioPrecioSugeridoUnidad.save();
                // Producto.findOneAndUpdate({codigoProveedor: req.body.productos[i].codigoProveedor})

                // Producto.findByIdAndUpdate(req.body.productos[i].codigoProveedor, {
                SubProducto.findOneAndUpdate({ codigoProveedor: req.body.productos[i].codigoProveedor }, {
                        $push: {
                            historialPrecioProveedorBulto: historiaCambioPrecioProveedorBulto._id,
                            historialPrecioProveedorUnidad: historiaCambioPrecioProveedorUnidad._id,
                            historiaPrecioSugeridoBulto: historiaCambioPrecioSugeridoBulto._id,
                            historiaPrecioSugeridoUnidad: historiaCambioPrecioSugeridoUnidad._id
                        },
                        $set: {
                            precioProveedorBulto: Number(req.body.productos[i].precioProveedorBulto).toFixed(3),
                            precioSugeridoBulto: Number(req.body.productos[i].precioSugeridoBulto).toFixed(3),
                            precioProveedorUnidad: Number(req.body.productos[i].precioProveedorUnidad).toFixed(3),
                            precioSugeridoUnidad: Number(req.body.productos[i].precioSugeridoUnidad).toFixed(3)
                        }
                    },
                    async function(err, success) {
                        if (err) {
                            console.log(hoy + ' La funcion de actualizacion del precio proveedor devolvio un error');
                            console.log(hoy + ' ' + err.message);
                            return res.json({
                                ok: false,
                                message: 'La funcion de actualizacion del precio proveedor devolvio un error'
                            });
                        }
                        console.log(hoy + ' Se agregaron los items de historial de precios');
                    });
            } else {
                // Producto.findByIdAndUpdate(req.body.productos[i].codigoProveedor, {
                SubProducto.findOneAndUpdate({ codigoProveedor: req.body.productos[i].codigoProveedor }, {
                        $push: {
                            historialPrecioProveedorBulto: historiaCambioPrecioProveedorBulto._id,
                            historialPrecioProveedorUnidad: historiaCambioPrecioProveedorUnidad._id,
                        },
                        $set: {
                            precioProveedorBulto: Number(req.body.productos[i].precioProveedorBulto).toFixed(3),
                            precioSugeridoBulto: Number(req.body.productos[i].precioSugeridoBulto).toFixed(3),
                        }
                    },
                    async function(err, success) {
                        if (err) {
                            console.log(hoy + ' La funcion de actualizacion del precio proveedor devolvio un error');
                            console.log(hoy + ' ' + err.message);
                            return res.json({
                                ok: false,
                                message: 'La funcion de actualizacion del precio proveedor devolvio un error'
                            });
                        }
                        console.log(hoy + ' Se termino la actualizacion del precio proveedor');
                    });
            }

            //verifico si se deben actualizar el resto de los campos

            if (req.body.productos[i].nombreProducto) {
                update.nombreProducto = req.body.productos[i].nombreProducto.toUpperCase();
            }
            if (req.body.productos[i].categoria) {
                update.categoria = req.body.productos[i].categoria.toUpperCase();
            }
            if (req.body.productos[i].subcategoria) {
                update.subcategoria = req.body.productos[i].subcategoria.toUpperCase();
            }
            if (req.body.productos[i].stock) {
                update.stock = req.body.productos[i].stock;
            }
            // if (req.body.productos[i].unidadMedida) {
            //     update.unidadMedida = req.body.productos[i].unidadMedida.toUpperCase();
            // }
            if (req.body.productos[i].nuevoCodigoProveedor) {
                update.codigoProveedor = req.body.productos[i].nuevoCodigoProveedor;
            }

            if (update.lenght != 0) {
                // Producto.findByIdAndUpdate(req.body.productos[i].codigoProveedor, update, { new: true }, (err, success) => {
                SubProducto.findOneAndUpdate({ codigoProveedor: req.body.productos[i].codigoProveedor }, update, { new: true }, (err, success) => {
                    if (err) {
                        console.log(hoy + ' La funcion de actualizacion de producto devolvio un error');
                        console.log(hoy + ' ' + err.message);
                        return res.json({
                            ok: false,
                            message: 'La funcion de actualizacion de producto devolvio un error'
                        });
                    }

                    console.log(hoy + ' La actualizacion de datos del producto finalizo correctamente');
                });
            }
            i++;
        }
        console.log(hoy + ' El proceso de actualizacion finalizo');
        res.json({
            ok: true,
            message: 'La actualizacion termino correctamente'
        });
    }
});


app.get('/subproducto/todos/', function(req, res) {
    console.log('Accediendo al servicio que devuelve todos los subproductos');
    SubProducto.find()
        .exec((err, subProductos) => {

            if (err) {
                console.log('La consulta de subproductos devolvio un error');
                console.log(err.message);
                return res.json({
                    ok: false,
                    message: 'La consulta de subproductos devolvio un error',
                    subProductos: null
                });
            }
            if (subProductos.length == 0) {
                console.log('No hay sub productos para devolver');
                return res.json({
                    ok: false,
                    message: 'No hay sub productos para devolver',
                    subProductos: null
                });
            }

            res.json({
                ok: true,
                message: 'Devolviendo sub productos',
                subProductos
            });
        });
});

app.post('/producto/nuevo/', async function(req, res) {
    let hoy = new Date();
    let productos_ = [];
    if (req.body.productos) {
        try {
            for (var i in req.body.productos) {
                //guardo el historial de cambio de precio al publico
                let historia = new HistoriaCambioPrecioAlPublico({
                    precio: req.body.productos[i].precioPublico
                });

                historia.save();

                let vigencia = new Date(req.body.productos[i].vigencia);

                let producto = new Producto({
                    nombreProducto: req.body.productos[i].nombreProducto.toUpperCase(),
                    precioPublico: req.body.productos[i].precioPublico,
                    categoria: req.body.productos[i].categoria.toUpperCase(),
                    subcategoria: req.body.productos[i].subcategoria.toUpperCase(),
                    unidadMedida: req.body.productos[i].unidadMedida.toUpperCase(),
                    detalleProducto: req.body.productos[i].detalleProducto,
                    empaque: req.body.productos[i].empaque,
                    unidadesPorEmpaque: req.body.productos[i].unidadesPorEmpaque,
                    vigencia: vigencia
                });
                producto.historiaCambioPrecioAlPublico.push(historia._id);

                if (req.body.productos[i].stock == -1) {
                    producto.stock = 100000000;
                } else {
                    producto.stock = req.body.productos[i].stock;
                }
                if (req.body.productos[i].codigoProveedor == 0) {
                    //debo obtener el indice para este producto sin codigo
                    hoy = new Date();
                    let dia = await hoy.getDate();


                    let mes = await hoy.getMonth();
                    mes++;
                    if (mes > 12)
                        mes = 1;

                    let anio = await hoy.getFullYear();
                    let hora = await hoy.getUTCHours();
                    let minuto = await hoy.getUTCMinutes();
                    let segundos = await hoy.getUTCSeconds();
                    let milisegundos = await hoy.getUTCMilliseconds();


                    if (dia.toString().length == 1) {
                        dia = '0' + dia;
                    }
                    if (mes.toString().length == 1) {
                        mes = '0' + mes;
                    }
                    let fechaNum = anio.toString() + mes.toString() + dia.toString() + hora.toString() + minuto.toString() + segundos.toString() + milisegundos.toString();
                    console.log('Producto sin id proveedor: ' + req.body.productos[i].nombreProducto.toUpperCase());
                    console.log('El id a asignar es: ' + fechaNum);
                    producto.codigoProveedor = fechaNum;
                    // producto.codigoProveedor = await funciones.obtenerIndice();
                } else {
                    producto.codigoProveedor = req.body.productos[i].codigoProveedor;
                }

                //cargo los subproductos
                let contadorItems = 0;
                for (var j in req.body.productos[i].subProductos) {
                    producto.subProductos.push({
                        subProducto: req.body.productos[i].subProductos[j].subProducto,
                        cantidad: req.body.productos[i].subProductos[j].cantidad
                    });
                    contadorItems++;
                }
                producto.cantidadSubProductos = contadorItems;
                productos_.push(producto._id);

                producto.save();
                Proveedor.findOneAndUpdate({ _id: req.body.idProveedor }, { $push: { productos: producto._id } },
                    function(err, ok) {
                        if (err) {
                            console.log('La insercion del producto en el proveedor arrojo un error');
                            console.log(err.message);
                        }
                    });
            }
        } catch (e) {
            console.log('Salto un error en el catch.');
            console.log(e.message);

            return res.json({
                ok: false,
                message: 'Fallo la ejecucion de una funcion durante el guardado de un producto',
                error: e.message
            });
        }

        //resta asignarle los productos al proveedor

        res.json({
            ok: true,
            message: 'Alta terminada',
            error: 'Sin errores'
        });
    }
});

app.post('/producto/actualizar/', async function(req, res) {
    let hoy = new Date();
    if (req.body.productos) {
        for (var i in req.body.productos) {
            let update = {};
            if (req.body.productos[i].precioPublico) {

                update.precioPublico = req.body.productos[i].precioPublico;

                historiaCambioPrecioAlPublico = new HistoriaCambioPrecioAlPublico({
                    precio: req.body.productos[i].precioPublico
                })
                historiaCambioPrecioAlPublico.save();
                Producto.findByIdAndUpdate(req.body.productos[i].idProducto, {
                        $push: {
                            historiaCambioPrecioAlPublico: historiaCambioPrecioAlPublico._id
                        }
                    },
                    async function(err, success) {
                        if (err) {
                            console.log(hoy + ' La funcion de actualizacion del precio proveedor devolvio un error');
                            console.log(hoy + ' ' + err.message);
                            return res.json({
                                ok: false,
                                message: 'La funcion de actualizacion del precio proveedor devolvio un error'
                            });
                        }
                        console.log(hoy + ' Se termino la actualizacion del precio proveedor');
                    });
            }

            if (req.body.productos[i].nombreProducto) {
                update.nombreProducto = req.body.productos[i].nombreProducto.toUpperCase();
            }
            if (req.body.productos[i].categoria) {
                update.categoria = req.body.productos[i].categoria.toUpperCase();
            }
            if (req.body.productos[i].subcategoria) {
                update.subcategoria = req.body.productos[i].subcategoria.toUpperCase();
            }
            if (req.body.productos[i].stock) {
                update.stock = req.body.productos[i].stock;
            }
            if (req.body.productos[i].unidadMedida) {
                update.unidadMedida = req.body.productos[i].unidadMedida.toUpperCase();
            }
            if (req.body.productos[i].codigoProveedor) {
                update.codigoProveedor = req.body.productos[i].codigoProveedor;
            }
            if (req.body.productos[i].vigencia) {
                update.vigencia = req.body.productos[i].vigencia
            }

            Producto.findByIdAndUpdate(req.body.productos[i].idProducto, update, { new: true }, (err, success) => {
                if (err) {
                    console.log(hoy + ' La funcion de actualizacion de producto devolvio un error');
                    console.log(hoy + ' ' + err.message);
                    return res.json({
                        ok: false,
                        message: 'La funcion de actualizacion de producto devolvio un error'
                    });
                }

                console.log(hoy + ' La actualizacion de datos del producto finalizo correctamente');
            });
            i++;
        }
        console.log(hoy + ' El proceso de actualizacion finalizo');
        res.json({
            ok: true,
            message: 'La actualizacion termino correctamente'
        });
    }
});


//// Metodo que permite obtener todos los productos que se encuentran vigentes a una fecha de entrega
app.get('/producto/listar_productos_vigentes/', async function(req, res) {

    let hoy = new Date();
    let fecha = new Date(req.query.fecha);
    Proveedor.findOne({ '_id': req.query.idProveedor })
        //.populate('productos_')
        .populate({ path: 'productos', populate: { path: 'subProductos.subProducto', select: 'nombreProducto precioProveedorBulto precioSugeridoBulto precioProveedorUnidad precioSugeridoUnidad unidadMedida categoria subcategoria empaque unidadesPorEmpaque' } })
        // .select('')
        .exec((err, proveedorDB) => {
            if (err) {
                console.log(hoy + ' La busqueda de productos devolvio un error');
                console.log(hoy + ' ' + err.message);
                return res.json({
                    ok: false,
                    message: 'La busqueda de productos devolvio un error',
                    // categorias: null,
                    productos: null
                });
            }

            if (proveedorDB == null) {
                console.log('El proveedor no existe');
                return res.json({
                    ok: false,
                    message: 'El proveedor no existe',
                    productos: null

                });
            } else {
                if (proveedorDB.productos.length == 0) {
                    console.log(hoy + ' El proveedor no tiene cargado productos');
                    return res.json({
                        ok: false,
                        message: 'El proveedor no tiene cargado productos',
                        productos: null

                    });
                }

            }
            let i = 0;
            let hasta = proveedorDB.productos.length;
            let productos_ = [];
            while (i < hasta) {
                console.log('FB: ' + fecha);
                console.log('FV: ' + proveedorDB.productos[i].vigencia);
                if (proveedorDB.productos[i].vigencia.toString().trim() == fecha.toString().trim()) {
                    console.log('Las fechas coinciden. Se agrega el producto');
                    productos_.push(proveedorDB.productos[i]);
                }
                i++;
            }
            return res.json({
                ok: true,
                productos: productos_
            });

        });
});



app.post('/producto/obtener_producto/', async function(req, res) {

    Producto.findOne({ _id: req.body.idProducto })
        .exec(async(err, producto) => {
            if (err) {
                console.log('La busqueda de un producto por su id ( ' + req.body.idProducto + ' ) produjo un error');
                console.log(err.message);
                return res.json({
                    ok: false,
                    message: 'La busqueda de un producto por su id produjo un error',
                    producto: null
                });
            }

            if (producto == null) {
                console.log('La buesqueda de un producto por su id ( ' + req.body.idProducto + ' ) no devolvio resultados');
                return res.json({
                    ok: false,
                    message: 'La busqueda de un producto por su id ( ' + req.body.idProducto + ' ) no devolvio resultados',
                    producto: null
                });
            }

            res.json({
                ok: true,
                message: 'Devolviendo resultado',
                producto
            });
        });
});

app.get('/producto/obtener_productos/', async function(req, res) {
    let hoy = new Date();
    Proveedor.findOne({ '_id': req.query.idProveedor })
        //.populate('productos_')
        .populate({ path: 'productos', populate: { path: 'subProductos.subProducto', select: 'nombreProducto precioProveedorBulto precioSugeridoBulto precioProveedorUnidad precioSugeridoUnidad unidadMedida categoria subcategoria empaque unidadesPorEmpaque' } })
        // .select('')
        .exec((err, proveedorDB) => {
            if (err) {
                console.log(hoy + ' La busqueda de productos devolvio un error');
                console.log(hoy + ' ' + err.message);
                return res.json({
                    ok: false,
                    message: 'La busqueda de productos devolvio un error',
                    // categorias: null,
                    productos: null
                });
            }

            if (!proveedorDB) {
                if (proveedorDB.productos.lenght == 0) {
                    console.log(hoy + ' El proveedor no tiene cargado productos');
                    return res.json({
                        ok: false,
                        message: 'El proveedor no tiene cargado productos',
                        // categorias: null,
                        productos: null

                    });
                }

            }



            let productos = proveedorDB.productos;
            return res.json({
                ok: true,
                productos
            });

        });
});




app.post('/producto/cargar_imagenes/', async function(req, res) {
    let hoy = new Date();
    for (var i in req.body.imagenes) {
        hoy = new Date();
        let imagenProducto = new ImagenProducto({
            formato: req.body.imagenes[i].extension
        });

        if (req.body.imagenes[i].extension == 'png' || req.body.imagenes[i].extension == 'jpg' || req.body.imagenes[i].extension == 'jpeg') {
            console.log(hoy + ' Paso la validacion de formato de imagen');
            var target_path = process.env.UrlImagenProducto + imagenProducto._id + '.' + req.body.imagenes[i].extension; // hacia donde subiremos nuestro archivo dentro de nuestro servidor
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
                imagenProducto.url = 'http://www.bintelligence.net/imagenes_productos/' + imagenProducto._id + '.' + req.body.imagenes[i].extension;
                imagenProducto.nombre = imagenProducto._id;

                console.log(hoy + ' Se esta por guardar el registro de la imagen');
                try {
                    imagenProducto.save((error, imagen_) => {
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

app.post('/producto/actualizar/', async function(req, res) {
    let hoy = new Date();
    if (req.body.productos) {
        for (var i in req.body.productos) {
            let update = {};
            let historiaCambioPrecioProveedor = new HistoriaPrecioProveedor();
            let historiaCambioPrecioSugerido = new HistoriaPrecioSugerido();
            if (req.body.productos[i].precioProveedor) {

                update.precioProveedor = req.body.productos[i].precioProveedor;

                historiaCambioPrecioProveedor.precio = req.body.productos[i].precioProveedor
                historiaCambioPrecioProveedor.save();
                Producto.findByIdAndUpdate(req.body.productos[i].idProducto, {
                        $push: {
                            historialPrecioProveedor: historiaCambioPrecioProveedor._id
                        }
                    },
                    async function(err, success) {
                        if (err) {
                            console.log(hoy + ' La funcion de actualizacion del precio proveedor devolvio un error');
                            console.log(hoy + ' ' + err.message);
                            return res.json({
                                ok: false,
                                message: 'La funcion de actualizacion del precio proveedor devolvio un error'
                            });
                        }
                        console.log(hoy + ' Se termino la actualizacion del precio proveedor');
                    });
            }
            if (req.body.productos[i].precioSugerido) {
                update.precioSugerido = req.body.productos[i].precioSugerido;

                historiaCambioPrecioSugerido.precio = req.body.productos[i].precioSugerido;
                historiaCambioPrecioSugerido.save();
                Producto.findByIdAndUpdate(req.body.productos[i].idProducto, {
                        $push: {
                            historiaPrecioSugerido: historiaCambioPrecioSugerido._id
                        }
                    },
                    async function(err, success) {
                        if (err) {
                            console.log(hoy + ' La funcion de actualizacion del precio sugerido devolvio un error');
                            console.log(hoy + ' ' + err.message);
                            return res.json({
                                ok: false,
                                message: 'La funcion de actualizacion del precio sugerido devolvio un error'
                            });
                        }
                        console.log(hoy + ' Se termino la actualizacion del precio sugerido');
                    });
            }
            if (req.body.productos[i].nombreProducto) {
                update.nombreProducto = req.body.productos[i].nombreProducto.toUpperCase();
            }
            if (req.body.productos[i].categoria) {
                update.categoria = req.body.productos[i].categoria.toUpperCase();
            }
            if (req.body.productos[i].subcategoria) {
                update.subcategoria = req.body.productos[i].subcategoria.toUpperCase();
            }
            if (req.body.productos[i].stock) {
                update.stock = req.body.productos[i].stock;
            }
            if (req.body.productos[i].unidadMedida) {
                update.unidadMedida = req.body.productos[i].unidadMedida.toUpperCase();
            }
            if (req.body.productos[i].codigoProveedor) {
                update.codigoProveedor = req.body.productos[i].codigoProveedor;
            }
            if (req.body.productos[i].vigencia) {
                update.vigencia = req.body.productos[i].vigencia
            }

            Producto.findByIdAndUpdate(req.body.productos[i].idProducto, update, { new: true }, (err, success) => {
                if (err) {
                    console.log(hoy + ' La funcion de actualizacion de producto devolvio un error');
                    console.log(hoy + ' ' + err.message);
                    return res.json({
                        ok: false,
                        message: 'La funcion de actualizacion de producto devolvio un error'
                    });
                }

                console.log(hoy + ' La actualizacion de datos del producto finalizo correctamente');
            });
            i++;
        }
        console.log(hoy + ' El proceso de actualizacion finalizo');
        res.json({
            ok: true,
            message: 'La actualizacion termino correctamente'
        });
    }
});




app.post('/producto/reducir_stock/', async function(req, res) {

    let hoy = new Date();
    try {
        Producto.findOne({ _id: req.body.idProducto })
            .exec(async(err, producto) => {
                if (err) {
                    console.log(hoy + ' La busqueda de producto para actualizar el stock fallo');
                    console.log(err.message + ' ' + err.message);
                    return res.json({
                        ok: false,
                        message: 'La busqueda de producto para actualizar el stock fallo'
                    });
                }
                if (producto == null) {
                    console.log(hoy + ' La busqueda de un producto para su actualizacion no devolvio resultado');
                    console.log(hoy + ' Id buscado: ' + req.body.idProducto);
                    return res.json({
                        ok: false,
                        message: 'La busqueda de un producto para su actualizacion no devolvio resultado'
                    });
                }

                // if ((producto.stock > 0) || (producto.stock < req.body.valor)) {

                let nuevoStock = producto.stock - req.body.valor;
                Producto.findOneAndUpdate({ _id: req.body.idProducto }, {
                        $set: {
                            stock: nuevoStock
                        }
                    },
                    async function(errU, exito) {
                        if (errU) {
                            console.log(hoy + ' La actulizacion del stock fallo');
                            console.log(hoy + ' ' + errU.message);
                            return res.json({
                                ok: false,
                                message: 'La actulizacion del stock fallo'
                            });
                        }

                        res.json({
                            ok: true,
                            message: 'Actualizacion completada'
                        });
                    });
                // } else {
                //     console.log(hoy + ' El producto no tiene stock suficiente para decrementar');
                //     return res.json({
                //         ok: false,
                //         message: 'El producto no tiene stock suficiente para decrementar'
                //     });
                // }

            });

    } catch (e) {
        console.log(hoy + ' Fallo la ejecucion de una rutina');
        console.log(hoy + ' ' + e.message);
        return res.json({
            ok: false,
            message: 'Fallo la ejecucion de una rutina'
        });
    }
})



module.exports = app;