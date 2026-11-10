<script setup lang="ts">
/**
 * Timeline.vue —— 多轨道时间轴
 * 干什么：多条轨道（视频/音频/字幕）上摆放、拖动、裁剪、分割片段，画音频波形与转场。
 * 依赖：Vue 3 + Pinia store
 * 输入：store 里的 tracks/clips/assets；输出：指针交互 → store 修改（带撤销点）
 */
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useProjectStore } from '../stores/project'
import type { Clip } from '../stores/project'

const store = useProjectStore()
const scrollEl = ref<HTMLDivElement | null>(null)

const pps = computed(() => store.pixelsPerSecond)
const width = computed(() => Math.max(store.totalDuration * pps.value, 800))
const leftPad = 92
const ROW_H = 52
const ROW_GAP = 6

const tracksHeight = computed(() =>
  store.tracks.length * ROW_H + Math.max(0, store.tracks.length - 1) * ROW_GAP
)

const ticks = computed(() => {
  const out: { pos: number; label: string; major: boolean }[] = []
  const step = pps.value >= 80 ? 0.5 : pps.value >= 40 ? 1 : 2
  for (let t = 0; t <= store.totalDuration; t += step) {
    out.push({
      pos: t * pps.value,
      label: Number.isInteger(t) ? `${Math.floor(t / 60)}:${String(Math.round(t % 60)).padStart(2, '0')}` : '',
      major: Number.isInteger(t),
    })
  }
  return out
})

/* ---------------- 拖拽 ---------------- */
let dragging: {
  id: string
  mode: 'move' | 'left' | 'right'
  startX: number
  origStart: number
  origDur: number
  origIn: number
  origTrack: string
} | null = null

function onClipDown(e: PointerEvent, id: string, mode: 'move' | 'left' | 'right') {
  e.stopPropagation()
  e.preventDefault()
  const c = store.clips.find(x => x.id === id)
  if (!c) return
  store.selectedId = id
  store.pushHistory()
  dragging = {
    id, mode, startX: e.clientX,
    origStart: c.start, origDur: c.duration, origIn: c.inPoint, origTrack: c.trackId,
  }
  window.addEventListener('pointermove', onMove)
  window.addEventListener('pointerup', onUp)
}

function onMove(e: PointerEvent) {
  if (!dragging) return
  const dx = (e.clientX - dragging.startX) / pps.value
  const c = store.clips.find(x => x.id === dragging!.id)
  if (!c) return

  if (dragging.mode === 'move') {
    let ns = Math.max(0, dragging.origStart + dx)
    // 吸附：0 / 播放头 / 其他片段的首尾（阈值 8px）
    const th = 8 / pps.value
    const cands: number[] = [0, store.playhead]
    for (const o of store.clips) {
      if (o.id === c.id) continue
      cands.push(o.start, o.start + o.duration)
    }
    let bestAdj = 0
    let bestDelta = Infinity
    for (const cand of cands) {
      for (const edge of [0, c.duration]) {
        const d = Math.abs(ns + edge - cand)
        if (d < th && d < bestDelta) { bestDelta = d; bestAdj = cand - (ns + edge) }
      }
    }
    ns = Math.max(0, ns + bestAdj)
    c.start = ns
    // 上下拖：同类轨道之间换轨
    const rows = store.tracks
    const idx = rows.findIndex(t => t.id === c.trackId)
    const rowEl = scrollEl.value
    if (rowEl) {
      const y = e.clientY - rowEl.getBoundingClientRect().top + rowEl.scrollTop - 24
      const target = Math.floor(y / (ROW_H + ROW_GAP))
      if (target >= 0 && target < rows.length && rows[target].kind === c.kind) {
        c.trackId = rows[target].id
      } else if (idx >= 0) {
        c.trackId = dragging.origTrack
      }
    }
  } else if (dragging.mode === 'left') {
    const maxDelta = dragging.origDur - 0.2
    const d = Math.min(Math.max(dx, -dragging.origStart), maxDelta)
    c.start = dragging.origStart + d
    c.inPoint = dragging.origIn + d
    c.duration = dragging.origDur - d
  } else {
    const d = Math.max(dx, -(dragging.origDur - 0.2))
    c.duration = dragging.origDur + d
  }
}

function onUp() {
  dragging = null
  window.removeEventListener('pointermove', onMove)
  window.removeEventListener('pointerup', onUp)
}

