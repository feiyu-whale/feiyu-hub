<script setup lang="ts">
/**
 * Inspector.vue —— 属性面板
 * 干什么：改选中片段（音量/速度/淡入淡出/文字样式/位置），没选中时改工程全局（画幅、调色）。
 * 依赖：Vue 3 + Pinia store
 * 输入：store.selected / store.grading；输出：实时修改
 */
import { computed, ref } from 'vue'
import { useProjectStore, ASPECTS, transformAt, volumeAt } from '../stores/project'
import CurveEditor from './CurveEditor.vue'
import { parseCube } from '../lib/lut'
import { renderSequenceToBlob } from '../lib/nest'
import { lutAvailable } from '../lib/lutRenderer'
import type { AspectPreset } from '../stores/project'

const store = useProjectStore()
const sel = computed(() => store.selected)

function patch(key: string, value: any) {
  if (!sel.value) return
  store.updateClip(sel.value.id, { [key]: value } as any)
}

function beginEdit() {
  store.pushHistory()
}

const aspectList = Object.keys(ASPECTS) as AspectPreset[]
const curveOpen = ref(false)
const nestBusy = ref(false)
const nestMsg = ref('')
const lutInput = ref<HTMLInputElement | null>(null)
const lutMsg = ref('')
const lutOk = lutAvailable()

function pickLut() { lutInput.value?.click() }

async function loadLut(file: File) {
  try {
    const text = await file.text()
    const parsed = parseCube(text, file.name.replace(/\.cube$/i, ''))
    store.lut = parsed
    store.lutEnabled = true
    lutMsg.value = `已加载「${parsed.name}」（${parsed.size}³）`
  } catch (e: any) {
    lutMsg.value = '加载失败：' + (e?.message || e)
  }
}

function clearLut() {
  store.lut = null
  store.lutEnabled = false
  lutMsg.value = ''
}

const presets = [
  { v: 'none', n: '原色' },
  { v: 'cinema', n: '电影感' },
  { v: 'warm', n: '暖调' },
  { v: 'cool', n: '冷调' },
  { v: 'bw', n: '黑白' },
  { v: 'vintage', n: '复古' },
]

/* ---------- 变速关键帧（毫秒精度） ---------- */
function addPointAtPlayhead() {
  const c = sel.value
  if (!c) return
  const local = Math.max(0, Math.min(c.duration, store.playhead - c.start))
  const pts = [...c.speedPoints]
  const v = pts.length ? pts[pts.length - 1].v : c.speed
  pts.push({ t: +local.toFixed(3), v: +v.toFixed(2) })
  store.pushHistory()
  store.setSpeedPoints(c.id, pts)
}

function setPointTime(i: number, t: number) {
  const c = sel.value
  if (!c) return
  const pts = c.speedPoints.map((p, idx) => idx === i ? { ...p, t: Math.max(0, Math.min(c.duration, +t.toFixed(3))) } : p)
  store.setSpeedPoints(c.id, pts)
}

function setPointVal(i: number, v: number) {
  const c = sel.value
  if (!c) return
  const pts = c.speedPoints.map((p, idx) => idx === i ? { ...p, v: Math.max(0.25, Math.min(4, +v.toFixed(2))) } : p)
  store.setSpeedPoints(c.id, pts)
}

function removePoint(i: number) {
  const c = sel.value
  if (!c) return
  store.pushHistory()
  store.setSpeedPoints(c.id, c.speedPoints.filter((_, idx) => idx !== i))
}

function clearPoints() {
  const c = sel.value
  if (!c) return
  store.pushHistory()
  store.setSpeedPoints(c.id, [])
}

function presetRamp(kind: 'accel' | 'decel') {
  const c = sel.value
  if (!c) return
  store.pushHistory()
  if (kind === 'accel') {
    store.setSpeedPoints(c.id, [{ t: 0, v: 1 }, { t: +c.duration.toFixed(3), v: 2 }])
  } else {
    store.setSpeedPoints(c.id, [{ t: 0, v: 1.5 }, { t: +c.duration.toFixed(3), v: 0.5 }])
  }
}

