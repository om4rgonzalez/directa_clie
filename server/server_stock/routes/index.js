const express = require('express');
const app = express();

app.use(require('./producto'));
// app.use(require('./rol'));



module.exports = app;