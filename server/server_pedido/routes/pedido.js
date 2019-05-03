const express = require('express');
const app = express();

const Pedido = require('../models/pedido');
const funciones = require('../../middlewares/funciones');
const DetallePedido = require('../models/detallePedido');
// const aut = require('../../middlewares/autenticacion');
const Alias = require('../../server_entidades/models/alias');
const Proveedor = require('../../server_entidades/models/proveedor');
const Preferencia = require('../../server_stock/models/preferencia');


app.post('/pedido/nuevo/', async function(req, res) {
    console.log('Nuevo pedido recibido');
    let hoy = new Date();
    let detalles = [];
    let montoTotalPedido = 0.0;
    let cantidadProductos = 0;
    if (req.body.pedidos) {


        for (var p in req.body.pedidos) {
            detalles = [];
            montoTotalPedido = 0.0;
            cantidadProductos = 0;
            for (var i in req.body.pedidos[p].productos) {
                let productoF = await funciones.buscarProductoPorId(req.body.pedidos[p].productos[i]._id);
                if (productoF.ok) {
                    let detallePedido = new DetallePedido({
                        producto_: req.body.pedidos[p].productos[i]._id,
                        nombreProducto: productoF.producto.nombreProducto,
                        //nombreProducto: req.body.pedidos[p].productos[i].nombreProducto,
                        cantidadPedido: req.body.pedidos[p].productos[i].cantidad,
                        precioVenta: productoF.producto.precioPublico,
                        // precioVenta: req.body.pedidos[p].productos[i].precioVenta,
                        // empaque: req.body.pedidos[p].productos[i].empaque
                        empaque: productoF.producto.empaque
                    });
                    cantidadProductos++;
                    if (req.body.pedidos[p].productos[i].preferencias) {
                        for (var pref in req.body.pedidos[p].productos[i].preferencias) {
                            let preferencia = new Preferencia({
                                agrega: req.body.pedidos[p].productos[i].preferencias[pref].agrega,
                                subProducto: req.body.pedidos[p].productos[i].preferencias[pref].subProducto,
                                cantidad: req.body.pedidos[p].productos[i].preferencias[pref].cantidad
                            });
                            preferencia.save();
                            detallePedido.preferencias.push(preferencia._id);
                        }
                    }
                    montoTotalPedido = montoTotalPedido + (req.body.pedidos[p].productos[i].cantidad * req.body.pedidos[p].productos[i].precioVenta);
                    detallePedido.save();
                    detalles.push(detallePedido._id);
                }

            }



            let pedido = new Pedido({
                proveedor: req.body.pedidos[p].proveedor,
                //tipoEntrega: req.body.pedidos[p].tipoEntrega,
                fechaEntrega: req.body.pedidos[p].fechaEntrega,
                detallePedido: detalles,
                estadoPedido: 'PEDIDO SOLICITADO',
                comentario: req.body.pedidos[p].comentario,
                montoTotalPedido: montoTotalPedido,
                cantidadTotalPedido: cantidadProductos
                    ////////estos campos se deben borrar en el futuro
                    ,
                nombreCliente: req.body.pedidos[p].nombreCliente,
                apellidoCliente: req.body.pedidos[p].apellidoCliente,
                localidadEntrega: req.body.pedidos[p].localidadEntrega,
                barrioEntrega: req.body.pedidos[p].barrioEntrega,
                calleEntrega: req.body.pedidos[p].calleEntrega,
                numeroCasaEntrega: req.body.pedidos[p].numeroCasaEntrega,
                pisoEntrega: req.body.pedidos[p].pisoEntrega,
                departamentoEntrega: req.body.pedidos[p].departamentoEntrega,
                ordenEntrega: req.body.pedidos[p].ordenEntrega,
                horarioEntrega: req.body.pedidos[p].horarioEntrega,
                notaPicking: req.body.pedidos[p].notaPicking
            });
            // if (req.body.tipoEntrega == 'ENVIO A DOMICILIO') {
            //     pedido.costoEntrega = req.body.costoEnvio;
            // } else {
            //     pedido.costoEntrega = 0.0;
            // }
            // let respuestaMensaje = funciones.nuevoMensaje({
            //     metodo: '/pedido/nuevo/',
            //     tipoError: 0,
            //     parametros: '$comercio',
            //     valores: req.body.comercio,
            //     buscar: 'SI',
            //     esPush: true,
            //     destinoEsProveedor: true,
            //     destino: req.body.proveedor
            // });

            pedido.save();
        }
        return res.json({
            ok: true,
            message: 'El pedido ha sido registrado'
        });
    } else {
        return res.json({
            ok: false,
            message: 'No hay pedidos para registrar'
        });
    }
});

app.get('/pedidos/listar_pedidos_proveedor/', async function(req, res) {
    console.log('Proveedor a buscar: ' + req.query.idProveedor);
    let campos = 'tipoEntrega' +
        ' cantidadTotalPedido' +
        ' montoTotalPedido' +
        ' apellidoCliente' +
        ' nombreCliente' +
        ' notaPicking' +
        ' localidadEntrega' +
        ' barrioEntrega' +
        ' calleEntrega' +
        ' numeroCasaEntrega' +
        ' pisoEntrega' +
        ' departamentoEntrega' +
        ' horarioEntrega' +
        ' comentario' +
        ' ordenEntrega' +
        ' detallePedido';
    Pedido.find({ proveedor: req.query.idProveedor }, campos)
        .populate({ path: 'detallePedido', select: 'nombreProducto cantidadPedido', populate: { path: 'preferencias', select: 'agrega subProducto cantidad', populate: { path: 'subProducto', select: 'nombreProducto' } } })
        .exec(async(err, pedidos) => {
            if (err) {
                console.log('La consulta de pedidos de un proveedor devolvio un error');
                console.log(err.message);
                return res.json({
                    ok: false,
                    message: 'La consulta de pedidos de un proveedor devolvio un error',
                    pedidos: null
                });
            }
            if (pedidos.length == 0) {
                console.log('La consulta de pedidos de un proveedor no devolvio resultados');
                return res.json({
                    ok: false,
                    message: 'La consulta de pedidos de un proveedor no devolvio resultados',
                    pedidos: null
                });
            }

            res.json({
                ok: true,
                message: 'Devolviendo pedidos de un proveedor',
                pedidos
            });
        });
});

