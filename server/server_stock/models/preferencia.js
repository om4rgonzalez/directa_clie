const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let preferenciaSchema = new Schema({

        agrega: {
            type: Boolean,
            default: false
        },
        subProducto: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SubProducto'
        },
        cantidad: {
            type: Number,
            default: 0
        },
        fechaAlta: {
            type: Date,
            default: Date.now
        }
    }

);


module.exports = mongoose.model('Preferencia', preferenciaSchema);