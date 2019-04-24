const express = require('express');
const app = express();
const Indice = require('../models/indice_producto');

app.post('/producto/generar_indice/', async function(req, res) {
    let hoy = new Date();
    Indice.find()
        .exec(async(err, indices) => {
            if (err) {
                console.log(hoy + ' La busqueda del ultimo indice devolvio un error');
                console.log(hoy + ' ' + err.message);
                return res.json({
                    ok: false,
                    message: 'La busqueda del ultimo indice devolvio un error',
                    indice: null
                });
            }
            if (indices.length == 0) {
                console.log(hoy + ' No hay indices, este es el primero');
                let indice = new Indice({
                    prefijo: 'X',
                    secuencia: '1'
                });
                indice.save();
                return res.json({
                    ok: true,
                    message: 'Devolviendo primer indice',
                    indice: indice.prefijo + indice.secuencia
                });
            }

            console.log(hoy + ' Ya hay indices registrados, debo insertar uno y devolverlo');
            let ultimoIndice = parseInt(indices[indices.length - 1].secuencia, 10);
            ultimoIndice++;
            let indice = new Indice({
                prefijo: 'X',
                secuencia: ultimoIndice.toString()
            });
            indice.save();
            return res.json({
                ok: true,
                message: 'Devolviendo indice',
                indice: indice.prefijo + indice.secuencia
            });
        })
});








module.exports = app;