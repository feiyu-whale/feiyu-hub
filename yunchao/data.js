/* ============================================================
   云巢电竞 · 演示数据层 v1.1.0
   纯前端演示系统：无真实交易、无真实身份、无支付、不可充值
   货币单位：白饭（虚拟积分，不可充值/提现/转让）
   所有游戏名、术语、打手名均为原创虚构，不指向任何真实作品
   作者：肥鱼 2026-10-26
   ============================================================ */

const YC = {
  VERSION: 'v1.1.0-数据扩充 20261026',
  STORE_KEY: 'yunchao_state_v1',

  INIT_BAOFAN: 5000,   // 新人礼包（虚拟，凭空发的）

  /* ---------- 原创游戏宇宙（全部虚构） ---------- */
  GAMES: [
    { id: 'g1', name: '裂域行动', icon: '🎯', genre: '撤离射击', desc: '进入封锁区搜集物资并撤出' },
    { id: 'g2', name: '长空战线', icon: '🪂', genre: '空降竞技', desc: '百人空降，最后存活者胜' },
    { id: 'g3', name: '九域争锋', icon: '⚔️', genre: '团队竞技', desc: '五人对线，推塔破水晶' },
    { id: 'g4', name: '铁幕前线', icon: '🛡️', genre: '战术射击', desc: '小队协同，攻防推进' },
    { id: 'g5', name: '沧海诀', icon: '🌊', genre: '近战格斗', desc: '单挑与双排的刀剑对决' }
  ],

  /* ---------- 服务档位 ---------- */
  TIERS: [
    { id: 't0', name: '体验', color: '#64748b', min: 9,   max: 39 },
    { id: 't1', name: '标准', color: '#38bdf8', min: 49,  max: 99 },
    { id: 't2', name: '精品', color: '#a78bfa', min: 99,  max: 199 },
    { id: 't3', name: '尊享', color: '#fbbf24', min: 199, max: 599 }
  ],

  /* ---------- 打手标签 ---------- */
  TAGS: ['扫场', '护送', '带飞', '耐心', '幽默', '夜猫子', '教学型', '冲段', '稳'],

  /* ---------- 违规规则表（可配置） ---------- */
  RULES: [
    { id: 'r1', name: '打手未带约定礼包',   reward: 10,  penalty: 20,  note: '需录屏举证' },
    { id: 'r2', name: '态度恶劣施压老板',   reward: 100, penalty: 200, note: '重罚，并触发免单' },
    { id: 'r3', name: '进队未做自我介绍',   reward: 10,  penalty: 20,  note: '需录屏举证' },
    { id: 'r4', name: '私自开麦、不沟通',   reward: 50,  penalty: 100, note: '需录屏举证' },
    { id: 'r5', name: '装备配置不达标',     reward: 20,  penalty: 40,  note: '低于订单约定档位' },
    { id: 'r6', name: '故意卡保底不补',     reward: 20,  penalty: 40,  note: '需录屏举证' },
    { id: 'r7', name: '打手主动要求退款',   reward: 0,   penalty: 100, note: '直接补偿老板 50 白饭' },
    { id: 'r8', name: '打手游戏内辱骂',     reward: 50,  penalty: 100, note: '需录屏举证' },
    { id: 'r9', name: '超时未接单',         reward: 0,   penalty: 30,  note: '系统自动判定' },
    { id: 'r10', name: '中途私自换人',      reward: 30,  penalty: 60,  note: '需录屏举证' },
    { id: 'r11', name: '诱导线下交易',      reward: 80,  penalty: 160, note: '严重违规，直接冻结接单' },
    { id: 'r12', name: '虚假承诺完成度',    reward: 40,  penalty: 80,  note: '需录屏举证' }
  ],

  /* ---------- 打手库（原创名） ---------- */
  WORKERS: [
    { id: 'w1', name: '夜航鲸',   avatar: '🐋', rank: 'S', score: 98, orders: 1284, price: 99,
      games: ['g1', 'g2'], tags: ['扫场', '护送', '夜猫子'], intro: '深夜档，稳，擅长高风险区域扫场护送。',
      online: true, deposit: 500, goodRate: 99.2 },
    { id: 'w2', name: '铁壳猫',   avatar: '🐱', rank: 'A', score: 92, orders: 861, price: 79,
      games: ['g2', 'g3'], tags: ['带飞', '幽默'], intro: '话多但靠谱，气氛组，适合怕冷场的老板。',
      online: true, deposit: 300, goodRate: 97.5 },
    { id: 'w3', name: '沉默的石头', avatar: '🪨', rank: 'A', score: 90, orders: 742, price: 69,
      games: ['g1', 'g4'], tags: ['扫场', '耐心', '稳'], intro: '话少，只干活，全程安静高效。',
      online: false, deposit: 300, goodRate: 98.1 },
    { id: 'w4', name: '潮汐',     avatar: '🌊', rank: 'S', score: 96, orders: 1035, price: 109,
      games: ['g3', 'g5'], tags: ['教学型', '冲段'], intro: '会讲思路，适合想学东西的老板。',
      online: true, deposit: 500, goodRate: 98.8 },
    { id: 'w5', name: '小饭团',   avatar: '🍙', rank: 'B', score: 83, orders: 412, price: 49,
      games: ['g2', 'g3'], tags: ['幽默', '夜猫子'], intro: '便宜，能聊，别指望神级操作。',
      online: true, deposit: 100, goodRate: 94.3 },
    { id: 'w6', name: '老钟',     avatar: '⏰', rank: 'A', score: 91, orders: 958, price: 89,
      games: ['g1', 'g4'], tags: ['扫场', '耐心', '教学型'], intro: '时间观念强，从不超时，守时第一。',
      online: true, deposit: 300, goodRate: 98.6 },
    { id: 'w7', name: '零度',     avatar: '❄️', rank: 'S', score: 97, orders: 1420, price: 199,
      games: ['g1', 'g4', 'g5'], tags: ['扫场', '冲段', '稳'], intro: '头部打手，高难度单首选，价格偏高。',
      online: true, deposit: 800, goodRate: 99.5 },
    { id: 'w8', name: '野渡',     avatar: '⛵', rank: 'B', score: 85, orders: 386, price: 59,
      games: ['g2', 'g5'], tags: ['带飞', '幽默'], intro: '新人，价格实在，态度好。',
      online: true, deposit: 100, goodRate: 95.1 },
    { id: 'w9', name: '铁砧',     avatar: '⚒️', rank: 'A', score: 93, orders: 1102, price: 129,
      games: ['g4'], tags: ['护送', '稳', '耐心'], intro: '专精战术射击，擅长带队推进。',
      online: false, deposit: 400, goodRate: 98.3 },
    { id: 'w10', name: '青灯',    avatar: '🏮', rank: 'A', score: 89, orders: 674, price: 79,
      games: ['g3', 'g5'], tags: ['教学型', '夜猫子'], intro: '夜场教学，讲得细，适合新手。',
      online: true, deposit: 300, goodRate: 96.9 }
  ],

  /* ---------- 服务单（30+，按原创游戏分） ---------- */
  SERVICES: [
    /* 裂域行动 */
    { id: 's01', gid: 'g1', tier: 't1', title: '扫场三连（含携出）', sub: '连扫三场并携出物资', price: 99,  sold: 4948, hot: true,
      dur: '约 90 分钟', desc: '按约定完成三场扫场，全程护送并携出指定物资。' },
    { id: 's02', gid: 'g1', tier: 't2', title: '高价值区护送',       sub: '危险区进出',       price: 149, sold: 2310, hot: true,
      dur: '约 60 分钟', desc: '进入高风险区域搜集，护送撤出，掉单按规则补。' },
    { id: 's03', gid: 'g1', tier: 't0', title: '新手体验单',         sub: '9.9 试一场',       price: 9,   sold: 8620, hot: true,
      dur: '约 30 分钟', desc: '新手专享，带一局熟悉地图与基本流程。' },
    { id: 's04', gid: 'g1', tier: 't3', title: '整晚通宵扫场',       sub: '8 小时',           price: 299, sold: 431,  hot: false,
      dur: '8 小时', desc: '通宵连扫，中途休息需双方约定。' },
    { id: 's05', gid: 'g1', tier: 't2', title: '指定物资携出',       sub: '按件计',           price: 129, sold: 1876, hot: false,
      dur: '约 50 分钟', desc: '指定物资带出，未完成按保底规则补单。' },
    { id: 's06', gid: 'g1', tier: 't1', title: '保底额度单',         sub: '打满即止',         price: 89,  sold: 3204, hot: false,
      dur: '约 70 分钟', desc: '约定额度打满为止，卡保底必补。' },

    /* 长空战线 */
    { id: 's07', gid: 'g2', tier: 't1', title: '连返三场',           sub: '连撤三局',         price: 99,  sold: 3120, hot: true,
      dur: '约 80 分钟', desc: '连续成功撤离三局，中途掉线不计。' },
    { id: 's08', gid: 'g2', tier: 't2', title: '冲段陪打（一段）',   sub: '打满一个阶位',     price: 159, sold: 1642, hot: true,
      dur: '约 2 小时', desc: '陪你从当前阶位冲到下一阶，未达成免费续时。' },
    { id: 's09', gid: 'g2', tier: 't0', title: '体验局（一局）',     sub: '9.9 一局',         price: 9,   sold: 7530, hot: true,
      dur: '约 25 分钟', desc: '一局体验，带飞不保证名次，重在感受。' },
    { id: 's10', gid: 'g2', tier: 't2', title: '四人包场',           sub: '一拖三',           price: 179, sold: 892,  hot: false,
      dur: '约 90 分钟', desc: '一人带三位老板，同价，适合朋友一起。' },
    { id: 's11', gid: 'g2', tier: 't3', title: '深夜带飞 2 小时',    sub: '凌晨档',           price: 219, sold: 367,  hot: false,
      dur: '2 小时', desc: '凌晨时段专属，需提前预约。' },
    { id: 's12', gid: 'g2', tier: 't1', title: '阶位保级陪打',       sub: '防掉段',           price: 89,  sold: 2104, hot: false,
      dur: '约 70 分钟', desc: '专为保级设计，掉段赔付白饭。' },

    /* 九域争锋 */
    { id: 's13', gid: 'g3', tier: 't2', title: '五排包场（一晚）',   sub: '固定队',           price: 189, sold: 1286, hot: true,
      dur: '约 2 小时', desc: '固定五人车队全程陪打，配合默契。' },
    { id: 's14', gid: 'g3', tier: 't1', title: '游走位带飞',         sub: '单局',             price: 69,  sold: 3410, hot: false,
      dur: '约 30 分钟', desc: '专精游走位，负责抓线与节奏带动。' },
    { id: 's15', gid: 'g3', tier: 't2', title: '教学复盘（一局）',   sub: '打完讲思路',       price: 119, sold: 976,  hot: false,
      dur: '约 50 分钟', desc: '打完一局后逐段复盘，讲清每个决策。' },
    { id: 's16', gid: 'g3', tier: 't3', title: '高阶位陪打',         sub: '高分段',           price: 259, sold: 421,  hot: false,
      dur: '约 2 小时', desc: '仅限高阶局，打手需对应段位认证。' },
    { id: 's17', gid: 'g3', tier: 't0', title: '新手教学 1 小时',    sub: '零基础上手',       price: 39,  sold: 2860, hot: false,
      dur: '1 小时', desc: '从补刀、走位到基础连招，手把手教。' },
    { id: 's18', gid: 'g3', tier: 't1', title: '双人组队包场',       sub: '两人同行',         price: 99,  sold: 1567, hot: false,
      dur: '约 90 分钟', desc: '可带一位朋友同行，同价不加。' },

    /* 铁幕前线 */
    { id: 's19', gid: 'g4', tier: 't2', title: '任务代跑全套',       sub: '按章节',           price: 169, sold: 1105, hot: true,
      dur: '约 2 小时', desc: '按约定章节完成全部任务推进，卡关赔付。' },
    { id: 's20', gid: 'g4', tier: 't1', title: '钥匙房带刷',         sub: '按次',             price: 99,  sold: 1832, hot: false,
      dur: '约 60 分钟', desc: '带刷指定房间，出货归老板。' },
    { id: 's21', gid: 'g4', tier: 't2', title: '战术小队护航',       sub: '四人小队',         price: 159, sold: 743,  hot: false,
      dur: '约 90 分钟', desc: '四人小队协同推进，含指挥。' },
    { id: 's22', gid: 'g4', tier: 't0', title: '试炼一局',           sub: '感受节奏',         price: 19,  sold: 4210, hot: false,
      dur: '约 30 分钟', desc: '一局试炼，体验战术配合节奏。' },
    { id: 's23', gid: 'g4', tier: 't3', title: '全天护航（6h）',     sub: '长时间',           price: 399, sold: 218,  hot: false,
      dur: '6 小时', desc: '全天候护航，中途休息累计不超过 40 分钟。' },

    /* 沧海诀 */
    { id: 's24', gid: 'g5', tier: 't1', title: '单挑陪练（10 局）',  sub: '一对一',           price: 79,  sold: 2245, hot: true,
      dur: '约 60 分钟', desc: '十局单挑陪练，边打边讲破招。' },
    { id: 's25', gid: 'g5', tier: 't2', title: '见切教学',           sub: '手法专精',         price: 139, sold: 867,  hot: false,
      dur: '约 70 分钟', desc: '专攻招架与反制，慢动作拆解。' },
    { id: 's26', gid: 'g5', tier: 't1', title: '双排带飞',           sub: '组队',             price: 99,  sold: 1298, hot: false,
      dur: '约 80 分钟', desc: '双排全程配合，保你活到最后。' },
    { id: 's27', gid: 'g5', tier: 't3', title: '高手对练（S 级）',   sub: '头部打手',         price: 249, sold: 156,  hot: false,
      dur: '约 90 分钟', desc: '仅 S 级打手可接，对练强度高。' },
    { id: 's28', gid: 'g5', tier: 't0', title: '入门体验课',         sub: '基础操作',         price: 29,  sold: 3018, hot: false,
      dur: '约 40 分钟', desc: '从基础架势、格挡到第一次连段。' },

    /* 通用增值 */
    { id: 's29', gid: null, tier: 't0', title: '语音陪聊（1 小时）', sub: '纯聊天不下场',     price: 29,  sold: 5120, hot: false,
      dur: '1 小时', desc: '纯语音陪伴聊天，不参与对局。' },
    { id: 's30', gid: null, tier: 't1', title: '观影陪看（2 小时）', sub: '边看边聊',         price: 59,  sold: 1876, hot: false,
      dur: '2 小时', desc: '一起看电影/赛事直播，边看边聊。' },
    { id: 's31', gid: null, tier: 't2', title: '指定打手加急',       sub: '不随机分配',       price: 129, sold: 964,  hot: false,
      dur: '按单', desc: '指定某位打手，不参与随机匹配，加急优先。' },
    { id: 's32', gid: null, tier: 't1', title: '包退保底单',         sub: '未达标免费重打',   price: 99,  sold: 2380, hot: true,
      dur: '按单', desc: '约定目标未达成，免费重打一次，不限次数直到达标。' }
  ],

  /* ---------- 增值服务项（可叠加） ---------- */
  ADDONS: [
    { id: 'a1', name: '加急优先', price: 20,  note: '指定时间上门，加价 20%' },
    { id: 'a2', name: '指定打手', price: 15,  note: '不随机分配，加价 15%' },
    { id: 'a3', name: '双人同行', price: 50,  note: '可带一位朋友，加价 50%' },
    { id: 'a4', name: '包退保底', price: 20,  note: '未达标免费重打' }
  ],

  /* ---------- 限时活动 ---------- */
  PROMOS: [
    { id: 'p1', name: '首单立减',   desc: '新用户首单减 20 白饭',       off: 20, kind: 'first' },
    { id: 'p2', name: '深夜折扣',   desc: '00:00-06:00 下单九折',       off: 10, kind: 'night' },
    { id: 'p3', name: '满 200 减 30', desc: '单笔满 200 白饭减 30',     off: 30, kind: 'full200' }
  ],

  /* ---------- 分类 ---------- */
  CATEGORIES: ['全部', '热销', '体验', '标准', '精品', '尊享', '陪聊']
};

