import { useId, useMemo, useState } from 'react';
import Icono from '../../../shared/components/Icono.jsx';
import estilos from './CampoApoderado.module.css';

const MAXIMO_SUGERENCIAS = 8;

function normalizarTexto(texto) {
  return String(texto ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function nombreCompleto(apoderado) {
  return [
    apoderado.nombre,
    apoderado.apellidoPaterno,
    apoderado.apellidoMaterno,
    apoderado.apellido
  ].filter(Boolean).join(' ');
}

/**
 * Búsqueda del apoderado de un estudiante por nombre, apellido o DNI. Muestra
 * coincidencias mientras se escribe y el apoderado elegido con un botón para
 * quitarlo. La búsqueda exacta de respaldo y qué apoderados son válidos los
 * decide quien lo usa.
 *
 * @param {Object} props
 * @param {string} props.valor Texto escrito: nombre, apellido o DNI.
 * @param {(valor: string) => void} props.alCambiar
 * @param {() => void} props.alBuscar Búsqueda exacta de respaldo (por DNI).
 * @param {(apoderado: Object) => void} [props.alSeleccionar] Elige una coincidencia.
 * @param {() => void} props.alQuitar Se llama con el botón "Quitar apoderado seleccionado".
 * @param {{ nombre: string, apellido?: string, dni: string }|null} props.apoderado Apoderado ya seleccionado.
 * @param {Array} [props.candidatos] Apoderados entre los que buscar.
 * @param {string} [props.error] Error de la búsqueda o de la validación.
 * @param {boolean} [props.autoEnfocar]
 */
export default function CampoApoderado({
  valor,
  alCambiar,
  alBuscar,
  alSeleccionar,
  alQuitar,
  apoderado,
  candidatos = [],
  error = '',
  autoEnfocar = false
}) {
  const id = useId();
  const idError = `${id}-error`;
  const idLista = `${id}-lista`;
  const [abierto, establecerAbierto] = useState(false);
  const [activo, establecerActivo] = useState(0);

  const termino = normalizarTexto(valor);
  const coincidencias = useMemo(() => {
    if (termino.length < 2) return [];
    return candidatos
      .filter((candidato) => normalizarTexto([
        candidato.nombre,
        candidato.apellido,
        candidato.apellidoPaterno,
        candidato.apellidoMaterno,
        candidato.dni,
        candidato.correo
      ].filter(Boolean).join(' ')).includes(termino))
      .slice(0, MAXIMO_SUGERENCIAS);
  }, [candidatos, termino]);

  const mostrarLista = abierto && !apoderado && coincidencias.length > 0;
  const mostrarSinResultados = abierto
    && !apoderado
    && termino.length >= 2
    && coincidencias.length === 0;

  const seleccionar = (candidato) => {
    if (!candidato) return;
    alSeleccionar?.(candidato);
    establecerAbierto(false);
    establecerActivo(0);
  };

  const manejarBusqueda = () => {
    if (coincidencias.length > 0) {
      seleccionar(coincidencias[activo] ?? coincidencias[0]);
      return;
    }
    alBuscar();
  };

  const manejarTecla = (evento) => {
    if (evento.key === 'ArrowDown' || evento.key === 'ArrowUp') {
      if (coincidencias.length === 0) return;
      evento.preventDefault();
      establecerAbierto(true);
      establecerActivo((actual) => {
        const paso = evento.key === 'ArrowDown' ? 1 : -1;
        return (actual + paso + coincidencias.length) % coincidencias.length;
      });
      return;
    }
    if (evento.key === 'Escape') {
      establecerAbierto(false);
      return;
    }
    // Enter elige la coincidencia activa; sin coincidencias, usa la búsqueda exacta de respaldo.
    if (evento.key === 'Enter') {
      evento.preventDefault();
      manejarBusqueda();
    }
  };

  return (
    <div className={estilos.campo}>
      <label htmlFor={id} className={estilos.etiqueta}>
        Buscar apoderado<span className={estilos.asterisco} aria-hidden="true"> *</span>
      </label>
      <div className={estilos.fila}>
        <div className={estilos.contenedorEntrada}>
          <input
            id={id}
            className={estilos.entrada}
            value={valor}
            onChange={(evento) => {
              alCambiar(evento.target.value);
              establecerAbierto(true);
              establecerActivo(0);
            }}
            onFocus={() => establecerAbierto(true)}
            onBlur={() => establecerAbierto(false)}
            onKeyDown={manejarTecla}
            placeholder="Nombre, apellido o DNI"
            autoComplete="off"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={mostrarLista || mostrarSinResultados}
            aria-controls={mostrarLista ? idLista : undefined}
            aria-activedescendant={
              mostrarLista ? `${id}-opcion-${coincidencias[activo]?.id ?? 0}` : undefined
            }
            required
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? idError : undefined}
            data-enfoque-inicial={autoEnfocar ? '' : undefined}
          />

          {mostrarLista && (
            <ul id={idLista} className={estilos.sugerencias} role="listbox" aria-label="Apoderados encontrados">
              {coincidencias.map((candidato, indice) => (
                <li
                  key={candidato.id}
                  id={`${id}-opcion-${candidato.id}`}
                  role="option"
                  aria-selected={indice === activo}
                  className={`${estilos.sugerencia} ${indice === activo ? estilos.sugerenciaActiva : ''}`}
                  onMouseDown={(evento) => evento.preventDefault()}
                  onMouseEnter={() => establecerActivo(indice)}
                  onClick={() => seleccionar(candidato)}
                >
                  <span className={estilos.sugerenciaNombre}>{nombreCompleto(candidato)}</span>
                  <span className={estilos.sugerenciaDocumento}>DNI: {candidato.dni}</span>
                </li>
              ))}
            </ul>
          )}

          {mostrarSinResultados && (
            <p className={estilos.sinResultados} role="status">
              No se encontraron apoderados con ese nombre o DNI.
            </p>
          )}
        </div>

        <button type="button" className={estilos.botonBuscar} onClick={manejarBusqueda}>
          <Icono nombre="buscar" tamano={16} />
          Buscar
        </button>
      </div>

      {!error && !apoderado && (
        <p className={estilos.ayuda}>
          Escribe parte del nombre o del DNI y elige una coincidencia.
        </p>
      )}

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
