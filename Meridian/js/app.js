'use strict';
/**
 * app.js - Enrutador principal y vistas del Hub de MERIDIAN
 */

// ================================================================
// Iconos SVG reutilizables
// ================================================================
const Icons = {
  back: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M10 3L5 8L10 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,
  exit: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M4 8H12M4 8L7 5M4 8L7 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,
};

// ================================================================
// Router
// ================================================================
const AppState = {
  currentView:    'hub',
  selectedDeckId: null,
  editingDeckId:  null,
  editingCardId:  null,
};

function navigate(view, params = {}) {
  Object.assign(AppState, params);
  AppState.currentView = view;
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function render() {
  const root = document.getElementById('appRoot');
  switch (AppState.currentView) {
    case 'hub':       renderHub(root);        break;
    case 'settings':  renderSettings(root);   break;
    case 'decks':     renderDeckManager(root); break;
    case 'deck-form': renderDeckForm(root);    break;
    case 'cards':     renderCardList(root);    break;
    case 'card-form':
      CardBuilder.render(root, AppState.selectedDeckId, AppState.editingCardId);
      break;
    case 'study':
      SRSModule.renderStudy(root);
      break;
    case 'mindmap-hub':
      MindMapModule.renderHub(root);
      break;
    case 'mindmap-editor':
      MindMapModule.render(root, 'editor');
      break;
    case 'pq4r-hub':
      PQ4RModule.renderHub(root);
      break;
    case 'pq4r':
      PQ4RModule.render(root, AppState.pq4rSessionId || null);
      break;
    case 'pq4r-list':
      PQ4RModule.renderList(root);
      break;
    case 'cornell-hub':
      CornellModule.renderHub(root);
      break;
    case 'cornell':
      CornellModule.render(root, AppState.cornellSessionId || null);
      break;
    case 'cornell-list':
      CornellModule.renderList(root);
      break;
    case 'feynman-hub':
      FeynmanModule.renderHub(root);
      break;
    case 'feynman':
      FeynmanModule.render(root, 'wizard');
      break;
    case 'feynman-list':
      FeynmanModule.render(root, 'list');
      break;
    default:
      renderHub(root);
  }
}

// ================================================================
// Toast notifications
// ================================================================
function showToast(message, type = 'info') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add('visible'));
  });

  setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ================================================================
