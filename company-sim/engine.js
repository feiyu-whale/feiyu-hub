/* 公司经营模拟 · 核心引擎
 * 设计原则：规则来自真实商业逻辑，随机只决定"什么时候来"，不决定"合不合理"
 * 2026-10-24 肥鱼  v1.0.0
 */

const G = {
  cash: 300000,          // 起始现金 30 万
  debt: 0,               // 负债
  month: 0,              // 已过月数（0 = 第1月）
  stores: 1,             // 门店数
  seg: 'zhengcan',       // 当前品类
  reputation: 62,        // 口碑 0-100（真实新店正常水准 60~70）
  morale: 70,            // 士气 0-100
  staff: 5,              // 员工数
  receivables: [],       // 应收账：{amount, dueMonth}
  payables: [],          // 应付账：{amount, dueMonth}
  inventory: 0,          // 存货（元）
  history: [],           // 每月记录
  status: 'running',     // running / bankrupt / quit
  events: [],            // 本月事件日志
  totalInvested: 0,
  monthsNegProfit: 0,    // 连续亏损月数
  revenueLast: 0,        // 上月营收（事件用）
  mods: [],              // 生效中的事件修饰器 {type, value, until}
  usedEvents: [],        // 本月已出事件
  pendingChoice: null,   // 等待玩家选择的事件
  loans: [],             // 每笔贷款：{principal, remain, rate, term, startMonth}
  credit: 100,           // 信用评分 0-100（逾期扣、按时还款加分）
  overdue: 0,            // 累计逾期次数
  lastRBI: 6.0,          // 当前基准利率（年化 %）——2026 中国 LPR 水平
  mortgages: [],         // 已抵押资产 [{type,name,amount,rate,term}]
  ownedProperty: 0,      // 自有房产价值
  terms: 'normal',       // 供应商账期方案
  listed: false,         // 是否已上市
  ipoMonth: 0,
  ownership: 1.0,        // 创始人持股比例
  monthlyDividend: false,// 上市后强制分红
  // ═══ 组织三级（可跳过，跳过则风险累积）═══
  hasHQ: false,          // 是否建了总部
  hasCompany: false,     // 是否做了公司化
  riskBuildup: 0,        // 被跳过组织的风险累积值
  riskEvent: null,       // 本月爆发的风险事件
  // ═══ 对赌 ═══
  vcDeal: null,          // {amount, targetStores, targetProfit, deadline, multiple, equity}
  bankruptcyCount: 0,
  // ═══ 城市与商圈 ═══
  cityId: 'cd',
  districtId: 'core',
  startYear: 2019,
  cityMod: null,
  // ═══ 加盟 ═══
  franchise: null,
  // ═══ 竞争对手 ═══
  rivals: null,
  compIntensity: 1.0,
  rivalsPriceWarMonths: 0,
  // ═══ 历史事件预警 ═══
  warnings: [],
  historyEvent: null,
  // ═══ 违法操作 ═══
  illegalActs: {},
  illegalRisk: {},
  caughtBy: null,
  pendingAftermath: null,
  crimes: [],
  illegalRecords: [],
  official: null,
  // ═══ v3.0.0 资产负债表 ═══
  fixedAssetsGross: 0,   // 固定资产原值（装修+设备）
  accumDepreciation: 0,  // 累计折旧
  deposits: 0,           // 房租押金等
  arrears: 0,            // 欠薪欠税欠租
  covenantWatch: false,  // 是否被银行列入关注名单
  debtCheck: null,       // 本月抽贷检查结果
  // ═══ v3.0.0 库存 ═══
  stockPolicy: 'normal', // lean / normal / bulk
  // ═══ v3.3.0 团购定价 ═══
  priceMode: 'normal',   // cheap / normal / premium / burn
  customPrice: 0,        // 玩家自己填的团购价（>0 则覆盖档位）
  // ═══ v3.0.0 宏观 ═══
  macroConsumer: 1.0,    // 消费意愿系数（隐藏）
  macroRate: 0.06,       // 资金成本（隐藏）
  // ═══ v3.0.0 组织熵增 ═══
  entropyLoss: 0,        // 熵增隐性流失（元/月）
  hasRelativeManager: false
};

function P() { return SEGMENTS[G.seg]; }

/* 修饰器：事件造成的影响，按月生效 */
function addMod(type, value, months) {
  G.mods.push({ type, value, until: G.month + months });
}
function modSum(type) {
  return G.mods.filter(m => m.type === type && m.until > G.month)
               .reduce((s, m) => s + m.value, 0);
}
function expireMods() {
  G.mods = G.mods.filter(m => m.until > G.month);
}

/* 月度结算：核心循环
 * 顺序不可调整 —— 这是真实企业的死法
 */
/* ═══ v3.1.0 结算模式调度（老爹 20261025 凌晨）═══
 *  按月：原逻辑一字不动（settleMonthDirect）
 *  按天：逐日推进，月末把 30 天的账合成一份「月报」交给界面
 *  两种模式共用同一套结算逻辑，不搞两套财务口径
 */
function settleMonth() {
  if (G.pace === 'day') return settleDay();
  return settleMonthDirect();
}

