import { useEffect, useRef } from 'react';

import Icono from './Icono.jsx';
import estilos from './DialogoBase.module.css';

// Con varios diálogos apilados (p. ej. una confirmación sobre un formulario) el desplazamiento de la página
// se restaura solo cuando se cierra el último, sin importar el orden en que se desmonten.
let dialogosAbiertos = 0;
let overflowOriginal = '';

/**
 * Diálogo modal con encabezado, cuerpo, mensaje de error y botones Cancelar / Confirmar.
 * Implementado con `<dialog>` + `showModal()` (capa superior, fondo inerte, Esc y foco atrapado de
 * forma nativa), igual que `DetalleTransaccion` de Auditorías.
 *
 * El componente se monta ya abierto y se desmonta para cerrarse: cada apertura empieza con estado limpio.
 * Todo el contenido va dentro de un `<form>`; el botón Confirmar lo envía (`alConfirmar`).
 *
 * @param {Object} props
 * @param {string} props.idTitulo Id del título (para `aria-labelledby`).
 * @param {string} props.titulo
 * @param {string} [props.subtitulo]
 * @param {string} props.textoConfirmar
 * @param {string} props.textoEnviando Texto del botón mientras `enviando` es `true`.
 * @param {boolean} [props.enviando] Bloquea cierre y botones mientras se espera al servidor.
 * @param {boolean} [props.confirmarDeshabilitado]
 * @param {string|null} [props.error] Mensaje de error general (se anuncia con `role="alert"`).
 * @param {string} [props.anchoMaximo] Ancho máximo del diálogo (por ejemplo `'56rem'`); por defecto 30 rem.
 * @param {boolean} [props.cerrarAlClicFuera] Si es `false`, pulsar en el velo no cierra el diálogo (por defecto `true`).
 * @param {boolean} [props.sinConfirmar] Oculta el botón de confirmar (diálogos informativos).
 * @param {boolean} [props.sinCancelar] Oculta el botón de cancelar (diálogos que solo se confirman, p. ej. un resultado).
 * @param {string} [props.textoCancelar]
 * @param {string} [props.notaPie] Texto auxiliar a la izquierda de los botones.
 * @param {boolean} [props.confirmarPeligro] Pinta el botón de confirmar como acción crítica (rojo, GUI §4).
 * @param {boolean} [props.botonesExpandidos] En pantallas angostas (≤ 480 px) los botones del pie ocupan todo el ancho,
 *   con el principal arriba, para pulsarlos con el pulgar.
 * @param {boolean} [props.enfocarCancelar] Al abrir, el foco va a Cancelar (la opción segura en confirmaciones).
 * @param {() => void} [props.alSolicitarCierre] Si se indica, Esc, X, Cancelar y el velo ya no cierran el diálogo por sí
 *   solos: llaman a esta función para que quien lo usa decida (p. ej. pedir confirmación antes de descartar cambios).
 * @param {() => void} props.alCancelar Se llama al cerrar el diálogo (Esc, clic en el velo, X o Cancelar).
 * @param {(evento: SubmitEvent) => void} props.alConfirmar
 * @param {import('react').ReactNode} props.children Cuerpo del diálogo.
 */
