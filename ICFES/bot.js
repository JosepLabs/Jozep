// =====================================================
// bot.js — Asistente Virtual "ICFI" v2.0
// ─────────────────────────────────────────────────
// Arquitectura de reglas extendida con:
//   1. Context-Awareness   — respuestas específicas por vista activa
//   2. Progress Integration — datos reales del historial del estudiante
//   3. Acción + Botón      — respuestas que inyectan un CTA clicable
//   4. Micro-flujos (FSM)  — modo flashcard de inglés con estado propio
//   5. Fallback Logging    — inputs no reconocidos guardados en localStorage
// =====================================================

import { obtenerDashboardData } from './progressManager.js';

// ─────────────────────────────────────────────────
// § 1. CONSTANTES Y CONFIGURACIÓN
// ─────────────────────────────────────────────────

/** Clave para el log de inputs no reconocidos en localStorage */
const LOG_KEY = 'icfes_bot_unrecognized_logs';

/**
 * Mapeo vista-activa → consejo contextual.
 * Las claves coinciden con los valores de `vistaActual` que
 * emite el router de main.js (ej. 'matematicas', 'simulacro', …).
 */
const CONSEJOS_CONTEXTUALES = {
  matematicas: [
    "Como estás en <b>Matemáticas</b>: lee el enunciado dos veces, identifica los datos clave y descarta las opciones absurdas antes de calcular. ✏️",
    "Tip de <b>Matemáticas</b>: cuando veas un problema de geometría, dibuja la figura aunque sea un bosquejo rápido. Visualizar lo cambia todo. 📐",
  ],
  lectura: [
    "En <b>Lectura Crítica</b> nunca respondas con lo que sabes del tema; responde con lo que el texto dice o implica. La evidencia textual manda. 🔍",
    "Tip de <b>Lectura</b>: detecta primero el propósito del autor (informar, persuadir, narrar) y el tono (irónico, objetivo, crítico). Eso orienta todo. 📰",
  ],
  ciencias: [
    "Estás en <b>Ciencias</b>: muchas preguntas usan un experimento como contexto. Identifica la variable independiente, la dependiente y el control antes de responder. 🔬",
    "Tip de <b>Ciencias</b>: las preguntas de cadena trófica siempre preguntan qué pasa si se elimina un eslabón. Piensa siempre de abajo (productor) hacia arriba. 🧬",
  ],
  sociales: [
    "En <b>Sociales</b>: domina los mecanismos de participación ciudadana (tutela, referendo, consulta popular) y el contexto de la Constitución de 1991. 📜",
    "Tip de <b>Sociales</b>: cuando el texto hable de un período histórico, ubícalo en el tiempo antes de leer las opciones. El contexto temporal evita muchos errores. 🌎",
  ],
  ingles: [
    "En <b>Inglés</b>: para los avisos (<i>notices</i>), lee primero la pregunta y luego el aviso. Sabrás exactamente qué dato buscar. 🇬🇧",
    "Tip de <b>Inglés</b>: los conectores (however, therefore, moreover) suelen ser la clave de preguntas de coherencia. Aprende las familias: contraste, adición y consecuencia. 📚",
  ],
  simulacro: [
    "Durante el <b>simulacro</b>: si una pregunta te bloquea más de 30 segundos, márcala mentalmente y avanza. El tiempo es tu recurso más escaso. ⏱️",
    "En el <b>simulacro</b>: recuerda que no hay penalización por respuesta incorrecta. Nunca dejes una pregunta en blanco; siempre hay una opción más razonable que las demás. 🎯",
  ],
  estudio: [
    "En la <b>sesión de estudio</b>: aprovecha que tienes retroalimentación inmediata. Cuando falles, lee despacio la justificación — es más valiosa que la respuesta correcta. 🧠",
    "Tip para <b>modo estudio</b>: después de cada sesión, anota en un cuaderno los conceptos que más fallaste. Eso alimenta tu próxima rutina de repaso. 📖",
  ],
};