function settleMonthDirect() {
  const p = P();
  const log = { month: G.month + 1, items: [], events: [] };
  G.month++;
  G.events = [];

  // ── 新店筹备与爬坡（真实：新店不是一开门就满座）──
  G.pendingStores = G.pendingStores || [];
  G.rampingStores = G.rampingStores || [];
  G.pendingStores = G.pendingStores.filter(ps => {
    if (ps.openMonth <= G.month) {
      G.stores++;
      G.staff += (P().staffCount || 3);
      // v3.0.0：开业时固定资产已由 openStore 入账，这里只推爬坡
      G.rampingStores.push({ months: 0, rampMonths: ps.rampMonths });
      return false;
    }
    return true;
  });
  // ═══ v3.0.5 开业期曲线（老爹 01:41「第一个月正常不太可能亏钱」）═══
  //  真实餐饮：开业第一个月是最热闹的 —— 开业酬宾、尝鲜客、朋友圈转发
  //  然后热度回落，再靠口碑慢慢爬上去
  //  所以曲线不是「50% 起步慢慢涨」，而是「高开 → 微降 → 稳步爬升」
  //    第 1 月 1.30（开业高峰）
  //    第 2 月 1.15（热度回落但仍高）
  //    第 3 月 1.00（回到正常水平）
  //    之后 6 个月内从 1.00 爬到 1.00（成熟期稳定）
  //  首店额外 +10%（老板亲力亲为，第一批客人就是冲着他来的）
  let effectiveStores = G.stores;
  G.rampingStores.forEach(rs => {
    rs.months++;
    let progress;
    const openingBonus = (G.month <= 2) ? 1.10 : 1.0;   // 开局前两月，老板亲自盯店
    if (rs.months === 1) {
      progress = 1.30 * openingBonus;
    } else if (rs.months === 2) {
      progress = 1.15 * openingBonus;
    } else if (rs.months === 3) {
      progress = 1.00 * openingBonus;
    } else {
      // 第 4 个月起：从 0.95 慢慢爬到 1.0（回归常态后仍需养客）
      const t = (rs.months - 3) / Math.max(1, rs.rampMonths - 3);
      progress = 0.95 + 0.05 * Math.min(1, t);
    }
    effectiveStores -= (1 - progress);
  });
  G.rampingStores = G.rampingStores.filter(rs => rs.months < rs.rampMonths);

  const stores = effectiveStores;

  // ── 1. 营收（含波动）──
  let baseRev = p.revenue * stores;
  // 口碑影响营收（40-60 为基准，越高越好）
  // 口碑影响客流：最低 0.85，最高 1.20（口碑差会掉客流，但不是腰斩——靠老客和位置兜底）
  // 口碑影响客流（真实：餐饮业口碑就是命，差评会真的没人来）
  //  口碑 0 → 45% 客流（只剩过路客老客硬撑）｜50 → 85%｜80 → 109%｜100 → 125%
  // ═══ v3.0.0 营收系数：从「连乘」改成「加权平均」═══
  //  病根：原来 6~7 个系数直接相乘，每项单独看不过分（0.65、0.6、0.85…），
  //        乘起来变成 0.22，营收直接砍到基准的 22%，固定成本却没减 → 必死
  //  改法：压制类系数用「1 - Σ(1-x)×w」合并，权重总和封顶 1.0
  //        单项影响还在，但不会叠成悬崖（真实商业也不会那么巧同时全中）
  //
  //  分工：
  //   ① 自身经营（口碑/士气/季节）→ 保留乘法（这是自己店的本事，该叠加）
  //   ② 外部环境（竞争/历史/宏观/违法增益）→ 加权平均合并
  const repFactor = 0.45 + (G.reputation / 100) * 0.8;   // 0.45 ~ 1.25
  const morFactor = 0.85 + (G.morale / 100) * 0.3;      // 0.85 ~ 1.15
  const seasonFactor = seasonFactorFor(G.seg, G.month);
  const rand = 1 + (Math.random() * 2 - 1) * p.volatility;

  const revMod = 1 + modSum('revenueDelta');

  const cityRev = (G.cityMod && G.cityMod.revenueMult) || 1.0;
  const compPressure = (typeof competitionPressure === 'function') ? competitionPressure() : 1.0;
  const hist = (typeof historyRevenueMult === 'function')
    ? historyRevenueMult(G.month, G.startYear) : { mult: 1, events: [] };
  G.historyEvent = hist.events.length ? hist.events : null;

  // ═══ v3.0.0 宏观引力场：消费意愿（隐藏全局变量）═══
  let macroConsumer = 1.0;
  if (typeof macroState === 'function') {
    const ms = macroState(G.month, G.startYear);
    macroConsumer = ms.consumer;
  }

  const illegalBoost = (G.illegalActs && G.illegalActs.fake) ? 1.15 : 1.0;

  // 外部压制加权合并（权重代表“这因素的影响力”）
  //   竞争：权重 0.35（对手确实抢客，但不是全部）
  //   历史/事件：权重 0.45（疫情这种猛，该重）
  //   宏观消费：权重 0.40（大环境是把大伞，压所有店）
  const externalDrag =
      (1 - compPressure) * 0.35 +
      (1 - hist.mult) * 0.45 +
      (1 - macroConsumer) * 0.40;
  // 封顶 0.55：再糟也保 45% 基本盘（过路客+老客+刚需）
  const externalFactor = 1 - Math.min(0.55, externalDrag);

  // ═══ v3.3.0（2026-10-31 老爹亲定）品牌溢价：加盟大牌子自带客流 ═══
  // 老爹原话：「大品牌抽了那么多钱，没有一点加成那就不太好了」
  const brandMult = (typeof brandRevMult === 'function') ? brandRevMult() : 1.0;

  // ═══ v3.3.0（2026-10-31 老爹亲定）自建品牌「熬熟客」成长曲线 ═══
  //  老爹原话：「自己建的牌子前面一年比较亏，后面一年加成飙到跟大品牌差不多」
  //  又补：「只有在二三线城市有用，大城市几乎没有（深圳这种尤其少）」
  //  逻辑：加盟不受影响（天生有牌子）；自建靠熬时间，熬多久值多少看当地熟客绑定强度
  const selftoBrandFactor = (() => {
    if (G.franchise) return 1.0;                  // 加盟品牌不适用
    if (typeof localBondOf !== 'function') return 1.0;
    const bond = localBondOf(G.cityId);            // 0~1
    const age = G.month - (G.openMonth || 0);      // 开业至今月数
    let base;
    if (age < 12) base = 0.65;                     // 第1年：打响期
    else if (age < 24) base = 1.00;                // 第2年：口碑起来
    else base = 1.15;                              // 第3年+：熟客沉淀完成
    // 用 bond 把「基准 1.0」拉到「实际值」：bond=1 全拿，bond=0 一点没有
    return 1.0 + (base - 1.0) * bond;
  })();
  // 茶饮在低线城市削弱（县城/地级市喝奶茶的少）
  const chayinCity = (typeof chayinCityPenalty === 'function')
    ? chayinCityPenalty(G.seg, G.cityId) : 1.0;

  // ═══ v3.3.0（2026-10-31 老爹亲定）团购定价：跌破成本 → 客流暴涨 11 倍 ═══
  //  老爹原话：「一份成本 80 块的火锅，你给团购价 79 块，客流直接变原来的 11 倍」
  //  现实参照：社区团购/拼多多烧钱抢客，钱烧完就完
  //
  //  单位成本 = （食材+人工+房租+水电+杂费+其他运营+折旧）÷ 预估单量
  //  价格比 = 团购价 ÷ 单位成本
  //    ≥1.30     → 客流 ×1.00（正常）
  //    1.00~1.30 → 线性上扬至 ×2.50
  //    ≤1.00     → 客流 ×11.00（跌破成本，疯抢）
  //  但“客流暴涨 ≠ 能接住”：超过接待力上限的部分直接流失 + 磕口碑
  const priceCfg = (typeof grouponEffect === 'function') ? grouponEffect(G) : { revMult: 1, unitCost: 0, price: 0 };
  const grouponRevMult = priceCfg.revMult;

  // ═══ v3.5.2 推广带来的日常客流（跟手艺路线叠加，不替代）═══
  const promoTraffic = (typeof currentPromoPower === 'function')
    ? (1 + (currentPromoPower() - 1) * 0.25)   // 推广力2.8 → 客流 +45%
    : 1.0;

  // ═══ v3.4.0 招牌菜加成 + 研发分心 ═══
  const dishBonus = (typeof dishRevBonus === 'function') ? (1 + dishRevBonus()) : 1.0;
  const researchPenalty = (typeof researchDistraction === 'function') ? researchDistraction() : 1.0;

  // 违法增益单独算（这是自己主动加的，保留乘法）
  const rev = Math.max(0,
    baseRev * repFactor * morFactor * seasonFactor * rand * revMod *
    externalFactor * illegalBoost * brandMult * selftoBrandFactor * chayinCity * grouponRevMult *
    dishBonus * researchPenalty * promoTraffic);
  G.revenueLast = rev;
  G.revenueLast = rev;
  if (grouponRevMult > 1.01) {
    log.events.push({ type: grouponRevMult >= 10 ? 'bad' : 'info',
      text: '🎟️ 团购引流：客流 ' + grouponRevMult.toFixed(2) + ' 倍（单价 ' + priceCfg.price.toFixed(0) +
            ' / 单位成本 ' + priceCfg.unitCost.toFixed(0) + '）' +
            (grouponRevMult >= 10 ? '——跌破成本，卖多少亏多少' : '') });
  }
  log.items.push(['营业收入', rev, 'in']);

  // ── 2. 成本 ──
  // 供应商账期影响进货报价（现结有折扣，长账期涨价）
  const deal = (typeof currentDeal === 'function') ? currentDeal() : { priceUp: 0 };
  // 建了总部 = 统一采购，食材成本降 3%；没建且店多 = 采购没议价权
  const hqDiscount = G.hasHQ ? 0.97 : (stores > 8 ? 1.02 : 1.0);
  const foodCost = rev * (p.foodCostRate + modSum('foodCostDelta')) * (1 + deal.priceUp) * hqDiscount;
  // 人工是固定成本：按「员工数 × 人均工资」算，不随营收变动
  // （真实商业：生意差了不可能当月就裁人减薪，工资照发）
  const wagePerHead = p.staffFixedWage || (p.revenue * p.staffRate / 10);
  // 工资受城市水平影响（一线城市工资高一截）
  const cityWage = (G.cityMod && G.cityMod.wageMult) || 1.0;
  const staffCost = G.staff * wagePerHead * cityWage * (1 + modSum('staffRateDelta')) + modSum('staffDelta');
  // 房租按门店数固定（真实：房租是固定成本，不随营收变动）
  // 涨租有天花板：最多涨到基准的 2 倍（再贵就换铺位了）
  // 房租受「城市×商圈」和涨租修饰器影响（一线核心商圈真实能贵出好几倍）
  const cityRent = (G.cityMod && G.cityMod.rentMult) || 1.0;
  const rentMult = Math.min(2.0, 1 + modSum('rentDelta'));
  const rentCost = p.rentFixed * stores * rentMult * cityRent;
  const utilCost = p.utilFixed * stores;
  // 其他运营成本（耗材/营销/外卖抽成/支付手续费/维修）——真实餐饮这笔不小
  // v3.0.0：叠加价格战降价（跟进降价 = 实收打折）
  const priceWarCut = modSum('priceWarDiscount');
  const revAfterCut = rev * (1 - priceWarCut);
  const otherOpexCost = rev * (p.otherOpexRate || 0.05) + rev * modSum('otherOpexDelta');
  // 折旧：装修与设备按年摊销（真实：一次性投入要分摊到每月成本里）
  // v3.0.0：改为按「固定资产原值 - 累计折旧」算，不再是简单的 店数×setupCost
  const depreciationCost = (typeof monthlyDepreciation === 'function')
    ? monthlyDepreciation()
    : p.setupCost * stores * (p.depreciationRate || 0.05) / 12;
  // ═══ 管理费：建了组织 = 固定开支；没建 = 效率损失（风险累积）═══
  let orgCost = 0;
  let efficiencyLoss = 0;
  if (G.hasHQ) orgCost += 150000 * stores / Math.max(1, stores);  // 总部固定 15 万/月（不随店数线性涨）
  else if (stores > 8) efficiencyLoss += 0.02;                    // 8 店以上没总部：采购无议价、管理失控
  if (G.hasCompany) orgCost += 400000;                            // 公司化固定 40 万/月
  else if (stores > 25) efficiencyLoss += 0.025;                  // 25 店以上没公司化：开票/用工/贷款全受限

  // 风险累积：该建没建的月份，风险往上爬
  const needHQ = stores >= 10 && !G.hasHQ;
  const needCo = stores >= 30 && !G.hasCompany;
  if (needHQ) G.riskBuildup += 1.2;
  if (needCo) G.riskBuildup += 2.0;
  if (!needHQ && !needCo) G.riskBuildup = Math.max(0, G.riskBuildup - 0.5);

  const miscCost = rev * (p.miscRate + efficiencyLoss) + orgCost;

  // ═══ v3.0.0 组织熵增：利润暗中流失（报表上看不出来的那种）═══
  let entropyLoss = 0;
  if (typeof entropyDrain === 'function') {
    const ed = entropyDrain(rev, stores);
    entropyLoss = ed.loss * ((typeof entropyCoef === 'function') ? entropyCoef() : 1);
    G.entropyLoss = entropyLoss;
    if (entropyLoss > 0) log.items.push(['组织内耗（看不见的出血）', entropyLoss, 'memo']);
  }
  // 空降高管年薪（摊月）
  if (G.execMonthly) {
    orgCost += G.execMonthly;
    log.items.push(['外聘高管薪酬', G.execMonthly, 'out']);
  }
  const grossProfit = revAfterCut - foodCost - staffCost - rentCost - utilCost - miscCost - otherOpexCost - depreciationCost - entropyLoss;

  log.items.push(['食材成本', foodCost, 'memo']);
  log.items.push(['人工成本', staffCost, 'out']);
  log.items.push(['房租', rentCost, 'out']);
  log.items.push(['水电', utilCost, 'out']);
  log.items.push(['杂费/管理费', miscCost, 'out']);
  log.items.push(['其他运营成本', otherOpexCost, 'out']);
  log.items.push(['折旧摊销', depreciationCost, 'out']);

  // ── 3. 贷款月供（等额本息：本金+利息一起还）──
  let totalPayment = 0, totalInterest = 0;
  G.loans.forEach(ln => {
    if (ln.remain <= 0) return;
    const r = ln.rate / 12;                                     // 月利率
    const n = ln.term;                                          // 总期数
    const pay = ln.principal * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
    const intPart = ln.remain * r;
    const priPart = Math.min(pay - intPart, ln.remain);
    ln.remain -= priPart;
    totalPayment += priPart + intPart;
    totalInterest += intPart;
  });
  G.loans = G.loans.filter(l => l.remain > 0.01);
  if (totalPayment > 0) {
    log.items.push(['贷款月供', totalPayment, 'out']);
    log.items.push(['　其中利息', totalInterest, 'memo']);
  }

  // ═══ v3.0.0 库存引擎：补货 → 损耗 → 耗用 ═══
  //  ⚠ 财务口径铁律（00:51 修复重复扣账）：
  //    利润表：食材成本只在 grossProfit 里扣一次
  //    现金流：食材钱只走「应付货款」一条线（按账期付）
  //    库存：只记录物理进了多少货，不再从现金扣（否则同一笔钱扣两三遍）
  let spoilInfo = { spoil: 0, rate: 0 };
  let stockoutInfo = { shortageRatio: 0, revenuePenalty: 0 };
  if (typeof spoilMonthly === 'function' && typeof stockoutCheck === 'function') {
    const pol = (typeof currentStockPolicy === 'function') ? currentStockPolicy() : { days: 10 };
    const baseFoodCost = (G.foodCostLast && G.foodCostLast > 0) ? G.foodCostLast : foodCost;
    // v3.1.2 修正（20261025）：v月结一个月要消耗整月量，只补 10 天货必然断货
    //   改为：补到「max(策略备货天数, 整月用量)」，保证月内不断货
    //   否则按月模式会“注定断货”→ 扣口碑 → 营收一路下滑，与按天模式彻底脱节
    const needStock = Math.max(baseFoodCost / 30 * pol.days, baseFoodCost);
    const gap = needStock - (G.inventory || 0);
    if (gap > 0) {
      const bulkDisc = (typeof bulkDiscount === 'function') ? bulkDiscount() : 1.0;
      // 物理入库：只记账，不扣现金（现金走下面应付货款）
      G.inventory = (G.inventory || 0) + gap * bulkDisc;
      log.items.push(['补货入库（' + pol.days + '天备货）', gap * bulkDisc, 'memo']);
    }
    // ② 月度自然损耗（真实损失，计入成本，不是现金流出）
    spoilInfo = spoilMonthly();
    if (spoilInfo.spoil > 1) {
      log.items.push(['库存损耗（计入成本）', spoilInfo.spoil, 'out']);
    }
    // ③ 耗用（不够就断货）
    const use = stockoutCheck(foodCost);
    stockoutInfo = use;
    if (use.shortageRatio > 0.01) {
      addMod('revenueDelta', -use.revenuePenalty, 1);
      G.reputation = Math.max(0, G.reputation - 3);
      log.events.push({ type: 'bad', text: use.text });
    }
    G.foodCostLast = foodCost;
  }

  const netProfit = grossProfit - totalInterest;

  // 利息不重复扣（已在月供里）——下面现金流只扣 totalPayment

  // ── 4. 现金流：营收不是当月全到账 ──
  //    按账期排队（v3.0.0：按降价后实收算）
  const revCash = revAfterCut;
  G.receivables.forEach(r => {
    if (r.dueMonth <= G.month) {
      G.cash += r.amount;
      log.items.push(['收到应收账', r.amount, 'in']);
      r.paid = true;
    }
  });
  G.receivables = G.receivables.filter(r => !r.paid);
  // ═══ 真实收款结构：堂食现结，外卖/团购有账期 ═══
  //  外卖平台（美团/饿了么）：T+7 ~ T+30，取 15 天
  //  团购券（抖音/美团）：T+15 ~ T+45，取 30 天
  //  这两块当月收不回来，是真实现金流压力的主要来源
  const dineInRate = p.dineInRatio !== undefined ? p.dineInRatio : 0.6;
  const cashNow = revCash * dineInRate;
  G.cash += cashNow;

  const deliveryAmt = revCash * (1 - dineInRate) * 0.6;   // 其中外卖
  const grouponAmt  = revCash * (1 - dineInRate) * 0.4;   // 其中团购券
  if (deliveryAmt > 0) {
    G.receivables.push({ amount: deliveryAmt, dueMonth: G.month + 1, paid: false });
  }
  if (grouponAmt > 0) {
    G.receivables.push({ amount: grouponAmt, dueMonth: G.month + 1 + (Math.random() < 0.4 ? 1 : 0), paid: false });
  }
  const deferred = deliveryAmt + grouponAmt;
  if (deferred > 0) {
    log.items.push(['外卖/团购挂账（未到账）', -deferred, 'memo']);
  }

  // ── 5. 付钱（雷打不动的部分）──
  // 工资、房租必须当月付
  // 注意：折旧是会计成本，不是现金流出，所以这里不扣（利润里已经算过）
  const mustPay = staffCost + rentCost + utilCost + miscCost + otherOpexCost;
  log.items.push(['支付工资房租等', mustPay, 'out']);
  G.cash -= mustPay;

  // 货款按应付账期（用玩家谈下来的账期，不是品类默认）
  const apDays = deal.apDays !== undefined ? deal.apDays : p.apDays;
  if (apDays > 0) {
    const delay = Math.max(1, Math.round(apDays / 30));
    G.payables.push({ amount: foodCost, dueMonth: G.month + delay, paid: false });
  } else {
    G.cash -= foodCost;
  }
  G.payables.forEach(a => {
    if (a.dueMonth <= G.month) {
      G.cash -= a.amount;
      log.items.push(['支付货款', a.amount, 'out']);
      a.paid = true;
    }
  });
  G.payables = G.payables.filter(a => !a.paid);

  // 月供必须当月还（还不上就是逾期）
  if (totalPayment > 0) {
    if (G.cash >= totalPayment) {
      G.cash -= totalPayment;
      G.credit = Math.min(100, G.credit + 0.5);      // 按时还款加分
    } else {
      // 逾期：罚息 + 扣信用
      const penalty = totalPayment * 0.05;
      G.cash -= (totalPayment + penalty);
      G.overdue++;
      G.credit = Math.max(0, G.credit - 15);
      log.events.push({ type: 'bad',
        text: '⚠️ 贷款逾期！罚息 ' + (penalty / 1e4).toFixed(1) + ' 万，信用评分 -15（现 ' + G.credit.toFixed(0) + '）' });
    }
  }

  // ═══ v3.0.0 资产负债勾稽 + 抽贷（真实里压垮房企的那一下）═══
  G.debtCheck = null;
  if (typeof checkDebtCovenant === 'function') {
    const dc = checkDebtCovenant();
    G.debtCheck = dc;
    if (dc.text) {
      log.events.push({ type: dc.level === 'watch' ? 'warn' : 'bad', text: dc.text });
    }
  }

  // ── 6. 破产判定 ──
  if (G.cash < 0) {
    // v3.0.0 现实修正：现金一断，银行不给你慢慢熬的机会，直接抽贷
    //  真实房企暴雷就是这样：不是负债率先到高位，是资金链先断，
    //  银行一看你现金流为负，立马提前收回贷款，一刀砍死
    if (typeof crisisCall === 'function') {
      const cc = crisisCall();
      if (cc && cc.triggered) {
        log.events.push({ type: 'bad', text: cc.text });
        G.debtCheck = { level: cc.level || 'call', text: cc.text, callAmount: cc.amount, crisis: true };
      }
    }
    // 抽贷后还是撑不住 → 才能走后面的过桥贷/破产
    if (G.cash < 0) {
    // 现金断了 → 看能不能紧急借
    // v3.0.0 真实修正：银行只救“还有救的”
    //   负债率已经高 / 信用差 / 已逾期过 → 银行跑得比谁都快，不给过桥贷
    //   现实里过桥贷是最后一根稻草，不是救命绳
    const bsNow = (typeof balanceSheet === 'function') ? balanceSheet() : null;
    const ratioNow = bsNow ? bsNow.debtRatio : 0;
    const stillWorthSaving = ratioNow <= 0.55 && G.credit >= 50 && G.overdue === 0;
    const emergLimit = stillWorthSaving ? (creditLimit() - totalDebt()) : 0;
    if (emergLimit > 0 && G.credit >= 30) {
      const amt = Math.min(emergLimit, 200000);
      const rate = loanRate() * 2.5;     // 过桥贷利率极高
      const r = rate / 12, n = 6;
      const pay = amt * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
      G.loans.push({ principal: amt, remain: amt, rate, term: n, startMonth: G.month, product: '过桥贷' });
      G.cash += amt;
      G.credit = Math.max(0, G.credit - 5);
      log.events.push({ type: 'warn',
        text: '💸 现金断裂！银行只给过桥贷 ' + (amt / 1e4).toFixed(1) + ' 万，年化 ' + (rate * 100).toFixed(1) + '%，每月还 ' + (pay / 1e4).toFixed(2) + ' 万' });
    } else {
      G.status = 'bankrupt';
      log.events.push({ type: 'bad',
        text: '💀 现金耗尽，银行拒绝续命，供应商停供，公司破产' +
              (ratioNow > 0.55 ? '（资产负债率 ' + (ratioNow * 100).toFixed(0) + '%，没银行敢接）' : '') });
    }
    }
  }

  // ═══ v3.0.0 非钱风险：火灾/水灾（累计风险，一次终局）═══
  //  放在最前面：一次就结束，不和其他系统纠缠
  //  违规状态出事 → 坐牢；干净经营 → 破产清算
  if (typeof disasterCheck === 'function' && G.status === 'running') {
    const disaster = disasterCheck();
    if (disaster) {
      const res = resolveDisaster(disaster);
      G.disaster = { kind: disaster.kind, illegal: disaster.illegal, result: res };
      log.events.push({ type: 'bad', text: res.text });
    }
  }

  // ── 7. 士气 / 口碑自然变化 ──
  //  v3.0.0 修正（00:52）：原设计的「亏钱 → 口碑每期 -0.2」是死亡螺旋：
  //    亏钱扣口碑 → 口碑差客流少 → 更亏钱 → 口碑更差，永远回不来
  //    真实餐饮：亏损本身不伤口碑，伤口碑的是「出事」（差评/食安/断货/涨价）
  //    位置好、菜不难吃，口碑本身是相对稳的资产
  if (netProfit < 0) {
    G.monthsNegProfit++;
    // 士气受影响（员工担心发不出工资，这是真的）
    G.morale = Math.max(0, G.morale - 2);
    if (G.monthsNegProfit >= 3 && G.events.length < 3) {
      log.events.push({ type: 'warn', text: '连续 ' + G.monthsNegProfit + ' 个月亏损，员工开始人心浮动' });
    }
  } else {
    G.monthsNegProfit = 0;
    G.morale = Math.min(100, G.morale + 2);
  }

  // 口碑机制（真实：声誉是最慢的资产，也是最快的负债）
  //  ① 口碑有「基线」：位置 + 出品水平决定，不会无限掍
  //     单店选好位置、菜不难吃 → 基线 60 左右，守着这个区间浮动
  //  ② 赚钱时缓慢回升，但回不到基线以上（除非真的做出名声）
  //  ③ 亏钱不再直接扣口碑（只扣士气）
  //  ④ 真正扣口碑的只有事件：差评/食安/断货/涨价（那几处单独处理）
  const scaleDrag = 1 / (1 + G.stores * 0.05);
  // 口碑基线：好位置 60，商圈差 50，有品牌溢价 +8
  let base = 65;
  if (G.cityMod && G.cityMod.trafficMult >= 1.3) base += 6;
  else if (G.cityMod && G.cityMod.trafficMult < 0.7) base -= 6;
  if (G.hasHQ) base += 3;                 // 总部督导，出品稳定
  if (G.franchise) base -= 5;             // 加盟品控差
  G.reputationBase = base;

  // 低于基线 → 自然回升（客人慢慢回头）；高于基线 → 自然回落（守不住高端）
  const gapToBase = base - G.reputation;
  let recover;
  if (gapToBase > 0) {
    // 往基线回升：越快补回但封顶到基线
    recover = Math.min(gapToBase, Math.max(0.6, gapToBase * 0.20)) * scaleDrag;
  } else {
    // 高于基线：缓慢回落（除非持续投入）
    if (netProfit > 0) {
      recover = 0.3 * scaleDrag;          // 赚钱时守得住
    } else {
      recover = gapToBase * 0.08;         // 亏钱时慢慢掍回基线
    }
  }
  G.reputation = Math.max(0, Math.min(100, G.reputation + recover));

  // 士气太低 → 员工流失
  if (G.morale < 30 && Math.random() < 0.3) {
    const leave = 1;
    G.staff = Math.max(1, G.staff - leave);
    log.events.push({ type: 'bad', text: '骨干离职（士气过低），员工减至 ' + G.staff + ' 人' });
  }

  // 上市后强制分红：净利的 30% 分给股东
  if (G.listed && netProfit > 0) {
    const div = netProfit * 0.30;
    G.cash -= div;
    log.items.push(['股东分红（上市强制）', div, 'out']);
  }

  // ═══ 风险爆发（跳过组织的代价，平时看不出，爆了就致命）═══
  G.riskEvent = null;
  if (G.riskBuildup > 0 && Math.random() < Math.min(0.55, G.riskBuildup / 60)) {
    const heavy = G.riskBuildup >= 30;
    const pool = [];
    if (!G.hasCompany) {
      pool.push({ text: '🕵️ 突击检查：社保用工不合规被查处，罚款 ',
                  cash: rev * 0.15, rep: -12, morale: -8 });
      pool.push({ text: '🧾 税务稽查：个体户群账目混乱，补税加罚金 ',
                  cash: rev * 0.25, rep: -8, morale: -5 });
      if (heavy) pool.push({ text: '💼 大客户集体解约：开不了增值税发票，一夜之间丢单 ',
                  revenueCut: 0.4, rep: -15, morale: -12 });
    }
    if (!G.hasHQ) {
      pool.push({ text: '🍲 食安事故：没有总部督导，一家店出事连累全品牌，赔偿 ',
                  cash: rev * 0.12, rep: -20, morale: -10 });
      if (heavy) pool.push({ text: '📉 各店失控：没有统一管理，多家店同时出问题 ',
                  revenueCut: 0.3, rep: -14, morale: -15 });
    }
    if (pool.length) {
      const hit = pool[Math.floor(Math.random() * pool.length)];
      G.riskEvent = hit;
      if (hit.cash) { G.cash -= hit.cash; }
      if (hit.rep) G.reputation = Math.max(0, G.reputation + hit.rep);
      if (hit.morale) G.morale = Math.max(0, G.morale + hit.morale);
      if (hit.revenueCut) addMod('revenueDelta', -hit.revenueCut, 3);
      log.events.push({ type: 'bad',
        text: hit.text + (hit.cash ? (hit.cash / 1e4).toFixed(1) + ' 万' : '') });
      G.riskBuildup = Math.max(0, G.riskBuildup - (heavy ? 25 : 10));  // 爆一次泄一部分
    }
  }

  // 断供检查（长账期的代价）
  if (typeof checkSupplyCut === 'function') {
    const cut = checkSupplyCut();
    if (cut) {
      addMod('revenueDelta', cut.revenueDelta, cut.months);
      log.events.push({ type: 'bad', text: cut.text });
    }
  }

  // ═══ v3.0.0 组织熵增事件（偶发、金额大、说不清怎么没的）═══
  if (typeof entropyEvent === 'function') {
    const ee = entropyEvent(rev, stores);
    if (ee) log.events.push({ type: 'bad', text: ee.text });
  }

  // ═══ 违法操作：短期省钱，长期要命 ═══
  if (typeof illegalMonthly === 'function') {
    const ill = illegalMonthly(rev, foodCost, staffCost);
    if (ill.foodSave > 0) {
      G.cash += ill.foodSave;
      log.items.push(['省下的食材钱（劣质油）', -ill.foodSave, 'memo']);
    }
    if (ill.staffSave > 0) {
      G.cash += ill.staffSave;
      log.items.push(['省下的人工钱（黑工）', -ill.staffSave, 'memo']);
    }
    if (ill.taxSave > 0) {
      G.cash += ill.taxSave;
      log.items.push(['没交的税', -ill.taxSave, 'memo']);
    }
    ill.warnings.forEach(w => log.events.push({ type: 'warn', text: w }));
    if (ill.caught) {
      // 被查了 —— 先不判生死，把决定权交给玩家
      if (typeof makeAftermath === 'function') {
        G.pendingAftermath = makeAftermath(ill.caught);
        log.events.push({ type: 'bad',
          text: '🚨 「' + ill.caught.name + '」被查了！现场被控制，接下来怎么办，你自己决定。' });
      } else {
        const res = handleCaught(ill.caught);
        log.events.push({ type: 'bad', text: res.text, detail: res.detail });
      }
    }
  }

  // ═══ 对手行动（他们会成长、打价格战、挖人）═══
  if (typeof rivalsMonthly === 'function' && G.rivals) {
    const rivalEv = rivalsMonthly();
    rivalEv.forEach(t => log.events.push({ type: 'warn', text: t }));
    if (typeof rivalsPoach === 'function') {
      const poach = rivalsPoach();
      if (poach) log.events.push({ type: 'bad', text: poach });
    }
  }

  // ═══ 加盟抽成（权利金 + 总部供货加价）═══
  if (G.franchise && typeof franchiseMonthlyCost === 'function') {
    const fc = franchiseMonthlyCost(rev);
    if (fc.royalty > 0) {
      G.cash -= fc.royalty;
      log.items.push(['加盟权利金', fc.royalty, 'out']);
    }
    if (typeof checkFranchiseTrap === 'function') {
      const trap = checkFranchiseTrap();
      if (trap) {
        if (trap.foodDelta) addMod('foodCostDelta', trap.foodDelta, trap.months || 2);
        if (trap.cash) G.cash += trap.cash;
        log.events.push({ type: 'bad', text: trap.text });
      }
    }
  }

  // ═══ 未来事件预警（提前 1~3 个月给信号）═══
  G.warnings = [];
  if (typeof upcomingEvents === 'function') {
    const up = upcomingEvents(G.month, G.startYear);
    up.forEach(ev => {
      G.warnings.push(ev);
      log.events.push({ type: 'warn',
        text: '📡 风声：' + ev.inMonths + ' 个月后可能「' + ev.name + '」（' + ev.severity + '）' });
    });
  }

  // ═══ 打点之后的关系：来要钱 / 或者落马 ═══
  if (typeof officialMonthly === 'function' && G.official && G.official.active) {
    const off = officialMonthly();
    if (off) {
      if (off.type === 'busted') log.events.push({ type: 'bad', text: off.text });
      else if (off.type === 'exposed') {
        G.pendingFallout = true;
        log.events.push({ type: 'bad', text: off.text });
      }
      else if (off.type === 'escape') log.events.push({ type: 'warn', text: off.text });
      else if (off.type === 'demand') {
        G.pendingOfficialDemand = off.demand;
        log.events.push({ type: 'warn', text: off.text });
      }
    }
  }

  // ═══ 挂着的罪名：逃过一次不等于安全，调查组会一直跟进 ═══
  if (typeof checkPendingCrimes === 'function') {
    const crimeHit = checkPendingCrimes();
    if (crimeHit) log.events.push({ type: 'bad', text: crimeHit });
  }

  // 对赌到期检查
  if (typeof checkVC === 'function') {
    const vc = checkVC();
    if (vc) log.events.push(vc);
  }

  // ═══ v3.0.0 人的因素：合伙人 / 家族 / 主厨 ═══
  //  合伙人心态每月变，分家会抛出一个待决策事件
  if (typeof partnerMonthly === 'function') {
    const ps = partnerMonthly(netProfit);
    if (ps && ps.type === 'partner_split') {
      G.pendingPeopleEvent = ps;
      log.events.push({ type: 'bad', text: ps.text });
    }
  }
  // 家族塞人（店有起色才会来）
  if (typeof familyIntervention === 'function' && !G.pendingPeopleEvent) {
    const fi = familyIntervention();
    if (fi) {
      G.pendingPeopleEvent = fi;
      log.events.push({ type: 'warn', text: fi.text });
    }
  }
  // 表弟倒数（3 个月后可赶走）
  if (typeof relativeMonthly === 'function') {
    const rm = relativeMonthly();
    if (rm) log.events.push({ type: 'warn', text: rm });
  }
  // 主厨带团队出走
  if (typeof chefLeaveCheck === 'function' && !G.pendingPeopleEvent) {
    const cl = chefLeaveCheck();
    if (cl && cl.apply) {
      const msg = cl.apply();
      log.events.push({ type: 'bad', text: cl.text + '｜' + msg });
    }
  }

  // ═══ v3.0.0 渠道：大客户跑单 / 平台限流 / 断供 ═══
  if (typeof bigCustomerMonthly === 'function') {
    const bc = bigCustomerMonthly();
    if (bc) {
      addMod('revenueDelta', -bc.revenueCut, 999);
      log.events.push({ type: 'bad', text: bc.text });
    }
  }
  if (typeof platformCommission === 'function') {
    G.platformRate = platformCommission();
    // 抽成上涨直接吃利润（其他运营成本口径）
    const extra = rev * (G.platformRate - 0.18) * 0.4;
    if (extra > 0) {
      G.cash -= extra;
      log.items.push(['平台抽成上浮', extra, 'out']);
    }
  }
  if (typeof platformThrottleCheck === 'function') {
    const pt = platformThrottleCheck();
    if (pt) {
      addMod('revenueDelta', -pt.revenuePenalty, pt.months);
      log.events.push({ type: 'bad', text: pt.text });
    }
  }
  if (typeof supplyBreakCheck === 'function') {
    const sb = supplyBreakCheck();
    if (sb) {
      addMod('revenueDelta', -sb.revenuePenalty, sb.months);
      log.events.push({ type: 'bad', text: sb.text });
    }
  }

  // ═══ v3.0.0 黑天鹅（真实年份触发）═══
  if (typeof blackSwanCheck === 'function') {
    const monthAbs = (typeof playerMonthToAbs === 'function') ? playerMonthToAbs(G.month, G.startYear) : G.month;
    const bs2 = blackSwanCheck(monthAbs);
    if (bs2) {
      if (bs2.foodCostDelta) addMod('foodCostDelta', bs2.foodCostDelta, bs2.months || 3);
      if (bs2.revenuePenalty) addMod('revenueDelta', -bs2.revenuePenalty, bs2.months || 2);
      if (bs2.inventoryLoss) {
        const lost = G.inventory || 0;
        G.inventory = 0;
        log.events.push({ type: 'bad', text: bs2.text + '，损失 ' + (lost / 1e4).toFixed(1) + ' 万食材' });
      } else {
        log.events.push({ type: 'bad', text: bs2.text });
      }
    }
  }

  // ═══ v3.0.0 房东毁约（没有谈判余地，但可以选怎么接）═══
  if (typeof landlordCheck === 'function') {
    const ll = landlordCheck();
    if (ll) {
      G.pendingLandlord = ll;
      log.events.push({ type: 'bad', text: ll.text });
    }
  }

  // ═══ v3.0.0 保险月费 + 高利贷月供 ═══
  if (G.hasInsurance && G.insuranceMonthly) {
    G.cash -= G.insuranceMonthly;
    log.items.push(['财产险保费', G.insuranceMonthly, 'out']);
  }
  if (typeof loanSharkMonthly === 'function') {
    const ls = loanSharkMonthly();
    if (ls) log.events.push({ type: 'bad', text: ls });
  }


  // ═══ v3.4.0 新品研发推进 ═══
  if (typeof tickResearch === 'function') {
    const revents = tickResearch();
    revents.forEach(e => log.events.push(e));
  }
  // v3.4.1 上架菜的月度反馈（逐步暴露好坏）
  if (typeof menuFeedback === 'function') {
    const fb = menuFeedback();
    if (fb) log.events.push(fb);
  }
  // ═══ v3.5.1 推广衰减 ═══
  if (typeof tickPromo === 'function') { tickPromo(); }
  // ═══ v3.5.2 推广反噬：夸过头东西跟不上 ═══
  if (typeof promoBacklashCheck === 'function') {
    const pb = promoBacklashCheck();
    if (pb) log.events.push(pb);
  }
  // ═══ v3.6.0 加盟总部：野鸡品牌跑路检查 ═══
  if (typeof hqRunawayCheck === 'function') {
    const ra = hqRunawayCheck();
    if (ra) log.events.push(ra);
  }

  // ═══ v3.5.0 厨师系统：跳槽 / 涨薪 ═══
  if (typeof ensureChef === 'function') {
    const chef = ensureChef();
    // 厨师工资计入人工成本（单独列一项，方便玩家看见）
    if (chef && chef.wage > 0) {
      G.cash -= chef.wage;
      log.items.push(['主厨工资', chef.wage, 'out']);
    }
    if (typeof chefPoachCheck === 'function') {
      const cp = chefPoachCheck();
      if (cp) log.events.push(cp);
    }
  }

  expireMods();
  G.usedEvents = [];
  log.netProfit = netProfit;
  log.revenue = rev;
  log.cashAfter = G.cash;
  G.history.push(log);
  return log;
}

