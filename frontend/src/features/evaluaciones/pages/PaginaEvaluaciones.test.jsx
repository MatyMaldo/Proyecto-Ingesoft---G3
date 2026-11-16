import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';

const { usuario } = vi.hoisted(() => ({ usuario: { id: '3', nombre: 'Docente de prueba', rol: 'DOCENTE' } }));

vi.mock('../../../shared/api/configuracionApi.js', () => ({ USAR_MOCK: true }));
vi.mock('../../../shared/auth/useAuth.js', () => ({ default: () => ({ usuario }) }));

import PaginaEvaluaciones from './PaginaEvaluaciones.jsx';

const ESPERA = { timeout: 4000 };
const esperarPagina = () => screen.findByRole('region', { name: 'Evaluaciones de la sección' }, ESPERA);

/** Crea una evaluación por la minipantalla; devuelve la notificación para que cada prueba la compruebe. */
async function crearEvaluacion(nombre) {
  await userEvent.click(screen.getByRole('button', { name: 'Crear evaluación' }));
  const dialogo = await screen.findByRole('dialog', { name: 'Nueva evaluación' });
  await userEvent.type(within(dialogo).getByLabelText(/Nombre de la evaluación/), nombre);
  await userEvent.type(within(dialogo).getByLabelText(/Fecha/), '2026-04-15');
  await userEvent.selectOptions(within(dialogo).getByLabelText(/Competencia/), within(dialogo).getAllByRole('option')[1]);
  await userEvent.type(within(dialogo).getByLabelText(/Descripción/), 'Descripción de prueba');
  await userEvent.click(within(dialogo).getByRole('button', { name: 'Guardar evaluación' }));
  return screen.findByText('La evaluación se registró correctamente en I Bimestre.', {}, ESPERA);
}

