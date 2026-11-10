/* 公司经营模拟 · 资产负债表引擎  v3.0.0 2026-10-25 肥鱼
 *
 * 现实规则（这才是压垮房企的那套逻辑）：
 *  ① 资产 = 负债 + 所有者权益，永远要平
 *  ② 开新店是重资产：现金立刻出去，变成固定资产，然后每月折旧吃掉利润
 *  ③ 负债率一高，银行不是慢慢抽血，是直接抽贷 —— 提前收回贷款
 *  ④ 抽贷不看你现在赚不赚钱，只看你报表难不难看
 *
 *  真实案例对照：
 *   房企高周转 → 负债率 80%+ → 销售一转差 → 银行抽贷 → 瞬间暴雷
 *   餐饮连锁 → 直营扩张 → 现金流全靠新店回款 → 一断就死
 */

/* ═══ 资产科目 ═══ */
function bookAssets() {
  const p = P();
  // 固定资产净额：装修设备原值 - 累计折旧
  const fixedGross = (G.fixedAssetsGross || 0);
  const accumDep = (G.accumDepreciation || 0);
  const fixedNet = Math.max(0, fixedGross - accumDep);
  return {
    cash: Math.max(0, G.cash),
    fixedGross,
    accumDepreciation: accumDep,
    fixedNet,
    inventory: Math.max(0, G.inventory || 0),
    receivables: (G.receivables || []).reduce((s, r) => s + (r.paid ? 0 : r.amount), 0),
    // 预付/押金（房租押金，真实里是笔死钱，退租才回）
    deposits: (G.deposits || 0)
  };
}

/* ═══ 负债科目 ═══ */
function bookLiabilities() {
  return {
    loans: totalDebt(),
    payables: (G.payables || []).reduce((s, a) => s + (a.paid ? 0 : a.amount), 0),
    // 欠薪/欠税/欠租（现金不足时会挂在这里）
    arrears: (G.arrears || 0)
  };
}

/* ═══ 完整资产负债表 ═══ */
function balanceSheet() {
  const A = bookAssets();
  const L = bookLiabilities();
  const totalAssets = A.cash + A.fixedNet + A.inventory + A.receivables + A.deposits;
  const totalLiab = L.loans + L.payables + L.arrears;
  const equity = totalAssets - totalLiab;
  // 资产负债率：负债 / 总资产
  const debtRatio = totalAssets > 0 ? totalLiab / totalAssets : (totalLiab > 0 ? 9.99 : 0);
  return {
    assets: A, liabilities: L,
    totalAssets, totalLiab, equity, debtRatio,
    // 勾稽校验：资产 = 负债 + 权益 ± 舍入
    balanced: Math.abs(totalAssets - (totalLiab + equity)) < 1
  };
}

/* ═══ 开新店：重资产化 ═══
 * 现金 → 固定资产（原值入账，之后按月折旧）
 * 同时记录房租押金（3 个月租金，退租才回）
 */
function capitalizeStore(cost, monthlyRent) {
  G.fixedAssetsGross = (G.fixedAssetsGross || 0) + cost;
  G.deposits = (G.deposits || 0) + Math.round(monthlyRent * 3);
  return { fixedAdded: cost, depositAdded: Math.round(monthlyRent * 3) };
}

/* ═══ 每月折旧 ═══
 * 装修按 5 年摊（60 个月），设备按 5 年摊
 * 真实：装修是"沉没成本"，不管你开不开门都在掉价
 */
function monthlyDepreciation() {
  const p = P();
  const rate = (p.depreciationRate || 0.05) / 12;   // 年折旧率摊到月
  const dep = (G.fixedAssetsGross || 0) * rate;
  G.accumDepreciation = (G.accumDepreciation || 0) + dep;
  // 折到头就停（不能折成负数）
  if (G.accumDepreciation > G.fixedAssetsGross) {
    G.accumDepreciation = G.fixedAssetsGross;
  }
  return dep;
}

/* ═══ 负债率阈值与抽贷 ═══
 * 真实银行的分档（不是罚点钱，是直接要钱）：
 *   负债率 > 65%  → 关注名单，新贷款额度砍半
 *   负债率 > 75%  → 抽贷 20%（提前收回部分本金）
 *   负债率 > 85%  → 抽贷 40% + 停止展期
 *   负债率 > 95%  → 全额抽贷，直接清算
 *
 * 抽贷的钱从哪来？从现金里。现金不够 = 立刻破产。
 * 这就是"完美的报表，一夜之间崩塌"的真实机制。
 */
