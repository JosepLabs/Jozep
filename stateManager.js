// =====================================================
// stateManager.js — Gestor de Estado y Lógica de Negocio
// v3: + generarDiagnostico() · generarSimulacroCompleto()
//     Persistencia localStorage · Historial de simulacros
//     Nivel de dificultad · Modo diagnóstico
// =====================================================

// ── NUEVO: Importa el banco de preguntas y las áreas para los
//    algoritmos de selección que viven en este módulo.
import { PREGUNTAS, AREAS_ICFES } from './data.js';

// ===== CLAVES DE ALMACENAMIENTO =====
const STORAGE_KEY          = 'icfes_state_v2';
const HISTORIAL_KEY        = 'icfes_historial_v2';
const NIVEL_KEY            = 'icfes_nivel_v2';
// ── NUEVO: nivel numérico (1|2|3) obtenido tras el diagnóstico
const NIVEL_DIAGNOSTICO_KEY = 'icfes_nivel_diagnostico_v3';
// ── NUEVO: nivel de entrenamiento por área (mapa materia→nivel string)
const NIVEL_AREA_KEY        = 'icfes_nivel_area_v1';
// ── NUEVO: registro acumulativo de IDs de preguntas ya respondidas (Fresh-First)
const TRAZABILIDAD_KEY      = 'icfes_trazabilidad_v1';

// ===== CONSTANTES DE ALGORITMOS =====
/** Número de preguntas por área en el diagnóstico */
const DIAGNOSTICO_POR_AREA  = 6;  // 2 × nivel 1 + 2 × nivel 2 + 2 × nivel 3
const DIAGNOSTICO_POR_NIVEL = 2;

/** Número de preguntas por área en el simulacro completo */
const SIMULACRO_POR_AREA    = 12;

/** Número de preguntas por área en la rutina diaria */
const RUTINA_POR_AREA       = 3;

/**
 * Tamaño total del banco por materia.
 * Se usa para calcular el estado de agotamiento en getEstadoTrazabilidad().
 * Prefijos de ID: MAT | LC | ING | CN | SOC
 */
const BANCO_TOTAL_POR_MATERIA = {
  MAT: 75,
  LC:  75,
  ING: 50,
  CN:  50,
  SOC: 71,
};

// ===== ESTADO INTERNO =====
const DEFAULT_STATE = {
  modo: null,                 // 'estudio' | 'simulacro' | 'rutina' | 'diagnostico'
  materiaSeleccionada: null,
  preguntas: [],
  indicePreguntaActual: 0,
  respuestasUsuario: {},
  tiempoRestante: 0,
  timerInterval: null,        // NO se persiste (no serializable)
  sesionTerminada: false,
  resultados: null,
  esDiagnostico: false,
};

let _state = { ...DEFAULT_STATE };

// =====================================================
// HELPERS PRIVADOS DE ALEATORIZACIÓN
// =====================================================

/**
 * Mezcla un array usando Fisher-Yates y retorna una COPIA nueva.
 * (Versión interna de stateManager; no exportada para no colisionar
 *  con la versión de progressManager.)
 *
 * @param {Array} arr
 * @returns {Array}
 */
