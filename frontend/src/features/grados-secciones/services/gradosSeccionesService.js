import { USAR_MOCK } from '../../../shared/api/configuracionApi.js';
import { consultarEstructuraMock, crearGradoMock, crearSeccionMock } from './mocks/estructuraEscolarMock.js';

// No se inventan endpoints: reemplazar este adaptador cuando exista contrato API.
const sinContrato = () => Promise.resolve({ exitoso: false, datos: null, mensaje: 'La conexión de grados y secciones con el backend aún no está disponible.' });

export const consultarEstructura = () => USAR_MOCK ? consultarEstructuraMock() : sinContrato();
export const crearGrado = (datos) => USAR_MOCK ? crearGradoMock(datos) : sinContrato();
export const crearSeccion = (datos) => USAR_MOCK ? crearSeccionMock(datos) : sinContrato();
