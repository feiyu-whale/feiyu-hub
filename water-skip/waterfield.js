/**
 * 打水漂 · 水面波动场（二维线性波动方程数值解）
 * ------------------------------------------------------------
 * 方程：∂²h/∂t² = c²∇²h - 2γ·∂h/∂t
 * 用显式有限差分（CFL 条件：c·dt/dx ≤ 1/√2）
 *
 * 物理要点：
 * - 入水冲量 → 局部网格速度突变 → 波从该点向外传播
 * - 振幅按 1/√r 自然衰减（二维扩散），不是人为淡出
 * - 多波源自然干涉叠加
 */

class WaterField {
  /**
   * @param cols 横向网格数
   * @param rows 纵向网格数（纵向拉伸，营造透视）
   * @param c 波速（格/秒）
   */
  constructor(cols, rows, c) {
    this.cols = cols;
    this.rows = rows;
    this.n = cols * rows;
    this.c = c;
    this.gamma = 0.18;        // 阻尼（水的粘性耗散）

    // 三缓冲：当前、前一步、下一步
    this.h = new Float32Array(this.n);       // 高度
    this.hPrev = new Float32Array(this.n);
    this.hNext = new Float32Array(this.n);

    // 风场毛细波（静态相位，动态相位）
    this.windPhase = new Float32Array(this.n);
    for (let i = 0; i < this.n; i++) this.windPhase[i] = Math.random() * Math.PI * 2;
  }

  idx(c, r) { return r * this.cols + c; }

  /**
   * 施加冲量（石子入水）
   * @param cx,cy 网格坐标（可为小数）
   * @param strength 强度（负=向下压，水面对应产生波）
   * @param radius 影响半径（格）
   */
  /**
   * 渐进冲量：分多帧施加，模拟石子"接触水面"的过程（不是瞬间脉冲）
   * @param frames 分几帧施加完
   */
  impulseSmooth(cx, cy, strength, radius, frames) {
    this._pending = this._pending || [];
    this._pending.push({ cx, cy, s: strength / frames, radius, left: frames });
  }

  applyPending() {
    if (!this._pending || !this._pending.length) return;
    for (let i = this._pending.length - 1; i >= 0; i--) {
      const p = this._pending[i];
      this._impulseRaw(p.cx, p.cy, p.s, p.radius);
      p.left--;
      if (p.left <= 0) this._pending.splice(i, 1);
    }
  }

  impulse(cx, cy, strength, radius) {
    this._impulseRaw(cx, cy, strength, radius);
  }

  _impulseRaw(cx, cy, strength, radius) {
    const r2 = radius * radius;
    const c0 = Math.max(0, Math.floor(cx - radius));
    const c1 = Math.min(this.cols - 1, Math.ceil(cx + radius));
    const r0 = Math.max(0, Math.floor(cy - radius));
    const r1 = Math.min(this.rows - 1, Math.ceil(cy + radius));

    for (let r = r0; r <= r1; r++) {
      for (let c = c0; c <= c1; c++) {
        const dx = c - cx, dy = r - cy;
        const d2 = dx * dx + dy * dy;
        if (d2 > r2) continue;
        // 高斯形冲量分布（中心强、边缘弱）
        const w = Math.exp(-d2 / (r2 * 0.35));
        const i = this.idx(c, r);
        // 改速度而非位移：用"前一帧减去当前帧"来表达初速
        this.hPrev[i] -= strength * w;
      }
    }
  }

  /**
   * 单步演化
   * @param dt 秒
   */
  step(dt) {
    const { cols, rows, c, gamma, h, hPrev, hNext } = this;
    const dx = 1.0;
    // 显式差分：h_next = 2h - h_prev + (c·dt/dx)²·∇²h - 2γ·dt·(h - h_prev)
    const k = (c * dt / dx) * (c * dt / dx);
    const damp = 2 * gamma * dt;

    for (let r = 1; r < rows - 1; r++) {
      const base = r * cols;
      for (let col = 1; col < cols - 1; col++) {
        const i = base + col;
        const lap = h[i - 1] + h[i + 1] + h[i - cols] + h[i + cols] - 4 * h[i];
        const cur = h[i];
        const prev = hPrev[i];
        let next = 2 * cur - prev + k * lap - damp * (cur - prev);
        // 数值稳定：限幅
        if (next > 60) next = 60;
        else if (next < -60) next = -60;
        hNext[i] = next;
      }
    }

    // 边界：吸收（防反射回来形成假波）
    for (let col = 0; col < cols; col++) {
      const topI = col, botI = (rows - 1) * cols + col;
      hNext[topI] = hNext[topI + cols] * 0.6;
      hNext[botI] = hNext[botI - cols] * 0.6;
    }
    for (let r = 0; r < rows; r++) {
      const li = r * cols, ri = r * cols + cols - 1;
      hNext[li] = hNext[li + 1] * 0.6;
      hNext[ri] = hNext[ri - 1] * 0.6;
    }

    // 轮换缓冲
    this.hPrev.set(h);
    this.h.set(hNext);
  }

  /** 取高度（越界返 0） */
  at(col, r) {
    if (col < 0 || col >= this.cols || r < 0 || r >= this.rows) return 0;
    return this.h[this.idx(col, r)];
  }

  /** 风场毛细波高度（与冲击波叠加） */
  wind(col, r, t) {
    const i = this.idx(col, r);
    const ph = this.windPhase[i];
    // 只留低频：大浪 + 中涌。高频小纹全去掉（会在放大后变成噪点）
    return Math.sin(col * 0.045 + r * 0.022 + t * 0.20 + ph) * 0.95
         + Math.sin(col * 0.098 - r * 0.058 - t * 0.38 + ph * 1.7) * 0.55
         + Math.sin(col * 0.20 + r * 0.12 + t * 0.72 + ph * 2.3) * 0.28;
    }

  /** 总高度 = 冲击波 + 风场 */
  total(col, r, t) {
    return this.at(col, r) + this.wind(col, r, t);
  }

  clear() {
    this.h.fill(0);
    this.hPrev.fill(0);
    this.hNext.fill(0);
  }
}

if (typeof module !== 'undefined') module.exports = { WaterField };