/* ═══════════════════════════════════════════════════════════════
 * v3.1.0 按天推进（老爹 20261025 凌晨「按月结算改成按天推进」）
 *
 *  设计原则：不重写财务逻辑，只改「时间切片」
 *   ① 日结复用月度引擎，拿月额 ÷ 当月天数 = 日额，保证口径一致
 *   ② 不是简单把月额除 30 —— 那样现金流会被均摊成平滑曲线（假）
 *      真实现金流是「一块一块掉」的：
 *        · 房租：每月 1 号一次付清（大头一次性出）
 *        · 工资：月末发（也是大头）
 *        · 水电：月中扣
 *        · 营收：天天进，周末高、周中低（真实餐饮明显有周末峰）
 *      所以日结里「固定支出按日子触发」，只有营收按日进账
 *   ③ 损耗每天跑（生鲜天天烂），比按月跑真实得多
 *   ④ 30 天攒成一份月报 → 界面不用改结构
 * ═══════════════════════════════════════════════════════════════ */

/* 当月天数（简化为真实公历：2 月按 28，其他按大小月） */
function daysInMonth(monthIdx) {
  const m = ((monthIdx - 1) % 12) + 1;
  return [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1];
}

/* 周内客流曲线（1=周一 … 7=周日）：餐饮周末明显翘尾 */
function dayOfWeekFactor(dayIdx) {
  const w = ((dayIdx - 1) % 7) + 1;
  return [0.88, 0.86, 0.90, 0.95, 1.12, 1.30, 1.18][w - 1];
}

