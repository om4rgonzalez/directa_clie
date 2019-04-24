const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let comercioSchema = new Schema({

        entidad: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Entidad'
        },
        proveedores: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Proveedor'
        }],
        productos: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Producto'
        }],
        tiposEntrega: [{
            type: String
        }],
        activo: {
            type: Boolean,
            default: true
        },
        fechaAlta: {
            type: Date,
            default: Date.now
        },
        usuarios: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Usuario'
        }],
        vende: {
            type: Boolean,
            default: false
        },
        primerLogin: {
            type: Boolean,
            default: true
        },
        aceptoTerminoProveedor: {
            type: Boolean,
            default: false
        },
        aceptoTerminosVendedor: {
            type: Boolean,
            default: false
        },
        horarioAtencion: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'HorarioAtencion'
        }],
        contactos: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Contacto'
        }],
        cargoConfiguracion: {
            type: Boolean,
            default: false
        }
    }

);


module.exports = mongoose.model('Comercio', comercioSchema);