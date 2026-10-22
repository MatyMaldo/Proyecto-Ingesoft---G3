import { useEffect, useRef, useState } from 'react';
import { consultarEstructura, crearGrado, crearSeccion, actualizarSeccion } from '../services/gradosSeccionesService.js';
import { validarGrado, validarSeccion } from '../utils/validacionesGradosSecciones.js';

export default function useGradosSecciones() {
  const [datos, establecerDatos] = useState({ anios: [], grados: [], secciones: [], docentes: [] });
  const [estado, establecerEstado] = useState('cargando');
  const [errorCarga, establecerErrorCarga] = useState('');
  const [intento, establecerIntento] = useState(0);
  const [anioId, establecerAnioId] = useState('');
  const [gradoId, establecerGradoId] = useState('');
  const [formulario, establecerFormulario] = useState(null);
  const [errores, establecerErrores] = useState({});
  const [errorGuardado, establecerErrorGuardado] = useState('');
  const [confirmacion, establecerConfirmacion] = useState('');
  const [guardando, establecerGuardando] = useState(false);
  const bloqueo = useRef(false);

  useEffect(() => {
    let vigente = true;
    establecerEstado('cargando');
    consultarEstructura().then((resultado) => {
      if (!vigente) return;
      if (!resultado.exitoso) {
        establecerErrorCarga(resultado.mensaje);
        establecerEstado('error');
        return;
      }
      establecerDatos(resultado.datos);
      establecerAnioId((actual) => actual || String(resultado.datos.anios[0]?.id ?? ''));
      establecerGradoId((actual) => actual || String(resultado.datos.grados[0]?.id ?? ''));
      establecerEstado('listo');
    });
    return () => { vigente = false; };
  }, [intento]);

  function abrir(tipo) {
    establecerErrores({});
    establecerErrorGuardado('');
    establecerConfirmacion('');
    establecerFormulario({ tipo, accion: 'crear', nombre: '', capacidadMaxima: '', anioAcademicoId: anioId, gradoId, tutorId: '' });
  }

  function abrirEdicion(seccion) {
    establecerErrores({});
    establecerErrorGuardado('');
    establecerConfirmacion('');
    establecerFormulario({
      tipo: 'seccion',
      accion: 'editar',
      id: seccion.id,
      nombre: seccion.nombre,
      capacidadMaxima: String(seccion.capacidadMaxima),
      anioAcademicoId: String(seccion.anioAcademicoId),
      gradoId: String(seccion.gradoId),
      tutorId: seccion.tutorId ? String(seccion.tutorId) : ''
    });
  }

  async function guardar(evento) {
    evento.preventDefault();
    if (bloqueo.current) return;
    const validacion = formulario.tipo === 'grado'
      ? validarGrado(formulario)
      : validarSeccion(formulario, { exigirTutor: formulario.accion !== 'editar' });
    establecerErrores(validacion);
    establecerErrorGuardado('');
    if (Object.keys(validacion).length) return;
    bloqueo.current = true;
    establecerGuardando(true);
    try {
      const resultado = formulario.tipo === 'grado'
        ? await crearGrado(formulario)
        : formulario.accion === 'editar'
          ? await actualizarSeccion(formulario.id, formulario)
          : await crearSeccion(formulario);
      if (!resultado.exitoso) {
        establecerErrores(resultado.errores ?? {});
        establecerErrorGuardado(resultado.mensaje);
        return;
      }
      if (formulario.tipo === 'grado') {
        establecerDatos((actual) => ({ ...actual, grados: [...actual.grados, resultado.datos] }));
        establecerGradoId(String(resultado.datos.id));
      } else if (formulario.accion === 'editar') {
        establecerDatos((actual) => ({
          ...actual,
          secciones: actual.secciones.map((item) => String(item.id) === String(resultado.datos.id) ? resultado.datos : item)
        }));
      } else {
        establecerDatos((actual) => ({ ...actual, secciones: [...actual.secciones, resultado.datos] }));
      }
      const descripcion = formulario.tipo === 'grado' ? 'Grado' : 'Sección';
      const accion = formulario.accion === 'editar' ? 'actualizada' : 'registrado';
      establecerConfirmacion(`${descripcion} «${resultado.datos.nombre}» ${accion} correctamente.`);
      establecerFormulario(null);
    } catch {
      establecerErrorGuardado('No fue posible guardar. Conservamos los datos para que puedas reintentar.');
    } finally {
      bloqueo.current = false;
      establecerGuardando(false);
    }
  }

  return { datos, estado, errorCarga, anioId, establecerAnioId, gradoId, establecerGradoId,
    formulario, establecerFormulario, errores, errorGuardado, confirmacion, guardando, abrir, abrirEdicion, guardar,
    reintentar: () => establecerIntento((actual) => actual + 1) };
}
