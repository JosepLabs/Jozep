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
        currentState: 'calm', // 'calm' | 'active'
        calmSrc: null,
        activeSrc: null
    }
};

/* ===================================================================
 * CONSTANTES DEL ASISTENTE VIRTUAL
 * =================================================================== */

/** Avatares SVG por defecto (Data-URL) — carga instantánea sin dependencias */
const CompanionPlaceholders = {
    CALM: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="68" height="68"><circle cx="32" cy="32" r="30" fill="%236366f1"/><path d="M18 28 h8 m12 0 h8" stroke="%23ffffff" stroke-width="4" stroke-linecap="round"/><path d="M24 44 q8 -2 16 0" fill="none" stroke="%23ffffff" stroke-width="3" stroke-linecap="round"/><circle cx="32" cy="12" r="3" fill="%23ffffff"/></svg>`,
    ACTIVE: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="68" height="68"><circle cx="32" cy="32" r="30" fill="%234f46e5"/><path d="M18 30 q4 -6 8 0 m12 0 q4 -6 8 0" fill="none" stroke="%23ffffff" stroke-width="3.5" stroke-linecap="round"/><path d="M22 42 q10 8 20 0" fill="none" stroke="%23ffffff" stroke-width="4" stroke-linecap="round"/><circle cx="32" cy="12" r="4" fill="%23f43f5e"/></svg>`
};

