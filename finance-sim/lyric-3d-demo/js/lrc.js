/**
 * lrc.js —— LRC / 增强 LRC 歌词解析
 *
 * 干什么：把 .lrc 文本解析成「行 + 逐字时间轴」结构，供 3D 歌词驱动。
 * 用了什么库：无（纯原生 JS，零依赖）
 * 输入：lrc 文本字符串
 * 输出：[{ time, text, words: [{ t, d, text }] }]（time/t 单位秒，d 单位秒）
 *
 * 支持的格式：
 *   [00:12.34]整行歌词            —— 普通 LRC
 *   [00:12.34][01:20.00]重复行     —— 一行多时间戳
 *   [00:12.34]<00:12.34>逐<00:13.1>字  —— 增强 LRC（逐字）
 *   [ti:][ar:][al:][by:]           —— 元信息，自动跳过
 */

const TIME_RE = /\[(\d{1,3}):(\d{1,2})(?:[.:](\d{1,3}))?\]/g;
const WORD_RE = /<(\d{1,3}):(\d{1,2})(?:[.:](\d{1,3}))?>/g;

/** "mm" "ss" "fff" → 秒 */
function toSec(mm, ss, frac) {
  let f = 0;
  if (frac != null && frac !== '') {
    // .5 → 500ms，.55 → 550ms，.555 → 555ms
    f = parseInt(frac.padEnd(3, '0'), 10) / 1000;
  }
  return parseInt(mm, 10) * 60 + parseInt(ss, 10) + f;
}

/** 拆出增强 LRC 的逐字段：[{t, text}] */function parseWords(body) {
  if (body.indexOf('<') < 0) return null;
  const out = [];
  let m;
  const stamps = [];
  WORD_RE.lastIndex = 0;
  while ((m = WORD_RE.exec(body)) !== null) {
    stamps.push({ t: toSec(m[1], m[2], m[3]), at: m.index, end: WORD_RE.lastIndex });
  }
  if (!stamps.length) return null;
  // 第一个时间戳之前的文字也算进去
  if (stamps[0].at > 0) {
    const lead = body.slice(0, stamps[0].at).trim();
    if (lead) out.push({ t: stamps[0].t, text: lead });
  }
  for (let i = 0; i < stamps.length; i++) {
    const s = stamps[i];
    const nextAt = i + 1 < stamps.length ? stamps[i + 1].at : body.length;
    const txt = body.slice(s.end, nextAt);
    if (txt) out.push({ t: s.t, text: txt });
  }
  return out.length ? out : null;
}

export function parseLrc(text) {
  const lines = [];
  // 去 BOM：带 BOM 的 lrc 第一行会被当成“不是以 [ 开头”直接丢掉（Win/记事本存的常见）
  const raw = String(text || '').replace(/^\uFEFF/, '').split(/\r?\n/);

  /* 【v1.2.3 新增】全局偏移 [offset:±毫秒]
     LRC 标准里 offset 为正 = 歌词应该提前出现，所以 time = time - offset/1000。
     以前完全没解析这行 → 带 offset 的 lrc 会整体错位，看着就是“歌词对不上歌”。 */
  let offsetMs = 0;
  for (const rawLine of raw) {
    const m = rawLine.match(/^\s*\[offset:\s*([+-]?\d+)\s*\]/i);
    if (m) offsetMs = parseInt(m[1], 10) || 0;
  }

  for (const rawLine of raw) {
    const line = rawLine.trim();
    if (!line || line[0] !== '[') continue;

    // 收集本行的所有时间戳
    const times = [];
    TIME_RE.lastIndex = 0;
    let m;
    while ((m = TIME_RE.exec(line)) !== null) times.push(toSec(m[1], m[2], m[3]));
    if (!times.length) continue;

    // 时间戳之后的正文
    const lastEnd = line.lastIndexOf(']') + 1;
    let body = line.slice(lastEnd);
    // 增强 LRC 的逐字标记可能紧跟在行时间戳后
    const words = parseWords(body);

    body = body.replace(WORD_RE, '').trim();
    if (!body) continue;

    for (const t of times) {
      lines.push({ time: t, text: body, words: words ? cloneWords(words, t) : null });
    }
  }

  lines.sort((a, b) => a.time - b.time);

  // 应用全局偏移（秒），并夹到 0 以上
  if (offsetMs) {
    const off = offsetMs / 1000;
    for (const ln of lines) {
      ln.time = Math.max(0, ln.time - off);
      if (ln.words) for (const w of ln.words) w.t = Math.max(0, w.t - off);
    }
    lines.sort((a, b) => a.time - b.time);
  }

  // 补时长：用下一行起始时间算，最后一行给 4 秒
  for (let i = 0; i < lines.length; i++) {
    const next = lines[i + 1];
    lines[i].duration = next ? Math.max(0.2, next.time - lines[i].time) : 4;
  }

  // 逐字段也补上时长
  for (const ln of lines) {
    if (!ln.words) continue;
    for (let i = 0; i < ln.words.length; i++) {
      const nx = ln.words[i + 1];
      ln.words[i].d = nx ? Math.max(0.05, nx.t - ln.words[i].t) : Math.max(0.15, ln.duration * 0.6);
    }
  }

  return lines;
}

/** 增强 LRC 的时间戳是绝对时间，但一首歌只有一份词表，多时间戳行要复制一份 */
function cloneWords(words, lineTime) {
  return words.map((w) => ({ t: w.t, text: w.text, d: 0 }));
}

/**
 * 没有 lrc 时的兜底：把整段文字按行切，均分到音频时长上。
 * 仅用于「随便放首歌也想看看效果」，界面上要标注是估算的。
 */
export function estimateLineTimes(plainText, durationSec) {
  const rows = String(plainText || '')
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  if (!rows.length) return [];
  const step = durationSec / rows.length;
  return rows.map((text, i) => ({
    time: i * step,
    duration: step,
    text,
    words: null,
  }));
}

/** 找当前应该显示第几行 */
export function indexAt(lines, t) {
  if (!lines.length) return -1;
  let lo = 0;
  let hi = lines.length - 1;
  let ans = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (lines[mid].time <= t) {
      ans = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return ans;
}
