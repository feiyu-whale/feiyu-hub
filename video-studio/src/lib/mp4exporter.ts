/**
 * mp4exporter.ts —— 浏览器内导出真正的 MP4（H.264 + AAC）
 *
 * 干什么：VideoEncoder 编画面、AudioEncoder 编声音、mp4-muxer 封装成 .mp4。
 * 依赖：WebCodecs(Chrome 94+/安卓 WebView)、mp4-muxer、WebAudio、Canvas
 * 输入：轨道/片段/素材/画布/帧率/时长；输出：{ blob, mime:'video/mp4', ext:'mp4' }
 *
 * 限制：① 实时编码，导出耗时 ≈ 片长 ② 变速只按片段的固定速度值处理（关键帧变速对音频不生效）
 * 不支持时抛错，由调用方回退到 WebM。
 */

import type { Clip, MediaAsset, Track } from '../stores/project'
import { speedAt, sourceTimeAt, transformAt, volumeAt, presetFilter } from '../stores/project'
import { applyLut } from './lutRenderer'

export interface Mp4ExportInput {
  clips: Clip[]
  tracks: Track[]
  assets: MediaAsset[]
  width: number
  height: number
  fps: number
  duration: number
  bitrate?: number
  grading?: { brightness: number; contrast: number; saturation: number }
  audioFromVideo?: boolean
  multicamGroups?: { id: string; angles: string[] }[]
  lut?: any
  lutEnabled?: boolean
  onProgress?: (p: number, msg: string) => void
  signal?: AbortSignal
}

export function mp4Supported(): boolean {
  return typeof (window as any).VideoEncoder !== 'undefined' &&
    typeof (window as any).AudioEncoder !== 'undefined' &&
    typeof (window as any).VideoFrame !== 'undefined'
}

function wrapText(g: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const out: string[] = []
  for (const raw of text.split('\n')) {
    let line = ''
    for (const ch of raw) {
      if (g.measureText(line + ch).width > maxWidth && line) { out.push(line); line = ch }
      else line += ch
    }
    out.push(line)
  }
  return out
}

function transAlpha(c: Clip, local: number): number {
  if (!c.trans || c.trans === 'none' || !c.transDur) return 0
  if (local < 0 || local > c.transDur) return 0
  return 1 - local / c.transDur
}

function alphaOf(clip: Clip, t: number) {
  const local = t - clip.start
  let a = clip.opacity
  if (clip.fadeIn > 0 && local < clip.fadeIn) a *= local / clip.fadeIn
  if (clip.fadeOut > 0 && local > clip.duration - clip.fadeOut) {
    a *= Math.max(0, (clip.duration - local) / clip.fadeOut)
  }
  return Math.max(0, Math.min(1, a))
}

function drawCenter(g: CanvasRenderingContext2D, src: HTMLVideoElement, cw: number, ch: number) {
  const sw = src.videoWidth, sh = src.videoHeight
  if (!sw || !sh) return
  const s = Math.max(cw / sw, ch / sh)
  g.drawImage(src, (-sw * s) / 2, (-sh * s) / 2, sw * s, sh * s)
}

