/**
 * ====================================================================
 * main.js — Punto de entrada de la aplicación
 * ====================================================================
 *
 * Importa el controlador de interfaz y arranca la aplicación cuando
 * el DOM está listo. Es el único punto donde se "conectan" todos los
 * módulos entre sí; no contiene lógica de negocio propia.
 * ==================================================================== */

import { UIController } from './uiController.js';

document.addEventListener('DOMContentLoaded', UIController.init);
