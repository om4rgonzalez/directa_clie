const express = require('express');
const app = express();

const ActividadPrincipalProveedor = require('../../config/actividadesPrincipalesProveedores.json');
// const ActividadPrincipalComercio = require('../../config/actividadesPrincipalesComercios.json');





app.get('/conf/actividades_principales_proveedor/', function(req, res) {

    res.json(ActividadPrincipalProveedor);
});

// app.get('/conf/actividades_principales_comercio/', function(req, res) {

//     res.json(ActividadPrincipalComercio);
// });




module.exports = app;