import { useState } from 'react';

import Icono from '../../../shared/components/Icono.jsx';
import DialogoBase from '../../cursos/components/DialogoBase.jsx';
import { cargarBloquesCsv, descargarPlantillaBloquesCsv } from '../services/horariosService.js';
import { guardarArchivo } from '../utils/guardarArchivo.js';
import estilos from './DialogoCargaMasiva.module.css';

const NOMBRE_PLANTILLA = 'plantilla-horarios.csv';
const MAXIMO_ERRORES_VISIBLES = 50;
const MENSAJE_ERROR_GENERICO = 'Se registró un error inesperado';

const COLUMNAS = [
  { nombre: 'Grado', regla: 'Nombre exacto de un grado registrado.' },
  { nombre: 'Sección', regla: 'Sección existente de ese grado en el año académico elegido.' },
  { nombre: 'Curso', regla: 'Nombre exacto de un curso registrado.' },
  { nombre: 'DNI Docente', regla: 'DNI de un docente activo. Si el curso ya tiene docente en la sección, debe ser el mismo.' },
  { nombre: 'Aula', regla: 'Nombre exacto de un aula registrada.' },
  { nombre: 'Día', regla: 'Lunes, Martes, Miércoles, Jueves o Viernes.' },
  { nombre: 'Hora inicio', regla: 'Formato HH:mm, por ejemplo 08:00.' },
  { nombre: 'Hora fin', regla: 'Formato HH:mm, posterior a la hora de inicio.' }
];

/**
 * Carga masiva de bloques horarios desde un CSV (HU-GEMIH-08 y HU-GEMIH-09): descarga de la plantilla,
 * elección del archivo y año académico, y resultado por fila. El backend valida todas las filas y solo
 * crea bloques si ninguna tiene errores.
 *
 * @param {Object} props
 * @param {Array<{ id: string|number, anio: string|number }>} props.anios Años académicos disponibles.
 * @param {(resultado: { filasProcesadas: number, bloquesCreados: number }) => void} props.alCompletar
 *   Se llama cuando la carga termina sin errores; quien lo usa decide si cierra el diálogo.
 * @param {() => void} props.alCancelar
 */
