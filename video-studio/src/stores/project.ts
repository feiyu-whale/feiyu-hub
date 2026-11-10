/**
 * project.ts —— 剪辑台工程状态（Pinia）
 *
 * 干什么：管工程数据（轨道 / 片段 / 素材）、撤销重做、工程本地保存。
 * 依赖：pinia、Vue 3、lib/idb（素材落盘）、lib/waveform（波形峰值）
 * 输入：组件调用 CRUD；输出：响应式状态 + 历史栈 + localStorage 工程快照
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { putFile, delFile } from '../lib/idb'
import { computePeaks } from '../lib/waveform'
import type { Lut3D } from '../lib/lut'

export type TrackKind = 'video' | 'audio' | 'text'
export type AspectPreset = '16:9' | '9:16' | '1:1' | '4:3'

export interface Track {
  id: string
  kind: TrackKind
  name: string
  muted: boolean
  hidden: boolean
}

export interface Clip {
  id: string
  trackId: string
  kind: TrackKind
  name: string
  assetId: string | null
  start: number
  duration: number
  inPoint: number
  speed: number
  /** 变速关键帧：t = 片段内秒数（支持毫秒），v = 倍数；空数组 = 全程匀速 speed */
  speedPoints: { t: number; v: number }[]
  volume: number
  /* 文字片段 */
  text: string
  fontSize: number
  color: string
  strokeColor: string
  strokeWidth: number
  x: number          // 0~1，相对画面宽度
  y: number          // 0~1，相对画面高度
  align: 'left' | 'center' | 'right'
  /* 画面 */
  fadeIn: number
  fadeOut: number
  opacity: number

  /** 基础变换（关键帧为空时生效） */
  transform: { scale: number; x: number; y: number; rotation: number }
  /** 变换关键帧：t 片段内秒数，x/y 为相对画面宽高的偏移（-1~1） */
  kf: { t: number; scale: number; x: number; y: number; rotation: number; opacity: number }[]
  /** 音量关键帧：t 片段内秒数，v 倍数 */
  volumeKf: { t: number; v: number }[]
  /** 关键帧插值方式 */
  easing: 'linear' | 'in' | 'out' | 'inout'
  /** 入场转场 */
  trans: 'none' | 'fade' | 'black' | 'white' | 'wipeL' | 'wipeR' | 'slideUp' | 'zoom'
  transDur: number
  /** 音频处理（dB） */
  eqLow: number
  eqMid: number
  eqHigh: number
  compress: boolean
  /** 闪避角色：music = 被人声压低；voice = 触发压低 */
  duckRole: 'none' | 'music' | 'voice'
  /** 嵌套：来源序列 id（为空表示普通片段） */
  nestSeqId?: string | null
  /** 嵌套：来源序列名（给界面显示） */
  nestName?: string | null
  /** 多机位：所属机位组 id（为空表示普通片段） */
  mcId?: string | null
  /** 多机位切点：t 片段内秒数，angle 机位下标 */
  cuts?: { t: number; angle: number }[]
  /** 画面蒙版 */
  maskType: 'none' | 'rect' | 'ellipse'
  maskX: number
  maskY: number
  maskW: number
  maskH: number
}

export interface MediaAsset {
  id: string
  name: string
  url: string
  file: File
  kind: 'video' | 'audio'
  duration: number
  width: number
  height: number
  thumbs: string[]
  peaks: number[]
  /** 低清代理（剪辑预览用，导出仍用原片） */
  proxyUrl?: string | null
}

interface Snapshot {
  tracks: Track[]
  clips: Clip[]
  aspect: AspectPreset
}

const LS_KEY = 'fystudio.project.v1'
const uid = (p: string) => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)

/** 调色预设 → canvas filter 片段 */
export function presetFilter(p?: string): string {
  switch (p) {
    case 'cinema': return 'contrast(1.12) saturate(0.85) brightness(0.98)'
    case 'warm': return 'sepia(0.18) saturate(1.15) hue-rotate(-6deg)'
    case 'cool': return 'hue-rotate(10deg) saturate(0.92) brightness(1.02)'
    case 'bw': return 'grayscale(1) contrast(1.18)'
    case 'vintage': return 'sepia(0.38) contrast(0.95) saturate(0.8)'
    default: return ''
  }
}

export const ASPECTS: Record<AspectPreset, { w: number; h: number; label: string }> = {
  '16:9': { w: 1280, h: 720, label: '横屏 16:9' },
  '9:16': { w: 720, h: 1280, label: '竖屏 9:16' },
  '1:1': { w: 1080, h: 1080, label: '方形 1:1' },
  '4:3': { w: 960, h: 720, label: '传统 4:3' },
}

/* ---------------- 变速曲线（毫秒精度关键帧 + 线性插值） ---------------- */

