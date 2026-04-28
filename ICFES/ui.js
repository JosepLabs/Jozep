// =====================================================
// ui.js — Funciones de Renderizado del DOM
// v5: Soporte completo para tipoPregunta 'relacionar' con
//     layout de dos columnas + hoja de respuestas independiente.
// =====================================================

import {
  MATERIA_ICONOS,
  SUBMATERIA_ICONOS,
  NIVELES_DIFICULTAD,
  MATERIAS,
  ESTRATEGIAS_APRENDIZAJE,
} from './data.js';

// =====================================================
// MENÚ PRINCIPAL — Layout full-width de dos columnas
// =====================================================

export function renderMenuPrincipal(nivelActual = 'automatico') {
  const botonesNivel = NIVELES_DIFICULTAD.map((n) => `
    <button
      class="nivel-btn ${n.valor === nivelActual ? 'nivel-btn--activo' : ''}"
      data-nivel="${n.valor}"
      title="${n.desc}"
      aria-pressed="${n.valor === nivelActual}"
    >
      ${n.label}
    </button>
  `).join('');

  return `
    <div class="menu-principal">

      <!-- HERO STRIP — full width -->
      <header class="menu-hero">
        <div class="menu-hero__left">
          <p class="menu-hero__eyebrow">Preparación Saber 11°</p>
          <h1 class="menu-hero__title">ICFES<em>Prep</em></h1>
        </div>
        <nav class="menu-hero__stats" aria-label="Estadísticas">
          <div class="menu-stat">
            <span class="menu-stat__num">375+</span>
            <span class="menu-stat__label">Preguntas</span>
          </div>
          <div class="menu-stat">
            <span class="menu-stat__num">5</span>
            <span class="menu-stat__label">Materias</span>
          </div>
          <div class="menu-stat">
            <span class="menu-stat__num">3</span>
            <span class="menu-stat__label">Niveles</span>
          </div>
        </nav>
      </header>

      <!-- BODY — dos columnas -->
      <div class="menu-body">

        <!-- Columna izquierda: dificultad + modos -->
        <div class="menu-left-col">

          <!-- SELECTOR DE DIFICULTAD -->
          <div class="dificultad-section">
            <div class="dificultad-header">
              <span class="dificultad-titulo">Nivel de Dificultad</span>
              ${nivelActual === 'automatico'
                ? `<button class="btn-diagnostico-link" id="btn-ir-diagnostico">
                     Hacer diagnóstico
                   </button>`
                : ''}
            </div>
            <div class="nivel-selector" role="group" aria-label="Seleccionar nivel de dificultad">
              ${botonesNivel}
            </div>
          </div>

          <!-- TARJETAS DE MODO -->
          <div class="modo-cards">

            <div class="modo-card" id="btn-plan" role="button" tabindex="0"
                 aria-label="Ver mi plan de mejora">
              <h2 class="modo-card__title">Mi Plan de Mejora</h2>
              <p class="modo-card__desc">
                Rutina diaria personalizada basada en tus simulacros anteriores.
                Enfocada en tus áreas más débiles con análisis de progreso.
              </p>
              <span class="modo-card__tag">Personalizado · Dashboard</span>
            </div>

            <div class="modo-card modo-card--simulacro" id="btn-simulacro" role="button" tabindex="0"
                 aria-label="Iniciar simulacro">
              <h2 class="modo-card__title">Simulacro ICFES</h2>
              <p class="modo-card__desc">
                Todas las materias mezcladas con temporizador real. Condiciones
                de examen auténtico. Informe detallado al finalizar.
              </p>
              <span class="modo-card__tag">Cronometrado · Informe final</span>
            </div>

          </div>
        </div>

        <!-- Columna derecha: refuerzo por área -->
        <div class="menu-right-col">
          <div class="areas-section">
            <div class="areas-section__header">
              <span class="areas-section__titulo">Refuerzo por Área</span>
              <span class="areas-section__sub">Profundiza en una materia con estrategias y entrenamiento focalizado</span>
            </div>
            <div class="areas-grid">
              ${MATERIAS.map((mat) => `
                <button class="area-card" data-materia="${mat}"
                        aria-label="Ir al módulo de refuerzo de ${mat}">
                  <span class="area-card__name">${mat}</span>
                </button>
              `).join('')}
            </div>
          </div>
        </div>

      </div>
    </div>
  `;
}

// =====================================================
// DASHBOARD DEL ESTUDIANTE
// =====================================================

