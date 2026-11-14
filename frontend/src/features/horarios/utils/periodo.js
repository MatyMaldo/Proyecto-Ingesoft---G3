/**
 * Presentación del estado del periodo de matrícula. El backend define y devuelve el valor (p. ej. `SIN_INICIAR`);
 * aquí solo se le da un texto legible. Un estado que no esté en la tabla se muestra igualmente, con el valor del
 * backend convertido a texto normal, para que un estado nuevo nunca aparezca como un código crudo.
 */
const ETIQUETAS_PERIODO = {
  SIN_INICIAR: 'En preparación',
  VIGENTE: 'Vigente',
  FINALIZADO: 'Finalizado'
};

const TONOS_PERIODO = {
  SIN_INICIAR: 'ambar',
  VIGENTE: 'verde',
  FINALIZADO: 'gris'
};

/** «EN_CURSO» → «En curso». */
function humanizar(valor) {
  const texto = String(valor ?? '').trim().replace(/_/g, ' ').toLowerCase();
  return texto ? texto.charAt(0).toUpperCase() + texto.slice(1) : '';
}

export function etiquetaPeriodo(estado) {
  return ETIQUETAS_PERIODO[estado] ?? humanizar(estado);
}

export function tonoPeriodo(estado) {
  return TONOS_PERIODO[estado] ?? 'gris';
}
