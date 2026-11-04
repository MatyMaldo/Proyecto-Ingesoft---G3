import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { obtenerTonoModulo } from '../../../shared/constants/tonosModulo.js';
import { formatearFechaHora } from '../../../shared/utils/formatoFecha.js';
import { obtenerMensajeRangoFechas } from '../../../shared/utils/rangoFechas.js';
import { obtenerErrores } from '../services/logErroresService.js';

/**
 * Opciones del filtro de módulo: catálogo cerrado de HU-SAT-05 / HU-SAT-06.
 * `'TODOS'` es la opción sin filtro.
 */
export const OPCIONES_MODULO = [
  { valor: 'TODOS', etiqueta: 'Todos los módulos' },
  { valor: 'USUARIOS', etiqueta: 'Usuarios' },
  { valor: 'MATRICULAS', etiqueta: 'Matrícula' },
  { valor: 'PAGOS', etiqueta: 'Pagos' },
  { valor: 'ASISTENCIA', etiqueta: 'Asistencia' },
  { valor: 'NOTAS', etiqueta: 'Notas' },
  { valor: 'HORARIOS', etiqueta: 'Horarios' },
  { valor: 'CONFIGURACION', etiqueta: 'Configuración' },
  { valor: 'AUTENTICACION', etiqueta: 'Autenticación' },
  { valor: 'OTROS', etiqueta: 'Otros' }
];

const ETIQUETAS_MODULO = Object.freeze(
  Object.fromEntries(OPCIONES_MODULO.map(({ valor, etiqueta }) => [valor, etiqueta]))
);

const DEBOUNCE_BUSQUEDA_MS = 300;

/** Parámetro de la URL con la página actual (base 1: `?pagina=3`). Sin parámetro, página 1. */
const PARAMETRO_PAGINA = 'pagina';

function leerPagina(valor) {
  const numero = Number.parseInt(valor ?? '', 10);
  return Number.isInteger(numero) && numero >= 1 ? numero - 1 : 0;
}

const TONOS_TIPO_ERROR = Object.freeze({
  'Excepción no controlada': 'rosa',
  'Proceso automático': 'gris',
  'Notificación por correo': 'gris'
});

/**
 * Tono de la insignia del estado HTTP: 5xx (fallo del servidor) en rojo, 4xx en ámbar y
 * el resto en gris. Sin código (procesos automáticos) no hay insignia.
 */
export function obtenerTonoCodigoEstado(codigo) {
  if (codigo == null) {
    return 'gris';
  }
  if (codigo >= 500) {
    return 'rojo';
  }
  return codigo >= 400 ? 'ambar' : 'gris';
}

function normalizarFechaHora(fechaHora) {
  return /(?:Z|[+-]\d{2}:\d{2})$/i.test(fechaHora) ? fechaHora : `${fechaHora}-05:00`;
}

function adaptarFilaError(registro) {
  const fechaHora = normalizarFechaHora(registro.fechaHora);
  const { fecha, hora } = formatearFechaHora(fechaHora);

  return {
    id: registro.id,
    fechaHora,
    fecha,
    hora,
    usuarioId: registro.usuarioId,
    usuario: registro.nombreUsuario ?? (registro.usuarioId == null ? 'Sistema' : `Usuario #${registro.usuarioId}`),
    endpoint: registro.endpoint ?? '',
    metodoHttp: registro.metodoHttp ?? '',
    modulo: registro.modulo ?? '',
    moduloEtiqueta: registro.modulo ? (ETIQUETAS_MODULO[registro.modulo] ?? registro.modulo) : '',
    moduloTono: obtenerTonoModulo(registro.modulo),
    operacion: registro.operacion ?? '',
    tipoError: registro.tipoError ?? 'Error',
    tipoErrorTono: TONOS_TIPO_ERROR[registro.tipoError] ?? 'gris',
    mensaje: registro.mensaje ?? '',
    detalle: registro.detalle ?? '',
    codigoEstado: registro.codigoEstado,
    codigoEstadoTono: obtenerTonoCodigoEstado(registro.codigoEstado)
  };
}

/**
 * Datos y comportamiento de la pantalla de Logs de Errores.
 * El backend pagina y solo filtra por rango de fechas, según su contrato. El módulo y la
 * búsqueda solo se envían si el origen de datos los soporta (hoy, los mocks).
 */
