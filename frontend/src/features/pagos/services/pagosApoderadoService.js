import { solicitar } from '../../../shared/api/clienteHttp.js';

const TIEMPO_ESPERA_ACCION_MS = 60000;

/** Años académicos disponibles para el filtro global. */
export function listarAniosAcademicos() {
  return solicitar('/anios-academicos');
}

/** Estudiantes vinculados al apoderado autenticado. */
export function listarEstudiantesApoderado(anioId) {
  return solicitar('/usuarios/apoderados/me/estudiantes', {
    parametros: { anioId }
  });
}

/** Compromisos de pago de un estudiante para un año. */
export function listarCompromisosApoderado(estudianteId, anio) {
  return solicitar(
    `/compromisos-pago/apoderado/estudiante/${encodeURIComponent(estudianteId)}`,
    { parametros: { anio } }
  );
}

/** Pagos registrados para un compromiso. */
export function listarPagosCompromiso(compromisoId) {
  return solicitar(
    `/pagos/apoderado/compromiso/${encodeURIComponent(compromisoId)}`
  );
}

/** Registra un pago con su comprobante PDF. */
export function registrarPagoApoderado({ compromisoId, montoPagado, comprobante }) {
  const formulario = new FormData();
  formulario.append('compromisoId', String(compromisoId));
  formulario.append('montoPagado', String(montoPagado));
  formulario.append('comprobante', comprobante);
  return solicitar('/pagos/apoderado/registrar', {
    metodo: 'POST',
    cuerpoFormulario: formulario,
    tiempoEsperaMs: TIEMPO_ESPERA_ACCION_MS
  });
}
