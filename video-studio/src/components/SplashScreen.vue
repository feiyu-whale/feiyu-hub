<script setup lang="ts">
/**
 * SplashScreen.vue —— 开屏壁纸
 *
 * 干什么：进入专业版时放一段动态背景（WebGL 流体模拟，MIT 开源库 webgl-fluid），约 2.2 秒后淡出。
 * 依赖：webgl-fluid（MIT，220KB，无素材依赖）；WebGL 不可用时自动降级为 Canvas2D 气泡动画
 * 输入：无；输出：全屏覆盖层，点击/按键可跳过
 */

import { ref, onMounted, onBeforeUnmount } from 'vue'

const emit = defineEmits<{ (e: 'done'): void }>()

const canvasEl = ref<HTMLCanvasElement | null>(null)
const fading = ref(false)
const mode = ref<'fluid' | 'fallback'>('fluid')

let stopped = false
let raf = 0
let timer = 0
const DURATION = 2200

/* ---------------- 降级：Canvas2D 气泡 ---------------- */
function runFallback() {
  const c = canvasEl.value
  if (!c) return
  const ctx = c.getContext('2d')
  if (!ctx) return
  const dpr = Math.min(2, window.devicePixelRatio || 1)
  const resize = () => {
    const w = c.clientWidth, h = c.clientHeight
    c.width = Math.round(w * dpr); c.height = Math.round(h * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }
  resize()

  const bubbles = Array.from({ length: 46 }, () => ({
    x: Math.random() * c.clientWidth,
    y: c.clientHeight + Math.random() * c.clientHeight,
    r: 1.5 + Math.random() * 5,
    vy: 0.35 + Math.random() * 1.1,
    a: 0.08 + Math.random() * 0.3,
  }))

  const t0 = performance.now()
  const frame = (now: number) => {
    if (stopped) return
    const w = c.clientWidth, h = c.clientHeight
    const g = ctx.createLinearGradient(0, 0, w * 0.4, h)
    g.addColorStop(0, '#050b16'); g.addColorStop(0.55, '#081426'); g.addColorStop(1, '#0a1a2f')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
    for (const b of bubbles) {
      b.y -= b.vy
      b.x += Math.sin(now / 900 + b.y * 0.01) * 0.25
      if (b.y < -10) { b.y = h + 10; b.x = Math.random() * w }
      ctx.beginPath()
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(160,210,255,${b.a})`
      ctx.fill()
    }
    if (now - t0 > DURATION) { finish(); return }
    raf = requestAnimationFrame(frame)
  }
  raf = requestAnimationFrame(frame)
}

/* ---------------- 主：WebGL 流体 ---------------- */
async function runFluid() {
  const c = canvasEl.value
  if (!c) return
  try {
    const mod: any = await import('webgl-fluid')
    const WebGLFluid = mod.default || mod
    WebGLFluid(c, {
      TRIGGER: 'hover',
      IMMEDIATE: true,
      AUTO: true,
      INTERVAL: 900,
      SPLAT_COUNT: 8,
      SPLAT_RADIUS: 0.3,
      SPLAT_FORCE: 5500,
      DENSITY_DISSIPATION: 1.4,
      VELOCITY_DISSIPATION: 0.5,
      CURL: 26,
      SHADING: true,
      COLORFUL: true,
      COLOR_UPDATE_SPEED: 8,
      BLOOM: true,
      TRANSPARENT: false,
      BACK_COLOR: { r: 5, g: 11, b: 22 },
    })
    mode.value = 'fluid'
  } catch {
    mode.value = 'fallback'
    runFallback()
  }
}

function finish() {
  if (stopped) return
  stopped = true
  cancelAnimationFrame(raf)
  clearTimeout(timer)
  fading.value = true
  setTimeout(() => emit('done'), 420)
}

function skip() { finish() }

onMounted(() => {
  timer = window.setTimeout(finish, DURATION)
  runFluid()
  window.addEventListener('pointerdown', skip, { once: true })
  window.addEventListener('keydown', skip, { once: true })
})

onBeforeUnmount(() => {
  stopped = true
  cancelAnimationFrame(raf)
  clearTimeout(timer)
  window.removeEventListener('pointerdown', skip)
  window.removeEventListener('keydown', skip)
})
</script>

<template>
  <div class="splash" :class="{ fade: fading }">
    <canvas ref="canvasEl" class="bg"></canvas>
    <div class="title">
      <div class="logo">🐳</div>
      <h1>肥鱼剪辑台</h1>
      <p>纯前端剪辑 · 文件不出本机</p>
    </div>
    <div class="traffic-warn">
      ⚠️ 本产品比较耗费流量<br>
      <span>没有 Wi-Fi 请勿使用，起步就会烧掉 1~2GB</span>
    </div>
    <div class="hint">点任意处跳过</div>
  </div>
</template>

<style scoped>
.splash {
  position: fixed;
  inset: 0;
  z-index: 300;
  background: #050b16;
  transition: opacity .4s ease;
  opacity: 1;
}
.splash.fade { opacity: 0; pointer-events: none; }
.bg { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }

.title {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  animation: rise .9s ease both;
}
.logo { font-size: 40px; margin-bottom: 8px; filter: drop-shadow(0 0 18px rgba(74,168,255,.55)); }
.title h1 {
  margin: 0;
  font-size: clamp(22px, 4.2vw, 38px);
  letter-spacing: 2px;
  color: #eaf4ff;
  text-shadow: 0 0 24px rgba(74,168,255,.45);
}
.title p {
  margin: 8px 0 0;
  font-size: clamp(10px, 1.4vw, 13px);
  color: #86a9cc;
  letter-spacing: 1px;
}
@keyframes rise {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: none; }
}
.hint {
  position: absolute;
  bottom: 22px;
  width: 100%;
  text-align: center;
  font-size: 11px;
  color: rgba(160,190,220,.45);
  letter-spacing: 1px;
}
/* 流量警告（v1.23.2）：开屏必看，避免无 WiFi 时莫名烧掉几个 G */
.traffic-warn {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, calc(-50% + 120px));
  padding: 12px 20px;
  border-radius: 12px;
  background: rgba(120, 40, 20, .55);
  border: 1px solid rgba(255, 140, 90, .55);
  backdrop-filter: blur(6px);
  text-align: center;
  font-size: clamp(12px, 1.9vw, 15px);
  font-weight: 700;
  color: #ffd9c2;
  line-height: 1.75;
  letter-spacing: .5px;
  max-width: 90vw;
  animation: rise .5s .35s both;
}
.traffic-warn span {
  display: inline-block;
  margin-top: 2px;
  font-size: .86em;
  font-weight: 400;
  color: #ffb894;
}
@media (max-height: 520px) and (orientation: landscape) {
  .traffic-warn { transform: translate(-50%, calc(-50% + 90px)); padding: 8px 14px; }
}
</style>
