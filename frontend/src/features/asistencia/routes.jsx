import { lazy } from 'react';

import { ROLES_QUE_VEN_ASISTENCIA } from './constants/permisosAsistencia.js';

const PaginaAsistencia = lazy(() => import('./pages/PaginaAsistencia.jsx'));

export default [
  {
    path: '/asistencia',
    element: <PaginaAsistencia />,
    enLayout: true,
    rolesPermitidos: [...ROLES_QUE_VEN_ASISTENCIA]
  }
];