export function renderDashboardEstudiante(dashboardData, yaHizoRutina, nivelActual = 'automatico') {
  const { totalSimulacros, materias, ultimoSimulacro, tendencia, promedioGlobal } = dashboardData;

  const tendenciaInfo = {
    mejorando:  { simbolo: '↑',  texto: 'Mejorando',    cls: 'verde'    },
    estable:    { simbolo: '→',  texto: 'Estable',       cls: 'amarillo' },
    decayendo:  { simbolo: '↓',  texto: 'Bajando',       cls: 'rojo'     },
    sin_datos:  { simbolo: '—',  texto: 'Sin datos aún', cls: 'muted'    },
  }[tendencia] || { simbolo: '—', texto: 'Sin datos', cls: 'muted' };

  let barrasHTML = '';
  if (materias.length === 0) {
    barrasHTML = `
      <div class="dashboard-empty">
        <p>Haz tu primer <strong>Simulacro</strong> para ver tu progreso aquí.</p>
        <p style="font-size:0.82rem; margin-top:6px;">El sistema analiza tus respuestas y te muestra exactamente dónde mejorar.</p>
      </div>
    `;
  } else {
    const grupos = {};
    materias.forEach((m) => {
      const grupo = m.materia;
      if (!grupos[grupo]) grupos[grupo] = [];
      grupos[grupo].push(m);
    });

    barrasHTML = Object.entries(grupos).map(([materia, items]) => {
      const itemsHTML = items.map((item) => {
        const pct    = item.porcentaje ?? 0;
        const color  = pct >= 70 ? 'verde' : pct >= 50 ? 'amarillo' : 'rojo';
        const label  = item.subMateria ? item.subMateria : materia;
        const sinDatos = item.porcentaje === null;

        return `
          <div class="dash-barra">
            <div class="dash-barra__info">
              <span class="dash-barra__label">${label}</span>
              <span class="dash-barra__score ${sinDatos ? 'muted' : ''}">
                ${sinDatos ? 'Sin datos' : `${item.correctas}/${item.total} · ${pct}%`}
              </span>
            </div>
            <div class="barra-progreso" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100">
              <div class="barra-progreso__fill barra-color-${color}"
                   style="width: ${sinDatos ? 0 : pct}%;">
              </div>
            </div>
          </div>
        `;
      }).join('');

      return `
        <div class="dash-grupo">
          ${items.length > 1 || items[0].subMateria
            ? `<div class="dash-grupo__titulo">${materia}</div>`
            : ''}
          ${itemsHTML}
        </div>
      `;
    }).join('');
  }

  const ultimoHTML = ultimoSimulacro
    ? `<div class="dash-stat">
         <span class="dash-stat__num">${ultimoSimulacro.puntajeSobre100}<small>/100</small></span>
         <span class="dash-stat__label">Último simulacro</span>
       </div>`
    : `<div class="dash-stat">
         <span class="dash-stat__num dash-stat__num--muted">—</span>
         <span class="dash-stat__label">Último simulacro</span>
       </div>`;

  const promedioHTML = promedioGlobal !== null
    ? `<div class="dash-stat">
         <span class="dash-stat__num">${promedioGlobal}<small>/100</small></span>
         <span class="dash-stat__label">Promedio global</span>
       </div>`
    : `<div class="dash-stat">
         <span class="dash-stat__num dash-stat__num--muted">—</span>
         <span class="dash-stat__label">Promedio global</span>
       </div>`;

  const nivelLabel = NIVELES_DIFICULTAD.find((n) => n.valor === nivelActual)?.label || 'Automático';
  const botonRutinaHTML = yaHizoRutina
    ? `<button class="btn-rutina btn-rutina--completada" disabled>
         Rutina de hoy completada
         <span class="btn-rutina__sub">Vuelve mañana para tu próxima rutina</span>
       </button>`
    : `<button class="btn-rutina" id="btn-iniciar-rutina">
         Iniciar Rutina de Hoy
         <span class="btn-rutina__sub">~12 preguntas · Nivel: ${nivelLabel}</span>
       </button>`;

  return `
    <div class="dashboard-container">

      <div class="dashboard-header">
        <button class="btn-back" id="btn-volver-menu-dash">← Volver</button>
        <div>
          <h2>Mi Plan de Mejora</h2>
          <p style="margin:0; font-size:0.82rem; color:var(--text-muted);">
            ${totalSimulacros === 0
              ? 'Completa tu primer simulacro para activar el plan'
              : `Basado en ${totalSimulacros} simulacro${totalSimulacros !== 1 ? 's' : ''} realizados`}
          </p>
        </div>
      </div>

      <div class="dash-stats-row">
        <div class="dash-stat">
          <span class="dash-stat__num">${totalSimulacros}</span>
          <span class="dash-stat__label">Simulacros</span>
        </div>
        ${ultimoHTML}
        ${promedioHTML}
        <div class="dash-stat">
          <span class="dash-stat__num tendencia-${tendenciaInfo.cls}">
            ${tendenciaInfo.simbolo}
          </span>
          <span class="dash-stat__label">${tendenciaInfo.texto}</span>
        </div>
      </div>

      <div class="reporte-seccion">
        <h3>Progreso por Materia</h3>
        <p style="font-size:0.82rem; color:var(--text-muted); margin-bottom:var(--sp-lg);">
          Acumulado de todos tus simulacros. Las barras en rojo indican las áreas prioritarias.
        </p>
        <div class="dash-barras-container">
          ${barrasHTML}
        </div>
      </div>

      <div class="rutina-section">
        ${botonRutinaHTML}
      </div>

      <div class="reporte-seccion areas-section areas-section--dash">
        <h3>Refuerzo por Área</h3>
        <p style="font-size:0.82rem; color:var(--text-muted); margin-bottom:var(--sp-lg);">
          Entrena una materia específica con estrategias personalizadas y preguntas focalizadas.
        </p>
        <div class="areas-grid">
          ${MATERIAS.map((mat) => `
            <button class="area-card" data-materia="${mat}" aria-label="Reforzar ${mat}">
              <span class="area-card__name">${mat}</span>
            </button>
          `).join('')}
        </div>
      </div>

    </div>
  `;
}

// =====================================================
// RESULTADO DEL DIAGNÓSTICO
// =====================================================

