/* ============================================================
   积木工坊 · 接口积木库 v1.2.0
   ------------------------------------------------------------
   一堆「开箱即用」的接口块：验证码、上传、支付、地图……
   全部默认走「模拟模式」——纯前端能跑、不花一分钱、不碰真接口。
   用户填了真接口地址 + 密钥，自动切成「真调用」。
   ============================================================ */

/* 接口分类 */
const BF_API_CATS = {
  auth:    '账号验证',
  media:   '文件图片',
  pay:     '支付交易',
  notify:  '消息通知',
  map:     '地图位置',
  query:   '数据查询',
  ai:      '智能能力',
  infra:   '基础设施'
};

/* 统一的接口块生成器，省得一个个手写 */
function bfApi(def) {
  return Object.assign({
    cat: 'api',
    inputs: [{ key: 'in', name: '触发', type: 'any' }],
    outputs: [{ key: 'out', name: '结果', type: 'any' }],
    mock: true,
    fields: [
      { key: 'endpoint', name: '接口地址', type: 'text', def: '' },
      { key: 'key', name: '密钥', type: 'text', def: '' }
    ]
  }, def, {
    fields: (def.fields || []).concat([
      { key: 'endpoint', name: '接口地址', type: 'text', def: def.endpoint || '' },
      { key: 'key', name: '密钥', type: 'text', def: '' }
    ])
  });
}

