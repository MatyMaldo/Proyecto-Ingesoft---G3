import { calcularCargaDocente, formatearHoras } from '../utils/cargaDocente.js';
import estilos from './CargaDocente.module.css';

/**
 * Carga de un docente en la semana consultada, por curso y sección: lo que el administrador revisa al consultar por
 * docente. Las sesiones omitidas no suman horas.
 *
 * @param {Object} props
 * @param {Array} props.sesiones Sesiones de la semana del docente.
 */
export default function CargaDocente({ sesiones }) {
  const { filas, totalSesiones, totalMinutos, omitidas } = calcularCargaDocente(sesiones);

  return (
    <section className={estilos.carga} aria-label="Carga del docente en la semana">
      <h3 className={estilos.titulo}>Carga de la semana</h3>

      {filas.length === 0 ? (
        <p className={estilos.nota}>
          {omitidas > 0 ? 'Todas las sesiones de la semana están omitidas.' : 'No hay sesiones que dictar esta semana.'}
        </p>
      ) : (
        <div className={estilos.contenedor}>
          <table className={estilos.tabla}>
            <thead>
              <tr>
                <th scope="col">Curso</th>
                <th scope="col">Grado y sección</th>
                <th scope="col" className={estilos.numero}>Sesiones</th>
                <th scope="col" className={estilos.numero}>Horas</th>
              </tr>
            </thead>
            <tbody>
              {filas.map((fila) => (
                <tr key={fila.clave}>
                  <th scope="row">{fila.curso}</th>
                  <td>{fila.seccion}</td>
                  <td className={estilos.numero}>{fila.sesiones}</td>
                  <td className={estilos.numero}>{formatearHoras(fila.minutos)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th scope="row" colSpan={2}>Total</th>
                <td className={estilos.numero}>{totalSesiones}</td>
                <td className={estilos.numero}>{formatearHoras(totalMinutos)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {filas.length > 0 && omitidas > 0 && (
        <p className={estilos.nota}>
          {omitidas === 1 ? 'No incluye 1 sesión omitida.' : `No incluye ${omitidas} sesiones omitidas.`}
        </p>
      )}
    </section>
  );
}