export function renderResultadoDiagnostico(resultados, nivelAsignado) {
  const { puntajeSobre100, totalCorrectas, totalPreguntas } = resultados;

  const nivelInfo = {
    basico:     { label: 'Básico',      color: 'verde',    msg: 'Empezaremos desde los fundamentos. Construiremos una base sólida paso a paso.' },
    intermedio: { label: 'Intermedio',  color: 'amarillo', msg: 'Tienes buenas bases. El siguiente paso es la profundización temática.' },
    avanzado:   { label: 'Avanzado',    color: 'verde',    msg: 'Tu nivel es alto. Trabajaremos en los detalles finos para el puntaje máximo.' },
  }[nivelAsignado] || { label: 'Intermedio', color: 'amarillo', msg: '' };

  return `
    <div class="diagnostico-resultado">
      <h2>Diagnóstico Completado</h2>
      <p class="diagnostico-score">
        Respondiste correctamente <strong>${totalCorrectas} de ${totalPreguntas}</strong> preguntas (${puntajeSobre100}%)
      </p>
      <div class="puntaje-hero puntaje--${nivelInfo.color}" style="max-width:320px; margin: var(--sp-xl) auto;">
        <div class="puntaje-numero" style="font-size:2.5rem;">${puntajeSobre100}</div>
        <div class="puntaje-label">Nivel asignado</div>
        <div class="puntaje-sub" style="font-size:1.1rem; font-weight:700;">${nivelInfo.label}</div>
      </div>
      <p class="diagnostico-msg">${nivelInfo.msg}</p>
      <p style="font-size:0.82rem; color:var(--text-muted); margin-top:var(--sp-md);">
        Puedes cambiar el nivel manualmente en cualquier momento desde el menú principal.
      </p>
      <button class="btn-primary btn-full" id="btn-ir-menu-desde-diag" style="margin-top:var(--sp-xl);">
        Ir al Menú Principal
      </button>
    </div>
  `;
}

// =====================================================
// DETALLE DE ÁREA — Módulo de Refuerzo
// =====================================================

