const express = require('express');
const app = express();
const funciones = require('../../middlewares/funciones');
const Configuracion = require('../models/configuracion');
const axios = require('axios');





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
        versionAndroidProveedor: '1.0',
        dni: 0
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
});

app.post('/configuraciones/obtener_ultimo_dni/', async function(req, res) {
    Configuracion.find()
        .sort(dni)
        .exec(async(err, configuraciones) => {
            if (err) {
                console.log('La busqueda de configuraciones devolvio un error');
                console.log(err.message);
                return res.json({
                    ok: false,
                    message: 'La busqueda de configuraciones devolvio un error.',
                    dni: null
                });
            }

            if (configuraciones.length == 0) {
                console.log('No hay configuraciones cargadas');
                return res.json({
                    ok: false,
                    message: 'No hay configuraciones cargadas.',
                    dni: null
                });
            }

            let i = 0;
            let max = 0;
            let id = "";
            while (i < configuraciones.length) {
                if (i == 0) {
                    max = configuraciones[i].dni;
                    id = configuraciones[i]._id;
                } else {
                    if (configuraciones[i].dni > max) {
                        max = configuraciones[i].dni;
                        id = configuraciones[i]._id;
                    }
                }
                i++;
            }
            dni++;
            Configuracion.findOneAndUpdate({ _id: id }, { $set: { dni: dni } }, async function(errU, ok) {
                if (errU) {
                    console.log('La actualizacion del nuevo valor de dni devolvio un error.');
                    console.log(errU.message);
                    return res.json({
                        ok: false,
                        message: 'La actualizacion del nuevo valor de dni devolvio un error.',
                        dni: null
                    });
                }
            });
            return res.json({
                ok: true,
                message: 'Devolviendo el nuevo DNI',
                dni: dni
            });
        });
});

app.post('/conf/get_dolar/', async function(req, res) {

    let URL = 'https://api.estadisticasbcra.com/usd';
    console.log('Llamando a la URL: ' + URL);
    let token = 'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1OTQxMzczNDEsInR5cGUiOiJleHRlcm5hbCIsInVzZXIiOiJvbTRyLmdvbnphbGV6QGdtYWlsLmNvbSJ9.zqNVolnhEO_l3t3TN-Gk_WT2nyMDlp0amrvOmx7uoIhceJtwoTs6waBaaJzwlnsMEaTgvOVhxxy9DCAkHjUwGg';
    let resp = await axios.get(URL, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    let dolar;
    // console.log(resp.data);
    let i = 0;
    while (i < resp.data.length) {
        // console.log(resp.data[i]);
        dolar = resp.data[i].v;
        i++;
    }
    res.json({
        "fulfillmentText": dolar
    });
});

module.exports = app;