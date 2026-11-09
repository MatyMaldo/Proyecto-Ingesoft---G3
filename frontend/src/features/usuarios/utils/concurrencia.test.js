import { describe, expect, it } from 'vitest';
import { ejecutarConConcurrencia } from './concurrencia.js';

const esperar = (ms) => new Promise((resolver) => { setTimeout(resolver, ms); });

describe('ejecutarConConcurrencia', () => {
  it('procesa todos los elementos sin superar el límite de tareas simultáneas', async () => {
    let enCurso = 0;
    let maximo = 0;
    const procesados = [];

    await ejecutarConConcurrencia([1, 2, 3, 4, 5, 6, 7, 8], 3, async (elemento) => {
      enCurso += 1;
      maximo = Math.max(maximo, enCurso);
      await esperar(5);
      procesados.push(elemento);
      enCurso -= 1;
    });

    expect(procesados.sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(maximo).toBe(3);
  });

  it('entrega el índice de cada elemento y arranca las tareas en el orden de la lista', async () => {
    const iniciadas = [];

    await ejecutarConConcurrencia(['a', 'b', 'c'], 2, async (elemento, indice) => {
      iniciadas.push([elemento, indice]);
    });

    expect(iniciadas).toEqual([['a', 0], ['b', 1], ['c', 2]]);
  });

  it('con límite 1 equivale a procesar en serie', async () => {
    let enCurso = 0;
    let maximo = 0;

    await ejecutarConConcurrencia([1, 2, 3], 1, async () => {
      enCurso += 1;
      maximo = Math.max(maximo, enCurso);
      await esperar(2);
      enCurso -= 1;
    });

    expect(maximo).toBe(1);
  });

  it('resuelve de inmediato con una lista vacía', async () => {
    await expect(ejecutarConConcurrencia([], 5, async () => {})).resolves.toBeUndefined();
  });
});