export function renderDetalleArea(materia, statsData, nivelArea = 'intermedio') {
  const nivelLabels = {
    basico:     'Básico',
    intermedio: 'Intermedio',
    avanzado:   'Avanzado',
  };
  const nivelLabel = nivelLabels[nivelArea] || 'Intermedio';

  const nivelesEntrenamiento = [
    { valor: 'basico',     label: 'Básico'      },
    { valor: 'intermedio', label: 'Intermedio'  },
    { valor: 'avanzado',   label: 'Avanzado'    },
  ];
  const nivelBtnsHTML = nivelesEntrenamiento.map((n) => `
    <button
      class="nivel-btn ${n.valor === nivelArea ? 'nivel-btn--activo' : ''}"
      data-nivel="${n.valor}"
      data-accion="cambiar-nivel-area"
      aria-pressed="${n.valor === nivelArea}"
    >
      ${n.label}
    </button>
  `).join('');

  let dashHTML = '';
  if (statsData.totalRespuestas === 0) {
    dashHTML = `
      <div class="dashboard-empty">
        <p>Aún no has practicado <strong>${materia}</strong> en ningún simulacro.</p>
        <p style="font-size:0.82rem; margin-top:6px; color:var(--text-muted);">
          Completa tu primer Entrenamiento Focalizado para ver tu progreso aquí.
        </p>
      </div>
    `;
  } else {
    const pct       = statsData.porcentaje;
    const colorCls  = pct >= 70 ? 'verde' : pct >= 50 ? 'amarillo' : 'rojo';
    const fallasCnt = statsData.competenciasConFallas.length;

    const subBarrasHTML = statsData.items.length > 1
      ? `<div class="dash-barras-container" style="margin-top:var(--sp-md);">
           ${statsData.items.map((item) => {
             const iPct   = item.porcentaje ?? 0;
             const iColor = iPct >= 70 ? 'verde' : iPct >= 50 ? 'amarillo' : 'rojo';
             return `
               <div class="dash-barra">
                 <div class="dash-barra__info">
                   <span class="dash-barra__label">${item.label}</span>
                   <span class="dash-barra__score">${item.correctas}/${item.total} · ${iPct}%</span>
                 </div>
                 <div class="barra-progreso" role="progressbar"
                      aria-valuenow="${iPct}" aria-valuemin="0" aria-valuemax="100">
                   <div class="barra-progreso__fill barra-color-${iColor}" style="width:${iPct}%;"></div>
                 </div>
               </div>
             `;
           }).join('')}
         </div>`
      : '';

    const fallasHTML = fallasCnt > 0
      ? `<div class="detalle-area-fallas">
           <h4 style="font-size:0.88rem; margin-bottom:var(--sp-sm); color:var(--text-primary);">Competencias Prioritarias</h4>
           <p style="font-size:0.78rem; color:var(--text-muted); margin-bottom:var(--sp-md);">
             El entrenamiento priorizará estas competencias automáticamente.
           </p>
           ${statsData.competenciasConFallas.map((f) => {
             const fColor = f.porcentaje >= 50 ? 'amarillo' : 'rojo';
             return `
               <div class="falla-item">
                 <div class="falla-item__row">
                   <span class="falla-competencia">${f.competencia}</span>
                   <span class="falla-score" style="color:var(--${fColor === 'rojo' ? 'error' : 'warning'})">
                     ${f.correctas}/${f.total} — ${f.porcentaje}%
                   </span>
                 </div>
                 <div class="barra-progreso barra-progreso--sm">
                   <div class="barra-progreso__fill barra-color-${fColor}" style="width:${f.porcentaje}%;"></div>
                 </div>
               </div>
             `;
           }).join('')}
         </div>`
      : `<div style="padding:var(--sp-md); background:var(--success-bg); border-radius:var(--radius-md);
              border:1px solid rgba(74,222,128,0.15); margin-top:var(--sp-md);">
           <p style="color:var(--success); font-weight:600; font-size:0.88rem; margin:0;">
             Sin competencias críticas. Estás en el buen camino.
           </p>
         </div>`;

    dashHTML = `
      <div class="detalle-area-stats-row">
        <div class="dash-stat">
          <span class="dash-stat__num" style="color:var(--${colorCls === 'verde' ? 'success' : colorCls === 'amarillo' ? 'warning' : 'error'})">
            ${pct}<small>%</small>
          </span>
          <span class="dash-stat__label">Precisión total</span>
        </div>
        <div class="dash-stat">
          <span class="dash-stat__num">${statsData.correctas}<small>/${statsData.totalRespuestas}</small></span>
          <span class="dash-stat__label">Respuestas correctas</span>
        </div>
        <div class="dash-stat">
          <span class="dash-stat__num" style="color:var(--${fallasCnt === 0 ? 'success' : 'error'})">${fallasCnt}</span>
          <span class="dash-stat__label">Competencias a reforzar</span>
        </div>
      </div>
      ${subBarrasHTML}
      <div style="margin-top:var(--sp-lg);">${fallasHTML}</div>
    `;
  }

  const estrategiasHTML = Object.values(ESTRATEGIAS_APRENDIZAJE).map((e, i) => `
    <details class="estrategia-item" ${i === 0 ? 'open' : ''}>
      <summary class="estrategia-item__header">
        <span class="estrategia-item__titulo">${e.titulo}</span>
        <span class="estrategia-item__chevron" aria-hidden="true">▶</span>
      </summary>
      <div class="estrategia-item__body">
        <p>${e.descripcion}</p>
      </div>
    </details>
  `).join('');

  return `
    <div class="detalle-area-container">

      <div class="detalle-area-hero">
        <button class="btn-back" id="btn-volver-desde-detalle">← Volver</button>
        <div class="detalle-area-hero__title">
          <div>
            <h2 style="margin-bottom:2px;">${materia}</h2>
            <p style="margin:0; font-size:0.82rem; color:var(--text-muted);">Módulo de Refuerzo Personalizado</p>
          </div>
        </div>
        <div class="detalle-area-nivel">
          <span class="dificultad-titulo">Nivel de entrenamiento</span>
          <div class="nivel-selector" role="group" aria-label="Nivel de entrenamiento para ${materia}">
            ${nivelBtnsHTML}
          </div>
        </div>
      </div>

      <div class="reporte-seccion">
        <h3>Tu Historial en esta Área</h3>
        ${dashHTML}
      </div>

      <div class="reporte-seccion">
        <h3>Estrategias de Estudio</h3>
        <p style="font-size:0.83rem; color:var(--text-muted); margin-bottom:var(--sp-lg);">
          7 técnicas probadas para mejorar tu desempeño en <strong>${materia}</strong>.
          Haz clic en cada estrategia para expandirla.
        </p>
        <div class="estrategias-accordion">
          ${estrategiasHTML}
        </div>
      </div>

      <div class="entrenamiento-section">
        <button class="btn-entrenamiento" id="btn-iniciar-entrenamiento" data-materia="${materia}">
          <span class="btn-entrenamiento__main">Iniciar Entrenamiento Focalizado</span>
          <span class="btn-entrenamiento__sub">12 preguntas · Solo ${materia} · ${nivelLabel}</span>
        </button>
      </div>

    </div>
  `;
}

// =====================================================
// SELECCIÓN DE MATERIA
// =====================================================

export function renderSeleccionMateria(materias) {
  const botonesHTML = materias.map((materia) => `
    <button class="materia-btn" data-materia="${materia}" aria-label="Estudiar ${materia}">
      <span class="materia-btn__text">${materia}</span>
    </button>
  `).join('');

  return `
    <div class="seleccion-materia">
      <button class="btn-back" id="btn-volver-menu" aria-label="Volver al menú principal">
        ← Volver
      </button>
      <h2>¿Qué materia quieres repasar hoy?</h2>
      <p style="margin-bottom: 32px; color: var(--text-secondary);">
        Selecciona un área para practicar con retroalimentación inmediata.
      </p>
      <div class="materias-grid">
        ${botonesHTML}
      </div>
    </div>
  `;
}

// =====================================================
// PREGUNTA
// Soporta: 'estandar' | 'aviso' | 'relacionar'
// =====================================================

