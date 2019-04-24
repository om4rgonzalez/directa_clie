const express = require('express');
const app = express();
const EstadoCasa = require('../models/estadoCasa');


app.get('/domicilio/estadosCasa', function(req, res) {
    EstadoCasa.find({}).exec((err, estadosCasaDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            estadosCasaDB
        });
    });
})



app.post('/domicilio/inicializar_estados_casa', function(req, res) {
    let valores = [{ nombre: 'Propia' },
        { nombre: 'Alquilada' },
        { nombre: 'Prestada' },
        { nombre: 'Compartida' }
    ];

    let respuesta = [];
    for (var i = 0; i < valores.length; i++) {
        let tipo = new EstadoCasa({
            nombre: valores[i].nombre
        });


        tipo.save((err, estadoCasaDB) => {
            if (err) {
                res = {
                    ok: false,
                    err
                };
            } else
                res = {
                    ok: true,
                    estadoCasaDB
                };
            respuesta.push(res);
        });
    }
    return respuesta.json();
})

// app.put('/contacto', function(req, res) {
//     res.json('Modifica los datos de un usuario')
// })

// app.delete('/contacto', function(req, res) {
//     res.json('Cambia el estado de un usuario a "borrado"')
// })

module.exports = app;