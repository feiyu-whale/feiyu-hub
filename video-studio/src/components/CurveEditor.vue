<script setup lang="ts">
/**
 * CurveEditor.vue —— 关键帧曲线编辑器
 * 干什么：把片段的变换/音量/速度关键帧画成曲线，支持拖动、双击加点、右键删点。
 * 依赖：Vue 3、Pinia store、Canvas 2D
 * 输入：当前选中片段；输出：直接改 store 里的关键帧数组（可撤销）
 */
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useProjectStore } from '../stores/project'
import type { Clip } from '../stores/project'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ (e: 'close'): void }>()

const store = useProjectStore()
const canvasEl = ref<HTMLCanvasElement | null>(null)
const kind = ref<'scale' | 'opacity' | 'volume' | 'speed'>('scale')

const KINDS = [
  { v: 'scale', n: '缩放', min: 0.1, max: 3 },
  { v: 'opacity', n: '不透明度', min: 0, max: 1 },
  { v: 'volume', n: '音量', min: 0, max: 2 },
  { v: 'speed', n: '速度', min: 0.25, max: 4 },
] as const

const clip = computed<Clip | null>(() => store.selected)
const range = computed(() => KINDS.find(k => k.v === kind.value)!)

interface Pt { t: number; v: number; idx: number }

function points(): Pt[] {
  const c = clip.value
  if (!c) return []
  if (kind.value === 'volume') return c.volumeKf.map((p, i) => ({ t: p.t, v: p.v, idx: i }))
  if (kind.value === 'speed') return c.speedPoints.map((p, i) => ({ t: p.t, v: p.v, idx: i }))
  if (kind.value === 'opacity') return c.kf.map((p, i) => ({ t: p.t, v: p.opacity ?? 1, idx: i }))
  return c.kf.map((p, i) => ({ t: p.t, v: p.scale, idx: i }))
}

function writePoints(pts: { t: number; v: number }[]) {
  const c = clip.value
  if (!c) return
  if (kind.value === 'volume') {
    store.setVolumeKeyframes(c.id, pts.map(p => ({ t: +p.t.toFixed(3), v: +p.v.toFixed(3) })))
  } else if (kind.value === 'speed') {
    store.setSpeedPoints(c.id, pts.map(p => ({ t: +p.t.toFixed(3), v: +p.v.toFixed(3) })))
  } else {
    const kf = pts.map(p => {
      const base = c.kf.find(k => Math.abs(k.t - p.t) < 1e-6) || {
        t: p.t, scale: c.transform?.scale ?? 1, x: c.transform?.x ?? 0,
        y: c.transform?.y ?? 0, rotation: c.transform?.rotation ?? 0, opacity: c.opacity,
      }
      return kind.value === 'opacity'
        ? { ...base, t: +p.t.toFixed(3), opacity: +p.v.toFixed(3) }
        : { ...base, t: +p.t.toFixed(3), scale: +p.v.toFixed(3) }
    })
    store.setKeyframes(c.id, kf)
  }
}

/* ---------- 绘制 ---------- */
const PAD = 26

function draw() {
  const c = canvasEl.value
  const cl = clip.value
  if (!c || !cl) return
  const w = c.clientWidth
  const h = c.clientHeight
  const dpr = Math.min(2, window.devicePixelRatio || 1)
  if (c.width !== Math.round(w * dpr)) { c.width = Math.round(w * dpr); c.height = Math.round(h * dpr) }
  const g = c.getContext('2d')!
  g.setTransform(dpr, 0, 0, dpr, 0, 0)
  g.clearRect(0, 0, w, h)

  const { min, max } = range.value
  const X = (t: number) => PAD + (t / Math.max(0.001, cl.duration)) * (w - PAD * 2)
  const Y = (v: number) => h - PAD - ((v - min) / (max - min)) * (h - PAD * 2)

  // 网格
  g.strokeStyle = 'rgba(120,140,170,.18)'
  g.lineWidth = 1
  for (let i = 0; i <= 4; i++) {
    const y = PAD + ((h - PAD * 2) * i) / 4
    g.beginPath(); g.moveTo(PAD, y); g.lineTo(w - PAD, y); g.stroke()
  }

  const pts = points().sort((a, b) => a.t - b.t)
  if (!pts.length) {
    g.fillStyle = 'rgba(160,180,205,.6)'
    g.font = '12px sans-serif'
    g.fillText('双击曲线区添加关键帧', PAD + 8, h / 2)
  }

  // 曲线
  if (pts.length) {
    g.strokeStyle = '#4aa8ff'
    g.lineWidth = 2
    g.beginPath()
    pts.forEach((p, i) => {
      const x = X(p.t), y = Y(p.v)
      i ? g.lineTo(x, y) : g.moveTo(x, y)
    })
    g.stroke()

    pts.forEach(p => {
      g.fillStyle = '#0b1421'
      g.strokeStyle = '#4aa8ff'
      g.beginPath()
      g.arc(X(p.t), Y(p.v), 4.5, 0, Math.PI * 2)
      g.fill(); g.stroke()
    })
  }

  // 播放头
  g.strokeStyle = 'rgba(255,107,107,.8)'
  g.beginPath()
  g.moveTo(X(Math.min(cl.duration, Math.max(0, store.playhead - cl.start))), PAD)
  g.lineTo(X(Math.min(cl.duration, Math.max(0, store.playhead - cl.start))), h - PAD)
  g.stroke()
}

