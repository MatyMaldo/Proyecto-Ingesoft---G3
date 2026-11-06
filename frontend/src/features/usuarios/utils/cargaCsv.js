import { ROL_POR_TIPO_REGISTRO } from '../constants/rolesUsuario.js';

export const CSV_USUARIOS_COLUMNAS = [
    'tipoUsuario', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'dni',
    'telefono', 'correo', 'password', 'edad', 'fechaNacimiento', 'dniApoderado'
];

function normalizarCsv(valor) {
    return String(valor ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLocaleLowerCase('es');
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
    const contenido = String(texto ?? '').replace(/^\uFEFF/, '');
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

    return filas.slice(1).map((valores, indice) => {
        const datos = Object.fromEntries(encabezados.map((encabezado, posicion) => [encabezado, (valores[posicion] ?? '').trim()]));
        if (valores.slice(encabezados.length).some(valor => valor.trim())) {
            return { linea: indice + 2, error: 'La fila tiene más valores que columnas en el encabezado.' };
        }
        const tipo = normalizarCsv(datos.tipousuario);
        const tipoUsuario = ({ apoderado: 'apoderado', docente: 'docente', estudiante: 'estudiante' })[tipo];
        if (!tipoUsuario) return { linea: indice + 2, error: 'tipoUsuario debe ser APODERADO, DOCENTE o ESTUDIANTE.' };
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
            password: datos.password ?? '',
            edad: datos.edad ?? '',
            fechaNacimiento: datos.fechanacimiento ?? '',
            dniApoderado: datos.dniapoderado ?? ''
        };
    });
}

/** Valida las filas leídas y las ordena (apoderados, docentes, estudiantes). Devuelve `{ errores, filasOrdenadas }`. */
export function validarFilasCsv(filas, usuarios, usarMock) {
    const errores = filas.filter(fila => fila.error).map(fila => `Fila ${fila.linea}: ${fila.error}`);
    const correos = new Set(usuarios.map(usuario => normalizarCsv(usuario.correo)).filter(Boolean));
    const dniPorRol = new Set(usuarios.map(usuario => `${normalizarCsv(usuario.rol)}:${usuario.dni}`));
    const dniApoderados = new Set(usuarios.filter(usuario => usuario.rol === 'Apoderado' && usuario.activo).map(usuario => usuario.dni));
    const dniApoderadosCsv = new Set(filas.filter(fila => fila.tipoUsuario === 'apoderado' && !fila.error).map(fila => fila.dni));
    const prioridad = { apoderado: 0, docente: 1, estudiante: 2 };
    const filasOrdenadas = filas.filter(fila => !fila.error).slice().sort((a, b) => prioridad[a.tipoUsuario] - prioridad[b.tipoUsuario] || a.linea - b.linea);

    for (const fila of filasOrdenadas) {
        const erroresFila = [];
        const rol = ROL_POR_TIPO_REGISTRO[fila.tipoUsuario];
        const etiqueta = `Fila ${fila.linea}`;
        if (!fila.nombre || fila.nombre.length > 80) erroresFila.push('nombre es obligatorio y admite hasta 80 caracteres');
        if (!fila.apellidoPaterno || fila.apellidoPaterno.length > 80) erroresFila.push('apellidoPaterno es obligatorio y admite hasta 80 caracteres');
        if (fila.apellidoMaterno.length > 80) erroresFila.push('apellidoMaterno admite hasta 80 caracteres');
        const dniValido = usarMock && fila.tipoUsuario === 'apoderado' ? /^(?:\d{8}|\d{9})$/.test(fila.dni) : /^\d{8}$/.test(fila.dni);
        if (!dniValido) erroresFila.push('DNI debe tener 8 dígitos (el apoderado admite 9 en el modo de demostración)');
        const dniClave = `${normalizarCsv(rol)}:${fila.dni}`;
        if (dniPorRol.has(dniClave)) erroresFila.push('ya existe un usuario con ese DNI y rol');
        dniPorRol.add(dniClave);
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fila.correo) || fila.correo.length > 160) erroresFila.push('correo debe tener un formato válido');
        const correoClave = normalizarCsv(fila.correo);
        if (correoClave && correos.has(correoClave)) erroresFila.push('el correo ya está registrado');
        if (correoClave) correos.add(correoClave);
        const telefonoIngresado = fila.telefonoTexto.trim() !== '';
        if (telefonoIngresado && (!/^[+\d\s().-]+$/.test(fila.telefonoTexto) || !/^\d{9}$/.test(fila.telefono))) erroresFila.push('telefono debe tener exactamente 9 dígitos peruanos');
        if ((fila.tipoUsuario === 'estudiante' || (usarMock && fila.tipoUsuario === 'docente')) && !telefonoIngresado) erroresFila.push('telefono es obligatorio');
        if (!fila.password || fila.password.length < 8 || fila.password.length > 40) erroresFila.push('password es obligatorio y debe tener entre 8 y 40 caracteres');
        if (fila.tipoUsuario === 'apoderado' || (usarMock && fila.tipoUsuario === 'docente')) {
            const edad = Number(fila.edad);
            const edadMinima = usarMock ? 18 : 1;
            if (!/^\d+$/.test(fila.edad) || !Number.isSafeInteger(edad) || edad < edadMinima) erroresFila.push(`edad debe ser un entero de ${edadMinima} o más`);
        }
        if (fila.tipoUsuario === 'estudiante') {
            const fecha = new Date(`${fila.fechaNacimiento}T00:00:00`);
            const hoy = new Date();
            hoy.setHours(23, 59, 59, 999);
            if (!/^\d{4}-\d{2}-\d{2}$/.test(fila.fechaNacimiento) || Number.isNaN(fecha.getTime()) || fecha.toISOString().slice(0, 10) !== fila.fechaNacimiento || fecha > hoy) erroresFila.push('fechaNacimiento debe ser válida y no posterior a hoy');
            if (!fila.dniApoderado || (!dniApoderados.has(fila.dniApoderado) && !dniApoderadosCsv.has(fila.dniApoderado))) erroresFila.push('dniApoderado debe identificar a un apoderado activo existente o incluido en este CSV');
        }
        if (erroresFila.length) errores.push(`${etiqueta}: ${erroresFila.join('; ')}.`);
    }
    return { errores, filasOrdenadas };
}

/** Descarga la plantilla vacía con los encabezados esperados. */
export function descargarPlantillaCsv() {
    const contenido = `\uFEFF${CSV_USUARIOS_COLUMNAS.join(',')}\r\n`;
    const archivo = new Blob([contenido], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(archivo);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = 'plantilla-carga-usuarios.csv';
    enlace.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}
