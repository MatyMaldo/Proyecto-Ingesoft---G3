import useAuth from '../../../shared/auth/useAuth.js';
import { ROLES } from '../../../shared/auth/roles.js';
import PaginaLibretasEstudiante from './PaginaLibretasEstudiante.jsx';
import PaginaLibretasTutor from './PaginaLibretasTutor.jsx';

export default function PaginaLibretas() {
  const { usuario } = useAuth();
  return usuario?.rol === ROLES.DOCENTE
    ? <PaginaLibretasTutor />
    : <PaginaLibretasEstudiante />;
}
