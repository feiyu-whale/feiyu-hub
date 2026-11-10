/**
 * lutRenderer.ts —— 用 WebGL2 给画面套 3D LUT（.cube）
 *
 * 干什么：整帧三维查找表调色，硬件三线性插值，速度快、颜色准。
 * 依赖：WebGL2（Chrome 56+/安卓 WebView 58+）；不支持时返回 false，画面保持原样
 * 输入：CanvasRenderingContext2D（当前画面）+ Lut3D；输出：调色结果写回原画布
 *
 * 注意：调色放在「视频层合成后、字幕层之前」，所以字幕不会被染色。
 */

import type { Lut3D } from './lut'

const VERT = `#version 300 es
in vec2 aPos;
out vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`

const FRAG = `#version 300 es
precision highp float;
precision highp sampler3D;
in vec2 vUv;
uniform sampler2D uImage;
uniform sampler3D uLut;
out vec4 outColor;
void main() {
  vec3 c = texture(uImage, vec2(vUv.x, 1.0 - vUv.y)).rgb;
  vec3 g = texture(uLut, c).rgb;
  outColor = vec4(g, 1.0);
}`

interface Ctx {
  gl: WebGL2RenderingContext
  canvas: HTMLCanvasElement
  prog: WebGLProgram
  texImage: WebGLTexture
  texLut: WebGLTexture
  tmp: HTMLCanvasElement
  lutRef: Lut3D | null
}

let ctx: Ctx | null = null
let failed = false

function init(): Ctx | null {
  if (ctx) return ctx
  if (failed) return null
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2', { preserveDrawingBuffer: true, antialias: false })
    if (!gl) { failed = true; return null }

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!
      gl.shaderSource(s, src)
      gl.compileShader(s)
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(s) || 'shader compile failed')
      }
      return s
    }
    const prog = gl.createProgram()!
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT))
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG))
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(prog) || 'link failed')
    }
    gl.useProgram(prog)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, 'aPos')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

    const texImage = gl.createTexture()!
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, texImage)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

    const texLut = gl.createTexture()!
    gl.activeTexture(gl.TEXTURE1)
    gl.bindTexture(gl.TEXTURE_3D, texLut)
    gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE)

    gl.uniform1i(gl.getUniformLocation(prog, 'uImage'), 0)
    gl.uniform1i(gl.getUniformLocation(prog, 'uLut'), 1)

    ctx = {
      gl, canvas, prog, texImage, texLut,
      tmp: document.createElement('canvas'),
      lutRef: null,
    }
    return ctx
  } catch (e: any) {
    console.warn('[LUT] init failed:', e?.message || e)
    failed = true
    return null
  }
}

function uploadLut(c: Ctx, lut: Lut3D) {
  const { gl } = c
  const n = lut.size
  const px = new Uint8Array(n * n * n * 4)
  for (let i = 0; i < n * n * n; i++) {
    px[i * 4] = Math.max(0, Math.min(255, Math.round(lut.data[i * 3] * 255)))
    px[i * 4 + 1] = Math.max(0, Math.min(255, Math.round(lut.data[i * 3 + 1] * 255)))
    px[i * 4 + 2] = Math.max(0, Math.min(255, Math.round(lut.data[i * 3 + 2] * 255)))
    px[i * 4 + 3] = 255
  }
  gl.activeTexture(gl.TEXTURE1)
  gl.bindTexture(gl.TEXTURE_3D, c.texLut)
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4)
  gl.texImage3D(gl.TEXTURE_3D, 0, gl.RGBA8, n, n, n, 0, gl.RGBA, gl.UNSIGNED_BYTE, px)
  c.lutRef = lut
}

/** 把 LUT 应用到整块画布；失败返回 false（画面不动） */
export function applyLut(target: CanvasRenderingContext2D, lut: Lut3D | null): boolean {
  if (!lut) return false
  const c = init()
  if (!c) return false

  const src = target.canvas
  const w = src.width
  const h = src.height
  if (!w || !h) return false

  try {
    const { gl } = c
    c.tmp.width = w
    c.tmp.height = h
    const tctx = c.tmp.getContext('2d')!
    tctx.clearRect(0, 0, w, h)
    tctx.drawImage(src, 0, 0)

    if (c.canvas.width !== w || c.canvas.height !== h) {
      c.canvas.width = w
      c.canvas.height = h
    }
    gl.viewport(0, 0, w, h)
    gl.useProgram(c.prog)
    gl.disable(gl.BLEND)

    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, c.texImage)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c.tmp)

    if (c.lutRef !== lut) uploadLut(c, lut)

    gl.drawArrays(gl.TRIANGLES, 0, 3)

    target.save()
    target.filter = 'none'
    target.globalAlpha = 1
    target.globalCompositeOperation = 'copy'
    target.drawImage(c.canvas, 0, 0, w, h)
    target.restore()
    return true
  } catch (e: any) {
    console.warn('[LUT] apply failed:', e?.message || e)
    return false
  }
}

export function lutAvailable(): boolean {
  return !!init()
}
