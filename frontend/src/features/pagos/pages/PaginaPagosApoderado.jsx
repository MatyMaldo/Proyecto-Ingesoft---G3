import { useState } from 'react';

import BotonActualizar from '../../../shared/components/BotonActualizar.jsx';
import EstadoConsulta from '../../../shared/components/EstadoConsulta.jsx';
import Insignia from '../../../shared/components/Insignia.jsx';
import Notificacion from '../../../shared/components/Notificacion.jsx';
import SelectFiltro from '../../../shared/components/SelectFiltro.jsx';
import useNotificacion from '../../../shared/hooks/useNotificacion.js';
import ModalDetallePagoApoderado from '../components/ModalDetallePagoApoderado.jsx';
import ModalRegistrarPago from '../components/ModalRegistrarPago.jsx';
import ModalPagosCompromiso from '../components/ModalPagosCompromiso.jsx';
import TablaCompromisosPago from '../components/TablaCompromisosPago.jsx';
import usePagosApoderado from '../hooks/usePagosApoderado.js';
import estilos from './PaginaPagosApoderado.module.css';

const MENSAJE_SIN_ESTUDIANTES = 'No hay estudiantes vinculados a tu cuenta de apoderado.';
const MENSAJE_SIN_COMPROMISOS = 'No hay compromisos de pago para el estudiante en este año.';

