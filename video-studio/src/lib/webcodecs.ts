/**
 * WebCodecs + mp4box.js 解码器
 *
 * 思路：
 *  1. mp4box.js 把 mp4 拆成样本（samples）
 *  2. VideoDecoder 解出 VideoFrame
 *  3. 取最接近目标时间的那一帧画到 canvas
 *
 * 如果浏览器不支持 WebCodecs / 解不出关键帧，外部调用方负责降级。
 */

import { createFile } from 'mp4box'
const MP4Box = { createFile: createFile as any }

export interface DecoderMeta {
  duration: number
  width: number
  height: number
  codec: string
  fps: number
  nbSamples: number
}

export class Mp4FrameDecoder {
  private decoder: VideoDecoder | null = null
  private samples: any[] = []
  private meta: DecoderMeta | null = null
  private ready = false
  private pending = new Map<number, (f: VideoFrame | null) => void>()
  private lastFrame: VideoFrame | null = null
  private queue: number[] = []

  get metaInfo() { return this.meta }
  get isReady() { return this.ready }

  /** 读取文件 + 建解码器 */
  async open(file: File, onProgress?: (p: number) => void): Promise<DecoderMeta> {
    if (typeof (window as any).VideoDecoder === 'undefined') {
      throw new Error('浏览器不支持 WebCodecs')
    }

    const buf = await file.arrayBuffer()
    const mp4 = MP4Box.createFile()

    mp4.onReady = (info: any) => {
      const track = info.videoTracks?.[0]
      if (!track) throw new Error('没有视频轨')

      const desc = (track as any).codec
      const description = this.buildDescription(mp4, track.id)

      this.decoder = new VideoDecoder({
        output: (frame) => this.onFrame(frame),
        error: (e) => console.error('[decoder]', e),
      })

      this.decoder.configure({
        codec: desc,
        codedWidth: track.video.width,
        codedHeight: track.video.height,
        description,
        optimizeForLatency: true,
      })

      this.meta = {
        duration: track.duration / track.timescale,
        width: track.video.width,
        height: track.video.height,
        codec: desc,
        fps: track.nb_samples / (track.duration / track.timescale) || 30,
        nbSamples: track.nb_samples,
      }

      mp4.setExtractionOptions(track.id, null, { nbSamples: 100 })
      mp4.start()
    }

    let collected = 0
    const track0 = { id: -1 }
    mp4.onSamples = (_id: number, _user: any, samples: any[]) => {
      for (const s of samples) {
        this.samples.push(s)
        collected++
      }
      if (this.meta) onProgress?.(Math.min(1, collected / this.meta.nbSamples))
    }

    // 追加数据（分块，避免大文件一次性占内存）
    const CHUNK = 8 * 1024 * 1024
    for (let off = 0; off < buf.byteLength; off += CHUNK) {
      const slice = buf.slice(off, off + CHUNK)
      ;(slice as any).fileStart = off
      mp4.appendBuffer(slice)
    }
    mp4.flush()

    // 等 onReady 跑完
    await new Promise<void>((res, rej) => {
      const t0 = Date.now()
      const check = () => {
        if (this.meta) return res()
        if (Date.now() - t0 > 20000) return rej(new Error('解析 mp4 超时'))
        setTimeout(check, 30)
      }
      check()
    })

    // 抽样本也走完
    await new Promise<void>((res) => {
      const t0 = Date.now()
      const check = () => {
        if (this.samples.length >= (this.meta?.nbSamples ?? 0) || Date.now() - t0 > 30000) return res()
        setTimeout(check, 40)
      }
      check()
    })

    this.ready = true
    void track0

    // 先解出第一帧（关键帧）
    const kf = this.samples.findIndex(s => s.is_sync)
    if (kf >= 0) await this.seekTo(this.samples[kf].cts / this.samples[kf].timescale)

    return this.meta!
  }

