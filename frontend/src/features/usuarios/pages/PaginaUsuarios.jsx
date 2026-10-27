import { useEffect, useState } from 'react';
import { USAR_MOCK } from '../../../shared/api/configuracionApi.js';
import {
    USUARIOS_INICIAL,
    CODIGOS_ESTUDIANTE_HISTORICOS,
    listarUsuarios,
    actualizarUsuario,
    registrarEstudiante,
    registrarApoderado,
    registrarDocente,
    cambiarEstadoUsuario,
    listarSeccionesTutor
} from '../services/usuariosService.js';

const ROL_BADGE = {
    Apoderado: { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
    Estudiante: { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
    Docente: { bg: '#fdf4ff', color: '#7e22ce', border: '#e9d5ff' },
    Administrador: { bg: '#fff7ed', color: '#c2410c', border: '#fed7aa' },
};

const ROL_POR_TIPO_REGISTRO = {
    apoderado: 'Apoderado',
    estudiante: 'Estudiante',
    docente: 'Docente'
};

function esAdministrador(usuario) {
    return usuario?.rol === 'Administrador'
        || usuario?.rol === 'ADMINISTRADOR'
        || usuario?.rol === 'ADMIN';
}

function UsuarioField({ label, value, onChange, placeholder, type = 'text', error, required = false, min, maxLength, step }) {
    return (<div>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>{label}{required && <span style={{ color: '#ba1a1a' }}> *</span>}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required={required} min={min} maxLength={maxLength} step={step} style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: `1.5px solid ${error ? '#ba1a1a' : '#dde2f0'}`, background: '#f8f9ff', fontSize: 13, color: '#121c2a', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s' }} onFocus={e => e.currentTarget.style.borderColor = error ? '#ba1a1a' : '#0058be'} onBlur={e => e.currentTarget.style.borderColor = error ? '#ba1a1a' : '#dde2f0'}/>
      {error && <p style={{ fontSize: 11, color: '#ba1a1a', margin: '3px 0 0', display: 'flex', alignItems: 'center', gap: 3 }}><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>{error}</p>}
    </div>);
}
function UsuarioModalShell({ title, subtitle, onSubmit, submitLabel, submitDisabled, submitting, onClose, children }) {
    return (<div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 24 }} onClick={e => { if (e.target === e.currentTarget)
        onClose(); }}>
      <div style={{ background: '#fff', borderRadius: 14, width: '100%', maxWidth: 520, boxShadow: '0 20px 60px rgba(0,35,111,0.18)', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #f1f4f9', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 4 }}>{subtitle}</div>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: '#121c2a', margin: 0 }}>{title}</h2>
          </div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: '50%', border: '1px solid #e5e7eb', background: '#f8f9ff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>{children}</div>
        <div style={{ padding: '14px 24px', borderTop: '1px solid #f1f4f9', display: 'flex', justifyContent: 'flex-end', gap: 10, background: '#fafbff', flexShrink: 0 }}>
          <button onClick={onClose} style={{ padding: '9px 20px', borderRadius: 7, border: '1.5px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }} onMouseEnter={e => e.currentTarget.style.background = '#f8f9ff'} onMouseLeave={e => e.currentTarget.style.background = '#fff'}>Cancelar</button>
          <button onClick={onSubmit} disabled={submitting || submitDisabled} style={{ padding: '9px 24px', borderRadius: 7, border: 'none', background: submitDisabled ? '#94a3b8' : '#00236f', color: '#fff', fontSize: 13, fontWeight: 700, cursor: submitDisabled ? 'not-allowed' : 'pointer', fontFamily: 'inherit', boxShadow: submitDisabled ? 'none' : '0 2px 8px rgba(0,35,111,0.22)', transition: 'background 0.15s' }} onMouseEnter={e => { if (!submitDisabled && !submitting)
        e.currentTarget.style.background = '#001d5a'; }} onMouseLeave={e => { if (!submitDisabled && !submitting)
        e.currentTarget.style.background = '#00236f'; }}>{submitting ? 'Guardando...' : submitLabel}</button>
        </div>
      </div>
    </div>);
}
function PaginaUsuarios() {
    const [usuarios, setUsuarios] = useState(() => USAR_MOCK ? USUARIOS_INICIAL : []);
    const [cargando, setCargando] = useState(!USAR_MOCK);
    const [errorCarga, setErrorCarga] = useState('');
    const [intentoCarga, setIntentoCarga] = useState(0);
    const [query, setQuery] = useState('');
    const [rolFiltro, setRolFiltro] = useState('Todos');
    const [toast, setToast] = useState(null);
    const [modal, setModal] = useState(null);
    const [editTarget, setEditTarget] = useState(null);
    const [toggleTarget, setToggleTarget] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [seccionesTutor, setSeccionesTutor] = useState([]);
    const [cargandoSeccionesTutor, setCargandoSeccionesTutor] = useState(false);
    const [errorSeccionesTutor, setErrorSeccionesTutor] = useState('');
    const [intentoSeccionesTutor, setIntentoSeccionesTutor] = useState(0);
    // Form fields
    const emptyForm = { nombre: '', apellido: '', apellidoPaterno: '', apellidoMaterno: '', edad: '', dni: '', telefono: '', correo: '', password: '', confirm: '', fechaNacimiento: '', dniApoderado: '', apoderadoSeleccionado: null, apoderadoError: '' };
    const [form, setForm] = useState(emptyForm);
    const [formErrors, setFormErrors] = useState({});
    const [editForm, setEditForm] = useState({ nombre: '', apellidoPaterno: '', apellidoMaterno: '', dni: '', telefono: '', correo: '' });
    const [editErrors, setEditErrors] = useState({});
    useEffect(() => {
        if (USAR_MOCK) return undefined;
        let vigente = true;
        setCargando(true);
        setErrorCarga('');
        listarUsuarios().then(resultado => {
            if (!vigente) return;
            if (!resultado.exitoso) {
                setErrorCarga(resultado.mensaje);
            } else {
                setUsuarios(resultado.datos);
            }
            setCargando(false);
        });
        return () => { vigente = false; };
    }, [intentoCarga]);
    useEffect(() => {
        if (modal !== 'toggle' || !toggleTarget?.activo || toggleTarget.rol !== 'Docente') {
            setSeccionesTutor([]);
            setErrorSeccionesTutor('');
            setCargandoSeccionesTutor(false);
            return undefined;
        }

        let vigente = true;
        setCargandoSeccionesTutor(true);
        setSeccionesTutor([]);
        setErrorSeccionesTutor('');
        listarSeccionesTutor(toggleTarget.id).then((resultado) => {
            if (!vigente) return;
            if (!resultado.exitoso) {
                setErrorSeccionesTutor(resultado.mensaje);
            } else {
                setSeccionesTutor(resultado.datos);
            }
            setCargandoSeccionesTutor(false);
        });
        return () => { vigente = false; };
    }, [modal, toggleTarget, intentoSeccionesTutor]);
    const busqueda = query.trim().toLowerCase();
    const filtered = usuarios.filter(u =>
        (rolFiltro === 'Todos' || u.rol === rolFiltro) &&
        (!busqueda || `${u.nombre} ${u.apellido}`.toLowerCase().includes(busqueda) || u.dni.includes(query.trim()))
    );
    const showToast = (msg, error = false) => {
        setToast({ mensaje: msg, error });
        setTimeout(() => setToast(null), 4000);
    };
    const openRegister = (kind) => {
        setForm(emptyForm);
        setFormErrors({});
        setModal(kind);
    };
    const openEdit = (u) => {
        if (esAdministrador(u)) return;
        setEditTarget(u);
        setEditForm({
            nombre: u.nombre ?? '',
            apellidoPaterno: u.apellidoPaterno ?? u.apellido ?? '',
            apellidoMaterno: u.apellidoMaterno ?? '',
            dni: u.dni ?? '',
            telefono: u.telefono ?? '',
            correo: u.correo ?? ''
        });
        setEditErrors({});
        setModal('editar');
    };
    const openToggle = (u) => {
        if (esAdministrador(u)) return;
        setToggleTarget(u);
        setModal('toggle');
    };
    const closeModal = () => { setModal(null); setSubmitting(false); };
    const f = (key, val) => {
        setForm(p => ({ ...p, [key]: val }));
        setFormErrors(p => ({ ...p, [key]: '' }));
    };
    // Apoderado search for estudiante form
    const searchApoderado = () => {
        const found = usuarios.find(u => u.rol === 'Apoderado' && u.activo && u.dni === form.dniApoderado.trim());
        if (found)
            setForm(p => ({ ...p, apoderadoSeleccionado: found, apoderadoError: '' }));
        else
            setForm(p => ({ ...p, apoderadoSeleccionado: null, apoderadoError: 'No se encontró un apoderado registrado con este DNI.' }));
    };
    const validateRegister = (kind) => {
        const errs = {};
        if (!form.nombre.trim())
            errs.nombre = 'Ingrese el nombre.';
        const apellidosSeparados = kind === 'estudiante' || !USAR_MOCK;
        if (apellidosSeparados && !form.apellidoPaterno.trim())
            errs.apellidoPaterno = 'Ingrese el apellido paterno.';
        if (!apellidosSeparados && !form.apellido.trim())
            errs.apellido = 'Ingrese el apellido.';
        if (kind === 'estudiante' && !form.fechaNacimiento)
            errs.fechaNacimiento = 'Ingrese la fecha de nacimiento.';
        if (kind === 'apoderado') {
            const edad = Number(form.edad);
            const edadMinima = USAR_MOCK ? 18 : 1;
            if (!/^\d+$/.test(form.edad.trim()) || !Number.isSafeInteger(edad) || edad < edadMinima)
                errs.edad = USAR_MOCK ? 'La edad debe ser un número entero de 18 años o más.' : 'Ingrese una edad válida mayor que cero.';
        } else if (USAR_MOCK && kind === 'docente') {
            const edad = Number(form.edad);
            if (!/^\d+$/.test(form.edad.trim()) || !Number.isSafeInteger(edad) || edad < 18)
                errs.edad = 'La edad del docente debe ser un número entero de 18 años o más.';
        }
        const documentoValido = USAR_MOCK && kind === 'apoderado'
            ? /^(?:\d{8}|\d{9})$/.test(form.dni.trim())
            : /^\d{8}$/.test(form.dni.trim());
        if (!documentoValido)
            errs.dni = kind === 'apoderado' ? 'Ingrese un DNI de 8 dígitos o un Carné de Extranjería de 9 dígitos.' : 'El DNI debe tener 8 dígitos.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo.trim()))
            errs.correo = 'Ingrese un correo válido.';
        if (usuarios.some(u => u.dni.trim() === form.dni.trim() && u.rol === ROL_POR_TIPO_REGISTRO[kind]))
            errs.dni = 'Ya existe una cuenta con este DNI y rol.';
        if (form.nombre.trim().length > 80)
            errs.nombre = 'El nombre no puede superar los 80 caracteres.';
        if (form.apellidoPaterno.trim().length > 80)
            errs.apellidoPaterno = 'El apellido paterno no puede superar los 80 caracteres.';
        if (form.apellidoMaterno.trim().length > 80)
            errs.apellidoMaterno = 'El apellido materno no puede superar los 80 caracteres.';
        if (form.correo.trim().length > 160)
            errs.correo = 'El correo no puede superar los 160 caracteres.';
        if (usuarios.some(u => u.correo.trim().toLowerCase() === form.correo.trim().toLowerCase()))
            errs.correo = 'Ya existe un usuario registrado con este correo.';
        const telefonoCompacto = form.telefono.trim().replace(/[\s()-]/g, '');
        const telefonoValido = telefonoCompacto.startsWith('+')
            ? /^\+[1-9]\d{7,14}$/.test(telefonoCompacto)
            : /^9\d{8}$/.test(telefonoCompacto);
        if (USAR_MOCK && (kind === 'estudiante' || kind === 'docente') && !telefonoCompacto)
            errs.telefono = kind === 'docente' ? 'Ingrese el teléfono del docente.' : 'Ingrese el teléfono del estudiante.';
        else if (telefonoCompacto && (USAR_MOCK ? !telefonoValido : !/^\d{9}$/.test(telefonoCompacto)))
            errs.telefono = 'Ingrese 9 dígitos para un celular peruano o un número internacional con + y código de país.';
        if (!form.password)
            errs.password = 'Ingrese la contraseña.';
        else if (form.password.length < 8 || form.password.length > 40)
            errs.password = 'La contraseña debe tener entre 8 y 40 caracteres.';
        if (form.password !== form.confirm)
            errs.confirm = 'Las contraseñas no coinciden.';
        if (kind === 'estudiante' && !form.apoderadoSeleccionado)
            errs.dniApoderado = 'Seleccione un apoderado válido.';
        return errs;
    };
    const handleRegister = async (kind) => {
        const errs = validateRegister(kind);
        if (Object.keys(errs).length) {
            setFormErrors(errs);
            return;
        }
        const telefonoCompacto = form.telefono.trim().replace(/[\s()-]/g, '');
        let codigoEstudiante;
        if (kind === 'estudiante') {
            const normalizarCodigo = codigo => codigo.replace(/-/g, '').toUpperCase();
            const codigosUsados = new Set([
                ...CODIGOS_ESTUDIANTE_HISTORICOS,
                ...usuarios.map(usuario => usuario.codigoEstudiante).filter(Boolean)
            ].map(normalizarCodigo));
            let correlativo = 1;
            do {
                const prefijo = USAR_MOCK ? 'EST-' : 'EST';
                codigoEstudiante = `${prefijo}${String(correlativo).padStart(3, '0')}`;
                correlativo += 1;
            } while (codigosUsados.has(normalizarCodigo(codigoEstudiante)));
        }
        setSubmitting(true);
        try {
            const telefono = form.telefono.trim().replace(/[\s()-]/g, '');
            if (!USAR_MOCK) {
                const datosBase = {
                    nombre: form.nombre.trim(),
                    apellidoPaterno: form.apellidoPaterno.trim(),
                    ...(form.apellidoMaterno.trim() ? { apellidoMaterno: form.apellidoMaterno.trim() } : {}),
                    dni: form.dni.trim(),
                    email: form.correo.trim(),
                    ...(telefono ? { telefono } : {}),
                    password: form.password
                };
                const registrar = {
                    estudiante: () => registrarEstudiante({
                        ...datosBase,
                        codigo: codigoEstudiante,
                        fechaNacimiento: form.fechaNacimiento,
                        apoderadoId: form.apoderadoSeleccionado.id
                    }),
                    apoderado: () => registrarApoderado({ ...datosBase, edad: Number(form.edad) }),
                    docente: () => registrarDocente(datosBase)
                }[kind];
                const resultado = await registrar();

                if (!resultado.exitoso) {
                    showToast(resultado.mensaje || `No fue posible registrar al ${kind}.`, true);
                    return;
                }

                setUsuarios(p => [...p, resultado.datos]);
                closeModal();
                showToast(kind === 'estudiante'
                    ? `El estudiante ha sido registrado correctamente. Código: ${resultado.datos.codigoEstudiante}`
                    : `El ${kind} ha sido registrado correctamente.`);
                return;
            }

            const nuevo = {
                id: 'u' + Date.now(), nombre: form.nombre.trim(),
                apellido: kind === 'estudiante' ? `${form.apellidoPaterno.trim()} ${form.apellidoMaterno.trim()}` : form.apellido.trim(),
                dni: form.dni.trim(), rol: ROL_POR_TIPO_REGISTRO[kind], correo: form.correo.trim(), activo: true,
                ...(kind !== 'estudiante' ? { edad: Number(form.edad) } : {}),
                ...(telefonoCompacto ? { telefono: telefonoCompacto.startsWith('+') ? telefonoCompacto : `+51${telefonoCompacto}` } : {}),
                ...(kind === 'estudiante' ? { codigoEstudiante, apoderadoId: form.apoderadoSeleccionado.id, fechaNacimiento: form.fechaNacimiento } : {})
            };
            setUsuarios(p => [...p, nuevo]);
            closeModal();
            const msg = { apoderado: 'El apoderado ha sido registrado correctamente.', estudiante: 'El estudiante ha sido registrado correctamente.', docente: 'El docente ha sido registrado correctamente.' };
            showToast(kind === 'estudiante' ? `${msg[kind]} Código: ${codigoEstudiante}` : msg[kind]);
        } catch {
            showToast('No fue posible registrar al usuario. Inténtalo de nuevo.', true);
        } finally {
            setSubmitting(false);
        }
    };
    const handleEdit = async () => {
        if (!editTarget || esAdministrador(editTarget)) return;
        const errs = {};
        if (!editForm.nombre.trim())
            errs.nombre = 'Ingrese el nombre.';
        if (editForm.nombre.trim().length > 80)
            errs.nombre = 'El nombre no puede superar los 80 caracteres.';
        if (editForm.apellidoPaterno.trim().length > 80)
            errs.apellidoPaterno = 'El apellido paterno no puede superar los 80 caracteres.';
        if (editForm.apellidoMaterno.trim().length > 80)
            errs.apellidoMaterno = 'El apellido materno no puede superar los 80 caracteres.';
        if (!/^\d{8}$/.test(editForm.dni.trim()))
            errs.dni = 'El DNI debe tener exactamente 8 dígitos.';
        if (usuarios.some(u => u.id !== editTarget.id && u.dni.trim() === editForm.dni.trim() && u.rol === editTarget.rol))
            errs.dni = 'Este DNI ya pertenece a otra cuenta del mismo rol.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.correo.trim()) || editForm.correo.trim().length > 160)
            errs.correo = 'Ingrese un correo válido.';
        if (usuarios.some(u => u.id !== editTarget.id && u.correo.trim().toLowerCase() === editForm.correo.trim().toLowerCase()))
            errs.correo = 'Este correo ya pertenece a otro usuario.';
        const telefonoCompacto = editForm.telefono.trim().replace(/[\s()-]/g, '');
        if (telefonoCompacto && !/^\d{9}$/.test(telefonoCompacto))
            errs.telefono = 'El teléfono debe tener exactamente 9 dígitos.';
        if (Object.keys(errs).length) {
            setEditErrors(errs);
            return;
        }

        const datosActualizados = {};
        const nombre = editForm.nombre.trim();
        const apellidoPaterno = editForm.apellidoPaterno.trim();
        const apellidoMaterno = editForm.apellidoMaterno.trim();
        const dni = editForm.dni.trim();
        const correo = editForm.correo.trim();
        if (nombre !== (editTarget.nombre ?? '')) datosActualizados.nombre = nombre;
        if (apellidoPaterno !== (editTarget.apellidoPaterno ?? editTarget.apellido ?? '')) {
            datosActualizados.apellidoPaterno = apellidoPaterno;
        }
        if (apellidoMaterno !== (editTarget.apellidoMaterno ?? '')) {
            datosActualizados.apellidoMaterno = apellidoMaterno || null;
        }
        if (dni !== (editTarget.dni ?? '')) datosActualizados.dni = dni;
        if (correo !== (editTarget.correo ?? '')) datosActualizados.email = correo;
        if (telefonoCompacto !== (editTarget.telefono ?? '')) {
            datosActualizados.telefono = telefonoCompacto || null;
        }

        if (Object.keys(datosActualizados).length === 0) {
            closeModal();
            showToast('No hay cambios para guardar.');
            return;
        }

        setSubmitting(true);
        try {
            if (USAR_MOCK) {
                setUsuarios(actuales => actuales.map(usuario => usuario.id === editTarget.id ? {
                    ...usuario,
                    nombre,
                    apellido: [apellidoPaterno, apellidoMaterno].filter(Boolean).join(' '),
                    dni,
                    correo,
                    telefono: telefonoCompacto
                } : usuario));
                closeModal();
                showToast('Los datos del usuario han sido actualizados correctamente.');
                return;
            }

            const resultado = await actualizarUsuario(editTarget.id, datosActualizados);
            if (!resultado.exitoso) {
                showToast(resultado.mensaje || 'No fue posible actualizar el usuario.', true);
                return;
            }

            setUsuarios(actuales => actuales.map(usuario => usuario.id === editTarget.id ? resultado.datos : usuario));
            closeModal();
            showToast('Los datos del usuario han sido actualizados correctamente.');
        } catch {
            showToast('No fue posible actualizar el usuario. Revisa la conexión con el backend.', true);
        } finally {
            setSubmitting(false);
        }
    };
    const handleToggle = async () => {
        if (!toggleTarget || esAdministrador(toggleTarget)) return;
        const debeVerificarTutor = toggleTarget.activo && toggleTarget.rol === 'Docente';
        if (debeVerificarTutor && (cargandoSeccionesTutor || errorSeccionesTutor)) return;
        setSubmitting(true);
        const resultado = await cambiarEstadoUsuario(toggleTarget.id, toggleTarget.activo);
        setSubmitting(false);
        if (!resultado.exitoso) {
            showToast(resultado.mensaje || 'No fue posible actualizar el estado del usuario.', true);
            return;
        }
        setUsuarios(p => p.map(u => u.id === toggleTarget.id ? { ...u, activo: !u.activo } : u));
        const msg = toggleTarget.activo ? 'El usuario ha sido desactivado correctamente.' : 'El usuario ha sido activado correctamente.';
        closeModal();
        showToast(msg);
    };
    // Register form body shared by apoderado+docente (same fields)
    const RegisterFields = ({ kind }) => (<div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <UsuarioField label="Nombre" value={form.nombre} onChange={v => f('nombre', v)} placeholder="Ingrese el nombre" error={formErrors.nombre} maxLength={80} required/>
        {kind === 'estudiante'
          ? <UsuarioField label="Apellido paterno" value={form.apellidoPaterno} onChange={v => f('apellidoPaterno', v)} placeholder="Ingrese el apellido paterno" error={formErrors.apellidoPaterno} maxLength={80} required/>
          : !USAR_MOCK
            ? <UsuarioField label="Apellido paterno" value={form.apellidoPaterno} onChange={v => f('apellidoPaterno', v)} placeholder="Ingrese el apellido paterno" error={formErrors.apellidoPaterno} maxLength={80} required/>
            : <UsuarioField label="Apellido" value={form.apellido} onChange={v => f('apellido', v)} placeholder="Ingrese el apellido" error={formErrors.apellido} required/>}
      </div>
      {(kind === 'estudiante' || !USAR_MOCK) && <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <UsuarioField label="Apellido materno" value={form.apellidoMaterno} onChange={v => f('apellidoMaterno', v)} placeholder="Opcional" error={formErrors.apellidoMaterno} maxLength={80}/>
        {kind === 'estudiante' && <UsuarioField label="Fecha de nacimiento" type="date" value={form.fechaNacimiento} onChange={v => f('fechaNacimiento', v)} error={formErrors.fechaNacimiento} required/>}
      </div>}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {(kind === 'apoderado' || (USAR_MOCK && kind === 'docente')) && <div>
          <UsuarioField label="Edad" type="number" min={USAR_MOCK ? 18 : 1} step={1} value={form.edad} onChange={v => f('edad', v)} placeholder="Ingrese la edad" error={formErrors.edad} required/>
          {kind === 'docente' && <p style={{ fontSize: 11, color: '#64748b', margin: '4px 0 0' }}>El docente debe tener 18 años o más.</p>}
        </div>}
        <UsuarioField label={kind === 'apoderado' && USAR_MOCK ? 'Documento de identidad' : 'DNI'} value={form.dni} onChange={v => f('dni', v)} placeholder="Ingrese el DNI" error={formErrors.dni} maxLength={9} required/>
      </div>
      {(kind === 'apoderado' || kind === 'docente' || kind === 'estudiante') && (<>
          <UsuarioField label="Teléfono" type="tel" value={form.telefono} onChange={v => f('telefono', v)} placeholder={USAR_MOCK ? 'Ingrese el teléfono' : '9 dígitos (opcional)'} error={formErrors.telefono} maxLength={9} required={USAR_MOCK ? (kind === 'estudiante' || kind === 'docente') : kind === 'estudiante'}/>
          <p style={{ fontSize: 11, color: '#64748b', margin: '-10px 0 0' }}>Ingresa 9 dígitos; es opcional para apoderados y docentes.</p>
        </>)}
      <UsuarioField label="Correo" type="email" value={form.correo} onChange={v => f('correo', v)} placeholder="Ingrese el correo electrónico" error={formErrors.correo} maxLength={160} required/>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <UsuarioField label={kind === 'estudiante' || kind === 'docente' ? 'Contraseña inicial' : 'Contraseña'} type="password" value={form.password} onChange={v => f('password', v)} placeholder="Ingrese la contraseña" error={formErrors.password} maxLength={40} required/>
        <UsuarioField label="Confirmar contraseña" type="password" value={form.confirm} onChange={v => f('confirm', v)} placeholder="Confirme la contraseña" error={formErrors.confirm} maxLength={40}/>
      </div>
      <p style={{ fontSize: 11, color: '#64748b', margin: '-8px 0 0' }}>La contraseña debe tener entre 8 y 40 caracteres.</p>
      {kind === 'estudiante' && (<div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>DNI del apoderado <span style={{ color: '#ba1a1a' }}>*</span></label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={form.dniApoderado} onChange={e => { setForm(p => ({ ...p, dniApoderado: e.target.value, apoderadoError: '', apoderadoSeleccionado: null })); setFormErrors(p => ({ ...p, dniApoderado: '' })); }} placeholder="Ingrese DNI o Carné de Extranjería..." style={{ flex: 1, padding: '9px 12px', borderRadius: 8, border: `1.5px solid ${(formErrors.dniApoderado || form.apoderadoError) ? '#ba1a1a' : '#dde2f0'}`, background: '#f8f9ff', fontSize: 13, color: '#121c2a', fontFamily: 'inherit', outline: 'none', transition: 'border-color 0.15s' }} onFocus={e => e.currentTarget.style.borderColor = '#0058be'} onBlur={e => e.currentTarget.style.borderColor = '#dde2f0'} onKeyDown={e => e.key === 'Enter' && searchApoderado()}/>
            <button onClick={searchApoderado} style={{ padding: '9px 16px', borderRadius: 8, border: 'none', background: '#0058be', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>Buscar</button>
          </div>
          {form.apoderadoError && <p style={{ fontSize: 11, color: '#ba1a1a', margin: '3px 0 0' }}>{form.apoderadoError}</p>}
          {formErrors.dniApoderado && !form.apoderadoError && <p style={{ fontSize: 11, color: '#ba1a1a', margin: '3px 0 0' }}>{formErrors.dniApoderado}</p>}
          {form.apoderadoSeleccionado && (<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Apoderado seleccionado</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#121c2a' }}>{form.apoderadoSeleccionado.nombre} {form.apoderadoSeleccionado.apellido}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>DNI: {form.apoderadoSeleccionado.dni}</div>
              </div>
              <button onClick={() => setForm(p => ({ ...p, apoderadoSeleccionado: null, dniApoderado: '' }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 4, borderRadius: 6 }} onMouseEnter={e => e.currentTarget.style.color = '#ba1a1a'} onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
            </div>)}
        </div>)}
    </div>);
    return (<div>
      {/* Toast */}
      {toast && (<div role={toast.error ? 'alert' : 'status'} style={{ position: 'fixed', top: 20, right: 24, zIndex: 99999, background: '#121c2a', color: '#fff', padding: '12px 18px', borderRadius: 10, fontSize: 13, fontWeight: 500, boxShadow: '0 8px 28px rgba(0,0,0,0.18)', display: 'flex', alignItems: 'center', gap: 10, maxWidth: 420 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={toast.error ? '#f87171' : '#4ade80'} strokeWidth="2.5" strokeLinecap="round">
            {toast.error ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></> : <polyline points="20 6 9 17 4 12"/>}
          </svg>
          {toast.mensaje}
        </div>)}

      {/* Breadcrumb */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24 }}>
        {['Inicio', 'Usuarios'].map((crumb, i, arr) => (<span key={crumb} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span onClick={() => i === 0 && onNavigate('inicio')} style={{ fontSize: 12, color: i === arr.length - 1 ? '#00236f' : '#94a3b8', fontWeight: i === arr.length - 1 ? 600 : 400, cursor: i < arr.length - 1 ? 'pointer' : 'default' }} onMouseEnter={e => { if (i < arr.length - 1)
            e.currentTarget.style.color = '#475569'; }} onMouseLeave={e => { if (i < arr.length - 1)
            e.currentTarget.style.color = '#94a3b8'; }}>{crumb}</span>
            {i < arr.length - 1 && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>}
          </span>))}
      </nav>

      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#121c2a', letterSpacing: '-0.02em', margin: '0 0 6px' }}>Usuarios</h1>
        <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>Gestiona los usuarios registrados en el sistema.</p>
      </div>

      {/* Search + action bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: '1 1 240px', minWidth: 200, padding: '9px 13px', background: '#fff', border: '1.5px solid #dde2f0', borderRadius: 8, transition: 'border-color 0.15s' }} onFocusCapture={e => e.currentTarget.style.borderColor = '#0058be'} onBlurCapture={e => e.currentTarget.style.borderColor = '#dde2f0'}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar por nombre o DNI..." style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: '#121c2a', width: '100%', fontFamily: 'inherit' }}/>
          {query && <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0, display: 'flex' }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>}
        </div>
        <select value={rolFiltro} onChange={e => setRolFiltro(e.target.value)} aria-label="Filtrar usuarios por rol" style={{ minWidth: 164, padding: '10px 12px', border: '1.5px solid #dde2f0', borderRadius: 8, background: '#fff', color: '#374151', fontSize: 13, fontFamily: 'inherit', outline: 'none', cursor: 'pointer' }}>
          <option value="Todos">Todos los roles</option>
          <option value="Apoderado">Solo apoderados</option>
          <option value="Docente">Solo docentes</option>
          <option value="Estudiante">Solo estudiantes</option>
        </select>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[['apoderado', 'Registrar apoderado'], ['estudiante', 'Registrar estudiante'], ['docente', 'Registrar docente']].map(([kind, label]) => {
            return (<button key={kind} onClick={() => openRegister(kind)} style={{ padding: '9px 16px', borderRadius: 8, border: 'none', background: '#00236f', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 2px 6px rgba(0,35,111,0.18)', transition: 'background 0.12s', whiteSpace: 'nowrap' }} onMouseEnter={e => { e.currentTarget.style.background = '#001d5a'; }} onMouseLeave={e => { e.currentTarget.style.background = '#00236f'; }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              {label}
            </button>);
          })}
        </div>
      </div>

      {/* Users table */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,35,111,0.04)' }}>
        {/* Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 100px 120px 1.6fr 100px 160px', padding: '0 20px', background: '#f8f9ff', borderBottom: '2px solid #e8eaf0' }}>
          {['NOMBRE COMPLETO', 'DNI', 'ROL', 'CORREO', 'ESTADO', 'ACCIONES'].map(col => (<div key={col} style={{ padding: '11px 0', fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: '0.07em', textTransform: 'uppercase' }}>{col}</div>))}
        </div>

        {cargando ? (
          <div role="status" style={{ padding: '40px 20px', textAlign: 'center', color: '#64748b', fontSize: 13 }}>Cargando usuarios...</div>
        ) : errorCarga ? (
          <div role="alert" style={{ padding: '24px 20px', textAlign: 'center', color: '#ba1a1a', fontSize: 13 }}>
            <p>{errorCarga}</p>
            <button type="button" onClick={() => setIntentoCarga(actual => actual + 1)}>Reintentar</button>
          </div>
        ) : filtered.length === 0 ? (<div style={{ padding: '40px 20px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>No se encontraron usuarios.</div>) : (filtered.map((u, idx) => {
            const rb = ROL_BADGE[u.rol];
            return (<div key={u.id} style={{ display: 'grid', gridTemplateColumns: '2fr 100px 120px 1.6fr 100px 160px', padding: '0 20px', borderBottom: idx < filtered.length - 1 ? '1px solid #f1f4f9' : 'none', alignItems: 'center', minHeight: 56, transition: 'background 0.1s' }} onMouseEnter={e => e.currentTarget.style.background = '#fafbff'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{u.nombre} {u.apellido}</div>
                  {u.rol === 'Estudiante' && u.codigoEstudiante && <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>Código: {u.codigoEstudiante}</div>}
                </div>
                <span style={{ fontSize: 12, color: '#64748b', fontFamily: 'monospace' }}>{u.dni}</span>
                <span style={{ display: 'inline-flex', justifySelf: 'start', width: 'fit-content', alignItems: 'center', padding: '3px 9px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: rb.bg, color: rb.color, border: `1px solid ${rb.border}` }}>{u.rol}</span>
                <span style={{ fontSize: 12, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 8 }}>{u.correo}</span>
                <span>
                  {u.activo
                    ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 9px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' }}><span style={{ width: 5, height: 5, borderRadius: '50%', background: '#16a34a', display: 'inline-block' }}/>Activo</span>
                    : <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 9px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0' }}>Desactivado</span>}
                </span>
                <div style={{ display: 'flex', gap: 6 }}>
                  {esAdministrador(u) ? (
                    <span title="Las cuentas de administrador no se pueden modificar desde esta pantalla." style={{ fontSize: 11, color: '#64748b' }}>
                      Cuenta protegida
                    </span>
                  ) : (
                    <>
                      <button onClick={() => openEdit(u)} style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid #e2e8f0', background: '#fff', color: '#374151', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.12s' }} onMouseEnter={e => e.currentTarget.style.background = '#f8f9ff'} onMouseLeave={e => e.currentTarget.style.background = '#fff'}>Editar</button>
                      <button onClick={() => openToggle(u)} style={{ padding: '5px 12px', borderRadius: 6, background: u.activo ? '#fff1f1' : '#f0fdf4', color: u.activo ? '#ba1a1a' : '#16a34a', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', border: `1px solid ${u.activo ? '#fecaca' : '#bbf7d0'}`, transition: 'opacity 0.12s' }} onMouseEnter={e => e.currentTarget.style.opacity = '0.8'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>{u.activo ? 'Desactivar' : 'Activar'}</button>
                    </>
                  )}
                </div>
              </div>);
        }))}
      </div>

      {/* ── Modals: Register ── */}
      {(modal === 'apoderado' || modal === 'estudiante' || modal === 'docente') && (<UsuarioModalShell title={`Registrar ${modal}`} subtitle="Gestión de usuarios" onSubmit={() => handleRegister(modal)} submitLabel="Registrar" submitDisabled={submitting} submitting={submitting} onClose={closeModal}>
          {RegisterFields({ kind: modal })}
        </UsuarioModalShell>)}

      {/* ── Modal: Edit ── */}
      {modal === 'editar' && editTarget && (<UsuarioModalShell title="Editar usuario" subtitle="Gestión de usuarios" onSubmit={handleEdit} submitLabel="Guardar cambios" submitting={submitting} onClose={closeModal}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <UsuarioField label="Nombre" value={editForm.nombre} onChange={v => { setEditForm(p => ({ ...p, nombre: v })); setEditErrors(p => ({ ...p, nombre: '' })); }} placeholder="Nombre" error={editErrors.nombre} maxLength={80} required/>
              <UsuarioField label="Apellido paterno" value={editForm.apellidoPaterno} onChange={v => { setEditForm(p => ({ ...p, apellidoPaterno: v })); setEditErrors(p => ({ ...p, apellidoPaterno: '' })); }} placeholder="Apellido paterno" error={editErrors.apellidoPaterno} maxLength={80}/>
            </div>
            <UsuarioField label="Apellido materno" value={editForm.apellidoMaterno} onChange={v => { setEditForm(p => ({ ...p, apellidoMaterno: v })); setEditErrors(p => ({ ...p, apellidoMaterno: '' })); }} placeholder="Apellido materno (opcional)" error={editErrors.apellidoMaterno} maxLength={80}/>
            <UsuarioField label="DNI" value={editForm.dni} onChange={v => { setEditForm(p => ({ ...p, dni: v })); setEditErrors(p => ({ ...p, dni: '' })); }} placeholder="8 dígitos" error={editErrors.dni} maxLength={8} required/>
            <div>
              <UsuarioField label="Teléfono" type="tel" value={editForm.telefono} onChange={v => { setEditForm(p => ({ ...p, telefono: v })); setEditErrors(p => ({ ...p, telefono: '' })); }} placeholder="9 dígitos (opcional)" error={editErrors.telefono} maxLength={9}/>
              <p style={{ fontSize: 11, color: '#64748b', margin: '4px 0 0' }}>Opcional; si se ingresa, debe contener 9 dígitos.</p>
            </div>
            <UsuarioField label="Correo" value={editForm.correo} onChange={v => { setEditForm(p => ({ ...p, correo: v })); setEditErrors(p => ({ ...p, correo: '' })); }} placeholder="Correo" type="email" error={editErrors.correo} maxLength={160} required/>
          </div>
        </UsuarioModalShell>)}

      {/* ── Modal: Toggle active ── */}
      {modal === 'toggle' && toggleTarget && (<div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 24 }} onClick={e => { if (e.target === e.currentTarget)
            closeModal(); }}>
          <div style={{ background: '#fff', borderRadius: 14, width: '100%', maxWidth: 500, boxShadow: '0 20px 60px rgba(0,35,111,0.18)', padding: '28px 28px 24px' }}>
            <div style={{ width: 44, height: 44, borderRadius: 11, background: toggleTarget.activo ? '#fff1f1' : '#f0fdf4', border: `1px solid ${toggleTarget.activo ? '#fecaca' : '#bbf7d0'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              {toggleTarget.activo
                ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ba1a1a" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
            </div>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: '#121c2a', margin: '0 0 8px' }}>{toggleTarget.activo ? 'Desactivar' : 'Activar'} usuario</h2>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 6px', lineHeight: 1.6 }}>
              {toggleTarget.activo
                ? `¿Está seguro de que desea desactivar a ${toggleTarget.nombre} ${toggleTarget.apellido}?`
                : `¿Está seguro de que desea activar a ${toggleTarget.nombre} ${toggleTarget.apellido}?`}
            </p>
            <p style={{ fontSize: 12, color: '#94a3b8', margin: '0 0 24px', lineHeight: 1.5 }}>
              {toggleTarget.activo
                ? 'El usuario no podrá acceder al sistema mientras se encuentre desactivado.'
                : 'El usuario recuperará el acceso al sistema.'}
            </p>
            {toggleTarget.activo && toggleTarget.rol === 'Docente' && <div style={{ margin: '-10px 0 24px', padding: '12px 14px', borderRadius: 8, background: '#fff7ed', border: '1px solid #fed7aa' }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#9a3412', margin: '0 0 8px' }}>
                {cargandoSeccionesTutor
                  ? 'Consultando las secciones asignadas como tutor…'
                  : errorSeccionesTutor
                    ? 'No se pudieron consultar las asignaciones del docente.'
                    : seccionesTutor.length
                      ? 'Al desactivar este docente, se removerá su asignación como tutor de:'
                      : 'Este docente no tiene asignaciones como tutor en secciones.'}
              </p>
              {seccionesTutor.length > 0 && <ul style={{ margin: 0, paddingLeft: 20, color: '#7c2d12', fontSize: 12, lineHeight: 1.6 }}>
                {seccionesTutor.map((seccion, indice) => <li key={`${seccion.seccionNombre}-${seccion.gradoNombre}-${indice}`}>
                  Sección {seccion.seccionNombre} — {seccion.gradoNombre}
                  {seccion.anioAcademico != null && ` — Año académico ${seccion.anioAcademico}`}
                </li>)}
              </ul>}
              {errorSeccionesTutor && <>
                <p role="alert" style={{ fontSize: 12, color: '#ba1a1a', margin: '0 0 8px' }}>{errorSeccionesTutor}</p>
                <button type="button" onClick={() => setIntentoSeccionesTutor((actual) => actual + 1)} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #fed7aa', background: '#fff', color: '#9a3412', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                  Reintentar consulta
                </button>
              </>}
            </div>}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button onClick={closeModal} style={{ padding: '9px 20px', borderRadius: 7, border: '1.5px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }} onMouseEnter={e => e.currentTarget.style.background = '#f8f9ff'} onMouseLeave={e => e.currentTarget.style.background = '#fff'}>Cancelar</button>
              <button onClick={handleToggle} disabled={submitting || cargandoSeccionesTutor || Boolean(errorSeccionesTutor)} style={{ padding: '9px 24px', borderRadius: 7, border: 'none', background: submitting || cargandoSeccionesTutor || errorSeccionesTutor ? '#94a3b8' : toggleTarget.activo ? '#ba1a1a' : '#16a34a', color: '#fff', fontSize: 13, fontWeight: 700, cursor: submitting || cargandoSeccionesTutor || errorSeccionesTutor ? 'not-allowed' : 'pointer', fontFamily: 'inherit', boxShadow: `0 2px 8px ${toggleTarget.activo ? 'rgba(186,26,26,0.25)' : 'rgba(22,163,74,0.25)'}`, transition: 'background 0.12s' }} onMouseEnter={e => { if (!submitting && !cargandoSeccionesTutor && !errorSeccionesTutor) e.currentTarget.style.opacity = '0.88'; }} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>{submitting ? 'Guardando...' : (cargandoSeccionesTutor ? 'Consultando…' : toggleTarget.activo ? 'Desactivar' : 'Activar')}</button>
            </div>
          </div>
        </div>)}
    </div>);
}

export default PaginaUsuarios;