export function renderPregunta(pregunta, numero, total, modo, respuestaPrevia = null) {
  const letras = Object.keys(pregunta.opciones);
  const progresoPorcentaje = (numero / total) * 100;
  const esUltima  = numero === total;
  const tipoBloque = pregunta.tipoPregunta || 'estandar';
  const esAmplia   = letras.length > 4;

  // ── Opciones HTML (sólo se usa para estandar/aviso)
  const opcionesHTML = letras.map((letra) => {
    const estaSeleccionada = respuestaPrevia === letra;
    return `
      <button
        class="opcion-btn ${estaSeleccionada ? 'opcion-btn--seleccionada' : ''}"
        data-opcion="${letra}"
        aria-label="Opción ${letra}: ${_escaparHTML(pregunta.opciones[letra])}"
        ${respuestaPrevia && (modo === 'estudio' || modo === 'diagnostico') ? 'disabled' : ''}
      >
        <span class="opcion-letra">${letra}</span>
        <span class="opcion-texto">${_escaparHTML(pregunta.opciones[letra])}</span>
      </button>
    `;
  }).join('');

  const mediaHTML = pregunta.imagen
  ? `<figure class="pregunta-media-wrapper" role="img"
              aria-label="${_escaparHTML(pregunta.imagen.alt || `Material de apoyo para la pregunta de ${pregunta.materia}`)}">
       <img
         src="${_escaparHTML(pregunta.imagen.src)}"
         alt="${_escaparHTML(pregunta.imagen.alt || `Imagen de apoyo — ${pregunta.materia}`)}"
         class="pregunta-media"
         loading="lazy"
         decoding="async"
       />
       ${pregunta.imagen.caption
         ? `<figcaption class="pregunta-media-caption">${_escaparHTML(pregunta.imagen.caption)}</figcaption>`
         : ''}
     </figure>`
  : '';

  let contextoHTML = '';

  switch (tipoBloque) {

    // ── AVISO
    case 'aviso': {
      const lineasCartel = pregunta.contexto
        .split('\n')
        .filter((l) => l.trim() !== '')
        .map((l) => `<p>${_escaparHTML(l)}</p>`)
        .join('');

      const textoPregunta = pregunta.pregunta
        ? `<p class="pregunta-aviso__question">${_escaparHTML(pregunta.pregunta)}</p>`
        : '';

      contextoHTML = `
        <div class="pregunta-aviso-wrapper" lang="en">
          <p class="pregunta-aviso__instruccion">Read the notice and answer the question.</p>
          <div class="pregunta-aviso" role="img" aria-label="Aviso en inglés">
            ${lineasCartel}
          </div>
          ${textoPregunta}
        </div>
      `;
      break;
    }

    // ── RELACIONAR — Layout de dos columnas + Hoja de Respuestas
    case 'relacionar': {
      const instruccion = pregunta.contexto
        ? `<p class="pregunta-relacionar__instruccion">${_escaparHTML(pregunta.contexto)}</p>`
        : '';

      // Columna izquierda: definiciones numeradas
      const definicionesHTML = (pregunta.definiciones || []).map((d) => `
        <div class="relacionar-item" role="listitem">
          <span class="relacionar-item__num">${d.numero}</span>
          <span class="relacionar-item__texto">${_escaparHTML(d.texto)}</span>
        </div>
      `).join('');

      // Columna derecha: vocabulario / opciones (solo visualización)
      const vocabularioHTML = letras.map((letra) => `
        <div class="vocabulario-item">
          <span class="vocabulario-letra">${letra}.</span>
          <span class="vocabulario-texto">${_escaparHTML(pregunta.opciones[letra])}</span>
        </div>
      `).join('');

      // Hoja de Respuestas: una fila por definición, botones A–H
      // Detectar si ya hay respuestas previas (objeto o null)
      const selPrev = (typeof respuestaPrevia === 'object' && respuestaPrevia !== null)
        ? respuestaPrevia
        : {};
      const yaRespondido = Object.keys(selPrev).length > 0
        && (modo === 'estudio' || modo === 'diagnostico');

      const hojaFilasHTML = (pregunta.definiciones || []).map((d) => {
        const letrasBtnsHTML = letras.map((letra) => {
          const estaSeleccionada = selPrev[d.numero] === letra;
          return `
            <button
              class="hoja-respuesta-btn ${estaSeleccionada ? 'hoja-respuesta-btn--seleccionado' : ''}"
              data-definicion="${d.numero}"
              data-letra="${letra}"
              aria-label="Relacionar definición ${d.numero} con ${letra}: ${_escaparHTML(pregunta.opciones[letra])}"
              ${yaRespondido ? 'disabled' : ''}
            >${letra}</button>
          `;
        }).join('');

        return `
          <div class="hoja-fila" role="row">
            <span class="hoja-fila__num" aria-label="Definición ${d.numero}">${d.numero}.</span>
            <div class="hoja-fila__botones" role="group" aria-label="Opciones para definición ${d.numero}">
              ${letrasBtnsHTML}
            </div>
          </div>
        `;
      }).join('');

      contextoHTML = `
        <div class="pregunta-relacionar-wrapper" lang="en">
          ${instruccion}

          <!-- Dos columnas: definiciones (izq) + vocabulario (der) -->
          <div class="relacionar-dos-columnas">
            <div class="relacionar-col-defs">
              <div class="pregunta-relacionar-lista" role="list" aria-label="Definiciones">
                ${definicionesHTML}
              </div>
            </div>
            <div class="relacionar-col-vocab">
              <div class="vocabulario-lista" role="list" aria-label="Vocabulario">
                ${vocabularioHTML}
              </div>
            </div>
          </div>

          <!-- Hoja de Respuestas Independiente -->
          <div class="hoja-respuestas" role="region" aria-label="Hoja de respuestas">
            <p class="hoja-respuestas__titulo">Hoja de Respuestas</p>
            <div class="hoja-respuestas__filas">
              ${hojaFilasHTML}
            </div>
          </div>
        </div>
      `;
      break;
    }

    // ── ESTÁNDAR (default)
    default: {
      const lineas = pregunta.contexto
        .split('\n')
        .filter((l) => l.trim() !== '')
        .map((l) => `<p>${_escaparHTML(l)}</p>`)
        .join('');

      contextoHTML = `
        <div class="pregunta-contexto" lang="${pregunta.materia === 'Inglés' ? 'en' : 'es'}">
          ${lineas}
        </div>
      `;
    }
  }

  const subMateriaTag = pregunta.subMateria
    ? `<span class="badge badge--submateria">${pregunta.subMateria}</span>`
    : '';

  // Para 'relacionar', el grid de opciones se reemplaza por la hoja de respuestas incrustada en contextoHTML
  const mostrarOpcionesGrid = tipoBloque !== 'relacionar';

  return `
    <div class="pregunta-container" role="main" aria-label="Pregunta ${numero} de ${total}">

      <div class="pregunta-header">
        <div class="pregunta-meta">
          <span class="badge badge--materia">${pregunta.materia}</span>
          ${subMateriaTag}
          <span class="badge badge--competencia">${pregunta.competencia}</span>
          <span class="badge badge--dificultad dificultad-${pregunta.dificultad}" title="Nivel de dificultad ${pregunta.dificultad}">
            ${'★'.repeat(pregunta.dificultad)}${'☆'.repeat(3 - pregunta.dificultad)}
          </span>
        </div>

        <div class="pregunta-progreso">
          <span class="progreso-texto">Pregunta ${numero} de ${total}</span>
          <div class="barra-progreso" role="progressbar" aria-valuenow="${numero}" aria-valuemin="1" aria-valuemax="${total}">
            <div class="barra-progreso__fill" style="width: ${progresoPorcentaje}%;"></div>
          </div>
        </div>
      </div>

      ${mediaHTML}
      ${contextoHTML}

      ${mostrarOpcionesGrid ? `
        <div class="opciones-grid ${esAmplia ? 'opciones-grid--amplia' : ''}"
             role="radiogroup" aria-label="Opciones de respuesta">
          ${opcionesHTML}
        </div>
      ` : ''}

      <div class="pregunta-footer">
        <div id="feedback-container" aria-live="polite"></div>
        <button class="btn-primary" id="btn-siguiente" disabled
                aria-label="${esUltima ? 'Ver resultados' : 'Siguiente pregunta'}">
          ${esUltima ? 'Ver Resultados' : 'Siguiente'}
        </button>
      </div>

    </div>
  `;
}

