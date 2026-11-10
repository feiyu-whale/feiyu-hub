/* ============================================================
   积木工坊 · 编辑器核心 v1.0.0
   拖块 → 连线 → 导出
   ============================================================ */

const BF = {
  nodes: [],      // {uid, blockId, x, y, cfg}
  links: [],      // {uid, from:{node,port}, to:{node,port}}
  seq: 1,
  selected: null,
  linking: null,  // 拖线中 {node, port, type, side}
  drag: null,
  scale: 1,
  dirty: false
};

/* ---------- 工具 ---------- */
function bfUid(p) { return (p || 'n') + '_' + (BF.seq++); }

function bfEsc(v) {
  return String(v === null || v === undefined ? '' : v)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function bfToast(msg) {
  const el = document.getElementById('bfToast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 1800);
}

/* ---------- 状态读写 ---------- */
function bfSave() {
  try {
    localStorage.setItem('bf.project.v1', JSON.stringify({
      nodes: BF.nodes, links: BF.links, seq: BF.seq, scale: BF.scale
    }));
    BF.dirty = false;
    bfUpdateMeta();
  } catch (e) { /* 存储满就静默 */ }
}

function bfLoad() {
  try {
    const raw = localStorage.getItem('bf.project.v1');
    if (!raw) return false;
    const d = JSON.parse(raw);
    BF.nodes = d.nodes || [];
    BF.links = d.links || [];
    BF.seq = d.seq || 1;
    BF.scale = d.scale || 1;
    return true;
  } catch (e) { return false; }
}

/* ---------- 加块 ---------- */
function bfAddNode(blockId, x, y) {
  const def = bfBlockDef(blockId);
  if (!def) return null;
  const node = {
    uid: bfUid(blockId.replace(/\W/g, '')),
    blockId,
    x: x !== undefined ? x : 60 + (BF.nodes.length % 5) * 40,
    y: y !== undefined ? y : 60 + (BF.nodes.length % 5) * 40,
    cfg: bfDefaultCfg(def)
  };
  BF.nodes.push(node);
  bfRenderAll();
  bfSave();
  return node;
}

function bfRemoveNode(uid) {
  BF.nodes = BF.nodes.filter(n => n.uid !== uid);
  BF.links = BF.links.filter(l => l.from.node !== uid && l.to.node !== uid);
  bfRenderAll();
  bfSave();
}

/* ---------- 连线 ---------- */
function bfCanLink(from, to) {
  if (!from || !to) return false;
  if (from.node === to.node) return false;          // 不能连自己
  if (from.side === to.side) return false;           // 输出连输入
  // 去重
  const dup = BF.links.some(l =>
    (l.from.node === from.node && l.from.port === from.port &&
      l.to.node === to.node && l.to.port === to.port) ||
    (l.from.node === to.node && l.from.port === to.port &&
      l.to.node === from.node && l.to.port === from.port));
  if (dup) return false;
  return bfPortCompatible(from.type, to.type);
}

function bfAddLink(from, to) {
  const a = from.side === 'out' ? from : to;
  const b = from.side === 'out' ? to : from;
  if (!bfCanLink(a, b)) return false;
  BF.links.push({ uid: bfUid('l'), from: { node: a.node, port: a.port }, to: { node: b.node, port: b.port } });
  bfRenderAll();
  bfSave();
  return true;
}

function bfRemoveLink(uid) {
  BF.links = BF.links.filter(l => l.uid !== uid);
  bfRenderAll();
  bfSave();
}

/* ---------- 渲染画布 ---------- */
function bfRenderAll() {
  const layer = document.getElementById('bfNodes');
  const svg = document.getElementById('bfWires');
  layer.innerHTML = '';
  svg.innerHTML = '';

  BF.nodes.forEach(n => layer.appendChild(bfNodeEl(n)));
  bfDrawWires();
  bfUpdateMeta();
}

function bfNodeEl(n) {
  const def = bfBlockDef(n.blockId);
  const el = document.createElement('div');
  el.className = 'bf-node' + (BF.selected === n.uid ? ' sel' : '');
  el.dataset.uid = n.uid;
  el.style.left = n.x + 'px';
  el.style.top = n.y + 'px';

  let portsIn = '', portsOut = '';
  (def.inputs || []).forEach(p => {
    portsIn += `<div class="bf-port in" data-uid="${n.uid}" data-port="${bfEsc(p.key)}" data-type="${p.type}" data-side="in" title="${bfEsc(p.name)} · ${p.type}">
      <i></i><span>${bfEsc(p.name)}</span></div>`;
  });
  (def.outputs || []).forEach(p => {
    portsOut += `<div class="bf-port out" data-uid="${n.uid}" data-port="${bfEsc(p.key)}" data-type="${p.type}" data-side="out" title="${bfEsc(p.name)} · ${p.type}">
      <span>${bfEsc(p.name)}</span><i></i></div>`;
  });

  let fields = '';
  (def.fields || []).forEach(f => {
    const v = n.cfg[f.key];
    if (f.type === 'bool') {
      fields += `<label class="bf-fd"><span>${bfEsc(f.name)}</span>
        <input type="checkbox" data-uid="${n.uid}" data-key="${f.key}" ${v ? 'checked' : ''}></label>`;
    } else if (f.type === 'lines' || f.type === 'json') {
      fields += `<label class="bf-fd col"><span>${bfEsc(f.name)}</span>
        <textarea data-uid="${n.uid}" data-key="${f.key}" rows="3">${bfEsc(v)}</textarea></label>`;
    } else if (f.type === 'select') {
      const opts = (f.options || []).map(o =>
        `<option value="${bfEsc(o)}" ${String(v) === String(o) ? 'selected' : ''}>${bfEsc(o)}</option>`).join('');
      fields += `<label class="bf-fd"><span>${bfEsc(f.name)}</span>
        <select data-uid="${n.uid}" data-key="${f.key}">${opts}</select></label>`;
    } else {
      fields += `<label class="bf-fd"><span>${bfEsc(f.name)}</span>
        <input type="text" data-uid="${n.uid}" data-key="${f.key}" value="${bfEsc(v)}"></label>`;
    }
  });

  const badge = def.custom ? '<em class="bf-mine">我的</em>' : '';
  el.dataset.cat = def.cat || '';
  el.innerHTML = `
    <div class="bf-nhead" data-drag="${n.uid}">
      <b>${def.icon}</b><span>${bfEsc(def.name)}</span>${badge}
      <button class="bf-nx" data-del="${n.uid}" title="删除">×</button>
    </div>
    <div class="bf-nbody">
      <div class="bf-ports-in">${portsIn}</div>
      <div class="bf-ports-out">${portsOut}</div>
      <div class="bf-fields">${fields}</div>
    </div>`;

  return el;
}

/* ---------- 画连线（贝塞尔） ---------- */
function bfPortCenter(uid, port, side) {
  const nodeEl = document.querySelector(`.bf-node[data-uid="${uid}"]`);
  if (!nodeEl) return null;
  const p = nodeEl.querySelector(`.bf-port[data-port="${port}"][data-side="${side}"] i`);
  if (!p) return null;
  const r = p.getBoundingClientRect();
  const w = document.getElementById('bfCanvas').getBoundingClientRect();
  return {
    x: (r.left + r.width / 2 - w.left) / BF.scale + document.getElementById('bfViewport').scrollLeft,
    y: (r.top + r.height / 2 - w.top) / BF.scale + document.getElementById('bfViewport').scrollTop
  };
}

function bfDrawWires() {
  const svg = document.getElementById('bfWires');
  let html = '';
  BF.links.forEach(l => {
    const a = bfPortCenter(l.from.node, l.from.port, 'out');
    const b = bfPortCenter(l.to.node, l.to.port, 'in');
    if (!a || !b) return;
    const dx = Math.max(40, Math.abs(b.x - a.x) * 0.5);
    const d = `M ${a.x} ${a.y} C ${a.x + dx} ${a.y}, ${b.x - dx} ${b.y}, ${b.x} ${b.y}`;
    html += `<path class="bf-wire" data-link="${l.uid}" d="${d}"></path>`;
  });
  if (BF.linking && BF.linking.tmp) {
    const a = BF.linking.from;
    const b = BF.linking.tmp;
    const dx = Math.max(40, Math.abs(b.x - a.x) * 0.5);
    html += `<path class="bf-wire temp" d="M ${a.x} ${a.y} C ${a.x + dx} ${a.y}, ${b.x - dx} ${b.y}, ${b.x} ${b.y}"></path>`;
  }
  svg.innerHTML = html;
}

/* ---------- 顶部信息 ---------- */
function bfUpdateMeta() {
  const el = document.getElementById('bfMeta');
  if (el) el.textContent = `${BF.nodes.length} 块 · ${BF.links.length} 连线`;
}

/* ---------- 初始化 ---------- */
function bfInit() {
  // 块库
  const lib = document.getElementById('bfLib');
  const byCat = {};
  bfAllBlocks().forEach(b => { (byCat[b.cat] = byCat[b.cat] || []).push(b); });
  const order = ['data', 'ui', 'logic', 'api', 'custom'];
  let html = '';
  order.forEach(cat => {
    if (!byCat[cat]) return;
    // 接口类再按子分类分组
    if (cat === 'api') {
      const subs = {};
      byCat.api.forEach(b => { (subs[b.sub] = subs[b.sub] || []).push(b); });
      html += `<div class="bf-libcat toggle" data-cat="api">接口 <i>${byCat.api.length}</i></div>`;
      html += `<div class="bf-libgroup" data-group="api">`;
      Object.keys(BF_API_CATS).forEach(sk => {
        if (!subs[sk]) return;
        html += `<div class="bf-libsub">${BF_API_CATS[sk]}</div>`;
        subs[sk].forEach(b => {
          html += `<div class="bf-libitem" draggable="true" data-block="${b.id}" title="${bfEsc(b.desc)}">
            <b>${b.icon}</b><span>${bfEsc(b.name)}</span></div>`;
        });
      });
      html += `</div>`;
      return;
    }
    html += `<div class="bf-libcat">${BF_CATS[cat] || cat}</div>`;
    byCat[cat].forEach(b => {
      html += `<div class="bf-libitem" draggable="true" data-block="${b.id}" title="${bfEsc(b.desc)}">
        <b>${b.icon}</b><span>${bfEsc(b.name)}</span></div>`;
    });
  });
  lib.innerHTML = html;

  // 折叠接口分类
  lib.addEventListener('click', e => {
    const t = e.target.closest('.bf-libcat.toggle');
    if (!t) return;
    const g = lib.querySelector('[data-group="api"]');
    if (g) g.classList.toggle('fold');
  });

  // 拖拽进入画布
  lib.addEventListener('dragstart', e => {
    const it = e.target.closest('.bf-libitem');
    if (it) e.dataTransfer.setData('text/plain', it.dataset.block);
  });

  const canvas = document.getElementById('bfCanvas');
  canvas.addEventListener('dragover', e => e.preventDefault());
  canvas.addEventListener('drop', e => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    if (!id) return;
    const r = canvas.getBoundingClientRect();
    bfAddNode(id,
      (e.clientX - r.left) / BF.scale - 70,
      (e.clientY - r.top) / BF.scale - 20);
  });

  // 点块库也能加（防拖拽不稳）
  lib.addEventListener('click', e => {
    const it = e.target.closest('.bf-libitem');
    if (it) bfAddNode(it.dataset.block);
  });

  bfBindCanvasEvents(canvas);
  bfLoad();
  bfRenderAll();
}

function bfBindCanvasEvents(canvas) {
  const viewport = document.getElementById('bfViewport');

  /* 按下：拖节点 / 拉线 / 点选 */
  canvas.addEventListener('mousedown', e => {
    const head = e.target.closest('[data-drag]');
    const port = e.target.closest('.bf-port');
    const nodeEl = e.target.closest('.bf-node');

    if (port) {
      const c = bfPortCenter(port.dataset.uid, port.dataset.port, port.dataset.side);
      BF.linking = {
        from: { node: port.dataset.uid, port: port.dataset.port, type: port.dataset.type, side: port.dataset.side },
        start: c, tmp: c
      };
      e.preventDefault();
      return;
    }

    if (head) {
      const uid = head.dataset.drag;
      const n = BF.nodes.find(x => x.uid === uid);
      if (!n) return;
      BF.selected = uid;
      BF.drag = { uid, ox: e.clientX, oy: e.clientY, nx: n.x, ny: n.y };
      document.querySelectorAll('.bf-node').forEach(el =>
        el.classList.toggle('sel', el.dataset.uid === uid));
      e.preventDefault();
      return;
    }

    if (!nodeEl) {
      BF.selected = null;
      document.querySelectorAll('.bf-node').forEach(el => el.classList.remove('sel'));
    }
  });

  /* 移动 */
  window.addEventListener('mousemove', e => {
    if (BF.drag) {
      const n = BF.nodes.find(x => x.uid === BF.drag.uid);
      if (!n) return;
      n.x = BF.drag.nx + (e.clientX - BF.drag.ox) / BF.scale;
      n.y = BF.drag.ny + (e.clientY - BF.drag.oy) / BF.scale;
      const el = document.querySelector(`.bf-node[data-uid="${n.uid}"]`);
      if (el) { el.style.left = n.x + 'px'; el.style.top = n.y + 'px'; }
      bfDrawWires();
      BF.dirty = true;
    }
    if (BF.linking) {
      const r = canvas.getBoundingClientRect();
      BF.linking.tmp = {
        x: (e.clientX - r.left) / BF.scale,
        y: (e.clientY - r.top) / BF.scale
      };
      bfDrawWires();
    }
  });

  /* 松开 */
  window.addEventListener('mouseup', e => {
    if (BF.drag) { BF.drag = null; bfSave(); }

    if (BF.linking) {
      const port = document.elementFromPoint(e.clientX, e.clientY);
      const target = port && port.closest ? port.closest('.bf-port') : null;
      if (target) {
        const to = {
          node: target.dataset.uid,
          port: target.dataset.port,
          type: target.dataset.type,
          side: target.dataset.side
        };
        if (!bfAddLink(BF.linking.from, to)) bfToast('这两个口连不上');
      }
      BF.linking = null;
      bfDrawWires();
    }
  });

  /* 删除块 */
  canvas.addEventListener('click', e => {
    const del = e.target.closest('[data-del]');
    if (del) { bfRemoveNode(del.dataset.del); return; }

    const wire = e.target.closest('[data-link]');
    if (wire) { bfRemoveLink(wire.dataset.link); return; }
  });

  /* 字段改动 */
  canvas.addEventListener('input', e => {
    const t = e.target;
    if (!t.dataset || !t.dataset.key) return;
    const n = BF.nodes.find(x => x.uid === t.dataset.uid);
    if (!n) return;
    n.cfg[t.dataset.key] = t.type === 'checkbox' ? t.checked : t.value;
    BF.dirty = true;
    clearTimeout(window._bfSaveT);
    window._bfSaveT = setTimeout(bfSave, 400);
  });

  /* 滚轮缩放 */
  viewport.addEventListener('wheel', e => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    BF.scale = Math.min(1.6, Math.max(0.4, BF.scale + (e.deltaY > 0 ? -0.1 : 0.1)));
    document.getElementById('bfCanvas').style.transform = `scale(${BF.scale})`;
  }, { passive: false });
}

