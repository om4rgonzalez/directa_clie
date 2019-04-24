const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let actividadPrincipalSchema = new Schema({
        nombreActividad: {
            type: String,
        },
        orden: {
            type: Number
        },
        tipoCliente: {
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


module.exports = mongoose.model('ActividadPrincipal', actividadPrincipalSchema);