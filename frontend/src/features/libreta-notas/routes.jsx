import { lazy } from 'react';

import { ROLES } from '../../shared/auth/roles.js';

// Carga diferida: el código de cada página se descarga al entrar a su ruta, no con el inicio de sesión.
const PaginaLibretas = lazy(() => import('./pages/PaginaLibretas.jsx'));

export default [
  {
    path: '/libreta-notas',
    element: <PaginaLibretas />,
    enLayout: true,
    rolesPermitidos: [ROLES.DOCENTE, ROLES.ESTUDIANTE, ROLES.APODERADO]
  }
];
