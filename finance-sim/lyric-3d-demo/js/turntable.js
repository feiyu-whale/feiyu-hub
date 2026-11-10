/**
 * turntable.js —— 唱片机（歌词的载体）
 *
 * 干什么：造一台唱片机模型，唱盘随音乐转；歌词从喇叭口飘出来。
 * 用了什么库：three.js（MIT）几何体，全部程序生成，零外部模型文件
 * 输入：THREE 命名空间
 * 输出：{ group, update(dt, level, playing), getHornWorldPos, vinylGroup, haloRing }
 *
 * ══════════════════════════════════════════════════════════
 * 【v1.5.0 机身重做】老爹：「我知道是女儿手搓的，但是确实是看起来不太高级」
 *
 * 病因（我自己认）：
 *   旧版全是 BoxGeometry —— 一个方块摞一个方块，八条棱全是 90° 直角。
 *   现实里没有一件工业产品是这种直角；真机的高级感八成来自**倒角**——
 *   光打在圆角上会顺着转过去，形成一道渐变高光；打在直角上只有"亮面/暗面"两格，
 *   所以看着像乐高。
 *
 * 这一版做的四件事：
 *   ① 所有板材改成**圆角 + 倒角挤出**（ExtrudeGeometry + bevel），光会顺着棱绕过去
 *   ② 材质换 **MeshPhysicalMaterial + clearcoat** —— 阳极氧化铝的漆面感、清漆层
 *   ③ 做**材质分层**：顶盖/侧身/底座三层不同深浅，不再是一坨同色
 *   ④ 补真实细节：机脚橡胶垫、螺丝、散热缝、铭牌、唱臂轴承、配重环
 * ══════════════════════════════════════════════════════════
 */

