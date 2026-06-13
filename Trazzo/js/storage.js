/**
 * ====================================================================
 * storage.js — Módulo de Almacenamiento (IndexedDB)
 * ====================================================================
 *
 * Capa de persistencia asíncrona basada en IndexedDB. Sustituye al
 * antiguo esquema de localStorage (limitado a ~5MB y síncrono) por
 * una base de datos local que permite:
 *
 *  - Guardar cada proyecto como un registro independiente en el
 *    object store "projects", de modo que proyectos con canvasData
 *    muy pesado (imágenes, historiales de wireframes, etc.) no
 *    compitan por el mismo límite de tamaño.
 *  - Guardar configuraciones de usuario (tema, visibilidad y avatares
 *    del asistente, etc.) en el object store "settings" como pares
 *    clave/valor de cualquier tamaño.
 *  - Migrar automáticamente, una sola vez, los datos que existieran
 *    previamente en localStorage (versiones anteriores de la app).
 *
 * Todas las operaciones públicas son asíncronas (devuelven Promesas)
 * y no dependen de ningún otro módulo de la aplicación.
 * ==================================================================== */

const DB_NAME    = 'trazzo_db';
const DB_VERSION = 1;

const STORE_PROJECTS = 'projects';
const STORE_SETTINGS = 'settings';

// Claves heredadas de la implementación anterior basada en localStorage,
// usadas únicamente para la migración inicial.
const LEGACY_KEYS = {
    PROJECTS:         'mi_spa_proyectos',
    THEME:            'trazzo_default_theme',
    COMPANION_VISIBLE: 'companion_visible',
    COMPANION_CALM:    'companion_calm',
    COMPANION_ACTIVE:  'companion_active'
};

const MIGRATION_FLAG = '__migrated_from_localStorage_v1';

/** Convierte un IDBRequest en una Promesa que resuelve con `request.result`. */
function requestToPromise(request) {
    return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror   = () => reject(request.error);
    });
}

/** Resuelve cuando una transacción completa por completo (o rechaza si falla). */
function txDone(tx) {
    return new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror    = () => reject(tx.error);
        tx.onabort    = () => reject(tx.error);
    });
}

