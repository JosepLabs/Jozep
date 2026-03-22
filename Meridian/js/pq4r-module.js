'use strict';
/**
 * pq4r-module.js — Módulo de Lectura Activa PQ4R para MERIDIAN
 *
 * Las 6 etapas:
 *  1. Preview  — Previsualiza la estructura del texto
 *  2. Question — Convierte subtítulos en preguntas
 *  3. Read     — Lectura enfocada buscando respuestas
 *  4. Reflect  — Conecta con conocimiento previo
 *  5. Recite   — Responde las preguntas sin mirar
 *  6. Review   — Informe final con puntos clave
 *
 * Persistencia: Storage.savePQ4RSession({ id, title, step,
 *   preview, questions[], reflect, recite[], review, completedAt })
 */

const PQ4RModule = (() => {

  // ── Estado ────────────────────────────────────────────────────
  let _s = null;   // sesión activa
  let _debounce = null;

  const STEPS = [
    {
      id:       'preview',
      num:      1,
      label:    'Preview',
      sublabel: 'Previsualiza',
      color:    'var(--purple)',
      icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
          stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
        <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.8"/>
      </svg>`,
    },
    {
      id:       'question',
      num:      2,
      label:    'Question',
      sublabel: 'Pregunta',
      color:    'var(--accent)',
      icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.8"/>
        <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" stroke="currentColor"
          stroke-width="1.8" stroke-linecap="round"/>
        <circle cx="12" cy="17" r="1" fill="currentColor"/>
      </svg>`,
    },
    {
      id:       'read',
      num:      3,
      label:    'Read',
      sublabel: 'Lee',
      color:    'var(--green)',
      icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"
          stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
        <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"
          stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
      </svg>`,
    },
    {
      id:       'reflect',
      num:      4,
      label:    'Reflect',
      sublabel: 'Reflexiona',
      color:    'var(--amber)',
      icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M12 2a7 7 0 00-4 12.74V17a2 2 0 002 2h4a2 2 0 002-2v-2.26A7 7 0 0012 2z"
          stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
        <path d="M9 21h6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      </svg>`,
    },
    {
      id:       'recite',
      num:      5,
      label:    'Recite',
      sublabel: 'Recita',
      color:    'var(--red)',
      icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M12 20h9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"
          stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
      </svg>`,
    },
    {
      id:       'review',
      num:      6,
      label:    'Review',
      sublabel: 'Revisa',
      color:    'var(--green)',
      icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M9 11l3 3L22 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"
          stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      </svg>`,
    }
  ];

  // ──────────────────────────────────────────────────────────────
  // HUB
  // ──────────────────────────────────────────────────────────────
  function renderHub(root) {
    const sessions = Storage.getPQ4RSessions();
    const recent   = sessions.slice(0, 3);

    root.innerHTML = `
      <div class="view-container pq4r-view">

        <div class="view-header">
          <button class="btn-back" onclick="navigate('hub')">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L5 8L10 13" stroke="currentColor" stroke-width="1.5"
                stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Hub
          </button>
          <h1 class="view-title">Método PQ4R</h1>
          <span></span>
        </div>

        <div class="pq4r-hub-hero">
          <div class="pq4r-hub-icon">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <path d="M4 24s8-16 20-16 20 16 20 16-8 16-20 16S4 24 4 24z"
                stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
              <circle cx="24" cy="24" r="6" stroke="currentColor" stroke-width="2"/>
              <circle cx="24" cy="24" r="2" fill="currentColor"/>
            </svg>
          </div>
          <h2 class="pq4r-hub-title">Lee para entender, no para terminar</h2>
          <p class="pq4r-hub-desc">
            PQ4R convierte la lectura pasiva en aprendizaje activo. Seis etapas que te fuerzan
            a procesar, cuestionar y consolidar — en lugar de releer sin retener.
          </p>

          <div class="pq4r-steps-row">
            ${STEPS.map(s => `
              <div class="pq4r-step-chip" style="--step-color:${s.color}">
                <span class="psc-num">${s.num}</span>
                <span class="psc-label">${s.label}</span>
              </div>
            `).join('<span class="psc-arrow">→</span>')}
          </div>

          <button class="btn btn-primary btn-lg" onclick="PQ4RModule._newSession()">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
            </svg>
            Iniciar lectura PQ4R
          </button>
        </div>

        ${sessions.length > 0 ? `
          <div class="pq4r-recent">
            <div class="pq4r-recent-header">
              <span class="pq4r-recent-label">Sesiones recientes</span>
              <button class="btn btn-ghost btn-xs" onclick="navigate('pq4r-list')">
                Ver todas (${sessions.length}) →
              </button>
            </div>
            <div class="pq4r-sessions-list">
              ${recent.map(s => _sessionCardHTML(s)).join('')}
            </div>
          </div>
        ` : ''}

      </div>`;

    _attachListListeners(root);
  }

  // ──────────────────────────────────────────────────────────────
  // WIZARD DE 6 PASOS
  // ──────────────────────────────────────────────────────────────
  function render(root, sessionId = null) {
    if (sessionId) {
      _s = Storage.getPQ4RSessions().find(s => s.id === sessionId) || _blank();
    } else {
      if (!_s) _s = _blank();
    }

    // Si paso actual es mayor a lo guardado, usamos el guardado
    const step = _s.step || 1;

    root.innerHTML = `
      <div class="pq4r-wizard-wrapper">

        <!-- Barra superior -->
        <div class="pq4r-topbar">
          <button class="btn-back" onclick="PQ4RModule._exitWizard()">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L5 8L10 13" stroke="currentColor" stroke-width="1.5"
                stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            PQ4R
          </button>

          <!-- Progreso visual de pasos -->
          <nav class="pq4r-step-nav" aria-label="Progreso PQ4R">
            ${STEPS.map(st => `
              <button
                class="pq4r-step-dot ${st.num === step ? 'active' : ''} ${st.num < step ? 'done' : ''}"
                style="--step-color:${st.color}"
                onclick="PQ4RModule._jumpTo(${st.num})"
                aria-label="Etapa ${st.num}: ${st.label}"
                title="${st.num}. ${st.label} — ${st.sublabel}"
                ${st.num > step ? 'disabled' : ''}>
                ${st.num < step
                  ? `<svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                       <path d="M1.5 5.5l3 3 5-5" stroke="currentColor" stroke-width="1.5"
                         stroke-linecap="round" stroke-linejoin="round"/>
                     </svg>`
                  : st.num}
              </button>
            `).join('')}
          </nav>

          <span class="pq4r-topbar-step-label" id="topbarStepLabel">
            ${step} / 6 — ${STEPS[step - 1].label}
          </span>
        </div>

        <!-- Contenido del paso activo -->
        <div class="pq4r-step-content" id="pq4rStepContent">
          ${_renderStep(step)}
        </div>

      </div>`;

    _attachStepHandlers(step);
  }

  // ──────────────────────────────────────────────────────────────
  // RENDER DE CADA PASO
  // ──────────────────────────────────────────────────────────────
  function _renderStep(n) {
    switch (n) {
      case 1: return _step1();
      case 2: return _step2();
      case 3: return _step3();
      case 4: return _step4();
      case 5: return _step5();
      case 6: return _step6();
      default: return _step1();
    }
  }

  // ── Paso 1: Preview ───────────────────────────────────────────
  function _step1() {
    return `
      <div class="pq4r-step-card">
        <div class="pq4r-step-header" style="--step-color:var(--purple)">
          <div class="pq4r-step-badge">
            ${STEPS[0].icon}
            <span>Etapa 1 — Preview</span>
          </div>
          <h2 class="pq4r-step-title">Previsualiza la estructura</h2>
          <p class="pq4r-step-desc">
            Antes de leer, escanea el texto completo. Anota los títulos, subtítulos, imágenes,
            gráficos y cualquier texto en negrita. El objetivo es construir un mapa mental previo.
          </p>
        </div>

        <div class="pq4r-step-body">
          <div class="form-group">
            <label class="form-label" for="pq4rTitle">Título / Tema del texto</label>
            <input id="pq4rTitle" class="form-input pq4r-input"
              type="text" placeholder="ej. Capítulo 5 — Programación Funcional"
              value="${_esc(_s.title)}" maxlength="200" autocomplete="off"/>
          </div>

          <div class="form-group">
            <label class="form-label" for="pq4rPreview">
              Estructura que observas
              <span class="label-hint">— títulos, imágenes, conceptos destacados</span>
            </label>
            <textarea id="pq4rPreview" class="pq4r-textarea"
              placeholder="Subtítulos que veo:&#10;• 5.1 - Funciones puras&#10;• 5.2 - Inmutabilidad&#10;• 5.3 - Map, Filter, Reduce&#10;&#10;Imágenes / gráficos:&#10;• Diagrama de pipeline de funciones&#10;&#10;Conceptos en negrita:&#10;• Composición, Currying, Mónadas"
              rows="10">${_esc(_s.preview)}</textarea>
          </div>
        </div>

        ${_stepFooter(1)}
      </div>`;
  }

  // ── Paso 2: Question ──────────────────────────────────────────
  function _step2() {
    const questions = _s.questions.length > 0 ? _s.questions : [''];

    return `
      <div class="pq4r-step-card">
        <div class="pq4r-step-header" style="--step-color:var(--accent)">
          <div class="pq4r-step-badge">
            ${STEPS[1].icon}
            <span>Etapa 2 — Question</span>
          </div>
          <h2 class="pq4r-step-title">Convierte subtítulos en preguntas</h2>
          <p class="pq4r-step-desc">
            Toma cada subtítulo o concepto clave y transfórmalo en una pregunta. Esto activa
            tu curiosidad y te da un objetivo concreto al leer. Más preguntas = más foco.
          </p>
        </div>

        <div class="pq4r-step-body">
          <div class="pq4r-qlist" id="pq4rQuestionList">
            ${questions.map((q, i) => _questionRowHTML(q, i)).join('')}
          </div>
          <button class="pq4r-add-btn" id="pq4rAddQuestion">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 2v10M2 7h10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
            </svg>
            Añadir pregunta
          </button>
        </div>

        ${_stepFooter(2)}
      </div>`;
  }

  function _questionRowHTML(value, idx) {
    return `
      <div class="pq4r-q-row" data-q-idx="${idx}">
        <span class="pq4r-q-num">${idx + 1}</span>
        <input type="text" class="pq4r-q-input form-input"
          placeholder="ej. ¿Qué son las funciones puras y por qué importan?"
          value="${_esc(value)}"
          data-q-field="${idx}"
          maxlength="300"/>
        <button class="pq4r-q-del" data-q-del="${idx}" aria-label="Eliminar pregunta ${idx + 1}"
          ${_s.questions.length <= 1 ? 'disabled' : ''}>
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
            <path d="M1 7h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </button>
      </div>`;
  }

  // ── Paso 3: Read ──────────────────────────────────────────────
  function _step3() {
    const hasQuestions = _s.questions.filter(q => q.trim()).length > 0;

    return `
      <div class="pq4r-step-card">
        <div class="pq4r-step-header" style="--step-color:var(--green)">
          <div class="pq4r-step-badge">
            ${STEPS[2].icon}
            <span>Etapa 3 — Read</span>
          </div>
          <h2 class="pq4r-step-title">Lee buscando respuestas</h2>
          <p class="pq4r-step-desc">
            Ahora lee el texto completo, pero con propósito: busca activamente las respuestas
            a tus preguntas del paso anterior. No te apresures. Subraya o anota brevemente.
          </p>
        </div>

        <div class="pq4r-step-body">

          <!-- Tarjeta de modo enfocado -->
          <div class="pq4r-focus-card">
            <div class="pq4r-focus-icon">
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                <path d="M3 18s6.5-13 15-13 15 13 15 13-6.5 13-15 13S3 18 3 18z"
                  stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
                <circle cx="18" cy="18" r="5" stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
            <h3 class="pq4r-focus-title">Modo lectura activa</h3>
            <p class="pq4r-focus-text">
              Vuelve a tu texto físico o digital ahora. Lee con las preguntas en mente.
              Cuando termines, regresa aquí para continuar con la etapa 4.
            </p>
          </div>

          <!-- Preguntas de referencia -->
          ${hasQuestions ? `
            <div class="pq4r-read-questions">
              <div class="pq4r-rq-label">Tus preguntas guía:</div>
              <ol class="pq4r-rq-list">
                ${_s.questions.filter(q => q.trim()).map(q =>
                  `<li>${_esc(q)}</li>`
                ).join('')}
              </ol>
            </div>
          ` : `
            <div class="pq4r-rq-empty">
              No añadiste preguntas en el paso anterior.
              <button class="btn btn-ghost btn-xs" onclick="PQ4RModule._jumpTo(2)">
                Volver a añadir →
              </button>
            </div>
          `}

          <div class="form-group" style="margin-top: var(--s5)">
            <label class="form-label" for="pq4rReadNotes">
              Notas rápidas mientras lees <span class="label-hint">— opcional</span>
            </label>
            <textarea id="pq4rReadNotes" class="pq4r-textarea"
              placeholder="Anota brevemente hallazgos, pasajes importantes o lo que te llama la atención…"
              rows="5">${_esc(_s.readNotes || '')}</textarea>
          </div>
        </div>

        ${_stepFooter(3)}
      </div>`;
  }

  // ── Paso 4: Reflect ───────────────────────────────────────────
  function _step4() {
    return `
      <div class="pq4r-step-card">
        <div class="pq4r-step-header" style="--step-color:var(--amber)">
          <div class="pq4r-step-badge">
            ${STEPS[3].icon}
            <span>Etapa 4 — Reflect</span>
          </div>
          <h2 class="pq4r-step-title">Reflexiona y conecta</h2>
          <p class="pq4r-step-desc">
            ¿Cómo se relaciona lo que leíste con lo que ya sabías? ¿Hay ejemplos prácticos
            que te vengan a la mente? ¿Algo contradice tu modelo mental previo?
            La reflexión profundiza el aprendizaje.
          </p>
        </div>

        <div class="pq4r-step-body">
          <div class="pq4r-reflect-prompts">
            <button class="pq4r-prompt-chip" data-prompt="Esto se conecta con lo que sé sobre ">Conectar con previo</button>
            <button class="pq4r-prompt-chip" data-prompt="Un ejemplo práctico de esto sería ">Dar un ejemplo</button>
            <button class="pq4r-prompt-chip" data-prompt="Lo que me sorprendió fue ">¿Qué me sorprendió?</button>
            <button class="pq4r-prompt-chip" data-prompt="Una analogía que me ayuda es ">Crear analogía</button>
            <button class="pq4r-prompt-chip" data-prompt="Todavía no entiendo bien ">¿Qué no entiendo?</button>
          </div>

          <div class="form-group">
            <label class="form-label" for="pq4rReflect">Tu reflexión</label>
            <textarea id="pq4rReflect" class="pq4r-textarea"
              placeholder="Escribe libremente cómo conectas este material con tu experiencia y conocimiento previo…"
              rows="10">${_esc(_s.reflect)}</textarea>
          </div>
        </div>

        ${_stepFooter(4)}
      </div>`;
  }

  // ── Paso 5: Recite ────────────────────────────────────────────
  function _step5() {
    const qs = _s.questions.filter(q => q.trim());
    const recite = _s.recite;

    return `
      <div class="pq4r-step-card">
        <div class="pq4r-step-header" style="--step-color:var(--red)">
          <div class="pq4r-step-badge">
            ${STEPS[4].icon}
            <span>Etapa 5 — Recite</span>
          </div>
          <h2 class="pq4r-step-title">Responde sin mirar el texto</h2>
          <p class="pq4r-step-desc">
            Cierra el libro. Responde cada pregunta con tus propias palabras — no necesitas ser perfecto,
            necesitas ser honesto. Los huecos que notes son exactamente lo que debes revisar.
          </p>
        </div>

        <div class="pq4r-step-body">
          ${qs.length === 0 ? `
            <div class="pq4r-rq-empty">
              No hay preguntas del paso 2.
              <button class="btn btn-ghost btn-xs" onclick="PQ4RModule._jumpTo(2)">Ir al paso 2 →</button>
            </div>
          ` : qs.map((q, i) => `
            <div class="pq4r-recite-block">
              <div class="pq4r-recite-q">
                <span class="pq4r-recite-qnum">P${i + 1}</span>
                <span class="pq4r-recite-qtext">${_esc(q)}</span>
              </div>
              <textarea class="pq4r-textarea pq4r-recite-ta"
                data-recite-idx="${i}"
                placeholder="Tu respuesta sin mirar el texto…"
                rows="4">${_esc(recite[i] || '')}</textarea>
            </div>
          `).join('')}
        </div>

        ${_stepFooter(5)}
      </div>`;
  }

  // ── Paso 6: Review ────────────────────────────────────────────
  function _step6() {
    const qs      = _s.questions.filter(q => q.trim());
    const recite  = _s.recite;
    const isComplete = !!_s.completedAt;

    return `
      <div class="pq4r-step-card">
        <div class="pq4r-step-header" style="--step-color:var(--green)">
          <div class="pq4r-step-badge">
            ${STEPS[5].icon}
            <span>Etapa 6 — Review</span>
          </div>
          <h2 class="pq4r-step-title">Revisión y puntos clave</h2>
          <p class="pq4r-step-desc">
            Escribe los 3–7 puntos más importantes del texto. Esta síntesis es lo que
            releerás en el futuro para refrescar tu memoria. Sé conciso y usa tus propias palabras.
          </p>
        </div>

        <div class="pq4r-step-body">
          <div class="form-group">
            <label class="form-label" for="pq4rReview">Puntos clave</label>
            <textarea id="pq4rReview" class="pq4r-textarea"
              placeholder="1. Las funciones puras no tienen efectos secundarios y siempre retornan el mismo resultado para los mismos argumentos.&#10;2. La inmutabilidad previene errores difíciles de rastrear.&#10;3. Map/Filter/Reduce son la base del pensamiento funcional en JS."
              rows="8">${_esc(_s.review)}</textarea>
          </div>

          <!-- Q&A generado -->
          ${qs.length > 0 ? `
            <div class="pq4r-review-qa">
              <div class="pq4r-rqa-label">Tus preguntas y respuestas</div>
              ${qs.map((q, i) => `
                <div class="pq4r-rqa-block">
                  <div class="pq4r-rqa-q">${_esc(q)}</div>
                  <div class="pq4r-rqa-a">${recite[i]
                    ? _esc(recite[i])
                    : '<em style="opacity:.5">Sin respuesta en el paso 5</em>'}</div>
                </div>
              `).join('')}
            </div>
          ` : ''}

          <!-- Reflexión -->
          ${_s.reflect ? `
            <div class="pq4r-review-section">
              <div class="pq4r-rqa-label">Tu reflexión</div>
              <div class="pq4r-review-text">${_esc(_s.reflect)}</div>
            </div>
          ` : ''}
        </div>

        <!-- Pie con botón de completar -->
        <div class="pq4r-step-footer">
          <button class="btn btn-ghost" onclick="PQ4RModule._jumpTo(5)">← Anterior</button>
          <div style="display:flex;gap:var(--s3);align-items:center">
            <button class="btn btn-ghost btn-sm" onclick="PQ4RModule._saveProgress()">
              Guardar borrador
            </button>
            <button class="btn btn-primary" id="pq4rCompleteBtn"
              onclick="PQ4RModule._completeSession()">
              ${isComplete ? '✓ Completada' : 'Completar sesión ✓'}
            </button>
          </div>
        </div>
      </div>`;
  }

  // Pie de navegación reutilizable para pasos 1-5
  function _stepFooter(n) {
    return `
      <div class="pq4r-step-footer">
        ${n > 1
          ? `<button class="btn btn-ghost" onclick="PQ4RModule._jumpTo(${n - 1})">← Anterior</button>`
          : `<button class="btn btn-ghost" onclick="PQ4RModule._exitWizard()">← Salir</button>`}
        <button class="btn btn-primary pq4r-next-btn" onclick="PQ4RModule._advance(${n})">
          ${n === 5 ? 'Ir al Resumen →' : 'Siguiente →'}
        </button>
      </div>`;
  }

  // ──────────────────────────────────────────────────────────────
  // LISTA DE SESIONES
  // ──────────────────────────────────────────────────────────────
  function renderList(root) {
    const sessions = Storage.getPQ4RSessions();

    root.innerHTML = `
      <div class="view-container pq4r-view">
        <div class="view-header">
          <button class="btn-back" onclick="navigate('pq4r-hub')">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L5 8L10 13" stroke="currentColor" stroke-width="1.5"
                stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            PQ4R
          </button>
          <h1 class="view-title">Sesiones PQ4R</h1>
          <button class="btn btn-primary btn-sm" onclick="PQ4RModule._newSession()">+ Nueva</button>
        </div>

        ${sessions.length === 0
          ? `<div class="empty-state">
               <div class="empty-icon">📖</div>
               <p class="empty-title">Sin sesiones</p>
               <p class="empty-sub">Inicia tu primera lectura activa PQ4R.</p>
               <button class="btn btn-primary" onclick="PQ4RModule._newSession()">Comenzar</button>
             </div>`
          : `<div class="pq4r-sessions-list">
               ${sessions.map(s => _sessionCardHTML(s)).join('')}
             </div>`
        }
      </div>`;

    _attachListListeners(root);
  }

  // ──────────────────────────────────────────────────────────────
  // CARDS DE SESIÓN
  // ──────────────────────────────────────────────────────────────
  function _sessionCardHTML(s) {
    const date  = new Date(s.createdAt).toLocaleDateString('es', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
    const stepsDone = s.step || 1;
    const pct = Math.round(((stepsDone - 1) / 6) * 100);

    return `
      <div class="pq4r-session-card" data-open-pq4r="${s.id}" tabindex="0" role="button"
        aria-label="Abrir sesión: ${_esc(s.title || 'Sin título')}">
        <div class="pq4r-sc-top">
          <div>
            <div class="pq4r-sc-title">${_esc(s.title) || '<em style="opacity:.4">Sin título</em>'}</div>
            <div class="pq4r-sc-date">${date}</div>
          </div>
          <div class="pq4r-sc-badge ${s.completedAt ? 'complete' : ''}">
            ${s.completedAt ? '✓ Completa' : `Paso ${stepsDone}/6`}
          </div>
        </div>
        <div class="pq4r-sc-progress">
          <div class="pq4r-sc-bar" style="width:${pct}%"></div>
        </div>
        <div class="pq4r-sc-steps">
          ${STEPS.map(st => `
            <span class="pq4r-sc-step ${st.num < stepsDone ? 'done' : st.num === stepsDone ? 'current' : ''}"
              style="--step-color:${st.color}" title="${st.label}">
              ${st.num < stepsDone ? '✓' : st.num}
            </span>
          `).join('')}
        </div>
        <button class="pq4r-sc-delete" data-delete-pq4r="${s.id}"
          aria-label="Eliminar sesión">
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
            <path d="M2 4h10M5 4V2.5h4V4M5.5 6v5M8.5 6v5M3 4l.5 7.5a1 1 0 001 .9h5a1 1 0 001-.9L11 4"
              stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
          </svg>
        </button>
      </div>`;
  }

  function _attachListListeners(root) {
    root.querySelectorAll('[data-open-pq4r]').forEach(card => {
      const handler = (e) => {
        if (e.target.closest('[data-delete-pq4r]')) return;
        _s = Storage.getPQ4RSessions().find(s => s.id === card.dataset.openPq4r) || null;
        navigate('pq4r', { pq4rSessionId: card.dataset.openPq4r });
      };
      card.addEventListener('click', handler);
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') handler(e);
      });
    });

    root.querySelectorAll('[data-delete-pq4r]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        if (!confirm('¿Eliminar esta sesión PQ4R?')) return;
        Storage.deletePQ4RSession(btn.dataset.deletePq4r);
        if (_s?.id === btn.dataset.deletePq4r) _s = null;
        const root = document.getElementById('appRoot');
        if (AppState.currentView === 'pq4r-list') renderList(root);
        else renderHub(root);
      });
    });
  }

  // ──────────────────────────────────────────────────────────────
  // LÓGICA DE NAVEGACIÓN DEL WIZARD
  // ──────────────────────────────────────────────────────────────
  function _attachStepHandlers(step) {
    const root = document.getElementById('appRoot');
    if (!root) return;

    // Auto-resize textareas
    root.querySelectorAll('.pq4r-textarea').forEach(ta => {
      _autoResize(ta);
      ta.addEventListener('input', () => _autoResize(ta));
    });

    // Paso 1
    if (step === 1) {
      const titleEl = document.getElementById('pq4rTitle');
      if (titleEl) titleEl.addEventListener('input', () => { _s.title = titleEl.value; });
      const preEl = document.getElementById('pq4rPreview');
      if (preEl) preEl.addEventListener('input', () => { _s.preview = preEl.value; });
    }

    // Paso 2 — lista dinámica de preguntas
    if (step === 2) {
      _attachQuestionListHandlers();
    }

    // Paso 3 — notas rápidas de lectura
    if (step === 3) {
      const rn = document.getElementById('pq4rReadNotes');
      if (rn) rn.addEventListener('input', () => { _s.readNotes = rn.value; });
    }

    // Paso 4 — reflexión + prompts
    if (step === 4) {
      const ref = document.getElementById('pq4rReflect');
      if (ref) ref.addEventListener('input', () => { _s.reflect = ref.value; });

      document.querySelectorAll('.pq4r-prompt-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          if (!ref) return;
          const cursor = ref.selectionStart;
          const before = ref.value.substring(0, cursor);
          const after  = ref.value.substring(cursor);
          const insert = chip.dataset.prompt;
          ref.value = before + insert + after;
          _s.reflect = ref.value;
          _autoResize(ref);
          ref.focus();
          ref.setSelectionRange(cursor + insert.length, cursor + insert.length);
        });
      });
    }

    // Paso 5 — respuestas recite
    if (step === 5) {
      document.querySelectorAll('[data-recite-idx]').forEach(ta => {
        const idx = parseInt(ta.dataset.reciteIdx, 10);
        // Asegurar que el array tenga espacio
        while (_s.recite.length <= idx) _s.recite.push('');
        ta.addEventListener('input', () => { _s.recite[idx] = ta.value; });
      });
    }

    // Paso 6 — review final
    if (step === 6) {
      const rev = document.getElementById('pq4rReview');
      if (rev) rev.addEventListener('input', () => { _s.review = rev.value; });
    }
  }

  function _attachQuestionListHandlers() {
    const list    = document.getElementById('pq4rQuestionList');
    const addBtn  = document.getElementById('pq4rAddQuestion');

    if (list) {
      list.addEventListener('input', e => {
        const field = e.target.closest('[data-q-field]');
        if (!field) return;
        const idx = parseInt(field.dataset.qField, 10);
        _s.questions[idx] = field.value;
      });

      list.addEventListener('click', e => {
        const delBtn = e.target.closest('[data-q-del]');
        if (!delBtn || delBtn.disabled) return;
        const idx = parseInt(delBtn.dataset.qDel, 10);
        _s.questions.splice(idx, 1);
        _s.recite.splice(idx, 1);
        _rerenderQuestionList();
      });
    }

    if (addBtn) {
      addBtn.addEventListener('click', () => {
        _s.questions.push('');
        _rerenderQuestionList();
        // Focus en la nueva input
        const inputs = document.querySelectorAll('[data-q-field]');
        if (inputs.length) inputs[inputs.length - 1].focus();
      });
    }
  }

  function _rerenderQuestionList() {
    const list = document.getElementById('pq4rQuestionList');
    if (!list) return;
    list.innerHTML = _s.questions.map((q, i) => _questionRowHTML(q, i)).join('');
    _attachQuestionListHandlers();
  }

  // ──────────────────────────────────────────────────────────────
  // GUARDAR Y AVANZAR
  // ──────────────────────────────────────────────────────────────
  function _advance(currentStep) {
    _saveProgress();
    _jumpTo(currentStep + 1);
  }

  function _jumpTo(n) {
    if (n < 1 || n > 6) return;
    if (!_s) _s = _blank();
    if (n > _s.step) _s.step = n;
    _saveProgress(true);

    const content = document.getElementById('pq4rStepContent');
    const topLabel = document.getElementById('topbarStepLabel');

    if (content) {
      content.innerHTML = _renderStep(n);
      _attachStepHandlers(n);
    }

    // Actualizar dots del nav
    document.querySelectorAll('.pq4r-step-dot').forEach((dot, i) => {
      const dotN = i + 1;
      dot.className = `pq4r-step-dot ${dotN === n ? 'active' : ''} ${dotN < n ? 'done' : ''}`;
      dot.disabled  = dotN > n;
      dot.innerHTML = dotN < n
        ? `<svg width="11" height="11" viewBox="0 0 11 11" fill="none">
             <path d="M1.5 5.5l3 3 5-5" stroke="currentColor" stroke-width="1.5"
               stroke-linecap="round" stroke-linejoin="round"/>
           </svg>`
        : String(dotN);
    });

    if (topLabel) topLabel.textContent = `${n} / 6 — ${STEPS[n - 1].label}`;

    // Auto-resize textareas del nuevo paso
    document.querySelectorAll('.pq4r-textarea').forEach(_autoResize);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function _saveProgress(silent = false) {
    if (!_s) return;
    if (!_s.id) _s.id = Storage.generateId();
    AppState.pq4rSessionId = _s.id;
    Storage.savePQ4RSession({ ..._s, updatedAt: new Date().toISOString() });
    if (!silent) showToast('Progreso guardado', 'success');
  }

  function _completeSession() {
    if (!_s) return;
    _s.completedAt = new Date().toISOString();
    _saveProgress(true);
    // Rerender step 6 para mostrar estado completo
    const content = document.getElementById('pq4rStepContent');
    if (content) {
      content.innerHTML = _step6();
      _attachStepHandlers(6);
    }
    showToast('¡Sesión PQ4R completada!', 'success');
  }

  // ──────────────────────────────────────────────────────────────
  // API PÚBLICA
  // ──────────────────────────────────────────────────────────────
  function _newSession() {
    _s = _blank();
    navigate('pq4r', { pq4rSessionId: null });
  }

  function _exitWizard() {
    if (_s && (_s.title || _s.preview || _s.questions.some(q => q.trim()))) {
      _saveProgress(true);
    }
    navigate('pq4r-hub');
  }

  // ──────────────────────────────────────────────────────────────
  // UTILIDADES
  // ──────────────────────────────────────────────────────────────
  function _blank() {
    return {
      id:          null,
      title:       '',
      step:        1,
      preview:     '',
      questions:   [''],
      readNotes:   '',
      reflect:     '',
      recite:      [],
      review:      '',
      completedAt: null,
      createdAt:   new Date().toISOString(),
      updatedAt:   new Date().toISOString()
    };
  }

  function _autoResize(ta) {
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.max(ta.scrollHeight, 100) + 'px';
  }

  function _esc(str) {
    return String(str || '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // ── Export ────────────────────────────────────────────────────
  return { renderHub, render, renderList, _newSession, _jumpTo, _advance,
           _saveProgress, _completeSession, _exitWizard };

})();
