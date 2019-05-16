const express = require('express');
const app = express();
const Domicilio = require('../models/domicilio');
const HistoriaCambios = require('../models/historiaCambio');



app.post('/domicilio/nuevo', function(req, res) {
    let objeto = req.body;
    let domicilio = new Domicilio({
        _id: objeto._id,
        pais: objeto.pais,
        provincia: objeto.provincia,
        localidad: objeto.localidad,
        barrio: objeto.barrio,
        calle: objeto.calle,
        numeroCasa: objeto.numeroCasa,
        piso: objeto.piso,
        numeroDepartamento: objeto.numeroDepartamento,
        latitud: objeto.latitud,
        longitud: objeto.longitud,
        codigoPostal: objeto.codigoPostal,
        URLUbicacion: objeto.URLUbicacion,
        referenciaUbicacion: objeto.referenciaUbicacion
    });


    domicilio.save((err, domicilioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        //guardo el nuevo contacto en el historial de cambios
        let historia = new HistoriaCambios({
            domicilio: domicilioDB._id,
            pais: objeto.pais,
            provincia: objeto.provincia,
            localidad: objeto.localidad,
            barrio: objeto.barrio,
            calle: objeto.calle,
            numeroCasa: objeto.numeroCasa,
            piso: objeto.piso,
            numeroDepartamento: objeto.numeroDepartamento,
            latitud: objeto.latitud,
            longitud: objeto.longitud,
            codigoPostal: objeto.codigoPostal,
            URLUbicacion: objeto.URLUbicacion,
            referenciaUbicacion: objeto.referenciaUbicacion,
            numeroCambio: 1
        });

        historia.save((err, historiaDB) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                domicilioDB
            });
        });
    });
})

// app.put('/contacto', function(req, res) {
//     res.json('Modifica los datos de un usuario')
// })

// app.delete('/contacto', function(req, res) {
//     res.json('Cambia el estado de un usuario a "borrado"')
// })

module.exports = app;