/* ============================================================
   自定义块编辑器（v1.1.0 加）
   用户自己造块：起名、选图标、定义字段和端口
   ============================================================ */

const BF_ICONS = ['▦','▤','⌗','☰','✎','◫','◈','☷','◷','◉','⇄','◇','▭','★','◆','⬢','⬣','⬤','▲','■'];

function bfOpenBlockForge() {
  document.getElementById('bfForgeModal').classList.add('show');
  bfRenderForgeList();
  bfForgeReset();
}

function bfCloseBlockForge() {
  document.getElementById('bfForgeModal').classList.remove('show');
  bfRenderAll();
}

/* 左侧列出已有的自定义块 */
function bfRenderForgeList() {
  const box = document.getElementById('bfForgeList');
  const arr = bfLoadCustom();
  if (!arr.length) {
    box.innerHTML = '<p class="bf-empty">还没有自定义块</p>';
    return;
  }
  box.innerHTML = arr.map(b => `
    <div class="bf-forgeitem">
      <b>${bfEsc(b.icon)}</b>
      <span>${bfEsc(b.name)}</span>
      <button class="bf-btn tiny" data-edit="${bfEsc(b.id)}">改</button>
      <button class="bf-btn tiny danger" data-rm="${bfEsc(b.id)}">删</button>
    </div>`).join('');
}

