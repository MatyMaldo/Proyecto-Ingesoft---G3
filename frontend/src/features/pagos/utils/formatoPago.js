const FORMATO_MONEDA = new Intl.NumberFormat('es-PE', {
  style: 'currency',
  currency: 'PEN',
  minimumFractionDigits: 2
});

export function formatearMonto(valor) {
  const numero = Number(valor);
  return Number.isFinite(numero) ? FORMATO_MONEDA.format(numero) : '—';
}

export function etiquetaTipoCompromiso(tipo) {
  if (tipo === 'MATRICULA') return 'Matrícula';
  if (tipo === 'PENSION') return 'Pensión';
  return tipo ?? '—';
}

export function tonoEstadoPago(estado) {
  if (estado === 'VALIDADO') return 'verde';
  if (estado === 'RECHAZADO') return 'rojo';
  if (estado === 'PENDIENTE') return 'ambar';
  return 'gris';
}

export function etiquetaEstadoPago(estado) {
  if (estado === 'VALIDADO') return 'Validado';
  if (estado === 'RECHAZADO') return 'Rechazado';
  if (estado === 'PENDIENTE') return 'Pendiente';
  return estado ?? '—';
}

export function tonoEstadoCompromiso(estado) {
  if (estado === 'PAGADO') return 'verde';
  if (estado === 'CANCELADO') return 'rojo';
  if (estado === 'PENDIENTE') return 'ambar';
  return 'gris';
}

export function etiquetaEstadoCompromiso(estado) {
  if (estado === 'PAGADO') return 'Pagado';
  if (estado === 'CANCELADO') return 'Cancelado';
  if (estado === 'PENDIENTE') return 'Pendiente';
  return estado ?? '—';
}

export function etiquetaCompromiso(compromiso) {
  const tipo = etiquetaTipoCompromiso(compromiso.tipoCompromiso);
  return compromiso.mes ? `${tipo} · ${compromiso.mes}` : tipo;
}
