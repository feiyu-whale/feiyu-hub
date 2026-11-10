/* 公司经营模拟 · 加盟合同系统  v3.0.7 2026-10-25 肥鱼
 *
 * 缘起（老爹 01:45）：「具体信息埋藏在合同里，签订的时候弹出一个合同，
 *                      如果你不仔细看，有可能会被埋坑」
 *
 * 真实逻辑：
 *   招商会上说的都是「回本快、扶持多、全国连锁」
 *   真正的坑全在那份没人细看的合同附件里：
 *     —— 供货价「按总部当期价格执行」（没说是市场价的 1.35 倍）
 *     —— 「保证金不予退还」（藏在第七条第三款）
 *     —— 「合同到期需总部书面同意方可续约」
 *     —— 「品牌使用费另计，标准由总部调整」
 *
 *   所以：给玩家看合同，让他自己决定看没看。
 */

/* ═══ 生成合同条款（按品牌真实参数拼出来）═══ */
function buildContract(brand) {
  const b = brand;
  const good = b.tier === 'good';
  const meh = b.tier === 'meh';
  const scam = b.tier === 'scam';

  // 合同条款：好坏混在一起，关键坑用平淡措辞写
  const clauses = [
    {
      no: '第一条',
      title: '加盟费用',
      text: '乙方须于签约之日起三个工作日内，向甲方一次性支付加盟费人民币 ' +
            (b.fee / 1e4).toFixed(0) + ' 万元整，及保证金人民币 ' +
            (b.deposit / 1e4).toFixed(0) + ' 万元整。'
    },
    {
      no: '第二条',
      title: '权利金',
      text: '乙方须按每月营业额的 ' + (b.royalty * 100).toFixed(0) +
            '% 向甲方支付品牌权利金，于次月 5 日前结清。'
    },
    {
      no: '第三条',
      title: '原料供应',
      // 关键坑：不说具体加价，只说「按总部当期价格」
      text: scam
        ? '乙方经营所需核心原料须全部向甲方或甲方指定供应商采购，价格按甲方当期供应价格执行。乙方不得自行采购同类原料。'
        : meh
        ? '乙方经营所需核心原料应向甲方指定供应商采购，甲方供应价格参考市场行情制定。'
        : '乙方可自行采购非核心原料；核心原料由甲方统一配送，价格按甲方公示价执行。'
    },
    {
      no: '第四条',
      title: '保证金',
      // 关键坑：退不退，藏在小字里
      text: scam
        ? '保证金于合同期满且乙方无违约情形时，经甲方审核后，扣除品牌维护费、系统使用费等各项费用后退还。'
        : meh
        ? '保证金于合同期满且乙方无违约情形时，经甲方审核后在 90 日内退还。'
        : '保证金于合同期满且乙方无违约情形时，于 30 日内无息退还。'
    },
    {
      no: '第五条',
      title: '合同期限与续约',
      text: scam
        ? '本合同有效期为三年。合同期满前 60 日，乙方须向甲方提出书面续约申请，经甲方审核同意后方可续约，甲方有权拒绝。'
        : '本合同有效期为三年。合同期满双方协商一致可续约。'
    },
    {
      no: '第六条',
      title: '甲方义务',
      text: scam
        ? '甲方提供开业前培训及品牌 VI 手册各一份。'
        : good
        ? '甲方提供开业前 7 日集中培训、开业期间驻店指导，以及每月至少一次的督导巡店服务。'
        : '甲方提供开业前 3 日培训，及每季度一次的督导巡店服务。'
    },
    {
      no: '第七条',
      title: '违约责任',
      text: scam
        ? '乙方擅自终止合同的，加盟费及保证金不予退还，并须赔偿甲方因此产生的直接和间接损失。'
        : '任一方违约的，须向守约方支付合同总金额 20% 的违约金。'
    },
    {
      no: '第八条',
      title: '其他约定',
      text: scam
        ? '本合同的解释权归甲方所有。甲方有权根据经营需要调整供货价格及相关收费标准，乙方应予配合。'
        : '本合同未尽事宜，双方另行协商，以书面补充协议为准。'
    }
  ];

  // ═══ v3.0.8 真实野鸡合同（老爹 01:48「真实的比这个阴险多了」）═══
  //  真实套路：不是条款写得狠，而是结构、名目、附件、管辖、担保层层设套
  //  每一条单看都合法，合起来就是没法脱身
  if (scam && b.contractTraps) {
    const t = b.contractTraps;
    // 用陷阱数据重写全部条款
    clauses.length = 0;
    clauses.push(
      { no: '第一条', title: '合同主体',
        text: '甲方为' + t.签约方 + '。乙方确认已充分了解甲方主体资格，并对此无异议。' },
      { no: '第二条', title: '加盟费用与保证金',
        text: '乙方须于签约之日起三个工作日内一次性支付加盟费人民币 ' + (b.fee / 1e4).toFixed(0) +
              ' 万元。另须缴纳' + t.保证金名目 + '人民币 ' + (b.deposit / 1e4).toFixed(0) + ' 万元。' },
      { no: '第三条', title: '原料采购',
        text: '乙方经营所需原料须全部向甲方或甲方指定供应商采购，供应价格按甲方当期价格执行。' +
              '甲方有权根据成本变化调整价格，乙方应予配合。' },
      { no: '第四条', title: '考核与终止',
        text: t.考核条款 },
      { no: '第五条', title: '合同期限',
        text: t.自动续约 },
      { no: '第六条', title: '竞业限制',
        text: t.竞业 },
      { no: '第七条', title: '担保',
        text: t.担保 },
      { no: '第八条', title: '货款预付',
        text: t.预付 },
      { no: '第九条', title: '违约责任',
        text: t.赔偿 },
      { no: '第十条', title: '争议解决',
        text: t.管辖 },
      { no: '第十一条', title: '附件',
        text: t.附件 + '。乙方签署本合同即视为已收到并接受全部附件。' },
      { no: '第十二条', title: '其他',
        text: '本合同的解释权归甲方所有。甲方有权根据经营需要对合同条款进行修订，修订后通知乙方即生效。' }
    );
    // 再加一份隐藏的附加费用清单
    clauses.push({
      no: '附件一（补充）',
      title: '费用清单',
      text: '品牌使用费：每月 8000 元；系统服务费：每月 3000 元；督导差旅费：按实际发生额由乙方承担；' +
            '装修设计费：一次性 5 万元；开业指导费：一次性 2 万元。'
    });
  }

  return {
    brandName: b.name,
    fee: b.fee,
    deposit: b.deposit,
    royalty: b.royalty,
    supplyMarkup: b.supplyMarkup,
    clauses
  };
}

