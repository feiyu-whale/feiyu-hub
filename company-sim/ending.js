/* 公司经营模拟 · 结算体验（判决书 / 打工还债）  v3.0.0 2026-10-25 肥鱼
 *
 * 现实逻辑：
 *  ① 被抓不是 "Game Over"，是一纸判决书 —— 罪名按你实际干过的事生成
 *  ② 破产不是重新开始 —— 是一屁股债，然后去打工，每月工资还债
 *  ③ 算给玩家看：要还多少年。这才是"负翁"的真实体感
 */

/* ═══ 罪名库（按实际触发的违法项生成）═══ */
const CRIME_LIBRARY = {
  fake:      { name: '生产、销售伪劣产品罪', law: '刑法第一百四十条', min: 2, max: 7, fine: 0.5 },
  blackLabor:{ name: '强迫劳动罪',           law: '刑法第二百四十四条', min: 1, max: 3, fine: 0.2 },
  taxEvade:  { name: '逃税罪',               law: '刑法第二百零一条', min: 1, max: 6, fine: 1.0 },
  underTable:{ name: '行贿罪',               law: '刑法第三百八十九条', min: 1, max: 10, fine: 1.5 },
  fireDeath: { name: '重大责任事故罪',       law: '刑法第一百三十四条', min: 2, max: 7, fine: 0.3 },
  loanShark: { name: '非法吸收公众存款罪',   law: '刑法第一百七十六条', min: 1, max: 10, fine: 2.0 }
};

/* 违法项 → 罪名映射（天网恢恢：按真实案由归类） */
const ACT_TO_CRIME = {
  oil:   'fake',
  labor: 'blackLabor',
  tax:   'taxEvade',
  fake:  'fake'
};

/* 生成判决书（天网恢恢版：按真实量刑维度算）
 * 量刑维度：
 *   ① 罪名数（数罪并罚，限制加重）
 *   ② 持续时长（越久越重）
 *   ③ 违法所得（追缴 + 罚金基数）
 *   ④ 加重情节：行贿 / 妨碍司法 / 拒不配合 / 潜逃未遂
 *   ⑤ 从轻情节：主动自首
 */
