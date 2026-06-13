/**
 * ====================================================================
 * uiController.js — Interfaz de Usuario
 * ====================================================================
 *
 * Controlador de interfaz y navegación. Conecta los elementos del DOM
 * con la lógica de negocio (ProjectManager), el motor gráfico
 * (CanvasManager) y el asistente virtual (CompanionManager), y
 * gestiona el estado global de la aplicación (AppState).
 * ==================================================================== */

import { AppState } from './state.js';
import { StorageModule } from './storage.js';
import { ProjectManager } from './projectManager.js';
import { CanvasManager } from './canvasManager.js';
import { CompanionManager } from './companionManager.js';

/* ===================================================================
 * 6. CONTROLADOR DE INTERFAZ
 * =================================================================== */

export const UIController = {
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
        // Componentes wireframe
        btnInputField: document.getElementById('tool-input-field'),
        btnNavBar:     document.getElementById('tool-navbar'),
        btnCard:       document.getElementById('tool-card'),
        btnCheckbox:   document.getElementById('tool-checkbox'),
        // Snap
        toggleSnap:    document.getElementById('toggle-snap-grid'),
        // Historia y zoom
        btnUndo:      document.getElementById('btn-undo'),
        btnRedo:      document.getElementById('btn-redo'),
        btnZoomIn:    document.getElementById('btn-zoom-in'),
        btnZoomOut:   document.getElementById('btn-zoom-out'),
        btnZoomReset: document.getElementById('btn-zoom-reset'),
        btnZoomFit:   document.getElementById('btn-zoom-fit')
    },

    /**
     * Inicialización asíncrona: carga proyectos y configuración desde
     * IndexedDB antes de montar el resto de la interfaz, ya que todas
     * las operaciones de StorageModule devuelven Promesas.
     */
    init: async () => {
        AppState.projects = await StorageModule.getAllProjects();

        const savedTheme = await StorageModule.getSetting('theme');
        if (savedTheme) AppState.defaultTheme = savedTheme;

        CanvasManager.init('canvas-element');
        await CompanionManager.init();
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

        // Componentes wireframe
        el.btnInputField?.addEventListener('click', CanvasManager.addInputField);
        el.btnNavBar?.addEventListener('click', CanvasManager.addNavBar);
        el.btnCard?.addEventListener('click', CanvasManager.addCard);
        el.btnCheckbox?.addEventListener('click', CanvasManager.addCheckbox);

        // Snap a cuadrícula
        el.toggleSnap?.addEventListener('change', (e) => {
            AppState.snapToGrid = e.target.checked;
        });

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
        StorageModule.setSetting('theme', themeName).catch(err =>
            console.error('Error al guardar el tema por defecto:', err));
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
            item.querySelector('.trash-item__btn').addEventListener('click', async () => {
                if (confirm(`¿Eliminar el proyecto "${project.name}"?\n\nEsta acción no se puede deshacer.`)) {
                    await ProjectManager.deleteProject(project.id);
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

