/**
 * 渲染任务数据结构 + 前端导出 JSON
 *
 * 设计原则：
 *  1. 前端只产出「参数」，不碰渲染
 *  2. 后端（用户自己部署）读参数 → 调 ffmpeg
 *  3. 素材以 URL 形式传递（用户自己传到哪里，由用户决定）
 */

import type { Clip, MediaAsset } from '../stores/project'

export interface RenderSegment {
  /** 素材标识（前端素材 id，后端用它去取文件） */
  assetId: string
  /** 素材名（给人看的） */
  name: string
  /** 素材源地址（用户上传到自己服务器后的 URL） */
  source: string
  /** 时间轴上的起点（秒） */
  timelineStart: number
  /** 时长（秒） */
  duration: number
  /** 源素材入点（秒） */
  inPoint: number
  /** 播放速度，1 = 原速 */
  speed: number
  /** 音量倍数，1 = 原始 */
  volume: number
}

export interface RenderFilter {
  brightness?: number   // 1.0 = 原样
  contrast?: number
  saturation?: number
  /** 淡入秒数 */
  fadeIn?: number
  /** 淡出秒数 */
  fadeOut?: number
}

export interface RenderOutput {
  format: 'mp4' | 'webm' | 'mov'
  resolution: '1080p' | '720p' | '480p' | 'source'
  fps: number
  videoBitrate?: string   // 如 '4M'
  audioBitrate?: string   // 如 '192k'
}

export interface RenderJob {
  version: 1
  segments: RenderSegment[]
  filters: RenderFilter
  output: RenderOutput
  /** 可选：整片全局音量 */
  globalVolume?: number
}

export function buildRenderJob(
  clips: Clip[],
  assets: MediaAsset[],
  output: RenderOutput,
  filters: RenderFilter = {}
): RenderJob {
  const segments: RenderSegment[] = clips
    .slice()
    .sort((a, b) => a.start - b.start)
    .map(c => {
      const asset = assets.find(a => a.name === c.name)
      return {
        assetId: asset?.id ?? '',
        name: c.name,
        source: asset ? `assets/${asset.name}` : '',
        timelineStart: round(c.start),
        duration: round(c.duration),
        inPoint: round(c.inPoint),
        speed: c.speed,
        volume: c.volume,
      }
    })

  return {
    version: 1,
    segments,
    filters,
    output,
  }
}

function round(n: number, d = 3) {
  const p = Math.pow(10, d)
  return Math.round(n * p) / p
}

/** 生成可读的 ffmpeg 参考命令（给用户抄到自己服务器用） */
export function toFfmpegHint(job: RenderJob): string {
  const parts: string[] = []
  job.segments.forEach((s) => {
    parts.push(`-ss ${s.inPoint} -t ${s.duration} -i "${s.source}"`)
  })
  const n = job.segments.length
  const filterLines: string[] = []
  for (let i = 0; i < n; i++) {
    filterLines.push(`[${i}:v]setpts=PTS/${job.segments[i].speed}[v${i}]`)
    filterLines.push(`[${i}:a]atempo=${clampAtempo(job.segments[i].speed)},volume=${job.segments[i].volume}[a${i}]`)
  }
  const concatIn = Array.from({ length: n }, (_, i) => `[v${i}][a${i}]`).join('')
  filterLines.push(`${concatIn}concat=n=${n}:v=1:a=1[vout][aout]`)

  return `ffmpeg ${parts.join(' ')} \\\n  -filter_complex "${filterLines.join(';')}" \\\n  -map "[vout]" -map "[aout]" \\\n  -c:v libx264 -crf 20 -preset veryfast \\\n  -c:a aac -b:a 192k \\\n  output.mp4`
}

/** ffmpeg atempo 只接受 0.5~2.0，超出的要串联 */
function clampAtempo(speed: number): string {
  if (speed === 1) return '1.0'
  const chain: number[] = []
  let s = speed
  while (s > 2) { chain.push(2); s /= 2 }
  while (s < 0.5) { chain.push(0.5); s /= 0.5 }
  chain.push(Number(s.toFixed(3)))
  return chain.join(',atempo=')
}
