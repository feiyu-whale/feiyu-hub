/* 公司经营模拟 · 组织建设与对赌  v1.3.0 2026-10-24 肥鱼
 * 三级组织：总部 / 公司化 / 上市
 * 每一级都可以跳过，代价真实且会累积
 */

/* ═══ 组织等级定义 ═══ */
const ORG_LEVELS = [
  {
    id: 'hq',
    name: '建总部',
    icon: '🏢',
    cost: 3000000,          // 一次性 300 万
    monthly: 150000,        // 每月固定 15 万
    suggestStores: 10,
    flag: 'hasHQ',
    desc: '租办公室、请督导/招聘/财务/供应链，统一管所有门店',
    benefits: ['统一采购，食材成本 -3%', '扩张提速：筹备期 4→2 个月，可同时开 2 家', '事件恶化少，口碑恢复快', '上市前提之一'],
    skipCost: ['采购无议价权（8 店以上食材 +2%）', '扩张慢一倍', '各店各干各的，出事没人兜底', '风险持续累积']
  },
  {
    id: 'company',
    name: '公司化',
    icon: '🏛️',
    cost: 8000000,          // 一次性 800 万
    monthly: 400000,        // 每月固定 40 万
    suggestStores: 30,
    flag: 'hasCompany',
    desc: '从个体户群改成正规公司：工商注册、开票资质、社保合规、财务体系',
    benefits: ['能开增值税发票，接得住大客户', '用工合规，不怕查', '银行贷款额度高、利率低', '能对接加盟商和大供应商', '上市前提之一'],
    skipCost: ['开不了票，大客户跑单', '社保不合规，被查就重罚', '只能靠老板个人信用借钱', '风险快速累积，随时可能集中爆发']
  }
];

/* ═══════════════════════════════════════════════════
 * v3.0.0 组织熵增引擎（大企业病 / 小企业乱）
 *
 * 现实逻辑：
 *   ① 30 家店无公司化 → 店长/员工飞单、贪污、吃回扣
 *      利润暗中流失，报表上看不出来（看不见的出血）
 *   ② 花高薪空降高管 → 水土不服 → 老员工集体离职
 *   ③ 管理层级越多，消息传得越慢，决策越慢
 *
 *   熵增 = 系统自然走向混乱；不投入管理，它自己会变坏
 * ═══════════════════════════════════════════════════ */

/* 每月隐性流失（不用事件触发，就是静静在漏钱） */
function entropyDrain(rev, stores) {
  let rate = 0;
  // 店多没总部：各店自己拿主意，采购/库存/人员全失控
  if (!G.hasHQ) {
    if (stores >= 30) rate += 0.020;
    else if (stores >= 15) rate += 0.012;
    else if (stores >= 8) rate += 0.006;
  }
  // 有总部没公司化：总部管得住，但没正规财务，跑冒滴漏还在
  if (G.hasHQ && !G.hasCompany) {
    if (stores >= 30) rate += 0.012;
    else if (stores >= 15) rate += 0.005;
  }
  // 公司化之后才真正管住
  if (G.hasCompany) {
    rate += 0.002;   // 仍有少量官僚成本
  }
  // 士气低：员工心不在，手就不干净
  if (G.morale < 50) rate *= 1.5;
  if (G.morale < 30) rate *= 2.0;
  // 家族成员当店长（第二批会接上，先留口子）
  if (G.hasRelativeManager) rate += 0.01;

  G.entropyLoss = rev * rate;
  return { loss: G.entropyLoss, rate };
}

