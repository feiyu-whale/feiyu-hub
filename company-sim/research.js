/* 公司经营模拟 · 新品研发（双维度）  v3.5.0 2026-10-31 肥鱼
 *
 * 老爹原话：「番茄炒蛋食材很普通，但是品质是绝对很高的」
 *          「有两个维度的：家常是食材家常，但是还有额外的一个品质——你可以家常菜也可以达到品质传世」
 *
 * 两个维度，互相独立：
 *   ① 食材档位 → 决定投入成本（家常便宜、高端贵）
 *   ② 品质档位 → 决定难度与加成（普通容易、传世极难）
 *
 *   番茄炒蛋 = 家常食材 + 传世品质 ← 便宜材料做出顶尖手艺，这才是真本事
 *   和牛乱煎 = 高端食材 + 普通品质 ← 好料做砸，照样一般
 */

/* ═══ 维度一：食材档位（决定成本基数）═══ */
const INGREDIENT_TIERS = [
  { id: 'plain',  name: '家常食材', desc: '白菜豆腐、鸡蛋番茄、鸡胸肉', baseCost: 15000 },
  { id: 'mid',    name: '中档食材', desc: '牛羊肉、鲜虾、时令水产',     baseCost: 150000 },
  { id: 'premium',name: '高端食材', desc: '和牛、鲍参翅肚、松露',       baseCost: 1500000 }
];

/* ═══ 维度二：品质档位（决定难度与加成）═══ */
const QUALITY_TIERS = [
  { lvl: 1,  name: '能入口',   baseChance: 0.85, revBonus: 0.01, repBonus: 1,  months: 1 },
  { lvl: 2,  name: '家常好味', baseChance: 0.62, revBonus: 0.03, repBonus: 2,  months: 1 },
  { lvl: 3,  name: '街坊称赞', baseChance: 0.42, revBonus: 0.06, repBonus: 4,  months: 2 },
  { lvl: 4,  name: '一街知名', baseChance: 0.28, revBonus: 0.10, repBonus: 6,  months: 2 },
  { lvl: 5,  name: '爆款之作', baseChance: 0.18, revBonus: 0.15, repBonus: 9,  months: 3 },  // v3.5.2 改名+回归手艺路线（推广改成独立一层）
  { lvl: 6,  name: '区域招牌', baseChance: 0.11, revBonus: 0.21, repBonus: 12, months: 3 },
  { lvl: 7,  name: '口耳相传', baseChance: 0.06, revBonus: 0.28, repBonus: 16, months: 4 },
  { lvl: 8,  name: '一菜难求', baseChance: 0.03, revBonus: 0.36, repBonus: 20, months: 4 },
  { lvl: 9,  name: '远近闻名', baseChance: 0.012,revBonus: 0.45, repBonus: 25, months: 5 },
  { lvl: 10, name: '传世名菜', baseChance: 0.004,revBonus: 0.58, repBonus: 32, months: 6 }
];

/* 总成本 = 食材基数 × 品质倍数（品质越高，试错越多、报废越多）*/
function qualityCostMult(qLvl) {
  const t = QUALITY_TIERS.find(q => q.lvl === Number(qLvl));
  if (!t) return 1;
  return Math.pow(1.55, t.lvl - 1);   // 1级x1，2级x1.55，10级x~46
}

function researchCost(ingId, qLvl) {
  const ing = INGREDIENT_TIERS.find(i => i.id === ingId) || INGREDIENT_TIERS[0];
  return Math.round(ing.baseCost * qualityCostMult(qLvl) / 1000) * 1000;
}

/* 「丑但好吃」：失败里的 0.1% */
const HIDDEN_GEM_RATE = 0.001;
const HIDDEN_GEM_MULT = 2.0;

/* 门店规模系数（小店灵感多，大店标准化） */
function storeScaleFactor() {
  const n = G.stores || 1;
  if (n <= 1)  return { chance: 1.15, gem: 3.0, label: '单店·手脚自由' };
  if (n <= 5)  return { chance: 1.05, gem: 1.8, label: '小连锁' };
  if (n <= 15) return { chance: 1.00, gem: 1.0, label: '中型连锁' };
  if (n <= 30) return { chance: 0.92, gem: 0.5, label: '大连锁·开始标准化' };
  return { chance: 0.85, gem: 0.2, label: '规模化·配方锁死' };
}

