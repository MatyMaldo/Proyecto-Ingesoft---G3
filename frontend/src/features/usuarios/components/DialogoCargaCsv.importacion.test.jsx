import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Importación contra el backend (sin mock): los servicios se simulan para controlar cada respuesta.
vi.mock('../../../shared/api/configuracionApi.js', () => ({ USAR_MOCK: false }));
vi.mock('../services/usuariosService.js', () => ({
  CODIGOS_ESTUDIANTE_HISTORICOS: [],
  registrarApoderado: vi.fn(),
  registrarDocente: vi.fn(),
  registrarEstudiante: vi.fn()
}));

import { registrarApoderado, registrarDocente, registrarEstudiante } from '../services/usuariosService.js';
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

const APODERADO_CREADO = { id: 26, nombre: 'Carmen', dni: '10000011', rol: 'Apoderado', activo: true, correo: 'carmen.soto@example.com' };
const ESTUDIANTE_CREADO = { id: 28, nombre: 'Diego', dni: '10000013', rol: 'Estudiante', activo: true, correo: 'diego.soto@example.com', codigoEstudiante: 'EST016' };

async function prepararImportacion() {
  const alImportar = vi.fn();
  const alImportacionCompleta = vi.fn();
  render(<DialogoCargaCsv usuarios={[]} alImportar={alImportar} alImportacionCompleta={alImportacionCompleta} alCerrar={vi.fn()} />);
  const dialogo = screen.getByRole('dialog', { name: 'Carga masiva de usuarios' });
  await userEvent.upload(
    within(dialogo).getByLabelText(/Seleccionar archivo CSV/),
    new File([CSV], 'usuarios.csv', { type: 'text/csv' })
  );
  await within(dialogo).findByRole('table', { name: 'Revisión de las filas del archivo' });
  return { dialogo, alImportar, alImportacionCompleta };
}

