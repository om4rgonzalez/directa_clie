const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let tipoClienteSchema = new Schema({
    nombre: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('TipoCliente', tipoClienteSchema);