function bfForgeReset() {
  document.getElementById('bfFgName').value = '';
  document.getElementById('bfFgIcon').value = '★';
  document.getElementById('bfFgDesc').value = '';
  document.getElementById('bfFgIn').value = '';
  document.getElementById('bfFgOut').value = 'out:结果';
  document.getElementById('bfFgFields').value = 'title:标题:text:我的块';
  document.getElementById('bfFgHtml').value = '<div class="card"><h3>{{title}}</h3></div>';
  document.getElementById('bfFgId').value = '';
}

/* 保存自定义块 */
function bfForgeSave() {
  const name = document.getElementById('bfFgName').value.trim();
  const icon = document.getElementById('bfFgIcon').value.trim() || '★';
  const desc = document.getElementById('bfFgDesc').value.trim();
  const inRaw = document.getElementById('bfFgIn').value.trim();
  const outRaw = document.getElementById('bfFgOut').value.trim();
  const fieldsRaw = document.getElementById('bfFgFields').value.trim();
  const html = document.getElementById('bfFgHtml').value;
  const editId = document.getElementById('bfFgId').value;

  if (!name) { bfToast('得先起个名字'); return; }

  // 解析端口：key:名字[:类型]
  function parsePorts(raw, defType) {
    if (!raw) return [];
    return raw.split('\n').map(s => s.trim()).filter(Boolean).map(line => {
      const p = line.split(':').map(x => x.trim());
      return { key: p[0] || 'p', name: p[1] || p[0] || '端口', type: p[2] || defType };
    });
  }

  // 解析字段：key:名字:类型:默认值
  function parseFields(raw) {
    if (!raw) return [];
    return raw.split('\n').map(s => s.trim()).filter(Boolean).map(line => {
      const p = line.split(':').map(x => x.trim());
      return {
        key: p[0] || 'f',
        name: p[1] || p[0] || '字段',
        type: p[2] || 'text',
        def: p[3] !== undefined ? p[3] : ''
      };
    });
  }

  const def = {
    id: editId || ('my.' + name.replace(/\s+/g, '_') + '_' + Date.now().toString(36)),
    name,
    icon,
    cat: 'custom',
    desc: desc || '我自己做的块',
    custom: true,
    inputs: parsePorts(inRaw, 'list'),
    outputs: parsePorts(outRaw, 'any'),
    fields: parseFields(fieldsRaw),
    template: html
  };

  const arr = bfLoadCustom();
  const idx = arr.findIndex(b => b.id === def.id);
  if (idx >= 0) arr[idx] = def; else arr.push(def);
  bfSaveCustom(arr);

  bfRenderForgeList();
  bfForgeReset();
  bfToast(idx >= 0 ? '已更新' : '已加到块库');
}

