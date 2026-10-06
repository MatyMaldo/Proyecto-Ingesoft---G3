// TODO(backend): sesión simulada. Reemplazar por la sesión real (JWT) cuando exista LoginView.

import { ROLES } from './roles.js';

/**
 * Única fuente de la sesión simulada usada mientras no existe LoginView.
 * Ningún otro archivo debe repetir estos valores de forma literal: deben leerse desde `useAuth()`.
 */
export const SESION_SIMULADA = Object.freeze({
  usuario: Object.freeze({
    nombre: 'Admin',
    nombreCompleto: 'Administrador',
    rol: ROLES.ADMIN,
    etiquetaRol: 'Super Admin',
    correo: 'admin@sanmarcos.edu.pe'
  })
});
