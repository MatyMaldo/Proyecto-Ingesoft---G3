import { useId } from 'react';
import Icono from '../../../shared/components/Icono.jsx';
import estilos from './CampoApoderado.module.css';

/**
 * Búsqueda del apoderado de un estudiante por su DNI o carné de extranjería. Muestra el apoderado encontrado
 * con un botón para quitarlo. La búsqueda en sí (y qué apoderados son válidos) la decide quien lo usa.
 *
 * @param {Object} props
 * @param {string} props.valor Texto del documento escrito.
 * @param {(valor: string) => void} props.alCambiar
 * @param {() => void} props.alBuscar Se llama con el botón "Buscar" y con Enter en el campo.
 * @param {() => void} props.alQuitar Se llama con el botón "Quitar apoderado seleccionado".
 * @param {{ nombre: string, apellido?: string, dni: string }|null} props.apoderado Apoderado ya seleccionado.
 * @param {string} [props.error] Error de la búsqueda o de la validación.
 * @param {boolean} [props.autoEnfocar]
 */
export default function CampoApoderado({ valor, alCambiar, alBuscar, alQuitar, apoderado, error = '', autoEnfocar = false }) {
  const id = useId();
  const idError = `${id}-error`;

  return (
    <div className={estilos.campo}>
      <label htmlFor={id} className={estilos.etiqueta}>
        DNI del apoderado<span className={estilos.asterisco} aria-hidden="true"> *</span>
      </label>
      <div className={estilos.fila}>
        <input
          id={id}
          className={estilos.entrada}
          value={valor}
          onChange={(evento) => alCambiar(evento.target.value)}
          onKeyDown={(evento) => {
            // Enter busca; sin esto enviaría el formulario completo.
            if (evento.key === 'Enter') {
              evento.preventDefault();
              alBuscar();
            }
          }}
          placeholder="Ingrese DNI o Carné de Extranjería..."
          required
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? idError : undefined}
          data-enfoque-inicial={autoEnfocar ? '' : undefined}
        />
        <button type="button" className={estilos.botonBuscar} onClick={alBuscar}>
          <Icono nombre="buscar" tamano={16} />
          Buscar
        </button>
      </div>
      {error && (
        <p id={idError} className={estilos.error}>
          <Icono nombre="alerta" tamano={14} />
          <span>{error}</span>
        </p>
      )}
      {apoderado && (
        <div className={estilos.seleccionado}>
          <div>
            <p className={estilos.rotulo}>Apoderado seleccionado</p>
            <p className={estilos.nombre}>{apoderado.nombre} {apoderado.apellido}</p>
            <p className={estilos.documento}>DNI: {apoderado.dni}</p>
          </div>
          <button type="button" className={estilos.botonQuitar} aria-label="Quitar apoderado seleccionado" onClick={alQuitar}>
            <Icono nombre="cerrar" tamano={16} />
          </button>
        </div>
      )}
    </div>
  );
}
