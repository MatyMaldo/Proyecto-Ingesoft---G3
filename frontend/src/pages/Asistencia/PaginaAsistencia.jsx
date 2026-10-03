import { useEffect, useState } from 'react';

import TablaAsistencias from '../../components/TablaAsistencias.jsx';
import { obtenerAsistencias, registrarAsistencia } from '../../services/asistenciaService.js';

export default function PaginaAsistencia() {
  const [asistencias, establecerAsistencias] = useState([]);
  const [nombreEstudiante, establecerNombreEstudiante] = useState('');
  const [estado, establecerEstado] = useState('PRESENTE');
  const [cargando, establecerCargando] = useState(true);
  const [guardando, establecerGuardando] = useState(false);
  const [mensaje, establecerMensaje] = useState('');
  const [mensajeError, establecerMensajeError] = useState('');

  const cargarAsistencias = async () => {
    establecerCargando(true);
    establecerMensajeError('');

    const resultado = await obtenerAsistencias();
    if (!resultado.exitoso) {
      establecerMensajeError(resultado.mensaje);
      establecerCargando(false);
      return;
    }

    establecerAsistencias(resultado.datos ?? []);
    establecerCargando(false);
  };

  useEffect(() => {
    cargarAsistencias();
  }, []);

  const manejarEnvio = async (evento) => {
    evento.preventDefault();
    establecerGuardando(true);
    establecerMensaje('');
    establecerMensajeError('');

    const resultado = await registrarAsistencia({
      nombreEstudiante: nombreEstudiante.trim(),
      estado
    });

    if (!resultado.exitoso) {
      establecerMensajeError(resultado.mensaje);
      establecerGuardando(false);
      return;
    }

    establecerNombreEstudiante('');
    establecerEstado('PRESENTE');
    establecerMensaje('Asistencia registrada correctamente.');
    establecerGuardando(false);
    await cargarAsistencias();
  };

  return (
    <main className="contenedor-pagina">
      <section className="panel-principal">
        <header className="cabecera-panel">
          <div>
            <p className="etiqueta-superior">EduCoders · Prototipo de arquitectura</p>
            <h1>Registro de asistencia</h1>
            <p className="subtitulo">
              Integración React → REST → Spring Boot → JPA/Hibernate → MySQL.
            </p>
          </div>
          <span className="distintivo">Docente</span>
        </header>

        <form className="formulario-asistencia" onSubmit={manejarEnvio}>
          <label>
            Estudiante
            <input
              value={nombreEstudiante}
              onChange={(evento) => establecerNombreEstudiante(evento.target.value)}
              placeholder="Ej. María López"
              maxLength={120}
              required
            />
          </label>

          <label>
            Estado
            <select value={estado} onChange={(evento) => establecerEstado(evento.target.value)}>
              <option value="PRESENTE">Presente</option>
              <option value="TARDANZA">Tardanza</option>
              <option value="FALTA">Falta</option>
            </select>
          </label>

          <button type="submit" disabled={guardando}>
            {guardando ? 'Registrando...' : 'Registrar asistencia'}
          </button>
        </form>

        {mensaje && <div className="mensaje exito">{mensaje}</div>}
        {mensajeError && <div className="mensaje error">{mensajeError}</div>}

        <section className="seccion-tabla">
          <div className="cabecera-tabla">
            <div>
              <h2>Asistencias registradas</h2>
              <p>Información recuperada desde la API REST.</p>
            </div>
            <button className="boton-secundario" onClick={cargarAsistencias} type="button">
              Actualizar
            </button>
          </div>

          {cargando ? (
            <p className="cargando">Cargando información...</p>
          ) : (
            <TablaAsistencias asistencias={asistencias} />
          )}
        </section>
      </section>
    </main>
  );
}
