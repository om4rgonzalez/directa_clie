const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let pedidoSchema = new Schema({

    proveedor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Proveedor'
    },
    tipoEntrega: {
        type: String,
        default: 'ENTREGA A DOMICILIO',
        required: true
    },
    fechaEntrega: {
        type: String,
        required: true
    },
    detallePedido: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DetallePedido'
    }],
    activo: {
        type: Boolean,
        default: true
    },
    fechaAlta: {
        type: Date,
        default: Date.now
    },
    estadoPedido: {
        type: String
    },
    estadoTerminal: {
        type: Boolean
    },
    comentario: {
        type: String
    },
    comentarioCancelado: {
        type: String,
        default: '-'
    },
    lugarEntrega: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Domicilio'
    },
    fechaCambioEstado: {
        type: Date,
        default: Date.now
    },
    cargosExtras: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CargoExtra'
    }],
    cantidadTotalPedido: {
        type: Number,
        default: 0
    },
    montoTotalPedido: {
        type: Number,
        default: 0
    }
});


module.exports = mongoose.model('Pedido', pedidoSchema);