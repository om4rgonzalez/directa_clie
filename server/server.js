require('./config/config');

const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// // parse application/x-www-form-urlencoded
// app.use(bodyParser.urlencoded({ extended: false }));
// // parse application/json
// app.use(bodyParser.json());

let f = new Date();
console.log('Fecha y hora de reinicio de servidor: ' + f);

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');

    next();
});





//indice de rutas

app.use(require('./server_direccion/server_direccion'));
app.use(require('./server_entidades/server_entidades'));
app.use(require('./server_persona/server_persona'));
app.use(require('./server_usuario/server_usuario'));
app.use(require('./server_contacto/server_contacto'));
app.use(require('./server_configuracion/server-configuracion'));
app.use(require('./server_pedido/server_pedido'));
app.use(require('./server_cliente/server_cliente'));
// app.use(require('./server_publicidad/server_publicidad'));
// app.use(require('./server_mensajeria/server_mensajeria'));
app.use(require('./server_stock/server_stock'));
// app.use(require('./server_reportes/server_reportes'));


mongoose.connect(process.env.URLDB, { useNewUrlParser: true }, (err, res) => {
    if (err) throw err;

    console.log('Base de datos ONLINE');
    if (process.env.NODE_ENV == 'prod') {
        console.log('Corriendo en produccion.');
    } else {
        console.log('Corriendo en testing');
    }
});

app.listen(process.env.PORT, () => {
    console.log('Usuario Escuchando el puerto ', process.env.PORT);
});