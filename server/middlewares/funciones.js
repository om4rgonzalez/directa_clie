const axios = require('axios');
const EstadosPedido = require('../server_pedido/src/estados_pedido.json');
const fs = require('fs');



let nuevaEntidad = async(entidad) => {

    // console.log('Entidad recibida');
    // console.log(entidad);

    let URL = process.env.URL_SERVICE + process.env.PORT + '/entidad/nueva_/';
    // console.log('URL a conectarse: ' + URL);
    let resp = await axios.post(URL, {
        // pais: domicilio.pais,
        // provincia: domicilio.provincia,
        // localidad: domicilio.localidad,
        // barrio: domicilio.barrio,
        // calle: domicilio.calle,
        // numeroCasa: domicilio.numeroCasa,
        // piso: domicilio.piso,
        // numeroDepartamento: domicilio.numeroDepartamento,
        // latitud: domicilio.latitud,
        // longitud: domicilio.longitud,
        // codigoPostal: domicilio.codigoPostal,
        idEntidad: entidad._id,
        cuit: entidad.cuit,
        razonSocial: entidad.razonSocial,
        actividadPrincipal: entidad.actividadPrincipal,
        tipoPersoneria: entidad.tipoPersoneria

    });


    return {
        ok: true,
        domicilio: resp.data.entidadDB.domicilio,
        _id: resp.data.entidadDB._id
    }

};

let nuevoPuntoVenta = async(punto) => {

    let URL = process.env.URL_SERVICE + process.env.PORT + '/proveedor/nuevo_punto_venta/';
    // console.log('URL a conectarse: ' + URL);
    let resp = await axios.post(URL, {
        _id: punto._id,
        nombrePuntoVenta: punto.nombrePuntoVenta,
        domicilio: punto.domicilio
    });


    return {
        ok: true
    }

};



const nuevoDetalle = async(detalle) => {

    let URL = process.env.URL_SERVICE + process.env.PORT + '/pedido/nuevo_detalle';
    // console.log('URL a conectarse: ' + URL);
    let resp = await axios.post(URL, {
        _id: detalle._id,
        producto: detalle.producto,
        unidadMedida: detalle.unidadMedida,
        cantidad: detalle.cantidad
    });

    return {
        ok: true
    }

}

let nuevoDomicilio = async(domicilio) => {

    let URL = process.env.URL_SERVICE + process.env.PORT + '/domicilio/nuevo';
    // console.log('URL a conectarse: ' + URL);
    let resp = await axios.post(URL, {
        _id: domicilio._id,
        pais: domicilio.pais,
        provincia: domicilio.provincia,
        localidad: domicilio.localidad,
        barrio: domicilio.barrio,
        calle: domicilio.calle,
        numeroCasa: domicilio.numeroCasa,
        piso: domicilio.piso,
        numeroDepartamento: domicilio.numeroDepartamento,
        latitud: domicilio.latitud,
        longitud: domicilio.longitud,
        codigoPostal: domicilio.codigoPostal
    });

    return {
        ok: true
    }

};


let nuevaPersona = async(persona) => {

    let URL = process.env.URL_SERVICE + process.env.PORT + '/persona/nueva/';
    let resp = await axios.post(URL, {
        _id: persona._id,
        tipoDni: persona.tipoDni,
        dni: persona.dni,
        apellidos: persona.apellidos,
        nombres: persona.nombres,
        domicilio: persona.domicilio,
        fechaNacimiento: persona.fechaNacimiento
    });
    // console.log('termino la ejecucion del axios');
    // console.log('Respuesta del servicio: ' + resp.contactoDB._id);

    return resp.data;

};

