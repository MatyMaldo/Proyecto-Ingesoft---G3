import { BrowserRouter } from 'react-router-dom';

import '../shared/styles/tokens.css';
import { AuthProvider } from '../shared/auth/AuthContext.jsx';
import RutasAplicacion from './rutas/index.jsx';

/**
 * Punto de entrada del enrutador de la aplicación: router, tokens de diseño
 * y sesión (real, JWT en `sessionStorage`; ver `shared/auth/AuthContext.jsx`).
 */
export default function EnrutadorAplicacion() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <RutasAplicacion />
      </AuthProvider>
    </BrowserRouter>
  );
}