/* 熵增的偶发爆发（金额大、看得见，但仍是“说不清どうして”的那种） */
function entropyEvent(rev, stores) {
  const drain = entropyDrain(rev, stores);
  if (drain.rate <= 0) return null;
  // 每月爆发概率：流失率越高越容易
  if (Math.random() > drain.rate * 8) return null;
  const pool = [];
  if (!G.hasCompany) {
    pool.push({ text: '🕳 查出店长飞单：自己接私活，营收走个人账户，损失 ', mult: 0.06, morale: -4 });
    pool.push({ text: '💸 采购吃回扣：食材采购价高出市价，损失 ', mult: 0.05, morale: -2 });
  }
  if (!G.hasHQ) {
    pool.push({ text: '📋 账目对不上：几个店各记各的账，盘点差出一大截，损失 ', mult: 0.07, morale: -5 });
  }
  if (!pool.length) return null;
  const hit = pool[Math.floor(Math.random() * pool.length)];
  const amt = rev * hit.mult;
  G.cash -= amt;
  if (hit.morale) G.morale = Math.max(0, G.morale + hit.morale);
  return { text: hit.text + (amt / 1e4).toFixed(1) + ' 万（这种事不会上报表）', amount: amt };
}

/* 空降高管：花钱请人，也可能把老人气走 */
function hireOutsideExec() {
  if (G.hasOutsideExec) return { ok: false, msg: '已经请过外部高管了' };
  const cost = 1200000;   // 一次性 120 万（签约+安家+猎头费）
  if (G.cash < cost) return { ok: false, msg: '现金不够，需要 120 万（现有 ' + (G.cash / 1e4).toFixed(0) + ' 万）' };
  G.cash -= cost;
  G.hasOutsideExec = true;
  G.execMonthly = 80000;   // 每月 8 万年薪摊月

  // 水土不服：老员工集体离职是真实常态
  const backlash = Math.random() < 0.45;
  if (backlash) {
    const leave = Math.max(1, Math.round(G.staff * 0.12));
    G.staff = Math.max(1, G.staff - leave);
    G.morale = Math.max(0, G.morale - 18);
    return { ok: true, backlash: true,
      msg: '🧑‍💼 空降高管到岗，但水土不服：老员工集体出走 ' + leave +
           ' 人，士气 -18。他还在摸索你的生意' };
  }
  // 成功：熵增流失砍半
  return { ok: true, backlash: false,
    msg: '🧑‍💼 空降高管顺利融入，管理漏洞开始堵上，隐性流失减半' };
}

/* 熵增修正系数（给 engine 用） */
function entropyCoef() {
  let c = 1.0;
  if (G.hasOutsideExec) c *= 0.5;
  return c;
}

/* 检查能不能建 */
function checkOrg(levelId) {
  const lv = ORG_LEVELS.find(o => o.id === levelId);
  if (!lv) return { ok: false, msg: '没有这个组织等级' };
  if (G[lv.flag]) return { ok: false, msg: '已经建过了' };
  if (levelId === 'company' && !G.hasHQ) {
    return { ok: false, msg: '还没建总部，先建总部再谈公司化' };
  }
  if (G.cash < lv.cost) {
    return { ok: false, msg: '现金不足，需要 ' + (lv.cost / 1e4).toFixed(0) + ' 万（现有 ' + (G.cash / 1e4).toFixed(0) + ' 万）' };
  }
  return { ok: true, level: lv };
}

/* 建组织 */
function buildOrg(levelId) {
  const chk = checkOrg(levelId);
  if (!chk.ok) return chk;
  const lv = chk.level;
  G.cash -= lv.cost;
  G[lv.flag] = true;
  // 建了组织，累积的风险泄掉一部分
  G.riskBuildup = Math.max(0, G.riskBuildup - 20);
  return { ok: true,
    msg: lv.icon + ' ' + lv.name + '完成，投入 ' + (lv.cost / 1e4).toFixed(0) +
         ' 万，此后每月固定开支 ' + (lv.monthly / 1e4).toFixed(0) + ' 万' };
}

/* ═══ 对赌协议 ═══
 * 真实规则：
 *  投资人给钱，换业绩承诺。做不到就按约定倍数回购，赔不起就丢控制权。
 *  现实案例：俏江南张兰、太子奶李途纯、雷士照明吴长江
 */
