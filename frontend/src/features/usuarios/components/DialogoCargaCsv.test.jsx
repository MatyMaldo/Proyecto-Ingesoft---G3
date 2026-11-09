import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('../../../shared/api/configuracionApi.js', () => ({ USAR_MOCK: true }));

import DialogoCargaCsv from './DialogoCargaCsv.jsx';

// jsdom no implementa Blob.text() (los navegadores sí), y el diálogo lee el archivo con `archivo.text()`.
if (!Blob.prototype.text) {
  Blob.prototype.text = function text() {
    return new Promise((resolver, rechazar) => {
      const lector = new FileReader();
      lector.onload = () => resolver(String(lector.result));
      lector.onerror = () => rechazar(lector.error);
      lector.readAsText(this);
    });
  };
}

const ENCABEZADO = 'tipoUsuario,nombre,apellidoPaterno,apellidoMaterno,dni,telefono,correo,edad,fechaNacimiento,dniApoderado';

const CSV_VALIDO = [
  ENCABEZADO,
  'APODERADO,Carmen,Soto,Vega,10000011,900000011,carmen.soto@example.com,40,,',
  'DOCENTE,Pedro,Rojas,Luna,10000012,900000012,pedro.rojas@example.com,30,,',
  'ESTUDIANTE,Diego,Soto,Ramos,10000013,900000013,diego.soto@example.com,,2012-03-15,10000011',
  'ESTUDIANTE,Valeria,Soto,Ramos,10000014,900000014,valeria.soto@example.com,,2014-09-02,10000011'
].join('\r\n');

const CSV_CON_ERRORES = [
  ENCABEZADO,
  'APODERADO,Carmen,Soto,Vega,10000011,900000011,carmen.soto@example.com,40,,',
  'APODERADO,Ana,Perez,,10000011,9000,ana.perez,,,',
  'ESTUDIANTE,Diego,Soto,Ramos,10000013,900000013,diego.soto@example.com,,2012-03-15,99999999'
].join('\r\n');

/** Espera a que termine la lectura asíncrona del archivo: aparece la revisión o el aviso de error general. */
async function esperarLectura(dialogo) {
  await waitFor(() => {
    expect(
      within(dialogo).queryByRole('table', { name: 'Revisión de las filas del archivo' })
        ?? within(dialogo).queryByText('No se puede usar este archivo:')
    ).toBeInTheDocument();
  });
}

async function abrirConArchivo(contenido) {
  render(<DialogoCargaCsv usuarios={[]} alImportar={vi.fn()} alImportacionCompleta={vi.fn()} alCerrar={vi.fn()} />);
  const dialogo = screen.getByRole('dialog', { name: 'Carga masiva de usuarios' });
  const archivo = new File([contenido], 'usuarios.csv', { type: 'text/csv' });
  await userEvent.upload(within(dialogo).getByLabelText(/Seleccionar archivo CSV/), archivo);
  await esperarLectura(dialogo);
  return dialogo;
}

