import { useEffect, useRef, useState } from 'react';
import { consultarEstructura, crearGrado, crearSeccion } from '../services/gradosSeccionesService.js';
import { validarGrado, validarSeccion } from '../utils/validacionesGradosSecciones.js';

export default function useGradosSecciones() {
  const [datos, establecerDatos] = useState({ anios: [], grados: [], secciones: [] });
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
    establecerFormulario({ tipo, nombre: '', capacidadMaxima: '', anioAcademicoId: anioId, gradoId });
  }

  async function guardar(evento) {
    evento.preventDefault();
    if (bloqueo.current) return;
    const validacion = formulario.tipo === 'grado' ? validarGrado(formulario) : validarSeccion(formulario);
    establecerErrores(validacion);
    establecerErrorGuardado('');
    if (Object.keys(validacion).length) return;
    bloqueo.current = true;
    establecerGuardando(true);
    try {
      const resultado = await (formulario.tipo === 'grado' ? crearGrado(formulario) : crearSeccion(formulario));
      if (!resultado.exitoso) {
        establecerErrores(resultado.errores ?? {});
        establecerErrorGuardado(resultado.mensaje);
        return;
      }
      const clave = formulario.tipo === 'grado' ? 'grados' : 'secciones';
      establecerDatos((actual) => ({ ...actual, [clave]: [...actual[clave], resultado.datos] }));
      if (clave === 'grados') establecerGradoId(String(resultado.datos.id));
      establecerConfirmacion(`${formulario.tipo === 'grado' ? 'Grado' : 'Sección'} «${resultado.datos.nombre}» registrado correctamente.`);
      establecerFormulario(null);
    } catch {
      establecerErrorGuardado('No fue posible guardar. Conservamos los datos para que puedas reintentar.');
    } finally {
      bloqueo.current = false;
      establecerGuardando(false);
    }
  }

  return { datos, estado, errorCarga, anioId, establecerAnioId, gradoId, establecerGradoId,
    formulario, establecerFormulario, errores, errorGuardado, confirmacion, guardando, abrir, guardar,
    reintentar: () => establecerIntento((actual) => actual + 1) };
}
