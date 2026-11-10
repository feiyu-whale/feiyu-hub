/**
 * exporter.ts —— 浏览器内直接出片（画面合成 + 音频混音 + MediaRecorder 录制）
 *
 * 干什么：把时间轴按真实时间播一遍，同时录成视频文件，不经过任何服务器。
 * 依赖：Canvas 2D、WebAudio、MediaRecorder、captureStream（Chrome / Edge / 安卓 WebView）
 * 输入：轨道、片段、素材、画布尺寸、帧率、总时长
 * 输出：{ blob, mime, ext }
 *
 * 说明：实时录制，片长 = 导出耗时。这是纯前端零服务器的代价（不上传、不花钱、不用配置）。
 */

import type { Clip, MediaAsset, Track } from '../stores/project'
import { speedAt, sourceTimeAt, transformAt, volumeAt, presetFilter } from '../stores/project'
import { applyLut } from './lutRenderer'
import { patchWebmDuration } from './webmDuration'

export interface ExportInput {
  clips: Clip[]
  tracks: Track[]
  assets: MediaAsset[]
  width: number
  height: number
  fps: number
  duration: number
  grading?: { brightness: number; contrast: number; saturation: number }
  /** 视频码率，单位 bit/s，默认 6M */
  videoBitrate?: number
  /** 多机位组（片段引用机位组时需要） */
  multicamGroups?: { id: string; angles: string[] }[]
  /** 3D LUT（可选） */
  lut?: any
  lutEnabled?: boolean
  /** 普通版：视频片段自带声音（没有独立音频轨时） */
  audioFromVideo?: boolean
  onProgress?: (p: number, msg: string) => void
  signal?: AbortSignal
}

interface Runtime {
  clip: Clip
  el: HTMLVideoElement | HTMLAudioElement
  video: boolean
  assetId: string
}

function pickMime(): string {
  const cands = [
    'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
  ]
  for (const c of cands) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(c)) return c
  }
  return ''
}

function extOf(mime: string) {
  return mime.includes('mp4') ? 'mp4' : 'webm'
}

/** 按最大宽度折行（中文按字断行） */
function wrapText(g: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = []
  for (const raw of text.split('\n')) {
    let line = ''
    for (const ch of raw) {
      if (g.measureText(line + ch).width > maxWidth && line) {
        lines.push(line)
        line = ch
      } else {
        line += ch
      }
    }
    lines.push(line)
  }
  return lines
}

/** 以原点为中心绘制 */
function drawCenter(g: CanvasRenderingContext2D, src: HTMLVideoElement, cw: number, ch: number) {
  const sw = src.videoWidth, sh = src.videoHeight
  if (!sw || !sh) return
  const scale = Math.max(cw / sw, ch / sh)
  const dw = sw * scale, dh = sh * scale
  g.drawImage(src, -dw / 2, -dh / 2, dw, dh)
}


function transAlpha(c: Clip, local: number): number {
  if (!c.trans || c.trans === 'none' || !c.transDur) return 0
  if (local < 0 || local > c.transDur) return 0
  return 1 - local / c.transDur
}

function alphaOf(clip: Clip, t: number) {
  const local = t - clip.start
  let a = clip.opacity
  if (clip.trans === 'fade' && clip.transDur > 0 && local < clip.transDur) a *= local / clip.transDur
  if (clip.fadeIn > 0 && local < clip.fadeIn) a *= local / clip.fadeIn
  if (clip.fadeOut > 0 && local > clip.duration - clip.fadeOut) {
    a *= Math.max(0, (clip.duration - local) / clip.fadeOut)
  }
  return Math.max(0, Math.min(1, a))
}