describe('Evaluaciones del docente', () => {
  it('deja la cabecera solo con título y descripción; las acciones van al pie de las evaluaciones', async () => {
    render(<PaginaEvaluaciones />);
    const zona = await esperarPagina();

    const cabecera = screen.getByRole('heading', { level: 1, name: 'Evaluaciones' }).closest('header');
    expect(within(cabecera).queryAllByRole('button')).toHaveLength(0);
    expect(within(zona).getByRole('heading', { level: 2, name: /^Evaluaciones de / })).toBeInTheDocument();
    const crear = within(zona).getByRole('button', { name: 'Crear evaluación' });
    const competencias = within(zona).getByRole('button', { name: 'Registrar notas de competencias' });
    expect(crear).toBeEnabled();
    expect(competencias).toBeEnabled();
    // Las dos acciones comparten el pie de la zona, con «Crear evaluación» en el extremo izquierdo.
    expect(crear.parentElement).toBe(competencias.parentElement);
    expect(crear.compareDocumentPosition(competencias) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(within(zona).queryByRole('button', { name: 'Nueva evaluación' })).not.toBeInTheDocument();
    expect(screen.getByText('Vigente')).toBeInTheDocument();
  });

  it('elige el curso solo por su nombre y la sección con chips cortos de grado y sección', async () => {
    render(<PaginaEvaluaciones />);
    await esperarPagina();

    const curso = screen.getByLabelText('Curso');
    expect(within(curso).getAllByRole('option').map((opcion) => opcion.textContent).join(' ')).not.toMatch(/Grado|Secundaria/i);
    const secciones = screen.getByRole('group', { name: 'Filtrar evaluaciones por grado y sección' });
    const chips = within(secciones).getAllByRole('button');
    expect(chips.length).toBeGreaterThan(0);
    chips.forEach((chip) => expect(chip.textContent).not.toMatch(/Secundaria/i));
    expect(chips.filter((chip) => chip.getAttribute('aria-pressed') === 'true')).toHaveLength(1);
  });

  it('sin evaluaciones ofrece crear la primera', async () => {
    render(<PaginaEvaluaciones />);
    await esperarPagina();

    expect(screen.getByText('Todavía no hay evaluaciones registradas para esta sección.')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Crear la primera evaluación' }));
    expect(await screen.findByRole('dialog', { name: 'Nueva evaluación' })).toBeInTheDocument();
  });

  it('«Nueva evaluación» valida los campos, crea la evaluación y avisa con una notificación', async () => {
    render(<PaginaEvaluaciones />);
    await esperarPagina();

    await userEvent.click(screen.getByRole('button', { name: 'Crear evaluación' }));
    const dialogo = await screen.findByRole('dialog', { name: 'Nueva evaluación' });
    await userEvent.click(within(dialogo).getByRole('button', { name: 'Guardar evaluación' }));
    expect(within(dialogo).getByText('Ingresa el nombre de la evaluación.')).toBeInTheDocument();
    expect(within(dialogo).getByText('Selecciona la fecha de la evaluación.')).toBeInTheDocument();
    expect(within(dialogo).getByText('Selecciona la competencia que medirá la evaluación.')).toBeInTheDocument();
    expect(within(dialogo).getByText('Ingresa una descripción.')).toBeInTheDocument();
    await userEvent.click(within(dialogo).getByRole('button', { name: 'Cancelar' }));

    expect(await crearEvaluacion('Examen de prueba')).toBeInTheDocument();
    expect(screen.queryByRole('dialog', { name: 'Nueva evaluación' })).not.toBeInTheDocument();
    const lista = screen.getByRole('list', { name: 'Evaluaciones registradas' });
    expect(within(lista).getByRole('heading', { name: 'Examen de prueba' })).toBeInTheDocument();
  });

  it('«Notas de la evaluación» junta los cambios y los guarda todos con «Guardar notas»', async () => {
    render(<PaginaEvaluaciones />);
    await esperarPagina();
    await crearEvaluacion('Práctica de notas');

    await userEvent.click(screen.getByRole('button', { name: 'Registrar notas de Práctica de notas' }));
    const dialogo = await screen.findByRole('dialog', { name: 'Notas · Práctica de notas' });
    const lista = await within(dialogo).findByRole('list', { name: 'Estudiantes de la sección' }, ESPERA);
    expect(within(lista).getAllByRole('listitem')).toHaveLength(2);
    expect(within(dialogo).getByText('Competencia')).toBeInTheDocument();
    expect(within(dialogo).getByText('Bimestre')).toBeInTheDocument();
    expect(within(dialogo).getByText('Fecha')).toBeInTheDocument();

    // Sin cambios no hay nada que guardar.
    const guardar = within(dialogo).getByRole('button', { name: 'Guardar notas' });
    expect(guardar).toBeDisabled();

    const grupos = within(lista).getAllByRole('radiogroup');
    await userEvent.click(within(grupos[0]).getByRole('radio', { name: 'A' }));
    await userEvent.click(within(grupos[1]).getByRole('radio', { name: 'B' }));
    expect(within(dialogo).getByText('2 sin guardar')).toBeInTheDocument();
    expect(guardar).toBeEnabled();

    // Cerrar con cambios pide confirmación y seguir editando conserva las notas.
    await userEvent.click(within(dialogo).getByRole('button', { name: 'Cancelar' }));
    expect(within(dialogo).getByText(/Hay 2 notas sin guardar/)).toBeInTheDocument();
    await userEvent.click(within(dialogo).getByRole('button', { name: 'Seguir editando' }));
    expect(within(grupos[0]).getByRole('radio', { name: 'A' })).toBeChecked();

    await userEvent.click(guardar);
    expect(await screen.findByText('Se guardaron 2 notas de «Práctica de notas».', {}, ESPERA)).toBeInTheDocument();
    expect(screen.queryByRole('dialog', { name: /^Notas ·/ })).not.toBeInTheDocument();

    // Al volver a abrirla, las notas guardadas están ahí y no queda nada pendiente.
    await userEvent.click(screen.getByRole('button', { name: 'Registrar notas de Práctica de notas' }));
    const reabierto = await screen.findByRole('dialog', { name: 'Notas · Práctica de notas' });
    await within(reabierto).findByRole('list', { name: 'Estudiantes de la sección' }, ESPERA);
    expect(within(reabierto).getByRole('button', { name: 'Guardar notas' })).toBeDisabled();
    expect(within(reabierto).queryByText(/sin guardar/)).not.toBeInTheDocument();
  });

  it('«Notas de competencias» avanza por pasos, una competencia por pantalla, y guarda al final', async () => {
    render(<PaginaEvaluaciones />);
    await esperarPagina();

    await userEvent.click(screen.getByRole('button', { name: 'Registrar notas de competencias' }));
    const dialogo = await screen.findByRole('dialog', { name: 'Notas de competencias' });
    expect(await within(dialogo).findByText(/^Paso 1 de \d/, {}, ESPERA)).toBeInTheDocument();

    // Los cuatro bimestres van como chips: los finalizados se pueden elegir y el que sigue en curso no.
    const bimestres = await within(dialogo).findByRole('radiogroup', { name: 'Bimestre' }, ESPERA);
    expect(within(bimestres).getAllByRole('radio')).toHaveLength(4);
    expect(within(bimestres).getByRole('radio', { name: 'I Bimestre' })).toBeChecked();
    expect(within(bimestres).getByRole('radio', { name: 'IV Bimestre' })).toBeDisabled();
    await userEvent.click(within(bimestres).getByRole('radio', { name: 'II Bimestre' }));
    expect(within(bimestres).getByRole('radio', { name: 'II Bimestre' })).toBeChecked();

    // Sin estudiante elegido no se avanza.
    const siguiente = await within(dialogo).findByRole('button', { name: 'Siguiente' }, ESPERA);
    await waitFor(() => expect(siguiente).toBeEnabled(), ESPERA);
    await userEvent.click(siguiente);
    expect(within(dialogo).getByText('Selecciona el bimestre y el estudiante.')).toBeInTheDocument();

    await userEvent.selectOptions(within(dialogo).getByLabelText('Estudiante'), within(dialogo).getAllByRole('option', { name: /· EST-/ })[0]);
    await userEvent.click(within(dialogo).getByRole('button', { name: 'Siguiente' }));
    expect(await within(dialogo).findByText(/^Paso 2 de \d/, {}, ESPERA)).toBeInTheDocument();

    // Cada competencia pide su nota y su conclusión antes de pasar a la siguiente.
    await userEvent.click(within(dialogo).getByRole('button', { name: /^Siguiente|^Guardar notas/ }));
    expect(within(dialogo).getByText(/la nota debe ser AD, A, B o C\./)).toBeInTheDocument();

    for (let intentos = 0; intentos < 8; intentos += 1) {
      const grupo = within(dialogo).getByRole('radiogroup');
      await userEvent.click(within(grupo).getByRole('radio', { name: 'A' }));
      const conclusion = within(dialogo).getByLabelText('Conclusión descriptiva');
      await userEvent.clear(conclusion);
      await userEvent.type(conclusion, 'Logra lo esperado.');
      const guardar = within(dialogo).queryByRole('button', { name: 'Guardar notas' });
      if (guardar) {
        await userEvent.click(guardar);
        break;
      }
      await userEvent.click(within(dialogo).getByRole('button', { name: 'Siguiente' }));
      await within(dialogo).findByText(/^Paso \d de \d/, {}, ESPERA);
    }

    expect(await screen.findByText('Las notas de competencias y conclusiones se guardaron correctamente.', {}, ESPERA)).toBeInTheDocument();
    expect(screen.queryByRole('dialog', { name: 'Notas de competencias' })).not.toBeInTheDocument();
  });
});
