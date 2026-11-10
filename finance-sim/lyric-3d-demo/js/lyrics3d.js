/**
 * lyrics3d.js —— 3D 歌词引擎
 *
 * 干什么：把歌词做成三维空间里的字，从喇叭口飞出来、排队站好、逐字点亮、换句时散掉。
 * 用了什么库：three.js（MIT）。字形用浏览器 Canvas 2D 现画成贴图，不加载任何字体文件。
 * 输入：createLyrics(THREE, opts) → { group, setLines, update, setOrigin }
 * 输出：一个 THREE.Group，加到场景里即可
 *
 * 为什么每个字一张贴图：
 *   逐字动效（飞入、逐字点亮、独立漂浮）要求每个字是独立对象，整行一张图做不到。
 *   每个字一张 128×128 画布，按需创建 + 全局缓存，跨行跨歌复用。
 *
 * 【v1.0.1 修复的两个真 bug】
 *   1) 重影：过去跳行时，从没显示过的旧行会以满不透明度冒出来（退场起点算成 0）。
 *      → 改成用 shown 标记：只有真显示过的行才走退场，其余保持全透明。
 *   2) 字被压扁：方形字形贴图被强行拉成不同宽高比。
 *      → 改成按字形实际宽高比等比缩放，advance 与视觉宽度分开算。
 */

const CHAR_TEX_SIZE = 128;
const FONT_STACK = '"Noto Serif CJK SC","Source Han Serif SC","Noto Sans CJK SC","PingFang SC","Microsoft YaHei",serif';
const FONT_WEIGHT = 700;

/* ============ 字形贴图缓存 ============ */
const glyphCache = new Map();

