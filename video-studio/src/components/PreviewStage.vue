<script setup lang="ts">
/**
 * PreviewStage.vue —— 预览舞台
 * 干什么：按时间轴当前时间，把多条视频轨合成到 canvas，再盖上文字层，带调色与淡入淡出。
 * 依赖：Vue 3、Pinia store、原生 <video>/canvas
 * 输入：store.tracks/clips/assets/playhead/canvasSize；输出：画面
 */
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useProjectStore } from '../stores/project'
import type { Clip } from '../stores/project'
import { sourceTimeAt, transformAt, presetFilter } from '../stores/project'
import { applyLut } from '../lib/lutRenderer'

const store = useProjectStore()
const canvasEl = ref<HTMLCanvasElement | null>(null)

const videos = new Map<string, HTMLVideoElement>()
let raf = 0
let dirty = true

const empty = computed(() => !store.assets.length)
const hasClipNow = computed(() => store.activeClipsAt(store.playhead).length > 0)

function ensureVideo(asset: { id: string; url: string; kind: string } | null): HTMLVideoElement | null {
  if (!asset || asset.kind !== 'video') return null
  let v = videos.get(asset.id)
  if (!v) {
    v = document.createElement('video')
    v.src = store.previewUrlOf(asset)
    v.preload = 'auto'
    v.muted = true
    v.playsInline = true
    v.addEventListener('seeked', () => { dirty = true })
    v.addEventListener('loadeddata', () => { dirty = true })
    videos.set(asset.id, v)
    v.load()
  }
  return v
}


function transAlpha(c: Clip, local: number): number {
  if (!c.trans || c.trans === 'none' || !c.transDur) return 0
  if (local < 0 || local > c.transDur) return 0
  return 1 - local / c.transDur
}

function alphaOf(c: Clip, t: number) {
  const local = t - c.start
  let a = c.opacity
  if (c.fadeIn > 0 && local < c.fadeIn) a *= local / c.fadeIn
  if (c.fadeOut > 0 && local > c.duration - c.fadeOut) a *= Math.max(0, (c.duration - local) / c.fadeOut)
  return Math.max(0, Math.min(1, a))
}

/** 以原点为中心绘制（配合 translate/scale/rotate 用） */
function drawCenter(g: CanvasRenderingContext2D, src: HTMLVideoElement, cw: number, ch: number) {
  const sw = src.videoWidth, sh = src.videoHeight
  if (!sw || !sh) return
  const scale = Math.max(cw / sw, ch / sh)
  const dw = sw * scale, dh = sh * scale
  g.drawImage(src, -dw / 2, -dh / 2, dw, dh)
}

