import { useState } from 'react';
import { USAR_MOCK } from '../../../shared/api/configuracionApi.js';
import Icono from '../../../shared/components/Icono.jsx';
import Insignia from '../../../shared/components/Insignia.jsx';
import useCoincideMedia from '../../../shared/hooks/useCoincideMedia.js';
import DialogoBase from '../../../shared/components/DialogoBase.jsx';
import { ROL_POR_TIPO_REGISTRO, TONO_ROL } from '../constants/rolesUsuario.js';
import {
  CODIGOS_ESTUDIANTE_HISTORICOS,
  registrarApoderado,
  registrarDocente,
  registrarEstudiante
} from '../services/usuariosService.js';
import {
  LIMITE_FILAS,
  LIMITE_TAMANO_BYTES,
  describirColumnasCsv,
  descargarPlantillaCsv,
  leerCsv,
  textoProblema,
  validarFilasCsv
} from '../utils/cargaCsv.js';
import { ejecutarConConcurrencia } from '../utils/concurrencia.js';
import { separarTelefono, telefonoPeru } from '../utils/telefono.js';
import estilos from './DialogoCargaCsv.module.css';
import DialogoDescartarCambios from './DialogoDescartarCambios.jsx';

// En pantallas compactas las filas son tarjetas altas: se muestran las primeras y el resto bajo demanda.
// En pantallas amplias se muestran todas, con desplazamiento dentro de la tabla.
const MAXIMO_FILAS_COMPACTA = 8;
// Peticiones de registro en vuelo a la vez: acelera la carga sin saturar un servidor de pocos recursos.
const CONCURRENCIA_IMPORTACION = 5;
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

/** Cede el hilo un instante para que el navegador pinte el estado "Leyendo…" antes de validar un archivo grande. */
const cederHilo = () => new Promise((resolver) => { setTimeout(resolver, 0); });

/**
 * Carga masiva de usuarios desde un CSV (HU-SAT-02). Mantiene la lectura, la validación y el registro fila a fila
 * de antes (primero apoderados, luego docentes y estudiantes). Tiene tres vistas: preparar el archivo (con su
 * revisión), el avance de la importación y el resultado por fila. Al terminar, `alImportar` recibe la lista completa
 * de usuarios; `alImportacionCompleta` se llama al cerrar el resultado solo si todas las filas se importaron.
 *
 * @param {Object} props
 * @param {Array} props.usuarios Usuarios ya cargados.
 * @param {(usuarios: Array) => void} props.alImportar
 * @param {(importados: number) => void} props.alImportacionCompleta
 * @param {() => void} props.alCerrar
 */
