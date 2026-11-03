import { useEffect, useRef, useState } from 'react';

import { formatearFechaHora } from '../../../shared/utils/formatoFecha.js';
import { obtenerMensajeRangoFechas } from '../../../shared/utils/rangoFechas.js';
import { obtenerErrores } from '../services/logErroresService.js';

const TONOS_TIPO_ERROR = Object.freeze({
  'Excepción no controlada': 'rosa',
  'Proceso automático': 'gris',
  'Notificación por correo': 'gris'
});

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
    operacion: [registro.metodoHttp, registro.endpoint].filter(Boolean).join(' '),
    tipoError: registro.tipoError ?? 'Error',
    tipoErrorTono: TONOS_TIPO_ERROR[registro.tipoError] ?? 'gris',
    mensaje: registro.mensaje ?? '',
    detalle: registro.detalle ?? '',
    codigoEstado: registro.codigoEstado
  };
}

/**
 * Datos y comportamiento de la pantalla de Logs de Errores.
 * El backend pagina y solo filtra por rango de fechas, según su contrato.
 */
export default function useLogErrores() {
  const [errores, establecerErrores] = useState([]);
  const [totalElementos, establecerTotalElementos] = useState(0);
  const [totalPaginas, establecerTotalPaginas] = useState(0);
  const [pagina, establecerPagina] = useState(0);
  const [estado, establecerEstado] = useState('cargando');
  const [recargando, establecerRecargando] = useState(false);
  const [fechaDesde, establecerFechaDesdeEstado] = useState('');
  const [fechaHasta, establecerFechaHastaEstado] = useState('');
  const [rangoAplicado, establecerRangoAplicado] = useState({ fechaDesde: '', fechaHasta: '' });
  const [intentoClave, establecerIntentoClave] = useState(0);
  const idSolicitudRef = useRef(0);

  const mensajeErrorRango = obtenerMensajeRangoFechas(fechaDesde, fechaHasta);

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

    establecerErrores((resultado.datos?.registros ?? []).map(adaptarFilaError));
    establecerTotalElementos(resultado.datos?.totalElementos ?? 0);
    establecerTotalPaginas(resultado.datos?.totalPaginas ?? 0);
    establecerPagina(resultado.datos?.pagina ?? pagina);
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
  }, [pagina, rangoAplicado.fechaDesde, rangoAplicado.fechaHasta, intentoClave]);

  function aplicarRango(fechaDesdeNueva, fechaHastaNueva) {
    if (obtenerMensajeRangoFechas(fechaDesdeNueva, fechaHastaNueva) !== '') {
      return;
    }

    establecerPagina(0);
    establecerRangoAplicado({ fechaDesde: fechaDesdeNueva, fechaHasta: fechaHastaNueva });
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
      establecerPagina(nuevaPagina);
    }
  }

  const textoInsignia = `${totalElementos} ${totalElementos === 1 ? 'error' : 'errores'}`;

  return {
    errores,
    totalElementos,
    totalPaginas,
    pagina,
    textoInsignia,
    estado,
    recargando,
    fechaDesde,
    fechaHasta,
    mensajeErrorRango,
    establecerFechaDesde: cambiarFechaDesde,
    establecerFechaHasta: cambiarFechaHasta,
    irAPagina,
    reintentar: () => establecerIntentoClave((valor) => valor + 1)
  };
}
