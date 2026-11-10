<script setup lang="ts">
/**
 * SimpleApp.vue —— 普通版剪辑器（给普通人用）
 *
 * 干什么：导入视频 → 剪一剪 → 加字幕 → 导出。只有一条视频轨，不出现专业术语。
 * 依赖：store、PreviewStage、lib/media、lib/exporter、lib/nativeSave
 * 输入：用户操作；输出：简化的单轨时间轴 + 直接出片
 */
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useProjectStore } from './stores/project'
import PreviewStage from './components/PreviewStage.vue'
import { probeMedia } from './lib/media'
import { exportTimeline } from './lib/exporter'
import { exportMp4, mp4Supported } from './lib/mp4exporter'
import { isNative, saveBlobNative } from './lib/nativeSave'
import * as previewAudio from './lib/previewAudio'

const VERSION = 'v1.1.7-预览声音修复 20261104'
const store = useProjectStore()

const importing = ref(false)
const errMsg = ref('')
const playing = ref(false)
const exportOpen = ref(false)
const exporting = ref(false)
const progress = ref(0)
const exportMsg = ref('')
const resultUrl = ref('')
const resultName = ref('')
const fileInput = ref<HTMLInputElement | null>(null)

let raf = 0
let lastTs = 0
let saveTimer = 0

const videoClips = computed(() =>
  store.clips.filter(c => c.kind === 'video').slice().sort((a, b) => a.start - b.start)
)
const textClips = computed(() => store.clips.filter(c => c.kind === 'text'))
const hasClips = computed(() => videoClips.value.length > 0)
const sel = computed(() => store.selected)

