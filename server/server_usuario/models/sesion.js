const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let sesionSchema = new Schema({
        fechaInicio: {
            type: Date,
            default: Date.now
        },
        fechaFin: {
            type: Date,
            default: Date.now
        },
        sistemaOperativo: {
            type: String,
            default: '-'
        },
        fabricante: {
            type: String,
            default: '-'
        },
        modelo: {
            type: String,
            default: '-'
        },
        versionKernel: {
            type: String,
            default: '-'
        },
        longitud: {
            type: String,
            default: '-65,304387'
        },
        latitud: {
            type: String,
            default: '-24.183148'
        },
        activa: {
            type: Boolean,
            default: true
        }
    }

)

module.exports = mongoose.model('Sesion', sesionSchema);