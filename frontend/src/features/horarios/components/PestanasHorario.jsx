import { useRef } from 'react';

import estilos from './PestanasHorario.module.css';

/**
 * Pestañas que alternan el contenido principal de Horarios (patrón «tabs» de WAI-ARIA con activación automática:
 * flechas izquierda/derecha, Inicio y Fin mueven y activan). El panel de cada pestaña lo pinta quien las usa,
 * identificado con `id="panel-<id>"` y `aria-labelledby="pestana-<id>"`.
 *
 * @param {Object} props
 * @param {string} props.etiqueta Nombre accesible de la lista de pestañas.
 * @param {string} props.valor `id` de la pestaña activa.
 * @param {Array<{ id: string, etiqueta: string, aviso?: string }>} props.opciones `aviso`, si se indica, pone un
 *   punto ámbar en la pestaña y lo agrega a su nombre accesible (p. ej. «cambios sin guardar»).
 * @param {(id: string) => void} props.alCambiar
 */
export default function PestanasHorario({ etiqueta, valor, opciones, alCambiar }) {
  const refs = useRef({});

  function alTecla(evento, indice) {
    const total = opciones.length;
    let destino = null;
    if (evento.key === 'ArrowRight') destino = (indice + 1) % total;
    else if (evento.key === 'ArrowLeft') destino = (indice - 1 + total) % total;
    else if (evento.key === 'Home') destino = 0;
    else if (evento.key === 'End') destino = total - 1;
    if (destino === null) return;

    evento.preventDefault();
    const opcion = opciones[destino];
    alCambiar(opcion.id);
    refs.current[opcion.id]?.focus();
  }

  return (
    <div className={estilos.lista} role="tablist" aria-label={etiqueta}>
      {opciones.map((opcion, indice) => {
        const activa = opcion.id === valor;
        return (
          <button
            key={opcion.id}
            ref={(elemento) => {
              refs.current[opcion.id] = elemento;
            }}
            type="button"
            role="tab"
            id={`pestana-${opcion.id}`}
            aria-selected={activa}
            aria-controls={`panel-${opcion.id}`}
            tabIndex={activa ? 0 : -1}
            className={activa ? `${estilos.pestana} ${estilos.activa}` : estilos.pestana}
            onClick={() => alCambiar(opcion.id)}
            onKeyDown={(evento) => alTecla(evento, indice)}
          >
            {opcion.etiqueta}
            {opcion.aviso && (
              <>
                <span className={estilos.punto} aria-hidden="true" />
                <span className={estilos.soloLectores}>({opcion.aviso})</span>
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}
