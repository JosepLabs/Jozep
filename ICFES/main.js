// =====================================================
// main.js — Controlador Principal de la Aplicación
// v4: Lógica completa para tipoPregunta 'relacionar':
//     - Estado por definición (selecciones como objeto)
//     - Feedback proporcional al finalizar cada fila
//     - Ajuste de puntaje en _finalizarSesion
// =====================================================

import { PREGUNTAS, MATERIAS } from './data.js';
import {
  iniciarSesion,
  getState,
  registrarRespuesta,
  avanzarPregunta,
  esUltimaPregunta,
  getPreguntaActual,
  calcularResultados,
  setTimerInterval,
  getTimerInterval,
  decrementarTiempo,
  getTiempoRestante,
  resetearEstado,
  cargarEstadoPersistido,
  guardarResultadoEnHistorial,
  getNivelDificultad,
  setNivelDificultad,
  esModoDiagnostico,
  getNivelArea,
  setNivelArea,
  generarEntrenamientoFocalizado,
  generarSimulacroCompleto,
  getNivelDiagnostico,
} from './stateManager.js';
import {
  renderMenuPrincipal,
  renderSeleccionMateria,
  renderPregunta,
  renderFeedback,
  renderFeedbackRelacionar,
  renderResultados,
  renderTimer,
  renderDashboardEstudiante,
  renderResultadoDiagnostico,
  renderDetalleArea,
} from './ui.js';
import {
  obtenerDashboardData,
  generarRutinaDelDia,
  yaHizoRutinaHoy,
  marcarRutinaCompletadaHoy,
  obtenerDatosArea,
} from './progressManager.js';
import { inicializarBot } from './bot.js';

// =====================================================
// REFERENCIAS AL DOM
// =====================================================
const appContainer = document.getElementById('app');
const timerDisplay = document.getElementById('timer-display');
const headerLogo   = document.getElementById('header-logo');

// =====================================================
// UTILIDADES DE RENDERIZADO
// =====================================================

function mostrarVista(html) {
  appContainer.innerHTML = html;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function detenerTimer() {
  const interval = getTimerInterval();
  if (interval) clearInterval(interval);
  if (timerDisplay) {
    timerDisplay.textContent = '';
    timerDisplay.className = 'timer-display';
  }
}

// =====================================================
// FEATURE 2: MODO CLARO / OSCURO
// =====================================================

const TEMA_KEY = 'icfes_tema_v1';

function _inicializarTema() {
  const guardado = localStorage.getItem(TEMA_KEY);
  const prefiereClaroSistema = window.matchMedia?.('(prefers-color-scheme: light)').matches;
  const temaInicial = guardado || (prefiereClaroSistema ? 'light' : 'dark');
  _aplicarTema(temaInicial, false);
}

function _toggleTema() {
  const esClaro = document.body.getAttribute('data-theme') === 'light';
  _aplicarTema(esClaro ? 'dark' : 'light');
}

function _aplicarTema(tema, persistir = true) {
  if (tema === 'light') {
    document.body.setAttribute('data-theme', 'light');
    const icon = document.getElementById('theme-icon');
    if (icon) icon.textContent = 'Oscuro';
  } else {
    document.body.removeAttribute('data-theme');
    const icon = document.getElementById('theme-icon');
    if (icon) icon.textContent = 'Claro';
  }
  if (persistir) localStorage.setItem(TEMA_KEY, tema);
}

// =====================================================
// FEATURE 3: SELECTOR DE DIFICULTAD
// =====================================================

function _filtrarPorNivelActual(preguntas) {
  const nivel = getNivelDificultad();
  if (nivel === 'basico')     return preguntas.filter((p) => p.dificultad === 1);
  if (nivel === 'intermedio') return preguntas.filter((p) => p.dificultad <= 2);
  return preguntas;
}

// =====================================================
// VISTA: MENÚ PRINCIPAL
// =====================================================

function irAMenu() {
  detenerTimer();
  resetearEstado();
  mostrarVista(renderMenuPrincipal(getNivelDificultad()));
  _enlazarEventosMenu();
}

function _enlazarEventosMenu() {
  document.getElementById('btn-plan')
    ?.addEventListener('click', irADashboard);
  document.getElementById('btn-plan')
    ?.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') irADashboard(); });

  document.getElementById('btn-simulacro')
    ?.addEventListener('click', iniciarSimulacro);
  document.getElementById('btn-simulacro')
    ?.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') iniciarSimulacro(); });

  document.getElementById('btn-ir-diagnostico')
    ?.addEventListener('click', iniciarDiagnostico);

  document.querySelectorAll('.nivel-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const nivel = btn.dataset.nivel;
      setNivelDificultad(nivel);

      if (nivel === 'automatico') {
        mostrarVista(renderMenuPrincipal('automatico'));
        _enlazarEventosMenu();
        return;
      }

      document.querySelectorAll('.nivel-btn').forEach((b) => {
        b.classList.toggle('nivel-btn--activo', b.dataset.nivel === nivel);
        b.setAttribute('aria-pressed', b.dataset.nivel === nivel);
      });
    });
  });

  document.querySelectorAll('.area-card').forEach((btn) => {
    btn.addEventListener('click', () => irADetalleArea(btn.dataset.materia));
  });
}

