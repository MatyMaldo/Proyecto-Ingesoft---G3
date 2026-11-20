import { useEffect, useState } from 'react';
import EstadoConsulta from '../../../shared/components/EstadoConsulta.jsx';
import DialogoBase from '../../../shared/components/DialogoBase.jsx';
import SelectFiltro from '../../../shared/components/SelectFiltro.jsx';
import useAuth from '../../../shared/auth/useAuth.js';
import { ROLES } from '../../../shared/auth/roles.js';
import { listarEstudiantesConsulta } from '../../../features/evaluaciones/services/consultaNotasService.js';
import DetalleLibreta from '../components/DetalleLibreta.jsx';
import TarjetaLibreta from '../components/TarjetaLibreta.jsx';
import TarjetaLibretaPendiente from '../components/TarjetaLibretaPendiente.jsx';
import {
  listarAniosAcademicosLibretas,
  listarLibretasDelEstudiante,
  obtenerDetalleLibreta,
  obtenerPdfLibreta
} from '../services/libretasService.js';
import { etiquetaBimestre } from '../utils/formatoLibreta.js';
import estilos from './PaginaLibretasEstudiante.module.css';

const evitarEnvio = (evento) => evento.preventDefault();

function elegirAnioInicial(anios) {
  const ordenados = [...anios].sort((a, b) => Number(b.anio) - Number(a.anio));
  return ordenados.find((anio) => Number(anio.anio) === new Date().getFullYear())
    ?? ordenados[0]
    ?? null;
}

const BIMESTRES_POR_ANIO = 4;
const numeroBimestre = (libreta) => Number(String(libreta.nombreBimestre).replace(/\D/g, ''));

/** Los cuatro bimestres del año en orden; los que no tienen libreta generada quedan como espacio pendiente. */
function espaciosBimestres(libretas) {
  const espacios = Array.from({ length: BIMESTRES_POR_ANIO }, (_, indice) => {
    const numero = indice + 1;
    const libreta = libretas.find((item) => numeroBimestre(item) === numero);
    return { clave: `BIM_${numero}`, nombreBimestre: `BIM_${numero}`, libreta };
  });
  const adicionales = libretas
    .filter((item) => !(numeroBimestre(item) >= 1 && numeroBimestre(item) <= BIMESTRES_POR_ANIO))
    .map((libreta) => ({ clave: String(libreta.idLibreta), nombreBimestre: libreta.nombreBimestre, libreta }));
  return [...espacios, ...adicionales];
}

function nombreEstudiante(estudiante) {
  return estudiante?.nombreCompleto
    ?? [estudiante?.nombre, estudiante?.apellidoPaterno, estudiante?.apellidoMaterno].filter(Boolean).join(' ')
    ?? estudiante?.codigo
    ?? String(estudiante?.id ?? '');
}

/**
 * Libreta de notas de estudiante y apoderado. Misma estructura que los módulos del admin: cabecera en una línea,
 * filtros, tarjetas que se desplazan por dentro y el detalle de la libreta en un diálogo. El breadcrumb lo pinta el shell.
 */