app.get('/pedidos/armar_resumen_productos/', async function(req, res) {

    let campos = 'tipoEntrega' +
        ' cantidadTotalPedido' +
        ' montoTotalPedido' +
        ' apellidoCliente' +
        ' nombreCliente' +
        ' localidadEntrega' +
        ' barrioEntrega' +
        ' calleEntrega' +
        ' numeroCasaEntrega' +
        ' pisoEntrega' +
        ' departamentoEntrega' +
        ' horarioEntrega' +
        ' comentario' +
        ' ordenEntrega' +
        ' detallePedido';
    Pedido.find({ proveedor: req.query.idProveedor })
        .populate({ path: 'detallePedido', populate: { path: 'preferencias', populate: { path: 'subProducto' } } })
        .populate({ path: 'detallePedido', populate: { path: 'producto_', populate: { path: 'subProductos.subProducto' } } })
        .exec(async(err, pedidos) => {
            if (err) {
                console.log('La consulta de pedidos de un proveedor devolvio un error');
                console.log(err.message);
                return res.json({
                    ok: false,
                    message: 'La consulta de pedidos de un proveedor devolvio un error',
                    pedidos: null
                });
            }
            if (pedidos.length == 0) {
                console.log('La consulta de pedidos de un proveedor no devolvio resultados');
                return res.json({
                    ok: false,
                    message: 'La consulta de pedidos de un proveedor no devolvio resultados',
                    pedidos: null
                });
            }

            let i = 0;
            let hasta = pedidos.length;

            //primero armo la lista de productos
            let productos = [];
            while (i < hasta) {
                let j = 0;
                let h = pedidos[i].detallePedido.length;
                while (j < h) {
                    // console.log('--------------');
                    // console.log('Mostrando el producto');
                    // console.log(pedidos[i].detallePedido[j].producto_);
                    let k = 0;
                    let pSize = pedidos[i].detallePedido[j].producto_.subProductos.length;
                    // console.log('pSize: ' + pSize);
                    while (k < pSize) {
                        // console.log('Elementos agregados: ' + productos.length);
                        // console.log('-------------');
                        // console.log(pedidos[i].detallePedido[j].producto_.subProductos[k]);
                        if (productos.length == 0) {
                            productos.push({
                                id: pedidos[i].detallePedido[j].producto_.subProductos[k].subProducto._id,
                                nombre: pedidos[i].detallePedido[j].producto_.subProductos[k].subProducto.nombreProducto,
                                unidadMedida: pedidos[i].detallePedido[j].producto_.subProductos[k].subProducto.unidadMedida
                            });
                        } else {
                            //verifico que el producto no figure ya en el vector
                            let v = 0;
                            let existe = false;
                            while (v < productos.length) {
                                if (pedidos[i].detallePedido[j].producto_.subProductos[k].subProducto._id.toString().trim() == productos[v].id.toString().trim()) {
                                    existe = true;
                                    break;
                                }
                                v++;
                            }
                            if (!existe)
                                productos.push({
                                    id: pedidos[i].detallePedido[j].producto_.subProductos[k].subProducto._id,
                                    nombre: pedidos[i].detallePedido[j].producto_.subProductos[k].subProducto.nombreProducto,
                                    unidadMedida: pedidos[i].detallePedido[j].producto_.subProductos[k].subProducto.unidadMedida
                                });
                        }
                        k++;
                    }

                    k = 0;
                    pSize = pedidos[i].detallePedido[j].preferencias.length;
                    while (k < pSize) {
                        if (productos.length == 0) {
                            productos.push({
                                id: pedidos[i].detallePedido[j].preferencias[k].subProducto._id,
                                nombre: pedidos[i].detallePedido[j].preferencias[k].subProducto.nombreProducto,
                                unidadMedida: pedidos[i].detallePedido[j].preferencias[k].subProducto.unidadMedida
                            });
                        } else {
                            //verifico que el producto no figure ya en el vector
                            let v = 0;
                            let existe = false;
                            while (v < productos.length) {
                                // console.log('Comparando id de subproducto que viene en el pedido con el id del vector');
                                // console.log(pedidos[i].detallePedido[j].preferencias[k].subProducto._id + ' = ' + productos[v].id);
                                if (pedidos[i].detallePedido[j].preferencias[k].subProducto._id.toString().trim() == productos[v].id.toString().trim()) {
                                    // console.log('El id ya esta cargado');
                                    existe = true;
                                    break;
                                }
                                v++;
                            }
                            if (!existe) {
                                // console.log('El id no esta cargado, se agrega al vector');
                                productos.push({
                                    id: pedidos[i].detallePedido[j].preferencias[k].subProducto._id,
                                    nombre: pedidos[i].detallePedido[j].preferencias[k].subProducto.nombreProducto,
                                    unidadMedida: pedidos[i].detallePedido[j].preferencias[k].subProducto.unidadMedida
                                });
                            }


                        }
                        k++;
                    }
                    j++;
                }
                i++;
            }

            let detalle = [];
            let cantidad = 0;

            let index = 0;
            while (index < productos.length) {
                cantidad = 0;
                i = 0;
                while (i < hasta) {
                    let j = 0;
                    let h = pedidos[i].detallePedido.length;

                    while (j < h) {
                        //analizando una linea de detalle
                        let cantidadTemp = 0;
                        let k = 0;
                        let pSize = pedidos[i].detallePedido[j].producto_.subProductos.length;

                        while (k < pSize) {
                            //analizando el producto
                            let v = 0;
                            if (pedidos[i].detallePedido[j].producto_.subProductos[k].subProducto._id.toString().trim() == productos[index].id.toString().trim()) {
                                //es el producto que estoy buscando
                                cantidadTemp = cantidadTemp + (pedidos[i].detallePedido[j].cantidadPedido * pedidos[i].detallePedido[j].producto_.subProductos[k].cantidad);
                            }
                            k++;
                        }
                        //ya tengo la cantidad a pedir en una linea de detalle, ahora debo verificar que en las preferencias no se haya quitado
                        //ese producto del detalle
                        k = 0;
                        while (k < pedidos[i].detallePedido[j].preferencias.length) {
                            //analizando las preferencias en la linea de detalle
                            if (pedidos[i].detallePedido[j].preferencias[k].subProducto._id.toString().trim() == productos[index].id.toString().trim()) {
                                //es el producto, analizo si se quito o si se agrego
                                if (pedidos[i].detallePedido[j].preferencias[k].agrega) {
                                    //se debe sumar
                                    cantidadTemp = cantidadTemp + (pedidos[i].detallePedido[j].preferencias[k].cantidad);
                                } else {
                                    //hay que quitar el producto, queda analizar si se quita todo (0) o se quita solo una parte
                                    if (pedidos[i].detallePedido[j].preferencias[k].cantidad == 0) {
                                        //se debe quitar todo el producto
                                        cantidadTemp = 0;
                                    } else {
                                        //solo se debe quitar una parte
                                        cantidadTemp = cantidadTemp - (pedidos[i].detallePedido[j].preferencias[k].cantidad);
                                    }
                                }
                            }
                            k++;
                        }
                        //aqui debo guardar la cantidad de productos que se estan pidiendo
                        cantidad = cantidad + cantidadTemp;
                        j++;
                    }
                    i++;
                }
                //aqui cargo al cantidad a pedir en el vector
                productos[index].cantidadAPedir = cantidad;
                index++;
            }


            // i=0;
            // while(i < productos.length){
            //     console.log(productos[i]);
            //     i++;
            // }

            res.json({
                ok: true,
                message: 'Devolviendo pedidos de un proveedor',
                productos
            });
        });
});
// app.get('/pedido/listar_pedidos_comercio/', async function(req, res) {



