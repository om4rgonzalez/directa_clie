const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let detallePedidoSchema = new Schema({

        producto_: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Producto'
        },
        nombreProducto: {
            type: String
        },
        precioVenta: {
            type: Number,
            default: 0
        },
        preferencias: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Preferencia'
        }],
        empaque: {
            type: String
        },
        cantidadPedido: {
            type: Number,
            required: true
        },
        activo: {
            type: Boolean,
            default: true
        },
        fechaAlta: {
            type: Date,
            default: Date.now
        }
    }

);


module.exports = mongoose.model('DetallePedido', detallePedidoSchema);