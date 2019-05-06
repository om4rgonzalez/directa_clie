const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

let Schema = mongoose.Schema;

let personaSchema = new Schema({
    tipoDni: {
        type: String
    },
    dni: {
        type: String
    },
    apellidos: {
        type: String
    },
    nombres: {
        type: String
    },
    fechaAlta: {
        type: Date,
        default: Date.now
    },
    fechaNacimiento: {
        type: Date
    },
    domicilio: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Domicilio'
    }

});

// personaSchema.plugin(uniqueValidator, { message: 'El {PATH} ya esta registrado' });
module.exports = mongoose.model('Persona', personaSchema);