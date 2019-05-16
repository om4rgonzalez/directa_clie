const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let clienteSchema = new Schema({
        datosPersonales: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Persona'
        },
        puntosEntrega: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Domicilio'
        }],
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
        plataformaUsadaParaAlta: {
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