function _shuffleArr(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Toma `n` elementos aleatorios de `pool` sin repetición.
 * Si `pool` tiene menos de `n` elementos devuelve todos los disponibles
 * y emite un warning para facilitar el debug durante el desarrollo.
 *
 * @param {Array}  pool  — Preguntas candidatas ya filtradas
 * @param {number} n     — Cuántas se necesitan
 * @param {string} label — Contexto para el warning
 * @returns {Array}
 */
function _tomarAleatorio(pool, n, label = '') {
  if (pool.length < n) {
    console.warn(
      `[ICFESPrep] _tomarAleatorio: se necesitan ${n} pero solo hay ${pool.length}` +
      (label ? ` en "${label}"` : '') +
      '. Aumenta el banco de preguntas para esta combinación.'
    );
  }
  return _shuffleArr(pool).slice(0, n);
}

// =====================================================
// TRAZABILIDAD — Fresh-First Selection
// =====================================================

/**
 * Lee el conjunto de IDs de preguntas ya respondidas desde localStorage.
 * Retorna un Set vacío si no hay datos o si ocurre un error.
 *
 * @private
 * @returns {Set<string>}
 */
function _getTrazabilidad() {
  try {
    const raw = localStorage.getItem(TRAZABILIDAD_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch (_) {
    return new Set();
  }
}

/**
 * Añade los IDs de las preguntas de una sesión completada al registro
 * de trazabilidad persistente.
 *
 * @private
 * @param {Array<Object>} preguntas — Lista de objetos pregunta con propiedad `id`
 */
function _actualizarTrazabilidad(preguntas) {
  try {
    const trazabilidad = _getTrazabilidad();
    preguntas.forEach((p) => {
      if (p && p.id) trazabilidad.add(p.id);
    });
    localStorage.setItem(TRAZABILIDAD_KEY, JSON.stringify([...trazabilidad]));
  } catch (_) { /* quota exceeded o modo privado → silenciar */ }
}

/**
 * Algoritmo de selección "Fresh-First".
 *
 * Divide el pool en dos particiones:
 *   1. «nuevas»   — preguntas cuyo ID NO está en la trazabilidad
 *   2. «ya vistas» — preguntas cuyo ID SÍ está en la trazabilidad
 *
 * Llena el cupo `n` priorizando las nuevas. Solo usa ya-vistas cuando
 * las nuevas se agotan (lógica de Reciclaje / Fallback).
 *
 * @param {Array}  pool  — Preguntas candidatas ya filtradas (materia, nivel…)
 * @param {number} n     — Cuántas se necesitan
 * @param {string} label — Contexto para los warnings de debug
 * @returns {Array}
 */
function _tomarFreshFirst(pool, n, label = '') {
  const trazabilidad = _getTrazabilidad();

  const nuevas   = pool.filter((p) => !trazabilidad.has(p.id));
  const yaVistas = pool.filter((p) =>  trazabilidad.has(p.id));

  // Mezcla ambas particiones de forma independiente
  const shuffledNuevas   = _shuffleArr(nuevas);
  const shuffledYaVistas = _shuffleArr(yaVistas);

  // Prioriza nuevas; completa con ya-vistas si el banco de nuevas se agotó
  const resultado = [...shuffledNuevas, ...shuffledYaVistas].slice(0, n);

  if (resultado.length < n) {
    console.warn(
      `[ICFESPrep] _tomarFreshFirst: se necesitan ${n} pero solo hay ${resultado.length}` +
      (label ? ` en "${label}"` : '') +
      '. Aumenta el banco de preguntas para esta combinación.'
    );
  }

  // Log informativo cuando se reciclan preguntas ya vistas
  if (nuevas.length < n && yaVistas.length > 0) {
    const recicladas = Math.min(n - nuevas.length, yaVistas.length);
    console.info(
      `[ICFESPrep] Fresh-First${label ? ` (${label})` : ''}: ` +
      `${nuevas.length} nuevas + ${recicladas} recicladas de ${yaVistas.length} ya vistas.`
    );
  }

  return resultado;
}

// =====================================================
// PERSISTENCIA EN LOCALSTORAGE
// =====================================================

/**
 * Serializa el estado en localStorage tras cada mutación.
 * `timerInterval` se excluye por no ser serializable.
 */
function _persistirEstado() {
  try {
    const { timerInterval, ...stateToPersist } = _state;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToPersist));
  } catch (_) { /* quota exceeded o modo privado → silenciar */ }
}

/**
 * Intenta restaurar una sesión de simulacro activa desde localStorage.
 * Solo restaura si hay un simulacro incompleto guardado.
 * @returns {boolean} true si se restauró una sesión.
 */
export function cargarEstadoPersistido() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const saved = JSON.parse(raw);

    const restaurable = (
      (saved.modo === 'simulacro' || saved.modo === 'rutina') &&
      !saved.sesionTerminada &&
      Array.isArray(saved.preguntas) &&
      saved.preguntas.length > 0
    );

    if (restaurable) {
      _state = { ...saved, timerInterval: null };
      return true;
    }
    return false;
  } catch (_) {
    return false;
  }
}

