import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Importación contra el backend (sin mock): los servicios se simulan para controlar cada respuesta.
vi.mock('../../../shared/api/configuracionApi.js', () => ({ USAR_MOCK: false }));
vi.mock('../services/usuariosService.js', () => ({
  CODIGOS_ESTUDIANTE_HISTORICOS: [],
  iniciarCargaMasivaUsuarios: vi.fn()
}));
vi.mock('../../../shared/api/operacionesMasivasService.js', async (importarOriginal) => ({
  ...(await importarOriginal()),
  consultarOperacionMasiva: vi.fn()
}));

import { consultarOperacionMasiva } from '../../../shared/api/operacionesMasivasService.js';
import { iniciarCargaMasivaUsuarios } from '../services/usuariosService.js';
import DialogoCargaCsv from './DialogoCargaCsv.jsx';

// jsdom no implementa Blob.text() (los navegadores sí).
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

const CSV = [
  'tipoUsuario,nombre,apellidoPaterno,apellidoMaterno,dni,telefono,correo,edad,fechaNacimiento,dniApoderado',
  'APODERADO,Carmen,Soto,Vega,10000011,900000011,carmen.soto@example.com,40,,',
  'DOCENTE,Pedro,Rojas,Luna,10000012,900000012,pedro.rojas@example.com,,,',
  'ESTUDIANTE,Diego,Soto,Ramos,10000013,900000013,diego.soto@example.com,,2012-03-15,10000011'
].join('\r\n');

const INICIO = { exitoso: true, datos: { jobId: 'job-1', estado: 'EN_COLA' }, mensaje: '' };

/** Estado de la operación tal como lo devuelve el backend. */
function job(estado, extra = {}) {
  return {
    exitoso: true,
    mensaje: '',
    datos: { jobId: 'job-1', estado, total: 3, procesados: 0, exitosos: 0, errores: 0, fase: null, detalleErrores: [], ...extra }
  };
}

const RESULTADO_TODAS_CREADAS = [
  { linea: 2, estado: 'CREADO', motivo: null, codigo: null },
  { linea: 3, estado: 'CREADO', motivo: null, codigo: null },
  { linea: 4, estado: 'CREADO', motivo: null, codigo: 'EST001' }
];

/** Elige el archivo (paso 1) y pulsa "Previsualizar" para llegar a la revisión (paso 2). */
async function irALaRevision(dialogo, archivo) {
  await userEvent.upload(within(dialogo).getByLabelText(/Seleccionar archivo CSV/), archivo);
  const previsualizar = within(dialogo).getByRole('button', { name: 'Previsualizar' });
  await waitFor(() => expect(previsualizar).toBeEnabled());
  await userEvent.click(previsualizar);
  await within(dialogo).findByRole('table', { name: 'Revisión de las filas del archivo' });
}

async function prepararImportacion() {
  const alImportar = vi.fn();
  const alRecargar = vi.fn();
  const alImportacionCompleta = vi.fn();
  render(
    <DialogoCargaCsv
      usuarios={[]}
      alImportar={alImportar}
      alRecargar={alRecargar}
      alImportacionCompleta={alImportacionCompleta}
      alCerrar={vi.fn()}
    />
  );
  const dialogo = screen.getByRole('dialog', { name: 'Carga masiva de usuarios' });
  await irALaRevision(dialogo, new File([CSV], 'usuarios.csv', { type: 'text/csv' }));
  return { dialogo, alImportar, alRecargar, alImportacionCompleta };
}

const importar = (dialogo) => userEvent.click(within(dialogo).getByRole('button', { name: 'Importar 3 usuarios' }));

