import { ROLES } from '../../shared/auth/roles.js';
import PaginaMatriculas from './pages/PaginaMatriculas.jsx';

export default [
  {
    path: '/matriculas',
    element: <PaginaMatriculas />,
    enLayout: true,
    rolesPermitidos: [ROLES.ADMIN],
    migas: [{ etiqueta: 'Administración' }, { etiqueta: 'Matrículas' }]
  }
];
