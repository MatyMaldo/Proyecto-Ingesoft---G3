import { lazy } from 'react';

import { ROLES } from '../../shared/auth/roles.js';

// Carga diferida: el código de cada página se descarga al entrar a su ruta, no con el inicio de sesión.
const PaginaMatriculas = lazy(() => import('./pages/PaginaMatriculas.jsx'));

export default [
  {
    path: '/matriculas',
    element: <PaginaMatriculas />,
    enLayout: true,
    rolesPermitidos: [ROLES.ADMIN],
    migas: [{ etiqueta: 'Administración' }, { etiqueta: 'Matrículas' }]
  }
];
