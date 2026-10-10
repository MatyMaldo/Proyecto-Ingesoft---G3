import BarraResumen from '../../../shared/components/BarraResumen.jsx';
import CampoBusqueda from '../../../shared/components/CampoBusqueda.jsx';
import EstadoConsulta from '../../../shared/components/EstadoConsulta.jsx';
import FiltroChips from '../../../shared/components/FiltroChips.jsx';
import Icono from '../../../shared/components/Icono.jsx';
import estilosUtil from '../../../shared/styles/utilidades.module.css';
import Boton from '../../../shared/components/Boton.jsx'
import estilosBoton from '../../../shared/components/Boton.module.css'
import estilos from './PaginaMatriculas.module.css'

export default function PaginaMatriculas() {
  
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
        <Boton icono="agregar" span="Asignar alumno a sección" estilo={estilosBoton.btn_primario} onClick={() => {} } ></Boton>
        <Boton icono="archivo" span="Emitir comprobante de pago de matrícula" estilo={estilosBoton.btn_secundario} onClick={() => {} } ></Boton>
      </div>

    </div>  
  )

}