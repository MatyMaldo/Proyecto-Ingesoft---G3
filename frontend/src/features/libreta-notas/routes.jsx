import { lazy } from 'react';

import { ROLES } from '../../shared/auth/roles.js';

// Carga diferida: el código de cada página se descarga al entrar a su ruta, no con el inicio de sesión.
const PaginaLibretasEstudiante = lazy(() => import('./pages/PaginaLibretasEstudiante.jsx'));

export default [
  {
    path: '/libreta-notas',
    element: <PaginaLibretasEstudiante />,
    enLayout: true,
    rolesPermitidos: [ROLES.ESTUDIANTE, ROLES.APODERADO]
  }
];