/* ---------- 变换关键帧 ---------- */
function addTransformKf() {
  const c = sel.value
  if (!c) return
  const local = localTimeOfPlayhead()
  const eff = transformAt(c, local)
  const kf = c.kf.filter(p => Math.abs(p.t - local) > 1e-6)
  kf.push({ t: +local.toFixed(3), scale: eff.scale, x: eff.x, y: eff.y, rotation: eff.rotation, opacity: eff.opacity })
  store.pushHistory()
  store.setKeyframes(c.id, kf)
}

function removeTransformKf(i: number) {
  const c = sel.value
  if (!c) return
  store.pushHistory()
  store.setKeyframes(c.id, c.kf.filter((_, idx) => idx !== i))
}

function clearTransformKf() {
  const c = sel.value
  if (!c) return
  store.pushHistory()
  store.setKeyframes(c.id, [])
}

function setTf(key: 'scale' | 'x' | 'y' | 'rotation', v: number) {
  const c = sel.value
  if (!c) return
  store.setTransform(c.id, { [key]: v } as any)
}

/* ---------- 音量关键帧 ---------- */
function addVolumeKf() {
  const c = sel.value
  if (!c) return
  const local = localTimeOfPlayhead()
  const eff = volumeAt(c, local)
  const pts = c.volumeKf.filter(p => Math.abs(p.t - local) > 1e-6)
  pts.push({ t: +local.toFixed(3), v: +eff.toFixed(2) })
  store.pushHistory()
  store.setVolumeKeyframes(c.id, pts)
}

function removeVolumeKf(i: number) {
  const c = sel.value
  if (!c) return
  store.pushHistory()
  store.setVolumeKeyframes(c.id, c.volumeKf.filter((_, idx) => idx !== i))
}

function clearVolumeKf() {
  const c = sel.value
  if (!c) return
  store.pushHistory()
  store.setVolumeKeyframes(c.id, [])
}

async function rerenderNested() {
  const c = sel.value
  if (!c || !c.nestSeqId || nestBusy.value) return
  const seq = store.sequences.find(x => x.id === c.nestSeqId)
  if (!seq) { nestMsg.value = '来源序列已不存在'; return }
  const dur = seq.clips.length ? Math.max(...seq.clips.map(x => x.start + x.duration)) : 0
  if (dur <= 0) { nestMsg.value = '来源序列是空的'; return }
  nestBusy.value = true
  nestMsg.value = '重新渲染中…'
  try {
    const { w, h } = store.canvasSize
    const blob = await renderSequenceToBlob(seq, store.assets, {
      width: w, height: h, fps: store.fps,
      onProgress: (_p, m) => { nestMsg.value = m },
    })
    const name = `${seq.name}-${Date.now()}.webm`
    const file = new File([blob], name, { type: 'video/webm' })
    const url = URL.createObjectURL(file)
    const asset = await store.addAsset({ name, url, file, kind: 'video', duration: dur, width: w, height: h, thumbs: [] })
    store.pushHistory()
    store.updateClip(c.id, { assetId: asset.id, duration: dur, name: seq.name })
    nestMsg.value = `✅ 已重新渲染（${(blob.size / 1048576).toFixed(1)} MB）`
  } catch (e: any) {
    nestMsg.value = '重渲染失败：' + (e?.message || e)
  } finally {
    nestBusy.value = false
  }
}

function mcAngles(): string[] {
  const c = sel.value
  if (!c || !c.mcId) return []
  const g = store.multicamGroups.find(x => x.id === c.mcId)
  return g ? g.angles : []
}

function switchAngle(i: number) {
  const c = sel.value
  if (!c) return
  const local = Math.max(0, Math.min(c.duration, store.playhead - c.start))
  store.pushHistory()
  store.addMulticamCut(c.id, local, i)
}