// ─────────────────────────────────────────────────
// § 2. BASE DE CONOCIMIENTO — DICCIONARIO DE RESPUESTAS
//
// Cada entrada es un array que puede contener:
//   • string puro          → solo texto/HTML
//   • { texto, accion }   → texto + botón CTA (Feature 3)
// ─────────────────────────────────────────────────
const RESPUESTAS = {
  saludo: [
    "¡Hola! 👋 Soy <b>ICFI</b>, tu asistente para el Saber 11°. Puedes preguntarme sobre las materias, el simulacro, tu progreso o pedir consejos.",
    "¡Buenas! 🎓 Estoy aquí para ayudarte. Escribe <b>'ayuda'</b> para ver todo lo que puedo hacer.",
  ],

  ayuda: [
    `Aquí lo que puedo explicarte:<br>
     <b>• 'empezar'</b> — cómo iniciar una sesión<br>
     <b>• 'simulacro'</b> — modo examen completo<br>
     <b>• 'estudio'</b> — sesión de práctica por materia<br>
     <b>• 'progreso'</b> o <b>'cómo voy'</b> — tu historial real<br>
     <b>• 'matemáticas'</b>, <b>'lectura'</b>, <b>'ciencias'</b>, <b>'sociales'</b>, <b>'inglés'</b><br>
     <b>• 'practicar inglés'</b> — mini flashcards interactivas<br>
     <b>• 'puntaje'</b>, <b>'dificultad'</b>, <b>'consejo'</b>`,
    "Puedo orientarte sobre materias, estrategias de estudio, mostrarte tu progreso real o lanzar un simulacro. ¡Solo escribe lo que necesitas! 💬",
  ],

  empezar: [
    {
      texto: "Para comenzar elige <b>Sesión de Estudio</b> para practicar una materia con retroalimentación inmediata, o <b>Simulacro</b> para el examen completo con cronómetro. ¿Empezamos con un simulacro ahora?",
      accion: 'iniciar_simulacro',
      labelAccion: '🚀 Iniciar Simulacro',
    },
    "Si es tu primera vez, te recomiendo la <b>Sesión de Estudio</b> por materia. Refuerza las áreas débiles antes de enfrentarte al simulacro completo. 📖",
  ],

  simulacro: [
    {
      texto: "El <b>Simulacro</b> mezcla preguntas de todas las materias con <b>90 segundos por pregunta</b>. Sin retroalimentación durante la prueba. Al terminar recibirás un reporte completo de desempeño. ⏱️ ¿Lo iniciamos?",
      accion: 'iniciar_simulacro',
      labelAccion: '⏱️ Iniciar Simulacro',
    },
    "El simulacro replica las condiciones reales del ICFES Saber 11°. El informe final muestra fortalezas y áreas a reforzar por materia y competencia. 📊",
  ],

  estudio: [
    {
      texto: "La <b>Sesión de Estudio</b> te deja elegir una materia. Verás retroalimentación inmediata en cada respuesta. Sin cronómetro, a tu ritmo. 📖",
      accion: 'ir_inicio',
      labelAccion: '📚 Elegir Materia',
    },
    "En modo estudio las preguntas se mezclan aleatoriamente dentro de la materia que elijas. Ideal para repasar temas específicos. 🧩",
  ],

  matematicas: [
    "Matemáticas evalúa: <b>Interpretación y representación</b>, <b>Formulación y argumentación</b> y <b>Solución de problemas</b>. Cubre álgebra, geometría, estadística y probabilidad. 🔢",
    "Tip Matemáticas: descarta primero las opciones absurdas, luego verifica tu resultado con la opción que elegiste. El proceso de eliminación es tu aliado. ✏️",
  ],

  lectura: [
    "Lectura Crítica evalúa tres niveles: <b>Comprensión local</b> (detalles), <b>Comprensión global</b> (idea principal) e <b>Inferencial</b> (deducciones). Incluye textos continuos y discontinuos. 📰",
    "Tip Lectura: identifica el propósito del autor y el tono antes de leer las opciones. Nunca respondas con conocimiento externo al texto. 🔍",
  ],

  ciencias: [
    "Ciencias integra Biología, Química y Física. Evalúa <b>Uso del conocimiento científico</b>, <b>Explicación de fenómenos</b> e <b>Indagación</b>. Frecuentes preguntas sobre experimentos y cadenas tróficas. 🔬",
    "Tip Ciencias: domina el método científico. Variable independiente (la que se manipula), dependiente (la que se mide) y de control (las que se mantienen iguales). 🧪",
  ],

  sociales: [
    "Sociales abarca Historia, Geografía, Constitución Política y Economía. Evalúa <b>Pensamiento social</b> y <b>Pensamiento reflexivo y sistémico</b>. 🌎",
    "Tip Sociales: memoriza la Constitución de 1991, los mecanismos de participación ciudadana (tutela, referendo, consulta previa) y el contexto histórico colombiano. 📜",
  ],

  ingles: [
    "El ICFES evalúa inglés en niveles <b>A-, A1, A2 y B1</b>. Solo comprensión lectora: avisos, diálogos, artículos cortos. Sin producción oral ni escrita. 🇬🇧",
    "Tip Inglés: amplía tu vocabulario de las 500 palabras más frecuentes y practica leyendo textos cortos. Gramática y comprensión lectora son las claves. 📚",
  ],

  puntaje: [
    "El ICFES Saber 11° tiene <b>5 pruebas</b>, cada una entre <b>0 y 100</b>. El puntaje global es el promedio de todas. Las universidades usan este puntaje para admisiones, con umbrales distintos por programa. 🏆",
    "Un puntaje global superior a <b>70/100</b> es competitivo para muchas universidades. Para Medicina o Ingeniería en universidades top se requiere 80+ en las pruebas relevantes. 🎯",
  ],

  dificultad: [
    "Las preguntas tienen 3 niveles:<br><b>⭐ Básico</b> — Conocimiento directo<br><b>⭐⭐ Intermedio</b> — Aplicación de conceptos<br><b>⭐⭐⭐ Avanzado</b> — Análisis y evaluación crítica<br>El ICFES real incluye los tres en proporciones similares. 🌟",
    "Estrategia: asegura los puntos básicos (⭐) primero. Trabaja los intermedios (⭐⭐) con práctica constante. Los avanzados (⭐⭐⭐) requieren razonamiento profundo. 🏗️",
  ],

  consejo: [
    "Técnica <b>Pomodoro</b>: estudia 25 min → descansa 5. Repite 4 veces y toma un descanso largo de 20-30 min. Mejora concentración y retención. ⏰",
    "<b>Práctica espaciada</b>: 30 min diarios durante 3 semanas > 12 horas el día anterior al examen. Tu cerebro consolida con repetición en el tiempo. 📅",
    "Tip: haz un simulacro completo una vez por semana. Revisa cada error leyendo la justificación, no solo la respuesta correcta. Entender el <i>por qué</i> vale más que memorizar. 🧠",
  ],

  agradecimiento: [
    "¡Con gusto! 😊 ¡A estudiar se ha dicho! 💪",
    "¡Fue un placer! Si tienes más dudas, aquí estaré. ¡Éxitos en tu preparación! 🎓",
  ],

  motivacion: [
    "¡Tú puedes lograrlo! 💪 El éxito en el ICFES es resultado de constancia diaria, no de golpes de suerte. ¡Sigue!",
    "Cada pregunta que respondes, aunque sea incorrecta, es una oportunidad de aprendizaje. ¡El proceso importa tanto como el resultado! 🌱",
    "¡Confía en tu preparación! Estudia con método y los resultados llegarán. ¡Ánimo! 🚀",
  ],

  default: [
    "Hmm, no entendí eso. 🤔 Prueba con: <b>'ayuda'</b>, <b>'simulacro'</b>, <b>'matemáticas'</b>, <b>'inglés'</b>, <b>'cómo voy'</b> o <b>'practicar inglés'</b>.",
    "No tengo información sobre eso todavía. 😅 Intenta con: <b>'empezar'</b>, <b>'estudio'</b>, <b>'dificultad'</b> o el nombre de una materia.",
  ],
};

