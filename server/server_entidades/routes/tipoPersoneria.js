const express = require('express');
const app = express();

const TipoPersoneria = require('../../config/tiposPersoneria.json');

app.get('/conf/tipos_personeria/', function(req, res) {

    res.json(TipoPersoneria);
})



// app.post('/conf/inicializar_tipo_personeria/', function(req, res) {
//     console.log('Empezando el init');
//     let valores = [{ nombreTipoPersoneria: 'S.R.L', orden: 3 },
//         { nombreTipoPersoneria: 'S.A.', orden: 2 },
//         { nombreTipoPersoneria: 'MONOTRIBUTO', orden: 1 },
//         { nombreTipoPersoneria: 'S.A.S.', orden: 5 },
//         { nombreTipoPersoneria: 'COOPERATIVA', orden: 4 },
//         { nombreTipoPersoneria: 'S.C.A.', orden: 6 },
//         { nombreTipoPersoneria: 'NO TIENE', orden: 0 }
//     ];

//     let respuesta = [];
//     for (var i = 0; i < valores.length; i++) {
//         let item = new TipoPersoneria({
//             nombreTipoPersoneria: valores[i].nombreTipoPersoneria,
//             orden: valores[i].orden
//         });
//         item.save();
//     }

//     return res.status(400).json({
//         ok: true,
//         message: 'Los valores se cargaron correctamente'
//     });
// });


// app.get('/conf/tipos_personeria/', async function(req, res) {
//     TipoPersoneria.find()
//         .sort({ "orden": 1 })
//         .where({ 'activo': true })
//         .exec((err, tipoPersoneria) => {
//             if (err) {
//                 return res.status(500).json({
//                     ok: false,
//                     err
//                 });
//             }

//             if (!tipoPersoneria) {
//                 return res.status(400).json({
//                     ok: false,
//                     err: {
//                         message: 'Error en la conexion a la base de datos'
//                     }
//                 });
//             }
//             return res.json({
//                 ok: true,
//                 recordsTotal: tipoPersoneria.length,
//                 recordsFiltered: tipoPersoneria.length,
//                 tipoPersoneria
//             });

//         });
// })




module.exports = app;