export const StorageModule = {
    /** Propiedades personalizadas que Fabric.js debe (de)serializar junto al canvas. */
    CUSTOM_PROPERTIES: ['id', 'customType', 'fromId', 'toId', 'arrowId', 'selectable', 'evented'],

    _dbPromise: null,

    /**
     * Abre (o crea) la base de datos IndexedDB. La promesa se memoiza,
     * por lo que la conexión solo se establece una vez y la creación
     * de los object stores / migración solo ocurre en la primera
     * llamada de toda la sesión.
     */
    _openDB() {
        if (!this._dbPromise) {
            this._dbPromise = new Promise((resolve, reject) => {
                const request = indexedDB.open(DB_NAME, DB_VERSION);

                request.onupgradeneeded = (event) => {
                    const db = event.target.result;
                    if (!db.objectStoreNames.contains(STORE_PROJECTS)) {
                        db.createObjectStore(STORE_PROJECTS, { keyPath: 'id' });
                    }
                    if (!db.objectStoreNames.contains(STORE_SETTINGS)) {
                        db.createObjectStore(STORE_SETTINGS, { keyPath: 'key' });
                    }
                };

                request.onsuccess = () => resolve(request.result);
                request.onerror   = () => reject(request.error);
            }).then(async (db) => {
                await StorageModule._migrateFromLocalStorage(db);
                return db;
            });
        }
        return this._dbPromise;
    },

    /**
     * Migración única: si existen datos de versiones anteriores en
     * localStorage y todavía no se ha migrado, los copia a IndexedDB
     * y limpia las claves antiguas para liberar espacio.
     */
    async _migrateFromLocalStorage(db) {
        try {
            const alreadyMigrated = await new Promise((resolve, reject) => {
                const tx    = db.transaction(STORE_SETTINGS, 'readonly');
                const store = tx.objectStore(STORE_SETTINGS);
                requestToPromise(store.get(MIGRATION_FLAG)).then(resolve, reject);
            });
            if (alreadyMigrated) return;

            const writes = [];

            // Proyectos
            const rawProjects = localStorage.getItem(LEGACY_KEYS.PROJECTS);
            if (rawProjects) {
                try {
                    const projects = JSON.parse(rawProjects);
                    if (Array.isArray(projects)) {
                        projects.forEach(project => {
                            if (project && project.id) writes.push({ store: STORE_PROJECTS, value: project });
                        });
                    }
                } catch (e) {
                    console.error('Error al migrar proyectos desde localStorage:', e);
                }
            }

            // Configuraciones simples
            const theme = localStorage.getItem(LEGACY_KEYS.THEME);
            if (theme) writes.push({ store: STORE_SETTINGS, value: { key: 'theme', value: theme } });

            const companionVisible = localStorage.getItem(LEGACY_KEYS.COMPANION_VISIBLE);
            if (companionVisible !== null) {
                try {
                    writes.push({ store: STORE_SETTINGS, value: { key: 'companion_visible', value: JSON.parse(companionVisible) } });
                } catch (e) { /* valor inválido, se ignora */ }
            }

            const companionCalm = localStorage.getItem(LEGACY_KEYS.COMPANION_CALM);
            if (companionCalm) writes.push({ store: STORE_SETTINGS, value: { key: 'companion_calm', value: companionCalm } });

            const companionActive = localStorage.getItem(LEGACY_KEYS.COMPANION_ACTIVE);
            if (companionActive) writes.push({ store: STORE_SETTINGS, value: { key: 'companion_active', value: companionActive } });

            if (writes.length > 0) {
                const tx = db.transaction([STORE_PROJECTS, STORE_SETTINGS], 'readwrite');
                writes.forEach(({ store, value }) => tx.objectStore(store).put(value));
                tx.objectStore(STORE_SETTINGS).put({ key: MIGRATION_FLAG, value: true });
                await txDone(tx);
            } else {
                const tx = db.transaction(STORE_SETTINGS, 'readwrite');
                tx.objectStore(STORE_SETTINGS).put({ key: MIGRATION_FLAG, value: true });
                await txDone(tx);
            }

            // Limpiar las claves antiguas una vez migradas
            Object.values(LEGACY_KEYS).forEach(key => {
                try { localStorage.removeItem(key); } catch (e) { /* noop */ }
            });
        } catch (error) {
            console.error('Error durante la migración desde localStorage:', error);
        }
    },

    /* ── Proyectos ──────────────────────────────────────────────── */

    /** Devuelve todos los proyectos almacenados. */
    async getAllProjects() {
        try {
            const db    = await this._openDB();
            const tx    = db.transaction(STORE_PROJECTS, 'readonly');
            const store = tx.objectStore(STORE_PROJECTS);
            return await requestToPromise(store.getAll());
        } catch (error) {
            console.error('Error al leer proyectos de IndexedDB:', error);
            return [];
        }
    },

    /** Crea o actualiza (upsert) un único proyecto. */
    async saveProject(project) {
        try {
            const db = await this._openDB();
            const tx = db.transaction(STORE_PROJECTS, 'readwrite');
            tx.objectStore(STORE_PROJECTS).put(project);
            await txDone(tx);
        } catch (error) {
            console.error('Error al guardar el proyecto en IndexedDB:', error);
        }
    },

    /** Elimina un proyecto por su id. */
    async deleteProject(id) {
        try {
            const db = await this._openDB();
            const tx = db.transaction(STORE_PROJECTS, 'readwrite');
            tx.objectStore(STORE_PROJECTS).delete(id);
            await txDone(tx);
        } catch (error) {
            console.error('Error al eliminar el proyecto de IndexedDB:', error);
        }
    },

    /* ── Configuración genérica (tema, asistente, etc.) ────────────── */

    /** Lee una configuración por clave; devuelve `defaultValue` si no existe. */
    async getSetting(key, defaultValue = null) {
        try {
            const db     = await this._openDB();
            const tx     = db.transaction(STORE_SETTINGS, 'readonly');
            const store  = tx.objectStore(STORE_SETTINGS);
            const record = await requestToPromise(store.get(key));
            return record ? record.value : defaultValue;
        } catch (error) {
            console.error(`Error al leer la configuración "${key}" de IndexedDB:`, error);
            return defaultValue;
        }
    },

    /** Guarda (o sobrescribe) una configuración por clave. */
    async setSetting(key, value) {
        try {
            const db = await this._openDB();
            const tx = db.transaction(STORE_SETTINGS, 'readwrite');
            tx.objectStore(STORE_SETTINGS).put({ key, value });
            await txDone(tx);
        } catch (error) {
            console.error(`Error al guardar la configuración "${key}" en IndexedDB:`, error);
        }
    }
};