// ─────────────────────────────────────────────────
// § 3. BANCO DE FLASHCARDS DE INGLÉS (Micro-flujo)
// Cada flashcard: { en, es, pistas }
// ─────────────────────────────────────────────────
const FLASHCARDS_INGLES = [
  { en: 'breakfast',   es: ['desayuno'],                       pista: 'La primera comida del día.' },
  { en: 'library',     es: ['biblioteca'],                     pista: 'Lugar donde se prestan libros.' },
  { en: 'however',     es: ['sin embargo', 'no obstante'],     pista: 'Conector de contraste.' },
  { en: 'therefore',   es: ['por lo tanto', 'por ende'],       pista: 'Conector de consecuencia.' },
  { en: 'bicycle',     es: ['bicicleta'],                      pista: 'Vehículo de dos ruedas con pedales.' },
  { en: 'although',    es: ['aunque', 'a pesar de que'],       pista: 'Conector de concesión.' },
  { en: 'physician',   es: ['médico', 'doctor'],               pista: 'Profesional de la salud.' },
  { en: 'schedule',    es: ['horario', 'agenda'],              pista: 'Planificación de tiempos.' },
  { en: 'furthermore', es: ['además', 'es más'],               pista: 'Conector de adición y énfasis.' },
  { en: 'deadline',    es: ['fecha límite', 'plazo'],          pista: 'La última hora para entregar algo.' },
];