//     Pedido.find({ comercio: req.query.idComercio })
//         .populate({ path: 'proveedor', select: 'entidad', populate: { path: 'entidad' } })
//         .populate({ path: 'comercio', select: 'entidad', populate: { path: 'entidad' } })
//         .populate('detallePedido')
//         .populate({ path: 'detallePedido', populate: { path: 'producto' } })
//         .sort({ fechaAlta: -1 })
//         .exec((err, pedidos) => {
//             if (err) {
//                 return res.json({
//                     ok: false,
//                     message: 'No se puede devolver la lista de pedidos. Error: ' + err.message
//                 });
//             }

//             if (!pedidos) {
//                 return res.json({
//                     ok: false,
//                     message: 'No hay pedidos para mostrar'
//                 });
//             }

//             if (pedidos.length <= 0) {
//                 return res.json({
//                     ok: false,
//                     message: 'No hay pedidos para mostrar'
//                 });
//             }

//             let hasta = pedidos.length;
//             let cursor = 0;
//             let pedidos_array = [];
//             while (cursor < hasta) {
//                 let tamanioDetalle = pedidos[cursor].detallePedido.length;
//                 let cursorDetalle = 0;
//                 let totalPedido = 0;
//                 while (cursorDetalle < tamanioDetalle) {
//                     // console.log('Mostrando el valor del detalle a analizar');
//                     // console.log('Id detalle: ' + pedidos[cursor].detallePedido[cursorDetalle]._id);
//                     // console.log('Id producto: ' + pedidos[cursor].detallePedido[cursorDetalle].producto._id);
//                     // console.log(pedidos[cursor].detallePedido[cursorDetalle].producto.precioProveedor);
//                     // console.log('Cantidad: ' + pedidos[cursor].detallePedido[cursorDetalle].cantidadPedido);
//                     if (pedidos[cursor].detallePedido[cursorDetalle].producto == null) {
//                         totalPedido = totalPedido + (pedidos[cursor].detallePedido[cursorDetalle].producto_.precioProveedor * pedidos[cursor].detallePedido[cursorDetalle].cantidadPedido);
//                     } else {
//                         totalPedido = totalPedido + (pedidos[cursor].detallePedido[cursorDetalle].producto.precioProveedor * pedidos[cursor].detallePedido[cursorDetalle].cantidadPedido);
//                     }
//                     // totalPedido = totalPedido + (pedidos[cursor].detallePedido[cursorDetalle].producto.precioProveedor * pedidos[cursor].detallePedido[cursorDetalle].cantidadPedido);
//                     cursorDetalle++;
//                 }
//                 let pedido = new Object({
//                     idPedido: pedidos[cursor]._id,
//                     proveedor: pedidos[cursor].proveedor,
//                     comercio: pedidos[cursor].comercio,
//                     tipoEntrega: pedidos[cursor].tipoEntrega,
//                     fechaEntrega: pedidos[cursor].fechaEntrega,
//                     activo: pedidos[cursor].activo,
//                     estadoPedido: pedidos[cursor].estadoPedido,
//                     estadoTerminal: pedidos[cursor].estadoTerminal,
//                     comentario: pedidos[cursor].comentario,
//                     puntoVentaEntrega: pedidos[cursor].puntoVentaEntrega,
//                     totalPedido: totalPedido,
//                     detallePedido: pedidos[cursor].detallePedido,
//                     comentarioCancelado: pedidos[cursor].comentarioCancelado,
//                     comercioPerteneceARedProveedor: pedidos[cursor].comercioPerteneceARedProveedor
//                 });
//                 pedidos_array.push(pedido);
//                 cursor++;
//             }

//             res.json({
//                 ok: true,
//                 pedidos_array
//             })

//         });

// });

