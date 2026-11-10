/* 公司经营模拟 · 厨师系统  v3.5.0 2026-10-31 肥鱼
 *
 * 老爹原话：「品质档位这个不看钱，看厨师的水平看运气」
 *          「厨师有概率跳槽」
 *
 * 核心逻辑：
 *   ① 品质不靠砸钱，靠厨子手艺 + 运气
 *   ② 厨子分五级，等级越高月薪越贵、越难留
 *   ③ 每月有跳槽概率，忠诚度低/薪水低/士气差 → 概率高
 *   ④ 主厨跑了 = 招牌菜研发能力断档，还带走熟手
 */

const CHEF_LEVELS = [
  { lvl: 1, name: '学徒',   wage: 6000,   skill: 0.60, desc: '刚上手，只会按菜谱来' },
  { lvl: 2, name: '熟手',   wage: 12000,  skill: 0.85, desc: '常规菜都能做，缺一点灵气' },
  { lvl: 3, name: '好厨',   wage: 25000,  skill: 1.10, desc: '有手感，能出好菜' },
  { lvl: 4, name: '名厨',   wage: 60000,  skill: 1.40, desc: '本地有名气，能创招牌' },
  { lvl: 5, name: '大师',   wage: 150000, skill: 1.80, desc: '一辈子碰不到几个，传世菜只能靠他' }
];

/* 初始化主厨 */
function initChef(level) {
  const lvl = Number(level) || 2;
  const t = CHEF_LEVELS.find(c => c.lvl === lvl) || CHEF_LEVELS[1];
  G.chef = {
    lvl: t.lvl,
    name: t.name,
    wage: t.wage,
    skill: t.skill,
    loyalty: 55 + Math.random() * 30,   // 忠诚 55~85（隐藏）
    seasons: 0,                          // 干了几个季度
    poached: 0                           // 被挖过几次
  };
  return G.chef;
}

/* 确保有主厨 */
function ensureChef() {
  if (!G.chef) initChef(2);
  return G.chef;
}

/* 当前厨师技能系数（供 research 用） */
function chefSkill() {
  const c = ensureChef();
  return c.skill;
}

/* 运气系数：每次研发单独掷一次
 *  0.7 ~ 1.3，均值 1.0（正态味道，两头罕见）
 */
function luckFactor() {
  const r = Math.random() + Math.random() + Math.random();   // 近似正态 0~3，均值 1.5
  return 0.7 + (r / 3) * 0.6;   // 0.7 ~ 1.3
}

/* 厨师升级（花钱送培训） */
function trainChef() {
  const c = ensureChef();
  if (c.lvl >= 5) return { ok: false, msg: '已经是大师了，没得升' };
  const next = CHEF_LEVELS.find(x => x.lvl === c.lvl + 1);
  const cost = next.wage * 12;   // 一年工资当培训费
  if (G.cash < cost) return { ok: false, msg: '培训费要 ' + (cost / 1e4).toFixed(0) + ' 万，现金不够' };
  G.cash -= cost;
  // 升级有失败概率（越高级越难）
  const succRate = [0, 0.85, 0.65, 0.40, 0.20][c.lvl] || 0.2;
  if (Math.random() < succRate) {
    c.lvl = next.lvl; c.name = next.name; c.wage = next.wage; c.skill = next.skill;
    c.loyalty = Math.min(100, c.loyalty + 10);
    return { ok: true, msg: '🎉 厨师升到「' + next.name + '」了！月薪涨到 ' + (next.wage / 1e4).toFixed(1) + ' 万' };
  }
  return { ok: true, msg: '培训完了，但火候还是差点，没升级（钱花了 ' + (cost / 1e4).toFixed(0) + ' 万）' };
}

/* 每月跳槽检查 */
function chefPoachCheck() {
  const c = ensureChef();
  c.seasons++;

  // 忠诚度修正：士气低、口碑差 → 忠诚掉
  const mor = G.morale || 70;
  const rep = G.reputation || 50;
  if (mor < 50) c.loyalty -= 3;
  if (rep < 40) c.loyalty -= 2;
  if (mor > 75) c.loyalty += 1;
  c.loyalty = Math.max(0, Math.min(100, c.loyalty));

  // 跳槽概率：等级越高越容易被挖
  const baseRisk = [0, 0.02, 0.04, 0.08, 0.15, 0.25][c.lvl] || 0.05;
  const loyaltyMod = (100 - c.loyalty) / 100;      // 忠诚越低越危险
  const risk = baseRisk * (0.4 + loyaltyMod * 1.6);

  if (Math.random() < risk) {
    const leave = Math.max(1, Math.round((G.staff || 5) * 0.2));
    const oldName = c.name;
    const oldLvl = c.lvl;
    // 换成一等级的主厨（降级替补）
    initChef(Math.max(1, oldLvl - 1));
    G.chef.loyalty = 50;
    G.staff = Math.max(1, (G.staff || 5) - leave);
    G.morale = Math.max(0, (G.morale || 70) - 12);
    addMod('revenueDelta', -0.12, 3);
    return {
      type: 'bad',
      text: '👨‍🍳💨 「' + oldName + '」主厨被同行挖走了（开了高 50% 的价）！带走 ' + leave +
            ' 个熟手，士气 -12，未来 3 个月营收 -12%。临时找了个 ' + G.chef.name + ' 顶上'
    };
  }

  // 没跳槽，但可能要求涨薪
  if (c.loyalty < 40 && Math.random() < 0.25) {
    c.wage = Math.round(c.wage * 1.15);
    c.loyalty += 15;
    return {
      type: 'info',
      text: '💰 「' + c.name + '」说外面有人请他，要求涨薪 —— 涨了 15%，月薪 ' + (c.wage / 1e4).toFixed(1) + ' 万'
    };
  }

  return null;
}

if (typeof module !== 'undefined') module.exports = {
  CHEF_LEVELS, initChef, ensureChef, chefSkill, luckFactor,
  trainChef, chefPoachCheck
};
