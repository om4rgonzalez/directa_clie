const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let tipoEntregaSchema = new Schema({

        tipoEntrega: {
            type: String,
            default: 'Retiro de sucursal'
        },
        activo: {
            type: Boolean,
            default: true
        },
        fechaAlta: {
            type: Date,
            default: Date.now
        },
        periodos: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'PeriodoEntrega'
        }]
    }

);

module.exports = mongoose.model('TiposEntrega', tipoEntregaSchema);