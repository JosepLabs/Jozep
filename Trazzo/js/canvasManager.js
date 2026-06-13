/**
 * ====================================================================
 * canvasManager.js — Controlador del Canvas
 * ====================================================================
 *
 * Motor gráfico basado en Fabric.js. Incluye:
 *  - CanvasManager   → herramientas de dibujo, historia (undo/redo),
 *                       zoom/pan, conexiones, ciclo de vida del canvas.
 *  - PropertiesPanel → panel lateral de propiedades del objeto activo.
 *  - AlignmentTools  → alineación y distribución de selecciones.
 *
 * Depende del estado global (AppState), de la persistencia
 * (StorageModule) y del gestor de proyectos (ProjectManager) para
 * guardar los cambios del lienzo.
 * ==================================================================== */

import { AppState } from './state.js';
import { StorageModule } from './storage.js';
import { ProjectManager } from './projectManager.js';

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

export const CanvasManager = {

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
        PropertiesPanel.init();
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
         * Guarda el proyecto en IndexedDB y captura un estado en la pila de historia.
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
                // Snap a cuadrícula de 8 px
                if (AppState.snapToGrid) {
                    const G = 8;
                    moved.set({
                        left: Math.round(moved.left / G) * G,
                        top:  Math.round(moved.top  / G) * G
                    });
                }
                if (moved.type === 'activeSelection') {
                    moved.forEachObject(obj => CanvasManager.updateNodeLines(obj));
                } else {
                    CanvasManager.updateNodeLines(moved);
                }
                PropertiesPanel._livePos(moved);
            },
            'object:scaling': (e) => PropertiesPanel._liveSize(e.target),
            'object:scaled': (e) => {
                const obj = e.target;
                if (obj.type !== 'group') return;
                // Solo reflow en notas adhesivas (customType 'sticky' o sin tipo)
                // Omitir botones, frames y componentes wf-*
                if (obj.customType && obj.customType !== 'sticky') return;
                const items = obj.getObjects();
                const hasRect = items.some(o => o.type === 'rect');
                const hasText = items.some(o => o.type === 'textbox' || o.type === 'i-text');
                if (hasRect && hasText) CanvasManager._reflowGroupOnScale(obj);
            },
            'object:modified': (e) => {
                triggerAutosave();
                PropertiesPanel.show(e.target);
            },
            'object:added':    triggerAutosave,
            'object:removed':  triggerAutosave,
            'mouse:dblclick': (opt) => {
                const target = opt.target;
                if (!target) return;
                if (target.customType === 'ui-button') {
                    CanvasManager._enterButtonEditMode(target);
                } else if (target.type === 'group') {
                    CanvasManager._enterGroupTextEditMode(target);
                }
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

            // Persistir el estado restaurado en IndexedDB
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
        const pos  = CanvasManager.getViewportCenter();
        // Textbox en lugar de IText: soporta ancho fijo y reflow de texto nativo.
        // El asa central (derecha/izquierda) cambia el ancho y el texto se reordena.
        const text = new fabric.Textbox('Doble clic para editar', {
            left: pos.x, top: pos.y,
            originX: 'center', originY: 'center',
            fontSize: 20, fontFamily: 'Arial', fill: '#333333',
            width: 280,
            id: crypto.randomUUID()
        });
        AppState.canvasRef.add(text).setActiveObject(text);
    },

    addStickyNote: () => {
        const pos  = CanvasManager.getViewportCenter();
        const W    = 150;
        const rect = new fabric.Rect({
            width: W, height: W, fill: '#fef08a',
            shadow: 'rgba(0,0,0,0.15) 3px 3px 6px',
            originX: 'center', originY: 'center'
        });
        // Textbox con width fijo: al redimensionar el grupo se llama
        // _reflowGroupOnScale que ajusta este ancho y el texto se reordena.
        const text = new fabric.Textbox('Nota adhesiva', {
            fontSize: 14, fontFamily: 'Arial', fill: '#1e293b',
            originX: 'center', originY: 'center',
            width: W - 20, textAlign: 'left'
        });
        const group = new fabric.Group([rect, text], {
            left: pos.x, top: pos.y,
            originX: 'center', originY: 'center',
            id: crypto.randomUUID(),
            customType: 'sticky'
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

    /** Desagrupa cualquier grupo con IText/Textbox y permite editar el texto (ej. notas adhesivas) */
    _enterGroupTextEditMode: (group) => {
        const canvas = AppState.canvasRef;
        if (!canvas) return;
        const textItem = group.getObjects().find(o => o.type === 'i-text' || o.type === 'textbox');
        if (!textItem) return;

        const savedId         = group.id;
        const savedCustomType = group.customType;
        const items           = group.getObjects().map(o => o);

        group._restoreObjectsState();
        canvas.remove(group);
        items.forEach(obj => { obj.set({ selectable: true, evented: true }); canvas.add(obj); });

        canvas.setActiveObject(textItem);
        textItem.enterEditing();
        textItem.selectAll();
        canvas.renderAll();

        const regroup = () => {
            textItem.off('editing:exited', regroup);
            items.forEach(obj => canvas.remove(obj));
            const newGroup = new fabric.Group(items, { id: savedId, customType: savedCustomType });
            canvas.add(newGroup).setActiveObject(newGroup).renderAll();
            const jsonData = canvas.toJSON(StorageModule.CUSTOM_PROPERTIES);
            ProjectManager.updateCurrentProjectCanvas(jsonData);
        };
        textItem.on('editing:exited', regroup);
    },

    /* ── Componentes Wireframe ──────────────────────────────────────
     * Elementos preconstruidos de UI que aceleran el prototipado.
     * Todos se colocan en el centro del viewport.
     * ──────────────────────────────────────────────────────────── */

    /** Campo de entrada de texto */
    addInputField: () => {
        const pos = CanvasManager.getViewportCenter();
        const W = 220, H = 38;
        const rect = new fabric.Rect({
            width: W, height: H, fill: '#ffffff', stroke: '#cbd5e1', strokeWidth: 1.5,
            rx: 6, ry: 6, originX: 'center', originY: 'center'
        });
        const placeholder = new fabric.Text('Escribe aquí...', {
            fontSize: 13, fontFamily: 'Arial', fill: '#94a3b8',
            left: -(W / 2) + 12, top: 0, originX: 'left', originY: 'center'
        });
        const group = new fabric.Group([rect, placeholder], {
            left: pos.x, top: pos.y, originX: 'center', originY: 'center',
            id: crypto.randomUUID(), customType: 'wf-input'
        });
        AppState.canvasRef.add(group).setActiveObject(group);
    },

    /** Barra de navegación superior */
    addNavBar: () => {
        const pos = CanvasManager.getViewportCenter();
        const W = 375, H = 56;
        const bar = new fabric.Rect({
            width: W, height: H, fill: '#1e293b', rx: 0, ry: 0,
            originX: 'center', originY: 'center'
        });
        const logoText = new fabric.Text('App Logo', {
            fontSize: 15, fontFamily: 'Arial', fontWeight: 'bold', fill: '#ffffff',
            left: -(W / 2) + 16, top: 0, originX: 'left', originY: 'center'
        });
        const menuIcon = new fabric.Text('☰', {
            fontSize: 20, fill: '#ffffff',
            left: (W / 2) - 16, top: 0, originX: 'right', originY: 'center'
        });
        const group = new fabric.Group([bar, logoText, menuIcon], {
            left: pos.x, top: pos.y, originX: 'center', originY: 'center',
            id: crypto.randomUUID(), customType: 'wf-navbar'
        });
        AppState.canvasRef.add(group).setActiveObject(group);
    },

    /** Tarjeta de contenido */
    addCard: () => {
        const pos = CanvasManager.getViewportCenter();
        const W = 240, H = 190;
        const card = new fabric.Rect({
            width: W, height: H, fill: '#ffffff', rx: 12, ry: 12,
            shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.10)', blur: 24, offsetX: 0, offsetY: 6 }),
            originX: 'center', originY: 'center'
        });
        const imgBox = new fabric.Rect({
            width: W - 24, height: 100, fill: '#e2e8f0', rx: 6, ry: 6,
            left: 0, top: -(H / 2) + 62, originX: 'center', originY: 'center'
        });
        const imgLabel = new fabric.Text('Imagen', {
            fontSize: 12, fill: '#94a3b8', fontFamily: 'Arial',
            left: 0, top: -(H / 2) + 62, originX: 'center', originY: 'center'
        });
        const title = new fabric.Text('Título de la tarjeta', {
            fontSize: 14, fontWeight: 'bold', fontFamily: 'Arial', fill: '#1e293b',
            left: -(W / 2) + 12, top: 68, originX: 'left', originY: 'top'
        });
        const subtitle = new fabric.Text('Descripción breve del elemento', {
            fontSize: 11, fontFamily: 'Arial', fill: '#64748b',
            left: -(W / 2) + 12, top: 88, originX: 'left', originY: 'top'
        });
        const group = new fabric.Group([card, imgBox, imgLabel, title, subtitle], {
            left: pos.x, top: pos.y, originX: 'center', originY: 'center',
            id: crypto.randomUUID(), customType: 'wf-card'
        });
        AppState.canvasRef.add(group).setActiveObject(group);
    },

    /** Checkbox con etiqueta */
    addCheckbox: () => {
        const pos = CanvasManager.getViewportCenter();
        const box = new fabric.Rect({
            width: 18, height: 18, fill: '#ffffff', stroke: '#6366f1', strokeWidth: 2,
            rx: 4, ry: 4, left: -68, top: 0, originX: 'center', originY: 'center'
        });
        const check = new fabric.Text('✓', {
            fontSize: 13, fill: '#6366f1', fontWeight: 'bold',
            left: -68, top: 1, originX: 'center', originY: 'center'
        });
        const label = new fabric.IText('Opción seleccionable', {
            fontSize: 13, fontFamily: 'Arial', fill: '#334155',
            left: -56, top: 0, originX: 'left', originY: 'center'
        });
        const group = new fabric.Group([box, check, label], {
            left: pos.x, top: pos.y, originX: 'center', originY: 'center',
            id: crypto.randomUUID(), customType: 'wf-checkbox'
        });
        AppState.canvasRef.add(group).setActiveObject(group);
    },

    /**
     * Reconstruye un grupo (nota adhesiva) tras redimensionarlo para que el texto
     * interno se ajuste al nuevo ancho en lugar de escalar uniformemente.
     *
     * Flujo:
     *  1. Calcular el nuevo ancho/alto absoluto (width × scaleX).
     *  2. Reconstruir los objetos internos con las nuevas dimensiones.
     *  3. Crear un nuevo grupo con scaleX/Y = 1 y posición idéntica.
     *  4. Captura atómica de historia (un solo estado por redimensionado).
     */
    _reflowGroupOnScale: (group) => {
        const canvas = AppState.canvasRef;
        if (!canvas) return;

        const newW    = Math.max(Math.round(group.width  * group.scaleX), 80);
        const newH    = Math.max(Math.round(group.height * group.scaleY), 60);
        const savedId = group.id;
        const savedCT = group.customType;
        const cx      = group.left;
        const cy      = group.top;

        const children    = group.getObjects();
        const newChildren = [];

        children.forEach(child => {
            if (child.type === 'rect') {
                // Reconstruir el rectángulo con el nuevo tamaño absoluto
                const shadow = child.shadow
                    ? new fabric.Shadow({
                        color:   child.shadow.color   || 'rgba(0,0,0,0.15)',
                        blur:    child.shadow.blur    || 6,
                        offsetX: child.shadow.offsetX || 3,
                        offsetY: child.shadow.offsetY || 3
                      })
                    : null;
                newChildren.push(new fabric.Rect({
                    width:  newW, height: newH,
                    fill:   child.fill,
                    stroke: child.stroke, strokeWidth: child.strokeWidth || 0,
                    rx: child.rx || 0, ry: child.ry || 0,
                    shadow,
                    originX: 'center', originY: 'center'
                }));
            } else if (child.type === 'textbox' || child.type === 'i-text') {
                // Reconstruir el texto como Textbox con el ancho actualizado
                newChildren.push(new fabric.Textbox(child.text || '', {
                    width:      Math.max(newW - 20, 40),
                    fontSize:   child.fontSize   || 14,
                    fontFamily: child.fontFamily || 'Arial',
                    fontWeight: child.fontWeight || 'normal',
                    fontStyle:  child.fontStyle  || 'normal',
                    fill:       child.fill       || '#1e293b',
                    textAlign:  child.textAlign  || 'left',
                    originX: 'center', originY: 'center'
                }));
            }
        });

        if (newChildren.length === 0) return;

        // Suprimir historia durante la reconstrucción atómica
        AppState.isHistoryLoading = true;
        canvas.remove(group);

        const newGroup = new fabric.Group(newChildren, {
            left: cx, top: cy,
            originX: 'center', originY: 'center',
            id: savedId, customType: savedCT,
            scaleX: 1, scaleY: 1
        });

        canvas.add(newGroup).setActiveObject(newGroup);
        canvas.renderAll();

        // Diferir la captura al siguiente tick para absorber el object:modified residual
        setTimeout(() => {
            AppState.isHistoryLoading = false;
            PropertiesPanel.show(newGroup);
            if (AppState.currentProjectId) {
                const jsonData = canvas.toJSON(StorageModule.CUSTOM_PROPERTIES);
                ProjectManager.updateCurrentProjectCanvas(jsonData);
            }
            CanvasManager.captureHistory();
        }, 0);
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
 * 4.5. PANEL DE PROPIEDADES
 *
 * Escucha los eventos de selección del canvas y actualiza un panel
 * lateral derecho con los atributos editables del objeto seleccionado:
 * posición, tamaño, opacidad, color de relleno y propiedades de texto.
 * =================================================================== */

export const PropertiesPanel = {
    _obj: null,

    init: () => {
        const c = AppState.canvasRef;
        if (!c) return;
        c.on('selection:created',  ()  => PropertiesPanel.show(c.getActiveObject()));
        c.on('selection:updated',  ()  => PropertiesPanel.show(c.getActiveObject()));
        c.on('selection:cleared',  ()  => PropertiesPanel.hide());
        PropertiesPanel._bindInputs();
    },

    show: (obj) => {
        if (!obj) { PropertiesPanel.hide(); return; }
        PropertiesPanel._obj = obj;
        document.getElementById('prop-empty').style.display  = 'none';
        document.getElementById('prop-content').style.display = 'flex';
        PropertiesPanel._fillAll(obj);
    },

    hide: () => {
        PropertiesPanel._obj = null;
        document.getElementById('prop-empty').style.display   = 'flex';
        document.getElementById('prop-content').style.display = 'none';
    },

    /** Actualización en tiempo real de posición durante arrastre */
    _livePos: (obj) => {
        if (!obj) return;
        const x = document.getElementById('prop-x');
        const y = document.getElementById('prop-y');
        if (x) x.value = Math.round(obj.left ?? 0);
        if (y) y.value = Math.round(obj.top  ?? 0);
    },

    /** Actualización en tiempo real de tamaño durante escalado */
    _liveSize: (obj) => {
        if (!obj) return;
        const w = document.getElementById('prop-w');
        const h = document.getElementById('prop-h');
        if (w) w.value = Math.round((obj.width  ?? 0) * (obj.scaleX ?? 1));
        if (h) h.value = Math.round((obj.height ?? 0) * (obj.scaleY ?? 1));
    },

    _fillAll: (obj) => {
        PropertiesPanel._livePos(obj);
        PropertiesPanel._liveSize(obj);

        // Opacidad
        const opacity = obj.opacity ?? 1;
        const slider  = document.getElementById('prop-opacity');
        const opLabel = document.getElementById('prop-opacity-val');
        if (slider)  slider.value       = opacity;
        if (opLabel) opLabel.textContent = `${Math.round(opacity * 100)}%`;

        // Color de relleno
        const fill    = PropertiesPanel._extractFill(obj);
        const fillIn  = document.getElementById('prop-fill');
        const fillHex = document.getElementById('prop-fill-hex');
        if (fill && fillIn) {
            const hex = PropertiesPanel._toHex(fill);
            fillIn.value = hex;
            if (fillHex) fillHex.textContent = hex;
        }

        // Propiedades de texto
        const textObj     = PropertiesPanel._extractText(obj);
        const textSection = document.getElementById('prop-section-text');
        if (textObj && textSection) {
            textSection.style.display = '';
            const tc  = PropertiesPanel._toHex(textObj.fill || '#333333');
            const tci = document.getElementById('prop-text-color');
            const tch = document.getElementById('prop-text-color-hex');
            const fsi = document.getElementById('prop-font-size');
            const ffi = document.getElementById('prop-font-family');
            const bld = document.getElementById('prop-bold');
            const itl = document.getElementById('prop-italic');
            if (tci) tci.value = tc;
            if (tch) tch.textContent = tc;
            if (fsi) fsi.value = textObj.fontSize || 14;
            if (ffi) ffi.value = textObj.fontFamily || 'Arial';
            if (bld) bld.classList.toggle('prop-format-btn--active', textObj.fontWeight === 'bold');
            if (itl) itl.classList.toggle('prop-format-btn--active', textObj.fontStyle === 'italic');
        } else if (textSection) {
            textSection.style.display = 'none';
        }

        // Sección de alineación (solo multi-selección)
        const alignSec = document.getElementById('prop-section-align');
        if (alignSec) alignSec.style.display = (obj.type === 'activeSelection') ? '' : 'none';
    },

    /* ── Helpers de extracción ── */

    _extractFill: (obj) => {
        if (!obj) return null;
        if (obj.type === 'group') {
            return (obj.getObjects().find(o => o.type === 'rect') ?? obj).fill;
        }
        return obj.fill;
    },

    _extractText: (obj) => {
        if (!obj) return null;
        if (obj.type === 'i-text' || obj.type === 'text' || obj.type === 'textbox') return obj;
        if (obj.type === 'group') {
            return obj.getObjects().find(o =>
                o.type === 'i-text' || o.type === 'text' || o.type === 'textbox'
            ) ?? null;
        }
        return null;
    },

    _toHex: (color) => {
        if (!color || typeof color !== 'string') return '#000000';
        if (color.startsWith('#')) {
            if (color.length === 4)
                return '#' + [color[1], color[2], color[3]].map(c => c + c).join('');
            return color.slice(0, 7);
        }
        if (color.startsWith('rgb')) {
            const m = color.match(/\d+/g);
            return m ? '#' + m.slice(0, 3).map(n => (+n).toString(16).padStart(2, '0')).join('') : '#000000';
        }
        return '#000000';
    },

    /* Aplica una mutación al objeto activo y redibuja */
    _apply: (fn) => {
        const obj = PropertiesPanel._obj;
        if (!obj || !AppState.canvasRef) return;
        fn(obj);
        obj.setCoords?.();
        AppState.canvasRef.renderAll();
    },

    /* ── Bindings de los controles del panel ── */

    _bindInputs: () => {
        const g = id => document.getElementById(id);

        // Posición
        g('prop-x')?.addEventListener('change', e =>
            PropertiesPanel._apply(o => o.set('left', +e.target.value || 0)));
        g('prop-y')?.addEventListener('change', e =>
            PropertiesPanel._apply(o => o.set('top',  +e.target.value || 0)));

        // Tamaño
        g('prop-w')?.addEventListener('change', e =>
            PropertiesPanel._apply(o => { if (o.width)  o.set('scaleX', (+e.target.value || 1) / o.width);  }));
        g('prop-h')?.addEventListener('change', e =>
            PropertiesPanel._apply(o => { if (o.height) o.set('scaleY', (+e.target.value || 1) / o.height); }));

        // Opacidad
        g('prop-opacity')?.addEventListener('input', e => {
            const v = parseFloat(e.target.value);
            PropertiesPanel._apply(o => o.set('opacity', v));
            const lbl = g('prop-opacity-val');
            if (lbl) lbl.textContent = `${Math.round(v * 100)}%`;
        });

        // Relleno
        g('prop-fill')?.addEventListener('input', e => {
            const hex = e.target.value;
            const hexEl = g('prop-fill-hex');
            if (hexEl) hexEl.textContent = hex;
            PropertiesPanel._apply(o => {
                if (o.type === 'group') {
                    const r = o.getObjects().find(x => x.type === 'rect');
                    if (r) { r.set('fill', hex); o.dirty = true; }
                } else { o.set('fill', hex); }
            });
        });

        // Color de texto
        g('prop-text-color')?.addEventListener('input', e => {
            const hex = e.target.value;
            const hexEl = g('prop-text-color-hex');
            if (hexEl) hexEl.textContent = hex;
            PropertiesPanel._apply(o => {
                const t = PropertiesPanel._extractText(o);
                if (!t) return;
                t.set('fill', hex);
                if (o.type === 'group') o.dirty = true;
            });
        });

        // Tamaño de fuente
        g('prop-font-size')?.addEventListener('change', e =>
            PropertiesPanel._apply(o => {
                const t = PropertiesPanel._extractText(o);
                if (!t) return;
                t.set('fontSize', parseInt(e.target.value) || 14);
                if (o.type === 'group') o.dirty = true;
            }));

        // Familia tipográfica
        g('prop-font-family')?.addEventListener('change', e =>
            PropertiesPanel._apply(o => {
                const t = PropertiesPanel._extractText(o);
                if (!t) return;
                t.set('fontFamily', e.target.value);
                if (o.type === 'group') o.dirty = true;
            }));

        // Negrita
        g('prop-bold')?.addEventListener('click', () =>
            PropertiesPanel._apply(o => {
                const t = PropertiesPanel._extractText(o);
                if (!t) return;
                const on = t.fontWeight !== 'bold';
                t.set('fontWeight', on ? 'bold' : 'normal');
                if (o.type === 'group') o.dirty = true;
                g('prop-bold').classList.toggle('prop-format-btn--active', on);
            }));

        // Cursiva
        g('prop-italic')?.addEventListener('click', () =>
            PropertiesPanel._apply(o => {
                const t = PropertiesPanel._extractText(o);
                if (!t) return;
                const on = t.fontStyle !== 'italic';
                t.set('fontStyle', on ? 'italic' : 'normal');
                if (o.type === 'group') o.dirty = true;
                g('prop-italic').classList.toggle('prop-format-btn--active', on);
            }));

        // Botones de alineación
        document.querySelectorAll('[data-align]').forEach(btn =>
            btn.addEventListener('click', () => AlignmentTools.align(btn.dataset.align)));
        document.querySelectorAll('[data-distribute]').forEach(btn =>
            btn.addEventListener('click', () => AlignmentTools.distribute(btn.dataset.distribute)));
    }
};

/* ===================================================================
 * 4.6. HERRAMIENTAS DE ALINEACIÓN Y DISTRIBUCIÓN
 *
 * Alinea o distribuye los objetos de una selección múltiple.
 * Utiliza getBoundingRect(true, true) para obtener coordenadas
 * absolutas en el canvas independientemente del origen del objeto.
 * =================================================================== */

export const AlignmentTools = {

    align: (direction) => {
        const canvas = AppState.canvasRef;
        if (!canvas) return;
        const sel = canvas.getActiveObject();
        if (!sel || sel.type !== 'activeSelection') return;

        const items = sel.getObjects().map(obj => ({ obj, b: obj.getBoundingRect(true, true) }));

        const minL = Math.min(...items.map(i => i.b.left));
        const maxR = Math.max(...items.map(i => i.b.left + i.b.width));
        const minT = Math.min(...items.map(i => i.b.top));
        const maxB = Math.max(...items.map(i => i.b.top  + i.b.height));
        const midX = (minL + maxR) / 2;
        const midY = (minT + maxB) / 2;

        items.forEach(({ obj, b }) => {
            switch (direction) {
                case 'left':    obj.left += minL - b.left;                        break;
                case 'right':   obj.left += maxR - (b.left + b.width);           break;
                case 'centerX': obj.left += midX - (b.left + b.width  / 2);      break;
                case 'top':     obj.top  += minT - b.top;                         break;
                case 'bottom':  obj.top  += maxB - (b.top  + b.height);          break;
                case 'centerY': obj.top  += midY - (b.top  + b.height / 2);      break;
            }
            obj.setCoords();
        });

        canvas.renderAll();
        CanvasManager.captureHistory();
    },

    distribute: (direction) => {
        const canvas = AppState.canvasRef;
        if (!canvas) return;
        const sel = canvas.getActiveObject();
        if (!sel || sel.type !== 'activeSelection') return;

        const items = sel.getObjects().map(obj => ({ obj, b: obj.getBoundingRect(true, true) }));
        if (items.length < 3) return;

        if (direction === 'horizontal') {
            items.sort((a, b) => a.b.left - b.b.left);
            const totalW = items.reduce((s, i) => s + i.b.width, 0);
            const span   = (items.at(-1).b.left + items.at(-1).b.width) - items[0].b.left;
            const gap    = (span - totalW) / (items.length - 1);
            let curX = items[0].b.left;
            items.forEach(({ obj, b }) => { obj.left += curX - b.left; obj.setCoords(); curX += b.width + gap; });
        } else {
            items.sort((a, b) => a.b.top - b.b.top);
            const totalH = items.reduce((s, i) => s + i.b.height, 0);
            const span   = (items.at(-1).b.top + items.at(-1).b.height) - items[0].b.top;
            const gap    = (span - totalH) / (items.length - 1);
            let curY = items[0].b.top;
            items.forEach(({ obj, b }) => { obj.top += curY - b.top; obj.setCoords(); curY += b.height + gap; });
        }

        canvas.renderAll();
        CanvasManager.captureHistory();
    }
};
