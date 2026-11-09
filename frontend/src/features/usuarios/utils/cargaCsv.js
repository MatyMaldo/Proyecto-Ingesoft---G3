import { ROL_POR_TIPO_REGISTRO } from '../constants/rolesUsuario.js';

export const CSV_USUARIOS_COLUMNAS = [
    'tipoUsuario', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'dni',
    'telefono', 'correo', 'edad', 'fechaNacimiento', 'dniApoderado'
];

/** Límites por carga, los mismos que aplica el backend a sus cargas masivas (2 MB y 1000 filas). */
export const LIMITE_TAMANO_BYTES = 2 * 1024 * 1024;
export const LIMITE_FILAS = 1000;

function normalizarCsv(valor) {
    return String(valor ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLocaleLowerCase('es');
}

/**
 * Lee el texto de un CSV de usuarios (separador `,` o `;`) y lo convierte en filas normalizadas.
 * Lanza un `Error` con un mensaje legible si el archivo no tiene el formato esperado.
 */
export function leerCsv(texto) {
    const filas = [];
    let fila = [];
    let campo = '';
    let entreComillas = false;
    const contenido = String(texto ?? '').replace(/^﻿/, '');
    let comillasEncabezado = false;
    let comas = 0;
    let puntoYComa = 0;
    for (const caracter of contenido) {
        if (caracter === '"') comillasEncabezado = !comillasEncabezado;
        else if (!comillasEncabezado && caracter === ',') comas += 1;
        else if (!comillasEncabezado && caracter === ';') puntoYComa += 1;
        else if (!comillasEncabezado && (caracter === '\n' || caracter === '\r')) break;
    }
    const separador = puntoYComa > comas ? ';' : ',';

    for (let indice = 0; indice < contenido.length; indice += 1) {
        const caracter = contenido[indice];
        if (entreComillas) {
            if (caracter === '"' && contenido[indice + 1] === '"') {
                campo += '"';
                indice += 1;
            } else if (caracter === '"') {
                entreComillas = false;
            } else {
                campo += caracter;
            }
        } else if (caracter === '"' && campo === '') {
            entreComillas = true;
        } else if (caracter === separador) {
            fila.push(campo);
            campo = '';
        } else if (caracter === '\n' || caracter === '\r') {
            fila.push(campo);
            if (fila.some(valor => valor.trim() !== '')) filas.push(fila);
            fila = [];
            campo = '';
            if (caracter === '\r' && contenido[indice + 1] === '\n') indice += 1;
        } else {
            campo += caracter;
        }
    }
    if (entreComillas) throw new Error('Hay una comilla sin cerrar en el archivo CSV.');
    fila.push(campo);
    if (fila.some(valor => valor.trim() !== '')) filas.push(fila);
    if (filas.length < 2) throw new Error('El CSV debe incluir los encabezados y al menos una fila de usuarios.');

    const encabezados = filas[0].map(normalizarCsv);
    const faltantes = CSV_USUARIOS_COLUMNAS.filter(columna => !encabezados.includes(normalizarCsv(columna)));
    if (faltantes.length) throw new Error(`Faltan columnas requeridas en el encabezado: ${faltantes.join(', ')}.`);
    // El administrador no conoce ni define contraseñas: cada usuario crea la suya con el código que recibe por correo.
    if (encabezados.some(encabezado => ['password', 'contrasena'].includes(encabezado))) {
        throw new Error('El archivo incluye una columna de contraseña. Elimínala: cada usuario creará su propia contraseña con el código de verificación que recibirá en su correo.');
    }

    return filas.slice(1).map((valores, indice) => {
        const datos = Object.fromEntries(encabezados.map((encabezado, posicion) => [encabezado, (valores[posicion] ?? '').trim()]));
        if (valores.slice(encabezados.length).some(valor => valor.trim())) {
            return { linea: indice + 2, error: 'La fila tiene más valores que columnas en el encabezado.' };
        }
        const tipo = normalizarCsv(datos.tipousuario);
        const tipoUsuario = ({ apoderado: 'apoderado', docente: 'docente', estudiante: 'estudiante' })[tipo];
        if (!tipoUsuario) return { linea: indice + 2, error: 'Tipo de usuario debe ser APODERADO, DOCENTE o ESTUDIANTE.' };
        return {
            linea: indice + 2,
            tipoUsuario,
            nombre: datos.nombre ?? '',
            apellidoPaterno: datos.apellidopaterno ?? '',
            apellidoMaterno: datos.apellidomaterno ?? '',
            dni: datos.dni ?? '',
            telefonoTexto: datos.telefono ?? '',
            telefono: (() => {
                const digitos = String(datos.telefono ?? '').replace(/\D/g, '');
                return digitos.length === 11 && digitos.startsWith('51') ? digitos.slice(2) : digitos;
            })(),
            correo: datos.correo ?? '',
            edad: datos.edad ?? '',
            fechaNacimiento: datos.fechanacimiento ?? '',
            dniApoderado: datos.dniapoderado ?? ''
        };
    });
}

/** Un problema de una fila: `campo` es la etiqueta legible de la columna (o `null` si afecta a toda la fila). */
function problema(campo, mensaje) {
    return { campo, mensaje };
}

/** Texto de un problema para listas y reportes, p. ej. "Teléfono: debe tener exactamente 9 dígitos". */
export function textoProblema({ campo, mensaje }) {
    return campo ? `${campo}: ${mensaje}` : mensaje;
}

/**
 * Valida las filas leídas y las ordena (apoderados, docentes, estudiantes).
 *
 * Devuelve:
 * - `errores`: una cadena por fila con problemas (`"Fila 3: ..."`); vacío si todo está en orden.
 * - `filasOrdenadas`: filas sin error de estructura, en el orden de registro.
 * - `detalleFilas`: todas las filas del archivo, en el orden original, con sus `problemas` ya redactados
 *   para mostrarlos junto a cada fila.
 */
export function validarFilasCsv(filas, usuarios, usarMock) {
    const problemasPorLinea = new Map();
    const errores = [];
    for (const fila of filas.filter(fila => fila.error)) {
        problemasPorLinea.set(fila.linea, [problema(null, fila.error)]);
        errores.push(`Fila ${fila.linea}: ${fila.error}`);
    }
    const correos = new Set(usuarios.map(usuario => normalizarCsv(usuario.correo)).filter(Boolean));
    const dniPorRol = new Set(usuarios.map(usuario => `${normalizarCsv(usuario.rol)}:${usuario.dni}`));
    const dniApoderados = new Set(usuarios.filter(usuario => usuario.rol === 'Apoderado' && usuario.activo).map(usuario => usuario.dni));
    const dniApoderadosCsv = new Set(filas.filter(fila => fila.tipoUsuario === 'apoderado' && !fila.error).map(fila => fila.dni));
    const prioridad = { apoderado: 0, docente: 1, estudiante: 2 };
    const filasOrdenadas = filas.filter(fila => !fila.error).slice().sort((a, b) => prioridad[a.tipoUsuario] - prioridad[b.tipoUsuario] || a.linea - b.linea);

    for (const fila of filasOrdenadas) {
        const problemasFila = [];
        const rol = ROL_POR_TIPO_REGISTRO[fila.tipoUsuario];
        if (!fila.nombre || fila.nombre.length > 80) problemasFila.push(problema('Nombre', 'es obligatorio (máximo 80 caracteres)'));
        if (!fila.apellidoPaterno || fila.apellidoPaterno.length > 80) problemasFila.push(problema('Apellido paterno', 'es obligatorio (máximo 80 caracteres)'));
        if (fila.apellidoMaterno.length > 80) problemasFila.push(problema('Apellido materno', 'admite hasta 80 caracteres'));
        const dniValido = usarMock && fila.tipoUsuario === 'apoderado' ? /^(?:\d{8}|\d{9})$/.test(fila.dni) : /^\d{8}$/.test(fila.dni);
        if (!dniValido) problemasFila.push(problema('DNI', usarMock && fila.tipoUsuario === 'apoderado' ? 'debe tener 8 o 9 dígitos' : 'debe tener 8 dígitos'));
        const dniClave = `${normalizarCsv(rol)}:${fila.dni}`;
        if (dniPorRol.has(dniClave)) problemasFila.push(problema('DNI', 'ya existe un usuario con ese DNI y rol (en el sistema o repetido en el archivo)'));
        dniPorRol.add(dniClave);
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fila.correo) || fila.correo.length > 160) problemasFila.push(problema('Correo', 'no tiene un formato válido'));
        const correoClave = normalizarCsv(fila.correo);
        if (correoClave && correos.has(correoClave)) problemasFila.push(problema('Correo', 'ya está registrado (en el sistema o repetido en el archivo)'));
        if (correoClave) correos.add(correoClave);
        const telefonoIngresado = fila.telefonoTexto.trim() !== '';
        if (telefonoIngresado && (!/^[+\d\s().-]+$/.test(fila.telefonoTexto) || !/^\d{9}$/.test(fila.telefono))) problemasFila.push(problema('Teléfono', 'debe tener exactamente 9 dígitos'));
        if ((fila.tipoUsuario === 'estudiante' || (usarMock && fila.tipoUsuario === 'docente')) && !telefonoIngresado) problemasFila.push(problema('Teléfono', 'es obligatorio'));
        if (fila.tipoUsuario === 'apoderado' || (usarMock && fila.tipoUsuario === 'docente')) {
            const edad = Number(fila.edad);
            const edadMinima = usarMock ? 18 : 1;
            if (!/^\d+$/.test(fila.edad) || !Number.isSafeInteger(edad) || edad < edadMinima) problemasFila.push(problema('Edad', `debe ser un número entero de ${edadMinima} o más`));
        }
        if (fila.tipoUsuario === 'estudiante') {
            const fecha = new Date(`${fila.fechaNacimiento}T00:00:00`);
            const hoy = new Date();
            hoy.setHours(23, 59, 59, 999);
            if (!/^\d{4}-\d{2}-\d{2}$/.test(fila.fechaNacimiento) || Number.isNaN(fecha.getTime()) || fecha.toISOString().slice(0, 10) !== fila.fechaNacimiento || fecha > hoy) problemasFila.push(problema('Fecha de nacimiento', 'debe tener formato AAAA-MM-DD, ser una fecha válida y no posterior a hoy'));
            if (!fila.dniApoderado || (!dniApoderados.has(fila.dniApoderado) && !dniApoderadosCsv.has(fila.dniApoderado))) problemasFila.push(problema('DNI del apoderado', 'debe ser el de un apoderado activo ya registrado o incluido en este archivo'));
        }
        if (problemasFila.length) {
            problemasPorLinea.set(fila.linea, problemasFila);
            errores.push(`Fila ${fila.linea}: ${problemasFila.map(textoProblema).join('; ')}.`);
        }
    }

    const detalleFilas = filas
        .map(fila => ({
            linea: fila.linea,
            tipoUsuario: fila.tipoUsuario ?? null,
            nombre: [fila.nombre, fila.apellidoPaterno].filter(Boolean).join(' '),
            dni: fila.dni ?? '',
            correo: fila.correo ?? '',
            dniApoderado: fila.dniApoderado ?? '',
            problemas: problemasPorLinea.get(fila.linea) ?? []
        }))
        .sort((a, b) => a.linea - b.linea);

    return { errores, filasOrdenadas, detalleFilas };
}

