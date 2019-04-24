const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let subProductoSchema = new Schema({

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
        precioProveedorBulto: {
            type: Number,
            required: true,
            default: 0
        },
        precioSugeridoBulto: {
            type: Number,
            default: 0
        },
        precioProveedorUnidad: {
            type: Number,
            required: true,
            default: 0
        },
        precioSugeridoUnidad: {
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
        fechaUltimaModificacion: {
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
        historialPrecioProveedorBulto: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Historia_Cambio_Precio_Proveedor_Bulto'
        }],
        historiaPrecioSugeridoBulto: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Historia_Cambio_Precio_Sugerido_Bulto'
        }],
        historialPrecioProveedorUnidad: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Historia_Cambio_Precio_Proveedor_Unidad'
        }],
        historiaPrecioSugeridoUnidad: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Historia_Cambio_Precio_Sugerido_Unidad'
        }],
        empaque: {
            type: String
        },
        unidadesPorEmpaque: {
            type: Number,
            default: 0
        }
    }

);


module.exports = mongoose.model('SubProducto', subProductoSchema);