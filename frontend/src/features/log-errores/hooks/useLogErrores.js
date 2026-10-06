import { useEffect, useRef, useState } from 'react';

import { obtenerTonoModulo } from '../../../shared/constants/tonosModulo.js';
import { calcularDiasAbarcados, formatearFechaHora } from '../../../shared/utils/formatoFecha.js';
import { obtenerErrores, obtenerResumenErrores } from '../services/logErroresService.js';

/**
 * Opciones del filtro de módulo (`FiltroChips`), en el orden del prototipo.
 * El valor `'TODOS'` identifica el chip "Todos" (ajuste aprobado en `shell.md` §19).
 */
export const OPCIONES_MODULO = [
  { valor: 'TODOS', etiqueta: 'Todos' },
  { valor: 'NOTAS', etiqueta: 'Notas', tono: 'azul' },
  { valor: 'PAGOS', etiqueta: 'Pagos', tono: 'turquesa' },
  { valor: 'MATRICULAS', etiqueta: 'Matrículas', tono: 'ambar' },
  { valor: 'HORARIOS', etiqueta: 'Horarios', tono: 'indigo' },
  { valor: 'AUTENTICACION', etiqueta: 'Autenticación', tono: 'rojo' },
  { valor: 'USUARIOS', etiqueta: 'Usuarios', tono: 'violeta' },
  { valor: 'ASISTENCIA', etiqueta: 'Asistencia', tono: 'verde' },
  { valor: 'REPORTES', etiqueta: 'Reportes', tono: 'cian' }
];

const ETIQUETAS_MODULO = Object.fromEntries(
  OPCIONES_MODULO.filter((opcion) => opcion.valor !== 'TODOS').map((opcion) => [opcion.valor, opcion.etiqueta])
);

/**
 * Tono de cada tipo de error reconocido. Cualquier otro usa `'gris'` (tono por
 * defecto de MASTER).
 */
export const TONOS_TIPO_ERROR = {
  ValidationError: 'ambar',
  TimeoutException: 'cian',
  NullPointerException: 'rojo',
  DataIntegrityViolationException: 'violeta',
  MailSendException: 'rosa',
  FileStorageException: 'indigo'
};

const DEBOUNCE_BUSQUEDA_MS = 300;

// TODO(pregunta): texto propuesto, confirmar con la HU (docs/planes/log-errores.md §7).
const MENSAJE_RANGO_INVALIDO = 'La fecha «Desde» no puede ser posterior a la fecha «Hasta».';

function obtenerTonoTipoError(tipoError) {
  return TONOS_TIPO_ERROR[tipoError] ?? 'gris';
}

/**
 * Adapta un registro crudo de la API/mock a la forma que consume `TablaLogErrores`.
 * Copia solo los campos de la lista cerrada: cualquier campo extra del backend
 * (por ejemplo `traza`, `stackTrace`, `payload`) se descarta aquí.
 */
function adaptarFilaError(registro) {
  const { fecha, hora } = formatearFechaHora(registro.fechaHora);

  return {
    id: registro.id,
    fechaHora: registro.fechaHora,
    fecha,
    hora,
    moduloEtiqueta: ETIQUETAS_MODULO[registro.modulo] ?? registro.modulo,
    moduloTono: obtenerTonoModulo(registro.modulo),
    operacion: registro.operacion,
    tipoError: registro.tipoError,
    tipoErrorTono: obtenerTonoTipoError(registro.tipoError),
    mensaje: registro.mensaje,
    usuario: registro.usuario ?? null
  };
}

function ordenarYAdaptar(lista) {
  return [...(lista ?? [])]
    .sort((a, b) => new Date(b.fechaHora) - new Date(a.fechaHora))
    .map(adaptarFilaError);
}

function construirFiltros({ modulo, busqueda, rangoAplicado }) {
  const filtros = {};

  if (modulo && modulo !== 'TODOS') {
    filtros.modulo = modulo;
  }
  if (busqueda) {
    filtros.busqueda = busqueda;
  }
  if (rangoAplicado.fechaDesde) {
    filtros.fechaDesde = rangoAplicado.fechaDesde;
  }
  if (rangoAplicado.fechaHasta) {
    filtros.fechaHasta = rangoAplicado.fechaHasta;
  }

  return filtros;
}

/**
 * Datos y comportamiento de la pantalla "Log de Errores del Sistema".
 * Filtrado en el servidor (hoy, en el mock): el hook solo arma los filtros,
 * adapta la respuesta y maneja los estados de la pantalla.
 *
 * @returns {{
 *   errores: Array, resumen: Object|null, textoInsignia: string,
 *   estado: 'cargando'|'listo'|'error', recargando: boolean,
 *   modulo: string, busqueda: string, fechaDesde: string, fechaHasta: string,
 *   mensajeErrorRango: string,
 *   establecerModulo: (valor: string) => void,
 *   establecerBusqueda: (valor: string) => void,
 *   establecerFechaDesde: (valor: string) => void,
 *   establecerFechaHasta: (valor: string) => void,
 *   reintentar: () => void
 * }}
 */
