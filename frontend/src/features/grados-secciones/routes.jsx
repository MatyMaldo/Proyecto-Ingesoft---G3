import { lazy } from 'react';

import { ROLES } from '../../shared/auth/roles.js';

// Carga diferida: el código de cada página se descarga al entrar a su ruta, no con el inicio de sesión.
const PaginaAnioEscolar = lazy(() => import('./pages/PaginaAnioEscolar.jsx'));

export default [{
  path: '/administracion/anio-escolar',
  element: <PaginaAnioEscolar />,
  enLayout: true,
  rolesPermitidos: [ROLES.ADMIN]
}];
