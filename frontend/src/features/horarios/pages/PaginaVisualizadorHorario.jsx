import { useEffect, useMemo, useState } from 'react';

import useAuth from '../../../shared/auth/useAuth.js';
import Icono from '../../../shared/components/Icono.jsx';
import MatrizSesiones from '../components/MatrizSesiones.jsx';
import SelectorFecha from '../components/SelectorFecha.jsx';
import {
  fechaISO,
  formatearFecha,
  lunesDeFecha,
  semanasDelRango
} from '../utils/tiempo.js';
import {
  horarioApoderado,
  horarioDocente,
  horarioSeccion,
  listarAniosAcademicos,
  listarDocentes,
  listarMisEstudiantes,
  listarSecciones,
  miHorarioDocente,
  miHorarioEstudiante,
  obtenerPeriodo
} from '../services/visualizadoresService.js';

const ADMIN = 'ADMINISTRADOR';
const DOCENTE = 'DOCENTE';
const ESTUDIANTE = 'ESTUDIANTE';
const APODERADO = 'APODERADO';

function inicioSemanaActual() {
  return fechaISO(lunesDeFecha(fechaISO(new Date())));
}

function finSemanaActual() {
  const lunes = lunesDeFecha(fechaISO(new Date()));
  const viernes = new Date(lunes);
  viernes.setDate(lunes.getDate() + 4);
  return fechaISO(viernes);
}

const estiloCampo = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  fontSize: 14,
  fontWeight: 600
};

const estiloEntrada = {
  minHeight: 48,
  padding: '0 14px',
  font: 'inherit',
  fontSize: 16,
  color: 'var(--color-texto)',
  background: 'var(--color-superficie)',
  border: '1px solid var(--color-borde-fuerte)',
  borderRadius: 8
};

const estiloFlecha = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flex: '0 0 auto',
  width: 32,
  height: 32,
  padding: 0,
  color: 'var(--color-accion)',
  background: 'var(--color-superficie)',
  border: '1px solid var(--color-borde-fuerte)',
  borderRadius: 8,
  cursor: 'pointer'
};

