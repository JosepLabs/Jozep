// =====================================================
// progressManager.js — Módulo de Progreso y Rutina Diaria
// v3: + generarRutinaDiaria(nivelUsuario) — distribución
//     estricta por área y nivel diagnóstico numérico.
//     Analiza el historial de simulacros guardados en
//     localStorage para generar una rutina personalizada
//     con foco en las áreas más débiles del estudiante.
// =====================================================

import { getHistorial }          from './stateManager.js';
import { PREGUNTAS, MATERIA_ICONOS, AREAS_ICFES, SUBMATERIA_ICONOS } from './data.js';

// ───── Claves localStorage ─────────────────────────
const RUTINA_FECHA_KEY = 'icfes_rutina_fecha_v2';

// ───── Constantes de algoritmos ────────────────────
const RUTINA_TARGET      = 12;    // Rutina legada (generarRutinaDelDia)
const RUTINA_PCT_DEBIL   = 0.70;

/** Preguntas por área en la nueva rutina diaria */
const RUTINA_V3_POR_AREA = 3;     // 3 áreas × 5 = 15 preguntas totales

// =====================================================
// DASHBOARD DE PROGRESO
// =====================================================

/**
 * Analiza el historial de simulacros y construye los datos
 * para el Dashboard del Estudiante.
 *
 * Retorna un objeto con:
 *   - totalSimulacros {number}
 *   - materias {Array}  — desempeño por materia/subMateria
 *   - ultimoSimulacro {Object|null}
 *   - tendencia {string} — 'mejorando' | 'estable' | 'decayendo' | 'sin_datos'
 *   - promedioGlobal {number|null}
 *
 * @returns {Object}
 */
export function obtenerDashboardData() {
  const historial = getHistorial();

  if (historial.length === 0) {
    return {
      totalSimulacros: 0,
      materias: [],
      ultimoSimulacro: null,
      tendencia: 'sin_datos',
      promedioGlobal: null,
    };
  }

  // ── Acumular correctas/totales por materia (y subMateria para Ciencias) ──
  const acum = {};

  historial.forEach((sim) => {
    if (!Array.isArray(sim.detalles)) return;

    sim.detalles.forEach((d) => {
      const materia    = d.pregunta?.materia    || 'Desconocida';
      const subMateria = d.pregunta?.subMateria || null;

      const clave = subMateria
        ? `${materia}::${subMateria}`
        : materia;

      if (!acum[clave]) {
        acum[clave] = {
          label:     subMateria ? `${subMateria}` : materia,
          labelFull: subMateria ? `${materia} — ${subMateria}` : materia,
          materia,
          subMateria,
          icono:     MATERIA_ICONOS[materia] || '📚',
          correctas: 0,
          total:     0,
        };
      }

      acum[clave].total++;
      if (d.esCorrecta) acum[clave].correctas++;
    });
  });

  const materias = Object.entries(acum)
    .map(([clave, data]) => ({
      clave,
      ...data,
      porcentaje: data.total > 0
        ? Math.round((data.correctas / data.total) * 100)
        : null,
    }))
    .sort((a, b) => {
      if (a.materia !== b.materia) return a.materia.localeCompare(b.materia);
      return (a.subMateria || '').localeCompare(b.subMateria || '');
    });

  // ── Tendencia: compara los últimos 3 puntajes ──
  const puntajes = historial.map((s) => s.puntajeSobre100).filter(Boolean);
  let tendencia = 'sin_datos';

  if (puntajes.length >= 3) {
    const ultimos = puntajes.slice(-3);
    const diff    = ultimos[2] - ultimos[0];
    if      (diff >  5) tendencia = 'mejorando';
    else if (diff < -5) tendencia = 'decayendo';
    else                tendencia = 'estable';
  } else if (puntajes.length > 0) {
    tendencia = 'estable';
  }

  // ── Promedio global de todos los simulacros ──
  const promedioGlobal = puntajes.length > 0
    ? Math.round(puntajes.reduce((a, b) => a + b, 0) / puntajes.length)
    : null;

  return {
    totalSimulacros: historial.length,
    materias,
    ultimoSimulacro: historial[historial.length - 1] || null,
    tendencia,
    promedioGlobal,
  };
}

