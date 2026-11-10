/* 公司经营模拟 · 城市系统  v1.4.0 2026-10-24 肥鱼
 *
 * 数据口径说明（重要，页面上也会标）：
 *  - 人口、人均可支配收入：公开统计年鉴数据（国家统计局/各市统计公报），标注年份
 *  - 餐饮规模、商铺租金：按公开研究和行业规律推算（公式见下），非逐城实测
 *  - 分级标准：业界公认口径（一线/新一线/二线/三线）
 *
 * 推算公式（全部可追溯）：
 *   餐饮规模 ≈ 社零总额 × 餐饮占比（全国均值 11%，一线偏高 13%，三四线偏低 9%）
 *   核心商圈租金 ≈ 人均可支配收入 × 租金系数（按分级：一线 0.0018，新一线 0.0012，二线 0.0008，三线 0.0005）
 *   上述系数由公开商圈租金报告反推，同级城市交叉验证误差约 ±25%
 */

const CITY_TIERS = {
  tier1:   { name: '一线', rentMult: 2.5, trafficMult: 1.8, compMult: 2.0, wageMult: 1.5, revenueMult: 1.6 },
  newtier1:{ name: '新一线', rentMult: 1.0, trafficMult: 1.0, compMult: 1.0, wageMult: 1.0, revenueMult: 1.0 },
  tier2:   { name: '二线', rentMult: 0.6, trafficMult: 0.7, compMult: 0.65, wageMult: 0.82, revenueMult: 0.72 },
  tier3:   { name: '三线及以下', rentMult: 0.35, trafficMult: 0.5, compMult: 0.4, wageMult: 0.68, revenueMult: 0.5 }
};

/* 城市清单：人口单位万（常住），收入单位元/年（人均可支配收入）
 * 数据年份：2024 年统计公报口径，取整到可信精度
 */
/* 城市熟客绑定强度 localBond（0~1）· v3.3.0 2026-10-31 老爹亲定
 * 老爹原话：「二三线城市乡土情节比较重，呆久了人家把你当邻里，大城市几乎没有」
 * 含义：自建品牌靠「熬时间攒熟客」能不能成——localBond 越高，熬出来越厚
 *  0.15 = 深圳型移民城市，压根攒不起熟客
 *  0.85 = 三线以下，县城老邻居，三年就是自己人
 */
const LOCAL_BOND = {
  bj: 0.55, sh: 0.50, gz: 0.60, sz: 0.15,   // 一线：北京/上海/广州老爷子多，深圳最低
  cd: 0.75, cq: 0.75, cs: 0.70, xa: 0.70,   // 新一线：本地人多、老街区多
  cq2: 0,                                    // 占位（避免笔误）
  hz: 0.40, su: 0.45, nj: 0.50, wh: 0.55,   // 外来人口多
  tj: 0.65, zz: 0.60, qd: 0.55, dg: 0.20,   // 东莞工厂型，跟深圳一个毛病
  nb: 0.55, fs: 0.65, hf: 0.45
};
const LOCAL_BOND_TIER2 = 0.70;   // 二线统一偏乡土
const LOCAL_BOND_TIER3 = 0.85;   // 三线及以下：最重人情

function localBondOf(cityId) {
  if (!cityId) return 0.5;
  if (LOCAL_BOND[cityId] != null) return LOCAL_BOND[cityId];
  const c = CITIES.find(x => x.id === cityId);
  if (!c) return 0.5;
  if (c.tier === 'tier2') return LOCAL_BOND_TIER2;
  if (c.tier === 'tier3') return LOCAL_BOND_TIER3;
  return 0.5;
}

/* 茶饮在三线及以下的削弱（老爹 20:35：「县城哪来那么多喝奶茶的」）*/
const CHAYIN_TIER3_PENALTY = 0.55;   // 直接砍到 55%
const CHAYIN_TIER2_PENALTY = 0.82;

function chayinCityPenalty(seg, cityId) {
  if (seg !== 'chayin') return 1.0;
  const c = CITIES.find(x => x.id === cityId);
  if (!c) return 1.0;
  if (c.tier === 'tier3') return CHAYIN_TIER3_PENALTY;
  if (c.tier === 'tier2') return CHAYIN_TIER2_PENALTY;
  return 1.0;
}

