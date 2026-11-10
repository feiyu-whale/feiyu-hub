var DateTibetan = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // node_modules/@hnw/date-tibetan/src/index.js
  var index_exports = {};
  __export(index_exports, {
    CalendarBhutanese: () => CalendarBhutanese,
    CalendarMongolian: () => CalendarMongolian,
    CalendarTibetan: () => CalendarTibetan
  });

  // node_modules/astronomia/src/base.js
  var K = 0.01720209895;
  var AU = 149597870;
  var SOblJ2000 = 0.397777156;
  var COblJ2000 = 0.917482062;
  function lightTime(dist) {
    return 0.0057755183 * dist;
  }
  var JMod = 24000005e-1;
  var J2000 = 2451545;
  var J1900 = 2415020;
  var B1900 = 24150203135e-4;
  var B1950 = 24332824235e-4;
  var JulianYear = 365.25;
  var JulianCentury = 36525;
  var BesselianYear = 365.2421988;
  var meanSiderealYear = 365.25636;
  function JulianYearToJDE(jy) {
    return J2000 + JulianYear * (jy - 2e3);
  }
  function JDEToJulianYear(jde) {
    return 2e3 + (jde - J2000) / JulianYear;
  }
  function BesselianYearToJDE(by) {
    return B1900 + BesselianYear * (by - 1900);
  }
  function JDEToBesselianYear(jde) {
    return 1900 + (jde - B1900) / BesselianYear;
  }
  function J2000Century(jde) {
    return (jde - J2000) / JulianCentury;
  }
  function illuminated(i) {
    return (1 + Math.cos(i)) * 0.5;
  }
  var Coord = class {
    /**
     * celestial coordinates in right ascension and declination
     * or ecliptic coordinates in longitude and latitude
     *
     * @param {number} ra - right ascension (or longitude)
     * @param {number} dec - declination (or latitude)
     * @param {number} [range] - distance
     * @param {number} [elongation] - elongation
     */
    constructor(ra, dec, range, elongation) {
      this._ra = ra || 0;
      this._dec = dec || 0;
      this.range = range;
      this.elongation = elongation;
    }
    /**
     * right ascension
     * @return {number}
     */
    get ra() {
      return this._ra;
    }
    set ra(ra) {
      this._ra = ra;
    }
    /**
     * declination
     * @return {number}
     */
    get dec() {
      return this._dec;
    }
    set dec(dec) {
      this._dec = dec;
    }
    /**
     * right ascension (or longitude)
     * @return {number}
     */
    get lon() {
      return this._ra;
    }
    set lon(ra) {
      this._ra = ra;
    }
    /**
     * declination (or latitude)
     * @return {number}
     */
    get lat() {
      return this._dec;
    }
    set lat(dec) {
      this._dec = dec;
    }
  };
  function limb(equ, appSun) {
    const \u03B1 = equ.ra;
    const \u03B4 = equ.dec;
    const \u03B10 = appSun.ra;
    const \u03B40 = appSun.dec;
    const s\u03B4 = Math.sin(\u03B4);
    const c\u03B4 = Math.cos(\u03B4);
    const s\u03B40 = Math.sin(\u03B40);
    const c\u03B40 = Math.cos(\u03B40);
    const s\u03B10\u03B1 = Math.sin(\u03B10 - \u03B1);
    const c\u03B10\u03B1 = Math.cos(\u03B10 - \u03B1);
    let \u03C7 = Math.atan2(c\u03B40 * s\u03B10\u03B1, s\u03B40 * c\u03B4 - c\u03B40 * s\u03B4 * c\u03B10\u03B1);
    if (\u03C7 < 0) {
      \u03C7 += 2 * Math.PI;
    }
    return \u03C7;
  }
  var SmallAngle = 10 * Math.PI / 180 / 60;
  var CosSmallAngle = Math.cos(SmallAngle);
  function pmod(x, y) {
    let r = x % y;
    if (r < 0) {
      r += y;
    }
    return r;
  }
  function horner(x, ...c) {
    if (Array.isArray(c[0])) {
      c = c[0];
    }
    let i = c.length - 1;
    let y = c[i];
    while (i > 0) {
      i--;
      y = y * x + c[i];
    }
    return y;
  }
  function floorDiv(x, y) {
    const q = x / y;
    return Math.floor(q);
  }
  function cmp(a, b) {
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
  }
  function sincos(\u03B5) {
    return [Math.sin(\u03B5), Math.cos(\u03B5)];
  }
  function toRad(deg) {
    return Math.PI / 180 * deg;
  }
  function toDeg(rad) {
    return 180 / Math.PI * rad;
  }
  function modf(float) {
    const i = Math.trunc(float);
    const f = Math.abs(float - i);
    return [i, f];
  }
  function round(float, precision = 14) {
    return parseFloat(float.toFixed(precision));
  }
  function errorCode(msg, code) {
    const err = new Error(msg);
    err.code = code;
    return err;
  }
  var base_default = {
    K,
    AU,
    SOblJ2000,
    COblJ2000,
    lightTime,
    JMod,
    J2000,
    J1900,
    B1900,
    B1950,
    JulianYear,
    JulianCentury,
    BesselianYear,
    meanSiderealYear,
    JulianYearToJDE,
    JDEToJulianYear,
    BesselianYearToJDE,
    JDEToBesselianYear,
    J2000Century,
    illuminated,
    Coord,
    limb,
    SmallAngle,
    CosSmallAngle,
    pmod,
    horner,
    floorDiv,
    cmp,
    sincos,
    toRad,
    toDeg,
    modf,
    round,
    errorCode
  };

  // node_modules/astronomia/src/interpolation.js
  var int = Math.trunc;
  var errorNot3 = new Error("Argument y must be length 3");
  var errorNot4 = new Error("Argument y must be length 4");
  var errorNot5 = new Error("Argument y must be length 5");
  var errorNoXRange = new Error("Argument x3 (or x5) cannot equal x1");
  var errorNOutOfRange = new Error("Interpolating factor n must be in range -1 to 1");
  var errorNoExtremum = new Error("No extremum in table");
  var errorExtremumOutside = new Error("Extremum falls outside of table");
  var errorZeroOutside = new Error("Zero falls outside of table");
  var errorNoConverge = new Error("Failure to converge");
  var Len3 = class {
    /**
     * NewLen3 prepares a Len3 object from a table of three rows of x and y values.
     *
     * X values must be equally spaced, so only the first and last are supplied.
     * X1 must not equal to x3.  Y must be a slice of three y values.
     *
     * @throws Error
     * @param {Number} x1 - is the x value corresponding to the first y value of the table.
     * @param {Number} x3 - is the x value corresponding to the last y value of the table.
     * @param {Number[]} y - is all y values in the table. y.length should be >= 3.0
     */
    constructor(x1, x3, y) {
      if (y.length !== 3) {
        throw errorNot3;
      }
      if (x3 === x1) {
        throw errorNoXRange;
      }
      this.x1 = x1;
      this.x3 = x3;
      this.y = y;
      this.a = y[1] - y[0];
      this.b = y[2] - y[1];
      this.c = this.b - this.a;
      this.abSum = this.a + this.b;
      this.xSum = x3 + x1;
      this.xDiff = x3 - x1;
    }
    /**
     * InterpolateX interpolates for a given x value.
     */
    interpolateX(x) {
      const n = (2 * x - this.xSum) / this.xDiff;
      return this.interpolateN(n);
    }
    /**
     * InterpolateXStrict interpolates for a given x value,
     * restricting x to the range x1 to x3 given to the constructor NewLen3.
     */
    interpolateXStrict(x) {
      const n = (2 * x - this.xSum) / this.xDiff;
      const y = this.interpolateNStrict(n);
      return y;
    }
    /**
     * InterpolateN interpolates for (a given interpolating factor n.
     *
     * This is interpolation formula (3.3)
     *
     * @param n - The interpolation factor n is x-x2 in units of the tabular x interval.
     * (See Meeus p. 24.)
     * @return {number} interpolation value
     */
    interpolateN(n) {
      return this.y[1] + n * 0.5 * (this.abSum + n * this.c);
    }
    /**
     * InterpolateNStrict interpolates for (a given interpolating factor n.
     *
     * @param {number} n - n is restricted to the range [-1..1] corresponding to the range x1 to x3
     * given to the constructor of Len3.
     * @return {number} interpolation value
     */
    interpolateNStrict(n) {
      if (n < -1 || n > 1) {
        throw errorNOutOfRange;
      }
      return this.interpolateN(n);
    }
    /**
     * Extremum returns the x and y values at the extremum.
     *
     * Results are restricted to the range of the table given to the constructor
     * new Len3.
     */
    extremum() {
      if (this.c === 0) {
        throw errorNoExtremum;
      }
      const n = this.abSum / (-2 * this.c);
      if (n < -1 || n > 1) {
        throw errorExtremumOutside;
      }
      const x = 0.5 * (this.xSum + this.xDiff * n);
      const y = this.y[1] - this.abSum * this.abSum / (8 * this.c);
      return [x, y];
    }
    /**
     * Len3Zero finds a zero of the quadratic function represented by the table.
     *
     * That is, it returns an x value that yields y=0.
     *
     * Argument strong switches between two strategies for the estimation step.
     * when iterating to converge on the zero.
     *
     * Strong=false specifies a quick and dirty estimate that works well
     * for gentle curves, but can work poorly or fail on more dramatic curves.
     *
     * Strong=true specifies a more sophisticated and thus somewhat more
     * expensive estimate.  However, if the curve has quick changes, This estimate
     * will converge more reliably and in fewer steps, making it a better choice.
     *
     * Results are restricted to the range of the table given to the constructor
     * NewLen3.
     */
    zero(strong) {
      let f;
      if (strong) {
        f = (n02) => {
          return n02 - (2 * this.y[1] + n02 * (this.abSum + this.c * n02)) / (this.abSum + 2 * this.c * n02);
        };
      } else {
        f = (n02) => {
          return -2 * this.y[1] / (this.abSum + this.c * n02);
        };
      }
      const [n0, ok] = iterate(0, f);
      if (!ok) {
        throw errorNoConverge;
      }
      if (n0 > 1 || n0 < -1) {
        throw errorZeroOutside;
      }
      return 0.5 * (this.xSum + this.xDiff * n0);
    }
  };
  function len3ForInterpolateX(x, x1, xN, y) {
    let y3 = y;
    if (y.length > 3) {
      const interval = (xN - x1) / (y.length - 1);
      if (interval === 0) {
        throw errorNoXRange;
      }
      let nearestX = int((x - x1) / interval + 0.5);
      if (nearestX < 1) {
        nearestX = 1;
      } else if (nearestX > y.length - 2) {
        nearestX = y.length - 2;
      }
      y3 = y.slice(nearestX - 1, nearestX + 2);
      xN = x1 + (nearestX + 1) * interval;
      x1 = x1 + (nearestX - 1) * interval;
    }
    return new Len3(x1, xN, y3);
  }
  var iterate = function(n0, f) {
    for (let limit = 0; limit < 50; limit++) {
      const n1 = f(n0);
      if (!isFinite(n1) || isNaN(n1)) {
        break;
      }
      if (Math.abs((n1 - n0) / n0) < 1e-15) {
        return [n1, true];
      }
      n0 = n1;
    }
    return [0, false];
  };
  function len4Half(y) {
    if (y.length !== 4) {
      throw errorNot4;
    }
    return (9 * (y[1] + y[2]) - y[0] - y[3]) / 16;
  }
  var Len5 = class {
    /**
     * NewLen5 prepares a Len5 object from a table of five rows of x and y values.
     *
     * X values must be equally spaced, so only the first and last are suppliethis.
     * X1 must not equal x5.  Y must be a slice of five y values.
     */
    constructor(x1, x5, y) {
      if (y.length !== 5) {
        throw errorNot5;
      }
      if (x5 === x1) {
        throw errorNoXRange;
      }
      this.x1 = x1;
      this.x5 = x5;
      this.y = y;
      this.y3 = y[2];
      this.a = y[1] - y[0];
      this.b = y[2] - y[1];
      this.c = y[3] - y[2];
      this.d = y[4] - y[3];
      this.e = this.b - this.a;
      this.f = this.c - this.b;
      this.g = this.d - this.c;
      this.h = this.f - this.e;
      this.j = this.g - this.f;
      this.k = this.j - this.h;
      this.xSum = x5 + x1;
      this.xDiff = x5 - x1;
      this.interpCoeff = [
        // (3.8) p. 28
        this.y3,
        (this.b + this.c) / 2 - (this.h + this.j) / 12,
        this.f / 2 - this.k / 24,
        (this.h + this.j) / 12,
        this.k / 24
      ];
    }
    /**
     * InterpolateX interpolates for (a given x value.
     */
    interpolateX(x) {
      const n = (4 * x - 2 * this.xSum) / this.xDiff;
      return this.interpolateN(n);
    }
    /**
     * InterpolateXStrict interpolates for a given x value,
     * restricting x to the range x1 to x5 given to the the constructor NewLen5.
     */
    interpolateXStrict(x) {
      const n = (4 * x - 2 * this.xSum) / this.xDiff;
      const y = this.interpolateNStrict(n);
      return y;
    }
    /**
     * InterpolateN interpolates for (a given interpolating factor n.
     *
     * The interpolation factor n is x-x3 in units of the tabular x interval.
     * (See Meeus p. 28.)
     */
    interpolateN(n) {
      return base_default.horner(n, ...this.interpCoeff);
    }
    /**
     * InterpolateNStrict interpolates for (a given interpolating factor n.
     *
     * N is restricted to the range [-1..1].  This is only half the range given
     * to the constructor NewLen5, but is the recommendation given on p. 31.0
     */
    interpolateNStrict(n) {
      if (n < -1 || n > 1) {
        throw errorNOutOfRange;
      }
      return base_default.horner(n, ...this.interpCoeff);
    }
    /**
     * Extremum returns the x and y values at the extremum.
     *
     * Results are restricted to the range of the table given to the constructor
     * NewLen5.  (Meeus actually recommends restricting the range to one unit of
     * the tabular interval, but that seems a little harsh.)
     */
    extremum() {
      const nCoeff = [
        6 * (this.b + this.c) - this.h - this.j,
        0,
        3 * (this.h + this.j),
        2 * this.k
      ];
      const den = this.k - 12 * this.f;
      if (den === 0) {
        throw errorExtremumOutside;
      }
      const [n0, ok] = iterate(0, function(n02) {
        return base_default.horner(n02, ...nCoeff) / den;
      });
      if (!ok) {
        throw errorNoConverge;
      }
      if (n0 < -2 || n0 > 2) {
        throw errorExtremumOutside;
      }
      const x = 0.5 * this.xSum + 0.25 * this.xDiff * n0;
      const y = base_default.horner(n0, ...this.interpCoeff);
      return [x, y];
    }
    /**
     * Len5Zero finds a zero of the quartic function represented by the table.
     *
     * That is, it returns an x value that yields y=0.
     *
     * Argument strong switches between two strategies for the estimation step.
     * when iterating to converge on the zero.
     *
     * Strong=false specifies a quick and dirty estimate that works well
     * for gentle curves, but can work poorly or fail on more dramatic curves.
     *
     * Strong=true specifies a more sophisticated and thus somewhat more
     * expensive estimate.  However, if the curve has quick changes, This estimate
     * will converge more reliably and in fewer steps, making it a better choice.
     *
     * Results are restricted to the range of the table given to the constructor
     * NewLen5.
     */
    zero(strong) {
      let f;
      if (strong) {
        const M = this.k / 24;
        const N = (this.h + this.j) / 12;
        const P = this.f / 2 - M;
        const Q = (this.b + this.c) / 2 - N;
        const numCoeff = [this.y3, Q, P, N, M];
        const denCoeff = [Q, 2 * P, 3 * N, 4 * M];
        f = function(n02) {
          return n02 - base_default.horner(n02, ...numCoeff) / base_default.horner(n02, ...denCoeff);
        };
      } else {
        const numCoeff = [
          -24 * this.y3,
          0,
          this.k - 12 * this.f,
          -2 * (this.h + this.j),
          -this.k
        ];
        const den = 12 * (this.b + this.c) - 2 * (this.h + this.j);
        f = function(n02) {
          return base_default.horner(n02, ...numCoeff) / den;
        };
      }
      const [n0, ok] = iterate(0, f);
      if (!ok) {
        throw errorNoConverge;
      }
      if (n0 > 2 || n0 < -2) {
        throw errorZeroOutside;
      }
      const x = 0.5 * this.xSum + 0.25 * this.xDiff * n0;
      return x;
    }
  };
  function lagrange(x, table) {
    let sum = 0;
    table.forEach((ti, i) => {
      const xi = ti[0];
      let prod = 1;
      table.forEach((tj, j) => {
        if (i !== j) {
          const xj = tj[0];
          prod *= (x - xj) / (xi - xj);
        }
      });
      sum += ti[1] * prod;
    });
    return sum;
  }
  function lagrangePoly(table) {
    const sum = new Array(table.length).fill(0);
    const prod = new Array(table.length).fill(0);
    const last = table.length - 1;
    for (let i = 0; i < table.length; i++) {
      const xi = table[i][0] || table[i].x || 0;
      const yi = table[i][1] || table[i].y || 0;
      prod[last] = 1;
      let den = 1;
      let n = last;
      for (let j = 0; j < table.length; j++) {
        if (i !== j) {
          const xj = table[j][0] || table[j].x || 0;
          prod[n - 1] = prod[n] * -xj;
          for (let k = n; k < last; k++) {
            prod[k] -= prod[k + 1] * xj;
          }
          n--;
          den *= xi - xj;
        }
      }
      prod.forEach((pj, j) => {
        sum[j] += yi * pj / den;
      });
    }
    return sum;
  }
  function linear(x, x1, xN, y) {
    const interval = (xN - x1) / (y.length - 1);
    if (interval === 0) {
      throw errorNoXRange;
    }
    let nearestX = Math.floor((x - x1) / interval);
    if (nearestX < 0) {
      nearestX = 0;
    } else if (nearestX > y.length - 2) {
      nearestX = y.length - 2;
    }
    const y2 = y.slice(nearestX, nearestX + 2);
    const x01 = x1 + nearestX * interval;
    return y2[0] + (y[1] - y[0]) * (x - x01) / interval;
  }
  var interpolation_default = {
    errorNot3,
    errorNot4,
    errorNot5,
    errorNoXRange,
    errorNOutOfRange,
    errorNoExtremum,
    errorExtremumOutside,
    errorZeroOutside,
    errorNoConverge,
    Len3,
    len3ForInterpolateX,
    iterate,
    len4Half,
    Len5,
    lagrange,
    lagrangePoly,
    linear
  };

  // node_modules/astronomia/src/angle.js
  var { abs, acos, asin, atan2, cos, hypot, sin, sqrt, tan } = Math;

  // node_modules/astronomia/src/sexagesimal.js
  var Angle = class {
    /**
    * constructs a new Angle value from sign, degree, minute, and second
    * components.
    * @param {Number|Boolean} angleOrNeg - angle in radians or sign, true if negative (required to attribute -0°30')
    * __Four arguments__
    * @param {Number} [d] - (int) degree
    * @param {Number} [m] - (int) minute
    * @param {Number} [s] - (float) second
    */
    constructor(angleOrNeg, d3, m2, s2) {
      if (arguments.length === 1) {
        this.angle = Number(angleOrNeg);
      } else {
        this.setDMS(!!angleOrNeg, d3, m2, s2);
      }
    }
    /**
     * SetDMS sets the value of an FAngle from sign, degree, minute, and second
     * components.
     * The receiver is returned as a convenience.
     * @param {Boolean} neg - sign, true if negative
     * @param {Number} d - (int) degree
     * @param {Number} m - (int) minute
     * @param {Number} s - (float) second
     * @returns {Angle}
     */
    setDMS(neg = false, d3 = 0, m2 = 0, s2 = 0) {
      this.angle = DMSToDeg(neg, d3, m2, s2) * Math.PI / 180;
      return this;
    }
    /**
     * sets angle
     * @param {Number} angle - (float) angle in radians
     * @returns {Angle}
     */
    setAngle(angle) {
      this.angle = angle;
      return this;
    }
    /**
     * Rad returns the angle in radians.
     * @returns {Number} angle in radians
     */
    rad() {
      return this.angle;
    }
    /**
     * Deg returns the angle in degrees.
     * @returns {Number} angle in degree
     */
    deg() {
      return this.angle * 180 / Math.PI;
    }
    /**
     * toDMS converts to parsed sexagesimal angle component.
     */
    toDMS() {
      return degToDMS(this.deg());
    }
    /**
     * Print angle in degree using `d°m´s.ss″`
     * @param {Number} [precision] - precision of `s.ss`
     * @returns {String}
     */
    toString(precision) {
      let [neg, d3, m2, s2] = this.toDMS();
      s2 = round2(s2, precision).toString().replace(/^0\./, ".");
      const str = (neg ? "-" : "") + (d3 + "\xB0") + (m2 + "\u2032") + (s2 + "\u2033");
      return str;
    }
    /**
     * Print angle in degree using `d°.ff`
     * @param {Number} [precision] - precision of `.ff`
     * @returns {String}
     */
    toDegString(precision) {
      let [i, s2] = modf2(this.deg());
      s2 = round2(s2, precision).toString().replace(/^0\./, ".");
      const str = i + "\xB0" + s2;
      return str;
    }
  };
  var HourAngle = class extends Angle {
    /**
     * NewHourAngle constructs a new HourAngle value from sign, hour, minute,
     * and second components.
     * @param {Boolean} neg
     * @param {Number} h - (int)
     * @param {Number} m - (int)
     * @param {Number} s - (float)
     * @constructor
     */
    /**
     * SetDMS sets the value of an FAngle from sign, degree, minute, and second
     * components.
     * The receiver is returned as a convenience.
     * @param {Boolean} neg - sign, true if negative
     * @param {Number} h - (int) hour
     * @param {Number} m - (int) minute
     * @param {Number} s - (float) second
     * @returns {Angle}
     */
    setDMS(neg = false, h = 0, m2 = 0, s2 = 0) {
      this.angle = DMSToDeg(neg, h, m2, s2) * 15 * Math.PI / 180;
      return this;
    }
    /**
     * Hour returns the hour angle as hours of time.
     * @returns hour angle
     */
    hour() {
      return this.angle * 12 / Math.PI;
    }
    deg() {
      return this.hour();
    }
    /**
     * Print angle in `HʰMᵐs.ssˢ`
     * @param {Number} precision - precision of `s.ss`
     * @returns {String}
     */
    toString(precision) {
      let [neg, h, m2, s2] = this.toDMS();
      s2 = round2(s2, precision).toString().replace(/^0\./, ".");
      const str = (neg ? "-" : "") + (h + "\u02B0") + (m2 + "\u1D50") + (s2 + "\u02E2");
      return str;
    }
  };
  function DMSToDeg(neg, d3, m2, s2) {
    s2 = ((d3 * 60 + m2) * 60 + s2) / 3600;
    if (neg) {
      return -s2;
    }
    return s2;
  }
  function degToDMS(deg) {
    const neg = deg < 0;
    deg = Math.abs(deg);
    let [d3, s2] = modf2(deg % 360);
    const [m2, s1] = modf2(s2 * 60);
    s2 = round2(s1 * 60);
    return [neg, d3, m2, s2];
  }
  var RA = class extends HourAngle {
    /**
     * constructs a new RA value from hour, minute, and second components.
     * Negative values are not supported, RA wraps values larger than 24
     * to the range [0,24) hours.
     * @param {Number} h - (int) hour
     * @param {Number} m - (int) minute
     * @param {Number} s - (float) second
     */
    constructor(h = 0, m2 = 0, s2 = 0) {
      super(false, h, m2, s2);
      const args = [].slice.call(arguments);
      if (args.length === 1) {
        this.angle = h;
      } else {
        const hr = DMSToDeg(false, h, m2, s2) % 24;
        this.angle = hr * 15 * Math.PI / 180;
      }
    }
    hour() {
      const h = this.angle * 12 / Math.PI;
      return (24 + h % 24) % 24;
    }
  };
  var Time = class {
    /**
     * @param {boolean|number} negOrTimeInSecs - set `true` if negative; if type is number than time in seconds
     * @param {number} [h] - (int) hour
     * @param {number} [m] - (int) minute
     * @param {number} [s] - (float) second
     * @example
     * new sexa.Time(SECS_OF_DAY)
     * new sexa.Time(false, 15, 22, 7)
     */
    constructor(negOrTimeInSecs, h, m2, s2) {
      if (typeof negOrTimeInSecs === "number") {
        this.time = negOrTimeInSecs;
      } else {
        this.setHMS(negOrTimeInSecs, h, m2, s2);
      }
    }
    setHMS(neg = false, h = 0, m2 = 0, s2 = 0) {
      s2 += (h * 60 + m2) * 60;
      if (neg) {
        s2 = -s2;
      }
      this.time = s2;
    }
    /**
     * @returns {Number} time in seconds.
     */
    sec() {
      return this.time;
    }
    /**
     * @returns {Number} time in minutes.
     */
    min() {
      return this.time / 60;
    }
    /**
     * @returns {Number} time in hours.
     */
    hour() {
      return this.time / 3600;
    }
    /**
     * @returns {Number} time in days.
     */
    day() {
      return this.time / 3600 / 24;
    }
    /**
     * @returns {Number} time in radians, where 1 day = 2 Pi radians.
     */
    rad() {
      return this.time * Math.PI / 12 / 3600;
    }
    /**
     * convert time to HMS
     * @returns {Array} [neg, h, m, s]
     *  {Boolean} neg - sign, true if negative
     *  {Number} h - (int) hour
     *  {Number} m - (int) minute
     *  {Number} s - (float) second
     */
    toHMS() {
      let t = this.time;
      const neg = t < 0;
      t = neg ? -t : t;
      const h = Math.trunc(t / 3600);
      t = t - h * 3600;
      const m2 = Math.trunc(t / 60);
      const s2 = t - m2 * 60;
      return [neg, h, m2, s2];
    }
    /**
     * Print time using `HʰMᵐsˢ.ss`
     * @param {Number} precision - precision of `.ss`
     * @returns {String}
     */
    toString(precision) {
      const [neg, h, m2, s2] = this.toHMS();
      let [si, sf] = modf2(s2);
      if (precision === 0) {
        si = round2(s2, 0);
        sf = 0;
      } else {
        sf = round2(sf, precision).toString().substr(1);
      }
      const str = (neg ? "-" : "") + (h + "\u02B0") + (m2 + "\u1D50") + (si + "\u02E2") + (sf || "");
      return str;
    }
  };
  var angleFromDeg = (deg) => deg * Math.PI / 180;
  var angleFromMin = (min) => min / 60 * Math.PI / 180;
  var angleFromSec = (sec) => sec / 3600 * Math.PI / 180;
  var degFromAngle = (angle) => angle * 180 / Math.PI;
  var secFromAngle = (angle) => angle * 3600 * 180 / Math.PI;
  var secFromHourAngle = (ha) => ha * 240 * 180 / Math.PI;
  function modf2(float) {
    const i = Math.trunc(float);
    const f = Math.abs(float - i);
    return [i, f];
  }
  function round2(float, precision = 10) {
    return parseFloat(float.toFixed(precision));
  }
  var sexagesimal_default = {
    Angle,
    HourAngle,
    DMSToDeg,
    degToDMS,
    RA,
    Time,
    angleFromDeg,
    angleFromMin,
    angleFromSec,
    degFromAngle,
    secFromAngle,
    secFromHourAngle
  };

  // node_modules/astronomia/src/globe.js
  var Ellipsoid = class {
    /**
     * @param {number} radius - equatorial radius
     * @param {number} flat - ellipsiod flattening
     */
    constructor(radius, flat) {
      this.radius = radius;
      this.flat = flat;
    }
    /** A is a common identifier for equatorial radius. */
    A() {
      return this.radius;
    }
    /** B is a common identifier for polar radius. */
    B() {
      return this.radius * (1 - this.flat);
    }
    /** eccentricity of a meridian. */
    eccentricity() {
      return Math.sqrt((2 - this.flat) * this.flat);
    }
    /**
     * parallaxConstants computes parallax constants ρ sin φ′ and ρ cos φ′.
     *
     * Arguments are geographic latitude φ in radians and height h
     * in meters above the ellipsoid.
     *
     * @param {number} φ - geographic latitude in radians
     * @param {number} h - height in meters above the ellipsoid
     * @return {number[]} [ρ sin φ′, ρ cos φ] parallax constants [ρsφ, ρcφ]
     */
    parallaxConstants(\u03C6, h) {
      const boa = 1 - this.flat;
      const su = Math.sin(Math.atan(boa * Math.tan(\u03C6)));
      const cu = Math.cos(Math.atan(boa * Math.tan(\u03C6)));
      const s2 = Math.sin(\u03C6);
      const c = Math.cos(\u03C6);
      const hoa = h * 1e-3 / this.radius;
      const \u03C1s\u03C6 = su * boa + hoa * s2;
      const \u03C1c\u03C6 = cu + hoa * c;
      return [\u03C1s\u03C6, \u03C1c\u03C6];
    }
    /**
     * rho is distance from Earth center to a point on the ellipsoid.
     *
     * Result unit is fraction of the equatorial radius.
     * @param {number} φ - geographic latitude in radians
     * @returns {number} // TODO
     */
    rho(\u03C6) {
      return 0.9983271 + 16764e-7 * Math.cos(2 * \u03C6) - 35e-7 * Math.cos(4 * \u03C6);
    }
    /**
     * radiusAtLatitude returns the radius of the circle that is the parallel of
     * latitude at φ.
     *
     * Result unit is Km.
     *
     * @param {number} φ
     * @return {number} radius in km
     */
    radiusAtLatitude(\u03C6) {
      const s2 = Math.sin(\u03C6);
      const c = Math.cos(\u03C6);
      return this.A() * c / Math.sqrt(1 - (2 - this.flat) * this.flat * s2 * s2);
    }
    /**
     * radiusOfCurvature of meridian at latitude φ.
     *
     * Result unit is Km.
     *
     * @param {number} φ
     * @return {number} radius in km
     */
    radiusOfCurvature(\u03C6) {
      const s2 = Math.sin(\u03C6);
      const e2 = (2 - this.flat) * this.flat;
      return this.A() * (1 - e2) / Math.pow(1 - e2 * s2 * s2, 1.5);
    }
    /**
     * distance is distance between two points measured along the surface
     * of an ellipsoid.
     *
     * Accuracy is much better than that of approxAngularDistance or
     * approxLinearDistance.
     *
     * Result unit is Km.
     *
     * @param {Coord} c1
     * @param {Coord} c2
     * @return {number} radius in km
     */
    distance(c1, c2) {
      const [s2f, c2f] = sincos2((c1.lat + c2.lat) / 2);
      const [s2g, c2g] = sincos2((c1.lat - c2.lat) / 2);
      const [s2\u03BB, c2\u03BB] = sincos2((c1.lon - c2.lon) / 2);
      const s2 = s2g * c2\u03BB + c2f * s2\u03BB;
      const c = c2g * c2\u03BB + s2f * s2\u03BB;
      const \u03C9 = Math.atan(Math.sqrt(s2 / c));
      const r = Math.sqrt(s2 * c) / \u03C9;
      const d3 = 2 * \u03C9 * this.radius;
      const h1 = (3 * r - 1) / (2 * c);
      const h2 = (3 * r + 1) / (2 * s2);
      return d3 * (1 + this.flat * (h1 * s2f * c2g - h2 * c2f * s2g));
    }
  };
  var Earth76 = new Ellipsoid(6378.14, 1 / 298.257);
  function sincos2(x) {
    const s2 = Math.sin(x);
    const c = Math.cos(x);
    return [s2 * s2, c * c];
  }

  // node_modules/astronomia/src/coord.js
  var Ecliptic = class {
    /**
     * IMPORTANT: Longitudes are measured *positively* westwards
     * e.g. Washington D.C. +77°04; Vienna -16°23'
     * @param {Number|LonLat} [lon] - Longitude (λ) in radians
     * @param {Number} [lat] - Latitude (β) in radians
     */
    constructor(lon, lat) {
      if (typeof lon === "object") {
        lat = lon.lat;
        lon = lon.lon;
      }
      this.lon = lon || 0;
      this.lat = lat || 0;
    }
    /**
     * converts ecliptic coordinates to equatorial coordinates.
     * @param {Number} ε - Obliquity
     * @returns {Equatorial}
     */
    toEquatorial(\u03B5) {
      const [\u03B5sin, \u03B5cos] = base_default.sincos(\u03B5);
      const [s\u03B2, c\u03B2] = base_default.sincos(this.lat);
      const [s\u03BB, c\u03BB] = base_default.sincos(this.lon);
      let ra = Math.atan2(s\u03BB * \u03B5cos - s\u03B2 / c\u03B2 * \u03B5sin, c\u03BB);
      if (ra < 0) {
        ra += 2 * Math.PI;
      }
      const dec = Math.asin(s\u03B2 * \u03B5cos + c\u03B2 * \u03B5sin * s\u03BB);
      return new Equatorial(ra, dec);
    }
  };
  var Equatorial = class {
    /**
     * @param {Number} ra - (float) Right ascension (α) in radians
     * @param {Number} dec - (float) Declination (δ) in radians
     */
    constructor(ra = 0, dec = 0) {
      this.ra = ra;
      this.dec = dec;
    }
    /**
     * EqToEcl converts equatorial coordinates to ecliptic coordinates.
     * @param {Number} ε - Obliquity
     * @returns {Ecliptic}
     */
    toEcliptic(\u03B5) {
      const [\u03B5sin, \u03B5cos] = base_default.sincos(\u03B5);
      const [s\u03B1, c\u03B1] = base_default.sincos(this.ra);
      const [s\u03B4, c\u03B4] = base_default.sincos(this.dec);
      const lon = Math.atan2(s\u03B1 * \u03B5cos + s\u03B4 / c\u03B4 * \u03B5sin, c\u03B1);
      const lat = Math.asin(s\u03B4 * \u03B5cos - c\u03B4 * \u03B5sin * s\u03B1);
      return new Ecliptic(lon, lat);
    }
    /**
     * EqToHz computes Horizontal coordinates from equatorial coordinates.
     *
     * Argument g is the location of the observer on the Earth.  Argument st
     * is the sidereal time at Greenwich.
     *
     * Sidereal time must be consistent with the equatorial coordinates.
     * If coordinates are apparent, sidereal time must be apparent as well.
     *
     * @param {GlobeCoord} g - coordinates of observer on Earth
     * @param {Number} st - sidereal time at Greenwich at time of observation
     * @returns {Horizontal}
     */
    toHorizontal(g, st) {
      const H = new sexagesimal_default.Time(st).rad() - g.lon - this.ra;
      const [sH, cH] = base_default.sincos(H);
      const [s\u03C6, c\u03C6] = base_default.sincos(g.lat);
      const [s\u03B4, c\u03B4] = base_default.sincos(this.dec);
      const azimuth = Math.atan2(sH, cH * s\u03C6 - s\u03B4 / c\u03B4 * c\u03C6);
      const altitude = Math.asin(s\u03C6 * s\u03B4 + c\u03C6 * c\u03B4 * cH);
      return new Horizontal(azimuth, altitude);
    }
    /**
     * EqToGal converts equatorial coordinates to galactic coordinates.
     *
     * Equatorial coordinates must be referred to the standard equinox of B1950.0.
     * For conversion to B1950, see package precess and utility functions in
     * package "common".
     *
     * @returns {Galactic}
     */
    toGalactic() {
      const [sd\u03B1, cd\u03B1] = base_default.sincos(galacticNorth1950.ra - this.ra);
      const [sg\u03B4, cg\u03B4] = base_default.sincos(galacticNorth1950.dec);
      const [s\u03B4, c\u03B4] = base_default.sincos(this.dec);
      const x = Math.atan2(sd\u03B1, cd\u03B1 * sg\u03B4 - s\u03B4 / c\u03B4 * cg\u03B4);
      const lon = (galactic0Lon1950 + 1.5 * Math.PI - x) % (2 * Math.PI);
      const lat = Math.asin(s\u03B4 * sg\u03B4 + c\u03B4 * cg\u03B4 * cd\u03B1);
      return new Galactic(lon, lat);
    }
  };
  var Horizontal = class {
    constructor(az = 0, alt = 0) {
      this.az = az;
      this.alt = alt;
    }
    /**
     * transforms horizontal coordinates to equatorial coordinates.
     *
     * Sidereal time must be consistent with the equatorial coordinates.
     * If coordinates are apparent, sidereal time must be apparent as well.
     * @param {GlobeCoord} g - coordinates of observer on Earth (lat, lon)
     * @param {Number} st - sidereal time at Greenwich at time of observation.
     * @returns {Equatorial} (right ascension, declination)
     */
    toEquatorial(g, st) {
      const [sA, cA] = base_default.sincos(this.az);
      const [sh, ch] = base_default.sincos(this.alt);
      const [s\u03C6, c\u03C6] = base_default.sincos(g.lat);
      const H = Math.atan2(sA, cA * s\u03C6 + sh / ch * c\u03C6);
      const ra = base_default.pmod(new sexagesimal_default.Time(st).rad() - g.lon - H, 2 * Math.PI);
      const dec = Math.asin(s\u03C6 * sh - c\u03C6 * ch * cA);
      return new Equatorial(ra, dec);
    }
  };
  var Galactic = class {
    constructor(lon = 0, lat = 0) {
      this.lon = lon;
      this.lat = lat;
    }
    /**
     * GalToEq converts galactic coordinates to equatorial coordinates.
     *
     * Resulting equatorial coordinates will be referred to the standard equinox of
     * B1950.0.  For subsequent conversion to other epochs, see package precess and
     * utility functions in package meeus.
     *
     * @returns {Equatorial} (right ascension, declination)
     */
    toEquatorial() {
      const [sdLon, cdLon] = base_default.sincos(this.lon - galactic0Lon1950 - Math.PI / 2);
      const [sg\u03B4, cg\u03B4] = base_default.sincos(galacticNorth1950.dec);
      const [sb, cb] = base_default.sincos(this.lat);
      const y = Math.atan2(sdLon, cdLon * sg\u03B4 - sb / cb * cg\u03B4);
      const ra = base_default.pmod(y + galacticNorth1950.ra - Math.PI, 2 * Math.PI);
      const dec = Math.asin(sb * sg\u03B4 + cb * cg\u03B4 * cdLon);
      return new Equatorial(ra, dec);
    }
  };
  var galacticNorth = new Equatorial(
    new sexagesimal_default.RA(12, 49, 0).rad(),
    27.4 * Math.PI / 180
  );
  var galacticNorth1950 = galacticNorth;
  var galacticLon0 = 33 * Math.PI / 180;
  var galactic0Lon1950 = galacticLon0;

  // node_modules/astronomia/src/nutation.js
  var table22A = (function() {
    const PROPS = "d,m,n,f,\u03C9,s0,s1,c0,c1".split(",");
    const tab = [
      [0, 0, 0, 0, 1, -171996, -174.2, 92025, 8.9],
      [-2, 0, 0, 2, 2, -13187, -1.6, 5736, -3.1],
      [0, 0, 0, 2, 2, -2274, -0.2, 977, -0.5],
      [0, 0, 0, 0, 2, 2062, 0.2, -895, 0.5],
      [0, 1, 0, 0, 0, 1426, -3.4, 54, -0.1],
      [0, 0, 1, 0, 0, 712, 0.1, -7, 0],
      [-2, 1, 0, 2, 2, -517, 1.2, 224, -0.6],
      [0, 0, 0, 2, 1, -386, -0.4, 200, 0],
      [0, 0, 1, 2, 2, -301, 0, 129, -0.1],
      [-2, -1, 0, 2, 2, 217, -0.5, -95, 0.3],
      [-2, 0, 1, 0, 0, -158, 0, 0, 0],
      [-2, 0, 0, 2, 1, 129, 0.1, -70, 0],
      [0, 0, -1, 2, 2, 123, 0, -53, 0],
      [2, 0, 0, 0, 0, 63, 0, 0, 0],
      [0, 0, 1, 0, 1, 63, 0.1, -33, 0],
      [2, 0, -1, 2, 2, -59, 0, 26, 0],
      [0, 0, -1, 0, 1, -58, -0.1, 32, 0],
      [0, 0, 1, 2, 1, -51, 0, 27, 0],
      [-2, 0, 2, 0, 0, 48, 0, 0, 0],
      [0, 0, -2, 2, 1, 46, 0, -24, 0],
      [2, 0, 0, 2, 2, -38, 0, 16, 0],
      [0, 0, 2, 2, 2, -31, 0, 13, 0],
      [0, 0, 2, 0, 0, 29, 0, 0, 0],
      [-2, 0, 1, 2, 2, 29, 0, -12, 0],
      [0, 0, 0, 2, 0, 26, 0, 0, 0],
      [-2, 0, 0, 2, 0, -22, 0, 0, 0],
      [0, 0, -1, 2, 1, 21, 0, -10, 0],
      [0, 2, 0, 0, 0, 17, -0.1, 0, 0],
      [2, 0, -1, 0, 1, 16, 0, -8, 0],
      [-2, 2, 0, 2, 2, -16, 0.1, 7, 0],
      [0, 1, 0, 0, 1, -15, 0, 9, 0],
      [-2, 0, 1, 0, 1, -13, 0, 7, 0],
      [0, -1, 0, 0, 1, -12, 0, 6, 0],
      [0, 0, 2, -2, 0, 11, 0, 0, 0],
      [2, 0, -1, 2, 1, -10, 0, 5, 0],
      [2, 0, 1, 2, 2, -8, 0, 3, 0],
      [0, 1, 0, 2, 2, 7, 0, -3, 0],
      [-2, 1, 1, 0, 0, -7, 0, 0, 0],
      [0, -1, 0, 2, 2, -7, 0, 3, 0],
      [2, 0, 0, 2, 1, -7, 0, 3, 0],
      [2, 0, 1, 0, 0, 6, 0, 0, 0],
      [-2, 0, 2, 2, 2, 6, 0, -3, 0],
      [-2, 0, 1, 2, 1, 6, 0, -3, 0],
      [2, 0, -2, 0, 1, -6, 0, 3, 0],
      [2, 0, 0, 0, 1, -6, 0, 3, 0],
      [0, -1, 1, 0, 0, 5, 0, 0, 0],
      [-2, -1, 0, 2, 1, -5, 0, 3, 0],
      [-2, 0, 0, 0, 1, -5, 0, 3, 0],
      [0, 0, 2, 2, 1, -5, 0, 3, 0],
      [-2, 0, 2, 0, 1, 4, 0, 0, 0],
      [-2, 1, 0, 2, 1, 4, 0, 0, 0],
      [0, 0, 1, -2, 0, 4, 0, 0, 0],
      [-1, 0, 1, 0, 0, -4, 0, 0, 0],
      [-2, 1, 0, 0, 0, -4, 0, 0, 0],
      [1, 0, 0, 0, 0, -4, 0, 0, 0],
      [0, 0, 1, 2, 0, 3, 0, 0, 0],
      [0, 0, -2, 2, 2, -3, 0, 0, 0],
      [-1, -1, 1, 0, 0, -3, 0, 0, 0],
      [0, 1, 1, 0, 0, -3, 0, 0, 0],
      [0, -1, 1, 2, 2, -3, 0, 0, 0],
      [2, -1, -1, 2, 2, -3, 0, 0, 0],
      [0, 0, 3, 2, 2, -3, 0, 0, 0],
      [2, -1, 0, 2, 2, -3, 0, 0, 0]
    ];
    return tab.map((row) => {
      const o = {};
      PROPS.forEach((p2, i) => {
        o[p2] = row[i];
      });
      return o;
    });
  })();

  // node_modules/astronomia/src/elementequinox.js
  var Lp = 4.50001688 * Math.PI / 180;
  var L = 5.19856209 * Math.PI / 180;
  var J = 651966e-8 * Math.PI / 180;

  // node_modules/astronomia/src/precess.js
  var d = Math.PI / 180;
  var s = d / 3600;
  var \u03B6T = [2306.2181 * s, 1.39656 * s, -139e-6 * s];
  var zT = [2306.2181 * s, 1.39656 * s, -139e-6 * s];
  var \u03B8T = [2004.3109 * s, -0.8533 * s, -217e-6 * s];
  var \u03B6t = [2306.2181 * s, 0.30188 * s, 0.017998 * s];
  var zt = [2306.2181 * s, 1.09468 * s, 0.018203 * s];
  var \u03B8t = [2004.3109 * s, -0.42665 * s, -0.041833 * s];
  var \u03B7T = [47.0029 * s, -0.06603 * s, 598e-6 * s];
  var \u03C0T = [174.876384 * d, 3289.4789 * s, 0.60622 * s];
  var pT = [5029.0966 * s, 2.22226 * s, -42e-6 * s];
  var \u03B7t = [47.0029 * s, -0.03302 * s, 6e-5 * s];
  var \u03C0t = [174.876384 * d, -869.8089 * s, 0.03536 * s];
  var pt = [5029.0966 * s, 1.11113 * s, -6e-6 * s];

  // node_modules/astronomia/src/apparent.js
  var { cos: cos2, tan: tan2 } = Math;
  var \u03BA = 20.49552 * Math.PI / 180 / 3600;

  // node_modules/astronomia/src/apsis.js
  var { sin: sin2, cos: cos3 } = Math;
  var ck = 1 / 1325.55;
  var D2R = Math.PI / 180;

  // node_modules/astronomia/src/binary.js
  var { atan, atan2: atan22, cos: cos4, sqrt: sqrt2, tan: tan3 } = Math;

  // node_modules/astronomia/data/deltat.js
  var m = {
    historic: {
      table: [44, 43, 43, 41, 40, 39, 38, 37, 37, 36, 36, 36, 37, 37, 38, 37, 36, 36, 35, 35, 34, 33, 33, 32, 32, 31, 31, 30, 30, 29, 29, 29, 29, 29, 28, 28, 27, 27, 26, 26, 25, 25, 25, 26, 26, 26, 26, 25, 25, 25, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 23, 23, 23, 23, 22, 22, 22, 22, 22, 21, 21, 21, 21, 21, 21, 21, 21, 20, 20, 20, 20, 20, 20, 20, 20, 20, 21, 21, 21, 20, 20, 20, 20, 20, 19, 19, 19, 19, 19, 20, 20, 20, 20, 19, 20, 20, 20, 20, 20, 20, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21.1, 21, 21, 21, 20.9, 20.8, 20.7, 20.6, 20.4, 20.2, 20, 19.7, 19.4, 19.1, 18.7, 18.3, 17.8, 17.4, 17, 16.8, 16.6, 16.4, 16.1, 15.9, 15.7, 15.5, 15.3, 15, 14.7, 14.5, 14.3, 14.2, 14.1, 14.1, 14.1, 13.9, 13.7, 13.6, 13.5, 13.5, 13.5, 13.5, 13.4, 13.4, 13.4, 13.4, 13.3, 13.3, 13.2, 13.2, 13.2, 13.1, 13.1, 13.1, 13, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7, 13.8, 13.9, 14, 14, 14.1, 14.1, 14.1, 14.1, 14.2, 14.3, 14.4, 14.4, 14.5, 14.6, 14.6, 14.7, 14.7, 14.7, 14.8, 14.8, 14.9, 14.9, 15, 15, 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 15.6, 15.6, 15.8, 15.9, 15.9, 15.9, 15.8, 15.7, 15.8, 15.7, 15.7, 15.7, 15.8, 15.9, 16.1, 16.1, 16, 15.9, 15.9, 15.7, 15.4, 15.3, 15.4, 15.5, 15.6, 15.6, 15.6, 15.6, 15.6, 15.6, 15.6, 15.5, 15.5, 15.4, 15.3, 15.2, 15.1, 14.9, 14.8, 14.6, 14.4, 14.3, 14.2, 14.1, 14.2, 14.2, 13.9, 13.7, 13.5, 13.3, 13.1, 13, 13.2, 13.2, 13.1, 13.1, 13.2, 13.3, 13.5, 13.5, 13.4, 13.2, 13.2, 13.1, 13.1, 13, 12.8, 12.6, 12.7, 12.6, 12.3, 12, 11.9, 11.8, 11.6, 11.4, 11.2, 11.1, 11.1, 11.1, 11.1, 11.1, 11.2, 11.1, 11.1, 11.2, 11.4, 11.5, 11.3, 11.2, 11.4, 11.7, 11.9, 11.9, 11.9, 11.8, 11.7, 11.8, 11.8, 11.8, 11.7, 11.6, 11.6, 11.5, 11.5, 11.4, 11.4, 11.3, 11.3, 11.13, 11.16, 10.94, 10.72, 10.29, 10.04, 9.94, 9.91, 9.88, 9.86, 9.72, 9.67, 9.66, 9.64, 9.51, 9.4, 9.21, 9, 8.6, 8.29, 7.95, 7.73, 7.59, 7.49, 7.36, 7.26, 7.1, 7, 6.89, 6.82, 6.73, 6.64, 6.39, 6.28, 6.25, 6.27, 6.25, 6.27, 6.22, 6.24, 6.22, 6.27, 6.3, 6.36, 6.35, 6.37, 6.32, 6.33, 6.33, 6.37, 6.37, 6.41, 6.4, 6.44, 6.46, 6.51, 6.48, 6.51, 6.53, 6.58, 6.55, 6.61, 6.69, 6.8, 6.84, 6.94, 7.03, 7.13, 7.15, 7.22, 7.26, 7.3, 7.23, 7.22, 7.21, 7.2, 6.99, 6.98, 7.19, 7.36, 7.35, 7.39, 7.41, 7.45, 7.36, 7.18, 6.95, 6.72, 6.45, 6.24, 5.92, 5.59, 5.15, 4.67, 4.11, 3.52, 2.94, 2.47, 1.97, 1.52, 1.04, 0.6, 0.11, -0.34, -0.82, -1.25, -1.7, -2.08, -2.48, -2.82, -3.19, -3.5, -3.84, -4.14, -4.43, -4.59, -4.79, -4.92, -5.09, -5.24, -5.36, -5.34, -5.37, -5.32, -5.34, -5.33, -5.4, -5.47, -5.58, -5.66, -5.74, -5.68, -5.69, -5.65, -5.67, -5.68, -5.73, -5.72, -5.78, -5.79, -5.86, -5.89, -6.01, -6.13, -6.28, -6.41, -6.53, -6.49, -6.5, -6.45, -6.41, -6.26, -6.11, -5.9, -5.63, -5.13, -4.68, -4.19, -3.72, -3.21, -2.7, -2.09, -1.48, -0.75, -0.08, 0.62, 1.26, 1.95, 2.59, 3.28, 3.92, 4.61, 5.2, 5.73, 6.29, 7, 7.68, 8.45, 9.13, 9.78, 10.38, 10.99, 11.64, 12.47, 13.23, 14, 14.69, 15.38, 16, 16.64, 17.19, 17.72, 18.19, 18.67, 19.13, 19.69, 20.14, 20.54, 20.86, 21.14, 21.41, 21.78, 22.06, 22.3, 22.51, 22.79, 23.01, 23.29, 23.46, 23.55, 23.63, 23.8, 23.95, 24.25, 24.39, 24.42, 24.34, 24.22, 24.1, 24.08, 24.02, 24.04, 23.98, 23.91, 23.89, 23.95, 23.93, 23.92, 23.88, 23.94, 23.91, 23.82, 23.76, 23.87, 23.91, 23.95, 23.96, 24, 24.04, 24.2, 24.35, 24.61, 24.82, 25.09, 25.3, 25.56, 25.77, 26.05, 26.27, 26.54, 26.76, 27.04, 27.27, 27.55, 27.77, 28.03, 28.25, 28.5, 28.7, 28.95, 29.15, 29.38, 29.57, 29.8, 29.97, 30.19, 30.36, 30.57, 30.72, 30.93, 31.07, 31.24, 31.349, 31.516, 31.677, 31.923, 32.166, 32.449, 32.671, 32.919, 33.15, 33.397, 33.584, 33.804, 33.992, 34.24, 34.466, 34.731, 35.03, 35.4, 35.738, 36.147, 36.546, 36.995, 37.429, 37.879, 38.291, 38.753, 39.204, 39.707, 40.182, 40.706, 41.17, 41.686, 42.227, 42.825, 43.373, 43.959, 44.486, 44.997, 45.477, 45.983, 46.458, 46.997, 47.521, 48.034, 48.535, 49.099, 49.589, 50.102, 50.54, 50.975, 51.382, 51.81, 52.168, 52.572, 52.957, 53.434, 53.789, 54.087],
      first: 1657,
      last: 1984.5
    },
    data: {
      table: [43.4724372, 43.5648351, 43.6736863, 43.7782156, 43.8763273, 43.9562443, 44.0314956, 44.1131788, 44.1982187, 44.2951747, 44.3936471, 44.4840562, 44.5646335, 44.6425099, 44.7385767, 44.8370135, 44.9302138, 44.9986146, 45.0583549, 45.1283911, 45.2063835, 45.2980068, 45.3897017, 45.476138, 45.5632485, 45.6450189, 45.7374593, 45.8283721, 45.9132976, 45.9819705, 46.0407484, 46.1067084, 46.1825041, 46.2788561, 46.3713351, 46.4567207, 46.544486, 46.6310899, 46.7302231, 46.8283588, 46.9247443, 46.9969757, 47.0709148, 47.1450515, 47.2361542, 47.3413241, 47.4319364, 47.5213815, 47.6049313, 47.6837388, 47.7781381, 47.8770756, 47.9687104, 48.0348257, 48.0942021, 48.1608205, 48.2460028, 48.3438529, 48.4355405, 48.5344163, 48.6324506, 48.7293718, 48.8365414, 48.9353232, 49.0318781, 49.1013205, 49.1590844, 49.2285534, 49.3069683, 49.4017939, 49.4945263, 49.5861495, 49.6804907, 49.7602264, 49.8555805, 49.9489224, 50.0346777, 50.1018531, 50.1621723, 50.2260014, 50.2967905, 50.3831254, 50.4598772, 50.5387068, 50.6160484, 50.6865941, 50.7658362, 50.8453698, 50.918672, 50.9761148, 51.0278017, 51.084323, 51.1537928, 51.2318645, 51.306308, 51.3807849, 51.4526292, 51.5160394, 51.5985479, 51.680924, 51.7572854, 51.8133335, 51.8532385, 51.9014358, 51.9603433, 52.0328072, 52.0984957, 52.1667826, 52.2316418, 52.2938376, 52.3679897, 52.4465221, 52.5179552, 52.5751485, 52.6178012, 52.666816, 52.7340036, 52.8055792, 52.8792189, 52.9564838, 53.0444971, 53.126769, 53.2196749, 53.3024139, 53.3746645, 53.4335399, 53.4778015, 53.5299937, 53.5845392, 53.6522628, 53.7255844, 53.7882418, 53.8366625, 53.8829665, 53.9442904, 54.0042478, 54.0536342, 54.085644, 54.1084122, 54.1462942, 54.1913988, 54.2452023, 54.2957622, 54.3427024, 54.3910864, 54.4319877, 54.4897699, 54.545636, 54.597741, 54.6354962, 54.6532352, 54.677594, 54.7173643, 54.7740957, 54.8253023, 54.8712512, 54.916146, 54.9580535, 54.9997186, 55.047571, 55.0911778, 55.1132386, 55.132774, 55.1532423, 55.1898003, 55.2415531, 55.283803, 55.3222105, 55.3612676, 55.406262, 55.4628719, 55.5110909, 55.5523777, 55.5811877, 55.6004372, 55.626202, 55.6656271, 55.7167999, 55.7698097, 55.8196609, 55.8615028, 55.9129883, 55.9663474, 56.0220102, 56.0700015, 56.0939035, 56.110463, 56.1313736, 56.1610839, 56.2068432, 56.2582503, 56.3000349, 56.339902, 56.3789995, 56.4282839, 56.4803947, 56.5352164, 56.5697487, 56.5983102, 56.6328326, 56.6738814, 56.7332116, 56.7971596, 56.8552701, 56.9111378, 56.9754725, 57.0470772, 57.1136128, 57.173831, 57.2226068, 57.259731, 57.3072742, 57.3643368, 57.4334281, 57.5015747, 57.5653127, 57.6333396, 57.6972844, 57.7710774, 57.8407427, 57.9057801, 57.9575663, 57.9974929, 58.0425517, 58.1043319, 58.1679128, 58.2389092, 58.3091659, 58.3833021, 58.4536748, 58.5401438, 58.6227714, 58.6916662, 58.7409628, 58.7836189, 58.8405543, 58.898579, 58.9713678, 59.043837, 59.1218414, 59.2002687, 59.274737, 59.3574134, 59.4433827, 59.5242416, 59.5849787, 59.6343497, 59.6927827, 59.758805, 59.8386448, 59.9110567, 59.9844537, 60.056435, 60.123065, 60.2042185, 60.2803745, 60.3530352, 60.4011891, 60.4439959, 60.4900257, 60.5578054, 60.6324446, 60.7058569, 60.7853482, 60.8663504, 60.9386672, 61.0276757, 61.1103448, 61.1870458, 61.2453891, 61.2881024, 61.3377799, 61.4036165, 61.4760366, 61.5524599, 61.6286593, 61.6845819, 61.743306, 61.8132425, 61.8823203, 61.9496762, 61.9968743, 62.0342938, 62.0714108, 62.1202315, 62.1809508, 62.2382046, 62.2950486, 62.3506479, 62.3995381, 62.475395, 62.5463091, 62.6136031, 62.6570739, 62.6941742, 62.7383271, 62.7926305, 62.8566986, 62.9145607, 62.9658689, 63.0216632, 63.0807052, 63.1461718, 63.2052946, 63.2599441, 63.2844088, 63.2961369, 63.3126092, 63.3421622, 63.3871303, 63.4339302, 63.4673369, 63.4978642, 63.5319327, 63.5679441, 63.6104432, 63.6444291, 63.6641815, 63.6739403, 63.692603, 63.7147066, 63.7518055, 63.792717, 63.8285221, 63.8556871, 63.8803854, 63.9075025, 63.9392787, 63.9690744, 63.9798604, 63.9833077, 63.9938011, 64.0093384, 64.0399621, 64.0670429, 64.0907881, 64.1068077, 64.1282125, 64.1584211, 64.1832722, 64.2093975, 64.2116628, 64.2073173, 64.2115565, 64.2222858, 64.2499625, 64.2760973, 64.2998037, 64.3191858, 64.345013, 64.3734584, 64.3943291, 64.4151156, 64.4132064, 64.4118464, 64.4096536, 64.4167832, 64.43292, 64.4510529, 64.4734276, 64.4893377, 64.5053342, 64.5269189, 64.5470942, 64.5596729, 64.5512293, 64.5370906, 64.5359472, 64.5414947, 64.5543634, 64.5654298, 64.5736111, 64.5891142, 64.6014759, 64.6176147, 64.6374397, 64.6548674, 64.6530021, 64.6379271, 64.637161, 64.6399614, 64.6543152, 64.6723164, 64.6876311, 64.7051905, 64.7313433, 64.7575312, 64.7811143, 64.8000929, 64.7994561, 64.7876424, 64.783095, 64.7920604, 64.8096421, 64.8310888, 64.8451826, 64.8597013, 64.8849929, 64.9174991, 64.9480298, 64.9793881, 64.9894772, 65.0028155, 65.0138193, 65.0371432, 65.0772597, 65.112197, 65.1464034, 65.1832638, 65.2145358, 65.2493713, 65.2920645, 65.3279403, 65.3413366, 65.3451881, 65.34964, 65.3711307, 65.3971998, 65.4295547, 65.4573487, 65.486752, 65.5152012, 65.5449916, 65.5780768, 65.612728, 65.6287505, 65.6370091, 65.6493375, 65.6759928, 65.7096966, 65.746092, 65.7768362, 65.8024614, 65.8236695, 65.8595036, 65.8973008, 65.932291, 65.950911, 65.9534105, 65.962833, 65.9838647, 66.0146733, 66.042049, 66.0699217, 66.0961343, 66.1310116, 66.1682713, 66.2071627, 66.2355846, 66.2408549, 66.2335423, 66.2349107, 66.2441095, 66.2751123, 66.3054334, 66.3245568, 66.3405713, 66.3624433, 66.3957101, 66.428903, 66.4618675, 66.4748837, 66.4751281, 66.4828678, 66.5056165, 66.5382912, 66.5705628, 66.6030198, 66.6339689, 66.6569117, 66.6925011, 66.7288729, 66.7578719, 66.7707625, 66.7740427, 66.7846288, 66.810324, 66.840048, 66.8778601, 66.9069091, 66.944259, 66.9762508, 67.0258126, 67.0716286, 67.1100184, 67.1266401, 67.1331391, 67.145797, 67.17174, 67.2091069, 67.2459812, 67.2810383, 67.3136452, 67.3456968, 67.389003, 67.4318433, 67.4666209, 67.4858459, 67.4989147, 67.5110936, 67.5352658, 67.571103, 67.6070253, 67.6439167, 67.6765272, 67.7116693, 67.7590634, 67.8011542, 67.840213, 67.8606318, 67.8821576, 67.9120101, 67.9546462, 68.0054839, 68.051412, 68.1024205, 68.1577127, 68.2043653, 68.2664507, 68.3188171, 68.3703564, 68.3964356, 68.4094472, 68.4304611, 68.4629791, 68.507818, 68.5537018, 68.5927179, 68.6298107, 68.6670627, 68.7135208, 68.7622755, 68.8032843, 68.8244838, 68.8373427, 68.847693, 68.8688567, 68.9005814, 68.9354999, 68.9676423, 68.9875354, 69.0175527, 69.0499081, 69.0823433, 69.1070034, 69.1134027, 69.1141898, 69.1207203, 69.1355578, 69.16459, 69.1964228, 69.2201632, 69.2451564, 69.2732758, 69.3031979, 69.3325675, 69.3540507, 69.3581722, 69.3441594, 69.3376329, 69.3377424, 69.3432191, 69.3540144, 69.3611554, 69.3751703, 69.3889904, 69.4091639, 69.4264662, 69.4386335, 69.4241335, 69.3921241, 69.3693422, 69.3574782, 69.3593242, 69.3630244, 69.359334, 69.3510133, 69.3537917, 69.3582217, 69.367306, 69.3678649, 69.3514228, 69.3273414, 69.3033273, 69.2892463, 69.2880419, 69.2908014, 69.2944974, 69.2913953, 69.286149, 69.2835153, 69.2815422, 69.2806375, 69.2553511, 69.2125426, 69.1847287, 69.17207, 69.1691531, 69.173303, 69.1698064, 69.1589095, 69.1556275, 69.1672253, 69.1771384],
      first: 1973.0849315068492,
      firstYM: [1973, 2],
      last: 2023.3287671232877,
      lastYM: [2023, 5]
    },
    prediction: {
      table: [67.87818, 67.96817999999999, 68.02817999999999, 68.04818, 68.12818, 68.21817999999999, 68.26818, 68.28818, 68.36818, 68.44818, 68.50818, 68.51818, 68.59818, 68.68818, 68.73818, 68.74817999999999, 68.82818, 68.91817999999999, 68.96817999999999, 68.98818, 69.06818, 69.14818, 69.20818, 69.22818, 69.30818, 69.39818, 69.46817999999999, 69.48818, 69.57818, 69.66817999999999, 69.73818, 69.75818, 69.85817999999999, 69.95818, 70.02817999999999, 70.05818, 70.15818, 70.25818, 70.33818, 70.36818, 70.46817999999999],
      first: 2022,
      last: 2032
    }
  };
  var deltat_default = m;

  // node_modules/astronomia/src/deltat.js
  function LeapYearGregorian(y) {
    return y % 4 === 0 && y % 100 !== 0 || y % 400 === 0;
  }
  function deltaT(dyear) {
    let \u0394T;
    if (dyear < -500) {
      \u0394T = base_default.horner((dyear - 1820) * 0.01, -20, 0, 32);
    } else if (dyear < 500) {
      \u0394T = base_default.horner(
        dyear * 0.01,
        10583.6,
        -1014.41,
        33.78311,
        -5.952053,
        -0.1798452,
        0.022174192,
        0.0090316521
      );
    } else if (dyear < 1600) {
      \u0394T = base_default.horner(
        (dyear - 1e3) * 0.01,
        1574.2,
        -556.01,
        71.23472,
        0.319781,
        -0.8503463,
        -5050998e-9,
        0.0083572073
      );
    } else if (dyear < deltat_default.historic.first) {
      \u0394T = base_default.horner(dyear - 1600, 120, -0.9808, -0.01532, 1 / 7129);
    } else if (dyear < deltat_default.data.first) {
      \u0394T = interpolate(dyear, deltat_default.historic);
    } else if (dyear < deltat_default.data.last - 0.25) {
      \u0394T = interpolateData(dyear, deltat_default.data);
    } else if (dyear < deltat_default.prediction.last) {
      \u0394T = interpolate(dyear, deltat_default.prediction);
    } else if (dyear < 2050) {
      \u0394T = base_default.horner((dyear - 2e3) / 100, 62.92, 32.217, 55.89);
    } else if (dyear < 2150) {
      \u0394T = base_default.horner((dyear - 1820) / 100, -205.72, 56.28, 32);
    } else {
      const u = (dyear - 1820) / 100;
      \u0394T = -20 + 32 * u * u;
    }
    return \u0394T;
  }
  function interpolate(dyear, data) {
    const d3 = interpolation_default.len3ForInterpolateX(
      dyear,
      data.first,
      data.last,
      data.table
    );
    return d3.interpolateX(dyear);
  }
  function interpolateData(dyear, data) {
    const [fyear, fmonth] = data.firstYM;
    const { year, month, first, last } = monthOfYear(dyear);
    const pos = 12 * (year - fyear) + (month - fmonth);
    const table = data.table.slice(pos, pos + 3);
    const d3 = new interpolation_default.Len3(first, last, table);
    return d3.interpolateX(dyear);
  }
  function monthOfYear(dyear) {
    const year = dyear | 0;
    const f = dyear - year;
    const d3 = LeapYearGregorian(year) ? 1 : 0;
    const data = monthOfYear.data[d3];
    let month = 12;
    while (month > 0 && data[month] > f) {
      month--;
    }
    const first = year + data[month];
    const last = month < 11 ? year + data[month + 2] : year + 1 + data[(month + 2) % 12];
    return { year, month, first, last };
  }
  monthOfYear.data = [
    [
      // non leap year
      0,
      0,
      0.08493150684921602,
      0.16164383561635987,
      0.24657534246580326,
      0.3287671232876619,
      0.4136986301368779,
      0.4958904109589639,
      0.5808219178081799,
      0.6657534246576233,
      0.747945205479482,
      0.832876712328698,
      0.915068493150784
    ],
    [
      // leap year
      0,
      0,
      0.08743169398917416,
      0.1639344262296163,
      0.24863387978143692,
      0.3306010928961314,
      0.4153005464481794,
      0.49726775956287383,
      0.5819672131146945,
      0.6666666666667425,
      0.7486338797814369,
      0.8333333333332575,
      0.9153005464481794
    ]
  ];
  var deltat_default2 = {
    deltaT
  };

  // node_modules/astronomia/src/moonphase.js
  var { sin: sin3, cos: cos5 } = Math;
  var ck2 = 1 / 1236.85;
  var D2R2 = Math.PI / 180;

  // node_modules/astronomia/src/elp.js
  var SEC2RAD = 1 / 3600 * Math.PI / 180;

  // node_modules/astronomia/src/eqtime.js
  var { cos: cos6, sin: sin4, tan: tan4 } = Math;

  // node_modules/astronomia/src/illum.js
  var { toDeg: toDeg2 } = base_default;
  var D2R3 = Math.PI / 180;

  // node_modules/astronomia/src/julian.js
  var int2 = Math.trunc;
  var GREGORIAN0JD = 22991605e-1;
  var DAYS_OF_YEAR = [0, 0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  var SECS_OF_DAY = 86400;
  var Calendar = class {
    /**
     * @param {number|Date} [year] - If `Date` is given then year, month, day is taken from that. Shortcut to `new Calendar().fromDate(date)`
     * @param {number} [month]
     * @param {number} [day]
     */
    constructor(year, month = 1, day = 1) {
      if (year instanceof Date) {
        this.fromDate(year);
      } else {
        this.year = year;
        this.month = month;
        this.day = day;
      }
    }
    getDate() {
      return {
        year: this.year,
        month: this.month,
        day: Math.floor(this.day)
      };
    }
    getTime() {
      const t = new sexagesimal_default.Time(this.day * SECS_OF_DAY);
      const [neg, h, m2, _s] = t.toHMS();
      let [s2, ms] = base_default.modf(_s);
      ms = Math.trunc(ms * 1e3);
      return {
        hour: h % 24,
        minute: m2,
        second: s2,
        millisecond: ms
      };
    }
    toISOString() {
      const { year, month, day } = this.getDate();
      const { hour, minute, second, millisecond } = this.getTime();
      return `${pad(year, 4)}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}:${pad(second)}.${pad(millisecond, 3)}Z`;
    }
    isGregorian() {
      return isCalendarGregorian(this.year, this.month, this.day);
    }
    /**
     * Note: Take care for dates < GREGORIAN0JD as `date` is always within the
     * proleptic Gregorian Calender
     * @param {Date} date - proleptic Gregorian date
     */
    fromDate(date) {
      this.year = date.getUTCFullYear();
      this.month = date.getUTCMonth() + 1;
      const day = date.getUTCDate();
      const hour = date.getUTCHours();
      const minute = date.getUTCMinutes();
      const second = date.getUTCSeconds();
      const ms = date.getMilliseconds();
      this.day = day + (hour + (minute + (second + ms / 1e3) / 60) / 60) / 24;
      return this;
    }
    /**
     * Note: Take care for dates < GREGORIAN0JD as `date` is always within the
     * proleptic Gregorian Calender
     * @returns {Date} proleptic Gregorian date
     */
    toDate() {
      const [day, fhour] = base_default.modf(this.day);
      const [hour, fminute] = base_default.modf(fhour * 24);
      const [minute, fsecond] = base_default.modf(fminute * 60);
      const [second, fms] = base_default.modf(fsecond * 60);
      const date = new Date(Date.UTC(
        this.year,
        this.month - 1,
        day,
        hour,
        minute,
        second,
        Math.round(fms * 1e3)
      ));
      date.setUTCFullYear(this.year);
      return date;
    }
    /**
     * converts a calendar date to decimal year
     * @returns {number} decimal year
     */
    toYear() {
      const [d3, f] = base_default.modf(this.day);
      const n = this.dayOfYear() - 1 + f;
      const days = this.isLeapYear() ? 366 : 365;
      const decYear = this.year + n / days;
      return decYear;
    }
    /**
     * converts a decimal year to a calendar date
     * @param {number} year - decimal year
     */
    fromYear(year) {
      const [y, f] = base_default.modf(year);
      this.year = y;
      const days = this.isLeapYear() ? 366 : 365;
      const dayOfYear = base_default.round(f * days, 5);
      let m2 = 12;
      while (m2 > 0 && DAYS_OF_YEAR[m2] > dayOfYear) {
        m2--;
      }
      this.month = m2;
      this.day = 1 + dayOfYear - DAYS_OF_YEAR[this.month];
      return this;
    }
    isLeapYear() {
      if (this.isGregorian()) {
        return LeapYearGregorian2(this.year);
      } else {
        return LeapYearJulian(this.year);
      }
    }
    toJD() {
      return CalendarToJD(this.year, this.month, this.day, !this.isGregorian());
    }
    fromJD(jd) {
      const isJulian = !isJDCalendarGregorian(jd);
      const { year, month, day } = JDToCalendar(jd, isJulian);
      this.year = year;
      this.month = month;
      this.day = day;
      return this;
    }
    fromJDE(jde) {
      this.fromJD(jde);
      const dT = deltat_default2.deltaT(this.toYear());
      this.day -= dT / 86400;
      return this;
    }
    toJDE() {
      const dT = deltat_default2.deltaT(this.toYear());
      this.day += dT / 86400;
      return this.toJD();
    }
    /**
     * set date to midnight UTC
     */
    midnight() {
      this.day = Math.floor(this.day);
      return this;
    }
    /**
     * set date to noon UTC
     */
    noon() {
      this.day = Math.floor(this.day) + 0.5;
      return this;
    }
    /**
     * @param {Boolean} td - if `true` calendar instance is in TD; date gets converted to UT
     *   true  - `UT = TD - ΔT`
     *   false - `TD = UT + ΔT`
     */
    deltaT(td) {
      const dT = deltat_default2.deltaT(this.toYear());
      if (td) {
        this.day -= dT / 86400;
      } else {
        this.day += dT / 86400;
      }
      return this;
    }
    dayOfWeek() {
      return DayOfWeek(this.toJD());
    }
    dayOfYear() {
      if (this.isGregorian()) {
        return DayOfYearGregorian(this.year, this.month, this.day);
      } else {
        return DayOfYearJulian(this.year, this.month, this.day);
      }
    }
  };
  var CalendarJulian = class extends Calendar {
    toJD() {
      return CalendarJulianToJD(this.year, this.month, this.day);
    }
    fromJD(jd) {
      const { year, month, day } = JDToCalendarJulian(jd);
      this.year = year;
      this.month = month;
      this.day = day;
      return this;
    }
    isLeapYear() {
      return LeapYearJulian(this.year);
    }
    dayOfYear() {
      return DayOfYearJulian(this.year, this.month, this.day);
    }
    /**
     * toGregorian converts a Julian calendar date to a year, month, and day
     * in the Gregorian calendar.
     * @returns {CalendarGregorian}
     */
    toGregorian() {
      const jd = this.toJD();
      return new CalendarGregorian().fromJD(jd);
    }
  };
  var CalendarGregorian = class extends Calendar {
    toJD() {
      return CalendarGregorianToJD(this.year, this.month, this.day);
    }
    fromJD(jd) {
      const { year, month, day } = JDToCalendarGregorian(jd);
      this.year = year;
      this.month = month;
      this.day = day;
      return this;
    }
    isLeapYear() {
      return LeapYearGregorian2(this.year);
    }
    dayOfYear() {
      return DayOfYearGregorian(this.year, this.month, this.day);
    }
    /*
    * toJulian converts a Gregorian calendar date to a year, month, and day
    * in the Julian calendar.
    * @returns {CalendarJulian}
    */
    toJulian() {
      const jd = this.toJD();
      return new CalendarJulian().fromJD(jd);
    }
  };
  function CalendarToJD(y, m2, d3, isJulian) {
    let b = 0;
    if (m2 < 3) {
      y--;
      m2 += 12;
    }
    if (!isJulian) {
      const a = base_default.floorDiv(y, 100);
      b = 2 - a + base_default.floorDiv(a, 4);
    }
    const jd = base_default.floorDiv(36525 * int2(y + 4716), 100) + (base_default.floorDiv(306 * (m2 + 1), 10) + b) + d3 - 1524.5;
    return jd;
  }
  function CalendarGregorianToJD(y, m2, d3) {
    return CalendarToJD(y, m2, d3, false);
  }
  function CalendarJulianToJD(y, m2, d3) {
    return CalendarToJD(y, m2, d3, true);
  }
  function LeapYearJulian(y) {
    return y % 4 === 0;
  }
  function LeapYearGregorian2(y) {
    return y % 4 === 0 && y % 100 !== 0 || y % 400 === 0;
  }
  function JDToCalendar(jd, isJulian) {
    const [z, f] = base_default.modf(jd + 0.5);
    let a = z;
    if (!isJulian) {
      const \u03B1 = base_default.floorDiv(z * 100 - 186721625, 3652425);
      a = z + 1 + \u03B1 - base_default.floorDiv(\u03B1, 4);
    }
    const b = a + 1524;
    const c = base_default.floorDiv(b * 100 - 12210, 36525);
    const d3 = base_default.floorDiv(36525 * c, 100);
    const e = int2(base_default.floorDiv((b - d3) * 1e4, 306001));
    let year;
    let month;
    const day = int2(b - d3) - base_default.floorDiv(306001 * e, 1e4) + f;
    if (e === 14 || e === 15) {
      month = e - 13;
    } else {
      month = e - 1;
    }
    if (month < 3) {
      year = int2(c) - 4715;
    } else {
      year = int2(c) - 4716;
    }
    return { year, month, day };
  }
  function JDToCalendarGregorian(jd) {
    return JDToCalendar(jd, false);
  }
  function JDToCalendarJulian(jd) {
    return JDToCalendar(jd, true);
  }
  function isJDCalendarGregorian(jd) {
    return jd >= GREGORIAN0JD;
  }
  function isCalendarGregorian(year, month = 1, day = 1) {
    return year > 1582 || year === 1582 && month > 10 || year === 1582 && month === 10 && day >= 15;
  }
  function JDToDate(jd) {
    return new CalendarGregorian().fromJD(jd).toDate();
  }
  function DateToJD(date) {
    return new CalendarGregorian().fromDate(date).toJD();
  }
  function JDEToDate(jde) {
    return new CalendarGregorian().fromJDE(jde).toDate();
  }
  function DateToJDE(date) {
    return new CalendarGregorian().fromDate(date).toJDE();
  }
  function MJDToJD(mjd) {
    return mjd + base_default.JMod;
  }
  function JDToMJD(jd) {
    return jd - base_default.JMod;
  }
  function DayOfWeek(jd) {
    return int2(jd + 1.5) % 7;
  }
  function DayOfYearGregorian(y, m2, d3) {
    return DayOfYear(y, m2, int2(d3), LeapYearGregorian2(y));
  }
  function DayOfYearJulian(y, m2, d3) {
    return DayOfYear(y, m2, int2(d3), LeapYearJulian(y));
  }
  function DayOfYear(y, m2, d3, leap) {
    let k = 0;
    if (leap && m2 > 1) {
      k = 1;
    }
    return k + DAYS_OF_YEAR[m2] + int2(d3);
  }
  function DayOfYearToCalendar(n, leap) {
    let month;
    let k = 0;
    if (leap) {
      k = 1;
    }
    for (month = 1; month <= 12; month++) {
      if (k + DAYS_OF_YEAR[month] > n) {
        month = month - 1;
        break;
      }
    }
    const day = n - k - DAYS_OF_YEAR[month];
    return { month, day };
  }
  function DayOfYearToCalendarGregorian(year, n) {
    const { month, day } = DayOfYearToCalendar(n, LeapYearGregorian2(year));
    return new CalendarGregorian(year, month, day);
  }
  function DayOfYearToCalendarJulian(year, n) {
    const { month, day } = DayOfYearToCalendar(n, LeapYearJulian(year));
    return new CalendarJulian(year, month, day);
  }
  function pad(num, len) {
    len = len || 2;
    const neg = num < 0 ? "-" : "";
    num = Math.abs(num);
    const padded = "0000" + num;
    return neg + padded.substr(padded.length - len, len);
  }
  var julian_default = {
    GREGORIAN0JD,
    Calendar,
    CalendarJulian,
    CalendarGregorian,
    CalendarToJD,
    CalendarGregorianToJD,
    CalendarJulianToJD,
    LeapYearJulian,
    LeapYearGregorian: LeapYearGregorian2,
    JDToCalendar,
    JDToCalendarGregorian,
    JDToCalendarJulian,
    isJDCalendarGregorian,
    isCalendarGregorian,
    JDToDate,
    DateToJD,
    JDEToDate,
    DateToJDE,
    MJDToJD,
    JDToMJD,
    DayOfWeek,
    DayOfYearGregorian,
    DayOfYearJulian,
    DayOfYear,
    DayOfYearToCalendar,
    DayOfYearToCalendarGregorian,
    DayOfYearToCalendarJulian
  };

  // node_modules/astronomia/src/moonposition.js
  var { asin: asin2, sin: sin5 } = Math;
  var D2R4 = Math.PI / 180;
  var ta = (function() {
    const ta2 = [
      [0, 0, 1, 0, 6288774, -20905355],
      [2, 0, -1, 0, 1274027, -3699111],
      [2, 0, 0, 0, 658314, -2955968],
      [0, 0, 2, 0, 213618, -569925],
      [0, 1, 0, 0, -185116, 48888],
      [0, 0, 0, 2, -114332, -3149],
      [2, 0, -2, 0, 58793, 246158],
      [2, -1, -1, 0, 57066, -152138],
      [2, 0, 1, 0, 53322, -170733],
      [2, -1, 0, 0, 45758, -204586],
      [0, 1, -1, 0, -40923, -129620],
      [1, 0, 0, 0, -34720, 108743],
      [0, 1, 1, 0, -30383, 104755],
      [2, 0, 0, -2, 15327, 10321],
      [0, 0, 1, 2, -12528, 0],
      [0, 0, 1, -2, 10980, 79661],
      [4, 0, -1, 0, 10675, -34782],
      [0, 0, 3, 0, 10034, -23210],
      [4, 0, -2, 0, 8548, -21636],
      [2, 1, -1, 0, -7888, 24208],
      [2, 1, 0, 0, -6766, 30824],
      [1, 0, -1, 0, -5163, -8379],
      [1, 1, 0, 0, 4987, -16675],
      [2, -1, 1, 0, 4036, -12831],
      [2, 0, 2, 0, 3994, -10445],
      [4, 0, 0, 0, 3861, -11650],
      [2, 0, -3, 0, 3665, 14403],
      [0, 1, -2, 0, -2689, -7003],
      [2, 0, -1, 2, -2602, 0],
      [2, -1, -2, 0, 2390, 10056],
      [1, 0, 1, 0, -2348, 6322],
      [2, -2, 0, 0, 2236, -9884],
      [0, 1, 2, 0, -2120, 5751],
      [0, 2, 0, 0, -2069, 0],
      [2, -2, -1, 0, 2048, -4950],
      [2, 0, 1, -2, -1773, 4130],
      [2, 0, 0, 2, -1595, 0],
      [4, -1, -1, 0, 1215, -3958],
      [0, 0, 2, 2, -1110, 0],
      [3, 0, -1, 0, -892, 3258],
      [2, 1, 1, 0, -810, 2616],
      [4, -1, -2, 0, 759, -1897],
      [0, 2, -1, 0, -713, -2117],
      [2, 2, -1, 0, -700, 2354],
      [2, 1, -2, 0, 691, 0],
      [2, -1, 0, -2, 596, 0],
      [4, 0, 1, 0, 549, -1423],
      [0, 0, 4, 0, 537, -1117],
      [4, -1, 0, 0, 520, -1571],
      [1, 0, -2, 0, -487, -1739],
      [2, 1, 0, -2, -399, 0],
      [0, 0, 2, -2, -381, -4421],
      [1, 1, 1, 0, 351, 0],
      [3, 0, -2, 0, -340, 0],
      [4, 0, -3, 0, 330, 0],
      [2, -1, 2, 0, 327, 0],
      [0, 2, 1, 0, -323, 1165],
      [1, 1, -1, 0, 299, 0],
      [2, 0, 3, 0, 294, 0],
      [2, 0, -1, -2, 0, 8752]
    ];
    return ta2.map((row) => {
      const o = {};
      const vals = ["d", "m", "m_", "f", "\u03A3l", "\u03A3r"];
      vals.forEach((D2R10, i) => {
        o[D2R10] = row[i];
      });
      return o;
    });
  })();
  var tb = (function() {
    const tb2 = [
      [0, 0, 0, 1, 5128122],
      [0, 0, 1, 1, 280602],
      [0, 0, 1, -1, 277693],
      [2, 0, 0, -1, 173237],
      [2, 0, -1, 1, 55413],
      [2, 0, -1, -1, 46271],
      [2, 0, 0, 1, 32573],
      [0, 0, 2, 1, 17198],
      [2, 0, 1, -1, 9266],
      [0, 0, 2, -1, 8822],
      [2, -1, 0, -1, 8216],
      [2, 0, -2, -1, 4324],
      [2, 0, 1, 1, 4200],
      [2, 1, 0, -1, -3359],
      [2, -1, -1, 1, 2463],
      [2, -1, 0, 1, 2211],
      [2, -1, -1, -1, 2065],
      [0, 1, -1, -1, -1870],
      [4, 0, -1, -1, 1828],
      [0, 1, 0, 1, -1794],
      [0, 0, 0, 3, -1749],
      [0, 1, -1, 1, -1565],
      [1, 0, 0, 1, -1491],
      [0, 1, 1, 1, -1475],
      [0, 1, 1, -1, -1410],
      [0, 1, 0, -1, -1344],
      [1, 0, 0, -1, -1335],
      [0, 0, 3, 1, 1107],
      [4, 0, 0, -1, 1021],
      [4, 0, -1, 1, 833],
      [0, 0, 1, -3, 777],
      [4, 0, -2, 1, 671],
      [2, 0, 0, -3, 607],
      [2, 0, 2, -1, 596],
      [2, -1, 1, -1, 491],
      [2, 0, -2, 1, -451],
      [0, 0, 3, -1, 439],
      [2, 0, 2, 1, 422],
      [2, 0, -3, -1, 421],
      [2, 1, -1, 1, -366],
      [2, 1, 0, 1, -351],
      [4, 0, 0, 1, 331],
      [2, -1, 1, 1, 315],
      [2, -2, 0, -1, 302],
      [0, 0, 1, 3, -283],
      [2, 1, 1, -1, -229],
      [1, 1, 0, -1, 223],
      [1, 1, 0, 1, 223],
      [0, 1, -2, -1, -220],
      [2, 1, -1, -1, -220],
      [1, 0, 1, 1, -185],
      [2, -1, -2, -1, 181],
      [0, 1, 2, 1, -177],
      [4, 0, -2, -1, 176],
      [4, -1, -1, -1, 166],
      [1, 0, 1, -1, -164],
      [4, 0, 1, -1, 132],
      [1, 0, -1, -1, -119],
      [4, -1, 0, -1, 115],
      [2, -2, 0, 1, 107]
    ];
    return tb2.map((row) => {
      const o = {};
      const vals = ["d", "m", "m_", "f", "\u03A3b"];
      vals.forEach((D2R10, i) => {
        o[D2R10] = row[i];
      });
      return o;
    });
  })();

  // node_modules/astronomia/src/moon.js
  var { sin: sin6, cos: cos7, asin: asin3, atan2: atan23 } = Math;
  var D2R5 = Math.PI / 180;
  var _I = 1.54242 * D2R5;
  var [sI, cI] = base_default.sincos(_I);
  var lunarCoord = (\u03B7, \u03B8) => new base_default.Coord(\u03B7 * D2R5, \u03B8 * D2R5);
  var selenographic = {
    archimedes: lunarCoord(-3.9, 29.7),
    aristarchus: lunarCoord(-47.5, 23.7),
    aristillus: lunarCoord(1.2, 33.9),
    aristoteles: lunarCoord(17.3, 50.1),
    arzachel: lunarCoord(-1.9, -17.7),
    autolycus: lunarCoord(1.5, 30.7),
    billy: lunarCoord(-50, -13.8),
    birt: lunarCoord(-8.5, -22.3),
    campanus: lunarCoord(-27.7, -28),
    censorinus: lunarCoord(32.7, -0.4),
    clavius: lunarCoord(-14, -58),
    copernicus: lunarCoord(-20, 9.7),
    delambre: lunarCoord(17.5, -1.9),
    dionysius: lunarCoord(17.3, 2.8),
    endymion: lunarCoord(56.4, 53.6),
    eratosthenes: lunarCoord(-11.3, 14.5),
    eudoxus: lunarCoord(16.3, 44.3),
    fracastorius: lunarCoord(33.2, -21),
    fraMauro: lunarCoord(-17, -6),
    gassendi: lunarCoord(-39.9, -17.5),
    goclenius: lunarCoord(45, -10.1),
    grimaldi: lunarCoord(-68.5, -5.8),
    harpalus: lunarCoord(-43.4, 52.6),
    horrocks: lunarCoord(5.9, -4),
    kepler: lunarCoord(-38, 8.1),
    langrenus: lunarCoord(60.9, -8.9),
    lansberg: lunarCoord(-26.6, -0.3),
    letronne: lunarCoord(-43, -10),
    macrobius: lunarCoord(46, 21.2),
    manilius: lunarCoord(9.1, 14.5),
    menelaus: lunarCoord(16, 16.3),
    messier: lunarCoord(47.6, -1.9),
    petavius: lunarCoord(61, -25),
    pico: lunarCoord(-8.8, 45.8),
    pitatus: lunarCoord(-13.5, -29.8),
    piton: lunarCoord(-0.8, 40.8),
    plato: lunarCoord(-9.2, 51.4),
    plinius: lunarCoord(23.6, 15.3),
    posidonius: lunarCoord(30, 31.9),
    proclus: lunarCoord(46.9, 16.1),
    ptolemeusA: lunarCoord(-0.8, -8.5),
    pytheas: lunarCoord(-20.6, 20.5),
    reinhold: lunarCoord(-22.8, 3.2),
    riccioli: lunarCoord(-74.3, -3.2),
    schickard: lunarCoord(-54.5, -44),
    schiller: lunarCoord(-39, -52),
    tauruntius: lunarCoord(46.5, 5.6),
    theophilus: lunarCoord(26.5, -11.4),
    timocharis: lunarCoord(-13.1, 26.7),
    tycho: lunarCoord(-11, -43.2),
    vitruvius: lunarCoord(31.3, 17.6),
    walter: lunarCoord(1, -33)
  };

  // node_modules/astronomia/src/moonillum.js
  var D2R6 = Math.PI / 180;

  // node_modules/astronomia/src/moonmaxdec.js
  var p = Math.PI / 180;
  var ck3 = 1 / 1336.86;
  var nc = {
    D: 152.2029 * p,
    m: 14.8591 * p,
    m_: 4.6881 * p,
    f: 325.8867 * p,
    JDE: 24515625897e-4,
    s: 1,
    tc: [
      0.8975,
      -0.4726,
      -0.103,
      -0.0976,
      -0.0462,
      -0.0461,
      -0.0438,
      0.0162,
      -0.0157,
      0.0145,
      0.0136,
      -95e-4,
      -91e-4,
      -89e-4,
      75e-4,
      -68e-4,
      61e-4,
      -47e-4,
      -43e-4,
      -4e-3,
      -37e-4,
      31e-4,
      3e-3,
      -29e-4,
      -29e-4,
      -27e-4,
      24e-4,
      -21e-4,
      19e-4,
      18e-4,
      18e-4,
      17e-4,
      17e-4,
      -14e-4,
      13e-4,
      13e-4,
      12e-4,
      11e-4,
      -11e-4,
      1e-3,
      1e-3,
      -9e-4,
      7e-4,
      -7e-4
    ],
    dc: [
      5.1093 * p,
      0.2658 * p,
      0.1448 * p,
      -0.0322 * p,
      0.0133 * p,
      0.0125 * p,
      -0.0124 * p,
      -0.0101 * p,
      97e-4 * p,
      -87e-4 * p,
      74e-4 * p,
      67e-4 * p,
      63e-4 * p,
      6e-3 * p,
      -57e-4 * p,
      -56e-4 * p,
      52e-4 * p,
      41e-4 * p,
      -4e-3 * p,
      38e-4 * p,
      -34e-4 * p,
      -29e-4 * p,
      29e-4 * p,
      -28e-4 * p,
      -28e-4 * p,
      -23e-4 * p,
      -21e-4 * p,
      19e-4 * p,
      18e-4 * p,
      17e-4 * p,
      15e-4 * p,
      14e-4 * p,
      -12e-4 * p,
      -12e-4 * p,
      -1e-3 * p,
      -1e-3 * p,
      6e-4 * p
    ]
  };
  var sc = {
    D: 345.6676 * p,
    m: 1.3951 * p,
    m_: 186.21 * p,
    f: 145.1633 * p,
    JDE: 24515489289e-4,
    s: -1,
    tc: [
      -0.8975,
      -0.4726,
      -0.103,
      -0.0976,
      0.0541,
      0.0516,
      -0.0438,
      0.0112,
      0.0157,
      23e-4,
      -0.0136,
      0.011,
      91e-4,
      89e-4,
      75e-4,
      -3e-3,
      -61e-4,
      -47e-4,
      -43e-4,
      4e-3,
      -37e-4,
      -31e-4,
      3e-3,
      29e-4,
      -29e-4,
      -27e-4,
      24e-4,
      -21e-4,
      -19e-4,
      -6e-4,
      -18e-4,
      -17e-4,
      17e-4,
      14e-4,
      -13e-4,
      -13e-4,
      12e-4,
      11e-4,
      11e-4,
      1e-3,
      1e-3,
      -9e-4,
      -7e-4,
      -7e-4
    ],
    dc: [
      -5.1093 * p,
      0.2658 * p,
      -0.1448 * p,
      0.0322 * p,
      0.0133 * p,
      0.0125 * p,
      -15e-4 * p,
      0.0101 * p,
      -97e-4 * p,
      87e-4 * p,
      74e-4 * p,
      67e-4 * p,
      -63e-4 * p,
      -6e-3 * p,
      57e-4 * p,
      -56e-4 * p,
      -52e-4 * p,
      -41e-4 * p,
      -4e-3 * p,
      -38e-4 * p,
      34e-4 * p,
      -29e-4 * p,
      29e-4 * p,
      28e-4 * p,
      -28e-4 * p,
      23e-4 * p,
      21e-4 * p,
      19e-4 * p,
      18e-4 * p,
      -17e-4 * p,
      15e-4 * p,
      14e-4 * p,
      12e-4 * p,
      -12e-4 * p,
      1e-3 * p,
      -1e-3 * p,
      37e-4 * p
    ]
  };

  // node_modules/astronomia/src/parallax.js
  var horPar = 8.794 / 3600 * Math.PI / 180;

  // node_modules/astronomia/src/perihelion.js
  var planetsEnum = {
    mercury: 0,
    venus: 1,
    earth: 2,
    mars: 3,
    jupiter: 4,
    saturn: 5,
    uranus: 6,
    neptune: 7,
    embary: 8
  };
  var mercury = planetsEnum.mercury;
  var venus = planetsEnum.venus;
  var earth = planetsEnum.earth;
  var mars = planetsEnum.mars;
  var jupiter = planetsEnum.jupiter;
  var saturn = planetsEnum.saturn;
  var uranus = planetsEnum.uranus;
  var neptune = planetsEnum.neptune;
  var embary = planetsEnum.embary;
  if (typeof setImmediate !== "function") {
    const setImmediate2 = setTimeout;
  }

  // node_modules/astronomia/src/planetary.js
  function Ca(A, B, M0, M1) {
    this.A = A;
    this.B = B;
    this.M0 = M0;
    this.M1 = M1;
  }
  var micA = new Ca(2451612023e-3, 115.8774771, 63.5867, 114.2088742);
  var mscA = new Ca(2451554084e-3, 115.8774771, 6.4822, 114.2088742);
  var vicA = new Ca(2451996706e-3, 583.921361, 82.7311, 215.513058);
  var moA = new Ca(2452097382e-3, 779.936104, 181.9573, 48.705244);
  var joA = new Ca(2451870628e-3, 398.884046, 318.4681, 33.140229);
  var soA = new Ca(245187017e-2, 378.091904, 318.0172, 12.647487);
  var scA = new Ca(2451681124e-3, 378.091904, 131.6934, 12.647487);
  var uoA = new Ca(2451764317e-3, 369.656035, 213.6884, 4.333093);
  var noA = new Ca(2451753122e-3, 367.486703, 202.6544, 2.194998);
  function Caa(c, f) {
    this.c = c;
    this.f = f;
  }
  var jaa = [
    new Caa(82.74, 40.76)
  ];
  var saa = [
    new Caa(82.74, 40.76),
    new Caa(29.86, 1181.36),
    new Caa(14.13, 590.68),
    new Caa(220.02, 1262.87)
  ];
  var uaa = [
    new Caa(207.83, 8.51),
    new Caa(108.84, 419.96)
  ];
  var naa = [
    new Caa(207.83, 8.51),
    new Caa(276.74, 209.98)
  ];

  // node_modules/astronomia/src/pluto.js
  function Pt(i, j, k, lA, lB, bA, bB, rA, rB) {
    this.i = i;
    this.j = j;
    this.k = k;
    this.lA = lA;
    this.lB = lB;
    this.bA = bA;
    this.bB = bB;
    this.rA = rA;
    this.rB = rB;
  }
  var t37 = [
    new Pt(0, 0, 1, -19.799805, 19.850055, -5.452852, -14.974862, 6.6865439, 6.8951812),
    new Pt(0, 0, 2, 0.897144, -4.954829, 3.527812, 1.67279, -1.1827535, -0.0332538),
    new Pt(0, 0, 3, 0.611149, 1.211027, -1.050748, 0.327647, 0.1593179, -0.143889),
    new Pt(0, 0, 4, -0.341243, -0.189585, 0.17869, -0.292153, -18444e-7, 0.048322),
    new Pt(0, 0, 5, 0.129287, -0.034992, 0.01865, 0.10034, -65977e-7, -85431e-7),
    new Pt(0, 0, 6, -0.038164, 0.030893, -0.030697, -0.025823, 31174e-7, -6032e-7),
    new Pt(0, 1, -1, 0.020442, -9987e-6, 4878e-6, 0.011248, -5794e-7, 22161e-7),
    new Pt(0, 1, 0, -4063e-6, -5071e-6, 226e-6, -64e-6, 4601e-7, 4032e-7),
    new Pt(0, 1, 1, -6016e-6, -3336e-6, 203e-5, -836e-6, -1729e-7, 234e-7),
    new Pt(0, 1, 2, -3956e-6, 3039e-6, 69e-6, -604e-6, -415e-7, 702e-7),
    new Pt(0, 1, 3, -667e-6, 3572e-6, -247e-6, -567e-6, 239e-7, 723e-7),
    new Pt(0, 2, -2, 1276e-6, 501e-6, -57e-6, 1e-6, 67e-7, -67e-7),
    new Pt(0, 2, -1, 1152e-6, -917e-6, -122e-6, 175e-6, 1034e-7, -451e-7),
    new Pt(0, 2, 0, 63e-5, -1277e-6, -49e-6, -164e-6, -129e-7, 504e-7),
    new Pt(1, -1, 0, 2571e-6, -459e-6, -197e-6, 199e-6, 48e-6, -231e-7),
    new Pt(1, -1, 1, 899e-6, -1449e-6, -25e-6, 217e-6, 2e-7, -441e-7),
    new Pt(1, 0, -3, -1016e-6, 1043e-6, 589e-6, -248e-6, -3359e-7, 265e-7),
    new Pt(1, 0, -2, -2343e-6, -1012e-6, -269e-6, 711e-6, 7856e-7, -7832e-7),
    new Pt(1, 0, -1, 7042e-6, 788e-6, 185e-6, 193e-6, 36e-7, 45763e-7),
    new Pt(1, 0, 0, 1199e-6, -338e-6, 315e-6, 807e-6, 8663e-7, 8547e-7),
    new Pt(1, 0, 1, 418e-6, -67e-6, -13e-5, -43e-6, -809e-7, -769e-7),
    new Pt(1, 0, 2, 12e-5, -274e-6, 5e-6, 3e-6, 263e-7, -144e-7),
    new Pt(1, 0, 3, -6e-5, -159e-6, 2e-6, 17e-6, -126e-7, 32e-7),
    new Pt(1, 0, 4, -82e-6, -29e-6, 2e-6, 5e-6, -35e-7, -16e-7),
    new Pt(1, 1, -3, -36e-6, -29e-6, 2e-6, 3e-6, -19e-7, -4e-7),
    new Pt(1, 1, -2, -4e-5, 7e-6, 3e-6, 1e-6, -15e-7, 8e-7),
    new Pt(1, 1, -1, -14e-6, 22e-6, 2e-6, -1e-6, -4e-7, 12e-7),
    new Pt(1, 1, 0, 4e-6, 13e-6, 1e-6, -1e-6, 5e-7, 6e-7),
    new Pt(1, 1, 1, 5e-6, 2e-6, 0, -1e-6, 3e-7, 1e-7),
    new Pt(1, 1, 3, -1e-6, 0, 0, 0, 6e-7, -2e-7),
    new Pt(2, 0, -6, 2e-6, 0, 0, -2e-6, 2e-7, 2e-7),
    new Pt(2, 0, -5, -4e-6, 5e-6, 2e-6, 2e-6, -2e-7, -2e-7),
    new Pt(2, 0, -4, 4e-6, -7e-6, -7e-6, 0, 14e-7, 13e-7),
    new Pt(2, 0, -3, 14e-6, 24e-6, 1e-5, -8e-6, -63e-7, 13e-7),
    new Pt(2, 0, -2, -49e-6, -34e-6, -3e-6, 2e-5, 136e-7, -236e-7),
    new Pt(2, 0, -1, 163e-6, -48e-6, 6e-6, 5e-6, 273e-7, 1065e-7),
    new Pt(2, 0, 0, 9e-6, -24e-6, 14e-6, 17e-6, 251e-7, 149e-7),
    new Pt(2, 0, 1, -4e-6, 1e-6, -2e-6, 0, -25e-7, -9e-7),
    new Pt(2, 0, 2, -3e-6, 1e-6, 0, 0, 9e-7, -2e-7),
    new Pt(2, 0, 3, 1e-6, 3e-6, 0, 0, -8e-7, 7e-7),
    new Pt(3, 0, -2, -3e-6, -1e-6, 0, 1e-6, 2e-7, -1e-6),
    new Pt(3, 0, -1, 5e-6, -3e-6, 0, 0, 19e-7, 35e-7),
    new Pt(3, 0, 0, 0, 0, 1e-6, 0, 1e-6, 3e-7)
  ];

  // node_modules/astronomia/src/refraction.js
  var { sin: sin7, tan: tan5 } = Math;
  var D2R7 = Math.PI / 180;
  var gt15true1 = new sexagesimal_default.Angle(false, 0, 0, 58.294).rad();
  var gt15true2 = new sexagesimal_default.Angle(false, 0, 0, 0.0668).rad();
  var gt15app1 = new sexagesimal_default.Angle(false, 0, 0, 58.276).rad();
  var gt15app2 = new sexagesimal_default.Angle(false, 0, 0, 0.0824).rad();

  // node_modules/astronomia/src/rise.js
  var { acos: acos2, asin: asin4, cos: cos8, sin: sin8 } = Math;
  var D2R8 = Math.PI / 180;
  var errorAboveHorizon = base_default.errorCode("always above horizon", -1);
  var errorBelowHorizon = base_default.errorCode("always below horizon", 1);
  var meanRefraction = new sexagesimal_default.Angle(false, 0, 34, 0).rad();
  var stdh0 = {
    stellar: -meanRefraction,
    solar: new sexagesimal_default.Angle(true, 0, 50, 0).rad(),
    // not containing meanRefraction
    lunar: sexagesimal_default.angleFromDeg(0.7275),
    lunarMean: sexagesimal_default.angleFromDeg(0.125)
  };
  function refraction(h0, corr) {
    if (!corr) {
      return h0;
    } else {
      return h0 - meanRefraction - corr;
    }
  }
  var stdh0Stellar = (_refraction) => refraction(stdh0.stellar, _refraction);
  var Stdh0Stellar = stdh0Stellar();
  var stdh0Solar = (_refraction) => refraction(stdh0.solar, _refraction);
  var Stdh0Solar = stdh0Solar();
  var stdh0LunarMean = (_refraction) => {
    return stdh0.lunarMean - refraction(_refraction);
  };
  var Stdh0LunarMean = stdh0LunarMean();

  // node_modules/astronomia/src/saturnmoons.js
  var d2 = Math.PI / 180;
  function R4(\u03BB, r, \u03B3, \u03A9) {
    this.\u03BB = \u03BB || 0;
    this.r = r || 0;
    this.\u03B3 = \u03B3 || 0;
    this.\u03A9 = \u03A9 || 0;
  }
  function Qs(jde) {
    this.t1 = jde - 2411093;
    this.t2 = this.t1 / 365.25;
    this.t3 = (jde - 2433282423e-3) / 365.25 + 1950;
    this.t4 = jde - 2411368;
    this.t5 = this.t4 / 365.25;
    this.t6 = jde - 2415020;
    this.t7 = this.t6 / 36525;
    this.t8 = this.t6 / 365.25;
    this.t9 = (jde - 24420005e-1) / 365.25;
    this.t10 = jde - 2409786;
    this.t11 = this.t10 / 36525;
    this.W0 = 5.095 * d2 * (this.t3 - 1866.39);
    this.W1 = 74.4 * d2 + 32.39 * d2 * this.t2;
    this.W2 = 134.3 * d2 + 92.62 * d2 * this.t2;
    this.W3 = 42 * d2 - 0.5118 * d2 * this.t5;
    this.W4 = 276.59 * d2 + 0.5118 * d2 * this.t5;
    this.W5 = 267.2635 * d2 + 1222.1136 * d2 * this.t7;
    this.W6 = 175.4762 * d2 + 1221.5515 * d2 * this.t7;
    this.W7 = 2.4891 * d2 + 2435e-6 * d2 * this.t7;
    this.W8 = 113.35 * d2 - 0.2597 * d2 * this.t7;
    this.s1 = Math.sin(28.0817 * d2);
    this.c1 = Math.cos(28.0817 * d2);
    this.s2 = Math.sin(168.8112 * d2);
    this.c2 = Math.cos(168.8112 * d2);
    this.e1 = 0.05589 - 346e-6 * this.t7;
    this.sW0 = Math.sin(this.W0);
    this.s3W0 = Math.sin(3 * this.W0);
    this.s5W0 = Math.sin(5 * this.W0);
    this.sW1 = Math.sin(this.W1);
    this.sW2 = Math.sin(this.W2);
    this.sW3 = Math.sin(this.W3);
    this.cW3 = Math.cos(this.W3);
    this.sW4 = Math.sin(this.W4);
    this.cW4 = Math.cos(this.W4);
    this.sW7 = Math.sin(this.W7);
    this.cW7 = Math.cos(this.W7);
    return this;
  }
  Qs.prototype.mimas = function() {
    const r = new R4();
    const L2 = 127.64 * d2 + 381.994497 * d2 * this.t1 - 43.57 * d2 * this.sW0 - 0.72 * d2 * this.s3W0 - 0.02144 * d2 * this.s5W0;
    const p2 = 106.1 * d2 + 365.549 * d2 * this.t2;
    const M = L2 - p2;
    const C = 2.18287 * d2 * Math.sin(M) + 0.025988 * d2 * Math.sin(2 * M) + 43e-5 * d2 * Math.sin(3 * M);
    r.\u03BB = L2 + C;
    r.r = 3.06879 / (1 + 0.01905 * Math.cos(M + C));
    r.\u03B3 = 1.563 * d2;
    r.\u03A9 = 54.5 * d2 - 365.072 * d2 * this.t2;
    return r;
  };
  Qs.prototype.enceladus = function() {
    const r = new R4();
    const L2 = 200.317 * d2 + 262.7319002 * d2 * this.t1 + 0.25667 * d2 * this.sW1 + 0.20883 * d2 * this.sW2;
    const p2 = 309.107 * d2 + 123.44121 * d2 * this.t2;
    const M = L2 - p2;
    const C = 0.55577 * d2 * Math.sin(M) + 168e-5 * d2 * Math.sin(2 * M);
    r.\u03BB = L2 + C;
    r.r = 3.94118 / (1 + 485e-5 * Math.cos(M + C));
    r.\u03B3 = 0.0262 * d2;
    r.\u03A9 = 348 * d2 - 151.95 * d2 * this.t2;
    return r;
  };
  Qs.prototype.tethys = function() {
    const r = new R4();
    r.\u03BB = 285.306 * d2 + 190.69791226 * d2 * this.t1 + 2.063 * d2 * this.sW0 + 0.03409 * d2 * this.s3W0 + 1015e-6 * d2 * this.s5W0;
    r.r = 4.880998;
    r.\u03B3 = 1.0976 * d2;
    r.\u03A9 = 111.33 * d2 - 72.2441 * d2 * this.t2;
    return r;
  };
  Qs.prototype.dione = function() {
    const r = new R4();
    const L2 = 254.712 * d2 + 131.53493193 * d2 * this.t1 - 0.0215 * d2 * this.sW1 - 0.01733 * d2 * this.sW2;
    const p2 = 174.8 * d2 + 30.82 * d2 * this.t2;
    const M = L2 - p2;
    const C = 0.24717 * d2 * Math.sin(M) + 33e-5 * d2 * Math.sin(2 * M);
    r.\u03BB = L2 + C;
    r.r = 6.24871 / (1 + 2157e-6 * Math.cos(M + C));
    r.\u03B3 = 0.0139 * d2;
    r.\u03A9 = 232 * d2 - 30.27 * d2 * this.t2;
    return r;
  };
  Qs.prototype.rhea = function() {
    const p\u02B9 = 342.7 * d2 + 10.057 * d2 * this.t2;
    const [sp\u02B9, cp\u02B9] = base_default.sincos(p\u02B9);
    const a1 = 265e-6 * sp\u02B9 + 1e-3 * this.sW4;
    const a2 = 265e-6 * cp\u02B9 + 1e-3 * this.cW4;
    const e = Math.hypot(a1, a2);
    const p2 = Math.atan2(a1, a2);
    const N = 345 * d2 - 10.057 * d2 * this.t2;
    const [sN, cN] = base_default.sincos(N);
    const \u03BB\u02B9 = 359.244 * d2 + 79.6900472 * d2 * this.t1 + 0.086754 * d2 * sN;
    const i = 28.0362 * d2 + 0.346898 * d2 * cN + 0.0193 * d2 * this.cW3;
    const \u03A9 = 168.8034 * d2 + 0.736936 * d2 * sN + 0.041 * d2 * this.sW3;
    const a = 8.725924;
    return this.subr(\u03BB\u02B9, p2, e, a, \u03A9, i);
  };
  Qs.prototype.subr = function(\u03BB\u02B9, p2, e, a, \u03A9, i) {
    const r = new R4();
    const M = \u03BB\u02B9 - p2;
    const e2 = e * e;
    const e3 = e2 * e;
    const e4 = e2 * e2;
    const e5 = e3 * e2;
    const C = (2 * e - 0.25 * e3 + 0.0520833333 * e5) * Math.sin(M) + (1.25 * e2 - 0.458333333 * e4) * Math.sin(2 * M) + (1.083333333 * e3 - 0.671875 * e5) * Math.sin(3 * M) + 1.072917 * e4 * Math.sin(4 * M) + 1.142708 * e5 * Math.sin(5 * M);
    r.r = a * (1 - e2) / (1 + e * Math.cos(M + C));
    const g = \u03A9 - 168.8112 * d2;
    const [si, ci] = base_default.sincos(i);
    const [sg, cg] = base_default.sincos(g);
    const a1 = si * sg;
    const a2 = this.c1 * si * cg - this.s1 * ci;
    r.\u03B3 = Math.asin(Math.hypot(a1, a2));
    const u = Math.atan2(a1, a2);
    r.\u03A9 = 168.8112 * d2 + u;
    const h = this.c1 * si - this.s1 * ci * cg;
    const \u03C8 = Math.atan2(this.s1 * sg, h);
    r.\u03BB = \u03BB\u02B9 + C + u - g - \u03C8;
    return r;
  };
  Qs.prototype.titan = function() {
    const L2 = 261.1582 * d2 + 22.57697855 * d2 * this.t4 + 0.074025 * d2 * this.sW3;
    const i\u02B9 = 27.45141 * d2 + 0.295999 * d2 * this.cW3;
    const \u03A9\u02B9 = 168.66925 * d2 + 0.628808 * d2 * this.sW3;
    const [si\u02B9, ci\u02B9] = base_default.sincos(i\u02B9);
    const [s\u03A9\u02B9W8, c\u03A9\u02B9W8] = base_default.sincos(\u03A9\u02B9 - this.W8);
    const a1 = this.sW7 * s\u03A9\u02B9W8;
    const a2 = this.cW7 * si\u02B9 - this.sW7 * ci\u02B9 * c\u03A9\u02B9W8;
    const g0 = 102.8623 * d2;
    const \u03C8 = Math.atan2(a1, a2);
    const s2 = Math.hypot(a1, a2);
    let g = this.W4 - \u03A9\u02B9 - \u03C8;
    let \u03D6 = 0;
    const [s2g0, c2g0] = base_default.sincos(2 * g0);
    const f = () => {
      \u03D6 = this.W4 + 0.37515 * d2 * (Math.sin(2 * g) - s2g0);
      g = \u03D6 - \u03A9\u02B9 - \u03C8;
    };
    f();
    f();
    f();
    const e\u02B9 = 0.029092 + 19048e-8 * (Math.cos(2 * g) - c2g0);
    const qq = 2 * (this.W5 - \u03D6);
    const b1 = si\u02B9 * s\u03A9\u02B9W8;
    const b2 = this.cW7 * si\u02B9 * c\u03A9\u02B9W8 - this.sW7 * ci\u02B9;
    const \u03B8 = Math.atan2(b1, b2) + this.W8;
    const [sq, cq] = base_default.sincos(qq);
    const e = e\u02B9 + 2778797e-9 * e\u02B9 * cq;
    const p2 = \u03D6 + 0.159215 * d2 * sq;
    const u = 2 * this.W5 - 2 * \u03B8 + \u03C8;
    const [su, cu] = base_default.sincos(u);
    const h = 0.9375 * e\u02B9 * e\u02B9 * sq + 0.1875 * s2 * s2 * Math.sin(2 * (this.W5 - \u03B8));
    const \u03BB\u02B9 = L2 - 0.254744 * d2 * (this.e1 * Math.sin(this.W6) + 0.75 * this.e1 * this.e1 * Math.sin(2 * this.W6) + h);
    const i = i\u02B9 + 0.031843 * d2 * s2 * cu;
    const \u03A9 = \u03A9\u02B9 + 0.031843 * d2 * s2 * su / si\u02B9;
    const a = 20.216193;
    return this.subr(\u03BB\u02B9, p2, e, a, \u03A9, i);
  };
  Qs.prototype.hyperion = function() {
    const \u03B7 = 92.39 * d2 + 0.5621071 * d2 * this.t6;
    const \u03B6 = 148.19 * d2 - 19.18 * d2 * this.t8;
    const \u03B8 = 184.8 * d2 - 35.41 * d2 * this.t9;
    const \u03B8\u02B9 = \u03B8 - 7.5 * d2;
    const as = 176 * d2 + 12.22 * d2 * this.t8;
    const bs = 8 * d2 + 24.44 * d2 * this.t8;
    const cs = bs + 5 * d2;
    const \u03D6 = 69.898 * d2 - 18.67088 * d2 * this.t8;
    const \u03C6 = 2 * (\u03D6 - this.W5);
    const \u03C7 = 94.9 * d2 - 2.292 * d2 * this.t8;
    const [s\u03B7, c\u03B7] = base_default.sincos(\u03B7);
    const [s\u03B6, c\u03B6] = base_default.sincos(\u03B6);
    const [s2\u03B6, c2\u03B6] = base_default.sincos(2 * \u03B6);
    const [s3\u03B6, c3\u03B6] = base_default.sincos(3 * \u03B6);
    const [s\u03B6p\u03B7, c\u03B6p\u03B7] = base_default.sincos(\u03B6 + \u03B7);
    const [s\u03B6m\u03B7, c\u03B6m\u03B7] = base_default.sincos(\u03B6 - \u03B7);
    const [s\u03C6, c\u03C6] = base_default.sincos(\u03C6);
    const [s\u03C7, c\u03C7] = base_default.sincos(\u03C7);
    const [scs, ccs] = base_default.sincos(cs);
    const a = 24.50601 - 0.08686 * c\u03B7 - 166e-5 * c\u03B6p\u03B7 + 175e-5 * c\u03B6m\u03B7;
    const e = 0.103458 - 4099e-6 * c\u03B7 - 167e-6 * c\u03B6p\u03B7 + 235e-6 * c\u03B6m\u03B7 + 0.02303 * c\u03B6 - 212e-5 * c2\u03B6 + 151e-6 * c3\u03B6 + 13e-5 * c\u03C6;
    const p2 = \u03D6 + 0.15648 * d2 * s\u03C7 - 0.4457 * d2 * s\u03B7 - 0.2657 * d2 * s\u03B6p\u03B7 - 0.3573 * d2 * s\u03B6m\u03B7 - 12.872 * d2 * s\u03B6 + 1.668 * d2 * s2\u03B6 - 0.2419 * d2 * s3\u03B6 - 0.07 * d2 * s\u03C6;
    const \u03BB\u02B9 = 177.047 * d2 + 16.91993829 * d2 * this.t6 + 0.15648 * d2 * s\u03C7 + 9.142 * d2 * s\u03B7 + 7e-3 * d2 * Math.sin(2 * \u03B7) - 0.014 * d2 * Math.sin(3 * \u03B7) + 0.2275 * d2 * s\u03B6p\u03B7 + 0.2112 * d2 * s\u03B6m\u03B7 - 0.26 * d2 * s\u03B6 - 98e-4 * d2 * s2\u03B6 - 0.013 * d2 * Math.sin(as) + 0.017 * d2 * Math.sin(bs) - 0.0303 * d2 * s\u03C6;
    const i = 27.3347 * d2 + 0.6434886 * d2 * c\u03C7 + 0.315 * d2 * this.cW3 + 0.018 * d2 * Math.cos(\u03B8) - 0.018 * d2 * ccs;
    const \u03A9 = 168.6812 * d2 + 1.40136 * d2 * c\u03C7 + 0.68599 * d2 * this.sW3 - 0.0392 * d2 * scs + 0.0366 * d2 * Math.sin(\u03B8\u02B9);
    return this.subr(\u03BB\u02B9, p2, e, a, \u03A9, i);
  };
  Qs.prototype.iapetus = function() {
    const L2 = 261.1582 * d2 + 22.57697855 * d2 * this.t4;
    const \u03D6\u02B9 = 91.796 * d2 + 0.562 * d2 * this.t7;
    const \u03C8 = 4.367 * d2 - 0.195 * d2 * this.t7;
    const \u03B8 = 146.819 * d2 - 3.198 * d2 * this.t7;
    const \u03C6 = 60.47 * d2 + 1.521 * d2 * this.t7;
    const \u03A6 = 205.055 * d2 - 2.091 * d2 * this.t7;
    const e\u02B9 = 0.028298 + 1156e-6 * this.t11;
    const \u03D60 = 352.91 * d2 + 11.71 * d2 * this.t11;
    const \u03BC = 76.3852 * d2 + 4.53795125 * d2 * this.t10;
    const i\u02B9 = base_default.horner(this.t11, 18.4602 * d2, -0.9518 * d2, -0.072 * d2, 54e-4 * d2);
    const \u03A9\u02B9 = base_default.horner(this.t11, 143.198 * d2, -3.919 * d2, 0.116 * d2, 8e-3 * d2);
    const l = \u03BC - \u03D60;
    const g = \u03D60 - \u03A9\u02B9 - \u03C8;
    const g1 = \u03D60 - \u03A9\u02B9 - \u03C6;
    const ls = this.W5 - \u03D6\u02B9;
    const gs = \u03D6\u02B9 - \u03B8;
    const lT = L2 - this.W4;
    const gT = this.W4 - \u03A6;
    const u1 = 2 * (l + g - ls - gs);
    const u2 = l + g1 - lT - gT;
    const u3 = l + 2 * (g - ls - gs);
    const u4 = lT + gT - g1;
    const u5 = 2 * (ls + gs);
    const [sl, cl] = base_default.sincos(l);
    const [su1, cu1] = base_default.sincos(u1);
    const [su2, cu2] = base_default.sincos(u2);
    const [su3, cu3] = base_default.sincos(u3);
    const [su4, cu4] = base_default.sincos(u4);
    const [slu2, clu2] = base_default.sincos(l + u2);
    const [sg1gT, cg1gT] = base_default.sincos(g1 - gT);
    const [su52g, cu52g] = base_default.sincos(u5 - 2 * g);
    const [su5\u03C8, cu5\u03C8] = base_default.sincos(u5 + \u03C8);
    const [su2\u03C6, cu2\u03C6] = base_default.sincos(u2 + \u03C6);
    const [s5, c5] = base_default.sincos(l + g1 + lT + gT + \u03C6);
    const a = 58.935028 + 4638e-6 * cu1 + 0.058222 * cu2;
    const e = e\u02B9 - 14097e-7 * cg1gT + 3733e-7 * cu52g + 118e-6 * cu3 + 2408e-7 * cl + 2849e-7 * clu2 + 619e-6 * cu4;
    const w = 0.08077 * d2 * sg1gT + 0.02139 * d2 * su52g - 676e-5 * d2 * su3 + 0.0138 * d2 * sl + 0.01632 * d2 * slu2 + 0.03547 * d2 * su4;
    const p2 = \u03D60 + w / e\u02B9;
    const \u03BB\u02B9 = \u03BC - 0.04299 * d2 * su2 - 789e-5 * d2 * su1 - 0.06312 * d2 * Math.sin(ls) - 295e-5 * d2 * Math.sin(2 * ls) - 0.02231 * d2 * Math.sin(u5) + 65e-4 * d2 * su5\u03C8;
    const i = i\u02B9 + 0.04204 * d2 * cu5\u03C8 + 235e-5 * d2 * c5 + 36e-4 * d2 * cu2\u03C6;
    const w\u02B9 = 0.04204 * d2 * su5\u03C8 + 235e-5 * d2 * s5 + 358e-5 * d2 * su2\u03C6;
    const \u03A9 = \u03A9\u02B9 + w\u02B9 / Math.sin(i\u02B9);
    return this.subr(\u03BB\u02B9, p2, e, a, \u03A9, i);
  };

  // node_modules/astronomia/src/solstice.js
  var { abs: abs2, cos: cos9, sin: sin9 } = Math;
  var D2R9 = Math.PI / 180;
  var terms = (function() {
    const term = [
      [485, 324.96, 1934.136],
      [203, 337.23, 32964.467],
      [199, 342.08, 20.186],
      [182, 27.85, 445267.112],
      [156, 73.14, 45036.886],
      [136, 171.52, 22518.443],
      [77, 222.54, 65928.934],
      [74, 296.72, 3034.906],
      [70, 243.58, 9037.513],
      [58, 119.81, 33718.147],
      [52, 297.17, 150.678],
      [50, 21.02, 2281.226],
      [45, 247.54, 29929.562],
      [44, 325.15, 31555.956],
      [29, 60.93, 4443.417],
      [18, 155.12, 67555.328],
      [17, 288.79, 4562.452],
      [16, 198.04, 62894.029],
      [14, 199.76, 31436.921],
      [12, 95.39, 14577.848],
      [12, 287.11, 31931.756],
      [12, 320.81, 34777.259],
      [9, 227.73, 1222.114],
      [8, 15.45, 16859.074]
    ];
    return term.map((t) => {
      return {
        a: t[0],
        b: t[1],
        c: t[2]
      };
    });
  })();

  // node_modules/astronomia/src/sunrise.js
  var stdh02 = {
    sunrise: new sexagesimal_default.Angle(true, 0, 50, 0).rad(),
    sunriseEnd: new sexagesimal_default.Angle(true, 0, 18, 0).rad(),
    twilight: new sexagesimal_default.Angle(true, 6, 0, 0).rad(),
    nauticalTwilight: new sexagesimal_default.Angle(true, 12, 0, 0).rad(),
    night: new sexagesimal_default.Angle(true, 18, 0, 0).rad(),
    goldenHour: new sexagesimal_default.Angle(false, 6, 0, 0).rad()
  };

  // node_modules/@hnw/date-tibetan/src/Tibetan.js
  function toFixed(val, e) {
    return parseFloat(val.toFixed(e), 10);
  }
  var CalendarTibetan = class _CalendarTibetan {
    /**
     * constructor
     *
     * @param {Number|Array|Object} cycle - tibetan 60 year cicle; if `{Array}` than `[cycle, year, ..., leapDay]`
     * @param {Number} year - tibetan year of cycle
     * @param {Number} month - tibetan month
     * @param {Boolean} leapMonth - `true` if leap month
     * @param {Number} day - tibetan day
     * @param {Boolean} leapDay - `true` if leap day
     */
    constructor(cycle, year, month, leapMonth, day, leapDay) {
      this._M0 = 2015501 + 4783 / 5656;
      this._M1 = 167025 / 5656;
      this._M2 = 11135 / 11312;
      this._S0 = 743 / 804;
      this._S1 = 65 / 804;
      this._S2 = 13 / 4824;
      this._A0 = 475 / 3528;
      this._A1 = 253 / 3528;
      this._A2 = 1 / 28;
      this._P0 = 139 / 180;
      this._EPOCH_YEAR = 806;
      this._JD_OFFSET_STD_TIME = (6 + 4 / 60) / 24;
      this._JD_OFFSET_DAY_START = (-5 + 12) / 24;
      this._IS_BHUTAN_LEAP = false;
      this._EPOCH_RAB_BYUNG = 1027;
      this._moon_tab_values = [0, 5, 10, 15, 19, 22, 24, 25];
      this._sun_tab_values = [0, 6, 10, 11];
      this.set(cycle, year, month, leapMonth, day, leapDay);
    }
    /**
     * set a new tibetan date
     *
     * @param {Number|Array|Object} cycle - tibetan 60 year cicle; if `{Array}` than `[cycle, year, ..., leapDay]`
     * @param {Number} year - tibetan year of cycle
     * @param {Number} month - tibetan month
     * @param {Boolean} leapMonth - `true` if leap month
     * @param {Number} day - tibetan day
     * @param {Boolean} leapDay - `true` if leap day
     */
    set(cycle, year, month, leapMonth, day, leapDay) {
      if (cycle instanceof _CalendarTibetan) {
        this.cycle = cycle.cycle;
        this.year = cycle.year;
        this.month = cycle.month;
        this.leapMonth = !!cycle.leapMonth;
        this.day = cycle.day;
        this.leapDay = !!cycle.leapDay;
      } else if (Array.isArray(cycle)) {
        this.cycle = cycle[0];
        this.year = cycle[1];
        this.month = cycle[2];
        this.leapMonth = !!cycle[3];
        this.day = cycle[4];
        this.leapDay = !!cycle[5];
      } else {
        this.cycle = cycle;
        this.year = year;
        this.month = month;
        this.leapMonth = !!leapMonth;
        this.day = day;
        this.leapDay = !!leapDay;
      }
      return this;
    }
    /**
     * Returns Tibetan date components as an array.
     * @returns {Array<Number|Boolean>} [cycle, year, month, leapMonth, day, leapDay]
     */
    get() {
      return [this.cycle, this.year, this.month, this.leapMonth, this.day, this.leapDay];
    }
    _jdToJdLocal(jd) {
      return jd + this._JD_OFFSET_STD_TIME + this._JD_OFFSET_DAY_START;
    }
    _jdLocalToJd(jdLocal) {
      return jdLocal - this._JD_OFFSET_STD_TIME - this._JD_OFFSET_DAY_START;
    }
    /**
     * Calculate Alpha, an intermediate value for leap month calculations. (Eq C.12)
     * @private
     * @returns {Number}
     */
    _getAlpha() {
      return 12 * (this._S0 - this._P0);
    }
    /**
     * Calculate Beta, another intermediate value for leap month calculations.
     * The adjustment `(this._IS_BHUTAN_LEAP ? 2 : 0)`
     * handles the specific Bhutanese leap month rule. (Eq C.19, C.58)
     * @private
     * @returns {Number}
     */
    _getBeta() {
      const alpha = this._getAlpha();
      return Math.ceil(67 * alpha) - (this._IS_BHUTAN_LEAP ? 2 : 0);
    }
    /**
     * get Gregorian year from tibetan cycle / year
     * @return {Number} year
     */
    _getGregorianYear() {
      return this._EPOCH_RAB_BYUNG + (this.cycle - 1) * 60 + (this.year - 1);
    }
    /**
     * get tibetan cycle / year from Gregorian year
     * @returns {Object} { cycle, year }
     */
    epochCycleFromYear(gyear) {
      const cycle = Math.floor((gyear - this._EPOCH_RAB_BYUNG) / 60) + 1;
      const year = (gyear - this._EPOCH_RAB_BYUNG) % 60 + 1;
      return { cycle, year };
    }
    /**
     * Get true month count (n) from Tibetan Year, Month, and LeapMonth status.
     */
    _getTrueMonthCount(gyear) {
      const Y = gyear ? gyear : this._getGregorianYear();
      const M = this.month;
      const leapMonth = this.leapMonth;
      const alpha = this._getAlpha();
      const M_prime = 12 * (Y - this._EPOCH_YEAR) + M;
      const n = Math.floor(67 * (M_prime - alpha) / 65);
      if (this._isLeapMonthFromYearAndMonth(Y, M) && leapMonth) {
        return n + (this._IS_BHUTAN_LEAP ? 1 : -1);
      }
      return n;
    }
    /**
     * Checks if the month corresponding to a trueMonthCount is a leap month.
     *
     * @return {Boolean} true if it's a leap month
     */
    _isLeapMonthFromYearAndMonth(year, month) {
      const Y = year;
      const M = month;
      const beta = this._getBeta();
      const M_prime = 12 * (Y - this._EPOCH_YEAR) + M;
      const mod_65_val = (M_prime * 2 - beta) % 65;
      return mod_65_val == 0 || mod_65_val == 1;
    }
    /**
     * Get Tibetan Year, Month, and LeapMonth status from true month count (n).
     *
     * @param {Number} n - true month count
     * @returns {Object} { year, month, isLeap }
     */
    _getTibetanMonthFromTrueMonthCount(trueMonthCount) {
      const n = trueMonthCount;
      const beta = this._getBeta();
      const x = Math.ceil((65 * n + beta) / 67);
      let M = x % 12;
      if (M == 0) M = 12;
      const Y = (x - M) / 12 + this._EPOCH_YEAR;
      let L2 = false;
      let leapX = Math.ceil((65 * (this._IS_BHUTAN_LEAP ? n - 1 : n + 1) + beta) / 67);
      if (x == leapX) {
        L2 = true;
      }
      const { cycle, year } = this.epochCycleFromYear(Y);
      return { cycle, year, month: M, leapMonth: L2 };
    }
    /**
     * Helper to interpolate values from a table with symmetry.
     * tableValues: array of values for indices [0, ..., tableValues.length-1]
     * x_in: input value
     * halfSymmetryLen: e.g., 7 for moon (table covers 0-7, symmetric up to 14)
     * e.g., 3 for sun (table covers 0-3, symmetric up to 6)
     * periodLen: full period, e.g., 28 for moon, 12 for sun
     */
    _linearInterpolate(x_in, tableValues, halfSymmetryLen, periodLen) {
      let x = x_in % periodLen;
      if (x < 0) {
        x += periodLen;
      }
      let sign = 1;
      const symmetryPoint = halfSymmetryLen * 2;
      if (x >= symmetryPoint) {
        sign = -1;
        x -= symmetryPoint;
      }
      if (x > halfSymmetryLen) {
        x = symmetryPoint - x;
      }
      const i = Math.floor(x);
      const frac = x - i;
      let val;
      if (i < 0) {
        val = tableValues[0];
      } else if (i >= tableValues.length - 1) {
        val = tableValues[tableValues.length - 1];
      } else {
        val = tableValues[i] * (1 - frac) + tableValues[i + 1] * frac;
      }
      return sign * val;
    }
    /**
     * Calculate True Date (gza' dag) for a given true month count and lunar day (tithi).
     * (Section 7)
     * @param {Number} trueMonthCount (n)
     * @param {Number} lunarDay (d, 1-30)
     * @return {Number} true_date
     */
    getTrueDate(trueMonthCount, lunarDay) {
      const n = trueMonthCount;
      const d3 = lunarDay;
      const mean_date = n * this._M1 + d3 * this._M2 + this._M0;
      let mean_sun = n * this._S1 + d3 * this._S2 + this._S0;
      mean_sun = mean_sun - Math.floor(mean_sun);
      let anomaly_moon = n * this._A1 + d3 * this._A2 + this._A0;
      anomaly_moon = anomaly_moon - Math.floor(anomaly_moon);
      const moon_equ_arg = 28 * anomaly_moon;
      const moon_equ = this._linearInterpolate(moon_equ_arg, this._moon_tab_values, 7, 28);
      let anomaly_sun = mean_sun - 1 / 4;
      anomaly_sun = anomaly_sun - Math.floor(anomaly_sun);
      const sun_equ_arg = 12 * anomaly_sun;
      const sun_equ = this._linearInterpolate(sun_equ_arg, this._sun_tab_values, 3, 12);
      const true_date = mean_date + moon_equ / 60 - sun_equ / 60;
      return true_date;
    }
    /**
     * common conversion from JDN to tibetan date
     *
     * @private
     * @param {Number} j - date in JD
     */
    _from(jd) {
      const jdn = Math.trunc(toFixed(jd, 7));
      const solarDaysFromEpoch = jdn - this._M0;
      let n = Math.floor(solarDaysFromEpoch / this._M1);
      let day = Math.floor((solarDaysFromEpoch - n * this._M1) / this._M2);
      let leapDay = false;
      for (let i = 0; i < 3; i++) {
        const trueDate = this.getTrueDate(n, day);
        if (trueDate > jdn + 1) {
          leapDay = true;
          break;
        } else if (trueDate > jdn) {
          break;
        }
        day++;
      }
      if (day == 0) {
        n--;
        day = 30;
      }
      if (day > 30) {
        n++;
        day -= 30;
      }
      const { cycle, year, month, leapMonth } = this._getTibetanMonthFromTrueMonthCount(n);
      this.set(cycle, year, month, leapMonth, day, leapDay);
    }
    /**
     * convert JD to tibetan calendar date
     *
     * @param {Number} j - date in JD
     * @return {Object} this
     */
    fromJD(jd) {
      this._from(this._jdToJdLocal(jd));
      return this;
    }
    /**
     * convert gregorian date to tibetan calendar date
     *
     * @param {Number} year - (int) year in Gregorian or Julian Calendar
     * @param {Number} month - (int)
     * @param {Number} day - needs to be in correct (tibetan) timezone
     * @return {Object} this
     */
    fromGregorian(year, month, day) {
      const jdn = new julian_default.CalendarGregorian(year, month, day).toJD() + 0.5;
      this._from(jdn);
      return this;
    }
    /**
     * convert date to tibetan calendar date
     *
     * @param {Date} date - javascript date object
     * @return {Object} this
     */
    fromDate(date) {
      const jd = new julian_default.CalendarGregorian().fromDate(date).toJD();
      this._from(this._jdToJdLocal(jd));
      return this;
    }
    /**
     * convert tibetan date to JD
     * @param {Number} [gyear] - (int) gregorian year
     * @return {Number} date in JDN
     */
    toJDN(gyear) {
      const n = this._getTrueMonthCount(gyear);
      const true_date = this.getTrueDate(n, this.day);
      let jdn = Math.floor(true_date);
      const prevTrueDate = this.getTrueDate(n, this.day - 1);
      const prevJdn = Math.floor(prevTrueDate);
      const isSkippedDay = jdn == prevJdn;
      const isRepeatedDay = jdn == prevJdn + 2;
      if (isRepeatedDay && this.leapDay) {
        jdn = jdn - 1;
      }
      if (isSkippedDay) {
        jdn = jdn + 1;
      }
      return jdn;
    }
    /**
     * convert tibetan date to gregorian date
     *
     * @param {Number} [gyear] - (int) gregorian year
     * @return {Object} date in gregorian (preleptic) calendar; Timezone is Standard local Time
     * {Number} year - (int)
     * {Number} month - (int)
     * {Number} day - (int)
     */
    toGregorian(gyear) {
      const jdn = this.toJDN(gyear);
      const jd = jdn - 0.5;
      const cal = new julian_default.JDToCalendarGregorian(jd);
      return {
        year: cal.year,
        month: cal.month,
        day: cal.day
      };
    }
    /**
     * convert tibetan date to Date
     *
     * @param {Number} [gyear] - (int) gregorian year
     * @return {Date} javascript date object in gregorian (preleptic) calendar
     */
    toDate(gyear) {
      const jdn = this.toJDN(gyear);
      const jd = this._jdLocalToJd(jdn);
      return new julian_default.CalendarGregorian().fromJD(jd).toDate();
    }
  };

  // node_modules/@hnw/date-tibetan/src/Mongolian.js
  var CalendarMongolian = class extends CalendarTibetan {
    constructor(cycle, year, month, leapMonth, day, leapDay) {
      super(cycle, year, month, leapMonth, day, leapDay);
      this._M0 = 2359237 + 2603 / 2828;
      this._S0 = 397 / 402;
      this._A0 = 1523 / 1764;
      this._P0 = 209 / 270;
      this._EPOCH_YEAR = 1747;
      this._JD_OFFSET_STD_TIME = 8 / 24;
    }
  };

  // node_modules/@hnw/date-tibetan/src/Bhutanese.js
  var CalendarBhutanese = class extends CalendarTibetan {
    constructor(cycle, year, month, leapMonth, day, leapDay) {
      super(cycle, year, month, leapMonth, day, leapDay);
      this._M0 = 2361807 + 52 / 707;
      this._S0 = 1 + 1 / 67;
      this._A0 = 17 / 147;
      this._P0 = 31 / 40;
      this._EPOCH_YEAR = 1754;
      this._IS_BHUTAN_LEAP = true;
      this._JD_OFFSET_STD_TIME = 6 / 24;
    }
  };
  return __toCommonJS(index_exports);
})();
/*! Bundled license information:

astronomia/src/base.js:
  (**
   * @copyright 2013 Sonia Keys
   * @copyright 2016 commenthol
   * @license MIT
   * @module base
   *)

astronomia/src/interpolation.js:
  (**
   * @copyright 2013 Sonia Keys
   * @copyright 2016 commenthol
   * @license MIT
   * @module interpolation
   *)

astronomia/src/angle.js:
  (**
   * @copyright 2013 Sonia Keys
   * @copyright 2016 commenthol
   * @license MIT
   * @module angle
   *)

astronomia/src/sexagesimal.js:
  (**
   * @copyright 2013 Sonia Keys
   * @copyright 2016 commenthol
   * @license MIT
   * @module sexagesimal
   *)

astronomia/src/globe.js:
  (**
   * @copyright 2013 Sonia Keys
   * @copyright 2016 commenthol
   * @license MIT
   * @module globe
   *)

astronomia/src/coord.js:
  (**
   * @copyright 2013 Sonia Keys
   * @copyright 2016 commenthol
   * @license MIT
   * @module coord
   *)

astronomia/src/nutation.js:
  (**
   * @copyright 2013 Sonia Keys
   * @copyright 2016 commenthol
   * @license MIT
   * @module nutation
   *)

astronomia/src/elementequinox.js:
  (**
   * @copyright 2013 Sonia Keys
   * @copyright 2016 commenthol
   * @license MIT
   * @module elementequinox
   *)

astronomia/src/precess.js:
  (**
   * @copyright 2013 Sonia Keys
   * @copyright 2016 commenthol
   * @license MIT
   * @module precess
   *)

astronomia/src/planetposition.js:
  (**
   * @copyright 2013 Sonia Keys
   * @copyright 2016 commenthol
   * @license MIT
   * @module planetposition
   *)

astronomia/src/solar.js:
  (**
   * @copyright 2013 Sonia Keys
   * @copyright 2016 commenthol
   * @license MIT
   * @module solar
   *)

astronomia/src/apparent.js:
  (**
   * @copyright 2013 Sonia Keys
   * @copyright 2016 commenthol
   * @license MIT
   * @module apparent
   *)

astronomia/src/apsis.js:
  (**
   * @copyright 2013 Sonia Keys
   * @copyright 2016 commenthol
   * @license MIT
   * @module apsis
   *)

astronomia/src/binary.js:
  (**
   * @copyright 2013 Sonia Keys
   * @copyright 2016 commenthol
   * @license MIT
   * @module binary
   *)

astronomia/src/conjunction.js:
  (**
   * @copyright 2013 Sonia Keys
   * @copyright 2016 commenthol
   * @license MIT
   * @module conjunction
   *)

astronomia/src/circle.js:
  (**
   * @copyright 2013 Sonia Keys
   * @copyright 2016 commenthol
   * @license MIT
   * @module circle
   *)

astronomia/src/deltat.js:
  (**
   * @copyright 2013 Sonia Keys
   * @copyright 2016 commenthol
   * @license MIT
   * @module deltat
   *)

astronomia/src/iterate.js:
  (**
   * @copyright 2013 Sonia Keys
   * @copyright 2016 commenthol
   * @license MIT
   * @module iterate
   *)

astronomia/src/kepler.js:
  (**
   * @copyright 2013 Sonia Keys
   * @copyright 2016 commenthol
   * @license MIT
   * @module kepler
   *)

astronomia/src/solarxyz.js:
  (**
   * @copyright 2013 Sonia Keys
   * @copyright 2016 commenthol
   * @license MIT
   * @module solarxyz
   *)

astronomia/src/elliptic.js:
  (**
   * @copyright 2013 Sonia Keys
   * @copyright 2016 commenthol
   * @license MIT
   * @module elliptic
   *)

astronomia/src/moonphase.js:
  (**
   * @copyright 2013 Sonia Keys
   * @copyright 2016 commenthol
   * @license MIT
   * @module moonphase
   *)

astronomia/src/eclipse.js:
  (**
   * @copyright 2013 Sonia Keys
   * @copyright 2016 commenthol
   * @license MIT
   * @module eclipse
   *)

astronomia/src/elp.js:
  (**
   * @copyright 2020 mdmunir
   * @copyright 2020 commenthol
   * @license MIT
   * @module elp
   *)

astronomia/src/eqtime.js:
  (**
   * @copyright 2013 Sonia Keys
   * @copyright 2016 commenthol
   * @license MIT
   * @module eqtime
   *)

astronomia/src/fit.js:
  (**
   * @copyright 2013 Sonia Keys
   * @copyright 2016 commenthol
   * @license MIT
   * @module fit
   *)

astronomia/src/illum.js:
  (**
   * @copyright 2013 Sonia Keys
   * @copyright 2016 commenthol
   * @license MIT
   * @module illum
   *)

astronomia/src/julian.js:
  (**
   * @copyright 2013 Sonia Keys
   * @copyright 2016 commenthol
   * @license MIT
   * @module julian
   *)

astronomia/src/jm.js:
  (**
   * @copyright 2013 Sonia Keys
   * @copyright 2016 commenthol
   * @license MIT
   * @module jm
   *)

astronomia/src/jupiter.js:
  (**
   * @copyright 2013 Sonia Keys
   * @copyright 2016 commenthol
   * @license MIT
   * @module jupiter
   *)

astronomia/src/planetelements.js:
  (**
   * @copyright 2013 Sonia Keys
   * @copyright 2016 commenthol
   * @license MIT
   * @module planetelements
   *)

astronomia/src/jupitermoons.js:
  (**
   * @copyright 2013 Sonia Keys
   * @copyright 2016 commenthol
   * @license MIT
   * @module jupitermoons
   *)

astronomia/src/line.js:
  (**
   * @copyright 2013 Sonia Keys
   * @copyright 2016 commenthol
   * @license MIT
   * @module line
   *)

astronomia/src/nearparabolic.js:
  (**
   * @copyright 2013 Sonia Keys
   * @copyright 2016 commenthol
   * @license MIT
   * @module nearparabolic
   *)

astronomia/src/node.js:
  (**
   * @copyright 2013 Sonia Keys
   * @copyright 2016 commenthol
   * @license MIT
   * @module node
   *)

astronomia/src/mars.js:
  (**
   * @copyright 2013 Sonia Keys
   * @copyright 2016 commenthol
   * @license MIT
   * @module mars
   *)

astronomia/src/moonposition.js:
  (**
   * @copyright 2013 Sonia Keys
   * @copyright 2016 commenthol
   * @license MIT
   * @module moonposition
   *)

astronomia/src/moon.js:
  (**
   * @copyright 2013 Sonia Keys
   * @copyright 2016 commenthol
   * @license MIT
   * @module moon
   *)

astronomia/src/moonillum.js:
  (**
   * @copyright 2013 Sonia Keys
   * @copyright 2016 commenthol
   * @license MIT
   * @module moonillum
   *)

astronomia/src/moonmaxdec.js:
  (**
   * @copyright 2013 Sonia Keys
   * @copyright 2016 commenthol
   * @license MIT
   * @module moonmaxdec
   *)

astronomia/src/moonnode.js:
  (**
   * @copyright 2013 Sonia Keys
   * @copyright 2016 commenthol
   * @license MIT
   * @module moonnode
   *)

astronomia/src/parabolic.js:
  (**
   * @copyright 2013 Sonia Keys
   * @copyright 2016 commenthol
   * @license MIT
   * @module parabolic
   *)

astronomia/src/sidereal.js:
  (**
   * @copyright 2013 Sonia Keys
   * @copyright 2016 commenthol
   * @license MIT
   * @module sidereal
   *)

astronomia/src/parallax.js:
  (**
   * @copyright 2013 Sonia Keys
   * @copyright 2016 commenthol
   * @license MIT
   * @module parallax
   *)

astronomia/src/parallactic.js:
  (**
   * @copyright 2013 Sonia Keys
   * @copyright 2016 commenthol
   * @license MIT
   * @module parallactic
   *)

astronomia/src/perihelion.js:
  (**
   * @copyright 2013 Sonia Keys
   * @copyright 2016 commenthol
   * @license MIT
   * @module perihelion
   *)

astronomia/src/planetary.js:
  (**
   * @copyright 2013 Sonia Keys
   * @copyright 2016 commenthol
   * @license MIT
   * @module planetary
   *)

astronomia/src/pluto.js:
  (**
   * @copyright 2013 Sonia Keys
   * @copyright 2016 commenthol
   * @license MIT
   * @module pluto
   *)

astronomia/src/refraction.js:
  (**
   * @copyright 2013 Sonia Keys
   * @copyright 2016 commenthol
   * @license MIT
   * @module refraction
   *)

astronomia/src/rise.js:
  (**
   * @copyright 2013 Sonia Keys
   * @copyright 2016 commenthol
   * @license MIT
   * @module rise
   *)

astronomia/src/saturnmoons.js:
  (**
   * @copyright 2013 Sonia Keys
   * @copyright 2016 commenthol
   * @license MIT
   * @module saturnmoons
   *)

astronomia/src/saturnring.js:
  (**
   * @copyright 2013 Sonia Keys
   * @copyright 2016 commenthol
   * @license MIT
   * @module saturnring
   *)

astronomia/src/solardisk.js:
  (**
   * @copyright 2013 Sonia Keys
   * @copyright 2016 commenthol
   * @license MIT
   * @module solardisk
   *)

astronomia/src/solstice.js:
  (**
   * @copyright 2013 Sonia Keys
   * @copyright 2016 commenthol
   * @license MIT
   * @module solstice
   *)

astronomia/src/stellar.js:
  (**
   * @copyright 2013 Sonia Keys
   * @copyright 2016 commenthol
   * @license MIT
   * @module stellar
   *)

astronomia/src/sundial.js:
  (**
   * @copyright 2013 Sonia Keys
   * @copyright 2016 commenthol
   * @license MIT
   * @module sundial
   *)

astronomia/src/sunrise.js:
  (**
   * @copyright 2016 commenthol
   * @license MIT
   * @module sunrise
   *)
*/