/* 一天的结算：把月额按「日账 + 固定日出账」拆开
 *  返回 { items, events, netProfit, revenue } 这一天的账
 */
function settleOneDay(dayOfMonth, dim) {
  const p = P();
  const log = { day: dayOfMonth, items: [], events: [] };
  const share = 1 / dim;                       // 月额摊到每天的基准份额

  /* ── 营收：日额 × 周内曲线（重归一化，保证一个月加起来≈原月额）── */
  //  7 天曲线均值 ≈ 1.027 → 除回去
  const dowAdj = dayOfWeekFactor((G.day || 0) + 1) / 1.027;
  //  v3.1.1 修正（20261025）：G.day 是「当月已过天数」（0 = 还没过），
  //  再推进一天时 G.day 先自增，所以这里应该用 G.day+1 算周内曲线。
  const baseRev = p.revenue * (G.effStores || G.stores);
  const repFactor = 0.45 + (G.reputation / 100) * 0.8;
  const morFactor = 0.85 + (G.morale / 100) * 0.3;
  const seasonFactor = seasonFactorFor(G.seg, G.month);
  const rand = 1 + (Math.random() * 2 - 1) * p.volatility * 0.45;  // 日波动比月波动小得多
  const revMod = 1 + modSum('revenueDelta');
  const cityRev = (G.cityMod && G.cityMod.revenueMult) || 1.0;
  const compPressure = (typeof competitionPressure === 'function') ? competitionPressure() : 1.0;
  const hist = (typeof historyRevenueMult === 'function')
    ? historyRevenueMult(G.month, G.startYear) : { mult: 1, events: [] };
  let macroConsumer = 1.0;
  if (typeof macroState === 'function') macroConsumer = macroState(G.month, G.startYear).consumer;
  const illegalBoost = (G.illegalActs && G.illegalActs.fake) ? 1.15 : 1.0;
  const externalDrag =
      (1 - compPressure) * 0.35 +
      (1 - hist.mult) * 0.45 +
      (1 - macroConsumer) * 0.40;
  const externalFactor = 1 - Math.min(0.55, externalDrag);
  const rev = Math.max(0, baseRev * share * dowAdj * repFactor * morFactor *
    seasonFactor * rand * revMod * externalFactor * illegalBoost * cityRev);

  /* ── 成本：日额摊（利润表口径，和月结一致）── */
  const deal = (typeof currentDeal === 'function') ? currentDeal() : { priceUp: 0 };
  const hqDiscount = G.hasHQ ? 0.97 : ((G.effStores || G.stores) > 8 ? 1.02 : 1.0);
  const foodCost = rev * (p.foodCostRate + modSum('foodCostDelta')) * (1 + deal.priceUp) * hqDiscount;
  const wagePerHead = p.staffFixedWage || (p.revenue * p.staffRate / 10);
  const cityWage = (G.cityMod && G.cityMod.wageMult) || 1.0;
  const staffCostDay = (G.staff * wagePerHead * cityWage * (1 + modSum('staffRateDelta')) + modSum('staffDelta')) * share;
  const cityRent = (G.cityMod && G.cityMod.rentMult) || 1.0;
  const rentMult = Math.min(2.0, 1 + modSum('rentDelta'));
  const rentDay = p.rentFixed * (G.effStores || G.stores) * rentMult * cityRent * share;
  const utilDay = p.utilFixed * (G.effStores || G.stores) * share;
  const priceWarCut = modSum('priceWarDiscount');
  const revAfterCut = rev * (1 - priceWarCut);
  const otherOpexDay = rev * ((p.otherOpexRate || 0.05) + modSum('otherOpexDelta'));
  const depreciationDay = ((typeof monthlyDepreciation === 'function')
    ? monthlyDepreciation() : p.setupCost * (G.effStores || G.stores) * (p.depreciationRate || 0.05) / 12) * share;

  let orgCostDay = 0, efficiencyLoss = 0;
  const nStores = G.effStores || G.stores;
  if (G.hasHQ) orgCostDay += 150000 / 30;
  else if (nStores > 8) efficiencyLoss += 0.02;
  if (G.hasCompany) orgCostDay += 400000 / 30;
  else if (nStores > 25) efficiencyLoss += 0.025;
  const miscDay = rev * (p.miscRate + efficiencyLoss) + orgCostDay;
  const execDay = (G.execMonthly || 0) * share;

  let entropyDay = 0;
  if (typeof entropyDrain === 'function') {
    const ed = entropyDrain(rev * dim, nStores);   // 熵增按规模算，先算月再摊
    entropyDay = ed.loss * ((typeof entropyCoef === 'function') ? entropyCoef() : 1) * share;
  }

  const grossProfitDay = revAfterCut - foodCost - staffCostDay - rentDay - utilDay -
    miscDay - otherOpexDay - depreciationDay - entropyDay;

  /* ── 日现金流水 ── */
  log.items.push(['营业收入', rev, 'in']);
  // 堂食现结当天到账；外卖/团购按天挂账（T+15 / T+30）
  const dineInRate = p.dineInRatio !== undefined ? p.dineInRatio : 0.6;
  G.cash += revAfterCut * dineInRate;
  const deliveryAmt = revAfterCut * (1 - dineInRate) * 0.6;
  const grouponAmt  = revAfterCut * (1 - dineInRate) * 0.4;
  if (deliveryAmt > 0) G.receivables.push({ amount: deliveryAmt, dueDay: G.day + 15, paid: false });
  if (grouponAmt > 0)  G.receivables.push({ amount: grouponAmt, dueDay: G.day + 30, paid: false });

  // ═══ 固定支出「按日出账」（真实：钱是一块一块掉的，不是天天均摊）═══
  // 房租：每月 1 号一次付清
  if (dayOfMonth === 1) {
    const rentFull = p.rentFixed * nStores * rentMult * cityRent;
    G.cash -= rentFull;
    log.items.push(['交房租（月初一次性）', rentFull, 'out']);
  }
  // 水电：每月 15 号扣半月
  if (dayOfMonth === 15 || dayOfMonth === dim) {
    const utilHalf = p.utilFixed * nStores / 2;
    G.cash -= utilHalf;
    log.items.push(['缴水电', utilHalf, 'out']);
  }
  // 工资：月末发
  if (dayOfMonth === dim) {
    const payroll = G.staff * wagePerHead * cityWage * (1 + modSum('staffRateDelta')) + modSum('staffDelta');
    G.cash -= payroll;
    log.items.push(['发工资（月末）', payroll, 'out']);
  }
  G.cash -= (miscDay + otherOpexDay);

  // 货款：按账期日结（当天买当天挂账）
  const apDays = deal.apDays !== undefined ? deal.apDays : p.apDays;
  if (apDays > 0) {
    G.payables.push({ amount: foodCost, dueDay: G.day + Math.max(1, apDays), paid: false });
  } else {
    G.cash -= foodCost;
  }

  /* ── 应收/应付到账 ── */
  G.receivables.forEach(r => {
    if ((r.dueDay !== undefined ? r.dueDay : Infinity) <= G.day) {
      G.cash += r.amount;
      log.items.push(['收到外卖/团购账', r.amount, 'in']);
      r.paid = true;
    }
  });
  G.receivables = G.receivables.filter(r => !r.paid);
  G.payables.forEach(a => {
    if ((a.dueDay !== undefined ? a.dueDay : Infinity) <= G.day) {
      G.cash -= a.amount;
      log.items.push(['支付货款', a.amount, 'out']);
      a.paid = true;
    }
  });
  G.payables = G.payables.filter(a => !a.paid);

  /* ── 库存：生鲜天天烂 ── */
  let spoilToday = 0, shortageToday = 0;
  if (typeof spoilMonthly === 'function' && typeof stockoutCheck === 'function') {
    const pol = (typeof currentStockPolicy === 'function') ? currentStockPolicy() : { days: 10 };
    const baseFoodCost = (G.foodCostLast && G.foodCostLast > 0) ? G.foodCostLast : foodCost * dim;
    const needStock = baseFoodCost / 30 * pol.days;
    const gap = needStock - (G.inventory || 0);
    if (gap > 0) {
      const bulkDisc = (typeof bulkDiscount === 'function') ? bulkDiscount() : 1.0;
      G.inventory = (G.inventory || 0) + gap * bulkDisc;
    }
    const sp = spoilMonthly();          // 月度损耗函数 → 用 share 折算成一天
    spoilToday = sp.spoil * share;
    if (sp.spoil > 0) G.inventory = Math.max(0, G.inventory - spoilToday);
    const use = stockoutCheck(foodCost);          // v3.1.2 修正：按天只消耗「一天的食材成本」
    shortageToday = use.shortageRatio || 0;
    // v3.1.2 修正：断货要扣口碑（按月扣 3 分 → 按天扣 3/30 = 0.1 分），两边口径一致
    if (shortageToday > 0.01) {
      addMod('revenueDelta', -use.revenuePenalty, 1);
      G.reputation = Math.max(0, G.reputation - 3 * share);
      if (Math.random() < 0.5) {
        log.events.push({ type: 'bad', text: use.text });
      }
    }
    G.foodCostLast = foodCost * dim;
  }

  /* ── 贷款利息日计 ── */
  let interestDay = 0;
  G.loans.forEach(ln => {
    if (ln.remain <= 0) return;
    interestDay += ln.remain * (ln.rate / 360);
  });
  G.cash -= interestDay;
  if (interestDay > 1) log.items.push(['贷款日息', interestDay, 'out']);
  // 本金月供：每月 5 号还
  if (dayOfMonth === 5) {
    let priSum = 0;
    G.loans.forEach(ln => {
      if (ln.remain <= 0) return;
      const r = ln.rate / 12, n = ln.term;
      const pay = ln.principal * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
      const priPart = Math.min(pay - ln.remain * r, ln.remain);
      ln.remain -= priPart;
      priSum += priPart;
    });
    if (priSum > 0) {
      G.cash -= priSum;
      log.items.push(['还贷款本金（每月5号）', priSum, 'out']);
    }
    G.loans = G.loans.filter(l => l.remain > 0.01);
    if (G.cash >= 0) G.credit = Math.min(100, G.credit + 0.5);
  }

  const netProfitDay = grossProfitDay - interestDay;
  log.netProfit = netProfitDay;
  log.revenue = rev;
  return log;
}

