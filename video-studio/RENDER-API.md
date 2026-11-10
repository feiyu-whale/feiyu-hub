# 渲染后端接口文档

> 前端（肥鱼剪辑台）只产出参数，**不跑渲染**。
> 渲染由**你自己部署的服务器 / 云函数**完成，我们只提供代码和文档。

---

## 为什么这样设计

| | 我们（前端） | 你（后端） |
|---|---|---|
| 提供什么 | 纯静态网页，剪辑参数 JSON | 一台装了 ffmpeg 的机器 |
| 花什么钱 | 零（静态托管） | **你自己出电费 / 云函数费用** |
| 出什么事 | 跟我们无关 | 你自己负责 |

**核心：视频转码一开，CPU 直接 100%。** 别用你跑别的服务的那台机器（会带崩 QQ 机器人、网站）。用**按量付费的云函数**：腾讯云 SCF / 阿里云 FC / Cloudflare Workers（配 container）。

---

## 一、接口规范

### 1. 健康检查（前端「测试连接」用）

```
GET /health
→ 200 {"ok": true, "ffmpeg": "6.0"}
```

只要返回 2xx 就算通。

### 2. 提交渲染任务

```
POST /render
Content-Type: application/json

{
  "version": 1,
  "segments": [
    {
      "assetId": "a1b2c3",
      "name": "片头.mp4",
      "source": "assets/片头.mp4",
      "timelineStart": 0,
      "duration": 8,
      "inPoint": 0,
      "speed": 1,
      "volume": 1
    }
  ],
  "filters": {
    "brightness": 1.0,
    "contrast": 1.0,
    "saturation": 1.0,
    "fadeIn": 0,
    "fadeOut": 0
  },
  "output": {
    "format": "mp4",
    "resolution": "source",
    "fps": 30
  }
}
```

**返回**：

```json
{ "jobId": "job_abc123", "status": "queued" }
```

### 3. 查询进度

```
GET /job/:jobId
→ 200 {
  "status": "queued" | "running" | "done" | "failed",
  "progress": 0-100,
  "url": "https://你的域名/output/job_abc123.mp4",   // done 时才有
  "message": "错误信息"                                // failed 时才有
}
```

---

## 二、字段说明

### segments[]

| 字段 | 类型 | 说明 |
|---|---|---|
| `assetId` | string | 前端素材 id，仅供后端关联 |
| `name` | string | 素材文件名（给人看的） |
| `source` | string | **素材路径/URL**，后端据此取文件 |
| `timelineStart` | number | 时间轴上的起点（秒） |
| `duration` | number | 片段时长（秒） |
| `inPoint` | number | 源素材入点（秒） |
| `speed` | number | 播放速度，1 = 原速，2 = 两倍速 |
| `volume` | number | 音量倍数，1 = 原样，0 = 静音 |

### filters

| 字段 | 默认 | 说明 |
|---|---|---|
| `brightness` | 1.0 | 亮度，1.0 不变，范围 0.5~1.5 |
| `contrast` | 1.0 | 对比度 |
| `saturation` | 1.0 | 饱和度，0 = 黑白 |
| `fadeIn` | 0 | 淡入秒数 |
| `fadeOut` | 0 | 淡出秒数 |

### output

| 字段 | 可选值 |
|---|---|
| `format` | `mp4` / `webm` / `mov` |
| `resolution` | `source`（不缩放）/ `1080p` / `720p` / `480p` |
| `fps` | 24 / 25 / 30 / 60 |

---

## 三、ffmpeg 参考实现

### 单片段最简命令

```bash
ffmpeg -ss 0 -t 8 -i "assets/片头.mp4" \
  -vf "scale=-2:1080,eq=brightness=0:contrast=1:saturation=1" \
  -c:v libx264 -crf 20 -preset veryfast \
  -c:a aac -b:a 192k \
  output.mp4
```

### 多片段拼接 + 变速

```bash
ffmpeg \
  -ss 0 -t 8 -i "assets/片头.mp4" \
  -ss 2 -t 20 -i "assets/正片.mp4" \
  -filter_complex "
    [0:v]setpts=PTS/1[v0]; [0:a]atempo=1,volume=1[a0];
    [1:v]setpts=PTS/1.2[v1]; [1:a]atempo=1.2,volume=1[a1];
    [v0][a0][v1][a1]concat=n=2:v=1:a=1[vout][aout]
  " \
  -map "[vout]" -map "[aout]" \
  -c:v libx264 -crf 20 -preset veryfast \
  -c:a aac -b:a 192k \
  output.mp4
```

> ⚠️ **`atempo` 只接受 0.5~2.0**。速度超出范围要串联：
> `atempo=2,atempo=2` = 4 倍速。前端已经帮你算好。

### 分辨率缩放

