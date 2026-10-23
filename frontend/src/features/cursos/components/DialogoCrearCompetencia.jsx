import { useState } from 'react';

import Icono from '../../../shared/components/Icono.jsx';
import DialogoBase from './DialogoBase.jsx';
import estilos from './DialogoCrearCurso.module.css';

const ID_TITULO = 'dialogo-crear-competencia-titulo';
const ID_NOMBRE = 'crear-competencia-nombre';
const ID_DESCRIPCION = 'crear-competencia-descripcion';

/**
 * Diálogo para crear o editar una competencia asociada a un curso.
 *
 * @param {Object} props
 * @param {string} props.nombreCurso
 * @param {{nombre: string, descripcion: string}} [props.competenciaInicial]
 * @param {string} [props.titulo]
 * @param {string} [props.textoConfirmar]
 * @param {string} [props.textoEnviando]
 * @param {boolean} props.enviando
 * @param {string|null} props.error
 * @param {() => void} props.alCancelar
 * @param {(competencia: {nombre: string, descripcion: string}) => void} props.alGuardar
 */
export default function DialogoCrearCompetencia({
  nombreCurso,
  competenciaInicial = { nombre: '', descripcion: '' },
  titulo = 'Agregar competencia',
  textoConfirmar = 'Agregar competencia',
  textoEnviando = 'Agregando…',
  enviando,
  error,
  alCancelar,
  alGuardar
}) {
  const [nombre, establecerNombre] = useState(competenciaInicial.nombre);
  const [descripcion, establecerDescripcion] = useState(competenciaInicial.descripcion);
  const [errorNombre, establecerErrorNombre] = useState('');
  const [errorDescripcion, establecerErrorDescripcion] = useState('');

  function manejarEnvio(evento) {
    evento.preventDefault();

    const siguienteErrorNombre = nombre.trim() ? '' : 'Escribe el nombre de la competencia.';
    const siguienteErrorDescripcion = descripcion.trim() ? '' : 'Escribe una descripción para la competencia.';
    establecerErrorNombre(siguienteErrorNombre);
    establecerErrorDescripcion(siguienteErrorDescripcion);

    if (siguienteErrorNombre || siguienteErrorDescripcion) {
      return;
    }

    alGuardar({ nombre: nombre.trim(), descripcion: descripcion.trim() });
  }

  return (
    <DialogoBase
      idTitulo={ID_TITULO}
      titulo={titulo}
      subtitulo={`Curso: ${nombreCurso}`}
      textoConfirmar={textoConfirmar}
      textoEnviando={textoEnviando}
      enviando={enviando}
      error={error}
      alCancelar={alCancelar}
      alConfirmar={manejarEnvio}
    >
      <div className={estilos.campo}>
        <label htmlFor={ID_NOMBRE} className={estilos.etiquetaCampo}>
          Nombre de la competencia
        </label>
        <input
          id={ID_NOMBRE}
          name="nombre"
          type="text"
          className={estilos.entrada}
          value={nombre}
          autoComplete="off"
          data-enfoque-inicial=""
          aria-invalid={errorNombre ? 'true' : undefined}
          aria-describedby={errorNombre ? `${ID_NOMBRE}-error` : undefined}
          onChange={(evento) => {
            establecerNombre(evento.target.value);
            if (errorNombre) establecerErrorNombre('');
          }}
        />
        {errorNombre && (
          <p id={`${ID_NOMBRE}-error`} className={estilos.mensajeError}>
            <Icono nombre="alerta" tamano={14} className={estilos.iconoError} />
            {errorNombre}
          </p>
        )}
      </div>

      <div className={estilos.campo}>
        <label htmlFor={ID_DESCRIPCION} className={estilos.etiquetaCampo}>
          Descripción
        </label>
        <textarea
          id={ID_DESCRIPCION}
          name="descripcion"
          className={estilos.entradaTexto}
          value={descripcion}
          aria-invalid={errorDescripcion ? 'true' : undefined}
          aria-describedby={errorDescripcion ? `${ID_DESCRIPCION}-error` : undefined}
          onChange={(evento) => {
            establecerDescripcion(evento.target.value);
            if (errorDescripcion) establecerErrorDescripcion('');
          }}
        />
        {errorDescripcion && (
          <p id={`${ID_DESCRIPCION}-error`} className={estilos.mensajeError}>
            <Icono nombre="alerta" tamano={14} className={estilos.iconoError} />
            {errorDescripcion}
          </p>
        )}
      </div>
    </DialogoBase>
  );
}