/* 推进一步（一天或一月）——界面统一走这里 */
function advanceTime() {
  return settleMonth();   // 已经在 settleMonth 里按 G.pace 分派
}

/* ═══ settleDay：按天模式的「一步」= 推进 1 天 ═══
 *  走到月末 → 把 30 天合成一份月报（结构跟月结 log 一致，界面不用改）
 *  中间天数 → 返回日报（mode:'day'），界面只刷数字 + 一条今日流水
 */
function settleDay() {
  G.dayIdx = (G.dayIdx || 0) + 1;
  G.day = ((G.dayIdx - 1) % 30) + 1;          // 简化月：统一 30 天
  const dim = 30;  G.accMonth = G.accMonth || { items: {}, events: [], revenue: 0, netProfit: 0, days: 0 };

  const d = settleOneDay(G.day, dim);
  const acc = G.accMonth;
  acc.days++;
  acc.revenue += d.revenue;
  acc.netProfit += d.netProfit;
  d.items.forEach(([name, amt, kind]) => {
    if (!acc.items[name]) acc.items[name] = { amt: 0, kind };
    acc.items[name].amt += amt;
  });
  d.events.forEach(e => acc.events.push(e));

  // 每日轻量自然变化（口碑/士气按 1/30 速度走，避免一天抖太多）
  if (G.status === 'running') {
    if (d.netProfit < 0) G.morale = Math.max(0, G.morale - 0.07);
    else G.morale = Math.min(100, G.morale + 0.07);
  }

  // ═══ 月末：跑一遍完整的「非财务系统」并出月报 ═══
  if (G.day === dim) {
    const monthLog = { month: G.month + 1, items: [], events: [], mode: 'month' };
    G.month++;
    G.events = [];
    Object.keys(acc.items).forEach(name => {
      const it = acc.items[name];
      monthLog.items.push([name, it.amt, it.kind]);
    });
    monthLog.events = acc.events.slice(0, 12);
    monthLog.netProfit = acc.netProfit;
    monthLog.revenue = acc.revenue;
    monthLog.dayBreakdown = { days: acc.days };

    // 月末跑月度系统（事件/对手/合规/黑天鹅…），用 settleMonthDirect 里的后半段
    const extra = monthEndSystems(monthLog);
    extra.forEach(e => monthLog.events.push(e));

    monthLog.cashAfter = G.cash;
    G.history.push(monthLog);
    G.accMonth = null;
    G.usedEvents = [];
    expireMods();
    monthLog.paceSwitchable = true;
    return monthLog;
  }

  // 日报
  const dayLog = {
    mode: 'day',
    day: G.day,
    month: G.month,
    dayOfMonth: G.day,
    items: d.items,
    events: d.events,
    revenue: d.revenue,
    netProfit: d.netProfit,
    cashAfter: G.cash
  };
  return dayLog;
}