function bfForgeEdit(id) {
  const b = bfLoadCustom().find(x => x.id === id);
  if (!b) return;
  document.getElementById('bfFgId').value = b.id;
  document.getElementById('bfFgName').value = b.name;
  document.getElementById('bfFgIcon').value = b.icon;
  document.getElementById('bfFgDesc').value = b.desc || '';
  document.getElementById('bfFgIn').value = (b.inputs || []).map(p => `${p.key}:${p.name}:${p.type}`).join('\n');
  document.getElementById('bfFgOut').value = (b.outputs || []).map(p => `${p.key}:${p.name}:${p.type}`).join('\n');
  document.getElementById('bfFgFields').value = (b.fields || [])
    .map(f => `${f.key}:${f.name}:${f.type}:${f.def === undefined ? '' : f.def}`).join('\n');
  document.getElementById('bfFgHtml').value = b.template || '';
}

/* 导入 / 导出自定义块 */
function bfExportBlocks() {
  const arr = bfLoadCustom();
  if (!arr.length) { bfToast('还没有自定义块'); return; }
  const blob = new Blob([JSON.stringify(arr, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'my-blocks.json';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 3000);
  bfToast('已导出 ' + arr.length + ' 个块');
}

function bfImportBlocks(file) {
  const r = new FileReader();
  r.onload = () => {
    try {
      const inp = JSON.parse(r.result);
      if (!Array.isArray(inp)) throw new Error('不是数组');
      const cur = bfLoadCustom();
      const ids = new Set(cur.map(b => b.id));
      let n = 0;
      inp.forEach(b => {
        if (!b || !b.id || !b.name) return;
        b.custom = true;
        b.cat = 'custom';
        if (ids.has(b.id)) { b.id = b.id + '_imp' + Date.now().toString(36); }
        cur.push(b); n++;
      });
      bfSaveCustom(cur);
      bfRenderForgeList();
      bfToast('导入了 ' + n + ' 个块');
    } catch (e) {
      bfToast('文件读不了：' + e.message);
    }
  };
  r.readAsText(file, 'utf-8');
}