// =====================================================
// FEATURE 3: DIAGNÓSTICO DE NIVEL
// =====================================================

function iniciarDiagnostico() {
  const preguntasPorMateria = MATERIAS.map((materia) => {
    const del_nivel2 = PREGUNTAS.filter((p) => p.materia === materia && p.dificultad === 2);
    const pool       = del_nivel2.length > 0
      ? del_nivel2
      : PREGUNTAS.filter((p) => p.materia === materia);
    return _aleatorio(pool);
  }).filter(Boolean);

  if (preguntasPorMateria.length === 0) {
    _mostrarAlerta('No hay preguntas disponibles para el diagnóstico.');
    return;
  }

  iniciarSesion('diagnostico', preguntasPorMateria, null, /* esDiagnostico */ true);
  _renderizarPreguntaActual();
}

// =====================================================
// FEATURE 4 & 5: DASHBOARD + RUTINA DIARIA
// =====================================================

function irADashboard() {
  detenerTimer();
  resetearEstado();

  const dashboardData = obtenerDashboardData();
  const yaRutina      = yaHizoRutinaHoy();
  const nivel         = getNivelDificultad();

  mostrarVista(renderDashboardEstudiante(dashboardData, yaRutina, nivel));
  _enlazarEventosDashboard();
}

function _enlazarEventosDashboard() {
  document.getElementById('btn-volver-menu-dash')
    ?.addEventListener('click', irAMenu);

  document.getElementById('btn-iniciar-rutina')
    ?.addEventListener('click', iniciarRutinaDelDia);

  document.querySelectorAll('.area-card').forEach((btn) => {
    btn.addEventListener('click', () => irADetalleArea(btn.dataset.materia));
  });
}

function iniciarRutinaDelDia() {
  const nivel   = getNivelDificultad();
  const rutina  = generarRutinaDelDia(PREGUNTAS, nivel);

  if (rutina.length === 0) {
    _mostrarAlerta('No hay preguntas disponibles para tu nivel de dificultad actual.');
    return;
  }

  iniciarSesion('rutina', rutina, null);
  _iniciarTimer();
  _renderizarPreguntaActual();
}

// =====================================================
// MÓDULO DE REFUERZO POR ÁREA
// =====================================================

function irADetalleArea(materia) {
  detenerTimer();
  resetearEstado();

  const statsData = obtenerDatosArea(materia);
  const nivelArea = getNivelArea(materia);

  mostrarVista(renderDetalleArea(materia, statsData, nivelArea));
  _enlazarEventosDetalleArea(materia);
}

