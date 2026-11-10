/* 公司经营模拟 · 人的因素引擎  v3.0.0 2026-10-25 肥鱼
 *
 * 现实逻辑（人是最大的变量，也是最说不准的那个）：
 *  ① 合伙人不是永远跟你一条心 —— 他也有自己的算盘
 *  ② 员工忠诚不是买来的，是处出来的；亏钱的店，谁都留不住
 *  ③ 家族介入是中国式创业最真实的一关：
 *     「你妈塞了你表弟来当店长」——损耗率 +50%，还辞不掉
 *
 *  这些不是当场爆发的，是埋着的雷；
 *  触发条件：连续亏损 / 违法操作 / 扩张太快
 */

/* ═══ 合伙人 ═══ */
function initPartner() {
  if (G.partner) return G.partner;
  // 有合伙人 = 有启动资金，但股权被分走
  G.partner = {
    name: '老周',
    equity: 0.35,          // 占股 35%
    ambition: 40 + Math.random() * 40,   // 野心值 40~80（隐藏）
    loyalty: 50 + Math.random() * 40,    // 忠诚度 50~90（隐藏）
    monthsTogether: 0,
    splitEvent: false
  };
  return G.partner;
}

/* 每月更新合伙人心态（隐藏属性，玩家看不到数值） */
function partnerMonthly(netProfit) {
  const pt = G.partner;
  if (!pt || pt.splitEvent) return null;

  pt.monthsTogether++;

  // 赚钱 → 忠诚涨；亏钱 → 忠诚掉、野心涨
  if (netProfit > 0) {
    pt.loyalty = Math.min(100, pt.loyalty + 1.2);
    pt.ambition = Math.max(0, pt.ambition - 0.4);
  } else {
    pt.loyalty = Math.max(0, pt.loyalty - 2.0);
    pt.ambition = Math.min(100, pt.ambition + 1.5);
  }

  // 连续亏损 → 加速
  if (G.monthsNegProfit >= 3) {
    pt.loyalty = Math.max(0, pt.loyalty - 2.5);
    pt.ambition = Math.min(100, pt.ambition + 2.0);
  }

  // 玩家搞违法操作 → 合伙人怕被牵连
  const illegalCount = Object.values(G.illegalActs || {}).filter(Boolean).length;
  if (illegalCount > 0) {
    pt.loyalty = Math.max(0, pt.loyalty - illegalCount * 1.5);
  }

  // 公司做大了，他也想自己当老板
  if (G.stores >= 10) pt.ambition = Math.min(100, pt.ambition + 0.8);

  // ═══ 分家判定 ═══
  //  野心高 + 忠诚低 → 随时可能摊牌
  const splitRisk = (pt.ambition - pt.loyalty) / 100;
  if (splitRisk > 0.25 && Math.random() < splitRisk * 0.12) {
    pt.splitEvent = true;
    return triggerSplit();
  }
  return null;
}

/* 分家：带走多少，看他的股比和你的现金 */
function triggerSplit() {
  const pt = G.partner;
  // 分家方式：带走现金（按股比 + 溢价）或者拉走团队
  const cashTake = Math.max(0, G.cash) * pt.equity * (1.0 + Math.random() * 0.3);
  const teamTake = Math.max(1, Math.round(G.staff * 0.15));
  return {
    type: 'partner_split',
    cashTake,
    teamTake,
    text: '🤝💔 合伙人「' + pt.name + '」提出分家：' +
          '他要带走 ' + (cashTake / 1e4).toFixed(1) + ' 万现金（' +
          (pt.equity * 100).toFixed(0) + '% 股权）和 ' + teamTake + ' 个人。' +
          '「这生意我干不下去了」',
    options: [
      {
        id: 'accept',
        name: '同意分家',
        desc: '现金和人都被带走，但公司还能继续',
        apply: () => {
          G.cash -= cashTake;
          G.staff = Math.max(1, G.staff - teamTake);
          G.morale = Math.max(0, G.morale - 10);
          if (G.cash < 0) G.status = 'bankrupt';
          return '同意分家：现金 -' + (cashTake / 1e4).toFixed(1) + ' 万，员工 -' + teamTake +
                 ' 人。公司还在，但你少了一个人扛';
        }
      },
      {
        id: 'buyout',
        name: '出钱买断他的股份',
        desc: '按估值溢价回购，保住公司完整',
        apply: () => {
          const p = P();
          const val = G.stores * p.setupCost * 0.7 + Math.max(0, G.cash);
          const buyCost = val * pt.equity * 1.3;
          if (G.cash < buyCost) {
            // 买不起 → 只能被动接受分家
            G.cash -= cashTake;
            G.staff = Math.max(1, G.staff - teamTake);
            G.morale = Math.max(0, G.morale - 10);
            if (G.cash < 0) G.status = 'bankrupt';
            return '💸 想买断但现金不够（需 ' + (buyCost / 1e4).toFixed(1) +
                   ' 万），只能眼睁睁看他分家走人';
          }
          G.cash -= buyCost;
          G.ownership = Math.min(1, (G.ownership || 1) + pt.equity);
          return '💰 花 ' + (buyCost / 1e4).toFixed(1) + ' 万买断他的 ' +
                 (pt.equity * 100).toFixed(0) + '% 股权，公司完整了，但现金大出血';
        }
      }
    ]
  };
}

