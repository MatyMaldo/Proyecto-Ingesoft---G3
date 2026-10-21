import { useEffect, useRef, useState } from 'react';

import { obtenerTonoModulo } from '../../../shared/constants/tonosModulo.js';
import { formatearFechaHora } from '../../../shared/utils/formatoFecha.js';
import { obtenerMensajeRangoFechas } from '../../../shared/utils/rangoFechas.js';
import { obtenerErrores, obtenerResumenErrores } from '../services/logErroresService.js';

/**
 * Opciones del filtro de módulo (`FiltroChips`). Catálogo corregido (decisión del
 * dueño del producto, 2026-10-20, Duda U4 de `docs/planes/log-errores.md`): sigue
 * HU-SAT-05 LV3 ("Usuarios, Matrícula, Pagos, Asistencia, Notas, Horarios,
 * Configuración u Otros"), sin "Autenticación" ni "Reportes".
 * El valor `'TODOS'` identifica el chip "Todos" (ajuste aprobado en `shell.md` §19).
 * "Configuración" y "Otros" usan tono `gris` provisional: MASTER.md no les asigna
 * tono todavía (mismo criterio que `CONFIGURACION` en `auditorias.md` D8).
 */
export const OPCIONES_MODULO = [
  { valor: 'TODOS', etiqueta: 'Todos' },
  { valor: 'USUARIOS', etiqueta: 'Usuarios', tono: 'violeta' },
  { valor: 'MATRICULAS', etiqueta: 'Matrícula', tono: 'ambar' },
  { valor: 'PAGOS', etiqueta: 'Pagos', tono: 'turquesa' },
  { valor: 'ASISTENCIA', etiqueta: 'Asistencia', tono: 'verde' },
  { valor: 'NOTAS', etiqueta: 'Notas', tono: 'azul' },
  { valor: 'HORARIOS', etiqueta: 'Horarios', tono: 'indigo' },
  { valor: 'CONFIGURACION', etiqueta: 'Configuración', tono: 'gris' },
  { valor: 'OTROS', etiqueta: 'Otros', tono: 'gris' }
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
  // Evita la condición de carrera entre la carga inicial y un cambio de filtro
  // disparado antes de que esta termine (mismo patrón que `useAuditoria`): el
  // resumen se vuelve a pedir mientras este ref siga en `false`, sin importar
  // qué llamada a `cargarLista` gane la carrera de `idSolicitudRef`.
  const cargaInicialCompletaRef = useRef(false);

  // Búsqueda con debounce de 300 ms.
  useEffect(() => {
    const temporizador = setTimeout(() => {
      establecerBusquedaDebounced(busqueda.trim());
    }, DEBOUNCE_BUSQUEDA_MS);

    return () => clearTimeout(temporizador);
  }, [busqueda]);

  const mensajeErrorRango = obtenerMensajeRangoFechas(fechaDesde, fechaHasta);

  // El rango solo se aplica (y se consulta) cuando es válido.
  useEffect(() => {
    if (mensajeErrorRango === '') {
      establecerRangoAplicado({ fechaDesde, fechaHasta });
    }
  }, [fechaDesde, fechaHasta, mensajeErrorRango]);

  /**
   * Pide la lista (y el resumen, si aún no se cargó con éxito) con los filtros
   * vigentes. Descarta la respuesta si ya no es la última solicitud en curso.
   *
   * El resumen se pide mientras `cargaInicialCompletaRef` siga en `false` (en vez
   * de comparar con `estado === 'cargando'`): así, si el usuario cambia un filtro
   * antes de que la carga inicial responda, la llamada que gane la carrera de
   * `idSolicitudRef` sigue trayendo el resumen y la lista queda filtrada
   * correctamente (en vez de quedarse sin refiltrar, que era el bug).
   */
  async function cargarLista(filtrosActuales) {
    const idActual = ++idSolicitudRef.current;
    const necesitaResumen = !cargaInicialCompletaRef.current;

    if (necesitaResumen) {
      establecerEstado('cargando');
    } else {
      establecerRecargando(true);
    }

    const filtros = construirFiltros(filtrosActuales);
    const [resResumen, resErrores] = await Promise.all([
      necesitaResumen ? obtenerResumenErrores() : Promise.resolve(null),
      obtenerErrores(filtros)
    ]);

    if (idActual !== idSolicitudRef.current) {
      return;
    }

    if (!resErrores.exitoso || (necesitaResumen && !resResumen.exitoso)) {
      establecerEstado('error');
      establecerRecargando(false);
      return;
    }

    establecerErrores(ordenarYAdaptar(resErrores.datos));

    if (necesitaResumen) {
      establecerResumen(resResumen.datos);
      cargaInicialCompletaRef.current = true;
    }

    establecerEstado('listo');
    establecerRecargando(false);
  }

  // Carga inicial y reintentos: pide resumen + lista en paralelo (§6.3 paso 1 y 7).
  useEffect(() => {
    cargarLista({ modulo, busqueda: busquedaDebounced, rangoAplicado });
    // El resumen y la lista inicial solo se repiten cuando cambia `intentoClave`
    // (al llamar `reintentar`); el cambio de filtros lo maneja el efecto de abajo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intentoClave]);

  // Recarga la lista (y el resumen, si todavía no se cargó con éxito) cuando
  // cambian los filtros. Sin guarda sobre `estado`: si la carga inicial sigue en
  // curso, esta llamada compite por `idSolicitudRef` y la última en resolver es
  // la que queda, ya con los filtros vigentes.
  useEffect(() => {
    if (esPrimerFiltroRef.current) {
      esPrimerFiltroRef.current = false;
      return;
    }

    cargarLista({ modulo, busqueda: busquedaDebounced, rangoAplicado });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modulo, busquedaDebounced, rangoAplicado.fechaDesde, rangoAplicado.fechaHasta]);

  const reintentar = () => establecerIntentoClave((valor) => valor + 1);

  // Decisión del dueño del producto (2026-10-20, Duda U3): la insignia dice
  // "N errores", sin la parte de "Últimos N días" (el log es permanente y ese
  // rango puede crecer sin límite).
  let textoInsignia = '';
  if (resumen) {
    const total = resumen.totalErrores ?? 0;
    textoInsignia = `${total} ${total === 1 ? 'error' : 'errores'}`;
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
