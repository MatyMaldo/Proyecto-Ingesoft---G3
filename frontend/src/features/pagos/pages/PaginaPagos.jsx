import { useEffect, useId, useState } from 'react';

import estilos from './PaginaPagos.module.css'
import usePagos from '../hooks/usePagos.js'
import TablaPagos from '../components/TablaPagos.jsx';
import EstadoConsulta from '../../../shared/components/EstadoConsulta.jsx';

export default function PaginaPagos() {

  const {
    alumnos,
    estado,
    recargando  
  } = usePagos();

  let mensajeRegion = '';
  if (recargando) {
    mensajeRegion = 'Actualizando resultados…';
  } 

  return(
    <div className={estilos.pagina}>
      <header className={estilos.cabecera}>
        <div>
          <p className={estilos.sobretitulo}>Módulo de pagos</p>
          <h1 className={estilos.titulo}>Pagos</h1>
          <p className={estilos.subtitulo}>Gestiona los pagos y compromisos de matrícula de los estudiantes.</p>
        </div>
      </header>    

      <section aria-busy={estado === 'cargando' || undefined}>
        {estado === 'cargando' && <EstadoConsulta tipo="carga" filasEsqueleto={5} />}

        {estado === 'error' && <EstadoConsulta tipo="error" alReintentar={reintentar} />}

        {estado === 'listo' && alumnos.length === 0 && (
          <EstadoConsulta tipo="vacio" mensaje={MENSAJE_VACIO} />
        )}

        {estado === 'listo' && alumnos.length > 0 && (
          <>
            {recargando && <p>Actualizando resultados…</p>}
            <TablaPagos alumnos={alumnos} ocupado={recargando} />
          </>
        )}
      </section>

    </div>
  )

}