export interface SpeedPoint { t: number; v: number }

/** 片段内某时刻的倍数；没有关键帧就返回固定 speed */
export function speedAt(c: Clip, local: number): number {
  const pts = c.speedPoints
  if (!pts || pts.length === 0) return c.speed
  if (pts.length === 1) return pts[0].v
  if (local <= pts[0].t) return pts[0].v
  const last = pts[pts.length - 1]
  if (local >= last.t) return last.v
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1]
    if (local >= a.t && local <= b.t) {
      const span = Math.max(1e-6, b.t - a.t)
      return a.v + (b.v - a.v) * ((local - a.t) / span)
    }
  }
  return c.speed
}

/** 从片段开头到 local 秒，源素材走过的长度（对速度曲线积分，10ms 步长梯形法） */
export function sourceOffset(c: Clip, local: number): number {
  if (!c.speedPoints || c.speedPoints.length === 0) return local * c.speed
  if (local <= 0) return 0
  const steps = Math.min(4000, Math.max(16, Math.ceil(local * 100)))
  const dt = local / steps
  let sum = 0
  let prev = speedAt(c, 0)
  for (let i = 1; i <= steps; i++) {
    const v = speedAt(c, i * dt)
    sum += (prev + v) / 2 * dt
    prev = v
  }
  return sum
}

/* ---------------- 变换 / 音量关键帧 ---------------- */

export interface TransformState { scale: number; x: number; y: number; rotation: number; opacity: number }

function lerp(a: number, b: number, k: number) { return a + (b - a) * k }

export function easeK(k: number, easing: Clip['easing']): number {
  const x = Math.max(0, Math.min(1, k))
  switch (easing) {
    case 'in': return x * x
    case 'out': return 1 - (1 - x) * (1 - x)
    case 'inout': return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2
    default: return x
  }
}

/** 片段内某时刻的变换（关键帧线性插值；无关键帧用基础值） */
export function transformAt(c: Clip, local: number): TransformState {
  const base: TransformState = {
    scale: c.transform?.scale ?? 1,
    x: c.transform?.x ?? 0,
    y: c.transform?.y ?? 0,
    rotation: c.transform?.rotation ?? 0,
    opacity: c.opacity,
  }
  const pts = c.kf
  if (!pts || pts.length === 0) return base
  if (pts.length === 1) return { ...pts[0], opacity: pts[0].opacity ?? 1 }
  if (local <= pts[0].t) return { ...pts[0] }
  const last = pts[pts.length - 1]
  if (local >= last.t) return { ...last }
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1]
    if (local >= a.t && local <= b.t) {
      const k = easeK((local - a.t) / Math.max(1e-6, b.t - a.t), c.easing || 'linear')
      return {
        scale: lerp(a.scale, b.scale, k),
        x: lerp(a.x, b.x, k),
        y: lerp(a.y, b.y, k),
        rotation: lerp(a.rotation, b.rotation, k),
        opacity: lerp(a.opacity ?? 1, b.opacity ?? 1, k),
      }
    }
  }
  return base
}

/** 片段内某时刻的音量倍数（音量关键帧插值） */
export function volumeAt(c: Clip, local: number): number {
  const pts = c.volumeKf
  if (!pts || pts.length === 0) return c.volume
  if (pts.length === 1) return pts[0].v
  if (local <= pts[0].t) return pts[0].v
  const last = pts[pts.length - 1]
  if (local >= last.t) return last.v
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1]
    if (local >= a.t && local <= b.t) {
      const k = easeK((local - a.t) / Math.max(1e-6, b.t - a.t), c.easing || 'linear')
      return lerp(a.v, b.v, k)
    }
  }
  return c.volume
}

/** 时间轴 local 秒 → 源素材时间 */
export function sourceTimeAt(c: Clip, local: number): number {
  return c.inPoint + sourceOffset(c, Math.max(0, local))
}