/** Elimina el estado de sesión de localStorage. */
export function limpiarEstadoPersistido() {
  localStorage.removeItem(STORAGE_KEY);
}

// =====================================================
// HISTORIAL DE SIMULACROS
// =====================================================

/**
 * Añade el resultado de un simulacro al historial (máx. 20 entradas).
 * Solo guarda simulacros y rutinas, no estudios ni diagnósticos.
 * @param {Object} resultado
 */
export function guardarResultadoEnHistorial(resultado) {
  try {
    if (resultado.modo === 'estudio' || resultado.esDiagnostico) return;
    const historial = getHistorial();
    historial.push({
      fecha:          new Date().toISOString(),
      modo:           resultado.modo,
      puntajeSobre100: resultado.puntajeSobre100,
      totalCorrectas:  resultado.totalCorrectas,
      totalPreguntas:  resultado.totalPreguntas,
      porMateria:      resultado.porMateria,
      detalles:        resultado.detalles,   // esencial para el algoritmo de rutina
    });
    localStorage.setItem(HISTORIAL_KEY, JSON.stringify(historial.slice(-20)));
  } catch (_) {}
}

/**
 * Retorna el historial completo de simulacros guardados.
 * @returns {Array}
 */
export function getHistorial() {
  try {
    return JSON.parse(localStorage.getItem(HISTORIAL_KEY) || '[]');
  } catch (_) { return []; }
}

/** Borra completamente el historial. */
export function limpiarHistorial() {
  localStorage.removeItem(HISTORIAL_KEY);
}

// =====================================================
// NIVEL DE DIFICULTAD (string para el selector de UI)
// =====================================================

/**
 * Retorna el nivel de dificultad guardado.
 * @returns {'basico'|'intermedio'|'avanzado'|'automatico'}
 */
export function getNivelDificultad() {
  return localStorage.getItem(NIVEL_KEY) || 'automatico';
}

/**
 * Guarda el nivel de dificultad.
 * @param {'basico'|'intermedio'|'avanzado'|'automatico'} nivel
 */
export function setNivelDificultad(nivel) {
  localStorage.setItem(NIVEL_KEY, nivel);
}

// =====================================================
// NIVEL DIAGNÓSTICO (numérico 1|2|3, calculado tras el examen)
// =====================================================

/**
 * Retorna el nivel numérico obtenido tras el diagnóstico.
 * Devuelve 0 si el estudiante aún no ha realizado el diagnóstico.
 *
 * @returns {0|1|2|3}
 */
export function getNivelDiagnostico() {
  const stored = localStorage.getItem(NIVEL_DIAGNOSTICO_KEY);
  return stored ? parseInt(stored, 10) : 0;
}

/**
 * Persiste el nivel diagnóstico numérico.
 * Llamar desde ui.js / main.js tras procesar los resultados del diagnóstico.
 *
 * @param {1|2|3} nivel
 */
export function setNivelDiagnostico(nivel) {
  if (![1, 2, 3].includes(nivel)) {
    console.warn(`[ICFESPrep] setNivelDiagnostico: valor inválido "${nivel}". Debe ser 1, 2 o 3.`);
    return;
  }
  localStorage.setItem(NIVEL_DIAGNOSTICO_KEY, String(nivel));
}

/**
 * Limpia el nivel diagnóstico (útil al reiniciar la aplicación).
 */
export function limpiarNivelDiagnostico() {
  localStorage.removeItem(NIVEL_DIAGNOSTICO_KEY);
}

// =====================================================
// NIVEL DE ENTRENAMIENTO POR ÁREA (persistido individualmente)
// =====================================================

/**
 * Retorna el nivel de entrenamiento guardado para una materia específica.
 * Si no hay uno guardado, devuelve el nivel global.
 *
 * @param {string} materia
 * @returns {'basico'|'intermedio'|'avanzado'}
 */
