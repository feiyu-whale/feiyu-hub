<script setup lang="ts">
/**
 * MediaPanel.vue —— 素材面板
 * 干什么：导入视频/音频、显示素材列表、把素材加到对应轨道。
 * 依赖：Vue 3、store、lib/media（探测时长/抽帧）
 * 输入：用户选择的文件；输出：素材入库 + 轨道片段
 */
import { ref, computed } from 'vue'
import { useProjectStore } from '../stores/project'
import { probeMedia, extractThumbs, fmtDuration, fmtSize } from '../lib/media'
import { parseSrt } from '../lib/srt'
import { generateProxy } from '../lib/proxy'
import { renderSequenceToBlob } from '../lib/nest'

const store = useProjectStore()
const fileInput = ref<HTMLInputElement | null>(null)
const importing = ref(false)
const errMsg = ref('')

const srtInput = ref<HTMLInputElement | null>(null)
const nestBusy = ref('')
const nestMsg = ref('')
const otherSeqs = computed(() => store.sequences.filter(x => x.id !== store.activeSeqId))

async function embedSequence(id: string) {
  const seq = store.sequences.find(x => x.id === id)
  if (!seq || nestBusy.value) return
  const dur = seq.clips.length ? Math.max(...seq.clips.map(c => c.start + c.duration)) : 0
  if (dur <= 0) { nestMsg.value = '这条序列是空的'; return }
  nestBusy.value = id
  nestMsg.value = '开始渲染…'
  try {
    const { w, h } = store.canvasSize
    const blob = await renderSequenceToBlob(seq, store.assets, {
      width: w, height: h, fps: store.fps,
      onProgress: (_p, m) => { nestMsg.value = m },
    })
    const name = `${seq.name}.webm`
    const file = new File([blob], name, { type: 'video/webm' })
    const url = URL.createObjectURL(file)
    const asset = await store.addAsset({
      name, url, file, kind: 'video',
      duration: dur, width: w, height: h, thumbs: [],
    })
    const track = store.tracks.find(t => t.kind === 'video')
    if (track) {
      const cid = store.addAssetClip(asset.id, track.id, store.playhead)
      if (cid) store.updateClip(cid, { nestSeqId: seq.id, nestName: seq.name })
    }
    nestMsg.value = `✅ 已嵌入「${seq.name}」（${(blob.size / 1048576).toFixed(1)} MB）—— 子序列改动后需重新嵌入`
  } catch (e: any) {
    nestMsg.value = '嵌入失败：' + (e?.message || e)
  } finally {
    nestBusy.value = ''
  }
}

const mcSel = ref<string[]>([])
const mcMsg = ref('')

function toggleMc(id: string) {
  mcSel.value = mcSel.value.includes(id)
    ? mcSel.value.filter(x => x !== id)
    : [...mcSel.value, id]
}

function createMc() {
  if (mcSel.value.length < 2) { mcMsg.value = '至少选两个视频才能建机位组'; return }
  const g = store.createMulticam(mcSel.value)
  if (!g) return
  store.addMulticamClip(g.id, store.playhead)
  mcMsg.value = `已创建「${g.name}」并放到播放头`
  mcSel.value = []
}

function addMcToTimeline(groupId: string) {
  store.addMulticamClip(groupId, store.playhead)
  mcMsg.value = '已加入时间轴'
}

const proxyBusy = ref<string>('')
const proxyMsg = ref('')

async function makeProxy(assetId: string) {
  const a = store.assetById(assetId)
  if (!a || proxyBusy.value) return
  proxyBusy.value = assetId
  proxyMsg.value = '开始生成代理…'
  try {
    const blob = await generateProxy(a.file, {
      maxWidth: 640,
      onProgress: (_p, msg) => { proxyMsg.value = msg },
    })
    await store.setAssetProxy(a.id, blob)
    store.proxyEnabled = true
    proxyMsg.value = `✅ 代理已生成（${(blob.size / 1048576).toFixed(1)} MB），预览已切换`
  } catch (e: any) {
    proxyMsg.value = '生成失败：' + (e?.message || e)
  } finally {
    proxyBusy.value = ''
  }
}