export default function PaginaPagosApoderado() {
  const { notificacion, mostrarNotificacion } = useNotificacion();
  const {
    anios,
    anioId,
    seleccionarAnio,
    estadoAnios,
    errorAnios,
    reintentarAnios,
    estudiantes,
    estudianteId,
    seleccionarEstudiante,
    estadoEstudiantes,
    errorEstudiantes,
    compromisos,
    pagosPorCompromiso,
    estadoCompromisos,
    errorCompromisos,
    cargandoPagos,
    recargar,
    registrarPago
  } = usePagosApoderado();

  const [compromisoARegistrar, establecerCompromisoARegistrar] = useState(null);
  const [pagoDetalle, establecerPagoDetalle] = useState(null);
  const [compromisoConPagosId, establecerCompromisoConPagos] = useState(null);
  // Se toma de la lista vigente para que el diálogo refleje los pagos recién cargados o registrados.
  const compromisoConPagos = compromisos.find((item) => item.id === compromisoConPagosId) ?? null;

  const anioSeleccionado = anios.find((anio) => String(anio.id) === String(anioId));
  const estudianteSeleccionado = estudiantes.find(
    (estudiante) => String(estudiante.id) === String(estudianteId)
  );
  const contextoEstudiante = estudianteSeleccionado
    ? [
      estudianteSeleccionado.gradoNombre,
      estudianteSeleccionado.seccionNombre
        ? `Sección ${estudianteSeleccionado.seccionNombre}`
        : null,
      estudianteSeleccionado.anioAcademico
    ].filter(Boolean).join(' · ')
    : '';

  const registrar = async (datos) => {
    const mensaje = await registrarPago(datos);
    if (mensaje) {
      mostrarNotificacion(mensaje, true);
      return mensaje;
    }
    establecerCompromisoARegistrar(null);
    mostrarNotificacion('Pago registrado. El comprobante quedará pendiente de validación.');
    return null;
  };

  return (
    <div className={estilos.pagina}>
      {notificacion && <Notificacion mensaje={notificacion.mensaje} error={notificacion.error} />}

      <header className={estilos.cabecera}>
        <div className={estilos.textoCabecera}>
          <h1 className={estilos.titulo}>Mis pagos</h1>
          <p className={estilos.descripcion}>
            Selecciona un estudiante y un año académico para consultar sus compromisos y registrar comprobantes de pago.
          </p>
        </div>
      </header>

      {/* Año y estudiante con el selector compartido (mismo patrón que Auditorías y Matrículas). */}
      <section className={estilos.filtros} aria-label="Filtros de pagos">
        <SelectFiltro
          apilado
          id="filtro-anio-mis-pagos"
          etiqueta="Año académico"
          valor={String(anioId ?? '')}
          opciones={anios.map((anio) => ({ valor: String(anio.id), etiqueta: String(anio.anio) }))}
          alCambiar={seleccionarAnio}
          deshabilitado={estadoAnios !== 'listo'}
        />
        <SelectFiltro
          apilado
          id="filtro-estudiante-mis-pagos"
          etiqueta="Estudiante a cargo"
          valor={String(estudianteId ?? '')}
          opciones={estudiantes.length === 0
            ? [{ valor: '', etiqueta: 'Sin estudiantes' }]
            : estudiantes.map((estudiante) => ({
              valor: String(estudiante.id),
              etiqueta: estudiante.nombreCompleto
            }))}
          alCambiar={seleccionarEstudiante}
          deshabilitado={estadoEstudiantes !== 'listo' || estudiantes.length === 0}
        />
        <BotonActualizar
          alActualizar={recargar}
          actualizando={estadoCompromisos === 'cargando'}
          deshabilitado={estadoAnios !== 'listo'}
        />
        {contextoEstudiante && (
          <Insignia tono="azul" className={estilos.contexto}>{contextoEstudiante}</Insignia>
        )}
      </section>

      <section className={estilos.resultados} aria-busy={estadoCompromisos === 'cargando' || undefined}>
        {estadoAnios === 'cargando' && <EstadoConsulta tipo="carga" filasEsqueleto={4} />}

        {estadoAnios === 'error' && (
          <EstadoConsulta
            tipo="error"
            mensaje={errorAnios}
            alReintentar={reintentarAnios}
          />
        )}

        {estadoAnios === 'listo' && estadoEstudiantes === 'cargando' && (
          <EstadoConsulta tipo="carga" filasEsqueleto={3} />
        )}

        {estadoAnios === 'listo' && estadoEstudiantes === 'error' && (
          <EstadoConsulta
            tipo="error"
            mensaje={errorEstudiantes}
            alReintentar={recargar}
          />
        )}

        {estadoAnios === 'listo' && estadoEstudiantes === 'listo' && estudiantes.length === 0 && (
          <EstadoConsulta tipo="vacio" mensaje={MENSAJE_SIN_ESTUDIANTES} />
        )}

        {estadoAnios === 'listo' && estadoEstudiantes === 'listo'
          && estudiantes.length > 0 && !estudianteId && (
            <EstadoConsulta
              tipo="vacio"
              mensaje="Selecciona un estudiante para consultar sus pagos."
            />
          )}

        {estadoAnios === 'listo' && estudianteId && estadoCompromisos === 'cargando' && (
          <EstadoConsulta tipo="carga" filasEsqueleto={4} />
        )}

        {estadoAnios === 'listo' && estudianteId && estadoCompromisos === 'error' && (
          <EstadoConsulta
            tipo="error"
            mensaje={errorCompromisos}
            alReintentar={recargar}
          />
        )}

        {estadoAnios === 'listo' && estudianteId && estadoCompromisos === 'listo'
          && compromisos.length === 0 && (
            <EstadoConsulta tipo="vacio" mensaje={MENSAJE_SIN_COMPROMISOS} />
          )}

        {estadoAnios === 'listo' && estudianteId && estadoCompromisos === 'listo'
          && compromisos.length > 0 && (
            <div className={estilos.tarjetaTabla}>
              <TablaCompromisosPago
                compromisos={compromisos}
                pagosPorCompromiso={pagosPorCompromiso}
                cargandoPagos={cargandoPagos}
                alRegistrar={establecerCompromisoARegistrar}
                alVerPagos={(compromiso) => establecerCompromisoConPagos(compromiso.id)}
              />
            </div>
          )}
      </section>

      {compromisoConPagos && (
        <ModalPagosCompromiso
          compromiso={compromisoConPagos}
          pagosInfo={pagosPorCompromiso[compromisoConPagos.id]}
          cargandoPagos={cargandoPagos}
          onCerrar={() => establecerCompromisoConPagos(null)}
          alRegistrar={establecerCompromisoARegistrar}
          alVerDetalle={(pago) => establecerPagoDetalle({ pago, compromiso: compromisoConPagos })}
        />
      )}

      {pagoDetalle && (
        <ModalDetallePagoApoderado
          pago={pagoDetalle.pago}
          compromiso={pagoDetalle.compromiso}
          onCerrar={() => establecerPagoDetalle(null)}
        />
      )}

      {compromisoARegistrar && (
        <ModalRegistrarPago
          compromiso={compromisoARegistrar}
          onCerrar={() => establecerCompromisoARegistrar(null)}
          onRegistrar={registrar}
        />
      )}
    </div>
  );
}
