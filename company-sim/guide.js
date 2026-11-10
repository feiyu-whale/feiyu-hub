/* 公司经营模拟 · 引导与诊断系统  v3.0.1 2026-10-25 肥鱼
 *
 * 缘起（老爹 01:35）：「加一些引导，毕竟正常创业好歹也有信息」
 *         （老爹 01:34）：「我怎么玩两局就稀里糊涂就死掉了？」
 *
 * 真实逻辑：现实里创业者不是瞎蒙的 ——
 *   他每天都在看账、看流水、听员工说、看隔壁生意
 *   所以他知道钱花在哪、还剩几个月、哪里出了毛病
 *
 * 这个模块干三件事：
 *   ① 生存预警：按当前烧钱速度，还能撑几个月
 *   ② 人话诊断：这个月为什么亏 / 为什么赚，一句话说清
 *   ③ 开局引导：前几个月把每个指标是什么意思讲一遍
 */

/* ═══ ① 生存预警：还能撑几个月 ═══ */
function survivalCheck() {
  const h = G.history || [];
  if (!h.length) return null;

  // 最近 3 个月平均现金流（营收入账 - 实际支出）
  const recent = h.slice(-3);
  let cashFlowSum = 0;
  recent.forEach(l => {
    const income = (l.items || []).filter(x => x[2] === 'in').reduce((s, x) => s + x[1], 0);
    const outgo = (l.items || []).filter(x => x[2] === 'out').reduce((s, x) => s + x[1], 0);
    cashFlowSum += (income - outgo);
  });
  const avgCashFlow = cashFlowSum / recent.length;

  // 现金流为正 → 不需要预警
  if (avgCashFlow >= 0) {
    return { healthy: true, avgCashFlow, monthsLeft: Infinity, level: 'good' };
  }

  const monthsLeft = Math.max(0, G.cash / -avgCashFlow);

  let level, text;
  if (monthsLeft <= 1) {
    level = 'critical';
    text = '🚨 按现在的烧钱速度，你的现金撑不过下个月（每月净流出 ' +
           (Math.abs(avgCashFlow) / 1e4).toFixed(1) + ' 万）';
  } else if (monthsLeft <= 3) {
    level = 'danger';
    text = '⚠️ 现金只够撑 ' + monthsLeft.toFixed(1) + ' 个月（每月净流出 ' +
           (Math.abs(avgCashFlow) / 1e4).toFixed(1) + ' 万）。要么找钱，要么砍成本，要么改生意';
  } else if (monthsLeft <= 6) {
    level = 'warning';
    text = '📉 按现在这个速度，现金还能撑 ' + monthsLeft.toFixed(1) + ' 个月。不算急，但趋势不对';
  } else {
    level = 'watch';
    text = '👀 目前还在亏（每月 ' + (Math.abs(avgCashFlow) / 1e4).toFixed(1) +
           ' 万），但账上的钱够撑 ' + monthsLeft.toFixed(0) + ' 个月，还有调整空间';
  }

  return { healthy: false, avgCashFlow, monthsLeft, level, text };
}

/* ═══ ② 人话诊断：这个月到底怎么了 ═══ */
function diagnoseMonth(log) {
  const p = P();
  const rev = log.revenue || 0;
  const profit = log.netProfit || 0;
  const items = log.items || [];

  const get = (name) => {
    const it = items.find(x => x[0] === name);
    return it ? it[1] : 0;
  };

  const food = get('食材成本');
  const staff = get('人工成本');
  const rent = get('房租');
  const util = get('水电');
  const opex = get('其他运营成本');
  const dep = get('折旧摊销');
  const entropy = get('组织内耗（看不见的出血）');

  // 单店基准营收（用来判断客流够不够）
  const baseRev = p.revenue * G.stores;
  const revRatio = baseRev > 0 ? rev / baseRev : 0;
  const trafficDesc = revRatio >= 1.05 ? '客流比预期好'
                    : revRatio >= 0.9 ? '客流基本达标'
                    : revRatio >= 0.75 ? '客流只有预期的七成左右'
                    : revRatio >= 0.6 ? '客流明显不足，只有预期的六成'
                    : '客流惨淡，不到预期的一半';

  const lines = [];

  // ① 赚钱还是亏钱
  if (profit >= 0) {
    lines.push('✅ 这个月赚了 <b>' + (profit / 1e4).toFixed(1) + ' 万</b>，' + trafficDesc);
  } else {
    lines.push('❌ 这个月亏了 <b>' + (Math.abs(profit) / 1e4).toFixed(1) + ' 万</b>，' + trafficDesc);
  }

  // ② 亏在哪儿 / 赚在哪儿（按成本占比排前两名）
  const costs = [
    { name: '食材', v: food },
    { name: '人工', v: staff },
    { name: '房租', v: rent },
    { name: '水电', v: util },
    { name: '其他运营', v: opex },
    { name: '折旧', v: dep }
  ].filter(c => c.v > 0).sort((a, b) => b.v - a.v);

  if (costs.length && rev > 0) {
    const top = costs[0];
    const second = costs[1];
    let costLine = '最大的两块支出是<b>' + top.name + '（' +
      (top.v / 1e4).toFixed(1) + ' 万，占营收 ' + ((top.v / rev) * 100).toFixed(0) + '%）</b>';
    if (second) {
      costLine += '和<b>' + second.name + '（' + (second.v / 1e4).toFixed(1) +
        ' 万，占营收 ' + ((second.v / rev) * 100).toFixed(0) + '%）</b>';
    }
    lines.push(costLine + '。');
  }

  // ③ 固定成本压力（这是餐饮最常见的死法）
  const fixedCost = staff + rent + util;
  if (rev > 0 && fixedCost > 0) {
    const fixedRatio = fixedCost / rev;
    if (fixedRatio > 0.6) {
      lines.push('⚠️ 房租+人工+水电占了营收的 <b>' + (fixedRatio * 100).toFixed(0) +
        '%</b>，这是典型的「固定成本过重」—— 客流一掉就立刻亏，因为钱是雷打不动要出的。');
    } else if (fixedRatio > 0.45) {
      lines.push('房租+人工+水电占营收 ' + (fixedRatio * 100).toFixed(0) + '%，偏高但在行业常见范围。');
    }
  }

  // ④ 隐性出血
  if (entropy > 0) {
    lines.push('🕳 有 ' + (entropy / 1e4).toFixed(1) +
      ' 万是「组织内耗」流失的 —— 店多没总部、没公司化，钱在不知不觉里漏掉。');
  }

  // ⑤ 口碑和士气
  if (G.reputation < 45) {
    lines.push('😞 口碑只有 ' + G.reputation.toFixed(0) + ' 分，客人不愿意来，这是客流上不去的主因。');
  } else if (G.reputation < 55) {
    lines.push('😐 口碑 ' + G.reputation.toFixed(0) + ' 分，不算好，回头客少。');
  }
  if (G.morale < 45) {
    lines.push('😩 士气只有 ' + G.morale.toFixed(0) + ' 分，员工状态差，服务和出品都在往下走。');
  }

  // ⑥ 库存损耗
  if (G.inventory > 0) {
    const invDays = food > 0 ? (G.inventory / food * 30) : 0;
    if (invDays > 25) {
      lines.push('📦 冷库里压着约 ' + invDays.toFixed(0) + ' 天的货（' +
        (G.inventory / 1e4).toFixed(1) + ' 万），钱压在那里，还在慢慢烂。');
    }
  }

  return lines;
}

