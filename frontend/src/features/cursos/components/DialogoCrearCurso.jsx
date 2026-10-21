import { useState } from 'react';

import Icono from '../../../shared/components/Icono.jsx';
import { validarCurso, LONGITUD_MAXIMA_NOMBRE, LONGITUD_MAXIMA_DESCRIPCION } from '../utils/validacionCurso.js';
import DialogoBase from './DialogoBase.jsx';
import estilos from './DialogoCrearCurso.module.css';

const ID_TITULO = 'dialogo-crear-curso-titulo';
const ID_NOMBRE = 'crear-curso-nombre';
const ID_NOMBRE_ERROR = `${ID_NOMBRE}-error`;
const ID_DESCRIPCION = 'crear-curso-descripcion';
const ID_DESCRIPCION_ERROR = `${ID_DESCRIPCION}-error`;

/**
 * Diálogo "Crear curso". El curso se crea en el grado seleccionado en la pantalla. Valida en el cliente
 * (campos obligatorios y nombre repetido en el grado); el backend repite las validaciones.
 *
 * @param {Object} props
 * @param {string[]} props.nombresExistentes Nombres de los cursos del grado seleccionado.
 * @param {string} props.etiquetaGrado
 * @param {boolean} props.enviando
 * @param {string|null} props.error Error devuelto por el servicio (por ejemplo, nombre duplicado en el backend).
 * @param {() => void} props.alCancelar
 * @param {(datos: { nombre: string, descripcion: string }) => void} props.alCrear
 */
export default function DialogoCrearCurso({ nombresExistentes, etiquetaGrado, enviando, error, alCancelar, alCrear }) {
  const [valores, establecerValores] = useState({ nombre: '', descripcion: '' });
  const [errores, establecerErrores] = useState({});

  function manejarCambio(campo, valor) {
    establecerValores((anteriores) => ({ ...anteriores, [campo]: valor }));
    // El error de un campo se quita en cuanto la persona vuelve a escribir en él.
    if (errores[campo]) {
      establecerErrores((anteriores) => {
        const siguientes = { ...anteriores };
        delete siguientes[campo];
        return siguientes;
      });
    }
  }

  function manejarEnvio(evento) {
    evento.preventDefault();

    const erroresEncontrados = validarCurso(valores, nombresExistentes, etiquetaGrado);
    establecerErrores(erroresEncontrados);

    if (Object.keys(erroresEncontrados).length > 0) {
      return;
    }

    alCrear({ nombre: valores.nombre.trim(), descripcion: valores.descripcion.trim() });
  }

  return (
    <DialogoBase
      idTitulo={ID_TITULO}
      titulo="Crear curso"
      subtitulo={`Se creará en ${etiquetaGrado}.`}
      textoConfirmar="Crear curso"
      textoEnviando="Creando…"
      enviando={enviando}
      error={error}
      alCancelar={alCancelar}
      alConfirmar={manejarEnvio}
    >
      <div className={estilos.campo}>
        <label htmlFor={ID_NOMBRE} className={estilos.etiquetaCampo}>
          Nombre del curso
        </label>
        <input
          id={ID_NOMBRE}
          name="nombre"
          type="text"
          className={estilos.entrada}
          value={valores.nombre}
          maxLength={LONGITUD_MAXIMA_NOMBRE}
          autoComplete="off"
          placeholder="Ej. Persona, Familia y Relaciones Humanas"
          data-enfoque-inicial=""
          aria-invalid={errores.nombre ? 'true' : undefined}
          aria-describedby={errores.nombre ? ID_NOMBRE_ERROR : undefined}
          onChange={(evento) => manejarCambio('nombre', evento.target.value)}
        />
        {errores.nombre && (
          <p id={ID_NOMBRE_ERROR} className={estilos.mensajeError}>
            <Icono nombre="alerta" tamano={14} className={estilos.iconoError} />
            {errores.nombre}
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
          value={valores.descripcion}
          maxLength={LONGITUD_MAXIMA_DESCRIPCION}
          placeholder="Resume en una frase de qué trata el curso."
          aria-invalid={errores.descripcion ? 'true' : undefined}
          aria-describedby={errores.descripcion ? ID_DESCRIPCION_ERROR : undefined}
          onChange={(evento) => manejarCambio('descripcion', evento.target.value)}
        />
        {errores.descripcion ? (
          <p id={ID_DESCRIPCION_ERROR} className={estilos.mensajeError}>
            <Icono nombre="alerta" tamano={14} className={estilos.iconoError} />
            {errores.descripcion}
          </p>
        ) : (
          <p className={estilos.contador}>
            {valores.descripcion.length}/{LONGITUD_MAXIMA_DESCRIPCION}
          </p>
        )}
      </div>
    </DialogoBase>
  );
}