const nuevoContacto = async(contacto) => {

    let URL = process.env.URL_SERVICE + process.env.PORT + '/contacto/nuevo/';
    // console.log('URL a conectarse: ' + URL);
    let resp = await axios.post(URL, {
        _id: contacto._id,
        tipoContacto: contacto.tipoContacto,
        codigoPais: contacto.codigoPais,
        codigoArea: contacto.codigoArea,
        numeroCelular: contacto.numeroCelular,
        numeroFijo: contacto.numeroFijo,
        email: contacto.email
    });
    // console.log('termino la ejecucion del axios');
    // console.log('Respuesta del servicio: ' + resp.contactoDB._id);

    return {
        ok: true
    }

};

const nuevoUsuario = async(usuario) => {
    let URL = process.env.URL_SERVICE + process.env.PORT + '/usuario/nuevo_usuario_arranque/';
    // console.log(usuario);
    let resp = await axios.post(URL, {
        _id: usuario._id,
        idPersona: 0,
        tipoDni: usuario.persona.tipoDni,
        dni: usuario.persona.dni,
        apellidos: usuario.persona.apellidos,
        nombres: usuario.nombres,
        // 'persona.fechaNacimiento': usuario.persona.fechaNacimiento,
        // 'domicilio.pais': usuario.persona.domicilio.pais,
        // 'domicilio.provincia': usuario.persona.domicilio.provincia,
        // 'domicilio.localidad': usuario.persona.domicilio.localidad,
        // 'domicilio.barrio': usuario.persona.domicilio.barrio,
        // 'domicilio.calle': usuario.persona.domicilio.calle,
        // 'domicilio.numeroCasa': usuario.persona.domicilio.numeroCasa,
        // "contactos":[{"tipoContacto": "Telefono Celular",
        //     "codigoPais": "+549",
        //     "codigoArea": "388",
        //     "numeroCelular": "6011979"},
        //     {"tipoContacto": "Email",
        //     "email": "ismael_14@gmail.com"}
        //     ],
        nombreUsuario: usuario.nombreUsuario,
        clave: usuario.clave,
        rol: usuario.rol
    });
    // console.log('termino la ejecucion del axios');
    // console.log('Respuesta del servicio: ' + resp.contactoDB._id);

    return {
        ok: true
    }
};


const combosNuevoProveedor = async() => {
    let URL = process.env.URL_SERVICE + process.env.PORT + '/domicilio/provincias';
    // console.log('URL: ' + URL);
    let provincias_ = await axios.get(URL);
    URL = process.env.URL_SERVICE + process.env.PORT + '/conf/actividades_principales_proveedor/';
    let actividadesProveedor = await axios.get(URL);
    URL = process.env.URL_SERVICE + process.env.PORT + '/conf/actividades_principales_comercio/';
    let actividadesComercio = await axios.get(URL);
    URL = process.env.URL_SERVICE + process.env.PORT + '/conf/tipos_personeria/';
    let tiposPersoneria = await axios.get(URL);
    // URL = process.env.URL_SERVICE + process.env.PORT + '/domicilio/estadosCasa';
    // let estadosCasa = await axios.get(URL);
    URL = process.env.URL_SERVICE + process.env.PORT + '/contacto/tipos';
    let tiposContacto_ = await axios.get(URL);
    // URL = process.env.URL_SERVICE + process.env.PORT + '/persona/tipos_dni';
    // let tiposDni = await axios.get(URL);
    // URL = process.env.URL_SERVICE + process.env.PORT + '/cliente/obtener_tipos';
    // let tiposCliente = await axios.get(URL);
    // URL = process.env.URL_SERVICE + process.env.PORT + '/credito/obtener_tipos_planes';
    // let tiposPlanes = await axios.get(URL);


    let respuesta = new Object({
        provincias: provincias_.data,
        actividadesPrincipalesComercio: actividadesComercio.data,
        actividadesPrincipalesProveedor: actividadesProveedor.data,
        tiposPersoneria: tiposPersoneria.data,
        estadosPedido: EstadosPedido,
        // estadosCasa: estadosCasa.data.estadosCasaDB,
        tiposContacto: tiposContacto_.data.TiposContacto
            // tiposDni: tiposDni.data.tiposDni,
            // tiposCliente: tiposCliente.data.tipoCliente,
            // tiposPlanes: tiposPlanes.data.tipoPlan,
            // documentos: documentos_,
            // itemAnalisis: ItemAnalisis
    });
    return respuesta;
};


