/* 大六壬排盘引擎 · 单文件打包（零依赖，除内联 lunar.js）
 * 来源：ChesterRa/mingpan (Apache-2.0) daliuren 模块
 * 算法参考：kentang2017/kinliuren (MIT) ·《大六壬大全》·《六壬粹言》
 * 纯本地计算 · 无网络 · 无 eval · 需页面先加载 lib/lunar.js（提供全局 Solar）
 */
(function(root){'use strict';
var __m__={},__c__={};
function __req__(id){
  if(id==='lunar-javascript'){return {Solar:root.Solar,Lunar:root.Lunar};}
  if(__c__[id])return __c__[id].exports;
  var m={exports:{}};__c__[id]=m;__m__[id](m,m.exports,__req__);return m.exports;}
__m__['./types.js']=function(module,exports,require){
"use strict";
/**
 * 大六壬服務類型定義
 *
 * 設計原則：
 * - 排盤層：MCP 負責，輸出確定性結構
 * - 斷課層：交給 Agent/LLM
 * - 參考來源：kentang2017/kinliuren (MIT License)
 *
 * 大六壬核心概念：
 * - 天地盤：以月將加時辰起盤
 * - 四課：由日干支推演
 * - 三傳：由四課通過九宗門推演
 * - 十二天將：貴人起點順逆排布
 */
Object.defineProperty(exports, "__esModule", { value: true });
//# sourceMappingURL=types.js.map
};
__m__['./data/constants.js']=function(module,exports,require){
"use strict";
/**
 * 大六壬常量數據
 *
 * 參考來源：
 * - kentang2017/kinliuren (MIT License)
 * - 《大六壬大全》
 * - 《六壬粹言》
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GAN_ZHI_SAME_POSITION = exports.BA_ZHUAN_DAYS = exports.YUE_MA_MAP = exports.RI_MA = exports.ZHI_HAI = exports.ZHI_HE = exports.ZHI_XING = exports.ZHI_CHONG = exports.JIA_ZI_60 = exports.XUN_KONG = exports.DAY_NIGHT_MAP = exports.GUIREN_START = exports.JIEQI_ALIAS = exports.JIEQI_YUE_JIANG = exports.GAN_JI_GONG = exports.LIUQIN_MAP = exports.WUXING_RELATION = exports.ZHI_WUXING = exports.GAN_WUXING = exports.YUE_JIANG_MAP = exports.TIAN_JIANG_FULL = exports.TIAN_JIANG = exports.DI_ZHI = exports.TIAN_GAN = void 0;
exports.normalizeJieQiName = normalizeJieQiName;
// ============================================
// 基礎序列
// ============================================
/** 十天干 */
exports.TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
/** 十二地支 */
exports.DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
/** 十二天將（順序） */
exports.TIAN_JIANG = ['貴', '蛇', '雀', '合', '勾', '龍', '空', '虎', '常', '玄', '陰', '后'];
/** 十二天將全稱 */
exports.TIAN_JIANG_FULL = {
    '貴': '貴人',
    '蛇': '螣蛇',
    '雀': '朱雀',
    '合': '六合',
    '勾': '勾陳',
    '龍': '青龍',
    '空': '天空',
    '虎': '白虎',
    '常': '太常',
    '玄': '玄武',
    '陰': '太陰',
    '后': '天后',
};
/** 月將名稱對應地支 */
exports.YUE_JIANG_MAP = {
    '亥': '登明',
    '戌': '河魁',
    '酉': '從魁',
    '申': '傳送',
    '未': '小吉',
    '午': '勝光',
    '巳': '太乙',
    '辰': '天罡',
    '卯': '太沖',
    '寅': '功曹',
    '丑': '大吉',
    '子': '神後',
};
// ============================================
// 五行相關
// ============================================
/** 天干五行 */
exports.GAN_WUXING = {
    '甲': '木', '乙': '木',
    '丙': '火', '丁': '火',
    '戊': '土', '己': '土',
    '庚': '金', '辛': '金',
    '壬': '水', '癸': '水',
};
/** 地支五行 */
exports.ZHI_WUXING = {
    '子': '水', '丑': '土',
    '寅': '木', '卯': '木',
    '辰': '土', '巳': '火',
    '午': '火', '未': '土',
    '申': '金', '酉': '金',
    '戌': '土', '亥': '水',
};
/** 五行生剋關係 */
exports.WUXING_RELATION = {
    // 被尅
    '火水': '被尅', '水土': '被尅', '金火': '被尅', '火金': '尅', '木金': '被尅',
    // 尅
    '水火': '尅', '土水': '尅', '金木': '尅', '木土': '尅',
    // 比和
    '火火': '比和', '水水': '比和', '金金': '比和', '木木': '比和', '土土': '比和',
    // 被生
    '火木': '被生', '水金': '被生', '木水': '被生', '土火': '被生', '金土': '被生',
    // 生
    '木火': '生', '金水': '生', '水木': '生', '火土': '生', '土金': '生',
};
/** 六親對應 */
exports.LIUQIN_MAP = {
    '被生': '父母',
    '生': '子孫',
    '尅': '妻財',
    '比和': '兄弟',
    '被尅': '官鬼',
};
// ============================================
// 日干寄宮
// ============================================
/** 日干寄宮（天干寄於地支） */
exports.GAN_JI_GONG = {
    '甲': '寅',
    '乙': '辰',
    '丙': '巳',
    '丁': '未',
    '戊': '巳',
    '己': '未',
    '庚': '申',
    '辛': '戌',
    '壬': '亥',
    '癸': '丑',
};
// ============================================
// 月將（節氣對應）
// ============================================
/** 節氣對應月將 */
exports.JIEQI_YUE_JIANG = {
    // 雨水、驚蟄 -> 亥（登明）
    '雨水': '亥', '驚蟄': '亥',
    // 春分、清明 -> 戌（河魁）
    '春分': '戌', '清明': '戌',
    // 穀雨、立夏 -> 酉（從魁）
    '穀雨': '酉', '立夏': '酉',
    // 小滿、芒種 -> 申（傳送）
    '小滿': '申', '芒種': '申',
    // 夏至、小暑 -> 未（小吉）
    '夏至': '未', '小暑': '未',
    // 大暑、立秋 -> 午（勝光）
    '大暑': '午', '立秋': '午',
    // 處暑、白露 -> 巳（太乙）
    '處暑': '巳', '白露': '巳',
    // 秋分、寒露 -> 辰（天罡）
    '秋分': '辰', '寒露': '辰',
    // 霜降、立冬 -> 卯（太沖）
    '霜降': '卯', '立冬': '卯',
    // 小雪、大雪 -> 寅（功曹）
    '小雪': '寅', '大雪': '寅',
    // 冬至、小寒 -> 丑（大吉）
    '冬至': '丑', '小寒': '丑',
    // 大寒、立春 -> 子（神後）
    '大寒': '子', '立春': '子',
};
/**
 * 節氣名簡體 → 繁體別名（本表以繁體為鍵）
 * lunar-javascript 返回簡體節氣名（如「惊蛰」），需歸一化後查表
 */
exports.JIEQI_ALIAS = {
    '惊蛰': '驚蟄',
    '谷雨': '穀雨',
    '小满': '小滿',
    '芒种': '芒種',
    '处暑': '處暑',
};
/** 歸一化節氣名（簡體/繁體輸入均可） */
function normalizeJieQiName(name) {
    return exports.JIEQI_ALIAS[name] ?? name;
}
// ============================================
// 貴人起點
// ============================================
/**
 * 貴人起點（晝夜）
 * 甲戊庚牛羊，乙己鼠猴鄉，丙丁豬雞位，壬癸蛇兔藏，六辛逢馬虎
 */
exports.GUIREN_START = {
    '甲': { day: '丑', night: '未' },
    '戊': { day: '丑', night: '未' },
    '庚': { day: '丑', night: '未' },
    '乙': { day: '子', night: '申' },
    '己': { day: '子', night: '申' },
    '丙': { day: '亥', night: '酉' },
    '丁': { day: '亥', night: '酉' },
    '壬': { day: '巳', night: '卯' },
    '癸': { day: '巳', night: '卯' },
    '辛': { day: '午', night: '寅' },
};
/** 晝夜判斷（時辰） */
exports.DAY_NIGHT_MAP = {
    '卯': '晝', '辰': '晝', '巳': '晝', '午': '晝', '未': '晝', '申': '晝',
    '酉': '夜', '戌': '夜', '亥': '夜', '子': '夜', '丑': '夜', '寅': '夜',
};
// ============================================
// 旬空
// ============================================
/** 六甲旬空 */
exports.XUN_KONG = {
    '甲子': ['戌', '亥'],
    '甲戌': ['申', '酉'],
    '甲申': ['午', '未'],
    '甲午': ['辰', '巳'],
    '甲辰': ['寅', '卯'],
    '甲寅': ['子', '丑'],
};
/** 六十甲子 */
exports.JIA_ZI_60 = (() => {
    const result = [];
    for (let i = 0; i < 60; i++) {
        result.push(exports.TIAN_GAN[i % 10] + exports.DI_ZHI[i % 12]);
    }
    return result;
})();
// ============================================
// 地支關係
// ============================================
/** 地支相沖 */
exports.ZHI_CHONG = {
    '子': '午', '午': '子',
    '丑': '未', '未': '丑',
    '寅': '申', '申': '寅',
    '卯': '酉', '酉': '卯',
    '辰': '戌', '戌': '辰',
    '巳': '亥', '亥': '巳',
};
/** 地支相刑 */
exports.ZHI_XING = {
    '寅': '巳', '巳': '申', '申': '寅', // 無恩之刑
    '丑': '戌', '戌': '未', '未': '丑', // 恃勢之刑
    '子': '卯', '卯': '子', // 無禮之刑
    '辰': '辰', '午': '午', '酉': '酉', '亥': '亥', // 自刑
};
/** 地支六合 */
exports.ZHI_HE = {
    '子': '丑', '丑': '子',
    '寅': '亥', '亥': '寅',
    '卯': '戌', '戌': '卯',
    '辰': '酉', '酉': '辰',
    '巳': '申', '申': '巳',
    '午': '未', '未': '午',
};
/** 地支相害 */
exports.ZHI_HAI = {
    '子': '未', '未': '子',
    '丑': '午', '午': '丑',
    '寅': '巳', '巳': '寅',
    '卯': '辰', '辰': '卯',
    '申': '亥', '亥': '申',
    '酉': '戌', '戌': '酉',
};
// ============================================
// 驛馬
// ============================================
/** 日馬（根據日支） */
exports.RI_MA = {
    '子': '寅', '丑': '亥', '寅': '申', '卯': '巳',
    '辰': '寅', '巳': '亥', '午': '申', '未': '巳',
    '申': '寅', '酉': '亥', '戌': '申', '亥': '巳',
};
/** 月馬（根據日支） */
exports.YUE_MA_MAP = {
    '寅申': '午', '卯酉': '申', '辰戌': '戌',
    '巳亥': '子', '午子': '寅', '丑未': '辰',
};
// ============================================
// 八專日
// ============================================
/** 八專日干支 */
exports.BA_ZHUAN_DAYS = ['壬子', '甲寅', '乙卯', '丁巳', '己未', '庚申', '辛酉', '癸亥'];
/** 日干支同位 */
exports.GAN_ZHI_SAME_POSITION = ['甲寅', '丁未', '己未', '庚申', '癸丑'];
//# sourceMappingURL=constants.js.map
};
__m__['./calculators/TianDiPanCalculator.js']=function(module,exports,require){
"use strict";
/**
 * 天地盤計算器
 *
 * 天地盤是大六壬的基礎，由月將加時辰起盤
 *
 * 算法：
 * 1. 根據節氣確定月將
 * 2. 月將加臨時辰，順布十二地支為天盤
 * 3. 地盤固定為子丑寅卯辰巳午未申酉戌亥
 * 4. 根據日干和晝夜確定貴人起點，順/逆布十二天將
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TianDiPanCalculator = void 0;
const constants_1 = require('./data/constants.js');
class TianDiPanCalculator {
    /**
     * 計算天地盤
     */
    static calculate(jieqi, hourZhi, dayGan) {
        // 1. 確定月將
        const yueJiang = this.getYueJiang(jieqi);
        const yueJiangName = constants_1.YUE_JIANG_MAP[yueJiang];
        // 2. 計算天盤（月將加臨時辰）
        const tianPan = this.calculateTianPan(yueJiang, hourZhi);
        // 3. 地盤固定
        const diPan = [...constants_1.DI_ZHI];
        // 4. 確定晝夜
        const dayNight = constants_1.DAY_NIGHT_MAP[hourZhi];
        // 5. 計算天將排布
        const tianJiang = this.calculateTianJiang(dayGan, dayNight, tianPan);
        // 6. 建立地支對應關係
        const diToTian = this.buildDiToTian(diPan, tianPan);
        const diToJiang = this.buildDiToJiang(diPan, tianJiang);
        return {
            tianPan,
            diPan,
            tianJiang,
            yueJiang,
            yueJiangName,
            diToTian,
            diToJiang,
        };
    }
    /**
     * 根據節氣獲取月將
     */
    static getYueJiang(jieqi) {
        // 歸一化節氣名（相容簡/繁體輸入，lunar-javascript 返回簡體）
        const yueJiang = constants_1.JIEQI_YUE_JIANG[(0, constants_1.normalizeJieQiName)(jieqi)];
        if (!yueJiang) {
            throw new Error(`未知節氣: ${jieqi}（需為二十四節氣之一）`);
        }
        return yueJiang;
    }
    /**
     * 計算天盤
     * 月將加臨時辰，順布十二地支
     */
    static calculateTianPan(yueJiang, hourZhi) {
        // 找到時辰在地支中的位置
        const hourIndex = constants_1.DI_ZHI.indexOf(hourZhi);
        // 找到月將在地支中的位置
        const yueJiangIndex = constants_1.DI_ZHI.indexOf(yueJiang);
        // 天盤：從時辰位置開始，月將加臨
        const tianPan = [];
        for (let i = 0; i < 12; i++) {
            // 從月將開始順布
            const index = (yueJiangIndex + i) % 12;
            tianPan.push(constants_1.DI_ZHI[index]);
        }
        // 重新排列：使天盤對應地盤從時辰開始
        const result = [];
        for (let i = 0; i < 12; i++) {
            const diPanIndex = (hourIndex + i) % 12;
            result[diPanIndex] = tianPan[i];
        }
        // 返回按地盤順序排列的天盤
        return constants_1.DI_ZHI.map((_, i) => result[i]);
    }
    /**
     * 計算天將排布
     * 根據日干和晝夜確定貴人起點，然後順/逆布
     */
    static calculateTianJiang(dayGan, dayNight, tianPan) {
        // 1. 確定貴人起點
        const guirenConfig = constants_1.GUIREN_START[dayGan];
        const guirenStart = dayNight === '晝' ? guirenConfig.day : guirenConfig.night;
        // 2. 找到貴人在天盤中的位置（貴人臨地盤某支）
        const guirenTianPanZhi = tianPan[constants_1.DI_ZHI.indexOf(guirenStart)];
        // 3. 確定順逆
        // 貴人在巳午未申酉戌（陽位）則逆布，在亥子丑寅卯辰（陰位）則順布
        const yangPositions = ['巳', '午', '未', '申', '酉', '戌'];
        const isReverse = yangPositions.includes(guirenTianPanZhi);
        // 4. 排布天將
        const tianJiang = new Array(12);
        const guirenIndex = constants_1.DI_ZHI.indexOf(guirenStart);
        if (isReverse) {
            // 逆布
            const reversedJiang = ['貴', '后', '陰', '玄', '常', '虎', '空', '龍', '勾', '合', '雀', '蛇'];
            for (let i = 0; i < 12; i++) {
                const targetIndex = (guirenIndex + i) % 12;
                tianJiang[targetIndex] = reversedJiang[i];
            }
        }
        else {
            // 順布
            for (let i = 0; i < 12; i++) {
                const targetIndex = (guirenIndex + i) % 12;
                tianJiang[targetIndex] = constants_1.TIAN_JIANG[i];
            }
        }
        return tianJiang;
    }
    /**
     * 建立地支到天盤的映射
     */
    static buildDiToTian(diPan, tianPan) {
        const result = {};
        for (let i = 0; i < 12; i++) {
            result[diPan[i]] = tianPan[i];
        }
        return result;
    }
    /**
     * 建立地支到天將的映射
     */
    static buildDiToJiang(diPan, tianJiang) {
        const result = {};
        for (let i = 0; i < 12; i++) {
            result[diPan[i]] = tianJiang[i];
        }
        return result;
    }
}
exports.TianDiPanCalculator = TianDiPanCalculator;
//# sourceMappingURL=TianDiPanCalculator.js.map
};
__m__['./calculators/SiKeCalculator.js']=function(module,exports,require){
"use strict";
/**
 * 四課計算器
 *
 * 四課由日干支推演：
 * - 一課：日干上神（日干寄宮的天盤地支）加日干
 * - 二課：一課上神的天盤地支加一課上神
 * - 三課：日支上神（日支的天盤地支）加日支
 * - 四課：三課上神的天盤地支加三課上神
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SiKeCalculator = void 0;
const constants_1 = require('./data/constants.js');
class SiKeCalculator {
    /**
     * 計算四課
     */
    static calculate(dayGan, dayZhi, tianDiPan) {
        const { diToTian, diToJiang } = tianDiPan;
        // 日干寄宮
        const dayGanJiGong = constants_1.GAN_JI_GONG[dayGan];
        // 一課：日干上神加日干
        const yiKeShang = diToTian[dayGanJiGong];
        const yiKe = this.buildSiKe(1, yiKeShang, dayGan, diToJiang[dayGanJiGong]);
        // 二課：一課上神的天盤地支加一課上神
        const erKeShang = diToTian[yiKeShang];
        const erKe = this.buildSiKe(2, erKeShang, yiKeShang, diToJiang[yiKeShang]);
        // 三課：日支上神加日支
        const sanKeShang = diToTian[dayZhi];
        const sanKe = this.buildSiKe(3, sanKeShang, dayZhi, diToJiang[dayZhi]);
        // 四課：三課上神的天盤地支加三課上神
        const siKeShang = diToTian[sanKeShang];
        const siKe = this.buildSiKe(4, siKeShang, sanKeShang, diToJiang[sanKeShang]);
        return {
            list: [yiKe, erKe, sanKe, siKe],
            dayGan,
            dayZhi,
            dayGanJiGong,
        };
    }
    /**
     * 構建單個課
     */
    static buildSiKe(position, shangShen, xiaShen, tianJiang) {
        // 計算上下關係
        const relation = this.calculateRelation(shangShen, xiaShen);
        return {
            position,
            shangShen,
            xiaShen,
            tianJiang,
            relation,
        };
    }
    /**
     * 計算上下神關係
     */
    static calculateRelation(shangShen, xiaShen) {
        // 獲取五行
        const shangWuXing = constants_1.ZHI_WUXING[shangShen];
        let xiaWuXing;
        // 下神可能是天干（日干）或地支
        if (xiaShen in constants_1.GAN_WUXING) {
            xiaWuXing = constants_1.GAN_WUXING[xiaShen];
        }
        else {
            xiaWuXing = constants_1.ZHI_WUXING[xiaShen];
        }
        // 查找關係
        const relationKey = shangWuXing + xiaWuXing;
        const relation = constants_1.WUXING_RELATION[relationKey];
        switch (relation) {
            case '尅':
                return '上尅下';
            case '被尅':
                return '下賊上';
            case '比和':
                return '比和';
            case '生':
                return '上生下';
            case '被生':
                return '下生上';
            default:
                return '比和';
        }
    }
    /**
     * 分析四課關係統計
     */
    static analyzeRelations(siKe) {
        const stats = {
            shangKeXia: 0,
            xiaZeiShang: 0,
            biHe: 0,
            shangShengXia: 0,
            xiaShengShang: 0,
        };
        for (const ke of siKe.list) {
            switch (ke.relation) {
                case '上尅下':
                    stats.shangKeXia++;
                    break;
                case '下賊上':
                    stats.xiaZeiShang++;
                    break;
                case '比和':
                    stats.biHe++;
                    break;
                case '上生下':
                    stats.shangShengXia++;
                    break;
                case '下生上':
                    stats.xiaShengShang++;
                    break;
            }
        }
        return stats;
    }
}
exports.SiKeCalculator = SiKeCalculator;
//# sourceMappingURL=SiKeCalculator.js.map
};
__m__['./calculators/SanChuanCalculator.js']=function(module,exports,require){
"use strict";
/**
 * 三傳計算器
 *
 * 三傳是大六壬的核心，由四課通過九宗門推演：
 *
 * 九宗門（取初傳的方法）：
 * 1. 賊尅：有一個下賊上或上尅下，取之為初傳
 * 2. 比用：有多個賊尅，取與日干陰陽相同者
 * 3. 涉害：比用不能決，看涉害深淺
 * 4. 遙尅：四課無賊尅，看遙尅
 * 5. 昴星：無賊尅無遙尅，陽日取酉上神，陰日取從魁（酉）
 * 6. 別責：昴星不能用，陽日取日干合神，陰日取日支三合
 * 7. 八專：日干支同位，特殊處理
 * 8. 伏吟：月將與時辰相同
 * 9. 返吟：天地盤對沖
 *
 * 中傳、末傳：初傳的天盤地支為中傳，中傳的天盤地支為末傳
 *
 * 特殊情況：
 * - 返吟八專（絕嗣）：日干支同位 + 四課全是下賊上
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SanChuanCalculator = void 0;
const SiKeCalculator_1 = require('./calculators/SiKeCalculator.js');
const constants_1 = require('./data/constants.js');
class SanChuanCalculator {
    /**
     * 計算三傳
     */
    static calculate(siKe, tianDiPan, dayGanZhi, hourZhi) {
        const { diToTian, diToJiang, yueJiang } = tianDiPan;
        const dayGan = dayGanZhi[0];
        const dayZhi = dayGanZhi[1];
        // 分析四課關係
        const stats = SiKeCalculator_1.SiKeCalculator.analyzeRelations(siKe);
        // 判斷特殊情況
        const isFuYin = yueJiang === hourZhi; // 伏吟
        const isFanYin = this.checkFanYin(tianDiPan); // 返吟
        const isBaZhuan = constants_1.BA_ZHUAN_DAYS.includes(dayGanZhi); // 八專
        const isGanZhiSamePos = constants_1.GAN_ZHI_SAME_POSITION.includes(dayGanZhi);
        // 確定初傳和格局
        let chuChuanZhi;
        let geJu;
        let geJuDetail;
        // 特殊情況：返吟八專（絕嗣）
        // 日干支同位 + 四課全是下賊上 -> 返吟·絕嗣
        const isFanYinBaZhuan = isGanZhiSamePos && stats.xiaZeiShang === 4;
        // 九宗門判斷
        if (isFanYin || isFanYinBaZhuan) {
            // 返吟課（包括返吟八專）
            const result = this.handleFanYin(siKe, tianDiPan, dayGan, dayZhi, stats, isFanYinBaZhuan);
            chuChuanZhi = result.chuChuan;
            geJu = '返吟';
            geJuDetail = result.detail;
        }
        else if (isFuYin) {
            // 伏吟課
            const result = this.handleFuYin(siKe, tianDiPan, dayGan, dayZhi, stats);
            chuChuanZhi = result.chuChuan;
            geJu = '伏吟';
            geJuDetail = result.detail;
        }
        else if (isBaZhuan && stats.shangKeXia === 0 && stats.xiaZeiShang === 0) {
            // 八專課
            const result = this.handleBaZhuan(siKe, tianDiPan, dayGan, dayZhi);
            chuChuanZhi = result.chuChuan;
            geJu = '八專';
            geJuDetail = result.detail;
        }
        else if (stats.xiaZeiShang === 1 && stats.shangKeXia === 0) {
            // 賊尅（重審）：只有一個下賊上
            const ke = siKe.list.find(k => k.relation === '下賊上');
            chuChuanZhi = ke.shangShen;
            geJu = '賊尅';
            geJuDetail = '重審';
        }
        else if (stats.shangKeXia === 1 && stats.xiaZeiShang === 0) {
            // 賊尅（元首）：只有一個上尅下
            const ke = siKe.list.find(k => k.relation === '上尅下');
            chuChuanZhi = ke.shangShen;
            geJu = '賊尅';
            geJuDetail = '元首';
        }
        else if (stats.xiaZeiShang >= 1) {
            // 有下賊上，優先取下賊上
            const result = this.handleMultipleZeiKe(siKe, tianDiPan, dayGan, dayZhi, '下賊上');
            chuChuanZhi = result.chuChuan;
            geJu = result.geJu;
            geJuDetail = result.detail;
        }
        else if (stats.shangKeXia >= 2) {
            // 多個上尅下
            const result = this.handleMultipleZeiKe(siKe, tianDiPan, dayGan, dayZhi, '上尅下');
            chuChuanZhi = result.chuChuan;
            geJu = result.geJu;
            geJuDetail = result.detail;
        }
        else if (stats.shangKeXia === 0 && stats.xiaZeiShang === 0) {
            // 無賊尅，嘗試遙尅、昴星、別責
            const result = this.handleNoZeiKe(siKe, tianDiPan, dayGan, dayZhi);
            chuChuanZhi = result.chuChuan;
            geJu = result.geJu;
            geJuDetail = result.detail;
        }
        else {
            // 默認取第一課上神
            chuChuanZhi = siKe.list[0].shangShen;
            geJu = '賊尅';
            geJuDetail = '元首';
        }
        // 計算中傳、末傳
        let zhongChuanZhi;
        let moChuanZhi;
        if (isFanYin) {
            // 返吟課：中傳以初沖，末傳用中沖
            zhongChuanZhi = constants_1.ZHI_CHONG[chuChuanZhi];
            moChuanZhi = constants_1.ZHI_CHONG[zhongChuanZhi];
        }
        else {
            // 普通課：用天盤推演
            zhongChuanZhi = diToTian[chuChuanZhi];
            moChuanZhi = diToTian[zhongChuanZhi];
        }
        // 構建三傳信息
        const chuChuan = this.buildChuanInfo('初傳', chuChuanZhi, diToJiang, dayGan, dayGanZhi);
        const zhongChuan = this.buildChuanInfo('中傳', zhongChuanZhi, diToJiang, dayGan, dayGanZhi);
        const moChuan = this.buildChuanInfo('末傳', moChuanZhi, diToJiang, dayGan, dayGanZhi);
        return {
            chuChuan,
            zhongChuan,
            moChuan,
            geJu,
            geJuDetail,
        };
    }
    /**
     * 構建傳信息
     */
    static buildChuanInfo(position, diZhi, diToJiang, dayGan, dayGanZhi) {
        // 計算六親
        const dayWuXing = constants_1.GAN_WUXING[dayGan];
        const chuanWuXing = constants_1.ZHI_WUXING[diZhi];
        const relationKey = dayWuXing + chuanWuXing;
        const relation = constants_1.WUXING_RELATION[relationKey] || '比和';
        const liuQin = constants_1.LIUQIN_MAP[relation] || '兄弟';
        // 計算旬空
        const xunKong = this.getXunKong(dayGanZhi, diZhi);
        return {
            position,
            diZhi,
            tianJiang: diToJiang[diZhi],
            liuQin,
            xunKong,
        };
    }
    /**
     * 獲取旬空
     */
    static getXunKong(dayGanZhi, diZhi) {
        // 找到日干支所在的旬
        const dayIndex = constants_1.JIA_ZI_60.indexOf(dayGanZhi);
        const xunStart = Math.floor(dayIndex / 10) * 10;
        const xunHead = constants_1.JIA_ZI_60[xunStart];
        const kongPair = constants_1.XUN_KONG[xunHead];
        if (kongPair && kongPair.includes(diZhi)) {
            return constants_1.TIAN_GAN[constants_1.DI_ZHI.indexOf(diZhi) % 10] || diZhi;
        }
        return null;
    }
    /**
     * 檢查是否返吟
     */
    static checkFanYin(tianDiPan) {
        // 天地盤對沖：每個地支上的天盤地支都是其對沖
        let chongCount = 0;
        for (let i = 0; i < 12; i++) {
            const diZhi = constants_1.DI_ZHI[i];
            const tianZhi = tianDiPan.diToTian[diZhi];
            if (constants_1.ZHI_CHONG[diZhi] === tianZhi) {
                chongCount++;
            }
        }
        return chongCount >= 6; // 至少一半對沖
    }
    /**
     * 處理多個賊尅
     */
    static handleMultipleZeiKe(siKe, tianDiPan, dayGan, dayZhi, targetRelation) {
        const matchingKe = siKe.list.filter(k => k.relation === targetRelation);
        if (matchingKe.length === 1) {
            return {
                chuChuan: matchingKe[0].shangShen,
                geJu: '賊尅',
                detail: targetRelation === '下賊上' ? '重審' : '元首',
            };
        }
        // 比用：取與日干陰陽相同者
        const dayGanYinYang = this.getYinYang(dayGan);
        const sameYinYangKe = matchingKe.filter(k => this.getYinYang(k.shangShen) === dayGanYinYang);
        if (sameYinYangKe.length === 1) {
            return {
                chuChuan: sameYinYangKe[0].shangShen,
                geJu: '比用',
                detail: '知一',
            };
        }
        // 涉害：看涉害深淺
        // 從上神的地盤位置數到上神本身，計算經過的尅數
        const candidates = sameYinYangKe.length > 0 ? sameYinYangKe : matchingKe;
        const sheHaiResults = candidates.map(ke => {
            const depth = this.calculateSheHaiDepth(ke.shangShen, ke.xiaShen, tianDiPan);
            return { ke, depth };
        });
        // 取涉害最深者
        sheHaiResults.sort((a, b) => b.depth - a.depth);
        // 確定細分格局
        let detail = '涉害';
        if (sheHaiResults.length >= 2 && sheHaiResults[0].depth === sheHaiResults[1].depth) {
            // 涉害相同，取先見者（課序靠前）
            detail = '察微';
        }
        else {
            detail = '見機';
        }
        return {
            chuChuan: sheHaiResults[0].ke.shangShen,
            geJu: '涉害',
            detail,
        };
    }
    /**
     * 計算涉害深度
     * 從上神的地盤位置開始，逆數到上神本身，計算經過的尅數
     *
     * 涉害深淺算法：
     * 1. 找到上神在地盤的位置（即上神本身的地支）
     * 2. 從該位置逆時針數到上神，計算途中被上神所尅的地支數量
     */
    static calculateSheHaiDepth(shangShen, xiaShen, tianDiPan) {
        // 上神的五行
        const shangWuXing = constants_1.ZHI_WUXING[shangShen];
        // 從上神的地盤位置（即上神本身）開始，逆數到上神在天盤的位置
        // 實際上是從 xiaShen（下神，即上神所臨的地盤位置）逆數到 shangShen
        const startIndex = constants_1.DI_ZHI.indexOf(xiaShen);
        const endIndex = constants_1.DI_ZHI.indexOf(shangShen);
        let count = 0;
        let currentIndex = startIndex;
        // 逆時針數（從地盤位置數到上神）
        while (currentIndex !== endIndex) {
            const currentZhi = constants_1.DI_ZHI[currentIndex];
            const currentWuXing = constants_1.ZHI_WUXING[currentZhi];
            // 檢查上神是否尅當前地支
            const relationKey = shangWuXing + currentWuXing;
            if (constants_1.WUXING_RELATION[relationKey] === '尅') {
                count++;
            }
            // 逆時針移動
            currentIndex = (currentIndex - 1 + 12) % 12;
        }
        return count;
    }
    /**
     * 處理無賊尅情況
     */
    static handleNoZeiKe(siKe, tianDiPan, dayGan, dayZhi) {
        const dayGanYinYang = this.getYinYang(dayGan);
        // 遙尅：四課上神與日干有尅的關係
        const dayWuXing = constants_1.GAN_WUXING[dayGan];
        for (const ke of siKe.list) {
            const keWuXing = constants_1.ZHI_WUXING[ke.shangShen];
            const relation = constants_1.WUXING_RELATION[keWuXing + dayWuXing];
            if (relation === '尅') {
                return {
                    chuChuan: ke.shangShen,
                    geJu: '遙尅',
                    detail: '蒿矢',
                };
            }
            if (relation === '被尅') {
                return {
                    chuChuan: ke.shangShen,
                    geJu: '遙尅',
                    detail: '彈射',
                };
            }
        }
        // 昴星：陽日取酉上神，陰日取從魁
        if (dayGanYinYang === '陽') {
            return {
                chuChuan: tianDiPan.diToTian['酉'],
                geJu: '昴星',
                detail: '虎視',
            };
        }
        else {
            return {
                chuChuan: tianDiPan.diToTian['酉'],
                geJu: '昴星',
                detail: '冬蛇掩目',
            };
        }
    }
    /**
     * 處理返吟
     *
     * 返吟課取三傳規則：
     * 1. 有賊尅用賊尅，中傳以初沖，末傳用中沖
     * 2. 無賊尅，取驛馬為初傳，支上神為中傳，干上神為末傳
     *
     * 返吟八專（絕嗣）：
     * - 日干支同位 + 四課全是下賊上
     * - 取驛馬為初傳
     */
    static handleFanYin(siKe, tianDiPan, dayGan, dayZhi, stats, isFanYinBaZhuan = false) {
        // 返吟八專（絕嗣）：直接取驛馬
        if (isFanYinBaZhuan) {
            const yiMa = this.getYiMa(dayZhi);
            return {
                chuChuan: yiMa,
                detail: '絕嗣',
            };
        }
        // 有賊尅（下賊上）用賊尅
        if (stats.xiaZeiShang > 0) {
            const matchingKe = siKe.list.filter(k => k.relation === '下賊上');
            if (matchingKe.length === 1) {
                return {
                    chuChuan: matchingKe[0].shangShen,
                    detail: '無依',
                };
            }
            // 多個下賊上，取與日干陰陽相同者
            const dayGanYinYang = this.getYinYang(dayGan);
            const sameYinYangKe = matchingKe.filter(k => this.getYinYang(k.shangShen) === dayGanYinYang);
            if (sameYinYangKe.length >= 1) {
                return {
                    chuChuan: sameYinYangKe[0].shangShen,
                    detail: '無依',
                };
            }
            return {
                chuChuan: matchingKe[0].shangShen,
                detail: '無依',
            };
        }
        // 有上尅下用上尅下
        if (stats.shangKeXia > 0) {
            const matchingKe = siKe.list.filter(k => k.relation === '上尅下');
            if (matchingKe.length === 1) {
                return {
                    chuChuan: matchingKe[0].shangShen,
                    detail: '無依',
                };
            }
            // 多個上尅下，取與日干陰陽相同者
            const dayGanYinYang = this.getYinYang(dayGan);
            const sameYinYangKe = matchingKe.filter(k => this.getYinYang(k.shangShen) === dayGanYinYang);
            if (sameYinYangKe.length >= 1) {
                return {
                    chuChuan: sameYinYangKe[0].shangShen,
                    detail: '無依',
                };
            }
            return {
                chuChuan: matchingKe[0].shangShen,
                detail: '無依',
            };
        }
        // 無賊尅，取驛馬為初傳
        // 驛馬：寅午戌馬在申，申子辰馬在寅，巳酉丑馬在亥，亥卯未馬在巳
        const yiMa = this.getYiMa(dayZhi);
        return {
            chuChuan: yiMa,
            detail: '無親',
        };
    }
    /**
     * 獲取驛馬
     * 寅午戌馬在申，申子辰馬在寅，巳酉丑馬在亥，亥卯未馬在巳
     */
    static getYiMa(dayZhi) {
        const yiMaMap = {
            '寅': '申', '午': '申', '戌': '申',
            '申': '寅', '子': '寅', '辰': '寅',
            '巳': '亥', '酉': '亥', '丑': '亥',
            '亥': '巳', '卯': '巳', '未': '巳',
        };
        return yiMaMap[dayZhi];
    }
    /**
     * 處理伏吟
     */
    static handleFuYin(siKe, tianDiPan, dayGan, dayZhi, stats) {
        const dayGanYinYang = this.getYinYang(dayGan);
        const dayGanJiGong = constants_1.GAN_JI_GONG[dayGan];
        // 伏吟課：陽日取日干寄宮刑神，陰日取日支刑神
        if (dayGanYinYang === '陽') {
            return {
                chuChuan: dayGanJiGong,
                detail: '自任',
            };
        }
        else {
            return {
                chuChuan: dayZhi,
                detail: '杜傳',
            };
        }
    }
    /**
     * 處理八專
     */
    static handleBaZhuan(siKe, tianDiPan, dayGan, dayZhi) {
        const dayGanYinYang = this.getYinYang(dayGan);
        // 八專課：陽日順數兩位，陰日逆數兩位
        const dayZhiIndex = constants_1.DI_ZHI.indexOf(dayZhi);
        let targetIndex;
        if (dayGanYinYang === '陽') {
            targetIndex = (dayZhiIndex + 2) % 12;
        }
        else {
            targetIndex = (dayZhiIndex - 2 + 12) % 12;
        }
        return {
            chuChuan: constants_1.DI_ZHI[targetIndex],
            detail: '帷簿',
        };
    }
    /**
     * 獲取陰陽
     */
    static getYinYang(ganOrZhi) {
        const yangGan = ['甲', '丙', '戊', '庚', '壬'];
        const yangZhi = ['子', '寅', '辰', '午', '申', '戌'];
        if (yangGan.includes(ganOrZhi) || yangZhi.includes(ganOrZhi)) {
            return '陽';
        }
        return '陰';
    }
}
exports.SanChuanCalculator = SanChuanCalculator;
//# sourceMappingURL=SanChuanCalculator.js.map
};
__m__['./calculators/ShenShaCalculator.js']=function(module,exports,require){
"use strict";
/**
 * 神煞計算器
 *
 * 計算大六壬中的各種神煞
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShenShaCalculator = void 0;
const constants_1 = require('./data/constants.js');
class ShenShaCalculator {
    /**
     * 計算神煞
     */
    static calculate(dayGanZhi) {
        const dayZhi = dayGanZhi[1];
        return {
            riMa: this.getRiMa(dayZhi),
            yueMa: this.getYueMa(dayZhi),
            dingMa: this.getDingMa(dayGanZhi),
            huaGai: this.getHuaGai(dayZhi),
            shanDian: this.getShanDian(dayZhi),
        };
    }
    /**
     * 日馬
     */
    static getRiMa(dayZhi) {
        return constants_1.RI_MA[dayZhi];
    }
    /**
     * 月馬
     */
    static getYueMa(dayZhi) {
        // 根據日支所屬三合局確定月馬
        const sanHeMap = {
            '寅申': ['寅', '申'],
            '卯酉': ['卯', '酉'],
            '辰戌': ['辰', '戌'],
            '巳亥': ['巳', '亥'],
            '午子': ['午', '子'],
            '丑未': ['丑', '未'],
        };
        for (const [key, zhis] of Object.entries(sanHeMap)) {
            if (zhis.includes(dayZhi)) {
                return constants_1.YUE_MA_MAP[key];
            }
        }
        return '寅'; // 默認
    }
    /**
     * 丁馬（根據旬首）
     */
    static getDingMa(dayGanZhi) {
        // 找到日干支所在的旬
        const dayIndex = constants_1.JIA_ZI_60.indexOf(dayGanZhi);
        const xunStart = Math.floor(dayIndex / 10) * 10;
        // 丁馬對應表
        const dingMaMap = {
            0: '卯', // 甲子旬
            10: '丑', // 甲戌旬
            20: '亥', // 甲申旬
            30: '酉', // 甲午旬
            40: '未', // 甲辰旬
            50: '巳', // 甲寅旬
        };
        return dingMaMap[xunStart] || '卯';
    }
    /**
     * 華蓋
     */
    static getHuaGai(dayZhi) {
        const huaGaiMap = {
            '子': '戌', '丑': '丑', '寅': '戌', '卯': '未',
            '辰': '戌', '巳': '丑', '午': '戌', '未': '未',
            '申': '戌', '酉': '丑', '戌': '戌', '亥': '未',
        };
        return huaGaiMap[dayZhi];
    }
    /**
     * 閃電
     */
    static getShanDian(dayZhi) {
        const shanDianMap = {
            '子': '辰', '丑': '辰', '寅': '未', '卯': '未',
            '辰': '戌', '巳': '戌', '午': '丑', '未': '丑',
            '申': '寅', '酉': '寅', '戌': '卯', '亥': '卯',
        };
        return shanDianMap[dayZhi];
    }
}
exports.ShenShaCalculator = ShenShaCalculator;
//# sourceMappingURL=ShenShaCalculator.js.map
};
__m__['./DaliurenService.js']=function(module,exports,require){
"use strict";
/**
 * 大六壬服務
 *
 * 提供大六壬排盤功能，輸出天地盤、四課、三傳
 *
 * 參考來源：
 * - kentang2017/kinliuren (MIT License)
 * - 《大六壬大全》
 * - 《六壬粹言》
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DaliurenService = void 0;
const lunar_javascript_1 = require('lunar-javascript');
const TianDiPanCalculator_1 = require('./calculators/TianDiPanCalculator.js');
const SiKeCalculator_1 = require('./calculators/SiKeCalculator.js');
const SanChuanCalculator_1 = require('./calculators/SanChuanCalculator.js');
const ShenShaCalculator_1 = require('./calculators/ShenShaCalculator.js');
const constants_1 = require('./data/constants.js');
class DaliurenService {
    config;
    constructor(config = {}) {
        this.config = config;
    }
    /**
     * 由公曆時間起課（推薦入口）
     *
     * 節氣、農曆月、日干支、時干支均由曆法自動推得，
     * 避免調用方（如 LLM）手工推算干支而出錯。
     * 輸入為北京時間（入口層已完成時區歸一化）。
     *
     * 干支口徑與六爻一致：採用 lunar-javascript EightChar 的日柱/時柱。
     */
    calculateFromTime(input) {
        const solar = lunar_javascript_1.Solar.fromYmdHms(input.year, input.month, input.day, input.hour, input.minute ?? 0, 0);
        const lunar = solar.getLunar();
        const eightChar = lunar.getEightChar();
        eightChar.setSect(1); // 子初换日，全项目统一口径
        // 最近一個節氣（含中氣，月將表按「中氣+下一節」配對，等效中氣換將）
        const prevJieQi = lunar.getPrevJieQi();
        const jieqi = (0, constants_1.normalizeJieQiName)(prevJieQi ? prevJieQi.getName() : '冬至');
        // 農曆月（閏月歸前月，僅用於展示）
        let lunarMonth = lunar.getMonth();
        if (lunarMonth < 0) {
            lunarMonth = -lunarMonth;
        }
        return this.calculate({
            jieqi,
            lunarMonth,
            dayGanZhi: eightChar.getDay(),
            hourGanZhi: eightChar.getTime(),
        });
    }
    /**
     * 計算大六壬盤
     */
    calculate(input) {
        const { jieqi, lunarMonth, dayGanZhi, hourGanZhi } = input;
        // 解析干支
        const dayGan = dayGanZhi[0];
        const dayZhi = dayGanZhi[1];
        const hourZhi = hourGanZhi[1];
        // 1. 計算天地盤
        const tianDiPan = TianDiPanCalculator_1.TianDiPanCalculator.calculate(jieqi, hourZhi, dayGan);
        // 2. 計算四課
        const siKe = SiKeCalculator_1.SiKeCalculator.calculate(dayGan, dayZhi, tianDiPan);
        // 3. 計算三傳
        const sanChuan = SanChuanCalculator_1.SanChuanCalculator.calculate(siKe, tianDiPan, dayGanZhi, hourZhi);
        // 4. 計算神煞
        const shenSha = ShenShaCalculator_1.ShenShaCalculator.calculate(dayGanZhi);
        // 5. 確定晝夜
        const dayNight = constants_1.DAY_NIGHT_MAP[hourZhi];
        // 構建結果
        return {
            basicInfo: {
                jieqi,
                lunarMonth: this.formatLunarMonth(lunarMonth),
                dayGanZhi,
                hourGanZhi,
                dayNight,
            },
            tianDiPan,
            siKe,
            sanChuan,
            shenSha,
        };
    }
    /**
     * 格式化農曆月份
     */
    formatLunarMonth(month) {
        const monthNames = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'];
        return monthNames[month - 1] + '月';
    }
}
exports.DaliurenService = DaliurenService;
//# sourceMappingURL=DaliurenService.js.map
};
root.DaLiuRen={
  DaliurenService:__req__('./DaliurenService.js').DaliurenService,
  TianDiPanCalculator:__req__('./calculators/TianDiPanCalculator.js').TianDiPanCalculator,
  SiKeCalculator:__req__('./calculators/SiKeCalculator.js').SiKeCalculator,
  SanChuanCalculator:__req__('./calculators/SanChuanCalculator.js').SanChuanCalculator,
  ShenShaCalculator:__req__('./calculators/ShenShaCalculator.js').ShenShaCalculator,
  constants:__req__('./data/constants.js')};
})(typeof window!=='undefined'?window:this);