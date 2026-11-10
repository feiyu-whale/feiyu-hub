/* 公司经营模拟 · 玩家手册  v3.0.4 2026-10-25 肥鱼
 *
 * 缘起（老爹 01:40）：「增加一个手册，具体哪些按钮是干什么用的得讲解一下，
 *                      虽然现实社会没有，但是玩家也不能太过于惨了」
 *
 * 定位：现实里没人给你发开店手册，但游戏得给。
 *      不给手册 = 不是残酷，是不公平。
 */

const MANUAL_CONTENT = [
  {
    id: 'start',
    icon: '🚀',
    title: '开局三件事',
    body: [
      '<b>选品类</b>：正餐最难、茶饮最轻。新手建议从快餐或茶饮起步，先摸清节奏。',
      '<b>选城市商圈</b>：一线核心商圈客流最大但租金和竞争也最狠；社区和郊区活得久但天花板低。',
      '<b>选开局年份</b>：2019 平淡、2020 疫情地狱、2023 反弹年最舒服。选年份是真的影响难度。'
    ],
    tips: '开局别急着扩张。先用 6~12 个月摸清自己这家店的盈亏平衡点。'
  },
  {
    id: 'main',
    icon: '▶',
    title: '下一个月（核心按钮）',
    body: [
      '点一次就结算一个月：算营收、扣成本、还贷款、可能触发事件。',
      '结算是<b>不可逆</b>的，点之前想清楚有没有事要做（比如先开个店、先贷个款）。',
      '每月会弹一张月报，上面有本月诊断和生存预警，照着看就知道问题在哪。'
    ],
    tips: '月报里那句「现金还能撑 N 个月」是最重要的数，低于 3 就该动手了。'
  },
  {
    id: 'report',
    icon: '📊',
    title: '报表',
    body: [
      '看最近 12 个月的累计营收、净利、净利率。',
      '看资产负债：现金 / 门店资产 / 负债 / 净资产 / 资产负债率。',
      '<b>资产负债率超过 65%</b> 银行会把你列进关注名单，超过 75% 会抽贷。'
    ],
    tips: '刚开始每月看一眼，亏了马上找原因，别等现金见底才反应过来。'
  },
  {
    id: 'open',
    icon: '🏗',
    title: '开新店',
    body: [
      '现金够开店成本的八成才会出现这个按钮。',
      '开新店要：一次性投入（装修设备）+ 房租押金 3 个月 + 之后每月增加人工和房租。',
      '新店有 <b>6 个月爬坡期</b>，客流从 50% 起步，不是一开门就满座。',
      '没建总部时同时只能筹备 1 家；建了总部可以 2 家并行，筹备期也从 4 个月缩到 2 个月。'
    ],
    tips: '<b>别用一家店赚的钱去开第二家店</b>——现金一断，两家一起死。留足至少 6 个月固定开支的现金再扩。'
  },
  {
    id: 'loan',
    icon: '💰',
    title: '贷款',
    body: [
      '三种贷款：<b>信用贷</b>（12 期，要信用 60 分）、<b>经营贷</b>（36 期，要经营满 6 个月，可用门店抵押）、<b>长期贷</b>（60 期，要信用 70 分）。',
      '月供是等额本息，<b>雷打不动每月扣</b>，不还就是逾期（罚息 5% + 信用 -15）。',
      '利率 = 基准利率 + 信用溢价。信用 100 分就是基准，信用 0 分会加 12%。'
    ],
    tips: '借钱的正确用途是<b>周转</b>，不是「翻本」。用贷款去填亏损的坑，只会死得更快——真实世界里没有例外。'
  },
  {
    id: 'switch',
    icon: '🔄',
    title: '换赛道',
    body: [
      '从正餐换成火锅、从快餐换成茶饮。成功率取决于新旧品类的相似度。',
      '转换成本包括：不可复用的资产、遣散费、租约违约金。',
      '成功率还受现金比例、士气、经营经验影响。<b>失败会额外损失一半成本。</b>'
    ],
    tips: '换赛道是重开一局，不是小调整。现金不够充裕时不要碰。'
  },
  {
    id: 'org',
    icon: '🏢',
    title: '建总部 / 公司化',
    body: [
      '<b>总部</b>（300 万 + 每月 15 万）：统一采购食材降 3%，开店提速，事件影响变小。',
      '<b>公司化</b>（800 万 + 每月 40 万）：能开增值税发票、用工合规、贷款额度高。',
      '这两个都可以跳过，但会持续累积风险：店多没总部会被查、会内耗、会失控。'
    ],
    tips: '10 家店左右该建总部，30 家店该做公司化。不是硬性要求，是「不建迟早出事」。'
  },
  {
    id: 'mortgage',
    icon: '🏠',
    title: '抵押',
    body: [
      '用门店资产、设备抵押换现金，折价率看资产类型。',
      '抵押是<b>最后手段</b>——还不上钱，抵押物直接被收走。'
    ],
    tips: '现金流断的那一刻，抵押已经救不了你。它的正确用法是提前准备，不是临死抓药。'
  },
  {
    id: 'terms',
    icon: '📦',
    title: '账期',
    body: [
      '和供应商谈账期：现结有折扣，长账期涨价但能压现金。',
      '账期太长会有断供风险——供应商也不是做慈善的。'
    ],
    tips: '新店前半年现金流紧，可以用账期缓一缓；但别把账期当成利润。'
  },
  {
    id: 'ipo',
    icon: '📈',
    title: '上市',
    body: [
      '要满足规模、利润、合规等条件才会出现这个按钮。',
      '上市能拿到一大笔钱，但要交出部分股权，还要强制分红。',
      '上市不是终点，是换了种死法——公众公司亏钱，股价会先崩。'
    ],
    tips: '现实里万分之一的中小餐饮能上市。能上就上，别为了上市硬撑指标。'
  },
  {
    id: 'illegal',
    icon: '⚠️',
    title: '违规操作（不建议）',
    body: [
      '四种操作：用劣质油、雇黑工、偷税、虚假宣传。',
      '短期内省钱或涨营收，但<b>风险会累积</b>，被查了就是罚款、停业，最重是坐牢。',
      '而且违规状态下出事故（火灾等），直接判刑事责任，不是赔钱能了的事。'
    ],
    tips: '这四条路都是真实的死法。想体验「被抓」可以试，但别指望靠它翻身。'
  },
  {
    id: 'metrics',
    icon: '📐',
    title: '六个核心指标怎么看',
    body: [
      '<b>现金</b>：你还能撑多久，这个最重要。',
      '<b>净利</b>：这个月赚了还是亏了。连续 3 个月亏就要警觉。',
      '<b>口碑</b>（0-100）：决定客流。低于 50 客人明显变少。',
      '<b>士气</b>（0-100）：决定出品和服务。低于 45 骨干会跑。',
      '<b>信用评分</b>（0-100）：决定你能借多少、利率多高。逾期一次扣 15 分。',
      '<b>资产负债率</b>：超过 65% 进银行关注名单，超过 75% 抽贷。'
    ],
    tips: '这六个里，只有现金是「会突然要你命」的。其余都是慢性病，有救。'
  },
  {
    id: 'death',
    icon: '💀',
    title: '几种真实的死法',
    body: [
      '<b>现金断流</b>：最常见。生意还在做，但账上没钱发工资了。',
      '<b>抽贷</b>：银行发现你现金流为负，提前收贷，一刀砍死。',
      '<b>扩张过度</b>：用一家店的钱开三家店，一次淡季全线崩。',
      '<b>口碑崩塌</b>：一次食安事故，客流腰斩，再也没回来。',
      '<b>违规被查</b>：省下的钱不够罚款，还要坐牢。',
      '<b>合伙人分家</b>：赚钱时他嫌分得少，亏钱时他先跑。'
    ],
    tips: '这些死法在现实里每天都在发生。游戏默认结果是失败——这不是设计得难，是现实本来就难。'
  }
];

