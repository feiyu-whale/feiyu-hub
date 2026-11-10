/* 公司经营模拟 · 行业参数（全部来自真实财报）
 * 数据源：东方财富 datacenter 接口，15 家上市公司年报
 * 生成时间：2026-10-24  作者：肥鱼
 * 口径说明见 docs/01-数据基准与参数换算.md
 */
const SEGMENTS = {
  zhengcan: {
    name: '正餐', icon: '🍽️',
    desc: '家常菜 / 地方菜 / 老字号',
    // 单店基准（月）
    revenue: 600000,          // 月营收 60 万
    foodCostRate: 0.42,       // 食材 42%
    staffRate: 0.30,          // 人工 30%
    staffFixedWage: 6000,     // 人均月工资（固定成本，不随营收变）
    rentFixed: 95000,         // 固定房租：200㎡ 核心商圈月租 9.5 万（成都实测口径）
    utilFixed: 24000,         // 固定水电 2.4 万
    miscRate: 0.03,           // 杂费 3%
    otherOpexRate: 0.05,     // 其他运营成本：耗材/营销/外卖抽成/支付手续费/维修
    depreciationRate: 0.05,   // 折旧：装修设备按年摊销
    setupCost: 2000000,       // 开店投入 120 万
    arDays: 7,                // 应收账期
    apDays: 45,               // 应付账期
    invDays: 10,              // 存货天数
    dineInRatio: 0.70,     // 堂食占比（其余走外卖/团购，有账期）
    volatility: 0.18,         // 营收波动率（真实月波动 15~20%）
    staffCount: 20,           // 单店标准配置（人均月产值约 3.0 万）
    realData: '数据来源：3 家 A 股餐饮上市公司年报（毛利率 17.0~19.3%，人工占比 27.0~44.3%）',
    difficulty: '★★★☆☆'
  },
  huoguo: {
    name: '火锅', icon: '🍲',
    desc: '火锅 / 川渝 / 潮汕',
    revenue: 800000,
    foodCostRate: 0.40,
    staffRate: 0.33,
    staffFixedWage: 6000,       // 人均月工资（固定成本，不随营收变）
    rentFixed: 78000,         // 固定房租 7.8 万（火锅店面积大但租金单价低）
    utilFixed: 40000,         // 火锅耗能高，固定水电 4 万
    miscRate: 0.04,
    otherOpexRate: 0.04,     // 其他运营成本：耗材/营销/外卖抽成/支付手续费/维修
    depreciationRate: 0.06,   // 折旧：装修设备按年摊销
    setupCost: 1800000,
    arDays: 3,
    apDays: 40,
    invDays: 8,
    dineInRatio: 0.85,     // 堂食占比（其余走外卖/团购，有账期）
    volatility: 0.20,         // 营收波动率（火锅季节性强）
    staffCount: 40,           // 单店标准配置（人均月产值约 3.2 万）
    realData: '数据来源：3 家港股火锅上市公司年报（毛利率 59.5~65.0%，人工占比 29.5~34.8%）',
    difficulty: '★★☆☆☆'
  },
  kuaican: {
    name: '快餐', icon: '🍔',
    desc: '中式快餐 / 西式连锁',
    revenue: 400000,
    foodCostRate: 0.40,
    staffRate: 0.18,
    staffFixedWage: 5500,       // 人均月工资（固定成本，不随营收变）
    rentFixed: 48000,         // 固定房租 4.8 万
    utilFixed: 16000,         // 固定水电 1.6 万
    miscRate: 0.04,
    otherOpexRate: 0.14,     // 其他运营成本：耗材/营销/外卖抽成/支付手续费/维修
    depreciationRate: 0.05,   // 折旧：装修设备按年摊销
    setupCost: 800000,
    arDays: 3,
    apDays: 35,
    invDays: 5,
    dineInRatio: 0.45,     // 堂食占比（其余走外卖/团购，有账期）
    volatility: 0.14,         // 营收波动率（快餐最稳）
    staffCount: 14,           // 单店标准配置（人均月产值约 3.3 万）
    realData: '数据来源：1 家港股快餐上市公司年报（集团毛利率 21.7%，净利率 8.5%）',
    difficulty: '★★☆☆☆'
  },
  chayin: {
    name: '茶饮', icon: '🧋',
    desc: '奶茶 / 果茶 / 加盟模式',
    revenue: 80000,
    foodCostRate: 0.50,
    staffRate: 0.1125,
    staffFixedWage: 4500,       // 人均月工资（固定成本，不随营收变）
    rentFixed: 15000,         // 小店固定房租 1.5 万
    utilFixed: 3000,          // 固定水电 0.3 万
    miscRate: 0.00,
    otherOpexRate: 0.10,     // 其他运营成本：耗材/营销/外卖抽成/支付手续费/维修
    depreciationRate: 0.03,   // 折旧：装修设备按年摊销
    setupCost: 350000,     // 加盟费+保证金+装修
    arDays: 15,
    apDays: 40,
    invDays: 15,
    dineInRatio: 0.35,     // 堂食占比（其余走外卖/团购，有账期）
    volatility: 0.16,         // 营收波动率（茶饮夏季旺、冬季淡）
    staffCount: 2,            // 单店标准配置（人均月产值约 2.7 万）
    realData: '数据来源：3 家港股茶饮上市公司年报（毛利率 31.1~33.0%，净利率 15.2~24.1%）',
    difficulty: '★☆☆☆☆'
  }
};

/* 规模阶段：不可复用比例 + 转换成本系数 */
const STAGES = [
  { id: 0, name: '小店',     minStores: 1,  maxStores: 1,   headcount: '1-5',    nonReuse: 0.20 },
  { id: 1, name: '多店',     minStores: 2,  maxStores: 5,   headcount: '10-50',  nonReuse: 0.45 },
  { id: 2, name: '区域公司', minStores: 6,  maxStores: 20,  headcount: '100-500',nonReuse: 0.70 },
  { id: 3, name: '上市',     minStores: 21, maxStores: 999, headcount: '500+',   nonReuse: 0.90 }
];

/* 换赛道折损率（按品类相似度） */
function similarityLoss(fromSeg, toSeg) {
  const same = fromSeg === toSeg;
  if (same) return 0;
  const pairs = {
    'zhengcan-huoguo': 0.25, 'huoguo-zhengcan': 0.25,
    'zhengcan-kuaican': 0.50, 'kuaican-zhengcan': 0.50,
    'huoguo-kuaican': 0.50, 'kuaican-huoguo': 0.50,
    'chayin-kuaican': 0.45, 'kuaican-chayin': 0.45,
    'chayin-huoguo': 0.60, 'huoguo-chayin': 0.60,
    'zhengcan-chayin': 0.65, 'chayin-zhengcan': 0.65
  };
  return pairs[fromSeg + '-' + toSeg] || 0.55;
}

const BASE_SUCCESS = {
  same: 0.70, similar: 0.55, cross: 0.35
};