const BF_API_BLOCKS = [

  /* ---------- 账号验证 ---------- */
  bfApi({
    id: 'api.sms',
    sub: 'auth',
    name: '短信验证码',
    icon: '✆',
    desc: '发验证码、校验验证码。默认模拟，填了地址就走真通道。',
    fields: [
      { key: 'len', name: '位数', type: 'number', def: 6 },
      { key: 'ttl', name: '有效期(秒)', type: 'number', def: 300 },
      { key: 'channel', name: '通道', type: 'select', def: '模拟', options: ['模拟', '阿里云', '腾讯云', '自建'] }
    ]
  }),
  bfApi({
    id: 'api.email',
    sub: 'auth',
    name: '邮箱验证码',
    icon: '✉',
    desc: '发邮件验证码，同样支持模拟。',
    fields: [
      { key: 'len', name: '位数', type: 'number', def: 6 },
      { key: 'ttl', name: '有效期(秒)', type: 'number', def: 600 }
    ]
  }),
  bfApi({
    id: 'api.captcha',
    sub: 'auth',
    name: '图形验证码',
    icon: '▩',
    desc: '防机器人的滑动/字母验证码，纯前端生成。',
    fields: [
      { key: 'type', name: '类型', type: 'select', def: '字母数字', options: ['字母数字', '滑动拼图', '点选文字'] }
    ]
  }),
  bfApi({
    id: 'api.login',
    sub: 'auth',
    name: '登录/注册',
    icon: '⚿',
    desc: '账号密码登录，带本地会话。',
    fields: [
      { key: 'mode', name: '模式', type: 'select', def: '登录+注册', options: ['仅登录', '登录+注册', '仅注册'] },
      { key: 'remember', name: '记住登录', type: 'bool', def: true }
    ]
  }),
  bfApi({
    id: 'api.oauth',
    sub: 'auth',
    name: '第三方登录',
    icon: '⚭',
    desc: '微信/QQ/支付宝一键登录（模拟占位）。',
    fields: [
      { key: 'providers', name: '平台', type: 'text', def: '微信,QQ' }
    ]
  }),
  bfApi({
    id: 'api.realname',
    sub: 'auth',
    name: '实名认证',
    icon: '⌾',
    desc: '身份证二要素核验（模拟）。',
    fields: [
      { key: 'level', name: '级别', type: 'select', def: '二要素', options: ['二要素', '三要素', '人像比对'] }
    ]
  }),

  /* ---------- 文件图片 ---------- */
  bfApi({
    id: 'api.upload',
    sub: 'media',
    name: '文件上传',
    icon: '⇧',
    desc: '选文件、预览、存本地（模拟），或传到你自己的地址。',
    fields: [
      { key: 'accept', name: '允许类型', type: 'text', def: 'image/*,.pdf' },
      { key: 'maxmb', name: '大小上限(MB)', type: 'number', def: 10 },
      { key: 'multiple', name: '多选', type: 'bool', def: false }
    ]
  }),
  bfApi({
    id: 'api.image',
    sub: 'media',
    name: '图片处理',
    icon: '▣',
    desc: '压缩、裁剪、转格式，浏览器本地做，不传服务器。',
    fields: [
      { key: 'op', name: '操作', type: 'select', def: '压缩', options: ['压缩', '裁剪', '转格式'] },
      { key: 'quality', name: '质量(0-1)', type: 'number', def: 0.8 }
    ]
  }),
  bfApi({
    id: 'api.ocr',
    sub: 'media',
    name: '文字识别',
    icon: '⌸',
    desc: '图片转文字（模拟返回示例）。',
    fields: [
      { key: 'lang', name: '语言', type: 'select', def: '中文', options: ['中文', '英文', '中英混合'] }
    ]
  }),

  /* ---------- 支付交易 ---------- */
  bfApi({
    id: 'api.pay',
    sub: 'pay',
    name: '支付下单',
    icon: '¥',
    desc: '拉起收银台（模拟，不涉及真钱）。',
    fields: [
      { key: 'methods', name: '支付方式', type: 'text', def: '余额,微信,支付宝' },
      { key: 'currency', name: '币种', type: 'text', def: '虚拟点' }
    ]
  }),
  bfApi({
    id: 'api.refund',
    sub: 'pay',
    name: '退款',
    icon: '↩',
    desc: '按订单退款（模拟）。',
    fields: [
      { key: 'reason', name: '需填原因', type: 'bool', def: true }
    ]
  }),
  bfApi({
    id: 'api.order',
    sub: 'pay',
    name: '订单查询',
    icon: '⊞',
    desc: '按单号或状态查订单。',
    fields: [
      { key: 'by', name: '查询方式', type: 'select', def: '单号', options: ['单号', '状态', '时间范围'] }
    ]
  }),
  bfApi({
    id: 'api.coupon',
    sub: 'pay',
    name: '优惠券',
    icon: '◎',
    desc: '发券、验券、核销。',
    fields: [
      { key: 'kind', name: '类型', type: 'select', def: '满减', options: ['满减', '折扣', '立减'] }
    ]
  }),

  /* ---------- 消息通知 ---------- */
  bfApi({
    id: 'api.push',
    sub: 'notify',
    name: '站内消息',
    icon: '◔',
    desc: '给用户发站内通知，带已读未读。',
    fields: [
      { key: 'keep', name: '保留天数', type: 'number', def: 30 }
    ]
  }),
  bfApi({
    id: 'api.notify',
    sub: 'notify',
    name: '多渠道通知',
    icon: '◑',
    desc: '短信/邮件/微信模板消息任选（模拟）。',
    fields: [
      { key: 'channels', name: '渠道', type: 'text', def: '短信,邮件' }
    ]
  }),

  /* ---------- 地图位置 ---------- */
  bfApi({
    id: 'api.map',
    sub: 'map',
    name: '地图选点',
    icon: '⌖',
    desc: '在地图上选位置、拿经纬度（模拟，不加载真地图）。',
    fields: [
      { key: 'city', name: '默认城市', type: 'text', def: '杭州' }
    ]
  }),
  bfApi({
    id: 'api.geo',
    sub: 'map',
    name: '距离计算',
    icon: '⇹',
    desc: '两点算直线距离，可选按公里/米。',
    fields: [
      { key: 'unit', name: '单位', type: 'select', def: '公里', options: ['公里', '米'] }
    ]
  }),

  /* ---------- 数据查询 ---------- */
  bfApi({
    id: 'api.search',
    sub: 'query',
    name: '搜索',
    icon: '⌕',
    desc: '关键字搜索 + 高亮 + 分页。',
    fields: [
      { key: 'fields', name: '搜索字段', type: 'text', def: 'name,desc' },
      { key: 'page', name: '每页条数', type: 'number', def: 20 }
    ]
  }),
  bfApi({
    id: 'api.filter',
    sub: 'query',
    name: '筛选排序',
    icon: '⋮',
    desc: '多条件筛选 + 排序，接在列表前面。',
    fields: [
      { key: 'sortby', name: '默认排序', type: 'text', def: 'id desc' }
    ]
  }),
  bfApi({
    id: 'api.page',
    sub: 'query',
    name: '分页',
    icon: '⋯',
    desc: '把长列表切成页。',
    fields: [
      { key: 'size', name: '每页', type: 'number', def: 10 }
    ]
  }),
  bfApi({
    id: 'api.export',
    sub: 'query',
    name: '数据导出',
    icon: '⤓',
    desc: '导出 CSV / JSON，浏览器直接下载。',
    fields: [
      { key: 'format', name: '格式', type: 'select', def: 'CSV', options: ['CSV', 'JSON', 'Excel(xls)'] }
    ]
  }),

  /* ---------- 智能能力 ---------- */
  bfApi({
    id: 'api.ai',
    sub: 'ai',
    name: 'AI 对话',
    icon: '✧',
    desc: '接大模型对话。填了地址密钥走真的，否则模拟回复。',
    fields: [
      { key: 'model', name: '模型', type: 'text', def: 'deepseek-chat' },
      { key: 'sys', name: '人设', type: 'text', def: '你是个有用的助手' }
    ]
  }),
  bfApi({
    id: 'api.voice',
    sub: 'ai',
    name: '语音朗读',
    icon: '♪',
    desc: '浏览器自带语音合成，免费不掉线。',
    fields: [
      { key: 'rate', name: '语速', type: 'number', def: 1 },
      { key: 'pitch', name: '音调', type: 'number', def: 1 }
    ]
  }),
  bfApi({
    id: 'api.translate',
    sub: 'ai',
    name: '翻译',
    icon: '⇄',
    desc: '中英互译（模拟返回示例）。',
    fields: [
      { key: 'to', name: '目标语言', type: 'select', def: '英文', options: ['英文', '中文', '日文'] }
    ]
  }),

  /* ---------- 基础设施 ---------- */
  bfApi({
    id: 'api.storage',
    sub: 'infra',
    name: '本地存储',
    icon: '▥',
    desc: '读写浏览器存储，带容量提示。',
    fields: [
      { key: 'scope', name: '范围', type: 'select', def: '本项目', options: ['本项目', '全局'] }
    ]
  }),
  bfApi({
    id: 'api.cache',
    sub: 'infra',
    name: '接口缓存',
    icon: '⧗',
    desc: '同样的请求短时间内不重复发。',
    fields: [
      { key: 'ttl', name: '缓存秒数', type: 'number', def: 60 }
    ]
  }),
  bfApi({
    id: 'api.log',
    sub: 'infra',
    name: '操作日志',
    icon: '☰',
    desc: '记录谁在什么时候干了什么。',
    fields: [
      { key: 'keep', name: '保留条数', type: 'number', def: 200 }
    ]
  }),
  bfApi({
    id: 'api.webhook',
    sub: 'infra',
    name: 'Webhook',
    icon: '⇥',
    desc: '把数据 POST 到你指定的地址（需自己填）。',
    fields: [
      { key: 'method', name: '方法', type: 'select', def: 'POST', options: ['POST', 'GET', 'PUT'] }
    ]
  })
];
