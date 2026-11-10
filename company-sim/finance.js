/* 公司经营模拟 · 抵押 / 账期 / 上市  v1.2.0 2026-10-24 肥鱼
 * 全部按真实商业规则建模
 */

/* ═══════════ 一、抵押资产 ═══════════
 * 真实逻辑：
 *  1. 能抵押的是「固定资产」——门店装修、设备、房产。不是现金、不是口碑
 *  2. 银行按评估价的 50%~70% 放款（折价率），越难变现折得越狠
 *  3. 抵押率低于评估价时才是"足额抵押"
 *  4. 还不上 → 银行处置抵押物（法拍），价格远低于市价
 */
const COLLATERAL_TYPES = [
  { id: 'equip',   name: '门店设备', ratio: 0.50,
    desc: '厨房设备、桌椅、冷柜。折价 50%，变现慢' },
  { id: 'decor',   name: '装修',     ratio: 0.30,
    desc: '装修不可搬走。折价 30%，几乎只能带租约转让' },
  { id: 'property',name: '自有房产', ratio: 0.70,
    desc: '最硬的抵押物。折价 70%，可法拍变现' }
];

/* 计算当前可抵押资产价值（按品类 setupCost 折算） */
function collateralValue() {
  const p = P();
  // 门店资产 = 开店投入 × 门店数 × 已折旧比例（每年折 20%）
  const years = Math.floor(G.month / 12);
  const depreciate = Math.max(0.2, 1 - years * 0.2);
  const gross = p.setupCost * G.stores * depreciate;
  return {
    gross,
    equip: gross * 0.60,      // 设备占资产 60%
    decor: gross * 0.40,      // 装修占 40%
    property: G.ownedProperty || 0
  };
}

/* 算某类抵押物能贷多少 */
function mortgageOffer(typeId) {
  const type = COLLATERAL_TYPES.find(t => t.id === typeId);
  if (!type) return null;
  const cv = collateralValue();
  const base = typeId === 'property' ? cv.property : cv[typeId];
  if (base <= 0) return { ok: false, msg: '没有可抵押的' + type.name };
  const loanable = base * type.ratio;
  return {
    ok: true, type, baseValue: base, loanable,
    // 抵押贷款利率比信用贷低（有抵押物，银行风险小）
    rate: Math.max(0.035, loanRate() - 0.02)
  };
}

/* 申请抵押贷款 */
function applyMortgage(typeId, amount) {
  const offer = mortgageOffer(typeId);
  if (!offer || !offer.ok) return { ok: false, msg: offer ? offer.msg : '无效' };
  if (amount > offer.loanable) {
    return { ok: false, msg: '超出可贷额（该类抵押最多 ' + (offer.loanable / 1e4).toFixed(1) + ' 万）' };
  }
  // 同一资产不能重复抵押
  if (G.mortgages.some(m => m.type === typeId)) {
    return { ok: false, msg: '该类资产已抵押，不能重复抵押' };
  }
  const term = 60;   // 抵押贷通常 5 年
  const rate = offer.rate;
  const r = rate / 12, n = term;
  const pay = amount * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);

  G.mortgages.push({ type: typeId, name: offer.type.name, amount, rate, term });
  G.loans.push({ principal: amount, remain: amount, rate, term, startMonth: G.month,
                 product: '抵押贷·' + offer.type.name, secured: true });
  G.cash += amount;
  return { ok: true, msg: '抵押' + offer.type.name + '借 ' + (amount / 1e4).toFixed(1) + ' 万，年化 ' +
    (rate * 100).toFixed(2) + '%，' + term + ' 期，每月还 ' + (pay / 1e4).toFixed(2) + ' 万' };
}

/* 违约处置：注销抵押物，抵债 */
function seizeCollateral() {
  if (!G.mortgages.length) return null;
  const m = G.mortgages.shift();
  // 法拍价只有评估价 50%
  const cv = collateralValue();
  const base = m.type === 'property' ? cv.property : cv[m.type];
  const auction = base * 0.5;
  return {
    name: m.name, auction,
    text: '🏦 因长期违约，银行处置了抵押的「' + m.name + '」，法拍价 ' +
          (auction / 1e4).toFixed(1) + ' 万（仅为评估值的一半）'
  };
}