app.get('/pedido/listar_pedidos_comercio_v2_stock/', async function(req, res) {

    let hoy = new Date();
    Pedido.find({ comercio: req.query.idComercio })
        .populate({ path: 'proveedor', select: 'entidad, contactos', populate: { path: 'entidad', populate: { path: 'domicilio' } } })
        .populate({ path: 'comercio', select: 'entidad', populate: { path: 'entidad' } })
        .populate({
            path: 'proveedor',
            select: 'entidad contactos',
            populate: {
                path: 'contactos',
                match: { tipoContacto: "Telefono Celular" }
            }
        })
        .populate('detallePedido')
        .populate({ path: 'detallePedido', populate: { path: 'producto_' } })
        .sort({ fechaAlta: -1 })
        .exec((err, pedidos) => {
            if (err) {
                console.log(hoy + ' La busqueda de pedidos de un comercio devolvio un error');
                console.log(hoy + ' ' + err.message);
                return res.json({
                    ok: false,
                    message: 'No se puede devolver la lista de pedidos. Error: ' + err.message,
                    pedidos: null
                });
            }

            if (!pedidos) {
                console.log(hoy + ' No hay pedidos para filtrar');
                return res.json({
                    ok: false,
                    message: 'No hay pedidos para mostrar',
                    pedidos: null
                });
            }

            if (pedidos.length <= 0) {
                console.log(hoy + ' No hay pedidos para filtrar');
                return res.json({
                    ok: false,
                    message: 'No hay pedidos para mostrar',
                    pedidos: null
                });
            }

            let hasta = pedidos.length;
            let cursor = 0;
            let pedidos_array = [];
            while (cursor < hasta) {
                let tamanioDetalle = pedidos[cursor].detallePedido.length;
                let cursorDetalle = 0;
                let totalPedido = 0;
                while (cursorDetalle < tamanioDetalle) {
                    // console.log('Mostrando el valor del detalle a analizar');
                    // console.log('Id detalle: ' + pedidos[cursor].detallePedido[cursorDetalle]._id);
                    // console.log('Id producto: ' + pedidos[cursor].detallePedido[cursorDetalle].producto._id);
                    // console.log(pedidos[cursor].detallePedido[cursorDetalle].producto.precioProveedor);
                    // console.log('Cantidad: ' + pedidos[cursor].detallePedido[cursorDetalle].cantidadPedido);
                    if (pedidos[cursor].detallePedido[cursorDetalle].producto == null) {
                        totalPedido = totalPedido + (pedidos[cursor].detallePedido[cursorDetalle].producto_.precioProveedor * pedidos[cursor].detallePedido[cursorDetalle].cantidadPedido);
                    } else {
                        totalPedido = totalPedido + (pedidos[cursor].detallePedido[cursorDetalle].producto.precioProveedor * pedidos[cursor].detallePedido[cursorDetalle].cantidadPedido);
                    }
                    // totalPedido = totalPedido + (pedidos[cursor].detallePedido[cursorDetalle].producto_.precioProveedor * pedidos[cursor].detallePedido[cursorDetalle].cantidadPedido);
                    cursorDetalle++;
                }
                let pedido = new Object({
                    idPedido: pedidos[cursor]._id,
                    proveedor: pedidos[cursor].proveedor,
                    comercio: pedidos[cursor].comercio,
                    tipoEntrega: pedidos[cursor].tipoEntrega,
                    fechaEntrega: pedidos[cursor].fechaEntrega,
                    activo: pedidos[cursor].activo,
                    estadoPedido: pedidos[cursor].estadoPedido,
                    estadoTerminal: pedidos[cursor].estadoTerminal,
                    comentario: pedidos[cursor].comentario,
                    puntoVentaEntrega: pedidos[cursor].puntoVentaEntrega,
                    totalPedido: totalPedido,
                    detallePedido: pedidos[cursor].detallePedido,
                    comentarioCancelado: pedidos[cursor].comentarioCancelado,
                    comercioPerteneceARedProveedor: pedidos[cursor].comercioPerteneceARedProveedor
                });
                pedidos_array.push(pedido);
                cursor++;
            }

            res.json({
                ok: true,
                message: 'Pedidos encontrados',
                pedidos: pedidos_array
            })

        });

});


// app.get('/pedido/listar_pedidos_proveedor/', async function(req, res) {

//     // console.log('comercio: ' + req.query.idComercio);
//     let hoy = new Date();

//     Pedido.find({ proveedor: req.query.idProveedor })
//         .populate({ path: 'proveedor', select: 'entidad', populate: { path: 'entidad' } })
//         .populate({ path: 'comercio', select: '_id entidad', populate: { path: 'entidad' } })
//         .populate({ path: 'comercio', select: '_id entidad', populate: { path: 'entidad', populate: { path: 'domicilio' } } })
//         .populate({
//             path: 'comercio',
//             select: 'entidad contactos',
//             populate: {
//                 path: 'contactos',
//                 match: { tipoContacto: "Telefono Celular" }
//             }
//         })

//     // .populate({
//     //     path: 'rol',
//     //     match: { precedencia: { $gt: idRol } }
//     // })
//     .populate('detallePedido')
//         .populate({ path: 'detallePedido', populate: { path: 'producto' } })
//         .populate({ path: 'detallePedido', populate: { path: 'producto_' } })
//         .sort({ fechaAlta: -1 })
//         .exec(async(err, pedidos) => {
//             if (err) {
//                 console.log(hoy + ' La busqueda de pedidos de un proveedor devolvio un error');
//                 console.log(hoy + ' ' + err.message);
//                 return res.json({
//                     ok: false,
//                     message: 'No se puede devolver la lista de pedidos. Error: ' + err.message,
//                     pedidos: null
//                 });
//             }

//             if (!pedidos) {
//                 console.log(hoy + ' No hay pedidos para el proveedor');
//                 return res.json({
//                     ok: false,
//                     message: 'No hay pedidos para mostrar',
//                     pedidos: null
//                 });
//             }

//             if (pedidos.length <= 0) {
//                 console.log(hoy + ' No hay pedidos para el proveedor');
//                 return res.json({
//                     ok: false,
//                     message: 'No hay pedidos para mostrar',
//                     pedidos: null
//                 });
//             }

//             let hasta = pedidos.length;
//             let cursor = 0;
//             let pedidos_array = [];
//             while (cursor < hasta) {
//                 let tamanioDetalle = pedidos[cursor].detallePedido.length;
//                 let cursorDetalle = 0;
//                 let totalPedido = 0;
//                 while (cursorDetalle < tamanioDetalle) {
//                     // console.log('El detalle a analizar es');
//                     // console.log(pedidos[cursor].detallePedido[cursorDetalle]);
//                     if (pedidos[cursor].detallePedido[cursorDetalle].producto == null) {
//                         // console.log('Producto es null');
//                         // console.log('Entonces, el importe a sumar es ' + pedidos[cursor].detallePedido[cursorDetalle].producto_.precioProveedor);
//                         totalPedido = totalPedido + (pedidos[cursor].detallePedido[cursorDetalle].producto_.precioProveedor * pedidos[cursor].detallePedido[cursorDetalle].cantidadPedido);
//                     } else {
//                         // console.log('Producto_ es null');
//                         // console.log('Entonces, el importe a sumar es ' + pedidos[cursor].detallePedido[cursorDetalle].producto.precioProveedor);
//                         totalPedido = totalPedido + (pedidos[cursor].detallePedido[cursorDetalle].producto.precioProveedor * pedidos[cursor].detallePedido[cursorDetalle].cantidadPedido);
//                     }
//                     // totalPedido = totalPedido + (pedidos[cursor].detallePedido[cursorDetalle].producto.precioProveedor * pedidos[cursor].detallePedido[cursorDetalle].cantidadPedido);
//                     cursorDetalle++;
//                 }
//                 let entidad_ = new Object({
//                     _id: pedidos[cursor].comercio.entidad._id,
//                     cuit: pedidos[cursor].comercio.entidad.cuit,
//                     razonSocial: pedidos[cursor].comercio.entidad.razonSocial,
//                     domicilio: pedidos[cursor].comercio.entidad.domicilio
//                 });




//                 //buscar alias
//                 // console.log('Se esta por buscar el alias del comercio: ' + pedidos[cursor].comercio._id);
//                 let alias = await funciones.buscarAlias(req.query.idProveedor, pedidos[cursor].comercio._id);
//                 // console.log('La consulta de alias devolvio');
//                 // console.log(alias);
//                 if (alias.ok) {
//                     if (alias.alias != null) {
//                         if (alias.alias != '') {
//                             // console.log('Asignando el alias a la razon social');
//                             entidad_.razonSocial = pedidos[cursor].comercio.entidad.razonSocial + '(' + alias.alias + ')';
//                             // console.log('Razon social con alias: ' + entidad_.razonSocial);
//                         }
//                     }
//                 }