let login = async(usuario) => {
    let URL = process.env.URL_SERVICE + process.env.PORT + '/usuario/ingresar/';
    // console.log(usuario);
    let resp = await axios.post(URL, {

        nombreUsuario: usuario.nombreUsuario,
        clave: usuario.clave,
        idPush: usuario.idPush
    });
    if (resp.data.ok) {
        return {
            ok: true,
            _id: resp.data.usuario._id,
            token: resp.data.token
        };
    } else {
        return {
            ok: false,
            message: 'Usuario o clave incorrecta'
        };
    }
};

let buscarLoginUsuario = async(usuario) => {
    let URL = process.env.URL_SERVICE + process.env.PORT + '/usuario/buscar_login/';
    let resp = await axios.post(URL, {
        idUsuario: usuario
    });
    // console.log('Data que devuelve la respuesta: ');
    // console.log(resp.data);
    return resp.data;
};


//la funcion busca si el proveedor esta cargado en la red del comercio
let verificarExistenciaProveedorEnRedComercio = async(proveedor, comercio) => {
    let URL = process.env.URL_SERVICE + process.env.PORT + '/comercio/buscar_proveedor/';
    let resp = await axios.post(URL, {
        proveedor: proveedor,
        comercio: comercio
    });

    // console.log('la funcion devolvio ' + resp.data.ok);
    // console.log(resp.data.message);

    if (resp.data.ok) {
        return {
            ok: false,
            message: 'El proveedor ya es parte de la red'
        };
    }
    return {
        ok: true,
        message: 'El proveedor no es parte de la red'
    };

};

//la funcion busca si el proveedor esta cargado en la red del comercio
let verificarExistenciaProveedorEnRedProveedor = async(proveedor, comercio) => {
    let URL = process.env.URL_SERVICE + process.env.PORT + '/proveedor/buscar_proveedor_en_red/';
    let resp = await axios.post(URL, {
        proveedor: proveedor,
        comercio: comercio
    });

    console.log('la funcion devolvio ' + resp.data.ok);
    console.log(resp.data.message);

    if (resp.data.ok) {
        return {
            ok: false,
            message: 'El proveedor ya es parte de la red'
        };
    }
    return {
        ok: true,
        message: 'El proveedor no es parte de la red'
    };

};


let cargarImagenPublicidad = async(imagen, nombre) => {
    var tmp_path = imagen.path; //ruta del archivo
    var tipo = imagen.type; //tipo del archivo

    if (tipo == 'image/png' || tipo == 'image/jpg' || tipo == 'image/jpeg') {
        var target_path = process.env.UrlImagen + nombre + '.' + imagen.name.split(".").pop(); // hacia donde subiremos nuestro archivo dentro de nuestro servidor
        // console.log('Path Destino: ' + target_path);
        await fs.rename(tmp_path, target_path, async function(err) {
            //Escribimos el archivo

            if (err) {
                console.log('La subida del archivo produjo un error: ' + err.message);
                return {
                    ok: false
                };
            }

            return {
                ok: true
            };
        });
    } else {
        return {
            ok: false
        };
    }
};

let buscarPlantilla = async(metodo, tipoError) => {
    let URL = process.env.URL_SERVICE + process.env.PORT + '/plantilla/buscar_plantilla/';

    // console.log('URL buscar plantilla: ' + URL);
    // console.log('Parametros: ');
    // console.log('Metodo: ' + metodo);
    // console.log('tipoError: ' + tipoError);
    let resp = await axios.post(URL, {
        metodo: metodo,
        tipoError: tipoError
    });

    // console.log('la funcion devolvio ' + resp.data.ok);
    // console.log(resp.data.message);
    return {
        error: resp.data.error,
        message: resp.data.message,
        plantilla: resp.data.plantilla
    };

};

