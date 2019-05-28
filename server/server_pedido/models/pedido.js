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
    cargosExtras: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CargoExtra'
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
        type: Boolean,
        default: false
    },
    comentario: {
        type: String
    },
    comentarioCancelado: {
        type: String,
        default: '-'
    },
    // lugarEntrega: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'Domicilio'
    // },
    fechaCambioEstado: {
        type: Date,
        default: Date.now
    },
    // cargosExtras: [{
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'CargoExtra'
    // }],
    cantidadTotalPedido: {
        type: Number,
        default: 0
    },
    montoTotalPedido: {
        type: Number,
        default: 0
    }
    /////////////campos a eliminar en el futuro
    // apellidoCliente: {
    //     type: String,
    //     default: '-'
    // },
    // nombreCliente: {
    //     type: String,
    //     default: '-'
    // },
    // localidadEntrega: {
    //     type: String,
    //     default: '-'
    // },
    // barrioEntrega: {
    //     type: String,
    //     default: '-'
    // },
    // calleEntrega: {
    //     type: String,
    //     default: '-'
    // },
    // numeroCasaEntrega: {
    //     type: String,
    //     default: '-'
    // },
    // pisoEntrega: {
    //     type: String,
    //     default: '0'
    // },
    // departamentoEntrega: {
    //     type: String,
    //     default: '0'
    // },
    // ordenEntrega: {
    //     type: Number
    // },
    // horarioEntrega: {
    //     type: String,
    //     default: 'de 8 a 13'
    // },
    // notaPicking: {
    //     type: String,
    //     default: '-'
    // },
    // telefonoCliente: {
    //     type: String,
    //     default: '-'
    // }
});


module.exports = mongoose.model('Pedido', pedidoSchema);