const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let videoProductoSchema = new Schema({

        titulo: {
            type: String,
            required: true
        },
        canal: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        }


    }

);


module.exports = mongoose.model('Video_Producto', videoProductoSchema);