let nuevoMensaje = async(mensaje) => {
    let URL = process.env.URL_SERVICE + process.env.PORT + '/bandeja_salida/nuevo_mensaje/';
    // console.log('URL de acceso a nuevo mensaje: ' + URL);
    let resp = await axios.post(URL, {
        metodo: mensaje.metodo,
        tipoError: mensaje.tipoError,
        parametros: mensaje.parametros,
        valores: mensaje.valores,
        buscar: mensaje.buscar,
        esPush: mensaje.esPush,
        destinoEsProveedor: mensaje.destinoEsProveedor,
        destino: mensaje.destino
    });

    // console.log('la funcion devolvio ' + resp.data.ok);
    // console.log(resp.data.message);
    return resp;
};

let buscarParametros = async(objeto) => {
    let URL = process.env.URL_SERVICE + process.env.PORT + '/bandeja_salida/buscar_parametros/';
    let resp = await axios.post(URL, {
        parametro: objeto.parametro,
        valor: objeto.valor
    });
    // console.log('La funcion de busqueda de parametros devuelve');
    // console.log(resp.data);
    return resp.data;
};

let buscarDestinos = async(objeto) => {
    let URL = process.env.URL_SERVICE + process.env.PORT + '/bandeja_salida/buscar_destino/';
    let resp = await axios.post(URL, {
        esPush: objeto.esPush, //boolean
        esProveedor: objeto.esProveedor, //boolean
        id: objeto.id
    });
    // console.log('La funcion de busqueda de parametros devuelve');
    // console.log(resp.data);
    return resp.data;
};

let enviarPush = async(players, titulo, mensaje) => {
    let URL = process.env.URL_SERVICE + process.env.PORT + '/bandeja_salida/enviar/';
    let resp = await axios.post(URL, {
        players: players,
        titulo: titulo,
        mensaje: mensaje
    });
    // console.log('La funcion de busqueda de parametros devuelve');
    // console.log(resp.data);
    return resp.data;
};

let buscarProveedorPorId = async(id) => {
    let URL = process.env.URL_SERVICE + process.env.PORT + '/proveedor/buscar_proveedor/';
    let resp = await axios.post(URL, {
        idProveedor: id
    });
    // console.log('La funcion de busqueda de parametros devuelve');
    // console.log(resp.data);
    return resp.data;
};

let buscarComercioPorId = async(id) => {
    let URL = process.env.URL_SERVICE + process.env.PORT + '/comercio/buscar_comercio/';
    let resp = await axios.post(URL, {
        idComercio: id
    });
    // console.log('La funcion de busqueda de parametros devuelve');
    // console.log(resp.data);
    return resp.data;
};


let buscarAlias = async(idProveedor, idComercio) => {
    let URL = process.env.URL_SERVICE + process.env.PORT + '/proveedor/buscar_alias/';
    let resp = await axios.post(URL, {
        idProveedor: idProveedor,
        idComercio: idComercio
    });
    // console.log('La funcion de busqueda de parametros devuelve');
    // console.log(resp.data);
    return resp.data;
};

let verificarExistenciaComercio = async(id) => {
    let URL = process.env.URL_SERVICE + process.env.PORT + '/comercio/existe/';
    let resp = await axios.post(URL, {
        comercio: id
    });
    // console.log('Data que devuelve la respuesta: ');
    // console.log(resp.data);
    return resp.data;
};

let verificarExistenciaProveedor = async(id) => {
    let URL = process.env.URL_SERVICE + process.env.PORT + '/proveedor/existe/';
    let resp = await axios.post(URL, {
        proveedor: id
    });
    // console.log('Data que devuelve la respuesta: ');
    // console.log(resp.data);
    return resp.data;
};


