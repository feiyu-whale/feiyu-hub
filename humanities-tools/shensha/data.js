/* data.js — 神煞名录数据
 * 作用：提供建除十二神 / 六曜 / 二十八宿 名录（纯数据，无逻辑）
 * 来源：老爹 2026-10-17 提供（出处：九店楚简·云梦秦简《日书》/《淮南子·天文训》/《协纪辨方书》/《吕氏春秋》）
 * 输入输出：全局常量 SHENSHA_DATA，供 index.html 读取渲染
 */
const SHENSHA_DATA = {
  jianchu: {
    title: "建除十二神",
    source: "战国末年已有；九店楚简、云梦秦简《日书》记载，推演法见《淮南子·天文训》，后世《钦定协纪辨方书》列为择日核心",
    rule: "以月建为起点（正月建寅，则寅日为「建」），十二神每日轮值，周而复始",
    items: [
      {name:"建", type:"凶", alias:"兵福"},
      {name:"除", type:"吉", alias:"吉期"},
      {name:"满", type:"凶", alias:"福德"},
      {name:"平", type:"凶", alias:"死神"},
      {name:"定", type:"吉", alias:"时阴"},
      {name:"执", type:"吉", alias:"枝德"},
      {name:"破", type:"凶", alias:"大耗"},
      {name:"危", type:"吉", alias:"极富"},
      {name:"成", type:"吉", alias:"天医"},
      {name:"收", type:"凶", alias:"福德"},
      {name:"开", type:"吉", alias:"时阳"},
      {name:"闭", type:"凶", alias:"血支"}
    ]
  },
  rokuyo: {
    title: "六曜",
    source: "源于中国传统历注，与「小六壬」有渊源，14 世纪传入日本；中国本土渐式微，日本保留演变至今",
    rule: "旧历月份 + 日期，除以 6 取余：余0=大安，1=赤口，2=先胜，3=友引，4=先负，5=佛灭",
    items: [
      {name:"先胜", meaning:"上午吉，下午凶，宜速战速决"},
      {name:"友引", meaning:"朝夕吉，午时凶，忌丧事，宜婚礼"},
      {name:"先负", meaning:"上午凶，下午吉，宜静不宜动"},
      {name:"佛灭", meaning:"大凶之日，诸事不宜"},
      {name:"大安", meaning:"大吉之日，诸事皆宜"},
      {name:"赤口", meaning:"凶日，仅午时吉"}
    ]
  },
  xiu: {
    title: "二十八宿",
    source: "中国古代天文学核心坐标体系，至迟春秋末期形成，名称最早见于《吕氏春秋》；后与四象结合用于占星择日。配兽参考《夜航船》等古籍",
    rule: "四象分组，自西向东：东方苍龙 / 北方玄武 / 西方白虎 / 南方朱雀",
    items: [
      {name:"角", group:"东方苍龙", animal:"蛟"},
      {name:"亢", group:"东方苍龙", animal:"龙"},
      {name:"氐", group:"东方苍龙", animal:"貉"},
      {name:"房", group:"东方苍龙", animal:"兔"},
      {name:"心", group:"东方苍龙", animal:"狐"},
      {name:"尾", group:"东方苍龙", animal:"虎"},
      {name:"箕", group:"东方苍龙", animal:"豹"},
      {name:"斗", group:"北方玄武", animal:"獬"},
      {name:"牛", group:"北方玄武", animal:"牛"},
      {name:"女", group:"北方玄武", animal:"蝠"},
      {name:"虚", group:"北方玄武", animal:"鼠"},
      {name:"危", group:"北方玄武", animal:"燕"},
      {name:"室", group:"北方玄武", animal:"猪"},
      {name:"壁", group:"北方玄武", animal:"貐"},
      {name:"奎", group:"西方白虎", animal:"狼"},
      {name:"娄", group:"西方白虎", animal:"狗"},
      {name:"胃", group:"西方白虎", animal:"雉"},
      {name:"昴", group:"西方白虎", animal:"鸡"},
      {name:"毕", group:"西方白虎", animal:"乌"},
      {name:"觜", group:"西方白虎", animal:"猴"},
      {name:"参", group:"西方白虎", animal:"猿"},
      {name:"井", group:"南方朱雀", animal:"犴"},
      {name:"鬼", group:"南方朱雀", animal:"羊"},
      {name:"柳", group:"南方朱雀", animal:"獐"},
      {name:"星", group:"南方朱雀", animal:"马"},
      {name:"张", group:"南方朱雀", animal:"鹿"},
      {name:"翼", group:"南方朱雀", animal:"蛇"},
      {name:"轸", group:"南方朱雀", animal:"蚓"}
    ]
  }
};
