/**
 * drum.js —— 中式礼仪大鼓（歌词的载体 · v1.6.0）
 *
 * 干什么：加载 CC0 中国宫廷「Ceremonial Drum On Stand」模型，鼓面朝镜头，
 *        歌词从鼓面中央"被敲出来"向外飘散。鼓槌随节拍抬起/落下。
 * 用了什么库：three.js（MIT）+ GLTFLoader（three 官方 addons，MIT）
 * 模型来源：3dassets.dev「Imperial China Palace and Garden」系列
 *          Ceremonial Drum On Stand —— CC0 1.0（公有领域，可商用，无需署名）
 *          https://3dassets.dev/assets/imperial-china-palace-and-garden-ceremonial-drum-on-stand
 * 输入：THREE 命名空间、GLTFLoader、模型 URL
 * 输出：{ group, update(dt, level, playing), getHornWorldPos(THREE), ready }
 *
 * 为什么从唱片机换成鼓：
 *   老爹要的是"歌词从某个东西里吐出来"，且不要照片级真实（真实反而突兀）。
 *   鼓 = 击打发声，声波扩散成字，视觉逻辑最顺；
 *   中式礼仪大鼓自带国风分量，且与场景的程序化低模风格同源。
 *
 * 坐标系备忘（实测模型包围盒）：
 *   鼓身是卧着的圆柱，轴向沿 X，**鼓面朝 -X 方向**，中心 (-0.34, 1.28, 0)。
 *   所以整个 group 绕 Y 轴转 +90°，把 -X 转到 +Z（正对镜头）。
 *   总尺寸 1.74 × 1.88 × 1.23（米）。
 */

