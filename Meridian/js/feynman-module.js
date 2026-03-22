'use strict';
/**
 * feynman-module.js — Técnica Feynman para MERIDIAN (v2 — reescritura completa)
 *
 * Wizard de 4 pasos con máquina de estados sin bugs:
 *   1 — Concepto    → Input + validación en tiempo real
 *   2 — Explicación → Textarea full-screen, mínimo 20 chars
 *   3 — Evaluación  → 3 preguntas Sí/No con _setEval()
 *   4 — Lagunas     → Textarea libre + Guardar y finalizar
 *
 * API pública:
 *   render(root, subview)  — 'wizard' | 'list'
 *   renderHub(root)
 *   _startNew()  _showList()  _exitWizard()
 *   _prevStep()  _nextStep()
 *   _setEval(key, value)
 *   _saveSession()
 */

const FeynmanModule = (() => {

  // ══════════════════════════════════════════════════
  // ESTADO PRIVADO
  // ══════════════════════════════════════════════════

  let _state = _blankState();

  function _blankState() {
    return {
      step: 1,
      concept: '',
      explanation: '',
      selfEval: {
        usedJargon:   null,
        kidsWouldGet: null,
        gotStuck:     null
      },
      gaps: ''
    };
  }

  function _resetState() { _state = _blankState(); }

  // ══════════════════════════════════════════════════
  // PUNTO DE ENTRADA
  // ══════════════════════════════════════════════════

  function render(root, subview) {
    if (subview === 'list') _renderList(root);
    else                    _renderWizard(root);
  }

  // ══════════════════════════════════════════════════
  // HUB
  // ══════════════════════════════════════════════════

  function renderHub(root) {
    const sessions = Storage.getFeynmanSessions();
    const last     = sessions[0] || null;

    root.innerHTML = `
      <div class="view-container feynman-view">

        <div class="view-header">
          <button class="btn-back" onclick="navigate('hub')">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M10 3L5 8L10 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Hub
          </button>
          <h1 class="view-title">Técnica Feynman</h1>
          <span></span>
        </div>

        <div class="feynman-hub-hero">
          <div class="feynman-hub-icon">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="18" r="9" stroke="currentColor" stroke-width="2"/>
              <path d="M20 18c0-2.21 1.79-4 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <path d="M24 27v6M20 36h8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <h2 class="feynman-hub-title">Aprende enseñando</h2>
          <p class="feynman-hub-desc">
            Si no puedes explicarlo en palabras simples, aún no lo entiendes del todo.
            El método Feynman revela exactamente qué sabes — y qué no.
          </p>
          <div class="feynman-hub-steps-preview">
            <div class="feynman-hub-step"><span class="fhs-num">1</span>Elige un concepto</div>
            <div class="feynman-hub-arrow">→</div>
            <div class="feynman-hub-step"><span class="fhs-num">2</span>Explícalo sin jerga</div>
            <div class="feynman-hub-arrow">→</div>
            <div class="feynman-hub-step"><span class="fhs-num">3</span>Evalúa tu claridad</div>
            <div class="feynman-hub-arrow">→</div>
            <div class="feynman-hub-step"><span class="fhs-num">4</span>Anota tus lagunas</div>
          </div>
          <button class="btn btn-primary btn-lg" onclick="FeynmanModule._startNew()">
            Iniciar sesión Feynman
          </button>
        </div>

        ${last ? `
          <div class="feynman-last-session">
            <div class="feynman-last-header">
              <span class="feynman-last-label">Última sesión</span>
              <button class="btn btn-ghost btn-xs" onclick="FeynmanModule._showList()">Ver todas →</button>
            </div>
            ${_sessionCardHTML(last)}
          </div>` : ''}

      </div>`;
  }

  // ══════════════════════════════════════════════════
  // WIZARD — CONTENEDOR
  // ══════════════════════════════════════════════════

  function _renderWizard(root) {
    root.innerHTML = `
      <div class="view-container feynman-view">

        <div class="view-header">
          <button class="btn-back" onclick="FeynmanModule._exitWizard()">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M10 3L5 8L10 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Feynman
          </button>
          <h1 class="view-title">Técnica Feynman</h1>
          <button class="btn btn-ghost btn-sm" onclick="FeynmanModule._showList()">Historial</button>
        </div>

        <div class="feynman-steps" role="list" aria-label="Progreso" id="feynmanSteps">
          ${_stepsHTML()}
        </div>

        <div class="feynman-card" id="feynmanCard">
          ${_stepHTML(_state.step)}
        </div>

      </div>`;

    _bindStep();
  }

  // ── Indicador de pasos ────────────────────────────

  function _stepsHTML() {
    const defs = [
      { n: 1, label: 'Concepto'    },
      { n: 2, label: 'Explicación' },
      { n: 3, label: 'Evaluación'  },
      { n: 4, label: 'Lagunas'     }
    ];
    return defs.map((s, i) => {
      const active = s.n === _state.step;
      const done   = s.n < _state.step;
      const cls    = active ? 'active' : done ? 'done' : '';
      const inner  = done
        ? `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2 6l3 3 5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`
        : s.n;
      const dot  = `<div class="feynman-step ${cls}" role="listitem" aria-current="${active ? 'step' : 'false'}">
                      <div class="feynman-step-dot">${inner}</div>
                      <span class="feynman-step-label">${s.label}</span>
                    </div>`;
      const line = i < defs.length - 1 ? `<div class="feynman-step-line" aria-hidden="true"></div>` : '';
      return dot + line;
    }).join('');
  }

  // ── Despacho de contenido ─────────────────────────

  function _stepHTML(n) {
    switch (n) {
      case 1: return _step1HTML();
      case 2: return _step2HTML();
      case 3: return _step3HTML();
      case 4: return _step4HTML();
      default: return _step1HTML();
    }
  }

  // ══════════════════════════════════════════════════
  // PASO 1 — CONCEPTO
  // ══════════════════════════════════════════════════

  function _step1HTML() {
    const ok = _state.concept.trim().length >= 2;
    return `
      <div class="feynman-step-body">
        <div class="feynman-step-icon">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <circle cx="18" cy="14" r="7" stroke="currentColor" stroke-width="1.8"/>
            <path d="M15 14c0-1.66 1.34-3 3-3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
            <path d="M18 21v4M15 28h6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
          </svg>
        </div>
        <h2 class="feynman-step-title">¿Qué quieres dominar hoy?</h2>
        <p class="feynman-step-desc">Elige un concepto específico. Cuanto más concreto, más útil es el ejercicio.</p>

        <div class="form-group" style="margin-top:var(--s5)">
          <label class="form-label" for="f-concept">Concepto a estudiar</label>
          <input id="f-concept" class="form-input feynman-concept-input"
            type="text"
            placeholder="ej. Closures en JavaScript, El Big Bang, Fotosíntesis…"
            value="${_esc(_state.concept)}"
            maxlength="120" autocomplete="off" spellcheck="false"/>
          <span class="feynman-char-count" id="f-count">${_state.concept.length}/120</span>
        </div>

        <div class="feynman-examples">
          <span class="feynman-examples-label">Ejemplos:</span>
          ${['Promesas en JS','Método científico','Inflación económica','La mitosis']
            .map(ex => `<button class="feynman-example-chip" data-ex="${_esc(ex)}">${_esc(ex)}</button>`)
            .join('')}
        </div>
      </div>

      <div class="feynman-actions">
        <button class="btn btn-ghost" onclick="FeynmanModule._exitWizard()">Cancelar</button>
        <button class="btn btn-primary" id="f-btn-next" ${ok ? '' : 'disabled'}>Continuar →</button>
      </div>`;
  }

  // ══════════════════════════════════════════════════
  // PASO 2 — EXPLICACIÓN
  // ══════════════════════════════════════════════════

  function _step2HTML() {
    const ok = _state.explanation.trim().length >= 20;
    return `
      <div class="feynman-step-body feynman-canvas-body">
        <div class="feynman-canvas-header">
          <div class="feynman-canvas-prompt">
            <span class="feynman-canvas-verb">Explica</span>
            <span class="feynman-canvas-concept">"${_esc(_state.concept)}"</span>
          </div>
          <p class="feynman-canvas-rule">Usa palabras simples. Cero jerga técnica. Como si le hablaras a alguien de 12 años.</p>
        </div>

        <textarea id="f-explanation" class="feynman-canvas-textarea"
          placeholder="Empieza a escribir tu explicación aquí…&#10;&#10;No busques perfección — el objetivo es descubrir qué sabes y qué no."
          aria-label="Área de explicación libre">${_esc(_state.explanation)}</textarea>

        <div class="feynman-canvas-footer">
          <span class="feynman-word-count" id="f-words">${_wordCount(_state.explanation)} palabras</span>
          <span class="feynman-canvas-tip">💡 Si te bloqueas, escribe "No sé cómo explicar esto" — eso ya es información valiosa.</span>
        </div>
      </div>

      <div class="feynman-actions">
        <button class="btn btn-ghost" onclick="FeynmanModule._prevStep()">← Volver</button>
        <button class="btn btn-primary" id="f-btn-next" ${ok ? '' : 'disabled'}>Evaluar mi explicación →</button>
      </div>`;
  }

  // ══════════════════════════════════════════════════
  // PASO 3 — AUTOEVALUACIÓN
  // ══════════════════════════════════════════════════

  function _step3HTML() {
    const { usedJargon, kidsWouldGet, gotStuck } = _state.selfEval;
    const allAnswered = usedJargon !== null && kidsWouldGet !== null && gotStuck !== null;

    const qs = [
      { key:'usedJargon',   icon:'⚠️', text:'¿Usé lenguaje técnico sin explicarlo?',   hint:'Términos como "callback" o "homeostasis" sin definirlos.',         yesClass:'yn-danger',  noClass:'yn-neutral', yesLabel:'Sí, usé jerga',       noLabel:'No, lo expliqué todo', current: usedJargon },
      { key:'kidsWouldGet', icon:'🧒', text:'¿Un niño de 12 años entendería esto?',     hint:'Imagina leerle tu explicación a alguien sin contexto previo.',    yesClass:'yn-success', noClass:'yn-neutral', yesLabel:'Sí, claramente',       noLabel:'No, es confuso aún',   current: kidsWouldGet },
      { key:'gotStuck',     icon:'🧱', text:'¿Me atascué en alguna parte?',             hint:'Hubo momentos en que no sabías cómo continuar.',                  yesClass:'yn-danger',  noClass:'yn-neutral', yesLabel:'Sí, me atascé',        noLabel:'No, fluyó bien',       current: gotStuck }
    ];

    return `
      <div class="feynman-step-body">
        <h2 class="feynman-step-title">Autoevaluación honesta</h2>
        <p class="feynman-step-desc">Lee tu explicación una vez más y responde con honestidad.</p>

        <div class="feynman-review-text">
          <div class="feynman-review-label">Tu explicación:</div>
          <div class="feynman-review-content">${_esc(_state.explanation)}</div>
        </div>

        <div class="feynman-questions" id="f-questions">
          ${qs.map(q => `
            <div class="feynman-question">
              <div class="feynman-q-header">
                <span class="feynman-q-icon" aria-hidden="true">${q.icon}</span>
                <div>
                  <div class="feynman-q-text">${q.text}</div>
                  <div class="feynman-q-hint">${q.hint}</div>
                </div>
              </div>
              <div class="feynman-yn-row">
                <button class="feynman-yn-btn ${q.yesClass} ${q.current === true  ? 'selected' : ''}"
                  data-key="${q.key}" data-val="true">${q.yesLabel}</button>
                <button class="feynman-yn-btn ${q.noClass}  ${q.current === false ? 'selected' : ''}"
                  data-key="${q.key}" data-val="false">${q.noLabel}</button>
              </div>
            </div>`).join('')}
        </div>
      </div>

      <div class="feynman-actions">
        <button class="btn btn-ghost" onclick="FeynmanModule._prevStep()">← Volver</button>
        <button class="btn btn-primary" id="f-btn-next" ${allAnswered ? '' : 'disabled'}>Ver mis lagunas →</button>
      </div>`;
  }

  // ══════════════════════════════════════════════════
  // PASO 4 — LAGUNAS
  // ══════════════════════════════════════════════════

  function _step4HTML() {
    const { usedJargon, kidsWouldGet, gotStuck } = _state.selfEval;
    const score     = [!usedJargon, kidsWouldGet, !gotStuck].filter(Boolean).length;
    const scoreClass = score === 3 ? 'score-great' : score === 2 ? 'score-ok' : 'score-work';
    const scoreMsg   = score === 3
      ? '¡Excelente dominio! Explicación clara y sin jerga.'
      : score === 2 ? 'Buen intento. Hay algunas áreas que refinar.'
                    : 'Detectaste puntos débiles — eso es exactamente lo que buscamos.';

    const insights = [];
    if (usedJargon)    insights.push('Necesitas definir mejor los términos técnicos que usaste.');
    if (!kidsWouldGet) insights.push('La explicación todavía requiere más simplificación.');
    if (gotStuck)      insights.push('Tienes huecos en las partes donde te atascaste.');

    return `
      <div class="feynman-step-body">
        <h2 class="feynman-step-title">Lagunas de conocimiento</h2>
        <p class="feynman-step-desc">Anota exactamente qué necesitas volver a estudiar.</p>

        <div class="feynman-score ${scoreClass}">
          <div class="feynman-score-number">${score}/3</div>
          <div class="feynman-score-msg">${scoreMsg}</div>
        </div>

        ${insights.length ? `
          <div class="feynman-insights">
            <div class="feynman-insights-label">Puntos detectados:</div>
            <ul class="feynman-insights-list">
              ${insights.map(i => `<li>${i}</li>`).join('')}
            </ul>
          </div>` : ''}

        <div class="form-group">
          <label class="form-label" for="f-gaps">
            Lo que aún no entiendo
            <span class="label-hint">— ¿qué necesitas reforzar?</span>
          </label>
          <textarea id="f-gaps" class="form-textarea" rows="5"
            placeholder="ej. No entiendo cómo el event loop gestiona promesas rechazadas. Tampoco pude explicar por qué los closures capturan la referencia…"
          >${_esc(_state.gaps)}</textarea>
        </div>
      </div>

      <div class="feynman-actions">
        <button class="btn btn-ghost" onclick="FeynmanModule._prevStep()">← Volver</button>
        <button class="btn btn-primary" onclick="FeynmanModule._saveSession()">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M2 7l4 4 6-6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Guardar y finalizar
        </button>
      </div>`;
  }

  // ══════════════════════════════════════════════════
  // BIND DE EVENTOS POR PASO
  // ══════════════════════════════════════════════════

  function _bindStep() {
    const n = _state.step;

    // ── Paso 1 ──
    if (n === 1) {
      const input   = document.getElementById('f-concept');
      const counter = document.getElementById('f-count');
      const nextBtn = document.getElementById('f-btn-next');

      if (input) {
        setTimeout(() => input.focus(), 60);

        input.addEventListener('input', () => {
          _state.concept = input.value;
          if (counter) counter.textContent = `${input.value.length}/120`;
          if (nextBtn) nextBtn.disabled    = input.value.trim().length < 2;
        });

        input.addEventListener('keydown', e => {
          if (e.key === 'Enter' && !e.shiftKey && _state.concept.trim().length >= 2) {
            e.preventDefault();
            _nextStep();
          }
        });
      }

      if (nextBtn) nextBtn.addEventListener('click', _nextStep);

      document.querySelectorAll('.feynman-example-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          const val = chip.dataset.ex;
          if (input)   input.value = val;
          _state.concept = val;
          if (counter) counter.textContent = `${val.length}/120`;
          if (nextBtn) nextBtn.disabled    = false;
          if (input)   input.focus();
        });
      });
    }

    // ── Paso 2 ──
    if (n === 2) {
      const ta      = document.getElementById('f-explanation');
      const words   = document.getElementById('f-words');
      const nextBtn = document.getElementById('f-btn-next');

      if (ta) {
        setTimeout(() => ta.focus(), 60);
        _resize(ta);

        ta.addEventListener('input', () => {
          _state.explanation = ta.value;
          if (words)   words.textContent  = `${_wordCount(ta.value)} palabras`;
          if (nextBtn) nextBtn.disabled   = ta.value.trim().length < 20;
          _resize(ta);
        });
      }

      if (nextBtn) nextBtn.addEventListener('click', _nextStep);
    }

    // ── Paso 3 ──
    if (n === 3) {
      const container = document.getElementById('f-questions');
      const nextBtn   = document.getElementById('f-btn-next');

      if (container) {
        container.addEventListener('click', e => {
          const btn = e.target.closest('[data-key]');
          if (!btn) return;

          const key = btn.dataset.key;
          const val = btn.dataset.val === 'true';

          // Actualizar estado
          _setEval(key, val);

          // Marcar botón activo dentro del grupo
          const row = btn.closest('.feynman-yn-row');
          if (row) {
            row.querySelectorAll('.feynman-yn-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
          }

          // Habilitar "Siguiente" si las 3 están respondidas
          if (nextBtn) {
            const { usedJargon, kidsWouldGet, gotStuck } = _state.selfEval;
            nextBtn.disabled = usedJargon === null || kidsWouldGet === null || gotStuck === null;
          }
        });
      }

      if (nextBtn) nextBtn.addEventListener('click', _nextStep);
    }

    // ── Paso 4 ──
    if (n === 4) {
      const ta = document.getElementById('f-gaps');
      if (ta) {
        ta.addEventListener('input', () => { _state.gaps = ta.value; });
        _resize(ta);
      }
      // _saveSession() ya está en el onclick del botón
    }
  }

  // ══════════════════════════════════════════════════
  // NAVEGACIÓN DE PASOS
  // ══════════════════════════════════════════════════

  function _nextStep() {
    if (_state.step >= 4) return;
    _state.step += 1;
    _updateCard();
  }

  function _prevStep() {
    if (_state.step <= 1) { _exitWizard(); return; }
    _state.step -= 1;
    _updateCard();
  }

  /** Actualiza solo la tarjeta y el indicador — sin tocar el header/navbar */
  function _updateCard() {
    const stepsEl = document.getElementById('feynmanSteps');
    if (stepsEl) stepsEl.innerHTML = _stepsHTML();

    const card = document.getElementById('feynmanCard');
    if (card) {
      card.innerHTML = _stepHTML(_state.step);
      _bindStep();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ══════════════════════════════════════════════════
  // AUTOEVALUACIÓN
  // ══════════════════════════════════════════════════

  /** Actualiza una clave de selfEval sin re-renderizar */
  function _setEval(key, value) {
    _state.selfEval[key] = value;
  }

  // ══════════════════════════════════════════════════
  // GUARDAR SESIÓN
  // ══════════════════════════════════════════════════

  function _saveSession() {
    // Capturar textarea de lagunas si estaba en foco
    const gapsEl = document.getElementById('f-gaps');
    if (gapsEl) _state.gaps = gapsEl.value;

    const session = {
      id:          Storage.generateId(),
      concept:     _state.concept.trim(),
      explanation: _state.explanation.trim(),
      gaps:        _state.gaps.trim(),
      selfEval:    { ..._state.selfEval },
      createdAt:   new Date().toISOString()
    };

    Storage.saveFeynmanSession(session);
    _resetState();
    _renderSuccess(document.getElementById('appRoot'), session.concept);
  }

  function _renderSuccess(root, concept) {
    root.innerHTML = `
      <div class="view-container feynman-view">
        <div class="feynman-complete">
          <div class="complete-icon-wrap">
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
              <circle cx="28" cy="28" r="26" stroke="var(--green)" stroke-width="2" opacity=".25"/>
              <circle cx="28" cy="28" r="20" stroke="var(--green)" stroke-width="1.5" opacity=".5"/>
              <path d="M18 28l7 7 13-13" stroke="var(--green)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h2 class="feynman-complete-title">Sesión guardada</h2>
          <p class="feynman-complete-concept">"${_esc(concept)}"</p>
          <p class="feynman-complete-msg">
            Has identificado tus lagunas. Vuelve a estudiar esos puntos y repite el ejercicio —
            cada iteración refuerza la comprensión real.
          </p>
          <div class="feynman-complete-actions">
            <button class="btn btn-primary" onclick="FeynmanModule._startNew()">Nueva sesión</button>
            <button class="btn btn-ghost"   onclick="FeynmanModule._showList()">Ver historial</button>
          </div>
        </div>
      </div>`;
  }

  // ══════════════════════════════════════════════════
  // HISTORIAL
  // ══════════════════════════════════════════════════

  function _renderList(root) {
    const sessions = Storage.getFeynmanSessions();

    root.innerHTML = `
      <div class="view-container feynman-view">
        <div class="view-header">
          <button class="btn-back" onclick="navigate('feynman-hub')">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M10 3L5 8L10 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Feynman
          </button>
          <h1 class="view-title">Historial de sesiones</h1>
          <button class="btn btn-primary btn-sm" onclick="FeynmanModule._startNew()">+ Nueva</button>
        </div>

        ${sessions.length === 0
          ? `<div class="empty-state">
               <div class="empty-icon" aria-hidden="true">📝</div>
               <p class="empty-title">Sin sesiones aún</p>
               <p class="empty-sub">Completa tu primera sesión Feynman para verla aquí.</p>
               <button class="btn btn-primary" onclick="FeynmanModule._startNew()">Empezar ahora</button>
             </div>`
          : `<div class="feynman-sessions-list">
               ${sessions.map(s => _sessionCardHTML(s)).join('')}
             </div>`}
      </div>`;

    root.querySelectorAll('[data-delete-session]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (!confirm('¿Eliminar esta sesión Feynman?')) return;
        Storage.deleteFeynmanSession(btn.dataset.deleteSession);
        _renderList(root);
      });
    });
  }

  function _sessionCardHTML(s) {
    const { usedJargon, kidsWouldGet, gotStuck } = s.selfEval || {};
    const score      = [!usedJargon, kidsWouldGet, !gotStuck].filter(Boolean).length;
    const scoreClass = score === 3 ? 'score-great' : score === 2 ? 'score-ok' : 'score-work';
    const date       = new Date(s.createdAt).toLocaleDateString('es', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
    const preview = (s.explanation || '').trim().substring(0, 150);

    return `
      <div class="feynman-session-card">
        <div class="feynman-session-top">
          <div class="feynman-session-meta">
            <span class="feynman-session-concept">${_esc(s.concept)}</span>
            <span class="feynman-session-date">${date}</span>
          </div>
          <div class="feynman-score-badge ${scoreClass}">${score}/3</div>
        </div>
        ${preview ? `<p class="feynman-session-preview">${_esc(preview)}${preview.length >= 150 ? '…' : ''}</p>` : ''}
        ${s.gaps  ? `<div class="feynman-session-gaps"><span>Lagunas:</span> ${_esc(s.gaps.substring(0, 100))}${s.gaps.length > 100 ? '…' : ''}</div>` : ''}
        <div class="feynman-session-actions">
          <button class="btn btn-ghost btn-xs" data-delete-session="${s.id}"
            aria-label="Eliminar sesión sobre ${_esc(s.concept)}">Eliminar</button>
        </div>
      </div>`;
  }

  // ══════════════════════════════════════════════════
  // API PÚBLICA
  // ══════════════════════════════════════════════════

  function _startNew()    { _resetState(); navigate('feynman'); }
  function _showList()    { navigate('feynman-list'); }
  function _exitWizard()  { navigate('feynman-hub'); }

  // ══════════════════════════════════════════════════
  // UTILIDADES
  // ══════════════════════════════════════════════════

  function _wordCount(t) { return t.trim() ? t.trim().split(/\s+/).length : 0; }

  function _resize(ta) {
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = ta.scrollHeight + 'px';
  }

  function _esc(s) {
    return String(s || '')
      .replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // ── Export ──────────────────────────────────────
  return {
    render, renderHub,
    _startNew, _showList, _exitWizard,
    _prevStep, _nextStep,
    _setEval, _saveSession
  };

})();