export function getNivelArea(materia) {
  try {
    const mapa = JSON.parse(localStorage.getItem(NIVEL_AREA_KEY) || '{}');
    if (mapa[materia]) return mapa[materia];
    // Fallback al nivel global (excluyendo 'automatico')
    const global = getNivelDificultad();
    return (global === 'automatico') ? 'intermedio' : global;
  } catch (_) {
    return 'intermedio';
  }
}

/**
 * Persiste el nivel de entrenamiento para una materia específica.
 *
 * @param {string} materia
 * @param {'basico'|'intermedio'|'avanzado'} nivel
 */
export function setNivelArea(materia, nivel) {
  try {
    const mapa = JSON.parse(localStorage.getItem(NIVEL_AREA_KEY) || '{}');
    mapa[materia] = nivel;
    localStorage.setItem(NIVEL_AREA_KEY, JSON.stringify(mapa));
  } catch (_) {}
}

// =====================================================
// ── NUEVO ─────────────────────────────────────────
// ALGORITMO 4: ENTRENAMIENTO FOCALIZADO POR ÁREA
// =====================================================

/**
 * Genera un Entrenamiento Focalizado con hasta 12 preguntas de
 * UNA sola materia, priorizando el nivel indicado.
 *
 * Fallback progresivo:
 *   1. Preguntas de (materia × nivel estricto)
 *   2. Si hay menos de 12, completa con otros niveles de la misma materia
 *   3. Mezcla global para evitar patrones predecibles
 *
 * @param {string}                             materia   — Nombre de la materia
 * @param {'basico'|'intermedio'|'avanzado'}   nivelArea — Nivel de dificultad
 * @returns {Array<Object>}
 */
export function generarEntrenamientoFocalizado(materia, nivelArea) {
  const ENTRENAMIENTO_TARGET = 12;

  // Mapear nivel string → numérico
  const mapaNum = { basico: 1, intermedio: 2, avanzado: 3 };
  const nivelNum = mapaNum[nivelArea] || getNivelDiagnostico() || 2;

  // Pool estricto: materia + nivel
  const poolEstricto = PREGUNTAS.filter(
    (p) => p.materia === materia && p.dificultad === nivelNum
  );

  if (poolEstricto.length >= ENTRENAMIENTO_TARGET) {
    // ── Fresh-First sobre el pool estricto
    return _tomarFreshFirst(poolEstricto, ENTRENAMIENTO_TARGET, `${materia} nivel ${nivelNum}`);
  }

  // Fallback: completar con otros niveles de la misma materia
  const poolExtra = PREGUNTAS.filter(
    (p) => p.materia === materia && p.dificultad !== nivelNum
  );
  // Aplicar Fresh-First a cada partición por separado antes de combinar
  const desdeEstricto = _tomarFreshFirst(poolEstricto, poolEstricto.length, `${materia} nivel ${nivelNum}`);
  const faltan        = ENTRENAMIENTO_TARGET - desdeEstricto.length;
  const desdeExtra    = _tomarFreshFirst(poolExtra, faltan, `${materia} otros niveles`);
  const combinado     = [...desdeEstricto, ...desdeExtra];

  if (combinado.length === 0) {
    console.warn(`[ICFESPrep] generarEntrenamientoFocalizado: sin preguntas para "${materia}".`);
    return [];
  }

  return combinado.slice(0, ENTRENAMIENTO_TARGET);
}

// =====================================================
// ── NUEVO ─────────────────────────────────────────
// ALGORITMO 1: EXAMEN DIAGNÓSTICO
// =====================================================

