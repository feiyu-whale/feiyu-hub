/* 公司经营模拟 · 违法操作系统  v2.1.0 2026-10-24 肥鱼
 *
 * 现实规则：
 *  餐饮业违法手段真实存在：地沟油、偷税、黑工、刷单
 *  短期确实省钱，但风险月月累积
 *  一旦被查：罚款、吊照、关停，情节严重的直接出局
 *
 *  本模块不评判对错，只呈现真实后果。
 */

const ILLEGAL_ACTS = [
  {
    id: 'oil', name: '用劣质油/回收油', icon: '🛢️',
    desc: '食材成本降 30%，但一旦查出就是刑事案',
    savingRate: 0.30,        // 降的是食材成本
    baseRisk: 0.002,         // 首月被查概率（很低，给侥幸心理留空间）
    riskGrowth: 0.00022,     // 每月累积（一年后约+2.6%，两年后约+5.3%）
    riskCurve: 2.2,          // 风险曲线指数（越久涨越快）
    catchPenalty: { fine: 0.5, shut: true, criminal: true },
    news: '地沟油案：当事人被判刑入狱，营业执照吊销，企业永久关闭'
  },
  {
    id: 'tax', name: '偷税漏税', icon: '📄',
    desc: '省下 6%~10% 的营收，但税务大数据比对越来越准',
    savingRate: 0.08,
    baseRisk: 0.0015,
    riskGrowth: 0.00018,
    riskCurve: 2.4,
    catchPenalty: { fine: 1.2, shut: false, criminal: true },
    news: '偷税案：补缴+罚款+滞纳金，数额巨大可追究刑责（真实案例：范冰冰被罚 8.8 亿）'
  },
  {
    id: 'labor', name: '用黑工/童工', icon: '👷',
    desc: '人工成本降 40%，但劳动监察一旦上门就是重罚',
    savingRate: 0.40,
    baseRisk: 0.0025,
    riskGrowth: 0.00025,
    riskCurve: 2.0,
    catchPenalty: { fine: 0.6, shut: true, criminal: false },
    news: '非法用工：责令停产停业、罚款，情节严重的吊销执照'
  },
  {
    id: 'fake', name: '虚假宣传/刷单', icon: '⭐',
    desc: '短期客流涨 15%，但平台处罚和市监约谈随时来',
    savingRate: 0,
    revenueBoost: 0.15,
    baseRisk: 0.0030,
    riskGrowth: 0.00022,
    riskCurve: 2.0,
    catchPenalty: { fine: 0.3, shut: false, criminal: false },
    news: '刷单虚假宣传：市场监管罚款，平台降权或下架'
  }
];

/* 玩家当前启用的违法操作（存 id 数组） */
function toggleIllegal(id) {
  if (!G.illegalActs) G.illegalActs = {};
  if (!G.illegalRisk) G.illegalRisk = {};
  if (G.illegalActs[id]) {
    delete G.illegalActs[id];
    // 停了，风险不立刻归零，但不再增长
    // 天网恢恢：停用也留档，记下结束月份
    if (G.illegalRecords) {
      const rec = G.illegalRecords.find(r => r.id === id);
      if (rec) { rec.active = false; rec.endMonth = G.month; }
    }
    return { ok: true, msg: '已停止「' + ILLEGAL_ACTS.find(a => a.id === id).name + '」' };
  }
  const act = ILLEGAL_ACTS.find(a => a.id === id);
  if (!act) return { ok: false, msg: '没有这个操作' };
  G.illegalActs[id] = true;
  if (G.illegalRisk[id] === undefined) G.illegalRisk[id] = 0;
  // 天网恢恢：启用即建档，记录起始月份（用于算持续时间）
  G.illegalRecords = G.illegalRecords || [];
  let rec = G.illegalRecords.find(r => r.id === id);
  if (!rec) {
    rec = { id: id, name: act.name, startMonth: G.month, months: 0, saved: 0, criminal: !!act.catchPenalty.criminal };
    G.illegalRecords.push(rec);
  } else if (!rec.endMonth) {
    // 重新启用
    rec.startMonth = G.month;
  }
  rec.active = true;
  delete rec.endMonth;
  return { ok: true, msg: '已启用「' + act.name + '」——' + act.desc };
}

