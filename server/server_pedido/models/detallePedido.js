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
        precioProveedor: {
            type: Number,
            default: 0
        },
        // precioSugerido: {
        //     type: Number,
        //     default: 0
        // },
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