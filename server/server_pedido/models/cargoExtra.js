const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let cargosExtrasSchema = new Schema({

        item: {
            type: String
        },
        valor: {
            type: Number,
            default: 0
        }
    }

);


module.exports = mongoose.model('CargoExtra', cargosExtrasSchema);