// Hub View
// ================================================================
const MODULES = [
  {
    id: 'flashcards', name: 'Active Recall (Flashcards)', subtitle: 'Repetición Espaciada', active: true,
    description: 'Sistema SM-2 de repetición espaciada: memoriza conceptos a largo plazo con evaluación activa y práctica intercalada.',
    icon: `<svg width="30" height="30" viewBox="0 0 30 30" fill="none">
      <rect x="3" y="8" width="21" height="15" rx="3" stroke="currentColor" stroke-width="1.5"/>
      <rect x="6" y="5" width="21" height="15" rx="3" stroke="currentColor" stroke-width="1.5" opacity="0.45"/>
    </svg>`
  },
  {
    id: 'feynman', name: 'Técnica Feynman', subtitle: 'Comprensión Profunda', active: true,
    description: 'Explica cualquier concepto con palabras simples para descubrir qué entiendes de verdad — y qué necesitas reforzar.',
    icon: `<svg width="30" height="30" viewBox="0 0 30 30" fill="none">
      <path d="M7 23V11a2 2 0 012-2h12a2 2 0 012 2v12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M5 23h20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M15 9V5M12 5h6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: 'cornell', name: 'Método Cornell', subtitle: 'Toma de Notas', active: true,
    description: 'Toma de notas estructurada: Claves, Apuntes y Resumen en una hoja organizada para retener más.',
    icon: `<svg width="30" height="30" viewBox="0 0 30 30" fill="none">
      <rect x="4" y="3" width="22" height="27" rx="2" stroke="currentColor" stroke-width="1.5"/>
      <line x1="11" y1="3" x2="11" y2="30" stroke="currentColor" stroke-width="1.5" opacity="0.5"/>
      <line x1="4"  y1="22" x2="26" y2="22" stroke="currentColor" stroke-width="1.5" opacity="0.5"/>
      <line x1="4"  y1="9"  x2="26" y2="9"  stroke="currentColor" stroke-width="1.5" opacity="0.3"/>
    </svg>`
  },
  {
    id: 'pq4r', name: 'Método PQ4R', subtitle: 'Lectura Activa', active: true,
    description: 'Comprensión lectora avanzada: Previsualiza, Pregunta y Procesa en 6 etapas guiadas.',
    icon: `<svg width="30" height="30" viewBox="0 0 30 30" fill="none">
      <path d="M3 15s5-10 12-10 12 10 12 10-5 10-12 10S3 15 3 15z"
        stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
      <circle cx="15" cy="15" r="4" stroke="currentColor" stroke-width="1.5"/>
      <circle cx="15" cy="15" r="1.5" fill="currentColor"/>
    </svg>`
  },
  {
    id: 'mindmaps', name: 'Mapas Mentales', subtitle: 'Pensamiento Visual', active: true,
    description: 'Crea mapas mentales interactivos para organizar y conectar ideas visualmente.',
    icon: `<svg width="30" height="30" viewBox="0 0 30 30" fill="none">
      <circle cx="15" cy="15" r="3" stroke="currentColor" stroke-width="1.5"/>
      <circle cx="6"  cy="8"  r="2.5" stroke="currentColor" stroke-width="1.5"/>
      <circle cx="24" cy="8"  r="2.5" stroke="currentColor" stroke-width="1.5"/>
      <circle cx="6"  cy="22" r="2.5" stroke="currentColor" stroke-width="1.5"/>
      <circle cx="24" cy="22" r="2.5" stroke="currentColor" stroke-width="1.5"/>
      <path d="M12.5 13.5L8.2 10.2M17.5 13.5L21.8 10.2M12.5 16.5L8.2 19.8M17.5 16.5L21.8 19.8"
        stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: 'tests', name: 'Practica de Examen', subtitle: 'Evaluacion Activa', active: false,
    description: 'Simula condiciones de examen con tiempo limitado y preguntas aleatorias de tus mazos.',
    icon: `<svg width="30" height="30" viewBox="0 0 30 30" fill="none">
      <rect x="6" y="3" width="18" height="24" rx="2" stroke="currentColor" stroke-width="1.5"/>
      <path d="M10 10h10M10 14h10M10 18h6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M19 18l2 2 3-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`
  }
];

function renderHub(root) {
  const user   = Storage.getUser();
  const decks  = Storage.getDecks();
  const due    = decks.reduce((sum, d) => sum + d.cards.filter(c => SM2.isDue(c)).length, 0);
  const hour   = new Date().getHours();
  const saludo = hour < 12 ? 'Buenos dias' : hour < 19 ? 'Buenas tardes' : 'Buenas noches';

  root.innerHTML = `
    <div class="view-container hub-view view-enter">
      <div class="hub-hero">
        <p class="hub-greeting-small">${saludo}</p>
        <h1 class="hub-title">Que estudias hoy?</h1>
        ${due > 0
          ? `<button class="due-alert" onclick="navigate('decks')">
               <span class="due-dot"></span>
               ${due} tarjeta${due !== 1 ? 's' : ''} pendiente${due !== 1 ? 's' : ''} de revision
             </button>`
          : decks.length > 0
            ? `<p class="hub-all-good">Todo al dia. Sin tarjetas pendientes.</p>`
            : ''}
      </div>

      <div class="modules-grid">
        ${MODULES.map(mod => `
          <div class="module-card ${mod.active ? 'active' : 'disabled'}" data-id="${mod.id}" role="${mod.active ? 'button' : 'presentation'}" ${mod.active ? 'tabindex="0"' : ''}>
            ${!mod.active ? `<span class="coming-soon-badge">Proximo</span>` : ''}
            <div class="module-icon">${mod.icon}</div>
            <div class="module-info">
              <h3 class="module-name">${mod.name}</h3>
              <p class="module-subtitle">${mod.subtitle}</p>
              <p class="module-desc">${mod.description}</p>
            </div>
            ${mod.active ? `
              <div class="module-arrow">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M5 2.5L9.5 7L5 11.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>` : ''}
          </div>`).join('')}
      </div>

      <div class="hub-stats">
        <div class="hub-stat">
          <span class="hub-stat-value">${user.totalCardsReviewed || 0}</span>
          <span class="hub-stat-label">Tarjetas revisadas</span>
        </div>
        <div class="hub-stat">
          <span class="hub-stat-value">${decks.length}</span>
          <span class="hub-stat-label">Mazos activos</span>
        </div>
        <div class="hub-stat">
          <span class="hub-stat-value">${user.totalSessions || 0}</span>
          <span class="hub-stat-label">Sesiones</span>
        </div>
      </div>
    </div>`;

  // Activar módulos con click
  document.querySelectorAll('.module-card.active').forEach(el => {
    const id = el.dataset.id;
    const handler = () => {
      if (id === 'flashcards')    navigate('decks');
      else if (id === 'feynman')  navigate('feynman-hub');
      else if (id === 'cornell')  navigate('cornell-hub');
      else if (id === 'pq4r')     navigate('pq4r-hub');
      else if (id === 'mindmaps') navigate('mindmap-hub');
      else navigate('hub');
    };
    el.addEventListener('click', handler);
    el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') handler(); });
  });
}

