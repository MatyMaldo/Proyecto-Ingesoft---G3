import { createContext, useLayoutEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ETIQUETAS_ROL } from './roles.js';
import { RUTA_LOGIN } from './constantesSesion.js';
import {
  leerSesionAlmacenada,
  guardarSesionAlmacenada,
  borrarSesionAlmacenada,
  obtenerTokenAlmacenado
} from './almacenSesion.js';
import { configurarCliente } from '../api/clienteHttp.js';

/**
 * Contexto de autenticación. Valor por defecto `null` para que `useAuth` pueda
 * detectar un uso fuera de `AuthProvider`.
 */
export const AuthContext = createContext(null);

/**
 * Provee la sesión real (JWT en `sessionStorage`) al resto de la aplicación:
 * usuario actual, verificación de rol, inicio y cierre de sesión.
 *
 * @param {Object} props
 * @param {import('react').ReactNode} props.children
 */
export function AuthProvider({ children }) {
  const navigate = useNavigate();
  // Lectura síncrona (perezosa): no hace falta un estado "verificando sesión",
  // `RutaProtegida` decide en el primer render.
  const [sesion, establecerSesionEstado] = useState(() => leerSesionAlmacenada());

  // Se usa `useLayoutEffect` (no `useEffect`) para que el cliente HTTP quede
  // configurado antes de la primera petición de cualquier página: los efectos
  // de layout del padre corren antes que los efectos normales de los hijos.
  // Ninguna página debe pedir datos en `useLayoutEffect`.
  useLayoutEffect(() => {
    const manejarSesionExpirada = () => {
      // Si no hay token, el 401 viene del propio login: no hay sesión que cerrar.
      if (!obtenerTokenAlmacenado()) {
        return;
      }
      borrarSesionAlmacenada();
      establecerSesionEstado(null);
      navigate(RUTA_LOGIN, { replace: true });
    };

    configurarCliente({
      obtenerToken: obtenerTokenAlmacenado,
      alSesionExpirada: manejarSesionExpirada
    });

    return () => configurarCliente();
  }, [navigate]);

  const valor = useMemo(() => {
    const usuario = sesion?.usuario
      ? {
          id: sesion.usuario.id,
          nombre: sesion.usuario.nombre,
          rol: sesion.usuario.rol,
          etiquetaRol: ETIQUETAS_ROL[sesion.usuario.rol] ?? sesion.usuario.rol
        }
      : null;

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
      },
      establecerSesion({ token, usuario: datosUsuario }) {
        const nuevaSesion = {
          token,
          usuario: { id: datosUsuario.id, nombre: datosUsuario.nombre, rol: datosUsuario.rol }
        };
        guardarSesionAlmacenada(nuevaSesion);
        establecerSesionEstado(nuevaSesion);
      },
      cerrarSesion() {
        borrarSesionAlmacenada();
        establecerSesionEstado(null);
        navigate(RUTA_LOGIN, { replace: true });
      }
    };
  }, [sesion, navigate]);

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}