/* ---------------- 定位 ---------------- */
function onTrackClick(e: PointerEvent) {
  const el = scrollEl.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  const x = e.clientX - rect.left + el.scrollLeft - leftPad
  if (x < 0) return
  store.seek(x / pps.value)
}

function zoom(dir: number) {
  const next = store.pixelsPerSecond * (dir > 0 ? 1.3 : 1 / 1.3)
  store.pixelsPerSecond = Math.min(300, Math.max(15, next))
}

/* ---------------- 工具栏 ---------------- */
const toast = ref('')
let toastTimer = 0
function flash(msg: string) {
  toast.value = msg
  clearTimeout(toastTimer)
  toastTimer = window.setTimeout(() => { toast.value = '' }, 1800)
}
function splitHere() {
  const id = store.splitAtPlayhead()
  flash(id ? '已分割' : '播放头不在片段上')
}
function deleteHere() {
  if (!store.selectedId) return
  store.removeClipRipple(store.selectedId)
  flash('已删除，后续片段前移')
}
function addText() {
  const t = store.addTextClip(store.playhead)
  flash(t ? '已加文字，右侧属性里改内容' : '没有字幕轨')
}

/* ---------------- 键盘 ---------------- */
function onKey(e: KeyboardEvent) {
  const tag = (e.target as HTMLElement)?.tagName
  if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return

  const mod = e.ctrlKey || e.metaKey
  if (mod && (e.key === 'z' || e.key === 'Z')) {
    e.preventDefault()
    e.shiftKey ? store.redo() : store.undo()
    return
  }
  if (mod && (e.key === 'y' || e.key === 'Y')) {
    e.preventDefault(); store.redo(); return
  }
  if (e.key === 'Delete' || e.key === 'Backspace') {
    if (store.selectedId) { e.preventDefault(); store.removeClip(store.selectedId) }
  }
  if (e.key === 's' || e.key === 'S') { e.preventDefault(); splitHere() }
  if (e.key === 't' || e.key === 'T') { e.preventDefault(); addText() }
  if (e.key === 'i' || e.key === 'I') { e.preventDefault(); store.setIn(store.playhead); flash('已设入点') }
  if (e.key === 'o' || e.key === 'O') { e.preventDefault(); store.setOut(store.playhead); flash('已设出点') }
  if (e.key === 'm' || e.key === 'M') { e.preventDefault(); store.addMarker(store.playhead); flash('已打标记') }
  if (e.key === '[') { e.preventDefault(); const p = [...store.markers].reverse().find(m => m < store.playhead - 0.01); if (p !== undefined) store.seek(p) }
  if (e.key === ']') { e.preventDefault(); const n = store.markers.find(m => m > store.playhead + 0.01); if (n !== undefined) store.seek(n) }
  if (e.key === ' ') e.preventDefault()
  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
    e.preventDefault()
    const stepv = e.shiftKey ? 1 : 1 / store.fps
    store.seek(store.playhead + (e.key === 'ArrowLeft' ? -stepv : stepv))
  }
}

onMounted(() => {
  store.ensureDefaultTracks()
  window.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  onUp()
})

const playheadX = computed(() => store.playhead * pps.value)

/* ---------------- 波形 ---------------- */
/** 波形路径缓存：key = 片段 id + 裁剪区间 + 像素宽，缩放/裁剪变了才重算 */
const waveCache = new Map<string, string>()

function wavePath(c: Clip): string {
  const a = store.assetById(c.assetId)
  if (!a || !a.peaks.length) return ''

  const pxW = Math.max(6, c.duration * pps.value)
  const key = `${c.id}|${c.inPoint.toFixed(2)}|${c.duration.toFixed(2)}|${Math.round(pxW)}`
  const cached = waveCache.get(key)
  if (cached !== undefined) return cached

  const peaks = a.peaks
  const dur = a.duration > 0.001 ? a.duration : c.duration
  // 片段在素材上的时间区间 → 峰值桶区间（裁剪后波形跟着偏移，不再从头画）
  const t0 = Math.max(0, Math.min(c.inPoint, dur))
  const t1 = Math.max(t0 + 0.001, Math.min(c.inPoint + c.duration, dur))
  const i0 = Math.floor((t0 / dur) * peaks.length)
  const i1 = Math.min(peaks.length, Math.ceil((t1 / dur) * peaks.length))
  const span = Math.max(1, i1 - i0)

  // 自适应点数：约每 1.5px 一个采样，夹在 40~480（放大不锯齿，缩小不浪费）
  const N = Math.max(40, Math.min(480, Math.round(pxW / 1.5)))
  const step = span / N

  const up: string[] = []
  const down: string[] = []
  for (let i = 0; i < N; i++) {
    const s = i0 + Math.floor(i * step)
    const e = Math.max(s + 1, i0 + Math.floor((i + 1) * step))
    let v = 0
    for (let j = s; j < e && j < peaks.length; j++) if (peaks[j] > v) v = peaks[j]
    const x = (i / Math.max(1, N - 1)) * 100
    up.push(`L ${x.toFixed(2)} ${(50 - v * 46).toFixed(2)}`)
    down.push(`L ${x.toFixed(2)} ${(50 + v * 46).toFixed(2)}`)
  }
  const d = `M 0 50 ${up.join(' ')} ${down.reverse().join(' ')} Z`
  if (waveCache.size > 400) waveCache.clear()
  waveCache.set(key, d)
  return d
}