/**
 * Genera el Examen Diagnóstico con exactamente 30 preguntas.
 *
 * Distribución:
 *   • 6 preguntas por cada una de las 5 áreas ICFES
 *   • Dentro de cada área: 2 de nivel 1 · 2 de nivel 2 · 2 de nivel 3
 *
 * Garantía de aleatoriedad:
 *   Cuando el banco alcance las 70 preguntas por área/nivel, la función
 *   siempre escogerá 2 al azar mediante Fisher-Yates antes de slicear.
 *
 * Manejo de banco incompleto (fase de desarrollo):
 *   Si para un par (área, nivel) hay menos de 2 preguntas, toma las
 *   disponibles y emite un console.warn para facilitar el tracking.
 *
 * @returns {Array<Object>} 30 preguntas mezcladas globalmente
 */
export function generarDiagnostico() {
  /** @type {Array<Object>} */
  const seleccion = [];

  for (const area of AREAS_ICFES) {
    for (const nivel of [1, 2, 3]) {
      const pool = PREGUNTAS.filter(
        (p) => p.materia === area && p.dificultad === nivel
      );

      // ── Fresh-First: prioriza preguntas no vistas en sesiones anteriores
      const tomadas = _tomarFreshFirst(pool, DIAGNOSTICO_POR_NIVEL, `${area} nivel ${nivel}`);
      seleccion.push(...tomadas);
    }
  }

  // Mezcla global para evitar agrupación por área en la UI
  return _shuffleArr(seleccion);
}

// =====================================================
// ── NUEVO ─────────────────────────────────────────
// ALGORITMO 3: SIMULACRO COMPLETO
// =====================================================

/**
 * Genera un Simulacro Completo con exactamente 60 preguntas.
 *
 * Distribución:
 *   • 12 preguntas por cada una de las 5 áreas ICFES
 *   • Todas coinciden ESTRICTAMENTE con el nivelUsuario (1, 2 o 3)
 *
 * @param {1|2|3} nivelUsuario — Nivel numérico del estudiante.
 *   Si se omite o es 0, se intenta recuperar el nivel diagnóstico
 *   almacenado en localStorage; si tampoco existe, se usa nivel 2
 *   (Intermedio) como fallback razonable.
 *
 * @returns {Array<Object>} 60 preguntas mezcladas globalmente
 */
export function generarSimulacroCompleto(nivelUsuario) {
  // Resolver nivel con fallback progresivo
  const nivel = (nivelUsuario && [1, 2, 3].includes(nivelUsuario))
    ? nivelUsuario
    : (getNivelDiagnostico() || 2);

  /** @type {Array<Object>} */
  const seleccion = [];

  for (const area of AREAS_ICFES) {
    const pool = PREGUNTAS.filter(
      (p) => p.materia === area && p.dificultad === nivel
    );

    // ── Fresh-First: prioriza preguntas no vistas en sesiones anteriores
    const tomadas = _tomarFreshFirst(pool, SIMULACRO_POR_AREA, `${area} nivel ${nivel}`);
    seleccion.push(...tomadas);
  }

  return _shuffleArr(seleccion);
}

// =====================================================
// GETTERS
// =====================================================

/** Retorna copia del estado (inmutable desde afuera). */
export function getState() {
  return { ..._state };
}

/** Retorna la pregunta actualmente activa. */
export function getPreguntaActual() {
  return _state.preguntas[_state.indicePreguntaActual] || null;
}

/** true si el índice actual es la última pregunta. */
export function esUltimaPregunta() {
  return _state.indicePreguntaActual >= _state.preguntas.length - 1;
}

/** Retorna el tiempo restante en segundos. */
export function getTiempoRestante() {
  return _state.tiempoRestante;
}

/** Retorna la referencia al interval del timer. */
export function getTimerInterval() {
  return _state.timerInterval;
}

/** true si la sesión activa es un diagnóstico de nivel. */
export function esModoDiagnostico() {
  return _state.esDiagnostico === true;
}

// =====================================================
// MUTADORES
// =====================================================

/**
 * Inicializa una nueva sesión.
 * @param {'estudio'|'simulacro'|'rutina'|'diagnostico'} modo
 * @param {Array}       preguntas
 * @param {string|null} materiaSeleccionada
 * @param {boolean}     esDiagnostico
 */
