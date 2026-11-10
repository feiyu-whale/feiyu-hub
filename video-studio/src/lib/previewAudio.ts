/**
 * previewAudio.ts —— 剪辑台预览音频引擎
 *
 * 干什么：让「预览播放」有声音。
 * 用了什么：HTMLMediaElement（video/audio 元素）+ WebAudio 的 createMediaElementSource。
 *          没有第三方库。
 * 输入：时间轴片段、轨道、素材、当前播放时间
 * 输出：声音；另有 sync(t) 播放中纠偏、stop() 停止
 *
 * ⚠️ 为什么不用 decodeAudioData：
 *   浏览器只认真音频容器（wav/mp3/m4a…），**不能解 mp4/mov 视频文件**。
 *   而剪辑台的音频片段，素材往往就是一个 mp4。用 decodeAudioData 必然失败 → 静音。
 *   改用 <video> 元素播放，浏览器原生解码 mp4 音轨，稳。
 *
 * 设计：
 *  - 每个「片段」一个独立 media 元素 + 独立 AudioNode（避免多个片段抢同一个元素）
 *  - 元素复用缓存，不反复创建
 *  - 播放中比对 currentTime 与画面时间，偏差过大就 seek 回来
 */
import type { Clip, MediaAsset, Track } from '../stores/project'
import { volumeAt, sourceTimeAt } from '../stores/project'

const AC: typeof AudioContext =
  (window as any).AudioContext || (window as any).webkitAudioContext

let ctx: AudioContext | null = null
/** 每个片段一个播放单元 */
interface Unit {
  el: HTMLMediaElement
  src: MediaElementAudioSourceNode
  gain: GainNode
  /** 元数据没加载完时设 currentTime 会被浏览器忽略，先存住，加载完了再补 */
  pendingSeek: number | null
  /** 要不要自动起播 */
  pendingPlay: boolean
}
const units = new Map<string, Unit>()
let running = false

function ensureCtx(): AudioContext | null {
  if (!AC) return null
  if (!ctx) {
    try {
      ctx = new AC()
    } catch {
      return null
    }
  }
  if (ctx.state === 'suspended') void ctx.resume().catch(() => {})
  return ctx
}

/** 为片段创建（或复取）播放单元 */
function unitFor(cl: Clip, assets: MediaAsset[]): Unit | null {
  const hit = units.get(cl.id)
  if (hit) return hit
  const c = ctx
  if (!c) return null
  const asset = assets.find(a => a.id === cl.assetId)
  if (!asset) return null

  // 视频素材用 <video>（能解 mp4 音轨），纯音频素材用 <audio>
  const el = document.createElement(asset.kind === 'audio' ? 'audio' : 'video') as HTMLMediaElement
  el.src = asset.url
  el.preload = 'auto'
  // 素材是 blob: 本地临时地址，同源，**不能**设 crossOrigin——
  // 设了 anonymous 会让部分浏览器把媒体当成跨域，createMediaElementSource 直接输出静音。
  if (el instanceof HTMLVideoElement) {
    el.playsInline = true
  }

  let src: MediaElementAudioSourceNode
  let gain: GainNode
  try {
    src = c.createMediaElementSource(el)
    gain = c.createGain()
    src.connect(gain).connect(c.destination)
  } catch {
    return null
  }
  const u: Unit = { el, src, gain, pendingSeek: null, pendingPlay: false }

  // 元数据到了：补上之前没设成功的 seek，并按需起播
  el.addEventListener('loadedmetadata', () => {
    if (u.pendingSeek !== null) {
      try { el.currentTime = u.pendingSeek } catch { /* 忽略 */ }
      u.pendingSeek = null
    }
    if (u.pendingPlay && el.paused && running) {
      void el.play().catch(() => {})
    }
  })

  units.set(cl.id, u)
  return u
}

/** 定位：未加载完则先记着，加载完再补 */
function seekUnit(u: Unit, target: number): void {
  if (u.el.readyState >= 1) {
    // HAVE_METADATA 以上，可以直接设
    try {
      u.el.currentTime = target
    } catch {
      u.pendingSeek = target
    }
  } else {
    u.pendingSeek = target
  }
}

/**
 * 开始播放：从 timelineFrom 起发声
 * includeVideoAudio: true = 普通版（声音跟视频片段走）；false = 专业版（走独立音频轨）
 */