let verificarExistenciaInivitacion = async(idProveedor, idComercio) => {
    let URL = process.env.URL_SERVICE + process.env.PORT + '/invitacion/existe/';
    let resp = await axios.post(URL, {
        idComercio: idComercio,
        idProveedor: idProveedor
    });
    // console.log('La funcion de busqueda de parametros devuelve');
    // console.log(resp.data);
    return resp.data;
};

let buscarProveedoresFrecuentes = async(idComercio) => {
    let URL = process.env.URL_SERVICE + process.env.PORT + '/proveedor/consultar_proveedores_frecuentes/';
    // console.log('URL de acceso a nuevo mensaje: ' + URL);
    let resp = await axios.post(URL, {
        idComercio: idComercio
    });

    // console.log('la funcion devolvio ' + resp.data.ok);
    // console.log(resp.data.message);
    return resp.data;
};

let actualizarStock = async(idProducto, valor) => {
    let URL = process.env.URL_SERVICE + process.env.PORT + '/producto/reducir_stock/';
    // console.log('URL de acceso a nuevo mensaje: ' + URL);
    let resp = await axios.post(URL, {
        idProducto: idProducto,
        valor: valor
    });

    return resp.data;
};

let devolverProductosDePedidos = async(pedidos) => {
    let URL = process.env.URL_SERVICE + process.env.PORT + '/reportes/cantidad_productos_en_pedidos/';
    // console.log('URL de acceso a nuevo mensaje: ' + URL);
    let resp = await axios.post(URL, {
        pedidos: pedidos
    });

    return resp.data;
};

let devolverRankingClientes = async(pedidos) => {
    let URL = process.env.URL_SERVICE + process.env.PORT + '/reportes/ranking_clientes/';
    // console.log('URL de acceso a nuevo mensaje: ' + URL);
    let resp = await axios.post(URL, {
        pedidos: pedidos
    });

    return resp.data;
};

let nuevaCobertura = async(cobertura, idProveedor) => {
    let URL = process.env.URL_SERVICE + process.env.PORT + '/proveedor/agregar_cobertura/';
    // console.log('URL de acceso a nuevo mensaje: ' + URL);
    let resp = await axios.post(URL, {
        coberturas: cobertura,
        idProveedor: idProveedor
    });

    return resp.data;
};

let obtenerIndice = async() => {
    let URL = process.env.URL_SERVICE + process.env.PORT + '/producto/generar_indice/';
    // console.log('URL de acceso a nuevo mensaje: ' + URL);
    let resp = await axios.post(URL, {});

    return resp.data;
};

let devolverDomicilioComercio = async(idComercio) => {
    let URL = process.env.URL_SERVICE + process.env.PORT + '/comercio/obtener_direccion/';
    // console.log('URL de acceso a nuevo mensaje: ' + URL);
    let resp = await axios.post(URL, {
        idComercio: idComercio
    });

    return resp.data;
};

let verficiarComercioEnCoberturaProveedor = async(direccionComercio, idProveedor) => {
    let URL = process.env.URL_SERVICE + process.env.PORT + '/cobertura/verificar_cobertura_a_comercio/';
    // console.log('URL de acceso a nuevo mensaje: ' + URL);
    let resp = await axios.post(URL, {
        direccionComercio: direccionComercio,
        idProveedor: idProveedor
    });

    return resp.data;
};

let devolverPeriodosDeEntrega = async(idProveedor) => {
    let URL = process.env.URL_SERVICE + process.env.PORT + '/proveedor/consultar_periodos_entrega/';
    // console.log('URL de acceso a nuevo mensaje: ' + URL);
    let resp = await axios.post(URL, {
        idProveedor: idProveedor
    });

    return resp.data;
};

