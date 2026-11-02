import { useEffect, useRef, useState } from 'react';

import Icono from '../../../shared/components/Icono.jsx';
import estilosUtil from '../../../shared/styles/utilidades.module.css';
import { DESCRIPCION_ESPERA, ANUNCIO_ESPERA_INICIO, ANUNCIO_ESPERA_FIN } from '../constants/mensajesRestablecimiento.js';
import estilos from './BotonConEspera.module.css';

const ID_DESCRIPCION_ESPERA = 'boton-espera-descripcion';

/**
 * Botón que queda no disponible mientras corre la cuenta regresiva de
 * reenvío (60 s) o mientras se envía la solicitud. Anuncia el inicio y el
 * fin de la espera a los lectores de pantalla, no cada segundo (docs/planes/
 * restablecer-contrasena.md §4.5).
 *
 * @param {Object} props
 * @param {'submit'|'button'} props.tipo
 * @param {'primario'|'secundario'|'enlace'} props.variante
 * @param {string} props.texto
 * @param {string} props.textoEnviando
 * @param {number} props.segundosRestantes `0` = disponible.
 * @param {boolean} props.enviando
 * @param {() => void} [props.alPulsar] Solo con `tipo="button"`.
 */
export default function BotonConEspera({ tipo, variante, texto, textoEnviando, segundosRestantes, enviando, alPulsar }) {
  const noDisponible = segundosRestantes > 0 || enviando;
  const [anuncio, establecerAnuncio] = useState('');
  const enEsperaAnteriorRef = useRef(segundosRestantes > 0);

  useEffect(() => {
    const enEspera = segundosRestantes > 0;

    if (enEspera && !enEsperaAnteriorRef.current) {
      establecerAnuncio(ANUNCIO_ESPERA_INICIO);
    } else if (!enEspera && enEsperaAnteriorRef.current) {
      establecerAnuncio(ANUNCIO_ESPERA_FIN);
    }

    enEsperaAnteriorRef.current = enEspera;
  }, [segundosRestantes]);

  function manejarClic(evento) {
    if (tipo !== 'button') {
      return;
    }

    if (noDisponible) {
      evento.preventDefault();
      return;
    }

    alPulsar?.();
  }

  let contenido;
  if (enviando) {
    contenido = (
      <>
        <Icono nombre="cargando" tamano={18} className={estilos.iconoCargando} />
        {textoEnviando}
      </>
    );
  } else if (segundosRestantes > 0) {
    contenido = `${texto} (${segundosRestantes} s)`;
  } else {
    contenido = texto;
  }

  return (
    <>
      <button
        type={tipo}
        className={estilos[variante] ?? estilos.secundario}
        aria-disabled={noDisponible ? 'true' : undefined}
        aria-describedby={segundosRestantes > 0 ? ID_DESCRIPCION_ESPERA : undefined}
        onClick={manejarClic}
      >
        {contenido}
      </button>
      <span id={ID_DESCRIPCION_ESPERA} className={estilosUtil.ocultoVisualmente}>
        {DESCRIPCION_ESPERA}
      </span>
      <span role="status" className={estilosUtil.ocultoVisualmente}>
        {anuncio}
      </span>
    </>
  );
}