export function iniciarSesion(modo, preguntas, materiaSeleccionada = null, esDiagnostico = false) {
  if (_state.timerInterval) clearInterval(_state.timerInterval);

  const SEGUNDOS_POR_PREGUNTA = 90;
  const SIMULACRO_SEGUNDOS    = 7200; // 2 horas fijas para el simulacro
  const conTimer = (modo === 'simulacro' || modo === 'rutina');

  _state = {
    modo,
    materiaSeleccionada,
    preguntas: [...preguntas],
    indicePreguntaActual: 0,
    respuestasUsuario: {},
    tiempoRestante: conTimer
      ? (modo === 'simulacro' ? SIMULACRO_SEGUNDOS : preguntas.length * SEGUNDOS_POR_PREGUNTA)
      : 0,
    timerInterval: null,
    sesionTerminada: false,
    resultados: null,
    esDiagnostico,
  };

  _persistirEstado();
}

/**
 * Registra la opción elegida para una pregunta.
 * @param {string}      preguntaId
 * @param {string|null} opcion
 */
export function registrarRespuesta(preguntaId, opcion) {
  _state.respuestasUsuario[preguntaId] = opcion;
  _persistirEstado();
}

/**
 * Avanza al siguiente índice de pregunta.
 * @returns {boolean}
 */
export function avanzarPregunta() {
  if (_state.indicePreguntaActual < _state.preguntas.length - 1) {
    _state.indicePreguntaActual++;
    _persistirEstado();
    return true;
  }
  return false;
}

/**
 * Guarda la referencia al interval del timer.
 * @param {number} interval
 */
export function setTimerInterval(interval) {
  _state.timerInterval = interval;
  _persistirEstado();
}

/**
 * Decrementa el tiempo restante 1 segundo.
 * @returns {number}
 */
export function decrementarTiempo() {
  if (_state.tiempoRestante > 0) _state.tiempoRestante--;
  _persistirEstado();
  return _state.tiempoRestante;
}

// =====================================================
// CÁLCULO DE RESULTADOS
// =====================================================

/**
 * Calcula y retorna el informe completo de resultados.
 * @returns {Object}
 */
export function calcularResultados() {
  const { preguntas, respuestasUsuario, modo, esDiagnostico } = _state;

  let totalCorrectas = 0;
  const porMateria     = {};
  const porCompetencia = {};
  const detalles       = [];

  preguntas.forEach((pregunta) => {
    const respuestaUsuario = respuestasUsuario[pregunta.id] || null;
    const esCorrecta = respuestaUsuario !== null && respuestaUsuario === pregunta.respuesta;
    if (esCorrecta) totalCorrectas++;

    if (!porMateria[pregunta.materia])
      porMateria[pregunta.materia] = { correctas: 0, total: 0 };
    porMateria[pregunta.materia].total++;
    if (esCorrecta) porMateria[pregunta.materia].correctas++;

    if (!porCompetencia[pregunta.competencia])
      porCompetencia[pregunta.competencia] = { correctas: 0, total: 0, materia: pregunta.materia };
    porCompetencia[pregunta.competencia].total++;
    if (esCorrecta) porCompetencia[pregunta.competencia].correctas++;

    detalles.push({ pregunta, respuestaUsuario, esCorrecta });
  });

  const puntajeSobre100 = preguntas.length > 0
    ? Math.round((totalCorrectas / preguntas.length) * 100)
    : 0;

  const competenciasConFallas = Object.entries(porCompetencia)
    .filter(([, d]) => d.correctas < d.total)
    .map(([competencia, d]) => ({
      competencia, materia: d.materia,
      correctas: d.correctas, total: d.total,
      porcentaje: Math.round((d.correctas / d.total) * 100),
    }))
    .sort((a, b) => a.porcentaje - b.porcentaje);

  const competenciasPerfectas = Object.entries(porCompetencia)
    .filter(([, d]) => d.correctas === d.total)
    .map(([competencia, d]) => ({ competencia, materia: d.materia, total: d.total }));

  let nivelDesempeno;
  if      (puntajeSobre100 >= 80) nivelDesempeno = { label: 'Excelente',       emoji: '🏆', color: 'verde'    };
  else if (puntajeSobre100 >= 60) nivelDesempeno = { label: 'Bueno',            emoji: '👍', color: 'verde'    };
  else if (puntajeSobre100 >= 40) nivelDesempeno = { label: 'Regular',          emoji: '⚡', color: 'amarillo' };
  else                            nivelDesempeno = { label: 'Necesita mejorar', emoji: '📚', color: 'rojo'     };

  _state.resultados = {
    modo, esDiagnostico,
    puntajeSobre100, totalCorrectas,
    totalPreguntas: preguntas.length,
    porMateria, porCompetencia,
    competenciasConFallas, competenciasPerfectas,
    nivelDesempeno, detalles,
  };
  _state.sesionTerminada = true;
  _persistirEstado();

  // ── Sincronización de trazabilidad: registra las preguntas respondidas
  //    para que Fresh-First las excluya en la próxima sesión.
  //    Se aplica a Simulacros (completos y rutina) y Diagnósticos.
  if (modo === 'simulacro' || modo === 'rutina' || esDiagnostico) {
    _actualizarTrazabilidad(preguntas);
  }

  return _state.resultados;
}