// ================================================================
// Deck Manager View
// ================================================================
function renderDeckManager(root) {
  const decks = Storage.getDecks();

  root.innerHTML = `
    <div class="view-container view-enter">
      <div class="view-header">
        <button class="btn-back" onclick="navigate('hub')">${Icons.back} Hub</button>
        <h2 class="view-title">Mis Mazos</h2>
        <button class="btn btn-primary btn-sm" onclick="navigate('deck-form', { editingDeckId: null })">
          + Nuevo Mazo
        </button>
      </div>

      ${decks.length === 0 ? `
        <div class="empty-state">
          <div class="empty-icon">
            <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
              <rect x="8" y="16" width="36" height="26" rx="4" stroke="var(--text-muted)" stroke-width="1.5"/>
              <rect x="14" y="10" width="36" height="26" rx="4" stroke="var(--text-muted)" stroke-width="1.5" opacity="0.4"/>
              <path d="M26 26v-6M23 23h6" stroke="var(--text-muted)" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </div>
          <h3 class="empty-title">Sin mazos aun</h3>
          <p class="empty-text">Crea tu primer mazo para comenzar a estudiar con repeticion espaciada.</p>
          <button class="btn btn-primary" onclick="navigate('deck-form', { editingDeckId: null })">
            Crear Primer Mazo
          </button>
        </div>
      ` : `
        <div class="decks-grid">
          ${decks.map(deck => _deckCardHTML(deck)).join('')}
        </div>
      `}
    </div>`;
}

function _deckCardHTML(deck) {
  const total    = deck.cards.length;
  const due      = deck.cards.filter(c => SM2.isDue(c)).length;
  const newCount = deck.cards.filter(c => c.srs.state === 'new').length;
  const color    = deck.color || '#4F9CF9';

  return `
    <div class="deck-card" style="--deck-color: ${color}">
      <div class="deck-card-accent"></div>
      <div class="deck-card-body">
        <div class="deck-header">
          <h3 class="deck-name">${deck.name}</h3>
          ${deck.description ? `<p class="deck-desc">${deck.description}</p>` : ''}
        </div>
        <div class="deck-chip-row">
          <span class="deck-chip">${total} tarjeta${total !== 1 ? 's' : ''}</span>
          ${due > 0    ? `<span class="deck-chip chip-due">${due} pendiente${due !== 1 ? 's' : ''}</span>` : ''}
          ${newCount > 0 ? `<span class="deck-chip chip-new">${newCount} nueva${newCount !== 1 ? 's' : ''}</span>` : ''}
        </div>
        <div class="deck-actions">
          <button class="btn btn-primary btn-sm" onclick="SRSModule.startSession('${deck.id}')"
            ${due === 0 ? 'disabled title="Sin tarjetas pendientes"' : ''}>
            ${due === 0 ? 'Al dia' : `Estudiar  ${due}`}
          </button>
          <button class="btn btn-ghost btn-sm" onclick="navigate('cards', { selectedDeckId: '${deck.id}' })">
            Gestionar
          </button>
          <button class="btn btn-ghost btn-sm" onclick="navigate('deck-form', { editingDeckId: '${deck.id}' })">
            Editar
          </button>
          <button class="btn btn-icon btn-ghost btn-sm btn-danger" onclick="deleteDeck('${deck.id}')" title="Eliminar mazo">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 3.5h10M5.5 3.5V2.5a.5.5 0 01.5-.5h2a.5.5 0 01.5.5v1M3.5 3.5l.7 7.5a1 1 0 001 .9h3.6a1 1 0 001-.9l.7-7.5"
                stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>`;
}

