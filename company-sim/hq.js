/* 公司经营模拟 · 总部报批系统  v3.6.0 2026-10-31 肥鱼
 *
 * 老爹原话：「如果是连锁品牌的店铺的话，这些东西需要和总部商量」
 *          「肯定要第二个弄呀（违规但能赚）然后野品牌几乎不管甚至有概率跑路」
 *
 * 真实规则：
 *   ① 加盟 = 拿人家的牌子，就得听总部的话
 *   ② 价格管得最紧（统一定价，私改就是违约）
 *   ③ 推广要看品牌形象，一般要报备
 *   ④ 新品分品牌档次，大品牌管得死，小品牌宽松
 *   ⑤ 野鸡品牌基本不管（懒得分神）但有跑路风险
 */

/* 各档次品牌的报批通过率 */
const HQ_APPROVE_RATE = {
  good: 0.85,   // 正规品牌：讲规矩，合理请求基本能批
  meh:  0.55,   // 半坑品牌：拖拖拉拉，还爱要打点
  scam:  0.95   // 野鸡品牌：根本不管，来者不拒（但有跑路风险）
};

/* 违规处罚 */
const HQ_PENALTY = {
  price:  { pct: 0.05,  rep: 3,  name: '私自改价' },   // 当月营收 5% + 口碑 -3
  promo:  { fixed: 20000, rep: 2, name: '私下推广' },   // 罚 2 万 + 口碑 -2
  dish:   { pct: 0,      rep: 2,  name: '私自上新' }    // 责令下架 + 口碑 -2
};

/* 是否加盟状态 */
function isFranchised() {
  return !!(G.franchise && G.franchise.brandId);
}

function hqTier() {
  return (G.franchise && G.franchise.tier) || null;
}

/* 通用报批：返回 { ok, passed, msg } */
function hqApprove(actionType, detail) {
  if (!isFranchised()) return { ok: true, passed: true, msg: '' };

  const tier = hqTier();
  const baseRate = HQ_APPROVE_RATE[tier] || 0.5;

  // 野鸡品牌：走了个形式，还可能要钱
  if (tier === 'scam') {
    if (Math.random() < 0.3) {
      // 要「打点」
      const fee = Math.round((G.franchise.royalty || 0.05) * 100000);
      if (G.cash >= fee) {
        G.cash -= fee;
        return { ok: true, passed: true, msg: '总部说要走个流程，收了 ' + (fee / 1e4).toFixed(1) + ' 万「品牌管理费」——批了' };
      }
      return { ok: true, passed: false, msg: '总部要收打点费，你钱不够，这事儿只能先算了' };
    }
    return { ok: true, passed: true, msg: '总部那边根本没人管，直接放行' };
  }

  // 价格：正规品牌一律不给改（统一定价写死在合同里）
  if (actionType === 'price' && tier === 'good') {
    return { ok: true, passed: false, msg: '总部回复：统一定价是品牌红线，任何折扣都要总部市场部统一出方案，加盟商不得自定' };
  }

  const passed = Math.random() < baseRate;
  if (passed) {
    const delayTxt = tier === 'meh' ? '（总部那边拖了小半个月才回）' : '';
    return { ok: true, passed: true, msg: '总部批准了' + delayTxt };
  }
  const reasons = {
    price: '总部回复：这个价格会扰乱区域市场，不予批准',
    promo: '总部回复：品牌形象要统一管理，暂不允许加盟商自行投放',
    dish:  '总部回复：菜单由总部统一研发，不允许加盟商自行上新'
  };
  return { ok: true, passed: false, msg: reasons[actionType] || '总部没批' };
}

/* 违规处罚：私下做了没报批的事 */
function hqPenalty(actionType, rev) {
  const p = HQ_PENALTY[actionType];
  if (!p) return null;
  const tier = hqTier();

  // 野鸡品牌：查到概率低
  const caughtRate = tier === 'scam' ? 0.10 : tier === 'meh' ? 0.35 : 0.65;
  if (Math.random() > caughtRate) {
    return { caught: false, text: '这次没被发现' };
  }

  let fine = p.fixed || 0;
  if (p.pct) fine += (rev || G.revenueLast || 0) * p.pct;
  G.cash -= fine;
  G.reputation = Math.max(0, (G.reputation || 50) - p.rep);

  let extra = '';
  // 正规品牌：私自改价可能直接解约
  if (actionType === 'price' && tier === 'good' && Math.random() < 0.35) {
    const brandName = G.franchise.brandName;
    G.franchise = null;
    extra = '　⚠️ 总部直接解除加盟合同，「' + brandName + '」的招牌被摘了';
  }

  return {
    caught: true,
    text: '🚨 ' + p.name + '被总部查到！罚款 ' + (fine / 1e4).toFixed(1) + ' 万，口碑 -' + p.rep + extra
  };
}

/* 野鸡品牌跑路检查（每月一次） */
function hqRunawayCheck() {
  if (!isFranchised() || hqTier() !== 'scam') return null;
  if (G.franchise.scamExposed) return null;

  const joined = G.month - (G.franchise.joinedMonth || 0);
  if (joined < 3) return null;      // 刚加盟，还没收够钱

  // 跑路概率：加盟越久越高，每月 8%
  if (Math.random() > 0.08) return null;

  const brandName = G.franchise.brandName;
  G.franchise.scamExposed = true;
  G.franchise = null;
  G.reputation = Math.max(0, (G.reputation || 50) - 6);
  addMod('revenueDelta', -0.25, 6);
  return {
    type: 'bad',
    text: '🏃 总部跑路了！「' + brandName + '」的招商公司人去楼空，电话打不通、网站打不开。' +
          '招牌一夜之间成了负资产，客流 -25%（持续 6 个月），口碑 -6'
  };
}

if (typeof module !== 'undefined') module.exports = {
  HQ_APPROVE_RATE, HQ_PENALTY, isFranchised, hqTier,
  hqApprove, hqPenalty, hqRunawayCheck
};
