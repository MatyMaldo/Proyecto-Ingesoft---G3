import { Routes, Route, Link } from 'react-router-dom';

import PaginaAsistencia from '../../pages/Asistencia/PaginaAsistencia.jsx';
import RutaProtegida from '../../shared/auth/RutaProtegida.jsx';
import LimiteErrores from '../../shared/components/LimiteErrores.jsx';
import ModuloEnConstruccion from '../../shared/components/ModuloEnConstruccion.jsx';
import Icono from '../../shared/components/Icono.jsx';
import estilosAviso from '../../shared/components/AvisoPagina.module.css';
import LayoutPrincipal from '../layout/LayoutPrincipal.jsx';
import { obtenerItemsNavegacion } from '../navegacion/navegacion.config.js';

const RUTA_ASISTENCIA = '/asistencia';
const RUTAS_RESERVADAS = new Set(['/', RUTA_ASISTENCIA]);

/**
 * Quita la barra final (`'/usuarios/'` ≡ `'/usuarios'`) y normaliza la raíz (`''` → `'/'`).
 *
 * @param {string} ruta
 * @returns {string}
 */
function normalizarRuta(ruta) {
  if (!ruta || ruta === '/') {
    return '/';
  }
  return ruta.endsWith('/') ? ruta.slice(0, -1) : ruta;
}

const itemsNavegacion = obtenerItemsNavegacion();
const itemPorRuta = new Map(itemsNavegacion.map((item) => [normalizarRuta(item.ruta), item]));

/**
 * Autodescubre `src/features/<modulo>/routes.jsx` (un solo nivel). Cada módulo debe
 * exportar por defecto un arreglo de definiciones de ruta (ver `docs/planes/shell.md` §4.2).
 */
const modulosFeatures = import.meta.glob('../../features/*/routes.jsx', { eager: true });

function recolectarRutasFeatures() {
  const rutas = [];
  const rutasVistas = new Set();

  for (const [archivo, modulo] of Object.entries(modulosFeatures)) {
    const definiciones = modulo?.default;

    if (!Array.isArray(definiciones)) {
      if (import.meta.env.DEV) {
        console.error(`${archivo}: debe exportar por defecto un arreglo de rutas.`);
      }
      continue;
    }

    for (const definicion of definiciones) {
      if (!definicion?.path || !definicion?.element) {
        if (import.meta.env.DEV) {
          console.error(`${archivo}: una entrada de ruta no tiene "path" o "element".`, definicion);
        }
        continue;
      }

      const path = normalizarRuta(definicion.path);

      if (RUTAS_RESERVADAS.has(path)) {
        if (import.meta.env.DEV) {
          console.error(`${archivo}: la ruta "${definicion.path}" está reservada y se ignora.`);
        }
        continue;
      }

      if (rutasVistas.has(path)) {
        if (import.meta.env.DEV) {
          console.error(`${archivo}: la ruta "${definicion.path}" ya está registrada; se ignora el duplicado.`);
        }
        continue;
      }

      rutasVistas.add(path);
      rutas.push({ ...definicion, path });
    }
  }

  return rutas;
}

/**
 * Completa `titulo` y `migas` de una ruta de feature según el ítem de navegación
 * con la misma ruta (§4.2).
 */
function completarMetadatos(ruta) {
  const item = itemPorRuta.get(ruta.path);
  const titulo = ruta.titulo ?? item?.etiqueta ?? ruta.path;
  const migas =
    ruta.migas ??
    (item ? [{ etiqueta: item.seccion.titulo }, { etiqueta: item.etiqueta }] : [{ etiqueta: titulo }]);

  return { ...ruta, titulo, migas };
}

/**
 * Genera un placeholder "Módulo en construcción" para cada ítem de navegación
 * cuya ruta no registró ninguna feature.
 */
function generarRutasFaltantes(rutasRegistradas) {
  return itemsNavegacion
    .filter((item) => !rutasRegistradas.has(normalizarRuta(item.ruta)))
    .map((item) => ({
      path: normalizarRuta(item.ruta),
      element: <ModuloEnConstruccion nombre={item.etiqueta} />,
      enLayout: true,
      rolesPermitidos: item.roles,
      titulo: item.etiqueta,
      migas: [{ etiqueta: item.seccion.titulo }, { etiqueta: item.etiqueta }]
    }));
}

const rutasFeatures = recolectarRutasFeatures().map(completarMetadatos);
const rutasFeaturesConLayout = rutasFeatures.filter((ruta) => ruta.enLayout !== false);
const rutasFeaturesSinLayout = rutasFeatures.filter((ruta) => ruta.enLayout === false);

const rutasRegistradas = new Set(rutasFeaturesConLayout.map((ruta) => ruta.path));
const rutasPlaceholder = generarRutasFaltantes(rutasRegistradas);

const rutasDeLayout = [...rutasFeaturesConLayout, ...rutasPlaceholder];

const METADATOS_RUTAS = [
  { path: '/', titulo: 'Inicio', migas: [] },
  ...rutasDeLayout.map((ruta) => ({ path: ruta.path, titulo: ruta.titulo, migas: ruta.migas })),
  { path: '*', titulo: 'Página no encontrada', migas: [{ etiqueta: 'Página no encontrada' }] }
];

/**
 * Página 404: ninguna ruta coincidió. Vive dentro del layout.
 */
function PaginaNoEncontrada() {
  return (
    <section className={estilosAviso.contenedor}>
      <div className={estilosAviso.tarjeta}>
        <Icono nombre="archivo-desconocido" tamano={40} className={estilosAviso.icono} />
        <h1 className={estilosAviso.titulo}>Página no encontrada</h1>
        <p className={estilosAviso.texto}>La dirección indicada no existe.</p>
        <Link to="/" className={estilosAviso.enlace}>
          Ir al inicio
        </Link>
      </div>
    </section>
  );
}

/**
 * Árbol de rutas de toda la aplicación. Ver `docs/planes/shell.md` §4.3.
 */
export default function RutasAplicacion() {
  return (
    <Routes>
      {/* TODO(pregunta): /asistencia queda fuera de RutaProtegida y del layout por decisión
          del usuario (página preexistente de un compañero); confirmar si se protegerá más
          adelante (docs/planes/shell.md §18, Duda 12). */}
      <Route
        path={RUTA_ASISTENCIA}
        element={
          <LimiteErrores clave={RUTA_ASISTENCIA}>
            <PaginaAsistencia />
          </LimiteErrores>
        }
      />

      {rutasFeaturesSinLayout.map((ruta) => (
        <Route
          key={ruta.path}
          path={ruta.path}
          element={
            <RutaProtegida rolesPermitidos={ruta.rolesPermitidos}>
              <LimiteErrores clave={ruta.path}>{ruta.element}</LimiteErrores>
            </RutaProtegida>
          }
        />
      ))}

      <Route
        element={
          <RutaProtegida>
            <LayoutPrincipal metadatosRutas={METADATOS_RUTAS} />
          </RutaProtegida>
        }
      >
        <Route index element={<ModuloEnConstruccion nombre="Inicio" />} />
        {rutasDeLayout.map((ruta) => (
          <Route
            key={ruta.path}
            path={ruta.path}
            element={
              <RutaProtegida rolesPermitidos={ruta.rolesPermitidos}>{ruta.element}</RutaProtegida>
            }
          />
        ))}
        <Route path="*" element={<PaginaNoEncontrada />} />
      </Route>
    </Routes>
  );
}
