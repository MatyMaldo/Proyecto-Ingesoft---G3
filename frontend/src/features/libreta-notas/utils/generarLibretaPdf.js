const COLOR = Object.freeze({
  azul: [0.055, 0.18, 0.42],
  azulMedio: [0.10, 0.34, 0.68],
  celeste: [0.91, 0.95, 0.99],
  celesteSuave: [0.97, 0.985, 1],
  tinta: [0.12, 0.17, 0.25],
  gris: [0.38, 0.43, 0.51],
  borde: [0.82, 0.86, 0.91],
  blanco: [1, 1, 1],
  ambar: [0.58, 0.35, 0.05],
  fondoAmbar: [1, 0.97, 0.87],
  verde: [0.08, 0.39, 0.25],
  fondoVerde: [0.91, 0.97, 0.93],
  fondoNota: [0.89, 0.93, 0.98]
});

function normalizarWinAnsi(texto) {
  const reemplazos = {
    '–': '-',
    '—': '-',
    '‘': "'",
    '’': "'",
    '“': '"',
    '”': '"',
    '…': '...'
  };
  return String(texto ?? '').replace(/[–—‘’“”…]/g, (caracter) => reemplazos[caracter])
    .replace(/[^\x00-\xFF]/g, '?');
}

function escaparCadenaPdf(texto) {
  return normalizarWinAnsi(texto).replace(/([\\()])/g, '\\$1');
}

function colorPdf(color) {
  return color.map((canal) => canal.toFixed(3)).join(' ');
}

function rectangulo(comandos, x, y, ancho, alto, color, borde = null) {
  comandos.push(`q ${colorPdf(color)} rg ${x} ${y} ${ancho} ${alto} re f Q`);
  if (borde) comandos.push(`q ${colorPdf(borde)} RG 0.7 w ${x} ${y} ${ancho} ${alto} re S Q`);
}

function linea(comandos, x1, y1, x2, y2, color = COLOR.borde, grosor = 0.7) {
  comandos.push(`q ${colorPdf(color)} RG ${grosor} w ${x1} ${y1} m ${x2} ${y2} l S Q`);
}

function texto(comandos, x, y, contenido, opciones = {}) {
  const fuente = opciones.negrita ? 'F2' : 'F1';
  const tamano = opciones.tamano ?? 9;
  const color = opciones.color ?? COLOR.tinta;
  comandos.push(`q ${colorPdf(color)} rg BT /${fuente} ${tamano} Tf 1 0 0 1 ${x} ${y} Tm (${escaparCadenaPdf(contenido)}) Tj ET Q`);
}

function envolver(textoPlano, ancho, tamano) {
  const maxCaracteres = Math.max(12, Math.floor(ancho / (tamano * 0.51)));
  const palabras = normalizarWinAnsi(textoPlano).split(/\s+/).filter(Boolean);
  const lineas = [];
  let actual = '';
  palabras.forEach((palabra) => {
    if (!actual) {
      actual = palabra;
    } else if (`${actual} ${palabra}`.length <= maxCaracteres) {
      actual += ` ${palabra}`;
    } else {
      lineas.push(actual);
      actual = palabra;
    }
  });
  if (actual || lineas.length === 0) lineas.push(actual);
  return lineas;
}

function parrafo(comandos, contenido, x, y, ancho, opciones = {}) {
  const tamano = opciones.tamano ?? 9;
  const paso = opciones.paso ?? tamano + 4;
  const lineas = envolver(contenido, ancho, tamano);
  lineas.forEach((lineaTexto, indice) => texto(comandos, x, y - indice * paso, lineaTexto, opciones));
  return y - lineas.length * paso;
}

function nombrePeriodo(libreta) {
  const clave = String(libreta.nombreBimestre ?? '');
  const numero = clave.match(/\d+/)?.[0];
  return numero ? `Bimestre ${numero}` : clave;
}

