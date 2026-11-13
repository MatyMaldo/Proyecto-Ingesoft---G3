import { useEffect, useRef, useState } from 'react';
import { USAR_MOCK } from '../../../shared/api/configuracionApi.js';
import {
  consultarOperacionMasiva,
  crearClaveIdempotencia,
  esEstadoTerminal
} from '../../../shared/api/operacionesMasivasService.js';
import Icono from '../../../shared/components/Icono.jsx';
import Insignia from '../../../shared/components/Insignia.jsx';
import Paginacion from '../../../shared/components/Paginacion.jsx';
import DialogoBase from '../../../shared/components/DialogoBase.jsx';
import { ROL_POR_TIPO_REGISTRO, TONO_ROL } from '../constants/rolesUsuario.js';
import { CODIGOS_ESTUDIANTE_HISTORICOS, iniciarCargaMasivaUsuarios } from '../services/usuariosService.js';
import {
  LIMITE_FILAS,
  LIMITE_TAMANO_BYTES,
  describirColumnasCsv,
  descargarPlantillaCsv,
  leerCsv,
  textoProblema,
  validarFilasCsv
} from '../utils/cargaCsv.js';
import { telefonoPeru } from '../utils/telefono.js';
import estilos from './DialogoCargaCsv.module.css';
import DialogoDescartarCambios from './DialogoDescartarCambios.jsx';

// La revisión se pagina: con 8 filas por página la tabla cabe en el diálogo sin desplazarse (las tarjetas de las
// pantallas compactas son más altas, y el archivo puede traer hasta 1000 filas).
const FILAS_POR_PAGINA = 8;
// Consulta del avance de la importación: cada 250 ms durante los primeros segundos (1000 filas se importan en ~2 s y
// con un intervalo mayor la barra saltaba de vacía a llena) y cada segundo si la operación se alarga, para no saturar
// al servidor. Tras varios fallos seguidos se da la consulta por perdida.
const INTERVALO_RAPIDO_MS = 250;
const INTERVALO_CONSULTA_MS = 1000;
const DURACION_INTERVALO_RAPIDO_MS = 5000;
const MAX_FALLOS_CONSULTA = 3;
const ETIQUETA_FASE = Object.freeze({
  VALIDANDO: 'Validando las filas…',
  GUARDANDO: 'Guardando los usuarios…'
});
const COLUMNAS_FORMATO = describirColumnasCsv(USAR_MOCK);

const TIPOS = Object.freeze([
  { valor: 'apoderado', singular: 'apoderado', plural: 'apoderados' },
  { valor: 'docente', singular: 'docente', plural: 'docentes' },
  { valor: 'estudiante', singular: 'estudiante', plural: 'estudiantes' }
]);

function plural(cantidad, singular, pluralTexto) {
  return `${cantidad} ${cantidad === 1 ? singular : pluralTexto}`;
}

