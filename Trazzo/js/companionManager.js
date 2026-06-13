/**
 * ====================================================================
 * companionManager.js — Asistente Virtual
 * ====================================================================
 *
 * Controla el avatar flotante del asistente: visibilidad, estados
 * (calmo/activo), burbuja de diálogo con frases motivacionales y
 * subida de avatares personalizados en Base64.
 *
 * La configuración (visibilidad y avatares) se persiste de forma
 * asíncrona en IndexedDB a través de StorageModule, lo que permite
 * guardar imágenes de avatar considerablemente más grandes que el
 * límite práctico de ~5MB de localStorage.
 * ==================================================================== */

import { AppState } from './state.js';
import { StorageModule } from './storage.js';

/* ===================================================================
 * CONSTANTES DEL ASISTENTE VIRTUAL
 * =================================================================== */

export const CompanionPlaceholders = {
    CALM: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="68" height="68"><circle cx="32" cy="32" r="30" fill="%236366f1"/><path d="M18 28 h8 m12 0 h8" stroke="%23ffffff" stroke-width="4" stroke-linecap="round"/><path d="M24 44 q8 -2 16 0" fill="none" stroke="%23ffffff" stroke-width="3" stroke-linecap="round"/><circle cx="32" cy="12" r="3" fill="%23ffffff"/></svg>`,
    ACTIVE: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="68" height="68"><circle cx="32" cy="32" r="30" fill="%234f46e5"/><path d="M18 30 q4 -6 8 0 m12 0 q4 -6 8 0" fill="none" stroke="%23ffffff" stroke-width="3.5" stroke-linecap="round"/><path d="M22 42 q10 8 20 0" fill="none" stroke="%23ffffff" stroke-width="4" stroke-linecap="round"/><circle cx="32" cy="12" r="4" fill="%23f43f5e"/></svg>`
};

export const frasesMotivacionales = [
    '¡Tú puedes!', 'Te está quedando bien.', 'Esto tiene futuro.', '¡Qué gran trabajo!',
    'Vamos, que ya casi lo consigues.', 'Vas por muy buen camino.',
    'Confía en tu talento, lo estás logrando.', 'Estás haciendo un esfuerzo increíble.',
    'Cada paso que das cuenta.', '¡Dale un empujón más, tú puedes!', '¡Sigue así!',
    'Esa idea tiene muchísimo potencial.', 'Me encanta cómo estás planteando este concepto.',
    'Una gran app empieza con un gran boceto como este.',
    'Estás resolviendo el problema de forma brillante.',
    'Este wireframe tiene una estructura súper sólida.',
    'Qué buena perspectiva le estás dando al diseño.',
    'Estás sentando las bases de algo increíble.', 'Lo estás logrando.',
    '¡Eso tiene una gran estética visual!', 'Innovar es animarse a probar cosas nuevas.',
    'Al usuario le encantará esta interfaz.', 'Este flujo de pantallas se siente bien.',
    'Qué bien pensadas están las conexiones.', 'Estás puliendo los detalles como un profesional.',
    'La experiencia de usuario se ve impecable.', '¡Qué limpio y ordenado se ve este diseño!',
    'Lograste que lo complejo parezca simple.', 'Estás conectando las ideas de forma excelente.',
    'Se nota que pensaste en el usuario.', 'Esto va a ser un éxito.',
    '¡Impresionante trabajo!', '¡Qué bien se ve!'
];

/* ===================================================================
 * 5. ASISTENTE VIRTUAL
 * =================================================================== */