// ─────────────────────────────────────────────────
// § 4. MÁQUINA DE ESTADOS DEL BOT (Feature 4)
// ─────────────────────────────────────────────────

/**
 * Estado global del bot.
 * Valores posibles:
 *   'normal'                    — flujo estándar de reglas
 *   'flashcard_esperando'       — esperando traducción del usuario
 */
let estadoActual = 'normal';

/** Flashcard activa durante el micro-flujo */
let flashcardActual = null;

// ─────────────────────────────────────────────────
// § 5. MOTOR DE RESPUESTAS — FUNCIÓN PRINCIPAL
// ─────────────────────────────────────────────────

/**
 * Evalúa el input del usuario y retorna un objeto de respuesta.
 *
 * @param {string} input        — Texto ingresado por el usuario
 * @param {string} [vistaActual] — ID de la vista activa en la app (Feature 1)
 *
 * @returns {{ texto: string, accion?: string, labelAccion?: string }}
 *   Siempre retorna un objeto normalizado. `accion` y `labelAccion`
 *   solo están presentes cuando la respuesta incluye un botón CTA.
 */
export function obtenerRespuesta(input, vistaActual = null) {
  // ── Guardia: input vacío ──────────────────────────────────────────────
  if (!input || input.trim() === '') {
    return { texto: "Por favor, escribe algo para que pueda ayudarte. 😊" };
  }

  // ── Normalizar texto para regex ───────────────────────────────────────
  const texto = input.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  // ════════════════════════════════════════════════════════════════════════
  // FEATURE 4 — MICRO-FLUJO: Flashcard activa
  // Si el bot está en estado 'flashcard_esperando', el input del usuario
  // NO pasa por las reglas normales: se evalúa como respuesta a la tarjeta.
  // ════════════════════════════════════════════════════════════════════════
  if (estadoActual === 'flashcard_esperando' && flashcardActual) {
    return _evaluarRespuestaFlashcard(texto);
  }

  // ════════════════════════════════════════════════════════════════════════
  // TABLA DE REGLAS PRINCIPALES
  // Orden importa: las reglas más específicas van primero.
  // ════════════════════════════════════════════════════════════════════════
  const REGLAS = [
    // — Saludos
    [/\b(hola|buenos|buenas|hey|saludos|ey|ola)\b/,                         'saludo'],
    // — Ayuda
    [/\b(ayuda|help|que (puedes|haces)|comandos|funciones|menu)\b/,          'ayuda'],
    // — Agradecimiento
    [/\b(gracias|thank|genial|perfecto|excelente)\b/,                        'agradecimiento'],
    // — Motivación
    [/\b(animo|motivacion|puedo|miedo|nervios|estresado|cansado)\b/,         'motivacion'],
    // — Cómo empezar
    [/\b(empezar|comenzar|iniciar|start|como (uso|funciona))\b/,             'empezar'],
    // — Simulacro
    [/\b(simulacro|examen completo|todas las materias|cronometrado)\b/,      'simulacro'],
    // — Sesión de estudio (debe ir antes que la regla genérica de inglés)
    [/\b(sesion de estudio|modo estudio)\b/,                                 'estudio'],

    // FEATURE 4: Activar micro-flujo de flashcards
    [/\b(practicar ingles|practicar ingles|flashcard|tarjeta|vocabulario ingles)\b/, '__flashcard__'],

    // — Materias
    [/\b(matematica|matematicas|algebra|geometria|calculo|numeros)\b/,       'matematicas'],
    [/\b(lectura|leer|texto|critica|comprension|poema|narrativa)\b/,         'lectura'],
    [/\b(ciencias|biologia|quimica|fisica|naturaleza|experimento)\b/,        'ciencias'],
    [/\b(sociales|historia|geografia|constitucion|ciudadanas|politica)\b/,   'sociales'],
    [/\b(ingles|english|idioma|lengua extranjera)\b/,                        'ingles'],

    // — Puntaje y dificultad
    [/\b(puntaje|puntuacion|score|nota|calificacion|cuanto|resultado)\b/,   'puntaje'],
    [/\b(dificultad|nivel|dificil|facil|avanzado|basico)\b/,                'dificultad'],

    // FEATURE 2: Progreso real del estudiante
    [/\b(progreso|como voy|mis notas|mi puntaje|estadistica|historial|rendimiento)\b/, '__progreso__'],

    // — Consejo genérico (va al final para que el contexto lo capture antes)
    [/\b(consejo|tip|recomendacion|estrategia|como estudiar|metodo)\b/,     'consejo'],
  ];

  // ── Iterar reglas ─────────────────────────────────────────────────────
  for (const [regex, clave] of REGLAS) {
    if (!regex.test(texto)) continue;

    // ── Acción especial: Iniciar flashcard ───────────────────────────────
    if (clave === '__flashcard__') {
      return _iniciarFlashcard();
    }

    // ── Acción especial: Consultar progreso real ─────────────────────────
    if (clave === '__progreso__') {
      return _respuestaProgreso();
    }

    // FEATURE 1 — Context-Awareness
    // Si el input es genérico ('consejo', 'estudiar', etc.) Y hay una vista
    // activa con consejo específico → devolver el consejo contextual.
    if (
      (clave === 'consejo' || clave === 'estudio') &&
      vistaActual &&
      CONSEJOS_CONTEXTUALES[vistaActual]
    ) {
      return _normalizar(_aleatorio(CONSEJOS_CONTEXTUALES[vistaActual]));
    }

    // Respuesta estándar del diccionario
    return _normalizar(_aleatorio(RESPUESTAS[clave]));
  }

  // ════════════════════════════════════════════════════════════════════════
  // FEATURE 5 — FALLBACK LOGGING
  // Ninguna regla coincidió: guardar el input en localStorage para analítica
  // ════════════════════════════════════════════════════════════════════════
  _guardarInputNoReconocido(input.trim());
  return _normalizar(_aleatorio(RESPUESTAS.default));
}

