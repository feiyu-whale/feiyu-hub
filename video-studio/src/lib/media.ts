/**
 * 媒体导入工具：读文件 → 探测时长/尺寸 → 抽缩略图
 * 全部在浏览器本地完成，不上传任何数据。
 */

export interface ProbeResult {
  duration: number
  width: number
  height: number
  kind: 'video' | 'audio'
}

/** 用 <video>/<audio> 探测时长和尺寸 */
export function probeMedia(url: string, kind: 'video' | 'audio'): Promise<ProbeResult> {
  return new Promise((resolve, reject) => {
    const el = document.createElement(kind)
    el.preload = 'metadata'
    ;(el as HTMLMediaElement).src = url

    const done = () => {
      resolve({
        duration: el.duration || 0,
        width: kind === 'video' ? (el as HTMLVideoElement).videoWidth : 0,
        height: kind === 'video' ? (el as HTMLVideoElement).videoHeight : 0,
        kind,
      })
    }

    el.onloadedmetadata = () => {
      // 某些浏览器 metadata 到了但 duration 是 Infinity，等一小会儿
      if (el.duration === Infinity || isNaN(el.duration)) {
        el.currentTime = 1e101
        el.ontimeupdate = () => {
          el.ontimeupdate = null
          el.currentTime = 0
          done()
        }
      } else {
        done()
      }
    }
    el.onerror = () => reject(new Error('无法读取媒体信息'))
    setTimeout(() => reject(new Error('读取超时')), 15000)
  })
}

/** 从视频抽 N 张缩略图（canvas） */
export function extractThumbs(
  url: string,
  duration: number,
  count = 8,
  thumbWidth = 160
): Promise<string[]> {
  return new Promise((resolve) => {
    const video = document.createElement('video')
    video.src = url
    video.muted = true
    video.playsInline = true
    video.preload = 'auto'

    const out: string[] = []
    let i = 0

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!

    const fail = () => resolve(out)   // 抽不到就返回已抽到的，不阻塞流程

    video.onloadeddata = () => {
      const ratio = video.videoHeight / video.videoWidth || 0.5625
      canvas.width = thumbWidth
      canvas.height = Math.round(thumbWidth * ratio)

      const seekNext = () => {
        if (i >= count) { resolve(out); return }
        // 均匀分布，避开 0 和结尾
        video.currentTime = duration * (i + 0.5) / count
      }

      video.onseeked = () => {
        try {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
          out.push(canvas.toDataURL('image/jpeg', 0.6))
        } catch {
          fail(); return
        }
        i++
        seekNext()
      }

      seekNext()
    }
    video.onerror = fail
    setTimeout(fail, 20000)
  })
}

/** 人话格式 */
export function fmtDuration(s: number) {
  if (!isFinite(s) || s <= 0) return '0:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${String(sec).padStart(2, '0')}`
}

export function fmtSize(bytes: number) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1048576) return (bytes / 1024).toFixed(0) + ' KB'
  if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB'
  return (bytes / 1073741824).toFixed(2) + ' GB'
}
