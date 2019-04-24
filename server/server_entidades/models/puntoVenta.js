const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let puntoVentaSchema = new Schema({

        nombrePuntoVenta: {
            type: String,
            required: true
        },
        domicilio: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Domicilio'
        },
        activo: {
            type: Boolean,
            default: true
        },
        fechaAlta: {
            type: Date,
            default: Date.now
        }
    }

);


module.exports = mongoose.model('PuntoVenta', puntoVentaSchema);