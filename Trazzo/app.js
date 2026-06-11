/**
 * ====================================================================
 * APP.JS — SPA Wireframing Tool con Asistente Virtual
 * ====================================================================
 *
 * Arquitectura de módulos:
 *  1. AppState          — Fuente única de verdad en tiempo de ejecución
 *  2. StorageModule     — Persistencia en localStorage
 *  3. ProjectManager    — Lógica de negocio + I/O (export/import)
 *  4. CanvasManager     — Motor gráfico Fabric.js
 *  5. CompanionManager  — Asistente virtual flotante
 *  6. UIController      — Controlador de interfaz y navegación
 * ====================================================================
 */

/* ===================================================================
 * 1. ESTADO GLOBAL
 * =================================================================== */

const AppState = {
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
    clipboard: null
};

/* ===================================================================
 * CONSTANTES DEL ASISTENTE VIRTUAL
 * =================================================================== */

const CompanionPlaceholders = {
    CALM: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="68" height="68"><circle cx="32" cy="32" r="30" fill="%236366f1"/><path d="M18 28 h8 m12 0 h8" stroke="%23ffffff" stroke-width="4" stroke-linecap="round"/><path d="M24 44 q8 -2 16 0" fill="none" stroke="%23ffffff" stroke-width="3" stroke-linecap="round"/><circle cx="32" cy="12" r="3" fill="%23ffffff"/></svg>`,
    ACTIVE: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="68" height="68"><circle cx="32" cy="32" r="30" fill="%234f46e5"/><path d="M18 30 q4 -6 8 0 m12 0 q4 -6 8 0" fill="none" stroke="%23ffffff" stroke-width="3.5" stroke-linecap="round"/><path d="M22 42 q10 8 20 0" fill="none" stroke="%23ffffff" stroke-width="4" stroke-linecap="round"/><circle cx="32" cy="12" r="4" fill="%23f43f5e"/></svg>`
};

const frasesMotivacionales = [
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
 * 2. MÓDULO DE ALMACENAMIENTO
 * =================================================================== */

const StorageModule = {
    KEY: 'mi_spa_proyectos',
    CUSTOM_PROPERTIES: ['id', 'customType', 'fromId', 'toId', 'arrowId', 'selectable', 'evented'],

    save: (data) => {
        try {
            localStorage.setItem(StorageModule.KEY, JSON.stringify(data));
        } catch (error) {
            console.error('Error al guardar en localStorage:', error);
        }
    },

    load: () => {
        try {
            const data = localStorage.getItem(StorageModule.KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error al leer de localStorage:', error);
            return [];
        }
    }
};

/* ===================================================================
 * 3. GESTIÓN DE PROYECTOS
 * =================================================================== */

const ProjectManager = {

    createProject: () => {
        const projectName = prompt('Ingresa el nombre del nuevo proyecto:');
        if (!projectName || projectName.trim() === '') return;

        const newProject = {
            id: crypto.randomUUID(),
            name: projectName.trim(),
            description: 'Prototipo interactivo escalable.',
            createdAt: new Date().toISOString(),
            theme: AppState.defaultTheme,
            canvasData: null
        };

        AppState.projects.push(newProject);
        StorageModule.save(AppState.projects);
        UIController.navigateDashboardSection('my-projects');
    },

    getProjectById: (id) => AppState.projects.find(p => p.id === id),

    deleteProject: (id) => {
        AppState.projects = AppState.projects.filter(p => p.id !== id);
        StorageModule.save(AppState.projects);
    },

    updateCurrentProjectCanvas: (jsonData) => {
        if (!AppState.currentProjectId) return;
        const project = ProjectManager.getProjectById(AppState.currentProjectId);
        if (project) {
            project.canvasData = jsonData;
            StorageModule.save(AppState.projects);
        }
    },

    updateProjectTheme: (themeName) => {
        if (!AppState.currentProjectId) return;
        const project = ProjectManager.getProjectById(AppState.currentProjectId);
        if (project) {
            project.theme = themeName;
            StorageModule.save(AppState.projects);
        }
    },

    exportCurrentProject: () => {
        if (!AppState.currentProjectId) return;
        const project = ProjectManager.getProjectById(AppState.currentProjectId);
        if (!project) return;

        if (AppState.canvasRef) {
            project.canvasData = AppState.canvasRef.toJSON(StorageModule.CUSTOM_PROPERTIES);
        }

        const jsonString = JSON.stringify(project, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const anchor = document.createElement('a');
        anchor.href = URL.createObjectURL(blob);
        anchor.download = `${project.name.toLowerCase().replace(/\s+/g, '_')}_backup.json`;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        URL.revokeObjectURL(anchor.href);
    },

    importProjectFile: (file) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const imported = JSON.parse(event.target.result);
                if (!imported.name || !imported.createdAt) {
                    throw new Error('Formato de archivo inválido: faltan metadatos obligatorios.');
                }
                imported.id = crypto.randomUUID();
                imported.name = `[Importado] ${imported.name}`;
                AppState.projects.push(imported);
                StorageModule.save(AppState.projects);
                UIController.navigateDashboardSection('my-projects');
                alert('Proyecto importado exitosamente.');
            } catch (error) {
                console.error('Error durante la importación:', error);
                alert(`Error al importar: ${error.message}`);
            }
        };
        reader.readAsText(file);
    }
};

/* ===================================================================
 * 4. MOTOR GRÁFICO — Canvas Manager
 *
 * MEJORAS v2:
 *  • Deshacer / Rehacer con pila de historial (hasta 50 estados)
 *  • Zoom con Ctrl + Rueda del ratón
 *  • Pan con Espacio + Arrastrar (o botón central del ratón)
 *  • Colocación inteligente — nuevos elementos aparecen en el centro
 *    del viewport actual en lugar de coordenadas fijas
 *  • Copiar / Pegar con offset incremental
 *  • Ajustar todo al canvas (fitToScreen)
 * =================================================================== */

