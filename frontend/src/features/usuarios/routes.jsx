import { ROLES } from '../../shared/auth/roles.js';
import PaginaUsuarios from './pages/PaginaUsuarios.jsx';

export default [
  {
    path: '/usuarios',
    element: <PaginaUsuarios />,
    enLayout: true,
    rolesPermitidos: [ROLES.ADMIN],
    migas: [{ etiqueta: 'Gestión' }, { etiqueta: 'Usuarios' }]
  }
];
