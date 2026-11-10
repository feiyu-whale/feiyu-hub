/* 公司经营模拟 · 供应链与库存引擎  v3.0.0 2026-10-25 肥鱼
 *
 * 现实规则（隐形利润杀手）：
 *  ① 囤货便宜，但占现金 —— 钱压在冷库里，账上就没钱发工资
 *  ② 生鲜每天在烂 —— 不是"卖不掉"，是"放着就在亏"
 *  ③ 库存周转慢 = 现金死在里面；周转太快 = 一断供就停业
 *  ④ 清库存只能打折 —— 毛利率当场塌下去
 *
 *  2020 疫情真实打法的双重打击：
 *    堂食停 → 库存全烂 → 现金还压在货上 → 同时断粮
 *    这才是"撑不下去"的真实死法，不是单纯没客人
 */

/* ═══ 品类库存特性 ═══
 * shelfLife：保质期（天）—— 生鲜最短，冻品最长
 * dailySpoil：每日自然损耗率（卖不掉也在损）
 * stockTarget：常备库存天数（真实餐饮的安全库存）
 */
const INVENTORY_TRAITS = {
  zhengcan: { shelfLife: 3,  dailySpoil: 0.025, stockTarget: 10, name: '生鲜' },
  huoguo:   { shelfLife: 5,  dailySpoil: 0.018, stockTarget: 8,  name: '冻品生鲜' },
  kuaican:  { shelfLife: 7,  dailySpoil: 0.015, stockTarget: 5,  name: '半成品' },
  chayin:   { shelfLife: 2,  dailySpoil: 0.030, stockTarget: 3,  name: '鲜果茶底' },
  shaokao:  { shelfLife: 3,  dailySpoil: 0.028, stockTarget: 7,  name: '生鲜' },
  mianfen:  { shelfLife: 10, dailySpoil: 0.010, stockTarget: 6,  name: '面粉' }
};

function invTrait() {
  return INVENTORY_TRAITS[G.seg] || INVENTORY_TRAITS.zhengcan;
}

/* ═══ 月初：补货决策的影响在引擎里算，这里算损耗 ═══
 * 损耗 = 库存 × 日损耗率 × 30 天（近似，按天推进模式会精确到天）
 */
function spoilMonthly() {
  const t = invTrait();
  const inv = Math.max(0, G.inventory || 0);
  if (inv <= 0) return { spoil: 0, rate: 0 };

  // 损耗受管理能力影响：有总部督导 → 损耗低；没总部店多 → 损耗高
  let mgmtCoef = 1.0;
  if (G.hasHQ) mgmtCoef *= 0.85;
  if (G.hasCompany) mgmtCoef *= 0.9;
  if (!G.hasHQ && G.stores > 8) mgmtCoef *= 1.25;
  // 士气低 → 后厨乱 → 损耗高
  mgmtCoef *= (1 + (70 - G.morale) / 100 * 0.5);
  // 家族塞进来的人（第二批会用到，这里先留口子）
  if (G.hasRelativeManager) mgmtCoef *= 1.5;

  // 月损耗率：日损耗 × 30，但封顶 60%（不会全烂光，能救的还是会救）
  const monthRate = Math.min(0.6, t.dailySpoil * 30 * mgmtCoef);
  const spoil = inv * monthRate;
  G.inventory -= spoil;
  return { spoil, rate: monthRate };
}

/* ═══ 库存周转率 ═══
 * 周转率 = 月耗用成本 / 平均库存
 * 行业参考：餐饮正常 4~8 次/月（生鲜快），低于 3 次 = 货压手
 */
function inventoryTurnover(monthlyCost) {
  const avgInv = Math.max(1, (G.inventory || 0));
  return monthlyCost / avgInv;
}

