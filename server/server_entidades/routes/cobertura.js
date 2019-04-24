const express = require('express');
const app = express();

const Entidad = require('../models/entidad');
const funciones = require('../../middlewares/funciones');
const Proveedor = require('../models/proveedor');
const Comercio = require('../models/comercio');
const Cobertura = require('../models/cobertura');


app.post('/cobertura/verificar_cobertura_a_comercio/', async function(req, res) {
    let hoy = new Date();
    console.log('Proveedor a analizar: ' + req.body.idProveedor);
    Proveedor.findOne({ _id: req.body.idProveedor })
        .populate('entidad')
        .populate('cobertura')
        .exec(async(err, proveedor) => {
            if (err) {
                console.log(hoy + ' La busqueda de un proveedor para verificar si tiene cobertura en la zona del comercio devolvio un error');
                console.log(hoy + ' ' + err.message);
                return res.json({
                    ok: false,
                    message: 'La busqueda de un proveedor para verificar si tiene cobertura en la zona del comercio devolvio un error',
                    tieneCobertura: false,
                    tieneEnvioADomicilio: false,
                    costoEnvioADomicilio: 0.0
                });
            }
            if (proveedor == null) {
                console.log(hoy + ' La busqueda de un proveedor para verificar si tiene cobertura en la zona del comercio no devolvio resultados');
                return res.json({
                    ok: false,
                    message: 'La busqueda de un proveedor para verificar si tiene cobertura en la zona del comercio no devolvio resultados',
                    tieneCobertura: false,
                    tieneEnvioADomicilio: false,
                    costoEnvioADomicilio: 0.0
                });
            } else {
                //el proveedor existe, debo verificar si tiene cobertura
                console.log('Verificando la cobertura del proveedor ' + proveedor.entidad.razonSocial);
                let i = 0;
                let h = proveedor.cobertura.length;
                if (h == 0) {
                    console.log('El proveedor no tiene areas de cobertura');
                } else {
                    console.log('El proveedor ' + proveedor.entidad.razonSocial + ' tiene ' + h + ' zonas para analizar');

                }
                let direcciones = [];
                while (i < h) {
                    let j = 0;
                    let p = proveedor.cobertura[i].provincias.length;
                    console.log('Cobertura a analizar: ' + proveedor.cobertura[i]._id);
                    if (p > 0) {
                        console.log('El proveedor ' + proveedor.entidad.razonSocial + ' tiene ' + p + ' provincias para analizar');
                    }
                    while (j < p) {
                        // let dire = proveedor.cobertura[i].provincias[j].provincia;
                        let k = 0;
                        let local_hasta = proveedor.cobertura[i].provincias[j].localidades.length;
                        if (local_hasta > 0) {
                            console.log('El proveedor ' + proveedor.entidad.razonSocial + ' tiene ' + local_hasta + ' localidades para analizar');
                        }
                        while (k < local_hasta) {
                            // dire = dire + '-'+proveedor.cobertura[i].provincias[j].localidades
                            let m = 0;
                            let barrios_hasta = proveedor.cobertura[i].provincias[j].localidades[k].barrios.length;
                            while (m < barrios_hasta) {
                                let dire = proveedor.cobertura[i].provincias[j].provincia + '-' + proveedor.cobertura[i].provincias[j].localidades[k].localidad + '-' + proveedor.cobertura[i].provincias[j].localidades[k].barrios[m].barrio;
                                console.log('Comparando las direcciones');
                                console.log('Cobertura: ' + dire.toUpperCase());
                                console.log('Direccion comercio: ' + req.body.direccionComercio.toUpperCase());
                                if (dire.toUpperCase() == req.body.direccionComercio.toUpperCase()) {
                                    //la direccion coincide. Esta dentro de la zona de cobertura del proveedor
                                    console.log('El comercio se encuentra dentro de la zona de cobertura del proveedor');
                                    return res.json({
                                        ok: true,
                                        message: 'El comercio se encuentra dentro de la zona de cobertura del proveedor',
                                        tieneCobertura: true,
                                        tieneEnvioADomicilio: proveedor.cobertura[i].provincias[j].localidades[k].barrios[m].entregaADomicilio,
                                        costoEnvioADomicilio: proveedor.cobertura[i].provincias[j].localidades[k].barrios[m].costoEntrega
                                    });
                                }
                                m++;
                            }
                            k++;
                        }
                        j++;
                    }
                    i++;
                }
                console.log('El comercio no esta dentro de la zona de cobertura del proveedor');
                return res.json({
                    ok: false,
                    message: 'El comercio no esta en la zona de cobertura del proveedor',
                    tieneCobertura: false,
                    tieneEnvioADomicilio: false,
                    costoEnvioADomicilio: 0.0
                });
            }
        });
});



module.exports = app;