/* ============================================================
   状态管理
   ============================================================ */

const YCStore = {
  load() {
    try {
      const raw = localStorage.getItem(YC.STORE_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        // 迁移保护：老数据缺字段时补齐
        return Object.assign(this.fresh(), s);
      }
    } catch (e) { /* 损坏则重建 */ }
    return this.fresh();
  },

  fresh() {
    return {
      role: 'boss',
      baofan: YC.INIT_BAOFAN,
      workerId: 'w1',
      workerCredit: {},
      orders: [],
      reports: [],
      reviews: {},
      seq: 1000,
      firstOrderUsed: false
    };
  },

  save(state) {
    try { localStorage.setItem(YC.STORE_KEY, JSON.stringify(state)); }
    catch (e) { console.warn('保存失败', e); }
  },

  reset() {
    localStorage.removeItem(YC.STORE_KEY);
    return this.fresh();
  }
};

/* ============================================================
   订单状态机
   ============================================================ */

const YCStatus = {
  PENDING:   'pending',
  ACCEPTED:  'accepted',
  RUNNING:   'running',
  DELIVERED: 'delivered',
  DONE:      'done',
  CANCELLED: 'cancelled',
  DISPUTED:  'disputed',

  LABEL: {
    pending:   '待接单',
    accepted:  '已接单',
    running:   '进行中',
    delivered: '待确认',
    done:      '已完成',
    cancelled: '已取消',
    disputed:  '争议中'
  },

  COLOR: {
    pending:   '#fbbf24',
    accepted:  '#38bdf8',
    running:   '#22d3ee',
    delivered: '#a78bfa',
    done:      '#4ade80',
    cancelled: '#64748b',
    disputed:  '#f87171'
  },

  TRANSITIONS: {
    pending:   ['accepted', 'cancelled'],
    accepted:  ['running', 'cancelled'],
    running:   ['delivered', 'disputed'],
    delivered: ['done', 'disputed'],
    disputed:  ['done', 'cancelled'],
    done:      [],
    cancelled: []
  },

  can(from, to) {
    return (this.TRANSITIONS[from] || []).includes(to);
  },

  apply(state, orderId, to, extra) {
    const order = state.orders.find(o => o.id === orderId);
    if (!order) return { ok: false, msg: '订单不存在' };
    if (!this.can(order.status, to)) {
      return { ok: false, msg: `不能从「${this.LABEL[order.status]}」直接变成「${this.LABEL[to]}」` };
    }
    order.status = to;
    order.history = order.history || [];
    order.history.push({ to, at: Date.now() });
    if (extra) Object.assign(order, extra);
    return { ok: true, msg: '已更新' };
  }
};

