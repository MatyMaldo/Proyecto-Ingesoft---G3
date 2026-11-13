import { lazy } from 'react';

import { ROLES } from '../../shared/auth/roles.js';

// Carga diferida: el código de cada página se descarga al entrar a su ruta, no con el inicio de sesión.
const PaginaUsuarios = lazy(() => import('./pages/PaginaUsuarios.jsx'));

export default [
  {
    path: '/usuarios',
    element: <PaginaUsuarios />,
    enLayout: true,
    rolesPermitidos: [ROLES.ADMIN],
    migas: [{ etiqueta: 'Gestión' }, { etiqueta: 'Usuarios' }]
  }
];
