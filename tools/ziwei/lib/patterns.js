/**
 * 紫微斗数格局判读
 *
 * 判据来源：明代罗洪先《紫微斗数全书》、紫微斗数诸古籍公开记载的格局成立条件。
 * 古籍原文为公有领域内容；本文件按古籍所述条件自行组织实现。
 *
 * 输入盘结构：
 *   {
 *     mingBranch: 命宫地支序号 (0=子 … 11=亥)
 *     shenBranch: 身宫地支序号
 *     palaces: [{ branch, name, stars: [{ name, kind, hua }] }]
 *   }
 *   star.kind: 'main'(主星) | 'aux'(辅星) | 'misc'(杂曜)
 *   star.hua : '禄' | '权' | '科' | '忌'（无四化则空）
 *
 * 输出：[{ name, tier, text, where, cite }]
 *   tier = 'top'(上格) | 'fair'(中格) | 'aid'(助力) | 'warn'(恶格)
 *
 * 纯 ES5，无外部依赖。
 */
(function (global) {
  'use strict';

  /* ── 十二地支名称 ──────────────────────────────── */
  var ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

  /* ── 星曜分组（古籍常见分类）────────────────────── */
  var FOUR_SHA = ['擎羊', '陀罗', '火星', '铃星'];
  var SIX_SHA = ['擎羊', '陀罗', '火星', '铃星', '地空', '地劫'];
  var KONG_JIE = ['地空', '地劫'];
  var ZUO_YOU = ['左辅', '右弼'];
  var CHANG_QU = ['文昌', '文曲'];
  var KUI_YUE = ['天魁', '天钺'];
  var YUE_LIANG_TONG_JI = ['天机', '太阴', '天同', '天梁'];
  var SHA_PO_LANG = ['七杀', '破军', '贪狼'];
  var LUCKY_HUA = ['禄', '权', '科'];

  /* ── 盘面查询工具 ──────────────────────────────── */

  var ring = function (b) { return ((b % 12) + 12) % 12; };

  function palaceAt(chart, branch) {
    var b = ring(branch);
    for (var i = 0; i < chart.palaces.length; i++) {
      if (chart.palaces[i].branch === b) return chart.palaces[i];
    }
    return null;
  }

  function mingPalace(chart) { return palaceAt(chart, chart.mingBranch); }

  function hasStar(p, name) {
    if (!p) return false;
    for (var i = 0; i < p.stars.length; i++) if (p.stars[i].name === name) return true;
    return false;
  }

  function mainStars(p) {
    var out = [];
    if (!p) return out;
    for (var i = 0; i < p.stars.length; i++) {
      if (p.stars[i].kind === 'main') out.push(p.stars[i].name);
    }
    return out;
  }

  function starPalace(chart, name) {
    for (var i = 0; i < chart.palaces.length; i++) {
      if (hasStar(chart.palaces[i], name)) return chart.palaces[i];
    }
    return null;
  }

  /** 三方四正：本宫、对宫(冲)、两个三合宫 */
  function triad(chart, branch) {
    var b = ring(branch);
    var offsets = [0, 4, 6, 8];
    var out = [];
    for (var i = 0; i < offsets.length; i++) {
      var p = palaceAt(chart, b + offsets[i]);
      if (p) out.push(p);
    }
    return out;
  }

  function starNamesIn(palaces) {
    var out = [];
    for (var i = 0; i < palaces.length; i++) {
      for (var j = 0; j < palaces[i].stars.length; j++) out.push(palaces[i].stars[j].name);
    }
    return out;
  }

  function anyIn(palaces, group) {
    var names = starNamesIn(palaces);
    for (var i = 0; i < group.length; i++) if (names.indexOf(group[i]) >= 0) return true;
    return false;
  }

  function countIn(palaces, group) {
    var names = starNamesIn(palaces);
    var n = 0;
    for (var i = 0; i < group.length; i++) if (names.indexOf(group[i]) >= 0) n++;
    return n;
  }

  /** 两宫相邻（命宫左右） */
  function flanked(chart, leftStar, rightStar) {
    var m = mingPalace(chart);
    if (!m) return false;
    var a = starPalace(chart, leftStar);
    var b = starPalace(chart, rightStar);
    if (!a || !b) return false;
    var adj = [ring(m.branch - 1), ring(m.branch + 1)];
    return adj.indexOf(a.branch) >= 0 && adj.indexOf(b.branch) >= 0;
  }

  function hasHua(p, hua) {
    if (!p) return false;
    for (var i = 0; i < p.stars.length; i++) if (p.stars[i].hua === hua) return true;
    return false;
  }

  function countHuaIn(palaces, group) {
    var n = 0;
    for (var i = 0; i < palaces.length; i++) {
      for (var j = 0; j < palaces[i].stars.length; j++) {
        if (group.indexOf(palaces[i].stars[j].hua) >= 0) n++;
      }
    }
    return n;
  }

  function namedPalace(chart, pname) {
    for (var i = 0; i < chart.palaces.length; i++) {
      if (chart.palaces[i].name === pname) return chart.palaces[i];
    }
    return null;
  }

  function rec(name, tier, text, where, cite) {
    return { name: name, tier: tier, text: text, where: where || [], cite: cite || '《紫微斗数全书》' };
  }

  /* ── 判读规则 ──────────────────────────────────── */

  /** 上格：帝星得辅，群臣朝拱 */
  function ruleJunChen(chart) {
    var m = mingPalace(chart);
    if (!m) return null;
    var hasEmperor = hasStar(m, '紫微') || hasStar(m, '天府');
    if (!hasEmperor) return null;
    var tj = starPalace(chart, '天机');
    var tl = starPalace(chart, '天梁');
    var zy = starPalace(chart, '左辅') || starPalace(chart, '右弼');
    if (tj && tl && zy) {
      return rec('君臣庆会格', 'top',
        '帝星坐命，天机天梁同会，更得辅弼相佐。格局主得人拥戴、可任大事，宜从政、掌权或统领团队。',
        [m.name], '《紫微斗数全书·诸星问答论》');
    }
    return null;
  }

  /** 上格：紫微天府同宫 */
  function ruleZiFu(chart) {
    var m = mingPalace(chart);
    if (!m || !hasStar(m, '紫微') || !hasStar(m, '天府')) return null;
    return rec('紫府同宫格', 'top',
      '紫微天府共守命宫。帝星主贵、库星主富，二星同垣主一生富足安泰，气度宽厚能容人，善聚财亦善守成。',
      [m.name]);
  }

  /** 上格：府相朝垣 */
  function ruleFuXiang(chart) {
    var m = mingPalace(chart);
    if (!m) return null;
    var mMain = mainStars(m);
    var opp = palaceAt(chart, m.branch + 6);
    var oMain = mainStars(opp);
    var a = mMain.indexOf('天府') >= 0 && oMain.indexOf('天相') >= 0;
    var b = mMain.indexOf('天相') >= 0 && oMain.indexOf('天府') >= 0;
    if (!a && !b) return null;
    return rec('府相朝垣格', 'top',
      '天府天相于对宫相朝。主为人稳重踏实、处事有分寸，得众人敬重，宜管理、财务、行政类职务。',
      [m.name]);
  }

  /** 上格：阳梁昌禄 */
  function ruleYangLiangChangLu(chart) {
    var m = mingPalace(chart);
    if (!m || !hasStar(m, '天梁')) return null;
    var t = triad(chart, m.branch);
    if (!anyIn(t, ['文昌'])) return null;
    if (!anyIn(t, ['禄存']) && countHuaIn(t, ['禄']) === 0) return null;
    return rec('阳梁昌禄格', 'top',
      '天梁坐命，文昌与禄星会照。主聪颖好学、考场顺遂，宜文教、学术、公职，一生以才名立身。',
      [m.name]);
  }

  /** 上格：辅弼夹命 */
  function ruleFuBiJia(chart) {
    if (!flanked(chart, '左辅', '右弼')) return null;
    return rec('辅弼夹命格', 'aid',
      '左辅右弼分居命宫两侧。主一生多得外力相助，逢难必遇贵人，宜与人合作而非独行。',
      ['命宫'], '《紫微斗数全书》');
  }

  /** 上格：魁钺夹命 */
  function ruleKuiYueJia(chart) {
    if (!flanked(chart, '天魁', '天钺')) return null;
    return rec('魁钺夹命格', 'aid',
      '天魁天钺夹拱命宫。魁钺为贵人星，主逢凶化吉、常得提携，科名之路较顺。',
      ['命宫']);
  }

  /** 上格：禄权科三奇加会 */
  function ruleSanQi(chart) {
    var m = mingPalace(chart);
    if (!m) return null;
    var n = countHuaIn(triad(chart, m.branch), LUCKY_HUA);
    if (n < 3) return null;
    return rec('三奇加会格', 'top',
      '禄权科三奇齐聚三方。格局清贵，主一生顺遂、名利兼得，宜在专业领域建立声望。',
      [m.name]);
  }

  /** 上格：双禄朝垣 */
  function ruleShuangLu(chart) {
    var m = mingPalace(chart);
    if (!m) return null;
    var t = triad(chart, m.branch);
    var n = countHuaIn(t, ['禄']);
    if (hasStar(m, '禄存')) n++;
    if (n < 2) return null;
    return rec('双禄朝垣格', 'top',
      '两重禄星会照命宫。主财源丰沛、衣食无忧，善经营理财，一生不为钱财所困。',
      [m.name]);
  }

  /** 中格：廉贞天相同宫 */
  function ruleLianXiang(chart) {
    var l = starPalace(chart, '廉贞');
    var x = starPalace(chart, '天相');
    if (!l || !x || l.branch !== x.branch) return null;
    return rec('廉相格', 'fair',
      '廉贞天相同垣。主为人守原则、重情义，宜政法、公职、司法，忌在小利上计较。',
      [l.name]);
  }

  /** 中格：武曲七杀 */
  function ruleWuQiSha(chart) {
    var w = starPalace(chart, '武曲');
    var q = starPalace(chart, '七杀');
    if (!w || !q || w.branch !== q.branch) return null;
    return rec('武曲七杀格', 'fair',
      '武曲七杀同宫。主刚毅果决、能吃苦耐劳，宜技术、军警、创业，最忌优柔寡断。',
      [w.name]);
  }

  /** 中格：天同天梁 */
  function ruleTongLiang(chart) {
    var t = starPalace(chart, '天同');
    var l = starPalace(chart, '天梁');
    if (!t || !l || t.branch !== l.branch) return null;
    return rec('同梁格', 'fair',
      '天同天梁同宫。主性情温和、有福有寿，宜文职、教育、服务，忌懒散安逸。',
      [t.name]);
  }

  /** 中格：日月同宫 */
  function ruleRiYueTong(chart) {
    var r = starPalace(chart, '太阳');
    var y = starPalace(chart, '太阴');
    if (!r || !y || r.branch !== y.branch) return null;
    return rec('日月同宫格', 'fair',
      '太阳太阴同垣。主阴阳调和，然心思易反复，宜立志专一、忌三心二意。',
      [r.name]);
  }

  /** 中格：日月夹命 */
  function ruleRiYueJia(chart) {
    if (!flanked(chart, '太阳', '太阴')) return null;
    return rec('日月夹命格', 'aid',
      '日月双星夹拱命宫。主得长辈或父母双方扶持，一生少遇大凶险。',
      ['命宫']);
  }

  /** 中格：巨日同宫 */
  function ruleJuRi(chart) {
    var j = starPalace(chart, '巨门');
    var r = starPalace(chart, '太阳');
    if (!j || !r || j.branch !== r.branch) return null;
    return rec('巨日同宫格', 'fair',
      '巨门太阳同垣。主口才出众但易招是非，宜以言语文字立身，忌与人争强斗口。',
      [j.name]);
  }

  /** 中格：杀破狼 */
  function ruleShaPoLang(chart) {
    var m = mingPalace(chart);
    if (!m) return null;
    if (countIn(triad(chart, m.branch), SHA_PO_LANG) < 2) return null;
    return rec('杀破狼格', 'fair',
      '七杀破军贪狼会于三方。主一生变动频繁，宜开拓、创新、创业或武职，守成反而不吉。',
      [m.name]);
  }

  /** 中格：机月同梁 */
  function ruleJiYueTongLiang(chart) {
    var m = mingPalace(chart);
    if (!m) return null;
    var t = triad(chart, m.branch);
    var n = countIn(t, YUE_LIANG_TONG_JI);
    if (n >= 3) {
      return rec('机月同梁格', 'fair',
        '天机太阴天同天梁四星多会命宫。主心思细腻、谋划周全，宜公职、文教、企划，按部就班则吉。',
        [m.name]);
    }
    if (n === 2) {
      return rec('机月同梁·半格', 'fair',
        '四星中有二星会照。主思路清晰、适合技术或企划类工作，宜稳中求进。',
        [m.name]);
    }
    return null;
  }

  /** 中格：武贪 */
  function ruleWuTan(chart) {
    var m = mingPalace(chart);
    if (!m || !hasStar(m, '武曲')) return null;
    if (!anyIn(triad(chart, m.branch), ['贪狼'])) return null;
    return rec('武贪格', 'fair',
      '武曲贪狼会照命宫。古诀「武贪不发少年人」，主先苦后甘、中年发迹，宜经商或技术兴业。',
      [m.name]);
  }

  /** 中格：紫微入命 */
  function ruleZiWeiMing(chart) {
    var m = mingPalace(chart);
    if (!m || !hasStar(m, '紫微')) return null;
    return rec('紫微入命格', 'fair',
      '紫微帝星坐守命宫。主气度不凡、有天然领导力，宜任事掌权，忌孤高自傲难纳谏言。',
      [m.name]);
  }

  /** 助力：昌曲夹命 */
  function ruleChangQuJia(chart) {
    if (!flanked(chart, '文昌', '文曲')) return null;
    return rec('昌曲夹命格', 'aid',
      '文昌文曲夹拱命宫。主天资聪颖、富文采，宜学术、文书、考试，一生近贵人。',
      ['命宫']);
  }

  /** 助力：化禄入命 */
  function ruleHuaLuMing(chart) {
    var m = mingPalace(chart);
    if (!m) return null;
    var ok = false;
    for (var i = 0; i < m.stars.length; i++) {
      if (m.stars[i].hua === '禄' && m.stars[i].kind === 'main') ok = true;
    }
    if (!ok) return null;
    return rec('化禄入命格', 'aid',
      '主星化禄入命宫。主衣食丰足、人缘佳、善经营，财禄随身。',
      [m.name]);
  }

  /** 助力：化禄入财帛 */
  function ruleHuaLuCai(chart) {
    var c = namedPalace(chart, '财帛');
    if (!hasHua(c, '禄')) return null;
    return rec('化禄入财帛格', 'aid',
      '化禄入财帛宫。主财路顺畅，适宜经营理财、以财生财。',
      [c.name]);
  }

  /** 助力：化权入官禄 */
  function ruleHuaQuanGuan(chart) {
    var g = namedPalace(chart, '官禄');
    if (!hasHua(g, '权')) return null;
    return rec('化权入官禄格', 'aid',
      '化权入官禄宫。主事业心强、能掌实权，宜管理岗位或自主创业。',
      [g.name]);
  }

  /** 助力：化科入命或身 */
  function ruleHuaKeMingShen(chart) {
    var m = mingPalace(chart);
    var s = palaceAt(chart, chart.shenBranch);
    if (!hasHua(m, '科') && !hasHua(s, '科')) return null;
    return rec('化科入命身格', 'aid',
      '化科落命宫或身宫。主一生有名声、得人敬重，宜学术文教，以清誉立身。',
      [m ? m.name : '命宫']);
  }

  /** 助力：昌曲同会 */
  function ruleChangQuHui(chart) {
    if (countIn(chart.palaces, CHANG_QU) < 2) return null;
    return rec('昌曲同会格', 'aid',
      '文昌文曲同现盘中。主聪明多才、文采斐然，宜考试、文书、学术之路。', []);
  }

  /** 助力：辅弼同会 */
  function ruleFuBiHui(chart) {
    if (countIn(chart.palaces, ZUO_YOU) < 2) return null;
    return rec('辅弼同会格', 'aid',
      '左辅右弼同现盘中。主得人助力，宜团队协作、带领他人共事。', []);
  }

  /** 助力：魁钺同会 */
  function ruleKuiYueHui(chart) {
    if (countIn(chart.palaces, KUI_YUE) < 2) return null;
    return rec('魁钺同会格', 'aid',
      '天魁天钺同现盘中。主一生贵人相助，遇难呈祥、逢凶化吉。', []);
  }

  /** 助力：科权双会 */
  function ruleKeQuanHui(chart) {
    var n = 0;
    for (var i = 0; i < chart.palaces.length; i++) {
      for (var j = 0; j < chart.palaces[i].stars.length; j++) {
        var h = chart.palaces[i].stars[j].hua;
        if (h === '科' || h === '权') n++;
      }
    }
    if (n < 2) return null;
    return rec('科权双会格', 'aid',
      '科权二星会照。主名利兼顾，宜在专业领域靠真本事扬名。', []);
  }

  /** 助力：天马入命 */
  function ruleTianMaMing(chart) {
    var m = mingPalace(chart);
    if (!m || !hasStar(m, '天马')) return null;
    return rec('天马入命格', 'aid',
      '天马入命宫。主一生多动，宜外出发展、贸易运输，守在原处反而不利。',
      [m.name]);
  }

  /** 助力：禄存守身 */
  function ruleLuCunShen(chart) {
    var l = starPalace(chart, '禄存');
    if (!l || l.branch !== chart.shenBranch) return null;
    return rec('禄存守身格', 'aid',
      '禄存坐守身宫。主晚年安定、衣食不缺，宜稳健理财、不宜冒险。',
      [l.name]);
  }

  /** 恶格：火铃入命 */
  function ruleHuoLingMing(chart) {
    var m = mingPalace(chart);
    if (!m || (!hasStar(m, '火星') && !hasStar(m, '铃星'))) return null;
    return rec('火铃入命格', 'warn',
      '火星或铃星入命宫。主性急易怒、行事突变，宜修心养性，忌冲动做重大决定。',
      [m.name]);
  }

  /** 恶格：羊陀夹忌 */
  function ruleYangTuoJiaJi(chart) {
    var m = mingPalace(chart);
    if (!m) return null;
    if ((!hasStar(m, '擎羊') && !hasStar(m, '陀罗')) || !hasHua(m, '忌')) return null;
    return rec('羊陀夹忌格', 'warn',
      '擎羊陀罗与化忌同缠命宫。主刑伤破耗，宜安分守己避祸，忌贪快钱、走捷径。',
      [m.name]);
  }

  /** 恶格：空劫入命 */
  function ruleKongJieMing(chart) {
    var m = mingPalace(chart);
    if (!m || countIn([m], KONG_JIE) < 1) return null;
    return rec('空劫入命格', 'warn',
      '地空地劫入命宫。主钱财易散，宜务实不宜投机；反与玄学、宗教、哲思有缘。',
      [m.name]);
  }

  /** 恶格：化忌入命或迁 */
  function ruleHuaJiMingQian(chart) {
    var m = mingPalace(chart);
    if (!m) return null;
    var q = palaceAt(chart, m.branch + 6);
    if (!hasHua(m, '忌') && !hasHua(q, '忌')) return null;
    return rec('化忌入命/迁格', 'warn',
      '化忌落于命宫或迁移宫。主一生多阻滞，宜守不宜攻，忌恃强硬闯。',
      [m.name]);
  }

  /** 恶格：廉贞逢煞 */
  function ruleLianZhenSha(chart) {
    var l = starPalace(chart, '廉贞');
    if (!l || countIn([l], FOUR_SHA) < 1) return null;
    return rec('廉贞逢煞格', 'warn',
      '廉贞与煞星同宫。主性情刚烈易生是非，宜守法守分、避免纠纷与官司。',
      [l.name]);
  }

  /** 恶格：巨火羊 */
  function ruleJuHuoYang(chart) {
    var j = starPalace(chart, '巨门');
    if (!j) return null;
    if (!hasStar(j, '火星') && !hasStar(j, '擎羊')) return null;
    return rec('巨火羊格', 'warn',
      '巨门会火羊。古书称口舌是非极重，易招官非，宜慎言、少与人争辩。',
      [j.name]);
  }

  /** 恶格：火铃夹命 */
  function ruleHuoLingJia(chart) {
    var m = mingPalace(chart);
    if (!m) return null;
    if (countIn([m], ['火星', '铃星', '擎羊', '陀罗']) < 2) return null;
    return rec('煞星重会命宫', 'warn',
      '命宫同见二煞以上。主性情急躁、行事冲动，易遇突发变故，宜修心养性。',
      [m.name]);
  }

  /* ── 规则表 ────────────────────────────────────── */

  var RULES = [
    ruleJunChen, ruleZiFu, ruleFuXiang, ruleYangLiangChangLu,
    ruleSanQi, ruleShuangLu,
    ruleLianXiang, ruleWuQiSha, ruleTongLiang, ruleRiYueTong,
    ruleJuRi, ruleShaPoLang, ruleJiYueTongLiang, ruleWuTan, ruleZiWeiMing,
    ruleFuBiJia, ruleKuiYueJia, ruleChangQuJia, ruleHuaLuMing,
    ruleHuaLuCai, ruleHuaQuanGuan, ruleHuaKeMingShen,
    ruleChangQuHui, ruleFuBiHui, ruleKuiYueHui, ruleKeQuanHui,
    ruleTianMaMing, ruleLuCunShen, ruleRiYueJia,
    ruleHuoLingMing, ruleYangTuoJiaJi, ruleKongJieMing,
    ruleHuaJiMingQian, ruleLianZhenSha, ruleJuHuoYang, ruleHuoLingJia
  ];

  /** 主入口 */
  function detect(chart) {
    if (!chart || !chart.palaces || typeof chart.mingBranch !== 'number') return [];
    var seen = {};
    var out = [];
    for (var i = 0; i < RULES.length; i++) {
      var r = null;
      try { r = RULES[i](chart); } catch (e) { r = null; }
      if (!r || seen[r.name]) continue;
      seen[r.name] = 1;
      out.push(r);
    }
    // 排序：上格 → 中格 → 助力 → 恶格
    var order = { top: 0, fair: 1, aid: 2, warn: 3 };
    out.sort(function (a, b) { return (order[a.tier] || 9) - (order[b.tier] || 9); });
    return out;
  }

  global.ZW = global.ZW || {};
  global.ZW.patterns = { detect: detect, ZHI: ZHI };
})(typeof window !== 'undefined' ? window : this);
