'use strict';
/**
 * storage.js - Capa de datos para MERIDIAN Learning Hub
 *
 * Estructura JSON en localStorage (clave: "meridian_v1"):
 * {
 *   user: {
 *     name: string,
 *     streak: number,              // dias consecutivos estudiados
 *     lastStudyDate: ISO string,   // ultima fecha de estudio
 *     totalCardsReviewed: number,  // acumulado historico
 *     totalSessions: number,       // sesiones completadas
 *     createdAt: ISO string
 *   },
 *   decks: [
 *     {
 *       id: string,
 *       name: string,
 *       description: string,
 *       color: string,             // color de acento del mazo (hex)
 *       createdAt: ISO string,
 *       updatedAt: ISO string,
 *       cards: [
 *         {
 *           id: string,
 *           front: string,         // pregunta o concepto
 *           back: string,          // respuesta o definicion
 *           tags: string[],        // etiquetas para practica intercalada
 *           createdAt: ISO string,
 *           srs: {
 *             interval: number,          // dias hasta proxima revision
 *             repetitions: number,       // respuestas correctas consecutivas
 *             easeFactor: number,        // factor de facilidad SM-2 (min 1.3, default 2.5)
 *             nextReviewDate: ISO string,
 *             lastReviewDate: ISO string | null,
 *             lapses: number,            // veces olvidada (boton "Otra vez")
 *             state: 'new' | 'learning' | 'review' | 'relearning'
 *           }
 *         }
 *       ]
 *     }
 *   ],
 *   settings: {
 *     theme: 'dark' | 'light',
 *     newCardsPerDay: number,
 *     maxReviewsPerDay: number
 *   }
 * }
 */

const STORAGE_KEY = 'meridian_v1';

const DEFAULT_STATE = {
  user: {
    name: 'Estudiante',
    streak: 0,
    lastStudyDate: null,
    totalCardsReviewed: 0,
    totalSessions: 0,
    createdAt: new Date().toISOString()
  },
  decks: [],
  settings: {
    theme: 'dark',
    newCardsPerDay: 20,
    maxReviewsPerDay: 150
  },
  modules: {
    feynman_technique: { sessions: [] },
    cornell_notes:     { sessions: [] },
    pq4r:              { sessions: [] }
  }
};