export default function DialogoBase({
  idTitulo,
  titulo,
  subtitulo,
  textoConfirmar,
  textoEnviando,
  enviando = false,
  confirmarDeshabilitado = false,
  error = null,
  notaPie,
  anchoMaximo,
  cerrarAlClicFuera = true,
  sinConfirmar = false,
  sinCancelar = false,
  confirmarPeligro = false,
  enfocarCancelar = false,
  botonesExpandidos = false,
  textoCancelar = 'Cancelar',
  alSolicitarCierre,
  alCancelar,
  alConfirmar,
  children
}) {
  const refDialogo = useRef(null);
  const refAlCancelar = useRef(alCancelar);
  const refEnviando = useRef(enviando);
  const refAlSolicitarCierre = useRef(alSolicitarCierre);
  refAlCancelar.current = alCancelar;
  refEnviando.current = enviando;
  refAlSolicitarCierre.current = alSolicitarCierre;

  useEffect(() => {
    const dialogo = refDialogo.current;
    if (!dialogo) {
      return undefined;
    }

    if (!dialogo.open) {
      dialogo.showModal();
    }
    // El elemento marcado con `data-enfoque-inicial` recibe el foco al abrir (por defecto, el botón X).
    (dialogo.querySelector('[data-enfoque-inicial]') ?? dialogo.querySelector('button'))?.focus();

    const manejarCierre = () => {
      const solicitarCierre = refAlSolicitarCierre.current;
      if (!solicitarCierre) {
        refAlCancelar.current();
        return;
      }
      // Algunos navegadores cierran el diálogo con una segunda pulsación de Esc aunque se haya cancelado la
      // primera: se vuelve a abrir y se deja que quien lo usa decida si de verdad se cierra.
      if (!dialogo.open && dialogo.isConnected) {
        dialogo.showModal();
      }
      solicitarCierre();
    };
    // Mientras se guarda no se permite cerrar con Esc; con `alSolicitarCierre`, Esc solo lo solicita.
    const manejarCancelacion = (evento) => {
      // Un <input type="file"> también dispara `cancel` (y burbuja) cuando se cierra el explorador de archivos
      // sin elegir nada. Eso no es Esc sobre el diálogo y no debe cerrarlo: solo cuenta el evento del propio diálogo.
      if (evento.target !== dialogo) {
        return;
      }
      if (refEnviando.current) {
        evento.preventDefault();
        return;
      }
      if (refAlSolicitarCierre.current) {
        evento.preventDefault();
        refAlSolicitarCierre.current();
      }
    };

    dialogo.addEventListener('close', manejarCierre);
    dialogo.addEventListener('cancel', manejarCancelacion);

    if (dialogosAbiertos === 0) {
      overflowOriginal = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }
    dialogosAbiertos += 1;

    return () => {
      dialogo.removeEventListener('close', manejarCierre);
      dialogo.removeEventListener('cancel', manejarCancelacion);
      dialogosAbiertos -= 1;
      if (dialogosAbiertos === 0) {
        document.body.style.overflow = overflowOriginal;
      }
    };
  }, []);

  const cerrar = () => {
    if (alSolicitarCierre) {
      alSolicitarCierre();
      return;
    }
    refDialogo.current?.close();
  };

  const manejarClicDialogo = (evento) => {
    if (cerrarAlClicFuera && evento.target === refDialogo.current && !enviando) {
      cerrar();
    }
  };

  return (
    <dialog
      ref={refDialogo}
      className={estilos.dialogo}
      style={anchoMaximo ? { maxWidth: anchoMaximo } : undefined}
      aria-modal="true"
      aria-labelledby={idTitulo}
      onClick={manejarClicDialogo}
    >
      <form noValidate onSubmit={alConfirmar} aria-busy={enviando} className={estilos.formulario}>
        <div className={estilos.encabezado}>
          <div>
            <h2 id={idTitulo} className={estilos.titulo}>
              {titulo}
            </h2>
            {subtitulo && <p className={estilos.subtitulo}>{subtitulo}</p>}
          </div>
          <button
            type="button"
            className={estilos.botonCerrar}
            aria-label="Cerrar"
            disabled={enviando}
            onClick={cerrar}
          >
            <Icono nombre="cerrar" tamano={20} />
          </button>
        </div>

        <div className={estilos.cuerpo}>
          {children}

          <div role="alert" className={error ? estilos.alertaGeneral : undefined}>
            {error && (
              <>
                <Icono nombre="alerta" tamano={18} />
                <span>{error}</span>
              </>
            )}
          </div>
        </div>

        <div className={botonesExpandidos ? `${estilos.pie} ${estilos.pieExpandido}` : estilos.pie}>
          {notaPie && <span className={estilos.notaPie}>{notaPie}</span>}
          {!sinCancelar && (
            <button
              type="button"
              className={estilos.botonSecundario}
              disabled={enviando}
              onClick={cerrar}
              data-enfoque-inicial={enfocarCancelar ? '' : undefined}
            >
              {textoCancelar}
            </button>
          )}
          {!sinConfirmar && (
            <button
              type="submit"
              className={confirmarPeligro ? `${estilos.botonPrimario} ${estilos.botonPeligro}` : estilos.botonPrimario}
              disabled={enviando || confirmarDeshabilitado}
            >
              {enviando ? (
                <>
                  <Icono nombre="cargando" tamano={18} className={estilos.iconoCargando} />
                  {textoEnviando}
                </>
              ) : (
                textoConfirmar
              )}
            </button>
          )}
        </div>
      </form>
    </dialog>
  );
}