/* ---------- 导入 ---------- */
async function handleFiles(files: FileList | File[]) {
  const list = Array.from(files).filter(f => /^video\//.test(f.type) || /\.(mp4|mov|webm|mkv|m4v)$/i.test(f.name))
  if (!list.length) { errMsg.value = '请选视频文件（mp4 / mov 之类）'; return }
  importing.value = true
  errMsg.value = ''
  for (const f of list) {
    try {
      const url = URL.createObjectURL(f)
      const info = await probeMedia(url, 'video')
      const asset = await store.addAsset({
        name: f.name, url, file: f, kind: 'video',
        duration: info.duration, width: info.width, height: info.height, thumbs: [],
      })
      const end = videoClips.value.reduce((m, c) => Math.max(m, c.start + c.duration), 0)
      store.addVideoClip(asset.id, end)
    } catch (e: any) {
      errMsg.value = `「${f.name}」打不开：${e.message || e}`
    }
  }
  importing.value = false
}

/* ---------- 播放 ---------- */
function tick(ts: number) {
  if (!playing.value) return
  if (lastTs) {
    const next = store.playhead + (ts - lastTs) / 1000
    if (next >= store.contentDuration) { store.seek(store.contentDuration); stop(); return }
    store.seek(next)
    // 普通版：声音跟着视频片段走
    previewAudio.sync(next, store.clips, store.tracks, store.assets, 1, true)
  }
  lastTs = ts
  raf = requestAnimationFrame(tick)
}
function stop() { playing.value = false; cancelAnimationFrame(raf); lastTs = 0; previewAudio.stop() }
function togglePlay() {
  if (!hasClips.value) return
  if (playing.value) { stop(); return }
  if (store.playhead >= store.contentDuration) store.seek(0)
  playing.value = true
  lastTs = 0
  // 普通版：视频自带声音（audioFromVideo 语义）
  void previewAudio.start(store.clips, store.tracks, store.assets, store.playhead, 1, true)
  raf = requestAnimationFrame(tick)
}

/* ---------- 剪辑操作 ---------- */
function pick() { fileInput.value?.click() }
function splitHere() { store.splitAtPlayhead() }
function deleteSelected() { if (sel.value) store.removeClip(sel.value.id) }
function addText() {
  const id = store.addTextClip(store.playhead)
  if (!id) errMsg.value = '加字幕失败'
}
function selectClip(id: string) { store.selectedId = id }
function setSpeed(v: number) {
  const c = sel.value
  if (!c) return
  const a = store.assetById(c.assetId)
  store.pushHistory()
  store.updateClip(c.id, {
    speed: v,
    duration: a ? Math.max(0.2, (a.duration - c.inPoint) / v) : c.duration / v,
  })
}
function setVolume(v: number) {
  if (sel.value) store.updateClip(sel.value.id, { volume: v })
}
function muteAll() {
  store.clips.forEach(c => store.updateClip(c.id, { volume: 0 }))
}

/* ---------- 时间码 ---------- */
function fmt(s: number) {
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${String(sec).padStart(2, '0')}`
}

/* ---------- 导出 ---------- */
async function doExport() {
  if (!hasClips.value || exporting.value) return
  const { w, h } = store.canvasSize
  exporting.value = true
  progress.value = 0
  exportMsg.value = '准备中…'
  resultUrl.value = ''

  try {
    const common = {
      clips: store.clips,
      tracks: store.tracks,
      assets: store.assets,
      width: w, height: h,
      fps: 30,
      duration: Math.max(1, store.contentDuration),
      audioFromVideo: true,
      lut: store.lut, lutEnabled: store.lutEnabled,
      multicamGroups: store.multicamGroups,
      onProgress: (p: number, msg: string) => { progress.value = p; exportMsg.value = msg },
    }
    let out: { blob: Blob; ext: string }
    if (mp4Supported()) {
      try {
        out = await exportMp4({ ...common, bitrate: 8_000_000 })
      } catch {
        exportMsg.value = '这台设备不支持 MP4 编码，改用兼容格式…'
        out = await exportTimeline({ ...common, videoBitrate: 6_000_000 })
      }
    } else {
      out = await exportTimeline({ ...common, videoBitrate: 6_000_000 })
    }
    const { blob, ext } = out

    resultName.value = `我的视频-${Date.now()}.${ext}`
    resultUrl.value = URL.createObjectURL(blob)

    if (isNative()) {
      await saveBlobNative(blob, resultName.value)
      exportMsg.value = '✅ 导出好了，在分享面板里选保存'
    } else {
      const a = document.createElement('a')
      a.href = resultUrl.value
      a.download = resultName.value
      a.click()
      exportMsg.value = '✅ 导出好了，已开始下载'
    }
  } catch (e: any) {
    exportMsg.value = `❌ 导出失败：${e?.message || e}`
  } finally {
    exporting.value = false
  }
}

/* ---------- 保存 ---------- */
watch(
  () => [store.clips, store.tracks, store.aspect],
  () => {
    clearTimeout(saveTimer)
    saveTimer = window.setTimeout(() => store.saveProject(true), 1500)
  },
  { deep: true }
)

onMounted(async () => {
  store.ensureDefaultTracks()
  if (store.hasSavedProject()) await store.loadProject()
})
onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  clearTimeout(saveTimer)
  previewAudio.dispose()
  store.saveProject(true)
})
</script>

<template>
  <div class="app">
    <header>
      <div class="brand">
        <span class="logo">🎬</span>
        <div>
          <h1>肥鱼剪辑 · 简单版</h1>
          <p>导入 → 剪一剪 → 导出，就三步</p>
        </div>
      </div>
      <div class="acts">
        <button class="ghost" @click="store.undo()" :disabled="!store.canUndo">撤销</button>
        <button class="primary" :disabled="!hasClips" @click="exportOpen = true">导出视频</button>
      </div>
    </header>

    <main>
      <div v-if="!hasClips" class="welcome">
        <div class="icon">🎞️</div>
        <h2>选一个视频开始</h2>
        <p>视频只在你手机/电脑里处理，不会上传</p>
        <button class="big" :disabled="importing" @click="pick">
          {{ importing ? '正在读取…' : '选择视频' }}
        </button>
        <p class="hint">支持 mp4 / mov / webm / mkv</p>
      </div>

      <template v-else>
        <div class="stage"><PreviewStage /></div>

        <div class="controls">
          <button class="rnd" @click="togglePlay">{{ playing ? '⏸' : '▶' }}</button>
          <span class="time">{{ fmt(store.playhead) }} / {{ fmt(store.contentDuration) }}</span>
          <div class="sp"></div>
          <button class="ghost" @click="pick">＋ 加视频</button>
        </div>

        <div class="strip">
          <div
            v-for="c in videoClips" :key="c.id"
            class="card" :class="{ on: c.id === store.selectedId }"
            @click="selectClip(c.id)"
          >
            <div class="nm">{{ c.name }}</div>
            <div class="du">{{ c.duration.toFixed(1) }} 秒</div>
          </div>
          <div
            v-for="c in textClips" :key="c.id"
            class="card text" :class="{ on: c.id === store.selectedId }"
            @click="selectClip(c.id)"
          >
            <div class="nm">🅣 {{ c.text || '字幕' }}</div>
            <div class="du">{{ c.duration.toFixed(1) }} 秒</div>
          </div>
        </div>

        <div class="tools">
          <button class="tool" @click="splitHere">✂ 从这里切开</button>
          <button class="tool" @click="addText">＋ 加字幕</button>
          <button class="tool danger" :disabled="!sel" @click="deleteSelected">🗑 删掉选中</button>
        </div>

        <div class="settings" v-if="sel">
          <div class="row" v-if="sel.kind === 'text'">
            <label>字幕文字</label>
            <input class="txt" :value="sel.text"
                   @input="store.updateClip(sel.id, { text: ($event.target as HTMLInputElement).value })" />
          </div>
          <div class="row" v-if="sel.kind === 'text'">
            <label>字号</label>
            <input type="range" min="16" max="120" :value="sel.fontSize"
                   @input="store.updateClip(sel.id, { fontSize: +($event.target as HTMLInputElement).value })" />
            <b>{{ sel.fontSize }}</b>
          </div>
          <div class="row" v-if="sel.kind === 'video'">
            <label>音量</label>
            <input type="range" min="0" max="1.5" step="0.01" :value="sel.volume"
                   @input="setVolume(+($event.target as HTMLInputElement).value)" />
            <b>{{ Math.round(sel.volume * 100) }}%</b>
          </div>
          <div class="row" v-if="sel.kind === 'video'">
            <label>速度</label>
            <button class="chip" :class="{ on: sel.speed === 0.5 }" @click="setSpeed(0.5)">0.5×</button>
            <button class="chip" :class="{ on: sel.speed === 1 }" @click="setSpeed(1)">1×</button>
            <button class="chip" :class="{ on: sel.speed === 1.5 }" @click="setSpeed(1.5)">1.5×</button>
            <button class="chip" :class="{ on: sel.speed === 2 }" @click="setSpeed(2)">2×</button>
          </div>
        </div>

        <div class="row global">
          <label>画面方向</label>
          <button class="chip" :class="{ on: store.aspect === '16:9' }" @click="store.aspect = '16:9'">横屏</button>
          <button class="chip" :class="{ on: store.aspect === '9:16' }" @click="store.aspect = '9:16'">竖屏</button>
          <div class="sp"></div>
          <button class="chip" @click="muteAll">全部静音</button>
        </div>
      </template>

      <p v-if="errMsg" class="err">{{ errMsg }}</p>
    </main>

    <input ref="fileInput" type="file" accept="video/*" multiple style="display:none"
           @change="(e) => { const t = e.target as HTMLInputElement; if (t.files) handleFiles(t.files); t.value = '' }" />

    <!-- 导出面板 -->
    <div v-if="exportOpen" class="mask" @click.self="!exporting && (exportOpen = false)">
      <div class="sheet">
        <h3>导出视频</h3>
        <p class="note">方向：{{ store.canvasSize.label }} · 时长：{{ store.contentDuration.toFixed(0) }} 秒</p>
        <p class="note">导出时请保持页面在前台，需要 {{ store.contentDuration.toFixed(0) }} 秒左右。</p>
        <div class="bar" v-if="exporting"><i :style="{ width: progress * 100 + '%' }"></i></div>
        <p v-if="exportMsg" class="note strong">{{ exportMsg }}</p>
        <div class="btns">
          <button class="ghost" :disabled="exporting" @click="exportOpen = false">关闭</button>
          <button class="primary" :disabled="exporting" @click="doExport">
            {{ exporting ? '导出中…' : '开始导出' }}
          </button>
        </div>
        <a v-if="resultUrl && !isNative()" class="dl" :href="resultUrl" :download="resultName">再下载一次</a>
      </div>
    </div>

    <footer>{{ VERSION }}</footer>
  </div>
</template>

<style scoped>
.app { min-height: 100vh; display: flex; flex-direction: column; }
header { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-bottom: 1px solid var(--line); gap: 10px; flex-wrap: wrap; }
.brand { display: flex; align-items: center; gap: 9px; }
.logo { font-size: 22px; }
h1 { margin: 0; font-size: 15px; }
.brand p { margin: 2px 0 0; font-size: 10.5px; color: var(--dim); }
.acts { display: flex; gap: 7px; }

main { flex: 1; width: 100%; max-width: 780px; margin: 0 auto; padding: 14px; display: flex; flex-direction: column; gap: 10px; }

.welcome { text-align: center; padding: 50px 16px; }
.welcome .icon { font-size: 46px; margin-bottom: 10px; }
.welcome h2 { margin: 0 0 6px; font-size: 17px; }
.welcome p { margin: 0 0 18px; font-size: 12px; color: var(--dim); }
.welcome .hint { font-size: 10.5px; margin-top: 14px; }

.stage { height: 46vh; min-height: 220px; display: flex; }
.stage > * { flex: 1; }

.controls { display: flex; align-items: center; gap: 10px; padding: 8px 12px; background: var(--panel); border: 1px solid var(--line); border-radius: 10px; }
.rnd { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, var(--acc), var(--acc2)); color: #fff; font-size: 15px; }
.time { font-size: 12px; color: var(--dim); font-variant-numeric: tabular-nums; }
.sp { flex: 1; }

.strip { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px; }
.card { min-width: 128px; padding: 9px 11px; border-radius: 9px; background: var(--panel); border: 1px solid var(--line); cursor: pointer; }
.card.on { border-color: var(--acc); box-shadow: 0 0 0 1px var(--acc); }
.card.text { background: rgba(255,196,86,.08); }
.card .nm { font-size: 11.5px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.card .du { font-size: 10px; color: var(--dim); margin-top: 3px; }

.tools { display: flex; gap: 8px; flex-wrap: wrap; }
.tool { flex: 1; min-width: 100px; padding: 10px; font-size: 12px; border-radius: 9px; background: var(--panel); border: 1px solid var(--line); color: var(--fg); }
.tool:active { border-color: var(--acc); }
.tool.danger { color: var(--danger); }
.tool:disabled { opacity: .4; }

.settings { background: var(--panel); border: 1px solid var(--line); border-radius: 10px; padding: 10px 12px; }
.row { display: flex; align-items: center; gap: 8px; margin: 6px 0; flex-wrap: wrap; }
.row label { font-size: 11.5px; color: var(--dim); width: 58px; flex-shrink: 0; }
.row b { font-size: 11px; color: var(--acc); min-width: 38px; text-align: right; }
.row.global { background: var(--panel); border: 1px solid var(--line); border-radius: 10px; padding: 9px 12px; }
input[type=range] { flex: 1; min-width: 90px; -webkit-appearance: none; height: 5px; border-radius: 3px; background: #243149; }
input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 16px; height: 16px; border-radius: 50%; background: var(--acc); border: 2px solid var(--panel); }
.txt { flex: 1; padding: 8px 10px; font-size: 12.5px; background: #0b1421; border: 1px solid var(--line); border-radius: 7px; color: var(--fg); outline: none; }
.txt:focus { border-color: var(--acc); }

.chip { padding: 6px 12px; font-size: 11.5px; border-radius: 20px; background: #0b1421; border: 1px solid var(--line); color: var(--dim); }
.chip.on { border-color: var(--acc); color: var(--acc); background: rgba(74,168,255,.12); }

.primary { padding: 9px 18px; font-size: 12.5px; border-radius: 8px; font-weight: 600; background: linear-gradient(135deg, var(--acc), var(--acc2)); color: #fff; }
.primary:disabled { opacity: .45; }
.ghost { padding: 9px 16px; font-size: 12.5px; border-radius: 8px; background: #0b1421; border: 1px solid var(--line); color: var(--dim); }
.ghost:disabled { opacity: .4; }
.big { padding: 13px 34px; font-size: 14px; border-radius: 10px; font-weight: 700; background: linear-gradient(135deg, var(--acc), var(--acc2)); color: #fff; }

.err { font-size: 11.5px; color: var(--danger); text-align: center; }

.mask { position: fixed; inset: 0; background: rgba(0,0,0,.7); display: flex; align-items: center; justify-content: center; padding: 18px; z-index: 100; }
.sheet { width: 100%; max-width: 420px; background: var(--panel); border: 1px solid var(--line); border-radius: 14px; padding: 18px; }
.sheet h3 { margin: 0 0 10px; font-size: 14px; }
.note { font-size: 11.5px; color: var(--dim); margin: 6px 0; line-height: 1.6; }
.note.strong { color: var(--fg); }
.bar { height: 7px; background: #14203a; border-radius: 4px; overflow: hidden; margin: 10px 0; }
.bar > i { display: block; height: 100%; background: linear-gradient(90deg, var(--acc), var(--acc2)); }
.btns { display: flex; gap: 8px; justify-content: flex-end; margin-top: 12px; }
.dl { display: block; text-align: center; margin-top: 10px; font-size: 11.5px; color: var(--acc); }

footer { text-align: center; font-size: 10px; color: #3d4a61; padding: 10px 0; }
</style>
