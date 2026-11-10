/* 公司经营模拟 · 加盟系统  v1.4.0 2026-10-24 肥鱼
 *
 * 现实规则：
 *  创业者有两条路 —— 自己创业（自建品牌）或加盟（借别人的牌子）
 *  加盟能省掉摸索期，但要交加盟费、被抽成、受总部管制
 *  最关键：市面上大量"招商加盟"公司是坑，专门收加盟费
 *
 * 品牌质量分三档（按真实行业观察估计）：
 *   正规品牌约 60% —— 有备案、有直营店、供应链正常
 *   半坑品牌约 28% —— 能开但供货贵、支持不到位
 *   野鸡品牌约 12% —— 收完钱就跑，或货不对板
 *
 * ⚠️ 所有品牌名均为虚构，商业逻辑取自真实现象
 */

const FRANCHISE_BRANDS = [
  // ═══ 正规品牌（有备案、有直营店）═══
  {
    id:'zhenghe', name:'正和食府', tier:'good', cats:['zhengcan'],
    fee:180000, deposit:100000, royalty:0.05, supplyMarkup:1.02,
    sign:{ 备案:true, 直营店:23, 加盟商评价:4.3, 供货价:'市场价 +2%' },
    desc:'十来年的老牌子，直营店二十多家，供应链是自己的'
  },
  {
    id:'dingwei', name:'鼎味火锅', tier:'good', cats:['huoguo'],
    fee:250000, deposit:150000, royalty:0.06, supplyMarkup:1.03,
    sign:{ 备案:true, 直营店:41, 加盟商评价:4.1, 供货价:'市场价 +3%' },
    desc:'全国三百多家店，底料有自己的工厂'
  },
  {
    id:'kuaile', name:'快乐堡', tier:'good', cats:['kuaican'],
    fee:200000, deposit:120000, royalty:0.05, supplyMarkup:1.02,
    sign:{ 备案:true, 直营店:56, 加盟商评价:4.0, 供货价:'市场价 +2%' },
    desc:'西式快餐，标准化程度高，培训体系完善'
  },
  {
    id:'chayan', name:'茶言观色', tier:'good', cats:['chayin'],
    fee:80000, deposit:30000, royalty:0.04, supplyMarkup:1.05,
    sign:{ 备案:true, 直营店:18, 加盟商评价:4.2, 供货价:'市场价 +5%' },
    desc:'茶饮品牌，原料统一配送，出餐快'
  },

  // ═══ 半坑品牌（能开，但处处多花钱）═══
  {
    id:'jinxiu', name:'锦绣家宴', tier:'meh', cats:['zhengcan'],
    fee:260000, deposit:150000, royalty:0.08, supplyMarkup:1.18,
    sign:{ 备案:true, 直营店:2, 加盟商评价:3.1, 供货价:'市场价 +18%' },
    desc:'招商很积极，直营店只有两家，说是"样板店"'
  },
  {
    id:'laoban', name:'老班长火锅', tier:'meh', cats:['huoguo'],
    fee:320000, deposit:180000, royalty:0.09, supplyMarkup:1.22,
    sign:{ 备案:true, 直营店:1, 加盟商评价:2.8, 供货价:'市场价 +22%' },
    desc:'加盟费不便宜，底料必须从总部进，价格比市场贵两成'
  },
  {
    id:'sushi', name:'速食客', tier:'meh', cats:['kuaican'],
    fee:280000, deposit:160000, royalty:0.08, supplyMarkup:1.20,
    sign:{ 备案:true, 直营店:3, 加盟商评价:3.0, 供货价:'市场价 +20%' },
    desc:'号称"半年回本"，实际总部支持很少'
  },
  {
    id:'chaqu', name:'茶趣多', tier:'meh', cats:['chayin'],
    fee:120000, deposit:50000, royalty:0.07, supplyMarkup:1.15,
    sign:{ 备案:true, 直营店:2, 加盟商评价:3.2, 供货价:'市场价 +15%' },
    desc:'加盟门槛低，但原料必须走总部，价格偏高'
  },

  // ═══ 野鸡品牌（坑）═══
  {
    id:'huangjin', name:'黄金食代', tier:'scam', cats:['zhengcan'],
    fee:380000, deposit:200000, royalty:0.10, supplyMarkup:1.35,
    sign:{ 备案:false, 直营店:0, 加盟商评价:1.4, 供货价:'市场价 +35%，还经常断货' },
    desc:'招商话术很猛，"全国连锁""总部全程扶持"，但查不到备案，也没有一家直营店',
    // v3.0.8 真实野鸡合同陷阱（老爹 01:48「真实的野鸡合同比这个阴险多了」）
    contractTraps: {
      签约方: '甲方为「黄金食代（香港）品牌管理有限公司」，实际经营主体为「XX餐饮管理服务部」',
      保证金名目: '「品牌履约诚意金」—— 不适用保证金相关法规',
      考核条款: '每满一年须完成年度考核，标准见《运营手册》（签约后交付）',
      管辖: '争议由甲方注册地（某县级市）人民法院管辖',
      自动续约: '期满前 60 日未提出书面异议，视为自动续约三年',
      竞业: '合同期内及期满后两年，乙方及近亲属不得从事同类经营，违者赔偿 50 万元',
      担保: '乙方须以个人全部财产提供无限连带责任担保',
      预付: '签约时须预付三个月货款，享受"优先供货"资格',
      赔偿: '因乙方原因造成品牌损失，赔偿金额由甲方核定，乙方无异议',
      附件: '《运营手册》《VI 手册》《供货价目表》《考核细则》共四份附件，签约后交付'
    }
  },
  {
    id:'wanghong', name:'网红小火锅', tier:'scam', cats:['huoguo'],
    fee:450000, deposit:250000, royalty:0.12, supplyMarkup:1.40,
    sign:{ 备案:false, 直营店:0, 加盟商评价:1.2, 供货价:'市场价 +40%，货不对板' },
    desc:'短视频上到处都是这个牌子，招商会开得很大，但你找不到一个开满一年的加盟商',
    contractTraps: {
      签约方: '甲方为「网红小火锅品牌管理中心」，无独立法人资格，为某个体户挂靠',
      保证金名目: '「加盟保证金」+ 单独一份「设备押金协议」，两笔钱分别处理',
      考核条款: '季度考核营业额，未达标甲方可单方终止合同，费用一概不退',
      管辖: '争议提交甲方指定的仲裁委员会仲裁，仲裁费由申请方先行垫付',
      自动续约: '合同期两年，期满自动续约，乙方须提前 90 日书面申请不续约',
      竞业: '乙方不得在合同期内及期满后三年内经营火锅品类',
      担保: '乙方配偶须共同签署《共同债务人确认书》',
      预付: '底料必须按季度预付，一次打款三个月用量',
      赔偿: '乙方擅自停业的，每日按 5000 元标准向甲方支付违约金',
      附件: '《品牌授权书》《设备清单》《底料价格表》共三份附件，其中价格表注明"随行就市"'
    }
  },
  {
    id:'baozhuan', name:'暴赚汉堡', tier:'scam', cats:['kuaican'],
    fee:400000, deposit:220000, royalty:0.11, supplyMarkup:1.45,
    sign:{ 备案:false, 直营店:0, 加盟商评价:1.0, 供货价:'市场价 +45%，强制搭配滞销品' },
    desc:'名字就叫"暴赚"，承诺"总部包销"，合同里全是免责条款',
    contractTraps: {
      签约方: '甲方为「暴赚（中国）餐饮连锁有限公司」，注册资本 100 万，实缴 0',
      保证金名目: '「信用保证金」—— 合同注明"用于抵扣乙方可能产生的各类费用"',
      考核条款: '甲方每月核定乙方营业数据，如有异议须在 3 日内提出，逾期视为认可',
      管辖: '争议由甲方所在地法院管辖，且约定乙方放弃管辖权异议',
      自动续约: '合同期满未续约的，甲方有权将乙方门店转为直营，装修设备无偿归甲方',
      竞业: '乙方不得从事汉堡、炸鸡、快餐等一切关联品类',
      担保: '乙方须提供两名自然人连带保证人',
      预付: '首批物料须一次性采购不少于 15 万元',
      赔偿: '因乙方经营不善导致品牌形象受损，甲方有权要求赔偿，金额不低于加盟费的两倍',
      附件: '《加盟须知》《物料清单》《门店标准》共三份，其中《门店标准》含强制装修指定供应商'
    }
  },
  {
    id:'chaomeng', name:'茶盟国际', tier:'scam', cats:['chayin'],
    fee:180000, deposit:80000, royalty:0.09, supplyMarkup:1.50,
    sign:{ 备案:false, 直营店:0, 加盟商评价:1.3, 供货价:'市场价 +50%，还收"品牌使用费"' },
    desc:'名字听着很国际，实际上是刚注册的皮包公司',
    contractTraps: {
      签约方: '甲方为「茶盟国际品牌管理（深圳）有限公司」，注册时间 8 个月前',
      保证金名目: '「合作诚意金」，合同明确写"不适用《商业特许经营管理条例》相关规定"',
      考核条款: '甲方有权随时调整考核标准，调整后 7 日内未提出异议视为接受',
      管辖: '争议提交甲方指定的「品牌仲裁中心」，该机构系甲方合作单位',
      自动续约: '合同期一年一签，续约须甲方书面同意，甲方有权拒绝且无需说明理由',
      竞业: '乙方及其配偶、子女不得在合同期内及期满后三年内从事茶饮行业',
      担保: '乙方须以房产或车辆提供抵押担保',
      预付: '原料款须预付三个月，且首单不低于 8 万元',
      赔偿: '乙方违反任一约定，甲方有权单方解除合同并没收全部已付款项',
      附件: '《运营手册》签约后 30 日内交付，其中含"甲方对条款保留最终解释权"'
    }
  }
];