/* 月末系统：把月结里那些「按次发生」的事抽出来单独跑
 *  这些不按天摊，一个月就发生一次（事件/对手/合规/黑天鹅/人事/渠道）
 *  返回事件数组
 */
function monthEndSystems(monthLog) {
  const p = P();
  const ev = [];
  const rev = monthLog.revenue;
  let netProfit = monthLog.netProfit;
  const stores = G.effStores || G.stores;

  // 爬坡推进 + 新店开业
  G.pendingStores = G.pendingStores || [];
  G.rampingStores = G.rampingStores || [];
  G.pendingStores = G.pendingStores.filter(ps => {
    if (ps.openMonth <= G.month) {
      G.stores++;
      G.staff += (p.staffCount || 3);
      G.rampingStores.push({ months: 0, rampMonths: ps.rampMonths });
      return false;
    }
    return true;
  });
  G.rampingStores.forEach(rs => { rs.months++; });
  G.rampingStores = G.rampingStores.filter(rs => rs.months < rs.rampMonths);
  G.effStores = G.stores - G.rampingStores.length * 0.4;

  // 破产判定（日结里现金可能已经穿底）
  if (G.cash < 0 && G.status === 'running') {
    const bsNow = (typeof balanceSheet === 'function') ? balanceSheet() : null;
    const ratioNow = bsNow ? bsNow.debtRatio : 0;
    const stillWorthSaving = ratioNow <= 0.55 && G.credit >= 50 && G.overdue === 0;
    const emergLimit = stillWorthSaving ? (creditLimit() - totalDebt()) : 0;
    if (emergLimit > 0 && G.credit >= 30) {
      const amt = Math.min(emergLimit, 200000);
      const rate = loanRate() * 2.5, r = rate / 12, n = 6;
      const pay = amt * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
      G.loans.push({ principal: amt, remain: amt, rate, term: n, startMonth: G.month, product: '过桥贷' });
      G.cash += amt;
      G.credit = Math.max(0, G.credit - 5);
      ev.push({ type: 'warn', text: '💸 现金断裂！银行只给过桥贷 ' + (amt / 1e4).toFixed(1) +
        ' 万，年化 ' + (rate * 100).toFixed(1) + '%，每月还 ' + (pay / 1e4).toFixed(2) + ' 万' });
    } else {
      G.status = 'bankrupt';
      ev.push({ type: 'bad', text: '💀 现金耗尽，银行拒绝续命，供应商停供，公司破产' +
        (ratioNow > 0.55 ? '（资产负债率 ' + (ratioNow * 100).toFixed(0) + '%，没银行敢接）' : '') });
    }
  }

  // 连续亏损计数
  if (netProfit < 0) {
    G.monthsNegProfit++;
    if (G.monthsNegProfit >= 3) ev.push({ type: 'warn', text: '连续 ' + G.monthsNegProfit + ' 个月亏损，员工开始人心浮动' });
  } else G.monthsNegProfit = 0;

  // 风险累积
  const needHQ = stores >= 10 && !G.hasHQ;
  const needCo = stores >= 30 && !G.hasCompany;
  if (needHQ) G.riskBuildup += 1.2;
  if (needCo) G.riskBuildup += 2.0;
  if (!needHQ && !needCo) G.riskBuildup = Math.max(0, G.riskBuildup - 0.5);
  if (G.riskBuildup > 0 && Math.random() < Math.min(0.55, G.riskBuildup / 60)) {
    const heavy = G.riskBuildup >= 30;
    const pool = [];
    if (!G.hasCompany) {
      pool.push({ text: '🕵️ 突击检查：社保用工不合规被查处，罚款 ', cash: rev * 0.15, rep: -12, morale: -8 });
      pool.push({ text: '🧾 税务稽查：账目混乱，补税加罚金 ', cash: rev * 0.25, rep: -8, morale: -5 });
    }
    if (!G.hasHQ) {
      pool.push({ text: '🍲 食安事故：没有总部督导，一家店出事连累全品牌，赔偿 ', cash: rev * 0.12, rep: -20, morale: -10 });
    }
    if (pool.length) {
      const hit = pool[Math.floor(Math.random() * pool.length)];
      if (hit.cash) G.cash -= hit.cash;
      if (hit.rep) G.reputation = Math.max(0, G.reputation + hit.rep);
      if (hit.morale) G.morale = Math.max(0, G.morale + hit.morale);
      ev.push({ type: 'bad', text: hit.text + (hit.cash ? (hit.cash / 1e4).toFixed(1) + ' 万' : '') });
      G.riskBuildup = Math.max(0, G.riskBuildup - (heavy ? 25 : 10));
    }
  }

  // 口碑回归基线（按月一次，幅度不变）
  let base = 65;
  if (G.cityMod && G.cityMod.trafficMult >= 1.3) base += 6;
  else if (G.cityMod && G.cityMod.trafficMult < 0.7) base -= 6;
  if (G.hasHQ) base += 3;
  if (G.franchise) base -= 5;
  G.reputationBase = base;
  const gapToBase = base - G.reputation;
  const scaleDrag = 1 / (1 + G.stores * 0.05);
  let recover;
  if (gapToBase > 0) recover = Math.min(gapToBase, Math.max(0.6, gapToBase * 0.20)) * scaleDrag;
  else recover = netProfit > 0 ? 0.3 * scaleDrag : gapToBase * 0.08;
  G.reputation = Math.max(0, Math.min(100, G.reputation + recover));

  // 下面这些用 try 包一层：单个子系统出错不拖死整个游戏
  const safe = (fn, ...args) => { try { return fn(...args); } catch (e) { console.error('子系统出错', e); return null; } };

  if (typeof disasterCheck === 'function' && G.status === 'running') {
    const dis = safe(disasterCheck);
    if (dis) { const res = resolveDisaster(dis); ev.push({ type: 'bad', text: res.text }); }
  }
  if (typeof rivalsMonthly === 'function' && G.rivals) {
    (safe(rivalsMonthly) || []).forEach(t => ev.push({ type: 'warn', text: t }));
    const poach = safe(rivalsPoach); if (poach) ev.push({ type: 'bad', text: poach });
  }
  if (typeof illegalMonthly === 'function') {
    const ill = safe(illegalMonthly, rev, rev * 0.42, rev * 0.3);
    if (ill) {
      const saveSum = (ill.foodSave || 0) + (ill.staffSave || 0) + (ill.taxSave || 0);
      if (saveSum > 0) { G.cash += saveSum; monthLog.items.push(['违法省下的钱', -saveSum, 'memo']); }
      (ill.warnings || []).forEach(w => ev.push({ type: 'warn', text: w }));
      if (ill.caught && typeof makeAftermath === 'function') {
        G.pendingAftermath = makeAftermath(ill.caught);
        ev.push({ type: 'bad', text: '🚨 「' + ill.caught.name + '」被查了！接下来怎么办，你自己决定。' });
      }
    }
  }
  if (typeof franchiseMonthlyCost === 'function' && G.franchise) {
    const fc = safe(franchiseMonthlyCost, rev);
    if (fc && fc.royalty > 0) { G.cash -= fc.royalty; monthLog.items.push(['加盟权利金', fc.royalty, 'out']); }
    const trap = safe(checkFranchiseTrap);
    if (trap) {
      if (trap.foodDelta) addMod('foodCostDelta', trap.foodDelta, trap.months || 2);
      if (trap.cash) G.cash += trap.cash;
      ev.push({ type: 'bad', text: trap.text });
    }
  }
  G.warnings = [];
  if (typeof upcomingEvents === 'function') {
    (safe(upcomingEvents, G.month, G.startYear) || []).forEach(e => {
      G.warnings.push(e);
      ev.push({ type: 'warn', text: '📡 风声：' + e.inMonths + ' 个月后可能「' + e.name + '」（' + e.severity + '）' });
    });
  }
  if (typeof officialMonthly === 'function' && G.official && G.official.active) {
    const off = safe(officialMonthly);
    if (off) {
      if (off.type === 'demand') { G.pendingOfficialDemand = off.demand; ev.push({ type: 'warn', text: off.text }); }
      else ev.push({ type: off.type === 'busted' ? 'bad' : 'warn', text: off.text });
    }
  }
  const crime = safe(checkPendingCrimes); if (crime) ev.push({ type: 'bad', text: crime });
  const vc = safe(checkVC); if (vc) ev.push(vc);
  if (typeof partnerMonthly === 'function') {
    const ps = safe(partnerMonthly, netProfit);
    if (ps && ps.type === 'partner_split') { G.pendingPeopleEvent = ps; ev.push({ type: 'bad', text: ps.text }); }
  }
  if (typeof familyIntervention === 'function' && !G.pendingPeopleEvent) {
    const fi = safe(familyIntervention);
    if (fi) { G.pendingPeopleEvent = fi; ev.push({ type: 'warn', text: fi.text }); }
  }
  const rm = safe(relativeMonthly); if (rm) ev.push({ type: 'warn', text: rm });
  if (typeof chefLeaveCheck === 'function' && !G.pendingPeopleEvent) {
    const cl = safe(chefLeaveCheck);
    if (cl && cl.apply) ev.push({ type: 'bad', text: cl.text + '｜' + cl.apply() });
  }
  const bc = safe(bigCustomerMonthly);
  if (bc) { addMod('revenueDelta', -bc.revenueCut, 999); ev.push({ type: 'bad', text: bc.text }); }
  if (typeof platformCommission === 'function') {
    G.platformRate = safe(platformCommission) || G.platformRate;
    const extra = rev * (G.platformRate - 0.18) * 0.4;
    if (extra > 0) { G.cash -= extra; monthLog.items.push(['平台抽成上浮', extra, 'out']); }
  }
  const pt = safe(platformThrottleCheck);
  if (pt) { addMod('revenueDelta', -pt.revenuePenalty, pt.months); ev.push({ type: 'bad', text: pt.text }); }
  const sb = safe(supplyBreakCheck);
  if (sb) { addMod('revenueDelta', -sb.revenuePenalty, sb.months); ev.push({ type: 'bad', text: sb.text }); }
  const sc = safe(checkSupplyCut);
  if (sc) { addMod('revenueDelta', sc.revenueDelta, sc.months); ev.push({ type: 'bad', text: sc.text }); }
  if (typeof blackSwanCheck === 'function') {
    const monthAbs = (typeof playerMonthToAbs === 'function') ? playerMonthToAbs(G.month, G.startYear) : G.month;
    const bs2 = safe(blackSwanCheck, monthAbs);
    if (bs2) {
      if (bs2.foodCostDelta) addMod('foodCostDelta', bs2.foodCostDelta, bs2.months || 3);
      if (bs2.revenuePenalty) addMod('revenueDelta', -bs2.revenuePenalty, bs2.months || 2);
      if (bs2.inventoryLoss) { const lost = G.inventory || 0; G.inventory = 0; ev.push({ type: 'bad', text: bs2.text + '，损失 ' + (lost / 1e4).toFixed(1) + ' 万食材' }); }
      else ev.push({ type: 'bad', text: bs2.text });
    }
  }
  const ll = safe(landlordCheck);
  if (ll) { G.pendingLandlord = ll; ev.push({ type: 'bad', text: ll.text }); }
  if (G.hasInsurance && G.insuranceMonthly) { G.cash -= G.insuranceMonthly; monthLog.items.push(['财产险保费', G.insuranceMonthly, 'out']); }
  const de = safe(entropyEvent, rev, stores); if (de) ev.push({ type: 'bad', text: de });
  const ls = safe(loanSharkMonthly); if (ls) ev.push({ type: 'bad', text: ls });

  monthLog.netProfit = netProfit;
  return ev;
}

