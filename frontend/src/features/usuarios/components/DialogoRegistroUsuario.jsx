import { useEffect, useRef, useState } from 'react';
import { USAR_MOCK } from '../../../shared/api/configuracionApi.js';
import DialogoBase from '../../cursos/components/DialogoBase.jsx';
import { ROL_POR_TIPO_REGISTRO } from '../constants/rolesUsuario.js';
import {
  CODIGOS_ESTUDIANTE_HISTORICOS,
  registrarApoderado,
  registrarDocente,
  registrarEstudiante
} from '../services/usuariosService.js';
import { separarTelefono, telefonoPeru } from '../utils/telefono.js';
import CampoApoderado from './CampoApoderado.jsx';
import CampoTelefono from './CampoTelefono.jsx';
import CampoUsuario from './CampoUsuario.jsx';
import DialogoDescartarCambios from './DialogoDescartarCambios.jsx';
import estilos from './FormularioUsuario.module.css';
import SeccionFormulario from './SeccionFormulario.jsx';

const FORMULARIO_VACIO = {
  nombre: '',
  apellido: '',
  apellidoPaterno: '',
  apellidoMaterno: '',
  edad: '',
  dni: '',
  telefono: '',
  correo: '',
  password: '',
  confirm: '',
  fechaNacimiento: '',
  dniApoderado: '',
  apoderadoSeleccionado: null,
  apoderadoError: ''
};

/**
 * Formulario de registro de un apoderado, docente o estudiante (HU-SAT-02). Valida lo mismo que antes, envía el
 * mismo payload a `registrarApoderado` / `registrarDocente` / `registrarEstudiante` y avisa del resultado a la
 * página con `alRegistrado`. Los errores del servidor se muestran dentro del diálogo.
 *
 * @param {Object} props
 * @param {'apoderado'|'estudiante'|'docente'} props.tipo
 * @param {Array} props.usuarios Usuarios ya cargados (para validar duplicados y buscar al apoderado).
 * @param {(usuario: Object, mensaje: string) => void} props.alRegistrado
 * @param {() => void} props.alCerrar
 */
