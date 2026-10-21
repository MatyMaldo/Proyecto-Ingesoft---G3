import { useEffect, useRef } from 'react';

import Icono from '../../../shared/components/Icono.jsx';
import estilos from './DialogoBase.module.css';

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
 * @param {string} [props.notaPie] Texto auxiliar a la izquierda de los botones.
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
  alCancelar,
  alConfirmar,
  children
}) {
  const refDialogo = useRef(null);
  const refAlCancelar = useRef(alCancelar);
  const refEnviando = useRef(enviando);
  refAlCancelar.current = alCancelar;
  refEnviando.current = enviando;

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

    const manejarCierre = () => refAlCancelar.current();
    // Mientras se guarda no se permite cerrar con Esc.
    const manejarCancelacion = (evento) => {
      if (refEnviando.current) {
        evento.preventDefault();
      }
    };

    dialogo.addEventListener('close', manejarCierre);
    dialogo.addEventListener('cancel', manejarCancelacion);

    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      dialogo.removeEventListener('close', manejarCierre);
      dialogo.removeEventListener('cancel', manejarCancelacion);
      document.body.style.overflow = overflowPrevio;
    };
  }, []);

  const cerrar = () => {
    refDialogo.current?.close();
  };

  const manejarClicDialogo = (evento) => {
    if (evento.target === refDialogo.current && !enviando) {
      cerrar();
    }
  };

  return (
    <dialog
      ref={refDialogo}
      className={estilos.dialogo}
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

        <div className={estilos.pie}>
          {notaPie && <span className={estilos.notaPie}>{notaPie}</span>}
          <button type="button" className={estilos.botonSecundario} disabled={enviando} onClick={cerrar}>
            Cancelar
          </button>
          <button
            type="submit"
            className={estilos.botonPrimario}
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
        </div>
      </form>
    </dialog>
  );
}
