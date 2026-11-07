import { useRef } from 'react';

import Icono from './Icono.jsx';
import estilos from './ControlSegmentado.module.css';

/**
 * Control segmentado de selección única para pocas opciones (2 a 4) que conviene ver todas a la vez, p. ej.
 * "Ver por sección / Ver por docente". Es un grupo de opciones (`radiogroup`) navegable con las flechas.
 *
 * @param {Object} props
 * @param {string} props.id Identificador; la etiqueta visible se enlaza con él.
 * @param {string} props.etiqueta Texto de la etiqueta que va encima del control.
 * @param {string} props.valor Valor seleccionado.
 * @param {Array<{ valor: string, etiqueta: string }>} props.opciones
 * @param {(valor: string) => void} props.alCambiar Recibe el valor elegido.
 */
export default function ControlSegmentado({ id, etiqueta, valor, opciones, alCambiar }) {
  const refGrupo = useRef(null);

  const moverSeleccion = (evento, indiceActual) => {
    const pasos = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    const paso = pasos[evento.key];
    if (!paso) return;
    evento.preventDefault();
    const siguiente = (indiceActual + paso + opciones.length) % opciones.length;
    alCambiar(opciones[siguiente].valor);
    refGrupo.current?.querySelectorAll('[role="radio"]')[siguiente]?.focus();
  };

  return (
    <div className={estilos.campo}>
      <span id={`${id}-etiqueta`} className={estilos.etiqueta}>{etiqueta}</span>
      <div
        ref={refGrupo}
        id={id}
        className={estilos.grupo}
        role="radiogroup"
        aria-labelledby={`${id}-etiqueta`}
      >
        {opciones.map((opcion, indice) => {
          const activa = opcion.valor === valor;
          return (
            <button
              key={opcion.valor}
              type="button"
              role="radio"
              aria-checked={activa}
              tabIndex={activa ? 0 : -1}
              className={estilos.opcion}
              onClick={() => alCambiar(opcion.valor)}
              onKeyDown={(evento) => moverSeleccion(evento, indice)}
            >
              {activa && <Icono nombre="verificar" tamano={16} />}
              {opcion.etiqueta}
            </button>
          );
        })}
      </div>
    </div>
  );
}
