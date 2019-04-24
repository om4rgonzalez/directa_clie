const express = require('express');
const app = express();
const cities = require('../src/states-cityes.json');



app.get('/domicilio/provincias', function(req, res) {

    res.json(cities);
})



module.exports = app;