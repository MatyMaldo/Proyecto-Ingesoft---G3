import { lazy } from 'react';

import { ROLES } from '../../shared/auth/roles.js';

// Carga diferida: el código de cada página se descarga al entrar a su ruta, no con el inicio de sesión.
const PaginaEvaluaciones = lazy(() => import('./pages/PaginaEvaluaciones.jsx'));

export default [
  {
    path: '/evaluaciones',
    element: <PaginaEvaluaciones />,
    enLayout: true,
    rolesPermitidos: [ROLES.DOCENTE]
  }
];
