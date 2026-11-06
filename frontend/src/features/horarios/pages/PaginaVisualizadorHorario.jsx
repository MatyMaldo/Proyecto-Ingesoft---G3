
import { useEffect, useState } from 'react';
import useAuth from '../../../shared/auth/useAuth.js';
import { DIAS } from '../constants/horarios.js';
import {
  horarioSeccion,
  horarioDocente,
  miHorarioDocente,
  miHorarioEstudiante,
  horarioApoderado,
  listarSecciones,
  listarAniosAcademicos,
  listarDocentes,
  consultarEstadoProgramacion,
  listarMisEstudiantes
} from '../services/visualizadoresService.js';

const ADMIN = 'ADMINISTRADOR';
const DOCENTE = 'DOCENTE';
const ESTUDIANTE = 'ESTUDIANTE';
const APODERADO = 'APODERADO';

export default function PaginaVisualizadorHorario() {
  const { usuario } = useAuth();
  const rol = usuario?.rol;

  const [tipo, setTipo] = useState('seccion');
  const [gradoId, setGradoId] = useState('');
  const [programacionAbierta, setProgramacionAbierta] = useState(false);
  const [id, setId] = useState('');
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [recarga, setRecarga] = useState(0);


  
const [opciones, setOpciones] = useState([]);
const [cargandoOpciones, setCargandoOpciones] = useState(false);
const [errorOpciones, setErrorOpciones] = useState('');

useEffect(() => {
  if (rol !== ADMIN) return;

  let activo = true;
  setOpciones([]);
  setId('');
  setCargandoOpciones(true);
  setErrorOpciones('');

  async function cargarOpciones() {
    const [resultado, respuestaAnios] = tipo === 'seccion'
      ? await Promise.all([listarSecciones(), listarAniosAcademicos()])
      : [await listarDocentes(), null];

    if (!activo) return;

    if (resultado.exitoso && (!respuestaAnios || respuestaAnios.exitoso)) {
      const lista = tipo === 'seccion'
        ? resultado.datos ?? []
        : resultado.datos?.content ?? [];

      setOpciones(
        tipo === 'seccion'
          ? lista.filter(s => {
              const hoy = new Date();
              const fechaHoy = [
                hoy.getFullYear(),
                String(hoy.getMonth() + 1).padStart(2, '0'),
                String(hoy.getDate()).padStart(2, '0')
              ].join('-');
              return (respuestaAnios.datos ?? []).some(a =>
                a.anio === s.anioAcademico &&
                a.fechaInicio <= fechaHoy &&
                a.fechaFin >= fechaHoy
              );
            })
          : lista
      );
    } else {
      setErrorOpciones(resultado.mensaje || 'No se pudieron cargar las opciones.');
    }

    setCargandoOpciones(false);
  }

  cargarOpciones();

  return () => { activo = false; };
}, [rol, tipo]);


useEffect(() => {
  if (rol !== APODERADO) return;

  let activo = true;
  setOpciones([]);
  setId('');
  setCargandoOpciones(true);
  setErrorOpciones('');

  async function cargarEstudiantes() {
    const resultado = await listarMisEstudiantes();

    if (!activo) return;

    if (resultado.exitoso) {
      setOpciones(resultado.datos ?? []);
    } else {
      setErrorOpciones(
        resultado.mensaje || 'No se pudieron cargar los estudiantes.'
      );
    }

    setCargandoOpciones(false);
  }

  cargarEstudiantes();

  return () => { activo = false; };
}, [rol]);



  useEffect(() => {
    let vigente = true;
    setProgramacionAbierta(false);

    if (rol !== ADMIN || tipo !== 'seccion' ||
        !/^[1-9]\d*$/.test(id)) {
      return () => { vigente = false; };
    }

    consultarEstadoProgramacion(id).then(resultado => {
      if (!vigente) return;
      setProgramacionAbierta(
        resultado.exitoso &&
        resultado.datos?.programacionAbierta === true
      );
    });

    return () => { vigente = false; };
  }, [rol, tipo, id]);
  const requiereFiltro = rol === ADMIN || rol === APODERADO;

  useEffect(() => {
    let activo = true;

    if (requiereFiltro && !/^[1-9]\d*$/.test(id)) {
        setDatos(null);
        setError('');
        setCargando(false);
        return;
}

    async function cargar() {
      setCargando(true);
      setError('');
      setDatos(null);

      let consulta;

      if (rol === ADMIN) {
        consulta = tipo === 'seccion'
          ? horarioSeccion(id)
          : horarioDocente(id);
      } else if (rol === DOCENTE) {
        consulta = miHorarioDocente();
      } else if (rol === ESTUDIANTE) {
        consulta = miHorarioEstudiante();
      } else if (rol === APODERADO) {
        consulta = horarioApoderado(id);
      } else {
        setCargando(false);
        return;
      }

      const resultado = await consulta;

      if (!activo) return;

      if (resultado.exitoso) {
        setDatos(resultado.datos);
      } else if (!resultado.cancelada) {
        setError(resultado.mensaje || 'No se pudo consultar el horario.');
      }

      setCargando(false);
    }

    cargar();
    return () => { activo = false; };
  }, [rol, tipo, id, recarga, requiereFiltro]);

  
const grados = [
  ...new Map(
    opciones.map(s => [
      s.gradoId,
      { id: s.gradoId, nombre: s.gradoNombre }
    ])
  ).values()
];

const seccionesFiltradas = opciones.filter(
  s => String(s.gradoId) === gradoId
);

  
  const seccionParaEditar = opciones.find(
    opcion => String(opcion.id) === String(id)
  );

  const rutaEdicion = seccionParaEditar
    ? `/horarios?grado=${encodeURIComponent(String(seccionParaEditar.gradoId))}&seccion=${encodeURIComponent(seccionParaEditar.nombre)}`
    : '/horarios';

  const bloques = datos?.bloques ?? [];

  const limites = [...new Set(
    bloques.flatMap(b => [b.horaInicio, b.horaFin])
  )].sort();

  const franjas = limites.slice(0, -1).map((inicio, indice) => ({
    inicio,
    fin: limites[indice + 1]
  }));
  const estiloCelda = {
    border: '1px solid #d1d5db',
    padding: '12px',
    verticalAlign: 'top',
    minWidth: '145px'
  };

  return (
    <section style={{ padding: 24 }}>
      <h1>Consulta de horario semanal</h1>
      <p>Horario de lunes a viernes del año académico activo.</p>

      {rol === ADMIN && (
        <label>
          Consultar por:{' '}
          <select
            value={tipo}
            onChange={e => {
              setTipo(e.target.value);
              setId('');
            }}
          >
            <option value="seccion">Sección</option>
            <option value="docente">Docente</option>
          </select>
        </label>
      )}

      

{rol === ADMIN && (
  <div style={{ marginTop: 12 }}>
    {tipo === 'seccion' && (
      <label>
        Seleccionar grado{' '}
        <select
          value={gradoId}
          onChange={e => {
            setGradoId(e.target.value);
            setId('');
          }}
          disabled={cargandoOpciones}
        >
          <option value="">Seleccione un grado</option>
          {grados.map(grado => (
            <option key={grado.id} value={grado.id}>
              {grado.nombre}
            </option>
          ))}
        </select>
      </label>
    )}

    <label style={{ display: 'block', marginTop: 12 }}>
      {tipo === 'seccion'
        ? 'Seleccionar sección'
        : 'Seleccionar docente'}
      {' '}
      <select
        value={id}
        onChange={e => setId(e.target.value)}
        disabled={
          cargandoOpciones ||
          (tipo === 'seccion' && !gradoId)
        }
      >
        <option value="">Seleccione una opción</option>
        {(tipo === 'seccion'
          ? seccionesFiltradas
          : opciones
        ).map(opcion => (
          <option key={opcion.id} value={opcion.id}>
            {tipo === 'seccion'
              ? `${opcion.nombre} (${opcion.anioAcademico})`
              : `${opcion.nombreCompleto}${opcion.activo ? '' : ' (Inactivo)'}`}
          </option>
        ))}
      </select>
    </label>
  </div>
)}


{rol === ADMIN && cargandoOpciones && (
  <p>Cargando opciones...</p>
)}

{rol === ADMIN && errorOpciones && (
  <p role="alert">{errorOpciones}</p>
)}


{rol === APODERADO && (
  <label style={{ display: 'block', marginTop: 12 }}>
    Seleccionar estudiante a cargo{' '}
    <select
      value={id}
      onChange={e => setId(e.target.value)}
      disabled={cargandoOpciones}
    >
      <option value="">Seleccione un estudiante</option>
      {opciones.map(estudiante => (
        <option key={estudiante.id} value={estudiante.id}>
          {estudiante.nombreCompleto}
        </option>
      ))}
    </select>
  </label>
)}

{rol === APODERADO && cargandoOpciones && (
  <p>Cargando estudiantes...</p>
)}

{rol === APODERADO && errorOpciones && (
  <p role="alert">{errorOpciones}</p>
)}



      <button
        type="button"
        style={{ marginTop: 12 }}
        onClick={() => setRecarga(n => n + 1)}
        disabled={cargando}
      >
        Actualizar horario
      </button>

      {rol === ADMIN && tipo === 'seccion' &&
        programacionAbierta && (
          <p>
            <a href={rutaEdicion}>Editar horario</a>
          </p>
        )}
      {cargando && <p>Cargando horario...</p>}
      {error && <p role="alert">{error}</p>}
      {!cargando && !error && datos?.mensaje && (
        <p>{datos.mensaje}</p>
      )}

      {!cargando && franjas.length > 0 && (
        <div style={{ overflowX: 'auto', marginTop: 20 }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse'
          }}>
            <thead>
              <tr>
                <th style={estiloCelda}>Horario</th>
                {DIAS.map(dia => (
                  <th key={dia.id} style={estiloCelda}>
                    {dia.etiqueta}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {franjas.map(franja => (
                <tr key={franja.inicio}>
                  <th style={estiloCelda}>
                    {franja.inicio.slice(0, 5)} - {franja.fin.slice(0, 5)}
                  </th>

                  {DIAS.map(dia => {
                    const bloque = bloques.find(b =>
                      b.diaSemana === dia.id &&
                      b.horaInicio <= franja.inicio &&
                      b.horaFin > franja.inicio
                    );

                    if (!bloque) {
                      return (
                        <td key={dia.id} style={estiloCelda} />
                      );
                    }

                    // La celda ya fue dibujada en una fila anterior.
                    if (bloque.horaInicio !== franja.inicio) {
                      return null;
                    }

                    const inicioBloque = limites.indexOf(
                      bloque.horaInicio
                    );

                    const finBloque = limites.indexOf(
                      bloque.horaFin
                    );

                    const filasOcupadas = Math.max(
                      1,
                      finBloque - inicioBloque
                    );

                    const puedeEditarBloque =
                      rol === ADMIN &&
                      tipo === 'seccion' &&
                      programacionAbierta;

                    const EtiquetaBloque = puedeEditarBloque
                      ? 'a'
                      : 'div';

                    return (
                      <td
                        key={dia.id}
                        rowSpan={filasOcupadas}
                        style={estiloCelda}
                      >
                        <EtiquetaBloque
                          href={puedeEditarBloque ? rutaEdicion : undefined}
                          style={{
                          display: 'block',
                          textDecoration: 'none',
                          cursor: puedeEditarBloque ? 'pointer' : 'default',
                          background: '#e8f0fe',
                          color: '#172554',
                          borderRadius: 6,
                          padding: 10,
                          height: '100%',
                          boxSizing: 'border-box'
                        }}>
                          <strong>{bloque.cursoNombre}</strong>

                          <div>{bloque.docenteNombre}</div>
                          <div>{bloque.aulaNombre}</div>

                          {(rol === DOCENTE ||
                            (rol === ADMIN && tipo === 'docente')) && (
                            <div>
                              {bloque.gradoNombre}
                              {' '}
                              {bloque.seccionNombre}
                            </div>
                          )}

                          <small>
                            {bloque.horaInicio.slice(0, 5)}
                            {' - '}
                            {bloque.horaFin.slice(0, 5)}
                          </small>
                        </EtiquetaBloque>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