const CanvasManager = {

    /** Indica si la tecla Espacio está pulsada (activa el modo pan) */
    _spaceDown: false,

    /* ── Inicialización ── */

    init: (canvasId) => {
        AppState.canvasRef = new fabric.Canvas(canvasId, {
            backgroundColor: '#f8fafc',
            enableRetinaScaling: true
        });

        CanvasManager.bindResizeEvent();
        CanvasManager.bindDrawingEvents();
        CanvasManager.bindZoomPanEvents();
        CanvasManager.updateHistoryButtons();
    },

    bindResizeEvent: () => {
        const resize = () => {
            const parent = document.querySelector('.editor-canvas-wrapper');
            if (!parent || !AppState.canvasRef) return;
            AppState.canvasRef.setWidth(parent.clientWidth);
            AppState.canvasRef.setHeight(parent.clientHeight);
            AppState.canvasRef.renderAll();
        };
        resize();
        window.addEventListener('resize', resize);
    },

    /* ── Eventos del canvas (modificación + autoguardado + historia) ── */

    bindDrawingEvents: () => {
        /**
         * triggerAutosave — se llama tras cada cambio en el canvas.
         * Guarda en localStorage Y captura un estado en la pila de historia.
         * Se omite durante la carga de un estado de historia (isHistoryLoading).
         */
        const triggerAutosave = () => {
            if (!AppState.canvasRef || !AppState.currentProjectId) return;
            if (AppState.isHistoryLoading) return;
            const jsonData = AppState.canvasRef.toJSON(StorageModule.CUSTOM_PROPERTIES);
            ProjectManager.updateCurrentProjectCanvas(jsonData);
            CanvasManager.captureHistory();
        };

        AppState.canvasRef.on({
            'object:moving': (e) => {
                const moved = e.target;
                if (moved.type === 'activeSelection') {
                    moved.forEachObject(obj => CanvasManager.updateNodeLines(obj));
                } else {
                    CanvasManager.updateNodeLines(moved);
                }
            },
            'object:modified': triggerAutosave,
            'object:added':    triggerAutosave,
            'object:removed':  triggerAutosave,
            'mouse:dblclick': (opt) => {
                const target = opt.target;
                if (!target || target.customType !== 'ui-button') return;
                CanvasManager._enterButtonEditMode(target);
            }
        });
    },

    /* ── Zoom con Ctrl+Rueda y Pan con Espacio+Arrastrar ── */

    bindZoomPanEvents: () => {
        const canvas = AppState.canvasRef;
        if (!canvas) return;

        // Zoom con Ctrl + Rueda del ratón
        canvas.on('mouse:wheel', (opt) => {
            if (!opt.e.ctrlKey) return;
            opt.e.preventDefault();
            opt.e.stopPropagation();
            let zoom = canvas.getZoom();
            zoom *= 0.999 ** opt.e.deltaY;
            zoom = Math.min(Math.max(zoom, 0.05), 10);
            canvas.zoomToPoint(new fabric.Point(opt.e.offsetX, opt.e.offsetY), zoom);
            CanvasManager.updateZoomUI(zoom);
        });

        // Iniciar arrastre (Espacio pulsado o botón central del ratón)
        canvas.on('mouse:down', (opt) => {
            if (!CanvasManager._spaceDown && opt.e.button !== 1) return;
            canvas.isDragging = true;
            canvas.selection  = false;
            canvas._lastPosX  = opt.e.clientX;
            canvas._lastPosY  = opt.e.clientY;
        });

        // Desplazar viewport mientras se arrastra
        canvas.on('mouse:move', (opt) => {
            if (!canvas.isDragging) return;
            const vpt = canvas.viewportTransform;
            vpt[4] += opt.e.clientX - canvas._lastPosX;
            vpt[5] += opt.e.clientY - canvas._lastPosY;
            canvas.requestRenderAll();
            canvas._lastPosX = opt.e.clientX;
            canvas._lastPosY = opt.e.clientY;
        });

        // Finalizar arrastre
        canvas.on('mouse:up', () => {
            if (!canvas.isDragging) return;
            canvas.setViewportTransform(canvas.viewportTransform);
            canvas.isDragging = false;
            canvas.selection  = !CanvasManager._spaceDown;
        });

        // Tecla Espacio — activar / desactivar modo pan
        document.addEventListener('keydown', (e) => {
            if (e.code !== 'Space') return;
            const isEditingText = AppState.canvasRef?.getActiveObject()?.isEditing;
            const isInputFocused = ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName);
            const editorVisible  = document.getElementById('editor-view')?.style.display !== 'none';
            if (isEditingText || isInputFocused || !editorVisible) return;

            e.preventDefault();
            CanvasManager._spaceDown = true;
            const wrapper = document.querySelector('.editor-canvas-wrapper');
            if (wrapper) wrapper.style.cursor = 'grab';
        });

        document.addEventListener('keyup', (e) => {
            if (e.code !== 'Space') return;
            CanvasManager._spaceDown = false;
            const wrapper = document.querySelector('.editor-canvas-wrapper');
            if (wrapper) wrapper.style.cursor = '';
            canvas.isDragging = false;
            canvas.selection  = true;
        });
    },

    /* ── Helpers de UI ── */

    /** Actualiza el indicador de porcentaje de zoom en la cabecera */
    updateZoomUI: (zoom) => {
        const pill = document.getElementById('btn-zoom-reset');
        if (pill) pill.textContent = `${Math.round(zoom * 100)}%`;
    },

    /** Habilita o deshabilita los botones de Deshacer / Rehacer */
    updateHistoryButtons: () => {
        const btnUndo = document.getElementById('btn-undo');
        const btnRedo = document.getElementById('btn-redo');
        if (btnUndo) btnUndo.disabled = AppState.historyPointer <= 0;
        if (btnRedo) btnRedo.disabled = AppState.historyPointer >= AppState.history.length - 1;
    },

    /* ── Sistema de Historia (Deshacer / Rehacer) ── */

    /**
     * Captura el estado actual del canvas y lo empuja a la pila.
     * Trunca cualquier estado de "redo" que existiera.
     * Limita la pila a 50 entradas para no agotar memoria.
     */
    captureHistory: () => {
        if (AppState.isHistoryLoading || !AppState.canvasRef) return;
        const state = JSON.stringify(AppState.canvasRef.toJSON(StorageModule.CUSTOM_PROPERTIES));

        // Eliminar estados de redo al registrar una nueva acción
        AppState.history = AppState.history.slice(0, AppState.historyPointer + 1);
        AppState.history.push(state);
        AppState.historyPointer = AppState.history.length - 1;

        // Límite de la pila
        const MAX_HISTORY = 50;
        if (AppState.history.length > MAX_HISTORY) {
            AppState.history.shift();
            AppState.historyPointer = AppState.history.length - 1;
        }

        CanvasManager.updateHistoryButtons();
    },

    /** Retrocede un paso en la historia */
    undo: () => {
        if (AppState.historyPointer <= 0) return;
        AppState.historyPointer--;
        CanvasManager._loadHistoryState();
    },

    /** Avanza un paso en la historia */
    redo: () => {
        if (AppState.historyPointer >= AppState.history.length - 1) return;
        AppState.historyPointer++;
        CanvasManager._loadHistoryState();
    },

    /** Carga el estado apuntado por historyPointer en el canvas */
    _loadHistoryState: () => {
        const state = JSON.parse(AppState.history[AppState.historyPointer]);
        AppState.isHistoryLoading = true;

        AppState.canvasRef.loadFromJSON(state, () => {
            CanvasManager._rehydrateConnections();
            AppState.canvasRef.renderAll();
            AppState.isHistoryLoading = false;
            CanvasManager.updateHistoryButtons();

            // Persistir el estado restaurado en localStorage
            if (AppState.currentProjectId) {
                ProjectManager.updateCurrentProjectCanvas(state);
            }
        });
    },

    /**
     * Rehidrata las referencias en memoria (objA, objB, arrowRef) para
     * las líneas de conexión después de deserializar el canvas desde JSON.
     * Se extrae aquí para reutilizarse en loadProjectData y _loadHistoryState.
     */
    _rehydrateConnections: () => {
        const objectsMap = {};
        const lines = [];

        AppState.canvasRef.getObjects().forEach(obj => {
            if (obj.id) objectsMap[obj.id] = obj;
            if (obj.customType === 'connection' || obj.customType === 'nav-flow') lines.push(obj);
        });

        lines.forEach(line => {
            const objA = objectsMap[line.fromId];
            const objB = objectsMap[line.toId];
            if (objA && objB) {
                line.objA = objA;
                line.objB = objB;
                objA.connections = objA.connections || [];
                objB.connections = objB.connections || [];
                if (!objA.connections.includes(line)) objA.connections.push(line);
                if (!objB.connections.includes(line)) objB.connections.push(line);
            }
            if (line.customType === 'nav-flow' && line.arrowId) {
                const arrowObj = objectsMap[line.arrowId];
                if (arrowObj) line.arrowRef = arrowObj;
            }
        });
    },

    /* ── Helpers del viewport ── */

    /**
     * Devuelve las coordenadas del centro del viewport actual en el
     * sistema de coordenadas del canvas (tiene en cuenta zoom y pan).
     */
    getViewportCenter: () => {
        const canvas = AppState.canvasRef;
        if (!canvas) return { x: 200, y: 200 };
        const zoom = canvas.getZoom();
        const vpt  = canvas.viewportTransform;
        return {
            x: (canvas.width  / 2 - vpt[4]) / zoom,
            y: (canvas.height / 2 - vpt[5]) / zoom
        };
    },

    /**
     * Ajusta el zoom y el pan para que todos los objetos visibles
     * quepan en el canvas con un margen cómodo.
     */
    fitToScreen: () => {
        const canvas = AppState.canvasRef;
        if (!canvas) return;

        const objects = canvas.getObjects().filter(o =>
            o.customType !== 'connection' &&
            o.customType !== 'nav-flow' &&
            o.customType !== 'nav-arrow'
        );

        if (objects.length === 0) {
            canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
            CanvasManager.updateZoomUI(1);
            return;
        }

        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        objects.forEach(obj => {
            const r = obj.getBoundingRect(true, true);
            minX = Math.min(minX, r.left);
            minY = Math.min(minY, r.top);
            maxX = Math.max(maxX, r.left + r.width);
            maxY = Math.max(maxY, r.top + r.height);
        });

        const padding  = 80;
        const contentW = maxX - minX;
        const contentH = maxY - minY;
        if (contentW === 0 || contentH === 0) return;

        const zoom = Math.min(
            (canvas.width  - padding * 2) / contentW,
            (canvas.height - padding * 2) / contentH,
            2 // No sobrepasar 200 %
        );

        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;
        canvas.setViewportTransform([
            zoom, 0, 0, zoom,
            canvas.width  / 2 - centerX * zoom,
            canvas.height / 2 - centerY * zoom
        ]);
        CanvasManager.updateZoomUI(zoom);
    },

    /* ── Copiar / Pegar ── */

    /** Clona la selección activa en el portapapeles interno */
    copy: () => {
        const canvas = AppState.canvasRef;
        if (!canvas) return;
        const activeObj = canvas.getActiveObject();
        if (!activeObj) return;
        activeObj.clone(cloned => {
            AppState.clipboard = cloned;
        }, StorageModule.CUSTOM_PROPERTIES);
    },

    /**
     * Pega el contenido del portapapeles con un pequeño desplazamiento
     * para que el duplicado sea visible de inmediato.
     */
    paste: () => {
        const canvas = AppState.canvasRef;
        if (!canvas || !AppState.clipboard) return;

        AppState.clipboard.clone(clonedObj => {
            canvas.discardActiveObject();
            const offset = 24;
            clonedObj.set({ evented: true });
            clonedObj.left = (clonedObj.left || 0) + offset;
            clonedObj.top  = (clonedObj.top  || 0) + offset;

            if (clonedObj.type === 'activeSelection') {
                clonedObj.canvas = canvas;
                clonedObj.forEachObject(obj => {
                    obj.id = crypto.randomUUID();
                    canvas.add(obj);
                });
                clonedObj.setCoords();
            } else {
                clonedObj.id = crypto.randomUUID();
                canvas.add(clonedObj);
            }

            canvas.setActiveObject(clonedObj).renderAll();

            // Desplazar el portapapeles para que el siguiente pegado también sea visible
            AppState.clipboard.left = (AppState.clipboard.left || 0) + offset;
            AppState.clipboard.top  = (AppState.clipboard.top  || 0) + offset;
        }, StorageModule.CUSTOM_PROPERTIES);
    },

    /* ── Gestión de conexiones ── */

    /** Recalcula la posición de las líneas al mover un nodo */
    updateNodeLines: (node) => {
        if (!node.connections) return;
        const center = node.getCenterPoint();
        node.connections.forEach(line => {
            if (line.objA === node) line.set({ x1: center.x, y1: center.y });
            else if (line.objB === node) line.set({ x2: center.x, y2: center.y });
            line.setCoords();

            if (line.arrowRef) {
                const dx = line.x2 - line.x1;
                const dy = line.y2 - line.y1;
                const angle = Math.atan2(dy, dx) * 180 / Math.PI;
                line.arrowRef.set({ left: line.x2, top: line.y2, angle: angle + 90 });
                line.arrowRef.setCoords();
            }
        });
        AppState.canvasRef.renderAll();
    },

    /* ── Ciclo de vida del canvas ── */

    /** Libera referencias cruzadas y resetea la historia antes de cambiar de proyecto */
    clearCanvasReferences: () => {
        if (!AppState.canvasRef) return;
        AppState.canvasRef.getObjects().forEach(obj => {
            if (obj.connections) {
                obj.connections.forEach(line => {
                    line.objA = null;
                    line.objB = null;
                    if (line.arrowRef) line.arrowRef = null;
                });
                obj.connections = null;
            }
            obj.off();
        });
        AppState.canvasRef.clear();

        // Reiniciar pila de historia
        AppState.history = [];
        AppState.historyPointer = -1;
        AppState.isHistoryLoading = false;
        CanvasManager.updateHistoryButtons();
    },

    /** Carga el canvas de un proyecto y rehidrata el grafo de conexiones */
    loadProjectData: (canvasData) => {
        if (!AppState.canvasRef) return;
        CanvasManager.clearCanvasReferences();
        AppState.isHistoryLoading = true;

        if (canvasData) {
            AppState.canvasRef.loadFromJSON(canvasData, () => {
                CanvasManager._rehydrateConnections();
                AppState.canvasRef.renderAll();
                AppState.isHistoryLoading = false;
                CanvasManager.captureHistory(); // Estado inicial en la pila
                CanvasManager.fitToScreen();   // Mostrar todo el contenido al abrir
            });
        } else {
            AppState.canvasRef.setBackgroundColor('#f8fafc', () => {
                AppState.canvasRef.renderAll();
                AppState.isHistoryLoading = false;
                CanvasManager.captureHistory(); // Estado vacío en la pila
                AppState.canvasRef.setViewportTransform([1, 0, 0, 1, 0, 0]);
                CanvasManager.updateZoomUI(1);
            });
        }
    },

    /* ── Herramientas de dibujo ──
     * Todos los elementos se colocan en el centro del viewport actual
     * en lugar de en coordenadas fijas, lo que funciona correctamente
     * con cualquier nivel de zoom y posición del canvas.
     * ────────────────────────────────────────────────────────────── */

    addText: () => {
        const pos = CanvasManager.getViewportCenter();
        const text = new fabric.IText('Doble clic para editar', {
            left: pos.x, top: pos.y,
            originX: 'center', originY: 'center',
            fontSize: 20, fontFamily: 'Arial', fill: '#333333',
            id: crypto.randomUUID()
        });
        AppState.canvasRef.add(text).setActiveObject(text);
    },

    addStickyNote: () => {
        const pos = CanvasManager.getViewportCenter();
        const rect = new fabric.Rect({
            width: 150, height: 150, fill: '#fef08a',
            shadow: 'rgba(0,0,0,0.15) 3px 3px 6px',
            originX: 'center', originY: 'center'
        });
        const text = new fabric.IText('Nota adhesiva', {
            fontSize: 16, fontFamily: 'Arial', fill: '#1e293b',
            originX: 'center', originY: 'center',
            width: 130, splitByGrapheme: true
        });
        const group = new fabric.Group([rect, text], {
            left: pos.x, top: pos.y,
            originX: 'center', originY: 'center',
            id: crypto.randomUUID()
        });
        AppState.canvasRef.add(group).setActiveObject(group);
    },

    addImage: () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            // Capturar la posición antes del callback asíncrono
            const pos = CanvasManager.getViewportCenter();
            const reader = new FileReader();
            reader.onload = (fEvent) => {
                fabric.Image.fromURL(fEvent.target.result, (img) => {
                    img.set({
                        left: pos.x, top: pos.y,
                        originX: 'center', originY: 'center',
                        id: crypto.randomUUID()
                    });
                    img.scaleToWidth(200);
                    AppState.canvasRef.add(img).setActiveObject(img);
                });
            };
            reader.readAsDataURL(file);
        };
        fileInput.click();
    },

    addButton: () => {
        const pos = CanvasManager.getViewportCenter();
        const btnRect = new fabric.Rect({
            width: 140, height: 42, fill: '#6366f1', rx: 8, ry: 8,
            originX: 'center', originY: 'center',
            shadow: new fabric.Shadow({ color: 'rgba(99,102,241,0.40)', blur: 12, offsetX: 0, offsetY: 4 })
        });
        const btnLabel = new fabric.IText('Botón', {
            fontSize: 14, fontFamily: 'system-ui, -apple-system, sans-serif',
            fontWeight: '600', fill: '#ffffff',
            originX: 'center', originY: 'center',
            textAlign: 'center', selectable: false, evented: false
        });
        const buttonGroup = new fabric.Group([btnRect, btnLabel], {
            left: pos.x, top: pos.y,
            originX: 'center', originY: 'center',
            id: crypto.randomUUID(), customType: 'ui-button'
        });
        AppState.canvasRef.add(buttonGroup).setActiveObject(buttonGroup);
    },

    /** Desagrupa un botón UI y activa la edición de su etiqueta de texto */
    _enterButtonEditMode: (buttonGroup) => {
        const canvas = AppState.canvasRef;
        if (!canvas) return;

        const savedId  = buttonGroup.id;
        const items    = buttonGroup.getObjects().map(o => o);
        const textItem = items.find(o => o.type === 'i-text');
        if (!textItem) return;

        buttonGroup._restoreObjectsState();
        canvas.remove(buttonGroup);
        items.forEach(obj => {
            obj.set({ selectable: true, evented: true });
            canvas.add(obj);
        });

        canvas.setActiveObject(textItem);
        textItem.enterEditing();
        textItem.selectAll();
        canvas.renderAll();

        const regroup = () => {
            textItem.off('editing:exited', regroup);
            items.forEach(obj => canvas.remove(obj));
            const newGroup = new fabric.Group(items, { id: savedId, customType: 'ui-button' });
            canvas.add(newGroup).setActiveObject(newGroup).renderAll();
            const jsonData = canvas.toJSON(StorageModule.CUSTOM_PROPERTIES);
            ProjectManager.updateCurrentProjectCanvas(jsonData);
        };
        textItem.on('editing:exited', regroup);
    },

    addFrame: (type) => {
        const pos   = CanvasManager.getViewportCenter();
        const width = type === 'mobile' ? 375 : 768;
        const height = type === 'mobile' ? 812 : 1024;
        const label  = type === 'mobile' ? 'Frame Móvil (375×812)' : 'Frame Tablet (768×1024)';

        const rect = new fabric.Rect({
            width, height, fill: '#ffffff', stroke: '#cbd5e1', strokeWidth: 1,
            rx: 8, ry: 8, originX: 'center', originY: 'center'
        });
        const text = new fabric.Text(label, {
            fontSize: 12, fontFamily: 'sans-serif', fontWeight: '600', fill: '#64748b',
            originX: 'center', originY: 'center',
            top: (-height / 2) - 15
        });
        const frameGroup = new fabric.Group([rect, text], {
            left: pos.x, top: pos.y,
            originX: 'center', originY: 'center',
            id: crypto.randomUUID(), customType: 'frame'
        });

        AppState.canvasRef.add(frameGroup).sendToBack(frameGroup).setActiveObject(frameGroup).renderAll();
    },

    /**
     * connectNavFlow y connectSelectedElements suprimen el sistema de historia
     * durante la adición de múltiples objetos atómicos (línea + flecha) y luego
     * realizan una captura única del estado final. Esto evita estados intermedios
     * rotos en la pila al hacer Deshacer.
     */
    connectNavFlow: () => {
        const canvas = AppState.canvasRef;
        const activeObjects = canvas.getActiveObjects();

        if (activeObjects.length !== 2) {
            alert('Selecciona exactamente dos elementos con Shift+Click para crear un flujo de navegación.');
            return;
        }

        const [objA, objB] = activeObjects;
        if (!objA.id) objA.id = crypto.randomUUID();
        if (!objB.id) objB.id = crypto.randomUUID();

        const centerA = objA.getCenterPoint();
        const centerB = objB.getCenterPoint();
        const lineId  = crypto.randomUUID();
        const arrowId = crypto.randomUUID();

        const line = new fabric.Line([centerA.x, centerA.y, centerB.x, centerB.y], {
            stroke: '#10b981', strokeWidth: 2.5, strokeDashArray: [9, 5],
            selectable: false, evented: false,
            customType: 'nav-flow', id: lineId,
            fromId: objA.id, toId: objB.id, arrowId
        });

        const dx = centerB.x - centerA.x;
        const dy = centerB.y - centerA.y;
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;

        const arrow = new fabric.Triangle({
            width: 14, height: 18, fill: '#10b981',
            left: centerB.x, top: centerB.y, angle: angle + 90,
            originX: 'center', originY: 'center',
            selectable: false, evented: false,
            customType: 'nav-arrow', id: arrowId
        });

        line.objA = objA; line.objB = objB; line.arrowRef = arrow;
        objA.connections = objA.connections || []; objA.connections.push(line);
        objB.connections = objB.connections || []; objB.connections.push(line);

        // Adición atómica: suprimir historia mientras se añaden ambos objetos
        AppState.isHistoryLoading = true;
        canvas.add(line).sendToBack(line).add(arrow);
        AppState.isHistoryLoading = false;

        canvas.discardActiveObject().renderAll();

        // Captura única del estado final tras la operación atómica
        const jsonData = canvas.toJSON(StorageModule.CUSTOM_PROPERTIES);
        ProjectManager.updateCurrentProjectCanvas(jsonData);
        CanvasManager.captureHistory();
    },

    connectSelectedElements: () => {
        const canvas = AppState.canvasRef;
        const activeObjects = canvas.getActiveObjects();

        if (activeObjects.length !== 2) {
            alert('Selecciona exactamente dos elementos con Shift+Click para conectarlos.');
            return;
        }

        const [objA, objB] = activeObjects;
        if (!objA.id) objA.id = crypto.randomUUID();
        if (!objB.id) objB.id = crypto.randomUUID();

        const centerA = objA.getCenterPoint();
        const centerB = objB.getCenterPoint();

        const line = new fabric.Line([centerA.x, centerA.y, centerB.x, centerB.y], {
            stroke: '#6366f1', strokeWidth: 2.5,
            selectable: false, evented: false,
            customType: 'connection', id: crypto.randomUUID(),
            fromId: objA.id, toId: objB.id
        });

        line.objA = objA; line.objB = objB;
        objA.connections = objA.connections || []; objA.connections.push(line);
        objB.connections = objB.connections || []; objB.connections.push(line);

        // Adición atómica
        AppState.isHistoryLoading = true;
        canvas.add(line).sendToBack(line);
        AppState.isHistoryLoading = false;

        canvas.discardActiveObject().renderAll();

        const jsonData = canvas.toJSON(StorageModule.CUSTOM_PROPERTIES);
        ProjectManager.updateCurrentProjectCanvas(jsonData);
        CanvasManager.captureHistory();
    },

    /**
     * Elimina los objetos seleccionados y sus líneas dependientes de forma
     * atómica: suprime la historia durante la cadena de removes y realiza
     * una captura única al final.
     */
    deleteSelection: () => {
        const canvas = AppState.canvasRef;
        if (!canvas) return;
        const activeObjects = canvas.getActiveObjects();
        if (!activeObjects || activeObjects.length === 0) return;

        AppState.isHistoryLoading = true;

        activeObjects.forEach(obj => {
            if (obj.connections) {
                obj.connections.forEach(line => {
                    const other = line.objA === obj ? line.objB : line.objA;
                    if (other?.connections) {
                        other.connections = other.connections.filter(l => l !== line);
                    }
                    if (line.arrowRef) { canvas.remove(line.arrowRef); line.arrowRef = null; }
                    canvas.remove(line);
                });
            }
            canvas.remove(obj);
        });

        AppState.isHistoryLoading = false;
        canvas.discardActiveObject().renderAll();

        // Captura atómica del estado tras todas las eliminaciones
        if (AppState.currentProjectId) {
            const jsonData = canvas.toJSON(StorageModule.CUSTOM_PROPERTIES);
            ProjectManager.updateCurrentProjectCanvas(jsonData);
        }
        CanvasManager.captureHistory();
    }
};