/* 每月结算：应用收益、累积风险、检查是否被查 */
function illegalMonthly(rev, foodCost, staffCost) {
  const out = { foodSave: 0, staffSave: 0, taxSave: 0, revBoost: 0, caught: null, warnings: [] };
  if (!G.illegalActs) return out;

  ILLEGAL_ACTS.forEach(act => {
    if (!G.illegalActs[act.id]) return;

    // ① 收益
    if (act.id === 'oil') out.foodSave += foodCost * act.savingRate;
    if (act.id === 'labor') out.staffSave += staffCost * act.savingRate;
    if (act.id === 'tax') out.taxSave += rev * act.savingRate;
    if (act.id === 'fake') out.revBoost += rev * act.revenueBoost;

    // ①-b 天网恢恢：按月累加违法所得（用于判决时的追缴与量刑）
    const gain = (act.id === 'oil' ? foodCost * act.savingRate
               : act.id === 'labor' ? staffCost * act.savingRate
               : act.id === 'tax' ? rev * act.savingRate
               : act.id === 'fake' ? rev * act.revenueBoost : 0);
    if (G.illegalRecords) {
      const rec = G.illegalRecords.find(r => r.id === act.id);
      if (rec) { rec.months = (rec.months || 0) + 1; rec.saved = (rec.saved || 0) + gain; rec.active = true; }
    }

    // ② 风险累积（曲线：用得越久涨得越快）
    G.illegalRisk[act.id] = (G.illegalRisk[act.id] || 0) + 1;   // 存的是使用月数
    const months = G.illegalRisk[act.id];
    const risk = act.baseRisk + act.riskGrowth * Math.pow(months, act.riskCurve);

    // ③ 抽查判定
    if (Math.random() < risk) {
      out.caught = act;
      G.caughtBy = act.id;
      return;
    }
    // ④ 风险高时的风声预警（给一次跑的机会）
    if (risk > 0.08 && Math.random() < 0.15) {
      out.warnings.push('📡 风声越来越紧：' + act.name + '这块，有人开始打听了');
    }
  });

  return out;
}

/* 被查处的后果 */
function handleCaught(act) {
  const rev = G.revenueLast || 1;
  const fine = rev * act.catchPenalty.fine * 12;   // 按年化营收罚
  G.cash -= fine;
  G.reputation = Math.max(0, G.reputation - 45);
  G.morale = Math.max(0, G.morale - 30);

  // 运气：小概率"查得不深"，只罚款关停整改，不吊照（真实：有人确实躲过去了）
  if ((act.catchPenalty.shut || act.catchPenalty.criminal) && Math.random() < 0.18) {
    G.cash -= fine;
    G.reputation = Math.max(0, G.reputation - 30);
    G.morale = Math.max(0, G.morale - 20);
    // 停业整改：营收砍半两个月
    if (typeof addMod === 'function') addMod('revenueDelta', -0.5, 2);
    const act2 = ILLEGAL_ACTS.find(a => a.id === act.id);
    if (G.illegalActs) delete G.illegalActs[act.id];
    if (act2) G.illegalRisk[act.id] = Math.max(0, (G.illegalRisk[act.id] || 0) - 6);
    return {
      text: '😰 被查了！' + act.name + '——但查得不算深，罚款 ' + (fine / 1e4).toFixed(0) +
            ' 万，责令停业整改两个月。这条线断了，但公司还在。',
      detail: '运气救了你一次。下次未必。'
    };
  }

  if (act.catchPenalty.shut || act.catchPenalty.criminal) {
    G.status = 'caught';   // 新状态：被查处，游戏结束
    return {
      text: '🚨 被查处！' + act.name + '——罚款 ' + (fine / 1e4).toFixed(0) + ' 万，' +
            (act.catchPenalty.criminal ? '已移交司法机关，' : '') + '公司即刻关停。游戏结束。',
      detail: act.news
    };
  }
  // 只是罚款，还能继续
  return {
    text: '⚠️ 被查处：' + act.name + '，罚款 ' + (fine / 1e4).toFixed(0) + ' 万，口碑 -45，士气 -30。',
    detail: act.news
  };
}

