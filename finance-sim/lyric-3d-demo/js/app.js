/**
 * app.js —— 场景装配与主循环
 *
 * 干什么：搭 three.js 场景（地面 + 唱片机 + 3D 歌词），接音频与频谱，驱动每帧更新。
 * 用了什么库：three.js 0.182（MIT）、OrbitControls（three 官方示例，MIT）
 * 输入：用户拖入的音频文件 + 可选 .lrc
 * 输出：页面上的 3D 画面 + 播放控制
 *
 * 分工（本轮）：
 *   ① 唱片机 = 歌词的载体（字从喇叭口飞出来）
 *   ③ 地面   = 用户视频的落点（下一步接 VideoTexture，本轮先留地面网格）
 */

import * as THREE from '../vendor/three.module.js';
import { OrbitControls } from '../vendor/OrbitControls.js';
import { GLTFLoader } from '../vendor/GLTFLoader.js';
import { createDragon } from './dragon.js';
import { createLyrics } from './lyrics3d.js';
import { parseLrc, estimateLineTimes } from './lrc.js';

const VERSION = 'v1.8.0-龙间距+活体呼吸 20261107';

/* ==================== 基础场景 ==================== */
const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: false,
  powerPreference: 'high-performance',
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.34;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x080b11);
scene.fog = new THREE.FogExp2(0x080b11, 0.028);

const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 200);
camera.position.set(0, 5.4, 10.2);


const controls = new OrbitControls(camera, canvas);
// 镜头往下看 → 世界整体上移 → 唱片机离开底栏区域（物体本身保持落地）
controls.target.set(0, 1.85, -0.3);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 4;
controls.maxDistance = 20;
controls.maxPolarAngle = Math.PI * 0.52;
controls.enablePan = false;

/* ==================== 环境反射（让金属真像金属） ==================== */
// 用 PMREM 把一张手画的等距柱状渐变转成环境贴图。
// 不引入外部 HDRI 文件（动辄几 MB），程序生成够用。
function makeEnvTexture(THREE, renderer) {
  const w = 512, h = 256;
  const cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  const ctx = cv.getContext('2d');

  // 上半：冷蓝穹顶；下半：暖橙地面反射
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0.0, '#8fb8e8');
  g.addColorStop(0.35, '#3d6a96');
  g.addColorStop(0.5, '#16202c');
  g.addColorStop(0.75, '#3a2416');
  g.addColorStop(1.0, '#7a3f1c');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  // 两盏高光「灯管」，金属上能看出清晰的反射条
  function bar(x, y, bw, bh, color, blur) {
    ctx.save();
    ctx.filter = `blur(${blur}px)`;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, bw, bh);
    ctx.restore();
  }
  bar(w * 0.12, h * 0.12, w * 0.055, h * 0.34, 'rgba(255,255,255,0.95)', 9);
  bar(w * 0.62, h * 0.10, w * 0.09, h * 0.28, 'rgba(190,225,255,0.8)', 12);
  bar(w * 0.38, h * 0.42, w * 0.20, h * 0.06, 'rgba(255,215,150,0.55)', 14);

  const tex = new THREE.CanvasTexture(cv);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;

  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();
  const envRT = pmrem.fromEquirectangular(tex);
  tex.dispose();
  pmrem.dispose();
  return envRT.texture;
}

const envMap = makeEnvTexture(THREE, renderer);
scene.environment = envMap;
scene.environmentIntensity = 0.85;

/* ==================== 灯光 ==================== */
// 环境光抬起来：上一版 0.55 太低，暗部死黑、主体像贴图
const hemi = new THREE.HemisphereLight(0x5f8fc4, 0x121a26, 1.15);
scene.add(hemi);

const ambient = new THREE.AmbientLight(0x2a3d55, 0.9);
scene.add(ambient);

const keyLight = new THREE.DirectionalLight(0xdce8ff, 2.1);
keyLight.position.set(5, 11, 7);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(512, 512);
keyLight.shadow.camera.near = 1;
keyLight.shadow.camera.far = 30;
keyLight.shadow.camera.left = -8;
keyLight.shadow.camera.right = 8;
keyLight.shadow.camera.top = 8;
keyLight.shadow.camera.bottom = -8;
keyLight.shadow.bias = -0.0012;
scene.add(keyLight);

// 底部暖色补光（唱片机下面的台面反光）
const fillLight = new THREE.PointLight(0xff9d5c, 26, 16, 2);
fillLight.position.set(0, 1.2, 3.6);
scene.add(fillLight);

// 背后冷光，勾边
const rimLight = new THREE.PointLight(0x4aa8ff, 45, 22, 2);
rimLight.position.set(-5, 4.2, -5.5);
scene.add(rimLight);

// 上方补光（把歌词区打亮，别让字浮在黑洞里）
const lyricLight = new THREE.PointLight(0x9ec8ff, 30, 18, 2);
lyricLight.position.set(0, 7.5, 2.2);
scene.add(lyricLight);

// 舞台聚光：从上方斜打唱片机，制造体积感与地面阴影
const spot = new THREE.SpotLight(0xfff0d8, 90, 24, Math.PI * 0.20, 0.55, 1.6);
spot.position.set(2.6, 10.5, 4.2);
spot.target.position.set(0, 0, 0);
spot.castShadow = true;
spot.shadow.mapSize.set(512, 512);
spot.shadow.camera.near = 2;
spot.shadow.camera.far = 26;
spot.shadow.bias = -0.0015;
spot.shadow.normalBias = 0.02;
scene.add(spot);
scene.add(spot.target);

/* ==================== 【v1.4.2】立体声侧光 + 呼吸光效 ====================
   老爹：「他真的不怎么吃CPU，拖动起来实在太过于顺滑了……看着确实是有点简陋」
   性能有余量，那就把光做厚。两层东西：
   ① 左右两盏彩色侧光，随声道偏向移动、随音量呼吸 —— 立体声终于“看得见”了
   ② 侧边各挂一片发光片（点光在 7 米外衰到看不见，光靠灯本身没效果）
   
   【踩坑记录】第一版只用 PointLight(intensity 30, decay 2)，位置 ±6.5 米——
   按距离平方衰减，到主体附近只剩 30/49 ≈ 0.6，等于没开灯。
   所以：灯调狠 + 另配发光片（MeshBasicMaterial 不受光照计算影响，一定看得见）。 */
const sideLightL = new THREE.PointLight(0x3ad7ff, 0, 26, 1.4);   // 左：青蓝
sideLightL.position.set(-5.2, 3.0, 2.0);
scene.add(sideLightL);

const sideLightR = new THREE.PointLight(0xffb066, 0, 26, 1.4);   // 右：暖橙
sideLightR.position.set(5.2, 3.0, 2.0);
scene.add(sideLightR);

/* 侧边发光片：竖着的柔光面，模拟“屏幕外打进来的光”
   【踩坑 v1.4.2】第一版放在 x=±5.6 → 相机水平半角只 15°，在 11 米处可见范围才 ±3 米，
   发光片整个跑到画外，只有内侧边缘蹭到一点，所以只有左边看得见一小爝。
   现在拉到 ±2.9（在框内），片也改窄高，像两束从侧后方打进来的光。 */
