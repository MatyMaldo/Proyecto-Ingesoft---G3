<<<<<<< Updated upstream
import useGradosSecciones from '../hooks/useGradosSecciones.js';
import { esAnioFinalizado } from '../utils/validacionesGradosSecciones.js';
=======
import { useCallback, useEffect, useRef, useState } from 'react';

>>>>>>> Stashed changes
import EstadoConsulta from '../../../shared/components/EstadoConsulta.jsx';
import estilos from '../pages/PaginaAnioEscolar.module.css';
<<<<<<< Updated upstream
=======
import DialogoEstructuraEscolar from './DialogoEstructuraEscolar.jsx';

/** «1er Grado de Secundaria» → «1er Grado»: los chips de grado ocupan menos; el nombre completo va en el título. */
function nombreCortoGrado(nombre) {
  return String(nombre ?? '').replace(/\s+de\s+(Secundaria|Primaria|Inicial)$/i, '').trim();
}
>>>>>>> Stashed changes

/** Bloque independiente que se integrará en la pantalla de Año escolar compartida. */
/** Matriculados confirmados sobre la capacidad (p. ej. 18/30) con una barra; sin el dato, solo la capacidad. */
function OcupacionSeccion({ matriculados, capacidad }) {
  if (typeof matriculados !== 'number') {
    return <p className={estilos.ocupacionTexto}>{capacidad} estudiantes</p>;
  }
  const porcentaje = capacidad > 0 ? Math.min(100, Math.round((matriculados / capacidad) * 100)) : 0;
  return (
    <div className={estilos.ocupacion}>
      <p className={estilos.ocupacionTexto}>
        <strong>{matriculados}</strong> / {capacidad} estudiantes
      </p>
      <progress
        className={`${estilos.barraOcupacion} ${porcentaje >= 100 ? estilos.barraLlena : ''}`}
        value={matriculados}
        max={capacidad}
        aria-label={`${matriculados} de ${capacidad} estudiantes matriculados (${porcentaje}%)`}
      />
    </div>
  );
}

<<<<<<< Updated upstream
export default function PanelGradosSecciones() {
  const modelo = useGradosSecciones();
  const { datos, estado, formulario, errores, guardando } = modelo;
  const anio = datos.anios.find((item) => String(item.id) === modelo.anioId);
  const grado = datos.grados.find((item) => String(item.id) === modelo.gradoId);
  const finalizado = esAnioFinalizado(anio);
  const secciones = datos.secciones.filter((item) => String(item.anioAcademicoId) === modelo.anioId && String(item.gradoId) === modelo.gradoId);
  const puedeCrearSeccion = Boolean(anio && grado && !finalizado);
=======
/** Tarjeta de una sección: nombre, ocupación y tutor, con «Modificar» al pie (mismo patrón que las tarjetas de cursos). */
function TarjetaSeccion({ seccion, grado, alModificar }) {
  const completa = typeof seccion.matriculadosConfirmados === 'number'
    && seccion.matriculadosConfirmados >= seccion.capacidadMaxima;
  return (
    <article className={estilos.tarjetaSeccion}>
      <div className={estilos.encabezadoSeccion}>
        <h3 className={estilos.nombreSeccion}>Sección {seccion.nombre}</h3>
        {completa && <Insignia tono="ambar">Completa</Insignia>}
      </div>
      <OcupacionSeccion matriculados={seccion.matriculadosConfirmados} capacidad={seccion.capacidadMaxima} />
      <p className={estilos.tutor}>
        <span className={estilos.rotuloFiltro}>Tutor</span>
        {seccion.tutorNombreCompleto
          ? <span>{seccion.tutorNombreCompleto}</span>
          : <Insignia tono="ambar">Sin tutor asignado</Insignia>}
      </p>
      <div className={estilos.pieSeccion}>
        <button
          type="button"
          className={estilos.botonSecundario}
          aria-label={`Modificar la sección ${seccion.nombre} de ${grado.nombre}`}
          onClick={() => alModificar(seccion)}
        >
          <Icono nombre="editar" tamano={18} />
          Modificar
        </button>
      </div>
    </article>
  );
}

/**
 * Fila única de tarjetas con desplazamiento horizontal: si las secciones no caben, no pasan a otra fila (se evita el
 * scroll vertical) sino que se desplazan a la derecha. Las flechas aparecen solo cuando hay desborde.
 */
function CarruselSecciones({ etiqueta, cantidad, children }) {
  const pista = useRef(null);
  const [bordes, establecerBordes] = useState({ inicio: true, fin: true });

  const medir = useCallback(() => {
    const el = pista.current;
    if (!el) {
      return;
    }
    establecerBordes({
      inicio: el.scrollLeft <= 1,
      fin: el.scrollLeft + el.clientWidth >= el.scrollWidth - 1
    });
  }, []);

  useEffect(() => {
    medir();
    const el = pista.current;
    if (!el || typeof ResizeObserver === 'undefined') {
      return undefined;
    }
    const observador = new ResizeObserver(medir);
    observador.observe(el);
    return () => observador.disconnect();
  }, [medir, cantidad]);

  const desplazar = (sentido) => {
    const el = pista.current;
    el?.scrollBy({ left: sentido * el.clientWidth * 0.8, behavior: 'smooth' });
  };

  const desborda = !(bordes.inicio && bordes.fin);

  return (
    <div className={estilos.carrusel}>
      {desborda && (
        <button
          type="button"
          className={`${estilos.flecha} ${estilos.flechaIzquierda}`}
          aria-label="Ver secciones anteriores"
          disabled={bordes.inicio}
          onClick={() => desplazar(-1)}
        >
          <Icono nombre="flecha-izquierda" tamano={20} />
        </button>
      )}
      <ul ref={pista} className={estilos.rejilla} aria-label={etiqueta} onScroll={medir}>
        {children}
      </ul>
      {desborda && (
        <button
          type="button"
          className={`${estilos.flecha} ${estilos.flechaDerecha}`}
          aria-label="Ver más secciones"
          disabled={bordes.fin}
          onClick={() => desplazar(1)}
        >
          <Icono nombre="flecha-derecha" tamano={20} />
        </button>
      )}
    </div>
  );
}

/**
 * Año escolar, de lo general a lo específico: año académico → grado (chips) → secciones del grado elegido, con sus
 * acciones junto a lo que crean («Nuevo grado» entre los chips, «Crear sección» en el título de las secciones).
 * El estado lo maneja `useGradosSecciones` (recibido como `modelo`).
 *
 * Son pocas secciones por grado, así que se muestran como tarjetas, sin tabla, paginador ni selector de filas.
 */
export default function PanelGradosSecciones({ modelo }) {
  const { datos, estado, formulario, anio, grado, finalizado, secciones } = modelo;
>>>>>>> Stashed changes

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

<<<<<<< Updated upstream
  if (estado === 'cargando') return <EstadoConsulta tipo="carga" mensaje="Cargando estructura escolar…" />;
  if (estado === 'error') return <EstadoConsulta tipo="error" mensaje={modelo.errorCarga} alReintentar={modelo.reintentar} />;
=======
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
  const puedeCrear = modelo.puedeCrearSeccion;

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
        etiquetaAccion={puedeCrear ? 'Crear la primera sección' : undefined}
        alAccion={puedeCrear ? () => modelo.abrir('seccion') : undefined}
      />
    );
  } else {
    cuerpo = (
      <CarruselSecciones etiqueta={`Secciones de ${grado.nombre} · ${anio.anio}`} cantidad={secciones.length}>
        {secciones.map((item) => (
          <li key={item.id}>
            <TarjetaSeccion seccion={item} grado={grado} alModificar={modelo.abrirEdicion} />
          </li>
        ))}
      </CarruselSecciones>
    );
  }
