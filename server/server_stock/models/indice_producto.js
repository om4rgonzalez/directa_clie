const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let indiceProductoSchema = new Schema({

        prefijo: {
            type: String,
            default: 'X'
        },
        secuencia: {
            type: String,
            required: true
        }
    }

);


module.exports = mongoose.model('IndiceProducto', indiceProductoSchema);