//                 let comercio_ = new Object({
//                     _id: pedidos[cursor].comercio._id,
//                     entidad: entidad_,
//                     contactos: pedidos[cursor].comercio.contactos
//                 });

//                 let pedido = new Object({
//                     idPedido: pedidos[cursor]._id,
//                     proveedor: pedidos[cursor].proveedor,
//                     //comercio: pedidos[cursor].comercio,
//                     comercio: comercio_,
//                     tipoEntrega: pedidos[cursor].tipoEntrega,
//                     fechaEntrega: pedidos[cursor].fechaEntrega,
//                     activo: pedidos[cursor].activo,
//                     estadoPedido: pedidos[cursor].estadoPedido,
//                     estadoTerminal: pedidos[cursor].estadoTerminal,
//                     comentario: pedidos[cursor].comentario,
//                     puntoVentaEntrega: pedidos[cursor].puntoVentaEntrega,
//                     totalPedido: totalPedido,
//                     detallePedido: pedidos[cursor].detallePedido,
//                     comentarioCancelado: pedidos[cursor].comentarioCancelado,
//                     comercioPerteneceARedProveedor: pedidos[cursor].comercioPerteneceARedProveedor
//                 });

//                 pedidos_array.push(pedido);
//                 cursor++;
//             }

//             res.json({
//                 ok: true,
//                 message: 'Pedidos encontrados',
//                 pedidos: pedidos_array
//             });

//         });

// });

app.get('/pedido/listar_pedidos_proveedor_v2_stock/', async function(req, res) {

    let hoy = new Date();


    Pedido.find({ proveedor: req.query.idProveedor })
        .populate({ path: 'proveedor', select: 'entidad', populate: { path: 'entidad' } })
        // .populate({ path: 'comercio', select: '_id entidad', populate: { path: 'entidad' } })
        .populate({ path: 'comercio', select: '_id entidad', populate: { path: 'entidad', populate: { path: 'domicilio' } } })
        .populate({
            path: 'comercio',
            select: 'entidad contactos',
            populate: {
                path: 'contactos',
                match: { tipoContacto: "Telefono Celular" }
            }
        })

    // .populate({
    //     path: 'rol',
    //     match: { precedencia: { $gt: idRol } }
    // })
    .populate('detallePedido')
        .populate({ path: 'detallePedido', populate: { path: 'producto' } })
        .populate({ path: 'detallePedido', populate: { path: 'producto_' } })
        .sort({ fechaAlta: -1 })
        .exec(async(err, pedidos) => {
            if (err) {
                return res.json({
                    ok: false,
                    message: 'No se puede devolver la lista de pedidos. Error: ' + err.message
                });
            }

            if (!pedidos) {
                return res.json({
                    ok: false,
                    message: 'No hay pedidos para mostrar'
                });
            }

            if (pedidos.length <= 0) {
                return res.json({
                    ok: false,
                    message: 'No hay pedidos para mostrar'
                });
            }

            let hasta = pedidos.length;
            let cursor = 0;
            let pedidos_array = [];
            while (cursor < hasta) {
                let tamanioDetalle = pedidos[cursor].detallePedido.length;
                let cursorDetalle = 0;
                let totalPedido = 0;
                while (cursorDetalle < tamanioDetalle) {
                    // console.log('Id de detalle a analizar: ' + pedidos[cursor].detallePedido[cursorDetalle]._id);
                    if (pedidos[cursor].detallePedido[cursorDetalle].producto == null) {

                        // console.log('Producto es null');
                        // console.log('Entonces, el importe a sumar es ' + pedidos[cursor].detallePedido[cursorDetalle].producto_.precioProveedor);
                        totalPedido = totalPedido + (pedidos[cursor].detallePedido[cursorDetalle].producto_.precioProveedor * pedidos[cursor].detallePedido[cursorDetalle].cantidadPedido);
                    } else {
                        // console.log('Producto_ es null');
                        // console.log('Entonces, el importe a sumar es ' + pedidos[cursor].detallePedido[cursorDetalle].producto.precioProveedor);
                        totalPedido = totalPedido + (pedidos[cursor].detallePedido[cursorDetalle].producto.precioProveedor * pedidos[cursor].detallePedido[cursorDetalle].cantidadPedido);
                    }

                    cursorDetalle++;
                }
                console.log('EL pedido a analizar es: ' + pedidos[cursor]._id);
                let entidad_ = new Object({
                    _id: pedidos[cursor].comercio.entidad._id,
                    cuit: pedidos[cursor].comercio.entidad.cuit,
                    razonSocial: pedidos[cursor].comercio.entidad.razonSocial,
                    domicilio: pedidos[cursor].comercio.entidad.domicilio
                        // alias: '-',
                        // idAlias: '-'
                });




                //buscar alias
                // console.log('Se esta por buscar el alias del comercio: ' + pedidos[cursor].comercio._id);
                let alias = await funciones.buscarAlias(req.query.idProveedor, pedidos[cursor].comercio._id);
                // console.log('La consulta de alias devolvio');
                // console.log(alias);
                let alias_ = '';
                let idAlias_ = ';'
                if (alias.ok) {
                    if (alias.alias != null) {
                        if (alias.alias != '') {
                            alias_ = alias.alias;
                            idAlias_ = alias.idAlias;
                            // console.log('Asignando el alias a la razon social');
                            // entidad_.razonSocial = pedidos[cursor].comercio.entidad.razonSocial + '(' + alias.alias + ')';
                            // entidad_.alias = alias.alias;
                            // entidad_.idAlias = alias.idAlias
                            // console.log('Razon social con alias: ' + entidad_.razonSocial);
                        }
                    }
                }

                let comercio_ = new Object({
                    _id: pedidos[cursor].comercio._id,
                    entidad: entidad_,
                    contactos: pedidos[cursor].comercio.contactos,
                    alias: alias_,
                    idAlias: idAlias_
                });

                let pedido = new Object({
                    idPedido: pedidos[cursor]._id,
                    proveedor: pedidos[cursor].proveedor,
                    //comercio: pedidos[cursor].comercio,
                    comercio: comercio_,
                    tipoEntrega: pedidos[cursor].tipoEntrega,
                    fechaEntrega: pedidos[cursor].fechaEntrega,
                    activo: pedidos[cursor].activo,
                    estadoPedido: pedidos[cursor].estadoPedido,
                    estadoTerminal: pedidos[cursor].estadoTerminal,
                    comentario: pedidos[cursor].comentario,
                    puntoVentaEntrega: pedidos[cursor].puntoVentaEntrega,
                    totalPedido: totalPedido,
                    detallePedido: pedidos[cursor].detallePedido,
                    comentarioCancelado: pedidos[cursor].comentarioCancelado,
                    comercioPerteneceARedProveedor: pedidos[cursor].comercioPerteneceARedProveedor
                });

                pedidos_array.push(pedido);
                cursor++;
            }

            res.json({
                ok: true,
                pedidos_array
            })

        });

});

