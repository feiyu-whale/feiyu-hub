/* 公司经营模拟 · 竞争对手系统  v1.4.0 2026-10-24 肥鱼
 *
 * 现实规则：
 *  竞争强度由「城市分级 × 商圈等级」决定
 *  一线核心商圈：大品牌扎堆，你一个小店很难冒头
 *  三线社区：几乎没对手，但也几乎没客人
 *
 *  对手会自己发展：他们会开店、会打价格战、会挖你的人
 *  你不进步，他们就会挤掉你
 *
 *  ⚠️ 品牌名全部虚构，竞争逻辑取自真实现象
 */

const RIVAL_POOL = {
  huoguo: [
    { name:'蜀香源', size:'small', strength:0.6 },
    { name:'牛气冲天', size:'mid',   strength:1.0 },
    { name:'围炉记', size:'big',     strength:1.6 }
  ],
  zhengcan: [
    { name:'家常小馆', size:'small', strength:0.6 },
    { name:'聚福楼',   size:'mid',   strength:1.0 },
    { name:'宴宾阁',   size:'big',   strength:1.6 }
  ],
  kuaican: [
    { name:'快客来',   size:'small', strength:0.6 },
    { name:'一碗好饭', size:'mid',   strength:1.0 },
    { name:'速食王',   size:'big',   strength:1.6 }
  ],
  chayin: [
    { name:'茶小铺',   size:'small', strength:0.6 },
    { name:'鲜果时光', size:'mid',   strength:1.0 },
    { name:'茗悦茶饮', size:'big',   strength:1.6 }
  ]
};

/* 初始化竞争环境（开局时调用） */
function initRivals(cityId, districtId, seg) {
  const m = cityModifiers(cityId, districtId);
  const comp = m.compMult;
  const pool = RIVAL_POOL[seg] || RIVAL_POOL.zhengcan;

  // 竞争越强，出现的对手越多、越强
  const count = Math.min(3, Math.max(0, Math.round(comp * 1.2)));
  const rivals = [];
  for (let i = 0; i < count; i++) {
    const src = pool[Math.min(pool.length - 1, Math.floor(comp * (i + 1) / 2))];
    rivals.push({
      name: src.name, size: src.size,
      strength: src.strength * (0.8 + Math.random() * 0.4),
      monthsActive: 0,
      priceWar: false
    });
  }
  G.rivals = rivals;
  G.compIntensity = comp;
  return { count, comp };
}

/* 每月对手行动（在结算里调用） */
function rivalsMonthly() {
  if (!G.rivals) return [];
  const events = [];
  G.rivals.forEach(r => {
    r.monthsActive++;
    // 对手成长：每 6 个月强一点
    if (r.monthsActive % 6 === 0) r.strength *= 1.06;

    // 打价格战：竞争激烈时，大对手会降价抢客
    // v3.0.0：不再自动压制玩家，改成抛出博弈 —— 玩家自己选跟不跟
    if (!r.priceWar && G.compIntensity > 1.2 && Math.random() < 0.08) {
      r.priceWar = true;
      G.rivalsPriceWarMonths = 3;
      if (typeof triggerPriceWar === 'function' && !G.priceWar) {
        triggerPriceWar(r);
        events.push('⚔️ 「' + r.name + '」开始打价格战，全场七折。跟不跟，你定');
      } else {
        events.push('⚔️ 「' + r.name + '」开始打价格战，全场七折，客流被抢走一部分');
      }
    }
  });

  // 价格战对营收的压制
  if (G.rivalsPriceWarMonths > 0) {
    G.rivalsPriceWarMonths--;
    addMod('revenueDelta', -0.12, 1);
  }
  return events;
}

/* 竞争对营收的持续压制：对手总强度越高，你的客流越少 */
function competitionPressure() {
  if (!G.rivals || !G.rivals.length) return 1.0;
  const total = G.rivals.reduce((s, r) => s + r.strength, 0);
  // 每 1.0 强度压 12% 客流，最多压 35%
  return Math.max(0.65, 1 - total * 0.12);
}

/* ═══════════════════════════════════════════════════
 * v3.0.0 价格战博弈树（不是数值碾压，是逼玩家做选择）
 *
 * 现实逻辑：
 *   对手实力远大于你时打价格战，你只有两条路：
 *     ① 跟进降价 → 毛利率跌破盈亏线，失血而死
 *     ② 不降价   → 客流被吸干，慢性死亡
 *   破局点：品牌力（口碑）够强 → 可以不参与，靠品牌溢价活下来
 *
 *   这就是现实：中小玩家跟不起，大品牌赔得起
 * ═══════════════════════════════════════════════════ */

/* 品牌力：口碑 + 门店规模 + 上市背书 */
function brandPower() {
  let bp = G.reputation / 100;                 // 0~1
  bp += Math.min(0.25, G.stores * 0.008);      // 店多 = 认知度高
  if (G.listed) bp += 0.15;                    // 上市 = 信任背书
  if (G.franchise) bp *= 0.85;                 // 加盟 = 品牌不是你的
  return Math.min(1.5, bp);
}