/* ═══ 被发现之后：四条路，各有真实法律后果 ═══
 * 现实规则：
 *  被查只是开始，怎么应对才决定公司死不死
 *  硬扛、打点、毁证据都是真实有人干的事，也真实有人因此罪加一等
 */

const AFTERMATH_CHOICES = [
  {
    id: 'confess',
    name: '主动自首、整改',
    desc: '承认问题、配合调查、全面整改。罚款照交，停业整顿一段时间，但态度好可从轻',
    risk: 0,
    outcomes: [
      { p: 1.0, type: 'survive',
        text: '主动自首、配合整改，从轻处理：罚款减半，停业整顿一个月。公司保住了，但信用记录上留了污点，以后贷款会更难。' }
    ]
  },
  {
    id: 'bribe',
    name: '找人打点关系',
    desc: '托关系、花钱找人疏通，想把事压下去',
    risk: 0.45,
    outcomes: [
      { p: 0.55, type: 'escape',
        text: '😰 关系通了，事情暂时压下去了。但打点这件事本身已经留下了痕迹——行贿的罪名挂在那儿，什么时候被翻出来，谁都说不准。',
        effects: { cash: -0.15, reputation: -8, crimeAdd: '行贿', crimeRisk: 0.25 } },
      { p: 0.45, type: 'busted',
        text: '🚨 打点过程被查实，性质从"违规"变成"行贿"——罪加一等，公司即刻关停。游戏结束。',
        effects: { gameOver: true } }
    ]
  },
  {
    id: 'destroy',
    name: '销毁证据、转移资产',
    desc: '把账做平、把证据处理掉，赌查不出来',
    risk: 0.55,
    outcomes: [
      { p: 0.45, type: 'escape',
        text: '😰 证据处理掉了，这次查不出什么。但妨碍司法的罪名已经挂在头上，以后任何一次检查，都会先查你。',
        effects: { reputation: -10, cash: -0.08, crimeAdd: '妨碍司法', crimeRisk: 0.35 } },
      { p: 0.55, type: 'busted',
        text: '🚨 销毁证据被查实，构成妨碍司法——罚款翻倍，公司关停。游戏结束。',
        effects: { gameOver: true, fineMult: 2.0 } }
    ]
  },
  {
    id: 'deny',
    name: '硬扛不认',
    desc: '死不承认，赌对方证据不足',
    risk: 0.30,
    outcomes: [
      { p: 0.30, type: 'escape',
        text: '😰 证据不足，这次没定下来。但"拒不配合"的标签已经贴上，调查组还会再来，而且下次会查得更细。',
        effects: { reputation: -12, crimeAdd: '拒不配合', crimeRisk: 0.20 } },
      { p: 0.70, type: 'busted',
        text: '🚨 证据链完整，查实了。态度恶劣、拒不配合，从重处罚——罚款按上限，公司关停。游戏结束。',
        effects: { gameOver: true, fineMult: 1.5 } }
    ]
  }
];

/* 触发事后选择（被查出但还没到死的时候，让玩家做决定） */
function makeAftermath(act) {
  const rev = G.revenueLast || 1;
  const baseFine = rev * act.catchPenalty.fine * 12;
  return {
    actId: act.id,
    actName: act.name,
    baseFine,
    choices: AFTERMATH_CHOICES
  };
}

