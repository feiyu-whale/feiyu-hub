/**
 * mp4-encoder.worker.ts —— 画面合成 + MP4 编码（全部跑在 Worker 里）
 *
 * 干什么：① 用 OffscreenCanvas 把多轨画面合成（含变换、转场、蒙版、黑白闪、字幕）
 *         ② 用 WebCodecs 编码 ③ 用 mp4-muxer 封装成 MP4
 * 依赖：OffscreenCanvas、WebCodecs（VideoEncoder/AudioEncoder）、mp4-muxer
 * 输入：init（宽高/帧率/码率/音频参数）、frame（每层的 VideoFrame + 绘制参数）、
 *       audio（PCM）、finish
 * 输出：ready / done（ArrayBuffer）/ error
 *
 * 为什么要搬进来（v1.23.0）：以前只有编码在 Worker，合成还在主线程，
 * 导出时主线程被 drawImage 占满，界面直接定死。现在主线程只负责播放和取帧。
 */

import { Muxer, ArrayBufferTarget } from 'mp4-muxer'

let muxer: Muxer<ArrayBufferTarget> | null = null
let venc: VideoEncoder | null = null
let aenc: AudioEncoder | null = null
let finished = false
let canvas: OffscreenCanvas | null = null
let g: OffscreenCanvasRenderingContext2D | null = null
let W = 0
let H = 0

function fail(message: string) {
  ;(self as any).postMessage({ type: 'error', message })
}

/** 与主线程一致的换行：逐字符测量，超出宽度就折行 */
function wrapText(ctx: OffscreenCanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const out: string[] = []
  for (const raw of text.split('\n')) {
    let line = ''
    for (const ch of raw) {
      if (ctx.measureText(line + ch).width > maxWidth && line) { out.push(line); line = ch }
      else line += ch
    }
    out.push(line)
  }
  return out
}

interface LayerMsg {
  frame: VideoFrame
  x: number
  y: number
  rot: number
  scale: number
  alpha: number
  trans: string
  tp: number
  mask: { type: 'rect' | 'ellipse'; x: number; y: number; w: number; h: number } | null
}

interface TextMsg {
  text: string
  x: number
  y: number
  fontSize: number
  color: string
  strokeColor: string
  strokeWidth: number
  align: CanvasTextAlign
  alpha: number
}

/** 合成一帧画面到 OffscreenCanvas */
function compose(m: any) {
  const ctx = g
  if (!ctx) return
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.globalAlpha = 1
  ctx.filter = 'none'
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, W, H)

  const gr = m.grading || {}
  ctx.filter = `brightness(${gr.brightness ?? 1}) contrast(${gr.contrast ?? 1}) saturate(${gr.saturation ?? 1}) ${gr.presetFilter || ''}`

  for (const L of (m.layers || []) as LayerMsg[]) {
    const f = L.frame
    if (!f) continue
    const sw = f.displayWidth || f.codedWidth
    const sh = f.displayHeight || f.codedHeight
    if (!sw || !sh) { f.close(); continue }

    ctx.globalAlpha = Math.max(0, Math.min(1, L.alpha))
    ctx.save()
    const tp = L.tp ?? 1
    if (L.trans === 'wipeL' && tp < 1) { ctx.beginPath(); ctx.rect(0, 0, W * tp, H); ctx.clip() }
    else if (L.trans === 'wipeR' && tp < 1) { ctx.beginPath(); ctx.rect(W * (1 - tp), 0, W * tp, H); ctx.clip() }
    else if (L.trans === 'slideUp' && tp < 1) ctx.translate(0, H * (1 - tp))
    else if (L.trans === 'zoom' && tp < 1) {
      const k = 1.25 - 0.25 * tp
      ctx.translate(W / 2, H / 2); ctx.scale(k, k); ctx.translate(-W / 2, -H / 2)
    }

    if (L.mask) {
      const mm = L.mask
      ctx.beginPath()
      if (mm.type === 'ellipse') ctx.ellipse(mm.x, mm.y, mm.w / 2, mm.h / 2, 0, 0, Math.PI * 2)
      else ctx.rect(mm.x - mm.w / 2, mm.y - mm.h / 2, mm.w, mm.h)
      ctx.clip()
    }

    ctx.translate(W / 2 + L.x * W, H / 2 + L.y * H)
    ctx.rotate((L.rot * Math.PI) / 180)
    ctx.scale(L.scale, L.scale)
    // cover 填充（与主线程 drawCenter 一致）
    const s = Math.max(W / sw, H / sh)
    ctx.drawImage(f, (-sw * s) / 2, (-sh * s) / 2, sw * s, sh * s)
    ctx.restore()
    f.close()
  }

  // 转场黑场/白场
  for (const o of (m.overlays || [])) {
    ctx.globalAlpha = Math.max(0, Math.min(1, o.alpha))
    ctx.fillStyle = o.color
    ctx.fillRect(0, 0, W, H)
  }

  // 字幕
  ctx.filter = 'none'
  for (const T of (m.texts || []) as TextMsg[]) {
    const px = Math.max(8, Math.round(T.fontSize * (H / 720)))
    ctx.globalAlpha = Math.max(0, Math.min(1, T.alpha))
    ctx.font = `700 ${px}px "PingFang SC","Microsoft YaHei",sans-serif`
    ctx.textAlign = T.align
    ctx.textBaseline = 'middle'
    ctx.lineJoin = 'round'
    const lines = wrapText(ctx, T.text, W * 0.9)
    const lh = px * 1.3
    const cx = W * T.x
    const startY = H * T.y - ((lines.length - 1) * lh) / 2
    lines.forEach((ln, i) => {
      const y = startY + i * lh
      if (T.strokeWidth > 0) {
        ctx.strokeStyle = T.strokeColor
        ctx.lineWidth = T.strokeWidth * (H / 720)
        ctx.strokeText(ln, cx, y)
      }
      ctx.fillStyle = T.color
      ctx.fillText(ln, cx, y)
    })
  }
  ctx.globalAlpha = 1
}