export const CompanionManager = {
    /** Claves usadas en el object store "settings" de IndexedDB. */
    SETTINGS_KEYS: {
        VISIBLE: 'companion_visible',
        CALM:    'companion_calm',
        ACTIVE:  'companion_active'
    },
    _bubbleTimeoutId: null,

    init: async () => {
        const storedVisible = await StorageModule.getSetting(CompanionManager.SETTINGS_KEYS.VISIBLE, true);
        AppState.companion.visible = storedVisible;

        const storedCalm   = await StorageModule.getSetting(CompanionManager.SETTINGS_KEYS.CALM);
        const storedActive = await StorageModule.getSetting(CompanionManager.SETTINGS_KEYS.ACTIVE);
        AppState.companion.calmSrc   = storedCalm   || CompanionPlaceholders.CALM;
        AppState.companion.activeSrc = storedActive || CompanionPlaceholders.ACTIVE;

        CompanionManager.syncDOMVisibility();
        CompanionManager.setAvatarState('calm');
    },

    setVisibility: (isVisible) => {
        AppState.companion.visible = isVisible;
        StorageModule.setSetting(CompanionManager.SETTINGS_KEYS.VISIBLE, isVisible)
            .catch(err => console.error('Error al guardar visibilidad del compañero:', err));
        CompanionManager.syncDOMVisibility();
    },

    syncDOMVisibility: () => {
        const widget = document.getElementById('companion-container');
        if (!widget) return;
        widget.style.display = AppState.companion.visible ? 'flex' : 'none';
        const td = document.getElementById('toggle-companion-dashboard');
        const te = document.getElementById('toggle-companion-editor');
        if (td) td.checked = AppState.companion.visible;
        if (te) te.checked = AppState.companion.visible;
    },

    setAvatarState: (state) => {
        const avatarImg = document.getElementById('companion-avatar-img');
        if (!avatarImg) return;
        AppState.companion.currentState = state;
        avatarImg.src = state === 'active' ? AppState.companion.activeSrc : AppState.companion.calmSrc;
    },

    triggerSpeechBubble: (text, durationMs = 4000) => {
        const bubble   = document.getElementById('companion-bubble');
        if (!bubble) return;
        const textNode = bubble.querySelector('.companion-floating-widget__text');
        if (textNode) textNode.textContent = text;
        bubble.classList.add('companion-floating-widget__bubble--visible');
        CompanionManager.setAvatarState('active');
        if (CompanionManager._bubbleTimeoutId) clearTimeout(CompanionManager._bubbleTimeoutId);
        CompanionManager._bubbleTimeoutId = setTimeout(() => {
            bubble.classList.remove('companion-floating-widget__bubble--visible');
            CompanionManager.setAvatarState('calm');
            CompanionManager._bubbleTimeoutId = null;
        }, durationMs);
    },

    speakRandomPhrase: () => {
        const bubble     = document.getElementById('companion-bubble');
        const bubbleText = bubble?.querySelector('.companion-floating-widget__text');
        if (!bubble || !bubbleText) return;
        if (CompanionManager._bubbleTimeoutId) clearTimeout(CompanionManager._bubbleTimeoutId);
        CompanionManager.setAvatarState('active');
        bubbleText.textContent = frasesMotivacionales[Math.floor(Math.random() * frasesMotivacionales.length)];
        bubble.classList.add('companion-floating-widget__bubble--visible');
        const delay = Math.floor(Math.random() * 1001) + 4000;
        CompanionManager._bubbleTimeoutId = setTimeout(() => {
            bubble.classList.remove('companion-floating-widget__bubble--visible');
            CompanionManager.setAvatarState('calm');
            CompanionManager._bubbleTimeoutId = null;
        }, delay);
    },

    processAvatarUpload: async (file, type) => {
        if (!file) return;
        // IndexedDB no impone el límite de ~5MB de localStorage, pero
        // mantenemos un tope razonable para no almacenar imágenes
        // innecesariamente pesadas como avatar.
        const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
        if (file.size > MAX_SIZE) { alert('El archivo supera los 5 MB. Sube una versión optimizada.'); return; }
        try {
            const base64Data = await CompanionManager.convertToBase64(file);
            if (type === 'calm') {
                AppState.companion.calmSrc = base64Data;
                await StorageModule.setSetting(CompanionManager.SETTINGS_KEYS.CALM, base64Data);
            } else if (type === 'active') {
                AppState.companion.activeSrc = base64Data;
                await StorageModule.setSetting(CompanionManager.SETTINGS_KEYS.ACTIVE, base64Data);
            }
            if (AppState.companion.currentState === type) CompanionManager.setAvatarState(type);
            CompanionManager.triggerSpeechBubble('¡Me encanta mi nuevo aspecto! Muchas gracias.');
        } catch (error) {
            console.error('Error al procesar avatar Base64:', error);
            alert('No se pudo procesar la imagen. Verifica que el archivo no esté corrupto.');
        }
    },

    convertToBase64: (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload  = (e) => resolve(e.target.result);
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
    })
};