function _enlazarEventosDetalleArea(materia) {
  document.getElementById('btn-volver-desde-detalle')
    ?.addEventListener('click', irADashboard);

  document.querySelectorAll('[data-accion="cambiar-nivel-area"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const nuevoNivel = btn.dataset.nivel;
      setNivelArea(materia, nuevoNivel);
      irADetalleArea(materia);
    });
  });

  document.getElementById('btn-iniciar-entrenamiento')
    ?.addEventListener('click', () => {
      const nivelArea = getNivelArea(materia);
      iniciarEntrenamientoFocalizado(materia, nivelArea);
    });
}

function iniciarEntrenamientoFocalizado(materia, nivelArea) {
  const preguntas = generarEntrenamientoFocalizado(materia, nivelArea);

  if (preguntas.length === 0) {
    _mostrarAlerta(`No hay preguntas disponibles para "${materia}" en el nivel seleccionado.`);
    return;
  }

  iniciarSesion('entrenamiento', preguntas, materia);
  _renderizarPreguntaActual();
}

// =====================================================
// VISTA: SELECCIÓN DE MATERIA
// =====================================================

function irASeleccionMateria() {
  mostrarVista(renderSeleccionMateria(MATERIAS));
  _enlazarEventosSeleccion();
}

function _enlazarEventosSeleccion() {
  document.getElementById('btn-volver-menu')
    ?.addEventListener('click', irAMenu);

  document.querySelectorAll('.materia-btn').forEach((btn) => {
    btn.addEventListener('click', () => iniciarEstudio(btn.dataset.materia));
  });
}

// =====================================================
// FLUJO: SESIÓN DE ESTUDIO
// =====================================================

function iniciarEstudio(materia) {
  const preguntasMateria = _filtrarPorNivelActual(
    PREGUNTAS.filter((p) => p.materia === materia)
  );

  if (preguntasMateria.length === 0) {
    _mostrarAlerta(`No hay preguntas para "${materia}" en el nivel seleccionado. Prueba con un nivel más bajo.`);
    return;
  }

  iniciarSesion('estudio', _mezclarArray([...preguntasMateria]), materia);
  _renderizarPreguntaActual();
}

// =====================================================
// FLUJO: SIMULACRO
// =====================================================

function iniciarSimulacro() {
  // Mapear nivel string → numérico para generarSimulacroCompleto
  const nivelStr = getNivelDificultad();
  const MAPA_NIVEL = { basico: 1, intermedio: 2, avanzado: 3 };
  // 'automatico' usa el nivel diagnóstico guardado, o 2 (intermedio) como fallback
  const nivelNum = MAPA_NIVEL[nivelStr] || getNivelDiagnostico() || 2;

  // 60 preguntas: 12 por cada una de las 5 áreas, según el nivel del usuario
  const preguntas = generarSimulacroCompleto(nivelNum);

  if (preguntas.length === 0) {
    _mostrarAlerta('No hay preguntas disponibles para el nivel seleccionado.');
    return;
  }

  // El timer siempre será 2 horas (7200 s), fijado en iniciarSesion
  iniciarSesion('simulacro', preguntas, null);
  _iniciarTimer();
  _renderizarPreguntaActual();
}

// =====================================================
// FEATURE 1: RESTAURACIÓN DE SESIÓN AL RECARGAR
// =====================================================

function _intentarRestaurarSesion() {
  const restaurada = cargarEstadoPersistido();
  if (!restaurada) return false;

  const state = getState();
  mostrarVista(`
    <div style="text-align:center; padding: var(--sp-2xl) var(--sp-lg);">
      <h2 style="margin-bottom:var(--sp-sm);">Sesión recuperada</h2>
      <p style="margin-bottom:var(--sp-xl);">
        Tienes un <strong>${state.modo === 'rutina' ? 'rutina diaria' : 'simulacro'}</strong> en progreso
        (pregunta ${state.indicePreguntaActual + 1} de ${state.preguntas.length}).
      </p>
      <div style="display:flex; gap:var(--sp-md); justify-content:center; flex-wrap:wrap;">
        <button class="btn-primary" id="btn-continuar-sesion">Continuar</button>
        <button class="btn-back" id="btn-descartar-sesion">Descartar y empezar de nuevo</button>
      </div>
    </div>
  `);

  document.getElementById('btn-continuar-sesion').addEventListener('click', () => {
    if (state.tiempoRestante > 0) _iniciarTimer();
    _renderizarPreguntaActual();
  });

  document.getElementById('btn-descartar-sesion').addEventListener('click', irAMenu);
  return true;
}