export function createDrum(THREE, GLTFLoader, url) {
  const group = new THREE.Group();
  const inner = new THREE.Group();      // 模型本体：单独一层，方便整体转向/缩放
  group.add(inner);

  let loaded = false;
  let laceMesh = null;                  // 鼓身材质网格（用来算鼓面位置）
  let faceResolved = false;
  const drumFacePos = new THREE.Vector3(0, 1.28, 0.62);  // 鼓面中心（group 局部坐标）
  let drumRadius = 0.6;

  /* ---------- 鼓槌：两根，绕支点摆动 ---------- */
  const malletMat = new THREE.MeshPhysicalMaterial({
    color: 0x6b4a2c, roughness: 0.55, metalness: 0.05, clearcoat: 0.3,
  });
  const malletHeadMat = new THREE.MeshStandardMaterial({
    color: 0xb03a2e, roughness: 0.65, metalness: 0.0,
  });

  const mallets = [];
  for (let i = 0; i < 2; i++) {
    const pivot = new THREE.Group();
    // 左右各一根，架在鼓的两侧上方
    const side = i === 0 ? -1 : 1;
    pivot.position.set(side * 0.78, 1.62, 0.30);
    pivot.rotation.z = side * 0.42;        // 初始斜举
    pivot.rotation.x = -0.22;

    const stick = new THREE.Mesh(
      new THREE.CylinderGeometry(0.018, 0.026, 0.86, 10),
      malletMat
    );
    stick.position.y = -0.43;
    stick.castShadow = true;
    pivot.add(stick);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.058, 14, 12), malletHeadMat);
    head.position.y = -0.86;
    head.castShadow = true;
    pivot.add(head);

    group.add(pivot);
    mallets.push({ pivot, side, phase: i * 0.5, base: side * 0.42 });
  }

  /* ---------- 加载模型 ---------- */
  const loader = new GLTFLoader();
  loader.load(url, (gltf) => {
    const model = gltf.scene;

    /* 统一材质风格：模型自带 4 个纯色 PBR 材质（wood/timber/lacquer/bronze），
       与场景的程序化低模同源，不追照片级真实——老爹说太真反而突兀。
       这里只做两件事：补一点清漆让朱漆鼓面带光泽；青铜件略微提亮金属感。 */
    model.traverse((o) => {
      if (!o.isMesh) return;
      o.castShadow = true;
      o.receiveShadow = true;
      const m = o.material;
      if (!m) return;
      if (m.name === 'lacquer') {
        m.roughness = 0.38;
        m.metalness = 0.06;
      } else if (m.name === 'bronze') {
        m.metalness = 0.92;
        m.roughness = 0.38;
      }
    });

    /* 模型本身：把 -X 鼓面转到 +Z（正对镜头） */
    const pivot = new THREE.Group();
    pivot.rotation.y = Math.PI / 2;
    pivot.add(model);

    /* 位置：模型原点在鼓架脚下，抬起一点点避免陷地 */
    pivot.position.set(0, 0, -0.35);
    inner.add(pivot);

    /* 记下鼓体网格，鼓面位置等**首次取用时再算**——
       因为那时 group 的 scale/position 已经设好，算出来才是对的。
       （踩坑：在加载回调里算，group 还是默认变换，算出偏移 -0.02 错到 -0.01） */
    model.traverse((o) => {
      if (o.isMesh && o.material && o.material.name === 'lacquer') laceMesh = o;
    });
    loaded = true;
  }, undefined, (err) => {
    console.error('[drum] 模型加载失败，退回占位鼓：', err);
    // 占位：一个简单的朱漆圆柱，至少不空着
    const ph = new THREE.Mesh(
      new THREE.CylinderGeometry(0.6, 0.6, 0.7, 32),
      new THREE.MeshStandardMaterial({ color: 0xa33b2c, roughness: 0.4 })
    );
    ph.rotation.z = Math.PI / 2;
    ph.position.set(0, 1.28, -0.1);
    inner.add(ph);
    loaded = true;
  });

  /* ---------- 状态 ---------- */
  let beatT = 0;          // 节拍计时
  let hitT = 0;           // 最近一次"敲击"的余韵

  /**
   * @param dt 帧间隔秒
   * @param level 0..1 音频能量
   * @param playing 是否在播放
   */
  function update(dt, level = 0, playing = true) {
    if (playing) beatT += dt;

    /* 鼓点检测：能量突然抬头 → 判定为一次敲击。
       没有音频（演示模式）时用固定节拍 1.6 秒一次，画面不会死。 */
    const hasAudio = level > 0.02;
    let beat = 0;
    if (hasAudio) {
      // 用能量的一阶差分当"敲击感"；正跳变越大，击打越强
      beat = Math.max(0, level - (update._prev ?? 0)) * 6;
      update._prev = level;
    } else if (playing) {
      const ph = (beatT % 1.6) / 1.6;
      beat = ph < 0.06 ? 1 : 0;      // 每 1.6 秒一下
    }
    hitT = Math.max(hitT * (1 - Math.min(1, dt * 3.2)), beat);

    /* 两根鼓槌交替落下：命中时，其中一根快速压下再弹回 */
    for (const m of mallets) {
      const strike = Math.max(0, hitT - m.phase * 0.18);
      const press = strike * 0.75;                        // 压下角度
      const rest = m.base + Math.sin(beatT * 1.1 + m.phase * 3) * 0.06;  // 静止轻微晃
      m.pivot.rotation.z = rest - m.side * press;
      m.pivot.rotation.x = -0.22 - press * 0.35;
    }

    /* 整机轻微呼吸（低频时下沉一点点，像鼓皮被擂动） */
    inner.position.y = -hitT * 0.012;
  }

  /** 歌词出口：鼓面中心的世界坐标 */
  function getHornWorldPos(THREE_NS) {
    /* 首次取用时把鼓面位置从**真实几何**里算出来（此时 transform 已就绪） */
    if (!faceResolved && laceMesh) {
      group.updateMatrixWorld(true);
      const box = new THREE_NS.Box3().setFromObject(laceMesh);   // 世界坐标
      const c = box.getCenter(new THREE_NS.Vector3());
      const size = box.getSize(new THREE_NS.Vector3());
      /* 鼓面朝 +Z：取最前面那一面，再回缩一点，让字从鼓皮“里”冒出来 */
      const p = new THREE_NS.Vector3(c.x, c.y, box.max.z - 0.03);
      group.worldToLocal(p);            // → group 局部坐标（只算一次）
      drumFacePos.copy(p);
      drumRadius = Math.max(size.x, size.y) * 0.40;
      faceResolved = true;
    }
    const v = new THREE_NS.Vector3(drumFacePos.x, drumFacePos.y, drumFacePos.z);
    group.localToWorld(v);
    return v;
  }

  return {
    group,
    update,
    getHornWorldPos,
    get ready() { return loaded; },
    get faceRadius() { return drumRadius; },
  };
}