/* ---------- 交互 ---------- */
let dragging = -1

function toValues(e: MouseEvent) {
  const c = canvasEl.value!
  const cl = clip.value!
  const r = c.getBoundingClientRect()
  const w = r.width, h = r.height
  const { min, max } = range.value
  const t = Math.max(0, Math.min(cl.duration, ((e.clientX - r.left - PAD) / (w - PAD * 2)) * cl.duration))
  const v = Math.max(min, Math.min(max, min + ((h - PAD - (e.clientY - r.top)) / (h - PAD * 2)) * (max - min)))
  return { t, v }
}

function onDown(e: MouseEvent) {
  if (!clip.value) return
  const { t, v } = toValues(e)
  const pts = points().sort((a, b) => a.t - b.t)
  const hit = pts.findIndex(p => Math.abs(p.t - t) * 60 < 8 && Math.abs(p.v - v) < (range.value.max - range.value.min) * 0.08)
  if (e.button === 2) return
  store.pushHistory()
  if (hit >= 0) {
    dragging = hit
  } else {
    writePoints([...pts.map(p => ({ t: p.t, v: p.v })), { t, v }])
    dragging = points().length - 1
  }
  draw()
  window.addEventListener('pointermove', onMove)
  window.addEventListener('pointerup', onUp)
}

function onMove(e: PointerEvent | MouseEvent) {
  if (dragging < 0 || !clip.value) return
  const { t, v } = toValues(e)
  const pts = points().sort((a, b) => a.t - b.t)
  if (!pts[dragging]) return
  pts[dragging] = { ...pts[dragging], t, v }
  writePoints(pts.map(p => ({ t: p.t, v: p.v })))
  draw()
}

function onUp() {
  dragging = -1
  window.removeEventListener('pointermove', onMove)
  window.removeEventListener('pointerup', onUp)
}

function onContext(e: MouseEvent) {
  e.preventDefault()
  const cl = clip.value
  if (!cl) return
  const { t } = toValues(e)
  const pts = points().sort((a, b) => a.t - b.t)
  const idx = pts.findIndex(p => Math.abs(p.t - t) < Math.max(0.05, cl.duration * 0.02))
  if (idx >= 0) {
    store.pushHistory()
    writePoints(pts.filter((_, i) => i !== idx).map(p => ({ t: p.t, v: p.v })))
    draw()
  }
}

onMounted(() => { draw() })
onBeforeUnmount(onUp)
watch(() => [props.open, kind.value, store.selectedId, store.playhead, store.clips], () => {
  if (props.open) requestAnimationFrame(draw)
}, { deep: true })
</script>

<template>
  <div v-if="props.open" class="mask" @click.self="emit('close')">
    <div class="sheet">
      <header>
        <h3>关键帧曲线</h3>
        <div class="kinds">
          <button v-for="k in KINDS" :key="k.v" class="kchip"
                  :class="{ on: kind === k.v }" @click="kind = k.v as any">{{ k.n }}</button>
        </div>
        <button class="x" @click="emit('close')">✕</button>
      </header>

      <p class="hint">
        {{ clip ? `片段「${clip.name}」· 时长 ${clip.duration.toFixed(2)}s` : '先选中一个片段' }}
        · 双击空白处加点 · 拖动圆点调整 · 右键删点
      </p>

      <canvas ref="canvasEl" class="graph"
              @pointerdown="onDown"
              @dblclick="onDown"
              @contextmenu="onContext"></canvas>

      <footer>
        <button class="btn" @click="emit('close')">关闭</button>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.mask { position: fixed; inset: 0; background: rgba(0,0,0,.7); display: flex; align-items: center; justify-content: center; z-index: 120; padding: 16px; }
.sheet { width: 100%; max-width: 720px; background: var(--panel); border: 1px solid var(--line); border-radius: 14px; padding: 14px 16px; }
header { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
header h3 { margin: 0; font-size: 13px; }
.kinds { display: flex; gap: 5px; flex: 1; flex-wrap: wrap; }
.kchip { padding: 4px 9px; font-size: 10.5px; border-radius: 12px; background: #0b1421; border: 1px solid var(--line); color: var(--dim); }
.kchip.on { border-color: var(--acc); color: var(--acc); background: rgba(74,168,255,.12); }
.x { width: 24px; height: 24px; border-radius: 5px; background: transparent; color: var(--dim); }
.hint { font-size: 10.5px; color: var(--dim); margin: 8px 0; }
.graph { width: 100%; height: 260px; background: #060a12; border: 1px solid var(--line); border-radius: 8px; touch-action: none; display: block; }
footer { text-align: right; margin-top: 10px; }
.btn { padding: 7px 18px; font-size: 12px; border-radius: 7px; background: #0b1421; border: 1px solid var(--line); color: var(--dim); }
.btn:hover { border-color: var(--acc); color: var(--acc); }
</style>
