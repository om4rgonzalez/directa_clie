const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let entidadSchema = new Schema({
        cuit: {
            type: String,
            unique: true
        },
        razonSocial: {
            type: String,
        },
        domicilio: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Domicilio'
        },
        actividadPrincipal: {
            type: String
        },
        tipoPersoneria: {
            type: String
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


module.exports = mongoose.model('Entidad', entidadSchema);