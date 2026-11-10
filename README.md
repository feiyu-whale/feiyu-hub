# 🐳 肥鱼工具与游戏合集（feiyu-hub）

本仓库收录自研的纯前端工具、小游戏与模拟器。**全部零依赖、无后端、不收集任何数据。**

## 目录一览

### 📅 历法与术数
| 目录 | 内容 |
|---|---|
| `calendar/` | 公历・农历・黄历・玛雅历・藏历・回历互转 |
| `divination/` | 八字・紫微・奇门・太乙・塔罗・六爻排盘 |
| `astro-geo/` | 星空图・本命星盘・古天文・经纬度换算 |
| `hist-tools/` | 朝代年号与公元纪年互转 |

### 🧰 工具
| 目录 | 内容 |
|---|---|
| `tools/` | 数学・换算・实用小工具合集 |
| `tools3/` | 工具总目录（理科・文科・娱乐・食品，按学科分类） |
| `pro-tools/` | 专业工具箱（工程计算・医学・化学等，分已审/未审） |
| `humanities/` `humanities-tools/` | 古文字・民俗・文学・写作类工具 |
| `cocktail/` | 鸡尾酒配方・原料反查・酒类百科 |
| `file-tools/` | 图片・PDF・数据格式转换（本地处理不上传） |
| `music-studio/` | 音频裁剪・淡入淡出・变速变调（全本地） |
| `video-studio/` | 视频剪辑台 |
| `video-simple-dist/` `video-pick/` | 视频剪辑简易版 |
| `photocraft/` | 开源网页版图像编辑器（详见其 LICENSE） |
| `lab-reagents/` `lab-multisrc/` `rhine-lab/` | 化学试剂・文献检索・实验模拟 |
| `life-tools/` `element-burn/` `emergence/` | 生活工具・元素周期表・复杂系统可视化 |

### 🎮 游戏
| 目录 | 内容 |
|---|---|
| `games/` | 游戏合区入口（围棋・五子棋・象棋・2048・MOBA・FPS） |
| `sanguo/` | 三国题材放置卡牌 |
| `xiuxian/` | 修仙题材肉鸽 |
| `feiyu-dive/` `feiyu-kitchen/` `whale-bubble/` `water-skip/` | 肥鱼系列休闲小游戏 |
| `rice-lock/` `galton/` `blockforge/` `story/` | 小玩具・概率演示・积木工坊・分段故事 |

### 🏢 模拟经营
| 目录 | 内容 |
|---|---|
| `company-sim/` | 公司经营模拟（数值参考真实财报） |
| `finance-sim/` | 虚拟金融（炒股・外汇・加密货币，虚拟本金） |
| `yunchao/` | 电竞陪玩平台演示系统（纯模拟） |
| `p2p-demo/` | 无服务器 P2P 通信演示 |

### 🔧 其他
`portal/` 入口跳转 · `startup/` 开屏动画 · `support/` 展示页 · `standard/` 通用样式 · `assets/` 公共素材

## 使用

纯静态站点，任意 HTTP 服务器即可：

```bash
python3 -m http.server 8899
# 浏览器打开 http://localhost:8899/
```

## 关于代码

> **本项目底层代码由 AI 辅助生成，结构粗犷，主打能跑。如有洁癖，欢迎提交 PR 优化。**

## 第三方素材声明

- `photocraft/` —— 第三方开源项目，遵循其目录内 `LICENSE-APACHE` / `LICENSE-MIT` 双许可
- `rhine-lab/` —— MIT License，Copyright (c) 2026 Rad-Weed
- `company-sim/` `startup/` `video-studio/` —— MIT License，见各目录 `LICENSE`
- 其余目录为本项目原创代码

本仓库**不包含**任何第三方商业游戏的拆包数据、官方美术资源或未授权素材。

## 许可

除非目录内另有 LICENSE 文件，本项目代码遵循 MIT License。
