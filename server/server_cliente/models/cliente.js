const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let clienteSchema = new Schema({
        titular: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Persona'
        },
        contactos: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Contacto'
        }],
        tipoCliente: {
            type: String,
            default: 'NUEVO'
        },
        estado: {
            type: Boolean,
            default: true
        },
        fechaAlta: {
            type: Date,
            default: Date.now
        },
        idCliente: {
            type: String
        },
        plataformaOrigen: {
            type: String
        },
        cantidadPedidos: {
            type: Number
        },
        calificacion: {
            type: Number
        }
    }

);


module.exports = mongoose.model('Cliente', clienteSchema);