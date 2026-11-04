/* =========================================================
   Webseek Figurativo — LP
   - Simulador de pesquisa figurativa (100% client-side, dados fictícios)
   - Formulário curto enviado ao HubSpot (Forms API v3)
   ========================================================= */

/* ---------- CONFIGURAÇÃO ---------- */
const CONFIG = {
  hubspot: {
    portalId: '50803294',                              // portal da LP atual
    formGuid: '7d47e822-6436-49be-aecb-178286f71045',  // formulário da LP atual
    // Nome interno da propriedade do HubSpot para "Já é cliente Webseek?".
    // Deixe vazio se o formulário não tiver esse campo (senão o HubSpot rejeita o envio).
    clienteFieldName: ''
  },
  simCredits: 5
};

/* ---------- Analytics (GTM / dataLayer, se existir) ---------- */
window.dataLayer = window.dataLayer || [];
const track = (event, data = {}) => window.dataLayer.push({ event, ...data });
document.addEventListener('click', (e) => {
  const a = e.target.closest('[data-cta]');
  if (a) track('lp_cta_click', { cta: a.dataset.cta });
});

/* =========================================================
   SIMULADOR (réplica da tela "Pesquisa Figurativa")
   ========================================================= */
(() => {
  const $ = (id) => document.getElementById(id);

  /* ----- Formas (coordenadas unitárias, centro 0,0, raio 1) ----- */
  const poly = (n, rot = -90) => Array.from({ length: n }, (_, i) => {
    const a = (rot + (360 / n) * i) * Math.PI / 180;
    return [Math.cos(a), Math.sin(a)];
  });
  const pts = (arr) => 'M' + arr.map(p => p.map(v => v.toFixed(3)).join(',')).join('L') + 'Z';
  const starPts = Array.from({ length: 10 }, (_, i) => {
    const a = (-90 + 36 * i) * Math.PI / 180, r = i % 2 ? 0.45 : 1;
    return [Math.cos(a) * r, Math.sin(a) * r];
  });

  const SHAPES = {
    circle:   { label: 'Círculo',   cfe: '26.01.01', d: 'M-1,0A1,1 0 1,0 1,0A1,1 0 1,0 -1,0Z' },
    triangle: { label: 'Triângulo', cfe: '26.03.01', d: pts(poly(3)) },
    square:   { label: 'Quadrado',  cfe: '26.04.01', d: pts(poly(4, -45)) },
    pentagon: { label: 'Pentágono', cfe: '26.05.01', d: pts(poly(5)) },
    hexagon:  { label: 'Hexágono',  cfe: '26.05.03', d: pts(poly(6, 0)) },
    octagon:  { label: 'Octógono',  cfe: '26.05.05', d: pts(poly(8, -22.5)) },
    gem:      { label: 'Diamante',  cfe: '26.04.09', d: pts([[-0.6, -0.65], [0.6, -0.65], [1, -0.1], [0, 1], [-1, -0.1]]) },
    star:     { label: 'Estrela',   cfe: '01.01.02', d: pts(starPts) },
    leaf:     { label: 'Folha',     cfe: '05.03.13', d: 'M0,-1C0.95,-0.45 0.95,0.45 0,1C-0.95,0.45 -0.95,-0.45 0,-1ZM0,-0.6L0,0.85' },
    crescent: { label: 'Crescente', cfe: '01.07.01', d: 'M0.35,-0.94A1,1 0 1,0 0.35,0.94A0.78,0.78 0 1,1 0.35,-0.94Z' }
  };
  const SHAPE_KEYS = Object.keys(SHAPES);

  // Similaridade visual entre formas — base do ranking composto
  const SIM = {
    'circle|octagon': .78, 'hexagon|octagon': .82, 'circle|hexagon': .62, 'hexagon|pentagon': .72,
    'octagon|pentagon': .6, 'pentagon|square': .52, 'hexagon|square': .45, 'gem|triangle': .56,
    'gem|pentagon': .5, 'star|triangle': .42, 'crescent|circle': .55, 'circle|leaf': .36,
    'gem|leaf': .38, 'leaf|triangle': .3, 'crescent|leaf': .4, 'gem|square': .44, 'pentagon|star': .38
  };
  const shapeSim = (a, b) => a === b ? 1 : (SIM[[a, b].sort().join('|')] ?? 0.08);

  const rng = (seed) => () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  const hashStr = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  const el = (shape, cx, cy, r, rot = 0) => ({ shape, cx, cy, r, rot });

  const SAMPLES = [
    { id: 's1', name: 'Pentágono + círculo', els: [el('pentagon', 36, 62, 23), el('circle', 68, 31, 17)] },
    { id: 's2', name: 'Estrela + crescente', els: [el('star', 38, 60, 25), el('crescent', 72, 30, 16)] },
    { id: 's3', name: 'Hexágono + folha',    els: [el('hexagon', 36, 62, 22), el('leaf', 70, 32, 18, 35)] }
  ];

  const NAMES = ['Órbita', 'Vértice', 'Nexo', 'Prisma Lab', 'Aurora', 'Polar', 'Kora', 'Lumen', 'Atlas', 'Ícaro', 'Mira', 'Zênite',
    'Brava', 'Sólida', 'Vivaz', 'Áurea', 'Trilha', 'Faro', 'Nimbus', 'Onda Sul', 'Cora', 'Sigma', 'Verde Vivo', 'Alba', 'Pétala', 'Quartzo'];
  const STATUS = ['Registro em vigor', 'Registro em vigor', 'Em exame de mérito', 'Pedido publicado', 'Em oposição'];

  const LIBRARY = (() => {
    const r = rng(42), lib = [];
    const layouts = [
      () => [[36 + r() * 6, 60 + r() * 6, 20 + r() * 5], [66 + r() * 6, 30 + r() * 6, 15 + r() * 4]],
      () => [[30 + r() * 4, 50, 18 + r() * 3], [70 - r() * 4, 50, 18 + r() * 3]],
      () => [[50, 50, 30 + r() * 6]]
    ];
    const pick = () => SHAPE_KEYS[Math.floor(r() * SHAPE_KEYS.length)];
    const make = (shapes, layout) => {
      const L = layouts[layout]();
      return shapes.map((s, i) => el(s, L[i][0], L[i][1], L[i][2], s === 'leaf' ? r() * 60 : 0));
    };
    const near = [
      ['pentagon', 'circle'], ['hexagon', 'circle'], ['octagon', 'pentagon'], ['octagon', 'circle'], ['star', 'circle'],
      ['pentagon', 'leaf'], ['octagon', 'leaf'], ['pentagon', 'triangle'], ['octagon', 'gem'], ['pentagon', 'crescent'],
      ['star', 'crescent'], ['triangle', 'crescent'], ['star', 'leaf'], ['hexagon', 'leaf'], ['hexagon', 'gem'], ['hexagon', 'pentagon']
    ];
    near.forEach(p => lib.push(make(p, 0)));
    for (let i = 0; i < 60; i++) {
      const layout = Math.floor(r() * 3);
      lib.push(make(layout === 2 ? [pick()] : [pick(), pick()], layout));
    }
    return lib.map((els, i) => ({
      id: 'm' + i, els,
      name: NAMES[i % NAMES.length],
      kind: r() > .45 ? 'Mista' : 'Figurativa',
      proc: '9' + String(Math.floor(r() * 1e8)).padStart(8, '0'),
      ncl: String(1 + Math.floor(r() * 45)),
      status: STATUS[Math.floor(r() * STATUS.length)],
      noise: r()
    }));
  })();

  /* ----- Render SVG (traço proporcional, como na interface real) ----- */
  const markSVG = (els, stroke = '#111418') =>
    `<svg viewBox="0 0 100 100" role="img" aria-hidden="true">${els.map(e =>
      `<g transform="translate(${e.cx} ${e.cy}) rotate(${e.rot}) scale(${e.r})"><path d="${SHAPES[e.shape].d}" fill="none" stroke="${stroke}" stroke-width="${(5.5 / e.r).toFixed(3)}" stroke-linejoin="round" stroke-linecap="round"/></g>`
    ).join('')}</svg>`;

  /* ----- Estado ----- */
  const state = {
    source: SAMPLES[0], crop: null, cropMode: false,
    seen: new Set(), credits: CONFIG.simCredits,
    results: [], selected: new Set(), desc: true
  };

  /* ----- NCL: Todas + 45 classes ----- */
  $('simNcl').innerHTML = '<option value="">Todas</option>' +
    Array.from({ length: 45 }, (_, i) => `<option value="${i + 1}">${i + 1}</option>`).join('');

  /* ----- Amostras (fora da janela do app) ----- */
  const samplesBox = $('simSamples');
  const renderSamples = () => {
    samplesBox.innerHTML = SAMPLES.map(s =>
      `<button type="button" class="sample" role="radio" aria-checked="${state.source.id === s.id}" data-id="${s.id}" title="${s.name}">${markSVG(s.els)}</button>`
    ).join('');
  };
  samplesBox.addEventListener('click', (e) => {
    const b = e.target.closest('button.sample');
    if (b) setSource(SAMPLES.find(s => s.id === b.dataset.id));
  });
  $('simUpload').addEventListener('change', (e) => handleFile(e.target.files[0]));

  function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) return;
    if (file.size > 8 * 1024 * 1024) { toast('Imagem muito grande para a demonstração (máx. 8 MB).', true); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      setSource({ id: 'upload', upload: true, dataUrl, hash: hashStr(dataUrl.slice(0, 4000) + dataUrl.length) });
      track('lp_sim_upload');
    };
    reader.readAsDataURL(file);
  }

  // Colar imagem: botão (Clipboard API) e Ctrl+V com o simulador visível
  $('simPaste').addEventListener('click', async () => {
    try {
      for (const item of await navigator.clipboard.read()) {
        const type = item.types.find(t => t.startsWith('image/'));
        if (type) { handleFile(new File([await item.getType(type)], 'colada.' + type.split('/')[1], { type })); return; }
      }
      toast('Nenhuma imagem na área de transferência. Copie uma imagem e tente de novo.', true);
    } catch {
      toast('Use Ctrl+V (ou ⌘+V) para colar a imagem aqui.', true);
    }
  });
  document.addEventListener('paste', (e) => {
    const r = $('sim').getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    const file = [...(e.clipboardData?.files || [])].find(f => f.type.startsWith('image/'));
    if (file) { e.preventDefault(); handleFile(file); }
  });

  function setSource(src) {
    state.source = src;
    state.crop = null;
    setCropMode(false);
    renderSamples(); renderImage();
  }

  /* ----- Imagem + recorte ----- */
  const canvas = $('simCanvas'), cropEl = $('simCrop');
  const renderImage = () => {
    $('simImage').innerHTML = state.source.upload
      ? `<img src="${state.source.dataUrl}" alt="Marca enviada">`
      : markSVG(state.source.els);
  };
  const placeCrop = () => {
    const c = state.crop;
    Object.assign(cropEl.style, { left: c.x + '%', top: c.y + '%', width: c.w + '%', height: c.h + '%' });
  };
  // Converte coordenadas da marca (viewBox 0–100) para % do canvas
  const geom = () => {
    const cr = canvas.getBoundingClientRect();
    const node = $('simImage').firstElementChild;
    const r = node.getBoundingClientRect();
    const side = Math.min(r.width, r.height);
    return { cr, ox: r.left + (r.width - side) / 2 - cr.left, oy: r.top + (r.height - side) / 2 - cr.top, s: side / 100 };
  };
  const markToPct = (x, y, g = geom()) => ({ x: (g.ox + x * g.s) / g.cr.width * 100, y: (g.oy + y * g.s) / g.cr.height * 100 });

  function setCropMode(on) {
    state.cropMode = on;
    $('simCropBtn').setAttribute('aria-pressed', on);
    if (on && !state.crop) {
      const t = !state.source.upload && state.source.els[1];
      if (t) {
        const g = geom(), a = markToPct(t.cx - t.r * 1.35, t.cy - t.r * 1.35, g), b = markToPct(t.cx + t.r * 1.35, t.cy + t.r * 1.35, g);
        state.crop = { x: a.x, y: a.y, w: b.x - a.x, h: b.y - a.y };
      } else state.crop = { x: 35, y: 20, w: 30, h: 60 };
    }
    cropEl.hidden = !state.crop;
    if (state.crop) placeCrop();
  }
  $('simCropBtn').addEventListener('click', () => setCropMode(!state.cropMode || !state.crop));
  $('simClear').addEventListener('click', () => { state.crop = null; setCropMode(false); });

  let drag = null;
  cropEl.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    drag = { h: e.target.dataset.h || 'move', sx: e.clientX, sy: e.clientY, start: { ...state.crop }, rect: canvas.getBoundingClientRect() };
    cropEl.setPointerCapture(e.pointerId);
  });
  cropEl.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const dx = (e.clientX - drag.sx) / drag.rect.width * 100;
    const dy = (e.clientY - drag.sy) / drag.rect.height * 100;
    const s = drag.start, c = { ...s }, min = 8;
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    if (drag.h === 'move') { c.x = clamp(s.x + dx, 0, 100 - s.w); c.y = clamp(s.y + dy, 0, 100 - s.h); }
    if (drag.h.includes('w')) { c.x = clamp(s.x + dx, 0, s.x + s.w - min); c.w = s.w + (s.x - c.x); }
    if (drag.h.includes('e')) { c.w = clamp(s.w + dx, min, 100 - s.x); }
    if (drag.h.includes('n')) { c.y = clamp(s.y + dy, 0, s.y + s.h - min); c.h = s.h + (s.y - c.y); }
    if (drag.h.includes('s')) { c.h = clamp(s.h + dy, min, 100 - s.y); }
    state.crop = c; placeCrop();
  });
  const endDrag = () => { drag = null; };
  cropEl.addEventListener('pointerup', endDrag);
  cropEl.addEventListener('pointercancel', endDrag);

  const queryEls = () => {
    if (state.source.upload) return [];
    const all = state.source.els;
    if (!state.crop) return all;
    const c = state.crop, g = geom();
    const inside = all.filter(e => { const p = markToPct(e.cx, e.cy, g); return p.x >= c.x && p.x <= c.x + c.w && p.y >= c.y && p.y <= c.y + c.h; });
    return inside.length ? inside : all;
  };

  /* ----- Ranking composto ----- */
  function rank() {
    const ncl = $('simNcl').value;
    const cfe = $('simCfe').value.trim().replace(/[^\d.]/g, '');
    const exact = $('simExact').checked && cfe;
    const Q = queryEls();
    const seed = state.source.upload ? state.source.hash + (state.crop ? Math.round(state.crop.x * 7 + state.crop.y * 13) : 0) : 1;
    const r = rng(seed);

    return LIBRARY.map(m => {
      let s;
      if (state.source.upload) {
        s = Math.pow(r(), 1.8) * 0.95; // upload: sem análise real no navegador → ranking ilustrativo estável por imagem
      } else {
        const best = Q.map(q => Math.max(...m.els.map(c => shapeSim(q.shape, c.shape) * (1 - Math.abs(q.r - c.r) / 60))));
        const elemScore = best.reduce((a, b) => a + b, 0) / Q.length;
        const extra = state.crop ? 0 : Math.max(0, m.els.length - Q.length) * 0.08 + Math.max(0, Q.length - m.els.length) * 0.12;
        const layout = (Q.length === 2 && m.els.length === 2)
          ? 1 - Math.min(1, Math.hypot((Q[1].cx - Q[0].cx) - (m.els[1].cx - m.els[0].cx), (Q[1].cy - Q[0].cy) - (m.els[1].cy - m.els[0].cy)) / 60)
          : 0.4;
        s = elemScore * 0.82 + layout * 0.18 - extra;
      }
      const codes = [...new Set(m.els.map(e => SHAPES[e.shape].cfe))];
      const hasCfe = cfe && codes.some(c => c.startsWith(cfe));
      if (hasCfe) s += 0.06;
      s += (m.noise - 0.5) * 0.04;
      return { ...m, s, codes, hasCfe, ncl: ncl || m.ncl };
    })
      .filter(m => !exact || m.hasCfe)
      .sort((a, b) => b.s - a.s)
      .slice(0, 18);
  }

  /* ----- Toast (dentro da janela) ----- */
  let toastTimer;
  function toast(msg, warn = false) {
    const t = $('simToast');
    t.textContent = msg; t.hidden = false; t.classList.toggle('is-warn', warn);
    clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.hidden = true; }, 5000);
  }

  /* ----- Pesquisa ----- */
  let busy = false;
  function search() {
    if (busy) return;
    const imgKey = state.source.upload ? 'u' + state.source.hash : state.source.id;
    const repeated = state.seen.has(imgKey);
    if (!repeated && state.credits <= 0) {
      toast('Os créditos da demonstração acabaram. Agende uma demonstração para pesquisar na sua base real.', true);
      $('simCta').hidden = false;
      return;
    }
    if (repeated) toast('Imagem idêntica já pesquisada: nenhum crédito foi consumido.');
    else { state.credits--; $('simCredits').textContent = state.credits; state.seen.add(imgKey); }

    // Animação: scanner sobre a imagem + carregando no lugar dos resultados
    const results = rank();
    busy = true;
    state.results = []; state.selected.clear(); updateSel();
    $('simCount').textContent = '0';
    $('simActions').disabled = true;
    canvas.classList.add('is-scanning');
    $('simSearch').setAttribute('aria-busy', 'true');
    $('simGrid').innerHTML = `<div class="sim__loading" role="status">
        <span class="sim__spinner" aria-hidden="true"></span>
        <strong>Analisando elementos figurativos…</strong>
        <span>Comparando com a base de marcas</span>
      </div>`;
    if (window.innerWidth <= 1024) $('simGrid').closest('.app__right').scrollIntoView({ behavior: 'smooth', block: 'start' });
    const wait = matchMedia('(prefers-reduced-motion: reduce)').matches ? 300 : (repeated ? 900 : 1600);
    setTimeout(() => {
      canvas.classList.remove('is-scanning');
      $('simSearch').removeAttribute('aria-busy');
      state.results = results;
      state.desc = true;
      renderResults();
      $('simCta').hidden = false;
      busy = false;
    }, wait);
    track('lp_sim_search', { source: state.source.upload ? 'upload' : state.source.id, crop: !!state.crop, ncl: $('simNcl').value || 'todas' });
  }
  $('simSearch').addEventListener('click', search);

  function renderResults() {
    const list = state.desc ? state.results : [...state.results].reverse();
    $('simCount').textContent = list.length;
    $('simActions').disabled = list.length === 0;
    $('simGrid').innerHTML = list.map(m => `
      <button type="button" class="res${state.selected.has(m.id) ? ' is-selected' : ''}" data-id="${m.id}" aria-pressed="${state.selected.has(m.id)}" title="${m.kind === 'Mista' ? m.name : 'Marca figurativa'}">
        <span class="res__check" aria-hidden="true">✓</span>
        <span class="res__img">${markSVG(m.els)}</span>
      </button>`).join('') || '<div class="sim__empty"><p>Nenhuma marca encontrada com esses filtros. Tente desmarcar <strong>Exato</strong> ou limpar o CFE.</p></div>';
    updateSel();
  }

  $('simSort').addEventListener('click', () => { if (state.results.length) { state.desc = !state.desc; renderResults(); } });

  /* ----- Seleção ----- */
  $('simGrid').addEventListener('click', (e) => {
    const card = e.target.closest('.res'); if (!card) return;
    const id = card.dataset.id;
    state.selected.has(id) ? state.selected.delete(id) : state.selected.add(id);
    card.classList.toggle('is-selected', state.selected.has(id));
    card.setAttribute('aria-pressed', state.selected.has(id));
    updateSel();
  });
  $('simAll').addEventListener('change', (e) => {
    state.selected = e.target.checked ? new Set(state.results.map(m => m.id)) : new Set();
    renderResults();
  });
  function updateSel() {
    const n = state.selected.size, total = state.results.length;
    $('simSelCount').textContent = n;
    $('simCompare').disabled = n === 0;
    const all = $('simAll');
    all.checked = total > 0 && n === total;
    all.indeterminate = n > 0 && n < total;
  }

  /* ----- Ações ----- */
  const menu = $('simActionsMenu'), actBtn = $('simActions');
  const closeMenu = () => { menu.hidden = true; actBtn.setAttribute('aria-expanded', 'false'); };
  actBtn.addEventListener('click', (e) => { e.stopPropagation(); menu.hidden = !menu.hidden; actBtn.setAttribute('aria-expanded', String(!menu.hidden)); });
  document.addEventListener('click', (e) => { if (!e.target.closest('.actions')) closeMenu(); });
  menu.addEventListener('click', (e) => {
    const b = e.target.closest('[data-act="compare"]');
    closeMenu();
    if (b) {
      if (!state.selected.size) { toast('Selecione ao menos uma marca para comparar.', true); return; }
      openCompare();
    }
  });

  /* ----- Comparação (modal dentro do simulador) ----- */
  const modal = $('cmpModal');
  let lastFocus = null;
  function openCompare() {
    const sel = state.results.filter(m => state.selected.has(m.id));
    const shown = sel.slice(0, 5);
    const ref = state.source.upload ? `<img src="${state.source.dataUrl}" alt="Sua marca">` : markSVG(state.source.els, '#0167C0');
    const Q = queryEls(), qShapes = Q.map(e => e.shape);
    $('cmpBody').innerHTML = `
      <div class="cmp__item cmp__item--ref">
        <div class="cmp__img">${ref}</div>
        <h4>Marca pesquisada</h4>
        <p>${state.source.upload ? 'Imagem enviada' : Q.map(e => SHAPES[e.shape].label).join(' + ')}${state.crop && !state.source.upload ? ' (recorte)' : ''}</p>
      </div>` + shown.map(m => {
        const common = [...new Set(m.els.map(e => e.shape).filter(s => qShapes.some(q => shapeSim(q, s) >= .5)))].map(s => SHAPES[s].label);
        return `
        <div class="cmp__item">
          <div class="cmp__img">${markSVG(m.els)}</div>
          <h4>${m.kind === 'Mista' ? m.name.toUpperCase() : 'Marca figurativa'}</h4>
          <p>Proc. ${m.proc} · NCL ${m.ncl}</p>
          <p>${m.status}</p>
          <p>CFE: ${m.codes.join(', ')}</p>
          ${common.length ? `<p><strong>Elementos em comum:</strong> ${common.join(', ')}</p>` : ''}
        </div>`;
      }).join('') + (sel.length > shown.length ? `<div class="cmp__item"><p>+ ${sel.length - shown.length} marcas selecionadas. Na versão completa você compara todas.</p></div>` : '');
    lastFocus = document.activeElement;
    modal.hidden = false;
    modal.querySelector('.modal__x').focus({ preventScroll: true });
    track('lp_sim_compare', { count: sel.length });
  }
  $('simCompare').addEventListener('click', openCompare);
  const closeModal = () => { modal.hidden = true; lastFocus && lastFocus.focus({ preventScroll: true }); };
  modal.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) closeModal(); });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (!modal.hidden) closeModal();
    closeMenu();
  });

  /* ----- Init ----- */
  $('simCredits').textContent = state.credits;
  renderSamples(); renderImage();
})();