/** Retorna los resultados ya calculados (si existen). */
export function getResultados() {
  return _state.resultados;
}

/** Resetea el estado y limpia localStorage. */
export function resetearEstado() {
  if (_state.timerInterval) clearInterval(_state.timerInterval);
  limpiarEstadoPersistido();
  _state = { ...DEFAULT_STATE };
}

// =====================================================
// TRAZABILIDAD — API PÚBLICA
// =====================================================

/**
 * Elimina por completo el registro de trazabilidad.
 * Útil para reiniciar el "ciclo de preguntas" desde cero
 * (p.ej. un botón "Reiniciar progreso" en ajustes).
 */
export function limpiarTrazabilidad() {
  localStorage.removeItem(TRAZABILIDAD_KEY);
}

/**
 * Retorna estadísticas de progreso de trazabilidad por materia,
 * útiles para mostrar al usuario cuántas preguntas nuevas le quedan.
 *
 * Ejemplo de retorno:
 * ```json
 * {
 *   "MAT": { "vistas": 24, "total": 75, "nuevas": 51, "agotada": false },
 *   "LC":  { "vistas": 75, "total": 75, "nuevas": 0,  "agotada": true  },
 *   ...
 * }
 * ```
 *
 * @returns {Object.<string, {vistas: number, total: number, nuevas: number, agotada: boolean}>}
 */
export function getEstadoTrazabilidad() {
  const trazabilidad = _getTrazabilidad();
  const stats = {};

  for (const [prefijo, total] of Object.entries(BANCO_TOTAL_POR_MATERIA)) {
    // Cuenta los IDs que pertenecen a esta materia por su prefijo (ej. "MAT-")
    const vistas = [...trazabilidad].filter((id) => id.startsWith(`${prefijo}-`)).length;
    stats[prefijo] = {
      vistas,
      total,
      nuevas:  Math.max(0, total - vistas),
      agotada: vistas >= total,
    };
  }

  return stats;
}

/**
 * Retorna cuántas preguntas nuevas (no vistas) hay disponibles
 * para una materia y nivel específicos.
 * Útil para advertir al usuario antes de iniciar un simulacro.
 *
 * @param {string} materia  — Nombre de la materia (igual que `p.materia` en data.js)
 * @param {1|2|3}  nivel    — Nivel de dificultad numérico
 * @returns {{ nuevas: number, yaVistas: number, total: number }}
 */
export function getNuevasPorMateriaYNivel(materia, nivel) {
  const trazabilidad = _getTrazabilidad();
  const pool = PREGUNTAS.filter(
    (p) => p.materia === materia && p.dificultad === nivel
  );
  const nuevas   = pool.filter((p) => !trazabilidad.has(p.id)).length;
  const yaVistas = pool.filter((p) =>  trazabilidad.has(p.id)).length;
  return { nuevas, yaVistas, total: pool.length };
}
