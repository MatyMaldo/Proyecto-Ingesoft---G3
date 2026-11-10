import { Fragment, useMemo, useRef, useState } from 'react';

import Icono from '../../../shared/components/Icono.jsx';
import DialogoBase from '../../../shared/components/DialogoBase.jsx';
import ProgresoOperacionMasiva from '../../../shared/components/ProgresoOperacionMasiva.jsx';
import { crearClaveIdempotencia } from '../../../shared/api/operacionesMasivasService.js';
import { DIAS } from '../constants/horarios.js';
import {
  descargarPlantillaBloques,
  iniciarConfirmacionCargaMasivaAsync,
  previsualizarCargaMasiva
} from '../services/horariosService.js';
import { guardarArchivo } from '../utils/guardarArchivo.js';
import estilos from './DialogoCargaMasiva.module.css';

const MENSAJE_ERROR_GENERICO = 'Se registró un error inesperado';
const EXTENSIONES = ['.csv', '.xlsx', '.xls'];

const COLUMNAS = [
  { nombre: 'ID Sección', regla: 'ID interno de la sección. Recomendado.' },
  { nombre: 'Grado', regla: 'Nombre exacto del grado.' },
  { nombre: 'Sección', regla: 'Nombre de la sección.' },
  { nombre: 'ID Curso', regla: 'ID interno del curso. Recomendado.' },
  { nombre: 'Curso', regla: 'Nombre exacto del curso.' },
  { nombre: 'ID Docente', regla: 'ID interno del docente. Recomendado.' },
  { nombre: 'DNI Docente', regla: 'DNI del docente activo.' },
  { nombre: 'Docente', regla: 'Nombre del docente. Solo informativo.' },
  { nombre: 'ID Aula', regla: 'ID interno del aula. Recomendado.' },
  { nombre: 'Aula', regla: 'Nombre exacto del aula.' },
  { nombre: 'Día', regla: 'Lunes, Martes, Miércoles, Jueves o Viernes.' },
  { nombre: 'Hora inicio', regla: 'Formato HH:mm.' },
  { nombre: 'Hora fin', regla: 'Formato HH:mm, posterior a la hora de inicio.' }
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
  const [errorGeneral, establecerErrorGeneral] = useState(null);
  const [cargandoPreview, establecerCargandoPreview] = useState(false);
  const [errorPlantilla, establecerErrorPlantilla] = useState('');
  const claveRef = useRef(null);

  const bloques = preview?.bloques ?? [];
  const resumen = preview?.resumen ?? {};

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

  const seleccionados = bloques.filter((bloque) => incluidos[bloque.previewId]);
  const bloqueSinReferencias = seleccionados.some(
    (bloque) => bloque.asignacionCursoId == null || bloque.aulaId == null
  );

  async function descargarPlantilla(formato) {
    establecerErrorPlantilla('');
    const respuesta = await descargarPlantillaBloques(formato);
    if (!respuesta.exitoso || !(respuesta.datos instanceof Blob)) {
      establecerErrorPlantilla(respuesta.mensaje || 'No se pudo descargar la plantilla.');
      return;
    }
    guardarArchivo(respuesta.datos, `plantilla-horarios.${formato}`);
  }

  function elegirArchivos(evento) {
    const seleccionadosArchivos = [...(evento.target.files ?? [])];
    evento.target.value = '';
    const invalido = seleccionadosArchivos.find((archivo) => !extensionValida(archivo.name));
    if (invalido) {
      establecerArchivos([]);
      establecerErrorGeneral('Solo se aceptan archivos .csv, .xlsx o .xls.');
      return;
    }
    establecerErrorGeneral(null);
    establecerArchivos(seleccionadosArchivos);
    establecerPreview(null);
    establecerVista('seleccion');
    claveRef.current = null;
    operacion?.reiniciar();
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

    establecerPreview(respuesta.datos);
    establecerIncluidos(Object.fromEntries(
      (respuesta.datos.bloques ?? []).map((bloque) => [
        bloque.previewId,
        bloque.estado !== 'ERROR'
      ])
    ));
    establecerVista('preview');
  }

  function actualizarBloque(previewId, campo, valor) {
    establecerPreview((actual) => ({
      ...actual,
      bloques: actual.bloques.map((bloque) => (
        bloque.previewId === previewId
          ? { ...bloque, [campo]: valor, estado: 'EDITADO' }
          : bloque
      ))
    }));
  }

  async function confirmar() {
    const bloqueos = seleccionados;
    if (bloqueos.length === 0) {
      establecerErrorGeneral('Selecciona al menos un bloque para confirmar.');
      return;
    }
    if (bloqueSinReferencias) {
      establecerErrorGeneral('Hay bloques seleccionados sin relación curso-docente o aula resuelta.');
      return;
    }

    establecerErrorGeneral(null);
    if (!claveRef.current || operacion?.job) {
      claveRef.current = crearClaveIdempotencia('carga-horarios');
    }

    const respuesta = await operacion.iniciar(() => (
      iniciarConfirmacionCargaMasivaAsync({
        anioAcademicoId: anioId,
        bloques: bloqueos.map((bloque) => ({
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

  const esPreview = vista === 'preview';
  const textoConfirmar = esPreview ? 'Confirmar creación' : 'Previsualizar';
  const enviando = esPreview ? (operacion?.iniciando ?? false) : cargandoPreview;
  const confirmarDeshabilitado = esPreview
    ? seleccionados.length === 0 || bloqueSinReferencias || Boolean(operacion?.enCurso)
      || Boolean(operacion?.job)
    : archivos.length === 0;

  return (
    <DialogoBase
      idTitulo="dialogo-carga-masiva-horarios"
      titulo={esPreview ? 'Previsualizar carga masiva' : 'Carga masiva de horarios'}
      subtitulo={esPreview ? 'Revisa y corrige los bloques antes de crear' : 'Archivos CSV o Excel'}
      anchoMaximo="86rem"
      textoConfirmar={textoConfirmar}
      textoEnviando={esPreview ? 'Creando…' : 'Validando…'}
      enviando={enviando}
      confirmarDeshabilitado={confirmarDeshabilitado}
      error={errorGeneral || operacion?.error || null}
      cerrarAlClicFuera={false}
      alCancelar={alCancelar}
      alConfirmar={(evento) => {
        evento.preventDefault();
        if (esPreview) confirmar();
        else previsualizar();
      }}
    >
      <div className={estilos.contenido}>
        {!esPreview && (
          <>
            <section className={estilos.tarjeta} aria-labelledby="carga-masiva-plantilla">
              <span className={estilos.iconoTarjeta} aria-hidden="true">
                <Icono nombre="archivo" tamano={22} />
              </span>
              <div className={estilos.textoTarjeta}>
                <h3 id="carga-masiva-plantilla" className={estilos.subtitulo}>Plantilla de horarios</h3>
                <p className={estilos.texto}>
                  Usa la plantilla para preparar los bloques o exporta los bloques existentes.
                </p>
                <p className={estilos.nota}>
                  CSV UTF-8 o Excel · Hasta 10 archivos · Máximo 5000 filas en total.
                </p>
              </div>
              <div className={estilos.acciones}>
                <button type="button" className={estilos.botonSecundario} onClick={() => descargarPlantilla('csv')}>
                  Plantilla CSV
                </button>
                <button type="button" className={estilos.botonSecundario} onClick={() => descargarPlantilla('xlsx')}>
                  Plantilla Excel
                </button>
              </div>
            </section>

            {errorPlantilla && <p role="alert" className={estilos.error}>{errorPlantilla}</p>}

            <section aria-labelledby="carga-masiva-pasos">
              <h3 id="carga-masiva-pasos" className={estilos.subtitulo}>Cómo preparar los archivos</h3>
              <ol className={estilos.pasos}>
                <li>Descarga la plantilla y completa una fila por bloque horario.</li>
                <li>Puedes usar varios archivos, uno por sección o docente.</li>
                <li>Incluye los IDs cuando estén disponibles; si cambia un nombre, el ID sigue siendo válido.</li>
                <li>Los nombres y DNI se usan como respaldo si falta el ID.</li>
                <li>Guarda como CSV UTF-8 o Excel.</li>
              </ol>
            </section>

            <section aria-labelledby="carga-masiva-columnas">
              <h3 id="carga-masiva-columnas" className={estilos.subtitulo}>Columnas recomendadas</h3>
              <div className={estilos.columnas}>
                <p className={estilos.rotulo}>IDs y datos legibles</p>
                <ul className={estilos.lista}>
                  {COLUMNAS.map((columna) => (
                    <li key={columna.nombre}>
                      <strong>{columna.nombre}:</strong> {columna.regla}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section className={estilos.subida} aria-labelledby="carga-masiva-subida">
              <h3 id="carga-masiva-subida" className={estilos.subtitulo}>Subir archivos</h3>
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

              <div className={estilos.acciones}>
                <label className={`${estilos.botonSecundario} ${cargandoPreview ? estilos.botonInactivo : ''}`}>
                  <Icono nombre="subir" tamano={16} />
                  Seleccionar archivos
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    className={estilos.archivo}
                    multiple
                    disabled={cargandoPreview}
                    onChange={elegirArchivos}
                  />
                </label>
                <span className={estilos.nombreArchivo}>
                  {archivos.length === 0
                    ? 'Ningún archivo seleccionado'
                    : archivos.map((archivo) => archivo.name).join(', ')}
                </span>
              </div>
            </section>
          </>
        )}

        {esPreview && (
          <>
            <div className={estilos.resumenPreview}>
              <span>Archivos: <strong>{resumen.archivos ?? 0}</strong></span>
              <span>Filas: <strong>{resumen.filas ?? 0}</strong></span>
              <span>Válidas: <strong>{resumen.validas ?? 0}</strong></span>
              <span>Con error: <strong>{resumen.conError ?? 0}</strong></span>
              <span>Duplicadas: <strong>{resumen.duplicadas ?? 0}</strong></span>
              <span>Conflictos: <strong>{resumen.conflictos ?? 0}</strong></span>
              <span>Seleccionadas: <strong>{seleccionados.length}</strong></span>
            </div>

            <div className={estilos.filtrosPreview}>
              <label className={estilos.campoFiltro}>
                Grado y sección
                <select
                  className={estilos.select}
                  value={filtros.seccion}
                  onChange={(evento) => establecerFiltros((actual) => ({ ...actual, seccion: evento.target.value }))}
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
                  onChange={(evento) => establecerFiltros((actual) => ({ ...actual, docente: evento.target.value }))}
                >
                  <option value="">Todos</option>
                  {opcionesDocente.map(([valor, etiqueta]) => (
                    <option key={valor} value={valor}>{etiqueta}</option>
                  ))}
                </select>
              </label>

              <label className={estilos.campoFiltro}>
                Estado
                <select
                  className={estilos.select}
                  value={filtros.estado}
                  onChange={(evento) => establecerFiltros((actual) => ({ ...actual, estado: evento.target.value }))}
                >
                  <option value="">Todos</option>
                  <option value="VALIDO">Válido</option>
                  <option value="EDITADO">Editado</option>
                  <option value="ERROR">Error</option>
                  <option value="DUPLICADO">Duplicado</option>
                  <option value="CONFLICTO">Conflicto</option>
                </select>
              </label>

              <button type="button" className={estilos.botonSecundario} onClick={() => establecerVista('seleccion')}>
                Volver a carga de archivos
              </button>
            </div>

            <div className={estilos.tablaPreviewContenedor}>
              <table className={estilos.tablaPreview}>
                <thead>
                  <tr>
                    <th scope="col">Incluir</th>
                    <th scope="col">Origen</th>
                    <th scope="col">Grado y sección</th>
                    <th scope="col">Curso</th>
                    <th scope="col">Docente</th>
                    <th scope="col">Día</th>
                    <th scope="col">Inicio</th>
                    <th scope="col">Fin</th>
                    <th scope="col">Aula</th>
                    <th scope="col">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {bloquesFiltrados.map((bloque) => {
                    const incluido = Boolean(incluidos[bloque.previewId]);
                    const sinReferencias = bloque.asignacionCursoId == null;
                    return (
                      <Fragment key={bloque.previewId}>
                        <tr className={incluido ? undefined : estilos.filaExcluida}>
                          <td>
                            <input
                              type="checkbox"
                              checked={incluido}
                              disabled={sinReferencias}
                              aria-label={`Incluir bloque ${bloque.previewId}`}
                              onChange={(evento) => establecerIncluidos((actual) => ({
                                ...actual,
                                [bloque.previewId]: evento.target.checked
                              }))}
                            />
                          </td>
                          <td className={estilos.origen}>
                            <span className={estilos.archivoNombre}>{bloque.archivo}</span>
                            <span className={estilos.archivoFila}>Fila {bloque.fila}</span>
                          </td>
                          <td>{[bloque.gradoNombre, bloque.seccionNombre].filter(Boolean).join(' · ')}</td>
                          <td>{bloque.cursoNombre}</td>
                          <td>{bloque.docenteNombre}</td>
                          <td>
                            <select
                              className={estilos.selectCompacto}
                              value={bloque.diaSemana ?? ''}
                              disabled={sinReferencias}
                              onChange={(evento) => actualizarBloque(bloque.previewId, 'diaSemana', evento.target.value)}
                            >
                              {DIAS.map((dia) => (
                                <option key={dia.id} value={dia.id}>{dia.etiqueta}</option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <input
                              type="time"
                              className={estilos.selectCompacto}
                              value={String(bloque.horaInicio ?? '').slice(0, 5)}
                              disabled={sinReferencias}
                              onChange={(evento) => actualizarBloque(bloque.previewId, 'horaInicio', evento.target.value)}
                            />
                          </td>
                          <td>
                            <input
                              type="time"
                              className={estilos.selectCompacto}
                              value={String(bloque.horaFin ?? '').slice(0, 5)}
                              disabled={sinReferencias}
                              onChange={(evento) => actualizarBloque(bloque.previewId, 'horaFin', evento.target.value)}
                            />
                          </td>
                          <td>
                            <select
                              className={estilos.selectCompacto}
                              value={bloque.aulaId ?? ''}
                              disabled={sinReferencias}
                              onChange={(evento) => actualizarBloque(bloque.previewId, 'aulaId', Number(evento.target.value))}
                            >
                              {aulas.map((aula) => (
                                <option key={aula.id} value={aula.id}>{aula.nombre}</option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <span className={`${estilos.estadoPreview} ${estilos[`estado${bloque.estado}`] ?? ''}`}>
                              {etiquetaEstado(bloque.estado)}
                            </span>
                          </td>
                        </tr>
                        {bloque.errores?.length > 0 && (
                          <tr className={estilos.filaDetalle}>
                            <td colSpan={10}>
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

            {operacion?.job && (
              <ProgresoOperacionMasiva
                job={operacion.job}
                error={operacion.error}
                titulo="Confirmación de carga masiva"
              />
            )}
          </>
        )}
      </div>
    </DialogoBase>
  );
}