export function createTurntable(THREE) {
  const group = new THREE.Group();

  /* ============ 工具：圆角矩形 → 倒角挤出 ============ */
  /* 这是"高级感"的技术核心：直角 → 圆角。
     做法是先画一个圆角矩形路径（Shape），再带 bevel 挤成有厚度的板。
     curveSegments 控制圆角精度，bevelSegments 控制倒角精度。 */
  function roundedShape(w, d, r) {
    const s = new THREE.Shape();
    const x = -w / 2, y = -d / 2;
    const rr = Math.min(r, Math.min(w, d) / 2 - 0.001);
    s.moveTo(x + rr, y);
    s.lineTo(x + w - rr, y);
    s.quadraticCurveTo(x + w, y, x + w, y + rr);
    s.lineTo(x + w, y + d - rr);
    s.quadraticCurveTo(x + w, y + d, x + w - rr, y + d);
    s.lineTo(x + rr, y + d);
    s.quadraticCurveTo(x, y + d, x, y + d - rr);
    s.lineTo(x, y + rr);
    s.quadraticCurveTo(x, y, x + rr, y);
    return s;
  }

  /** 圆角板：躺平放置（沿 Y 方向有厚度） */
  function roundedPlate(w, d, h, r, bevel = 0.035) {
    const geo = new THREE.ExtrudeGeometry(roundedShape(w, d, r), {
      depth: Math.max(0.001, h - bevel * 2),
      bevelEnabled: true,
      bevelThickness: bevel,
      bevelSize: bevel,
      bevelOffset: 0,
      bevelSegments: 3,
      curveSegments: 28,
    });
    geo.rotateX(-Math.PI / 2);       // 挤出方向 Z → 转成 Y（平躺）
    geo.translate(0, 0, 0);
    geo.computeVertexNormals();
    return geo;
  }

  /* ============ 材质：分层 + 清漆 ============ */
  /* 关键改动：MeshStandardMaterial → MeshPhysicalMaterial
     clearcoat 是真实漆面才有的"清漆层"——光在漆下面反射、表面再压一层高光，
     这正是阳极氧化铝 / 钢琴漆看起来"贵"的原因。 */
  const matBody = new THREE.MeshPhysicalMaterial({
    color: 0x2b3442, roughness: 0.34, metalness: 0.72,
    clearcoat: 0.55, clearcoatRoughness: 0.28,
  });
  const matTop = new THREE.MeshPhysicalMaterial({
    color: 0x4d5866, roughness: 0.26, metalness: 0.82,
    clearcoat: 0.75, clearcoatRoughness: 0.16,
  });
  const matTrim = new THREE.MeshStandardMaterial({
    color: 0xd8b45a, roughness: 0.16, metalness: 1.0,
    emissive: 0x2a1f06, emissiveIntensity: 0.5,
  });
  const matVinyl = new THREE.MeshPhysicalMaterial({
    color: 0x0b0e13, roughness: 0.12, metalness: 0.35,
    clearcoat: 1.0, clearcoatRoughness: 0.06,
  });
  const matLabel = new THREE.MeshStandardMaterial({
    color: 0x1b4c72, roughness: 0.55, metalness: 0.15,
    emissive: 0x0d2233, emissiveIntensity: 1.0,
  });
  const matMetal = new THREE.MeshPhysicalMaterial({
    color: 0xc4ccd8, roughness: 0.10, metalness: 1.0,
    clearcoat: 0.9, clearcoatRoughness: 0.05,
  });
  const matGlow = new THREE.MeshBasicMaterial({
    color: 0x6fd8ff, transparent: true, opacity: 0.9,
  });
  const matRubber = new THREE.MeshStandardMaterial({
    color: 0x14171c, roughness: 0.95, metalness: 0.0,
  });
  const matDark = new THREE.MeshStandardMaterial({
    color: 0x0d1116, roughness: 0.6, metalness: 0.5,
  });

  /* ============ 机身尺寸 ============ */
  const caseW = 5.2;
  const caseD = 4.0;
  const caseH = 0.55;

  /* ---------- ① 底座（圆角 + 倒角） ---------- */
  const basePlate = new THREE.Mesh(roundedPlate(caseW, caseD, caseH, 0.34, 0.05), matBody);
  basePlate.position.y = caseH / 2;
  basePlate.castShadow = true;
  basePlate.receiveShadow = true;
  group.add(basePlate);

  /* ---------- ② 顶盖（比底座内缩一圈，形成台阶感） ---------- */
  const topPlate = new THREE.Mesh(roundedPlate(caseW - 0.30, caseD - 0.30, 0.10, 0.28, 0.028), matTop);
  topPlate.position.y = caseH + 0.02;
  topPlate.castShadow = true;
  topPlate.receiveShadow = true;
  group.add(topPlate);

  /* ---------- ③ 金色腰线（夹在底座与顶盖之间的一圈细边） ---------- */
  /* 用稍大一圈的扁圆角板，只露出侧面 → 看起来就是一圈金线。
     真实器材上这种细节叫"饰条"，是拉开档次的关键。 */
  const waist = new THREE.Mesh(roundedPlate(caseW + 0.015, caseD + 0.015, 0.035, 0.345, 0.008), matTrim);
  waist.position.y = caseH - 0.004;
  group.add(waist);

  /* ---------- ④ 顶面散热缝（细长凹槽） ---------- */
  const slotGeo = new THREE.BoxGeometry(caseW - 1.05, 0.012, 0.028);
  for (let i = 0; i < 4; i++) {
    const slot = new THREE.Mesh(slotGeo, matDark);
    slot.position.set(0.05, caseH + 0.072, -1.15 + i * 0.15);
    group.add(slot);
  }

  /* ---------- ⑤ 机脚：金属柱 + 橡胶垫 ---------- */
  const footX = caseW / 2 - 0.5;
  const footZ = caseD / 2 - 0.5;
  const footPos = [
    [-footX, footZ], [footX, footZ],
    [-footX, -footZ], [footX, -footZ],
  ];
  const footMetalGeo = new THREE.CylinderGeometry(0.17, 0.15, 0.14, 20);
  const footRubberGeo = new THREE.CylinderGeometry(0.15, 0.13, 0.035, 20);
  for (const [x, z] of footPos) {
    const fm = new THREE.Mesh(footMetalGeo, matMetal);
    fm.position.set(x, -0.07, z);
    fm.castShadow = true;
    group.add(fm);
    const fr = new THREE.Mesh(footRubberGeo, matRubber);
    fr.position.set(x, -0.155, z);
    group.add(fr);
  }

  /* ---------- ⑥ 螺丝（顶盖四角） ---------- */
  /* 直径 5 毫米级别的小东西，但少了就不像真机——这就是"细节密度"。 */
  const screwGeo = new THREE.CylinderGeometry(0.032, 0.032, 0.02, 12);
  const screwSlotGeo = new THREE.BoxGeometry(0.05, 0.012, 0.012);
  const screwPos = [
    [-caseW / 2 + 0.42, caseD / 2 - 0.42],
    [caseW / 2 - 0.42, caseD / 2 - 0.42],
    [-caseW / 2 + 0.42, -caseD / 2 + 0.42],
    [caseW / 2 - 0.42, -caseD / 2 + 0.42],
  ];
  for (const [x, z] of screwPos) {
    const sc = new THREE.Mesh(screwGeo, matMetal);
    sc.position.set(x, caseH + 0.075, z);
    group.add(sc);
    const sl = new THREE.Mesh(screwSlotGeo, matDark);
    sl.position.set(x, caseH + 0.086, z);
    sl.rotation.y = Math.PI / 4;
    group.add(sl);
  }

  /* ---------- ⑦ 铭牌（右下角一小块金片） ---------- */
  const plaqueGeo = roundedPlate(0.62, 0.16, 0.022, 0.03, 0.006);
  const plaque = new THREE.Mesh(plaqueGeo, matTrim);
  plaque.position.set(caseW / 2 - 0.72, caseH + 0.072, caseD / 2 - 0.62);
  group.add(plaque);

  /* ============ ⑧ 唱盘 ============ */
  const platterGroup = new THREE.Group();
  platterGroup.position.set(-0.85, caseH + 0.06, 0);
  group.add(platterGroup);

  /* 转盘主体：外沿做一点收边（上窄下宽），不再是纯圆柱 */
  const platter = new THREE.Mesh(
    new THREE.CylinderGeometry(1.44, 1.46, 0.09, 64),
    matMetal
  );
  platter.position.y = 0.045;
  platter.castShadow = true;
  platter.receiveShadow = true;
  platterGroup.add(platter);

  /* 转盘外圈的倒角亮环：机器车出来的边缘反光 */
  const platterRim = new THREE.Mesh(
    new THREE.TorusGeometry(1.44, 0.018, 8, 96),
    matMetal
  );
  platterRim.rotation.x = Math.PI / 2;
  platterRim.position.y = 0.09;
  platterGroup.add(platterRim);

  /* 转盘侧壁的细纹（一圈薄环，暗示车削痕迹） */
  const platterStep = new THREE.Mesh(
    new THREE.CylinderGeometry(1.40, 1.40, 0.012, 64),
    matDark
  );
  platterStep.position.y = 0.016;
  platterGroup.add(platterStep);

  /* ============ ⑨ 黑胶唱片 ============ */
  const vinylGroup = new THREE.Group();
  vinylGroup.position.y = 0.098;
  platterGroup.add(vinylGroup);

  const disc = new THREE.Mesh(
    new THREE.CylinderGeometry(1.34, 1.34, 0.042, 96),
    matVinyl
  );
  disc.receiveShadow = true;
  vinylGroup.add(disc);

  /* 唱片外缘倒角 */
  const discEdge = new THREE.Mesh(
    new THREE.TorusGeometry(1.335, 0.012, 6, 96),
    new THREE.MeshStandardMaterial({ color: 0x1a2028, roughness: 0.3, metalness: 0.6 })
  );
  discEdge.rotation.x = Math.PI / 2;
  discEdge.position.y = 0.021;
  vinylGroup.add(discEdge);

  /* 唱片纹路：同心细环（黑胶的识别特征） */
  const grooveMatA = new THREE.MeshBasicMaterial({ color: 0x3a434f, transparent: true, opacity: 0.62 });
  const grooveMatB = new THREE.MeshBasicMaterial({ color: 0x0e1116, transparent: true, opacity: 0.8 });
  for (let i = 0; i < 30; i++) {
    const r = 0.44 + i * 0.029;
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(r, 0.0026, 3, 80),
      i % 2 ? grooveMatA : grooveMatB
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.023;
    vinylGroup.add(ring);
  }

  /* 盘面光弧（让旋转看得出来） */
  const sheen = new THREE.Mesh(
    new THREE.RingGeometry(0.5, 1.32, 64, 1, Math.PI * 0.18, Math.PI * 0.30),
    new THREE.MeshBasicMaterial({
      color: 0x9ad4f5, transparent: true, opacity: 0.14,
      side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false,
    })
  );
  sheen.rotation.x = -Math.PI / 2;
  sheen.position.y = 0.027;
  vinylGroup.add(sheen);

  /* 唱片标签 */
  const label = new THREE.Mesh(
    new THREE.CylinderGeometry(0.42, 0.42, 0.046, 48),
    matLabel
  );
  label.position.y = 0.024;
  vinylGroup.add(label);

  /* 标签边圈金线 */
  const labelRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.42, 0.008, 6, 48),
    matTrim
  );
  labelRing.rotation.x = Math.PI / 2;
  labelRing.position.y = 0.048;
  vinylGroup.add(labelRing);

  /* 中心轴 */
  const spindle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.032, 0.038, 0.15, 16),
    matMetal
  );
  spindle.position.y = 0.085;
  vinylGroup.add(spindle);

  /* 标签上的高光点（监听时亮起） */
  const pulseDot = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 12), matGlow);
  pulseDot.position.set(0.24, 0.05, 0);
  vinylGroup.add(pulseDot);

  /* ============ ⑩ 音频可视化光环 ============ */
  const haloRing = new THREE.Mesh(
    new THREE.TorusGeometry(1.5, 0.020, 6, 96),
    new THREE.MeshBasicMaterial({ color: 0x6fd8ff, transparent: true, opacity: 0.0 })
  );
  haloRing.rotation.x = Math.PI / 2;
  haloRing.position.y = 0.035;
  platterGroup.add(haloRing);

  /* 三层扩散环（v1.4.2 加的，v1.5.0 保留） */
  const haloRings = [];
  for (let i = 0; i < 3; i++) {
    const r = 1.5 + i * 0.30;
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(r, 0.014 - i * 0.003, 6, 96),
      new THREE.MeshBasicMaterial({
        color: i === 0 ? 0x6fd8ff : (i === 1 ? 0x9ec8ff : 0xffb066),
        transparent: true, opacity: 0,
      })
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.035 + i * 0.004;
    ring.userData.phase = i * 0.42;
    ring.userData.base = 1.5 + i * 0.30;
    platterGroup.add(ring);
    haloRings.push(ring);
  }

  /* ============ ⑪ 唱臂 ============ */
  const armPivot = new THREE.Group();
  armPivot.position.set(1.92, caseH + 0.10, -1.12);
  group.add(armPivot);

  /* 轴承座：三段圆柱叠起来（底大顶小），有真实轴承的层次 */
  const armBaseLow = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.26, 0.07, 24), matMetal);
  armBaseLow.position.set(1.92, caseH + 0.06, -1.12);
  armBaseLow.castShadow = true;
  group.add(armBaseLow);

  const armBaseMid = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.20, 0.06, 24), matMetal);
  armBaseMid.position.set(1.92, caseH + 0.12, -1.12);
  group.add(armBaseMid);

  /* 轴承顶盖 + 金色装饰环 */
  const armCap = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.14, 0.05, 20), matBody);
  armCap.position.set(1.92, caseH + 0.17, -1.12);
  group.add(armCap);

  const armCapRing = new THREE.Mesh(new THREE.TorusGeometry(0.115, 0.010, 6, 32), matTrim);
  armCapRing.rotation.x = Math.PI / 2;
  armCapRing.position.set(1.92, caseH + 0.195, -1.12);
  group.add(armCapRing);

  /* 唱臂杆：用胶囊体，两端是圆的（不是切平的方块） */
  const armRod = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.042, 2.95, 8, 20),
    matMetal
  );
  armRod.rotation.z = Math.PI / 2;
  armRod.position.set(-1.30, 0.06, 0);
  armRod.castShadow = true;
  armPivot.add(armRod);

  /* 唱头壳：斜切的梯形，不是方块 */
  const headShellGeo = new THREE.CylinderGeometry(0.20, 0.13, 0.34, 4);
  const headshell = new THREE.Mesh(headShellGeo, matTrim);
  headshell.rotation.z = Math.PI / 2;
  headshell.rotation.y = Math.PI / 4;
  headshell.position.set(-2.22, 0.02, 0);
  headshell.castShadow = true;
  armPivot.add(headshell);

  /* 唱针 */
  const needle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.010, 0.003, 0.15, 8),
    new THREE.MeshStandardMaterial({ color: 0xdfe6f0, roughness: 0.2, metalness: 1.0 })
  );
  needle.position.set(-2.22, -0.085, 0);
  armPivot.add(needle);

  /* 配重：金属圆柱 + 尾部金环 */
  const counter = new THREE.Mesh(
    new THREE.CylinderGeometry(0.115, 0.115, 0.22, 24),
    matBody
  );
  counter.rotation.z = Math.PI / 2;
  counter.position.set(0.10, 0.06, 0);
  armPivot.add(counter);

  const counterRing = new THREE.Mesh(new THREE.TorusGeometry(0.118, 0.008, 6, 24), matTrim);
  counterRing.rotation.y = Math.PI / 2;
  counterRing.position.set(0.21, 0.06, 0);
  armPivot.add(counterRing);

  armPivot.rotation.y = -0.28;

  /* ============ ⑫ 喇叭（歌词由此飘出） ============ */
  /* 【不动】位置与朝向由歌词出口决定，改了 getHornWorldPos 会跟着变，
     但视觉上老爹已经确认过这个尺寸，这里只换材质。 */
  const hornGroup = new THREE.Group();
  hornGroup.position.set(0, caseH + 0.06, -1.95);
  group.add(hornGroup);

  const hornStem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.10, 0.155, 0.46, 24),
    matMetal
  );
  hornStem.position.y = 0.23;
  hornStem.castShadow = true;
  hornGroup.add(hornStem);

  const hornCone = new THREE.Mesh(
    new THREE.CylinderGeometry(0.42, 0.13, 0.60, 32, 1, true),
    new THREE.MeshPhysicalMaterial({
      color: 0xb9bfc8, roughness: 0.22, metalness: 0.92,
      side: THREE.DoubleSide, clearcoat: 0.6, clearcoatRoughness: 0.2,
    })
  );
  hornCone.position.y = 0.23 + 0.46 / 2 + 0.30 * Math.cos(0.42);
  hornCone.rotation.x = -0.42;
  hornCone.castShadow = true;
  hornGroup.add(hornCone);

  const hornRim = new THREE.Mesh(
    new THREE.TorusGeometry(0.42, 0.020, 8, 40),
    matTrim
  );
  hornRim.position.y = hornCone.position.y + Math.cos(0.42) * 0.30;
  hornRim.position.z = -Math.sin(0.42) * 0.30;
  hornRim.rotation.x = Math.PI / 2 - 0.42;
  hornGroup.add(hornRim);

  /* 喇叭口的发光面 */
  const hornMouth = new THREE.Mesh(
    new THREE.CircleGeometry(0.39, 40),
    new THREE.MeshBasicMaterial({
      color: 0x6fd8ff, transparent: true, opacity: 0.12, side: THREE.DoubleSide,
    })
  );
  hornMouth.position.copy(hornRim.position);
  hornMouth.position.y -= 0.01;
  hornMouth.rotation.x = -0.42 - Math.PI / 2;
  hornGroup.add(hornMouth);

  /* ============ 状态 ============ */
  let spin = 0;
  let armT = 0;
  let ringT = 0;
  const HORN_MOUTH_LOCAL = hornRim.position.clone();

  /**
   * @param dt 帧间隔秒
   * @param level 0..1 音频能量（驱动光环呼吸）
   * @param playing 是否在播放（控制唱盘转/停）
   */
  function update(dt, level = 0, playing = true) {
    if (playing) spin += dt * 0.9;
    vinylGroup.rotation.y = spin;

    /* 唱臂：播放时压到盘上，暂停时抬起 */
    const targetArm = playing ? 0 : -0.14;
    armT += (targetArm - armT) * Math.min(1, dt * 4);
    armPivot.rotation.y = -0.28 - armT * 0.55;
    armPivot.rotation.x = armT;

    /* 主光环 */
    haloRing.material.opacity = playing ? 0.12 + level * 0.55 : 0.04;
    const hs = playing ? 1 + level * 0.05 : 1;
    haloRing.scale.set(hs, 1, hs);

    /* 三层扩散环 */
    if (playing) ringT += dt;
    for (let i = 0; i < haloRings.length; i++) {
      const ring = haloRings[i];
      const ph = ring.userData.phase;
      const wave = 0.5 + 0.5 * Math.sin(ringT * 1.6 + ph);
      const s = 1 + level * (0.10 + i * 0.12) + wave * 0.02;
      ring.scale.set(s, 1, s);
      ring.material.opacity = playing
        ? (0.05 + wave * 0.10) * (0.35 + level * 0.9)
        : 0.015;
    }

    /* 标签高点随节拍跳 */
    pulseDot.scale.setScalar(1 + level * 1.4);
    pulseDot.material.opacity = 0.35 + level * 0.65;

    /* 喇叭口随音量微亮 */
    hornMouth.material.opacity = 0.08 + level * 0.28;
  }

  /** 喇叭口在世界坐标里的位置 —— 歌词从这里冒出来 */
  function getHornWorldPos(THREE_NS) {
    const v = new THREE_NS.Vector3(0, 0, 0);
    hornRim.getWorldPosition(v);
    return v;
  }

  return {
    group,
    update,
    getHornWorldPos,
    vinylGroup,
    haloRing,
    height: caseH,
    width: caseW,
    depth: caseD,
  };
}
