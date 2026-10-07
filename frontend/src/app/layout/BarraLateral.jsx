import { useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';

import Icono from '../../shared/components/Icono.jsx';
import useAuth from '../../shared/auth/useAuth.js';
import { SECCIONES_NAVEGACION } from '../navegacion/navegacion.config.js';
import estilos from './BarraLateral.module.css';

const SELECTOR_ENFOCABLES =
  'a[href], button:not([tabindex="-1"]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

function obtenerElementosEnfocables(contenedor) {
  return Array.from(contenedor.querySelectorAll(SELECTOR_ENFOCABLES)).filter(
    (elemento) => !elemento.hasAttribute('disabled')
  );
}

/**
 * Barra lateral de navegación: fija en escritorio, cajón modal en < 1024 px.
 *
 * @param {Object} props
 * @param {boolean} props.modoCajon `true` en < 1024 px.
 * @param {boolean} props.abierto Solo relevante en modo cajón.
 * @param {() => void} props.alCerrar Cierra el cajón (botón "Cerrar menú", Esc, velo).
 */
export default function BarraLateral({ modoCajon, abierto, alCerrar }) {
  const { usuario, tieneAcceso, cerrarSesion } = useAuth();
  const refAside = useRef(null);
  const refBotonCerrar = useRef(null);

  useEffect(() => {
    if (modoCajon && abierto) {
      refBotonCerrar.current?.focus();
    }
  }, [modoCajon, abierto]);

  const manejarTecla = (evento) => {
    if (!modoCajon || !abierto) {
      return;
    }

    if (evento.key === 'Escape') {
      evento.stopPropagation();
      alCerrar();
      return;
    }

    if (evento.key === 'Tab') {
      const enfocables = obtenerElementosEnfocables(refAside.current);
      if (enfocables.length === 0) {
        return;
      }

      const primero = enfocables[0];
      const ultimo = enfocables[enfocables.length - 1];

      if (evento.shiftKey && document.activeElement === primero) {
        evento.preventDefault();
        ultimo.focus();
      } else if (!evento.shiftKey && document.activeElement === ultimo) {
        evento.preventDefault();
        primero.focus();
      }
    }
  };

  const secciones = SECCIONES_NAVEGACION.map((seccion) => ({
    ...seccion,
    items: seccion.items.filter((item) => tieneAcceso(item.roles))
  })).filter((seccion) => seccion.items.length > 0);

  const inicial = usuario?.nombre?.charAt(0)?.toUpperCase() ?? '';

  const propsDialogo = modoCajon
    ? { role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Menú de navegación' }
    : {};

  return (
    <aside
      id="barra-lateral"
      ref={refAside}
      className={estilos.aside}
      data-abierto={modoCajon ? String(abierto) : undefined}
      onKeyDown={manejarTecla}
      {...propsDialogo}
    >
      <div className={estilos.cabecera}>
        <div className={estilos.marca}>
          <div className={estilos.logo}>
            <Icono nombre="capas" tamano={28} />
          </div>
          <div>
            <p className={estilos.nombreColegio}>Colegio San Marcos</p>
            <p className={estilos.sistemaGestion}>Sistema de Gestión</p>
          </div>
        </div>
        <button
          ref={refBotonCerrar}
          type="button"
          className={estilos.botonCerrarMenu}
          aria-label="Cerrar menú"
          onClick={alCerrar}
        >
          <Icono nombre="cerrar" tamano={20} />
        </button>
      </div>

      <nav aria-label="Navegación principal" className={estilos.navegacion}>
        {secciones.map((seccion) => (
          <div key={seccion.id} className={estilos.seccion}>
            <p id={`seccion-${seccion.id}`} className={estilos.rotuloSeccion}>
              {seccion.titulo}
            </p>
            <ul className={estilos.lista} aria-labelledby={`seccion-${seccion.id}`}>
              {seccion.items.map((item) => (
                <li key={item.id}>
                  <NavLink to={item.ruta} className={estilos.enlace}>
                    <span className={estilos.recuadroIcono}>
                      <Icono nombre={item.icono} tamano={18} />
                    </span>
                    {item.etiqueta}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className={estilos.pie}>
        <span className={estilos.avatar} aria-hidden="true">
          {inicial}
        </span>
        <div className={estilos.datosUsuario}>
          <p className={estilos.nombreUsuario}>{usuario?.nombre}</p>
          <p className={estilos.detalleUsuario} title={usuario?.etiquetaRol}>
            {usuario?.etiquetaRol}
          </p>
        </div>
        <button
          type="button"
          className={estilos.botonCerrarSesion}
          aria-label="Cerrar sesión"
          onClick={cerrarSesion}
        >
          <Icono nombre="salir" tamano={18} />
        </button>
      </div>
    </aside>
  );
}