/* 按品类取可选品牌 */
function brandsFor(cat) {
  return FRANCHISE_BRANDS.filter(b => b.cats.includes(cat));
}

/* 加盟结果：选牌子签合同后的真实后果 */
function joinFranchise(brandId) {
  const b = FRANCHISE_BRANDS.find(x => x.id === brandId);
  if (!b) return { ok: false, msg: '没有这个品牌' };

  const totalUpfront = b.fee + b.deposit;
  if (G.cash < totalUpfront) {
    return { ok: false, msg: '加盟费加保证金共 ' + (totalUpfront / 1e4).toFixed(0) + ' 万，现金不够' };
  }
  G.cash -= totalUpfront;
  G.franchise = {
    brandId: b.id, brandName: b.name, tier: b.tier,
    royalty: b.royalty, supplyMarkup: b.supplyMarkup,
    joinedMonth: G.month
  };

  // 野鸡品牌的真实后果：开业后一步步暴露
  if (b.tier === 'scam') {
    G.franchise.scamExposed = false;
  }
  return { ok: true,
    msg: '签了「' + b.name + '」的加盟合同，加盟费 ' + (b.fee / 1e4).toFixed(0) +
         ' 万 + 保证金 ' + (b.deposit / 1e4).toFixed(0) + ' 万。' +
         '每季度按营收 ' + (b.royalty * 100).toFixed(0) + '% 交权利金，原料从总部进' };
}

