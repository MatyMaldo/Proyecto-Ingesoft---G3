import { ROLES } from '../../shared/auth/roles.js';
import PaginaPagos from './pages/PaginaPagos.jsx';

export default [
  {
    path: '/pagos',
    element: <PaginaPagos />,
    enLayout: true,
    rolesPermitidos: [ROLES.ADMIN],
    migas: [{ etiqueta: 'Administración' }, { etiqueta: 'Pagos' }]
  }
];