function makeVerdict() {
  const crimes = (G.crimes && G.crimes.length) ? G.crimes : ['taxEvade'];
  const records = (G.illegalRecords || []).filter(r => r.months > 0 || r.active);
  const list = [];
  let totalMin = 0, totalMax = 0;

  // ① 罪名归集（合并同类项）
  const seen = {};
  crimes.forEach(c => {
    const key = Object.keys(CRIME_LIBRARY).find(k => c === k || (typeof c === 'string' && c.includes(CRIME_LIBRARY[k].name)));
    const lib = key ? CRIME_LIBRARY[key] : { name: (c.name || c), law: '', min: 1, max: 3, fine: 0.3 };
    if (!seen[lib.name]) { seen[lib.name] = lib; list.push(lib); }
  });

  // ② 违法档案里的经营类违法，也进罪名
  records.forEach(r => {
    const ck = ACT_TO_CRIME[r.id];
    const lib = ck ? CRIME_LIBRARY[ck] : null;
    if (lib && !seen[lib.name]) { seen[lib.name] = lib; list.push(lib); }
  });
  if (!list.length) list.push(CRIME_LIBRARY.taxEvade);

  list.forEach(l => { totalMin += l.min; totalMax += l.max; });

  // ③ 违法所得（元 → 万）
  const illegalGain = records.reduce((s, r) => s + (r.saved || 0), 0);
  const gainWan = illegalGain / 1e4;

  // ④ 持续时长：取最长的一条
  const maxMonths = records.reduce((m, r) => Math.max(m, r.months || 0), 0);
  const yearSpan = maxMonths / 12;

  // ⑤ 加重 / 从轻
  const aggravating = [];   // 加重情节
  const mitigating = [];    // 从轻情节
  const crimeNames = list.map(l => l.name).join('、');
  if (crimeNames.includes('行贿')) aggravating.push({ name: '行贿国家工作人员', w: 0.35 });
  if (crimeNames.includes('妨碍司法')) aggravating.push({ name: '毁灭证据、妨碍司法', w: 0.30 });
  if (crimeNames.includes('拒不配合')) aggravating.push({ name: '拒不配合调查', w: 0.15 });
  if (G.selfSurrendered) mitigating.push({ name: '主动投案自首、如实供述', w: 0.30 });
  if (G.cooperated) mitigating.push({ name: '积极配合调查、退缴所得', w: 0.15 });
  if (G.fledAttempt) aggravating.push({ name: '案发后企图潜逃', w: 0.40 });

  // ⑥ 基数刑期（数罪并罚：限制加重原则 —— 总和刑期以下、最高刑期以上，取中值打八折）
  let baseYears = Math.max(1, ((totalMin + totalMax) / 2) * 0.8);
  // 持续时长加成：每满一年 +6%，封顶 +60%
  const spanBonus = Math.min(0.60, yearSpan * 0.06);
  baseYears *= (1 + spanBonus);
  // 违法所得加成：偷得越多判越重（每 100 万 +5%，封顶 +50%）
  const gainBonus = Math.min(0.50, (gainWan / 100) * 0.05);
  baseYears *= (1 + gainBonus);
  // 加重 / 从轻
  const aggW = aggravating.reduce((s, a) => s + a.w, 0);
  const mitW = mitigating.reduce((s, a) => s + a.w, 0);
  baseYears *= Math.max(0.35, 1 + aggW - mitW);

  const years = Math.max(1, Math.round(baseYears * 10) / 10);

  // ⑦ 罚金：违法所得为基础 × 1~5 倍（真实：罚金一般为违法所得的一倍以上五倍以下）
  let fineBase = Math.max(gainWan, 20);   // 至少有 20 万基数
  let fineWan = fineBase * (1 + Math.min(4, aggW * 3)) * Math.max(0.5, 1 - mitW);
  // 按规模上浮，封顶 3 倍
  const scale = Math.max(1, Math.min(3, (G.stores || 1) * 0.15 + (G.month || 1) / 100));
  fineWan *= scale;
  fineWan = Math.round(fineWan);

  // ⑧ 追缴违法所得
  const confiscateWan = Math.round(gainWan * 10) / 10;

  return {
    crimes: list,
    years: years,
    fineWan: fineWan,
    confiscateWan: confiscateWan,
    illegalGainWan: Math.round(gainWan * 10) / 10,
    maxMonths: maxMonths,
    yearSpan: Math.round(yearSpan * 10) / 10,
    aggravating: aggravating,
    mitigating: mitigating,
    spanBonus: Math.round(spanBonus * 100),
    gainBonus: Math.round(gainBonus * 100),
    scale: scale,
    records: records
  };
}

