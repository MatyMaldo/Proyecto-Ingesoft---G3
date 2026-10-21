import { ROLES } from '../../shared/auth/roles.js';
import PaginaLogErrores from './pages/PaginaLogErrores.jsx';

/**
 * Rutas de la feature "Log de errores" (ver `docs/planes/shell.md` §4.2 para
 * el contrato de `routes.jsx`).
 */
export default [
  {
    path: '/administracion/log-errores',
    element: <PaginaLogErrores />,
    enLayout: true,
    rolesPermitidos: [ROLES.ADMIN],
    migas: [{ etiqueta: 'Administración' }, { etiqueta: 'Log de errores' }]
  }
];
