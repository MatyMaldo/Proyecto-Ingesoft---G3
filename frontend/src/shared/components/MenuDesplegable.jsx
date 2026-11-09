import { Fragment, useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import Icono from './Icono.jsx';
import estilos from './MenuDesplegable.module.css';

const SEPARACION_BORDE_PX = 8;
const SEPARACION_BOTON_PX = 4;

/**
 * Botón que abre un menú de acciones (patrón "menu button" de WAI-ARIA).
 *
 * El menú se pinta en un portal con posición fija, así ninguna tabla con `overflow` lo recorta.
 * Se cierra con Escape, al hacer clic fuera, al desplazar la página o al elegir una opción.
 * Flechas arriba/abajo, Inicio y Fin mueven el foco entre las opciones.
 *
 * @param {Object} props
 * @param {string} props.etiquetaBoton Nombre accesible del botón (y del menú).
 * @param {import('react').ReactNode} props.contenidoBoton Contenido visible del botón (ícono y/o texto).
 * @param {string} props.claseBoton Clase del botón; el estilo del botón lo define quien lo usa.
 * @param {Array<{ id: string, etiqueta: string, ariaLabel?: string, icono?: string,
 *   tono?: 'peligro', separadorAntes?: boolean, alSeleccionar: () => void }>} props.items
 *   `separadorAntes` dibuja una línea divisoria encima de la opción, para agrupar.
 * @param {'inicio' | 'fin'} [props.alineacion] Borde del botón con el que se alinea el menú.
 * @param {boolean} [props.deshabilitado] Deshabilita el botón (el menú no se puede abrir).
 */
export default function MenuDesplegable({
  etiquetaBoton,
  contenidoBoton,
  claseBoton,
  items,
  alineacion = 'fin',
  deshabilitado = false
}) {
  const idMenu = useId();
  const botonRef = useRef(null);
  const menuRef = useRef(null);
  const [abierto, establecerAbierto] = useState(false);
  const [posicion, establecerPosicion] = useState(null);

  const cerrar = useCallback((devolverFoco) => {
    establecerAbierto(false);
    establecerPosicion(null);
    if (devolverFoco) {
      botonRef.current?.focus();
    }
  }, []);

  // Posiciona el menú junto al botón antes de pintar, y lo voltea hacia arriba si no cabe abajo.
  useLayoutEffect(() => {
    if (!abierto || !botonRef.current || !menuRef.current) {
      return;
    }

    const caja = botonRef.current.getBoundingClientRect();
    const ancho = menuRef.current.offsetWidth;
    const alto = menuRef.current.offsetHeight;

    const izquierdaIdeal = alineacion === 'fin' ? caja.right - ancho : caja.left;
    const izquierda = Math.max(
      SEPARACION_BORDE_PX,
      Math.min(izquierdaIdeal, window.innerWidth - ancho - SEPARACION_BORDE_PX)
    );

    const arribaIdeal = caja.bottom + SEPARACION_BOTON_PX;
    const cabeAbajo = arribaIdeal + alto <= window.innerHeight - SEPARACION_BORDE_PX;
    const cabeArriba = caja.top - SEPARACION_BOTON_PX - alto >= SEPARACION_BORDE_PX;
    const arriba = cabeAbajo || !cabeArriba ? arribaIdeal : caja.top - SEPARACION_BOTON_PX - alto;

    establecerPosicion({ top: arriba, left: izquierda });
  }, [abierto, alineacion]);

  // Con el menú ya posicionado, el foco pasa a la primera opción.
  useEffect(() => {
    if (posicion) {
      menuRef.current?.querySelector('[role="menuitem"]')?.focus();
    }
  }, [posicion]);

  useEffect(() => {
    if (!abierto) {
      return undefined;
    }

    const alPresionar = (evento) => {
      const dentro = menuRef.current?.contains(evento.target) || botonRef.current?.contains(evento.target);
      if (!dentro) {
        cerrar(false);
      }
    };
    const alDesplazar = (evento) => {
      if (!menuRef.current?.contains(evento.target)) {
        cerrar(false);
      }
    };
    const alRedimensionar = () => cerrar(false);

    document.addEventListener('pointerdown', alPresionar);
    window.addEventListener('scroll', alDesplazar, true);
    window.addEventListener('resize', alRedimensionar);

    return () => {
      document.removeEventListener('pointerdown', alPresionar);
      window.removeEventListener('scroll', alDesplazar, true);
      window.removeEventListener('resize', alRedimensionar);
    };
  }, [abierto, cerrar]);

  const alTeclaBoton = (evento) => {
    if (evento.key === 'ArrowDown' && !abierto) {
      evento.preventDefault();
      establecerAbierto(true);
    }
  };

  const alTeclaMenu = (evento) => {
    const opciones = [...menuRef.current.querySelectorAll('[role="menuitem"]')];
    const actual = opciones.indexOf(document.activeElement);

    const mover = (indice) => {
      evento.preventDefault();
      opciones[(indice + opciones.length) % opciones.length]?.focus();
    };

    switch (evento.key) {
      case 'ArrowDown':
        mover(actual + 1);
        break;
      case 'ArrowUp':
        mover(actual - 1);
        break;
      case 'Home':
        mover(0);
        break;
      case 'End':
        mover(opciones.length - 1);
        break;
      case 'Escape':
        evento.preventDefault();
        cerrar(true);
        break;
      case 'Tab':
        cerrar(false);
        break;
      default:
        break;
    }
  };

  const elegir = (item) => {
    cerrar(true);
    item.alSeleccionar();
  };

  return (
    <>
      <button
        ref={botonRef}
        type="button"
        className={claseBoton}
        disabled={deshabilitado}
        aria-label={etiquetaBoton}
        aria-haspopup="menu"
        aria-expanded={abierto}
        aria-controls={abierto ? idMenu : undefined}
        onClick={() => (abierto ? cerrar(false) : establecerAbierto(true))}
        onKeyDown={alTeclaBoton}
      >
        {contenidoBoton}
      </button>

      {abierto &&
        createPortal(
          <div
            ref={menuRef}
            id={idMenu}
            role="menu"
            aria-label={etiquetaBoton}
            className={estilos.menu}
            style={posicion ?? { top: 0, left: 0, visibility: 'hidden' }}
            onKeyDown={alTeclaMenu}
          >
            {items.map((item) => (
              <Fragment key={item.id}>
                {item.separadorAntes && <div role="separator" className={estilos.separador} />}
                <button
                  type="button"
                  role="menuitem"
                  tabIndex={-1}
                  aria-label={item.ariaLabel}
                  className={`${estilos.opcion} ${item.tono === 'peligro' ? estilos.opcionPeligro : ''}`}
                  onClick={() => elegir(item)}
                >
                  {item.icono && <Icono nombre={item.icono} tamano={16} />}
                  {item.etiqueta}
                </button>
              </Fragment>
            ))}
          </div>,
          document.body
        )}
    </>
  );
}