// =====================================================
// ── NUEVO ─────────────────────────────────────────
// ALGORITMO 2: RUTINA DIARIA v3
// =====================================================

/**
 * Genera la Rutina Diaria con exactamente 15 preguntas.
 *
 * Distribución:
 *   • 3 preguntas por cada una de las 5 áreas ICFES
 *   • Todas coinciden ESTRICTAMENTE con el `nivelUsuario` (1, 2 o 3)
 *
 * Prioridad de selección:
 *   Dentro del pool de cada área, las preguntas con mayor número de
 *   fallos históricos (según el historial guardado en localStorage)
 *   se incluyen antes que las no falladas, para que la rutina refuerce
 *   los puntos débiles del estudiante.
 *
 * Fallback sin historial:
 *   Si no hay historial se hace una selección completamente aleatoria.
 *
 * @param {1|2|3} nivelUsuario — Nivel numérico del diagnóstico.
 *   Si se omite o es inválido, se usa nivel 2 (Intermedio).
 *
 * @returns {Array<Object>} 15 preguntas mezcladas globalmente
 */
export function generarRutinaDiaria(nivelUsuario) {
  // ── Validar / resolver nivel ──────────────────────
  const nivel = ([1, 2, 3].includes(nivelUsuario)) ? nivelUsuario : 2;

  // ── Construir mapa de fallos históricos por clave ─
  const historial = getHistorial();
  const fallosPorClave = _buildFallosMap(historial);

  /** @type {Array<Object>} */
  const seleccion = [];

  for (const area of AREAS_ICFES) {
    // Pool estricto: sólo preguntas de este nivel
    const pool = PREGUNTAS.filter(
      (p) => p.materia === area && p.dificultad === nivel
    );

    if (pool.length === 0) {
      console.warn(
        `[ICFESPrep] generarRutinaDiaria: sin preguntas para "${area}" nivel ${nivel}.`
      );
      continue;
    }

    // Etiquetar con score de fallos y separar en débiles vs. repaso
    const conScore  = pool.map((p) => ({ p, score: fallosPorClave[_clavePreg(p)] || 0 }));
    const debiles   = _mezclar(conScore.filter((x) => x.score > 0)).map((x) => x.p);
    const generales = _mezclar(conScore.filter((x) => x.score === 0)).map((x) => x.p);

    // Tomar primero los débiles, completar con generales
    const combinado = [...debiles, ...generales];
    const tomadas   = combinado.slice(0, RUTINA_V3_POR_AREA);

    if (tomadas.length < RUTINA_V3_POR_AREA) {
      console.warn(
        `[ICFESPrep] generarRutinaDiaria: solo ${tomadas.length}/${RUTINA_V3_POR_AREA} ` +
        `preguntas disponibles para "${area}" nivel ${nivel}.`
      );
    }

    seleccion.push(...tomadas);
  }

  // Mezcla global para evitar agrupación por área en la UI
  return _mezclar(seleccion);
}

// =====================================================
// GENERACIÓN DE RUTINA DIARIA (versión legada v2)
// ─────────────────────────────────────────────────
// Se conserva para compatibilidad hacia atrás con el
// flujo actual de main.js (iniciarRutinaDelDia).
// Migrar a generarRutinaDiaria() en la siguiente versión.
// =====================================================

/**
 * @deprecated Usar `generarRutinaDiaria(nivelUsuario)` en su lugar.
 *
 * Genera la Rutina Diaria de preguntas siguiendo el algoritmo:
 *   70% → preguntas de materias/competencias con más fallos históricos
 *   30% → repaso general (preguntas sin o con pocos fallos)
 *
 * @param {Array}  todasLasPreguntas — Array completo de PREGUNTAS
 * @param {string} nivelDificultad   — 'basico' | 'intermedio' | 'avanzado' | 'automatico'
 * @returns {Array}
 */