function getGlyph(THREE, ch) {
  if (glyphCache.has(ch)) return glyphCache.get(ch);

  const cv = document.createElement('canvas');
  cv.width = CHAR_TEX_SIZE;
  cv.height = CHAR_TEX_SIZE;
  const ctx = cv.getContext('2d');

  const fontSize = Math.floor(CHAR_TEX_SIZE * 0.86);
  ctx.font = `${FONT_WEIGHT} ${fontSize}px ${FONT_STACK}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // 【v1.7.1 描边】老爹说字被龙挡了。查下来不是遮挡（字有 depthTest:false + renderOrder 20，
  // 永远在最上层），是**对比度**问题：未点亮的字是深蓝灰(0x4a7f9e)，
  // 贴在亮白的龙身上直接被吃掉了。
  // 修法：字周围压一圈深色描边，任何背景都立得住。
  ctx.lineJoin = 'round';
  ctx.miterLimit = 2;
  ctx.lineWidth = CHAR_TEX_SIZE * 0.075;
  ctx.strokeStyle = 'rgba(6,12,22,0.92)';
  ctx.strokeText(ch, CHAR_TEX_SIZE / 2, CHAR_TEX_SIZE / 2);
  ctx.lineWidth = CHAR_TEX_SIZE * 0.035;
  ctx.strokeStyle = 'rgba(0,0,0,0.85)';
  ctx.strokeText(ch, CHAR_TEX_SIZE / 2, CHAR_TEX_SIZE / 2);

  // 轻发光：保证暗背景里立得住，但不能糊
  ctx.shadowColor = 'rgba(120,190,255,0.7)';
  ctx.shadowBlur = CHAR_TEX_SIZE * 0.035;
  ctx.fillStyle = '#ffffff';
  ctx.fillText(ch, CHAR_TEX_SIZE / 2, CHAR_TEX_SIZE / 2);
  // 再实心叠一遍，把发光边缘压实
  ctx.shadowBlur = 0;
  ctx.fillText(ch, CHAR_TEX_SIZE / 2, CHAR_TEX_SIZE / 2);

  const m = ctx.measureText(ch);
  // 视觉宽高比（相对字号）。中文≈1.0，拉丁字母窄
  const wRatio = Math.max(0.18, Math.min(1.0, (m.width || fontSize * 0.6) / fontSize));

  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = true;
  tex.needsUpdate = true;

  const entry = { tex, wRatio, isSpace: ch === ' ' };
  glyphCache.set(ch, entry);
  return entry;
}

/* ============ 缓动 ============ */
const easeOutCubic = (x) => 1 - Math.pow(1 - x, 3);
const easeInOutQuad = (x) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);

/** 新行入场延迟：等上一行退干净再开始飞，避免两行字在中央叠一起 */
const LINE_IN_DELAY = 0.30;

function bezier3(p0, p1, p2, p3, t) {
  const u = 1 - t;
  const a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t;
  return {
    x: a * p0.x + b * p1.x + c * p2.x + d * p3.x,
    y: a * p0.y + b * p1.y + c * p2.y + d * p3.y,
    z: a * p0.z + b * p1.z + c * p2.z + d * p3.z,
  };
}

/* ============ 主引擎 ============ */
export function createLyrics(THREE, opts = {}) {
  const group = new THREE.Group();

  const baseY = opts.baseY != null ? opts.baseY : 4.0;
  const charSize = opts.charSize != null ? opts.charSize : 0.72;
  const spacing = opts.spacing != null ? opts.spacing : 0.04;
  const arcDepth = opts.arcDepth != null ? opts.arcDepth : 1.2;
  const maxLineWidth = opts.maxLineWidth != null ? opts.maxLineWidth : 9.5;

  const COLOR_UNLIT = new THREE.Color(0x4a7f9e);
  const COLOR_LIT = new THREE.Color(0xfff4d6);
  const COLOR_FLYING = new THREE.Color(0x9ad8ff);

  let lines = [];
  let nodes = [];
  let currentIndex = -1;
  const originPos = new THREE.Vector3(0, baseY - 1.6, 2.2);

  /* ---------- 建行 ---------- */
  function buildLine(line, i) {
    const text = String(line.text || '');
    const chars = [];
    const node = {
      chars, line, index: i,
      shown: false,          // 是否真的显示过（决定要不要走退场）
      bornAt: null,
      exitAt: null,
      exited: false,
      baseAlpha: 0,
    };

    // 先算一行总宽，必要时整体缩小以适配画幅
    const items = [];
    let total = 0;
    for (const ch of text) {
      const g = getGlyph(THREE, ch);
      const vw = g.isSpace ? charSize * 0.36 : charSize * Math.max(0.42, g.wRatio);
      const adv = vw + (g.isSpace ? spacing * 0.5 : spacing);
      items.push({ ch, g, vw, adv });
      total += adv;
    }
    total -= items.length ? items[items.length - 1].adv - items[items.length - 1].vw : 0;

    // 超宽等比缩
    const fit = total > maxLineWidth ? maxLineWidth / total : 1;

    let cursor = -(total * fit) / 2;
    let idx = 0;

    for (const it of items) {
      const vw = it.vw * fit;
      const adv = it.adv * fit;

      if (it.g.isSpace) { cursor += adv; idx++; continue; }

      const mat = new THREE.SpriteMaterial({
        map: it.g.tex,
        color: COLOR_UNLIT.clone(),
        transparent: true,
        depthWrite: false,
        /* 【v1.4.3】不参与深度测试：老爹的视频背景是黑的，
           视频面的 renderOrder 是 5，文字不设 renderOrder 就会被排在前面画 → 被视频盖掉，
           看起来就是「字中间被遮住」那一块。
           不写深度 + 抬高 renderOrder，字就一定在最上面。 */
        depthTest: false,
        opacity: 0,
      });
      const sprite = new THREE.Sprite(mat);
      sprite.visible = false;
      sprite.renderOrder = 20;      // 高于视频(5)、高于接触阴影(6)

      const centerX = cursor + vw / 2;
      const norm = total > 0 ? centerX / ((total * fit) / 2) : 0;
      const targetY = baseY - norm * norm * 0.30;
      const targetZ = -Math.abs(norm) * arcDepth * 0.45;

      // 等比缩放：高度固定，宽度按字形比例，绝不压扁
      const h = charSize * fit;
      const w = h * Math.max(0.42, it.g.wRatio);
      sprite.scale.set(w, h, 1);
      sprite.position.set(centerX, targetY, targetZ);

      const data = {
        sprite, w, h,
        target: new THREE.Vector3(centerX, targetY, targetZ),
        index: idx,
        seed: Math.random() * Math.PI * 2,
        driftAmp: 0.045 + Math.random() * 0.045,
        wordStart: line.time,
        wordEnd: line.time + (line.duration || 3),
        lit: false,
      };

      chars.push(data);
      group.add(sprite);

      cursor += adv;
      idx++;
    }

    // 逐字时间轴
    if (line.words && line.words.length) {
      let ci = 0;
      for (const w of line.words) {
        for (let k = 0; k < w.text.length && ci < chars.length; k++, ci++) {
          chars[ci].wordStart = w.t;
          chars[ci].wordEnd = w.t + (w.d || 0.2);
        }
      }
      if (ci < chars.length) {
        const rest = line.time + (line.duration || 3);
        for (; ci < chars.length; ci++) {
          chars[ci].wordStart = rest;
          chars[ci].wordEnd = rest + 0.1;
        }
      }
    }

    return node;
  }

  /* ---------- 对外 ---------- */
  function setLines(newLines) {
    clear();
    lines = newLines || [];
    nodes = lines.map((l, i) => buildLine(l, i));
    currentIndex = -1;
  }

  function clear() {
    for (const n of nodes) {
      for (const c of n.chars) {
        group.remove(c.sprite);
        c.sprite.material.dispose();
      }
      n.chars.length = 0;
    }
    nodes = [];
    lines = [];
    currentIndex = -1;
  }

  function setOrigin(v) { originPos.copy(v); }

  /* ---------- 每帧 ---------- */
  function update(timeSec, level = 0) {
    // 二分找当前行
    let idx = -1;
    let lo = 0, hi = nodes.length - 1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (nodes[mid].line.time <= timeSec) { idx = mid; lo = mid + 1; }
      else hi = mid - 1;
    }

    if (idx !== currentIndex) {
      const prev = currentIndex;
      currentIndex = idx;

      // 新行：标记开始
      if (idx >= 0) {
        const n = nodes[idx];
        n.shown = true;
        n.bornAt = timeSec;
        n.exited = false;
        n.exitAt = null;
      }

      // 只有「真显示过、且还没开始退场」的旧行才启动退场
      // —— 这正是上一版重影的病根：没显示过的行也进了退场分支
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        if (i === idx) continue;
        if (n.shown && !n.exited && n.exitAt == null) {
          n.exited = true;
          n.exitAt = timeSec;
        }
      }
      // 往回拖（seek 到前面）时，把后面的行全部复位成未显示
      if (idx < prev) {
        for (let i = idx + 1; i < nodes.length; i++) {
          const n = nodes[i];
          n.shown = false;
          n.exited = false;
          n.exitAt = null;
          n.bornAt = null;
          hideAll(n);
        }
      }
    }

    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      if (!n.chars.length) continue;

      if (i === currentIndex) {
        renderCurrent(n, timeSec, level);
      } else if (n.shown && (n.exited || n.exitAt != null)) {
        renderExit(n, timeSec);
      }
      // 其余（没显示过 / 已经退完）保持隐藏，什么都不做
    }
  }

  function hideAll(n) {
    for (const c of n.chars) {
      c.sprite.visible = false;
      c.sprite.material.opacity = 0;
      c.lit = false;
    }
  }

  /* ---------- 当前行 ---------- */
  function renderCurrent(n, t, level) {
    if (n.bornAt == null) n.bornAt = t;
    // 换句时给一点延迟：让上一行先退掉，避免新旧两行在画面中央交叉
    const age = t - n.bornAt - LINE_IN_DELAY;

    for (const c of n.chars) {
      const m = c.sprite.material;
      c.sprite.visible = true;

      // ---- 入场飞行 ----
      const delay = c.index * 0.042;
      const dur = 0.72;
      const p = clamp01((age - delay) / dur);

      if (p < 1) {
        const e = easeOutCubic(p);
        const side = c.index % 2 === 0 ? 1 : -1;
        const p0 = originPos;
        const p1 = {
          x: originPos.x + side * (0.35 + (c.index % 5) * 0.12),
          y: originPos.y + 1.5 + c.index * 0.045,
          z: originPos.z - 0.7,
        };
        const p2 = { x: c.target.x * 0.55, y: c.target.y + 0.65, z: c.target.z - 0.45 };
        const pos = bezier3(p0, p1, p2, c.target, e);
        c.sprite.position.set(pos.x, pos.y, pos.z);

        const shrink = 1 - 0.30 * Math.sin(Math.PI * e);
        c.sprite.scale.set(c.w * shrink, c.h * shrink, 1);
        m.opacity = Math.min(1, e * 1.8);
        m.color.copy(COLOR_FLYING).lerp(COLOR_UNLIT, e);
        continue;
      }

      // ---- 到位：轻微漂浮 ----
      const float = Math.sin(t * 1.5 + c.seed) * c.driftAmp;
      c.sprite.position.set(
        c.target.x,
        c.target.y + float,
        c.target.z + Math.cos(t * 1.0 + c.seed) * 0.015
      );

      // ---- 逐字点亮 ----
      const ws = c.wordStart, we = c.wordEnd;
      let lit = 0;
      if (t >= ws) {
        lit = we > ws ? clamp01((t - ws) / (we - ws)) : 1;
      }

      const breath = 1 + Math.sin(t * 2.0 + c.seed) * 0.010 + level * 0.045;
      let pop = 0;
      if (lit > 0 && t - ws < 0.40) {
        pop = Math.sin(((t - ws) / 0.40) * Math.PI) * 0.15;
      }
      const s = breath + pop;
      c.sprite.scale.set(c.w * s, c.h * s, 1);

      m.opacity = 1;
      if (lit > 0) {
        m.color.copy(COLOR_UNLIT).lerp(COLOR_LIT, easeInOutQuad(clamp01(lit * 1.12)));
      } else {
        m.color.copy(COLOR_UNLIT);
      }
    }
  }

  /* ---------- 退场（只对真显示过的行） ---------- */
  function renderExit(n, t) {
    if (n.exitAt == null) { hideAll(n); return; }

    const age = t - n.exitAt;
    // 退场要快：0.38 秒走完，比入场快得多。
    // 上一版 0.75 秒太长，跟下一行的入场撞在一起 → 两行字在中央叠成一团。
    const life = 0.38;
    const p = clamp01(age / life);

    if (p >= 1) {
      hideAll(n);
      return;
    }

    const e = easeOutCubic(p);
    for (const c of n.chars) {
      const m = c.sprite.material;
      c.sprite.visible = true;
      const side = c.index % 2 === 0 ? 1 : -1;
      // 退场方向：往两侧散 + 往上飘 + 往后缩，而不是往前推（往前推会撞到镜头）
      c.sprite.position.set(
        c.target.x + side * e * 0.55,
        c.target.y + e * 0.85,
        c.target.z - e * 0.7
      );
      const s = 1 - 0.42 * e;
      c.sprite.scale.set(c.w * s, c.h * s, 1);
      // 前 60% 就淡到几乎看不见，尾段只留一点残影
      m.opacity = Math.pow(1 - e, 2.2);
    }
  }

  return {
    group, setLines, clear, update, setOrigin,
    get currentIndex() { return currentIndex; },
    get lineCount() { return nodes.length; },
  };
}