/* ═══ ③ 开局引导 ═══ */
const TUTORIAL_STEPS = [
  {
    month: 1,
    title: '第 1 个月：先看明白这几个数',
    lines: [
      '👀 <b>现金流</b>是你最该盯的东西：账上还有多少钱，每月是进还是出。',
      '🍽 <b>客流</b>决定营收。新店要爬坡，前几个月客流不满是正常的。',
      '😊 <b>口碑</b>影响客人愿不愿意来，<b>士气</b>影响员工愿不愿意干。',
      '💡 这个月没别的事，就看一眼报表，知道钱是怎么流动的。'
    ]
  },
  {
    month: 2,
    title: '第 2 个月：看懂成本结构',
    lines: [
      '💰 餐饮的钱主要花在三块：<b>食材（随卖随花）</b>、<b>人工（固定要发）</b>、<b>房租（雷打不动）</b>。',
      '⚠️ 人工和房租是<b>固定成本</b> —— 生意差的时候不会跟着降，这就是为什么客流一掉就亏。',
      '📊 打开「报表」按钮，能看到最近 12 个月的累计情况。'
    ]
  },
  {
    month: 3,
    title: '第 3 个月：开始做决定',
    lines: [
      '🏗 <b>开新店</b>能放大营收，但也会放大成本和风险：开店要压现金、加折旧、加工资。',
      '🏦 <b>贷款</b>能救急，但月供是雷打不动的。借钱扩张 = 用压力换速度。',
      '🤝 隔壁同行会打价格战，到时候你要选：跟着降、还是死撑。<b>品牌力够强才能不跟。</b>',
      '💡 从第 4 个月开始，就靠你自己判断了。'
    ]
  }
];

function tutorialFor(month) {
  return TUTORIAL_STEPS.find(t => t.month === month) || null;
}

/* ═══ ④ 决策提示：什么时候该提醒玩家做什么 ═══ */
function decisionHints() {
  const hints = [];
  const s = survivalCheck();

  // 现金快断
  if (s && !s.healthy && s.monthsLeft <= 3) {
    hints.push({
      type: 'urgent',
      text: '💰 现金撑不住 3 个月了。可以考虑：① 申请贷款 ② 砍掉不赚钱的开支 ③ 清库存换现金'
    });
  }

  // 可贷额度没用上
  const avail = creditLimit() - totalDebt();
  if (avail > 300000 && G.cash < P().setupCost) {
    hints.push({
      type: 'info',
      text: '🏦 你还有 ' + (avail / 1e4).toFixed(0) + ' 万可贷额度没动。现金紧张时可以拿来周转'
    });
  }

  // 店多了但没建组织
  if (G.stores >= 10 && !G.hasHQ) {
    hints.push({
      type: 'warn',
      text: '🏢 你有 ' + G.stores + ' 家店但还没建总部 —— 采购没议价权，各店管不住，风险在持续累积'
    });
  }
  if (G.stores >= 30 && !G.hasCompany) {
    hints.push({
      type: 'warn',
      text: '🏛️ 已经 ' + G.stores + ' 家店还没公司化 —— 开不了发票、接不住大客户、随时可能被查'
    });
  }

  // 口碑低
  if (G.reputation < 40) {
    hints.push({
      type: 'warn',
      text: '😞 口碑掉到 ' + G.reputation.toFixed(0) + ' 分了，客流已经明显受影响。想想是不是出品或服务出了岔子'
    });
  }

  // 库存积压
  if (G.inventory > 0 && P().revenue > 0) {
    const food = P().revenue * G.stores * P().foodCostRate;
    if (G.inventory / food > 1.2) {
      hints.push({
        type: 'info',
        text: '📦 库存压太多了（够卖一个多月），生鲜会一直烂。可以考虑清一部分库存换现金'
      });
    }
  }

  return hints;
}

if (typeof module !== 'undefined') module.exports = {
  survivalCheck, diagnoseMonth, TUTORIAL_STEPS, tutorialFor, decisionHints
};
