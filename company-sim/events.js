/* 公司经营模拟 · 随机事件库
 * 原则：事件只是"什么时候来"的随机，不是"合不合理"的随机
 * 每条事件都对应真实商业中会发生的事
 * 2026-10-24 肥鱼
 */

const EVENTS = [
  // ── 现金流类（最常见，也最要命）──
  {
    id: 'big_customer_late',
    weight: 12,
    cond: g => g.seg !== 'chayin',
    title: '大客户拖欠货款',
    text: '一家团购平台/企业客户说"下个月一起结"，欠了 {amount} 元。',
    effect: g => {
      const amt = Math.round(g.revenueLast * 0.35);
      return { cash: 0, receivables: [{ amount: amt, dueMonth: g.month + 2 }],
               text: '应收账款 +' + (amt / 1e4).toFixed(1) + ' 万（2 个月后到账）' };
    }
  },
  {
    id: 'supplier_price_up',
    weight: 15,
    cond: () => true,
    title: '原材料涨价',
    text: '主料进货价上涨 {pct}%，供应商说全行业都涨。',
    effect: g => {
      const pct = 5 + Math.round(Math.random() * 10);
      return { foodCostDelta: pct / 100, months: 3,
               text: '食材成本率 +' + pct + '%，持续 3 个月' };
    }
  },
  {
    id: 'landlord_raise',
    weight: 10,
    cond: () => true,
    title: '房东要涨租',
    text: '房东说周边行情涨了，要涨 {pct}%。可以谈，但谈不成最多涨 20%。',
    effect: g => {
      const pct = 8 + Math.round(Math.random() * 12);
      return { rentDelta: pct / 100, months: 999,
               text: '房租 +' + pct + '%（长期）' };
    }
  },
  {
    id: 'health_inspection',
    weight: 8,
    cond: g => g.seg !== 'chayin',
    title: '卫生检查不合格',
    text: '抽查发现后厨问题，罚款 {amt} 元，并要停业整改半个月。',
    effect: g => {
      const amt = 5000 + Math.round(Math.random() * 15000);
      return { cash: -amt, revenueDelta: -0.15, months: 1, reputation: -8,
               text: '罚款 ' + (amt / 1e4).toFixed(1) + ' 万，当月营收 -15%，口碑 -8' };
    }
  },
  {
    id: 'viral_review',
    weight: 7,
    cond: () => true,
    title: '被博主探店',
    text: '一个美食博主来拍视频，火了。这个月客流明显上涨。',
    effect: g => ({ revenueDelta: 0.35, months: 1, reputation: 10,
                    text: '当月营收 +35%，口碑 +10' })
  },
  {
    id: 'bad_review',
    weight: 9,
    cond: () => true,
    title: '差评上热搜',
    text: '有顾客发帖说在菜里吃出异物，转发过万。',
    effect: g => ({ revenueDelta: -0.25, months: 2, reputation: -12,
                    text: '连续 2 个月营收 -25%，口碑 -12（真实：热搜会退，但老客会记得一阵）' })
  },
  {
    id: 'key_staff_quit',
    weight: 10,
    cond: g => g.morale < 60,
    title: '骨干想跳槽',
    text: '店长/主厨被同行挖角，开价高出 40%。留他要加工资，不留他要重新招人。',
    choice: true,
    options: [
      { label: '加薪留下', effect: g => ({ staffDelta: 3000, morale: 5,
          text: '人工成本每月 +3000，士气 +5' }) },
      { label: '放他走', effect: g => ({ morale: -10, reputation: -5, revenueDelta: -0.1, months: 1,
          text: '士气 -10，口碑 -5，当月营收 -10%' }) }
    ]
  },
  {
    id: 'equipment_break',
    weight: 11,
    cond: () => true,
    title: '设备坏了',
    text: '主设备突然故障，必须当天修或换新。',
    choice: true,
    options: [
      { label: '花钱换新（贵但省心）', effect: g => ({ cash: -60000,
          text: '支出 6 万，设备更新' }) },
      { label: '凑合修（便宜但会再坏）', effect: g => ({ cash: -15000, revenueDelta: -0.1, months: 1,
          text: '支出 1.5 万，当月营收 -10%' }) }
    ]
  },
  {
    id: 'competitor_open',
    weight: 9,
    cond: () => true,
    title: '隔壁开了同行',
    text: '同品类连锁品牌在附近开店，打价格战。',
    effect: g => ({ revenueDelta: -0.15, months: 3,
                    text: '连续 3 个月营收 -15%' })
  },
  {
    id: 'tax_check',
    weight: 6,
    cond: () => true,
    title: '税务稽查',
    text: '税务局来查账，发现几笔账没规范，要补缴。',
    effect: g => {
      const amt = Math.round(g.revenueLast * 0.06);
      return { cash: -amt, text: '补缴税费 ' + (amt / 1e4).toFixed(1) + ' 万' };
    }
  },
  {
    id: 'good_location',
    weight: 6,
    cond: g => g.stores < 3,
    title: '好铺位空出来了',
    text: '附近一个黄金铺位转让，转让费 {fee} 万，位置比现在好得多。',
    choice: true,
    options: [
      { label: '拿下', effect: g => ({ cash: -400000, revenueDelta: 0.15, months: 999,
          text: '支出 40 万，长期营收 +15%' }) },
      { label: '算了', effect: () => ({ text: '放弃机会' }) }
    ]
  },
  {
    id: 'rent_free_month',
    weight: 5,
    cond: () => true,
    title: '房东主动减租',
    text: '房东说看你们生意不错，愿意免一个月房租，换长期合同。',
    effect: g => ({ cash: g.revenueLast * 0.2, text: '收到一个月房租等值 ' + ((g.revenueLast * 0.2) / 1e4).toFixed(1) + ' 万' })
  },
  {
    id: 'staff_dispute',
    weight: 8,
    cond: g => g.staff >= 4,
    title: '员工闹加薪',
    text: '几个员工抱团要求涨薪，不然集体辞职。',
    choice: true,
    options: [
      { label: '全涨 8%', effect: g => ({ staffRateDelta: 0.08, morale: 10,
          text: '人工成本率 +8%，士气 +10' }) },
      { label: '只涨骨干', effect: g => ({ staffRateDelta: 0.03, morale: -5,
          text: '人工成本率 +3%，士气 -5' }) },
      { label: '一个不涨', effect: g => ({ morale: -20, revenueDelta: -0.15, months: 1,
          text: '士气 -20，当月营收 -15%' }) }
    ]
  }
];

/* 按权重抽事件（排除本月已经出过的） */
function pickEvent(g, usedIds) {
  const pool = EVENTS.filter(e => !usedIds.has(e.id) && (!e.cond || e.cond(g)));
  if (!pool.length) return null;
  const total = pool.reduce((s, e) => s + e.weight, 0);
  let r = Math.random() * total;
  for (const e of pool) {
    r -= e.weight;
    if (r <= 0) return e;
  }
  return pool[pool.length - 1];
}
