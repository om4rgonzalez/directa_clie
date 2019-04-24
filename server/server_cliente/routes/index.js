const express = require('express');
const app = express();

app.use(require('./cliente'));
app.use(require('./tipoCliente'));



module.exports = app;