import { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation, matchRoutes } from 'react-router-dom';

import BarraLateral from './BarraLateral.jsx';
import BarraSuperior from './BarraSuperior.jsx';
import MigaDePan from './MigaDePan.jsx';
import LimiteErrores from '../../shared/components/LimiteErrores.jsx';
import estilosUtil from '../../shared/styles/utilidades.module.css';
import estilos from './LayoutPrincipal.module.css';

const CONSULTA_MEDIA_CAJON = '(max-width: 1023px)';

/**
 * Layout compartido de toda la aplicación autenticada: barra lateral, barra
 * superior, migas de pan y el contenido de la ruta activa.
 *
 * @param {Object} props
 * @param {Array<{ path: string, titulo: string, migas: Array<{ etiqueta: string, ruta?: string }> }>} props.metadatosRutas
 */
export default function LayoutPrincipal({ metadatosRutas }) {
  const location = useLocation();
  const [cajonAbierto, establecerCajonAbierto] = useState(false);
  const [modoCajon, establecerModoCajon] = useState(
    () => window.matchMedia(CONSULTA_MEDIA_CAJON).matches
  );
  const refBotonMenu = useRef(null);
  const refMain = useRef(null);
  const refPathnameAnterior = useRef(location.pathname);

  useEffect(() => {
    const listaMedia = window.matchMedia(CONSULTA_MEDIA_CAJON);

    const manejarCambio = (evento) => {
      establecerModoCajon(evento.matches);
      if (!evento.matches) {
        establecerCajonAbierto(false);
      }
    };

    listaMedia.addEventListener('change', manejarCambio);
    return () => listaMedia.removeEventListener('change', manejarCambio);
  }, []);

  const coincidencias = matchRoutes(metadatosRutas, location) ?? [];
  const rutaActual = coincidencias[coincidencias.length - 1]?.route;
  const titulo = rutaActual?.titulo ?? '';
  const migas = [{ etiqueta: 'Inicio', ruta: '/' }, ...(rutaActual?.migas ?? [])];

  useEffect(() => {
    document.title = titulo ? `${titulo} · Colegio San Marcos` : 'Colegio San Marcos';
  }, [titulo]);

  useEffect(() => {
    if (refPathnameAnterior.current === location.pathname) {
      return;
    }
    refPathnameAnterior.current = location.pathname;

    establecerCajonAbierto(false);
    refMain.current?.scrollTo(0, 0);
    refMain.current?.focus();
  }, [location.pathname]);

  const alAlternarCajon = () => establecerCajonAbierto((anterior) => !anterior);

  const manejarCerrarCajon = () => {
    establecerCajonAbierto(false);
    refBotonMenu.current?.focus();
  };

  return (
    <div className={estilos.layout}>
      <a href="#contenido-principal" className={estilosUtil.enlaceSalto}>
        Saltar al contenido principal
      </a>

      <BarraLateral modoCajon={modoCajon} abierto={cajonAbierto} alCerrar={manejarCerrarCajon} />

      {modoCajon && cajonAbierto && (
        <div className={estilos.velo} onClick={manejarCerrarCajon} aria-hidden="true" />
      )}

      <div className={estilos.columnaPrincipal}>
        <BarraSuperior
          cajonAbierto={cajonAbierto}
          alAlternarCajon={alAlternarCajon}
          refBotonMenu={refBotonMenu}
        />

        <main id="contenido-principal" ref={refMain} tabIndex={-1} className={estilos.main}>
          <MigaDePan migas={migas} />
          <LimiteErrores clave={location.pathname}>
            <Outlet />
          </LimiteErrores>
        </main>
      </div>

      <span id="aviso-no-disponible" className={estilosUtil.ocultoVisualmente}>
        Función no disponible por ahora.
      </span>
    </div>
  );
}
