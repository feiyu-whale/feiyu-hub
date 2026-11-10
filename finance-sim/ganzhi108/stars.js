/* ganzhi108.js — 天罡地煞 108 格棋盘数据
 * 作用：生成 108 个星位的名称与效果（天罡 36 + 地煞 72）
 * 来源：老爹 2026-10-17 提供的传统星名名单（只作编号/命名，不涉神格科仪）
 * 输入输出：全局变量 STARS（数组，108 项）
 */
var GANG34 = "天魁星|天罡星|天机星|天闲星|天勇星|天雄星|天猛星|天威星|天英星|天贵星|天富星|天满星|天孤星|天伤星|天立星|天捷星|天暗星|天佑星|天空星|天速星|天异星|天杀星|天微星|天究星|天退星|天寿星|天剑星|天平星|天罪星|天损星|天败星|天牢星|天慧星|天暴星|天哭星|天巧星".split("|");

var DI72 = "地魁星|地煞星|地勇星|地杰星|地雄星|地威星|地英星|地奇星|地猛星|地文星|地正星|地阔星|地阖星|地强星|地暗星|地轴星|地会星|地佐星|地佑星|地灵星|地兽星|地微星|地慧星|地暴星|地然星|地猖星|地狂星|地飞星|地走星|地巧星|地明星|地进星|地退星|地满星|地遂星|地周星|地隐星|地异星|地理星|地俊星|地乐星|地捷星|地速星|地镇星|地稽星|地魔星|地妖星|地幽星|地伏星|地僻星|地空星|地孤星|地全星|地短星|地角星|地囚星|地藏星|地平星|地损星|地奴星|地察星|地恶星|地丑星|地数星|地阴星|地刑星|地壮星|地劣星|地健星|地耗星|地贼星|地狗星".split("|");

/* 效果类型
 * gain  : 加成（收入）
 * lose  : 损失（支出）
 * all   : 全场影响（对其他玩家）
 * move  : 位移
 * free  : 无效果（空地）
 */
var EFFECTS = {
  "天富星": { type:"gain", amount:500, text:"天富星 · 从天而降，拿 500" },
  "天贵星": { type:"gain", amount:300, text:"天贵星 · 贵族气，拿 300" },
  "天满星": { type:"gain", amount:200, text:"天满星 · 粮仓满，拿 200" },
  "天慧星": { type:"gain", amount:250, text:"天慧星 · 一点灵光，拿 250" },
  "天福星": { type:"gain", amount:300, text:"天福星 · 有福，拿 300" },
  "天杀星": { type:"all",   amount:-200, text:"天杀星 · 杀气起，全场每人扣 200" },
  "天灾星": { type:"lose",  amount:300, text:"天灾星 · 破财，扣 300" },
  "天败星": { type:"lose",  amount:200, text:"天败星 · 亏空，扣 200" },
  "天牢星": { type:"move",  to:0,     text:"天牢星 · 被关，回到起点" },
  "天速星": { type:"move",  step:5,   text:"天速星 · 快人一步，前进 5 格" },
  "天退星": { type:"move",  step:-4,  text:"天退星 · 退后 4 格" },
  "天异星": { type:"gain",  amount:150, text:"天异星 · 怪事，反倒拿了 150" },

  "地财星": { type:"gain",  amount:200, text:"地财星 · 四处生财，拿 200" },
  "地富星": { type:"gain",  amount:400, text:"地富星 · 土里刨金，拿 400" },
  "地贼星": { type:"lose",  amount:250, text:"地贼星 · 被偷了，扣 250" },
  "地耗星": { type:"lose",  amount:150, text:"地耗星 · 白白消耗，扣 150" },
  "地恶星": { type:"lose",  amount:200, text:"地恶星 · 遇恶人，扣 200" },
  "地弱星": { type:"lose",  amount:100, text:"地弱星 · 虚耗，扣 100" },
  "地进星": { type:"move",  step:3,   text:"地进星 · 步步进，前进 3 格" },
  "地退星": { type:"move",  step:-3,  text:"地退星 · 退三步" },
  "地飞星": { type:"move",  step:7,   text:"地飞星 · 一飞冲天，前进 7 格" },
  "地走星": { type:"move",  step:6,   text:"地走星 · 脚下生风，前进 6 格" },
  "地灵星": { type:"gain",  amount:180, text:"地灵星 · 有灵，拿 180" }
};

/* 生成 108 星位：天罡在前，地煞在后 */
function buildStars(){
  var list = [];
  var i, n;
  for(i=0;i<GANG34.length;i++){
    n = GANG34[i];
    list.push({ name:n, kind:"gang", idx:i, effect:EFFECTS[n] || null });
  }
  for(i=0;i<DI72.length;i++){
    n = DI72[i];
    list.push({ name:n, kind:"di", idx:i, effect:EFFECTS[n] || null });
  }
  return list;
}

var STARS = buildStars();
