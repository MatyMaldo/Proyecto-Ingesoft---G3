import { Link } from 'react-router-dom';

import Icono from '../../shared/components/Icono.jsx';
import estilos from './MigaDePan.module.css';

/**
 * Migas de pan de la pantalla actual.
 *
 * @param {Object} props
 * @param {Array<{ etiqueta: string, ruta?: string }>} props.migas Lista completa, con "Inicio" al inicio.
 */
export default function MigaDePan({ migas }) {
  if (!migas || migas.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Migas de pan" className={estilos.nav}>
      <ol className={estilos.lista}>
        {migas.map((miga, indice) => {
          const esUltima = indice === migas.length - 1;

          return (
            <li key={`${miga.etiqueta}-${indice}`} className={estilos.item}>
              {indice > 0 && (
                <span className={estilos.separador}>
                  <Icono nombre="chevron-derecha" tamano={16} />
                </span>
              )}
              {!esUltima && miga.ruta ? (
                <Link to={miga.ruta} className={estilos.enlace}>
                  {miga.etiqueta}
                </Link>
              ) : (
                <span className={esUltima ? estilos.actual : undefined} aria-current={esUltima ? 'page' : undefined}>
                  {miga.etiqueta}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