/* 工艺线索：按品类给「哪里出了偏差」 */
const RESEARCH_CLUES = {
  chayin: [
    '后厨采购出了问题，买到一批不对的茶叶',
    '这批茶底换了供应商，味道偏苦',
    '奶源不太对劲，打出来不够绵',
    '糖浆配方记混了，甜度不是原来的',
    '泡茶时间没控好，涩味有点重'
  ],
  huoguo: [
    '锅底熬过头了，香味跑掉一些',
    '牛油比例放错了，辣度不太对',
    '花椒下重了，麻味压过鲜味',
    '底料炒糊了一点，带点焦味',
    '换了个酱料配比，味道偏咸'
  ],
  zhengcan: [
    '火候过了，肉有点老',
    '盐放少了，味道偏淡',
    '勾芡太厚，口感发黏',
    '火候不够，没出锅气',
    '配料顺序搞反了，香气散得早'
  ],
  kuaican: [
    '备料步骤走错，口感变了',
    '半成品放久了，不够新鲜',
    '酱料调换了，味道跟原来不一样',
    '加热时间没控好，外热内凉',
    '包装换了，闷出一股味'
  ]
};

function researchClue(seg) {
  const pool = RESEARCH_CLUES[seg] || RESEARCH_CLUES.zhengcan;
  return pool[Math.floor(Math.random() * pool.length)];
}

/* 研发投入加成（多花钱提高成功率，边际递减） */
function budgetChanceBonus(budget, baseCost) {
  const ratio = budget / Math.max(1, baseCost);
  if (ratio <= 1) return 0;
  return Math.min(0.20, Math.log(ratio) * 0.15);
}

/* 团队水平加成 */
function teamChanceBonus() {
  const rep = (G.reputation || 50) / 100;
  const mor = (G.morale || 70) / 100;
  return (rep * 0.10) + (mor * 0.08);
}

/* 发起研发 */
function startResearch(ingId, qLvl, budget) {
  const ing = INGREDIENT_TIERS.find(i => i.id === ingId);
  const q = QUALITY_TIERS.find(t => t.lvl === Number(qLvl));
  if (!ing) return { ok: false, msg: '没有这个食材档位' };
  if (!q) return { ok: false, msg: '没有这个品质等级' };
  if (G.research && G.research.length >= 2) {
    return { ok: false, msg: '团队精力有限，同时最多研发 2 道新品' };
  }

  const baseCost = researchCost(ingId, qLvl);
  const spend = Math.max(baseCost, Number(budget) || baseCost);
  if (G.cash < spend) {
    return { ok: false, msg: '现金不够，这道菜要投 ' + (baseCost / 1e4).toFixed(0) + ' 万起步' };
  }

  G.cash -= spend;
  G.research = G.research || [];
  const scale = storeScaleFactor();
  const bonus = budgetChanceBonus(spend, baseCost) + teamChanceBonus();
  // ═══ v3.5.0（2026-10-31 老爹亲定）品质不看钱，看厨师水平和运气 ═══
  //   老爹原话：「品质档位这个不看钱，看厨师的水平看运气」
  // ═══ v3.5.2（2026-10-31 老爹亲定）手艺和推广是两层，可以叠加也可单走 ═══
  //   老爹原话：「这个是可以互相叠的，一边做手艺一边推广，也可以只做手艺或者只推广」
  const chef = (typeof chefSkill === 'function') ? chefSkill() : 1.0;
  const luck = (typeof luckFactor === 'function') ? luckFactor() : 1.0;
  // 推广作为「额外加成」叠加在手艺之上（不是替代）
  const promoPower = (typeof currentPromoPower === 'function') ? currentPromoPower() : 1.0;
  const promoBoost = Math.max(0, promoPower - 1.0) * 0.35;   // 推广力 2.8 → +63%
  // 高端食材容错率高（好料不易做砸），但只是小幅加成，改变不了厨师档位
  const ingBonus = ing.id === 'premium' ? 0.12 : ing.id === 'mid' ? 0.06 : 0;
  const chance = Math.max(0.001, Math.min(0.95,
    q.baseChance * (1 + ingBonus) * scale.chance * chef * luck * (1 + promoBoost) + bonus));

  G.research.push({
    id: 'D' + Date.now() + Math.floor(Math.random() * 1000),
    ingId: ing.id, ingName: ing.name,
    lvl: q.lvl, name: q.name,
    cost: spend,
    chance: chance,
    revBonus: q.revBonus,
    repBonus: q.repBonus,
    months: q.months,
    left: q.months,
    startMonth: G.month,
    luck: luck, chefLvl: (typeof ensureChef === 'function' ? ensureChef().lvl : 0)
  });

  const routeTxt = promoBoost > 0.01
    ? '（手艺 ×' + chef.toFixed(2) + ' ＋ 推广加成 +' + (promoBoost * 100).toFixed(0) + '%）'
    : '（纯手艺路线，主厨 ×' + chef.toFixed(2) + '）';
  return { ok: true,
    msg: '开始研发「' + ing.name + '·' + q.name + '」' + routeTxt + '，投入 ' + (spend / 1e4).toFixed(1) +
         ' 万，预计 ' + q.months + ' 个月，成功率约 ' + (chance * 100).toFixed(0) + '%' };
}

