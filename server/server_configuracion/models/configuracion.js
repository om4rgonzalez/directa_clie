const mongoose = require('mongoose');
var error = "";
let Schema = mongoose.Schema;

let configuracionSchema = new Schema({
        versionAndroidComercio: {
            type: String
        },
        versionAndroidProveedor: {
            type: String
        },
        dni: {
            type: Number,
            default: 0
        }
    }

)

module.exports = mongoose.model('Configuracion', configuracionSchema);