import { BrowserRouter } from 'react-router-dom';

import '../shared/styles/tokens.css';
import { AuthProvider } from '../shared/auth/AuthContext.jsx';
import RutasAplicacion from './rutas/index.jsx';

/**
 * Punto de entrada del enrutador de la aplicación: router, tokens de diseño
 * y sesión (simulada hoy; ver `shared/auth/sesionSimulada.js`).
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