/* 每月推进研发 */
function tickResearch() {
  if (!G.research || !G.research.length) return [];
  const events = [];
  const keep = [];

  G.research.forEach(r => {
    r.left--;
    if (r.left > 0) { keep.push(r); return; }

    const roll = Math.random();
    let kind, revBonus, repBonus;
    if (roll < r.chance) {
      kind = 'genuine'; revBonus = r.revBonus; repBonus = r.repBonus;
    } else {
      const gemRate = HIDDEN_GEM_RATE * storeScaleFactor().gem;
      if (Math.random() < gemRate) {
        kind = 'gem'; revBonus = r.revBonus * HIDDEN_GEM_MULT; repBonus = r.repBonus * HIDDEN_GEM_MULT;
      } else {
        kind = 'fail'; revBonus = -r.revBonus; repBonus = -0.5;
      }
    }

    G.dishes = G.dishes || [];
    G.dishes.push({
      name: r.ingName + '·' + r.name,
      ingId: r.ingId, lvl: r.lvl,
      revBonus: revBonus, repBonus: repBonus,
      kind: kind,
      onMenu: false,
      soldMonths: 0,
      createdMonth: G.month
    });

    const clue = researchClue(G.seg);
    events.push({ type: 'info',
      text: '🍽️ 新品「' + r.ingName + '·' + r.name + '」研发完成，口感挺独特。' + clue + '——要不要上架，你自己拿注意' });
  });

  G.research = keep;

  if (G.research.length > 0) {
    events.push({ type: 'info',
      text: '🧪 研发进行中（' + G.research.length + ' 道），团队分心试菜，当月效率略降' });
  }

  return events;
}

/* 上架/下架 */
function toggleDishOnMenu(idx) {
  if (!G.dishes || !G.dishes[idx]) return { ok: false, msg: '没这道菜' };
  const d = G.dishes[idx];
  d.onMenu = !d.onMenu;
  if (d.onMenu) {
    if (d.kind === 'fail') {
      G.reputation = Math.max(0, (G.reputation || 50) - 0.5);
      return { ok: true, msg: '「' + d.name + '」已上架。不过第一批客人反应怪怪的……口碑 -0.5' };
    }
    return { ok: true, msg: '「' + d.name + '」已上架' };
  }
  return { ok: true, msg: '「' + d.name + '」已下架' };
}

/* 每月上架菜反馈 */
function menuFeedback() {
  const onMenu = (G.dishes || []).filter(d => d.onMenu);
  if (!onMenu.length) return null;
  onMenu.forEach(d => { d.soldMonths = (d.soldMonths || 0) + 1; });

  const bad = onMenu.filter(d => d.kind === 'fail' && d.soldMonths >= 2);
  if (bad.length) {
    G.reputation = Math.max(0, (G.reputation || 50) - bad.length * 0.5);
    return { type: 'bad',
      text: '😐 有客人说「' + bad[0].name + '」味道跟名字对不上，复购少了' };
  }
  const gem = onMenu.filter(d => d.kind === 'gem' && d.soldMonths >= 3);
  if (gem.length && gem[0].soldMonths === 3) {
    return { type: 'good',
      text: '🌟 奇了——「' + gem[0].name + '」看着不咋样，却有人专程为它来！' };
  }
  return null;
}

/* 招牌菜总加成（只算已上架） */
function dishRevBonus() {
  const onMenu = (G.dishes || []).filter(d => d.onMenu);
  if (!onMenu.length) return 0;
  const positives = onMenu.filter(d => d.revBonus > 0).map(d => d.revBonus).sort((a, b) => b - a);
  const negatives = onMenu.filter(d => d.revBonus < 0).reduce((s, d) => s + d.revBonus, 0);
  let total = 0;
  if (positives.length) {
    total = positives[0] || 0;
    for (let i = 1; i < positives.length; i++) total += positives[i] * Math.pow(0.5, i);
  }
  total += negatives;
  return Math.max(-0.5, Math.min(0.80, total));
}

/* 研发分心惩罚 */
function researchDistraction() {
  const n = (G.research || []).length;
  return 1 - Math.min(0.06, n * 0.03);
}

if (typeof module !== 'undefined') module.exports = {
  INGREDIENT_TIERS, QUALITY_TIERS, researchCost, qualityCostMult,
  startResearch, tickResearch, dishRevBonus, researchDistraction,
  budgetChanceBonus, teamChanceBonus, toggleDishOnMenu, menuFeedback,
  storeScaleFactor, researchClue,
  HIDDEN_GEM_RATE, HIDDEN_GEM_MULT
};
