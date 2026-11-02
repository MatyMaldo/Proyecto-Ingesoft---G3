import PanelInstitucional from './PanelInstitucional.jsx';
import estilos from './MarcoAccesoPublico.module.css';

/**
 * Estructura compartida de las pantallas públicas de HU-SAT-03 ("Solicitar
 * código" y "Restablecer contraseña"): `PanelInstitucional` + tarjeta con
 * título y subtítulo. Copia la disposición de `PaginaLogin` (rejilla
 * 5fr/7fr en escritorio) con el espaciado de la escala del GUI (docs/planes/
 * restablecer-contrasena.md §4.1, §10). No llama servicios.
 *
 * `PaginaLogin` no se migra a este marco en este plan (R17).
 *
 * @param {Object} props
 * @param {string} props.idTitulo `id` del `<h1>`; el formulario lo usa en `aria-labelledby`.
 * @param {string} props.titulo Texto del `<h1>`.
 * @param {string} props.subtitulo Párrafo bajo el título.
 * @param {import('react').ReactNode} props.children Formulario de la pantalla.
 */
export default function MarcoAccesoPublico({ idTitulo, titulo, subtitulo, children }) {
  return (
    <div className={estilos.pagina}>
      <PanelInstitucional />

      <main className={estilos.main}>
        <div className={estilos.tarjeta}>
          <h1 id={idTitulo} className={estilos.titulo}>
            {titulo}
          </h1>
          <p className={estilos.subtitulo}>{subtitulo}</p>

          {children}
        </div>
      </main>
    </div>
  );
}