function iniciarPagina(paginas, libreta, numero) {
  const comandos = [];
  rectangulo(comandos, 0, 748, 595, 94, COLOR.azul);
  rectangulo(comandos, 38, 787, 38, 38, COLOR.blanco);
  texto(comandos, 49, 797, 'SM', { tamano: 15, negrita: true, color: COLOR.azul });
  texto(comandos, 88, 814, libreta.institucion || 'COLEGIO SAN MARCOS', {
    tamano: 14, negrita: true, color: COLOR.blanco
  });
  texto(comandos, 88, 797, 'Sistema de Gestión Escolar', { tamano: 9, color: [0.84, 0.90, 0.98] });
  texto(comandos, 88, 770, 'LIBRETA PARCIAL DE NOTAS', { tamano: 13, negrita: true, color: COLOR.blanco });
  rectangulo(comandos, 440, 766, 116, 24, [0.13, 0.31, 0.57]);
  texto(comandos, 451, 775, 'DOCUMENTO NO FORMAL', { tamano: 7.5, negrita: true, color: COLOR.blanco });
  if (numero > 1) texto(comandos, 447, 753, 'Continuación', { tamano: 8, color: [0.84, 0.90, 0.98] });
  paginas.push(comandos);
  return { comandos, y: 728 };
}

function dibujarDatosEstudiante(comandos, libreta, yInicial) {
  const y = yInicial - 112;
  rectangulo(comandos, 38, y, 519, 102, COLOR.celesteSuave, COLOR.borde);
  texto(comandos, 53, y + 83, 'DATOS DEL ESTUDIANTE', { tamano: 9, negrita: true, color: COLOR.azulMedio });
  linea(comandos, 53, y + 74, 542, y + 74);

  const nombre = libreta.nombreEstudiante || libreta.codigoEstudiante || libreta.idEstudiante || 'Estudiante';
  const campos = [
    { x: 53, etiqueta: 'ESTUDIANTE', valor: nombre, ancho: 300, fila: 0 },
    { x: 365, etiqueta: 'CÓDIGO', valor: libreta.codigoEstudiante || libreta.idEstudiante || '-', ancho: 175, fila: 0 },
    { x: 53, etiqueta: 'GRADO Y SECCIÓN', valor: [libreta.gradoNombre, libreta.seccionNombre].filter(Boolean).join(' - ') || '-', ancho: 235, fila: 1 },
    { x: 300, etiqueta: 'DOCENTE TUTOR', valor: libreta.tutorNombre || '-', ancho: 240, fila: 1 },
    { x: 53, etiqueta: 'AÑO ACADÉMICO', valor: String(libreta.anioAcademico ?? '-'), ancho: 160, fila: 2 },
    { x: 220, etiqueta: 'PERIODO', valor: nombrePeriodo(libreta), ancho: 150, fila: 2 },
    { x: 380, etiqueta: 'FECHA DE EMISIÓN', valor: libreta.fechaGeneracion || '-', ancho: 160, fila: 2 }
  ];
  campos.forEach((campo) => {
    const yEtiqueta = y + 65 - campo.fila * 23;
    texto(comandos, campo.x, yEtiqueta, campo.etiqueta, { tamano: 6.8, negrita: true, color: COLOR.gris });
    parrafo(comandos, campo.valor, campo.x, yEtiqueta - 10, campo.ancho, {
      tamano: 8.5, negrita: true, paso: 10, color: COLOR.tinta
    });
  });
  return y - 15;
}

function dibujarAsistencia(comandos, libreta, yInicial) {
  rectangulo(comandos, 38, yInicial - 54, 519, 48, COLOR.fondoVerde, [0.77, 0.88, 0.80]);
  texto(comandos, 53, yInicial - 21, 'RESUMEN DE ASISTENCIA', { tamano: 8, negrita: true, color: COLOR.verde });
  const columnas = [
    { x: 58, etiqueta: 'INASISTENCIAS', valor: libreta.inasistencias ?? 0 },
    { x: 230, etiqueta: 'TARDANZAS', valor: libreta.tardanzas ?? 0 },
    { x: 395, etiqueta: 'PERIODO', valor: nombrePeriodo(libreta) }
  ];
  columnas.forEach((columna) => {
    texto(comandos, columna.x, yInicial - 40, columna.etiqueta, { tamano: 6.5, negrita: true, color: COLOR.gris });
    texto(comandos, columna.x + 83, yInicial - 40, String(columna.valor), { tamano: 8, negrita: true, color: COLOR.tinta });
  });
  return yInicial - 68;
}

function asegurarEspacio(estado, paginas, libreta, alto) {
  if (estado.y - alto >= 70) return estado;
  const nuevo = iniciarPagina(paginas, libreta, paginas.length + 1);
  nuevo.y = 720;
  return nuevo;
}

function altoCompetencia(competencia) {
  const nombreLineas = envolver(competencia.nombreCompetencia || 'Competencia', 410, 8.5);
  const conclusionLineas = envolver(competencia.conclusionDescriptiva || 'Sin conclusión descriptiva.', 455, 8);
  return 17 + nombreLineas.length * 11 + 12 + conclusionLineas.length * 10 + 12;
}