export async function exportTimeline(input: ExportInput): Promise<{ blob: Blob; mime: string; ext: string }> {
  const { width, height, fps, duration, clips, tracks, assets, onProgress, signal } = input
  const grading = input.grading || { brightness: 1, contrast: 1, saturation: 1 }
  const report = (p: number, msg: string) => onProgress?.(p, msg)

  const mime = pickMime()
  if (!mime) throw new Error('当前浏览器不支持 MediaRecorder 录制，请用 Chrome / Edge')

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const g = canvas.getContext('2d')!
  g.fillStyle = '#000'
  g.fillRect(0, 0, width, height)

  /* ---- 音频图 ---- */
  const AC: typeof AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext
  const audioCtx: AudioContext | null = AC ? new AC() : null
  const dest = audioCtx?.createMediaStreamDestination() ?? null

  /* ---- 每个片段一个媒体元素 ---- */
  const runtimes: Runtime[] = []
  const gainOf = new Map<Clip, GainNode>()

  const sortedTracks = [...tracks]
  const trackIndex = new Map(sortedTracks.map((t, i) => [t.id, i]))

  const mcMap = new Map((input.multicamGroups || []).map(g => [g.id, g.angles]))
  const assetIdForClip = (c: Clip, local: number) => {
    if (!c.mcId) return c.assetId
    const angles = mcMap.get(c.mcId) || []
    if (!angles.length) return c.assetId
    let idx = 0
    const cuts = c.cuts || []
    for (const cut of cuts) { if (cut.t <= local + 1e-6) idx = cut.angle; else break }
    return angles[Math.min(angles.length - 1, Math.max(0, idx))]
  }

  for (const clip of clips) {
    const assetIds = clip.mcId ? (mcMap.get(clip.mcId) || []) : (clip.assetId ? [clip.assetId] : [])
    for (const aid of assetIds) {
      const asset = assets.find(a => a.id === aid)
      if (!asset || clip.kind === 'text') continue
      const video = asset.kind === 'video'
    const el = document.createElement(video ? 'video' : 'audio') as HTMLVideoElement | HTMLAudioElement
    el.src = asset.url
    el.preload = 'auto'
    el.crossOrigin = 'anonymous'

    const routeAudio = !!audioCtx && !!dest &&
      (clip.kind === 'audio' || (!!input.audioFromVideo && clip.kind === 'video'))

      if (video) {
        ;(el as HTMLVideoElement).playsInline = true
        ;(el as HTMLVideoElement).muted = !routeAudio
      } else {
        el.muted = !routeAudio
      }
      el.load()

    // 专业版：声音只从音频轨出；普通版：视频片段自带声音
    if (routeAudio) {
      try {
        const src = audioCtx.createMediaElementSource(el)
        // 三段 EQ
        const low = audioCtx.createBiquadFilter()
        low.type = 'lowshelf'
        low.frequency.value = 200
        low.gain.value = clip.eqLow || 0

        const mid = audioCtx.createBiquadFilter()
        mid.type = 'peaking'
        mid.frequency.value = 1200
        mid.Q.value = 0.9
        mid.gain.value = clip.eqMid || 0

        const high = audioCtx.createBiquadFilter()
        high.type = 'highshelf'
        high.frequency.value = 4000
        high.gain.value = clip.eqHigh || 0

        let tail: AudioNode = high
        if (clip.compress) {
          const comp = audioCtx.createDynamicsCompressor()
          comp.threshold.value = -24
          comp.knee.value = 24
          comp.ratio.value = 4
          comp.attack.value = 0.005
          comp.release.value = 0.2
          high.connect(comp)
          tail = comp
        }

        const gain = audioCtx.createGain()
        gain.gain.value = clip.volume
        src.connect(low).connect(mid).connect(high)
        if (tail !== high) high.connect(tail as AudioNode)
        tail.connect(gain).connect(dest)
        gainOf.set(clip, gain)
      } catch { /* 个别浏览器不允许，静默降级为无声 */ }
    }
      runtimes.push({ clip, el, video, assetId: aid })
    }
  }

  await Promise.all(runtimes.map(r => new Promise<void>(res => {
    if ((r.el as HTMLVideoElement).readyState >= 2) return res()
    const done = () => res()
    r.el.addEventListener('loadeddata', done, { once: true })
    r.el.addEventListener('error', done, { once: true })
    setTimeout(done, 6000)
  })))

  /* ---- 录制流 ---- */
  const stream = canvas.captureStream(fps)
  if (dest) dest.stream.getAudioTracks().forEach(t => stream.addTrack(t))

  const rec = new MediaRecorder(stream, {
    mimeType: mime,
    videoBitsPerSecond: input.videoBitrate || 6_000_000,
  })
  const chunks: BlobPart[] = []
  rec.ondataavailable = e => { if (e.data.size) chunks.push(e.data) }

  const finished = new Promise<Blob>(resolve => {
    rec.onstop = () => resolve(new Blob(chunks, { type: mime }))
  })

  // 闪避区间（人声段 → 压低音乐）
  const voices = clips.filter(c => c.duckRole === 'voice')
  const inVoice = (t: number) => voices.some(v => t >= v.start - 0.15 && t < v.start + v.duration + 0.25)

  rec.start(500)
  report(0.02, '准备录制…')

  const t0 = performance.now()
  let stopped = false

  const drawFrame = (t: number) => {
    g.setTransform(1, 0, 0, 1, 0, 0)
    g.filter = 'none'
    g.globalAlpha = 1
    g.fillStyle = '#000'
    g.fillRect(0, 0, width, height)

    // 视频轨（按轨道顺序自下而上）
    g.filter = `brightness(${grading.brightness}) contrast(${grading.contrast}) saturate(${grading.saturation}) ${presetFilter((grading as any).preset)}`
    const visual = clips
      .filter(c => c.kind !== 'text' && c.kind !== 'audio')
      .filter(c => t >= c.start && t < c.start + c.duration)
      .sort((a, b) => (trackIndex.get(a.trackId) ?? 0) - (trackIndex.get(b.trackId) ?? 0))

    for (const c of visual) {
      const tr = tracks.find(x => x.id === c.trackId)
      if (tr?.hidden) continue
      const wantId = assetIdForClip(c, t - c.start)
      const rt = runtimes.find(r => r.clip === c && r.assetId === wantId)
      if (!rt) continue
      const el = rt.el as HTMLVideoElement
      if (!rt.video || !el.videoWidth) continue
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
      drawCenter(g, el, width, height)
      g.restore()
    }

    // 3D LUT
    if (input.lut && input.lutEnabled) applyLut(g, input.lut)

    // 转场覆盖（黑场 / 白场）
    for (const cl of clips) {
      if (cl.trans !== 'black' && cl.trans !== 'white') continue
      if (t < cl.start || t >= cl.start + cl.duration) continue
      const ta = transAlpha(cl, t - cl.start)
      if (ta <= 0) continue
      g.globalAlpha = ta
      g.fillStyle = cl.trans === 'black' ? '#000' : '#fff'
      g.fillRect(0, 0, width, height)
    }

    // 字幕 / 文字（不受调色影响）
    g.filter = 'none'
    const texts = clips
      .filter(c => c.kind === 'text' && t >= c.start && t < c.start + c.duration)
      .sort((a, b) => (trackIndex.get(a.trackId) ?? 0) - (trackIndex.get(b.trackId) ?? 0))

    for (const c of texts) {
      const tr = tracks.find(x => x.id === c.trackId)
      if (tr?.hidden) continue
      const px = Math.max(8, Math.round(c.fontSize * (height / 720)))
      g.globalAlpha = alphaOf(c, t)
      g.font = `700 ${px}px "PingFang SC","Microsoft YaHei",sans-serif`
      g.textAlign = c.align
      g.textBaseline = 'middle'
      g.lineJoin = 'round'
      const maxW = width * 0.9
      const lines = wrapText(g, c.text || c.name, maxW)
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

  const loop = () => {
    if (stopped) return
    const t = (performance.now() - t0) / 1000
    const clamped = Math.min(t, duration)

    // 同步媒体
    for (const rt of runtimes) {
      const c = rt.clip
      const tr = tracks.find(x => x.id === c.trackId)
      const wanted = c.mcId ? assetIdForClip(c, t - c.start) : c.assetId
      const active = t >= c.start && t < c.start + c.duration && !tr?.muted && rt.assetId === wanted
      const want = sourceTimeAt(c, t - c.start)

      if (active) {
        const el: any = rt.el
        el.playbackRate = Math.min(4, Math.max(0.25, speedAt(c, t - c.start)))
        if (!rt.video) { try { el.currentTime = Math.max(0, want) } catch { /* ignore */ } }
        if (Math.abs(el.currentTime - want) > 0.25) {
          try { el.currentTime = Math.max(0, want) } catch { /* ignore */ }
        }
        if (el.paused) el.play().catch(() => {})
        const gain = gainOf.get(c)
        if (gain) {
          let v = volumeAt(c, t - c.start)
          if (c.duckRole === 'music' && inVoice(t)) v *= 0.35   // 被压低到 35%
          gain.gain.value = tr?.muted ? 0 : v
        }
      } else {
        const el: any = rt.el
        if (!el.paused) el.pause()
      }
    }

    drawFrame(clamped)
    report(Math.min(0.98, clamped / Math.max(0.1, duration) * 0.96 + 0.02), `录制中 ${clamped.toFixed(1)} / ${duration.toFixed(1)}s`)

    if (clamped >= duration || signal?.aborted) {
      stopped = true
      rec.stop()
      return
    }
    requestAnimationFrame(loop)
  }

  requestAnimationFrame(loop)

  let blob = await finished
  // WebM 补时长：否则部分播放器显示 0:00、不能拖进度条
  if (/webm/i.test(mime)) {
    blob = await patchWebmDuration(blob, duration)
  }
  stream.getTracks().forEach(t => t.stop())
  runtimes.forEach(r => { try { (r.el as any).pause() } catch { /* ignore */ } })
  await audioCtx?.close().catch(() => {})
  report(1, '完成')

  return { blob, mime, ext: extOf(mime) }
}
