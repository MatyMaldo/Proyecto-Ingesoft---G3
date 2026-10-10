import Icono from './Icono.jsx';
import estilos from './Boton.module.css'

export default function Boton({ icono, span , onClick, estilo }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={estilo}
    >
    <Icono nombre={icono} tamano = {18} ></Icono>
    <span>{span}</span>
    </button>
  );
}