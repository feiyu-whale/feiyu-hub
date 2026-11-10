// ============================================================
// 沙线行动 · Service Worker（v0.14 自动清缓存版 20261020）
// 设计目标：改了代码，用户下次打开自动拿新版，不用手动强刷。
// 策略：网络优先（network-first）+ 版本变更自动清旧缓存 + 兜底离线缓存。
//   1) install：预缓存资源清单
//   2) activate：删掉所有旧版本缓存（只保留当前 CACHE 名），立刻接管
//   3) fetch：
//      - 导航请求(index.html) → 网络优先，失败回落缓存
//      - 静态资源 → 缓存优先 + 后台静默更新（stale-while-revalidate）
// ============================================================
const CACHE = "sandline-v014-autopurge";
const FILES = [
  "./assets/weapons/blaster-a.glb",
  "./assets/weapons/blaster-b.glb",
  "./assets/weapons/blaster-d.glb",
  "./assets/weapons/blaster-l.glb",
  "./assets/weapons/Textures/colormap.png",
  "./assets/characters/Soldier.glb",
  "./assets/environment/beige_wall_001_diff_1k.jpg",
  "./assets/environment/beige_wall_001_nor_gl_1k.jpg",
  "./assets/environment/beige_wall_001_rough_1k.jpg",
  "./assets/environment/cobblestone_floor_01_diff_1k.jpg",
  "./assets/environment/cobblestone_floor_01_nor_gl_1k.jpg",
  "./assets/environment/cobblestone_floor_01_rough_1k.jpg",
  "./assets/environment/container_side_diff_1k.jpg",
  "./assets/environment/container_side_nor_gl_1k.jpg",
  "./assets/environment/container_side_rough_1k.jpg",
  "./assets/environment/corrugated_iron_diff_1k.jpg",
  "./assets/environment/corrugated_iron_nor_gl_1k.jpg",
  "./assets/environment/corrugated_iron_rough_1k.jpg",
  "./assets/environment/dirt-diff.jpg",
  "./assets/environment/dirt-nor_gl.jpg",
  "./assets/environment/dirt-rough.jpg",
  "./assets/environment/wooden_planks_diff_1k.jpg",
  "./assets/environment/wooden_planks_nor_gl_1k.jpg",
  "./assets/environment/wooden_planks_rough_1k.jpg",
  "./assets/index-CYUjsvtr.js",
  "./assets/index-D4EVXDLD.css",
  "./assets/main-DdYgTcL8.css",
  "./assets/main-_QnvGLZJ.js",
  "./assets/startup-llsIM4up.js",
  "./assets/three-CTATN3jM.js",
  "./icon-192.png",
  "./icon-512.png",
  "./icon.svg",
  "./index.html",
  "./manifest.webmanifest",
  "./site-config.js"
];

// install：预缓存 + 跳过等待（新 SW 立即进入 waiting → activate）
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(FILES))
      .then(() => self.skipWaiting())
      .catch(err => {
        console.warn('[SW] 预缓存部分失败（不影响主流程）', err);
        return self.skipWaiting();
      })
  );
});

// activate：清掉所有旧版缓存，立刻接管所有页面
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(k => k.startsWith('sandline-') && k !== CACHE)
          .map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// 允许页面查询缓存版本
self.addEventListener('message', event => {
  if (event.data === 'CACHE_STATUS') {
    event.ports[0]?.postMessage({ ready: true, version: CACHE });
  }
  // 页面主动要求跳过等待
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

// fetch：导航网络优先；静态资源缓存优先 + 后台更新
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // 1) 页面导航：网络优先，断网回落缓存
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put('./index.html', copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match('./index.html', { ignoreVary: true }))
    );
    return;
  }

  // 2) 静态资源：缓存优先，同时后台刷新（下次打开就是新的）
  event.respondWith(
    caches.open(CACHE).then(async c => {
      const hit = await c.match(req, { ignoreVary: true });
      const network = fetch(req)
        .then(res => {
          if (res && res.ok) c.put(req, res.clone()).catch(() => {});
          return res;
        })
        .catch(() => null);

      return hit || (await network) || new Response('', { status: 504 });
    })
  );
});
