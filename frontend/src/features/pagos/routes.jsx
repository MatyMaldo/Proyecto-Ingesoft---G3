import { lazy } from 'react';

import { ROLES } from '../../shared/auth/roles.js';

// Carga diferida: el código de cada página se descarga al entrar a su ruta, no con el inicio de sesión.
const PaginaPagos = lazy(() => import('./pages/PaginaPagos.jsx'));
const PaginaPagosApoderado = lazy(() => import('./pages/PaginaPagosApoderado.jsx'));

export default [
  {
    path: '/pagos',
    element: <PaginaPagos />,
    enLayout: true,
    rolesPermitidos: [ROLES.ADMIN],
    migas: [{ etiqueta: 'Administración' }, { etiqueta: 'Pagos' }]
  },
  {
    path: '/mis-pagos',
    element: <PaginaPagosApoderado />,
    enLayout: true,
    rolesPermitidos: [ROLES.APODERADO],
    migas: [{ etiqueta: 'Gestión' }, { etiqueta: 'Mis pagos' }]
  }
];
