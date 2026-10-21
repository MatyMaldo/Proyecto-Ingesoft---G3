import { ROLES } from '../../shared/auth/roles.js';
import PaginaAnioEscolar from './pages/PaginaAnioEscolar.jsx';

export default [{
  path: '/administracion/anio-escolar',
  element: <PaginaAnioEscolar />,
  enLayout: true,
  rolesPermitidos: [ROLES.ADMIN]
}];