  private buildDescription(mp4: any, trackId: number) {
    try {
      const trak = mp4.getTrackById(trackId)
      for (const entry of trak.mdia.minf.stbl.stsd.entries) {
        const box = entry.avcC || entry.hvcC || entry.vpcC || entry.av1C
        if (box) {
          const stream = new (window as any).DataStream(
            undefined, 0, (window as any).DataStream.BIG_ENDIAN
          )
          box.write(stream)
          return new Uint8Array(stream.buffer, 8) // 去掉 box header
        }
      }
    } catch { /* 有些编码器不需要 description */ }
    return undefined
  }

  private onFrame(frame: VideoFrame) {
    // 找出这帧对应的 cts
    const idx = frame.timestamp
    const cb = this.pending.get(idx)
    if (this.lastFrame && this.lastFrame !== frame) {
      try { this.lastFrame.close() } catch { /* ignore */ }
    }
    this.lastFrame = frame
    if (cb) {
      this.pending.delete(idx)
      cb(frame.clone())
      this.drainQueue()
    }
  }

  private drainQueue() {
    if (!this.decoder || !this.queue.length) return
    if (this.decoder.decodeQueueSize > 8) return
    const next = this.queue.shift()!
    this.feedSample(next)
  }

  private feedSample(index: number) {
    if (!this.decoder) return
    const s = this.samples[index]
    if (!s) return
    const chunk = new (window as any).EncodedVideoChunk({
      type: s.is_sync ? 'key' : 'delta',
      timestamp: Math.round(s.cts * 1e6 / s.timescale),
      duration: Math.round(s.duration * 1e6 / s.timescale),
      data: s.data,
    })
    this.decoder.decode(chunk)
  }

  /** 跳到指定时间，返回最接近的那帧 */
  seekTo(timeSec: number): Promise<VideoFrame | null> {
    return new Promise((resolve) => {
      if (!this.ready || !this.decoder) return resolve(null)

      // 找目标时间之前最近的同步帧
      let keyIdx = 0
      for (let i = 0; i < this.samples.length; i++) {
        const t = this.samples[i].cts / this.samples[i].timescale
        if (this.samples[i].is_sync && t <= timeSec) keyIdx = i
        if (t > timeSec) break
      }

      this.decoder.flush().catch(() => {})

      let lastGood: VideoFrame | null = null
      let settled = false

      const finish = (f: VideoFrame | null) => {
        if (settled) return
        settled = true
        resolve(f)
      }

      // 从关键帧往后解，直到超过目标时间
      let idx = keyIdx
      const step = () => {
        if (settled) return
        if (idx >= this.samples.length) return finish(lastGood)
        const s = this.samples[idx]
        const t = s.cts / s.timescale
        if (t > timeSec + 0.001 && lastGood) return finish(lastGood)

        const oldOutput = this.decoder!.decodeQueueSize
        this.feedSample(idx)
        idx++

        const wait = () => {
          if (settled) return
          if (this.decoder!.decodeQueueSize === 0 && this.lastFrame) {
            lastGood = this.lastFrame.clone()
          }
          step()
        }
        setTimeout(wait, 4)
        void oldOutput
      }

      step()
      // 兜底超时
      setTimeout(() => finish(lastGood), 3000)
    })
  }

  close() {
    try { this.decoder?.close() } catch { /* ignore */ }
    try { this.lastFrame?.close() } catch { /* ignore */ }
    this.lastFrame = null
    this.ready = false
  }
}

/** 探测浏览器是否真能用 WebCodecs 解视频 */
export async function probeWebCodecs(): Promise<'full' | 'partial' | 'none'> {
  const VD = (window as any).VideoDecoder
  if (!VD) return 'none'
  try {
    const cfg = { codec: 'avc1.42001f', codedWidth: 640, codedHeight: 360 }
    const support = await VD.isConfigSupported(cfg)
    return support?.supported ? 'full' : 'partial'
  } catch {
    return 'partial'
  }
}