// =====================================================
// TIMER
// =====================================================

function _iniciarTimer() {
  if (timerDisplay) {
    timerDisplay.textContent = renderTimer(getTiempoRestante());
    timerDisplay.className = 'timer-display';
  }

  const interval = setInterval(() => {
    const restante = decrementarTiempo();

    if (timerDisplay) {
      timerDisplay.textContent = renderTimer(restante);
      timerDisplay.className = restante < 60 ? 'timer-display timer-urgente' : 'timer-display';
    }

    if (restante <= 0) {
      clearInterval(interval);
      _finalizarSesion();
    }
  }, 1000);

  setTimerInterval(interval);
}

// =====================================================
// RENDERIZADO DE PREGUNTAS
// =====================================================

function _renderizarPreguntaActual() {
  const state    = getState();
  const pregunta = getPreguntaActual();

  if (!pregunta) {
    _finalizarSesion();
    return;
  }

  const numero         = state.indicePreguntaActual + 1;
  const total          = state.preguntas.length;
  const respuestaPrevia = state.respuestasUsuario[pregunta.id] ?? null;

  mostrarVista(renderPregunta(pregunta, numero, total, state.modo, respuestaPrevia));
  _enlazarEventosPregunta(pregunta, state.modo, respuestaPrevia);
}

// ── Punto de entrada de eventos: separa 'relacionar' del flujo estándar
function _enlazarEventosPregunta(pregunta, modo, respuestaPrevia) {
  if (pregunta.tipoPregunta === 'relacionar') {
    _enlazarEventosRelacionar(pregunta, modo, respuestaPrevia);
    return;
  }

  // ── Flujo estándar (estandar / aviso)
  const btnSiguiente = document.getElementById('btn-siguiente');
  const feedbackEl   = document.getElementById('feedback-container');

  if (respuestaPrevia) {
    btnSiguiente.disabled = false;
    if (modo === 'estudio' || modo === 'diagnostico') {
      const esCorrecta = respuestaPrevia === pregunta.respuesta;
      feedbackEl.innerHTML = renderFeedback(esCorrecta, pregunta.respuesta, pregunta.justificacion);
      _marcarOpcionesVisualmente(pregunta.respuesta, respuestaPrevia);
    }
  }

  document.querySelectorAll('.opcion-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      _manejarSeleccionOpcion(btn, pregunta, modo, btnSiguiente, feedbackEl);
    });
  });

  btnSiguiente.addEventListener('click', _manejarSiguiente);
}

// =====================================================
// LÓGICA RELACIONAR — Gestión de Eventos
// =====================================================

/**
 * Enlaza la hoja de respuestas (botones .hoja-respuesta-btn) para preguntas
 * de tipo 'relacionar'. Cada fila corresponde a una definición numerada.
 *
 * Comportamiento:
 * - El usuario puede seleccionar y cambiar su respuesta por fila libremente.
 * - 'Siguiente' se habilita cuando TODAS las definiciones tienen una selección.
 * - En modo estudio/diagnostico: al completar todas las filas, el feedback
 *   aparece inmediatamente (consistente con el flujo de estandar/aviso).
 * - En modo simulacro: no hay feedback inmediato.
 */