export default function useLogErrores() {
  const [errores, establecerErrores] = useState([]);
  const [resumen, establecerResumen] = useState(null);
  const [estado, establecerEstado] = useState('cargando');
  const [recargando, establecerRecargando] = useState(false);
  const [modulo, establecerModulo] = useState('TODOS');
  const [busqueda, establecerBusqueda] = useState('');
  const [busquedaDebounced, establecerBusquedaDebounced] = useState('');
  const [fechaDesde, establecerFechaDesde] = useState('');
  const [fechaHasta, establecerFechaHasta] = useState('');
  const [rangoAplicado, establecerRangoAplicado] = useState({ fechaDesde: '', fechaHasta: '' });
  const [intentoClave, establecerIntentoClave] = useState(0);

  const idSolicitudRef = useRef(0);
  const esPrimerFiltroRef = useRef(true);

  // Búsqueda con debounce de 300 ms.
  useEffect(() => {
    const temporizador = setTimeout(() => {
      establecerBusquedaDebounced(busqueda.trim());
    }, DEBOUNCE_BUSQUEDA_MS);

    return () => clearTimeout(temporizador);
  }, [busqueda]);

  const mensajeErrorRango =
    fechaDesde && fechaHasta && fechaDesde > fechaHasta ? MENSAJE_RANGO_INVALIDO : '';

  // El rango solo se aplica (y se consulta) cuando es válido.
  useEffect(() => {
    if (mensajeErrorRango === '') {
      establecerRangoAplicado({ fechaDesde, fechaHasta });
    }
  }, [fechaDesde, fechaHasta, mensajeErrorRango]);

  // Carga inicial y reintentos: pide resumen + lista en paralelo (§6.3 paso 1 y 7).
  useEffect(() => {
    let cancelado = false;
    const idActual = ++idSolicitudRef.current;

    async function cargar() {
      establecerEstado('cargando');

      const filtros = construirFiltros({ modulo, busqueda: busquedaDebounced, rangoAplicado });
      const [resResumen, resErrores] = await Promise.all([
        obtenerResumenErrores(),
        obtenerErrores(filtros)
      ]);

      if (cancelado || idActual !== idSolicitudRef.current) {
        return;
      }

      if (!resResumen.exitoso || !resErrores.exitoso) {
        establecerEstado('error');
        return;
      }

      establecerResumen(resResumen.datos);
      establecerErrores(ordenarYAdaptar(resErrores.datos));
      establecerEstado('listo');
    }

    cargar();

    return () => {
      cancelado = true;
    };
    // El resumen y la lista inicial solo se repiten cuando cambia `intentoClave`
    // (al llamar `reintentar`); el cambio de filtros lo maneja el efecto de abajo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intentoClave]);

  // Recarga solo la lista cuando cambian los filtros (el resumen no se vuelve a pedir).
  useEffect(() => {
    if (esPrimerFiltroRef.current) {
      esPrimerFiltroRef.current = false;
      return;
    }

    if (estado === 'cargando') {
      // La carga inicial (resumen + lista) todavía no terminó; esa carga ya
      // usa los filtros vigentes en este render, así que no se duplica la petición.
      return;
    }

    let cancelado = false;
    const idActual = ++idSolicitudRef.current;

    async function recargar() {
      establecerRecargando(true);

      const filtros = construirFiltros({ modulo, busqueda: busquedaDebounced, rangoAplicado });
      const resultado = await obtenerErrores(filtros);

      if (cancelado || idActual !== idSolicitudRef.current) {
        return;
      }

      if (!resultado.exitoso) {
        establecerEstado('error');
        establecerRecargando(false);
        return;
      }

      establecerErrores(ordenarYAdaptar(resultado.datos));
      establecerEstado('listo');
      establecerRecargando(false);
    }

    recargar();

    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modulo, busquedaDebounced, rangoAplicado.fechaDesde, rangoAplicado.fechaHasta]);

  const reintentar = () => establecerIntentoClave((valor) => valor + 1);

  let textoInsignia = '';
  if (resumen) {
    const total = resumen.totalErrores ?? 0;
    const textoTotal = `${total} ${total === 1 ? 'error' : 'errores'}`;

    if (total === 0) {
      textoInsignia = textoTotal;
    } else {
      const dias = calcularDiasAbarcados(
        [resumen.fechaPrimerError, resumen.fechaUltimoError].filter(Boolean)
      );
      const textoDias = dias === 1 ? 'Último día' : `Últimos ${dias} días`;
      textoInsignia = `${textoTotal} · ${textoDias}`;
    }
  }

  return {
    errores,
    resumen,
    textoInsignia,
    estado,
    recargando,
    modulo,
    busqueda,
    fechaDesde,
    fechaHasta,
    mensajeErrorRango,
    establecerModulo,
    establecerBusqueda,
    establecerFechaDesde,
    establecerFechaHasta,
    reintentar
  };
}