export default function DialogoRegistroUsuario({ tipo, usuarios, alRegistrado, alCerrar }) {
  const [form, setForm] = useState(FORMULARIO_VACIO);
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [confirmandoDescarte, setConfirmandoDescarte] = useState(false);
  const [intentosFallidos, setIntentosFallidos] = useState(0);
  const refSecciones = useRef(null);

  // Tras un envío con errores, el foco va al primer campo inválido (no al corregir letra a letra).
  useEffect(() => {
    if (intentosFallidos > 0) {
      refSecciones.current?.querySelector('[aria-invalid="true"]')?.focus();
    }
  }, [intentosFallidos]);

  const hayCambios = JSON.stringify(form) !== JSON.stringify(FORMULARIO_VACIO);
  const solicitarCierre = () => (hayCambios ? setConfirmandoDescarte(true) : alCerrar());

  const cambiar = (clave, valor) => {
    setForm((previo) => ({ ...previo, [clave]: valor }));
    setErrores((previo) => ({ ...previo, [clave]: '' }));
  };

  const buscarApoderado = () => {
    const encontrado = usuarios.find((usuario) => usuario.rol === 'Apoderado' && usuario.activo && usuario.dni === form.dniApoderado.trim());
    if (encontrado) {
      setForm((previo) => ({ ...previo, apoderadoSeleccionado: encontrado, apoderadoError: '' }));
    } else {
      setForm((previo) => ({
        ...previo,
        apoderadoSeleccionado: null,
        apoderadoError: 'No se encontró un apoderado registrado con este DNI.'
      }));
    }
  };

  const validar = () => {
    const errs = {};
    if (!form.nombre.trim())
      errs.nombre = 'Ingrese el nombre.';
    const apellidosSeparados = tipo === 'estudiante' || !USAR_MOCK;
    if (apellidosSeparados && !form.apellidoPaterno.trim())
      errs.apellidoPaterno = 'Ingrese el apellido paterno.';
    if (!apellidosSeparados && !form.apellido.trim())
      errs.apellido = 'Ingrese el apellido.';
    if (tipo === 'estudiante' && !form.fechaNacimiento)
      errs.fechaNacimiento = 'Ingrese la fecha de nacimiento.';
    if (tipo === 'apoderado') {
      const edad = Number(form.edad);
      const edadMinima = USAR_MOCK ? 18 : 1;
      if (!/^\d+$/.test(form.edad.trim()) || !Number.isSafeInteger(edad) || edad < edadMinima)
        errs.edad = USAR_MOCK ? 'La edad debe ser un número entero de 18 años o más.' : 'Ingrese una edad válida mayor que cero.';
    } else if (USAR_MOCK && tipo === 'docente') {
      const edad = Number(form.edad);
      if (!/^\d+$/.test(form.edad.trim()) || !Number.isSafeInteger(edad) || edad < 18)
        errs.edad = 'La edad del docente debe ser un número entero de 18 años o más.';
    }
    const documentoValido = USAR_MOCK && tipo === 'apoderado'
      ? /^(?:\d{8}|\d{9})$/.test(form.dni.trim())
      : /^\d{8}$/.test(form.dni.trim());
    if (!documentoValido)
      errs.dni = tipo === 'apoderado' ? 'Ingrese un DNI de 8 dígitos o un Carné de Extranjería de 9 dígitos.' : 'El DNI debe tener 8 dígitos.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo.trim()))
      errs.correo = 'Ingrese un correo válido.';
    if (usuarios.some((u) => u.dni.trim() === form.dni.trim() && u.rol === ROL_POR_TIPO_REGISTRO[tipo]))
      errs.dni = 'Ya existe una cuenta con este DNI y rol.';
    if (form.nombre.trim().length > 80)
      errs.nombre = 'El nombre no puede superar los 80 caracteres.';
    if (form.apellidoPaterno.trim().length > 80)
      errs.apellidoPaterno = 'El apellido paterno no puede superar los 80 caracteres.';
    if (form.apellidoMaterno.trim().length > 80)
      errs.apellidoMaterno = 'El apellido materno no puede superar los 80 caracteres.';
    if (form.correo.trim().length > 160)
      errs.correo = 'El correo no puede superar los 160 caracteres.';
    if (usuarios.some((u) => u.correo.trim().toLowerCase() === form.correo.trim().toLowerCase()))
      errs.correo = 'Ya existe un usuario registrado con este correo.';
    const telefonoIngresado = form.telefono.trim();
    const telefonoValido = /^\d{9}$/.test(telefonoIngresado);
    if (USAR_MOCK && (tipo === 'estudiante' || tipo === 'docente') && !telefonoIngresado)
      errs.telefono = tipo === 'docente' ? 'Ingrese el teléfono del docente.' : 'Ingrese el teléfono del estudiante.';
    else if (telefonoIngresado && !telefonoValido)
      errs.telefono = 'El teléfono debe tener exactamente 9 dígitos.';
    if (!form.password)
      errs.password = 'Ingrese la contraseña.';
    else if (form.password.length < 8 || form.password.length > 40)
      errs.password = 'La contraseña debe tener entre 8 y 40 caracteres.';
    if (form.password !== form.confirm)
      errs.confirm = 'Las contraseñas no coinciden.';
    if (tipo === 'estudiante' && !form.apoderadoSeleccionado)
      errs.dniApoderado = 'Seleccione un apoderado válido.';
    return errs;
  };

  const registrar = async (evento) => {
    evento.preventDefault();
    setErrorGeneral(null);
    const errs = validar();
    if (Object.keys(errs).length) {
      setErrores(errs);
      setIntentosFallidos((cantidad) => cantidad + 1);
      return;
    }
    let codigoEstudiante;
    if (tipo === 'estudiante') {
      const normalizarCodigo = (codigo) => codigo.replace(/-/g, '').toUpperCase();
      const codigosUsados = new Set([
        ...CODIGOS_ESTUDIANTE_HISTORICOS,
        ...usuarios.map((usuario) => usuario.codigoEstudiante).filter(Boolean)
      ].map(normalizarCodigo));
      let correlativo = 1;
      do {
        const prefijo = USAR_MOCK ? 'EST-' : 'EST';
        codigoEstudiante = `${prefijo}${String(correlativo).padStart(3, '0')}`;
        correlativo += 1;
      } while (codigosUsados.has(normalizarCodigo(codigoEstudiante)));
    }
    setEnviando(true);
    try {
      const telefono = telefonoPeru(form.telefono);
      if (!USAR_MOCK) {
        // El backend exige exactamente 9 dígitos (sin prefijo +51).
        const telefonoApi = separarTelefono(form.telefono);
        const datosBase = {
          nombre: form.nombre.trim(),
          apellidoPaterno: form.apellidoPaterno.trim(),
          ...(form.apellidoMaterno.trim() ? { apellidoMaterno: form.apellidoMaterno.trim() } : {}),
          dni: form.dni.trim(),
          email: form.correo.trim(),
          ...(telefonoApi ? { telefono: telefonoApi } : {}),
          password: form.password
        };
        const enviar = {
          estudiante: () => registrarEstudiante({
            ...datosBase,
            codigo: codigoEstudiante,
            fechaNacimiento: form.fechaNacimiento,
            apoderadoId: form.apoderadoSeleccionado.id
          }),
          apoderado: () => registrarApoderado({ ...datosBase, edad: Number(form.edad) }),
          docente: () => registrarDocente(datosBase)
        }[tipo];
        const resultado = await enviar();

        if (!resultado.exitoso) {
          setErrorGeneral(resultado.mensaje || `No fue posible registrar al ${tipo}.`);
          return;
        }

        alRegistrado(resultado.datos, tipo === 'estudiante'
          ? `El estudiante ha sido registrado correctamente. Código: ${resultado.datos.codigoEstudiante}`
          : `El ${tipo} ha sido registrado correctamente.`);
        return;
      }

      const nuevo = {
        id: 'u' + Date.now(), nombre: form.nombre.trim(),
        apellido: tipo === 'estudiante' ? `${form.apellidoPaterno.trim()} ${form.apellidoMaterno.trim()}` : form.apellido.trim(),
        dni: form.dni.trim(), rol: ROL_POR_TIPO_REGISTRO[tipo], correo: form.correo.trim(), activo: true,
        ...(tipo !== 'estudiante' ? { edad: Number(form.edad) } : {}),
        ...(telefono ? { telefono } : {}),
        ...(tipo === 'estudiante' ? { codigoEstudiante, apoderadoId: form.apoderadoSeleccionado.id, fechaNacimiento: form.fechaNacimiento } : {})
      };
      const mensajes = {
        apoderado: 'El apoderado ha sido registrado correctamente.',
        estudiante: 'El estudiante ha sido registrado correctamente.',
        docente: 'El docente ha sido registrado correctamente.'
      };
      alRegistrado(nuevo, tipo === 'estudiante' ? `${mensajes[tipo]} Código: ${codigoEstudiante}` : mensajes[tipo]);
    } catch {
      setErrorGeneral('No fue posible registrar al usuario. Inténtalo de nuevo.');
    } finally {
      setEnviando(false);
    }
  };

  const esEstudiante = tipo === 'estudiante';
  const apellidosSeparados = esEstudiante || !USAR_MOCK;
  const pideEdad = tipo === 'apoderado' || (USAR_MOCK && tipo === 'docente');
  const telefonoObligatorio = USAR_MOCK ? (esEstudiante || tipo === 'docente') : esEstudiante;

  return (
    <>
      <DialogoBase
        idTitulo="dialogo-registro-usuario"
        titulo={`Registrar ${tipo}`}
        subtitulo="Gestión de usuarios"
        textoConfirmar="Registrar"
        textoEnviando="Guardando..."
        enviando={enviando}
        error={errorGeneral}
        anchoMaximo="38rem"
        cerrarAlClicFuera={false}
        alSolicitarCierre={solicitarCierre}
        alCancelar={alCerrar}
        alConfirmar={registrar}
      >
        <div ref={refSecciones} className={estilos.secciones}>
          <SeccionFormulario titulo="Datos personales">
            <CampoUsuario etiqueta="Nombre" valor={form.nombre} alCambiar={(v) => cambiar('nombre', v)} placeholder="Ingrese el nombre" error={errores.nombre} maxLength={80} requerido autoEnfocar />
            {apellidosSeparados
              ? <CampoUsuario etiqueta="Apellido paterno" valor={form.apellidoPaterno} alCambiar={(v) => cambiar('apellidoPaterno', v)} placeholder="Ingrese el apellido paterno" error={errores.apellidoPaterno} maxLength={80} requerido />
              : <CampoUsuario etiqueta="Apellido" valor={form.apellido} alCambiar={(v) => cambiar('apellido', v)} placeholder="Ingrese el apellido" error={errores.apellido} requerido />}
            {apellidosSeparados && (
              <CampoUsuario etiqueta="Apellido materno" valor={form.apellidoMaterno} alCambiar={(v) => cambiar('apellidoMaterno', v)} placeholder="Opcional" error={errores.apellidoMaterno} maxLength={80} />
            )}
            {esEstudiante && (
              <CampoUsuario etiqueta="Fecha de nacimiento" type="date" valor={form.fechaNacimiento} alCambiar={(v) => cambiar('fechaNacimiento', v)} error={errores.fechaNacimiento} requerido />
            )}
            {pideEdad && (
              <CampoUsuario
                etiqueta="Edad"
                type="number"
                min={USAR_MOCK ? 18 : 1}
                step={1}
                valor={form.edad}
                alCambiar={(v) => cambiar('edad', v)}
                placeholder="Ingrese la edad"
                error={errores.edad}
                ayuda={tipo === 'docente' ? 'El docente debe tener 18 años o más.' : ''}
                requerido
              />
            )}
            <CampoUsuario etiqueta={tipo === 'apoderado' && USAR_MOCK ? 'Documento de identidad' : 'DNI'} valor={form.dni} alCambiar={(v) => cambiar('dni', v)} placeholder="Ingrese el DNI" error={errores.dni} maxLength={9} requerido />
          </SeccionFormulario>

          {esEstudiante && (
            <SeccionFormulario titulo="Apoderado">
              <CampoApoderado
                valor={form.dniApoderado}
                alCambiar={(valor) => {
                  setForm((previo) => ({ ...previo, dniApoderado: valor, apoderadoError: '', apoderadoSeleccionado: null }));
                  setErrores((previo) => ({ ...previo, dniApoderado: '' }));
                }}
                alBuscar={buscarApoderado}
                alQuitar={() => setForm((previo) => ({ ...previo, apoderadoSeleccionado: null, dniApoderado: '' }))}
                apoderado={form.apoderadoSeleccionado}
                error={form.apoderadoError || errores.dniApoderado}
              />
            </SeccionFormulario>
          )}

          <SeccionFormulario titulo="Contacto">
            <CampoTelefono valor={form.telefono} alCambiar={(telefono) => cambiar('telefono', telefono)} error={errores.telefono} requerido={telefonoObligatorio} />
            <CampoUsuario etiqueta="Correo" type="email" valor={form.correo} alCambiar={(v) => cambiar('correo', v)} placeholder="Ingrese el correo electrónico" error={errores.correo} maxLength={160} requerido />
          </SeccionFormulario>

          <SeccionFormulario titulo="Acceso">
            <CampoUsuario etiqueta={esEstudiante || tipo === 'docente' ? 'Contraseña inicial' : 'Contraseña'} type="password" valor={form.password} alCambiar={(v) => cambiar('password', v)} placeholder="Ingrese la contraseña" error={errores.password} ayuda="Debe tener entre 8 y 40 caracteres." maxLength={40} autoComplete="new-password" requerido />
            <CampoUsuario etiqueta="Confirmar contraseña" type="password" valor={form.confirm} alCambiar={(v) => cambiar('confirm', v)} placeholder="Confirme la contraseña" error={errores.confirm} maxLength={40} autoComplete="new-password" />
          </SeccionFormulario>
        </div>
      </DialogoBase>
      {confirmandoDescarte && (
        <DialogoDescartarCambios alDescartar={alCerrar} alSeguirEditando={() => setConfirmandoDescarte(false)} />
      )}
    </>
  );
}
