<script setup lang="ts">
/**
 * ExportDialog.vue —— 导出对话框
 * 干什么：① 在本机浏览器里直接出片（零服务器）② 生成渲染任务 JSON / ffmpeg 命令 ③ 交给用户自建服务器。
 * 依赖：store、lib/renderJob、lib/exporter
 * 输入：工程数据 + 输出设置；输出：视频文件 / JSON / 提交请求
 */
import { ref, computed, watch } from 'vue'
import { useProjectStore } from '../stores/project'
import { buildRenderJob, toFfmpegHint } from '../lib/renderJob'
import type { RenderOutput, RenderFilter } from '../lib/renderJob'
import { exportTimeline } from '../lib/exporter'
import { exportMp4, mp4Supported } from '../lib/mp4exporter'
import { isNative, saveBlobNative } from '../lib/nativeSave'
import { buildSrt } from '../lib/srt'
import { buildProjectZip } from '../lib/bundle'
import { toEdl, toFcpxml } from '../lib/interchange'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ (e: 'close'): void }>()

const store = useProjectStore()

const LS_KEY = 'fyrender.server'
const serverUrl = ref(localStorage.getItem(LS_KEY) || '')

const output = ref<RenderOutput>({ format: 'mp4', resolution: 'source', fps: 30 })
const filters = ref<RenderFilter>({
  brightness: store.grading.brightness,
  contrast: store.grading.contrast,
  saturation: store.grading.saturation,
  fadeIn: 0,
  fadeOut: 0,
})

const job = computed(() => buildRenderJob(store.clips, store.assets, output.value, filters.value))
const ffmpegHint = computed(() => toFfmpegHint(job.value))
const jobJson = computed(() => JSON.stringify(job.value, null, 2))

const copied = ref('')
const sending = ref(false)
const sendMsg = ref('')

/* ---------- 本机直接导出 ---------- */
const bitrate = ref(6_000_000)
const localFormat = ref<'mp4' | 'webm'>('mp4')
const exporting = ref(false)
const progress = ref(0)
const exportMsg = ref('')
const resultUrl = ref('')
const resultName = ref('')
let abort: AbortController | null = null

async function startExport() {
  if (!store.clips.length) { exportMsg.value = '时间轴上还没有片段'; return }
  if (exporting.value) return

  const { w, h } = store.canvasSize
  const duration = Math.max(1, store.contentDuration)
  exporting.value = true
  progress.value = 0
  exportMsg.value = '准备中…'
  resultUrl.value = ''
  abort = new AbortController()

  try {
    let result: { blob: Blob; ext: string }
    if (localFormat.value === 'mp4' && mp4Supported()) {
      try {
        result = await exportMp4({
          clips: store.clips, tracks: store.tracks, assets: store.assets,
          width: w, height: h, fps: store.fps, duration,
          bitrate: bitrate.value,
          grading: { ...store.grading },
          lut: store.lut,
          lutEnabled: store.lutEnabled,
          multicamGroups: store.multicamGroups,
          signal: abort.signal,
          onProgress: (p, msg) => { progress.value = p; exportMsg.value = msg },
        })
      } catch (e: any) {
        console.warn("[MP4-FAIL] 已回退 WebM：", (e && e.message) || String(e))
        exportMsg.value = `MP4 编码不可用，改用 WebM…`
        result = await exportTimeline({
          clips: store.clips, tracks: store.tracks, assets: store.assets,
          width: w, height: h, fps: store.fps, duration,
          grading: { ...store.grading },
          lut: store.lut,
          lutEnabled: store.lutEnabled,
          multicamGroups: store.multicamGroups, videoBitrate: bitrate.value,
          signal: abort.signal,
          onProgress: (p, msg) => { progress.value = p; exportMsg.value = msg },
        })
      }
    } else {
      result = await exportTimeline({
        clips: store.clips, tracks: store.tracks, assets: store.assets,
        width: w, height: h, fps: store.fps, duration,
        grading: { ...store.grading }, videoBitrate: bitrate.value,
        lut: store.lut, lutEnabled: store.lutEnabled,
        multicamGroups: store.multicamGroups,
        signal: abort.signal,
        onProgress: (p, msg) => { progress.value = p; exportMsg.value = msg },
      })
    }
    const { blob, ext } = result

    if (resultUrl.value) URL.revokeObjectURL(resultUrl.value)
    resultUrl.value = URL.createObjectURL(blob)
    resultName.value = `feiyu-export-${Date.now()}.${ext}`
    exportMsg.value = `✅ 完成，${(blob.size / 1048576).toFixed(1)} MB`

    if (isNative()) {
      // 安卓 App：写缓存 + 系统分享面板（WebView 不支持 <a download>）
      try {
        await saveBlobNative(blob, resultName.value)
        exportMsg.value = `✅ 已导出，${(blob.size / 1048576).toFixed(1)} MB（在分享面板里选保存/发送）`
      } catch (e: any) {
        exportMsg.value = `⚠️ 视频已生成，但保存失败：${e?.message || e}`
      }
      return
    }

    const a = document.createElement('a')
    a.href = resultUrl.value
    a.download = resultName.value
    a.click()
  } catch (e: any) {
    exportMsg.value = `❌ ${e?.message || e}（建议用 Chrome / Edge）`
  } finally {
    exporting.value = false
    abort = null
  }
}