export default function PaginaLibretasEstudiante() {
  const { usuario } = useAuth();
  const esEstudiante = usuario?.rol === ROLES.ESTUDIANTE;
  const [anios, setAnios] = useState([]);
  const [anioId, setAnioId] = useState('');
  const [estadoAnios, setEstadoAnios] = useState('cargando');
  const [errorAnios, setErrorAnios] = useState('');
  const [estudiantes, setEstudiantes] = useState([]);
  const [estudianteId, setEstudianteId] = useState(esEstudiante ? String(usuario?.id ?? '') : '');
  const [estadoEstudiantes, setEstadoEstudiantes] = useState('cargando');
  const [errorEstudiantes, setErrorEstudiantes] = useState('');
  const [libretas, setLibretas] = useState([]);
  const [estadoLibretas, setEstadoLibretas] = useState('inactivo');
  const [errorLibretas, setErrorLibretas] = useState('');
  const [libretaId, setLibretaId] = useState('');
  const [detalle, setDetalle] = useState(null);
  const [estadoDetalle, setEstadoDetalle] = useState('inactivo');
  const [errorDetalle, setErrorDetalle] = useState('');
  const [errorPdf, setErrorPdf] = useState('');
  const [pdfCargando, setPdfCargando] = useState(false);
  const [recarga, setRecarga] = useState(0);

  useEffect(() => {
    let activa = true;
    setEstadoAnios('cargando');
    setErrorAnios('');
    listarAniosAcademicosLibretas().then((respuesta) => {
      if (!activa) return;
      const datos = Array.isArray(respuesta.datos) ? respuesta.datos : respuesta.datos?.anios;
      if (!respuesta.exitoso || !Array.isArray(datos)) {
        setErrorAnios(respuesta.mensaje || 'No se pudieron cargar los años académicos.');
        setEstadoAnios('error');
        return;
      }
      if (!datos.length) {
        setErrorAnios('No hay años académicos configurados.');
        setEstadoAnios('error');
        return;
      }
      const inicial = elegirAnioInicial(datos);
      setAnios(datos);
      setAnioId(String(inicial?.id ?? ''));
      setEstadoAnios('listo');
    });
    return () => { activa = false; };
  }, []);

  useEffect(() => {
    let activa = true;
    setEstadoEstudiantes('cargando');
    setErrorEstudiantes('');
    listarEstudiantesConsulta(usuario).then((respuesta) => {
      if (!activa) return;
      if (!respuesta.exitoso || !Array.isArray(respuesta.datos)) {
        setEstudiantes([]);
        setErrorEstudiantes(respuesta.mensaje || 'No se pudo cargar la lista de estudiantes.');
        setEstadoEstudiantes('error');
        return;
      }
      const lista = respuesta.datos;
      setEstudiantes(lista);
      const idInicial = esEstudiante
        ? String(usuario?.id ?? '')
        : String(lista[0]?.id ?? '');
      setEstudianteId(idInicial);
      setEstadoEstudiantes('listo');
    });
    return () => { activa = false; };
  }, [usuario?.id, usuario?.rol]);

  useEffect(() => {
    setLibretaId('');
    setDetalle(null);
    setEstadoDetalle('inactivo');
    setErrorDetalle('');
    setErrorPdf('');
    if (!anioId || !estudianteId || estadoEstudiantes !== 'listo') {
      setLibretas([]);
      setEstadoLibretas('inactivo');
      return undefined;
    }

    let activa = true;
    setLibretas([]);
    setEstadoLibretas('cargando');
    setErrorLibretas('');
    listarLibretasDelEstudiante(usuario, estudianteId, anioId).then((respuesta) => {
      if (!activa) return;
      if (!respuesta.exitoso || !Array.isArray(respuesta.datos)) {
        setErrorLibretas(respuesta.mensaje || 'No se pudieron cargar las libretas parciales de notas.');
        setEstadoLibretas('error');
        return;
      }
      const ordenadas = [...respuesta.datos].sort((a, b) => (
        Number(String(b.nombreBimestre).replace(/\D/g, ''))
        - Number(String(a.nombreBimestre).replace(/\D/g, ''))
      ));
      setLibretas(ordenadas);
      setEstadoLibretas('listo');
    });
    return () => { activa = false; };
  }, [anioId, estudianteId, estadoEstudiantes, recarga, usuario?.id, usuario?.rol]);

  useEffect(() => {
    if (!libretaId || !estudianteId) {
      setDetalle(null);
      setEstadoDetalle('inactivo');
      setErrorDetalle('');
      return undefined;
    }
    let activa = true;
    setDetalle(null);
    setEstadoDetalle('cargando');
    setErrorDetalle('');
    obtenerDetalleLibreta(usuario, estudianteId, libretaId).then((respuesta) => {
      if (!activa) return;
      if (!respuesta.exitoso || !respuesta.datos) {
        setErrorDetalle(respuesta.mensaje || 'No se pudo cargar el detalle de la libreta parcial.');
        setEstadoDetalle('error');
        return;
      }
      setDetalle(respuesta.datos);
      setEstadoDetalle('listo');
    });
    return () => { activa = false; };
  }, [libretaId, estudianteId, usuario?.id, usuario?.rol]);

  async function visualizarPdf() {
    const ventana = window.open('', '_blank');
    if (!ventana) {
      setErrorPdf('Permite las ventanas emergentes para visualizar la libreta parcial en PDF.');
      return;
    }
    ventana.opener = null;
    setErrorPdf('');
    setPdfCargando(true);
    const respuesta = await obtenerPdfLibreta(usuario, estudianteId, detalle.idLibreta);
    setPdfCargando(false);
    if (!respuesta.exitoso || !(respuesta.datos instanceof Blob)) {
      ventana.close();
      setErrorPdf(respuesta.mensaje || 'No se pudo abrir el PDF de la libreta parcial.');
      return;
    }
    const url = URL.createObjectURL(respuesta.datos);
    ventana.location.href = url;
    window.setTimeout(() => URL.revokeObjectURL(url), 60000);
  }

  function cerrarDetalle() {
    setLibretaId('');
    setErrorPdf('');
  }

  const estudianteSeleccionado = estudiantes.find((item) => String(item.id) === estudianteId);
  const libretaSeleccionada = libretas.find((item) => String(item.idLibreta) === libretaId);
  const listoParaConsultar = estadoAnios === 'listo' && estadoEstudiantes === 'listo' && estudianteId && anioId;
  const hayLibretas = listoParaConsultar && estadoLibretas === 'listo' && libretas.length > 0;
  const nombreSeleccionado = nombreEstudiante(estudianteSeleccionado);

  return (
    <div className={estilos.pagina}>
      <header className={estilos.cabecera}>
        <div className={estilos.textoCabecera}>
          <h1 className={estilos.titulo}>Libretas parciales de notas</h1>
          <p className={estilos.descripcion}>
            {esEstudiante
              ? 'Consulta tus libretas parciales generadas por año académico.'
              : 'Selecciona un estudiante bajo tu cargo y un año académico para consultar sus libretas parciales.'}
          </p>
        </div>
      </header>

      <section className={estilos.filtros} aria-label="Filtros de libretas parciales">
        <SelectFiltro
          apilado
          id="filtro-anio-libretas"
          etiqueta="Año académico"
          valor={anioId}
          opciones={anios.length
            ? anios.map((anio) => ({ valor: String(anio.id), etiqueta: String(anio.anio ?? anio.nombre ?? anio.id) }))
            : [{ valor: '', etiqueta: 'Sin años académicos' }]}
          alCambiar={setAnioId}
          deshabilitado={estadoAnios !== 'listo'}
        />
        {!esEstudiante && (
          <SelectFiltro
            apilado
            id="filtro-estudiante-libretas"
            etiqueta="Estudiante"
            valor={estudianteId}
            opciones={estudiantes.length
              ? estudiantes.map((estudiante) => ({
                valor: String(estudiante.id),
                etiqueta: nombreEstudiante(estudiante)
              }))
              : [{ valor: '', etiqueta: 'Sin estudiantes vinculados' }]}
            alCambiar={setEstudianteId}
            deshabilitado={estadoEstudiantes !== 'listo' || estudiantes.length === 0}
          />
        )}
      </section>

      {hayLibretas && (
        <section className={estilos.zonaLibretas} aria-label="Libretas parciales de notas">
          <ul className={estilos.rejilla}>
            {espaciosBimestres(libretas).map((espacio) => (
              <li key={espacio.clave}>
                {espacio.libreta ? (
                  <TarjetaLibreta
                    libreta={espacio.libreta}
                    alVerDetalle={(item) => setLibretaId(String(item.idLibreta))}
                  />
                ) : <TarjetaLibretaPendiente nombreBimestre={espacio.nombreBimestre} />}
              </li>
            ))}
          </ul>
        </section>
      )}

      {!hayLibretas && (
        <section
          className={estilos.tarjetaResultados}
          aria-label="Libretas parciales disponibles"
          aria-busy={estadoLibretas === 'cargando' || undefined}
        >
          {estadoAnios === 'cargando' && <EstadoConsulta tipo="carga" filasEsqueleto={3} />}
          {estadoAnios === 'error' && (
            <EstadoConsulta tipo="error" mensaje={errorAnios} alReintentar={() => window.location.reload()} />
          )}
          {estadoAnios === 'listo' && estadoEstudiantes === 'cargando' && (
            <EstadoConsulta tipo="carga" filasEsqueleto={3} />
          )}
          {estadoEstudiantes === 'error' && (
            <EstadoConsulta tipo="error" mensaje={errorEstudiantes} alReintentar={() => window.location.reload()} />
          )}
          {estadoAnios === 'listo' && estadoEstudiantes === 'listo' && !esEstudiante && !estudiantes.length && (
            <EstadoConsulta tipo="vacio" mensaje="No hay estudiantes asociados a tu cuenta de apoderado." />
          )}
          {listoParaConsultar && estadoLibretas === 'cargando' && (
            <EstadoConsulta tipo="carga" mensaje="Cargando libretas parciales…" filasEsqueleto={3} />
          )}
          {listoParaConsultar && estadoLibretas === 'error' && (
            <EstadoConsulta tipo="error" mensaje={errorLibretas} alReintentar={() => setRecarga((n) => n + 1)} />
          )}
          {listoParaConsultar && estadoLibretas === 'listo' && !libretas.length && (
            <EstadoConsulta tipo="vacio" mensaje="No hay libretas parciales generadas para este estudiante y año académico." />
          )}
        </section>
      )}

      {libretaSeleccionada && (
        <DialogoBase
          idTitulo="dialogo-libreta"
          titulo={`Libreta parcial · ${etiquetaBimestre(libretaSeleccionada.nombreBimestre)} ${libretaSeleccionada.anioAcademico}`}
          subtitulo={nombreSeleccionado}
          textoConfirmar="Visualizar PDF"
          textoEnviando="Abriendo PDF…"
          textoCancelar="Cerrar"
          enviando={pdfCargando}
          confirmarDeshabilitado={estadoDetalle !== 'listo'}
          anchoMaximo="60rem"
          cerrarAlClicFuera={false}
          botonesExpandidos
          error={errorPdf || errorDetalle || null}
          alCancelar={cerrarDetalle}
          alConfirmar={(evento) => { evitarEnvio(evento); visualizarPdf(); }}
        >
          {estadoDetalle === 'cargando' && <EstadoConsulta tipo="carga" mensaje="Cargando libreta parcial…" filasEsqueleto={3} />}
          {detalle && estadoDetalle === 'listo' && (
            <DetalleLibreta detalle={detalle} estudiante={nombreSeleccionado} />
          )}
        </DialogoBase>
      )}
    </div>
  );
}