function seasonFactorFor(seg, month) {
  // v3.1.0 修正：month=0 时 ((-1)%12)+1 = 0 → 取到 undefined → NaN 传染全账
  //  改成先加 12 再取模，0 和负数也落在 1~12
  const m = (((month - 1) % 12) + 12) % 12 + 1;
  // ═══ v3.3.0（2026-10-31 老爹亲定）：四个行业分开画曲线 ═══
  //  茶饮：夏高、秋冬也旺、春天最淡（热饮嫌热、冷饮嫌凉）
  //  火锅(堂食)：冬最旺、春秋中、夏淡（天热没人想坐空调房吃辣锅）
  //  正餐：节日驱动（春节/五一/国庆/年末），平日平稳
  //  快餐：全年几乎拉平，小幅波动
  const CURVES = {
    chayin: [
      // 1  2  3   4    5    6    7    8    9    10   11   12
      1.00, 0.95, 0.85, 0.82, 0.90, 1.15, 1.28, 1.22, 1.10, 1.05, 1.02, 1.00
    ],
    huoguo: [
      1.30, 1.28, 1.05, 1.00, 0.95, 0.85, 0.82, 0.85, 0.95, 1.08, 1.20, 1.30
    ],
    zhengcan: [
      // 春节(2月)最旺、五一(5月)上扬、国庆(10月)最旺之一、年末(12月)聚餐
      1.10, 1.25, 1.00, 1.00, 1.15, 0.98, 0.95, 0.98, 1.00, 1.20, 1.05, 1.15
    ],
    kuaican: [
      1.02, 0.95, 1.00, 1.00, 1.00, 1.00, 0.98, 1.00, 1.02, 1.02, 1.00, 1.01
    ]
  };
  const curve = CURVES[seg];
  if (curve) return curve[m - 1];
  // 未知行业回退：全年持平（宁可平，不要乱跳）
  return 1.0;
}

