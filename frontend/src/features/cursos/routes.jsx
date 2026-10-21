import PaginaCursos from './pages/PaginaCursos.jsx';
import { ROLES_QUE_VEN_CURSOS } from './constants/permisosCursos.js';

/**
 * Rutas de la feature Cursos (HU-EVAL-08). Contrato: docs/planes/shell.md §4.2.
 *
 * La ruta coincide con el ítem "Cursos" de `app/navegacion/navegacion.config.js` (`/cursos`), por eso
 * `titulo` y `migas` no se declaran: el índice de rutas los deriva de ese ítem (Gestión › Cursos).
 *
 * `rolesPermitidos` sale de `constants/permisosCursos.js`. Si algún día se restringe quién entra,
 * hay que editar también `roles` del ítem "Cursos" en `navegacion.config.js` para que el menú
 * lateral oculte el ítem a los mismos roles (sin `roles`, el ítem se muestra a todos).
 */
export default [
  {
    path: '/cursos',
    element: <PaginaCursos />,
    enLayout: true,
    rolesPermitidos: [...ROLES_QUE_VEN_CURSOS]
  }
];