/* 判决书 HTML */
function verdictHTML() {
  const v = makeVerdict();
  const name = '被告人（就是你）';
  const crimeText = v.crimes.map(c => c.name).join('、');
  const lawText = v.crimes.filter(c => c.law).map(c => c.law).join('；');
  const rows = v.crimes.map(c =>
    `<tr><td>${c.name}</td><td style="text-align:right;color:#999;font-size:11px">${c.law}</td></tr>`
  ).join('');

  // 违法档案明细
  const recRows = (v.records || []).filter(r => r.months > 0).map(r => {
    const from = r.startMonth || 1;
    const to = r.endMonth || G.month || from;
    return `<tr><td>${r.name}</td><td style="text-align:center">${r.months} 个月</td>` +
      `<td style="text-align:right;color:#e0a050">${((r.saved || 0) / 1e4).toFixed(1)} 万</td></tr>`;
  }).join('');

  // 加重 / 从轻情节
  const aggRows = (v.aggravating || []).map(a =>
    `<div style="color:#e06060;font-size:12px">＋ ${a.name}</div>`).join('');
  const mitRows = (v.mitigating || []).map(m =>
    `<div style="color:#7fbf7f;font-size:12px">－ ${m.name}</div>`).join('');
  const hasCirc = aggRows || mitRows;

  return `
<div style="background:#0d0d0f;border:1px solid #3a3a40;padding:24px 20px;font-family:'Songti SC',serif;color:#d8d8d8;line-height:1.9;max-width:560px;margin:0 auto">
  <div style="text-align:center;font-size:20px;letter-spacing:8px;color:#c9c9c9;border-bottom:1px solid #3a3a40;padding-bottom:12px;margin-bottom:18px">
    刑 事 判 决 书
  </div>
  <div style="font-size:12px;color:#8a8a8a;margin-bottom:14px">
    被告人：${name}<br>
    案由：${crimeText}
  </div>
  <table style="width:100%;font-size:13px;border-collapse:collapse;margin-bottom:16px">
    ${rows}
  </table>
  ${recRows ? `
  <div style="font-size:12px;color:#8a8a8a;margin-bottom:6px">经审理查明，被告人实施下列行为：</div>
  <table style="width:100%;font-size:12px;border-collapse:collapse;margin-bottom:16px;border-top:1px solid #2a2a30">
    ${recRows}
  </table>
  <div style="font-size:12px;color:#8a8a8a;margin-bottom:14px">
    上述行为累计持续 <b style="color:#d0d0d0">${v.maxMonths}</b> 个月（约 ${v.yearSpan} 年），
    违法所得合计 <b style="color:#e0a050">${v.illegalGainWan}</b> 万元。
  </div>` : ''}
  <div style="font-size:13px;color:#b0b0b0;margin-bottom:14px">
    本院认为，被告人经营期间实施上述行为，${lawText ? '违反' + lawText + '之规定，' : ''}
    犯罪事实清楚，证据确实充分，应当以${crimeText}追究其刑事责任。
  </div>
  ${hasCirc ? `
  <div style="border-top:1px dashed #2a2a30;padding-top:10px;margin-bottom:14px">
    ${aggRows}${mitRows}
  </div>` : ''}
  <div style="border-top:1px solid #3a3a40;padding-top:16px;font-size:14px">
    <div style="text-align:center;padding:6px 0 12px">
      判处有期徒刑 <b style="color:#e05050;font-size:26px;letter-spacing:2px">${v.years}</b> <span style="font-size:15px;color:#d8d8d8">年</span>
    </div>
    <div style="font-size:11px;color:#6a6a6a;text-align:center;line-height:1.8">
      （并处没收个人财产、追缴违法所得 ${v.confiscateWan} 万元上缴国库）
    </div>
  </div>
  <div style="margin-top:20px;font-size:12px;color:#7a7a7a;text-align:right">
    如不服本判决，可在接到判决书第二日起十日内提出上诉。
  </div>
  <div style="margin-top:28px;text-align:center;font-size:13px;color:#8a8a8a;letter-spacing:2px;border-top:1px dashed #3a3a40;padding-top:18px">
    <div style="font-size:15px;color:#c9a050;letter-spacing:4px;margin-bottom:10px">天 网 恢 恢 ，疏 而 不 漏</div>
    你的商业帝国梦，在铁窗中落幕。
  </div>
  <div style="text-align:center;margin-top:18px">
    <button class="tbtn" onclick="location.reload()">重新开始</button>
  </div>
</div>`;
}

/* ═══ 打工还债模式 ═══ */
/* 启动：破产后不直接重开，进入还债 */
function startDebtMode() {
  const p = P();
  // 债务 = 贷款余款 + 欠薪欠税 + 清算后不足部分
  const loans = totalDebt();
  const arrears = (G.arrears || 0);
  const negCash = Math.max(0, -G.cash);
  const total = loans + arrears + negCash;

  if (total <= 0) return null;

  G.debtMode = {
    total,
    remaining: total,
    months: 0,
    // 打工收入：一个普通打工人的工资（现实：餐饮店长 1~1.5 万/月）
    monthlySalary: 12000,
    monthlyLiving: 5000,     // 生活开支
    rate: 0.05,              // 债务年利率（民间借贷/银行催收利息）
    paid: 0,
    history: []
  };
  G.status = 'debt';
  return G.debtMode;
}

/* 每月还债推进 */
function debtMonthAdvance() {
  const d = G.debtMode;
  if (!d) return null;
  d.months++;
  // 利息先滚
  const interest = d.remaining * d.rate / 12;
  d.remaining += interest;
  // 工资还债
  const able = d.monthlySalary - d.monthlyLiving;
  const pay = Math.min(able, d.remaining);
  d.remaining -= pay;
  d.paid += pay;

  const rec = { month: d.months, interest, pay, remaining: d.remaining };
  d.history.push(rec);

  if (d.remaining <= 0.01) {
    d.remaining = 0;
    return { type: 'free', text: '🕊 你终于还清了。用了 ' + d.months + ' 个月' };
  }
  return { type: 'ongoing', rec };
}

