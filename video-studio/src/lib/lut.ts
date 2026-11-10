/**
 * lut.ts —— .cube 3D LUT 解析
 *
 * 干什么：把 Adobe/.cube 格式的调色查找表读成 GPU 能用的纹理数据。
 * 依赖：无
 * 输入：.cube 文本；输出：{ size, data: Float32Array(size³×3, 0~1) }
 */

export interface Lut3D {
  name: string
  size: number
  data: Float32Array
}

export function parseCube(text: string, fallbackName = 'LUT'): Lut3D {
  let size = 0
  let name = fallbackName
  const vals: number[] = []
  let domainMin = [0, 0, 0]
  let domainMax = [1, 1, 1]
  let scale = 1

  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim()
    if (!line || line.startsWith('#')) continue
    if (line.startsWith('TITLE')) {
      const m = line.match(/"([^"]*)"/)
      if (m) name = m[1]
      continue
    }
    if (line.startsWith('LUT_3D_SIZE')) { size = parseInt(line.split(/\s+/)[1], 10); continue }
    if (line.startsWith('LUT_1D_SIZE')) { throw new Error('暂不支持 1D LUT') }
    if (line.startsWith('DOMAIN_MIN')) { domainMin = line.split(/\s+/).slice(1, 4).map(Number); continue }
    if (line.startsWith('DOMAIN_MAX')) { domainMax = line.split(/\s+/).slice(1, 4).map(Number); continue }
    if (/^[-\d.]/.test(line)) {
      const parts = line.split(/\s+/).map(Number)
      if (parts.length >= 3) vals.push(parts[0], parts[1], parts[2])
      if (line.startsWith('LUT_3D_INPUT_RANGE')) continue
    }
    if (line.startsWith('LUT_3D_INPUT_RANGE')) {
      const p = line.split(/\s+/).slice(1).map(Number)
      if (p.length === 2) { domainMin = [p[0], p[0], p[0]]; domainMax = [p[1], p[1], p[1]] }
    }
  }

  if (!size || size < 2) throw new Error('不是有效的 3D LUT（缺少 LUT_3D_SIZE）')
  if (vals.length < size * size * size * 3) throw new Error('LUT 数据不完整')

  const n = size * size * size
  const data = new Float32Array(n * 3)
  const rScale = 1 / Math.max(1e-9, domainMax[0] - domainMin[0])
  const gScale = 1 / Math.max(1e-9, domainMax[1] - domainMin[1])
  const bScale = 1 / Math.max(1e-9, domainMax[2] - domainMin[2])

  for (let i = 0; i < n; i++) {
    data[i * 3] = Math.min(1, Math.max(0, (vals[i * 3] - domainMin[0]) * rScale))
    data[i * 3 + 1] = Math.min(1, Math.max(0, (vals[i * 3 + 1] - domainMin[1]) * gScale))
    data[i * 3 + 2] = Math.min(1, Math.max(0, (vals[i * 3 + 2] - domainMin[2]) * bScale))
  }
  void scale

  return { name, size, data }
}
