/**
 * 真太阳时 + 中国夏令时
 *
 * 算法依据（均为公开资料，非特定项目代码）：
 *   1. 地方时 = 钟表时刻 + 经度时差 + 均时差（Equation of Time）
 *   2. 经度时差：每偏离时区中央经线 1° 差 4 分钟
 *      → (本地经度 − 中央经线) × 4 分钟；东八区中央经线 120°E
 *   3. 均时差：NOAA Solar Calculator 公开的傅里叶级数近似式
 *      https://gml.noaa.gov/grad/solcalc/solareqns.PDF
 *   4. 时辰：每两小时一辰，子时跨日（23:00–01:00）
 *
 * 夏令时数据：中国大陆 1935–1991 年实行夏令时，起止日期为公开史料记载。
 * 采用「只提示、不自动扣减」策略 —— 无法判定用户报的是夏令时读数
 * 还是已换算的标准时，自动减一小时既可能算错，也会改掉存量数据。
 *
 * 纯 ES5 实现，无外部依赖。
 */
(function (global) {
  'use strict';

  var MS_PER_DAY = 86400000;

  /* ── 工具 ───────────────────────────────────────── */

  function pad2(n) { return (n < 10 ? '0' : '') + n; }

  /** 是否为合法的公历日期（自动排除 2 月 30 日这类） */
  function isRealDate(y, m, d) {
    if (!Number.isInteger(y) || !Number.isInteger(m) || !Number.isInteger(d)) return false;
    if (m < 1 || m > 12 || d < 1 || d > 31) return false;
    var t = new Date(Date.UTC(y, m - 1, d));
    return t.getUTCFullYear() === y && t.getUTCMonth() === m - 1 && t.getUTCDate() === d;
  }

  /** 该日期是本年第几天（1 起算） */
  function nthDayOfYear(y, m, d) {
    var jan1 = Date.UTC(y, 0, 1);
    return Math.round((Date.UTC(y, m - 1, d) - jan1) / MS_PER_DAY) + 1;
  }

  function isLeap(y) {
    return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
  }

  /* ── 均时差 ─────────────────────────────────────── */

  /**
   * 均时差（分钟）。正数表示真太阳时比平太阳时快。
   * NOAA 近似式，1900–2100 年精度足够判断两小时时辰边界。
   */
  function solarOffsetMinutes(y, m, d, hh, mm) {
    if (!isRealDate(y, m, d)) return 0;
    var dayLen = isLeap(y) ? 366 : 365;
    var hourFrac = hh + (mm || 0) / 60;
    // 年内角（弧度），以正午为基准
    var theta = (2 * Math.PI / dayLen) * (nthDayOfYear(y, m, d) - 1 + (hourFrac - 12) / 24);
    var s = Math.sin(theta), c = Math.cos(theta);
    var s2 = Math.sin(2 * theta), c2 = Math.cos(2 * theta);
    return 229.18 * (0.000075 + 0.001868 * c - 0.032077 * s - 0.014615 * c2 - 0.040849 * s2);
  }

  /* ── 时辰 ───────────────────────────────────────── */

  /**
   * 由一天内的分钟数（0–1439.99）求时辰序号。
   * 0=子(23:00-01:00) 1=丑(01-03) … 11=亥(21-23)
   * 子时跨日：>=23:00 或 <01:00 都算子
   */
  function hourBranchOfDay(minutesOfDay) {
    if (minutesOfDay >= 1380 || minutesOfDay < 60) return 0;
    return Math.floor((minutesOfDay - 60) / 120) + 1;
  }

  /* ── 主计算 ─────────────────────────────────────── */

  /**
   * 计算真太阳时
   * @param {Object} o
   *   year, month, day   公历日期
   *   clockHour, clockMinute  钟表时间
   *   longitude          出生地经度（东经为正）；不传则不做修正
   *   utcOffsetMinutes   时区标准偏移（分钟），默认 480（东八区）
   * @returns {Object} 校正结果
   */
  function trueSolarTime(o) {
    var valid = isRealDate(o.year, o.month, o.day);
    var useLon = typeof o.longitude === 'number' && isFinite(o.longitude);
    // 时区中央经线 = 偏移分钟数 / 4
    var central = (typeof o.utcOffsetMinutes === 'number' && isFinite(o.utcOffsetMinutes))
      ? o.utcOffsetMinutes / 4
      : 120;

    var lonDelta = useLon ? (o.longitude - central) * 4 : 0;
    var eot = (useLon && valid) ? solarOffsetMinutes(o.year, o.month, o.day, o.clockHour, o.clockMinute) : 0;
    var totalDelta = lonDelta + eot;

    var clockMinutes = o.clockHour * 60 + o.clockMinute;
    var trueMinutes = clockMinutes + totalDelta;

    // 按秒取整，避免浮点误差把边界判成 23:59:59.99
    var trueSeconds = Math.round(trueMinutes * 60);
    var sign = trueSeconds < 0 ? -1 : 1;
    var absSeconds = Math.abs(trueSeconds);
    var dayShift = Math.floor(absSeconds / 86400) * sign;
    var within = absSeconds % 86400;

    var hh = Math.floor(within / 3600);
    var mi = Math.floor((within % 3600) / 60);
    var ss = within % 60;
    var shownMinutes = within / 60;

    return {
      valid: valid,
      applied: useLon,
      longitudeDelta: lonDelta,
      equationOffset: eot,
      totalDelta: totalDelta,
      clockMinutes: clockMinutes,
      trueMinutes: trueMinutes,
      shownMinutes: shownMinutes,
      dayShift: dayShift,
      hour: hh,
      minute: mi,
      second: ss,
      branch: hourBranchOfDay(shownMinutes)
    };
  }

  /**
   * 真太阳日偏移叠加晚子时规则 → 排盘日相对输入日的天数偏移。
   * rule='next-day'：23:00 之后算次日（紫微主流口径）
   */
  function chartDayShift(solar, rule) {
    var nextDay = (rule || 'next-day') === 'next-day';
    var lateZi = solar.branch === 0 && solar.shownMinutes >= 1380;

    if (solar.dayShift < 0 && lateZi) return nextDay ? solar.dayShift + 1 : solar.dayShift;
    if (solar.dayShift !== 0) return solar.dayShift;
    if (lateZi) return nextDay ? 1 : 0;
    return 0;
  }

  function formatClock(solar, withSeconds) {
    var base = pad2(solar.hour) + ':' + pad2(solar.minute);
    return withSeconds ? base + ':' + pad2(solar.second) : base;
  }

  /* ── 中国大陆夏令时 ─────────────────────────────── */

  /**
   * 实行夏令时的年份与起止日期（起止日当天都算在内）。
   * 数据来源：中国大陆夏令时实施史料（1986–1991 为全国统一执行期）。
   */
  var DST_YEARS = {
    1935: [5, 1, 9, 30], 1936: [5, 1, 9, 30], 1937: [5, 1, 9, 30],
    1938: [5, 1, 9, 30], 1939: [5, 1, 9, 30], 1940: [5, 1, 9, 30],
    1941: [5, 1, 9, 30], 1942: [5, 1, 9, 30], 1943: [5, 1, 9, 30],
    1944: [5, 1, 9, 30], 1945: [5, 1, 9, 30], 1946: [5, 1, 9, 30],
    1947: [5, 1, 9, 30], 1948: [5, 1, 9, 30], 1949: [5, 1, 9, 30],
    1950: [5, 1, 9, 30], 1951: [5, 1, 9, 30], 1952: [3, 1, 10, 31],
    1953: [4, 1, 10, 31], 1954: [4, 1, 10, 31], 1955: [5, 1, 9, 30],
    1956: [5, 1, 9, 30], 1957: [4, 1, 9, 30], 1958: [4, 1, 9, 30],
    1959: [4, 1, 9, 30], 1960: [6, 1, 9, 30], 1961: [6, 1, 9, 30],
    1974: [4, 1, 10, 31], 1975: [4, 1, 10, 31], 1979: [7, 1, 9, 30],
    1986: [5, 4, 9, 14], 1987: [4, 12, 9, 13], 1988: [4, 10, 9, 11],
    1989: [4, 16, 9, 17], 1990: [4, 15, 9, 16], 1991: [4, 14, 9, 15]
  };

  /** 该年是否实行过夏令时 */
  function hadDST(year) {
    return Object.prototype.hasOwnProperty.call(DST_YEARS, year);
  }

  /** 该日期是否落在夏令时区间（纯按日期判断，不看时刻） */
  function inDST(y, m, d) {
    var r = DST_YEARS[y];
    if (!r) return false;
    var sm = r[0], sd = r[1], em = r[2], ed = r[3];
    if (m > sm && m < em) return true;
    if (m === sm) return d >= sd;
    if (m === em) return d <= ed;
    return false;
  }

  /** 该年夏令时起止（供提示文案） */
  function dstRange(year) {
    var r = DST_YEARS[year];
    if (!r) return null;
    return { startMonth: r[0], startDay: r[1], endMonth: r[2], endDay: r[3] };
  }

  /* ── 导出 ───────────────────────────────────────── */

  global.ZW = global.ZW || {};
  global.ZW.solar = {
    pad2: pad2,
    isRealDate: isRealDate,
    solarOffsetMinutes: solarOffsetMinutes,
    hourBranchOfDay: hourBranchOfDay,
    trueSolarTime: trueSolarTime,
    chartDayShift: chartDayShift,
    formatClock: formatClock,
    hadDST: hadDST,
    inDST: inDST,
    dstRange: dstRange
  };
})(typeof window !== 'undefined' ? window : this);