const VC_OFFERS = [
  {
    id: 'conservative', name: '稳健型对赌',
    amount: 5000000,       // 给 500 万
    targetStores: null, targetProfit: 3000000, years: 3,
    multiple: 1.15, equity: 0.15,
    desc: '3 年内年净利做到 300 万。达标投资人只占 15% 股权；不达标按 115% 回购'
  },
  {
    id: 'aggressive', name: '激进型对赌',
    amount: 20000000,      // 给 2000 万
    targetStores: 20, targetProfit: 8000000, years: 3,
    multiple: 1.35, equity: 0.30,
    desc: '3 年内开到 20 家店且年净利 800 万。达标占 30%；不达标按 135% 回购，赔不起就丢控制权'
  },
  {
    id: 'crazy', name: '疯狂型对赌',
    amount: 60000000,      // 给 6000 万
    targetStores: 50, targetProfit: 30000000, years: 3,
    multiple: 1.60, equity: 0.45,
    desc: '3 年内 50 家店年净利 3000 万。达标占 45%；不达标按 160% 回购——这是俏江南那条路'
  }
];

function takeVCD(topId) {
  const offer = VC_OFFERS.find(o => o.id === topId);
  if (!offer) return { ok: false, msg: '没有这个方案' };
  if (G.vcDeal) return { ok: false, msg: '已经签过对赌了' };
  if (G.listed) return { ok: false, msg: '已经上市了，不需要对赌' };

  G.cash += offer.amount;
  G.vcDeal = {
    id: offer.id, name: offer.name, amount: offer.amount,
    targetStores: offer.targetStores, targetProfit: offer.targetProfit,
    deadline: G.month + offer.years * 12,
    multiple: offer.multiple, equity: offer.equity,
    startMonth: G.month
  };
  G.ownership = (G.ownership || 1) * (1 - offer.equity);   // 先稀释
  return { ok: true,
    msg: '💼 签下' + offer.name + '：拿到 ' + (offer.amount / 1e4).toFixed(0) +
         ' 万，出让 ' + (offer.equity * 100).toFixed(0) + '% 股权。' +
         '必须在第 ' + G.vcDeal.deadline + ' 个月之前达成目标，否则按 ' +
         (offer.multiple * 100).toFixed(0) + '% 回购' };
}

/* 每月检查对赌进度（在结算最后调用） */
function checkVC() {
  if (!G.vcDeal) return null;
  const d = G.vcDeal;
  if (G.month < d.deadline) return null;

  const last12 = G.history.slice(-12).reduce((s, h) => s + h.netProfit, 0);
  const storesOk = d.targetStores ? G.stores >= d.targetStores : true;
  const profitOk = last12 >= d.targetProfit;

  if (storesOk && profitOk) {
    G.vcDeal = { ...d, done: true, result: 'win' };
    return { type: 'good',
      text: '✅ 对赌达成！' + d.name + '履约，投资人只占 ' + (d.equity * 100).toFixed(0) + '% 股权，公司归你' };
  }

  // 输了：按倍数回购
  const buyback = d.amount * d.multiple;
  if (G.cash >= buyback) {
    G.cash -= buyback;
    G.vcDeal = { ...d, done: true, result: 'buyback' };
    return { type: 'warn',
      text: '⚠️ 对赌失败！按约定回购投资人股份，付出 ' + (buyback / 1e4).toFixed(0) + ' 万现金' };
  } else {
    // 赔不起 → 丢控制权
    G.ownership = Math.min(G.ownership, 0.3);
    G.vcDeal = { ...d, done: true, result: 'lose' };
    return { type: 'bad',
      text: '💀 对赌失败且无力回购！投资人接管公司，创始人股权被压到 ' +
           (G.ownership * 100).toFixed(0) + '%——这是俏江南张兰走过的路'
    };
  }
}
