const mongoose = require('mongoose');
var error = "";
let Schema = mongoose.Schema;

let contactoSchema = new Schema({
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
                // ,
                // validate: validarNumeroCelular
        },
        numeroFijo: {
            type: String
        },
        email: {
            type: String
        }
    }

)

module.exports = mongoose.model('Contacto', contactoSchema);