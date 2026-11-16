import { useCallback, useEffect, useRef, useState } from 'react';

import EstadoConsulta from '../../../shared/components/EstadoConsulta.jsx';
import FiltroChips from '../../../shared/components/FiltroChips.jsx';
import Icono from '../../../shared/components/Icono.jsx';
import Insignia from '../../../shared/components/Insignia.jsx';
import SelectFiltro from '../../../shared/components/SelectFiltro.jsx';
import estilos from '../pages/PaginaAnioEscolar.module.css';
import DialogoEstructuraEscolar from './DialogoEstructuraEscolar.jsx';

/** «1er Grado de Secundaria» → «1er Grado»: los chips de grado ocupan menos; el nombre completo va en el título. */
function nombreCortoGrado(nombre) {
  return String(nombre ?? '').replace(/\s+de\s+(Secundaria|Primaria|Inicial)$/i, '').trim();
}

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

  const hayContexto = Boolean(anio && grado);

  return (
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