function _enlazarEventosRelacionar(pregunta, modo, respuestaPrevia) {
  const btnSiguiente = document.getElementById('btn-siguiente');
  const feedbackEl   = document.getElementById('feedback-container');
  const totalDefs    = (pregunta.definiciones || []).length;

  // Recuperar selecciones previas (objeto { defNum: letra } o {})
  const selecciones = (typeof respuestaPrevia === 'object' && respuestaPrevia !== null)
    ? { ...respuestaPrevia }
    : {};

  const yaRespondidoEnEstudio = Object.keys(selecciones).length > 0
    && (modo === 'estudio' || modo === 'diagnostico');

  // ── Si ya hay respuesta guardada (ej. regresó a esta pregunta en estudio)
  if (yaRespondidoEnEstudio) {
    btnSiguiente.disabled = false;
    feedbackEl.innerHTML  = renderFeedbackRelacionar(pregunta, selecciones);
    _marcarHojaRespuestasConResultados(pregunta, selecciones);
    btnSiguiente.addEventListener('click', _manejarSiguiente);
    return;
  }

  // ── Si hay selecciones parciales en simulacro (restauración de sesión)
  if (Object.keys(selecciones).length === totalDefs) {
    btnSiguiente.disabled = false;
  }

  // ── Escuchar clicks en los botones de la hoja de respuestas
  document.querySelectorAll('.hoja-respuesta-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const defNum = parseInt(btn.dataset.definicion, 10);
      const letra  = btn.dataset.letra;

      // Actualizar la selección para esta fila
      selecciones[defNum] = letra;

      // Actualizar estado visual de la fila (desmarcar otros, marcar este)
      document.querySelectorAll(`.hoja-respuesta-btn[data-definicion="${defNum}"]`)
        .forEach((b) => {
          b.classList.toggle('hoja-respuesta-btn--seleccionado', b.dataset.letra === letra);
        });

      // Persistir en stateManager (objeto parcial o completo)
      registrarRespuesta(pregunta.id, { ...selecciones });

      // Verificar si todas las definiciones tienen respuesta
      const totalRespondidas = Object.keys(selecciones).length;

      if (totalRespondidas === totalDefs) {
        btnSiguiente.disabled = false;

        // En modo estudio/diagnostico: mostrar feedback inmediatamente
        if (modo === 'estudio' || modo === 'diagnostico') {
          feedbackEl.innerHTML = renderFeedbackRelacionar(pregunta, selecciones);
          _marcarHojaRespuestasConResultados(pregunta, selecciones);
          // Bloquear la hoja de respuestas para no permitir cambios
          document.querySelectorAll('.hoja-respuesta-btn').forEach((b) => {
            b.disabled = true;
          });
        }
      }
    });
  });

  btnSiguiente.addEventListener('click', _manejarSiguiente);
}

/**
 * Marca visualmente los botones de la hoja de respuestas con el resultado:
 * - Verde  → respuesta correcta
 * - Rojo   → respuesta del usuario cuando era incorrecta
 */
function _marcarHojaRespuestasConResultados(pregunta, selecciones) {
  const respuestasCorrectas = pregunta.respuestasCorrectas || {};

  (pregunta.definiciones || []).forEach((d) => {
    const userAns    = selecciones[d.numero];
    const correctAns = respuestasCorrectas[d.numero];

    document.querySelectorAll(`.hoja-respuesta-btn[data-definicion="${d.numero}"]`)
      .forEach((btn) => {
        const letra = btn.dataset.letra;
        btn.disabled = true;
        btn.classList.remove('hoja-respuesta-btn--seleccionado');

        if (letra === correctAns) {
          btn.classList.add('hoja-respuesta-btn--correcta');
        } else if (letra === userAns && letra !== correctAns) {
          btn.classList.add('hoja-respuesta-btn--incorrecta');
        }
      });
  });
}

// =====================================================
// LÓGICA ESTÁNDAR — Selección de Opciones (estandar/aviso)
// =====================================================