function slip(d: number) {
  if (sel.value) { store.pushHistory(); store.slipClip(sel.value.id, d) }
}
function roll(d: number) {
  if (!sel.value) return
  const ok = store.rollEdit(sel.value.id, d)
  if (!ok) lutMsg.value = '这段后面没有紧挨着的片段，滚动编辑不可用'
}

function localTimeOfPlayhead() {
  const c = sel.value
  if (!c) return 0
  return Math.max(0, Math.min(c.duration, store.playhead - c.start))
}
</script>

<template>
  <div class="panel">
    <template v-if="sel">
      <h2>属性 · {{ sel.kind === 'text' ? '文字' : sel.kind === 'audio' ? '音频' : '视频' }}</h2>

      <div class="prop"><span>名称</span><b class="ell">{{ sel.name }}</b></div>
      <div class="prop"><span>起点</span><b>{{ sel.start.toFixed(2) }}s</b></div>
      <div class="prop"><span>时长</span><b>{{ sel.duration.toFixed(2) }}s</b></div>

      <template v-if="sel.kind === 'text'">
        <label class="field">
          <span>文字内容</span>
          <textarea
            :value="sel.text"
            rows="2"
            @focus="beginEdit"
            @input="patch('text', ($event.target as HTMLTextAreaElement).value)"
          ></textarea>
        </label>
        <div class="row">
          <label>字号</label>
          <input type="range" min="12" max="140" step="1" :value="sel.fontSize"
                 @pointerdown="beginEdit" @input="patch('fontSize', +($event.target as HTMLInputElement).value)" />
          <b>{{ sel.fontSize }}</b>
        </div>
        <div class="row">
          <label>颜色</label>
          <input type="color" :value="sel.color" @input="patch('color', ($event.target as HTMLInputElement).value)" />
          <label class="mini-lbl">描边</label>
          <input type="color" :value="sel.strokeColor" @input="patch('strokeColor', ($event.target as HTMLInputElement).value)" />
        </div>
        <div class="row">
          <label>描边宽</label>
          <input type="range" min="0" max="16" step="1" :value="sel.strokeWidth"
                 @pointerdown="beginEdit" @input="patch('strokeWidth', +($event.target as HTMLInputElement).value)" />
          <b>{{ sel.strokeWidth }}</b>
        </div>
        <div class="row">
          <label>水平</label>
          <input type="range" min="0" max="1" step="0.01" :value="sel.x"
                 @pointerdown="beginEdit" @input="patch('x', +($event.target as HTMLInputElement).value)" />
          <b>{{ Math.round(sel.x * 100) }}%</b>
        </div>
        <div class="row">
          <label>垂直</label>
          <input type="range" min="0" max="1" step="0.01" :value="sel.y"
                 @pointerdown="beginEdit" @input="patch('y', +($event.target as HTMLInputElement).value)" />
          <b>{{ Math.round(sel.y * 100) }}%</b>
        </div>
        <div class="row">
          <label>对齐</label>
          <select :value="sel.align" @change="patch('align', ($event.target as HTMLSelectElement).value)">
            <option value="left">左</option>
            <option value="center">中</option>
            <option value="right">右</option>
          </select>
        </div>
      </template>

      <template v-else>
        <div class="row">
          <label>音量</label>
          <input type="range" min="0" max="2" step="0.01" :value="sel.volume"
                 @pointerdown="beginEdit" @input="patch('volume', +($event.target as HTMLInputElement).value)" />
          <b>{{ Math.round(sel.volume * 100) }}%</b>
        </div>
        <div class="row">
          <label>速度</label>
          <input type="range" min="0.25" max="4" step="0.05" :value="sel.speed"
                 @pointerdown="beginEdit" @input="patch('speed', +($event.target as HTMLInputElement).value)" />
          <b>{{ sel.speed.toFixed(2) }}×</b>
        </div>
      </template>

      <div class="row">
        <label>淡入</label>
        <input type="range" min="0" max="5" step="0.05" :value="sel.fadeIn"
               @pointerdown="beginEdit" @input="patch('fadeIn', +($event.target as HTMLInputElement).value)" />
        <b>{{ sel.fadeIn.toFixed(2) }}s</b>
      </div>
      <div class="row">
        <label>淡出</label>
        <input type="range" min="0" max="5" step="0.05" :value="sel.fadeOut"
               @pointerdown="beginEdit" @input="patch('fadeOut', +($event.target as HTMLInputElement).value)" />
        <b>{{ sel.fadeOut.toFixed(2) }}s</b>
      </div>
      <div class="row">
        <label>不透明</label>
        <input type="range" min="0" max="1" step="0.01" :value="sel.opacity"
               @pointerdown="beginEdit" @input="patch('opacity', +($event.target as HTMLInputElement).value)" />
        <b>{{ Math.round(sel.opacity * 100) }}%</b>
      </div>

      <div class="quick" v-if="sel.kind === 'video'">
        <button class="qbtn" @click="store.keepOnlyVideo(sel)">只留画面（删声音）</button>
      </div>
      <div class="quick" v-if="sel.kind === 'audio'">
        <button class="qbtn" @click="store.keepOnlyAudio(sel)">只留声音（删画面）</button>
      </div>

      <template v-if="sel.kind === 'video'">
        <h3>画面变换</h3>
        <div class="row">
          <label>缩放</label>
          <input type="range" min="0.1" max="3" step="0.01" :value="sel.transform?.scale ?? 1"
                 @pointerdown="beginEdit" @input="setTf('scale', +($event.target as HTMLInputElement).value)" />
          <b>{{ ((sel.transform?.scale ?? 1) * 100).toFixed(0) }}%</b>
        </div>
        <div class="row">
          <label>水平</label>
          <input type="range" min="-1" max="1" step="0.01" :value="sel.transform?.x ?? 0"
                 @pointerdown="beginEdit" @input="setTf('x', +($event.target as HTMLInputElement).value)" />
          <b>{{ Math.round((sel.transform?.x ?? 0) * 100) }}%</b>
        </div>
        <div class="row">
          <label>垂直</label>
          <input type="range" min="-1" max="1" step="0.01" :value="sel.transform?.y ?? 0"
                 @pointerdown="beginEdit" @input="setTf('y', +($event.target as HTMLInputElement).value)" />
          <b>{{ Math.round((sel.transform?.y ?? 0) * 100) }}%</b>
        </div>
        <div class="row">
          <label>旋转</label>
          <input type="range" min="-180" max="180" step="1" :value="sel.transform?.rotation ?? 0"
                 @pointerdown="beginEdit" @input="setTf('rotation', +($event.target as HTMLInputElement).value)" />
          <b>{{ (sel.transform?.rotation ?? 0).toFixed(0) }}°</b>
        </div>
        <div class="kf-btns">
          <button class="kbtn" @click="addTransformKf">＋ 在播放头记录变换</button>
          <button v-if="sel.kf.length" class="kbtn" @click="clearTransformKf">清空</button>
        </div>
        <div v-for="(p, i) in sel.kf" :key="'k' + i" class="ptrow">
          <span class="tag">{{ p.t.toFixed(3) }}s</span>
          <span class="tag">{{ (p.scale * 100).toFixed(0) }}%</span>
          <span class="tag">{{ (p.x * 100).toFixed(0) }},{{ (p.y * 100).toFixed(0) }}</span>
          <span class="tag">{{ p.rotation.toFixed(0) }}°</span>
          <button class="xbtn" @click="removeTransformKf(i)">✕</button>
        </div>
      </template>

      <template v-if="sel.kind === 'audio' || sel.kind === 'video'">
        <h3>音量关键帧</h3>
        <div class="kf-btns">
          <button class="kbtn" @click="addVolumeKf">＋ 在播放头记录音量</button>
          <button v-if="sel.volumeKf.length" class="kbtn" @click="clearVolumeKf">清空</button>
        </div>
        <div v-for="(p, i) in sel.volumeKf" :key="'v' + i" class="ptrow">
          <span class="tag">{{ p.t.toFixed(3) }}s</span>
          <span class="tag">{{ Math.round(p.v * 100) }}%</span>
          <button class="xbtn" @click="removeVolumeKf(i)">✕</button>
        </div>
      </template>

      <template v-if="sel.kind === 'audio' || sel.kind === 'video'">
        <h3>音频处理</h3>
        <div class="row">
          <label>低频</label>
          <input type="range" min="-12" max="12" step="0.5" :value="sel.eqLow"
                 @pointerdown="beginEdit" @input="patch('eqLow', +($event.target as HTMLInputElement).value)" />
          <b>{{ sel.eqLow > 0 ? '+' : '' }}{{ sel.eqLow }}dB</b>
        </div>
        <div class="row">
          <label>中频</label>
          <input type="range" min="-12" max="12" step="0.5" :value="sel.eqMid"
                 @pointerdown="beginEdit" @input="patch('eqMid', +($event.target as HTMLInputElement).value)" />
          <b>{{ sel.eqMid > 0 ? '+' : '' }}{{ sel.eqMid }}dB</b>
        </div>
        <div class="row">
          <label>高频</label>
          <input type="range" min="-12" max="12" step="0.5" :value="sel.eqHigh"
                 @pointerdown="beginEdit" @input="patch('eqHigh', +($event.target as HTMLInputElement).value)" />
          <b>{{ sel.eqHigh > 0 ? '+' : '' }}{{ sel.eqHigh }}dB</b>
        </div>
        <div class="row">
          <label>压缩</label>
          <select :value="sel.compress ? 'on' : 'off'" @change="patch('compress', ($event.target as HTMLSelectElement).value === 'on')">
            <option value="off">关</option>
            <option value="on">开（压平动态）</option>
          </select>
        </div>
        <div class="row">
          <label>闪避</label>
          <select :value="sel.duckRole" @change="patch('duckRole', ($event.target as HTMLSelectElement).value)">
            <option value="none">不参与</option>
            <option value="music">音乐（被人声压低）</option>
            <option value="voice">人声（触发压低）</option>
          </select>
        </div>
      </template>

      <template v-if="sel.kind === 'video'">
        <h3>画面蒙版</h3>
        <div class="row">
          <label>形状</label>
          <select :value="sel.maskType" @change="patch('maskType', ($event.target as HTMLSelectElement).value)">
            <option value="none">无</option>
            <option value="rect">矩形</option>
            <option value="ellipse">椭圆</option>
          </select>
        </div>
        <template v-if="sel.maskType !== 'none'">
          <div class="row">
            <label>水平</label>
            <input type="range" min="0" max="1" step="0.01" :value="sel.maskX"
                   @pointerdown="beginEdit" @input="patch('maskX', +($event.target as HTMLInputElement).value)" />
            <b>{{ Math.round(sel.maskX * 100) }}%</b>
          </div>
          <div class="row">
            <label>垂直</label>
            <input type="range" min="0" max="1" step="0.01" :value="sel.maskY"
                   @pointerdown="beginEdit" @input="patch('maskY', +($event.target as HTMLInputElement).value)" />
            <b>{{ Math.round(sel.maskY * 100) }}%</b>
          </div>
          <div class="row">
            <label>宽</label>
            <input type="range" min="0.1" max="1" step="0.01" :value="sel.maskW"
                   @pointerdown="beginEdit" @input="patch('maskW', +($event.target as HTMLInputElement).value)" />
            <b>{{ Math.round(sel.maskW * 100) }}%</b>
          </div>
          <div class="row">
            <label>高</label>
            <input type="range" min="0.1" max="1" step="0.01" :value="sel.maskH"
                   @pointerdown="beginEdit" @input="patch('maskH', +($event.target as HTMLInputElement).value)" />
            <b>{{ Math.round(sel.maskH * 100) }}%</b>
          </div>
        </template>
      </template>

      <template v-if="sel.nestSeqId">
        <h3>嵌套序列</h3>
        <p class="tip">这个片段来自「{{ sel.nestName || '子序列' }}」，双击时间轴上的片段也能进去。</p>
        <div class="kf-btns">
          <button class="kbtn" @click="store.enterSequence(sel.nestSeqId!)">进入编辑</button>
          <button class="kbtn" :disabled="nestBusy" @click="rerenderNested">{{ nestBusy ? '渲染中…' : '重新渲染' }}</button>
        </div>
        <p v-if="nestMsg" class="tip">{{ nestMsg }}</p>
      </template>

      <template v-if="sel.mcId">
        <h3>多机位切换</h3>
        <p class="tip">播放头在哪，点机位就在那儿切一刀。</p>
        <div class="kf-btns">
          <button v-for="(aid, i) in mcAngles()" :key="aid" class="kbtn"
                  @click="switchAngle(i)">机位 {{ i + 1 }}</button>
        </div>
      </template>

      <h3>精细剪辑</h3>
      <p class="tip">滑动 = 片段位置不动，换里面的内容；滚动 = 只挪和下一段的接点。</p>
      <div class="kf-btns">
        <button class="kbtn" @click="slip(-0.5)">内容 ◀ 0.5s</button>
        <button class="kbtn" @click="slip(0.5)">内容 ▶ 0.5s</button>
      </div>
      <div class="kf-btns">
        <button class="kbtn" @click="roll(-0.5)">接点 ◀ 0.5s</button>
        <button class="kbtn" @click="roll(0.5)">接点 ▶ 0.5s</button>
      </div>

      <h3>转场 / 缓动</h3>
      <div class="row">
        <label>入场</label>
        <select :value="sel.trans" @change="patch('trans', ($event.target as HTMLSelectElement).value)">
          <option value="none">无</option>
          <option value="fade">淡入（画面渐显）</option>
          <option value="black">黑场淡入</option>
          <option value="white">白场淡入</option>
          <option value="wipeL">擦除（从左到右）</option>
          <option value="wipeR">擦除（从右到左）</option>
          <option value="slideUp">上滑进入</option>
          <option value="zoom">缩放进入</option>
        </select>
      </div>
      <div class="row" v-if="sel.trans !== 'none'">
        <label>时长</label>
        <input type="range" min="0.1" max="3" step="0.05" :value="sel.transDur"
               @pointerdown="beginEdit" @input="patch('transDur', +($event.target as HTMLInputElement).value)" />
        <b>{{ sel.transDur.toFixed(2) }}s</b>
      </div>
      <div class="row">
        <label>缓动</label>
        <select :value="sel.easing" @change="patch('easing', ($event.target as HTMLSelectElement).value)">
          <option value="linear">线性</option>
          <option value="in">缓入</option>
          <option value="out">缓出</option>
          <option value="inout">缓入缓出</option>
        </select>
      </div>

      <h3>变速 · 毫秒关键帧</h3>
      <p class="tip">播放头在 {{ localTimeOfPlayhead().toFixed(3) }}s；不关键帧时全程按上面「速度」匀速。</p>
      <div v-for="(p, i) in sel.speedPoints" :key="i" class="ptrow">
        <input class="num" type="number" min="0" step="0.001" :value="p.t"
               @change="setPointTime(i, +($event.target as HTMLInputElement).value)" />
        <span class="unit">s</span>
        <input class="num" type="number" min="0.25" max="4" step="0.05" :value="p.v"
               @change="setPointVal(i, +($event.target as HTMLInputElement).value)" />
        <span class="unit">×</span>
        <button class="xbtn" @click="removePoint(i)">✕</button>
      </div>
      <div class="kf-btns">
        <button class="kbtn" @click="curveOpen = true">📈 曲线编辑</button>
        <button class="kbtn" @click="addPointAtPlayhead">＋ 在播放头加点</button>
        <button class="kbtn" @click="presetRamp('accel')">加速</button>
        <button class="kbtn" @click="presetRamp('decel')">减速</button>
        <button v-if="sel.speedPoints.length" class="kbtn" @click="clearPoints">清空</button>
      </div>

      <button class="btn danger" @click="store.removeClip(sel.id)">删除片段</button>
    </template>

    <template v-else>
      <h2>工程</h2>
      <div class="row">
        <label>画幅</label>
        <select :value="store.aspect" @change="store.aspect = ($event.target as HTMLSelectElement).value as AspectPreset">
          <option v-for="a in aspectList" :key="a" :value="a">{{ ASPECTS[a].label }}</option>
        </select>
      </div>
      <div class="row">
        <label>帧率</label>
        <select :value="store.fps" @change="store.fps = +($event.target as HTMLSelectElement).value">
          <option :value="24">24</option>
          <option :value="25">25</option>
          <option :value="30">30</option>
          <option :value="60">60</option>
        </select>
      </div>

      <div class="row">
        <label>亮度</label>
        <input type="range" min="0.5" max="1.5" step="0.01" v-model.number="store.grading.brightness" />
        <b>{{ store.grading.brightness.toFixed(2) }}</b>
      </div>
      <div class="row">
        <label>对比度</label>
        <input type="range" min="0.5" max="1.5" step="0.01" v-model.number="store.grading.contrast" />
        <b>{{ store.grading.contrast.toFixed(2) }}</b>
      </div>
      <div class="row">
        <label>饱和度</label>
        <input type="range" min="0" max="2" step="0.01" v-model.number="store.grading.saturation" />
        <b>{{ store.grading.saturation.toFixed(2) }}</b>
      </div>
      <small class="note">选中片段后，这里会变成该片段的属性。</small>
    </template>

    <!-- 调色预设：不管选不选片段都能用 -->
    <div class="always">
      <h3>3D LUT（.cube）</h3>
      <p class="tip">
        {{ lutOk ? '支持 Adobe .cube 文件，整帧调色，字幕不受影响。' : '当前浏览器不支持 WebGL，LUT 不可用。' }}
      </p>
      <div class="kf-btns">
        <button class="kbtn" :disabled="!lutOk" @click="pickLut">加载 .cube</button>
        <button v-if="store.lut" class="kbtn" @click="clearLut">移除</button>
      </div>
      <div v-if="store.lut" class="row" style="margin-top:6px">
        <label>启用</label>
        <select :value="store.lutEnabled ? 'on' : 'off'" @change="store.lutEnabled = ($event.target as HTMLSelectElement).value === 'on'">
          <option value="on">开</option>
          <option value="off">关</option>
        </select>
      </div>
      <p v-if="lutMsg" class="tip">{{ lutMsg }}</p>
      <input ref="lutInput" type="file" accept=".cube,text/plain" style="display:none"
             @change="(e) => { const t = e.target as HTMLInputElement; if (t.files?.[0]) loadLut(t.files[0]); t.value = '' }" />

      <h3>调色预设</h3>
      <div class="presets">
        <button v-for="p in presets" :key="p.v" class="pchip"
                :class="{ on: store.grading.preset === p.v }"
                @click="store.grading.preset = p.v as any">{{ p.n }}</button>
      </div>
    </div>

    <CurveEditor :open="curveOpen" @close="curveOpen = false" />
  </div>