/* 执行玩家的事后选择 */
function resolveAftermath(actId, choiceId) {
  const act = ILLEGAL_ACTS.find(a => a.id === actId);
  const ch = AFTERMATH_CHOICES.find(c => c.id === choiceId);
  if (!act || !ch) return { ok: false, msg: '无效选择' };

  const rev = G.revenueLast || 1;
  let baseFine = rev * act.catchPenalty.fine * 12;

  // 抽结果
  let r = Math.random(), acc = 0, hit = ch.outcomes[ch.outcomes.length - 1];
  for (const o of ch.outcomes) {
    acc += o.p;
    if (r <= acc) { hit = o; break; }
  }

  const eff = hit.effects || {};

  // 自首：罚款减半、停业一个月
  if (ch.id === 'confess') {
    baseFine *= 0.5;
    G.cash -= baseFine;
    G.reputation = Math.max(0, G.reputation - 25);
    G.credit = Math.max(0, G.credit - 15);
    if (typeof addMod === 'function') addMod('revenueDelta', -0.4, 1);
    if (G.illegalActs) delete G.illegalActs[actId];
    G.illegalRisk[actId] = 0;
    return { ok: true, gameOver: false,
      text: hit.text + '罚款 ' + (baseFine / 1e4).toFixed(0) + ' 万' };
  }

  // 罚款类效果
  if (eff.gameOver) {
    const mult = eff.fineMult || 1;
    baseFine *= mult;
    G.cash -= baseFine;
    G.status = 'caught';
    return { ok: true, gameOver: true, text: hit.text };
  }

  // 逃过一劫
  if (eff.cash) G.cash += rev * eff.cash;
  if (eff.reputation) G.reputation = Math.max(0, G.reputation + eff.reputation);
  // 逃过了也要交点罚款（打点/处理成本）
  if (ch.id === 'bribe') G.cash -= baseFine * 0.3;
  if (ch.id === 'destroy') G.cash -= baseFine * 0.2;
  if (ch.id === 'deny') G.cash -= baseFine * 0.5;
  if (G.illegalActs) delete G.illegalActs[actId];
  G.illegalRisk[actId] = 0;

  // ═══ 罪名升级：逃过不等于没事，只是把罪名挂在了头上 ═══
  if (eff.crimeAdd) {
    G.crimes = G.crimes || [];
    G.crimes.push({ name: eff.crimeAdd, addedMonth: G.month, risk: eff.crimeRisk || 0.2 });
  }

  // 打点成功 = 上了贼船，从此对方会一直要钱
  if (ch.id === 'bribe' && typeof initBribedOfficial === 'function') {
    initBribedOfficial(baseFine * 0.3);
  }

  return { ok: true, gameOver: false, text: hit.text };
}

/* 挂着的罪名每月都要查一次（逃过之后并不安全） */
function checkPendingCrimes() {
  if (!G.crimes || !G.crimes.length) return null;
  for (const c of G.crimes) {
    // 罪名越久越容易被查出来（调查组会持续跟进）
    const age = G.month - c.addedMonth;
    const risk = c.risk * (1 + age * 0.02);
    if (Math.random() < risk) {
      G.status = 'caught';
      G.crimes = [];
      return '🚨 旧案翻出来了：之前的「' + c.name + '」被查实，' +
             '本来就有一条在身，这次数罪并罚——公司关停，游戏结束。';
    }
  }
  return null;
}


/* ═══ 打点之后的连锁：官员会一直要钱，还可能落马把你供出来 ═══
 * 现实规则：
 *  打点不是一次性交易。对方一旦尝到甜头，会反复索要
 *  官员也会出事，落马时为了立功/减刑，往往把行贿人供出来
 *  这就是"上贼船"——想下船，代价太大
 */

const OFFICIAL_STATE = {
  relation: 0,      // 关系亲密度 0-100
  monthlyDemand: 0, // 每月索贿金额
  lastBribeMonth: 0
};

