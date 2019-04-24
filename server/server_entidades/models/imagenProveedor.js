const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let imagenProveedorSchema = new Schema({

        nombre: {
            type: String,
            required: true
        },
        formato: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        }


    }

);


module.exports = mongoose.model('Imagen_Proveedor', imagenProveedorSchema);