const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let historiaCambioPrecioSugeridoUnidadSchema = new Schema({

        precio: {
            type: Number,
            default: 0
        },
        fechaAlta: {
            type: Date,
            default: Date.now
        },
    }

);


module.exports = mongoose.model('Historia_Cambio_Precio_Sugerido_Unidad', historiaCambioPrecioSugeridoUnidadSchema);