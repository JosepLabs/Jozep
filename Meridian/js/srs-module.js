'use strict';
/**
 * srs-module.js - Modulo de Repeticion Espaciada para MERIDIAN
 * Implementa el algoritmo SM-2 y gestiona las vistas de estudio y construccion de tarjetas.
 */

// ================================================================
// SM-2 Algorithm
// ================================================================
const SM2 = {
  /**
   * Calcula el nuevo estado SRS de una tarjeta.
   * @param {Object} srs   - Estado SRS actual
   * @param {number} quality - 1=Otra vez, 2=Dificil, 4=Bien, 5=Facil
   * @returns {Object} Nuevo estado SRS + nextMinutes para mostrar en la UI
   */
  calculate(srs, quality) {
    let { interval, repetitions, easeFactor, lapses } = { ...srs };
    let nextMinutes;

    if (quality <= 1) {
      // Otra vez — reaprendizaje casi inmediato (1 minuto)
      repetitions = 0;
      lapses      = (lapses || 0) + 1;
      easeFactor  = Math.max(1.3, easeFactor - 0.2);
      interval    = 0;
      nextMinutes = 1; // 1 minuto: revisión inmediata

    } else if (quality === 2) {
      // Difícil — 6 minutos si es la primera vez; ×1.2 para revisiones ya establecidas
      easeFactor = Math.max(1.3, easeFactor - 0.15);
      if (repetitions === 0) {
        interval    = 0;
        nextMinutes = 6; // 6 minutos
      } else {
        interval    = Math.max(1, Math.ceil(interval * 1.2));
        nextMinutes = interval * 1440;
      }
      repetitions += 1;

    } else {
      // Bien (4) o Fácil (5): SM-2 con pasos de aprendizaje iniciales
      const newEF = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
      easeFactor  = Math.max(1.3, newEF);

      if (repetitions === 0) {
        if (quality === 5) {
          interval    = 1;    // Fácil primera vez → 1 día
          nextMinutes = 1440;
        } else {
          interval    = 0;    // Bien primera vez → 10 minutos
          nextMinutes = 10;
        }
      } else if (repetitions === 1) {
        interval    = 6;
        nextMinutes = 6 * 1440;
      } else {
        interval    = Math.round(interval * easeFactor);
        nextMinutes = interval * 1440;
        if (quality === 5) {
          // Bonus fácil solo en revisiones establecidas
          interval    = Math.round(interval * 1.3);
          nextMinutes = interval * 1440;
        }
      }
      repetitions += 1;
    }

    const nextReviewDate = new Date(Date.now() + nextMinutes * 60000).toISOString();
    const state = repetitions === 0 ? 'relearning' : interval < 2 ? 'learning' : 'review';

    return {
      interval, repetitions, easeFactor, lapses, nextMinutes,
      nextReviewDate, lastReviewDate: new Date().toISOString(), state
    };
  },

  formatInterval(minutes) {
    if (minutes < 60)   return Math.round(minutes) + 'm';
    if (minutes < 1440) return Math.round(minutes / 60) + 'h';
    return Math.round(minutes / 1440) + 'd';
  },

  isDue(card) {
    if (card.srs.state === 'new') return true;
    return new Date(card.srs.nextReviewDate) <= new Date();
  },

  // Vista previa de intervalos para los 4 botones sin mutar el estado
  previewIntervals(srs) {
    return {
      again: this.formatInterval(this.calculate(srs, 1).nextMinutes),
      hard:  this.formatInterval(this.calculate(srs, 2).nextMinutes),
      good:  this.formatInterval(this.calculate(srs, 4).nextMinutes),
      easy:  this.formatInterval(this.calculate(srs, 5).nextMinutes),
    };
  }
};

// ================================================================
// Session State
// ================================================================
let studySession = {
  deckId: null, queue: [], currentIndex: 0,
  startTime: null, reviewed: 0, correct: 0,
};

