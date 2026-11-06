import { useEffect, useRef, useState } from 'react';
import { USAR_MOCK } from '../../../shared/api/configuracionApi.js';
import DialogoBase from '../../cursos/components/DialogoBase.jsx';
import { actualizarUsuario } from '../services/usuariosService.js';
import { separarTelefono, telefonoPeru } from '../utils/telefono.js';
import CampoApoderado from './CampoApoderado.jsx';
import CampoTelefono from './CampoTelefono.jsx';
import CampoUsuario from './CampoUsuario.jsx';
import DialogoDescartarCambios from './DialogoDescartarCambios.jsx';
import estilos from './FormularioUsuario.module.css';
import SeccionFormulario from './SeccionFormulario.jsx';

/** Valores iniciales del formulario a partir del usuario que se edita. */
function construirFormulario(usuario, usuarios) {
  const apoderadoAsignado = usuario.rol === 'Estudiante'
    ? usuarios.find((candidato) => String(candidato.id) === String(usuario.apoderadoId))
      ?? (usuario.apoderadoId != null && usuario.apoderadoNombre
        ? { id: usuario.apoderadoId, nombre: usuario.apoderadoNombre, apellido: '', dni: usuario.apoderadoDni ?? '', activo: true }
        : null)
    : null;
  return {
    nombre: usuario.nombre ?? '',
    apellidoPaterno: usuario.apellidoPaterno ?? usuario.apellido ?? '',
    apellidoMaterno: usuario.apellidoMaterno ?? '',
    dni: usuario.dni ?? '',
    telefono: separarTelefono(usuario.telefono),
    correo: usuario.correo ?? '',
    apoderadoId: apoderadoAsignado?.id == null ? '' : String(apoderadoAsignado.id),
    dniApoderado: apoderadoAsignado?.dni ?? '',
    apoderadoSeleccionado: apoderadoAsignado,
    apoderadoError: ''
  };
}

/**
 * Formulario de edición de un usuario (HU-SAT-02). Mantiene las mismas validaciones y el mismo envío parcial a
 * `actualizarUsuario` (solo los campos que cambiaron). Avisa a la página con `alGuardado`.
 *
 * @param {Object} props
 * @param {Object} props.usuario Usuario que se edita.
 * @param {Array} props.usuarios Usuarios ya cargados (para validar duplicados y buscar al apoderado).
 * @param {(resultado: { usuario: Object|null, mensaje: string }) => void} props.alGuardado
 *   `usuario` es `null` si no hubo cambios que guardar.
 * @param {() => void} props.alCerrar
 */
