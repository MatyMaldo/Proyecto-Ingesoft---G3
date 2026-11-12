import { useRef } from 'react';

import estilos from './PestanasCurso.module.css';

/**
 * Lista de pestañas con el patrón ARIA de "tabs": flechas, Inicio y Fin cambian de pestaña y solo la activa entra en
 * el orden de tabulación. El panel lo pinta quien la usa, con `role="tabpanel"`, `id={`${idBase}-panel`}` y
 * `aria-labelledby={`${idBase}-${activa}`}`.
 *
 * @param {Object} props
 * @param {string} props.idBase Prefijo de los ids (une cada pestaña con su panel).
 * @param {string} props.etiqueta Nombre accesible de la lista.
 * @param {Array<{ id: string, etiqueta: string, insignia?: string }>} props.pestanas
 * @param {string} props.activa Id de la pestaña activa.
 * @param {(id: string) => void} props.alCambiar
 */
export default function PestanasCurso({ idBase, etiqueta, pestanas, activa, alCambiar }) {
  const botones = useRef({});

  function seleccionar(id) {
    alCambiar(id);
    botones.current[id]?.focus();
  }

  function alPulsarTecla(evento, indice) {
    const ultimo = pestanas.length - 1;
    const destinos = {
      ArrowRight: indice === ultimo ? 0 : indice + 1,
      ArrowLeft: indice === 0 ? ultimo : indice - 1,
      Home: 0,
      End: ultimo
    };
    if (destinos[evento.key] === undefined) {
      return;
    }
    evento.preventDefault();
    seleccionar(pestanas[destinos[evento.key]].id);
  }

  return (
    <div className={estilos.lista} role="tablist" aria-label={etiqueta}>
      {pestanas.map((pestana, indice) => {
        const esActiva = pestana.id === activa;
        return (
          <button
            key={pestana.id}
            ref={(elemento) => { botones.current[pestana.id] = elemento; }}
            type="button"
            role="tab"
            id={`${idBase}-${pestana.id}`}
            aria-selected={esActiva}
            aria-controls={`${idBase}-panel`}
            tabIndex={esActiva ? 0 : -1}
            className={esActiva ? `${estilos.pestana} ${estilos.activa}` : estilos.pestana}
            onClick={() => alCambiar(pestana.id)}
            onKeyDown={(evento) => alPulsarTecla(evento, indice)}
          >
            {pestana.etiqueta}
            {pestana.insignia && <span className={estilos.insignia}>{pestana.insignia}</span>}
          </button>
        );
      })}
    </div>
  );
}