describe('DialogoCargaCsv · importación contra el backend', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('envía todas las filas en una sola petición, muestra el avance y el código del estudiante al terminar', async () => {
    iniciarCargaMasivaUsuarios.mockResolvedValue(INICIO);
    consultarOperacionMasiva
      .mockResolvedValueOnce(job('EN_PROCESO', { procesados: 1, fase: 'GUARDANDO' }))
      .mockResolvedValue(job('COMPLETADO', { procesados: 3, exitosos: 3, fase: 'FINALIZADO', resultado: RESULTADO_TODAS_CREADAS }));
    const { dialogo, alRecargar, alImportacionCompleta } = await prepararImportacion();

    await importar(dialogo);

    // Con la operación en proceso se ve el avance y la fase actual.
    const progreso = await within(dialogo).findByRole('region', { name: 'Progreso de la importación' });
    expect(await within(progreso).findByText('1 de 3 usuarios procesados')).toBeInTheDocument();
    expect(within(progreso).getByText('Guardando los usuarios…')).toBeInTheDocument();
    expect(within(progreso).getByRole('progressbar', { name: 'Avance de la importación' })).toHaveAttribute('max', '3');

    const resultado = await within(dialogo).findByRole('region', { name: 'Resultado de la importación' });
    expect(within(resultado).getAllByText('Creada')).toHaveLength(3);
    expect(within(resultado).getByText('EST001')).toBeInTheDocument();

    // Una sola petición con todas las filas (apoderados primero), y el código reservado para el estudiante.
    expect(iniciarCargaMasivaUsuarios).toHaveBeenCalledTimes(1);
    const [filas, clave] = iniciarCargaMasivaUsuarios.mock.calls[0];
    expect(filas.map((fila) => [fila.linea, fila.tipoUsuario])).toEqual([[2, 'apoderado'], [3, 'docente'], [4, 'estudiante']]);
    expect(filas[2]).toMatchObject({ dniApoderado: '10000011', codigo: 'EST001' });
    expect(filas[0].codigo).toBeUndefined();
    expect(clave).toMatch(/^usuarios-lote-/);

    expect(alRecargar).toHaveBeenCalledTimes(1);
    await userEvent.click(within(dialogo).getByRole('button', { name: 'Listo' }));
    expect(alImportacionCompleta).toHaveBeenCalledWith(3);
  });

  it('muestra la barra indeterminada mientras el servidor valida y aún no hay filas procesadas', async () => {
    iniciarCargaMasivaUsuarios.mockResolvedValue(INICIO);
    consultarOperacionMasiva
      .mockResolvedValueOnce(job('EN_PROCESO', { procesados: 0, fase: 'VALIDANDO' }))
      .mockResolvedValue(job('COMPLETADO', { procesados: 3, exitosos: 3, fase: 'FINALIZADO', resultado: RESULTADO_TODAS_CREADAS }));
    const { dialogo } = await prepararImportacion();

    await importar(dialogo);

    const progreso = await within(dialogo).findByRole('region', { name: 'Progreso de la importación' });
    expect(await within(progreso).findByText('Validando las filas…')).toBeInTheDocument();
    const barra = within(progreso).getByRole('progressbar', { name: 'Avance de la importación' });
    expect(barra).not.toHaveAttribute('value');
    expect(barra).not.toHaveAttribute('max');
    await within(dialogo).findByRole('region', { name: 'Resultado de la importación' });
  });

  it('muestra qué filas rechazó el servidor y por qué, sin cerrar el diálogo', async () => {
    iniciarCargaMasivaUsuarios.mockResolvedValue(INICIO);
    consultarOperacionMasiva.mockResolvedValue(job('COMPLETADO_CON_ERRORES', {
      procesados: 3,
      exitosos: 2,
      errores: 1,
      resultado: [
        { linea: 2, estado: 'CREADO', motivo: null, codigo: null },
        { linea: 3, estado: 'RECHAZADO', motivo: 'Ya existe un usuario registrado con el correo indicado.', codigo: null },
        { linea: 4, estado: 'CREADO', motivo: null, codigo: 'EST001' }
      ]
    }));
    const { dialogo, alRecargar, alImportacionCompleta } = await prepararImportacion();

    await importar(dialogo);

    const resultado = await within(dialogo).findByRole('region', { name: 'Resultado de la importación' });
    expect(within(resultado).getAllByText('Creada')).toHaveLength(2);
    expect(within(resultado).getByText('Rechazada')).toBeInTheDocument();
    expect(within(resultado).getByRole('list', { name: 'Motivo del rechazo de la fila 3' }))
      .toHaveTextContent('Ya existe un usuario registrado con el correo indicado.');
    expect(within(dialogo).getByText('2 usuarios creados y 1 fila rechazada.')).toBeInTheDocument();
    expect(alRecargar).toHaveBeenCalledTimes(1);

    // Con filas rechazadas, "Listo" solo cierra: no se anuncia una importación completa.
    await userEvent.click(within(dialogo).getByRole('button', { name: 'Listo' }));
    expect(alImportacionCompleta).not.toHaveBeenCalled();
  });

  it('si no se pudo iniciar, avisa el motivo, conserva el archivo y reintenta con la misma clave', async () => {
    iniciarCargaMasivaUsuarios
      .mockResolvedValueOnce({ exitoso: false, datos: null, mensaje: 'No hay conexión con el servidor.' })
      .mockResolvedValueOnce(INICIO);
    consultarOperacionMasiva.mockResolvedValue(job('COMPLETADO', { procesados: 3, exitosos: 3, resultado: RESULTADO_TODAS_CREADAS }));
    const { dialogo } = await prepararImportacion();

    await importar(dialogo);

    await waitFor(() => expect(within(dialogo).getByRole('alert')).toHaveTextContent('No hay conexión con el servidor.'));
    expect(within(dialogo).getByRole('table', { name: 'Revisión de las filas del archivo' })).toBeInTheDocument();
    expect(within(dialogo).getByRole('button', { name: 'Importar 3 usuarios' })).toBeEnabled();

    await importar(dialogo);
    await within(dialogo).findByRole('region', { name: 'Resultado de la importación' });
    const [primera, segunda] = iniciarCargaMasivaUsuarios.mock.calls;
    expect(segunda[1]).toBe(primera[1]);
  });

  it('si la operación falla, avisa, pide revisar la lista, recarga y reintenta con una clave nueva', async () => {
    iniciarCargaMasivaUsuarios.mockResolvedValue(INICIO);
    consultarOperacionMasiva
      .mockResolvedValueOnce(job('FALLIDO', { detalleErrores: ['Error inesperado del servidor.'] }))
      .mockResolvedValue(job('COMPLETADO', { procesados: 3, exitosos: 3, resultado: RESULTADO_TODAS_CREADAS }));
    const { dialogo, alRecargar } = await prepararImportacion();

    await importar(dialogo);

    await waitFor(() => expect(within(dialogo).getByRole('alert')).toHaveTextContent('Error inesperado del servidor.'));
    expect(within(dialogo).getByRole('alert')).toHaveTextContent('Revisa la lista de usuarios antes de volver a intentarlo.');
    expect(alRecargar).toHaveBeenCalledTimes(1);

    await importar(dialogo);
    await within(dialogo).findByRole('region', { name: 'Resultado de la importación' });
    const [primera, segunda] = iniciarCargaMasivaUsuarios.mock.calls;
    expect(segunda[1]).not.toBe(primera[1]);
  });

  it('si el servidor ya no conoce la operación, avisa y recarga la lista', async () => {
    iniciarCargaMasivaUsuarios.mockResolvedValue(INICIO);
    consultarOperacionMasiva.mockResolvedValue({ exitoso: false, datos: null, estado: 404, mensaje: 'No se encontró la operación.' });
    const { dialogo, alRecargar } = await prepararImportacion();

    await importar(dialogo);

    await waitFor(() => expect(within(dialogo).getByRole('alert')).toHaveTextContent('Se perdió la conexión con el servidor.'));
    expect(alRecargar).toHaveBeenCalledTimes(1);
    expect(within(dialogo).getByRole('button', { name: 'Importar 3 usuarios' })).toBeEnabled();
  });

  it('"Cargar otro archivo" vuelve a la preparación para una nueva carga', async () => {
    iniciarCargaMasivaUsuarios.mockResolvedValue(INICIO);
    consultarOperacionMasiva.mockResolvedValue(job('COMPLETADO', { procesados: 3, exitosos: 3, resultado: RESULTADO_TODAS_CREADAS }));
    const { dialogo } = await prepararImportacion();
    await importar(dialogo);
    await within(dialogo).findByRole('region', { name: 'Resultado de la importación' });

    await userEvent.click(within(dialogo).getByRole('button', { name: 'Cargar otro archivo' }));

    await waitFor(() => expect(within(dialogo).getByLabelText(/Seleccionar archivo CSV/)).toBeInTheDocument());
    expect(within(dialogo).queryByRole('region', { name: 'Resultado de la importación' })).not.toBeInTheDocument();
    expect(within(dialogo).getByRole('button', { name: 'Previsualizar' })).toBeDisabled();
  });

  it('pagina el resultado (8 filas por página) y permite ver solo las filas rechazadas', async () => {
    const TOTAL = 12;
    const csvGrande = [
      'tipoUsuario,nombre,apellidoPaterno,apellidoMaterno,dni,telefono,correo,edad,fechaNacimiento,dniApoderado',
      ...Array.from({ length: TOTAL }, (_, i) => {
        const n = String(i + 1).padStart(2, '0');
        return `APODERADO,Nombre${n},Apellido${n},Materno${n},200000${n},9000000${n},persona${n}@example.com,40,,`;
      })
    ].join('\r\n');
    // Las filas del archivo son las líneas 2 a 13: se rechazan la 3 y la 12.
    const rechazadas = new Set([3, 12]);
    iniciarCargaMasivaUsuarios.mockResolvedValue(INICIO);
    consultarOperacionMasiva.mockResolvedValue(job('COMPLETADO_CON_ERRORES', {
      total: TOTAL,
      procesados: TOTAL,
      resultado: Array.from({ length: TOTAL }, (_, i) => (rechazadas.has(i + 2)
        ? { linea: i + 2, estado: 'RECHAZADO', motivo: 'Ya existe un usuario registrado con ese identificador.', codigo: null }
        : { linea: i + 2, estado: 'CREADO', motivo: null, codigo: null }))
    }));
    render(
      <DialogoCargaCsv usuarios={[]} alImportar={vi.fn()} alRecargar={vi.fn()} alImportacionCompleta={vi.fn()} alCerrar={vi.fn()} />
    );
    const dialogo = screen.getByRole('dialog', { name: 'Carga masiva de usuarios' });
    await irALaRevision(dialogo, new File([csvGrande], 'usuarios.csv', { type: 'text/csv' }));
    await userEvent.click(within(dialogo).getByRole('button', { name: `Importar ${TOTAL} usuarios` }));

    const resultado = await within(dialogo).findByRole('region', { name: 'Resultado de la importación' });
    const tabla = within(resultado).getByRole('table', { name: 'Resultado por fila' });
    const filasDeDatos = () => within(tabla).getAllByRole('row').filter((fila) => within(fila).queryAllByRole('cell').length > 1);

    // Solo se dibuja la primera página; el resto está detrás de la paginación.
    expect(filasDeDatos()).toHaveLength(8);
    expect(within(resultado).getByRole('navigation', { name: 'Paginación del resultado' })).toBeInTheDocument();

    // Filtrar por rechazadas muestra solo esas filas y ya no hace falta paginar.
    await userEvent.click(within(resultado).getByRole('button', { name: /2 rechazadas/ }));
    expect(filasDeDatos()).toHaveLength(2);
    expect(within(resultado).queryByRole('navigation', { name: 'Paginación del resultado' })).not.toBeInTheDocument();
    expect(within(resultado).getAllByText('Rechazada')).toHaveLength(2);

    // Quitar el filtro vuelve a la primera página con todas las filas.
    await userEvent.click(within(resultado).getByRole('button', { name: /2 rechazadas/ }));
    expect(filasDeDatos()).toHaveLength(8);
  });
});
