import { lazy } from 'react';

import { ROLES } from '../../shared/auth/roles.js';

// Carga diferida: el código de cada página se descarga al entrar a su ruta, no con el inicio de sesión.
const PaginaAuditorias = lazy(() => import('./pages/PaginaAuditorias.jsx'));

/**
 * Rutas de la feature Auditorías (HU-SAT-04). Contrato: docs/planes/shell.md §4.2.
 * `titulo` y `migas` no se declaran: el índice de rutas los deriva del ítem de
 * navegación "Auditorías" (sección "Administración") que comparte esta `path`.
 */
export default [
  {
    path: '/administracion/auditorias',
    element: <PaginaAuditorias />,
    enLayout: true,
    rolesPermitidos: [ROLES.ADMIN]
  }
];
