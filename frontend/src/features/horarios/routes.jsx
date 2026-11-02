import PaginaHorarios from './pages/PaginaHorarios.jsx';
import { ROLES_QUE_VEN_HORARIOS } from './constants/horarios.js';

/**
 * Rutas de la feature Horarios. La ruta coincide con el ítem "Horarios" de
 * `app/navegacion/navegacion.config.js` (`/horarios`), por eso `titulo` y `migas` se derivan de él
 * (Gestión › Horarios).
 */
export default [
  {
    path: '/horarios',
    element: <PaginaHorarios />,
    enLayout: true,
    rolesPermitidos: [...ROLES_QUE_VEN_HORARIOS]
  }
];
