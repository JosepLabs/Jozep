'use strict';
/**
 * cornell-module.js — Módulo Método Cornell para MERIDIAN
 *
 * Estructura de la hoja:
 *   ┌─────────────────────────────────────────┐
 *   │  ENCABEZADO: Título + Fecha             │
 *   ├──────────────┬──────────────────────────┤
 *   │  CUES (30%)  │  NOTES (70%)             │
 *   │  Preguntas   │  Apuntes principales     │
 *   │  y palabras  │  tomados durante la      │
 *   │  clave       │  clase o lectura         │
 *   ├──────────────┴──────────────────────────┤
 *   │  SUMMARY: Síntesis del tema (100%)      │
 *   └─────────────────────────────────────────┘
 *
 * Persistencia: Storage.saveCornellSession(session)
 * Autosave: debounce 800ms tras cada keystroke
 */

const CornellModule = (() => {

  // ── Estado activo ──────────────────────────────────────────────
  let _current = null;    // sesión en edición
  let _debounceTimer = null;
  let _saveIndicatorTimer = null;

  const AUTOSAVE_DELAY = 800; // ms

  // ──────────────────────────────────────────────────────────────
  // HUB DEL MÓDULO
  // ──────────────────────────────────────────────────────────────
  function renderHub(root) {
    const sessions = Storage.getCornellSessions();
    const recent   = sessions.slice(0, 3);

    root.innerHTML = `
      <div class="view-container cornell-view">

        <div class="view-header">
          <button class="btn-back" onclick="navigate('hub')" aria-label="Volver al hub">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M10 3L5 8L10 13" stroke="currentColor" stroke-width="1.5"
                stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Hub
          </button>
          <h1 class="view-title">Método Cornell</h1>
          <span></span>
        </div>

        <!-- Hero -->
        <div class="cornell-hub-hero">
          <div class="cornell-hub-icon" aria-hidden="true">
            <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
              <rect x="6"  y="4"  width="40" height="48" rx="3" stroke="currentColor" stroke-width="2"/>
              <line x1="18" y1="4"  x2="18" y2="52" stroke="currentColor" stroke-width="1.8" opacity="0.5"/>
              <line x1="6"  y1="38" x2="46" y2="38" stroke="currentColor" stroke-width="1.8" opacity="0.5"/>
              <line x1="6"  y1="14" x2="46" y2="14" stroke="currentColor" stroke-width="1.5" opacity="0.3"/>
            </svg>
          </div>
          <h2 class="cornell-hub-title">Notas que sí se quedan</h2>
          <p class="cornell-hub-desc">
            El sistema Cornell divide tu hoja en tres zonas: <strong>Apuntes</strong> durante la clase,
            <strong>Claves</strong> para revisar después, y un <strong>Resumen</strong> que consolida lo aprendido.
          </p>

          <div class="cornell-hub-zones">
            <div class="cornell-zone-preview cz-cues">
              <span class="czp-label">Claves</span>
              <span class="czp-sub">30% — Preguntas y palabras raíz</span>
            </div>
            <div class="cornell-zone-preview cz-notes">
              <span class="czp-label">Apuntes</span>
              <span class="czp-sub">70% — Notas principales</span>
            </div>
            <div class="cornell-zone-preview cz-summary">
              <span class="czp-label">Resumen</span>
              <span class="czp-sub">100% — Síntesis del tema</span>
            </div>
          </div>

          <button class="btn btn-primary btn-lg" onclick="CornellModule._newSheet()">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
            </svg>
            Nueva hoja Cornell
          </button>
        </div>

        <!-- Sesiones recientes -->
        ${sessions.length > 0 ? `
          <div class="cornell-recent">
            <div class="cornell-recent-header">
              <span class="cornell-recent-label">Notas recientes</span>
              <button class="btn btn-ghost btn-xs" onclick="navigate('cornell-list')">
                Ver todas (${sessions.length}) →
              </button>
            </div>
            <div class="cornell-sessions-grid">
              ${recent.map(s => _sessionCardHTML(s)).join('')}
            </div>
          </div>
        ` : `
          <div class="empty-state">
            <div class="empty-icon" aria-hidden="true">📋</div>
            <p class="empty-title">Sin notas todavía</p>
            <p class="empty-sub">Crea tu primera hoja Cornell y empieza a tomar apuntes estructurados.</p>
          </div>
        `}

      </div>`;

    // Listeners de tarjetas de sesión
    _attachSessionCardListeners(root);
  }

  // ──────────────────────────────────────────────────────────────
  // HOJA CORNELL INTERACTIVA
  // ──────────────────────────────────────────────────────────────
  function render(root, sessionId = null) {
    // Cargar o crear sesión
    if (sessionId) {
      const all = Storage.getCornellSessions();
      _current  = all.find(s => s.id === sessionId) || _blankSession();
    } else {
      _current = _blankSession();
    }

    const isNew = !sessionId;
    const fmtDate = new Date(_current.date).toLocaleDateString('es', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });

    root.innerHTML = `
      <div class="cornell-sheet-wrapper">

        <!-- Barra de acciones (fuera de la hoja) -->
        <div class="cornell-toolbar">
          <button class="btn-back" onclick="navigate('cornell-hub')" aria-label="Volver">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M10 3L5 8L10 13" stroke="currentColor" stroke-width="1.5"
                stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Mis notas
          </button>

          <div class="cornell-toolbar-center">
            <span class="cornell-save-indicator" id="saveIndicator" aria-live="polite"></span>
          </div>

          <div class="cornell-toolbar-right">
            <button class="btn btn-ghost btn-sm" id="cornellSaveBtn"
              onclick="CornellModule._saveNow()" title="Guardar ahora (Ctrl+S)">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M2 10V3a1 1 0 011-1h6.5L11 4V11a1 1 0 01-1 1H3a1 1 0 01-1-1z"
                  stroke="currentColor" stroke-width="1.4"/>
                <rect x="4" y="2" width="4" height="3" rx=".5" stroke="currentColor" stroke-width="1.2"/>
                <rect x="3.5" y="7" width="7" height="4" rx=".5" stroke="currentColor" stroke-width="1.2"/>
              </svg>
              Guardar
            </button>
            ${!isNew ? `
              <button class="btn btn-ghost btn-sm btn-danger-ghost"
                onclick="CornellModule._deleteSession('${_current.id}')"
                title="Eliminar nota">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M2 4h10M5 4V2.5h4V4M5.5 6v5M8.5 6v5M3 4l.5 7.5a1 1 0 001 .9h5a1 1 0 001-.9L11 4"
                    stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
                </svg>
              </button>
            ` : ''}
          </div>
        </div>

        <!-- LA HOJA CORNELL -->
        <div class="cornell-sheet" id="cornellSheet">

          <!-- ENCABEZADO -->
          <div class="cornell-header-zone">
            <div class="cornell-title-row">
              <textarea
                id="cornellTitle"
                class="cornell-field cornell-title-field"
                placeholder="Título del tema…"
                rows="1"
                maxlength="200"
                aria-label="Título del tema"
              >${_esc(_current.title)}</textarea>
              <div class="cornell-date-display" aria-label="Fecha">${fmtDate}</div>
            </div>
          </div>

          <!-- CUERPO: CUES + NOTES -->
          <div class="cornell-body-zone">

            <!-- Columna izquierda: CUES / CLAVES -->
            <div class="cornell-cues-col">
              <div class="cornell-col-label" aria-hidden="true">
                <span>Claves</span>
                <span class="cornell-col-hint">Preguntas · Palabras raíz · Conceptos</span>
              </div>
              <textarea
                id="cornellCues"
                class="cornell-field cornell-cues-field"
                placeholder="¿Qué pregunta responde esta sección?&#10;&#10;• Palabra clave&#10;• Idea principal&#10;&#10;Rellena esta columna DESPUÉS de tomar apuntes."
                aria-label="Columna de claves y preguntas"
              >${_esc(_current.cues)}</textarea>
            </div>

            <!-- Columna derecha: NOTES / APUNTES -->
            <div class="cornell-notes-col">
              <div class="cornell-col-label" aria-hidden="true">
                <span>Apuntes</span>
                <span class="cornell-col-hint">Escribe durante la clase o lectura</span>
              </div>
              <textarea
                id="cornellNotes"
                class="cornell-field cornell-notes-field"
                placeholder="Escribe tus apuntes aquí libremente…&#10;&#10;• Usa viñetas o texto continuo&#10;• Deja espacio para añadir más tarde&#10;• No copies palabra por palabra — parafrasea"
                aria-label="Área principal de apuntes"
              >${_esc(_current.notes)}</textarea>
            </div>

          </div>

          <!-- PIE: SUMMARY / RESUMEN -->
          <div class="cornell-summary-zone">
            <div class="cornell-col-label" aria-hidden="true">
              <span>Resumen</span>
              <span class="cornell-col-hint">Sintetiza el tema en 2–5 oraciones con tus propias palabras</span>
            </div>
            <textarea
              id="cornellSummary"
              class="cornell-field cornell-summary-field"
              placeholder="Resume el tema en tus propias palabras. ¿Cuál es la idea central? ¿Cómo se conecta con lo que ya sabes?"
              rows="4"
              aria-label="Resumen del tema"
            >${_esc(_current.summary)}</textarea>
          </div>

        </div>
        <!-- fin .cornell-sheet -->

      </div>`;

    _attachSheetHandlers(root);
  }

  // ──────────────────────────────────────────────────────────────
  // LISTA DE SESIONES
  // ──────────────────────────────────────────────────────────────
  function renderList(root) {
    const sessions = Storage.getCornellSessions();

    root.innerHTML = `
      <div class="view-container cornell-view">
        <div class="view-header">
          <button class="btn-back" onclick="navigate('cornell-hub')">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M10 3L5 8L10 13" stroke="currentColor" stroke-width="1.5"
                stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Cornell
          </button>
          <h1 class="view-title">Todas las notas</h1>
          <button class="btn btn-primary btn-sm" onclick="CornellModule._newSheet()">+ Nueva</button>
        </div>

        ${sessions.length === 0
          ? `<div class="empty-state">
               <div class="empty-icon">📋</div>
               <p class="empty-title">Sin notas</p>
               <p class="empty-sub">Crea tu primera hoja Cornell.</p>
               <button class="btn btn-primary" onclick="CornellModule._newSheet()">Crear ahora</button>
             </div>`
          : `<div class="cornell-sessions-list">
               ${sessions.map(s => _sessionCardHTML(s)).join('')}
             </div>`
        }
      </div>`;

    _attachSessionCardListeners(root);
  }

  // ──────────────────────────────────────────────────────────────
  // HELPERS DE RENDERIZADO
  // ──────────────────────────────────────────────────────────────
  function _sessionCardHTML(s) {
    const date = new Date(s.date).toLocaleDateString('es', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
    const preview = (s.notes || s.summary || '').trim().substring(0, 130);
    const hasContent = s.cues || s.notes || s.summary;

    return `
      <div class="cornell-session-card" data-open-session="${s.id}" tabindex="0"
        role="button" aria-label="Abrir nota: ${_esc(s.title || 'Sin título')}">
        <div class="cornell-sc-header">
          <span class="cornell-sc-title">${_esc(s.title) || '<em style="opacity:.5">Sin título</em>'}</span>
          <span class="cornell-sc-date">${date}</span>
        </div>
        ${hasContent
          ? `<p class="cornell-sc-preview">${_esc(preview)}${preview.length >= 130 ? '…' : ''}</p>`
          : `<p class="cornell-sc-preview cornell-sc-empty">Hoja vacía</p>`
        }
        <div class="cornell-sc-zones">
          <span class="cornell-sc-zone ${s.cues    ? 'filled' : ''}">Claves</span>
          <span class="cornell-sc-zone ${s.notes   ? 'filled' : ''}">Apuntes</span>
          <span class="cornell-sc-zone ${s.summary ? 'filled' : ''}">Resumen</span>
        </div>
        <button class="cornell-sc-delete" data-delete-session="${s.id}"
          aria-label="Eliminar nota ${_esc(s.title || '')}" title="Eliminar">
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M2 4h10M5 4V2.5h4V4M5.5 6v5M8.5 6v5M3 4l.5 7.5a1 1 0 001 .9h5a1 1 0 001-.9L11 4"
              stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
          </svg>
        </button>
      </div>`;
  }

  function _attachSessionCardListeners(root) {
    root.querySelectorAll('[data-open-session]').forEach(card => {
      const openHandler = (e) => {
        if (e.target.closest('[data-delete-session]')) return;
        navigate('cornell', { cornellSessionId: card.dataset.openSession });
      };
      card.addEventListener('click', openHandler);
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') openHandler(e);
      });
    });

    root.querySelectorAll('[data-delete-session]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.deleteSession;
        if (confirm('¿Eliminar esta hoja Cornell?')) {
          Storage.deleteCornellSession(id);
          // Re-render la vista actual
          const root = document.getElementById('appRoot');
          if (AppState.currentView === 'cornell-list') renderList(root);
          else renderHub(root);
        }
      });
    });
  }

  // ──────────────────────────────────────────────────────────────
  // HANDLERS DE LA HOJA
  // ──────────────────────────────────────────────────────────────
  function _attachSheetHandlers(root) {
    // Auto-expand textareas
    root.querySelectorAll('.cornell-field').forEach(ta => {
      _autoResize(ta);
      ta.addEventListener('input', () => _autoResize(ta));
    });

    // Campos de la hoja → autosave on input
    const fields = ['cornellTitle', 'cornellCues', 'cornellNotes', 'cornellSummary'];
    fields.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('input', () => {
        _syncCurrentFromDOM();
        _scheduleAutosave();
      });
    });

    // Ctrl+S / Cmd+S para guardar
    document.addEventListener('keydown', _handleKeyboardSave);
  }

  function _handleKeyboardSave(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      _saveNow();
    }
  }

  function _autoResize(ta) {
    ta.style.height = 'auto';
    ta.style.height = ta.scrollHeight + 'px';
  }

  function _syncCurrentFromDOM() {
    if (!_current) return;
    const titleEl   = document.getElementById('cornellTitle');
    const cuesEl    = document.getElementById('cornellCues');
    const notesEl   = document.getElementById('cornellNotes');
    const summaryEl = document.getElementById('cornellSummary');
    if (titleEl)   _current.title   = titleEl.value;
    if (cuesEl)    _current.cues    = cuesEl.value;
    if (notesEl)   _current.notes   = notesEl.value;
    if (summaryEl) _current.summary = summaryEl.value;
    _current.updatedAt = new Date().toISOString();
  }

  function _scheduleAutosave() {
    clearTimeout(_debounceTimer);
    _setIndicator('typing');
    _debounceTimer = setTimeout(() => _saveNow(true), AUTOSAVE_DELAY);
  }

  // ──────────────────────────────────────────────────────────────
  // GUARDAR
  // ──────────────────────────────────────────────────────────────
  function _saveNow(isAuto = false) {
    if (!_current) return;
    clearTimeout(_debounceTimer);
    _syncCurrentFromDOM();

    // Asignar id si es nueva sesión
    if (!_current.id) _current.id = Storage.generateId();

    Storage.saveCornellSession({ ..._current });

    // Actualizar la URL state para que el botón eliminar funcione
    AppState.cornellSessionId = _current.id;

    _setIndicator('saved', isAuto);
  }

  function _setIndicator(state, isAuto = false) {
    const el = document.getElementById('saveIndicator');
    if (!el) return;

    clearTimeout(_saveIndicatorTimer);

    if (state === 'typing') {
      el.textContent = 'Escribiendo…';
      el.className = 'cornell-save-indicator typing';
    } else if (state === 'saved') {
      el.textContent = isAuto ? '✓ Guardado automáticamente' : '✓ Guardado';
      el.className = 'cornell-save-indicator saved';
      _saveIndicatorTimer = setTimeout(() => {
        el.textContent = '';
        el.className = 'cornell-save-indicator';
      }, 2500);
    }
  }

  // ──────────────────────────────────────────────────────────────
  // API PÚBLICA
  // ──────────────────────────────────────────────────────────────
  function _newSheet() {
    // Guardar sesión actual si existe
    if (_current) _saveNow();
    navigate('cornell', { cornellSessionId: null });
  }

  function _deleteSession(id) {
    if (!confirm('¿Eliminar esta hoja Cornell?')) return;
    Storage.deleteCornellSession(id);
    _current = null;
    navigate('cornell-hub');
  }

  // ──────────────────────────────────────────────────────────────
  // UTILIDADES
  // ──────────────────────────────────────────────────────────────
  function _blankSession() {
    return {
      id:        null,
      title:     '',
      date:      new Date().toISOString(),
      cues:      '',
      notes:     '',
      summary:   '',
      updatedAt: new Date().toISOString()
    };
  }

  function _esc(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ── Export ────────────────────────────────────────────────────
  return { renderHub, render, renderList, _newSheet, _saveNow, _deleteSession };

})();
