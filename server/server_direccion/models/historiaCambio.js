const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let historiaCambioDomicilioSchema = new Schema({
        domicilio: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Domicilio'
        },
        pais: {
            type: String
        },
        provincia: {
            type: String
        },
        localidad: {
            type: String
        },
        barrio: {
            type: String
        },
        calle: {
            type: String
        },
        numeroCasa: {
            type: String
        },
        piso: {
            type: String
        },
        numeroDepartamento: {
            type: String
        },
        latitud: {
            type: String
        },
        longitud: {
            type: String
        },
        codigoPostal: {
            type: String
        },
        numeroVersion: {
            type: Number,
            require: true
        }
    }

)

module.exports = mongoose.model('HistoriaCambioDomicilio', historiaCambioDomicilioSchema);