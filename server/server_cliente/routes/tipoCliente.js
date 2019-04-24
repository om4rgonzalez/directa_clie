const express = require('express');
const app = express();
const TipoCliente = require('../models/tipoCliente');


app.get('/cliente/obtener_tipos', function(req, res) {

    TipoCliente.find({})
        .exec((err, tipoCliente) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                tipoCliente
            });
        });
})



app.post('/cliente/tipo_cliente_init', function(req, res) {

    let tipoCliente = new TipoCliente({
        nombre: 'CLIENTE'
    });

    tipoCliente.save();

    let tipoCliente2 = new TipoCliente({
        nombre: 'COMERCIO'
    });
    tipoCliente2.save();
    return res.json({
        ok: true
    });
})

// app.put('/tipoCliente', function(req, res) {
//     res.json('Modifica los datos de un tipoCliente')
// })

// app.delete('/tipoCliente', function(req, res) {
//     res.json('Cambia el estado del tipoCliente a "borrado"')
// })

module.exports = app;