function _manejarSeleccionOpcion(btnSeleccionado, pregunta, modo, btnSiguiente, feedbackEl) {
  const state = getState();

  if ((modo === 'estudio' || modo === 'diagnostico') && state.respuestasUsuario[pregunta.id]) return;

  document.querySelectorAll('.opcion-btn').forEach((b) => b.classList.remove('opcion-btn--seleccionada'));
  btnSeleccionado.classList.add('opcion-btn--seleccionada');

  const opcionElegida = btnSeleccionado.dataset.opcion;
  registrarRespuesta(pregunta.id, opcionElegida);

  if (modo === 'estudio' || modo === 'diagnostico') {
    const esCorrecta = opcionElegida === pregunta.respuesta;
    feedbackEl.innerHTML = renderFeedback(esCorrecta, pregunta.respuesta, pregunta.justificacion);
    _marcarOpcionesVisualmente(pregunta.respuesta, opcionElegida);
  }

  btnSiguiente.disabled = false;
}

function _marcarOpcionesVisualmente(respuestaCorrecta, respuestaUsuario) {
  document.querySelectorAll('.opcion-btn').forEach((btn) => {
    const opcion = btn.dataset.opcion;
    btn.disabled = true;
    if (opcion === respuestaCorrecta) {
      btn.classList.add('opcion-btn--correcta');
      btn.classList.remove('opcion-btn--seleccionada');
    } else if (opcion === respuestaUsuario && opcion !== respuestaCorrecta) {
      btn.classList.add('opcion-btn--incorrecta');
      btn.classList.remove('opcion-btn--seleccionada');
    }
  });
}

function _manejarSiguiente() {
  const state      = getState();
  const pregActual = getPreguntaActual();
  const esUltima   = esUltimaPregunta();

  // Registrar null si no hay ninguna respuesta (para preguntas omitidas)
  if (pregActual && !state.respuestasUsuario[pregActual.id]) {
    registrarRespuesta(pregActual.id, null);
  }

  if (esUltima) {
    _finalizarSesion();
  } else {
    avanzarPregunta();
    _renderizarPreguntaActual();
  }
}

// =====================================================
// SCORING — Helpers para 'relacionar'
// =====================================================

/**
 * Evalúa las selecciones del usuario para una pregunta de tipo 'relacionar'.
 * Devuelve el número de aciertos y la fracción respecto al total de definiciones.
 */
function _evaluarRelacionar(pregunta, selecciones) {
  const respuestasCorrectas = pregunta.respuestasCorrectas || {};
  const definiciones        = pregunta.definiciones || [];
  const total               = definiciones.length;
  let correctas             = 0;

  definiciones.forEach((d) => {
    const userAns = selecciones ? selecciones[d.numero] : null;
    if (userAns && userAns === respuestasCorrectas[d.numero]) correctas++;
  });

  return {
    correctas,
    total,
    fraccion:      total > 0 ? correctas / total : 0,
    todasCorrectas: correctas === total,
  };
}

/**
 * Ajusta el objeto `resultados` devuelto por calcularResultados() para que
 * las preguntas de tipo 'relacionar' tengan puntaje proporcional.
 *
 * Problema a resolver:
 *   stateManager guarda la respuesta del usuario como un objeto { 1: 'A', ... }
 *   y lo compara con pregunta.respuesta (inexistente en 'relacionar'), por lo
 *   que las marca incorrectas (0 puntos). Esta función corrige ese cálculo.
 *
 * Notas para el mantenimiento de stateManager.js:
 *   Si en el futuro quieres manejar 'relacionar' directamente en stateManager,
 *   busca la lógica de calificación y añade un branch para tipoPregunta === 'relacionar'
 *   que llame a una función similar a _evaluarRelacionar.
 */
