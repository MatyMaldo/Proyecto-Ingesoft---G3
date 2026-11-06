import { useState } from 'react';
import { USAR_MOCK } from '../../../shared/api/configuracionApi.js';
import Icono from '../../../shared/components/Icono.jsx';
import DialogoBase from '../../cursos/components/DialogoBase.jsx';
import { ROL_POR_TIPO_REGISTRO } from '../constants/rolesUsuario.js';
import {
  CODIGOS_ESTUDIANTE_HISTORICOS,
  registrarApoderado,
  registrarDocente,
  registrarEstudiante
} from '../services/usuariosService.js';
import {
  CSV_USUARIOS_COLUMNAS,
  descargarPlantillaCsv,
  leerCsv,
  validarFilasCsv
} from '../utils/cargaCsv.js';
import { telefonoPeru } from '../utils/telefono.js';
import estilos from './DialogoCargaCsv.module.css';
import DialogoDescartarCambios from './DialogoDescartarCambios.jsx';

const MAXIMO_ERRORES_VISIBLES = 30;
const MAXIMO_FILAS_VISTA_PREVIA = 8;

/**
 * Carga masiva de usuarios desde un CSV (HU-SAT-02). Mantiene la lectura, la validación y el registro fila a fila
 * de antes (primero apoderados, luego docentes y estudiantes). Al terminar, `alImportar` recibe la lista completa
 * de usuarios; `alImportacionCompleta` se llama solo si todas las filas se importaron sin errores.
 *
 * @param {Object} props
 * @param {Array} props.usuarios Usuarios ya cargados.
 * @param {(usuarios: Array) => void} props.alImportar
 * @param {(importados: number) => void} props.alImportacionCompleta
 * @param {() => void} props.alCerrar
 */
