/* 公司经营模拟 · 团购定价  v3.3.0 2026-10-31 肥鱼
 *
 * 老爹原话：「一份成本 80 块的火锅，你给团购价 79 块，客流直接变原来的 11 倍」
 * 老爹补：「现实里这么低的价格真的会把店撑爆」
 *
 * 设计逻辑：
 *   ① 价格比 = 团购价 / 单位成本
 *   ② 价格 ≥1.3 倍成本 → 客流正常
 *      1.0~1.3 → 线性上扬（便宜有人来）
 *      ≤1.0   → 客流 ×11（跌破成本，疯抢）
 *   ③ 但店里接不住：超接待力部分直接流失 + 扣口碑
 *   ④ 亏本卖 = 卖得越多亏得越多，靠烧钱冲量，钱烧完就完
 */

/* 接待力上限：超过这个倍数就是排队排到街上，后面的客人白流失 */
const CAPACITY_MULT = 1.3;

/* 各品类的真实客单价（元/单），用于反推单量
 * 数据依据：正餐 60、火锅 90、快餐 20、茶饮 15（2024 年行业常见区间）
 */
const AOV_BY_SEG = { zhengcan: 60, huoguo: 90, kuaican: 20, chayin: 15 };

/* 价格档位（玩家可选的预设，也能自己输入具体价格） */
const PRICE_MODES = {
  cheap:  { id: 'cheap',  name: '低价冲量', desc: '比成本略高，客流上来，毛利薄', priceRatio: 1.15 },
  normal: { id: 'normal', name: '标准定价', desc: '行业正常水平',               priceRatio: 1.60 },
  premium:{ id: 'premium',name: '高端定价', desc: '客单价高，客流少',           priceRatio: 2.10 },
  burn:   { id: 'burn',   name: '团购烧钱', desc: '跌破成本！客流暴涨，卖一单亏一单', priceRatio: 0.85 }
};

function currentPriceMode() {
  // 2026-10-31 v3.3.0：玩家可以自己填价格（G.customPrice），填了就用填的
  if (G.customPrice > 0) {
    return { id: 'custom', name: '自定义价', desc: '你自己定的价', priceRatio: 0 };
  }
  return PRICE_MODES[G.priceMode || 'normal'] || PRICE_MODES.normal;
}

/* 估算单位成本（一份/一单的成本）
 * 用「总成本 ÷ 预估单量」，这样房租人工这些固定成本能摊进去
 */
function estimateUnitCost() {
  const p = P();
  const stores = Math.max(1, G.effStores || G.stores || 1);
  // 月总成本 ≈ 营收 × 变动比率 + 固定成本
  const monthlyRev = p.revenue * stores;
  const foodRate = p.foodCostRate || 0.42;
  const otherRate = (p.otherOpexRate || 0.05) + (p.miscRate || 0.03);
  const depreciation = (p.setupCost || 1500000) * stores * (p.depreciationRate || 0.05) / 12;
  const cityRent = (G.cityMod && G.cityMod.rentMult) || 1.0;
  const cityWage = (G.cityMod && G.cityMod.wageMult) || 1.0;
  const rent = (p.rentFixed || 80000) * stores * cityRent;
  const util = (p.utilFixed || 30000) * stores;
  const staff = (G.staff || (p.staffCount || 20) * stores) * (p.staffFixedWage || 6000) * cityWage;

  const totalCost = monthlyRev * (foodRate + otherRate) + rent + util + staff + depreciation;
  // 单量：用「真实客单价」反推（不是拍脑袋除三）
  const aov = AOV_BY_SEG[G.seg] || 60;
  const orders = Math.max(1, monthlyRev / aov);
  return { unitCost: totalCost / orders, orders, totalCost, monthlyRev, aov };
}

/* 团购定价效果：返回营收倍数 + 单位成本 + 实际单价 */
function grouponEffect(Gref) {
  const mode = currentPriceMode();
  const est = estimateUnitCost();
  const unitCost = est.unitCost;
  // 2026-10-31 v3.3.0：玩家填了价就用填的，否则按档位比例算
  const price = (mode.id === 'custom')
    ? Number(G.customPrice)
    : unitCost * mode.priceRatio;
  const ratio = price / Math.max(1, unitCost);

  let mult;
  if (ratio >= 1.30) {
    mult = 1.0;
  } else if (ratio > 1.00) {
    // 1.00→2.5倍，1.30→1.0倍，线性
    mult = 1.0 + (1.30 - ratio) / 0.30 * 1.5;
  } else {
    // 跌破成本：客流暴涨 11 倍
    mult = 11.0;
  }

  // 接待力封顶：超出部分流失，但营收也只能吃到上限倍数
  const rawMult = mult;
  let capacityNote = null;
  if (mult > CAPACITY_MULT) {
    capacityNote = ' ⚠️超出接待力上限（' + CAPACITY_MULT + '倍），大量客人排队后走人';
    mult = CAPACITY_MULT;
  }

  return { revMult: mult, rawMult, unitCost, price, ratio, mode, capacityNote };
}

/* 团购是否亏本（给 UI 提示用） */
function grouponIsLossMaking() {
  const e = grouponEffect(G);
  return e.ratio < 1.0;
}

if (typeof module !== 'undefined') module.exports = {
  PRICE_MODES, currentPriceMode, estimateUnitCost, grouponEffect, grouponIsLossMaking, CAPACITY_MULT
};