function deleteDeck(id) {
  if (!confirm('Eliminar este mazo y todas sus tarjetas? Esta accion no se puede deshacer.')) return;
  Storage.deleteDeck(id);
  renderDeckManager(document.getElementById('appRoot'));
  showToast('Mazo eliminado.', 'info');
}

// ================================================================
// Deck Form View
// ================================================================
const DECK_COLORS = ['#4F9CF9','#3DD68C','#F5A623','#FF6B6B','#A78BFA','#38BDF8','#FB7185','#34D399'];
let _selectedColor = '#4F9CF9';

function renderDeckForm(root) {
  const isEdit = !!AppState.editingDeckId;
  const deck   = isEdit ? Storage.getDeck(AppState.editingDeckId) : null;
  _selectedColor = deck?.color || '#4F9CF9';

  root.innerHTML = `
    <div class="view-container view-enter">
      <div class="view-header">
        <button class="btn-back" onclick="navigate('decks')">${Icons.back} Volver</button>
        <h2 class="view-title">${isEdit ? 'Editar Mazo' : 'Nuevo Mazo'}</h2>
        <div></div>
      </div>
      <div class="form-container">
        <div class="form-group">
          <label class="form-label" for="deckName">Nombre del Mazo</label>
          <input class="form-input" id="deckName" type="text"
            placeholder="ej: JavaScript Avanzado" value="${deck?.name || ''}">
        </div>
        <div class="form-group">
          <label class="form-label" for="deckDesc">
            Descripcion <span class="label-hint">opcional</span>
          </label>
          <input class="form-input" id="deckDesc" type="text"
            placeholder="Describe brevemente el contenido de este mazo"
            value="${deck?.description || ''}">
        </div>
        <div class="form-group">
          <label class="form-label">Color de Acento</label>
          <div class="color-picker">
            ${DECK_COLORS.map(c => `
              <button class="color-swatch ${c === _selectedColor ? 'selected' : ''}"
                style="background: ${c}" data-color="${c}"
                onclick="selectDeckColor('${c}')" aria-label="Color ${c}">
              </button>`).join('')}
          </div>
        </div>
        <div class="form-actions">
          <button class="btn btn-ghost" onclick="navigate('decks')">Cancelar</button>
          <button class="btn btn-primary" onclick="saveDeckForm()">
            ${isEdit ? 'Guardar Cambios' : 'Crear Mazo'}
          </button>
        </div>
      </div>
    </div>`;
}

function selectDeckColor(color) {
  _selectedColor = color;
  document.querySelectorAll('.color-swatch').forEach(s => {
    s.classList.toggle('selected', s.dataset.color === color);
  });
}

function saveDeckForm() {
  const name        = document.getElementById('deckName').value.trim();
  const description = document.getElementById('deckDesc').value.trim();

  if (!name) { showToast('El nombre del mazo es obligatorio.', 'error'); return; }

  const isEdit   = !!AppState.editingDeckId;
  const existing = isEdit ? Storage.getDeck(AppState.editingDeckId) : null;

  Storage.saveDeck({
    id:          existing?.id || Storage.generateId(),
    name, description,
    color:       _selectedColor,
    createdAt:   existing?.createdAt || new Date().toISOString(),
    updatedAt:   new Date().toISOString(),
    cards:       existing?.cards || []
  });

  showToast(isEdit ? 'Mazo actualizado.' : 'Mazo creado con exito.', 'success');
  navigate('decks');
}