export default function DialogoEditarUsuario({ usuario, usuarios, alGuardado, alCerrar }) {
  const [formularioInicial] = useState(() => construirFormulario(usuario, usuarios));
  const [form, setForm] = useState(formularioInicial);
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [confirmandoDescarte, setConfirmandoDescarte] = useState(false);
  const [intentosFallidos, setIntentosFallidos] = useState(0);
  const refSecciones = useRef(null);

  useEffect(() => {
    if (intentosFallidos > 0) {
      refSecciones.current?.querySelector('[aria-invalid="true"]')?.focus();
    }
  }, [intentosFallidos]);

  const hayCambios = JSON.stringify({ ...form, apoderadoError: '' }) !== JSON.stringify(formularioInicial);
  const solicitarCierre = () => (hayCambios ? setConfirmandoDescarte(true) : alCerrar());
  const esEstudiante = usuario.rol === 'Estudiante';

  const cambiar = (clave, valor) => {
    setForm((previo) => ({ ...previo, [clave]: valor }));
    setErrores((previo) => ({ ...previo, [clave]: '' }));
  };

  const buscarApoderado = () => {
    const dniBuscado = form.dniApoderado.trim();
    const encontrado = usuarios.find((candidato) => candidato.rol === 'Apoderado'
      && candidato.dni === dniBuscado
      && (candidato.activo || String(candidato.id) === String(usuario.apoderadoId)));
    if (encontrado) {
      setForm((previo) => ({
        ...previo,
        apoderadoId: String(encontrado.id),
        apoderadoSeleccionado: encontrado,
        apoderadoError: ''
      }));
      setErrores((previo) => ({ ...previo, apoderadoId: '' }));
    } else {
      setForm((previo) => ({
        ...previo,
        apoderadoId: '',
        apoderadoSeleccionado: null,
        apoderadoError: 'No se encontró un apoderado activo con este DNI.'
      }));
    }
  };

  const guardar = async (evento) => {
    evento.preventDefault();
    setErrorGeneral(null);
    const errs = {};
    if (!form.nombre.trim())
      errs.nombre = 'Ingrese el nombre.';
    if (form.nombre.trim().length > 80)
      errs.nombre = 'El nombre no puede superar los 80 caracteres.';
    if (form.apellidoPaterno.trim().length > 80)
      errs.apellidoPaterno = 'El apellido paterno no puede superar los 80 caracteres.';
    if (form.apellidoMaterno.trim().length > 80)
      errs.apellidoMaterno = 'El apellido materno no puede superar los 80 caracteres.';
    if (!/^\d{8}$/.test(form.dni.trim()))
      errs.dni = 'El DNI debe tener exactamente 8 dígitos.';
    if (usuarios.some((u) => u.id !== usuario.id && u.dni.trim() === form.dni.trim() && u.rol === usuario.rol))
      errs.dni = 'Este DNI ya pertenece a otra cuenta del mismo rol.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo.trim()) || form.correo.trim().length > 160)
      errs.correo = 'Ingrese un correo válido.';
    if (usuarios.some((u) => u.id !== usuario.id && u.correo.trim().toLowerCase() === form.correo.trim().toLowerCase()))
      errs.correo = 'Este correo ya pertenece a otro usuario.';
    const telefonoIngresado = form.telefono.trim();
    const telefonoCompacto = telefonoPeru(telefonoIngresado);
    if (telefonoIngresado && !/^\d{9}$/.test(telefonoIngresado))
      errs.telefono = 'El teléfono debe tener exactamente 9 dígitos.';
    if (esEstudiante && (!form.apoderadoId || !form.apoderadoSeleccionado))
      errs.apoderadoId = 'Seleccione un apoderado para el estudiante.';
    if (Object.keys(errs).length) {
      setErrores(errs);
      setIntentosFallidos((cantidad) => cantidad + 1);
      return;
    }

    const datosActualizados = {};
    const nombre = form.nombre.trim();
    const apellidoPaterno = form.apellidoPaterno.trim();
    const apellidoMaterno = form.apellidoMaterno.trim();
    const dni = form.dni.trim();
    const correo = form.correo.trim();
    if (nombre !== (usuario.nombre ?? '')) datosActualizados.nombre = nombre;
    if (apellidoPaterno !== (usuario.apellidoPaterno ?? usuario.apellido ?? '')) {
      datosActualizados.apellidoPaterno = apellidoPaterno;
    }
    if (apellidoMaterno !== (usuario.apellidoMaterno ?? '')) {
      datosActualizados.apellidoMaterno = apellidoMaterno || null;
    }
    if (dni !== (usuario.dni ?? '')) datosActualizados.dni = dni;
    if (correo !== (usuario.correo ?? '')) datosActualizados.email = correo;
    if (telefonoCompacto !== telefonoPeru(usuario.telefono)) {
      datosActualizados.telefono = telefonoCompacto || null;
    }
    if (esEstudiante && String(form.apoderadoId) !== String(usuario.apoderadoId ?? '')) {
      datosActualizados.apoderadoId = form.apoderadoSeleccionado.id;
    }

    if (Object.keys(datosActualizados).length === 0) {
      alGuardado({ usuario: null, mensaje: 'No hay cambios para guardar.' });
      return;
    }

    setEnviando(true);
    try {
      const mensajeExito = 'Los datos del usuario han sido actualizados correctamente.';
      if (USAR_MOCK) {
        alGuardado({
          usuario: {
            ...usuario,
            nombre,
            apellido: [apellidoPaterno, apellidoMaterno].filter(Boolean).join(' '),
            dni,
            correo,
            telefono: telefonoCompacto,
            ...(esEstudiante ? { apoderadoId: datosActualizados.apoderadoId ?? usuario.apoderadoId } : {})
          },
          mensaje: mensajeExito
        });
        return;
      }

      const resultado = await actualizarUsuario(usuario.id, datosActualizados);
      if (!resultado.exitoso) {
        setErrorGeneral(resultado.mensaje || 'No fue posible actualizar el usuario.');
        return;
      }

      alGuardado({
        usuario: {
          ...usuario,
          ...resultado.datos,
          ...(esEstudiante ? { apoderadoId: datosActualizados.apoderadoId ?? usuario.apoderadoId } : {})
        },
        mensaje: mensajeExito
      });
    } catch {
      setErrorGeneral('No fue posible actualizar el usuario. Revisa la conexión con el backend.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <>
      <DialogoBase
        idTitulo="dialogo-editar-usuario"
        titulo="Editar usuario"
        subtitulo="Gestión de usuarios"
        textoConfirmar="Guardar cambios"
        textoEnviando="Guardando..."
        enviando={enviando}
        confirmarDeshabilitado={esEstudiante && (!form.apoderadoId || !form.apoderadoSeleccionado)}
        error={errorGeneral}
        anchoMaximo="38rem"
        cerrarAlClicFuera={false}
        alSolicitarCierre={solicitarCierre}
        alCancelar={alCerrar}
        alConfirmar={guardar}
      >
        <div ref={refSecciones} className={estilos.secciones}>
          <SeccionFormulario titulo="Datos personales">
            <CampoUsuario etiqueta="Nombre" valor={form.nombre} alCambiar={(v) => cambiar('nombre', v)} placeholder="Nombre" error={errores.nombre} maxLength={80} requerido autoEnfocar />
            <CampoUsuario etiqueta="Apellido paterno" valor={form.apellidoPaterno} alCambiar={(v) => cambiar('apellidoPaterno', v)} placeholder="Apellido paterno" error={errores.apellidoPaterno} maxLength={80} />
            <CampoUsuario etiqueta="Apellido materno" valor={form.apellidoMaterno} alCambiar={(v) => cambiar('apellidoMaterno', v)} placeholder="Apellido materno (opcional)" error={errores.apellidoMaterno} maxLength={80} />
            <CampoUsuario etiqueta="DNI" valor={form.dni} alCambiar={(v) => cambiar('dni', v)} placeholder="8 dígitos" error={errores.dni} maxLength={8} requerido />
          </SeccionFormulario>

          {esEstudiante && (
            <SeccionFormulario titulo="Apoderado">
              <CampoApoderado
                valor={form.dniApoderado}
                alCambiar={(valor) => {
                  setForm((previo) => ({ ...previo, dniApoderado: valor, apoderadoId: '', apoderadoSeleccionado: null, apoderadoError: '' }));
                  setErrores((previo) => ({ ...previo, apoderadoId: '' }));
                }}
                alBuscar={buscarApoderado}
                alQuitar={() => setForm((previo) => ({ ...previo, apoderadoId: '', dniApoderado: '', apoderadoSeleccionado: null, apoderadoError: '' }))}
                apoderado={form.apoderadoSeleccionado}
                error={form.apoderadoError || errores.apoderadoId}
              />
            </SeccionFormulario>
          )}

          <SeccionFormulario titulo="Contacto">
            <CampoTelefono valor={form.telefono} alCambiar={(telefono) => cambiar('telefono', telefono)} error={errores.telefono} />
            <CampoUsuario etiqueta="Correo" type="email" valor={form.correo} alCambiar={(v) => cambiar('correo', v)} placeholder="Correo" error={errores.correo} maxLength={160} requerido />
          </SeccionFormulario>
        </div>
      </DialogoBase>
      {confirmandoDescarte && (
        <DialogoDescartarCambios alDescartar={alCerrar} alSeguirEditando={() => setConfirmandoDescarte(false)} />
      )}
    </>
  );
}
