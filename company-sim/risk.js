/* 公司经营模拟 · 非钱风险与信息迷雾  v3.0.0 2026-10-25 肥鱼
 *
 * 现实逻辑：
 *  ① 火灾/漏水这类事概率极低，但一次就终结 —— 而且活得越久越接近必然
 *  ② 黑工/偷税状态下出事 → 不是赔钱，是坐牢
 *  ③ 房东看你生意好，涨租 200%，没有谈判余地 —— 这就是社会
 *  ④ 连续亏损时，人不理智：报表变模糊，选项变极端
 */

/* ═══ 火灾/水灾：累计风险 ═══
 * 老爹原来提 0.01%，但一局 120 个月基本撞不上，玩一年也遇不到
 * 改成累计风险：活越久，设备越旧，管理越松，风险越高
 *   基准：每月 0.02%，按店龄和店数累积，10 年累计约 5~8%
 */
function disasterCheck() {
  const months = G.month || 1;
  const stores = G.stores || 1;
  // 基础月风险 0.0002，随店龄线性上升，随店数放大
  let monthlyRisk = 0.0002 * (1 + months / 60) * Math.min(3, 1 + stores * 0.05);
  // 违规状态放大风险（黑工/偷税 = 线路乱接、消防不合规）
  const illegalCount = Object.values(G.illegalActs || {}).filter(Boolean).length;
  monthlyRisk *= (1 + illegalCount * 0.8);
  // 没总部没督导 = 检查不到位
  if (!G.hasHQ && stores > 8) monthlyRisk *= 1.5;

  if (Math.random() > monthlyRisk) return null;

  // ═══ 触发了 ═══
  const isFire = Math.random() < 0.6;
  const illegal = (G.illegalActs && (G.illegalActs.underTable || G.illegalActs.blackLabor ||
                   G.illegalActs.fake || G.illegalActs.taxEvade));

  return {
    type: 'disaster',
    kind: isFire ? 'fire' : 'flood',
    illegal: !!illegal,
    text: isFire
      ? '🔥🔥 后厨起火，火烧穿了两层楼。消防认定：线路老化，安全出口堵塞'
      : '💧💧 楼上水管爆裂，水灌了你整个店，设备全泡了',
    // 直接终局
    gameOver: true
  };
}

/* 灾难结算：分「赔钱清算」和「坐牢」两条路 */
function resolveDisaster(d) {
  const p = P();
  const damage = G.stores * p.setupCost * (0.4 + Math.random() * 0.5);
  // 保险：买了才赔
  const insured = G.hasInsurance;
  const covered = insured ? damage * 0.7 : 0;

  G.cash -= (damage - covered);

  if (d.illegal) {
    // 违规状态下出事 → 刑事责任
    G.status = 'caught';
    G.caughtBy = { name: '消防+公安联合调查', crime: '重大责任事故罪' };
    G.crimes = ['重大责任事故罪'];
    if (G.illegalActs && G.illegalActs.taxEvade) G.crimes.push('逃税罪');
    if (G.illegalActs && G.illegalActs.blackLabor) G.crimes.push('强迫劳动罪');
    return {
      text: d.text + '。调查发现你长期违规经营（' +
            '黑工/偷税/消防不合规），' +
            '这不是赔钱能了的事 —— 有人要负刑事责任',
      status: 'caught',
      crimes: G.crimes,
      damage, covered
    };
  }

  G.status = 'bankrupt';
  return {
    text: d.text + '。损失 ' + (damage / 1e4).toFixed(0) + ' 万' +
          (insured ? '（保险赔了 ' + (covered / 1e4).toFixed(0) + ' 万）' : '（你没买保险）') +
          '。资产被清算，公司没了',
    status: 'bankrupt',
    damage, covered
  };
}

/* 保险（真实：餐饮老板基本都买，不买就是赌） */
function buyInsurance() {
  if (G.hasInsurance) return { ok: false, msg: '已经买过了' };
  const premium = G.stores * P().setupCost * 0.008;   // 年保费 = 资产 0.8%
  const monthly = premium / 12;
  G.hasInsurance = true;
  G.insuranceMonthly = monthly;
  return { ok: true, msg: '买了财产险：每月 ' + (monthly / 1e4).toFixed(2) +
    ' 万，出事能赔七成' };
}

/* ═══ 房东毁约 ═══
 * 没有谈判余地
 */
