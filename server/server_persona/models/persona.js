const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

let Schema = mongoose.Schema;

let personaSchema = new Schema({
    tipoDni: {
        type: String
    },
    dni: {
        type: String
            // ,
            // unique: true,
            // require: [true, 'Debe ingresar el DNI']
    },
    apellidos: {
        type: String
            // ,
            // require: [true, 'Debe ingresar el apellido']
    },
    nombres: {
        type: String
            // ,
            // require: [true, 'Debe ingresar el nombre']
    },
    fechaAlta: {
        type: Date,
        default: Date.now
    },
    fechaNacimiento: {
        type: Date
            // ,
            // require: [true, 'Debe ingresar la fecha de nacimiento']
    },
    domicilio: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Domicilio'
    }

});

// personaSchema.plugin(uniqueValidator, { message: 'El {PATH} ya esta registrado' });
module.exports = mongoose.model('Persona', personaSchema);