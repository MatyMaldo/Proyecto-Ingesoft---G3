import EstadoConsulta from '../../../shared/components/EstadoConsulta.jsx';
import FiltroChips from '../../../shared/components/FiltroChips.jsx';
import Icono from '../../../shared/components/Icono.jsx';
import Insignia from '../../../shared/components/Insignia.jsx';
import SelectFiltro from '../../../shared/components/SelectFiltro.jsx';
import estilos from '../pages/PaginaAnioEscolar.module.css';
import DialogoEstructuraEscolar from './DialogoEstructuraEscolar.jsx';

/** «1er Grado de Secundaria» → «1er Grado»: los chips de grado ocupan menos; el nombre completo va en la tabla. */
function nombreCortoGrado(nombre) {
  return String(nombre ?? '').replace(/\s+de\s+(Secundaria|Primaria|Inicial)$/i, '').trim();
}

/** Matriculados confirmados sobre la capacidad (p. ej. 18/30) con una barra; sin el dato, solo la capacidad. */
function OcupacionSeccion({ matriculados, capacidad }) {
  if (typeof matriculados !== 'number') {
    return <>{capacidad} estudiantes</>;
  }
  const porcentaje = capacidad > 0 ? Math.min(100, Math.round((matriculados / capacidad) * 100)) : 0;
  return (
    <div className={estilos.ocupacion}>
      <span>{matriculados}/{capacidad}</span>
      <progress
        className={`${estilos.barraOcupacion} ${porcentaje >= 100 ? estilos.barraLlena : ''}`}
        value={matriculados}
        max={capacidad}
        aria-label={`${matriculados} de ${capacidad} estudiantes matriculados (${porcentaje}%)`}
      />
    </div>
  );
}

/**
 * Año escolar: filtros (año y grado), secciones del grado elegido y los diálogos para crear grados y secciones o
 * modificar una sección. El estado lo maneja `useGradosSecciones` (recibido como `modelo`): la página lo necesita
 * también para la acción de la cabecera.
 *
 * Es un listado corto (a lo sumo unas pocas secciones por grado), así que no lleva paginador ni selector de filas.
 */