/* 触发价格战：由 rivalsMonthly 调用，但不再自动压制，而是交给玩家选 */
function triggerPriceWar(rival) {
  const myBP = brandPower();
  // 品牌力够强，对手也不敢轻易打（或者打了也伤不到你）
  const warIntensity = rival.strength * (1.2 - myBP * 0.5);
  G.priceWar = {
    rival: rival.name,
    strength: rival.strength,
    intensity: Math.max(0.3, warIntensity),
    startMonth: G.month,
    // 品牌力够硬 → 自带抵抗，不降价也掉得少
    brandResist: Math.min(0.75, myBP * 0.6)
  };
  return G.priceWar;
}

/* 算出三个选项的后果，让玩家看清楚了再选 */
function priceWarOptions() {
  const pw = G.priceWar;
  if (!pw) return null;
  const p = P();
  // 当前毛利率（粗算）
  const grossMargin = 1 - p.foodCostRate - p.otherOpexRate - p.miscRate;

  // 选项 A：跟进降价
  const followDiscount = 0.25;               // 跟降 25%
  const followMargin = grossMargin - followDiscount;
  const followRevenueKeep = 0.95;            // 保住大部分客流

  // 选项 B：死撑不降
  const holdRevenueLoss = Math.min(0.6, pw.intensity * 0.35) * (1 - pw.brandResist);
  const holdRevenueKeep = 1 - holdRevenueLoss;

  // 选项 C：品牌战（只对品牌力够强的开放）
  const canBrandWar = brandPower() >= 0.55;
  const brandWarCost = 0.08;                 // 加大营销投放
  const brandWarRevenueKeep = 0.92;

  return {
    rival: pw.rival,
    month: G.month,
    brandPower: brandPower(),
    options: [
      {
        id: 'follow', name: '跟进降价',
        desc: '跟着打七五折，抢回客流',
        revenueKeep: followRevenueKeep,
        marginAfter: followMargin,
        risk: followMargin < 0 ? '毛利率跌破 0，每卖一单亏一单' : '毛利率被压薄'
      },
      {
        id: 'hold', name: '死撑不降',
        desc: '维持原价，靠老客户和位置撑着',
        revenueKeep: holdRevenueKeep,
        marginAfter: grossMargin,
        risk: '客流流失 ' + (holdRevenueLoss * 100).toFixed(0) + '%' +
              (pw.brandResist > 0.1 ? '（品牌力帮你挡掉了部分流失）' : '')
      },
      {
        id: 'brand', name: '品牌战（加大投放）',
        desc: canBrandWar ? '不降价，砸钱做口碑和营销' : '品牌力不够，玩不起这局',
        revenueKeep: brandWarRevenueKeep,
        marginAfter: grossMargin - brandWarCost,
        available: canBrandWar,
        risk: canBrandWar ? '每月多花营收 8%，换品牌溢价' : '品牌力 ' + (brandPower() * 100).toFixed(0) + '，需 55 以上'
      }
    ]
  };
}

/* 玩家做出选择 */
function resolvePriceWar(choiceId) {
  const pw = G.priceWar;
  if (!pw) return { ok: false, msg: '当前没有价格战' };
  const opts = priceWarOptions();
  const opt = opts.options.find(o => o.id === choiceId);
  if (!opt) return { ok: false, msg: '没有这个选项' };
  if (opt.available === false) return { ok: false, msg: opt.risk };

  // 影响持续 3 个月
  const months = 3;
  // 营收乘数：相对无价格战时
  addMod('revenueDelta', opt.revenueKeep - 1, months);

  if (choiceId === 'follow') {
    // 降价 25% → 毛利率直接砍掉四分之一营收
    addMod('priceWarDiscount', 0.25, months);
  } else if (choiceId === 'brand') {
    addMod('otherOpexDelta', 0.08, months);
    G.reputation = Math.min(100, G.reputation + 4);   // 投放换口碑
  }

  G.priceWar = null;
  G.priceWarHistory = G.priceWarHistory || [];
  G.priceWarHistory.push({ month: G.month, rival: pw.rival, choice: choiceId });

  const msgMap = {
    follow: '⚔️ 跟进降价：保住客流，但未来 3 个月毛利率被砍 25%',
    hold: '🛡 死撑原价：客流会流失，但每单还有利润',
    brand: '💎 品牌战：不降价，砸钱做口碑，未来 3 个月多花 8% 营收'
  };
  return { ok: true, msg: msgMap[choiceId], months };
}


/* 挖人：对手会挖你的骨干 */
function rivalsPoach() {
  if (!G.rivals || !G.rivals.length) return null;
  const strongRival = G.rivals.reduce((a, b) => a.strength > b.strength ? a : b);
  if (strongRival.strength < 1.2) return null;
  if (Math.random() > 0.06 + strongRival.strength * 0.03) return null;
  G.staff = Math.max(1, G.staff - 1);
  G.morale = Math.max(0, G.morale - 6);
  return '🎯 「' + strongRival.name + '」挖走了你一个熟手，员工 -1，士气 -6';
}
