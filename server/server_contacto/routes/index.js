const express = require('express');
const app = express();

app.use(require('./contacto'));
// app.use(require('./tipoContacto'));
//app.use(require('./rol'));


module.exports = app;