/* 还要还多少年（给玩家看的刺眼数字） */
function debtYearsLeft() {
  const d = G.debtMode;
  if (!d) return null;
  const able = d.monthlySalary - d.monthlyLiving;
  if (able <= 0) return { infinite: true };
  // 简化：不算复利，算个大概
  const years = d.remaining / able / 12;
  return {
    years: Math.round(years * 10) / 10,
    monthly: able,
    remaining: d.remaining,
    // 现实描述
    text: years > 50 ? '这辈子还不完'
        : years > 20 ? '还到退休都还不完'
        : years > 10 ? '要还十几年'
        : years > 3  ? '还要苦好几年'
        : '咬咬牙还能还完'
  };
}

/* 还债界面 HTML */
function debtHTML() {
  const y = debtYearsLeft();
  if (!y) return '';
  return `
<div style="background:#141418;border:1px solid #3a3a40;padding:20px;color:#d0d0d0;line-height:1.9;max-width:560px;margin:0 auto">
  <div style="text-align:center;font-size:17px;letter-spacing:4px;color:#c0c0c0;border-bottom:1px solid #3a3a40;padding-bottom:10px;margin-bottom:16px">
    打 工 还 债
  </div>
  <table style="width:100%;font-size:13px;border-collapse:collapse">
    <tr><td>欠款总额</td><td style="text-align:right;color:#e05050">${(y.remaining / 1e4).toFixed(1)} 万元</td></tr>
    <tr><td>月薪</td><td style="text-align:right">${(G.debtMode.monthlySalary / 1e4).toFixed(1)} 万元</td></tr>
    <tr><td>房租吃饭</td><td style="text-align:right;color:#999">${(G.debtMode.monthlyLiving / 1e4).toFixed(1)} 万元</td></tr>
    <tr><td>每月能还</td><td style="text-align:right">${(y.monthly / 1e4).toFixed(2)} 万元</td></tr>
    <tr><td>利息</td><td style="text-align:right;color:#999">年化 ${(G.debtMode.rate * 100).toFixed(0)}%（借新还旧、催收成本）</td></tr>
  </table>
  <div style="margin-top:16px;padding-top:14px;border-top:1px dashed #3a3a40;text-align:center">
    <div style="font-size:13px;color:#999">按这个速度</div>
    <div style="font-size:26px;color:#e05050;margin:6px 0">${y.years} 年</div>
    <div style="font-size:13px;color:#8a8a8a">${y.text}</div>
  </div>
  <div style="margin-top:14px;font-size:12px;color:#6a6a6a;text-align:center">
    已还 ${G.debtMode.months} 个月 · 累计还了 ${(G.debtMode.paid / 1e4).toFixed(1)} 万
  </div>
</div>`;
}

/* ═══ v3.2.0 等判决：跑与不跑之后，统一走到这里 ═══ */
function showWaitingVerdict() {
  const ep = document.getElementById('endingPanel');
  if (!ep) return;
  G.status = 'caught';
  ep.innerHTML = `<div style="background:#141418;border:1px solid #3a3a40;padding:22px;text-align:center;color:#c0c0c0;line-height:2;max-width:560px;margin:12px auto">
    <div style="font-size:15px;color:#e05050;letter-spacing:4px;margin-bottom:12px">等 待 判 决</div>
    <div style="font-size:13px;color:#999">人已经控制住了。<br>接下来是笔录、取证、移送、起诉、开庭。<br>这一套走下来，要一年多。</div>
    <div style="font-size:12px;color:#6a6a6a;margin-top:12px">这一年里，公司没了，店没了，员工散了，供应商的款也结不上了。</div>
    <button class="tbtn" style="margin-top:18px" onclick="showFinalVerdict()">开庭 →</button>
  </div>`;
}

function showFinalVerdict() {
  const ep = document.getElementById('endingPanel');
  if (!ep) return;
  ep.innerHTML = (typeof verdictHTML === 'function') ? verdictHTML() : '';
}