export function start(
  clips: Clip[],
  tracks: Track[],
  assets: MediaAsset[],
  timelineFrom: number,
  rate = 1,
  includeVideoAudio = false,
): void {
  const c = ensureCtx()
  if (!c) return
  running = true

  const wanted = new Set<string>()

  for (const cl of clips) {
    const isAudio = cl.kind === 'audio' || (includeVideoAudio && cl.kind === 'video')
    if (!isAudio) continue

    const tr = tracks.find(t => t.id === cl.trackId)
    // 轨道静音 → 停掉这个片段
    if (tr?.muted) continue

    const clipEnd = cl.start + cl.duration
    if (clipEnd <= timelineFrom) continue   // 已经过去了
    if (cl.start > timelineFrom + 0.001) {
      // 还没到播放点：先记着，sync() 到点再拉起（下面 sync 会处理）
    }

    wanted.add(cl.id)
    const u = unitFor(cl, assets)
    if (!u) continue

    // 目标位置（片段内偏移 → 素材时间）
    const local = Math.max(0, timelineFrom - cl.start)
    const target = Math.max(0, sourceTimeAt(cl, local))
    seekUnit(u, target)
    u.el.playbackRate = Math.max(0.25, Math.min(4, (cl.speed || 1) * rate))
    const v = volumeAt(cl, local)
    u.gain.gain.value = Math.max(0, Math.min(2, v ?? 1))

    // 到点之前不播，交给 sync 拉起
    if (cl.start <= timelineFrom + 0.05) {
      u.pendingPlay = true
      if (u.el.paused) {
        void u.el.play().catch(() => {
          // 浏览器拦了自动播放：等用户再点一下
          u.pendingPlay = true
        })
      }
    } else {
      u.pendingPlay = false
      try { u.el.pause() } catch { /* 忽略 */ }
    }
  }

  // 不在本次播放范围的单元先停掉（保留缓存，别急着销毁）
  for (const [id, u] of units) {
    if (!wanted.has(id)) {
      try { u.el.pause() } catch { /* 忽略 */ }
    }
  }
}

/**
 * 播放中纠偏：按当前画面时间，校正每个片段该不该出声、该在第几秒。
 * 每帧调用，开销很小。
 */
export function sync(
  t: number,
  clips: Clip[],
  tracks: Track[],
  assets: MediaAsset[],
  rate = 1,
  includeVideoAudio = false,
): void {
  if (!running || !ctx) return

  for (const cl of clips) {
    const isAudio = cl.kind === 'audio' || (includeVideoAudio && cl.kind === 'video')
    if (!isAudio) continue

    const tr = tracks.find(x => x.id === cl.trackId)
    const inRange = !tr?.muted && t >= cl.start && t < cl.start + cl.duration

    const u = units.get(cl.id)
    if (!u) {
      // 到点了但还没建单元 → 建一个并起播
      if (inRange) {
        const nu = unitFor(cl, assets)
        if (nu) {
          const local = Math.max(0, t - cl.start)
          seekUnit(nu, Math.max(0, sourceTimeAt(cl, local)))
          const v = volumeAt(cl, local)
          nu.gain.gain.value = Math.max(0, Math.min(2, v ?? 1))
          nu.el.playbackRate = Math.max(0.25, Math.min(4, (cl.speed || 1) * rate))
          nu.pendingPlay = true
          void nu.el.play().catch(() => {})
        }
      }
      continue
    }

    if (!inRange) {
      u.pendingPlay = false
      if (!u.el.paused) {
        try { u.el.pause() } catch { /* 忽略 */ }
      }
      continue
    }

    // 在范围内：校时 + 保证在播
    const local = Math.max(0, t - cl.start)
    const target = Math.max(0, sourceTimeAt(cl, local))
    if (Math.abs(u.el.currentTime - target) > 0.35) {
      seekUnit(u, target)
    }
    const v = volumeAt(cl, local)
    u.gain.gain.value = Math.max(0, Math.min(2, v ?? 1))
    u.el.playbackRate = Math.max(0.25, Math.min(4, (cl.speed || 1) * rate))
    u.pendingPlay = true
    if (u.el.paused) void u.el.play().catch(() => {})
  }
}

/** 停止播放（保留元素缓存，下次继续用） */
export function stop(): void {
  running = false
  for (const u of units.values()) {
    try {
      u.el.pause()
    } catch {
      /* 忽略 */
    }
  }
}

/** 彻底释放（卸载组件时调用） */
export function dispose(): void {
  stop()
  for (const u of units.values()) {
    try {
      u.el.removeAttribute('src')
      u.el.load()
      u.src.disconnect()
      u.gain.disconnect()
    } catch {
      /* 忽略 */
    }
  }
  units.clear()
}

/** 浏览器是否有可用音频上下文 */
export function available(): boolean {
  return !!AC
}