/* 加盟每月抽成（在结算里调用） */
function franchiseMonthlyCost(rev) {
  if (!G.franchise) return { royalty: 0, extraSupply: 0, events: [] };
  const f = G.franchise;
  const royalty = rev * f.royalty;
  const extraSupply = rev * (f.tier === 'good' ? 0.02 : f.tier === 'meh' ? 0.15 : 0.30);
  return { royalty, extraSupply, events: [] };
}

/* ═══ v3.3.0 品牌溢价（2026-10-31 老爹亲定）═══
 * 老爹原话：「大品牌抽了那么多钱，没有一点加成那就不太好了」
 *
 * 逻辑：加盟不是纯吃亏——牌子本身就是资产
 *   ① 品牌溢价营收：大牌子自带客流，客人愿意为招牌多走两步
 *   ② 品牌溢价毛利：集中采购 + 标准化，损耗低、议价强
 *   ③ 品牌风险缓释：正规牌子不会突然断供/爆雷（已在 trap 机制里）
 *
 * 算总账仍然是「加盟 ≈ 花钱买时间与客流」，净收益略低于自建（因为交了权利金），
 * 但开局稳、死得晚——这才是真实的加盟动机。
 */
const BRAND_PREMIUM = {
  good: { revMult: 1.18, marginBonus: 0.025, desc: '大牌子自带客流，客人愿意为招牌多走两步' },
  meh:  { revMult: 1.05, marginBonus: 0.008, desc: '牌子有点名气，但总部支持不到位' },
  scam: { revMult: 1.10, marginBonus: -0.02, desc: '名字听着唬人，实际靠噱头拉一波客' },
  self: { revMult: 1.00, marginBonus: 0.000, desc: '自建品牌，无溢价，但也不用交权利金' }
};

/* 当前品牌溢价（无加盟 → 自建 1.0） */
function brandPremium() {
  const tier = (G.franchise && G.franchise.tier) || 'self';
  return BRAND_PREMIUM[tier] || BRAND_PREMIUM.self;
}

/* 品牌溢价营收系数（供 engine 用） */
function brandRevMult() {
  return brandPremium().revMult;
}

/* 品牌溢价对食材/毛利的影响（正数=省成本，负数=更贵） */
function brandMarginBonus() {
  return brandPremium().marginBonus;
}

/* 野鸡品牌暴露机制：开业后 2~8 个月内陆续爆雷 */
function checkFranchiseTrap() {
  const f = G.franchise;
  if (!f || f.tier !== 'scam' || f.scamExposed) return null;
  if (G.month - f.joinedMonth < 2) return null;
  // 每月 30% 概率爆第一雷
  if (Math.random() > 0.30) return null;

  const traps = [
    { text: '📦 总部断供：说好的原料没到，店里只能去市场临时采购，成本暴涨',
      foodDelta: 0.25, months: 2 },
    { text: '💸 保证金不退：合同里写着"品牌维护费"，想退出时保证金一分拿不回',
      cash: -1 },
    { text: '🏃 总部失联：招商电话打不通，公司地址人去楼空',
      shutdown: true },
  ];
  const hit = traps[Math.floor(Math.random() * traps.length)];
  if (hit.shutdown) f.scamExposed = true;
  return hit;
}
