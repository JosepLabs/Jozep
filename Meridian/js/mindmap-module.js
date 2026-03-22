'use strict';
/**
 * mindmap-module.js — Módulo Mapas Mentales para MERIDIAN
 *
 * Vistas:
 *   hub    — Lista de mapas guardados
 *   editor — Lienzo interactivo (canvas SVG + nodos arrastrables)
 *
 * Persistencia: MindMapStorage (clave separada 'meridian_v1_maps')
 * Autosave: debounce 1000ms
 *
 * API pública:
 *   render(root, subview)
 *   renderHub(root)
 *   _newMap()
 *   _openMap(id)
 *   _addRootNode()
 *   _addChildNode(parentId)
 *   _deleteNode(nodeId)
 *   _saveNow()
 */

const MindMapModule = (() => {

  // ══════════════════════════════════════════════════════════════
  // CONSTANTES Y ESTADO PRIVADO
  // ══════════════════════════════════════════════════════════════

  const CANVAS_W    = 4000;
  const CANVAS_H    = 3000;
  const AUTOSAVE_MS = 1000;

  const ROOT_START  = { x: CANVAS_W / 2 - 80, y: CANVAS_H / 2 - 28 };
  const CHILD_OFFSET_X = 200;
  const CHILD_OFFSET_Y =  60;

  let _map          = null;   // mapa activo { id, title, nodes[], updatedAt }
  let _selected     = null;   // id del nodo seleccionado
  let _dragging     = null;   // { nodeId, startMouseX, startMouseY, startNodeX, startNodeY }
  let _dbTimer      = null;   // debounce autosave

  // ══════════════════════════════════════════════════════════════
  // PUNTO DE ENTRADA
  // ══════════════════════════════════════════════════════════════

  function render(root, subview) {
    if (subview === 'editor') _renderEditor(root);
    else                      renderHub(root);
  }

  // ══════════════════════════════════════════════════════════════
  // HUB — lista de mapas
  // ══════════════════════════════════════════════════════════════

  function renderHub(root) {
    const maps = MindMapStorage.getMindMaps();

    root.innerHTML = `
      <div class="view-container mm-hub-view">

        <div class="view-header">
          <button class="btn-back" onclick="navigate('hub')">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M10 3L5 8L10 13" stroke="currentColor" stroke-width="1.5"
                stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Hub
          </button>
          <h1 class="view-title">Mapas Mentales</h1>
          <button class="btn btn-primary btn-sm" onclick="MindMapModule._newMap()">
            + Nuevo mapa
          </button>
        </div>

        ${maps.length === 0
          ? `<div class="empty-state">
               <div class="empty-icon" aria-hidden="true">🗺️</div>
               <p class="empty-title">Sin mapas todavía</p>
               <p class="empty-sub">Crea tu primer mapa mental para organizar ideas visualmente.</p>
               <button class="btn btn-primary" onclick="MindMapModule._newMap()">
                 Crear mapa
               </button>
             </div>`
          : `<div class="mm-maps-grid">
               ${maps.map(m => _mapCardHTML(m)).join('')}
             </div>`
        }

      </div>`;

    // Listeners de tarjetas
    root.querySelectorAll('[data-open-map]').forEach(card => {
      card.addEventListener('click', e => {
        if (e.target.closest('[data-delete-map]')) return;
        MindMapModule._openMap(card.dataset.openMap);
      });
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') MindMapModule._openMap(card.dataset.openMap);
      });
    });

    root.querySelectorAll('[data-delete-map]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        if (!confirm('¿Eliminar este mapa mental?')) return;
        MindMapStorage.deleteMindMap(btn.dataset.deleteMap);
        renderHub(root);
      });
    });
  }

  function _mapCardHTML(m) {
    const date     = new Date(m.updatedAt).toLocaleDateString('es', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
    const nodeCount = (m.nodes || []).length;

    return `
      <div class="mm-map-card" data-open-map="${m.id}" tabindex="0" role="button"
        aria-label="Abrir mapa: ${_esc(m.title)}">
        <div class="mm-card-preview" aria-hidden="true">
          ${_miniPreviewSVG(m.nodes || [])}
        </div>
        <div class="mm-card-body">
          <div class="mm-card-title">${_esc(m.title) || '<em>Sin título</em>'}</div>
          <div class="mm-card-meta">
            <span>${nodeCount} nodo${nodeCount !== 1 ? 's' : ''}</span>
            <span>${date}</span>
          </div>
        </div>
        <button class="mm-card-delete" data-delete-map="${m.id}"
          aria-label="Eliminar mapa ${_esc(m.title)}">
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M2 4h10M5 4V2.5h4V4M5.5 6v5M8.5 6v5M3 4l.5 7.5a1 1 0 001 .9h5a1 1 0 001-.9L11 4"
              stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
          </svg>
        </button>
      </div>`;
  }

  /** Mini SVG de previsualización (escala al tamaño de la tarjeta) */
  function _miniPreviewSVG(nodes) {
    if (!nodes.length) return '<div class="mm-preview-empty">Vacío</div>';

    // Calcular bounding box
    const xs = nodes.map(n => n.x), ys = nodes.map(n => n.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs) + 120;
    const minY = Math.min(...ys), maxY = Math.max(...ys) + 40;
    const W = maxX - minX || 100, H = maxY - minY || 60;

    const scale = Math.min(220 / W, 110 / H, 1);
    const tx    = (220 - W * scale) / 2 - minX * scale;
    const ty    = (110 - H * scale) / 2 - minY * scale;

    const lines = nodes.filter(n => n.parentId).map(n => {
      const parent = nodes.find(p => p.id === n.parentId);
      if (!parent) return '';
      const x1 = parent.x * scale + tx + 60 * scale;
      const y1 = parent.y * scale + ty + 20 * scale;
      const x2 = n.x     * scale + tx + 60 * scale;
      const y2 = n.y     * scale + ty + 20 * scale;
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"
        stroke="var(--accent)" stroke-width="1.5" stroke-opacity=".6"/>`;
    }).join('');

    const rects = nodes.map(n => {
      const nx = n.x * scale + tx;
      const ny = n.y * scale + ty;
      const rw = 100 * scale, rh = 32 * scale;
      const isRoot = !n.parentId;
      return `<rect x="${nx}" y="${ny}" width="${rw}" height="${rh}" rx="4"
        fill="${isRoot ? 'var(--accent)' : 'var(--bg-elevated)'}"
        stroke="${isRoot ? 'var(--accent)' : 'var(--border-default)'}" stroke-width="1"/>`;
    }).join('');

    return `<svg viewBox="0 0 220 110" xmlns="http://www.w3.org/2000/svg"
      style="width:100%;height:100%">${lines}${rects}</svg>`;
  }

  // ══════════════════════════════════════════════════════════════
  // EDITOR — lienzo interactivo
  // ══════════════════════════════════════════════════════════════

  function _renderEditor(root) {
    if (!_map) { renderHub(root); return; }

    // El editor ocupa toda la pantalla disponible (sin view-container)
    root.innerHTML = `
      <div class="mm-wrapper">

        <!-- Barra de herramientas -->
        <div class="mm-toolbar" id="mmToolbar">
          <button class="btn-back" onclick="MindMapModule._exitEditor()" aria-label="Volver">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M10 3L5 8L10 13" stroke="currentColor" stroke-width="1.5"
                stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Mapas
          </button>

          <input class="mm-title-input" id="mmTitleInput"
            value="${_esc(_map.title)}"
            placeholder="Título del mapa…"
            maxlength="100"
            aria-label="Título del mapa"/>

          <div class="mm-toolbar-right">
            <span class="mm-save-status" id="mmSaveStatus"></span>
            <button class="btn btn-ghost btn-sm" onclick="MindMapModule._addRootNode()"
              title="Añadir nodo raíz">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M7 2v10M2 7h10" stroke="currentColor" stroke-width="1.6"
                  stroke-linecap="round"/>
              </svg>
              Nodo
            </button>
            <button class="btn btn-ghost btn-sm" id="mmDeleteBtn"
              onclick="MindMapModule._deleteSelected()"
              title="Eliminar nodo seleccionado" disabled>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M2 4h10M5 4V2.5h4V4M5.5 6v5M8.5 6v5M3 4l.5 7.5a1 1 0 001 .9h5a1 1 0 001-.9L11 4"
                  stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
              </svg>
            </button>
            <button class="btn btn-primary btn-sm" onclick="MindMapModule._saveNow()">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                <path d="M1.5 9.5V11a.5.5 0 00.5.5H11a.5.5 0 00.5-.5V9.5M6.5 1.5v7M4 6l2.5 2.5L9 6"
                  stroke="currentColor" stroke-width="1.4" stroke-linecap="round"
                  stroke-linejoin="round"/>
              </svg>
              Guardar
            </button>
          </div>
        </div>

        <!-- Lienzo con scroll -->
        <div class="mm-canvas-wrap" id="mmCanvasWrap">
          <div class="mm-canvas" id="mmCanvas"
            style="width:${CANVAS_W}px;height:${CANVAS_H}px">

            <!-- SVG de conexiones (fondo, sin pointer-events) -->
            <svg id="mmSvg"
              width="${CANVAS_W}" height="${CANVAS_H}"
              xmlns="http://www.w3.org/2000/svg"
              style="position:absolute;inset:0;pointer-events:none;z-index:1">
            </svg>

            <!-- Los nodos se insertan aquí (z-index:2+) -->
          </div>
        </div>

      </div>`;

    _renderAllNodes();
    _drawConnections();
    _bindEditorEvents();
    _scrollToCenter();
  }

  // ── Renderizar todos los nodos ────────────────────────────────

  function _renderAllNodes() {
    const canvas = document.getElementById('mmCanvas');
    if (!canvas) return;
    canvas.querySelectorAll('.mm-node').forEach(el => el.remove());
    (_map.nodes || []).forEach(node => _renderNode(node));
  }

  function _renderNode(node) {
    const canvas = document.getElementById('mmCanvas');
    if (!canvas) return;

    const el = document.createElement('div');
    el.className  = `mm-node${!node.parentId ? ' mm-root' : ''}${_selected === node.id ? ' mm-selected' : ''}`;
    el.dataset.id = node.id;
    el.style.left = node.x + 'px';
    el.style.top  = node.y + 'px';
    el.style.zIndex = 2;

    el.innerHTML = `
      <div class="mm-node-text" contenteditable="true"
        data-node-id="${node.id}"
        spellcheck="false"
        aria-label="Texto del nodo">${_esc(node.text)}</div>
      <button class="mm-node-add" data-parent-id="${node.id}"
        title="Añadir nodo hijo" aria-label="Añadir hijo">+</button>`;

    canvas.appendChild(el);
  }

  // ── Dibujar conexiones SVG ────────────────────────────────────

  function _drawConnections() {
    const svg = document.getElementById('mmSvg');
    if (!svg || !_map) return;

    svg.innerHTML = '';   // limpiar

    (_map.nodes || []).forEach(node => {
      if (!node.parentId) return;
      const parent = _map.nodes.find(n => n.id === node.parentId);
      if (!parent) return;

      // Centros de los nodos (usamos medidas fijas: 120×36px)
      const NODE_W = 120, NODE_H = 36;
      const x1 = parent.x + NODE_W / 2;
      const y1 = parent.y + NODE_H / 2;
      const x2 = node.x   + NODE_W / 2;
      const y2 = node.y   + NODE_H / 2;

      // Curva de Bézier cúbica para suavizar la conexión
      const cx1 = x1 + (x2 - x1) * 0.5;
      const cy1 = y1;
      const cx2 = x1 + (x2 - x1) * 0.5;
      const cy2 = y2;

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`);
      path.setAttribute('stroke', 'var(--accent)');
      path.setAttribute('stroke-width', '2');
      path.setAttribute('stroke-opacity', '0.7');
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke-dasharray', '');
      svg.appendChild(path);

      // Punto en el extremo hijo
      const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      dot.setAttribute('cx', x2);
      dot.setAttribute('cy', y2);
      dot.setAttribute('r', '3');
      dot.setAttribute('fill', 'var(--accent)');
      dot.setAttribute('opacity', '0.6');
      svg.appendChild(dot);
    });
  }

  // ── Bind de eventos del editor ────────────────────────────────

  function _bindEditorEvents() {
    const canvas = document.getElementById('mmCanvas');
    const wrap   = document.getElementById('mmCanvasWrap');
    const titleInput = document.getElementById('mmTitleInput');

    if (!canvas) return;

    // Edición del título
    if (titleInput) {
      titleInput.addEventListener('input', () => {
        _map.title = titleInput.value;
        _scheduleAutosave();
      });
    }

    // Delegación de eventos en el canvas
    canvas.addEventListener('mousedown', _onMouseDown);
    window.addEventListener('mousemove', _onMouseMove);
    window.addEventListener('mouseup',   _onMouseUp);

    // Añadir nodo hijo (botón +)
    canvas.addEventListener('click', e => {
      const addBtn = e.target.closest('[data-parent-id]');
      if (addBtn) {
        e.stopPropagation();
        MindMapModule._addChildNode(addBtn.dataset.parentId);
        return;
      }

      // Click en texto: seleccionar nodo
      const nodeEl = e.target.closest('.mm-node');
      if (nodeEl) {
        _selectNode(nodeEl.dataset.id);
      } else {
        // Click en lienzo vacío: deseleccionar
        _selectNode(null);
      }
    });

    // Edición in-place (contenteditable)
    canvas.addEventListener('input', e => {
      const textEl = e.target.closest('[data-node-id]');
      if (!textEl) return;
      const node = _map.nodes.find(n => n.id === textEl.dataset.nodeId);
      if (node) {
        node.text = textEl.textContent.trim();
        _scheduleAutosave();
      }
    });

    // Tecla Delete/Backspace en nodo seleccionado (sin focus en contenteditable)
    window.addEventListener('keydown', _onKeyDown);
  }

  function _onKeyDown(e) {
    if (!_selected) return;
    // No borrar si el usuario está escribiendo en el contenteditable
    const active = document.activeElement;
    if (active && active.dataset && active.dataset.nodeId) return;

    if (e.key === 'Delete' || e.key === 'Backspace') {
      MindMapModule._deleteSelected();
    }
  }

  // ── Drag & Drop ───────────────────────────────────────────────

  function _onMouseDown(e) {
    const nodeEl = e.target.closest('.mm-node');
    if (!nodeEl) return;
    // No iniciar drag si el clic fue en contenteditable o botón
    if (e.target.closest('[contenteditable]') || e.target.closest('button')) return;

    e.preventDefault();

    const canvas = document.getElementById('mmCanvas');
    const wrap   = document.getElementById('mmCanvasWrap');
    const canvasRect = canvas.getBoundingClientRect();

    const nodeId = nodeEl.dataset.id;
    const node   = _map.nodes.find(n => n.id === nodeId);
    if (!node) return;

    _dragging = {
      nodeId,
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startNodeX:  node.x,
      startNodeY:  node.y
    };

    _selectNode(nodeId);
    nodeEl.style.zIndex = 10;
    nodeEl.style.opacity = '0.85';
  }

  function _onMouseMove(e) {
    if (!_dragging) return;

    const dx = e.clientX - _dragging.startMouseX;
    const dy = e.clientY - _dragging.startMouseY;

    const node = _map.nodes.find(n => n.id === _dragging.nodeId);
    if (!node) return;

    node.x = Math.max(0, Math.min(CANVAS_W - 130, _dragging.startNodeX + dx));
    node.y = Math.max(0, Math.min(CANVAS_H - 50,  _dragging.startNodeY + dy));

    // Mover el elemento DOM directamente (sin re-render completo)
    const nodeEl = document.querySelector(`.mm-node[data-id="${_dragging.nodeId}"]`);
    if (nodeEl) {
      nodeEl.style.left = node.x + 'px';
      nodeEl.style.top  = node.y + 'px';
    }

    _drawConnections();   // re-dibujar líneas en tiempo real
  }

  function _onMouseUp() {
    if (!_dragging) return;

    const nodeEl = document.querySelector(`.mm-node[data-id="${_dragging.nodeId}"]`);
    if (nodeEl) {
      nodeEl.style.zIndex  = 2;
      nodeEl.style.opacity = '1';
    }

    _dragging = null;
    _scheduleAutosave();
  }

  // ── Selección ─────────────────────────────────────────────────

  function _selectNode(id) {
    // Quitar selección anterior
    document.querySelectorAll('.mm-node.mm-selected').forEach(el => {
      el.classList.remove('mm-selected');
    });

    _selected = id;

    if (id) {
      const el = document.querySelector(`.mm-node[data-id="${id}"]`);
      if (el) el.classList.add('mm-selected');
    }

    // Actualizar botón eliminar
    const delBtn = document.getElementById('mmDeleteBtn');
    if (delBtn) delBtn.disabled = !id;
  }

  // ── Centrar la vista al cargar ────────────────────────────────

  function _scrollToCenter() {
    const wrap = document.getElementById('mmCanvasWrap');
    if (!wrap) return;
    // Ir al centro del canvas
    setTimeout(() => {
      wrap.scrollLeft = (CANVAS_W - wrap.clientWidth)  / 2;
      wrap.scrollTop  = (CANVAS_H - wrap.clientHeight) / 2;
    }, 50);
  }

  // ══════════════════════════════════════════════════════════════
  // OPERACIONES SOBRE NODOS
  // ══════════════════════════════════════════════════════════════

  function _addRootNode() {
    if (!_map) return;

    // Colocar el nuevo nodo cerca del centro, ligeramente desplazado
    const offset = _map.nodes.length * 50;
    const node = {
      id:       _genId(),
      text:     'Idea principal',
      x:        ROOT_START.x + offset,
      y:        ROOT_START.y + offset,
      parentId: null
    };

    _map.nodes.push(node);
    _renderNode(node);
    _drawConnections();
    _selectNode(node.id);
    _scheduleAutosave();

    // Focus en el texto del nuevo nodo
    setTimeout(() => {
      const textEl = document.querySelector(
        `.mm-node[data-id="${node.id}"] [data-node-id]`
      );
      if (textEl) {
        textEl.focus();
        _selectAll(textEl);
      }
    }, 60);
  }

  function _addChildNode(parentId) {
    if (!_map) return;
    const parent = _map.nodes.find(n => n.id === parentId);
    if (!parent) return;

    // Calcular cuántos hijos ya tiene el padre para escalonar verticalmente
    const siblings = _map.nodes.filter(n => n.parentId === parentId).length;

    const node = {
      id:       _genId(),
      text:     'Sub-idea',
      x:        parent.x + CHILD_OFFSET_X,
      y:        parent.y + siblings * CHILD_OFFSET_Y,
      parentId: parentId
    };

    _map.nodes.push(node);
    _renderNode(node);
    _drawConnections();
    _selectNode(node.id);
    _scheduleAutosave();

    setTimeout(() => {
      const textEl = document.querySelector(
        `.mm-node[data-id="${node.id}"] [data-node-id]`
      );
      if (textEl) {
        textEl.focus();
        _selectAll(textEl);
      }
    }, 60);
  }

  function _deleteSelected() {
    if (!_selected || !_map) return;
    _deleteNodeAndChildren(_selected);
    _selected = null;
    _renderAllNodes();
    _drawConnections();

    const delBtn = document.getElementById('mmDeleteBtn');
    if (delBtn) delBtn.disabled = true;

    _scheduleAutosave();
  }

  /** Elimina un nodo y todos sus descendientes recursivamente */
  function _deleteNodeAndChildren(id) {
    // Primero eliminar hijos
    const children = _map.nodes.filter(n => n.parentId === id);
    children.forEach(c => _deleteNodeAndChildren(c.id));
    _map.nodes = _map.nodes.filter(n => n.id !== id);
  }

  // ══════════════════════════════════════════════════════════════
  // PERSISTENCIA Y AUTOSAVE
  // ══════════════════════════════════════════════════════════════

  function _scheduleAutosave() {
    clearTimeout(_dbTimer);
    _setStatus('unsaved');
    _dbTimer = setTimeout(() => _saveNow(true), AUTOSAVE_MS);
  }

  function _saveNow(isAuto = false) {
    if (!_map) return;
    clearTimeout(_dbTimer);
    _map.updatedAt = new Date().toISOString();
    MindMapStorage.saveMindMap({ ..._map, nodes: [..._map.nodes] });
    _setStatus('saved');
    if (!isAuto) {
      // Feedback visual breve
      const btn = document.querySelector('.mm-wrapper .btn-primary');
      if (btn) {
        btn.textContent = '✓ Guardado';
        setTimeout(() => { if (btn) btn.innerHTML = `<svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true"><path d="M1.5 9.5V11a.5.5 0 00.5.5H11a.5.5 0 00.5-.5V9.5M6.5 1.5v7M4 6l2.5 2.5L9 6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg> Guardar`; }, 1500);
      }
    }
  }

  function _setStatus(state) {
    const el = document.getElementById('mmSaveStatus');
    if (!el) return;
    if (state === 'unsaved') {
      el.textContent = '● Cambios sin guardar';
      el.className   = 'mm-save-status unsaved';
    } else {
      el.textContent = '✓ Guardado';
      el.className   = 'mm-save-status saved';
      setTimeout(() => { el.textContent = ''; el.className = 'mm-save-status'; }, 2500);
    }
  }

  // ══════════════════════════════════════════════════════════════
  // NAVEGACIÓN
  // ══════════════════════════════════════════════════════════════

  function _newMap() {
    _map = {
      id:        _genId(),
      title:     '',
      nodes:     [],
      updatedAt: new Date().toISOString()
    };
    _selected = null;
    _dragging = null;
    navigate('mindmap-editor', { mindmapId: _map.id });
  }

  function _openMap(id) {
    const maps = MindMapStorage.getMindMaps();
    _map = maps.find(m => m.id === id);
    if (!_map) { renderHub(document.getElementById('appRoot')); return; }
    _selected = null;
    _dragging = null;
    navigate('mindmap-editor', { mindmapId: id });
  }

  function _exitEditor() {
    // Guardar antes de salir
    if (_map) _saveNow(true);
    // Limpiar listeners globales para no dejar memoria sucia
    window.removeEventListener('mousemove', _onMouseMove);
    window.removeEventListener('mouseup',   _onMouseUp);
    window.removeEventListener('keydown',   _onKeyDown);
    _dragging = null;
    navigate('mindmap-hub');
  }

  // ══════════════════════════════════════════════════════════════
  // UTILIDADES
  // ══════════════════════════════════════════════════════════════

  function _genId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
  }

  function _selectAll(el) {
    const range = document.createRange();
    range.selectNodeContents(el);
    const sel = window.getSelection();
    if (sel) { sel.removeAllRanges(); sel.addRange(range); }
  }

  function _esc(str) {
    return String(str || '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // ══════════════════════════════════════════════════════════════
  // EXPORT
  // ══════════════════════════════════════════════════════════════

  return {
    render, renderHub,
    _newMap, _openMap, _exitEditor,
    _addRootNode, _addChildNode,
    _deleteSelected,
    _saveNow
  };

})();