export default function DialogoCargaMasiva({ anios, alCompletar, alCancelar }) {
  const [archivo, establecerArchivo] = useState(null);
  const [anioId, establecerAnioId] = useState('');
  const [estadoPlantilla, establecerEstadoPlantilla] = useState('inactivo');
  const [errorPlantilla, establecerErrorPlantilla] = useState('');
  const [errorArchivo, establecerErrorArchivo] = useState('');
  const [errorGeneral, establecerErrorGeneral] = useState(null);
  const [erroresFilas, establecerErroresFilas] = useState([]);
  const [subiendo, establecerSubiendo] = useState(false);

  async function descargarPlantilla() {
    establecerEstadoPlantilla('descargando');
    establecerErrorPlantilla('');
    const respuesta = await descargarPlantillaBloquesCsv();
    if (!respuesta.exitoso || !(respuesta.datos instanceof Blob)) {
      establecerErrorPlantilla(respuesta.mensaje || 'No se pudo descargar la plantilla.');
      establecerEstadoPlantilla('inactivo');
      return;
    }
    guardarArchivo(respuesta.datos, NOMBRE_PLANTILLA);
    establecerEstadoPlantilla('solicitada');
  }

  function elegirArchivo(evento) {
    const elegido = evento.target.files?.[0] ?? null;
    evento.target.value = '';
    establecerErrorGeneral(null);
    establecerErroresFilas([]);
    if (elegido && !elegido.name.toLowerCase().endsWith('.csv')) {
      establecerArchivo(null);
      establecerErrorArchivo('Selecciona un archivo con extensión .csv.');
      return;
    }
    establecerErrorArchivo('');
    establecerArchivo(elegido);
  }

  async function cargar(evento) {
    evento.preventDefault();
    if (!archivo) {
      establecerErrorArchivo('Selecciona el archivo CSV que quieres cargar.');
      return;
    }
    establecerSubiendo(true);
    establecerErrorGeneral(null);
    establecerErroresFilas([]);
    const respuesta = await cargarBloquesCsv(archivo, anioId === '' ? undefined : anioId);
    establecerSubiendo(false);

    const errores = Array.isArray(respuesta.datos?.errores) ? respuesta.datos.errores : [];
    if (errores.length > 0) {
      establecerErroresFilas(errores);
      return;
    }
    if (!respuesta.exitoso) {
      establecerErrorGeneral(respuesta.mensaje || MENSAJE_ERROR_GENERICO);
      return;
    }
    alCompletar(respuesta.datos ?? { filasProcesadas: 0, bloquesCreados: 0 });
  }

  return (
    <DialogoBase
      idTitulo="dialogo-carga-masiva-horarios"
      titulo="Carga masiva de horarios"
      subtitulo="Archivo CSV"
      anchoMaximo="46rem"
      textoConfirmar="Cargar horarios"
      textoEnviando="Cargando…"
      enviando={subiendo}
      confirmarDeshabilitado={!archivo}
      error={errorGeneral}
      cerrarAlClicFuera={false}
      alCancelar={alCancelar}
      alConfirmar={cargar}
    >
      <div className={estilos.contenido}>
        <section className={estilos.tarjeta} aria-labelledby="carga-masiva-plantilla">
          <span className={estilos.iconoTarjeta} aria-hidden="true">
            <Icono nombre="archivo" tamano={22} />
          </span>
          <div className={estilos.textoTarjeta}>
            <h3 id="carga-masiva-plantilla" className={estilos.subtitulo}>Plantilla de horarios</h3>
            <p className={estilos.texto}>Prepara la programación semanal de varias secciones en un archivo CSV.</p>
            <p className={estilos.nota}>{NOMBRE_PLANTILLA} · UTF-8 · Separador: punto y coma (;)</p>
          </div>
          <button
            type="button"
            className={estilos.botonPrimario}
            disabled={estadoPlantilla === 'descargando' || subiendo}
            onClick={descargarPlantilla}
          >
            {estadoPlantilla === 'descargando' ? 'Descargando…' : 'Descargar plantilla CSV'}
          </button>
        </section>

        {estadoPlantilla === 'solicitada' && (
          <p role="status" className={estilos.exito}>Descarga solicitada. Revisa las descargas de tu navegador.</p>
        )}
        {errorPlantilla && <p role="alert" className={estilos.error}>{errorPlantilla}</p>}

        <section aria-labelledby="carga-masiva-pasos">
          <h3 id="carga-masiva-pasos" className={estilos.subtitulo}>Cómo preparar el archivo</h3>
          <ol className={estilos.pasos}>
            <li>Descarga la plantilla y ábrela en Excel o en tu editor de hojas de cálculo.</li>
            <li>Conserva los ocho encabezados y su orden. Añade una fila por bloque horario.</li>
            <li>
              Elimina la fila de ejemplo antes de completar tus datos. Está identificada con{' '}
              <strong>EJEMPLO</strong> en Grado.
            </li>
            <li>
              Guarda como <strong>CSV UTF-8</strong> para conservar tildes y la ñ.
            </li>
          </ol>
        </section>

        <section aria-labelledby="carga-masiva-columnas">
          <h3 id="carga-masiva-columnas" className={estilos.subtitulo}>Columnas y reglas de llenado</h3>
          <div className={estilos.columnas}>
            <p className={estilos.rotulo}>Ocho columnas obligatorias, en este orden</p>
            <ul className={estilos.lista}>
              {COLUMNAS.map((columna) => (
                <li key={columna.nombre}>
                  <strong>{columna.nombre}:</strong> {columna.regla}
                </li>
              ))}
            </ul>
          </div>
          <p className={estilos.nota}>
            El sistema valida todas las filas antes de guardar: si alguna tiene errores, no se crea ningún bloque.
            Un docente, una sección o un aula no pueden tener dos bloques a la misma hora. Máximo 1000 filas.
          </p>
        </section>

        <section className={estilos.subida} aria-labelledby="carga-masiva-subida">
          <h3 id="carga-masiva-subida" className={estilos.subtitulo}>Subir archivo</h3>
          <div className={estilos.campoAnio}>
            <label htmlFor="carga-masiva-anio" className={estilos.etiqueta}>Año académico</label>
            <select
              id="carga-masiva-anio"
              className={estilos.select}
              value={anioId}
              disabled={subiendo}
              onChange={(evento) => establecerAnioId(evento.target.value)}
            >
              <option value="">Año en preparación (automático)</option>
              {anios.map((anio) => (
                <option key={anio.id} value={anio.id}>{anio.anio}</option>
              ))}
            </select>
          </div>

          <div className={estilos.acciones}>
            <label className={`${estilos.botonSecundario} ${subiendo ? estilos.botonInactivo : ''}`}>
              <Icono nombre="subir" tamano={16} />
              Seleccionar archivo CSV
              <input
                type="file"
                accept=".csv,text/csv"
                className={estilos.archivo}
                disabled={subiendo}
                onChange={elegirArchivo}
              />
            </label>
            <span className={estilos.nombreArchivo}>{archivo ? archivo.name : 'Ningún archivo seleccionado'}</span>
          </div>
          {errorArchivo && <p role="alert" className={estilos.error}>{errorArchivo}</p>}
        </section>

        {erroresFilas.length > 0 && (
          <div role="alert" className={estilos.errores}>
            <strong>
              No se creó ningún bloque. Corrige estos problemas y vuelve a cargar el archivo:
            </strong>
            <ul>
              {erroresFilas.slice(0, MAXIMO_ERRORES_VISIBLES).map((error, indice) => (
                <li key={`${indice}-${error.fila}`}>Fila {error.fila}: {error.mensaje}</li>
              ))}
            </ul>
            {erroresFilas.length > MAXIMO_ERRORES_VISIBLES && (
              <p>Y {erroresFilas.length - MAXIMO_ERRORES_VISIBLES} errores más.</p>
            )}
          </div>
        )}
      </div>
    </DialogoBase>
  );
}
