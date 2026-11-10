/**
 * 打水漂 · 物理内核（纯函数，可单独跑测试）
 * ------------------------------------------------------------
 * 1) 石子 = 扁平盘状刚体（姿态角 θ、自旋 ω、质量 m、转动惯量 I）
 * 2) 水动力 = 水翼升力 + 阻力（按入水角分解）
 * 3) 弹跳 = 接触冲量（法向恢复系数 e + 切向摩擦）
 * 4) 姿态 = 陀螺稳定（自旋快则姿态不易翻），翻过临界角则"咬水"沉没
 */

const PHYS = {
  g: 9.81,                 // m/s²
  // 石子：扁圆盘，半径 r，厚 t
  stone: { r: 0.03, thick: 0.006, mass: 0.02 },  // 半径3cm、厚6mm、20g（真实打水漂石子量级）
  rhoWater: 1000,          // 水密度
  rhoAir: 1.225,

  // 升力系数模型：CL 随攻角 α 变化（薄板近似 + 失速）
  // CL(α) = 2π·sin(α)·cos(α) 的薄翼解，限制在失速前
  stallAngle: 0.42,        // ≈24°
  clMax: 1.15,

  // 阻力系数：平板法向 ≈1.28，切向 ≈0.01
  cdNormal: 1.28,
  cdTangent: 0.012,

  // 接触参数
  restitution: 0.42,       // 法向恢复系数（水面不是完全弹性）
  friction: 0.22,          // 切向摩擦
  contactTime: 0.014,      // 单次接触时间 s

  // 沉没判据
  criticalAngle: 0.55,     // 姿态角超过 ≈31° 就"咬水"
  minNormalVel: 0.45,      // 法向速度低于此不再弹起

  // 积分
  dt: 1 / 480
};

/**
 * 攻角 → 升力系数
 * 薄翼理论 CL = 2π sinα cosα，超过失速角后陡降
 */
function liftCoeff(alpha) {
  const a = Math.abs(alpha);
  if (a < 1e-6) return 0;
  const aEff = Math.min(a, PHYS.stallAngle);
  let cl = 2 * Math.PI * Math.sin(aEff) * Math.cos(aEff);
  if (a > PHYS.stallAngle) {
    // 失速后衰减
    cl *= Math.max(0.25, 1 - (a - PHYS.stallAngle) / (Math.PI / 2 - PHYS.stallAngle) * 1.4);
  }
  return Math.min(cl, PHYS.clMax) * Math.sign(alpha);
}

/** 盘面面积 */
function discArea() {
  const { r } = PHYS.stone;
  return Math.PI * r * r;
}

/**
 * 计算水动力（升力 + 阻力）
 * @param vx,vy 质心速度 (m/s)
 * @param theta 姿态角 (rad) —— 盘面与水平面的夹角
 * @returns {fx, fy} 力 (N)
 */
function hydroForce(vx, vy, theta, immersion) {
  const { rhoWater, cdNormal, cdTangent } = PHYS;
  // 只算浸入水中的部分：immersion 0..1（0=刚擦过，1=全浸）
  const imm = Math.max(0, Math.min(1, immersion === undefined ? 1 : immersion));
  const S = discArea() * imm;
  const v2 = vx * vx + vy * vy;
  if (v2 < 1e-9 || S < 1e-12) return { fx: 0, fy: 0, alpha: 0 };

  const v = Math.sqrt(v2);
  // 速度方向与盘面的夹角（攻角）
  const velAngle = Math.atan2(vy, vx);
  const alpha = theta - velAngle;

  // 升力：垂直于来流
  const cl = liftCoeff(alpha);
  const q = 0.5 * rhoWater * v2 * S;   // 动压 × 面积
  const lift = q * cl;

  // 阻力：沿来流反方向，法向分量大、切向分量小
  const cdEff = cdTangent + (cdNormal - cdTangent) * Math.sin(alpha) * Math.sin(alpha);
  const drag = q * cdEff;

  const ux = vx / v, uy = vy / v;
  // 升力方向：来流的垂直方向
  const lx = -uy, ly = ux;
  // 攻角为负时升力反向
  const ls = Math.sign(cl);

  // 限幅：单次接触的最大力不超过 200 倍重力（防止数值发散）
  const maxF = PHYS.stone.mass * PHYS.g * 200;
  let fx = lx * lift * ls - ux * drag;
  let fy = ly * lift * ls - uy * drag;
  const fMag = Math.hypot(fx, fy);
  if (fMag > maxF && fMag > 0) {
    fx = fx / fMag * maxF;
    fy = fy / fMag * maxF;
  }

  return { fx, fy, alpha };
}

/**
 * 水面接触：计算弹跳后的速度与角速度
 * @returns {bounce:boolean, vx, vy, omega, energyLoss}
 */
function contact(vx, vy, theta, omega) {
  const { restitution, friction, criticalAngle, minNormalVel, stone } = PHYS;

  // 法向速度（向下为正）
  const vn = Math.abs(vy);
  if (vn < minNormalVel) {
    return { bounce: false, vx, vy, omega, reason: 'speed' };
  }

  // 姿态崩塌 → 咬水
  if (Math.abs(theta) > criticalAngle) {
    return { bounce: false, vx, vy, omega, reason: 'attitude' };
  }

  // 自旋不足 → 姿态不稳，翻
  const spinStability = Math.min(1, Math.abs(omega) * stone.r / 1.2);  // 边缘线速度 / 参考值（取绝对值：顺时针/逆时针都算）
  if (spinStability < 0.18) {
    return { bounce: false, vx, vy, omega, reason: 'spin' };
  }

  // 入水角越小（越贴），能量损失越小
  const incAngle = Math.atan2(vn, Math.abs(vx));
  const angleFactor = Math.cos(Math.min(incAngle, Math.PI / 2));  // 1=完全贴水

  // 法向反弹
  const newVy = -vn * restitution * (0.55 + 0.45 * angleFactor);
  // 切向：摩擦损失，但升力保住速度
  const tangential = vx * (1 - friction * (1 - angleFactor * 0.6));

  // 角速度衰减（接触耗散）
  const newOmega = omega * (0.88 + 0.10 * spinStability);

  return {
    bounce: true,
    vx: tangential,
    vy: newVy,
    omega: newOmega,
    reason: 'ok',
    energyLoss: 1 - Math.abs(newVy / (vn || 1))
  };
}

/**
 * 单步积分（RK2 中点法）
 */
function step(s, dt, inWater) {
  // 重力
  const ay0 = -PHYS.g;
  let fx = 0, fy = 0;
  if (inWater) {
    const h = hydroForce(s.vx, s.vy, s.theta);
    fx = h.fx / PHYS.stone.mass;
    fy = h.fy / PHYS.stone.mass;
    s.alpha = h.alpha;
  } else {
    s.alpha = 0;
  }

  // 中点
  const vxm = s.vx + (fx / 2) * dt;
  const vym = s.vy + ((fy + ay0) / 2) * dt;
  if (inWater) {
    const h2 = hydroForce(vxm, vym, s.theta);
    fx = h2.fx / PHYS.stone.mass;
    fy = h2.fy / PHYS.stone.mass;
  }

  s.vx += fx * dt;
  s.vy += (fy + ay0) * dt;
  s.x += s.vx * dt;
  s.y += s.vy * dt;
  s.theta += s.omega * dt;

  // 陀螺稳定：角速度在飞行中缓慢衰减
  s.omega *= Math.pow(0.9985, dt * 1000);

  return s;
}

if (typeof module !== 'undefined') {
  module.exports = { PHYS, liftCoeff, hydroForce, contact, step, discArea };
}
