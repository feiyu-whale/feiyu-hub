// 古今中外度量衡 · 数据层
// 数据来源（中国历代）：参考 iOS106/CN-Dynastic-Measures（Apache-2.0，© 2025 焉寻 / 李恒通）
//   本项目仅取其"朝代 → 单位系数（以现代公制为基准）"的事实性数据，并按 Apache-2.0 要求署名。
// 数据来源（英美制）：NIST Handbook 44, Appendix C「General Tables of Units of Measurement」(2026版)
//   美国国家标准与技术研究院官方公开文件；英制/美制/金衡/药衡换算系数均为其法定值。
// 数据来源（古罗马）：duncanscott/units-of-measurement (MIT) —— system=Ancient Roman，共 73 个单位
//   原数据以 SI 基准（m/kg/m³/m²）给出，本文件换算为 cm/g/ml 并对齐本项目基准单位。
// 2026-10-16 新建
//
// 结构说明：
//   CATS[类别] = { base: 基准单位中文名, baseKey: 基准单位键, groups: { 组id: {name, units:{键:相对基准的系数}} } }
//   换算：值 × groups[from].units[u1] / groups[to].units[u2]

const MEASURE_DATA = {
  length: {
    base: "厘米", baseKey: "cm",
    groups: {
      modern:   { name: "现代公制", units: { km:100000, m:100, dm:10, cm:1, mm:0.1 } },
      shang:    { name: "商朝",     units: { chi:16, cun:1.6, fen:0.16 } },
      zhou:     { name: "周/战国",  units: { zhang:231, chi:23.1, cun:2.31, fen:0.231 } },
      han:      { name: "秦/汉",    units: { yin:2310, zhang:231, chi:23.1, cun:2.31, fen:0.231 } },
      tang:     { name: "唐朝",     units: { zhang:303, chi:30.3, cun:3.03, fen:0.303 } },
      song:     { name: "宋朝",     units: { zhang:314, chi:31.4, cun:3.14, fen:0.314 } },
      yuan:     { name: "元朝",     units: { zhang:350, chi:35, cun:3.5, fen:0.35 } },
      ming:     { name: "明/清",    units: { zhang:320, chi:32, cun:3.2, fen:0.32 } },
      market:   { name: "现代市制", units: { zhang:333.33, chi:33.33, cun:3.333, fen:0.3333 } },
      rome:     { name: "古罗马", units: { actus:3552.0, cubitum:44.4, decempeda:296.0, digitus:1.85, gradus:74.0, leuga:222000.0, mille_passus:148000.0, palmipes:37.0, palmus:7.4, palmus_maior:22.2, passus:148.0, pes:29.6, stadium:18500.0, uncia:2.4666666667 } }
    }
  },
  volume: {
    base: "毫升", baseKey: "ml",
    groups: {
      modern:   { name: "现代公制", units: { l:1000, ml:1 } },
      han:      { name: "秦/汉",    units: { hu:20000, dou:2000, sheng:200, ge:20, yue:2 } },
      tang:     { name: "唐朝",     units: { hu:60000, dou:6000, sheng:600, ge:60 } },
      song:     { name: "宋朝",     units: { shi:70200, hu:35100, dou:7020, sheng:702, ge:70 } },
      yuan:     { name: "元朝",     units: { shi:100300, hu:50150, dou:10030, sheng:1003, ge:100 } },
      ming:     { name: "明/清",    units: { shi:103500, hu:51750, dou:10350, sheng:1035, ge:103.5 } },
      market:   { name: "现代市制", units: { shi:100000, dou:10000, sheng:1000, ge:100 } },
      rome:     { name: "古罗马", units: { acetabulum:0.0675373333, amphorae_quadrantal:25.934336, congius:3.241792, culeus:518.68672, cyathus:0.0450248889, hemina:0.2701493333, ligula:0.0112562222, modius:8.6447786667, modius_castrensis:12.967168, quartarius:0.1350746667, semimodius:4.3223893333, sextarius:0.5402986667, urna:12.967168 } }
    }
  },
  weight: {
    base: "克", baseKey: "g",
    groups: {
      modern:   { name: "现代公制", units: { kg:1000, g:1, mg:0.001 } },
      han:      { name: "秦/西汉",  units: { shi:30000, jun:7500, jin:250, liang:15.625, zhu:0.65, lei:0.065, shu:0.0065 } },
      dhan:     { name: "东汉",     units: { shi:26400, jun:6600, jin:220, liang:13.75, zhu:0.573, lei:0.0573, shu:0.00573 } },
      tang:     { name: "唐朝",     units: { shi:79200, jin:660, liang:41.25, qian:4.125, zhu:1.72, lei:0.172 } },
      song:     { name: "宋/元",    units: { shi:76800, jin:640, liang:40, qian:4, fen:0.4, li:0.04, hao:0.004 } },
      ming:     { name: "明/清",    units: { shi:71616, jin:596.8, liang:37.3, qian:3.73, fen:0.373, li:0.0373, hao:0.00373 } },
      market:   { name: "现代市制", units: { jin:500, liang:50, qian:5 } },
      rome:     { name: "古罗马", units: { bes:219.2666666667, deunx:301.4916666667, dextans:274.0833333333, dodrans:246.675, duella:9.1361111111, libra:328.9, obolus:0.5710069444, quadrans_teruncius:82.225, quincunx:137.0416666667, scrupulum:1.1420138889, semis:164.45, semisextula:2.2840277778, semuncia:13.7041666667, septunx:191.8583333333, sescuncia:41.1125, sextans:54.8166666667, sextula:4.5680555556, sicilicus:6.8520833333, siliqua:0.1903356481, triens:109.6333333333, uncia:27.4083333333 } }
    }
  }
};

