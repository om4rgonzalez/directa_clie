const axios = require('axios');
const EstadosPedido = require('../server_pedido/src/estados_pedido.json');
const fs = require('fs');


let obtenerDiaSemana = async() => {
    let date = new Date('02/17/2019');

    let options = {
        weekday: 'long'
            // ,
            // year: 'numeric',
            // month: 'long',
            // day: 'numeric'
    };
    console.log('Numero del dia: ' + date.getDay());
    console.log(date.toLocaleDateString('es-ES', options));
};

let calcularFechaEntrega = async(periodos, fecha) => {
    let dia = await fecha.getDate();


    let mes = await fecha.getMonth();
    mes++;
    if (mes > 12)
        mes = 1;

    let anio = await fecha.getFullYear();
    if (dia.toString().length == 1) {
        dia = '0' + dia;
    }
    if (mes.toString().length == 1) {
        mes = '0' + mes;
    }


    //obtengo el numero del dia de la semana de hoy
    // console.log('Periodos a analizar');
    // console.log(periodos);
    let numeroDia = fecha.getDay();
    let diferencia = 0;
    //ordeno el array de periodos
    let fechas_ = [];
    // periodos_ = await periodos.sort(function(a, b) {
    //     return (b.diaFijo - a.diaFijo)
    // });
    //recorro el array de periodos de entrega
    let i = 0;
    let h = periodos.length;
    // console.log('Fecha que recibe: ' + fecha);
    while (i < h) {
        //verifico si el numero del dia de la semana de hoy es menor que el del periodo
        // console.log('El numero de dia de la semana de la fecha que recibio como parametro es: ' + numeroDia);
        // console.log('El numero de dia del periodo es: ' + periodos[i].diaFijo);

        let j = 1;
        while (true) {
            let f = new Date(mes + '/' + dia + '/' + anio);
            f.setDate(f.getDate() + j);
            // console.log('Nueva fecha calculada: ' + f);
            // console.log(f + ' > ' + fecha);
            if (f > fecha) {
                // console.log('La nueva fecha es mayor, procedo a analizar el dia de la semana');
                if (f.getDay() == periodos[i].diaFijo) {
                    // console.log('Agregando la fecha: ' + f);
                    fechas_.push({
                        fecha: f
                    });
                    break;
                }
            }

            j++;
        }
        // if (numeroDia < periodos[i].diaFijo) {
        //     //cumple con esta condicion, entonces el dia fijo es el dia de entrega
        //     diferencia = periodos[i].diaFijo - numeroDia;
        //     fecha.setDate(fecha.getDate() + diferencia);
        //     console.log('Fecha de entrega: ' + fecha);
        //     return {
        //         ok: true,
        //         fechaEntrega: fecha
        //     }
        // }
        i++;
    }

    fechas_ = await fechas_.sort(function(a, b) {
        return (a.fecha - b.fecha)
    });

    // console.log('Fechas ordenadas');
    // console.log(fechas_);

    return {
        ok: true,
        fechaEntrega: fechas_[0].fecha
    }
};

module.exports = {
    obtenerDiaSemana,
    calcularFechaEntrega
}