/* ═══ v3.2.0 结局二·成功跑掉（1%）═══ */
function showFledEnding(paid) {
  const ep = document.getElementById('endingPanel');
  if (!ep) return;
  const paidWan = ((paid || 0) / 1e4).toFixed(0);
  ep.innerHTML = `<div style="background:#0d0d0f;border:1px solid #3a3a40;padding:24px 20px;color:#d8d8d8;line-height:1.95;max-width:560px;margin:0 auto;font-family:'Songti SC',serif">
    <div style="text-align:center;font-size:19px;letter-spacing:6px;color:#c9a050;border-bottom:1px solid #3a3a40;padding-bottom:12px;margin-bottom:18px">
      跑 掉 了
    </div>
    <div style="font-size:13px;color:#b0b0b0">
      飞机落地的那一刻是凌晨四点。你走出航站楼，风是陌生的，空气味道也不一样。<br><br>
      你活下来了。这一百个人里，只有你一个。
    </div>
    <div style="border-top:1px dashed #3a3a40;margin:18px 0;padding-top:16px;font-size:13px;color:#999">
      · 你在国内的行贿案已经立案，<b style="color:#c9a050">红色通报</b>发了出来<br>
      · 打点进去的 ${paidWan} 万，一分没带出来<br>
      · 公司在清算，员工在讨薪，名字挂在失信名单上<br>
      · 你回不去了——**永 远**回不去了<br>
      · 家里人还留在那边，你连电话都不敢打
    </div>
    <div style="font-size:13px;color:#8a8a8a;margin-top:16px">
      你在异国的中餐馆后厨洗了第一天的盘子。<br>
      那天晚上你想起自己当年开第一家店的样子——站在门口，笑得跟个傻子。<br><br>
      <span style="color:#c9a050">跑掉了，不等于自由了。</span>
    </div>
    <div style="text-align:center;margin-top:22px">
      <button class="tbtn" onclick="location.reload()">重新开始</button>
    </div>
  </div>`;
}

/* ═══ v3.3.0 结局一·上市敲钟 ═══ */
function listedEndingHTML() {
  const i = G.ipoInfo || {};
  const w = v => ((v || 0) / 1e4).toFixed(0);
  const years = Math.max(1, Math.round((i.month || 0) / 12));
  return `<div style="background:#0a0d14;border:1px solid #3a4a60;padding:26px 20px;color:#d8e0ea;line-height:2;max-width:560px;margin:0 auto;font-family:'Songti SC',serif">
    <div style="text-align:center;font-size:21px;letter-spacing:10px;color:#ffd860;border-bottom:1px solid #3a4a60;padding-bottom:14px;margin-bottom:20px">
      上 市 敲 钟
    </div>
    <div style="font-size:13px;color:#a8b8c8;text-align:center;margin-bottom:18px">
      ${years} 年，${i.stores || 1} 家店，从一个 30 万的小店开始。
    </div>
    <table style="width:100%;font-size:13px;border-collapse:collapse">
      <tr><td style="color:#8a9aa8">公司估值</td><td style="text-align:right;color:#ffd860">${w(i.valuation)} 万</td></tr>
      <tr><td style="color:#8a9aa8">发行募资</td><td style="text-align:right">${w(i.raise)} 万</td></tr>
      <tr><td style="color:#8a9aa8">发行费用</td><td style="text-align:right;color:#c08080">-${w(i.cost)} 万</td></tr>
      <tr><td style="color:#8a9aa8">实到账</td><td style="text-align:right;color:#7fe0a8">${w(i.netRaise)} 万</td></tr>
      <tr><td style="color:#8a9aa8">创始人持股</td><td style="text-align:right;color:#ffd860">${((i.ownership || 0) * 100).toFixed(1)}%</td></tr>
    </table>
    <div style="border-top:1px dashed #3a4a60;margin:18px 0;padding-top:16px;font-size:13px;color:#a8b8c8">
      敲钟那天，你穿了西装，站在台上，手心里全是汗。<br>
      大屏上的红字跳成绿色，底下一片掌声。<br><br>
      你想起开业第一天，收银机里只有三百二十块钱。
    </div>
    <div style="font-size:12px;color:#6a7a88;margin-top:14px">
      从这天起，你要对股东负责、要披露、要分红、要被人盯着看。<br>
      自由少了一半，但你在牌桌上了。
    </div>
    <div style="text-align:center;margin-top:22px">
      <button class="tbtn" onclick="location.reload()">重新开始</button>
    </div>
  </div>`;
}

