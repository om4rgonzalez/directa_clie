const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let horarioAtencionSchema = new Schema({

        turno: {
            type: String
        },
        activo: {
            type: Boolean,
            default: true
        },
        horaInicio: {
            type: String
        },
        horaFin: {
            type: String
        }
    }

);


module.exports = mongoose.model('HorarioAtencion', horarioAtencionSchema);