// ================================================================
// Card List View
// ================================================================
function renderCardList(root) {
  const deck = Storage.getDeck(AppState.selectedDeckId);
  if (!deck) { navigate('decks'); return; }

  const stateLabels = { new: 'Nueva', learning: 'Aprendiendo', review: 'Revision', relearning: 'Reaprendiendo' };

  root.innerHTML = `
    <div class="view-container view-enter">
      <div class="view-header">
        <button class="btn-back" onclick="navigate('decks')">${Icons.back} Mazos</button>
        <h2 class="view-title">${deck.name}</h2>
        <button class="btn btn-primary btn-sm"
          onclick="navigate('card-form', { selectedDeckId: '${deck.id}', editingCardId: null })">
          + Agregar
        </button>
      </div>

      ${deck.cards.length === 0 ? `
        <div class="empty-state">
          <h3 class="empty-title">Sin tarjetas</h3>
          <p class="empty-text">Este mazo esta vacio. Agrega tu primera tarjeta para empezar a estudiar.</p>
          <button class="btn btn-primary"
            onclick="navigate('card-form', { selectedDeckId: '${deck.id}', editingCardId: null })">
            Agregar Tarjeta
          </button>
        </div>
      ` : `
        <div class="cards-table-wrap">
          <div class="cards-table">
            <div class="table-head">
              <span>Frente</span>
              <span>Etiquetas</span>
              <span>Estado</span>
              <span>Acciones</span>
            </div>
            ${deck.cards.map(card => `
              <div class="table-row">
                <div class="table-cell cell-front">${card.front}</div>
                <div class="table-cell cell-tags">
                  ${card.tags.length > 0
                    ? card.tags.map(t => `<span class="tag">${t}</span>`).join('')
                    : '<span class="text-muted">—</span>'}
                </div>
                <div class="table-cell">
                  <span class="state-badge state-${card.srs.state}">
                    ${stateLabels[card.srs.state] || card.srs.state}
                  </span>
                </div>
                <div class="table-cell cell-actions">
                  <button class="btn btn-ghost btn-xs"
                    onclick="navigate('card-form', { selectedDeckId: '${deck.id}', editingCardId: '${card.id}' })">
                    Editar
                  </button>
                  <button class="btn btn-ghost btn-xs btn-danger"
                    onclick="deleteCard('${deck.id}', '${card.id}')">
                    Eliminar
                  </button>
                </div>
              </div>`).join('')}
          </div>
        </div>
      `}
    </div>`;
}

function deleteCard(deckId, cardId) {
  if (!confirm('Eliminar esta tarjeta?')) return;
  const deck = Storage.getDeck(deckId);
  if (!deck) return;
  deck.cards = deck.cards.filter(c => c.id !== cardId);
  Storage.saveDeck(deck);
  renderCardList(document.getElementById('appRoot'));
  showToast('Tarjeta eliminada.', 'info');
}

// ================================================================
// Header utils
// ================================================================
function updateStreakDisplay() {
  const user = Storage.getUser();
  const el   = document.getElementById('streakCount');
  if (el) el.textContent = user.streak || 0;
}

