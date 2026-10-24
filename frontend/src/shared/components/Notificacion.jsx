import Icono from './Icono.jsx';
import estilos from './Notificacion.module.css';

/**
 * Mensaje flotante de éxito o error (equivale al "toast" de PaginaUsuarios).
 * No guarda estado ni se cierra solo: quien lo usa decide cuándo mostrarlo y ocultarlo.
 *
 * @param {Object} props
 * @param {string} props.mensaje Texto a mostrar.
 * @param {boolean} [props.error] `true`: estilo de error y `role="alert"`; si no, `role="status"`.
 */
export default function Notificacion({ mensaje, error = false }) {
  return (
    <div className={estilos.notificacion} role={error ? 'alert' : 'status'}>
      <Icono
        nombre={error ? 'cerrar' : 'verificar'}
        tamano={16}
        className={error ? estilos.iconoError : estilos.iconoExito}
      />
      <span>{mensaje}</span>
    </div>
  );
}