// 单位中文名（简）
const MEASURE_UNIT_NAMES = {
  km:"千米", m:"米", dm:"分米", cm:"厘米", mm:"毫米",
  yin:"引", zhang:"丈", chi:"尺", cun:"寸", fen:"分",
  l:"升", ml:"毫升", shi:"石", hu:"斛", dou:"斗", sheng:"升", ge:"合", yue:"龠",
  kg:"千克", g:"克", mg:"毫克", jun:"钧", jin:"斤", liang:"两", qian:"钱", li:"厘", hao:"毫",
  zhu:"铢", lei:"累", shu:"黍",
  // 古罗马（保留拉丁原名，附中文通译）
  pes:"罗马尺", digitus:"指", palmus:"掌", palmus_maior:"大掌", palmipes:"足掌",
  cubitum:"肘", passus:"步", gradus:"双步", actus:"阿克图斯", decempeda:"十尺杆",
  stadium:"斯塔德", mille_passus:"罗马里", leuga:"里格(高卢)", uncia:"罗马寸",
  libra:"罗马磅", scrupulum:"斯克鲁普", siliqua:"角豆粒", obolus:"奥波尔",
  sextula:"塞克斯图拉", duella:"杜埃拉", semuncia:"半盎司", semis:"半磅",
  bes:"贝斯", deunx:"德翁克斯", dextans:"德克斯坦", dodrans:"多德兰",
  quincunx:"昆昆克斯", septunx:"塞普顿克斯", sextans:"塞克斯坦", triens:"特里恩斯",
  semisextula:"半塞克斯图拉", sescuncia:"塞斯昆西亚", sicilicus:"西西里库斯",
  quadrans_teruncius:"四分一", amphorae_quadrantal:"双耳罐", congius:"康吉",
  sextarius:"塞克斯塔", hemina:"海米纳", quartarius:"夸塔里", cyathus:"基亚图斯",
  acetabulum:"阿塞塔布卢姆", ligula:"利古拉", modius:"莫迪", modius_castrensis:"军营莫迪",
  semimodius:"半莫迪", urna:"瓮", culeus:"大桶"
};

// 类别中文名
const MEASURE_CAT_NAMES = { length:"长度", volume:"容量", weight:"重量" };
