const express = require('express');
const app = express();

const Entidad = require('../models/entidad');
const funciones = require('../../middlewares/funciones');
const PuntoVenta = require('../models/puntoVenta');


app.post('/proveedor/nuevo_punto_venta/', async function(req, res) {

    let punto = new PuntoVenta({
        _id: req.body._id,
        nombrePuntoVenta: req.body.nombrePuntoVenta,
        domicilio: req.body.domicilio
    });

    punto.save((err, puntoDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }


        res.json({
            ok: true,
            puntoDB
        });
    });

});




module.exports = app;