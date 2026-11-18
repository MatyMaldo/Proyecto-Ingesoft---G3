import { Fragment, useEffect, useMemo, useRef, useState } from 'react';

import DialogoBase from '../../../shared/components/DialogoBase.jsx';
import DialogoDescartarImportacion from '../../../shared/components/DialogoDescartarImportacion.jsx';
import Icono from '../../../shared/components/Icono.jsx';
import Insignia from '../../../shared/components/Insignia.jsx';
import Paginacion from '../../../shared/components/Paginacion.jsx';
import {
  confirmarCargaMasivaMatriculas,
  descargarPlantillaMatriculas,
  exportarMatriculas,
  previsualizarCargaMasivaMatriculas
} from '../services/matriculasService.js';
import { guardarArchivo } from '../../horarios/utils/guardarArchivo.js';
import estilos from './DialogoCargaMasivaMatriculas.module.css';

const EXTENSIONES = ['.csv', '.xlsx'];
const MAXIMO_BYTES = 10 * 1024 * 1024;
// Pintar miles de filas a la vez vuelve lenta cada edición; el filtro y la selección usan todas.
const FILAS_POR_PAGINA = 100;

// Las filas con problemas van primero; el orden se fija al recibir la vista previa.
const ORDEN_ESTADO = { ERROR: 0, CONFLICTO: 1, DUPLICADO: 2, EDITADO: 3, VALIDO: 4 };
const FILTROS_ESTADO = [
  { estado: 'ERROR', tono: 'rojo', icono: 'alerta', singular: 'con error', plural: 'con errores' },
  { estado: 'CONFLICTO', tono: 'ambar', icono: 'alerta', singular: 'en conflicto', plural: 'en conflicto' },
  { estado: 'DUPLICADO', tono: 'ambar', icono: 'alerta', singular: 'duplicada', plural: 'duplicadas' },
  { estado: 'EDITADO', tono: 'azul', icono: 'editar', singular: 'editada', plural: 'editadas' },
  { estado: 'VALIDO', tono: 'verde', icono: 'verificar', singular: 'válida', plural: 'válidas' }
];
const ICONO_ESTADO = {
  VALIDO: 'verificar',
  EDITADO: 'editar',
  ERROR: 'alerta',
  CONFLICTO: 'alerta',
  DUPLICADO: 'alerta'
};
const ETIQUETA_ESTADO = {
  VALIDO: 'Válida',
  EDITADO: 'Editada',
  ERROR: 'Error',
  CONFLICTO: 'Conflicto',
  DUPLICADO: 'Duplicada'
};

// Columnas de la plantilla del backend. El año del archivo es informativo.
const COLUMNAS_FORMATO = [
  { campo: 'DNI', requerido: 'Sí', regla: 'DNI del estudiante activo. Basta con DNI o código.', ejemplo: '74852136' },
  { campo: 'Código', requerido: 'No', regla: 'Código del estudiante. Si viene, debe coincidir con el DNI.', ejemplo: 'EST-001' },
  { campo: 'Año', requerido: 'No', regla: 'Informativo. La carga usa el año destino.', ejemplo: '2027' },
  { campo: 'Grado', requerido: 'Sí', regla: 'Nombre exacto del grado.', ejemplo: '1er Grado de Secundaria' },
  { campo: 'Sección', requerido: 'Sí', regla: 'Nombre de la sección del mismo año.', ejemplo: 'B' }
];

function extensionValida(nombre) {
  const texto = String(nombre ?? '').toLowerCase();
  return EXTENSIONES.some((extension) => texto.endsWith(extension));
}

