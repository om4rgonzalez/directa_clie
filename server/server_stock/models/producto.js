const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let productoSchema = new Schema({

        codigoProveedor: {
            type: String,
            default: '0'
        },
        nombreProducto: {
            type: String,
            required: true
        },
        detalleProducto: {
            type: String,
            default: '-'
        },
        precioPublico: {
            type: Number,
            required: true,
            default: 0
        },
        cantidadSubProductos: {
            type: Number,
            default: 0
        },
        activo: {
            type: Boolean,
            default: true
        },
        fechaAlta: {
            type: Date,
            default: Date.now
        },
        unidadMedida: {
            type: String,
            required: true
        },
        categoria: {
            type: String,
            default: 'GENERAL'
        },
        subcategoria: {
            type: String,
            default: 'GENERAL'
        },
        imagenes: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Imagen_Producto'
        }],
        videos: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Video_Producto'
        }],
        stock: {
            type: Number,
            defaul: 100000000
        },
        empaque: {
            type: String
        },
        subProductos: [{
            subProducto: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'SubProducto'
            },
            cantidad: {
                type: Number,
                defaul: 0
            }
        }]
    }

);


module.exports = mongoose.model('Producto', productoSchema);