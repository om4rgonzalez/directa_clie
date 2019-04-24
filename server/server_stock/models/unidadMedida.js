const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let unidadMedidaSchema = new Schema({

        nombreUnidad: {
            type: String,
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


module.exports = mongoose.model('UnidadMedida', unidadMedidaSchema);