import { ROLES } from '../../shared/auth/roles.js';
import PaginaLibretasEstudiante from './pages/PaginaLibretasEstudiante.jsx';

export default [
  {
    path: '/libreta-notas',
    element: <PaginaLibretasEstudiante />,
    enLayout: true,
    rolesPermitidos: [ROLES.ESTUDIANTE, ROLES.APODERADO]
  }
];