function makeSideGlowTexture() {
  const s = 256;
  const cv = document.createElement('canvas');
  cv.width = s; cv.height = s;
  const ctx = cv.getContext('2d');
  const g = ctx.createRadialGradient(s * 0.5, s * 0.5, 0, s * 0.5, s * 0.5, s * 0.5);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.35, 'rgba(255,255,255,0.42)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
const sideGlowTex = makeSideGlowTexture();
const sideGlowL = new THREE.Mesh(
  new THREE.PlaneGeometry(7, 10),
  new THREE.MeshBasicMaterial({
    map: sideGlowTex, color: 0x2ec8ff, transparent: true, opacity: 0.0,
    depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
  })
);
sideGlowL.position.set(-2.95, 3.5, -1.4);
sideGlowL.rotation.y = Math.PI / 3.2;
scene.add(sideGlowL);

const sideGlowR = new THREE.Mesh(
  new THREE.PlaneGeometry(7, 10),
  new THREE.MeshBasicMaterial({
    map: sideGlowTex, color: 0xff9a52, transparent: true, opacity: 0.0,
    depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
  })
);
sideGlowR.position.set(2.95, 3.5, -1.4);
sideGlowR.rotation.y = -Math.PI / 3.2;
scene.add(sideGlowR);

/* 【v1.4.2-b】前景地面补光：
   唱片机到控制栏之间那块地面 RGB 实测 [5,4,6]——几乎是纯黑。
   地材质本身就暗(0x18222e)、又没灯照到、再叠 FogExp2，三重压下去就成了一条“黑带”。
   两件东西一起上：① 地面提亮一点 ② 机身前方加一盏朝下打的地面补光。 */
const floorFill = new THREE.PointLight(0x5f9fd0, 28, 14, 1.6);
floorFill.position.set(0, 2.2, 3.4);
scene.add(floorFill);

/* 【v1.4.2-d】机身正面补光：
   实测机身正面（画面 y=860~940）亮度只有 32~50，而地面是 114~138——
   反差太大，正面看起来像一块黑洞。从正面斜上方补一盏弱光，把机身“请”出来。 */
const bodyFill = new THREE.PointLight(0x9ec8ee, 22, 10, 1.5);
bodyFill.position.set(0, 1.6, 4.6);
scene.add(bodyFill);

/* 【v1.4.2】前景地面补光：见下方 glowTex 定义之后
   （踩坑：第一版写在这里，但 glowTex 在 400 多行才定义 → 直接 ReferenceError，整页白屏） */

/* 【v1.4.3 侧光收敛】老爹：「你那个侧光实在是太显眼了」
   上一版 SIDE_BASE=150 / GLOW_BASE=0.78，两团光晕抢了主体。
   现在压到原来的四成左右，让它当“背景氛围”而不是“主灯”。 */
const SIDE_BASE = 62;        // 侧光基准强度（点光，decay 1.4 衰减比平方慢）
const GLOW_BASE = 0.30;      // 发光片基准不透明度
/* 【v1.4.2】侧光要有“底光”，不能全靠音量。
   原因：演示模式（没音频）level 恒为 0 → 两盏侧光全灭，光效白加。
   所以给一个下限，再用 level 往上推：没音频时也有安静的呼吸，有音频时跟着鼓点亮。 */
let sideT = 0;
function applyStereoLights(bias, level, playing, dt = 0.016) {
  if (!sideLightL || !sideLightR) return;
  const on = playing ? 1 : 0.55;
  sideT += dt;
  // 没声音时的缓慢呼吸（0.35~0.65），免得演示模式一片死黑
  const idleBreath = 0.35 + 0.30 * (0.5 + 0.5 * Math.sin(sideT * 0.9));
  const drive = Math.max(idleBreath, level);      // 有鼓点就用鼓点，否则用呼吸
  // bias>0 = 声音偏右 → 右灯亮、左灯弱
  const wl = 0.62 - bias * 0.40;
  const wr = 0.62 + bias * 0.40;
  sideLightL.intensity = SIDE_BASE * drive * wl * on;
  sideLightR.intensity = SIDE_BASE * drive * wr * on;
  // 发光片跟着亮
  if (sideGlowL) sideGlowL.material.opacity = GLOW_BASE * drive * wl * on;
  if (sideGlowR) sideGlowR.material.opacity = GLOW_BASE * drive * wr * on;
  // 灯本身也顺着偏向轻微移动，像跟着声音走
  sideLightL.position.x = -5.2 + bias * 1.4;
  sideLightR.position.x = 5.2 + bias * 1.4;
}

/* ==================== 地面（未来视频投影的落点） ==================== */
const groundGeo = new THREE.PlaneGeometry(80, 80);
const groundMat = new THREE.MeshStandardMaterial({
  color: 0x22303f,
  roughness: 0.72,
  metalness: 0.28,
});
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.09;
ground.receiveShadow = true;
ground.name = 'ground';
scene.add(ground);

// 地面网格（暗示这块地将来是投影屏）
const grid = new THREE.GridHelper(80, 80, 0x2c5a7d, 0x1a3040);
grid.position.y = -0.085;
grid.material.transparent = true;
grid.material.opacity = 0.55;
scene.add(grid);

/* ---------- 视频投影开启时，把地上的“假阴影/光斑”让位 ----------
   这几层是给「空地面」营造接地感的。视频一铺上去，它们盖在视频上就是脏块。
   所以记一份基准值，视频出现时压下去、消失后恢复。 */
const SHADOW_BASE = {
  soft:    0.62,   // softShadow 基准不透明度
  contact: 0.88,   // contactShadow
  glow:    0.30,   // floorGlow
};
// 主循环每帧向这两个目标靠近
let shadowDim = 0;   // 0 = 正常； 1 = 视频在（阴影/光斑全压低）

/* ---------- ③ 视频投影面（用户视频的落点） ----------
   为什么铺在地上而不是全屏：全屏铺底会把唱片机压在暗层下，看久了闷。
   投到地面上，视频变成「这块地」的一部分，主体浮在上面，两层不打架。

   【v1.1.3 改用 ShaderMaterial 自己算遮罩】
   前两版用 material.alphaMap 做软边，均失败：
     - alphaMap 读的是贴图**绿色通道**，写成 rgba 透明无效；
     - 改成亮度渐变后依然不起作用（和 transparent/depthWrite 的排序搅在一起，结果不可控）。
   → 直接写 shader：vUv 算径向衰减，一切都可控，也省一张贴图。 */

const videoUniforms = {
  uMap:     { value: null },
  uOpacity: { value: 0.0 },
  uFeather: { value: 0.50 },                        // 边缘羽化宽度（uv 比例）
  uDim:     { value: 0.70 },                        // 整体压暗，别让视频比主体还亮
  uTint:    { value: new THREE.Color(0xd6e2f2) },   // 极轻冷调，融进夜景
};

/* 【v1.2.0 换遮罩形状】
   上一版是「径向椭圆」衰减：视频投在地上变成一块发光椭圆饼，四角被吃掉，
   暗场里看着就像个诡异光斑。现在改成矩形软边（像一块铺在地上的屏幕），
   尺寸按视频真实宽高比算，不再固定 30×18 硬拉伸。 */
const videoScreen = new THREE.Mesh(
  new THREE.PlaneGeometry(1, 1),
  new THREE.ShaderMaterial({
    uniforms: videoUniforms,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform sampler2D uMap;
      uniform float uOpacity;
      uniform float uFeather;
      uniform float uDim;
      uniform vec3  uTint;

      void main() {
        vec3 col = texture2D(uMap, vUv).rgb;

        /* 【v1.2.7】回到「两条边各自羽化再相乘」。
           超椭圆那次：power 4 会让 rr 在贴边处陡升 → 羽化被压成一两像素，看着还是硬边。
           现在 x、y 各自 smoothstep，四条边都拿到完整的羽化宽度，四角自然叠暗。 */
        vec2 d = abs(vUv - 0.5) * 2.0;                   // 0(中心) ~ 1(边缘)
        float fx = 1.0 - smoothstep(1.0 - uFeather, 1.0, d.x);
        float fy = 1.0 - smoothstep(1.0 - uFeather, 1.0, d.y);
        float a = fx * fy;

        col *= uTint * uDim;

        gl_FragColor = vec4(col, a * uOpacity);
      }
    `,
  })
);
videoScreen.rotation.x = -Math.PI / 2;
/* 高度层级（从低到高，别乱改）：
     ground        -0.090   实地
     grid          -0.085   网格
     floorGlow     -0.070   地面光斑
     softShadow    -0.060   大范围软阴影
     contactShadow -0.045   接触阴影
     videoScreen   -0.030   ← 视频投影，**必须最上面**（它是屏幕，不该被阴影盖）

   【v1.2.0 修的坑 —— “地面投影诡异”的真凶】
   上一版视频在 -0.078，比 softShadow(-0.060)、contactShadow(-0.045)、floorGlow(-0.070) 都低
   → 那三块深色椭圆/蓝色光斑**盖在视频画面之上**，于是在视频上叠了一层脏影 + 蓝圈，
   加上径向遮罩 → 整体看着就是一个奇怪的光圈。
   【v1.1.4 修的坑】当时视频在 -0.098（比地面还低）且只差 8mm → z-fighting 出硬截断线。 */
/* 位置：进深 10 的中心放在 z=0.4 → 覆盖 z=-4.6..5.4。
   机器底座占 -2.6..1.4 → 视频从机器身后一直铺到镜头前，前缘 z=5.4
   已经在画面底边(z≈3.45)之外，所以看不到「前缘硬边」。 */
videoScreen.position.set(0, -0.030, 0.4);
videoScreen.renderOrder = 5;
videoScreen.visible = false;
videoScreen.name = 'videoScreen';
scene.add(videoScreen);

// 视频淡入淡出的当前目标值（由 loadMediaFile 设置，主循环向它靠拢）
let videoTargetOpacity = 0;

/** 按视频真实宽高比摆这块地面屏：宽度上限 13，高宽按比例换算，不拉变形 */
/* ==================== 视频的三个落点（v1.3.0） ====================
   为什么做三种：视频「趴在地上」这条路我调了五轮参数（层级、形状、羽化、尺寸、接触阴影），
   但在数值和截图里始终别扭 —— 音乐视频本来是给人正面看的，铺在地上又被机器压住，
   怎么调都是「一块奇怪的彩色地毯」。
   与其继续猜老爹想要哪种，不如三种都做出来，页面上点一下就能换着看。

     floor  地面铺开：视频当「这一块地」，机器压在上面（原来的方案）
     screen 立屏背景：机器后面立一块屏，像舞台背景板，视频正对着人
     bg     全屏背景：视频当整张背景，机器浮在前面（像 MV） */
let videoMode = (new URLSearchParams(location.search).get('mode') || 'floor');
const VIDEO_MODES = ['floor', 'screen', 'bg'];
if (!VIDEO_MODES.includes(videoMode)) videoMode = 'floor';

/** 每种模式的「亮度」不同：立屏要亮（是主体背景板），地面要暗（不能比机器亮） */
const VIDEO_DIM = { floor: 0.70, screen: 0.98, bg: 0.52 };

function layoutVideoScreen(aspect) {
  const a = (isFinite(aspect) && aspect > 0.2) ? aspect : 16 / 9;

  if (videoMode === 'floor') {
    /* 地面：进深 10、中心 z=0.4 → 覆盖 z=-4.6..5.4。
       机器底座 -2.6..1.4 → 视频从机器身后铺到镜头前，
       前缘 z=5.4 已在画面底边(z≈3.45)之外，看不到「前缘硬边」。 */
    const h = 10.0;
    const w = Math.max(8.0, Math.min(13.0, h * a));
    videoScreen.rotation.set(-Math.PI / 2, 0, 0);
    videoScreen.position.set(0, -0.030, 0.4);
    videoScreen.scale.set(w, h, 1);
  } else if (videoMode === 'screen') {
    /* 立屏：机器身后一块竖起来的屏，正对着镜头。

       【v1.3.2 修穿模】上一版放 z=-3.3，但算一下机器实际占位：
         底座 caseD=4.0 × 缩放 1.22，机器整体在 z=-0.6
         → 底座后缘 = -0.6 - 2.0×1.22 = **-3.04**
         喇叭挂在局部 z=-1.55 → 世界 -0.6 + (-1.55×1.22) = -2.49
         喇叭锥半径 0.62 → 向后伸到约 **-3.25**
       屏幕在 -3.3 = 几乎贴着喇叭口，所以穿模。
       现在退到 -6.0，离喇叭还有 2.7 的空档，且屏更大（远了要放大才占同样视野）。 */
    const h = 4.6;
    const w = Math.max(3.5, Math.min(11.0, h * a));
    videoScreen.rotation.set(0, 0, 0);
    videoScreen.position.set(0, 0.55 + h / 2, -6.0);
    videoScreen.scale.set(w, h, 1);
  } else {
    /* 全屏背景：一块大板立在远处，占满画面，机器浮在前面 */
    videoScreen.rotation.set(0, 0, 0);
    videoScreen.position.set(0, 4.2, -9.5);
    videoScreen.scale.set(26, 15, 1);
  }

  videoUniforms.uDim.value = VIDEO_DIM[videoMode] ?? 0.7;
  // 只有「地面」模式才需要让地上的假阴影让位；立屏/背景不遮地面
  videoUniforms.uFeather.value = videoMode === 'floor' ? 0.50 : 0.10;
}

/* ==================== 背景（消灭上方死黑区） ==================== */
function makeGlowTexture() {
  const s = 256;
  const cv = document.createElement('canvas');
  cv.width = cv.height = s;
  const ctx = cv.getContext('2d');
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0, 'rgba(90,160,225,0.8)');
  g.addColorStop(0.45, 'rgba(50,110,170,0.3)');
  g.addColorStop(1, 'rgba(10,18,28,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
const glowTex = makeGlowTexture();

/* 【v1.4.2】前景地面补光：
   唱片机到控制栏之间那一块地面一直是死黑（地材质本身暗 + 没灯照到），
   截图里看起来就像“画面被横切一刀”。给一层很淡的冷光把地接上。 */
const frontPool = new THREE.Mesh(
  new THREE.PlaneGeometry(24, 18),
  new THREE.MeshBasicMaterial({
    map: glowTex, color: 0x4a7fae, transparent: true, opacity: 0.26,
    depthWrite: false, blending: THREE.AdditiveBlending,
  })
);
frontPool.rotation.x = -Math.PI / 2;
frontPool.position.set(0, -0.052, 3.6);
frontPool.renderOrder = 2;
scene.add(frontPool);

// 远景冷光晕
const glow = new THREE.Mesh(
  new THREE.PlaneGeometry(36, 36),
  new THREE.MeshBasicMaterial({
    map: glowTex, transparent: true, opacity: 0.62,
    depthWrite: false, blending: THREE.AdditiveBlending,
  })
);
glow.position.set(0, 7.8, -20);
scene.add(glow);

// 地面反射光斑
const floorGlow = new THREE.Mesh(
  new THREE.PlaneGeometry(26, 26),
  new THREE.MeshBasicMaterial({
    map: glowTex, transparent: true, opacity: 0.30,
    depthWrite: false, blending: THREE.AdditiveBlending,
  })
);
floorGlow.rotation.x = -Math.PI / 2;
floorGlow.position.set(0, -0.07, 1.5);
scene.add(floorGlow);

/* ==================== 中景体积雾（填歌词与唱片机之间的空档） ==================== */
function makeHazeTexture() {
  const w = 256, h = 256;
  const cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  const ctx = cv.getContext('2d');
  const g = ctx.createLinearGradient(0, h, 0, 0);
  g.addColorStop(0, 'rgba(90,150,210,0.30)');
  g.addColorStop(0.55, 'rgba(50,100,155,0.13)');
  g.addColorStop(1, 'rgba(20,40,70,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  // 叠一层水平方向的渐变，两端化开，避免看到硬边界
  const gx = ctx.createLinearGradient(0, 0, w, 0);
  gx.addColorStop(0, 'rgba(0,0,0,1)');
  gx.addColorStop(0.25, 'rgba(0,0,0,0)');
  gx.addColorStop(0.75, 'rgba(0,0,0,0)');
  gx.addColorStop(1, 'rgba(0,0,0,1)');
  ctx.globalCompositeOperation = 'destination-out';
  ctx.fillStyle = gx;
  ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = 'source-over';
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
const hazeTex = makeHazeTexture();
for (let i = 0; i < 3; i++) {
  const haze = new THREE.Mesh(
    new THREE.PlaneGeometry(22 + i * 5, 7 + i * 1.5),
    new THREE.MeshBasicMaterial({
      map: hazeTex, transparent: true,
      opacity: 0.42 - i * 0.09,
      depthWrite: false, blending: THREE.AdditiveBlending,
    })
  );
  haze.position.set(0, 1.4 + i * 1.15, -4.5 - i * 2.2);
  scene.add(haze);
}

/* ==================== 浮尘粒子（填背空间） ==================== */
// 粒子必须用「圆形贴图」，否则默认渲染成一个个方块 ——
// 上一版画面里那些悬浮的黑色小方块就是它。
function makeDustSprite() {
  const s = 64;
  const cv = document.createElement('canvas');
  cv.width = cv.height = s;
  const ctx = cv.getContext('2d');
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.35, 'rgba(190,225,255,0.7)');
  g.addColorStop(1, 'rgba(120,180,240,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function makeDust() {
  const N = 700;
  const pos = new Float32Array(N * 3);
  const spd = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 30;
    pos[i * 3 + 1] = Math.random() * 13;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 20 - 1;
    spd[i] = 0.08 + Math.random() * 0.22;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.userData.spd = spd;
  const mat = new THREE.PointsMaterial({
    map: makeDustSprite(),
    color: 0x9ecdf5,
    size: 0.10,
    transparent: true,
    opacity: 0.42,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
    alphaTest: 0.001,
  });
  return new THREE.Points(geo, mat);
}
const dust = makeDust();
scene.add(dust);

/* ==================== 【v1.7.0】东方龙 + 歌词 ====================
   老爹：五爪金龙 → 查不到合适的 → 「精细，但不真实」
   模型：OpenGameArt「Earth Dragon」—— CC0，免登录，免署名
   贴图已用 Blender 重做成顶点色（腹部亮青 / 背脊深靛 / 背鳍暖金），不再脏。

   坐标实测（glTF Y-up）：
     包围盒 X -3.32~3.41（宽6.74） Y 0.17~12.72（高12.55） Z -9.65~9.41（长19.06）
     龙头在 **+Z** 方向（jaw 骨髓 z≈7.09），天然正对镜头，不用转向。

   【v1.7.3 修「像雕塑」+「字压脸」】
   ① 雕塑感：根本原因是**正面对着镜头的左右对称姿态**，对称=死。
      → 绕 Y 转 -26 度、再轻微仰头，瞬间变成三分之四侧角，不用加动画也有动感。
   ② 字压脸：龙只有 3.5 高，嘴在 2.44、头顶 3.56，字一往上飘就糊脸。
      → 龙缩小到 0.24（高约 3.0）并后移到 z=-2.4；字整组提到 z=1.6（靠近镜头一侧），
        字与龙在**不同深度层**，视觉上字在前、龙在后，不再互相遮。
   ③ 字缩小：0.78 → 0.62，别抢主体。 */
const dragon = createDragon(THREE, GLTFLoader, './assets/dragon.glb');
dragon.group.scale.setScalar(0.21);       // 0.24 → 0.21，给文字腾出空间
dragon.group.position.set(0.15, -0.25, -2.6);
dragon.group.rotation.y = -0.46;        // -26°，摆脱正面对称 → 立刻不像雕塑
dragon.group.rotation.x = -0.05;
scene.add(dragon.group);

/* ---------- 接地阴影（软阴影贴片） ----------
   实时光阴影在软件渲染下噪点多、边缘硬，
   再补一层径向渐变当环境光遮蔽，主体才真的「坐」在地上。 */
function makeSoftShadowTexture() {
  const s = 256;
  const cv = document.createElement('canvas');
  cv.width = cv.height = s;
  const ctx = cv.getContext('2d');
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0, 'rgba(0,0,0,0.85)');
  g.addColorStop(0.5, 'rgba(0,0,0,0.45)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  const t = new THREE.CanvasTexture(cv);
  return t;
}
const softShadow = new THREE.Mesh(
  new THREE.PlaneGeometry(11, 9),
  new THREE.MeshBasicMaterial({
    map: makeSoftShadowTexture(),
    transparent: true,
    opacity: 0.75,
    depthWrite: false,
  })
);
softShadow.rotation.x = -Math.PI / 2;
softShadow.position.set(0, -0.06, -0.6);
scene.add(softShadow);

// 抬高后的投影也比照上移，不然阴影会跟物体错位
softShadow.scale.setScalar(1.06);
softShadow.material.opacity = 0.62;

// 接触阴影：紧贴底座的一圈小而深的阴影，解决「浮空感」
// （大范围软阴影负责环境遮蔽，这一层负责真「贴地」）
const contactShadow = new THREE.Mesh(
  new THREE.PlaneGeometry(7.2, 5.6),
  new THREE.MeshBasicMaterial({
    map: makeSoftShadowTexture(),
    transparent: true,
    opacity: 0.88,
    depthWrite: false,
  })
);
contactShadow.rotation.x = -Math.PI / 2;
contactShadow.position.set(0, -0.012, -0.6);
/* 【v1.2.4】接触阴影必须画在视频**之后**，否则被那块近不透明的视频面盖掉 → 机器像浮在彩色地毯上。
   高度已经比视频高（-0.012 > -0.030），但透明物体是按 renderOrder 排的，光有高度不够。 */
contactShadow.renderOrder = 6;
contactShadow.material.opacity = 0.72;
scene.add(contactShadow);

/* 【v1.3.4 歌词下移】老爹：字飘在最上面、和喇叭中间一大片黑，像两块不相干的东西。
   喇叭口现在世界高度约 1.90（caseH 0.55 + 口沿 1.008，再乘机器缩放 1.22）。
   原来 baseY=4.65 → 空隙 2.75，太远。
   v1.3.4 先试 3.60，实测空隙仍约 1.27（≈一个字高），还是像两块分开的东西；
   v1.3.5 再压到 3.25 → 字底 2.82，喇叭口 1.90，空隙约 0.92，比字高更小，接得上了。
   注意：喇叭压矮之后它变低了，所以下移量不能过头，否则字会压到唱盘上。 */
/* 【v1.7.5 第五次对位：拉开间距】
   实测龙包围盒 Y -0.08~3.17（头顶 3.17）。上一版 baseY=3.75 只高出 0.58，
   而字本身有半个字高 → 底边仍然蹭到龙角。
   本版：龙缩到 0.21 并下移 0.25（头顶降到约 2.5），字 baseY 提到 **4.55**。
   两者之间留出大约两米空地，龙角碰不到字了。 */
const lyrics = createLyrics(THREE, {
  baseY: 4.55,
  charSize: 0.62,
  spacing: 0.05,
  arcDepth: 0.70,
  maxLineWidth: 7.4,
});
lyrics.group.position.z = 1.6;
scene.add(lyrics.group);

/* ==================== 音频 / 视频 ==================== */
/* 用 <video> 元素统一播所有媒体：音频文件它也能放。
   为什么不用 <audio>：视频文件必须是 video 元素才能出画面（VideoTexture 要用它）。
   一个元素、一条 MediaElementSource、一套播放控制 —— 不用维护两套状态。 */
const audioEl = document.createElement('video');
audioEl.playsInline = true;
audioEl.setAttribute('playsinline', '');
audioEl.preload = 'auto';
audioEl.crossOrigin = 'anonymous';
audioEl.loop = false;

let audioCtx = null;
let analyser = null;      // 合并后的总频谱（沿用，算总能量）
let freqData = null;
let srcNode = null;

/* 【v1.4.2 立体声拆分】老爹：「浏览器怎么这么抠门呢？还不给我们用」
   根子不在浏览器偏心，而在 AnalyserNode 按 Web Audio 规范**先把多声道混成单声道**再分析——
   拿到的永远是一条合并频谱，左响右响完全分不出来。
   
   解法是 ChannelSplitter：把音源按声道拆成独立的腿，每条腿各挂一个 Analyser，
   这样左、右各自的能量才拿得到。声音照旧直连 destination，不影响播放。
   
        mediaSource ─┬─→ splitter ─┬─→ analyserL（左）
                     │             └─→ analyserR（右）
                     ├─→ analyser（合并，算总能量）
                     └─→ destination（出声）
   
   注意：单声道文件 splitter 只有 1 路，analyserR 会一直静音——所以下面判 channelCount，
   单声道时把左右都当总能量用，不做左右摆动。 */
let splitter = null;
let analyserL = null, analyserR = null;
let dataL = null, dataR = null;
let isStereo = false;

function ensureAudioGraph() {
  if (audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  srcNode = audioCtx.createMediaElementSource(audioEl);

  analyser = audioCtx.createAnalyser();
  analyser.fftSize = 512;
  analyser.smoothingTimeConstant = 0.75;
  freqData = new Uint8Array(analyser.frequencyBinCount);

  srcNode.connect(analyser);
  analyser.connect(audioCtx.destination);

  // ---- 左右声道拆分（v1.4.2）----
  splitter = audioCtx.createChannelSplitter(2);
  analyserL = audioCtx.createAnalyser();
  analyserR = audioCtx.createAnalyser();
  analyserL.fftSize = 256;
  analyserR.fftSize = 256;
  analyserL.smoothingTimeConstant = 0.72;
  analyserR.smoothingTimeConstant = 0.72;
  dataL = new Uint8Array(analyserL.frequencyBinCount);
  dataR = new Uint8Array(analyserR.frequencyBinCount);
  srcNode.connect(splitter);
  splitter.connect(analyserL, 0);
  splitter.connect(analyserR, 1);
  // 分析器不用连出声，挂在这儿只做取数
}

/** 取一个 0..1 的低频能量，驱动唱片机光环与歌词呼吸 */
function audioLevel() {
  if (!analyser) return 0;
  analyser.getByteFrequencyData(freqData);
  // 只取低频段（前 1/6），音乐的鼓点基本都在这里
  const n = Math.max(1, Math.floor(freqData.length / 6));
  let sum = 0;
  for (let i = 0; i < n; i++) sum += freqData[i];
  return Math.min(1, sum / n / 190);
}

/* 【v1.4.2】左右声道各自的低频能量，-1..1 表示偏向（负=左，正=右）。
   顺带算出总能量，省得再扫一遍合并频谱。 */
let stereoBias = 0;      // 平滑后的左右偏向，-1..1
let stereoLevel = 0;     // 左右平均后的总能量
function audioStereo() {
  if (!analyserL || !analyserR) return { bias: 0, level: audioLevel() };
  analyserL.getByteFrequencyData(dataL);
  analyserR.getByteFrequencyData(dataR);
  const nL = Math.max(1, Math.floor(dataL.length / 6));
  const nR = Math.max(1, Math.floor(dataR.length / 6));
  let sl = 0, sr = 0;
  for (let i = 0; i < nL; i++) sl += dataL[i];
  for (let i = 0; i < nR; i++) sr += dataR[i];
  const lv = Math.min(1, sl / nL / 190);
  const rv = Math.min(1, sr / nR / 190);
  // 单声道文件：两路一样，bias 恒为 0，不会乱摆
  const bias = Math.max(-1, Math.min(1, (rv - lv) * 2.2));
  return { bias, level: Math.max(lv, rv) };
}

/* ==================== 状态 ==================== */
let lines = [];
let usingEstimated = false;

/* 【v1.2.3】歌词整体偏移（秒）。正数 = 歌词延后出现，负数 = 提前。
   为什么需要：lrc 和音频不同源时差个 0.3~1 秒是常态（不同软件抓的词、导出时间轴不一致），
   以前只能改文件，现在给两个 ± 按钮自己拧。 */
let lyricShift = 0;
const SHIFT_STEP = 0.2;

/* ==================== UI ==================== */
const $ = (id) => document.getElementById(id);
const dropZone = $('drop');
const fileAudio = $('fileAudio');
const fileLrc = $('fileLrc');
const btnPlay = $('btnPlay');
const btnLoop = $('btnLoop');
const btnDemo = $('btnDemo');
const statusEl = $('status');
const titleEl = $('title');
const progEl = $('prog');
const progBar = $('progBar');
const timeEl = $('time');

function setStatus(msg, kind = '') {
  statusEl.textContent = msg;
  statusEl.className = 'status ' + kind;
}

/* ---------- 拖拽 ---------- */
['dragenter', 'dragover'].forEach((ev) =>
  document.addEventListener(ev, (e) => {
    e.preventDefault();
    dropZone.classList.add('over');
  })
);
['dragleave', 'drop'].forEach((ev) =>
  document.addEventListener(ev, (e) => {
    e.preventDefault();
    if (ev === 'dragleave' && e.relatedTarget) return;
    dropZone.classList.remove('over');
  })
);

document.addEventListener('drop', (e) => {
  const files = Array.from(e.dataTransfer?.files || []);
  handleFiles(files);
});

fileAudio.addEventListener('change', () => handleFiles(Array.from(fileAudio.files)));
fileLrc.addEventListener('change', () => handleFiles(Array.from(fileLrc.files)));

let pendingLrcFile = null;
// 用户是否已自己载入过媒体（一旦载入，就不再自动上演示词，否则会盖掉他的歌）
let userLoaded = false;

async function handleFiles(files) {
  if (!files.length) return;
  const isText = (f) => /\.(lrc|txt)$/i.test(f.name) || f.type.startsWith('text/');
  const isVideo = (f) => f.type.startsWith('video/') || /\.(mp4|webm|mov|m4v|mkv|avi)$/i.test(f.name);
  const isAudio = (f) => f.type.startsWith('audio/') || /\.(mp3|wav|m4a|ogg|flac|aac|opus)$/i.test(f.name);

  let handled = 0;
  for (const f of files) {
    if (isText(f)) {
      pendingLrcFile = f;
      handled++;
    } else if (isVideo(f)) {
      loadMediaFile(f, true);
      handled++;
    } else if (isAudio(f)) {
      loadMediaFile(f, false);
      handled++;
    }
  }

  // 上一个版本这里只认 audio/*，视频直接掉进空分支 → 拖进去毫无反应。
  // 现在分开识别，并且不认识的类型要明确告诉用户，不能静默。
  if (!handled) {
    const names = files.map((f) => f.name).join('、');
    setStatus('不认识这个文件：' + names + '（要 mp3 / mp4 / lrc）', 'warn');
    return;
  }

  if (pendingLrcFile && audioEl.src) {
    await applyLrcFile(pendingLrcFile);
    pendingLrcFile = null;
  } else if (pendingLrcFile) {
    // 只拖了歌词、还没音视频：先收下，别默默丢掉
    setStatus('歌词已收下（共 ' + (await peekLrcCount(pendingLrcFile)) + ' 行）→ 再拖一个 mp3/mp4 就对上了', 'ok');
  }
}

/** 给状态提示用：数一下这份 lrc 能解析出几行 */
async function peekLrcCount(file) {
  try {
    return parseLrc(await file.text()).length;
  } catch {
    return 0;
  }
}

function loadMediaFile(file, isVideo) {
  const url = URL.createObjectURL(file);
  audioEl.src = url;
  audioEl.load();
  titleEl.textContent = file.name.replace(/\.[^.]+$/, '');
  btnPlay.disabled = false;

  /* 【v1.3.9 修】上一版为了修「演示词串片」把歌词无条件清空 → 老爹丢个视频进来，
     内置的英雄文案也跟着没了。现在改成按来源区分：
       - 没有自带 .lrc → 保留当前文字（内置的继续转，视频只当背景/投影）
       - 有自带 .lrc   → 用 .lrc 覆盖（等 onloadedmetadata 里 applyLrcFile）
     为什么不再担心「串片」：以前内置的是伪装成歌词的演示句（夜色落在海面上），
     容易被当成“用户自己的词”；现在内置的是明显的主标题文案（天下英雄如过江之鲫），
     留着不会被误会，反而正好当背景滚动字幕。 */
  userLoaded = true;
  usingEstimated = false;
  demoClock = 0;
  // 只有明确要换词（带了 .lrc）时才清空
  if (pendingLrcFile) {
    lines = [];
    lyrics.setLines([]);
  }

  if (isVideo) {
    attachVideoToGround(url);
    setStatus('视频已载入 → 投到地面上，点播放', 'ok');
  } else {
    detachVideoFromGround();
    setStatus('音频已载入，点播放', 'ok');
  }

  audioEl.onloadedmetadata = async () => {
    if (isVideo) layoutVideoScreen(audioEl.videoWidth / audioEl.videoHeight);
    if (pendingLrcFile) {
      await applyLrcFile(pendingLrcFile);
      pendingLrcFile = null;
      demoMode = false;          // 用自己的词、跟自己的时间轴
    } else if (lines.length) {
      // 没带词：保留当前文字，改成跟媒体时钟走（而不是墙钟）
      demoMode = false;
      setStatus(`已载入（沿用当前 ${lines.length} 条文字，时间轴跟媒体走）`, 'ok');
    } else {
      setStatus('已载入。没有文字 → 可拖个 .lrc 进来');
    }
  };

  audioEl.onerror = () => {
    setStatus('这个文件浏览器放不了（编码可能不支持）：' + file.name, 'warn');
  };
}

/* ---------- ③ 地面投影：把用户视频投到地面上 ---------- */
let videoTex = null;

function attachVideoToGround(url) {
  if (!videoScreen) return;
  if (videoTex) videoTex.dispose();

  videoTex = new THREE.VideoTexture(audioEl);
  videoTex.colorSpace = THREE.SRGBColorSpace;
  videoTex.minFilter = THREE.LinearFilter;
  videoTex.magFilter = THREE.LinearFilter;
  videoTex.generateMipmaps = false;

  // ShaderMaterial 控制的是 uniforms，不是 material.opacity / .map
  videoUniforms.uMap.value = videoTex;
  videoUniforms.uOpacity.value = 0.0;
  videoScreen.visible = true;
  /* 【v1.2.1】从 0.72 提到 0.94：
     上一版视频半透 → 下面那层深色接地阴影直接透上来，
     视频中央永远脏一块，看着就像“地上有块奇怪的黑块”。
     视频现在是「发光的屏幕」，就得盖住地面阴影，而不是让阴影透上来。 */
  videoTargetOpacity = 0.94;   // 主循环里缓慢淡入
}

function detachVideoFromGround() {
  if (!videoScreen) return;
  videoUniforms.uOpacity.value = 0;
  videoScreen.visible = false;
  if (videoTex) { videoTex.dispose(); videoTex = null; }
  videoUniforms.uMap.value = null;
  videoTargetOpacity = 0;
}

async function applyLrcFile(file) {
  const text = await file.text();
  const parsed = parseLrc(text);
  if (!parsed.length) {
    setStatus('这个文件没解析出歌词，格式可能不对', 'warn');
    return;
  }
  lines = parsed;
  usingEstimated = false;
  lyrics.setLines(lines);
  setStatus(`歌词已载入：${lines.length} 行`, 'ok');
}

/* ---------- 播放控制 ---------- */
btnPlay.addEventListener('click', async () => {
  ensureAudioGraph();
  if (audioCtx.state === 'suspended') await audioCtx.resume();

  if (audioEl.paused) {
    try {
      await audioEl.play();
      btnPlay.textContent = '⏸';
    } catch (err) {
      setStatus('播放失败：' + err.message, 'warn');
    }
  } else {
    audioEl.pause();
    btnPlay.textContent = '▶';
  }
});

progEl.addEventListener('click', (e) => {
  if (!audioEl.duration) return;
  const r = progEl.getBoundingClientRect();
  const p = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
  audioEl.currentTime = p * audioEl.duration;
});

/* ---------- 【v1.2.3】歌词整体微调 ----------
   为什么要有：lrc 和音频常常不是同一个软件出的，差 0.2~1 秒是常态。
   「歌词没根据我的歌来弄」里有一半就是这种轻微错位 —— 以前只能手改 lrc 文件。
   现在：◀ 让歌词提前、▶ 让歌词延后，每下 0.2 秒，长按可连点。 */
const shiftValEl = $('shiftVal');
const btnShiftBack = $('btnShiftBack');
const btnShiftFwd = $('btnShiftFwd');

function renderShift() {
  if (!shiftValEl) return;
  const v = lyricShift;
  const sign = v > 0 ? '+' : '';
  shiftValEl.textContent = sign + v.toFixed(1) + 's';
  shiftValEl.style.color = Math.abs(v) < 0.01 ? '#7fa8c8' : '#7fe0ff';
}
function nudgeShift(delta) {
  lyricShift = Math.max(-10, Math.min(10, +(lyricShift + delta).toFixed(2)));
  renderShift();
}
if (btnShiftBack) btnShiftBack.addEventListener('click', () => nudgeShift(-SHIFT_STEP));
if (btnShiftFwd) btnShiftFwd.addEventListener('click', () => nudgeShift(SHIFT_STEP));
// 双击归零，省得一下下点回去
if (shiftValEl) shiftValEl.addEventListener('dblclick', () => { lyricShift = 0; renderShift(); });
renderShift();

/* ---------- 【v1.3.0】视频落点三选一 ---------- */
const modeBtns = Array.from(document.querySelectorAll('#modeBox .modeBtn'));
function renderMode() {
  for (const b of modeBtns) b.classList.toggle('on', b.dataset.mode === videoMode);
}
for (const b of modeBtns) {
  b.addEventListener('click', () => {
    if (videoMode === b.dataset.mode) return;
    videoMode = b.dataset.mode;
    renderMode();
    // 有视频时立刻按新模式重新摆位；没视频就只在下次载入时生效
    if (videoScreen.visible && audioEl.videoWidth) {
      layoutVideoScreen(audioEl.videoWidth / audioEl.videoHeight);
      // 地面模式要压掉地板假阴影，其它模式要恢复
      if (videoMode !== 'floor') shadowDim = 0;
    }
  });
}
renderMode();

/* ---------- 【v1.3.1】单曲循环开关 ---------- */
function renderLoop() {
  if (!btnLoop) return;
  const on = !!audioEl.loop;
  btnLoop.classList.toggle('on', on);
  btnLoop.title = on ? '单曲循环：开（点一下关掉）' : '单曲循环：关（点一下打开）';
}
if (btnLoop) {
  btnLoop.addEventListener('click', () => {
    audioEl.loop = !audioEl.loop;
    renderLoop();
    // 循环开着但已经播完了 → 直接从头再来，省得用户再点一次播放
    if (audioEl.loop && audioEl.ended && audioEl.src) {
      audioEl.currentTime = 0;
      audioEl.play().catch(() => {});
    }
  });
}
renderLoop();

/* ---------- 演示词（没有 lrc 也能看效果） ---------- */
/* 【v1.4.1 真·逐帧重抽】老爹："你那个歌词和那个对不上呀，还有好多你都去掉了"
   上一版（v1.4.0）的 29 条还是有问题，这次用 OCR 逐 0.5 秒扫全片重抽，纠了三处：
   ① 开头两句被当噪声删了：「一道光，是一个人。」「越亮，今天记得他的人越多。」
   ② 时代旁白漏了：「诸子百家」「战国七雄」「前230，灭韩。」「只剩齐。」
   ③ 结尾「江山代有才人出」视频里根本不存在（是我上一版凭印象加的）——
      视频最后一帧停在「毛泽东·开国大典」（117.5s），已删。
   另：原文是「张骞·凿空西域」（《史记》原话），不是我改的「通西域」。
   现在 33 条全部对应视频真实画面，时间戳来自逐帧 OCR。 */
const DEMO_LRC = `[00:00.00]一道光，是一个人。
[00:01.00]越亮，今天记得他的人越多。
[00:04.50]孔子·周游列国
[00:08.50]诸子百家
[00:15.50]战国七雄
[00:17.00]屈原·写下《离骚》
[00:21.00]白起·长平之战
[00:22.50]前230，灭韩。
[00:28.00]只剩齐。
[00:30.00]秦始皇·灭六国
[00:33.50]项羽·破釜沉舟
[00:39.00]张骞·凿空西域
[00:40.50]霍去病·封狼居胥
[00:45.00]司马迁·写完《史记》
[00:48.50]诸葛亮·隆中对策
[00:55.00]李世民·玄武门之变
[00:58.50]武则天·登基称帝
[01:02.50]李白·仗剑远游
[01:06.00]苏轼·进士及第
[01:09.50]岳飞·收复襄阳六郡
[01:13.50]辛弃疾·五十骑闯五万敌营
[01:16.50]文天祥·状元及第
[01:20.00]郭守敬·编成授时历
[01:23.00]朱元璋·开国称帝
[01:26.00]郑和·首下西洋
[01:29.00]王阳明·龙场悟道
[01:33.00]李时珍·写成《本草纲目》
[01:36.50]林则徐·虎门销烟
[01:40.50]左宗棠·抬棺出关
[01:44.00]邓世昌·驾致远舰冲向敌舰
[01:48.00]孙中山·就任临时大总统
[01:51.00]聂耳·谱写《义勇军进行曲》
[01:57.50]毛泽东·开国大典`;

btnDemo.addEventListener('click', () => {
  const parsed = parseLrc(DEMO_LRC);
  lines = parsed;
  usingEstimated = false;
  lyrics.setLines(lines);
  // 演示模式：不用音频，用墙钟推着走
  demoStart = performance.now();
  demoMode = true;
  setStatus('演示模式：没有音频，文字自己走', 'ok');
  titleEl.textContent = '天下英雄如过江之鲫';
  btnPlay.disabled = true;
});

let demoMode = false;
let demoStart = 0;   // performance.now() 基准，用墙钟而不是累加 dt
                         // （低帧率时累加 dt 会掉速，导致演示进度变慢）

/* ==================== 音频事件 ==================== */
audioEl.addEventListener('play', () => {
  demoMode = false;
  btnPlay.textContent = '⏸';
});
audioEl.addEventListener('pause', () => {
  btnPlay.textContent = '▶';
});
audioEl.addEventListener('timeupdate', () => {
  if (!audioEl.duration) return;
  progBar.style.width = (audioEl.currentTime / audioEl.duration) * 100 + '%';
  timeEl.textContent = fmt(audioEl.currentTime) + ' / ' + fmt(audioEl.duration);
});
audioEl.addEventListener('ended', () => {
  /* 【v1.3.1】循环：优先用 audioEl.loop（原生最稳，进度条自然归零）。
     这里再兜一层手动重播 —— 个别浏览器/编码下 ended 后 loop 不生效。 */
  if (audioEl.loop) {
    audioEl.currentTime = 0;
    audioEl.play().catch(() => { btnPlay.textContent = '▶'; });
    return;
  }
  btnPlay.textContent = '▶';
});

function fmt(s) {
  if (!isFinite(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return m + ':' + String(sec).padStart(2, '0');
}

/* ==================== 控制栏自动隐藏 ==================== */
// 静止 2.5 秒就淡出，鼠标一动或碰到它立刻回来。
// 目的：别让控制条长期压着画面主体（唱片机）。
(() => {
  const bar = document.getElementById('bar');
  let idleTimer = null;
  let overBar = false;

  function wake() {
    bar.classList.remove('idle');
    if (idleTimer) clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      // 演示模式也算「在跑」，不然控制条永远不会自动隐去
      if (!overBar && (!audioEl.paused || demoMode)) bar.classList.add('idle');
    }, 2500);
  }

  bar.addEventListener('mouseenter', () => { overBar = true; bar.classList.remove('idle'); });
  bar.addEventListener('mouseleave', () => { overBar = false; wake(); });
  bar.addEventListener('touchstart', () => {
    overBar = true;
    bar.classList.remove('idle');
    setTimeout(() => { overBar = false; wake(); }, 4000);
  }, { passive: true });

  window.addEventListener('pointermove', wake, { passive: true });
  window.addEventListener('pointerdown', wake, { passive: true });
  wake();
})();

/* ==================== 尺寸 ==================== */
function resize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);

/* ==================== 主循环 ==================== */
const clock = new THREE.Clock();

function tick() {
  requestAnimationFrame(tick);

  const dt = Math.min(0.05, clock.getDelta());
  const st = audioStereo();
  const level = st.level || audioLevel();
  const playing = !audioEl.paused || demoMode;

  /* 【v1.4.2 立体声光效】把左右偏向平滑后传给灯光与场景——
     不平滑的话鼓点一来左右灯乱跳，看着像接触不良。 */
  stereoBias += (st.bias - stereoBias) * Math.min(1, dt * 6);
  stereoLevel = level;
  applyStereoLights(stereoBias, level, playing, dt);

  if (demoMode) demoClock = (performance.now() - demoStart) / 1000;

  const t = demoMode ? demoClock : audioEl.currentTime;

  dragon.update(dt, level, playing);

  // 每帧把龙嘴的世界坐标喂给歌词，字就从那儿冒出来
  lyrics.setOrigin(dragon.getHornWorldPos(THREE));

  if (lines.length) lyrics.update(t - lyricShift, level);

  // 视频投影面淡入淡出（不硬切，避免两帧之间突兀跳跃）
  // 注意：ShaderMaterial 控制的是 uniforms.uOpacity，不是 material.opacity
  if (videoScreen && videoScreen.visible) {
    const cur = videoUniforms.uOpacity.value;
    const next = cur + (videoTargetOpacity - cur) * Math.min(1, dt * 2.2);
    videoUniforms.uOpacity.value = next;
    if (videoTargetOpacity === 0 && next < 0.01) {
      videoScreen.visible = false;
      videoUniforms.uOpacity.value = 0;
    }
  }

  /* 地上那几层「假阴影/光斑」跟着视频一起让位：
     视频在 → shadowDim→1（压到 8%）；视频走 → shadowDim→0（恢复原值）。
     不硬切，用阻尼跟着走，避免一瞬变亮。
     —— 这是「地面投影诡异」的第二层原因：即使视频盖在最上面，
        半透叠加也会把下面的深色椭圆透上来，中央永远脏一块。 */
  {
    const want = (videoTargetOpacity > 0 && videoMode === 'floor') ? 1 : 0;
    shadowDim += (want - shadowDim) * Math.min(1, dt * 2.0);
    const k = 1 - shadowDim * 0.92;          // 1 → 0.08
    if (softShadow)    softShadow.material.opacity    = SHADOW_BASE.soft * k;
    /* 接触阴影是「接地感」的唯一来源，视频铺上来也**不能压掉**，否则机器像浮在彩色地毯上。
       但它自己会被视频盖住（在下面）→ 所以它的高度已抬到视频之上（-0.012 > -0.030）。 */
    if (contactShadow) contactShadow.material.opacity = SHADOW_BASE.contact;
    /* 【v1.4.2】地面光斑随节拍呼吸 + 随声道偏向左右滑动——
       原来它是死的，只负责“铺底色”；现在让它有点心跳。 */
    if (floorGlow) {
      const pulse = playing ? 0.86 + level * 0.42 : 0.7;
      floorGlow.material.opacity = SHADOW_BASE.glow * k * pulse;
      floorGlow.position.x = stereoBias * 1.2;
      const fs = (playing ? 1 + level * 0.05 : 1);
      floorGlow.scale.set(fs, fs, 1);
    }
  }

  // 浮尘缓慢上浮（填中景，也给静止镜头一点生气）
  if (dust) {
    const arr = dust.geometry.attributes.position.array;
    const spd = dust.geometry.userData.spd;
    for (let i = 0; i < spd.length; i++) {
      arr[i * 3 + 1] += spd[i] * dt;
      if (arr[i * 3 + 1] > 13) arr[i * 3 + 1] = -0.2;
    }
    dust.geometry.attributes.position.needsUpdate = true;
  }

  controls.update();
  renderer.render(scene, camera);
}

/* ==================== 启动 ==================== */
let demoClock = 0;

/* 演示入口（v1.3.7）：
   ?video=<相对路径>   直接载入站内视频/音频并自动播放
   ?lrc=<相对路径>     同时载入配套歌词（不写就用 video 同名的 .lrc）
   ?mode=floor|screen|bg  指定视频呈现方式
   一条链接就能当宣传页用：开了就唱、就转，不用拖文件。 */
(() => {
  const q = new URLSearchParams(location.search);
  const v = q.get('video');
  if (!v) return;
  userLoaded = true;
  lines = [];
  lyrics.setLines([]);
  demoMode = false;
  audioEl.src = v;
  audioEl.load();
  btnPlay.disabled = false;
  attachVideoToGround(v);

  /* 歌词：显式 ?lrc= 优先；否则自动试同名候选。
     为什么先试 .txt：服务器静态白名单里有 .txt 没有 .lrc（安全策略只放行网页该用的扩展名），
     .lrc 会被 404。所以站内演示歌词一律存成 .txt（内容还是 LRC 格式，解析器不看扩展名）。 */
  const stem = v.replace(/\.[^.]+$/, '');
  const candidates = q.get('lrc')
    ? [q.get('lrc')]
    : [stem + '.txt', stem + '.lrc'];

  audioEl.onloadedmetadata = async () => {
    layoutVideoScreen(audioEl.videoWidth / audioEl.videoHeight);
    for (const url of candidates) {
      try {
        const r = await fetch(url, { cache: 'no-cache' });
        if (!r.ok) continue;
        const parsed = parseLrc(await r.text());
        if (parsed.length) {
          lines = parsed;
          lyrics.setLines(lines);
          setStatus('演示：视频 + 歌词已载入（' + lines.length + ' 行）', 'ok');
          break;
        }
      } catch (e) {
        // 当前候选不行就试下一个；全都不行就只放视频，不算错误
      }
    }
    audioEl.play().catch(() => {});
  };
})();

// 调试钩子：无头浏览器截图时要能跳到指定时间看效果
window.__lyric = {
  seek(sec) {
    demoMode = true;
    demoStart = performance.now() - sec * 1000;
  },
  info() {
    return { demoMode, t: demoClock, lines: lines.length, idx: lyrics.currentIndex };
  },
};
$('ver').textContent = VERSION;
resize();
tick();

// 自动挑一个演示词，让页面一打开就有东西看
// 但只在“用户什么都没载入”时给（否则会把人家自己的歌盖掉，看着像歌词不对）
setTimeout(() => {
  if (!userLoaded && !lines.length) {
    const parsed = parseLrc(DEMO_LRC);
    lines = parsed;
    lyrics.setLines(lines);
    demoMode = true;
    demoStart = performance.now();
    setStatus('先看演示。拖入 mp3 + lrc 换成你自己的歌', 'ok');
    titleEl.textContent = '天下英雄如过江之鲫';
  }
}, 300);