function _ajustarResultadosRelacionar(resultados) {
  const { detalles } = resultados;
  if (!detalles || detalles.length === 0) return;

  let ajusteCredito = 0; // Crédito fraccional adicional acumulado

  detalles.forEach((d) => {
    if (d.pregunta.tipoPregunta !== 'relacionar') return;

    const selecciones = (typeof d.respuestaUsuario === 'object' && d.respuestaUsuario !== null)
      ? d.respuestaUsuario
      : {};

    const evaluacion = _evaluarRelacionar(d.pregunta, selecciones);

    // stateManager contó esta pregunta como 0 correctas.
    // Añadimos la fracción real al ajuste.
    ajusteCredito += evaluacion.fraccion;

    // Actualizar el detalle para que renderResultados lo muestre bien.
    d.esCorrecta      = evaluacion.todasCorrectas;
    d.respuestaUsuario = selecciones; // Asegurar que es el objeto, no null
  });

  if (ajusteCredito === 0) return;

  // Recalcular totales
  const nuevasCorrectas    = (resultados.totalCorrectas || 0) + ajusteCredito;
  const nuevoPuntaje       = Math.round((nuevasCorrectas / (resultados.totalPreguntas || 1)) * 100);

  resultados.totalCorrectas = Math.round(nuevasCorrectas * 10) / 10;
  resultados.puntajeSobre100 = Math.min(100, nuevoPuntaje);

  // Recalcular nivel de desempeño si existe
  if (resultados.nivelDesempeno) {
    const p = resultados.puntajeSobre100;
    if      (p >= 80) resultados.nivelDesempeno = { label: 'Excelente',    color: 'verde'    };
    else if (p >= 60) resultados.nivelDesempeno = { label: 'Satisfactorio', color: 'verde'    };
    else if (p >= 40) resultados.nivelDesempeno = { label: 'Básico',        color: 'amarillo' };
    else              resultados.nivelDesempeno = { label: 'Insuficiente',   color: 'rojo'    };
  }
}

// =====================================================
// FINALIZACIÓN DE SESIÓN
// =====================================================

function _finalizarSesion() {
  detenerTimer();

  const state      = getState();
  const resultados = calcularResultados();

  // ── Ajustar puntaje para preguntas de tipo 'relacionar'
  _ajustarResultadosRelacionar(resultados);

  const esDiag = esModoDiagnostico() || state.esDiagnostico;

  if (!esDiag && state.modo !== 'estudio') {
    guardarResultadoEnHistorial(resultados);
  }

  if (state.modo === 'rutina') {
    marcarRutinaCompletadaHoy();
  }

  if (esDiag) {
    const nivel = _calcularNivelDesdeResultado(resultados);
    setNivelDificultad(nivel);
    mostrarVista(renderResultadoDiagnostico(resultados, nivel));
    document.getElementById('btn-ir-menu-desde-diag')?.addEventListener('click', irAMenu);
    return;
  }

  mostrarVista(renderResultados(resultados));
  _enlazarEventosResultados();
}

function _calcularNivelDesdeResultado(resultados) {
  const { puntajeSobre100 } = resultados;
  if      (puntajeSobre100 >= 70) return 'avanzado';
  else if (puntajeSobre100 >= 40) return 'intermedio';
  else                            return 'basico';
}

function _enlazarEventosResultados() {
  document.getElementById('btn-reiniciar')?.addEventListener('click', irAMenu);

  document.querySelectorAll('.refuerzo-card-btn').forEach((btn) => {
    btn.addEventListener('click', () => irADetalleArea(btn.dataset.materia));
  });
}

// =====================================================
// HELPERS
// =====================================================

function _mezclarArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function _aleatorio(arr) {
  if (!arr || arr.length === 0) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

function _mostrarAlerta(mensaje) {
  appContainer.insertAdjacentHTML('afterbegin', `
    <div role="alert" style="
      background: var(--warning-bg);
      border: 1px solid rgba(251,191,36,0.25);
      color: var(--warning);
      padding: 11px 16px;
      border-radius: 6px;
      font-size: 0.88rem;
      font-weight: 500;
      margin-bottom: 16px;
    ">Aviso: ${mensaje}</div>
  `);
}

// =====================================================
// INICIALIZACIÓN
// =====================================================

function init() {
  _inicializarTema();

  document.getElementById('btn-theme-toggle')?.addEventListener('click', _toggleTema);

  const sesiónRestaurada = _intentarRestaurarSesion();

  if (!sesiónRestaurada) {
    irAMenu();
  }

  inicializarBot();

  headerLogo?.addEventListener('click', irAMenu);
  headerLogo?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') irAMenu();
  });
}

document.addEventListener('DOMContentLoaded', init);