/* 公司经营模拟 · 推广系统  v3.5.1 2026-10-31 肥鱼
 *
 * 老爹原话：「具体可以花钱推广，花的钱越多，推广越高」
 *          「一次性投放，比如说可以专门请博主来拍摄」
 *
 * 逻辑：
 *   ① 推广是一次性投放，不是月月扣
 *   ② 投完有「推广力」，持续几个月后衰减
 *   ③ 推广力影响：网红爆款开发成功率 + 日常客流
 *   ④ 有翻车风险：钱花了不一定有效果
 */

const PROMO_TIERS = [
  { id: 'small',  name: '小博主探店',   minCost: 3000,   maxCost: 8000,   power: 1.2, months: 2,  flopRate: 0.25, desc: '几千块找个本地博主拍条视频，不一定有水花' },
  { id: 'mid',    name: '中腰部博主',   minCost: 20000,  maxCost: 50000,  power: 1.6, months: 3,  flopRate: 0.15, desc: '几万块，粉丝几十万那种，能带一波' },
  { id: 'top',    name: '头部大 V',     minCost: 150000, maxCost: 500000, power: 2.2, months: 4,  flopRate: 0.10, desc: '大主播/头部账号，贵但声势大' },
  { id: 'viral',  name: '全网刷屏',     minCost: 1000000,maxCost: 3000000,power: 2.8, months: 6,  flopRate: 0.20, desc: '投流+矩阵号，砸钱换曝光，风险也大' }
];

/* 发起推广 */
function startPromo(tierId, budget) {
  const t = PROMO_TIERS.find(x => x.id === tierId);
  if (!t) return { ok: false, msg: '没有这个推广档位' };
  const spend = Math.max(t.minCost, Math.min(t.maxCost * 2, Number(budget) || t.minCost));
  if (G.cash < spend) return { ok: false, msg: '现金不够，这个档位最少要 ' + (t.minCost / 1e4).toFixed(1) + ' 万' };

  G.cash -= spend;
  G.promos = G.promos || [];
  G.promoTierHistory = G.promoTierHistory || {};

  // ═══ v3.5.2 同一档位短期重复投，效果递减（老爹：长期一个博主一直夸，傻子也知道不对）═══
  const hist = G.promoTierHistory[tierId] || { count: 0, lastMonth: -999 };
  const monthsSince = G.month - hist.lastMonth;
  let repeatMult = 1.0;
  if (monthsSince <= 3 && hist.count > 0) {
    repeatMult = Math.pow(0.6, hist.count);   // 第2次0.6，第3次0.36，第4次0.216
    repeatMult = Math.max(0.2, repeatMult);
  }
  G.promoTierHistory[tierId] = { count: (monthsSince <= 3 ? hist.count + 1 : 1), lastMonth: G.month };

  // 翻车判定：钱花了但没效果（重复投会更容易翻车——观众会腻）
  const effFlopRate = Math.min(0.6, t.flopRate + (1 - repeatMult) * 0.25);
  const flop = Math.random() < effFlopRate;
  if (flop) {
    return { ok: true, msg: '💸 花了 ' + (spend / 1e4).toFixed(1) + ' 万做' + t.name +
      '——结果反响平平，视频没人看。这钱算是打水漂了（推广力 ×0.9，聊胜于无）',
      flopped: true, power: 0.9, months: 1 };
  }

  // 正常效果：投入越多，推广力越接近上限
  const ratio = Math.min(1, spend / t.maxCost);
  const power = t.power * (0.7 + ratio * 0.3) * repeatMult;
  G.promos.push({
    tierId: t.id, name: t.name, power: power,
    left: t.months, total: t.months, cost: spend, startMonth: G.month
  });

  const repeatTxt = repeatMult < 0.99
    ? '（这个档位最近投过，效果只剩 ' + (repeatMult * 100).toFixed(0) + '%）'
    : '';
  return { ok: true, power: power, months: t.months,
    msg: '📣 投了 ' + (spend / 1e4).toFixed(1) + ' 万做「' + t.name + '」——推广力 ×' +
         power.toFixed(2) + '，持续 ' + t.months + ' 个月' + repeatTxt };
}

/* 当前推广力（取最高 + 其余小幅叠加，封顶 3.5） */
function currentPromoPower() {
  const ps = (G.promos || []).filter(p => p.left > 0);
  if (!ps.length) return 1.0;
  // 按剩余时间衰减：剩得越少，效果越弱
  let best = 0, extra = 0;
  ps.forEach(p => {
    const decay = 0.5 + 0.5 * (p.left / Math.max(1, p.total));   // 最后一个月剩一半
    const eff = 1 + (p.power - 1) * decay;
    if (eff > best) { extra += best > 0 ? (best - 1) * 0.3 : 0; best = eff; }
    else extra += (eff - 1) * 0.3;
  });
  return Math.min(3.5, best + extra);
}

/* 每月推进推广（衰减） */
function tickPromo() {
  if (!G.promos || !G.promos.length) return null;
  G.promos.forEach(p => { if (p.left > 0) p.left--; });
  const active = G.promos.filter(p => p.left > 0);
  G.promos = active;
  return null;
}

/* 网红爆款专用：推广力当作手艺系数用（v3.5.2 起作为叠加加成，不再替代手艺） */
function promoSkillForViral() {
  return currentPromoPower();
}

/* ═══ v3.5.2 推广反噬：夸得越高，菜不行就越砸招牌 ═══
 * 老爹原话：「长期一个博主一直夸你这个店铺，傻子也知道不对」
 * 逻辑：推广力涨上去 → 客人期望变高 → 菜品质量跟不上就掉口碑
 */
function promoBacklashCheck() {
  const power = currentPromoPower();
  if (power < 1.5) return null;   // 推广不强，不触发

  // 菜品水平：上架菜的平均正加成（没有菜 = 0）
  const onMenu = (G.dishes || []).filter(d => d.onMenu && d.revBonus > 0);
  let dishLevel = 0;
  if (onMenu.length) {
    dishLevel = onMenu.reduce((s, d) => s + d.revBonus, 0) / onMenu.length / 0.30;   // 归一化到 ~0~1
  }
  // 期望落差：推广越猛、菜越弱，反差越大
  const gap = (power - 1.5) * (1 - Math.min(1, dishLevel));
  if (gap <= 0.2) return null;
  if (Math.random() > Math.min(0.6, gap * 0.35)) return null;

  const drop = Math.min(4, gap * 1.2);
  G.reputation = Math.max(0, (G.reputation || 50) - drop);
  return {
    type: 'bad',
    text: '😞 推广吹得太凶，客人来了发现不过如此——口碑 -' + drop.toFixed(1) +
          '（东西得跟上宣传才行）'
  };
}

if (typeof module !== 'undefined') module.exports = {
  PROMO_TIERS, startPromo, currentPromoPower, tickPromo, promoSkillForViral, promoBacklashCheck
};