function dropProxy(assetId: string) {
  store.setAssetProxy(assetId, null)
  proxyMsg.value = '已移除代理'
}

function pick() { fileInput.value?.click() }
function pickSrt() { srtInput.value?.click() }

async function importSrt(file: File) {
  try {
    const text = await file.text()
    const entries = parseSrt(text)
    if (!entries.length) { errMsg.value = '这个 SRT 里没读到字幕'; return }
    store.ensureDefaultTracks()
    let n = 0
    for (const e of entries) {
      if (store.addSubtitleClip(e.start, e.end - e.start, e.text)) n++
    }
    errMsg.value = `已导入 ${n} 条字幕`
  } catch (e: any) {
    errMsg.value = '字幕导入失败：' + (e?.message || e)
  }
}

async function handleFiles(files: FileList | File[]) {
  const list = Array.from(files).filter(f =>
    /^video\//.test(f.type) || /^audio\//.test(f.type) ||
    /\.(mp4|mov|webm|mkv|avi|m4v|mp3|wav|ogg|m4a|flac|aac)$/i.test(f.name)
  )
  if (!list.length) { errMsg.value = '这些不是视频/音频文件'; return }

  importing.value = true
  errMsg.value = ''
  store.ensureDefaultTracks()

  for (const f of list) {
    try {
      const kind: 'video' | 'audio' = /^audio\//.test(f.type) ||
        /\.(mp3|wav|ogg|m4a|flac|aac)$/i.test(f.name) ? 'audio' : 'video'
      const url = URL.createObjectURL(f)
      const info = await probeMedia(url, kind)
      const thumbs = kind === 'video' ? await extractThumbs(url, info.duration, 8) : []

      const asset = await store.addAsset({
        name: f.name, url, file: f, kind,
        duration: info.duration, width: info.width, height: info.height, thumbs,
      })

      // 视频：自动拆成「画面 + 声音」两条独立轨；音频：直接进音频轨
      const prevEnd = kind === 'video'
        ? store.clips.filter(c => c.kind === 'video').reduce((m, c) => Math.max(m, c.start + c.duration), 0)
        : store.clips.filter(c => c.kind === 'audio').reduce((m, c) => Math.max(m, c.start + c.duration), 0)
      store.importAssetSplit(asset.id, prevEnd)
    } catch (e: any) {
      errMsg.value = `「${f.name}」导入失败：${e.message || e}`
    }
  }
  importing.value = false
}

function onDrop(e: DragEvent) {
  e.preventDefault()
  if (e.dataTransfer?.files.length) handleFiles(e.dataTransfer.files)
}

function addToTimeline(assetId: string) {
  const a = store.assetById(assetId)
  if (!a) return
  const prevEnd = store.clips.filter(c => c.kind === a.kind)
    .reduce((m, c) => Math.max(m, c.start + c.duration), 0)
  store.importAssetSplit(assetId, prevEnd)
}

/** 三点编辑：按入/出点插入到播放头，后面片段自动右移 */
function insertAtPlayhead(assetId: string) {
  const ids = store.insertAssetAtPlayhead(assetId)
  errMsg.value = ids && ids.length ? '已按入出点插入' : '插入失败（没有可用轨道）'
}

/** 只提取声音到音频轨（不碰视频轨） */
function extractOnlyAudio(assetId: string) {
  const id = store.extractAudio(assetId, store.playhead)
  errMsg.value = id ? '' : '没有音频轨，先在时间轴下方加一条'
}

const hasAssets = computed(() => store.assets.length > 0)
</script>