export default function PanelGradosSecciones({ modelo }) {
  const { datos, estado, formulario, anio, grado, finalizado, secciones } = modelo;

  if (estado === 'cargando') {
    return <EstadoConsulta tipo="carga" mensaje="Cargando estructura escolar…" filasEsqueleto={4} />;
  }
  if (estado === 'error') {
    return <EstadoConsulta tipo="error" mensaje={modelo.errorCarga} alReintentar={modelo.reintentar} />;
  }

  const seccionesPorGrado = (gradoId) => datos.secciones.filter(
    (item) => String(item.anioAcademicoId) === modelo.anioId && String(item.gradoId) === String(gradoId)
  ).length;

  const opcionesAnio = [
    { valor: '', etiqueta: 'Seleccionar año...' },
    ...datos.anios.map((item) => ({ valor: String(item.id), etiqueta: String(item.anio) }))
  ];
  const opcionesGrado = datos.grados.map((item) => ({
    valor: String(item.id),
    etiqueta: nombreCortoGrado(item.nombre),
    conteo: anio ? seccionesPorGrado(item.id) : undefined
  }));
  const cupos = secciones.reduce((total, item) => total + item.capacidadMaxima, 0);

  let cuerpo;
  if (!datos.anios.length) {
    cuerpo = (
      <EstadoConsulta
        tipo="vacio"
        icono="calendario"
        mensaje="Primero debe configurarse un año académico para registrar secciones."
      />
    );
  } else if (!datos.grados.length) {
    cuerpo = (
      <EstadoConsulta
        tipo="vacio"
        icono="libro"
        mensaje="Aún no hay grados registrados. Crea el primer grado para organizar las secciones."
        etiquetaAccion="Crear grado"
        alAccion={() => modelo.abrir('grado')}
      />
    );
  } else if (!anio || !grado) {
    cuerpo = (
      <EstadoConsulta
        tipo="vacio"
        icono="calendario"
        mensaje="Selecciona un año académico y un grado para consultar sus secciones."
      />
    );
  } else if (!secciones.length) {
    cuerpo = (
      <EstadoConsulta
        tipo="vacio"
        icono="aula"
        mensaje="No hay secciones registradas para el grado y año seleccionados."
      />
    );
  } else {
    cuerpo = (
      <div className={estilos.vistaTabla}>
        <table className={estilos.tabla}>
          <caption className={estilos.soloLectores}>Secciones de {grado.nombre} · {anio.anio}</caption>
          <thead>
            <tr>
              <th scope="col">Sección</th>
              <th scope="col">Ocupación</th>
              <th scope="col">Tutor</th>
              <th scope="col" className={estilos.columnaAccion}>
                <span className={estilos.soloLectores}>Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {secciones.map((item) => (
              <tr key={item.id} className={estilos.fila}>
                <td><strong>{item.nombre}</strong></td>
                <td>
                  <OcupacionSeccion matriculados={item.matriculadosConfirmados} capacidad={item.capacidadMaxima} />
                </td>
                <td className={item.tutorNombreCompleto ? undefined : estilos.sinTutor}>
                  {item.tutorNombreCompleto ?? 'Sin asignar'}
                </td>
                <td className={estilos.columnaAccion}>
                  <button
                    type="button"
                    className={estilos.botonIcono}
                    title="Modificar sección"
                    aria-label={`Modificar la sección ${item.nombre} de ${grado.nombre}`}
                    onClick={() => modelo.abrirEdicion(item)}
                  >
                    <Icono nombre="editar" tamano={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <>
      {/* Una sola fila: el año (con su estado) y los grados como chips, con «Crear grado» al final. */}
      <section className={estilos.filtros} aria-label="Año académico y grado">
        <div className={estilos.filaFiltros}>
          <div className={estilos.grupoAnio}>
            <SelectFiltro
              id="anio-escolar-anio"
              etiqueta="Año académico"
              valor={modelo.anioId}
              opciones={opcionesAnio}
              alCambiar={modelo.establecerAnioId}
              apilado
            />
            {finalizado && <Insignia tono="gris">Finalizado</Insignia>}
          </div>

          {datos.grados.length > 0 && (
            <div
              className={estilos.grupoGrado}
              title="Los grados se comparten entre todos los años académicos."
            >
              <span className={estilos.rotuloFiltro} aria-hidden="true">Grado</span>
              <FiltroChips
                etiquetaGrupo="Filtrar secciones por grado"
                opciones={opcionesGrado}
                valorSeleccionado={modelo.gradoId}
                alSeleccionar={modelo.establecerGradoId}
              />
            </div>
          )}

          <button type="button" className={estilos.botonSecundario} onClick={() => modelo.abrir('grado')}>
            <Icono nombre="agregar" tamano={18} />
            Crear grado
          </button>
        </div>
      </section>

      <section className={estilos.tarjetaResultados} aria-label="Secciones del grado">
        {cuerpo}
        {anio && grado && secciones.length > 0 && (
          <p className={estilos.pie}>
            {secciones.length} {secciones.length === 1 ? 'sección' : 'secciones'} · {cupos} cupos de capacidad total
            {finalizado && ' · Año finalizado: solo consulta'}
          </p>
        )}
      </section>

      {formulario && (
        <DialogoEstructuraEscolar
          formulario={formulario}
          errores={modelo.errores}
          errorGuardado={modelo.errorGuardado}
          guardando={modelo.guardando}
          docentes={datos.docentes}
          contexto={{ anio: anio?.anio, grado: grado?.nombre }}
          alCambiar={modelo.establecerFormulario}
          alGuardar={modelo.guardar}
          alCancelar={() => modelo.establecerFormulario(null)}
        />
      )}
    </>
  );
}
