import { useState } from 'react';
import { USUARIOS_INICIAL, CODIGOS_ESTUDIANTE_HISTORICOS } from '../services/usuariosService.js';

const ROL_BADGE = {
    Apoderado: { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
    Estudiante: { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
    Docente: { bg: '#fdf4ff', color: '#7e22ce', border: '#e9d5ff' },
};

function UsuarioField({ label, value, onChange, placeholder, type = 'text', error, required = false, min, step }) {
    return (<div>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>{label}{required && <span style={{ color: '#ba1a1a' }}> *</span>}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required={required} min={min} step={step} style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: `1.5px solid ${error ? '#ba1a1a' : '#dde2f0'}`, background: '#f8f9ff', fontSize: 13, color: '#121c2a', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s' }} onFocus={e => e.currentTarget.style.borderColor = error ? '#ba1a1a' : '#0058be'} onBlur={e => e.currentTarget.style.borderColor = error ? '#ba1a1a' : '#dde2f0'}/>
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
    const [usuarios, setUsuarios] = useState(USUARIOS_INICIAL);
    const [query, setQuery] = useState('');
    const [rolFiltro, setRolFiltro] = useState('Todos');
    const [toast, setToast] = useState(null);
    const [modal, setModal] = useState(null);
    const [editTarget, setEditTarget] = useState(null);
    const [toggleTarget, setToggleTarget] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    // Form fields
    const emptyForm = { nombre: '', apellido: '', edad: '', dni: '', telefono: '', correo: '', password: '', confirm: '', dniApoderado: '', apoderadoSeleccionado: null, apoderadoError: '' };
    const [form, setForm] = useState(emptyForm);
    const [formErrors, setFormErrors] = useState({});
    const [editForm, setEditForm] = useState({ nombre: '', apellido: '', dni: '', telefono: '', correo: '', dniApoderado: '', apoderadoSeleccionado: null });
    const [editErrors, setEditErrors] = useState({});
    const busqueda = query.trim().toLowerCase();
    const filtered = usuarios.filter(u =>
        (rolFiltro === 'Todos' || u.rol === rolFiltro) &&
        (!busqueda || `${u.nombre} ${u.apellido}`.toLowerCase().includes(busqueda) || u.dni.includes(query.trim()))
    );
    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 4000); };
    const openRegister = (kind) => {
        setForm(emptyForm);
        setFormErrors({});
        setModal(kind);
    };
    const openEdit = (u) => {
        setEditTarget(u);
        const apoderadoSeleccionado = u.apoderadoId ? usuarios.find(usuario => usuario.id === u.apoderadoId) || null : null;
        setEditForm({ nombre: u.nombre, apellido: u.apellido, edad: u.edad ?? '', dni: u.dni, telefono: u.telefono || '', correo: u.correo, dniApoderado: apoderadoSeleccionado?.dni || '', apoderadoSeleccionado });
        setEditErrors({});
        setModal('editar');
    };
    const openToggle = (u) => { setToggleTarget(u); setModal('toggle'); };
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
    const searchEditApoderado = () => {
        const found = usuarios.find(u => u.rol === 'Apoderado' && u.activo && u.dni === editForm.dniApoderado.trim());
        if (found) {
            setEditForm(p => ({ ...p, apoderadoSeleccionado: found }));
            setEditErrors(p => ({ ...p, apoderadoId: '' }));
        } else {
            setEditForm(p => ({ ...p, apoderadoSeleccionado: null }));
            setEditErrors(p => ({ ...p, apoderadoId: 'No se encontró un apoderado registrado con este DNI.' }));
        }
    };
    const validateRegister = (kind) => {
        const errs = {};
        if (!form.nombre.trim())
            errs.nombre = 'Ingrese el nombre.';
        if (!form.apellido.trim())
            errs.apellido = 'Ingrese el apellido.';
        if (kind === 'apoderado' || kind === 'docente') {
            const edad = Number(form.edad);
            if (!/^\d+$/.test(form.edad.trim()) || !Number.isSafeInteger(edad) || edad < 18)
                errs.edad = kind === 'docente' ? 'La edad del docente debe ser un número entero de 18 años o más.' : 'La edad debe ser un número entero de 18 años o más.';
        } else if (kind === 'estudiante' || kind === 'docente') {
            const edad = Number(form.edad);
            if (!/^\d+$/.test(form.edad.trim()) || !Number.isSafeInteger(edad) || edad <= 0)
                errs.edad = 'La edad debe ser un número entero positivo.';
        } else if (!form.edad.trim() || isNaN(Number(form.edad)))
            errs.edad = 'Ingrese una edad válida.';
        const documentoValido = kind === 'apoderado' ? /^(?:\d{8}|\d{9})$/.test(form.dni.trim()) : /^\d{8}$/.test(form.dni.trim());
        if (!documentoValido)
            errs.dni = kind === 'apoderado' ? 'Ingrese un DNI de 8 dígitos o un Carné de Extranjería de 9 dígitos.' : 'El DNI debe tener 8 dígitos.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo.trim()))
            errs.correo = 'Ingrese un correo válido.';
        if (usuarios.some(u => u.dni.trim() === form.dni.trim()))
            errs.dni = 'Ya existe un usuario registrado con este documento.';
        if (usuarios.some(u => u.correo.trim().toLowerCase() === form.correo.trim().toLowerCase()))
            errs.correo = 'Ya existe un usuario registrado con este correo.';
        const telefonoCompacto = form.telefono.trim().replace(/[\s()-]/g, '');
        const telefonoValido = telefonoCompacto.startsWith('+')
            ? /^\+[1-9]\d{7,14}$/.test(telefonoCompacto)
            : /^9\d{8}$/.test(telefonoCompacto);
        if ((kind === 'estudiante' || kind === 'docente') && !telefonoCompacto)
            errs.telefono = kind === 'docente' ? 'Ingrese el teléfono del docente.' : 'Ingrese el teléfono del estudiante.';
        else if ((kind === 'estudiante' || kind === 'apoderado' || kind === 'docente') && telefonoCompacto && !telefonoValido)
            errs.telefono = 'Ingrese 9 dígitos para un celular peruano o un número internacional con + y código de país.';
        if (kind === 'apoderado' && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(form.password))
            errs.password = 'Use al menos 8 caracteres, con mayúscula, minúscula, número y símbolo.';
        else if (!form.password)
            errs.password = 'Ingrese la contraseña.';
        if (form.password !== form.confirm)
            errs.confirm = 'Las contraseñas no coinciden.';
        if (kind === 'estudiante' && !form.apoderadoSeleccionado)
            errs.dniApoderado = 'Seleccione un apoderado válido.';
        return errs;
    };
    const handleRegister = (kind) => {
        const errs = validateRegister(kind);
        if (Object.keys(errs).length) {
            setFormErrors(errs);
            return;
        }
        const telefonoCompacto = form.telefono.trim().replace(/[\s()-]/g, '');
        let codigoEstudiante;
        if (kind === 'estudiante') {
            const codigosUsados = new Set([
                ...CODIGOS_ESTUDIANTE_HISTORICOS,
                ...usuarios.map(usuario => usuario.codigoEstudiante).filter(Boolean)
            ]);
            let correlativo = 1;
            do {
                codigoEstudiante = `EST-${String(correlativo).padStart(3, '0')}`;
                correlativo += 1;
            } while (codigosUsados.has(codigoEstudiante));
        }
        setSubmitting(true);
        setTimeout(() => {
            const rolMap = { apoderado: 'Apoderado', estudiante: 'Estudiante', docente: 'Docente' };
            const nuevo = {
                id: 'u' + Date.now(), nombre: form.nombre.trim(), apellido: form.apellido.trim(),
                dni: form.dni.trim(), rol: rolMap[kind], correo: form.correo.trim(), activo: true,
                edad: Number(form.edad), ...(telefonoCompacto ? { telefono: telefonoCompacto.startsWith('+') ? telefonoCompacto : `+51${telefonoCompacto}` } : {}),
                ...(kind === 'estudiante' ? { codigoEstudiante, apoderadoId: form.apoderadoSeleccionado.id } : {})
            };
            setUsuarios(p => [...p, nuevo]);
            closeModal();
            const msg = { apoderado: 'El apoderado ha sido registrado correctamente.', estudiante: 'El estudiante ha sido registrado correctamente.', docente: 'El docente ha sido registrado correctamente.' };
            showToast(kind === 'estudiante' ? `${msg[kind]} Código: ${codigoEstudiante}` : msg[kind]);
        }, 700);
    };
    const handleEdit = () => {
        const errs = {};
        if (!editForm.nombre.trim())
            errs.nombre = 'Ingrese el nombre.';
        if (!editForm.apellido.trim())
            errs.apellido = 'Ingrese el apellido.';
        const edadIngresada = String(editForm.edad).trim();
        const edad = Number(edadIngresada);
        const edadMinima = editTarget?.rol === 'Estudiante' ? 1 : 18;
        if (edadIngresada && (!/^\d+$/.test(edadIngresada) || !Number.isSafeInteger(edad) || edad < edadMinima))
            errs.edad = edadMinima === 18 ? 'La edad debe ser un número entero de 18 años o más.' : 'La edad debe ser un número entero positivo.';
        const documentoValido = editTarget?.rol === 'Apoderado'
            ? /^(?:\d{8}|\d{9})$/.test(editForm.dni.trim())
            : /^\d{8}$/.test(editForm.dni.trim());
        if (!documentoValido)
            errs.dni = editTarget?.rol === 'Apoderado' ? 'Ingrese un DNI de 8 dígitos o un Carné de Extranjería de 9 dígitos.' : 'El DNI debe tener 8 dígitos.';
        if (usuarios.some(u => u.id !== editTarget?.id && u.dni.trim() === editForm.dni.trim()))
            errs.dni = 'Este DNI ya pertenece a otro usuario.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.correo.trim()))
            errs.correo = 'Ingrese un correo válido.';
        if (usuarios.some(u => u.id !== editTarget?.id && u.correo.trim().toLowerCase() === editForm.correo.trim().toLowerCase()))
            errs.correo = 'Este correo ya pertenece a otro usuario.';
        const telefonoCompacto = editForm.telefono.trim().replace(/[\s()-]/g, '');
        const telefonoValido = telefonoCompacto.startsWith('+')
            ? /^\+[1-9]\d{7,14}$/.test(telefonoCompacto)
            : /^9\d{8}$/.test(telefonoCompacto);
        if (editTarget?.rol === 'Estudiante' && !telefonoCompacto)
            errs.telefono = 'Ingrese el teléfono del estudiante.';
        else if (telefonoCompacto && !telefonoValido)
            errs.telefono = 'Ingrese 9 dígitos para un celular peruano o un número internacional con + y código de país.';
        if (editTarget?.rol === 'Estudiante' && !editForm.apoderadoSeleccionado)
            errs.apoderadoId = 'Seleccione un apoderado registrado.';
        if (Object.keys(errs).length) {
            setEditErrors(errs);
            return;
        }
        setSubmitting(true);
        setTimeout(() => {
            const telefono = telefonoCompacto ? (telefonoCompacto.startsWith('+') ? telefonoCompacto : `+51${telefonoCompacto}`) : '';
            setUsuarios(p => p.map(u => u.id === editTarget?.id ? {
                ...u,
                nombre: editForm.nombre.trim(),
                apellido: editForm.apellido.trim(),
                ...(edadIngresada ? { edad } : {}),
                dni: editForm.dni.trim(),
                correo: editForm.correo.trim(),
                telefono,
                ...(u.rol === 'Estudiante' ? { apoderadoId: editForm.apoderadoSeleccionado.id } : {})
            } : u));
            closeModal();
            showToast('Los datos del usuario han sido actualizados correctamente.');
        }, 700);
    };
    const handleToggle = () => {
        setSubmitting(true);
        setTimeout(() => {
            setUsuarios(p => p.map(u => u.id === toggleTarget?.id ? { ...u, activo: !u.activo } : u));
            const msg = toggleTarget?.activo ? 'El usuario ha sido desactivado correctamente.' : 'El usuario ha sido activado correctamente.';
            closeModal();
            showToast(msg);
        }, 700);
    };
    // Register form body shared by apoderado+docente (same fields)
    const RegisterFields = ({ kind }) => (<div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <UsuarioField label="Nombre" value={form.nombre} onChange={v => f('nombre', v)} placeholder="Ingrese el nombre" error={formErrors.nombre} required/>
        <UsuarioField label="Apellido" value={form.apellido} onChange={v => f('apellido', v)} placeholder="Ingrese el apellido" error={formErrors.apellido} required/>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <UsuarioField label="Edad" type="number" min={kind === 'estudiante' ? 1 : 18} step={1} value={form.edad} onChange={v => f('edad', v)} placeholder="Ingrese la edad" error={formErrors.edad} required/>
          {kind === 'docente' && <p style={{ fontSize: 11, color: '#64748b', margin: '4px 0 0' }}>El docente debe tener 18 años o más.</p>}
        </div>
        <div>
          <UsuarioField label={kind === 'apoderado' ? 'Documento de identidad' : 'DNI'} value={form.dni} onChange={v => f('dni', v)} placeholder={kind === 'apoderado' ? 'DNI o Carné de Extranjería' : 'Ingrese el DNI'} error={formErrors.dni} required/>
          {kind === 'apoderado' && <p style={{ fontSize: 11, color: '#64748b', margin: '4px 0 0' }}>DNI: 8 dígitos · Carné de Extranjería (C.E.): 9 dígitos.</p>}
        </div>
      </div>
      {(kind === 'apoderado' || kind === 'docente' || kind === 'estudiante') && (<>
          <UsuarioField label="Teléfono" type="tel" value={form.telefono} onChange={v => f('telefono', v)} placeholder="Ingrese el teléfono" error={formErrors.telefono} required={kind === 'estudiante' || kind === 'docente'}/>
          <p style={{ fontSize: 11, color: '#64748b', margin: '-10px 0 0' }}>Perú: ingrese 9 dígitos. Otro país: incluya + y el prefijo internacional.</p>
        </>)}
      <UsuarioField label="Correo" type="email" value={form.correo} onChange={v => f('correo', v)} placeholder="Ingrese el correo electrónico" error={formErrors.correo} required/>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <UsuarioField label={kind === 'estudiante' || kind === 'docente' ? 'Contraseña inicial' : 'Contraseña'} type="password" value={form.password} onChange={v => f('password', v)} placeholder="Ingrese la contraseña" error={formErrors.password} required/>
        <UsuarioField label="Confirmar contraseña" type="password" value={form.confirm} onChange={v => f('confirm', v)} placeholder="Confirme la contraseña" error={formErrors.confirm}/>
      </div>
      {kind === 'apoderado' && <p style={{ fontSize: 11, color: '#64748b', margin: '-8px 0 0' }}>La contraseña debe tener al menos 8 caracteres e incluir una mayúscula, una minúscula, un número y un símbolo.</p>}
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
      {toast && (<div style={{ position: 'fixed', top: 20, right: 24, zIndex: 99999, background: '#121c2a', color: '#fff', padding: '12px 18px', borderRadius: 10, fontSize: 13, fontWeight: 500, boxShadow: '0 8px 28px rgba(0,0,0,0.18)', display: 'flex', alignItems: 'center', gap: 10, maxWidth: 420 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
          {toast}
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
          {[['apoderado', 'Registrar apoderado'], ['estudiante', 'Registrar estudiante'], ['docente', 'Registrar docente']].map(([kind, label]) => (<button key={kind} onClick={() => openRegister(kind)} style={{ padding: '9px 16px', borderRadius: 8, border: 'none', background: '#00236f', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 2px 6px rgba(0,35,111,0.18)', transition: 'background 0.12s', whiteSpace: 'nowrap' }} onMouseEnter={e => e.currentTarget.style.background = '#001d5a'} onMouseLeave={e => e.currentTarget.style.background = '#00236f'}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              {label}
            </button>))}
        </div>
      </div>

      {/* Users table */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,35,111,0.04)' }}>
        {/* Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 100px 90px 1.6fr 100px 160px', padding: '0 20px', background: '#f8f9ff', borderBottom: '2px solid #e8eaf0' }}>
          {['NOMBRE COMPLETO', 'DNI', 'ROL', 'CORREO', 'ESTADO', 'ACCIONES'].map(col => (<div key={col} style={{ padding: '11px 0', fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: '0.07em', textTransform: 'uppercase' }}>{col}</div>))}
        </div>

        {filtered.length === 0 ? (<div style={{ padding: '40px 20px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>No se encontraron usuarios.</div>) : (filtered.map((u, idx) => {
            const rb = ROL_BADGE[u.rol];
            return (<div key={u.id} style={{ display: 'grid', gridTemplateColumns: '2fr 100px 90px 1.6fr 100px 160px', padding: '0 20px', borderBottom: idx < filtered.length - 1 ? '1px solid #f1f4f9' : 'none', alignItems: 'center', minHeight: 56, transition: 'background 0.1s' }} onMouseEnter={e => e.currentTarget.style.background = '#fafbff'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{u.nombre} {u.apellido}</div>
                  {u.rol === 'Estudiante' && u.codigoEstudiante && <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>Código: {u.codigoEstudiante}</div>}
                </div>
                <span style={{ fontSize: 12, color: '#64748b', fontFamily: 'monospace' }}>{u.dni}</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 9px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: rb.bg, color: rb.color, border: `1px solid ${rb.border}` }}>{u.rol}</span>
                <span style={{ fontSize: 12, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 8 }}>{u.correo}</span>
                <span>
                  {u.activo
                    ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 9px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' }}><span style={{ width: 5, height: 5, borderRadius: '50%', background: '#16a34a', display: 'inline-block' }}/>Activo</span>
                    : <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 9px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0' }}>Desactivado</span>}
                </span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => openEdit(u)} style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid #e2e8f0', background: '#fff', color: '#374151', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.12s' }} onMouseEnter={e => e.currentTarget.style.background = '#f8f9ff'} onMouseLeave={e => e.currentTarget.style.background = '#fff'}>Editar</button>
                  <button onClick={() => openToggle(u)} style={{ padding: '5px 12px', borderRadius: 6, background: u.activo ? '#fff1f1' : '#f0fdf4', color: u.activo ? '#ba1a1a' : '#16a34a', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', border: `1px solid ${u.activo ? '#fecaca' : '#bbf7d0'}`, transition: 'opacity 0.12s' }} onMouseEnter={e => e.currentTarget.style.opacity = '0.8'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>{u.activo ? 'Desactivar' : 'Activar'}</button>
                </div>
              </div>);
        }))}
      </div>

      {/* ── Modals: Register ── */}
      {(modal === 'apoderado' || modal === 'estudiante' || modal === 'docente') && (<UsuarioModalShell title={`Registrar ${modal}`} subtitle="Gestión de usuarios" onSubmit={() => handleRegister(modal)} submitLabel="Registrar" submitDisabled={modal === 'estudiante' && !form.apoderadoSeleccionado && false} submitting={submitting} onClose={closeModal}>
          {RegisterFields({ kind: modal })}
        </UsuarioModalShell>)}

      {/* ── Modal: Edit ── */}
      {modal === 'editar' && editTarget && (<UsuarioModalShell title="Editar usuario" subtitle="Gestión de usuarios" onSubmit={handleEdit} submitLabel="Guardar cambios" submitDisabled={editTarget.rol === 'Estudiante' && !editForm.apoderadoSeleccionado} submitting={submitting} onClose={closeModal}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <UsuarioField label="Nombre" value={editForm.nombre} onChange={v => { setEditForm(p => ({ ...p, nombre: v })); setEditErrors(p => ({ ...p, nombre: '' })); }} placeholder="Nombre" error={editErrors.nombre}/>
              <UsuarioField label="Apellido" value={editForm.apellido} onChange={v => { setEditForm(p => ({ ...p, apellido: v })); setEditErrors(p => ({ ...p, apellido: '' })); }} placeholder="Apellido" error={editErrors.apellido}/>
            </div>
            <UsuarioField label="Edad" type="number" min={1} step={1} value={editForm.edad} onChange={v => { setEditForm(p => ({ ...p, edad: v })); setEditErrors(p => ({ ...p, edad: '' })); }} placeholder="Ingrese la edad" error={editErrors.edad}/>
            <UsuarioField label={editTarget.rol === 'Apoderado' ? 'DNI / Carné de Extranjería (C.E.)' : 'DNI'} value={editForm.dni} onChange={v => { setEditForm(p => ({ ...p, dni: v })); setEditErrors(p => ({ ...p, dni: '' })); }} placeholder={editTarget.rol === 'Apoderado' ? 'DNI o Carné de Extranjería' : 'Ingrese el DNI'} error={editErrors.dni}/>
            <div>
              <UsuarioField label="Teléfono" type="tel" value={editForm.telefono} onChange={v => { setEditForm(p => ({ ...p, telefono: v })); setEditErrors(p => ({ ...p, telefono: '' })); }} placeholder="Ingrese 9 dígitos o prefijo internacional +código" error={editErrors.telefono} required={editTarget.rol === 'Estudiante'}/>
              <p style={{ fontSize: 11, color: '#64748b', margin: '4px 0 0' }}>Perú: 9 dígitos. Otro país: incluya + y el prefijo internacional.</p>
            </div>
            {editTarget.rol === 'Estudiante' && <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Apoderado asociado <span style={{ color: '#ba1a1a' }}>*</span></label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input value={editForm.dniApoderado} onChange={e => { setEditForm(p => ({ ...p, dniApoderado: e.target.value, apoderadoSeleccionado: null })); setEditErrors(p => ({ ...p, apoderadoId: '' })); }} placeholder="Buscar apoderado por DNI..." style={{ flex: 1, minWidth: 0, padding: '9px 12px', borderRadius: 8, border: `1.5px solid ${editErrors.apoderadoId ? '#ba1a1a' : '#dde2f0'}`, background: '#f8f9ff', fontSize: 13, color: '#121c2a', fontFamily: 'inherit', outline: 'none' }} onKeyDown={e => e.key === 'Enter' && searchEditApoderado()}/>
                <button onClick={searchEditApoderado} style={{ padding: '9px 16px', borderRadius: 8, border: 'none', background: '#0058be', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>Buscar</button>
              </div>
              {editErrors.apoderadoId && <p style={{ fontSize: 11, color: '#ba1a1a', margin: '3px 0 0' }}>{editErrors.apoderadoId}</p>}
              {editForm.apoderadoSeleccionado && <div style={{ marginTop: 8, padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Apoderado que quedará asociado</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#121c2a' }}>{editForm.apoderadoSeleccionado.nombre} {editForm.apoderadoSeleccionado.apellido}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>DNI: {editForm.apoderadoSeleccionado.dni}</div>
              </div>}
              {!editForm.apoderadoSeleccionado && <p style={{ fontSize: 11, color: '#64748b', margin: '6px 0 0' }}>Busca y selecciona un apoderado para habilitar «Guardar cambios».</p>}
            </div>}
            <UsuarioField label="Correo" value={editForm.correo} onChange={v => { setEditForm(p => ({ ...p, correo: v })); setEditErrors(p => ({ ...p, correo: '' })); }} placeholder="Correo" type="email" error={editErrors.correo}/>
          </div>
        </UsuarioModalShell>)}

      {/* ── Modal: Toggle active ── */}
      {modal === 'toggle' && toggleTarget && (<div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 24 }} onClick={e => { if (e.target === e.currentTarget)
            closeModal(); }}>
          <div style={{ background: '#fff', borderRadius: 14, width: '100%', maxWidth: 420, boxShadow: '0 20px 60px rgba(0,35,111,0.18)', padding: '28px 28px 24px' }}>
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
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button onClick={closeModal} style={{ padding: '9px 20px', borderRadius: 7, border: '1.5px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }} onMouseEnter={e => e.currentTarget.style.background = '#f8f9ff'} onMouseLeave={e => e.currentTarget.style.background = '#fff'}>Cancelar</button>
              <button onClick={handleToggle} disabled={submitting} style={{ padding: '9px 24px', borderRadius: 7, border: 'none', background: toggleTarget.activo ? '#ba1a1a' : '#16a34a', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: `0 2px 8px ${toggleTarget.activo ? 'rgba(186,26,26,0.25)' : 'rgba(22,163,74,0.25)'}`, transition: 'background 0.12s' }} onMouseEnter={e => e.currentTarget.style.opacity = '0.88'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>{submitting ? 'Guardando...' : (toggleTarget.activo ? 'Desactivar' : 'Activar')}</button>
            </div>
          </div>
        </div>)}
    </div>);
}

export default PaginaUsuarios;
