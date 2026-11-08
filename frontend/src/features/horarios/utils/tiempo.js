/**
 * Utilidades de tiempo para la malla horaria.
 *
 * El backend recibe horas como texto `HH:mm` y permite bloques de distinta
 * duración. Por eso la matriz no puede depender de franjas fijas de una hora.
 */

export const HORA_INICIO_JORNADA = '08:00';
export const HORA_FIN_JORNADA = '13:30';
export const RECREO = Object.freeze({ inicio: '11:00', fin: '11:30' });

/** Convierte `HH:mm` o `HH:mm:ss` a minutos desde medianoche. */
export function aMinutos(hora) {
  const [horas, minutos] = String(hora ?? '').slice(0, 5).split(':').map(Number);
  if (!Number.isFinite(horas) || !Number.isFinite(minutos)) {
    return null;
  }
  return horas * 60 + minutos;
}

/** Convierte minutos desde medianoche a `HH:mm`. */
export function aHora(minutos) {
  const normalizados = Math.max(0, Math.round(minutos));
  const horas = Math.floor(normalizados / 60);
  const resto = normalizados % 60;
  return `${String(horas).padStart(2, '0')}:${String(resto).padStart(2, '0')}`;
}

/** Compara dos horas; devuelve un número negativo, cero o positivo. */
export function compararHoras(a, b) {
  return (aMinutos(a) ?? 0) - (aMinutos(b) ?? 0);
}

/** Indica si dos intervalos [inicioA, finA) y [inicioB, finB) se solapan. */
export function seSolapan(inicioA, finA, inicioB, finB) {
  const inicioAMin = aMinutos(inicioA);
  const finAMin = aMinutos(finA);
  const inicioBMin = aMinutos(inicioB);
  const finBMin = aMinutos(finB);
  if ([inicioAMin, finAMin, inicioBMin, finBMin].some((valor) => valor === null)) {
    return false;
  }
  return inicioAMin < finBMin && inicioBMin < finAMin;
}

/** Indica si un bloque cruza el recreo. */
export function bloqueCruzaReceso(bloque) {
  return seSolapan(bloque.horaInicio, bloque.horaFin, RECREO.inicio, RECREO.fin);
}

/** Indica si un rango está dentro de la jornada y tiene una duración positiva. */
export function rangoHorarioValido(horaInicio, horaFin) {
  const inicio = aMinutos(horaInicio);
  const fin = aMinutos(horaFin);
  if (inicio === null || fin === null || fin <= inicio) {
    return false;
  }
  return inicio >= aMinutos(HORA_INICIO_JORNADA) && fin <= aMinutos(HORA_FIN_JORNADA);
}

/**
 * Construye las filas de la matriz a partir de las horas reales de los bloques.
 * Incluye los límites de la jornada y el recreo, y devuelve segmentos consecutivos.
 *
 * @param {Array<{ horaInicio: string, horaFin: string }>} bloques
 * @returns {Array<{ inicio: string, fin: string, esReceso: boolean }>}
 */
export function construirEjeTemporal(bloques = []) {
  const horas = new Set([
    HORA_INICIO_JORNADA,
    RECREO.inicio,
    RECREO.fin,
    HORA_FIN_JORNADA
  ]);

  // Filas base de una hora: mantienen la matriz legible aunque todavía no haya
  // bloques y permiten que los bloques de varias horas ocupen varias filas.
  for (
    let minutos = aMinutos(HORA_INICIO_JORNADA);
    minutos < aMinutos(HORA_FIN_JORNADA);
    minutos += 60
  ) {
    horas.add(aHora(minutos));
  }

  bloques.forEach((bloque) => {
    if (bloque?.horaInicio) horas.add(String(bloque.horaInicio).slice(0, 5));
    if (bloque?.horaFin) horas.add(String(bloque.horaFin).slice(0, 5));
  });

  const inicioJornada = aMinutos(HORA_INICIO_JORNADA);
  const finJornada = aMinutos(HORA_FIN_JORNADA);
  const ordenadas = [...horas]
    .filter((hora) => {
      const minutos = aMinutos(hora);
      return minutos !== null && minutos >= inicioJornada && minutos <= finJornada;
    })
    .sort(compararHoras);

  return ordenadas.slice(0, -1).map((inicio, indice) => {
    const fin = ordenadas[indice + 1];
    return {
      inicio,
      fin,
      esReceso: seSolapan(inicio, fin, RECREO.inicio, RECREO.fin)
    };
  });
}

/**
 * Propone una hora de fin para un bloque nuevo: una hora después, sin salir de
 * la jornada y sin cruzar el recreo.
 */