function dibujarTituloCurso(estado, nombreCurso, continuacion = false) {
  rectangulo(estado.comandos, 40, estado.y - 21, 515, 23, COLOR.azul);
  texto(estado.comandos, 52, estado.y - 13, `${nombreCurso.toUpperCase()}${continuacion ? ' - CONTINUACIÓN' : ''}`, {
    tamano: 9, negrita: true, color: COLOR.blanco
  });
  estado.y -= 31;
}

function dibujarCompetencias(paginas, estado, libreta) {
  const notas = Array.isArray(libreta.notasCompetencias) ? libreta.notasCompetencias : [];
  const cursos = new Map();
  notas.forEach((nota) => {
    const nombre = nota.nombreCurso || 'Curso';
    const lista = cursos.get(nombre) ?? [];
    lista.push(nota);
    cursos.set(nombre, lista);
  });

  estado = asegurarEspacio(estado, paginas, libreta, 36);
  texto(estado.comandos, 40, estado.y, 'CONSOLIDADO DE COMPETENCIAS', { tamano: 11, negrita: true, color: COLOR.azul });
  estado.y -= 19;
  linea(estado.comandos, 40, estado.y, 555, estado.y, COLOR.azulMedio, 1.1);
  estado.y -= 13;

  cursos.forEach((competencias, nombreCurso) => {
    estado = asegurarEspacio(estado, paginas, libreta, 56 + (competencias.length ? altoCompetencia(competencias[0]) : 0));
    dibujarTituloCurso(estado, nombreCurso);

    competencias.forEach((competencia, indice) => {
      const nombreLineas = envolver(competencia.nombreCompetencia || 'Competencia', 410, 8.5);
      const conclusionLineas = envolver(competencia.conclusionDescriptiva || 'Sin conclusión descriptiva.', 455, 8);
      const alto = altoCompetencia(competencia);
      if (indice > 0) {
        const paginasAntes = paginas.length;
        estado = asegurarEspacio(estado, paginas, libreta, alto + 38);
        if (paginas.length > paginasAntes) dibujarTituloCurso(estado, nombreCurso, true);
      }
      const fondo = indice % 2 === 0 ? COLOR.blanco : COLOR.celesteSuave;
      rectangulo(estado.comandos, 40, estado.y - alto + 3, 515, alto, fondo, COLOR.borde);
      texto(estado.comandos, 51, estado.y - 13, 'COMPETENCIA', { tamano: 6.2, negrita: true, color: COLOR.gris });
      let cursor = parrafo(estado.comandos, competencia.nombreCompetencia || 'Competencia', 51, estado.y - 26, 410, {
        tamano: 8.5, negrita: true, paso: 11
      }) - 1;

      rectangulo(estado.comandos, 490, estado.y - 38, 48, 26, COLOR.fondoNota, [0.72, 0.80, 0.91]);
      texto(estado.comandos, 503, estado.y - 21, 'NOTA', { tamano: 5.8, negrita: true, color: COLOR.gris });
      texto(estado.comandos, 505, estado.y - 33, competencia.valorNota || '-', { tamano: 9, negrita: true, color: COLOR.azul });

      texto(estado.comandos, 51, cursor, 'CONCLUSIÓN DESCRIPTIVA', { tamano: 6.2, negrita: true, color: COLOR.azulMedio });
      cursor = parrafo(estado.comandos, competencia.conclusionDescriptiva || 'Sin conclusión descriptiva.', 51, cursor - 11, 485, {
        tamano: 8, paso: 10, color: COLOR.tinta
      });
      estado.y -= alto + 7;
    });
    estado.y -= 5;
  });

  if (!notas.length) {
    estado = asegurarEspacio(estado, paginas, libreta, 34);
    texto(estado.comandos, 43, estado.y, 'No hay competencias registradas para este periodo.', { tamano: 9, color: COLOR.gris });
    estado.y -= 20;
  }
  return estado;
}

