import { useEffect, useId, useState } from 'react';

import BarraResumen from '../../../shared/components/BarraResumen.jsx';
import CampoBusqueda from '../../../shared/components/CampoBusqueda.jsx';
import CampoBusquedaDesplegable from '../../../shared/components/CampoBusquedaDesplegable.jsx';
import ModalAsignarAlumno from '../components/ModalAsignarAlumno.jsx';
import ModalComprobante from '../components/ModalComprobante.jsx';
import EstadoConsulta from '../../../shared/components/EstadoConsulta.jsx';
import FiltroChips from '../../../shared/components/FiltroChips.jsx';
import Icono from '../../../shared/components/Icono.jsx';
import Notificacion from '../../../shared/components/Notificacion.jsx';
import estilosUtil from '../../../shared/styles/utilidades.module.css';
import Boton from '../../../shared/components/Boton.jsx'
import estilosBoton from '../../../shared/components/Boton.module.css'
import estilos from './PaginaMatriculas.module.css'
import useMatriculas from '../hooks/useMatriculas.js';
import useNotificacion from '../hooks/useNotificacion.js';
import estilosModal from '../components/Modal.module.css';
import { crearMatricula, emitirCompromisoMatricula } from '../services/matriculasService.js';

export default function PaginaMatriculas() {
  
  // Notificación de éxito o error (se llama aquí para que sobreviva al cierre de los modales)
  const { notificacion, mostrarNotificacion } = useNotificacion(); 
 
  // Variables relacionadas con el modal de asignar alumno
  const [modalAsignarAlumnoAbierto, establecerModalAsignarAlumnoAbierto] = useState(false);

  const abrirModalAsignarAlumno = () => establecerModalAsignarAlumnoAbierto(true);
  const cerrarModalAsignarAlumno = () => establecerModalAsignarAlumnoAbierto(false);

  const confirmarAsignacion = async (asignacion) => {
    const respuesta = await crearMatricula(asignacion);
    if (!respuesta.exitoso) {
      window.alert(respuesta.mensaje);
      return;
    }
    cerrarModalAsignarAlumno();
    mostrarNotificacion(
      `El alumno ${asignacion.alumno.nombre} ha sido asignado correctamente a ${asignacion.grado.nombre}, sección ${asignacion.seccion.nombre}.`
    );
  };

  // Variabes relacionadas con el modal de comprobante
  const [ModalComprobanteAbierto, establecerModalComprobanteAbierto] = useState(false);

  const abrirModalComprobante = () => establecerModalComprobanteAbierto(true);
  const cerrarModalComprobante = () => establecerModalComprobanteAbierto(false);

  const confirmarComprobante = async (alumno) => {
    const respuesta = await emitirCompromisoMatricula(alumno.id);
    if (!respuesta.exitoso) {
      window.alert(respuesta.mensaje);
      return;
    }
    cerrarModalComprobante();
    mostrarNotificacion(
      `Se emitió exitosamente el comprobante del alumno(a).`
    );
  };

  return (
    <div className={estilos.pagina}>
      {notificacion && <Notificacion mensaje={notificacion.mensaje} error={notificacion.error} />}

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