// TODO(backend): datos ficticios. Eliminar al integrar los endpoints de cursos y competencias
// (GET /cursos, POST /cursos, PUT /cursos/{id}/competencias; ver services/cursosService.js).
//
// Origen de los datos: prototipo de Figma Make (EduCoders Prototipo), vista "Cursos".
// `competenciasDisponibles` es el catálogo de competencias del CNEB que se puede elegir para
// el curso; `competenciasAsignadas` son los ids ya asignados (vacío al inicio).

const LATENCIA_MS = 400;

const GRADOS_VALIDOS = Object.freeze(['1', '2', '3', '4', '5']);

/**
 * Congela un valor en profundidad (objetos y arreglos anidados), para que ningún
 * consumidor pueda mutar los datos ficticios de partida.
 *
 * @param {*} valor
 * @returns {*}
 */
function congelarProfundo(valor) {
  if (valor !== null && typeof valor === 'object' && !Object.isFrozen(valor)) {
    Object.getOwnPropertyNames(valor).forEach((propiedad) => congelarProfundo(valor[propiedad]));
    Object.freeze(valor);
  }
  return valor;
}

/**
 * Quita tildes y pasa a minúsculas, para comparar nombres sin distinguir mayúsculas ni tildes.
 *
 * @param {string} texto
 * @returns {string}
 */