// ─────────────────────────────────────────────────
// § 6. HELPERS INTERNOS
// ─────────────────────────────────────────────────

/**
 * FEATURE 2 — Construye la respuesta dinámica de progreso
 * leyendo datos reales del ProgressManager.
 *
 * @returns {{ texto: string }}
 */
function _respuestaProgreso() {
  const { totalSimulacros, promedioGlobal, tendencia } = obtenerDashboardData();

  if (totalSimulacros === 0) {
    return {
      texto: "Todavía no tienes simulacros registrados. 📊 Completa tu primer simulacro para ver estadísticas de progreso aquí.",
    };
  }

  // Emoji de tendencia
  const emojiTendencia = {
    mejorando: '📈 mejorando',
    decayendo: '📉 bajando un poco',
    estable:   '➡️ estable',
    sin_datos: '📊 en análisis',
  }[tendencia] || '📊';

  const promTexto = promedioGlobal !== null
    ? `tu promedio global es <b>${promedioGlobal}/100</b>`
    : 'aún no hay promedio calculado';

  return {
    texto: `📊 <b>Tu progreso:</b><br>
    • Simulacros completados: <b>${totalSimulacros}</b><br>
    • Promedio global: <b>${promedioGlobal ?? '—'}/100</b><br>
    • Tendencia: <b>${emojiTendencia}</b><br><br>
    ${totalSimulacros < 3
      ? 'Completa al menos <b>3 simulacros</b> para que la tendencia sea más precisa. 💪'
      : `¡Vas por buen camino! Recuerda revisar las justificaciones de los errores.`
    }`,
  };
}

/**
 * FEATURE 4 — Inicia el micro-flujo de flashcards.
 * Cambia el estado del bot y elige una tarjeta aleatoria.
 *
 * @returns {{ texto: string }}
 */
function _iniciarFlashcard() {
  flashcardActual = _aleatorio(FLASHCARDS_INGLES);
  estadoActual    = 'flashcard_esperando';

  return {
    texto: `🇬🇧 <b>¡Modo Flashcard activado!</b><br><br>
    Traduce esta palabra al español:<br>
    <b style="font-size:1.2em">"${flashcardActual.en}"</b><br><br>
    <i>Pista: ${flashcardActual.pista}</i><br>
    <small style="opacity:0.7">Escribe tu respuesta o <b>"salir"</b> para cancelar.</small>`,
  };
}

