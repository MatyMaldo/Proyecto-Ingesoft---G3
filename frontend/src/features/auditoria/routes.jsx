import { ROLES } from '../../shared/auth/roles.js';
import PaginaAuditorias from './pages/PaginaAuditorias.jsx';

/**
 * Rutas de la feature Auditorías (HU-SAT-04). Contrato: docs/planes/shell.md §4.2.
 * `titulo` y `migas` no se declaran: el índice de rutas los deriva del ítem de
 * navegación "Auditorías" (sección "Administración") que comparte esta `path`.
 */
export default [
  {
    path: '/administracion/auditorias',
    element: <PaginaAuditorias />,
    enLayout: true,
    rolesPermitidos: [ROLES.ADMIN]
  }
];