export function finSugerido(horaInicio, finSegmento) {
  const inicio = aMinutos(horaInicio);
  if (inicio === null) {
    return finSegmento ?? HORA_FIN_JORNADA;
  }

  let fin = Math.min(inicio + 60, aMinutos(HORA_FIN_JORNADA));
  if (seSolapan(aHora(inicio), aHora(fin), RECREO.inicio, RECREO.fin)) {
    if (inicio < aMinutos(RECREO.inicio)) {
      fin = aMinutos(RECREO.inicio);
    } else {
      fin = aMinutos(HORA_FIN_JORNADA);
    }
  }

  if (fin <= inicio) {
    return finSegmento ?? HORA_FIN_JORNADA;
  }
  return aHora(fin);
}

/** Indica si un bloque se solapa con otro bloque del mismo día. */
export function bloquesSeSolapan(a, b) {
  return a.dia === b.dia && seSolapan(a.horaInicio, a.horaFin, b.horaInicio, b.horaFin);
}

/** Devuelve el lunes de la semana de una fecha `YYYY-MM-DD` como objeto Date local. */
export function lunesDeFecha(fechaISO) {
  const fecha = new Date(`${fechaISO}T00:00:00`);
  const dia = (fecha.getDay() + 6) % 7;
  fecha.setDate(fecha.getDate() - dia);
  return fecha;
}

/** Formatea un Date local como `YYYY-MM-DD`. */
export function fechaISO(fecha) {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

/** Suma días (puede ser negativo) a una fecha `YYYY-MM-DD` y devuelve `YYYY-MM-DD`. */
export function sumarDias(fecha, dias) {
  const resultado = new Date(`${fecha}T00:00:00`);
  resultado.setDate(resultado.getDate() + dias);
  return fechaISO(resultado);
}

/** Formatea `YYYY-MM-DD` como `DD/MM/YYYY`. */
export function formatearFecha(fecha) {
  if (!fecha) return '';
  const [anio, mes, dia] = String(fecha).slice(0, 10).split('-');
  return `${dia}/${mes}/${anio}`;
}

/**
 * Devuelve las semanas lectivas (lunes a viernes) que cubre un rango. La primera y la última se recortan
 * al rango (`inicio`/`fin`); `lunes` y `viernes` conservan la semana completa. Las semanas sin ningún día
 * hábil dentro del rango (p. ej. un rango que empieza en domingo) no se incluyen.
 *
 * @param {string} fechaInicio `YYYY-MM-DD`
 * @param {string} fechaFin `YYYY-MM-DD`
 * @returns {Array<{ inicio: string, fin: string, lunes: string, viernes: string }>}
 */
export function semanasDelRango(fechaInicio, fechaFin) {
  if (!fechaInicio || !fechaFin) return [];
  const inicio = new Date(`${fechaInicio}T00:00:00`);
  const fin = new Date(`${fechaFin}T00:00:00`);
  if (Number.isNaN(inicio.getTime()) || Number.isNaN(fin.getTime()) || fin < inicio) {
    return [];
  }

  const semanas = [];
  let lunes = lunesDeFecha(fechaInicio);
  while (lunes <= fin) {
    const viernes = new Date(lunes);
    viernes.setDate(lunes.getDate() + 4);
    const inicioRecortado = fechaISO(lunes) < fechaInicio ? fechaInicio : fechaISO(lunes);
    const finRecortado = fechaISO(viernes) > fechaFin ? fechaFin : fechaISO(viernes);
    if (inicioRecortado <= finRecortado) {
      semanas.push({
        inicio: inicioRecortado,
        fin: finRecortado,
        lunes: fechaISO(lunes),
        viernes: fechaISO(viernes)
      });
    }
    lunes = new Date(lunes);
    lunes.setDate(lunes.getDate() + 7);
  }
  return semanas;
}

/**
 * Elige la semana que se muestra por defecto: la de la fecha dada; si cae en fin de semana o entre dos
 * semanas, la más reciente que ya empezó; si la fecha es anterior al rango, la primera; si es posterior,
 * la última.
 *
 * @param {Array<{ inicio: string, fin: string, lunes: string }>} semanas Resultado de `semanasDelRango`.
 * @param {string} hoy `YYYY-MM-DD`
 * @returns {{ inicio: string, fin: string, lunes: string }|null}
 */
export function semanaMasCercana(semanas, hoy) {
  if (!Array.isArray(semanas) || semanas.length === 0) return null;
  const empezadas = semanas.filter((semana) => semana.lunes <= hoy);
  return empezadas.at(-1) ?? semanas[0];
}