/**
 * FEATURE 4 — Evalúa la respuesta del usuario a la flashcard activa.
 * Resetea el estado del bot a 'normal' al terminar.
 *
 * @param {string} textoNormalizado — Input ya en minúsculas y sin tildes
 * @returns {{ texto: string }}
 */
function _evaluarRespuestaFlashcard(textoNormalizado) {
  // Permitir salir del flujo
  if (/\b(salir|cancelar|exit|stop|no|suficiente)\b/.test(textoNormalizado)) {
    estadoActual    = 'normal';
    flashcardActual = null;
    return { texto: "De acuerdo, salimos del modo flashcard. ¡Buen trabajo por practicar! 💪 ¿En qué más te puedo ayudar?" };
  }

  const { en, es, pista } = flashcardActual;

  // Normalizar respuestas correctas para comparación sin tildes/mayúsculas
  const esNormalizadas = es.map((r) =>
    r.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()
  );

  const acierto = esNormalizadas.some((respCorrecta) =>
    textoNormalizado.includes(respCorrecta)
  );

  // Resetear estado antes de retornar
  const cardVieja  = flashcardActual;
  estadoActual    = 'normal';
  flashcardActual = null;

  if (acierto) {
    return {
      texto: `✅ <b>¡Correcto!</b> "<b>${cardVieja.en}</b>" = "<b>${cardVieja.es[0]}</b>".<br><br>
      ¡Excelente! 🎉 Si quieres practicar otra, escribe <b>"flashcard"</b> de nuevo.`,
    };
  }

  return {
    texto: `❌ <b>Casi.</b> La traducción de "<b>${cardVieja.en}</b>" es "<b>${cardVieja.es.join(' / ')}</b>".<br><br>
    Recuerda: <i>${cardVieja.pista}</i><br>
    Escribe <b>"flashcard"</b> para intentar con otra palabra. 📚`,
  };
}

/**
 * FEATURE 5 — Guarda inputs no reconocidos en localStorage para analítica.
 *
 * @param {string} input — Input original del usuario (sin normalizar)
 */
function _guardarInputNoReconocido(input) {
  try {
    const raw  = localStorage.getItem(LOG_KEY);
    const logs = raw ? JSON.parse(raw) : [];
    logs.push({ input, timestamp: new Date().toISOString() });
    // Mantener máximo 200 registros (evitar crecimiento descontrolado)
    if (logs.length > 200) logs.splice(0, logs.length - 200);
    localStorage.setItem(LOG_KEY, JSON.stringify(logs));
  } catch (err) {
    console.warn('[ICFESBot] No se pudo guardar log de fallback:', err);
  }
}

/**
 * Normaliza un elemento del diccionario al formato de objeto de respuesta.
 * Acepta string puro u objeto { texto, accion, labelAccion }.
 *
 * @param {string|Object} entrada
 * @returns {{ texto: string, accion?: string, labelAccion?: string }}
 */
function _normalizar(entrada) {
  if (typeof entrada === 'string') return { texto: entrada };
  return entrada; // Ya es objeto { texto, accion, labelAccion }
}

/**
 * Retorna un elemento aleatorio de un array.
 *
 * @param {Array} arr
 * @returns {*}
 */
