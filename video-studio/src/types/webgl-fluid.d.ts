/** webgl-fluid 没有自带类型声明，这里补一个最小声明（MIT 库，仅用于开屏背景） */
declare module 'webgl-fluid' {
  interface FluidOptions {
    TRIGGER?: 'hover' | 'click'
    IMMEDIATE?: boolean
    AUTO?: boolean
    INTERVAL?: number
    SIM_RESOLUTION?: number
    DYE_RESOLUTION?: number
    DENSITY_DISSIPATION?: number
    VELOCITY_DISSIPATION?: number
    PRESSURE?: number
    PRESSURE_ITERATIONS?: number
    CURL?: number
    SPLAT_RADIUS?: number
    SPLAT_FORCE?: number
    SPLAT_COUNT?: number
    SHADING?: boolean
    COLORFUL?: boolean
    COLOR_UPDATE_SPEED?: number
    PAUSED?: boolean
    BACK_COLOR?: { r: number; g: number; b: number }
    TRANSPARENT?: boolean
    BLOOM?: boolean
    [key: string]: any
  }
  export default function WebGLFluid(canvas: HTMLCanvasElement | string, options?: FluidOptions): void
}