export default function DialogoCargaCsv({ usuarios, alImportar, alImportacionCompleta, alCerrar }) {
  const [nombreArchivo, setNombreArchivo] = useState('');
  const [tamanoArchivo, setTamanoArchivo] = useState(0);
  const [leyendo, setLeyendo] = useState(false);
  const [filas, setFilas] = useState([]);
  // Detalle de cada fila del archivo (con sus problemas) y errores que impiden leer el archivo completo.
  const [detalle, setDetalle] = useState([]);
  const [erroresArchivo, setErroresArchivo] = useState([]);
  const [soloErrores, setSoloErrores] = useState(false);
  const [verTodas, setVerTodas] = useState(false);
  const [arrastrando, setArrastrando] = useState(false);
  const [progreso, setProgreso] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const [confirmandoDescarte, setConfirmandoDescarte] = useState(false);
  const esCompacta = useCoincideMedia('(max-width: 767px)');

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
    setFilas([]);
    setDetalle([]);
    setErroresArchivo([]);
    setSoloErrores(false);
    setVerTodas(false);
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
    const validacion = validarFilasCsv(filas, usuarios, USAR_MOCK);
    const { errores: erroresValidacion, filasOrdenadas } = validacion;
    if (erroresValidacion.length || !filasOrdenadas.length) {
      setDetalle(validacion.detalleFilas);
      setSoloErrores(erroresValidacion.length > 0);
      setErroresArchivo(filasOrdenadas.length ? [] : ['El archivo no contiene filas para importar.']);
      return;
    }

    setOcupado(true);
    setProgreso({ hechas: 0, total: filasOrdenadas.length, etiqueta: '' });
    const usuariosActuales = [...usuarios];
    const apoderadosPorDni = new Map(usuariosActuales
      .filter((usuario) => usuario.rol === 'Apoderado' && usuario.activo)
      .map((usuario) => [usuario.dni, usuario]));
    const codigosUsados = new Set([
      ...CODIGOS_ESTUDIANTE_HISTORICOS,
      ...usuariosActuales.map((usuario) => usuario.codigoEstudiante).filter(Boolean)
    ].map((codigo) => codigo.replace(/-/g, '').toUpperCase()));
    // Un registro por fila procesada: creada o rechazada (con el motivo), para la pantalla de resultados.
    const resultados = [];
    const baseResultado = (fila) => ({
      linea: fila.linea,
      tipoUsuario: fila.tipoUsuario,
      nombre: [fila.nombre, fila.apellidoPaterno].filter(Boolean).join(' '),
      dni: fila.dni
    });
    const rechazar = (fila, motivo) => resultados.push({ ...baseResultado(fila), estado: 'rechazado', motivo });
    let importados = 0;

    // Los códigos de estudiante se reservan antes de enviar nada y en el orden de registro, para que sean
    // los mismos aunque las respuestas lleguen desordenadas al registrar varias filas a la vez.
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

    // `creados[orden]` conserva el orden de registro para armar la lista final aunque las filas terminen desordenadas.
    const creados = [];
    // Avance: filas ya terminadas (creadas o rechazadas) y, como etiqueta, la fila en curso más antigua.
    const enCurso = new Map();
    let completadas = 0;
    const publicarProgreso = () => {
      setProgreso({
        hechas: completadas,
        total: filasOrdenadas.length,
        etiqueta: enCurso.size ? enCurso.values().next().value : ''
      });
    };

    const registrarFila = async (fila, indice) => {
      let nuevoUsuario;
      const codigoEstudiante = codigoPorLinea.get(fila.linea);

      try {
        const telefono = telefonoPeru(fila.telefono);
        // El backend exige exactamente 9 dígitos (sin prefijo +51); el mock conserva el formato +51 para mostrarlo.
        const telefonoApi = separarTelefono(fila.telefono);
        const datosBase = {
          nombre: fila.nombre,
          apellidoPaterno: fila.apellidoPaterno,
          ...(fila.apellidoMaterno ? { apellidoMaterno: fila.apellidoMaterno } : {}),
          dni: fila.dni,
          email: fila.correo,
          ...(telefonoApi ? { telefono: telefonoApi } : {})
        };

        if (USAR_MOCK) {
          const apoderado = fila.tipoUsuario === 'estudiante' ? apoderadosPorDni.get(fila.dniApoderado) : null;
          if (fila.tipoUsuario === 'estudiante' && !apoderado) {
            rechazar(fila, `No se pudo asociar el apoderado ${fila.dniApoderado}.`);
            return;
          }
          nuevoUsuario = {
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
        } else {
          let respuesta;
          if (fila.tipoUsuario === 'apoderado') {
            respuesta = await registrarApoderado({ ...datosBase, edad: Number(fila.edad) });
          } else if (fila.tipoUsuario === 'docente') {
            respuesta = await registrarDocente(datosBase);
          } else {
            const apoderado = apoderadosPorDni.get(fila.dniApoderado);
            if (!apoderado) {
              rechazar(fila, `No se pudo asociar el apoderado ${fila.dniApoderado}; verifica que se haya creado correctamente.`);
              return;
            }
            respuesta = await registrarEstudiante({
              ...datosBase,
              codigo: codigoEstudiante,
              fechaNacimiento: fila.fechaNacimiento,
              apoderadoId: apoderado.id
            });
          }
          if (!respuesta.exitoso || !respuesta.datos) {
            rechazar(fila, respuesta.mensaje || 'El servidor rechazó el registro.');
            return;
          }
          nuevoUsuario = respuesta.datos;
        }

        creados[indice] = nuevoUsuario;
        if (fila.tipoUsuario === 'apoderado') apoderadosPorDni.set(fila.dni, nuevoUsuario);
        importados += 1;
        resultados.push({
          ...baseResultado(fila),
          estado: 'creado',
          codigo: fila.tipoUsuario === 'estudiante' ? (nuevoUsuario.codigoEstudiante ?? codigoEstudiante) : ''
        });
      } catch (error) {
        rechazar(fila, error.message || 'No fue posible registrar el usuario.');
      }
    };

    const procesarFila = async ({ fila, indice }) => {
      enCurso.set(indice, `${ROL_POR_TIPO_REGISTRO[fila.tipoUsuario]} · ${baseResultado(fila).nombre}`);
      publicarProgreso();
      try {
        await registrarFila(fila, indice);
      } finally {
        enCurso.delete(indice);
        completadas += 1;
        publicarProgreso();
      }
    };

    // Dos fases: los estudiantes necesitan el id de su apoderado, así que esperan a que terminen los apoderados
    // (los docentes no dependen de nadie y viajan con ellos). Dentro de cada fase se registra en paralelo.
    const filasConOrden = filasOrdenadas.map((fila, indice) => ({ fila, indice }));
    const sinDependencia = filasConOrden.filter(({ fila }) => fila.tipoUsuario !== 'estudiante');
    const estudiantes = filasConOrden.filter(({ fila }) => fila.tipoUsuario === 'estudiante');

    try {
      await ejecutarConConcurrencia(sinDependencia, CONCURRENCIA_IMPORTACION, procesarFila);
      await ejecutarConConcurrencia(estudiantes, CONCURRENCIA_IMPORTACION, procesarFila);
      for (const usuario of creados) {
        if (usuario) usuariosActuales.push(usuario);
      }
      alImportar(usuariosActuales);
      setResultado({
        importados,
        rechazados: resultados.length - importados,
        // En el resultado las filas se muestran en el orden del archivo, no en el de registro.
        filas: resultados.sort((a, b) => a.linea - b.linea)
      });
    } finally {
      setOcupado(false);
      setProgreso(null);
    }
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
  else if (hayErroresFilas) notaPie = `Corrige ${plural(filasConErrores.length, 'fila con errores', 'filas con errores')} para continuar.`;
  else if (hayArchivoValido) notaPie = `Se crearán ${describirConteo(conteos)}.`;

  const filasFiltradas = soloErrores ? filasConErrores : detalle;
  const filasVisibles = esCompacta && !verTodas ? filasFiltradas.slice(0, MAXIMO_FILAS_COMPACTA) : filasFiltradas;
  const filasOcultas = filasFiltradas.length - filasVisibles.length;
  const hayCodigos = resultado?.filas.some((fila) => fila.codigo) ?? false;

  return (
    <>
      <DialogoBase
        idTitulo="dialogo-carga-csv"
        titulo="Carga masiva de usuarios"
        subtitulo="Archivo CSV"
        textoConfirmar={resultado ? 'Listo' : (filas.length ? `Importar ${plural(filas.length, 'usuario', 'usuarios')}` : 'Importar usuarios')}
        textoEnviando="Importando..."
        sinCancelar={Boolean(resultado)}
        enviando={ocupado}
        confirmarDeshabilitado={!resultado && (!filas.length || hayErroresFilas || erroresArchivo.length > 0 || leyendo)}
        notaPie={notaPie}
        anchoMaximo="42rem"
        cerrarAlClicFuera={false}
        alSolicitarCierre={solicitarCierre}
        alCancelar={alCerrar}
        alConfirmar={importar}
      >
        <div className={estilos.contenido}>
          {vista === 'preparar' && (
            <>
              <div role="note" className={estilos.info}>
                <Icono nombre="informacion" tamano={18} />
                <div>
                  Cada estudiante necesita el DNI de un apoderado ya registrado o incluido en este mismo archivo. El orden de las filas
                  no importa: se registran primero los apoderados, luego los docentes y al final los estudiantes.
                  El archivo no lleva contraseñas: cada usuario recibirá un código de verificación en su correo para crear la suya.
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

              {erroresArchivo.length > 0 && (
                <div role="alert" className={estilos.errores}>
                  <strong>No se puede usar este archivo:</strong>
                  <ul>
                    {erroresArchivo.map((error, indice) => <li key={`${indice}-${error}`}>{error}</li>)}
                  </ul>
                </div>
              )}

              {detalle.length > 0 && (
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
                            <Insignia tono="rojo" className={estilos.insigniaIcono}>
                              <Icono nombre="alerta" tamano={14} />
                              {plural(filasConErrores.length, 'con error', 'con errores')}
                            </Insignia>
                          )}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  {hayErroresFilas && (
                    <label className={estilos.filtro}>
                      <input
                        type="checkbox"
                        checked={soloErrores}
                        onChange={(evento) => { setSoloErrores(evento.target.checked); setVerTodas(false); }}
                      />
                      Mostrar solo las filas con errores
                    </label>
                  )}

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
                    {!esCompacta && filasFiltradas.length > 8 && (
                      <p className={estilos.pieVistaPrevia}>
                        {filasFiltradas.length} filas en total. Desplázate dentro de la tabla para verlas todas.
                      </p>
                    )}
                    {filasOcultas > 0 && (
                      <p className={estilos.pieVistaPrevia}>
                        Se muestran {filasVisibles.length} de {filasFiltradas.length} filas.{' '}
                        <button type="button" className={estilos.botonEnlace} onClick={() => setVerTodas(true)}>
                          Mostrar las {filasFiltradas.length}
                        </button>
                      </p>
                    )}
                  </div>
                </section>
              )}

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

              <p className={estilos.nota}>
                Cada fila se registra por separado: si una falla, las demás continúan y los usuarios ya creados no se revierten.
              </p>
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
              <progress
                className={estilos.barra}
                value={progreso.hechas}
                max={progreso.total}
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
                        <Insignia tono="rojo" className={estilos.insigniaIcono}>
                          <Icono nombre="alerta" tamano={14} />
                          {plural(resultado.rechazados, 'rechazada', 'rechazadas')}
                        </Insignia>
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
                      {resultado.filas.map((fila) => (
                        <FilaResultado key={fila.linea} fila={fila} hayCodigos={hayCodigos} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

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
