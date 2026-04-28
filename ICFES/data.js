
// data.js — Archivo Central (Hub) de Datos ICFES


import { PREGUNTAS_MATEMATICAS } from './preguntas/dataMatematicas.js';
import { PREGUNTAS_LECTURA } from './preguntas/dataLectura.js';
import { PREGUNTAS_CIENCIAS } from './preguntas/dataCiencias.js';
import { PREGUNTAS_SOCIALES } from './preguntas/dataSociales.js';
import { PREGUNTAS_INGLES } from './preguntas/dataIngles.js';

// Spread operator
export const PREGUNTAS = [
  ...PREGUNTAS_MATEMATICAS,
  ...PREGUNTAS_LECTURA,
  ...PREGUNTAS_CIENCIAS,
  ...PREGUNTAS_SOCIALES,
  ...PREGUNTAS_INGLES
];


// EXPORTACIONES AUXILIARES (Metadatos)

export const MATERIAS    = [...new Set(PREGUNTAS.map((p) => p.materia))];
export const COMPETENCIAS = [...new Set(PREGUNTAS.map((p) => p.competencia))];

export const MATERIA_ICONOS = {
  "Matemáticas":           "🔢",
  "Lectura Crítica":       "📖",
  "Ciencias Naturales":    "🔬",
  "Sociales y Ciudadanas": "🌎",
  "Inglés":                "🇬🇧",
};

export const SUBMATERIA_ICONOS = {
  "Biología": "🧬",
  "Física":   "⚛️",
  "Química":  "🧪",
};

// Niveles de dificultad disponibles para el selector
export const NIVELES_DIFICULTAD = [
  { valor: 'automatico',  label: 'Automático',  desc: 'El sistema ajusta según tu diagnóstico' },
  { valor: 'basico',      label: 'Básico',       desc: 'Solo preguntas de nivel 1' },
  { valor: 'intermedio',  label: 'Intermedio', desc: 'Preguntas de nivel 1 y 2' },
  { valor: 'avanzado',    label: 'Avanzado', desc: 'Todos los niveles de dificultad' },
];


// ESTRATEGIAS DE APRENDIZAJE — Módulo de Refuerzo

export const ESTRATEGIAS_APRENDIZAJE = {
  diagnostico: {
    titulo: '1. Diagnóstico Inicial',
    descripcion: 'Antes de estudiar cualquier tema, identifica tu punto de partida real...'
  },
  competencias: {
    titulo: '2. Enfoque en Competencias',
    descripcion: 'El ICFES no evalúa memorización: evalúa competencias...'
  },
  errores: {
    titulo: '3. Análisis de Errores',
    descripcion: 'Cada error es información valiosa, no un fracaso...'
  },
  bloques: {
    titulo: '4. Bloques Temáticos',
    descripcion: 'Divide el contenido del área en bloques temáticos manejables...'
  },
  presion: {
    titulo: '5. Simulación Bajo Presión',
    descripcion: 'Una vez que domines el contenido, practica en condiciones de examen real...'
  },
  contexto: {
    titulo: '6. Contextualización',
    descripcion: 'Conecta los conceptos del área con situaciones reales...'
  },
  repaso: {
    titulo: '7. Repaso Espaciado',
    descripcion: 'La memoria a largo plazo se construye repasando en intervalos crecientes...'
  },
};

export const AREAS_ICFES = [
  'Lectura Crítica',
  'Matemáticas',
  'Ciencias Naturales',
  'Sociales y Ciudadanas',
  'Inglés'
];