<template>
  <div class="panel">
    <h2>媒体</h2>

    <div class="drop" :class="{ busy: importing }" @click="pick" @dragover.prevent @drop="onDrop">
      <template v-if="!importing">
        <div class="ico">📁</div>
        <p>点击或拖入文件</p>
        <small>mp4 / mov / mp3 / wav…</small>
      </template>
      <template v-else>
        <div class="spin"></div>
        <p>正在读取…</p>
      </template>
    </div>
    <input ref="fileInput" type="file" accept="video/*,audio/*" multiple style="display:none"
           @change="(e) => { const t = e.target as HTMLInputElement; if (t.files) handleFiles(t.files); t.value = '' }" />
    <input ref="srtInput" type="file" accept=".srt,text/plain" style="display:none"
           @change="(e) => { const t = e.target as HTMLInputElement; if (t.files?.[0]) importSrt(t.files[0]); t.value = '' }" />
    <button class="srtbtn" @click="pickSrt">📄 导入 SRT 字幕</button>

    <p v-if="errMsg" class="err">{{ errMsg }}</p>

    <div v-if="proxyBusy || proxyMsg" class="pxybar">
      <span>{{ proxyMsg }}</span>
    </div>
    <div v-if="hasAssets" class="mcbox">
      <h3>多机位</h3>
      <p class="mchint">勾选两个以上视频 → 建机位组，剪辑时按切点切换</p>
      <div class="mclist">
        <label v-for="a in store.assets.filter(x => x.kind === 'video')" :key="'mc' + a.id" class="mcitem">
          <input type="checkbox" :checked="mcSel.includes(a.id)" @change="toggleMc(a.id)" />
          <span class="ell">{{ a.name }}</span>
        </label>
      </div>
      <div class="kf-btns">
        <button class="kbtn" @click="createMc">建机位组并加入</button>
      </div>
      <div v-for="g in store.multicamGroups" :key="g.id" class="mcgrp">
        <span>{{ g.name }}（{{ g.angles.length }} 机位）</span>
        <button class="kbtn" @click="addMcToTimeline(g.id)">＋ 加入时间轴</button>
      </div>
      <p v-if="mcMsg" class="mchint">{{ mcMsg }}</p>
    </div>

    <div v-if="otherSeqs.length" class="mcbox">
      <h3>序列嵌套（预渲染）</h3>
      <p class="mchint">把另一条序列渲染成片段嵌进来；子序列改了要重新嵌一次。</p>
      <div v-for="sq in otherSeqs" :key="'ns' + sq.id" class="mcgrp">
        <span>{{ sq.name }}</span>
        <button class="kbtn" :disabled="!!nestBusy" @click="embedSequence(sq.id)">
          {{ nestBusy === sq.id ? '渲染中…' : '嵌入' }}
        </button>
      </div>
      <p v-if="nestMsg" class="mchint">{{ nestMsg }}</p>
    </div>

    <label v-if="hasAssets" class="pxytoggle">
      <input type="checkbox" :checked="store.proxyEnabled" @change="store.proxyEnabled = ($event.target as HTMLInputElement).checked" />
      预览使用代理（导出仍用原片）
    </label>

    <div v-if="hasAssets" class="list">
      <div v-for="a in store.assets" :key="a.id" class="item">
        <img v-if="a.thumbs.length" :src="a.thumbs[0]" class="thumb" alt="" />
        <div v-else class="thumb audio">🎵</div>
        <div class="meta">
          <div class="nm" :title="a.name">{{ a.name }}<span v-if="a.proxyUrl" class="pxy">代理</span></div>
          <div class="sub">
            {{ fmtDuration(a.duration) }}
            <span v-if="a.width">· {{ a.width }}×{{ a.height }}</span>
            <span class="sz">· {{ fmtSize(a.file.size) }}</span>
          </div>
        </div>
        <button class="add" title="加到轨道（视频自动拆画面+声音）" @click.stop="addToTimeline(a.id)">+</button>
        <button class="add" title="按入/出点插入到播放头" @click.stop="insertAtPlayhead(a.id)">⤓</button>
        <button v-if="a.kind === 'video'" class="add" title="只提取音频到音频轨" @click.stop="extractOnlyAudio(a.id)">♪</button>
        <button v-if="a.kind === 'video'" class="add" :title="a.proxyUrl ? '删除代理' : '生成低清代理'"
                @click.stop="a.proxyUrl ? dropProxy(a.id) : makeProxy(a.id)">
          {{ proxyBusy === a.id ? '…' : (a.proxyUrl ? '⚡' : '⚡') }}
        </button>
        <button class="del" title="移除" @click.stop="store.removeAsset(a.id)">✕</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.panel { background: var(--panel); border: 1px solid var(--line); border-radius: 10px; padding: 12px; }
