import { Fragment, useEffect, useMemo, useRef, useState } from 'react';

import Icono from '../../../shared/components/Icono.jsx';
import Insignia from '../../../shared/components/Insignia.jsx';
import Paginacion from '../../../shared/components/Paginacion.jsx';
import DialogoBase from '../../../shared/components/DialogoBase.jsx';
import {
  crearClaveIdempotencia,
  esEstadoTerminal
} from '../../../shared/api/operacionesMasivasService.js';
import { DIAS } from '../constants/horarios.js';
import {
  descargarPlantillaBloques,
  iniciarConfirmacionCargaMasivaAsync,
  previsualizarCargaMasiva
} from '../services/horariosService.js';
import { guardarArchivo } from '../utils/guardarArchivo.js';
import DialogoDescartarCambios from './DialogoDescartarCambios.jsx';
import estilos from './DialogoCargaMasiva.module.css';

const MENSAJE_ERROR_GENERICO = 'Se registró un error inesperado';
const EXTENSIONES = ['.csv', '.xlsx', '.xls'];
const MAXIMO_ARCHIVOS = 10;
const MAXIMO_BYTES = 10 * 1024 * 1024;
// La carga admite hasta 5000 filas; pintarlas todas (~200.000 nodos) vuelve lenta cada edición.
const FILAS_POR_PAGINA = 100;

// Las filas con problemas van primero; el orden se fija al recibir la vista previa y no cambia al editar.
const ORDEN_ESTADO = { ERROR: 0, CONFLICTO: 1, DUPLICADO: 2, EDITADO: 3, VALIDO: 4 };
const ESTADOS_PROBLEMA = ['ERROR', 'CONFLICTO', 'DUPLICADO'];
// Chips del resumen: cada uno filtra la tabla por ese estado.
const FILTROS_ESTADO = [
  { estado: 'ERROR', tono: 'rojo', icono: 'alerta', singular: 'con error', plural: 'con errores' },
  { estado: 'CONFLICTO', tono: 'ambar', icono: 'alerta', singular: 'en conflicto', plural: 'en conflicto' },
  { estado: 'DUPLICADO', tono: 'ambar', icono: 'alerta', singular: 'duplicada', plural: 'duplicadas' },
  { estado: 'EDITADO', tono: 'azul', icono: 'editar', singular: 'editada', plural: 'editadas' },
  { estado: 'VALIDO', tono: 'verde', icono: 'verificar', singular: 'válida', plural: 'válidas' }
];
// Icono de cada estado: la forma, y no solo el color, distingue válido, editado y con problemas.
const ICONO_ESTADO = { VALIDO: 'verificar', EDITADO: 'editar', ERROR: 'alerta', CONFLICTO: 'alerta', DUPLICADO: 'alerta' };
const ETIQUETAS_FASE = {
  VALIDANDO: 'Validando los bloques…',
  GUARDANDO: 'Guardando los bloques…',
  FINALIZANDO: 'Finalizando…'
};
const ESTADOS_CON_ERRORES = ['COMPLETADO_CON_ERRORES', 'FALLIDO', 'CANCELADO'];

// Columnas del archivo (mismas que la plantilla del backend). Con ID se usa el ID; sin él, el nombre o el DNI.
const COLUMNAS_FORMATO = [
  { campo: 'ID Sección', requerido: 'Recomendado', regla: 'ID interno de la sección.', ejemplo: '1' },
  { campo: 'Grado', requerido: 'Si falta el ID', regla: 'Nombre exacto del grado.', ejemplo: '1er Grado de Secundaria' },
  { campo: 'Sección', requerido: 'Si falta el ID', regla: 'Nombre de la sección.', ejemplo: 'A' },
  { campo: 'ID Curso', requerido: 'Recomendado', regla: 'ID interno del curso.', ejemplo: '1' },
  { campo: 'Curso', requerido: 'Si falta el ID', regla: 'Nombre exacto del curso.', ejemplo: 'Matemática' },
  { campo: 'ID Docente', requerido: 'Recomendado', regla: 'ID interno del docente.', ejemplo: '2' },
  { campo: 'DNI Docente', requerido: 'Si falta el ID', regla: 'DNI del docente activo.', ejemplo: '1234567' },
  { campo: 'Docente', requerido: 'No', regla: 'Nombre del docente. Solo informativo.', ejemplo: 'Juan Perez' },
  { campo: 'ID Aula', requerido: 'Recomendado', regla: 'ID interno del aula.', ejemplo: '101' },
  { campo: 'Aula', requerido: 'Si falta el ID', regla: 'Nombre exacto del aula.', ejemplo: 'Aula 101' },
  { campo: 'Día', requerido: 'Sí', regla: 'Lunes, Martes, Miércoles, Jueves o Viernes.', ejemplo: 'LUNES' },
  { campo: 'Hora inicio', requerido: 'Sí', regla: 'Formato HH:mm.', ejemplo: '08:00' },
  { campo: 'Hora fin', requerido: 'Sí', regla: 'Formato HH:mm, posterior a la hora de inicio.', ejemplo: '09:00' }
];

function extensionValida(nombre) {
  const texto = String(nombre ?? '').toLowerCase();
  return EXTENSIONES.some((extension) => texto.endsWith(extension));
}

function claveSeccion(bloque) {
  return `${bloque.gradoNombre ?? ''}|${bloque.seccionNombre ?? ''}`;
}

function etiquetaEstado(estado) {
  return String(estado ?? '').toLowerCase().replace(/_/g, ' ');
}