export default function PaginaVisualizadorHorario() {
  const { usuario } = useAuth();
  const rol = usuario?.rol;

  const [tipo, setTipo] = useState('seccion');
  const [anio, setAnio] = useState(null);
  const [gradoId, setGradoId] = useState('');
  const [id, setId] = useState('');
  const [opciones, setOpciones] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [periodo, setPeriodo] = useState(null);
  const [cargandoOpciones, setCargandoOpciones] = useState(false);
  const [errorOpciones, setErrorOpciones] = useState('');

  const [fechaInicio, setFechaInicio] = useState(inicioSemanaActual);
  const [fechaFin, setFechaFin] = useState(finSemanaActual);
  const [datos, setDatos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [recarga, setRecarga] = useState(0);
  const [semanaSeleccionada, setSemanaSeleccionada] = useState(null);

  useEffect(() => {
    let activo = true;
    listarAniosAcademicos().then((respuesta) => {
      if (!activo) return;
      if (!respuesta.exitoso || !Array.isArray(respuesta.datos)) {
        setErrorOpciones(respuesta.mensaje || 'No se pudieron cargar los años académicos.');
        return;
      }
      const actual = respuesta.datos.find(
        (elemento) => Number(elemento.anio) === new Date().getFullYear()
      ) ?? respuesta.datos.at(-1) ?? null;
      if (!actual) {
        setErrorOpciones('No hay años académicos configurados.');
        return;
      }

      const inicio = actual.fechaInicio ?? `${actual.anio}-01-01`;
      const fin = actual.fechaFin ?? `${actual.anio}-12-31`;
      setAnio(actual);
      setFechaInicio(String(inicio).slice(0, 10));
      setFechaFin(String(fin).slice(0, 10));
    });
    return () => { activo = false; };
  }, []);

  useEffect(() => {
    if (rol !== ADMIN) return undefined;
    if (tipo === 'seccion' && !anio?.id) return undefined;

    let activo = true;
    setOpciones([]);
    setId('');
    setCargandoOpciones(true);
    setErrorOpciones('');

    const consulta = tipo === 'seccion'
      ? listarSecciones(anio.id)
      : listarDocentes();

    consulta.then((respuesta) => {
      if (!activo) return;
      if (!respuesta.exitoso || !Array.isArray(respuesta.datos)) {
        setErrorOpciones(respuesta.mensaje || 'No se pudieron cargar las opciones.');
        setCargandoOpciones(false);
        return;
      }
      setOpciones(respuesta.datos);
      setCargandoOpciones(false);
    });

    return () => { activo = false; };
  }, [rol, tipo, anio?.id]);

  useEffect(() => {
    if (rol !== APODERADO) return undefined;
    let activo = true;
    setCargandoOpciones(true);
    setErrorOpciones('');
    listarMisEstudiantes().then((respuesta) => {
      if (!activo) return;
      if (!respuesta.exitoso || !Array.isArray(respuesta.datos)) {
        setErrorOpciones(respuesta.mensaje || 'No se pudieron cargar los estudiantes.');
        setCargandoOpciones(false);
        return;
      }
      setEstudiantes(respuesta.datos);
      setCargandoOpciones(false);
    });
    return () => { activo = false; };
  }, [rol]);

  const seccionSeleccionada = useMemo(
    () => opciones.find((opcion) => String(opcion.id) === String(id)),
    [opciones, id]
  );

  useEffect(() => {
    if (rol !== ADMIN || tipo !== 'seccion' || !id) {
      setPeriodo(null);
      return undefined;
    }
    const anioId = seccionSeleccionada?.anioAcademicoId ?? anio?.id;
    if (!anioId) return undefined;

    let activo = true;
    obtenerPeriodo(anioId).then((respuesta) => {
      if (!activo) return;
      setPeriodo(respuesta.exitoso ? respuesta.datos : null);
    });
    return () => { activo = false; };
  }, [rol, tipo, id, seccionSeleccionada, anio?.id]);

  useEffect(() => {
    let activo = true;

    if (!anio) {
      setDatos([]);
      setError('');
      setCargando(false);
      return () => { activo = false; };
    }
    if ((rol === ADMIN || rol === APODERADO) && !id) {
      setDatos([]);
      setError('');
      setCargando(false);
      return () => { activo = false; };
    }
    if (!fechaInicio || !fechaFin || fechaFin < fechaInicio) {
      setDatos([]);
      setError('Selecciona un rango de fechas válido.');
      setCargando(false);
      return () => { activo = false; };
    }

    setCargando(true);
    setError('');

    let consulta;
    if (rol === ADMIN) {
      consulta = tipo === 'seccion'
        ? horarioSeccion(id, { fechaInicio, fechaFin })
        : horarioDocente(id, { fechaInicio, fechaFin });
    } else if (rol === DOCENTE) {
      consulta = miHorarioDocente({ fechaInicio, fechaFin });
    } else if (rol === ESTUDIANTE) {
      consulta = miHorarioEstudiante({ fechaInicio, fechaFin });
    } else if (rol === APODERADO) {
      consulta = horarioApoderado(id, { fechaInicio, fechaFin });
    } else {
      setCargando(false);
      return () => { activo = false; };
    }

    consulta.then((respuesta) => {
      if (!activo) return;
      if (respuesta.exitoso) {
        setDatos(Array.isArray(respuesta.datos) ? respuesta.datos : []);
      } else if (!respuesta.cancelada) {
        setDatos([]);
        setError(respuesta.mensaje || 'No se pudo consultar el horario.');
      }
      setCargando(false);
    });

    return () => { activo = false; };
  }, [rol, tipo, id, fechaInicio, fechaFin, recarga, anio?.id]);

  const grados = [...new Map(
    opciones.map((seccion) => [
      String(seccion.gradoId),
      { id: seccion.gradoId, nombre: seccion.gradoNombre ?? String(seccion.gradoId) }
    ])
  ).values()];

  const seccionesFiltradas = opciones.filter(
    (seccion) => String(seccion.gradoId) === String(gradoId)
  );

  const programacionAbierta = Boolean(
    periodo?.crudBloquesHorarioAbierta || periodo?.asignacionCursoDocenteAbierta
  );

  const rutaEdicion = seccionSeleccionada
    ? `/horarios?anio=${encodeURIComponent(seccionSeleccionada.anioAcademicoId ?? anio?.id ?? '')}`
      + `&grado=${encodeURIComponent(String(seccionSeleccionada.gradoId))}`
      + `&seccion=${encodeURIComponent(String(seccionSeleccionada.id))}`
    : '/horarios';

  const estudianteSeleccionado = estudiantes.find(
    (estudiante) => String(estudiante.id) === String(id)
  );
  const tituloConsulta = rol === ADMIN
    ? tipo === 'seccion'
      ? seccionSeleccionada?.nombre
        ? `${seccionSeleccionada.gradoNombre ?? ''} ${seccionSeleccionada.nombre}`.trim()
        : ''
      : opciones.find((docente) => String(docente.id) === String(id))?.nombre ?? ''
    : rol === APODERADO
      ? estudianteSeleccionado?.nombreCompleto ?? ''
      : usuario?.nombre ?? '';

  const semanas = useMemo(
    () => semanasDelRango(fechaInicio, fechaFin).map((semana) => ({
      ...semana,
      sesiones: datos.filter((sesion) => sesion.fecha >= semana.inicio && sesion.fecha <= semana.fin)
    })),
    [fechaInicio, fechaFin, datos]
  );

  const meses = useMemo(() => {
    const mapa = new Map();
    semanas.forEach((semana) => {
      const clave = semana.inicio.slice(0, 7);
      if (!mapa.has(clave)) {
        const fecha = new Date(`${clave}-01T00:00:00`);
        const etiqueta = fecha.toLocaleDateString('es-PE', { month: 'long', year: 'numeric' });
        mapa.set(clave, {
          clave,
          etiqueta: etiqueta.charAt(0).toUpperCase() + etiqueta.slice(1),
          semanas: []
        });
      }
      mapa.get(clave).semanas.push(semana);
    });
    return [...mapa.values()];
  }, [semanas]);

  // Al cambiar el rango se vuelve a elegir una semana útil; no se conserva la
  // última semana visitada de la consulta anterior.
  useEffect(() => {
    setSemanaSeleccionada(null);
  }, [fechaInicio, fechaFin]);

  useEffect(() => {
    if (semanas.length === 0) {
      setSemanaSeleccionada(null);
      return;
    }
    if (semanas.some((semana) => semana.inicio === semanaSeleccionada)) return;
    const hoy = fechaISO(new Date());
    const semanaDeHoy = semanas.find((semana) => semana.inicio <= hoy && hoy <= semana.fin);
    setSemanaSeleccionada((semanaDeHoy ?? semanas[0]).inicio);
  }, [semanas, semanaSeleccionada]);

  const indiceSemana = semanas.findIndex((semana) => semana.inicio === semanaSeleccionada);
  const semanaActual = semanas[indiceSemana] ?? semanas[0] ?? null;

  const cambiarSemana = (inicio) => setSemanaSeleccionada(inicio);
  const irSemanaAnterior = () => {
    if (indiceSemana > 0) setSemanaSeleccionada(semanas[indiceSemana - 1].inicio);
  };
  const irSemanaSiguiente = () => {
    if (indiceSemana >= 0 && indiceSemana < semanas.length - 1) {
      setSemanaSeleccionada(semanas[indiceSemana + 1].inicio);
    }
  };

  return (
    <section style={{ padding: 24 }}>
      <h1>Consulta de horario</h1>
      <p>Selecciona un rango de fechas para consultar las sesiones programadas.</p>

      {rol === ADMIN && (
        <label style={{ display: 'block', marginTop: 12 }}>
          Consultar por{' '}
          <select
            value={tipo}
            onChange={(evento) => {
              setTipo(evento.target.value);
              setId('');
              setGradoId('');
            }}
          >
            <option value="seccion">Sección</option>
            <option value="docente">Docente</option>
          </select>
        </label>
      )}

      {rol === ADMIN && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 12 }}>
          {tipo === 'seccion' && (
            <label style={estiloCampo}>
              Grado
              <select
                style={estiloEntrada}
                value={gradoId}
                onChange={(evento) => {
                  setGradoId(evento.target.value);
                  setId('');
                }}
                disabled={cargandoOpciones}
              >
                <option value="">Seleccione un grado</option>
                {grados.map((grado) => (
                  <option key={grado.id} value={grado.id}>{grado.nombre}</option>
                ))}
              </select>
            </label>
          )}

          <label style={estiloCampo}>
            {tipo === 'seccion' ? 'Sección' : 'Docente'}
            <select
              style={estiloEntrada}
              value={id}
              onChange={(evento) => setId(evento.target.value)}
              disabled={cargandoOpciones || (tipo === 'seccion' && !gradoId)}
            >
              <option value="">Seleccione una opción</option>
              {(tipo === 'seccion' ? seccionesFiltradas : opciones).map((opcion) => (
                <option key={opcion.id} value={opcion.id}>
                  {tipo === 'seccion'
                    ? `${opcion.nombre} (${opcion.anioAcademico ?? anio?.anio ?? ''})`
                    : opcion.nombre}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      {rol === APODERADO && (
        <label style={{ ...estiloCampo, marginTop: 12 }}>
          Estudiante a cargo
          <select
            style={estiloEntrada}
            value={id}
            onChange={(evento) => setId(evento.target.value)}
            disabled={cargandoOpciones}
          >
            <option value="">Seleccione un estudiante</option>
            {estudiantes.map((estudiante) => (
              <option key={estudiante.id} value={estudiante.id}>
                {estudiante.nombreCompleto}
              </option>
            ))}
          </select>
        </label>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: 16, marginTop: 16 }}>
        <label style={estiloCampo}>
          Desde
          <SelectorFecha
            id="consulta-horario-desde"
            etiqueta="Desde"
            valor={fechaInicio}
            max={fechaFin}
            alCambiar={setFechaInicio}
          />
        </label>
        <label style={estiloCampo}>
          Hasta
          <SelectorFecha
            id="consulta-horario-hasta"
            etiqueta="Hasta"
            valor={fechaFin}
            min={fechaInicio}
            alCambiar={setFechaFin}
          />
        </label>
        <button
          type="button"
          style={{ ...estiloEntrada, cursor: 'pointer' }}
          onClick={() => setRecarga((actual) => actual + 1)}
          disabled={cargando}
        >
          Actualizar horario
        </button>
      </div>

      {cargandoOpciones && <p>Cargando opciones…</p>}
      {errorOpciones && <p role="alert">{errorOpciones}</p>}
      {cargando && <p>Cargando horario…</p>}
      {error && <p role="alert">{error}</p>}

      {rol === ADMIN && tipo === 'seccion' && programacionAbierta && (
        <p><a href={rutaEdicion}>Editar horario</a></p>
      )}

      {!cargando && !error && semanas.length === 0 && (
        <p>Aún no hay sesiones programadas en el rango seleccionado.</p>
      )}

      {!cargando && !error && semanaActual && (
        <section style={{ marginTop: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              style={{ ...estiloFlecha, opacity: indiceSemana <= 0 ? 0.45 : 1 }}
              aria-label="Semana anterior"
              disabled={indiceSemana <= 0}
              onClick={irSemanaAnterior}
            >
              <Icono nombre="flecha-izquierda" tamano={16} />
            </button>

            <h2 style={{ flex: '1 1 auto', margin: 0, fontSize: 18 }}>
              {tituloConsulta ? `${tituloConsulta} · ` : ''}
              Semana del {formatearFecha(semanaActual.inicio)} al {formatearFecha(semanaActual.fin)}
            </h2>

            <button
              type="button"
              style={{ ...estiloFlecha, opacity: indiceSemana >= semanas.length - 1 ? 0.45 : 1 }}
              aria-label="Semana siguiente"
              disabled={indiceSemana >= semanas.length - 1}
              onClick={irSemanaSiguiente}
            >
              <Icono nombre="flecha-derecha" tamano={16} />
            </button>
          </div>

          <label style={{ ...estiloCampo, maxWidth: 360, marginTop: 10 }}>
            Ir a semana
            <select
              style={estiloEntrada}
              value={semanaActual.inicio}
              onChange={(evento) => cambiarSemana(evento.target.value)}
            >
              {meses.map((mes) => (
                <optgroup key={mes.clave} label={mes.etiqueta}>
                  {mes.semanas.map((semana) => (
                    <option key={semana.inicio} value={semana.inicio}>
                      {formatearFecha(semana.inicio)} al {formatearFecha(semana.fin)}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>

          {semanaActual.sesiones.length === 0 ? (
            <p>No hay sesiones en esta semana.</p>
          ) : (
            <MatrizSesiones
              titulo={`${tituloConsulta} ${formatearFecha(semanaActual.inicio)}`}
              sesiones={semanaActual.sesiones}
              mostrarSeccion={rol !== ADMIN || tipo === 'docente'}
            />
          )}
        </section>
      )}
    </section>
  );
}
