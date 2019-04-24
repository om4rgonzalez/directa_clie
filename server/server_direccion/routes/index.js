const express = require('express');
const app = express();


app.use(require('./provincia'));
app.use(require('./estadoCasa'));
app.use(require('./domicilio'));

module.exports = app;