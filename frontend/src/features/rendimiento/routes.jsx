import { lazy } from 'react';

import { ROLES } from '../../shared/auth/roles.js';

// Carga diferida: el código de cada página se descarga al entrar a su ruta, no con el inicio de sesión.
const PaginaRendimiento = lazy(() => import('./pages/PaginaRendimiento.jsx'));

export default [
  {
    path: '/rendimiento-academico',
    element: <PaginaRendimiento/>,
    enLayout: true,
    rolesPermitidos: [ROLES.ESTUDIANTE,ROLES.APODERADO],
    migas: [{etiqueta:'Gestión'},{ etiqueta: 'Rendimiento academico' }]
  }
];