/* ═══════════ 二、供应商账期谈判 ═══════════
 * 真实逻辑：
 *  1. 延长账期本质上是"用供应商的钱做自己的生意"
 *  2. 供应商不傻：账期越长，报价越高（占用他的资金成本）
 *  3. 账期太长 + 经营差 → 供应商怕你跑路，直接断供
 *  4. 断供 = 立刻没货 = 营收腰斩
 */

const TERMS_DEALS = [
  { id: 'cash',    name: '现结',      apDays: 0,   priceUp: -0.03, risk: 0.00,
    desc: '当月付清。供应商给 3% 现金折扣，最便宜' },
  { id: 'normal',  name: '月结 30 天', apDays: 30,  priceUp: 0.00,  risk: 0.00,
    desc: '行业标准账期，报价正常' },
  { id: 'long',    name: '月结 60 天', apDays: 60,  priceUp: 0.05,  risk: 0.12,
    desc: '占用供应商资金，报价涨 5%。经营恶化时可能被断供' },
  { id: 'extra',   name: '月结 90 天', apDays: 90,  priceUp: 0.12,  risk: 0.30,
    desc: '极限账期，报价涨 12%。只有强势渠道才谈得下来' }
];

/* 当前账期方案 */
function currentDeal() {
  return TERMS_DEALS.find(d => d.id === (G.terms || 'normal')) || TERMS_DEALS[1];
}

/* 谈判：能不能谈下来，看规模 + 信誉 */
function negotiateTerms(dealId) {
  const deal = TERMS_DEALS.find(d => d.id === dealId);
  if (!deal) return { ok: false, msg: '没有这个方案' };

  // 供应商肯给长账期的条件：门店多（量大）+ 信用好 + 没逾期
  const sizeScore = Math.min(1, G.stores / 10);          // 10 家店满分
  const creditScore = G.credit / 100;
  const bargainPower = sizeScore * 0.5 + creditScore * 0.5;

  // 60 天需要 0.35 议价力，90 天需要 0.6
  const need = deal.id === 'extra' ? 0.6 : deal.id === 'long' ? 0.35 : 0;
  if (bargainPower < need) {
    return { ok: false,
      msg: '议价力不足（当前 ' + (bargainPower * 100).toFixed(0) + ' 分，' + deal.name + '需要 ' +
           (need * 100).toFixed(0) + ' 分）。多开门店、保持信用能提高议价力' };
  }
  G.terms = dealId;
  return { ok: true, msg: '已切换到「' + deal.name + '」——' + deal.desc };
}

/* 每月检查断供风险（在结算里调用） */
function checkSupplyCut() {
  const deal = currentDeal();
  if (deal.risk <= 0) return null;
  // 经营差 + 账期长 → 断供概率上升
  const badShape = (G.monthsNegProfit || 0) * 0.15 + (G.credit < 50 ? 0.2 : 0);
  const p = deal.risk + badShape;
  if (Math.random() < p) {
    return { cut: true,
      text: '📦 供应商担心你资金链，临时断供！当月无法正常进货，营收腰斩',
      revenueDelta: -0.5, months: 1 };
  }
  return null;
}

/* ═══════════ 三、上市融资（IPO）═══════════
 * 真实逻辑：
 *  1. 门槛：连续盈利、营收规模、净资产
 *  2. 成本：承销费、审计费、律师费，占总募资额 6%~10%
 *  3. 代价：股权稀释，老股东股份被摊薄
 *  4. 上市后：要分红、要披露、要被市场盯着
 */