.panel h2 { margin: 0 0 10px; font-size: 12px; color: var(--acc); font-weight: 600; }
.drop { text-align: center; padding: 14px 8px; border: 1px dashed var(--line); border-radius: 8px; color: var(--dim); cursor: pointer; transition: .15s; }
.drop:hover, .drop:active { border-color: var(--acc); background: rgba(74,168,255,.06); }
.drop.busy { cursor: wait; }
.drop .ico { font-size: 20px; margin-bottom: 5px; }
.drop p { margin: 0; font-size: 11.5px; }
.drop small { font-size: 10px; opacity: .7; }
.spin { width: 18px; height: 18px; margin: 0 auto 8px; border: 2px solid rgba(74,168,255,.25); border-top-color: var(--acc); border-radius: 50%; animation: sp .8s linear infinite; }
@keyframes sp { to { transform: rotate(360deg); } }
.srtbtn { width: 100%; margin-top: 8px; padding: 7px; font-size: 10.5px; border-radius: 7px; background: #0b1421; border: 1px solid var(--line); color: var(--dim); }
.srtbtn:hover { border-color: var(--acc); color: var(--acc); }
.mcbox { margin-top: 10px; padding: 8px; border: 1px solid var(--line); border-radius: 8px; background: var(--panel2); }
.mcbox h3 { margin: 0 0 4px; font-size: 10.5px; color: var(--acc); }
.mchint { font-size: 9.5px; color: var(--dim); margin: 0 0 6px; line-height: 1.5; }
.mclist { display: flex; flex-direction: column; gap: 3px; max-height: 96px; overflow: auto; margin-bottom: 6px; }
.mcitem { display: flex; align-items: center; gap: 5px; font-size: 10px; color: var(--fg); }
.mcitem .ell { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mcgrp { display: flex; align-items: center; justify-content: space-between; gap: 6px; font-size: 10px; color: var(--dim); margin-top: 5px; }
.pxy { margin-left: 5px; font-size: 8.5px; color: #3ddc97; border: 1px solid rgba(61,220,151,.4); border-radius: 3px; padding: 0 3px; }
.pxybar { margin-top: 8px; font-size: 10px; color: var(--acc); background: rgba(74,168,255,.08); border: 1px solid rgba(74,168,255,.2); border-radius: 6px; padding: 5px 8px; }
.pxytoggle { display: flex; align-items: center; gap: 5px; font-size: 10px; color: var(--dim); margin-top: 8px; cursor: pointer; }
.err { font-size: 11px; color: var(--danger); margin: 8px 0 0; line-height: 1.5; }
.list { margin-top: 10px; display: flex; flex-direction: column; gap: 6px; }
.item { display: flex; align-items: center; gap: 6px; padding: 5px; border-radius: 7px; background: var(--panel2); border: 1px solid transparent; }
.item:hover { border-color: var(--line); }
.thumb { width: 48px; height: 30px; border-radius: 4px; object-fit: cover; flex-shrink: 0; background: #060a12; }
.thumb.audio { display: flex; align-items: center; justify-content: center; font-size: 14px; }
.meta { min-width: 0; flex: 1; }
.nm { font-size: 10.5px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sub { font-size: 9px; color: var(--dim); margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sz { opacity: .7; }
.add, .del { width: 19px; height: 19px; border-radius: 4px; background: transparent; color: var(--dim); font-size: 11px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
.add:hover { background: rgba(74,168,255,.16); color: var(--acc); }
.del:hover { background: rgba(255,107,107,.15); color: var(--danger); }
</style>
