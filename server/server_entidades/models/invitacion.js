const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let invitacionSchema = new Schema({
        esProveedor: {
            type: Boolean,
            default: false
        },
        comercio: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Comercio'
        },
        proveedor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Proveedor'
        },
        aceptada: {
            type: Boolean,
            default: false
        },
        fechaAceptada: {
            type: Date,
            default: Date.now
        },
        texto: {
            type: String
        },
        pendienteDeRevision: {
            type: Boolean,
            default: true
        },
        fechaAlta: {
            type: Date,
            default: Date.now
        }
    }

);


module.exports = mongoose.model('Invitacion', invitacionSchema);