// ================================================================
// Card Builder View
// ================================================================
const CardBuilder = {
  render(root, deckId, cardId) {
    const deck = Storage.getDeck(deckId);
    if (!deck) { navigate('decks'); return; }

    const card  = cardId ? deck.cards.find(c => c.id === cardId) : null;
    const title = card ? 'Editar Tarjeta' : 'Nueva Tarjeta';

    root.innerHTML = `
      <div class="view-container view-enter">
        <div class="view-header">
          <button class="btn-back" onclick="navigate('cards', { selectedDeckId: '${deckId}' })">
            ${Icons.back} Volver
          </button>
          <h2 class="view-title">${title}</h2>
          <div></div>
        </div>
        <div class="form-container">
          <div class="form-group">
            <label class="form-label" for="cardFront">
              Frente <span class="label-hint">pregunta o concepto</span>
            </label>
            <textarea class="form-textarea" id="cardFront" rows="4"
              placeholder="Escribe la pregunta o concepto...">${card ? this._esc(card.front) : ''}</textarea>
          </div>
          <div class="form-group">
            <label class="form-label" for="cardBack">
              Reverso <span class="label-hint">respuesta o definicion</span>
            </label>
            <textarea class="form-textarea" id="cardBack" rows="5"
              placeholder="Escribe la respuesta o definicion...">${card ? this._esc(card.back) : ''}</textarea>
          </div>
          <div class="form-group">
            <label class="form-label" for="cardTags">
              Etiquetas <span class="label-hint">separadas por coma</span>
            </label>
            <input class="form-input" id="cardTags" type="text"
              placeholder="ej: javascript, fundamentos, async"
              value="${card ? card.tags.join(', ') : ''}">
          </div>
          <div class="form-preview" id="formPreview">
            <div class="preview-label">Vista previa</div>
            <div class="preview-front" id="previewFront">${card ? this._esc(card.front) : 'El frente de tu tarjeta aparecera aqui'}</div>
          </div>
          <div class="form-actions">
            <button class="btn btn-ghost" onclick="navigate('cards', { selectedDeckId: '${deckId}' })">Cancelar</button>
            <button class="btn btn-primary" onclick="CardBuilder.save('${deckId}', '${cardId || ''}')">
              Guardar Tarjeta
            </button>
          </div>
        </div>
      </div>`;

    // Live preview
    const frontEl   = document.getElementById('cardFront');
    const previewEl = document.getElementById('previewFront');
    if (frontEl && previewEl) {
      frontEl.addEventListener('input', () => {
        previewEl.textContent = frontEl.value || 'El frente de tu tarjeta aparecera aqui';
      });
    }
  },

  save(deckId, cardId) {
    const front   = document.getElementById('cardFront').value.trim();
    const back    = document.getElementById('cardBack').value.trim();
    const tagsRaw = document.getElementById('cardTags').value.trim();
    const tags    = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : [];

    if (!front || !back) {
      showToast('El frente y el reverso son obligatorios.', 'error');
      return;
    }

    const deck = Storage.getDeck(deckId);
    if (!deck) return;

    if (cardId) {
      const idx = deck.cards.findIndex(c => c.id === cardId);
      if (idx >= 0) Object.assign(deck.cards[idx], { front, back, tags });
    } else {
      deck.cards.push({
        id: Storage.generateId(), front, back, tags,
        createdAt: new Date().toISOString(),
        srs: { interval: 0, repetitions: 0, easeFactor: 2.5,
               nextReviewDate: new Date().toISOString(), lastReviewDate: null, lapses: 0, state: 'new' }
      });
    }

    deck.updatedAt = new Date().toISOString();
    Storage.saveDeck(deck);
    showToast('Tarjeta guardada correctamente.', 'success');
    navigate('cards', { selectedDeckId: deckId });
  },

  _esc(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
};

// ================================================================
// Study Mode
// ================================================================
const SRSModule = {
  startSession(deckId) {
    const deck = Storage.getDeck(deckId);
    if (!deck || deck.cards.length === 0) {
      showToast('Este mazo no tiene tarjetas. Agrega algunas primero.', 'error');
      return;
    }

    const due = deck.cards.filter(c => SM2.isDue(c));
    if (due.length === 0) {
      showToast('Todo al dia. No hay tarjetas pendientes por ahora.', 'success');
      return;
    }

    studySession = {
      deckId,
      queue:        this._interleavedShuffle(due),
      currentIndex: 0,
      startTime:    Date.now(),
      reviewed:     0,
      correct:      0,
    };

    navigate('study');
  },

  restartSession() {
    studySession.queue        = this._interleavedShuffle([...studySession.queue]);
    studySession.currentIndex = 0;
    studySession.reviewed     = 0;
    studySession.correct      = 0;
    studySession.startTime    = Date.now();
    navigate('study');
  },

  // Practica intercalada: distribuye tarjetas para que no se agrupen por etiqueta
  _interleavedShuffle(cards) {
    const byTag = {};
    cards.forEach(c => {
      const tag = (c.tags && c.tags[0]) || '_sin_etiqueta';
      if (!byTag[tag]) byTag[tag] = [];
      byTag[tag].push(c);
    });

    // Barajar dentro de cada grupo
    Object.values(byTag).forEach(g => {
      for (let i = g.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [g[i], g[j]] = [g[j], g[i]];
      }
    });

    // Intercalar: tomar una de cada grupo en round-robin
    const groups = Object.values(byTag);
    const result = [];
    const maxLen = Math.max(...groups.map(g => g.length));
    for (let i = 0; i < maxLen; i++) {
      groups.forEach(g => { if (i < g.length) result.push(g[i]); });
    }
    return result;
  },

  renderStudy(root) {
    const { queue, currentIndex, reviewed } = studySession;

    if (currentIndex >= queue.length) {
      this._renderComplete(root);
      return;
    }

    const card      = queue[currentIndex];
    const total     = queue.length;
    const progress  = total > 0 ? Math.round((reviewed / total) * 100) : 0;
    const deckName  = Storage.getDeck(studySession.deckId)?.name || 'Estudio';
    const tagLabel  = (card.tags && card.tags[0]) || 'sin etiqueta';

    root.innerHTML = `
      <div class="view-container study-view view-enter">
        <div class="study-header">
          <button class="btn-back" onclick="navigate('decks')">
            ${Icons.exit} Salir
          </button>
          <div class="study-meta">
            <span class="study-deck-name">${deckName}</span>
            <span class="study-count">${reviewed}<span class="study-count-sep">/</span>${total}</span>
          </div>
          <span class="tag tag-accent">${tagLabel}</span>
        </div>

        <div class="study-progress-wrap">
          <div class="study-progress-bar" id="studyProgressBar" style="width: ${progress}%"></div>
        </div>

        <div class="study-area">
          <div class="flashcard-scene">
            <div class="flashcard" id="flashcard" role="button" aria-label="Voltear tarjeta" tabindex="0">
              <div class="flashcard-face front">
                <span class="face-label">Frente</span>
                <p class="face-content" id="faceContent">${card.front}</p>
                ${card.tags.length > 0
                  ? `<div class="card-tags">${card.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>`
                  : ''}
              </div>
              <div class="flashcard-face back">
                <span class="face-label">Respuesta</span>
                <p class="face-content">${card.back}</p>
              </div>
            </div>
          </div>

          <div class="study-actions" id="studyActions">
            <button class="btn btn-reveal" id="revealBtn" onclick="SRSModule.flipCard()">
              Mostrar Respuesta
            </button>
          </div>
        </div>
      </div>`;

    // Flip con teclado (espacio)
    document.getElementById('flashcard').addEventListener('keydown', e => {
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); this.flipCard(); }
    });
  },

  flipCard() {
    const card    = studySession.queue[studySession.currentIndex];
    const fc      = document.getElementById('flashcard');
    const actions = document.getElementById('studyActions');
    if (!fc || !actions) return;

    fc.classList.add('is-flipped');

    // Mostrar botones de evaluacion despues de la animacion
    setTimeout(() => {
      const intervals = SM2.previewIntervals(card.srs);
      actions.innerHTML = `
        <p class="rating-prompt">Como fue tu respuesta?</p>
        <div class="rating-buttons">
          <button class="rating-btn again" onclick="SRSModule.rate(1)">
            <span class="rating-interval">${intervals.again}</span>
            <span class="rating-label">Otra vez</span>
          </button>
          <button class="rating-btn hard" onclick="SRSModule.rate(2)">
            <span class="rating-interval">${intervals.hard}</span>
            <span class="rating-label">Dificil</span>
          </button>
          <button class="rating-btn good" onclick="SRSModule.rate(4)">
            <span class="rating-interval">${intervals.good}</span>
            <span class="rating-label">Bien</span>
          </button>
          <button class="rating-btn easy" onclick="SRSModule.rate(5)">
            <span class="rating-interval">${intervals.easy}</span>
            <span class="rating-label">Facil</span>
          </button>
        </div>`;
      actions.classList.add('visible');
    }, 320);
  },

  rate(quality) {
    const { queue, currentIndex } = studySession;
    const card = queue[currentIndex];
    const deck = Storage.getDeck(studySession.deckId);

    // Actualizar SRS en almacenamiento
    const newSRS    = SM2.calculate(card.srs, quality);
    const deckCard  = deck.cards.find(c => c.id === card.id);
    if (deckCard) deckCard.srs = { ...deckCard.srs, ...newSRS };
    Storage.saveDeck(deck);

    // Actualizar estado de sesion
    studySession.reviewed += 1;
    if (quality >= 3) studySession.correct += 1;
    studySession.currentIndex += 1;

    // Animacion de salida antes de mostrar la siguiente
    const scene = document.querySelector('.flashcard-scene');
    if (scene) {
      scene.classList.add('card-exit');
      setTimeout(() => this.renderStudy(document.getElementById('appRoot')), 200);
    } else {
      this.renderStudy(document.getElementById('appRoot'));
    }
  },

  _renderComplete(root) {
    const { reviewed, correct, startTime, deckId } = studySession;
    const elapsed  = Math.max(1, Math.round((Date.now() - startTime) / 60000));
    const accuracy = reviewed > 0 ? Math.round((correct / reviewed) * 100) : 0;

    Storage.updateStreak();
    Storage.incrementStats(reviewed);
    updateStreakDisplay();

    root.innerHTML = `
      <div class="view-container view-enter">
        <div class="complete-screen">
          <div class="complete-icon">
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
              <circle cx="28" cy="28" r="26" stroke="var(--green)" stroke-width="2"/>
              <path d="M17 28L25 36L39 20" stroke="var(--green)" stroke-width="2.5"
                stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h2 class="complete-title">Sesion Completada</h2>
          <p class="complete-subtitle">Has revisado todas las tarjetas pendientes. Excelente trabajo.</p>

          <div class="complete-stats">
            <div class="stat-item">
              <span class="stat-value">${reviewed}</span>
              <span class="stat-label">Revisadas</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">${correct}</span>
              <span class="stat-label">Correctas</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">${accuracy}%</span>
              <span class="stat-label">Precision</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">${elapsed}m</span>
              <span class="stat-label">Duracion</span>
            </div>
          </div>

          <div class="complete-actions">
            <button class="btn btn-ghost" onclick="SRSModule.restartSession()">Repetir Sesion</button>
            <button class="btn btn-primary" onclick="navigate('decks')">Volver a Mazos</button>
          </div>
        </div>
      </div>`;
  }
};
