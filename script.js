/* ===========================================================
   BRAWNS PAINT — script.js
   App de pintura com armazenamento local (localStorage).
   Sem dependências externas — pronto para GitHub Pages / Vercel.
=========================================================== */

(() => {
  'use strict';

  /* ---------- CONSTANTES DE ARMAZENAMENTO ---------- */
  const LS_STROKES = 'brawnsPaint_strokes_v1';
  const LS_BG = 'brawnsPaint_bg_v1';
  const LS_GALLERY = 'brawnsPaint_gallery_v1';
  const LS_COLOR_HISTORY = 'brawnsPaint_colorHistory_v1';

  /* ---------- ELEMENTOS ---------- */
  const canvasFrame = document.getElementById('canvasFrame');
  const bgLayer = document.getElementById('bgLayer');
  const mainCanvas = document.getElementById('mainCanvas');
  const overlayCanvas = document.getElementById('overlayCanvas');
  const brushCursor = document.getElementById('brushCursor');
  const mainCtx = mainCanvas.getContext('2d');
  const overlayCtx = overlayCanvas.getContext('2d');

  const bgColorInput = document.getElementById('bgColor');
  const brushColorInput = document.getElementById('brushColor');
  const rainbowCheckbox = document.getElementById('rainbowMode');
  const toolsGrid = document.getElementById('toolsGrid');
  const sizeRange = document.getElementById('sizeRange');
  const sizeValueLabel = document.getElementById('sizeValue');
  const sizeDot = document.getElementById('sizeDot');
  const clearBtn = document.getElementById('clearBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const imageInput = document.getElementById('imageInput');
  const imageControls = document.getElementById('imageControls');
  const applyImageBtn = document.getElementById('applyImageBtn');
  const cancelImageBtn = document.getElementById('cancelImageBtn');
  const galleryNameInput = document.getElementById('galleryName');
  const saveGalleryBtn = document.getElementById('saveGalleryBtn');
  const galleryList = document.getElementById('galleryList');
  const colorHistoryEl = document.getElementById('colorHistory');

  /* ---------- CONFIGURAÇÃO DAS FERRAMENTAS ---------- */
  const TOOLS = {
    lapis:    { label: 'Lápis',    min: 1,  max: 20, def: 4,  draw: drawLapis },
    caneta:   { label: 'Caneta',   min: 1,  max: 30, def: 6,  draw: drawCaneta },
    marcador: { label: 'Marcador', min: 4,  max: 50, def: 18, draw: drawMarcador },
    rolo:     { label: 'Rolo',     min: 10, max: 80, def: 40, draw: drawRolo },
    pincelP:  { label: 'Pincel P', min: 4,  max: 20, def: 10, draw: (c,x0,y0,x1,y1,s,cl)=>drawPincel(c,x0,y0,x1,y1,s,cl) },
    pincelM:  { label: 'Pincel M', min: 10, max: 40, def: 22, draw: (c,x0,y0,x1,y1,s,cl)=>drawPincel(c,x0,y0,x1,y1,s,cl) },
    pincelG:  { label: 'Pincel G', min: 20, max: 80, def: 45, draw: (c,x0,y0,x1,y1,s,cl)=>drawPincel(c,x0,y0,x1,y1,s,cl) },
    borracha: { label: 'Borracha', min: 5,  max: 80, def: 24, draw: drawBorracha, isEraser: true }
  };

  let currentTool = 'lapis';
  let currentSize = TOOLS.lapis.def;
  let hue = 0;
  let drawing = false;
  let lastPoint = null;
  let floatingImage = null; // {img, x, y, w, h}
  let colorHistory = [];

  /* ---------- FUNÇÕES DE DESENHO POR FERRAMENTA ---------- */

  function drawLapis(ctx, x0, y0, x1, y1, size, color) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.globalAlpha = 0.55;
    ctx.lineWidth = Math.max(1, size * 0.5);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();

    const dist = Math.hypot(x1 - x0, y1 - y0);
    const steps = Math.max(1, Math.floor(dist / 3));
    ctx.fillStyle = color;
    for (let i = 0; i < steps; i++) {
      const t = i / steps;
      const gx = x0 + (x1 - x0) * t + (Math.random() - 0.5) * size * 0.3;
      const gy = y0 + (y1 - y0) * t + (Math.random() - 0.5) * size * 0.3;
      ctx.globalAlpha = 0.12 + Math.random() * 0.18;
      ctx.beginPath();
      ctx.arc(gx, gy, Math.max(0.4, size * 0.12), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawCaneta(ctx, x0, y0, x1, y1, size, color) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.globalAlpha = 1;
    ctx.lineWidth = size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
    ctx.restore();
  }

  function drawMarcador(ctx, x0, y0, x1, y1, size, color) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineCap = 'square';
    ctx.lineJoin = 'round';
    ctx.globalAlpha = 0.42;
    ctx.lineWidth = size;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
    ctx.globalAlpha = 0.22;
    ctx.lineWidth = size * 0.6;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
    ctx.restore();
  }

  function drawRolo(ctx, x0, y0, x1, y1, size, color) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.globalAlpha = 0.88;
    ctx.lineWidth = size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();

    const angle = Math.atan2(y1 - y0, x1 - x0);
    const perp = angle + Math.PI / 2;
    const dist = Math.hypot(x1 - x0, y1 - y0);
    const steps = Math.max(1, Math.floor(dist / 4));
    ctx.globalAlpha = 0.10;
    ctx.lineWidth = Math.max(1, size * 0.06);
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const cx = x0 + (x1 - x0) * t;
      const cy = y0 + (y1 - y0) * t;
      const off = (size / 2) * 0.85;
      ctx.beginPath();
      ctx.moveTo(cx - Math.cos(perp) * off, cy - Math.sin(perp) * off);
      ctx.lineTo(cx + Math.cos(perp) * off, cy + Math.sin(perp) * off);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawPincel(ctx, x0, y0, x1, y1, size, color) {
    ctx.save();
    ctx.fillStyle = color;
    const dist = Math.hypot(x1 - x0, y1 - y0);
    const step = Math.max(1, size * 0.16);
    const steps = Math.max(1, Math.ceil(dist / step));
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const px = x0 + (x1 - x0) * t + (Math.random() - 0.5) * size * 0.18;
      const py = y0 + (y1 - y0) * t + (Math.random() - 0.5) * size * 0.18;
      const r = (size / 2) * (0.7 + Math.random() * 0.4);
      ctx.globalAlpha = 0.09 + Math.random() * 0.09;
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawBorracha(ctx, x0, y0, x1, y1, size) {
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.globalAlpha = 1;
    ctx.lineWidth = size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(0,0,0,1)';
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
    ctx.restore();
  }

  /* ---------- CANVAS: TAMANHO E FUNDO ---------- */

  function fitCanvasToFrame(preserve) {
    const w = canvasFrame.clientWidth;
    const h = canvasFrame.clientHeight;
    let snapshot = null;
    if (preserve && mainCanvas.width > 0) {
      snapshot = mainCanvas.toDataURL();
    }
    mainCanvas.width = w;
    mainCanvas.height = h;
    overlayCanvas.width = w;
    overlayCanvas.height = h;
    if (snapshot) {
      const img = new Image();
      img.onload = () => mainCtx.drawImage(img, 0, 0, w, h);
      img.src = snapshot;
    }
  }

  function applyBackgroundColor(color) {
    bgLayer.style.background = color;
  }

  /* ---------- POSIÇÃO DO PONTEIRO ---------- */

  function getCanvasPos(e) {
    const rect = mainCanvas.getBoundingClientRect();
    const scaleX = mainCanvas.width / rect.width;
    const scaleY = mainCanvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }

  function applyStroke(p0, p1) {
    const tool = TOOLS[currentTool];
    if (tool.isEraser) {
      tool.draw(mainCtx, p0.x, p0.y, p1.x, p1.y, currentSize);
      return;
    }
    let color = brushColorInput.value;
    if (rainbowCheckbox.checked) {
      hue = (hue + 4) % 360;
      color = `hsl(${hue}, 85%, 55%)`;
    }
    tool.draw(mainCtx, p0.x, p0.y, p1.x, p1.y, currentSize, color);
  }

  /* ---------- CURSOR DE PRÉVIA (TAMANHO) ---------- */

  function updateBrushCursor(e) {
    if (floatingImage) { brushCursor.style.display = 'none'; return; }
    const frameRect = canvasFrame.getBoundingClientRect();
    const canvasRect = mainCanvas.getBoundingClientRect();
    const scale = canvasRect.width / mainCanvas.width;
    const sizePx = Math.max(2, currentSize * scale);
    brushCursor.style.display = 'block';
    brushCursor.style.width = sizePx + 'px';
    brushCursor.style.height = sizePx + 'px';
    brushCursor.style.left = (e.clientX - frameRect.left) + 'px';
    brushCursor.style.top = (e.clientY - frameRect.top) + 'px';
    brushCursor.style.borderStyle = TOOLS[currentTool].isEraser ? 'dashed' : 'solid';
    brushCursor.style.background = TOOLS[currentTool].isEraser
      ? 'rgba(255,255,255,0.35)'
      : 'rgba(255,255,255,0.15)';
  }

  /* ---------- EVENTOS DE DESENHO (MOUSE + TOQUE) ---------- */

  mainCanvas.addEventListener('pointerdown', (e) => {
    if (floatingImage) return;
    e.preventDefault();
    drawing = true;
    lastPoint = getCanvasPos(e);
    mainCanvas.setPointerCapture(e.pointerId);
    if (!TOOLS[currentTool].isEraser && !rainbowCheckbox.checked) {
      pushColorHistory(brushColorInput.value);
    }
    applyStroke(lastPoint, { x: lastPoint.x + 0.01, y: lastPoint.y + 0.01 });
  });

  mainCanvas.addEventListener('pointermove', (e) => {
    updateBrushCursor(e);
    if (!drawing || floatingImage) return;
    const p = getCanvasPos(e);
    applyStroke(lastPoint, p);
    lastPoint = p;
  });

  window.addEventListener('pointerup', () => {
    if (drawing) {
      drawing = false;
      saveStrokesToStorage();
    }
  });

  mainCanvas.addEventListener('pointerenter', (e) => updateBrushCursor(e));
  mainCanvas.addEventListener('pointerleave', () => { brushCursor.style.display = 'none'; });

  /* ---------- SELEÇÃO DE FERRAMENTA ---------- */

  toolsGrid.addEventListener('click', (e) => {
    const btn = e.target.closest('.tool-btn');
    if (!btn) return;
    document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentTool = btn.dataset.tool;
    const cfg = TOOLS[currentTool];
    sizeRange.min = cfg.min;
    sizeRange.max = cfg.max;
    sizeRange.value = cfg.def;
    currentSize = cfg.def;
    updateSizeUI();
  });

  function updateSizeUI() {
    sizeValueLabel.textContent = currentSize + 'px';
    const dotSize = Math.min(currentSize, 50);
    sizeDot.style.width = dotSize + 'px';
    sizeDot.style.height = dotSize + 'px';
  }

  sizeRange.addEventListener('input', () => {
    currentSize = parseInt(sizeRange.value, 10);
    updateSizeUI();
  });

  /* ---------- CORES ---------- */

  bgColorInput.addEventListener('input', () => {
    applyBackgroundColor(bgColorInput.value);
    localStorage.setItem(LS_BG, bgColorInput.value);
  });

  brushColorInput.addEventListener('input', () => {
    renderColorHistory();
  });

  /* ---------- LIMPAR TUDO ---------- */

  clearBtn.addEventListener('click', () => {
    if (!confirm('Tem certeza que deseja apagar todo o desenho?')) return;
    mainCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
    saveStrokesToStorage();
  });

  /* ---------- BAIXAR PNG ---------- */

  downloadBtn.addEventListener('click', () => {
    const out = document.createElement('canvas');
    out.width = mainCanvas.width;
    out.height = mainCanvas.height;
    const octx = out.getContext('2d');
    octx.fillStyle = bgColorInput.value;
    octx.fillRect(0, 0, out.width, out.height);
    octx.drawImage(mainCanvas, 0, 0);
    const link = document.createElement('a');
    link.download = 'brawns-paint.png';
    link.href = out.toDataURL('image/png');
    link.click();
  });

  /* ---------- ARMAZENAMENTO LOCAL (AUTOSAVE) ---------- */

  let saveTimeout = null;
  function saveStrokesToStorage() {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      try {
        localStorage.setItem(LS_STROKES, mainCanvas.toDataURL('image/png'));
      } catch (err) {
        console.warn('Não foi possível salvar automaticamente:', err);
      }
    }, 150);
  }

  function loadFromStorage() {
    const savedBg = localStorage.getItem(LS_BG);
    if (savedBg) {
      bgColorInput.value = savedBg;
    }
    applyBackgroundColor(bgColorInput.value);

    const savedStrokes = localStorage.getItem(LS_STROKES);
    if (savedStrokes) {
      const img = new Image();
      img.onload = () => mainCtx.drawImage(img, 0, 0, mainCanvas.width, mainCanvas.height);
      img.src = savedStrokes;
    }
  }

  /* ---------- HISTÓRICO DE CORES USADAS PELAS FERRAMENTAS ---------- */

  function loadColorHistory() {
    try {
      colorHistory = JSON.parse(localStorage.getItem(LS_COLOR_HISTORY)) || [];
    } catch { colorHistory = []; }
  }

  function pushColorHistory(color) {
    colorHistory = colorHistory.filter(c => c.toLowerCase() !== color.toLowerCase());
    colorHistory.unshift(color);
    if (colorHistory.length > 12) colorHistory = colorHistory.slice(0, 12);
    localStorage.setItem(LS_COLOR_HISTORY, JSON.stringify(colorHistory));
    renderColorHistory();
  }

  function renderColorHistory() {
    colorHistoryEl.innerHTML = '';
    if (colorHistory.length === 0) {
      colorHistoryEl.innerHTML = '<span class="color-history-empty">nenhuma cor usada ainda</span>';
      return;
    }
    colorHistory.forEach(color => {
      const btn = document.createElement('button');
      btn.className = 'color-swatch';
      btn.style.background = color;
      btn.title = color;
      if (color.toLowerCase() === brushColorInput.value.toLowerCase()) {
        btn.classList.add('active-swatch');
      }
      btn.addEventListener('click', () => {
        brushColorInput.value = color;
        renderColorHistory();
      });
      colorHistoryEl.appendChild(btn);
    });
  }

  /* ---------- GALERIA (extra: salvar várias obras localmente) ---------- */

  function getGallery() {
    try {
      return JSON.parse(localStorage.getItem(LS_GALLERY)) || [];
    } catch { return []; }
  }

  function setGallery(list) {
    localStorage.setItem(LS_GALLERY, JSON.stringify(list));
  }

  function renderGallery() {
    const list = getGallery();
    galleryList.innerHTML = '';
    if (list.length === 0) {
      galleryList.innerHTML = '<p class="gallery-empty">Nenhuma obra salva ainda.</p>';
      return;
    }
    list.forEach((item, idx) => {
      const div = document.createElement('div');
      div.className = 'gallery-item';
      div.innerHTML = `
        <img src="${item.data}" alt="${item.name}" />
        <div class="g-name">${item.name}</div>
        <button class="g-del" title="Excluir">×</button>
      `;
      div.querySelector('img').addEventListener('click', () => loadGalleryItem(item));
      div.querySelector('.g-name').addEventListener('click', () => loadGalleryItem(item));
      div.querySelector('.g-del').addEventListener('click', (ev) => {
        ev.stopPropagation();
        const l = getGallery();
        l.splice(idx, 1);
        setGallery(l);
        renderGallery();
      });
      galleryList.appendChild(div);
    });
  }

  function loadGalleryItem(item) {
    if (!confirm(`Carregar "${item.name}"? O desenho atual na tela será substituído.`)) return;
    bgColorInput.value = item.bg;
    applyBackgroundColor(item.bg);
    localStorage.setItem(LS_BG, item.bg);
    mainCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
    const img = new Image();
    img.onload = () => {
      mainCtx.drawImage(img, 0, 0, mainCanvas.width, mainCanvas.height);
      saveStrokesToStorage();
    };
    img.src = item.data;
  }

  saveGalleryBtn.addEventListener('click', () => {
    const name = galleryNameInput.value.trim() || `Obra ${new Date().toLocaleDateString('pt-BR')}`;
    const list = getGallery();
    list.unshift({
      name,
      data: mainCanvas.toDataURL('image/png'),
      bg: bgColorInput.value,
      date: Date.now()
    });
    if (list.length > 30) list.pop();
    setGallery(list);
    galleryNameInput.value = '';
    renderGallery();
  });

  /* ---------- ENVIAR IMAGEM PNG/JPG E REDIMENSIONAR ---------- */

  imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const maxW = mainCanvas.width * 0.6;
        const maxH = mainCanvas.height * 0.6;
        let w = img.width, h = img.height;
        const ratio = Math.min(maxW / w, maxH / h, 1);
        w *= ratio; h *= ratio;
        floatingImage = {
          img,
          x: (mainCanvas.width - w) / 2,
          y: (mainCanvas.height - h) / 2,
          w, h
        };
        overlayCanvas.classList.add('active');
        imageControls.classList.remove('hidden');
        brushCursor.style.display = 'none';
        drawFloatingImage();
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
    imageInput.value = '';
  });

  function drawFloatingImage() {
    overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    if (!floatingImage) return;
    const { img, x, y, w, h } = floatingImage;
    overlayCtx.drawImage(img, x, y, w, h);
    overlayCtx.save();
    overlayCtx.strokeStyle = '#ff6b4a';
    overlayCtx.lineWidth = 2;
    overlayCtx.setLineDash([6, 4]);
    overlayCtx.strokeRect(x, y, w, h);
    overlayCtx.setLineDash([]);
    const handleSize = 14;
    overlayCtx.fillStyle = '#ff6b4a';
    overlayCtx.fillRect(x + w - handleSize / 2, y + h - handleSize / 2, handleSize, handleSize);
    overlayCtx.restore();
  }

  let imgDragMode = null; // 'move' | 'resize'
  let imgDragStart = null;

  overlayCanvas.addEventListener('pointerdown', (e) => {
    if (!floatingImage) return;
    const p = getOverlayPos(e);
    const { x, y, w, h } = floatingImage;
    const handleSize = 18;
    if (p.x >= x + w - handleSize && p.y >= y + h - handleSize && p.x <= x + w + handleSize && p.y <= y + h + handleSize) {
      imgDragMode = 'resize';
    } else if (p.x >= x && p.x <= x + w && p.y >= y && p.y <= y + h) {
      imgDragMode = 'move';
    } else {
      imgDragMode = null;
      return;
    }
    imgDragStart = p;
    overlayCanvas.setPointerCapture(e.pointerId);
  });

  overlayCanvas.addEventListener('pointermove', (e) => {
    if (!floatingImage || !imgDragMode) return;
    const p = getOverlayPos(e);
    const dx = p.x - imgDragStart.x;
    const dy = p.y - imgDragStart.y;
    if (imgDragMode === 'move') {
      floatingImage.x += dx;
      floatingImage.y += dy;
    } else if (imgDragMode === 'resize') {
      floatingImage.w = Math.max(20, floatingImage.w + dx);
      floatingImage.h = Math.max(20, floatingImage.h + dy);
    }
    imgDragStart = p;
    drawFloatingImage();
  });

  window.addEventListener('pointerup', () => { imgDragMode = null; });

  function getOverlayPos(e) {
    const rect = overlayCanvas.getBoundingClientRect();
    const scaleX = overlayCanvas.width / rect.width;
    const scaleY = overlayCanvas.height / rect.height;
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  }

  applyImageBtn.addEventListener('click', () => {
    if (!floatingImage) return;
    const { img, x, y, w, h } = floatingImage;
    mainCtx.drawImage(img, x, y, w, h);
    endFloatingImage();
    saveStrokesToStorage();
  });

  cancelImageBtn.addEventListener('click', endFloatingImage);

  function endFloatingImage() {
    floatingImage = null;
    overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    overlayCanvas.classList.remove('active');
    imageControls.classList.add('hidden');
  }

  /* ---------- REDIMENSIONAMENTO DA JANELA ---------- */

  let resizeTimeout = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      fitCanvasToFrame(true);
      if (floatingImage) drawFloatingImage();
    }, 200);
  });

  /* ---------- INICIALIZAÇÃO ---------- */

  function init() {
    fitCanvasToFrame(false);
    loadFromStorage();
    updateSizeUI();
    renderGallery();
    loadColorHistory();
    renderColorHistory();
  }

  init();
})();