function formatearTamano(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function plural(cantidad, singular, pluralTexto) {
  return `${cantidad} ${cantidad === 1 ? singular : pluralTexto}`;
}

function normalizarTexto(texto) {
  return String(texto ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/** Problemas primero (errores, conflictos, duplicados); dentro de cada grupo se conserva el orden del archivo. */
function ordenarProblemasPrimero(filas) {
  return filas
    .map((fila, indice) => ({ fila, indice }))
    .sort((a, b) => (
      (ORDEN_ESTADO[a.fila.estado] ?? 5) - (ORDEN_ESTADO[b.fila.estado] ?? 5) || a.indice - b.indice
    ))
    .map(({ fila }) => fila);
}

/** Por defecto solo se incluyen las filas válidas: las demás requieren corrección o exclusión. */
function seleccionInicial(filas) {
  return Object.fromEntries(filas.map((fila) => [
    fila.previewId,
    fila.estado === 'VALIDO' && fila.gradoId != null && fila.seccionId != null
  ]));
}

function datosOrigen(origen) {
  const texto = String(origen ?? '');
  const separador = texto.lastIndexOf('#');
  if (separador < 0) return { archivo: texto, fila: null };
  return { archivo: texto.slice(0, separador), fila: texto.slice(separador + 1) };
}

function filaCompleta(fila) {
  return fila.gradoId != null && fila.seccionId != null;
}

/**
 * Carga masiva de matrículas desde CSV o Excel. Primero se descarga la plantilla y se elige
 * el año destino; después se revisa una vista previa editable con resumen, filtros y
 * paginación antes de crear las matrículas en una sola operación transaccional.
 */
export default function DialogoCargaMasivaMatriculas({
  anios = [],
  grados = [],
  anioIdInicial,
  alCerrar,
  alCompletar
}) {
  const [anioId, establecerAnioId] = useState(
    anioIdInicial != null ? String(anioIdInicial) : ''
  );
  const [archivo, establecerArchivo] = useState(null);
  const [vista, establecerVista] = useState('seleccion');
  const [filas, establecerFilas] = useState([]);
  const [seleccion, establecerSeleccion] = useState({});
  const [secciones, establecerSecciones] = useState([]);
  const [filtros, establecerFiltros] = useState({ estado: '', gradoId: '', busqueda: '' });
  const [pagina, establecerPagina] = useState(0);
  const [error, establecerError] = useState(null);
  const [erroresArchivo, establecerErroresArchivo] = useState([]);
  const [erroresConfirmacion, establecerErroresConfirmacion] = useState([]);
  const [procesando, establecerProcesando] = useState(false);
  const [arrastrando, establecerArrastrando] = useState(false);
  // Qué pidió el usuario al descartar: `'atras'` (botón Atrás, vuelve al paso 1) o `'cerrar'` (X o Esc, cierra todo).
  const [confirmandoDescarte, establecerConfirmandoDescarte] = useState(null);
  const tablaRef = useRef(null);
  const refErrores = useRef(null);

  const esPreview = vista === 'preview';

  useEffect(() => {
    if (erroresConfirmacion.length > 0) {
      refErrores.current?.scrollIntoView?.({ block: 'nearest' });
    }
  }, [erroresConfirmacion]);

  const seccionesPorGrado = useMemo(() => {
    const mapa = new Map();
    secciones.forEach((seccion) => {
      const clave = String(seccion.gradoId);
      if (!mapa.has(clave)) mapa.set(clave, []);
      mapa.get(clave).push(seccion);
    });
    return mapa;
  }, [secciones]);

  const gradosEnArchivo = useMemo(() => {
    const mapa = new Map();
    filas.forEach((fila) => {
      if (fila.gradoId != null) {
        mapa.set(String(fila.gradoId), fila.gradoNombre ?? `Grado ${fila.gradoId}`);
      }
    });
    return [...mapa.entries()];
  }, [filas]);

  // Conteos por estado actual: una fila editada deja de contar como conflicto.
  const conteos = useMemo(() => {
    const cuenta = {};
    filas.forEach((fila) => {
      cuenta[fila.estado] = (cuenta[fila.estado] ?? 0) + 1;
    });
    return cuenta;
  }, [filas]);

  const filasFiltradas = useMemo(() => {
    const termino = normalizarTexto(filtros.busqueda);
    return filas.filter((fila) => {
      if (filtros.estado && fila.estado !== filtros.estado) return false;
      if (filtros.gradoId && String(fila.gradoId) !== filtros.gradoId) return false;
      if (termino) {
        const texto = normalizarTexto(`${fila.nombreCompleto ?? ''} ${fila.dni ?? ''} ${fila.codigo ?? ''}`);
        if (!texto.includes(termino)) return false;
      }
      return true;
    });
  }, [filas, filtros]);

  const hayFiltros = Boolean(filtros.estado || filtros.gradoId || filtros.busqueda.trim());
  const totalPaginas = Math.max(1, Math.ceil(filasFiltradas.length / FILAS_POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas - 1);
  const inicioPagina = paginaActual * FILAS_POR_PAGINA;
  const filasPagina = filasFiltradas.slice(inicioPagina, inicioPagina + FILAS_POR_PAGINA);

  const seleccionadas = filas.filter((fila) => seleccion[fila.previewId]);
  const sinGradoOSeccion = seleccionadas.some((fila) => !filaCompleta(fila));

  // Solo se pueden incluir las filas que no son duplicadas dentro del archivo.
  const elegiblesFiltradas = filasFiltradas.filter((fila) => fila.estado !== 'DUPLICADO');
  const incluidasFiltradas = elegiblesFiltradas.filter((fila) => seleccion[fila.previewId]).length;
  const todasIncluidas = elegiblesFiltradas.length > 0 && incluidasFiltradas === elegiblesFiltradas.length;
  const algunasIncluidas = incluidasFiltradas > 0 && !todasIncluidas;
  const etiquetaTodas = hayFiltros
    ? `Incluir las ${filasFiltradas.length} filas filtradas`
    : `Incluir todas las filas (${filasFiltradas.length})`;

  const procesarArchivo = (seleccionado) => {
    establecerError(null);
    establecerErroresArchivo([]);
    establecerErroresConfirmacion([]);
    if (!seleccionado) {
      establecerArchivo(null);
      return;
    }
    const problemas = [];
    if (!extensionValida(seleccionado.name)) {
      problemas.push(`«${seleccionado.name}» no es un archivo .csv o .xlsx.`);
    }
    if (seleccionado.size > MAXIMO_BYTES) {
      problemas.push(`«${seleccionado.name}» supera los 10 MB.`);
    }
    if (problemas.length > 0) {
      establecerArchivo(null);
      establecerErroresArchivo(problemas);
      return;
    }
    establecerArchivo(seleccionado);
  };

  const elegirArchivo = (evento) => {
    const elegido = evento.target.files?.[0] ?? null;
    evento.target.value = '';
    procesarArchivo(elegido);
  };

  const soltarArchivo = (evento) => {
    evento.preventDefault();
    establecerArrastrando(false);
    if (procesando) return;
    procesarArchivo(evento.dataTransfer?.files?.[0] ?? null);
  };

  const descargar = async (tipo, formato) => {
    establecerError(null);
    const respuesta = tipo === 'plantilla'
      ? await descargarPlantillaMatriculas(formato)
      : await exportarMatriculas(anioId, formato);
    if (!respuesta.exitoso || !(respuesta.datos instanceof Blob)) {
      establecerError(respuesta.mensaje || 'No se pudo descargar el archivo.');
      return;
    }
    const nombre = tipo === 'plantilla'
      ? `plantilla-matriculas.${formato}`
      : `matriculas-${anioId || 'todas'}.${formato}`;
    guardarArchivo(respuesta.datos, nombre);
  };

  const previsualizar = async (evento) => {
    evento.preventDefault();
    establecerError(null);
    establecerErroresConfirmacion([]);
    if (!anioId) {
      establecerError('Selecciona el año académico destino.');
      return;
    }
    if (!archivo) {
      establecerError('Selecciona un archivo para continuar.');
      return;
    }

    establecerProcesando(true);
    const respuesta = await previsualizarCargaMasivaMatriculas(archivo, anioId);
    establecerProcesando(false);
    if (!respuesta.exitoso) {
      establecerError(respuesta.mensaje || 'No se pudo leer la vista previa.');
      return;
    }

    const nuevasFilas = ordenarProblemasPrimero((respuesta.datos?.filas ?? []).map((fila) => ({
      ...fila,
      anioAcademicoId: fila.anioAcademicoId ?? Number(anioId)
    })));
    establecerFilas(nuevasFilas);
    establecerSecciones(respuesta.datos?.secciones ?? []);
    establecerSeleccion(seleccionInicial(nuevasFilas));
    establecerFiltros({ estado: '', gradoId: '', busqueda: '' });
    establecerPagina(0);
    establecerVista('preview');
  };

  const confirmar = async (evento) => {
    evento.preventDefault();
    if (!esPreview) {
      await previsualizar(evento);
      return;
    }
    establecerError(null);
    establecerErroresConfirmacion([]);
    if (seleccionadas.length === 0) {
      establecerError('Selecciona al menos una fila para crear matrículas.');
      return;
    }
    if (sinGradoOSeccion) {
      establecerError('Completa el grado y la sección de todas las filas seleccionadas.');
      return;
    }

    establecerProcesando(true);
    const respuesta = await confirmarCargaMasivaMatriculas({
      anioId,
      filas: seleccionadas
    });
    establecerProcesando(false);
    if (!respuesta.exitoso) {
      establecerError(respuesta.mensaje || 'No se pudieron crear las matrículas.');
      return;
    }

    const errores = Array.isArray(respuesta.datos?.errores) ? respuesta.datos.errores : [];
    if (errores.length > 0 || (respuesta.datos?.creados ?? 0) === 0) {
      establecerErroresConfirmacion(
        errores.length > 0
          ? errores.map((item) => (typeof item === 'string'
            ? { origen: '', mensaje: item }
            : {
              origen: item.origen ?? '',
              mensaje: item.mensaje ?? 'No se pudo crear la matrícula.'
            }))
          : [{ origen: '', mensaje: 'No se creó ninguna matrícula.' }]
      );
      return;
    }
    alCompletar?.(respuesta.datos ?? { creados: seleccionadas.length });
  };

  // Una fila corregida a mano se incluye: quien la edita quiere que se cree.
  const actualizarFila = (previewId, cambios) => {
    establecerFilas((actuales) => actuales.map((fila) => {
      if (fila.previewId !== previewId) return fila;
      const estado = fila.estado === 'DUPLICADO' ? 'DUPLICADO' : 'EDITADO';
      return { ...fila, ...cambios, estado };
    }));
    const duplicada = filas.some(
      (fila) => fila.previewId === previewId && fila.estado === 'DUPLICADO'
    );
    if (!duplicada) {
      establecerSeleccion((actual) => ({ ...actual, [previewId]: true }));
    }
    establecerErroresConfirmacion([]);
  };

  const alternarInclusion = (previewId, incluir) => {
    establecerSeleccion((actual) => ({ ...actual, [previewId]: incluir }));
    establecerErroresConfirmacion([]);
  };

  const cambiarFiltro = (campo, valor) => {
    establecerFiltros((actual) => ({ ...actual, [campo]: valor }));
    establecerPagina(0);
  };

  const quitarFiltros = () => {
    establecerFiltros({ estado: '', gradoId: '', busqueda: '' });
    establecerPagina(0);
  };

  const irAPagina = (numero) => {
    establecerPagina(numero);
    if (tablaRef.current) tablaRef.current.scrollTop = 0;
  };

  const incluirFiltradas = (incluir) => {
    establecerSeleccion((actual) => {
      const siguiente = { ...actual };
      filasFiltradas.forEach((fila) => {
        if (!incluir) siguiente[fila.previewId] = false;
        else if (fila.estado !== 'DUPLICADO') siguiente[fila.previewId] = true;
      });
      return siguiente;
    });
    establecerErroresConfirmacion([]);
  };

  // Hay algo que perder mientras haya un archivo elegido o una vista previa que aún no se confirmó.
  const hayCambios = esPreview || Boolean(archivo);
  // X, Esc y Cancelar (paso 1) cierran toda la carga; en la vista previa, «Atrás» solo vuelve al paso 1.
  const solicitarCierre = () => (hayCambios ? establecerConfirmandoDescarte('cerrar') : alCerrar());
  const solicitarAtras = () => establecerConfirmandoDescarte('atras');

  const descartar = () => {
    const modo = confirmandoDescarte;
    establecerConfirmandoDescarte(null);
    if (modo !== 'atras') {
      alCerrar();
      return;
    }
    establecerArchivo(null);
    establecerFilas([]);
    establecerSeleccion({});
    establecerSecciones([]);
    establecerFiltros({ estado: '', gradoId: '', busqueda: '' });
    establecerPagina(0);
    establecerError(null);
    establecerErroresConfirmacion([]);
    establecerVista('seleccion');
  };

  const notaPie = esPreview
    ? sinGradoOSeccion
      ? 'Hay filas incluidas sin grado o sección.'
      : seleccionadas.length === 0
        ? 'Incluye al menos una fila para continuar.'
        : `Se crearán ${plural(seleccionadas.length, 'matrícula', 'matrículas')} de ${filas.length}.`
    : !archivo
      ? 'Selecciona un archivo para continuar.'
      : !anioId
        ? 'Selecciona el año académico destino.'
        : 'Archivo listo para previsualizar.';

  return (
    <>
    <DialogoBase
      idTitulo="dialogo-carga-masiva-matriculas"
      titulo={esPreview ? 'Previsualizar carga masiva' : 'Carga masiva de matrículas'}
      subtitulo={esPreview ? 'Revisa y corrige las filas antes de crear' : 'Archivos CSV o Excel'}
      anchoMaximo={esPreview ? '68rem' : '42rem'}
      textoConfirmar={
        esPreview
          ? seleccionadas.length > 0
            ? `Crear ${plural(seleccionadas.length, 'matrícula', 'matrículas')}`
            : 'Crear matrículas'
          : 'Previsualizar'
      }
      textoEnviando={esPreview ? 'Creando…' : 'Validando…'}
      enviando={procesando}
      confirmarDeshabilitado={
        procesando
        || (esPreview ? seleccionadas.length === 0 || sinGradoOSeccion : !archivo || !anioId)
      }
      error={error}
      notaPie={notaPie}
      cerrarAlClicFuera={false}
      textoCancelar={esPreview ? 'Atrás' : 'Cancelar'}
      alPulsarCancelar={esPreview ? solicitarAtras : undefined}
      alSolicitarCierre={solicitarCierre}
      alCancelar={alCerrar}
      alConfirmar={confirmar}
    >
      <div className={`${estilos.contenido} ${esPreview ? estilos.contenidoPreview : ''}`}>
        {!esPreview && (
          <>
            <div role="note" className={estilos.info}>
              <Icono nombre="informacion" tamano={18} />
              <div>
                Cada fila del archivo es una matrícula: estudiante, grado y sección. Antes de crear nada
                verás una vista previa donde puedes corregir o excluir filas. Las matrículas se crean en
                estado pendiente y la operación es todo o nada.
              </div>
            </div>

            <div className={estilos.pasos}>
              <section className={estilos.paso} aria-labelledby="paso-plantilla-matriculas">
                <div className={estilos.cabeceraPaso}>
                  <span className={estilos.numeroPaso} aria-hidden="true">1</span>
                  <div>
                    <h3 id="paso-plantilla-matriculas" className={estilos.tituloPaso}>Descarga la plantilla</h3>
                    <p className={estilos.ayudaPaso}>Trae los encabezados listos para completar.</p>
                  </div>
                </div>
                <div className={estilos.controlPaso}>
                  <button
                    type="button"
                    className={estilos.botonSecundario}
                    onClick={() => descargar('plantilla', 'csv')}
                  >
                    <Icono nombre="archivo" tamano={16} />
                    Plantilla CSV
                  </button>
                  <button
                    type="button"
                    className={estilos.botonSecundario}
                    onClick={() => descargar('plantilla', 'xlsx')}
                  >
                    <Icono nombre="archivo" tamano={16} />
                    Plantilla Excel
                  </button>
                </div>
              </section>

              <section
                className={estilos.paso}
                aria-labelledby="paso-archivo-matriculas"
                aria-busy={procesando || undefined}
              >
                <div className={estilos.cabeceraPaso}>
                  <span className={estilos.numeroPaso} aria-hidden="true">2</span>
                  <div>
                    <h3 id="paso-archivo-matriculas" className={estilos.tituloPaso}>Elige el año y sube tu archivo</h3>
                    <p className={estilos.ayudaPaso}>CSV o Excel · un archivo · máx. 10 MB</p>
                  </div>
                </div>

                <div className={estilos.campoAnio}>
                  <label htmlFor="carga-matriculas-anio" className={estilos.etiqueta}>
                    Año académico destino
                  </label>
                  <select
                    id="carga-matriculas-anio"
                    className={estilos.select}
                    value={anioId}
                    disabled={procesando}
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
                      archivo ? estilos.zonaConArchivo : '',
                      arrastrando ? estilos.zonaActiva : '',
                      procesando ? estilos.zonaInactiva : ''
                    ].filter(Boolean).join(' ')}
                    onDragOver={(evento) => {
                      evento.preventDefault();
                      if (!procesando) establecerArrastrando(true);
                    }}
                    onDragLeave={() => establecerArrastrando(false)}
                    onDrop={soltarArchivo}
                  >
                    <span className={estilos.iconoZona}>
                      {procesando
                        ? <Icono nombre="cargando" tamano={20} className={estilos.iconoGirando} />
                        : <Icono nombre={archivo ? 'archivo' : 'subir'} tamano={20} />}
                    </span>
                    <span className={estilos.zonaTexto}>
                      {procesando ? (
                        <>
                          <span className={estilos.zonaTitulo}>Validando archivo…</span>
                          <span className={estilos.zonaAyuda}>{archivo?.name}</span>
                        </>
                      ) : archivo ? (
                        <>
                          <span className={estilos.nombreArchivo}>{archivo.name}</span>
                          <span className={estilos.zonaAyuda}>{formatearTamano(archivo.size ?? 0)}</span>
                        </>
                      ) : (
                        <>
                          <span className={estilos.zonaTitulo}>Seleccionar archivo</span>
                          <span className={estilos.zonaAyuda}>o arrástralo y suéltalo aquí</span>
                        </>
                      )}
                    </span>
                    <input
                      type="file"
                      accept=".csv,.xlsx"
                      className={estilos.archivo}
                      disabled={procesando}
                      onChange={elegirArchivo}
                      data-enfoque-inicial=""
                    />
                  </label>
                  {archivo && !procesando && (
                    <button
                      type="button"
                      className={estilos.botonQuitar}
                      aria-label="Quitar archivo"
                      title="Quitar archivo"
                      onClick={() => procesarArchivo(null)}
                    >
                      <Icono nombre="cerrar" tamano={14} />
                    </button>
                  )}
                </div>
              </section>
            </div>

            <section className={estilos.exportacion} aria-labelledby="paso-exportar-matriculas">
              <div className={estilos.cabeceraPaso}>
                <span className={estilos.iconoExportacion} aria-hidden="true">
                  <Icono nombre="archivo" tamano={16} />
                </span>
                <div>
                  <h3 id="paso-exportar-matriculas" className={estilos.tituloPaso}>
                    ¿Rematriculas desde otro año?
                  </h3>
                  <p className={estilos.ayudaPaso}>
                    Exporta las matrículas del año seleccionado y vuelve a subir el archivo en el año destino.
                  </p>
                </div>
              </div>
              <div className={estilos.controlPaso}>
                <button
                  type="button"
                  className={estilos.botonSecundario}
                  disabled={!anioId || procesando}
                  onClick={() => descargar('exportar', 'csv')}
                >
                  Exportar CSV
                </button>
                <button
                  type="button"
                  className={estilos.botonSecundario}
                  disabled={!anioId || procesando}
                  onClick={() => descargar('exportar', 'xlsx')}
                >
                  Exportar Excel
                </button>
              </div>
            </section>

            {erroresArchivo.length > 0 && (
              <div role="alert" className={estilos.errores}>
                <strong>No se puede usar este archivo:</strong>
                <ul>
                  {erroresArchivo.map((mensaje, indice) => (
                    <li key={`${indice}-${mensaje}`}>{mensaje}</li>
                  ))}
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
                  <li>El estudiante se identifica por DNI o código; si ambos vienen, deben corresponder a la misma persona.</li>
                  <li>La columna Año es informativa: la carga siempre usa el año académico destino.</li>
                  <li>Guarda como CSV UTF-8 (separado por comas o punto y coma) o como Excel.</li>
                </ul>
              </div>
            </details>

            <p className={estilos.nota}>Nada se guarda hasta que confirmes en la vista previa.</p>
          </>
        )}

        {esPreview && (
          <>
            <div role="status" className={estilos.resumen}>
              <div className={estilos.resumenTotal}>
                <span className={estilos.cifra}>{filas.length}</span>
                <span className={estilos.rotuloCifra}>
                  {filas.length === 1 ? 'fila en el archivo' : 'filas en el archivo'}
                </span>
              </div>
              <dl className={estilos.grupos}>
                <div className={estilos.grupo}>
                  <dt className={estilos.etiquetaGrupo}>Estado</dt>
                  <dd className={estilos.chips}>
                    {FILTROS_ESTADO
                      .filter((filtro) => (conteos[filtro.estado] ?? 0) > 0)
                      .map((filtro) => (
                        <button
                          key={filtro.estado}
                          type="button"
                          className={estilos.chipFiltro}
                          aria-pressed={filtros.estado === filtro.estado}
                          title="Filtrar la tabla por este estado"
                          onClick={() => cambiarFiltro(
                            'estado',
                            filtros.estado === filtro.estado ? '' : filtro.estado
                          )}
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
                      {plural(seleccionadas.length, 'seleccionada', 'seleccionadas')}
                    </Insignia>
                    {archivo && (
                      <Insignia tono="gris" className={estilos.insigniaArchivo}>
                        <span className={estilos.textoArchivo} title={archivo.name}>{archivo.name}</span>
                      </Insignia>
                    )}
                  </dd>
                </div>
              </dl>
            </div>

            {erroresConfirmacion.length > 0 && (
              <div ref={refErrores} role="alert" className={estilos.erroresConfirmacion}>
                <p className={estilos.erroresConfirmacionTitulo}>
                  <Icono nombre="alerta" tamano={16} />
                  No se creó ninguna matrícula
                </p>
                <ul>
                  {erroresConfirmacion.map((item, indice) => (
                    <li key={`${indice}-${item.mensaje}`}>
                      {item.origen ? <strong>{item.origen}: </strong> : null}
                      {item.mensaje}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className={estilos.herramientasPreview}>
              <div className={estilos.filtrosPreview}>
                <label className={estilos.campoFiltro}>
                  Grado
                  <select
                    className={estilos.select}
                    value={filtros.gradoId}
                    onChange={(evento) => cambiarFiltro('gradoId', evento.target.value)}
                  >
                    <option value="">Todos</option>
                    {gradosEnArchivo.map(([valor, etiqueta]) => (
                      <option key={valor} value={valor}>{etiqueta}</option>
                    ))}
                  </select>
                </label>

                <label className={estilos.campoFiltro}>
                  Buscar estudiante
                  <input
                    type="search"
                    className={estilos.select}
                    value={filtros.busqueda}
                    placeholder="Nombre, DNI o código"
                    onChange={(evento) => cambiarFiltro('busqueda', evento.target.value)}
                  />
                </label>

                {hayFiltros && (
                  <p className={estilos.infoFiltro}>
                    Mostrando {filasFiltradas.length} de {filas.length}
                    {' · '}
                    <button type="button" className={estilos.enlace} onClick={quitarFiltros}>
                      Quitar filtros
                    </button>
                  </p>
                )}
              </div>

            </div>

            <div className={estilos.tablaPreviewContenedor} ref={tablaRef}>
              <table className={estilos.tablaPreview}>
                <thead>
                  <tr>
                    <th scope="col" className={estilos.colIncluir}>
                      {/* En escritorio el texto es solo para lectores de pantalla; en móvil se ve junto a la casilla. */}
                      <label className={estilos.etiquetaTodas} title={etiquetaTodas}>
                        <input
                          type="checkbox"
                          className={estilos.casilla}
                          checked={todasIncluidas}
                          ref={(casilla) => { if (casilla) casilla.indeterminate = algunasIncluidas; }}
                          disabled={elegiblesFiltradas.length === 0}
                          onChange={() => incluirFiltradas(!todasIncluidas)}
                        />
                        <span className={estilos.textoTodas}>{etiquetaTodas}</span>
                      </label>
                    </th>
                    <th scope="col" className={estilos.colEstudiante}>Estudiante</th>
                    <th scope="col" className={estilos.colGrado}>Grado</th>
                    <th scope="col" className={estilos.colSeccion}>Sección</th>
                    <th scope="col" className={estilos.colEstado}>
                      <span className={estilos.soloLectores}>Estado</span>
                    </th>
                    <th scope="col" className={estilos.colOrigen}>Origen</th>
                  </tr>
                </thead>
                <tbody>
                  {filasPagina.map((fila) => {
                    const incluida = Boolean(seleccion[fila.previewId]);
                    const sinSeccion = fila.gradoId == null;
                    const opcionesSeccion = seccionesPorGrado.get(String(fila.gradoId)) ?? [];
                    const tieneErrores = fila.errores?.length > 0;
                    const origen = datosOrigen(fila.origen);
                    const clasesFila = [
                      incluida ? '' : estilos.filaExcluida,
                      tieneErrores ? estilos.filaConErrores : ''
                    ].filter(Boolean).join(' ');
                    const gradoActualEnCatalogo = grados.some(
                      (grado) => String(grado.id) === String(fila.gradoId)
                    );

                    return (
                      <Fragment key={fila.previewId}>
                        <tr className={clasesFila || undefined}>
                          <td data-label="Incluir">
                            <input
                              type="checkbox"
                              className={estilos.casilla}
                              checked={incluida}
                              disabled={fila.estado === 'DUPLICADO'}
                              aria-label={`Incluir ${fila.nombreCompleto ?? fila.previewId}`}
                              onChange={(evento) => alternarInclusion(fila.previewId, evento.target.checked)}
                            />
                          </td>
                          <td data-label="Estudiante">
                            <div className={estilos.celdaDatos}>
                              <span className={estilos.celdaPrincipal}>{fila.nombreCompleto}</span>
                              <span className={estilos.celdaSecundaria}>
                                {[fila.codigo, fila.dni].filter(Boolean).join(' · ')}
                              </span>
                            </div>
                          </td>
                          <td data-label="Grado">
                            <select
                              className={estilos.selectCompacto}
                              value={fila.gradoId ?? ''}
                              aria-label={`Grado de ${fila.nombreCompleto}`}
                              onChange={(evento) => {
                                const gradoId = evento.target.value === '' ? null : Number(evento.target.value);
                                const grado = grados.find(
                                  (item) => String(item.id) === String(gradoId)
                                );
                                actualizarFila(fila.previewId, {
                                  gradoId,
                                  gradoNombre: grado?.nombre ?? null,
                                  seccionId: null,
                                  seccionNombre: null
                                });
                              }}
                            >
                              <option value="">Sin grado</option>
                              {!gradoActualEnCatalogo && fila.gradoId != null && (
                                <option value={fila.gradoId}>{fila.gradoNombre ?? `Grado ${fila.gradoId}`}</option>
                              )}
                              {grados.map((grado) => (
                                <option key={grado.id} value={grado.id}>{grado.nombre}</option>
                              ))}
                            </select>
                          </td>
                          <td data-label="Sección">
                            <select
                              className={estilos.selectCompacto}
                              value={fila.seccionId ?? ''}
                              aria-label={`Sección de ${fila.nombreCompleto}`}
                              disabled={sinSeccion}
                              onChange={(evento) => {
                                const seccion = opcionesSeccion.find(
                                  (item) => String(item.id) === String(evento.target.value)
                                );
                                actualizarFila(fila.previewId, {
                                  seccionId: seccion?.id ?? null,
                                  seccionNombre: seccion?.nombre ?? null
                                });
                              }}
                            >
                              <option value="">Sin sección</option>
                              {opcionesSeccion.map((seccion) => (
                                <option
                                  key={seccion.id}
                                  value={seccion.id}
                                  disabled={seccion.vacantes === 0 && String(seccion.id) !== String(fila.seccionId)}
                                >
                                  {seccion.nombre}
                                  {seccion.vacantes === 0 ? ' (sin vacantes)' : ''}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td data-label="Estado">
                            <div
                              className={estilos.celdaEstado}
                              title={ETIQUETA_ESTADO[fila.estado] ?? 'Error'}
                            >
                              <span
                                className={`${estilos.estadoPreview} ${estilos[`estado${fila.estado}`] ?? ''}`}
                                aria-hidden="true"
                              >
                                <Icono nombre={ICONO_ESTADO[fila.estado] ?? 'informacion'} tamano={14} />
                              </span>
                              <span className={estilos.textoEstado}>
                                {ETIQUETA_ESTADO[fila.estado] ?? 'Error'}
                              </span>
                            </div>
                          </td>
                          <td data-label="Origen" className={estilos.origen}>
                            <div className={estilos.celdaDatos}>
                              <span className={estilos.archivoNombre} title={origen.archivo}>
                                {origen.archivo}
                              </span>
                              {origen.fila && <span className={estilos.archivoFila}>Fila {origen.fila}</span>}
                            </div>
                          </td>
                        </tr>
                        {tieneErrores && (
                          <tr className={estilos.filaDetalle}>
                            <td colSpan={6}>
                              <ul className={estilos.listaErrores}>
                                {fila.errores.map((mensaje, indice) => (
                                  <li key={`${fila.previewId}-${indice}`}>{mensaje}</li>
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
              {filasFiltradas.length === 0 && (
                <p className={estilos.nota}>No hay filas con los filtros seleccionados.</p>
              )}
            </div>

            {filasFiltradas.length > FILAS_POR_PAGINA && (
              <Paginacion
                pagina={paginaActual}
                totalPaginas={totalPaginas}
                totalElementos={filasFiltradas.length}
                tamanioPagina={FILAS_POR_PAGINA}
                cantidadEnPagina={filasPagina.length}
                alCambiarPagina={irAPagina}
                etiqueta="Paginación de la vista previa de matrículas"
                unidadSingular="fila"
                unidadPlural="filas"
              />
            )}

            <p className={estilos.nota}>
              Nada se guarda hasta que pulses Crear. Si una fila falla, no se crea ninguna matrícula.
            </p>
          </>
        )}
      </div>
    </DialogoBase>

    {confirmandoDescarte && (
      <DialogoDescartarImportacion
        mensaje={esPreview
          ? `Se perderá el archivo «${archivo?.name ?? ''}» y su revisión. No se creará ninguna matrícula.`
          : `Se perderá el archivo «${archivo?.name ?? ''}». No se creará ninguna matrícula.`}
        alDescartar={descartar}
        alSeguir={() => establecerConfirmandoDescarte(null)}
      />
    )}
    </>
  );
}
