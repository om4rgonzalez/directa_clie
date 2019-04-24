//require('./config/config');

//const mongoose = require('mongoose');
const express = require('express');

const app = express();
const bodyParser = require('body-parser');
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
    // parse application/json
app.use(bodyParser.json())

//indice de rutas
app.use(require('./routes/index'));



module.exports = app;