export function generarRutinaDelDia(todasLasPreguntas, nivelDificultad = 'automatico') {
  const preguntasFiltradas = _filtrarPorNivel(todasLasPreguntas, nivelDificultad);
  const historial = getHistorial();

  if (historial.length === 0) {
    return _seleccionEquilibrada(preguntasFiltradas, RUTINA_TARGET);
  }

  const pesoPorClave = {};
  historial.forEach((sim) => {
    if (!Array.isArray(sim.detalles)) return;
    sim.detalles.forEach((d) => {
      if (!d.esCorrecta) {
        const clave = _clavePreg(d.pregunta);
        pesoPorClave[clave] = (pesoPorClave[clave] || 0) + 1;
      }
    });
  });

  const conScore = preguntasFiltradas.map((p) => ({
    pregunta: p,
    score: pesoPorClave[_clavePreg(p)] || 0,
  }));

  const debiles   = _mezclar(conScore.filter((x) => x.score > 0)).map((x) => x.pregunta);
  const generales = _mezclar(conScore.filter((x) => x.score === 0)).map((x) => x.pregunta);

  const nDebiles   = Math.round(RUTINA_TARGET * RUTINA_PCT_DEBIL);
  const nGenerales = RUTINA_TARGET - nDebiles;

  let rutina = _mezclar([...debiles.slice(0, nDebiles), ...generales.slice(0, nGenerales)]);

  if (rutina.length < RUTINA_TARGET) {
    const idsUsados = new Set(rutina.map((p) => p.id));
    const extra     = _mezclar(preguntasFiltradas.filter((p) => !idsUsados.has(p.id)));
    rutina.push(...extra.slice(0, RUTINA_TARGET - rutina.length));
  }

  return rutina.slice(0, RUTINA_TARGET);
}

// =====================================================
// MARCADO DE RUTINA DIARIA
// =====================================================

/**
 * Verifica si el estudiante ya completó la rutina de hoy.
 * @returns {boolean}
 */
export function yaHizoRutinaHoy() {
  const hoy = new Date().toDateString();
  return localStorage.getItem(RUTINA_FECHA_KEY) === hoy;
}

/**
 * Marca la rutina como completada en el día actual.
 */
export function marcarRutinaCompletadaHoy() {
  localStorage.setItem(RUTINA_FECHA_KEY, new Date().toDateString());
}

// =====================================================
// ANÁLISIS DETALLADO POR ÁREA
// =====================================================

/**
 * Analiza el historial completo y extrae estadísticas detalladas
 * para una materia específica.
 *
 * Retorna un objeto con:
 *   - totalRespuestas {number}
 *   - correctas        {number}
 *   - incorrectas      {number}
 *   - porcentaje       {number|null}
 *   - items            {Array}  — desglose por subMateria (para Ciencias)
 *   - competenciasConFallas {Array}
 *   - ultimaVez        {string|null} — fecha ISO del último simulacro con esta materia
 *
 * @param {string} materia
 * @returns {Object}
 */