export default function useLogErrores() {
  const [errores, establecerErrores] = useState([]);
  const [totalElementos, establecerTotalElementos] = useState(0);
  const [totalPaginas, establecerTotalPaginas] = useState(0);
  const [parametros, establecerParametros] = useSearchParams();
  const pagina = leerPagina(parametros.get(PARAMETRO_PAGINA));
  const [estado, establecerEstado] = useState('cargando');
  const [recargando, establecerRecargando] = useState(false);
  const [modulo, establecerModuloEstado] = useState('TODOS');
  const [busqueda, establecerBusquedaEstado] = useState('');
  const [busquedaAplicada, establecerBusquedaAplicada] = useState('');
  const [fechaDesde, establecerFechaDesdeEstado] = useState('');
  const [fechaHasta, establecerFechaHastaEstado] = useState('');
  const [rangoAplicado, establecerRangoAplicado] = useState({ fechaDesde: '', fechaHasta: '' });
  const [intentoClave, establecerIntentoClave] = useState(0);
  const idSolicitudRef = useRef(0);

  /**
   * Guarda la página en la URL. Los reinicios por cambio de filtro reemplazan la entrada del
   * historial; el cambio explícito de página (`irAPagina`) agrega una, para que "Atrás" funcione.
   */
  function establecerPagina(nuevaPagina, { reemplazar = true } = {}) {
    if (nuevaPagina === pagina) {
      return;
    }

    establecerParametros(
      (previos) => {
        const siguientes = new URLSearchParams(previos);
        if (nuevaPagina <= 0) {
          siguientes.delete(PARAMETRO_PAGINA);
        } else {
          siguientes.set(PARAMETRO_PAGINA, String(nuevaPagina + 1));
        }
        return siguientes;
      },
      { replace: reemplazar }
    );
  }

  const mensajeErrorRango = obtenerMensajeRangoFechas(fechaDesde, fechaHasta);

  // La búsqueda se aplica 300 ms después de la última tecla y vuelve a la página 1.
  useEffect(() => {
    const temporizador = setTimeout(() => {
      const texto = busqueda.trim();
      if (texto !== busquedaAplicada) {
        establecerPagina(0);
        establecerBusquedaAplicada(texto);
      }
    }, DEBOUNCE_BUSQUEDA_MS);

    return () => clearTimeout(temporizador);
  }, [busqueda, busquedaAplicada]);

  async function cargarLista() {
    const idActual = ++idSolicitudRef.current;
    const esCargaInicial = estado === 'cargando' || estado === 'error';

    if (esCargaInicial) {
      establecerEstado('cargando');
    } else {
      establecerRecargando(true);
    }

    const resultado = await obtenerErrores({
      fechaDesde: rangoAplicado.fechaDesde,
      fechaHasta: rangoAplicado.fechaHasta,
      modulo: modulo === 'TODOS' ? undefined : modulo,
      busqueda: busquedaAplicada || undefined,
      page: pagina
    });

    if (idActual !== idSolicitudRef.current) {
      return;
    }

    if (!resultado.exitoso) {
      establecerEstado('error');
      establecerRecargando(false);
      return;
    }

    const registros = resultado.datos?.registros ?? [];
    const paginasTotales = resultado.datos?.totalPaginas ?? 0;

    // Página fuera de rango (por ejemplo, `?pagina=99` escrito a mano): vuelve a la última.
    if (registros.length === 0 && paginasTotales > 0 && pagina >= paginasTotales) {
      establecerPagina(paginasTotales - 1);
      return;
    }

    establecerErrores(registros.map(adaptarFilaError));
    establecerTotalElementos(resultado.datos?.totalElementos ?? 0);
    establecerTotalPaginas(paginasTotales);
    establecerEstado('listo');
    establecerRecargando(false);
  }

  useEffect(() => {
    cargarLista();
    return () => {
      idSolicitudRef.current += 1;
    };
    // cargarLista captura el estado de la consulta actual.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagina, modulo, busquedaAplicada, rangoAplicado.fechaDesde, rangoAplicado.fechaHasta, intentoClave]);

  function aplicarRango(fechaDesdeNueva, fechaHastaNueva) {
    if (obtenerMensajeRangoFechas(fechaDesdeNueva, fechaHastaNueva) !== '') {
      return;
    }

    establecerPagina(0);
    establecerRangoAplicado({ fechaDesde: fechaDesdeNueva, fechaHasta: fechaHastaNueva });
  }

  function cambiarModulo(valor) {
    establecerPagina(0);
    establecerModuloEstado(valor);
  }

  function cambiarFechaDesde(valor) {
    establecerFechaDesdeEstado(valor);
    aplicarRango(valor, fechaHasta);
  }

  function cambiarFechaHasta(valor) {
    establecerFechaHastaEstado(valor);
    aplicarRango(fechaDesde, valor);
  }

  function irAPagina(nuevaPagina) {
    if (nuevaPagina >= 0 && nuevaPagina < totalPaginas) {
      establecerPagina(nuevaPagina, { reemplazar: false });
    }
  }

  return {
    errores,
    totalElementos,
    totalPaginas,
    pagina,
    estado,
    recargando,
    modulo,
    busqueda,
    fechaDesde,
    fechaHasta,
    mensajeErrorRango,
    establecerModulo: cambiarModulo,
    establecerBusqueda: establecerBusquedaEstado,
    establecerFechaDesde: cambiarFechaDesde,
    establecerFechaHasta: cambiarFechaHasta,
    irAPagina,
    reintentar: () => establecerIntentoClave((valor) => valor + 1)
  };
}
