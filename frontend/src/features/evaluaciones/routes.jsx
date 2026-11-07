import { ROLES } from '../../shared/auth/roles.js';
import PaginaEvaluaciones from './pages/PaginaEvaluaciones.jsx';

export default [
  {
    path: '/evaluaciones',
    element: <PaginaEvaluaciones />,
    enLayout: true,
    rolesPermitidos: [ROLES.DOCENTE]
  }
];