function wrap(g: CanvasRenderingContext2D, text: string, maxWidth: number) {
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

function render() {
  const c = canvasEl.value
  if (!c) return
  const { w, h } = store.canvasSize
  if (c.width !== w || c.height !== h) { c.width = w; c.height = h }

  const g = c.getContext('2d')!
  g.setTransform(1, 0, 0, 1, 0, 0)
  g.filter = 'none'
  g.globalAlpha = 1
  g.fillStyle = '#000'
  g.fillRect(0, 0, w, h)

  const t = store.playhead
  const gr = store.grading
  const trackOrder = new Map(store.tracks.map((tr, i) => [tr.id, i]))
  const actives = store.clips
    .filter(cl => t >= cl.start && t < cl.start + cl.duration)
    .sort((a, b) => (trackOrder.get(a.trackId) ?? 0) - (trackOrder.get(b.trackId) ?? 0))

  // 视频层（带全局调色）
  g.filter = `brightness(${gr.brightness}) contrast(${gr.contrast}) saturate(${gr.saturation}) ${presetFilter((gr as any).preset)}`
  for (const cl of actives) {
    if (cl.kind === 'text' || cl.kind === 'audio') continue
    const tr = store.tracks.find(x => x.id === cl.trackId)
    if (tr?.hidden) continue
    const v = ensureVideo(store.assetForClip(cl, t - cl.start))
    if (!v) continue
    const want = Math.max(0, sourceTimeAt(cl, t - cl.start))
    if (Math.abs(v.currentTime - want) > 0.05) {
      try { v.currentTime = want } catch { /* 忽略 seek 竞态 */ }
    }
    if (!v.videoWidth) continue
    const tf = transformAt(cl, t - cl.start)
    g.globalAlpha = alphaOf(cl, t) * (tf.opacity ?? 1)
    g.save()
    // 入场转场（擦除/上滑/缩放）
    const tp = (cl.transDur && cl.transDur > 0) ? Math.min(1, Math.max(0, (t - cl.start) / cl.transDur)) : 1
    if (cl.trans === 'wipeL' && tp < 1) { g.beginPath(); g.rect(0, 0, w * tp, h); g.clip() }
    else if (cl.trans === 'wipeR' && tp < 1) { g.beginPath(); g.rect(w * (1 - tp), 0, w * tp, h); g.clip() }
    else if (cl.trans === 'slideUp' && tp < 1) { g.translate(0, h * (1 - tp)) }
    else if (cl.trans === 'zoom' && tp < 1) { const k = 1.25 - 0.25 * tp; g.translate(w / 2, h / 2); g.scale(k, k); g.translate(-w / 2, -h / 2) }
    if (cl.maskType && cl.maskType !== 'none') {
      const mw = w * (cl.maskW ?? 0.6)
      const mh = h * (cl.maskH ?? 0.6)
      const mx = w * (cl.maskX ?? 0.5) - mw / 2
      const my = h * (cl.maskY ?? 0.5) - mh / 2
      g.beginPath()
      if (cl.maskType === 'ellipse') g.ellipse(w * cl.maskX, h * cl.maskY, mw / 2, mh / 2, 0, 0, Math.PI * 2)
      else g.rect(mx, my, mw, mh)
      g.clip()
    }
    g.translate(w / 2 + tf.x * w, h / 2 + tf.y * h)
    g.rotate((tf.rotation * Math.PI) / 180)
    g.scale(tf.scale, tf.scale)
    drawCenter(g, v, w, h)
    g.restore()
  }

  // 3D LUT（整帧调色，字幕不受影响）
  if (store.lutEnabled && store.lut) applyLut(g, store.lut)

  // 转场覆盖（黑场 / 白场）
  for (const cl of actives) {
    if (cl.trans !== 'black' && cl.trans !== 'white') continue
    const ta = transAlpha(cl, t - cl.start)
    if (ta <= 0) continue
    g.globalAlpha = ta
    g.fillStyle = cl.trans === 'black' ? '#000' : '#fff'
    g.fillRect(0, 0, w, h)
  }

  // 文字层（不跟着调色走，保证字幕颜色干净）
  g.filter = 'none'
  for (const cl of actives) {
    if (cl.kind !== 'text') continue
    const tr = store.tracks.find(x => x.id === cl.trackId)
    if (tr?.hidden) continue
    const px = Math.max(8, Math.round(cl.fontSize * (h / 720)))
    g.globalAlpha = alphaOf(cl, t)
    g.font = `700 ${px}px "PingFang SC","Microsoft YaHei",sans-serif`
    g.textAlign = cl.align
    g.textBaseline = 'middle'
    g.lineJoin = 'round'
    const lines = wrap(g, cl.text || cl.name, w * 0.9)
    const lh = px * 1.3
    const cx = w * cl.x
    const startY = h * cl.y - ((lines.length - 1) * lh) / 2
    lines.forEach((ln, i) => {
      const y = startY + i * lh
      if (cl.strokeWidth > 0) {
        g.strokeStyle = cl.strokeColor
        g.lineWidth = cl.strokeWidth * (h / 720)
        g.strokeText(ln, cx, y)
      }
      g.fillStyle = cl.color
      g.fillText(ln, cx, y)
    })
  }

  g.globalAlpha = 1
}

function loop() {
  if (dirty) { render(); dirty = false }
  raf = requestAnimationFrame(loop)
}

/* 预加载当前时间附近用到的视频元素 */
function primeVideos() {
  const t = store.playhead
  for (const cl of store.clips) {
    if (cl.kind !== 'video') continue
    if (!(t >= cl.start - 1 && t < cl.start + cl.duration + 1)) continue
    ensureVideo(store.assetForClip(cl, Math.max(0, t - cl.start)))
  }
}

watch(() => store.playhead, () => { dirty = true })
watch(() => [store.clips.length, store.tracks.length, store.aspect], () => { dirty = true; primeVideos() })
watch(() => store.selectedId, () => { dirty = true })
// 片段任何属性（蒙版/转场/缓动/音量…）变化都要重绘
watch(() => store.clips, () => { dirty = true }, { deep: true })
watch(() => store.grading, () => { dirty = true }, { deep: true })
watch(() => [store.lutEnabled, store.lut], () => { dirty = true })
// 切换代理：重建视频元素，重新指向代理/原片
watch(() => store.proxyEnabled, () => {
  videos.forEach(v => { v.pause(); v.removeAttribute('src'); v.load() })
  videos.clear()
  primeVideos()
  dirty = true
})

onMounted(() => {
  primeVideos()
  raf = requestAnimationFrame(loop)
  nextTick(() => { dirty = true })
})
onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  videos.forEach(v => { v.pause(); v.removeAttribute('src'); v.load() })
  videos.clear()
})
</script>

<template>
  <div class="preview">
    <div class="frame" :style="{ aspectRatio: `${store.canvasSize.w} / ${store.canvasSize.h}` }">
      <canvas ref="canvasEl"></canvas>
    </div>

    <div v-if="empty" class="ph">
      <div class="big">🎞️</div>
      <p>拖入视频开始剪辑</p>
      <small>文件不会离开你的电脑</small>
    </div>
    <div v-else-if="!hasClipNow" class="ph dim">
      <div class="big">⏸</div>
      <p>这个时间点没有画面</p>
    </div>

    <div class="badge">
      <span class="dot"></span>
      {{ store.canvasSize.label }}
    </div>
  </div>
</template>

<style scoped>
.preview {
  flex: 1; min-height: 200px; background: #060a12;
  border: 1px solid var(--line); border-radius: 10px;
  position: relative; overflow: hidden;
  display: flex; align-items: center; justify-content: center;
  padding: 8px;
}
.frame {
  max-width: 100%; max-height: 100%; width: 100%;
  display: flex; align-items: center; justify-content: center;
}
.frame canvas {
  width: 100%; height: 100%; object-fit: contain;
  max-width: 100%; max-height: 100%;
  border-radius: 6px; background: #000;
  display: block; margin: auto;
}
.ph { position: absolute; text-align: center; color: var(--dim); pointer-events: none; }
.ph.dim { opacity: .45; }
.ph .big { font-size: 34px; margin-bottom: 8px; }
.ph p { margin: 0 0 4px; font-size: 12.5px; }
.ph small { font-size: 10px; opacity: .7; }

.badge {
  position: absolute; top: 10px; left: 10px;
  display: flex; align-items: center; gap: 5px;
  padding: 3px 9px; font-size: 10px; border-radius: 20px;
  background: rgba(6,10,18,.8); border: 1px solid var(--line);
  color: var(--dim); backdrop-filter: blur(6px);
}
.badge .dot { width: 5px; height: 5px; border-radius: 50%; background: var(--ok); box-shadow: 0 0 6px var(--ok); }
</style>
