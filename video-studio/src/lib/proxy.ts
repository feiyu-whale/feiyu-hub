/**
 * proxy.ts —— 代理文件（低清预览版）生成
 *
 * 干什么：把大视频实时录一份 640×360 的 WebM，剪辑时用它预览，导出仍用原片。
 * 依赖：HTMLVideoElement + Canvas + MediaRecorder
 * 输入：源文件 Blob、最大宽、进度回调；输出：WebM Blob
 *
 * 注意：这是实时录制，耗时 ≈ 视频时长。大素材建议挂着跑，界面有进度条。
 */

export interface ProxyOptions {
  maxWidth?: number
  fps?: number
  onProgress?: (p: number, msg: string) => void
  signal?: AbortSignal
}

export async function generateProxy(file: Blob, opts: ProxyOptions = {}): Promise<Blob> {
  const maxW = opts.maxWidth ?? 640
  const fps = opts.fps ?? 30
  const report = (p: number, m: string) => opts.onProgress?.(p, m)

  const mime = ['video/webm;codecs=vp8', 'video/webm'].find(m =>
    typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(m)
  )
  if (!mime) throw new Error('当前浏览器不支持录制代理')

  const url = URL.createObjectURL(file)
  const video = document.createElement('video')
  video.src = url
  video.muted = true
  video.playsInline = true
  video.preload = 'auto'

  await new Promise<void>((resolve, reject) => {
    video.onloadeddata = () => resolve()
    video.onerror = () => reject(new Error('视频无法解码'))
    setTimeout(() => reject(new Error('读取视频超时')), 20000)
    video.load()
  })

  const vw = video.videoWidth || 1280
  const vh = video.videoHeight || 720
  const scale = Math.min(1, maxW / vw)
  const w = Math.max(2, Math.round((vw * scale) / 2) * 2)
  const h = Math.max(2, Math.round((vh * scale) / 2) * 2)

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const g = canvas.getContext('2d')!

  const stream = canvas.captureStream(fps)
  const rec = new MediaRecorder(stream, {
    mimeType: mime,
    videoBitsPerSecond: 1_000_000,
  })
  const chunks: BlobPart[] = []
  rec.ondataavailable = e => { if (e.data.size) chunks.push(e.data) }
  const done = new Promise<Blob>(resolve => {
    rec.onstop = () => resolve(new Blob(chunks, { type: 'video/webm' }))
  })

  rec.start(500)
  await video.play().catch(() => {})

  const duration = isFinite(video.duration) && video.duration > 0 ? video.duration : 0
  let raf = 0
  let stopped = false

  const loop = () => {
    if (stopped) return
    if (opts.signal?.aborted) { stopped = true; rec.stop(); video.pause(); return }

    if (video.videoWidth) {
      g.drawImage(video, 0, 0, w, h)
    }
    if (duration) {
      report(Math.min(0.99, video.currentTime / duration), `生成代理 ${Math.floor(video.currentTime)}s / ${Math.floor(duration)}s`)
    }
    if (video.ended || (duration && video.currentTime >= duration - 0.05)) {
      stopped = true
      rec.stop()
      return
    }
    raf = requestAnimationFrame(loop)
  }
  requestAnimationFrame(loop)

  const blob = await done
  cancelAnimationFrame(raf)
  stream.getTracks().forEach(t => t.stop())
  video.pause()
  URL.revokeObjectURL(url)
  report(1, '代理完成')
  return blob
}