self.onmessage = async (e: MessageEvent) => {
  const m = e.data
  try {
    if (m.type === 'init') {
      W = m.width
      H = m.height
      canvas = new OffscreenCanvas(W, H)
      g = canvas.getContext('2d', { alpha: false }) as OffscreenCanvasRenderingContext2D
      if (!g) throw new Error('OffscreenCanvas 2D 不可用')

      muxer = new Muxer({
        target: new ArrayBufferTarget(),
        video: { codec: 'avc', width: W, height: H, frameRate: m.fps },
        audio: m.audio
          ? { codec: 'aac', numberOfChannels: m.audio.channels, sampleRate: m.audio.sampleRate }
          : undefined,
        fastStart: 'in-memory',
        // 导出初始化有耗时，首帧时间戳可能不从 0 开始；让 muxer 自动偏移到 0
        firstTimestampBehavior: 'offset',
      })

      venc = new VideoEncoder({
        output: (chunk, meta) => muxer?.addVideoChunk(chunk, meta),
        error: err => fail('VideoEncoder: ' + err.message),
      })
      venc.configure({
        codec: 'avc1.4D0028',
        width: W,
        height: H,
        bitrate: m.bitrate || 8_000_000,
        framerate: m.fps,
      })

      if (m.audio) {
        aenc = new AudioEncoder({
          output: (chunk, meta) => muxer?.addAudioChunk(chunk, meta),
          error: err => fail('AudioEncoder: ' + err.message),
        })
        aenc.configure({
          codec: 'mp4a.40.2',
          sampleRate: m.audio.sampleRate,
          numberOfChannels: m.audio.channels,
          bitrate: 128000,
        })
      }
      ;(self as any).postMessage({ type: 'ready' })
      return
    }

    if (m.type === 'frame') {
      if (!venc || venc.state !== 'configured') return
      // 队列太长就丢帧（防止内存爆），保持界面流畅优先
      if (venc.encodeQueueSize > 6) {
        for (const L of (m.layers || [])) { try { (L.frame as VideoFrame)?.close() } catch {} }
        return
      }
      compose(m)
      const frame = new VideoFrame(canvas!, { timestamp: m.ts, duration: Math.round(1e6 / (m.fps || 30)) })
      try {
        venc.encode(frame, { keyFrame: !!m.key })
      } finally {
        frame.close()
      }
      return
    }

    // LUT 场景：画面已在主线程合成好，这里只负责编码
    if (m.type === 'rawframe') {
      if (!venc || venc.state !== 'configured') { try { (m.frame as VideoFrame)?.close() } catch {}; return }
      const frame: VideoFrame = m.frame
      try {
        if (venc.encodeQueueSize > 6) return
        venc.encode(frame, { keyFrame: !!m.key })
      } finally {
        frame.close()
      }
      return
    }

    if (m.type === 'audio') {
      if (!aenc || aenc.state !== 'configured') return
      const data = new AudioData({
        format: 'f32-planar',
        sampleRate: m.sampleRate,
        numberOfFrames: m.frames,
        numberOfChannels: m.channels,
        timestamp: m.timestamp,
        data: m.data,
      })
      try { aenc.encode(data) } finally { data.close() }
      return
    }

    if (m.type === 'finish') {
      if (finished) return
      finished = true
      if (venc) await venc.flush()
      if (aenc) await aenc.flush()
      venc?.close(); aenc?.close()
      muxer?.finalize()
      const buffer = (muxer!.target as ArrayBufferTarget).buffer
      ;(self as any).postMessage({ type: 'done', buffer }, [buffer])
      return
    }
  } catch (err: any) {
    fail(err?.message || String(err))
  }
}
