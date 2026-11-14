import { afterEach, describe, expect, it, vi } from 'vitest';

import { solicitar, configurarCliente } from './clienteHttp.js';

afterEach(() => {
  vi.unstubAllGlobals();
  configurarCliente();
});

describe('cliente HTTP · errores con detalle', () => {
  it('conserva `datos` cuando el backend responde 4xx con el detalle por fila', async () => {
    const detalle = { filasProcesadas: 2, bloquesCreados: 0, errores: [{ fila: 2, mensaje: 'Aula inexistente' }] };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(
      JSON.stringify({ datos: detalle, error: null }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )));

    const respuesta = await solicitar('/bloques-horario/carga-masiva', { metodo: 'POST' });

    expect(respuesta).toMatchObject({ exitoso: false, datos: detalle, estado: 400 });
  });
});

describe('cliente HTTP · cabeceras adicionales', () => {
  it('envía Idempotency-Key sin reemplazar Authorization ni Content-Type', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response(
      JSON.stringify({ datos: { jobId: 'job-1' }, error: null }),
      { status: 202, headers: { 'Content-Type': 'application/json' } }
    ));
    vi.stubGlobal('fetch', fetch);
    configurarCliente({ obtenerToken: () => 'token-prueba' });

    await solicitar('/compromisos-pago/pension/lote/async', {
      metodo: 'POST',
      cuerpo: { anioId: 2 },
      cabeceras: { 'Idempotency-Key': 'pension-2026-03' }
    });

    expect(fetch.mock.calls[0][1].headers).toMatchObject({
      'Content-Type': 'application/json',
      Authorization: 'Bearer token-prueba',
      'Idempotency-Key': 'pension-2026-03'
    });
  });
});

describe('cliente HTTP · formatos de respuesta exitosa del backend', () => {
  it('extrae el contenido cuando el backend responde con la propiedad datos', async () => {
    const cursos = [{ id: 1, nombre: 'Matemáticas', descripcion: 'Curso' }];
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(
      JSON.stringify({ datos: cursos, error: null }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )));

    const respuesta = await solicitar('/cursos');

    expect(respuesta).toEqual({ exitoso: true, datos: cursos, mensaje: '' });
  });

  it('acepta el objeto raíz usado por el endpoint de login', async () => {
    const login = {
      token: 'jwt-token',
      usuario: { id: 1, nombre: 'Admin', rol: 'ADMINISTRADOR' }
    };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(
      JSON.stringify(login),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )));

    const respuesta = await solicitar('/auth/login', {
      metodo: 'POST',
      cuerpo: {
        identificador: 'admin@example.com',
        password: 'password'
      }
    });

    expect(respuesta).toEqual({ exitoso: true, datos: login, mensaje: '' });
  });

  it('envía multipart sin fijar Content-Type y devuelve archivos como Blob', async () => {
    const archivoCsv = new Blob(['file,fila\n']);
    const formulario = new FormData();
    formulario.append('file', new File(['file,fila\n'], 'horarios.csv'));
    const fetch = vi.fn().mockResolvedValue(new Response(archivoCsv, {
      status: 200,
      headers: { 'Content-Type': 'text/csv' }
    }));
    vi.stubGlobal('fetch', fetch);

    const respuesta = await solicitar('/bloques-horario/carga-masiva', {
      metodo: 'POST',
      cuerpoFormulario: formulario
    });

    expect(fetch.mock.calls[0][1].body).toBe(formulario);
    expect(fetch.mock.calls[0][1].headers).toEqual({});
    expect(respuesta.exitoso).toBe(true);

    fetch.mockResolvedValueOnce(new Response(archivoCsv, { status: 200 }));
    const descarga = await solicitar('/bloques-horario/plantilla-csv', { respuestaArchivo: true });
    expect(descarga.datos).toBeInstanceOf(Blob);
    expect(descarga.datos.size).toBeGreaterThan(0);
  });

  it('quita correctamente el sufijo de una versión de API de varios dígitos', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', fetch);

    await solicitar('/log-errores', { sinVersionApi: true });

    expect(fetch.mock.calls[0][0]).toBe('/api/log-errores');
  });
});

