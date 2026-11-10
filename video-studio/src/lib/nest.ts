/**
 * nest.ts —— 序列嵌套（预渲染式）
 *
 * 干什么：把另一条序列整条渲染成一个视频素材，再作为普通片段放进当前序列。
 * 依赖：lib/exporter（WebM 实时录制）
 * 输入：目标序列（tracks/clips）、素材表、画布尺寸、帧率
 * 输出：WebM Blob
 *
 * 为什么用预渲染而不是实时递归：
 *   实时递归要重构三条渲染链路，风险高；预渲染复用现有导出引擎，行为可预期。
 *   代价是子序列改动后要重新渲染一次（视频剪辑软件里叫「预渲染/烘焙」，属于标准做法）。
 */

import { exportTimeline } from './exporter'
import type { Clip, MediaAsset, Track } from '../stores/project'

export interface NestSeq {
  id: string
  name: string
  tracks: Track[]
  clips: Clip[]
}

export async function renderSequenceToBlob(
  seq: NestSeq,
  assets: MediaAsset[],
  opts: { width: number; height: number; fps: number; onProgress?: (p: number, msg: string) => void },
): Promise<Blob> {
  const duration = seq.clips.length
    ? Math.max(...seq.clips.map(c => c.start + c.duration))
    : 0
  if (duration <= 0) throw new Error('这条序列是空的')

  const { blob } = await exportTimeline({
    clips: seq.clips,
    tracks: seq.tracks,
    assets,
    width: opts.width,
    height: opts.height,
    fps: opts.fps,
    duration,
    audioFromVideo: false,
    videoBitrate: 8_000_000,
    onProgress: opts.onProgress,
  })
  return blob
}