/* ═══ 渲染合同 HTML ═══ */
function renderContract(brand) {
  const c = buildContract(brand);

  let html = '<div class="contract-wrap">';
  html += '<div class="contract-head">' +
    '<div class="contract-title">加 盟 合 同 书</div>' +
    '<div class="contract-sub">甲方：' + c.brandName + '（品牌方）　　乙方：你（加盟商）</div>' +
    '</div>';

  c.clauses.forEach(cl => {
    html += '<div class="contract-clause">';
    html += '<div class="cc-no">' + cl.no + '　' + cl.title + '</div>';
    html += '<div class="cc-text">' + cl.text + '</div>';
    html += '</div>';
  });

  const isScam = (FRANCHISE_BRANDS.find(x => x.name === c.brandName) || {}).tier === 'scam';
  html += '<div class="contract-foot">' +
    '以上条款经双方阅读确认，签字生效。<br>' +
    '<span style="color:#666;font-size:10px">' +
    (isScam
      ? '（本合同共 12 条正文 + 1 份附件，签约后 30 日内交付《运营手册》等四份文件）'
      : '（真话：认真看的人，能在这里看出很多东西）') +
    '</span></div>';

  html += '</div>';
  return html;
}

/* ═══ 合同弹窗 ═══ */
let _pendingBrandId = null;

function showContract(brandId) {
  const b = FRANCHISE_BRANDS.find(x => x.id === brandId);
  if (!b) return;
  _pendingBrandId = brandId;

  const mask = document.getElementById('monthModal');
  const body = document.getElementById('modalBody');
  const title = document.getElementById('modalTitle');
  if (!mask || !body) return;

  title.textContent = '📄 加盟合同 · ' + b.name;
  body.innerHTML = renderContract(b);
  mask.classList.add('show');

  // 底部按钮改成「签」和「不签」
  const foot = mask.querySelector('.modal-foot');
  if (foot) {
    foot.innerHTML =
      '<div style="display:flex;gap:8px">' +
      '<button class="modal-btn" style="flex:1;background:#2a2a2e;border-color:#3a3a40;color:#aaa" onclick="closeMonthModal()">不签了</button>' +
      '<button class="modal-btn" style="flex:1;background:#5a2a2a;border-color:#8a3a3a;color:#ffcccc" onclick="signContract()">我已阅读，签字</button>' +
      '</div>';
  }
}

function signContract() {
  const id = _pendingBrandId;
  if (!id) return;
  const r = joinFranchise(id);
  _pendingBrandId = null;

  // 恢复默认底部按钮
  const mask = document.getElementById('monthModal');
  const foot = mask ? mask.querySelector('.modal-foot') : null;
  if (foot) {
    foot.innerHTML = '<button class="modal-btn" onclick="closeMonthModal()">知道了，继续</button>';
  }

  const log = document.getElementById('log');
  if (log) {
    log.innerHTML = '<div class="evresult ' + (r.ok ? 'good' : 'bad') + '">' + r.msg + '</div>';
  }
  startGame();
}

if (typeof module !== 'undefined') module.exports = { buildContract, renderContract, showContract, signContract };
