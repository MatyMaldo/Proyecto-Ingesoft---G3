import { useState } from 'react';

import useAuth from '../../../shared/auth/useAuth.js';
import { ROLES } from '../../../shared/auth/roles.js';
import EstadoConsulta from '../../../shared/components/EstadoConsulta.jsx';
import SelectFiltro from '../../../shared/components/SelectFiltro.jsx';
import ModalReporteInasistencia from '../components/ModalReporteInasistencia.jsx';
import TablaReportes from '../components/TablaReportes.jsx';
import useRendimiento, { useEstudiantesApoderado } from '../hooks/useRendimiento.js';

import estilos from './PaginaRendimiento.module.css';

/**
 * Tabla de reportes de inasistencia con su modal de detalle.
 *
 * @param {Object} props
 * @param {string} props.nombreAlumno Nombre a mostrar en las filas que no lo traen.
 * @param {number|null} [props.estudianteId] Solo para el apoderado: estudiante seleccionado.
 */
function ReportesInasistencia({ nombreAlumno, estudianteId = null }) {
  const { reportes, detalles, estado, error, recargar } = useRendimiento({ estudianteId });
  const [reporteAbiertoId, establecerReporteAbiertoId] = useState(null);

  return (
    <section className={estilos.tarjetaResultados} aria-label="Reportes de inasistencia">
      {estado === 'cargando' && <EstadoConsulta tipo="carga" filasEsqueleto={4} />}
      {estado === 'error' && <EstadoConsulta tipo="error" mensaje={error} alReintentar={recargar} />}
      {estado === 'listo' && reportes.length === 0 && (
        <EstadoConsulta
          tipo="vacio"
          icono="archivo"
          mensaje={estudianteId == null
            ? 'No tienes reportes de inasistencia registrados.'
            : `${nombreAlumno || 'El estudiante'} no tiene reportes de inasistencia registrados.`}
        />
      )}
      {estado === 'listo' && reportes.length > 0 && (
        <TablaReportes
          reportes={reportes}
          nombreAlumno={nombreAlumno}
          alVerDetalle={(reporte) => establecerReporteAbiertoId(reporte.id)}
        />
      )}

      {reporteAbiertoId != null && (
        <ModalReporteInasistencia
          key={reporteAbiertoId}
          reporteId={reporteAbiertoId}
          estudianteId={estudianteId}
          detalleInicial={detalles[reporteAbiertoId] ?? null}
          nombreAlumno={nombreAlumno}
          onCerrar={() => establecerReporteAbiertoId(null)}
        />
      )}
    </section>
  );
}

/** Vista del apoderado: elige a uno de sus estudiantes y ve sus reportes. */
function ReportesApoderado() {
  const {
    estudiantes,
    estudianteId,
    estudianteSeleccionado,
    seleccionarEstudiante,
    estado,
    error,
    reintentar
  } = useEstudiantesApoderado();

  if (estado === 'cargando') {
    return (
      <section className={estilos.tarjetaResultados}>
        <EstadoConsulta tipo="carga" mensaje="Cargando tus estudiantes…" filasEsqueleto={4} />
      </section>
    );
  }
  if (estado === 'error') {
    return (
      <section className={estilos.tarjetaResultados}>
        <EstadoConsulta tipo="error" mensaje={error} alReintentar={reintentar} />
      </section>
    );
  }
  if (estudiantes.length === 0) {
    return (
      <section className={estilos.tarjetaResultados}>
        <EstadoConsulta tipo="vacio" icono="usuarios" mensaje="No tienes estudiantes asignados." />
      </section>
    );
  }

  const opcionesEstudiante = estudiantes.map((estudiante) => ({
    valor: String(estudiante.id),
    etiqueta: estudiante.codigo ? `${estudiante.nombre} (${estudiante.codigo})` : estudiante.nombre
  }));

  return (
    <>
      <div className={estilos.filtros}>
        <SelectFiltro
          id="rendimiento-estudiante"
          etiqueta="Estudiante"
          valor={estudianteId == null ? '' : String(estudianteId)}
          opciones={opcionesEstudiante}
          alCambiar={seleccionarEstudiante}
          apilado
        />
      </div>

      {estudianteId != null && (
        // `key`: al cambiar de estudiante se reinicia la tabla y se cierra cualquier modal abierto.
        <ReportesInasistencia
          key={estudianteId}
          estudianteId={estudianteId}
          nombreAlumno={estudianteSeleccionado?.nombre ?? ''}
        />
      )}
    </>
  );
}

export default function PaginaRendimiento() {
  const { usuario } = useAuth();
  const rol = usuario?.rol;

  return (
    <div className={estilos.pagina}>
      <header className={estilos.cabecera}>
        <div className={estilos.textoCabecera}>
          <h1 className={estilos.titulo}>Rendimiento académico</h1>
          <p className={estilos.descripcion}>
            {rol === ROLES.APODERADO
              ? 'Consulta los reportes de inasistencia de tus estudiantes durante el año académico.'
              : 'Consulta los reportes de inasistencia registrados durante el año académico.'}
          </p>
        </div>
      </header>

      {rol === ROLES.ESTUDIANTE && <ReportesInasistencia nombreAlumno={usuario?.nombre ?? ''} />}
      {rol === ROLES.APODERADO && <ReportesApoderado />}
    </div>
  );
}
