import { describe, expect, it } from 'vitest';

import { resumirTraza } from './resumirTraza.js';

const trazaLarga = [
  'java.lang.IllegalStateException: Cuota 7 no pertenece al cronograma',
  ...Array.from({ length: 20 }, (_, i) => `\tat paquete.Clase.metodo${i}(Clase.java:${i})`),
  'Caused by: java.sql.SQLIntegrityConstraintViolationException: Duplicate entry',
  '\tat com.mysql.cj.jdbc.exceptions.SQLError.createSQLException(SQLError.java:117)',
  '\tat com.mysql.cj.jdbc.ClientPreparedStatement.execute(ClientPreparedStatement.java:1)'
].join('\n');

describe('resumirTraza', () => {
  it('no recorta una traza corta', () => {
    const resultado = resumirTraza('linea 1\nlinea 2\n');
    expect(resultado).toEqual({ texto: 'linea 1\nlinea 2', lineasOcultas: 0, totalLineas: 2 });
  });

  it('conserva las primeras líneas, indica cuántas se omiten y mantiene la causa raíz', () => {
    const { texto, lineasOcultas, totalLineas } = resumirTraza(trazaLarga, 5);
    const lineas = texto.split('\n');

    expect(totalLineas).toBe(24);
    expect(lineas.slice(0, 5)).toEqual(trazaLarga.split('\n').slice(0, 5));
    expect(lineasOcultas).toBe(17);
    expect(lineas[5]).toBe('\t… 17 líneas omitidas');
    expect(lineas[6]).toMatch(/^Caused by: java\.sql/);
    expect(lineas[7]).toMatch(/SQLError\.createSQLException/);
    expect(texto).not.toMatch(/ClientPreparedStatement/);
  });

  it('tolera un detalle vacío', () => {
    expect(resumirTraza(null).lineasOcultas).toBe(0);
  });
});