export function obtenerDatosArea(materia) {
  const historial = getHistorial();

  const empty = {
    totalRespuestas: 0,
    correctas: 0,
    incorrectas: 0,
    porcentaje: null,
    items: [],
    competenciasConFallas: [],
    ultimaVez: null,
  };

  if (historial.length === 0) return empty;

  const competenciaMap  = {};
  const subMateriaMap   = {};
  let totalCorrectas    = 0;
  let totalRespuestas   = 0;
  let ultimaVez         = null;

  historial.forEach((sim) => {
    if (!Array.isArray(sim.detalles)) return;
    let incluyeMateria = false;

    sim.detalles.forEach((d) => {
      if (d.pregunta?.materia !== materia) return;
      incluyeMateria = true;
      totalRespuestas++;
      if (d.esCorrecta) totalCorrectas++;

      // Acumular por subMateria
      const subKey = d.pregunta.subMateria || '__main__';
      if (!subMateriaMap[subKey]) {
        subMateriaMap[subKey] = {
          subMateria: d.pregunta.subMateria || null,
          correctas: 0,
          total: 0,
        };
      }
      subMateriaMap[subKey].total++;
      if (d.esCorrecta) subMateriaMap[subKey].correctas++;

      // Acumular por competencia
      const comp = d.pregunta.competencia || 'General';
      if (!competenciaMap[comp]) competenciaMap[comp] = { correctas: 0, total: 0 };
      competenciaMap[comp].total++;
      if (d.esCorrecta) competenciaMap[comp].correctas++;
    });

    if (incluyeMateria) {
      const fecha = new Date(sim.fecha);
      if (!ultimaVez || fecha > new Date(ultimaVez)) ultimaVez = sim.fecha;
    }
  });

  if (totalRespuestas === 0) return empty;

  // Items de subMaterias (solo relevante si hay más de una)
  const rawItems = Object.values(subMateriaMap);
  const items = rawItems.length > 1
    ? rawItems.map((data) => {
        const pct = data.total > 0 ? Math.round((data.correctas / data.total) * 100) : null;
        return {
          label:      data.subMateria || materia,
          subMateria: data.subMateria,
          icono:      data.subMateria ? (SUBMATERIA_ICONOS[data.subMateria] || '') : '',
          correctas:  data.correctas,
          total:      data.total,
          porcentaje: pct,
        };
      })
    : [];

  const competenciasConFallas = Object.entries(competenciaMap)
    .filter(([, d]) => d.correctas < d.total)
    .map(([competencia, d]) => ({
      competencia,
      correctas:  d.correctas,
      total:      d.total,
      porcentaje: Math.round((d.correctas / d.total) * 100),
    }))
    .sort((a, b) => a.porcentaje - b.porcentaje);

  return {
    totalRespuestas,
    correctas:   totalCorrectas,
    incorrectas: totalRespuestas - totalCorrectas,
    porcentaje:  Math.round((totalCorrectas / totalRespuestas) * 100),
    items,
    competenciasConFallas,
    ultimaVez,
  };
}

// =====================================================
// =====================================================

/**
 * Construye un mapa { clavePreg → nFallos } a partir del historial.
 * @param {Array} historial
 * @returns {Object}
 */
function _buildFallosMap(historial) {
  const mapa = {};
  historial.forEach((sim) => {
    if (!Array.isArray(sim.detalles)) return;
    sim.detalles.forEach((d) => {
      if (!d.esCorrecta) {
        const clave = _clavePreg(d.pregunta);
        mapa[clave] = (mapa[clave] || 0) + 1;
      }
    });
  });
  return mapa;
}

/**
 * Clave única por materia + subMateria + competencia para agrupar fallos.
 * @param {Object} pregunta
 * @returns {string}
 */
function _clavePreg(pregunta) {
  return `${pregunta?.materia || ''}|${pregunta?.subMateria || ''}|${pregunta?.competencia || ''}`;
}

/**
 * Mezcla un array con Fisher-Yates (retorna COPIA).
 * @param {Array} arr
 * @returns {Array}
 */
function _mezclar(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Filtra preguntas según el nivel de dificultad seleccionado (legado).
 * @param {Array}  preguntas
 * @param {string} nivel
 * @returns {Array}
 */
function _filtrarPorNivel(preguntas, nivel) {
  if (nivel === 'basico')     return preguntas.filter((p) => p.dificultad === 1);
  if (nivel === 'intermedio') return preguntas.filter((p) => p.dificultad <= 2);
  return preguntas;
}

/**
 * Selección aleatoria equilibrada cuando no hay historial (legado).
 * @param {Array}  preguntas
 * @param {number} target
 * @returns {Array}
 */
function _seleccionEquilibrada(preguntas, target) {
  const porMateria = {};
  preguntas.forEach((p) => {
    if (!porMateria[p.materia]) porMateria[p.materia] = [];
    porMateria[p.materia].push(p);
  });

  const materias       = Object.keys(porMateria);
  const porMateriaCount = Math.max(2, Math.ceil(target / materias.length));

  const seleccion = [];
  materias.forEach((m) => {
    seleccion.push(..._mezclar(porMateria[m]).slice(0, porMateriaCount));
  });

  const mezclada = _mezclar(seleccion);
  if (mezclada.length >= target) return mezclada.slice(0, target);

  const extra = _mezclar(preguntas.filter((p) => !mezclada.includes(p)));
  return [...mezclada, ...extra].slice(0, target);
}
