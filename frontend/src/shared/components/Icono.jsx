// Trazos adaptados de Lucide (https://lucide.dev), licencia ISC.
// Copyright (c) 2022 Lucide Contributors. Se usan en línea, sin dependencia del paquete.

/**
 * Catálogo de íconos disponibles. Cada entrada es un arreglo de elementos SVG
 * (`tag` + `props`) con los trazos del ícono equivalente de Lucide.
 */
const CATALOGO_ICONOS = {
  capas: [
    { tag: 'path', props: { d: 'm12.83 2.18-9.17 4.2a1 1 0 0 0 0 1.83l9.17 4.2a2 2 0 0 0 1.66 0l9.17-4.2a1 1 0 0 0 0-1.83l-9.17-4.2a2 2 0 0 0-1.66 0Z' } },
    { tag: 'path', props: { d: 'M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12' } },
    { tag: 'path', props: { d: 'M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17' } }
  ],
  usuario: [
    { tag: 'path', props: { d: 'M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2' } },
    { tag: 'circle', props: { cx: 12, cy: 7, r: 4 } }
  ],
  usuarios: [
    { tag: 'path', props: { d: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' } },
    { tag: 'circle', props: { cx: 9, cy: 7, r: 4 } },
    { tag: 'path', props: { d: 'M22 21v-2a4 4 0 0 0-3-3.87' } },
    { tag: 'path', props: { d: 'M16 3.13a4 4 0 0 1 0 7.75' } }
  ],
  libro: [
    { tag: 'path', props: { d: 'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2Z' } },
    { tag: 'path', props: { d: 'M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7Z' } }
  ],
  tarjeta: [
    { tag: 'rect', props: { width: 20, height: 14, x: 2, y: 5, rx: 2 } },
    { tag: 'line', props: { x1: 2, x2: 22, y1: 10, y2: 10 } }
  ],
  reloj: [
    { tag: 'circle', props: { cx: 12, cy: 12, r: 10 } },
    { tag: 'polyline', props: { points: '12 6 12 12 16 14' } }
  ],
  archivo: [
    { tag: 'path', props: { d: 'M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z' } },
    { tag: 'path', props: { d: 'M14 2v4a2 2 0 0 0 2 2h4' } },
    { tag: 'path', props: { d: 'M10 9H8' } },
    { tag: 'path', props: { d: 'M16 13H8' } },
    { tag: 'path', props: { d: 'M16 17H8' } }
  ],
  panel: [
    { tag: 'rect', props: { width: 20, height: 16, x: 2, y: 4, rx: 2 } },
    { tag: 'path', props: { d: 'M2 8h20' } },
    { tag: 'path', props: { d: 'M6 4v4' } },
    { tag: 'path', props: { d: 'M10 4v4' } }
  ],
  buscar: [
    { tag: 'circle', props: { cx: 11, cy: 11, r: 8 } },
    { tag: 'path', props: { d: 'm21 21-4.3-4.3' } }
  ],
  campana: [
    { tag: 'path', props: { d: 'M10.268 21a2 2 0 0 0 3.464 0' } },
    { tag: 'path', props: { d: 'M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326' } }
  ],
  'chevron-abajo': [
    { tag: 'path', props: { d: 'm6 9 6 6 6-6' } }
  ],
  'chevron-derecha': [
    { tag: 'path', props: { d: 'm9 18 6-6-6-6' } }
  ],
  salir: [
    { tag: 'path', props: { d: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4' } },
    { tag: 'polyline', props: { points: '16 17 21 12 16 7' } },
    { tag: 'line', props: { x1: 21, x2: 9, y1: 12, y2: 12 } }
  ],
  menu: [
    { tag: 'line', props: { x1: 4, x2: 20, y1: 12, y2: 12 } },
    { tag: 'line', props: { x1: 4, x2: 20, y1: 6, y2: 6 } },
    { tag: 'line', props: { x1: 4, x2: 20, y1: 18, y2: 18 } }
  ],
  cerrar: [
    { tag: 'path', props: { d: 'M18 6 6 18' } },
    { tag: 'path', props: { d: 'm6 6 12 12' } }
  ],
  alerta: [
    { tag: 'path', props: { d: 'm21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z' } },
    { tag: 'path', props: { d: 'M12 9v4' } },
    { tag: 'path', props: { d: 'M12 17h.01' } }
  ],
  reintentar: [
    { tag: 'path', props: { d: 'M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8' } },
    { tag: 'path', props: { d: 'M21 3v5h-5' } }
  ],
  construccion: [
    { tag: 'rect', props: { x: 2, y: 6, width: 20, height: 8, rx: 1 } },
    { tag: 'path', props: { d: 'M17 14v7' } },
    { tag: 'path', props: { d: 'M7 14v7' } },
    { tag: 'path', props: { d: 'M17 3v3' } },
    { tag: 'path', props: { d: 'M7 3v3' } },
    { tag: 'path', props: { d: 'M10 14 2.3 6.3' } },
    { tag: 'path', props: { d: 'm14 6 7.7 7.7' } },
    { tag: 'path', props: { d: 'm8 6 8 8' } }
  ],
  candado: [
    { tag: 'rect', props: { width: 18, height: 11, x: 3, y: 11, rx: 2, ry: 2 } },
    { tag: 'path', props: { d: 'M7 11V7a5 5 0 0 1 10 0v4' } }
  ],
  'archivo-desconocido': [
    { tag: 'path', props: { d: 'M12 17h.01' } },
    { tag: 'path', props: { d: 'M9.1 9a3 3 0 0 1 5.82 1c0 2-3 3-3 3' } },
    { tag: 'path', props: { d: 'M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z' } },
    { tag: 'path', props: { d: 'M14 2v4a2 2 0 0 0 2 2h4' } }
  ],
  escudo: [
    { tag: 'path', props: { d: 'M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1Z' } }
  ],
  monitor: [
    { tag: 'rect', props: { width: 20, height: 14, x: 2, y: 3, rx: 2 } },
    { tag: 'line', props: { x1: 8, x2: 16, y1: 21, y2: 21 } },
    { tag: 'line', props: { x1: 12, x2: 12, y1: 17, y2: 21 } }
  ],
  birrete: [
    { tag: 'path', props: { d: 'M21.42 10.92a1 1 0 0 0 0-1.84L12.83 5.18a2 2 0 0 0-1.66 0L2.58 9.08a1 1 0 0 0 0 1.84l8.59 3.9a2 2 0 0 0 1.66 0Z' } },
    { tag: 'path', props: { d: 'M22 10v6' } },
    { tag: 'path', props: { d: 'M6 12.5V16c0 1.66 3 3.33 6 3.33s6-1.67 6-3.33v-3.5' } }
  ],
  ojo: [
    { tag: 'path', props: { d: 'M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0' } },
    { tag: 'circle', props: { cx: 12, cy: 12, r: 3 } }
  ],
  'ojo-tachado': [
    { tag: 'path', props: { d: 'M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49' } },
    { tag: 'path', props: { d: 'M14.084 14.158a3 3 0 0 1-4.242-4.242' } },
    { tag: 'path', props: { d: 'M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143' } },
    { tag: 'path', props: { d: 'm2 2 20 20' } }
  ],
  'flecha-derecha': [
    { tag: 'path', props: { d: 'M5 12h14' } },
    { tag: 'path', props: { d: 'm12 5 7 7-7 7' } }
  ],
  cargando: [
    { tag: 'path', props: { d: 'M21 12a9 9 0 1 1-6.219-8.56' } }
  ]
};

/**
 * Ícono SVG en línea, estilo Lucide (trazo).
 *
 * @param {Object} props
 * @param {string} props.nombre Clave del catálogo de íconos.
 * @param {number} [props.tamano] Ancho y alto en px.
 * @param {string} [props.etiqueta] Si se pasa, el ícono es informativo (`role="img"` + `aria-label`).
 *   Si no, es decorativo (`aria-hidden="true"`).
 * @param {string} [props.className] Clase extra del módulo CSS que lo usa.
 */
export default function Icono({ nombre, tamano = 20, etiqueta, className }) {
  const trazos = CATALOGO_ICONOS[nombre];

  if (!trazos) {
    if (import.meta.env.DEV) {
      console.warn(`Icono: no existe el ícono "${nombre}" en el catálogo.`);
    }
    return null;
  }

  const propsAccesibilidad = etiqueta
    ? { role: 'img', 'aria-label': etiqueta }
    : { 'aria-hidden': 'true' };

  return (
    <svg
      width={tamano}
      height={tamano}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
      className={className}
      {...propsAccesibilidad}
    >
      {trazos.map(({ tag: Etiqueta, props }, indice) => (
        <Etiqueta key={indice} {...props} />
      ))}
    </svg>
  );
}
