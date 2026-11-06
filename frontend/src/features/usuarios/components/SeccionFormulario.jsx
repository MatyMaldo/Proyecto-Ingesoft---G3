import { useId } from 'react';
import estilos from './SeccionFormulario.module.css';

/**
 * Grupo de campos con título (Datos personales, Contacto, Acceso...). Los campos se reparten en dos columnas
 * cuando caben y en una sola en pantallas angostas.
 *
 * @param {Object} props
 * @param {string} props.titulo
 * @param {import('react').ReactNode} props.children
 */
export default function SeccionFormulario({ titulo, children }) {
  const idTitulo = useId();

  return (
    <section className={estilos.seccion} aria-labelledby={idTitulo}>
      <h3 id={idTitulo} className={estilos.titulo}>{titulo}</h3>
      <div className={estilos.cuadricula}>{children}</div>
    </section>
  );
}
