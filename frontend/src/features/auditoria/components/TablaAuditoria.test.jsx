import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import TablaAuditoria from './TablaAuditoria.jsx';

function construirRegistro(sobrescritura = {}) {
  return {
    id: 'AUD-0001',
    idElemento: 'ELEMENTO-1',
    fechaHoraIso: '2026-09-18T17:55:00-05:00',
    fecha: '2026-09-18',
    hora: '17:55',
    usuario: { nombre: 'Prof. Quispe', rol: 'Docente', iniciales: 'PQ' },
    modulo: { codigo: 'ASISTENCIA', etiqueta: 'Asistencia', tono: 'cian' },
    accion: { codigo: 'CREAR', etiqueta: 'Crear', tono: 'verde' },
    tipoTransaccion: 'Registró asistencia',
    valoresAntes: null,
    valoresDespues: [{ campo: 'Estado', valor: 'Tardanza' }],
    ...sobrescritura
  };
}

describe('HU-SAT-04 · Escenario 1: intento de modificar o eliminar un registro de auditoría existente', () => {
  it('no ofrece ningún control para editar ni eliminar un registro', () => {
    render(
      <TablaAuditoria
        registros={[construirRegistro()]}
        actualizando={false}
        alSeleccionarRegistro={vi.fn()}
      />
    );

    const botones = screen.getAllByRole('button');
    expect(botones.length).toBeGreaterThan(0);
    botones.forEach((boton) => {
      const nombreAccesible = boton.getAttribute('aria-label') ?? boton.textContent;
      expect(nombreAccesible).not.toMatch(/editar/i);
      expect(nombreAccesible).not.toMatch(/eliminar/i);
    });

    expect(screen.queryByRole('button', { name: /editar/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /eliminar/i })).not.toBeInTheDocument();
    expect(document.querySelector('[contenteditable="true"]')).toBeNull();
    expect(document.querySelector('input[type="checkbox"]')).toBeNull();
  });

  it('solo expone la opción "Ver historial" para abrir el detalle de solo lectura', async () => {
    const alSeleccionarRegistro = vi.fn();
    render(
      <TablaAuditoria
        registros={[construirRegistro()]}
        actualizando={false}
        alSeleccionarRegistro={alSeleccionarRegistro}
      />
    );

    const usuario = userEvent.setup();
    const botonesHistorial = screen.getAllByRole('button', { name: /Ver historial/ });
    expect(botonesHistorial.length).toBeGreaterThan(0);

    await usuario.click(botonesHistorial[0]);
    expect(alSeleccionarRegistro).toHaveBeenCalledTimes(1);
  });
});

describe('HU-SAT-04 · Columnas Acción y Descripción', () => {
  it('muestra la acción como insignia y el nombre de la transacción como descripción', () => {
    render(
      <TablaAuditoria
        registros={[construirRegistro({ tipoTransaccion: 'Registro de asistencia de estudiantes' })]}
        actualizando={false}
        alSeleccionarRegistro={vi.fn()}
      />
    );

    const encabezados = screen.getAllByRole('columnheader').map((th) => th.textContent);
    expect(encabezados).toEqual(['Fecha y hora', 'Usuario', 'Módulo', 'Acción', 'Descripción', 'Detalle']);

    const fila = screen.getAllByRole('row')[1];
    const celdas = fila.querySelectorAll('td');
    expect(celdas[3]).toHaveTextContent('Crear');
    expect(celdas[4]).toHaveTextContent('Registro de asistencia de estudiantes');
  });
});

describe('HU-SAT-04 · Escenario 5: el autor "Sistema" se muestra igual que cualquier otro autor', () => {
  it('no aplica ningún tratamiento visual distinto al registro cuyo autor es "Sistema"', () => {
    const registroPersona = construirRegistro({ id: 'AUD-0001' });
    const registroSistema = construirRegistro({
      id: 'AUD-0002',
      idElemento: 'ELEMENTO-2',
      usuario: { nombre: 'Sistema', rol: 'Sistema', iniciales: 'S' },
      tipoTransaccion: 'Canceló matrícula al finalizar el periodo de matrícula'
    });

    render(
      <TablaAuditoria
        registros={[registroPersona, registroSistema]}
        actualizando={false}
        alSeleccionarRegistro={vi.fn()}
      />
    );

    // Se pinta como texto plano, sin ícono ni insignia adicional que lo distinga.
    expect(screen.getAllByText('Sistema').length).toBeGreaterThan(0);
    const filas = screen.getAllByRole('row').slice(1); // sin la cabecera
    expect(filas.length).toBe(2);

    // Misma estructura de celdas en ambas filas (fecha, usuario con rol, módulo, acción, descripción, historial).
    filas.forEach((fila) => {
      expect(fila.querySelectorAll('td').length).toBe(6);
    });
  });
});

describe('HU-SAT-04 · Tabla: usuario sin redundancia, avatar compartido y cabecera fija', () => {
  it('no repite el rol cuando es igual al nombre y lo muestra en el resto', () => {
    render(
      <TablaAuditoria
        registros={[
          construirRegistro({ id: 'AUD-0002', usuario: { nombre: 'Administrador', rol: 'Administrador', iniciales: 'A' } }),
          construirRegistro({ id: 'AUD-0003' })
        ]}
        actualizando={false}
        alSeleccionarRegistro={vi.fn()}
      />
    );

    const tabla = screen.getByRole('table');
    const filas = within(tabla).getAllByRole('row').slice(1);
    expect(within(filas[0]).getAllByText('Administrador')).toHaveLength(1);
    expect(within(filas[1]).getByText('Docente')).toBeInTheDocument();
  });

  it('muestra el módulo con insignia neutra y solo la acción con color', () => {
    render(
      <TablaAuditoria
        registros={[construirRegistro({ modulo: { codigo: 'ASISTENCIA', etiqueta: 'Asistencia', tono: 'gris' } })]}
        actualizando={false}
        alSeleccionarRegistro={vi.fn()}
      />
    );

    const fila = within(screen.getByRole('table')).getAllByRole('row')[1];
    expect(within(fila).getByText('Asistencia').style.getPropertyValue('--tono-fondo')).toBe('var(--tono-gris-fondo)');
    expect(within(fila).getByText('Crear').style.getPropertyValue('--tono-fondo')).toBe('var(--tono-verde-fondo)');
  });

  it('muestra la fecha como DD/MM/AAAA y las iniciales en el avatar', () => {
    render(
      <TablaAuditoria registros={[construirRegistro()]} actualizando={false} alSeleccionarRegistro={vi.fn()} />
    );

    const fila = within(screen.getByRole('table')).getAllByRole('row')[1];
    expect(within(fila).getByText('18/09/2026')).toBeInTheDocument();
    expect(within(fila).getByText('PQ')).toBeInTheDocument();
  });
});
