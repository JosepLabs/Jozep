/**
 * ====================================================================
 * projectManager.js — Gestión de Proyectos
 * ====================================================================
 *
 * Lógica de negocio + I/O (export/import) de proyectos.
 * Depende del estado global (AppState), de la capa de persistencia
 * asíncrona (StorageModule, basada en IndexedDB) y del controlador de
 * interfaz (UIController) para disparar la navegación tras crear/
 * importar un proyecto.
 *
 * Cada proyecto se persiste como un registro independiente en
 * IndexedDB (vía StorageModule.saveProject/deleteProject), por lo que
 * proyectos con canvasData muy pesado no comparten límite de tamaño
 * con el resto ni bloquean el hilo principal al guardarse.
 * ==================================================================== */

import { AppState } from './state.js';
import { StorageModule } from './storage.js';
import { UIController } from './uiController.js';

export const ProjectManager = {

    createProject: async () => {
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
        await StorageModule.saveProject(newProject);
        UIController.navigateDashboardSection('my-projects');
    },

    getProjectById: (id) => AppState.projects.find(p => p.id === id),

    deleteProject: async (id) => {
        AppState.projects = AppState.projects.filter(p => p.id !== id);
        await StorageModule.deleteProject(id);
    },

    updateCurrentProjectCanvas: async (jsonData) => {
        if (!AppState.currentProjectId) return;
        const project = ProjectManager.getProjectById(AppState.currentProjectId);
        if (project) {
            project.canvasData = jsonData;
            await StorageModule.saveProject(project);
        }
    },

    updateProjectTheme: async (themeName) => {
        if (!AppState.currentProjectId) return;
        const project = ProjectManager.getProjectById(AppState.currentProjectId);
        if (project) {
            project.theme = themeName;
            await StorageModule.saveProject(project);
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
        reader.onload = async (event) => {
            try {
                const imported = JSON.parse(event.target.result);
                if (!imported.name || !imported.createdAt) {
                    throw new Error('Formato de archivo inválido: faltan metadatos obligatorios.');
                }
                imported.id = crypto.randomUUID();
                imported.name = `[Importado] ${imported.name}`;
                AppState.projects.push(imported);
                await StorageModule.saveProject(imported);
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
