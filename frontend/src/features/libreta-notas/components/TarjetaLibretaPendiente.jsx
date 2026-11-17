import Icono from '../../../shared/components/Icono.jsx';
import Insignia from '../../../shared/components/Insignia.jsx';
import { etiquetaBimestre } from '../utils/formatoLibreta.js';
import estilos from './TarjetaLibreta.module.css';

/**
 * Espacio de un bimestre cuya libreta aún no está generada. No es interactiva: solo completa los cuatro bimestres del
 * año para que se vea de un vistazo cuáles faltan.
 *
 * @param {Object} props
 * @param {string} props.nombreBimestre Nombre del bimestre ("BIM_2").
 */
export default function TarjetaLibretaPendiente({ nombreBimestre }) {
  return (
    <article className={`${estilos.tarjeta} ${estilos.pendiente}`} aria-label={`${etiquetaBimestre(nombreBimestre)}: libreta aún no generada`}>
      <div className={estilos.cabecera}>
        <span className={`${estilos.recuadroIcono} ${estilos.recuadroPendiente}`} aria-hidden="true">
          <Icono nombre="archivo" tamano={22} />
        </span>
        <div className={estilos.contenido}>
          <h3 className={estilos.titulo}>{etiquetaBimestre(nombreBimestre)}</h3>
          <p className={estilos.fecha}>Aún no generada</p>
        </div>
      </div>
      <div className={estilos.pie}>
        <Insignia tono="gris">Pendiente</Insignia>
      </div>
    </article>
  );
}