const Storage = {
  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return this._clone(DEFAULT_STATE);
      return JSON.parse(raw);
    } catch {
      return this._clone(DEFAULT_STATE);
    }
  },

  save(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return true;
    } catch {
      return false;
    }
  },

  getUser()     { return this.load().user; },
  getSettings() { return this.load().settings; },
  getDecks()    { return this.load().decks; },

  getDeck(id) {
    return this.getDecks().find(d => d.id === id) || null;
  },

  saveDeck(deck) {
    const state = this.load();
    const idx = state.decks.findIndex(d => d.id === deck.id);
    if (idx >= 0) state.decks[idx] = deck;
    else state.decks.push(deck);
    this.save(state);
    return deck;
  },

  deleteDeck(id) {
    const state = this.load();
    state.decks = state.decks.filter(d => d.id !== id);
    this.save(state);
  },

  updateUser(updates) {
    const state = this.load();
    Object.assign(state.user, updates);
    this.save(state);
    return state.user;
  },

  updateSettings(updates) {
    const state = this.load();
    Object.assign(state.settings, updates);
    this.save(state);
  },

  updateStreak() {
    const state = this.load();
    const today     = new Date().toDateString();
    const last      = state.user.lastStudyDate ? new Date(state.user.lastStudyDate).toDateString() : null;
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    if (last === today) return state.user.streak;
    state.user.streak       = (last === yesterday) ? state.user.streak + 1 : 1;
    state.user.lastStudyDate = new Date().toISOString();
    this.save(state);
    return state.user.streak;
  },

  incrementStats(cardCount = 1) {
    const state = this.load();
    state.user.totalCardsReviewed = (state.user.totalCardsReviewed || 0) + cardCount;
    state.user.totalSessions      = (state.user.totalSessions || 0) + 1;
    this.save(state);
  },

  // ── Feynman Technique ──────────────────────────────────────────

  getFeynmanSessions() {
    const state = this.load();
    return (state.modules?.feynman_technique?.sessions) || [];
  },

  saveFeynmanSession(session) {
    const state = this.load();
    if (!state.modules) state.modules = {};
    if (!state.modules.feynman_technique) state.modules.feynman_technique = { sessions: [] };
    const sessions = state.modules.feynman_technique.sessions;
    const idx = sessions.findIndex(s => s.id === session.id);
    if (idx >= 0) sessions[idx] = session;
    else sessions.unshift(session); // más reciente primero
    this.save(state);
    return session;
  },

  deleteFeynmanSession(id) {
    const state = this.load();
    if (!state.modules?.feynman_technique?.sessions) return;
    state.modules.feynman_technique.sessions =
      state.modules.feynman_technique.sessions.filter(s => s.id !== id);
    this.save(state);
  },

  // ── Cornell Notes ──────────────────────────────────────────────

  getCornellSessions() {
    const state = this.load();
    return state.modules?.cornell_notes?.sessions || [];
  },

  saveCornellSession(session) {
    const state = this.load();
    if (!state.modules) state.modules = {};
    if (!state.modules.cornell_notes) state.modules.cornell_notes = { sessions: [] };
    const sessions = state.modules.cornell_notes.sessions;
    const idx = sessions.findIndex(s => s.id === session.id);
    if (idx >= 0) sessions[idx] = session;
    else sessions.unshift(session);
    this.save(state);
    return session;
  },

  deleteCornellSession(id) {
    const state = this.load();
    if (!state.modules?.cornell_notes?.sessions) return;
    state.modules.cornell_notes.sessions =
      state.modules.cornell_notes.sessions.filter(s => s.id !== id);
    this.save(state);
  },

  // ── PQ4R ──────────────────────────────────────────────────────

  getPQ4RSessions() {
    return this.load().modules?.pq4r?.sessions || [];
  },

  savePQ4RSession(session) {
    const state = this.load();
    if (!state.modules)       state.modules = {};
    if (!state.modules.pq4r)  state.modules.pq4r = { sessions: [] };
    const sessions = state.modules.pq4r.sessions;
    const idx = sessions.findIndex(s => s.id === session.id);
    if (idx >= 0) sessions[idx] = session;
    else sessions.unshift(session);
    this.save(state);
    return session;
  },

  deletePQ4RSession(id) {
    const state = this.load();
    if (!state.modules?.pq4r?.sessions) return;
    state.modules.pq4r.sessions =
      state.modules.pq4r.sessions.filter(s => s.id !== id);
    this.save(state);
  },

  // ── Backup / Restore ──────────────────────────────────────────

  exportAllData() {
    return {
      version:   2,
      exportedAt: new Date().toISOString(),
      meridian:   this.load(),
      maps:       MindMapStorage.getMindMaps()
    };
  },

  importAllData(dataObj) {
    // Validación estructural antes de sobreescribir
    if (!dataObj || typeof dataObj !== 'object') throw new Error('Formato inválido');
    if (!dataObj.meridian || typeof dataObj.meridian !== 'object')
      throw new Error('Falta el bloque "meridian"');
    if (!Array.isArray(dataObj.meridian.decks))
      throw new Error('El campo "decks" debe ser un array');

    // Guardar bloque principal
    this.save(dataObj.meridian);

    // Guardar mapas mentales si existen
    if (Array.isArray(dataObj.maps)) {
      localStorage.setItem(MM_KEY, JSON.stringify(dataObj.maps));
    }
  },

  generateId() {    return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
  },

  _clone(obj) { return JSON.parse(JSON.stringify(obj)); },

  // Carga un mazo de ejemplo en el primer uso
  seedDemoData() {
    if (this.getDecks().length > 0) return;
    const now = new Date().toISOString();

    const mkCard = (front, back, tags) => ({
      id: this.generateId(), front, back, tags,
      createdAt: now,
      srs: { interval: 0, repetitions: 0, easeFactor: 2.5,
             nextReviewDate: now, lastReviewDate: null, lapses: 0, state: 'new' }
    });

    this.saveDeck({
      id:          this.generateId(),
      name:        'JavaScript Fundamentos',
      description: 'Conceptos esenciales de JS para desarrollo web moderno',
      color:       '#4F9CF9',
      createdAt:   now,
      updatedAt:   now,
      cards: [
        mkCard('Que es una Promesa en JavaScript?',
               'Un objeto que representa la eventual completacion o fallo de una operacion asincrona. Estados posibles: pending, fulfilled, rejected.',
               ['async', 'es6']),
        mkCard('Diferencia entre let, const y var?',
               'var: scope de funcion, re-declarable. let: scope de bloque, no re-declarable. const: scope de bloque, su referencia no puede ser reasignada.',
               ['fundamentos', 'scope']),
        mkCard('Que es el Event Loop?',
               'Mecanismo que hace a JS no-bloqueante. Procesa la call stack, la task queue y la microtask queue para gestionar operaciones asincronas.',
               ['runtime', 'async']),
        mkCard('Que es Big O notation O(n)?',
               'Complejidad lineal: el tiempo crece proporcionalmente al tamano de la entrada. Si n se duplica, el tiempo de ejecucion tambien lo hace.',
               ['algoritmos', 'complejidad']),
        mkCard('Que es una funcion pura?',
               'Funcion que: 1) siempre devuelve el mismo resultado para los mismos argumentos, y 2) no tiene efectos secundarios (side effects). Clave en programacion funcional.',
               ['funcional', 'fundamentos']),
        mkCard('Que es un Closure?',
               'Una funcion que recuerda el scope en el que fue creada, incluso cuando ese scope ya no esta activo. Permite encapsulamiento y creacion de datos privados.',
               ['scope', 'avanzado']),
        mkCard('Diferencia entre == y === en JS?',
               '== compara valores con coercion de tipo implicita. === compara valor Y tipo sin coercion. Siempre preferir === para evitar comportamientos inesperados.',
               ['fundamentos', 'operadores']),
        mkCard('Que es el prototype chain?',
               'Mecanismo de herencia en JS. Al buscar una propiedad en un objeto, si no existe, JS busca en su prototipo y sigue la cadena hasta llegar a null.',
               ['poo', 'avanzado']),
      ]
    });
  }
};

// ── MindMap — clave separada para no interferir con el estado principal ──
const MM_KEY = 'meridian_v1_maps';

const MindMapStorage = {
  getMindMaps() {
    try {
      const raw = localStorage.getItem(MM_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  },

  saveMindMap(map) {
    try {
      const maps = this.getMindMaps();
      const idx  = maps.findIndex(m => m.id === map.id);
      if (idx >= 0) maps[idx] = map;
      else          maps.unshift(map);
      localStorage.setItem(MM_KEY, JSON.stringify(maps));
      return map;
    } catch { return null; }
  },

  deleteMindMap(id) {
    try {
      const maps = this.getMindMaps().filter(m => m.id !== id);
      localStorage.setItem(MM_KEY, JSON.stringify(maps));
    } catch {}
  }
};
