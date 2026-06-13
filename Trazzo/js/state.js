/**
 * ====================================================================
 * state.js — Gestión de Estado
 * ====================================================================
 *
 * Fuente única de verdad en tiempo de ejecución de la aplicación.
 * Se exporta como un único objeto (singleton) para que todos los
 * módulos que lo importen compartan la misma referencia y puedan
 * leer/escribir sus propiedades sin recurrir a variables globales
 * del objeto `window`.
 * ==================================================================== */

export const AppState = {
    projects: [],
    currentProjectId: null,
    canvasRef: null,
    defaultTheme: 'light',
    companion: {
        visible: true,
        currentState: 'calm',
        calmSrc: null,
        activeSrc: null
    },
    // Historia para Deshacer / Rehacer
    history: [],
    historyPointer: -1,
    isHistoryLoading: false,
    // Portapapeles interno para Copiar / Pegar
    clipboard: null,
    // Snap a cuadrícula (8 px)
    snapToGrid: false
};