export default function DialogoCargaCsv({ usuarios, alImportar, alImportacionCompleta, alCerrar }) {
  const [nombreArchivo, setNombreArchivo] = useState('');
  const [filas, setFilas] = useState([]);
  const [errores, setErrores] = useState([]);
  const [resumen, setResumen] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const [confirmandoDescarte, setConfirmandoDescarte] = useState(false);

  // Hay algo que perder mientras haya un archivo elegido que aún no se importó.
  const hayCambios = Boolean(nombreArchivo) && !resumen;
  const solicitarCierre = () => (hayCambios ? setConfirmandoDescarte(true) : alCerrar());

  const elegirArchivo = async (evento) => {
    const archivo = evento.target.files?.[0];
    evento.target.value = '';
    setNombreArchivo(archivo?.name ?? '');
    setFilas([]);
    setErrores([]);
    setResumen(null);
    if (!archivo) return;
    if (!archivo.name.toLowerCase().endsWith('.csv')) {
      setErrores(['Selecciona un archivo con extensión .csv.']);
      return;
    }
    if (archivo.size > 5 * 1024 * 1024) {
      setErrores(['El archivo no debe superar los 5 MB.']);
      return;
    }
    try {
      const leidas = leerCsv(await archivo.text());
      const validacion = validarFilasCsv(leidas, usuarios, USAR_MOCK);
      setFilas(validacion.filasOrdenadas);
      setErrores(validacion.errores);
    } catch (error) {
      setErrores([error.message || 'No se pudo leer el archivo CSV.']);
    }
  };

  const importar = async (evento) => {
    evento.preventDefault();
    const { errores: erroresValidacion, filasOrdenadas } = validarFilasCsv(filas, usuarios, USAR_MOCK);
    if (erroresValidacion.length || !filasOrdenadas.length) {
      setErrores(erroresValidacion.length ? erroresValidacion : ['El archivo no contiene filas para importar.']);
      return;
    }

    setOcupado(true);
    const usuariosActuales = [...usuarios];
    const apoderadosPorDni = new Map(usuariosActuales
      .filter((usuario) => usuario.rol === 'Apoderado' && usuario.activo)
      .map((usuario) => [usuario.dni, usuario]));
    const codigosUsados = new Set([
      ...CODIGOS_ESTUDIANTE_HISTORICOS,
      ...usuariosActuales.map((usuario) => usuario.codigoEstudiante).filter(Boolean)
    ].map((codigo) => codigo.replace(/-/g, '').toUpperCase()));
    const erroresImportacion = [];
    let importados = 0;

    try {
      for (const [indice, fila] of filasOrdenadas.entries()) {
        let nuevoUsuario;
        const telefono = telefonoPeru(fila.telefono);
        const datosBase = {
          nombre: fila.nombre,
          apellidoPaterno: fila.apellidoPaterno,
          ...(fila.apellidoMaterno ? { apellidoMaterno: fila.apellidoMaterno } : {}),
          dni: fila.dni,
          email: fila.correo,
          ...(telefono ? { telefono } : {}),
          password: fila.password
        };
        const prefijoCodigo = USAR_MOCK ? 'EST-' : 'EST';
        let codigoEstudiante;

        if (fila.tipoUsuario === 'estudiante') {
          let correlativo = 1;
          do {
            codigoEstudiante = `${prefijoCodigo}${String(correlativo).padStart(3, '0')}`;
            correlativo += 1;
          } while (codigosUsados.has(codigoEstudiante.replace(/-/g, '').toUpperCase()));
          codigosUsados.add(codigoEstudiante.replace(/-/g, '').toUpperCase());
        }

        try {
          if (USAR_MOCK) {
            const apoderado = fila.tipoUsuario === 'estudiante' ? apoderadosPorDni.get(fila.dniApoderado) : null;
            if (fila.tipoUsuario === 'estudiante' && !apoderado) {
              erroresImportacion.push(`Fila ${fila.linea}: no se pudo asociar el apoderado ${fila.dniApoderado}.`);
              continue;
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
            let resultado;
            if (fila.tipoUsuario === 'apoderado') {
              resultado = await registrarApoderado({ ...datosBase, edad: Number(fila.edad) });
            } else if (fila.tipoUsuario === 'docente') {
              resultado = await registrarDocente(datosBase);
            } else {
              const apoderado = apoderadosPorDni.get(fila.dniApoderado);
              if (!apoderado) {
                erroresImportacion.push(`Fila ${fila.linea}: no se pudo asociar el apoderado ${fila.dniApoderado}; verifica que se haya creado correctamente.`);
                continue;
              }
              resultado = await registrarEstudiante({
                ...datosBase,
                codigo: codigoEstudiante,
                fechaNacimiento: fila.fechaNacimiento,
                apoderadoId: apoderado.id
              });
            }
            if (!resultado.exitoso || !resultado.datos) {
              erroresImportacion.push(`Fila ${fila.linea}: ${resultado.mensaje || 'el servidor rechazó el registro.'}`);
              continue;
            }
            nuevoUsuario = resultado.datos;
          }

          usuariosActuales.push(nuevoUsuario);
          if (fila.tipoUsuario === 'apoderado') apoderadosPorDni.set(fila.dni, nuevoUsuario);
          importados += 1;
        } catch (error) {
          erroresImportacion.push(`Fila ${fila.linea}: ${error.message || 'no fue posible registrar el usuario.'}`);
        }
      }
      alImportar(usuariosActuales);
      setResumen({ importados, errores: erroresImportacion });
      if (importados && erroresImportacion.length === 0) {
        alImportacionCompleta(importados);
      }
    } finally {
      setOcupado(false);
    }
  };

  const resumenConErrores = resumen?.errores.length > 0;

  return (
    <>
      <DialogoBase
        idTitulo="dialogo-carga-csv"
        titulo="Carga masiva de usuarios"
        subtitulo="Archivo CSV"
        textoConfirmar={filas.length ? `Importar ${filas.length} usuarios` : 'Importar usuarios'}
        textoEnviando="Importando..."
        enviando={ocupado}
        confirmarDeshabilitado={!filas.length || errores.length > 0}
        anchoMaximo="42rem"
        cerrarAlClicFuera={false}
        alSolicitarCierre={solicitarCierre}
        alCancelar={alCerrar}
        alConfirmar={importar}
      >
        <div className={estilos.contenido}>
          <p className={estilos.texto}>
            Descarga la plantilla y completa una fila por usuario. La carga procesa primero los apoderados, luego los docentes y finalmente los estudiantes, para que estos puedan quedar asociados a su apoderado aunque sus filas aparezcan antes en el archivo.
          </p>
          <div role="note" className={estilos.aviso}>
            <Icono nombre="alerta" tamano={18} />
            <div><strong>Importante:</strong> coloca primero todas las filas de tipo APODERADO. Después agrega docentes y estudiantes; cada estudiante debe tener el DNI de un apoderado incluido o ya registrado.</div>
          </div>

          <div className={estilos.acciones}>
            <button type="button" className={estilos.botonSecundario} onClick={descargarPlantillaCsv}>
              <Icono nombre="archivo" tamano={16} />
              Descargar plantilla CSV
            </button>
            <label className={`${estilos.botonPrimario} ${ocupado ? estilos.botonInactivo : ''}`}>
              <Icono nombre="subir" tamano={16} />
              Seleccionar archivo CSV
              <input
                type="file"
                accept=".csv,text/csv"
                className={estilos.archivo}
                onChange={elegirArchivo}
                disabled={ocupado}
                data-enfoque-inicial=""
              />
            </label>
          </div>

          <div className={estilos.columnas}>
            <p className={estilos.rotulo}>Columnas del archivo</p>
            <code className={estilos.codigo}>{CSV_USUARIOS_COLUMNAS.join(',')}</code>
            <ul className={estilos.lista}>
              <li>tipoUsuario: APODERADO, DOCENTE o ESTUDIANTE. Nombre, apellidoPaterno, DNI, correo y password son obligatorios.</li>
              <li>apellidoMaterno es opcional. telefono, cuando se incluye, debe tener 9 dígitos peruanos; es obligatorio para estudiantes y docentes en el modo de demostración.</li>
              <li>edad es obligatoria para apoderados. fechaNacimiento y dniApoderado son obligatorios para estudiantes.</li>
              <li>Incluye las filas de apoderados antes de estudiantes; el sistema también las procesa primero automáticamente.</li>
              <li>Usa fechas YYYY-MM-DD y guarda el archivo como CSV UTF-8. Los códigos de estudiante se generan automáticamente.</li>
            </ul>
          </div>

          {nombreArchivo && <p className={estilos.texto}>Archivo: <strong>{nombreArchivo}</strong></p>}
          {filas.length > 0 && <p className={estilos.texto}>Filas listas para revisar: <strong>{filas.length}</strong></p>}

          {errores.length > 0 && (
            <div role="alert" className={estilos.errores}>
              <strong>Corrige estos problemas antes de importar:</strong>
              <ul>
                {errores.slice(0, MAXIMO_ERRORES_VISIBLES).map((error, indice) => <li key={`${indice}-${error}`}>{error}</li>)}
              </ul>
              {errores.length > MAXIMO_ERRORES_VISIBLES && <p>Y {errores.length - MAXIMO_ERRORES_VISIBLES} errores más.</p>}
            </div>
          )}

          {filas.length > 0 && (
            <div className={estilos.vistaPrevia}>
              <table className={estilos.tabla}>
                <caption className={estilos.leyenda}>Vista previa del archivo</caption>
                <thead>
                  <tr>
                    {['Fila', 'Tipo', 'Nombre', 'DNI', 'Apoderado DNI'].map((columna) => <th key={columna} scope="col">{columna}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {filas.slice(0, MAXIMO_FILAS_VISTA_PREVIA).map((fila) => (
                    <tr key={fila.linea}>
                      <td>{fila.linea}</td>
                      <td>{fila.tipoUsuario}</td>
                      <td>{fila.nombre} {fila.apellidoPaterno}</td>
                      <td>{fila.dni}</td>
                      <td>{fila.dniApoderado || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filas.length > MAXIMO_FILAS_VISTA_PREVIA && (
                <p className={estilos.pieVistaPrevia}>Se muestran {MAXIMO_FILAS_VISTA_PREVIA} de {filas.length} filas.</p>
              )}
            </div>
          )}

          {resumen && (
            <div role={resumenConErrores ? 'alert' : 'status'} className={resumenConErrores ? estilos.resumenAviso : estilos.resumenExito}>
              <strong>Importación finalizada: {resumen.importados} usuarios creados.</strong>
              {resumenConErrores && (
                <ul>
                  {resumen.errores.map((error, indice) => <li key={`${indice}-${error}`}>{error}</li>)}
                </ul>
              )}
            </div>
          )}

          <p className={estilos.nota}>
            Si una fila falla en el servidor, las demás se intentan registrar y se muestran los resultados. Los usuarios creados correctamente no se revierten automáticamente.
          </p>
        </div>
      </DialogoBase>
      {confirmandoDescarte && (
        <DialogoDescartarCambios alDescartar={alCerrar} alSeguirEditando={() => setConfirmandoDescarte(false)} />
      )}
    </>
  );
}
