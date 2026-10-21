import React, { useState, useRef } from 'react';
/* ═══════════════════════════════════════════════════════════
   COLEGIO SAN MARCOS — Sistema de Gestión Escolar 2026
   ICONS  (defined first — no forward refs from data consts)
══════════════════════════════════════════════════════════════ */
function HomeIcon({ size = 16, color = 'currentColor' }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
}
function UsersIcon({ size = 16, color = 'currentColor' }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
}
function CreditCardIcon({ size = 16, color = 'currentColor' }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>;
}
function CalendarCheckIcon({ size = 16, color = 'currentColor' }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><polyline points="9 16 11 18 15 14"/></svg>;
}
function ClockIcon({ size = 16, color = 'currentColor' }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
}
function ClipboardIcon({ size = 16, color = 'currentColor' }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>;
}
function ChartBarIcon({ size = 16, color = 'currentColor' }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>;
}
function UserCircleIcon({ size = 16, color = 'currentColor' }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
}
function ExclamationIcon({ size = 16, color = 'currentColor' }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
}
function WarningIcon({ size = 16, color = 'currentColor' }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
}
function LockIcon({ size = 16, color = 'currentColor' }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
}
function DoorIcon({ size = 16, color = 'currentColor' }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"/><path d="M9 21V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v16"/><path d="M9 5H7a2 2 0 0 0-2 2v14"/></svg>;
}
function PersonIcon({ size = 16, color = 'currentColor' }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
}
function ShieldIcon({ size = 16, color = 'currentColor' }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
}
function BoardIcon({ size = 16, color = 'currentColor' }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>;
}
function StudentIcon({ size = 16, color = 'currentColor' }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>;
}
function FamilyIcon({ size = 16, color = 'currentColor' }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
}
function BookOpenIcon({ size = 16, color = 'currentColor' }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
}
function NoteIcon({ size = 16, color = 'currentColor' }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>;
}
function CheckSquareIcon({ size = 16, color = 'currentColor' }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>;
}
function AuditIcon({ size = 16, color = 'currentColor' }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/><polyline points="9 13 8 13"/></svg>;
}
function ErrorLogIcon({ size = 16, color = 'currentColor' }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/><circle cx="15" cy="15" r="2"/><line x1="15" y1="12" x2="15" y2="13"/></svg>;
}
/* ═══════════════════════════════════════════════════════════
   DATA CONSTANTS
══════════════════════════════════════════════════════════════ */
/* Admin sidebar nav — structured for the three sections */
const NAV_ITEMS_PRINCIPAL = [
    { id: 'inicio', label: 'Inicio', icon: HomeIcon },
];
const NAV_ITEMS_GESTION = [
    { id: 'usuarios', label: 'Usuarios', icon: UserCircleIcon },
    { id: 'matriculas', label: 'Matrículas', icon: UsersIcon },
    { id: 'cursos', label: 'Cursos', icon: BookOpenIcon },
    { id: 'pagos', label: 'Pagos', icon: CreditCardIcon },
    { id: 'horarios', label: 'Horarios', icon: ClockIcon },
];
const NAV_ITEMS_ADMIN = [
    { id: 'auditorias', label: 'Auditorías', icon: AuditIcon },
    { id: 'logerrores', label: 'Log de errores', icon: ErrorLogIcon },
];
const NAV_ITEMS = [
    ...NAV_ITEMS_PRINCIPAL,
    ...NAV_ITEMS_GESTION,
    ...NAV_ITEMS_ADMIN,
];
/* Student sidebar nav */
const NAV_STUDENT = [
    { id: 'mihorario', label: 'Mi horario', icon: ClockIcon },
    { id: 'cursos', label: 'Cursos', icon: BookOpenIcon },
    { id: 'rendimiento', label: 'Rendimiento académico', icon: ChartBarIcon },
    { id: 'libreta', label: 'Libreta de notas', icon: NoteIcon },
];
/* Parent (Apoderado) sidebar nav */
const NAV_PARENT = [
    { id: 'mihorario', label: 'Mi horario', icon: ClockIcon },
    { id: 'pagos', label: 'Pagos', icon: CreditCardIcon },
    { id: 'cursos', label: 'Cursos', icon: BookOpenIcon },
    { id: 'rendimiento', label: 'Rendimiento académico', icon: ChartBarIcon },
    { id: 'libreta', label: 'Libreta de notas', icon: NoteIcon },
];
const PAYMENTS = [
    { alumno: 'García Rodríguez, Sofía', fecha: '2026-09-17', concepto: 'Mensualidad Sep.', estado: 'Pagado' },
    { alumno: 'Martínez López, Carlos', fecha: '2026-09-15', concepto: 'Mensualidad Sep.', estado: 'Pendiente' },
    { alumno: 'Hernández Cruz, Valeria', fecha: '2026-09-10', concepto: 'Inscripción 2026', estado: 'Moroso' },
    { alumno: 'Torres Jiménez, Miguel', fecha: '2026-09-08', concepto: 'Mensualidad Ago.', estado: 'Pagado' },
    { alumno: 'Ramírez Flores, Daniela', fecha: '2026-09-05', concepto: 'Mensualidad Ago.', estado: 'Pendiente' },
    { alumno: 'Sánchez Morales, Andrés', fecha: '2026-09-01', concepto: 'Actividades Extra.', estado: 'Moroso' },
];
const STATUS_CONFIG = {
    Pagado: { bg: '#dcfce7', text: '#15803d', border: '#bbf7d0' },
    Pendiente: { bg: '#fef3c7', text: '#b45309', border: '#fde68a' },
    Moroso: { bg: '#fee2e2', text: '#991b1b', border: '#fecaca' },
};
const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
const SLOTS = ['08:00 – 09:30', '09:30 – 11:00', '11:30 – 13:00'];
const SCHEDULE = [
    [
        { subject: 'Matemáticas', room: 'Aula 201', teacher: 'Prof. García' },
        { subject: 'Comunicación', room: 'Aula 105', teacher: 'Prof. Quispe' },
        { subject: 'Inglés', room: 'Lab. Idiom', teacher: 'Prof. Torres' },
        { subject: 'Arte', room: 'Taller A', teacher: 'Prof. Vargas' },
        { subject: 'Ed. Física', room: 'Gimnasio', teacher: 'Prof. Romero' },
    ],
    [
        { subject: 'Física Clásica', room: 'Aula 201', teacher: 'Prof. Delgado', conflict: true },
        { subject: 'Historia', room: 'Aula 201', teacher: 'Prof. Mendoza' },
        { subject: 'Matemáticas', room: 'Aula 201', teacher: 'Prof. García' },
        undefined,
        { subject: 'Química', room: 'Lab. Cien', teacher: 'Prof. Llanos' },
    ],
    [
        { subject: 'Geografía', room: 'Aula 203', teacher: 'Prof. Suárez' },
        { subject: 'Biología', room: 'Lab. Cien', teacher: 'Prof. Llanos' },
        undefined,
        { subject: 'Física Clásica', room: 'Aula 308', teacher: 'Prof. Delgado' },
        { subject: 'Historia', room: 'Aula 202', teacher: 'Prof. Mendoza' },
    ],
];
const STUDENTS_LIST = [
    { id: '1', name: 'Carlos Mendoza', grade: '4to Grado B' },
    { id: '2', name: 'Luciana Mendoza', grade: '2do Grado A' },
];
const GRADE_CFG = {
    AD: { label: 'AD', bg: '#f0fdf4', text: '#15803d', border: '#86efac', bar: '#16a34a', desc: 'Logro Destacado' },
    A: { label: 'A', bg: '#f0fdf4', text: '#166534', border: '#bbf7d0', bar: '#22c55e', desc: 'Logro Esperado' },
    B: { label: 'B', bg: '#fffbeb', text: '#92400e', border: '#fcd34d', bar: '#d97706', desc: 'En Proceso' },
    C: { label: 'C', bg: '#fff1f1', text: '#991b1b', border: '#fca5a5', bar: '#ba1a1a', desc: 'En Inicio' },
};
const GRADE_SCORE = { AD: 100, A: 80, B: 55, C: 30 };
const COURSES = [
    {
        area: 'Matemáticas',
        competencias: [
            { comp: 'Resolución de Problemas de Cantidad', grade: 'AD', docente: 'Prof. García' },
            { comp: 'Gestión de Datos e Incertidumbre', grade: 'A', docente: 'Prof. García' },
        ],
        icon: '📐', hue: 210,
    },
    {
        area: 'Comunicación',
        competencias: [
            { comp: 'Comprensión de Textos Escritos', grade: 'A', docente: 'Prof. Quispe' },
            { comp: 'Producción de Textos Escritos', grade: 'A', docente: 'Prof. Quispe' },
        ],
        icon: '📖', hue: 260,
    },
    {
        area: 'Ciencias y Tecnología',
        competencias: [
            { comp: 'Indagación mediante métodos científicos', grade: 'B', docente: 'Prof. Llanos' },
            { comp: 'Diseña y construye soluciones tecnológicas', grade: 'B', docente: 'Prof. Llanos' },
        ],
        icon: '🔬', hue: 160,
    },
    {
        area: 'Historia y Geografía',
        competencias: [
            { comp: 'Construye interpretaciones históricas', grade: 'A', docente: 'Prof. Suárez' },
            { comp: 'Gestiona responsablemente el espacio y el ambiente', grade: 'A', docente: 'Prof. Suárez' },
        ],
        icon: '🌍', hue: 30,
    },
    {
        area: 'Arte y Cultura',
        competencias: [
            { comp: 'Crea proyectos desde los lenguajes artísticos', grade: 'C', docente: 'Prof. Vargas' },
        ],
        icon: '🎨', hue: 320,
    },
];
const STATUS_MAP = { AD: 'Aprobado', A: 'Aprobado', B: 'En Proceso', C: 'En Inicio' };
const STATUS_STYLE = {
    'Aprobado': { color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0' },
    'En Proceso': { color: '#92400e', bg: '#fffbeb', border: '#fde68a' },
    'En Inicio': { color: '#991b1b', bg: '#fff1f1', border: '#fecaca' },
};
const INITIAL_STUDENTS = [
    { id: '1', num: '01', name: 'María López García', studentId: 'EST-001', initials: 'ML', hue: 210, status: 'P' },
    { id: '2', num: '02', name: 'Carlos Ramírez Soto', studentId: 'EST-002', initials: 'CR', hue: 30, status: 'T' },
    { id: '3', num: '03', name: 'Sofía Martínez Pérez', studentId: 'EST-003', initials: 'SM', hue: 280, status: 'F' },
    { id: '4', num: '04', name: 'Lucas Torres Vega', studentId: 'EST-004', initials: 'LT', hue: 160, status: 'P' },
    { id: '5', num: '05', name: 'Valentina Cruz Mora', studentId: 'EST-005', initials: 'VC', hue: 340, status: 'P' },
    { id: '6', num: '06', name: 'Sebastián Díaz Lara', studentId: 'EST-006', initials: 'SD', hue: 50, status: 'P' },
    { id: '7', num: '07', name: 'Isabella Flores Ruiz', studentId: 'EST-007', initials: 'IF', hue: 190, status: 'T' },
    { id: '8', num: '08', name: 'Mateo Herrera Campos', studentId: 'EST-008', initials: 'MH', hue: 90, status: 'P' },
    { id: '9', num: '09', name: 'Camila Rojas Montes', studentId: 'EST-009', initials: 'CR', hue: 15, status: 'F' },
    { id: '10', num: '10', name: 'Diego Vargas Espinoza', studentId: 'EST-010', initials: 'DV', hue: 240, status: 'P' },
    { id: '11', num: '11', name: 'Luciana Pérez Alva', studentId: 'EST-011', initials: 'LP', hue: 120, status: 'P' },
    { id: '12', num: '12', name: 'Andrés Morales Ríos', studentId: 'EST-012', initials: 'AM', hue: 260, status: 'T' },
    { id: '13', num: '13', name: 'Gabriela Silva Huanca', studentId: 'EST-013', initials: 'GS', hue: 330, status: 'P' },
    { id: '14', num: '14', name: 'Nicolás Castro Medina', studentId: 'EST-014', initials: 'NC', hue: 65, status: 'P' },
    { id: '15', num: '15', name: 'Fernanda Ramos Solis', studentId: 'EST-015', initials: 'FR', hue: 180, status: 'P' },
];
const STATUS_LABELS = { P: 'Presente', T: 'Tardanza', F: 'Falta' };
const STATUS_PILL = {
    P: { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' },
    T: { bg: '#fffbeb', text: '#b45309', border: '#fde68a' },
    F: { bg: '#fff1f1', text: '#991b1b', border: '#fecaca' },
};
const ROLE_LANDING = {
    admin: 'horarios', teacher: 'cursos', student: 'mihorario', parent: 'mihorario',
};
const ROLE_HEADER = {
    admin: 'admin', teacher: 'teacher', student: 'student', parent: 'parent',
};
/* ─── Teacher-specific data ───────────────────────────────── */
const TEACHER_NAV_ITEMS = [
    { id: 'cursos', label: 'Mis Cursos', icon: BookOpenIcon },
    { id: 'horario', label: 'Mi Horario', icon: ClockIcon },
];
const TEACHER_TUTOR_NAV_ITEMS = [
    { id: 'libretas', label: 'Libretas de Notas', icon: NoteIcon },
];
const TEACHER_COURSES = [
    {
        id: 'mat-4b',
        emoji: '📘',
        subject: 'Matemáticas',
        gradeLabel: '4to Grado',
        gradeYear: '4to Año',
        section: 'B',
        level: 'Secundaria',
        shift: 'Mañana',
        shiftColor: '#0058be',
        shiftBg: '#eff6ff',
        students: 32,
        room: 'Aula 204',
        building: 'Pabellón B',
        days: ['Lun', 'Mié', 'Vie'],
        schedule: '08:00 – 09:30 AM',
        accent: '#00236f',
        accentLight: '#eef1fa',
        gradientEnd: '#0058be',
        isNext: true,
        isTutor: true,
    },
    {
        id: 'alg-5a',
        emoji: '📘',
        subject: 'Álgebra',
        gradeLabel: '5to Grado',
        gradeYear: '5to Año',
        section: 'A',
        level: 'Secundaria',
        shift: 'Mañana',
        shiftColor: '#0058be',
        shiftBg: '#eff6ff',
        students: 28,
        room: 'Aula 102',
        building: 'Pabellón A',
        days: ['Mar', 'Jue'],
        schedule: '10:00 – 11:30 AM',
        accent: '#0058be',
        accentLight: '#eff6ff',
        gradientEnd: '#3b82f6',
        isNext: false,
        isTutor: false,
    },
    {
        id: 'geo-3c',
        emoji: '📘',
        subject: 'Geometría',
        gradeLabel: '3er Grado',
        gradeYear: '3er Año',
        section: 'C',
        level: 'Secundaria',
        shift: 'Tarde',
        shiftColor: '#7c3aed',
        shiftBg: '#f5f3ff',
        students: 30,
        room: 'Aula 201',
        building: 'Pabellón B',
        days: ['Lun', 'Mié'],
        schedule: '02:00 – 03:30 PM',
        accent: '#7c3aed',
        accentLight: '#f5f3ff',
        gradientEnd: '#a78bfa',
        isNext: false,
        isTutor: false,
    },
    {
        id: 'alg-5b',
        emoji: '📘',
        subject: 'Álgebra',
        gradeLabel: '5to Grado',
        gradeYear: '5to Año',
        section: 'B',
        level: 'Secundaria',
        shift: 'Mañana',
        shiftColor: '#0058be',
        shiftBg: '#eff6ff',
        students: 29,
        room: 'Aula 103',
        building: 'Pabellón A',
        days: ['Mar', 'Jue'],
        schedule: '11:30 AM – 01:00 PM',
        accent: '#0058be',
        accentLight: '#eff6ff',
        gradientEnd: '#3b82f6',
        isNext: false,
        isTutor: false,
    },
];
/* ROLES uses JSX — icons are already defined above */
const ROLES = [
    { id: 'admin', label: 'Administrador', icon: <ShieldIcon size={15}/>, credential: 'admin@sanmarcos.edu.pe' },
    { id: 'teacher', label: 'Docente', icon: <BoardIcon size={15}/>, credential: 'garcia@sanmarcos.edu.pe' },
    { id: 'student', label: 'Estudiante', icon: <StudentIcon size={15}/>, credential: 'EST-004@sanmarcos.edu.pe' },
    { id: 'parent', label: 'Apoderado', icon: <FamilyIcon size={15}/>, credential: 'mendoza@familia.pe' },
];
/* ═══════════════════════════════════════════════════════════
   TEACHER SIDEBAR
══════════════════════════════════════════════════════════════ */
function TeacherSidebar({ activeNav, onNav, onLogout }) {
    return (<aside style={{ width: 260, minWidth: 260, background: '#00236f', display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', flexShrink: 0 }}>
      {/* Crest + school name */}
      <div style={{ padding: '26px 22px 22px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 46, height: 46, borderRadius: 13, background: 'rgba(255,255,255,0.12)', border: '1.5px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="26" height="26" viewBox="0 0 48 48" fill="none">
              <path d="M24 4L4 14v8l20 10 20-10v-8L24 4z" fill="white" opacity="0.9"/>
              <path d="M4 26l20 10 20-10" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.65"/>
              <path d="M4 32l20 10 20-10" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.45"/>
              <rect x="21" y="26" width="6" height="12" rx="1" fill="white" opacity="0.8"/>
            </svg>
          </div>
          <div>
            <div style={{ color: '#ffffff', fontWeight: 700, fontSize: 14, letterSpacing: '-0.01em', lineHeight: '1.2' }}>Colegio San Marcos</div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 2 }}>Gestión Escolar 2026</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '18px 14px 16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Section 1: Área Docente */}
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.11em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.28)', padding: '0 10px 6px', marginBottom: 2 }}>Área Docente</div>
        {TEACHER_NAV_ITEMS.map(item => {
            const active = activeNav === item.id || (item.id === 'cursos' && (activeNav === 'cursodetalle' || activeNav === 'cursofinalizado'));
            const Icon = item.icon;
            return (<button key={item.id} onClick={() => onNav(item.id)} style={{
                    display: 'flex', alignItems: 'center', gap: 11,
                    padding: '10px 12px', borderRadius: 9, border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer',
                    background: active ? '#0058be' : 'transparent',
                    color: active ? '#ffffff' : 'rgba(255,255,255,0.55)',
                    fontFamily: "'Inter', system-ui, sans-serif", fontSize: 13, fontWeight: active ? 600 : 400,
                    transition: 'background 0.12s, color 0.12s',
                    boxShadow: active ? '0 3px 14px rgba(0,88,190,0.4)' : 'none',
                }} onMouseEnter={e => { if (!active)
                e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }} onMouseLeave={e => { if (!active)
                e.currentTarget.style.background = 'transparent'; }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, flexShrink: 0, background: active ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.12s' }}>
                <Icon size={16} color={active ? '#fff' : 'rgba(255,255,255,0.55)'}/>
              </div>
              {item.label}
            </button>);
        })}

        {/* Section 2: Área Tutor */}
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.11em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.28)', padding: '14px 10px 6px', marginTop: 6 }}>Área Tutor</div>
        {TEACHER_TUTOR_NAV_ITEMS.map(item => {
            const active = activeNav === item.id;
            const Icon = item.icon;
            return (<button key={item.id} onClick={() => onNav(item.id)} style={{
                    display: 'flex', alignItems: 'center', gap: 11,
                    padding: '10px 12px', borderRadius: 9, border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer',
                    background: active ? '#0058be' : 'transparent',
                    color: active ? '#ffffff' : 'rgba(255,255,255,0.55)',
                    fontFamily: "'Inter', system-ui, sans-serif", fontSize: 13, fontWeight: active ? 600 : 400,
                    transition: 'background 0.12s, color 0.12s',
                    boxShadow: active ? '0 3px 14px rgba(0,88,190,0.4)' : 'none',
                }} onMouseEnter={e => { if (!active)
                e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }} onMouseLeave={e => { if (!active)
                e.currentTarget.style.background = 'transparent'; }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, flexShrink: 0, background: active ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.12s' }}>
                <Icon size={16} color={active ? '#fff' : 'rgba(255,255,255,0.55)'}/>
              </div>
              {item.label}
            </button>);
        })}
      </nav>

      {/* Teacher profile footer */}
      <div style={{ padding: '14px 18px 20px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg, #065f46, #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: 'white', border: '2px solid rgba(255,255,255,0.18)' }}>
            G
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: 'rgba(255,255,255,0.92)', fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Prof. Carlos García</div>
            <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 11, marginTop: 1 }}>Tutor de 4to B</div>
          </div>
          <button onClick={onLogout} title="Cerrar sesión" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 7, color: 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', flexShrink: 0, transition: 'color 0.12s' }} onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.85)'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </button>
        </div>
      </div>
    </aside>);
}
/* ═══════════════════════════════════════════════════════════
   TEACHER HEADER
══════════════════════════════════════════════════════════════ */
function TeacherHeader({ activeNav }) {
    const titles = { cursos: 'Mis Cursos', horario: 'Mi Horario', libretas: 'Libretas de Notas', asistencia: 'Asistencia', cursodetalle: 'Gestión de Salón', cursofinalizado: 'Gestión de Salón' };
    return (<header style={{
            height: 64, background: '#ffffff',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 24px', flexShrink: 0,
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>

      {/* ── Left: title + academic period chip ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 18, fontWeight: 600, color: '#121c2a', letterSpacing: '-0.015em', lineHeight: 1 }}>
          {titles[activeNav] ?? 'Mis Cursos'}
        </span>
        <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: '#eff4ff', border: '1px solid #dbeafe',
            borderRadius: 999, padding: '4px 10px',
        }}>
          <span style={{ fontSize: 12 }}>📅</span>
          <span style={{ fontSize: 12, fontWeight: 500, color: '#00236f', whiteSpace: 'nowrap', letterSpacing: '0.005em' }}>
            Año Escolar 2026 · Bimestre I
          </span>
        </div>
      </div>

      {/* ── Right: bell + divider + profile card ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>

        {/* Notification bell */}
        <button style={{
            position: 'relative', width: 36, height: 36, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#f8f9ff', border: '1px solid #e5e7eb',
            borderRadius: '50%', cursor: 'pointer', color: '#64748b',
            transition: 'background 0.15s, border-color 0.15s',
        }} onMouseEnter={e => { e.currentTarget.style.background = '#eef2ff'; e.currentTarget.style.borderColor = '#c7d2fe'; }} onMouseLeave={e => { e.currentTarget.style.background = '#f8f9ff'; e.currentTarget.style.borderColor = '#e5e7eb'; }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <span style={{
            position: 'absolute', top: 7, right: 7,
            width: 7, height: 7, borderRadius: '50%',
            background: '#ba1a1a', border: '1.5px solid #ffffff',
        }}/>
        </button>

        {/* Vertical divider */}
        <div style={{ width: 1, height: 24, background: '#e5e7eb', flexShrink: 0 }}/>

        {/* Teacher profile card */}
        <div style={{
            display: 'flex', alignItems: 'center', gap: 9,
            padding: '4px 10px 4px 5px',
            background: '#ffffff', border: '1px solid #e5e7eb',
            borderRadius: 8, cursor: 'pointer',
            transition: 'background 0.15s, border-color 0.15s',
        }} onMouseEnter={e => { e.currentTarget.style.background = '#f8f9ff'; e.currentTarget.style.borderColor = '#c7d2e6'; }} onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.borderColor = '#e5e7eb'; }}>
          {/* Avatar */}
          <div style={{
            width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, #065f46 0%, #10b981 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, color: '#ffffff',
            boxShadow: '0 0 0 2px #d1fae5',
        }}>G</div>

          {/* Text block */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#121c2a', lineHeight: 1.3, whiteSpace: 'nowrap' }}>
              Prof. Carlos García
            </span>
            <span style={{ fontSize: 11, color: '#64748b', lineHeight: 1.3, whiteSpace: 'nowrap' }}>
              Docente de Matemáticas
            </span>
          </div>

          {/* Chevron */}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginLeft: 2 }}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </div>
    </header>);
}
/* ═══════════════════════════════════════════════════════════
   TEACHER COURSES HUB
══════════════════════════════════════════════════════════════ */
function TeacherCoursesHub({ onNavigate }) {
    const [hoveredCard, setHoveredCard] = useState(null);
    const [gradeFilter, setGradeFilter] = useState('Todos');
    const [shiftFilter, setShiftFilter] = useState('Todos los Turnos');
    const GRADE_TABS = [
        { label: 'Todos los Grados', value: 'Todos', count: TEACHER_COURSES.length },
        { label: '3er Año', value: '3er Año', count: TEACHER_COURSES.filter(c => c.gradeYear === '3er Año').length },
        { label: '4to Año', value: '4to Año', count: TEACHER_COURSES.filter(c => c.gradeYear === '4to Año').length },
        { label: '5to Año', value: '5to Año', count: TEACHER_COURSES.filter(c => c.gradeYear === '5to Año').length },
    ];
    const filteredCourses = TEACHER_COURSES.filter(c => {
        const gradeOk = gradeFilter === 'Todos' || c.gradeYear === gradeFilter;
        const shiftOk = shiftFilter === 'Todos los Turnos' || c.shift === shiftFilter;
        return gradeOk && shiftOk;
    });
    return (<div>
      {/* ── Metric cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 34 }}>

        {/* Card 1 — Cursos Asignados */}
        <div style={{ background: '#ffffff', borderRadius: 12, border: '1px solid #e8eaf0', padding: '22px 22px 20px', boxShadow: '0 1px 4px rgba(0,35,111,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ width: 42, height: 42, borderRadius: 11, background: '#eef1fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpenIcon size={20} color="#00236f"/>
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#16a34a', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 999, padding: '3px 9px', letterSpacing: '0.04em' }}>4 ACTIVOS</span>
          </div>
          <div style={{ fontSize: 38, fontWeight: 800, color: '#00236f', letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 4 }}>4</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 12 }}>Cursos Asignados</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {[
            { label: 'Matemáticas — 4to B', dot: '#00236f' },
            { label: 'Álgebra — 5to A', dot: '#0058be' },
            { label: 'Geometría — 3er C', dot: '#7c3aed' },
            { label: 'Álgebra — 5to B', dot: '#3b82f6' },
        ].map(c => (<div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: c.dot, flexShrink: 0 }}/>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>{c.label}</span>
              </div>))}
          </div>
        </div>

        {/* Card 2 — Total Estudiantes */}
        <div style={{ background: '#ffffff', borderRadius: 12, border: '1px solid #e8eaf0', padding: '22px 22px 20px', boxShadow: '0 1px 4px rgba(0,35,111,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ width: 42, height: 42, borderRadius: 11, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UsersIcon size={20} color="#0058be"/>
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#0058be', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 999, padding: '3px 9px', letterSpacing: '0.04em' }}>AÑO 2026</span>
          </div>
          <div style={{ fontSize: 38, fontWeight: 800, color: '#0058be', letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 4 }}>119</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 12 }}>Total Estudiantes</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
            {[
            { count: '32', label: 'Mat. 4B', color: '#00236f', bg: '#eef1fa' },
            { count: '28', label: 'Álg. 5A', color: '#0058be', bg: '#eff6ff' },
            { count: '30', label: 'Geo. 3C', color: '#7c3aed', bg: '#f5f3ff' },
            { count: '29', label: 'Álg. 5B', color: '#3b82f6', bg: '#eff6ff' },
        ].map((s, i) => (<div key={s.label} style={{ flex: 1, textAlign: 'center', borderRight: i < 3 ? '1px solid #f1f4f9' : 'none', paddingRight: i < 3 ? 6 : 0, paddingLeft: i > 0 ? 6 : 0 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: s.color }}>{s.count}</div>
                <div style={{ fontSize: 9, color: '#94a3b8', fontWeight: 500, marginTop: 1 }}>{s.label}</div>
              </div>))}
          </div>
        </div>

        {/* Card 3 — Próxima Clase */}
        <div style={{ background: '#ffffff', borderRadius: 12, border: '1px solid #d1fae5', padding: '22px 22px 20px', boxShadow: '0 1px 4px rgba(0,35,111,0.04)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: 100, height: 100, background: 'radial-gradient(circle at top right, rgba(16,185,129,0.09) 0%, transparent 70%)' }}/>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ width: 42, height: 42, borderRadius: 11, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ClockIcon size={20} color="#16a34a"/>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, fontWeight: 700, color: '#15803d', background: '#dcfce7', border: '1px solid #86efac', borderRadius: 999, padding: '3px 9px', letterSpacing: '0.04em' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a', flexShrink: 0 }}/>
              EN 15 MIN
            </div>
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#15803d', letterSpacing: '-0.03em', lineHeight: 1, marginBottom: 2 }}>08:00 AM</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 12 }}>Próxima Clase</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <DoorIcon size={12} color="#64748b"/>
              <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>Aula 204 — Pabellón B</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <BookOpenIcon size={12} color="#64748b"/>
              <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>Matemáticas · 4to Grado B</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Filter toolbar ── */}
      <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', boxShadow: '0 1px 3px rgba(0,35,111,0.04)' }}>

        {/* Left: label + grade pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#121c2a', whiteSpace: 'nowrap' }}>Filtrar por Grado:</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#f1f5f9', borderRadius: 8, padding: '3px' }}>
            {GRADE_TABS.map(tab => {
            const active = gradeFilter === tab.value;
            return (<button key={tab.value} onClick={() => setGradeFilter(tab.value)} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '5px 12px', borderRadius: 6, border: 'none',
                    background: active ? '#00236f' : 'transparent',
                    color: active ? '#ffffff' : '#475569',
                    fontSize: 12, fontWeight: active ? 700 : 500,
                    cursor: 'pointer', fontFamily: 'inherit',
                    transition: 'all 0.14s',
                    boxShadow: active ? '0 1px 4px rgba(0,35,111,0.25)' : 'none',
                }} onMouseEnter={e => { if (!active)
                e.currentTarget.style.background = '#e2e8f0'; }} onMouseLeave={e => { if (!active)
                e.currentTarget.style.background = 'transparent'; }}>
                  {tab.label}
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    minWidth: 18, height: 18, borderRadius: 999, padding: '0 5px',
                    fontSize: 10, fontWeight: 800,
                    background: active ? 'rgba(255,255,255,0.22)' : '#dde4ed',
                    color: active ? '#ffffff' : '#64748b',
                    transition: 'all 0.14s',
                }}>{tab.count}</span>
                </button>);
        })}
          </div>
        </div>

        {/* Right: shift dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ position: 'relative' }}>
            <select value={shiftFilter} onChange={e => setShiftFilter(e.target.value)} style={{ appearance: 'none', WebkitAppearance: 'none', padding: '6px 32px 6px 12px', borderRadius: 6, border: '1px solid #e2e8f0', background: '#ffffff', fontSize: 13, fontWeight: 500, color: '#374151', cursor: 'pointer', fontFamily: 'inherit', outline: 'none', transition: 'border-color 0.14s' }} onFocus={e => e.currentTarget.style.borderColor = '#0058be'} onBlur={e => e.currentTarget.style.borderColor = '#e2e8f0'}>
              <option value="Todos los Turnos">Turno: Todos los Turnos</option>
              <option value="Mañana">Turno: Mañana</option>
              <option value="Tarde">Turno: Tarde</option>
            </select>
            <svg style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
        </div>
      </div>

      {/* ── Section divider ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.09em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Tus secciones</span>
        <div style={{ flex: 1, height: 1, background: '#f1f4f9' }}/>
        <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500, whiteSpace: 'nowrap' }}>{filteredCourses.length} {filteredCourses.length === 1 ? 'curso' : 'cursos'} activos</span>
      </div>

      {/* ── Course cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
        {filteredCourses.length === 0 ? (<div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px 0', color: '#94a3b8', fontSize: 13, fontWeight: 500 }}>
            No hay secciones para los filtros seleccionados.
          </div>) : null}
        {filteredCourses.map(course => {
            const isHov = hoveredCard === course.id;
            return (<div key={course.id} onMouseEnter={() => setHoveredCard(course.id)} onMouseLeave={() => setHoveredCard(null)} style={{
                    background: '#ffffff', borderRadius: 14,
                    border: `1.5px solid ${isHov ? course.accent + '50' : '#e8eaf0'}`,
                    boxShadow: isHov ? `0 10px 32px rgba(0,0,0,0.09), 0 2px 8px ${course.accent}18` : '0 1px 4px rgba(0,35,111,0.05)',
                    display: 'flex', flexDirection: 'column', overflow: 'hidden',
                    transition: 'all 0.18s ease',
                    transform: isHov ? 'translateY(-3px)' : 'none',
                }}>
              {/* Accent top bar */}
              <div style={{ height: 5, background: `linear-gradient(90deg, ${course.accent} 0%, ${course.gradientEnd} 100%)`, flexShrink: 0 }}/>

              <div style={{ padding: '18px 20px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>

                {/* ── Badge row ── */}
                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 5, marginBottom: 16 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#475569', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 5, padding: '3px 8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {course.level}
                  </span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: course.shiftColor, background: course.shiftBg, border: `1px solid ${course.shiftColor}30`, borderRadius: 5, padding: '3px 8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {course.shift}
                  </span>
                  {course.isNext && (<span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 700, color: '#15803d', background: '#dcfce7', border: '1px solid #86efac', borderRadius: 5, padding: '3px 8px', letterSpacing: '0.05em' }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#16a34a', display: 'inline-block' }}/>
                      CLASE EN CURSO
                    </span>)}
                  {course.isTutor && (<span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 700, color: '#92400e', background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 5, padding: '3px 8px', letterSpacing: '0.05em' }}>
                      ⭐ Tutor de Aula
                    </span>)}
                </div>

                {/* ── Primary heading: Section / Classroom ── */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.025em', lineHeight: 1.15 }}>
                    {course.gradeLabel} <span style={{ color: course.accent }}>"{course.section}"</span>
                  </div>
                  {/* Subject subheading pill */}
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 8, padding: '5px 11px', borderRadius: 7, background: course.accentLight, border: `1px solid ${course.accent}20` }}>
                    <span style={{ fontSize: 13 }}>{course.emoji}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: course.accent }}>Asignatura: {course.subject}</span>
                  </div>
                </div>

                {/* ── Meta rows ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <span style={{ fontSize: 14, flexShrink: 0 }}>👥</span>
                    <span style={{ fontSize: 12, color: '#374151', fontWeight: 500 }}>
                      <strong style={{ color: '#1e293b', fontWeight: 700 }}>{course.students}</strong> Estudiantes matriculados
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <span style={{ fontSize: 14, flexShrink: 0 }}>🚪</span>
                    <span style={{ fontSize: 12, color: '#374151', fontWeight: 500 }}>{course.room} — {course.building}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
                    <span style={{ fontSize: 14, flexShrink: 0, marginTop: 2 }}>⏰</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                        {course.days.map(d => (<span key={d} style={{ fontSize: 10, fontWeight: 700, color: course.accent, background: course.accentLight, border: `1px solid ${course.accent}25`, borderRadius: 4, padding: '2px 6px', letterSpacing: '0.04em' }}>{d}</span>))}
                      </div>
                      <span style={{ fontSize: 13, color: '#64748b', fontWeight: 400 }}>{course.schedule}</span>
                    </div>
                  </div>
                </div>

                {/* Tutor note */}
                {course.isTutor && (<div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '9px 12px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, marginBottom: 14 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    <span style={{ fontSize: 11, fontStyle: 'italic', color: '#92400e', lineHeight: 1.5 }}>
                      Sección a tu cargo para consolidación de competencias y libreta de notas.
                    </span>
                  </div>)}

                {/* Spacer */}
                <div style={{ flex: 1 }}/>

                {/* ── Card footer ── */}
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 14 }}>
                  <button onClick={() => onNavigate(course.id === 'alg-5a' ? 'cursofinalizado' : 'cursodetalle')} style={{
                    width: '100%', height: 42, borderRadius: 8, border: 'none',
                    background: isHov ? '#001654' : '#00236f', color: '#ffffff',
                    fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    boxShadow: isHov ? '0 6px 18px rgba(0,35,111,0.35)' : '0 2px 6px rgba(0,35,111,0.18)',
                    transition: 'background 0.15s, box-shadow 0.15s', letterSpacing: '0.01em',
                }}>
                    Gestionar Salón
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                  </button>
                </div>
              </div>
            </div>);
        })}
      </div>
    </div>);
}
/* ═══════════════════════════════════════════════════════════
   TEACHER COURSE DETAIL — FINISHED / LOCKED SESSION (Álgebra 5to A)
══════════════════════════════════════════════════════════════ */
function TeacherFinishedSessionView({ onBack }) {
    const ROSTER = [
        { num: '01', name: 'María López', code: 'EST-001', initials: 'ML', hue: 210, status: 'P', obs: '—' },
        { num: '02', name: 'Carlos Ramírez', code: 'EST-002', initials: 'CR', hue: 30, status: 'T', obs: 'Llegó 10 min tarde' },
        { num: '03', name: 'Sofía Martínez', code: 'EST-003', initials: 'SM', hue: 280, status: 'F', obs: 'Falta injustificada' },
        { num: '04', name: 'Lucas Torres', code: 'EST-004', initials: 'LT', hue: 160, status: 'P', obs: '—' },
    ];
    const BADGE = {
        P: { label: 'Presente', bg: '#dcfce7', color: '#15803d', border: '#bbf7d0', dot: '#16a34a' },
        T: { label: 'Tardanza', bg: '#fef3c7', color: '#b45309', border: '#fde68a', dot: '#d97706' },
        F: { label: 'Falta', bg: '#fee2e2', color: '#991b1b', border: '#fecaca', dot: '#ba1a1a' },
    };
    const COLS = '56px 1fr 220px 1fr';
    return (<div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── Back link ── */}
      <div style={{ marginBottom: 20 }}>
        <button onClick={onBack} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 500, color: '#0058be', padding: '6px 10px 6px 2px', borderRadius: 7, transition: 'background 0.12s' }} onMouseEnter={e => e.currentTarget.style.background = '#eff6ff'} onMouseLeave={e => e.currentTarget.style.background = 'none'}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          ← Volver a Mis Cursos
        </button>
      </div>

      {/* ── Course banner ── */}
      <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,35,111,0.05)', marginBottom: 16 }}>
        <div style={{ padding: '20px 24px 16px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 46, height: 46, borderRadius: 11, background: '#eef1fa', border: '1px solid #dde2f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>📘</div>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: '#121c2a', letterSpacing: '-0.02em', margin: 0, lineHeight: 1.2 }}>
                Álgebra — <span style={{ color: '#0058be' }}>5to Grado "A"</span>
              </h1>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              {['🚪 Aula 102 • Pabellón A', '👥 28 Alumnos'].map((b, i) => (<React.Fragment key={b}>
                  {i > 0 && <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#cbd5e1', flexShrink: 0 }}/>}
                  <span style={{ fontSize: 12, fontWeight: 500, color: '#475569' }}>{b}</span>
                </React.Fragment>))}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: 8, padding: '8px 14px', flexShrink: 0 }}>
            <span style={{ fontSize: 13 }}>🔒</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Sesión Finalizada</span>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #f1f4f9', padding: '13px 24px 12px' }}>
          <span style={{ display: 'inline-block', fontSize: 13, fontWeight: 700, color: '#00236f', borderBottom: '2.5px solid #00236f', padding: '0 0 12px', marginBottom: -13 }}>Registro de Asistencia</span>
        </div>
      </div>


      {/* ── Institutional policy banner ── */}
      <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 8, padding: '12px 18px', marginBottom: 14, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <span style={{ fontSize: 16, lineHeight: '20px' }}>🔒</span>
        <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.55 }}>
          <strong style={{ color: '#1e293b' }}>Sesión de clase finalizada:</strong> Este bloque concluyó a las 11:30 AM. La asistencia se encuentra en modo solo lectura por normativa institucional.
        </div>
      </div>

      {/* ── Teacher attendance (historical) ── */}
      <div style={{ background: '#f8f9ff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: '#eef1fa', border: '1px solid #dde2f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <CalendarCheckIcon size={15} color="#00236f"/>
          </div>
          <span style={{ fontSize: 13, color: '#334155' }}>
            <strong style={{ color: '#1e293b', fontWeight: 600 }}>Marcación Docente:</strong> Sesión 10:00 – 11:30 AM • Registrada puntualmente a las 10:02 AM.
          </span>
        </div>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: '#15803d', background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: 999, padding: '5px 12px', cursor: 'default', userSelect: 'none' }}>
          ✓ Asistencia Docente Confirmada
        </span>
      </div>

      {/* ── Toolbar ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 14px' }}>
          <CalendarCheckIcon size={14} color="#64748b"/>
          <span style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>Fecha: 19 de Septiembre, 2026</span>
        </div>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: 8, padding: '8px 12px', fontSize: 12, fontWeight: 600, color: '#475569' }}>🔒 Sesión cerrada</span>
      </div>

      {/* ── Locked table ── */}
      <div style={{ background: '#ffffff', borderRadius: 10, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,35,111,0.04)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: COLS, padding: '0 24px', background: '#f8f9ff', borderBottom: '2px solid #e8eaf0' }}>
          {['#', 'ESTUDIANTE', 'ESTADO DE ASISTENCIA', 'OBSERVACIONES'].map(c => (<div key={c} style={{ padding: '11px 0', fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: '0.07em' }}>{c}</div>))}
        </div>
        {ROSTER.map((s, i) => {
            const b = BADGE[s.status];
            return (<div key={s.code} style={{ display: 'grid', gridTemplateColumns: COLS, padding: '0 24px', alignItems: 'center', minHeight: 64, borderBottom: i < ROSTER.length - 1 ? '1px solid #f1f4f9' : 'none', cursor: 'default' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>{s.num}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0, background: `hsl(${s.hue},60%,88%)`, border: `2px solid hsl(${s.hue},50%,76%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: `hsl(${s.hue},55%,30%)` }}>{s.initials}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{s.name}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1, fontWeight: 500 }}>{s.code}</div>
                </div>
              </div>
              <div>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 14px', borderRadius: 999, background: b.bg, border: `1px solid ${b.border}`, color: b.color, fontSize: 12, fontWeight: 700, userSelect: 'none' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: b.dot }}/>{b.label}
                </span>
              </div>
              <div style={{ fontSize: 13, color: s.obs === '—' ? '#cbd5e1' : '#64748b' }}>{s.obs}</div>
            </div>);
        })}
        <div style={{ padding: '11px 24px', background: '#fafbff', borderTop: '1px dashed #e8eaf0', fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>
          🔒 24 alumnos adicionales · Registro oficial de solo lectura
        </div>
      </div>

      {/* ── Sticky closed bar ── */}
      <div style={{
            position: 'sticky', bottom: -56, marginTop: 'auto', marginLeft: -36, marginRight: -36,
            padding: '14px 36px', background: '#ffffff', borderTop: '1px solid #e5e7eb',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap',
            boxShadow: '0 -4px 20px rgba(0,0,0,0.06)', zIndex: 10,
        }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', fontSize: 13, fontWeight: 600 }}>
          <span style={{ color: '#15803d' }}>🟢 Presentes: 25</span>
          <span style={{ color: '#b45309' }}>🟠 Tardanzas: 2</span>
          <span style={{ color: '#991b1b' }}>🔴 Faltas: 1</span>
          <span style={{ width: 1, height: 16, background: '#e2e8f0' }}/>
          <span style={{ color: '#475569' }}>Total: 28 alumnos</span>
        </div>
        <div aria-disabled="true" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569', fontWeight: 700, fontSize: 13, padding: '10px 20px', borderRadius: 8, cursor: 'not-allowed', userSelect: 'none' }}>
          🔒 Registro Oficial Cerrado
        </div>
      </div>

    </div>);
}
/* ═══════════════════════════════════════════════════════════
   TEACHER COURSE DETAIL VIEW  (Asistencia Diaria tab)
══════════════════════════════════════════════════════════════ */
function TeacherCourseDetailView({ onBack }) {
    const ROSTER = [
        { id: '1', num: '01', name: 'María López García', code: 'EST-001', initials: 'ML', hue: 210, defaultObs: 'Puntual', defaultStatus: 'P' },
        { id: '2', num: '02', name: 'Carlos Ramírez Soto', code: 'EST-002', initials: 'CR', hue: 30, defaultObs: 'Llegó 10 min tarde', defaultStatus: 'T' },
        { id: '3', num: '03', name: 'Sofía Martínez Pérez', code: 'EST-003', initials: 'SM', hue: 280, defaultObs: 'Falta injustificada', defaultStatus: 'F' },
        { id: '4', num: '04', name: 'Lucas Torres Vega', code: 'EST-004', initials: 'LT', hue: 160, defaultObs: '—', defaultStatus: 'P' },
        { id: '5', num: '05', name: 'Sebastián Díaz Lara', code: 'EST-006', initials: 'SD', hue: 50, defaultObs: '—', defaultStatus: 'P' },
        { id: '6', num: '06', name: 'Isabella Flores Ruiz', code: 'EST-007', initials: 'IF', hue: 190, defaultObs: '—', defaultStatus: 'P' },
        { id: '7', num: '07', name: 'Mateo Herrera Campos', code: 'EST-008', initials: 'MH', hue: 90, defaultObs: '—', defaultStatus: 'P' },
        { id: '8', num: '08', name: 'Camila Rojas Montes', code: 'EST-009', initials: 'CR', hue: 15, defaultObs: '—', defaultStatus: 'P' },
    ];
    const SEG_CFG = {
        P: { activeColor: '#15803d', activeBg: '#f0fdf4', activeBorder: '#86efac' },
        T: { activeColor: '#b45309', activeBg: '#fffbeb', activeBorder: '#fcd34d' },
        F: { activeColor: '#991b1b', activeBg: '#fff1f1', activeBorder: '#fca5a5' },
    };
    const [activeTab, setActiveTab] = useState('asistencia');
    const [attendance, setAttendance] = useState(Object.fromEntries(ROSTER.map(s => [s.id, s.defaultStatus])));
    const [teacherChecked, setTeacherChecked] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [reportModalOpen, setReportModalOpen] = useState(false);
    const [reportStudent, setReportStudent] = useState(ROSTER[1]);
    const [reportObs, setReportObs] = useState('');
    const [reportSent, setReportSent] = useState(false);
    const [selectedSession, setSelectedSession] = useState('hoy');
    const isEnCurso = selectedSession === 'hoy';
    const GRADE_CFG = {
        AD: { label: 'Logro Destacado', color: '#15803d', bg: '#f0fdf4', border: '#86efac' },
        A: { label: 'Logro Esperado', color: '#16a34a', bg: '#dcfce7', border: '#bbf7d0' },
        B: { label: 'En Proceso', color: '#b45309', bg: '#fffbeb', border: '#fcd34d' },
        C: { label: 'En Inicio', color: '#991b1b', bg: '#fff1f1', border: '#fecaca' },
    };
    const EVAL_STUDENTS = [
        { id: 'e1', num: '01', name: 'María López', code: 'EST-001', initials: 'ML', hue: 210, e1: 'A', e2: 'AD', e3: 'AD', e4: 'AD', c1: 'AD', c2: 'AD', c3: 'AD', c4: 'AD', comp: 'AD' },
        { id: 'e2', num: '02', name: 'Carlos Ramírez', code: 'EST-002', initials: 'CR', hue: 30, e1: 'A', e2: 'B', e3: 'B', e4: 'A', c1: 'B', c2: 'B', c3: 'A', c4: 'B', comp: 'B' },
        { id: 'e3', num: '03', name: 'Sofía Martínez', code: 'EST-003', initials: 'SM', hue: 280, e1: 'B', e2: 'C', e3: 'C', e4: 'B', c1: 'C', c2: 'C', c3: 'B', c4: 'C', comp: 'C' },
        { id: 'e4', num: '04', name: 'Lucas Torres', code: 'EST-004', initials: 'LT', hue: 160, e1: 'A', e2: 'A', e3: 'A', e4: 'A', c1: 'A', c2: 'A', c3: 'A', c4: 'A', comp: 'A' },
    ];
    const [grades, setGrades] = useState(Object.fromEntries(EVAL_STUDENTS.map(s => [s.id, { e1: s.e1, e2: s.e2, e3: s.e3, e4: s.e4, c1: s.c1, c2: s.c2, c3: s.c3, c4: s.c4, comp: s.comp }])));
    const [competency, setCompetency] = useState('Todas las competencias (Vista General)');
    const competencyShort = (c) => c === 'Todas las competencias (Vista General)' ? 'Todas las competencias' : c.startsWith('C') ? c.split(' - ')[0] : c;
    const [evalSaved, setEvalSaved] = useState(false);
    const [evalSaving, setEvalSaving] = useState(false);
    // New evaluation modal
    const [newEvalOpen, setNewEvalOpen] = useState(false);
    const [newEvalForm, setNewEvalForm] = useState({
        nombre: '',
        competencia: 'C1 - Resuelve problemas de cantidad',
        tipo: 'Rúbrica de Evaluación',
        fecha: '28/09/2026',
        descripcion: '',
    });
    const [newEvalErrors, setNewEvalErrors] = useState({});
    const handleNewEvalSave = () => {
        const errs = {};
        if (!newEvalForm.nombre.trim())
            errs.nombre = 'El nombre de la evaluación es obligatorio.';
        if (!newEvalForm.competencia.trim())
            errs.competencia = 'Seleccione una competencia.';
        if (Object.keys(errs).length) {
            setNewEvalErrors(errs);
            return;
        }
        setNewEvalOpen(false);
        setNewEvalErrors({});
    };
    const COMPETENCIES = [
        'Todas las competencias (Vista General)',
        'C1 - Resuelve problemas de cantidad',
        'C2 - Resuelve problemas de regularidad, equivalencia y cambio',
        'C3 - Resuelve problemas de forma, movimiento y localización',
        'C4 - Resuelve problemas de gestión de datos e incertidumbre',
    ];
    const GRADE_KEYS = ['AD', 'A', 'B', 'C'];
    const GradePill = ({ g, onChange }) => {
        const [open, setOpen] = useState(false);
        const cfg = GRADE_CFG[g];
        return (<div style={{ position: 'relative', display: 'inline-block' }}>
        <button onClick={() => { setOpen(o => !o); setEvalSaved(false); }} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 6, border: `1.5px solid ${cfg.border}`, background: cfg.bg, color: cfg.color, fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', transition: 'opacity 0.12s' }} onMouseEnter={e => e.currentTarget.style.opacity = '0.8'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
          {g}
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        {open && (<div style={{ position: 'absolute', top: '100%', left: 0, zIndex: 50, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.1)', marginTop: 4, minWidth: 56, overflow: 'hidden' }}>
            {GRADE_KEYS.map(k => (<button key={k} onClick={() => { onChange(k); setOpen(false); }} style={{ width: '100%', padding: '7px 12px', border: 'none', background: k === g ? GRADE_CFG[k].bg : '#fff', color: GRADE_CFG[k].color, fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center', transition: 'background 0.1s' }} onMouseEnter={e => e.currentTarget.style.background = GRADE_CFG[k].bg} onMouseLeave={e => e.currentTarget.style.background = k === g ? GRADE_CFG[k].bg : '#fff'}>{k}</button>))}
          </div>)}
      </div>);
    };
    const GradeBadge = ({ g }) => {
        const cfg = GRADE_CFG[g];
        return (<span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 10px', borderRadius: 6, border: `1.5px solid ${cfg.border}`, background: cfg.bg, color: cfg.color, fontSize: 12, fontWeight: 800, userSelect: 'none' }}>{g}</span>);
    };
    const handleEvalSave = () => { setEvalSaving(true); setTimeout(() => { setEvalSaving(false); setEvalSaved(true); }, 800); };
    const visibleP = Object.values(attendance).filter(v => v === 'P').length;
    const visibleT = Object.values(attendance).filter(v => v === 'T').length;
    const visibleF = Object.values(attendance).filter(v => v === 'F').length;
    const totalP = visibleP + 24; // remaining 24 default to P
    const totalAlumnos = 32;
    const handleSave = () => { setSaving(true); setTimeout(() => { setSaving(false); setSaved(true); }, 900); };
    return (<div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>

      {/* ── Back link ── */}
      <div style={{ marginBottom: 20 }}>
        <button onClick={onBack} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 500, color: '#0058be', padding: '6px 10px 6px 2px', borderRadius: 7, transition: 'background 0.12s' }} onMouseEnter={e => e.currentTarget.style.background = '#eff6ff'} onMouseLeave={e => e.currentTarget.style.background = 'none'}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          Volver a Mis Cursos
        </button>
      </div>

      {/* ── Course header banner ── */}
      <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,35,111,0.05)', marginBottom: 16 }}>
        <div style={{ padding: '20px 24px 16px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 46, height: 46, borderRadius: 11, background: '#eef1fa', border: '1px solid #dde2f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>📐</div>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: '#121c2a', letterSpacing: '-0.02em', margin: 0, lineHeight: 1.2 }}>
                Matemáticas — <span style={{ color: '#0058be' }}>4to Grado B</span>
              </h1>
            </div>
            <div onClick={() => setReportModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              {[
            { icon: '🎓', label: '4to Año Secundaria' },
            { icon: '🚪', label: 'Aula 204 (Pabellón B)' },
            { icon: '👥', label: '32 Alumnos' },
        ].map((b, i) => (<React.Fragment key={b.label}>
                  {i > 0 && <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#d1d5db', flexShrink: 0 }}/>}
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 500, color: '#475569' }}>
                    <span>{b.icon}</span>{b.label}
                  </span>
                </React.Fragment>))}
              <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#d1d5db', flexShrink: 0 }}/>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: '#92400e', background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 999, padding: '2px 9px' }}>⭐ Tutor de Aula</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '8px 14px', flexShrink: 0 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#16a34a', boxShadow: '0 0 0 2px #dcfce7' }}/>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#15803d' }}>● Sesión en curso</span>
          </div>
        </div>

        {/* ── Navigation tabs ── */}
        <div style={{ display: 'flex', alignItems: 'flex-end', borderTop: '1px solid #f1f4f9', paddingLeft: 8 }}>
          {([
            { id: 'asistencia', label: 'Asistencia Diaria', badge: 'Hoy 19 Sep' },
            { id: 'evaluaciones', label: 'Evaluaciones y Notas', badge: null },
        ]).map(tab => {
            const isActive = activeTab === tab.id;
            return (<button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                    position: 'relative', display: 'flex', alignItems: 'center', gap: 8,
                    padding: '13px 18px 12px', background: 'none', border: 'none', cursor: 'pointer',
                    fontFamily: 'inherit', fontSize: 13, fontWeight: isActive ? 700 : 500,
                    color: isActive ? '#00236f' : '#64748b',
                    borderBottom: isActive ? '2.5px solid #00236f' : '2.5px solid transparent',
                    transition: 'color 0.15s, border-color 0.15s',
                }} onMouseEnter={e => { if (!isActive) {
                e.currentTarget.style.color = '#374151';
                e.currentTarget.style.borderColor = '#dde2f0';
            } }} onMouseLeave={e => { if (!isActive) {
                e.currentTarget.style.color = '#64748b';
                e.currentTarget.style.borderColor = 'transparent';
            } }}>
                {tab.label}
                {tab.badge && (<span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 700, background: '#eef1fa', color: '#00236f', border: '1px solid #c7d2e6', letterSpacing: '0.02em' }}>
                    {tab.badge}
                  </span>)}
              </button>);
        })}
        </div>
      </div>

      {/* ════════════ TAB: ASISTENCIA DIARIA ════════════ */}
      {activeTab === 'asistencia' && <>

      {/* ── Teacher self-check bar ── */}
      <div style={{ background: '#eff4ff', border: '1px solid #dbeafe', borderRadius: 10, padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: '#dbeafe', border: '1px solid #93c5fd', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <CalendarCheckIcon size={15} color="#0058be"/>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#1e40af' }}>Marcación Docente</span>
            <span style={{ fontSize: 13, color: '#3b82f6' }}>Sesión 08:00 – 09:30 AM</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: '#15803d', background: '#dcfce7', border: '1px solid #86efac', borderRadius: 999, padding: '2px 8px' }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#16a34a', flexShrink: 0 }}/>
              En horario
            </span>
          </div>
        </div>
        <button onClick={() => setTeacherChecked(true)} disabled={teacherChecked} style={{
                display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 8,
                border: teacherChecked ? '1px solid #bbf7d0' : 'none',
                background: teacherChecked ? '#dcfce7' : '#16a34a',
                color: teacherChecked ? '#15803d' : '#ffffff',
                fontSize: 13, fontWeight: 700, cursor: teacherChecked ? 'default' : 'pointer', fontFamily: 'inherit',
                boxShadow: teacherChecked ? 'none' : '0 2px 8px rgba(22,163,74,0.3)', transition: 'all 0.2s',
            }} onMouseEnter={e => { if (!teacherChecked)
            e.currentTarget.style.background = '#15803d'; }} onMouseLeave={e => { if (!teacherChecked)
            e.currentTarget.style.background = '#16a34a'; }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
          {teacherChecked ? 'Asistencia Registrada' : 'Registrar mi Asistencia'}
        </button>
      </div>

      {/* ── Controls toolbar ── */}
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 14px' }}>
            <CalendarCheckIcon size={14} color="#64748b"/>
            <span style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>Fecha: 19 de Septiembre, 2026</span>
          </div>

        </div>

        <button onClick={() => setReportModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', borderRadius: 8, border: '1.5px solid #0058be', background: '#ffffff', color: '#0058be', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.12s' }} onMouseEnter={e => e.currentTarget.style.background = '#eff6ff'} onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/></svg>
          + Generar Reporte de Asistencia
        </button>
      </div>

      {/* ── Attendance table ── */}
      <div style={{ background: '#ffffff', borderRadius: 10, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,35,111,0.04)' }}>
        {/* Table header */}
        <div style={{ display: 'grid', gridTemplateColumns: '52px 1fr 230px 1fr', padding: '0 24px', background: '#f8f9ff', borderBottom: '2px solid #e8eaf0' }}>
          {['#', 'ESTUDIANTE', 'ESTADO DE ASISTENCIA', 'OBSERVACIONES'].map(col => (<div key={col} style={{ padding: '11px 0', fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: '0.07em', textTransform: 'uppercase' }}>{col}</div>))}
        </div>

        {/* Rows */}
        {ROSTER.map((student, idx) => {
                const status = attendance[student.id];
                const rowBg = status === 'F' ? '#fff8f8' : status === 'T' ? '#fffcf2' : 'transparent';
                return (<div key={student.id} style={{ display: 'grid', gridTemplateColumns: '52px 1fr 230px 1fr', padding: '0 24px', borderBottom: idx < ROSTER.length - 1 ? '1px solid #f1f4f9' : 'none', background: rowBg, alignItems: 'center', minHeight: 64, transition: 'background 0.1s' }} onMouseEnter={e => { if (status === 'P')
                    e.currentTarget.style.background = '#fafbff'; }} onMouseLeave={e => e.currentTarget.style.background = rowBg}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>{student.num}</div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0, background: `hsl(${student.hue},60%,88%)`, border: `2px solid hsl(${student.hue},50%,76%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: `hsl(${student.hue},55%,30%)` }}>
                  {student.initials}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{student.name}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1, fontWeight: 500 }}>{student.code}</div>
                </div>
              </div>

              <div>
                <div style={{ display: 'inline-flex', background: '#f1f4f9', borderRadius: 8, padding: 3, gap: 2 }}>
                  {['P', 'T', 'F'].map(key => {
                        const active = status === key;
                        const cfg = SEG_CFG[key];
                        const fullLabel = { P: 'Presente', T: 'Tardanza', F: 'Falta' };
                        return (<button key={key} title={fullLabel[key]} onClick={() => {
                                setSaved(false);
                                setAttendance(prev => ({ ...prev, [student.id]: key }));
                            }} style={{
                                padding: '5px 16px', borderRadius: 6,
                                border: `1px solid ${active ? cfg.activeBorder : 'transparent'}`,
                                background: active ? cfg.activeBg : 'transparent',
                                color: active ? cfg.activeColor : '#94a3b8',
                                fontSize: 12, fontWeight: active ? 800 : 500,
                                cursor: 'pointer', fontFamily: 'inherit',
                                transition: 'all 0.12s', minWidth: 38,
                            }} onMouseEnter={e => { if (!active)
                            e.currentTarget.style.background = '#e8ecf2'; }} onMouseLeave={e => { if (!active)
                            e.currentTarget.style.background = 'transparent'; }}>{key}</button>);
                    })}
                </div>
              </div>

              <div style={{ fontSize: 13, color: student.defaultObs === '—' ? '#cbd5e1' : '#64748b', fontStyle: 'normal', paddingRight: 8 }}>
                {student.defaultObs}
              </div>
            </div>);
            })}

        {/* Remaining students hint */}
        <div style={{ padding: '11px 24px', background: '#fafbff', borderTop: '1px dashed #e8eaf0', display: 'flex', alignItems: 'center', gap: 7 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>24 alumnos adicionales · Todos marcados como Presentes por defecto</span>
        </div>
      </div>

      {/* ── Sticky bottom action bar ── */}
      <div style={{
                position: 'sticky', bottom: -56, marginTop: 'auto',
                marginLeft: -36, marginRight: -36, paddingLeft: 36, paddingRight: 36,
                paddingTop: 14, paddingBottom: 14,
                background: '#ffffff', borderTop: '1px solid #e5e7eb',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                gap: 16, boxShadow: '0 -4px 20px rgba(0,0,0,0.06)', zIndex: 10, flexWrap: 'wrap',
            }}>
        {/* Summary counters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginRight: 2 }}>Resumen de sesión:</span>
          {[
                { label: 'Presentes', count: totalP, dot: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', text: '#15803d' },
                { label: 'Tardanzas', count: visibleT, dot: '#d97706', bg: '#fffbeb', border: '#fde68a', text: '#b45309' },
                { label: 'Faltas', count: visibleF, dot: '#ba1a1a', bg: '#fff1f1', border: '#fecaca', text: '#991b1b' },
            ].map(item => (<div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 999, background: item.bg, border: `1px solid ${item.border}` }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: item.dot, flexShrink: 0 }}/>
              <span style={{ fontSize: 14, fontWeight: 800, color: item.text }}>{item.count}</span>
              <span style={{ fontSize: 12, color: item.text, fontWeight: 500 }}>{item.label}</span>
            </div>))}
          <div style={{ width: 1, height: 22, background: '#e2e8f0', margin: '0 4px' }}/>
          <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>Total: <strong style={{ color: '#374151' }}>{totalAlumnos} alumnos</strong></span>
        </div>

        {/* Save button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {saved && (<div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#16a34a' }}>Guardado correctamente</span>
            </div>)}
            <button onClick={handleSave} disabled={saving} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px',
                borderRadius: 8, border: 'none',
                background: saving ? '#3b82f6' : '#00236f',
                color: '#ffffff', fontSize: 13, fontWeight: 700,
                cursor: saving ? 'wait' : 'pointer', fontFamily: 'inherit',
                boxShadow: '0 2px 8px rgba(0,35,111,0.28)', transition: 'background 0.15s',
            }}>
              {saving ? 'Guardando...' : 'Guardar Asistencia de la Sesión'}
            </button>
        </div>
      </div>

      {/* Modal: Generar Reporte de Asistencia (HU-ASI-05 - Con validación dinámica) */}
        {reportModalOpen && (() => {
                // María López (id: '1') y Lucas Torres (id: '4') tienen asistencia perfecta.
                // Carlos Ramírez (id: '2') y Sofía Martínez (id: '3') tienen faltas/tardanzas.
                const hasIncidents = reportStudent.id === '2' || reportStudent.id === '3';
                const incidentDetail = reportStudent.id === '2'
                    ? '1 tardanza registrada en el periodo (Llegó 10 min tarde).'
                    : reportStudent.id === '3'
                        ? '1 falta injustificada registrada en el periodo.'
                        : '';
                return (<div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: 24 }} onClick={e => { if (e.target === e.currentTarget)
                    setReportModalOpen(false); }}>
              <div style={{ background: '#fff', borderRadius: 12, width: '100%', maxWidth: 540, boxShadow: '0 24px 64px rgba(0,0,0,0.22)', padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: '1px solid #f1f4f9', paddingBottom: 12 }}>
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#0058be', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Control Disciplinario · HU-ASI-05</span>
                    <h2 style={{ fontSize: 18, fontWeight: 700, margin: '2px 0 0', color: '#0f172a' }}>Generar Reporte de Asistencia</h2>
                  </div>
                  <button onClick={() => setReportModalOpen(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 16, color: '#64748b' }}>✕</button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Seleccionar Estudiante</label>
                    <select value={reportStudent.id} onChange={e => {
                        const found = ROSTER.find(r => r.id === e.target.value) || ROSTER[0];
                        setReportStudent(found);
                        setReportObs('');
                    }} style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #dde2f0', fontSize: 13, outline: 'none', cursor: 'pointer', color: '#1e293b', fontWeight: 600 }}>
                      {ROSTER.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                    </select>
                  </div>

                  {/* 🟢 CONDICIONAL 1: Si el alumno NO tiene faltas (Asistencia perfecta) */}
                  {!hasIncidents ? (<div style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: 8, padding: '12px 14px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <span style={{ fontSize: 18 }}>✅</span>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#15803d', marginBottom: 2 }}>
                          Asistencia Perfecta (100%)
                        </div>
                        <div style={{ fontSize: 12, color: '#166534', lineHeight: 1.45 }}>
                          El estudiante <strong>{reportStudent.name}</strong> ha asistido a todas las sesiones y no registra inasistencias ni tardanzas. No amerita emisión de reporte.
                        </div>
                      </div>
                    </div>) : (
                    /* 🟠 CONDICIONAL 2: Si el alumno SÍ tiene incidencias */
                    <div style={{ background: '#fffbeb', border: '1.5px solid #fde68a', borderRadius: 8, padding: '12px 14px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <span style={{ fontSize: 18 }}>⚠️</span>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#92400e', marginBottom: 2 }}>
                          Incidencias de Asistencia Detectadas
                        </div>
                        <div style={{ fontSize: 12, color: '#78350f', lineHeight: 1.45 }}>
                          {incidentDetail} Este reporte será notificado directamente al portal del apoderado.
                        </div>
                      </div>
                    </div>)}

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: hasIncidents ? '#374151' : '#94a3b8', display: 'block', marginBottom: 4 }}>
                      Observaciones y Justificación del Docente {hasIncidents && <span style={{ color: '#ba1a1a' }}>*</span>}
                    </label>
                    <textarea rows={3} disabled={!hasIncidents} value={reportObs} onChange={e => setReportObs(e.target.value)} placeholder={hasIncidents ? "Ingrese las recomendaciones o motivos para el apoderado..." : "Deshabilitado: El estudiante no cuenta con faltas registradas."} style={{
                        width: '100%', padding: '9px 12px', borderRadius: 8,
                        border: `1.5px solid ${hasIncidents ? '#dde2f0' : '#e2e8f0'}`,
                        fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
                        background: hasIncidents ? '#ffffff' : '#f8f9ff',
                        color: hasIncidents ? '#121c2a' : '#94a3b8',
                        cursor: hasIncidents ? 'text' : 'not-allowed'
                    }}/>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 22, borderTop: '1px solid #f1f4f9', paddingTop: 14 }}>
                  <div>
                    {!hasIncidents && (<span style={{ fontSize: 11, color: '#dc2626', fontWeight: 600 }}>
                        🚫 No se puede emitir reporte sin faltas
                      </span>)}
                  </div>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => setReportModalOpen(false)} style={{ padding: '9px 18px', borderRadius: 7, border: '1.5px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#475569' }}>
                      Cancelar
                    </button>

                    <button disabled={!hasIncidents || !reportObs.trim()} onClick={() => {
                        setReportSent(true);
                        setTimeout(() => { setReportSent(false); setReportModalOpen(false); setReportObs(''); }, 1000);
                    }} style={{
                        padding: '9px 20px', borderRadius: 7, border: 'none',
                        background: (!hasIncidents || !reportObs.trim()) ? '#94a3b8' : '#00236f',
                        color: '#fff',
                        cursor: (!hasIncidents || !reportObs.trim()) ? 'not-allowed' : 'pointer',
                        fontSize: 13, fontWeight: 700,
                        transition: 'all 0.15s'
                    }}>
                      {reportSent ? '✓ Reporte Emitido' : 'Emitir Reporte'}
                    </button>
                  </div>
                </div>
              </div>
            </div>);
            })()}
      {/* end asistencia tab */}
      </>}

      {/* ════════════ TAB: EVALUACIONES Y NOTAS ════════════ */}
      {activeTab === 'evaluaciones' && <>

        {/* Action toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 12, fontWeight: 600, color: '#64748b', pointerEvents: 'none', zIndex: 1, whiteSpace: 'nowrap' }}>Competencia:</div>
              <select value={competency} onChange={e => setCompetency(e.target.value)} style={{ appearance: 'none', WebkitAppearance: 'none', padding: '8px 34px 8px 106px', borderRadius: 8, border: '1.5px solid #e2e8f0', background: '#ffffff', fontSize: 13, color: '#0058be', fontFamily: 'inherit', outline: 'none', cursor: 'pointer', minWidth: 380, fontWeight: 600, transition: 'border-color 0.15s' }} onFocus={e => e.currentTarget.style.borderColor = '#0058be'} onBlur={e => e.currentTarget.style.borderColor = '#e2e8f0'}>
                <option value="Todas las competencias (Vista General)">Todas las competencias (Vista General)</option>
                <option value="C1 - Resuelve problemas de cantidad">C1 - Resuelve problemas de cantidad (Activa)</option>
                <option value="C2 - Resuelve problemas de regularidad, equivalencia y cambio">C2 - Resuelve problemas de regularidad y cambio</option>
                <option value="C3 - Resuelve problemas de forma, movimiento y localización">C3 - Resuelve problemas de forma y movimiento</option>
                <option value="C4 - Resuelve problemas de gestión de datos e incertidumbre">C4 - Resuelve problemas de gestión de datos</option>
              </select>
              <svg style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 13px', borderRadius: 999, fontSize: 12, fontWeight: 700, background: '#eff4ff', border: '1px solid #c7d2e6', color: '#00236f' }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              Bimestre I
            </span>
          </div>
          <button onClick={() => setNewEvalOpen(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 8, border: 'none', background: '#00236f', color: '#ffffff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 2px 8px rgba(0,35,111,0.22)', transition: 'background 0.12s' }} onMouseEnter={e => e.currentTarget.style.background = '#001d5a'} onMouseLeave={e => e.currentTarget.style.background = '#00236f'}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Generar Nueva Evaluación
          </button>
        </div>

        {/* Active filter tag — only when a specific competency is selected */}
        {competency !== 'Todas las competencias (Vista General)' && (<div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '6px 10px 6px 13px', borderRadius: 999, background: '#eff4ff', border: '1.5px solid #bfdbfe', fontSize: 12, fontWeight: 500, color: '#00236f', lineHeight: 1.4 }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0058be" strokeWidth="3" strokeLinecap="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
              Filtro activo: {competency.startsWith('C') ? `Competencia ${competency[1]} (${competency.split(' - ')[0]})` : competency}
              <span style={{ margin: '0 2px', color: '#93c5fd' }}>•</span>
              Mostrando 2 de 5 evaluaciones
              <button onClick={() => setCompetency('Todas las competencias (Vista General)')} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginLeft: 4, padding: '2px 8px', borderRadius: 999, background: '#dbeafe', border: '1px solid #93c5fd', color: '#1d4ed8', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', lineHeight: 1.5, transition: 'background 0.12s' }} onMouseEnter={e => e.currentTarget.style.background = '#bfdbfe'} onMouseLeave={e => e.currentTarget.style.background = '#dbeafe'}>✕ Quitar filtro</button>
            </span>
          </div>)}

        {/* ── COMPREHENSIVE GRADEBOOK (Todas las competencias) ── */}
        {competency === 'Todas las competencias (Vista General)' ? (() => {
                const GCOLS = '32px 200px 56px 56px 56px 56px 56px 56px 56px 56px 136px';
                return (<div style={{ background: '#ffffff', borderRadius: 10, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,35,111,0.06)' }}>

              {/* Group header row */}
              <div style={{ display: 'grid', gridTemplateColumns: GCOLS, borderBottom: '1px solid #dde4ee', padding: '0 20px' }}>
                <div style={{ gridColumn: '1 / 3', padding: '6px 0', fontSize: 10, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Identificación</div>
                <div style={{ gridColumn: '3 / 7', padding: '6px 10px', fontSize: 10, fontWeight: 700, color: '#475569', letterSpacing: '0.08em', textTransform: 'uppercase', background: '#f0f2fc', borderLeft: '2px solid #d1d9ee' }}>Evaluaciones del Periodo</div>
                <div style={{ gridColumn: '7 / 11', padding: '6px 10px', fontSize: 10, fontWeight: 700, color: '#475569', letterSpacing: '0.08em', textTransform: 'uppercase', background: '#f4f6fd', borderLeft: '2px solid #d1d9ee' }}>Logro por Competencia</div>
                <div style={{ gridColumn: '11', padding: '6px 12px', fontSize: 10, fontWeight: 700, color: '#0058be', letterSpacing: '0.08em', textTransform: 'uppercase', background: '#eff4ff', borderLeft: '2px solid #bfdbfe' }}>Calificación Definitiva</div>
              </div>

              {/* Column header row */}
              <div style={{ display: 'grid', gridTemplateColumns: GCOLS, background: '#f8f9ff', borderBottom: '2px solid #e8eaf0', padding: '0 20px' }}>
                <div style={{ padding: '10px 0', fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: '0.07em', textTransform: 'uppercase' }}>#</div>
                <div style={{ padding: '10px 0', fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: '0.07em', textTransform: 'uppercase' }}>ESTUDIANTE</div>
                <div style={{ padding: '10px 0 10px 4px', fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: '0.07em', textTransform: 'uppercase', borderLeft: '2px solid #d1d9ee' }}>EV. 1</div>
                <div style={{ padding: '10px 0', fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: '0.07em', textTransform: 'uppercase' }}>EV. 2</div>
                <div style={{ padding: '10px 0', fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: '0.07em', textTransform: 'uppercase' }}>EV. 3</div>
                <div style={{ padding: '10px 0', fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: '0.07em', textTransform: 'uppercase' }}>EV. 4</div>
                <div style={{ padding: '10px 0 10px 6px', fontSize: 11, fontWeight: 700, color: '#475569', letterSpacing: '0.07em', textTransform: 'uppercase', background: '#f4f6fd', borderLeft: '2px solid #d1d9ee' }}>C1</div>
                <div style={{ padding: '10px 0 10px 6px', fontSize: 11, fontWeight: 700, color: '#475569', letterSpacing: '0.07em', textTransform: 'uppercase', background: '#f4f6fd' }}>C2</div>
                <div style={{ padding: '10px 0 10px 6px', fontSize: 11, fontWeight: 700, color: '#475569', letterSpacing: '0.07em', textTransform: 'uppercase', background: '#f4f6fd' }}>C3</div>
                <div style={{ padding: '10px 0 10px 6px', fontSize: 11, fontWeight: 700, color: '#475569', letterSpacing: '0.07em', textTransform: 'uppercase', background: '#f4f6fd' }}>C4</div>
                <div style={{ padding: '10px 0 10px 10px', fontSize: 11, fontWeight: 700, color: '#0058be', letterSpacing: '0.07em', textTransform: 'uppercase', background: '#eff4ff', borderLeft: '2px solid #bfdbfe' }}>NOTA FINAL</div>
              </div>

              {/* Data rows */}
              {EVAL_STUDENTS.map((student, idx) => {
                        const sg = grades[student.id];
                        const finalCfg = GRADE_CFG[sg.comp];
                        return (<div key={student.id} style={{ display: 'grid', gridTemplateColumns: GCOLS, padding: '0 20px', borderBottom: idx < EVAL_STUDENTS.length - 1 ? '1px solid #f1f4f9' : 'none', alignItems: 'stretch', minHeight: 50, transition: 'background 0.1s' }} onMouseEnter={e => e.currentTarget.style.background = '#fafbff'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <div style={{ display: 'flex', alignItems: 'center' }}><span style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>{student.num}</span></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, background: `hsl(${student.hue},60%,88%)`, border: `2px solid hsl(${student.hue},50%,76%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, color: `hsl(${student.hue},55%,30%)` }}>{student.initials}</div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{student.name}</span>
                    </div>
                    {/* Editable eval columns */}
                    <div style={{ display: 'flex', alignItems: 'center', paddingLeft: 4, borderLeft: '2px solid #e8edf8' }}><GradePill g={sg.e1} onChange={v => { setGrades(p => ({ ...p, [student.id]: { ...p[student.id], e1: v } })); setEvalSaved(false); }}/></div>
                    <div style={{ display: 'flex', alignItems: 'center' }}><GradePill g={sg.e2} onChange={v => { setGrades(p => ({ ...p, [student.id]: { ...p[student.id], e2: v } })); setEvalSaved(false); }}/></div>
                    <div style={{ display: 'flex', alignItems: 'center' }}><GradePill g={sg.e3} onChange={v => { setGrades(p => ({ ...p, [student.id]: { ...p[student.id], e3: v } })); setEvalSaved(false); }}/></div>
                    <div style={{ display: 'flex', alignItems: 'center' }}><GradePill g={sg.e4} onChange={v => { setGrades(p => ({ ...p, [student.id]: { ...p[student.id], e4: v } })); setEvalSaved(false); }}/></div>
                    {/* Read-only competency badges */}
                    <div style={{ display: 'flex', alignItems: 'center', paddingLeft: 6, background: '#f8f9ff', borderLeft: '2px solid #eaecf8' }}><GradeBadge g={sg.c1}/></div>
                    <div style={{ display: 'flex', alignItems: 'center', paddingLeft: 6, background: '#f8f9ff' }}><GradeBadge g={sg.c2}/></div>
                    <div style={{ display: 'flex', alignItems: 'center', paddingLeft: 6, background: '#f8f9ff' }}><GradeBadge g={sg.c3}/></div>
                    <div style={{ display: 'flex', alignItems: 'center', paddingLeft: 6, background: '#f8f9ff' }}><GradeBadge g={sg.c4}/></div>
                    {/* Read-only final grade */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, paddingLeft: 10, paddingRight: 20, background: '#eff4ff', borderLeft: '2px solid #dde8ff', margin: '0 -20px 0 0' }}>
                      <GradeBadge g={sg.comp}/>
                      <span style={{ fontSize: 11, fontWeight: 700, color: finalCfg.color, whiteSpace: 'nowrap' }}>{finalCfg.label}</span>
                    </div>
                  </div>);
                    })}
            </div>);
            })() : (
            /* C1 filtered view */
            <>
          <div style={{ background: '#ffffff', borderRadius: 10, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,35,111,0.04)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '44px 1fr 160px 160px 1fr', background: '#f8f9ff', borderBottom: '2px solid #e8eaf0', padding: '0 20px' }}>
              {['#', 'ESTUDIANTE', 'EVAL. 1 (C1)', 'EVAL. 3 (C1)', ''].map((col, i) => (<div key={i} style={{ padding: '11px 0', fontSize: 11, fontWeight: 700, color: i === 4 ? '#0058be' : '#64748b', letterSpacing: '0.07em', textTransform: 'uppercase', background: i === 4 ? '#eff4ff' : 'transparent', paddingLeft: i === 4 ? 12 : 0 }}>
                  {i === 4 ? 'LOGRO BIMESTRAL C1' : col}
                </div>))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '44px 1fr 160px 160px 1fr', padding: '0 20px', background: '#fafbff', borderBottom: '1px solid #f1f4f9' }}>
              <div /><div />
              <div style={{ padding: '5px 0', fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>Práctica: Números Reales y Cantidad</div>
              <div style={{ padding: '5px 0', fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>Taller: Problemas Aritméticos</div>
              <div style={{ background: '#eff4ff', padding: '5px 12px', fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>Logro bimestral oficial</div>
            </div>
            {EVAL_STUDENTS.slice(0, 3).map((student, idx) => {
                    const sg = grades[student.id];
                    const compCfg = GRADE_CFG[sg.comp];
                    return (<div key={student.id} style={{ display: 'grid', gridTemplateColumns: '44px 1fr 160px 160px 1fr', padding: '0 20px', borderBottom: idx < 2 ? '1px solid #f1f4f9' : 'none', alignItems: 'center', minHeight: 60, transition: 'background 0.1s' }} onMouseEnter={e => e.currentTarget.style.background = '#fafbff'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>{student.num}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, background: `hsl(${student.hue},60%,88%)`, border: `2px solid hsl(${student.hue},50%,76%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: `hsl(${student.hue},55%,30%)` }}>{student.initials}</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{student.name}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>{student.code}</div>
                    </div>
                  </div>
                  <div><GradePill g={sg.e1} onChange={v => { setGrades(p => ({ ...p, [student.id]: { ...p[student.id], e1: v } })); setEvalSaved(false); }}/></div>
                  <div><GradePill g={sg.e3} onChange={v => { setGrades(p => ({ ...p, [student.id]: { ...p[student.id], e3: v } })); setEvalSaved(false); }}/></div>
                  <div style={{ background: '#eff4ff', padding: '12px 12px', display: 'flex', alignItems: 'center', gap: 10, margin: '0 -20px 0 0', paddingRight: 20 }}>
                    <GradePill g={sg.comp} onChange={v => { setGrades(p => ({ ...p, [student.id]: { ...p[student.id], comp: v } })); setEvalSaved(false); }}/>
                    <span style={{ fontSize: 12, fontWeight: 600, color: compCfg.color }}>{compCfg.label}</span>
                  </div>
                </div>);
                })}
          </div>
          <div style={{ marginTop: 12, padding: '8px 14px', background: '#f8f9ff', border: '1px solid #e8eaf0', borderRadius: 8, fontSize: 12, color: '#64748b', lineHeight: 1.55 }}>
            💡 Las evaluaciones asociadas a C2, C3 y C4 (Álgebra, Geometría y Estadística) están ocultas por el filtro activo de la C1.
          </div>
          </>)}

        {/* Sticky bottom action bar */}
        <div style={{
                position: 'sticky', bottom: -56, marginTop: 'auto',
                marginLeft: -36, marginRight: -36, paddingLeft: 36, paddingRight: 36,
                paddingTop: 14, paddingBottom: 14,
                background: '#ffffff', borderTop: '1px solid #e5e7eb',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                gap: 16, boxShadow: '0 -4px 20px rgba(0,0,0,0.06)', zIndex: 10, flexWrap: 'wrap',
            }}>
          <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>
            Cálculo automático de logros cualitativos según escala oficial MINEDU <strong style={{ color: '#64748b' }}>(AD, A, B, C)</strong>
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {evalSaved && (<div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#16a34a' }}>Guardado correctamente</span>
              </div>)}
            <button onClick={handleEvalSave} disabled={evalSaving} style={{
                display: 'flex', alignItems: 'center', gap: 8, height: 42, padding: '0 24px',
                borderRadius: 8, border: 'none', background: evalSaving ? '#3b82f6' : '#00236f',
                color: '#ffffff', fontSize: 13, fontWeight: 700,
                cursor: evalSaving ? 'wait' : 'pointer', fontFamily: 'inherit',
                boxShadow: '0 2px 8px rgba(0,35,111,0.28)', transition: 'background 0.15s',
            }} onMouseEnter={e => { if (!evalSaving)
            e.currentTarget.style.background = '#001d5a'; }} onMouseLeave={e => { if (!evalSaving)
            e.currentTarget.style.background = '#00236f'; }}>
              {evalSaving
                ? <><svg style={{ animation: 'spin 0.8s linear infinite' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>Guardando...</>
                : <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>Guardar Registro de Notas</>}
            </button>
          </div>
        </div>

        {/* ── Modal: Generar Nueva Evaluación ── */}
        {newEvalOpen && (<div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 24 }} onClick={e => { if (e.target === e.currentTarget)
                setNewEvalOpen(false); }}>
            <div style={{ background: '#ffffff', borderRadius: 12, width: '100%', maxWidth: 600, boxShadow: '0 24px 64px rgba(0,0,0,0.22)', display: 'flex', flexDirection: 'column', maxHeight: '92vh' }}>

              {/* Header */}
              <div style={{ padding: '22px 24px 16px', borderBottom: '1px solid #f1f4f9', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 6 }}>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: '#121c2a', margin: 0, letterSpacing: '-0.015em' }}>Generar Nueva Evaluación</h2>
                  <button onClick={() => setNewEvalOpen(false)} style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid #e5e7eb', background: '#f8f9ff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 14, color: '#64748b', transition: 'background 0.12s' }} onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'} onMouseLeave={e => e.currentTarget.style.background = '#f8f9ff'}>✕</button>
                </div>
                <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
                  Curso: <strong style={{ color: '#374151' }}>Matemáticas</strong> • <strong style={{ color: '#374151' }}>4to Grado "B"</strong> • <strong style={{ color: '#374151' }}>Bimestre I</strong>
                </p>
              </div>

              {/* Body */}
              <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 18 }}>

                {/* Context box */}
                <div style={{ background: '#f8f9ff', border: '1px solid #e2e8f0', borderRadius: 6, padding: '8px 14px' }}>
                  <span style={{ fontSize: 13, color: '#64748b' }}>
                    Docente: <strong style={{ color: '#374151' }}>Prof. Carlos García</strong> &nbsp;•&nbsp; Salón: <strong style={{ color: '#374151' }}>4to B (Secundaria)</strong>
                  </span>
                </div>

                {/* Field 1: Nombre */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                    Nombre de la Evaluación <span style={{ color: '#ba1a1a' }}>*</span>
                  </label>
                  <input value={newEvalForm.nombre} onChange={e => { setNewEvalForm(p => ({ ...p, nombre: e.target.value })); setNewEvalErrors(p => ({ ...p, nombre: '' })); }} placeholder="Ingrese el nombre de la evaluación..." style={{ width: '100%', padding: '9px 13px', borderRadius: 8, border: `1.5px solid ${newEvalErrors.nombre ? '#ba1a1a' : '#dde2f0'}`, background: '#f8f9ff', fontSize: 13, color: '#121c2a', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s' }} onFocus={e => e.currentTarget.style.borderColor = newEvalErrors.nombre ? '#ba1a1a' : '#0058be'} onBlur={e => e.currentTarget.style.borderColor = newEvalErrors.nombre ? '#ba1a1a' : '#dde2f0'}/>
                  {newEvalErrors.nombre && <p style={{ fontSize: 11, color: '#ba1a1a', margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>{newEvalErrors.nombre}</p>}
                </div>

                {/* Field 2: Competencia */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                    Competencia Curricular a Evaluar <span style={{ color: '#ba1a1a' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <select value={newEvalForm.competencia} onChange={e => { setNewEvalForm(p => ({ ...p, competencia: e.target.value })); setNewEvalErrors(p => ({ ...p, competencia: '' })); }} style={{ appearance: 'none', WebkitAppearance: 'none', width: '100%', padding: '9px 36px 9px 13px', borderRadius: 8, border: `1.5px solid ${newEvalErrors.competencia ? '#ba1a1a' : '#dde2f0'}`, background: '#f8f9ff', fontSize: 13, color: '#121c2a', fontFamily: 'inherit', outline: 'none', cursor: 'pointer', transition: 'border-color 0.15s' }} onFocus={e => e.currentTarget.style.borderColor = '#0058be'} onBlur={e => e.currentTarget.style.borderColor = '#dde2f0'}>
                      {COMPETENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <svg style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
                  </div>
                  {newEvalErrors.competencia && <p style={{ fontSize: 11, color: '#ba1a1a', margin: '4px 0 0' }}>{newEvalErrors.competencia}</p>}
                </div>

                {/* Field 3: Tipo + Fecha (2 cols) */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Tipo de Instrumento</label>
                    <div style={{ position: 'relative' }}>
                      <select value={newEvalForm.tipo} onChange={e => setNewEvalForm(p => ({ ...p, tipo: e.target.value }))} style={{ appearance: 'none', WebkitAppearance: 'none', width: '100%', padding: '9px 34px 9px 13px', borderRadius: 8, border: '1.5px solid #dde2f0', background: '#f8f9ff', fontSize: 13, color: '#121c2a', fontFamily: 'inherit', outline: 'none', cursor: 'pointer', transition: 'border-color 0.15s' }} onFocus={e => e.currentTarget.style.borderColor = '#0058be'} onBlur={e => e.currentTarget.style.borderColor = '#dde2f0'}>
                        {['Rúbrica de Evaluación', 'Prueba Escrita', 'Trabajo Práctico', 'Proyecto', 'Lista de Cotejo', 'Portafolio'].map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <svg style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                      Fecha de Aplicación <span style={{ fontWeight: 400, color: '#94a3b8' }}>(Opcional)</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input value={newEvalForm.fecha} onChange={e => setNewEvalForm(p => ({ ...p, fecha: e.target.value }))} placeholder="dd/mm/aaaa" style={{ width: '100%', padding: '9px 36px 9px 13px', borderRadius: 8, border: '1.5px solid #dde2f0', background: '#f8f9ff', fontSize: 13, color: '#121c2a', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s' }} onFocus={e => e.currentTarget.style.borderColor = '#0058be'} onBlur={e => e.currentTarget.style.borderColor = '#dde2f0'}/>
                      <svg style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    </div>
                  </div>
                </div>

                {/* Field 4: Descripción */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                    Descripción e Indicaciones <span style={{ fontWeight: 400, color: '#94a3b8' }}>(Opcional)</span>
                  </label>
                  <textarea value={newEvalForm.descripcion} onChange={e => setNewEvalForm(p => ({ ...p, descripcion: e.target.value }))} placeholder="Detalle brevemente las pautas de evaluación y los criterios que los alumnos deberán demostrar..." rows={3} style={{ width: '100%', padding: '9px 13px', borderRadius: 8, border: '1.5px solid #dde2f0', background: '#f8f9ff', fontSize: 13, color: '#121c2a', fontFamily: 'inherit', outline: 'none', resize: 'vertical', minHeight: 70, boxSizing: 'border-box', lineHeight: 1.55, transition: 'border-color 0.15s' }} onFocus={e => e.currentTarget.style.borderColor = '#0058be'} onBlur={e => e.currentTarget.style.borderColor = '#dde2f0'}/>
                </div>
              </div>

              {/* Footer */}
              <div style={{ padding: '14px 24px', borderTop: '1px solid #f1f4f9', display: 'flex', justifyContent: 'flex-end', gap: 10, background: '#fafbff', borderRadius: '0 0 12px 12px', flexShrink: 0 }}>
                <button onClick={() => setNewEvalOpen(false)} style={{ padding: '9px 20px', borderRadius: 6, border: '1.5px solid #cbd5e1', background: '#ffffff', color: '#475569', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.12s' }} onMouseEnter={e => e.currentTarget.style.background = '#f8f9ff'} onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}>Cancelar</button>
                <button onClick={handleNewEvalSave} style={{ height: 42, padding: '0 22px', borderRadius: 6, border: 'none', background: '#00236f', color: '#ffffff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 2px 8px rgba(0,35,111,0.24)', transition: 'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background = '#001d5a'} onMouseLeave={e => e.currentTarget.style.background = '#00236f'}>Guardar y Crear Evaluación</button>
              </div>
            </div>
          </div>)}

      {/* end evaluaciones tab */}
      </>}

    </div>);
}
/* ═══════════════════════════════════════════════════════════
   LOGIN SCREEN
══════════════════════════════════════════════════════════════ */
function LoginScreen({ onLogin }) {
    const [activeRole, setActiveRole] = useState('admin');
    const [email, setEmail] = useState('admin@sanmarcos.edu.pe');
    const [password, setPassword] = useState('••••••••');
    const [showPass, setShowPass] = useState(false);
    const [remember, setRemember] = useState(false);
    const [loading, setLoading] = useState(false);
    const [resetOpen, setResetOpen] = useState(false);
    const [newPass, setNewPass] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [resetError, setResetError] = useState('');
    const [resetSuccess, setResetSuccess] = useState(false);
    const [showNewPass, setShowNewPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const openReset = () => { setResetOpen(true); setNewPass(''); setConfirmPass(''); setResetError(''); setResetSuccess(false); };
    const closeReset = () => { setResetOpen(false); };
    const handleReset = () => {
        if (!newPass || !confirmPass) {
            setResetError('Por favor completa ambos campos.');
            return;
        }
        if (newPass !== confirmPass) {
            setResetError('Las contraseñas no coinciden.');
            return;
        }
        setResetSuccess(true);
    };
    const roleData = ROLES.find(r => r.id === activeRole);
    const selectRole = (r) => {
        setActiveRole(r);
        setEmail(ROLES.find(x => x.id === r).credential);
        setPassword('••••••••');
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => { setLoading(false); onLogin(activeRole); }, 900);
    };
    return (<div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* ── LEFT PANEL ── */}
      <div style={{
            width: '42%', minWidth: 420, background: '#00236f', position: 'relative',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            padding: '56px 52px', overflow: 'hidden',
        }}>
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.07 }} viewBox="0 0 480 900" fill="none" preserveAspectRatio="xMidYMid slice">
          <circle cx="480" cy="0" r="280" stroke="white" strokeWidth="1.5"/>
          <circle cx="480" cy="0" r="200" stroke="white" strokeWidth="1"/>
          <circle cx="480" cy="0" r="120" stroke="white" strokeWidth="1"/>
          <circle cx="0" cy="900" r="320" stroke="white" strokeWidth="1.5"/>
          <circle cx="0" cy="900" r="220" stroke="white" strokeWidth="1"/>
          <circle cx="0" cy="900" r="120" stroke="white" strokeWidth="1"/>
          <line x1="0" y1="0" x2="480" y2="900" stroke="white" strokeWidth="0.5"/>
          <line x1="120" y1="0" x2="480" y2="600" stroke="white" strokeWidth="0.5"/>
          <line x1="0" y1="200" x2="480" y2="900" stroke="white" strokeWidth="0.5"/>
          {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (<React.Fragment key={i}>
              <circle cx={60 + i * 52} cy={180} r="2" fill="white"/>
              <circle cx={60 + i * 52} cy={240} r="2" fill="white"/>
              <circle cx={60 + i * 52} cy={300} r="2" fill="white"/>
            </React.Fragment>))}
        </svg>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            width: 80, height: 80, borderRadius: 20,
            background: 'rgba(255,255,255,0.12)',
            border: '1.5px solid rgba(255,255,255,0.2)',
            backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 28,
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        }}>
            <svg width="44" height="44" viewBox="0 0 48 48" fill="none">
              <path d="M24 4L4 14v8l20 10 20-10v-8L24 4z" fill="white" opacity="0.9"/>
              <path d="M4 26l20 10 20-10" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.7"/>
              <path d="M4 32l20 10 20-10" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.5"/>
              <rect x="21" y="26" width="6" height="12" rx="1" fill="white" opacity="0.8"/>
            </svg>
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>
            República del Perú — 2026
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#ffffff', lineHeight: '1.25', letterSpacing: '-0.02em', margin: '0 0 16px' }}>
            Colegio de Educación<br />Secundaria
          </h1>
          <div style={{ width: 40, height: 3, background: '#60a5fa', borderRadius: 2, marginBottom: 20 }}/>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.65)', lineHeight: '1.6', margin: 0, maxWidth: 320 }}>
            Plataforma Integral de Gestión Académica y Administrativa
          </p>
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          {[
            { icon: '🎓', text: 'Gestión de Matrícula y Expedientes' },
            { icon: '📊', text: 'Calificaciones y Libreta de Notas' },
            { icon: '📅', text: 'Horarios y Control de Asistencia' },
            { icon: '💳', text: 'Pagos, Pensiones y Tesorería' },
        ].map(f => (<div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>{f.icon}</div>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>{f.text}</span>
            </div>))}
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 10 }}>
            Perfiles de acceso del sistema
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {[
            { label: 'Administrador', bg: 'rgba(255,255,255,0.15)' },
            { label: 'Docente', bg: 'rgba(16,185,129,0.2)' },
            { label: 'Estudiante', bg: 'rgba(59,130,246,0.2)' },
            { label: 'Apoderado', bg: 'rgba(167,139,250,0.2)' },
        ].map(b => (<span key={b.label} style={{ padding: '5px 12px', borderRadius: 999, fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.8)', background: b.bg, border: '1px solid rgba(255,255,255,0.12)' }}>
                {b.label}
              </span>))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div style={{
            flex: 1, background: '#f8f9ff',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '32px 48px', overflow: 'auto',
        }}>
        <div style={{
            background: '#ffffff', borderRadius: 16,
            boxShadow: '0 4px 6px rgba(0,35,111,0.04), 0 16px 48px rgba(0,35,111,0.08)',
            border: '1px solid rgba(0,35,111,0.06)',
            width: '100%', maxWidth: 480,
            padding: '40px 40px 32px',
        }}>
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: '0 0 6px' }}>
              Iniciar Sesión
            </h2>
            <p style={{ fontSize: 13, color: '#64748b', margin: 0, lineHeight: '1.5' }}>
              Selecciona tu perfil o ingresa tus credenciales institucionales
            </p>
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8 }}>
              Perfil de Acceso (Demo)
            </div>
            <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
            background: '#f1f4f9', borderRadius: 10, padding: 4, gap: 4,
        }}>
              {ROLES.map(r => {
            const active = activeRole === r.id;
            return (<button key={r.id} onClick={() => selectRole(r.id)} style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                    padding: '10px 6px', borderRadius: 7, border: 'none', cursor: 'pointer',
                    fontFamily: 'inherit', fontSize: 11, fontWeight: active ? 700 : 500,
                    background: active ? '#00236f' : 'transparent',
                    color: active ? '#ffffff' : '#64748b',
                    transition: 'all 0.15s',
                    boxShadow: active ? '0 2px 8px rgba(0,35,111,0.25)' : 'none',
                }} onMouseEnter={e => { if (!active)
                e.currentTarget.style.background = 'rgba(0,35,111,0.06)'; }} onMouseLeave={e => { if (!active)
                e.currentTarget.style.background = 'transparent'; }}>
                    <span style={{ opacity: active ? 1 : 0.6 }}>{r.icon}</span>
                    {r.label}
                  </button>);
        })}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: '#e8eaf0' }}/>
            <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Credenciales</span>
            <div style={{ flex: 1, height: 1, background: '#e8eaf0' }}/>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>Correo Institucional o DNI</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
                <input type="text" value={email} onChange={e => setEmail(e.target.value)} placeholder="ejemplo@colegio.edu.pe" style={{ width: '100%', padding: '10px 12px 10px 38px', borderRadius: 7, border: '1.5px solid #e2e8f0', outline: 'none', fontSize: 13, color: '#1e293b', background: '#ffffff', fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color 0.15s' }} onFocus={e => e.target.style.borderColor = '#0058be'} onBlur={e => e.target.style.borderColor = '#e2e8f0'}/>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>Contraseña</label>
              <div style={{ position: 'relative' }}>
                <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={{ width: '100%', padding: '10px 40px 10px 12px', borderRadius: 7, border: '1.5px solid #e2e8f0', outline: 'none', fontSize: 13, color: '#1e293b', background: '#ffffff', fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color 0.15s' }} onFocus={e => e.target.style.borderColor = '#0058be'} onBlur={e => e.target.style.borderColor = '#e2e8f0'}/>
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#94a3b8', display: 'flex', alignItems: 'center' }}>
                  {showPass
            ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
            : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', userSelect: 'none' }}>
                <div onClick={() => setRemember(!remember)} style={{
            width: 16, height: 16, borderRadius: 4,
            border: `1.5px solid ${remember ? '#0058be' : '#d1d5db'}`,
            background: remember ? '#0058be' : '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', flexShrink: 0, transition: 'all 0.15s',
        }}>
                  {remember && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                </div>
                <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>Recordar mi sesión</span>
              </label>
              <button type="button" onClick={openReset} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#0058be', fontFamily: 'inherit', padding: 0 }}>
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <div style={{ background: '#f0f6ff', border: '1px solid #dbeafe', borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: 6, background: '#00236f', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
                {roleData.icon}
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#1e40af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ingresando como</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{roleData.label} — Colegio San Marcos</div>
              </div>
            </div>

            <button type="submit" disabled={loading} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            width: '100%', padding: '12px 24px', borderRadius: 8, border: 'none',
            background: loading ? '#3b82f6' : '#00236f', color: 'white',
            fontSize: 14, fontWeight: 700, cursor: loading ? 'wait' : 'pointer',
            fontFamily: 'inherit', letterSpacing: '0.01em',
            boxShadow: '0 4px 14px rgba(0,35,111,0.3)', transition: 'background 0.15s, box-shadow 0.15s', marginTop: 4,
        }} onMouseEnter={e => { if (!loading) {
        e.currentTarget.style.background = '#001d5a';
        e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,35,111,0.4)';
    } }} onMouseLeave={e => { if (!loading) {
        e.currentTarget.style.background = '#00236f';
        e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,35,111,0.3)';
    } }}>
              {loading ? (<>
                  <svg style={{ animation: 'spin 0.8s linear infinite' }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                  Verificando credenciales...
                </>) : (<>
                  Ingresar al Sistema
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </>)}
            </button>
          </form>
        </div>

        <div style={{ marginTop: 28, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
          {['Soporte Técnico', 'Manual de Usuario', 'Política de Privacidad'].map((link, i, arr) => (<React.Fragment key={link}>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#94a3b8', fontFamily: 'inherit', fontWeight: 500, padding: 0 }} onMouseEnter={e => e.currentTarget.style.color = '#0058be'} onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}>
                {link}
              </button>
              {i < arr.length - 1 && <span style={{ color: '#cbd5e1', fontSize: 12 }}>•</span>}
            </React.Fragment>))}
        </div>
        <div style={{ marginTop: 10, fontSize: 11, color: '#cbd5e1', textAlign: 'center' }}>
          © 2026 Colegio San Marcos · Sistema v2.4.1 · UGEL Lima Norte
        </div>
      </div>

      {/* ── PASSWORD RESET MODAL ── */}
      {resetOpen && (<div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 440, padding: '32px 36px', boxShadow: '0 20px 60px rgba(0,0,0,0.25)', fontFamily: "'Inter', system-ui, sans-serif" }}>
            {resetSuccess ? (<div style={{ textAlign: 'center' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', marginBottom: 10 }}>Contraseña restablecida</div>
                <div style={{ fontSize: 14, color: '#64748b', lineHeight: 1.5, marginBottom: 28 }}>Tu contraseña ha sido restablecida correctamente.</div>
                <button onClick={closeReset} style={{ width: '100%', padding: '11px 0', borderRadius: 8, border: 'none', background: '#00236f', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                  Volver al inicio de sesión
                </button>
              </div>) : (<>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', marginBottom: 6 }}>Restablecer contraseña</div>
                <div style={{ fontSize: 13, color: '#64748b', marginBottom: 24, lineHeight: 1.5 }}>
                  Ingresa tu nueva contraseña y confírmala para restablecer el acceso a tu cuenta.
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Nueva contraseña</label>
                  <div style={{ position: 'relative' }}>
                    <input type={showNewPass ? 'text' : 'password'} value={newPass} onChange={e => { setNewPass(e.target.value); setResetError(''); }} placeholder="Ingresa tu nueva contraseña" style={{ width: '100%', padding: '10px 40px 10px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', color: '#1e293b' }} onFocus={e => e.target.style.borderColor = '#0058be'} onBlur={e => e.target.style.borderColor = '#e2e8f0'}/>
                    <button type="button" onClick={() => setShowNewPass(v => !v)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 2 }}>
                      {showNewPass ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg> : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: resetError ? 12 : 24 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Confirmar contraseña</label>
                  <div style={{ position: 'relative' }}>
                    <input type={showConfirm ? 'text' : 'password'} value={confirmPass} onChange={e => { setConfirmPass(e.target.value); setResetError(''); }} placeholder="Confirma tu nueva contraseña" style={{ width: '100%', padding: '10px 40px 10px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', color: '#1e293b' }} onFocus={e => e.target.style.borderColor = '#0058be'} onBlur={e => e.target.style.borderColor = '#e2e8f0'}/>
                    <button type="button" onClick={() => setShowConfirm(v => !v)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 2 }}>
                      {showConfirm ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg> : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
                    </button>
                  </div>
                </div>

                {resetError && (<div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '9px 12px', fontSize: 13, color: '#dc2626', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    {resetError}
                  </div>)}

                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={closeReset} style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: '1.5px solid #e2e8f0', background: '#fff', color: '#374151', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                    Cancelar
                  </button>
                  <button onClick={handleReset} style={{ flex: 2, padding: '10px 0', borderRadius: 8, border: 'none', background: '#00236f', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 14px rgba(0,35,111,0.25)' }}>
                    Restablecer contraseña
                  </button>
                </div>
              </>)}
          </div>
        </div>)}
    </div>);
}
/* ═══════════════════════════════════════════════════════════
   APP ROOT
══════════════════════════════════════════════════════════════ */
export default function App() {
    const [loggedIn, setLoggedIn] = useState(false);
    const [userRole, setUserRole] = useState('admin');
    const [activeNav, setActiveNav] = useState('inicio');
    const handleLogin = (role) => {
        setUserRole(role);
        setActiveNav(ROLE_LANDING[role]);
        setLoggedIn(true);
    };
    if (!loggedIn)
        return <LoginScreen onLogin={handleLogin}/>;
    /* ── Dedicated teacher layout ── */
    if (userRole === 'teacher') {
        return (<div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', fontFamily: "'Inter', system-ui, sans-serif", background: '#f8f9ff' }}>
        <TeacherSidebar activeNav={activeNav} onNav={setActiveNav} onLogout={() => setLoggedIn(false)}/>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
          <TeacherHeader activeNav={activeNav} onLogout={() => setLoggedIn(false)}/>
          <main style={{ flex: 1, overflowY: 'auto', padding: '36px 36px 56px' }}>
            {activeNav === 'cursos' && <TeacherCoursesHub onNavigate={setActiveNav}/>}
            {activeNav === 'cursodetalle' && <TeacherCourseDetailView onBack={() => setActiveNav('cursos')}/>}
            {activeNav === 'cursofinalizado' && <TeacherFinishedSessionView onBack={() => setActiveNav('cursos')}/>}
            {activeNav === 'horario' && <TeacherScheduleView />}
            {activeNav === 'libretas' && <TutorReportCardView />}
            {activeNav === 'asistencia' && <AttendanceView />}
            {!['cursos', 'cursodetalle', 'cursofinalizado', 'horario', 'libretas', 'asistencia'].includes(activeNav) && (<div style={{ paddingTop: 80, textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>Vista en construcción.</div>)}
          </main>
        </div>
      </div>);
    }
    /* ── Admin / parent / student layout ── */
    return (<div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', fontFamily: "'Inter', system-ui, sans-serif", background: '#f8f9ff' }}>
      <Sidebar role={userRole} activeNav={activeNav} onNav={setActiveNav} onLogout={() => setLoggedIn(false)}/>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <AppHeader role={ROLE_HEADER[userRole]} onLogout={() => setLoggedIn(false)}/>
        <main style={{ flex: 1, overflowY: 'auto', padding: '32px 32px 48px' }}>
          {activeNav === 'inicio' && <DashboardView />}
          {activeNav === 'horarios' && <ScheduleView />}
          {activeNav === 'mihorario' && userRole === 'student' && <StudentScheduleView />}
          {activeNav === 'mihorario' && userRole === 'parent' && <ParentScheduleView />}
          {activeNav === 'asistencia' && <AttendanceView />}
          {activeNav === 'reportes' && <ReportCardView />}
          {activeNav === 'libreta' && userRole === 'student' && <StudentReportCardView />}
          {activeNav === 'libreta' && userRole === 'parent' && <ParentReportCardView />}
          {activeNav === 'cursos' && userRole === 'student' && <StudentCursosView />}
          {activeNav === 'cursos' && userRole === 'parent' && <ParentCursosView />}
          {activeNav === 'cursos' && userRole !== 'student' && userRole !== 'parent' && <AdminCursosView onNavigate={setActiveNav}/>}
          {activeNav === 'usuarios' && <UsuariosView onNavigate={setActiveNav}/>}
          {activeNav === 'matriculas' && <MatriculasView onNavigate={setActiveNav}/>}
          {activeNav === 'pagos' && userRole === 'parent' && <ParentPagosView />}
          {activeNav === 'pagos' && userRole !== 'parent' && <PagosView />}
          {activeNav === 'rendimiento' && userRole === 'student' && <StudentRendimientoView />}
          {activeNav === 'rendimiento' && userRole === 'parent' && <ParentRendimientoView />}
          {activeNav === 'auditorias' && <AuditoriasView />}
          {activeNav === 'logerrores' && <LogErroresView />}
          {!['inicio', 'horarios', 'asistencia', 'reportes', 'cursos', 'usuarios', 'matriculas', 'pagos', 'auditorias', 'logerrores', 'mihorario', 'libreta', 'rendimiento'].includes(activeNav) && (<div style={{ paddingTop: 80, textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>
              Vista en construcción.
            </div>)}
        </main>
      </div>
    </div>);
}
/* ═══════════════════════════════════════════════════════════
   SIDEBAR
══════════════════════════════════════════════════════════════ */
function Sidebar({ role = 'admin', activeNav, onNav, onLogout }) {
    const isStudent = role === 'student';
    const isParent = role === 'parent';
    const footerUser = isStudent
        ? { initials: 'LT', name: 'Lucas Torres', email: 'EST-004@sanmarcos.edu.pe', gradient: 'linear-gradient(135deg, #0f766e, #2dd4bf)' }
        : isParent
            ? { initials: 'SM', name: 'Sr. Mendoza', email: 'mendoza@familia.pe', gradient: 'linear-gradient(135deg, #7c3aed, #a78bfa)' }
            : { initials: 'A', name: 'Administrador', email: 'admin@sanmarcos.edu.pe', gradient: 'linear-gradient(135deg, #1d4ed8, #60a5fa)' };
    return (<aside style={{ width: 260, minWidth: 260, background: '#00236f', display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', flexShrink: 0 }}>
      {/* School crest + name */}
      <div style={{ padding: '26px 22px 22px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 46, height: 46, borderRadius: 13, background: 'rgba(255,255,255,0.12)', border: '1.5px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="26" height="26" viewBox="0 0 48 48" fill="none">
              <path d="M24 4L4 14v8l20 10 20-10v-8L24 4z" fill="white" opacity="0.9"/>
              <path d="M4 26l20 10 20-10" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.65"/>
              <path d="M4 32l20 10 20-10" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.45"/>
              <rect x="21" y="26" width="6" height="12" rx="1" fill="white" opacity="0.8"/>
            </svg>
          </div>
          <div>
            <div style={{ color: '#ffffff', fontWeight: 700, fontSize: 14, letterSpacing: '-0.01em', lineHeight: '1.2' }}>Colegio San Marcos</div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 2 }}>Sistema de Gestión</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '16px 14px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {(isStudent || isParent) ? (<>
            {(isStudent ? NAV_STUDENT : NAV_PARENT).map(i => (<NavItem key={i.id} item={i} active={activeNav === i.id} onClick={() => onNav(i.id)}/>))}
          </>) : (<>
            <NavSection label="Principal">
              {NAV_ITEMS_PRINCIPAL.map(i => <NavItem key={i.id} item={i} active={activeNav === i.id} onClick={() => onNav(i.id)}/>)}
            </NavSection>
            <NavSection label="Gestión">
              {NAV_ITEMS_GESTION.map(i => <NavItem key={i.id} item={i} active={activeNav === i.id} onClick={() => onNav(i.id)}/>)}
            </NavSection>
            <NavSection label="Administración">
              {NAV_ITEMS_ADMIN.map(i => <NavItem key={i.id} item={i} active={activeNav === i.id} onClick={() => onNav(i.id)}/>)}
            </NavSection>
          </>)}
      </nav>

      {/* User footer */}
      <div style={{ padding: '14px 18px 20px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: footerUser.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'white', flexShrink: 0, border: '2px solid rgba(255,255,255,0.18)', textAlign: 'center', lineHeight: '35px' }}>{footerUser.initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: 'rgba(255,255,255,0.92)', fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{footerUser.name}</div>
            <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 11, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{footerUser.email}</div>
          </div>
          {onLogout && (<button onClick={onLogout} title="Cerrar sesión" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 7, color: 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', flexShrink: 0, transition: 'color 0.12s' }} onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.85)'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </button>)}
        </div>
      </div>
    </aside>);
}
function NavSection({ label, children }) {
    return (<>
      <div style={{ color: 'rgba(255,255,255,0.28)', fontSize: 10, fontWeight: 700, letterSpacing: '0.11em', textTransform: 'uppercase', padding: '14px 10px 6px', marginTop: 2 }}>{label}</div>
      {children}
    </>);
}
function NavItem({ item, active, onClick }) {
    const Icon = item.icon;
    return (<button onClick={onClick} style={{
            display: 'flex', alignItems: 'center', gap: 11,
            padding: '10px 12px', borderRadius: 9, border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer',
            background: active ? '#0058be' : 'transparent',
            color: active ? '#ffffff' : 'rgba(255,255,255,0.55)',
            fontFamily: "'Inter', system-ui, sans-serif", fontSize: 13, fontWeight: active ? 600 : 400,
            transition: 'background 0.12s, color 0.12s',
            boxShadow: active ? '0 3px 14px rgba(0,88,190,0.4)' : 'none',
        }} onMouseEnter={e => { if (!active)
        e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }} onMouseLeave={e => { if (!active)
        e.currentTarget.style.background = 'transparent'; }}>
      <div style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, background: active ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.12s' }}>
        <Icon size={15} color={active ? '#fff' : 'rgba(255,255,255,0.55)'}/>
      </div>
      {item.label}
    </button>);
}
/* ═══════════════════════════════════════════════════════════
   HEADER
══════════════════════════════════════════════════════════════ */
function AppHeader({ role = 'admin', onLogout }) {
    const user = role === 'teacher'
        ? { initials: 'G', name: 'Prof. García', role: 'Docente — Matemáticas', gradient: 'linear-gradient(135deg, #065f46, #10b981)' }
        : role === 'parent'
            ? { initials: 'SM', name: 'Sr. Mendoza — Apoderado', role: 'Portal de Apoderados', gradient: 'linear-gradient(135deg, #7c3aed, #a78bfa)' }
            : role === 'student'
                ? { initials: 'LT', name: 'Lucas Torres', role: 'Portal de Estudiantes', gradient: 'linear-gradient(135deg, rgb(15, 118, 110), rgb(45, 212, 191))' }
                : { initials: 'A', name: 'Admin', role: 'Super Admin', gradient: 'linear-gradient(135deg, #00236f, #3b82f6)' };
    return (<header style={{ height: 64, background: '#ffffff', borderBottom: '1px solid #e8eaf0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', flexShrink: 0, boxShadow: '0 1px 0 rgba(0,35,111,0.06)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ color: '#64748b', fontSize: 13 }}>Sistema de Gestión</span>
        <span style={{ color: '#cbd5e1', fontSize: 13 }}>/</span>
        <span style={{ color: '#00236f', fontSize: 13, fontWeight: 600 }}>Colegio San Marcos</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {role !== 'student' && (<div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f1f4f9', borderRadius: 8, padding: '8px 14px', width: 260 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input placeholder="Buscar estudiante..." style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: '#374151', width: '100%' }}/>
          </div>)}
        <div style={{ width: 1, height: 28, background: '#e2e8f0' }}/>
        <button style={{ position: 'relative', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', borderRadius: 8, color: '#64748b' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          <span style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: '50%', background: '#ba1a1a', border: '2px solid white' }}/>
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '4px 8px', borderRadius: 8 }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: user.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'white', textAlign: 'center', lineHeight: '35px' }}>{user.initials}</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', lineHeight: '1.2' }}>{user.name}</div>
            <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: '1.2' }}>{user.role}</div>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
        {onLogout && (<>
            <div style={{ width: 1, height: 28, background: '#e2e8f0' }}/>
            <button onClick={onLogout} title="Cerrar sesión" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 7, border: '1px solid #e2e8f0', background: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 600, color: '#64748b' }} onMouseEnter={e => { e.currentTarget.style.background = '#fff1f1'; e.currentTarget.style.color = '#ba1a1a'; e.currentTarget.style.borderColor = '#fecaca'; }} onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#64748b'; e.currentTarget.style.borderColor = '#e2e8f0'; }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Salir
            </button>
          </>)}
      </div>
    </header>);
}
/* ═══════════════════════════════════════════════════════════
   READ-ONLY SCHEDULE VIEWS (Teacher / Student / Parent)
══════════════════════════════════════════════════════════════ */
const RO_HOUR_SLOTS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00'];
const RO_BREAK_AFTER = 2;
function ReadOnlyMatrix({ data }) {
    return (<div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,35,111,0.05)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '90px repeat(5, 1fr)', borderBottom: '2px solid #e2e8f0' }}>
        <div style={{ padding: '12px 14px', background: '#f8f9ff', borderRight: '1px solid #e8eaf0' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.07em', textTransform: 'uppercase' }}>Hora</span>
        </div>
        {DAYS.map((day, di) => (<div key={day} style={{ padding: '12px 0', textAlign: 'center', background: di === 0 ? '#f0f4ff' : '#f8f9ff', borderRight: di < DAYS.length - 1 ? '1px solid #e8eaf0' : 'none', borderLeft: di === 0 ? '1px solid #e8eaf0' : 'none' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: di === 0 ? '#00236f' : '#374151' }}>{day}</div>
            <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2, fontWeight: 500 }}>{['Sep 21', 'Sep 22', 'Sep 23', 'Sep 24', 'Sep 25'][di]}</div>
          </div>))}
      </div>
      {RO_HOUR_SLOTS.map((hour, si) => (<React.Fragment key={hour}>
          <div style={{ display: 'grid', gridTemplateColumns: '90px repeat(5, 1fr)', borderBottom: '1px solid #e8eaf0', minHeight: 86 }}>
            <div style={{ padding: '10px 10px 10px 14px', background: '#f8f9ff', borderRight: '1px solid #e8eaf0', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>{hour}</span>
              <span style={{ fontSize: 10, color: '#c7d2e0', marginTop: 3 }}>→ {RO_HOUR_SLOTS[si + 1] ?? '14:00'}</span>
            </div>
            {DAYS.map((_day, di) => {
                const card = data[`${si}-${di}`];
                return (<div key={di} style={{ padding: '8px', borderRight: di < DAYS.length - 1 ? '1px solid #e8eaf0' : 'none', borderLeft: di === 0 ? '1px solid #e8eaf0' : 'none' }}>
                  {card
                        ? <ScheduleCard card={card}/>
                        : <div style={{ height: '100%', minHeight: 68, borderRadius: 8, border: '1px dashed #edf0f7', background: 'transparent' }}/>}
                </div>);
            })}
          </div>
          {si === RO_BREAK_AFTER && (<div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', borderBottom: '1px dashed #e2e8f0', borderTop: '1px dashed #e2e8f0', background: '#fdfcf4' }}>
              <div style={{ padding: '7px 14px', borderRight: '1px solid #e8eaf0', display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase' }}>10:30–11:00</span>
              </div>
              <div style={{ padding: '7px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 14 }}>☕</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#92400e', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Recreo / Descanso</span>
              </div>
            </div>)}
        </React.Fragment>))}
    </div>);
}
/* ── TEACHER schedule ── */
const TEACHER_HORARIO = {
    '0-0': { subject: 'Matemáticas', room: 'Aula 201', teacher: '4to B' },
    '0-2': { subject: 'Matemáticas', room: 'Aula 204', teacher: '3ro A' },
    '1-0': { subject: 'Matemáticas', room: 'Aula 201', teacher: '4to B' },
    '1-1': { subject: 'Álgebra', room: 'Aula 202', teacher: '1ro B' },
    '1-2': { subject: 'Matemáticas', room: 'Aula 204', teacher: '3ro A' },
    '2-1': { subject: 'Álgebra', room: 'Aula 202', teacher: '1ro B' },
    '2-3': { subject: 'Física', room: 'Lab. Cien', teacher: '5to A' },
    '2-4': { subject: 'Matemáticas', room: 'Aula 203', teacher: '2do C' },
    '3-0': { subject: 'Matemáticas', room: 'Aula 201', teacher: '2do A' },
    '3-3': { subject: 'Física', room: 'Lab. Cien', teacher: '5to A' },
    '3-4': { subject: 'Matemáticas', room: 'Aula 203', teacher: '2do C' },
    '4-0': { subject: 'Matemáticas', room: 'Aula 201', teacher: '2do A' },
    '4-1': { subject: 'Física', room: 'Lab. Cien', teacher: '4to B' },
    '5-1': { subject: 'Física', room: 'Lab. Cien', teacher: '4to B' },
    '5-2': { subject: 'Estadística', room: 'Aula 201', teacher: '4to B' },
};
function TeacherScheduleView() {
    return (<div>
      <nav style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
        {['Inicio', 'Mi Horario'].map((c, i, a) => (<span key={c} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, color: i === a.length - 1 ? '#00236f' : '#94a3b8', fontWeight: i === a.length - 1 ? 600 : 400 }}>{c}</span>
            {i < a.length - 1 && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>}
          </span>))}
      </nav>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 4 }}>Año Escolar 2026</div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: '0 0 4px' }}>Mi Horario</h1>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 6, background: '#f0f4ff', border: '1px solid #bfdbfe' }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#0058be" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#0058be' }}>Prof. García — Matemáticas · Física</span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16, padding: '8px 14px', background: '#f8f9ff', border: '1px solid #e8eaf0', borderRadius: 8, width: 'fit-content' }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>Semana del 21 al 25 de septiembre de 2026</span>
        <span style={{ fontSize: 11, color: '#94a3b8', marginLeft: 4 }}>Las celdas muestran: Curso · Sección · Aula</span>
      </div>
      <ReadOnlyMatrix data={TEACHER_HORARIO}/>
    </div>);
}
/* ── STUDENT schedule ── */
const STUDENT_HORARIO = {
    '0-0': { subject: 'Matemáticas', room: 'Aula 201', teacher: 'Prof. García' },
    '0-1': { subject: 'Comunicación', room: 'Aula 202', teacher: 'Prof. Quispe' },
    '0-2': { subject: 'Inglés', room: 'Lab. Idiom', teacher: 'Prof. Torres' },
    '0-3': { subject: 'Arte', room: 'Taller A', teacher: 'Prof. Vargas' },
    '0-4': { subject: 'Ed. Física', room: 'Gimnasio', teacher: 'Prof. Romero' },
    '1-0': { subject: 'Matemáticas', room: 'Aula 201', teacher: 'Prof. García' },
    '1-1': { subject: 'Comunicación', room: 'Aula 202', teacher: 'Prof. Quispe' },
    '1-2': { subject: 'Inglés', room: 'Lab. Idiom', teacher: 'Prof. Torres' },
    '1-3': { subject: 'Arte', room: 'Taller A', teacher: 'Prof. Vargas' },
    '1-4': { subject: 'Ed. Física', room: 'Gimnasio', teacher: 'Prof. Romero' },
    '2-0': { subject: 'Historia', room: 'Aula 202', teacher: 'Prof. Mendoza' },
    '2-1': { subject: 'Química', room: 'Lab. Cien', teacher: 'Prof. Llanos' },
    '2-2': { subject: 'Matemáticas', room: 'Aula 201', teacher: 'Prof. García' },
    '2-3': { subject: 'Biología', room: 'Lab. Cien', teacher: 'Prof. Llanos' },
    '2-4': { subject: 'Geografía', room: 'Aula 203', teacher: 'Prof. Suárez' },
    '3-0': { subject: 'Química', room: 'Lab. Cien', teacher: 'Prof. Llanos' },
    '3-1': { subject: 'Física Clás.', room: 'Aula 201', teacher: 'Prof. Delgado' },
    '3-2': { subject: 'Historia', room: 'Aula 202', teacher: 'Prof. Mendoza' },
    '3-3': { subject: 'Matemáticas', room: 'Aula 201', teacher: 'Prof. García' },
    '3-4': { subject: 'Inglés', room: 'Lab. Idiom', teacher: 'Prof. Torres' },
    '4-0': { subject: 'Inglés', room: 'Lab. Idiom', teacher: 'Prof. Torres' },
    '4-1': { subject: 'Física Clás.', room: 'Aula 201', teacher: 'Prof. Delgado' },
    '4-2': { subject: 'Comunicación', room: 'Aula 202', teacher: 'Prof. Quispe' },
    '4-3': { subject: 'Geografía', room: 'Aula 203', teacher: 'Prof. Suárez' },
    '4-4': { subject: 'Química', room: 'Lab. Cien', teacher: 'Prof. Llanos' },
    '5-0': { subject: 'Ed. Física', room: 'Gimnasio', teacher: 'Prof. Romero' },
    '5-1': { subject: 'Arte', room: 'Taller A', teacher: 'Prof. Vargas' },
    '5-2': { subject: 'Biología', room: 'Lab. Cien', teacher: 'Prof. Llanos' },
    '5-3': { subject: 'Inglés', room: 'Lab. Idiom', teacher: 'Prof. Torres' },
    '5-4': { subject: 'Historia', room: 'Aula 202', teacher: 'Prof. Mendoza' },
};
function StudentScheduleView() {
    return (<div>
      <nav style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
        {['Inicio', 'Mi Horario'].map((c, i, a) => (<span key={c} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, color: i === a.length - 1 ? '#00236f' : '#94a3b8', fontWeight: i === a.length - 1 ? 600 : 400 }}>{c}</span>
            {i < a.length - 1 && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>}
          </span>))}
      </nav>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 4 }}>Año Escolar 2026</div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: '0 0 4px' }}>Mi Horario</h1>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 6, background: '#f0f4ff', border: '1px solid #bfdbfe' }}>
          <StudentIcon size={11} color="#0058be"/>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#0058be' }}>Lucas Torres — 4to Grado B</span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16, padding: '8px 14px', background: '#f8f9ff', border: '1px solid #e8eaf0', borderRadius: 8, width: 'fit-content' }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>Semana del 21 al 25 de septiembre de 2026</span>
      </div>
      <ReadOnlyMatrix data={STUDENT_HORARIO}/>
    </div>);
}
/* ── PARENT schedule ── */
const PARENT_CHILDREN = [
    {
        id: 'c1',
        name: 'María López García',
        grade: '3ro Grado A',
        horario: {
            '0-0': { subject: 'Comunicación', room: 'Aula 103', teacher: 'Prof. Quispe' },
            '0-1': { subject: 'Matemáticas', room: 'Aula 101', teacher: 'Prof. García' },
            '0-2': { subject: 'Historia', room: 'Aula 202', teacher: 'Prof. Mendoza' },
            '0-3': { subject: 'Inglés', room: 'Lab. Idiom', teacher: 'Prof. Torres' },
            '0-4': { subject: 'Arte', room: 'Taller A', teacher: 'Prof. Vargas' },
            '1-0': { subject: 'Comunicación', room: 'Aula 103', teacher: 'Prof. Quispe' },
            '1-1': { subject: 'Matemáticas', room: 'Aula 101', teacher: 'Prof. García' },
            '1-2': { subject: 'Historia', room: 'Aula 202', teacher: 'Prof. Mendoza' },
            '1-3': { subject: 'Inglés', room: 'Lab. Idiom', teacher: 'Prof. Torres' },
            '1-4': { subject: 'Arte', room: 'Taller A', teacher: 'Prof. Vargas' },
            '2-0': { subject: 'Biología', room: 'Lab. Cien', teacher: 'Prof. Llanos' },
            '2-1': { subject: 'Ed. Física', room: 'Gimnasio', teacher: 'Prof. Romero' },
            '2-2': { subject: 'Química', room: 'Lab. Cien', teacher: 'Prof. Llanos' },
            '2-3': { subject: 'Matemáticas', room: 'Aula 101', teacher: 'Prof. García' },
            '2-4': { subject: 'Geografía', room: 'Aula 203', teacher: 'Prof. Suárez' },
            '3-0': { subject: 'Inglés', room: 'Lab. Idiom', teacher: 'Prof. Torres' },
            '3-1': { subject: 'Biología', room: 'Lab. Cien', teacher: 'Prof. Llanos' },
            '3-2': { subject: 'Ed. Física', room: 'Gimnasio', teacher: 'Prof. Romero' },
            '3-3': { subject: 'Comunicación', room: 'Aula 103', teacher: 'Prof. Quispe' },
            '3-4': { subject: 'Matemáticas', room: 'Aula 101', teacher: 'Prof. García' },
            '4-0': { subject: 'Arte', room: 'Taller A', teacher: 'Prof. Vargas' },
            '4-1': { subject: 'Geografía', room: 'Aula 203', teacher: 'Prof. Suárez' },
            '4-2': { subject: 'Comunicación', room: 'Aula 103', teacher: 'Prof. Quispe' },
            '4-3': { subject: 'Química', room: 'Lab. Cien', teacher: 'Prof. Llanos' },
            '4-4': { subject: 'Historia', room: 'Aula 202', teacher: 'Prof. Mendoza' },
            '5-0': { subject: 'Geografía', room: 'Aula 203', teacher: 'Prof. Suárez' },
            '5-1': { subject: 'Arte', room: 'Taller A', teacher: 'Prof. Vargas' },
            '5-2': { subject: 'Matemáticas', room: 'Aula 101', teacher: 'Prof. García' },
            '5-3': { subject: 'Biología', room: 'Lab. Cien', teacher: 'Prof. Llanos' },
            '5-4': { subject: 'Comunicación', room: 'Aula 103', teacher: 'Prof. Quispe' },
        },
    },
    {
        id: 'c2',
        name: 'Carlos Ramírez Soto',
        grade: '1ro Grado B',
        horario: {
            '0-0': { subject: 'Inglés', room: 'Lab. Idiom', teacher: 'Prof. Torres' },
            '0-1': { subject: 'Ed. Física', room: 'Gimnasio', teacher: 'Prof. Romero' },
            '0-2': { subject: 'Comunicación', room: 'Aula 105', teacher: 'Prof. Quispe' },
            '0-3': { subject: 'Matemáticas', room: 'Aula 102', teacher: 'Prof. García' },
            '0-4': { subject: 'Historia', room: 'Aula 201', teacher: 'Prof. Mendoza' },
            '1-0': { subject: 'Inglés', room: 'Lab. Idiom', teacher: 'Prof. Torres' },
            '1-1': { subject: 'Ed. Física', room: 'Gimnasio', teacher: 'Prof. Romero' },
            '1-2': { subject: 'Comunicación', room: 'Aula 105', teacher: 'Prof. Quispe' },
            '1-3': { subject: 'Matemáticas', room: 'Aula 102', teacher: 'Prof. García' },
            '1-4': { subject: 'Historia', room: 'Aula 201', teacher: 'Prof. Mendoza' },
            '2-0': { subject: 'Arte', room: 'Taller A', teacher: 'Prof. Vargas' },
            '2-1': { subject: 'Comunicación', room: 'Aula 105', teacher: 'Prof. Quispe' },
            '2-2': { subject: 'Biología', room: 'Lab. Cien', teacher: 'Prof. Llanos' },
            '2-3': { subject: 'Ed. Física', room: 'Gimnasio', teacher: 'Prof. Romero' },
            '2-4': { subject: 'Matemáticas', room: 'Aula 102', teacher: 'Prof. García' },
            '3-0': { subject: 'Matemáticas', room: 'Aula 102', teacher: 'Prof. García' },
            '3-1': { subject: 'Historia', room: 'Aula 201', teacher: 'Prof. Mendoza' },
            '3-2': { subject: 'Arte', room: 'Taller A', teacher: 'Prof. Vargas' },
            '3-3': { subject: 'Inglés', room: 'Lab. Idiom', teacher: 'Prof. Torres' },
            '3-4': { subject: 'Biología', room: 'Lab. Cien', teacher: 'Prof. Llanos' },
            '4-0': { subject: 'Historia', room: 'Aula 201', teacher: 'Prof. Mendoza' },
            '4-1': { subject: 'Matemáticas', room: 'Aula 102', teacher: 'Prof. García' },
            '4-2': { subject: 'Arte', room: 'Taller A', teacher: 'Prof. Vargas' },
            '4-3': { subject: 'Comunicación', room: 'Aula 105', teacher: 'Prof. Quispe' },
            '4-4': { subject: 'Inglés', room: 'Lab. Idiom', teacher: 'Prof. Torres' },
            '5-0': { subject: 'Biología', room: 'Lab. Cien', teacher: 'Prof. Llanos' },
            '5-1': { subject: 'Arte', room: 'Taller A', teacher: 'Prof. Vargas' },
            '5-2': { subject: 'Historia', room: 'Aula 201', teacher: 'Prof. Mendoza' },
            '5-3': { subject: 'Ed. Física', room: 'Gimnasio', teacher: 'Prof. Romero' },
            '5-4': { subject: 'Comunicación', room: 'Aula 105', teacher: 'Prof. Quispe' },
        },
    },
];
/* ═══════════════════════════════════════════════════════════
   STUDENT COURSES VIEW (Cursos del Estudiante)
══════════════════════════════════════════════════════════════ */
const STUDENT_COURSES_LIST = [
    { id: 'mat', name: 'Matemáticas', emoji: '📐', teacher: 'Prof. Carlos García', room: 'Aula 204', desc: 'Álgebra, geometría, estadística y resolución de problemas cuantitativos.', competencies: ['C1 - Resuelve problemas de cantidad', 'C2 - Resuelve problemas de regularidad, equivalencia y cambio', 'C3 - Resuelve problemas de forma, movimiento y localización', 'C4 - Resuelve problemas de gestión de datos e incertidumbre'] },
    { id: 'com', name: 'Comunicación', emoji: '📖', teacher: 'Prof. Laura Rivas', room: 'Aula 103', desc: 'Expresión oral, comprensión lectora y producción de textos en lengua materna.', competencies: ['Se comunica oralmente en L1 y L2', 'Lee diversos tipos de textos escritos', 'Escribe diversos tipos de textos'] },
    { id: 'his', name: 'Historia Social', emoji: '🌍', teacher: 'Prof. R. Torres', room: 'Aula 202', desc: 'Construcción de interpretaciones históricas, geografía y ejercicio ciudadano.', competencies: ['Construye interpretaciones históricas', 'Gestiona responsablemente el espacio', 'Convive y participa democráticamente'] },
    { id: 'cie', name: 'Ciencias', emoji: '🔬', teacher: 'Prof. Mario Vera', room: 'Lab. Cien', desc: 'Indagación científica, experimentación y diseño de soluciones tecnológicas.', competencies: ['Indaga mediante métodos científicos', 'Diseña y construye soluciones tecnológicas', 'Explica el mundo natural y artificial'] },
    { id: 'efi', name: 'Ed. Física', emoji: '⚽', teacher: 'Prof. M. Romero', room: 'Gimnasio', desc: 'Desarrollo motor, actividad física y hábitos de vida saludable.', competencies: ['Se desenvuelve motrizmente de manera autónoma', 'Asume una vida saludable'] },
    { id: 'art', name: 'Arte y Cultura', emoji: '🎨', teacher: 'Prof. Ana Morales', room: 'Taller A', desc: 'Expresión artística, apreciación estética y proyectos creativos.', competencies: ['Crea proyectos desde lenguajes artísticos', 'Aprecia de manera crítica manifestaciones artístico-culturales'] },
];
/* Lucas Torres attendance per course — last 8 sessions */
const STUDENT_ATTENDANCE = {
    mat: [
        { date: '19 Sep 2026', status: 'P', obs: 'Puntual' },
        { date: '17 Sep 2026', status: 'P', obs: '—' },
        { date: '12 Sep 2026', status: 'T', obs: 'Llegó 5 min tarde' },
        { date: '10 Sep 2026', status: 'P', obs: '—' },
        { date: '05 Sep 2026', status: 'P', obs: '—' },
        { date: '03 Sep 2026', status: 'P', obs: '—' },
        { date: '29 Ago 2026', status: 'F', obs: 'Falta justificada (médico)' },
        { date: '27 Ago 2026', status: 'P', obs: '—' },
    ],
    com: [
        { date: '19 Sep 2026', status: 'P', obs: '—' }, { date: '16 Sep 2026', status: 'P', obs: '—' },
        { date: '11 Sep 2026', status: 'P', obs: '—' }, { date: '09 Sep 2026', status: 'P', obs: '—' },
        { date: '04 Sep 2026', status: 'P', obs: '—' }, { date: '02 Sep 2026', status: 'T', obs: 'Tardanza leve' },
        { date: '28 Ago 2026', status: 'P', obs: '—' }, { date: '26 Ago 2026', status: 'P', obs: '—' },
    ],
    his: [
        { date: '18 Sep 2026', status: 'P', obs: '—' }, { date: '15 Sep 2026', status: 'P', obs: '—' },
        { date: '10 Sep 2026', status: 'P', obs: '—' }, { date: '08 Sep 2026', status: 'P', obs: '—' },
        { date: '03 Sep 2026', status: 'P', obs: '—' }, { date: '01 Sep 2026', status: 'P', obs: '—' },
        { date: '27 Ago 2026', status: 'P', obs: '—' }, { date: '25 Ago 2026', status: 'F', obs: 'Falta injustificada' },
    ],
    cie: [
        { date: '18 Sep 2026', status: 'P', obs: '—' }, { date: '16 Sep 2026', status: 'P', obs: '—' },
        { date: '11 Sep 2026', status: 'P', obs: '—' }, { date: '09 Sep 2026', status: 'B', obs: '—' },
        { date: '04 Sep 2026', status: 'P', obs: '—' }, { date: '02 Sep 2026', status: 'P', obs: '—' },
        { date: '28 Ago 2026', status: 'P', obs: '—' }, { date: '26 Ago 2026', status: 'P', obs: '—' },
    ],
    efi: [
        { date: '19 Sep 2026', status: 'P', obs: '—' }, { date: '17 Sep 2026', status: 'P', obs: '—' },
        { date: '12 Sep 2026', status: 'P', obs: '—' }, { date: '10 Sep 2026', status: 'P', obs: '—' },
        { date: '05 Sep 2026', status: 'P', obs: '—' }, { date: '03 Sep 2026', status: 'P', obs: '—' },
        { date: '29 Ago 2026', status: 'P', obs: '—' }, { date: '27 Ago 2026', status: 'P', obs: '—' },
    ],
    art: [
        { date: '18 Sep 2026', status: 'P', obs: '—' }, { date: '15 Sep 2026', status: 'P', obs: '—' },
        { date: '10 Sep 2026', status: 'P', obs: '—' }, { date: '08 Sep 2026', status: 'T', obs: 'Tardanza' },
        { date: '03 Sep 2026', status: 'P', obs: '—' }, { date: '01 Sep 2026', status: 'P', obs: '—' },
        { date: '27 Ago 2026', status: 'P', obs: '—' }, { date: '25 Ago 2026', status: 'P', obs: '—' },
    ],
};
/* Lucas Torres grades per course */
const STUDENT_GRADES = {
    mat: [
        { label: 'C1 - Resuelve problemas de cantidad', e1: 'A', e2: 'A', e3: 'A', e4: 'A', c1: 'A', c2: 'A', c3: 'A', c4: 'A', comp: 'A' },
        { label: 'C2 - Resuelve problemas de regularidad y cambio', e1: 'B', e2: 'A', e3: 'A', e4: 'A', c1: 'A', c2: 'A', c3: 'B', c4: 'A', comp: 'A' },
    ],
    com: [
        { label: 'Se comunica oralmente en L1 y L2', e1: 'A', e2: 'AD', e3: 'A', e4: 'A', c1: 'AD', c2: 'A', c3: 'A', c4: 'A', comp: 'AD' },
        { label: 'Lee diversos tipos de textos escritos', e1: 'A', e2: 'A', e3: 'A', e4: 'A', c1: 'A', c2: 'A', c3: 'A', c4: 'A', comp: 'A' },
    ],
    his: [
        { label: 'Construye interpretaciones históricas', e1: 'A', e2: 'A', e3: 'B', e4: 'A', c1: 'A', c2: 'A', c3: 'A', c4: 'B', comp: 'A' },
    ],
    cie: [
        { label: 'Indaga mediante métodos científicos', e1: 'B', e2: 'B', e3: 'A', e4: 'B', c1: 'B', c2: 'B', c3: 'A', c4: 'B', comp: 'B' },
    ],
    efi: [
        { label: 'Se desenvuelve motrizmente de manera autónoma', e1: 'A', e2: 'A', e3: 'A', e4: 'A', c1: 'A', c2: 'A', c3: 'A', c4: 'A', comp: 'A' },
    ],
    art: [
        { label: 'Crea proyectos desde lenguajes artísticos', e1: 'C', e2: 'B', e3: 'B', e4: 'C', c1: 'C', c2: 'B', c3: 'C', c4: 'C', comp: 'C' },
    ],
};
function StudentCourseDetailView({ course, onBack }) {
    const [activeTab, setActiveTab] = useState('asistencia');
    const attendance = (STUDENT_ATTENDANCE[course.id] ?? []).filter(a => a.status === 'P' || a.status === 'T' || a.status === 'F');
    const gradeRows = STUDENT_GRADES[course.id] ?? [];
    const ATT_CFG = {
        P: { label: 'Presente', bg: '#f0fdf4', text: '#15803d', border: '#86efac', dot: '#16a34a' },
        T: { label: 'Tardanza', bg: '#fffbeb', text: '#b45309', border: '#fcd34d', dot: '#d97706' },
        F: { label: 'Falta', bg: '#fff1f1', text: '#991b1b', border: '#fca5a5', dot: '#ef4444' },
    };
    const totalP = attendance.filter(a => a.status === 'P').length;
    const totalT = attendance.filter(a => a.status === 'T').length;
    const totalF = attendance.filter(a => a.status === 'F').length;
    const pct = Math.round((totalP / attendance.length) * 100);
    const GCOLS = '1fr 56px 56px 56px 56px 56px 56px 56px 56px 120px';
    return (<div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      {/* Back link */}
      <div style={{ marginBottom: 20 }}>
        <button onClick={onBack} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 500, color: '#0058be', padding: '6px 10px 6px 2px', borderRadius: 7, transition: 'background 0.12s' }} onMouseEnter={e => e.currentTarget.style.background = '#eff6ff'} onMouseLeave={e => e.currentTarget.style.background = 'none'}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          Volver a Mis Cursos
        </button>
      </div>
      {/* Course header */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,35,111,0.05)', marginBottom: 16 }}>
        <div style={{ padding: '20px 24px 16px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 46, height: 46, borderRadius: 11, background: '#eef1fa', border: '1px solid #dde2f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>{course.emoji}</div>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: '#121c2a', letterSpacing: '-0.02em', margin: 0, lineHeight: 1.2 }}>
                {course.name} — <span style={{ color: '#0058be' }}>4to Grado B</span>
              </h1>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              {[{ icon: '👨‍🏫', label: course.teacher }, { icon: '🚪', label: course.room }, { icon: '📚', label: '4to Año Secundaria' }].map((b, i) => (<React.Fragment key={b.label}>
                  {i > 0 && <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#d1d5db', flexShrink: 0 }}/>}
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 500, color: '#475569' }}><span>{b.icon}</span>{b.label}</span>
                </React.Fragment>))}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f0f4ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '8px 14px', flexShrink: 0 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0058be" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#0058be' }}>Solo lectura</span>
          </div>
        </div>
        {/* Tabs */}
        <div style={{ display: 'flex', alignItems: 'flex-end', borderTop: '1px solid #f1f4f9', paddingLeft: 8 }}>
          {([
            { id: 'asistencia', label: 'Asistencia Diaria', badge: 'Hoy 19 Sep' },
            { id: 'evaluaciones', label: 'Evaluaciones y Notas', badge: null },
        ]).map(tab => {
            const isActive = activeTab === tab.id;
            return (<button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8, padding: '13px 18px 12px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: isActive ? 700 : 500, color: isActive ? '#00236f' : '#64748b', borderBottom: isActive ? '2.5px solid #00236f' : '2.5px solid transparent', transition: 'color 0.15s, border-color 0.15s' }} onMouseEnter={e => { if (!isActive) {
                e.currentTarget.style.color = '#374151';
                e.currentTarget.style.borderBottomColor = '#dde2f0';
            } }} onMouseLeave={e => { if (!isActive) {
                e.currentTarget.style.color = '#64748b';
                e.currentTarget.style.borderBottomColor = 'transparent';
            } }}>
                {tab.label}
                {tab.badge && <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 700, background: '#eef1fa', color: '#00236f', border: '1px solid #c7d2e6' }}>{tab.badge}</span>}
              </button>);
        })}
        </div>
      </div>

      {/* ── TAB: ASISTENCIA ── */}
      {activeTab === 'asistencia' && (<>
          {/* KPI row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
            {[
                { label: 'Asistencia general', value: `${pct}%`, bg: '#eff4ff', border: '#bfdbfe', text: '#00236f' },
                { label: 'Sesiones Presentes', value: String(totalP), bg: '#f0fdf4', border: '#86efac', text: '#15803d' },
                { label: 'Tardanzas', value: String(totalT), bg: '#fffbeb', border: '#fcd34d', text: '#b45309' },
                { label: 'Faltas', value: String(totalF), bg: '#fff1f1', border: '#fca5a5', text: '#991b1b' },
            ].map(k => (<div key={k.label} style={{ background: k.bg, border: `1.5px solid ${k.border}`, borderRadius: 10, padding: '14px 16px' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: k.text, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 4 }}>{k.label}</div>
                <div style={{ fontSize: 30, fontWeight: 900, color: k.text, lineHeight: 1 }}>{k.value}</div>
              </div>))}
          </div>

          {/* Attendance table */}
          <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,35,111,0.04)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px 1fr', padding: '0 24px', background: '#f8f9ff', borderBottom: '2px solid #e8eaf0' }}>
              {['Fecha', 'Estado', 'Observaciones'].map(col => (<div key={col} style={{ padding: '11px 0', fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: '0.07em', textTransform: 'uppercase' }}>{col}</div>))}
            </div>
            {attendance.map((row, ri) => {
                const cfg = ATT_CFG[row.status];
                return (<div key={ri} style={{ display: 'grid', gridTemplateColumns: '1fr 160px 1fr', padding: '0 24px', borderBottom: ri < attendance.length - 1 ? '1px solid #f1f4f9' : 'none', alignItems: 'center', minHeight: 52, background: ri % 2 === 1 ? '#fafbff' : '#fff', transition: 'background 0.1s' }} onMouseEnter={e => e.currentTarget.style.background = '#f8f9ff'} onMouseLeave={e => e.currentTarget.style.background = ri % 2 === 1 ? '#fafbff' : '#fff'}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>{row.date}</span>
                  </div>
                  <div>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 999, background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.text, fontSize: 12, fontWeight: 700 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot, flexShrink: 0 }}/>
                      {cfg.label}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: row.obs === '—' ? '#cbd5e1' : '#64748b' }}>{row.obs}</div>
                </div>);
            })}
          </div>
        </>)}

      {/* ── TAB: EVALUACIONES ── */}
      {activeTab === 'evaluaciones' && (<>
          {/* Bimestre tag */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 13px', borderRadius: 999, fontSize: 12, fontWeight: 700, background: '#eff4ff', border: '1px solid #c7d2e6', color: '#00236f' }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              Bimestre I
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: '#f0f4ff', border: '1px solid #bfdbfe', borderRadius: 7 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0058be" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#0058be' }}>Solo lectura — Notas oficiales MINEDU</span>
            </div>
          </div>

          {/* Grades table */}
          <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,35,111,0.06)' }}>
            {/* Group header */}
            <div style={{ display: 'grid', gridTemplateColumns: GCOLS, borderBottom: '1px solid #dde4ee', padding: '0 20px' }}>
              <div style={{ gridColumn: '1/2', padding: '6px 0', fontSize: 10, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Competencia</div>
              <div style={{ gridColumn: '2/6', padding: '6px 10px', fontSize: 10, fontWeight: 700, color: '#475569', letterSpacing: '0.08em', textTransform: 'uppercase', background: '#f0f2fc', borderLeft: '2px solid #d1d9ee' }}>Evaluaciones del Periodo</div>
              <div style={{ gridColumn: '6/10', padding: '6px 10px', fontSize: 10, fontWeight: 700, color: '#475569', letterSpacing: '0.08em', textTransform: 'uppercase', background: '#f4f6fd', borderLeft: '2px solid #d1d9ee' }}>Logro por Competencia</div>
              <div style={{ gridColumn: '10', padding: '6px 12px', fontSize: 10, fontWeight: 700, color: '#0058be', letterSpacing: '0.08em', textTransform: 'uppercase', background: '#eff4ff', borderLeft: '2px solid #bfdbfe' }}>Nota Final</div>
            </div>
            {/* Column headers */}
            <div style={{ display: 'grid', gridTemplateColumns: GCOLS, background: '#f8f9ff', borderBottom: '2px solid #e8eaf0', padding: '0 20px' }}>
              <div style={{ padding: '10px 0', fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: '0.07em', textTransform: 'uppercase' }}>Competencia</div>
              {['EV. 1', 'EV. 2', 'EV. 3', 'EV. 4'].map((h, i) => (<div key={h} style={{ padding: `10px 0 10px ${i === 0 ? '4px' : '0'}`, fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: '0.07em', textTransform: 'uppercase', borderLeft: i === 0 ? '2px solid #d1d9ee' : 'none' }}>{h}</div>))}
              {['C1', 'C2', 'C3', 'C4'].map((h, i) => (<div key={h} style={{ padding: `10px 0 10px 6px`, fontSize: 11, fontWeight: 700, color: '#475569', letterSpacing: '0.07em', textTransform: 'uppercase', background: '#f4f6fd', borderLeft: i === 0 ? '2px solid #d1d9ee' : 'none' }}>{h}</div>))}
              <div style={{ padding: '10px 0 10px 10px', fontSize: 11, fontWeight: 700, color: '#0058be', letterSpacing: '0.07em', textTransform: 'uppercase', background: '#eff4ff', borderLeft: '2px solid #bfdbfe' }}>NOTA FINAL</div>
            </div>
            {/* Data rows */}
            {gradeRows.map((row, ri) => {
                const finalCfg = GRADE_CFG[row.comp];
                const GBadge = ({ g }) => {
                    const c = GRADE_CFG[g];
                    return <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 10px', borderRadius: 6, border: `1.5px solid ${c.border}`, background: c.bg, color: c.text, fontSize: 12, fontWeight: 800, userSelect: 'none' }}>{g}</span>;
                };
                return (<div key={ri} style={{ display: 'grid', gridTemplateColumns: GCOLS, padding: '0 20px', borderBottom: ri < gradeRows.length - 1 ? '1px solid #f1f4f9' : 'none', alignItems: 'center', minHeight: 52, transition: 'background 0.1s' }} onMouseEnter={e => e.currentTarget.style.background = '#fafbff'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: '#374151', lineHeight: 1.4, paddingRight: 8 }}>{row.label}</div>
                  <div style={{ paddingLeft: 4, borderLeft: '2px solid #e8edf8' }}><GBadge g={row.e1}/></div>
                  <div><GBadge g={row.e2}/></div>
                  <div><GBadge g={row.e3}/></div>
                  <div><GBadge g={row.e4}/></div>
                  <div style={{ paddingLeft: 6, background: '#f8f9ff', borderLeft: '2px solid #eaecf8' }}><GBadge g={row.c1}/></div>
                  <div style={{ paddingLeft: 6, background: '#f8f9ff' }}><GBadge g={row.c2}/></div>
                  <div style={{ paddingLeft: 6, background: '#f8f9ff' }}><GBadge g={row.c3}/></div>
                  <div style={{ paddingLeft: 6, background: '#f8f9ff' }}><GBadge g={row.c4}/></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, paddingLeft: 10, paddingRight: 20, background: '#eff4ff', borderLeft: '2px solid #dde8ff', margin: '0 -20px 0 0' }}>
                    <GBadge g={row.comp}/>
                    <span style={{ fontSize: 11, fontWeight: 700, color: finalCfg.text, whiteSpace: 'nowrap' }}>{finalCfg.desc}</span>
                  </div>
                </div>);
            })}
          </div>
        </>)}
    </div>);
}
function StudentCursosView() {
    const [selectedCourse, setSelectedCourse] = useState(null);
    if (selectedCourse) {
        return <StudentCourseDetailView course={selectedCourse} onBack={() => setSelectedCourse(null)}/>;
    }
    return (<div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          {['Inicio', 'Cursos'].map((c, i, arr) => (<span key={c} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12, color: i === arr.length - 1 ? '#0f172a' : '#94a3b8', fontWeight: i === arr.length - 1 ? 600 : 400 }}>{c}</span>
              {i < arr.length - 1 && <span style={{ color: '#cbd5e1', fontSize: 12 }}>›</span>}
            </span>))}
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#0058be', marginBottom: 6 }}>Portal del Estudiante</div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>Mis Cursos</h1>
            <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0', lineHeight: 1.6 }}>Haz clic en un curso para ver asistencia y evaluaciones.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 14px', background: '#f0f4ff', border: '1px solid #bfdbfe', borderRadius: 8 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0058be" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#0058be' }}>Lucas Torres — 4to Grado B</span>
            </div>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '7px 13px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: '#eef1fa', color: '#00236f', border: '1px solid #c7d2e6' }}>
              {STUDENT_COURSES_LIST.length} cursos
            </span>
          </div>
        </div>
      </div>

      {/* Course cards grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 14 }}>
        {STUDENT_COURSES_LIST.map(course => (<div key={course.id} onClick={() => setSelectedCourse(course)} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '20px 20px 16px', boxShadow: '0 1px 4px rgba(0,35,111,0.04)', display: 'flex', flexDirection: 'column', gap: 10, cursor: 'pointer', transition: 'box-shadow 0.15s, border-color 0.15s' }} onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,35,111,0.09)'; e.currentTarget.style.borderColor = '#0058be'; }} onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,35,111,0.04)'; e.currentTarget.style.borderColor = '#e5e7eb'; }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: '#eef1fa', border: '1px solid #dde2f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                {course.emoji}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#121c2a', marginBottom: 2 }}>{course.name}</div>
                <div style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>{course.teacher}</div>
                <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0', lineHeight: 1.5 }}>{course.desc}</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 6, borderTop: '1px solid #f1f4f9' }}>
              <span style={{ fontSize: 12, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
                {course.room}
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: '#0058be' }}>
                Ver detalle
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
              </span>
            </div>
          </div>))}
      </div>
    </div>);
}
/* ═══════════════════════════════════════════════════════════
   PARENT COURSES VIEW (Cursos del Apoderado)
══════════════════════════════════════════════════════════════ */
const PARENT_CHILD_COURSES = {
    c1: [
        { id: 'mat', name: 'Matemáticas', emoji: '📐', teacher: 'Prof. Carlos García', room: 'Aula 101', desc: 'Álgebra, geometría, estadística y resolución de problemas cuantitativos.', competencies: ['C1 - Resuelve problemas de cantidad', 'C2 - Resuelve problemas de regularidad, equivalencia y cambio'] },
        { id: 'com', name: 'Comunicación', emoji: '📖', teacher: 'Prof. H. Quispe', room: 'Aula 103', desc: 'Expresión oral, comprensión lectora y producción de textos en lengua materna.', competencies: ['Se comunica oralmente en L1 y L2', 'Lee diversos tipos de textos escritos'] },
        { id: 'his', name: 'Historia Social', emoji: '🌍', teacher: 'Prof. P. Mendoza', room: 'Aula 202', desc: 'Construcción de interpretaciones históricas, geografía y ejercicio ciudadano.', competencies: ['Construye interpretaciones históricas', 'Gestiona responsablemente el espacio'] },
        { id: 'ing', name: 'Inglés', emoji: '🌐', teacher: 'Prof. R. Torres', room: 'Lab. Idiom', desc: 'Comunicación oral y escrita en lengua extranjera para contextos cotidianos.', competencies: ['Se comunica en inglés oralmente', 'Lee textos en inglés'] },
        { id: 'art', name: 'Arte y Cultura', emoji: '🎨', teacher: 'Prof. M. Vargas', room: 'Taller A', desc: 'Expresión artística, apreciación estética y proyectos creativos.', competencies: ['Crea proyectos desde lenguajes artísticos'] },
    ],
    c2: [
        { id: 'mat', name: 'Matemáticas', emoji: '📐', teacher: 'Prof. Carlos García', room: 'Aula 102', desc: 'Aritmética básica, operaciones y resolución de problemas elementales.', competencies: ['C1 - Resuelve problemas de cantidad', 'C2 - Resuelve problemas de regularidad, equivalencia y cambio'] },
        { id: 'com', name: 'Comunicación', emoji: '📖', teacher: 'Prof. H. Quispe', room: 'Aula 105', desc: 'Desarrollo de la lectura y escritura en lengua materna.', competencies: ['Se comunica oralmente en L1 y L2', 'Lee diversos tipos de textos escritos'] },
        { id: 'his', name: 'Historia Social', emoji: '🌍', teacher: 'Prof. P. Mendoza', room: 'Aula 201', desc: 'Introducción a la historia, geografía y ciudadanía.', competencies: ['Construye interpretaciones históricas'] },
        { id: 'efi', name: 'Ed. Física', emoji: '⚽', teacher: 'Prof. M. Romero', room: 'Gimnasio', desc: 'Desarrollo motor, actividad física y hábitos de vida saludable.', competencies: ['Se desenvuelve motrizmente de manera autónoma'] },
        { id: 'art', name: 'Arte y Cultura', emoji: '🎨', teacher: 'Prof. Ana Morales', room: 'Taller A', desc: 'Expresión artística y proyectos creativos adaptados a 1er grado.', competencies: ['Crea proyectos desde lenguajes artísticos'] },
    ],
};
const PARENT_CHILD_ATTENDANCE = {
    c1: {
        mat: [
            { date: '19 Sep 2026', status: 'P', obs: 'Puntual' }, { date: '17 Sep 2026', status: 'P', obs: '—' },
            { date: '12 Sep 2026', status: 'P', obs: '—' }, { date: '10 Sep 2026', status: 'T', obs: 'Llegó tarde' },
            { date: '05 Sep 2026', status: 'P', obs: '—' }, { date: '03 Sep 2026', status: 'P', obs: '—' },
            { date: '29 Ago 2026', status: 'P', obs: '—' }, { date: '27 Ago 2026', status: 'F', obs: 'Falta justificada' },
        ],
        com: [
            { date: '19 Sep 2026', status: 'P', obs: '—' }, { date: '16 Sep 2026', status: 'P', obs: '—' },
            { date: '11 Sep 2026', status: 'P', obs: '—' }, { date: '09 Sep 2026', status: 'P', obs: '—' },
            { date: '04 Sep 2026', status: 'P', obs: '—' }, { date: '02 Sep 2026', status: 'P', obs: '—' },
            { date: '28 Ago 2026', status: 'P', obs: '—' }, { date: '26 Ago 2026', status: 'P', obs: '—' },
        ],
        his: [
            { date: '18 Sep 2026', status: 'P', obs: '—' }, { date: '15 Sep 2026', status: 'P', obs: '—' },
            { date: '10 Sep 2026', status: 'T', obs: 'Tardanza' }, { date: '08 Sep 2026', status: 'P', obs: '—' },
            { date: '03 Sep 2026', status: 'P', obs: '—' }, { date: '01 Sep 2026', status: 'P', obs: '—' },
            { date: '27 Ago 2026', status: 'P', obs: '—' }, { date: '25 Ago 2026', status: 'P', obs: '—' },
        ],
        ing: [
            { date: '19 Sep 2026', status: 'P', obs: '—' }, { date: '17 Sep 2026', status: 'P', obs: '—' },
            { date: '12 Sep 2026', status: 'P', obs: '—' }, { date: '10 Sep 2026', status: 'P', obs: '—' },
            { date: '05 Sep 2026', status: 'P', obs: '—' }, { date: '03 Sep 2026', status: 'F', obs: 'Falta injustificada' },
            { date: '29 Ago 2026', status: 'P', obs: '—' }, { date: '27 Ago 2026', status: 'P', obs: '—' },
        ],
        art: [
            { date: '18 Sep 2026', status: 'P', obs: '—' }, { date: '15 Sep 2026', status: 'P', obs: '—' },
            { date: '10 Sep 2026', status: 'P', obs: '—' }, { date: '08 Sep 2026', status: 'P', obs: '—' },
            { date: '03 Sep 2026', status: 'P', obs: '—' }, { date: '01 Sep 2026', status: 'P', obs: '—' },
            { date: '27 Ago 2026', status: 'P', obs: '—' }, { date: '25 Ago 2026', status: 'P', obs: '—' },
        ],
    },
    c2: {
        mat: [
            { date: '19 Sep 2026', status: 'P', obs: '—' }, { date: '17 Sep 2026', status: 'T', obs: 'Tardanza leve' },
            { date: '12 Sep 2026', status: 'P', obs: '—' }, { date: '10 Sep 2026', status: 'P', obs: '—' },
            { date: '05 Sep 2026', status: 'F', obs: 'Falta injustificada' }, { date: '03 Sep 2026', status: 'P', obs: '—' },
            { date: '29 Ago 2026', status: 'P', obs: '—' }, { date: '27 Ago 2026', status: 'P', obs: '—' },
        ],
        com: [
            { date: '19 Sep 2026', status: 'P', obs: '—' }, { date: '16 Sep 2026', status: 'P', obs: '—' },
            { date: '11 Sep 2026', status: 'P', obs: '—' }, { date: '09 Sep 2026', status: 'P', obs: '—' },
            { date: '04 Sep 2026', status: 'P', obs: '—' }, { date: '02 Sep 2026', status: 'P', obs: '—' },
            { date: '28 Ago 2026', status: 'T', obs: 'Tardanza' }, { date: '26 Ago 2026', status: 'P', obs: '—' },
        ],
        his: [
            { date: '18 Sep 2026', status: 'P', obs: '—' }, { date: '15 Sep 2026', status: 'P', obs: '—' },
            { date: '10 Sep 2026', status: 'P', obs: '—' }, { date: '08 Sep 2026', status: 'P', obs: '—' },
            { date: '03 Sep 2026', status: 'P', obs: '—' }, { date: '01 Sep 2026', status: 'P', obs: '—' },
            { date: '27 Ago 2026', status: 'P', obs: '—' }, { date: '25 Ago 2026', status: 'F', obs: 'Falta justificada' },
        ],
        efi: [
            { date: '19 Sep 2026', status: 'P', obs: '—' }, { date: '17 Sep 2026', status: 'P', obs: '—' },
            { date: '12 Sep 2026', status: 'P', obs: '—' }, { date: '10 Sep 2026', status: 'P', obs: '—' },
            { date: '05 Sep 2026', status: 'P', obs: '—' }, { date: '03 Sep 2026', status: 'P', obs: '—' },
            { date: '29 Ago 2026', status: 'P', obs: '—' }, { date: '27 Ago 2026', status: 'P', obs: '—' },
        ],
        art: [
            { date: '18 Sep 2026', status: 'P', obs: '—' }, { date: '15 Sep 2026', status: 'P', obs: '—' },
            { date: '10 Sep 2026', status: 'P', obs: '—' }, { date: '08 Sep 2026', status: 'C', obs: '—' },
            { date: '03 Sep 2026', status: 'P', obs: '—' }, { date: '01 Sep 2026', status: 'P', obs: '—' },
            { date: '27 Ago 2026', status: 'P', obs: '—' }, { date: '25 Ago 2026', status: 'P', obs: '—' },
        ],
    },
};
const PARENT_CHILD_GRADES = {
    c1: {
        mat: [{ label: 'C1 - Resuelve problemas de cantidad', e1: 'A', e2: 'AD', e3: 'A', e4: 'A', c1: 'AD', c2: 'A', c3: 'A', c4: 'A', comp: 'A' }],
        com: [{ label: 'Se comunica oralmente en L1 y L2', e1: 'AD', e2: 'AD', e3: 'A', e4: 'AD', c1: 'AD', c2: 'AD', c3: 'A', c4: 'AD', comp: 'AD' }],
        his: [{ label: 'Construye interpretaciones históricas', e1: 'A', e2: 'A', e3: 'A', e4: 'A', c1: 'A', c2: 'A', c3: 'A', c4: 'A', comp: 'A' }],
        ing: [{ label: 'Se comunica en inglés oralmente', e1: 'B', e2: 'A', e3: 'A', e4: 'A', c1: 'A', c2: 'A', c3: 'B', c4: 'A', comp: 'A' }],
        art: [{ label: 'Crea proyectos desde lenguajes artísticos', e1: 'A', e2: 'A', e3: 'A', e4: 'AD', c1: 'A', c2: 'A', c3: 'A', c4: 'AD', comp: 'A' }],
    },
    c2: {
        mat: [{ label: 'C1 - Resuelve problemas de cantidad', e1: 'B', e2: 'B', e3: 'A', e4: 'B', c1: 'B', c2: 'B', c3: 'A', c4: 'B', comp: 'B' }],
        com: [{ label: 'Se comunica oralmente en L1 y L2', e1: 'A', e2: 'A', e3: 'B', e4: 'A', c1: 'A', c2: 'B', c3: 'A', c4: 'A', comp: 'A' }],
        his: [{ label: 'Construye interpretaciones históricas', e1: 'A', e2: 'A', e3: 'A', e4: 'A', c1: 'A', c2: 'A', c3: 'A', c4: 'A', comp: 'A' }],
        efi: [{ label: 'Se desenvuelve motrizmente de manera autónoma', e1: 'A', e2: 'A', e3: 'A', e4: 'A', c1: 'A', c2: 'A', c3: 'A', c4: 'A', comp: 'A' }],
        art: [{ label: 'Crea proyectos desde lenguajes artísticos', e1: 'C', e2: 'B', e3: 'B', e4: 'C', c1: 'C', c2: 'B', c3: 'C', c4: 'C', comp: 'C' }],
    },
};
function ParentChildCourseDetailView({ childId, childName, childGrade, course, onBack }) {
    const [activeTab, setActiveTab] = useState('asistencia');
    const rawAtt = (PARENT_CHILD_ATTENDANCE[childId]?.[course.id] ?? []);
    const attendance = rawAtt.filter(a => a.status === 'P' || a.status === 'T' || a.status === 'F');
    const gradeRows = PARENT_CHILD_GRADES[childId]?.[course.id] ?? [];
    const ATT_CFG = {
        P: { label: 'Presente', bg: '#f0fdf4', text: '#15803d', border: '#86efac', dot: '#16a34a' },
        T: { label: 'Tardanza', bg: '#fffbeb', text: '#b45309', border: '#fcd34d', dot: '#d97706' },
        F: { label: 'Falta', bg: '#fff1f1', text: '#991b1b', border: '#fca5a5', dot: '#ef4444' },
    };
    const totalP = attendance.filter(a => a.status === 'P').length;
    const totalT = attendance.filter(a => a.status === 'T').length;
    const totalF = attendance.filter(a => a.status === 'F').length;
    const pct = attendance.length ? Math.round((totalP / attendance.length) * 100) : 0;
    const GCOLS = '1fr 56px 56px 56px 56px 56px 56px 56px 56px 120px';
    const GBadge = ({ g }) => {
        const c = GRADE_CFG[g];
        return <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 10px', borderRadius: 6, border: `1.5px solid ${c.border}`, background: c.bg, color: c.text, fontSize: 12, fontWeight: 800, userSelect: 'none' }}>{g}</span>;
    };
    return (<div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      {/* Back link */}
      <div style={{ marginBottom: 20 }}>
        <button onClick={onBack} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 500, color: '#0058be', padding: '6px 10px 6px 2px', borderRadius: 7, transition: 'background 0.12s' }} onMouseEnter={e => e.currentTarget.style.background = '#eff6ff'} onMouseLeave={e => e.currentTarget.style.background = 'none'}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          Volver a Mis Cursos
        </button>
      </div>
      {/* Course header */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,35,111,0.05)', marginBottom: 16 }}>
        <div style={{ padding: '20px 24px 16px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <div style={{ width: 46, height: 46, borderRadius: 11, background: '#eef1fa', border: '1px solid #dde2f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>{course.emoji}</div>
              <div>
                <h1 style={{ fontSize: 20, fontWeight: 700, color: '#121c2a', letterSpacing: '-0.02em', margin: '0 0 2px', lineHeight: 1.2 }}>
                  {course.name} — <span style={{ color: '#0058be' }}>{childGrade}</span>
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
                  {[{ icon: '👨‍🏫', label: course.teacher }, { icon: '🚪', label: course.room }].map((b, i) => (<React.Fragment key={b.label}>
                      {i > 0 && <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#d1d5db', flexShrink: 0 }}/>}
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 500, color: '#475569' }}><span>{b.icon}</span>{b.label}</span>
                    </React.Fragment>))}
                </div>
              </div>
            </div>
            {/* Child identity pill */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#f8f0ff', border: '1px solid #ddd6fe', borderRadius: 7, padding: '5px 12px' }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, color: '#fff' }}>
                {childName.split(' ')[0][0]}{childName.split(' ')[1][0]}
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#6d28d9' }}>{childName}</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f0f4ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '8px 14px', flexShrink: 0 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0058be" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#0058be' }}>Solo lectura</span>
          </div>
        </div>
        {/* Tabs */}
        <div style={{ display: 'flex', alignItems: 'flex-end', borderTop: '1px solid #f1f4f9', paddingLeft: 8 }}>
          {([
            { id: 'asistencia', label: 'Asistencia Diaria', badge: 'Hoy 19 Sep' },
            { id: 'evaluaciones', label: 'Evaluaciones y Notas', badge: null },
        ]).map(tab => {
            const isActive = activeTab === tab.id;
            return (<button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8, padding: '13px 18px 12px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: isActive ? 700 : 500, color: isActive ? '#00236f' : '#64748b', borderBottom: isActive ? '2.5px solid #00236f' : '2.5px solid transparent', transition: 'color 0.15s, border-color 0.15s' }} onMouseEnter={e => { if (!isActive) {
                e.currentTarget.style.color = '#374151';
                e.currentTarget.style.borderBottomColor = '#dde2f0';
            } }} onMouseLeave={e => { if (!isActive) {
                e.currentTarget.style.color = '#64748b';
                e.currentTarget.style.borderBottomColor = 'transparent';
            } }}>
                {tab.label}
                {tab.badge && <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 700, background: '#eef1fa', color: '#00236f', border: '1px solid #c7d2e6' }}>{tab.badge}</span>}
              </button>);
        })}
        </div>
      </div>

      {/* TAB: ASISTENCIA */}
      {activeTab === 'asistencia' && (<>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
            {[
                { label: 'Asistencia general', value: `${pct}%`, bg: '#eff4ff', border: '#bfdbfe', text: '#00236f' },
                { label: 'Sesiones Presentes', value: String(totalP), bg: '#f0fdf4', border: '#86efac', text: '#15803d' },
                { label: 'Tardanzas', value: String(totalT), bg: '#fffbeb', border: '#fcd34d', text: '#b45309' },
                { label: 'Faltas', value: String(totalF), bg: '#fff1f1', border: '#fca5a5', text: '#991b1b' },
            ].map(k => (<div key={k.label} style={{ background: k.bg, border: `1.5px solid ${k.border}`, borderRadius: 10, padding: '14px 16px' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: k.text, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 4 }}>{k.label}</div>
                <div style={{ fontSize: 30, fontWeight: 900, color: k.text, lineHeight: 1 }}>{k.value}</div>
              </div>))}
          </div>
          <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,35,111,0.04)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px 1fr', padding: '0 24px', background: '#f8f9ff', borderBottom: '2px solid #e8eaf0' }}>
              {['Fecha', 'Estado', 'Observaciones'].map(col => (<div key={col} style={{ padding: '11px 0', fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: '0.07em', textTransform: 'uppercase' }}>{col}</div>))}
            </div>
            {attendance.map((row, ri) => {
                const cfg = ATT_CFG[row.status];
                return (<div key={ri} style={{ display: 'grid', gridTemplateColumns: '1fr 160px 1fr', padding: '0 24px', borderBottom: ri < attendance.length - 1 ? '1px solid #f1f4f9' : 'none', alignItems: 'center', minHeight: 52, background: ri % 2 === 1 ? '#fafbff' : '#fff', transition: 'background 0.1s' }} onMouseEnter={e => e.currentTarget.style.background = '#f8f9ff'} onMouseLeave={e => e.currentTarget.style.background = ri % 2 === 1 ? '#fafbff' : '#fff'}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>{row.date}</span>
                  </div>
                  <div>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 999, background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.text, fontSize: 12, fontWeight: 700 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot, flexShrink: 0 }}/>
                      {cfg.label}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: row.obs === '—' ? '#cbd5e1' : '#64748b' }}>{row.obs}</div>
                </div>);
            })}
          </div>
        </>)}

      {/* TAB: EVALUACIONES */}
      {activeTab === 'evaluaciones' && (<>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 13px', borderRadius: 999, fontSize: 12, fontWeight: 700, background: '#eff4ff', border: '1px solid #c7d2e6', color: '#00236f' }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              Bimestre I
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: '#f0f4ff', border: '1px solid #bfdbfe', borderRadius: 7 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0058be" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#0058be' }}>Solo lectura — Notas oficiales MINEDU</span>
            </div>
          </div>
          <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,35,111,0.06)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: GCOLS, borderBottom: '1px solid #dde4ee', padding: '0 20px' }}>
              <div style={{ gridColumn: '1/2', padding: '6px 0', fontSize: 10, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Competencia</div>
              <div style={{ gridColumn: '2/6', padding: '6px 10px', fontSize: 10, fontWeight: 700, color: '#475569', letterSpacing: '0.08em', textTransform: 'uppercase', background: '#f0f2fc', borderLeft: '2px solid #d1d9ee' }}>Evaluaciones del Periodo</div>
              <div style={{ gridColumn: '6/10', padding: '6px 10px', fontSize: 10, fontWeight: 700, color: '#475569', letterSpacing: '0.08em', textTransform: 'uppercase', background: '#f4f6fd', borderLeft: '2px solid #d1d9ee' }}>Logro por Competencia</div>
              <div style={{ gridColumn: '10', padding: '6px 12px', fontSize: 10, fontWeight: 700, color: '#0058be', letterSpacing: '0.08em', textTransform: 'uppercase', background: '#eff4ff', borderLeft: '2px solid #bfdbfe' }}>Nota Final</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: GCOLS, background: '#f8f9ff', borderBottom: '2px solid #e8eaf0', padding: '0 20px' }}>
              <div style={{ padding: '10px 0', fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: '0.07em', textTransform: 'uppercase' }}>Competencia</div>
              {['EV. 1', 'EV. 2', 'EV. 3', 'EV. 4'].map((h, i) => (<div key={h} style={{ padding: `10px 0 10px ${i === 0 ? '4px' : '0'}`, fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: '0.07em', textTransform: 'uppercase', borderLeft: i === 0 ? '2px solid #d1d9ee' : 'none' }}>{h}</div>))}
              {['C1', 'C2', 'C3', 'C4'].map((h, i) => (<div key={h} style={{ padding: '10px 0 10px 6px', fontSize: 11, fontWeight: 700, color: '#475569', letterSpacing: '0.07em', textTransform: 'uppercase', background: '#f4f6fd', borderLeft: i === 0 ? '2px solid #d1d9ee' : 'none' }}>{h}</div>))}
              <div style={{ padding: '10px 0 10px 10px', fontSize: 11, fontWeight: 700, color: '#0058be', letterSpacing: '0.07em', textTransform: 'uppercase', background: '#eff4ff', borderLeft: '2px solid #bfdbfe' }}>NOTA FINAL</div>
            </div>
            {gradeRows.map((row, ri) => {
                const finalCfg = GRADE_CFG[row.comp];
                return (<div key={ri} style={{ display: 'grid', gridTemplateColumns: GCOLS, padding: '0 20px', borderBottom: ri < gradeRows.length - 1 ? '1px solid #f1f4f9' : 'none', alignItems: 'center', minHeight: 52, transition: 'background 0.1s' }} onMouseEnter={e => e.currentTarget.style.background = '#fafbff'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: '#374151', lineHeight: 1.4, paddingRight: 8 }}>{row.label}</div>
                  <div style={{ paddingLeft: 4, borderLeft: '2px solid #e8edf8' }}><GBadge g={row.e1}/></div>
                  <div><GBadge g={row.e2}/></div>
                  <div><GBadge g={row.e3}/></div>
                  <div><GBadge g={row.e4}/></div>
                  <div style={{ paddingLeft: 6, background: '#f8f9ff', borderLeft: '2px solid #eaecf8' }}><GBadge g={row.c1}/></div>
                  <div style={{ paddingLeft: 6, background: '#f8f9ff' }}><GBadge g={row.c2}/></div>
                  <div style={{ paddingLeft: 6, background: '#f8f9ff' }}><GBadge g={row.c3}/></div>
                  <div style={{ paddingLeft: 6, background: '#f8f9ff' }}><GBadge g={row.c4}/></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, paddingLeft: 10, paddingRight: 20, background: '#eff4ff', borderLeft: '2px solid #dde8ff', margin: '0 -20px 0 0' }}>
                    <GBadge g={row.comp}/>
                    <span style={{ fontSize: 11, fontWeight: 700, color: finalCfg.text, whiteSpace: 'nowrap' }}>{finalCfg.desc}</span>
                  </div>
                </div>);
            })}
          </div>
        </>)}
    </div>);
}
function ParentCursosView() {
    const [selChildId, setSelChildId] = useState(PARENT_CHILDREN[0].id);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [showChildDrop, setShowChildDrop] = useState(false);
    const selChild = PARENT_CHILDREN.find(c => c.id === selChildId) ?? PARENT_CHILDREN[0];
    const courses = PARENT_CHILD_COURSES[selChildId] ?? [];
    /* When child changes, go back to course hub */
    const switchChild = (id) => { setSelChildId(id); setSelectedCourse(null); setShowChildDrop(false); };
    if (selectedCourse) {
        return (<ParentChildCourseDetailView childId={selChildId} childName={selChild.name} childGrade={selChild.grade} course={selectedCourse} onBack={() => setSelectedCourse(null)}/>);
    }
    return (<div>
      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          {['Inicio', 'Cursos'].map((c, i, arr) => (<span key={c} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12, color: i === arr.length - 1 ? '#0f172a' : '#94a3b8', fontWeight: i === arr.length - 1 ? 600 : 400 }}>{c}</span>
              {i < arr.length - 1 && <span style={{ color: '#cbd5e1', fontSize: 12 }}>›</span>}
            </span>))}
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#0058be', marginBottom: 6 }}>Portal del Apoderado</div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>Cursos</h1>
            <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>Selecciona un hijo y haz clic en un curso para ver asistencia y evaluaciones.</p>
          </div>
        </div>
      </div>

      {/* Child selector */}
      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', padding: '14px 20px', marginBottom: 22, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 4px rgba(0,35,111,0.05)', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#a78bfa)', border: '2px solid #ddd6fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
            {selChild.name.split(' ')[0][0]}{selChild.name.split(' ')[1][0]}
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Viendo cursos de</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>{selChild.name}</span>
              <span style={{ fontSize: 12, color: '#64748b', background: '#f1f4f9', border: '1px solid #e2e8f0', borderRadius: 5, padding: '2px 8px', fontWeight: 600 }}>{selChild.grade}</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 12, color: '#64748b' }}><strong>{courses.length}</strong> cursos · <strong>{PARENT_CHILDREN.length}</strong> hijos registrados</span>
          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowChildDrop(d => !d)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: '1.5px solid #d1d5db', background: '#f8f9ff', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 600, color: '#374151' }}>
              Seleccionar hijo
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            {showChildDrop && (<div style={{ position: 'absolute', right: 0, top: '110%', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, boxShadow: '0 8px 32px rgba(0,0,0,0.14)', minWidth: 260, zIndex: 100, overflow: 'hidden' }}>
                {PARENT_CHILDREN.map(c => (<button key={c.id} onClick={() => switchChild(c.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 14px', border: 'none', background: c.id === selChildId ? '#eff4ff' : '#fff', cursor: 'pointer', fontFamily: 'inherit' }} onMouseEnter={e => { if (c.id !== selChildId)
                e.currentTarget.style.background = '#f8f9ff'; }} onMouseLeave={e => { if (c.id !== selChildId)
                e.currentTarget.style.background = '#fff'; }}>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                      {c.name.split(' ')[0][0]}{c.name.split(' ')[1][0]}
                    </div>
                    <div style={{ textAlign: 'left', flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{c.name}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>{c.grade}</div>
                    </div>
                    {c.id === selChildId && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0058be" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                  </button>))}
              </div>)}
          </div>
        </div>
      </div>

      {/* Section label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Cursos de {selChild.name.split(' ')[0]}
        </span>
        <div style={{ flex: 1, height: 1, background: '#f1f4f9' }}/>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600, background: '#eef1fa', color: '#00236f', border: '1px solid #c7d2e6' }}>
          {courses.length} cursos
        </span>
      </div>

      {/* Course cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 14 }}>
        {courses.map(course => (<div key={course.id} onClick={() => setSelectedCourse(course)} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '20px 20px 16px', boxShadow: '0 1px 4px rgba(0,35,111,0.04)', display: 'flex', flexDirection: 'column', gap: 10, cursor: 'pointer', transition: 'box-shadow 0.15s, border-color 0.15s' }} onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,35,111,0.09)'; e.currentTarget.style.borderColor = '#0058be'; }} onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,35,111,0.04)'; e.currentTarget.style.borderColor = '#e5e7eb'; }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: '#eef1fa', border: '1px solid #dde2f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                {course.emoji}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#121c2a', marginBottom: 2 }}>{course.name}</div>
                <div style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>{course.teacher}</div>
                <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0', lineHeight: 1.5 }}>{course.desc}</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 6, borderTop: '1px solid #f1f4f9' }}>
              <span style={{ fontSize: 12, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
                {course.room}
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: '#0058be' }}>
                Ver detalle
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
              </span>
            </div>
          </div>))}
      </div>
    </div>);
}
const STUDENT_REPORTS = [
    {
        id: 'r1', emision: '15/09/2026', profesor: 'Prof. Carlos García', alumno: 'Lucas Torres', dni: 'EST-004',
        grado: '4to Secundaria', seccion: 'B',
        faltas: [
            { fecha: '05/09/2026', tipo: 'Falta' },
            { fecha: '08/09/2026', tipo: 'Falta' },
            { fecha: '12/09/2026', tipo: 'Falta' },
        ],
        comentario: 'El estudiante presentó inasistencias reiteradas durante las últimas semanas. Se recomienda comunicar a la familia para tomar las medidas necesarias.',
    },
    {
        id: 'r2', emision: '28/08/2026', profesor: 'Prof. Laura Rivas', alumno: 'Lucas Torres', dni: 'EST-004',
        grado: '4to Secundaria', seccion: 'B',
        faltas: [
            { fecha: '20/08/2026', tipo: 'Falta justificada' },
            { fecha: '22/08/2026', tipo: 'Falta' },
        ],
        comentario: 'Se registraron dos inasistencias en el periodo. Una fue justificada por certificado médico.',
    },
];
const PARENT_CHILD_REPORTS = {
    c1: [
        {
            id: 'pr1', emision: '15/09/2026', profesor: 'Prof. Carlos García', alumno: 'María López García', dni: '74852136',
            grado: '3ro Secundaria', seccion: 'A',
            faltas: [
                { fecha: '04/09/2026', tipo: 'Falta' },
                { fecha: '09/09/2026', tipo: 'Tardanza' },
                { fecha: '11/09/2026', tipo: 'Falta' },
            ],
            comentario: 'La estudiante presentó inasistencias y tardanzas durante el periodo. Se solicita comunicación con los padres para regularizar la asistencia.',
        },
        {
            id: 'pr2', emision: '20/08/2026', profesor: 'Prof. H. Quispe', alumno: 'María López García', dni: '74852136',
            grado: '3ro Secundaria', seccion: 'A',
            faltas: [{ fecha: '15/08/2026', tipo: 'Falta justificada' }],
            comentario: 'Falta justificada por motivo médico. El padre presentó certificado correspondiente.',
        },
    ],
    c2: [
        {
            id: 'pr3', emision: '10/09/2026', profesor: 'Prof. H. Quispe', alumno: 'Carlos Ramírez Soto', dni: '70482135',
            grado: '1ro Secundaria', seccion: 'B',
            faltas: [
                { fecha: '02/09/2026', tipo: 'Falta' },
                { fecha: '05/09/2026', tipo: 'Falta' },
                { fecha: '07/09/2026', tipo: 'Falta injustificada' },
                { fecha: '09/09/2026', tipo: 'Falta' },
            ],
            comentario: 'El estudiante acumuló cuatro inasistencias seguidas sin justificación. Se requiere intervención inmediata de la familia.',
        },
    ],
};
/* Shared report modal */
function AbsenceReportModal({ report, onClose }) {
    return (<div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={e => { if (e.target === e.currentTarget)
        onClose(); }}>
      <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 24px 64px rgba(0,0,0,0.22)', width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto' }}>

        {/* Modal header */}
        <div style={{ padding: '18px 24px 14px', borderBottom: '1px solid #f1f4f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#0058be', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 3 }}>Colegio San Marcos</div>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#0f172a' }}>Reporte de Inasistencia</h2>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: '#f1f4f9', borderRadius: 7, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: 16, fontFamily: 'inherit' }}>✕</button>
        </div>

        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Student info grid */}
          <div style={{ background: '#f8f9ff', borderRadius: 9, border: '1px solid #e2e8f0', padding: '14px 16px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>Información del estudiante</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              {[
            ['Alumno', report.alumno],
            ['Grado', report.grado],
            ['Sección', report.seccion],
            ['Fecha de emisión', report.emision],
            ['Profesor', report.profesor],
            ['Código / DNI', report.dni],
        ].map(([lbl, val]) => (<div key={lbl}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>{lbl}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{val}</div>
                </div>))}
            </div>
          </div>

          {/* Faltas list */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#991b1b', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#991b1b" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              Faltas cometidas ({report.faltas.length})
            </div>
            <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px', background: '#f8f9ff', borderBottom: '1.5px solid #e8eaf0' }}>
                {['Fecha', 'Tipo'].map((h, i) => (<div key={h} style={{ padding: '9px 14px', fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: '0.06em', textTransform: 'uppercase', borderRight: i === 0 ? '1px solid #e8eaf0' : 'none' }}>{h}</div>))}
              </div>
              {report.faltas.map((f, ri) => (<div key={ri} style={{ display: 'grid', gridTemplateColumns: '1fr 160px', borderBottom: ri < report.faltas.length - 1 ? '1px solid #f1f4f9' : 'none', background: ri % 2 === 1 ? '#fafbff' : '#fff' }}>
                  <div style={{ padding: '10px 14px', borderRight: '1px solid #f1f4f9', fontSize: 13, color: '#374151', fontWeight: 500 }}>{f.fecha}</div>
                  <div style={{ padding: '8px 14px', display: 'flex', alignItems: 'center' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 5, background: f.tipo.includes('justificada') ? '#fffbeb' : '#fff1f1', border: `1px solid ${f.tipo.includes('justificada') ? '#fcd34d' : '#fca5a5'}`, color: f.tipo.includes('justificada') ? '#b45309' : '#991b1b', fontSize: 11, fontWeight: 700 }}>
                      {f.tipo}
                    </span>
                  </div>
                </div>))}
            </div>
          </div>

          {/* Teacher comments */}
          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 9, padding: '14px 16px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#92400e" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              Comentarios del docente
            </div>
            <p style={{ fontSize: 13, color: '#78350f', margin: 0, lineHeight: 1.6, fontStyle: 'italic' }}>"{report.comentario}"</p>
          </div>

          {/* Read-only notice */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', background: '#f0f4ff', border: '1px solid #bfdbfe', borderRadius: 7 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0058be" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#0058be' }}>Documento oficial — Solo lectura</span>
          </div>
        </div>

        <div style={{ padding: '12px 24px 18px', borderTop: '1px solid #f1f4f9', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '9px 24px', borderRadius: 8, border: '1.5px solid #d1d5db', background: '#fff', color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            Cerrar
          </button>
        </div>
      </div>
    </div>);
}
/* Shared report list table */
function AbsenceReportList({ reports }) {
    const [openReport, setOpenReport] = useState(null);
    if (reports.length === 0) {
        return (<div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', padding: '48px 24px', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,35,111,0.04)' }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" style={{ margin: '0 auto 12px', display: 'block' }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#94a3b8', marginBottom: 4 }}>No hay reportes de inasistencia registrados.</div>
        <div style={{ fontSize: 12, color: '#cbd5e1' }}>Los reportes emitidos por los docentes aparecerán aquí.</div>
      </div>);
    }
    return (<>
      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,35,111,0.05)' }}>
        {/* Table header */}
        <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr 1fr 120px 80px 80px 140px', background: '#f8f9ff', borderBottom: '2px solid #e8eaf0', padding: '0 20px' }}>
          {['Fecha emisión', 'Profesor', 'Alumno', 'Grado', 'Sección', 'Faltas', 'Acción'].map((h, i) => (<div key={h} style={{ padding: '11px 8px 11px 0', fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: '0.06em', textTransform: 'uppercase', borderRight: i < 6 ? '1px solid #e8eaf0' : 'none', paddingRight: 8 }}>{h}</div>))}
        </div>
        {reports.map((r, ri) => (<div key={r.id} style={{ display: 'grid', gridTemplateColumns: '130px 1fr 1fr 120px 80px 80px 140px', padding: '0 20px', borderBottom: ri < reports.length - 1 ? '1px solid #f1f4f9' : 'none', alignItems: 'center', minHeight: 56, background: ri % 2 === 1 ? '#fafbff' : '#fff', transition: 'background 0.1s' }} onMouseEnter={e => e.currentTarget.style.background = '#f8f9ff'} onMouseLeave={e => e.currentTarget.style.background = ri % 2 === 1 ? '#fafbff' : '#fff'}>
            <div style={{ paddingRight: 8, borderRight: '1px solid #f1f4f9', fontSize: 12, color: '#374151', fontWeight: 500 }}>{r.emision}</div>
            <div style={{ paddingRight: 8, borderRight: '1px solid #f1f4f9', fontSize: 13, color: '#1e293b', fontWeight: 500 }}>{r.profesor}</div>
            <div style={{ paddingRight: 8, borderRight: '1px solid #f1f4f9', fontSize: 13, color: '#1e293b' }}>{r.alumno}</div>
            <div style={{ paddingRight: 8, borderRight: '1px solid #f1f4f9', fontSize: 12, color: '#64748b' }}>{r.grado}</div>
            <div style={{ paddingRight: 8, borderRight: '1px solid #f1f4f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 7, background: '#eef1fa', border: '1px solid #c7d2e6', fontSize: 13, fontWeight: 700, color: '#00236f' }}>{r.seccion}</span>
            </div>
            <div style={{ paddingRight: 8, borderRight: '1px solid #f1f4f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 28, padding: '3px 8px', borderRadius: 6, background: '#fff1f1', border: '1px solid #fca5a5', fontSize: 12, fontWeight: 800, color: '#991b1b' }}>{r.faltas.length}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <button onClick={() => setOpenReport(r)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 7, border: '1.5px solid #0058be', background: 'transparent', color: '#0058be', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', transition: 'background 0.12s, color 0.12s' }} onMouseEnter={e => { e.currentTarget.style.background = '#0058be'; e.currentTarget.style.color = '#fff'; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#0058be'; }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                Revisar reporte
              </button>
            </div>
          </div>))}
      </div>
      {openReport && <AbsenceReportModal report={openReport} onClose={() => setOpenReport(null)}/>}
    </>);
}
function StudentRendimientoView() {
    return (<div>
      {/* Breadcrumb + header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          {['Inicio', 'Rendimiento académico'].map((c, i, arr) => (<span key={c} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12, color: i === arr.length - 1 ? '#0f172a' : '#94a3b8', fontWeight: i === arr.length - 1 ? 600 : 400 }}>{c}</span>
              {i < arr.length - 1 && <span style={{ color: '#cbd5e1', fontSize: 12 }}>›</span>}
            </span>))}
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#0058be', marginBottom: 6 }}>Portal del Estudiante</div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>Rendimiento académico</h1>
            <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>Consulta los reportes de inasistencia registrados durante el año académico.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: '#f0f4ff', border: '1px solid #bfdbfe', borderRadius: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,rgb(15,118,110),rgb(45,212,191))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: '#fff' }}>LT</div>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#0058be' }}>Lucas Torres — 4to Grado B</span>
          </div>
        </div>
      </div>

      {/* Stats summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
            { label: 'Total de reportes', value: String(STUDENT_REPORTS.length), bg: '#f0f4ff', border: '#bfdbfe', text: '#00236f' },
            { label: 'Total de faltas', value: String(STUDENT_REPORTS.reduce((s, r) => s + r.faltas.length, 0)), bg: '#fff1f1', border: '#fca5a5', text: '#991b1b' },
            { label: 'Año académico', value: '2026', bg: '#f0fdf4', border: '#86efac', text: '#15803d' },
        ].map(k => (<div key={k.label} style={{ background: k.bg, border: `1.5px solid ${k.border}`, borderRadius: 10, padding: '14px 16px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: k.text, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 4 }}>{k.label}</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: k.text, lineHeight: 1 }}>{k.value}</div>
          </div>))}
      </div>

      <AbsenceReportList reports={STUDENT_REPORTS}/>
    </div>);
}
function ParentRendimientoView() {
    const [selId, setSelId] = useState(PARENT_CHILDREN[0].id);
    const [showDrop, setShowDrop] = useState(false);
    const child = PARENT_CHILDREN.find(c => c.id === selId) ?? PARENT_CHILDREN[0];
    const reports = PARENT_CHILD_REPORTS[selId] ?? [];
    return (<div>
      {/* Breadcrumb + header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          {['Inicio', 'Rendimiento académico'].map((c, i, arr) => (<span key={c} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12, color: i === arr.length - 1 ? '#0f172a' : '#94a3b8', fontWeight: i === arr.length - 1 ? 600 : 400 }}>{c}</span>
              {i < arr.length - 1 && <span style={{ color: '#cbd5e1', fontSize: 12 }}>›</span>}
            </span>))}
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#0058be', marginBottom: 6 }}>Portal del Apoderado</div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>Rendimiento académico</h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>Consulta los reportes de inasistencia registrados durante el año académico.</p>
        </div>
      </div>

      {/* Child selector */}
      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', padding: '14px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 4px rgba(0,35,111,0.05)', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#a78bfa)', border: '2px solid #ddd6fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
            {child.name.split(' ')[0][0]}{child.name.split(' ')[1][0]}
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Alumno seleccionado</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>{child.name}</span>
              <span style={{ fontSize: 12, color: '#64748b', background: '#f1f4f9', border: '1px solid #e2e8f0', borderRadius: 5, padding: '2px 8px', fontWeight: 600 }}>{child.grade}</span>
              {/* DNI from PARENT_CHILD_REPORTS */}
              {reports[0] && <span style={{ fontSize: 11, color: '#94a3b8', background: '#f8f9ff', border: '1px solid #e8eaf0', borderRadius: 5, padding: '2px 8px' }}>DNI: {reports[0].dni}</span>}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 12, color: '#64748b' }}><strong>{reports.length}</strong> reporte{reports.length !== 1 ? 's' : ''}</span>
          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowDrop(d => !d)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: '1.5px solid #d1d5db', background: '#f8f9ff', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 600, color: '#374151' }}>
              Seleccionar hijo
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            {showDrop && (<div style={{ position: 'absolute', right: 0, top: '110%', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, boxShadow: '0 8px 32px rgba(0,0,0,0.14)', minWidth: 260, zIndex: 100, overflow: 'hidden' }}>
                {PARENT_CHILDREN.map(c => (<button key={c.id} onClick={() => { setSelId(c.id); setShowDrop(false); }} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 14px', border: 'none', background: c.id === selId ? '#eff4ff' : '#fff', cursor: 'pointer', fontFamily: 'inherit' }} onMouseEnter={e => { if (c.id !== selId)
                e.currentTarget.style.background = '#f8f9ff'; }} onMouseLeave={e => { if (c.id !== selId)
                e.currentTarget.style.background = '#fff'; }}>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                      {c.name.split(' ')[0][0]}{c.name.split(' ')[1][0]}
                    </div>
                    <div style={{ textAlign: 'left', flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{c.name}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>{c.grade}</div>
                    </div>
                    {c.id === selId && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0058be" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                  </button>))}
              </div>)}
          </div>
        </div>
      </div>

      {/* Stats summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
            { label: 'Total de reportes', value: String(reports.length), bg: '#f0f4ff', border: '#bfdbfe', text: '#00236f' },
            { label: 'Total de faltas', value: String(reports.reduce((s, r) => s + r.faltas.length, 0)), bg: '#fff1f1', border: '#fca5a5', text: '#991b1b' },
            { label: 'Año académico', value: '2026', bg: '#f0fdf4', border: '#86efac', text: '#15803d' },
        ].map(k => (<div key={k.label} style={{ background: k.bg, border: `1.5px solid ${k.border}`, borderRadius: 10, padding: '14px 16px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: k.text, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 4 }}>{k.label}</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: k.text, lineHeight: 1 }}>{k.value}</div>
          </div>))}
      </div>

      <AbsenceReportList reports={reports}/>
    </div>);
}
const PARENT_PAGOS = [
    {
        id: 'c1', nombre: 'María', apellido: 'López García', dni: '74852136', grade: '3ro Grado A',
        realizados: [
            { id: 'p1', concepto: 'Matrícula 2026', fecha: '15/03/2026', monto: 'S/ 350.00', status: 'Pagado' },
            { id: 'p2', concepto: 'Pensión Marzo', fecha: '10/03/2026', monto: 'S/ 300.00', status: 'Pagado' },
            { id: 'p3', concepto: 'Pensión Febrero', fecha: '10/02/2026', monto: 'S/ 300.00', status: 'Pagado' },
        ],
        pendientes: [
            { id: 'p4', concepto: 'Pensión Abril', fecha: '10/04/2026', monto: 'S/ 300.00', status: 'Pendiente' },
            { id: 'p5', concepto: 'Pensión Mayo', fecha: '10/05/2026', monto: 'S/ 300.00', status: 'Pendiente' },
        ],
    },
    {
        id: 'c2', nombre: 'Carlos', apellido: 'Ramírez Soto', dni: '70482135', grade: '1ro Grado B',
        realizados: [
            { id: 'p6', concepto: 'Matrícula 2026', fecha: '15/03/2026', monto: 'S/ 350.00', status: 'Pagado' },
            { id: 'p7', concepto: 'Pensión Marzo', fecha: '10/03/2026', monto: 'S/ 300.00', status: 'Pagado' },
        ],
        pendientes: [
            { id: 'p8', concepto: 'Pensión Abril', fecha: '10/04/2026', monto: 'S/ 300.00', status: 'Pendiente' },
            { id: 'p9', concepto: 'Pensión Mayo', fecha: '10/05/2026', monto: 'S/ 300.00', status: 'Pendiente' },
            { id: 'p10', concepto: 'Pensión Junio', fecha: '10/06/2026', monto: 'S/ 300.00', status: 'Pendiente' },
        ],
    },
];
/* Status badge helper for payments */
function PayStatusBadge({ status }) {
    const cfg = {
        'Pagado': { bg: '#f0fdf4', text: '#15803d', border: '#86efac' },
        'Pendiente': { bg: '#fffbeb', text: '#b45309', border: '#fcd34d' },
        'En revisión': { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
    };
    const c = cfg[status];
    return (<span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 5, border: `1px solid ${c.border}`, background: c.bg, color: c.text, fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>
      {status}
    </span>);
}
function ParentPagosView() {
    const TODAY = '20/09/2026';
    /* Local payment states so "En revisión" persists within the session */
    const [payStates, setPayStates] = useState({});
    const [toast, setToast] = useState(null);
    const [modal, setModal] = useState(null);
    const [pdfFile, setPdfFile] = useState(null);
    const fileRef = useRef(null);
    const openModal = (child, payment) => {
        setModal({ child, payment });
        setPdfFile(null);
    };
    const closeModal = () => { setModal(null); setPdfFile(null); };
    const handleFileChange = (e) => {
        const f = e.target.files?.[0];
        if (!f)
            return;
        if (!f.name.toLowerCase().endsWith('.pdf')) {
            alert('Solo se aceptan archivos PDF.');
            return;
        }
        const kb = Math.round(f.size / 1024);
        setPdfFile({ name: f.name, size: kb < 1024 ? `${kb} KB` : `${(kb / 1024).toFixed(1)} MB` });
    };
    const handleSubmit = () => {
        if (!modal || !pdfFile)
            return;
        setPayStates(prev => ({ ...prev, [modal.payment.id]: 'En revisión' }));
        closeModal();
        setToast('El comprobante de pago ha sido registrado correctamente.');
        setTimeout(() => setToast(null), 4000);
    };
    const getStatus = (p) => payStates[p.id] ?? p.status;
    return (<div>
      {/* Toast */}
      {toast && (<div style={{ position: 'fixed', top: 24, right: 24, zIndex: 9999, background: '#fff', border: '1.5px solid #86efac', borderRadius: 10, padding: '14px 20px', boxShadow: '0 8px 32px rgba(0,0,0,0.14)', display: 'flex', alignItems: 'center', gap: 10, maxWidth: 420 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="9 12 11.5 14.5 15 10"/></svg>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#15803d' }}>{toast}</span>
        </div>)}

      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          {['Inicio', 'Pagos'].map((c, i, arr) => (<span key={c} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12, color: i === arr.length - 1 ? '#0f172a' : '#94a3b8', fontWeight: i === arr.length - 1 ? 600 : 400 }}>{c}</span>
              {i < arr.length - 1 && <span style={{ color: '#cbd5e1', fontSize: 12 }}>›</span>}
            </span>))}
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#0058be', marginBottom: 6 }}>Portal del Apoderado</div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>Pagos</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: '#f0f4ff', border: '1px solid #bfdbfe', borderRadius: 8 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0058be" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#0058be' }}>Solo sus hijos — {PARENT_PAGOS.length} estudiantes registrados</span>
          </div>
        </div>
      </div>

      {/* One card per child */}
      {PARENT_PAGOS.map(child => {
            const pendientesCurrent = child.pendientes.map(p => ({ ...p, status: getStatus(p) }));
            return (<div key={child.id} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,35,111,0.06)', marginBottom: 24, overflow: 'hidden' }}>
            {/* Child identity header */}
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f4f9', display: 'flex', alignItems: 'center', gap: 14, background: '#fafbff' }}>
              <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#a78bfa)', border: '2px solid #ddd6fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
                {child.nombre[0]}{child.apellido[0]}
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>{child.nombre} {child.apellido}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
                  <span style={{ fontSize: 12, color: '#64748b' }}>DNI: <strong>{child.dni}</strong></span>
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>·</span>
                  <span style={{ fontSize: 12, color: '#64748b', background: '#f1f4f9', border: '1px solid #e2e8f0', borderRadius: 5, padding: '1px 8px', fontWeight: 600 }}>{child.grade}</span>
                </div>
              </div>
            </div>

            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Pagos realizados */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#15803d', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="9 12 11.5 14.5 15 10"/></svg>
                  Pagos realizados ({child.realizados.length})
                </div>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 130px 120px 110px', background: '#f8f9ff', borderBottom: '1.5px solid #e8eaf0' }}>
                    {['Concepto', 'Fecha', 'Monto', 'Estado'].map((h, i) => (<div key={h} style={{ padding: '9px 14px', fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: '0.06em', textTransform: 'uppercase', borderRight: i < 3 ? '1px solid #e8eaf0' : 'none' }}>{h}</div>))}
                  </div>
                  {child.realizados.map((p, ri) => (<div key={p.id} style={{ display: 'grid', gridTemplateColumns: '1fr 130px 120px 110px', borderBottom: ri < child.realizados.length - 1 ? '1px solid #f1f4f9' : 'none', background: ri % 2 === 1 ? '#fafbff' : '#fff' }}>
                      <div style={{ padding: '11px 14px', borderRight: '1px solid #f1f4f9', fontSize: 13, color: '#1e293b', fontWeight: 500 }}>{p.concepto}</div>
                      <div style={{ padding: '11px 14px', borderRight: '1px solid #f1f4f9', fontSize: 12, color: '#64748b' }}>{p.fecha}</div>
                      <div style={{ padding: '11px 14px', borderRight: '1px solid #f1f4f9', fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{p.monto}</div>
                      <div style={{ padding: '8px 14px', display: 'flex', alignItems: 'center' }}><PayStatusBadge status="Pagado"/></div>
                    </div>))}
                </div>
              </div>

              {/* Pagos pendientes */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#b45309', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  Pagos pendientes ({pendientesCurrent.length})
                </div>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px 120px 130px 150px', background: '#f8f9ff', borderBottom: '1.5px solid #e8eaf0' }}>
                    {['Concepto', 'Fecha límite', 'Monto', 'Estado', 'Acción'].map((h, i) => (<div key={h} style={{ padding: '9px 14px', fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: '0.06em', textTransform: 'uppercase', borderRight: i < 4 ? '1px solid #e8eaf0' : 'none' }}>{h}</div>))}
                  </div>
                  {pendientesCurrent.map((p, ri) => (<div key={p.id} style={{ display: 'grid', gridTemplateColumns: '1fr 140px 120px 130px 150px', borderBottom: ri < pendientesCurrent.length - 1 ? '1px solid #f1f4f9' : 'none', background: ri % 2 === 1 ? '#fafbff' : '#fff' }}>
                      <div style={{ padding: '11px 14px', borderRight: '1px solid #f1f4f9', fontSize: 13, color: '#1e293b', fontWeight: 500 }}>{p.concepto}</div>
                      <div style={{ padding: '11px 14px', borderRight: '1px solid #f1f4f9', fontSize: 12, color: '#64748b' }}>{p.fecha}</div>
                      <div style={{ padding: '11px 14px', borderRight: '1px solid #f1f4f9', fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{p.monto}</div>
                      <div style={{ padding: '8px 14px', borderRight: '1px solid #f1f4f9', display: 'flex', alignItems: 'center' }}><PayStatusBadge status={p.status}/></div>
                      <div style={{ padding: '8px 14px', display: 'flex', alignItems: 'center' }}>
                        {p.status === 'Pendiente' ? (<button onClick={() => openModal(child, p)} style={{ padding: '6px 14px', borderRadius: 7, border: 'none', background: '#00236f', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                            Registrar pago
                          </button>) : (<span style={{ fontSize: 12, color: '#94a3b8', fontStyle: 'italic' }}>En proceso</span>)}
                      </div>
                    </div>))}
                </div>
              </div>
            </div>
          </div>);
        })}

      {/* Modal */}
      {modal && (<div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={e => { if (e.target === e.currentTarget)
            closeModal(); }}>
          <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 24px 64px rgba(0,0,0,0.22)', width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }}>
            {/* Modal header */}
            <div style={{ padding: '18px 24px 14px', borderBottom: '1px solid #f1f4f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#0058be', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>Portal del Apoderado</div>
                <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#0f172a' }}>Registrar pago</h2>
              </div>
              <button onClick={closeModal} style={{ border: 'none', background: '#f1f4f9', borderRadius: 7, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontFamily: 'inherit', fontSize: 16 }}>✕</button>
            </div>

            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Child info — read-only */}
              <div style={{ background: '#f8f9ff', borderRadius: 9, border: '1px solid #e2e8f0', padding: '14px 16px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Información del estudiante</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 130px', gap: 12 }}>
                  {[['Nombre', modal.child.nombre], ['Apellido', modal.child.apellido], ['DNI', modal.child.dni]].map(([lbl, val]) => (<div key={lbl}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', marginBottom: 4 }}>{lbl}</div>
                      <div style={{ background: '#f1f4f9', border: '1px solid #e2e8f0', borderRadius: 6, padding: '7px 10px', fontSize: 13, color: '#64748b', fontWeight: 500 }}>{val}</div>
                    </div>))}
                </div>
              </div>

              {/* Payment info — read-only */}
              <div style={{ background: '#fffbeb', borderRadius: 9, border: '1px solid #fcd34d', padding: '14px 16px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Información del pago</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 110px', gap: 12 }}>
                  {[['Concepto', modal.payment.concepto], ['Fecha límite', modal.payment.fecha], ['Monto', modal.payment.monto]].map(([lbl, val]) => (<div key={lbl}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#92400e', marginBottom: 4 }}>{lbl}</div>
                      <div style={{ background: '#fff', border: '1px solid #fcd34d', borderRadius: 6, padding: '7px 10px', fontSize: 13, color: '#92400e', fontWeight: 600 }}>{val}</div>
                    </div>))}
                </div>
              </div>

              {/* Fecha de pago — auto-filled */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5, display: 'block' }}>Fecha de pago</label>
                <div style={{ background: '#f1f4f9', border: '1px solid #e2e8f0', borderRadius: 7, padding: '9px 12px', fontSize: 13, color: '#64748b', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  {TODAY}
                  <span style={{ marginLeft: 'auto', fontSize: 11, color: '#94a3b8', fontStyle: 'italic' }}>Automático</span>
                </div>
              </div>

              {/* PDF upload */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5, display: 'block' }}>
                  Comprobante de pago <span style={{ color: '#e11d48' }}>*</span>
                </label>
                <div style={{ fontSize: 11, color: '#64748b', marginBottom: 8 }}>Adjunte un archivo PDF como evidencia del pago.</div>
                {pdfFile ? (<div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#f0f4ff', border: '1.5px solid #bfdbfe', borderRadius: 8, padding: '10px 14px' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="1.8" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/></svg>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#1d4ed8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pdfFile.name}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>{pdfFile.size}</div>
                    </div>
                    <button onClick={() => { setPdfFile(null); if (fileRef.current)
                fileRef.current.value = ''; }} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '2px 6px', borderRadius: 5, color: '#e11d48', fontSize: 12, fontWeight: 700, fontFamily: 'inherit' }}>
                      Eliminar
                    </button>
                  </div>) : (<div onClick={() => fileRef.current?.click()} style={{ border: '2px dashed #bfdbfe', borderRadius: 8, padding: '24px 20px', textAlign: 'center', cursor: 'pointer', background: '#f8fbff', transition: 'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background = '#eff6ff'} onMouseLeave={e => e.currentTarget.style.background = '#f8fbff'}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#93c5fd" strokeWidth="1.6" strokeLinecap="round" style={{ margin: '0 auto 8px', display: 'block' }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#1d4ed8', marginBottom: 3 }}>Adjuntar PDF</div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>Solo archivos PDF</div>
                  </div>)}
                <input ref={fileRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={handleFileChange}/>
              </div>
            </div>

            {/* Footer actions */}
            <div style={{ padding: '14px 24px 18px', borderTop: '1px solid #f1f4f9', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button onClick={closeModal} style={{ padding: '9px 20px', borderRadius: 8, border: '1.5px solid #d1d5db', background: '#fff', color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                Cancelar
              </button>
              <button onClick={handleSubmit} disabled={!pdfFile} style={{ padding: '9px 22px', borderRadius: 8, border: 'none', background: pdfFile ? '#00236f' : '#94a3b8', color: '#fff', fontSize: 13, fontWeight: 700, cursor: pdfFile ? 'pointer' : 'not-allowed', fontFamily: 'inherit', opacity: pdfFile ? 1 : 0.7, transition: 'background 0.15s' }}>
                Registrar pago
              </button>
            </div>
          </div>
        </div>)}
    </div>);
}
function ParentScheduleView() {
    const [selId, setSelId] = useState(PARENT_CHILDREN[0].id);
    const child = PARENT_CHILDREN.find(c => c.id === selId) ?? PARENT_CHILDREN[0];
    return (<div>
      <nav style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
        {['Inicio', 'Mi Horario'].map((c, i, a) => (<span key={c} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, color: i === a.length - 1 ? '#00236f' : '#94a3b8', fontWeight: i === a.length - 1 ? 600 : 400 }}>{c}</span>
            {i < a.length - 1 && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>}
          </span>))}
      </nav>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 4 }}>Año Escolar 2026</div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>Mi Horario</h1>
      </div>
      {/* Child selector */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '16px 20px', marginBottom: 20, display: 'flex', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap', boxShadow: '0 1px 4px rgba(0,35,111,0.04)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Seleccionar hijo</label>
          <div style={{ position: 'relative' }}>
            <select value={selId} onChange={e => setSelId(e.target.value)} style={{ appearance: 'none', background: '#fff', border: '1px solid #d1d5db', borderRadius: 8, padding: '9px 40px 9px 14px', fontSize: 13, fontWeight: 500, color: '#1e293b', cursor: 'pointer', outline: 'none', fontFamily: 'inherit', minWidth: 240 }}>
              {PARENT_CHILDREN.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <svg style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 14px', background: '#f0f4ff', border: '1px solid #bfdbfe', borderRadius: 8, marginBottom: 1 }}>
          <StudentIcon size={13} color="#0058be"/>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#00236f' }}>{child.name}</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>Horario de: <strong>{child.grade}</strong></div>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16, padding: '8px 14px', background: '#f8f9ff', border: '1px solid #e8eaf0', borderRadius: 8, width: 'fit-content' }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>Semana del 21 al 25 de septiembre de 2026</span>
      </div>
      <ReadOnlyMatrix data={child.horario}/>
    </div>);
}
/* ═══════════════════════════════════════════════════════════
   ADMIN SCHEDULE VIEW
══════════════════════════════════════════════════════════════ */
function ScheduleView() {
    const HOUR_SLOTS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00'];
    const BREAK_AFTER = 2;
    const AULAS_OPTS = ['Aula 201', 'Aula 202', 'Aula 203', 'Aula 204', 'Lab. Cien', 'Lab. Idiom', 'Gimnasio', 'Taller A'];
    const CURSOS_OPTS = ['Matemáticas', 'Comunicación', 'Inglés', 'Arte', 'Educación Física', 'Historia', 'Química', 'Física Clásica'];
    const DOCENTES_POOL = [
        { name: 'Prof. García', dni: '74852136' }, { name: 'Prof. Quispe', dni: '70482135' },
        { name: 'Prof. Torres', dni: '72341198' }, { name: 'Prof. Vargas', dni: '73456789' },
        { name: 'Prof. Romero', dni: '75012378' }, { name: 'Prof. Delgado', dni: '71234567' },
        { name: 'Prof. Mendoza', dni: '76543210' }, { name: 'Prof. Suárez', dni: '77654321' },
        { name: 'Prof. Llanos', dni: '78901234' },
    ];
    const INIT_HORARIO = {
        '0-0': { subject: 'Matemáticas', room: 'Aula 201', teacher: 'Prof. García' },
        '0-2': { subject: 'Inglés', room: 'Lab. Idiom', teacher: 'Prof. Torres' },
        '0-4': { subject: 'Ed. Física', room: 'Gimnasio', teacher: 'Prof. Romero' },
        '1-1': { subject: 'Comunicación', room: 'Aula 202', teacher: 'Prof. Quispe' },
        '1-3': { subject: 'Arte', room: 'Taller A', teacher: 'Prof. Vargas' },
        '2-0': { subject: 'Historia', room: 'Aula 202', teacher: 'Prof. Mendoza' },
        '2-2': { subject: 'Matemáticas', room: 'Aula 201', teacher: 'Prof. García' },
        '3-1': { subject: 'Química', room: 'Lab. Cien', teacher: 'Prof. Llanos' },
        '3-4': { subject: 'Geografía', room: 'Aula 203', teacher: 'Prof. Suárez' },
        '4-0': { subject: 'Biología', room: 'Lab. Cien', teacher: 'Prof. Llanos' },
        '5-2': { subject: 'Historia', room: 'Aula 202', teacher: 'Prof. Mendoza' },
        '5-4': { subject: 'Arte', room: 'Taller A', teacher: 'Prof. Vargas' },
    };
    const EA = { teacherQ: '', teacherName: '', aula: '', curso: '' };
    const [viewMode, setViewMode] = useState('seccion');
    const [grade, setGrade] = useState('4to Secundaria');
    const [section, setSection] = useState('B');
    const [teacherQ, setTeacherQ] = useState('');
    const [teacherRes, setTeacherRes] = useState([]);
    const [selTeacher, setSelTeacher] = useState(null);
    const [schedLoaded, setSchedLoaded] = useState(true);
    const [schedTitle, setSchedTitle] = useState('4to Grado B');
    const [horario, setHorario] = useState(INIT_HORARIO);
    const [assignOpen, setAssignOpen] = useState(false);
    const [assignSlot, setAssignSlot] = useState(null);
    const [assignForm, setAssignForm] = useState(EA);
    const [assignDocRes, setAssignDocRes] = useState([]);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [attachOpen, setAttachOpen] = useState(false);
    const [attachFile, setAttachFile] = useState(null);
    const [toast, setToast] = useState(null);
    const showToast = (msg, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3200); };
    const searchDoc = (q, set) => {
        if (q.length < 2) {
            set([]);
            return;
        }
        set(DOCENTES_POOL.filter(d => d.name.toLowerCase().includes(q.toLowerCase()) || d.dni.includes(q)));
    };
    const handleVerHorario = () => {
        if (viewMode === 'seccion') {
            setSchedTitle(`${grade.replace(' Secundaria', '')} Grado ${section}`);
        }
        else {
            if (!selTeacher)
                return;
            setSchedTitle(selTeacher.name);
        }
        setSchedLoaded(true);
    };
    const openAssign = (si, di) => { setAssignSlot({ si, di, day: DAYS[di], hour: HOUR_SLOTS[si] }); setAssignForm(EA); setAssignDocRes([]); setAssignOpen(true); };
    const openDelete = (si, di, card) => { setDeleteTarget({ si, di, card }); setDeleteOpen(true); };
    const handleGuardar = () => {
        if (!assignSlot || !assignForm.teacherName || !assignForm.aula || !assignForm.curso)
            return;
        setHorario(h => ({ ...h, [`${assignSlot.si}-${assignSlot.di}`]: { subject: assignForm.curso, room: assignForm.aula, teacher: assignForm.teacherName } }));
        setAssignOpen(false);
        showToast('Bloque de horario asignado correctamente.');
    };
    const handleEliminar = () => {
        if (!deleteTarget)
            return;
        setHorario(h => { const n = { ...h }; delete n[`${deleteTarget.si}-${deleteTarget.di}`]; return n; });
        setDeleteOpen(false);
        showToast('Bloque de horario eliminado.');
    };
    const assignValid = !!(assignForm.teacherName && assignForm.aula && assignForm.curso);
    const verValid = viewMode === 'seccion' || !!selTeacher;
    return (<div>
      {/* Toast */}
      {toast && (<div style={{ position: 'fixed', top: 20, right: 24, zIndex: 99999, display: 'flex', alignItems: 'center', gap: 8, padding: '11px 18px', borderRadius: 8, background: toast.ok ? '#16a34a' : '#ba1a1a', color: '#fff', fontSize: 13, fontWeight: 600, boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
          {toast.ok ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg> : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>}
          {toast.msg}
        </div>)}
      <nav style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
        {['Inicio', 'Gestión', 'Horarios'].map((crumb, i, arr) => (<span key={crumb} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, color: i === arr.length - 1 ? '#00236f' : '#94a3b8', fontWeight: i === arr.length - 1 ? 600 : 400 }}>{crumb}</span>
            {i < arr.length - 1 && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>}
          </span>))}
      </nav>

      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 4 }}>Año Escolar 2026</div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>
          Matriz de Horarios — <span style={{ color: '#0058be' }}>{schedTitle}</span>
        </h1>
      </div>

      {/* Controls card */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '16px 20px', marginBottom: 20, display: 'flex', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap', boxShadow: '0 1px 4px rgba(0,35,111,0.04)' }}>
        {/* View mode toggles */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Modo de vista</label>
          <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', border: '1.5px solid #e2e8f0' }}>
            {['seccion', 'docente'].map((mode, i) => (<button key={mode} onClick={() => { setViewMode(mode); setSchedLoaded(false); setSelTeacher(null); setTeacherQ(''); setTeacherRes([]); }} style={{ padding: '8px 18px', border: 'none', borderLeft: i > 0 ? '1.5px solid #e2e8f0' : 'none', background: viewMode === mode ? '#00236f' : '#f8f9ff', color: viewMode === mode ? '#fff' : '#64748b', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}>
                {viewMode === mode && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                {mode === 'seccion' ? 'Ver por sección' : 'Ver por docente'}
              </button>))}
          </div>
        </div>
        <div style={{ width: 1, height: 48, background: '#e2e8f0', flexShrink: 0 }}/>
        {/* Section selectors */}
        {viewMode === 'seccion' && <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Grado</label>
            <div style={{ position: 'relative' }}>
              <select value={grade} onChange={e => { setGrade(e.target.value); setSchedLoaded(false); }} style={{ appearance: 'none', background: '#fff', border: '1px solid #d1d5db', borderRadius: 8, padding: '9px 36px 9px 14px', fontSize: 13, fontWeight: 500, color: '#1e293b', cursor: 'pointer', outline: 'none', fontFamily: 'inherit', minWidth: 180 }}>
                {['1ro Secundaria', '2do Secundaria', '3ro Secundaria', '4to Secundaria', '5to Secundaria'].map(g => <option key={g}>{g}</option>)}
              </select>
              <svg style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Sección</label>
            <div style={{ position: 'relative' }}>
              <select value={section} onChange={e => { setSection(e.target.value); setSchedLoaded(false); }} style={{ appearance: 'none', background: '#fff', border: '1px solid #d1d5db', borderRadius: 8, padding: '9px 36px 9px 14px', fontSize: 13, fontWeight: 500, color: '#1e293b', cursor: 'pointer', outline: 'none', fontFamily: 'inherit', minWidth: 100 }}>
                {['A', 'B', 'C', 'D'].map(s => <option key={s}>{s}</option>)}
              </select>
              <svg style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
          </div>
        </>}
        {/* Docente search */}
        {viewMode === 'docente' && (<div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 280 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Buscar docente</label>
            <div style={{ position: 'relative' }}>
              <input value={teacherQ} onChange={e => { setTeacherQ(e.target.value); searchDoc(e.target.value, setTeacherRes); setSelTeacher(null); }} placeholder="Buscar docente por nombre o DNI..." style={{ width: '100%', padding: '9px 14px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13, color: '#1e293b', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}/>
              {teacherRes.length > 0 && (<div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.1)', zIndex: 50, overflow: 'hidden' }}>
                  {teacherRes.map(d => (<button key={d.dni} onClick={() => { setSelTeacher(d); setTeacherQ(d.name); setTeacherRes([]); }} style={{ width: '100%', padding: '9px 14px', border: 'none', background: '#fff', textAlign: 'left', fontSize: 13, color: '#1e293b', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', justifyContent: 'space-between' }} onMouseEnter={e => e.currentTarget.style.background = '#f8f9ff'} onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                      <span>{d.name}</span><span style={{ fontSize: 11, color: '#94a3b8' }}>DNI: {d.dni}</span>
                    </button>))}
                </div>)}
            </div>
            {selTeacher && (<div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: '#f0f4ff', border: '1px solid #bfdbfe', borderRadius: 7, fontSize: 12 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0058be" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                <span style={{ fontWeight: 600, color: '#00236f' }}>{selTeacher.name}</span>
                <span style={{ color: '#64748b' }}>DNI: {selTeacher.dni}</span>
              </div>)}
          </div>)}
        {/* Ver horario button */}
        <button onClick={handleVerHorario} disabled={!verValid} style={{ height: 40, padding: '0 22px', borderRadius: 8, border: 'none', background: verValid ? '#0058be' : '#e2e8f0', color: verValid ? '#fff' : '#94a3b8', fontSize: 13, fontWeight: 700, cursor: verValid ? 'pointer' : 'not-allowed', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0, alignSelf: 'flex-end' }} onMouseEnter={e => { if (verValid)
        e.currentTarget.style.background = '#0047a3'; }} onMouseLeave={e => { if (verValid)
        e.currentTarget.style.background = '#0058be'; }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          Ver horario
        </button>
      </div>

      {/* Schedule matrix */}
      {schedLoaded && (<div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,35,111,0.05)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '90px repeat(5, 1fr)', borderBottom: '2px solid #e2e8f0' }}>
            <div style={{ padding: '12px 14px', background: '#f8f9ff', borderRight: '1px solid #e8eaf0' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.07em', textTransform: 'uppercase' }}>Hora</span>
            </div>
            {DAYS.map((day, di) => (<div key={day} style={{ padding: '12px 0', textAlign: 'center', background: di === 0 ? '#f0f4ff' : '#f8f9ff', borderRight: di < DAYS.length - 1 ? '1px solid #e8eaf0' : 'none', borderLeft: di === 0 ? '1px solid #e8eaf0' : 'none' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: di === 0 ? '#00236f' : '#374151' }}>{day}</div>
                <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2, fontWeight: 500 }}>{['Sep 21', 'Sep 22', 'Sep 23', 'Sep 24', 'Sep 25'][di]}</div>
              </div>))}
          </div>
          {HOUR_SLOTS.map((hour, si) => (<React.Fragment key={hour}>
              <div style={{ display: 'grid', gridTemplateColumns: '90px repeat(5, 1fr)', borderBottom: '1px solid #e8eaf0', minHeight: 86 }}>
                <div style={{ padding: '10px 10px 10px 14px', background: '#f8f9ff', borderRight: '1px solid #e8eaf0', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>{hour}</span>
                  <span style={{ fontSize: 10, color: '#c7d2e0', marginTop: 3 }}>→ {HOUR_SLOTS[si + 1] ?? '14:00'}</span>
                </div>
                {DAYS.map((day, di) => {
                    const card = horario[`${si}-${di}`];
                    return (<div key={day} style={{ padding: '8px', borderRight: di < DAYS.length - 1 ? '1px solid #e8eaf0' : 'none', borderLeft: di === 0 ? '1px solid #e8eaf0' : 'none', background: card?.conflict ? '#fff5f5' : 'transparent' }}>
                      {card ? <ScheduleCard card={card} onClick={() => openDelete(si, di, card)}/> : <EmptyCell onClick={() => openAssign(si, di)}/>}
                    </div>);
                })}
              </div>
              {si === BREAK_AFTER && (<div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', borderBottom: '1px dashed #e2e8f0', borderTop: '1px dashed #e2e8f0', background: '#fdfcf4' }}>
                  <div style={{ padding: '7px 14px', borderRight: '1px solid #e8eaf0', display: 'flex', alignItems: 'center' }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase' }}>10:30–11:00</span>
                  </div>
                  <div style={{ padding: '7px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 14 }}>☕</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#92400e', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Recreo / Descanso</span>
                  </div>
                </div>)}
            </React.Fragment>))}
        </div>)}

      {/* Legend + Adjuntar archivo */}
      {schedLoaded && (<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginTop: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '10px 16px', background: '#fff', borderRadius: 8, border: '1px solid #e8eaf0' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Leyenda:</span>
            {[{ color: '#eff6ff', border: '#bfdbfe', text: 'Clase asignada' }, { color: '#fff5f5', border: '#ba1a1a', text: 'Conflicto detectado', bold: true }, { color: '#f8f9ff', border: '#e2e8f0', text: 'Bloque libre' }].map(l => (<div key={l.text} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 14, height: 14, borderRadius: 3, background: l.color, border: `1.5px solid ${l.border}` }}/>
                <span style={{ fontSize: 12, color: l.bold ? '#ba1a1a' : '#64748b', fontWeight: l.bold ? 700 : 400 }}>{l.text}</span>
              </div>))}
          </div>
          <button onClick={() => setAttachOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 8, border: '1.5px solid #e2e8f0', background: '#fff', color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }} onMouseEnter={e => { e.currentTarget.style.borderColor = '#0058be'; e.currentTarget.style.color = '#0058be'; }} onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#374151'; }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
            Adjuntar archivo
          </button>
        </div>)}

      {/* ── MODAL: ASIGNAR HORARIO ── */}
      {assignOpen && assignSlot && (<div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 24 }} onClick={e => { if (e.target === e.currentTarget)
            setAssignOpen(false); }}>
          <div style={{ background: '#fff', borderRadius: 12, width: '100%', maxWidth: 520, boxShadow: '0 24px 64px rgba(0,0,0,0.22)', display: 'flex', flexDirection: 'column', maxHeight: '92vh', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px 14px', borderBottom: '1px solid #f1f4f9', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>Asignar horario</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 999, background: '#eff4ff', border: '1px solid #bfdbfe', fontSize: 11, fontWeight: 600, color: '#0058be' }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    {assignSlot.day}
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 999, background: '#f8f9ff', border: '1px solid #e2e8f0', fontSize: 11, fontWeight: 600, color: '#475569' }}>
                    🕐 {assignSlot.hour}
                  </span>
                </div>
              </div>
              <button onClick={() => setAssignOpen(false)} style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid #e5e7eb', background: '#f8f9ff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#64748b', flexShrink: 0 }}>✕</button>
            </div>
            <div style={{ padding: '18px 24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Docente <span style={{ color: '#ba1a1a' }}>*</span></label>
                <div style={{ position: 'relative' }}>
                  <input value={assignForm.teacherQ} onChange={e => { setAssignForm(p => ({ ...p, teacherQ: e.target.value, teacherName: '' })); searchDoc(e.target.value, setAssignDocRes); }} placeholder="Buscar docente por nombre o DNI..." style={{ width: '100%', padding: '9px 13px', border: '1.5px solid #dde2f0', borderRadius: 8, background: '#f8f9ff', fontSize: 13, color: '#121c2a', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} onFocus={e => e.currentTarget.style.borderColor = '#0058be'} onBlur={e => e.currentTarget.style.borderColor = '#dde2f0'}/>
                  {assignDocRes.length > 0 && (<div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.1)', zIndex: 60, overflow: 'hidden' }}>
                      {assignDocRes.map(d => (<button key={d.dni} onClick={() => { setAssignForm(p => ({ ...p, teacherQ: d.name, teacherName: d.name })); setAssignDocRes([]); }} style={{ width: '100%', padding: '9px 14px', border: 'none', background: '#fff', textAlign: 'left', fontSize: 13, color: '#1e293b', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', justifyContent: 'space-between' }} onMouseEnter={e => e.currentTarget.style.background = '#f8f9ff'} onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                          <span>{d.name}</span><span style={{ fontSize: 11, color: '#94a3b8' }}>DNI: {d.dni}</span>
                        </button>))}
                    </div>)}
                </div>
                {assignForm.teacherName && (<div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 7, padding: '6px 12px', background: '#f0f4ff', border: '1px solid #bfdbfe', borderRadius: 7, fontSize: 12 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0058be" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                    <span style={{ fontWeight: 600, color: '#00236f' }}>Docente seleccionado: {assignForm.teacherName}</span>
                  </div>)}
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Aula <span style={{ color: '#ba1a1a' }}>*</span></label>
                <div style={{ position: 'relative' }}>
                  <select value={assignForm.aula} onChange={e => setAssignForm(p => ({ ...p, aula: e.target.value }))} style={{ appearance: 'none', WebkitAppearance: 'none', width: '100%', padding: '9px 36px 9px 13px', borderRadius: 8, border: '1.5px solid #dde2f0', background: '#f8f9ff', fontSize: 13, color: assignForm.aula ? '#121c2a' : '#94a3b8', fontFamily: 'inherit', outline: 'none', cursor: 'pointer', boxSizing: 'border-box' }} onFocus={e => e.currentTarget.style.borderColor = '#0058be'} onBlur={e => e.currentTarget.style.borderColor = '#dde2f0'}>
                    <option value="">Seleccionar aula...</option>
                    {AULAS_OPTS.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                  <svg style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Curso <span style={{ color: '#ba1a1a' }}>*</span></label>
                <div style={{ position: 'relative' }}>
                  <select value={assignForm.curso} onChange={e => setAssignForm(p => ({ ...p, curso: e.target.value }))} style={{ appearance: 'none', WebkitAppearance: 'none', width: '100%', padding: '9px 36px 9px 13px', borderRadius: 8, border: '1.5px solid #dde2f0', background: '#f8f9ff', fontSize: 13, color: assignForm.curso ? '#121c2a' : '#94a3b8', fontFamily: 'inherit', outline: 'none', cursor: 'pointer', boxSizing: 'border-box' }} onFocus={e => e.currentTarget.style.borderColor = '#0058be'} onBlur={e => e.currentTarget.style.borderColor = '#dde2f0'}>
                    <option value="">Seleccionar curso...</option>
                    {CURSOS_OPTS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <svg style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
                </div>
              </div>
            </div>
            <div style={{ padding: '12px 24px', borderTop: '1px solid #f1f4f9', display: 'flex', justifyContent: 'flex-end', gap: 10, background: '#fafbff', flexShrink: 0 }}>
              <button onClick={() => setAssignOpen(false)} style={{ padding: '9px 20px', borderRadius: 6, border: '1.5px solid #cbd5e1', background: '#fff', color: '#475569', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }} onMouseEnter={e => e.currentTarget.style.background = '#f8f9ff'} onMouseLeave={e => e.currentTarget.style.background = '#fff'}>Cancelar</button>
              <button onClick={handleGuardar} disabled={!assignValid} style={{ padding: '9px 22px', borderRadius: 6, border: 'none', background: assignValid ? '#00236f' : '#e2e8f0', color: assignValid ? '#fff' : '#94a3b8', fontSize: 13, fontWeight: 600, cursor: assignValid ? 'pointer' : 'not-allowed', fontFamily: 'inherit', boxShadow: assignValid ? '0 2px 8px rgba(0,35,111,0.24)' : 'none' }} onMouseEnter={e => { if (assignValid)
            e.currentTarget.style.background = '#001d5a'; }} onMouseLeave={e => { if (assignValid)
            e.currentTarget.style.background = '#00236f'; }}>Guardar cambios</button>
            </div>
          </div>
        </div>)}

      {/* ── MODAL: ELIMINAR HORARIO ── */}
      {deleteOpen && deleteTarget && (<div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 24 }} onClick={e => { if (e.target === e.currentTarget)
            setDeleteOpen(false); }}>
          <div style={{ background: '#fff', borderRadius: 12, width: '100%', maxWidth: 440, boxShadow: '0 24px 64px rgba(0,0,0,0.22)', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px 14px', borderBottom: '1px solid #f1f4f9', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#fff1f1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <WarningIcon size={18} color="#ba1a1a"/>
                </div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: 0 }}>Eliminar horario</h2>
              </div>
              <button onClick={() => setDeleteOpen(false)} style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid #e5e7eb', background: '#f8f9ff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#64748b' }}>✕</button>
            </div>
            <div style={{ padding: '18px 24px' }}>
              <p style={{ fontSize: 13, color: '#475569', margin: '0 0 14px', lineHeight: 1.6 }}>¿Está seguro de que desea eliminar este bloque de horario?</p>
              <div style={{ background: '#f8f9ff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[['Curso', deleteTarget.card.subject], ['Aula', deleteTarget.card.room], ['Docente', deleteTarget.card.teacher]].map(([l, v]) => (<div key={l} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, minWidth: 60 }}>{l}:</span>
                    <span style={{ fontSize: 13, color: '#1e293b', fontWeight: 600 }}>{v}</span>
                  </div>))}
              </div>
            </div>
            <div style={{ padding: '12px 24px', borderTop: '1px solid #f1f4f9', display: 'flex', justifyContent: 'flex-end', gap: 10, background: '#fafbff' }}>
              <button onClick={() => setDeleteOpen(false)} style={{ padding: '9px 20px', borderRadius: 6, border: '1.5px solid #cbd5e1', background: '#fff', color: '#475569', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }} onMouseEnter={e => e.currentTarget.style.background = '#f8f9ff'} onMouseLeave={e => e.currentTarget.style.background = '#fff'}>Cancelar</button>
              <button onClick={handleEliminar} style={{ padding: '9px 22px', borderRadius: 6, border: 'none', background: '#ba1a1a', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 2px 8px rgba(186,26,26,0.28)' }} onMouseEnter={e => e.currentTarget.style.background = '#991b1b'} onMouseLeave={e => e.currentTarget.style.background = '#ba1a1a'}>Eliminar</button>
            </div>
          </div>
        </div>)}

      {/* ── MODAL: ADJUNTAR ARCHIVO ── */}
      {attachOpen && (<div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 24 }} onClick={e => { if (e.target === e.currentTarget) {
            setAttachOpen(false);
            setAttachFile(null);
        } }}>
          <div style={{ background: '#fff', borderRadius: 12, width: '100%', maxWidth: 500, boxShadow: '0 24px 64px rgba(0,0,0,0.22)', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px 14px', borderBottom: '1px solid #f1f4f9', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>Adjuntar horarios</h2>
                {viewMode === 'seccion' && (<div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 6, background: '#f0f4ff', border: '1px solid #bfdbfe', fontSize: 11, fontWeight: 500, color: '#0058be' }}>
                    Se cargarán horarios para: <strong style={{ marginLeft: 4 }}>{grade} — Sección {section}</strong>
                  </div>)}
              </div>
              <button onClick={() => { setAttachOpen(false); setAttachFile(null); }} style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid #e5e7eb', background: '#f8f9ff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#64748b', flexShrink: 0 }}>✕</button>
            </div>
            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <p style={{ fontSize: 13, color: '#64748b', margin: 0, lineHeight: 1.6 }}>Adjunte un archivo CSV o XLSX para registrar varios bloques de horario para una sección.</p>
              <label style={{ border: '2px dashed #d1d9ee', borderRadius: 10, padding: '28px', textAlign: 'center', background: '#f8f9ff', cursor: 'pointer', display: 'block', position: 'relative' }} onMouseEnter={e => e.currentTarget.style.borderColor = '#0058be'} onMouseLeave={e => e.currentTarget.style.borderColor = '#d1d9ee'}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#0058be" strokeWidth="1.5" strokeLinecap="round" style={{ marginBottom: 10 }}><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Seleccionar archivo</div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>Formatos aceptados: <strong>CSV</strong>, <strong>XLSX</strong></div>
                <input type="file" accept=".csv,.xlsx" onChange={e => {
                const f = e.target.files?.[0];
                if (!f)
                    return;
                const ext = f.name.split('.').pop()?.toLowerCase() ?? '';
                if (!['csv', 'xlsx'].includes(ext)) {
                    showToast('Formato no válido. Use CSV o XLSX.', false);
                    return;
                }
                setAttachFile({ name: f.name, size: f.size, ext });
            }} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}/>
              </label>
              {attachFile && (<div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#166534' }}>{attachFile.name}</div>
                    <div style={{ fontSize: 11, color: '#16a34a' }}>{attachFile.ext.toUpperCase()} · {(attachFile.size / 1024).toFixed(1)} KB</div>
                  </div>
                  <button onClick={() => setAttachFile(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 16 }}>✕</button>
                </div>)}
            </div>
            <div style={{ padding: '12px 24px', borderTop: '1px solid #f1f4f9', display: 'flex', justifyContent: 'flex-end', gap: 10, background: '#fafbff' }}>
              <button onClick={() => { setAttachOpen(false); setAttachFile(null); }} style={{ padding: '9px 20px', borderRadius: 6, border: '1.5px solid #cbd5e1', background: '#fff', color: '#475569', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>Cancelar</button>
              <button disabled={!attachFile} onClick={() => { setAttachOpen(false); setAttachFile(null); showToast('Horarios cargados correctamente.'); }} style={{ padding: '9px 22px', borderRadius: 6, border: 'none', background: attachFile ? '#00236f' : '#e2e8f0', color: attachFile ? '#fff' : '#94a3b8', fontSize: 13, fontWeight: 600, cursor: attachFile ? 'pointer' : 'not-allowed', fontFamily: 'inherit' }} onMouseEnter={e => { if (attachFile)
            e.currentTarget.style.background = '#001d5a'; }} onMouseLeave={e => { if (attachFile)
            e.currentTarget.style.background = '#00236f'; }}>Cargar horarios</button>
            </div>
          </div>
        </div>)}
    </div>);
}
function ScheduleCard({ card, onClick }) {
    const isConflict = !!card.conflict;
    return (<div onClick={onClick} style={{ borderRadius: 8, border: isConflict ? '2px solid #ba1a1a' : '1.5px solid #bfdbfe', background: isConflict ? '#fff1f2' : '#eff6ff', padding: '10px 12px', height: '100%', minHeight: 68, display: 'flex', flexDirection: 'column', gap: isConflict ? 6 : 8, boxShadow: isConflict ? '0 0 0 3px rgba(186,26,26,0.08)' : '0 1px 3px rgba(0,88,190,0.06)', position: 'relative', overflow: 'hidden', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.opacity = '0.85'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
      {isConflict && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: '#ba1a1a', borderRadius: '6px 6px 0 0' }}/>}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 4, marginTop: isConflict ? 4 : 0 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: isConflict ? '#ba1a1a' : '#0058be', lineHeight: '1.3', letterSpacing: '-0.01em' }}>{card.subject}</span>
        {isConflict && <WarningIcon size={14} color="#ba1a1a"/>}
      </div>
      {isConflict && (<div style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#ba1a1a', borderRadius: 5, padding: '4px 8px' }}>
          <WarningIcon size={11} color="#fff"/>
          <span style={{ fontSize: 10, fontWeight: 800, color: '#fff', letterSpacing: '0.01em' }}>⚠ Conflicto de aula</span>
        </div>)}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <DoorIcon size={10} color={isConflict ? '#991b1b' : '#3b82f6'}/>
          <span style={{ fontSize: 10, color: isConflict ? '#991b1b' : '#3b82f6', fontWeight: 600 }}>{card.room}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <PersonIcon size={10} color={isConflict ? '#b45309' : '#64748b'}/>
          <span style={{ fontSize: 10, color: isConflict ? '#7c2d12' : '#64748b', fontWeight: 500 }}>{card.teacher}</span>
        </div>
      </div>
    </div>);
}
function EmptyCell({ onClick }) {
    return (<div onClick={onClick} style={{ height: '100%', minHeight: 68, borderRadius: 8, border: '1.5px dashed #c7d2e6', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'border-color 0.12s, background 0.12s' }} onMouseEnter={e => { e.currentTarget.style.borderColor = '#0058be'; e.currentTarget.style.background = '#f0f7ff'; }} onMouseLeave={e => { e.currentTarget.style.borderColor = '#c7d2e6'; e.currentTarget.style.background = 'transparent'; }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0058be" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        <span style={{ fontSize: 11, color: '#0058be', fontWeight: 700, letterSpacing: '0.01em' }}>+ Asignar</span>
      </div>
    </div>);
}
/* ═══════════════════════════════════════════════════════════
   ATTENDANCE VIEW
══════════════════════════════════════════════════════════════ */
function AttendanceView() {
    const [students, setStudents] = useState(INITIAL_STUDENTS);
    const [saved, setSaved] = useState(false);
    const [saving, setSaving] = useState(false);
    const [filterStatus, setFilterStatus] = useState('ALL');
    const counts = {
        P: students.filter(s => s.status === 'P').length,
        T: students.filter(s => s.status === 'T').length,
        F: students.filter(s => s.status === 'F').length,
    };
    const total = students.length;
    const pct = Math.round((counts.P / total) * 100);
    const setStatus = (id, status) => {
        setSaved(false);
        setStudents(prev => prev.map(s => s.id === id ? { ...s, status } : s));
    };
    const handleSave = () => {
        setSaving(true);
        setTimeout(() => { setSaving(false); setSaved(true); }, 900);
    };
    const visible = filterStatus === 'ALL' ? students : students.filter(s => s.status === filterStatus);
    return (<div>
      <nav style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
        {['Inicio', 'Asistencia', 'Registro Diario'].map((crumb, i, arr) => (<span key={crumb} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, color: i === arr.length - 1 ? '#00236f' : '#94a3b8', fontWeight: i === arr.length - 1 ? 600 : 400 }}>{crumb}</span>
            {i < arr.length - 1 && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>}
          </span>))}
      </nav>

      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 4 }}>Módulo Docente</div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>Control de Asistencia de Estudiantes</h1>
      </div>

      <div style={{ background: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', padding: '16px 24px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 0, boxShadow: '0 1px 4px rgba(0,35,111,0.05)' }}>
        <div style={{ width: 4, height: 56, background: 'linear-gradient(to bottom, #0058be, #3b82f6)', borderRadius: 2, marginRight: 20, flexShrink: 0 }}/>
        <div style={{ display: 'flex', alignItems: 'center', gap: 40, flex: 1 }}>
          {[
            { label: 'Materia / Clase', value: 'Matemáticas — 4to Grado B', icon: <ClipboardIcon size={14} color="#3b82f6"/> },
            { label: 'Fecha', value: '15 de marzo de 2026', icon: <CalendarCheckIcon size={14} color="#3b82f6"/> },
            { label: 'Hora de inicio', value: '08:00 — 09:30', icon: <ClockIcon size={14} color="#3b82f6"/> },
        ].map(item => (<div key={item.label} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                {item.icon}
                <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.07em', textTransform: 'uppercase' }}>{item.label}</span>
              </div>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>{item.value}</span>
            </div>))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, marginLeft: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b' }}>Registro completado</span>
            <span style={{ fontSize: 18, fontWeight: 800, color: pct === 100 ? '#16a34a' : '#0058be' }}>{pct}%</span>
          </div>
          <div style={{ width: 180, height: 6, background: '#f1f4f9', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? '#16a34a' : '#0058be', borderRadius: 999, transition: 'width 0.4s ease' }}/>
          </div>
          <span style={{ fontSize: 11, color: '#94a3b8' }}>{counts.P + counts.T + counts.F} de {total} registrados</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        {[['ALL', 'Todos', total, '#64748b', '#f8f9ff', '#e2e8f0']].concat([
            ['P', 'Presentes', counts.P, '#16a34a', '#f0fdf4', '#bbf7d0'],
            ['T', 'Tardanzas', counts.T, '#d97706', '#fffbeb', '#fde68a'],
            ['F', 'Faltas', counts.F, '#ba1a1a', '#fff1f1', '#fecaca'],
        ]).map(([key, label, count, color, bg, border]) => {
            const active = filterStatus === key;
            return (<button key={key} onClick={() => setFilterStatus(key)} style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '6px 14px', borderRadius: 999, border: `1px solid ${active ? border : '#e2e8f0'}`,
                    background: active ? bg : '#ffffff', cursor: 'pointer', fontFamily: 'inherit',
                    color: active ? color : '#64748b', fontWeight: active ? 700 : 500, fontSize: 12, transition: 'all 0.12s',
                }}>
              {label}
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 18, height: 18, borderRadius: 999, background: active ? color : '#f1f4f9', color: active ? '#fff' : '#64748b', fontSize: 10, fontWeight: 700 }}>
                {count}
              </span>
            </button>);
        })}
        <div style={{ flex: 1 }}/>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>Marcar todos:</span>
          {['P', 'T', 'F'].map(s => (<button key={s} onClick={() => { setSaved(false); setStudents(prev => prev.map(st => ({ ...st, status: s }))); }} style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid', fontFamily: 'inherit', fontSize: 11, fontWeight: 700, cursor: 'pointer', background: STATUS_PILL[s].bg, color: STATUS_PILL[s].text, borderColor: STATUS_PILL[s].border }}>
              {STATUS_LABELS[s]}
            </button>))}
        </div>
      </div>

      <div style={{ background: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden', marginBottom: 0, boxShadow: '0 1px 4px rgba(0,35,111,0.04)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '52px 1fr 300px 140px', background: '#f8f9ff', borderBottom: '2px solid #e8eaf0', padding: '0 24px' }}>
          {['#', 'ESTUDIANTE', 'ESTADO DE ASISTENCIA', ''].map((col, i) => (<div key={i} style={{ padding: '11px 0', fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: '0.07em', textTransform: 'uppercase', textAlign: i === 2 ? 'center' : 'left' }}>{col}</div>))}
        </div>
        {visible.map((student, idx) => {
            const rowBg = student.status === 'F' ? '#fff8f8' : student.status === 'T' ? '#fffdf5' : 'transparent';
            return (<div key={student.id} style={{ display: 'grid', gridTemplateColumns: '52px 1fr 300px 140px', padding: '0 24px', borderBottom: idx < visible.length - 1 ? '1px solid #f1f4f9' : 'none', background: rowBg, transition: 'background 0.12s', alignItems: 'center', minHeight: 68 }} onMouseEnter={e => { if (student.status !== 'F' && student.status !== 'T')
                e.currentTarget.style.background = '#fafbff'; }} onMouseLeave={e => e.currentTarget.style.background = rowBg}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8' }}>{student.num}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', flexShrink: 0, background: `hsl(${student.hue},65%,88%)`, border: `2px solid hsl(${student.hue},55%,75%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: `hsl(${student.hue},60%,30%)` }}>
                  {student.initials}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{student.name}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1, fontWeight: 500 }}>{student.studentId}</div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <SegmentedControl value={student.status} onChange={val => setStatus(student.id, val)}/>
              </div>
              <div>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 12px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: STATUS_PILL[student.status].bg, color: STATUS_PILL[student.status].text, border: `1px solid ${STATUS_PILL[student.status].border}` }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: STATUS_PILL[student.status].text }}/>
                  {STATUS_LABELS[student.status]}
                </span>
              </div>
            </div>);
        })}
      </div>

      <div style={{ marginTop: 12, background: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 0, boxShadow: '0 -2px 8px rgba(0,35,111,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginRight: 4 }}>Resumen:</span>
          {[
            { label: 'Presentes', count: counts.P, dot: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', text: '#15803d' },
            { label: 'Tardanzas', count: counts.T, dot: '#d97706', bg: '#fffbeb', border: '#fde68a', text: '#b45309' },
            { label: 'Faltas', count: counts.F, dot: '#ba1a1a', bg: '#fff1f1', border: '#fecaca', text: '#991b1b' },
        ].map(item => (<div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 999, background: item.bg, border: `1px solid ${item.border}` }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.dot, display: 'inline-block' }}/>
              <span style={{ fontSize: 13, fontWeight: 700, color: item.text }}>{item.count}</span>
              <span style={{ fontSize: 12, color: item.text, fontWeight: 500 }}>{item.label}</span>
            </div>))}
          <div style={{ width: 1, height: 24, background: '#e2e8f0', margin: '0 8px' }}/>
          <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>Total: <strong style={{ color: '#374151' }}>{total} alumnos</strong></span>
        </div>
        <div style={{ flex: 1 }}/>
        {saved && (<div style={{ display: 'flex', alignItems: 'center', gap: 6, marginRight: 16, padding: '6px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#16a34a' }}>Asistencia guardada correctamente</span>
          </div>)}
        <button onClick={handleSave} disabled={saving} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px', borderRadius: 8, border: 'none',
            background: saving ? '#3b82f6' : '#0058be', color: 'white', fontSize: 13, fontWeight: 700,
            cursor: saving ? 'wait' : 'pointer', fontFamily: 'inherit',
            boxShadow: '0 2px 8px rgba(0,88,190,0.3)', transition: 'background 0.15s, box-shadow 0.15s', opacity: saving ? 0.85 : 1,
        }}>
          {saving
            ? <><svg style={{ animation: 'spin 0.8s linear infinite' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>Guardando...</>
            : <>Guardar Asistencia<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg></>}
        </button>
      </div>
    </div>);
}
function SegmentedControl({ value, onChange }) {
    const opts = [
        { key: 'P', label: 'P', activeColor: '#15803d', activeBg: '#f0fdf4', activeBorder: '#86efac' },
        { key: 'T', label: 'T', activeColor: '#b45309', activeBg: '#fffbeb', activeBorder: '#fde68a' },
        { key: 'F', label: 'F', activeColor: '#991b1b', activeBg: '#fff1f1', activeBorder: '#fca5a5' },
    ];
    const fullLabels = { P: 'Presente', T: 'Tardanza', F: 'Falta' };
    return (<div style={{ display: 'flex', background: '#f1f4f9', borderRadius: 8, padding: 3, gap: 3 }}>
      {opts.map(({ key, label, activeColor, activeBg, activeBorder }) => {
            const active = value === key;
            const cfg = { activeColor, activeBg, activeBorder };
            return (<button key={key} onClick={() => onChange(key)} style={{
                    padding: '5px 16px', borderRadius: 6, border: `1px solid ${active ? cfg.activeBorder : 'transparent'}`,
                    background: active ? cfg.activeBg : 'transparent',
                    color: active ? cfg.activeColor : '#94a3b8',
                    fontSize: 12, fontWeight: active ? 800 : 500, cursor: 'pointer',
                    fontFamily: 'inherit', transition: 'all 0.12s', position: 'relative',
                }} title={fullLabels[key]} onMouseEnter={e => { if (!active)
                e.currentTarget.style.background = '#f1f5f9'; }} onMouseLeave={e => { if (!active)
                e.currentTarget.style.background = 'transparent'; }}>
            {active && <span style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: cfg.activeColor, borderRadius: '0 0 2px 2px' }}/>}
            {key}
          </button>);
        })}
    </div>);
}
/* ═══════════════════════════════════════════════════════════
   TUTOR REPORT CARD VIEW (Teacher/Tutor role)
══════════════════════════════════════════════════════════════ */
const SALON_4B = [
    { id: 's01', num: '01', name: 'Alvarado Torres, Adriana' },
    { id: 's02', num: '02', name: 'Bendezú Paz, Bruno' },
    { id: 's03', num: '03', name: 'Castro Vidal, Claudia' },
    { id: 's04', num: '04', name: 'Díaz Reyes, Daniel' },
    { id: 's05', num: '05', name: 'Espinoza Luna, Elena' },
    { id: 's06', num: '06', name: 'Flores García, Fernando' },
    { id: 's07', num: '07', name: 'García Solis, Gisela' },
    { id: 's08', num: '08', name: 'Mendoza Herrera, Carlos' },
    { id: 's09', num: '09', name: 'Quispe Ramos, Hilda' },
    { id: 's10', num: '10', name: 'Ramírez Cruz, Ivan' },
];
const TUTOR_COMPS = [
    { area: 'Matemáticas', comp: 'Resuelve problemas de cantidad', docente: 'Prof. Carlos García', grade: 'AD' },
    { area: 'Comunicación', comp: 'Se comunica oralmente en L1 y L2', docente: 'Prof. Laura Rivas', grade: 'A' },
    { area: 'Comunicación', comp: 'Lee diversos tipos de textos escritos', docente: 'Prof. Laura Rivas', grade: 'A' },
    { area: 'Historia', comp: 'Construye interpretaciones históricas', docente: 'Prof. R. Torres', grade: 'A' },
    { area: 'Historia', comp: 'Gestiona responsablemente el espacio', docente: 'Prof. R. Torres', grade: 'A' },
    { area: 'Ed. Física', comp: 'Se desenvuelve motrizmente de manera autónoma', docente: 'Prof. M. Romero', grade: 'A' },
    { area: 'Ciencias', comp: 'Indaga mediante métodos científicos', docente: 'Prof. Mario Vera', grade: 'B' },
    { area: 'Ciencias', comp: 'Diseña y construye soluciones tecnológicas', docente: 'Prof. Mario Vera', grade: 'B' },
    { area: 'Arte y Cultura', comp: 'Crea proyectos desde lenguajes artísticos', docente: 'Prof. Ana Morales', grade: 'C' },
];
function TutorGradeBadge({ g }) {
    const c = GRADE_CFG[g];
    return (<span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 36, padding: '3px 10px', borderRadius: 6, border: `1.5px solid ${c.border}`, background: c.bg, color: c.text, fontSize: 13, fontWeight: 800, letterSpacing: '0.03em' }}>{g}</span>);
}
function TutorReportCardView() {
    const [selStudent, setSelStudent] = useState(SALON_4B[7]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [bimestre, setBimestre] = useState('1er Bimestre');
    const [exported, setExported] = useState(false);
    const [firmado, setFirmado] = useState(false);
    const allGrades = TUTOR_COMPS.map(c => c.grade);
    const adCount = allGrades.filter(g => g === 'AD').length;
    const aCount = allGrades.filter(g => g === 'A').length;
    const bCount = allGrades.filter(g => g === 'B').length;
    const cCount = allGrades.filter(g => g === 'C').length;
    const initials = selStudent.name.split(',')[1]?.trim().split(' ').map(p => p[0]).join('').slice(0, 2) ?? 'ES';
    const studentIdx = SALON_4B.findIndex(s => s.id === selStudent.id) + 1;
    const handleExport = () => { setExported(true); setTimeout(() => setExported(false), 2800); };
    const handleFirmar = () => { setFirmado(true); setTimeout(() => setFirmado(false), 3500); };
    return (<div style={{ paddingBottom: 72 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#0058be', marginBottom: 6 }}>Portal del Docente — Área de Tutoría</div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>
            Libreta de Notas — <span style={{ color: '#0058be' }}>{bimestre}</span>
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ position: 'relative' }}>
            <select value={bimestre} onChange={e => setBimestre(e.target.value)} style={{ appearance: 'none', background: '#fff', border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 32px 8px 14px', fontSize: 13, fontWeight: 500, color: '#374151', cursor: 'pointer', outline: 'none', fontFamily: 'inherit' }}>
              {['1er Bimestre', '2do Bimestre', '3er Bimestre', '4to Bimestre'].map(b => <option key={b}>{b}</option>)}
            </select>
            <svg style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
          <button onClick={handleExport} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 18px', borderRadius: 8, fontFamily: 'inherit', background: exported ? '#f0fdf4' : '#fff', border: `1.5px solid ${exported ? '#86efac' : '#d1d5db'}`, color: exported ? '#16a34a' : '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
            {exported
            ? <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>PDF Exportado</>
            : <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>📥 Exportar PDF</>}
          </button>
        </div>
      </div>

      {/* Student selector bar */}
      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', padding: '14px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 4px rgba(0,35,111,0.05)', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #1d4ed8, #60a5fa)', border: '2px solid #bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
            {initials}
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Estudiante seleccionado</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>{selStudent.name}</span>
              <span style={{ fontSize: 12, color: '#64748b', background: '#f1f4f9', border: '1px solid #e2e8f0', borderRadius: 5, padding: '2px 8px', fontWeight: 600 }}>4to Grado "B" — Secundaria</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>Estudiante <strong style={{ color: '#00236f' }}>{String(studentIdx).padStart(2, '0')}</strong> de <strong>32</strong> del salón</span>
          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowDropdown(d => !d)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: '1.5px solid #d1d5db', background: '#f8f9ff', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 600, color: '#374151' }}>
              Seleccionar Estudiante del Salón
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            {showDropdown && (<div style={{ position: 'absolute', right: 0, top: '110%', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, boxShadow: '0 8px 32px rgba(0,0,0,0.14)', minWidth: 280, zIndex: 100, overflow: 'hidden' }}>
                <div style={{ padding: '8px 14px 6px', borderBottom: '1px solid #f1f4f9' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Salón 4to B — {SALON_4B.length} de 32 estudiantes</span>
                </div>
                {SALON_4B.map(s => (<button key={s.id} onClick={() => { setSelStudent(s); setShowDropdown(false); }} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 14px', border: 'none', background: s.id === selStudent.id ? '#eff4ff' : '#fff', cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.1s' }} onMouseEnter={e => { if (s.id !== selStudent.id)
                e.currentTarget.style.background = '#f8f9ff'; }} onMouseLeave={e => { if (s.id !== selStudent.id)
                e.currentTarget.style.background = '#fff'; }}>
                    <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, minWidth: 20 }}>{s.num}</span>
                    <span style={{ fontSize: 13, color: '#1e293b', fontWeight: s.id === selStudent.id ? 700 : 400, flex: 1, textAlign: 'left' }}>{s.name}</span>
                    {s.id === selStudent.id && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0058be" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                  </button>))}
              </div>)}
          </div>
        </div>
      </div>

      {/* KPI summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 22 }}>
        {/* Card 1: Logro General */}
        <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: 10, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 4, boxShadow: '0 1px 4px rgba(22,163,74,0.08)' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#15803d', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Logro General</div>
          <div style={{ fontSize: 42, fontWeight: 900, color: '#15803d', lineHeight: 1, letterSpacing: '-0.03em', margin: '4px 0' }}>A</div>
          <div style={{ fontSize: 11, color: '#16a34a', fontWeight: 500 }}>Logro Esperado del ciclo</div>
        </div>
        {/* Cards 2-5 */}
        {[
            { label: 'Logro Destacado', count: adCount, suffix: 'competencia AD', c: GRADE_CFG['AD'] },
            { label: 'Logro Esperado', count: aCount, suffix: 'competencias A', c: GRADE_CFG['A'] },
            { label: 'En Proceso', count: bCount, suffix: 'competencias B', c: GRADE_CFG['B'] },
            { label: 'En Inicio', count: cCount, suffix: 'competencia C', c: GRADE_CFG['C'] },
        ].map(card => (<div key={card.label} style={{ background: card.c.bg, border: `1.5px solid ${card.c.border}`, borderRadius: 10, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 4, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: card.c.text, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{card.label}</div>
            <div style={{ fontSize: 34, fontWeight: 900, color: card.c.text, lineHeight: 1, letterSpacing: '-0.02em', margin: '4px 0' }}>{card.count}</div>
            <div style={{ fontSize: 11, color: card.c.text, fontWeight: 500, opacity: 0.85 }}>{card.suffix}</div>
          </div>))}
      </div>

      {/* Competency table */}
      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,35,111,0.05)', marginBottom: 24 }}>
        {/* Table header */}
        <div style={{ padding: '14px 20px 12px', borderBottom: '1px solid #f1f4f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.01em' }}>Consolidado Oficial de Logros por Competencia</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
              {selStudent.name} · {bimestre} · 4to Grado "B"
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {['AD', 'A', 'B', 'C'].map(g => (<div key={g} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <TutorGradeBadge g={g}/>
                <span style={{ fontSize: 11, color: '#64748b' }}>= {GRADE_CFG[g].desc}</span>
              </div>))}
          </div>
        </div>
        {/* Column headers */}
        <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr 160px 100px 140px', background: '#f8f9ff', borderBottom: '1.5px solid #e8eaf0' }}>
          {['Área Curricular', 'Competencia Evaluada', 'Docente a Cargo', 'Calificación', 'Estado'].map((h, i) => (<div key={h} style={{ padding: '10px 16px', fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: '0.06em', textTransform: 'uppercase', borderRight: i < 4 ? '1px solid #e8eaf0' : 'none' }}>{h}</div>))}
        </div>
        {/* Rows */}
        {TUTOR_COMPS.map((row, ri) => {
            const cfg = GRADE_CFG[row.grade];
            return (<div key={ri} style={{ display: 'grid', gridTemplateColumns: '160px 1fr 160px 100px 140px', borderBottom: ri < TUTOR_COMPS.length - 1 ? '1px solid #f1f4f9' : 'none', background: ri % 2 === 1 ? '#fafbff' : '#fff', transition: 'background 0.1s' }} onMouseEnter={e => e.currentTarget.style.background = '#f5f7ff'} onMouseLeave={e => e.currentTarget.style.background = ri % 2 === 1 ? '#fafbff' : '#fff'}>
              <div style={{ padding: '12px 16px', borderRight: '1px solid #f1f4f9', display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{row.area}</span>
              </div>
              <div style={{ padding: '12px 16px', borderRight: '1px solid #f1f4f9', display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: '#1e293b' }}>{row.comp}</span>
              </div>
              <div style={{ padding: '12px 16px', borderRight: '1px solid #f1f4f9', display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>{row.docente}</span>
              </div>
              <div style={{ padding: '12px 16px', borderRight: '1px solid #f1f4f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TutorGradeBadge g={row.grade}/>
              </div>
              <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: cfg.text, background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 5, padding: '2px 10px' }}>{cfg.desc}</span>
              </div>
            </div>);
        })}
      </div>

      {/* Sticky bottom validation bar */}
      <div style={{ position: 'sticky', bottom: 0, background: '#fff', borderTop: '1.5px solid #e2e8f0', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 -4px 16px rgba(0,35,111,0.07)', zIndex: 20, marginLeft: -32, marginRight: -32, paddingLeft: 32, paddingRight: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #065f46,#10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'white', flexShrink: 0 }}>G</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>Libreta consolidada por el Tutor de Aula</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>Prof. Carlos García · Tutor 4to B · Lista para emisión oficial</div>
          </div>
        </div>
        <button onClick={handleFirmar} style={{ height: 42, padding: '0 24px', borderRadius: 8, border: 'none', background: firmado ? '#16a34a' : '#00236f', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 8, boxShadow: firmado ? '0 2px 12px rgba(22,163,74,0.3)' : '0 2px 12px rgba(0,35,111,0.28)', transition: 'background 0.2s' }} onMouseEnter={e => { if (!firmado)
        e.currentTarget.style.background = '#001d5a'; }} onMouseLeave={e => { if (!firmado)
        e.currentTarget.style.background = '#00236f'; }}>
          {firmado
            ? <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>Libreta Emitida y Firmada</>
            : <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M12 22h6a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M3 15l3.5 3.5L11 14"/></svg>Emitir y Firmar Libreta Oficial</>}
        </button>
      </div>
    </div>);
}
/* ═══════════════════════════════════════════════════════════
   STUDENT & PARENT READ-ONLY REPORT CARD VIEWS
══════════════════════════════════════════════════════════════ */
/* Shared grade badge (same as TutorGradeBadge but module-level) */
function ROGradeBadge({ g }) {
    const c = GRADE_CFG[g];
    return (<span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 36, padding: '3px 10px', borderRadius: 6, border: `1.5px solid ${c.border}`, background: c.bg, color: c.text, fontSize: 13, fontWeight: 800 }}>{g}</span>);
}
/* Shared read-only table renderer */
function ROCompetencyTable({ comps, studentName, bimestre, grade }) {
    const adCount = comps.filter(c => c.grade === 'AD').length;
    const aCount = comps.filter(c => c.grade === 'A').length;
    const bCount = comps.filter(c => c.grade === 'B').length;
    const cCount = comps.filter(c => c.grade === 'C').length;
    return (<>
      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 22 }}>
        <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: 10, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 4, boxShadow: '0 1px 4px rgba(22,163,74,0.08)' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#15803d', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Logro General</div>
          <div style={{ fontSize: 42, fontWeight: 900, color: '#15803d', lineHeight: 1, letterSpacing: '-0.03em', margin: '4px 0' }}>A</div>
          <div style={{ fontSize: 11, color: '#16a34a', fontWeight: 500 }}>Logro Esperado del ciclo</div>
        </div>
        {[['AD', adCount, 'competencia AD'], ['A', aCount, 'competencias A'], ['B', bCount, 'competencias B'], ['C', cCount, 'competencia C']].map(([key, count, suffix]) => {
            const c = GRADE_CFG[key];
            return (<div key={key} style={{ background: c.bg, border: `1.5px solid ${c.border}`, borderRadius: 10, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 4, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: c.text, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{c.desc}</div>
              <div style={{ fontSize: 34, fontWeight: 900, color: c.text, lineHeight: 1, letterSpacing: '-0.02em', margin: '4px 0' }}>{count}</div>
              <div style={{ fontSize: 11, color: c.text, fontWeight: 500, opacity: 0.85 }}>{suffix}</div>
            </div>);
        })}
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,35,111,0.05)' }}>
        <div style={{ padding: '14px 20px 12px', borderBottom: '1px solid #f1f4f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.01em' }}>Consolidado Oficial de Logros por Competencia</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{studentName} · {bimestre} · {grade}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {['AD', 'A', 'B', 'C'].map(g => (<div key={g} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <ROGradeBadge g={g}/>
                <span style={{ fontSize: 11, color: '#64748b' }}>= {GRADE_CFG[g].desc}</span>
              </div>))}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr 160px 100px 140px', background: '#f8f9ff', borderBottom: '1.5px solid #e8eaf0' }}>
          {['Área Curricular', 'Competencia Evaluada', 'Docente a Cargo', 'Calificación', 'Estado'].map((h, i) => (<div key={h} style={{ padding: '10px 16px', fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: '0.06em', textTransform: 'uppercase', borderRight: i < 4 ? '1px solid #e8eaf0' : 'none' }}>{h}</div>))}
        </div>
        {comps.map((row, ri) => {
            const cfg = GRADE_CFG[row.grade];
            return (<div key={ri} style={{ display: 'grid', gridTemplateColumns: '160px 1fr 160px 100px 140px', borderBottom: ri < comps.length - 1 ? '1px solid #f1f4f9' : 'none', background: ri % 2 === 1 ? '#fafbff' : '#fff' }}>
              <div style={{ padding: '12px 16px', borderRight: '1px solid #f1f4f9', display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{row.area}</span>
              </div>
              <div style={{ padding: '12px 16px', borderRight: '1px solid #f1f4f9', display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: '#1e293b' }}>{row.comp}</span>
              </div>
              <div style={{ padding: '12px 16px', borderRight: '1px solid #f1f4f9', display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>{row.docente}</span>
              </div>
              <div style={{ padding: '12px 16px', borderRight: '1px solid #f1f4f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ROGradeBadge g={row.grade}/>
              </div>
              <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: cfg.text, background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 5, padding: '2px 10px' }}>{cfg.desc}</span>
              </div>
            </div>);
        })}
      </div>
    </>);
}
/* Per-child grade data for parent view */
const CHILD_COMPS = {
    c1: [
        { area: 'Matemáticas', comp: 'Resuelve problemas de cantidad', docente: 'Prof. Carlos García', grade: 'A' },
        { area: 'Matemáticas', comp: 'Gestión de datos e incertidumbre', docente: 'Prof. Carlos García', grade: 'A' },
        { area: 'Comunicación', comp: 'Se comunica oralmente en L1 y L2', docente: 'Prof. Laura Rivas', grade: 'AD' },
        { area: 'Comunicación', comp: 'Lee diversos tipos de textos escritos', docente: 'Prof. Laura Rivas', grade: 'A' },
        { area: 'Historia', comp: 'Construye interpretaciones históricas', docente: 'Prof. R. Torres', grade: 'A' },
        { area: 'Ciencias', comp: 'Indaga mediante métodos científicos', docente: 'Prof. Mario Vera', grade: 'B' },
        { area: 'Ed. Física', comp: 'Se desenvuelve motrizmente de manera autónoma', docente: 'Prof. M. Romero', grade: 'A' },
        { area: 'Arte y Cultura', comp: 'Crea proyectos desde lenguajes artísticos', docente: 'Prof. Ana Morales', grade: 'B' },
    ],
    c2: [
        { area: 'Matemáticas', comp: 'Resuelve problemas de cantidad', docente: 'Prof. Carlos García', grade: 'B' },
        { area: 'Comunicación', comp: 'Se comunica oralmente en L1 y L2', docente: 'Prof. Laura Rivas', grade: 'A' },
        { area: 'Comunicación', comp: 'Lee diversos tipos de textos escritos', docente: 'Prof. Laura Rivas', grade: 'B' },
        { area: 'Historia', comp: 'Construye interpretaciones históricas', docente: 'Prof. R. Torres', grade: 'A' },
        { area: 'Ciencias', comp: 'Indaga mediante métodos científicos', docente: 'Prof. Mario Vera', grade: 'C' },
        { area: 'Ed. Física', comp: 'Se desenvuelve motrizmente de manera autónoma', docente: 'Prof. M. Romero', grade: 'A' },
        { area: 'Arte y Cultura', comp: 'Crea proyectos desde lenguajes artísticos', docente: 'Prof. Ana Morales', grade: 'A' },
    ],
};
function StudentReportCardView() {
    const [bimestre, setBimestre] = useState('1er Bimestre');
    const [exported, setExported] = useState(false);
    return (<div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#0058be', marginBottom: 6 }}>Portal del Estudiante</div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>
            Libreta de Notas — <span style={{ color: '#0058be' }}>{bimestre}</span>
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ position: 'relative' }}>
            <select value={bimestre} onChange={e => setBimestre(e.target.value)} style={{ appearance: 'none', background: '#fff', border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 32px 8px 14px', fontSize: 13, fontWeight: 500, color: '#374151', cursor: 'pointer', outline: 'none', fontFamily: 'inherit' }}>
              {['1er Bimestre', '2do Bimestre', '3er Bimestre', '4to Bimestre'].map(b => <option key={b}>{b}</option>)}
            </select>
            <svg style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
          <button onClick={() => { setExported(true); setTimeout(() => setExported(false), 2800); }} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 18px', borderRadius: 8, fontFamily: 'inherit', background: exported ? '#f0fdf4' : '#fff', border: `1.5px solid ${exported ? '#86efac' : '#d1d5db'}`, color: exported ? '#16a34a' : '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
            {exported
            ? <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>PDF Exportado</>
            : <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>Exportar PDF</>}
          </button>
        </div>
      </div>

      {/* Student identity bar */}
      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', padding: '14px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 1px 4px rgba(0,35,111,0.05)' }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, rgb(15,118,110),rgb(45,212,191))', border: '2px solid #99f6e4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#fff', flexShrink: 0 }}>LT</div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Mi libreta de notas</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>Lucas Torres</span>
            <span style={{ fontSize: 12, color: '#64748b', background: '#f1f4f9', border: '1px solid #e2e8f0', borderRadius: 5, padding: '2px 8px', fontWeight: 600 }}>4to Grado "B" — Secundaria</span>
            <span style={{ fontSize: 11, color: '#94a3b8', background: '#f8f9ff', border: '1px solid #e8eaf0', borderRadius: 5, padding: '2px 8px' }}>Código: EST-004</span>
          </div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: '#f0f4ff', border: '1px solid #bfdbfe', borderRadius: 7 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0058be" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#0058be' }}>Solo lectura — Libreta oficial MINEDU</span>
        </div>
      </div>

      <ROCompetencyTable comps={TUTOR_COMPS} studentName="Lucas Torres" bimestre={bimestre} grade='4to Grado "B"'/>
    </div>);
}
function ParentReportCardView() {
    const [selId, setSelId] = useState(PARENT_CHILDREN[0].id);
    const [bimestre, setBimestre] = useState('1er Bimestre');
    const [exported, setExported] = useState(false);
    const [showDrop, setShowDrop] = useState(false);
    const child = PARENT_CHILDREN.find(c => c.id === selId) ?? PARENT_CHILDREN[0];
    const comps = CHILD_COMPS[selId] ?? CHILD_COMPS['c1'];
    return (<div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#0058be', marginBottom: 6 }}>Portal del Apoderado</div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>
            Libreta de Notas — <span style={{ color: '#0058be' }}>{bimestre}</span>
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ position: 'relative' }}>
            <select value={bimestre} onChange={e => setBimestre(e.target.value)} style={{ appearance: 'none', background: '#fff', border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 32px 8px 14px', fontSize: 13, fontWeight: 500, color: '#374151', cursor: 'pointer', outline: 'none', fontFamily: 'inherit' }}>
              {['1er Bimestre', '2do Bimestre', '3er Bimestre', '4to Bimestre'].map(b => <option key={b}>{b}</option>)}
            </select>
            <svg style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
          <button onClick={() => { setExported(true); setTimeout(() => setExported(false), 2800); }} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 18px', borderRadius: 8, fontFamily: 'inherit', background: exported ? '#f0fdf4' : '#fff', border: `1.5px solid ${exported ? '#86efac' : '#d1d5db'}`, color: exported ? '#16a34a' : '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
            {exported
            ? <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>PDF Exportado</>
            : <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>📥 Exportar PDF</>}
          </button>
        </div>
      </div>

      {/* Child selector */}
      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', padding: '14px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 4px rgba(0,35,111,0.05)', flexWrap: 'wrap', gap: 12, position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #a78bfa)', border: '2px solid #ddd6fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
            {child.name.split(' ')[0][0]}{child.name.split(' ')[1][0]}
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Libreta de notas de</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>{child.name}</span>
              <span style={{ fontSize: 12, color: '#64748b', background: '#f1f4f9', border: '1px solid #e2e8f0', borderRadius: 5, padding: '2px 8px', fontWeight: 600 }}>{child.grade}</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 12, color: '#64748b' }}>Tiene <strong>{PARENT_CHILDREN.length}</strong> hijos registrados</span>
          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowDrop(d => !d)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: '1.5px solid #d1d5db', background: '#f8f9ff', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 600, color: '#374151' }}>
              Seleccionar hijo
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            {showDrop && (<div style={{ position: 'absolute', right: 0, top: '110%', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, boxShadow: '0 8px 32px rgba(0,0,0,0.14)', minWidth: 260, zIndex: 100, overflow: 'hidden' }}>
                {PARENT_CHILDREN.map(c => (<button key={c.id} onClick={() => { setSelId(c.id); setShowDrop(false); }} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 14px', border: 'none', background: c.id === selId ? '#eff4ff' : '#fff', cursor: 'pointer', fontFamily: 'inherit' }} onMouseEnter={e => { if (c.id !== selId)
                e.currentTarget.style.background = '#f8f9ff'; }} onMouseLeave={e => { if (c.id !== selId)
                e.currentTarget.style.background = '#fff'; }}>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                      {c.name.split(' ')[0][0]}{c.name.split(' ')[1][0]}
                    </div>
                    <div style={{ textAlign: 'left', flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{c.name}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>{c.grade}</div>
                    </div>
                    {c.id === selId && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0058be" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                  </button>))}
              </div>)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: '#f0f4ff', border: '1px solid #bfdbfe', borderRadius: 7 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0058be" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#0058be' }}>Solo lectura</span>
          </div>
        </div>
      </div>

      <ROCompetencyTable comps={comps} studentName={child.name} bimestre={bimestre} grade={child.grade}/>
    </div>);
}
/* ═══════════════════════════════════════════════════════════
   REPORT CARD VIEW
══════════════════════════════════════════════════════════════ */
function ReportCardView() {
    const [selectedStudent, setSelectedStudent] = useState(STUDENTS_LIST[0]);
    const [showStudentMenu, setShowStudentMenu] = useState(false);
    const [bimestre, setBimestre] = useState('1er Bimestre');
    const [exported, setExported] = useState(false);
    const allGrades = COURSES.flatMap(c => c.competencias.map(k => k.grade));
    const totalComps = allGrades.length;
    const adCount = allGrades.filter(g => g === 'AD').length;
    const aCount = allGrades.filter(g => g === 'A').length;
    const bCount = allGrades.filter(g => g === 'B').length;
    const cCount = allGrades.filter(g => g === 'C').length;
    const avgScore = Math.round(allGrades.reduce((s, g) => s + GRADE_SCORE[g], 0) / totalComps);
    const handleExport = () => { setExported(true); setTimeout(() => setExported(false), 2500); };
    return (<div>
      <nav style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
        {['Inicio', 'Académico', 'Libreta de Notas'].map((crumb, i, arr) => (<span key={crumb} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, color: i === arr.length - 1 ? '#00236f' : '#94a3b8', fontWeight: i === arr.length - 1 ? 600 : 400 }}>{crumb}</span>
            {i < arr.length - 1 && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>}
          </span>))}
      </nav>

      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 4 }}>Portal del Apoderado</div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>
            Libreta de Notas — <span style={{ color: '#0058be' }}>{bimestre}</span>
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ position: 'relative' }}>
            <select value={bimestre} onChange={e => setBimestre(e.target.value)} style={{ appearance: 'none', background: '#fff', border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 32px 8px 14px', fontSize: 13, fontWeight: 500, color: '#374151', cursor: 'pointer', outline: 'none', fontFamily: 'inherit' }}>
              {['1er Bimestre', '2do Bimestre', '3er Bimestre', '4to Bimestre'].map(b => <option key={b}>{b}</option>)}
            </select>
            <svg style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
          <button onClick={handleExport} style={{
            display: 'flex', alignItems: 'center', gap: 7, padding: '8px 18px', borderRadius: 8, fontFamily: 'inherit',
            background: exported ? '#f0fdf4' : '#ffffff', border: `1.5px solid ${exported ? '#86efac' : '#d1d5db'}`,
            color: exported ? '#16a34a' : '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
        }}>
            {exported
            ? <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg> PDF Exportado</>
            : <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Exportar PDF</>}
          </button>
        </div>
      </div>

      <div style={{ background: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', padding: '14px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 4px rgba(0,35,111,0.05)', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #dbeafe, #93c5fd)', border: '2px solid #bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800, color: '#1d4ed8', flexShrink: 0 }}>
            {selectedStudent.name.split(' ')[0][0]}{selectedStudent.name.split(' ')[1][0]}
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Estudiante seleccionado</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>{selectedStudent.name}</span>
              <span style={{ fontSize: 12, color: '#64748b', background: '#f1f4f9', border: '1px solid #e2e8f0', borderRadius: 5, padding: '2px 8px', fontWeight: 600 }}>{selectedStudent.grade}</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 12, color: '#94a3b8' }}>Tiene {STUDENTS_LIST.length} hijos registrados</span>
          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowStudentMenu(!showStudentMenu)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 7, border: '1px solid #d1d5db', background: '#f8f9ff', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 600, color: '#374151' }}>
              Cambiar estudiante
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            {showStudentMenu && (<div style={{ position: 'absolute', right: 0, top: '110%', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', minWidth: 220, zIndex: 100, overflow: 'hidden' }}>
                {STUDENTS_LIST.map(s => (<button key={s.id} onClick={() => { setSelectedStudent(s); setShowStudentMenu(false); }} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 14px', border: 'none', background: s.id === selectedStudent.id ? '#f0f6ff' : 'transparent', cursor: 'pointer', fontFamily: 'inherit' }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #dbeafe, #93c5fd)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#1d4ed8', flexShrink: 0 }}>
                      {s.name.split(' ')[0][0]}{s.name.split(' ')[1][0]}
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{s.name}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>{s.grade}</div>
                    </div>
                    {s.id === selectedStudent.id && <svg style={{ marginLeft: 'auto' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0058be" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                  </button>))}
              </div>)}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
            { label: 'Promedio General', value: `${avgScore}%`, sub: 'del ciclo', color: avgScore >= 75 ? '#16a34a' : avgScore >= 50 ? '#d97706' : '#ba1a1a', bg: avgScore >= 75 ? '#f0fdf4' : avgScore >= 50 ? '#fffbeb' : '#fff1f1', border: avgScore >= 75 ? '#bbf7d0' : avgScore >= 50 ? '#fde68a' : '#fecaca' },
            { label: 'Logro Destacado', value: String(adCount), sub: 'competencias AD', color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0' },
            { label: 'Logro Esperado', value: String(aCount), sub: 'competencias A', color: '#166534', bg: '#f0fdf4', border: '#c6f7d4' },
            { label: 'En Proceso', value: String(bCount), sub: 'competencias B', color: '#92400e', bg: '#fffbeb', border: '#fde68a' },
            { label: 'En Inicio', value: String(cCount), sub: 'competencias C', color: '#991b1b', bg: '#fff1f1', border: '#fecaca' },
        ].map(kpi => (<div key={kpi.label} style={{ background: '#ffffff', borderRadius: 8, border: `1px solid ${kpi.border}`, padding: '14px 18px', boxShadow: '0 1px 3px rgba(0,35,111,0.04)' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{kpi.label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: kpi.color, letterSpacing: '-0.03em', lineHeight: 1 }}>{kpi.value}</div>
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4, fontWeight: 500 }}>{kpi.sub}</div>
          </div>))}
      </div>

      <div style={{ background: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,35,111,0.04)', marginBottom: 12 }}>
        <div style={{ padding: '18px 24px 14px', borderBottom: '2px solid #f1f4f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0, letterSpacing: '-0.01em' }}>Consolidado de Logros por Competencia</h2>
            <p style={{ fontSize: 12, color: '#94a3b8', margin: '3px 0 0' }}>Año Escolar 2026 — {bimestre} — {selectedStudent.grade}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {['AD', 'A', 'B', 'C'].map(g => (<span key={g} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 9px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: GRADE_CFG[g].bg, color: GRADE_CFG[g].text, border: `1px solid ${GRADE_CFG[g].border}` }}>
                {g} <span style={{ fontWeight: 400, color: GRADE_CFG[g].text, opacity: 0.75 }}>= {GRADE_CFG[g].desc}</span>
              </span>))}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr 200px 180px 130px', padding: '10px 24px', background: '#f8f9ff', borderBottom: '1px solid #e8eaf0' }}>
          {['ÁREA CURRICULAR', 'COMPETENCIA EVALUADA', 'DOCENTE', 'CALIFICACIÓN', 'ESTADO'].map((col, i) => (<div key={col} style={{ fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: '0.07em', textAlign: i >= 3 ? 'center' : 'left' }}>{col}</div>))}
        </div>
        {COURSES.map((course, ci) => course.competencias.map((comp, ki) => {
            const cfg = GRADE_CFG[comp.grade];
            const status = STATUS_MAP[comp.grade];
            const sStyle = STATUS_STYLE[status];
            const isFirst = ki === 0;
            const isLast = ki === course.competencias.length - 1;
            const showBorder = !(ci === COURSES.length - 1 && isLast);
            return (<div key={`${ci}-${ki}`} style={{
                    display: 'grid', gridTemplateColumns: '180px 1fr 200px 180px 130px',
                    padding: '0 24px', alignItems: 'center', minHeight: 62,
                    borderBottom: showBorder ? '1px solid #f1f4f9' : 'none',
                    background: ki % 2 === 0 && course.competencias.length > 1 ? '#fafbff' : 'transparent',
                    transition: 'background 0.1s',
                }} onMouseEnter={e => { e.currentTarget.style.background = '#f0f5ff'; }} onMouseLeave={e => { e.currentTarget.style.background = ki % 2 === 0 && course.competencias.length > 1 ? '#fafbff' : 'transparent'; }}>
                <div style={{ paddingRight: 12 }}>
                  {isFirst ? (<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 6, flexShrink: 0, background: `hsl(${course.hue},70%,94%)`, border: `1px solid hsl(${course.hue},55%,82%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{course.icon}</div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', lineHeight: '1.3' }}>{course.area}</span>
                    </div>) : (<div style={{ paddingLeft: 36, borderLeft: '2px solid #e8eaf0', marginLeft: 14, paddingTop: 2, paddingBottom: 2 }}>
                      <span style={{ fontSize: 11, color: '#94a3b8', fontStyle: 'italic' }}>↳ continuación</span>
                    </div>)}
                </div>
                <div style={{ paddingRight: 16, fontSize: 13, color: '#374151', lineHeight: '1.45', fontWeight: 500 }}>{comp.comp}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: `hsl(${course.hue},55%,88%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, color: `hsl(${course.hue},60%,30%)`, flexShrink: 0 }}>
                    {comp.docente.split(' ').pop()[0]}
                  </div>
                  <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>{comp.docente}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 28, borderRadius: 6, fontSize: 15, fontWeight: 900, background: cfg.bg, color: cfg.text, border: `1.5px solid ${cfg.border}`, letterSpacing: '0.02em', boxShadow: `0 0 0 2px ${cfg.bg}` }}>
                    {cfg.label}
                  </span>
                  <div style={{ width: 60, height: 3, background: '#f1f4f9', borderRadius: 999, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${GRADE_SCORE[comp.grade]}%`, background: cfg.bar, borderRadius: 999 }}/>
                  </div>
                  <span style={{ fontSize: 9, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{cfg.desc}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 12px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: sStyle.bg, color: sStyle.color, border: `1px solid ${sStyle.border}`, whiteSpace: 'nowrap' }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: sStyle.color }}/>
                    {status}
                  </span>
                </div>
              </div>);
        }))}
      </div>

      <div style={{ background: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', padding: '18px 24px', marginBottom: 12, boxShadow: '0 1px 4px rgba(0,35,111,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: '#eff6ff', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>Observaciones del Tutor</span>
              <span style={{ fontSize: 11, color: '#94a3b8', background: '#f1f4f9', padding: '2px 8px', borderRadius: 4, fontWeight: 500 }}>Prof. García · 14 mar 2026</span>
            </div>
            <p style={{ fontSize: 13, color: '#374151', lineHeight: '1.6', margin: 0 }}>
              Carlos muestra un excelente desempeño en Matemáticas y Comunicación. Se recomienda reforzar la comprensión lectora en Ciencias y prestar especial atención a Arte, donde presenta dificultades para desarrollar proyectos creativos de manera autónoma. Su actitud en clase es positiva y participativa.
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, background: '#f8f9ff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '14px 18px' }}>
        <div style={{ width: 28, height: 28, borderRadius: 6, background: '#e0e7ff', border: '1px solid #c7d2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <div>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#4f46e5', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Nota de Adaptación Responsive</span>
          <p style={{ fontSize: 12, color: '#64748b', margin: 0, lineHeight: '1.6' }}>
            <strong style={{ color: '#374151' }}>Adaptación Responsive Web:</strong> En vistas compactas (&lt;768px), esta grilla se colapsa automáticamente en contenedores tipo <strong style={{ color: '#374151' }}>Acordeón por curso</strong> para facilitar la lectura móvil del apoderado.
          </p>
        </div>
      </div>
    </div>);
}
/* ═══════════════════════════════════════════════════════════
   COURSES HUB VIEW
══════════════════════════════════════════════════════════════ */
const COURSE_CARDS = [
    {
        id: 'mat-4b',
        tag: 'SECUNDARIA',
        shift: 'MAÑANA',
        shiftColor: '#0058be',
        shiftBg: '#eff6ff',
        subject: 'Matemáticas',
        grade: '4to Grado B',
        students: 32,
        room: 'Aula 204 (Pabellón B)',
        nextSession: 'Hoy 08:00 – 09:30 AM',
        nextSessionUrgent: true,
        accent: '#00236f',
        accentBg: '#eef1fa',
        icon: '📐',
    },
    {
        id: 'alg-5a',
        tag: 'SECUNDARIA',
        shift: 'MAÑANA',
        shiftColor: '#0058be',
        shiftBg: '#eff6ff',
        subject: 'Álgebra',
        grade: '5to Grado A',
        students: 28,
        room: 'Aula 102 (Pabellón A)',
        nextSession: 'Mañana 10:00 – 11:30 AM',
        nextSessionUrgent: false,
        accent: '#0958b8',
        accentBg: '#eff6ff',
        icon: '🔢',
    },
    {
        id: 'geo-3c',
        tag: 'SECUNDARIA',
        shift: 'TARDE',
        shiftColor: '#7c3aed',
        shiftBg: '#f5f3ff',
        subject: 'Geometría',
        grade: '3er Grado C',
        students: 30,
        room: 'Aula 201 (Pabellón B)',
        nextSession: 'Miércoles 08:00 – 09:30 AM',
        nextSessionUrgent: false,
        accent: '#7c3aed',
        accentBg: '#f5f3ff',
        icon: '📏',
    },
];
function CoursesHubView({ onNavigate }) {
    const [hoveredCard, setHoveredCard] = useState(null);
    return (<div>
      {/* Breadcrumbs */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24 }}>
        {['Inicio', 'Mis Cursos'].map((crumb, i, arr) => (<span key={crumb} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span onClick={() => i === 0 && onNavigate('inicio')} style={{ fontSize: 12, color: i === arr.length - 1 ? '#00236f' : '#94a3b8', fontWeight: i === arr.length - 1 ? 600 : 400, cursor: i < arr.length - 1 ? 'pointer' : 'default' }} onMouseEnter={e => { if (i < arr.length - 1)
            e.currentTarget.style.color = '#475569'; }} onMouseLeave={e => { if (i < arr.length - 1)
            e.currentTarget.style.color = '#94a3b8'; }}>
              {crumb}
            </span>
            {i < arr.length - 1 && (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>)}
          </span>))}
      </nav>

      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 }}>
        <div style={{ maxWidth: 620 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#121c2a', letterSpacing: '-0.02em', margin: '0 0 8px' }}>
            Mis Cursos y Secciones Asignadas
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: 0, lineHeight: '1.6' }}>
            Seleccione una sección académica para registrar asistencias, gestionar evaluaciones o emitir reportes.
          </p>
        </div>
        {/* Period badge */}
        <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: '#ffffff', border: '1px solid #e2e8f0',
            borderRadius: 10, padding: '10px 16px',
            boxShadow: '0 1px 4px rgba(0,35,111,0.06)',
            flexShrink: 0, marginLeft: 24,
        }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#16a34a', boxShadow: '0 0 0 2px #bbf7d0' }}/>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', lineHeight: 1, marginBottom: 3 }}>Período Activo</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#00236f', lineHeight: 1 }}>Año Escolar 2026 — Bimestre I</div>
          </div>
        </div>
      </div>

      {/* Summary strip */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28, padding: '14px 20px', background: '#ffffff', borderRadius: 10, border: '1px solid #e8eaf0', boxShadow: '0 1px 3px rgba(0,35,111,0.04)' }}>
        {[
            { label: 'Cursos asignados', value: '3', color: '#00236f', bg: '#eef1fa' },
            { label: 'Total estudiantes', value: '90', color: '#0058be', bg: '#eff6ff' },
            { label: 'Sesiones esta semana', value: '6', color: '#16a34a', bg: '#f0fdf4' },
            { label: 'Evaluaciones pendientes', value: '2', color: '#d97706', bg: '#fffbeb' },
        ].map((stat, i) => (<div key={stat.label} style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 16, fontWeight: 800, color: stat.color }}>{stat.value}</span>
              </div>
              <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500, lineHeight: '1.3' }}>{stat.label}</span>
            </div>
            {i < 3 && <div style={{ width: 1, height: 28, background: '#f1f4f9', flexShrink: 0 }}/>}
          </div>))}
        <div style={{ flex: 1 }}/>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input placeholder="Filtrar cursos..." style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 12, color: '#374151', width: 140, fontFamily: 'inherit' }}/>
        </div>
      </div>

      {/* Section label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Cursos activos</span>
        <div style={{ flex: 1, height: 1, background: '#f1f4f9' }}/>
        <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>3 secciones</span>
      </div>

      {/* Cards grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 32 }}>
        {COURSE_CARDS.map(course => {
            const isHovered = hoveredCard === course.id;
            return (<div key={course.id} onMouseEnter={() => setHoveredCard(course.id)} onMouseLeave={() => setHoveredCard(null)} style={{
                    background: '#ffffff', borderRadius: 12,
                    border: `1.5px solid ${isHovered ? '#c7d8f0' : '#e8eaf0'}`,
                    boxShadow: isHovered
                        ? '0 8px 28px rgba(0,35,111,0.10), 0 2px 8px rgba(0,35,111,0.06)'
                        : '0 1px 4px rgba(0,35,111,0.05)',
                    display: 'flex', flexDirection: 'column',
                    overflow: 'hidden',
                    transition: 'box-shadow 0.18s ease, border-color 0.18s ease, transform 0.18s ease',
                    transform: isHovered ? 'translateY(-2px)' : 'none',
                    cursor: 'default',
                }}>
              {/* Card top accent bar */}
              <div style={{ height: 4, background: `linear-gradient(90deg, ${course.accent}, ${course.accentBg === '#f5f3ff' ? '#a78bfa' : '#3b82f6'})` }}/>

              {/* Card body */}
              <div style={{ padding: '20px 22px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 0 }}>
                {/* Tag row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.09em', color: '#64748b', textTransform: 'uppercase' }}>
                    {course.tag}
                  </span>
                  <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#cbd5e1' }}/>
                  <span style={{
                    fontSize: 10, fontWeight: 700, letterSpacing: '0.07em',
                    color: course.shiftColor, background: course.shiftBg,
                    padding: '2px 7px', borderRadius: 4, textTransform: 'uppercase',
                }}>
                    {course.shift}
                  </span>
                </div>

                {/* Subject + icon */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                    background: course.accentBg,
                    border: `1px solid ${course.accent}22`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22,
                }}>
                    {course.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#121c2a', letterSpacing: '-0.01em', lineHeight: '1.2' }}>
                      {course.subject}
                    </div>
                    <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500, marginTop: 3 }}>
                      {course.grade}
                    </div>
                  </div>
                </div>

                {/* Meta list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <div style={{ width: 26, height: 26, borderRadius: 6, background: '#f8f9ff', border: '1px solid #e8eaf0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    </div>
                    <span style={{ fontSize: 12, color: '#374151', fontWeight: 500 }}>
                      <strong style={{ color: '#1e293b', fontWeight: 700 }}>{course.students}</strong> Estudiantes matriculados
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <div style={{ width: 26, height: 26, borderRadius: 6, background: '#f8f9ff', border: '1px solid #e8eaf0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <DoorIcon size={13} color="#64748b"/>
                    </div>
                    <span style={{ fontSize: 12, color: '#374151', fontWeight: 500 }}>{course.room}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <div style={{ width: 26, height: 26, borderRadius: 6, background: course.nextSessionUrgent ? '#fff7ed' : '#f8f9ff', border: `1px solid ${course.nextSessionUrgent ? '#fed7aa' : '#e8eaf0'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <ClockIcon size={13} color={course.nextSessionUrgent ? '#ea580c' : '#64748b'}/>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 12, color: course.nextSessionUrgent ? '#c2410c' : '#374151', fontWeight: course.nextSessionUrgent ? 600 : 500 }}>
                        Próxima sesión: {course.nextSession}
                      </span>
                      {course.nextSessionUrgent && (<span style={{ fontSize: 10, fontWeight: 700, color: '#ea580c', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 4, padding: '1px 5px' }}>HOY</span>)}
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: '#f1f4f9', marginBottom: 16 }}/>

                {/* Quick action chips */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <button onClick={() => onNavigate('asistencia')} style={{
                    display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px',
                    borderRadius: 6, border: '1px solid #e2e8f0', background: '#f8f9ff',
                    fontSize: 11, fontWeight: 600, color: '#374151', cursor: 'pointer', fontFamily: 'inherit',
                    transition: 'all 0.12s',
                }} onMouseEnter={e => { e.currentTarget.style.background = '#f0f6ff'; e.currentTarget.style.borderColor = '#bfdbfe'; e.currentTarget.style.color = '#0058be'; }} onMouseLeave={e => { e.currentTarget.style.background = '#f8f9ff'; e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#374151'; }}>
                    <CheckSquareIcon size={11} color="currentColor"/>
                    Tomar Asistencia
                  </button>
                  <button onClick={() => onNavigate('reportes')} style={{
                    display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px',
                    borderRadius: 6, border: '1px solid #e2e8f0', background: '#f8f9ff',
                    fontSize: 11, fontWeight: 600, color: '#374151', cursor: 'pointer', fontFamily: 'inherit',
                    transition: 'all 0.12s',
                }} onMouseEnter={e => { e.currentTarget.style.background = '#f0f6ff'; e.currentTarget.style.borderColor = '#bfdbfe'; e.currentTarget.style.color = '#0058be'; }} onMouseLeave={e => { e.currentTarget.style.background = '#f8f9ff'; e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#374151'; }}>
                    <NoteIcon size={11} color="currentColor"/>
                    Notas
                  </button>
                </div>

                {/* Primary CTA */}
                <button onClick={() => onNavigate('asistencia')} style={{
                    width: '100%', padding: '11px 16px',
                    borderRadius: 8, border: 'none',
                    background: isHovered ? '#001d5a' : '#00236f',
                    color: '#ffffff', fontSize: 13, fontWeight: 700,
                    cursor: 'pointer', fontFamily: 'inherit',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    boxShadow: isHovered ? '0 4px 14px rgba(0,35,111,0.3)' : '0 1px 4px rgba(0,35,111,0.15)',
                    transition: 'background 0.15s, box-shadow 0.15s',
                    letterSpacing: '0.01em',
                }}>
                  Gestionar Curso
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </button>
              </div>
            </div>);
        })}
      </div>

      {/* Empty state hint */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px', background: '#f8f9ff', border: '1px dashed #d1d5db', borderRadius: 10 }}>
        <div style={{ width: 28, height: 28, borderRadius: 6, background: '#e0e7ff', border: '1px solid #c7d2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <p style={{ fontSize: 12, color: '#64748b', margin: 0, lineHeight: '1.5' }}>
          <strong style={{ color: '#374151' }}>¿No encuentras tu curso?</strong> Los cursos son asignados por el área de Coordinación Académica. Contacta a administración si falta alguna sección.
        </p>
      </div>
    </div>);
}
/* ═══════════════════════════════════════════════════════════
   ADMIN CURSOS VIEW
══════════════════════════════════════════════════════════════ */
const GRADES = ['1ro Secundaria', '2do Secundaria', '3ro Secundaria', '4to Secundaria', '5to Secundaria'];
const COURSES_BY_GRADE = {
    '1ro Secundaria': [
        { name: 'Matemáticas', emoji: '📐', desc: 'Desarrolla el pensamiento lógico, numérico y el razonamiento matemático elemental.', competencies: ['Resuelve problemas de cantidad', 'Resuelve problemas de regularidad, equivalencia y cambio', 'Resuelve problemas de forma, movimiento y localización', 'Resuelve problemas de gestión de datos e incertidumbre'] },
        { name: 'Comunicación', emoji: '📖', desc: 'Fortalece la comprensión lectora, la expresión oral y la producción de textos escritos.', competencies: ['Lee diversos tipos de textos en lengua materna', 'Escribe diversos tipos de textos', 'Se comunica oralmente en lengua materna'] },
        { name: 'Ciencias Sociales', emoji: '🌍', desc: 'Explora la historia, la geografía y el ejercicio ciudadano desde una perspectiva crítica.', competencies: ['Construye interpretaciones históricas', 'Gestiona responsablemente el espacio y el ambiente', 'Gestiona responsablemente los recursos económicos', 'Convive y participa democráticamente'] },
        { name: 'Ciencia y Tecnología', emoji: '🔬', desc: 'Introduce el método científico y la indagación en fenómenos naturales y tecnológicos básicos.', competencies: ['Indaga mediante métodos científicos', 'Explica el mundo físico basándose en conocimientos sobre seres vivos', 'Diseña y construye soluciones tecnológicas'] },
        { name: 'Inglés', emoji: '🌐', desc: 'Inicia el aprendizaje del idioma inglés con énfasis en vocabulario y estructuras básicas.', competencies: ['Se comunica oralmente en inglés como lengua extranjera', 'Lee diversos tipos de textos en inglés', 'Escribe diversos tipos de textos en inglés'] },
        { name: 'Educación Física', emoji: '⚽', desc: 'Promueve el desarrollo motor, la salud corporal y los valores del deporte en equipo.', competencies: ['Se desenvuelve de manera autónoma a través de su motricidad', 'Asume una vida saludable', 'Interactúa a través de sus habilidades sociomotrices'] },
        { name: 'Arte y Cultura', emoji: '🎨', desc: 'Estimula la creatividad y la apreciación artística a través del dibujo, la música y el teatro.', competencies: ['Aprecia de manera crítica manifestaciones artístico-culturales', 'Crea proyectos desde los lenguajes artísticos'] },
    ],
    '2do Secundaria': [
        { name: 'Matemáticas', emoji: '📐', desc: 'Profundiza en álgebra, geometría plana y estadística descriptiva con ejercicios aplicados.', competencies: ['Resuelve problemas de cantidad', 'Resuelve problemas de regularidad, equivalencia y cambio', 'Resuelve problemas de forma, movimiento y localización', 'Resuelve problemas de gestión de datos e incertidumbre'] },
        { name: 'Comunicación', emoji: '📖', desc: 'Avanza hacia la producción de textos argumentativos y la comprensión de géneros literarios.', competencies: ['Lee diversos tipos de textos en lengua materna', 'Escribe diversos tipos de textos', 'Se comunica oralmente en lengua materna'] },
        { name: 'Ciencias Sociales', emoji: '🌍', desc: 'Estudia los procesos históricos del Perú y América Latina con énfasis en la identidad cultural.', competencies: ['Construye interpretaciones históricas', 'Gestiona responsablemente el espacio y el ambiente', 'Convive y participa democráticamente'] },
        { name: 'Ciencia y Tecnología', emoji: '🔬', desc: 'Explora la biología celular, la química básica y los principios del movimiento físico.', competencies: ['Indaga mediante métodos científicos', 'Explica el mundo físico basándose en conocimientos sobre seres vivos', 'Diseña y construye soluciones tecnológicas'] },
        { name: 'Inglés', emoji: '🌐', desc: 'Consolida la comunicación básica en inglés con diálogos cotidianos y lectura comprensiva.', competencies: ['Se comunica oralmente en inglés como lengua extranjera', 'Lee diversos tipos de textos en inglés', 'Escribe diversos tipos de textos en inglés'] },
        { name: 'Educación Física', emoji: '⚽', desc: 'Refuerza capacidades físicas y fomenta hábitos saludables mediante actividad deportiva regular.', competencies: ['Se desenvuelve de manera autónoma a través de su motricidad', 'Asume una vida saludable', 'Interactúa a través de sus habilidades sociomotrices'] },
        { name: 'Arte y Cultura', emoji: '🎨', desc: 'Desarrolla técnicas de dibujo, composición visual y expresión corporal en el aula.', competencies: ['Aprecia de manera crítica manifestaciones artístico-culturales', 'Crea proyectos desde los lenguajes artísticos'] },
    ],
    '3ro Secundaria': [
        { name: 'Matemáticas', emoji: '📐', desc: 'Introduce funciones lineales, trigonometría básica y probabilidad aplicada a contextos reales.', competencies: ['Resuelve problemas de cantidad', 'Resuelve problemas de regularidad, equivalencia y cambio', 'Resuelve problemas de forma, movimiento y localización', 'Resuelve problemas de gestión de datos e incertidumbre'] },
        { name: 'Comunicación', emoji: '📖', desc: 'Analiza textos expositivos y literarios; profundiza en la argumentación escrita y oral.', competencies: ['Lee diversos tipos de textos en lengua materna', 'Escribe diversos tipos de textos', 'Se comunica oralmente en lengua materna'] },
        { name: 'Ciencias Sociales', emoji: '🌍', desc: 'Aborda economía, geografía física y ciudadanía con enfoque en derechos humanos.', competencies: ['Construye interpretaciones históricas', 'Gestiona responsablemente el espacio y el ambiente', 'Gestiona responsablemente los recursos económicos', 'Convive y participa democráticamente'] },
        { name: 'Ciencia y Tecnología', emoji: '🔬', desc: 'Estudia la química orgánica introductoria, la genética básica y la física newtoniana.', competencies: ['Indaga mediante métodos científicos', 'Explica el mundo físico basándose en conocimientos sobre seres vivos', 'Diseña y construye soluciones tecnológicas'] },
        { name: 'Inglés', emoji: '🌐', desc: 'Desarrolla la comprensión y producción de textos en inglés con estructuras de nivel intermedio.', competencies: ['Se comunica oralmente en inglés como lengua extranjera', 'Lee diversos tipos de textos en inglés', 'Escribe diversos tipos de textos en inglés'] },
        { name: 'Educación Física', emoji: '⚽', desc: 'Fomenta el liderazgo deportivo, la planificación del entrenamiento y la vida activa.', competencies: ['Se desenvuelve de manera autónoma a través de su motricidad', 'Asume una vida saludable', 'Interactúa a través de sus habilidades sociomotrices'] },
        { name: 'Arte y Cultura', emoji: '🎨', desc: 'Explora el arte contemporáneo peruano y las expresiones culturales regionales.', competencies: ['Aprecia de manera crítica manifestaciones artístico-culturales', 'Crea proyectos desde los lenguajes artísticos'] },
    ],
    '4to Secundaria': [
        { name: 'Matemáticas', emoji: '📐', desc: 'Curso orientado al desarrollo del razonamiento matemático y la resolución de problemas.', competencies: ['Resuelve problemas de cantidad', 'Resuelve problemas de regularidad, equivalencia y cambio', 'Resuelve problemas de forma, movimiento y localización', 'Resuelve problemas de gestión de datos e incertidumbre'] },
        { name: 'Comunicación', emoji: '📖', desc: 'Desarrolla competencias relacionadas con la comprensión y producción de textos.', competencies: ['Lee diversos tipos de textos en lengua materna', 'Escribe diversos tipos de textos', 'Se comunica oralmente en lengua materna'] },
        { name: 'Ciencias Sociales', emoji: '🌍', desc: 'Promueve el análisis crítico de la historia, la geografía y la ciudadanía activa.', competencies: ['Construye interpretaciones históricas', 'Gestiona responsablemente el espacio y el ambiente', 'Gestiona responsablemente los recursos económicos', 'Convive y participa democráticamente'] },
        { name: 'Ciencia y Tecnología', emoji: '🔬', desc: 'Fomenta la indagación científica a través de experimentos y el análisis de fenómenos naturales.', competencies: ['Indaga mediante métodos científicos', 'Explica el mundo físico basándose en conocimientos sobre seres vivos', 'Diseña y construye soluciones tecnológicas'] },
        { name: 'Inglés', emoji: '🌐', desc: 'Fortalece las habilidades comunicativas en inglés a través de textos y conversaciones.', competencies: ['Se comunica oralmente en inglés como lengua extranjera', 'Lee diversos tipos de textos en inglés', 'Escribe diversos tipos de textos en inglés'] },
        { name: 'Educación Física', emoji: '⚽', desc: 'Promueve el bienestar físico, la salud integral y la práctica deportiva responsable.', competencies: ['Se desenvuelve de manera autónoma a través de su motricidad', 'Asume una vida saludable', 'Interactúa a través de sus habilidades sociomotrices'] },
        { name: 'Arte y Cultura', emoji: '🎨', desc: 'Estimula la expresión artística y la apreciación de manifestaciones culturales del Perú.', competencies: ['Aprecia de manera crítica manifestaciones artístico-culturales', 'Crea proyectos desde los lenguajes artísticos'] },
    ],
    '5to Secundaria': [
        { name: 'Matemáticas', emoji: '📐', desc: 'Consolida el pensamiento matemático avanzado con énfasis en cálculo y estadística inferencial.', competencies: ['Resuelve problemas de cantidad', 'Resuelve problemas de regularidad, equivalencia y cambio', 'Resuelve problemas de forma, movimiento y localización', 'Resuelve problemas de gestión de datos e incertidumbre'] },
        { name: 'Comunicación', emoji: '📖', desc: 'Perfecciona la argumentación oral y escrita preparando al estudiante para la vida académica.', competencies: ['Lee diversos tipos de textos en lengua materna', 'Escribe diversos tipos de textos', 'Se comunica oralmente en lengua materna'] },
        { name: 'Ciencias Sociales', emoji: '🌍', desc: 'Analiza la realidad peruana contemporánea, globalización y perspectivas de desarrollo sostenible.', competencies: ['Construye interpretaciones históricas', 'Gestiona responsablemente el espacio y el ambiente', 'Gestiona responsablemente los recursos económicos', 'Convive y participa democráticamente'] },
        { name: 'Ciencia y Tecnología', emoji: '🔬', desc: 'Integra física, química y biología con enfoque en aplicaciones tecnológicas y medioambientales.', competencies: ['Indaga mediante métodos científicos', 'Explica el mundo físico basándose en conocimientos sobre seres vivos', 'Diseña y construye soluciones tecnológicas'] },
        { name: 'Inglés', emoji: '🌐', desc: 'Consolida el nivel B1 del Marco Europeo para la comunicación académica y profesional.', competencies: ['Se comunica oralmente en inglés como lengua extranjera', 'Lee diversos tipos de textos en inglés', 'Escribe diversos tipos de textos en inglés'] },
        { name: 'Educación Física', emoji: '⚽', desc: 'Orienta al estudiante hacia un estilo de vida activo y saludable con visión a largo plazo.', competencies: ['Se desenvuelve de manera autónoma a través de su motricidad', 'Asume una vida saludable', 'Interactúa a través de sus habilidades sociomotrices'] },
        { name: 'Arte y Cultura', emoji: '🎨', desc: 'Cierra el ciclo artístico con proyectos creativos integradores y reflexión cultural profunda.', competencies: ['Aprecia de manera crítica manifestaciones artístico-culturales', 'Crea proyectos desde los lenguajes artísticos'] },
    ],
};
function AdminCursosView({ onNavigate }) {
    const [selectedGrade, setSelectedGrade] = useState('4to Secundaria');
    const [openModal, setOpenModal] = useState(null);
    const [checked, setChecked] = useState({});
    const [saved, setSaved] = useState({});
    const courses = COURSES_BY_GRADE[selectedGrade] ?? [];
    const toggleComp = (courseKey, comp) => {
        setChecked(prev => ({
            ...prev,
            [courseKey]: { ...prev[courseKey], [comp]: !prev[courseKey]?.[comp] },
        }));
        setSaved(prev => ({ ...prev, [courseKey]: false }));
    };
    const handleSave = (courseKey) => {
        setSaved(prev => ({ ...prev, [courseKey]: true }));
        setOpenModal(null);
    };
    const courseKey = (grade, name) => `${grade}::${name}`;
    const activeCourse = openModal ? courses.find(c => courseKey(selectedGrade, c.name) === openModal) : null;
    return (<div>
      {/* Breadcrumb */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24 }}>
        {['Inicio', 'Gestión', 'Cursos'].map((crumb, i, arr) => (<span key={crumb} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span onClick={() => i === 0 && onNavigate('inicio')} style={{ fontSize: 12, color: i === arr.length - 1 ? '#00236f' : '#94a3b8', fontWeight: i === arr.length - 1 ? 600 : 400, cursor: i < arr.length - 1 ? 'pointer' : 'default' }} onMouseEnter={e => { if (i < arr.length - 1)
            e.currentTarget.style.color = '#475569'; }} onMouseLeave={e => { if (i < arr.length - 1)
            e.currentTarget.style.color = '#94a3b8'; }}>{crumb}</span>
            {i < arr.length - 1 && (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>)}
          </span>))}
      </nav>

      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#121c2a', letterSpacing: '-0.02em', margin: '0 0 6px' }}>Cursos</h1>
        <p style={{ fontSize: 13, color: '#64748b', margin: 0, lineHeight: 1.6 }}>Consulta y gestiona los cursos asociados a cada grado académico.</p>
      </div>

      {/* Grade selector */}
      <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '18px 20px', marginBottom: 24, boxShadow: '0 1px 3px rgba(0,35,111,0.04)' }}>
        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8 }}>
          Grado académico
        </label>
        <div style={{ position: 'relative', display: 'inline-block', minWidth: 220 }}>
          <select value={selectedGrade} onChange={e => setSelectedGrade(e.target.value)} style={{ appearance: 'none', WebkitAppearance: 'none', width: '100%', padding: '9px 36px 9px 13px', fontSize: 14, fontWeight: 500, color: '#121c2a', background: '#f8f9ff', border: '1.5px solid #dde2f0', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', outline: 'none', transition: 'border-color 0.15s' }} onFocus={e => e.currentTarget.style.borderColor = '#0058be'} onBlur={e => e.currentTarget.style.borderColor = '#dde2f0'}>
            {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          <svg style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
      </div>

      {/* Section label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Cursos de {selectedGrade}
        </span>
        <div style={{ flex: 1, height: 1, background: '#f1f4f9' }}/>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600, background: '#eef1fa', color: '#00236f', border: '1px solid #c7d2e6' }}>
          {courses.length} cursos
        </span>
      </div>

      {/* Course cards — 2-column grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 14 }}>
        {courses.map(course => {
            const key = courseKey(selectedGrade, course.name);
            const isSaved = saved[key];
            const checkedCount = Object.values(checked[key] ?? {}).filter(Boolean).length;
            return (<div key={key} style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '20px 20px 16px', boxShadow: '0 1px 4px rgba(0,35,111,0.04)', display: 'flex', flexDirection: 'column', gap: 10, transition: 'box-shadow 0.15s, border-color 0.15s' }} onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,35,111,0.09)'; e.currentTarget.style.borderColor = '#dde2f0'; }} onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,35,111,0.04)'; e.currentTarget.style.borderColor = '#e5e7eb'; }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: '#eef1fa', border: '1px solid #dde2f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                  {course.emoji}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: '#121c2a' }}>{course.name}</span>
                    {isSaved && (<span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 700, background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' }}>
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                        {checkedCount} competencias
                      </span>)}
                  </div>
                  <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0', lineHeight: 1.5 }}>{course.desc}</p>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 6, borderTop: '1px solid #f1f4f9' }}>
                <button onClick={() => setOpenModal(key)} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 16px', borderRadius: 7, border: '1.5px solid #0058be', background: 'transparent', color: '#0058be', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.12s, color 0.12s' }} onMouseEnter={e => { e.currentTarget.style.background = '#0058be'; e.currentTarget.style.color = '#ffffff'; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#0058be'; }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Añadir competencias
                </button>
              </div>
            </div>);
        })}
      </div>

      {/* Competencies modal */}
      {openModal && activeCourse && (<div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 24 }} onClick={e => { if (e.target === e.currentTarget)
            setOpenModal(null); }}>
          <div style={{ background: '#ffffff', borderRadius: 14, width: '100%', maxWidth: 480, boxShadow: '0 20px 60px rgba(0,35,111,0.18)', overflow: 'hidden' }}>
            {/* Modal header */}
            <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #f1f4f9', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 4 }}>Gestión de competencias</div>
                <h2 style={{ fontSize: 17, fontWeight: 700, color: '#121c2a', margin: 0 }}>Competencias de {activeCourse.name}</h2>
                <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0 0' }}>{selectedGrade} — Selecciona las competencias a asignar</p>
              </div>
              <button onClick={() => setOpenModal(null)} style={{ width: 30, height: 30, borderRadius: '50%', border: '1px solid #e5e7eb', background: '#f8f9ff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            {/* Competency list */}
            <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 320, overflowY: 'auto' }}>
              {activeCourse.competencies.map(comp => {
                const isChecked = checked[openModal]?.[comp] ?? false;
                return (<label key={comp} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 14px', borderRadius: 8, border: `1.5px solid ${isChecked ? '#bfdbfe' : '#e5e7eb'}`, background: isChecked ? '#eff6ff' : '#ffffff', cursor: 'pointer', transition: 'all 0.12s' }}>
                    <input type="checkbox" checked={isChecked} onChange={() => toggleComp(openModal, comp)} style={{ width: 16, height: 16, accentColor: '#0058be', flexShrink: 0, marginTop: 1, cursor: 'pointer' }}/>
                    <span style={{ fontSize: 13, color: isChecked ? '#1e40af' : '#374151', fontWeight: isChecked ? 500 : 400, lineHeight: 1.45 }}>{comp}</span>
                  </label>);
            })}
            </div>
            {/* Modal footer */}
            <div style={{ padding: '14px 24px', borderTop: '1px solid #f1f4f9', display: 'flex', justifyContent: 'flex-end', gap: 10, background: '#fafbff' }}>
              <button onClick={() => setOpenModal(null)} style={{ padding: '9px 20px', borderRadius: 7, border: '1.5px solid #e5e7eb', background: '#ffffff', color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.12s' }} onMouseEnter={e => e.currentTarget.style.background = '#f8f9ff'} onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}>Cancelar</button>
              <button onClick={() => handleSave(openModal)} style={{ padding: '9px 20px', borderRadius: 7, border: 'none', background: '#00236f', color: '#ffffff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 2px 8px rgba(0,35,111,0.22)', transition: 'background 0.12s' }} onMouseEnter={e => e.currentTarget.style.background = '#001d5a'} onMouseLeave={e => e.currentTarget.style.background = '#00236f'}>Guardar competencias</button>
            </div>
          </div>
        </div>)}
    </div>);
}
const USUARIOS_INICIAL = [
    { id: 'u1', nombre: 'María', apellido: 'López', dni: '74852136', rol: 'Apoderado', correo: 'maria.lopez@email.com', activo: true, edad: 38, telefono: '+51987654321' },
    { id: 'u2', nombre: 'Carlos', apellido: 'Ramírez', dni: '70482135', rol: 'Estudiante', correo: 'carlos.ramirez@email.com', activo: true, edad: 14, telefono: '+51987654322', codigoEstudiante: 'EST-016', apoderadoId: 'u1' },
    { id: 'u3', nombre: 'Ana', apellido: 'Torres', dni: '72341198', rol: 'Apoderado', correo: 'ana.torres@email.com', activo: true, edad: 42, telefono: '+51987654323' },
    { id: 'u4', nombre: 'Jorge', apellido: 'Herrera', dni: '73456789', rol: 'Docente', correo: 'jorge.herrera@colegio.pe', activo: true, edad: 35, telefono: '+51987654324' },
    { id: 'u5', nombre: 'Lucía', apellido: 'Flores', dni: '75012378', rol: 'Estudiante', correo: 'lucia.flores@email.com', activo: false, edad: 13, telefono: '+51987654325', codigoEstudiante: 'EST-017', apoderadoId: 'u3' },
    { id: 'u6', nombre: 'Miguel', apellido: 'Castro', dni: '71234567', rol: 'Docente', correo: 'miguel.castro@colegio.pe', activo: true, edad: 41, telefono: '+51987654326' },
    { id: 'u7', nombre: 'Patricia', apellido: 'Vega', dni: '76543210', rol: 'Apoderado', correo: 'patricia.vega@email.com', activo: true, edad: 39, telefono: '+51987654327' },
    { id: 'u8', nombre: 'Diego', apellido: 'Salinas', dni: '77654321', rol: 'Estudiante', correo: 'diego.salinas@email.com', activo: true, edad: 15, telefono: '+51987654328', codigoEstudiante: 'EST-018', apoderadoId: 'u7' },
];
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
function UsuariosView({ onNavigate }) {
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
                ...INITIAL_STUDENTS.map(estudiante => estudiante.studentId),
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
/* ═══════════════════════════════════════════════════════════
   MATRÍCULAS VIEW  (Admin only)
══════════════════════════════════════════════════════════════ */
const STUDENT_SEARCH_POOL = [
    { nombre: 'María López García', dni: '74852136', code: 'EST-001' },
    { nombre: 'Carlos Ramírez Soto', dni: '72341198', code: 'EST-002' },
    { nombre: 'Lucas Torres Vega', dni: '75012378', code: 'EST-004' },
    { nombre: 'Sebastián Díaz Lara', dni: '71234567', code: 'EST-006' },
    { nombre: 'Isabella Flores Ruiz', dni: '73456789', code: 'EST-007' },
    { nombre: 'Mateo Herrera Campos', dni: '76543210', code: 'EST-008' },
    { nombre: 'Camila Rojas Montes', dni: '77654321', code: 'EST-009' },
    { nombre: 'Andrés Vega Castillo', dni: '78765432', code: 'EST-010' },
];
const MATRICULAS_RECIENTES = [
    { nombre: 'María López García', grado: '1° Secundaria', seccion: 'A', fecha: '19-09-2026' },
    { nombre: 'Carlos Ramírez Soto', grado: '2° Secundaria', seccion: 'B', fecha: '18-09-2026' },
    { nombre: 'Lucas Torres Vega', grado: '3° Secundaria', seccion: 'A', fecha: '17-09-2026' },
    { nombre: 'Isabella Flores Ruiz', grado: '4° Secundaria', seccion: 'C', fecha: '16-09-2026' },
    { nombre: 'Mateo Herrera Campos', grado: '5° Secundaria', seccion: 'B', fecha: '15-09-2026' },
];
const SECCIONES_POR_GRADO = {
    '1ro Secundaria': ['A', 'B', 'C'],
    '2do Secundaria': ['A', 'B'],
    '3ro Secundaria': ['A', 'B', 'C'],
    '4to Secundaria': ['A', 'B', 'C', 'D'],
    '5to Secundaria': ['A', 'B'],
};
function MatriculasView({ onNavigate }) {
    const [toast, setToast] = useState(null);
    const [modal, setModal] = useState(null);
    const [query1, setQuery1] = useState('');
    const [query2, setQuery2] = useState('');
    const [results1, setResults1] = useState([]);
    const [results2, setResults2] = useState([]);
    const [selected1, setSelected1] = useState(null);
    const [selected2, setSelected2] = useState(null);
    const [grade, setGrade] = useState('');
    const [seccion, setSeccion] = useState('');
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const search = (q, which) => {
        const fn = which === 1 ? setResults1 : setResults2;
        const sq = which === 1 ? setQuery1 : setQuery2;
        sq(q);
        if (q.trim().length < 2) {
            fn([]);
            return;
        }
        fn(STUDENT_SEARCH_POOL.filter(s => s.nombre.toLowerCase().includes(q.toLowerCase()) ||
            s.dni.includes(q) || s.code.toLowerCase().includes(q.toLowerCase())));
    };
    const pickStudent = (s, which) => {
        if (which === 1) {
            setSelected1(s);
            setQuery1('');
            setResults1([]);
        }
        else {
            setSelected2(s);
            setQuery2('');
            setResults2([]);
        }
    };
    const openModal = (m) => {
        setModal(m);
        setSelected1(null);
        setSelected2(null);
        setQuery1('');
        setQuery2('');
        setResults1([]);
        setResults2([]);
        setGrade('');
        setSeccion('');
        setErrors({});
    };
    const closeModal = () => { setModal(null); setErrors({}); };
    const showToastMsg = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(null), 4000);
    };
    const handleAsignar = () => {
        const errs = {};
        if (!selected1)
            errs.alumno = 'Seleccione un alumno.';
        if (!grade)
            errs.grado = 'Seleccione un grado académico.';
        if (!seccion)
            errs.seccion = 'Seleccione una sección.';
        if (Object.keys(errs).length) {
            setErrors(errs);
            return;
        }
        setSubmitting(true);
        setTimeout(() => {
            setSubmitting(false);
            closeModal();
            showToastMsg('El alumno ha sido asignado correctamente a la sección.');
        }, 800);
    };
    const handleCompromiso = () => {
        if (!selected2) {
            setErrors({ alumno2: 'Seleccione un alumno.' });
            return;
        }
        setSubmitting(true);
        setTimeout(() => {
            setSubmitting(false);
            closeModal();
            showToastMsg('El compromiso de pago de matrícula ha sido emitido correctamente.');
        }, 800);
    };
    // Shared sub-components
    const FieldLabel = ({ text }) => (<label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>{text}</label>);
    const ErrorMsg = ({ msg }) => msg
        ? <p style={{ fontSize: 11, color: '#ba1a1a', margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        {msg}
      </p>
        : null;
    const renderStudentSearch = (which) => {
        const q = which === 1 ? query1 : query2;
        const results = which === 1 ? results1 : results2;
        const selected = which === 1 ? selected1 : selected2;
        const errKey = which === 1 ? 'alumno' : 'alumno2';
        return (<div>
        <FieldLabel text="Buscar alumno"/>
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', border: `1.5px solid ${errors[errKey] ? '#ba1a1a' : '#dde2f0'}`, borderRadius: 8, background: '#f8f9ff', transition: 'border-color 0.15s' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input value={q} onChange={e => { search(e.target.value, which); setErrors(prev => ({ ...prev, [errKey]: '' })); }} placeholder="Buscar por nombre, DNI o código..." style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: '#121c2a', width: '100%', fontFamily: 'inherit' }}/>
          </div>
          {results.length > 0 && (<div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.1)', marginTop: 4, overflow: 'hidden' }}>
              {results.map(s => (<button key={s.code} onClick={() => pickStudent(s, which)} style={{ width: '100%', padding: '10px 14px', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', borderBottom: '1px solid #f1f4f9', transition: 'background 0.1s' }} onMouseEnter={e => e.currentTarget.style.background = '#f8f9ff'} onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#121c2a' }}>{s.nombre}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>DNI: {s.dni} · {s.code}</div>
                </button>))}
            </div>)}
        </div>
        <ErrorMsg msg={errors[errKey]}/>
        {selected && (<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Alumno seleccionado</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#121c2a' }}>{selected.nombre}</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>DNI: {selected.dni}</div>
            </div>
            <button onClick={() => which === 1 ? setSelected1(null) : setSelected2(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#94a3b8', borderRadius: 6, transition: 'color 0.12s' }} onMouseEnter={e => e.currentTarget.style.color = '#ba1a1a'} onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>)}
      </div>);
    };
    return (<div>
      {/* Toast */}
      {toast && (<div style={{ position: 'fixed', top: 20, right: 24, zIndex: 99999, background: '#121c2a', color: '#ffffff', padding: '12px 18px', borderRadius: 10, fontSize: 13, fontWeight: 500, boxShadow: '0 8px 28px rgba(0,0,0,0.18)', display: 'flex', alignItems: 'center', gap: 10, maxWidth: 400 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
          {toast}
        </div>)}

      {/* Breadcrumb */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24 }}>
        {['Inicio', 'Matrículas', 'Lista de alumnos'].map((crumb, i, arr) => (<span key={crumb} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span onClick={() => i === 0 && onNavigate('inicio')} style={{ fontSize: 12, color: i === arr.length - 1 ? '#00236f' : '#94a3b8', fontWeight: i === arr.length - 1 ? 600 : 400, cursor: i < arr.length - 1 ? 'pointer' : 'default' }} onMouseEnter={e => { if (i < arr.length - 1)
            e.currentTarget.style.color = '#475569'; }} onMouseLeave={e => { if (i < arr.length - 1)
            e.currentTarget.style.color = '#94a3b8'; }}>{crumb}</span>
            {i < arr.length - 1 && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>}
          </span>))}
      </nav>

      {/* Page header + action buttons */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, marginBottom: 28, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#121c2a', letterSpacing: '-0.02em', margin: '0 0 6px' }}>Matrículas</h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: 0, lineHeight: 1.6 }}>Muestra una lista con los últimos alumnos matriculados.</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button onClick={() => openModal('asignar')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 18px', borderRadius: 8, border: 'none', background: '#00236f', color: '#ffffff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 2px 8px rgba(0,35,111,0.22)', transition: 'background 0.12s' }} onMouseEnter={e => e.currentTarget.style.background = '#001d5a'} onMouseLeave={e => e.currentTarget.style.background = '#00236f'}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Asignar alumno a sección
          </button>
          <button onClick={() => openModal('compromiso')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 18px', borderRadius: 8, border: '1.5px solid #0058be', background: '#ffffff', color: '#0058be', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.12s, color 0.12s' }} onMouseEnter={e => { e.currentTarget.style.background = '#0058be'; e.currentTarget.style.color = '#ffffff'; }} onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.color = '#0058be'; }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            Emitir compromiso de pago de matrícula
          </button>
        </div>
      </div>

      {/* Student list table */}
      <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,35,111,0.04)' }}>
        {/* Table header */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 80px 120px', padding: '0 20px', background: '#f8f9ff', borderBottom: '2px solid #e8eaf0' }}>
          {['NOMBRE COMPLETO', 'GRADO', 'SECCIÓN', 'FECHA'].map(col => (<div key={col} style={{ padding: '11px 0', fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: '0.07em', textTransform: 'uppercase' }}>{col}</div>))}
        </div>
        {/* Rows */}
        {MATRICULAS_RECIENTES.map((row, idx) => (<div key={row.nombre} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 80px 120px', padding: '0 20px', borderBottom: idx < MATRICULAS_RECIENTES.length - 1 ? '1px solid #f1f4f9' : 'none', alignItems: 'center', minHeight: 58, transition: 'background 0.1s' }} onMouseEnter={e => e.currentTarget.style.background = '#fafbff'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: `hsl(${(idx * 60 + 210) % 360},55%,88%)`, border: `2px solid hsl(${(idx * 60 + 210) % 360},45%,76%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: `hsl(${(idx * 60 + 210) % 360},50%,30%)`, flexShrink: 0 }}>
                {row.nombre.split(' ').slice(0, 2).map(w => w[0]).join('')}
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{row.nombre}</span>
            </div>
            <span style={{ fontSize: 13, color: '#374151' }}>{row.grado}</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 7, background: '#eef1fa', border: '1px solid #c7d2e6', fontSize: 12, fontWeight: 700, color: '#00236f' }}>{row.seccion}</span>
            <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>{row.fecha}</span>
          </div>))}
      </div>

      {/* ── Modal: Asignar alumno a sección ── */}
      {modal === 'asignar' && (<div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 24 }} onClick={e => { if (e.target === e.currentTarget)
            closeModal(); }}>
          <div style={{ background: '#ffffff', borderRadius: 14, width: '100%', maxWidth: 480, boxShadow: '0 20px 60px rgba(0,35,111,0.18)' }}>
            {/* Header */}
            <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #f1f4f9', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 4 }}>Gestión académica</div>
                <h2 style={{ fontSize: 17, fontWeight: 700, color: '#121c2a', margin: 0 }}>Asignar alumno a sección</h2>
              </div>
              <button onClick={closeModal} style={{ width: 30, height: 30, borderRadius: '50%', border: '1px solid #e5e7eb', background: '#f8f9ff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            {/* Body */}
            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 18, maxHeight: 420, overflowY: 'auto' }}>
              {renderStudentSearch(1)}

              {/* Grade */}
              <div>
                <FieldLabel text="Grado académico"/>
                <div style={{ position: 'relative' }}>
                  <select value={grade} onChange={e => { setGrade(e.target.value); setSeccion(''); setErrors(prev => ({ ...prev, grado: '' })); }} style={{ appearance: 'none', WebkitAppearance: 'none', width: '100%', padding: '9px 36px 9px 13px', fontSize: 13, color: grade ? '#121c2a' : '#94a3b8', background: '#f8f9ff', border: `1.5px solid ${errors.grado ? '#ba1a1a' : '#dde2f0'}`, borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', outline: 'none', transition: 'border-color 0.15s' }} onFocus={e => e.currentTarget.style.borderColor = '#0058be'} onBlur={e => e.currentTarget.style.borderColor = errors.grado ? '#ba1a1a' : '#dde2f0'}>
                    <option value="">Seleccionar grado...</option>
                    {Object.keys(SECCIONES_POR_GRADO).map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                  <svg style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
                </div>
                <ErrorMsg msg={errors.grado}/>
              </div>

              {/* Section */}
              <div>
                <FieldLabel text="Sección"/>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {(grade ? SECCIONES_POR_GRADO[grade] : []).map(s => (<button key={s} onClick={() => { setSeccion(s); setErrors(prev => ({ ...prev, seccion: '' })); }} style={{ width: 42, height: 42, borderRadius: 8, border: `1.5px solid ${seccion === s ? '#0058be' : '#e2e8f0'}`, background: seccion === s ? '#eff6ff' : '#ffffff', color: seccion === s ? '#0058be' : '#374151', fontSize: 14, fontWeight: seccion === s ? 700 : 500, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.12s' }}>{s}</button>))}
                  {!grade && <span style={{ fontSize: 13, color: '#94a3b8', fontStyle: 'italic', paddingTop: 10 }}>Seleccione primero un grado.</span>}
                </div>
                <ErrorMsg msg={errors.seccion}/>
              </div>
            </div>
            {/* Footer */}
            <div style={{ padding: '14px 24px', borderTop: '1px solid #f1f4f9', display: 'flex', justifyContent: 'flex-end', gap: 10, background: '#fafbff' }}>
              <button onClick={closeModal} style={{ padding: '9px 20px', borderRadius: 7, border: '1.5px solid #e5e7eb', background: '#ffffff', color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.12s' }} onMouseEnter={e => e.currentTarget.style.background = '#f8f9ff'} onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}>Cancelar</button>
              <button onClick={handleAsignar} disabled={submitting} style={{ padding: '9px 24px', borderRadius: 7, border: 'none', background: (!selected1 || !grade || !seccion) ? '#94a3b8' : '#00236f', color: '#ffffff', fontSize: 13, fontWeight: 700, cursor: (!selected1 || !grade || !seccion) ? 'not-allowed' : 'pointer', fontFamily: 'inherit', boxShadow: (!selected1 || !grade || !seccion) ? 'none' : '0 2px 8px rgba(0,35,111,0.22)', transition: 'background 0.15s' }} onMouseEnter={e => { if (selected1 && grade && seccion)
            e.currentTarget.style.background = '#001d5a'; }} onMouseLeave={e => { if (selected1 && grade && seccion)
            e.currentTarget.style.background = '#00236f'; }}>{submitting ? 'Guardando...' : 'Aceptar'}</button>
            </div>
          </div>
        </div>)}

      {/* ── Modal: Emitir compromiso de pago ── */}
      {modal === 'compromiso' && (<div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 24 }} onClick={e => { if (e.target === e.currentTarget)
            closeModal(); }}>
          <div style={{ background: '#ffffff', borderRadius: 14, width: '100%', maxWidth: 440, boxShadow: '0 20px 60px rgba(0,35,111,0.18)' }}>
            <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #f1f4f9', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 4 }}>Pagos y matrícula</div>
                <h2 style={{ fontSize: 17, fontWeight: 700, color: '#121c2a', margin: 0 }}>Emitir compromiso de pago de matrícula</h2>
              </div>
              <button onClick={closeModal} style={{ width: 30, height: 30, borderRadius: '50%', border: '1px solid #e5e7eb', background: '#f8f9ff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {renderStudentSearch(2)}
            </div>
            <div style={{ padding: '14px 24px', borderTop: '1px solid #f1f4f9', display: 'flex', justifyContent: 'flex-end', gap: 10, background: '#fafbff' }}>
              <button onClick={closeModal} style={{ padding: '9px 20px', borderRadius: 7, border: '1.5px solid #e5e7eb', background: '#ffffff', color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.12s' }} onMouseEnter={e => e.currentTarget.style.background = '#f8f9ff'} onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}>Cancelar</button>
              <button onClick={handleCompromiso} disabled={submitting} style={{ padding: '9px 24px', borderRadius: 7, border: 'none', background: !selected2 ? '#94a3b8' : '#00236f', color: '#ffffff', fontSize: 13, fontWeight: 700, cursor: !selected2 ? 'not-allowed' : 'pointer', fontFamily: 'inherit', boxShadow: !selected2 ? 'none' : '0 2px 8px rgba(0,35,111,0.22)', transition: 'background 0.15s' }} onMouseEnter={e => { if (selected2)
            e.currentTarget.style.background = '#001d5a'; }} onMouseLeave={e => { if (selected2)
            e.currentTarget.style.background = '#00236f'; }}>{submitting ? 'Emitiendo...' : 'Aceptar'}</button>
            </div>
          </div>
        </div>)}
    </div>);
}
/* ═══════════════════════════════════════════════════════════
   DASHBOARD VIEW
══════════════════════════════════════════════════════════════ */
function DashboardView() {
    return (<div>
      <div style={{ marginBottom: 28, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 4 }}>Año Escolar 2026</div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>Panel de Control Principal</h1>
        </div>
        <div style={{ fontSize: 12, color: '#64748b', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '7px 14px', fontWeight: 500 }}>📅 18 Sep 2026 — Semana 38</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <MetricCard title="Alumnos Matriculados" value="450" change="+12 este mes" changePositive icon={<UsersIcon size={20} color="#00236f"/>} accent="#00236f" accentBg="#eff3ff"/>
        <MetricCard title="Asistencia de Hoy" value="95%" change="+2% vs ayer" changePositive icon={<CalendarCheckIcon size={20} color="#16a34a"/>} accent="#16a34a" accentBg="#f0fdf4" valueColor="#16a34a"/>
        <MetricCard title="Pagos Pendientes" value="12" change="3 vencen hoy" changePositive={false} icon={<CreditCardIcon size={20} color="#d97706"/>} accent="#d97706" accentBg="#fffbeb" valueColor="#d97706"/>
        <MetricCard title="Deuda Vencida" value="$4,500" change="↑ $320 esta semana" changePositive={false} icon={<ExclamationIcon size={20} color="#ba1a1a"/>} accent="#ba1a1a" accentBg="#fff1f1" valueColor="#ba1a1a"/>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>
        <div style={{ background: '#ffffff', borderRadius: 8, border: '1px solid #e8eaf0', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #f1f4f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0, letterSpacing: '-0.01em' }}>Últimos Pagos Registrados</h2>
              <p style={{ fontSize: 12, color: '#94a3b8', margin: '2px 0 0' }}>Mostrando los 6 registros más recientes</p>
            </div>
            <button style={{ fontSize: 12, fontWeight: 600, color: '#00236f', background: '#eff3ff', border: '1px solid #dbeafe', borderRadius: 6, padding: '6px 14px', cursor: 'pointer' }}>Ver todos →</button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8f9ff' }}>
                {['Alumno', 'Fecha', 'Concepto', 'Estado'].map(col => (<th key={col} style={{ textAlign: 'left', padding: '10px 24px', fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: '0.06em', textTransform: 'uppercase', borderBottom: '1px solid #f1f4f9' }}>{col}</th>))}
              </tr>
            </thead>
            <tbody>
              {PAYMENTS.map((row, i) => {
            const cfg = STATUS_CONFIG[row.estado];
            return (<tr key={i} style={{ borderBottom: i < PAYMENTS.length - 1 ? '1px solid #f8f9fc' : 'none' }} onMouseEnter={e => (e.currentTarget.style.background = '#fafbff')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <td style={{ padding: '14px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 30, height: 30, borderRadius: '50%', background: `hsl(${(row.alumno.charCodeAt(0) * 47) % 360},60%,90%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: `hsl(${(row.alumno.charCodeAt(0) * 47) % 360},60%,32%)`, flexShrink: 0 }}>{row.alumno.charAt(0)}</div>
                        <span style={{ fontSize: 13, fontWeight: 500, color: '#1e293b' }}>{row.alumno}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 24px', fontSize: 13, color: '#64748b', whiteSpace: 'nowrap' }}>{new Date(row.fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td style={{ padding: '14px 24px', fontSize: 13, color: '#374151' }}>{row.concepto}</td>
                    <td style={{ padding: '14px 24px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}`, letterSpacing: '0.02em' }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: cfg.text, display: 'inline-block' }}/>
                        {row.estado}
                      </span>
                    </td>
                  </tr>);
        })}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: '#ffffff', borderRadius: 8, border: '1px solid #e8eaf0', padding: '20px 24px' }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', margin: '0 0 16px' }}>Distribución de Estado</h3>
            {[{ label: 'Pagados al día', count: 385, total: 450, color: '#16a34a' }, { label: 'Pendientes', count: 53, total: 450, color: '#d97706' }, { label: 'Morosos', count: 12, total: 450, color: '#ba1a1a' }].map(item => (<div key={item.label} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>{item.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#1e293b' }}>{item.count}</span>
                </div>
                <div style={{ height: 6, borderRadius: 999, background: '#f1f4f9', overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 999, background: item.color, width: `${(item.count / item.total) * 100}%` }}/>
                </div>
              </div>))}
          </div>
          <div style={{ background: '#ffffff', borderRadius: 8, border: '1px solid #e8eaf0', padding: '20px 24px', flex: 1 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', margin: '0 0 16px' }}>Próximos Eventos</h3>
            {[{ date: '20 Sep', label: 'Examen Parcial — 3er Año', type: 'exam' }, { date: '25 Sep', label: 'Reunión de Padres', type: 'meeting' }, { date: '30 Sep', label: 'Cierre Mes Sep — Pagos', type: 'payment' }, { date: '05 Oct', label: 'Inicio 2do Parcial', type: 'exam' }].map(ev => (<div key={ev.date} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ minWidth: 44, background: '#eff3ff', borderRadius: 6, padding: '4px 0', textAlign: 'center', border: '1px solid #dbeafe' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#00236f' }}>{ev.date.split(' ')[0]}</div>
                  <div style={{ fontSize: 9, color: '#3b82f6', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: 1 }}>{ev.date.split(' ')[1]}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: '#374151', lineHeight: '1.4' }}>{ev.label}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>{ev.type === 'exam' ? 'Evaluación' : ev.type === 'meeting' ? 'Reunión' : 'Administrativo'}</div>
                </div>
              </div>))}
          </div>
        </div>
      </div>
    </div>);
}
function MetricCard({ title, value, change, changePositive, icon, accent, accentBg, valueColor }) {
    return (<div style={{ background: '#ffffff', borderRadius: 8, border: '1px solid #e8eaf0', padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 12 }} onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,35,111,0.07)'; }} onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>{title}</span>
        <div style={{ width: 34, height: 34, borderRadius: 8, background: accentBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
      </div>
      <div>
        <div style={{ fontSize: 30, fontWeight: 800, color: valueColor ?? '#0f172a', letterSpacing: '-0.03em', lineHeight: '1' }}>{value}</div>
        <div style={{ marginTop: 6, fontSize: 11, color: changePositive ? '#16a34a' : '#64748b', fontWeight: 500 }}>{changePositive ? '▲ ' : ''}{change}</div>
      </div>
    </div>);
}
/* ═══════════════════════════════════════════════════════════
   AUDITORÍAS VIEW
══════════════════════════════════════════════════════════════ */
const AUDIT_RECORDS = [
    { ts: '2026-09-19 08:47', user: 'Prof. García', role: 'Docente', action: 'Modificó nota: EST-001', module: 'Notas', detail: 'B → A' },
    { ts: '2026-09-19 08:31', user: 'Admin', role: 'Administrador', action: 'Creó usuario: garcia@colegio', module: 'Usuarios', detail: 'Nuevo docente' },
    { ts: '2026-09-18 17:55', user: 'Prof. Quispe', role: 'Docente', action: 'Registró asistencia', module: 'Asistencia', detail: '4to B — 15 alumnos' },
    { ts: '2026-09-18 16:40', user: 'Admin', role: 'Administrador', action: 'Eliminó matrícula: EST-088', module: 'Matrículas', detail: 'Baja voluntaria' },
    { ts: '2026-09-18 15:12', user: 'Tesorero Lima', role: 'Tesorería', action: 'Registró pago: PEN-2244', module: 'Pagos', detail: 'S/. 350 — García Sofía' },
    { ts: '2026-09-18 14:32', user: 'Prof. García', role: 'Docente', action: 'Modificó horario: Aula 204', module: 'Horarios', detail: 'Lun 08:00 → 09:30' },
    { ts: '2026-09-18 13:08', user: 'Admin', role: 'Administrador', action: 'Exportó libreta PDF', module: 'Notas', detail: 'EST-004 · 4to B' },
    { ts: '2026-09-18 11:50', user: 'Prof. Delgado', role: 'Docente', action: 'Registró asistencia', module: 'Asistencia', detail: '5to A — 28 alumnos' },
    { ts: '2026-09-17 16:05', user: 'Admin', role: 'Administrador', action: 'Actualizó configuración', module: 'Sistema', detail: 'Año escolar 2026' },
    { ts: '2026-09-17 14:22', user: 'Prof. Llanos', role: 'Docente', action: 'Agregó competencia evaluada', module: 'Evaluaciones', detail: '3er C — Ciencias' },
    { ts: '2026-09-17 10:33', user: 'Tesorero Lima', role: 'Tesorería', action: 'Registró pago: PEN-2243', module: 'Pagos', detail: 'S/. 350 — Torres Miguel' },
    { ts: '2026-09-16 09:14', user: 'Admin', role: 'Administrador', action: 'Matriculó alumno: EST-091', module: 'Matrículas', detail: '1er A — Año 2026' },
];
const MODULE_COLORS = {
    'Notas': { bg: '#eff6ff', text: '#0058be', border: '#bfdbfe' },
    'Usuarios': { bg: '#eef1fa', text: '#00236f', border: '#c7d2e6' },
    'Asistencia': { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' },
    'Matrículas': { bg: '#f5f3ff', text: '#7c3aed', border: '#ddd6fe' },
    'Pagos': { bg: '#fffbeb', text: '#d97706', border: '#fde68a' },
    'Horarios': { bg: '#e0f2fe', text: '#0369a1', border: '#bae6fd' },
    'Evaluaciones': { bg: '#fdf2f8', text: '#9d174d', border: '#fbcfe8' },
    'Sistema': { bg: '#f1f5f9', text: '#475569', border: '#e2e8f0' },
};
function AuditoriasView() {
    const [filterModule, setFilterModule] = useState('Todos');
    const [search, setSearch] = useState('');
    const modules = ['Todos', ...Array.from(new Set(AUDIT_RECORDS.map(r => r.module)))];
    const visible = AUDIT_RECORDS
        .filter(r => filterModule === 'Todos' || r.module === filterModule)
        .filter(r => !search || r.user.toLowerCase().includes(search.toLowerCase()) || r.action.toLowerCase().includes(search.toLowerCase()) || r.module.toLowerCase().includes(search.toLowerCase()));
    return (<div>
      {/* Breadcrumb */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
        {['Inicio', 'Administración', 'Auditorías'].map((crumb, i, arr) => (<span key={crumb} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, color: i === arr.length - 1 ? '#00236f' : '#94a3b8', fontWeight: i === arr.length - 1 ? 600 : 400 }}>{crumb}</span>
            {i < arr.length - 1 && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>}
          </span>))}
      </nav>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 4 }}>Módulo de Administración</div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>Auditorías del Sistema</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '8px 14px' }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#16a34a' }}/>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#15803d' }}>{AUDIT_RECORDS.length} registros · Últimos 4 días</span>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 14px', minWidth: 260 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar usuario, acción o módulo..." style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: '#374151', width: '100%', fontFamily: 'inherit' }}/>
        </div>
        {/* Module filter chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {modules.map(m => {
            const active = filterModule === m;
            const cfg = MODULE_COLORS[m];
            return (<button key={m} onClick={() => setFilterModule(m)} style={{
                    padding: '5px 12px', borderRadius: 999, border: '1px solid', fontFamily: 'inherit', fontSize: 11, fontWeight: active ? 700 : 500, cursor: 'pointer',
                    background: active && cfg ? cfg.bg : active ? '#eef1fa' : '#ffffff',
                    color: active && cfg ? cfg.text : active ? '#00236f' : '#64748b',
                    borderColor: active && cfg ? cfg.border : active ? '#c7d2e6' : '#e2e8f0',
                    transition: 'all 0.12s',
                }}>{m}</button>);
        })}
        </div>
      </div>

      {/* Summary chips */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, padding: '10px 16px', background: '#ffffff', borderRadius: 8, border: '1px solid #e8eaf0', boxShadow: '0 1px 3px rgba(0,35,111,0.04)' }}>
        {[
            { label: 'Total acciones', value: AUDIT_RECORDS.length, color: '#00236f' },
            { label: 'Módulos activos', value: new Set(AUDIT_RECORDS.map(r => r.module)).size, color: '#0058be' },
            { label: 'Usuarios únicos', value: new Set(AUDIT_RECORDS.map(r => r.user)).size, color: '#7c3aed' },
            { label: 'Mostrando ahora', value: visible.length, color: '#16a34a' },
        ].map((s, i) => (<div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.value}</span>
              <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>{s.label}</span>
            </div>
            {i < 3 && <div style={{ width: 1, height: 20, background: '#f1f4f9' }}/>}
          </div>))}
      </div>

      {/* Table */}
      <div style={{ background: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,35,111,0.04)' }}>
        {/* Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '160px 160px 120px 140px 1fr', padding: '0 24px', background: '#f8f9ff', borderBottom: '2px solid #e8eaf0' }}>
          {['FECHA Y HORA', 'USUARIO', 'ROL', 'MÓDULO', 'ACCIÓN'].map((col, i) => (<div key={col} style={{ padding: '11px 0', fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: '0.07em', textTransform: 'uppercase', textAlign: 'left', paddingRight: 12 }}>{col}</div>))}
        </div>
        {visible.length === 0 ? (<div style={{ padding: '40px 24px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>Sin registros que coincidan con el filtro.</div>) : visible.map((rec, idx) => {
            const modCfg = MODULE_COLORS[rec.module] ?? { bg: '#f1f5f9', text: '#475569', border: '#e2e8f0' };
            return (<div key={idx} style={{ display: 'grid', gridTemplateColumns: '160px 160px 120px 140px 1fr', padding: '0 24px', borderBottom: idx < visible.length - 1 ? '1px solid #f1f4f9' : 'none', alignItems: 'center', minHeight: 56, transition: 'background 0.1s' }} onMouseEnter={e => e.currentTarget.style.background = '#fafbff'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              {/* Timestamp */}
              <div style={{ paddingRight: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', fontVariantNumeric: 'tabular-nums' }}>{rec.ts.split(' ')[0]}</div>
                <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>{rec.ts.split(' ')[1]}</div>
              </div>
              {/* User */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingRight: 12 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: `hsl(${(rec.user.charCodeAt(0) * 41) % 360},55%,88%)`, border: `1.5px solid hsl(${(rec.user.charCodeAt(0) * 41) % 360},50%,76%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: `hsl(${(rec.user.charCodeAt(0) * 41) % 360},55%,30%)`, flexShrink: 0 }}>
                  {rec.user.split(' ').map(w => w[0]).slice(0, 2).join('')}
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{rec.user}</span>
              </div>
              {/* Role */}
              <div style={{ paddingRight: 12 }}>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>{rec.role}</span>
              </div>
              {/* Module */}
              <div style={{ paddingRight: 12 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 9px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: modCfg.bg, color: modCfg.text, border: `1px solid ${modCfg.border}` }}>
                  {rec.module}
                </span>
              </div>
              {/* Action */}
              <div>
                <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{rec.action}</span>
              </div>
            </div>);
        })}
      </div>

      <div style={{ marginTop: 10, fontSize: 11, color: '#94a3b8', textAlign: 'right' }}>
        Los registros de auditoría son de solo lectura. Se retienen por 90 días según política institucional.
      </div>
    </div>);
}
/* ═══════════════════════════════════════════════════════════
   LOG DE ERRORES VIEW
══════════════════════════════════════════════════════════════ */
const ERROR_RECORDS = [
    { ts: '2026-09-19 08:33', module: 'Notas', operation: 'Guardar calificación', errorType: 'ValidationError', message: 'Valor fuera de rango: se esperaba AD/A/B/C', user: 'Prof. García' },
    { ts: '2026-09-19 07:55', module: 'Pagos', operation: 'Registrar pago', errorType: 'DuplicateKeyException', message: 'El número de boleta PEN-2245 ya existe', user: 'Tesorero Lima' },
    { ts: '2026-09-18 16:42', module: 'Matrículas', operation: 'Registrar matrícula', errorType: 'NullPointerException', message: 'Error al registrar la matrícula: alumno sin DNI', user: 'Admin' },
    { ts: '2026-09-18 15:03', module: 'Horarios', operation: 'Guardar asignación', errorType: 'ConflictException', message: 'Conflicto de aula: Aula 204 ya está ocupada a las 08:00', user: 'Admin' },
    { ts: '2026-09-18 11:28', module: 'Autenticación', operation: 'Iniciar sesión', errorType: 'AuthenticationError', message: 'Credenciales inválidas — 3 intentos fallidos', user: 'user@desconocido' },
    { ts: '2026-09-17 17:14', module: 'Notas', operation: 'Exportar PDF', errorType: 'TimeoutException', message: 'Tiempo de espera agotado al generar el documento', user: 'Prof. Delgado' },
    { ts: '2026-09-17 14:51', module: 'Usuarios', operation: 'Actualizar perfil', errorType: 'ConstraintViolation', message: 'El correo garcia@sanmarcos ya está en uso', user: 'Admin' },
    { ts: '2026-09-16 10:09', module: 'Asistencia', operation: 'Guardar lista', errorType: 'NetworkError', message: 'Fallo al sincronizar con servidor de respaldo', user: 'Prof. Quispe' },
    { ts: '2026-09-15 16:30', module: 'Reportes', operation: 'Generar reporte global', errorType: 'OutOfMemoryError', message: 'Reporte demasiado grande; limite 5 000 filas', user: 'Admin' },
];
const ERROR_TYPE_COLORS = {
    'ValidationError': { bg: '#fffbeb', text: '#b45309', border: '#fde68a' },
    'DuplicateKeyException': { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa' },
    'NullPointerException': { bg: '#fff1f1', text: '#991b1b', border: '#fecaca' },
    'ConflictException': { bg: '#fff1f1', text: '#ba1a1a', border: '#fecaca' },
    'AuthenticationError': { bg: '#fdf4ff', text: '#7e22ce', border: '#e9d5ff' },
    'TimeoutException': { bg: '#f0f9ff', text: '#0369a1', border: '#bae6fd' },
    'ConstraintViolation': { bg: '#fffbeb', text: '#b45309', border: '#fde68a' },
    'NetworkError': { bg: '#eef1fa', text: '#00236f', border: '#c7d2e6' },
    'OutOfMemoryError': { bg: '#fff1f1', text: '#991b1b', border: '#fecaca' },
};
function LogErroresView() {
    const [filterModule, setFilterModule] = useState('Todos');
    const [search, setSearch] = useState('');
    const modules = ['Todos', ...Array.from(new Set(ERROR_RECORDS.map(r => r.module)))];
    const visible = ERROR_RECORDS
        .filter(r => filterModule === 'Todos' || r.module === filterModule)
        .filter(r => !search || r.message.toLowerCase().includes(search.toLowerCase()) || r.module.toLowerCase().includes(search.toLowerCase()) || r.errorType.toLowerCase().includes(search.toLowerCase()));
    return (<div>
      {/* Breadcrumb */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
        {['Inicio', 'Administración', 'Log de errores'].map((crumb, i, arr) => (<span key={crumb} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, color: i === arr.length - 1 ? '#00236f' : '#94a3b8', fontWeight: i === arr.length - 1 ? 600 : 400 }}>{crumb}</span>
            {i < arr.length - 1 && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>}
          </span>))}
      </nav>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 4 }}>Módulo de Administración</div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>Log de Errores del Sistema</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff1f1', border: '1px solid #fecaca', borderRadius: 8, padding: '8px 14px' }}>
          <WarningIcon size={14} color="#ba1a1a"/>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#ba1a1a' }}>{ERROR_RECORDS.length} errores · Últimos 5 días</span>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 14px', minWidth: 260 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar mensaje, tipo o módulo..." style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: '#374151', width: '100%', fontFamily: 'inherit' }}/>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {modules.map(m => {
            const active = filterModule === m;
            const cfg = MODULE_COLORS[m];
            return (<button key={m} onClick={() => setFilterModule(m)} style={{
                    padding: '5px 12px', borderRadius: 999, border: '1px solid', fontFamily: 'inherit', fontSize: 11, fontWeight: active ? 700 : 500, cursor: 'pointer',
                    background: active && cfg ? cfg.bg : active ? '#fff1f1' : '#ffffff',
                    color: active && cfg ? cfg.text : active ? '#ba1a1a' : '#64748b',
                    borderColor: active && cfg ? cfg.border : active ? '#fecaca' : '#e2e8f0',
                    transition: 'all 0.12s',
                }}>{m}</button>);
        })}
        </div>
      </div>

      {/* Summary */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, padding: '10px 16px', background: '#ffffff', borderRadius: 8, border: '1px solid #e8eaf0', boxShadow: '0 1px 3px rgba(0,35,111,0.04)' }}>
        {[
            { label: 'Total errores', value: ERROR_RECORDS.length, color: '#ba1a1a' },
            { label: 'Módulos afectados', value: new Set(ERROR_RECORDS.map(r => r.module)).size, color: '#d97706' },
            { label: 'Usuarios involucrados', value: new Set(ERROR_RECORDS.map(r => r.user)).size, color: '#0058be' },
            { label: 'Mostrando ahora', value: visible.length, color: '#16a34a' },
        ].map((s, i) => (<div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.value}</span>
              <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>{s.label}</span>
            </div>
            {i < 3 && <div style={{ width: 1, height: 20, background: '#f1f4f9' }}/>}
          </div>))}
      </div>

      {/* Table */}
      <div style={{ background: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,35,111,0.04)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '150px 130px 200px 190px 1fr', padding: '0 24px', background: '#f8f9ff', borderBottom: '2px solid #e8eaf0' }}>
          {['FECHA Y HORA', 'MÓDULO', 'OPERACIÓN', 'TIPO DE ERROR', 'MENSAJE'].map(col => (<div key={col} style={{ padding: '11px 0 11px', fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: '0.07em', textTransform: 'uppercase', paddingRight: 12 }}>{col}</div>))}
        </div>
        {visible.length === 0 ? (<div style={{ padding: '40px 24px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>Sin errores que coincidan con el filtro.</div>) : visible.map((rec, idx) => {
            const typeCfg = ERROR_TYPE_COLORS[rec.errorType] ?? { bg: '#f1f5f9', text: '#475569', border: '#e2e8f0' };
            const modCfg = MODULE_COLORS[rec.module] ?? { bg: '#f1f5f9', text: '#475569', border: '#e2e8f0' };
            return (<div key={idx} style={{ display: 'grid', gridTemplateColumns: '150px 130px 200px 190px 1fr', padding: '0 24px', borderBottom: idx < visible.length - 1 ? '1px solid #f1f4f9' : 'none', borderLeft: '3px solid #fecaca', alignItems: 'center', minHeight: 60, transition: 'background 0.1s', background: '#fffefe' }} onMouseEnter={e => e.currentTarget.style.background = '#fff8f8'} onMouseLeave={e => e.currentTarget.style.background = '#fffefe'}>
              {/* Timestamp */}
              <div style={{ paddingRight: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', fontVariantNumeric: 'tabular-nums' }}>{rec.ts.split(' ')[0]}</div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>{rec.ts.split(' ')[1]}</div>
              </div>
              {/* Module */}
              <div style={{ paddingRight: 12 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 9px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: modCfg.bg, color: modCfg.text, border: `1px solid ${modCfg.border}` }}>
                  {rec.module}
                </span>
              </div>
              {/* Operation */}
              <div style={{ paddingRight: 12 }}>
                <span style={{ fontSize: 12, color: '#374151', fontWeight: 500 }}>{rec.operation}</span>
              </div>
              {/* Error type */}
              <div style={{ paddingRight: 12 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: typeCfg.bg, color: typeCfg.text, border: `1px solid ${typeCfg.border}` }}>
                  {rec.errorType}
                </span>
              </div>
              {/* Message + user inline */}
              <div>
                <div style={{ fontSize: 12, color: '#1e293b', fontWeight: 500, lineHeight: '1.45' }}>{rec.message}</div>
                {rec.user && (<div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 3 }}>
                    <PersonIcon size={11} color="#94a3b8"/>
                    <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>{rec.user}</span>
                  </div>)}
              </div>
            </div>);
        })}
      </div>

      <div style={{ marginTop: 10, fontSize: 11, color: '#94a3b8', textAlign: 'right' }}>
        Los errores se retienen 30 días. Contacta al área de sistemas para investigar errores críticos.
      </div>
    </div>);
}
/* ═══════════════════════════════════════════════════════════
   PAGOS VIEW  (admin only)
══════════════════════════════════════════════════════════════ */
const ALUMNOS_PAGOS = [
    { id: '1', nombre: 'María López García', dni: '74852136', initials: 'ML', hue: 210 },
    { id: '2', nombre: 'Carlos Ramírez Soto', dni: '72341198', initials: 'CR', hue: 30 },
    { id: '4', nombre: 'Lucas Torres Vega', dni: '75012378', initials: 'LT', hue: 160 },
    { id: '6', nombre: 'Sebastián Díaz Lara', dni: '71234567', initials: 'SD', hue: 50 },
];
const PAGOS_REALIZADOS_DATA = {
    '1': [
        { fecha: '15/08/2025', concepto: 'Matrícula', monto: 'S/ 350.00', metodo: 'Transferencia' },
        { fecha: '10/08/2025', concepto: 'Pensión - Agosto', monto: 'S/ 300.00', metodo: 'Tarjeta' },
        { fecha: '10/07/2025', concepto: 'Pensión - Julio', monto: 'S/ 300.00', metodo: 'Transferencia' },
    ],
    '2': [
        { fecha: '10/08/2025', concepto: 'Pensión - Agosto', monto: 'S/ 300.00', metodo: 'Efectivo' },
        { fecha: '10/07/2025', concepto: 'Pensión - Julio', monto: 'S/ 300.00', metodo: 'Transferencia' },
    ],
    '3': [
        { fecha: '10/08/2025', concepto: 'Pensión - Agosto', monto: 'S/ 300.00', metodo: 'Tarjeta' },
    ],
    '4': [
        { fecha: '20/03/2025', concepto: 'Matrícula', monto: 'S/ 350.00', metodo: 'Transferencia' },
        { fecha: '10/08/2025', concepto: 'Pensión - Agosto', monto: 'S/ 300.00', metodo: 'Tarjeta' },
        { fecha: '10/07/2025', concepto: 'Pensión - Julio', monto: 'S/ 300.00', metodo: 'Transferencia' },
        { fecha: '10/06/2025', concepto: 'Pensión - Junio', monto: 'S/ 300.00', metodo: 'Efectivo' },
    ],
    '5': [
        { fecha: '10/08/2025', concepto: 'Pensión - Agosto', monto: 'S/ 300.00', metodo: 'Tarjeta' },
        { fecha: '10/07/2025', concepto: 'Pensión - Julio', monto: 'S/ 300.00', metodo: 'Transferencia' },
    ],
    '6': [],
};
const PAGOS_PENDIENTES_DATA = {
    '1': [
        { id: 'p1-1', fechaLimite: '10/09/2025', concepto: 'Pensión - Septiembre', monto: 'S/ 300.00', comprobante: 'Comprobante_pago.pdf', comprobanteSize: '400 KB' },
        { id: 'p1-2', fechaLimite: '10/10/2025', concepto: 'Pensión - Octubre', monto: 'S/ 300.00', comprobante: 'Comprobante_oct.pdf', comprobanteSize: '380 KB' },
        { id: 'p1-3', fechaLimite: '10/11/2025', concepto: 'Pensión - Noviembre', monto: 'S/ 300.00', comprobante: 'Comprobante_nov.pdf', comprobanteSize: '420 KB' },
    ],
    '2': [
        { id: 'p2-1', fechaLimite: '10/09/2025', concepto: 'Pensión - Septiembre', monto: 'S/ 300.00', comprobante: 'Comprobante_pago.pdf', comprobanteSize: '350 KB' },
    ],
    '3': [
        { id: 'p3-1', fechaLimite: '10/09/2025', concepto: 'Pensión - Septiembre', monto: 'S/ 300.00', comprobante: 'Comprobante_pago.pdf', comprobanteSize: '400 KB' },
        { id: 'p3-2', fechaLimite: '10/10/2025', concepto: 'Pensión - Octubre', monto: 'S/ 300.00', comprobante: 'Comprobante_oct.pdf', comprobanteSize: '290 KB' },
    ],
    '4': [
        { id: 'p4-1', fechaLimite: '10/09/2025', concepto: 'Pensión - Septiembre', monto: 'S/ 300.00', comprobante: 'Comprobante_pago.pdf', comprobanteSize: '400 KB' },
    ],
    '5': [
        { id: 'p5-1', fechaLimite: '10/09/2025', concepto: 'Pensión - Septiembre', monto: 'S/ 300.00', comprobante: 'Comprobante_pago.pdf', comprobanteSize: '315 KB' },
        { id: 'p5-2', fechaLimite: '10/10/2025', concepto: 'Pensión - Octubre', monto: 'S/ 300.00', comprobante: 'Comprobante_oct.pdf', comprobanteSize: '400 KB' },
    ],
    '6': [
        { id: 'p6-1', fechaLimite: '10/07/2025', concepto: 'Pensión - Julio', monto: 'S/ 300.00', comprobante: 'Comprobante_jul.pdf', comprobanteSize: '450 KB' },
        { id: 'p6-2', fechaLimite: '10/08/2025', concepto: 'Pensión - Agosto', monto: 'S/ 300.00', comprobante: 'Comprobante_ago.pdf', comprobanteSize: '360 KB' },
        { id: 'p6-3', fechaLimite: '10/09/2025', concepto: 'Pensión - Septiembre', monto: 'S/ 300.00', comprobante: 'Comprobante_sep.pdf', comprobanteSize: '400 KB' },
    ],
};
const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
/* Shared modal overlay wrapper */
function ModalOverlay({ onClose, children }) {
    return (<div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15,23,42,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#ffffff', borderRadius: 14, boxShadow: '0 20px 60px rgba(0,0,0,0.18)', width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
    </div>);
}
/* Student identity chip reused in sub-pages and modals */
function AlumnoChip({ alumno }) {
    return (<div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#f8f9ff', border: '1px solid #e8eaf0', borderRadius: 10, padding: '12px 16px' }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', background: `hsl(${alumno.hue},60%,88%)`, border: `2px solid hsl(${alumno.hue},50%,76%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: `hsl(${alumno.hue},55%,30%)`, flexShrink: 0 }}>
        {alumno.initials}
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#121c2a' }}>{alumno.nombre}</div>
        <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>DNI: {alumno.dni}</div>
      </div>
    </div>);
}
function PagosView() {
    const [subView, setSubView] = useState('lista');
    const [selectedAlumno, setSelectedAlumno] = useState(null);
    const [pendientes, setPendientes] = useState(PAGOS_PENDIENTES_DATA);
    /* Modal: Emitir compromiso */
    const [modalCompromiso, setModalCompromiso] = useState(null);
    const [mesSelected, setMesSelected] = useState('');
    /* Modal: Revisar pago */
    const [modalPago, setModalPago] = useState(null);
    const [showRechazo, setShowRechazo] = useState(false);
    const [rechazoMotivo, setRechazoMotivo] = useState('');
    /* Toast */
    const [toast, setToast] = useState('');
    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };
    const goToLista = () => { setSubView('lista'); setSelectedAlumno(null); };
    const openCompromiso = (a) => { setModalCompromiso(a); setMesSelected(''); };
    const aceptarCompromiso = () => {
        setModalCompromiso(null);
        showToast('El compromiso de matrícula ha sido emitido correctamente.');
    };
    const openRevisarPago = (p) => { setModalPago(p); setShowRechazo(false); setRechazoMotivo(''); };
    const validarPago = () => {
        if (!modalPago || !selectedAlumno)
            return;
        setPendientes(prev => ({ ...prev, [selectedAlumno.id]: prev[selectedAlumno.id].filter(p => p.id !== modalPago.id) }));
        setModalPago(null);
        showToast('El pago ha sido validado correctamente.');
    };
    const confirmarRechazo = () => {
        if (!modalPago || !selectedAlumno)
            return;
        setPendientes(prev => ({ ...prev, [selectedAlumno.id]: prev[selectedAlumno.id].filter(p => p.id !== modalPago.id) }));
        setModalPago(null);
        showToast('El pago ha sido rechazado correctamente.');
    };
    /* ── LISTA DE ALUMNOS ─────────────────────────────────────── */
    const ListaAlumnos = () => (<div>
      <nav style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
        {['Inicio', 'Pagos', 'Lista de alumnos'].map((c, i, arr) => (<span key={c} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, color: i === arr.length - 1 ? '#00236f' : '#94a3b8', fontWeight: i === arr.length - 1 ? 600 : 400 }}>{c}</span>
            {i < arr.length - 1 && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>}
          </span>))}
      </nav>

      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 4 }}>Módulo de Pagos</div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: '0 0 6px' }}>Lista de alumnos</h1>
        <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>Gestiona los pagos y compromisos de matrícula de los estudiantes.</p>
      </div>

      <div style={{ background: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,35,111,0.04)' }}>
        {/* Table header */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', padding: '0 24px', background: '#f8f9ff', borderBottom: '2px solid #e8eaf0' }}>
          <div style={{ padding: '11px 0', fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: '0.07em', textTransform: 'uppercase' }}>ALUMNO</div>
          <div style={{ padding: '11px 0', fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: '0.07em', textTransform: 'uppercase' }}>ACCIONES</div>
        </div>
        {ALUMNOS_PAGOS.map((alumno, idx) => (<div key={alumno.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: idx < ALUMNOS_PAGOS.length - 1 ? '1px solid #f1f4f9' : 'none', gap: 16, transition: 'background 0.1s', flexWrap: 'wrap' }} onMouseEnter={e => e.currentTarget.style.background = '#fafbff'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            {/* Student identity */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', flexShrink: 0, background: `hsl(${alumno.hue},60%,88%)`, border: `2px solid hsl(${alumno.hue},50%,76%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: `hsl(${alumno.hue},55%,30%)` }}>
                {alumno.initials}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#121c2a' }}>{alumno.nombre}</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>DNI: {alumno.dni}</div>
              </div>
            </div>
            {/* Action buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', flexShrink: 0 }}>
              <button onClick={() => openCompromiso(alumno)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 7, border: '1.5px solid #bfdbfe', background: '#eff6ff', color: '#0058be', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', transition: 'all 0.12s' }} onMouseEnter={e => { e.currentTarget.style.background = '#dbeafe'; e.currentTarget.style.borderColor = '#93c5fd'; }} onMouseLeave={e => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.borderColor = '#bfdbfe'; }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
                Emitir compromiso de matrícula
              </button>
              <button onClick={() => { setSelectedAlumno(alumno); setSubView('realizados'); }} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 7, border: '1.5px solid #bbf7d0', background: '#f0fdf4', color: '#16a34a', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', transition: 'all 0.12s' }} onMouseEnter={e => { e.currentTarget.style.background = '#dcfce7'; e.currentTarget.style.borderColor = '#86efac'; }} onMouseLeave={e => { e.currentTarget.style.background = '#f0fdf4'; e.currentTarget.style.borderColor = '#bbf7d0'; }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                Ver pagos realizados
              </button>
              <button onClick={() => { setSelectedAlumno(alumno); setSubView('pendientes'); }} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 7, border: '1.5px solid #fde68a', background: '#fffbeb', color: '#b45309', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', transition: 'all 0.12s' }} onMouseEnter={e => { e.currentTarget.style.background = '#fef3c7'; e.currentTarget.style.borderColor = '#fcd34d'; }} onMouseLeave={e => { e.currentTarget.style.background = '#fffbeb'; e.currentTarget.style.borderColor = '#fde68a'; }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                Ver pagos pendientes
              </button>
            </div>
          </div>))}
      </div>
    </div>);
    /* ── PAGOS REALIZADOS ─────────────────────────────────────── */
    const PagosRealizados = () => {
        if (!selectedAlumno)
            return null;
        const pagos = PAGOS_REALIZADOS_DATA[selectedAlumno.id] ?? [];
        return (<div>
        <nav style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
          {['Inicio', 'Pagos', 'Lista de alumnos', 'Pagos realizados'].map((c, i, arr) => (<span key={c} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span onClick={i === 2 ? goToLista : undefined} style={{ fontSize: 12, color: i === arr.length - 1 ? '#00236f' : '#94a3b8', fontWeight: i === arr.length - 1 ? 600 : 400, cursor: i === 2 ? 'pointer' : 'default' }} onMouseEnter={e => { if (i === 2)
                e.currentTarget.style.color = '#475569'; }} onMouseLeave={e => { if (i === 2)
                e.currentTarget.style.color = '#94a3b8'; }}>
                {c}
              </span>
              {i < arr.length - 1 && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>}
            </span>))}
        </nav>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: '0 0 4px' }}>Pagos realizados</h1>
            <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>Historial de pagos completados del alumno.</p>
          </div>
          <button onClick={goToLista} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 7, border: '1px solid #e2e8f0', background: '#ffffff', color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0, transition: 'all 0.12s' }} onMouseEnter={e => { e.currentTarget.style.background = '#f8f9ff'; e.currentTarget.style.borderColor = '#c7d2e6'; }} onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.borderColor = '#e2e8f0'; }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            Volver
          </button>
        </div>

        <div style={{ marginBottom: 20 }}><AlumnoChip alumno={selectedAlumno}/></div>

        <div style={{ background: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,35,111,0.04)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr 120px 160px 110px', padding: '0 24px', background: '#f8f9ff', borderBottom: '2px solid #e8eaf0' }}>
            {['FECHA', 'CONCEPTO', 'MONTO', 'MÉTODO DE PAGO', 'ESTADO'].map(col => (<div key={col} style={{ padding: '11px 0', fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: '0.07em', textTransform: 'uppercase', paddingRight: 12 }}>{col}</div>))}
          </div>
          {pagos.length === 0 ? (<div style={{ padding: '40px 24px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>Este alumno no tiene pagos registrados aún.</div>) : pagos.map((p, idx) => (<div key={idx} style={{ display: 'grid', gridTemplateColumns: '130px 1fr 120px 160px 110px', padding: '0 24px', borderBottom: idx < pagos.length - 1 ? '1px solid #f1f4f9' : 'none', alignItems: 'center', minHeight: 56, transition: 'background 0.1s' }} onMouseEnter={e => e.currentTarget.style.background = '#fafbff'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <div style={{ fontSize: 13, color: '#374151', fontWeight: 500, paddingRight: 12 }}>{p.fecha}</div>
              <div style={{ fontSize: 13, color: '#1e293b', fontWeight: 500, paddingRight: 12 }}>{p.concepto}</div>
              <div style={{ fontSize: 13, color: '#1e293b', fontWeight: 700, paddingRight: 12 }}>{p.monto}</div>
              <div style={{ fontSize: 13, color: '#374151', fontWeight: 400, paddingRight: 12 }}>{p.metodo}</div>
              <div>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#16a34a' }}/>
                  Pagado
                </span>
              </div>
            </div>))}
        </div>
      </div>);
    };
    /* ── PAGOS PENDIENTES ─────────────────────────────────────── */
    const PagosPendientes = () => {
        if (!selectedAlumno)
            return null;
        const lista = pendientes[selectedAlumno.id] ?? [];
        return (<div>
        <nav style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
          {['Inicio', 'Pagos', 'Lista de alumnos', 'Pagos pendientes'].map((c, i, arr) => (<span key={c} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span onClick={i === 2 ? goToLista : undefined} style={{ fontSize: 12, color: i === arr.length - 1 ? '#00236f' : '#94a3b8', fontWeight: i === arr.length - 1 ? 600 : 400, cursor: i === 2 ? 'pointer' : 'default' }} onMouseEnter={e => { if (i === 2)
                e.currentTarget.style.color = '#475569'; }} onMouseLeave={e => { if (i === 2)
                e.currentTarget.style.color = '#94a3b8'; }}>
                {c}
              </span>
              {i < arr.length - 1 && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>}
            </span>))}
        </nav>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: '0 0 4px' }}>Pagos pendientes</h1>
            <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>Pagos aún no confirmados del alumno.</p>
          </div>
          <button onClick={goToLista} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 7, border: '1px solid #e2e8f0', background: '#ffffff', color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0, transition: 'all 0.12s' }} onMouseEnter={e => { e.currentTarget.style.background = '#f8f9ff'; e.currentTarget.style.borderColor = '#c7d2e6'; }} onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.borderColor = '#e2e8f0'; }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            Volver
          </button>
        </div>

        <div style={{ marginBottom: 20 }}><AlumnoChip alumno={selectedAlumno}/></div>

        <div style={{ background: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,35,111,0.04)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr 120px 130px 130px', padding: '0 24px', background: '#f8f9ff', borderBottom: '2px solid #e8eaf0' }}>
            {['FECHA LÍMITE', 'CONCEPTO', 'MONTO', 'ESTADO', 'ACCIÓN'].map(col => (<div key={col} style={{ padding: '11px 0', fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: '0.07em', textTransform: 'uppercase', paddingRight: 12 }}>{col}</div>))}
          </div>
          {lista.length === 0 ? (<div style={{ padding: '40px 24px', textAlign: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#bbf7d0" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="20 6 9 17 4 12"/></svg>
                <span style={{ fontSize: 13, color: '#16a34a', fontWeight: 600 }}>Sin pagos pendientes</span>
                <span style={{ fontSize: 12, color: '#94a3b8' }}>Este alumno no tiene compromisos de pago pendientes.</span>
              </div>
            </div>) : lista.map((p, idx) => (<div key={p.id} style={{ display: 'grid', gridTemplateColumns: '140px 1fr 120px 130px 130px', padding: '0 24px', borderBottom: idx < lista.length - 1 ? '1px solid #f1f4f9' : 'none', alignItems: 'center', minHeight: 56, background: '#fffdf5', transition: 'background 0.1s' }} onMouseEnter={e => e.currentTarget.style.background = '#fffbeb'} onMouseLeave={e => e.currentTarget.style.background = '#fffdf5'}>
              <div style={{ fontSize: 13, color: '#374151', fontWeight: 600, paddingRight: 12 }}>{p.fechaLimite}</div>
              <div style={{ fontSize: 13, color: '#1e293b', fontWeight: 500, paddingRight: 12 }}>{p.concepto}</div>
              <div style={{ fontSize: 13, color: '#1e293b', fontWeight: 700, paddingRight: 12 }}>{p.monto}</div>
              <div style={{ paddingRight: 12 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a' }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#d97706' }}/>
                  Pendiente
                </span>
              </div>
              <div>
                <button onClick={() => openRevisarPago(p)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 7, border: '1.5px solid #e2e8f0', background: '#ffffff', color: '#374151', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.12s' }} onMouseEnter={e => { e.currentTarget.style.background = '#f8f9ff'; e.currentTarget.style.borderColor = '#0058be'; e.currentTarget.style.color = '#0058be'; }} onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#374151'; }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  Revisar pago
                </button>
              </div>
            </div>))}
        </div>
      </div>);
    };
    return (<div style={{ position: 'relative' }}>
      {/* ── Toast notification ── */}
      {toast && (<div style={{ position: 'fixed', top: 80, right: 32, zIndex: 9999, background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 10, padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 4px 20px rgba(0,0,0,0.12)', maxWidth: 420 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#15803d' }}>{toast}</span>
        </div>)}

      {/* ── Sub-views ── */}
      {subView === 'lista' && <ListaAlumnos />}
      {subView === 'realizados' && <PagosRealizados />}
      {subView === 'pendientes' && <PagosPendientes />}

      {/* ── Modal: Emitir compromiso de matrícula ── */}
      {modalCompromiso && (<ModalOverlay onClose={() => setModalCompromiso(null)}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px 16px', borderBottom: '1px solid #f1f4f9' }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', margin: 0, letterSpacing: '-0.01em' }}>Emitir compromiso de matrícula</h2>
            <button onClick={() => setModalCompromiso(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 4, borderRadius: 6, display: 'flex', alignItems: 'center', transition: 'color 0.12s' }} onMouseEnter={e => e.currentTarget.style.color = '#374151'} onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Alumno info */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Alumno</div>
              <AlumnoChip alumno={modalCompromiso}/>
            </div>

            {/* Mes selector */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Mes</label>
              <div style={{ position: 'relative' }}>
                <select value={mesSelected} onChange={e => setMesSelected(e.target.value)} style={{ appearance: 'none', width: '100%', background: '#ffffff', border: `1.5px solid ${mesSelected ? '#0058be' : '#e2e8f0'}`, borderRadius: 8, padding: '10px 36px 10px 14px', fontSize: 13, color: mesSelected ? '#1e293b' : '#94a3b8', cursor: 'pointer', outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.15s' }}>
                  <option value="">Seleccionar mes...</option>
                  {MESES.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <svg style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
              </div>
            </div>
          </div>

          {/* Footer actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '16px 24px', borderTop: '1px solid #f1f4f9' }}>
            <button onClick={() => setModalCompromiso(null)} style={{ padding: '9px 20px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#ffffff', color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.12s' }} onMouseEnter={e => { e.currentTarget.style.background = '#f8f9ff'; }} onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; }}>
              Cancelar
            </button>
            <button onClick={aceptarCompromiso} disabled={!mesSelected} style={{ padding: '9px 20px', borderRadius: 8, border: 'none', background: mesSelected ? '#00236f' : '#e2e8f0', color: mesSelected ? '#ffffff' : '#94a3b8', fontSize: 13, fontWeight: 700, cursor: mesSelected ? 'pointer' : 'not-allowed', fontFamily: 'inherit', transition: 'all 0.15s', boxShadow: mesSelected ? '0 2px 8px rgba(0,35,111,0.25)' : 'none' }} onMouseEnter={e => { if (mesSelected)
            e.currentTarget.style.background = '#001d5a'; }} onMouseLeave={e => { if (mesSelected)
            e.currentTarget.style.background = '#00236f'; }}>
              Aceptar
            </button>
          </div>
        </ModalOverlay>)}

      {/* ── Modal: Revisar pago ── */}
      {modalPago && (<ModalOverlay onClose={() => setModalPago(null)}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px 16px', borderBottom: '1px solid #f1f4f9' }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', margin: 0, letterSpacing: '-0.01em' }}>Revisar pago</h2>
            <button onClick={() => setModalPago(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 4, borderRadius: 6, display: 'flex', alignItems: 'center', transition: 'color 0.12s' }} onMouseEnter={e => e.currentTarget.style.color = '#374151'} onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Payment details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { label: 'Concepto', value: modalPago.concepto },
                { label: 'Monto', value: modalPago.monto },
                { label: 'Fecha límite', value: modalPago.fechaLimite },
                { label: 'Estado', value: 'Pendiente', isPending: true },
            ].map(item => (<div key={item.label} style={{ background: '#f8f9ff', border: '1px solid #e8eaf0', borderRadius: 8, padding: '12px 14px' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>{item.label}</div>
                  {item.isPending
                    ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 999, fontSize: 12, fontWeight: 700, background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a' }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#d97706' }}/>
                        {item.value}
                      </span>
                    : <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>{item.value}</div>}
                </div>))}
            </div>

            {/* Comprobante */}
            <div style={{ background: '#f8f9ff', border: '1px solid #e8eaf0', borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>Comprobante</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 8, background: '#fff1f1', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ba1a1a" strokeWidth="1.8" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{modalPago.comprobante}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{modalPago.comprobanteSize}</div>
                  </div>
                </div>
                <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 7, border: '1px solid #bfdbfe', background: '#eff6ff', color: '#0058be', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0, transition: 'all 0.12s' }} onMouseEnter={e => { e.currentTarget.style.background = '#dbeafe'; }} onMouseLeave={e => { e.currentTarget.style.background = '#eff6ff'; }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  Ver
                </button>
              </div>
            </div>

            {/* Motivo del rechazo — shown only after clicking Rechazar */}
            {showRechazo && (<div style={{ background: '#fff8f8', border: '1px solid #fecaca', borderRadius: 10, padding: '14px 16px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#ba1a1a', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>Motivo del rechazo</div>
                <textarea value={rechazoMotivo} onChange={e => setRechazoMotivo(e.target.value)} placeholder="Ingrese el motivo del rechazo..." rows={3} style={{ width: '100%', resize: 'vertical', padding: '10px 12px', border: '1.5px solid #fecaca', borderRadius: 7, fontSize: 13, color: '#1e293b', background: '#ffffff', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s', lineHeight: '1.5' }} onFocus={e => e.target.style.borderColor = '#ba1a1a'} onBlur={e => e.target.style.borderColor = '#fecaca'}/>
              </div>)}
          </div>

          {/* Footer actions */}
          <div style={{ padding: '16px 24px', borderTop: '1px solid #f1f4f9' }}>
            {!showRechazo ? (<div style={{ display: 'flex', gap: 8 }}>
                <button onClick={validarPago} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '10px 16px', borderRadius: 8, border: 'none', background: '#16a34a', color: '#ffffff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 2px 8px rgba(22,163,74,0.3)', transition: 'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background = '#15803d'} onMouseLeave={e => e.currentTarget.style.background = '#16a34a'}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Validar pago
                </button>
                <button onClick={() => setShowRechazo(true)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '10px 16px', borderRadius: 8, border: 'none', background: '#ba1a1a', color: '#ffffff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 2px 8px rgba(186,26,26,0.3)', transition: 'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background = '#991b1b'} onMouseLeave={e => e.currentTarget.style.background = '#ba1a1a'}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  Rechazar pago
                </button>
              </div>) : (<div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button onClick={() => { setShowRechazo(false); setRechazoMotivo(''); }} style={{ padding: '9px 20px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#ffffff', color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.12s' }} onMouseEnter={e => e.currentTarget.style.background = '#f8f9ff'} onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}>
                  Cancelar
                </button>
                <button onClick={confirmarRechazo} disabled={!rechazoMotivo.trim()} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 20px', borderRadius: 8, border: 'none', background: rechazoMotivo.trim() ? '#ba1a1a' : '#e2e8f0', color: rechazoMotivo.trim() ? '#ffffff' : '#94a3b8', fontSize: 13, fontWeight: 700, cursor: rechazoMotivo.trim() ? 'pointer' : 'not-allowed', fontFamily: 'inherit', transition: 'all 0.15s', boxShadow: rechazoMotivo.trim() ? '0 2px 8px rgba(186,26,26,0.3)' : 'none' }} onMouseEnter={e => { if (rechazoMotivo.trim())
                e.currentTarget.style.background = '#991b1b'; }} onMouseLeave={e => { if (rechazoMotivo.trim())
                e.currentTarget.style.background = '#ba1a1a'; }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  Rechazar pago
                </button>
              </div>)}
          </div>
        </ModalOverlay>)}
    </div>);
}
