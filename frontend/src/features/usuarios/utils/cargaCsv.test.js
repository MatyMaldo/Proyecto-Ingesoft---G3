import { describe, expect, it } from 'vitest';
import { leerCsv, textoProblema, validarFilasCsv } from './cargaCsv.js';

const ENCABEZADO = 'tipoUsuario,nombre,apellidoPaterno,apellidoMaterno,dni,telefono,correo,edad,fechaNacimiento,dniApoderado';

function leer(...lineas) {
  return leerCsv([ENCABEZADO, ...lineas].join('\r\n'));
}

describe('validarFilasCsv · detalle por fila', () => {
  it('no reporta problemas en un archivo válido y conserva el orden original de las filas', () => {
    const filas = leer(
      'ESTUDIANTE,Diego,Soto,Ramos,10000013,900000013,diego@example.com,,2012-03-15,10000011',
      'APODERADO,Carmen,Soto,Vega,10000011,900000011,carmen@example.com,40,,'
    );

    const { errores, filasOrdenadas, detalleFilas } = validarFilasCsv(filas, [], false);

    expect(errores).toEqual([]);
    // Se registra primero el apoderado, pero el detalle mantiene el orden del archivo.
    expect(filasOrdenadas.map((fila) => fila.tipoUsuario)).toEqual(['apoderado', 'estudiante']);
    expect(detalleFilas.map((fila) => fila.linea)).toEqual([2, 3]);
    expect(detalleFilas.every((fila) => fila.problemas.length === 0)).toBe(true);
  });

  it('rechaza un archivo con columna de contraseña: el administrador no maneja contraseñas', () => {
    const conPassword = [
      'tipoUsuario,nombre,apellidoPaterno,apellidoMaterno,dni,telefono,correo,password,edad,fechaNacimiento,dniApoderado',
      'APODERADO,Carmen,Soto,Vega,10000011,900000011,carmen@example.com,PruebaApod2026!,40,,'
    ].join('\r\n');

    expect(() => leerCsv(conPassword)).toThrow(/columna de contraseña/);
  });

  it('nombra el campo afectado en cada problema', () => {
    const filas = leer('APODERADO,Ana,Perez,,1234,9000,ana.perez,,,');

    const { errores, detalleFilas } = validarFilasCsv(filas, [], false);

    const textos = detalleFilas[0].problemas.map(textoProblema);
    expect(textos).toEqual(expect.arrayContaining([
      'DNI: debe tener 8 dígitos',
      'Correo: no tiene un formato válido',
      'Teléfono: debe tener exactamente 9 dígitos',
      'Edad: debe ser un número entero de 1 o más'
    ]));
    expect(errores).toHaveLength(1);
    expect(errores[0]).toMatch(/^Fila 2: /);
  });

  it('detecta DNI y correo repetidos dentro del mismo archivo', () => {
    const filas = leer(
      'DOCENTE,Pedro,Rojas,,10000012,900000012,pedro@example.com,,,',
      'DOCENTE,Pedro,Rojas,,10000012,900000099,pedro@example.com,,,'
    );

    const { detalleFilas } = validarFilasCsv(filas, [], false);

    expect(detalleFilas[0].problemas).toEqual([]);
    expect(detalleFilas[1].problemas.map((problema) => problema.campo)).toEqual(['DNI', 'Correo']);
  });

  it('incluye las filas con tipo inválido en el detalle, sin tipo ni nombre', () => {
    const filas = leer(
      'DIRECTOR,Luis,Mora,,10000020,900000020,luis@example.com,,,',
      'APODERADO,Carmen,Soto,Vega,10000011,900000011,carmen@example.com,40,,'
    );

    const { errores, filasOrdenadas, detalleFilas } = validarFilasCsv(filas, [], false);

    expect(filasOrdenadas).toHaveLength(1);
    expect(detalleFilas).toHaveLength(2);
    expect(detalleFilas[0]).toMatchObject({ linea: 2, tipoUsuario: null });
    expect(detalleFilas[0].problemas[0].mensaje).toMatch(/Tipo de usuario debe ser/);
    expect(errores).toHaveLength(1);
  });

  it('valida que el apoderado del estudiante exista en el sistema o en el archivo', () => {
    const filas = leer('ESTUDIANTE,Sofia,Rios,,10000030,900000030,sofia@example.com,,2014-04-20,99999999');

    const { detalleFilas } = validarFilasCsv(filas, [], false);

    expect(detalleFilas[0].problemas.map((problema) => problema.campo)).toEqual(['DNI del apoderado']);

    const usuarios = [{ rol: 'Apoderado', activo: true, dni: '99999999', correo: 'otro@example.com' }];
    expect(validarFilasCsv(filas, usuarios, false).errores).toEqual([]);
  });
});