function cancelExport() {
  abort?.abort()
  exportMsg.value = '已取消'
}

/* ---------- 字幕导出 ---------- */
const srtMsg = ref('')
function exportSrt() {
  const texts = store.clips.filter(c => c.kind === 'text')
  if (!texts.length) { srtMsg.value = '时间轴上还没有字幕'; return }
  const srt = buildSrt(texts.map(c => ({ start: c.start, duration: c.duration, text: c.text || c.name })))
  const blob = new Blob([srt], { type: 'text/plain;charset=utf-8' })
  const name = `字幕-${Date.now()}.srt`
  if (isNative()) {
    saveBlobNative(blob, name).then(() => { srtMsg.value = '✅ 已在分享面板中' }).catch(e => { srtMsg.value = '保存失败：' + e.message })
  } else {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = name
    a.click()
    setTimeout(() => URL.revokeObjectURL(a.href), 3000)
    srtMsg.value = `✅ 已导出 ${texts.length} 条字幕`
  }
}

/* ---------- 工程打包 / 互通 ---------- */
const packMsg = ref('')
const packing = ref(false)

async function packProject() {
  if (packing.value) return
  packing.value = true
  packMsg.value = '正在打包…'
  try {
    const blob = await buildProjectZip(store.getProjectJson(), store.assets, (_p, m) => { packMsg.value = m })
    const name = `工程包-${Date.now()}.zip`
    if (isNative()) {
      await saveBlobNative(blob, name)
      packMsg.value = `✅ 已打包 ${(blob.size / 1048576).toFixed(1)} MB，在分享面板里保存`
    } else {
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = name
      a.click()
      setTimeout(() => URL.revokeObjectURL(a.href), 4000)
      packMsg.value = `✅ 已打包 ${(blob.size / 1048576).toFixed(1)} MB`
    }
  } catch (e: any) {
    packMsg.value = '打包失败：' + (e?.message || e)
  } finally {
    packing.value = false
  }
}

function downloadText(text: string, filename: string, mime = 'text/plain;charset=utf-8') {
  const blob = new Blob([text], { type: mime })
  if (isNative()) {
    saveBlobNative(blob, filename).catch(() => {})
    return
  }
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 3000)
}

function exportEdl() {
  const text = toEdl(store.clips, store.assets, store.fps)
  downloadText(text, `工程-${Date.now()}.edl`)
  packMsg.value = '✅ 已导出 EDL'
}