| resolution | 滤镜 |
|---|---|
| `source` | 不缩放 |
| `1080p` | `scale=-2:1080` |
| `720p` | `scale=-2:720` |
| `480p` | `scale=-2:480` |

`-2` 表示宽度按比例自动算，且必须是偶数（否则编码器报错）。

---

## 四、最小 Node.js 实现示例

```js
import express from 'express'
import { execFile } from 'node:child_process'

const app = express()
app.use(express.json())

const jobs = new Map()

app.get('/health', (req, res) => {
  execFile('ffmpeg', ['-version'], (err, stdout) => {
    if (err) return res.status(500).json({ ok: false })
    res.json({ ok: true, ffmpeg: stdout.split(' ')[2] })
  })
})

app.post('/render', (req, res) => {
  const job = req.body
  const jobId = 'job_' + Date.now().toString(36)
  jobs.set(jobId, { status: 'queued', progress: 0 })

  // 异步跑，立刻返回
  res.json({ jobId, status: 'queued' })

  setImmediate(() => runJob(jobId, job))
})

function runJob(jobId, job) {
  jobs.set(jobId, { status: 'running', progress: 0 })

  const args = buildFfmpegArgs(job, `output/${jobId}.mp4`)
  const p = execFile('ffmpeg', args)

  p.stderr.on('data', chunk => {
    const m = /time=(\d+):(\d+):([\d.]+)/.exec(chunk)
    if (m) {
      const sec = (+m[1]) * 3600 + (+m[2]) * 60 + (+m[3])
      const total = job.segments.reduce((s, x) => s + x.duration, 0)
      jobs.set(jobId, { status: 'running', progress: Math.min(99, Math.round(sec / total * 100)) })
    }
  })

  p.on('close', code => {
    if (code === 0) {
      jobs.set(jobId, { status: 'done', progress: 100, url: `/output/${jobId}.mp4` })
    } else {
      jobs.set(jobId, { status: 'failed', message: 'ffmpeg 退出码 ' + code })
    }
  })
}

function buildFfmpegArgs(job, outPath) {
  const args = []
  // 输入
  for (const s of job.segments) {
    args.push('-ss', String(s.inPoint), '-t', String(s.duration), '-i', s.source)
  }
  // 滤镜
  const f = []
  job.segments.forEach((s, i) => {
    f.push(`[${i}:v]setpts=PTS/${s.speed}[v${i}]`)
    f.push(`[${i}:a]${atempo(s.speed)},volume=${s.volume}[a${i}]`)
  })
  const ins = job.segments.map((_, i) => `[v${i}][a${i}]`).join('')
  f.push(`${ins}concat=n=${job.segments.length}:v=1:a=1[vout][aout]`)

  args.push('-filter_complex', f.join(';'))
  args.push('-map', '[vout]', '-map', '[aout]')
  args.push('-c:v', 'libx264', '-crf', '20', '-preset', 'veryfast')
  args.push('-c:a', 'aac', '-b:a', '192k')
  args.push(outPath)
  return args
}

function atempo(speed) {
  if (speed === 1) return 'atempo=1'
  const chain = []
  let s = speed
  while (s > 2) { chain.push(2); s /= 2 }
  while (s < 0.5) { chain.push(0.5); s /= 0.5 }
  chain.push(+s.toFixed(3))
  return chain.map(v => `atempo=${v}`).join(',')
}

app.use('/output', express.static('output'))
app.listen(8080, () => console.log('渲染服务跑在 :8080'))
```

---

## 五、部署要点

### ⚠️ 三条硬规矩

1. **别用你跑其它服务的那台机器** —— 渲染一开 CPU 就满，会把别的服务带崩
2. **用按量付费的云函数** —— 腾讯云 SCF / 阿里云 FC，用完就停，不烧钱
3. **别开公网无鉴权** —— 加一个 `Authorization` 头或 IP 白名单，否则别人能白嫖你的算力

### 云函数 FFmpeg 方案

| 平台 | 做法 |
|---|---|
| 腾讯云 SCF | 用 **Custom Runtime** + 层挂载静态编译的 ffmpeg |
| 阿里云 FC | 用 **Custom Container**，Dockerfile 里 `apk add ffmpeg` |
| Cloudflare | 需 Workers + Container（目前要付费计划） |

### 跨域（CORS）

前端是静态页面，跟你的服务器不同域，**必须加**：

```js
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')   // 或指定你的前端域名
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  if (req.method === 'OPTIONS') return res.sendStatus(204)
  next()
})
```

---

## 六、不部署服务器也能用

**导出 JSON + ffmpeg 命令** 这条路永远可用：

1. 前端点「导出」→ 拿到 JSON 和一条现成的 ffmpeg 命令
2. 把素材放在命令里的 `assets/` 目录
3. 在你自己电脑（或任何有 ffmpeg 的机器）跑那条命令

**这条路上我们完全不参与，也不需要任何服务器。**