/** Pool de frases motivacionales para el asistente */
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
    /** Propiedades de Fabric.js que deben persistir para el grafo relacional */
    CUSTOM_PROPERTIES: ['id', 'customType', 'fromId', 'toId', 'selectable', 'evented'],

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
 * 3. GESTIÓN DE PROYECTOS — Business Logic + I/O
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
        UIController.renderDashboard();
    },

    getProjectById: (id) => {
        return AppState.projects.find(project => project.id === id);
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

    /** Descarga el proyecto activo como archivo .json */
    exportCurrentProject: () => {
        if (!AppState.currentProjectId) return;
        const project = ProjectManager.getProjectById(AppState.currentProjectId);
        if (!project) return;

        // Capturar el estado más reciente del canvas antes de exportar
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

    /** Importa un proyecto desde un archivo .json validando su estructura */
    importProjectFile: (file) => {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const imported = JSON.parse(event.target.result);

                if (!imported.name || !imported.createdAt) {
                    throw new Error('Formato de archivo inválido: faltan metadatos obligatorios.');
                }

                // Asignar un nuevo ID para evitar colisiones con proyectos existentes
                imported.id = crypto.randomUUID();
                imported.name = `[Importado] ${imported.name}`;

                AppState.projects.push(imported);
                StorageModule.save(AppState.projects);
                UIController.renderDashboard();
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
 * 4. MOTOR GRÁFICO — Canvas Manager (Fabric.js)
 * =================================================================== */

const CanvasManager = {

    init: (canvasId) => {
        AppState.canvasRef = new fabric.Canvas(canvasId, {
            backgroundColor: '#f8fafc',
            enableRetinaScaling: true
        });

        CanvasManager.bindResizeEvent();
        CanvasManager.bindDrawingEvents();
    },

    bindResizeEvent: () => {
        const resize = () => {
            const canvasEl = document.getElementById('canvas-element');
            if (!canvasEl || !AppState.canvasRef) return;

            const parent = document.querySelector('.editor-canvas-wrapper');
            if (!parent) return;

            AppState.canvasRef.setWidth(parent.clientWidth);
            AppState.canvasRef.setHeight(parent.clientHeight);
            AppState.canvasRef.renderAll();
        };
        resize();
        window.addEventListener('resize', resize);
    },

    bindDrawingEvents: () => {
        const triggerAutosave = () => {
            if (!AppState.canvasRef || !AppState.currentProjectId) return;
            const jsonData = AppState.canvasRef.toJSON(StorageModule.CUSTOM_PROPERTIES);
            ProjectManager.updateCurrentProjectCanvas(jsonData);
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
            'object:removed':  triggerAutosave
        });
    },

    /** Recalcula la posición de las líneas de conexión al mover un nodo */
    updateNodeLines: (node) => {
        if (!node.connections) return;
        const center = node.getCenterPoint();
        node.connections.forEach(line => {
            if (line.objA === node) {
                line.set({ x1: center.x, y1: center.y });
            } else if (line.objB === node) {
                line.set({ x2: center.x, y2: center.y });
            }
            line.setCoords();
        });
        AppState.canvasRef.renderAll();
    },

    /** Libera referencias cruzadas en memoria antes de cambiar de proyecto */
    clearCanvasReferences: () => {
        if (!AppState.canvasRef) return;
        AppState.canvasRef.getObjects().forEach(obj => {
            if (obj.connections) {
                obj.connections.forEach(line => {
                    line.objA = null;
                    line.objB = null;
                });
                obj.connections = null;
            }
            obj.off();
        });
        AppState.canvasRef.clear();
    },

    /** Carga el canvas de un proyecto y rehidrata el grafo de conexiones */
    loadProjectData: (canvasData) => {
        if (!AppState.canvasRef) return;
        CanvasManager.clearCanvasReferences();

        if (canvasData) {
            AppState.canvasRef.loadFromJSON(canvasData, () => {
                const objectsMap = {};
                const lines = [];

                AppState.canvasRef.getObjects().forEach(obj => {
                    if (obj.id) objectsMap[obj.id] = obj;
                    if (obj.customType === 'connection') lines.push(obj);
                });

                // Rehidratar referencias en memoria para conexiones persistidas
                lines.forEach(line => {
                    const objA = objectsMap[line.fromId];
                    const objB = objectsMap[line.toId];
                    if (objA && objB) {
                        line.objA = objA;
                        line.objB = objB;
                        objA.connections = objA.connections || [];
                        objB.connections = objB.connections || [];
                        objA.connections.push(line);
                        objB.connections.push(line);
                    }
                });

                AppState.canvasRef.renderAll();
            });
        } else {
            AppState.canvasRef.setBackgroundColor(
                '#f8fafc',
                AppState.canvasRef.renderAll.bind(AppState.canvasRef)
            );
        }
    },

    /* --- Herramientas de dibujo --- */

    addText: () => {
        const text = new fabric.IText('Doble clic para editar', {
            left: 100, top: 100,
            fontSize: 20, fontFamily: 'Arial', fill: '#333333',
            id: crypto.randomUUID()
        });
        AppState.canvasRef.add(text).setActiveObject(text);
    },

    addStickyNote: () => {
        const rect = new fabric.Rect({
            width: 150, height: 150,
            fill: '#fef08a',
            shadow: 'rgba(0,0,0,0.15) 3px 3px 6px',
            originX: 'center', originY: 'center'
        });
        const text = new fabric.IText('Nota adhesiva', {
            fontSize: 16, fontFamily: 'Arial', fill: '#1e293b',
            originX: 'center', originY: 'center',
            width: 130, splitByGrapheme: true
        });
        const group = new fabric.Group([rect, text], {
            left: 150, top: 150,
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
            const reader = new FileReader();
            reader.onload = (fEvent) => {
                fabric.Image.fromURL(fEvent.target.result, (img) => {
                    img.set({ left: 100, top: 100, id: crypto.randomUUID() });
                    img.scaleToWidth(150);
                    AppState.canvasRef.add(img).setActiveObject(img);
                });
            };
            reader.readAsDataURL(file);
        };
        fileInput.click();
    },

    /** Agrega un frame de pantalla (mobile o tablet) al canvas */
    addFrame: (type) => {
        const width           = type === 'mobile' ? 375 : 768;
        const calculatedHeight = type === 'mobile' ? 812 : 1024;
        const labelText       = type === 'mobile' ? 'Frame Móvil (375×812)' : 'Frame Tablet (768×1024)';

        const rect = new fabric.Rect({
            width, height: calculatedHeight,
            fill: '#ffffff', stroke: '#cbd5e1', strokeWidth: 1,
            rx: 8, ry: 8,
            originX: 'center', originY: 'center'
        });

        const text = new fabric.Text(labelText, {
            fontSize: 12, fontFamily: 'sans-serif',
            fontWeight: '600', fill: '#64748b',
            originX: 'center', originY: 'center',
            top: (-calculatedHeight / 2) - 15
        });

        const frameGroup = new fabric.Group([rect, text], {
            left: 80, top: 80,
            id: crypto.randomUUID(),
            customType: 'frame'
        });

        AppState.canvasRef.add(frameGroup)
            .sendToBack(frameGroup)
            .setActiveObject(frameGroup)
            .renderAll();
    },

    /** Conecta exactamente dos elementos seleccionados con una línea de flujo */
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

        const line = new fabric.Line(
            [centerA.x, centerA.y, centerB.x, centerB.y],
            {
                stroke: '#6366f1', strokeWidth: 2.5,
                selectable: false, evented: false,
                customType: 'connection',
                fromId: objA.id, toId: objB.id
            }
        );

        line.objA = objA;
        line.objB = objB;
        objA.connections = objA.connections || [];
        objB.connections = objB.connections || [];
        objA.connections.push(line);
        objB.connections.push(line);

        canvas.add(line).sendToBack(line).discardActiveObject().renderAll();

        // Autoguardado manual tras inyección relacional
        const jsonData = canvas.toJSON(StorageModule.CUSTOM_PROPERTIES);
        ProjectManager.updateCurrentProjectCanvas(jsonData);
    },

    /** Elimina los objetos seleccionados y sus líneas de conexión dependientes */
    deleteSelection: () => {
        const canvas = AppState.canvasRef;
        if (!canvas) return;
        const activeObjects = canvas.getActiveObjects();
        if (!activeObjects || activeObjects.length === 0) return;

        activeObjects.forEach(obj => {
            if (obj.connections) {
                obj.connections.forEach(line => {
                    const other = line.objA === obj ? line.objB : line.objA;
                    if (other && other.connections) {
                        other.connections = other.connections.filter(l => l !== line);
                    }
                    canvas.remove(line);
                });
            }
            canvas.remove(obj);
        });

        canvas.discardActiveObject().renderAll();
    }
};

/* ===================================================================
 * 5. ASISTENTE VIRTUAL — Companion Manager
 * =================================================================== */

const CompanionManager = {
    STORAGE_KEYS: {
        VISIBLE: 'companion_visible',
        CALM:    'companion_calm',
        ACTIVE:  'companion_active'
    },
    _bubbleTimeoutId: null,

    /** Carga estado persistido e inicializa el avatar en el DOM */
    init: () => {
        const storedVisible = localStorage.getItem(CompanionManager.STORAGE_KEYS.VISIBLE);
        AppState.companion.visible = storedVisible !== null ? JSON.parse(storedVisible) : true;

        AppState.companion.calmSrc   = localStorage.getItem(CompanionManager.STORAGE_KEYS.CALM)   || CompanionPlaceholders.CALM;
        AppState.companion.activeSrc = localStorage.getItem(CompanionManager.STORAGE_KEYS.ACTIVE) || CompanionPlaceholders.ACTIVE;

        CompanionManager.syncDOMVisibility();
        CompanionManager.setAvatarState('calm');
    },

    /** Muestra u oculta el widget y persiste la preferencia */
    setVisibility: (isVisible) => {
        AppState.companion.visible = isVisible;
        try {
            localStorage.setItem(CompanionManager.STORAGE_KEYS.VISIBLE, JSON.stringify(isVisible));
        } catch (error) {
            console.error('Error al guardar visibilidad del compañero:', error);
        }
        CompanionManager.syncDOMVisibility();
    },

    /** Sincroniza el estado de visibilidad en el DOM y en los toggles de la UI */
    syncDOMVisibility: () => {
        const widget = document.getElementById('companion-container');
        if (!widget) return;

        widget.style.display = AppState.companion.visible ? 'flex' : 'none';

        const toggleDashboard = document.getElementById('toggle-companion-dashboard');
        const toggleEditor    = document.getElementById('toggle-companion-editor');
        if (toggleDashboard) toggleDashboard.checked = AppState.companion.visible;
        if (toggleEditor)    toggleEditor.checked    = AppState.companion.visible;
    },

    /** Cambia la imagen del avatar según el estado ('calm' | 'active') */
    setAvatarState: (state) => {
        const avatarImg = document.getElementById('companion-avatar-img');
        if (!avatarImg) return;
        AppState.companion.currentState = state;
        avatarImg.src = state === 'active'
            ? AppState.companion.activeSrc
            : AppState.companion.calmSrc;
    },

    /** Muestra el bocadillo con un texto fijo durante un tiempo determinado */
    triggerSpeechBubble: (text, durationMs = 4000) => {
        const bubble = document.getElementById('companion-bubble');
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

    /** Muestra el bocadillo con una frase motivacional aleatoria */
    speakRandomPhrase: () => {
        const bubble = document.getElementById('companion-bubble');
        const bubbleText = bubble?.querySelector('.companion-floating-widget__text');
        if (!bubble || !bubbleText) return;

        if (CompanionManager._bubbleTimeoutId) clearTimeout(CompanionManager._bubbleTimeoutId);

        CompanionManager.setAvatarState('active');

        const index = Math.floor(Math.random() * frasesMotivacionales.length);
        bubbleText.textContent = frasesMotivacionales[index];
        bubble.classList.add('companion-floating-widget__bubble--visible');

        // Duración aleatoria entre 4 y 5 segundos para naturalidad
        const delay = Math.floor(Math.random() * 1001) + 4000;
        CompanionManager._bubbleTimeoutId = setTimeout(() => {
            bubble.classList.remove('companion-floating-widget__bubble--visible');
            CompanionManager.setAvatarState('calm');
            CompanionManager._bubbleTimeoutId = null;
        }, delay);
    },

    /** Procesa la imagen subida, la convierte a Base64 y la persiste */
    processAvatarUpload: async (file, type) => {
        if (!file) return;

        const MAX_SIZE = 800 * 1024; // 800 KB
        if (file.size > MAX_SIZE) {
            alert('El archivo supera los 800 KB. Sube una versión optimizada.');
            return;
        }

        try {
            const base64Data = await CompanionManager.convertToBase64(file);

            if (type === 'calm') {
                AppState.companion.calmSrc = base64Data;
                localStorage.setItem(CompanionManager.STORAGE_KEYS.CALM, base64Data);
            } else if (type === 'active') {
                AppState.companion.activeSrc = base64Data;
                localStorage.setItem(CompanionManager.STORAGE_KEYS.ACTIVE, base64Data);
            }

            // Actualizar avatar si el estado actual coincide con el tipo modificado
            if (AppState.companion.currentState === type) {
                CompanionManager.setAvatarState(type);
            }

            CompanionManager.triggerSpeechBubble('¡Me encanta mi nuevo aspecto! Muchas gracias.');
        } catch (error) {
            console.error('Error al procesar avatar Base64:', error);
            alert('No se pudo procesar la imagen. Verifica que el archivo no esté corrupto.');
        }
    },

    convertToBase64: (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload  = (e) => resolve(e.target.result);
            reader.onerror = (err) => reject(err);
            reader.readAsDataURL(file);
        });
    }
};

/* ===================================================================
 * 6. CONTROLADOR DE INTERFAZ — UI Controller
 * =================================================================== */

const UIController = {
    elements: {
        htmlRoot:          document.documentElement,
        dashboardView:     document.getElementById('dashboard-view'),
        editorView:        document.getElementById('editor-view'),
        projectsContainer: document.getElementById('projects-container'),
        btnNewProject:     document.getElementById('btn-new-project'),
        btnBack:           document.getElementById('btn-back'),

        // I/O y temas
        btnExport:    document.getElementById('btn-export'),
        inputImport:  document.getElementById('input-import'),
        selectTheme:  document.getElementById('select-theme'),

        // Herramientas del canvas
        btnToolText:    document.getElementById('tool-text'),
        btnToolSticky:  document.getElementById('tool-sticky'),
        btnToolImage:   document.getElementById('tool-image'),
        btnFrameMobile: document.getElementById('tool-frame-mobile'),
        btnFrameTablet: document.getElementById('tool-frame-tablet'),
        btnConnect:     document.getElementById('tool-connect'),
        btnDelete:      document.getElementById('tool-delete')
    },

    init: () => {
        AppState.projects = StorageModule.load();
        CanvasManager.init('canvas-element');
        CompanionManager.init();
        UIController.bindEvents();
        UIController.showDashboard();
    },

    bindEvents: () => {
        const { elements: el } = UIController;

        // Navegación
        el.btnNewProject?.addEventListener('click', ProjectManager.createProject);
        el.btnBack?.addEventListener('click', UIController.showDashboard);

        // I/O de proyectos
        el.btnExport?.addEventListener('click', ProjectManager.exportCurrentProject);
        el.inputImport?.addEventListener('change', (e) => {
            ProjectManager.importProjectFile(e.target.files[0]);
            e.target.value = ''; // Permite reimportar el mismo archivo
        });

        // Selector de tema
        el.selectTheme?.addEventListener('change', (e) => UIController.applyTheme(e.target.value));

        // Herramientas del canvas
        el.btnToolText?.addEventListener('click', CanvasManager.addText);
        el.btnToolSticky?.addEventListener('click', CanvasManager.addStickyNote);
        el.btnToolImage?.addEventListener('click', CanvasManager.addImage);
        el.btnFrameMobile?.addEventListener('click', () => CanvasManager.addFrame('mobile'));
        el.btnFrameTablet?.addEventListener('click', () => CanvasManager.addFrame('tablet'));
        el.btnConnect?.addEventListener('click', CanvasManager.connectSelectedElements);
        el.btnDelete?.addEventListener('click', CanvasManager.deleteSelection);

        // Asistente virtual
        document.getElementById('toggle-companion-dashboard')?.addEventListener('change', (e) => CompanionManager.setVisibility(e.target.checked));
        document.getElementById('toggle-companion-editor')?.addEventListener('change', (e) => CompanionManager.setVisibility(e.target.checked));
        document.getElementById('input-avatar-calm')?.addEventListener('change', (e) => CompanionManager.processAvatarUpload(e.target.files[0], 'calm'));
        document.getElementById('input-avatar-active')?.addEventListener('change', (e) => CompanionManager.processAvatarUpload(e.target.files[0], 'active'));
        document.getElementById('companion-avatar-trigger')?.addEventListener('click', (e) => {
            e.stopPropagation(); // Evitar interferencia con eventos de Fabric.js
            CompanionManager.speakRandomPhrase();
        });

        // Atajo de teclado: Delete / Backspace para borrar objetos del canvas
        window.addEventListener('keydown', (e) => {
            if ((e.key === 'Delete' || e.key === 'Backspace') && AppState.canvasRef) {
                const activeObj = AppState.canvasRef.getActiveObject();
                if (activeObj && activeObj.isEditing) return; // No borrar mientras se edita texto
                CanvasManager.deleteSelection();
            }
        });
    },

    /** Aplica un tema visual cambiando el atributo data-theme en el <html> */
    applyTheme: (themeName) => {
        if (!themeName) return;
        UIController.elements.htmlRoot.setAttribute('data-theme', themeName);
        if (UIController.elements.selectTheme) {
            UIController.elements.selectTheme.value = themeName;
        }
        if (AppState.currentProjectId) {
            ProjectManager.updateProjectTheme(themeName);
        }
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
        UIController.applyTheme(project.theme || AppState.defaultTheme);

        UIController.elements.dashboardView.style.display = 'none';
        UIController.elements.editorView.style.display = 'flex';

        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
            CanvasManager.loadProjectData(project.canvasData);
        }, 50);

        CompanionManager.syncDOMVisibility();
    },

    showDashboard: () => {
        CanvasManager.clearCanvasReferences();
        AppState.currentProjectId = null;
        UIController.applyTheme(AppState.defaultTheme);

        UIController.elements.editorView.style.display = 'none';
        UIController.elements.dashboardView.style.display = 'block';
        UIController.renderDashboard();

        CompanionManager.syncDOMVisibility();
    }
};

/* ===================================================================
 * ARRANQUE DE LA APLICACIÓN
 * =================================================================== */
document.addEventListener('DOMContentLoaded', UIController.init);
