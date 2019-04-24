const mongoose = require('mongoose');
var error = "";
let Schema = mongoose.Schema;

let configuracionSchema = new Schema({
        versionAndroidComercio: {
            type: String
        },
        versionAndroidProveedor: {
            type: String
        }
    }

)

module.exports = mongoose.model('Configuracion', configuracionSchema);