function capitalizar(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function plural(cantidad, singular, pluralTexto) {
  return `${cantidad} ${cantidad === 1 ? singular : pluralTexto}`;
}

function formatearTamano(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function tieneReferencias(bloque) {
  return bloque.asignacionCursoId != null && bloque.aulaId != null;
}

/** Problemas primero (errores, conflictos, duplicados); dentro de cada grupo se conserva el orden del archivo. */
function ordenarProblemasPrimero(bloques) {
  return bloques
    .map((bloque, indice) => ({ bloque, indice }))
    .sort((a, b) => (
      (ORDEN_ESTADO[a.bloque.estado] ?? 5) - (ORDEN_ESTADO[b.bloque.estado] ?? 5) || a.indice - b.indice
    ))
    .map(({ bloque }) => bloque);
}

/** Por defecto solo se incluyen los bloques válidos: un conflicto haría fallar toda la creación. */
function seleccionInicial(bloques) {
  return Object.fromEntries(bloques.map((bloque) => [
    bloque.previewId,
    bloque.estado === 'VALIDO' && tieneReferencias(bloque)
  ]));
}

function etiquetaFase(job) {
  if (String(job.estado ?? '').toUpperCase() === 'EN_COLA') return 'En cola…';
  return ETIQUETAS_FASE[job.fase] ?? 'Procesando…';
}

/**
 * Carga masiva de horarios desde archivos CSV o Excel. Tiene cuatro vistas: preparar los archivos (plantilla,
 * año académico y archivos), revisar la vista previa (las filas con problemas primero y los chips del resumen como
 * filtros), el avance de la creación y su resultado. La creación es una operación asíncrona que sigue en la página
 * aunque se cierre el diálogo.
 *
 * @param {Object} props
 * @param {Array} props.anios Años académicos disponibles.
 * @param {Array} [props.aulas] Aulas para corregir bloques en la vista previa.
 * @param {number|string} [props.anioIdInicial] Año seleccionado al abrir.
 * @param {() => void} props.alCancelar Cierra el diálogo.
 * @param {Object} props.operacion Seguimiento de la operación masiva (`useOperacionMasiva`).
 */
export default function DialogoCargaMasiva({
  anios,
  aulas = [],
  anioIdInicial,
  alCancelar,
  operacion
}) {
  const [archivos, establecerArchivos] = useState([]);
  const [anioId, establecerAnioId] = useState(
    anioIdInicial == null ? '' : String(anioIdInicial)
  );
  const [vista, establecerVista] = useState('seleccion');
  const [preview, establecerPreview] = useState(null);
  const [incluidos, establecerIncluidos] = useState({});
  const [filtros, establecerFiltros] = useState({ seccion: '', docente: '', estado: '' });
  const [pagina, establecerPagina] = useState(0);
  const [errorGeneral, establecerErrorGeneral] = useState(null);
  const [erroresArchivo, establecerErroresArchivo] = useState([]);
  const [cargandoPreview, establecerCargandoPreview] = useState(false);
  const [errorPlantilla, establecerErrorPlantilla] = useState('');
  const [arrastrando, establecerArrastrando] = useState(false);
  const [confirmandoDescarte, establecerConfirmandoDescarte] = useState(false);
  const claveRef = useRef(null);
  const tablaRef = useRef(null);

  const bloques = preview?.bloques ?? [];
  const job = operacion?.job ?? null;
  const jobTerminado = job ? esEstadoTerminal(job.estado) : false;
  const resultadoConErrores = jobTerminado && (
    job.errores > 0 || ESTADOS_CON_ERRORES.includes(String(job.estado ?? '').toUpperCase())
  );

  // Un resultado de una operación anterior no debe aparecer al abrir el diálogo de nuevo; una operación
  // todavía en curso sí (el diálogo se puede cerrar mientras corre).
  useEffect(() => {
    if (operacion?.job && esEstadoTerminal(operacion.job.estado)) {
      operacion.reiniciar();
    }
    // Solo al abrir.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const opcionesSeccion = useMemo(() => {
    const valores = new Map();
    bloques.forEach((bloque) => {
      const clave = claveSeccion(bloque);
      if (!valores.has(clave)) {
        valores.set(clave, [bloque.gradoNombre, bloque.seccionNombre].filter(Boolean).join(' · '));
      }
    });
    return [...valores.entries()];
  }, [bloques]);

  const opcionesDocente = useMemo(() => {
    const valores = new Map();
    bloques.forEach((bloque) => {
      if (bloque.docenteId != null) {
        valores.set(String(bloque.docenteId), bloque.docenteNombre);
      }
    });
    return [...valores.entries()];
  }, [bloques]);

  const bloquesFiltrados = useMemo(() => {
    return bloques.filter((bloque) => {
      if (filtros.seccion && claveSeccion(bloque) !== filtros.seccion) return false;
      if (filtros.docente && String(bloque.docenteId) !== filtros.docente) return false;
      if (filtros.estado && bloque.estado !== filtros.estado) return false;
      return true;
    });
  }, [bloques, filtros]);

  // Conteos por estado actual (una fila editada deja de contar como conflicto o duplicada).
  const conteos = useMemo(() => {
    const cuenta = {};
    bloques.forEach((bloque) => { cuenta[bloque.estado] = (cuenta[bloque.estado] ?? 0) + 1; });
    return cuenta;
  }, [bloques]);

  // Resumen por archivo: solo se muestra cuando la carga trae varios.
  const resumenArchivos = useMemo(() => {
    const porArchivo = new Map();
    bloques.forEach((bloque) => {
      const actual = porArchivo.get(bloque.archivo) ?? { archivo: bloque.archivo, filas: 0, problemas: 0 };
      actual.filas += 1;
      if (ESTADOS_PROBLEMA.includes(bloque.estado)) actual.problemas += 1;
      porArchivo.set(bloque.archivo, actual);
    });
    return [...porArchivo.values()];
  }, [bloques]);
  const variosArchivos = resumenArchivos.length > 1;
  const columnasTabla = variosArchivos ? 8 : 7;

  // La página solo limita lo que se pinta: filtros, selección y confirmación usan todos los bloques.
  const totalPaginas = Math.max(1, Math.ceil(bloquesFiltrados.length / FILAS_POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas - 1);
  const inicioPagina = paginaActual * FILAS_POR_PAGINA;
  const bloquesPagina = bloquesFiltrados.slice(inicioPagina, inicioPagina + FILAS_POR_PAGINA);

  const seleccionados = bloques.filter((bloque) => incluidos[bloque.previewId]);
  const bloqueSinReferencias = seleccionados.some((bloque) => !tieneReferencias(bloque));
  const tamanoTotal = archivos.reduce((suma, archivo) => suma + (archivo.size ?? 0), 0);

  const hayFiltros = Boolean(filtros.seccion || filtros.docente || filtros.estado);
  // Estado de la casilla "incluir todas": solo cuentan las filas que se pueden incluir (con relación curso-docente).
  const elegiblesFiltradas = bloquesFiltrados.filter(tieneReferencias);
  const incluidasFiltradas = elegiblesFiltradas.filter((bloque) => incluidos[bloque.previewId]).length;
  const todasIncluidas = elegiblesFiltradas.length > 0 && incluidasFiltradas === elegiblesFiltradas.length;
  const algunasIncluidas = incluidasFiltradas > 0 && !todasIncluidas;
  const etiquetaTodas = hayFiltros
    ? `Incluir las ${bloquesFiltrados.length} filas filtradas`
    : `Incluir todas las filas (${bloquesFiltrados.length})`;

  // Hay algo que perder mientras haya archivos o una vista previa que aún no se confirmó.
  const hayCambios = archivos.length > 0 && !job;
  const solicitarCierre = () => (hayCambios ? establecerConfirmandoDescarte(true) : alCancelar());

  // Cada cambio de lo que se enviará es una operación nueva: no debe reutilizar la clave de idempotencia anterior.
  function invalidarClave() {
    claveRef.current = null;
  }

  async function descargarPlantilla(formato) {
    establecerErrorPlantilla('');
    const respuesta = await descargarPlantillaBloques(formato);
    if (!respuesta.exitoso || !(respuesta.datos instanceof Blob)) {
      establecerErrorPlantilla(respuesta.mensaje || 'No se pudo descargar la plantilla.');
      return;
    }
    guardarArchivo(respuesta.datos, `plantilla-horarios.${formato}`);
  }

  function procesarArchivos(lista) {
    establecerPreview(null);
    establecerVista('seleccion');
    establecerErrorGeneral(null);
    invalidarClave();
    operacion?.reiniciar();

    if (lista.length === 0) {
      establecerArchivos([]);
      establecerErroresArchivo([]);
      return;
    }

    const problemas = [];
    if (lista.length > MAXIMO_ARCHIVOS) {
      problemas.push(`Se permiten como máximo ${MAXIMO_ARCHIVOS} archivos por carga.`);
    }
    lista
      .filter((archivo) => !extensionValida(archivo.name))
      .forEach((archivo) => problemas.push(`«${archivo.name}» no es un archivo .csv, .xlsx o .xls.`));
    lista
      .filter((archivo) => archivo.size > MAXIMO_BYTES)
      .forEach((archivo) => problemas.push(`«${archivo.name}» supera los 10 MB.`));

    if (problemas.length > 0) {
      establecerArchivos([]);
      establecerErroresArchivo(problemas);
      return;
    }
    establecerErroresArchivo([]);
    establecerArchivos(lista);
  }

  function elegirArchivos(evento) {
    const elegidos = [...(evento.target.files ?? [])];
    evento.target.value = '';
    procesarArchivos(elegidos);
  }

  function soltarArchivos(evento) {
    evento.preventDefault();
    establecerArrastrando(false);
    if (cargandoPreview || job) return;
    procesarArchivos([...(evento.dataTransfer?.files ?? [])]);
  }

  async function previsualizar() {
    if (archivos.length === 0) {
      establecerErrorGeneral('Selecciona al menos un archivo.');
      return;
    }
    if (!anioId) {
      establecerErrorGeneral('Selecciona el año académico de la carga.');
      return;
    }

    establecerCargandoPreview(true);
    establecerErrorGeneral(null);
    const respuesta = await previsualizarCargaMasiva(archivos, anioId);
    establecerCargandoPreview(false);
    if (!respuesta.exitoso) {
      establecerErrorGeneral(respuesta.mensaje || MENSAJE_ERROR_GENERICO);
      return;
    }

    const ordenados = ordenarProblemasPrimero(respuesta.datos.bloques ?? []);
    establecerPreview({ ...respuesta.datos, bloques: ordenados });
    establecerIncluidos(seleccionInicial(ordenados));
    establecerPagina(0);
    establecerFiltros({ seccion: '', docente: '', estado: '' });
    invalidarClave();
    establecerVista('preview');
  }

  // Un bloque corregido a mano se incluye: quien lo edita quiere que se cree.
  function actualizarBloque(previewId, campo, valor) {
    establecerPreview((actual) => ({
      ...actual,
      bloques: actual.bloques.map((bloque) => (
        bloque.previewId === previewId
          ? { ...bloque, [campo]: valor, estado: 'EDITADO' }
          : bloque
      ))
    }));
    establecerIncluidos((actual) => ({ ...actual, [previewId]: true }));
    invalidarClave();
  }

  function alternarInclusion(previewId, incluir) {
    establecerIncluidos((actual) => ({ ...actual, [previewId]: incluir }));
    invalidarClave();
  }

  function cambiarFiltro(campo, valor) {
    establecerFiltros((actual) => ({ ...actual, [campo]: valor }));
    establecerPagina(0);
  }

  function quitarFiltros() {
    establecerFiltros({ seccion: '', docente: '', estado: '' });
    establecerPagina(0);
  }

  function irAPagina(numero) {
    establecerPagina(numero);
    if (tablaRef.current) tablaRef.current.scrollTop = 0;
  }

  // Incluye o excluye todas las filas que cumplen los filtros actuales (de todas las páginas, no solo la visible).
  function incluirFiltradas(incluir) {
    establecerIncluidos((actual) => {
      const siguiente = { ...actual };
      bloquesFiltrados.forEach((bloque) => {
        if (!incluir) siguiente[bloque.previewId] = false;
        else if (tieneReferencias(bloque)) siguiente[bloque.previewId] = true;
      });
      return siguiente;
    });
    invalidarClave();
  }

  async function confirmar() {
    if (seleccionados.length === 0) {
      establecerErrorGeneral('Incluye al menos un bloque para crear.');
      return;
    }
    if (bloqueSinReferencias) {
      establecerErrorGeneral('Hay bloques incluidos sin relación curso-docente o aula resuelta.');
      return;
    }

    establecerErrorGeneral(null);
    if (!claveRef.current) {
      claveRef.current = crearClaveIdempotencia('carga-horarios');
    }

    const respuesta = await operacion.iniciar(() => (
      iniciarConfirmacionCargaMasivaAsync({
        anioAcademicoId: anioId,
        bloques: seleccionados.map((bloque) => ({
          asignacionCursoId: bloque.asignacionCursoId,
          aulaId: bloque.aulaId,
          diaSemana: bloque.diaSemana,
          horaInicio: bloque.horaInicio,
          horaFin: bloque.horaFin,
          origen: `${bloque.archivo}#${bloque.fila}`
        }))
      }, claveRef.current)
    ));

    if (respuesta && !respuesta.exitoso) {
      establecerErrorGeneral(
        respuesta.mensaje || 'No fue posible iniciar la confirmación de la carga masiva.'
      );
    }
  }

  // Tras un resultado con errores se vuelve a la vista previa, con las ediciones y la selección intactas.
  function corregirEnLaVistaPrevia() {
    invalidarClave();
    establecerErrorGeneral(null);
    operacion?.reiniciar();
  }

  const esPreview = vista === 'preview';
  let vistaActual = vista;
  if (job) vistaActual = jobTerminado ? 'resultado' : 'progreso';

  let textoConfirmar = 'Previsualizar';
  if (vistaActual === 'resultado') {
    textoConfirmar = resultadoConErrores ? 'Corregir en la vista previa' : 'Listo';
  } else if (esPreview) {
    textoConfirmar = seleccionados.length > 0
      ? `Crear ${plural(seleccionados.length, 'bloque', 'bloques')}`
      : 'Crear bloques';
  }

  const enviando = esPreview ? (operacion?.iniciando ?? false) : cargandoPreview;
  let confirmarDeshabilitado = archivos.length === 0;
  if (vistaActual === 'resultado') confirmarDeshabilitado = false;
  else if (esPreview) {
    confirmarDeshabilitado = seleccionados.length === 0 || bloqueSinReferencias || Boolean(operacion?.enCurso);
  }

  // Explica junto a los botones qué falta o qué ocurrirá, para que un botón deshabilitado nunca sea un misterio.
  let notaPie;
  if (cargandoPreview) notaPie = 'Validando archivos…';
  else if (vistaActual === 'progreso') notaPie = 'Creando bloques…';
  else if (vistaActual === 'resultado') {
    notaPie = resultadoConErrores
      ? 'No se creó ningún bloque.'
      : `${plural(job.exitosos ?? 0, 'bloque creado', 'bloques creados')}.`;
  } else if (esPreview) {
    notaPie = bloqueSinReferencias
      ? 'Hay bloques incluidos sin curso-docente o aula resuelta.'
      : `Se crearán ${plural(seleccionados.length, 'bloque', 'bloques')} de ${bloques.length}.`;
  } else if (archivos.length === 0) notaPie = 'Selecciona al menos un archivo para continuar.';
  else if (!anioId) notaPie = 'Selecciona el año académico para continuar.';
  else notaPie = `${plural(archivos.length, 'archivo listo', 'archivos listos')} para previsualizar.`;

  const claseContenido = vistaActual === 'preview'
    ? `${estilos.contenido} ${estilos.contenidoPreview}`
    : estilos.contenido;
  const detalleErrores = Array.isArray(job?.detalleErrores) ? job.detalleErrores : [];

  return (
    <>
      <DialogoBase
        idTitulo="dialogo-carga-masiva-horarios"
        titulo={vistaActual === 'preview' ? 'Previsualizar carga masiva' : 'Carga masiva de horarios'}
        subtitulo={vistaActual === 'preview' ? 'Revisa y corrige los bloques antes de crear' : 'Archivos CSV o Excel'}
        anchoMaximo={vistaActual === 'preview' ? (variosArchivos ? '57.5rem' : '51rem') : '42rem'}
        textoConfirmar={textoConfirmar}
        textoEnviando={esPreview ? 'Creando…' : 'Validando…'}
        textoCancelar={vistaActual === 'progreso' || resultadoConErrores ? 'Cerrar' : 'Cancelar'}
        sinConfirmar={vistaActual === 'progreso'}
        sinCancelar={vistaActual === 'resultado' && !resultadoConErrores}
        enviando={enviando}
        confirmarDeshabilitado={confirmarDeshabilitado}
        notaPie={notaPie}
        error={errorGeneral || operacion?.error || null}
        cerrarAlClicFuera={false}
        alSolicitarCierre={solicitarCierre}
        alCancelar={alCancelar}
        alConfirmar={(evento) => {
          evento.preventDefault();
          if (vistaActual === 'progreso') return;
          if (vistaActual === 'resultado') {
            if (resultadoConErrores) corregirEnLaVistaPrevia();
            else alCancelar();
            return;
          }
          if (esPreview) confirmar();
          else previsualizar();
        }}
      >
        <div className={claseContenido}>
          {vistaActual === 'seleccion' && (
            <>
              <div role="note" className={estilos.info}>
                <Icono nombre="informacion" tamano={18} />
                <div>
                  Cada fila del archivo es un bloque horario: sección, curso, docente, aula, día y horas.
                  Antes de crear nada verás una vista previa donde puedes corregir o excluir filas.
                  Los choques de docente, sección o aula se detectan contra los horarios ya guardados
                  y entre las filas de los archivos.
                </div>
              </div>

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
                    <button type="button" className={estilos.botonSecundario} onClick={() => descargarPlantilla('csv')}>
                      <Icono nombre="archivo" tamano={16} />
                      Plantilla CSV
                    </button>
                    <button type="button" className={estilos.botonSecundario} onClick={() => descargarPlantilla('xlsx')}>
                      <Icono nombre="archivo" tamano={16} />
                      Plantilla Excel
                    </button>
                  </div>
                </section>

                <section className={estilos.paso} aria-labelledby="paso-archivos" aria-busy={cargandoPreview || undefined}>
                  <div className={estilos.cabeceraPaso}>
                    <span className={estilos.numeroPaso} aria-hidden="true">2</span>
                    <div>
                      <h3 id="paso-archivos" className={estilos.tituloPaso}>Elige el año y sube tus archivos</h3>
                      <p className={estilos.ayudaPaso}>
                        CSV o Excel · hasta {MAXIMO_ARCHIVOS} archivos · máx. 5000 filas en total
                      </p>
                    </div>
                  </div>

                  <div className={estilos.campoAnio}>
                    <label htmlFor="carga-masiva-anio" className={estilos.etiqueta}>Año académico</label>
                    <select
                      id="carga-masiva-anio"
                      className={estilos.select}
                      value={anioId}
                      disabled={cargandoPreview}
                      onChange={(evento) => establecerAnioId(evento.target.value)}
                    >
                      <option value="">Seleccionar año...</option>
                      {anios.map((anio) => (
                        <option key={anio.id} value={anio.id}>{anio.anio}</option>
                      ))}
                    </select>
                  </div>

                  <div className={estilos.controlPaso}>
                    <label
                      className={[
                        estilos.zona,
                        archivos.length > 0 ? estilos.zonaConArchivo : '',
                        arrastrando ? estilos.zonaActiva : '',
                        cargandoPreview ? estilos.zonaInactiva : ''
                      ].join(' ')}
                      onDragOver={(evento) => {
                        evento.preventDefault();
                        if (!cargandoPreview) establecerArrastrando(true);
                      }}
                      onDragLeave={() => establecerArrastrando(false)}
                      onDrop={soltarArchivos}
                    >
                      <span className={estilos.iconoZona}>
                        {cargandoPreview
                          ? <Icono nombre="cargando" tamano={20} className={estilos.iconoGirando} />
                          : <Icono nombre={archivos.length > 0 ? 'archivo' : 'subir'} tamano={20} />}
                      </span>
                      <span className={estilos.zonaTexto}>
                        {cargandoPreview ? (
                          <>
                            <span className={estilos.zonaTitulo}>Validando archivos…</span>
                            <span className={estilos.zonaAyuda}>
                              {plural(archivos.length, 'archivo', 'archivos')} · {formatearTamano(tamanoTotal)}
                            </span>
                          </>
                        ) : archivos.length > 0 ? (
                          <>
                            <span className={estilos.nombreArchivo}>
                              {plural(archivos.length, 'archivo seleccionado', 'archivos seleccionados')}
                            </span>
                            <span className={estilos.zonaAyuda}>{formatearTamano(tamanoTotal)}</span>
                          </>
                        ) : (
                          <>
                            <span className={estilos.zonaTitulo}>Seleccionar archivos</span>
                            <span className={estilos.zonaAyuda}>o arrástralos y suéltalos aquí</span>
                          </>
                        )}
                      </span>
                      <input
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        className={estilos.archivo}
                        multiple
                        disabled={cargandoPreview}
                        onChange={elegirArchivos}
                        data-enfoque-inicial=""
                      />
                    </label>
                    {archivos.length > 0 && !cargandoPreview && (
                      <button
                        type="button"
                        className={estilos.botonQuitar}
                        onClick={() => procesarArchivos([])}
                        aria-label="Quitar archivos"
                        title="Quitar archivos"
                      >
                        <Icono nombre="cerrar" tamano={14} />
                      </button>
                    )}
                  </div>

                  {archivos.length > 0 && (
                    <ul className={estilos.listaArchivos} aria-label="Archivos seleccionados">
                      {archivos.map((archivo, indice) => (
                        <li key={`${indice}-${archivo.name}`}>
                          <span className={estilos.nombreArchivo}>{archivo.name}</span>
                          <span className={estilos.zonaAyuda}>{formatearTamano(archivo.size ?? 0)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              </div>

              {errorPlantilla && <p role="alert" className={estilos.errores}>{errorPlantilla}</p>}

              {erroresArchivo.length > 0 && (
                <div role="alert" className={estilos.errores}>
                  <strong>No se pueden usar estos archivos:</strong>
                  <ul>
                    {erroresArchivo.map((error, indice) => <li key={`${indice}-${error}`}>{error}</li>)}
                  </ul>
                </div>
              )}

              <details className={estilos.formato}>
                <summary>Ver formato del archivo</summary>
                <div className={estilos.formatoCuerpo}>
                  <div className={estilos.contenedorFormato}>
                    <table className={`${estilos.tabla} ${estilos.tablaFormato}`}>
                      <caption className={estilos.leyenda}>Columnas del archivo</caption>
                      <thead>
                        <tr>
                          {['Columna', 'Requerido', 'Formato', 'Ejemplo'].map((columna) => (
                            <th key={columna} scope="col">{columna}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {COLUMNAS_FORMATO.map((columna) => (
                          <tr key={columna.campo}>
                            <td data-label="Columna"><code className={estilos.codigo}>{columna.campo}</code></td>
                            <td data-label="Requerido">{columna.requerido}</td>
                            <td data-label="Formato">{columna.regla}</td>
                            <td data-label="Ejemplo" className={estilos.celdaEjemplo}>{columna.ejemplo}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <ul className={estilos.lista}>
                    <li>Los encabezados deben llamarse exactamente así; el orden de las columnas no importa.</li>
                    <li>
                      Incluye los IDs cuando los tengas: si cambia un nombre, el ID sigue siendo válido.
                      Los nombres y el DNI se usan como respaldo si falta el ID.
                    </li>
                    <li>
                      Guarda como CSV UTF-8 (separado por comas o punto y coma) o como Excel; de un Excel se lee la
                      primera hoja. Puedes usar varios archivos, por ejemplo uno por sección o docente.
                    </li>
                  </ul>
                </div>
              </details>

              <p className={estilos.nota}>
                Nada se guarda hasta que confirmes en la vista previa.
              </p>
            </>
          )}

          {vistaActual === 'preview' && (
            <>
              <div role="status" className={estilos.resumen}>
                <div className={estilos.resumenTotal}>
                  <div className={estilos.cifraConCasilla}>
                    <input
                      type="checkbox"
                      className={estilos.casillaTodas}
                      aria-label={etiquetaTodas}
                      title={etiquetaTodas}
                      checked={todasIncluidas}
                      ref={(casilla) => { if (casilla) casilla.indeterminate = algunasIncluidas; }}
                      disabled={elegiblesFiltradas.length === 0}
                      onChange={() => incluirFiltradas(!todasIncluidas)}
                    />
                    <span className={estilos.cifra}>{bloques.length}</span>
                  </div>
                  <span className={estilos.rotuloCifra}>
                    {bloques.length === 1 ? 'fila en los archivos' : 'filas en los archivos'}
                  </span>
                </div>
                <dl className={estilos.grupos}>
                  <div className={estilos.grupo}>
                    <dt className={estilos.etiquetaGrupo}>Estado</dt>
                    <dd className={estilos.chips}>
                      {FILTROS_ESTADO.filter((filtro) => (conteos[filtro.estado] ?? 0) > 0).map((filtro) => (
                        <button
                          key={filtro.estado}
                          type="button"
                          className={estilos.chipFiltro}
                          aria-pressed={filtros.estado === filtro.estado}
                          title="Filtrar la tabla por este estado"
                          onClick={() => cambiarFiltro('estado', filtros.estado === filtro.estado ? '' : filtro.estado)}
                        >
                          <Insignia tono={filtro.tono} className={estilos.insigniaIcono}>
                            <Icono nombre={filtro.icono} tamano={14} />
                            {plural(conteos[filtro.estado], filtro.singular, filtro.plural)}
                          </Insignia>
                        </button>
                      ))}
                    </dd>
                  </div>
                  <div className={estilos.grupo}>
                    <dt className={estilos.etiquetaGrupo}>Selección</dt>
                    <dd className={estilos.chips}>
                      <Insignia tono="azul">
                        {plural(seleccionados.length, 'seleccionada', 'seleccionadas')}
                      </Insignia>
                    </dd>
                  </div>
                  {variosArchivos && (
                    <div className={estilos.grupo}>
                      <dt className={estilos.etiquetaGrupo}>Archivos</dt>
                      <dd className={estilos.chips}>
                        {resumenArchivos.map((resumenArchivo) => (
                          <Insignia
                            key={resumenArchivo.archivo}
                            tono={resumenArchivo.problemas > 0 ? 'ambar' : 'verde'}
                            className={estilos.insigniaArchivo}
                          >
                            <span className={estilos.textoArchivo} title={resumenArchivo.archivo}>
                              {resumenArchivo.archivo}
                            </span>
                            <span>
                              {plural(resumenArchivo.filas, 'fila', 'filas')}
                              {' · '}
                              {resumenArchivo.problemas > 0
                                ? plural(resumenArchivo.problemas, 'con problema', 'con problemas')
                                : 'sin problemas'}
                            </span>
                          </Insignia>
                        ))}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>

              <div className={estilos.filtrosPreview}>
                <label className={estilos.campoFiltro}>
                  Grado y sección
                  <select
                    className={estilos.select}
                    value={filtros.seccion}
                    onChange={(evento) => cambiarFiltro('seccion', evento.target.value)}
                  >
                    <option value="">Todas</option>
                    {opcionesSeccion.map(([valor, etiqueta]) => (
                      <option key={valor} value={valor}>{etiqueta}</option>
                    ))}
                  </select>
                </label>

                <label className={estilos.campoFiltro}>
                  Docente
                  <select
                    className={estilos.select}
                    value={filtros.docente}
                    onChange={(evento) => cambiarFiltro('docente', evento.target.value)}
                  >
                    <option value="">Todos</option>
                    {opcionesDocente.map(([valor, etiqueta]) => (
                      <option key={valor} value={valor}>{etiqueta}</option>
                    ))}
                  </select>
                </label>

              </div>

              {hayFiltros && (
                <p className={estilos.infoFiltro}>
                  Mostrando {bloquesFiltrados.length} de {bloques.length} filas
                  {' · '}
                  <button type="button" className={estilos.enlace} onClick={quitarFiltros}>
                    Quitar filtros
                  </button>
                </p>
              )}

              <div className={estilos.tablaPreviewContenedor} ref={tablaRef}>
                <table className={estilos.tablaPreview}>
                  <thead>
                    <tr>
                      <th scope="col" className={estilos.colIncluir}>
                        <span className={estilos.soloLectores}>Incluir</span>
                      </th>
                      {variosArchivos && <th scope="col" className={estilos.colOrigen}>Origen</th>}
                      <th scope="col" className={estilos.colSeccion}>Grado - sección</th>
                      <th scope="col" className={estilos.colRelacion}>Curso - docente</th>
                      <th scope="col" className={estilos.colDia}>Día</th>
                      <th scope="col" className={estilos.colHorario}>Horario</th>
                      <th scope="col" className={estilos.colAula}>Aula</th>
                      <th scope="col" className={estilos.colEstado}>
                        <span className={estilos.soloLectores}>Estado</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {bloquesPagina.map((bloque) => {
                      const incluido = Boolean(incluidos[bloque.previewId]);
                      const sinReferencias = bloque.asignacionCursoId == null;
                      const conErrores = bloque.errores?.length > 0;
                      const clasesFila = [
                        incluido ? '' : estilos.filaExcluida,
                        conErrores ? estilos.filaConErrores : ''
                      ].join(' ').trim();
                      return (
                        <Fragment key={bloque.previewId}>
                          <tr className={clasesFila || undefined}>
                            <td data-label="Incluir">
                              <input
                                type="checkbox"
                                className={estilos.casilla}
                                checked={incluido}
                                disabled={sinReferencias}
                                aria-label={`Incluir bloque ${bloque.previewId}`}
                                onChange={(evento) => alternarInclusion(bloque.previewId, evento.target.checked)}
                              />
                            </td>
                            {variosArchivos && (
                              <td data-label="Origen" className={estilos.origen}>
                                <div className={estilos.celdaDatos}>
                                  <span className={estilos.archivoNombre} title={bloque.archivo}>{bloque.archivo}</span>
                                  <span className={estilos.archivoFila}>Fila {bloque.fila}</span>
                                </div>
                              </td>
                            )}
                            <td data-label="Grado - sección">
                              <div className={estilos.celdaDatos}>
                                <span className={estilos.celdaPrincipal}>{bloque.gradoNombre}</span>
                                <span className={estilos.celdaSecundaria}>
                                  {bloque.seccionNombre ? `Sección ${bloque.seccionNombre}` : ''}
                                  {!variosArchivos && ` · Fila ${bloque.fila}`}
                                </span>
                              </div>
                            </td>
                            <td data-label="Curso - docente" className={estilos.celdaRelacion}>
                              <div className={estilos.celdaDatos}>
                                <span className={estilos.celdaPrincipal}>{bloque.cursoNombre}</span>
                                <span className={estilos.celdaSecundaria}>{bloque.docenteNombre}</span>
                              </div>
                            </td>
                            <td data-label="Día">
                              <select
                                className={estilos.selectCompacto}
                                aria-label={`Día del bloque ${bloque.previewId}`}
                                value={bloque.diaSemana ?? ''}
                                disabled={sinReferencias}
                                onChange={(evento) => actualizarBloque(bloque.previewId, 'diaSemana', evento.target.value)}
                              >
                                {DIAS.map((dia) => (
                                  <option key={dia.id} value={dia.id}>{dia.etiqueta}</option>
                                ))}
                              </select>
                            </td>
                            <td data-label="Horario">
                              <div className={estilos.celdaHorario}>
                                <input
                                  type="time"
                                  className={`${estilos.selectCompacto} ${estilos.campoHora}`}
                                  aria-label={`Hora de inicio del bloque ${bloque.previewId}`}
                                  value={String(bloque.horaInicio ?? '').slice(0, 5)}
                                  disabled={sinReferencias}
                                  onChange={(evento) => actualizarBloque(bloque.previewId, 'horaInicio', evento.target.value)}
                                />
                                <span aria-hidden="true">–</span>
                                <input
                                  type="time"
                                  className={`${estilos.selectCompacto} ${estilos.campoHora}`}
                                  aria-label={`Hora de fin del bloque ${bloque.previewId}`}
                                  value={String(bloque.horaFin ?? '').slice(0, 5)}
                                  disabled={sinReferencias}
                                  onChange={(evento) => actualizarBloque(bloque.previewId, 'horaFin', evento.target.value)}
                                />
                              </div>
                            </td>
                            <td data-label="Aula">
                              <select
                                className={estilos.selectCompacto}
                                aria-label={`Aula del bloque ${bloque.previewId}`}
                                title={aulas.find((aula) => aula.id === bloque.aulaId)?.nombre}
                                value={bloque.aulaId ?? ''}
                                disabled={sinReferencias}
                                onChange={(evento) => actualizarBloque(bloque.previewId, 'aulaId', Number(evento.target.value))}
                              >
                                {aulas.map((aula) => (
                                  <option key={aula.id} value={aula.id}>{aula.nombre}</option>
                                ))}
                              </select>
                            </td>
                            <td data-label="Estado">
                              <div className={estilos.celdaEstado} title={capitalizar(etiquetaEstado(bloque.estado))}>
                                <span
                                  className={`${estilos.estadoPreview} ${estilos[`estado${bloque.estado}`] ?? ''}`}
                                  aria-hidden="true"
                                >
                                  <Icono nombre={ICONO_ESTADO[bloque.estado] ?? 'informacion'} tamano={14} />
                                </span>
                                {/* El texto va oculto en pantallas anchas (icono + tooltip) y visible en las tarjetas. */}
                                <span className={estilos.textoEstado}>{etiquetaEstado(bloque.estado)}</span>
                              </div>
                            </td>
                          </tr>
                          {conErrores && (
                            <tr className={estilos.filaDetalle}>
                              <td colSpan={columnasTabla}>
                                <ul className={estilos.listaErrores}>
                                  {bloque.errores.map((error, indice) => (
                                    <li key={`${bloque.previewId}-${indice}`}>{error}</li>
                                  ))}
                                </ul>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
                {bloquesFiltrados.length === 0 && (
                  <p className={estilos.nota}>No hay bloques con los filtros seleccionados.</p>
                )}
              </div>

              {bloquesFiltrados.length > FILAS_POR_PAGINA && (
                <Paginacion
                  pagina={paginaActual}
                  totalPaginas={totalPaginas}
                  totalElementos={bloquesFiltrados.length}
                  tamanioPagina={FILAS_POR_PAGINA}
                  cantidadEnPagina={bloquesPagina.length}
                  alCambiarPagina={irAPagina}
                  etiqueta="Paginación de la vista previa"
                  unidadSingular="bloque"
                  unidadPlural="bloques"
                />
              )}
            </>
          )}

          {vistaActual === 'progreso' && (
            <section className={estilos.progreso} aria-label="Progreso de la creación">
              <div className={estilos.progresoTexto}>
                <span className={estilos.zonaTitulo}>
                  {job.procesados ?? 0} de {job.total ?? 0}{' '}
                  {job.fase === 'GUARDANDO' ? 'bloques guardados' : 'bloques procesados'}
                </span>
                <span className={estilos.zonaAyuda}>{etiquetaFase(job)}</span>
              </div>
              <progress
                className={estilos.barra}
                {...(job.total > 0 ? { value: job.procesados ?? 0, max: job.total } : {})}
                aria-label="Avance de la creación"
              />
              <p className={estilos.nota}>
                Puedes cerrar esta ventana: la creación continúa y se te avisará al terminar.
              </p>
            </section>
          )}

          {vistaActual === 'resultado' && (
            <section className={estilos.revision} aria-label="Resultado de la creación">
              <div role={resultadoConErrores ? 'alert' : 'status'} className={estilos.resumen}>
                <div className={estilos.resumenTotal}>
                  <span className={estilos.cifra}>{job.exitosos ?? 0}</span>
                  <span className={estilos.rotuloCifra}>
                    {(job.exitosos ?? 0) === 1 ? 'bloque creado' : 'bloques creados'}
                  </span>
                </div>
                <dl className={estilos.grupos}>
                  <div className={estilos.grupo}>
                    <dt className={estilos.etiquetaGrupo}>Resultado</dt>
                    <dd className={estilos.chips}>
                      {!resultadoConErrores && (
                        <Insignia tono="verde" className={estilos.insigniaIcono}>
                          <Icono nombre="verificar" tamano={14} />
                          Carga completada
                        </Insignia>
                      )}
                      {resultadoConErrores && (
                        <Insignia tono="rojo" className={estilos.insigniaIcono}>
                          <Icono nombre="alerta" tamano={14} />
                          {plural(Math.max(job.errores ?? 0, detalleErrores.length), 'error', 'errores')}
                        </Insignia>
                      )}
                    </dd>
                  </div>
                </dl>
              </div>

              {resultadoConErrores && (
                <>
                  <p className={estilos.nota}>
                    No se creó ningún bloque: la carga es todo o nada. Corrige las filas indicadas en la vista previa
                    y vuelve a crear.
                  </p>
                  {detalleErrores.length > 0 && (
                    <ul className={estilos.erroresResultado} aria-label="Errores de la carga">
                      {detalleErrores.map((detalle, indice) => (
                        <li key={`${indice}-${detalle}`}>{detalle}</li>
                      ))}
                    </ul>
                  )}
                  {(job.errores ?? 0) > detalleErrores.length && (
                    <p className={estilos.nota}>
                      Se muestran los primeros {detalleErrores.length} de {job.errores} errores.
                    </p>
                  )}
                </>
              )}
            </section>
          )}
        </div>
      </DialogoBase>

      {confirmandoDescarte && (
        <DialogoDescartarCambios
          mensaje={esPreview
            ? 'Se perderá la vista previa y los cambios que hayas hecho. No se creará ningún bloque.'
            : 'Se perderán los archivos seleccionados. No se creará ningún bloque.'}
          textoConfirmar="Descartar"
          alCancelar={() => establecerConfirmandoDescarte(false)}
          alConfirmar={alCancelar}
        />
      )}
    </>
  );
}
