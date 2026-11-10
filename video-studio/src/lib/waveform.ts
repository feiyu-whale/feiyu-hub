/**
 * waveform.ts —— 音频波形峰值提取
 *
 * 干什么：把音频文件解成一组峰值（0~1），给时间轴画波形用。
 * 依赖：浏览器原生 WebAudio（AudioContext.decodeAudioData），无第三方库
 * 输入：File/Blob + 桶数量；输出：number[]（长度 = 桶数量）
 */

export async function computePeaks(file: Blob, buckets = 900): Promise<number[]> {
  const Ctx: typeof AudioContext =
    (window as any).AudioContext || (window as any).webkitAudioContext
  if (!Ctx) return []

  const buf = await file.arrayBuffer()
  const ctx = new Ctx()
  let audio: AudioBuffer
  try {
    audio = await ctx.decodeAudioData(buf.slice(0))
  } finally {
    ctx.close().catch(() => {})
  }

  const ch0 = audio.getChannelData(0)
  const ch1 = audio.numberOfChannels > 1 ? audio.getChannelData(1) : null

  const n = Math.max(40, Math.min(buckets, Math.floor(audio.length / 32) || 40))
  const step = audio.length / n
  const peaks = new Array<number>(n)

  for (let i = 0; i < n; i++) {
    const start = Math.floor(i * step)
    const end = Math.min(audio.length, Math.floor((i + 1) * step))
    let max = 0
    // 每个桶最多采样 512 点，避免长音频卡死
    const stride = Math.max(1, Math.floor((end - start) / 512))
    for (let j = start; j < end; j += stride) {
      const a = ch0[j] ?? 0
      const b = ch1 ? ch1[j] ?? 0 : 0
      const v = Math.abs(a) + Math.abs(b) > 0 ? Math.max(Math.abs(a), Math.abs(b)) : 0
      if (v > max) max = v
    }
    peaks[i] = Math.min(1, max)
  }
  return peaks
}
