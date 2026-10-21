import Icono from '../../../shared/components/Icono.jsx';
import estilosUtil from '../../../shared/styles/utilidades.module.css';
import estilos from './SelectorPerfil.module.css';

/**
 * Grupo de opción única con los cuatro perfiles de acceso
 * (docs/planes/login.md §4.4). Los perfiles no habilitados usan el atributo
 * nativo `disabled`: no son seleccionables ni enfocables, por decisión
 * explícita del usuario.
 *
 * @param {Object} props
 * @param {Array<{ valor: string, etiqueta: string, icono: string, habilitado: boolean }>} props.perfiles
 * @param {string} props.valorSeleccionado
 * @param {(valor: string) => void} props.alSeleccionar Solo se dispara en perfiles habilitados.
 */
export default function SelectorPerfil({ perfiles, valorSeleccionado, alSeleccionar }) {
  return (
    <fieldset className={estilos.fieldset}>
      <legend className={estilos.leyenda}>Perfil de acceso</legend>
      <ul className={estilos.lista}>
        {perfiles.map((perfil) => {
          const id = `perfil-${perfil.valor}`;

          return (
            <li key={perfil.valor} className={estilos.item}>
              <input
                type="radio"
                name="perfil"
                id={id}
                value={perfil.valor}
                className={`${estilos.radio} ${estilosUtil.ocultoVisualmente}`}
                checked={valorSeleccionado === perfil.valor}
                disabled={!perfil.habilitado}
                onChange={() => alSeleccionar(perfil.valor)}
              />
              <label htmlFor={id} className={estilos.opcion}>
                <Icono nombre={perfil.icono} tamano={20} />
                <span>{perfil.etiqueta}</span>
              </label>
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}