/* 渲染手册 HTML */
function renderManual() {
  let html = '<div class="manual-wrap">';
  html += '<div class="manual-intro">' +
    '📖 <b>开店手册</b><br>' +
    '<span style="color:#8a9aaa;font-size:12px">现实里没人会给你发这个，但游戏得给 —— 不给手册不叫残酷，叫不公平。</span>' +
    '</div>';

  MANUAL_CONTENT.forEach(sec => {
    html += '<div class="manual-sec">';
    html += '<div class="manual-title" onclick="toggleManual(\'' + sec.id + '\')">' +
      '<span>' + sec.icon + ' ' + sec.title + '</span>' +
      '<span class="manual-arrow" id="arrow-' + sec.id + '">▾</span></div>';
    html += '<div class="manual-body" id="mb-' + sec.id + '" style="display:none">';
    sec.body.forEach(line => { html += '<div class="manual-line">· ' + line + '</div>'; });
    if (sec.tips) {
      html += '<div class="manual-tip">💡 ' + sec.tips + '</div>';
    }
    html += '</div></div>';
  });

  html += '</div>';
  return html;
}

function toggleManual(id) {
  const body = document.getElementById('mb-' + id);
  const arrow = document.getElementById('arrow-' + id);
  if (!body) return;
  const open = body.style.display !== 'none';
  body.style.display = open ? 'none' : 'block';
  if (arrow) arrow.textContent = open ? '▾' : '▴';
}

function showManual() {
  const mask = document.getElementById('monthModal');
  const body = document.getElementById('modalBody');
  const title = document.getElementById('modalTitle');
  if (!mask || !body) return;
  title.textContent = '📖 开店手册';
  body.innerHTML = renderManual();
  mask.classList.add('show');
  const footBtn = mask.querySelector('.modal-btn');
  if (footBtn) {
    const needChoice = !!(choiceCtx || G.pendingAftermath || G.pendingOfficialDemand ||
                         G.pendingPeopleEvent || G.pendingLandlord);
    footBtn.disabled = needChoice;
    footBtn.textContent = needChoice ? '⬆ 请先做出选择' : '知道了';
  }
}

if (typeof module !== 'undefined') module.exports = { MANUAL_CONTENT, renderManual, showManual, toggleManual };
