const express = require('express');
// const cors = require('cors');
const app = express();
const Rol = require('../models/rol');
// const { verificaToken, verifica_Permiso, verificaToken_ } = require('../middlewares/autenticacion');
// const aut = require('../../middlewares/autenticacion');
// const Log = require('../../models/log');


app.get('/usuario/roles', function(req, res) {

    Rol.find({})
        .sort('precedencia')
        .exec((err, rol) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                rol
            });
        });
})

// app.get('/usuario/roles_permitidos', async function(req, res) {
//     let usuario = await aut.validarToken(req.query.token);
//     if (!usuario)
//         res.json({
//             ok: false,
//             message: 'Usuario no valido'
//         });
//     else {
//         console.log('Usuario: ' + usuario);
//         Rol.find({ precedencia: { $gt: usuario.precedencia } })
//             .sort('precedencia')
//             .exec((err, rol) => {
//                 if (err) {
//                     return res.status(400).json({
//                         ok: false,
//                         err
//                     });
//                 }
//                 res.json({
//                     ok: true,
//                     rol
//                 });
//             });
//     }
// })


// app.post('/usuario/roles_permitidos', async function(req, res) {
//     let token = req.body.token;
//     if (!token)
//         return res.status(400).json({
//             ok: false,
//             message: 'El token viene vacio'
//         });
//     let usuario = await aut.validarToken(req.body.token);
//     if (!usuario)
//         res.json({
//             ok: false,
//             message: token
//         });
//     else {
//         // console.log('Usuario: ' + usuario.precedencia);
//         Rol.find({ precedencia: { $gt: usuario.precedencia } })
//             .sort('precedencia')
//             .exec((err, rol) => {
//                 if (err) {
//                     return res.status(400).json({
//                         ok: false,
//                         err
//                     });
//                 }
//                 res.json({
//                     ok: true,
//                     rol
//                 });
//             });
//     }
// })

app.post('/conf/inicializar_roles/', function(req, res) {

    let rolRoot = new Rol({
        nombre: 'ROOT',
        precedencia: 1
    });

    let rolAdmin = new Rol({
        nombre: 'ADMIN',
        precedencia: 2
    });

    let rolVendedor = new Rol({
        nombre: 'PREVENTISTA',
        precedencia: 3
    });

    // let rolCajero = new Rol({
    //     nombre: 'CAJERO',
    //     precedencia: 4
    // });

    let rolCobrador = new Rol({
        nombre: 'COBRADOR',
        precedencia: 4
    });

    let array = [];
    array.push(rolRoot);
    array.push(rolAdmin);
    array.push(rolVendedor);
    // array.push(rolCajero);
    array.push(rolCobrador);


    let valores = [{ nombre: 'ROOT', precedencia: 1 },
        { nombre: 'ADMIN', precedencia: 2 },
        { nombre: 'PREVENTISTA', precedencia: 3 },
        // { nombre: 'CAJERO', precedencia: 4 },
        { nombre: 'COBRADOR', precedencia: 4 }
    ];

    let respuesta = [];
    for (var i = 0; i < valores.length; i++) {
        let item = new Rol({
            nombre: valores[i].nombre,
            precedencia: valores[i].precedencia
        });



        item.save();
    }

    return {
        ok: true,
        message: 'El proceso termino correctamente'
    }

})

// app.put('/rol', function(req, res) {
//     res.json('Modifica los datos de un rol')
// })


// app.delete('/rol', function(req, res) {
//     res.json('Cambia el estado del rol a "borrado"')
// })

module.exports = app;