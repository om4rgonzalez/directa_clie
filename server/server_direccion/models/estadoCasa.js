const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let estadoCasaSchema = new Schema({
    nombre: {
        type: String,
        required: true
    }

});

module.exports = mongoose.model('EstadosCasa', estadoCasaSchema);