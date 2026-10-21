import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
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
    modulo: { codigo: 'ASISTENCIA', etiqueta: 'Asistencia', tono: 'verde' },
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

    // Misma estructura de celdas en ambas filas (fecha, usuario, rol, módulo, acción, historial).
    filas.forEach((fila) => {
      expect(fila.querySelectorAll('td').length).toBe(6);
    });
  });
});