/* 季节名称（给 UI 提示用）*/
function seasonNameFor(seg, month) {
  const c = seasonFactorFor(seg, month);
  if (c >= 1.18) return '旺季';
  if (c >= 1.05) return '小旺';
  if (c <= 0.88) return '淡季';
  return '平季';
}

/* 开店：从 1 家扩到 2 家，成本 = setupCost */
function openStore() {
  const p = P();
  const cost = p.setupCost * 0.8;   // 第二家起规模效应，省 20%
  if (G.cash < cost) return { ok: false, msg: '现金不足，需要 ' + (cost / 1e4).toFixed(0) + ' 万' };

  G.pendingStores = G.pendingStores || [];
  // 真实限制：团队精力有限，同时只能开 1 家
  const maxPending = G.hasHQ ? 2 : 1;
  if (G.pendingStores.length >= maxPending) {
    return { ok: false, msg: '已有门店在筹备中，团队精力有限，先等这家开起来' };
  }
  const prepMonths = G.hasHQ ? 2 : 4;   // 没总部：选址装修办证全靠老板自己跑
  G.cash -= cost;
  // v3.0.0：开店 = 重资产化（现金→固定资产原值 + 房租押金），之后按月折旧
  let capInfo = null;
  if (typeof capitalizeStore === 'function') {
    capInfo = capitalizeStore(cost, p.rentFixed);
  } else {
    // 降级兼容：老逻辑用 店数×setupCost 算资产，这里补上原值
    G.fixedAssetsGross = (G.fixedAssetsGross || 0) + cost;
  }
  G.pendingStores.push({ openMonth: G.month + prepMonths, rampMonths: 6, seg: G.seg });
  return { ok: true,
    msg: '🏗 新店进入筹备期（' + prepMonths + ' 个月后开业），已投入 ' + (cost / 1e4).toFixed(0) +
         ' 万' + (capInfo ? '，另押租金 ' + (capInfo.depositAdded / 1e4).toFixed(1) + ' 万（退租才回）' : '') +
         '。开业后还有 6 个月爬坡期，客流从 50% 起步' };
}

/* ═══ 真实商业借贷系统 ═══
 * 真实规则：
 *  1. 授信额度取决于「信用评分 + 经营能力」，不是想借多少借多少
 *  2. 利率分档：信用越好越便宜；基准利率浮动
 *  3. 还款方式：等额本息，每月固定还，不能选择性不还
 *  4. 逾期代价：罚息 5% + 信用暴跌 15 分，还会连锁影响后续授信
 */

/* 计算当前授信额度（真实银行逻辑：看现金流、看资产、看信用） */
function creditLimit() {
  const p = P();
  // 年化营收规模
  const annualRev = p.revenue * G.stores * 12;
  // 净资产（v3.0.0：改用资产负债表口径）
  let netWorth;
  if (typeof balanceSheet === 'function') {
    netWorth = balanceSheet().equity;
  } else {
    const assets = G.stores * p.setupCost * 0.7;
    netWorth = G.cash + assets - totalDebt();
  }
  // 银行最看重：年营收的 30% 为上限，且不超过净资产 2 倍
  const byRev = annualRev * 0.30;
  const byNet = Math.max(0, netWorth) * 2.0;
  // 信用系数 0.3 ~ 1.0
  const creditCoef = 0.3 + (G.credit / 100) * 0.7;
  // 已逾期过 → 授信打折
  const overdueCoef = Math.max(0.3, 1 - G.overdue * 0.15);
  return Math.max(0, Math.min(byRev, byNet) * creditCoef * overdueCoef);
}

function totalDebt() {
  return G.loans.reduce((s, l) => s + Math.max(0, l.remain), 0);
}

/* 利率（年化）：基准 + 信用溢价 */
function loanRate() {
  // 信用 100 分 → 基准；信用 0 分 → 基准 + 12%
  const premium = (100 - G.credit) / 100 * 0.12;
  return G.lastRBI / 100 + premium;
}

/* 贷款产品（真实银行的几类） */
const LOAN_PRODUCTS = [
  { id: 'credit',  name: '信用贷',   term: 12, minCredit: 60,
    desc: '无抵押，看经营流水。额度小、利率高、期限短' },
  { id: 'business',name: '经营贷',   term: 36, minCredit: 40,
    desc: '需经营满 6 个月。额度中等，可用设备/门店抵押' },
  { id: 'longterm',name: '长期贷',   term: 60, minCredit: 70,
    desc: '信用优秀才能申请。额度大、期限长，用于扩张' }
];

/* 申请贷款 */
function applyLoan(productId, amount) {
  const prod = LOAN_PRODUCTS.find(p => p.id === productId);
  if (!prod) return { ok: false, msg: '没有这种贷款' };
  if (G.credit < prod.minCredit) {
    return { ok: false, msg: '信用评分 ' + G.credit.toFixed(0) + ' 分，不够申请' + prod.name + '（要求 ' + prod.minCredit + ' 分）' };
  }
  if (prod.id === 'business' && G.month < 6) {
    return { ok: false, msg: '经营贷要求经营满 6 个月（当前 ' + G.month + ' 个月）' };
  }
  const limit = creditLimit() - totalDebt();
  if (amount > limit) {
    return { ok: false, msg: '超出可贷额度（还能借 ' + (Math.max(0, limit) / 1e4).toFixed(1) + ' 万）' };
  }
  const rate = loanRate();
  // 等额本息月供
  const r = rate / 12, n = prod.term;
  const payment = amount * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
  G.loans.push({ principal: amount, remain: amount, rate, term: n, startMonth: G.month, product: prod.name });
  G.cash += amount;
  return { ok: true, rate, payment, term: n,
    msg: prod.name + ' ' + (amount / 1e4).toFixed(1) + ' 万，年利率 ' + (rate * 100).toFixed(2) + '%，' +
         n + ' 期，每月还 ' + (payment / 1e4).toFixed(2) + ' 万' };
}

/* 提前还款（真实：可以还，但可能收违约金） */
function repayLoan(idx, amount) {
  const ln = G.loans[idx];
  if (!ln) return { ok: false, msg: '没有这笔贷款' };
  const actual = Math.min(amount, ln.remain, G.cash);
  if (actual <= 0) return { ok: false, msg: '没得还' };
  const penalty = actual * 0.01;    // 提前还款违约金 1%
  G.cash -= (actual + penalty);
  ln.remain -= actual;
  if (ln.remain - actual < 0.01) ln.remain = 0;
  G.loans = G.loans.filter(l => l.remain > 0.01);
  return { ok: true, msg: '提前还款 ' + (actual / 1e4).toFixed(1) + ' 万（违约金 ' + (penalty / 1e4).toFixed(2) + ' 万）' };
}

/* 换赛道：老爹要求的核心机制 */
function switchSegment(toSeg) {
  const from = P();
  const to = SEGMENTS[toSeg];
  if (!to) return { ok: false, msg: 'no such segment' };

  const stage = STAGES.find(s => G.stores >= s.minStores && G.stores <= s.maxStores) || STAGES[0];
  const lossRate = similarityLoss(G.seg, toSeg);
  const assets = G.stores * from.setupCost * 0.7;   // 现有资产（折旧后）
  const nonReuseAssets = assets * stage.nonReuse * lossRate;

  // 遣散费：裁员 20%，每人 2 个月工资
  const avgWage = 6000;
  const layoff = Math.round(G.staff * 0.2);
  const severance = layoff * avgWage * 2;

  // 租约违约金：每店 3 万
  const penalty = G.stores * 30000;

  const totalCost = nonReuseAssets + severance + penalty;
  if (G.cash < totalCost) {
    return { ok: false, msg: '转换成本 ' + (totalCost / 1e4).toFixed(1) + ' 万，现金不够' };
  }

  // 成功率
  const baseRate = lossRate <= 0.25 ? BASE_SUCCESS.same :
                   lossRate <= 0.5 ? BASE_SUCCESS.similar : BASE_SUCCESS.cross;
  const cashRatio = totalCost / G.cash;
  const fundCoef = cashRatio < 0.3 ? 1.0 : cashRatio < 0.6 ? 0.85 : cashRatio < 0.9 ? 0.6 : 0.3;
  const expCoef = Math.min(1.3, 1 + G.month * 0.003);      // 经验
  const teamCoef = G.morale / 100;                          // 士气即团队系数
  const timingCoef = 1.0;                                   // 平期

  const successRate = baseRate * fundCoef * expCoef * teamCoef * timingCoef;

  return {
    ok: true, canAfford: true,
    cost: totalCost, successRate,
    detail: { lossRate, stage: stage.name, nonReuseAssets, severance, penalty,
              baseRate, fundCoef, expCoef, teamCoef },
    msg: '转换需 ' + (totalCost / 1e4).toFixed(1) + ' 万，成功率 ' + (successRate * 100).toFixed(1) + '%'
  };
}

function executeSwitch(toSeg, preview) {
  G.cash -= preview.cost;
  if (Math.random() < preview.successRate) {
    G.seg = toSeg;
    G.reputation = Math.max(20, G.reputation - 10);
    return { success: true, msg: '✅ 转型成功，现在是' + SEGMENTS[toSeg].name };
  } else {
    // 失败：额外损失
    const extra = preview.cost * 0.5;
    G.cash -= extra;
    G.reputation = Math.max(0, G.reputation - 25);
    G.morale = Math.max(0, G.morale - 20);
    if (G.cash < 0) G.status = 'bankrupt';
    return { success: false, msg: '❌ 转型失败，额外损失 ' + (extra / 1e4).toFixed(1) + ' 万' };
  }
}

if (typeof module !== 'undefined') module.exports = { G, settleMonth, openStore, applyLoan, repayLoan, switchSegment, executeSwitch, seasonFactorFor };
