import { USAR_MOCK } from '../../../shared/api/configuracionApi.js';
import { obtenerAlumnosMock } from './mocks/matriculasMock.js';

// No se inventan endpoints: reemplazar este adaptador cuando exista contrato API.
const sinContrato = () => Promise.resolve({ exitoso: false, datos: null, mensaje: 'La conexión de matrículas con el backend aún no está disponible.' });

/**
 * Consulta los alumnos matriculados, opcionalmente filtrados por nombre, DNI o código.
 *
 * @param {{ busqueda?: string }} filtros
 * @returns {Promise<{ exitoso: boolean, datos: Array|null, mensaje: string }>}
 */
export const obtenerAlumnos = (filtros = {}) => USAR_MOCK ? obtenerAlumnosMock(filtros) : sinContrato();