function fadeStyle(c: Clip) {
  const w = Math.max(c.fadeIn, 0.0001) * pps.value
  const w2 = Math.max(c.fadeOut, 0.0001) * pps.value
  return {
    '--fin': (c.fadeIn > 0 ? w : 0) + 'px',
    '--fout': (c.fadeOut > 0 ? w2 : 0) + 'px',
  } as Record<string, string>
}
</script>

<template>
  <div class="timeline">
    <div class="tl-bar">
      <span class="ttl">时间轴</span>
      <button class="zbtn wide" title="在播放头处分割 (S)" @click="splitHere">✂</button>
      <button class="zbtn wide" title="删除选中并前移" :disabled="!store.selectedId" @click="deleteHere">🗑</button>
      <button class="zbtn wide" title="加文字 (T)" @click="addText">T</button>
      <button class="zbtn wide" title="打标记 (M)" @click="store.addMarker(store.playhead); flash('已打标记')">⚑</button>
      <span class="divider"></span>
      <button class="zbtn wide" title="撤销 Ctrl+Z" :disabled="!store.canUndo" @click="store.undo()">↶</button>
      <button class="zbtn wide" title="重做 Ctrl+Shift+Z" :disabled="!store.canRedo" @click="store.redo()">↷</button>
      <span class="divider"></span>
      <button class="zbtn" @click="zoom(-1)">−</button>
      <span class="zoomv">{{ Math.round(pps) }}px/s</span>
      <button class="zbtn" @click="zoom(1)">+</button>
    </div>

    <div class="scroller" ref="scrollEl">
      <div class="canvas" :style="{ width: width + leftPad + 'px' }">
        <div class="ruler" :style="{ paddingLeft: leftPad + 'px' }">
          <div class="ruler-inner" :style="{ width: width + 'px' }">
            <div v-if="store.markIn !== null" class="inmark" :style="{ left: store.markIn * pps + 'px' }" title="入点"></div>
            <div v-if="store.markOut !== null" class="outmark" :style="{ left: store.markOut * pps + 'px' }" title="出点"></div>
            <div v-if="store.markIn !== null && store.markOut !== null" class="range"
                 :style="{ left: store.markIn * pps + 'px', width: Math.max(0, (store.markOut - store.markIn) * pps) + 'px' }"></div>
            <div v-for="(m, mi) in store.markers" :key="'mk' + mi"
                 class="marker" :style="{ left: m * pps + 'px' }"
                 :title="`标记 ${m.toFixed(2)}s（点击跳转 / Alt+点击删除）`"
                 @click.stop="($event.altKey ? store.removeMarker(m) : store.seek(m))"></div>
            <div v-for="(t, i) in ticks" :key="i"
                 class="tick" :class="{ major: t.major }"
                 :style="{ left: t.pos + 'px' }">
              <span v-if="t.label">{{ t.label }}</span>
            </div>
          </div>
        </div>

        <div class="tracks" :style="{ height: tracksHeight + 'px', paddingLeft: leftPad + 'px' }">
          <div
            v-for="(tr, ti) in store.tracks"
            :key="tr.id"
            class="row"
            :style="{ top: ti * (ROW_H + ROW_GAP) + 'px', height: ROW_H + 'px' }"
          >
            <div class="gutter">
              <span class="gi">{{ tr.kind === 'video' ? '🎬' : tr.kind === 'audio' ? '🎵' : '🅣' }}</span>
              <span class="gn" :title="tr.name">{{ tr.name }}</span>
              <button class="tiny" :class="{ on: tr.muted }" title="静音" @click.stop="store.toggleMute(tr.id)">M</button>
              <button class="tiny" :class="{ on: tr.hidden }" title="隐藏" @click.stop="store.toggleHidden(tr.id)">
                {{ tr.hidden ? '🚫' : '👁' }}
              </button>
            </div>

            <div class="body" :style="{ width: width + 'px' }" @pointerdown="onTrackClick">
              <div
                v-for="c in store.clips.filter(x => x.trackId === tr.id)"
                :key="c.id"
                class="clip"
                :class="[c.kind, { sel: c.id === store.selectedId }]"
                :style="{ left: c.start * pps + 'px', width: Math.max(6, c.duration * pps) + 'px', ...fadeStyle(c) }"
                @pointerdown="onClipDown($event, c.id, 'move')"
                @dblclick.stop="c.nestSeqId && store.enterSequence(c.nestSeqId)"
              >
                <svg v-if="c.kind !== 'text' && store.assetById(c.assetId)?.peaks.length"
                     class="wave" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path :d="wavePath(c)" />
                </svg>
                <div class="clip-label">
                  <span v-if="c.kind === 'text'">🅣 {{ c.text || c.name }}</span>
                  <span v-else-if="c.nestSeqId">📚 {{ c.nestName || c.name }}</span>
                  <span v-else>{{ c.name }}</span>
                </div>
                <div class="clip-dur">
                  {{ c.duration.toFixed(1) }}s
                  <span v-if="c.speedPoints && c.speedPoints.length" class="spd">⏩{{ c.speedPoints.length }}帧</span>
                </div>
                <div class="handle l" @pointerdown="onClipDown($event, c.id, 'left')"></div>
                <div class="handle r" @pointerdown="onClipDown($event, c.id, 'right')"></div>
              </div>

              <div v-if="ti === 0" class="playhead" :style="{ left: playheadX + 'px' }">
                <div class="head"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="addbar">
      <button class="add" @click="store.addTrack('video')">+ 视频轨</button>
      <button class="add" @click="store.addTrack('audio')">+ 音频轨</button>
      <button class="add" @click="store.addTrack('text')">+ 字幕轨</button>
    </div>

    <transition name="fade">
      <div v-if="toast" class="toast">{{ toast }}</div>
    </transition>
  </div>
