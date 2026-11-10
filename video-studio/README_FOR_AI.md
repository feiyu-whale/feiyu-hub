# 肥鱼剪辑台 / Feiyu Video Studio — 交接说明（给外部 AI）

## 这是什么
一个**纯前端**的视频剪辑器，两个版本共用一套引擎：
- **专业版**（`index.html`）：多轨道、关键帧、调色、LUT、字幕、导出 MP4/WebM
- **普通版**（`simple.html`）：单轨三步式（选视频 → 剪 → 导出），面向普通用户

所有处理都在浏览器里完成，**文件不上传、不依赖服务器**。

## 技术栈
- Vue 3 + TypeScript + Vite + Pinia
- WebCodecs（H.264 编码）、mp4-muxer（MP4 封装）、MediaRecorder（WebM 兜底）
- WebAudio（EQ / 压缩 / 混音 / 闪避）、WebGL2（3D LUT）
- Capacitor 8（打安卓 APK，`com.feiyu.videostudio` / `com.feiyu.videostudio.simple`）

## 目录
```
src/
  App.vue               专业版外壳（顶栏/播放控制/自动保存/JKL）
  SimpleApp.vue         普通版外壳
  components/
    Timeline.vue        多轨道时间轴（拖拽/裁剪/分割/吸附/波形/标记/入出点）
    PreviewStage.vue    预览合成（多轨 + 文字 + 转场 + 蒙版 + LUT + 调色）
    MediaPanel.vue      素材导入 / SRT 导入 / 三点插入
    Inspector.vue       属性面板（文字/变换/音频/蒙版/转场/变速关键帧/LUT/预设）
    ExportDialog.vue    导出（本机 MP4/WebM、SRT、服务器任务 JSON）
  stores/project.ts     全部工程状态：轨道/片段/素材/撤销重做/保存/插值函数
  lib/
    media.ts     时长与缩略图探测
    srt.ts       SRT 读写
    lut.ts       .cube 解析
    lutRenderer.ts  WebGL2 3D LUT 渲染
    exporter.ts  WebM 导出（MediaRecorder）
    mp4exporter.ts MP4 导出（WebCodecs + mp4-muxer）
    webmDuration.ts 给 MediaRecorder 产出的 WebM 补 Duration 元数据
    waveform.ts  音频峰值
    idb.ts       素材存 IndexedDB
    nativeSave.ts 安卓原生保存/分享
```

## 构建
```bash
npm install          # 国内建议加 --registry=https://registry.npmmirror.com
npm run build        # 输出 dist/（index.html=专业版，simple.html=普通版）
npm run dev
```
打 APK（Capacitor）：
```bash
npx cap add android && npx cap sync android
cd android && ./gradlew assembleDebug
```
国内 Gradle 记得换镜像：`mirrors.cloud.tencent.com/gradle/`。

## 关键设计约定
1. **专业版里声音只从「音频轨片段」出**，视频片段只出画面；导入视频时会自动拆成两条。
2. **普通版**用 `audioFromVideo: true`，视频片段自带声音。
3. 变速用「毫秒精度关键帧 + 线性/缓动插值」，源时间靠 `sourceTimeAt()` 对速度曲线积分。
4. 导出是**实时录制/编码**，片长 1 分钟就要等 1 分钟——这是纯前端零服务器的代价。
5. 颜色管线：canvas filter（亮度/对比/饱和 + 预设）→ WebGL2 LUT → 转场覆盖 → 文字层。

## 已知限制
- WebM 的 Duration 需要后处理补写（已实现，见 `webmDuration.ts`）
- AAC 编码不是所有浏览器都支持；不支持时自动回退 WebM
- LUT 文件不持久化，刷新后要重新加载
- 普通版没有多轨/关键帧（有意为之）

## 还没做的（优先级排序）
1. 代理剪辑（大素材先低清剪，导出换原片）
2. 多机位同步
3. 嵌套序列（序列套序列）——需要改时间轴数据结构
4. 波形缩放细节、音频波形包络

## 约定
- 开源协议：**MIT**（见 LICENSE），请保留出处说明
- 不要提交任何密钥/账号/服务器地址
