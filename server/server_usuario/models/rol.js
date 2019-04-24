const mongoose = require('mongoose');

let Schema = mongoose.Schema;


let rolSchema = new Schema({
    nombre: {
        type: String,
        required: true
    },
    precedencia: {
        type: Number,
        required: true,
        default: 1
    }

});

module.exports = mongoose.model('Rol', rolSchema);