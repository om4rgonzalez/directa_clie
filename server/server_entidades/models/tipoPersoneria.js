const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let tipoPersoneriaSchema = new Schema({
        nombreTipoPersoneria: {
            type: String,
        },
        orden: {
            type: Number
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


module.exports = mongoose.model('TipoPersoneria', tipoPersoneriaSchema);