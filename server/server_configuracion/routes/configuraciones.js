const express = require('express');
const app = express();
const funciones = require('../../middlewares/funciones');
const Configuracion = require('../models/configuracion');





app.post('/conf/combos/', async function(req, res) {
    console.log('se llamo al servicio que devuelve combos');
    let respuesta = await funciones.combosNuevoProveedor();
    res.json({
        ok: true,
        respuesta
    });
});

app.get('/conf/status/', function(req, res) {
    console.log('Ambiente: ' + process.env.NODE_ENV);
    console.log('URL del servicio: ' + process.env.URL_SERVICE);
    console.log('Puerto escuchando: ' + process.env.PORT);
    console.log('URL base de datos: ' + process.env.urlDB);

    res.json({
        ambiente: process.env.NODE_ENV,
        urlServicio: process.env.URL_SERVICE,
        puerto: process.env.PORT,
        baseDatos: process.env.urlDB
    });

});

app.post('/conf/conf_init/', function(req, res) {

    let configuracion = new Configuracion({
        versionAndroidComercio: '1.0',
        versionAndroidProveedor: '1.0'
    });
    configuracion.save();
    res.json({
        ok: true,
        message: 'La inicializacion termino con exito'
    });
});

app.get('/conf/version/', function(req, res) {
    Configuracion.find()
        .exec((err, configuracion) => {
            if (err) {
                console.log('Error al consultar las versiones disponibles');
                return res.json({
                    ok: false,
                    message: 'Error al consultar las versiones disponibles',
                    versiones: null
                });
            }

            if (configuracion.length == 0) {
                console.log('No hay configuraciones disponibles');
                return res.json({
                    ok: false,
                    message: 'No hay configuraciones disponibles',
                    versiones: null
                });
            }

            res.json({
                ok: true,
                message: 'Devolviendo versiones',
                versiones: {
                    versionAndroidComercio: configuracion[0].versionAndroidComercio,
                    versionAndroidProveedor: configuracion[0].versionAndroidProveedor
                }
            })

        });
})

module.exports = app;