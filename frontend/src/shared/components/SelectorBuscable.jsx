import { useId, useRef, useState } from 'react';

import Icono from './Icono.jsx';
import estilos from './SelectorBuscable.module.css';

/** Minúsculas y sin tildes, para que «jose» encuentre «José». */
function normalizar(texto) {
  return String(texto ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

/**
 * Selector de una opción con búsqueda por texto: se escribe para filtrar la lista y se elige con el ratón o con el
 * teclado (↑ ↓ Enter, Esc). Pensado para listas largas (docentes) donde un `<select>` obliga a recorrerlas.
 *
 * @param {Object} props
 * @param {string} props.id Identificador del campo (une la etiqueta con el campo).
 * @param {string} props.etiqueta Texto de la etiqueta.
 * @param {string} props.valor Valor de la opción elegida (`''` si no hay ninguna).
 * @param {Array<{ valor: string, etiqueta: string, detalle?: string }>} props.opciones
 * @param {(valor: string) => void} props.alCambiar Recibe el valor elegido, o `''` al quitar la selección.
 * @param {string} [props.placeholder]
 * @param {string} [props.mensajeSinResultados]
 */
export default function SelectorBuscable({
  id,
  etiqueta,
  valor,
  opciones,
  alCambiar,
  placeholder = 'Buscar…',
  mensajeSinResultados = 'No se encontraron resultados.'
}) {
  const idLista = `${id}-lista`;
  const prefijoOpcion = useId();
  const contenedor = useRef(null);
  // `null`: no se está escribiendo, el campo muestra la opción elegida.
  const [texto, establecerTexto] = useState(null);
  const [abierto, establecerAbierto] = useState(false);
  const [activa, establecerActiva] = useState(0);

  const elegida = opciones.find((opcion) => opcion.valor === valor) ?? null;
  const consulta = normalizar(texto);
  const visibles = consulta
    ? opciones.filter((opcion) => normalizar(`${opcion.etiqueta} ${opcion.detalle ?? ''}`).includes(consulta))
    : opciones;
  const indiceActivo = Math.min(activa, Math.max(visibles.length - 1, 0));
  const idOpcion = (indice) => `${prefijoOpcion}-${indice}`;

  const cerrar = () => {
    establecerAbierto(false);
    establecerTexto(null);
  };

  const elegir = (opcion) => {
    alCambiar(opcion.valor);
    cerrar();
  };

  const alPresionarTecla = (evento) => {
    if (evento.key === 'ArrowDown') {
      evento.preventDefault();
      establecerAbierto(true);
      establecerActiva(Math.min(indiceActivo + 1, visibles.length - 1));
    } else if (evento.key === 'ArrowUp') {
      evento.preventDefault();
      establecerActiva(Math.max(indiceActivo - 1, 0));
    } else if (evento.key === 'Enter') {
      if (abierto && visibles[indiceActivo]) {
        evento.preventDefault();
        elegir(visibles[indiceActivo]);
      }
    } else if (evento.key === 'Escape' && abierto) {
      evento.preventDefault();
      cerrar();
    }
  };

  // El foco que pasa a la lista o al botón de quitar no cierra el campo.
  const alPerderFoco = (evento) => {
    if (!contenedor.current?.contains(evento.relatedTarget)) cerrar();
  };

  return (
    <div className={estilos.campo}>
      <label htmlFor={id} className={estilos.etiqueta}>{etiqueta}</label>
      <div className={estilos.contenedor} ref={contenedor} onBlur={alPerderFoco}>
        <input
          id={id}
          type="text"
          role="combobox"
          className={estilos.entrada}
          value={texto ?? elegida?.etiqueta ?? ''}
          placeholder={placeholder}
          autoComplete="off"
          aria-expanded={abierto}
          aria-controls={idLista}
          aria-autocomplete="list"
          aria-activedescendant={abierto && visibles.length > 0 ? idOpcion(indiceActivo) : undefined}
          onClick={() => establecerAbierto(true)}
          onFocus={(evento) => {
            establecerAbierto(true);
            evento.target.select();
          }}
          onChange={(evento) => {
            establecerTexto(evento.target.value);
            establecerAbierto(true);
            establecerActiva(0);
          }}
          onKeyDown={alPresionarTecla}
        />
        {elegida && (
          <button
            type="button"
            className={estilos.quitar}
            aria-label={`Quitar selección de ${etiqueta}`}
            onClick={() => {
              alCambiar('');
              cerrar();
            }}
          >
            <Icono nombre="cerrar" tamano={16} />
          </button>
        )}

        {abierto && (
          <ul id={idLista} role="listbox" aria-label={etiqueta} className={estilos.lista}>
            {visibles.length === 0 ? (
              <li className={estilos.sinResultados} role="presentation">{mensajeSinResultados}</li>
            ) : visibles.map((opcion, indice) => (
              <li
                key={opcion.valor}
                id={idOpcion(indice)}
                role="option"
                aria-selected={opcion.valor === valor}
                className={[
                  estilos.opcion,
                  indice === indiceActivo ? estilos.opcionActiva : '',
                  opcion.valor === valor ? estilos.opcionElegida : ''
                ].filter(Boolean).join(' ')}
                // `mousedown` y no `click`: así el campo no pierde el foco (y se cierra) antes de elegir.
                onMouseDown={(evento) => {
                  evento.preventDefault();
                  elegir(opcion);
                }}
                onMouseEnter={() => establecerActiva(indice)}
              >
                <span>{opcion.etiqueta}</span>
                {opcion.detalle && <span className={estilos.detalle}>{opcion.detalle}</span>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