</template>

<style scoped>
.panel { background: var(--panel); border: 1px solid var(--line); border-radius: 10px; padding: 12px; }
.panel h2 { margin: 0 0 10px; font-size: 12px; color: var(--acc); font-weight: 600; }
.panel h3 { margin: 12px 0 8px; font-size: 11px; color: var(--dim); font-weight: 600; }
.prop { display: flex; justify-content: space-between; align-items: center; gap: 8px; font-size: 11.5px; padding: 4px 0; border-bottom: 1px solid rgba(30,42,65,.5); }
.prop span { color: var(--dim); }
.prop b { font-weight: 600; font-variant-numeric: tabular-nums; }
.prop b.ell { max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.row { display: flex; align-items: center; gap: 8px; margin-top: 9px; }
.row label { font-size: 11px; color: var(--dim); width: 48px; flex-shrink: 0; }
.row label.mini-lbl { width: auto; }
.row b { font-size: 10.5px; color: var(--acc); min-width: 40px; text-align: right; font-variant-numeric: tabular-nums; }
.row select { flex: 1; padding: 5px 7px; font-size: 11px; background: #0b1421; border: 1px solid var(--line); border-radius: 5px; color: var(--fg); outline: none; }
input[type=range] { flex: 1; -webkit-appearance: none; height: 4px; border-radius: 2px; background: #243149; outline: none; }
input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 14px; border-radius: 50%; background: var(--acc); border: 2px solid var(--panel); cursor: pointer; }
input[type=color] { width: 28px; height: 22px; padding: 0; border: 1px solid var(--line); border-radius: 4px; background: #0b1421; }

.field { display: block; margin-top: 10px; }
.field span { font-size: 11px; color: var(--dim); display: block; margin-bottom: 5px; }
.field textarea {
  width: 100%; box-sizing: border-box; padding: 7px 8px; font-size: 11.5px; line-height: 1.5;
  background: #0b1421; border: 1px solid var(--line); border-radius: 6px; color: var(--fg);
  outline: none; resize: vertical; font-family: inherit;
}
.field textarea:focus { border-color: var(--acc); }

.btn { width: 100%; padding: 8px; font-size: 11.5px; border-radius: 7px; font-weight: 600; }
.btn.danger { background: rgba(255,107,107,.14); color: var(--danger); margin-top: 12px; }
.note { display: block; font-size: 10px; color: var(--dim); line-height: 1.6; margin-top: 8px; }
.presets { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 8px; }
.pchip { padding: 4px 9px; font-size: 10px; border-radius: 12px; background: #0b1421; border: 1px solid var(--line); color: var(--dim); }
.pchip.on { border-color: var(--acc); color: var(--acc); background: rgba(74,168,255,.12); }
.tip { font-size: 10px; color: var(--dim); line-height: 1.5; margin: 0 0 8px; }
.ptrow { display: flex; align-items: center; gap: 4px; margin-bottom: 5px; }
.num { width: 68px; padding: 4px 5px; font-size: 10.5px; background: #0b1421; border: 1px solid var(--line); border-radius: 4px; color: var(--fg); outline: none; }
.num:focus { border-color: var(--acc); }
.unit { font-size: 9.5px; color: var(--dim); }
.xbtn { width: 18px; height: 18px; border-radius: 3px; background: transparent; color: var(--dim); font-size: 9px; }
.xbtn:hover { background: rgba(255,107,107,.15); color: var(--danger); }
.kf-btns { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 6px; }
.kbtn { padding: 4px 8px; font-size: 10px; border-radius: 5px; background: #0b1421; border: 1px solid var(--line); color: var(--dim); }
.kbtn:hover { border-color: var(--acc); color: var(--acc); }
.quick { margin-top: 10px; }
.tag { font-size: 9.5px; color: var(--dim); background: #0b1421; border: 1px solid var(--line); border-radius: 4px; padding: 2px 5px; font-variant-numeric: tabular-nums; }
.qbtn { width: 100%; padding: 6px; font-size: 10.5px; border-radius: 6px; background: rgba(74,168,255,.1); border: 1px solid rgba(74,168,255,.3); color: var(--acc); }
.qbtn:hover { background: rgba(74,168,255,.18); }
</style>