function normalizarTexto(texto) {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

/**
 * Copia profunda: nunca se devuelven las referencias del almacén.
 *
 * @param {*} valor
 * @returns {*}
 */
function clonar(valor) {
  return JSON.parse(JSON.stringify(valor));
}

function esperar() {
  return new Promise((resolver) => {
    setTimeout(resolver, LATENCIA_MS);
  });
}

const CURSOS_INICIALES = congelarProfundo([
  {
    id: 'CUR-0001',
    nombre: 'Matemáticas',
    descripcion: 'Desarrolla el pensamiento lógico, numérico y el razonamiento matemático elemental.',
    grado: '1',
    competenciasDisponibles: [
      {
        id: 'COM-0001',
        nombre: 'Resuelve problemas de cantidad'
      },
      {
        id: 'COM-0002',
        nombre: 'Resuelve problemas de regularidad, equivalencia y cambio'
      },
      {
        id: 'COM-0003',
        nombre: 'Resuelve problemas de forma, movimiento y localización'
      },
      {
        id: 'COM-0004',
        nombre: 'Resuelve problemas de gestión de datos e incertidumbre'
      }
    ],
    competenciasAsignadas: []
  },
  {
    id: 'CUR-0002',
    nombre: 'Comunicación',
    descripcion: 'Fortalece la comprensión lectora, la expresión oral y la producción de textos escritos.',
    grado: '1',
    competenciasDisponibles: [
      {
        id: 'COM-0005',
        nombre: 'Lee diversos tipos de textos en lengua materna'
      },
      {
        id: 'COM-0006',
        nombre: 'Escribe diversos tipos de textos'
      },
      {
        id: 'COM-0007',
        nombre: 'Se comunica oralmente en lengua materna'
      }
    ],
    competenciasAsignadas: []
  },
  {
    id: 'CUR-0003',
    nombre: 'Ciencias Sociales',
    descripcion: 'Explora la historia, la geografía y el ejercicio ciudadano desde una perspectiva crítica.',
    grado: '1',
    competenciasDisponibles: [
      {
        id: 'COM-0008',
        nombre: 'Construye interpretaciones históricas'
      },
      {
        id: 'COM-0009',
        nombre: 'Gestiona responsablemente el espacio y el ambiente'
      },
      {
        id: 'COM-0010',
        nombre: 'Gestiona responsablemente los recursos económicos'
      },
      {
        id: 'COM-0011',
        nombre: 'Convive y participa democráticamente'
      }
    ],
    competenciasAsignadas: []
  },
  {
    id: 'CUR-0004',
    nombre: 'Ciencia y Tecnología',
    descripcion: 'Introduce el método científico y la indagación en fenómenos naturales y tecnológicos básicos.',
    grado: '1',
    competenciasDisponibles: [
      {
        id: 'COM-0012',
        nombre: 'Indaga mediante métodos científicos'
      },
      {
        id: 'COM-0013',
        nombre: 'Explica el mundo físico basándose en conocimientos sobre seres vivos'
      },
      {
        id: 'COM-0014',
        nombre: 'Diseña y construye soluciones tecnológicas'
      }
    ],
    competenciasAsignadas: []
  },
  {
    id: 'CUR-0005',
    nombre: 'Inglés',
    descripcion: 'Inicia el aprendizaje del idioma inglés con énfasis en vocabulario y estructuras básicas.',
    grado: '1',
    competenciasDisponibles: [
      {
        id: 'COM-0015',
        nombre: 'Se comunica oralmente en inglés como lengua extranjera'
      },
      {
        id: 'COM-0016',
        nombre: 'Lee diversos tipos de textos en inglés'
      },
      {
        id: 'COM-0017',
        nombre: 'Escribe diversos tipos de textos en inglés'
      }
    ],
    competenciasAsignadas: []
  },
  {
    id: 'CUR-0006',
    nombre: 'Educación Física',
    descripcion: 'Promueve el desarrollo motor, la salud corporal y los valores del deporte en equipo.',
    grado: '1',
    competenciasDisponibles: [
      {
        id: 'COM-0018',
        nombre: 'Se desenvuelve de manera autónoma a través de su motricidad'
      },
      {
        id: 'COM-0019',
        nombre: 'Asume una vida saludable'
      },
      {
        id: 'COM-0020',
        nombre: 'Interactúa a través de sus habilidades sociomotrices'
      }
    ],
    competenciasAsignadas: []
  },
  {
    id: 'CUR-0007',
    nombre: 'Arte y Cultura',
    descripcion: 'Estimula la creatividad y la apreciación artística a través del dibujo, la música y el teatro.',
    grado: '1',
    competenciasDisponibles: [
      {
        id: 'COM-0021',
        nombre: 'Aprecia de manera crítica manifestaciones artístico-culturales'
      },
      {
        id: 'COM-0022',
        nombre: 'Crea proyectos desde los lenguajes artísticos'
      }
    ],
    competenciasAsignadas: []
  },
  {
    id: 'CUR-0008',
    nombre: 'Matemáticas',
    descripcion: 'Profundiza en álgebra, geometría plana y estadística descriptiva con ejercicios aplicados.',
    grado: '2',
    competenciasDisponibles: [
      {
        id: 'COM-0023',
        nombre: 'Resuelve problemas de cantidad'
      },
      {
        id: 'COM-0024',
        nombre: 'Resuelve problemas de regularidad, equivalencia y cambio'
      },
      {
        id: 'COM-0025',
        nombre: 'Resuelve problemas de forma, movimiento y localización'
      },
      {
        id: 'COM-0026',
        nombre: 'Resuelve problemas de gestión de datos e incertidumbre'
      }
    ],
    competenciasAsignadas: []
  },
  {
    id: 'CUR-0009',
    nombre: 'Comunicación',
    descripcion: 'Avanza hacia la producción de textos argumentativos y la comprensión de géneros literarios.',
    grado: '2',
    competenciasDisponibles: [
      {
        id: 'COM-0027',
        nombre: 'Lee diversos tipos de textos en lengua materna'
      },
      {
        id: 'COM-0028',
        nombre: 'Escribe diversos tipos de textos'
      },
      {
        id: 'COM-0029',
        nombre: 'Se comunica oralmente en lengua materna'
      }
    ],
    competenciasAsignadas: []
  },
  {
    id: 'CUR-0010',
    nombre: 'Ciencias Sociales',
    descripcion: 'Estudia los procesos históricos del Perú y América Latina con énfasis en la identidad cultural.',
    grado: '2',
    competenciasDisponibles: [
      {
        id: 'COM-0030',
        nombre: 'Construye interpretaciones históricas'
      },
      {
        id: 'COM-0031',
        nombre: 'Gestiona responsablemente el espacio y el ambiente'
      },
      {
        id: 'COM-0032',
        nombre: 'Convive y participa democráticamente'
      }
    ],
    competenciasAsignadas: []
  },
  {
    id: 'CUR-0011',
    nombre: 'Ciencia y Tecnología',
    descripcion: 'Explora la biología celular, la química básica y los principios del movimiento físico.',
    grado: '2',
    competenciasDisponibles: [
      {
        id: 'COM-0033',
        nombre: 'Indaga mediante métodos científicos'
      },
      {
        id: 'COM-0034',
        nombre: 'Explica el mundo físico basándose en conocimientos sobre seres vivos'
      },
      {
        id: 'COM-0035',
        nombre: 'Diseña y construye soluciones tecnológicas'
      }
    ],
    competenciasAsignadas: []
  },
  {
    id: 'CUR-0012',
    nombre: 'Inglés',
    descripcion: 'Consolida la comunicación básica en inglés con diálogos cotidianos y lectura comprensiva.',
    grado: '2',
    competenciasDisponibles: [
      {
        id: 'COM-0036',
        nombre: 'Se comunica oralmente en inglés como lengua extranjera'
      },
      {
        id: 'COM-0037',
        nombre: 'Lee diversos tipos de textos en inglés'
      },
      {
        id: 'COM-0038',
        nombre: 'Escribe diversos tipos de textos en inglés'
      }
    ],
    competenciasAsignadas: []
  },
  {
    id: 'CUR-0013',
    nombre: 'Educación Física',
    descripcion: 'Refuerza capacidades físicas y fomenta hábitos saludables mediante actividad deportiva regular.',
    grado: '2',
    competenciasDisponibles: [
      {
        id: 'COM-0039',
        nombre: 'Se desenvuelve de manera autónoma a través de su motricidad'
      },
      {
        id: 'COM-0040',
        nombre: 'Asume una vida saludable'
      },
      {
        id: 'COM-0041',
        nombre: 'Interactúa a través de sus habilidades sociomotrices'
      }
    ],
    competenciasAsignadas: []
  },
  {
    id: 'CUR-0014',
    nombre: 'Arte y Cultura',
    descripcion: 'Desarrolla técnicas de dibujo, composición visual y expresión corporal en el aula.',
    grado: '2',
    competenciasDisponibles: [
      {
        id: 'COM-0042',
        nombre: 'Aprecia de manera crítica manifestaciones artístico-culturales'
      },
      {
        id: 'COM-0043',
        nombre: 'Crea proyectos desde los lenguajes artísticos'
      }
    ],
    competenciasAsignadas: []
  },
  {
    id: 'CUR-0015',
    nombre: 'Matemáticas',
    descripcion: 'Introduce funciones lineales, trigonometría básica y probabilidad aplicada a contextos reales.',
    grado: '3',
    competenciasDisponibles: [
      {
        id: 'COM-0044',
        nombre: 'Resuelve problemas de cantidad'
      },
      {
        id: 'COM-0045',
        nombre: 'Resuelve problemas de regularidad, equivalencia y cambio'
      },
      {
        id: 'COM-0046',
        nombre: 'Resuelve problemas de forma, movimiento y localización'
      },
      {
        id: 'COM-0047',
        nombre: 'Resuelve problemas de gestión de datos e incertidumbre'
      }
    ],
    competenciasAsignadas: []
  },
  {
    id: 'CUR-0016',
    nombre: 'Comunicación',
    descripcion: 'Analiza textos expositivos y literarios; profundiza en la argumentación escrita y oral.',
    grado: '3',
    competenciasDisponibles: [
      {
        id: 'COM-0048',
        nombre: 'Lee diversos tipos de textos en lengua materna'
      },
      {
        id: 'COM-0049',
        nombre: 'Escribe diversos tipos de textos'
      },
      {
        id: 'COM-0050',
        nombre: 'Se comunica oralmente en lengua materna'
      }
    ],
    competenciasAsignadas: []
  },
  {
    id: 'CUR-0017',
    nombre: 'Ciencias Sociales',
    descripcion: 'Aborda economía, geografía física y ciudadanía con enfoque en derechos humanos.',
    grado: '3',
    competenciasDisponibles: [
      {
        id: 'COM-0051',
        nombre: 'Construye interpretaciones históricas'
      },
      {
        id: 'COM-0052',
        nombre: 'Gestiona responsablemente el espacio y el ambiente'
      },
      {
        id: 'COM-0053',
        nombre: 'Gestiona responsablemente los recursos económicos'
      },
      {
        id: 'COM-0054',
        nombre: 'Convive y participa democráticamente'
      }
    ],
    competenciasAsignadas: []
  },
  {
    id: 'CUR-0018',
    nombre: 'Ciencia y Tecnología',
    descripcion: 'Estudia la química orgánica introductoria, la genética básica y la física newtoniana.',
    grado: '3',
    competenciasDisponibles: [
      {
        id: 'COM-0055',
        nombre: 'Indaga mediante métodos científicos'
      },
      {
        id: 'COM-0056',
        nombre: 'Explica el mundo físico basándose en conocimientos sobre seres vivos'
      },
      {
        id: 'COM-0057',
        nombre: 'Diseña y construye soluciones tecnológicas'
      }
    ],
    competenciasAsignadas: []
  },
  {
    id: 'CUR-0019',
    nombre: 'Inglés',
    descripcion: 'Desarrolla la comprensión y producción de textos en inglés con estructuras de nivel intermedio.',
    grado: '3',
    competenciasDisponibles: [
      {
        id: 'COM-0058',
        nombre: 'Se comunica oralmente en inglés como lengua extranjera'
      },
      {
        id: 'COM-0059',
        nombre: 'Lee diversos tipos de textos en inglés'
      },
      {
        id: 'COM-0060',
        nombre: 'Escribe diversos tipos de textos en inglés'
      }
    ],
    competenciasAsignadas: []
  },
  {
    id: 'CUR-0020',
    nombre: 'Educación Física',
    descripcion: 'Fomenta el liderazgo deportivo, la planificación del entrenamiento y la vida activa.',
    grado: '3',
    competenciasDisponibles: [
      {
        id: 'COM-0061',
        nombre: 'Se desenvuelve de manera autónoma a través de su motricidad'
      },
      {
        id: 'COM-0062',
        nombre: 'Asume una vida saludable'
      },
      {
        id: 'COM-0063',
        nombre: 'Interactúa a través de sus habilidades sociomotrices'
      }
    ],
    competenciasAsignadas: []
  },
  {
    id: 'CUR-0021',
    nombre: 'Arte y Cultura',
    descripcion: 'Explora el arte contemporáneo peruano y las expresiones culturales regionales.',
    grado: '3',
    competenciasDisponibles: [
      {
        id: 'COM-0064',
        nombre: 'Aprecia de manera crítica manifestaciones artístico-culturales'
      },
      {
        id: 'COM-0065',
        nombre: 'Crea proyectos desde los lenguajes artísticos'
      }
    ],
    competenciasAsignadas: []
  },
  {
    id: 'CUR-0022',
    nombre: 'Matemáticas',
    descripcion: 'Curso orientado al desarrollo del razonamiento matemático y la resolución de problemas.',
    grado: '4',
    competenciasDisponibles: [
      {
        id: 'COM-0066',
        nombre: 'Resuelve problemas de cantidad'
      },
      {
        id: 'COM-0067',
        nombre: 'Resuelve problemas de regularidad, equivalencia y cambio'
      },
      {
        id: 'COM-0068',
        nombre: 'Resuelve problemas de forma, movimiento y localización'
      },
      {
        id: 'COM-0069',
        nombre: 'Resuelve problemas de gestión de datos e incertidumbre'
      }
    ],
    competenciasAsignadas: []
  },
  {
    id: 'CUR-0023',
    nombre: 'Comunicación',
    descripcion: 'Desarrolla competencias relacionadas con la comprensión y producción de textos.',
    grado: '4',
    competenciasDisponibles: [
      {
        id: 'COM-0070',
        nombre: 'Lee diversos tipos de textos en lengua materna'
      },
      {
        id: 'COM-0071',
        nombre: 'Escribe diversos tipos de textos'
      },
      {
        id: 'COM-0072',
        nombre: 'Se comunica oralmente en lengua materna'
      }
    ],
    competenciasAsignadas: []
  },
  {
    id: 'CUR-0024',
    nombre: 'Ciencias Sociales',
    descripcion: 'Promueve el análisis crítico de la historia, la geografía y la ciudadanía activa.',
    grado: '4',
    competenciasDisponibles: [
      {
        id: 'COM-0073',
        nombre: 'Construye interpretaciones históricas'
      },
      {
        id: 'COM-0074',
        nombre: 'Gestiona responsablemente el espacio y el ambiente'
      },
      {
        id: 'COM-0075',
        nombre: 'Gestiona responsablemente los recursos económicos'
      },
      {
        id: 'COM-0076',
        nombre: 'Convive y participa democráticamente'
      }
    ],
    competenciasAsignadas: []
  },
  {
    id: 'CUR-0025',
    nombre: 'Ciencia y Tecnología',
    descripcion: 'Fomenta la indagación científica a través de experimentos y el análisis de fenómenos naturales.',
    grado: '4',
    competenciasDisponibles: [
      {
        id: 'COM-0077',
        nombre: 'Indaga mediante métodos científicos'
      },
      {
        id: 'COM-0078',
        nombre: 'Explica el mundo físico basándose en conocimientos sobre seres vivos'
      },
      {
        id: 'COM-0079',
        nombre: 'Diseña y construye soluciones tecnológicas'
      }
    ],
    competenciasAsignadas: []
  },
  {
    id: 'CUR-0026',
    nombre: 'Inglés',
    descripcion: 'Fortalece las habilidades comunicativas en inglés a través de textos y conversaciones.',
    grado: '4',
    competenciasDisponibles: [
      {
        id: 'COM-0080',
        nombre: 'Se comunica oralmente en inglés como lengua extranjera'
      },
      {
        id: 'COM-0081',
        nombre: 'Lee diversos tipos de textos en inglés'
      },
      {
        id: 'COM-0082',
        nombre: 'Escribe diversos tipos de textos en inglés'
      }
    ],
    competenciasAsignadas: []
  },
  {
    id: 'CUR-0027',
    nombre: 'Educación Física',
    descripcion: 'Promueve el bienestar físico, la salud integral y la práctica deportiva responsable.',
    grado: '4',
    competenciasDisponibles: [
      {
        id: 'COM-0083',
        nombre: 'Se desenvuelve de manera autónoma a través de su motricidad'
      },
      {
        id: 'COM-0084',
        nombre: 'Asume una vida saludable'
      },
      {
        id: 'COM-0085',
        nombre: 'Interactúa a través de sus habilidades sociomotrices'
      }
    ],
    competenciasAsignadas: []
  },
  {
    id: 'CUR-0028',
    nombre: 'Arte y Cultura',
    descripcion: 'Estimula la expresión artística y la apreciación de manifestaciones culturales del Perú.',
    grado: '4',
    competenciasDisponibles: [
      {
        id: 'COM-0086',
        nombre: 'Aprecia de manera crítica manifestaciones artístico-culturales'
      },
      {
        id: 'COM-0087',
        nombre: 'Crea proyectos desde los lenguajes artísticos'
      }
    ],
    competenciasAsignadas: []
  },
  {
    id: 'CUR-0029',
    nombre: 'Matemáticas',
    descripcion: 'Consolida el pensamiento matemático avanzado con énfasis en cálculo y estadística inferencial.',
    grado: '5',
    competenciasDisponibles: [
      {
        id: 'COM-0088',
        nombre: 'Resuelve problemas de cantidad'
      },
      {
        id: 'COM-0089',
        nombre: 'Resuelve problemas de regularidad, equivalencia y cambio'
      },
      {
        id: 'COM-0090',
        nombre: 'Resuelve problemas de forma, movimiento y localización'
      },
      {
        id: 'COM-0091',
        nombre: 'Resuelve problemas de gestión de datos e incertidumbre'
      }
    ],
    competenciasAsignadas: []
  },
  {
    id: 'CUR-0030',
    nombre: 'Comunicación',
    descripcion: 'Perfecciona la argumentación oral y escrita preparando al estudiante para la vida académica.',
    grado: '5',
    competenciasDisponibles: [
      {
        id: 'COM-0092',
        nombre: 'Lee diversos tipos de textos en lengua materna'
      },
      {
        id: 'COM-0093',
        nombre: 'Escribe diversos tipos de textos'
      },
      {
        id: 'COM-0094',
        nombre: 'Se comunica oralmente en lengua materna'
      }
    ],
    competenciasAsignadas: []
  },
  {
    id: 'CUR-0031',
    nombre: 'Ciencias Sociales',
    descripcion: 'Analiza la realidad peruana contemporánea, globalización y perspectivas de desarrollo sostenible.',
    grado: '5',
    competenciasDisponibles: [
      {
        id: 'COM-0095',
        nombre: 'Construye interpretaciones históricas'
      },
      {
        id: 'COM-0096',
        nombre: 'Gestiona responsablemente el espacio y el ambiente'
      },
      {
        id: 'COM-0097',
        nombre: 'Gestiona responsablemente los recursos económicos'
      },
      {
        id: 'COM-0098',
        nombre: 'Convive y participa democráticamente'
      }
    ],
    competenciasAsignadas: []
  },
  {
    id: 'CUR-0032',
    nombre: 'Ciencia y Tecnología',
    descripcion: 'Integra física, química y biología con enfoque en aplicaciones tecnológicas y medioambientales.',
    grado: '5',
    competenciasDisponibles: [
      {
        id: 'COM-0099',
        nombre: 'Indaga mediante métodos científicos'
      },
      {
        id: 'COM-0100',
        nombre: 'Explica el mundo físico basándose en conocimientos sobre seres vivos'
      },
      {
        id: 'COM-0101',
        nombre: 'Diseña y construye soluciones tecnológicas'
      }
    ],
    competenciasAsignadas: []
  },
  {
    id: 'CUR-0033',
    nombre: 'Inglés',
    descripcion: 'Consolida el nivel B1 del Marco Europeo para la comunicación académica y profesional.',
    grado: '5',
    competenciasDisponibles: [
      {
        id: 'COM-0102',
        nombre: 'Se comunica oralmente en inglés como lengua extranjera'
      },
      {
        id: 'COM-0103',
        nombre: 'Lee diversos tipos de textos en inglés'
      },
      {
        id: 'COM-0104',
        nombre: 'Escribe diversos tipos de textos en inglés'
      }
    ],
    competenciasAsignadas: []
  },
  {
    id: 'CUR-0034',
    nombre: 'Educación Física',
    descripcion: 'Orienta al estudiante hacia un estilo de vida activo y saludable con visión a largo plazo.',
    grado: '5',
    competenciasDisponibles: [
      {
        id: 'COM-0105',
        nombre: 'Se desenvuelve de manera autónoma a través de su motricidad'
      },
      {
        id: 'COM-0106',
        nombre: 'Asume una vida saludable'
      },
      {
        id: 'COM-0107',
        nombre: 'Interactúa a través de sus habilidades sociomotrices'
      }
    ],
    competenciasAsignadas: []
  },
  {
    id: 'CUR-0035',
    nombre: 'Arte y Cultura',
    descripcion: 'Cierra el ciclo artístico con proyectos creativos integradores y reflexión cultural profunda.',
    grado: '5',
    competenciasDisponibles: [
      {
        id: 'COM-0108',
        nombre: 'Aprecia de manera crítica manifestaciones artístico-culturales'
      },
      {
        id: 'COM-0109',
        nombre: 'Crea proyectos desde los lenguajes artísticos'
      }
    ],
    competenciasAsignadas: []
  }
]);

// Almacén en memoria: los cambios (cursos creados, competencias guardadas) duran hasta recargar la página.
let almacen = clonar(CURSOS_INICIALES);
let contadorId = almacen.length;

/**
 * Cursos de un grado, con sus competencias disponibles y asignadas.
 *
 * @param {string} grado '1' a '5'.
 * @returns {Promise<{exitoso: boolean, datos: Array|null, mensaje: string, estado?: number}>}
 */
export async function listarCursosPorGradoMock(grado) {
  await esperar();

  if (!GRADOS_VALIDOS.includes(grado)) {
    return { exitoso: false, datos: null, mensaje: 'El grado indicado no existe.', estado: 400 };
  }

  return { exitoso: true, datos: clonar(almacen.filter((curso) => curso.grado === grado)), mensaje: '' };
}

/**
 * Crea un curso en un grado. Simula las reglas del backend: campos obligatorios y nombre único por grado.
 *
 * @param {{ nombre: string, descripcion: string, grado: string }} datos
 * @returns {Promise<{exitoso: boolean, datos: Object|null, mensaje: string, estado?: number}>}
 */
export async function crearCursoMock({ nombre, descripcion, grado }) {
  await esperar();

  const nombreLimpio = (nombre ?? '').trim();
  const descripcionLimpia = (descripcion ?? '').trim();

  if (!nombreLimpio || !descripcionLimpia || !GRADOS_VALIDOS.includes(grado)) {
    return { exitoso: false, datos: null, mensaje: 'Los datos del curso no son válidos.', estado: 400 };
  }

  const duplicado = almacen.some(
    (curso) => curso.grado === grado && normalizarTexto(curso.nombre) === normalizarTexto(nombreLimpio)
  );
  if (duplicado) {
    return { exitoso: false, datos: null, mensaje: 'Ya existe un curso con ese nombre en este grado.', estado: 409 };
  }

  contadorId += 1;
  const nuevo = {
    id: `CUR-${String(contadorId).padStart(4, '0')}`,
    nombre: nombreLimpio,
    descripcion: descripcionLimpia,
    grado,
    competenciasDisponibles: [], // TODO(backend): el catálogo CNEB lo entregará el backend
    competenciasAsignadas: []
  };
  almacen.push(nuevo);

  return { exitoso: true, datos: clonar(nuevo), mensaje: '' };
}

/**
 * Reemplaza las competencias asignadas a un curso. Solo acepta ids del catálogo del curso.
 *
 * @param {string} idCurso
 * @param {string[]} idsCompetencias
 * @returns {Promise<{exitoso: boolean, datos: Object|null, mensaje: string, estado?: number}>}
 */
export async function guardarCompetenciasCursoMock(idCurso, idsCompetencias) {
  await esperar();

  const curso = almacen.find((candidato) => candidato.id === idCurso);
  if (!curso) {
    return { exitoso: false, datos: null, mensaje: 'El curso indicado no existe.', estado: 404 };
  }

  const idsDisponibles = new Set(curso.competenciasDisponibles.map((competencia) => competencia.id));
  const ids = Array.isArray(idsCompetencias) ? idsCompetencias : [];
  if (!ids.every((id) => idsDisponibles.has(id))) {
    return { exitoso: false, datos: null, mensaje: 'Alguna competencia no pertenece a este curso.', estado: 400 };
  }

  curso.competenciasAsignadas = [...new Set(ids)];

  return { exitoso: true, datos: clonar(curso), mensaje: '' };
}