// =====================================================
// FEEDBACK — Pregunta estándar / aviso
// =====================================================

export function renderFeedback(esCorrecta, respuestaCorrecta, justificacion) {
  if (esCorrecta) {
    return `
      <div class="feedback feedback--correcto" role="alert">
        <span class="feedback__icon" style="color:var(--success); font-weight:700;">✓</span>
        <div class="feedback__content">
          <p class="feedback__titulo">Correcto.</p>
          <p class="feedback__justificacion">${_escaparHTML(justificacion)}</p>
        </div>
      </div>
    `;
  } else {
    return `
      <div class="feedback feedback--incorrecto" role="alert">
        <span class="feedback__icon" style="color:var(--error); font-weight:700;">✗</span>
        <div class="feedback__content">
          <p class="feedback__titulo">Incorrecto — La respuesta correcta era: <strong>${respuestaCorrecta}</strong></p>
          <p class="feedback__justificacion">${_escaparHTML(justificacion)}</p>
        </div>
      </div>
    `;
  }
}

// =====================================================
// FEEDBACK — Pregunta de tipo 'relacionar'
//
// Muestra cuáles definiciones fueron correctas (✓) e incorrectas (✗),
// con la respuesta correcta en cada caso. Puntaje proporcional.
// =====================================================

export function renderFeedbackRelacionar(pregunta, selecciones) {
  const respuestasCorrectas = pregunta.respuestasCorrectas || {};
  const definiciones = pregunta.definiciones || [];
  const total = definiciones.length;
  let correctas = 0;

  const filasHTML = definiciones.map((d) => {
    const userAns    = selecciones ? selecciones[d.numero] : null;
    const correctAns = respuestasCorrectas[d.numero];
    const esCorrecta = userAns === correctAns;
    if (esCorrecta) correctas++;

    const textoCorr = correctAns
      ? `${correctAns}: ${_escaparHTML(pregunta.opciones[correctAns])}`
      : '—';

    return `
      <div class="fb-rel-fila fb-rel-fila--${esCorrecta ? 'ok' : 'err'}">
        <span class="fb-rel-num">${d.numero}</span>
        <span class="fb-rel-icono">${esCorrecta ? '✓' : '✗'}</span>
        <span class="fb-rel-info">
          ${esCorrecta
            ? textoCorr
            : `Tu respuesta: <strong>${userAns || '—'}</strong>
               &nbsp;·&nbsp; Correcta: <strong>${textoCorr}</strong>`
          }
        </span>
      </div>
    `;
  }).join('');

  const todasCorrectas = correctas === total;
  const ninguna        = correctas === 0;
  const cls = todasCorrectas ? 'correcto' : (ninguna ? 'incorrecto' : 'parcial');

  const tituloIcono = todasCorrectas ? '✓' : '✗';
  const tituloTexto = todasCorrectas
    ? `Perfecto — ${correctas}/${total} correctas`
    : `${correctas} de ${total} definiciones correctas`;

  return `
    <div class="feedback feedback--${cls}" role="alert">
      <span class="feedback__icon" style="font-weight:700; color:var(--${todasCorrectas ? 'success' : ninguna ? 'error' : 'warning'});">
        ${tituloIcono}
      </span>
      <div class="feedback__content" style="flex:1;">
        <p class="feedback__titulo" style="margin-bottom:var(--sp-sm);">${tituloTexto}</p>
        <div class="fb-rel-filas">${filasHTML}</div>
        <p class="feedback__justificacion" style="margin-top:10px; padding-top:10px; border-top:1px solid var(--border);">
          ${_escaparHTML(pregunta.justificacion)}
        </p>
      </div>
    </div>
  `;
}

