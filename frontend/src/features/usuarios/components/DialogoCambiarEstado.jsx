import { useEffect, useState } from 'react';
import Avatar from '../../../shared/components/Avatar.jsx';
import Icono from '../../../shared/components/Icono.jsx';
import Insignia from '../../../shared/components/Insignia.jsx';
import DialogoBase from '../../../shared/components/DialogoBase.jsx';
import { TONO_ROL } from '../constants/rolesUsuario.js';
import { cambiarEstadoUsuario, listarSeccionesTutor } from '../services/usuariosService.js';
import estilos from './DialogoCambiarEstado.module.css';

/**
 * Confirmación para activar o desactivar un usuario (HU-SAT-02). Al desactivar a un docente consulta primero
 * las secciones de las que es tutor, porque perderá esa asignación. Los usuarios no se eliminan.
 *
 * @param {Object} props
 * @param {Object} props.usuario Usuario a activar o desactivar (nunca un administrador).
 * @param {(mensaje: string) => void} props.alCambiado Se llama cuando el backend confirma el cambio.
 * @param {() => void} props.alCerrar
 */
export default function DialogoCambiarEstado({ usuario, alCambiado, alCerrar }) {
  const [enviando, setEnviando] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState(null);
  const [secciones, setSecciones] = useState([]);
  const [cargandoSecciones, setCargandoSecciones] = useState(false);
  const [errorSecciones, setErrorSecciones] = useState('');
  const [intentoSecciones, setIntentoSecciones] = useState(0);

  const desactivando = Boolean(usuario.activo);
  const debeVerificarTutor = desactivando && usuario.rol === 'Docente';
  const nombreCompleto = `${usuario.nombre} ${usuario.apellido}`;

  useEffect(() => {
    if (!debeVerificarTutor) {
      return undefined;
    }

    let vigente = true;
    setCargandoSecciones(true);
    setSecciones([]);
    setErrorSecciones('');
    listarSeccionesTutor(usuario.id).then((resultado) => {
      if (!vigente) return;
      if (!resultado.exitoso) {
        setErrorSecciones(resultado.mensaje);
      } else {
        setSecciones(resultado.datos);
      }
      setCargandoSecciones(false);
    });
    return () => { vigente = false; };
  }, [debeVerificarTutor, usuario.id, intentoSecciones]);

  const confirmar = async (evento) => {
    evento.preventDefault();
    if (debeVerificarTutor && (cargandoSecciones || errorSecciones)) return;
    setErrorGeneral(null);
    setEnviando(true);
    const resultado = await cambiarEstadoUsuario(usuario.id, usuario.activo);
    setEnviando(false);
    if (!resultado.exitoso) {
      setErrorGeneral(resultado.mensaje || 'No fue posible actualizar el estado del usuario.');
      return;
    }
    alCambiado(desactivando ? 'El usuario ha sido desactivado correctamente.' : 'El usuario ha sido activado correctamente.');
  };

  const textoConfirmar = cargandoSecciones ? 'Consultando…' : desactivando ? 'Desactivar' : 'Activar';

  return (
    <DialogoBase
      idTitulo="titulo-cambiar-estado"
      titulo={`${desactivando ? 'Desactivar' : 'Activar'} usuario`}
      textoConfirmar={textoConfirmar}
      textoEnviando="Guardando..."
      enviando={enviando}
      confirmarDeshabilitado={cargandoSecciones || Boolean(errorSecciones)}
      confirmarPeligro={desactivando}
      error={errorGeneral}
      alCancelar={alCerrar}
      alConfirmar={confirmar}
    >
      <div className={estilos.usuario}>
        <Avatar nombre={usuario.nombre} apellido={usuario.apellido} />
        <div className={estilos.datosUsuario}>
          <span className={estilos.nombreUsuario}>{nombreCompleto}</span>
          <span className={estilos.detalleUsuario}>DNI {usuario.dni}</span>
        </div>
        <Insignia tono={TONO_ROL[usuario.rol]}>{usuario.rol}</Insignia>
      </div>
      <p className={estilos.pregunta}>
        {desactivando
          ? `¿Está seguro de que desea desactivar a ${nombreCompleto}?`
          : `¿Está seguro de que desea activar a ${nombreCompleto}?`}
      </p>
      <p className={estilos.consecuencia}>
        {desactivando
          ? 'El usuario no podrá acceder al sistema mientras se encuentre desactivado.'
          : 'El usuario recuperará el acceso al sistema.'}
      </p>
      {debeVerificarTutor && (
        <div className={estilos.aviso}>
          <p className={estilos.avisoTitulo}>
            {cargandoSecciones
              ? 'Consultando las secciones asignadas como tutor…'
              : errorSecciones
                ? 'No se pudieron consultar las asignaciones del docente.'
                : secciones.length
                  ? 'Al desactivar este docente, se removerá su asignación como tutor de:'
                  : 'Este docente no tiene asignaciones como tutor en secciones.'}
          </p>
          {secciones.length > 0 && (
            <ul className={estilos.lista}>
              {secciones.map((seccion, indice) => (
                <li key={`${seccion.seccionNombre}-${seccion.gradoNombre}-${indice}`}>
                  Sección {seccion.seccionNombre} — {seccion.gradoNombre}
                  {seccion.anioAcademico != null && ` — Año académico ${seccion.anioAcademico}`}
                </li>
              ))}
            </ul>
          )}
          {errorSecciones && (
            <>
              <p role="alert" className={estilos.errorSecciones}>
                <Icono nombre="alerta" tamano={14} />
                <span>{errorSecciones}</span>
              </p>
              <button type="button" className={estilos.botonReintentar} onClick={() => setIntentoSecciones((actual) => actual + 1)}>
                Reintentar consulta
              </button>
            </>
          )}
        </div>
      )}
    </DialogoBase>
  );
}