describe('DialogoCargaCsv · revisión del archivo', () => {
  it('antes de elegir archivo, explica qué falta y deja el botón deshabilitado', () => {
    render(<DialogoCargaCsv usuarios={[]} alImportar={vi.fn()} alImportacionCompleta={vi.fn()} alCerrar={vi.fn()} />);
    const dialogo = screen.getByRole('dialog', { name: 'Carga masiva de usuarios' });

    expect(within(dialogo).getByText('Selecciona un archivo CSV para continuar.')).toBeInTheDocument();
    expect(within(dialogo).getByRole('button', { name: 'Importar usuarios' })).toBeDisabled();
  });

  it('organiza el flujo en dos pasos: descargar la plantilla y subir el archivo, con sus límites', () => {
    render(<DialogoCargaCsv usuarios={[]} alImportar={vi.fn()} alImportacionCompleta={vi.fn()} alCerrar={vi.fn()} />);
    const dialogo = screen.getByRole('dialog', { name: 'Carga masiva de usuarios' });

    const paso1 = within(dialogo).getByRole('region', { name: 'Descarga la plantilla' });
    expect(within(paso1).getByRole('button', { name: 'Descargar plantilla CSV' })).toBeInTheDocument();

    const paso2 = within(dialogo).getByRole('region', { name: 'Sube tu archivo' });
    expect(within(paso2).getByLabelText(/Seleccionar archivo CSV/)).toBeInTheDocument();
    expect(within(paso2).getByText('CSV UTF-8 · máx. 2 MB · 1000 filas')).toBeInTheDocument();
  });

  it('rechaza un archivo de más de 2 MB', async () => {
    const dialogo = await abrirConArchivo('x'.repeat(2 * 1024 * 1024 + 1));

    expect(within(dialogo).getByText('El archivo no debe superar los 2 MB.')).toBeInTheDocument();
    expect(within(dialogo).getByRole('button', { name: 'Importar usuarios' })).toBeDisabled();
  });

  it('rechaza un archivo con más de 1000 filas y sugiere dividirlo', async () => {
    const filas = Array.from({ length: 1001 }, (_, i) => `DOCENTE,Doc${i},Prueba,,${String(30000000 + i)},900000000,doc${i}@example.com,30,,`);
    const dialogo = await abrirConArchivo([ENCABEZADO, ...filas].join('\r\n'));

    expect(within(dialogo).getByText(/tiene 1001 filas y el máximo es 1000 por carga/)).toBeInTheDocument();
    expect(within(dialogo).queryByRole('table', { name: 'Revisión de las filas del archivo' })).not.toBeInTheDocument();
  });

  it('muestra el formato del archivo plegado por defecto', () => {
    render(<DialogoCargaCsv usuarios={[]} alImportar={vi.fn()} alImportacionCompleta={vi.fn()} alCerrar={vi.fn()} />);

    const detalles = screen.getByText('Ver formato del archivo').closest('details');
    expect(detalles).not.toHaveAttribute('open');
  });

  it('con un archivo válido resume las filas por tipo, marca cada fila y anuncia qué se creará', async () => {
    const dialogo = await abrirConArchivo(CSV_VALIDO);

    const resumen = within(dialogo).getByRole('status');
    expect(resumen).toHaveTextContent('4filas en el archivo');
    expect(within(resumen).getByText('Por tipo')).toBeInTheDocument();
    expect(within(resumen).getByText('1 apoderado')).toBeInTheDocument();
    expect(within(resumen).getByText('1 docente')).toBeInTheDocument();
    expect(within(resumen).getByText('2 estudiantes')).toBeInTheDocument();
    expect(within(resumen).getByText('Estado')).toBeInTheDocument();
    expect(within(resumen).getByText('4 válidas')).toBeInTheDocument();
    expect(within(resumen).queryByText(/con error/)).not.toBeInTheDocument();

    expect(within(dialogo).getAllByText('Válida')).toHaveLength(4);
    expect(within(dialogo).getByText('Se crearán 1 apoderado, 1 docente y 2 estudiantes.')).toBeInTheDocument();
    expect(within(dialogo).getByRole('button', { name: 'Importar 4 usuarios' })).toBeEnabled();
  });

  it('con errores, lista bajo cada fila el campo afectado, filtra por defecto y bloquea la importación', async () => {
    const dialogo = await abrirConArchivo(CSV_CON_ERRORES);

    const resumen = within(dialogo).getByRole('status');
    expect(within(resumen).getByText('1 válida')).toBeInTheDocument();
    expect(within(resumen).getByText('2 con errores')).toBeInTheDocument();
    expect(within(dialogo).getByText('Corrige 2 filas con errores para continuar.')).toBeInTheDocument();
    expect(within(dialogo).getByRole('button', { name: 'Importar 3 usuarios' })).toBeDisabled();

    // Por defecto solo se ven las filas con errores (3 y 4); la 2 es válida y queda oculta.
    const filtro = within(dialogo).getByRole('checkbox', { name: 'Mostrar solo las filas con errores' });
    expect(filtro).toBeChecked();
    expect(within(dialogo).queryByText('Válida')).not.toBeInTheDocument();

    const erroresFila3 = within(dialogo).getByRole('list', { name: 'Errores de la fila 3' });
    expect(within(erroresFila3).getByText(/^Teléfono: debe tener exactamente 9 dígitos$/)).toBeInTheDocument();
    expect(within(erroresFila3).getByText(/^Correo: no tiene un formato válido$/)).toBeInTheDocument();
    expect(within(erroresFila3).getByText(/^DNI: ya existe un usuario con ese DNI y rol/)).toBeInTheDocument();

    const erroresFila4 = within(dialogo).getByRole('list', { name: 'Errores de la fila 4' });
    expect(within(erroresFila4).getByText(/^DNI del apoderado: debe ser el de un apoderado/)).toBeInTheDocument();

    // Al quitar el filtro aparece también la fila válida.
    await userEvent.click(filtro);
    expect(within(dialogo).getByText('Válida')).toBeInTheDocument();
  });

  it('un archivo que no se puede leer muestra un aviso general y no tabla de filas', async () => {
    const dialogo = await abrirConArchivo('no,es,un,csv');

    expect(within(dialogo).getByText('No se puede usar este archivo:').closest('[role="alert"]')).toHaveTextContent('al menos una fila de usuarios');
    expect(within(dialogo).queryByRole('table', { name: 'Revisión de las filas del archivo' })).not.toBeInTheDocument();
    expect(within(dialogo).getByText('Corrige el archivo y vuelve a seleccionarlo.')).toBeInTheDocument();
  });

  it('el formato del archivo se explica en una tabla con la columna, a quién aplica, la regla y un ejemplo', () => {
    render(<DialogoCargaCsv usuarios={[]} alImportar={vi.fn()} alImportacionCompleta={vi.fn()} alCerrar={vi.fn()} />);

    const tabla = screen.getByRole('table', { name: 'Columnas del archivo CSV' });
    const filas = within(tabla).getAllByRole('row');
    // Encabezado + las 10 columnas del CSV (sin contraseña: la define cada usuario).
    expect(filas).toHaveLength(11);
    expect(within(tabla).queryByText('password')).not.toBeInTheDocument();
    expect(within(tabla).getAllByRole('columnheader').map((celda) => celda.textContent))
      .toEqual(['Columna', 'Requerido', 'Formato', 'Ejemplo']);
    const filaTelefono = within(tabla).getByText('telefono').closest('tr');
    expect(filaTelefono).toHaveTextContent('Estudiantes y docentes');
    expect(filaTelefono).toHaveTextContent('9 dígitos');
  });

  it('en pantallas amplias muestra todas las filas del archivo, sin recortarlas', async () => {
    const filas = Array.from({ length: 12 }, (_, i) => {
      const n = String(i + 1).padStart(2, '0');
      return `DOCENTE,Doc${n},Prueba,,300000${n},9000000${n},doc${n}@example.com,30,,`;
    });
    const dialogo = await abrirConArchivo([ENCABEZADO, ...filas].join('\r\n'));

    const tabla = within(dialogo).getByRole('table', { name: 'Revisión de las filas del archivo' });
    expect(within(tabla).getAllByText('Válida')).toHaveLength(12);
    expect(within(dialogo).getByText(/12 filas en total/)).toBeInTheDocument();
    expect(within(dialogo).queryByRole('button', { name: /^Mostrar las/ })).not.toBeInTheDocument();
  });

  it('en pantallas compactas muestra las primeras 8 filas y permite mostrar el resto', async () => {
    const original = window.matchMedia;
    window.matchMedia = (consulta) => ({
      matches: consulta.includes('max-width: 767px'),
      media: consulta,
      addEventListener: () => {},
      removeEventListener: () => {}
    });
    try {
      const filas = Array.from({ length: 12 }, (_, i) => {
        const n = String(i + 1).padStart(2, '0');
        return `DOCENTE,Doc${n},Prueba,,300000${n},9000000${n},doc${n}@example.com,30,,`;
      });
      const dialogo = await abrirConArchivo([ENCABEZADO, ...filas].join('\r\n'));
      const tabla = within(dialogo).getByRole('table', { name: 'Revisión de las filas del archivo' });

      expect(within(tabla).getAllByText('Válida')).toHaveLength(8);
      await userEvent.click(within(dialogo).getByRole('button', { name: 'Mostrar las 12' }));
      expect(within(tabla).getAllByText('Válida')).toHaveLength(12);
    } finally {
      window.matchMedia = original;
    }
  });

  it('mientras lee el archivo muestra "Leyendo archivo…" y no permite importar ni cambiarlo', async () => {
    render(<DialogoCargaCsv usuarios={[]} alImportar={vi.fn()} alImportacionCompleta={vi.fn()} alCerrar={vi.fn()} />);
    const dialogo = screen.getByRole('dialog', { name: 'Carga masiva de usuarios' });
    const archivo = new File([CSV_VALIDO], 'usuarios.csv', { type: 'text/csv' });
    let terminarLectura;
    archivo.text = () => new Promise((resolver) => { terminarLectura = () => resolver(CSV_VALIDO); });

    await userEvent.upload(within(dialogo).getByLabelText(/Seleccionar archivo CSV/), archivo);

    expect(within(dialogo).getAllByText('Leyendo archivo…').length).toBeGreaterThan(0);
    expect(within(dialogo).getByRole('button', { name: 'Importar usuarios' })).toBeDisabled();
    expect(within(dialogo).queryByRole('button', { name: 'Quitar archivo' })).not.toBeInTheDocument();

    terminarLectura();
    await esperarLectura(dialogo);
    expect(within(dialogo).queryByText('Leyendo archivo…')).not.toBeInTheDocument();
    expect(within(dialogo).getByRole('button', { name: 'Importar 4 usuarios' })).toBeEnabled();
  });

  it('"Quitar archivo" descarta el archivo elegido y vuelve al estado inicial', async () => {
    const dialogo = await abrirConArchivo(CSV_VALIDO);
    expect(within(dialogo).getByText('usuarios.csv')).toBeInTheDocument();

    await userEvent.click(within(dialogo).getByRole('button', { name: 'Quitar archivo' }));

    expect(within(dialogo).queryByText('usuarios.csv')).not.toBeInTheDocument();
    expect(within(dialogo).queryByRole('region', { name: 'Revisión del archivo' })).not.toBeInTheDocument();
    expect(within(dialogo).getByText('Selecciona un archivo CSV para continuar.')).toBeInTheDocument();
    expect(within(dialogo).getByRole('button', { name: 'Importar usuarios' })).toBeDisabled();
  });

  it('al importar con éxito en modo demostración llama a alImportar y alImportacionCompleta', async () => {
    const alImportar = vi.fn();
    const alImportacionCompleta = vi.fn();
    render(<DialogoCargaCsv usuarios={[]} alImportar={alImportar} alImportacionCompleta={alImportacionCompleta} alCerrar={vi.fn()} />);
    const dialogo = screen.getByRole('dialog', { name: 'Carga masiva de usuarios' });
    await userEvent.upload(
      within(dialogo).getByLabelText(/Seleccionar archivo CSV/),
      new File([CSV_VALIDO], 'usuarios.csv', { type: 'text/csv' })
    );
    await esperarLectura(dialogo);

    await userEvent.click(within(dialogo).getByRole('button', { name: 'Importar 4 usuarios' }));

    // El resultado queda a la vista: el diálogo no se cierra solo, se cierra con "Listo".
    const resultado = await within(dialogo).findByRole('region', { name: 'Resultado de la importación' });
    expect(alImportar).toHaveBeenCalledTimes(1);
    expect(alImportar.mock.calls[0][0]).toHaveLength(4);
    expect(within(resultado).getAllByText('Creada')).toHaveLength(4);
    // Cada estudiante recibe un código generado, visible en el resultado.
    expect(within(resultado).getAllByText(/^EST-\d{3}$/)).toHaveLength(2);
    expect(alImportacionCompleta).not.toHaveBeenCalled();
    expect(within(dialogo).queryByRole('button', { name: 'Cancelar' })).not.toBeInTheDocument();

    await userEvent.click(within(dialogo).getByRole('button', { name: 'Listo' }));
    expect(alImportacionCompleta).toHaveBeenCalledWith(4);
  });
});