function exportFcpxml() {
  const text = toFcpxml(store.clips, store.assets, {
    fps: store.fps, width: store.canvasSize.w, height: store.canvasSize.h,
    name: store.projectName,
  })
  downloadText(text, `工程-${Date.now()}.fcpxml`, 'application/xml;charset=utf-8')
  packMsg.value = '✅ 已导出 FCPXML'
}

/* ---------- 服务器路线 ---------- */
function copy(text: string, tag: string) {
  navigator.clipboard.writeText(text).then(() => {
    copied.value = tag
    setTimeout(() => { copied.value = '' }, 1500)
  }).catch(() => { copied.value = '' })
}

function downloadJson() {
  const blob = new Blob([jobJson.value], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = 'render-job.json'
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 3000)
}

watch(serverUrl, v => {
  const t = v.trim()
  if (t) localStorage.setItem(LS_KEY, t)
  else localStorage.removeItem(LS_KEY)
})

function testServer() {
  const base = serverUrl.value.trim().replace(/\/+$/, '')
  if (!base) { sendMsg.value = '❌ 先填服务器地址'; return }
  sendMsg.value = '⏳ 正在测试…'
  fetch(base + '/health', { method: 'GET' })
    .then(r => {
      sendMsg.value = r.ok ? '✅ 连接成功' : `⚠️ 有响应，状态码 ${r.status}`
    })
    .catch(() => { sendMsg.value = '❌ 连不上（地址错 / 跨域 / 服务没开）' })
}