let buscarProductoPorId = async(idProducto) => {
    let URL = process.env.URL_SERVICE + process.env.PORT + '/producto/obtener_producto/';
    // console.log('URL de acceso a nuevo mensaje: ' + URL);
    let resp = await axios.post(URL, {
        idProducto: idProducto
    });

    return resp.data;
};

let nuevoPedido_ = async(pedidos) => {
    let URL = process.env.URL_SERVICE + process.env.PORT + '/pedido/nuevo/';
    // console.log('URL de acceso a nuevo mensaje: ' + URL);
    let resp = await axios.post(URL, {
        pedidos: pedidos
    });

    return resp.data;
};

let nuevoCliente = async(domicilio, contactos, persona, cliente) => {
    let URL = process.env.URL_SERVICE + process.env.PORT + '/cliente/nuevo/';
    // console.log('URL de acceso a nuevo mensaje: ' + URL);
    let resp = await axios.post(URL, {
        domicilio: domicilio,
        contactos: contactos,
        cliente: cliente,
        persona: persona
    });

    return resp.data;
};

let escribirImagenEnServer = async(target_path, imagen, idImagen, extension) => {
    let URL = 'http://66.97.38.48:3001/producto/escribir_imagen_en_server/';
    console.log('Llamando a la URL: ' + URL);
    let resp = await axios.post(URL, {
        target_path: target_path,
        imagen: imagen,
        idImagen: idImagen,
        extension: extension
    });
    console.log('Devolviendo la respuesta del servidor');
    return resp.data;
};

let cambiarNombreEnServer = async(imagenNombre, imagenExtension) => {
    let URL = 'http://66.97.38.48:3001/producto/cambiar_nombre_en_server/';
    console.log('Llamando a la URL: ' + URL);
    let resp = await axios.post(URL, {
        imagenNombre: imagenNombre,
        imagenExtension: imagenExtension
    });
    console.log('Devolviendo la respuesta del servidor');
    return resp.data;
};


let devolverUltimoDni = async() => {
    let URL = process.env.URL_SERVICE + process.env.PORT + '/configuraciones/obtener_ultimo_dni/';
    let resp = await axios.post(URL, {});
    // console.log('Data que devuelve la respuesta: ');
    // console.log(resp.data);
    return resp.data;
};

let devolverProveedores = async(subProductos) => {
    let URL = process.env.URL_SERVICE + process.env.PORT + '/subproducto/devolver_proveedores/';
    let resp = await axios.post(URL, {
        subProductos: subProductos
    });
    // console.log('Data que devuelve la respuesta: ');
    // console.log(resp.data);
    return resp.data;
};




module.exports = {
    nuevoDetalle,
    nuevoDomicilio,
    nuevaEntidad,
    nuevoPuntoVenta,
    nuevaPersona,
    nuevoContacto,
    nuevoUsuario,
    combosNuevoProveedor,
    login,
    verificarExistenciaProveedorEnRedComercio,
    cargarImagenPublicidad,
    buscarLoginUsuario,
    buscarPlantilla,
    nuevoMensaje,
    buscarParametros,
    buscarDestinos,
    enviarPush
    // ,nuevaInvitacion
    ,
    verificarExistenciaProveedorEnRedProveedor,
    buscarProveedorPorId,
    buscarComercioPorId,
    buscarAlias,
    verificarExistenciaComercio,
    verificarExistenciaProveedor,
    verificarExistenciaInivitacion,
    buscarProveedoresFrecuentes,
    actualizarStock,
    devolverProductosDePedidos,
    devolverRankingClientes,
    nuevaCobertura,
    obtenerIndice,
    devolverDomicilioComercio,
    verficiarComercioEnCoberturaProveedor,
    devolverPeriodosDeEntrega,
    buscarProductoPorId,
    nuevoPedido_,
    nuevoCliente,
    escribirImagenEnServer,
    cambiarNombreEnServer,
    devolverUltimoDni,
    devolverProveedores
}