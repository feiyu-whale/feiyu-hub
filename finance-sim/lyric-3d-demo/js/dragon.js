/**
 * dragon.js —— 东方龙（歌词的载体 · v1.7.0）
 *
 * 干什么：加载 CC0 龙模型，让龙口朝向镜头，歌词从张开的龙嘴里涌出来。
 *        龙身缓慢呼吸起伏，张嘴幅度随音量律动。
 * 用了什么库：three.js（MIT）+ GLTFLoader（three 官方 addons，MIT）
 * 模型来源：OpenGameArt「Earth Dragon (lowpoly)」—— CC0 1.0（公有领域）
 *          https://opengameart.org/content/earth-dragon-lowpoly
 * 输入：THREE、GLTFLoader、模型 URL
 * 输出：{ group, update(dt, level, playing), getHornWorldPos(THREE), ready }
 *
 * ══════════════════════════════════════════════════════════
 * 【v1.7.0 换龙 · 老爹标准：精细，但不真实】
 *
 * 为什么不追写实：
 *   整个场景是程序化霓虹风。塞一个 8K 扫描的真雕塑会像"照片贴进动画"。
 *   → 走风格化高精度：平滑轮廓 + 分层配色 + 清漆高光，不做皮肤毛孔。
 *
 * 原模型的两个问题及处理：
 *   ① 自带贴图是 256×256 的 UV 色板测试图（4.5KB），不是真皮肤 → 表面脏
 *      → 已用 Blender 改写成**顶点色**：腹部亮青 → 背脊深靛 → 背鳍暖金
 *      → glb 里贴图数为 0，颜色走 COLOR_0 顶点属性（实测 86% 像素色彩饱和）
 *   ② 附带多张贴图却只有一张能用 → 一并清掉，减小体积
 *
 * 坐标（Blender → glTF 经 Y-up 转换后实测）：
 *   骨架 jaw 在 Blender (0, -7.09, 8.86) → glTF (0, 8.86, 7.09)
 *   也就是说**龙头天然朝 +Z（正对镜头）**，不用再转向。
 *   模型原始尺寸约 6.7 × 12.5(高) × 19.1(长)，需缩放。
 * ══════════════════════════════════════════════════════════
 */

