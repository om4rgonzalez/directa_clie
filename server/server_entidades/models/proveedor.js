const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let proveedorSchema = new Schema({

    entidad: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Entidad'
    },
    puntosVenta: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PuntoVenta'
    }],
    usuarios: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario'
    }],
    activo: {
        type: Boolean,
        default: true
    },
    fechaAlta: {
        type: Date,
        default: Date.now
    },
    red: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Alias"
    }],
    contactos: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contacto'
    }],
    proveedores: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Proveedor'
    }],
    productos: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubProducto'
    }],
    cargoConfiguracion: {
        type: Boolean,
        default: false
    },
    logo: {
        type: String,
        default: '-'
    },
    imagenes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Imagen_Proveedor'
    }],
    videos: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video_Proveedor'
    }],
    cobertura: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cobertura'
    }],
    tiposEntrega: [{
        type: String
    }],
    periodosEntrega: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PeriodoEntrega'
    }]
});

module.exports = mongoose.model('Proveedor', proveedorSchema);