app.get('/pedido/listar_pedidos_pendientes/', async function(req, res) {

    // console.log('comercio: ' + req.query.idComercio);

    Pedido.find({ proveedor: req.query.idProveedor })
        .populate({ path: 'proveedor', select: 'entidad', populate: { path: 'entidad' } })
        .populate({ path: 'comercio', select: 'entidad', populate: { path: 'entidad' } })
        .populate('detallePedido')
        .populate({ path: 'detallePedido', populate: { path: 'producto' } })
        .populate({ path: 'detallePedido', populate: { path: 'producto_' } })
        .where({ estadoPedido: 'PEDIDO SOLICITADO' })
        .sort({ fechaAlta: -1 })
        .exec(async(err, pedidos) => {
            if (err) {
                return res.json({
                    ok: false,
                    message: 'No se puede devolver la lista de pedidos. Error: ' + err.message
                });
            }

            if (!pedidos) {
                return res.json({
                    ok: false,
                    message: 'No hay pedidos para mostrar'
                });
            }

            let hasta = pedidos.length;
            let cursor = 0;
            let pedidos_array = [];
            while (cursor < hasta) {
                let tamanioDetalle = pedidos[cursor].detallePedido.length;
                let cursorDetalle = 0;
                let totalPedido = 0;
                while (cursorDetalle < tamanioDetalle) {
                    if (pedidos[cursor].detallePedido[cursorDetalle].producto == null) {
                        totalPedido = totalPedido + (pedidos[cursor].detallePedido[cursorDetalle].producto_.precioProveedor * pedidos[cursor].detallePedido[cursorDetalle].cantidadPedido);
                    } else {
                        totalPedido = totalPedido + (pedidos[cursor].detallePedido[cursorDetalle].producto.precioProveedor * pedidos[cursor].detallePedido[cursorDetalle].cantidadPedido);
                    }
                    // totalPedido = totalPedido + (pedidos[cursor].detallePedido[cursorDetalle].producto.precioProveedor * pedidos[cursor].detallePedido[cursorDetalle].cantidadPedido);
                    cursorDetalle++;
                }

                let entidad_ = new Object({
                    _id: pedidos[cursor].comercio.entidad._id,
                    cuit: pedidos[cursor].comercio.entidad.cuit,
                    razonSocial: pedidos[cursor].comercio.entidad.razonSocial,
                    domicilio: pedidos[cursor].comercio.entidad.domicilio
                });


                let alias = await funciones.buscarAlias(req.query.idProveedor, pedidos[cursor].comercio._id);
                // console.log('La consulta de alias devolvio');
                // console.log(alias);
                if (alias.ok) {
                    if (alias.alias != '') {
                        // console.log('Asignando el alias a la razon social');
                        // pedidos[cursor].comercio.entidad.razonSocial = pedidos[cursor].comercio.entidad.razonSocial + '(' + alias.alias + ')';
                        entidad_.razonSocial = pedidos[cursor].comercio.entidad.razonSocial + '(' + alias.alias + ')';
                    }

                }

                let comercio_ = new Object({
                    _id: pedidos[cursor].comercio._id,
                    entidad: entidad_,
                    contactos: pedidos[cursor].comercio.contactos
                });

                let pedido = new Object({
                    idPedido: pedidos[cursor]._id,
                    proveedor: pedidos[cursor].proveedor,
                    // comercio: pedidos[cursor].comercio,
                    comercio: comercio_,
                    tipoEntrega: pedidos[cursor].tipoEntrega,
                    fechaEntrega: pedidos[cursor].fechaEntrega,
                    activo: pedidos[cursor].activo,
                    estadoPedido: pedidos[cursor].estadoPedido,
                    estadoTerminal: pedidos[cursor].estadoTerminal,
                    comentario: pedidos[cursor].comentario,
                    puntoVentaEntrega: pedidos[cursor].puntoVentaEntrega,
                    totalPedido: totalPedido,
                    detallePedido: pedidos[cursor].detallePedido,
                    fechaAlta: pedidos[cursor].fechaAlta,
                    comercioPerteneceARedProveedor: pedidos[cursor].comercioPerteneceARedProveedor
                });
                pedidos_array.push(pedido);
                cursor++;
            }

            res.json({
                ok: true,
                pedidos_array
            })

        });

});