/* =========================================================
   FORMULÁRIO
   ========================================================= */
(() => {
  const form = document.getElementById('leadForm');
  const phone = form.elements.phone;

  phone.addEventListener('input', () => {
    const d = phone.value.replace(/\D/g, '').slice(0, 11);
    phone.value = d.length > 10 ? `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
      : d.length > 6 ? `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
      : d.length > 2 ? `(${d.slice(0, 2)}) ${d.slice(2)}`
      : d;
  });

  const rules = {
    firstname: (v) => v.trim().length >= 2,
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()),
    phone: (v) => v.replace(/\D/g, '').length >= 10
  };
  const validate = (name) => {
    const input = form.elements[name];
    const ok = rules[name](input.value);
    input.closest('.field').classList.toggle('is-invalid', !ok);
    return ok;
  };
  Object.keys(rules).forEach(n => form.elements[n].addEventListener('blur', () => validate(n)));

  let started = false;
  form.addEventListener('focusin', () => { if (!started) { started = true; track('lp_form_start'); } });

  const cookie = (k) => (document.cookie.match('(^|;)\\s*' + k + '\\s*=\\s*([^;]+)') || [])[2];

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const invalid = Object.keys(rules).filter(n => !validate(n));
    if (invalid.length) { form.elements[invalid[0]].focus(); return; }

    const btn = document.getElementById('leadSubmit');
    btn.disabled = true; btn.textContent = 'Enviando…';

    const { portalId, formGuid, clienteFieldName } = CONFIG.hubspot;
    const fields = [
      { name: 'firstname', value: form.elements.firstname.value.trim() },
      { name: 'email', value: form.elements.email.value.trim() },
      { name: 'phone', value: form.elements.phone.value.trim() }
    ];
    if (clienteFieldName) fields.push({ name: clienteFieldName, value: form.elements.cliente_webseek.value });

    try {
      const res = await fetch(`https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${formGuid}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields,
          context: { hutk: cookie('hubspotutk'), pageUri: location.href, pageName: document.title }
        })
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      document.getElementById('leadOk').hidden = false;
      track('lp_form_submit', { cliente_webseek: form.elements.cliente_webseek.value });
    } catch (err) {
      console.error('Falha no envio ao HubSpot:', err);
      btn.disabled = false; btn.textContent = 'Quero minha demonstração';
      alert('Não conseguimos enviar agora. Tente novamente em instantes.');
    }
  });
})();

/* =========================================================
   CTA fixo no mobile (aparece após o banner, some no formulário)
   ========================================================= */
(() => {
  const bar = document.getElementById('mbar');
  const hero = document.querySelector('.hero');
  const lead = document.getElementById('demonstracao');
  if (!('IntersectionObserver' in window)) return;
  let pastHero = false, onLead = false;
  const update = () => bar.classList.toggle('is-visible', pastHero && !onLead);
  new IntersectionObserver(([e]) => { pastHero = !e.isIntersecting; update(); }).observe(hero);
  new IntersectionObserver(([e]) => { onLead = e.isIntersecting; update(); }, { threshold: 0.15 }).observe(lead);
})();


/* =========================================================
   Banner: brilho sutil que acompanha o cursor (só desktop)
   ========================================================= */
(() => {
  const hero = document.querySelector('.hero');
  if (!hero || !matchMedia('(pointer: fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let tx = 0, ty = 0, x = 0, y = 0, raf = 0, started = false;
  const loop = () => {
    x += (tx - x) * 0.08;               // interpolação: o brilho "persegue" o cursor com suavidade
    y += (ty - y) * 0.08;
    hero.style.setProperty('--gx', x.toFixed(1) + 'px');
    hero.style.setProperty('--gy', y.toFixed(1) + 'px');
    raf = (Math.abs(tx - x) > 0.3 || Math.abs(ty - y) > 0.3) ? requestAnimationFrame(loop) : 0;
  };
  hero.addEventListener('pointermove', (e) => {
    const r = hero.getBoundingClientRect();
    tx = e.clientX - r.left; ty = e.clientY - r.top;
    if (!started) { x = tx; y = ty; started = true; }
    hero.classList.add('has-glow');
    if (!raf) raf = requestAnimationFrame(loop);
  });
  hero.addEventListener('pointerleave', () => hero.classList.remove('has-glow'));
})();
