import { createContext, useMemo } from 'react';

import { SESION_SIMULADA } from './sesionSimulada.js';

/**
 * Contexto de autenticación. Valor por defecto `null` para que `useAuth` pueda
 * detectar un uso fuera de `AuthProvider`.
 */
export const AuthContext = createContext(null);

/**
 * Provee la sesión actual (hoy, la sesión simulada) al resto de la aplicación.
 *
 * @param {Object} props
 * @param {import('react').ReactNode} props.children
 * @param {{ usuario: Object }|null} [props.sesion] Inyectable solo para pruebas
 *   manuales/automatizadas (simular otro rol o ausencia de sesión). En la app se usa sin esta prop.
 */
export function AuthProvider({ children, sesion = SESION_SIMULADA }) {
  const valor = useMemo(() => {
    const usuario = sesion?.usuario ?? null;

    return {
      usuario,
      estaAutenticado: usuario !== null,
      tieneAcceso(rolesPermitidos) {
        if (!usuario) {
          return false;
        }
        if (!rolesPermitidos || rolesPermitidos.length === 0) {
          return true;
        }
        return rolesPermitidos.includes(usuario.rol);
      }
      // TODO(backend): agregar estado "verificando sesión" cuando la sesión venga de la API;
      // RutaProtegida no debe decidir mientras se verifica.
    };
  }, [sesion]);

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}