/**
 * Describe cada columna del CSV para mostrarla como tabla de ayuda: a quién aplica, la regla y un ejemplo.
 * Las reglas dependen del modo (el mock exige además teléfono y edad a los docentes).
 *
 * @param {boolean} usarMock
 * @returns {Array<{ campo: string, obligatorio: string, regla: string, ejemplo: string }>}
 */
export function describirColumnasCsv(usarMock) {
    return [
        { campo: 'tipoUsuario', obligatorio: 'Todos', regla: 'APODERADO, DOCENTE o ESTUDIANTE', ejemplo: 'ESTUDIANTE' },
        { campo: 'nombre', obligatorio: 'Todos', regla: 'Hasta 80 caracteres', ejemplo: 'Diego' },
        { campo: 'apellidoPaterno', obligatorio: 'Todos', regla: 'Hasta 80 caracteres', ejemplo: 'Soto' },
        { campo: 'apellidoMaterno', obligatorio: 'Opcional', regla: 'Hasta 80 caracteres', ejemplo: 'Ramos' },
        { campo: 'dni', obligatorio: 'Todos', regla: '8 dígitos; no puede repetirse para un mismo rol', ejemplo: '10000013' },
        {
            campo: 'telefono',
            obligatorio: usarMock ? 'Estudiantes y docentes' : 'Estudiantes',
            regla: '9 dígitos (opcional para los demás tipos)',
            ejemplo: '900000013'
        },
        { campo: 'correo', obligatorio: 'Todos', regla: 'Correo válido; no puede repetirse', ejemplo: 'diego@mail.com' },
        {
            campo: 'edad',
            obligatorio: usarMock ? 'Apoderados y docentes' : 'Apoderados',
            regla: `Número entero de ${usarMock ? 18 : 1} o más`,
            ejemplo: '40'
        },
        { campo: 'fechaNacimiento', obligatorio: 'Estudiantes', regla: 'AAAA-MM-DD, no posterior a hoy', ejemplo: '2012-03-15' },
        {
            campo: 'dniApoderado',
            obligatorio: 'Estudiantes',
            regla: 'DNI de un apoderado ya registrado o incluido en el archivo',
            ejemplo: '10000011'
        }
    ];
}

/** Descarga la plantilla vacía con los encabezados esperados. */
export function descargarPlantillaCsv() {
    const contenido = `﻿${CSV_USUARIOS_COLUMNAS.join(',')}\r\n`;
    const archivo = new Blob([contenido], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(archivo);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = 'plantilla-carga-usuarios.csv';
    enlace.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}
