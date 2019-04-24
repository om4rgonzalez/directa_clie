const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let historiaCambioDatoContactoSchema = new Schema({
        idContacto: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Contacto'
        },
        tipoContacto: {
            type: String
        },
        codigoPais: {
            type: String
        },
        codigoArea: {
            type: String
        },
        numeroCelular: {
            type: String
        },
        numeroFijo: {
            type: String
        },
        email: {
            type: String
        },
        numeroCambio: {
            type: Number,
            require: true
        }
    }

)

module.exports = mongoose.model('HistoriaCambioDatoContacto', historiaCambioDatoContactoSchema);