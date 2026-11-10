/* 公司经营模拟 · 渠道与供应链风险  v3.0.0 2026-10-25 肥鱼
 *
 * 现实逻辑：
 *  ① 客户集中度是催命符 —— 一个大客户占你四成生意，他说走就走
 *  ② 外卖平台抽成不是固定的，是"不知不觉往上爬"的
 *  ③ 平台限流 = 一夜之间客流归零，你没有申诉的地方
 *  ④ 只签一家供应商 = 便宜，但也把命交到别人手上
 */

/* ═══ 客户集中度 ═══ */
function customerConcentration() {
  return G.bigCustomer ? G.bigCustomer.share : 0;
}

/* 建大客户（玩家可以主动去谈，也会有事件送上门） */
function acquireBigCustomer(sharePct) {
  const share = Math.min(0.5, sharePct || 0.3);
  G.bigCustomer = {
    name: '某团购平台',
    share,                 // 占总营收比例
    monthsWith: 0,
    patience: 100
  };
  return { ok: true, msg: '签下大客户：占营收 ' + (share * 100).toFixed(0) + '%，' +
    '生意稳了，但命攥在人家手里' };
}

/* 每月检查：份额越高越容易跑 */
function bigCustomerMonthly() {
  const bc = G.bigCustomer;
  if (!bc) return null;
  bc.monthsWith++;

  let risk = 0;
  if (bc.share >= 0.4) risk = 0.01;        // 超 40% → 每月 1% 概率换供应商
  else if (bc.share >= 0.25) risk = 0.004;

  // 你涨价 / 口碑差 / 出事 → 风险翻倍
  if (G.reputation < 50) risk *= 2;
  if (G.seriousIncident) risk *= 2;

  if (Math.random() < risk) {
    const lost = bc.share;
    G.bigCustomer = null;
    return {
      type: 'customer_lost',
      text: '📉💔 「' + bc.name + '」换了供应商。' +
            '他们占你 ' + (lost * 100).toFixed(0) + '% 的营收，' +
            '这个月之后，这部分生意直接归零',
      revenueCut: lost
    };
  }
  return null;
}

/* ═══ 外卖平台抽成（暗调）═══ */
function platformCommission() {
  // 起步 18%，随着你在平台上的依赖度上升，它会悄悄爬
  if (G.platformRate === undefined) G.platformRate = 0.18;
  // 每月有概率涨 0.5%，玩家很难察觉
  if (Math.random() < 0.12) {
    G.platformRate = Math.min(0.32, G.platformRate + 0.005);
  }
  return G.platformRate;
}

/* 平台限流：客流 -80%，持续 2 个月 */
function platformThrottleCheck() {
  // 依赖外卖越深，越容易被拿捏
  const p = P();
  const deliveryDepend = 1 - (p.dineInRatio || 0.7);
  if (deliveryDepend < 0.3) return null;
  if (Math.random() > 0.015 * deliveryDepend * 2) return null;
  return {
    type: 'throttle',
    text: '🚫 外卖平台把你「限流」了：搜索排名掉到后面，' +
          '外卖单量直接腰斩。理由？没人会告诉你',
    revenuePenalty: 0.8,
    months: 2
  };
}

/* ═══ 供应商集中度 ═══ */
function supplierSetup() {
  if (G.supplierMode) return G.supplierMode;
  G.supplierMode = 'single';   // single（便宜）/ multi（贵但稳）
  return G.supplierMode;
}

/* 换供应商策略 */
function setSupplierMode(mode) {
  G.supplierMode = mode;
  if (mode === 'multi') {
    return { ok: true, msg: '改成多家供应商：进货价贵 4%，但不会被人卡脖子' };
  }
  return { ok: true, msg: '只签一家供应商：进货便宜 5%，但命在人家手上' };
}

/* 供应商价格系数 */
function supplierPriceCoef() {
  return G.supplierMode === 'multi' ? 1.04 : 0.95;
}

/* 断供检查：只签一家 → 5% 概率断供 */
function supplyBreakCheck() {
  if (G.supplierMode === 'multi') return null;
  if (Math.random() > 0.05) return null;
  return {
    type: 'supply_break',
    text: '🚚💥 唯一供应商突然断供（老板跑路/被查/涨价谈崩），' +
          '你一夜之间没货可卖',
    revenuePenalty: 0.6,
    months: 2
  };
}

/* ═══ 黑天鹅（真实事件）═══ */
const BLACK_SWANS = [
  {
    id: 'pork_price',
    name: '猪肉暴涨',
    cond: g => g.seg !== 'chayin',
    text: '🥩 非洲猪瘟失控，猪肉价格一年翻倍。你是做肉的，成本直接顶到天花板',
    foodCostDelta: 0.12,
    months: 12
  },
  {
    id: 'cold_chain',
    name: '冷链停电',
    cond: g => (g.inventory || 0) > 0,
    text: '❄️⚡ 冷库半夜跳闸，到早上才发现，一库食材全臭了',
    inventoryLoss: 1.0
  },
  {
    id: 'pandemic',
    name: '疫情停摆',
    cond: () => true,
    text: '🦠 全市餐饮禁止堂食，只能做外卖',
    revenuePenalty: 0.75,
    months: 3
  }
];

function blackSwanCheck(monthAbs) {
  // 真实年份触发：2019 猪肉、2020 疫情
  const y = Math.floor((monthAbs - 1) / 12) + G.startYear;
  const m = ((monthAbs - 1) % 12) + 1;
  // 2019-08 猪肉
  if (y === 2019 && m === 8 && G.seg !== 'chayin') {
    return BLACK_SWANS.find(b => b.id === 'pork_price');
  }
  // 2020-01 / 2020-02 疫情
  if (y === 2020 && (m === 1 || m === 2) && !G.pandemicHit) {
    G.pandemicHit = true;
    return BLACK_SWANS.find(b => b.id === 'pandemic');
  }
  // 冷链断电：随机 0.8%/月（有库存才可能）
  if ((G.inventory || 0) > 0 && Math.random() < 0.008) {
    return BLACK_SWANS.find(b => b.id === 'cold_chain');
  }
  return null;
}

if (typeof module !== 'undefined') module.exports = {
  customerConcentration, acquireBigCustomer, bigCustomerMonthly,
  platformCommission, platformThrottleCheck,
  supplierSetup, setSupplierMode, supplierPriceCoef, supplyBreakCheck,
  BLACK_SWANS, blackSwanCheck
};