/* ============================================================
   工具
   ============================================================ */

const YCUtil = {
  money(n) { return `${Number(n).toLocaleString('zh-CN')} 白饭`; },

  nextId(state) {
    state.seq = (state.seq || 1000) + 1;
    return 'NO' + state.seq;
  },

  time(ts) {
    const d = new Date(ts);
    const p = n => String(n).padStart(2, '0');
    return `${d.getMonth() + 1}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
  },

  creditOf(state, workerId) {
    const w = YC.WORKERS.find(x => x.id === workerId);
    if (!w) return 0;
    const ded = (state.workerCredit[workerId] || 0);
    return Math.max(0, w.score - ded);
  },

  gameName(gid) {
    const g = YC.GAMES.find(x => x.id === gid);
    return g ? g.name : '通用';
  },

  gameIcon(gid) {
    const g = YC.GAMES.find(x => x.id === gid);
    return g ? g.icon : '🎁';
  },

  tierOf(tid) {
    return YC.TIERS.find(t => t.id === tid) || { name: '标准', color: '#38bdf8' };
  },

  /* 计算最终价格（含增值项与活动） */
  calcPrice(base, addonIds, state) {
    let total = base;
    (addonIds || []).forEach(aid => {
      const a = YC.ADDONS.find(x => x.id === aid);
      if (!a) return;
      if (a.id === 'a1') total = Math.round(total * 1.2);
      else if (a.id === 'a2') total = Math.round(total * 1.15);
      else if (a.id === 'a3') total = Math.round(total * 1.5);
      else total += a.price;
    });
    // 首单立减
    if (state && !state.firstOrderUsed) total = Math.max(1, total - 20);
    return total;
  },

  /* 平均评分 */
  avgOfReviews(state, workerId) {
    const rs = (state.reviews[workerId] || []);
    if (!rs.length) return null;
    return (rs.reduce((a, b) => a + b, 0) / rs.length).toFixed(1);
  }
};

window.YC = YC;
window.YCStore = YCStore;
window.YCStatus = YCStatus;
window.YCUtil = YCUtil;