// =====================================================
// RESULTADOS
// =====================================================

export function renderResultados(resultados) {
  const {
    modo, puntajeSobre100, totalCorrectas, totalPreguntas,
    porMateria, competenciasConFallas, competenciasPerfectas,
    nivelDesempeno, detalles,
  } = resultados;

  const filasMateria = Object.entries(porMateria).map(([materia, data]) => {
    const pct      = Math.round((data.correctas / data.total) * 100);
    const colorCls = pct >= 70 ? 'verde' : pct >= 50 ? 'amarillo' : 'rojo';
    return `
      <div class="reporte-materia">
        <div class="reporte-materia__info">
          <span class="reporte-materia__nombre">${materia}</span>
          <span class="reporte-materia__score">${data.correctas}/${data.total}</span>
        </div>
        <div class="barra-progreso">
          <div class="barra-progreso__fill barra-color-${colorCls}" style="width: ${pct}%;"></div>
        </div>
        <span class="reporte-materia__pct">${pct}%</span>
      </div>
    `;
  }).join('');

  const fallasHTML = competenciasConFallas.length > 0
    ? `<div class="fallas-competencias">
         <h3>Competencias a Reforzar</h3>
         <p style="font-size:0.83rem; color:var(--text-muted); margin-bottom:16px;">
           Estas competencias quedan registradas para enfocar tu próxima Rutina de Hoy.
         </p>
         ${competenciasConFallas.map((f) => `
           <div class="falla-item">
             <span class="falla-competencia">${f.competencia}</span>
             <span class="falla-materia">(${f.materia})</span>
             <span class="falla-score">${f.correctas}/${f.total} — ${f.porcentaje}%</span>
           </div>
         `).join('')}
       </div>`
    : `<div style="text-align:center; padding:24px;">
         <p class="todo-correcto">Sin errores por competencia. Rendimiento perfecto.</p>
       </div>`;

  const perfectasHTML = competenciasPerfectas.length > 0
    ? `<div style="margin-top:16px; padding-top:16px; border-top:1px solid var(--border);">
         <p style="font-size:0.78rem; color:var(--success); font-weight:700; margin-bottom:8px; text-transform:uppercase; letter-spacing:0.08em;">Competencias dominadas</p>
         ${competenciasPerfectas.map((c) => `
           <span style="display:inline-flex; font-size:0.72rem; background:var(--success-bg);
             color:var(--success); border:1px solid rgba(74,222,128,0.15); padding:3px 9px;
             border-radius:var(--radius-sm); margin:3px; font-weight:600;">
             ${c.competencia}
           </span>
         `).join('')}
       </div>`
    : '';

  // ── Detalles: renderizado especial para 'relacionar'
  const detallesHTML = detalles.map((d, i) => {
    const subTag = d.pregunta.subMateria ? ` · ${d.pregunta.subMateria}` : '';

    // ── Bloque relacionar
    if (d.pregunta.tipoPregunta === 'relacionar') {
      const respCorrect = d.pregunta.respuestasCorrectas || {};
      const defs        = d.pregunta.definiciones || [];
      const selecciones = (typeof d.respuestaUsuario === 'object' && d.respuestaUsuario !== null)
        ? d.respuestaUsuario
        : {};

      let correctasDef = 0;
      const defItemsHTML = defs.map((def) => {
        const userAns = selecciones[def.numero];
        const corrAns = respCorrect[def.numero];
        const ok      = userAns === corrAns;
        if (ok) correctasDef++;
        const texto   = d.pregunta.opciones[corrAns] || corrAns;
        return `
          <span class="detalle-rel-item ${ok ? 'ok' : 'err'}" title="Definición ${def.numero}">
            ${def.numero}: ${userAns || '—'} ${ok ? '✓' : `→ ${corrAns} (${_escaparHTML(texto)})`}
          </span>
        `;
      }).join('');

      const estado = correctasDef === defs.length ? 'detalle--correcto' : 'detalle--incorrecto';
      return `
        <div class="detalle-item ${estado}">
          <div class="detalle-num">${i + 1}</div>
          <div class="detalle-info">
            <span class="detalle-materia">${d.pregunta.materia}${subTag} — ${d.pregunta.competencia}</span>
            <span class="detalle-estado" style="color:var(--${correctasDef === defs.length ? 'success' : correctasDef > 0 ? 'warning' : 'error'});">
              ${correctasDef}/${defs.length} correctas en el bloque de relación
            </span>
            <div class="detalle-rel-items">${defItemsHTML}</div>
            ${correctasDef < defs.length
              ? `<p class="detalle-justificacion"><strong>Explicación:</strong> ${_escaparHTML(d.pregunta.justificacion)}</p>`
              : ''}
          </div>
        </div>
      `;
    }

    // ── Bloque estándar / aviso
    const estadoTexto = d.esCorrecta
      ? '✓ Correcta'
      : d.respuestaUsuario
        ? `✗ Respondiste: ${d.respuestaUsuario} | Correcta: ${d.pregunta.respuesta}`
        : `✗ Sin responder | Correcta: ${d.pregunta.respuesta}`;

    return `
      <div class="detalle-item ${d.esCorrecta ? 'detalle--correcto' : 'detalle--incorrecto'}">
        <div class="detalle-num">${i + 1}</div>
        <div class="detalle-info">
          <span class="detalle-materia">${d.pregunta.materia}${subTag} — ${d.pregunta.competencia}</span>
          <span class="detalle-estado">${estadoTexto}</span>
          ${!d.esCorrecta
            ? `<p class="detalle-justificacion"><strong>Explicación:</strong> ${_escaparHTML(d.pregunta.justificacion)}</p>`
            : ''}
        </div>
      </div>
    `;
  }).join('');

  const modoLabel =
    modo === 'simulacro'    ? 'Simulacro ICFES'          :
    modo === 'rutina'       ? 'Rutina Diaria'             :
    modo === 'entrenamiento'? 'Entrenamiento Focalizado'  :
    modo === 'estudio'      ? 'Sesión de Estudio'         :
                              'Diagnóstico';

  const materiasConFallas = [...new Set(competenciasConFallas.map((f) => f.materia))];
  const sugerenciasHTML = materiasConFallas.length > 0
    ? `<div class="reporte-seccion icfi-sugerencias">
         <div class="icfi-sugerencia-banner">
           <div class="icfi-sugerencia-banner__content">
             <p class="icfi-sugerencia-banner__titulo">ICFI te recomienda</p>
             <p class="icfi-sugerencia-banner__texto">
               Los errores son el camino al aprendizaje.
               Usa el <strong>Módulo de Refuerzo</strong> para trabajar
               específicamente las áreas donde tienes oportunidades de mejora.
             </p>
           </div>
         </div>
         <div class="icfi-sugerencia-acciones">
           ${materiasConFallas.map((mat) => {
             const fallasMat = competenciasConFallas.filter((f) => f.materia === mat);
             const nFallas  = fallasMat.length;
             const preview  = fallasMat.slice(0, 2).map((f) => f.competencia).join(', ')
                              + (fallasMat.length > 2 ? '…' : '');
             return `
               <button class="refuerzo-card-btn" data-materia="${mat}"
                       aria-label="Ir al módulo de refuerzo de ${mat}">
                 <span class="refuerzo-card-btn__info">
                   <span class="refuerzo-card-btn__titulo">Reforzar ${mat}</span>
                   <span class="refuerzo-card-btn__sub">
                     ${nFallas} competencia${nFallas !== 1 ? 's' : ''} débil${nFallas !== 1 ? 'es' : ''}:
                     ${preview}
                   </span>
                 </span>
               </button>
             `;
           }).join('')}
         </div>
       </div>`
    : '';

  return `
    <div class="resultados-container">

      <div class="resultados-header">
        <h2>Informe de Resultados</h2>
        <p class="resultados-modo">${modoLabel}</p>
      </div>

      <div class="puntaje-hero puntaje--${nivelDesempeno.color}" role="region" aria-label="Puntaje total">
        <div class="puntaje-numero" aria-label="${puntajeSobre100} puntos">${puntajeSobre100}</div>
        <div class="puntaje-label">puntos sobre 100</div>
        <div class="puntaje-sub">
          ${nivelDesempeno.label} — ${typeof totalCorrectas === 'number' && !Number.isInteger(totalCorrectas)
            ? totalCorrectas.toFixed(1)
            : totalCorrectas} de ${totalPreguntas} correctas
        </div>
      </div>

      <div class="reporte-seccion" role="region" aria-label="Rendimiento por materia">
        <h3>Rendimiento por Materia</h3>
        ${filasMateria}
      </div>

      <div class="reporte-seccion" role="region" aria-label="Análisis de competencias">
        ${fallasHTML}
        ${perfectasHTML}
      </div>

      ${sugerenciasHTML}

      <div class="reporte-seccion" role="region" aria-label="Detalle de todas las preguntas">
        <h3>Revisión Detallada</h3>
        <div class="detalles-lista">${detallesHTML}</div>
      </div>

      <button class="btn-primary btn-full" id="btn-reiniciar" aria-label="Volver al menú principal">
        Volver al Menú Principal
      </button>

    </div>
  `;
}

// =====================================================
// TIMER
// =====================================================

export function renderTimer(segundos) {
  const min = Math.floor(segundos / 60).toString().padStart(2, '0');
  const seg = (segundos % 60).toString().padStart(2, '0');
  return `${min}:${seg}`;
}

// =====================================================
// HELPERS PRIVADOS
// =====================================================

function _escaparHTML(texto) {
  if (typeof texto !== 'string') return '';
  return texto
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&#x27;');
}