const jwt = require('jsonwebtoken');
const permisos = require('../src/permisos.json');


// =====================
// Verificar Token
// =====================
let verificaToken = (req, res, next) => {

    let token = req.get('token');
    jwt.verify(token, process.env.SEED, (err, decoded) => {

        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Token no válido'
                }
            });
        }

        req.usuario = decoded.usuario;
        // console.log(req.usuario);
        next();

    });



};

// =====================
// Verifica AdminRole
// =====================
let verifica_Permiso = (req, res, next) => {

    let usuario = req.usuario;

    for (var p of permisos) {
        // console.log("precedencia: " + usuario.rol.precedencia);
        // console.log("url del archivo: " + p.url.trim());
        // console.log("url del request:" + req.url);
        if (p.url.trim() === req.url.trim()) {
            // console.log("rol del usuario: " + usuario.rol.precedencia);
            // console.log(p.roles);
            // if (usuario.rol.precedencia in p.roles) {
            if (p.roles.includes(usuario.rol.precedencia)) {
                next();
            } else
                return res.json({
                    ok: false,
                    err: {
                        message: 'Permiso denegado. El Rol del usuario no tiene permiso para acceder a esta funcion'
                    }
                });
        }

    }

};



module.exports = {
    verificaToken,
    verifica_Permiso
}