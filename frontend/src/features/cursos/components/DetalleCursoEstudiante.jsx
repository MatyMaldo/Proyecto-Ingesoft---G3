import { useEffect, useRef } from 'react';

import Icono from '../../../shared/components/Icono.jsx';
import Insignia from '../../../shared/components/Insignia.jsx';
import { obtenerIconoCurso } from '../constants/iconosCurso.js';
import { textoDocente } from '../utils/formatoCursoEstudiante.js';
import PanelEvaluacionesCurso from './PanelEvaluacionesCurso.jsx';
import estilos from './DetalleCursoEstudiante.module.css';

/**
 * Detalle de un curso del estudiante (prototipo "Mis cursos › curso"): cabecera con el curso y
 * la sección de "Evaluaciones y Notas" (HU-EVAL-03). La asistencia se consulta en su propia
 * pantalla. Solo lectura.
 *
 * @param {Object} props
 * @param {{ id: string, nombre: string, docenteNombre: string, aulas: string[] }} props.curso Tarjeta del curso abierto.
 * @param {string} props.grupo Grado y sección abreviados ("1er Grado A").
 * @param {string} props.gradoNombre Grado completo ("1er Grado de Secundaria").
 * @param {Object|null} props.datos Respuesta de `consultarNotasCursoEstudiante`; `null` mientras carga o si falló.
 * @param {boolean} props.cargando
 * @param {string|null} props.error `null` si no hubo error; texto del backend, o cadena vacía para el mensaje genérico.
 * @param {() => void} props.alVolver
 * @param {() => void} props.alReintentar
 */
export default function DetalleCursoEstudiante({
  curso,
  grupo,
  gradoNombre,
  datos,
  cargando,
  error,
  alVolver,
  alReintentar
}) {
  const titulo = useRef(null);

  // Al abrir el detalle el foco pasa al título: el estudiante de teclado o lector de pantalla no queda en el vacío.
  useEffect(() => {
    titulo.current?.focus();
  }, []);

  const docente = textoDocente(curso.docenteNombre);
  const datosCurso = [
    docente && { icono: 'usuario', texto: docente },
    curso.aulas?.[0] && { icono: 'aula', texto: curso.aulas[0] },
    gradoNombre && { icono: 'birrete', texto: gradoNombre }
  ].filter(Boolean);

  return (
    <section className={estilos.detalle} aria-labelledby="detalle-curso-titulo">
      <button type="button" className={estilos.botonVolver} onClick={alVolver}>
        <Icono nombre="flecha-izquierda" tamano={16} />
        Volver a Mis Cursos
      </button>

      <div className={estilos.tarjeta}>
        <header className={estilos.cabecera}>
          <div className={estilos.filaTitulo}>
            <span className={estilos.recuadroIcono} aria-hidden="true">{obtenerIconoCurso(curso.nombre)}</span>
            <h2 id="detalle-curso-titulo" className={estilos.titulo} ref={titulo} tabIndex={-1}>
              {curso.nombre}
              {grupo && <span className={estilos.grupo}> — {grupo}</span>}
            </h2>
            <Insignia tono="azul" className={estilos.insigniaIcono}>
              <Icono nombre="escudo" tamano={14} />
              Solo lectura
            </Insignia>
          </div>
          {datosCurso.length > 0 && (
            <ul className={estilos.datos} aria-label="Datos del curso">
              {datosCurso.map(({ icono, texto }) => (
                <li key={icono}>
                  <Icono nombre={icono} tamano={16} />
                  {texto}
                </li>
              ))}
            </ul>
          )}
        </header>
        <h2 className={estilos.tituloSeccion}>Evaluaciones y Notas</h2>
      </div>

      <div className={estilos.panel}>
        <PanelEvaluacionesCurso datos={datos} cargando={cargando} error={error} alReintentar={alReintentar} />
      </div>
    </section>
  );
}