export const useProjectStore = defineStore('project', () => {
  const tracks = ref<Track[]>([])
  const clips = ref<Clip[]>([])
  const assets = ref<MediaAsset[]>([])
  const selectedId = ref<string | null>(null)
  const playhead = ref(0)
  const pixelsPerSecond = ref(60)
  const aspect = ref<AspectPreset>('16:9')
  const fps = ref(30)
  /* 全局调色（预览与导出共用） */
  const grading = ref({
    brightness: 1, contrast: 1, saturation: 1,
    preset: 'none' as 'none' | 'cinema' | 'warm' | 'cool' | 'bw' | 'vintage',
  })
  /** 序列容器：一个工程可以有多条序列（嵌套的地基） */
  const sequences = ref<{ id: string; name: string; tracks: Track[]; clips: Clip[] }[]>([])
  const activeSeqId = ref('')
  /** 进入嵌套时的返回栈（序列 id） */
  const navStack = ref<string[]>([])
  const markers = ref<number[]>([])
  const proxyEnabled = ref(false)
  const multicamGroups = ref<{ id: string; name: string; angles: string[] }[]>([])
  const markIn = ref<number | null>(null)
  const markOut = ref<number | null>(null)
  const lut = ref<Lut3D | null>(null)
  const lutEnabled = ref(false)
  const projectName = ref('未命名工程')
  const savedAt = ref(0)

  const past = ref<Snapshot[]>([])
  const future = ref<Snapshot[]>([])
  const HIST_MAX = 60
  let restoring = false

  const canUndo = computed(() => past.value.length > 0)
  const canRedo = computed(() => future.value.length > 0)

  const canvasSize = computed(() => ASPECTS[aspect.value])

  const contentDuration = computed(() => {
    if (!clips.value.length) return 0
    return Math.max(...clips.value.map(c => c.start + c.duration))
  })

  const totalDuration = computed(() => Math.max(30, Math.ceil(contentDuration.value + 10)))

  const selected = computed(() => clips.value.find(c => c.id === selectedId.value) ?? null)

  /* ---------------- 历史 ---------------- */

  function snap(): Snapshot {
    return JSON.parse(JSON.stringify({
      tracks: tracks.value,
      clips: clips.value,
      aspect: aspect.value,
    }))
  }

  function pushHistory() {
    if (restoring) return
    past.value.push(snap())
    if (past.value.length > HIST_MAX) past.value.shift()
    future.value = []
  }

  function restore(s: Snapshot) {
    restoring = true
    tracks.value = JSON.parse(JSON.stringify(s.tracks))
    clips.value = JSON.parse(JSON.stringify(s.clips))
    aspect.value = s.aspect
    if (selectedId.value && !clips.value.some(c => c.id === selectedId.value)) selectedId.value = null
    restoring = false
  }

  function undo() {
    const s = past.value.pop()
    if (!s) return
    future.value.push(snap())
    restore(s)
  }

  function redo() {
    const s = future.value.pop()
    if (!s) return
    past.value.push(snap())
    restore(s)
  }

  /* ---------------- 轨道 ---------------- */

  function defaultTracks(): Track[] {
    return [
      { id: uid('t'), kind: 'video', name: '视频 1', muted: false, hidden: false },
      { id: uid('t'), kind: 'audio', name: '音频 1', muted: false, hidden: false },
      { id: uid('t'), kind: 'text', name: '字幕', muted: false, hidden: false },
    ]
  }

  function ensureDefaultTracks() {
    if (!tracks.value.length) tracks.value = defaultTracks()
    if (!sequences.value.length) {
      const id = uid('sq')
      activeSeqId.value = id
      sequences.value = [{ id, name: '序列 1', tracks: clone(tracks.value), clips: clone(clips.value) }]
    } else if (!activeSeqId.value) {
      activeSeqId.value = sequences.value[0].id
    }
  }

  /** 深拷贝（快照用，避免引用串味） */
  function clone<T>(v: T): T { return JSON.parse(JSON.stringify(v)) }

  /** 把当前时间轴内容写回它所属的序列 */
  function syncActiveSequence() {
    const s = sequences.value.find(x => x.id === activeSeqId.value)
    if (!s) return
    s.tracks = clone(tracks.value)
    s.clips = clone(clips.value)
  }

  /** 切换序列（先保存当前，再载入目标） */
  function switchSequence(id: string) {
    if (!id || id === activeSeqId.value) return
    syncActiveSequence()
    const s = sequences.value.find(x => x.id === id)
    if (!s) return
    activeSeqId.value = id
    tracks.value = clone(s.tracks)
    clips.value = clone(s.clips)
    selectedId.value = null
    playhead.value = 0
  }

  /** 新建空序列并切过去 */
  function createSequence(name?: string) {
    syncActiveSequence()
    const id = uid('sq')
    const seq = {
      id,
      name: name || `序列 ${sequences.value.length + 1}`,
      tracks: defaultTracks(),
      clips: [],
    }
    sequences.value.push(seq)
    switchSequence(id)
    return id
  }

  /** 进入子序列（记住返回路径） */
  function enterSequence(id: string) {
    if (!id || id === activeSeqId.value) return false
    const target = sequences.value.find(x => x.id === id)
    if (!target) return false
    navStack.value.push(activeSeqId.value)
    switchSequence(id)
    return true
  }

  /** 返回上一级序列 */
  function backSequence() {
    const prev = navStack.value.pop()
    if (prev) switchSequence(prev)
    return !!prev
  }

  function renameSequence(id: string, name: string) {
    const s = sequences.value.find(x => x.id === id)
    if (s && name.trim()) s.name = name.trim()
  }

  function removeSequence(id: string) {
    if (sequences.value.length <= 1) return false
    sequences.value = sequences.value.filter(x => x.id !== id)
    if (activeSeqId.value === id) {
      const first = sequences.value[0]
      activeSeqId.value = ''
      switchSequence(first.id)
    }
    return true
  }

  function addTrack(kind: TrackKind) {
    pushHistory()
    const n = tracks.value.filter(t => t.kind === kind).length + 1
    const name = kind === 'video' ? `视频 ${n}` : kind === 'audio' ? `音频 ${n}` : `字幕 ${n}`
    const t: Track = { id: uid('t'), kind, name, muted: false, hidden: false }
    tracks.value.push(t)
    return t
  }

  function removeTrack(id: string) {
    const t = tracks.value.find(x => x.id === id)
    if (!t) return
    if (tracks.value.filter(x => x.kind === t.kind).length <= 1) return   // 每种至少留一条
    pushHistory()
    tracks.value = tracks.value.filter(x => x.id !== id)
    clips.value = clips.value.filter(c => c.trackId !== id)
  }

  function toggleMute(id: string) {
    const t = tracks.value.find(x => x.id === id)
    if (t) t.muted = !t.muted
  }

  function toggleHidden(id: string) {
    const t = tracks.value.find(x => x.id === id)
    if (t) t.hidden = !t.hidden
  }

  /* ---------------- 素材 ---------------- */

  /** 设定/清除某素材的代理文件（存 IndexedDB，刷新还能用） */
  async function setAssetProxy(id: string, blob: Blob | null) {
    const a = assets.value.find(x => x.id === id)
    if (!a) return
    if (a.proxyUrl) { URL.revokeObjectURL(a.proxyUrl); a.proxyUrl = null }
    if (!blob) {
      delFile('proxy:' + id).catch(() => {})
      return
    }
    a.proxyUrl = URL.createObjectURL(blob)
    try { await putFile('proxy:' + id, blob) } catch { /* 存不下也能用当前会话 */ }
  }

  /** 当前素材应该用哪个 URL 预览 */
  function previewUrlOf(a: { url: string; proxyUrl?: string | null } | null | undefined) {
    if (!a) return ''
    return proxyEnabled.value && a.proxyUrl ? a.proxyUrl : a.url
  }

  async function addAsset(a: Omit<MediaAsset, 'id' | 'peaks'>) {
    const id = uid('a')
    const asset: MediaAsset = { ...a, id, peaks: [] }
    assets.value.push(asset)
    // 落盘：文件存 IndexedDB，工程重开还能找回
    putFile(id, a.file).catch(() => {})
    // 波形：后台算，算完再塞回去（不阻塞导入）
    // 注意：必须通过 assets.value 里的 proxy 赋值，直接改上面的 raw 对象
    // Vue 收不到通知，波形会一直不画（2026-11-03 修）
    computePeaks(a.file, 4000)
      .then(p => {
        const target = assets.value.find(x => x.id === id)
        if (target) target.peaks = p
      })
      .catch(() => {})
    return asset
  }

  function removeAsset(id: string) {
    const asset = assets.value.find(a => a.id === id)
    if (!asset) return
    pushHistory()
    assets.value = assets.value.filter(a => a.id !== id)
    clips.value = clips.value.filter(c => c.assetId !== id)
    delFile(id).catch(() => {})
    URL.revokeObjectURL(asset.url)
  }

  function assetById(id: string | null) {
    if (!id) return null
    return assets.value.find(a => a.id === id) ?? null
  }

  /* ---------------- 片段 ---------------- */

  function defaultClip(partial: Partial<Clip> & { trackId: string; kind: TrackKind }): Clip {
    return {
      id: uid('c'),
      name: '片段',
      assetId: null,
      start: 0,
      duration: 5,
      inPoint: 0,
      speed: 1,
      speedPoints: [],
      volume: 1,
      text: '',
      fontSize: 48,
      color: '#ffffff',
      strokeColor: '#000000',
      strokeWidth: 4,
      x: 0.5,
      y: 0.82,
      align: 'center',
      fadeIn: 0,
      fadeOut: 0,
      opacity: 1,
      transform: { scale: 1, x: 0, y: 0, rotation: 0 },
      kf: [],
      volumeKf: [],
      easing: 'linear',
      trans: 'none',
      transDur: 0.6,
      eqLow: 0,
      eqMid: 0,
      eqHigh: 0,
      compress: false,
      duckRole: 'none',
      maskType: 'none',
      maskX: 0.5,
      maskY: 0.5,
      maskW: 0.6,
      maskH: 0.6,
      ...partial,
    } as Clip
  }

  function addClip(clip: Omit<Clip, 'id'>) {
    pushHistory()
    const c = { ...clip, id: uid('c') }
    clips.value.push(c)
    selectedId.value = c.id
    return c.id
  }

  function addAssetClip(assetId: string, trackId: string, start: number) {
    const a = assetById(assetId)
    if (!a) return null
    return addClip(defaultClip({
      trackId,
      kind: a.kind,
      name: a.name,
      assetId,
      start,
      duration: a.duration,
    }))
  }

  /** 由 SRT 导入的字幕片段：指定起止与文字 */
  function addSubtitleClip(start: number, duration: number, text: string) {
    ensureDefaultTracks()
    const t = tracks.value.find(x => x.kind === 'text')
    if (!t) return null
    return addClip(defaultClip({
      trackId: t.id, kind: 'text', name: '字幕', text,
      start, duration: Math.max(0.2, duration),
    }))
  }

  function addTextClip(start: number, trackId?: string) {
    const t = trackId || tracks.value.find(x => x.kind === 'text')?.id
    if (!t) return null
    return addClip(defaultClip({
      trackId: t,
      kind: 'text',
      name: '文字',
      text: '双击编辑文字',
      start,
      duration: 4,
    }))
  }

  /** 导入素材：视频自动拆成「视频轨画面 + 音频轨声音」两条 */
  function importAssetSplit(assetId: string, start?: number) {
    const a = assetById(assetId)
    if (!a) return []
    ensureDefaultTracks()
    const vTrack = tracks.value.find(t => t.kind === (a.kind === 'video' ? 'video' : 'audio'))
    const aTrack = tracks.value.find(t => t.kind === 'audio')
    const at = start ?? playhead.value
    const ids: string[] = []

    if (a.kind === 'video' && vTrack) {
      ids.push(addClip(defaultClip({
        trackId: vTrack.id, kind: 'video', name: a.name, assetId, start: at, duration: a.duration,
      })))
    }
    if (aTrack) {
      ids.push(addClip(defaultClip({
        trackId: aTrack.id, kind: 'audio', name: a.name.replace(/\.[^.]+$/, '') + ' · 声音',
        assetId, start: at, duration: a.duration,
      })))
    }
    return ids
  }

  /** 普通版：只放一条视频片段（声音跟随画面） */
  function addVideoClip(assetId: string, start?: number) {
    const a = assetById(assetId)
    if (!a) return null
    ensureDefaultTracks()
    const t = tracks.value.find(x => x.kind === 'video')
    if (!t) return null
    return addClip(defaultClip({
      trackId: t.id, kind: 'video', name: a.name, assetId,
      start: start ?? playhead.value, duration: a.duration,
    }))
  }

  /** 单独把某个视频素材的声音提取到音频轨（放在播放头处） */
  function extractAudio(assetId: string, start?: number) {
    const a = assetById(assetId)
    if (!a) return null
    ensureDefaultTracks()
    const t = tracks.value.find(x => x.kind === 'audio')
    if (!t) return null
    return addClip(defaultClip({
      trackId: t.id, kind: 'audio',
      name: a.name.replace(/\.[^.]+$/, '') + ' · 提取音频',
      assetId, start: start ?? playhead.value, duration: a.duration,
    }))
  }

  /** 找同素材、同起点的另一条（视频 ↔ 音频配对） */
  function counterpartOf(clip: Clip) {
    return clips.value.find(c =>
      c.id !== clip.id && c.assetId === clip.assetId &&
      Math.abs(c.start - clip.start) < 1e-6 && c.kind !== clip.kind
    ) ?? null
  }

  /** 只留画面：删掉配对的声音 */
  function keepOnlyVideo(clip: Clip) {
    const other = counterpartOf(clip)
    if (other && other.kind === 'audio') removeClip(other.id)
  }

  /** 只留声音：删掉配对的画面 */
  function keepOnlyAudio(clip: Clip) {
    const other = counterpartOf(clip)
    if (other && other.kind === 'video') removeClip(other.id)
  }

  function setTransform(id: string, patch: Partial<TransformState>) {
    const c = clips.value.find(x => x.id === id)
    if (!c) return
    c.transform = { ...(c.transform || { scale: 1, x: 0, y: 0, rotation: 0 }), ...patch }
  }

  function setKeyframes(id: string, kf: Clip['kf']) {
    const c = clips.value.find(x => x.id === id)
    if (!c) return
    c.kf = [...kf].sort((a, b) => a.t - b.t)
  }

  function setVolumeKeyframes(id: string, pts: Clip['volumeKf']) {
    const c = clips.value.find(x => x.id === id)
    if (!c) return
    c.volumeKf = [...pts].sort((a, b) => a.t - b.t)
  }

  function setSpeedPoints(id: string, pts: SpeedPoint[]) {
    const c = clips.value.find(x => x.id === id)
    if (!c) return
    c.speedPoints = [...pts].sort((a, b) => a.t - b.t)
  }

  function updateClip(id: string, patch: Partial<Clip>) {
    const c = clips.value.find(x => x.id === id)
    if (!c) return
    Object.assign(c, patch)
  }

  function removeClip(id: string) {
    pushHistory()
    clips.value = clips.value.filter(c => c.id !== id)
    if (selectedId.value === id) selectedId.value = null
  }

  function moveClip(id: string, start: number) {
    const c = clips.value.find(x => x.id === id)
    if (!c) return
    c.start = Math.max(0, start)
  }

  function trimClip(id: string, side: 'left' | 'right', deltaSec: number) {
    const c = clips.value.find(x => x.id === id)
    if (!c) return
    if (side === 'left') {
      const d = Math.min(deltaSec, c.duration - 0.2)
      if (c.start + d < 0) return
      c.start += d
      c.inPoint += d
      c.duration -= d
    } else {
      const d = Math.max(deltaSec, -(c.duration - 0.2))
      c.duration += d
    }
  }

  function splitClip(id: string, time: number): string | null {
    const c = clips.value.find(x => x.id === id)
    if (!c) return null
    const offset = time - c.start
    if (offset <= 0.05 || offset >= c.duration - 0.05) return null

    pushHistory()
    const right = {
      ...c,
      id: uid('c'),
      start: time,
      duration: c.duration - offset,
      inPoint: c.inPoint + offset,
    }
    c.duration = offset
    clips.value.push(right)
    selectedId.value = right.id
    return right.id
  }

  /* ---------------- 多机位 ---------------- */

  function createMulticam(assetIds: string[], name?: string) {
    if (assetIds.length < 2) return null
    const g = {
      id: 'mc' + Date.now().toString(36),
      name: name || `机位组 ${multicamGroups.value.length + 1}`,
      angles: [...assetIds],
    }
    multicamGroups.value.push(g)
    return g
  }

  function addMulticamClip(groupId: string, start?: number) {
    const g = multicamGroups.value.find(x => x.id === groupId)
    if (!g) return null
    ensureDefaultTracks()
    const track = tracks.value.find(t => t.kind === 'video')
    if (!track) return null
    const durations = g.angles
      .map(id => assetById(id)?.duration ?? 0)
      .filter(d => d > 0)
    const dur = durations.length ? Math.min(...durations) : 10
    return addClip(defaultClip({
      trackId: track.id, kind: 'video', name: g.name, assetId: null,
      start: start ?? playhead.value, duration: dur,
      mcId: g.id, cuts: [{ t: 0, angle: 0 }],
    }))
  }

  /** 在片段内 local 秒处切换机位 */
  function addMulticamCut(clipId: string, local: number, angle: number) {
    const c = clips.value.find(x => x.id === clipId)
    if (!c || !c.mcId) return
    const cuts = (c.cuts || []).filter(p => Math.abs(p.t - local) > 0.05)
    cuts.push({ t: Math.max(0, +local.toFixed(3)), angle })
    cuts.sort((a, b) => a.t - b.t)
    c.cuts = cuts
  }

  /** 片段内某时刻应该用第几号机位 */
  function angleAtClip(c: Clip, local: number): number {
    if (!c.cuts || !c.cuts.length) return 0
    let idx = c.cuts[0].angle
    for (const cut of c.cuts) {
      if (cut.t <= local + 1e-6) idx = cut.angle
      else break
    }
    return idx
  }

  /** 解析片段当前应该用哪个素材（多机位会按切点切换） */
  function assetForClip(c: Clip, local: number): MediaAsset | null {
    if (c.mcId) {
      const g = multicamGroups.value.find(x => x.id === c.mcId)
      if (!g) return null
      const idx = Math.min(g.angles.length - 1, Math.max(0, angleAtClip(c, local)))
      return assetById(g.angles[idx])
    }
    return assetById(c.assetId)
  }

  /** 插入编辑：在 time 处腾出 len 秒，后面的片段整体右移 */
  function rippleInsert(trackId: string, time: number, len: number) {
    pushHistory()
    clips.value.forEach(c => {
      if (c.trackId === trackId && c.start >= time - 1e-6) c.start += len
    })
  }

  /** 滑动编辑（slip）：起点/时长不动，只改源素材入点 */
  function slipClip(id: string, deltaSec: number) {
    const c = clips.value.find(x => x.id === id)
    if (!c) return
    const a = assetById(c.assetId)
    const maxIn = a ? Math.max(0, a.duration - c.duration) : Infinity
    c.inPoint = Math.min(maxIn, Math.max(0, c.inPoint + deltaSec))
  }

  /** 滚动编辑（roll）：只动与下一段的接点，前段变长、后段反向变短 */
  function rollEdit(id: string, deltaSec: number): boolean {
    const c = clips.value.find(x => x.id === id)
    if (!c) return false
    const next = clips.value
      .filter(x => x.trackId === c.trackId && x.id !== c.id &&
        Math.abs(x.start - (c.start + c.duration)) < 1e-6)
      .sort((a, b) => a.start - b.start)[0]
    if (!next) return false
    const maxOut = Math.min(c.duration - 0.2, next.duration - 0.2)
    const d = Math.max(-maxOut, Math.min(deltaSec, maxOut))
    if (!d) return false
    pushHistory()
    c.duration += d
    next.start += d
    next.inPoint = Math.max(0, next.inPoint + d)
    next.duration -= d
    return true
  }

  function removeClipRipple(id: string) {
    const c = clips.value.find(x => x.id === id)
    if (!c) return
    pushHistory()
    const gapStart = c.start
    const gapLen = c.duration
    clips.value = clips.value.filter(x => x.id !== id)
    clips.value.forEach(x => {
      if (x.trackId === c.trackId && x.start >= gapStart + gapLen - 1e-6) {
        x.start = Math.max(0, x.start - gapLen)
      }
    })
    selectedId.value = null
  }

  function splitAtPlayhead(): string | null {
    const c = clipAt(playhead.value)
    if (!c) return null
    return splitClip(c.id, playhead.value)
  }

  function setIn(t?: number) {
    const v = +(t ?? playhead.value).toFixed(3)
    markIn.value = v
    if (markOut.value !== null && markOut.value <= v) markOut.value = null
  }

  function setOut(t?: number) {
    const v = +(t ?? playhead.value).toFixed(3)
    if (markIn.value !== null && v <= markIn.value) return
    markOut.value = v
  }

  function clearMarks() { markIn.value = null; markOut.value = null }

  /** 三点编辑：把素材按入/出点插入到播放头，后面的片段整体右移 */
  function insertAssetAtPlayhead(assetId: string) {
    const a = assetById(assetId)
    if (!a) return null
    ensureDefaultTracks()
    const inSec = Math.max(0, markIn.value ?? 0)
    const outSec = Math.min(a.duration, markOut.value ?? a.duration)
    const dur = Math.max(0.2, outSec - inSec)
    const t = playhead.value

    const created: string[] = []
    const vTrack = tracks.value.find(x => x.kind === (a.kind === 'video' ? 'video' : 'audio'))
    const aTrack = tracks.value.find(x => x.kind === 'audio')

    if (vTrack) {
      rippleInsert(vTrack.id, t, dur)
      created.push(addClip(defaultClip({
        trackId: vTrack.id, kind: a.kind, name: a.name, assetId,
        start: t, duration: dur, inPoint: inSec,
      })))
    }
    if (a.kind === 'video' && aTrack) {
      rippleInsert(aTrack.id, t, dur)
      created.push(addClip(defaultClip({
        trackId: aTrack.id, kind: 'audio', name: a.name, assetId,
        start: t, duration: dur, inPoint: inSec,
      })))
    }
    clearMarks()
    return created
  }

  function addMarker(t?: number) {
    const v = +(t ?? playhead.value).toFixed(3)
    if (!markers.value.some(m => Math.abs(m - v) < 0.01)) {
      markers.value = [...markers.value, v].sort((a, b) => a - b)
    }
  }

  function removeMarker(t: number) {
    markers.value = markers.value.filter(m => Math.abs(m - t) > 0.01)
  }

  function clearMarkers() { markers.value = [] }

  function seek(t: number) {
    playhead.value = Math.max(0, Math.min(t, contentDuration.value || 30))
  }

  function clipAt(t: number) {
    return clips.value.find(c => t >= c.start && t < c.start + c.duration) ?? null
  }

  /* 播放时：每轨取当前片段（视频取最上面一条可见轨） */
  function activeClipsAt(t: number) {
    const out: Clip[] = []
    for (const tr of tracks.value) {
      if (tr.hidden) continue
      const c = clips.value
        .filter(x => x.trackId === tr.id && t >= x.start && t < x.start + x.duration)
        .sort((a, b) => b.start - a.start)[0]
      if (c) out.push(c)
    }
    return out
  }

  /** 所有人声片段占据的时间区间（给闪避用） */
  function voiceIntervals() {
    return clips.value
      .filter(c => c.duckRole === 'voice')
      .map(c => ({ start: c.start, end: c.start + c.duration }))
      .sort((a, b) => a.start - b.start)
  }

  function trackOf(clip: Clip) {
    return tracks.value.find(t => t.id === clip.trackId)
  }

  /* ---------------- 工程保存 ---------------- */

  function serialize() {
    syncActiveSequence()
    return {
      v: 1,
      sequences: sequences.value,
      activeSeqId: activeSeqId.value,
      name: projectName.value,
      aspect: aspect.value,
      fps: fps.value,
      grading: grading.value,
      markers: markers.value,
      tracks: tracks.value,
      clips: clips.value,
      assets: assets.value.map(a => ({
        id: a.id, name: a.name, kind: a.kind,
        duration: a.duration, width: a.width, height: a.height, thumbs: a.thumbs,
      })),
      savedAt: Date.now(),
    }
  }

  /** 给打包/互通用的工程快照 */
  function getProjectJson() {
    syncActiveSequence()
    return serialize()
  }

  function saveProject(silent = true) {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(serialize()))
      savedAt.value = Date.now()
      if (!silent) return true
      return true
    } catch {
      return false
    }
  }

  function hasSavedProject() {
    return !!localStorage.getItem(LS_KEY)
  }

  /** 返回 true 表示恢复成功；素材文件从 IndexedDB 按 id 取回 */
  async function loadProject(): Promise<boolean> {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return false
    let data: any
    try { data = JSON.parse(raw) } catch { return false }

    restoring = true
    projectName.value = data.name || '未命名工程'
    aspect.value = data.aspect || '16:9'
    fps.value = data.fps || 30
    if (data.grading) grading.value = { brightness: 1, contrast: 1, saturation: 1, ...data.grading }
    markers.value = Array.isArray(data.markers) ? data.markers : []
    tracks.value = data.tracks || []
    clips.value = data.clips || []
    if (Array.isArray(data.sequences) && data.sequences.length) {
      sequences.value = data.sequences
      activeSeqId.value = data.activeSeqId || data.sequences[0].id
      const act = data.sequences.find((x: any) => x.id === activeSeqId.value) || data.sequences[0]
      tracks.value = clone(act.tracks || [])
      clips.value = clone(act.clips || [])
    } else {
      sequences.value = []
      activeSeqId.value = ''
      ensureDefaultTracks()
      syncActiveSequence()
    }
    assets.value = []
    past.value = []
    future.value = []

    const { getFile } = await import('../lib/idb')
    for (const a of data.assets || []) {
      const blob = await getFile(a.id).catch(() => null)
      if (!blob) continue
      const file = new File([blob], a.name, { type: blob.type })
      const asset: MediaAsset = {
        id: a.id, name: a.name, kind: a.kind,
        duration: a.duration, width: a.width, height: a.height,
        thumbs: a.thumbs || [],
        url: URL.createObjectURL(file),
        file,
        peaks: [],
      }
      assets.value.push(asset)
      computePeaks(file, 4000).then(p => { asset.peaks = p }).catch(() => {})
      getFile('proxy:' + a.id).then(pb => {
        if (pb) asset.proxyUrl = URL.createObjectURL(pb)
      }).catch(() => {})
    }
    restoring = false
    return true
  }

  function newProject() {
    pushHistory()
    projectName.value = '未命名工程'
    sequences.value = []
    activeSeqId.value = ''
    tracks.value = []
    clips.value = []
    assets.value.forEach(a => URL.revokeObjectURL(a.url))
    assets.value = []
    selectedId.value = null
    playhead.value = 0
    aspect.value = '16:9'
    ensureDefaultTracks()
    past.value = []
    future.value = []
  }

  return {
    tracks, clips, assets, selectedId, playhead, pixelsPerSecond, aspect, fps, grading, markers, lut, lutEnabled, proxyEnabled, multicamGroups, sequences, activeSeqId, navStack, markIn, markOut, projectName, savedAt,
    past, future, canUndo, canRedo, canvasSize, contentDuration, totalDuration, selected,
    pushHistory, undo, redo,
    ensureDefaultTracks, addTrack, removeTrack, toggleMute, toggleHidden,
    addAsset, removeAsset, assetById, setAssetProxy, previewUrlOf,
    createMulticam, addMulticamClip, addMulticamCut, angleAtClip, assetForClip,
    syncActiveSequence, switchSequence, createSequence, renameSequence, removeSequence,
    enterSequence, backSequence,
    addClip, addAssetClip, addVideoClip, importAssetSplit, extractAudio,
    counterpartOf, keepOnlyVideo, keepOnlyAudio, setSpeedPoints,
    setTransform, setKeyframes, setVolumeKeyframes,
    addSubtitleClip, addTextClip, updateClip, removeClip, removeClipRipple,
    moveClip, trimClip, splitClip, splitAtPlayhead, rippleInsert, slipClip, rollEdit,
    addMarker, removeMarker, clearMarkers, setIn, setOut, clearMarks, insertAssetAtPlayhead,
    seek, clipAt, activeClipsAt, trackOf, voiceIntervals,
    getProjectJson, saveProject, loadProject, hasSavedProject, newProject,
  }
})