function checkDebtCovenant() {
  const bs = balanceSheet();
  const r = bs.debtRatio;
  const result = { ratio: r, level: 'normal', action: null, text: null, callAmount: 0 };

  if (r <= 0.65) return result;

  if (r <= 0.75) {
    result.level = 'watch';
    result.text = '📊 银行把你列进「关注名单」：资产负债率 ' + (r * 100).toFixed(0) +
                  '%，后续贷款额度减半，利率上浮';
    G.credit = Math.max(0, G.credit - 2);
    G.covenantWatch = true;
    return result;
  }

  // ── 抽贷（真金白银要回去，不看情面）──
  let callRate = 0;
  if (r > 0.95) callRate = 1.0;
  else if (r > 0.85) callRate = 0.40;
  else callRate = 0.20;

  const debt = totalDebt();
  const callAmount = debt * callRate;
  result.level = r > 0.95 ? 'liquidation' : 'call';
  result.callAmount = callAmount;

  if (callAmount <= 0) return result;

  // 从最大那笔贷款开始收
  let remainToCall = callAmount;
  const sorted = G.loans.slice().sort((a, b) => b.remain - a.remain);
  sorted.forEach(l => {
    if (remainToCall <= 0) return;
    const take = Math.min(l.remain, remainToCall);
    l.remain -= take;
    remainToCall -= take;
  });
  G.loans = G.loans.filter(l => l.remain > 0.01);

  G.cash -= callAmount;

  if (r > 0.95) {
    result.text = '🏦💥 银行见到 ' + (r * 100).toFixed(0) + '% 的资产负债率，' +
                  '判定为「技术性违约」，要求立即归还全部贷款 ' +
                  (callAmount / 1e4).toFixed(0) + ' 万。' +
                  '这是抽贷，不是商量。';
  } else {
    result.text = '🏦⚡ 银行抽贷：资产负债率 ' + (r * 100).toFixed(0) + '%，' +
                  '提前收回贷款 ' + (callAmount / 1e4).toFixed(0) + ' 万' +
                  '（抽贷比例 ' + (callRate * 100).toFixed(0) + '%）';
  }

  G.credit = Math.max(0, G.credit - (r > 0.95 ? 30 : 12));

  if (G.cash < 0) {
    G.status = 'bankrupt';
    result.text += '。现金不够，资金链当场断裂，公司清算';
    result.level = 'dead';
  }

  return result;
}

/* ═══ 危机抽贷（v3.0.0 现实修正）═══
 * 真实银行不是等负债率慢慢爬到 95% 才动手，是看现金流：
 *   现金流一转负，银行立刻判定“这笔钱不安全了”，提前收回
 *   房企暴雷都是一夜之间，不是慢慢死
 *
 * 分档（看现金缺口 + 负债率）：
 *   现金一转负 → 银行判定违约，至少抽 50%（现实里就是这样，不会给你缓冲）
 *   缺口大或负债率 > 60% → 抽 70%
 *   缺口大或负债率 > 80% → 全额抽贷，直接清算
 */
function crisisCall() {
  if (!G.loans.length) return { triggered: false };
  const debt = totalDebt();
  if (debt <= 0) return { triggered: false };

  const bs = balanceSheet();
  const r = bs.debtRatio;
  const gap = -G.cash;                        // 现金缺口
  const gapRatio = bs.totalAssets > 0 ? gap / bs.totalAssets : 1;

  let callRate;
  let level;
  // v3.0.0 真实修正：现金流一转负，银行就认定“这笔钱回不来了”
  //   现实里没有银行会等你想办法 —— 一脚踹下去，抽 50% 起
  if (r > 0.80 || gapRatio > 0.35) { callRate = 1.0; level = 'liquidation'; }
  else if (r > 0.60 || gapRatio > 0.12) { callRate = 0.7; level = 'call'; }
  else { callRate = 0.5; level = 'call'; }

  const amount = debt * callRate;
  if (amount <= 0) return { triggered: false };

  // 从最大的那笔开始收
  let remain = amount;
  G.loans.slice().sort((a, b) => b.remain - a.remain).forEach(l => {
    if (remain <= 0) return;
    const take = Math.min(l.remain, remain);
    l.remain -= take;
    remain -= take;
  });
  G.loans = G.loans.filter(l => l.remain > 0.01);
  G.cash -= amount;
  G.credit = Math.max(0, G.credit - (level === 'liquidation' ? 30 : 12));

  const head = level === 'liquidation'
    ? '🏦💥 银行判定「技术性违约」，要求立即归还全部贷款 '
    : '🏦⚡ 银行抽贷：见你现金流为负，提前收回贷款 ';
  const tail = level === 'liquidation'
    ? ' 万。这是抽贷，不是商量，资产当场进入清算程序'
    : ' 万（抽贷比例 ' + (callRate * 100).toFixed(0) + '%，负债率 ' + (r * 100).toFixed(0) + '%）';

  return {
    triggered: true, level, amount, callRate, debtRatio: r,
    text: head + (amount / 1e4).toFixed(0) + tail
  };
}

/* ═══ 开店时的资产负债表提示 ═══
 * 给玩家看：你这一下，负债率会变成多少
 */
function previewStoreImpact(cost, monthlyRent) {
  const bs = balanceSheet();
  const newAssets = bs.totalAssets - cost + cost;  // 现金换成固定资产，总额不变
  const newLiab = bs.totalLiab + Math.round(monthlyRent * 3);
  const newRatio = newAssets > 0 ? newLiab / newAssets : 0;
  return {
    before: bs.debtRatio,
    after: newRatio,
    cashAfter: G.cash - cost - Math.round(monthlyRent * 3),
    deposit: Math.round(monthlyRent * 3)
  };
}

if (typeof module !== 'undefined') module.exports = {
  balanceSheet, bookAssets, bookLiabilities, capitalizeStore,
  monthlyDepreciation, checkDebtCovenant, previewStoreImpact, crisisCall
};
