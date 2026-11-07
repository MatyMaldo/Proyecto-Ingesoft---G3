import { useEffect, useMemo, useRef, useState } from 'react';

import Icono from '../../../shared/components/Icono.jsx';
import { fechaISO, formatearFecha } from '../utils/tiempo.js';
import estilos from './SelectorFecha.module.css';

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
];
const DIAS_SEMANA = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

function fechaLocal(valor) {
  return valor ? new Date(`${valor}T00:00:00`) : new Date();
}

function etiquetaMes(fecha) {
  return `${MESES[fecha.getMonth()]} ${fecha.getFullYear()}`;
}

/**
 * Selector de fecha con calendario en español. Sustituye al input nativo para
 * que el calendario no dependa del idioma del navegador y tenga un tamaño
 * cómodo en las pantallas de horarios.
 */
export default function SelectorFecha({ id, etiqueta, valor, min, max, alCambiar }) {
  const [abierto, establecerAbierto] = useState(false);
  const [mesVisible, establecerMesVisible] = useState(() => {
    const fecha = fechaLocal(valor);
    return new Date(fecha.getFullYear(), fecha.getMonth(), 1);
  });
  const contenedor = useRef(null);

  useEffect(() => {
    const fecha = fechaLocal(valor);
    establecerMesVisible(new Date(fecha.getFullYear(), fecha.getMonth(), 1));
  }, [valor]);

  useEffect(() => {
    if (!abierto) return undefined;
    const alHacerClic = (evento) => {
      if (!contenedor.current?.contains(evento.target)) {
        establecerAbierto(false);
      }
    };
    const alPresionarTecla = (evento) => {
      if (evento.key === 'Escape') establecerAbierto(false);
    };
    document.addEventListener('mousedown', alHacerClic);
    document.addEventListener('keydown', alPresionarTecla);
    return () => {
      document.removeEventListener('mousedown', alHacerClic);
      document.removeEventListener('keydown', alPresionarTecla);
    };
  }, [abierto]);

  const dias = useMemo(() => {
    const primero = new Date(mesVisible.getFullYear(), mesVisible.getMonth(), 1);
    const desplazamiento = (primero.getDay() + 6) % 7;
    const totalDias = new Date(
      mesVisible.getFullYear(),
      mesVisible.getMonth() + 1,
      0
    ).getDate();
    const celdas = [];

    for (let indice = 0; indice < desplazamiento; indice += 1) {
      celdas.push(null);
    }
    for (let dia = 1; dia <= totalDias; dia += 1) {
      celdas.push({
        dia,
        fecha: fechaISO(new Date(mesVisible.getFullYear(), mesVisible.getMonth(), dia))
      });
    }
    while (celdas.length % 7 !== 0) celdas.push(null);
    return celdas;
  }, [mesVisible]);

  const hoy = fechaISO(new Date());
  const estaDeshabilitada = (fecha) =>
    (min && fecha < min) || (max && fecha > max);

  const seleccionar = (fecha) => {
    if (estaDeshabilitada(fecha)) return;
    alCambiar(fecha);
    establecerAbierto(false);
  };

  const cambiarMes = (delta) => {
    establecerMesVisible(new Date(
      mesVisible.getFullYear(),
      mesVisible.getMonth() + delta,
      1
    ));
  };

  return (
    <div className={estilos.contenedor} ref={contenedor}>
      <button
        id={id}
        type="button"
        className={estilos.disparador}
        aria-haspopup="dialog"
        aria-expanded={abierto}
        aria-label={`${etiqueta}: ${valor ? formatearFecha(valor) : 'sin fecha'}`}
        onClick={() => {
          if (!abierto) {
            const fecha = fechaLocal(valor);
            establecerMesVisible(new Date(fecha.getFullYear(), fecha.getMonth(), 1));
          }
          establecerAbierto((actual) => !actual);
        }}
      >
        <span>{valor ? formatearFecha(valor) : 'dd/mm/aaaa'}</span>
        <Icono nombre="calendario" tamano={18} />
      </button>

      {abierto && (
        <div className={estilos.popover} role="dialog" aria-label={`Calendario de ${etiqueta}`}>
          <div className={estilos.cabecera}>
            <button
              type="button"
              className={estilos.botonMes}
              aria-label="Mes anterior"
              onClick={() => cambiarMes(-1)}
            >
              <Icono nombre="flecha-izquierda" tamano={14} />
            </button>
            <span className={estilos.mes}>{etiquetaMes(mesVisible)}</span>
            <button
              type="button"
              className={estilos.botonMes}
              aria-label="Mes siguiente"
              onClick={() => cambiarMes(1)}
            >
              <Icono nombre="flecha-derecha" tamano={14} />
            </button>
          </div>

          <div className={estilos.semana}>
            {DIAS_SEMANA.map((dia) => <span key={dia}>{dia}</span>)}
          </div>

          <div className={estilos.dias}>
            {dias.map((celda, indice) => {
              if (!celda) return <span key={`vacio-${indice}`} className={estilos.vacio} />;
              const deshabilitada = estaDeshabilitada(celda.fecha);
              const clases = [
                estilos.dia,
                celda.fecha === valor ? estilos.seleccionado : '',
                celda.fecha === hoy ? estilos.hoy : '',
                deshabilitada ? estilos.deshabilitado : ''
              ].join(' ');
              return (
                <button
                  key={celda.fecha}
                  type="button"
                  className={clases}
                  disabled={deshabilitada}
                  onClick={() => seleccionar(celda.fecha)}
                >
                  {celda.dia}
                </button>
              );
            })}
          </div>

          <div className={estilos.pie}>
            <button
              type="button"
              className={estilos.limpiar}
              onClick={() => {
                alCambiar('');
                establecerAbierto(false);
              }}
            >
              Limpiar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
