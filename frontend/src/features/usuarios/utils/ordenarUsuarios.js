/**
 * Ordenamiento del listado de usuarios (HU-SAT-02, escenario 12): por defecto, apellido paterno,
 * apellido materno y nombre, de forma ascendente.
 */

export const ORDEN_INICIAL = Object.freeze({ campo: 'nombre', direccion: 'asc' });

const comparador = new Intl.Collator('es', { sensitivity: 'base', numeric: true });

/**
 * Apellido paterno y materno de un usuario. La API los envía por separado; el mock trae un solo
 * campo `apellido` ("Mendoza Quispe"), del que se toma la primera palabra como paterno.
 *
 * @param {{ apellido?: string, apellidoPaterno?: string, apellidoMaterno?: string }} usuario
 * @returns {{ paterno: string, materno: string }}
 */
export function separarApellidos(usuario) {
  if (usuario.apellidoPaterno || usuario.apellidoMaterno) {
    return { paterno: usuario.apellidoPaterno ?? '', materno: usuario.apellidoMaterno ?? '' };
  }

  const [paterno = '', ...resto] = String(usuario.apellido ?? '').trim().split(/\s+/);
  return { paterno, materno: resto.join(' ') };
}

/** Compara dos usuarios por apellido paterno, apellido materno y nombre. */
export function compararPorNombre(a, b) {
  const apellidosA = separarApellidos(a);
  const apellidosB = separarApellidos(b);

  return (
    comparador.compare(apellidosA.paterno, apellidosB.paterno) ||
    comparador.compare(apellidosA.materno, apellidosB.materno) ||
    comparador.compare(a.nombre ?? '', b.nombre ?? '')
  );
}

/**
 * Devuelve una copia ordenada del listado.
 *
 * - `nombre`: apellido paterno, materno y nombre.
 * - `estado`: en ascendente, los activos primero; el empate se resuelve por nombre ascendente.
 *
 * @param {Array} usuarios
 * @param {{ campo: 'nombre' | 'estado', direccion: 'asc' | 'desc' }} [orden]
 * @returns {Array}
 */
export function ordenarUsuarios(usuarios, orden = ORDEN_INICIAL) {
  const signo = orden.direccion === 'desc' ? -1 : 1;

  return [...usuarios].sort((a, b) => {
    if (orden.campo === 'estado') {
      const porEstado = Number(Boolean(b.activo)) - Number(Boolean(a.activo));
      return porEstado !== 0 ? porEstado * signo : compararPorNombre(a, b);
    }
    return compararPorNombre(a, b) * signo;
  });
}