describe('DialogoCargaCsv · importación contra el backend', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('envía el teléfono de 9 dígitos, muestra el avance mientras importa y el código del estudiante al terminar', async () => {
    let responderApoderado;
    registrarApoderado.mockImplementation(() => new Promise((resolver) => { responderApoderado = () => resolver({ exitoso: true, datos: APODERADO_CREADO }); }));
    registrarDocente.mockResolvedValue({ exitoso: true, datos: { id: 27, nombre: 'Pedro', dni: '10000012', rol: 'Docente', activo: true } });
    registrarEstudiante.mockResolvedValue({ exitoso: true, datos: ESTUDIANTE_CREADO });
    const { dialogo, alImportacionCompleta } = await prepararImportacion();

    await userEvent.click(within(dialogo).getByRole('button', { name: 'Importar 3 usuarios' }));

    // Con la primera respuesta pendiente se ve el avance, con el usuario en curso más antiguo.
    const progreso = await within(dialogo).findByRole('region', { name: 'Progreso de la importación' });
    expect(within(progreso).getByText('Apoderado · Carmen Soto')).toBeInTheDocument();
    expect(within(progreso).getByRole('progressbar', { name: 'Avance de la importación' })).toHaveAttribute('max', '3');
    expect(registrarApoderado).toHaveBeenCalledWith(expect.objectContaining({ telefono: '900000011', edad: 40 }));

    // Los docentes no dependen de los apoderados: se registran mientras el apoderado sigue pendiente.
    // Los estudiantes sí dependen de su apoderado: no se envían hasta que este termina.
    await waitFor(() => expect(registrarDocente).toHaveBeenCalledTimes(1));
    await within(progreso).findByText('1 de 3 usuarios procesados');
    expect(registrarEstudiante).not.toHaveBeenCalled();

    responderApoderado();
    const resultado = await within(dialogo).findByRole('region', { name: 'Resultado de la importación' });

    expect(registrarDocente).toHaveBeenCalledWith(expect.objectContaining({ telefono: '900000012' }));
    expect(registrarEstudiante).toHaveBeenCalledWith(expect.objectContaining({ telefono: '900000013', apoderadoId: 26, codigo: 'EST001' }));
    expect(within(resultado).getAllByText('Creada')).toHaveLength(3);
    expect(within(resultado).getByText('EST016')).toBeInTheDocument();

    await userEvent.click(within(dialogo).getByRole('button', { name: 'Listo' }));
    expect(alImportacionCompleta).toHaveBeenCalledWith(3);
  });

  it('registra varias filas a la vez, con un máximo de 5 peticiones simultáneas', async () => {
    const filas = Array.from({ length: 12 }, (_, i) => {
      const n = String(i + 1).padStart(2, '0');
      return `DOCENTE,Doc${n},Perez,,200000${n},9000000${n},doc${n}@example.com,,,`;
    });
    const csv = [CSV.split('\r\n')[0], ...filas].join('\r\n');
    let enVuelo = 0;
    let maximo = 0;
    registrarDocente.mockImplementation(async () => {
      enVuelo += 1;
      maximo = Math.max(maximo, enVuelo);
      await new Promise((resolver) => { setTimeout(resolver, 10); });
      enVuelo -= 1;
      return { exitoso: true, datos: { id: 1, nombre: 'Doc', dni: '20000001', rol: 'Docente', activo: true } };
    });
    render(<DialogoCargaCsv usuarios={[]} alImportar={vi.fn()} alImportacionCompleta={vi.fn()} alCerrar={vi.fn()} />);
    const dialogo = screen.getByRole('dialog', { name: 'Carga masiva de usuarios' });
    await userEvent.upload(within(dialogo).getByLabelText(/Seleccionar archivo CSV/), new File([csv], 'docentes.csv', { type: 'text/csv' }));
    await within(dialogo).findByRole('table', { name: 'Revisión de las filas del archivo' });

    await userEvent.click(within(dialogo).getByRole('button', { name: 'Importar 12 usuarios' }));
    const resultado = await within(dialogo).findByRole('region', { name: 'Resultado de la importación' });

    expect(within(resultado).getAllByText('Creada')).toHaveLength(12);
    expect(registrarDocente).toHaveBeenCalledTimes(12);
    expect(maximo).toBeGreaterThan(1);
    expect(maximo).toBeLessThanOrEqual(5);
  });

  it('muestra qué filas rechazó el servidor y por qué, sin cerrar el diálogo', async () => {
    registrarApoderado.mockResolvedValue({ exitoso: true, datos: APODERADO_CREADO });
    registrarDocente.mockResolvedValue({ exitoso: false, datos: null, mensaje: 'Ya existe un usuario registrado con el correo indicado.' });
    registrarEstudiante.mockResolvedValue({ exitoso: true, datos: ESTUDIANTE_CREADO });
    const { dialogo, alImportar, alImportacionCompleta } = await prepararImportacion();

    await userEvent.click(within(dialogo).getByRole('button', { name: 'Importar 3 usuarios' }));

    const resultado = await within(dialogo).findByRole('region', { name: 'Resultado de la importación' });
    expect(within(resultado).getAllByText('Creada')).toHaveLength(2);
    expect(within(resultado).getByText('Rechazada')).toBeInTheDocument();
    expect(within(resultado).getByRole('list', { name: 'Motivo del rechazo de la fila 3' }))
      .toHaveTextContent('Ya existe un usuario registrado con el correo indicado.');
    expect(within(dialogo).getByText('2 usuarios creados y 1 fila rechazada.')).toBeInTheDocument();
    expect(alImportar).toHaveBeenCalledTimes(1);

    // Con filas rechazadas, "Listo" solo cierra: no se anuncia una importación completa.
    await userEvent.click(within(dialogo).getByRole('button', { name: 'Listo' }));
    expect(alImportacionCompleta).not.toHaveBeenCalled();
  });

  it('"Cargar otro archivo" vuelve a la preparación para una nueva carga', async () => {
    registrarApoderado.mockResolvedValue({ exitoso: true, datos: APODERADO_CREADO });
    registrarDocente.mockResolvedValue({ exitoso: true, datos: { id: 27, nombre: 'Pedro', dni: '10000012', rol: 'Docente', activo: true } });
    registrarEstudiante.mockResolvedValue({ exitoso: true, datos: ESTUDIANTE_CREADO });
    const { dialogo } = await prepararImportacion();
    await userEvent.click(within(dialogo).getByRole('button', { name: 'Importar 3 usuarios' }));
    await within(dialogo).findByRole('region', { name: 'Resultado de la importación' });

    await userEvent.click(within(dialogo).getByRole('button', { name: 'Cargar otro archivo' }));

    await waitFor(() => expect(within(dialogo).getByLabelText(/Seleccionar archivo CSV/)).toBeInTheDocument());
    expect(within(dialogo).queryByRole('region', { name: 'Resultado de la importación' })).not.toBeInTheDocument();
    expect(within(dialogo).getByRole('button', { name: 'Importar usuarios' })).toBeDisabled();
  });
});
