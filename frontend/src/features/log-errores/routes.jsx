import { lazy } from 'react';

import { ROLES } from '../../shared/auth/roles.js';

// Carga diferida: el código de cada página se descarga al entrar a su ruta, no con el inicio de sesión.
const PaginaLogErrores = lazy(() => import('./pages/PaginaLogErrores.jsx'));

/**
 * Rutas de la feature "Log de errores" (ver `docs/planes/shell.md` §4.2 para
 * el contrato de `routes.jsx`).
 */
export default [
  {
    path: '/administracion/log-errores',
    element: <PaginaLogErrores />,
    enLayout: true,
    rolesPermitidos: [ROLES.ADMIN],
    migas: [{ etiqueta: 'Administración' }, { etiqueta: 'Log de errores' }]
  }
];
