
import { useEffect, useState } from 'react';
import useAuth from '../../../shared/auth/useAuth.js';
import { DIAS } from '../constants/horarios.js';
import {
  horarioSeccion,
  horarioDocente,
  miHorarioDocente,
  miHorarioEstudiante,
  horarioApoderado
} from '../services/visualizadoresService.js';

const ADMIN = 'ADMINISTRADOR';
const DOCENTE = 'DOCENTE';
const ESTUDIANTE = 'ESTUDIANTE';
const APODERADO = 'APODERADO';

export default function PaginaVisualizadorHorario() {
  const { usuario } = useAuth();
  const rol = usuario?.rol;

  const [tipo, setTipo] = useState('seccion');
  const [id, setId] = useState('');
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [recarga, setRecarga] = useState(0);

  const requiereFiltro = rol === ADMIN || rol === APODERADO;

  useEffect(() => {
    let activo = true;

    if (requiereFiltro && !/^[1-9]\d*$/.test(id)) {
      setDatos(null);
      setError('');
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

  const bloques = datos?.bloques ?? [];

  const franjas = [...new Set(
    bloques.map(b => `${b.horaInicio}|${b.horaFin}`)
  )].sort();

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

      {requiereFiltro && (
        <label style={{ display: 'block', marginTop: 12 }}>
          {rol === APODERADO
            ? 'ID del estudiante a cargo'
            : tipo === 'seccion' ? 'ID de sección' : 'ID de docente'}
          {' '}
          <input
            type="number"
            min="1"
            value={id}
            onChange={e => setId(e.target.value)}
          />
        </label>
      )}

      <button
        type="button"
        style={{ marginTop: 12 }}
        onClick={() => setRecarga(n => n + 1)}
        disabled={cargando}
      >
        Actualizar horario
      </button>

      {cargando && <p>Cargando horario...</p>}
      {error && <p role="alert">{error}</p>}
      {!cargando && !error && datos?.mensaje && (
        <p>{datos.mensaje}</p>
      )}

      {!cargando && franjas.length > 0 && (
        <div style={{ overflowX: 'auto', marginTop: 20 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
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
              {franjas.map(franja => {
                const [inicio, fin] = franja.split('|');
                return (
                  <tr key={franja}>
                    <th style={estiloCelda}>
                      {inicio.slice(0, 5)} - {fin.slice(0, 5)}
                    </th>

                    {DIAS.map(dia => {
                      const coincidencias = bloques.filter(b =>
                        b.diaSemana === dia.id &&
                        b.horaInicio === inicio &&
                        b.horaFin === fin
                      );

                      return (
                        <td key={dia.id} style={estiloCelda}>
                          {coincidencias.map(b => (
                            <div key={b.id ?? b.bloqueHorarioId}>
                              <strong>{b.cursoNombre}</strong>
                              <div>{b.docenteNombre}</div>
                              <div>{b.aulaNombre}</div>
                              {rol === DOCENTE && (
                                <div>{b.seccionNombre}</div>
                              )}
                            </div>
                          ))}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
