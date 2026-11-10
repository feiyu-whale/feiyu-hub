/**
 * webmDuration.ts —— 给 MediaRecorder 录出来的 WebM 补写时长
 *
 * 干什么：浏览器录制的 WebM 不带 Duration，部分播放器会显示 0:00 或不能拖动进度条。
 *        这里直接在 Info 元素里插入/改写 Duration 字段。
 * 依赖：无（纯字节操作）
 * 输入：Blob（video/webm）+ 时长（秒）；输出：修好的 Blob；失败则原样返回
 *
 * 安全性：只在没有 SeekHead/Cues 时插入（MediaRecorder 产物就是这种）；
 *        若检测到索引表，只做「原地改写」不插入，避免破坏索引偏移。
 */

const ID_EBML = 0x1a45dfa3
const ID_SEGMENT = 0x18538067
const ID_INFO = 0x1549a966
const ID_TIMECODE_SCALE = 0x2ad7b1
const ID_DURATION = 0x4489
const ID_SEEKHEAD = 0x114d9b74
const ID_CUES = 0x1c53bb6b

/** 读 EBML 元素 ID（含自身字节数） */
function readId(b: Uint8Array, i: number): { id: number; len: number } {
  const first = b[i]
  if (first === 0) return { id: 0, len: 1 }
  let len = 1
  let mask = 0x80
  while (!(first & mask) && len < 5) { len++; mask >>= 1 }
  let id = 0
  for (let k = 0; k < len; k++) id = id * 256 + b[i + k]
  return { id, len }
}

/** 读 size 的 VINT（返回数值、字节数、是否未知长度） */
function readSize(b: Uint8Array, i: number): { size: number; len: number; unknown: boolean } {
  const first = b[i]
  let len = 1
  let mask = 0x80
  while (!(first & mask) && len < 9) { len++; mask >>= 1 }
  if (len > 8) return { size: 0, len: 1, unknown: true }
  let size = first & (mask - 1)
  let allOnes = size === mask - 1
  for (let k = 1; k < len; k++) {
    size = size * 256 + b[i + k]
    if (b[i + k] !== 0xff) allOnes = false
  }
  return { size, len, unknown: allOnes }
}

/** 把数值编码成 EBML size VINT（尽可能短） */
function encodeSize(n: number): Uint8Array {
  for (let len = 1; len <= 8; len++) {
    const max = Math.pow(2, 7 * len) - 1
    if (n < max) {
      const out = new Uint8Array(len)
      let v = n
      for (let k = len - 1; k >= 0; k--) { out[k] = v & 0xff; v = Math.floor(v / 256) }
      out[0] |= 0x80 >> (len - 1)
      return out
    }
  }
  return new Uint8Array([0x01, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff])
}

/** 把浮点数写成大端 4 字节（Duration 允许 4 或 8 字节） */
function float32(v: number): Uint8Array {
  const buf = new ArrayBuffer(4)
  new DataView(buf).setFloat32(0, v, false)
  return new Uint8Array(buf)
}

export function patchWebmDuration(blob: Blob, durationSec: number): Promise<Blob> {
  return new Promise(async resolve => {
    try {
      if (!/webm/i.test(blob.type)) return resolve(blob)
      const bytes = new Uint8Array(await blob.arrayBuffer())

      let i = 0
      // 1) EBML 头
      const ebml = readId(bytes, i)
      if (ebml.id !== ID_EBML) return resolve(blob)
      i += ebml.len
      const ebmlSize = readSize(bytes, i)
      i += ebmlSize.len + ebmlSize.size

      // 2) Segment 头
      const seg = readId(bytes, i)
      if (seg.id !== ID_SEGMENT) return resolve(blob)
      i += seg.len
      const segSize = readSize(bytes, i)
      i += segSize.len
      const segEnd = segSize.unknown ? bytes.length : i + segSize.size

      // 3) 找 Info / SeekHead / Cues
      let infoPos = -1
      let hasIndex = false
      let p = i
      while (p < segEnd) {
        const el = readId(bytes, p)
        if (!el.id) break
        const eidLen = el.len
        const sz = readSize(bytes, p + eidLen)
        const payload = p + eidLen + sz.len
        if (el.id === ID_INFO) { infoPos = p; break }
        if (el.id === ID_SEEKHEAD || el.id === ID_CUES) hasIndex = true
        if (sz.unknown) break
        p = payload + sz.size
        if (p <= 0) break
      }
      if (infoPos < 0) return resolve(blob)

      const infoIdLen = readId(bytes, infoPos).len
      const infoSize = readSize(bytes, infoPos + infoIdLen)
      const infoPayload = infoPos + infoIdLen + infoSize.len
      const infoEnd = infoPayload + infoSize.size

      // 4) TimecodeScale（没写就是默认 1,000,000 ns = 1ms）
      let timecodeScale = 1_000_000
      let durPos = -1
      let durLen = 0
      let q = infoPayload
      while (q < infoEnd) {
        const el = readId(bytes, q)
        const sz = readSize(bytes, q + el.len)
        const payload = q + el.len + sz.len
        if (el.id === ID_TIMECODE_SCALE) {
          let v = 0
          for (let k = 0; k < sz.size; k++) v = v * 256 + bytes[payload + k]
          if (v > 0) timecodeScale = v
        }
        if (el.id === ID_DURATION) { durPos = q; durLen = sz.size }
        q = payload + sz.size
        if (q <= 0) break
      }

      const ticks = (durationSec * 1e9) / timecodeScale

      // 5a) 已有 Duration → 原地改写（不改变文件长度）
      if (durPos >= 0) {
        const payload = durPos + readId(bytes, durPos).len + readSize(bytes, durPos + readId(bytes, durPos).len).len
        const out = new Uint8Array(bytes)
        if (durLen === 4) new DataView(out.buffer).setFloat32(payload, ticks, false)
        else if (durLen === 8) new DataView(out.buffer).setFloat64(payload, ticks, false)
        else return resolve(blob)
        return resolve(new Blob([out], { type: blob.type }))
      }

      // 5b) 没有 Duration → 插进 Info 末尾（有索引表时不插，避免偏移错乱）
      if (hasIndex) return resolve(blob)

      const durElem = new Uint8Array([0x44, 0x89, 0x84, ...float32(ticks)])
      const newPayloadLen = infoSize.size + durElem.length
      const newSizeBytes = encodeSize(newPayloadLen)

      const head = bytes.slice(0, infoPos + infoIdLen)
      const mid = bytes.slice(infoPayload, infoEnd)
      const tail = bytes.slice(infoEnd)

      const out = new Uint8Array(head.length + newSizeBytes.length + mid.length + durElem.length + tail.length)
      let o = 0
      out.set(head, o); o += head.length
      out.set(newSizeBytes, o); o += newSizeBytes.length
      out.set(mid, o); o += mid.length
      out.set(durElem, o); o += durElem.length
      out.set(tail, o)

      resolve(new Blob([out], { type: blob.type }))
    } catch {
      resolve(blob)   // 任何异常都退回原文件，绝不弄坏导出结果
    }
  })
}
