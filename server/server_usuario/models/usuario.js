const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let usuarioSchema = new Schema({
        persona: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Persona'
        },
        nombreUsuario: {
            type: String,
            unique: true,
            require: [true, 'Debe ingresar un nombre de usuario']
        },
        clave: {
            type: String,
            require: [true, 'Debe ingresar una clave']
        },
 	idPush: {
            type: String,
            default: '-'
        },
        rol: {
            type: mongoose.Schema.Types.ObjectId,
            require: [true, 'Todo usuario debe tener un rol asignado'],
            ref: 'Rol'
        },
        estado: {
            type: Boolean,
            default: true
        },
        fechaAlta: {
            type: Date,
            default: Date.now
        },
        contactos: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Contacto'
        }]
    }

);
usuarioSchema.method.toJSON = function() {
    let user = this;
    let userObject = user.toObject();
    delete userObject.clave;

    return userObject;
}

module.exports = mongoose.model('Usuario', usuarioSchema);