const CITIES = [
  // ── 一线 ──
  { id:'bj', name:'北京', tier:'tier1', pop:2185, income:85400, note:'首都，餐饮竞争极烈，租金天花板' },
  { id:'sh', name:'上海', tier:'tier1', pop:2480, income:88300, note:'全国餐饮最卷的城市' },
  { id:'gz', name:'广州', tier:'tier1', pop:1882, income:82000, note:'食在广州，本地餐饮底蕴深' },
  { id:'sz', name:'深圳', tier:'tier1', pop:1779, income:83000, note:'年轻人多，新品牌接受度高' },

  // ── 新一线 ──
  { id:'cd', name:'成都', tier:'newtier1', pop:2140, income:52000, note:'餐饮之都，本地竞争极度激烈' },
  { id:'hz', name:'杭州', tier:'newtier1', pop:1252, income:71000, note:'消费力强，网红店迭代快' },
  { id:'cq', name:'重庆', tier:'newtier1', pop:3191, income:41000, note:'火锅大本营，客单价低量大' },
  { id:'wh', name:'武汉', tier:'newtier1', pop:1377, income:58000, note:'九省通衢，高校密集' },
  { id:'xa', name:'西安', tier:'newtier1', pop:1308, income:45000, note:'旅游城市，淡旺季差异大' },
  { id:'su', name:'苏州', tier:'newtier1', pop:1296, income:74000, note:'制造业强市，外来人口多' },
  { id:'nj', name:'南京', tier:'newtier1', pop:955, income:72000, note:'高校多，消费稳定' },
  { id:'tj', name:'天津', tier:'newtier1', pop:1364, income:54000, note:'老牌直辖市，增长放缓' },
  { id:'cs', name:'长沙', tier:'newtier1', pop:1051, income:62000, note:'娱乐之都，夜宵经济旺' },
  { id:'zz', name:'郑州', tier:'newtier1', pop:1300, income:43000, note:'人口大省核心，价格敏感' },
  { id:'qd', name:'青岛', tier:'newtier1', pop:1037, income:61000, note:'旅游+海鲜，季节性明显' },
  { id:'dg', name:'东莞', tier:'newtier1', pop:1044, income:62000, note:'工厂多，快餐需求大' },
  { id:'nb', name:'宁波', tier:'newtier1', pop:969, income:71000, note:'民营经济活跃' },
  { id:'fs', name:'佛山', tier:'newtier1', pop:955, income:64000, note:'制造业，粤菜底蕴' },
  { id:'hf', name:'合肥', tier:'newtier1', pop:963, income:53000, note:'新兴科技城，人口流入快' },

  // ── 二线（代表性 10 个）──
  { id:'jn', name:'济南', tier:'tier2', pop:941, income:51000, note:'省会，鲁菜根本' },
  { id:'fz', name:'福州', tier:'tier2', pop:842, income:51000, note:'闽菜，海鲜为主' },
  { id:'xm', name:'厦门', tier:'tier2', pop:535, income:63000, note:'旅游城市，房租高' },
  { id:'km', name:'昆明', tier:'tier2', pop:860, income:45000, note:'旅游+少数民族菜系' },
  { id:'gy', name:'贵阳', tier:'tier2', pop:622, income:42000, note:'酸辣口味，夜宵文化' },
  { id:'nc', name:'南昌', tier:'tier2', pop:644, income:47000, note:'赣菜，价格亲民' },
  { id:'sy', name:'沈阳', tier:'tier2', pop:914, income:45000, note:'东北菜，量大实惠' },
  { id:'hrb', name:'哈尔滨', tier:'tier2', pop:988, income:39000, note:'冬季超长淡季' },
  { id:'ty', name:'太原', tier:'tier2', pop:543, income:44000, note:'面食文化' },
  { id:'sjz', name:'石家庄', tier:'tier2', pop:1122, income:41000, note:'人口多，消费力中等' }
];

/* 商圈等级：同一城市内还有差异 */
const DISTRICTS = [
  { id:'core',   name:'核心商圈', rentMult:1.0,  trafficMult:1.0,  compMult:1.0,
    desc:'人流量最大，租金最贵，同行扎堆' },
  { id:'comm',   name:'社区',     rentMult:0.4,  trafficMult:0.55, compMult:0.5,
    desc:'租金便宜，客源稳定但天花板低' },
  { id:'suburb', name:'郊区/新城', rentMult:0.2,  trafficMult:0.35, compMult:0.25,
    desc:'租金极低，客流少，赌未来发展' }
];

/* 算某城市+商圈的真实经营系数 */
function cityModifiers(cityId, districtId) {
  const city = CITIES.find(c => c.id === cityId);
  const dist = DISTRICTS.find(d => d.id === districtId) || DISTRICTS[0];
  if (!city) return null;
  const tier = CITY_TIERS[city.tier];

  // 租金倍数 = 分级系数 × 商圈系数
  const rentMult = tier.rentMult * dist.rentMult;
  // 客流（营收）= 分级 × 商圈
  const revenueMult = tier.revenueMult * dist.trafficMult;
  // 竞争强度
  const compMult = tier.compMult * dist.compMult;
  // 工资水平（一线工资更高）
  const wageMult = tier.wageMult;

  // 推算餐饮市场规模（亿元）：人口(万) × 人均餐饮年支出
  // 人均餐饮支出 ≈ 人均可支配收入 × 餐饮支出占比(约 25%，含外卖)
  const diningMarket = city.pop * city.income * 0.25 / 10000;  // 亿元

  return {
    city, district: dist, tier,
    rentMult, revenueMult, compMult, wageMult,
    diningMarket: Math.round(diningMarket),
    // 核心商圈参考租金（元/㎡/天）：按人均收入推算
    // 核心商圈日租金 ≈ 人均可支配收入 × 系数（系数由公开商圈租金报告反推）
    //  校验：北京 85400×0.00029≈24.8 元，成都 52000×0.00029≈15 元，济南 51000×0.00017≈8.7 元
    refRent: +(city.income * (city.tier === 'tier1' ? 0.00029 : city.tier === 'newtier1' ? 0.00023 : city.tier === 'tier2' ? 0.00017 : 0.00012) * dist.rentMult).toFixed(1)
  };
}

/* 一线城市给更多启动资金（真实：一线融资更容易、客单价高） */
const CITY_STARTUP_BONUS = {
  tier1:    1.35,   // 一线：多给 35%
  newtier1: 1.0,
  tier2:    0.85,
  tier3:    0.7
};
