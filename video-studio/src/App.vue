<script setup lang="ts">
/**
 * App.vue —— 剪辑台外壳
 * 干什么：顶栏（新建/保存/打开/导出）、预览 + 播放控制、时间轴、自动保存、撤销重做快捷键。
 * 依赖：Vue 3、Pinia store、子组件
 * 输入：用户操作；输出：界面 + 工程状态（自动存 localStorage）
 */
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useProjectStore } from './stores/project'
import Timeline from './components/Timeline.vue'
import MediaPanel from './components/MediaPanel.vue'
import PreviewStage from './components/PreviewStage.vue'
import ExportDialog from './components/ExportDialog.vue'
import Inspector from './components/Inspector.vue'
import SplashScreen from './components/SplashScreen.vue'
import { isNative } from './lib/nativeSave'
import * as previewAudio from './lib/previewAudio'

const native = isNative()

const VERSION = 'v1.24.0-加定位提示 20261105'
const store = useProjectStore()

const exportOpen = ref(false)
const splash = ref(false)
const playing = ref(false)
const playRate = ref(1)
const savedFlash = ref('')
let rafId = 0
let lastTs = 0
let saveTimer = 0

const sel = computed(() => store.selected)

function tick(ts: number) {
  if (!playing.value) return
  if (lastTs) {
    const dt = (ts - lastTs) / 1000
    const next = store.playhead + dt * playRate.value
    if (next >= store.contentDuration) {
      store.seek(store.contentDuration)
      stop()
      return
    }
    store.seek(next)
    // 音频跟随：偏差过大时重排，避免长时间播放漂移
    previewAudio.sync(next, store.clips, store.tracks, store.assets, playRate.value, false)
  }
  lastTs = ts
  rafId = requestAnimationFrame(tick)
}
function stop() {
  playing.value = false
  playRate.value = 1
  cancelAnimationFrame(rafId)
  lastTs = 0
  previewAudio.stop()
}
function togglePlay() {
  if (!store.clips.length) return
  if (playing.value) { stop(); return }
  playRate.value = 1
  if (store.playhead >= store.contentDuration) store.seek(0)
  playing.value = true
  lastTs = 0
  // 从当前播放头开始排音频（专业版：声音走独立音频轨）
  void previewAudio.start(store.clips, store.tracks, store.assets, store.playhead, 1, false)
  rafId = requestAnimationFrame(tick)
}
function fmtTime(s: number) {
  const fps = store.fps || 30
  const total = Math.max(0, s)
  const hh = Math.floor(total / 3600)
  const mm = Math.floor((total % 3600) / 60)
  const ss = Math.floor(total % 60)
  const ff = Math.floor((total % 1) * fps)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${p(hh)}:${p(mm)}:${p(ss)}:${p(ff)}`
}
function skipTo(edge: 'start' | 'end') {
  store.seek(edge === 'start' ? 0 : store.contentDuration)
}

/* 保存 / 打开 / 新建 */
function doSave() {
  const ok = store.saveProject(false)
  savedFlash.value = ok ? '已保存到本机' : '保存失败（存储空间不足？）'
  setTimeout(() => { savedFlash.value = '' }, 1800)
}
async function doOpen() {
  const ok = await store.loadProject()
  savedFlash.value = ok ? '已载入上次工程' : '没有找到保存的工程'
  setTimeout(() => { savedFlash.value = '' }, 1800)
}
function doNew() {
  if (!confirm('新建会清空当前时间轴（已保存的工程文件不影响），继续？')) return
  stop()
  store.newProject()
}

/* 自动保存（防抖 1.2s） */
watch(
  () => [store.clips, store.tracks, store.aspect, store.fps, store.grading, store.projectName],
  () => {
    clearTimeout(saveTimer)
    saveTimer = window.setTimeout(() => store.saveProject(true), 1200)
  },
  { deep: true }
)

function onJkl(e: KeyboardEvent) {
  const tag = (e.target as HTMLElement)?.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
  if (e.ctrlKey || e.metaKey) return
  const k = e.key.toLowerCase()
  if (k === 'k') { e.preventDefault(); stop() }
  else if (k === 'l') {
    e.preventDefault()
    if (!playing.value) { togglePlay(); playRate.value = 1 }
    else playRate.value = Math.min(4, playRate.value * 2)
  } else if (k === 'j') {
    e.preventDefault()
    stop()
    store.seek(store.playhead - 1)
  }
}

// ---- 手机竖屏提示 + 一键横屏（v1.23.1）----
// 只在小屏触屏设备、且处于竖屏时出现；桌面完全不受影响。
const showRotateTip = ref(false)
const tipDismissed = ref(false)

function isNarrowTouch(): boolean {
  if (typeof window === 'undefined') return false
  const narrow = Math.min(window.innerWidth, window.innerHeight) < 820
  const touch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  return narrow && touch
}

function updateRotateTip() {
  if (tipDismissed.value) { showRotateTip.value = false; return }
  const portrait = window.innerHeight > window.innerWidth
  showRotateTip.value = isNarrowTouch() && portrait
}

async function goLandscape() {
  const el: any = document.documentElement
  try {
    if (el.requestFullscreen) await el.requestFullscreen()
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen()
  } catch { /* 用户拒绝全屏也继续试横屏 */ }
  try {
    const so: any = (screen as any).orientation
    if (so && typeof so.lock === 'function') await so.lock('landscape')
  } catch { /* iOS 不支持锁横屏，靠用户自己转 */ }
  tipDismissed.value = true
  showRotateTip.value = false
}

function dismissRotateTip() {
  tipDismissed.value = true
  showRotateTip.value = false
}

onMounted(async () => {
  // 开屏：每次会话放一次（刷新不重复骚扰）
  try {
    if (!sessionStorage.getItem('fy-splash-shown')) {
      splash.value = true
      sessionStorage.setItem('fy-splash-shown', '1')
    }
  } catch { splash.value = true }
  window.addEventListener('keydown', onJkl)
  // v1.23.1：监听屏幕尺寸/旋转变化，决定竖屏提示条显不显
  updateRotateTip()
  window.addEventListener('resize', updateRotateTip)
  window.addEventListener('orientationchange', updateRotateTip)
  store.ensureDefaultTracks()
  if (store.hasSavedProject()) await store.loadProject()
  window.addEventListener('beforeunload', cleanup)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onJkl)
  window.removeEventListener('resize', updateRotateTip)
  window.removeEventListener('orientationchange', updateRotateTip)
  window.removeEventListener('beforeunload', cleanup)
  cleanup()
})
function cleanup() {
  cancelAnimationFrame(rafId)
  previewAudio.dispose()
  clearTimeout(saveTimer)
  store.saveProject(true)
}
</script>

<template>
  <div class="studio">
    <!-- 手机竖屏提示条（v1.23.1）：只在窄屏触屏 + 竖屏时出现 -->
    <div v-if="showRotateTip" class="rotate-tip">
      <span>📱 屏幕太窄，横过来用更舒服</span>
      <div class="rotate-acts">
        <button class="btn" @click="goLandscape">一键横屏</button>
        <button class="btn ghost" @click="dismissRotateTip">就这样</button>
      </div>
    </div>
    <header class="topbar">
      <div class="brand">
        <span class="logo">🎬</span>
        <div>
          <h1>肥鱼剪辑台</h1>
          <p>纯前端 · 文件不出本机 · 可接自己的服务器</p>
          <p style="color:#8a6a3a;margin-top:3px">给愿意折腾的人用 · 想要一键出片请用剪映</p>
        </div>
      </div>
      <div class="actions">
        <span v-if="savedFlash" class="flash">{{ savedFlash }}</span>
        <button v-if="store.navStack.length" class="btn ghost" @click="store.backSequence()">← 返回上级</button>
        <select class="seqsel" :value="store.activeSeqId"
                @change="store.switchSequence(($event.target as HTMLSelectElement).value)">
          <option v-for="sq in store.sequences" :key="sq.id" :value="sq.id">{{ sq.name }}</option>
        </select>
        <button class="btn ghost" title="新建序列" @click="store.createSequence()">＋序列</button>
        <button class="btn ghost" @click="doNew">新建</button>
        <button class="btn ghost" @click="doOpen">打开</button>
        <button class="btn ghost" @click="doSave">保存</button>
        <a v-if="!native" class="btn ghost link" href="../download/feiyu-videostudio-v1.21.1.apk" download>安卓版</a>
        <button class="btn" @click="exportOpen = true">导出</button>
      </div>
    </header>

    <div class="body">
      <aside class="side">
        <MediaPanel />
        <Inspector />
        <div class="panel">
          <h2>操作</h2>
          <div class="keys">
            <div><kbd>Space</kbd> 播放/暂停</div>
            <div><kbd>S</kbd> 分割</div>
            <div><kbd>T</kbd> 加文字</div>
            <div><kbd>Del</kbd> 删除</div>
            <div><kbd>Ctrl+Z</kbd> 撤销</div>
            <div><kbd>Ctrl+Shift+Z</kbd> 重做</div>
            <div><kbd>←/→</kbd> 单帧微调</div>
            <div><kbd>M</kbd> 打标记 · <kbd>[ ]</kbd> 跳标记</div>
            <div><kbd>J/K/L</kbd> 倒退 / 停 / 快进</div>
          </div>
        </div>
      </aside>

      <main class="main">
        <PreviewStage />

        <div class="transport">
          <button class="tbtn" @click="skipTo('start')" title="回到开头">⏮</button>
          <button class="play" @click="togglePlay">{{ playing ? '⏸' : '▶' }}</button>
          <button class="tbtn" @click="skipTo('end')" title="跳到结尾">⏭</button>
          <span class="tc">{{ fmtTime(store.playhead) }}</span>
          <span class="sep">/</span>
          <span class="tc dim">{{ fmtTime(store.contentDuration) }}</span>
          <div class="spacer"></div>
          <span class="hint">{{ sel ? `已选：${sel.name}` : '多轨编辑 · 拖动片段换轨 · 两端裁剪' }}</span>
        </div>

        <Timeline />
      </main>
    </div>

    <ExportDialog :open="exportOpen" @close="exportOpen = false" />
    <SplashScreen v-if="splash" @done="splash = false" />

    <footer class="ver">{{ VERSION }}</footer>
  </div>
</template>

<style scoped>
.studio { display: flex; flex-direction: column; min-height: 100vh; }
.topbar { display: flex; align-items: center; justify-content: space-between; padding: 10px 18px; background: linear-gradient(135deg, rgba(74,168,255,.12), rgba(125,92,255,.10)); border-bottom: 1px solid var(--line); flex-shrink: 0; gap: 10px; flex-wrap: wrap; }
.brand { display: flex; align-items: center; gap: 10px; }
.logo { font-size: 22px; }
.brand h1 { margin: 0; font-size: 15px; letter-spacing: .5px; }
.brand p { margin: 2px 0 0; font-size: 10.5px; color: var(--dim); }
.actions { display: flex; align-items: center; gap: 7px; }
.flash { font-size: 10.5px; color: var(--ok); }
.seqsel { padding: 6px 8px; font-size: 11px; border-radius: 6px; background: #0b1421; border: 1px solid var(--line); color: var(--fg); outline: none; max-width: 110px; }
.btn { padding: 7px 14px; font-size: 12px; border-radius: 7px; font-weight: 600; background: linear-gradient(135deg, var(--acc), var(--acc2)); color: #fff; transition: .15s; }
.btn.ghost { background: #0b1421; border: 1px solid var(--line); color: var(--dim); }
.btn.ghost:hover { border-color: var(--acc); color: var(--acc); }
.btn.link { text-decoration: none; display: inline-flex; align-items: center; }
.btn:active { transform: scale(.96); }

.body { flex: 1; display: flex; gap: 12px; padding: 12px; overflow: hidden; min-height: 0; }
.side { width: 250px; flex-shrink: 0; display: flex; flex-direction: column; gap: 10px; overflow-y: auto; }
.panel { background: var(--panel); border: 1px solid var(--line); border-radius: 10px; padding: 12px; }
.panel h2 { margin: 0 0 10px; font-size: 11.5px; color: var(--acc); font-weight: 600; }
.keys { display: flex; flex-direction: column; gap: 5px; font-size: 10.5px; color: var(--dim); }
kbd { display: inline-block; padding: 1px 5px; margin-right: 4px; border-radius: 3px; background: #0b1421; border: 1px solid var(--line); font-size: 9.5px; font-family: inherit; color: #9fb3cc; }

.main { flex: 1; display: flex; flex-direction: column; gap: 10px; min-width: 0; }
.transport { display: flex; align-items: center; gap: 8px; padding: 6px 12px; background: var(--panel); border: 1px solid var(--line); border-radius: 10px; }
.play { width: 34px; height: 34px; border-radius: 50%; background: linear-gradient(135deg, var(--acc), var(--acc2)); color: #fff; font-size: 13px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.tbtn { width: 26px; height: 26px; border-radius: 6px; background: transparent; color: var(--dim); font-size: 12px; display: flex; align-items: center; justify-content: center; }
.tbtn:hover { background: #0b1421; color: var(--acc); }
.tc { font-size: 12px; font-variant-numeric: tabular-nums; font-weight: 600; }
.tc.dim { color: var(--dim); font-weight: 400; }
.sep { color: var(--dim); font-size: 11px; }
.spacer { flex: 1; }
.hint { font-size: 10.5px; color: var(--dim); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 45%; }
.ver { text-align: center; font-size: 10px; color: #3d4a61; padding: 6px 0 10px; flex-shrink: 0; }

@media (max-width: 720px) {
  .body { flex-direction: column; padding: 8px; }
  .side { width: 100%; flex-direction: row; overflow-x: auto; }
  .side > * { min-width: 220px; }
  .hint { display: none; }
}

/* 手机竖屏提示条（v1.23.1） */
.rotate-tip {
  display: flex; align-items: center; justify-content: space-between; gap: 10px;
  padding: 9px 12px; background: linear-gradient(160deg, #16304a, #0f2233);
  border-bottom: 1px solid #2e5f8e; font-size: 12.5px; color: #9fd8ff;
  flex-shrink: 0;
}
.rotate-acts { display: flex; gap: 6px; flex-shrink: 0; }
.rotate-acts .btn { font-size: 12px; padding: 5px 10px; }

/* 横屏时（宽 > 高）收紧竖排间距，多给画面留地方 */
@media (max-height: 520px) and (orientation: landscape) {
  .topbar { padding: 4px 8px; }
  .brand p { display: none; }
  .ver { display: none; }
}
</style>