>>>>>>> Stashed changes

  const hayContexto = Boolean(anio && grado);

  return (
<<<<<<< Updated upstream
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
            <thead><tr><th scope="col">Sección</th><th scope="col">Ocupación</th><th scope="col">Tutor</th><th scope="col">Acciones</th></tr></thead>
            <tbody>{secciones.map((item) => <tr key={item.id}><td><strong>{item.nombre}</strong></td><td><OcupacionSeccion matriculados={item.matriculadosConfirmados} capacidad={item.capacidadMaxima} /></td><td>{item.tutorNombreCompleto ?? 'Sin asignar'}</td><td><button type="button" className={estilos.secundario} disabled={Boolean(formulario)} onClick={() => modelo.abrirEdicion(item)}>Modificar</button></td></tr>)}</tbody>
          </table></div> : <EstadoConsulta tipo="vacio" mensaje="No hay secciones registradas para el grado y año seleccionados." />
        ) : <EstadoConsulta tipo="vacio" mensaje="Selecciona un año académico y un grado para consultar sus secciones." />}
        <p className={estilos.pie}>{secciones.length} secciones · {secciones.reduce((total, item) => total + item.capacidadMaxima, 0)} cupos de capacidad total</p>
=======
    <>
      {/* Contexto: el año (con su estado) y debajo los grados como chips, con «Nuevo grado» al final de la fila. */}
      <section className={estilos.contexto} aria-label="Año académico y grado">
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
          <div className={estilos.grupoGrado} title="Los grados se comparten entre todos los años académicos.">
            <span className={estilos.rotuloFiltro} aria-hidden="true">Grado</span>
            <div className={estilos.filaChips}>
              <FiltroChips
                etiquetaGrupo="Filtrar secciones por grado"
                opciones={opcionesGrado}
                valorSeleccionado={modelo.gradoId}
                alSeleccionar={modelo.establecerGradoId}
              />
              <button type="button" className={estilos.chipNuevo} onClick={() => modelo.abrir('grado')}>
                <Icono nombre="agregar" tamano={16} />
                Crear grado
              </button>
            </div>
          </div>
        )}
      </section>

      <section className={estilos.secciones} aria-label="Secciones del grado">
        {hayContexto && (
          <div className={estilos.encabezadoZona}>
            <div className={estilos.textoZona}>
              <h2 className={estilos.tituloZona}>Secciones de {grado.nombre} · {anio.anio}</h2>
              {secciones.length > 0 && (
                <p className={estilos.resumen}>
                  {secciones.length} {secciones.length === 1 ? 'sección' : 'secciones'} · {cupos} cupos en total
                </p>
              )}
            </div>
            <button
              type="button"
              className={estilos.botonPrimario}
              disabled={!puedeCrear}
              onClick={() => modelo.abrir('seccion')}
            >
              <Icono nombre="agregar" tamano={18} />
              Crear sección
            </button>
          </div>
        )}

        {hayContexto && finalizado && (
          <p className={estilos.avisoFinalizado} role="note">
            Este año académico finalizó: se pueden consultar sus secciones, pero no crear nuevas.
          </p>
        )}

        {cuerpo}
>>>>>>> Stashed changes
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
