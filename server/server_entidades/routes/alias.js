const express = require('express');
const app = express();

const Alias = require('../models/alias');
const Proveedor = require('../models/proveedor');

app.post('/alias/actualizar/', async function(req, res) {

    Alias.findOneAndUpdate({ _id: req.body.idAlias }, { $set: { alias: req.body.alias } },
        async function(err, exito) {
            if (err) {
                console.log('La actualizacion del alias produjo un error');
                console.log(err.message);
                return res.json({
                    ok: false,
                    message: 'La actualizacion del alias produjo un error'
                });
            }

            res.json({
                ok: true,
                message: 'Alias actualizado'
            });
        })
});


app.get('/alias/listar_alias/', async function(req, res) {
    Proveedor.findOne({ _id: req.query.idProveedor })
        .populate({ path: 'red', populate: { path: 'comercio', populate: { path: 'entidad' } } })
        .exec(async(err, proveedores) => {
            if (err) {
                console.log('La consulta de proveedores para listar los alias devolvio');
                console.log(err.message);
                return res.json({
                    ok: false,
                    message: 'La consulta de proveedores para listar los alias devolvio',
                    alias: null
                });
            }

            if (proveedores == null) {
                console.log('La busqueda de proeedor para listar los alias no devolvio resultados');
                return res.json({
                    ok: false,
                    message: 'La busqueda de proeedor para listar los alias no devolvio resultados',
                    alias: null
                });
            }

            let i = 0;
            let hasta = proveedores.red.length;
            let alias_ = [];
            while (i < hasta) {
                // console.log(proveedores.red[i]);
                alias_.push({
                    _id: proveedores.red[i]._id,
                    alias: proveedores.red[i].alias,
                    cuit: proveedores.red[i].comercio.entidad.cuit,
                    razonSocial: proveedores.red[i].comercio.entidad.razonSocial
                });
                i++;
            }

            res.json({
                ok: true,
                message: 'Proveedor encontrado',
                alias: alias_
            });
        });
})


module.exports = app;