function formatearTamano(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** "1 apoderado, 1 docente y 2 estudiantes" a partir de los conteos por tipo (omite los que no tienen filas). */
function describirConteo(conteos) {
  const partes = TIPOS.filter((tipo) => conteos[tipo.valor] > 0)
    .map((tipo) => plural(conteos[tipo.valor], tipo.singular, tipo.plural));
  if (partes.length <= 1) return partes.join('');
  return `${partes.slice(0, -1).join(', ')} y ${partes[partes.length - 1]}`;
}

const esperar = (milisegundos) => new Promise((resolver) => { setTimeout(resolver, milisegundos); });

/** Cede el hilo un instante para que el navegador pinte el estado "Leyendo…" antes de validar un archivo grande. */
const cederHilo = () => new Promise((resolver) => { setTimeout(resolver, 0); });

/**
 * Carga masiva de usuarios desde un CSV (HU-SAT-02). Lee y valida el archivo en el navegador y, al importar, envía
 * todas las filas en una sola petición: el servidor las valida en bloque y las guarda por lotes (apoderados y
 * docentes primero, estudiantes después). Tiene tres vistas: preparar el archivo (con su revisión), el avance de la
 * importación y el resultado por fila. Al terminar, `alRecargar` pide volver a cargar la lista (en modo demostración,
 * `alImportar` recibe la lista completa); `alImportacionCompleta` se llama al cerrar el resultado solo si todas las
 * filas se importaron.
 *
 * @param {Object} props
 * @param {Array} props.usuarios Usuarios ya cargados.
 * @param {(usuarios: Array) => void} props.alImportar Solo en modo demostración: recibe la lista con los nuevos usuarios.
 * @param {() => void} [props.alRecargar] Pide volver a cargar la lista de usuarios desde el servidor.
 * @param {(importados: number) => void} props.alImportacionCompleta
 * @param {() => void} props.alCerrar
 */
export default function DialogoCargaCsv({ usuarios, alImportar, alRecargar, alImportacionCompleta, alCerrar }) {
  const [nombreArchivo, setNombreArchivo] = useState('');
  const [tamanoArchivo, setTamanoArchivo] = useState(0);
  const [leyendo, setLeyendo] = useState(false);
  const [filas, setFilas] = useState([]);
  // Detalle de cada fila del archivo (con sus problemas) y errores que impiden leer el archivo completo.
  const [detalle, setDetalle] = useState([]);
  const [erroresArchivo, setErroresArchivo] = useState([]);
  const [soloErrores, setSoloErrores] = useState(false);
  const [pagina, setPagina] = useState(0);
  // El resultado también se pagina: con 1000 filas, dibujarlas todas de golpe retrasa la pantalla final.
  const [paginaResultado, setPaginaResultado] = useState(0);
  const [soloRechazadas, setSoloRechazadas] = useState(false);
  const [arrastrando, setArrastrando] = useState(false);
  const [progreso, setProgreso] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  // Motivo por el que una importación no pudo completarse (el archivo se conserva para reintentar).
  const [errorImportacion, setErrorImportacion] = useState('');
  // Para dejar de consultar el avance si el diálogo se desmonta, y para no duplicar la importación al reintentar.
  const montadoRef = useRef(true);
  const claveIdempotenciaRef = useRef(null);
  useEffect(() => {
    montadoRef.current = true;
    return () => { montadoRef.current = false; };
  }, []);
  const [confirmandoDescarte, setConfirmandoDescarte] = useState(false);
  // Primer paso: plantilla y archivo. Segundo paso: revisión de las filas antes de importar.
  const [paso, setPaso] = useState('archivo');

  const vista = resultado ? 'resultado' : ocupado ? 'progreso' : 'preparar';

  // Hay algo que perder mientras haya un archivo elegido que aún no se importó.
  const hayCambios = Boolean(nombreArchivo) && !resultado;
  const cerrarDialogo = () => {
    if (resultado && resultado.importados > 0 && resultado.rechazados === 0) {
      alImportacionCompleta(resultado.importados);
    } else {
      alCerrar();
    }
  };
  const solicitarCierre = () => (hayCambios ? setConfirmandoDescarte(true) : cerrarDialogo());

  const filasConErrores = detalle.filter((fila) => fila.problemas.length > 0);
  const hayErroresFilas = filasConErrores.length > 0;
  const filasValidas = detalle.length - filasConErrores.length;
  const conteos = Object.fromEntries(TIPOS.map((tipo) => [tipo.valor, detalle.filter((fila) => fila.tipoUsuario === tipo.valor).length]));

  const procesarArchivo = async (archivo) => {
    setNombreArchivo(archivo?.name ?? '');
    setTamanoArchivo(archivo?.size ?? 0);
    setPaso('archivo');
    setErrorImportacion('');
    claveIdempotenciaRef.current = null;
    setFilas([]);
    setDetalle([]);
    setErroresArchivo([]);
    setSoloErrores(false);
    setPagina(0);
    setPaginaResultado(0);
    setSoloRechazadas(false);
    setResultado(null);
    if (!archivo) return;
    if (!archivo.name.toLowerCase().endsWith('.csv')) {
      setErroresArchivo(['Selecciona un archivo con extensión .csv.']);
      return;
    }
    if (archivo.size > LIMITE_TAMANO_BYTES) {
      setErroresArchivo(['El archivo no debe superar los 2 MB.']);
      return;
    }
    setLeyendo(true);
    try {
      const texto = await archivo.text();
      await cederHilo();
      const leidas = leerCsv(texto);
      if (leidas.length > LIMITE_FILAS) {
        setErroresArchivo([`El archivo tiene ${leidas.length} filas y el máximo es ${LIMITE_FILAS} por carga. Divídelo en varios archivos.`]);
        return;
      }
      const validacion = validarFilasCsv(leidas, usuarios, USAR_MOCK);
      setFilas(validacion.filasOrdenadas);
      setDetalle(validacion.detalleFilas);
      // Con errores, se muestran primero las filas que hay que corregir.
      setSoloErrores(validacion.errores.length > 0);
    } catch (error) {
      setErroresArchivo([error.message || 'No se pudo leer el archivo CSV.']);
    } finally {
      setLeyendo(false);
    }
  };

  const elegirArchivo = async (evento) => {
    const archivo = evento.target.files?.[0];
    evento.target.value = '';
    await procesarArchivo(archivo);
  };

  const soltarArchivo = (evento) => {
    evento.preventDefault();
    setArrastrando(false);
    if (ocupado || leyendo) return;
    procesarArchivo(evento.dataTransfer?.files?.[0]);
  };

  const importar = async (evento) => {
    evento.preventDefault();
    if (resultado) {
      cerrarDialogo();
      return;
    }
    // En el primer paso "Previsualizar" solo avanza a la revisión; no se importa nada todavía.
    if (paso === 'archivo') {
      setPaso('revision');
      return;
    }
    const validacion = validarFilasCsv(filas, usuarios, USAR_MOCK);
    const { errores: erroresValidacion, filasOrdenadas } = validacion;
    if (erroresValidacion.length || !filasOrdenadas.length) {
      setDetalle(validacion.detalleFilas);
      setSoloErrores(erroresValidacion.length > 0);
      setErroresArchivo(filasOrdenadas.length ? [] : ['El archivo no contiene filas para importar.']);
      return;
    }

    setOcupado(true);
    setErrorImportacion('');
    setProgreso({ hechas: 0, total: filasOrdenadas.length, etiqueta: '' });
    const usuariosActuales = [...usuarios];
    const apoderadosPorDni = new Map(usuariosActuales
      .filter((usuario) => usuario.rol === 'Apoderado' && usuario.activo)
      .map((usuario) => [usuario.dni, usuario]));
    const codigosUsados = new Set([
      ...CODIGOS_ESTUDIANTE_HISTORICOS,
      ...usuariosActuales.map((usuario) => usuario.codigoEstudiante).filter(Boolean)
    ].map((codigo) => codigo.replace(/-/g, '').toUpperCase()));
    const baseResultado = (fila) => ({
      linea: fila.linea,
      tipoUsuario: fila.tipoUsuario,
      nombre: [fila.nombre, fila.apellidoPaterno].filter(Boolean).join(' '),
      dni: fila.dni
    });

    // Los códigos de estudiante se reservan antes de enviar nada y en el orden de registro.
    const prefijoCodigo = USAR_MOCK ? 'EST-' : 'EST';
    const codigoPorLinea = new Map();
    for (const fila of filasOrdenadas.filter((candidata) => candidata.tipoUsuario === 'estudiante')) {
      let correlativo = 1;
      let codigo;
      do {
        codigo = `${prefijoCodigo}${String(correlativo).padStart(3, '0')}`;
        correlativo += 1;
      } while (codigosUsados.has(codigo.replace(/-/g, '').toUpperCase()));
      codigosUsados.add(codigo.replace(/-/g, '').toUpperCase());
      codigoPorLinea.set(fila.linea, codigo);
    }

    try {
      if (USAR_MOCK) {
        importarEnMemoria(filasOrdenadas, { usuariosActuales, apoderadosPorDni, codigoPorLinea, baseResultado });
      } else {
        await importarEnLote(filasOrdenadas, { codigoPorLinea, baseResultado });
      }
    } finally {
      setOcupado(false);
      setProgreso(null);
    }
  };

  /** Modo demostración (sin backend): crea los usuarios solo en memoria. */
  const importarEnMemoria = (filasOrdenadas, { usuariosActuales, apoderadosPorDni, codigoPorLinea, baseResultado }) => {
    const resultados = [];
    const creados = [];
    let importados = 0;
    const rechazar = (fila, motivo) => resultados.push({ ...baseResultado(fila), estado: 'rechazado', motivo });

    filasOrdenadas.forEach((fila, indice) => {
      const codigoEstudiante = codigoPorLinea.get(fila.linea);
      const apoderado = fila.tipoUsuario === 'estudiante' ? apoderadosPorDni.get(fila.dniApoderado) : null;
      if (fila.tipoUsuario === 'estudiante' && !apoderado) {
        rechazar(fila, `No se pudo asociar el apoderado ${fila.dniApoderado}.`);
        return;
      }
      const telefono = telefonoPeru(fila.telefono);
      // El mock conserva el formato +51 para mostrarlo.
      const nuevoUsuario = {
        id: `csv-${Date.now()}-${indice}`,
        nombre: fila.nombre,
        apellido: [fila.apellidoPaterno, fila.apellidoMaterno].filter(Boolean).join(' '),
        apellidoPaterno: fila.apellidoPaterno,
        apellidoMaterno: fila.apellidoMaterno,
        dni: fila.dni,
        rol: ROL_POR_TIPO_REGISTRO[fila.tipoUsuario],
        correo: fila.correo,
        activo: true,
        ...(fila.edad ? { edad: Number(fila.edad) } : {}),
        ...(telefono ? { telefono } : {}),
        ...(fila.tipoUsuario === 'estudiante' ? {
          codigoEstudiante,
          fechaNacimiento: fila.fechaNacimiento,
          apoderadoId: apoderado.id
        } : {})
      };
      creados.push(nuevoUsuario);
      if (fila.tipoUsuario === 'apoderado') apoderadosPorDni.set(fila.dni, nuevoUsuario);
      importados += 1;
      resultados.push({
        ...baseResultado(fila),
        estado: 'creado',
        codigo: fila.tipoUsuario === 'estudiante' ? codigoEstudiante : ''
      });
    });

    alImportar([...usuariosActuales, ...creados]);
    setResultado({
      importados,
      rechazados: resultados.length - importados,
      // En el resultado las filas se muestran en el orden del archivo, no en el de registro.
      filas: resultados.sort((a, b) => a.linea - b.linea)
    });
  };

  /**
   * Importación contra el backend: todas las filas viajan en UNA petición (operación masiva asíncrona) y el servidor
   * valida la unicidad en bloque y guarda por lotes. Se consulta su avance hasta que termina y se muestra el
   * desenlace de cada fila. Si no se puede completar, el archivo se conserva para reintentar.
   */
  const importarEnLote = async (filasOrdenadas, { codigoPorLinea, baseResultado }) => {
    claveIdempotenciaRef.current ??= crearClaveIdempotencia('usuarios-lote');
    const inicio = await iniciarCargaMasivaUsuarios(
      filasOrdenadas.map((fila) => ({ ...fila, codigo: codigoPorLinea.get(fila.linea) })),
      claveIdempotenciaRef.current
    );
    if (!inicio.exitoso || !inicio.datos?.jobId) {
      setErrorImportacion(inicio.mensaje || 'No fue posible iniciar la importación.');
      return;
    }

    let job = null;
    let fallos = 0;
    const inicioConsulta = Date.now();
    while (montadoRef.current) {
      await esperar(Date.now() - inicioConsulta < DURACION_INTERVALO_RAPIDO_MS ? INTERVALO_RAPIDO_MS : INTERVALO_CONSULTA_MS);
      const respuesta = await consultarOperacionMasiva(inicio.datos.jobId);
      if (!montadoRef.current) return;
      if (!respuesta.exitoso) {
        fallos += 1;
        if (respuesta.estado === 404 || fallos >= MAX_FALLOS_CONSULTA) {
          setErrorImportacion('Se perdió la conexión con el servidor. Revisa la lista de usuarios antes de volver a intentarlo.');
          alRecargar?.();
          return;
        }
        continue;
      }
      fallos = 0;
      job = respuesta.datos;
      setProgreso({
        hechas: job.procesados ?? 0,
        total: job.total || filasOrdenadas.length,
        etiqueta: ETIQUETA_FASE[job.fase] ?? ''
      });
      if (esEstadoTerminal(job.estado)) break;
    }
    if (!job) return;

    const desenlaces = Array.isArray(job.resultado) ? job.resultado : null;
    if (job.estado === 'FALLIDO' || !desenlaces) {
      // Con la misma clave, reintentar devolvería este mismo trabajo fallido: se pide uno nuevo.
      claveIdempotenciaRef.current = null;
      setErrorImportacion(`${job.detalleErrores?.[0] || 'La importación se interrumpió.'} Revisa la lista de usuarios antes de volver a intentarlo.`);
      alRecargar?.();
      return;
    }

    const porLinea = new Map(desenlaces.map((desenlace) => [desenlace.linea, desenlace]));
    const resultados = filasOrdenadas.map((fila) => {
      const desenlace = porLinea.get(fila.linea);
      return desenlace?.estado === 'CREADO'
        ? { ...baseResultado(fila), estado: 'creado', codigo: desenlace.codigo ?? '' }
        : { ...baseResultado(fila), estado: 'rechazado', motivo: desenlace?.motivo || 'El servidor no informó el resultado de esta fila.' };
    }).sort((a, b) => a.linea - b.linea);
    const importados = resultados.filter((fila) => fila.estado === 'creado').length;

    claveIdempotenciaRef.current = null;
    alRecargar?.();
    setResultado({ importados, rechazados: resultados.length - importados, filas: resultados });
  };

  const reiniciar = () => {
    procesarArchivo(undefined);
  };

  const hayArchivoValido = filas.length > 0 && !hayErroresFilas && erroresArchivo.length === 0;

  // Explica junto a los botones qué falta o qué ocurrirá, para que "Importar" deshabilitado nunca sea un misterio.
  let notaPie;
  if (leyendo) notaPie = 'Leyendo archivo…';
  else if (ocupado) notaPie = 'Importando usuarios…';
  else if (resultado) {
    notaPie = resultado.rechazados > 0
      ? `${plural(resultado.importados, 'usuario creado', 'usuarios creados')} y ${plural(resultado.rechazados, 'fila rechazada', 'filas rechazadas')}.`
      : `${plural(resultado.importados, 'usuario creado', 'usuarios creados')}.`;
  } else if (!nombreArchivo) notaPie = 'Selecciona un archivo CSV para continuar.';
  else if (erroresArchivo.length > 0) notaPie = 'Corrige el archivo y vuelve a seleccionarlo.';
  else if (paso === 'archivo' && filas.length > 0) notaPie = `${plural(filas.length, 'fila leída', 'filas leídas')}. Revísalas antes de importar.`;
  else if (hayErroresFilas) notaPie = `Corrige ${plural(filasConErrores.length, 'fila con errores', 'filas con errores')} para continuar.`;
  else if (hayArchivoValido) notaPie = `Se crearán ${describirConteo(conteos)}.`;

  const filasFiltradas = soloErrores ? filasConErrores : detalle;
  const totalPaginas = Math.max(1, Math.ceil(filasFiltradas.length / FILAS_POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas - 1);
  const inicioPagina = paginaActual * FILAS_POR_PAGINA;
  const filasVisibles = filasFiltradas.slice(inicioPagina, inicioPagina + FILAS_POR_PAGINA);
  const hayCodigos = resultado?.filas.some((fila) => fila.codigo) ?? false;
  const filasResultado = soloRechazadas
    ? (resultado?.filas ?? []).filter((fila) => fila.estado === 'rechazado')
    : (resultado?.filas ?? []);
  const totalPaginasResultado = Math.max(1, Math.ceil(filasResultado.length / FILAS_POR_PAGINA));
  const paginaResultadoActual = Math.min(paginaResultado, totalPaginasResultado - 1);
  const inicioPaginaResultado = paginaResultadoActual * FILAS_POR_PAGINA;
  const filasResultadoVisibles = filasResultado.slice(inicioPaginaResultado, inicioPaginaResultado + FILAS_POR_PAGINA);

  return (
    <>
      <DialogoBase
        idTitulo="dialogo-carga-csv"
        titulo={vista === 'preparar' && paso === 'revision' ? 'Previsualizar carga masiva' : 'Carga masiva de usuarios'}
        subtitulo={vista === 'preparar' && paso === 'revision' ? 'Revisa las filas antes de importar' : 'Archivo CSV'}
        textoConfirmar={resultado
          ? 'Listo'
          : (paso === 'archivo'
            ? 'Previsualizar'
            : (filas.length ? `Importar ${plural(filas.length, 'usuario', 'usuarios')}` : 'Importar usuarios'))}
        textoEnviando="Importando..."
        sinCancelar={Boolean(resultado)}
        enviando={ocupado}
        confirmarDeshabilitado={!resultado && (paso === 'archivo'
          ? (!filas.length || erroresArchivo.length > 0 || leyendo)
          : (!filas.length || hayErroresFilas || erroresArchivo.length > 0 || leyendo))}
        notaPie={notaPie}
        error={errorImportacion || null}
        // La previsualización (segundo paso) tiene el mismo ancho que la de la carga masiva de horarios.
        anchoMaximo={vista === 'preparar' && paso === 'revision' ? '51rem' : '42rem'}
        cerrarAlClicFuera={false}
        alSolicitarCierre={solicitarCierre}
        alCancelar={alCerrar}
        alConfirmar={importar}
      >
        <div className={vista === 'preparar' && paso === 'revision' ? `${estilos.contenido} ${estilos.contenidoRevision}` : estilos.contenido}>
          {vista === 'preparar' && (
            <>
              {paso === 'archivo' && (
                <div role="note" className={estilos.info}>
                  <Icono nombre="informacion" tamano={18} />
                  <div>
                    Cada estudiante necesita el DNI de un apoderado ya registrado o incluido en este mismo archivo. El orden de las filas
                    no importa: se registran primero los apoderados, luego los docentes y al final los estudiantes.
                    El archivo no lleva contraseñas: cada usuario recibirá un código de verificación en su correo para crear la suya.
                    Cada fila se registra por separado: si una falla, las demás continúan y los usuarios ya creados no se revierten.
                  </div>
                </div>
              )}

              {paso === 'archivo' && (
                <div className={estilos.pasos}>
                  <section className={estilos.paso} aria-labelledby="paso-plantilla">
                    <div className={estilos.cabeceraPaso}>
                      <span className={estilos.numeroPaso} aria-hidden="true">1</span>
                      <div>
                        <h3 id="paso-plantilla" className={estilos.tituloPaso}>Descarga la plantilla</h3>
                        <p className={estilos.ayudaPaso}>Trae los encabezados ya listos.</p>
                      </div>
                    </div>
                    <div className={estilos.controlPaso}>
                      <button type="button" className={estilos.botonSecundario} onClick={descargarPlantillaCsv}>
                        <Icono nombre="archivo" tamano={16} />
                        Descargar plantilla CSV
                      </button>
                    </div>
                  </section>
  
                  <section className={estilos.paso} aria-labelledby="paso-archivo" aria-busy={leyendo || undefined}>
                    <div className={estilos.cabeceraPaso}>
                      <span className={estilos.numeroPaso} aria-hidden="true">2</span>
                      <div>
                        <h3 id="paso-archivo" className={estilos.tituloPaso}>Sube tu archivo</h3>
                        <p className={estilos.ayudaPaso}>CSV UTF-8 · máx. 2 MB · {LIMITE_FILAS} filas</p>
                      </div>
                    </div>
                    <div className={estilos.controlPaso}>
                      <label
                        className={[
                          estilos.zona,
                          nombreArchivo ? estilos.zonaConArchivo : '',
                          arrastrando ? estilos.zonaActiva : '',
                          ocupado || leyendo ? estilos.zonaInactiva : ''
                        ].join(' ')}
                        onDragOver={(evento) => { evento.preventDefault(); if (!ocupado && !leyendo) setArrastrando(true); }}
                        onDragLeave={() => setArrastrando(false)}
                        onDrop={soltarArchivo}
                      >
                        <span className={estilos.iconoZona}>
                          {leyendo
                            ? <Icono nombre="cargando" tamano={20} className={estilos.iconoGirando} />
                            : <Icono nombre={nombreArchivo ? 'archivo' : 'subir'} tamano={20} />}
                        </span>
                        <span className={estilos.zonaTexto}>
                          {leyendo ? (
                            <>
                              <span className={estilos.zonaTitulo}>Leyendo archivo…</span>
                              <span className={estilos.zonaAyuda}>{nombreArchivo} · {formatearTamano(tamanoArchivo)}</span>
                            </>
                          ) : nombreArchivo ? (
                            <>
                              <span className={estilos.nombreArchivo}>{nombreArchivo}</span>
                              <span className={estilos.zonaAyuda}>
                                {formatearTamano(tamanoArchivo)}
                                {detalle.length > 0 ? ` · ${plural(detalle.length, 'fila', 'filas')}` : ''}
                              </span>
                            </>
                          ) : (
                            <>
                              <span className={estilos.zonaTitulo}>Seleccionar archivo CSV</span>
                              <span className={estilos.zonaAyuda}>o arrástralo y suéltalo aquí</span>
                            </>
                          )}
                        </span>
                        <input
                          type="file"
                          accept=".csv,text/csv"
                          className={estilos.archivo}
                          onChange={elegirArchivo}
                          disabled={ocupado || leyendo}
                          data-enfoque-inicial=""
                        />
                      </label>
                      {nombreArchivo && !leyendo && (
                        <button type="button" className={estilos.botonQuitar} onClick={reiniciar} aria-label="Quitar archivo" title="Quitar archivo">
                          <Icono nombre="cerrar" tamano={14} />
                        </button>
                      )}
                    </div>
                  </section>
                </div>
              )}

              {paso === 'archivo' && erroresArchivo.length > 0 && (
                <div role="alert" className={estilos.errores}>
                  <strong>No se puede usar este archivo:</strong>
                  <ul>
                    {erroresArchivo.map((error, indice) => <li key={`${indice}-${error}`}>{error}</li>)}
                  </ul>
                </div>
              )}

              {paso === 'revision' && detalle.length > 0 && (
                <section className={estilos.revision} aria-label="Revisión del archivo">
                  <div role="status" className={estilos.resumen}>
                    <div className={estilos.resumenTotal}>
                      <span className={estilos.cifra}>{detalle.length}</span>
                      <span className={estilos.rotuloCifra}>{detalle.length === 1 ? 'fila en el archivo' : 'filas en el archivo'}</span>
                    </div>
                    <dl className={estilos.grupos}>
                      <div className={estilos.grupo}>
                        <dt className={estilos.etiquetaGrupo}>Por tipo</dt>
                        <dd className={estilos.chips}>
                          {TIPOS.filter((tipo) => conteos[tipo.valor] > 0).map((tipo) => (
                            <Insignia key={tipo.valor} tono={TONO_ROL[ROL_POR_TIPO_REGISTRO[tipo.valor]]}>
                              {plural(conteos[tipo.valor], tipo.singular, tipo.plural)}
                            </Insignia>
                          ))}
                        </dd>
                      </div>
                      <div className={estilos.grupo}>
                        <dt className={estilos.etiquetaGrupo}>Estado</dt>
                        <dd className={estilos.chips}>
                          {filasValidas > 0 && (
                            <Insignia tono="verde" className={estilos.insigniaIcono}>
                              <Icono nombre="verificar" tamano={14} />
                              {plural(filasValidas, 'válida', 'válidas')}
                            </Insignia>
                          )}
                          {hayErroresFilas && (
                            <button
                              type="button"
                              className={estilos.chipFiltro}
                              aria-pressed={soloErrores}
                              title={soloErrores ? 'Mostrar todas las filas' : 'Mostrar solo las filas con errores'}
                              onClick={() => { setSoloErrores(!soloErrores); setPagina(0); }}
                            >
                              <Insignia tono="rojo" className={estilos.insigniaIcono}>
                                <Icono nombre="alerta" tamano={14} />
                                {plural(filasConErrores.length, 'con error', 'con errores')}
                              </Insignia>
                            </button>
                          )}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div className={estilos.vistaPrevia}>
                    <div className={estilos.desplazable}>
                      <table className={estilos.tabla}>
                        <caption className={estilos.leyenda}>Revisión de las filas del archivo</caption>
                        <thead>
                          <tr>
                            {['Fila', 'Tipo', 'Nombre', 'DNI', 'DNI del apoderado', 'Estado'].map((columna) => <th key={columna} scope="col">{columna}</th>)}
                          </tr>
                        </thead>
                        <tbody>
                          {filasVisibles.map((fila) => (
                            <FilaRevision key={fila.linea} fila={fila} conErrores={fila.problemas.length > 0} />
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {filasFiltradas.length > FILAS_POR_PAGINA && (
                    <Paginacion
                      pagina={paginaActual}
                      totalPaginas={totalPaginas}
                      totalElementos={filasFiltradas.length}
                      tamanioPagina={FILAS_POR_PAGINA}
                      cantidadEnPagina={filasVisibles.length}
                      alCambiarPagina={setPagina}
                      etiqueta="Paginación de la revisión"
                      unidadSingular="fila"
                      unidadPlural="filas"
                    />
                  )}
                </section>
              )}

              {paso === 'archivo' && (
                <details className={estilos.formato}>
                  <summary>Ver formato del archivo</summary>
                  <div className={estilos.formatoCuerpo}>
                    <div className={estilos.contenedorFormato}>
                      <table className={`${estilos.tabla} ${estilos.tablaFormato}`}>
                        <caption className={estilos.leyenda}>Columnas del archivo CSV</caption>
                        <thead>
                          <tr>
                            {['Columna', 'Requerido', 'Formato', 'Ejemplo'].map((columna) => <th key={columna} scope="col">{columna}</th>)}
                          </tr>
                        </thead>
                        <tbody>
                          {COLUMNAS_FORMATO.map((columna) => (
                            <tr key={columna.campo}>
                              <td data-label="Columna"><code className={estilos.codigo}>{columna.campo}</code></td>
                              <td data-label="Requerido">{columna.obligatorio}</td>
                              <td data-label="Formato">{columna.regla}</td>
                              <td data-label="Ejemplo" className={estilos.celdaEjemplo}>{columna.ejemplo}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <ul className={estilos.lista}>
                      <li>Los encabezados deben llamarse exactamente así; el orden de las columnas no importa.</li>
                      <li>Guarda el archivo como CSV UTF-8 (separado por comas o punto y coma). Los códigos de estudiante se generan automáticamente.</li>
                    </ul>
                  </div>
                </details>
              )}

              {paso === 'archivo' && (
                <p className={estilos.nota}>Todavía no se crea ningún usuario: primero revisarás las filas del archivo.</p>
              )}
            </>
          )}

          {vista === 'progreso' && progreso && (
            <section className={estilos.progreso} aria-label="Progreso de la importación">
              <div className={estilos.progresoTexto}>
                <span className={estilos.zonaTitulo}>
                  {progreso.hechas} de {progreso.total} usuarios procesados
                </span>
                <span className={estilos.zonaAyuda}>{progreso.etiqueta}</span>
              </div>
              {/* Sin `value` la barra es indeterminada: mientras el servidor valida aún no hay filas procesadas. */}
              <progress
                className={estilos.barra}
                {...(progreso.hechas > 0 ? { value: progreso.hechas, max: progreso.total } : {})}
                aria-label="Avance de la importación"
              />
              <p className={estilos.nota}>Esto puede tardar unos minutos. No cierres esta ventana hasta que termine.</p>
            </section>
          )}

          {vista === 'resultado' && (
            <section className={estilos.revision} aria-label="Resultado de la importación">
              <div role={resultado.rechazados > 0 ? 'alert' : 'status'} className={estilos.resumen}>
                <div className={estilos.resumenTotal}>
                  <span className={estilos.cifra}>{resultado.importados}</span>
                  <span className={estilos.rotuloCifra}>{resultado.importados === 1 ? 'usuario creado' : 'usuarios creados'}</span>
                </div>
                <dl className={estilos.grupos}>
                  <div className={estilos.grupo}>
                    <dt className={estilos.etiquetaGrupo}>Resultado</dt>
                    <dd className={estilos.chips}>
                      <Insignia tono="verde" className={estilos.insigniaIcono}>
                        <Icono nombre="verificar" tamano={14} />
                        {plural(resultado.importados, 'creada', 'creadas')}
                      </Insignia>
                      {resultado.rechazados > 0 && (
                        <button
                          type="button"
                          className={estilos.chipFiltro}
                          aria-pressed={soloRechazadas}
                          title={soloRechazadas ? 'Mostrar todas las filas' : 'Mostrar solo las filas rechazadas'}
                          onClick={() => { setSoloRechazadas(!soloRechazadas); setPaginaResultado(0); }}
                        >
                          <Insignia tono="rojo" className={estilos.insigniaIcono}>
                            <Icono nombre="alerta" tamano={14} />
                            {plural(resultado.rechazados, 'rechazada', 'rechazadas')}
                          </Insignia>
                        </button>
                      )}
                    </dd>
                  </div>
                </dl>
              </div>

              {resultado.rechazados > 0 && (
                <p className={estilos.nota}>
                  Los usuarios creados no se revierten. Corrige las filas rechazadas en un archivo nuevo y vuelve a cargarlo.
                </p>
              )}

              <div className={estilos.vistaPrevia}>
                <div className={estilos.desplazable}>
                  <table className={estilos.tabla}>
                    <caption className={estilos.leyenda}>Resultado por fila</caption>
                    <thead>
                      <tr>
                        {['Fila', 'Tipo', 'Nombre', 'DNI', ...(hayCodigos ? ['Código'] : []), 'Resultado'].map((columna) => <th key={columna} scope="col">{columna}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {filasResultadoVisibles.map((fila) => (
                        <FilaResultado key={fila.linea} fila={fila} hayCodigos={hayCodigos} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {filasResultado.length > FILAS_POR_PAGINA && (
                <Paginacion
                  pagina={paginaResultadoActual}
                  totalPaginas={totalPaginasResultado}
                  totalElementos={filasResultado.length}
                  tamanioPagina={FILAS_POR_PAGINA}
                  cantidadEnPagina={filasResultadoVisibles.length}
                  alCambiarPagina={setPaginaResultado}
                  etiqueta="Paginación del resultado"
                  unidadSingular="fila"
                  unidadPlural="filas"
                />
              )}

              <div className={estilos.accionesResultado}>
                <button type="button" className={estilos.botonSecundario} onClick={reiniciar}>
                  <Icono nombre="subir" tamano={16} />
                  Cargar otro archivo
                </button>
              </div>
            </section>
          )}
        </div>
      </DialogoBase>
      {confirmandoDescarte && (
        <DialogoDescartarCambios
          titulo="¿Descartar la importación?"
          mensaje={`Se perderá el archivo «${nombreArchivo}» y su revisión. No se creará ningún usuario.`}
          textoSeguir="Seguir con la carga"
          alDescartar={alCerrar}
          alSeguirEditando={() => setConfirmandoDescarte(false)}
        />
      )}
    </>
  );
}

/** Fila de la revisión: datos básicos y estado; si tiene problemas, los lista debajo con el campo afectado. */
function FilaRevision({ fila, conErrores }) {
  const rol = fila.tipoUsuario ? ROL_POR_TIPO_REGISTRO[fila.tipoUsuario] : null;
  return (
    <>
      <tr className={conErrores ? estilos.filaConErrores : undefined}>
        <td data-label="Fila">{fila.linea}</td>
        <td data-label="Tipo">{rol ? <Insignia tono={TONO_ROL[rol]}>{rol}</Insignia> : '—'}</td>
        <td data-label="Nombre">{fila.nombre || '—'}</td>
        <td data-label="DNI">{fila.dni || '—'}</td>
        <td data-label="DNI del apoderado">{fila.dniApoderado || '—'}</td>
        <td data-label="Estado">
          {conErrores ? (
            <Insignia tono="rojo" className={estilos.insigniaIcono}>
              <Icono nombre="alerta" tamano={14} />
              {fila.problemas.length === 1 ? '1 error' : `${fila.problemas.length} errores`}
            </Insignia>
          ) : (
            <Insignia tono="verde" className={estilos.insigniaIcono}>
              <Icono nombre="verificar" tamano={14} />
              Válida
            </Insignia>
          )}
        </td>
      </tr>
      {conErrores && (
        <tr className={estilos.filaProblemas}>
          <td colSpan={6}>
            <ul className={estilos.problemas} aria-label={`Errores de la fila ${fila.linea}`}>
              {fila.problemas.map((problema) => <li key={textoProblema(problema)}>{textoProblema(problema)}</li>)}
            </ul>
          </td>
        </tr>
      )}
    </>
  );
}

/** Fila del resultado: si se creó (con el código de estudiante generado) o se rechazó (con el motivo). */
function FilaResultado({ fila, hayCodigos }) {
  const rol = ROL_POR_TIPO_REGISTRO[fila.tipoUsuario];
  const rechazada = fila.estado === 'rechazado';
  return (
    <>
      <tr className={rechazada ? estilos.filaConErrores : undefined}>
        <td data-label="Fila">{fila.linea}</td>
        <td data-label="Tipo"><Insignia tono={TONO_ROL[rol]}>{rol}</Insignia></td>
        <td data-label="Nombre">{fila.nombre || '—'}</td>
        <td data-label="DNI">{fila.dni || '—'}</td>
        {hayCodigos && <td data-label="Código">{fila.codigo || '—'}</td>}
        <td data-label="Resultado">
          {rechazada ? (
            <Insignia tono="rojo" className={estilos.insigniaIcono}>
              <Icono nombre="alerta" tamano={14} />
              Rechazada
            </Insignia>
          ) : (
            <Insignia tono="verde" className={estilos.insigniaIcono}>
              <Icono nombre="verificar" tamano={14} />
              Creada
            </Insignia>
          )}
        </td>
      </tr>
      {rechazada && (
        <tr className={estilos.filaProblemas}>
          <td colSpan={hayCodigos ? 6 : 5}>
            <ul className={estilos.problemas} aria-label={`Motivo del rechazo de la fila ${fila.linea}`}>
              <li>{fila.motivo}</li>
            </ul>
          </td>
        </tr>
      )}
    </>
  );
}
