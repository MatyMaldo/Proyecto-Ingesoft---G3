import { useEffect, useId, useState } from 'react';

import BarraResumen from '../../../shared/components/BarraResumen.jsx';
import CampoBusqueda from '../../../shared/components/CampoBusqueda.jsx';
import CampoBusquedaDesplegable from '../../../shared/components/CampoBusquedaDesplegable.jsx';
import ModalAsignarAlumno from '../components/ModalAsignarAlumno.jsx';
import ModalComprobante from '../components/ModalComprobante.jsx';
import EstadoConsulta from '../../../shared/components/EstadoConsulta.jsx';
import FiltroChips from '../../../shared/components/FiltroChips.jsx';
import Icono from '../../../shared/components/Icono.jsx';
import estilosUtil from '../../../shared/styles/utilidades.module.css';
import Boton from '../../../shared/components/Boton.jsx'
import estilosBoton from '../../../shared/components/Boton.module.css'
import estilos from './PaginaMatriculas.module.css'
import useMatriculas from '../hooks/useMatriculas.js';
import estilosModal from '../components/Modal.module.css';

export default function PaginaMatriculas() {
  
  // Variables relacionadas con el modal de asignar alumno
  const [modalAsignarAlumnoAbierto, establecerModalAsignarAlumnoAbierto] = useState(false);

  const abrirModalAsignarAlumno = () => establecerModalAsignarAlumnoAbierto(true);
  const cerrarModalAsignarAlumno = () => establecerModalAsignarAlumnoAbierto(false);

  const confirmarAsignacion = () => {
    // TODO(equipo, 2026-10-21): persistir la asignación (alumno, grado, sección) cuando exista el servicio de matrícula.
    cerrarModalAsignarAlumno();
  };

  // Variabes relacionadas con el modal de comprobante
  const [ModalComprobanteAbierto, establecerModalComprobanteAbierto] = useState(false);

  const abrirModalComprobante = () => establecerModalComprobanteAbierto(true);
  const cerrarModalComprobante = () => establecerModalComprobanteAbierto(false);

  const confirmarComprobante = () => {
    // TODO(equipo, 2026-10-21): persistir la asignación (alumno, grado, sección) cuando exista el servicio de matrícula.
    cerrarModalComprobante();
  };

  return (
    <div className={estilos.pagina}>
      <header className={estilos.cabecera}>
        <div>
          <p className={estilos.sobretitulo}>Módulo de gestión</p>
          <h1 className={estilos.titulo}>Matrículas</h1>
          <p className={estilos.subtitulo}>Muestra una lista con los últimos alumnos matriculados.</p>
        </div>
      </header>  

      <div className={estilos.botones}>
        <Boton icono="agregar" span="Asignar año escolar" estilo={estilosBoton.btn_primario} onClick={() => {} } ></Boton>
        <Boton icono="agregar" span="Asignar alumno a sección" estilo={estilosBoton.btn_primario} onClick={abrirModalAsignarAlumno} ></Boton>
        <Boton icono="archivo" span="Emitir comprobante de pago de matrícula" estilo={estilosBoton.btn_secundario} onClick={abrirModalComprobante } ></Boton>
      </div>

      {modalAsignarAlumnoAbierto && (
        <ModalAsignarAlumno onCerrar={cerrarModalAsignarAlumno} onAceptar={confirmarAsignacion} />
      )}

      {ModalComprobanteAbierto && (
        <ModalComprobante onCerrar={cerrarModalComprobante} onAceptar={confirmarComprobante} />
      )}

    </div>  
  )

}