/* ═══ v3.3.0 结局三·卖掉公司养老 ═══ */
/* 计算卖盘报价：真实餐饮并购按年利润 3~6 倍（PE），口碑好溢价、口碑差折价 */
function sellValuation() {
  const last12 = (G.history || []).slice(-12).reduce((s, h) => s + (h.netProfit || 0), 0);
  const p = (typeof P === 'function') ? P() : { revenue: 0, setupCost: 0 };
  const annualRev = (G.revenueLast || 0) * 12;
  if (last12 <= 0) {
    // 亏损：按净资产打折清算
    const assets = G.stores * (p.setupCost || 0) * 0.6;
    const net = G.cash + assets - ((typeof totalDebt === 'function') ? totalDebt() : 0);
    return { price: Math.max(0, net * 0.7), pe: 0, loss: true, annualRev: annualRev, last12: last12 };
  }
  let pe = 3.5;
  if (G.reputation >= 75) pe = 5.5;
  else if (G.reputation >= 65) pe = 4.5;
  else if (G.reputation < 50) pe = 2.5;
  if (G.credit >= 85) pe += 0.5;
  if (G.overdue > 0) pe -= 0.5;
  const price = Math.max(last12 * pe, annualRev * 1.0);
  return { price, pe, loss: false, annualRev: annualRev, last12: last12 };
}

function sellEndingHTML() {
  const v = sellValuation();
  const net = v.price - ((typeof totalDebt === 'function') ? totalDebt() : 0);
  const w = x => ((x || 0) / 1e4).toFixed(0);
  const years = Math.max(1, Math.round((G.month || 0) / 12));
  // 养老测算：按年化 3% 稳健理财
  const yearly = Math.max(0, net) * 0.03;
  const monthly = yearly / 12;
  return `<div style="background:#0d1210;border:1px solid #3a5a4a;padding:26px 20px;color:#d8e8e0;line-height:2;max-width:560px;margin:0 auto;font-family:'Songti SC',serif">
    <div style="text-align:center;font-size:21px;letter-spacing:10px;color:#7fe0a8;border-bottom:1px solid #3a5a4a;padding-bottom:14px;margin-bottom:20px">
      卖 掉 了
    </div>
    <div style="font-size:13px;color:#a8c8b8;text-align:center;margin-bottom:18px">
      ${years} 年，${G.stores} 家店，告一段落。
    </div>
    <table style="width:100%;font-size:13px;border-collapse:collapse">
      <tr><td style="color:#8aa898">收购报价</td><td style="text-align:right;color:#7fe0a8">${w(v.price)} 万</td></tr>
      <tr><td style="color:#8aa898">偿还全部债务</td><td style="text-align:right;color:#c08080">-${w((typeof totalDebt === 'function') ? totalDebt() : 0)} 万</td></tr>
      <tr style="border-top:1px solid #3a5a4a"><td style="color:#a8c8b8;padding-top:8px">到手净额</td><td style="text-align:right;color:#ffd860;padding-top:8px;font-size:16px">${w(net)} 万</td></tr>
      ${v.loss ? '' : `<tr><td style="color:#8aa898;font-size:12px">（按年利 ${v.last12 > 0 ? (w(v.last12)) : 0} 万的 ${v.pe} 倍 PE 估值）</td><td></td></tr>`}
    </table>
    <div style="border-top:1px dashed #3a5a4a;margin:18px 0;padding-top:16px;font-size:13px;color:#a8c8b8">
      签字那天很简单。几个文件夹，一支笔，二十分钟。<br><br>
      然后你从自己开了 ${years} 年的店里走出来，钥匙已经交出去了。<br>
      街上车来车往，你忽然不知道自己该去哪儿。
    </div>
    <div style="border-top:1px dashed #3a5a4a;margin:16px 0;padding-top:14px;font-size:13px">
      <div style="color:#8aa898;font-size:12px;margin-bottom:6px">往后三十年（按年化 3% 稳健理财测算）</div>
      <div style="color:#ffd860;font-size:15px">每年约 ${w(yearly)} 万 · 每月约 ${w(monthly)} 万</div>
    </div>
    <div style="font-size:13px;color:#8a9a90;margin-top:14px">
      ${net >= 30000000
        ? '你什么也不用做了。想钓鱼就钓鱼，想睡觉就睡觉。<br>只是偶尔路过一条街，闻到那个味道，会停下来站一会儿。'
        : net >= 10000000
        ? '日子能过，不算大富。够你把想做的事慢慢做一遍了。'
        : '钱不算多，但也不用再熬夜对账、再跟供应商吵价了。<br>这大概就是你想要的。'}
    </div>
    <div style="text-align:center;margin-top:22px">
      <button class="tbtn" onclick="location.reload()">重新开始</button>
    </div>
  </div>`;
}

if (typeof module !== 'undefined') module.exports = {
  CRIME_LIBRARY, makeVerdict, verdictHTML,
  startDebtMode, debtMonthAdvance, debtYearsLeft, debtHTML
};