/* ===================================================================
 * 5. ASISTENTE VIRTUAL
 * =================================================================== */

const CompanionManager = {
    STORAGE_KEYS: {
        VISIBLE: 'companion_visible',
        CALM:    'companion_calm',
        ACTIVE:  'companion_active'
    },
    _bubbleTimeoutId: null,

    init: () => {
        const storedVisible = localStorage.getItem(CompanionManager.STORAGE_KEYS.VISIBLE);
        AppState.companion.visible   = storedVisible !== null ? JSON.parse(storedVisible) : true;
        AppState.companion.calmSrc   = localStorage.getItem(CompanionManager.STORAGE_KEYS.CALM)   || CompanionPlaceholders.CALM;
        AppState.companion.activeSrc = localStorage.getItem(CompanionManager.STORAGE_KEYS.ACTIVE) || CompanionPlaceholders.ACTIVE;
        CompanionManager.syncDOMVisibility();
        CompanionManager.setAvatarState('calm');
    },

    setVisibility: (isVisible) => {
        AppState.companion.visible = isVisible;
        try { localStorage.setItem(CompanionManager.STORAGE_KEYS.VISIBLE, JSON.stringify(isVisible)); }
        catch (e) { console.error('Error al guardar visibilidad del compañero:', e); }
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
        const MAX_SIZE = 800 * 1024;
        if (file.size > MAX_SIZE) { alert('El archivo supera los 800 KB. Sube una versión optimizada.'); return; }
        try {
            const base64Data = await CompanionManager.convertToBase64(file);
            if (type === 'calm') {
                AppState.companion.calmSrc = base64Data;
                localStorage.setItem(CompanionManager.STORAGE_KEYS.CALM, base64Data);
            } else if (type === 'active') {
                AppState.companion.activeSrc = base64Data;
                localStorage.setItem(CompanionManager.STORAGE_KEYS.ACTIVE, base64Data);
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

/* ===================================================================
 * 6. CONTROLADOR DE INTERFAZ
 * =================================================================== */

const UIController = {
    elements: {
        htmlRoot:             document.documentElement,
        dashboardView:        document.getElementById('dashboard-view'),
        editorView:           document.getElementById('editor-view'),
        projectsContainer:    document.getElementById('projects-container'),
        btnNewProject:        document.getElementById('btn-new-project'),
        btnNewProjectSidebar: document.getElementById('btn-new-project-sidebar'),
        btnBack:              document.getElementById('btn-back'),
        btnExport:            document.getElementById('btn-export'),
        inputImport:          document.getElementById('input-import'),
        selectTheme:          document.getElementById('select-theme'),
        // Herramientas del canvas
        btnToolText:    document.getElementById('tool-text'),
        btnToolSticky:  document.getElementById('tool-sticky'),
        btnToolImage:   document.getElementById('tool-image'),
        btnToolButton:  document.getElementById('tool-button'),
        btnFrameMobile: document.getElementById('tool-frame-mobile'),
        btnFrameTablet: document.getElementById('tool-frame-tablet'),
        btnNavFlow:     document.getElementById('tool-nav-flow'),
        btnConnect:     document.getElementById('tool-connect'),
        btnDelete:      document.getElementById('tool-delete'),
        // Historia y zoom
        btnUndo:      document.getElementById('btn-undo'),
        btnRedo:      document.getElementById('btn-redo'),
        btnZoomIn:    document.getElementById('btn-zoom-in'),
        btnZoomOut:   document.getElementById('btn-zoom-out'),
        btnZoomReset: document.getElementById('btn-zoom-reset'),
        btnZoomFit:   document.getElementById('btn-zoom-fit')
    },

    init: () => {
        AppState.projects = StorageModule.load();
        const savedTheme = localStorage.getItem('trazzo_default_theme');
        if (savedTheme) AppState.defaultTheme = savedTheme;
        CanvasManager.init('canvas-element');
        CompanionManager.init();
        UIController.bindEvents();
        UIController.showDashboard();
    },

    bindEvents: () => {
        const { elements: el } = UIController;

        // Navegación del dashboard
        document.querySelectorAll('.sidebar__link[data-section]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                UIController.navigateDashboardSection(link.dataset.section);
            });
        });

        // Proyectos
        el.btnNewProject?.addEventListener('click', ProjectManager.createProject);
        el.btnNewProjectSidebar?.addEventListener('click', ProjectManager.createProject);
        el.btnBack?.addEventListener('click', UIController.showDashboard);

        // I/O
        el.btnExport?.addEventListener('click', ProjectManager.exportCurrentProject);
        el.inputImport?.addEventListener('change', (e) => {
            ProjectManager.importProjectFile(e.target.files[0]);
            e.target.value = '';
        });

        // Tema
        el.selectTheme?.addEventListener('change', (e) => UIController.applyTheme(e.target.value));

        // Herramientas del canvas
        el.btnToolText?.addEventListener('click', CanvasManager.addText);
        el.btnToolSticky?.addEventListener('click', CanvasManager.addStickyNote);
        el.btnToolImage?.addEventListener('click', CanvasManager.addImage);
        el.btnToolButton?.addEventListener('click', CanvasManager.addButton);
        el.btnFrameMobile?.addEventListener('click', () => CanvasManager.addFrame('mobile'));
        el.btnFrameTablet?.addEventListener('click', () => CanvasManager.addFrame('tablet'));
        el.btnNavFlow?.addEventListener('click', CanvasManager.connectNavFlow);
        el.btnConnect?.addEventListener('click', CanvasManager.connectSelectedElements);
        el.btnDelete?.addEventListener('click', CanvasManager.deleteSelection);

        // Historia
        el.btnUndo?.addEventListener('click', CanvasManager.undo);
        el.btnRedo?.addEventListener('click', CanvasManager.redo);

        // Zoom
        el.btnZoomIn?.addEventListener('click', () => {
            const canvas = AppState.canvasRef;
            if (!canvas) return;
            const z = Math.min(canvas.getZoom() * 1.25, 10);
            canvas.zoomToPoint(new fabric.Point(canvas.width / 2, canvas.height / 2), z);
            CanvasManager.updateZoomUI(z);
        });
        el.btnZoomOut?.addEventListener('click', () => {
            const canvas = AppState.canvasRef;
            if (!canvas) return;
            const z = Math.max(canvas.getZoom() / 1.25, 0.05);
            canvas.zoomToPoint(new fabric.Point(canvas.width / 2, canvas.height / 2), z);
            CanvasManager.updateZoomUI(z);
        });
        el.btnZoomReset?.addEventListener('click', () => {
            const canvas = AppState.canvasRef;
            if (!canvas) return;
            canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
            CanvasManager.updateZoomUI(1);
        });
        el.btnZoomFit?.addEventListener('click', CanvasManager.fitToScreen);

        // Asistente
        document.getElementById('toggle-companion-dashboard')?.addEventListener('change', (e) => CompanionManager.setVisibility(e.target.checked));
        document.getElementById('toggle-companion-editor')?.addEventListener('change', (e) => CompanionManager.setVisibility(e.target.checked));
        document.getElementById('input-avatar-calm')?.addEventListener('change', (e) => CompanionManager.processAvatarUpload(e.target.files[0], 'calm'));
        document.getElementById('input-avatar-active')?.addEventListener('change', (e) => CompanionManager.processAvatarUpload(e.target.files[0], 'active'));
        document.getElementById('companion-avatar-trigger')?.addEventListener('click', (e) => {
            e.stopPropagation();
            CompanionManager.speakRandomPhrase();
        });

        /* ── Atajos de teclado globales ──
         *
         *  Ctrl+Z          — Deshacer
         *  Ctrl+Shift+Z    — Rehacer
         *  Ctrl+Y          — Rehacer (alternativo)
         *  Ctrl+C          — Copiar selección
         *  Ctrl+V          — Pegar
         *  Ctrl+A          — Seleccionar todo
         *  Ctrl+0          — Restablecer zoom a 100 %
         *  Ctrl+Shift+0    — Ajustar todo al canvas
         *  Ctrl+=  /  Ctrl++  — Acercar
         *  Ctrl+-          — Alejar
         *  Supr / Retroceso — Eliminar selección
         */
        window.addEventListener('keydown', (e) => {
            const canvas = AppState.canvasRef;
            if (!canvas) return;

            const isEditingText  = canvas.getActiveObject()?.isEditing;
            const isInputFocused = ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName);
            const editorVisible  = el.editorView?.style.display !== 'none';

            if (!editorVisible) return;

            // Eliminar — funciona incluso sin Ctrl, pero no al editar texto
            if ((e.key === 'Delete' || e.key === 'Backspace') && !isEditingText && !isInputFocused) {
                CanvasManager.deleteSelection();
                return;
            }

            // El resto de atajos requiere que no estemos en un campo de texto
            if (isInputFocused || isEditingText) return;

            const ctrl = e.ctrlKey || e.metaKey;
            if (!ctrl) return;

            const key = e.key.toLowerCase();

            if (key === 'z' && !e.shiftKey) { e.preventDefault(); CanvasManager.undo();  return; }
            if (key === 'z' &&  e.shiftKey) { e.preventDefault(); CanvasManager.redo();  return; }
            if (key === 'y')                { e.preventDefault(); CanvasManager.redo();  return; }
            if (key === 'c')                { e.preventDefault(); CanvasManager.copy();  return; }
            if (key === 'v')                { e.preventDefault(); CanvasManager.paste(); return; }

            if (key === 'a') {
                e.preventDefault();
                canvas.discardActiveObject();
                const all = canvas.getObjects();
                if (all.length > 0) {
                    canvas.setActiveObject(new fabric.ActiveSelection(all, { canvas })).renderAll();
                }
                return;
            }

            if (key === '0') {
                e.preventDefault();
                if (e.shiftKey) {
                    CanvasManager.fitToScreen();
                } else {
                    canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
                    CanvasManager.updateZoomUI(1);
                }
                return;
            }

            if (key === '=' || key === '+') {
                e.preventDefault();
                const z = Math.min(canvas.getZoom() * 1.25, 10);
                canvas.zoomToPoint(new fabric.Point(canvas.width / 2, canvas.height / 2), z);
                CanvasManager.updateZoomUI(z);
                return;
            }

            if (key === '-') {
                e.preventDefault();
                const z = Math.max(canvas.getZoom() / 1.25, 0.05);
                canvas.zoomToPoint(new fabric.Point(canvas.width / 2, canvas.height / 2), z);
                CanvasManager.updateZoomUI(z);
                return;
            }
        });
    },

    applyTheme: (themeName) => {
        if (!themeName) return;
        UIController.elements.htmlRoot.setAttribute('data-theme', themeName);
        if (UIController.elements.selectTheme) UIController.elements.selectTheme.value = themeName;
        AppState.defaultTheme = themeName;
        try { localStorage.setItem('trazzo_default_theme', themeName); } catch (e) { /* noop */ }
    },

    renderDashboard: () => {
        const { projectsContainer } = UIController.elements;
        if (!projectsContainer) return;
        projectsContainer.innerHTML = '';

        if (AppState.projects.length === 0) {
            projectsContainer.innerHTML = '<p class="empty-state">No hay proyectos creados aún. ¡Empieza creando uno nuevo!</p>';
            return;
        }

        AppState.projects.forEach(project => {
            const card = document.createElement('div');
            card.className = 'project-card';
            card.innerHTML = `
                <h3 class="project-title">${project.name}</h3>
                <p class="project-desc">${project.description}</p>
                <small class="project-date">Modificado: ${new Date(project.createdAt).toLocaleDateString()}</small>
            `;
            card.addEventListener('click', () => UIController.showEditor(project.id));
            projectsContainer.appendChild(card);
        });
    },

    showEditor: (projectId) => {
        const project = ProjectManager.getProjectById(projectId);
        if (!project) return;

        AppState.currentProjectId = projectId;
        UIController.applyTheme(AppState.defaultTheme);

        UIController.elements.dashboardView.style.display = 'none';
        UIController.elements.editorView.style.display    = 'flex';

        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
            CanvasManager.loadProjectData(project.canvasData);
        }, 50);

        CompanionManager.syncDOMVisibility();
    },

    navigateDashboardSection: (sectionId) => {
        document.querySelectorAll('.dashboard-section').forEach(s => { s.style.display = 'none'; });
        const target = document.getElementById(`section-${sectionId}`);
        if (target) target.style.display = 'block';

        document.querySelectorAll('.sidebar__link[data-section]').forEach(link => {
            link.classList.remove('sidebar__link--active');
            link.removeAttribute('aria-current');
        });
        const activeLink = document.querySelector(`.sidebar__link[data-section="${sectionId}"]`);
        if (activeLink) { activeLink.classList.add('sidebar__link--active'); activeLink.setAttribute('aria-current', 'page'); }

        if (sectionId === 'my-projects') UIController.renderDashboard();
        if (sectionId === 'trash')       UIController.renderTrashView();
    },

    renderTrashView: () => {
        const container = document.getElementById('trash-container');
        if (!container) return;
        container.innerHTML = '';

        if (AppState.projects.length === 0) {
            container.innerHTML = '<p class="empty-state">No hay proyectos para eliminar.</p>';
            return;
        }

        const list = document.createElement('div');
        list.className = 'trash-list';

        AppState.projects.forEach(project => {
            const item = document.createElement('div');
            item.className = 'trash-item';
            item.innerHTML = `
                <div class="trash-item__info">
                    <span class="trash-item__name">${project.name}</span>
                    <small class="trash-item__date">Creado: ${new Date(project.createdAt).toLocaleDateString()}</small>
                </div>
                <button class="btn btn--danger trash-item__btn" aria-label="Eliminar ${project.name}">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" stroke-width="2" stroke-linecap="round"
                         stroke-linejoin="round" width="14" height="14" aria-hidden="true">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                        <path d="M10 11v6M14 11v6"/>
                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                    </svg>
                    Eliminar
                </button>
            `;
            item.querySelector('.trash-item__btn').addEventListener('click', () => {
                if (confirm(`¿Eliminar el proyecto "${project.name}"?\n\nEsta acción no se puede deshacer.`)) {
                    ProjectManager.deleteProject(project.id);
                    UIController.renderTrashView();
                }
            });
            list.appendChild(item);
        });

        container.appendChild(list);
    },

    showDashboard: () => {
        CanvasManager.clearCanvasReferences();
        AppState.currentProjectId = null;
        UIController.applyTheme(AppState.defaultTheme);

        UIController.elements.editorView.style.display   = 'none';
        UIController.elements.dashboardView.style.display = 'flex';
        UIController.navigateDashboardSection('my-projects');

        CompanionManager.syncDOMVisibility();
    }
};

document.addEventListener('DOMContentLoaded', UIController.init);