describe('cliente HTTP · 401 con código de invalidación de sesión (docs/planes/login.md §U2)', () => {
  it('expone el código de negocio en la respuesta y lo pasa a alSesionExpirada', async () => {
    const alSesionExpirada = vi.fn();
    configurarCliente({ obtenerToken: () => 'token-vigente', alSesionExpirada });

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(
      JSON.stringify({ error: 'Tu rol fue modificado.', codigo: 'SESION_ROL_MODIFICADO' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    )));

    const respuesta = await solicitar('/administracion/auditorias');

    expect(respuesta.exitoso).toBe(false);
    expect(respuesta.estado).toBe(401);
    expect(respuesta.codigo).toBe('SESION_ROL_MODIFICADO');
    expect(alSesionExpirada).toHaveBeenCalledWith({ estado: 401, codigo: 'SESION_ROL_MODIFICADO' });
  });

  it('pasa codigo: null cuando el backend no envía código de negocio', async () => {
    const alSesionExpirada = vi.fn();
    configurarCliente({ obtenerToken: () => 'token-vigente', alSesionExpirada });

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(
      JSON.stringify({ error: 'Sesión inválida.' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    )));

    const respuesta = await solicitar('/administracion/auditorias');

    expect(respuesta.codigo).toBeNull();
    expect(alSesionExpirada).toHaveBeenCalledWith({ estado: 401, codigo: null });
  });

  it('prioriza el campo message de errores del backend', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(
      JSON.stringify({
        status: 400,
        error: 'Bad Request',
        message: 'El correo electrónico o DNI es obligatorio.'
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )));

    const respuesta = await solicitar('/auth/login', {
      metodo: 'POST',
      cuerpo: { identificador: '', password: 'password' }
    });

    expect(respuesta.mensaje).toBe('El correo electrónico o DNI es obligatorio.');
  });
});

describe('cliente HTTP · consultas GET idénticas en curso', () => {
  /** `fetch` controlable: cada llamada queda pendiente hasta que la prueba la resuelva. */
  function crearFetchPendiente() {
    const pendientes = [];
    const fetch = vi.fn((url, opciones) => new Promise((resolver, rechazar) => {
      pendientes.push({
        url,
        resolver: (cuerpo) => resolver(new Response(JSON.stringify(cuerpo), { status: 200 })),
        senal: opciones.signal
      });
      opciones.signal.addEventListener('abort', () => rechazar(new DOMException('abortado', 'AbortError')));
    }));
    vi.stubGlobal('fetch', fetch);
    return { fetch, pendientes };
  }

  it('comparte una sola petición y entrega a cada llamador su propia copia de los datos', async () => {
    const { fetch, pendientes } = crearFetchPendiente();

    const a = solicitar('/grados');
    const b = solicitar('/grados');
    expect(fetch).toHaveBeenCalledTimes(1);

    pendientes[0].resolver({ datos: [{ id: 1 }] });
    const [respuestaA, respuestaB] = await Promise.all([a, b]);

    expect(respuestaA).toMatchObject({ exitoso: true, datos: [{ id: 1 }] });
    expect(respuestaB.datos).toEqual(respuestaA.datos);
    expect(respuestaB.datos).not.toBe(respuestaA.datos);
  });

  it('no comparte si cambian los parámetros, el token o el método', async () => {
    const { fetch } = crearFetchPendiente();

    solicitar('/matriculas', { parametros: { page: 0 } });
    solicitar('/matriculas', { parametros: { page: 1 } });
    solicitar('/matriculas', { metodo: 'POST', cuerpo: {} });
    solicitar('/matriculas', { metodo: 'POST', cuerpo: {} });

    expect(fetch).toHaveBeenCalledTimes(4);
  });

  it('vuelve a consultar una vez que la anterior terminó', async () => {
    const { fetch, pendientes } = crearFetchPendiente();

    const primera = solicitar('/grados');
    pendientes[0].resolver({ datos: [] });
    await primera;
    const segunda = solicitar('/grados');
    pendientes[1].resolver({ datos: [] });
    await segunda;

    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('si uno cancela, la petición sigue para los demás; si cancelan todos, se aborta', async () => {
    const { pendientes } = crearFetchPendiente();
    const primero = new AbortController();
    const segundo = new AbortController();

    const a = solicitar('/cursos', { signal: primero.signal });
    const b = solicitar('/cursos', { signal: segundo.signal });

    primero.abort();
    expect(await a).toMatchObject({ exitoso: false, cancelada: true });
    expect(pendientes[0].senal.aborted).toBe(false);

    segundo.abort();
    expect(await b).toMatchObject({ exitoso: false, cancelada: true });
    expect(pendientes[0].senal.aborted).toBe(true);
  });

  it('una llamada nueva tras cancelar todas no reutiliza la petición abortada', async () => {
    const { fetch } = crearFetchPendiente();
    const controlador = new AbortController();

    solicitar('/cursos', { signal: controlador.signal });
    controlador.abort();
    solicitar('/cursos');

    expect(fetch).toHaveBeenCalledTimes(2);
  });
});