function dibujarComentarios(paginas, estado, libreta) {
  const comentario = libreta.comentariosFinalesTutor || 'Sin comentarios finales del tutor.';
  const lineas = envolver(comentario, 485, 8.5);
  const alto = Math.max(78, 43 + lineas.length * 12);
  estado = asegurarEspacio(estado, paginas, libreta, alto + 35);
  texto(estado.comandos, 40, estado.y, 'COMENTARIO FINAL DEL TUTOR', { tamano: 10, negrita: true, color: COLOR.azul });
  estado.y -= 12;
  rectangulo(estado.comandos, 40, estado.y - alto, 515, alto, COLOR.celesteSuave, COLOR.borde);
  texto(estado.comandos, 53, estado.y - 20, 'Acompañamiento y observaciones del periodo', { tamano: 7, negrita: true, color: COLOR.gris });
  parrafo(estado.comandos, comentario, 53, estado.y - 38, 485, { tamano: 8.5, paso: 12, color: COLOR.tinta });
  estado.y -= alto + 24;

  estado = asegurarEspacio(estado, paginas, libreta, 45);
  linea(estado.comandos, 350, estado.y - 18, 535, estado.y - 18, COLOR.gris, 0.7);
  texto(estado.comandos, 384, estado.y - 31, 'Firma del docente tutor', { tamano: 7.5, color: COLOR.gris });
  return estado;
}

function crearPaginas(reporte) {
  const paginas = [];
  let estado = iniciarPagina(paginas, reporte, 1);
  rectangulo(estado.comandos, 38, estado.y - 26, 519, 22, COLOR.fondoAmbar, [0.94, 0.84, 0.61]);
  texto(estado.comandos, 51, estado.y - 18, 'REPORTE INFORMATIVO - NO REEMPLAZA LA LIBRETA OFICIAL DE LA INSTITUCIÓN', {
    tamano: 7.2, negrita: true, color: COLOR.ambar
  });
  estado.y -= 38;
  estado.y = dibujarDatosEstudiante(estado.comandos, reporte, estado.y);
  estado.y = dibujarAsistencia(estado.comandos, reporte, estado.y);
  estado.y -= 16;
  estado = dibujarCompetencias(paginas, estado, reporte);
  estado = dibujarComentarios(paginas, estado, reporte);
  paginas.forEach((comandos, indice) => {
    linea(comandos, 38, 49, 557, 49, COLOR.borde, 0.6);
    texto(comandos, 40, 34, 'Colegio San Marcos - Libreta parcial de notas', { tamano: 7, color: COLOR.gris });
    texto(comandos, 493, 34, `Página ${indice + 1} de ${paginas.length}`, { tamano: 7, color: COLOR.gris });
  });
  return paginas;
}

function bytesWinAnsi(textoPdf) {
  return Uint8Array.from(Array.from(textoPdf, (caracter) => caracter.charCodeAt(0) & 0xff));
}

/** Genera una libreta parcial de varias páginas con encabezado, resumen, competencias y comentario del tutor. */
export function generarLibretaPdf(reporte) {
  const paginas = crearPaginas(reporte);
  const idPagina = (indice) => 5 + indice * 2;
  const idContenido = (indice) => 6 + indice * 2;
  const objetos = new Map();
  objetos.set(1, '<< /Type /Catalog /Pages 2 0 R >>');
  objetos.set(2, `<< /Type /Pages /Kids [${paginas.map((_, indice) => `${idPagina(indice)} 0 R`).join(' ')}] /Count ${paginas.length} >>`);
  objetos.set(3, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
  objetos.set(4, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');

  paginas.forEach((comandosPagina, indice) => {
    const contenido = comandosPagina.join('\n');
    const longitud = bytesWinAnsi(contenido).length;
    objetos.set(idPagina(indice), `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${idContenido(indice)} 0 R >>`);
    objetos.set(idContenido(indice), `<< /Length ${longitud} >>\nstream\n${contenido}\nendstream`);
  });

  let documento = '%PDF-1.4\n%CODX\n';
  const desplazamientos = [0];
  for (let id = 1; id <= 4 + paginas.length * 2; id += 1) {
    desplazamientos[id] = bytesWinAnsi(documento).length;
    documento += `${id} 0 obj\n${objetos.get(id)}\nendobj\n`;
  }
  const inicioXref = bytesWinAnsi(documento).length;
  documento += `xref\n0 ${desplazamientos.length}\n0000000000 65535 f \n`;
  for (let id = 1; id < desplazamientos.length; id += 1) {
    documento += `${String(desplazamientos[id]).padStart(10, '0')} 00000 n \n`;
  }
  documento += `trailer\n<< /Size ${desplazamientos.length} /Root 1 0 R >>\nstartxref\n${inicioXref}\n%%EOF`;
  return new Blob([bytesWinAnsi(documento)], { type: 'application/pdf' });
}
