import Icono from '../../../shared/components/Icono.jsx';
import Insignia from '../../../shared/components/Insignia.jsx';
import { formatearFechaVisible } from '../../../shared/utils/formatoFecha.js';
import estilos from './TablaMatriculas.module.css';

const TONO_ESTADO = {
  PENDIENTE: 'ambar',
  CONFIRMADA: 'verde',
  CANCELADA: 'rojo'
};

const ETIQUETA_ESTADO = {
  PENDIENTE: 'Pendiente',
  CONFIRMADA: 'Confirmada',
  CANCELADA: 'Cancelada'
};

/**
 * Tabla de matrículas para la vista administrativa. Cada fila expone el ID de
 * matrícula y permite emitir su compromiso sin tener que buscarla por alumno.
 */
export default function TablaMatriculas({ matriculas, alEmitir, emitiendoId }) {
  return (
    <div className={estilos.contenedor}>
      <table className={estilos.tabla}>
        <caption className={estilos.caption}>
          Listado de matrículas registradas
        </caption>
        <thead>
          <tr>
            <th scope="col">Matrícula</th>
            <th scope="col">Fecha</th>
            <th scope="col">Estudiante</th>
            <th scope="col">Grado</th>
            <th scope="col">Sección</th>
            <th scope="col">Año</th>
            <th scope="col">Estado</th>
            <th scope="col" className={estilos.columnaAccion}>Acción</th>
          </tr>
        </thead>
        <tbody>
          {matriculas.map((matricula) => {
            const estado = String(matricula.estado ?? '').toUpperCase();
            const emitiendo = String(emitiendoId) === String(matricula.id);
            return (
              <tr key={matricula.id}>
                <td className={estilos.celdaId}>#{matricula.id}</td>
                <td className={estilos.celdaFecha}>
                  {formatearFechaVisible(matricula.fechaAsignacion)}
                </td>
                <td>
                  <span className={estilos.nombreEstudiante}>
                    {matricula.nombreCompletoEstudiante ?? 'Estudiante'}
                  </span>
                  {matricula.codigoEstudiante && (
                    <span className={estilos.codigoEstudiante}>{matricula.codigoEstudiante}</span>
                  )}
                </td>
                <td>{matricula.gradoNombre ?? '—'}</td>
                <td>{matricula.seccionNombre ?? '—'}</td>
                <td>{matricula.anioAcademico ?? '—'}</td>
                <td>
                  <Insignia tono={TONO_ESTADO[estado] ?? 'gris'}>
                    {ETIQUETA_ESTADO[estado] ?? estado}
                  </Insignia>
                </td>
                <td className={estilos.columnaAccion}>
                  {estado === 'PENDIENTE' ? (
                    <button
                      type="button"
                      className={estilos.botonEmitir}
                      disabled={emitiendo}
                      onClick={() => alEmitir(matricula)}
                    >
                      <Icono nombre="archivo" tamano={16} />
                      {emitiendo ? 'Emitiendo…' : 'Emitir compromiso'}
                    </button>
                  ) : (
                    <span className={estilos.sinAccion}>—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
