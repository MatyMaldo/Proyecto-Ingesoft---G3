export default function TablaAsistencias({ asistencias }) {
  if (asistencias.length === 0) {
    return <p className="sin-registros">No existen asistencias registradas.</p>;
  }

  return (
    <div className="contenedor-tabla">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Estudiante</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {asistencias.map((asistencia) => (
            <tr key={asistencia.id}>
              <td>{asistencia.id}</td>
              <td>{asistencia.nombreEstudiante}</td>
              <td>
                <span className={`estado-asistencia ${asistencia.estado.toLowerCase()}`}>
                  {asistencia.estado}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
