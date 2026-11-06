/** Las cuentas de administrador no se editan ni se desactivan desde este listado. */
export default function esAdministrador(usuario) {
    return usuario?.rol === 'Administrador'
        || usuario?.rol === 'ADMINISTRADOR'
        || usuario?.rol === 'ADMIN';
}