async function submit() {
  const base = serverUrl.value.trim().replace(/\/+$/, '')
  if (!base) { sendMsg.value = '❌ 没填服务器地址，只能下载 JSON 自己跑'; return }
  sending.value = true
  sendMsg.value = '⏳ 提交中…'
  try {
    const r = await fetch(base + '/render', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: jobJson.value,
    })
    const data = await r.json().catch(() => ({}))
    if (r.ok) sendMsg.value = `✅ 已提交，任务号：${data.jobId || '(服务端没返回)'}`
    else sendMsg.value = `❌ 服务端拒绝：${data.message || r.status}`
  } catch (e: any) {
    sendMsg.value = `❌ 提交失败：${e.message || '网络错误'}`
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <div v-if="props.open" class="mask" @click.self="emit('close')">
    <div class="sheet">
      <header>
        <h2>导出 / 渲染</h2>
        <button class="x" @click="emit('close')">✕</button>
      </header>

      <div class="scroll">
        <!-- 本机直接导出 -->
        <section class="hero">
          <h3>本机直接出片（推荐）</h3>
          <p class="note">
            在你自己的浏览器里合成导出，<b>文件不上传、不花一分钱、不用配服务器</b>。<br />
            代价：按真实时间录制，片长 1 分钟就要录 1 分钟。请别切走标签页。
          </p>
          <div class="rowline">
            <span class="dim">画幅</span><b>{{ store.canvasSize.label }}</b>
            <span class="dim">帧率</span><b>{{ store.fps }} fps</b>
            <span class="dim">片长</span><b>{{ store.contentDuration.toFixed(1) }}s</b>
          </div>
          <div class="row">
            <label>格式</label>
            <select v-model="localFormat">
              <option value="mp4">MP4（H.264，通用）</option>
              <option value="webm">WebM（兼容兜底）</option>
            </select>
          </div>
          <div class="row">
            <label>码率</label>
            <select v-model.number="bitrate">
              <option :value="3000000">3 Mbps（省空间）</option>
              <option :value="6000000">6 Mbps（标准）</option>
              <option :value="10000000">10 Mbps（高画质）</option>
              <option :value="16000000">16 Mbps（专业）</option>
            </select>
          </div>
          <div class="bar" v-if="exporting"><i :style="{ width: progress * 100 + '%' }"></i></div>
          <div class="btns">
            <button class="mini primary" :disabled="exporting" @click="startExport">
              {{ exporting ? '录制中…' : '开始导出视频' }}
            </button>
            <button v-if="exporting" class="mini" @click="cancelExport">取消</button>
            <a v-if="resultUrl" class="mini ok" :href="resultUrl" :download="resultName">再次下载</a>
          </div>
          <p v-if="exportMsg" class="msg">{{ exportMsg }}</p>
        </section>

        <!-- 工程打包 / 互通 -->
        <section>
          <h3>工程打包 / 与其他软件互通</h3>
          <p class="note">
            <b>打包</b>：把工程数据 + 全部素材压成一个 zip，换设备也能接着剪。<br />
            <b>EDL / FCPXML</b>：剪点结构可以带去 Premiere / Final Cut / DaVinci（特效不跟着走）。
          </p>
          <div class="btns">
            <button class="mini" :disabled="packing" @click="packProject">{{ packing ? '打包中…' : '打包工程 zip' }}</button>
            <button class="mini" @click="exportEdl">导出 EDL</button>
            <button class="mini" @click="exportFcpxml">导出 FCPXML</button>
          </div>
          <p v-if="packMsg" class="msg">{{ packMsg }}</p>
        </section>

        <!-- 字幕 -->
        <section>
          <h3>字幕</h3>
          <p class="note">把时间轴上的文字片段导出成标准 .srt 文件，能直接拖进别的剪辑软件或视频平台。</p>
          <div class="btns">
            <button class="mini" @click="exportSrt">导出 SRT 字幕</button>
          </div>
          <p v-if="srtMsg" class="msg">{{ srtMsg }}</p>
        </section>

        <!-- 输出设置 -->
        <section>
          <h3>输出设置（给服务器路线用）</h3>
          <div class="row">
            <label>格式</label>
            <select v-model="output.format">
              <option value="mp4">MP4（推荐）</option>
              <option value="webm">WebM</option>
              <option value="mov">MOV</option>
            </select>
          </div>
          <div class="row">
            <label>分辨率</label>
            <select v-model="output.resolution">
              <option value="source">跟随源（不缩放）</option>
              <option value="1080p">1080p</option>
              <option value="720p">720p</option>
              <option value="480p">480p</option>
            </select>
          </div>
          <div class="row">
            <label>帧率</label>
            <select v-model.number="output.fps">
              <option :value="24">24 fps</option>
              <option :value="25">25 fps</option>
              <option :value="30">30 fps</option>
              <option :value="60">60 fps</option>
            </select>
          </div>
        </section>

        <!-- 任务预览 -->
        <section>
          <h3>渲染任务（{{ job.segments.length }} 个片段）</h3>
          <pre class="code">{{ jobJson }}</pre>
          <div class="btns">
            <button class="mini" @click="copy(jobJson, 'json')">{{ copied === 'json' ? '✅ 已复制' : '复制 JSON' }}</button>
            <button class="mini" @click="downloadJson">下载 .json</button>
          </div>
        </section>

        <!-- ffmpeg 参考 -->
        <section>
          <h3>ffmpeg 参考命令</h3>
          <pre class="code">{{ ffmpegHint }}</pre>
          <div class="btns">
            <button class="mini" @click="copy(ffmpegHint, 'cmd')">{{ copied === 'cmd' ? '✅ 已复制' : '复制命令' }}</button>
          </div>
          <p class="note">把素材放到命令里的 <code>assets/</code> 目录下，在你自己服务器跑这条命令就能出片。</p>
        </section>

        <!-- 渲染服务器 -->
        <section>
          <h3>渲染服务器（选填）</h3>
          <p class="note">
            默认关闭 —— 不填永远不会连接。<br />
            填了之后，导出会把任务提交到你的服务器，由它跑 ffmpeg。<br />
            <b>服务器你自己部署、自己付电费、自己负责</b>，我们只提供代码。
          </p>
          <div class="row">
            <label>地址</label>
            <input class="txt" v-model="serverUrl" placeholder="https://你的服务器.com" spellcheck="false" />
          </div>
          <div class="btns">
            <button class="mini" @click="testServer">测试连接</button>
            <button class="mini primary" :disabled="sending" @click="submit">{{ sending ? '提交中…' : '提交渲染' }}</button>
          </div>
          <p v-if="sendMsg" class="msg">{{ sendMsg }}</p>
        </section>
      </div>

      <footer>
        <button class="btn" @click="emit('close')">关闭</button>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.mask { position: fixed; inset: 0; background: rgba(0,0,0,.68); backdrop-filter: blur(3px); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 20px; }
.sheet { width: 100%; max-width: 640px; max-height: 88vh; background: var(--panel); border: 1px solid var(--line); border-radius: 14px; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,.5); }
header { display: flex; align-items: center; justify-content: space-between; padding: 14px 18px; border-bottom: 1px solid var(--line); background: var(--panel2); }
header h2 { margin: 0; font-size: 14px; }
.x { width: 26px; height: 26px; border-radius: 6px; background: transparent; color: var(--dim); font-size: 13px; }
.x:hover { background: rgba(255,107,107,.15); color: var(--danger); }