/* ═══ 员工忠诚 ═══ */
function staffLoyalty() {
  // 忠诚 = 士气 + 按时发薪 + 赚钱
  let loy = G.morale;
  if (G.arrears > 0) loy -= 30;         // 欠薪
  if (G.monthsNegProfit >= 3) loy -= 15;
  if (G.laborIllegal) loy -= 20;        // 黑工（怕被查）
  return Math.max(0, Math.min(100, loy));
}

/* ═══ 家族介入（老爹特别中意的那条）═══ */
function familyIntervention() {
  if (G.hasRelativeManager) return null;
  // 触发条件：公司有起色（店 ≥ 3 或 现金 > 100 万），亲戚开始"帮忙"
  if (G.stores < 3 && G.cash < 1000000) return null;
  if (Math.random() > 0.05) return null;

  return {
    type: 'family',
    text: '👵 「你妈打电话来：你表弟在家闲着，去你店里帮帮忙，学点东西。」',
    options: [
      {
        id: 'accept_relative',
        name: '收下表弟',
        desc: '人情过不去。他是店长，但你使唤不动他',
        apply: () => {
          G.hasRelativeManager = true;
          G.relativeMonths = 3;
          return '表弟到岗当店长。门店损耗率 +50%，而且这 3 个月你辞不掉他';
        }
      },
      {
        id: 'refuse_relative',
        name: '婉拒',
        desc: '顶住人情压力，但家里会不高兴',
        apply: () => {
          G.familyPressure = (G.familyPressure || 0) + 1;
          G.morale = Math.max(0, G.morale - 3);
          return '婉拒了。你妈三天没理你，家里气氛微妙';
        }
      }
    ]
  };
}

/* 家族经理每月影响（3 个月后可以辞退） */
function relativeMonthly() {
  if (!G.hasRelativeManager) return null;
  G.relativeMonths = (G.relativeMonths || 0) - 1;
  if (G.relativeMonths <= 0) {
    G.hasRelativeManager = false;
    return '👋 表弟自己待不下去走了。损耗终于正常了';
  }
  return null;
}

/* ═══ 主厨带团队出走 ═══ */
function chefLeaveCheck() {
  const loy = staffLoyalty();
  if (loy > 40) return null;
  if (Math.random() > (40 - loy) / 100 * 0.15) return null;
  const leave = Math.max(1, Math.round(G.staff * 0.25));
  return {
    type: 'chef_leave',
    text: '👨‍🍳💨 主厨带着 ' + leave + ' 个熟手走了，隔壁街开了家新店，' +
          '招牌菜跟你一模一样',
    apply: () => {
      G.staff = Math.max(1, G.staff - leave);
      G.morale = Math.max(0, G.morale - 15);
      G.reputation = Math.max(0, G.reputation - 8);
      addMod('revenueDelta', -0.18, 4);
      return '员工 -' + leave + '，士气 -15，口碑 -8，未来 4 个月营收 -18%';
    }
  };
}

if (typeof module !== 'undefined') module.exports = {
  initPartner, partnerMonthly, triggerSplit, staffLoyalty,
  familyIntervention, relativeMonthly, chefLeaveCheck
};