app.post('/pedido/aceptar/', async function(req, res) {
    var hoy = new Date();
    //cambiar el estado al pedido
    Pedido.findOneAndUpdate({ '_id': req.body.idPedido, estadoTerminal: false }, { $set: { estadoPedido: 'ACEPTADO', fechaCambioEstado: hoy.getDate() } },
        function(err, pedido) {
            if (err) {
                return res.json({
                    ok: false,
                    message: 'La actualizacion produjo un error. Error: ' + err.message
                });
            }

            if (pedido == null) {
                return res.json({
                    ok: false,
                    message: 'No se puede modificar el estado de un pedido finalizado'
                });
            }

            // console.log('Datos de la aceptacion de pedido');
            // console.log(exito);
            // console.log('Preparando el envio de push;')
            // console.log('Parametros:');
            // console.log('Proveedor: ' + exito.proveedor);
            // console.log('Comercio: ' + exito.comercio);
            let respuestaMensajePush = funciones.nuevoMensaje({
                metodo: '/pedido/aceptar/',
                tipoError: 0,
                parametros: '$proveedor',
                valores: pedido.proveedor,
                buscar: 'SI',
                esPush: true,
                destinoEsProveedor: false,
                destino: pedido.comercio
            });

            //verifico si el comercio pertenece a la red del proveedor
            console.log(hoy + ' verifico si el comercio pertenece a la red del proveedor');
            console.log(hoy + ' ' + pedido.comercioPerteneceARedProveedor);
            if (!pedido.comercioPerteneceARedProveedor) {
                //debo agregar el comercio a la red del proveedor
                let alias = new Alias({
                    esProveedor: false,
                    comercio: pedido.comercio,
                    alias: req.body.alias,
                    cantidadPedidosAprobados: 1
                });
                alias.save();


                Proveedor.findOneAndUpdate({ _id: pedido.proveedor }, { $push: { red: alias._id } },
                    function(errP, exito) {
                        if (errP) {
                            console.log(hoy + ' La funcion de agregar proveedor a la red devolvio un error');
                            console.log(hoy + ' ' + errP.message);
                            return res.json({
                                ok: false,
                                message: 'La funcion de agregar proveedor a la red devolvio un error'
                            });
                        }
                    });
            } else {
                //el comercio ya pertenece a la red del proveedor, tengo que incrementar la cantidad de pedidos
                Proveedor.findOne({ _id: pedido.proveedor })
                    .populate('red')
                    .exec(async(errF, proveedor_) => {
                        if (errF) {
                            console.log(hoy + ' La busqueda del proveedor para actualizar el alias devolvio un error');
                            console.log(hoy + ' ' + errF.message);
                            return res.json({
                                ok: false,
                                message: 'La busqueda del proveedor para actualizar el alias devolvio un error'
                            });
                        }

                        let i = 0;
                        let hasta = proveedor_.red.length;
                        while (i < hasta) {
                            // console.log('Id comercio a analizar: ' + proveedor_.red[i].comercio);
                            // console.log('Comercio a buscar: ' + pedido.comercio);
                            let idAlias = proveedor_.red[i]._id;
                            // console.log('Alias a buscar: ' + idAlias);
                            if (proveedor_.red[i].comercio == pedido.comercio.toString().trim()) {
                                console.log(hoy + ' Comercio encontrado');
                                Alias.findOne({ _id: proveedor_.red[i]._id })
                                    .exec(async(errA, alias_) => {
                                        if (errA) {
                                            console.log(hoy + ' La busqueda de alias para actualizar la cantidad de pedidos devolvio un error');
                                            console.log(hoy + ' ' + errA.message);
                                            return res.json({
                                                ok: false,
                                                message: 'La busqueda de alias para actualizar la cantidad de pedidos devolvio un error'
                                            });
                                        }
                                        let cantidadPedidos_ = 0;
                                        cantidadPedidos_ = alias_.cantidadPedidos;
                                        cantidadPedidos_++;

                                        let cantidadAprobados = 0;
                                        cantidadAprobados = alias_.cantidadPedidosAprobados;
                                        cantidadAprobados++;

                                        // console.log('Alias encontrado');
                                        // console.log('Valores a guardar:');
                                        // console.log('Cantidad de pedidos: ' + cantidadPedidos_);
                                        // console.log('Cantidad de pedidos aprobados: ' + cantidadAprobados);
                                        // console.log('Asi se ve la red:');
                                        // console.log(proveedor_.red[i]);
                                        Alias.findOneAndUpdate({ '_id': idAlias }, {
                                                $set: {
                                                    cantidadPedidos: cantidadPedidos_,
                                                    cantidadPedidosAprobados: cantidadAprobados
                                                }
                                            },
                                            function(errUp, succesUp) {
                                                if (errUp) {
                                                    console.log(hoy + ' La actualizacion de los valores de pedidos en el alias devolvio un error');
                                                    console.log(hoy + ' ' + errUp.message);
                                                    return res.json({
                                                        ok: false,
                                                        message: 'La actualizacion de los valores de pedidos en el alias devolvio un error'
                                                    });
                                                }

                                                console.log('Valores actualizados');
                                            });
                                    });
                            } else {
                                console.log('Comercio no encontrado');
                            }
                            i++;
                        }
                    });
            }

            //actualizo el stock del producto
            let limite = pedido.detallePedido.length;
            let t = 0;
            while (t < limite) {
                DetallePedido.findOne({ _id: pedido.detallePedido[t] })
                    .exec(async(errD, ex) => {
                        // console.log('Se va a actualizar el siguiente producto: ' + ex.producto_);
                        // console.log('Con la cantidad: ' + ex.cantidadPedido);
                        funciones.actualizarStock(ex.producto_, ex.cantidadPedido);
                    });
                // console.log();


                t++;
            }
            res.json({
                ok: true,
                message: 'El pedido fue aceptado'
            });
        });

});