export async function exportMp4(input: Mp4ExportInput): Promise<{ blob: Blob; mime: string; ext: string }> {
  if (!mp4Supported()) throw new Error('当前浏览器不支持 WebCodecs 编码，请用 Chrome / Edge 或新版安卓 WebView')

  const { width, height, fps, duration, clips, tracks, assets, onProgress, signal } = input
  const grading = input.grading || { brightness: 1, contrast: 1, saturation: 1 }
  const report = (p: number, m: string) => onProgress?.(p, m)

  /* ---------- 能力探测（先查再干，避免白忙一场） ---------- */
  const needsAudio = clips.some(c => c.kind === 'audio' || (input.audioFromVideo && c.kind === 'video'))
  const vCfg = { codec: 'avc1.4D0028', width, height, bitrate: input.bitrate || 8_000_000, framerate: fps }
  try {
    const vs = await (window as any).VideoEncoder.isConfigSupported(vCfg)
    if (!vs?.supported) throw new Error('本机不支持 H.264 编码')
  } catch (e: any) {
    throw new Error('本机不支持 H.264 编码（' + (e?.message || '未知') + '）')
  }
  if (needsAudio) {
    try {
      const as = await (window as any).AudioEncoder.isConfigSupported({
        codec: 'mp4a.40.2', sampleRate: 48000, numberOfChannels: 2, bitrate: 128000,
      })
      if (!as?.supported) throw new Error('本机不支持 AAC 音频编码')
    } catch (e: any) {
      throw new Error('本机不支持 AAC 音频编码（' + (e?.message || '未知') + '）')
    }
  }

  /* ---------- 画布 ---------- */
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const g = canvas.getContext('2d', { alpha: false })!
  g.fillStyle = '#000'
  g.fillRect(0, 0, width, height)

  /* ---------- 视频元素 ---------- */
  const mcMap = new Map((input.multicamGroups || []).map(g => [g.id, g.angles]))
  const assetIdForClip = (c: Clip, local: number) => {
    if (!c.mcId) return c.assetId
    const angles = mcMap.get(c.mcId) || []
    if (!angles.length) return c.assetId
    let idx = 0
    for (const cut of (c.cuts || [])) { if (cut.t <= local + 1e-6) idx = cut.angle; else break }
    return angles[Math.min(angles.length - 1, Math.max(0, idx))]
  }

  const runtimes: { clip: Clip; el: HTMLVideoElement; assetId: string }[] = []
  for (const clip of clips) {
    if (clip.kind !== 'video') continue
    const ids = clip.mcId ? (mcMap.get(clip.mcId) || []) : (clip.assetId ? [clip.assetId] : [])
    for (const aid of ids) {
      const asset = assets.find(a => a.id === aid)
      if (!asset) continue
      const el = document.createElement('video')
      el.src = asset.url
      el.preload = 'auto'
      el.muted = true
      el.playsInline = true
      el.load()
      runtimes.push({ clip, el, assetId: aid })
    }
  }
  await Promise.all(runtimes.map(r => new Promise<void>(res => {
    if (r.el.readyState >= 2) return res()
    const done = () => res()
    r.el.addEventListener('loadeddata', done, { once: true })
    r.el.addEventListener('error', done, { once: true })
    setTimeout(done, 6000)
  })))

  /* ---------- 音频离线混音 ---------- */
  const AC: typeof AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext
  const audioCtx = new AC()
  const sampleRate = 48000
  let mixed: AudioBuffer | null = null

  try {
    const audioClips = clips.filter(c =>
      c.kind === 'audio' || (input.audioFromVideo && c.kind === 'video')
    )
    if (audioClips.length) {
      const frames = Math.max(1, Math.ceil(duration * sampleRate))
      const off = new OfflineAudioContext(2, frames, sampleRate)
      const decoded = new Map<string, AudioBuffer>()

      for (const c of audioClips) {
        const a = assets.find(x => x.id === c.assetId)
        if (!a) continue
        let buf = decoded.get(a.id)
        if (!buf) {
          try {
            const ab = await a.file.arrayBuffer()
            buf = await off.decodeAudioData(ab.slice(0))
            decoded.set(a.id, buf)
          } catch { continue }
        }
        const src = off.createBufferSource()
        src.buffer = buf
        src.playbackRate.value = Math.max(0.25, Math.min(4, c.speed))
        const gain = off.createGain()
        // 取片段平均音量（关键帧音量在 MP4 路径里按平均值处理）
        const v = volumeAt(c, Math.min(c.duration, c.duration / 2))
        const tr = tracks.find(t => t.id === c.trackId)
        gain.gain.value = tr?.muted ? 0 : v
        src.connect(gain).connect(off.destination)
        const when = Math.max(0, c.start)
        const offset = Math.max(0, c.inPoint)
        const dur = Math.min(c.duration, Math.max(0, duration - when))
        if (dur > 0) src.start(when, offset, dur)
      }
      mixed = await off.startRendering()
    }
  } catch {
    mixed = null
  }
  if (!mixed) {
    // 没混出音频就不要留着 AudioContext
    await audioCtx.close().catch(() => {})
  }

  /* ---------- 编码器（Worker：后台编码，主线程不卡） ---------- */
  let encErr: any = null
  const worker = new Worker(new URL('../workers/mp4-encoder.worker.ts', import.meta.url), { type: 'module' })
  let workerDone: (buf: ArrayBuffer) => void = () => {}
  let workerFail: (e: any) => void = () => {}
  let readyResolve: () => void = () => {}

  const workerResult = new Promise<ArrayBuffer>((res, rej) => { workerDone = res; workerFail = rej })
  const workerReady = new Promise<void>(r => { readyResolve = r })

  worker.onmessage = (ev: MessageEvent) => {
    const d = ev.data
    if (d.type === 'ready') readyResolve()
    else if (d.type === 'done') workerDone(d.buffer)
    else if (d.type === 'error') { encErr = new Error(d.message); workerFail(encErr) }
  }
  worker.onerror = (ev) => { encErr = new Error(ev.message || 'worker error'); workerFail(encErr) }

  worker.postMessage({
    type: 'init', width, height, fps,
    bitrate: input.bitrate || 8_000_000,
    audio: mixed ? { sampleRate, channels: 2 } : null,
  })
  await workerReady

  /* ---------- 音频分段喂入（发给 Worker） ---------- */
  if (mixed) {
    const CH = 1024
    const ch0 = mixed.getChannelData(0)
    const ch1 = mixed.numberOfChannels > 1 ? mixed.getChannelData(1) : ch0
    const total = mixed.length
    ;(async () => {
      for (let i = 0; i < total; i += CH) {
        const n = Math.min(CH, total - i)
        const data = new Float32Array(n * 2)
        data.set(ch0.subarray(i, i + n), 0)
        data.set(ch1.subarray(i, i + n), n)
        worker.postMessage({
          type: 'audio', data, sampleRate, frames: n, channels: 2,
          timestamp: Math.round((i / sampleRate) * 1e6),
        }, [data.buffer])
      }
    })().catch(() => {})
  }

  /* ---------- 逐帧渲染 + 编码 ---------- */
  const t0 = performance.now()
  // 先出 t=0 的第一帧：否则初始化耗时会让首帧时间戳从 0.6s 起，muxer 直接报错
  let frameIdx = 0
  let lastEncoded = -1
  const frameDur = 1e6 / fps

  const drawAt = (t: number) => {
    g.setTransform(1, 0, 0, 1, 0, 0)
    g.globalAlpha = 1
    g.filter = 'none'
    g.fillStyle = '#000'
    g.fillRect(0, 0, width, height)

    g.filter = `brightness(${grading.brightness}) contrast(${grading.contrast}) saturate(${grading.saturation}) ${presetFilter((grading as any).preset)}`
    for (const rt of runtimes) {
      const c = rt.clip
      if (t < c.start || t >= c.start + c.duration) continue
      const tr = tracks.find(x => x.id === c.trackId)
      if (tr?.hidden) continue
      if (rt.assetId !== assetIdForClip(c, t - c.start)) continue
      if (!rt.el.videoWidth) continue
      const tf = transformAt(c, t - c.start)
      g.globalAlpha = alphaOf(c, t) * (tf.opacity ?? 1)
      g.save()
      const tp = (c.transDur && c.transDur > 0) ? Math.min(1, Math.max(0, (t - c.start) / c.transDur)) : 1
      if (c.trans === 'wipeL' && tp < 1) { g.beginPath(); g.rect(0, 0, width * tp, height); g.clip() }
      else if (c.trans === 'wipeR' && tp < 1) { g.beginPath(); g.rect(width * (1 - tp), 0, width * tp, height); g.clip() }
      else if (c.trans === 'slideUp' && tp < 1) { g.translate(0, height * (1 - tp)) }
      else if (c.trans === 'zoom' && tp < 1) { const k = 1.25 - 0.25 * tp; g.translate(width / 2, height / 2); g.scale(k, k); g.translate(-width / 2, -height / 2) }
      if (c.maskType && c.maskType !== 'none') {
        const mw = width * (c.maskW ?? 0.6)
        const mh = height * (c.maskH ?? 0.6)
        const mx = width * (c.maskX ?? 0.5) - mw / 2
        const my = height * (c.maskY ?? 0.5) - mh / 2
        g.beginPath()
        if (c.maskType === 'ellipse') g.ellipse(width * c.maskX, height * c.maskY, mw / 2, mh / 2, 0, 0, Math.PI * 2)
        else g.rect(mx, my, mw, mh)
        g.clip()
      }
      g.translate(width / 2 + tf.x * width, height / 2 + tf.y * height)
      g.rotate((tf.rotation * Math.PI) / 180)
      g.scale(tf.scale, tf.scale)
      drawCenter(g, rt.el, width, height)
      g.restore()
    }

    if (input.lut && (input as any).lutEnabled) applyLut(g, input.lut)

    for (const c of clips) {
      if (c.trans !== 'black' && c.trans !== 'white') continue
      if (t < c.start || t >= c.start + c.duration) continue
      const a = transAlpha(c, t - c.start)
      if (a <= 0) continue
      g.globalAlpha = a
      g.fillStyle = c.trans === 'black' ? '#000' : '#fff'
      g.fillRect(0, 0, width, height)
    }

    g.filter = 'none'
    for (const c of clips) {
      if (c.kind !== 'text') continue
      if (t < c.start || t >= c.start + c.duration) continue
      const tr = tracks.find(x => x.id === c.trackId)
      if (tr?.hidden) continue
      const px = Math.max(8, Math.round(c.fontSize * (height / 720)))
      g.globalAlpha = alphaOf(c, t)
      g.font = `700 ${px}px "PingFang SC","Microsoft YaHei",sans-serif`
      g.textAlign = c.align
      g.textBaseline = 'middle'
      g.lineJoin = 'round'
      const lines = wrapText(g, c.text || c.name, width * 0.9)
      const lh = px * 1.3
      const cx = width * c.x
      const startY = height * c.y - ((lines.length - 1) * lh) / 2
      lines.forEach((ln, i) => {
        const y = startY + i * lh
        if (c.strokeWidth > 0) {
          g.strokeStyle = c.strokeColor
          g.lineWidth = c.strokeWidth * (height / 720)
          g.strokeText(ln, cx, y)
        }
        g.fillStyle = c.color
        g.fillText(ln, cx, y)
      })
    }
    g.globalAlpha = 1
  }

  /* ---------- 逐帧：主线程只取帧 + 算参数，合成交给 Worker ---------- */
  // LUT 需要 WebGL 套色，暂仍走主线程合成（其余情况全在 Worker，界面不卡）
  const lutMode = !!(input.lut && (input as any).lutEnabled)

  /** 每个素材一份独立暂存画布：从 video 直接建 VideoFrame 会引用播放器的解码帧，
   *  主线程一 seek/play 就可能把帧回收，Worker 里再 drawImage 直接崩。先拷到独立画布再传。 */
  const scratch = new Map<string, { c: HTMLCanvasElement; g: CanvasRenderingContext2D }>()
  const scratchFor = (id: string, w: number, h: number) => {
    let s = scratch.get(id)
    if (!s || s.c.width !== w || s.c.height !== h) {
      const c = document.createElement('canvas')
      c.width = w
      c.height = h
      s = { c, g: c.getContext('2d', { alpha: false })! }
      scratch.set(id, s)
    }
    return s
  }

  /** 把当前时刻的绘制指令打包好（不含像素，只有帧引用和参数） */
  const buildFrameMsg = (clamped: number, ts: number, key: boolean) => {
    const layers: any[] = []
    for (const rt of runtimes) {
      const c = rt.clip
      if (clamped < c.start || clamped >= c.start + c.duration) continue
      const tr = tracks.find(x => x.id === c.trackId)
      if (tr?.hidden) continue
      if (rt.assetId !== assetIdForClip(c, clamped - c.start)) continue
      if (!rt.el.videoWidth) continue
      const tf = transformAt(c, clamped - c.start) as any
      // 先拷一份独立帧，避免和播放器解码帧纠缠（这也是之前导出崩溃的根因）
      let frame: VideoFrame
      try {
        const sw = rt.el.videoWidth, sh = rt.el.videoHeight
        const sc = scratchFor(rt.assetId, sw, sh)
        sc.g.drawImage(rt.el, 0, 0, sw, sh)
        frame = new VideoFrame(sc.c, { timestamp: ts, duration: Math.round(frameDur) })
      } catch { continue }
      const tp = (c.transDur && c.transDur > 0)
        ? Math.min(1, Math.max(0, (clamped - c.start) / c.transDur)) : 1
      layers.push({
        frame,
        x: tf?.x ?? 0, y: tf?.y ?? 0, rot: tf?.rotation ?? 0, scale: tf?.scale ?? 1,
        alpha: alphaOf(c, clamped) * (tf?.opacity ?? 1),
        trans: c.trans, tp,
        mask: (c.maskType && c.maskType !== 'none') ? {
          type: c.maskType,
          x: width * (c.maskX ?? 0.5), y: height * (c.maskY ?? 0.5),
          w: width * (c.maskW ?? 0.6), h: height * (c.maskH ?? 0.6),
        } : null,
      })
    }

    const overlays: any[] = []
    for (const c of clips) {
      if (c.trans !== 'black' && c.trans !== 'white') continue
      if (clamped < c.start || clamped >= c.start + c.duration) continue
      const a = transAlpha(c, clamped - c.start)
      if (a > 0) overlays.push({ color: c.trans === 'black' ? '#000' : '#fff', alpha: a })
    }

    const texts: any[] = []
    for (const c of clips) {
      if (c.kind !== 'text') continue
      if (clamped < c.start || clamped >= c.start + c.duration) continue
      const tr = tracks.find(x => x.id === c.trackId)
      if (tr?.hidden) continue
      texts.push({
        text: c.text || c.name, x: c.x, y: c.y, fontSize: c.fontSize,
        color: c.color, strokeColor: c.strokeColor, strokeWidth: c.strokeWidth,
        align: c.align, alpha: alphaOf(c, clamped),
      })
    }

    return {
      type: 'frame', ts, fps, key, layers, overlays, texts,
      grading: {
        brightness: grading.brightness,
        contrast: grading.contrast,
        saturation: grading.saturation,
        presetFilter: presetFilter((grading as any).preset),
      },
    }
  }

  const loop = () => {
    if (signal?.aborted) return finish()
    const t = (performance.now() - t0) / 1000
    const clamped = Math.min(t, duration)

    for (const rt of runtimes) {
      const c = rt.clip
      const want = sourceTimeAt(c, clamped - c.start)
      const wanted = c.mcId ? assetIdForClip(c, clamped - c.start) : c.assetId
      const active = clamped >= c.start && clamped < c.start + c.duration && rt.assetId === wanted
      rt.el.playbackRate = Math.min(4, Math.max(0.25, speedAt(c, Math.max(0, clamped - c.start))))
      if (active) {
        if (Math.abs(rt.el.currentTime - want) > 0.2) {
          try { rt.el.currentTime = Math.max(0, want) } catch { /* ignore */ }
        }
        if (rt.el.paused) rt.el.play().catch(() => {})
      } else if (!rt.el.paused) rt.el.pause()
    }

    const target = Math.min(Math.floor(clamped * fps), Math.ceil(duration * fps))
    if (target > lastEncoded) {
      const ts = Math.round((target / fps) * 1e6)
      const key = frameIdx % Math.max(1, fps * 2) === 0
      try {
        if (lutMode) {
          // LUT 路径：主线程合成后才交给 Worker 编码
          drawAt(clamped)
          const frame = new VideoFrame(canvas, { timestamp: ts, duration: Math.round(frameDur) })
          worker.postMessage({ type: 'rawframe', frame, key }, [frame])
        } else {
          const msg = buildFrameMsg(clamped, ts, key)
          worker.postMessage(msg, msg.layers.map((l: any) => l.frame))
        }
        frameIdx++
        lastEncoded = target
      } catch (e) {
        encErr = e
      }
    }

    report(Math.min(0.98, 0.02 + (clamped / Math.max(0.1, duration)) * 0.94), `编码中 ${clamped.toFixed(1)} / ${duration.toFixed(1)}s`)

    if (clamped >= duration) return finish()
    requestAnimationFrame(loop)
  }

  let finished = false
  const finish = async () => {
    if (finished) return
    finished = true
    try {
      worker.postMessage({ type: 'finish' })
      const buffer = await Promise.race([
        workerResult,
        new Promise<ArrayBuffer>((_, rej) => setTimeout(() => rej(new Error('编码超时')), 30000)),
      ])
      worker.terminate()
      const blob = new Blob([buffer], { type: 'video/mp4' })
      report(1, '完成')
      await audioCtx.close().catch(() => {})
      resolveRef(blob)
    } catch (e) {
      rejectRef(e)
    }
  }

  let resolveRef!: (b: Blob) => void
  let rejectRef!: (e: any) => void
  const done = new Promise<Blob>((res, rej) => { resolveRef = res; rejectRef = rej })

  if (encErr) {
    await audioCtx.close().catch(() => {})
    throw encErr
  }

  // 开场先编一帧 t=0（此时视频元素已 loadeddata，能取到帧）
  try {
    if (lutMode) {
      drawAt(0)
      const f0 = new VideoFrame(canvas, { timestamp: 0, duration: Math.round(frameDur) })
      worker.postMessage({ type: 'rawframe', frame: f0, key: true }, [f0])
    } else {
      const msg0 = buildFrameMsg(0, 0, true)
      worker.postMessage(msg0, msg0.layers.map((l: any) => l.frame))
    }
    lastEncoded = 0
    frameIdx = 1
  } catch { /* 第一帧失败就交给循环兜底 */ }

  requestAnimationFrame(loop)

  const blob = await done
  return { blob, mime: 'video/mp4', ext: 'mp4' }
}
