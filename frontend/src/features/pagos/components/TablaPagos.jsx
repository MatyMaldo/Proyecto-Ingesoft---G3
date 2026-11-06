import { useState } from 'react';

import Icono from '../../../shared/components/Icono.jsx';
import { formatearFechaVisible } from '../../../shared/utils/formatoFecha.js';
import Insignia from '../../../shared/components/Insignia.jsx';
import estilosUtil from '../../../shared/styles/utilidades.module.css';
import estilos from './TablaPagos.module.css';
import estilosBoton from '../../../shared/components/Boton.module.css'
import Boton from '../../../shared/components/Boton.jsx';
import ModalEmitirPension from './ModalEmitirPension.jsx';
import Notificacion from '../../../shared/components/Notificacion.jsx';
import useNotificacion from '../../../shared/hooks/useNotificacion.js';
import { emitirCompromisoPension } from '../services/pagosService.js';

/**
 * @param {Object} props
 * @param {Array} props.alumnos Logs adaptados desde `LogErrorResponse`.
 * @param {boolean} [props.ocupado] `true` mientras se recalcula por un cambio de filtro.
 */
export default function TablaPagos({ alumnos, ocupado = false }) {

  // Notificación de éxito o error (se llama aquí para que sobreviva al cierre de los modales)
  const { notificacion, mostrarNotificacion } = useNotificacion();

  // Variables relacionadas con el modal emitir pago
  const [modalEmitirPensionAbierto, establecerModalEmitirPensionAbierto] = useState(false);
  const [alumnoSeleccionado, establecerAlumnoSeleccionado] = useState(null);
  const [enviando, establecerEnviando] = useState(false);

  // Funciones para abrir y cerrar modales
  const abrirModalEmitirPension = (alumno) => {
    establecerModalEmitirPensionAbierto(true);
    establecerAlumnoSeleccionado(alumno);
  };

  const cerrarModalEmitirPension = () => {
    establecerModalEmitirPensionAbierto(false);
    establecerAlumnoSeleccionado(null);
    establecerEnviando(false);
  };

  // Función para emitir notificación
  const confirmarComprobante = async ({estudianteId,anioId,mes}) => {
    if (enviando)
      return;
    
    establecerEnviando(true);
    const respuesta = await emitirCompromisoPension({ estudianteId, anioId, mes });
    establecerEnviando(false);

    if (!respuesta.exitoso) {
      mostrarNotificacion(respuesta.mensaje || 'No fue posible emitir el compromiso de pensión.', true);
      return;
    }

    cerrarModalEmitirPension();
    mostrarNotificacion(`Se emitió el compromiso de pensión de (${mes}).`);
    
  };

  return (
    <div className={estilos.contenedor} aria-busy={ocupado || undefined}>
      {notificacion && <Notificacion mensaje={notificacion.mensaje} error={notificacion.error} />}
      <div className={estilos.vistaTabla}>
        <table className={estilos.tabla}>
          <caption className={estilosUtil.ocultoVisualmente}>
            Alumnos registrados
          </caption>
          <thead>
            <tr>
              <th scope="col">Alumno</th>
              <th scope="col">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {alumnos.map((alumno) => (
              <tr key={alumno.id} className={estilos.fila}>
                <td>
                  <p className={estilos.mensaje}>{alumno.nombre}</p>
                  <p className={estilos.dni}>{alumno.dni}</p>
                </td>
                <td>
                  {<Boton icono="archivo" span="Emitir compromiso de pensión" estilo={estilosBoton.btn_secundario} onClick={ ()=>{abrirModalEmitirPension(alumno)} }></Boton>}
                </td>
                <td>
                  {<Boton icono="verificar" span="Ver pagos realizados" estilo={estilosBoton.btn_activo} onClick={()=>{}}  ></Boton>}
                </td>
                <td>
                  {<Boton icono="reloj" span="Ver pagos pendientes" estilo={estilosBoton.btn_pendiente} onClick={()=>{}}  ></Boton>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {modalEmitirPensionAbierto && (
        <ModalEmitirPension onCerrar={cerrarModalEmitirPension} onAceptar={confirmarComprobante} alumno={alumnoSeleccionado} enviando={enviando}></ModalEmitirPension>
      )}
    </div>
  );
}