.scroll { flex: 1; overflow-y: auto; padding: 14px 18px; }
section { margin-bottom: 20px; }
section.hero { background: rgba(74,168,255,.06); border: 1px solid rgba(74,168,255,.25); border-radius: 10px; padding: 12px 14px; }
section h3 { margin: 0 0 10px; font-size: 12px; color: var(--acc); font-weight: 600; padding-bottom: 6px; border-bottom: 1px solid rgba(30,42,65,.6); }

.rowline { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; font-size: 11px; margin-bottom: 8px; }
.rowline .dim { color: var(--dim); }
.rowline b { color: var(--fg); }

.row { display: flex; align-items: center; gap: 10px; margin-bottom: 9px; }
.row label { font-size: 11.5px; color: var(--dim); width: 62px; flex-shrink: 0; }
select, .txt { flex: 1; padding: 7px 9px; font-size: 12px; background: #0b1421; border: 1px solid var(--line); border-radius: 6px; color: var(--fg); outline: none; }
select:focus, .txt:focus { border-color: var(--acc); }

.bar { height: 6px; background: #14203a; border-radius: 3px; overflow: hidden; margin: 4px 0 10px; }
.bar > i { display: block; height: 100%; background: linear-gradient(90deg, var(--acc), var(--acc2)); transition: width .2s; }

.code { background: #060a12; border: 1px solid var(--line); border-radius: 7px; padding: 10px; font-size: 10.5px; line-height: 1.6; color: #9fb3cc; font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace; max-height: 160px; overflow: auto; white-space: pre-wrap; word-break: break-all; margin: 0 0 8px; }
.btns { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
.mini { padding: 6px 13px; font-size: 11px; border-radius: 6px; background: #0b1421; border: 1px solid var(--line); color: var(--dim); font-weight: 500; text-decoration: none; }
.mini:hover { border-color: var(--acc); color: var(--acc); }
.mini.primary { background: linear-gradient(135deg, var(--acc), var(--acc2)); border-color: transparent; color: #fff; }
.mini.ok { color: var(--ok); border-color: rgba(61,220,151,.4); }
.mini:disabled { opacity: .5; }
.note { font-size: 10.5px; color: var(--dim); line-height: 1.7; margin: 8px 0 0; }
.note b { color: var(--warn); }
.note code { background: #0b1421; padding: 1px 4px; border-radius: 3px; font-size: 10px; }
.msg { font-size: 11.5px; margin: 8px 0 0; color: var(--dim); }
footer { padding: 12px 18px; border-top: 1px solid var(--line); background: var(--panel2); text-align: right; }
.btn { padding: 8px 22px; font-size: 12px; border-radius: 7px; background: #0b1421; border: 1px solid var(--line); color: var(--dim); font-weight: 600; }
.btn:hover { border-color: var(--acc); color: var(--acc); }
</style>
