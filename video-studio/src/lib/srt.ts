/**
 * srt.ts —— SRT 字幕读写
 *
 * 干什么：把 .srt 转成字幕片段；把时间轴上的文字片段导出成 .srt。
 * 依赖：无
 * 输入：SRT 文本 / 文字片段数组；输出：字幕条目 / SRT 文本
 */

export interface SrtEntry { start: number; end: number; text: string }

function toSec(t: string): number {
  const m = t.trim().match(/(\d+):(\d+):(\d+)[,.](\d+)/)
  if (!m) return 0
  return (+m[1]) * 3600 + (+m[2]) * 60 + (+m[3]) + (+m[4]) / 1000
}

function pad(n: number, len = 2) { return String(n).padStart(len, '0') }

export function secToSrtTime(s: number): string {
  const ms = Math.round(Math.max(0, s) * 1000)
  const h = Math.floor(ms / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  const sec = Math.floor((ms % 60000) / 1000)
  const milli = ms % 1000
  return `${pad(h)}:${pad(m)}:${pad(sec)},${pad(milli, 3)}`
}

export function parseSrt(text: string): SrtEntry[] {
  const out: SrtEntry[] = []
  const blocks = text.replace(/\r/g, '').split(/\n\s*\n/)
  for (const b of blocks) {
    const lines = b.split('\n').map(l => l.trim()).filter(Boolean)
    if (!lines.length) continue
    const timeIdx = lines.findIndex(l => l.includes('-->'))
    if (timeIdx < 0) continue
    const [a, c] = lines[timeIdx].split('-->')
    const content = lines.slice(timeIdx + 1).join('\n')
    if (!content) continue
    out.push({ start: toSec(a), end: toSec(c), text: content })
  }
  return out.sort((x, y) => x.start - y.start)
}

export function buildSrt(items: { start: number; duration: number; text: string }[]): string {
  const list = [...items].sort((a, b) => a.start - b.start)
  return list.map((it, i) =>
    `${i + 1}\n${secToSrtTime(it.start)} --> ${secToSrtTime(it.start + it.duration)}\n${it.text || '字幕'}\n`
  ).join('\n')
}
