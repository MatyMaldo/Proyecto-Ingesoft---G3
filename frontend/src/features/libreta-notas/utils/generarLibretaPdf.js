function normalizarWinAnsi(texto) {
  const reemplazos = {
    '–': String.fromCharCode(0x96),
    '—': String.fromCharCode(0x97),
    '‘': String.fromCharCode(0x91),
    '’': String.fromCharCode(0x92),
    '“': String.fromCharCode(0x93),
    '”': String.fromCharCode(0x94),
    '…': String.fromCharCode(0x85),
    '•': String.fromCharCode(0x95)
  };
  return String(texto ?? '').replace(/[–—‘’“”…•]/g, (caracter) => reemplazos[caracter])
    .replace(/[^\x00-\xFF]/g, '?');
}

function escaparCadenaPdf(texto) {
  return normalizarWinAnsi(texto).replace(/([\\()])/g, '\\$1');
}

function agregarEnvuelto(lineas, texto, opciones = {}) {
  const limite = opciones.limite ?? 84;
  const limpio = String(texto ?? '');
  if (!limpio) {
    lineas.push({ texto: '', ...opciones });
    return;
  }
  let restante = limpio;
  while (restante.length > limite) {
    let corte = restante.lastIndexOf(' ', limite);
    if (corte < Math.floor(limite * .55)) corte = limite;
    lineas.push({ texto: restante.slice(0, corte), ...opciones });
    restante = restante.slice(corte).trimStart();
  }
  lineas.push({ texto: restante, ...opciones });
}

function crearLineas(libreta) {
  const lineas = [];
  agregarEnvuelto(lineas, 'INSTITUCIÓN EDUCATIVA SAN MARCOS', { negrita: true, tamano: 16 });
  agregarEnvuelto(lineas, 'LIBRETA DE NOTAS', { negrita: true, tamano: 13 });
  lineas.push({ texto: '' });
  agregarEnvuelto(lineas, `Estudiante: ${libreta.idEstudiante}`, { negrita: true });
  agregarEnvuelto(lineas, `Año académico: ${libreta.anioAcademico}`);
  agregarEnvuelto(lineas, `Periodo: ${libreta.nombreBimestre}`);
  agregarEnvuelto(lineas, `Fecha de generación: ${libreta.fechaGeneracion}`);
  lineas.push({ texto: '' });

  const cursos = new Map();
  (libreta.notasCompetencias ?? []).forEach((competencia) => {
    const competencias = cursos.get(competencia.nombreCurso) ?? [];
    competencias.push(competencia);
    cursos.set(competencia.nombreCurso, competencias);
  });
  cursos.forEach((competencias, nombreCurso) => {
    agregarEnvuelto(lineas, nombreCurso, { negrita: true, tamano: 11 });
    competencias.forEach((competencia) => {
      agregarEnvuelto(lineas, `Competencia: ${competencia.nombreCompetencia}`);
      agregarEnvuelto(lineas, `Calificación: ${competencia.valorNota}`);
      agregarEnvuelto(lineas, `Descripción: ${competencia.descripcion}`);
      agregarEnvuelto(lineas, `Conclusión descriptiva: ${competencia.conclusionDescriptiva}`, { limite: 78 });
    });
    lineas.push({ texto: '' });
  });

  agregarEnvuelto(lineas, 'COMENTARIOS DEL TUTOR', { negrita: true, tamano: 11 });
  agregarEnvuelto(lineas, libreta.comentariosFinalesTutor || 'Sin comentarios finales del tutor.', { limite: 78 });
  return lineas;
}

function bytesWinAnsi(texto) {
  return Uint8Array.from(Array.from(texto, (caracter) => caracter.charCodeAt(0) & 0xff));
}

/** Genera un PDF de ejemplo a partir del contrato de detalle de una libreta. */
export function generarLibretaPdf(reporte) {
  const lineas = crearLineas(reporte);
  const capacidadPagina = 42;
  const bloques = [];
  for (let inicio = 0; inicio < lineas.length; inicio += capacidadPagina) {
    bloques.push(lineas.slice(inicio, inicio + capacidadPagina));
  }

  const cantidadPaginas = Math.max(1, bloques.length);
  const objetos = new Map();
  const idPagina = (indice) => 5 + indice * 2;
  const idContenido = (indice) => 6 + indice * 2;
  objetos.set(1, '<< /Type /Catalog /Pages 2 0 R >>');
  objetos.set(2, `<< /Type /Pages /Kids [${Array.from({ length: cantidadPaginas }, (_, indice) => `${idPagina(indice)} 0 R`).join(' ')}] /Count ${cantidadPaginas} >>`);
  objetos.set(3, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
  objetos.set(4, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');

  for (let indice = 0; indice < cantidadPaginas; indice += 1) {
    const pagina = bloques[indice] ?? [];
    let y = 790;
    const comandos = [];
    pagina.forEach((linea) => {
      const tamano = linea.tamano ?? 10;
      y -= linea.texto ? (tamano > 12 ? 23 : tamano > 10 ? 19 : 15) : 9;
      const fuente = linea.negrita ? 'F2' : 'F1';
      comandos.push(`BT /${fuente} ${tamano} Tf 48 ${y} Td (${escaparCadenaPdf(linea.texto)}) Tj ET`);
    });
    comandos.push(`BT /F1 8 Tf 500 24 Td (Pagina ${indice + 1} de ${cantidadPaginas}) Tj ET`);
    const contenido = comandos.join('\n');
    objetos.set(idPagina(indice), `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${idContenido(indice)} 0 R >>`);
    objetos.set(idContenido(indice), `<< /Length ${contenido.length} >>\nstream\n${contenido}\nendstream`);
  }

  let documento = '%PDF-1.4\n%CODX\n';
  const desplazamientos = [0];
  for (let id = 1; id <= 4 + cantidadPaginas * 2; id += 1) {
    desplazamientos[id] = documento.length;
    documento += `${id} 0 obj\n${objetos.get(id)}\nendobj\n`;
  }
  const inicioXref = documento.length;
  documento += `xref\n0 ${desplazamientos.length}\n0000000000 65535 f \n`;
  for (let id = 1; id < desplazamientos.length; id += 1) {
    documento += `${String(desplazamientos[id]).padStart(10, '0')} 00000 n \n`;
  }
  documento += `trailer\n<< /Size ${desplazamientos.length} /Root 1 0 R >>\nstartxref\n${inicioXref}\n%%EOF`;
  return new Blob([bytesWinAnsi(documento)], { type: 'application/pdf' });
}