/* 检查是否够格上市 */
function ipoEligibility() {
  const p = P();
  const annualRev = p.revenue * G.stores * 12;
  const assets = G.stores * p.setupCost * 0.7;
  const netWorth = G.cash + assets - totalDebt();

  // 真实 A 股主板门槛（近似）：连续 3 年盈利、累计净利 ≥ 3000 万、净资产 ≥ 5000 万
  const hist12 = G.history.slice(-12);
  const profitRuns = G.history.filter(h => h.netProfit > 0).length;
  const totalProfit = G.history.reduce((s, h) => s + h.netProfit, 0);

  // 真实门槛（对照 A 股餐饮上市公司实际规模反推）
  //  参照：A 股中型餐饮上市公司 2025 年营收 10~30 亿、净利 0.1~1 亿
  //  中小板/创业板餐饮门槛远低于主板，按"够得着"的实际水平设
  const last12 = G.history.slice(-12).reduce((s,h)=>s+h.netProfit,0);
  const checks = [
    { name: '经营满 36 个月（3 年）', ok: G.month >= 36, now: G.month + ' 个月', need: '36 个月' },
    { name: '累计净利 ≥ 2000 万', ok: totalProfit >= 20000000, now: (totalProfit / 1e4).toFixed(0) + ' 万', need: '2000 万' },
    { name: '最近一年净利 ≥ 800 万', ok: last12 >= 8000000, now: (last12 / 1e4).toFixed(0) + ' 万', need: '800 万' },
    { name: '净资产 ≥ 5000 万', ok: netWorth >= 50000000, now: (netWorth / 1e4).toFixed(0) + ' 万', need: '5000 万' },
    { name: '门店 ≥ 15 家', ok: G.stores >= 15, now: G.stores + ' 家', need: '15 家' },
    { name: '信用 ≥ 70 分', ok: G.credit >= 70, now: G.credit.toFixed(0) + ' 分', need: '70 分' },
    { name: '口碑 ≥ 55 分（品牌要有底子）', ok: G.reputation >= 55, now: G.reputation.toFixed(0) + ' 分', need: '55 分' },
    { name: '无贷款逾期', ok: G.overdue === 0, now: G.overdue + ' 次', need: '0 次' }
  ];
  const pass = checks.every(c => c.ok);

  return {
    pass, checks,
    // 估值：按年营收的 1.2 倍 + 净利润的 15 倍（餐饮股真实估值区间）
    // 真实餐饮股估值：营收 1.5 倍 或 净利 20 倍，取合理者
    valuation: Math.max(0, Math.min(annualRev * 1.5, G.history.slice(-12).reduce((s,h)=>s+h.netProfit,0) * 20)),
    annualRev, netWorth, totalProfit
  };
}

/* 执行 IPO */
function doIPO(raiseRatio) {
  const el = ipoEligibility();
  if (!el.pass) return { ok: false, msg: '还不符合上市条件' };

  const raise = el.valuation * raiseRatio;
  const cost = raise * 0.08;          // 承销+审计+律师 8%
  const netRaise = raise - cost;
  const dilution = raise / (el.valuation + raise);   // 稀释比例

  G.cash += netRaise;
  G.listed = true;
  G.ipoMonth = G.month;
  G.ownership = (G.ownership || 1) * (1 - dilution);  // 老股东持股比例
  G.monthlyDividend = true;                            // 上市后要分红
  // v3.3.0 结局一：上市敲钟 —— 走到这一步就是一条完整结局
  G.ipoInfo = {
    raise: raise, cost: cost, netRaise: netRaise,
    dilution: dilution, valuation: el.valuation,
    month: G.month, stores: G.stores,
    ownership: G.ownership
  };
  G.status = 'listed';
  return {
    ok: true,
    msg: '🎉 上市成功！募资 ' + (raise / 1e4).toFixed(0) + ' 万，扣发行费 ' +
         (cost / 1e4).toFixed(0) + ' 万，实到 ' + (netRaise / 1e4).toFixed(0) +
         ' 万。创始人股权稀释到 ' + ((G.ownership || 1) * 100).toFixed(1) + '%',
    raise, cost, netRaise, dilution
  };
}