function _aleatorio(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─────────────────────────────────────────────────
// § 7. INICIALIZACIÓN DEL COMPONENTE UI
// ─────────────────────────────────────────────────

/**
 * Crea e inyecta el componente del chatbot en el DOM
 * y enlaza todos los event listeners necesarios.
 *
 * @param {Function} [getVistaActual] — Callback opcional que devuelve
 *   el ID de la vista actualmente activa en la app (Feature 1).
 *   Ejemplo: () => stateManager.getVistaActual()
 */
export function inicializarBot(getVistaActual = () => null) {
  const botHTML = `
    <div class="bot-wrapper" id="bot-wrapper" role="complementary" aria-label="Asistente ICFI">

      <!-- BURBUJA DE CHAT -->
      <div class="bot-bubble" id="bot-bubble" role="dialog" aria-modal="false" aria-label="Chat con ICFI">
        <div class="bot-header">
          <div class="bot-avatar" aria-hidden="true">🤖</div>
          <div class="bot-info">
            <span class="bot-nombre">ICFI</span>
            <span class="bot-estado">En línea</span>
          </div>
          <button class="bot-cerrar" id="bot-cerrar" aria-label="Cerrar chat">✕</button>
        </div>

        <div class="bot-mensajes" id="bot-mensajes" aria-live="polite" aria-label="Historial de mensajes">
          <div class="bot-mensaje bot-mensaje--bot">
            <span>¡Hola! 👋 Soy <b>ICFI</b>, tu asistente para el Saber 11°.<br>
            Puedes preguntarme sobre materias, el simulacro, tu progreso o pedir <b>"flashcard"</b> para practicar inglés.</span>
          </div>
        </div>

        <div class="bot-chips" id="bot-chips-container"></div>

        <div class="bot-input-area">
          <input
            type="text"
            id="bot-input"
            class="bot-input"
            placeholder="Escribe tu pregunta..."
            aria-label="Escribe tu mensaje"
            maxlength="200"
          />
          <button class="bot-enviar" id="bot-enviar" aria-label="Enviar mensaje">➤</button>
        </div>
      </div>

      <!-- BOTÓN TOGGLE -->
      <button class="bot-toggle" id="bot-toggle" aria-label="Abrir asistente ICFI" title="Hablar con ICFI">
        <span class="bot-toggle__icon">🤖</span>
        <span class="bot-toggle__badge" id="bot-badge" aria-label="Nuevo mensaje"></span>
      </button>

    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', botHTML);

  // ── Referencias DOM ────────────────────────────────────────────────────
  const toggle   = document.getElementById('bot-toggle');
  const bubble   = document.getElementById('bot-bubble');
  const cerrar   = document.getElementById('bot-cerrar');
  const input    = document.getElementById('bot-input');
  const enviar   = document.getElementById('bot-enviar');
  const mensajes = document.getElementById('bot-mensajes');
  const badge    = document.getElementById('bot-badge');

  // ── Inyectar estilos de chips y botones de acción (todo en bot.js) ─────
  _inyectarEstilosBot();

  // ── Chips de sugerencias rápidas ──────────────────────────────────────
  const SUGERENCIAS = ['¿Cómo empezar?', 'Mi progreso', 'Practicar inglés', 'Tip del día'];
  const chipsContainer = document.getElementById('bot-chips-container');
  chipsContainer.innerHTML = SUGERENCIAS
    .map((s) => `<button class="bot-chip" data-texto="${s}">${s}</button>`)
    .join('');

  chipsContainer.addEventListener('click', (e) => {
    const chip = e.target.closest('.bot-chip');
    if (!chip) return;
    input.value = chip.dataset.texto;
    procesarEnvio();
  });

  // ── Abrir / cerrar ─────────────────────────────────────────────────────
  toggle.addEventListener('click', () => {
    const estaAbierto = bubble.classList.toggle('bot-bubble--activo');
    toggle.setAttribute('aria-expanded', String(estaAbierto));
    badge.textContent = '';
    if (estaAbierto) setTimeout(() => input.focus(), 300);
  });

  cerrar.addEventListener('click', () => {
    bubble.classList.remove('bot-bubble--activo');
    toggle.setAttribute('aria-expanded', 'false');
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && bubble.classList.contains('bot-bubble--activo')) {
      bubble.classList.remove('bot-bubble--activo');
      toggle.focus();
    }
  });

  // ── Procesamiento de envío ────────────────────────────────────────────
  function procesarEnvio() {
    const textoUsuario = input.value.trim();
    if (!textoUsuario) return;

    _agregarMensajeUsuario(textoUsuario, mensajes);
    input.value = '';

    // FEATURE 1: leer la vista activa en el momento del envío
    const vista = typeof getVistaActual === 'function' ? getVistaActual() : null;

    // Simular delay de "está escribiendo…"
    const delay = 400 + Math.random() * 600;
    setTimeout(() => {
      const respuesta = obtenerRespuesta(textoUsuario, vista);

      // FEATURE 3: si la respuesta incluye accion → inyectar botón CTA
      _agregarMensajeBot(respuesta, mensajes, badge, bubble);
    }, delay);
  }

  enviar.addEventListener('click', procesarEnvio);

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      procesarEnvio();
    }
  });
}

// ─────────────────────────────────────────────────
// § 8. HELPERS DE RENDERIZADO DEL CHAT
// ─────────────────────────────────────────────────

/**
 * Agrega el mensaje del usuario al chat (texto plano, sanitizado).
 *
 * @param {string} texto
 * @param {HTMLElement} contenedor
 */
function _agregarMensajeUsuario(texto, contenedor) {
  const div  = document.createElement('div');
  div.className = 'bot-mensaje bot-mensaje--usuario';
  const span = document.createElement('span');
  span.textContent = texto; // textContent evita XSS
  div.appendChild(span);
  contenedor.appendChild(div);
  contenedor.scrollTop = contenedor.scrollHeight;
}

/**
 * FEATURE 3 — Agrega el mensaje del bot al chat.
 * Si la respuesta incluye `accion`, inyecta un botón CTA que al ser
 * pulsado emite un CustomEvent 'icfes:bot-accion' con el detail { accion }.
 * main.js (u otro módulo) debe escuchar este evento para actuar.
 *
 * @param {{ texto: string, accion?: string, labelAccion?: string }} respuesta
 * @param {HTMLElement} contenedor
 * @param {HTMLElement} badge
 * @param {HTMLElement} bubble
 */
function _agregarMensajeBot(respuesta, contenedor, badge, bubble) {
  const div  = document.createElement('div');
  div.className = 'bot-mensaje bot-mensaje--bot';

  // Texto/HTML principal (respuestas predefinidas, se considera seguro)
  const span = document.createElement('span');
  span.innerHTML = respuesta.texto;
  div.appendChild(span);

  // ── Botón de acción (CTA) ──────────────────────────────────────────────
  if (respuesta.accion) {
    const btn = document.createElement('button');
    btn.className    = 'bot-accion-btn';
    btn.textContent  = respuesta.labelAccion || '▶ Ir';
    btn.dataset.accion = respuesta.accion;

    btn.addEventListener('click', () => {
      // Emitir evento global para que main.js lo intercepte
      document.dispatchEvent(
        new CustomEvent('icfes:bot-accion', { detail: { accion: respuesta.accion } })
      );
      // Feedback visual: deshabilitar el botón tras el clic
      btn.disabled    = true;
      btn.textContent = '✅ Listo';
    });

    div.appendChild(btn);
  }

  contenedor.appendChild(div);
  contenedor.scrollTop = contenedor.scrollHeight;

  // Badge de notificación cuando el chat está cerrado
  if (!bubble.classList.contains('bot-bubble--activo')) {
    badge.textContent = '!';
  }
}

/**
 * Inyecta los estilos CSS del bot (chips + botón de acción CTA)
 * directamente desde bot.js para mantener el módulo autocontenido.
 */
function _inyectarEstilosBot() {
  if (document.getElementById('bot-estilos-dinamicos')) return; // idempotente

  const style = document.createElement('style');
  style.id = 'bot-estilos-dinamicos';
  style.textContent = `
    /* ── Chips de sugerencias rápidas ── */
    .bot-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      padding: 8px 12px;
      border-top: 1px solid var(--border);
      background: var(--bg-surface);
    }
    .bot-chip {
      background: var(--bg-card);
      color: var(--text-secondary);
      font-family: var(--font-body);
      font-size: 0.72rem;
      font-weight: 500;
      padding: 4px 10px;
      border: 1px solid var(--border);
      border-radius: 99px;
      cursor: pointer;
      transition: all 0.15s ease;
      white-space: nowrap;
    }
    .bot-chip:hover {
      background: var(--accent-glow);
      color: var(--accent);
      border-color: var(--border-accent);
    }

    /* ── Botón de acción CTA dentro de burbuja del bot (Feature 3) ── */
    .bot-accion-btn {
      display: inline-block;
      margin-top: 10px;
      padding: 7px 16px;
      background: var(--accent);
      color: #fff;
      font-family: var(--font-body);
      font-size: 0.78rem;
      font-weight: 600;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: opacity 0.2s ease, transform 0.1s ease;
    }
    .bot-accion-btn:hover:not(:disabled) {
      opacity: 0.88;
      transform: translateY(-1px);
    }
    .bot-accion-btn:disabled {
      opacity: 0.55;
      cursor: default;
    }
  `;
  document.head.appendChild(style);
}
