/**
 * interchange.ts —— 与别的剪辑软件互通（EDL / FCPXML）
 *
 * 干什么：把时间轴导出成 CMX3600 EDL 和 Final Cut Pro X 的 FCPXML。
 * 依赖：无（纯字符串生成）
 * 输入：片段、素材、帧率、画布尺寸；输出：文本
 *
 * 说明：只导出「剪点与时长」这类结构信息，特效/调色不在互通范围内（行业惯例）。
 */

import type { Clip, MediaAsset } from '../stores/project'

function pad(n: number, len = 2) { return String(n).padStart(len, '0') }

export function toTimecode(sec: number, fps: number): string {
  const f = Math.max(1, Math.round(fps))
  const total = Math.max(0, Math.round(sec * f))
  const frames = total % f
  const totalSec = Math.floor(total / f)
  const s = totalSec % 60
  const m = Math.floor(totalSec / 60) % 60
  const h = Math.floor(totalSec / 3600)
  return `${pad(h)}:${pad(m)}:${pad(s)}:${pad(frames)}`
}

/** CMX3600 EDL（Premiere / DaVinci / Avid 都能读） */
export function toEdl(clips: Clip[], assets: MediaAsset[], fps: number, title = 'FEIYU PROJECT'): string {
  const list = [...clips]
    .filter(c => c.kind !== 'text')
    .sort((a, b) => a.start - b.start)

  const lines: string[] = ['TITLE: ' + title, 'FCM: NON-DROP FRAME', '']
  let recStart = 0

  list.forEach((c, i) => {
    const asset = assets.find(a => a.id === c.assetId)
    const reel = 'AX'
    const srcIn = toTimecode(c.inPoint, fps)
    const srcOut = toTimecode(c.inPoint + c.duration * c.speed, fps)
    const recIn = toTimecode(recStart, fps)
    const recOut = toTimecode(recStart + c.duration, fps)
    const n = pad(i + 1, 3)

    lines.push(`${n}  ${reel.padEnd(8)} V     C        ${srcIn} ${srcOut} ${recIn} ${recOut}`)
    lines.push(`* FROM CLIP NAME: ${asset?.name || c.name}`)
    lines.push('')
    recStart += c.duration
  })

  return lines.join('\n')
}

/** Final Cut Pro X FCPXML 1.9 */
export function toFcpxml(
  clips: Clip[],
  assets: MediaAsset[],
  opts: { fps: number; width: number; height: number; name?: string },
): string {
  const { fps, width, height } = opts
  const name = opts.name || '肥鱼剪辑台'
  const f = Math.max(1, Math.round(fps))
  const frames = (s: number) => Math.max(0, Math.round(s * f))
  const rt = (s: number) => `${frames(s)}/${f}s`

  const list = [...clips].filter(c => c.kind !== 'text').sort((a, b) => a.start - b.start)
  const total = list.reduce((m, c) => Math.max(m, c.start + c.duration), 0)

  const usedAssets = Array.from(new Set(list.map(c => c.assetId).filter(Boolean))) as string[]
  const assetXml = usedAssets.map((id, i) => {
    const a = assets.find(x => x.id === id)
    if (!a) return ''
    return `    <asset id="a${i + 1}" name="${esc(a.name)}" src="file://./media/${esc(a.name)}" duration="${rt(a.duration)}" hasVideo="1" hasAudio="1" format="r1"/>`
  }).filter(Boolean).join('\n')

  const spine = list.map(c => {
    const idx = usedAssets.indexOf(c.assetId || '')
    const ref = idx >= 0 ? `a${idx + 1}` : 'a1'
    return `        <clip offset="${rt(c.start)}" duration="${rt(c.duration)}" start="${rt(c.inPoint)}" name="${esc(c.name)}">
          <video ref="${ref}" offset="0s" duration="${rt(c.duration)}"/>
        </clip>`
  }).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE fcpxml>
<fcpxml version="1.9">
  <resources>
    <format id="r1" name="FFVideoFormat${height}p${f}" frameDuration="1/${f}s" width="${width}" height="${height}"/>
${assetXml}
  </resources>
  <library>
    <event name="${esc(name)}">
      <project name="${esc(name)}">
        <sequence format="r1" duration="${rt(total)}" tcStart="0s" tcFormat="NDF" audioLayout="stereo" audioRate="48k">
          <spine>
${spine}
          </spine>
        </sequence>
      </project>
    </event>
  </library>
</fcpxml>
`
}

function esc(s: string) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