export function createDragon(THREE, GLTFLoader, url) {
  const group = new THREE.Group();
  const inner = new THREE.Group();
  group.add(inner);

  let loaded = false;
  let model = null;
  let jawBone = null;
  let jawRestQuat = null;
  let headBone = null;          // 颈部（做摆头）
  let headRestQuat = null;

  const mouthPos = new THREE.Vector3(0, 8.7, 9.8);   // 嘴部（模型局部），加载后按骨骼重算
  let faceResolved = false;

  /* ---------- 兜底：加载失败时给个占位，页面不至于空着 ---------- */
  let placeholder = null;

  const loader = new GLTFLoader();
  loader.load(url, (gltf) => {
    model = gltf.scene;

    /* 材质：走顶点色 + 清漆。原模型已无贴图，这里只补光色倾向 */
    model.traverse((o) => {
      if (!o.isMesh) return;
      o.castShadow = true;
      o.receiveShadow = true;
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      for (const m of mats) {
        if (!m) continue;
        // 顶点色已经在 COLOR_0 里，GLTFLoader 会自动开启 vertexColors
        m.vertexColors = !!o.geometry.attributes.color;
        m.metalness = 0.28;
        m.roughness = 0.34;
        // 清漆层（glb 里已带 KHR_materials_clearcoat，这里再兜一层）
        if ('clearcoat' in m) {
          m.clearcoat = 0.6;
          m.clearcoatRoughness = 0.12;
        }
        // 极轻的自发光：让暗部不死黑，霓虹场景里更融
        if (m.emissive) m.emissive.setHex(0x0a1a2a);
        if ('emissiveIntensity' in m) m.emissiveIntensity = 0.35;
        m.needsUpdate = true;
      }
    });

    /* 找下颚骨（张嘴）与颈骨（摆头）
       颈骨选 spine.011：实测它的 Blender Y≈-5.26，是脊柱链里最靠头的一节。
       （按 Blender Y 排：spine.012/013/014/015 都在 Y>7 的尾部，别选错）
       ⚠️ 踩坑：three.js 的 GLTFLoader 会把骨骼名里的**点号去掉**：
          glb 里叫 spine.011 → 加载后变成 spine011（jaw 没点所以没变，害我以为找骨头方式错了）。
          所以先规范化名字（去点、转小写）再比。 */
    model.traverse((o) => {
      const n = (o.name || '').replace(/\./g, '').toLowerCase();
      if (!n) return;
      if (n === 'jaw') jawBone = o;
      else if (n === 'spine011') headBone = o;
    });
    if (jawBone) jawRestQuat = jawBone.quaternion.clone();
    if (headBone) headRestQuat = headBone.quaternion.clone();

    console.log('[dragon] jaw:', !!jawBone, '| neck(spine.011):', !!headBone);

    inner.add(model);
    loaded = true;
    if (placeholder) { inner.remove(placeholder); placeholder = null; }
  }, undefined, (err) => {
    console.error('[dragon] 加载失败，用占位几何代替：', err);
    const g = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.SphereGeometry(0.8, 24, 16),
      new THREE.MeshStandardMaterial({ color: 0x1e4a5c, roughness: 0.35, metalness: 0.3 })
    );
    g.add(body);
    placeholder = g;
    inner.add(g);
    loaded = true;
  });

  /* ---------- 状态 ---------- */
  let t = 0;
  const jawAxis = new THREE.Vector3(1, 0, 0);

  /**
   * @param dt 帧间隔秒
   * @param level 0..1 音频能量
   * @param playing 是否在播放
   */
  function update(dt, level = 0, playing = true) {
    if (playing) t += dt;

    /* 【v1.7.2 让它活起来】老爹：「这个龙跟个雕塑一样」
       之前只有极小的上下浮动（±0.045），几乎看不出来。现在叠三层运动：
         ① 呼吸浮动：幅度加大，但频率很慢（0.7Hz），像真的在喘气
         ② 左右摆头：绕 Y 轴缓慢扫，周期约 11 秒，不抢戏
         ③ 抬头低头：绕 X 轴轻轻点头，跟音乐能量挂钩
       三层频率故意错开（0.7 / 0.55 / 0.35），不会同时到顶，看着才像活物。 */
    const breathe = Math.sin(t * 0.70) * 0.10;
    const swayX = Math.sin(t * 0.55) * 0.085;
    const nodX = Math.sin(t * 0.35) * 0.045;

    inner.position.y = breathe * (0.7 + level * 0.9);
    inner.rotation.y = swayX + level * 0.02;
    inner.rotation.x = nodX * 0.6;

    /* 颈部摆头：在基础姿态上叠一点缓慢的左右/上下摆动 */
    if (headBone && headRestQuat) {
      const yaw = Math.sin(t * 0.48) * 0.10;          // 左右
      const pitch = Math.sin(t * 0.31 + 1.2) * 0.055; // 俯仰
      const qy = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
      const qx = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), pitch);
      headBone.quaternion.copy(headRestQuat).multiply(qy).multiply(qx);
    }

    /* 张嘴：基础微张 + 音量驱动。演示模式（没音频）时缓慢开合，像在吐纳。
       v1.7.2 把幅度加大（0.10 → 0.20 基准，上限 0.34 → 0.46），嘴唇动得太小看着就是死的。 */
    if (jawBone && jawRestQuat) {
      const idle = playing ? (0.5 + 0.5 * Math.sin(t * 0.62)) * 0.20 : 0.04;
      const drive = level * 0.26;
      const open = Math.min(0.46, idle + drive);
      const q = new THREE.Quaternion().setFromAxisAngle(jawAxis, open);
      jawBone.quaternion.copy(jawRestQuat).multiply(q);
    }
  }

  /** 歌词出口：龙嘴中心的世界坐标 */
  function getHornWorldPos(THREE_NS) {
    if (!faceResolved && jawBone) {
      group.updateMatrixWorld(true);
      const p = new THREE_NS.Vector3();
      jawBone.getWorldPosition(p);
      group.worldToLocal(p);           // → group 局部坐标

      /* 【v1.7.2 修「从鼻孔飘出来」】
         旧代码：在**世界坐标**上 p.y += 0.30、往前 0.55。
         但 group 缩放是 0.28，这两个偏移被放大 3.5 倍 → 下颚瞬间抬到鼻梁上，
         字就成了从鼻孔喷出来。
         现在改成在**局部坐标**里修，量级跟模型同尺度：
           实测模型局部：jaw 在 z≈7.09，最前端顶点 z=9.41（下巴尖），
           嘴缝（上下颚之间）在 y≈8.4~9.2。
           所以：往前推到 9.8（比最前端还多 0.4，字从唇外出来）
               高度压到 8.7（比 jaw 略低，落在嘴唇之间，不在鼻梁上） */
      p.z = 9.8;
      p.y = 8.7;
      mouthPos.copy(p);
      faceResolved = true;
    }
    const v = new THREE_NS.Vector3(mouthPos.x, mouthPos.y, mouthPos.z);
    group.localToWorld(v);
    return v;
  }

  return {
    group,
    update,
    getHornWorldPos,
    get ready() { return loaded; },
  };
}