// ================================================================
// DataEngine — Exportar / Importar / Smart Parse
// ================================================================
const DataEngine = {

  // ── Exportar ─────────────────────────────────────────────────
  exportJSON() {
    const data = Storage.exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `meridian_backup_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  // ── Importar JSON (archivo) ───────────────────────────────────
  importJSON(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => {
        try {
          const parsed = JSON.parse(e.target.result);
          Storage.importAllData(parsed);
          resolve({ ok: true, cards: 0 });
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('No se pudo leer el archivo'));
      reader.readAsText(file);
    });
  },

  // ── Smart Paste — texto plano → flashcards ────────────────────
  /**
   * Detecta dos formatos:
   *   • "Pregunta; Respuesta" (una por línea)
   *   • JSON completo (lo delega a importAllData)
   *
   * @returns {{ type: 'json'|'cards'|'unknown', count: number }}
   */
  parseSmartText(raw) {
    const text = raw.trim();
    if (!text) throw new Error('El campo está vacío');

    // Intentar JSON primero
    try {
      const parsed = JSON.parse(text);
      Storage.importAllData(parsed);
      return { type: 'json', count: 0 };
    } catch { /* no es JSON, continuar */ }

    // Separar líneas no vacías
    const lines = text.split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0);

    if (!lines.length) throw new Error('No se encontraron líneas con contenido');

    // Detectar separador predominante
    const hasSemicolon = lines.filter(l => l.includes(';')).length;
    const hasColon     = lines.filter(l => l.includes(':')).length;
    const sep          = hasSemicolon >= hasColon ? ';' : ':';

    const cards = [];
    const unmatched = [];

    lines.forEach(line => {
      const idx = line.indexOf(sep);
      if (idx > 0 && idx < line.length - 1) {
        const front = line.slice(0, idx).trim();
        const back  = line.slice(idx + 1).trim();
        if (front && back) cards.push({ front, back });
        else unmatched.push(line);
      } else {
        // Sin separador → frente vacío, el texto es el concepto
        if (line.length > 0) cards.push({ front: line, back: '...' });
      }
    });

    if (!cards.length) throw new Error('No se pudieron extraer tarjetas del texto');

    // Crear o encontrar el mazo "Importación Rápida"
    const now   = new Date().toISOString();
    const state = Storage.load();

    let deck = state.decks.find(d => d.name === 'Importación Rápida');
    if (!deck) {
      deck = {
        id:          Storage.generateId(),
        name:        'Importación Rápida',
        description: `Creado automáticamente el ${new Date().toLocaleDateString('es')}`,
        color:       '#4F9CF9',
        createdAt:   now,
        updatedAt:   now,
        cards:       []
      };
      state.decks.push(deck);
    }

    const blankSRS = () => ({
      interval: 0, repetitions: 0, easeFactor: 2.5,
      nextReviewDate: now, lastReviewDate: null, lapses: 0, state: 'new'
    });

    cards.forEach(c => {
      deck.cards.push({
        id:        Storage.generateId(),
        front:     c.front,
        back:      c.back,
        tags:      ['importado'],
        createdAt: now,
        srs:       blankSRS()
      });
    });

    deck.updatedAt = now;
    Storage.save(state);

    return { type: 'cards', count: cards.length };
  }
};

// ================================================================
// Vista de Configuración (Settings)
// ================================================================
function renderSettings(root) {
  root.innerHTML = `
    <div class="view-container settings-view view-enter">

      <div class="view-header">
        <button class="btn-back" onclick="navigate('hub')">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M10 3L5 8L10 13" stroke="currentColor" stroke-width="1.5"
              stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Hub
        </button>
        <h1 class="view-title">Configuración</h1>
        <span></span>
      </div>

      <!-- ── Exportar ── -->
      <section class="settings-section">
        <div class="settings-section-header">
          <div class="settings-section-icon">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M10 3v9M7 9l3 3 3-3" stroke="currentColor" stroke-width="1.6"
                stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M3 14v1.5A1.5 1.5 0 004.5 17h11a1.5 1.5 0 001.5-1.5V14"
                stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
            </svg>
          </div>
          <div>
            <h2 class="settings-section-title">Exportar datos</h2>
            <p class="settings-section-desc">
              Descarga una copia de seguridad completa en formato JSON que incluye
              mazos, tarjetas, sesiones Feynman, notas Cornell, sesiones PQ4R y mapas mentales.
            </p>
          </div>
        </div>
        <div class="settings-action-row">
          <button class="btn btn-primary" onclick="DataEngine.exportJSON()">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M7 1.5v7M4.5 6l2.5 2.5L9.5 6M2 10.5v1A.5.5 0 002.5 12h9a.5.5 0 00.5-.5v-1"
                stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                stroke-linejoin="round"/>
            </svg>
            Descargar meridian_backup.json
          </button>
          <span class="settings-meta" id="exportMeta">
            ${_getExportMeta()}
          </span>
        </div>
      </section>

      <div class="settings-divider"></div>

      <!-- ── Importar: Modo Pro ── -->
      <section class="settings-section">
        <div class="settings-section-header">
          <div class="settings-section-icon settings-icon-pro">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M10 14V5M7 8l3-3 3 3" stroke="currentColor" stroke-width="1.6"
                stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M3 14v1.5A1.5 1.5 0 004.5 17h11a1.5 1.5 0 001.5-1.5V14"
                stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
            </svg>
          </div>
          <div>
            <h2 class="settings-section-title">Importar archivo JSON <span class="settings-badge">Pro</span></h2>
            <p class="settings-section-desc">
              Restaura desde un archivo <code>.json</code> previamente exportado.
              <strong>Reemplaza todos tus datos actuales.</strong>
            </p>
          </div>
        </div>

        <div class="settings-dropzone" id="settingsDropzone"
          role="button" tabindex="0" aria-label="Área de arrastre para importar JSON">
          <div class="sdz-inner">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <path d="M16 20V10M12 14l4-4 4 4" stroke="currentColor" stroke-width="1.8"
                stroke-linecap="round" stroke-linejoin="round"/>
              <rect x="4" y="4" width="24" height="24" rx="4"
                stroke="currentColor" stroke-width="1.5" stroke-dasharray="4 3"/>
            </svg>
            <p class="sdz-text">Arrastra tu archivo aquí o <label class="sdz-link" for="jsonFileInput">selecciona uno</label></p>
            <p class="sdz-hint">Solo archivos <code>.json</code> exportados desde MERIDIAN</p>
          </div>
          <input type="file" id="jsonFileInput" accept=".json,application/json"
            class="sdz-file-input" aria-label="Seleccionar archivo JSON"/>
        </div>

        <div class="settings-import-status" id="jsonImportStatus" aria-live="polite"></div>
      </section>

      <div class="settings-divider"></div>

      <!-- ── Importar: Smart Paste ── -->
      <section class="settings-section">
        <div class="settings-section-header">
          <div class="settings-section-icon settings-icon-simple">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M4 6h12M4 10h8M4 14h5" stroke="currentColor" stroke-width="1.6"
                stroke-linecap="round"/>
            </svg>
          </div>
          <div>
            <h2 class="settings-section-title">Smart Paste <span class="settings-badge settings-badge-green">Rápido</span></h2>
            <p class="settings-section-desc">
              Pega texto, una lista o JSON directamente. MERIDIAN detectará el formato automáticamente.
            </p>
          </div>
        </div>

        <!-- Ejemplos de formato -->
        <div class="settings-format-hints">
          <div class="sfh-item">
            <code class="sfh-code">Pregunta; Respuesta</code>
            <span class="sfh-label">→ Crea flashcards</span>
          </div>
          <div class="sfh-item">
            <code class="sfh-code">Concepto: Definición</code>
            <span class="sfh-label">→ Crea flashcards</span>
          </div>
          <div class="sfh-item">
            <code class="sfh-code">{ "version": 2, … }</code>
            <span class="sfh-label">→ Restaura backup</span>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="smartPasteArea">
            Pega tu contenido aquí
          </label>
          <textarea id="smartPasteArea" class="settings-paste-area"
            placeholder="Pega texto, JSON o una lista de preguntas y respuestas…&#10;&#10;Ejemplo:&#10;¿Qué es una función pura?; Una función sin efectos secundarios&#10;¿Qué es un closure?; Una función que recuerda su scope externo&#10;¿Qué es el prototipado?; Mecanismo de herencia en JavaScript"
            rows="10" spellcheck="false"></textarea>
        </div>

        <div class="settings-action-row">
          <button class="btn btn-primary" id="smartPasteBtn" onclick="SettingsController.runSmartPaste()">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M2 7l4 4 6-6" stroke="currentColor" stroke-width="1.6"
                stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Procesar e importar
          </button>
          <button class="btn btn-ghost btn-sm" onclick="document.getElementById('smartPasteArea').value=''">
            Limpiar
          </button>
        </div>

        <div class="settings-import-status" id="pasteImportStatus" aria-live="polite"></div>
      </section>

      <div class="settings-divider"></div>

      <!-- ── Zona peligrosa ── -->
      <section class="settings-section settings-danger-zone">
        <h2 class="settings-section-title settings-danger-title">Zona peligrosa</h2>
        <div class="settings-action-row">
          <button class="btn btn-danger btn-sm" onclick="SettingsController.clearAllData()">
            Borrar todos los datos
          </button>
          <span class="settings-meta">Esta acción es irreversible y no se puede deshacer.</span>
        </div>
      </section>

    </div>`;

  _bindSettingsEvents();
}

function _getExportMeta() {
  const decks = Storage.getDecks();
  const cards = decks.reduce((s, d) => s + d.cards.length, 0);
  const maps  = MindMapStorage.getMindMaps().length;
  const feyn  = Storage.getFeynmanSessions().length;
  const corn  = Storage.getCornellSessions().length;
  const pq4r  = Storage.getPQ4RSessions().length;
  return `${decks.length} mazos · ${cards} tarjetas · ${maps} mapas · ${feyn + corn + pq4r} sesiones`;
}

function _bindSettingsEvents() {
  // ── Dropzone ──
  const dropzone  = document.getElementById('settingsDropzone');
  const fileInput = document.getElementById('jsonFileInput');

  if (dropzone && fileInput) {
    dropzone.addEventListener('dragover', e => {
      e.preventDefault();
      dropzone.classList.add('drag-over');
    });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('drag-over'));
    dropzone.addEventListener('drop', e => {
      e.preventDefault();
      dropzone.classList.remove('drag-over');
      const file = e.dataTransfer.files[0];
      if (file) SettingsController.handleJSONFile(file);
    });
    dropzone.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') fileInput.click();
    });
    fileInput.addEventListener('change', () => {
      if (fileInput.files[0]) SettingsController.handleJSONFile(fileInput.files[0]);
    });
  }
}

// Controlador de settings (funciones llamadas desde onclick inline)
const SettingsController = {

  handleJSONFile(file) {
    if (!file.name.endsWith('.json') && file.type !== 'application/json') {
      this._setStatus('jsonImportStatus', 'error', 'Solo se aceptan archivos .json');
      return;
    }

    if (!confirm('⚠️ Esta acción reemplazará todos tus datos actuales con los del archivo.\n¿Deseas continuar?')) return;

    this._setStatus('jsonImportStatus', 'loading', 'Procesando archivo…');

    DataEngine.importJSON(file)
      .then(() => {
        this._setStatus('jsonImportStatus', 'success', '✓ Importación exitosa. Recargando…');
        setTimeout(() => window.location.reload(), 1200);
      })
      .catch(err => {
        this._setStatus('jsonImportStatus', 'error', `✗ Error: ${err.message}`);
      });
  },

  runSmartPaste() {
    const ta  = document.getElementById('smartPasteArea');
    const raw = ta ? ta.value : '';

    if (!raw.trim()) {
      this._setStatus('pasteImportStatus', 'error', 'El área está vacía');
      return;
    }

    // Si parece JSON, pedir confirmación de reemplazo
    const looksLikeJSON = raw.trim().startsWith('{') || raw.trim().startsWith('[');
    if (looksLikeJSON) {
      if (!confirm('⚠️ Esta acción reemplazará todos tus datos actuales.\n¿Deseas continuar?')) return;
    }

    try {
      const result = DataEngine.parseSmartText(raw);
      if (result.type === 'json') {
        this._setStatus('pasteImportStatus', 'success', '✓ JSON importado. Recargando…');
        setTimeout(() => window.location.reload(), 1200);
      } else {
        this._setStatus('pasteImportStatus', 'success',
          `✓ ${result.count} tarjeta${result.count !== 1 ? 's' : ''} añadida${result.count !== 1 ? 's' : ''} al mazo "Importación Rápida"`);
        // Actualizar meta de exportación
        const meta = document.getElementById('exportMeta');
        if (meta) meta.textContent = _getExportMeta();
      }
    } catch (err) {
      this._setStatus('pasteImportStatus', 'error', `✗ ${err.message}`);
    }
  },

  clearAllData() {
    if (!confirm('⚠️ ¿Borrar absolutamente todos tus datos?\nEsta acción NO se puede deshacer.')) return;
    localStorage.clear();
    window.location.reload();
  },

  _setStatus(elId, type, msg) {
    const el = document.getElementById(elId);
    if (!el) return;
    el.className = `settings-import-status ${type}`;
    el.textContent = msg;
  }
};

// ================================================================
// Init
// ================================================================
document.addEventListener('DOMContentLoaded', () => {
  Storage.seedDemoData();

  // Aplicar tema guardado
  const theme = Storage.getSettings().theme || 'dark';
  document.documentElement.setAttribute('data-theme', theme);
  _syncThemeSwitch(theme);

  // Switch de tema — 3 casillas con selección directa
  document.getElementById('themeSwitch').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-theme-btn]');
    if (!btn) return;
    const next = btn.dataset.themeBtn;
    document.documentElement.setAttribute('data-theme', next);
    Storage.updateSettings({ theme: next });
    _syncThemeSwitch(next);
  });

  updateStreakDisplay();
  render();
});

// Marca como activa la casilla que corresponde al tema actual
function _syncThemeSwitch(theme) {
  document.querySelectorAll('[data-theme-btn]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.themeBtn === theme);
  });
}
