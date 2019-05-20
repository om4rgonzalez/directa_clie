const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let domicilioSchema = new Schema({
        pais: {
            type: String,
            require: [true, 'El domicilio debe contener el pais en donde vive la persona']
        },
        provincia: {
            type: String,
            require: [true, 'El domicilio debe contener la provincia en donde vive la persona']
        },
        localidad: {
            type: String,
            require: [true, 'El domicilio debe contener la localidad en donde se vive la persona']
        },
        barrio: {
            type: String,
            require: [true, 'El domicilio debe contener el nombre del barrio en donde vive la persona']
        },
        calle: {
            type: String,
            require: [true, 'El domicilio debe contener el nombre de la calle en donde vive la persona']
        },
        numeroCasa: {
            type: String,
            require: [true, 'El domicilio debe contener el numero de la casa en donde vive la persona']
        },
        latitud: {
            type: String
        },
        longitud: {
            type: String
        },
        URLUbicacion: {
            type: String
        },
        codigoPostal: {
            type: String
        },
        referenciaUbicacion: {
            type: String,
            default: '-'
        },
        tieneLatitudLongitud: {
            type: Boolean,
            default: false
        }
    }

)

module.exports = mongoose.model('Domicilio', domicilioSchema);