</template>

<style scoped>
.timeline {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
  flex: 1;
  min-height: 210px;
}
.tl-bar { display: flex; align-items: center; gap: 6px; padding: 7px 12px; border-bottom: 1px solid var(--line); background: var(--panel2); }
.ttl { font-size: 11.5px; color: var(--acc); font-weight: 600; margin-right: 4px; }
.divider { width: 1px; height: 14px; background: var(--line); margin: 0 4px; }
.zbtn { width: 22px; height: 22px; border-radius: 5px; background: #0b1421; border: 1px solid var(--line); color: var(--dim); font-size: 13px; line-height: 1; display: flex; align-items: center; justify-content: center; }
.zbtn:active { border-color: var(--acc); color: var(--acc); }
.zbtn:disabled { opacity: .35; }
.zbtn.wide { width: 26px; font-size: 12px; }
.zbtn.wide:hover:not(:disabled) { border-color: var(--acc); color: var(--acc); }
.zoomv { font-size: 10px; color: var(--dim); font-variant-numeric: tabular-nums; min-width: 46px; text-align: center; }

.scroller { flex: 1; overflow: auto; position: relative; }
.canvas { position: relative; min-height: 100%; }

.ruler { height: 22px; background: var(--panel2); border-bottom: 1px solid var(--line); position: sticky; top: 0; z-index: 5; }
.ruler-inner { position: relative; height: 100%; }
.tick { position: absolute; top: 0; bottom: 0; width: 1px; background: rgba(123,139,163,.18); }
.tick.major { background: rgba(123,139,163,.42); }
.inmark { position: absolute; top: 0; bottom: 0; width: 2px; background: #3ddc97; z-index: 7; }
.outmark { position: absolute; top: 0; bottom: 0; width: 2px; background: #ffc456; z-index: 7; }
.range { position: absolute; top: 0; bottom: 0; background: rgba(61,220,151,.14); border-left: 1px solid rgba(61,220,151,.35); border-right: 1px solid rgba(255,196,86,.35); z-index: 4; pointer-events: none; }
.marker {
  position: absolute; top: 0; bottom: 0; width: 2px;
  background: #ffc456; z-index: 6; cursor: pointer;
}
.marker::after {
  content: ''; position: absolute; top: 0; left: -3px;
  border-left: 4px solid transparent; border-right: 4px solid transparent;
  border-top: 6px solid #ffc456;
}
.tick span { position: absolute; left: 3px; top: 4px; font-size: 9px; color: var(--dim); font-variant-numeric: tabular-nums; white-space: nowrap; }

.tracks { position: relative; padding-top: 6px; }
.row { position: absolute; left: 0; right: 0; }
.gutter {
  position: absolute; left: 0; top: 0; bottom: 0; width: 92px;
  display: flex; align-items: center; gap: 4px; padding: 0 6px;
  background: var(--panel2); border-right: 1px solid var(--line);
  border-radius: 0 6px 6px 0; z-index: 3;
}
.gi { font-size: 12px; }
.gn { font-size: 10px; color: var(--dim); flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tiny { width: 16px; height: 16px; border-radius: 3px; background: #0b1421; color: #6b7d95; font-size: 8px; border: 1px solid var(--line); padding: 0; line-height: 1; }
.tiny.on { color: var(--danger); border-color: rgba(255,107,107,.5); }

.body { position: relative; height: 100%; margin-left: 92px; }
.clip {
  position: absolute; top: 0; height: 100%;
  border-radius: 6px; overflow: hidden;
  background: linear-gradient(135deg, rgba(74,168,255,.32), rgba(125,92,255,.26));
  border: 1px solid rgba(74,168,255,.45);
  cursor: grab; user-select: none; touch-action: none;
  display: flex; flex-direction: column; justify-content: center;
  padding: 0 8px;
}
.clip.audio { background: linear-gradient(135deg, rgba(61,220,151,.26), rgba(74,168,255,.20)); border-color: rgba(61,220,151,.4); }
.clip.text { background: linear-gradient(135deg, rgba(255,196,86,.26), rgba(255,107,107,.18)); border-color: rgba(255,196,86,.45); }
.clip.sel { border-color: var(--acc); box-shadow: 0 0 0 1px var(--acc), 0 0 12px rgba(74,168,255,.35); }
.clip:active { cursor: grabbing; }
.clip-label { font-size: 10.5px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; position: relative; z-index: 2; }
.clip-dur { font-size: 9px; color: rgba(219,231,245,.6); margin-top: 1px; position: relative; z-index: 2; }
.spd { margin-left: 5px; color: #ffc456; }
.wave { position: absolute; inset: 0; width: 100%; height: 100%; opacity: .45; z-index: 1; }
.wave path { fill: rgba(255,255,255,.55); }

.clip::before, .clip::after { content: ''; position: absolute; top: 0; bottom: 0; z-index: 3; pointer-events: none; }
.clip::before { left: 0; width: var(--fin, 0); background: linear-gradient(90deg, rgba(6,10,18,.85), transparent); }
.clip::after { right: 0; width: var(--fout, 0); background: linear-gradient(270deg, rgba(6,10,18,.85), transparent); }

.handle { position: absolute; top: 0; bottom: 0; width: 8px; cursor: ew-resize; background: rgba(74,168,255,.001); z-index: 4; }
.handle.l { left: 0; }
.handle.r { right: 0; }
.handle:hover { background: rgba(74,168,255,.35); }

.playhead { position: absolute; top: -28px; bottom: 0; width: 1px; background: var(--danger); pointer-events: none; z-index: 20; }
.playhead .head { position: absolute; top: 0; left: -4px; width: 9px; height: 9px; background: var(--danger); border-radius: 2px; }

.addbar { display: flex; gap: 6px; padding: 6px 12px; border-top: 1px solid var(--line); background: var(--panel2); }
.add { font-size: 10px; padding: 4px 9px; border-radius: 5px; background: #0b1421; border: 1px solid var(--line); color: var(--dim); }
.add:hover { border-color: var(--acc); color: var(--acc); }

.toast { position: absolute; bottom: 44px; left: 50%; transform: translateX(-50%); padding: 5px 14px; font-size: 11px; border-radius: 20px; background: rgba(6,10,18,.92); border: 1px solid var(--line); color: var(--acc); pointer-events: none; z-index: 30; }
.fade-enter-active, .fade-leave-active { transition: opacity .25s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
