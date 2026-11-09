import { ROLES } from '../../shared/auth/roles.js';
import PaginaPagos from './pages/PaginaPagos.jsx';
import PaginaPagosApoderado from './pages/PaginaPagosApoderado.jsx';

export default [
  {
    path: '/pagos',
    element: <PaginaPagos />,
    enLayout: true,
    rolesPermitidos: [ROLES.ADMIN],
    migas: [{ etiqueta: 'Administración' }, { etiqueta: 'Pagos' }]
  },
  {
    path: '/mis-pagos',
    element: <PaginaPagosApoderado />,
    enLayout: true,
    rolesPermitidos: [ROLES.APODERADO],
    migas: [{ etiqueta: 'Gestión' }, { etiqueta: 'Mis pagos' }]
  }
];