app.post('/pedido/rechazar/', async function(req, res) {
    var hoy = new Date();
    //cambiar el estado al pedido
    Pedido.findOneAndUpdate({ '_id': req.body.idPedido, estadoTerminal: false }, {
            $set: { estadoPedido: 'RECHAZADO', estadoTerminal: true, comentarioCancelado: req.body.comentario, fechaCambioEstado: hoy.getDate() }
        },
        function(err, pedido) {
            if (err) {
                return res.json({
                    ok: false,
                    message: 'La actualizacion produjo un error. Error: ' + err.message
                });
            }

            if (pedido == null) {
                return res.json({
                    ok: false,
                    message: 'No se puede modificar el estado de un pedido finalizado'
                });
            }

            let respuestaMensaje = funciones.nuevoMensaje({
                metodo: '/pedido/rechazar/',
                tipoError: 0,
                parametros: '$proveedor',
                valores: pedido.proveedor,
                buscar: 'SI',
                esPush: true,
                destinoEsProveedor: false,
                destino: pedido.comercio
            });

            //verifico si el comercio pertenece a la red del proveedor
            console.log('verifico si el comercio pertenece a la red del proveedor');
            console.log(pedido.comercioPerteneceARedProveedor);
            if (!pedido.comercioPerteneceARedProveedor) {
                //debo agregar el comercio a la red del proveedor
                let alias = new Alias({
                    esProveedor: false,
                    comercio: pedido.comercio,
                    alias: req.body.alias,
                    cantidadPedidosRechazados: 1
                });
                alias.save();


                Proveedor.findOneAndUpdate({ _id: pedido.proveedor }, { $push: { red: alias._id } },
                    function(errP, exito) {
                        if (errP) {
                            console.log(hoy + ' La funcion de agregar proveedor a la red devolvio un error');
                            console.log(hoy + ' ' + errP.message);
                            return res.json({
                                ok: false,
                                message: 'La funcion de agregar proveedor a la red devolvio un error'
                            });
                        }
                    });
            } else {
                //el comercio ya pertenece a la red del proveedor, tengo que incrementar la cantidad de pedidos
                Proveedor.findOne({ _id: pedido.proveedor })
                    .populate('red')
                    .exec(async(errF, proveedor_) => {
                        if (errF) {
                            console.log(hoy + ' La busqueda del proveedor para actualizar el alias devolvio un error');
                            console.log(hoy + ' ' + errF.message);
                            return res.json({
                                ok: false,
                                message: 'La busqueda del proveedor para actualizar el alias devolvio un error'
                            });
                        }

                        let i = 0;
                        let hasta = proveedor_.red.length;
                        while (i < hasta) {
                            // console.log('Id comercio a analizar: ' + proveedor_.red[i].comercio);
                            // console.log('Comercio a buscar: ' + pedido.comercio);
                            let idAlias = proveedor_.red[i]._id;
                            // console.log('Alias a buscar: ' + idAlias);
                            if (proveedor_.red[i].comercio == pedido.comercio.toString().trim()) {
                                console.log('Comercio encontrado');
                                Alias.findOne({ _id: proveedor_.red[i]._id })
                                    .exec(async(errA, alias_) => {
                                        if (errA) {
                                            console.log(hoy + ' La busqueda de alias para actualizar la cantidad de pedidos devolvio un error');
                                            console.log(hoy + ' ' + errA.message);
                                            return res.json({
                                                ok: false,
                                                message: 'La busqueda de alias para actualizar la cantidad de pedidos devolvio un error'
                                            });
                                        }
                                        let cantidadPedidos_ = 0;
                                        cantidadPedidos_ = alias_.cantidadPedidos;
                                        cantidadPedidos_++;

                                        let cantidadRechazados = 0;
                                        cantidadRechazados = alias_.cantidadPedidosRechazados;
                                        cantidadRechazados++;

                                        // console.log('Alias encontrado');
                                        // console.log('Valores a guardar:');
                                        // console.log('Cantidad de pedidos: ' + cantidadPedidos_);
                                        // console.log('Cantidad de pedidos aprobados: ' + cantidadRechazados);
                                        // console.log('Asi se ve la red:');
                                        // console.log(proveedor_.red[i]);
                                        Alias.findOneAndUpdate({ '_id': idAlias }, {
                                                $set: {
                                                    cantidadPedidos: cantidadPedidos_,
                                                    cantidadPedidosRechazados: cantidadRechazados
                                                }
                                            },
                                            function(errUp, succesUp) {
                                                if (errUp) {
                                                    console.log(hoy + ' La actualizacion de los valores de pedidos en el alias devolvio un error');
                                                    console.log(hoy + ' ' + errUp.message);
                                                    return res.json({
                                                        ok: false,
                                                        message: 'La actualizacion de los valores de pedidos en el alias devolvio un error'
                                                    });
                                                }

                                                console.log('Valores actualizados');
                                            });
                                    });
                            } else {
                                console.log('Comercio no encontrado');
                            }
                            i++;
                        }
                    });
            }

            res.json({
                ok: true,
                message: 'El pedido fue rechazado'
            });
        });

});

app.post('/pedido/buscar_pedido_pendiente_entrega/', async function(req, res) {

    Pedido.findOne({ _id: req.body.idPedido, proveedor: req.body.idProveedor })
        .populate({ path: 'comercio', select: 'entidad', populate: { path: 'entidad' } })
        // .populate('detallePedido')
        .populate({ path: 'detallePedido', populate: { path: 'producto' } })
        .where({ estadoPedido: 'ACEPTADO' })
        .exec(async(err, pedido) => {
            if (err) {
                console.log('La busqueda de pedido por id produjo un error');
                console.log(err.message);
                return res.json({
                    ok: false,
                    message: 'La busqueda de pedido por id produjo un error',
                    pedido: null
                });
            }

            if (pedido == null) {
                console.log('La busqueda de pedido no arrojo resultado');
                return res.json({
                    ok: false,
                    message: 'No se encontro un pedido para entregar',
                    pedido: null
                });
            }

            res.json({
                ok: true,
                message: 'Pedido encontrado',
                pedido
            });

        });
});

app.post('/pedido/entregar/', async function(req, res) {
    var hoy = new Date();
    //cambiar el estado al pedido
    Pedido.findOneAndUpdate({ '_id': req.body.idPedido, estadoTerminal: false }, {
            $set: { estadoPedido: 'ENTREGADO', estadoTerminal: true, comentarioCancelado: req.body.comentario, fechaCambioEstado: hoy.getDate() }
        },
        function(err, exito) {
            if (err) {
                return res.json({
                    ok: false,
                    message: 'La actualizacion produjo un error. Error: ' + err.message
                });
            }

            if (exito == null) {
                return res.json({
                    ok: false,
                    message: 'No se puede modificar el estado de un pedido finalizado'
                });
            }

            // let respuestaMensaje = funciones.nuevoMensaje({
            //     metodo: '/pedido/rechazar/',
            //     tipoError: 0,
            //     parametros: '$proveedor',
            //     valores: exito.proveedor,
            //     buscar: 'SI',
            //     esPush: true,
            //     destinoEsProveedor: false,
            //     destino: exito.comercio
            // });

            res.json({
                ok: true,
                message: 'El pedido fue entregado'
            });
        });

});

app.post('/pedido/enviar/', async function(req, res) {

    //cambiar el estado al pedido
    Pedido.findOneAndUpdate({ '_id': req.body.idPedido, estadoTerminal: false }, { $set: { estadoPedido: 'EN CAMINO', estadoTerminal: false } }, function(err, exito) {
        if (err) {
            return res.json({
                ok: false,
                message: 'La actualizacion produjo un error. Error: ' + err.message
            });
        }

        if (exito == null) {
            return res.json({
                ok: false,
                message: 'No se puede modificar el estado de un pedido finalizado'
            });
        }

        res.json({
            ok: true,
            message: 'El pedido fue rechazado'
        });
    });

});




//////////// REGION COMERCIO ///////////////
app.post('/pedido/nuevo_pedido_comercio/', async function(req, res) {


    let detalles = [];
    for (var i in req.body.pedidos[p].productos) {
        let detallePedido = new DetallePedido({
            producto: req.body.pedidos[p].productos[i]._id,
            unidadMedida: req.body.pedidos[p].productos[i].unidadMedida,
            cantidadPedido: req.body.pedidos[p].productos[i].cantidad,
        });
        detallePedido.save();
        detalles.push(detallePedido._id);
    }

    let pedido = new Pedido({
        proveedor: req.body.proveedor,
        comercio: req.body.comercio,
        tipoEntrega: req.body.tipoEntrega,
        fechaEntrega: req.body.fechaEntrega,
        detallePedido: detalles,
        estadoPedido: 'PEDIDO SOLICITADO',
        estadoTerminal: false,
        comentario: req.body.comentario
    });

    pedido.save();
    return res.json({
        ok: true,
        message: 'El pedido ha sido registrado'
    });
    // }
});

///////////// ESTADISTICAS /////////////////





module.exports = app;