/* 打点成功之后，建立"关系" */
function initBribedOfficial(amount) {
  G.official = {
    active: true,
    relation: 40 + Math.random() * 30,
    monthlyDemand: amount * 0.12,        // 每月索要约为初始打点费的 12%
    startMonth: G.month,
    fallen: false,
    totalPaid: 0
  };
  return G.official;
}

/* 每月：官员来要钱 / 官员落马判定 */
function officialMonthly() {
  if (!G.official || !G.official.active || G.official.fallen) return null;
  const o = G.official;
  const months = G.month - o.startMonth;

  // ① 索贿：关系越深，胃口越大（真实规律）
  o.relation = Math.min(100, o.relation + 0.8);
  o.monthlyDemand *= 1.008;             // 每月涨 0.8%
  const demand = o.monthlyDemand;

  // ② 落马概率：时间越久越高 + 反腐周期
  const fallRisk = 0.004 + months * 0.0006;
  const fallen = Math.random() < fallRisk;

  if (fallen) {
    // 落马了：有概率把行贿人供出来
    const exposeRisk = 0.35 + (o.relation / 100) * 0.25;   // 关系越深越容易被供（知道得越多）
    const exposed = Math.random() < exposeRisk;
    o.fallen = true;
    o.active = false;
    if (exposed) {
      /* 躲过了？——账没消。进入「跑与不跑」抉择 */
      G.fallout = {
        active: true,
        totalPaid: o.totalPaid,
        month: G.month
      };
      return {
        type: 'exposed',
        text: '🚨 那位官员落马了。办案人员翻到他的账本——上面有你的名字，累计打点 ' +
              (o.totalPaid / 1e4).toFixed(0) + ' 万。<br>' +
              '专案组这两天就会上门。你还有最后一个选择：<b>跑，还是不跑。</b>'
      };
    }
    return {
      type: 'escape',
      text: '😰 那位官员落马了，但没把你咬出来。关系断了，暂时安全——' +
            '只是以后没人罩着，再来检查就没人帮你说话了。'
    };
  }

  return {
    type: 'demand',
    demand,
    text: '💸 那位官员又来"借"钱了：' + (demand / 1e4).toFixed(1) + ' 万。' +
          '给了关系更稳，不给……你猜会怎样'
  };
}

/* 玩家选择：给钱 / 不给 */
function payOfficial(yes) {
  const o = G.official;
  if (!o || !o.active) return { ok: false, msg: '没有这层关系' };
  if (yes) {
    const amt = o.monthlyDemand;
    if (G.cash < amt) {
      // 给不起：关系破裂，对方直接翻脸
      o.active = false;
      G.status = 'caught';
      return { ok: true, gameOver: true,
        text: '💀 给不起钱了，对方当场翻脸——直接把你的事捅了上去。游戏结束。' };
    }
    G.cash -= amt;
    o.totalPaid += amt;
    o.relation = Math.min(100, o.relation + 5);
    o.monthlyDemand *= 1.15;   // 给得越爽快，下次要得越多
    return { ok: true, gameOver: false,
      text: '给了 ' + (amt / 1e4).toFixed(1) + ' 万。关系更铁了，但他下次要的会更多。' };
  }
  // 不给：关系滑坡，举报风险上升
  o.relation -= 25;
  if (o.relation <= 0) {
    o.active = false;
    // 直接报复
    if (Math.random() < 0.6) {
      G.status = 'caught';
      return { ok: true, gameOver: true,
        text: '💀 关系断了，对方恼羞成怒，把你的事全捅了出去。游戏结束。' };
    }
    return { ok: true, gameOver: false, text: '关系断了，这次没捅出去。但你知道，这是运气。' };
  }
  return { ok: true, gameOver: false, text: '没给。关系裂了一道缝，对方脸色很难看。' };
}
