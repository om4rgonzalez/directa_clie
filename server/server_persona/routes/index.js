const express = require('express');
const app = express();


// app.use(require('./tipoDni'));
app.use(require('./persona'));


module.exports = app;