function landlordCheck() {
  if (G.landlordThreat) return null;
  // 生意好 + 房租低于市价 → 房东眼红
  const p = P();
  if (G.revenueLast < p.revenue * G.stores * 0.9) return null;
  if (Math.random() > 0.02) return null;

  const newRent = 3.0;   // 涨到 3 倍 = +200%
  G.landlordThreat = {
    newMult: newRent,
    monthsLeft: 1
  };
  return {
    type: 'landlord',
    text: '🏠💢 房东看你生意好，直接通知：房租涨 200%，' +
          '不接受就明天搬走。合同？他说「你去告我啊，赔你点违约金就是了」',
    options: [
      {
        id: 'accept_rent',
        name: '认了，涨租',
        desc: '成本直接翻三倍，但店还在',
        apply: () => {
          addMod('rentDelta', newRent - 1, 999);
          G.landlordThreat = null;
          return '💸 房租涨到 3 倍。利润被房东吃掉一大块，你成了给他打工的';
        }
      },
      {
        id: 'move_out',
        name: '搬走，换铺位',
        desc: '损失装修和押金，重新找地方',
        apply: () => {
          const p2 = P();
          const loss = p2.setupCost * 0.6 + p2.rentFixed * 3;
          G.cash -= loss;
          G.landlordThreat = null;
          addMod('revenueDelta', -0.25, 3);
          if (G.cash < 0) G.status = 'bankrupt';
          return '🚚 搬走了。装修和押金损失 ' + (loss / 1e4).toFixed(0) +
                 ' 万，新址客流要重新养，3 个月内营收 -25%';
        }
      }
    ]
  };
}

/* ═══ 信息迷雾 ═══
 * 连续亏损 → 理智下降 → 报表变区间、选项变极端
 */
function sanityLevel() {
  // 理智 100 → 0
  let s = 100;
  s -= (G.monthsNegProfit || 0) * 8;
  if ((G.cash || 0) < 0) s -= 20;
  const debtRatio = (typeof balanceSheet === 'function') ? balanceSheet().debtRatio : 0;
  if (debtRatio > 0.6) s -= 15;
  if (G.overdue > 0) s -= 10;
  return Math.max(0, Math.min(100, s));
}

/* 报表模糊化：理智低于 60 时，数字变成区间 */
function blurNumber(v, sanity) {
  if (sanity >= 60) return null;   // 清晰
  const pct = sanity >= 35 ? 0.15 : 0.35;
  return {
    low: v * (1 - pct),
    high: v * (1 + pct),
    show: '约 ' + ((v * (1 - pct)) / 1e4).toFixed(0) + '~' +
          ((v * (1 + pct)) / 1e4).toFixed(0) + ' 万'
  };
}

/* 客流感受（永远模糊，不给数字） */
function trafficFeeling() {
  const target = P().revenue * G.stores;
  const ratio = target > 0 ? (G.revenueLast || 0) / target : 1;
  if (ratio > 1.1) return '感觉很好，门口要排队';
  if (ratio > 0.95) return '还行，基本坐得满';
  if (ratio > 0.8) return '一般，空几张桌';
  if (ratio > 0.6) return '很差，饭点也没几桌';
  return '冷清，服务员比客人多';
}

/* 绝望选项：理智 < 30 时出现 */
function desperateOptions() {
  const s = sanityLevel();
  if (s >= 30) return [];
  return [
    {
      id: 'loan_shark',
      name: '借高利贷翻本',
      desc: '月息 8%，还不上的后果你不会想知道',
      apply: () => {
        const amt = P().revenue * G.stores * 3;
        G.cash += amt;
        G.loanShark = { amount: amt, rate: 0.08, months: 0 };
        return '🩸 借了 ' + (amt / 1e4).toFixed(0) + ' 万高利贷，月息 8%。' +
               '这笔钱不会让你变强，只是让你多活几个月';
      }
    },
    {
      id: 'keep_burning',
      name: '继续熬',
      desc: '什么都不做，等生意自己好起来',
      apply: () => {
        G.morale = Math.max(0, G.morale - 5);
        return '😶 你决定再等等。店里的人一天比一天没精神';
      }
    }
  ];
}

/* 高利贷每月结算 */
function loanSharkMonthly() {
  const ls = G.loanShark;
  if (!ls) return null;
  ls.months++;
  const interest = ls.amount * ls.rate;
  G.cash -= interest;
  ls.amount += interest;
  if (G.cash < 0) {
    G.status = 'caught';
    G.crimes = ['非法吸收公众存款罪（被催收后引发刑事案件）'];
    return '🩸💀 高利贷利滚利到 ' + (ls.amount / 1e4).toFixed(0) +
           ' 万，还不上了。催收的电话打到了你家，事情闹大了';
  }
  return '🩸 高利贷利息 ' + (interest / 1e4).toFixed(1) + ' 万，欠款累计 ' +
         (ls.amount / 1e4).toFixed(0) + ' 万';
}

if (typeof module !== 'undefined') module.exports = {
  disasterCheck, resolveDisaster, buyInsurance, landlordCheck,
  sanityLevel, blurNumber, trafficFeeling, desperateOptions, loanSharkMonthly
};
