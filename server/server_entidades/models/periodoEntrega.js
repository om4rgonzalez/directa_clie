const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let periodoEntregaSchema = new Schema({

    tipoPeriodo: {
        type: String,
        default: 'FIJO'
    },
    diaFijo: {
        type: Number
    }
});


module.exports = mongoose.model('PeriodoEntrega', periodoEntregaSchema);