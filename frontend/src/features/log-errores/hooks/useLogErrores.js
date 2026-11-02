import { useEffect, useRef, useState } from 'react';

import { obtenerTonoModulo } from '../../../shared/constants/tonosModulo.js';
import { formatearFechaHora } from '../../../shared/utils/formatoFecha.js';
import { obtenerMensajeRangoFechas } from '../../../shared/utils/rangoFechas.js';
import { obtenerErrores, obtenerResumenErrores } from '../services/logErroresService.js';

/**
 * Opciones del filtro de módulo (`FiltroChips`). Catálogo cerrado de 9 módulos
 * (HU-SAT-05 LV y HU-SAT-06 LV vigentes, `docs/frontend-contexto.md` "Log de
 * errores"): Usuarios, Matrícula, Pagos, Asistencia, Notas, Horarios,
 * Configuración, Autenticación u Otros (Duda U9 de `docs/planes/log-errores.md`
 * resuelta: se agrega "Autenticación" entre Configuración y Otros, orden de la HU).
 * El valor `'TODOS'` identifica el chip "Todos" (ajuste aprobado en `shell.md` §19).
 * El tono de cada módulo se obtiene de `TONOS_MODULO` (shell.md §20.4, 2026-11-01)
 * para no duplicar el mapa módulo → tono; "Otros" no está en `TONOS_MODULO` y cae
 * al tono por defecto (`gris`), igual que "Autenticación" (decisión G-3 de
 * `shell.md` §20.9: se mantiene en gris, no en el `rojo` que proponía este plan).
 */
export const OPCIONES_MODULO = [
  { valor: 'TODOS', etiqueta: 'Todos' },
  { valor: 'USUARIOS', etiqueta: 'Usuarios', tono: obtenerTonoModulo('USUARIOS') },
  { valor: 'MATRICULAS', etiqueta: 'Matrícula', tono: obtenerTonoModulo('MATRICULAS') },
  { valor: 'PAGOS', etiqueta: 'Pagos', tono: obtenerTonoModulo('PAGOS') },
  { valor: 'ASISTENCIA', etiqueta: 'Asistencia', tono: obtenerTonoModulo('ASISTENCIA') },
  { valor: 'NOTAS', etiqueta: 'Notas', tono: obtenerTonoModulo('NOTAS') },
  { valor: 'HORARIOS', etiqueta: 'Horarios', tono: obtenerTonoModulo('HORARIOS') },
  { valor: 'CONFIGURACION', etiqueta: 'Configuración', tono: obtenerTonoModulo('CONFIGURACION') },
  { valor: 'AUTENTICACION', etiqueta: 'Autenticación', tono: obtenerTonoModulo('AUTENTICACION') },
  { valor: 'OTROS', etiqueta: 'Otros', tono: obtenerTonoModulo('OTROS') }
];

/**
 * Etiqueta de cada módulo del catálogo cerrado de 9 de HU-SAT-06 LV (actualización
 * 2026-11-01, §A11.2 de `docs/planes/log-errores.md`). Es una constante explícita
 * y no se deriva de `OPCIONES_MODULO` para mantener el orden propio de la HU. Un
 * código fuera de esta lista se muestra tal cual, con tono `gris`
 * (`obtenerTonoModulo`).
 */
const ETIQUETAS_MODULO = {
  USUARIOS: 'Usuarios',
  MATRICULAS: 'Matrícula',
  PAGOS: 'Pagos',
  ASISTENCIA: 'Asistencia',
  NOTAS: 'Notas',
  HORARIOS: 'Horarios',
  CONFIGURACION: 'Configuración',
  AUTENTICACION: 'Autenticación',
  OTROS: 'Otros'
};

/**
 * Tono de cada tipo de error. Clasificación cerrada de tres valores (HU-SAT-05 LV y
 * HU-SAT-06 LV, actualización 2026-11-01, §A11.1): el texto es el que envía la API
 * en `tipoError` (contrato propuesto, Duda U15). Cualquier otro valor usa `'gris'`
 * (tono por defecto).
 */
export const TONOS_TIPO_ERROR = {
  'Excepción no controlada': 'rosa',
  'Proceso automático': 'gris',
  'Notificación por correo': 'cian'
};

const DEBOUNCE_BUSQUEDA_MS = 300;

function obtenerTonoTipoError(tipoError) {
  return TONOS_TIPO_ERROR[tipoError] ?? 'gris';
}

/**
 * Adapta un registro crudo de la API/mock a la forma que consume `TablaLogErrores`.
 * Copia solo los campos de la lista cerrada: cualquier campo extra del backend
 * (por ejemplo `traza`, `stackTrace`, `payload`) se descarta aquí.
 *
 * `usuario` siempre resulta en un texto (nunca `null`): la regla única de
 * HU-SAT-06 LV (actualización 2026-11-01, §A11.1) exige mostrar "No determinado"
 * cuando no había sesión iniciada. Si por algún motivo la API no envía el campo,
 * se usa el mismo texto de forma defensiva (Duda U17).
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
    usuario: registro.usuario ?? 'No determinado'
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
