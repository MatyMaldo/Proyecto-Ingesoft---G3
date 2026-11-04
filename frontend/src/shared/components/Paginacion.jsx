import { useEffect, useId, useRef, useState } from 'react';

import Icono from './Icono.jsx';
import estilos from './Paginacion.module.css';

/**
 * Paginador con resumen y campo numérico: `1 – 15 de 37 errores   «  ‹  [ 1 ] de 3  ›  »`.
 * Se alinea a la derecha y se usa igual arriba y abajo del listado. Controlado: la página
 * vive en el hook de la pantalla; este componente solo pinta y avisa el cambio.
 *
 * El número de página se escribe en el campo y se aplica con Enter o al salir del campo;
 * un valor fuera de rango se ajusta al límite más cercano.
 *
 * @param {Object} props
 * @param {number} props.pagina Página actual (base 0).
 * @param {number} props.totalPaginas Total de páginas.
 * @param {number} props.totalElementos Total de registros.
 * @param {number} props.tamanioPagina Registros por página.
 * @param {number} props.cantidadEnPagina Registros que trae la página actual.
 * @param {(pagina: number) => void} props.alCambiarPagina Recibe la nueva página (base 0).
 * @param {string} [props.etiqueta] Nombre accesible del `<nav>`.
 * @param {string} [props.unidadSingular] Nombre de un registro en el resumen.
 * @param {string} [props.unidadPlural] Nombre de varios registros en el resumen.
 */
export default function Paginacion({
  pagina,
  totalPaginas,
  totalElementos,
  tamanioPagina,
  cantidadEnPagina,
  alCambiarPagina,
  etiqueta = 'Paginación',
  unidadSingular = 'registro',
  unidadPlural = 'registros'
}) {
  const idCampo = useId();
  const [texto, establecerTexto] = useState(String(pagina + 1));
  const destinoPendienteRef = useRef(null);

  // Cuando la página cambia (por cualquier vía), el campo vuelve a mostrar la página vigente.
  useEffect(() => {
    destinoPendienteRef.current = null;
    establecerTexto(String(pagina + 1));
  }, [pagina]);

  const inicio = pagina * tamanioPagina + 1;
  const fin = pagina * tamanioPagina + cantidadEnPagina;
  const unidad = totalElementos === 1 ? unidadSingular : unidadPlural;
  const hayVariasPaginas = totalPaginas > 1;
  const esPrimera = pagina === 0;
  const esUltima = pagina + 1 >= totalPaginas;

  const confirmarPagina = () => {
    const numero = Number.parseInt(texto, 10);
    if (!Number.isInteger(numero)) {
      establecerTexto(String(pagina + 1));
      return;
    }

    const destino = Math.min(Math.max(numero, 1), totalPaginas) - 1;
    establecerTexto(String(destino + 1));
    if (destino !== pagina && destino !== destinoPendienteRef.current) {
      destinoPendienteRef.current = destino;
      alCambiarPagina(destino);
    }
  };

  const manejarEnvio = (evento) => {
    evento.preventDefault();
    confirmarPagina();
  };

  return (
    <nav className={estilos.paginacion} aria-label={etiqueta}>
      <p className={estilos.resumen}>
        {inicio} – {fin} de {totalElementos} {unidad}
      </p>

      {hayVariasPaginas && (
        <form className={estilos.controles} onSubmit={manejarEnvio} noValidate>
          <button
            type="button"
            className={estilos.control}
            onClick={() => alCambiarPagina(0)}
            disabled={esPrimera}
            aria-label="Primera página"
          >
            <span className={estilos.invertido}>
              <Icono nombre="chevrones-derecha" tamano={16} />
            </span>
          </button>
          <button
            type="button"
            className={estilos.control}
            onClick={() => alCambiarPagina(pagina - 1)}
            disabled={esPrimera}
            aria-label="Página anterior"
          >
            <span className={estilos.invertido}>
              <Icono nombre="chevron-derecha" tamano={16} />
            </span>
          </button>

          <label htmlFor={idCampo} className={estilos.etiquetaCampo}>
            Número de página
          </label>
          <input
            id={idCampo}
            className={estilos.campo}
            type="number"
            inputMode="numeric"
            min={1}
            max={totalPaginas}
            value={texto}
            onChange={(evento) => establecerTexto(evento.target.value)}
            onBlur={confirmarPagina}
          />
          <span className={estilos.total}>de {totalPaginas}</span>

          <button
            type="button"
            className={estilos.control}
            onClick={() => alCambiarPagina(pagina + 1)}
            disabled={esUltima}
            aria-label="Página siguiente"
          >
            <Icono nombre="chevron-derecha" tamano={16} />
          </button>
          <button
            type="button"
            className={estilos.control}
            onClick={() => alCambiarPagina(totalPaginas - 1)}
            disabled={esUltima}
            aria-label="Última página"
          >
            <Icono nombre="chevrones-derecha" tamano={16} />
          </button>
        </form>
      )}
    </nav>
  );
}