/* ═══ 库存水位判定 ═══ */
function inventoryStatus(monthlyCost) {
  const t = invTrait();
  const targetInv = monthlyCost / 30 * t.stockTarget;   // 目标库存金额
  const ratio = targetInv > 0 ? (G.inventory || 0) / targetInv : 1;
  let level, text;
  if (ratio < 0.3) {
    level = 'critical';
    text = '库存见底，随时可能断货停业（当前只够 ' + (ratio * t.stockTarget).toFixed(1) + ' 天）';
  } else if (ratio < 0.7) {
    level = 'low';
    text = '库存偏紧，只够 ' + (ratio * t.stockTarget).toFixed(1) + ' 天';
  } else if (ratio > 3) {
    level = 'overstock';
    text = '库存积压严重：' + ((G.inventory || 0) / 1e4).toFixed(1) +
           ' 万压在冷库，周转率偏低，每天都在损耗';
  } else if (ratio > 2) {
    level = 'high';
    text = '库存偏高，' + ((G.inventory || 0) / 1e4).toFixed(1) + ' 万压在货上';
  } else {
    level = 'normal';
    text = '库存正常（约 ' + (ratio * t.stockTarget).toFixed(1) + ' 天用量）';
  }
  return { level, text, ratio, targetInv };
}

/* ═══ 断供判定：库存不够这个月的用量 ═══
 * 真实：断货 = 客人点不到菜 = 直接掉营收 + 掉口碑
 */
function stockoutCheck(needCost) {
  const available = Math.max(0, G.inventory || 0);
  if (available >= needCost) {
    G.inventory -= needCost;
    return { shortage: 0, penalty: 0 };
  }
  const shortageRatio = needCost > 0 ? 1 - available / needCost : 0;
  G.inventory = 0;
  // 断货比例决定客流损失（断一半 = 掉一半生意）
  return {
    shortageRatio,
    revenuePenalty: Math.min(0.7, shortageRatio * 0.9),
    text: '🚫 断货！约 ' + (shortageRatio * 100).toFixed(0) + '% 的菜品无法供应，客流直接流失'
  };
}

/* ═══ 清库存：打折甩卖 ═══
 * 真实：临期库存只能贱卖，毛利率当场塌
 */
function liquidateStock(discountPct) {
  const inv = Math.max(0, G.inventory || 0);
  if (inv <= 0) return { ok: false, msg: '没有库存可清' };
  const discount = Math.min(0.8, Math.max(0.1, discountPct || 0.5));
  const recovered = inv * (1 - discount);
  G.inventory = 0;
  G.cash += recovered;
  G.reputation = Math.max(0, G.reputation - 2);   // 打折甩卖伤品牌
  return {
    ok: true, recovered,
    msg: '清库存：' + (inv / 1e4).toFixed(1) + ' 万的货按 ' +
         ((1 - discount) * 100).toFixed(0) + '% 折甩卖，收回 ' +
         (recovered / 1e4).toFixed(1) + ' 万，亏损 ' + ((inv - recovered) / 1e4).toFixed(1) + ' 万'
  };
}

/* ═══ 补货策略（玩家可调）═══
 *  保守：只备 5 天 → 现金压力小，断供风险高
 *  标准：备 10 天 → 平衡
 *  激进：备 30 天 → 便宜，但现金压死，生鲜烂光
 */
const STOCK_POLICIES = {
  lean:    { id: 'lean',   name: '低库存快周转', days: 5,  cashSafe: 1.0,  riskUp: 0.20 },
  normal:  { id: 'normal', name: '标准备货',     days: 10, cashSafe: 0.7,  riskUp: 0.08 },
  bulk:    { id: 'bulk',   name: '囤货压价',     days: 30, cashSafe: 0.35, riskUp: 0.03 }
};

function currentStockPolicy() {
  return STOCK_POLICIES[G.stockPolicy || 'normal'] || STOCK_POLICIES.normal;
}

/* 囤货折扣：一次买得多，供应商给便宜价，但现金全压进去 */
function bulkDiscount() {
  const pol = currentStockPolicy();
  return pol.id === 'bulk' ? 0.93 : pol.id === 'normal' ? 0.98 : 1.0;
}

if (typeof module !== 'undefined') module.exports = {
  INVENTORY_TRAITS, invTrait, spoilMonthly, inventoryTurnover, inventoryStatus,
  stockoutCheck, liquidateStock, STOCK_POLICIES, currentStockPolicy, bulkDiscount
};
