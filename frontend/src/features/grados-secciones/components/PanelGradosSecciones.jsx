import useGradosSecciones from '../hooks/useGradosSecciones.js';
import { esAnioFinalizado } from '../utils/validacionesGradosSecciones.js';
import EstadoConsulta from '../../../shared/components/EstadoConsulta.jsx';
import estilos from '../pages/PaginaAnioEscolar.module.css';

/** Bloque independiente que se integrará en la pantalla de Año escolar compartida. */
export default function PanelGradosSecciones() {
  const modelo = useGradosSecciones();
  const { datos, estado, formulario, errores, guardando } = modelo;
  const anio = datos.anios.find((item) => String(item.id) === modelo.anioId);
  const grado = datos.grados.find((item) => String(item.id) === modelo.gradoId);
  const finalizado = esAnioFinalizado(anio);
  const secciones = datos.secciones.filter((item) => String(item.anioAcademicoId) === modelo.anioId && String(item.gradoId) === modelo.gradoId);
  const puedeCrearSeccion = Boolean(anio && grado && !finalizado);

  function campo(nombre, etiqueta, tipo = 'text', maxLength) {
    return (
      <label className={estilos.campo} htmlFor={`registro-${nombre}`}>
        {etiqueta}
        <input id={`registro-${nombre}`} name={nombre} type={tipo} value={formulario[nombre]} maxLength={maxLength}
          autoFocus={nombre === 'nombre'} disabled={guardando} aria-required="true"
          aria-invalid={Boolean(errores[nombre])} aria-describedby={errores[nombre] ? `error-${nombre}` : undefined}
          onChange={(evento) => modelo.establecerFormulario({ ...formulario, [nombre]: evento.target.value })} />
        {errores[nombre] && <span className={estilos.error} id={`error-${nombre}`}>{errores[nombre]}</span>}
      </label>
    );
  }

  if (estado === 'cargando') return <EstadoConsulta tipo="carga" mensaje="Cargando estructura escolar…" />;
  if (estado === 'error') return <EstadoConsulta tipo="error" mensaje={modelo.errorCarga} alReintentar={modelo.reintentar} />;

  return (
    <div className={estilos.panel}>
      {modelo.confirmacion && <p className={estilos.confirmacion} role="status">{modelo.confirmacion}</p>}
      <section className={estilos.tarjeta} aria-labelledby="titulo-grados">
        <div className={estilos.cabeceraTarjeta}>
          <div><h2 id="titulo-grados">Catálogo de grados</h2><p>Los grados se comparten entre todos los años académicos.</p></div>
          <button className={estilos.primario} disabled={Boolean(formulario)} onClick={() => modelo.abrir('grado')}>+ Crear grado</button>
        </div>
        <ul className={estilos.grados} aria-label="Grados registrados">
          {datos.grados.map((item) => <li key={item.id}><button aria-pressed={modelo.gradoId === String(item.id)}
            disabled={Boolean(formulario)} onClick={() => modelo.establecerGradoId(String(item.id))}>{item.nombre}</button></li>)}
        </ul>
        {!datos.grados.length && <EstadoConsulta tipo="vacio" mensaje="Aún no hay grados registrados. Crea el primer grado para organizar las secciones." />}
      </section>

      <section className={estilos.tarjeta} aria-labelledby="titulo-secciones">
        <div className={estilos.cabeceraTarjeta}>
          <div><h2 id="titulo-secciones">Secciones por año y grado</h2><p>Consulta y organiza la estructura escolar antes de matricular estudiantes.</p></div>
          <button className={estilos.primario} disabled={!puedeCrearSeccion || Boolean(formulario)} onClick={() => modelo.abrir('seccion')}>+ Crear sección</button>
        </div>
        <div className={estilos.filtros}>
          <label className={estilos.campo}>Año académico
            <select value={modelo.anioId} disabled={Boolean(formulario)} onChange={(evento) => modelo.establecerAnioId(evento.target.value)}>
              <option value="">Selecciona un año</option>
              {datos.anios.map((item) => <option key={item.id} value={item.id}>{item.anio}{esAnioFinalizado(item) ? ' · Finalizado' : ''}</option>)}
            </select>
          </label>
          <label className={estilos.campo}>Grado
            <select value={modelo.gradoId} disabled={Boolean(formulario)} onChange={(evento) => modelo.establecerGradoId(evento.target.value)}>
              <option value="">Selecciona un grado</option>
              {datos.grados.map((item) => <option key={item.id} value={item.id}>{item.nombre}</option>)}
            </select>
          </label>
        </div>
        {!datos.anios.length && <p className={estilos.aviso}>Primero debe configurarse un año académico para registrar secciones.</p>}
        {finalizado && <p className={estilos.aviso}>Este año académico finalizó. Puedes consultar sus secciones, pero no crear nuevas.</p>}
        {anio && grado ? (
          secciones.length ? <div className={estilos.tablaContenedor}><table>
            <caption>Secciones de {grado.nombre} · {anio.anio}</caption>
            <thead><tr><th scope="col">Sección</th><th scope="col">Grado</th><th scope="col">Año académico</th><th scope="col">Capacidad máxima</th><th scope="col">Tutor</th><th scope="col">Acciones</th></tr></thead>
            <tbody>{secciones.map((item) => <tr key={item.id}><td><strong>{item.nombre}</strong></td><td>{item.gradoNombre ?? grado.nombre}</td><td>{item.anioAcademico ?? anio.anio}</td><td>{item.capacidadMaxima} estudiantes</td><td>{item.tutorNombreCompleto ?? 'Sin asignar'}</td><td><button type="button" className={estilos.secundario} disabled={Boolean(formulario)} onClick={() => modelo.abrirEdicion(item)}>Modificar</button></td></tr>)}</tbody>
          </table></div> : <EstadoConsulta tipo="vacio" mensaje="No hay secciones registradas para el grado y año seleccionados." />
        ) : <EstadoConsulta tipo="vacio" mensaje="Selecciona un año académico y un grado para consultar sus secciones." />}
        <p className={estilos.pie}>{secciones.length} secciones · {secciones.reduce((total, item) => total + item.capacidadMaxima, 0)} cupos de capacidad total</p>
      </section>

      {formulario && <section className={estilos.tarjeta} aria-labelledby="titulo-formulario">
        <h2 id="titulo-formulario">{formulario.accion === 'editar' ? 'Modificar' : 'Crear'} {formulario.tipo === 'grado' ? 'grado' : 'sección'}</h2>
        <form onSubmit={modelo.guardar} noValidate aria-busy={guardando}>
          {formulario.tipo === 'seccion' && <p className={estilos.contexto}>Año académico: <strong>{anio?.anio}</strong> · Grado: <strong>{grado?.nombre}</strong>{formulario.accion === 'editar' && ' · El grado y el año no se pueden modificar'}</p>}
          <div className={estilos.filtros}>
            {campo('nombre', formulario.tipo === 'grado' ? 'Nombre del grado' : 'Nombre de la sección', 'text', formulario.tipo === 'grado' ? 60 : 1)}
            {formulario.tipo === 'seccion' && campo('capacidadMaxima', 'Capacidad máxima', 'text')}
          </div>
          {formulario.tipo === 'seccion' && <label className={estilos.campo} htmlFor="registro-tutorId">
            Tutor {formulario.accion === 'editar' ? '' : '*'}
            <select id="registro-tutorId" name="tutorId" value={formulario.tutorId} disabled={guardando}
              aria-required={formulario.accion !== 'editar'} aria-invalid={Boolean(errores.tutorId)}
              aria-describedby={errores.tutorId ? 'error-tutorId' : undefined}
              onChange={(evento) => modelo.establecerFormulario({ ...formulario, tutorId: evento.target.value })}>
              <option value="">{formulario.accion === 'editar' ? 'Sin tutor asignado' : 'Selecciona un tutor'}</option>
              {datos.docentes.map((docente) => <option key={docente.id} value={docente.id}>{docente.nombreCompleto}</option>)}
            </select>
            {errores.tutorId && <span className={estilos.error} id="error-tutorId">{errores.tutorId}</span>}
          </label>}
          {formulario.tipo === 'seccion' && <p className={estilos.pie}>Capacidad: número entero entre 1 y 65535.</p>}
          {modelo.errorGuardado && <p className={estilos.error} role="alert">{modelo.errorGuardado}</p>}
          <div className={estilos.acciones}>
            <button type="button" className={estilos.secundario} disabled={guardando} onClick={() => modelo.establecerFormulario(null)}>Cancelar</button>
            <button type="submit" className={estilos.primario} disabled={guardando}>{guardando ? 'Guardando…' : formulario.accion === 'editar' ? 'Guardar cambios' : 'Guardar'}</button>
          </div>
        </form>
      </section>}
    </div>
  );
}
