var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/aspects/index.ts
var aspects_exports = {};
__export(aspects_exports, {
  ALL_ASPECTS: () => ALL_ASPECTS,
  ASPECT_DEFINITIONS: () => ASPECT_DEFINITIONS,
  ASPECT_SIGN_SEPARATIONS: () => ASPECT_SIGN_SEPARATIONS,
  AspectType: () => AspectType,
  DEFAULT_ORBS: () => DEFAULT_ORBS,
  KEPLER_ASPECTS: () => KEPLER_ASPECTS,
  MAJOR_ASPECTS: () => MAJOR_ASPECTS,
  MINOR_ASPECTS: () => MINOR_ASPECTS,
  PatternType: () => PatternType,
  anglesAreEqual: () => anglesAreEqual,
  angularSeparation: () => angularSeparation,
  applyOutOfSignPenalty: () => applyOutOfSignPenalty,
  calculateAspects: () => calculateAspects,
  calculateStrength: () => calculateStrength,
  createAspectConfig: () => createAspectConfig,
  detectAspect: () => detectAspect,
  detectGrandCross: () => detectGrandCross,
  detectGrandTrine: () => detectGrandTrine,
  detectKite: () => detectKite,
  detectMysticRectangle: () => detectMysticRectangle,
  detectStellium: () => detectStellium,
  detectTSquare: () => detectTSquare,
  detectYod: () => detectYod,
  filterAspectsByBody: () => filterAspectsByBody,
  filterAspectsByType: () => filterAspectsByType,
  findAllAspects: () => findAllAspects,
  findAllMatchingAspects: () => findAllMatchingAspects,
  findMatchingAspect: () => findMatchingAspect,
  findPatterns: () => findPatterns,
  formatAspect: () => formatAspect,
  formatPattern: () => formatPattern,
  getAspectSummary: () => getAspectSummary,
  getOrb: () => getOrb,
  getPatternSummary: () => getPatternSummary,
  getSignIndex: () => getSignIndex,
  getStrongestAspect: () => getStrongestAspect,
  isOutOfSign: () => isOutOfSign,
  isWithinOrb: () => isWithinOrb,
  midpoint: () => midpoint,
  normalizeAngle: () => normalizeAngle,
  signSeparation: () => signSeparation,
  signedAngle: () => signedAngle
});

// src/aspects/types.ts
var AspectType = /* @__PURE__ */ ((AspectType2) => {
  AspectType2["Conjunction"] = "conjunction";
  AspectType2["Sextile"] = "sextile";
  AspectType2["Square"] = "square";
  AspectType2["Trine"] = "trine";
  AspectType2["Opposition"] = "opposition";
  AspectType2["SemiSextile"] = "semi-sextile";
  AspectType2["SemiSquare"] = "semi-square";
  AspectType2["Quintile"] = "quintile";
  AspectType2["Sesquiquadrate"] = "sesquiquadrate";
  AspectType2["Biquintile"] = "biquintile";
  AspectType2["Quincunx"] = "quincunx";
  AspectType2["Septile"] = "septile";
  AspectType2["Novile"] = "novile";
  AspectType2["Decile"] = "decile";
  return AspectType2;
})(AspectType || {});
var PatternType = /* @__PURE__ */ ((PatternType2) => {
  PatternType2["TSquare"] = "T-Square";
  PatternType2["GrandTrine"] = "Grand Trine";
  PatternType2["GrandCross"] = "Grand Cross";
  PatternType2["Yod"] = "Yod";
  PatternType2["Kite"] = "Kite";
  PatternType2["MysticRectangle"] = "Mystic Rectangle";
  PatternType2["Stellium"] = "Stellium";
  return PatternType2;
})(PatternType || {});
var DEFAULT_ORBS = {
  // Major aspects - wider orbs
  ["conjunction" /* Conjunction */]: 8,
  ["opposition" /* Opposition */]: 8,
  ["trine" /* Trine */]: 8,
  ["square" /* Square */]: 7,
  ["sextile" /* Sextile */]: 6,
  // Minor aspects - tighter orbs
  ["semi-sextile" /* SemiSextile */]: 2,
  ["semi-square" /* SemiSquare */]: 2,
  ["quintile" /* Quintile */]: 2,
  ["sesquiquadrate" /* Sesquiquadrate */]: 2,
  ["biquintile" /* Biquintile */]: 2,
  ["quincunx" /* Quincunx */]: 3,
  // Kepler aspects - very tight orbs (1-2°)
  ["septile" /* Septile */]: 1,
  ["novile" /* Novile */]: 1,
  ["decile" /* Decile */]: 1
};
var MAJOR_ASPECTS = [
  "conjunction" /* Conjunction */,
  "sextile" /* Sextile */,
  "square" /* Square */,
  "trine" /* Trine */,
  "opposition" /* Opposition */
];
var MINOR_ASPECTS = [
  "semi-sextile" /* SemiSextile */,
  "semi-square" /* SemiSquare */,
  "quintile" /* Quintile */,
  "sesquiquadrate" /* Sesquiquadrate */,
  "biquintile" /* Biquintile */,
  "quincunx" /* Quincunx */
];
var KEPLER_ASPECTS = [
  "septile" /* Septile */,
  "novile" /* Novile */,
  "decile" /* Decile */
];
var ALL_ASPECTS = [
  ...MAJOR_ASPECTS,
  ...MINOR_ASPECTS,
  ...KEPLER_ASPECTS
];
var ASPECT_DEFINITIONS = {
  ["conjunction" /* Conjunction */]: {
    type: "conjunction" /* Conjunction */,
    angle: 0,
    symbol: "\u260C",
    defaultOrb: 8,
    classification: "major",
    nature: "neutral",
    name: "Conjunction",
    harmonic: Infinity
    // 360/0 is undefined, conjunction is the base
  },
  ["sextile" /* Sextile */]: {
    type: "sextile" /* Sextile */,
    angle: 60,
    symbol: "\u26B9",
    defaultOrb: 6,
    classification: "major",
    nature: "harmonious",
    name: "Sextile",
    harmonic: 6
  },
  ["square" /* Square */]: {
    type: "square" /* Square */,
    angle: 90,
    symbol: "\u25A1",
    defaultOrb: 7,
    classification: "major",
    nature: "dynamic",
    name: "Square",
    harmonic: 4
  },
  ["trine" /* Trine */]: {
    type: "trine" /* Trine */,
    angle: 120,
    symbol: "\u25B3",
    defaultOrb: 8,
    classification: "major",
    nature: "harmonious",
    name: "Trine",
    harmonic: 3
  },
  ["opposition" /* Opposition */]: {
    type: "opposition" /* Opposition */,
    angle: 180,
    symbol: "\u260D",
    defaultOrb: 8,
    classification: "major",
    nature: "dynamic",
    name: "Opposition",
    harmonic: 2
  },
  ["semi-sextile" /* SemiSextile */]: {
    type: "semi-sextile" /* SemiSextile */,
    angle: 30,
    symbol: "\u26BA",
    defaultOrb: 2,
    classification: "minor",
    nature: "neutral",
    name: "Semi-sextile",
    harmonic: 12
  },
  ["semi-square" /* SemiSquare */]: {
    type: "semi-square" /* SemiSquare */,
    angle: 45,
    symbol: "\u2220",
    defaultOrb: 2,
    classification: "minor",
    nature: "dynamic",
    name: "Semi-square",
    harmonic: 8
  },
  ["quintile" /* Quintile */]: {
    type: "quintile" /* Quintile */,
    angle: 72,
    symbol: "Q",
    defaultOrb: 2,
    classification: "minor",
    nature: "harmonious",
    name: "Quintile",
    harmonic: 5
  },
  ["sesquiquadrate" /* Sesquiquadrate */]: {
    type: "sesquiquadrate" /* Sesquiquadrate */,
    angle: 135,
    symbol: "\u26BC",
    defaultOrb: 2,
    classification: "minor",
    nature: "dynamic",
    name: "Sesquiquadrate",
    harmonic: 8
    // 360/45 = 8, this is 3rd harmonic of octile
  },
  ["biquintile" /* Biquintile */]: {
    type: "biquintile" /* Biquintile */,
    angle: 144,
    symbol: "bQ",
    defaultOrb: 2,
    classification: "minor",
    nature: "harmonious",
    name: "Biquintile",
    harmonic: 5
    // 2nd harmonic of quintile
  },
  ["quincunx" /* Quincunx */]: {
    type: "quincunx" /* Quincunx */,
    angle: 150,
    symbol: "\u26BB",
    defaultOrb: 3,
    classification: "minor",
    nature: "neutral",
    name: "Quincunx",
    harmonic: 12
    // 5th harmonic of semi-sextile
  },
  // Kepler aspects
  ["septile" /* Septile */]: {
    type: "septile" /* Septile */,
    angle: 360 / 7,
    // 51.42857142857143°
    symbol: "S",
    defaultOrb: 1,
    classification: "minor",
    nature: "neutral",
    // Spiritual/karmic
    name: "Septile",
    harmonic: 7
  },
  ["novile" /* Novile */]: {
    type: "novile" /* Novile */,
    angle: 40,
    // 360/9 = 40° exactly
    symbol: "N",
    defaultOrb: 1,
    classification: "minor",
    nature: "harmonious",
    // Spiritual completion
    name: "Novile",
    harmonic: 9
  },
  ["decile" /* Decile */]: {
    type: "decile" /* Decile */,
    angle: 36,
    // 360/10 = 36° exactly
    symbol: "D",
    defaultOrb: 1,
    classification: "minor",
    nature: "harmonious",
    // Growth, skill
    name: "Decile",
    harmonic: 10
  }
};
var ASPECT_SIGN_SEPARATIONS = {
  ["conjunction" /* Conjunction */]: [0],
  ["sextile" /* Sextile */]: [2, 10],
  ["square" /* Square */]: [3, 9],
  ["trine" /* Trine */]: [4, 8],
  ["opposition" /* Opposition */]: [6],
  ["semi-sextile" /* SemiSextile */]: [1, 11],
  ["semi-square" /* SemiSquare */]: [1, 2, 10, 11],
  // Can occur across 1 or 2 signs
  ["quintile" /* Quintile */]: [2, 3, 9, 10],
  // ~2.4 signs
  ["sesquiquadrate" /* Sesquiquadrate */]: [4, 5, 7, 8],
  // 4.5 signs
  ["biquintile" /* Biquintile */]: [4, 5, 7, 8],
  // ~4.8 signs
  ["quincunx" /* Quincunx */]: [5, 7],
  // Kepler aspects - sign separations based on angle/30°
  ["septile" /* Septile */]: [1, 2, 10, 11],
  // 51.43°/30 ≈ 1.7 signs
  ["novile" /* Novile */]: [1, 2, 10, 11],
  // 40°/30 ≈ 1.3 signs
  ["decile" /* Decile */]: [1, 2, 10, 11]
  // 36°/30 = 1.2 signs
};
var ANGLE_EPSILON = 1e-4;
var MAX_SEPARATION = 180;

// src/aspects/angular-separation.ts
function normalizeAngle(angle) {
  const normalized = (angle % 360 + 360) % 360;
  if (Math.abs(normalized - 360) < ANGLE_EPSILON) {
    return 0;
  }
  return normalized;
}
function angularSeparation(lon1, lon2) {
  const norm1 = normalizeAngle(lon1);
  const norm2 = normalizeAngle(lon2);
  let diff = Math.abs(norm1 - norm2);
  if (diff > MAX_SEPARATION) {
    diff = 360 - diff;
  }
  if (diff < ANGLE_EPSILON) {
    return 0;
  }
  return diff;
}
function signedAngle(lon1, lon2) {
  const norm1 = normalizeAngle(lon1);
  const norm2 = normalizeAngle(lon2);
  let diff = norm2 - norm1;
  if (diff > 180) {
    diff -= 360;
  } else if (diff <= -180) {
    diff += 360;
  }
  if (Math.abs(diff) < ANGLE_EPSILON) {
    return 0;
  }
  return diff;
}
function anglesAreEqual(angle1, angle2, epsilon = ANGLE_EPSILON) {
  return angularSeparation(angle1, angle2) < epsilon;
}
function midpoint(lon1, lon2) {
  const norm1 = normalizeAngle(lon1);
  const norm2 = normalizeAngle(lon2);
  const signed = signedAngle(norm1, norm2);
  return normalizeAngle(norm1 + signed / 2);
}
function getSignIndex(longitude) {
  const normalized = normalizeAngle(longitude);
  return Math.floor(normalized / 30);
}
function signSeparation(lon1, lon2) {
  const sign1 = getSignIndex(lon1);
  const sign2 = getSignIndex(lon2);
  return ((sign2 - sign1) % 12 + 12) % 12;
}

// src/aspects/orbs.ts
function getOrb(aspectType, config) {
  if (config?.orbs?.[aspectType] !== void 0) {
    return config.orbs[aspectType];
  }
  return DEFAULT_ORBS[aspectType];
}
function calculateStrength(deviation, orb) {
  if (orb <= 0) {
    return deviation === 0 ? 100 : 0;
  }
  if (deviation < 0) {
    deviation = Math.abs(deviation);
  }
  if (deviation >= orb) {
    return 0;
  }
  return Math.round(100 * (1 - deviation / orb));
}
function isWithinOrb(separation, aspectAngle, orb) {
  const deviation = Math.abs(separation - aspectAngle);
  return deviation <= orb;
}
function findMatchingAspect(separation, config) {
  const aspectTypes = config?.aspectTypes ?? [
    "conjunction" /* Conjunction */,
    "sextile" /* Sextile */,
    "square" /* Square */,
    "trine" /* Trine */,
    "opposition" /* Opposition */
  ];
  let bestMatch = null;
  for (const type of aspectTypes) {
    const definition = ASPECT_DEFINITIONS[type];
    const orb = getOrb(type, config);
    const deviation = Math.abs(separation - definition.angle);
    if (deviation <= orb) {
      if (bestMatch === null || deviation < bestMatch.deviation) {
        bestMatch = { aspect: definition, deviation };
      }
    }
  }
  return bestMatch;
}
function findAllMatchingAspects(separation, config) {
  const aspectTypes = config?.aspectTypes ?? [
    "conjunction" /* Conjunction */,
    "sextile" /* Sextile */,
    "square" /* Square */,
    "trine" /* Trine */,
    "opposition" /* Opposition */
  ];
  const matches = [];
  for (const type of aspectTypes) {
    const definition = ASPECT_DEFINITIONS[type];
    const orb = getOrb(type, config);
    const deviation = Math.abs(separation - definition.angle);
    if (deviation <= orb) {
      matches.push({ aspect: definition, deviation });
    }
  }
  return matches.sort((a, b) => a.deviation - b.deviation);
}
function applyOutOfSignPenalty(strength, isOutOfSign3, penalty) {
  if (!isOutOfSign3 || penalty <= 0) {
    return strength;
  }
  const clampedPenalty = Math.min(1, Math.max(0, penalty));
  return Math.round(strength * (1 - clampedPenalty));
}
function createAspectConfig(partial) {
  return {
    aspectTypes: partial?.aspectTypes ?? [
      "conjunction" /* Conjunction */,
      "sextile" /* Sextile */,
      "square" /* Square */,
      "trine" /* Trine */,
      "opposition" /* Opposition */
    ],
    orbs: partial?.orbs ?? {},
    includeOutOfSign: partial?.includeOutOfSign ?? true,
    outOfSignPenalty: partial?.outOfSignPenalty ?? 0,
    minimumStrength: partial?.minimumStrength ?? 0,
    includeApplying: partial?.includeApplying ?? true
  };
}

// src/aspects/aspect-detection.ts
function isOutOfSign(lon1, lon2, aspectType) {
  const signSep = signSeparation(lon1, lon2);
  const expectedSeps = ASPECT_SIGN_SEPARATIONS[aspectType];
  return !expectedSeps.includes(signSep);
}
function detectAspect(body1, body2, config) {
  const separation = angularSeparation(body1.longitude, body2.longitude);
  const match = findMatchingAspect(separation, config);
  if (!match) {
    return null;
  }
  const { aspect: definition, deviation } = match;
  const orb = getOrb(definition.type, config);
  let strength = calculateStrength(deviation, orb);
  const outOfSign = isOutOfSign(body1.longitude, body2.longitude, definition.type);
  if (outOfSign && config?.outOfSignPenalty) {
    strength = Math.round(strength * (1 - config.outOfSignPenalty));
  }
  if (config?.minimumStrength && strength < config.minimumStrength) {
    return null;
  }
  let isApplying = null;
  if (config?.includeApplying !== false && body1.longitudeSpeed !== void 0 && body2.longitudeSpeed !== void 0) {
    isApplying = calculateIsApplying(
      body1.longitude,
      body2.longitude,
      body1.longitudeSpeed,
      body2.longitudeSpeed,
      definition.angle
    );
  }
  if (outOfSign && config?.includeOutOfSign === false) {
    return null;
  }
  return {
    body1: body1.name,
    body2: body2.name,
    type: definition.type,
    angle: definition.angle,
    separation,
    deviation,
    orb,
    strength,
    isApplying,
    isOutOfSign: outOfSign,
    symbol: definition.symbol
  };
}
function calculateIsApplying(lon1, lon2, speed1, speed2, aspectAngle) {
  const currentSep = angularSeparation(lon1, lon2);
  const currentDev = Math.abs(currentSep - aspectAngle);
  const futureLon1 = lon1 + speed1;
  const futureLon2 = lon2 + speed2;
  const futureSep = angularSeparation(futureLon1, futureLon2);
  const futureDev = Math.abs(futureSep - aspectAngle);
  return futureDev < currentDev;
}
function findAllAspects(bodies, config) {
  const aspects = [];
  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      const aspect = detectAspect(bodies[i], bodies[j], config);
      if (aspect) {
        aspects.push(aspect);
      }
    }
  }
  return aspects.sort((a, b) => b.strength - a.strength);
}
function calculateAspects(bodies, config) {
  const effectiveConfig = {
    aspectTypes: config?.aspectTypes ?? [
      "conjunction" /* Conjunction */,
      "sextile" /* Sextile */,
      "square" /* Square */,
      "trine" /* Trine */,
      "opposition" /* Opposition */
    ],
    orbs: config?.orbs ?? {},
    includeOutOfSign: config?.includeOutOfSign ?? true,
    outOfSignPenalty: config?.outOfSignPenalty ?? 0,
    minimumStrength: config?.minimumStrength ?? 0,
    includeApplying: config?.includeApplying ?? true
  };
  const aspects = findAllAspects(bodies, effectiveConfig);
  const bodyNames = bodies.map((b) => b.name);
  const n = bodies.length;
  const pairsChecked = n * (n - 1) / 2;
  return {
    aspects,
    config: effectiveConfig,
    bodies: bodyNames,
    pairsChecked
  };
}
function getAspectSummary(aspects) {
  const summary = {};
  for (const aspect of aspects) {
    summary[aspect.type] = (summary[aspect.type] ?? 0) + 1;
  }
  for (const type of Object.values(AspectType)) {
    if (!(type in summary)) {
      summary[type] = 0;
    }
  }
  return summary;
}
function filterAspectsByType(aspects, types) {
  const typeArray = Array.isArray(types) ? types : [types];
  return aspects.filter((a) => typeArray.includes(a.type));
}
function filterAspectsByBody(aspects, bodyName) {
  return aspects.filter((a) => a.body1 === bodyName || a.body2 === bodyName);
}
function getStrongestAspect(aspects, bodyName) {
  const bodyAspects = filterAspectsByBody(aspects, bodyName);
  return bodyAspects.length > 0 ? bodyAspects[0] : null;
}
function formatAspect(aspect) {
  const deg = Math.floor(aspect.deviation);
  const min = Math.round((aspect.deviation - deg) * 60);
  const orbStr = `${deg}\xB0${min.toString().padStart(2, "0")}'`;
  const applyingStr = aspect.isApplying === null ? "" : aspect.isApplying ? ", applying" : ", separating";
  const oosStr = aspect.isOutOfSign ? ", out-of-sign" : "";
  return `${aspect.body1} ${aspect.symbol} ${aspect.body2} (${orbStr}, ${aspect.strength}%${applyingStr}${oosStr})`;
}

// src/aspects/patterns.ts
function findPatterns(aspects) {
  const patterns = [];
  patterns.push(...detectGrandCross(aspects));
  patterns.push(...detectKite(aspects));
  patterns.push(...detectMysticRectangle(aspects));
  patterns.push(...detectGrandTrine(aspects));
  patterns.push(...detectTSquare(aspects));
  patterns.push(...detectYod(aspects));
  patterns.push(...detectStellium(aspects));
  return patterns;
}
function detectTSquare(aspects) {
  const patterns = [];
  const oppositions = aspects.filter((a) => a.type === "opposition" /* Opposition */);
  const squares = aspects.filter((a) => a.type === "square" /* Square */);
  for (const opp of oppositions) {
    const squaresFromBody1 = squares.filter(
      (sq) => sq.body1 === opp.body1 || sq.body2 === opp.body1
    );
    const squaresFromBody2 = squares.filter(
      (sq) => sq.body1 === opp.body2 || sq.body2 === opp.body2
    );
    for (const sq1 of squaresFromBody1) {
      const apex1 = sq1.body1 === opp.body1 ? sq1.body2 : sq1.body1;
      for (const sq2 of squaresFromBody2) {
        const apex2 = sq2.body1 === opp.body2 ? sq2.body2 : sq2.body1;
        if (apex1 === apex2) {
          if (apex1 !== opp.body1 && apex1 !== opp.body2) {
            const bodies = [opp.body1, opp.body2, apex1].sort();
            const isDuplicate = patterns.some(
              (p) => p.type === "T-Square" /* TSquare */ && arraysEqual(p.bodies.sort(), bodies)
            );
            if (!isDuplicate) {
              patterns.push({
                type: "T-Square" /* TSquare */,
                bodies: [opp.body1, opp.body2, apex1],
                aspects: [opp, sq1, sq2],
                description: `T-Square with ${apex1} as apex, ${opp.body1}-${opp.body2} opposition`
              });
            }
          }
        }
      }
    }
  }
  return patterns;
}
function detectGrandTrine(aspects) {
  const patterns = [];
  const trines = aspects.filter((a) => a.type === "trine" /* Trine */);
  if (trines.length < 3) return patterns;
  const bodies = /* @__PURE__ */ new Set();
  for (const t of trines) {
    bodies.add(t.body1);
    bodies.add(t.body2);
  }
  const bodyArray = Array.from(bodies);
  for (let i = 0; i < bodyArray.length - 2; i++) {
    for (let j = i + 1; j < bodyArray.length - 1; j++) {
      for (let k = j + 1; k < bodyArray.length; k++) {
        const a = bodyArray[i];
        const b = bodyArray[j];
        const c = bodyArray[k];
        const ab = findAspectBetween(trines, a, b);
        const bc = findAspectBetween(trines, b, c);
        const ac = findAspectBetween(trines, a, c);
        if (ab && bc && ac) {
          patterns.push({
            type: "Grand Trine" /* GrandTrine */,
            bodies: [a, b, c],
            aspects: [ab, bc, ac],
            description: `Grand Trine: ${a}, ${b}, ${c}`
          });
        }
      }
    }
  }
  return patterns;
}
function detectGrandCross(aspects) {
  const patterns = [];
  const squares = aspects.filter((a) => a.type === "square" /* Square */);
  const oppositions = aspects.filter((a) => a.type === "opposition" /* Opposition */);
  if (squares.length < 4 || oppositions.length < 2) return patterns;
  for (let i = 0; i < oppositions.length; i++) {
    for (let j = i + 1; j < oppositions.length; j++) {
      const opp1 = oppositions[i];
      const opp2 = oppositions[j];
      const bodies1 = /* @__PURE__ */ new Set([opp1.body1, opp1.body2]);
      const bodies2 = /* @__PURE__ */ new Set([opp2.body1, opp2.body2]);
      const shared = [...bodies1].filter((b) => bodies2.has(b));
      if (shared.length > 0) continue;
      const allBodies = [opp1.body1, opp1.body2, opp2.body1, opp2.body2];
      const sq1 = findAspectBetween(squares, opp1.body1, opp2.body1);
      const sq2 = findAspectBetween(squares, opp1.body1, opp2.body2);
      const sq3 = findAspectBetween(squares, opp1.body2, opp2.body1);
      const sq4 = findAspectBetween(squares, opp1.body2, opp2.body2);
      const foundSquares = [sq1, sq2, sq3, sq4].filter(Boolean);
      if (foundSquares.length === 4) {
        patterns.push({
          type: "Grand Cross" /* GrandCross */,
          bodies: allBodies,
          aspects: [opp1, opp2, ...foundSquares],
          description: `Grand Cross: ${allBodies.join(", ")}`
        });
      }
    }
  }
  return patterns;
}
function detectYod(aspects) {
  const patterns = [];
  const sextiles = aspects.filter((a) => a.type === "sextile" /* Sextile */);
  const quincunxes = aspects.filter((a) => a.type === "quincunx" /* Quincunx */);
  if (sextiles.length < 1 || quincunxes.length < 2) return patterns;
  for (const sextile of sextiles) {
    const quincunxesFromBody1 = quincunxes.filter(
      (q) => q.body1 === sextile.body1 || q.body2 === sextile.body1
    );
    const quincunxesFromBody2 = quincunxes.filter(
      (q) => q.body1 === sextile.body2 || q.body2 === sextile.body2
    );
    for (const q1 of quincunxesFromBody1) {
      const apex1 = q1.body1 === sextile.body1 ? q1.body2 : q1.body1;
      for (const q2 of quincunxesFromBody2) {
        const apex2 = q2.body1 === sextile.body2 ? q2.body2 : q2.body1;
        if (apex1 === apex2 && apex1 !== sextile.body1 && apex1 !== sextile.body2) {
          const bodies = [sextile.body1, sextile.body2, apex1].sort();
          const isDuplicate = patterns.some(
            (p) => p.type === "Yod" /* Yod */ && arraysEqual(p.bodies.sort(), bodies)
          );
          if (!isDuplicate) {
            patterns.push({
              type: "Yod" /* Yod */,
              bodies: [sextile.body1, sextile.body2, apex1],
              aspects: [sextile, q1, q2],
              description: `Yod with ${apex1} as apex (Finger of God)`
            });
          }
        }
      }
    }
  }
  return patterns;
}
function detectKite(aspects) {
  const patterns = [];
  const grandTrines = detectGrandTrine(aspects);
  const oppositions = aspects.filter((a) => a.type === "opposition" /* Opposition */);
  const sextiles = aspects.filter((a) => a.type === "sextile" /* Sextile */);
  for (const gt of grandTrines) {
    for (const vertex of gt.bodies) {
      const opp = oppositions.find(
        (o) => (o.body1 === vertex || o.body2 === vertex) && !gt.bodies.includes(o.body1 === vertex ? o.body2 : o.body1)
      );
      if (!opp) continue;
      const fourthBody = opp.body1 === vertex ? opp.body2 : opp.body1;
      const otherVertices = gt.bodies.filter((b) => b !== vertex);
      const sextile1 = findAspectBetween(sextiles, fourthBody, otherVertices[0]);
      const sextile2 = findAspectBetween(sextiles, fourthBody, otherVertices[1]);
      if (sextile1 && sextile2) {
        patterns.push({
          type: "Kite" /* Kite */,
          bodies: [...gt.bodies, fourthBody],
          aspects: [...gt.aspects, opp, sextile1, sextile2],
          description: `Kite with ${fourthBody} as tail, ${vertex} opposite`
        });
      }
    }
  }
  return patterns;
}
function detectMysticRectangle(aspects) {
  const patterns = [];
  const oppositions = aspects.filter((a) => a.type === "opposition" /* Opposition */);
  const trines = aspects.filter((a) => a.type === "trine" /* Trine */);
  const sextiles = aspects.filter((a) => a.type === "sextile" /* Sextile */);
  if (oppositions.length < 2 || trines.length < 2 || sextiles.length < 2) {
    return patterns;
  }
  for (let i = 0; i < oppositions.length; i++) {
    for (let j = i + 1; j < oppositions.length; j++) {
      const opp1 = oppositions[i];
      const opp2 = oppositions[j];
      const bodies1 = /* @__PURE__ */ new Set([opp1.body1, opp1.body2]);
      const bodies2 = /* @__PURE__ */ new Set([opp2.body1, opp2.body2]);
      const shared = [...bodies1].filter((b) => bodies2.has(b));
      if (shared.length > 0) continue;
      const allBodies = [opp1.body1, opp1.body2, opp2.body1, opp2.body2];
      const trine1a = findAspectBetween(trines, opp1.body1, opp2.body1);
      const trine1b = findAspectBetween(trines, opp1.body2, opp2.body2);
      const trine2a = findAspectBetween(trines, opp1.body1, opp2.body2);
      const trine2b = findAspectBetween(trines, opp1.body2, opp2.body1);
      if (trine1a && trine1b) {
        const sex1 = findAspectBetween(sextiles, opp1.body1, opp2.body2);
        const sex2 = findAspectBetween(sextiles, opp1.body2, opp2.body1);
        if (sex1 && sex2) {
          patterns.push({
            type: "Mystic Rectangle" /* MysticRectangle */,
            bodies: allBodies,
            aspects: [opp1, opp2, trine1a, trine1b, sex1, sex2],
            description: `Mystic Rectangle: ${allBodies.join(", ")}`
          });
        }
      }
      if (trine2a && trine2b) {
        const sex1 = findAspectBetween(sextiles, opp1.body1, opp2.body1);
        const sex2 = findAspectBetween(sextiles, opp1.body2, opp2.body2);
        if (sex1 && sex2) {
          const isDuplicate = patterns.some(
            (p) => p.type === "Mystic Rectangle" /* MysticRectangle */ && arraysEqual(p.bodies.sort(), allBodies.sort())
          );
          if (!isDuplicate) {
            patterns.push({
              type: "Mystic Rectangle" /* MysticRectangle */,
              bodies: allBodies,
              aspects: [opp1, opp2, trine2a, trine2b, sex1, sex2],
              description: `Mystic Rectangle: ${allBodies.join(", ")}`
            });
          }
        }
      }
    }
  }
  return patterns;
}
function detectStellium(aspects) {
  const patterns = [];
  const conjunctions = aspects.filter((a) => a.type === "conjunction" /* Conjunction */);
  if (conjunctions.length < 2) return patterns;
  const graph = /* @__PURE__ */ new Map();
  for (const conj of conjunctions) {
    if (!graph.has(conj.body1)) graph.set(conj.body1, /* @__PURE__ */ new Set());
    if (!graph.has(conj.body2)) graph.set(conj.body2, /* @__PURE__ */ new Set());
    graph.get(conj.body1).add(conj.body2);
    graph.get(conj.body2).add(conj.body1);
  }
  const visited = /* @__PURE__ */ new Set();
  const components = [];
  for (const body of graph.keys()) {
    if (visited.has(body)) continue;
    const component = [];
    const queue = [body];
    while (queue.length > 0) {
      const current = queue.shift();
      if (visited.has(current)) continue;
      visited.add(current);
      component.push(current);
      const neighbors = graph.get(current) || /* @__PURE__ */ new Set();
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          queue.push(neighbor);
        }
      }
    }
    if (component.length >= 3) {
      components.push(component);
    }
  }
  for (const component of components) {
    const relevantAspects = conjunctions.filter(
      (c) => component.includes(c.body1) && component.includes(c.body2)
    );
    patterns.push({
      type: "Stellium" /* Stellium */,
      bodies: component,
      aspects: relevantAspects,
      description: `Stellium: ${component.length} planets conjunct (${component.join(", ")})`
    });
  }
  return patterns;
}
function findAspectBetween(aspects, body1, body2) {
  return aspects.find(
    (a) => a.body1 === body1 && a.body2 === body2 || a.body1 === body2 && a.body2 === body1
  );
}
function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((val, idx) => val === sortedB[idx]);
}
function getPatternSummary(patterns) {
  const summary = {};
  for (const pattern of patterns) {
    summary[pattern.type] = (summary[pattern.type] ?? 0) + 1;
  }
  for (const type of Object.values(PatternType)) {
    if (!(type in summary)) {
      summary[type] = 0;
    }
  }
  return summary;
}
function formatPattern(pattern) {
  return `${pattern.type}: ${pattern.bodies.join(" - ")}`;
}

// src/chart/index.ts
var chart_exports = {};
__export(chart_exports, {
  ALL_ASPECTS: () => ALL_ASPECTS2,
  BODY_NAMES: () => BODY_NAMES,
  CalculationError: () => CalculationError,
  DEFAULT_HOUSE_SYSTEM: () => DEFAULT_HOUSE_SYSTEM,
  DEFAULT_OPTIONS: () => DEFAULT_OPTIONS,
  HOUSE_SYSTEM_NAMES: () => HOUSE_SYSTEM_NAMES2,
  MAJOR_ASPECTS: () => MAJOR_ASPECTS2,
  MAX_YEAR: () => MAX_YEAR,
  MIN_YEAR: () => MIN_YEAR,
  PLANET_ORDER: () => PLANET_ORDER,
  RECOMMENDED_MAX_YEAR: () => RECOMMENDED_MAX_YEAR,
  RECOMMENDED_MIN_YEAR: () => RECOMMENDED_MIN_YEAR,
  ValidationError: () => ValidationError,
  buildAspectBodies: () => buildAspectBodies,
  buildChartLilith: () => buildChartLilith,
  buildChartLot: () => buildChartLot,
  buildChartNode: () => buildChartNode,
  buildChartPlanet: () => buildChartPlanet,
  calculateChart: () => calculateChart,
  calculateChartAspects: () => calculateChartAspects,
  calculateChartHouses: () => calculateChartHouses,
  calculateElementDistribution: () => calculateElementDistribution,
  calculateHemisphereDistribution: () => calculateHemisphereDistribution,
  calculateHouseCusps: () => calculateHouseCusps,
  calculateIsDaytime: () => calculateIsDaytime,
  calculateLots: () => calculateLots,
  calculateModalityDistribution: () => calculateModalityDistribution,
  calculatePlanetPositions: () => calculatePlanetPositions,
  calculatePlanets: () => calculatePlanets,
  calculatePolarityBalance: () => calculatePolarityBalance,
  calculateQuadrantDistribution: () => calculateQuadrantDistribution,
  calculateTimeData: () => calculateTimeData,
  categorizeByDignity: () => categorizeByDignity,
  checkDayRollover: () => checkDayRollover,
  detectChartPatterns: () => detectChartPatterns,
  formatChart: () => formatChart,
  generateChartSummary: () => generateChartSummary,
  getAngleConjunction: () => getAngleConjunction,
  getApplyingAspects: () => getApplyingAspects,
  getAspectBetween: () => getAspectBetween,
  getAspectsForPlanet: () => getAspectsForPlanet,
  getAvailableHouseSystems: () => getAvailableHouseSystems2,
  getBodyName: () => getBodyName,
  getChartEmphasis: () => getChartEmphasis,
  getCuspLongitudes: () => getCuspLongitudes,
  getDominantElement: () => getDominantElement,
  getDominantModality: () => getDominantModality,
  getElement: () => getElement,
  getHemisphere: () => getHemisphere,
  getHouseNumber: () => getHouseNumber,
  getModality: () => getModality,
  getPlanetOrder: () => getPlanetOrder,
  getPolarity: () => getPolarity,
  getQuadrant: () => getQuadrant,
  getRetrogradePlanets: () => getRetrogradePlanets,
  getSeparatingAspects: () => getSeparatingAspects,
  getSignForLongitude: () => getSignForLongitude,
  getStrongestAspect: () => getStrongestAspect2,
  isRetrograde: () => isRetrograde2,
  isStationary: () => isStationary,
  localToUTC: () => localToUTC,
  validateBirth: () => validateBirth,
  validateBirthData: () => validateBirthData,
  validateChartOptions: () => validateChartOptions
});

// src/chart/aspect-calculation.ts
function buildAspectBodies(planets) {
  return planets.map((planet) => ({
    name: planet.name,
    longitude: planet.longitude,
    longitudeSpeed: planet.longitudeSpeed
  }));
}
function addExtraBodies(bodies, nodes, lilith) {
  const result = [...bodies];
  if (nodes) {
    for (const node of nodes) {
      if (node.name.includes("North")) {
        result.push({
          name: `${node.type} ${node.name}`,
          longitude: node.longitude,
          longitudeSpeed: 0
          // Nodes move slowly, simplified
        });
      }
    }
  }
  if (lilith) {
    for (const l of lilith) {
      result.push({
        name: l.name,
        longitude: l.longitude,
        longitudeSpeed: 0
        // Simplified
      });
    }
  }
  return result;
}
function calculateChartAspects(planets, options, nodes, lilith) {
  let bodies = buildAspectBodies(planets);
  bodies = addExtraBodies(bodies, nodes, lilith);
  const result = calculateAspects(bodies, {
    orbs: options.aspectOrbs,
    minimumStrength: options.minimumAspectStrength
  });
  let aspects = result.aspects;
  if (options.aspectTypes && options.aspectTypes.length > 0) {
    aspects = filterAspectsByType(aspects, options.aspectTypes);
  }
  const byBody = {};
  for (const body of bodies) {
    const bodyAspects = filterAspectsByBody(aspects, body.name);
    if (bodyAspects.length > 0) {
      byBody[body.name] = bodyAspects;
    }
  }
  const byType = {};
  for (const aspect of aspects) {
    if (!byType[aspect.type]) {
      byType[aspect.type] = [];
    }
    byType[aspect.type].push(aspect);
  }
  const majorTypes = ["conjunction", "sextile", "square", "trine", "opposition"];
  const summary = {
    conjunctions: byType.conjunction?.length ?? 0,
    sextiles: byType.sextile?.length ?? 0,
    squares: byType.square?.length ?? 0,
    trines: byType.trine?.length ?? 0,
    oppositions: byType.opposition?.length ?? 0,
    minor: 0
  };
  for (const [type, list] of Object.entries(byType)) {
    if (!majorTypes.includes(type)) {
      summary.minor += list.length;
    }
  }
  return {
    all: aspects,
    byBody,
    byType,
    count: aspects.length,
    summary
  };
}
function detectChartPatterns(aspects) {
  return findPatterns(aspects);
}
function getAspectsForPlanet(chartAspects, planetName) {
  return chartAspects.byBody[planetName] ?? [];
}
function getStrongestAspect2(chartAspects) {
  if (chartAspects.all.length === 0) {
    return null;
  }
  return chartAspects.all.reduce(
    (strongest, current) => current.strength > strongest.strength ? current : strongest
  );
}
function getApplyingAspects(chartAspects) {
  return chartAspects.all.filter((a) => a.isApplying === true);
}
function getSeparatingAspects(chartAspects) {
  return chartAspects.all.filter((a) => a.isApplying === false);
}
function getAspectBetween(chartAspects, body1, body2) {
  return chartAspects.all.find(
    (a) => a.body1 === body1 && a.body2 === body2 || a.body1 === body2 && a.body2 === body1
  ) ?? null;
}

// src/ephemeris/constants.ts
var J2000_EPOCH = 2451545;
var DAYS_PER_JULIAN_CENTURY = 36525;
var DAYS_PER_JULIAN_MILLENNIUM = 365250;
var DEGREES_PER_CIRCLE = 360;
var ARCMINUTES_PER_DEGREE = 60;
var ARCSECONDS_PER_DEGREE = 3600;
var ARCSECONDS_PER_ARCMINUTE = 60;
var DEG_TO_RAD = Math.PI / 180;
var RAD_TO_DEG = 180 / Math.PI;
var ARCSEC_TO_RAD = Math.PI / (180 * 3600);
var AU_IN_KM = 1495978707e-1;
var SPEED_OF_LIGHT_KM_S = 299792.458;
var LIGHT_TIME_PER_AU_DAYS = AU_IN_KM / (SPEED_OF_LIGHT_KM_S * 86400);
var OBLIQUITY_J2000_DEG = 23.439291111;
var OBLIQUITY_COEFFICIENTS = {
  /** Constant term: 23°26'21.448" in degrees */
  c0: 23.439291111,
  /** Linear term: -46.8150"/century in degrees/century */
  c1: -46.815 / 3600,
  /** Quadratic term: -0.00059"/century² in degrees/century² */
  c2: -59e-5 / 3600,
  /** Cubic term: +0.001813"/century³ in degrees/century³ */
  c3: 1813e-6 / 3600
};
var SUN_MEAN_LONGITUDE = {
  /** Constant term in degrees */
  c0: 280.46646,
  /** Linear term in degrees/century */
  c1: 36000.76983,
  /** Quadratic term in degrees/century² */
  c2: 3032e-7
};
var SUN_MEAN_ANOMALY = {
  /** Constant term in degrees */
  c0: 357.52911,
  /** Linear term in degrees/century */
  c1: 35999.05029,
  /** Quadratic term in degrees/century² */
  c2: -1537e-7
};
var EARTH_ECCENTRICITY = {
  /** Constant term (dimensionless) */
  c0: 0.016708634,
  /** Linear term per century */
  c1: -42037e-9,
  /** Quadratic term per century² */
  c2: -1.267e-7
};
var SUN_EQUATION_OF_CENTER = {
  /** Coefficient for sin(M) - base value */
  c1_base: 1.914602,
  /** Time correction for sin(M) coefficient per century */
  c1_t: -4817e-6,
  /** Time² correction for sin(M) coefficient */
  c1_t2: -14e-6,
  /** Coefficient for sin(2M) - base value */
  c2_base: 0.019993,
  /** Time correction for sin(2M) */
  c2_t: -101e-6,
  /** Coefficient for sin(3M) */
  c3: 289e-6
};
var NUTATION_OMEGA = {
  c0: 125.04452,
  c1: -1934.136261,
  c2: 20708e-7,
  c3: 1 / 45e4
};
var CONVERGENCE_TOLERANCE = 1e-10;
var MAX_ITERATIONS = 50;
var MIN_JULIAN_DATE = 2378497;
var MAX_JULIAN_DATE = 2524594;

// src/ephemeris/sun.ts
function sunMeanLongitude(T) {
  const { c0, c1, c2 } = SUN_MEAN_LONGITUDE;
  return c0 + c1 * T + c2 * T * T;
}
function sunMeanAnomaly(T) {
  const { c0, c1, c2 } = SUN_MEAN_ANOMALY;
  return c0 + c1 * T + c2 * T * T;
}
function earthEccentricity(T) {
  const { c0, c1, c2 } = EARTH_ECCENTRICITY;
  return c0 + c1 * T + c2 * T * T;
}
function sunEquationOfCenter(M, T) {
  const { c1_base, c1_t, c1_t2, c2_base, c2_t, c3 } = SUN_EQUATION_OF_CENTER;
  const Mrad = M * DEG_TO_RAD;
  const c1 = c1_base + c1_t * T + c1_t2 * T * T;
  const c2 = c2_base + c2_t * T;
  return c1 * Math.sin(Mrad) + c2 * Math.sin(2 * Mrad) + c3 * Math.sin(3 * Mrad);
}
function sunTrueLongitude(T) {
  const L08 = sunMeanLongitude(T);
  const M = sunMeanAnomaly(T);
  const C = sunEquationOfCenter(M, T);
  return L08 + C;
}
function nutationInLongitude(T) {
  const { c0, c1, c2, c3 } = NUTATION_OMEGA;
  const omega = c0 + c1 * T + c2 * T * T + c3 * T * T * T;
  const omegaRad = omega * DEG_TO_RAD;
  const deltaPsi = -17.2 / ARCSECONDS_PER_DEGREE * Math.sin(omegaRad);
  return deltaPsi;
}
function sunApparentLongitude(T, options = {}) {
  const trueLongitude = sunTrueLongitude(T);
  const aberration = -20.49552 / ARCSECONDS_PER_DEGREE;
  const nutation = options.includeNutation ? nutationInLongitude(T) : 0;
  return trueLongitude + aberration + nutation;
}
function sunDistance(T) {
  const M = sunMeanAnomaly(T);
  const Mrad = M * DEG_TO_RAD;
  return 1.00014 - 0.01671 * Math.cos(Mrad) - 14e-5 * Math.cos(2 * Mrad);
}
function normalizeAngle2(degrees) {
  let result = degrees % 360;
  if (result < 0) result += 360;
  return result;
}
function getSunPosition(jd, options = {}) {
  const T = (jd - J2000_EPOCH) / DAYS_PER_JULIAN_CENTURY;
  const apparentLongitude = sunApparentLongitude(T, options);
  const longitude = normalizeAngle2(apparentLongitude);
  const latitude = 0;
  const distance = sunDistance(T);
  let longitudeSpeed = 0;
  if (options.includeSpeed !== false) {
    const T1 = (jd + 1 - J2000_EPOCH) / DAYS_PER_JULIAN_CENTURY;
    const longitude1 = normalizeAngle2(sunApparentLongitude(T1, options));
    let diff = longitude1 - longitude;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    longitudeSpeed = diff;
  }
  return {
    longitude,
    latitude,
    distance,
    longitudeSpeed,
    isRetrograde: longitudeSpeed < 0
    // Sun never retrogrades
  };
}

// src/ephemeris/asteroids/ceres.ts
var DEG_TO_RAD2 = Math.PI / 180;
var RAD_TO_DEG2 = 180 / Math.PI;
var AU_IN_KM2 = 1495978707e-1;
var CERES_ORBITAL_ELEMENTS = {
  /** Reference epoch (Julian Date TDB) - J2000.0 */
  epoch: 2451545,
  /** Semi-major axis in AU */
  semiMajorAxis: 4138619138911831e-7 / AU_IN_KM2,
  // ~2.766 AU
  /** Eccentricity (dimensionless) */
  eccentricity: 0.0783756264716304,
  /** Inclination in degrees */
  inclination: 10.58336045805628,
  /** Longitude of ascending node in degrees */
  longitudeOfAscendingNode: 80.49435747295276,
  /** Argument of perihelion in degrees */
  argumentOfPerihelion: 73.92286274285223,
  /** Mean anomaly at epoch in degrees */
  meanAnomalyAtEpoch: 6.176654513180486,
  /** Mean daily motion in degrees/day */
  meanDailyMotion: 2479106915273858e-21 * 86400,
  // Convert from deg/s to deg/day
  /** Orbital period in days */
  orbitalPeriod: 360 / (2479106915273858e-21 * 86400),
  /** Orbital period in years */
  orbitalPeriodYears: 4.6
};
function solveKepler(M, e) {
  M = M % (2 * Math.PI);
  if (M < 0) M += 2 * Math.PI;
  let E = M + e * Math.sin(M);
  for (let i = 0; i < 30; i++) {
    const dE = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    E -= dE;
    if (Math.abs(dE) < 1e-12) break;
  }
  return E;
}
function trueAnomalyFromEccentric(E, e) {
  const cosE = Math.cos(E);
  const sinE = Math.sin(E);
  const cosNu = (cosE - e) / (1 - e * cosE);
  const sinNu = Math.sqrt(1 - e * e) * sinE / (1 - e * cosE);
  return Math.atan2(sinNu, cosNu);
}
function getHeliocentricPosition(jd) {
  const elem = CERES_ORBITAL_ELEMENTS;
  const dt = jd - elem.epoch;
  const M = (elem.meanAnomalyAtEpoch + elem.meanDailyMotion * dt) * DEG_TO_RAD2;
  const E = solveKepler(M, elem.eccentricity);
  const nu = trueAnomalyFromEccentric(E, elem.eccentricity);
  const r = elem.semiMajorAxis * (1 - elem.eccentricity * elem.eccentricity) / (1 + elem.eccentricity * Math.cos(nu));
  const xOrbital = r * Math.cos(nu);
  const yOrbital = r * Math.sin(nu);
  const omega = elem.argumentOfPerihelion * DEG_TO_RAD2;
  const Omega = elem.longitudeOfAscendingNode * DEG_TO_RAD2;
  const i = elem.inclination * DEG_TO_RAD2;
  const cosOmega = Math.cos(Omega);
  const sinOmega = Math.sin(Omega);
  const cosomega = Math.cos(omega);
  const sinomega = Math.sin(omega);
  const cosi = Math.cos(i);
  const sini = Math.sin(i);
  const Px = cosomega * cosOmega - sinomega * cosi * sinOmega;
  const Py = cosomega * sinOmega + sinomega * cosi * cosOmega;
  const Pz = sinomega * sini;
  const Qx = -sinomega * cosOmega - cosomega * cosi * sinOmega;
  const Qy = -sinomega * sinOmega + cosomega * cosi * cosOmega;
  const Qz = cosomega * sini;
  const x = Px * xOrbital + Qx * yOrbital;
  const y = Py * xOrbital + Qy * yOrbital;
  const z = Pz * xOrbital + Qz * yOrbital;
  return { x, y, z, r };
}
function ceresHeliocentricLongitude(jd) {
  const pos = getHeliocentricPosition(jd);
  let lon = Math.atan2(pos.y, pos.x) * RAD_TO_DEG2;
  if (lon < 0) lon += 360;
  return lon;
}
function ceresHeliocentricLatitude(jd) {
  const pos = getHeliocentricPosition(jd);
  const r = Math.sqrt(pos.x * pos.x + pos.y * pos.y + pos.z * pos.z);
  return Math.asin(pos.z / r) * RAD_TO_DEG2;
}
function ceresHeliocentricDistance(jd) {
  return getHeliocentricPosition(jd).r;
}
function getCeresPosition(jd, options = {}) {
  const { includeSpeed = true } = options;
  const ceresHelio = getHeliocentricPosition(jd);
  const sun = getSunPosition(jd);
  const sunLonRad = sun.longitude * DEG_TO_RAD2;
  const sunLatRad = sun.latitude * DEG_TO_RAD2;
  const earthX = -sun.distance * Math.cos(sunLatRad) * Math.cos(sunLonRad);
  const earthY = -sun.distance * Math.cos(sunLatRad) * Math.sin(sunLonRad);
  const earthZ = -sun.distance * Math.sin(sunLatRad);
  const geoX = ceresHelio.x - earthX;
  const geoY = ceresHelio.y - earthY;
  const geoZ = ceresHelio.z - earthZ;
  const distance = Math.sqrt(geoX * geoX + geoY * geoY + geoZ * geoZ);
  let longitude = Math.atan2(geoY, geoX) * RAD_TO_DEG2;
  if (longitude < 0) longitude += 360;
  const latitude = Math.asin(geoZ / distance) * RAD_TO_DEG2;
  let longitudeSpeed = 0;
  if (includeSpeed) {
    const dt = 1;
    const pos2 = getCeresPosition(jd + dt, { includeSpeed: false });
    let dLon = pos2.longitude - longitude;
    if (dLon > 180) dLon -= 360;
    if (dLon < -180) dLon += 360;
    longitudeSpeed = dLon / dt;
  }
  return {
    longitude,
    latitude,
    distance,
    longitudeSpeed,
    isRetrograde: longitudeSpeed < 0
  };
}

// src/ephemeris/asteroids/juno.ts
var DEG_TO_RAD3 = Math.PI / 180;
var RAD_TO_DEG3 = 180 / Math.PI;
var AU_IN_KM3 = 1495978707e-1;
var JUNO_ORBITAL_ELEMENTS = {
  /** Reference epoch (Julian Date TDB) - J2000.0 */
  epoch: 2451545,
  /** Semi-major axis in AU */
  semiMajorAxis: 3991323402397366e-7 / AU_IN_KM3,
  // ~2.668 AU
  /** Eccentricity (dimensionless) */
  eccentricity: 0.2584434725349585,
  /** Inclination in degrees */
  inclination: 12.96742544139138,
  /** Longitude of ascending node in degrees */
  longitudeOfAscendingNode: 170.1725855275966,
  /** Argument of perihelion in degrees */
  argumentOfPerihelion: 248.031724336219,
  /** Mean anomaly at epoch in degrees */
  meanAnomalyAtEpoch: 240.2686465739974,
  /** Mean daily motion in degrees/day */
  meanDailyMotion: 2617598732651759e-21 * 86400,
  // Convert from deg/s to deg/day
  /** Orbital period in days */
  orbitalPeriod: 360 / (2617598732651759e-21 * 86400),
  /** Orbital period in years */
  orbitalPeriodYears: 4.36
};
function solveKepler2(M, e) {
  M = M % (2 * Math.PI);
  if (M < 0) M += 2 * Math.PI;
  let E = M + e * Math.sin(M);
  for (let i = 0; i < 30; i++) {
    const dE = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    E -= dE;
    if (Math.abs(dE) < 1e-12) break;
  }
  return E;
}
function trueAnomalyFromEccentric2(E, e) {
  const cosE = Math.cos(E);
  const sinE = Math.sin(E);
  const cosNu = (cosE - e) / (1 - e * cosE);
  const sinNu = Math.sqrt(1 - e * e) * sinE / (1 - e * cosE);
  return Math.atan2(sinNu, cosNu);
}
function getHeliocentricPosition2(jd) {
  const elem = JUNO_ORBITAL_ELEMENTS;
  const dt = jd - elem.epoch;
  const M = (elem.meanAnomalyAtEpoch + elem.meanDailyMotion * dt) * DEG_TO_RAD3;
  const E = solveKepler2(M, elem.eccentricity);
  const nu = trueAnomalyFromEccentric2(E, elem.eccentricity);
  const r = elem.semiMajorAxis * (1 - elem.eccentricity * elem.eccentricity) / (1 + elem.eccentricity * Math.cos(nu));
  const xOrbital = r * Math.cos(nu);
  const yOrbital = r * Math.sin(nu);
  const omega = elem.argumentOfPerihelion * DEG_TO_RAD3;
  const Omega = elem.longitudeOfAscendingNode * DEG_TO_RAD3;
  const i = elem.inclination * DEG_TO_RAD3;
  const cosOmega = Math.cos(Omega);
  const sinOmega = Math.sin(Omega);
  const cosomega = Math.cos(omega);
  const sinomega = Math.sin(omega);
  const cosi = Math.cos(i);
  const sini = Math.sin(i);
  const Px = cosomega * cosOmega - sinomega * cosi * sinOmega;
  const Py = cosomega * sinOmega + sinomega * cosi * cosOmega;
  const Pz = sinomega * sini;
  const Qx = -sinomega * cosOmega - cosomega * cosi * sinOmega;
  const Qy = -sinomega * sinOmega + cosomega * cosi * cosOmega;
  const Qz = cosomega * sini;
  const x = Px * xOrbital + Qx * yOrbital;
  const y = Py * xOrbital + Qy * yOrbital;
  const z = Pz * xOrbital + Qz * yOrbital;
  return { x, y, z, r };
}
function junoHeliocentricLongitude(jd) {
  const pos = getHeliocentricPosition2(jd);
  let lon = Math.atan2(pos.y, pos.x) * RAD_TO_DEG3;
  if (lon < 0) lon += 360;
  return lon;
}
function junoHeliocentricLatitude(jd) {
  const pos = getHeliocentricPosition2(jd);
  const r = Math.sqrt(pos.x * pos.x + pos.y * pos.y + pos.z * pos.z);
  return Math.asin(pos.z / r) * RAD_TO_DEG3;
}
function junoHeliocentricDistance(jd) {
  return getHeliocentricPosition2(jd).r;
}
function getJunoPosition(jd, options = {}) {
  const { includeSpeed = true } = options;
  const junoHelio = getHeliocentricPosition2(jd);
  const sun = getSunPosition(jd);
  const sunLonRad = sun.longitude * DEG_TO_RAD3;
  const sunLatRad = sun.latitude * DEG_TO_RAD3;
  const earthX = -sun.distance * Math.cos(sunLatRad) * Math.cos(sunLonRad);
  const earthY = -sun.distance * Math.cos(sunLatRad) * Math.sin(sunLonRad);
  const earthZ = -sun.distance * Math.sin(sunLatRad);
  const geoX = junoHelio.x - earthX;
  const geoY = junoHelio.y - earthY;
  const geoZ = junoHelio.z - earthZ;
  const distance = Math.sqrt(geoX * geoX + geoY * geoY + geoZ * geoZ);
  let longitude = Math.atan2(geoY, geoX) * RAD_TO_DEG3;
  if (longitude < 0) longitude += 360;
  const latitude = Math.asin(geoZ / distance) * RAD_TO_DEG3;
  let longitudeSpeed = 0;
  if (includeSpeed) {
    const dt = 1;
    const pos2 = getJunoPosition(jd + dt, { includeSpeed: false });
    let dLon = pos2.longitude - longitude;
    if (dLon > 180) dLon -= 360;
    if (dLon < -180) dLon += 360;
    longitudeSpeed = dLon / dt;
  }
  return {
    longitude,
    latitude,
    distance,
    longitudeSpeed,
    isRetrograde: longitudeSpeed < 0
  };
}

// src/ephemeris/asteroids/pallas.ts
var DEG_TO_RAD4 = Math.PI / 180;
var RAD_TO_DEG4 = 180 / Math.PI;
var AU_IN_KM4 = 1495978707e-1;
var PALLAS_ORBITAL_ELEMENTS = {
  /** Reference epoch (Julian Date TDB) - J2000.0 */
  epoch: 2451545,
  /** Semi-major axis in AU */
  semiMajorAxis: 4147335391694663e-7 / AU_IN_KM4,
  // ~2.772 AU
  /** Eccentricity (dimensionless) */
  eccentricity: 0.2296435321725964,
  /** Inclination in degrees */
  inclination: 34.8461400333228,
  /** Longitude of ascending node in degrees */
  longitudeOfAscendingNode: 173.197799126349,
  /** Argument of perihelion in degrees */
  argumentOfPerihelion: 310.2656378931236,
  /** Mean anomaly at epoch in degrees */
  meanAnomalyAtEpoch: 352.9602856376183,
  /** Mean daily motion in degrees/day */
  meanDailyMotion: 2471295695610626e-21 * 86400,
  // Convert from deg/s to deg/day
  /** Orbital period in days */
  orbitalPeriod: 360 / (2471295695610626e-21 * 86400),
  /** Orbital period in years */
  orbitalPeriodYears: 4.61
};
function solveKepler3(M, e) {
  M = M % (2 * Math.PI);
  if (M < 0) M += 2 * Math.PI;
  let E = M + e * Math.sin(M);
  for (let i = 0; i < 30; i++) {
    const dE = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    E -= dE;
    if (Math.abs(dE) < 1e-12) break;
  }
  return E;
}
function trueAnomalyFromEccentric3(E, e) {
  const cosE = Math.cos(E);
  const sinE = Math.sin(E);
  const cosNu = (cosE - e) / (1 - e * cosE);
  const sinNu = Math.sqrt(1 - e * e) * sinE / (1 - e * cosE);
  return Math.atan2(sinNu, cosNu);
}
function getHeliocentricPosition3(jd) {
  const elem = PALLAS_ORBITAL_ELEMENTS;
  const dt = jd - elem.epoch;
  const M = (elem.meanAnomalyAtEpoch + elem.meanDailyMotion * dt) * DEG_TO_RAD4;
  const E = solveKepler3(M, elem.eccentricity);
  const nu = trueAnomalyFromEccentric3(E, elem.eccentricity);
  const r = elem.semiMajorAxis * (1 - elem.eccentricity * elem.eccentricity) / (1 + elem.eccentricity * Math.cos(nu));
  const xOrbital = r * Math.cos(nu);
  const yOrbital = r * Math.sin(nu);
  const omega = elem.argumentOfPerihelion * DEG_TO_RAD4;
  const Omega = elem.longitudeOfAscendingNode * DEG_TO_RAD4;
  const i = elem.inclination * DEG_TO_RAD4;
  const cosOmega = Math.cos(Omega);
  const sinOmega = Math.sin(Omega);
  const cosomega = Math.cos(omega);
  const sinomega = Math.sin(omega);
  const cosi = Math.cos(i);
  const sini = Math.sin(i);
  const Px = cosomega * cosOmega - sinomega * cosi * sinOmega;
  const Py = cosomega * sinOmega + sinomega * cosi * cosOmega;
  const Pz = sinomega * sini;
  const Qx = -sinomega * cosOmega - cosomega * cosi * sinOmega;
  const Qy = -sinomega * sinOmega + cosomega * cosi * cosOmega;
  const Qz = cosomega * sini;
  const x = Px * xOrbital + Qx * yOrbital;
  const y = Py * xOrbital + Qy * yOrbital;
  const z = Pz * xOrbital + Qz * yOrbital;
  return { x, y, z, r };
}
function pallasHeliocentricLongitude(jd) {
  const pos = getHeliocentricPosition3(jd);
  let lon = Math.atan2(pos.y, pos.x) * RAD_TO_DEG4;
  if (lon < 0) lon += 360;
  return lon;
}
function pallasHeliocentricLatitude(jd) {
  const pos = getHeliocentricPosition3(jd);
  const r = Math.sqrt(pos.x * pos.x + pos.y * pos.y + pos.z * pos.z);
  return Math.asin(pos.z / r) * RAD_TO_DEG4;
}
function pallasHeliocentricDistance(jd) {
  return getHeliocentricPosition3(jd).r;
}
function getPallasPosition(jd, options = {}) {
  const { includeSpeed = true } = options;
  const pallasHelio = getHeliocentricPosition3(jd);
  const sun = getSunPosition(jd);
  const sunLonRad = sun.longitude * DEG_TO_RAD4;
  const sunLatRad = sun.latitude * DEG_TO_RAD4;
  const earthX = -sun.distance * Math.cos(sunLatRad) * Math.cos(sunLonRad);
  const earthY = -sun.distance * Math.cos(sunLatRad) * Math.sin(sunLonRad);
  const earthZ = -sun.distance * Math.sin(sunLatRad);
  const geoX = pallasHelio.x - earthX;
  const geoY = pallasHelio.y - earthY;
  const geoZ = pallasHelio.z - earthZ;
  const distance = Math.sqrt(geoX * geoX + geoY * geoY + geoZ * geoZ);
  let longitude = Math.atan2(geoY, geoX) * RAD_TO_DEG4;
  if (longitude < 0) longitude += 360;
  const latitude = Math.asin(geoZ / distance) * RAD_TO_DEG4;
  let longitudeSpeed = 0;
  if (includeSpeed) {
    const dt = 1;
    const pos2 = getPallasPosition(jd + dt, { includeSpeed: false });
    let dLon = pos2.longitude - longitude;
    if (dLon > 180) dLon -= 360;
    if (dLon < -180) dLon += 360;
    longitudeSpeed = dLon / dt;
  }
  return {
    longitude,
    latitude,
    distance,
    longitudeSpeed,
    isRetrograde: longitudeSpeed < 0
  };
}

// src/ephemeris/asteroids/vesta.ts
var DEG_TO_RAD5 = Math.PI / 180;
var RAD_TO_DEG5 = 180 / Math.PI;
var AU_IN_KM5 = 1495978707e-1;
var VESTA_ORBITAL_ELEMENTS = {
  /** Reference epoch (Julian Date TDB) - J2000.0 */
  epoch: 2451545,
  /** Semi-major axis in AU */
  semiMajorAxis: 3532805978206285e-7 / AU_IN_KM5,
  // ~2.362 AU
  /** Eccentricity (dimensionless) */
  eccentricity: 0.09002244561937413,
  /** Inclination in degrees */
  inclination: 7.133935828421654,
  /** Longitude of ascending node in degrees */
  longitudeOfAscendingNode: 103.9514370845001,
  /** Argument of perihelion in degrees */
  argumentOfPerihelion: 149.5866679599199,
  /** Mean anomaly at epoch in degrees */
  meanAnomalyAtEpoch: 341.0238343838706,
  /** Mean daily motion in degrees/day */
  meanDailyMotion: 3143393635793232e-21 * 86400,
  // Convert from deg/s to deg/day
  /** Orbital period in days */
  orbitalPeriod: 360 / (3143393635793232e-21 * 86400),
  /** Orbital period in years */
  orbitalPeriodYears: 3.63
};
function solveKepler4(M, e) {
  M = M % (2 * Math.PI);
  if (M < 0) M += 2 * Math.PI;
  let E = M + e * Math.sin(M);
  for (let i = 0; i < 30; i++) {
    const dE = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    E -= dE;
    if (Math.abs(dE) < 1e-12) break;
  }
  return E;
}
function trueAnomalyFromEccentric4(E, e) {
  const cosE = Math.cos(E);
  const sinE = Math.sin(E);
  const cosNu = (cosE - e) / (1 - e * cosE);
  const sinNu = Math.sqrt(1 - e * e) * sinE / (1 - e * cosE);
  return Math.atan2(sinNu, cosNu);
}
function getHeliocentricPosition4(jd) {
  const elem = VESTA_ORBITAL_ELEMENTS;
  const dt = jd - elem.epoch;
  const M = (elem.meanAnomalyAtEpoch + elem.meanDailyMotion * dt) * DEG_TO_RAD5;
  const E = solveKepler4(M, elem.eccentricity);
  const nu = trueAnomalyFromEccentric4(E, elem.eccentricity);
  const r = elem.semiMajorAxis * (1 - elem.eccentricity * elem.eccentricity) / (1 + elem.eccentricity * Math.cos(nu));
  const xOrbital = r * Math.cos(nu);
  const yOrbital = r * Math.sin(nu);
  const omega = elem.argumentOfPerihelion * DEG_TO_RAD5;
  const Omega = elem.longitudeOfAscendingNode * DEG_TO_RAD5;
  const i = elem.inclination * DEG_TO_RAD5;
  const cosOmega = Math.cos(Omega);
  const sinOmega = Math.sin(Omega);
  const cosomega = Math.cos(omega);
  const sinomega = Math.sin(omega);
  const cosi = Math.cos(i);
  const sini = Math.sin(i);
  const Px = cosomega * cosOmega - sinomega * cosi * sinOmega;
  const Py = cosomega * sinOmega + sinomega * cosi * cosOmega;
  const Pz = sinomega * sini;
  const Qx = -sinomega * cosOmega - cosomega * cosi * sinOmega;
  const Qy = -sinomega * sinOmega + cosomega * cosi * cosOmega;
  const Qz = cosomega * sini;
  const x = Px * xOrbital + Qx * yOrbital;
  const y = Py * xOrbital + Qy * yOrbital;
  const z = Pz * xOrbital + Qz * yOrbital;
  return { x, y, z, r };
}
function vestaHeliocentricLongitude(jd) {
  const pos = getHeliocentricPosition4(jd);
  let lon = Math.atan2(pos.y, pos.x) * RAD_TO_DEG5;
  if (lon < 0) lon += 360;
  return lon;
}
function vestaHeliocentricLatitude(jd) {
  const pos = getHeliocentricPosition4(jd);
  const r = Math.sqrt(pos.x * pos.x + pos.y * pos.y + pos.z * pos.z);
  return Math.asin(pos.z / r) * RAD_TO_DEG5;
}
function vestaHeliocentricDistance(jd) {
  return getHeliocentricPosition4(jd).r;
}
function getVestaPosition(jd, options = {}) {
  const { includeSpeed = true } = options;
  const vestaHelio = getHeliocentricPosition4(jd);
  const sun = getSunPosition(jd);
  const sunLonRad = sun.longitude * DEG_TO_RAD5;
  const sunLatRad = sun.latitude * DEG_TO_RAD5;
  const earthX = -sun.distance * Math.cos(sunLatRad) * Math.cos(sunLonRad);
  const earthY = -sun.distance * Math.cos(sunLatRad) * Math.sin(sunLonRad);
  const earthZ = -sun.distance * Math.sin(sunLatRad);
  const geoX = vestaHelio.x - earthX;
  const geoY = vestaHelio.y - earthY;
  const geoZ = vestaHelio.z - earthZ;
  const distance = Math.sqrt(geoX * geoX + geoY * geoY + geoZ * geoZ);
  let longitude = Math.atan2(geoY, geoX) * RAD_TO_DEG5;
  if (longitude < 0) longitude += 360;
  const latitude = Math.asin(geoZ / distance) * RAD_TO_DEG5;
  let longitudeSpeed = 0;
  if (includeSpeed) {
    const dt = 1;
    const pos2 = getVestaPosition(jd + dt, { includeSpeed: false });
    let dLon = pos2.longitude - longitude;
    if (dLon > 180) dLon -= 360;
    if (dLon < -180) dLon += 360;
    longitudeSpeed = dLon / dt;
  }
  return {
    longitude,
    latitude,
    distance,
    longitudeSpeed,
    isRetrograde: longitudeSpeed < 0
  };
}

// src/ephemeris/chiron.ts
var CHIRON_ORBITAL_ELEMENTS = {
  /** Semi-major axis in AU (from A = 2.035289944812818E+09 km / 149597870.7) */
  semiMajorAxis: 13.607,
  /** Orbital eccentricity */
  eccentricity: 0.3793438805668402,
  /** Orbital inclination in degrees */
  inclination: 6.941566489467262,
  /** Longitude of ascending node at J2000.0 (degrees) */
  longitudeOfAscendingNode: 209.39667025637,
  /** Argument of perihelion at J2000.0 (degrees) */
  argumentOfPerihelion: 339.1420138434362,
  /** Mean anomaly at J2000.0 (degrees) */
  meanAnomalyAtEpoch: 27.99722096634838,
  /** Mean daily motion (degrees/day) - from N = 2.273207179302781E-07 deg/s */
  meanDailyMotion: 2273207179302781e-22 * 86400,
  // ~0.01964 deg/day
  /** Orbital period in days */
  orbitalPeriod: 18400,
  /** Orbital period in years */
  orbitalPeriodYears: 50.4,
  /** Synodic period in days */
  synodicPeriod: 377,
  /** Perihelion distance in AU */
  perihelion: 8.44,
  /** Aphelion distance in AU */
  aphelion: 18.77
};
var NODE_RATE = 0.15;
var PERI_RATE = 0.25;
function solveKepler5(M, e) {
  let E = M;
  for (let i = 0; i < 20; i++) {
    const dE = (M + e * Math.sin(E) - E) / (1 - e * Math.cos(E));
    E += dE;
    if (Math.abs(dE) < 1e-12) break;
  }
  return E;
}
function trueAnomaly(E, e) {
  return 2 * Math.atan2(Math.sqrt(1 + e) * Math.sin(E / 2), Math.sqrt(1 - e) * Math.cos(E / 2));
}
function chironHeliocentric(jd) {
  const T = (jd - J2000_EPOCH) / DAYS_PER_JULIAN_CENTURY;
  const e = CHIRON_ORBITAL_ELEMENTS.eccentricity;
  const a = CHIRON_ORBITAL_ELEMENTS.semiMajorAxis;
  const i = CHIRON_ORBITAL_ELEMENTS.inclination * DEG_TO_RAD;
  const Omega = (CHIRON_ORBITAL_ELEMENTS.longitudeOfAscendingNode + NODE_RATE * T) * DEG_TO_RAD;
  const omega = (CHIRON_ORBITAL_ELEMENTS.argumentOfPerihelion + PERI_RATE * T) * DEG_TO_RAD;
  const daysSinceEpoch = jd - J2000_EPOCH;
  const M = (CHIRON_ORBITAL_ELEMENTS.meanAnomalyAtEpoch + CHIRON_ORBITAL_ELEMENTS.meanDailyMotion * daysSinceEpoch) * DEG_TO_RAD;
  const E = solveKepler5(M, e);
  const nu = trueAnomaly(E, e);
  const r = a * (1 - e * Math.cos(E));
  const u = omega + nu;
  const lon = Math.atan2(Math.cos(i) * Math.sin(u), Math.cos(u)) + Omega;
  const lat = Math.asin(Math.sin(i) * Math.sin(u));
  return {
    lon: (lon * RAD_TO_DEG % 360 + 360) % 360,
    lat: lat * RAD_TO_DEG,
    r
  };
}
function chironHeliocentricLongitude(jd) {
  return chironHeliocentric(jd).lon;
}
function chironHeliocentricLatitude(jd) {
  return chironHeliocentric(jd).lat;
}
function chironHeliocentricDistance(jd) {
  return chironHeliocentric(jd).r;
}
function earthHeliocentricLongitude(tau) {
  const tau2 = tau * tau;
  const earthL0 = [
    [175347046, 0, 0],
    [3341656, 4.6692568, 6283.07585],
    [34894, 4.6261, 12566.1517],
    [3497, 2.7441, 5753.3849],
    [3418, 2.8289, 3.5231],
    [3136, 3.6277, 77713.7715],
    [2676, 4.4181, 7860.4194],
    [2343, 6.1352, 3930.2097],
    [1324, 0.7425, 11506.7698],
    [1273, 2.0371, 529.691],
    [1199, 1.1096, 1577.3435]
  ];
  const earthL1 = [
    [628331966747, 0, 0],
    [206059, 2.678235, 6283.07585],
    [4303, 2.6351, 12566.1517]
  ];
  const earthL2 = [
    [8722, 1.0725, 6283.0758],
    [991, 3.1416, 0]
  ];
  let L0sum = 0;
  for (const [A, B, C] of earthL0) {
    L0sum += A * Math.cos(B + C * tau);
  }
  let L1sum = 0;
  for (const [A, B, C] of earthL1) {
    L1sum += A * Math.cos(B + C * tau);
  }
  let L2sum = 0;
  for (const [A, B, C] of earthL2) {
    L2sum += A * Math.cos(B + C * tau);
  }
  return (L0sum + L1sum * tau + L2sum * tau2) / 1e8;
}
function earthHeliocentricDistance(tau) {
  const earthR0 = [
    [100013989, 0, 0],
    [1670700, 3.0984635, 6283.07585],
    [13956, 3.05525, 12566.1517],
    [3084, 5.1985, 77713.7715],
    [1628, 1.1739, 5753.3849],
    [1576, 2.8469, 7860.4194],
    [925, 5.453, 11506.77],
    [542, 4.564, 3930.21]
  ];
  const earthR1 = [
    [103019, 1.10749, 6283.07585],
    [1721, 1.0644, 12566.1517]
  ];
  let R0sum = 0;
  for (const [A, B, C] of earthR0) {
    R0sum += A * Math.cos(B + C * tau);
  }
  let R1sum = 0;
  for (const [A, B, C] of earthR1) {
    R1sum += A * Math.cos(B + C * tau);
  }
  return (R0sum + R1sum * tau) / 1e8;
}
function getChironPosition(jd, options = {}) {
  const { includeSpeed = true } = options;
  const chiron = chironHeliocentric(jd);
  const tau = (jd - J2000_EPOCH) / 365250;
  const earthL = earthHeliocentricLongitude(tau);
  const earthR = earthHeliocentricDistance(tau);
  const chironLonRad = chiron.lon * DEG_TO_RAD;
  const chironLatRad = chiron.lat * DEG_TO_RAD;
  const chironX = chiron.r * Math.cos(chironLatRad) * Math.cos(chironLonRad);
  const chironY = chiron.r * Math.cos(chironLatRad) * Math.sin(chironLonRad);
  const chironZ = chiron.r * Math.sin(chironLatRad);
  const earthX = earthR * Math.cos(earthL);
  const earthY = earthR * Math.sin(earthL);
  const geoX = chironX - earthX;
  const geoY = chironY - earthY;
  const geoZ = chironZ;
  let geoLon = Math.atan2(geoY, geoX) * RAD_TO_DEG;
  const geoLat = Math.atan2(geoZ, Math.sqrt(geoX * geoX + geoY * geoY)) * RAD_TO_DEG;
  const geoDist = Math.sqrt(geoX * geoX + geoY * geoY + geoZ * geoZ);
  while (geoLon < 0) geoLon += 360;
  while (geoLon >= 360) geoLon -= 360;
  const aberration = -5694e-6;
  geoLon += aberration;
  while (geoLon < 0) geoLon += 360;
  while (geoLon >= 360) geoLon -= 360;
  let longitudeSpeed = 0;
  let isRetrograde5 = false;
  if (includeSpeed) {
    const dt = 0.01;
    const pos1 = getChironPosition(jd - dt, { includeSpeed: false });
    const pos2 = getChironPosition(jd + dt, { includeSpeed: false });
    let lonDiff = pos2.longitude - pos1.longitude;
    if (lonDiff > 180) lonDiff -= 360;
    if (lonDiff < -180) lonDiff += 360;
    longitudeSpeed = lonDiff / (2 * dt);
    isRetrograde5 = longitudeSpeed < 0;
  }
  return {
    longitude: geoLon,
    latitude: geoLat,
    distance: geoDist,
    longitudeSpeed,
    isRetrograde: isRetrograde5
  };
}

// src/ephemeris/lilith.ts
function getMeanLilithLongitude(jd) {
  const T = (jd - J2000_EPOCH) / DAYS_PER_JULIAN_CENTURY;
  const T2 = T * T;
  const T3 = T2 * T;
  const T4 = T3 * T;
  const perigee = 83.3532465 + 4069.0137287 * T - 0.01032 * T2 - T3 / 80053 + T4 / 18999e3;
  let lilith = perigee + 180;
  lilith = lilith % 360;
  if (lilith < 0) lilith += 360;
  return lilith;
}
function getMeanLilith(jd) {
  const longitude = getMeanLilithLongitude(jd);
  const dt = 0.01;
  const lon1 = getMeanLilithLongitude(jd - dt);
  const lon2 = getMeanLilithLongitude(jd + dt);
  let lonDiff = lon2 - lon1;
  if (lonDiff > 180) lonDiff -= 360;
  if (lonDiff < -180) lonDiff += 360;
  const speed = lonDiff / (2 * dt);
  return {
    longitude,
    speed,
    isRetrograde: false
    // Mean Lilith is always prograde
  };
}
function getTrueLilithLongitude(jd) {
  const T = (jd - J2000_EPOCH) / DAYS_PER_JULIAN_CENTURY;
  const T2 = T * T;
  const T3 = T2 * T;
  const T4 = T3 * T;
  const D = (297.8501921 + 445267.1114034 * T - 18819e-7 * T2 + T3 / 545868 - T4 / 113065e3) * DEG_TO_RAD;
  const M = (357.5291092 + 35999.0502909 * T - 1536e-7 * T2 + T3 / 2449e4) * DEG_TO_RAD;
  const Mprime = (134.9633964 + 477198.8675055 * T + 87414e-7 * T2 + T3 / 69699 - T4 / 14712e3) * DEG_TO_RAD;
  const F = (93.272095 + 483202.0175233 * T - 36539e-7 * T2 - T3 / 3526e3 + T4 / 86331e4) * DEG_TO_RAD;
  const perigee = 83.3532465 + 4069.0137287 * T - 0.01032 * T2 - T3 / 80053 + T4 / 18999e3;
  const perturbations = -1.6769 * Math.sin(2 * D - Mprime) + 0.4589 * Math.sin(2 * D) + -0.1856 * Math.sin(Mprime) + -0.112 * Math.sin(2 * F) + 0.0455 * Math.sin(2 * D - 2 * Mprime) + -0.0387 * Math.sin(D) + -0.0291 * Math.sin(2 * Mprime) + 0.0234 * Math.sin(2 * D - M) + -0.0197 * Math.sin(D - Mprime) + 0.0182 * Math.sin(2 * D + Mprime) + -0.0143 * Math.sin(2 * D - M - Mprime) + -0.0121 * Math.sin(M) + 0.0118 * Math.sin(D + Mprime) + -0.0111 * Math.sin(2 * F - 2 * D) + 74e-4 * Math.sin(2 * D + M);
  let lilith = perigee + 180 + perturbations;
  lilith = lilith % 360;
  if (lilith < 0) lilith += 360;
  return lilith;
}
function getTrueLilith(jd) {
  const longitude = getTrueLilithLongitude(jd);
  const dt = 0.01;
  const lon1 = getTrueLilithLongitude(jd - dt);
  const lon2 = getTrueLilithLongitude(jd + dt);
  let lonDiff = lon2 - lon1;
  if (lonDiff > 180) lonDiff -= 360;
  if (lonDiff < -180) lonDiff += 360;
  const speed = lonDiff / (2 * dt);
  return {
    longitude,
    speed,
    isRetrograde: speed < 0
  };
}
function getLilith(jd) {
  return getMeanLilith(jd);
}
var LILITH_CHARACTERISTICS = {
  /** Period in days for full zodiac traversal */
  period: 3232,
  /** Period in years */
  periodYears: 8.85,
  /** Mean daily motion in degrees (prograde) */
  meanDailyMotion: 0.111,
  /** Maximum oscillation of true Lilith from mean (degrees) */
  maxOscillation: 30
};

// src/ephemeris/moon.ts
function moonMeanLongitude(T) {
  return 218.3164477 + 481267.88123421 * T - 15786e-7 * T * T + T * T * T / 538841 - T * T * T * T / 65194e3;
}
function moonMeanElongation(T) {
  return 297.8501921 + 445267.1114034 * T - 18819e-7 * T * T + T * T * T / 545868 - T * T * T * T / 113065e3;
}
function sunMeanAnomalyForMoon(T) {
  return 357.5291092 + 35999.0502909 * T - 1536e-7 * T * T + T * T * T / 2449e4;
}
function moonMeanAnomaly(T) {
  return 134.9633964 + 477198.8675055 * T + 87414e-7 * T * T + T * T * T / 69699 - T * T * T * T / 14712e3;
}
function moonArgumentOfLatitude(T) {
  return 93.272095 + 483202.0175233 * T - 36539e-7 * T * T - T * T * T / 3526e3 + T * T * T * T / 86331e4;
}
var LONGITUDE_TERMS = [
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
var LATITUDE_TERMS = [
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
function moonLongitude(T) {
  const Lp = moonMeanLongitude(T);
  const D = moonMeanElongation(T);
  const M = sunMeanAnomalyForMoon(T);
  const Mp = moonMeanAnomaly(T);
  const F = moonArgumentOfLatitude(T);
  const A1 = 119.75 + 131.849 * T;
  const A2 = 53.09 + 479264.29 * T;
  const E = 1 - 2516e-6 * T - 74e-7 * T * T;
  const E2 = E * E;
  const Drad = D * DEG_TO_RAD;
  const Mrad = M * DEG_TO_RAD;
  const Mprad = Mp * DEG_TO_RAD;
  const Frad = F * DEG_TO_RAD;
  let sumL = 0;
  for (const [d, m, mp, f, sl, _sr] of LONGITUDE_TERMS) {
    const arg = d * Drad + m * Mrad + mp * Mprad + f * Frad;
    let coefficient = sl;
    if (Math.abs(m) === 1) {
      coefficient *= E;
    } else if (Math.abs(m) === 2) {
      coefficient *= E2;
    }
    sumL += coefficient * Math.sin(arg);
  }
  sumL += 3958 * Math.sin(A1 * DEG_TO_RAD);
  sumL += 1962 * Math.sin((Lp - F) * DEG_TO_RAD);
  sumL += 318 * Math.sin(A2 * DEG_TO_RAD);
  const longitude = Lp + sumL / 1e6;
  return longitude;
}
function moonLatitude(T) {
  const Lp = moonMeanLongitude(T);
  const D = moonMeanElongation(T);
  const M = sunMeanAnomalyForMoon(T);
  const Mp = moonMeanAnomaly(T);
  const F = moonArgumentOfLatitude(T);
  const A1 = 119.75 + 131.849 * T;
  const A3 = 313.45 + 481266.484 * T;
  const E = 1 - 2516e-6 * T - 74e-7 * T * T;
  const E2 = E * E;
  const Drad = D * DEG_TO_RAD;
  const Mrad = M * DEG_TO_RAD;
  const Mprad = Mp * DEG_TO_RAD;
  const Frad = F * DEG_TO_RAD;
  let sumB = 0;
  for (const [d, m, mp, f, sb] of LATITUDE_TERMS) {
    const arg = d * Drad + m * Mrad + mp * Mprad + f * Frad;
    let coefficient = sb;
    if (Math.abs(m) === 1) {
      coefficient *= E;
    } else if (Math.abs(m) === 2) {
      coefficient *= E2;
    }
    sumB += coefficient * Math.sin(arg);
  }
  sumB -= 2235 * Math.sin(Lp * DEG_TO_RAD);
  sumB += 382 * Math.sin(A3 * DEG_TO_RAD);
  sumB += 175 * Math.sin((A1 - F) * DEG_TO_RAD);
  sumB += 175 * Math.sin((A1 + F) * DEG_TO_RAD);
  sumB += 127 * Math.sin((Lp - Mp) * DEG_TO_RAD);
  sumB -= 115 * Math.sin((Lp + Mp) * DEG_TO_RAD);
  const latitude = sumB / 1e6;
  return latitude;
}
function moonDistance(T) {
  const D = moonMeanElongation(T);
  const M = sunMeanAnomalyForMoon(T);
  const Mp = moonMeanAnomaly(T);
  const F = moonArgumentOfLatitude(T);
  const E = 1 - 2516e-6 * T - 74e-7 * T * T;
  const E2 = E * E;
  const Drad = D * DEG_TO_RAD;
  const Mrad = M * DEG_TO_RAD;
  const Mprad = Mp * DEG_TO_RAD;
  const Frad = F * DEG_TO_RAD;
  let sumR = 0;
  for (const [d, m, mp, f, _sl, sr] of LONGITUDE_TERMS) {
    if (sr === 0) continue;
    const arg = d * Drad + m * Mrad + mp * Mprad + f * Frad;
    let coefficient = sr;
    if (Math.abs(m) === 1) {
      coefficient *= E;
    } else if (Math.abs(m) === 2) {
      coefficient *= E2;
    }
    sumR += coefficient * Math.cos(arg);
  }
  const meanDistance = 385000.56;
  const distance = meanDistance + sumR / 1e3;
  return distance;
}
function moonDistanceAU(T) {
  const km = moonDistance(T);
  return km / 1495978707e-1;
}
function normalizeAngle3(degrees) {
  let result = degrees % 360;
  if (result < 0) result += 360;
  return result;
}
function getMoonPosition(jd, options = {}) {
  const T = (jd - J2000_EPOCH) / DAYS_PER_JULIAN_CENTURY;
  const longitude = normalizeAngle3(moonLongitude(T));
  const latitude = moonLatitude(T);
  const distance = moonDistanceAU(T);
  let longitudeSpeed = 0;
  if (options.includeSpeed !== false) {
    const T1 = (jd + 1 - J2000_EPOCH) / DAYS_PER_JULIAN_CENTURY;
    const longitude1 = normalizeAngle3(moonLongitude(T1));
    let diff = longitude1 - longitude;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    longitudeSpeed = diff;
  }
  return {
    longitude,
    latitude,
    distance,
    longitudeSpeed,
    isRetrograde: longitudeSpeed < 0
    // Moon essentially never retrogrades
  };
}
function moonMeanAscendingNode(T) {
  return 125.0445479 - 1934.1362891 * T + 20754e-7 * T * T + T * T * T / 467441 - T * T * T * T / 60616e3;
}
function moonMeanPerigee(T) {
  return 83.3532465 + 4069.0137287 * T - 0.01032 * T * T - T * T * T / 80053 + T * T * T * T / 18999e3;
}

// src/ephemeris/nodes.ts
function getMeanNodeLongitude(jd) {
  const T = (jd - J2000_EPOCH) / DAYS_PER_JULIAN_CENTURY;
  const T2 = T * T;
  const T3 = T2 * T;
  const T4 = T3 * T;
  let omega = 125.0445479 - 1934.1362891 * T + 20754e-7 * T2 + T3 / 467441 - T4 / 60616e3;
  omega = omega % 360;
  if (omega < 0) omega += 360;
  return omega;
}
function getMeanNode(jd) {
  const northNode = getMeanNodeLongitude(jd);
  let southNode = northNode + 180;
  if (southNode >= 360) southNode -= 360;
  const dt = 0.01;
  const lon1 = getMeanNodeLongitude(jd - dt);
  const lon2 = getMeanNodeLongitude(jd + dt);
  let lonDiff = lon2 - lon1;
  if (lonDiff > 180) lonDiff -= 360;
  if (lonDiff < -180) lonDiff += 360;
  const speed = lonDiff / (2 * dt);
  return {
    northNode,
    southNode,
    speed,
    isRetrograde: true
    // Lunar nodes are always retrograde
  };
}
function getTrueNodeLongitude(jd) {
  const T = (jd - J2000_EPOCH) / DAYS_PER_JULIAN_CENTURY;
  const T2 = T * T;
  const T3 = T2 * T;
  const T4 = T3 * T;
  const D = (297.8501921 + 445267.1114034 * T - 18819e-7 * T2 + T3 / 545868 - T4 / 113065e3) * DEG_TO_RAD;
  const M = (357.5291092 + 35999.0502909 * T - 1536e-7 * T2 + T3 / 2449e4) * DEG_TO_RAD;
  const Mprime = (134.9633964 + 477198.8675055 * T + 87414e-7 * T2 + T3 / 69699 - T4 / 14712e3) * DEG_TO_RAD;
  const F = (93.272095 + 483202.0175233 * T - 36539e-7 * T2 - T3 / 3526e3 + T4 / 86331e4) * DEG_TO_RAD;
  let omega = 125.0445479 - 1934.1362891 * T + 20754e-7 * T2 + T3 / 467441 - T4 / 60616e3;
  const perturbations = -1.4979 * Math.sin(2 * (D - F)) + -0.15 * Math.sin(M) + -0.1226 * Math.sin(2 * D) + 0.1176 * Math.sin(2 * F) + -0.0801 * Math.sin(2 * (Mprime - F)) + 0.0943 * Math.sin(2 * (D + F)) + 0.0582 * Math.sin(2 * D - Mprime) + -0.0539 * Math.sin(Mprime - 2 * F) + -0.0458 * Math.sin(2 * D - M) + 0.0327 * Math.sin(2 * D + Mprime) + -0.0304 * Math.sin(Mprime + 2 * F) + -0.0173 * Math.sin(2 * (D - Mprime)) + -0.0168 * Math.sin(M + 2 * F) + 0.0119 * Math.sin(Mprime) + 0.0107 * Math.sin(M - 2 * F) + -0.0102 * Math.sin(2 * D + M) + -81e-4 * Math.sin(2 * Mprime);
  omega += perturbations;
  omega = omega % 360;
  if (omega < 0) omega += 360;
  return omega;
}
function getTrueNode(jd) {
  const northNode = getTrueNodeLongitude(jd);
  let southNode = northNode + 180;
  if (southNode >= 360) southNode -= 360;
  const dt = 0.01;
  const lon1 = getTrueNodeLongitude(jd - dt);
  const lon2 = getTrueNodeLongitude(jd + dt);
  let lonDiff = lon2 - lon1;
  if (lonDiff > 180) lonDiff -= 360;
  if (lonDiff < -180) lonDiff += 360;
  const speed = lonDiff / (2 * dt);
  return {
    northNode,
    southNode,
    speed,
    isRetrograde: speed < 0
    // Usually retrograde, but can briefly go direct
  };
}
function getNorthNode(jd) {
  return getTrueNode(jd);
}
function getSouthNodeLongitude(jd) {
  const northNode = getTrueNodeLongitude(jd);
  let southNode = northNode + 180;
  if (southNode >= 360) southNode -= 360;
  return southNode;
}
var LUNAR_NODE_CHARACTERISTICS = {
  /** Nodal period in days */
  nodalPeriod: 6798.38,
  /** Nodal period in years */
  nodalPeriodYears: 18.6,
  /** Mean daily motion in degrees (negative = retrograde) */
  meanDailyMotion: -0.0529,
  /** Maximum oscillation of true node from mean (degrees) */
  maxOscillation: 1.5
};

// src/ephemeris/planets/jupiter.ts
var L0 = [
  [59954691, 0, 0],
  [9695899, 5.0619179, 529.6909651],
  [573610, 1.444062, 7.113547],
  [306389, 5.417347, 1059.38193],
  [97178, 4.14265, 632.78374],
  [72903, 3.64043, 522.57742],
  [64264, 3.41145, 103.09277],
  [39806, 2.29377, 419.48464],
  [38858, 1.27232, 316.39187],
  [27965, 1.78455, 536.80451],
  [13590, 5.77481, 1589.0729],
  [8769, 3.63, 949.1756],
  [8246, 3.5823, 206.1855],
  [7368, 5.081, 735.8765],
  [6263, 0.025, 213.2991],
  [6114, 4.5132, 1162.4747],
  [5305, 1.3067, 14.2271],
  [4905, 1.3208, 110.2063],
  [4647, 4.6996, 3.9322],
  [3045, 4.3168, 426.5982],
  [2610, 1.5667, 846.0828],
  [2028, 1.0638, 3.1814],
  [1921, 0.9717, 639.8973],
  [1765, 2.1415, 1066.4955],
  [1723, 3.8804, 1265.5675],
  [1633, 3.582, 515.4639],
  [1432, 4.2968, 625.6702],
  [973, 4.098, 95.979],
  [884, 2.437, 412.371],
  [733, 6.085, 838.969],
  [731, 3.806, 1581.959],
  [709, 1.293, 742.99],
  [692, 6.134, 2118.764],
  [614, 4.109, 1478.867],
  [582, 4.54, 309.278],
  [495, 3.756, 323.505],
  [441, 2.958, 454.909],
  [417, 1.036, 2.448],
  [390, 4.897, 1692.166],
  [376, 4.703, 1368.66],
  [341, 5.715, 533.623],
  [330, 4.74, 0.048],
  [262, 1.877, 0.963],
  [261, 0.82, 380.128],
  [257, 3.724, 199.072],
  [244, 5.22, 728.763],
  [235, 1.227, 909.819],
  [220, 1.651, 543.918],
  [207, 1.855, 525.759],
  [202, 1.807, 1375.774],
  [197, 5.293, 1155.361],
  [175, 3.73, 942.062],
  [175, 3.226, 1898.351],
  [175, 5.91, 956.289]
];
var L1 = [
  [52993480757, 0, 0],
  [489741, 4.220667, 529.690965],
  [228919, 6.026475, 7.113547],
  [27655, 4.57266, 1059.38193],
  [20721, 5.45939, 522.57742],
  [12106, 0.16986, 536.80451],
  [6068, 4.4242, 103.0928],
  [5434, 3.9848, 419.4846],
  [4238, 5.8901, 14.2271],
  [2212, 5.2677, 206.1855],
  [1746, 4.9267, 1589.0729],
  [1296, 5.5513, 3.1814],
  [1173, 5.8565, 1052.2684],
  [1163, 0.5145, 3.9322],
  [1099, 5.307, 515.4639],
  [1007, 0.4648, 735.8765],
  [1004, 3.1504, 426.5982],
  [848, 5.758, 110.206],
  [827, 4.803, 213.299],
  [816, 0.586, 1066.495],
  [725, 5.518, 639.897],
  [568, 5.989, 625.67],
  [474, 4.132, 412.371],
  [413, 5.737, 95.979],
  [345, 4.242, 632.784],
  [336, 3.732, 1162.475],
  [234, 4.035, 949.176],
  [234, 6.243, 309.278],
  [199, 1.505, 838.969],
  [195, 2.219, 323.505],
  [187, 6.086, 742.99],
  [184, 6.28, 543.918],
  [171, 5.417, 199.072],
  [131, 0.626, 728.763],
  [115, 0.68, 846.083],
  [115, 5.286, 2118.764],
  [108, 4.493, 956.289],
  [80, 5.82, 1045.15],
  [72, 5.34, 942.06],
  [70, 5.97, 532.87],
  [67, 5.73, 21.34],
  [66, 0.13, 526.51],
  [65, 6.09, 1581.96],
  [59, 0.59, 1155.36],
  [58, 0.99, 1596.19],
  [57, 5.97, 1169.59],
  [57, 1.41, 533.62],
  [55, 5.43, 10.29],
  [52, 5.73, 117.32],
  [52, 0.23, 1368.66],
  [50, 6.08, 525.76],
  [47, 3.63, 1478.87],
  [47, 0.51, 1265.57],
  [40, 4.16, 1692.17],
  [34, 0.1, 302.16],
  [33, 5.04, 220.41],
  [32, 5.37, 508.35],
  [29, 5.42, 1272.68],
  [29, 3.36, 4.67],
  [29, 0.76, 88.87]
];
var L2 = [
  [47234, 4.32148, 7.11355],
  [38966, 0, 0],
  [30629, 2.93021, 529.69097],
  [3189, 1.055, 522.5774],
  [2729, 4.8455, 536.8045],
  [2723, 3.4141, 1059.3819],
  [1721, 4.1873, 14.2271],
  [383, 5.768, 419.485],
  [378, 0.76, 515.464],
  [367, 6.055, 103.093],
  [337, 3.786, 3.181],
  [308, 0.694, 206.186],
  [218, 3.814, 1589.073],
  [199, 5.34, 1066.495],
  [197, 2.484, 3.932],
  [156, 1.406, 1052.268],
  [146, 3.814, 639.897],
  [142, 1.634, 426.598],
  [130, 5.837, 412.371],
  [117, 1.414, 625.67],
  [97, 4.03, 110.21],
  [91, 1.11, 95.98],
  [87, 2.52, 632.78],
  [79, 4.64, 543.92],
  [72, 2.22, 735.88],
  [58, 0.83, 199.07],
  [57, 3.12, 213.3],
  [49, 1.67, 309.28],
  [40, 4.02, 21.34],
  [40, 0.62, 323.51],
  [36, 2.33, 728.76],
  [29, 3.61, 10.29],
  [28, 3.24, 838.97],
  [26, 4.5, 742.99],
  [26, 2.51, 1162.47],
  [25, 1.22, 1045.15],
  [24, 3.01, 956.29],
  [19, 4.29, 532.87],
  [18, 0.81, 508.35],
  [17, 4.2, 2118.76],
  [17, 1.83, 526.51],
  [15, 5.81, 1596.19],
  [15, 0.68, 942.06],
  [15, 4, 117.32],
  [14, 5.95, 316.39],
  [14, 1.8, 302.16],
  [13, 2.52, 88.87],
  [13, 4.37, 1169.59],
  [11, 4.44, 525.76],
  [10, 1.72, 1581.96],
  [9, 2.18, 1155.36],
  [9, 3.29, 220.41],
  [9, 3.32, 831.86],
  [8, 5.76, 846.08],
  [8, 2.71, 533.62],
  [7, 2.18, 1265.57],
  [6, 0.5, 949.18]
];
var L3 = [
  [6502, 2.5986, 7.1135],
  [1357, 1.3464, 529.691],
  [471, 2.475, 14.227],
  [417, 3.245, 536.805],
  [353, 2.974, 522.577],
  [155, 2.076, 1059.382],
  [87, 2.51, 515.46],
  [44, 0, 0],
  [34, 3.83, 1066.5],
  [28, 2.45, 206.19],
  [24, 1.28, 412.37],
  [23, 2.98, 543.92],
  [20, 2.1, 639.9],
  [20, 1.4, 419.48],
  [19, 1.59, 103.09],
  [17, 2.3, 21.34],
  [17, 2.6, 1589.07],
  [16, 3.15, 625.67],
  [16, 3.36, 1052.27],
  [13, 2.76, 95.98],
  [13, 2.54, 199.07],
  [13, 6.27, 426.6],
  [9, 1.76, 10.29],
  [9, 2.27, 110.21],
  [7, 3.43, 309.28],
  [7, 4.04, 728.76],
  [6, 2.52, 508.35],
  [5, 2.91, 1045.15],
  [5, 5.25, 323.51],
  [4, 4.3, 88.87],
  [4, 3.52, 302.16],
  [4, 4.09, 735.88],
  [3, 1.43, 956.29],
  [3, 4.36, 1596.19],
  [3, 1.25, 213.3],
  [3, 5.02, 838.97],
  [3, 2.24, 117.32],
  [2, 2.9, 742.99],
  [2, 2.36, 942.06]
];
var L4 = [
  [669, 0.853, 7.114],
  [114, 3.142, 0],
  [100, 0.743, 14.227],
  [50, 1.65, 536.8],
  [44, 5.82, 529.69],
  [32, 4.86, 522.58],
  [15, 4.29, 515.46],
  [9, 0.71, 1059.38],
  [5, 1.3, 543.92],
  [4, 2.32, 1066.5],
  [4, 0.48, 21.34],
  [3, 3, 412.37],
  [2, 0.4, 639.9],
  [2, 4.26, 199.07],
  [2, 4.91, 625.67],
  [2, 4.26, 206.19],
  [1, 5.26, 1052.27],
  [1, 4.72, 95.98],
  [1, 1.29, 7.16]
];
var L5 = [
  [50, 5.26, 7.11],
  [16, 5.25, 14.23],
  [4, 0.01, 536.8],
  [2, 1.1, 522.58],
  [1, 3.14, 0]
];
var B0 = [
  [2268616, 3.5585261, 529.6909651],
  [110090, 0, 0],
  [109972, 3.908093, 1059.38193],
  [8101, 3.6051, 522.5774],
  [6438, 0.3063, 536.8045],
  [6044, 4.2588, 1589.0729],
  [1107, 2.9853, 1162.4747],
  [944, 1.675, 426.598],
  [942, 2.936, 1052.268],
  [894, 1.754, 7.114],
  [836, 5.179, 103.093],
  [767, 2.155, 632.784],
  [684, 3.678, 213.299],
  [629, 0.643, 1066.495],
  [559, 0.014, 846.083],
  [532, 2.703, 110.206],
  [464, 1.173, 949.176],
  [431, 2.608, 419.485],
  [351, 4.611, 2118.764],
  [132, 4.778, 742.99],
  [123, 3.35, 1692.166],
  [116, 1.387, 323.505],
  [115, 5.049, 316.392],
  [104, 3.701, 515.464],
  [103, 2.319, 1478.867],
  [102, 3.153, 1581.959]
];
var B1 = [
  [177352, 5.701665, 529.690965],
  [3230, 5.7794, 1059.3819],
  [3081, 5.4746, 522.5774],
  [2212, 4.7348, 536.8045],
  [1694, 3.1416, 0],
  [346, 4.746, 1052.268],
  [234, 5.189, 1066.495],
  [196, 6.186, 7.114],
  [150, 3.927, 1589.073],
  [114, 3.439, 632.784],
  [97, 2.91, 949.18],
  [82, 5.08, 1162.47],
  [77, 2.51, 103.09],
  [77, 0.61, 419.48],
  [74, 5.5, 515.46],
  [61, 5.45, 213.3],
  [50, 3.95, 735.88],
  [46, 0.54, 110.21],
  [45, 1.9, 846.08],
  [37, 4.7, 543.92],
  [36, 6.11, 316.39],
  [32, 4.92, 1581.96]
];
var B2 = [
  [8094, 1.4632, 529.691],
  [813, 3.1416, 0],
  [742, 0.957, 522.577],
  [399, 2.899, 536.805],
  [342, 1.447, 1059.382],
  [74, 0.41, 1052.27],
  [46, 3.48, 1066.5],
  [30, 1.93, 1589.07],
  [29, 0.99, 515.46],
  [23, 4.27, 7.11],
  [14, 2.92, 543.92],
  [12, 5.22, 632.78],
  [11, 4.88, 949.18],
  [6, 6.21, 1045.15]
];
var B3 = [
  [252, 3.381, 529.691],
  [122, 2.733, 522.577],
  [49, 1.04, 536.8],
  [11, 2.31, 1052.27],
  [8, 2.77, 515.46],
  [7, 4.25, 1059.38],
  [6, 1.78, 1066.5],
  [4, 1.13, 543.92],
  [3, 3.14, 0]
];
var B4 = [
  [15, 4.53, 522.58],
  [5, 4.47, 529.69],
  [4, 5.44, 536.8],
  [3, 0, 0],
  [2, 4.52, 515.46],
  [1, 4.2, 1052.27]
];
var R0 = [
  [520887429, 0, 0],
  [25209327, 3.4910864, 529.69096509],
  [610600, 3.841154, 1059.38193],
  [282029, 2.574199, 632.783739],
  [187647, 2.075904, 522.577418],
  [86793, 0.71001, 419.48464],
  [72063, 0.21466, 536.80451],
  [65517, 5.97996, 316.39187],
  [30135, 2.16132, 949.17561],
  [29135, 1.67759, 103.09277],
  [23947, 0.27458, 7.11355],
  [23453, 3.54023, 735.87651],
  [22284, 4.19363, 1589.0729],
  [13033, 2.96043, 1162.4747],
  [12749, 2.7155, 1052.26838],
  [9703, 1.9067, 206.1855],
  [9161, 4.4135, 213.2991],
  [7895, 2.4791, 426.5982],
  [7058, 2.1818, 1265.5675],
  [6138, 6.2642, 846.0828],
  [5477, 5.6573, 639.8973],
  [4170, 2.0161, 515.4639],
  [4137, 2.7222, 625.6702],
  [3503, 0.5653, 1066.4955],
  [2617, 2.0099, 1581.9593],
  [2500, 4.5518, 838.9693],
  [2128, 6.1275, 742.9901],
  [1912, 0.8562, 412.3711],
  [1611, 3.0887, 1368.6603],
  [1479, 2.6803, 1478.8666],
  [1231, 1.8904, 323.5054],
  [1217, 1.8017, 110.2063],
  [1015, 1.3867, 454.9094],
  [999, 2.872, 309.278],
  [961, 4.549, 2118.764],
  [886, 4.148, 533.623],
  [821, 1.593, 1898.351],
  [812, 5.941, 909.819],
  [777, 3.677, 728.763],
  [727, 3.988, 1155.361],
  [655, 2.791, 1685.052],
  [654, 3.382, 1692.166],
  [621, 4.823, 956.289],
  [615, 2.276, 942.062],
  [562, 0.081, 543.918],
  [542, 0.284, 525.759]
];
var R1 = [
  [1271802, 2.6493751, 529.6909651],
  [61662, 3.00076, 1059.38193],
  [53444, 3.89718, 522.57742],
  [41390, 0, 0],
  [31185, 4.88277, 536.80451],
  [11847, 2.4133, 419.48464],
  [9166, 4.7598, 7.1135],
  [3404, 3.3469, 1589.0729],
  [3203, 5.2108, 735.8765],
  [3176, 2.793, 103.0928],
  [2806, 3.7422, 515.4639],
  [2677, 4.3305, 1052.2684],
  [2600, 3.6344, 206.1855],
  [2412, 1.4695, 426.5982],
  [2101, 3.9276, 639.8973],
  [1646, 5.3095, 1066.4955],
  [1641, 4.4163, 625.6702],
  [1050, 3.1611, 213.2991],
  [1025, 2.5543, 412.3711],
  [806, 2.678, 632.784],
  [741, 2.171, 1162.475],
  [677, 6.25, 838.969],
  [567, 4.577, 742.99],
  [485, 2.469, 949.176],
  [469, 4.71, 543.918],
  [445, 0.403, 323.505],
  [416, 5.368, 728.763],
  [402, 4.605, 309.278],
  [347, 4.681, 14.227],
  [338, 3.168, 956.289],
  [261, 5.343, 846.083],
  [247, 3.923, 942.062],
  [220, 4.842, 1368.66],
  [203, 5.6, 1155.361],
  [200, 4.439, 1045.155],
  [197, 3.706, 2118.764],
  [196, 3.759, 199.072],
  [184, 4.265, 95.979],
  [180, 4.402, 532.872],
  [170, 4.846, 526.51],
  [146, 6.13, 533.623],
  [133, 1.322, 110.206],
  [132, 4.512, 525.759]
];
var R2 = [
  [79645, 1.35866, 529.69097],
  [8252, 5.7777, 522.5774],
  [7030, 3.2748, 536.8045],
  [5314, 1.8384, 1059.3819],
  [1861, 2.9768, 7.1135],
  [964, 5.48, 515.464],
  [836, 4.199, 419.485],
  [498, 3.142, 0],
  [427, 2.228, 639.897],
  [406, 3.783, 1066.495],
  [377, 2.242, 1589.073],
  [363, 5.368, 206.186],
  [342, 6.099, 1052.268],
  [339, 6.127, 625.67],
  [333, 3e-3, 426.598],
  [280, 4.262, 412.371],
  [257, 0.963, 632.784],
  [230, 0.705, 735.877],
  [201, 3.069, 543.918],
  [200, 4.429, 103.093],
  [139, 2.932, 14.227],
  [114, 0.787, 728.763],
  [95, 1.7, 838.97],
  [86, 5.14, 323.51],
  [83, 0.06, 309.28],
  [80, 2.98, 742.99],
  [75, 1.6, 956.29],
  [70, 1.51, 213.3],
  [67, 5.47, 199.07],
  [62, 6.1, 1045.15],
  [56, 0.96, 1162.47],
  [52, 5.58, 942.06],
  [50, 2.72, 532.87],
  [45, 5.52, 508.35],
  [44, 0.27, 526.51],
  [40, 5.95, 95.98]
];
var R3 = [
  [3519, 6.058, 529.691],
  [1073, 1.6732, 536.8045],
  [916, 1.413, 522.577],
  [342, 0.523, 1059.382],
  [255, 1.196, 7.114],
  [222, 0.952, 515.464],
  [90, 3.14, 0],
  [69, 2.27, 1066.5],
  [58, 1.41, 543.92],
  [58, 0.53, 639.9],
  [51, 5.98, 412.37],
  [47, 1.58, 625.67],
  [43, 6.12, 419.48],
  [37, 1.18, 14.23],
  [34, 1.67, 1052.27],
  [34, 0.85, 206.19],
  [31, 1.04, 1589.07],
  [30, 4.63, 426.6],
  [21, 2.5, 728.76],
  [15, 0.89, 199.07],
  [14, 0.96, 508.35],
  [13, 1.5, 1045.15],
  [12, 2.61, 735.88],
  [12, 3.56, 323.51],
  [11, 1.79, 309.28],
  [11, 6.28, 956.29],
  [10, 6.26, 103.09],
  [9, 3.45, 838.97]
];
var R4 = [
  [129, 0.084, 536.805],
  [113, 4.249, 529.691],
  [83, 3.3, 522.58],
  [38, 2.73, 515.46],
  [27, 5.69, 7.11],
  [18, 5.4, 1059.38],
  [13, 6.02, 543.92],
  [9, 0.77, 1066.5],
  [8, 5.68, 14.23],
  [7, 1.43, 412.37],
  [6, 5.12, 639.9],
  [5, 3.34, 625.67],
  [3, 3.4, 1052.27],
  [3, 4.16, 728.76],
  [3, 2.9, 426.6]
];
var R5 = [
  [11, 4.75, 536.8],
  [4, 5.92, 522.58],
  [2, 5.57, 515.46],
  [2, 4.3, 543.92],
  [2, 3.69, 7.11],
  [2, 4.13, 1059.38],
  [2, 5.49, 1066.5]
];
function evaluateSeries(terms, tau) {
  let sum = 0;
  for (const [A, B, C] of terms) {
    sum += A * Math.cos(B + C * tau);
  }
  return sum;
}
function jupiterHeliocentricLongitude(tau) {
  const L0sum = evaluateSeries(L0, tau);
  const L1sum = evaluateSeries(L1, tau);
  const L2sum = evaluateSeries(L2, tau);
  const L3sum = evaluateSeries(L3, tau);
  const L4sum = evaluateSeries(L4, tau);
  const L5sum = evaluateSeries(L5, tau);
  const tau2 = tau * tau;
  const tau3 = tau2 * tau;
  const tau4 = tau3 * tau;
  const tau5 = tau4 * tau;
  const L = L0sum + L1sum * tau + L2sum * tau2 + L3sum * tau3 + L4sum * tau4 + L5sum * tau5;
  return L / 1e8;
}
function jupiterHeliocentricLatitude(tau) {
  const B0sum = evaluateSeries(B0, tau);
  const B1sum = evaluateSeries(B1, tau);
  const B2sum = evaluateSeries(B2, tau);
  const B3sum = evaluateSeries(B3, tau);
  const B4sum = evaluateSeries(B4, tau);
  const tau2 = tau * tau;
  const tau3 = tau2 * tau;
  const tau4 = tau3 * tau;
  const B = B0sum + B1sum * tau + B2sum * tau2 + B3sum * tau3 + B4sum * tau4;
  return B / 1e8;
}
function jupiterHeliocentricDistance(tau) {
  const R0sum = evaluateSeries(R0, tau);
  const R1sum = evaluateSeries(R1, tau);
  const R2sum = evaluateSeries(R2, tau);
  const R3sum = evaluateSeries(R3, tau);
  const R4sum = evaluateSeries(R4, tau);
  const R5sum = evaluateSeries(R5, tau);
  const tau2 = tau * tau;
  const tau3 = tau2 * tau;
  const tau4 = tau3 * tau;
  const tau5 = tau4 * tau;
  const R = R0sum + R1sum * tau + R2sum * tau2 + R3sum * tau3 + R4sum * tau4 + R5sum * tau5;
  return R / 1e8;
}
function earthHeliocentricPosition(tau) {
  const earthL0 = [
    [175347046, 0, 0],
    [3341656, 4.6692568, 6283.07585],
    [34894, 4.6261, 12566.1517],
    [3497, 2.7441, 5753.3849],
    [3418, 2.8289, 3.5231],
    [3136, 3.6277, 77713.7715],
    [2676, 4.4181, 7860.4194],
    [2343, 6.1352, 3930.2097],
    [1324, 0.7425, 11506.7698],
    [1273, 2.0371, 529.691],
    [1199, 1.1096, 1577.3435]
  ];
  const earthL1 = [
    [628331966747, 0, 0],
    [206059, 2.678235, 6283.07585],
    [4303, 2.6351, 12566.1517]
  ];
  const earthL2 = [
    [8722, 1.0725, 6283.0758],
    [991, 3.1416, 0]
  ];
  const earthB0 = [[280, 3.199, 84334.662]];
  const earthR0 = [
    [100013989, 0, 0],
    [1670700, 3.0984635, 6283.07585],
    [13956, 3.05525, 12566.1517],
    [3084, 5.1985, 77713.7715],
    [1628, 1.1739, 5753.3849],
    [1576, 2.8469, 7860.4194],
    [925, 5.453, 11506.77],
    [542, 4.564, 3930.21]
  ];
  const earthR1 = [
    [103019, 1.10749, 6283.07585],
    [1721, 1.0644, 12566.1517]
  ];
  const tau2 = tau * tau;
  const L0sum = evaluateSeries(earthL0, tau);
  const L1sum = evaluateSeries(earthL1, tau);
  const L2sum = evaluateSeries(earthL2, tau);
  const L = (L0sum + L1sum * tau + L2sum * tau2) / 1e8;
  const B0sum = evaluateSeries(earthB0, tau);
  const B = B0sum / 1e8;
  const R0sum = evaluateSeries(earthR0, tau);
  const R1sum = evaluateSeries(earthR1, tau);
  const R = (R0sum + R1sum * tau) / 1e8;
  return { longitude: L, latitude: B, distance: R };
}
function helioToGeo(planetLon, planetLat, planetDist, earthLon, earthLat, earthDist) {
  const cosB = Math.cos(planetLat);
  const x = planetDist * cosB * Math.cos(planetLon) - earthDist * Math.cos(earthLat) * Math.cos(earthLon);
  const y = planetDist * cosB * Math.sin(planetLon) - earthDist * Math.cos(earthLat) * Math.sin(earthLon);
  const z = planetDist * Math.sin(planetLat) - earthDist * Math.sin(earthLat);
  const distance = Math.sqrt(x * x + y * y + z * z);
  let longitude = Math.atan2(y, x);
  const latitude = Math.asin(z / distance);
  if (longitude < 0) longitude += 2 * Math.PI;
  return { longitude, latitude, distance };
}
function normalizeAngle4(degrees) {
  let result = degrees % 360;
  if (result < 0) result += 360;
  return result;
}
function getJupiterPosition(jd, options = {}) {
  const tau = (jd - J2000_EPOCH) / DAYS_PER_JULIAN_MILLENNIUM;
  const jupiterLon = jupiterHeliocentricLongitude(tau);
  const jupiterLat = jupiterHeliocentricLatitude(tau);
  const jupiterDist = jupiterHeliocentricDistance(tau);
  const earth = earthHeliocentricPosition(tau);
  const geo = helioToGeo(
    jupiterLon,
    jupiterLat,
    jupiterDist,
    earth.longitude,
    earth.latitude,
    earth.distance
  );
  let longitude = geo.longitude * RAD_TO_DEG;
  const latitude = geo.latitude * RAD_TO_DEG;
  const aberration = -20.49552 / 3600;
  longitude = normalizeAngle4(longitude + aberration);
  let longitudeSpeed = 0;
  if (options.includeSpeed !== false) {
    const tau1 = (jd + 1 - J2000_EPOCH) / DAYS_PER_JULIAN_MILLENNIUM;
    const jupiterLon1 = jupiterHeliocentricLongitude(tau1);
    const jupiterLat1 = jupiterHeliocentricLatitude(tau1);
    const jupiterDist1 = jupiterHeliocentricDistance(tau1);
    const earth1 = earthHeliocentricPosition(tau1);
    const geo1 = helioToGeo(
      jupiterLon1,
      jupiterLat1,
      jupiterDist1,
      earth1.longitude,
      earth1.latitude,
      earth1.distance
    );
    const longitude1 = normalizeAngle4(geo1.longitude * RAD_TO_DEG + aberration);
    let diff = longitude1 - longitude;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    longitudeSpeed = diff;
  }
  return {
    longitude,
    latitude,
    distance: geo.distance,
    longitudeSpeed,
    isRetrograde: longitudeSpeed < 0
  };
}
var JUPITER_ORBITAL_ELEMENTS = {
  /** Semi-major axis in AU */
  semiMajorAxis: 5.202887,
  /** Orbital eccentricity */
  eccentricity: 0.04838624,
  /** Orbital inclination in degrees */
  inclination: 1.30439695,
  /** Longitude of ascending node in degrees */
  ascendingNode: 100.47390909,
  /** Longitude of perihelion in degrees */
  perihelion: 14.72847983,
  /** Mean longitude at J2000.0 in degrees */
  meanLongitude: 34.39644051,
  /** Orbital period in days */
  orbitalPeriod: 4332.59,
  /** Orbital period in years */
  orbitalPeriodYears: 11.862,
  /** Synodic period in days (Jupiter-Earth) */
  synodicPeriod: 398.88
};

// src/ephemeris/planets/mars.ts
var L02 = [
  [620347712, 0, 0],
  [18656368, 5.050371, 3340.6124267],
  [1108217, 5.4009984, 6681.2248534],
  [91798, 5.75479, 10021.83728],
  [27745, 5.9705, 3.52312],
  [12316, 0.84956, 2810.92146],
  [10610, 2.93959, 2281.2305],
  [8927, 4.157, 0.0173],
  [8716, 6.1101, 13362.4497],
  [7775, 3.3397, 5621.8429],
  [6798, 0.3646, 398.149],
  [4161, 0.2281, 2942.4634],
  [3575, 1.6619, 2544.3144],
  [3075, 0.857, 191.4483],
  [2938, 6.0789, 0.0673],
  [2628, 0.6481, 3337.0893],
  [2580, 0.03, 3344.1355],
  [2389, 5.039, 796.298],
  [1799, 0.6563, 529.691],
  [1546, 2.9158, 1751.5395],
  [1528, 1.1498, 6151.5339],
  [1286, 3.068, 2146.1654],
  [1264, 3.6228, 5092.152],
  [1025, 3.6933, 8962.4553],
  [892, 0.183, 16703.062],
  [859, 2.401, 2914.014],
  [833, 4.495, 3340.63],
  [833, 2.464, 3340.595],
  [749, 3.822, 155.42],
  [724, 0.675, 3738.761],
  [713, 3.663, 1059.382],
  [655, 0.489, 3127.313],
  [636, 2.922, 8432.764],
  [553, 4.475, 1748.016],
  [550, 3.81, 0.98],
  [472, 3.625, 1194.447],
  [426, 0.554, 6283.076],
  [415, 0.497, 213.299],
  [312, 0.999, 6677.702],
  [307, 0.381, 6684.748],
  [302, 4.486, 3532.061],
  [299, 2.783, 6254.627],
  [293, 4.221, 20.775],
  [284, 5.769, 3149.164],
  [281, 5.882, 1349.867],
  [274, 0.542, 3340.545],
  [274, 0.134, 3340.68],
  [239, 5.372, 4136.91],
  [236, 5.755, 3333.499],
  [231, 1.282, 3870.303],
  [221, 3.505, 382.897],
  [204, 2.821, 1221.849],
  [193, 3.357, 3.59],
  [189, 1.491, 9492.146],
  [179, 1.006, 951.718],
  [174, 2.414, 553.569],
  [172, 0.439, 5486.778],
  [160, 3.949, 4562.461],
  [144, 1.419, 135.065],
  [140, 3.326, 2700.715],
  [138, 4.301, 7.114],
  [131, 4.045, 12303.068],
  [128, 2.208, 1592.596],
  [128, 1.807, 5088.629]
];
var L12 = [
  [334085627474, 0, 0],
  [1458227, 3.6042605, 3340.6124267],
  [164901, 3.926313, 6681.224853],
  [19963, 4.26594, 10021.83728],
  [3452, 4.7321, 3.5231],
  [2485, 4.6128, 13362.4497],
  [842, 4.459, 2281.23],
  [538, 5.016, 398.149],
  [521, 4.994, 3344.136],
  [433, 2.561, 191.448],
  [430, 5.316, 155.42],
  [382, 3.539, 796.298],
  [314, 4.963, 16703.062],
  [283, 3.16, 2544.314],
  [206, 4.569, 2146.165],
  [169, 1.329, 3337.089],
  [158, 4.185, 1751.54],
  [134, 2.233, 0.98],
  [134, 5.974, 1748.016],
  [118, 6.024, 6151.534],
  [117, 2.213, 1059.382],
  [114, 2.129, 1194.447],
  [114, 5.428, 3738.761],
  [91, 1.1, 1349.87],
  [85, 3.91, 553.57],
  [83, 5.3, 6684.75],
  [81, 4.43, 529.69],
  [80, 2.25, 8962.46],
  [73, 2.5, 951.72],
  [72, 5.84, 242.73],
  [71, 3.86, 2914.01],
  [68, 5.02, 382.9],
  [65, 1.02, 3340.6],
  [65, 3.05, 3340.63],
  [62, 4.15, 3149.16],
  [57, 3.89, 4136.91],
  [48, 4.87, 213.3],
  [48, 1.18, 3333.5],
  [47, 1.31, 3185.19],
  [41, 0.71, 1592.6],
  [40, 2.73, 7.11],
  [40, 5.32, 20043.67],
  [33, 5.41, 6283.08],
  [28, 0.05, 9492.15],
  [27, 3.89, 1221.85],
  [27, 5.11, 2700.72]
];
var L22 = [
  [58016, 2.04979, 3340.61243],
  [54188, 0, 0],
  [13908, 2.45742, 6681.22485],
  [2465, 2.8, 10021.8373],
  [398, 3.141, 13362.45],
  [222, 3.194, 3.523],
  [121, 0.543, 155.42],
  [62, 3.49, 16703.06],
  [54, 3.54, 3344.14],
  [34, 6, 2281.23],
  [32, 4.14, 191.45],
  [30, 1.56, 3337.09],
  [23, 2.02, 398.15],
  [22, 5.46, 796.3],
  [20, 0.85, 20043.67],
  [19, 5.86, 3185.19],
  [17, 5.68, 1751.54],
  [16, 4.26, 6151.53],
  [15, 4.07, 1059.38],
  [14, 5.78, 1748.02],
  [14, 2.61, 1349.87],
  [13, 2.54, 1194.45],
  [13, 5.47, 3149.16],
  [12, 4.44, 529.69],
  [12, 2.03, 5088.63],
  [10, 5.39, 382.9],
  [10, 0.42, 2544.31]
];
var L32 = [
  [1482, 0.4443, 3340.6124],
  [662, 0.885, 6681.225],
  [188, 1.288, 10021.837],
  [41, 1.65, 13362.45],
  [26, 0, 0],
  [23, 2.05, 155.42],
  [10, 1.58, 3.52]
];
var L42 = [
  [114, 3.1416, 0],
  [29, 5.64, 6681.22],
  [24, 5.14, 3340.61],
  [11, 6.03, 10021.84]
];
var L52 = [
  [1, 3.14, 0],
  [1, 4.04, 6681.22]
];
var B02 = [
  [3197135, 3.7683204, 3340.6124267],
  [298033, 4.10617, 6681.224853],
  [289105, 0, 0],
  [31366, 4.44651, 10021.83728],
  [3484, 4.7881, 13362.4497],
  [443, 5.026, 3344.136],
  [443, 5.652, 3337.089],
  [399, 5.131, 16703.062],
  [293, 3.793, 2281.23],
  [182, 6.136, 6151.534],
  [163, 4.264, 529.691],
  [160, 2.232, 1059.382],
  [149, 2.165, 5621.843],
  [143, 1.182, 3340.595],
  [143, 3.213, 3340.63]
];
var B12 = [
  [350069, 5.368478, 3340.612427],
  [14116, 3.14159, 0],
  [9671, 5.4788, 6681.2249],
  [1472, 3.2021, 10021.8373],
  [426, 3.408, 13362.45],
  [102, 0.776, 3337.089],
  [79, 3.72, 16703.06],
  [33, 3.46, 5621.84],
  [26, 2.48, 2281.23]
];
var B22 = [
  [16727, 0.60221, 3340.61243],
  [4987, 4.1416, 0],
  [302, 3.559, 6681.225],
  [26, 1.9, 13362.45],
  [21, 0.92, 10021.84],
  [12, 2.24, 3337.09]
];
var B32 = [
  [607, 1.981, 3340.612],
  [43, 0, 0],
  [14, 1.8, 6681.22]
];
var B42 = [
  [13, 0, 0],
  [11, 3.46, 3340.61]
];
var R02 = [
  [153033488, 0, 0],
  [14184953, 3.47971284, 3340.6124267],
  [660776, 3.817834, 6681.224853],
  [46179, 4.15595, 10021.83728],
  [8110, 5.5596, 2810.9215],
  [7485, 1.7724, 5621.8429],
  [5523, 1.3644, 2281.2305],
  [3825, 4.4941, 13362.4497],
  [2484, 4.9255, 2942.4634],
  [2307, 0.0908, 2544.3144],
  [1999, 5.3606, 3337.0893],
  [1960, 4.7425, 3344.1355],
  [1167, 2.1126, 5092.152],
  [1103, 5.0091, 398.149],
  [992, 5.839, 6151.534],
  [899, 4.408, 529.691],
  [807, 2.102, 1059.382],
  [798, 3.448, 796.298],
  [741, 1.499, 2146.165],
  [726, 1.245, 8432.764],
  [692, 2.134, 8962.455],
  [633, 0.894, 3340.63],
  [633, 2.924, 3340.595],
  [630, 1.287, 1751.54],
  [574, 0.829, 2914.014],
  [526, 5.383, 3738.761],
  [473, 5.199, 3127.313],
  [348, 4.832, 16703.062],
  [284, 2.907, 3532.061],
  [280, 5.257, 6283.076],
  [276, 1.218, 6254.627],
  [275, 2.908, 1748.016],
  [270, 3.764, 5884.927],
  [239, 2.037, 1194.447],
  [234, 5.105, 5486.778],
  [228, 3.255, 6872.673],
  [223, 4.199, 3149.164],
  [219, 5.583, 191.448],
  [208, 5.255, 3340.545],
  [208, 4.846, 3340.68],
  [186, 5.699, 6677.702],
  [183, 5.081, 6684.748],
  [179, 4.184, 3333.499],
  [176, 5.953, 3870.303],
  [164, 3.799, 4136.91]
];
var R12 = [
  [1107433, 2.0325052, 3340.6124267],
  [103176, 2.370718, 6681.224853],
  [12877, 0, 0],
  [10816, 2.70888, 10021.83728],
  [1195, 3.047, 13362.4497],
  [439, 2.888, 2281.23],
  [396, 3.423, 3344.136],
  [183, 1.584, 2544.314],
  [136, 3.385, 16703.062],
  [128, 6.043, 3337.089],
  [119, 3.54, 3185.192],
  [108, 2.745, 2942.463],
  [93, 1.3, 2810.92],
  [81, 3.44, 398.15],
  [80, 4.04, 3149.16],
  [73, 2.76, 6151.53],
  [72, 5.02, 529.69],
  [71, 3.86, 1059.38],
  [66, 5.65, 1751.54],
  [60, 1.22, 6684.75],
  [59, 5.39, 155.42],
  [47, 4.57, 3738.76],
  [43, 6.02, 6677.7],
  [41, 5.47, 3340.6],
  [41, 5.09, 3340.63]
];
var R22 = [
  [44242, 0.47931, 3340.61243],
  [8138, 0.87, 6681.2249],
  [1275, 1.2259, 10021.8373],
  [187, 1.573, 13362.45],
  [52, 3.14, 0],
  [41, 1.97, 3344.14],
  [27, 1.92, 16703.06],
  [18, 4.43, 2281.23],
  [12, 2.24, 3185.19],
  [10, 5.39, 1059.38]
];
var R32 = [
  [1113, 5.1499, 3340.6124],
  [424, 5.613, 6681.225],
  [100, 5.997, 10021.837],
  [20, 0.08, 13362.45],
  [5, 3.14, 0]
];
var R42 = [
  [20, 3.58, 3340.61],
  [16, 4.05, 6681.22],
  [6, 4.46, 10021.84]
];
function evaluateSeries2(terms, tau) {
  let sum = 0;
  for (const [A, B, C] of terms) {
    sum += A * Math.cos(B + C * tau);
  }
  return sum;
}
function marsHeliocentricLongitude(tau) {
  const L0sum = evaluateSeries2(L02, tau);
  const L1sum = evaluateSeries2(L12, tau);
  const L2sum = evaluateSeries2(L22, tau);
  const L3sum = evaluateSeries2(L32, tau);
  const L4sum = evaluateSeries2(L42, tau);
  const L5sum = evaluateSeries2(L52, tau);
  const tau2 = tau * tau;
  const tau3 = tau2 * tau;
  const tau4 = tau3 * tau;
  const tau5 = tau4 * tau;
  const L = L0sum + L1sum * tau + L2sum * tau2 + L3sum * tau3 + L4sum * tau4 + L5sum * tau5;
  return L / 1e8;
}
function marsHeliocentricLatitude(tau) {
  const B0sum = evaluateSeries2(B02, tau);
  const B1sum = evaluateSeries2(B12, tau);
  const B2sum = evaluateSeries2(B22, tau);
  const B3sum = evaluateSeries2(B32, tau);
  const B4sum = evaluateSeries2(B42, tau);
  const tau2 = tau * tau;
  const tau3 = tau2 * tau;
  const tau4 = tau3 * tau;
  const B = B0sum + B1sum * tau + B2sum * tau2 + B3sum * tau3 + B4sum * tau4;
  return B / 1e8;
}
function marsHeliocentricDistance(tau) {
  const R0sum = evaluateSeries2(R02, tau);
  const R1sum = evaluateSeries2(R12, tau);
  const R2sum = evaluateSeries2(R22, tau);
  const R3sum = evaluateSeries2(R32, tau);
  const R4sum = evaluateSeries2(R42, tau);
  const tau2 = tau * tau;
  const tau3 = tau2 * tau;
  const tau4 = tau3 * tau;
  const R = R0sum + R1sum * tau + R2sum * tau2 + R3sum * tau3 + R4sum * tau4;
  return R / 1e8;
}
function earthHeliocentricPosition2(tau) {
  const earthL0 = [
    [175347046, 0, 0],
    [3341656, 4.6692568, 6283.07585],
    [34894, 4.6261, 12566.1517],
    [3497, 2.7441, 5753.3849],
    [3418, 2.8289, 3.5231],
    [3136, 3.6277, 77713.7715],
    [2676, 4.4181, 7860.4194],
    [2343, 6.1352, 3930.2097],
    [1324, 0.7425, 11506.7698],
    [1273, 2.0371, 529.691],
    [1199, 1.1096, 1577.3435]
  ];
  const earthL1 = [
    [628331966747, 0, 0],
    [206059, 2.678235, 6283.07585],
    [4303, 2.6351, 12566.1517]
  ];
  const earthL2 = [
    [8722, 1.0725, 6283.0758],
    [991, 3.1416, 0]
  ];
  const earthB0 = [[280, 3.199, 84334.662]];
  const earthR0 = [
    [100013989, 0, 0],
    [1670700, 3.0984635, 6283.07585],
    [13956, 3.05525, 12566.1517],
    [3084, 5.1985, 77713.7715],
    [1628, 1.1739, 5753.3849],
    [1576, 2.8469, 7860.4194],
    [925, 5.453, 11506.77],
    [542, 4.564, 3930.21]
  ];
  const earthR1 = [
    [103019, 1.10749, 6283.07585],
    [1721, 1.0644, 12566.1517]
  ];
  const tau2 = tau * tau;
  const L0sum = evaluateSeries2(earthL0, tau);
  const L1sum = evaluateSeries2(earthL1, tau);
  const L2sum = evaluateSeries2(earthL2, tau);
  const L = (L0sum + L1sum * tau + L2sum * tau2) / 1e8;
  const B0sum = evaluateSeries2(earthB0, tau);
  const B = B0sum / 1e8;
  const R0sum = evaluateSeries2(earthR0, tau);
  const R1sum = evaluateSeries2(earthR1, tau);
  const R = (R0sum + R1sum * tau) / 1e8;
  return { longitude: L, latitude: B, distance: R };
}
function helioToGeo2(planetLon, planetLat, planetDist, earthLon, earthLat, earthDist) {
  const cosB = Math.cos(planetLat);
  const x = planetDist * cosB * Math.cos(planetLon) - earthDist * Math.cos(earthLat) * Math.cos(earthLon);
  const y = planetDist * cosB * Math.sin(planetLon) - earthDist * Math.cos(earthLat) * Math.sin(earthLon);
  const z = planetDist * Math.sin(planetLat) - earthDist * Math.sin(earthLat);
  const distance = Math.sqrt(x * x + y * y + z * z);
  let longitude = Math.atan2(y, x);
  const latitude = Math.asin(z / distance);
  if (longitude < 0) longitude += 2 * Math.PI;
  return { longitude, latitude, distance };
}
function normalizeAngle5(degrees) {
  let result = degrees % 360;
  if (result < 0) result += 360;
  return result;
}
function getMarsPosition(jd, options = {}) {
  const tau = (jd - J2000_EPOCH) / DAYS_PER_JULIAN_MILLENNIUM;
  const marsLon = marsHeliocentricLongitude(tau);
  const marsLat = marsHeliocentricLatitude(tau);
  const marsDist = marsHeliocentricDistance(tau);
  const earth = earthHeliocentricPosition2(tau);
  const geo = helioToGeo2(
    marsLon,
    marsLat,
    marsDist,
    earth.longitude,
    earth.latitude,
    earth.distance
  );
  let longitude = geo.longitude * RAD_TO_DEG;
  const latitude = geo.latitude * RAD_TO_DEG;
  const aberration = -20.49552 / 3600;
  longitude = normalizeAngle5(longitude + aberration);
  let longitudeSpeed = 0;
  if (options.includeSpeed !== false) {
    const tau1 = (jd + 1 - J2000_EPOCH) / DAYS_PER_JULIAN_MILLENNIUM;
    const marsLon1 = marsHeliocentricLongitude(tau1);
    const marsLat1 = marsHeliocentricLatitude(tau1);
    const marsDist1 = marsHeliocentricDistance(tau1);
    const earth1 = earthHeliocentricPosition2(tau1);
    const geo1 = helioToGeo2(
      marsLon1,
      marsLat1,
      marsDist1,
      earth1.longitude,
      earth1.latitude,
      earth1.distance
    );
    const longitude1 = normalizeAngle5(geo1.longitude * RAD_TO_DEG + aberration);
    let diff = longitude1 - longitude;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    longitudeSpeed = diff;
  }
  return {
    longitude,
    latitude,
    distance: geo.distance,
    longitudeSpeed,
    isRetrograde: longitudeSpeed < 0
  };
}
var MARS_ORBITAL_ELEMENTS = {
  /** Semi-major axis in AU */
  semiMajorAxis: 1.52371034,
  /** Orbital eccentricity */
  eccentricity: 0.0933941,
  /** Orbital inclination in degrees */
  inclination: 1.84969142,
  /** Longitude of ascending node in degrees */
  ascendingNode: 49.55953891,
  /** Longitude of perihelion in degrees */
  perihelion: 336.04084219,
  /** Mean longitude at J2000.0 in degrees */
  meanLongitude: 355.45332,
  /** Orbital period in days */
  orbitalPeriod: 686.98,
  /** Synodic period in days (Mars-Earth) */
  synodicPeriod: 779.94
};

// src/ephemeris/planets/mercury.ts
var L03 = [
  [440250710, 0, 0],
  [40989415, 1.48302034, 26087.90314157],
  [5046294, 4.47785449, 52175.8062831],
  [855347, 1.165203, 78263.709425],
  [165590, 4.119692, 104351.612566],
  [34562, 0.77931, 130439.51571],
  [7583, 3.7135, 156527.4188],
  [3560, 1.512, 1109.0946],
  [1803, 4.1033, 5661.332],
  [1726, 0.3583, 182615.322],
  [1590, 2.9951, 25028.5212],
  [1365, 4.5992, 27197.2817],
  [1017, 0.8803, 31749.2352],
  [714, 1.541, 24978.525],
  [644, 5.303, 21535.95],
  [451, 6.05, 51116.424],
  [404, 3.282, 208703.225],
  [352, 5.242, 20426.571],
  [345, 2.792, 15874.618],
  [343, 5.765, 955.6],
  [339, 5.863, 25558.212],
  [325, 1.337, 53285.185],
  [273, 2.495, 529.691],
  [264, 3.917, 57837.138],
  [260, 0.987, 4551.953],
  [239, 0.113, 1059.382],
  [235, 0.267, 11322.664],
  [217, 0.66, 13521.751],
  [209, 2.092, 47623.853],
  [183, 2.629, 27043.503],
  [182, 2.434, 25661.305],
  [176, 4.536, 51066.428],
  [173, 2.452, 24498.83],
  [142, 3.36, 37410.567],
  [138, 0.291, 10213.286],
  [125, 3.721, 39609.655],
  [118, 2.781, 77204.327],
  [106, 4.206, 19804.827]
];
var L13 = [
  [2608814706223, 0, 0],
  [44141826, 1.42385544, 26087.90314157],
  [10094479, 4.47466326, 52175.8062831],
  [1621224, 1.24388792, 78263.709425],
  [303471, 4.29561645, 104351.612566],
  [59820, 1.035, 130439.51571],
  [12069, 4.0649, 156527.4188],
  [2535, 0.8062, 182615.322],
  [534, 3.811, 208703.225]
];
var L23 = [
  [53050, 0, 0],
  [16904, 4.69072, 26087.90314],
  [7397, 1.3474, 52175.8063],
  [3018, 4.4564, 78263.7094],
  [1107, 1.264, 104351.6126],
  [378, 4.32, 130439.516],
  [123, 1.069, 156527.419],
  [39, 4.08, 182615.32]
];
var L33 = [
  [188, 0.035, 52175.806],
  [142, 3.125, 26087.903],
  [97, 3, 78263.71],
  [44, 6.02, 104351.61],
  [35, 0, 0]
];
var L43 = [
  [114, 3.1416, 0],
  [2, 2.03, 26087.9],
  [2, 1.42, 78263.71],
  [2, 4.5, 52175.81]
];
var L53 = [[1, 3.14, 0]];
var B03 = [
  [11737529, 1.98357499, 26087.90314157],
  [2388077, 5.03738959, 52175.8062831],
  [1222840, 3.14159265, 0],
  [543252, 1.79644364, 78263.709425],
  [129779, 4.83232503, 104351.612566],
  [31867, 1.58088496, 130439.51571],
  [7963, 4.6097, 156527.4188],
  [2014, 1.3532, 182615.322],
  [514, 4.378, 208703.225],
  [209, 2.02, 24978.52],
  [208, 4.918, 27197.28],
  [132, 1.119, 234791.13]
];
var B13 = [
  [429151, 3.50169786, 26087.90314157],
  [146234, 3.14159265, 0],
  [22675, 0.01515, 52175.8063],
  [10895, 0.4854, 78263.7094],
  [6353, 3.4294, 104351.6126],
  [2496, 0.1605, 130439.516],
  [860, 3.185, 156527.419],
  [278, 6.21, 182615.32],
  [86, 2.95, 208703.23]
];
var B23 = [
  [11831, 4.79066, 26087.90314],
  [1914, 0, 0],
  [1045, 1.2122, 52175.8063],
  [266, 4.434, 78263.709],
  [170, 1.623, 104351.613],
  [96, 4.8, 130439.52],
  [45, 1.61, 156527.42],
  [18, 4.67, 182615.32]
];
var B33 = [
  [235, 0.354, 26087.903],
  [161, 0, 0],
  [19, 4.36, 52175.81],
  [6, 2.51, 78263.71]
];
var B43 = [
  [4, 1.75, 26087.9],
  [1, 3.14, 0]
];
var R03 = [
  [39528272, 0, 0],
  [7834132, 6.19233723, 26087.90314157],
  [795526, 2.95989691, 52175.8062831],
  [121282, 6.01064154, 78263.709425],
  [21922, 2.7782, 104351.612566],
  [4354, 5.8289, 130439.51571],
  [918, 2.597, 156527.4188],
  [290, 1.424, 25028.521],
  [260, 3.028, 27197.282],
  [202, 5.647, 182615.322],
  [201, 5.592, 31749.235],
  [142, 6.253, 24978.525],
  [100, 3.734, 21535.95]
];
var R13 = [
  [217348, 4.65617159, 26087.90314157],
  [44142, 1.42385545, 52175.8062831],
  [10094, 4.47466323, 78263.709425],
  [620, 0, 0],
  [3036, 1.2438, 104351.6126],
  [596, 4.297, 130439.516],
  [118, 1.03, 156527.419],
  [24, 4.07, 182615.32]
];
var R23 = [
  [3118, 3.0823, 26087.9031],
  [1245, 6.1518, 52175.8063],
  [425, 2.926, 78263.709],
  [136, 5.98, 104351.61],
  [42, 2.75, 130439.52],
  [22, 3.14, 0]
];
var R33 = [
  [33, 1.68, 26087.9],
  [24, 4.63, 52175.81],
  [12, 1.39, 78263.71]
];
function evaluateSeries3(terms, tau) {
  let sum = 0;
  for (const [A, B, C] of terms) {
    sum += A * Math.cos(B + C * tau);
  }
  return sum;
}
function mercuryHeliocentricLongitude(tau) {
  const L0sum = evaluateSeries3(L03, tau);
  const L1sum = evaluateSeries3(L13, tau);
  const L2sum = evaluateSeries3(L23, tau);
  const L3sum = evaluateSeries3(L33, tau);
  const L4sum = evaluateSeries3(L43, tau);
  const L5sum = evaluateSeries3(L53, tau);
  const tau2 = tau * tau;
  const tau3 = tau2 * tau;
  const tau4 = tau3 * tau;
  const tau5 = tau4 * tau;
  const L = L0sum + L1sum * tau + L2sum * tau2 + L3sum * tau3 + L4sum * tau4 + L5sum * tau5;
  return L / 1e8;
}
function mercuryHeliocentricLatitude(tau) {
  const B0sum = evaluateSeries3(B03, tau);
  const B1sum = evaluateSeries3(B13, tau);
  const B2sum = evaluateSeries3(B23, tau);
  const B3sum = evaluateSeries3(B33, tau);
  const B4sum = evaluateSeries3(B43, tau);
  const tau2 = tau * tau;
  const tau3 = tau2 * tau;
  const tau4 = tau3 * tau;
  const B = B0sum + B1sum * tau + B2sum * tau2 + B3sum * tau3 + B4sum * tau4;
  return B / 1e8;
}
function mercuryHeliocentricDistance(tau) {
  const R0sum = evaluateSeries3(R03, tau);
  const R1sum = evaluateSeries3(R13, tau);
  const R2sum = evaluateSeries3(R23, tau);
  const R3sum = evaluateSeries3(R33, tau);
  const tau2 = tau * tau;
  const tau3 = tau2 * tau;
  const R = R0sum + R1sum * tau + R2sum * tau2 + R3sum * tau3;
  return R / 1e8;
}
function earthHeliocentricPosition3(tau) {
  const earthL0 = [
    [175347046, 0, 0],
    [3341656, 4.6692568, 6283.07585],
    [34894, 4.6261, 12566.1517],
    [3497, 2.7441, 5753.3849],
    [3418, 2.8289, 3.5231],
    [3136, 3.6277, 77713.7715],
    [2676, 4.4181, 7860.4194],
    [2343, 6.1352, 3930.2097],
    [1324, 0.7425, 11506.7698],
    [1273, 2.0371, 529.691],
    [1199, 1.1096, 1577.3435]
  ];
  const earthL1 = [
    [628331966747, 0, 0],
    [206059, 2.678235, 6283.07585],
    [4303, 2.6351, 12566.1517]
  ];
  const earthL2 = [
    [8722, 1.0725, 6283.0758],
    [991, 3.1416, 0]
  ];
  const earthB0 = [[280, 3.199, 84334.662]];
  const earthR0 = [
    [100013989, 0, 0],
    [1670700, 3.0984635, 6283.07585],
    [13956, 3.05525, 12566.1517],
    [3084, 5.1985, 77713.7715],
    [1628, 1.1739, 5753.3849],
    [1576, 2.8469, 7860.4194],
    [925, 5.453, 11506.77],
    [542, 4.564, 3930.21]
  ];
  const earthR1 = [
    [103019, 1.10749, 6283.07585],
    [1721, 1.0644, 12566.1517]
  ];
  const tau2 = tau * tau;
  const L0sum = evaluateSeries3(earthL0, tau);
  const L1sum = evaluateSeries3(earthL1, tau);
  const L2sum = evaluateSeries3(earthL2, tau);
  const L = (L0sum + L1sum * tau + L2sum * tau2) / 1e8;
  const B0sum = evaluateSeries3(earthB0, tau);
  const B = B0sum / 1e8;
  const R0sum = evaluateSeries3(earthR0, tau);
  const R1sum = evaluateSeries3(earthR1, tau);
  const R = (R0sum + R1sum * tau) / 1e8;
  return { longitude: L, latitude: B, distance: R };
}
function helioToGeo3(planetLon, planetLat, planetDist, earthLon, earthLat, earthDist) {
  const cosB = Math.cos(planetLat);
  const x = planetDist * cosB * Math.cos(planetLon) - earthDist * Math.cos(earthLat) * Math.cos(earthLon);
  const y = planetDist * cosB * Math.sin(planetLon) - earthDist * Math.cos(earthLat) * Math.sin(earthLon);
  const z = planetDist * Math.sin(planetLat) - earthDist * Math.sin(earthLat);
  const distance = Math.sqrt(x * x + y * y + z * z);
  let longitude = Math.atan2(y, x);
  const latitude = Math.asin(z / distance);
  if (longitude < 0) longitude += 2 * Math.PI;
  return { longitude, latitude, distance };
}
function normalizeAngle6(degrees) {
  let result = degrees % 360;
  if (result < 0) result += 360;
  return result;
}
function getMercuryPosition(jd, options = {}) {
  const tau = (jd - J2000_EPOCH) / DAYS_PER_JULIAN_MILLENNIUM;
  const mercuryLon = mercuryHeliocentricLongitude(tau);
  const mercuryLat = mercuryHeliocentricLatitude(tau);
  const mercuryDist = mercuryHeliocentricDistance(tau);
  const earth = earthHeliocentricPosition3(tau);
  const geo = helioToGeo3(
    mercuryLon,
    mercuryLat,
    mercuryDist,
    earth.longitude,
    earth.latitude,
    earth.distance
  );
  let longitude = geo.longitude * RAD_TO_DEG;
  const latitude = geo.latitude * RAD_TO_DEG;
  const aberration = -20.49552 / 3600;
  longitude = normalizeAngle6(longitude + aberration);
  let longitudeSpeed = 0;
  if (options.includeSpeed !== false) {
    const tau1 = (jd + 1 - J2000_EPOCH) / DAYS_PER_JULIAN_MILLENNIUM;
    const mercuryLon1 = mercuryHeliocentricLongitude(tau1);
    const mercuryLat1 = mercuryHeliocentricLatitude(tau1);
    const mercuryDist1 = mercuryHeliocentricDistance(tau1);
    const earth1 = earthHeliocentricPosition3(tau1);
    const geo1 = helioToGeo3(
      mercuryLon1,
      mercuryLat1,
      mercuryDist1,
      earth1.longitude,
      earth1.latitude,
      earth1.distance
    );
    const longitude1 = normalizeAngle6(geo1.longitude * RAD_TO_DEG + aberration);
    let diff = longitude1 - longitude;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    longitudeSpeed = diff;
  }
  return {
    longitude,
    latitude,
    distance: geo.distance,
    longitudeSpeed,
    isRetrograde: longitudeSpeed < 0
  };
}
var MERCURY_ORBITAL_ELEMENTS = {
  /** Semi-major axis in AU */
  semiMajorAxis: 0.38709927,
  /** Orbital eccentricity */
  eccentricity: 0.20563593,
  /** Orbital inclination in degrees */
  inclination: 7.00497902,
  /** Longitude of ascending node in degrees */
  ascendingNode: 48.33076593,
  /** Longitude of perihelion in degrees */
  perihelion: 77.45779628,
  /** Mean longitude at J2000.0 in degrees */
  meanLongitude: 252.2503235,
  /** Orbital period in days */
  orbitalPeriod: 87.9691,
  /** Synodic period in days (Mercury-Earth) */
  synodicPeriod: 115.88
};

// src/ephemeris/planets/neptune.ts
var L04 = [
  [531188633, 0, 0],
  [1798476, 2.9010127, 38.1330356],
  [1019728, 0.4858092, 1.4844727],
  [124532, 4.830081, 36.648563],
  [42064, 5.41055, 2.96895],
  [37715, 6.09222, 35.16409],
  [33785, 1.24489, 76.26607],
  [16483, 8e-5, 491.55793],
  [9199, 4.9375, 39.6175],
  [8994, 0.2746, 175.1661],
  [4216, 1.9871, 73.2971],
  [3365, 1.0359, 33.6796],
  [2285, 4.2061, 4.4534],
  [1434, 2.7834, 74.7816],
  [900, 2.076, 109.946],
  [745, 3.19, 71.813],
  [506, 5.748, 114.399],
  [400, 0.35, 1021.249],
  [345, 3.462, 41.102],
  [340, 3.304, 77.751],
  [323, 2.248, 32.195],
  [306, 0.497, 0.521],
  [287, 4.505, 0.048],
  [282, 2.246, 146.594],
  [267, 4.889, 0.963],
  [252, 5.782, 388.465],
  [245, 1.247, 9.561],
  [233, 2.505, 137.033],
  [227, 1.797, 453.425],
  [170, 3.324, 108.461],
  [151, 2.192, 33.94],
  [150, 2.997, 5.938],
  [148, 0.859, 111.43],
  [119, 3.677, 2.448],
  [109, 2.416, 183.243],
  [103, 0.041, 0.261],
  [103, 4.404, 70.328],
  [102, 5.705, 0.112]
];
var L14 = [
  [3837687717, 0, 0],
  [16604, 4.86319, 1.48447],
  [15807, 2.27923, 38.13304],
  [3335, 3.682, 76.2661],
  [1306, 3.6732, 2.9689],
  [605, 1.505, 35.164],
  [179, 3.453, 39.618],
  [107, 2.451, 4.453],
  [106, 2.755, 33.68],
  [73, 5.49, 36.65],
  [57, 1.86, 114.4],
  [57, 5.22, 0.52],
  [35, 4.52, 74.78],
  [32, 5.9, 77.75],
  [30, 3.67, 388.47],
  [29, 5.17, 9.56],
  [29, 5.17, 2.45],
  [26, 5.25, 168.05]
];
var L24 = [
  [53893, 0, 0],
  [296, 1.855, 1.484],
  [281, 1.191, 38.133],
  [270, 5.721, 76.266],
  [23, 1.21, 2.97],
  [9, 4.43, 35.16],
  [7, 0.54, 2.45]
];
var L34 = [
  [31, 0, 0],
  [15, 1.35, 76.27],
  [12, 6.04, 1.48],
  [12, 6.11, 38.13]
];
var L44 = [[114, 3.142, 0]];
var B04 = [
  [3088623, 1.4410437, 38.1330356],
  [27780, 5.91272, 76.26607],
  [27624, 0, 0],
  [15448, 3.50877, 39.61751],
  [15355, 2.52124, 36.64856],
  [2e3, 1.51, 74.7816],
  [1968, 4.3778, 1.4845],
  [1015, 3.2156, 35.1641],
  [606, 2.802, 73.297],
  [595, 2.129, 41.102],
  [589, 3.187, 2.969],
  [402, 4.169, 114.399],
  [280, 1.682, 77.751],
  [262, 3.767, 213.299],
  [254, 3.271, 453.425],
  [206, 4.257, 529.691],
  [140, 3.53, 137.033]
];
var B14 = [
  [227279, 3.807931, 38.133036],
  [1803, 1.9758, 76.2661],
  [1433, 3.1416, 0],
  [1386, 4.8256, 36.6486],
  [1073, 6.0805, 39.6175],
  [148, 3.858, 74.782],
  [136, 0.478, 1.484],
  [70, 6.19, 35.16],
  [52, 5.05, 73.3],
  [43, 0.31, 114.4],
  [37, 4.89, 41.1],
  [37, 5.76, 2.97],
  [26, 5.22, 213.3]
];
var B24 = [
  [9691, 5.5712, 38.133],
  [79, 3.63, 76.27],
  [72, 0.45, 36.65],
  [59, 3.14, 0],
  [30, 1.61, 39.62],
  [6, 5.61, 74.78]
];
var B34 = [
  [273, 1.017, 38.133],
  [2, 0, 0],
  [2, 2.37, 36.65],
  [2, 5.33, 76.27]
];
var B44 = [[6, 2.67, 38.13]];
var R04 = [
  [3007013206, 0, 0],
  [27062259, 1.32999459, 38.13303564],
  [1691764, 3.2518614, 36.6485629],
  [807831, 5.185928, 1.484473],
  [537761, 4.521139, 35.16409],
  [495726, 1.571057, 491.557929],
  [274572, 1.845523, 175.16606],
  [135134, 3.372206, 39.617508],
  [121802, 5.797544, 76.266071],
  [100895, 0.377027, 73.297126],
  [69792, 3.79617, 2.96895],
  [46688, 5.74938, 33.67962],
  [24594, 0.50802, 109.94569],
  [16939, 1.59422, 71.81265],
  [14230, 1.07786, 74.7816],
  [12012, 1.92062, 1021.24889],
  [8395, 0.6782, 146.5943],
  [7572, 1.0715, 388.4652],
  [5721, 2.5906, 4.4534],
  [4840, 1.9069, 41.102],
  [4483, 2.9057, 529.691],
  [4421, 1.7499, 108.4612],
  [4354, 0.6799, 32.1951],
  [4270, 3.4134, 453.4249],
  [3381, 0.8481, 183.2428],
  [2881, 1.986, 137.033],
  [2879, 3.6742, 350.3321],
  [2636, 3.0976, 213.2991],
  [2530, 5.7984, 490.3341],
  [2523, 0.4863, 493.0424],
  [2306, 2.8096, 70.3282],
  [2087, 0.6186, 33.9402]
];
var R14 = [
  [236339, 0.70498, 38.133036],
  [13220, 3.32015, 1.48447],
  [8622, 6.2163, 35.1641],
  [2702, 1.8814, 39.6175],
  [2155, 2.0943, 2.9689],
  [2153, 5.1687, 76.2661],
  [1603, 0, 0],
  [1464, 1.1842, 33.6796],
  [1136, 3.9189, 36.6486],
  [898, 5.241, 388.465],
  [790, 0.533, 168.053],
  [760, 0.021, 182.28],
  [607, 1.077, 1021.249],
  [572, 3.401, 484.444],
  [561, 2.887, 498.671]
];
var R24 = [
  [4247, 5.8991, 38.133],
  [218, 0.346, 1.484],
  [163, 2.239, 168.053],
  [156, 4.594, 182.28],
  [127, 2.848, 35.164]
];
var R34 = [
  [166, 4.552, 38.133],
  [18, 4.52, 1.48]
];
function neptuneHeliocentricLongitude(tau) {
  const tau2 = tau * tau;
  const tau3 = tau2 * tau;
  const tau4 = tau3 * tau;
  let L0sum = 0;
  for (const [A, B, C] of L04) {
    L0sum += A * Math.cos(B + C * tau);
  }
  let L1sum = 0;
  for (const [A, B, C] of L14) {
    L1sum += A * Math.cos(B + C * tau);
  }
  let L2sum = 0;
  for (const [A, B, C] of L24) {
    L2sum += A * Math.cos(B + C * tau);
  }
  let L3sum = 0;
  for (const [A, B, C] of L34) {
    L3sum += A * Math.cos(B + C * tau);
  }
  let L4sum = 0;
  for (const [A, B, C] of L44) {
    L4sum += A * Math.cos(B + C * tau);
  }
  const L = (L0sum + L1sum * tau + L2sum * tau2 + L3sum * tau3 + L4sum * tau4) / 1e8;
  return L;
}
function neptuneHeliocentricLatitude(tau) {
  const tau2 = tau * tau;
  const tau3 = tau2 * tau;
  const tau4 = tau3 * tau;
  let B0sum = 0;
  for (const [A, B, C] of B04) {
    B0sum += A * Math.cos(B + C * tau);
  }
  let B1sum = 0;
  for (const [A, B, C] of B14) {
    B1sum += A * Math.cos(B + C * tau);
  }
  let B2sum = 0;
  for (const [A, B, C] of B24) {
    B2sum += A * Math.cos(B + C * tau);
  }
  let B3sum = 0;
  for (const [A, B, C] of B34) {
    B3sum += A * Math.cos(B + C * tau);
  }
  let B4sum = 0;
  for (const [A, B, C] of B44) {
    B4sum += A * Math.cos(B + C * tau);
  }
  const B_rad = (B0sum + B1sum * tau + B2sum * tau2 + B3sum * tau3 + B4sum * tau4) / 1e8;
  return B_rad;
}
function neptuneHeliocentricDistance(tau) {
  const tau2 = tau * tau;
  const tau3 = tau2 * tau;
  let R0sum = 0;
  for (const [A, B, C] of R04) {
    R0sum += A * Math.cos(B + C * tau);
  }
  let R1sum = 0;
  for (const [A, B, C] of R14) {
    R1sum += A * Math.cos(B + C * tau);
  }
  let R2sum = 0;
  for (const [A, B, C] of R24) {
    R2sum += A * Math.cos(B + C * tau);
  }
  let R3sum = 0;
  for (const [A, B, C] of R34) {
    R3sum += A * Math.cos(B + C * tau);
  }
  const R = (R0sum + R1sum * tau + R2sum * tau2 + R3sum * tau3) / 1e8;
  return R;
}
function getNeptunePosition(jd, options = {}) {
  const { includeSpeed = true } = options;
  const tau = (jd - J2000_EPOCH) / DAYS_PER_JULIAN_MILLENNIUM;
  const neptuneL = neptuneHeliocentricLongitude(tau);
  const neptuneB = neptuneHeliocentricLatitude(tau);
  const neptuneR = neptuneHeliocentricDistance(tau);
  const earthL = earthHeliocentricLongitude2(tau);
  const earthR = earthHeliocentricDistance2(tau);
  const neptuneX = neptuneR * Math.cos(neptuneB) * Math.cos(neptuneL);
  const neptuneY = neptuneR * Math.cos(neptuneB) * Math.sin(neptuneL);
  const neptuneZ = neptuneR * Math.sin(neptuneB);
  const earthX = earthR * Math.cos(earthL);
  const earthY = earthR * Math.sin(earthL);
  const geoX = neptuneX - earthX;
  const geoY = neptuneY - earthY;
  const geoZ = neptuneZ;
  let geoLon = Math.atan2(geoY, geoX) * RAD_TO_DEG;
  const geoLat = Math.atan2(geoZ, Math.sqrt(geoX * geoX + geoY * geoY)) * RAD_TO_DEG;
  const geoDist = Math.sqrt(geoX * geoX + geoY * geoY + geoZ * geoZ);
  while (geoLon < 0) geoLon += 360;
  while (geoLon >= 360) geoLon -= 360;
  const aberration = -5694e-6;
  geoLon += aberration;
  while (geoLon < 0) geoLon += 360;
  while (geoLon >= 360) geoLon -= 360;
  let longitudeSpeed = 0;
  let isRetrograde5 = false;
  if (includeSpeed) {
    const dt = 0.01;
    const pos1 = getNeptunePosition(jd - dt, { includeSpeed: false });
    const pos2 = getNeptunePosition(jd + dt, { includeSpeed: false });
    let lonDiff = pos2.longitude - pos1.longitude;
    if (lonDiff > 180) lonDiff -= 360;
    if (lonDiff < -180) lonDiff += 360;
    longitudeSpeed = lonDiff / (2 * dt);
    isRetrograde5 = longitudeSpeed < 0;
  }
  return {
    longitude: geoLon,
    latitude: geoLat,
    distance: geoDist,
    longitudeSpeed,
    isRetrograde: isRetrograde5
  };
}
function earthHeliocentricLongitude2(tau) {
  const tau2 = tau * tau;
  const earthL0 = [
    [175347046, 0, 0],
    [3341656, 4.6692568, 6283.07585],
    [34894, 4.6261, 12566.1517],
    [3497, 2.7441, 5753.3849],
    [3418, 2.8289, 3.5231],
    [3136, 3.6277, 77713.7715],
    [2676, 4.4181, 7860.4194],
    [2343, 6.1352, 3930.2097],
    [1324, 0.7425, 11506.7698],
    [1273, 2.0371, 529.691],
    [1199, 1.1096, 1577.3435]
  ];
  const earthL1 = [
    [628331966747, 0, 0],
    [206059, 2.678235, 6283.07585],
    [4303, 2.6351, 12566.1517]
  ];
  const earthL2 = [
    [8722, 1.0725, 6283.0758],
    [991, 3.1416, 0]
  ];
  let L0sum = 0;
  for (const [A, B, C] of earthL0) {
    L0sum += A * Math.cos(B + C * tau);
  }
  let L1sum = 0;
  for (const [A, B, C] of earthL1) {
    L1sum += A * Math.cos(B + C * tau);
  }
  let L2sum = 0;
  for (const [A, B, C] of earthL2) {
    L2sum += A * Math.cos(B + C * tau);
  }
  return (L0sum + L1sum * tau + L2sum * tau2) / 1e8;
}
function earthHeliocentricDistance2(tau) {
  const earthR0 = [
    [100013989, 0, 0],
    [1670700, 3.0984635, 6283.07585],
    [13956, 3.05525, 12566.1517],
    [3084, 5.1985, 77713.7715],
    [1628, 1.1739, 5753.3849],
    [1576, 2.8469, 7860.4194],
    [925, 5.453, 11506.77],
    [542, 4.564, 3930.21]
  ];
  const earthR1 = [
    [103019, 1.10749, 6283.07585],
    [1721, 1.0644, 12566.1517]
  ];
  let R0sum = 0;
  for (const [A, B, C] of earthR0) {
    R0sum += A * Math.cos(B + C * tau);
  }
  let R1sum = 0;
  for (const [A, B, C] of earthR1) {
    R1sum += A * Math.cos(B + C * tau);
  }
  return (R0sum + R1sum * tau) / 1e8;
}
var NEPTUNE_ORBITAL_ELEMENTS = {
  /** Semi-major axis in AU */
  semiMajorAxis: 30.07,
  /** Orbital eccentricity (nearly circular - lowest of all planets!) */
  eccentricity: 86e-4,
  /** Orbital inclination in degrees */
  inclination: 1.77,
  /** Orbital period in days */
  orbitalPeriod: 60190,
  /** Orbital period in years */
  orbitalPeriodYears: 164.8,
  /** Synodic period in days (time between oppositions) */
  synodicPeriod: 367.49
};

// src/ephemeris/planets/pluto.ts
var PLUTO_ARGS = [
  [0, 0, 1, -19799805, 19850055, -5452852, -14974862, 66865439, 68951812],
  [0, 0, 2, 897144, -4954829, 3527812, 1672790, -11827535, -332538],
  [0, 0, 3, 611149, 1211027, -1050748, 327647, 1593179, -1438890],
  [0, 0, 4, -341243, -189585, 178690, -292153, -18444, 483220],
  [0, 0, 5, 129287, -34992, 18650, 100340, -65977, -85431],
  [0, 0, 6, -38164, 30893, -30697, -25823, 31174, -6032],
  [0, 1, -1, 20442, -9987, 4878, 11248, -5794, 22161],
  [0, 1, 0, -4063, -5071, 226, -64, 4601, 4032],
  [0, 1, 1, -6016, -3336, 2030, -836, -1729, 234],
  [0, 1, 2, -3956, 3039, 69, -604, -415, 702],
  [0, 1, 3, -667, 3572, -247, -567, 239, 723],
  [0, 2, -2, 1276, 501, -57, 1, 67, -67],
  [0, 2, -1, 1152, -917, -122, 175, 1034, -451],
  [0, 2, 0, 630, -1277, -49, -164, -129, 504],
  [1, -1, 0, 2571, -459, -197, 199, 480, -231],
  [1, -1, 1, 899, -1449, -25, 217, 2, -441],
  [1, 0, -3, -1016, 1043, 589, -248, -3359, 265],
  [1, 0, -2, -2343, -1012, -269, 711, 7856, -7832],
  [1, 0, -1, 7042, 788, 185, 193, 36, 45763],
  [1, 0, 0, 1199, -338, 315, 807, 8663, 8547],
  [1, 0, 1, 418, -67, -130, -43, -809, -769],
  [1, 0, 2, 120, -274, 5, 3, 263, -144],
  [1, 0, 3, -60, -159, 2, 17, -126, 32],
  [1, 0, 4, -82, -29, 2, 5, -35, -16],
  [1, 1, -3, -36, -29, 2, 3, -19, -4],
  [1, 1, -2, -40, 7, 3, 1, -15, 8],
  [1, 1, -1, -14, 22, 2, -1, -4, 12],
  [1, 1, 0, 4, 13, 1, -1, 5, 6],
  [1, 1, 1, 5, 2, 0, -1, 3, 1],
  [1, 1, 3, -1, 0, 0, 0, 6, -2],
  [2, 0, -6, 2, 0, 0, -2, 2, 2],
  [2, 0, -5, -4, 5, 2, 2, -2, -2],
  [2, 0, -4, 4, -7, -7, 0, 14, 13],
  [2, 0, -3, 14, 24, 10, -8, -63, 13],
  [2, 0, -2, -49, -34, -3, 20, 136, -236],
  [2, 0, -1, 163, -48, 6, 5, 273, 1065],
  [2, 0, 0, 9, -24, 14, 17, 251, 149],
  [2, 0, 1, -4, 1, -2, 0, -25, -9],
  [2, 0, 2, -3, 1, 0, 0, 9, -2],
  [2, 0, 3, 1, 3, 0, 0, -8, 7],
  [3, 0, -2, -3, -1, 0, 1, 2, -10],
  [3, 0, -1, 5, -3, 0, 0, 19, 35],
  [3, 0, 0, 0, 0, 1, 0, 10, 3]
];
function plutoHeliocentric(jd) {
  const T = (jd - J2000_EPOCH) / DAYS_PER_JULIAN_CENTURY;
  const J = 34.35 + 3034.9057 * T;
  const S = 50.08 + 1222.1138 * T;
  const P = 238.96 + 144.96 * T;
  const Jrad = J * DEG_TO_RAD;
  const Srad = S * DEG_TO_RAD;
  const Prad = P * DEG_TO_RAD;
  let lonSum = 0;
  let latSum = 0;
  let radSum = 0;
  for (const [iJ, iS, iP, lonSin, lonCos, latSin, latCos, radSin, radCos] of PLUTO_ARGS) {
    const arg = iJ * Jrad + iS * Srad + iP * Prad;
    const sinArg = Math.sin(arg);
    const cosArg = Math.cos(arg);
    lonSum += lonSin * sinArg + lonCos * cosArg;
    latSum += latSin * sinArg + latCos * cosArg;
    radSum += radSin * sinArg + radCos * cosArg;
  }
  const L = (238.958116 + 144.96 * T + lonSum / 1e6) * DEG_TO_RAD;
  const B = (-3.908239 + latSum / 1e6) * DEG_TO_RAD;
  const R = 40.7241346 + radSum / 1e7;
  return { L, B, R };
}
function getPlutoPosition(jd, options = {}) {
  const { includeSpeed = true } = options;
  const pluto = plutoHeliocentric(jd);
  const tau = (jd - J2000_EPOCH) / 365250;
  const earthL = earthHeliocentricLongitude3(tau);
  const earthR = earthHeliocentricDistance3(tau);
  const plutoX = pluto.R * Math.cos(pluto.B) * Math.cos(pluto.L);
  const plutoY = pluto.R * Math.cos(pluto.B) * Math.sin(pluto.L);
  const plutoZ = pluto.R * Math.sin(pluto.B);
  const earthX = earthR * Math.cos(earthL);
  const earthY = earthR * Math.sin(earthL);
  const geoX = plutoX - earthX;
  const geoY = plutoY - earthY;
  const geoZ = plutoZ;
  let geoLon = Math.atan2(geoY, geoX) * RAD_TO_DEG;
  const geoLat = Math.atan2(geoZ, Math.sqrt(geoX * geoX + geoY * geoY)) * RAD_TO_DEG;
  const geoDist = Math.sqrt(geoX * geoX + geoY * geoY + geoZ * geoZ);
  while (geoLon < 0) geoLon += 360;
  while (geoLon >= 360) geoLon -= 360;
  const aberration = -5694e-6;
  geoLon += aberration;
  while (geoLon < 0) geoLon += 360;
  while (geoLon >= 360) geoLon -= 360;
  let longitudeSpeed = 0;
  let isRetrograde5 = false;
  if (includeSpeed) {
    const dt = 0.01;
    const pos1 = getPlutoPosition(jd - dt, { includeSpeed: false });
    const pos2 = getPlutoPosition(jd + dt, { includeSpeed: false });
    let lonDiff = pos2.longitude - pos1.longitude;
    if (lonDiff > 180) lonDiff -= 360;
    if (lonDiff < -180) lonDiff += 360;
    longitudeSpeed = lonDiff / (2 * dt);
    isRetrograde5 = longitudeSpeed < 0;
  }
  return {
    longitude: geoLon,
    latitude: geoLat,
    distance: geoDist,
    longitudeSpeed,
    isRetrograde: isRetrograde5
  };
}
function plutoHeliocentricLongitude(jd) {
  const { L } = plutoHeliocentric(jd);
  let lon = L * RAD_TO_DEG;
  while (lon < 0) lon += 360;
  while (lon >= 360) lon -= 360;
  return lon;
}
function plutoHeliocentricLatitude(jd) {
  const { B } = plutoHeliocentric(jd);
  return B * RAD_TO_DEG;
}
function plutoHeliocentricDistance(jd) {
  const { R } = plutoHeliocentric(jd);
  return R;
}
function earthHeliocentricLongitude3(tau) {
  const tau2 = tau * tau;
  const earthL0 = [
    [175347046, 0, 0],
    [3341656, 4.6692568, 6283.07585],
    [34894, 4.6261, 12566.1517],
    [3497, 2.7441, 5753.3849],
    [3418, 2.8289, 3.5231],
    [3136, 3.6277, 77713.7715],
    [2676, 4.4181, 7860.4194],
    [2343, 6.1352, 3930.2097],
    [1324, 0.7425, 11506.7698],
    [1273, 2.0371, 529.691],
    [1199, 1.1096, 1577.3435]
  ];
  const earthL1 = [
    [628331966747, 0, 0],
    [206059, 2.678235, 6283.07585],
    [4303, 2.6351, 12566.1517]
  ];
  const earthL2 = [
    [8722, 1.0725, 6283.0758],
    [991, 3.1416, 0]
  ];
  let L0sum = 0;
  for (const [A, B, C] of earthL0) {
    L0sum += A * Math.cos(B + C * tau);
  }
  let L1sum = 0;
  for (const [A, B, C] of earthL1) {
    L1sum += A * Math.cos(B + C * tau);
  }
  let L2sum = 0;
  for (const [A, B, C] of earthL2) {
    L2sum += A * Math.cos(B + C * tau);
  }
  return (L0sum + L1sum * tau + L2sum * tau2) / 1e8;
}
function earthHeliocentricDistance3(tau) {
  const earthR0 = [
    [100013989, 0, 0],
    [1670700, 3.0984635, 6283.07585],
    [13956, 3.05525, 12566.1517],
    [3084, 5.1985, 77713.7715],
    [1628, 1.1739, 5753.3849],
    [1576, 2.8469, 7860.4194],
    [925, 5.453, 11506.77],
    [542, 4.564, 3930.21]
  ];
  const earthR1 = [
    [103019, 1.10749, 6283.07585],
    [1721, 1.0644, 12566.1517]
  ];
  let R0sum = 0;
  for (const [A, B, C] of earthR0) {
    R0sum += A * Math.cos(B + C * tau);
  }
  let R1sum = 0;
  for (const [A, B, C] of earthR1) {
    R1sum += A * Math.cos(B + C * tau);
  }
  return (R0sum + R1sum * tau) / 1e8;
}
var PLUTO_ORBITAL_ELEMENTS = {
  /** Semi-major axis in AU */
  semiMajorAxis: 39.48,
  /** Orbital eccentricity (highly eccentric!) */
  eccentricity: 0.2488,
  /** Orbital inclination in degrees (highly inclined!) */
  inclination: 17.16,
  /** Orbital period in days */
  orbitalPeriod: 90560,
  /** Orbital period in years */
  orbitalPeriodYears: 248,
  /** Synodic period in days (time between oppositions) */
  synodicPeriod: 366.73,
  /** Perihelion distance in AU (inside Neptune's orbit!) */
  perihelion: 29.66,
  /** Aphelion distance in AU */
  aphelion: 49.31
};

// src/ephemeris/planets/saturn.ts
var L05 = [
  [87401354, 0, 0],
  [11107660, 3.9620509, 213.29909544],
  [1414151, 4.5858152, 7.113547],
  [398379, 0.52112, 206.185548],
  [350769, 3.303299, 426.598191],
  [206816, 0.246584, 103.092774],
  [79271, 3.84007, 220.41264],
  [23990, 4.66977, 110.20632],
  [16574, 0.43719, 419.48464],
  [15820, 0.93809, 632.78374],
  [15054, 2.7167, 639.89729],
  [14907, 5.76903, 316.39187],
  [14610, 1.56519, 3.93215],
  [13160, 4.44891, 14.22709],
  [13005, 5.98119, 11.0457],
  [10725, 3.1294, 202.2534],
  [6126, 1.7633, 277.035],
  [5863, 0.2366, 529.691],
  [5228, 4.2078, 3.1814],
  [5020, 3.1779, 433.7117],
  [4593, 0.6198, 199.072],
  [4006, 2.2448, 63.7359],
  [3874, 3.2228, 138.5175],
  [3269, 0.7749, 949.1756],
  [2954, 0.9828, 95.9792],
  [2461, 2.0316, 735.8765],
  [1758, 3.2658, 522.5774],
  [1640, 5.505, 846.0828],
  [1581, 4.3727, 309.2783],
  [1391, 4.0233, 323.5054],
  [1124, 2.8373, 415.5525],
  [1087, 4.1834, 2.4477],
  [1017, 3.717, 227.5262],
  [957, 0.507, 1265.567],
  [853, 3.421, 175.166],
  [849, 3.191, 209.367],
  [789, 5.007, 0.963],
  [749, 2.144, 853.196],
  [744, 5.253, 224.345],
  [687, 1.747, 1052.268],
  [654, 1.599, 0.048],
  [634, 2.299, 412.371],
  [625, 0.97, 210.118],
  [580, 3.093, 74.782],
  [546, 2.127, 350.332],
  [543, 1.518, 9.561],
  [530, 4.449, 117.32],
  [478, 2.965, 137.033],
  [474, 5.475, 742.99],
  [452, 1.044, 490.334],
  [449, 1.29, 127.472],
  [372, 2.278, 217.231],
  [355, 3.013, 838.969],
  [347, 1.539, 340.771],
  [343, 0.246, 0.521],
  [330, 0.247, 1581.959],
  [322, 0.961, 203.738]
];
var L15 = [
  [21354295596, 0, 0],
  [1296855, 1.8282054, 213.2990954],
  [564348, 2.885001, 7.113547],
  [107679, 2.277699, 206.185548],
  [98323, 1.0807, 426.59819],
  [40255, 2.04128, 220.41264],
  [31394, 2.58538, 14.22709],
  [24857, 1.51952, 103.09277],
  [18328, 6.02959, 639.89729],
  [16829, 4.67481, 419.48464],
  [12598, 6.26637, 110.20632],
  [11826, 1.82503, 11.0457],
  [11681, 5.93299, 433.71174],
  [8871, 2.1785, 316.3919],
  [8837, 3.3036, 632.7837],
  [5765, 1.9609, 529.691],
  [5348, 4.4397, 3.9322],
  [5015, 5.4308, 199.072],
  [4552, 5.7559, 3.1814],
  [3784, 3.6657, 227.5262],
  [3415, 6.0535, 202.2534],
  [3228, 5.2396, 95.9792],
  [3039, 2.5929, 323.5054],
  [2917, 6.0681, 522.5774],
  [2765, 0.9804, 735.8765],
  [2759, 0.8249, 309.2783],
  [2610, 2.9258, 846.0828],
  [2474, 3.4564, 949.1756],
  [1883, 0.0649, 138.5175],
  [1838, 2.1895, 1265.5675],
  [1766, 3.4562, 63.7359],
  [1749, 4.7565, 277.035],
  [1508, 5.8041, 1052.2684],
  [1440, 0.7976, 853.1964],
  [1306, 4.1825, 412.3711],
  [1247, 5.4133, 224.3448],
  [1207, 5.0702, 515.4639],
  [1165, 5.2102, 117.3199],
  [1140, 4.5182, 490.3341],
  [1129, 2.3982, 127.4718],
  [1096, 1.0267, 210.1177],
  [1078, 2.3099, 1581.9593],
  [1004, 3.0276, 1155.3612],
  [965, 5.629, 209.367],
  [934, 2.606, 742.99],
  [905, 0.02, 9.561],
  [904, 1.148, 175.166],
  [835, 3.974, 1059.382],
  [763, 4.999, 1045.155],
  [727, 4.068, 1368.66],
  [686, 1.565, 74.782],
  [621, 1.371, 137.033],
  [589, 4.194, 2.448],
  [576, 4.533, 216.48],
  [554, 0.831, 217.231],
  [530, 2.111, 191.208]
];
var L25 = [
  [116441, 1.179879, 7.113547],
  [91921, 0.07425, 213.2991],
  [90592, 0, 0],
  [15277, 4.06492, 206.18555],
  [10631, 0.25778, 220.41264],
  [10605, 5.40964, 426.59819],
  [4265, 1.046, 14.2271],
  [1216, 2.9186, 103.0928],
  [1165, 4.6094, 639.8973],
  [1082, 5.6913, 433.7117],
  [1045, 4.0421, 199.072],
  [1020, 0.6337, 3.1814],
  [1017, 4.189, 419.4846],
  [956, 5.243, 227.526],
  [825, 4.033, 110.206],
  [806, 3.312, 316.392],
  [741, 0.765, 632.784],
  [677, 5.728, 529.691],
  [567, 4.665, 11.046],
  [485, 2.469, 949.176],
  [469, 4.71, 522.577],
  [445, 0.403, 323.505],
  [416, 5.368, 728.763],
  [402, 4.605, 309.278],
  [347, 4.681, 846.083],
  [338, 3.168, 95.979],
  [261, 5.343, 735.877],
  [247, 3.923, 942.062],
  [220, 4.842, 1265.567],
  [203, 5.6, 1052.268],
  [200, 4.439, 1045.155]
];
var L35 = [
  [16039, 5.73945, 7.11355],
  [4250, 4.5854, 213.2991],
  [1907, 4.7608, 220.4126],
  [1466, 5.9133, 206.1855],
  [1162, 5.6197, 14.2271],
  [1067, 3.6082, 426.5982],
  [239, 3.861, 433.712],
  [237, 5.768, 199.072],
  [166, 5.116, 3.181],
  [151, 2.736, 639.897],
  [131, 4.743, 227.526],
  [63, 0.23, 419.48],
  [62, 4.74, 103.09],
  [40, 5.47, 316.39],
  [40, 5.96, 949.18],
  [39, 5.83, 110.21],
  [28, 3.01, 95.98],
  [25, 0.99, 632.78],
  [22, 2.38, 522.58]
];
var L45 = [
  [1662, 3.9983, 7.1135],
  [257, 2.984, 220.413],
  [236, 3.902, 14.227],
  [149, 2.741, 213.299],
  [114, 3.142, 0],
  [110, 1.515, 206.186],
  [68, 1.72, 426.6],
  [40, 2.05, 433.71],
  [38, 1.24, 199.07],
  [31, 3.01, 227.53],
  [15, 0.83, 639.9],
  [9, 3.71, 316.39],
  [6, 2.42, 419.48]
];
var L54 = [
  [124, 2.259, 7.114],
  [34, 2.16, 14.23],
  [28, 1.2, 220.41],
  [6, 1.22, 227.53],
  [5, 0.24, 433.71],
  [4, 6.23, 426.6],
  [3, 2.97, 199.07]
];
var B05 = [
  [4330678, 3.6028443, 213.2990954],
  [240348, 2.852385, 426.598191],
  [84746, 0, 0],
  [34116, 0.57297, 206.18555],
  [30863, 3.48442, 220.41264],
  [14734, 2.11847, 639.89729],
  [9917, 5.79, 419.4846],
  [6994, 4.736, 7.1135],
  [4808, 5.4331, 316.3919],
  [4788, 4.9651, 110.2063],
  [3432, 2.7326, 433.7117],
  [1506, 6.013, 103.0928],
  [1060, 5.631, 529.691],
  [969, 5.204, 632.784],
  [942, 1.396, 853.196],
  [708, 3.803, 323.505],
  [552, 5.131, 202.253],
  [400, 3.359, 227.526],
  [319, 3.626, 209.367],
  [316, 1.997, 647.011],
  [314, 0.465, 217.231],
  [284, 4.886, 224.345],
  [236, 2.139, 11.046],
  [215, 5.95, 846.083],
  [209, 2.12, 415.552],
  [207, 0.73, 199.072],
  [179, 2.954, 63.736],
  [141, 0.644, 490.334],
  [139, 4.595, 14.227],
  [139, 1.998, 735.877],
  [135, 5.245, 742.99],
  [122, 3.115, 522.577],
  [116, 3.109, 216.48]
];
var B15 = [
  [397555, 5.3329, 213.299095],
  [49479, 3.14159, 0],
  [18572, 6.09919, 426.59819],
  [14801, 2.30586, 206.18555],
  [9644, 1.6967, 220.4126],
  [3757, 1.2543, 419.4846],
  [2717, 5.9117, 639.8973],
  [1455, 0.8516, 433.7117],
  [1291, 2.9177, 7.1135],
  [853, 0.436, 316.392],
  [298, 0.919, 632.784],
  [292, 5.316, 853.196],
  [284, 1.619, 227.526],
  [275, 3.889, 103.093],
  [172, 0.052, 647.011],
  [166, 2.444, 199.072],
  [158, 5.209, 110.206],
  [128, 1.207, 529.691],
  [110, 2.457, 217.231],
  [82, 2.76, 210.12],
  [81, 2.86, 14.23],
  [69, 1.66, 202.25],
  [65, 1.26, 216.48],
  [61, 1.25, 209.37],
  [59, 1.82, 323.51],
  [46, 0.82, 440.83],
  [36, 1.82, 224.34]
];
var B25 = [
  [20630, 0.50482, 213.2991],
  [3720, 3.9983, 206.1855],
  [1627, 6.1819, 220.4126],
  [1346, 0, 0],
  [706, 3.039, 419.485],
  [365, 5.099, 426.598],
  [330, 5.279, 433.712],
  [219, 3.828, 639.897],
  [139, 1.043, 7.114],
  [104, 6.157, 227.526],
  [93, 1.98, 316.39],
  [71, 4.15, 199.07],
  [52, 2.88, 632.78],
  [49, 4.43, 647.01],
  [41, 3.16, 853.2],
  [29, 4.53, 210.12],
  [24, 1.12, 14.23]
];
var B35 = [
  [666, 1.99, 213.299],
  [632, 5.698, 206.186],
  [398, 0, 0],
  [188, 4.338, 220.413],
  [92, 4.84, 419.48],
  [52, 3.42, 433.71],
  [42, 2.38, 426.6],
  [26, 4.4, 227.53],
  [21, 5.85, 639.9],
  [18, 1.99, 7.11],
  [11, 5.37, 199.07],
  [10, 2.55, 647.01]
];
var B45 = [
  [80, 1.12, 206.19],
  [32, 3.12, 213.3],
  [17, 2.48, 220.41],
  [12, 3.14, 0],
  [9, 0.38, 419.48],
  [6, 1.56, 433.71],
  [5, 2.63, 227.53]
];
var B5 = [
  [8, 2.82, 206.19],
  [1, 0.51, 220.41]
];
var R05 = [
  [955758136, 0, 0],
  [52921382, 2.3922622, 213.29909544],
  [1873680, 5.2354961, 206.1855484],
  [1464664, 1.6476305, 426.5981909],
  [821891, 5.9352, 316.39187],
  [547507, 5.015326, 103.092774],
  [371684, 2.271148, 220.412642],
  [361778, 3.139043, 7.113547],
  [140618, 5.704067, 632.783739],
  [108975, 3.293136, 110.206321],
  [69007, 5.941, 419.48464],
  [61053, 0.94038, 639.89729],
  [48913, 1.55733, 202.2534],
  [34144, 0.19519, 277.03499],
  [32402, 5.47085, 949.17561],
  [20937, 0.46349, 735.87651],
  [20839, 1.52103, 433.71174],
  [20747, 5.33256, 199.072],
  [15298, 3.05944, 529.69097],
  [14296, 2.60434, 323.50542],
  [12884, 1.64892, 138.5175],
  [11993, 5.98051, 846.08283],
  [11380, 1.73106, 522.57742],
  [9796, 5.2048, 1265.5675],
  [7753, 5.8519, 95.9792],
  [6771, 3.0043, 14.2271],
  [6466, 0.1773, 1052.2684],
  [5850, 1.4552, 415.5525],
  [5307, 0.5974, 63.7359],
  [4696, 2.1492, 227.5262],
  [4044, 1.6401, 209.3669],
  [3688, 0.7802, 412.3711],
  [3461, 1.8509, 175.1661],
  [3420, 4.9455, 1581.9593],
  [3401, 0.5539, 350.3321],
  [3376, 3.6953, 224.3448],
  [2976, 5.6847, 210.1177],
  [2885, 1.3876, 838.9693],
  [2881, 0.1796, 853.1964],
  [2508, 3.5385, 742.9901],
  [2448, 6.1841, 1368.6603],
  [2406, 2.9656, 117.3199],
  [2174, 0.0151, 340.7709],
  [2024, 5.0541, 11.0457]
];
var R15 = [
  [6182981, 0.2584352, 213.2990954],
  [506578, 0.711147, 206.185548],
  [341394, 5.796358, 426.598191],
  [188491, 0.472157, 220.412642],
  [186262, 3.141593, 0],
  [143891, 1.407449, 7.113547],
  [49621, 6.01744, 103.09277],
  [38717, 1.66041, 639.89729],
  [35324, 1.77031, 419.48464],
  [31992, 1.11926, 110.20632],
  [29994, 0.04163, 199.072],
  [23871, 4.75474, 316.39187],
  [17756, 0.96688, 632.78374],
  [14564, 1.03497, 949.17561],
  [13699, 3.67685, 433.71174],
  [12945, 5.1232, 529.69097],
  [11183, 2.47615, 14.22709],
  [9661, 3.8194, 323.5054],
  [9352, 5.6165, 202.2534],
  [8410, 4.4683, 522.5774],
  [7550, 1.0201, 735.8765],
  [6241, 2.1327, 412.3711],
  [6137, 5.0064, 846.0828],
  [5764, 1.0397, 1265.5675],
  [4848, 0.2673, 95.9792],
  [4559, 4.1723, 1052.2684],
  [4505, 5.8092, 227.5262],
  [4261, 5.0461, 515.4639],
  [4057, 2.4831, 63.7359],
  [3784, 3.7086, 1066.4955],
  [3717, 5.0806, 1581.9593],
  [3605, 2.8266, 210.1177],
  [3550, 3.6285, 209.3669],
  [3468, 5.6755, 309.2783]
];
var R25 = [
  [436902, 4.786717, 213.299095],
  [71923, 2.5007, 206.18555],
  [49767, 4.97168, 220.41264],
  [43221, 3.8694, 426.59819],
  [29646, 5.9631, 7.11355],
  [4721, 2.4753, 199.072],
  [4142, 4.1067, 433.7117],
  [3789, 3.0977, 639.8973],
  [2964, 1.3721, 103.0928],
  [2556, 2.8507, 419.4846],
  [2327, 0, 0],
  [2208, 6.2759, 110.2063],
  [2188, 5.8555, 14.2271],
  [1957, 4.9245, 227.5262],
  [924, 5.464, 323.505],
  [706, 2.971, 95.979],
  [546, 4.129, 412.371],
  [431, 5.178, 522.577],
  [405, 4.173, 209.367],
  [391, 4.481, 316.392],
  [374, 5.834, 117.32],
  [361, 3.277, 647.011],
  [356, 3.192, 210.118],
  [326, 2.269, 853.196],
  [207, 4.022, 735.877],
  [204, 0.088, 202.253],
  [180, 3.597, 632.784]
];
var R35 = [
  [20315, 3.02187, 213.2991],
  [8924, 3.1914, 220.4126],
  [6909, 4.3517, 206.1855],
  [4087, 4.2241, 7.1135],
  [3879, 2.0106, 426.5982],
  [1071, 4.2036, 199.072],
  [907, 2.283, 433.712],
  [606, 3.175, 227.526],
  [597, 4.135, 14.227],
  [483, 1.173, 639.897],
  [393, 0, 0],
  [229, 4.698, 419.485],
  [188, 4.59, 110.206],
  [150, 3.202, 103.093],
  [121, 3.768, 323.505],
  [102, 4.71, 95.979],
  [101, 5.819, 412.371]
];
var R43 = [
  [1202, 1.415, 220.4126],
  [708, 1.162, 213.299],
  [516, 6.24, 206.186],
  [427, 2.469, 7.114],
  [268, 0.187, 426.598],
  [170, 5.959, 199.072],
  [150, 0.48, 433.712],
  [145, 1.442, 227.526],
  [121, 2.405, 14.227],
  [47, 5.57, 639.9],
  [19, 5.86, 647.01],
  [17, 0.53, 440.83],
  [16, 2.9, 110.21],
  [15, 0.3, 419.48],
  [14, 1.3, 412.37],
  [13, 2.09, 323.51],
  [11, 0.22, 95.98],
  [11, 2.46, 117.32]
];
var R52 = [
  [129, 5.913, 220.413],
  [32, 0.69, 7.11],
  [27, 5.91, 227.53],
  [20, 4.95, 433.71],
  [20, 0.67, 14.23],
  [14, 2.67, 206.19],
  [14, 1.46, 199.07],
  [13, 4.59, 426.6],
  [7, 4.63, 213.3],
  [5, 3.61, 639.9]
];
function saturnHeliocentricLongitude(tau) {
  const tau2 = tau * tau;
  const tau3 = tau2 * tau;
  const tau4 = tau3 * tau;
  const tau5 = tau4 * tau;
  let L0sum = 0;
  for (const [A, B, C] of L05) {
    L0sum += A * Math.cos(B + C * tau);
  }
  let L1sum = 0;
  for (const [A, B, C] of L15) {
    L1sum += A * Math.cos(B + C * tau);
  }
  let L2sum = 0;
  for (const [A, B, C] of L25) {
    L2sum += A * Math.cos(B + C * tau);
  }
  let L3sum = 0;
  for (const [A, B, C] of L35) {
    L3sum += A * Math.cos(B + C * tau);
  }
  let L4sum = 0;
  for (const [A, B, C] of L45) {
    L4sum += A * Math.cos(B + C * tau);
  }
  let L5sum = 0;
  for (const [A, B, C] of L54) {
    L5sum += A * Math.cos(B + C * tau);
  }
  const L = (L0sum + L1sum * tau + L2sum * tau2 + L3sum * tau3 + L4sum * tau4 + L5sum * tau5) / 1e8;
  return L;
}
function saturnHeliocentricLatitude(tau) {
  const tau2 = tau * tau;
  const tau3 = tau2 * tau;
  const tau4 = tau3 * tau;
  const tau5 = tau4 * tau;
  let B0sum = 0;
  for (const [A, B, C] of B05) {
    B0sum += A * Math.cos(B + C * tau);
  }
  let B1sum = 0;
  for (const [A, B, C] of B15) {
    B1sum += A * Math.cos(B + C * tau);
  }
  let B2sum = 0;
  for (const [A, B, C] of B25) {
    B2sum += A * Math.cos(B + C * tau);
  }
  let B3sum = 0;
  for (const [A, B, C] of B35) {
    B3sum += A * Math.cos(B + C * tau);
  }
  let B4sum = 0;
  for (const [A, B, C] of B45) {
    B4sum += A * Math.cos(B + C * tau);
  }
  let B5sum = 0;
  for (const [A, B, C] of B5) {
    B5sum += A * Math.cos(B + C * tau);
  }
  const B_rad = (B0sum + B1sum * tau + B2sum * tau2 + B3sum * tau3 + B4sum * tau4 + B5sum * tau5) / 1e8;
  return B_rad;
}
function saturnHeliocentricDistance(tau) {
  const tau2 = tau * tau;
  const tau3 = tau2 * tau;
  const tau4 = tau3 * tau;
  const tau5 = tau4 * tau;
  let R0sum = 0;
  for (const [A, B, C] of R05) {
    R0sum += A * Math.cos(B + C * tau);
  }
  let R1sum = 0;
  for (const [A, B, C] of R15) {
    R1sum += A * Math.cos(B + C * tau);
  }
  let R2sum = 0;
  for (const [A, B, C] of R25) {
    R2sum += A * Math.cos(B + C * tau);
  }
  let R3sum = 0;
  for (const [A, B, C] of R35) {
    R3sum += A * Math.cos(B + C * tau);
  }
  let R4sum = 0;
  for (const [A, B, C] of R43) {
    R4sum += A * Math.cos(B + C * tau);
  }
  let R5sum = 0;
  for (const [A, B, C] of R52) {
    R5sum += A * Math.cos(B + C * tau);
  }
  const R = (R0sum + R1sum * tau + R2sum * tau2 + R3sum * tau3 + R4sum * tau4 + R5sum * tau5) / 1e8;
  return R;
}
function getSaturnPosition(jd, options = {}) {
  const { includeSpeed = true } = options;
  const tau = (jd - J2000_EPOCH) / DAYS_PER_JULIAN_MILLENNIUM;
  const saturnL = saturnHeliocentricLongitude(tau);
  const saturnB = saturnHeliocentricLatitude(tau);
  const saturnR = saturnHeliocentricDistance(tau);
  const earthL = earthHeliocentricLongitude4(tau);
  const earthR = earthHeliocentricDistance4(tau);
  const saturnX = saturnR * Math.cos(saturnB) * Math.cos(saturnL);
  const saturnY = saturnR * Math.cos(saturnB) * Math.sin(saturnL);
  const saturnZ = saturnR * Math.sin(saturnB);
  const earthX = earthR * Math.cos(earthL);
  const earthY = earthR * Math.sin(earthL);
  const geoX = saturnX - earthX;
  const geoY = saturnY - earthY;
  const geoZ = saturnZ;
  let geoLon = Math.atan2(geoY, geoX) * RAD_TO_DEG;
  const geoLat = Math.atan2(geoZ, Math.sqrt(geoX * geoX + geoY * geoY)) * RAD_TO_DEG;
  const geoDist = Math.sqrt(geoX * geoX + geoY * geoY + geoZ * geoZ);
  while (geoLon < 0) geoLon += 360;
  while (geoLon >= 360) geoLon -= 360;
  const aberration = -5694e-6;
  geoLon += aberration;
  while (geoLon < 0) geoLon += 360;
  while (geoLon >= 360) geoLon -= 360;
  let longitudeSpeed = 0;
  let isRetrograde5 = false;
  if (includeSpeed) {
    const dt = 0.01;
    const pos1 = getSaturnPosition(jd - dt, { includeSpeed: false });
    const pos2 = getSaturnPosition(jd + dt, { includeSpeed: false });
    let lonDiff = pos2.longitude - pos1.longitude;
    if (lonDiff > 180) lonDiff -= 360;
    if (lonDiff < -180) lonDiff += 360;
    longitudeSpeed = lonDiff / (2 * dt);
    isRetrograde5 = longitudeSpeed < 0;
  }
  return {
    longitude: geoLon,
    latitude: geoLat,
    distance: geoDist,
    longitudeSpeed,
    isRetrograde: isRetrograde5
  };
}
function earthHeliocentricLongitude4(tau) {
  const tau2 = tau * tau;
  const earthL0 = [
    [175347046, 0, 0],
    [3341656, 4.6692568, 6283.07585],
    [34894, 4.6261, 12566.1517],
    [3497, 2.7441, 5753.3849],
    [3418, 2.8289, 3.5231],
    [3136, 3.6277, 77713.7715],
    [2676, 4.4181, 7860.4194],
    [2343, 6.1352, 3930.2097],
    [1324, 0.7425, 11506.7698],
    [1273, 2.0371, 529.691],
    [1199, 1.1096, 1577.3435]
  ];
  const earthL1 = [
    [628331966747, 0, 0],
    [206059, 2.678235, 6283.07585],
    [4303, 2.6351, 12566.1517]
  ];
  const earthL2 = [
    [8722, 1.0725, 6283.0758],
    [991, 3.1416, 0]
  ];
  let L0sum = 0;
  for (const [A, B, C] of earthL0) {
    L0sum += A * Math.cos(B + C * tau);
  }
  let L1sum = 0;
  for (const [A, B, C] of earthL1) {
    L1sum += A * Math.cos(B + C * tau);
  }
  let L2sum = 0;
  for (const [A, B, C] of earthL2) {
    L2sum += A * Math.cos(B + C * tau);
  }
  return (L0sum + L1sum * tau + L2sum * tau2) / 1e8;
}
function earthHeliocentricDistance4(tau) {
  const earthR0 = [
    [100013989, 0, 0],
    [1670700, 3.0984635, 6283.07585],
    [13956, 3.05525, 12566.1517],
    [3084, 5.1985, 77713.7715],
    [1628, 1.1739, 5753.3849],
    [1576, 2.8469, 7860.4194],
    [925, 5.453, 11506.77],
    [542, 4.564, 3930.21]
  ];
  const earthR1 = [
    [103019, 1.10749, 6283.07585],
    [1721, 1.0644, 12566.1517]
  ];
  let R0sum = 0;
  for (const [A, B, C] of earthR0) {
    R0sum += A * Math.cos(B + C * tau);
  }
  let R1sum = 0;
  for (const [A, B, C] of earthR1) {
    R1sum += A * Math.cos(B + C * tau);
  }
  return (R0sum + R1sum * tau) / 1e8;
}
var SATURN_ORBITAL_ELEMENTS = {
  /** Semi-major axis in AU */
  semiMajorAxis: 9.537,
  /** Orbital eccentricity */
  eccentricity: 0.0539,
  /** Orbital inclination in degrees */
  inclination: 2.49,
  /** Orbital period in days */
  orbitalPeriod: 10759,
  /** Orbital period in years */
  orbitalPeriodYears: 29.46,
  /** Synodic period in days (time between oppositions) */
  synodicPeriod: 378.09
};

// src/ephemeris/planets/uranus.ts
var L06 = [
  [548129294, 0, 0],
  [9260408, 0.8910642, 74.7815986],
  [1504248, 3.6271926, 1.4844727],
  [365982, 1.899622, 73.297126],
  [272328, 3.358237, 149.563197],
  [70328, 5.39254, 63.7359],
  [68893, 6.09292, 76.26607],
  [61999, 2.26952, 2.96895],
  [61951, 2.85099, 11.0457],
  [26469, 3.14152, 71.81265],
  [25711, 6.1138, 454.90937],
  [21079, 4.36059, 148.07872],
  [17819, 1.74437, 36.64856],
  [14613, 4.73732, 3.93215],
  [11163, 5.82682, 224.3448],
  [10998, 0.48865, 138.5175],
  [9527, 2.9552, 35.1641],
  [7546, 5.2363, 109.9457],
  [4220, 3.2333, 70.8494],
  [4052, 2.2775, 151.0477],
  [3490, 5.4831, 146.5943],
  [3355, 1.0655, 4.4534],
  [3144, 4.752, 77.7505],
  [2927, 4.629, 9.5612],
  [2922, 5.3524, 85.8273],
  [2273, 4.366, 70.3282],
  [2149, 0.6075, 38.133],
  [2051, 1.5177, 0.1119],
  [1992, 4.9244, 277.035],
  [1667, 3.6274, 380.1278],
  [1533, 2.5856, 52.6902],
  [1376, 2.0428, 65.2204],
  [1372, 4.1964, 111.4302],
  [1284, 3.1135, 202.2534],
  [1282, 0.5427, 222.8603],
  [1244, 0.9161, 2.4477],
  [1221, 0.199, 108.4612],
  [1151, 4.179, 33.6796],
  [1150, 0.9334, 3.1814],
  [1090, 1.775, 12.5302],
  [1072, 0.2356, 62.2514],
  [946, 1.192, 127.472],
  [708, 5.183, 213.299]
];
var L16 = [
  [7502543122, 0, 0],
  [154458, 5.242017, 74.781599],
  [24456, 1.71256, 1.48447],
  [9258, 0.4284, 11.0457],
  [8266, 1.5022, 63.7359],
  [7842, 1.3198, 149.5632],
  [3899, 0.4648, 3.9322],
  [2284, 4.1737, 76.2661],
  [1927, 0.5301, 2.9689],
  [1233, 1.5863, 70.8494],
  [791, 5.436, 3.181],
  [767, 1.996, 73.297],
  [482, 2.984, 85.827],
  [450, 4.138, 138.517],
  [446, 3.723, 224.345],
  [427, 4.731, 71.813],
  [354, 2.583, 148.079],
  [348, 2.454, 9.561],
  [317, 5.579, 52.69],
  [206, 2.363, 2.448],
  [189, 4.202, 56.622],
  [184, 0.284, 151.048],
  [180, 5.684, 12.53],
  [171, 3.001, 78.714],
  [158, 2.909, 0.963],
  [155, 5.591, 4.453],
  [154, 4.652, 35.164],
  [152, 2.942, 77.751],
  [143, 2.59, 62.251],
  [121, 4.148, 127.472],
  [116, 3.732, 65.22],
  [102, 4.188, 145.631],
  [102, 6.034, 0.112]
];
var L26 = [
  [53033, 0, 0],
  [2358, 2.2601, 74.7816],
  [769, 4.526, 11.046],
  [552, 3.258, 63.736],
  [542, 2.276, 3.932],
  [529, 4.923, 1.484],
  [258, 3.691, 3.181],
  [239, 5.858, 149.563],
  [182, 6.218, 70.849],
  [54, 1.44, 76.27],
  [49, 6.03, 56.62],
  [45, 3.91, 2.45],
  [45, 0.81, 85.83],
  [38, 1.78, 52.69],
  [37, 4.46, 2.97],
  [33, 0.86, 9.56],
  [29, 5.1, 73.3],
  [24, 2.11, 18.16],
  [22, 5.99, 138.52],
  [22, 4.82, 78.71],
  [21, 2.4, 77.96],
  [21, 2.17, 224.34],
  [17, 2.54, 145.63],
  [17, 3.47, 12.53],
  [12, 0.02, 22.09],
  [11, 0.08, 127.47],
  [10, 5.16, 71.6],
  [10, 4.46, 62.25],
  [9, 4.26, 7.11]
];
var L36 = [
  [121, 0.024, 74.782],
  [68, 4.12, 3.93],
  [53, 2.39, 11.05],
  [46, 0, 0],
  [45, 2.04, 3.18],
  [44, 2.96, 1.48],
  [25, 4.89, 63.74],
  [21, 4.55, 70.85],
  [20, 2.31, 149.56],
  [9, 1.58, 56.62],
  [4, 0.23, 18.16],
  [4, 5.39, 76.27],
  [4, 0.95, 77.96],
  [3, 4.98, 85.83],
  [3, 4.13, 52.69],
  [3, 0.37, 78.71],
  [2, 0.86, 145.63],
  [2, 5.66, 9.56]
];
var L46 = [
  [114, 3.142, 0],
  [6, 4.58, 74.78],
  [3, 0.35, 11.05],
  [1, 3.42, 56.62]
];
var L55 = [[1, 3.14, 0]];
var B06 = [
  [1346278, 2.6187781, 74.7815986],
  [62341, 5.08111, 149.5632],
  [61601, 3.14159, 0],
  [9964, 1.616, 76.2661],
  [9926, 0.5763, 73.2971],
  [3259, 1.2612, 224.3448],
  [2972, 2.2437, 1.4845],
  [2010, 6.0555, 148.0787],
  [1522, 0.2796, 63.7359],
  [924, 4.038, 151.048],
  [761, 6.14, 71.813],
  [522, 3.321, 138.517],
  [463, 0.743, 85.827],
  [437, 3.381, 529.691],
  [435, 0.341, 77.751],
  [431, 3.554, 213.299],
  [420, 5.213, 11.046],
  [245, 0.788, 2.969],
  [233, 2.257, 222.86],
  [216, 1.591, 38.133],
  [180, 3.725, 299.126],
  [175, 1.236, 146.594],
  [174, 1.937, 380.128],
  [160, 5.336, 111.43],
  [144, 5.962, 35.164],
  [116, 5.739, 70.849]
];
var B16 = [
  [206366, 4.123943, 74.781599],
  [8563, 0.3382, 149.5632],
  [1726, 2.1219, 73.2971],
  [1374, 0, 0],
  [1369, 3.0686, 76.2661],
  [451, 3.777, 1.484],
  [400, 2.848, 224.345],
  [307, 1.255, 148.079],
  [154, 3.786, 63.736],
  [112, 5.573, 151.048],
  [111, 5.329, 138.517],
  [83, 3.59, 71.81],
  [56, 3.4, 85.83],
  [54, 1.7, 77.75],
  [42, 1.21, 11.05],
  [41, 4.45, 78.71],
  [32, 3.77, 222.86],
  [30, 2.56, 2.97],
  [27, 5.34, 213.3],
  [26, 0.42, 380.13]
];
var B26 = [
  [9212, 5.8004, 74.7816],
  [557, 0, 0],
  [286, 2.177, 149.563],
  [95, 3.84, 73.3],
  [45, 4.88, 76.27],
  [20, 5.46, 1.48],
  [15, 0.88, 138.52],
  [14, 2.85, 148.08],
  [14, 5.07, 63.74],
  [10, 5, 224.34],
  [8, 6.27, 78.71]
];
var B36 = [
  [268, 1.251, 74.782],
  [11, 3.14, 0],
  [6, 4.01, 149.56],
  [3, 5.78, 73.3]
];
var B46 = [[6, 2.85, 74.78]];
var R06 = [
  [1921264848, 0, 0],
  [88784984, 5.60377527, 74.78159857],
  [3440836, 0.328361, 73.2971259],
  [2055653, 1.7829517, 149.5631971],
  [649322, 4.522473, 76.266071],
  [602248, 3.860038, 63.735898],
  [496404, 1.401399, 454.909367],
  [338526, 1.580027, 138.517497],
  [243508, 1.570866, 71.812653],
  [190522, 1.998094, 1.484473],
  [161858, 2.791379, 148.078724],
  [143706, 1.383686, 11.0457],
  [93192, 0.17437, 36.64856],
  [89806, 3.66105, 109.94569],
  [71424, 4.24509, 224.3448],
  [46677, 1.39977, 35.16409],
  [39026, 3.36235, 277.03499],
  [39010, 1.66971, 70.84945],
  [36755, 3.88649, 146.59425],
  [30349, 0.701, 151.04767],
  [29156, 3.18056, 77.75054],
  [25786, 3.78538, 85.8273],
  [25620, 5.25656, 380.12777],
  [22637, 0.72519, 529.69097],
  [20473, 2.7964, 70.32818],
  [20472, 1.55589, 202.2534],
  [17901, 0.55455, 2.96895],
  [15503, 5.35405, 38.13304],
  [14702, 4.90434, 108.46122],
  [12897, 2.62154, 111.43016],
  [12328, 5.96039, 127.4718],
  [11959, 1.75044, 65.22037],
  [11853, 0.99343, 52.6902],
  [11696, 3.29826, 3.93215],
  [11495, 0.43774, 222.86032],
  [10793, 1.42105, 213.2991],
  [9111, 4.9964, 62.2514],
  [8421, 5.2535, 9.5612],
  [8402, 5.0388, 144.1465],
  [7449, 0.7949, 3.1814],
  [7329, 3.9728, 33.6796],
  [6046, 5.6796, 78.7138],
  [5524, 3.115, 9.5612],
  [5445, 5.1058, 4.4534],
  [5238, 2.6296, 56.6224],
  [4079, 3.2206, 415.5525],
  [3919, 4.2502, 299.1264],
  [3802, 6.1099, 175.1661],
  [3781, 3.4581, 206.1855],
  [3687, 2.4873, 227.5262],
  [3102, 4.1403, 145.631],
  [2963, 0.8298, 135.549],
  [2942, 0.4239, 265.9893],
  [2940, 2.1464, 351.8166],
  [2938, 3.6766, 490.3341],
  [2865, 0.31, 98.8999],
  [2538, 4.8546, 45.5764],
  [2364, 0.4425, 4.1928],
  [2183, 2.9404, 68.8437]
];
var R16 = [
  [1479896, 3.6720571, 74.7815986],
  [71212, 6.22601, 63.7359],
  [68627, 6.13411, 149.5632],
  [24060, 3.14159, 0],
  [21468, 2.60177, 76.26607],
  [20857, 5.24625, 11.0457],
  [11405, 0.01848, 70.84945],
  [7497, 0.4236, 73.2971],
  [4244, 1.4169, 85.8273],
  [3927, 3.1551, 71.8127],
  [3578, 2.3116, 224.3448],
  [3506, 2.5835, 138.5175],
  [3229, 5.255, 3.9322],
  [3060, 0.1532, 1.4845],
  [2564, 0.9808, 148.0787],
  [2429, 3.9944, 52.6902],
  [1645, 2.6535, 127.4718],
  [1584, 1.4305, 78.7138],
  [1508, 5.06, 151.0477],
  [1490, 2.6756, 56.6224],
  [1413, 4.5746, 202.2534],
  [1403, 1.3699, 77.7505],
  [1228, 1.047, 62.2514],
  [1033, 0.2646, 131.4039],
  [992, 2.172, 65.22],
  [862, 5.055, 351.817],
  [744, 3.076, 35.164],
  [687, 2.499, 77.963],
  [647, 4.473, 70.328],
  [624, 0.863, 9.561],
  [604, 0.907, 984.6],
  [575, 3.231, 447.796],
  [562, 2.718, 462.023],
  [530, 5.917, 213.299],
  [528, 5.151, 2.969]
];
var R26 = [
  [22440, 0.69953, 74.7816],
  [4727, 1.699, 63.7359],
  [1682, 4.6483, 70.8494],
  [1650, 3.0966, 11.0457],
  [1434, 3.5212, 149.5632],
  [770, 0, 0],
  [500, 6.172, 76.266],
  [461, 0.767, 3.932],
  [390, 4.496, 56.622],
  [390, 5.527, 85.827],
  [292, 0.204, 52.69],
  [287, 3.534, 73.297],
  [273, 3.847, 138.517],
  [220, 1.964, 131.404],
  [216, 0.848, 77.963],
  [205, 3.248, 78.714],
  [149, 4.898, 127.472],
  [129, 2.081, 3.181]
];
var R36 = [
  [1164, 4.7345, 74.7816],
  [212, 3.343, 63.736],
  [196, 2.98, 70.849],
  [105, 0.958, 11.046],
  [73, 1, 149.56],
  [72, 0.03, 56.62],
  [55, 2.59, 3.93],
  [36, 5.65, 77.96],
  [34, 3.82, 76.27],
  [32, 3.6, 131.4]
];
var R44 = [
  [53, 3.01, 74.78],
  [10, 1.91, 56.62]
];
function uranusHeliocentricLongitude(tau) {
  const tau2 = tau * tau;
  const tau3 = tau2 * tau;
  const tau4 = tau3 * tau;
  const tau5 = tau4 * tau;
  let L0sum = 0;
  for (const [A, B, C] of L06) {
    L0sum += A * Math.cos(B + C * tau);
  }
  let L1sum = 0;
  for (const [A, B, C] of L16) {
    L1sum += A * Math.cos(B + C * tau);
  }
  let L2sum = 0;
  for (const [A, B, C] of L26) {
    L2sum += A * Math.cos(B + C * tau);
  }
  let L3sum = 0;
  for (const [A, B, C] of L36) {
    L3sum += A * Math.cos(B + C * tau);
  }
  let L4sum = 0;
  for (const [A, B, C] of L46) {
    L4sum += A * Math.cos(B + C * tau);
  }
  let L5sum = 0;
  for (const [A, B, C] of L55) {
    L5sum += A * Math.cos(B + C * tau);
  }
  const L = (L0sum + L1sum * tau + L2sum * tau2 + L3sum * tau3 + L4sum * tau4 + L5sum * tau5) / 1e8;
  return L;
}
function uranusHeliocentricLatitude(tau) {
  const tau2 = tau * tau;
  const tau3 = tau2 * tau;
  const tau4 = tau3 * tau;
  let B0sum = 0;
  for (const [A, B, C] of B06) {
    B0sum += A * Math.cos(B + C * tau);
  }
  let B1sum = 0;
  for (const [A, B, C] of B16) {
    B1sum += A * Math.cos(B + C * tau);
  }
  let B2sum = 0;
  for (const [A, B, C] of B26) {
    B2sum += A * Math.cos(B + C * tau);
  }
  let B3sum = 0;
  for (const [A, B, C] of B36) {
    B3sum += A * Math.cos(B + C * tau);
  }
  let B4sum = 0;
  for (const [A, B, C] of B46) {
    B4sum += A * Math.cos(B + C * tau);
  }
  const B_rad = (B0sum + B1sum * tau + B2sum * tau2 + B3sum * tau3 + B4sum * tau4) / 1e8;
  return B_rad;
}
function uranusHeliocentricDistance(tau) {
  const tau2 = tau * tau;
  const tau3 = tau2 * tau;
  const tau4 = tau3 * tau;
  let R0sum = 0;
  for (const [A, B, C] of R06) {
    R0sum += A * Math.cos(B + C * tau);
  }
  let R1sum = 0;
  for (const [A, B, C] of R16) {
    R1sum += A * Math.cos(B + C * tau);
  }
  let R2sum = 0;
  for (const [A, B, C] of R26) {
    R2sum += A * Math.cos(B + C * tau);
  }
  let R3sum = 0;
  for (const [A, B, C] of R36) {
    R3sum += A * Math.cos(B + C * tau);
  }
  let R4sum = 0;
  for (const [A, B, C] of R44) {
    R4sum += A * Math.cos(B + C * tau);
  }
  const R = (R0sum + R1sum * tau + R2sum * tau2 + R3sum * tau3 + R4sum * tau4) / 1e8;
  return R;
}
function getUranusPosition(jd, options = {}) {
  const { includeSpeed = true } = options;
  const tau = (jd - J2000_EPOCH) / DAYS_PER_JULIAN_MILLENNIUM;
  const uranusL = uranusHeliocentricLongitude(tau);
  const uranusB = uranusHeliocentricLatitude(tau);
  const uranusR = uranusHeliocentricDistance(tau);
  const earthL = earthHeliocentricLongitude5(tau);
  const earthR = earthHeliocentricDistance5(tau);
  const uranusX = uranusR * Math.cos(uranusB) * Math.cos(uranusL);
  const uranusY = uranusR * Math.cos(uranusB) * Math.sin(uranusL);
  const uranusZ = uranusR * Math.sin(uranusB);
  const earthX = earthR * Math.cos(earthL);
  const earthY = earthR * Math.sin(earthL);
  const geoX = uranusX - earthX;
  const geoY = uranusY - earthY;
  const geoZ = uranusZ;
  let geoLon = Math.atan2(geoY, geoX) * RAD_TO_DEG;
  const geoLat = Math.atan2(geoZ, Math.sqrt(geoX * geoX + geoY * geoY)) * RAD_TO_DEG;
  const geoDist = Math.sqrt(geoX * geoX + geoY * geoY + geoZ * geoZ);
  while (geoLon < 0) geoLon += 360;
  while (geoLon >= 360) geoLon -= 360;
  const aberration = -5694e-6;
  geoLon += aberration;
  while (geoLon < 0) geoLon += 360;
  while (geoLon >= 360) geoLon -= 360;
  let longitudeSpeed = 0;
  let isRetrograde5 = false;
  if (includeSpeed) {
    const dt = 0.01;
    const pos1 = getUranusPosition(jd - dt, { includeSpeed: false });
    const pos2 = getUranusPosition(jd + dt, { includeSpeed: false });
    let lonDiff = pos2.longitude - pos1.longitude;
    if (lonDiff > 180) lonDiff -= 360;
    if (lonDiff < -180) lonDiff += 360;
    longitudeSpeed = lonDiff / (2 * dt);
    isRetrograde5 = longitudeSpeed < 0;
  }
  return {
    longitude: geoLon,
    latitude: geoLat,
    distance: geoDist,
    longitudeSpeed,
    isRetrograde: isRetrograde5
  };
}
function earthHeliocentricLongitude5(tau) {
  const tau2 = tau * tau;
  const earthL0 = [
    [175347046, 0, 0],
    [3341656, 4.6692568, 6283.07585],
    [34894, 4.6261, 12566.1517],
    [3497, 2.7441, 5753.3849],
    [3418, 2.8289, 3.5231],
    [3136, 3.6277, 77713.7715],
    [2676, 4.4181, 7860.4194],
    [2343, 6.1352, 3930.2097],
    [1324, 0.7425, 11506.7698],
    [1273, 2.0371, 529.691],
    [1199, 1.1096, 1577.3435]
  ];
  const earthL1 = [
    [628331966747, 0, 0],
    [206059, 2.678235, 6283.07585],
    [4303, 2.6351, 12566.1517]
  ];
  const earthL2 = [
    [8722, 1.0725, 6283.0758],
    [991, 3.1416, 0]
  ];
  let L0sum = 0;
  for (const [A, B, C] of earthL0) {
    L0sum += A * Math.cos(B + C * tau);
  }
  let L1sum = 0;
  for (const [A, B, C] of earthL1) {
    L1sum += A * Math.cos(B + C * tau);
  }
  let L2sum = 0;
  for (const [A, B, C] of earthL2) {
    L2sum += A * Math.cos(B + C * tau);
  }
  return (L0sum + L1sum * tau + L2sum * tau2) / 1e8;
}
function earthHeliocentricDistance5(tau) {
  const earthR0 = [
    [100013989, 0, 0],
    [1670700, 3.0984635, 6283.07585],
    [13956, 3.05525, 12566.1517],
    [3084, 5.1985, 77713.7715],
    [1628, 1.1739, 5753.3849],
    [1576, 2.8469, 7860.4194],
    [925, 5.453, 11506.77],
    [542, 4.564, 3930.21]
  ];
  const earthR1 = [
    [103019, 1.10749, 6283.07585],
    [1721, 1.0644, 12566.1517]
  ];
  let R0sum = 0;
  for (const [A, B, C] of earthR0) {
    R0sum += A * Math.cos(B + C * tau);
  }
  let R1sum = 0;
  for (const [A, B, C] of earthR1) {
    R1sum += A * Math.cos(B + C * tau);
  }
  return (R0sum + R1sum * tau) / 1e8;
}
var URANUS_ORBITAL_ELEMENTS = {
  /** Semi-major axis in AU */
  semiMajorAxis: 19.19,
  /** Orbital eccentricity */
  eccentricity: 0.0472,
  /** Orbital inclination in degrees */
  inclination: 0.77,
  /** Orbital period in days */
  orbitalPeriod: 30687,
  /** Orbital period in years */
  orbitalPeriodYears: 84.01,
  /** Synodic period in days (time between oppositions) */
  synodicPeriod: 369.66,
  /** Axial tilt in degrees (unique: rotates on its side) */
  axialTilt: 97.77
};

// src/ephemeris/planets/venus.ts
var L07 = [
  [317614667, 0, 0],
  [1353968, 5.5931332, 10213.2855462],
  [89892, 5.3065, 20426.57109],
  [5477, 4.4163, 7860.4194],
  [3456, 2.6996, 11790.6291],
  [2372, 2.9938, 3930.2097],
  [1664, 4.2502, 1577.3435],
  [1438, 4.1575, 9683.5946],
  [1317, 5.1867, 26.2983],
  [1201, 6.1536, 30639.8566],
  [769, 0.816, 9437.763],
  [761, 1.95, 529.691],
  [708, 1.065, 775.523],
  [585, 3.998, 191.448],
  [500, 4.123, 15720.839],
  [429, 3.586, 19367.189],
  [327, 5.677, 5507.553],
  [326, 4.591, 10404.734],
  [232, 3.163, 9153.904],
  [180, 4.653, 1109.379],
  [155, 5.57, 19651.048],
  [128, 4.226, 20.775],
  [128, 0.962, 5661.332]
];
var L17 = [
  [1021352943053, 0, 0],
  [95708, 2.46424, 10213.28555],
  [14445, 0.51625, 20426.57109],
  [213, 1.795, 30639.857],
  [174, 2.655, 26.298],
  [152, 6.106, 1577.344],
  [82, 5.7, 191.45],
  [70, 2.68, 9437.76],
  [52, 3.6, 775.52],
  [38, 1.03, 529.69],
  [30, 1.25, 5507.55],
  [25, 6.11, 10404.73]
];
var L27 = [
  [54127, 0, 0],
  [3891, 0.3451, 10213.2855],
  [1338, 2.0201, 20426.5711],
  [24, 2.05, 26.3],
  [19, 3.54, 30639.86]
];
var L37 = [
  [136, 4.804, 10213.286],
  [78, 3.67, 20426.57],
  [26, 0, 0]
];
var L47 = [
  [114, 3.1416, 0],
  [3, 5.21, 20426.57],
  [2, 2.51, 10213.29]
];
var L56 = [[1, 3.14, 0]];
var B07 = [
  [5923638, 0.2670278, 10213.2855462],
  [40108, 1.14737, 20426.57109],
  [32815, 3.14159, 0],
  [1011, 1.0895, 30639.8566],
  [149, 6.254, 18073.705],
  [138, 0.86, 1577.344],
  [130, 3.672, 9437.763],
  [120, 3.705, 2352.866],
  [108, 4.539, 22003.915]
];
var B17 = [
  [513348, 1.803643, 10213.285546],
  [4380, 3.3862, 20426.5711],
  [199, 0, 0],
  [197, 2.53, 30639.857]
];
var B27 = [
  [22378, 3.38509, 10213.28555],
  [282, 0, 0],
  [173, 5.256, 20426.571],
  [27, 3.87, 30639.86]
];
var B37 = [
  [647, 4.992, 10213.286],
  [20, 3.14, 0],
  [6, 0.77, 20426.57]
];
var B47 = [[14, 0.32, 10213.29]];
var R07 = [
  [72334821, 0, 0],
  [489824, 4.021518, 10213.285546],
  [1658, 4.9021, 20426.5711],
  [1632, 2.8455, 7860.4194],
  [1378, 1.1285, 11790.6291],
  [498, 2.587, 9683.595],
  [374, 1.423, 3930.21],
  [264, 5.529, 9437.763],
  [237, 2.551, 15720.839],
  [222, 2.013, 19367.189],
  [126, 2.728, 1577.344],
  [119, 3.02, 10404.734]
];
var R17 = [
  [34551, 0.89199, 10213.28555],
  [234, 1.772, 20426.571],
  [234, 3.142, 0]
];
var R27 = [
  [1407, 5.0637, 10213.2855],
  [16, 5.47, 20426.57],
  [13, 0, 0]
];
var R37 = [[50, 3.22, 10213.29]];
function evaluateSeries4(terms, tau) {
  let sum = 0;
  for (const [A, B, C] of terms) {
    sum += A * Math.cos(B + C * tau);
  }
  return sum;
}
function venusHeliocentricLongitude(tau) {
  const L0sum = evaluateSeries4(L07, tau);
  const L1sum = evaluateSeries4(L17, tau);
  const L2sum = evaluateSeries4(L27, tau);
  const L3sum = evaluateSeries4(L37, tau);
  const L4sum = evaluateSeries4(L47, tau);
  const L5sum = evaluateSeries4(L56, tau);
  const tau2 = tau * tau;
  const tau3 = tau2 * tau;
  const tau4 = tau3 * tau;
  const tau5 = tau4 * tau;
  const L = L0sum + L1sum * tau + L2sum * tau2 + L3sum * tau3 + L4sum * tau4 + L5sum * tau5;
  return L / 1e8;
}
function venusHeliocentricLatitude(tau) {
  const B0sum = evaluateSeries4(B07, tau);
  const B1sum = evaluateSeries4(B17, tau);
  const B2sum = evaluateSeries4(B27, tau);
  const B3sum = evaluateSeries4(B37, tau);
  const B4sum = evaluateSeries4(B47, tau);
  const tau2 = tau * tau;
  const tau3 = tau2 * tau;
  const tau4 = tau3 * tau;
  const B = B0sum + B1sum * tau + B2sum * tau2 + B3sum * tau3 + B4sum * tau4;
  return B / 1e8;
}
function venusHeliocentricDistance(tau) {
  const R0sum = evaluateSeries4(R07, tau);
  const R1sum = evaluateSeries4(R17, tau);
  const R2sum = evaluateSeries4(R27, tau);
  const R3sum = evaluateSeries4(R37, tau);
  const tau2 = tau * tau;
  const tau3 = tau2 * tau;
  const R = R0sum + R1sum * tau + R2sum * tau2 + R3sum * tau3;
  return R / 1e8;
}
function earthHeliocentricPosition4(tau) {
  const earthL0 = [
    [175347046, 0, 0],
    [3341656, 4.6692568, 6283.07585],
    [34894, 4.6261, 12566.1517],
    [3497, 2.7441, 5753.3849],
    [3418, 2.8289, 3.5231],
    [3136, 3.6277, 77713.7715],
    [2676, 4.4181, 7860.4194],
    [2343, 6.1352, 3930.2097],
    [1324, 0.7425, 11506.7698],
    [1273, 2.0371, 529.691],
    [1199, 1.1096, 1577.3435]
  ];
  const earthL1 = [
    [628331966747, 0, 0],
    [206059, 2.678235, 6283.07585],
    [4303, 2.6351, 12566.1517]
  ];
  const earthL2 = [
    [8722, 1.0725, 6283.0758],
    [991, 3.1416, 0]
  ];
  const earthB0 = [[280, 3.199, 84334.662]];
  const earthR0 = [
    [100013989, 0, 0],
    [1670700, 3.0984635, 6283.07585],
    [13956, 3.05525, 12566.1517],
    [3084, 5.1985, 77713.7715],
    [1628, 1.1739, 5753.3849],
    [1576, 2.8469, 7860.4194],
    [925, 5.453, 11506.77],
    [542, 4.564, 3930.21]
  ];
  const earthR1 = [
    [103019, 1.10749, 6283.07585],
    [1721, 1.0644, 12566.1517]
  ];
  const tau2 = tau * tau;
  const L0sum = evaluateSeries4(earthL0, tau);
  const L1sum = evaluateSeries4(earthL1, tau);
  const L2sum = evaluateSeries4(earthL2, tau);
  const L = (L0sum + L1sum * tau + L2sum * tau2) / 1e8;
  const B0sum = evaluateSeries4(earthB0, tau);
  const B = B0sum / 1e8;
  const R0sum = evaluateSeries4(earthR0, tau);
  const R1sum = evaluateSeries4(earthR1, tau);
  const R = (R0sum + R1sum * tau) / 1e8;
  return { longitude: L, latitude: B, distance: R };
}
function helioToGeo4(planetLon, planetLat, planetDist, earthLon, earthLat, earthDist) {
  const cosB = Math.cos(planetLat);
  const x = planetDist * cosB * Math.cos(planetLon) - earthDist * Math.cos(earthLat) * Math.cos(earthLon);
  const y = planetDist * cosB * Math.sin(planetLon) - earthDist * Math.cos(earthLat) * Math.sin(earthLon);
  const z = planetDist * Math.sin(planetLat) - earthDist * Math.sin(earthLat);
  const distance = Math.sqrt(x * x + y * y + z * z);
  let longitude = Math.atan2(y, x);
  const latitude = Math.asin(z / distance);
  if (longitude < 0) longitude += 2 * Math.PI;
  return { longitude, latitude, distance };
}
function normalizeAngle7(degrees) {
  let result = degrees % 360;
  if (result < 0) result += 360;
  return result;
}
function getVenusPosition(jd, options = {}) {
  const tau = (jd - J2000_EPOCH) / DAYS_PER_JULIAN_MILLENNIUM;
  const venusLon = venusHeliocentricLongitude(tau);
  const venusLat = venusHeliocentricLatitude(tau);
  const venusDist = venusHeliocentricDistance(tau);
  const earth = earthHeliocentricPosition4(tau);
  const geo = helioToGeo4(
    venusLon,
    venusLat,
    venusDist,
    earth.longitude,
    earth.latitude,
    earth.distance
  );
  let longitude = geo.longitude * RAD_TO_DEG;
  const latitude = geo.latitude * RAD_TO_DEG;
  const aberration = -20.49552 / 3600;
  longitude = normalizeAngle7(longitude + aberration);
  let longitudeSpeed = 0;
  if (options.includeSpeed !== false) {
    const tau1 = (jd + 1 - J2000_EPOCH) / DAYS_PER_JULIAN_MILLENNIUM;
    const venusLon1 = venusHeliocentricLongitude(tau1);
    const venusLat1 = venusHeliocentricLatitude(tau1);
    const venusDist1 = venusHeliocentricDistance(tau1);
    const earth1 = earthHeliocentricPosition4(tau1);
    const geo1 = helioToGeo4(
      venusLon1,
      venusLat1,
      venusDist1,
      earth1.longitude,
      earth1.latitude,
      earth1.distance
    );
    const longitude1 = normalizeAngle7(geo1.longitude * RAD_TO_DEG + aberration);
    let diff = longitude1 - longitude;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    longitudeSpeed = diff;
  }
  return {
    longitude,
    latitude,
    distance: geo.distance,
    longitudeSpeed,
    isRetrograde: longitudeSpeed < 0
  };
}
var VENUS_ORBITAL_ELEMENTS = {
  /** Semi-major axis in AU */
  semiMajorAxis: 0.72333566,
  /** Orbital eccentricity (lowest of all planets) */
  eccentricity: 677672e-8,
  /** Orbital inclination in degrees */
  inclination: 3.39467605,
  /** Longitude of ascending node in degrees */
  ascendingNode: 76.67984255,
  /** Longitude of perihelion in degrees */
  perihelion: 131.60246718,
  /** Mean longitude at J2000.0 in degrees */
  meanLongitude: 181.9790995,
  /** Orbital period in days */
  orbitalPeriod: 224.701,
  /** Synodic period in days (Venus-Earth) */
  synodicPeriod: 583.92,
  /** Maximum elongation from Sun in degrees */
  maxElongation: 47.8
};

// src/ephemeris/types.ts
var Planet = /* @__PURE__ */ ((Planet3) => {
  Planet3["Sun"] = "Sun";
  Planet3["Moon"] = "Moon";
  Planet3["Mercury"] = "Mercury";
  Planet3["Venus"] = "Venus";
  Planet3["Mars"] = "Mars";
  Planet3["Jupiter"] = "Jupiter";
  Planet3["Saturn"] = "Saturn";
  Planet3["Uranus"] = "Uranus";
  Planet3["Neptune"] = "Neptune";
  Planet3["Pluto"] = "Pluto";
  Planet3["NorthNode"] = "NorthNode";
  Planet3["SouthNode"] = "SouthNode";
  Planet3["Lilith"] = "Lilith";
  Planet3["Chiron"] = "Chiron";
  Planet3["Ceres"] = "Ceres";
  Planet3["Pallas"] = "Pallas";
  Planet3["Juno"] = "Juno";
  Planet3["Vesta"] = "Vesta";
  return Planet3;
})(Planet || {});

// src/ephemeris/positions.ts
var CelestialBody = /* @__PURE__ */ ((CelestialBody2) => {
  CelestialBody2["Sun"] = "Sun";
  CelestialBody2["Moon"] = "Moon";
  CelestialBody2["Mercury"] = "Mercury";
  CelestialBody2["Venus"] = "Venus";
  CelestialBody2["Mars"] = "Mars";
  CelestialBody2["Jupiter"] = "Jupiter";
  CelestialBody2["Saturn"] = "Saturn";
  CelestialBody2["Uranus"] = "Uranus";
  CelestialBody2["Neptune"] = "Neptune";
  CelestialBody2["Pluto"] = "Pluto";
  CelestialBody2["NorthNode"] = "NorthNode";
  CelestialBody2["TrueNorthNode"] = "TrueNorthNode";
  CelestialBody2["SouthNode"] = "SouthNode";
  CelestialBody2["TrueSouthNode"] = "TrueSouthNode";
  CelestialBody2["Lilith"] = "Lilith";
  CelestialBody2["TrueLilith"] = "TrueLilith";
  CelestialBody2["Chiron"] = "Chiron";
  CelestialBody2["Ceres"] = "Ceres";
  CelestialBody2["Pallas"] = "Pallas";
  CelestialBody2["Juno"] = "Juno";
  CelestialBody2["Vesta"] = "Vesta";
  return CelestialBody2;
})(CelestialBody || {});
function getPosition(body, jd, options = {}) {
  switch (body) {
    case "Sun" /* Sun */:
    case "Sun" /* Sun */:
      return getSunPosition(jd, options);
    case "Moon" /* Moon */:
    case "Moon" /* Moon */:
      return getMoonPosition(jd, options);
    case "Mercury" /* Mercury */:
    case "Mercury" /* Mercury */:
      return getMercuryPosition(jd, options);
    case "Venus" /* Venus */:
    case "Venus" /* Venus */:
      return getVenusPosition(jd, options);
    case "Mars" /* Mars */:
    case "Mars" /* Mars */:
      return getMarsPosition(jd, options);
    case "Jupiter" /* Jupiter */:
    case "Jupiter" /* Jupiter */:
      return getJupiterPosition(jd, options);
    case "Saturn" /* Saturn */:
    case "Saturn" /* Saturn */:
      return getSaturnPosition(jd, options);
    case "Uranus" /* Uranus */:
    case "Uranus" /* Uranus */:
      return getUranusPosition(jd, options);
    case "Neptune" /* Neptune */:
    case "Neptune" /* Neptune */:
      return getNeptunePosition(jd, options);
    case "Pluto" /* Pluto */:
    case "Pluto" /* Pluto */:
      return getPlutoPosition(jd, options);
    case "NorthNode" /* NorthNode */:
    case "NorthNode" /* NorthNode */: {
      const node = getMeanNode(jd);
      return {
        longitude: node.northNode,
        latitude: 0,
        distance: 0,
        longitudeSpeed: node.speed,
        isRetrograde: node.isRetrograde
      };
    }
    case "TrueNorthNode" /* TrueNorthNode */: {
      const node = getTrueNode(jd);
      return {
        longitude: node.northNode,
        latitude: 0,
        distance: 0,
        longitudeSpeed: node.speed,
        isRetrograde: node.isRetrograde
      };
    }
    case "SouthNode" /* SouthNode */:
    case "SouthNode" /* SouthNode */: {
      const node = getMeanNode(jd);
      return {
        longitude: node.southNode,
        latitude: 0,
        distance: 0,
        longitudeSpeed: node.speed,
        isRetrograde: node.isRetrograde
      };
    }
    case "TrueSouthNode" /* TrueSouthNode */: {
      const node = getTrueNode(jd);
      return {
        longitude: node.southNode,
        latitude: 0,
        distance: 0,
        longitudeSpeed: node.speed,
        isRetrograde: node.isRetrograde
      };
    }
    case "Lilith" /* Lilith */:
    case "Lilith" /* Lilith */: {
      const lilith = getMeanLilith(jd);
      return {
        longitude: lilith.longitude,
        latitude: 0,
        distance: 0,
        longitudeSpeed: lilith.speed,
        isRetrograde: lilith.isRetrograde
      };
    }
    case "TrueLilith" /* TrueLilith */: {
      const lilith = getTrueLilith(jd);
      return {
        longitude: lilith.longitude,
        latitude: 0,
        distance: 0,
        longitudeSpeed: lilith.speed,
        isRetrograde: lilith.isRetrograde
      };
    }
    case "Chiron" /* Chiron */:
    case "Chiron" /* Chiron */:
      return getChironPosition(jd, options);
    case "Ceres" /* Ceres */:
    case "Ceres" /* Ceres */:
      return getCeresPosition(jd, options);
    case "Pallas" /* Pallas */:
    case "Pallas" /* Pallas */:
      return getPallasPosition(jd, options);
    case "Juno" /* Juno */:
    case "Juno" /* Juno */:
      return getJunoPosition(jd, options);
    case "Vesta" /* Vesta */:
    case "Vesta" /* Vesta */:
      return getVestaPosition(jd, options);
    default:
      throw new Error(`Unknown celestial body: ${body}`);
  }
}
var DEFAULT_BODIES = [
  "Sun" /* Sun */,
  "Moon" /* Moon */,
  "Mercury" /* Mercury */,
  "Venus" /* Venus */,
  "Mars" /* Mars */,
  "Jupiter" /* Jupiter */,
  "Saturn" /* Saturn */,
  "Uranus" /* Uranus */,
  "Neptune" /* Neptune */,
  "Pluto" /* Pluto */,
  "NorthNode" /* NorthNode */,
  "SouthNode" /* SouthNode */,
  "Lilith" /* Lilith */,
  "Chiron" /* Chiron */,
  "Ceres" /* Ceres */,
  "Pallas" /* Pallas */,
  "Juno" /* Juno */,
  "Vesta" /* Vesta */
];
function getAllPositions(jd, bodies = DEFAULT_BODIES, options = {}) {
  const positions = /* @__PURE__ */ new Map();
  for (const body of bodies) {
    const position = getPosition(body, jd, options);
    positions.set(body, position);
  }
  return positions;
}
function getAllPositionsObject(jd, bodies = DEFAULT_BODIES, options = {}) {
  const result = {};
  for (const body of bodies) {
    result[body] = getPosition(body, jd, options);
  }
  return result;
}
function isRetrograde(body, jd) {
  if (body === "Sun" /* Sun */ || body === "Moon" /* Moon */) {
    return false;
  }
  const position = getPosition(body, jd);
  return position.isRetrograde;
}
function getSign(body, jd) {
  const position = getPosition(body, jd);
  return Math.floor(position.longitude / 30);
}
function getDegreeInSign(body, jd) {
  const position = getPosition(body, jd);
  return position.longitude % 30;
}

// src/zodiac/types.ts
var Sign = /* @__PURE__ */ ((Sign2) => {
  Sign2[Sign2["Aries"] = 0] = "Aries";
  Sign2[Sign2["Taurus"] = 1] = "Taurus";
  Sign2[Sign2["Gemini"] = 2] = "Gemini";
  Sign2[Sign2["Cancer"] = 3] = "Cancer";
  Sign2[Sign2["Leo"] = 4] = "Leo";
  Sign2[Sign2["Virgo"] = 5] = "Virgo";
  Sign2[Sign2["Libra"] = 6] = "Libra";
  Sign2[Sign2["Scorpio"] = 7] = "Scorpio";
  Sign2[Sign2["Sagittarius"] = 8] = "Sagittarius";
  Sign2[Sign2["Capricorn"] = 9] = "Capricorn";
  Sign2[Sign2["Aquarius"] = 10] = "Aquarius";
  Sign2[Sign2["Pisces"] = 11] = "Pisces";
  return Sign2;
})(Sign || {});
var Element = /* @__PURE__ */ ((Element2) => {
  Element2["Fire"] = "Fire";
  Element2["Earth"] = "Earth";
  Element2["Air"] = "Air";
  Element2["Water"] = "Water";
  return Element2;
})(Element || {});
var Modality = /* @__PURE__ */ ((Modality2) => {
  Modality2["Cardinal"] = "Cardinal";
  Modality2["Fixed"] = "Fixed";
  Modality2["Mutable"] = "Mutable";
  return Modality2;
})(Modality || {});
var Polarity = /* @__PURE__ */ ((Polarity2) => {
  Polarity2["Positive"] = "Positive";
  Polarity2["Negative"] = "Negative";
  return Polarity2;
})(Polarity || {});
var Planet2 = /* @__PURE__ */ ((Planet3) => {
  Planet3["Sun"] = "Sun";
  Planet3["Moon"] = "Moon";
  Planet3["Mercury"] = "Mercury";
  Planet3["Venus"] = "Venus";
  Planet3["Mars"] = "Mars";
  Planet3["Jupiter"] = "Jupiter";
  Planet3["Saturn"] = "Saturn";
  Planet3["Uranus"] = "Uranus";
  Planet3["Neptune"] = "Neptune";
  Planet3["Pluto"] = "Pluto";
  return Planet3;
})(Planet2 || {});
var DignityState = /* @__PURE__ */ ((DignityState2) => {
  DignityState2["Domicile"] = "Domicile";
  DignityState2["Exaltation"] = "Exaltation";
  DignityState2["Peregrine"] = "Peregrine";
  DignityState2["Detriment"] = "Detriment";
  DignityState2["Fall"] = "Fall";
  return DignityState2;
})(DignityState || {});

// src/zodiac/constants.ts
var SIGN_DATA = {
  [0 /* Aries */]: {
    sign: 0 /* Aries */,
    name: "Aries",
    symbol: "\u2648",
    element: "Fire" /* Fire */,
    modality: "Cardinal" /* Cardinal */,
    polarity: "Positive" /* Positive */,
    ruler: "Mars" /* Mars */,
    traditionalRuler: "Mars" /* Mars */,
    startDegree: 0,
    endDegree: 30
  },
  [1 /* Taurus */]: {
    sign: 1 /* Taurus */,
    name: "Taurus",
    symbol: "\u2649",
    element: "Earth" /* Earth */,
    modality: "Fixed" /* Fixed */,
    polarity: "Negative" /* Negative */,
    ruler: "Venus" /* Venus */,
    traditionalRuler: "Venus" /* Venus */,
    startDegree: 30,
    endDegree: 60
  },
  [2 /* Gemini */]: {
    sign: 2 /* Gemini */,
    name: "Gemini",
    symbol: "\u264A",
    element: "Air" /* Air */,
    modality: "Mutable" /* Mutable */,
    polarity: "Positive" /* Positive */,
    ruler: "Mercury" /* Mercury */,
    traditionalRuler: "Mercury" /* Mercury */,
    startDegree: 60,
    endDegree: 90
  },
  [3 /* Cancer */]: {
    sign: 3 /* Cancer */,
    name: "Cancer",
    symbol: "\u264B",
    element: "Water" /* Water */,
    modality: "Cardinal" /* Cardinal */,
    polarity: "Negative" /* Negative */,
    ruler: "Moon" /* Moon */,
    traditionalRuler: "Moon" /* Moon */,
    startDegree: 90,
    endDegree: 120
  },
  [4 /* Leo */]: {
    sign: 4 /* Leo */,
    name: "Leo",
    symbol: "\u264C",
    element: "Fire" /* Fire */,
    modality: "Fixed" /* Fixed */,
    polarity: "Positive" /* Positive */,
    ruler: "Sun" /* Sun */,
    traditionalRuler: "Sun" /* Sun */,
    startDegree: 120,
    endDegree: 150
  },
  [5 /* Virgo */]: {
    sign: 5 /* Virgo */,
    name: "Virgo",
    symbol: "\u264D",
    element: "Earth" /* Earth */,
    modality: "Mutable" /* Mutable */,
    polarity: "Negative" /* Negative */,
    ruler: "Mercury" /* Mercury */,
    traditionalRuler: "Mercury" /* Mercury */,
    startDegree: 150,
    endDegree: 180
  },
  [6 /* Libra */]: {
    sign: 6 /* Libra */,
    name: "Libra",
    symbol: "\u264E",
    element: "Air" /* Air */,
    modality: "Cardinal" /* Cardinal */,
    polarity: "Positive" /* Positive */,
    ruler: "Venus" /* Venus */,
    traditionalRuler: "Venus" /* Venus */,
    startDegree: 180,
    endDegree: 210
  },
  [7 /* Scorpio */]: {
    sign: 7 /* Scorpio */,
    name: "Scorpio",
    symbol: "\u264F",
    element: "Water" /* Water */,
    modality: "Fixed" /* Fixed */,
    polarity: "Negative" /* Negative */,
    ruler: "Pluto" /* Pluto */,
    // Modern ruler
    traditionalRuler: "Mars" /* Mars */,
    modernRuler: "Pluto" /* Pluto */,
    startDegree: 210,
    endDegree: 240
  },
  [8 /* Sagittarius */]: {
    sign: 8 /* Sagittarius */,
    name: "Sagittarius",
    symbol: "\u2650",
    element: "Fire" /* Fire */,
    modality: "Mutable" /* Mutable */,
    polarity: "Positive" /* Positive */,
    ruler: "Jupiter" /* Jupiter */,
    traditionalRuler: "Jupiter" /* Jupiter */,
    startDegree: 240,
    endDegree: 270
  },
  [9 /* Capricorn */]: {
    sign: 9 /* Capricorn */,
    name: "Capricorn",
    symbol: "\u2651",
    element: "Earth" /* Earth */,
    modality: "Cardinal" /* Cardinal */,
    polarity: "Negative" /* Negative */,
    ruler: "Saturn" /* Saturn */,
    traditionalRuler: "Saturn" /* Saturn */,
    startDegree: 270,
    endDegree: 300
  },
  [10 /* Aquarius */]: {
    sign: 10 /* Aquarius */,
    name: "Aquarius",
    symbol: "\u2652",
    element: "Air" /* Air */,
    modality: "Fixed" /* Fixed */,
    polarity: "Positive" /* Positive */,
    ruler: "Uranus" /* Uranus */,
    // Modern ruler
    traditionalRuler: "Saturn" /* Saturn */,
    modernRuler: "Uranus" /* Uranus */,
    startDegree: 300,
    endDegree: 330
  },
  [11 /* Pisces */]: {
    sign: 11 /* Pisces */,
    name: "Pisces",
    symbol: "\u2653",
    element: "Water" /* Water */,
    modality: "Mutable" /* Mutable */,
    polarity: "Negative" /* Negative */,
    ruler: "Neptune" /* Neptune */,
    // Modern ruler
    traditionalRuler: "Jupiter" /* Jupiter */,
    modernRuler: "Neptune" /* Neptune */,
    startDegree: 330,
    endDegree: 360
  }
};
var PLANETARY_RULERSHIPS = {
  ["Sun" /* Sun */]: [4 /* Leo */],
  ["Moon" /* Moon */]: [3 /* Cancer */],
  ["Mercury" /* Mercury */]: [2 /* Gemini */, 5 /* Virgo */],
  ["Venus" /* Venus */]: [1 /* Taurus */, 6 /* Libra */],
  ["Mars" /* Mars */]: [0 /* Aries */, 7 /* Scorpio */],
  // Traditional
  ["Jupiter" /* Jupiter */]: [8 /* Sagittarius */, 11 /* Pisces */],
  // Traditional
  ["Saturn" /* Saturn */]: [9 /* Capricorn */, 10 /* Aquarius */],
  // Traditional
  ["Uranus" /* Uranus */]: [10 /* Aquarius */],
  // Modern (discovered 1781)
  ["Neptune" /* Neptune */]: [11 /* Pisces */],
  // Modern (discovered 1846)
  ["Pluto" /* Pluto */]: [7 /* Scorpio */]
  // Modern (discovered 1930)
};
var EXALTATIONS = {
  ["Sun" /* Sun */]: { sign: 0 /* Aries */, degree: 19 },
  ["Moon" /* Moon */]: { sign: 1 /* Taurus */, degree: 3 },
  ["Mercury" /* Mercury */]: { sign: 5 /* Virgo */, degree: 15 },
  ["Venus" /* Venus */]: { sign: 11 /* Pisces */, degree: 27 },
  ["Mars" /* Mars */]: { sign: 9 /* Capricorn */, degree: 28 },
  ["Jupiter" /* Jupiter */]: { sign: 3 /* Cancer */, degree: 15 },
  ["Saturn" /* Saturn */]: { sign: 6 /* Libra */, degree: 21 },
  // Outer planets have no traditional exaltations
  ["Uranus" /* Uranus */]: void 0,
  ["Neptune" /* Neptune */]: void 0,
  ["Pluto" /* Pluto */]: void 0
};
var PLANET_SYMBOLS = {
  ["Sun" /* Sun */]: "\u2609",
  ["Moon" /* Moon */]: "\u263D",
  ["Mercury" /* Mercury */]: "\u263F",
  ["Venus" /* Venus */]: "\u2640",
  ["Mars" /* Mars */]: "\u2642",
  ["Jupiter" /* Jupiter */]: "\u2643",
  ["Saturn" /* Saturn */]: "\u2644",
  ["Uranus" /* Uranus */]: "\u2645",
  ["Neptune" /* Neptune */]: "\u2646",
  ["Pluto" /* Pluto */]: "\u2647"
};
var DIGNITY_STRENGTH = {
  DOMICILE: 5,
  EXALTATION: 4,
  PEREGRINE: 0,
  DETRIMENT: -5,
  FALL: -4
};

// src/zodiac/dignities.ts
function getPlanetaryDignity(planet, sign, degree) {
  const rulerships = PLANETARY_RULERSHIPS[planet];
  if (rulerships.includes(sign)) {
    return {
      planet,
      sign,
      state: "Domicile" /* Domicile */,
      strength: DIGNITY_STRENGTH.DOMICILE,
      description: `${planet} rules ${Sign[sign]}`
    };
  }
  for (const ruledSign of rulerships) {
    const oppositeSign = (ruledSign + 6) % 12;
    if (sign === oppositeSign) {
      return {
        planet,
        sign,
        state: "Detriment" /* Detriment */,
        strength: DIGNITY_STRENGTH.DETRIMENT,
        description: `${planet} in detriment (opposite ${Sign[ruledSign]})`
      };
    }
  }
  const exaltation = EXALTATIONS[planet];
  if (exaltation && exaltation.sign === sign) {
    const result = {
      planet,
      sign,
      state: "Exaltation" /* Exaltation */,
      strength: DIGNITY_STRENGTH.EXALTATION,
      description: `${planet} exalted in ${Sign[sign]}`,
      exaltationDegree: exaltation.degree
    };
    if (degree !== void 0) {
      const degreeInt = Math.floor(degree);
      if (degreeInt === exaltation.degree) {
        result.description = `${planet} exalted in ${Sign[sign]} at exact degree (${exaltation.degree}\xB0)`;
      }
    }
    return result;
  }
  if (exaltation) {
    const oppositeFallSign = (exaltation.sign + 6) % 12;
    if (sign === oppositeFallSign) {
      return {
        planet,
        sign,
        state: "Fall" /* Fall */,
        strength: DIGNITY_STRENGTH.FALL,
        description: `${planet} in fall (opposite ${Sign[exaltation.sign]})`
      };
    }
  }
  return {
    planet,
    sign,
    state: "Peregrine" /* Peregrine */,
    strength: DIGNITY_STRENGTH.PEREGRINE,
    description: `${planet} peregrine in ${Sign[sign]}`
  };
}
function isRuler(planet, sign) {
  return PLANETARY_RULERSHIPS[planet].includes(sign);
}
function isExalted(planet, sign) {
  const exaltation = EXALTATIONS[planet];
  return exaltation !== void 0 && exaltation.sign === sign;
}
function isDetriment(planet, sign) {
  const rulerships = PLANETARY_RULERSHIPS[planet];
  for (const ruledSign of rulerships) {
    const oppositeSign = (ruledSign + 6) % 12;
    if (sign === oppositeSign) {
      return true;
    }
  }
  return false;
}
function isFall(planet, sign) {
  const exaltation = EXALTATIONS[planet];
  if (!exaltation) {
    return false;
  }
  const oppositeFallSign = (exaltation.sign + 6) % 12;
  return sign === oppositeFallSign;
}

// src/zodiac/sign-properties.ts
function getSignInfo(sign) {
  if (sign < 0 || sign > 11) {
    throw new Error(`Invalid sign: ${sign}. Must be 0-11.`);
  }
  return SIGN_DATA[sign];
}
function getSignName(sign) {
  return getSignInfo(sign).name;
}
function getSignSymbol(sign) {
  return getSignInfo(sign).symbol;
}

// src/zodiac/zodiac.ts
function normalizeLongitude(longitude) {
  const normalized = (longitude % 360 + 360) % 360;
  return normalized;
}
function eclipticToZodiac(longitude) {
  if (!Number.isFinite(longitude)) {
    throw new Error("Invalid longitude: must be a finite number");
  }
  const normalized = normalizeLongitude(longitude);
  const signIndex = Math.floor(normalized / 30);
  const sign = signIndex === 12 ? 0 /* Aries */ : signIndex;
  const degreeInSign = normalized % 30;
  const degree = Math.floor(degreeInSign);
  const minutesFloat = (degreeInSign - degree) * 60;
  const minute = Math.floor(minutesFloat);
  const secondsFloat = (minutesFloat - minute) * 60;
  let second = Math.round(secondsFloat);
  if (second === 60) {
    second = 59;
  }
  const signName = SIGN_DATA[sign].name;
  const formatted = `${degree}\xB0${minute.toString().padStart(2, "0")}'${second.toString().padStart(2, "0")}" ${signName}`;
  return {
    sign,
    signName,
    longitude: normalized,
    degreeInSign,
    degree,
    minute,
    second,
    formatted
  };
}
function formatZodiacPosition(position, options = {}) {
  const {
    includeSeconds = true,
    includeSign = true,
    useSymbol = false,
    decimalDegrees = false
  } = options;
  let degreeStr;
  if (decimalDegrees) {
    degreeStr = `${position.degreeInSign.toFixed(2)}\xB0`;
  } else {
    const deg = position.degree;
    const min = position.minute.toString().padStart(2, "0");
    if (includeSeconds) {
      const sec = position.second.toString().padStart(2, "0");
      degreeStr = `${deg}\xB0${min}'${sec}"`;
    } else {
      degreeStr = `${deg}\xB0${min}'`;
    }
  }
  if (!includeSign) {
    return degreeStr;
  }
  const signStr = useSymbol ? SIGN_DATA[position.sign].symbol : position.signName;
  return `${degreeStr} ${signStr}`;
}

// src/houses/house-utils.ts
function normalizeAngle8(degrees) {
  return (degrees % 360 + 360) % 360;
}
function oppositePoint(longitude) {
  return normalizeAngle8(longitude + 180);
}
function angularDistance(angle1, angle2) {
  const diff = Math.abs(normalizeAngle8(angle1) - normalizeAngle8(angle2));
  return diff > 180 ? 360 - diff : diff;
}
function signedAngularSeparation(fromAngle, toAngle) {
  const from = normalizeAngle8(fromAngle);
  const to = normalizeAngle8(toAngle);
  let diff = to - from;
  if (diff > 180) {
    diff -= 360;
  } else if (diff <= -180) {
    diff += 360;
  }
  return diff;
}
function getHousePosition(longitude, cusps) {
  if (cusps.length !== 12) {
    throw new Error("Cusps array must contain exactly 12 elements");
  }
  const pos = normalizeAngle8(longitude);
  for (let house = 1; house <= 12; house++) {
    const cuspStart = normalizeAngle8(cusps[house - 1]);
    const cuspEnd = house === 12 ? normalizeAngle8(cusps[0]) : normalizeAngle8(cusps[house]);
    if (cuspStart < cuspEnd) {
      if (pos >= cuspStart && pos < cuspEnd) {
        return house;
      }
    } else {
      if (pos >= cuspStart || pos < cuspEnd) {
        return house;
      }
    }
  }
  return 1;
}
function isOnAngle(position, angle, orb = 10) {
  return angularDistance(position, angle) <= orb;
}
function eclipticToZodiac2(longitude) {
  const normalized = normalizeAngle8(longitude);
  const signIndex = Math.floor(normalized / 30);
  const degreeInSign = normalized % 30;
  return {
    signIndex,
    degreeInSign
  };
}
function getSignName2(signIndex) {
  const signs = [
    "Aries",
    "Taurus",
    "Gemini",
    "Cancer",
    "Leo",
    "Virgo",
    "Libra",
    "Scorpio",
    "Sagittarius",
    "Capricorn",
    "Aquarius",
    "Pisces"
  ];
  return signs[signIndex % 12];
}
function formatZodiacPosition2(longitude) {
  const { signIndex, degreeInSign } = eclipticToZodiac2(longitude);
  const sign = getSignName2(signIndex);
  const degrees = Math.floor(degreeInSign);
  const minutes = Math.round((degreeInSign - degrees) * 60);
  return `${degrees}\xB0${minutes.toString().padStart(2, "0")}' ${sign}`;
}

// src/houses/angles.ts
function degreesToRadians(degrees) {
  return degrees * Math.PI / 180;
}
function radiansToDegrees(radians) {
  return radians * 180 / Math.PI;
}
function calculateMidheaven(lst, obliquity) {
  const lstRad = degreesToRadians(lst);
  const oblRad = degreesToRadians(obliquity);
  const numerator = Math.sin(lstRad);
  const denominator = Math.cos(lstRad) * Math.cos(oblRad);
  const mcRad = Math.atan2(numerator, denominator);
  const mc = radiansToDegrees(mcRad);
  return normalizeAngle8(mc);
}
function calculateAscendant(lst, obliquity, latitude) {
  if (Math.abs(latitude) >= 90) {
    throw new Error(
      "Ascendant is undefined at the exact poles (latitude = \xB190\xB0). All ecliptic degrees rise and set simultaneously."
    );
  }
  const lstRad = degreesToRadians(lst);
  const oblRad = degreesToRadians(obliquity);
  const latRad = degreesToRadians(latitude);
  const numerator = Math.cos(lstRad);
  const denominator = -(Math.sin(oblRad) * Math.tan(latRad) + Math.cos(oblRad) * Math.sin(lstRad));
  const ascRad = Math.atan2(numerator, denominator);
  const asc = radiansToDegrees(ascRad);
  return normalizeAngle8(asc);
}
function calculateAngles(lst, obliquity, latitude) {
  const ascendant = calculateAscendant(lst, obliquity, latitude);
  const midheaven = calculateMidheaven(lst, obliquity);
  const descendant = oppositePoint(ascendant);
  const imumCoeli = oppositePoint(midheaven);
  return {
    ascendant,
    midheaven,
    descendant,
    imumCoeli
  };
}

// src/houses/house-systems/shared.ts
var VERY_SMALL = 1 / 36e4;
var DEG2RAD = Math.PI / 180;
var RAD2DEG = 180 / Math.PI;
function sind(deg) {
  return Math.sin(deg * DEG2RAD);
}
function cosd(deg) {
  return Math.cos(deg * DEG2RAD);
}
function tand(deg) {
  return Math.tan(deg * DEG2RAD);
}
function asind(x) {
  return Math.asin(x) * RAD2DEG;
}
function atand(x) {
  return Math.atan(x) * RAD2DEG;
}
function asc2(x, f, sine, cose) {
  let ass = -tand(f) * sine + cose * cosd(x);
  if (Math.abs(ass) < VERY_SMALL) {
    ass = 0;
  }
  let sinx = sind(x);
  if (Math.abs(sinx) < VERY_SMALL) {
    sinx = 0;
  }
  if (sinx === 0) {
    ass = ass < 0 ? -VERY_SMALL : VERY_SMALL;
  } else if (ass === 0) {
    ass = sinx < 0 ? -90 : 90;
  } else {
    ass = atand(sinx / ass);
  }
  if (ass < 0) {
    ass += 180;
  }
  return ass;
}
function asc1(x1, f, sine, cose) {
  const x = normalizeAngle8(x1);
  const quadrant = Math.floor(x / 90) + 1;
  if (Math.abs(90 - f) < VERY_SMALL) {
    return 180;
  }
  if (Math.abs(90 + f) < VERY_SMALL) {
    return 0;
  }
  let ass;
  if (quadrant === 1) {
    ass = asc2(x, f, sine, cose);
  } else if (quadrant === 2) {
    ass = 180 - asc2(180 - x, -f, sine, cose);
  } else if (quadrant === 3) {
    ass = 180 + asc2(x - 180, -f, sine, cose);
  } else {
    ass = 360 - asc2(360 - x, f, sine, cose);
  }
  ass = normalizeAngle8(ass);
  if (Math.abs(ass - 90) < VERY_SMALL) ass = 90;
  if (Math.abs(ass - 180) < VERY_SMALL) ass = 180;
  if (Math.abs(ass - 270) < VERY_SMALL) ass = 270;
  if (Math.abs(ass - 360) < VERY_SMALL) ass = 0;
  return ass;
}
function mcToArmc(mc, obliquity) {
  const mcNorm = normalizeAngle8(mc);
  const VERY_SMALL3 = 1 / 36e4;
  let armc;
  if (Math.abs(mcNorm - 90) <= VERY_SMALL3) {
    armc = 90;
  } else if (Math.abs(mcNorm - 270) <= VERY_SMALL3) {
    armc = 270;
  } else {
    const mcRad = mcNorm * DEG2RAD;
    const epsRad = obliquity * DEG2RAD;
    const tanMC = Math.tan(mcRad);
    armc = Math.atan(tanMC * Math.cos(epsRad)) * RAD2DEG;
    if (mcNorm > 90 && mcNorm <= 270) {
      armc = normalizeAngle8(armc + 180);
    }
  }
  return normalizeAngle8(armc);
}

// src/houses/house-systems/campanus.ts
function campanusHouses(ascendant, midheaven, latitude, obliquity) {
  const asc = normalizeAngle8(ascendant);
  const mc = normalizeAngle8(midheaven);
  const fi = latitude;
  const ekl = obliquity;
  const th = mcToArmc(mc, ekl);
  const sine = sind(ekl);
  const cose = cosd(ekl);
  const fh1 = asind(sind(fi) / 2);
  const fh2 = asind(Math.sqrt(3) / 2 * sind(fi));
  const cosfi = cosd(fi);
  let xh1;
  let xh2;
  if (Math.abs(cosfi) === 0) {
    if (fi > 0) {
      xh1 = xh2 = 90;
    } else {
      xh1 = xh2 = 270;
    }
  } else {
    xh1 = atand(Math.sqrt(3) / cosfi);
    xh2 = atand(1 / Math.sqrt(3) / cosfi);
  }
  const cusps = new Array(12);
  cusps[0] = asc;
  cusps[9] = mc;
  cusps[10] = asc1(th + 90 - xh1, fh1, sine, cose);
  cusps[11] = asc1(th + 90 - xh2, fh2, sine, cose);
  cusps[1] = asc1(th + 90 + xh2, fh2, sine, cose);
  cusps[2] = asc1(th + 90 + xh1, fh1, sine, cose);
  cusps[3] = oppositePoint(cusps[9]);
  cusps[4] = oppositePoint(cusps[10]);
  cusps[5] = oppositePoint(cusps[11]);
  cusps[6] = oppositePoint(cusps[0]);
  cusps[7] = oppositePoint(cusps[1]);
  cusps[8] = oppositePoint(cusps[2]);
  return {
    cusps
  };
}

// src/houses/house-systems/equal.ts
function equalHouses(ascendant) {
  const cusps = [];
  for (let house = 0; house < 12; house++) {
    cusps.push(normalizeAngle8(ascendant + house * 30));
  }
  return {
    cusps
  };
}

// src/houses/house-systems/porphyry.ts
function porphyryHouses(ascendant, midheaven) {
  const asc = normalizeAngle8(ascendant);
  const mc = normalizeAngle8(midheaven);
  const dsc = normalizeAngle8(asc + 180);
  const ic = normalizeAngle8(mc + 180);
  const quadrant1Size = signedAngularSeparation(asc, ic);
  const quadrant2Size = signedAngularSeparation(ic, dsc);
  const quadrant3Size = signedAngularSeparation(dsc, mc);
  const quadrant4Size = signedAngularSeparation(mc, asc);
  const house2 = normalizeAngle8(asc + quadrant1Size / 3);
  const house3 = normalizeAngle8(asc + quadrant1Size * 2 / 3);
  const house5 = normalizeAngle8(ic + quadrant2Size / 3);
  const house6 = normalizeAngle8(ic + quadrant2Size * 2 / 3);
  const house8 = normalizeAngle8(dsc + quadrant3Size / 3);
  const house9 = normalizeAngle8(dsc + quadrant3Size * 2 / 3);
  const house11 = normalizeAngle8(mc + quadrant4Size / 3);
  const house12 = normalizeAngle8(mc + quadrant4Size * 2 / 3);
  return {
    cusps: [
      asc,
      // House 1
      house2,
      // House 2
      house3,
      // House 3
      ic,
      // House 4
      house5,
      // House 5
      house6,
      // House 6
      dsc,
      // House 7
      house8,
      // House 8
      house9,
      // House 9
      mc,
      // House 10
      house11,
      // House 11
      house12
      // House 12
    ]
  };
}

// src/houses/house-systems/koch.ts
function kochHouses(ascendant, midheaven, latitude, obliquity) {
  const asc = normalizeAngle8(ascendant);
  const mc = normalizeAngle8(midheaven);
  const fi = latitude;
  const ekl = obliquity;
  if (Math.abs(fi) >= 90 - ekl) {
    console.warn(`Koch: latitude ${fi.toFixed(1)}\xB0 is within polar circle, using Porphyry instead`);
    return porphyryHouses(asc, mc);
  }
  const th = mcToArmc(mc, ekl);
  const sine = sind(ekl);
  const cose = cosd(ekl);
  const tanfi = tand(fi);
  let sina = sind(mc) * sine / cosd(fi);
  if (sina > 1) sina = 1;
  if (sina < -1) sina = -1;
  const cosa = Math.sqrt(1 - sina * sina);
  const c = atand(tanfi / cosa);
  const ad3 = asind(sind(c) * sina) / 3;
  const cusps = new Array(12);
  cusps[0] = asc;
  cusps[9] = mc;
  cusps[10] = asc1(th + 30 - 2 * ad3, fi, sine, cose);
  cusps[11] = asc1(th + 60 - ad3, fi, sine, cose);
  cusps[1] = asc1(th + 120 + ad3, fi, sine, cose);
  cusps[2] = asc1(th + 150 + 2 * ad3, fi, sine, cose);
  cusps[3] = oppositePoint(cusps[9]);
  cusps[4] = oppositePoint(cusps[10]);
  cusps[5] = oppositePoint(cusps[11]);
  cusps[6] = oppositePoint(cusps[0]);
  cusps[7] = oppositePoint(cusps[1]);
  cusps[8] = oppositePoint(cusps[2]);
  return {
    cusps
  };
}

// src/houses/constants.ts
var MAX_LATITUDE_PLACIDUS = 66.5;
var MAX_ABSOLUTE_LATITUDE = 90;
var MAX_ABSOLUTE_LONGITUDE = 180;
var EPSILON = 1e-10;
var MAX_ITERATIONS2 = 50;
var CONVERGENCE_TOLERANCE2 = 1e-4;
var HOUSE_SYSTEM_NAMES = {
  placidus: "Placidus",
  koch: "Koch",
  equal: "Equal",
  "whole-sign": "Whole Sign",
  porphyry: "Porphyry",
  regiomontanus: "Regiomontanus",
  campanus: "Campanus"
};
var OBLIQUITY_COEFFICIENTS2 = {
  // Constant term in degrees
  C0: 23.43929111,
  // Linear term in degrees per century
  C1: -0.013004166,
  // Quadratic term in degrees per century²
  C2: -1.6388889e-7,
  // Cubic term in degrees per century³
  C3: 50361111e-14
};

// src/houses/house-systems/placidus.ts
var VERY_SMALL2 = 1 / 36e4;
function signedDifference(a, b) {
  let diff = a - b;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return diff;
}
function placidusHouses(ascendant, midheaven, latitude, obliquity) {
  const asc = normalizeAngle8(ascendant);
  const mc = normalizeAngle8(midheaven);
  const fi = latitude;
  const ekl = obliquity;
  const th = mcToArmc(mc, ekl);
  if (Math.abs(fi) >= 90 - ekl) {
    console.warn(
      `Placidus: latitude ${fi.toFixed(1)}\xB0 is within polar circle, using Porphyry instead`
    );
    return porphyryHouses(asc, mc);
  }
  const sine = sind(ekl);
  const cose = cosd(ekl);
  const tane = tand(ekl);
  const tanfi = tand(fi);
  const a = asind(tanfi * tane);
  const fh1 = atand(sind(a / 3) / tane);
  const fh2 = atand(sind(a * 2 / 3) / tane);
  const cusps = new Array(12);
  cusps[0] = asc;
  cusps[9] = mc;
  const housesToCalc = [
    { house: 11, rectasc: 30, fh: fh1, divisor: 3 },
    { house: 12, rectasc: 60, fh: fh2, divisor: 1.5 },
    { house: 2, rectasc: 120, fh: fh2, divisor: 1.5 },
    { house: 3, rectasc: 150, fh: fh1, divisor: 3 }
  ];
  for (const { house, rectasc, fh, divisor } of housesToCalc) {
    const ra = normalizeAngle8(rectasc + th);
    const ih = house - 1;
    let tant = tand(asind(sine * sind(asc1(ra, fh, sine, cose))));
    if (Math.abs(tant) < VERY_SMALL2) {
      cusps[ih] = ra;
    } else {
      let f = atand(sind(asind(tanfi * tant) / divisor) / tant);
      cusps[ih] = asc1(ra, f, sine, cose);
      let cuspsv = 0;
      let converged = false;
      for (let i = 1; i <= MAX_ITERATIONS2; i++) {
        tant = tand(asind(sine * sind(cusps[ih])));
        if (Math.abs(tant) < VERY_SMALL2) {
          cusps[ih] = ra;
          converged = true;
          break;
        }
        f = atand(sind(asind(tanfi * tant) / divisor) / tant);
        cusps[ih] = asc1(ra, f, sine, cose);
        if (i > 1 && Math.abs(signedDifference(cusps[ih], cuspsv)) < VERY_SMALL2) {
          converged = true;
          break;
        }
        cuspsv = cusps[ih];
      }
      if (!converged) {
        console.warn(
          `Placidus: failed to converge for house ${house} at latitude ${fi.toFixed(1)}\xB0, using Porphyry`
        );
        return porphyryHouses(asc, mc);
      }
    }
  }
  cusps[3] = oppositePoint(cusps[9]);
  cusps[4] = oppositePoint(cusps[10]);
  cusps[5] = oppositePoint(cusps[11]);
  cusps[6] = oppositePoint(cusps[0]);
  cusps[7] = oppositePoint(cusps[1]);
  cusps[8] = oppositePoint(cusps[2]);
  return {
    cusps
  };
}

// src/houses/house-systems/regiomontanus.ts
function regiomontanusHouses(ascendant, midheaven, latitude, obliquity) {
  const asc = normalizeAngle8(ascendant);
  const mc = normalizeAngle8(midheaven);
  const fi = latitude;
  const ekl = obliquity;
  const th = mcToArmc(mc, ekl);
  const sine = sind(ekl);
  const cose = cosd(ekl);
  const tanfi = tand(fi);
  const fh1 = atand(tanfi * 0.5);
  const fh2 = atand(tanfi * cosd(30));
  const cusps = new Array(12);
  cusps[0] = asc;
  cusps[9] = mc;
  cusps[10] = asc1(30 + th, fh1, sine, cose);
  cusps[11] = asc1(60 + th, fh2, sine, cose);
  cusps[1] = asc1(120 + th, fh2, sine, cose);
  cusps[2] = asc1(150 + th, fh1, sine, cose);
  cusps[3] = oppositePoint(cusps[9]);
  cusps[4] = oppositePoint(cusps[10]);
  cusps[5] = oppositePoint(cusps[11]);
  cusps[6] = oppositePoint(cusps[0]);
  cusps[7] = oppositePoint(cusps[1]);
  cusps[8] = oppositePoint(cusps[2]);
  return {
    cusps
  };
}

// src/houses/house-systems/whole-sign.ts
function wholeSignHouses(ascendant) {
  const normalizedAsc = normalizeAngle8(ascendant);
  const signIndex = Math.floor(normalizedAsc / 30);
  const house1Cusp = signIndex * 30;
  const cusps = [];
  for (let house = 0; house < 12; house++) {
    cusps.push(normalizeAngle8(house1Cusp + house * 30));
  }
  return {
    cusps
  };
}

// src/houses/obliquity.ts
function meanObliquity(T) {
  const { C0, C1, C2, C3 } = OBLIQUITY_COEFFICIENTS2;
  const obliquity = C0 + C1 * T + C2 * T * T + C3 * T * T * T;
  return obliquity;
}
function obliquityOfEcliptic(jd) {
  const T = (jd - 2451545) / 36525;
  return meanObliquity(T);
}

// src/houses/validation.ts
function normalizeLatitude(lat) {
  let normalized = (lat % 360 + 360) % 360;
  if (normalized > 180) {
    normalized = normalized - 360;
  }
  if (normalized > 90) {
    normalized = 180 - normalized;
  } else if (normalized < -90) {
    normalized = -180 - normalized;
  }
  return normalized;
}
function normalizeLongitude2(lon) {
  let normalized = (lon % 360 + 360) % 360;
  if (normalized > 180) {
    normalized = normalized - 360;
  }
  return normalized;
}
function validateLocation(location) {
  const errors = [];
  if (typeof location.latitude !== "number" || !Number.isFinite(location.latitude)) {
    errors.push("Latitude must be a finite number");
  } else if (location.latitude < -MAX_ABSOLUTE_LATITUDE || location.latitude > MAX_ABSOLUTE_LATITUDE) {
    errors.push(
      `Latitude must be between -${MAX_ABSOLUTE_LATITUDE} and +${MAX_ABSOLUTE_LATITUDE}, got ${location.latitude}`
    );
  }
  if (typeof location.longitude !== "number" || !Number.isFinite(location.longitude)) {
    errors.push("Longitude must be a finite number");
  } else if (location.longitude < -360 || location.longitude > 360) {
    errors.push(`Longitude must be between -360 and +360, got ${location.longitude}`);
  }
  if (location.elevation !== void 0) {
    if (typeof location.elevation !== "number" || !Number.isFinite(location.elevation)) {
      errors.push("Elevation must be a finite number");
    } else if (location.elevation < -500 || location.elevation > 1e4) {
      errors.push(
        `Elevation ${location.elevation}m is outside reasonable range (-500 to 10000 meters)`
      );
    }
  }
  return {
    valid: errors.length === 0,
    errors
  };
}
function isHouseSystemAvailable(system, latitude) {
  const absLatitude = Math.abs(latitude);
  switch (system) {
    case "placidus":
    case "koch":
      return absLatitude < MAX_LATITUDE_PLACIDUS;
    case "equal":
    case "whole-sign":
      return absLatitude < MAX_ABSOLUTE_LATITUDE;
    case "porphyry":
    case "regiomontanus":
    case "campanus":
      return absLatitude < MAX_ABSOLUTE_LATITUDE;
    default:
      return true;
  }
}
function getAvailableHouseSystems(latitude) {
  const systems = [
    "placidus",
    "koch",
    "equal",
    "whole-sign",
    "porphyry",
    "regiomontanus",
    "campanus"
  ];
  return systems.filter((system) => isHouseSystemAvailable(system, latitude));
}
function getFallbackHouseSystem(preferredSystem, latitude) {
  if (isHouseSystemAvailable(preferredSystem, latitude)) {
    return preferredSystem;
  }
  const fallbackOrder = ["porphyry", "equal", "whole-sign"];
  for (const fallback of fallbackOrder) {
    if (isHouseSystemAvailable(fallback, latitude)) {
      return fallback;
    }
  }
  return "equal";
}

// src/houses/houses.ts
function calculateHouses(location, lst, julianCenturies, system = "placidus") {
  const validation = validateLocation(location);
  if (!validation.valid) {
    throw new Error(`Invalid location: ${validation.errors.join(", ")}`);
  }
  const { latitude } = location;
  const obliquity = meanObliquity(julianCenturies);
  const angles = calculateAngles(lst, obliquity, latitude);
  let cusps;
  switch (system) {
    case "equal":
      cusps = equalHouses(angles.ascendant);
      break;
    case "whole-sign":
      cusps = wholeSignHouses(angles.ascendant);
      break;
    case "porphyry":
      cusps = porphyryHouses(angles.ascendant, angles.midheaven);
      break;
    case "placidus":
      cusps = placidusHouses(angles.ascendant, angles.midheaven, latitude, obliquity);
      break;
    case "koch":
      cusps = kochHouses(angles.ascendant, angles.midheaven, latitude, obliquity);
      break;
    case "regiomontanus":
      cusps = regiomontanusHouses(angles.ascendant, angles.midheaven, latitude, obliquity);
      break;
    case "campanus":
      cusps = campanusHouses(angles.ascendant, angles.midheaven, latitude, obliquity);
      break;
    default:
      throw new Error(`Unknown house system: ${system}`);
  }
  return {
    system,
    angles,
    cusps,
    latitude: location.latitude,
    longitude: location.longitude,
    lst,
    obliquity
  };
}
function calculateAnglesOnly(location, lst, julianCenturies) {
  const validation = validateLocation(location);
  if (!validation.valid) {
    throw new Error(`Invalid location: ${validation.errors.join(", ")}`);
  }
  const obliquity = meanObliquity(julianCenturies);
  return calculateAngles(lst, obliquity, location.latitude);
}
function calculateMultipleSystems(location, lst, julianCenturies, systems = [
  "equal",
  "whole-sign",
  "porphyry",
  "placidus",
  "koch",
  "regiomontanus",
  "campanus"
]) {
  const results = {};
  for (const system of systems) {
    results[system] = calculateHouses(location, lst, julianCenturies, system);
  }
  return results;
}
function getSupportedHouseSystems() {
  return ["equal", "whole-sign", "porphyry", "placidus", "koch", "regiomontanus", "campanus"];
}
function getHouseSystemName(system) {
  const names = {
    equal: "Equal",
    "whole-sign": "Whole Sign",
    porphyry: "Porphyry",
    placidus: "Placidus",
    koch: "Koch",
    regiomontanus: "Regiomontanus",
    campanus: "Campanus"
  };
  return names[system];
}
function systemRequiresLatitude(system) {
  return system !== "equal" && system !== "whole-sign";
}
function systemWorksAtPolarCircle(system) {
  return system !== "placidus" && system !== "koch";
}

// src/chart/constants.ts
var MIN_YEAR = -4e3;
var MAX_YEAR = 4e3;
var RECOMMENDED_MIN_YEAR = 1800;
var RECOMMENDED_MAX_YEAR = 2200;
var MIN_TIMEZONE = -12;
var MAX_TIMEZONE = 14;
var MAX_LATITUDE_PLACIDUS2 = 66;
var MAX_LATITUDE_ANY = 89.9;
var DEFAULT_HOUSE_SYSTEM = "placidus";
var FALLBACK_HOUSE_SYSTEM = "porphyry";
var POLAR_FALLBACK_HOUSE_SYSTEM = "whole-sign";
var MAJOR_ASPECTS2 = [
  "conjunction" /* Conjunction */,
  "sextile" /* Sextile */,
  "square" /* Square */,
  "trine" /* Trine */,
  "opposition" /* Opposition */
];
var ALL_ASPECTS2 = [
  "conjunction" /* Conjunction */,
  "semi-sextile" /* SemiSextile */,
  "semi-square" /* SemiSquare */,
  "sextile" /* Sextile */,
  "quintile" /* Quintile */,
  "square" /* Square */,
  "trine" /* Trine */,
  "sesquiquadrate" /* Sesquiquadrate */,
  "biquintile" /* Biquintile */,
  "quincunx" /* Quincunx */,
  "opposition" /* Opposition */
];
var DEFAULT_OPTIONS = {
  houseSystem: DEFAULT_HOUSE_SYSTEM,
  includeAsteroids: true,
  includeChiron: true,
  includeLilith: "mean",
  includeNodes: "true",
  includeLots: true,
  aspectTypes: MAJOR_ASPECTS2,
  aspectOrbs: {},
  includePatterns: true,
  minimumAspectStrength: 0
};
var BODY_NAMES = {
  sun: "Sun",
  moon: "Moon",
  mercury: "Mercury",
  venus: "Venus",
  mars: "Mars",
  jupiter: "Jupiter",
  saturn: "Saturn",
  uranus: "Uranus",
  neptune: "Neptune",
  pluto: "Pluto",
  chiron: "Chiron",
  ceres: "Ceres",
  pallas: "Pallas",
  juno: "Juno",
  vesta: "Vesta",
  northNode: "North Node",
  southNode: "South Node",
  meanLilith: "Mean Lilith",
  trueLilith: "True Lilith",
  partOfFortune: "Part of Fortune",
  partOfSpirit: "Part of Spirit"
};
var PLANET_ORDER = [
  "Sun",
  "Moon",
  "Mercury",
  "Venus",
  "Mars",
  "Jupiter",
  "Saturn",
  "Uranus",
  "Neptune",
  "Pluto",
  "Chiron",
  "Ceres",
  "Pallas",
  "Juno",
  "Vesta"
];
var LATITUDE_SENSITIVE_SYSTEMS = ["placidus", "koch"];
var STATIONARY_THRESHOLD = 0.01;
var VALIDATION_MESSAGES = {
  invalidYear: (year) => `Year ${year} is outside valid range (${MIN_YEAR} to ${MAX_YEAR})`,
  invalidMonth: (month) => `Month ${month} is invalid (must be 1-12)`,
  invalidDay: (day, month, year) => `Day ${day} is invalid for ${month}/${year}`,
  invalidHour: (hour) => `Hour ${hour} is invalid (must be 0-23)`,
  invalidMinute: (minute) => `Minute ${minute} is invalid (must be 0-59)`,
  invalidSecond: (second) => `Second ${second} is invalid (must be 0-59)`,
  invalidTimezone: (tz) => `Timezone ${tz} is outside valid range (${MIN_TIMEZONE} to ${MAX_TIMEZONE})`,
  invalidLatitude: (lat) => `Latitude ${lat} is invalid (must be -90 to +90)`,
  invalidLongitude: (lon) => `Longitude ${lon} is invalid (must be -180 to +180)`,
  yearOutOfRecommended: (year) => `Year ${year} is outside recommended range (${RECOMMENDED_MIN_YEAR}-${RECOMMENDED_MAX_YEAR}). Results may be less accurate.`,
  latitudeTooHighForSystem: (lat, system) => `Latitude ${lat}\xB0 is too high for ${system} house system. Using ${FALLBACK_HOUSE_SYSTEM} instead.`
};
var HOUSE_SYSTEM_NAMES2 = {
  placidus: "Placidus",
  koch: "Koch",
  equal: "Equal",
  "whole-sign": "Whole Sign",
  porphyry: "Porphyry",
  regiomontanus: "Regiomontanus",
  campanus: "Campanus"
};

// src/chart/types.ts
var ValidationError = class extends Error {
  constructor(message, field, value) {
    super(message);
    this.field = field;
    this.value = value;
    this.name = "ValidationError";
  }
};
var CalculationError = class extends Error {
  constructor(message, step, details) {
    super(message);
    this.step = step;
    this.details = details;
    this.name = "CalculationError";
  }
};

// src/chart/house-calculation.ts
function calculateChartHouses(location, lst, T, requestedSystem) {
  const warnings = [];
  let system = requestedSystem;
  const absLatitude = Math.abs(location.latitude);
  if (LATITUDE_SENSITIVE_SYSTEMS.includes(requestedSystem)) {
    if (absLatitude > MAX_LATITUDE_PLACIDUS2) {
      warnings.push(
        `${requestedSystem} house system does not work at latitude ${location.latitude}\xB0. Using ${FALLBACK_HOUSE_SYSTEM} instead.`
      );
      system = FALLBACK_HOUSE_SYSTEM;
    }
  }
  if (absLatitude > MAX_LATITUDE_ANY) {
    warnings.push(
      `Latitude ${location.latitude}\xB0 is extremely close to pole. Using ${POLAR_FALLBACK_HOUSE_SYSTEM} house system.`
    );
    system = POLAR_FALLBACK_HOUSE_SYSTEM;
  }
  let houseData;
  try {
    houseData = calculateHouses(location, lst, T, system);
  } catch (error) {
    if (system !== FALLBACK_HOUSE_SYSTEM) {
      warnings.push(`${system} house calculation failed. Using ${FALLBACK_HOUSE_SYSTEM} instead.`);
      system = FALLBACK_HOUSE_SYSTEM;
      houseData = calculateHouses(location, lst, T, system);
    } else {
      throw new CalculationError(
        `House calculation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        "house-calculation",
        { location, lst, T, system }
      );
    }
  }
  const angles = buildChartAngles(houseData);
  const houses = buildChartHouses(houseData, system);
  return {
    system,
    systemName: HOUSE_SYSTEM_NAMES2[system],
    angles,
    houses,
    warnings
  };
}
function buildChartAngles(houseData) {
  return {
    ascendant: buildAngle("Ascendant", "ASC", houseData.angles.ascendant),
    midheaven: buildAngle("Midheaven", "MC", houseData.angles.midheaven),
    descendant: buildAngle("Descendant", "DSC", houseData.angles.descendant),
    imumCoeli: buildAngle("Imum Coeli", "IC", houseData.angles.imumCoeli)
  };
}
function buildAngle(name, abbrev, longitude) {
  const zodiacPos = eclipticToZodiac(longitude);
  return {
    name,
    abbrev,
    longitude,
    sign: zodiacPos.sign,
    signName: getSignName(zodiacPos.sign),
    degree: zodiacPos.degree,
    minute: zodiacPos.minute,
    second: zodiacPos.second,
    formatted: zodiacPos.formatted
  };
}
function buildChartHouses(houseData, system) {
  const cusps = [];
  for (let i = 0; i < 12; i++) {
    const longitude = houseData.cusps.cusps[i];
    const nextLongitude = houseData.cusps.cusps[(i + 1) % 12];
    let size = nextLongitude - longitude;
    if (size < 0) {
      size += 360;
    }
    const zodiacPos = eclipticToZodiac(longitude);
    cusps.push({
      house: i + 1,
      longitude,
      sign: zodiacPos.sign,
      signName: getSignName(zodiacPos.sign),
      degree: zodiacPos.degree,
      minute: zodiacPos.minute,
      formatted: zodiacPos.formatted,
      size
    });
  }
  return {
    system,
    systemName: HOUSE_SYSTEM_NAMES2[system],
    cusps
  };
}
function getHouseNumber(longitude, cusps) {
  let lon = longitude % 360;
  if (lon < 0) {
    lon += 360;
  }
  for (let i = 0; i < 12; i++) {
    const cusp = cusps[i];
    const nextCusp = cusps[(i + 1) % 12];
    if (isInHouse(lon, cusp, nextCusp)) {
      return i + 1;
    }
  }
  return 1;
}
function isInHouse(longitude, cusp, nextCusp) {
  if (nextCusp > cusp) {
    return longitude >= cusp && longitude < nextCusp;
  }
  return longitude >= cusp || longitude < nextCusp;
}
function getCuspLongitudes(houses) {
  return houses.cusps.map((c) => c.longitude);
}
function getAngleConjunction(longitude, angles, orb = 3) {
  const checkAngle = (angleLon, name) => {
    let diff = Math.abs(longitude - angleLon);
    if (diff > 180) {
      diff = 360 - diff;
    }
    return diff <= orb ? name : null;
  };
  return checkAngle(angles.ascendant.longitude, "ASC") ?? checkAngle(angles.midheaven.longitude, "MC") ?? checkAngle(angles.descendant.longitude, "DSC") ?? checkAngle(angles.imumCoeli.longitude, "IC");
}

// src/ephemeris/lots.ts
function calculatePartOfFortune(sunLon, moonLon, ascendant, isDayChart) {
  let pof;
  if (isDayChart) {
    pof = ascendant + moonLon - sunLon;
  } else {
    pof = ascendant + sunLon - moonLon;
  }
  pof = pof % 360;
  if (pof < 0) pof += 360;
  return pof;
}
function getPartOfFortune(jd, ascendant, options = {}) {
  const { useDayNightFormula = true, isDayChart: forceDayChart } = options;
  const sun = getSunPosition(jd);
  const moon = getMoonPosition(jd);
  let isDayChart;
  if (forceDayChart !== void 0) {
    isDayChart = forceDayChart;
  } else if (!useDayNightFormula) {
    isDayChart = true;
  } else {
    const descendant = (ascendant + 180) % 360;
    let sunAboveHorizon;
    if (ascendant < descendant) {
      sunAboveHorizon = sun.longitude >= descendant || sun.longitude < ascendant;
    } else {
      sunAboveHorizon = sun.longitude >= descendant && sun.longitude < ascendant;
    }
    isDayChart = sunAboveHorizon;
  }
  const longitude = calculatePartOfFortune(sun.longitude, moon.longitude, ascendant, isDayChart);
  return {
    longitude,
    isDayChart,
    sunLongitude: sun.longitude,
    moonLongitude: moon.longitude,
    ascendant
  };
}
function calculatePartOfFortuneDayFormula(sunLon, moonLon, ascendant) {
  return calculatePartOfFortune(sunLon, moonLon, ascendant, true);
}
function calculatePartOfSpirit(sunLon, moonLon, ascendant, isDayChart) {
  return calculatePartOfFortune(sunLon, moonLon, ascendant, !isDayChart);
}
function getPartOfSpirit(jd, ascendant, options = {}) {
  const pof = getPartOfFortune(jd, ascendant, options);
  const longitude = calculatePartOfSpirit(
    pof.sunLongitude,
    pof.moonLongitude,
    pof.ascendant,
    pof.isDayChart
  );
  return {
    ...pof,
    longitude
  };
}
var LOTS_CHARACTERISTICS = {
  /** Part of Fortune moves approximately this many degrees per day (tied to Moon) */
  dailyMotion: 13,
  /** Part of Fortune completes zodiac cycle in approximately this many days */
  period: 27.3
};

// src/chart/planet-positions.ts
function calculatePlanetPositions(jd, options) {
  const planets = /* @__PURE__ */ new Map();
  planets.set("Sun" /* Sun */, getSunPosition(jd));
  planets.set("Moon" /* Moon */, getMoonPosition(jd));
  planets.set("Mercury" /* Mercury */, getMercuryPosition(jd));
  planets.set("Venus" /* Venus */, getVenusPosition(jd));
  planets.set("Mars" /* Mars */, getMarsPosition(jd));
  planets.set("Jupiter" /* Jupiter */, getJupiterPosition(jd));
  planets.set("Saturn" /* Saturn */, getSaturnPosition(jd));
  planets.set("Uranus" /* Uranus */, getUranusPosition(jd));
  planets.set("Neptune" /* Neptune */, getNeptunePosition(jd));
  planets.set("Pluto" /* Pluto */, getPlutoPosition(jd));
  const result = { planets };
  if (options.includeChiron) {
    result.chiron = getChironPosition(jd);
  }
  if (options.includeAsteroids) {
    result.asteroids = {
      ceres: getCeresPosition(jd),
      pallas: getPallasPosition(jd),
      juno: getJunoPosition(jd),
      vesta: getVestaPosition(jd)
    };
  }
  if (options.includeNodes) {
    result.nodes = {};
    if (options.includeNodes === "mean" || options.includeNodes === "both") {
      const meanN = getMeanNode(jd);
      result.nodes.meanNorth = { longitude: meanN.northNode };
      result.nodes.meanSouth = { longitude: meanN.southNode };
    }
    if (options.includeNodes === "true" || options.includeNodes === "both") {
      const trueN = getTrueNode(jd);
      result.nodes.trueNorth = { longitude: trueN.northNode };
      result.nodes.trueSouth = { longitude: trueN.southNode };
    }
  }
  if (options.includeLilith) {
    result.lilith = {};
    if (options.includeLilith === "mean" || options.includeLilith === "both") {
      const meanL = getMeanLilith(jd);
      result.lilith.mean = { longitude: meanL.longitude };
    }
    if (options.includeLilith === "true" || options.includeLilith === "both") {
      const trueL = getTrueLilith(jd);
      result.lilith.true = { longitude: trueL.longitude };
    }
  }
  return result;
}
function calculateLots(sunLongitude, moonLongitude2, ascendant, isDaytime, includeLots) {
  if (!includeLots) {
    return {};
  }
  return {
    fortune: {
      longitude: calculatePartOfFortune(sunLongitude, moonLongitude2, ascendant, isDaytime)
    },
    spirit: { longitude: calculatePartOfSpirit(sunLongitude, moonLongitude2, ascendant, isDaytime) }
  };
}
function isRetrograde2(position) {
  return position.longitudeSpeed < 0;
}
function isStationary(position) {
  return Math.abs(position.longitudeSpeed) < STATIONARY_THRESHOLD;
}
function getBodyName(body) {
  const nameMap = {
    ["Sun" /* Sun */]: BODY_NAMES.sun,
    ["Moon" /* Moon */]: BODY_NAMES.moon,
    ["Mercury" /* Mercury */]: BODY_NAMES.mercury,
    ["Venus" /* Venus */]: BODY_NAMES.venus,
    ["Mars" /* Mars */]: BODY_NAMES.mars,
    ["Jupiter" /* Jupiter */]: BODY_NAMES.jupiter,
    ["Saturn" /* Saturn */]: BODY_NAMES.saturn,
    ["Uranus" /* Uranus */]: BODY_NAMES.uranus,
    ["Neptune" /* Neptune */]: BODY_NAMES.neptune,
    ["Pluto" /* Pluto */]: BODY_NAMES.pluto,
    ["Chiron" /* Chiron */]: BODY_NAMES.chiron,
    ["Ceres" /* Ceres */]: BODY_NAMES.ceres,
    ["Pallas" /* Pallas */]: BODY_NAMES.pallas,
    ["Juno" /* Juno */]: BODY_NAMES.juno,
    ["Vesta" /* Vesta */]: BODY_NAMES.vesta,
    ["NorthNode" /* NorthNode */]: BODY_NAMES.northNode,
    ["TrueNorthNode" /* TrueNorthNode */]: BODY_NAMES.northNode,
    ["SouthNode" /* SouthNode */]: BODY_NAMES.southNode,
    ["TrueSouthNode" /* TrueSouthNode */]: BODY_NAMES.southNode,
    ["Lilith" /* Lilith */]: BODY_NAMES.meanLilith,
    ["TrueLilith" /* TrueLilith */]: BODY_NAMES.trueLilith
  };
  return nameMap[body] ?? String(body);
}
function getPlanetOrder() {
  return PLANET_ORDER;
}
function sortedPlanetList(positions) {
  const bodyOrder = [
    "Sun" /* Sun */,
    "Moon" /* Moon */,
    "Mercury" /* Mercury */,
    "Venus" /* Venus */,
    "Mars" /* Mars */,
    "Jupiter" /* Jupiter */,
    "Saturn" /* Saturn */,
    "Uranus" /* Uranus */,
    "Neptune" /* Neptune */,
    "Pluto" /* Pluto */
  ];
  const result = [];
  for (const body of bodyOrder) {
    const pos = positions.get(body);
    if (pos) {
      result.push([body, pos]);
    }
  }
  return result;
}

// src/chart/zodiac-placement.ts
var BODY_TO_PLANET = {
  ["Sun" /* Sun */]: "Sun" /* Sun */,
  ["Moon" /* Moon */]: "Moon" /* Moon */,
  ["Mercury" /* Mercury */]: "Mercury" /* Mercury */,
  ["Venus" /* Venus */]: "Venus" /* Venus */,
  ["Mars" /* Mars */]: "Mars" /* Mars */,
  ["Jupiter" /* Jupiter */]: "Jupiter" /* Jupiter */,
  ["Saturn" /* Saturn */]: "Saturn" /* Saturn */,
  ["Uranus" /* Uranus */]: "Uranus" /* Uranus */,
  ["Neptune" /* Neptune */]: "Neptune" /* Neptune */,
  ["Pluto" /* Pluto */]: "Pluto" /* Pluto */
};
function buildChartPlanet(body, position, houses) {
  const zodiacPos = eclipticToZodiac(position.longitude);
  const cusps = houses.cusps.map((c) => c.longitude);
  const house = getHouseNumber(position.longitude, cusps);
  const planet = BODY_TO_PLANET[body];
  let dignity;
  if (planet !== void 0) {
    const dignityResult = getPlanetaryDignity(planet, zodiacPos.sign);
    dignity = {
      state: dignityResult.state,
      strength: dignityResult.strength,
      description: dignityResult.description
    };
  } else {
    dignity = {
      state: "Peregrine" /* Peregrine */,
      strength: 0,
      description: "No traditional dignity"
    };
  }
  return {
    name: getBodyName(body),
    body,
    longitude: position.longitude,
    latitude: position.latitude,
    distance: position.distance,
    longitudeSpeed: position.longitudeSpeed,
    isRetrograde: isRetrograde2(position),
    sign: zodiacPos.sign,
    signName: getSignName(zodiacPos.sign),
    degree: zodiacPos.degree,
    minute: zodiacPos.minute,
    second: zodiacPos.second,
    formatted: zodiacPos.formatted,
    house,
    dignity
  };
}
function buildChartNode(name, type, longitude, houses) {
  const zodiacPos = eclipticToZodiac(longitude);
  const cusps = houses.cusps.map((c) => c.longitude);
  const house = getHouseNumber(longitude, cusps);
  return {
    name,
    type,
    longitude,
    sign: zodiacPos.sign,
    signName: getSignName(zodiacPos.sign),
    degree: zodiacPos.degree,
    minute: zodiacPos.minute,
    formatted: zodiacPos.formatted,
    house
  };
}
function buildChartLilith(type, longitude, houses) {
  const zodiacPos = eclipticToZodiac(longitude);
  const cusps = houses.cusps.map((c) => c.longitude);
  const house = getHouseNumber(longitude, cusps);
  return {
    name: type === "Mean" ? "Mean Lilith" : "True Lilith",
    type,
    longitude,
    sign: zodiacPos.sign,
    signName: getSignName(zodiacPos.sign),
    degree: zodiacPos.degree,
    minute: zodiacPos.minute,
    formatted: zodiacPos.formatted,
    house
  };
}
function buildChartLot(name, formula, longitude, houses) {
  const zodiacPos = eclipticToZodiac(longitude);
  const cusps = houses.cusps.map((c) => c.longitude);
  const house = getHouseNumber(longitude, cusps);
  return {
    name,
    formula,
    longitude,
    sign: zodiacPos.sign,
    signName: getSignName(zodiacPos.sign),
    degree: zodiacPos.degree,
    minute: zodiacPos.minute,
    formatted: zodiacPos.formatted,
    house
  };
}
function getSignForLongitude(longitude) {
  const zodiacPos = eclipticToZodiac(longitude);
  return zodiacPos.sign;
}
function getElement(sign) {
  const fireSign = [0 /* Aries */, 4 /* Leo */, 8 /* Sagittarius */];
  const earthSigns = [1 /* Taurus */, 5 /* Virgo */, 9 /* Capricorn */];
  const airSigns = [2 /* Gemini */, 6 /* Libra */, 10 /* Aquarius */];
  if (fireSign.includes(sign)) return "fire";
  if (earthSigns.includes(sign)) return "earth";
  if (airSigns.includes(sign)) return "air";
  return "water";
}
function getModality(sign) {
  const cardinal = [0 /* Aries */, 3 /* Cancer */, 6 /* Libra */, 9 /* Capricorn */];
  const fixed = [1 /* Taurus */, 4 /* Leo */, 7 /* Scorpio */, 10 /* Aquarius */];
  if (cardinal.includes(sign)) return "cardinal";
  if (fixed.includes(sign)) return "fixed";
  return "mutable";
}
function getPolarity(sign) {
  const positive = [0 /* Aries */, 2 /* Gemini */, 4 /* Leo */, 6 /* Libra */, 8 /* Sagittarius */, 10 /* Aquarius */];
  return positive.includes(sign) ? "positive" : "negative";
}
function getQuadrant(house) {
  if (house >= 1 && house <= 3) return 1;
  if (house >= 4 && house <= 6) return 2;
  if (house >= 7 && house <= 9) return 3;
  return 4;
}
function getHemisphere(house) {
  const vertical = house >= 1 && house <= 6 ? "north" : "south";
  const eastern = [10, 11, 12, 1, 2, 3];
  const horizontal = eastern.includes(house) ? "east" : "west";
  return { vertical, horizontal };
}

// src/chart/chart-summary.ts
function generateChartSummary(planets, patterns) {
  return {
    elements: calculateElementDistribution(planets),
    modalities: calculateModalityDistribution(planets),
    hemispheres: calculateHemisphereDistribution(planets),
    quadrants: calculateQuadrantDistribution(planets),
    polarity: calculatePolarityBalance(planets),
    retrograde: getRetrogradePlanets(planets),
    patterns: patterns.map((p) => p.type),
    dignified: categorizeByDignity(planets)
  };
}
function calculateElementDistribution(planets) {
  const result = {
    fire: [],
    earth: [],
    air: [],
    water: []
  };
  for (const planet of planets) {
    const element = getElement(planet.sign);
    result[element].push(planet.name);
  }
  return result;
}
function calculateModalityDistribution(planets) {
  const result = {
    cardinal: [],
    fixed: [],
    mutable: []
  };
  for (const planet of planets) {
    const modality = getModality(planet.sign);
    result[modality].push(planet.name);
  }
  return result;
}
function calculateHemisphereDistribution(planets) {
  const result = {
    north: 0,
    south: 0,
    east: 0,
    west: 0
  };
  for (const planet of planets) {
    const hemi = getHemisphere(planet.house);
    result[hemi.vertical]++;
    result[hemi.horizontal]++;
  }
  return result;
}
function calculateQuadrantDistribution(planets) {
  const result = {
    first: [],
    second: [],
    third: [],
    fourth: []
  };
  const quadrantNames = {
    1: "first",
    2: "second",
    3: "third",
    4: "fourth"
  };
  for (const planet of planets) {
    const quadrant = getQuadrant(planet.house);
    result[quadrantNames[quadrant]].push(planet.name);
  }
  return result;
}
function calculatePolarityBalance(planets) {
  let positive = 0;
  let negative = 0;
  for (const planet of planets) {
    const polarity = getPolarity(planet.sign);
    if (polarity === "positive") {
      positive++;
    } else {
      negative++;
    }
  }
  return { positive, negative };
}
function getRetrogradePlanets(planets) {
  return planets.filter((p) => p.isRetrograde).map((p) => p.name);
}
function categorizeByDignity(planets) {
  const result = {
    domicile: [],
    exalted: [],
    detriment: [],
    fall: [],
    peregrine: []
  };
  for (const planet of planets) {
    switch (planet.dignity.state) {
      case "Domicile" /* Domicile */:
        result.domicile.push(planet.name);
        break;
      case "Exaltation" /* Exaltation */:
        result.exalted.push(planet.name);
        break;
      case "Detriment" /* Detriment */:
        result.detriment.push(planet.name);
        break;
      case "Fall" /* Fall */:
        result.fall.push(planet.name);
        break;
      default:
        result.peregrine.push(planet.name);
    }
  }
  return result;
}
function getDominantElement(elements) {
  const counts = {
    fire: elements.fire.length,
    earth: elements.earth.length,
    air: elements.air.length,
    water: elements.water.length
  };
  let dominant = "fire";
  let maxCount = 0;
  for (const [element, count] of Object.entries(counts)) {
    if (count > maxCount) {
      maxCount = count;
      dominant = element;
    }
  }
  return dominant;
}
function getDominantModality(modalities) {
  const counts = {
    cardinal: modalities.cardinal.length,
    fixed: modalities.fixed.length,
    mutable: modalities.mutable.length
  };
  let dominant = "cardinal";
  let maxCount = 0;
  for (const [modality, count] of Object.entries(counts)) {
    if (count > maxCount) {
      maxCount = count;
      dominant = modality;
    }
  }
  return dominant;
}
function getChartEmphasis(summary) {
  const emphasis = [];
  for (const [element, planets] of Object.entries(summary.elements)) {
    if (planets.length >= 4) {
      emphasis.push(`Strong ${element} emphasis`);
    }
  }
  for (const [modality, planets] of Object.entries(summary.modalities)) {
    if (planets.length >= 4) {
      emphasis.push(`Strong ${modality} emphasis`);
    }
  }
  const { north, south, east, west } = summary.hemispheres;
  if (north >= 7) emphasis.push("Northern hemisphere emphasis");
  if (south >= 7) emphasis.push("Southern hemisphere emphasis");
  if (east >= 7) emphasis.push("Eastern hemisphere emphasis");
  if (west >= 7) emphasis.push("Western hemisphere emphasis");
  if (summary.patterns.length > 0) {
    emphasis.push(`Contains ${summary.patterns.length} aspect pattern(s)`);
  }
  if (summary.retrograde.length >= 3) {
    emphasis.push(`${summary.retrograde.length} planets retrograde`);
  }
  return emphasis;
}

// src/time/constants.ts
var J2000_EPOCH2 = 2451545;
var DAYS_PER_CENTURY = 36525;
var MJD_EPOCH = 24000005e-1;
var UNIX_EPOCH_JD = 24405875e-1;
var SECONDS_PER_DAY = 86400;
var MINUTES_PER_DAY = 1440;
var HOURS_PER_DAY = 24;
var MINUTES_PER_HOUR = 60;
var SECONDS_PER_MINUTE = 60;
var SECONDS_PER_HOUR = 3600;
var DEGREES_PER_HOUR = 15;
var DEGREES_PER_CIRCLE2 = 360;
var ARCMINUTES_PER_DEGREE2 = 60;
var ARCSECONDS_PER_DEGREE2 = 3600;
var SIDEREAL_DAY_RATIO = 0.99726957;
var SIDEREAL_DAY_IN_DAYS = 0.99726957;
var SOLAR_DAY_IN_SIDEREAL_DAYS = 1.00273791;
var GREGORIAN_REFORM_JD = 22991605e-1;
var DAYS_IN_MONTH = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
var DAYS_IN_MONTH_LEAP = [0, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
var MONTH_NAMES = [
  "",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

// src/time/time-validation.ts
function isLeapYear(year) {
  if (year % 400 === 0) {
    return true;
  }
  if (year % 100 === 0) {
    return false;
  }
  if (year % 4 === 0) {
    return true;
  }
  return false;
}
function daysInMonth(year, month) {
  if (month < 1 || month > 12) {
    return 0;
  }
  if (month === 2 && isLeapYear(year)) {
    return DAYS_IN_MONTH_LEAP[2];
  }
  return DAYS_IN_MONTH[month];
}
function isValidDate(year, month, day) {
  if (month < 1 || month > 12) {
    return false;
  }
  if (day < 1) {
    return false;
  }
  const maxDays = daysInMonth(year, month);
  if (day > maxDays) {
    return false;
  }
  return true;
}
function isValidTime(hour, minute, second) {
  if (hour < 0 || hour >= 24) {
    return false;
  }
  if (minute < 0 || minute >= 60) {
    return false;
  }
  if (second < 0 || second >= 60) {
    return false;
  }
  return true;
}
function validateCalendarDateTime(date) {
  const errors = [];
  if (date.month < 1 || date.month > 12) {
    errors.push(`Month must be between 1 and 12, got ${date.month}`);
  }
  if (date.month >= 1 && date.month <= 12) {
    if (date.day < 1) {
      errors.push(`Day must be at least 1, got ${date.day}`);
    } else {
      const maxDays = daysInMonth(date.year, date.month);
      if (date.day > maxDays) {
        const monthNames = [
          "",
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December"
        ];
        errors.push(
          `Invalid day: ${monthNames[date.month]} ${date.day} doesn't exist in ${date.year}`
        );
      }
    }
  }
  if (date.hour < 0 || date.hour >= 24) {
    errors.push(`Hour must be between 0 and 23, got ${date.hour}`);
  }
  if (date.minute < 0 || date.minute >= 60) {
    errors.push(`Minute must be between 0 and 59, got ${date.minute}`);
  }
  if (date.second < 0 || date.second >= 60) {
    errors.push(`Second must be between 0 and 59, got ${date.second}`);
  }
  if (date.timezone !== void 0) {
    if (date.timezone < -12 || date.timezone > 14) {
      errors.push(`Unusual timezone offset: ${date.timezone} (expected -12 to +14)`);
    }
  }
  return {
    valid: errors.length === 0,
    errors
  };
}

// src/chart/input-validation.ts
function validateBirthData(birth) {
  const errors = [];
  const warnings = [];
  if (typeof birth.year !== "number" || !Number.isFinite(birth.year)) {
    errors.push({
      field: "year",
      message: "Year must be a finite number",
      value: birth.year
    });
  } else if (birth.year < MIN_YEAR || birth.year > MAX_YEAR) {
    errors.push({
      field: "year",
      message: VALIDATION_MESSAGES.invalidYear(birth.year),
      value: birth.year,
      suggestion: `Use a year between ${MIN_YEAR} and ${MAX_YEAR}`
    });
  } else if (birth.year < RECOMMENDED_MIN_YEAR || birth.year > RECOMMENDED_MAX_YEAR) {
    warnings.push(VALIDATION_MESSAGES.yearOutOfRecommended(birth.year));
  }
  if (typeof birth.month !== "number" || !Number.isInteger(birth.month)) {
    errors.push({
      field: "month",
      message: "Month must be an integer",
      value: birth.month
    });
  } else if (birth.month < 1 || birth.month > 12) {
    errors.push({
      field: "month",
      message: VALIDATION_MESSAGES.invalidMonth(birth.month),
      value: birth.month,
      suggestion: "Use a month between 1 and 12"
    });
  }
  if (typeof birth.day !== "number" || !Number.isInteger(birth.day)) {
    errors.push({
      field: "day",
      message: "Day must be an integer",
      value: birth.day
    });
  } else if (birth.day < 1 || birth.day > 31) {
    errors.push({
      field: "day",
      message: VALIDATION_MESSAGES.invalidDay(birth.day, birth.month, birth.year),
      value: birth.day
    });
  } else if (typeof birth.year === "number" && typeof birth.month === "number" && !isValidDate(birth.year, birth.month, birth.day)) {
    errors.push({
      field: "day",
      message: VALIDATION_MESSAGES.invalidDay(birth.day, birth.month, birth.year),
      value: birth.day,
      suggestion: getMaxDayForMonth(birth.year, birth.month)
    });
  }
  if (typeof birth.hour !== "number" || !Number.isFinite(birth.hour)) {
    errors.push({
      field: "hour",
      message: "Hour must be a finite number",
      value: birth.hour
    });
  } else if (birth.hour < 0 || birth.hour >= 24) {
    errors.push({
      field: "hour",
      message: VALIDATION_MESSAGES.invalidHour(birth.hour),
      value: birth.hour,
      suggestion: "Use an hour between 0 and 23"
    });
  }
  if (typeof birth.minute !== "number" || !Number.isInteger(birth.minute)) {
    errors.push({
      field: "minute",
      message: "Minute must be an integer",
      value: birth.minute
    });
  } else if (birth.minute < 0 || birth.minute >= 60) {
    errors.push({
      field: "minute",
      message: VALIDATION_MESSAGES.invalidMinute(birth.minute),
      value: birth.minute,
      suggestion: "Use a minute between 0 and 59"
    });
  }
  if (birth.second !== void 0) {
    if (typeof birth.second !== "number" || !Number.isFinite(birth.second)) {
      errors.push({
        field: "second",
        message: "Second must be a finite number",
        value: birth.second
      });
    } else if (birth.second < 0 || birth.second >= 60) {
      errors.push({
        field: "second",
        message: VALIDATION_MESSAGES.invalidSecond(birth.second),
        value: birth.second,
        suggestion: "Use a second between 0 and 59"
      });
    }
  }
  if (typeof birth.timezone !== "number" || !Number.isFinite(birth.timezone)) {
    errors.push({
      field: "timezone",
      message: "Timezone must be a finite number",
      value: birth.timezone
    });
  } else if (birth.timezone < MIN_TIMEZONE || birth.timezone > MAX_TIMEZONE) {
    errors.push({
      field: "timezone",
      message: VALIDATION_MESSAGES.invalidTimezone(birth.timezone),
      value: birth.timezone,
      suggestion: `Use a timezone offset between ${MIN_TIMEZONE} and ${MAX_TIMEZONE}`
    });
  }
  if (typeof birth.latitude !== "number" || !Number.isFinite(birth.latitude)) {
    errors.push({
      field: "latitude",
      message: "Latitude must be a finite number",
      value: birth.latitude
    });
  } else if (birth.latitude < -90 || birth.latitude > 90) {
    errors.push({
      field: "latitude",
      message: VALIDATION_MESSAGES.invalidLatitude(birth.latitude),
      value: birth.latitude,
      suggestion: "Use a latitude between -90 and +90"
    });
  }
  if (typeof birth.longitude !== "number" || !Number.isFinite(birth.longitude)) {
    errors.push({
      field: "longitude",
      message: "Longitude must be a finite number",
      value: birth.longitude
    });
  } else if (birth.longitude < -180 || birth.longitude > 180) {
    errors.push({
      field: "longitude",
      message: VALIDATION_MESSAGES.invalidLongitude(birth.longitude),
      value: birth.longitude,
      suggestion: "Use a longitude between -180 and +180"
    });
  }
  const result = {
    valid: errors.length === 0,
    errors,
    warnings
  };
  if (result.valid) {
    result.normalized = {
      ...birth,
      second: birth.second ?? 0
    };
  }
  return result;
}
function validateChartOptions(options, latitude) {
  const warnings = [];
  const result = { ...options };
  const absLatitude = Math.abs(latitude);
  const requestedSystem = options?.houseSystem ?? "placidus";
  if (LATITUDE_SENSITIVE_SYSTEMS.includes(requestedSystem)) {
    if (absLatitude > MAX_LATITUDE_PLACIDUS2) {
      warnings.push(VALIDATION_MESSAGES.latitudeTooHighForSystem(latitude, requestedSystem));
      result.houseSystem = FALLBACK_HOUSE_SYSTEM;
    }
  }
  if (absLatitude > MAX_LATITUDE_ANY) {
    warnings.push(
      `Latitude ${latitude}\xB0 is extremely close to pole. Using ${POLAR_FALLBACK_HOUSE_SYSTEM} house system.`
    );
    result.houseSystem = POLAR_FALLBACK_HOUSE_SYSTEM;
  }
  return { options: result, warnings };
}
function checkDayRollover(birth) {
  const utcHour = birth.hour - birth.timezone;
  if (utcHour < 0) {
    return { rollsOver: true, direction: "previous" };
  }
  if (utcHour >= 24) {
    return { rollsOver: true, direction: "next" };
  }
  return { rollsOver: false, direction: "none" };
}
function getMaxDayForMonth(year, month) {
  const maxDays = [0, 31, isLeapYear2(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const max = maxDays[month] ?? 31;
  return `Use a day between 1 and ${max} for month ${month}`;
}
function isLeapYear2(year) {
  return year % 4 === 0 && year % 100 !== 0 || year % 400 === 0;
}
function getAvailableHouseSystems2(latitude) {
  const absLatitude = Math.abs(latitude);
  if (absLatitude > MAX_LATITUDE_ANY) {
    return ["whole-sign"];
  }
  if (absLatitude > MAX_LATITUDE_PLACIDUS2) {
    return ["equal", "whole-sign", "porphyry", "regiomontanus", "campanus"];
  }
  return ["placidus", "koch", "equal", "whole-sign", "porphyry", "regiomontanus", "campanus"];
}

// src/time/julian-centuries.ts
function toJulianCenturies(jd) {
  return (jd - J2000_EPOCH2) / DAYS_PER_CENTURY;
}
function fromJulianCenturies(T) {
  return J2000_EPOCH2 + T * DAYS_PER_CENTURY;
}

// src/time/time-utils.ts
function normalizeAngle9(degrees) {
  return (degrees % DEGREES_PER_CIRCLE2 + DEGREES_PER_CIRCLE2) % DEGREES_PER_CIRCLE2;
}
function degreesToHours(degrees) {
  return degrees / DEGREES_PER_HOUR;
}
function hoursToDegrees(hours) {
  return hours * DEGREES_PER_HOUR;
}
function fractionOfDayToTime(fraction) {
  const normalizedFraction = fraction - Math.floor(fraction);
  const totalHours = normalizedFraction * HOURS_PER_DAY;
  const hour = Math.floor(totalHours);
  const fractionalHours = totalHours - hour;
  const totalMinutes = fractionalHours * 60;
  const minute = Math.floor(totalMinutes);
  const fractionalMinutes = totalMinutes - minute;
  const second = fractionalMinutes * 60;
  return { hour, minute, second };
}
function timeToFractionOfDay(hour, minute, second) {
  const totalHours = hour + minute / 60 + second / 3600;
  return totalHours / HOURS_PER_DAY;
}
function formatJulianDate(jd) {
  return `JD ${jd.toFixed(6)}`;
}
function formatSiderealTime(degrees) {
  const hours = degreesToHours(degrees);
  return `${degrees.toFixed(6)}\xB0 (${hours.toFixed(6)}h)`;
}

// src/time/julian-date.ts
function toJulianDate(date) {
  let year = date.year;
  let month = date.month;
  let day = date.day;
  let hour = date.hour;
  const minute = date.minute;
  const second = date.second;
  if (date.timezone !== void 0) {
    hour -= date.timezone;
    if (hour >= 24) {
      const extraDays = Math.floor(hour / 24);
      day += extraDays;
      hour = hour % 24;
    } else if (hour < 0) {
      const daysToSubtract = Math.floor((-hour + 23) / 24);
      day -= daysToSubtract;
      hour += daysToSubtract * 24;
    }
  }
  const fractionalDay = timeToFractionOfDay(hour, minute, second);
  if (month <= 2) {
    year -= 1;
    month += 12;
  }
  let calendarCorrection = 0;
  const originalYear = date.year;
  const originalMonth = date.month;
  const originalDay = date.day;
  if (originalYear > 1582 || originalYear === 1582 && originalMonth > 10 || originalYear === 1582 && originalMonth === 10 && originalDay + fractionalDay >= 15) {
    const a = Math.floor(year / 100);
    calendarCorrection = 2 - a + Math.floor(a / 4);
  }
  const jd = Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + fractionalDay + calendarCorrection - 1524.5;
  return jd;
}
function julianDate(year, month, day, hour = 0, minute = 0, second = 0) {
  return toJulianDate({ year, month, day, hour, minute, second });
}

// src/time/local-sidereal-time.ts
function localSiderealTime(gmst, longitude) {
  let lst = gmst + longitude;
  lst = normalizeAngle9(lst);
  return lst;
}

// src/time/sidereal-time.ts
function greenwichMeanSiderealTime(jd) {
  const T = toJulianCenturies(jd);
  const D = jd - 2451545;
  let gmst = 280.46061837 + // Constant term
  360.98564736629 * D + // Linear term (rotation per day)
  387933e-9 * T * T - // Quadratic term
  T * T * T / 3871e4;
  gmst = normalizeAngle9(gmst);
  return gmst;
}
function greenwichMeanSiderealTimeAt0h(jd) {
  const jd0h = Math.floor(jd - 0.5) + 0.5;
  return greenwichMeanSiderealTime(jd0h);
}
function gmstRatePerHour() {
  return 360 / 23.934469;
}

// src/chart/time-conversion.ts
function localToUTC(birth) {
  const second = birth.second ?? 0;
  let utcHour = birth.hour + birth.minute / 60 + second / 3600 - birth.timezone;
  let year = birth.year;
  let month = birth.month;
  let day = birth.day;
  while (utcHour < 0) {
    utcHour += 24;
    day--;
    if (day < 1) {
      month--;
      if (month < 1) {
        month = 12;
        year--;
      }
      day = getDaysInMonth(year, month);
    }
  }
  while (utcHour >= 24) {
    utcHour -= 24;
    day++;
    const daysInMonth2 = getDaysInMonth(year, month);
    if (day > daysInMonth2) {
      day = 1;
      month++;
      if (month > 12) {
        month = 1;
        year++;
      }
    }
  }
  const hour = Math.floor(utcHour);
  const remainingMinutes = (utcHour - hour) * 60;
  const minute = Math.floor(remainingMinutes);
  const utcSecond = Math.round((remainingMinutes - minute) * 60);
  return {
    year,
    month,
    day,
    hour,
    minute,
    second: utcSecond
  };
}
function calculateTimeData(birth) {
  const utcDateTime = localToUTC(birth);
  const julianDate2 = toJulianDate(utcDateTime);
  const julianCenturies = toJulianCenturies(julianDate2);
  const greenwichSiderealTime = greenwichMeanSiderealTime(julianDate2);
  const lst = localSiderealTime(greenwichSiderealTime, birth.longitude);
  const obliquity = meanObliquity(julianCenturies);
  const localHour = birth.hour + birth.minute / 60;
  const isDaytime = localHour >= 6 && localHour < 18;
  return {
    julianDate: julianDate2,
    julianCenturies,
    localSiderealTime: lst,
    greenwichSiderealTime,
    obliquity,
    utcDateTime,
    isDaytime
    // Will be recalculated with actual Sun position
  };
}
function calculateIsDaytime(sunLongitude, ascendant) {
  const sun = normalizeAngle10(sunLongitude);
  const asc = normalizeAngle10(ascendant);
  const dsc = normalizeAngle10(ascendant + 180);
  if (dsc < asc) {
    return sun >= dsc && sun < asc;
  }
  return sun >= dsc || sun < asc;
}
function getDaysInMonth(year, month) {
  const daysPerMonth = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (month === 2 && isLeapYear3(year)) {
    return 29;
  }
  return daysPerMonth[month] ?? 31;
}
function isLeapYear3(year) {
  return year % 4 === 0 && year % 100 !== 0 || year % 400 === 0;
}
function normalizeAngle10(angle) {
  let result = angle % 360;
  if (result < 0) {
    result += 360;
  }
  return result;
}

// src/chart/chart.ts
function calculateChart(birth, options) {
  const validation = validateBirthData(birth);
  if (!validation.valid) {
    const firstError = validation.errors[0];
    throw new ValidationError(firstError.message, firstError.field, firstError.value);
  }
  const normalizedBirth = {
    ...birth,
    second: birth.second ?? 0
  };
  const { options: validatedOptions} = validateChartOptions(
    options,
    birth.latitude
  );
  const mergedOptions = {
    ...DEFAULT_OPTIONS,
    ...validatedOptions
  };
  const timeData = calculateTimeData(normalizedBirth);
  const positions = calculatePlanetPositions(timeData.julianDate, mergedOptions);
  const houseResult = calculateChartHouses(
    { latitude: birth.latitude, longitude: birth.longitude },
    timeData.localSiderealTime,
    timeData.julianCenturies,
    mergedOptions.houseSystem
  );
  const sunPos = positions.planets.get("Sun" /* Sun */);
  const isDaytime = sunPos ? calculateIsDaytime(sunPos.longitude, houseResult.angles.ascendant.longitude) : timeData.isDaytime;
  const calculatedData = {
    ...timeData,
    isDaytime
  };
  const planets = [];
  for (const [body, position] of sortedPlanetList(positions.planets)) {
    planets.push(buildChartPlanet(body, position, houseResult.houses));
  }
  if (positions.chiron) {
    planets.push(buildChartPlanet("Chiron" /* Chiron */, positions.chiron, houseResult.houses));
  }
  if (positions.asteroids) {
    if (positions.asteroids.ceres) {
      planets.push(
        buildChartPlanet("Ceres" /* Ceres */, positions.asteroids.ceres, houseResult.houses)
      );
    }
    if (positions.asteroids.pallas) {
      planets.push(
        buildChartPlanet("Pallas" /* Pallas */, positions.asteroids.pallas, houseResult.houses)
      );
    }
    if (positions.asteroids.juno) {
      planets.push(
        buildChartPlanet("Juno" /* Juno */, positions.asteroids.juno, houseResult.houses)
      );
    }
    if (positions.asteroids.vesta) {
      planets.push(
        buildChartPlanet("Vesta" /* Vesta */, positions.asteroids.vesta, houseResult.houses)
      );
    }
  }
  const nodes = [];
  if (positions.nodes) {
    if (positions.nodes.trueNorth) {
      nodes.push(
        buildChartNode(
          "North Node",
          "True",
          positions.nodes.trueNorth.longitude,
          houseResult.houses
        )
      );
      nodes.push(
        buildChartNode(
          "South Node",
          "True",
          positions.nodes.trueSouth.longitude,
          houseResult.houses
        )
      );
    }
    if (positions.nodes.meanNorth) {
      nodes.push(
        buildChartNode(
          "North Node",
          "Mean",
          positions.nodes.meanNorth.longitude,
          houseResult.houses
        )
      );
      nodes.push(
        buildChartNode(
          "South Node",
          "Mean",
          positions.nodes.meanSouth.longitude,
          houseResult.houses
        )
      );
    }
  }
  const lilith = [];
  if (positions.lilith) {
    if (positions.lilith.mean) {
      lilith.push(buildChartLilith("Mean", positions.lilith.mean.longitude, houseResult.houses));
    }
    if (positions.lilith.true) {
      lilith.push(buildChartLilith("True", positions.lilith.true.longitude, houseResult.houses));
    }
  }
  const lots = [];
  if (mergedOptions.includeLots && sunPos) {
    const moonPos = positions.planets.get("Moon" /* Moon */);
    if (moonPos) {
      const lotsData = calculateLots(
        sunPos.longitude,
        moonPos.longitude,
        houseResult.angles.ascendant.longitude,
        isDaytime,
        true
      );
      if (lotsData.fortune) {
        const formula = isDaytime ? "ASC + Moon - Sun" : "ASC + Sun - Moon";
        lots.push(
          buildChartLot(
            BODY_NAMES.partOfFortune,
            formula,
            lotsData.fortune.longitude,
            houseResult.houses
          )
        );
      }
      if (lotsData.spirit) {
        const formula = isDaytime ? "ASC + Sun - Moon" : "ASC + Moon - Sun";
        lots.push(
          buildChartLot(
            BODY_NAMES.partOfSpirit,
            formula,
            lotsData.spirit.longitude,
            houseResult.houses
          )
        );
      }
    }
  }
  const chartAspects = calculateChartAspects(planets, mergedOptions, nodes, lilith);
  const patterns = mergedOptions.includePatterns ? detectChartPatterns(chartAspects.all) : [];
  const summary = generateChartSummary(planets, patterns);
  return {
    input: normalizedBirth,
    options: mergedOptions,
    calculated: calculatedData,
    planets,
    nodes,
    lilith,
    lots,
    angles: houseResult.angles,
    houses: houseResult.houses,
    aspects: chartAspects,
    patterns,
    summary
  };
}
function validateBirth(birth) {
  return validateBirthData(birth);
}
function calculatePlanets(birth, options) {
  const validationResult = validateBirthData(birth);
  if (!validationResult.valid) {
    throw new ValidationError(
      validationResult.errors.map((e) => e.message).join("; "),
      validationResult.errors[0]?.field ?? "unknown",
      validationResult.errors[0]?.value
    );
  }
  const normalizedBirth = validationResult.normalized;
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  const calculatedData = calculateTimeData(normalizedBirth);
  const positions = calculatePlanetPositions(calculatedData.julianDate, mergedOptions);
  const placeholderHouses = {
    cusps: Array.from({ length: 12 }, (_, i) => ({
      house: i + 1,
      longitude: i * 30,
      sign: i,
      signName: [
        "Aries",
        "Taurus",
        "Gemini",
        "Cancer",
        "Leo",
        "Virgo",
        "Libra",
        "Scorpio",
        "Sagittarius",
        "Capricorn",
        "Aquarius",
        "Pisces"
      ][i],
      degree: 0,
      minute: 0,
      formatted: `0\xB0 ${["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"][i]}`,
      size: 30
    }))
  };
  const planets = [];
  for (const [body, position] of sortedPlanetList(positions.planets)) {
    planets.push(buildChartPlanet(body, position, placeholderHouses));
  }
  if (mergedOptions.includeChiron && positions.chiron) {
    planets.push(buildChartPlanet("Chiron" /* Chiron */, positions.chiron, placeholderHouses));
  }
  if (mergedOptions.includeAsteroids && positions.asteroids) {
    if (positions.asteroids.ceres) {
      planets.push(
        buildChartPlanet("Ceres" /* Ceres */, positions.asteroids.ceres, placeholderHouses)
      );
    }
    if (positions.asteroids.pallas) {
      planets.push(
        buildChartPlanet("Pallas" /* Pallas */, positions.asteroids.pallas, placeholderHouses)
      );
    }
    if (positions.asteroids.juno) {
      planets.push(
        buildChartPlanet("Juno" /* Juno */, positions.asteroids.juno, placeholderHouses)
      );
    }
    if (positions.asteroids.vesta) {
      planets.push(
        buildChartPlanet("Vesta" /* Vesta */, positions.asteroids.vesta, placeholderHouses)
      );
    }
  }
  return planets;
}
function calculateHouseCusps(birth, options) {
  const validationResult = validateBirthData(birth);
  if (!validationResult.valid) {
    throw new ValidationError(
      validationResult.errors.map((e) => e.message).join("; "),
      validationResult.errors[0]?.field ?? "unknown",
      validationResult.errors[0]?.value
    );
  }
  const normalizedBirth = validationResult.normalized;
  const houseSystem = options?.houseSystem ?? DEFAULT_HOUSE_SYSTEM;
  const calculatedData = calculateTimeData(normalizedBirth);
  const houseResult = calculateChartHouses(
    { latitude: normalizedBirth.latitude, longitude: normalizedBirth.longitude },
    calculatedData.localSiderealTime,
    calculatedData.julianCenturies,
    houseSystem
  );
  return {
    houses: houseResult.houses,
    angles: houseResult.angles,
    warnings: houseResult.warnings
  };
}
function formatChart(chart) {
  const lines = [];
  lines.push("\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550");
  lines.push("                        BIRTH CHART");
  lines.push("\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550");
  lines.push("");
  const { input } = chart;
  lines.push(
    `Date: ${input.year}-${String(input.month).padStart(2, "0")}-${String(input.day).padStart(2, "0")}`
  );
  lines.push(
    `Time: ${String(input.hour).padStart(2, "0")}:${String(input.minute).padStart(2, "0")}:${String(input.second ?? 0).padStart(2, "0")} (UTC${input.timezone >= 0 ? "+" : ""}${input.timezone})`
  );
  lines.push(
    `Location: ${Math.abs(input.latitude).toFixed(4)}\xB0${input.latitude >= 0 ? "N" : "S"}, ${Math.abs(input.longitude).toFixed(4)}\xB0${input.longitude >= 0 ? "E" : "W"}`
  );
  lines.push("");
  lines.push("\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 ANGLES \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500");
  lines.push(`  ASC: ${chart.angles.ascendant.formatted}`);
  lines.push(`  MC:  ${chart.angles.midheaven.formatted}`);
  lines.push(`  DSC: ${chart.angles.descendant.formatted}`);
  lines.push(`  IC:  ${chart.angles.imumCoeli.formatted}`);
  lines.push("");
  lines.push("\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 PLANETS \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500");
  for (const planet of chart.planets) {
    const retro = planet.isRetrograde ? " R" : "  ";
    const house = `H${planet.house}`.padStart(3);
    lines.push(`  ${planet.name.padEnd(10)} ${planet.formatted.padEnd(20)} ${house}${retro}`);
  }
  lines.push("");
  if (chart.nodes.length > 0) {
    lines.push("\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 LUNAR NODES \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500");
    for (const node of chart.nodes) {
      const house = `H${node.house}`.padStart(3);
      lines.push(`  ${node.name.padEnd(12)} ${node.formatted.padEnd(20)} ${house}`);
    }
    lines.push("");
  }
  lines.push(`\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 HOUSES (${chart.houses.systemName}) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500`);
  for (const cusp of chart.houses.cusps) {
    lines.push(`  House ${String(cusp.house).padStart(2)}: ${cusp.formatted}`);
  }
  lines.push("");
  lines.push("\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 ASPECTS \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500");
  lines.push(`  Total: ${chart.aspects.count}`);
  lines.push(`  Conjunctions: ${chart.aspects.summary.conjunctions}`);
  lines.push(`  Sextiles: ${chart.aspects.summary.sextiles}`);
  lines.push(`  Squares: ${chart.aspects.summary.squares}`);
  lines.push(`  Trines: ${chart.aspects.summary.trines}`);
  lines.push(`  Oppositions: ${chart.aspects.summary.oppositions}`);
  lines.push("");
  if (chart.patterns.length > 0) {
    lines.push("\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 PATTERNS \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500");
    for (const pattern of chart.patterns) {
      lines.push(`  ${pattern.type}: ${pattern.bodies.join(", ")}`);
    }
    lines.push("");
  }
  lines.push("\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550");
  return lines.join("\n");
}

// src/ephemeris/index.ts
var ephemeris_exports = {};
__export(ephemeris_exports, {
  ARCMINUTES_PER_DEGREE: () => ARCMINUTES_PER_DEGREE,
  ARCSECONDS_PER_ARCMINUTE: () => ARCSECONDS_PER_ARCMINUTE,
  ARCSECONDS_PER_DEGREE: () => ARCSECONDS_PER_DEGREE,
  ARCSEC_TO_RAD: () => ARCSEC_TO_RAD,
  AU_IN_KM: () => AU_IN_KM,
  CERES_ORBITAL_ELEMENTS: () => CERES_ORBITAL_ELEMENTS,
  CHIRON_ORBITAL_ELEMENTS: () => CHIRON_ORBITAL_ELEMENTS,
  CelestialBody: () => CelestialBody,
  DAYS_PER_JULIAN_CENTURY: () => DAYS_PER_JULIAN_CENTURY,
  DAYS_PER_JULIAN_MILLENNIUM: () => DAYS_PER_JULIAN_MILLENNIUM,
  DEFAULT_BODIES: () => DEFAULT_BODIES,
  DEGREES_PER_CIRCLE: () => DEGREES_PER_CIRCLE,
  DEG_TO_RAD: () => DEG_TO_RAD,
  J2000_EPOCH: () => J2000_EPOCH,
  JUNO_ORBITAL_ELEMENTS: () => JUNO_ORBITAL_ELEMENTS,
  JUPITER_ORBITAL_ELEMENTS: () => JUPITER_ORBITAL_ELEMENTS,
  LIGHT_TIME_PER_AU_DAYS: () => LIGHT_TIME_PER_AU_DAYS,
  LILITH_CHARACTERISTICS: () => LILITH_CHARACTERISTICS,
  LOTS_CHARACTERISTICS: () => LOTS_CHARACTERISTICS,
  LUNAR_NODE_CHARACTERISTICS: () => LUNAR_NODE_CHARACTERISTICS,
  MARS_ORBITAL_ELEMENTS: () => MARS_ORBITAL_ELEMENTS,
  MAX_JULIAN_DATE: () => MAX_JULIAN_DATE,
  MERCURY_ORBITAL_ELEMENTS: () => MERCURY_ORBITAL_ELEMENTS,
  MIN_JULIAN_DATE: () => MIN_JULIAN_DATE,
  NEPTUNE_ORBITAL_ELEMENTS: () => NEPTUNE_ORBITAL_ELEMENTS,
  OBLIQUITY_COEFFICIENTS: () => OBLIQUITY_COEFFICIENTS,
  OBLIQUITY_J2000_DEG: () => OBLIQUITY_J2000_DEG,
  PALLAS_ORBITAL_ELEMENTS: () => PALLAS_ORBITAL_ELEMENTS,
  PLUTO_ORBITAL_ELEMENTS: () => PLUTO_ORBITAL_ELEMENTS,
  Planet: () => Planet,
  RAD_TO_DEG: () => RAD_TO_DEG,
  SATURN_ORBITAL_ELEMENTS: () => SATURN_ORBITAL_ELEMENTS,
  SPEED_OF_LIGHT_KM_S: () => SPEED_OF_LIGHT_KM_S,
  URANUS_ORBITAL_ELEMENTS: () => URANUS_ORBITAL_ELEMENTS,
  VENUS_ORBITAL_ELEMENTS: () => VENUS_ORBITAL_ELEMENTS,
  VESTA_ORBITAL_ELEMENTS: () => VESTA_ORBITAL_ELEMENTS,
  calculatePartOfFortune: () => calculatePartOfFortune,
  calculatePartOfFortuneDayFormula: () => calculatePartOfFortuneDayFormula,
  calculatePartOfSpirit: () => calculatePartOfSpirit,
  ceresHeliocentricDistance: () => ceresHeliocentricDistance,
  ceresHeliocentricLatitude: () => ceresHeliocentricLatitude,
  ceresHeliocentricLongitude: () => ceresHeliocentricLongitude,
  chironHeliocentricDistance: () => chironHeliocentricDistance,
  chironHeliocentricLatitude: () => chironHeliocentricLatitude,
  chironHeliocentricLongitude: () => chironHeliocentricLongitude,
  earthEccentricity: () => earthEccentricity,
  eccentricToTrue: () => eccentricToTrue,
  getAllPositions: () => getAllPositions,
  getAllPositionsObject: () => getAllPositionsObject,
  getCeresPosition: () => getCeresPosition,
  getChironPosition: () => getChironPosition,
  getDegreeInSign: () => getDegreeInSign,
  getJunoPosition: () => getJunoPosition,
  getJupiterPosition: () => getJupiterPosition,
  getLilith: () => getLilith,
  getMarsPosition: () => getMarsPosition,
  getMeanLilith: () => getMeanLilith,
  getMeanLilithLongitude: () => getMeanLilithLongitude,
  getMeanNode: () => getMeanNode,
  getMeanNodeLongitude: () => getMeanNodeLongitude,
  getMercuryPosition: () => getMercuryPosition,
  getMoonPosition: () => getMoonPosition,
  getNeptunePosition: () => getNeptunePosition,
  getNorthNode: () => getNorthNode,
  getPallasPosition: () => getPallasPosition,
  getPartOfFortune: () => getPartOfFortune,
  getPartOfSpirit: () => getPartOfSpirit,
  getPlutoPosition: () => getPlutoPosition,
  getPosition: () => getPosition,
  getSaturnPosition: () => getSaturnPosition,
  getSign: () => getSign,
  getSouthNodeLongitude: () => getSouthNodeLongitude,
  getSunPosition: () => getSunPosition,
  getTrueLilith: () => getTrueLilith,
  getTrueLilithLongitude: () => getTrueLilithLongitude,
  getTrueNode: () => getTrueNode,
  getTrueNodeLongitude: () => getTrueNodeLongitude,
  getUranusPosition: () => getUranusPosition,
  getVenusPosition: () => getVenusPosition,
  getVestaPosition: () => getVestaPosition,
  isRetrograde: () => isRetrograde,
  junoHeliocentricDistance: () => junoHeliocentricDistance,
  junoHeliocentricLatitude: () => junoHeliocentricLatitude,
  junoHeliocentricLongitude: () => junoHeliocentricLongitude,
  jupiterHeliocentricDistance: () => jupiterHeliocentricDistance,
  jupiterHeliocentricLatitude: () => jupiterHeliocentricLatitude,
  jupiterHeliocentricLongitude: () => jupiterHeliocentricLongitude,
  marsHeliocentricDistance: () => marsHeliocentricDistance,
  marsHeliocentricLatitude: () => marsHeliocentricLatitude,
  marsHeliocentricLongitude: () => marsHeliocentricLongitude,
  meanToTrue: () => meanToTrue,
  mercuryHeliocentricDistance: () => mercuryHeliocentricDistance,
  mercuryHeliocentricLatitude: () => mercuryHeliocentricLatitude,
  mercuryHeliocentricLongitude: () => mercuryHeliocentricLongitude,
  moonArgumentOfLatitude: () => moonArgumentOfLatitude,
  moonDistance: () => moonDistance,
  moonDistanceAU: () => moonDistanceAU,
  moonLatitude: () => moonLatitude,
  moonLongitude: () => moonLongitude,
  moonMeanAnomaly: () => moonMeanAnomaly,
  moonMeanAscendingNode: () => moonMeanAscendingNode,
  moonMeanElongation: () => moonMeanElongation,
  moonMeanLongitude: () => moonMeanLongitude,
  moonMeanPerigee: () => moonMeanPerigee,
  neptuneHeliocentricDistance: () => neptuneHeliocentricDistance,
  neptuneHeliocentricLatitude: () => neptuneHeliocentricLatitude,
  neptuneHeliocentricLongitude: () => neptuneHeliocentricLongitude,
  nutationInLongitude: () => nutationInLongitude,
  pallasHeliocentricDistance: () => pallasHeliocentricDistance,
  pallasHeliocentricLatitude: () => pallasHeliocentricLatitude,
  pallasHeliocentricLongitude: () => pallasHeliocentricLongitude,
  plutoHeliocentricDistance: () => plutoHeliocentricDistance,
  plutoHeliocentricLatitude: () => plutoHeliocentricLatitude,
  plutoHeliocentricLongitude: () => plutoHeliocentricLongitude,
  radiusVector: () => radiusVector,
  saturnHeliocentricDistance: () => saturnHeliocentricDistance,
  saturnHeliocentricLatitude: () => saturnHeliocentricLatitude,
  saturnHeliocentricLongitude: () => saturnHeliocentricLongitude,
  solveKepler: () => solveKepler6,
  sunApparentLongitude: () => sunApparentLongitude,
  sunDistance: () => sunDistance,
  sunEquationOfCenter: () => sunEquationOfCenter,
  sunMeanAnomaly: () => sunMeanAnomaly,
  sunMeanAnomalyForMoon: () => sunMeanAnomalyForMoon,
  sunMeanLongitude: () => sunMeanLongitude,
  sunTrueLongitude: () => sunTrueLongitude,
  uranusHeliocentricDistance: () => uranusHeliocentricDistance,
  uranusHeliocentricLatitude: () => uranusHeliocentricLatitude,
  uranusHeliocentricLongitude: () => uranusHeliocentricLongitude,
  venusHeliocentricDistance: () => venusHeliocentricDistance,
  venusHeliocentricLatitude: () => venusHeliocentricLatitude,
  venusHeliocentricLongitude: () => venusHeliocentricLongitude,
  vestaHeliocentricDistance: () => vestaHeliocentricDistance,
  vestaHeliocentricLatitude: () => vestaHeliocentricLatitude,
  vestaHeliocentricLongitude: () => vestaHeliocentricLongitude
});

// src/ephemeris/utils/kepler.ts
function solveKepler6(meanAnomaly, eccentricity) {
  if (eccentricity < 0) {
    throw new Error(`Eccentricity must be non-negative, got: ${eccentricity}`);
  }
  if (eccentricity >= 1) {
    throw new Error(`Eccentricity must be less than 1 for elliptical orbit, got: ${eccentricity}`);
  }
  if (eccentricity === 0) {
    return meanAnomaly;
  }
  const M = meanAnomaly * DEG_TO_RAD;
  const e = eccentricity;
  let E = M;
  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const sinE = Math.sin(E);
    const cosE = Math.cos(E);
    const f = E - e * sinE - M;
    const fPrime = 1 - e * cosE;
    const delta = f / fPrime;
    E = E - delta;
    if (Math.abs(delta) < CONVERGENCE_TOLERANCE * DEG_TO_RAD) {
      return E * RAD_TO_DEG;
    }
  }
  throw new Error(
    `Kepler equation did not converge after ${MAX_ITERATIONS} iterations (M=${meanAnomaly}\xB0, e=${eccentricity})`
  );
}
function eccentricToTrue(eccentricAnomaly, eccentricity) {
  const E = eccentricAnomaly * DEG_TO_RAD;
  const e = eccentricity;
  if (e === 0) {
    return eccentricAnomaly;
  }
  const cosE = Math.cos(E);
  const sinE = Math.sin(E);
  const denominator = 1 - e * cosE;
  const cosNu = (cosE - e) / denominator;
  const sinNu = Math.sqrt(1 - e * e) * sinE / denominator;
  let nu = Math.atan2(sinNu, cosNu);
  if (eccentricAnomaly >= 0 && nu < 0) {
    nu += 2 * Math.PI;
  } else if (eccentricAnomaly < 0 && nu > 0) {
    nu -= 2 * Math.PI;
  }
  return nu * RAD_TO_DEG;
}
function meanToTrue(meanAnomaly, eccentricity) {
  const E = solveKepler6(meanAnomaly, eccentricity);
  return eccentricToTrue(E, eccentricity);
}
function radiusVector(eccentricAnomaly, semiMajorAxis, eccentricity) {
  const E = eccentricAnomaly * DEG_TO_RAD;
  return semiMajorAxis * (1 - eccentricity * Math.cos(E));
}

// src/houses/index.ts
var houses_exports = {};
__export(houses_exports, {
  CONVERGENCE_TOLERANCE: () => CONVERGENCE_TOLERANCE2,
  EPSILON: () => EPSILON,
  HOUSE_SYSTEM_NAMES: () => HOUSE_SYSTEM_NAMES,
  MAX_ABSOLUTE_LATITUDE: () => MAX_ABSOLUTE_LATITUDE,
  MAX_ABSOLUTE_LONGITUDE: () => MAX_ABSOLUTE_LONGITUDE,
  MAX_ITERATIONS: () => MAX_ITERATIONS2,
  MAX_LATITUDE_PLACIDUS: () => MAX_LATITUDE_PLACIDUS,
  OBLIQUITY_COEFFICIENTS: () => OBLIQUITY_COEFFICIENTS2,
  angularDistance: () => angularDistance,
  calculateAngles: () => calculateAngles,
  calculateAnglesOnly: () => calculateAnglesOnly,
  calculateAscendant: () => calculateAscendant,
  calculateHouses: () => calculateHouses,
  calculateMidheaven: () => calculateMidheaven,
  calculateMultipleSystems: () => calculateMultipleSystems,
  campanusHouses: () => campanusHouses,
  eclipticToZodiac: () => eclipticToZodiac2,
  equalHouses: () => equalHouses,
  formatZodiacPosition: () => formatZodiacPosition2,
  getAvailableHouseSystems: () => getAvailableHouseSystems,
  getFallbackHouseSystem: () => getFallbackHouseSystem,
  getHousePosition: () => getHousePosition,
  getHouseSystemName: () => getHouseSystemName,
  getSignName: () => getSignName2,
  getSupportedHouseSystems: () => getSupportedHouseSystems,
  isHouseSystemAvailable: () => isHouseSystemAvailable,
  isOnAngle: () => isOnAngle,
  kochHouses: () => kochHouses,
  meanObliquity: () => meanObliquity,
  normalizeAngle: () => normalizeAngle8,
  normalizeLatitude: () => normalizeLatitude,
  normalizeLongitude: () => normalizeLongitude2,
  obliquityOfEcliptic: () => obliquityOfEcliptic,
  oppositePoint: () => oppositePoint,
  placidusHouses: () => placidusHouses,
  porphyryHouses: () => porphyryHouses,
  regiomontanusHouses: () => regiomontanusHouses,
  signedAngularSeparation: () => signedAngularSeparation,
  systemRequiresLatitude: () => systemRequiresLatitude,
  systemWorksAtPolarCircle: () => systemWorksAtPolarCircle,
  validateLocation: () => validateLocation,
  wholeSignHouses: () => wholeSignHouses
});

// src/progressions/index.ts
var progressions_exports = {};
__export(progressions_exports, {
  DAYS_PER_YEAR: () => DAYS_PER_YEAR,
  DEFAULT_PROGRESSION_BODIES: () => DEFAULT_PROGRESSION_BODIES,
  DEFAULT_PROGRESSION_CONFIG: () => DEFAULT_PROGRESSION_CONFIG,
  EXACT_THRESHOLD: () => EXACT_THRESHOLD,
  MAJOR_PROGRESSION_ASPECTS: () => MAJOR_PROGRESSION_ASPECTS,
  MINOR_PROGRESSION_RATE: () => MINOR_PROGRESSION_RATE,
  MOON_MEAN_DAILY_MOTION: () => MOON_MEAN_DAILY_MOTION,
  PROGRESSION_ORBS: () => PROGRESSION_ORBS,
  PROGRESSION_RATES: () => PROGRESSION_RATES,
  ProgressionCalculationError: () => ProgressionCalculationError,
  ProgressionValidationError: () => ProgressionValidationError,
  RETROGRADE_CAPABLE_BODIES: () => RETROGRADE_CAPABLE_BODIES,
  SECONDARY_PROGRESSION_RATE: () => SECONDARY_PROGRESSION_RATE,
  SIGN_NAMES: () => SIGN_NAMES,
  SUN_MEAN_DAILY_MOTION: () => SUN_MEAN_DAILY_MOTION,
  SYNODIC_MONTH_DAYS: () => SYNODIC_MONTH_DAYS,
  TERTIARY_PROGRESSION_RATE: () => TERTIARY_PROGRESSION_RATE,
  TROPICAL_MONTH_DAYS: () => TROPICAL_MONTH_DAYS,
  ageToTargetJD: () => ageToTargetJD,
  applySolarArc: () => applySolarArc,
  applySolarArcToMany: () => applySolarArcToMany,
  birthToJD: () => birthToJD,
  calculateAge: () => calculateAge,
  calculateAgeInDays: () => calculateAgeInDays,
  calculateMoonSignTransits: () => calculateMoonSignTransits,
  calculateProgressedAngles: () => calculateProgressedAngles,
  calculateProgressedAspects: () => calculateProgressedAspects,
  calculateProgressedJD: () => calculateProgressedJD,
  calculateProgressedPositions: () => calculateProgressedPositions,
  calculateProgression: () => calculateProgression,
  calculateSolarArc: () => calculateSolarArc,
  calculateSolarArcFromDates: () => calculateSolarArcFromDates,
  detectProgressedAspects: () => detectProgressedAspects,
  detectProgressedToNatalAspects: () => detectProgressedToNatalAspects,
  detectProgressedToProgressedAspects: () => detectProgressedToProgressedAspects,
  estimateAgeForASCSign: () => estimateAgeForASCSign,
  estimateAgeForDirectedPosition: () => estimateAgeForDirectedPosition,
  estimateAgeForMCSign: () => estimateAgeForMCSign,
  estimateAgeForSolarArc: () => estimateAgeForSolarArc,
  estimateSolarArc: () => estimateSolarArc,
  formatAspect: () => formatAspect2,
  formatAspects: () => formatAspects,
  formatMoonTransit: () => formatMoonTransit,
  formatProgressedAngles: () => formatProgressedAngles,
  formatProgressedChart: () => formatProgressedChart,
  formatProgressedMoonReport: () => formatProgressedMoonReport,
  formatSolarArc: () => formatSolarArc,
  formatSolarArcDMS: () => formatSolarArcDMS,
  getAgeAtNextMoonSignChange: () => getAgeAtNextMoonSignChange,
  getAllProgressedPositions: () => getAllProgressedPositions,
  getAspectsByType: () => getAspectsByType,
  getAspectsFromProgressedBody: () => getAspectsFromProgressedBody,
  getAspectsToNatalBody: () => getAspectsToNatalBody,
  getBodiesWithSignChange: () => getBodiesWithSignChange,
  getBodyWithLargestArc: () => getBodyWithLargestArc,
  getExactAspects: () => getExactAspects,
  getMoonProgressionReport: () => getMoonProgressionReport,
  getMoonReturnAges: () => getMoonReturnAges,
  getMoonZodiacCycles: () => getMoonZodiacCycles,
  getNatalAngles: () => getNatalAngles,
  getNatalAnglesFromBirth: () => getNatalAnglesFromBirth,
  getNatalPosition: () => getNatalPosition,
  getNatalSunLongitude: () => getNatalSunLongitude,
  getProgressedASC: () => getProgressedASC,
  getProgressedAngles: () => getProgressedAngles,
  getProgressedAnglesSolarArc: () => getProgressedAnglesSolarArc,
  getProgressedAnglesTimeBased: () => getProgressedAnglesTimeBased,
  getProgressedBodyFromDates: () => getProgressedBodyFromDates,
  getProgressedJD: () => getProgressedJD,
  getProgressedLunarPhase: () => getProgressedLunarPhase,
  getProgressedMC: () => getProgressedMC,
  getProgressedMoon: () => getProgressedMoon,
  getProgressedMoonFromDates: () => getProgressedMoonFromDates,
  getProgressedMoonReport: () => getProgressedMoonReport,
  getProgressedPosition: () => getProgressedPosition,
  getProgressedPositions: () => getProgressedPositions,
  getProgressedSunLongitude: () => getProgressedSunLongitude,
  getProgressionDates: () => getProgressionDates,
  getRetrogradeBodies: () => getRetrogradeBodies,
  getSignChanges: () => getSignChanges,
  getStrongestAspect: () => getStrongestAspect3,
  groupBySign: () => groupBySign,
  hasASCChangedSign: () => hasASCChangedSign,
  hasMCChangedSign: () => hasMCChangedSign,
  solarArcForAspect: () => solarArcForAspect,
  sortByLongitude: () => sortByLongitude,
  sortByStrength: () => sortByStrength,
  targetToJD: () => targetToJD,
  validateProgressionDates: () => validateProgressionDates
});

// src/progressions/types.ts
var ProgressionCalculationError = class extends Error {
  constructor(message, step, details) {
    super(message);
    this.step = step;
    this.details = details;
    this.name = "ProgressionCalculationError";
  }
};
var ProgressionValidationError = class extends Error {
  constructor(message, field, value) {
    super(message);
    this.field = field;
    this.value = value;
    this.name = "ProgressionValidationError";
  }
};

// src/progressions/constants.ts
var DAYS_PER_YEAR = 365.25;
var TROPICAL_MONTH_DAYS = 27.321582;
var SYNODIC_MONTH_DAYS = 29.530589;
var SUN_MEAN_DAILY_MOTION = 0.9856473;
var MOON_MEAN_DAILY_MOTION = 13.176358;
var SECONDARY_PROGRESSION_RATE = 1;
var MINOR_PROGRESSION_RATE = TROPICAL_MONTH_DAYS;
var TERTIARY_PROGRESSION_RATE = 12;
var PROGRESSION_RATES = {
  secondary: SECONDARY_PROGRESSION_RATE,
  "solar-arc": SECONDARY_PROGRESSION_RATE,
  // Solar arc uses secondary timing
  minor: MINOR_PROGRESSION_RATE,
  tertiary: TERTIARY_PROGRESSION_RATE
};
var PROGRESSION_ORBS = {
  // Major aspects - 1° orb
  ["conjunction" /* Conjunction */]: 1,
  ["opposition" /* Opposition */]: 1,
  ["square" /* Square */]: 1,
  ["trine" /* Trine */]: 1,
  ["sextile" /* Sextile */]: 1,
  // Minor aspects - 0.5° orb
  ["quincunx" /* Quincunx */]: 0.5,
  ["semi-sextile" /* SemiSextile */]: 0.5,
  ["semi-square" /* SemiSquare */]: 0.5,
  ["sesquiquadrate" /* Sesquiquadrate */]: 0.5,
  ["quintile" /* Quintile */]: 0.5,
  ["biquintile" /* Biquintile */]: 0.5,
  // Kepler aspects - very tight 0.3° orb
  ["septile" /* Septile */]: 0.3,
  ["novile" /* Novile */]: 0.3,
  ["decile" /* Decile */]: 0.3
};
var EXACT_THRESHOLD = 0.1;
var MAX_PROGRESSION_AGE = 120;
var DEFAULT_PROGRESSION_BODIES = [
  "Sun" /* Sun */,
  "Moon" /* Moon */,
  "Mercury" /* Mercury */,
  "Venus" /* Venus */,
  "Mars" /* Mars */,
  "Jupiter" /* Jupiter */,
  "Saturn" /* Saturn */
];
var RETROGRADE_CAPABLE_BODIES = [
  "Mercury" /* Mercury */,
  "Venus" /* Venus */,
  "Mars" /* Mars */
];
var MAJOR_PROGRESSION_ASPECTS = [
  "conjunction" /* Conjunction */,
  "sextile" /* Sextile */,
  "square" /* Square */,
  "trine" /* Trine */,
  "opposition" /* Opposition */
];
Object.values(AspectType);
var SIGN_NAMES = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces"
];
var DEFAULT_PROGRESSION_CONFIG = {
  type: "secondary",
  angleMethod: "solar-arc",
  bodies: [...DEFAULT_PROGRESSION_BODIES],
  includeProgressedAspects: false,
  includeNatalAspects: true,
  aspectTypes: [...MAJOR_PROGRESSION_ASPECTS],
  orbs: { ...PROGRESSION_ORBS },
  includeSolarArc: true,
  minimumStrength: 0,
  exactThreshold: EXACT_THRESHOLD
};
var MIN_BIRTH_YEAR = 1800;
var MAX_TARGET_YEAR = 2200;

// src/time/index.ts
var time_exports = {};
__export(time_exports, {
  ARCMINUTES_PER_DEGREE: () => ARCMINUTES_PER_DEGREE2,
  ARCSECONDS_PER_DEGREE: () => ARCSECONDS_PER_DEGREE2,
  DAYS_IN_MONTH: () => DAYS_IN_MONTH,
  DAYS_IN_MONTH_LEAP: () => DAYS_IN_MONTH_LEAP,
  DAYS_PER_CENTURY: () => DAYS_PER_CENTURY,
  DEGREES_PER_CIRCLE: () => DEGREES_PER_CIRCLE2,
  DEGREES_PER_HOUR: () => DEGREES_PER_HOUR,
  GREGORIAN_REFORM_JD: () => GREGORIAN_REFORM_JD,
  HOURS_PER_DAY: () => HOURS_PER_DAY,
  J2000_EPOCH: () => J2000_EPOCH2,
  MINUTES_PER_DAY: () => MINUTES_PER_DAY,
  MINUTES_PER_HOUR: () => MINUTES_PER_HOUR,
  MJD_EPOCH: () => MJD_EPOCH,
  MONTH_NAMES: () => MONTH_NAMES,
  SECONDS_PER_DAY: () => SECONDS_PER_DAY,
  SECONDS_PER_HOUR: () => SECONDS_PER_HOUR,
  SECONDS_PER_MINUTE: () => SECONDS_PER_MINUTE,
  SIDEREAL_DAY_IN_DAYS: () => SIDEREAL_DAY_IN_DAYS,
  SIDEREAL_DAY_RATIO: () => SIDEREAL_DAY_RATIO,
  SOLAR_DAY_IN_SIDEREAL_DAYS: () => SOLAR_DAY_IN_SIDEREAL_DAYS,
  UNIX_EPOCH_JD: () => UNIX_EPOCH_JD,
  calendarDate: () => calendarDate,
  daysInMonth: () => daysInMonth,
  degreesToHours: () => degreesToHours,
  deltaT: () => deltaT,
  formatJulianDate: () => formatJulianDate,
  formatSiderealTime: () => formatSiderealTime,
  fractionOfDayToTime: () => fractionOfDayToTime,
  fromJulianCenturies: () => fromJulianCenturies,
  fromJulianDate: () => fromJulianDate,
  gmstRatePerHour: () => gmstRatePerHour,
  greenwichMeanSiderealTime: () => greenwichMeanSiderealTime,
  greenwichMeanSiderealTimeAt0h: () => greenwichMeanSiderealTimeAt0h,
  hoursToDegrees: () => hoursToDegrees,
  isLeapYear: () => isLeapYear,
  isValidDate: () => isValidDate,
  isValidTime: () => isValidTime,
  julianDate: () => julianDate,
  localSiderealTime: () => localSiderealTime,
  normalizeAngle: () => normalizeAngle9,
  timeToFractionOfDay: () => timeToFractionOfDay,
  toJulianCenturies: () => toJulianCenturies,
  toJulianDate: () => toJulianDate,
  ttToUT: () => ttToUT,
  utToTT: () => utToTT,
  validateCalendarDateTime: () => validateCalendarDateTime
});

// src/time/calendar-date.ts
function fromJulianDate(jd) {
  const jdPlusHalf = jd + 0.5;
  const z = Math.floor(jdPlusHalf);
  const f = jdPlusHalf - z;
  let a;
  if (z >= 2299161) {
    const alpha = Math.floor((z - 186721625e-2) / 36524.25);
    a = z + 1 + alpha - Math.floor(alpha / 4);
  } else {
    a = z;
  }
  const b = a + 1524;
  const c = Math.floor((b - 122.1) / 365.25);
  const d = Math.floor(365.25 * c);
  const e = Math.floor((b - d) / 30.6001);
  const dayWithFraction = b - d - Math.floor(30.6001 * e) + f;
  const day = Math.floor(dayWithFraction);
  const fractionalDay = dayWithFraction - day;
  let month;
  if (e < 14) {
    month = e - 1;
  } else {
    month = e - 13;
  }
  let year;
  if (month > 2) {
    year = c - 4716;
  } else {
    year = c - 4715;
  }
  const { hour, minute, second } = fractionOfDayToTime(fractionalDay);
  return {
    year,
    month,
    day,
    hour,
    minute,
    second
  };
}
function calendarDate(jd) {
  return fromJulianDate(jd);
}

// src/time/delta-t.ts
function deltaT(year, month) {
  const y = year + (month - 0.5) / 12;
  if (y < -500) {
    return deltaTBeforeMinus500(y);
  }
  if (y < 500) {
    return deltaTMinus500To500(y);
  }
  if (y < 1600) {
    return deltaT500To1600(y);
  }
  if (y < 1700) {
    return deltaT1600To1700(y);
  }
  if (y < 1800) {
    return deltaT1700To1800(y);
  }
  if (y < 1860) {
    return deltaT1800To1860(y);
  }
  if (y < 1900) {
    return deltaT1860To1900(y);
  }
  if (y < 1920) {
    return deltaT1900To1920(y);
  }
  if (y < 1941) {
    return deltaT1920To1941(y);
  }
  if (y < 1961) {
    return deltaT1941To1961(y);
  }
  if (y < 1986) {
    return deltaT1961To1986(y);
  }
  if (y < 2005) {
    return deltaT1986To2005(y);
  }
  if (y < 2050) {
    return deltaT2005To2050(y);
  }
  if (y < 2150) {
    return deltaT2050To2150(y);
  }
  return deltaTAfter2150(y);
}
function deltaTBeforeMinus500(y) {
  const u = (y - 1820) / 100;
  return -20 + 32 * u * u;
}
function deltaTMinus500To500(y) {
  const u = y / 100;
  return 10583.6 - 1014.41 * u + 33.78311 * u ** 2 - 5.952053 * u ** 3 - 0.1798452 * u ** 4 + 0.022174192 * u ** 5 + 0.0090316521 * u ** 6;
}
function deltaT500To1600(y) {
  const u = (y - 1e3) / 100;
  return 1574.2 - 556.01 * u + 71.23472 * u ** 2 + 0.319781 * u ** 3 - 0.8503463 * u ** 4 - 5050998e-9 * u ** 5 + 0.0083572073 * u ** 6;
}
function deltaT1600To1700(y) {
  const t = y - 1600;
  return 120 - 0.9808 * t - 0.01532 * t ** 2 + t ** 3 / 7129;
}
function deltaT1700To1800(y) {
  const t = y - 1700;
  return 8.83 + 0.1603 * t - 59285e-7 * t ** 2 + 13336e-8 * t ** 3 - t ** 4 / 1174e3;
}
function deltaT1800To1860(y) {
  const t = y - 1800;
  return 13.72 - 0.332447 * t + 68612e-7 * t ** 2 + 41116e-7 * t ** 3 - 37436e-8 * t ** 4 + 121272e-10 * t ** 5 - 1699e-10 * t ** 6 + 875e-12 * t ** 7;
}
function deltaT1860To1900(y) {
  const t = y - 1860;
  return 7.62 + 0.5737 * t - 0.251754 * t ** 2 + 0.01680668 * t ** 3 - 4473624e-10 * t ** 4 + t ** 5 / 233174;
}
function deltaT1900To1920(y) {
  const t = y - 1900;
  return -2.79 + 1.494119 * t - 0.0598939 * t ** 2 + 61966e-7 * t ** 3 - 197e-6 * t ** 4;
}
function deltaT1920To1941(y) {
  const t = y - 1920;
  return 21.2 + 0.84493 * t - 0.0761 * t ** 2 + 20936e-7 * t ** 3;
}
function deltaT1941To1961(y) {
  const t = y - 1950;
  return 29.07 + 0.407 * t - t ** 2 / 233 + t ** 3 / 2547;
}
function deltaT1961To1986(y) {
  const t = y - 1975;
  return 45.45 + 1.067 * t - t ** 2 / 260 - t ** 3 / 718;
}
function deltaT1986To2005(y) {
  const t = y - 2e3;
  return 63.86 + 0.3345 * t - 0.060374 * t ** 2 + 17275e-7 * t ** 3 + 651814e-9 * t ** 4 + 2373599e-11 * t ** 5;
}
function deltaT2005To2050(y) {
  const t = (y - 2005) / 100;
  return 62.92 + 32.217 * t + 55.89 * t ** 2;
}
function deltaT2050To2150(y) {
  const t = (y - 1820) / 100;
  return -20 + 32 * t ** 2 - 0.5628 * (2150 - y);
}
function deltaTAfter2150(y) {
  const u = (y - 1820) / 100;
  return -20 + 32 * u * u;
}
function ttToUT(ttJD, year, month) {
  const dt = deltaT(year, month);
  const dtDays = dt / 86400;
  return ttJD - dtDays;
}
function utToTT(utJD, year, month) {
  const dt = deltaT(year, month);
  const dtDays = dt / 86400;
  return utJD + dtDays;
}

// src/progressions/progression-date.ts
function birthToJD(birth) {
  return toJulianDate({
    year: birth.year,
    month: birth.month,
    day: birth.day,
    hour: birth.hour,
    minute: birth.minute,
    second: birth.second ?? 0,
    timezone: birth.timezone
  });
}
function targetToJD(target) {
  return toJulianDate({
    year: target.year,
    month: target.month,
    day: target.day,
    hour: target.hour ?? 12,
    minute: target.minute ?? 0,
    second: target.second ?? 0
  });
}
function jdToProgressedDate(jd) {
  const date = fromJulianDate(jd);
  return {
    year: date.year,
    month: date.month,
    day: date.day,
    hour: date.hour,
    minute: date.minute,
    second: Math.round(date.second)
  };
}
function getDaysInMonth2(year, month) {
  const daysInMonth2 = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (month === 2 && isLeapYear4(year)) {
    return 29;
  }
  return daysInMonth2[month - 1];
}
function isLeapYear4(year) {
  return year % 4 === 0 && year % 100 !== 0 || year % 400 === 0;
}
function calculateAge(birthJD, targetJD) {
  return (targetJD - birthJD) / DAYS_PER_YEAR;
}
function calculateAgeInDays(birthJD, targetJD) {
  return targetJD - birthJD;
}
function ageToTargetJD(birthJD, ageInYears) {
  return birthJD + ageInYears * DAYS_PER_YEAR;
}
function getProgressedJD(birthJD, targetJD, type = "secondary") {
  const ageInYears = calculateAge(birthJD, targetJD);
  const rate = PROGRESSION_RATES[type];
  return birthJD + ageInYears * rate;
}
function calculateProgressedJD(birth, target, type = "secondary") {
  const birthJD = birthToJD(birth);
  const targetJD = targetToJD(target);
  return getProgressedJD(birthJD, targetJD, type);
}
function getProgressionDates(birth, target, type = "secondary") {
  const natalJD = birthToJD(birth);
  const targetJD = targetToJD(target);
  const progressedJD = getProgressedJD(natalJD, targetJD, type);
  const ageInYears = calculateAge(natalJD, targetJD);
  return {
    natalJD,
    natalDate: jdToProgressedDate(natalJD),
    targetJD,
    targetDate: {
      year: target.year,
      month: target.month,
      day: target.day,
      hour: target.hour ?? 12,
      minute: target.minute ?? 0,
      second: target.second ?? 0
    },
    progressedJD,
    progressedDate: jdToProgressedDate(progressedJD),
    daysFromBirth: progressedJD - natalJD,
    ageInYears
  };
}
function validateProgressionDates(birth, target) {
  if (birth.year < MIN_BIRTH_YEAR) {
    throw new ProgressionValidationError(
      `Birth year ${birth.year} is before minimum supported year ${MIN_BIRTH_YEAR}`,
      "birth.year",
      birth.year
    );
  }
  if (target.year > MAX_TARGET_YEAR) {
    throw new ProgressionValidationError(
      `Target year ${target.year} is after maximum supported year ${MAX_TARGET_YEAR}`,
      "target.year",
      target.year
    );
  }
  if (birth.month < 1 || birth.month > 12) {
    throw new ProgressionValidationError(
      `Birth month ${birth.month} is invalid (must be 1-12)`,
      "birth.month",
      birth.month
    );
  }
  const daysInBirthMonth = getDaysInMonth2(birth.year, birth.month);
  if (birth.day < 1 || birth.day > daysInBirthMonth) {
    throw new ProgressionValidationError(
      `Birth day ${birth.day} is invalid for month ${birth.month} (max: ${daysInBirthMonth})`,
      "birth.day",
      birth.day
    );
  }
  if (birth.hour < 0 || birth.hour > 23) {
    throw new ProgressionValidationError(
      `Birth hour ${birth.hour} is invalid (must be 0-23)`,
      "birth.hour",
      birth.hour
    );
  }
  if (birth.minute < 0 || birth.minute > 59) {
    throw new ProgressionValidationError(
      `Birth minute ${birth.minute} is invalid (must be 0-59)`,
      "birth.minute",
      birth.minute
    );
  }
  if (target.month < 1 || target.month > 12) {
    throw new ProgressionValidationError(
      `Target month ${target.month} is invalid (must be 1-12)`,
      "target.month",
      target.month
    );
  }
  const daysInTargetMonth = getDaysInMonth2(target.year, target.month);
  if (target.day < 1 || target.day > daysInTargetMonth) {
    throw new ProgressionValidationError(
      `Target day ${target.day} is invalid for month ${target.month} (max: ${daysInTargetMonth})`,
      "target.day",
      target.day
    );
  }
  const birthJD = birthToJD(birth);
  const targetJD = targetToJD(target);
  if (targetJD < birthJD) {
    throw new ProgressionValidationError("Target date is before birth date", "target", target);
  }
  const age = calculateAge(birthJD, targetJD);
  if (age > MAX_PROGRESSION_AGE) {
    throw new ProgressionValidationError(
      `Age ${age.toFixed(1)} exceeds maximum supported age ${MAX_PROGRESSION_AGE}`,
      "age",
      age
    );
  }
  if (birth.latitude < -90 || birth.latitude > 90) {
    throw new ProgressionValidationError(
      `Birth latitude ${birth.latitude} is invalid (must be -90 to 90)`,
      "birth.latitude",
      birth.latitude
    );
  }
  if (birth.longitude < -180 || birth.longitude > 180) {
    throw new ProgressionValidationError(
      `Birth longitude ${birth.longitude} is invalid (must be -180 to 180)`,
      "birth.longitude",
      birth.longitude
    );
  }
}

// src/progressions/solar-arc.ts
function calculateSolarArc(birthJD, targetJD) {
  const natalSun = getSunPosition(birthJD);
  const progressedJD = getProgressedJD(birthJD, targetJD, "secondary");
  const progressedSun = getSunPosition(progressedJD);
  let arc = progressedSun.longitude - natalSun.longitude;
  while (arc < 0) arc += 360;
  while (arc >= 360) arc -= 360;
  return arc;
}
function calculateSolarArcFromDates(birth, target) {
  const birthJD = birthToJD(birth);
  const targetJD = targetToJD(target);
  return calculateSolarArc(birthJD, targetJD);
}
function estimateSolarArc(ageInYears) {
  return ageInYears * SUN_MEAN_DAILY_MOTION;
}
function getNatalSunLongitude(birthJD) {
  return getSunPosition(birthJD).longitude;
}
function getProgressedSunLongitude(birthJD, targetJD) {
  const progressedJD = getProgressedJD(birthJD, targetJD, "secondary");
  return getSunPosition(progressedJD).longitude;
}
function applySolarArc(natalLongitude, solarArc) {
  let directed = natalLongitude + solarArc;
  while (directed < 0) directed += 360;
  while (directed >= 360) directed -= 360;
  return directed;
}
function applySolarArcToMany(natalPositions, solarArc) {
  return natalPositions.map((pos) => applySolarArc(pos, solarArc));
}
function estimateAgeForSolarArc(solarArc) {
  return solarArc / SUN_MEAN_DAILY_MOTION;
}
function estimateAgeForDirectedPosition(natalLongitude, targetLongitude) {
  let arc = targetLongitude - natalLongitude;
  if (arc < 0) arc += 360;
  return estimateAgeForSolarArc(arc);
}
function solarArcForAspect(natalDirecting, natalReceiving, aspectAngle) {
  const arcs = [];
  const target1 = (natalReceiving + aspectAngle) % 360;
  const target2 = (natalReceiving - aspectAngle + 360) % 360;
  let arc1 = target1 - natalDirecting;
  if (arc1 < 0) arc1 += 360;
  arcs.push(arc1);
  if (Math.abs(target1 - target2) > 0.01) {
    let arc2 = target2 - natalDirecting;
    if (arc2 < 0) arc2 += 360;
    arcs.push(arc2);
  }
  arcs.sort((a, b) => a - b);
  return arcs;
}
function formatSolarArc(solarArc, precision = 2) {
  return `${solarArc.toFixed(precision)}\xB0`;
}
function formatSolarArcDMS(solarArc) {
  const degrees = Math.floor(solarArc);
  const minutesDecimal = (solarArc - degrees) * 60;
  const minutes = Math.floor(minutesDecimal);
  const seconds = Math.round((minutesDecimal - minutes) * 60);
  return `${degrees}\xB0${minutes.toString().padStart(2, "0")}'${seconds.toString().padStart(2, "0")}"`;
}

// src/progressions/progressed-angles.ts
function normalizeLongitude3(longitude) {
  let result = longitude % 360;
  if (result < 0) result += 360;
  return result;
}
function longitudeToZodiac(longitude) {
  const normalized = normalizeLongitude3(longitude);
  const signIndex = Math.floor(normalized / 30);
  const positionInSign = normalized - signIndex * 30;
  const degree = Math.floor(positionInSign);
  const minuteDecimal = (positionInSign - degree) * 60;
  const minute = Math.floor(minuteDecimal);
  const second = Math.round((minuteDecimal - minute) * 60);
  const signName = SIGN_NAMES[signIndex];
  const formatted = `${degree}\xB0${minute.toString().padStart(2, "0")}' ${signName}`;
  return { signIndex, signName, degree, minute, second, formatted };
}
function createProgressedAngle(_name, natalLongitude, progressedLongitude) {
  const natalZodiac = longitudeToZodiac(natalLongitude);
  const progressedZodiac = longitudeToZodiac(progressedLongitude);
  let arcFromNatal = progressedLongitude - natalLongitude;
  while (arcFromNatal > 180) arcFromNatal -= 360;
  while (arcFromNatal < -180) arcFromNatal += 360;
  return {
    longitude: progressedLongitude,
    natalLongitude,
    arcFromNatal: Math.abs(arcFromNatal),
    signIndex: progressedZodiac.signIndex,
    signName: progressedZodiac.signName,
    degree: progressedZodiac.degree,
    minute: progressedZodiac.minute,
    second: progressedZodiac.second,
    formatted: progressedZodiac.formatted,
    hasChangedSign: progressedZodiac.signIndex !== natalZodiac.signIndex
  };
}
function getNatalAngles(birthJD, latitude, longitude, _houseSystem = "placidus") {
  const lst = localSiderealTime(birthJD, longitude);
  const T = toJulianCenturies(birthJD);
  const obliquity = meanObliquity(T);
  const angles = calculateAngles(lst, obliquity, latitude);
  return {
    ascendant: angles.ascendant,
    midheaven: angles.midheaven
  };
}
function getNatalAnglesFromBirth(birth, houseSystem = "placidus") {
  const birthJD = birthToJD(birth);
  return getNatalAngles(birthJD, birth.latitude, birth.longitude, houseSystem);
}
function getProgressedAnglesSolarArc(birthJD, targetJD, latitude, longitude, houseSystem = "placidus") {
  const natal = getNatalAngles(birthJD, latitude, longitude, houseSystem);
  const solarArc = calculateSolarArc(birthJD, targetJD);
  const progressedASC = applySolarArc(natal.ascendant, solarArc);
  const progressedMC = applySolarArc(natal.midheaven, solarArc);
  const progressedDSC = normalizeLongitude3(progressedASC + 180);
  const progressedIC = normalizeLongitude3(progressedMC + 180);
  return {
    ascendant: createProgressedAngle("ASC", natal.ascendant, progressedASC),
    midheaven: createProgressedAngle("MC", natal.midheaven, progressedMC),
    descendant: createProgressedAngle(
      "DSC",
      normalizeLongitude3(natal.ascendant + 180),
      progressedDSC
    ),
    imumCoeli: createProgressedAngle("IC", normalizeLongitude3(natal.midheaven + 180), progressedIC),
    solarArc,
    method: "solar-arc"
  };
}
function getProgressedAnglesTimeBased(birthJD, targetJD, latitude, longitude, progressionType = "secondary", houseSystem = "placidus") {
  const natal = getNatalAngles(birthJD, latitude, longitude, houseSystem);
  const progressedJD = getProgressedJD(birthJD, targetJD, progressionType);
  const progressed = getNatalAngles(progressedJD, latitude, longitude, houseSystem);
  const solarArc = calculateSolarArc(birthJD, targetJD);
  const natalDSC = normalizeLongitude3(natal.ascendant + 180);
  const natalIC = normalizeLongitude3(natal.midheaven + 180);
  const progressedDSC = normalizeLongitude3(progressed.ascendant + 180);
  const progressedIC = normalizeLongitude3(progressed.midheaven + 180);
  return {
    ascendant: createProgressedAngle("ASC", natal.ascendant, progressed.ascendant),
    midheaven: createProgressedAngle("MC", natal.midheaven, progressed.midheaven),
    descendant: createProgressedAngle("DSC", natalDSC, progressedDSC),
    imumCoeli: createProgressedAngle("IC", natalIC, progressedIC),
    solarArc,
    method: "time-based"
  };
}
function getProgressedAngles(birthJD, targetJD, latitude, longitude, method = "solar-arc", progressionType = "secondary", houseSystem = "placidus") {
  if (method === "solar-arc") {
    return getProgressedAnglesSolarArc(birthJD, targetJD, latitude, longitude, houseSystem);
  }
  return getProgressedAnglesTimeBased(
    birthJD,
    targetJD,
    latitude,
    longitude,
    progressionType,
    houseSystem
  );
}
function calculateProgressedAngles(birth, target, method = "solar-arc", progressionType = "secondary", houseSystem = "placidus") {
  const birthJD = birthToJD(birth);
  const targetJD = targetToJD(target);
  return getProgressedAngles(
    birthJD,
    targetJD,
    birth.latitude,
    birth.longitude,
    method,
    progressionType,
    houseSystem
  );
}
function getProgressedASC(birthJD, targetJD, latitude, longitude, method = "solar-arc") {
  const angles = getProgressedAngles(birthJD, targetJD, latitude, longitude, method);
  return angles.ascendant;
}
function getProgressedMC(birthJD, targetJD, latitude, longitude, method = "solar-arc") {
  const angles = getProgressedAngles(birthJD, targetJD, latitude, longitude, method);
  return angles.midheaven;
}
function hasASCChangedSign(birthJD, targetJD, latitude, longitude, method = "solar-arc") {
  const angles = getProgressedAngles(birthJD, targetJD, latitude, longitude, method);
  return angles.ascendant.hasChangedSign;
}
function hasMCChangedSign(birthJD, targetJD, latitude, longitude, method = "solar-arc") {
  const angles = getProgressedAngles(birthJD, targetJD, latitude, longitude, method);
  return angles.midheaven.hasChangedSign;
}
function estimateAgeForASCSign(natalASC, targetSignIndex) {
  const targetStart = targetSignIndex * 30;
  let arc = targetStart - natalASC;
  if (arc < 0) arc += 360;
  return arc;
}
function estimateAgeForMCSign(natalMC, targetSignIndex) {
  const targetStart = targetSignIndex * 30;
  let arc = targetStart - natalMC;
  if (arc < 0) arc += 360;
  return arc;
}
function formatProgressedAngles(angles) {
  const lines = [
    `Progressed Angles (${angles.method}, Solar Arc: ${angles.solarArc.toFixed(2)}\xB0)`,
    `  ASC: ${angles.ascendant.formatted}`,
    `  MC:  ${angles.midheaven.formatted}`,
    `  DSC: ${angles.descendant.formatted}`,
    `  IC:  ${angles.imumCoeli.formatted}`
  ];
  if (angles.ascendant.hasChangedSign) {
    lines.push(`  \u26A0 ASC has changed sign`);
  }
  if (angles.midheaven.hasChangedSign) {
    lines.push(`  \u26A0 MC has changed sign`);
  }
  return lines.join("\n");
}

// src/progressions/progressed-positions.ts
function getTrueNodePosition(jd) {
  const node = getTrueNode(jd);
  return { longitude: node.northNode };
}
var POSITION_GETTERS = {
  Sun: getSunPosition,
  Moon: getMoonPosition,
  Mercury: getMercuryPosition,
  Venus: getVenusPosition,
  Mars: getMarsPosition,
  Jupiter: getJupiterPosition,
  Saturn: getSaturnPosition,
  Uranus: getUranusPosition,
  Neptune: getNeptunePosition,
  Pluto: getPlutoPosition,
  Chiron: getChironPosition,
  TrueNode: getTrueNodePosition
};
var BODY_NAME_TO_ENUM = {
  Sun: "Sun" /* Sun */,
  Moon: "Moon" /* Moon */,
  Mercury: "Mercury" /* Mercury */,
  Venus: "Venus" /* Venus */,
  Mars: "Mars" /* Mars */,
  Jupiter: "Jupiter" /* Jupiter */,
  Saturn: "Saturn" /* Saturn */,
  Uranus: "Uranus" /* Uranus */,
  Neptune: "Neptune" /* Neptune */,
  Pluto: "Pluto" /* Pluto */,
  Chiron: "Chiron" /* Chiron */,
  TrueNode: "TrueNorthNode" /* TrueNorthNode */
};
function normalizeLongitude4(longitude) {
  let result = longitude % 360;
  if (result < 0) result += 360;
  return result;
}
function longitudeToZodiac2(longitude) {
  const normalized = normalizeLongitude4(longitude);
  const signIndex = Math.floor(normalized / 30);
  const positionInSign = normalized - signIndex * 30;
  const degree = Math.floor(positionInSign);
  const minuteDecimal = (positionInSign - degree) * 60;
  const minute = Math.floor(minuteDecimal);
  const second = Math.round((minuteDecimal - minute) * 60);
  const signName = SIGN_NAMES[signIndex];
  const formatted = `${degree}\xB0${minute.toString().padStart(2, "0")}' ${signName}`;
  return { signIndex, signName, degree, minute, second, formatted };
}
function isRetrograde3(currentJD, getPosition2) {
  const pos1 = getPosition2(currentJD - 0.5);
  const pos2 = getPosition2(currentJD + 0.5);
  let diff = pos2.longitude - pos1.longitude;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return diff < 0;
}
function getNatalPosition(bodyName, birthJD) {
  const getPosition2 = POSITION_GETTERS[bodyName];
  if (!getPosition2) {
    throw new Error(`Unknown body: ${bodyName}`);
  }
  return getPosition2(birthJD);
}
function calculateLongitudeSpeed(jd, getPosition2) {
  const pos1 = getPosition2(jd - 0.5);
  const pos2 = getPosition2(jd + 0.5);
  let diff = pos2.longitude - pos1.longitude;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return diff;
}
function getProgressedPosition(bodyName, birthJD, targetJD, progressionType = "secondary") {
  const getPosition2 = POSITION_GETTERS[bodyName];
  if (!getPosition2) {
    throw new Error(`Unknown body: ${bodyName}`);
  }
  const natal = getPosition2(birthJD);
  const natalRetrograde = isRetrograde3(birthJD, getPosition2);
  const natalZodiac = longitudeToZodiac2(natal.longitude);
  let progressedLong;
  let progressedRetrograde;
  let progressedSpeed;
  let progressedJD;
  if (progressionType === "solar-arc") {
    const solarArc = calculateSolarArc(birthJD, targetJD);
    progressedLong = applySolarArc(natal.longitude, solarArc);
    progressedRetrograde = false;
    progressedSpeed = 0;
    progressedJD = birthJD;
  } else {
    progressedJD = getProgressedJD(birthJD, targetJD, progressionType);
    const progressed = getPosition2(progressedJD);
    progressedLong = progressed.longitude;
    progressedRetrograde = isRetrograde3(progressedJD, getPosition2);
    progressedSpeed = calculateLongitudeSpeed(progressedJD, getPosition2);
  }
  const progressedZodiac = longitudeToZodiac2(progressedLong);
  let arcFromNatal = progressedLong - natal.longitude;
  while (arcFromNatal > 180) arcFromNatal -= 360;
  while (arcFromNatal < -180) arcFromNatal += 360;
  return {
    // ProgressedPosition fields
    longitude: progressedLong,
    natalLongitude: natal.longitude,
    arcFromNatal: Math.abs(arcFromNatal),
    signIndex: progressedZodiac.signIndex,
    signName: progressedZodiac.signName,
    degree: progressedZodiac.degree,
    minute: progressedZodiac.minute,
    second: progressedZodiac.second,
    formatted: progressedZodiac.formatted,
    hasChangedSign: progressedZodiac.signIndex !== natalZodiac.signIndex,
    // ProgressedPlanet-specific fields
    name: bodyName,
    body: BODY_NAME_TO_ENUM[bodyName],
    isRetrograde: progressedRetrograde,
    longitudeSpeed: progressedSpeed,
    retrogradeChanged: progressedRetrograde !== natalRetrograde,
    wasRetrograde: natalRetrograde
  };
}
function getProgressedPositions(bodies, birthJD, targetJD, progressionType = "secondary") {
  return bodies.map((body) => getProgressedPosition(body, birthJD, targetJD, progressionType));
}
function getAllProgressedPositions(birthJD, targetJD, progressionType = "secondary") {
  return getProgressedPositions(
    DEFAULT_PROGRESSION_BODIES,
    birthJD,
    targetJD,
    progressionType
  );
}
function calculateProgressedPositions(birth, target, config) {
  const birthJD = birthToJD(birth);
  const targetJD = targetToJD(target);
  const progressionType = config?.type ?? "secondary";
  const bodies = config?.bodies ?? DEFAULT_PROGRESSION_BODIES;
  return getProgressedPositions(bodies, birthJD, targetJD, progressionType);
}
function getProgressedBodyFromDates(bodyName, birth, target, progressionType = "secondary") {
  const birthJD = birthToJD(birth);
  const targetJD = targetToJD(target);
  return getProgressedPosition(bodyName, birthJD, targetJD, progressionType);
}
function getBodiesWithSignChange(positions) {
  return positions.filter((p) => p.hasChangedSign);
}
function getRetrogradeBodies(positions) {
  return positions.filter((p) => p.isRetrograde);
}
function getBodyWithLargestArc(positions) {
  if (positions.length === 0) return void 0;
  return positions.reduce(
    (max, current) => current.arcFromNatal > max.arcFromNatal ? current : max
  );
}
function sortByLongitude(positions) {
  return [...positions].sort((a, b) => a.longitude - b.longitude);
}
function groupBySign(positions) {
  const result = /* @__PURE__ */ new Map();
  for (const pos of positions) {
    const sign = pos.signName;
    if (!result.has(sign)) {
      result.set(sign, []);
    }
    result.get(sign).push(pos);
  }
  return result;
}

// src/progressions/progressed-moon.ts
function normalizeLongitude5(longitude) {
  let result = longitude % 360;
  if (result < 0) result += 360;
  return result;
}
function longitudeToZodiac3(longitude) {
  const normalized = normalizeLongitude5(longitude);
  const signIndex = Math.floor(normalized / 30);
  const positionInSign = normalized - signIndex * 30;
  const degree = Math.floor(positionInSign);
  const minuteDecimal = (positionInSign - degree) * 60;
  const minute = Math.floor(minuteDecimal);
  const second = Math.round((minuteDecimal - minute) * 60);
  const signName = SIGN_NAMES[signIndex];
  const formatted = `${degree}\xB0${minute.toString().padStart(2, "0")}' ${signName}`;
  return { signIndex, signName, degree, minute, second, formatted };
}
function getLunarPhase(phaseAngle) {
  const normalized = normalizeLongitude5(phaseAngle);
  if (normalized < 45) {
    return {
      name: "New Moon",
      description: "New beginnings, planting seeds, initiation of cycles"
    };
  }
  if (normalized < 90) {
    return {
      name: "Crescent",
      description: "Struggle, challenges, building momentum"
    };
  }
  if (normalized < 135) {
    return {
      name: "First Quarter",
      description: "Crisis in action, decisive steps, building structures"
    };
  }
  if (normalized < 180) {
    return {
      name: "Gibbous",
      description: "Refinement, analysis, preparation for fulfillment"
    };
  }
  if (normalized < 225) {
    return {
      name: "Full Moon",
      description: "Culmination, awareness, relationships highlighted"
    };
  }
  if (normalized < 270) {
    return {
      name: "Disseminating",
      description: "Sharing, teaching, distributing results"
    };
  }
  if (normalized < 315) {
    return {
      name: "Last Quarter",
      description: "Crisis in consciousness, reorientation, letting go"
    };
  }
  return {
    name: "Balsamic",
    description: "Release, ending, preparation for new cycle"
  };
}
function calculateMoonSpeed(jd) {
  const pos1 = getMoonPosition(jd - 0.5);
  const pos2 = getMoonPosition(jd + 0.5);
  let diff = pos2.longitude - pos1.longitude;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return diff;
}
function getProgressedMoon(birthJD, targetJD, progressionType = "secondary") {
  const natal = getMoonPosition(birthJD);
  const natalZodiac = longitudeToZodiac3(natal.longitude);
  const progressedJD = getProgressedJD(birthJD, targetJD, progressionType);
  const progressed = getMoonPosition(progressedJD);
  const progressedZodiac = longitudeToZodiac3(progressed.longitude);
  const yearsElapsed = calculateAge(birthJD, targetJD);
  const estimatedTotalArc = yearsElapsed * MOON_MEAN_DAILY_MOTION;
  let directArc = progressed.longitude - natal.longitude;
  while (directArc < 0) directArc += 360;
  const fullCycles = Math.floor((estimatedTotalArc + 1e-3) / 360);
  const actualArc = fullCycles * 360 + directArc;
  const speed = calculateMoonSpeed(progressedJD);
  return {
    // ProgressedPosition fields
    longitude: progressed.longitude,
    natalLongitude: natal.longitude,
    arcFromNatal: actualArc,
    signIndex: progressedZodiac.signIndex,
    signName: progressedZodiac.signName,
    degree: progressedZodiac.degree,
    minute: progressedZodiac.minute,
    second: progressedZodiac.second,
    formatted: progressedZodiac.formatted,
    hasChangedSign: progressedZodiac.signIndex !== natalZodiac.signIndex,
    // ProgressedPlanet-specific fields
    name: "Moon",
    body: "Moon" /* Moon */,
    isRetrograde: false,
    // Moon never retrogrades
    longitudeSpeed: speed,
    retrogradeChanged: false,
    wasRetrograde: false
  };
}
function getProgressedMoonFromDates(birth, target, progressionType = "secondary") {
  const birthJD = birthToJD(birth);
  const targetJD = targetToJD(target);
  return getProgressedMoon(birthJD, targetJD, progressionType);
}
function getProgressedLunarPhase(birthJD, targetJD, progressionType = "secondary") {
  const progressedJD = getProgressedJD(birthJD, targetJD, progressionType);
  const moon = getMoonPosition(progressedJD);
  const sunPos = getSunPosition(progressedJD);
  let phaseAngle = moon.longitude - sunPos.longitude;
  phaseAngle = normalizeLongitude5(phaseAngle);
  const phase = getLunarPhase(phaseAngle);
  const currentPhasePosition = phaseAngle % 45;
  const degreesToNextPhase = 45 - currentPhasePosition;
  const moonSunDailyGap = MOON_MEAN_DAILY_MOTION - 1;
  const daysUntilNextPhase = degreesToNextPhase / moonSunDailyGap;
  return {
    phaseName: phase.name,
    phaseAngle,
    daysUntilNextPhase: Math.round(daysUntilNextPhase * 10) / 10,
    description: phase.description
  };
}
function calculateMoonSignTransits(birthJD, yearsToCalculate = 30) {
  const transits = [];
  const natal = getMoonPosition(birthJD);
  const natalSign = Math.floor(natal.longitude / 30);
  let currentAge = 0;
  let currentSign = natalSign;
  const natalPositionInSign = natal.longitude % 30;
  const degreesToNextSign = 30 - natalPositionInSign;
  const firstExitAge = degreesToNextSign / MOON_MEAN_DAILY_MOTION;
  transits.push({
    signIndex: natalSign,
    signName: SIGN_NAMES[natalSign],
    entryAge: 0,
    exitAge: firstExitAge,
    durationYears: firstExitAge
  });
  currentAge = firstExitAge;
  currentSign = (natalSign + 1) % 12;
  const avgYearsPerSign = 30 / MOON_MEAN_DAILY_MOTION;
  while (currentAge < yearsToCalculate) {
    const exitAge = currentAge + avgYearsPerSign;
    transits.push({
      signIndex: currentSign,
      signName: SIGN_NAMES[currentSign],
      entryAge: currentAge,
      exitAge: Math.min(exitAge, yearsToCalculate),
      durationYears: avgYearsPerSign
    });
    currentAge = exitAge;
    currentSign = (currentSign + 1) % 12;
  }
  return transits;
}
function getAgeAtNextMoonSignChange(birthJD, currentAge) {
  const targetJD = birthJD + currentAge * 365.25;
  const progressedJD = getProgressedJD(birthJD, targetJD, "secondary");
  const moon = getMoonPosition(progressedJD);
  const positionInSign = moon.longitude % 30;
  const degreesToNextSign = 30 - positionInSign;
  const yearsToNextSign = degreesToNextSign / MOON_MEAN_DAILY_MOTION;
  return currentAge + yearsToNextSign;
}
function getMoonZodiacCycles(birthJD, targetJD) {
  const yearsElapsed = calculateAge(birthJD, targetJD);
  const totalDegrees = yearsElapsed * MOON_MEAN_DAILY_MOTION;
  const complete = Math.floor((totalDegrees + 1e-3) / 360);
  const fractional = (totalDegrees % 360 + 360) % 360 / 360;
  return { complete, fractional, totalDegrees };
}
function getMoonReturnAges() {
  const cycleLength = 360 / MOON_MEAN_DAILY_MOTION;
  return [cycleLength, cycleLength * 2, cycleLength * 3];
}
function getProgressedMoonReport(birth, target, yearsToProject = 30) {
  const birthJD = birthToJD(birth);
  const targetJD = targetToJD(target);
  const current = getProgressedMoon(birthJD, targetJD);
  const phase = getProgressedLunarPhase(birthJD, targetJD);
  const signTransits = calculateMoonSignTransits(birthJD, yearsToProject);
  const currentAge = calculateAge(birthJD, targetJD);
  const ageAtNextSignChange = getAgeAtNextMoonSignChange(birthJD, currentAge);
  const cycles = getMoonZodiacCycles(birthJD, targetJD);
  return {
    current,
    phase,
    signTransits,
    ageAtNextSignChange,
    zodiacCyclesCompleted: cycles.complete
  };
}
function formatMoonTransit(transit) {
  return `${transit.signName}: age ${transit.entryAge.toFixed(1)} - ${transit.exitAge.toFixed(1)} (${transit.durationYears.toFixed(1)} years)`;
}
function formatProgressedMoonReport(report) {
  const lines = [
    "=== Progressed Moon Report ===",
    "",
    `Current Position: ${report.current.formatted}`,
    `Arc from Natal: ${report.current.arcFromNatal.toFixed(2)}\xB0`,
    `Zodiac Cycles Completed: ${report.zodiacCyclesCompleted}`,
    "",
    `Lunar Phase: ${report.phase.phaseName}`,
    `Phase Angle: ${report.phase.phaseAngle.toFixed(1)}\xB0`,
    `${report.phase.description}`,
    "",
    `Age at Next Sign Change: ${report.ageAtNextSignChange.toFixed(1)}`,
    "",
    "Sign Transits:"
  ];
  for (const transit of report.signTransits.slice(0, 15)) {
    lines.push(`  ${formatMoonTransit(transit)}`);
  }
  return lines.join("\n");
}

// src/progressions/progressed-aspects.ts
function angularSeparation2(long1, long2) {
  let diff = Math.abs(long1 - long2);
  if (diff > 180) diff = 360 - diff;
  return diff;
}
function getOrb2(aspectType, orbs) {
  if (orbs?.[aspectType] !== void 0) {
    return orbs[aspectType];
  }
  return PROGRESSION_ORBS[aspectType] ?? 1;
}
function calculateStrength2(separation, exactAngle, orb) {
  const deviation = Math.abs(separation - exactAngle);
  if (deviation > orb) return 0;
  return Math.round((1 - deviation / orb) * 100);
}
function determineAspectPhase(progressedLong, natalLong, aspectAngle, dailyMotion, deviation, exactThreshold) {
  if (deviation <= exactThreshold) {
    return "exact";
  }
  const currentSep = angularSeparation2(progressedLong, natalLong);
  const futureLong = progressedLong + dailyMotion * 0.01;
  const futureSep = angularSeparation2(futureLong, natalLong);
  const currentDev = Math.abs(currentSep - aspectAngle);
  const futureDev = Math.abs(futureSep - aspectAngle);
  return futureDev < currentDev ? "applying" : "separating";
}
function detectProgressedToNatalAspects(progressedBody, natalPositions, config = {}) {
  const aspects = [];
  const aspectTypes = config.aspectTypes ?? [...MAJOR_PROGRESSION_ASPECTS];
  const exactThreshold = config.exactThreshold ?? EXACT_THRESHOLD;
  const minimumStrength = config.minimumStrength ?? 0;
  for (const natal of natalPositions) {
    if (natal.name === progressedBody.name) continue;
    const separation = angularSeparation2(progressedBody.longitude, natal.longitude);
    for (const aspectType of aspectTypes) {
      const exactAngle = getAspectAngle(aspectType);
      const orb = getOrb2(aspectType, config.orbs);
      const deviation = Math.abs(separation - exactAngle);
      if (deviation <= orb) {
        const strength = calculateStrength2(separation, exactAngle, orb);
        if (strength >= minimumStrength) {
          const dailyMotion = progressedBody.longitudeSpeed;
          const phase = determineAspectPhase(
            progressedBody.longitude,
            natal.longitude,
            exactAngle,
            dailyMotion,
            deviation,
            exactThreshold
          );
          aspects.push({
            progressedBody: progressedBody.name,
            progressedLongitude: progressedBody.longitude,
            natalBody: natal.name,
            natalLongitude: natal.longitude,
            aspectType,
            symbol: getAspectSymbol(aspectType),
            exactAngle,
            separation,
            deviation,
            orb,
            strength,
            phase,
            isRetrograde: progressedBody.isRetrograde
          });
        }
      }
    }
  }
  return aspects;
}
function detectProgressedToProgressedAspects(positions, config = {}) {
  const aspects = [];
  const aspectTypes = config.aspectTypes ?? [...MAJOR_PROGRESSION_ASPECTS];
  const exactThreshold = config.exactThreshold ?? EXACT_THRESHOLD;
  const minimumStrength = config.minimumStrength ?? 0;
  for (let i = 0; i < positions.length; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      const body1 = positions[i];
      const body2 = positions[j];
      const separation = angularSeparation2(body1.longitude, body2.longitude);
      for (const aspectType of aspectTypes) {
        const exactAngle = getAspectAngle(aspectType);
        const orb = getOrb2(aspectType, config.orbs);
        const deviation = Math.abs(separation - exactAngle);
        if (deviation <= orb) {
          const strength = calculateStrength2(separation, exactAngle, orb);
          if (strength >= minimumStrength) {
            const phase = deviation <= exactThreshold ? "exact" : "separating";
            aspects.push({
              progressedBody: body1.name,
              progressedLongitude: body1.longitude,
              natalBody: `P.${body2.name}`,
              // Mark as progressed
              natalLongitude: body2.longitude,
              aspectType,
              symbol: getAspectSymbol(aspectType),
              exactAngle,
              separation,
              deviation,
              orb,
              strength,
              phase,
              isRetrograde: body1.isRetrograde
            });
          }
        }
      }
    }
  }
  return aspects;
}
function getAspectAngle(aspectType) {
  const angles = {
    conjunction: 0,
    opposition: 180,
    trine: 120,
    square: 90,
    sextile: 60,
    quincunx: 150,
    "semi-sextile": 30,
    "semi-square": 45,
    sesquiquadrate: 135,
    quintile: 72,
    biquintile: 144,
    septile: 51.43,
    novile: 40,
    decile: 36
  };
  return angles[aspectType] ?? 0;
}
function getAspectSymbol(aspectType) {
  const symbols = {
    conjunction: "\u260C",
    opposition: "\u260D",
    trine: "\u25B3",
    square: "\u25A1",
    sextile: "\u26B9",
    quincunx: "\u26BB",
    "semi-sextile": "\u26BA",
    "semi-square": "\u2220",
    sesquiquadrate: "\u26BC",
    quintile: "Q",
    biquintile: "bQ",
    septile: "S",
    novile: "N",
    decile: "D"
  };
  return symbols[aspectType] ?? "?";
}
function detectProgressedAspects(birthJD, targetJD, progressionType = "secondary", config = {}) {
  const bodies = DEFAULT_PROGRESSION_BODIES;
  const natalPositions = bodies.map((name) => ({
    name,
    longitude: getNatalPosition(name, birthJD).longitude
  }));
  const progressedPositions = bodies.map(
    (name) => getProgressedPosition(name, birthJD, targetJD, progressionType)
  );
  const pToNAspects = [];
  for (const progressed of progressedPositions) {
    const aspectsForBody = detectProgressedToNatalAspects(progressed, natalPositions, config);
    pToNAspects.push(...aspectsForBody);
  }
  let pToPAspects = [];
  if (config.includeProgressedToProgressed) {
    pToPAspects = detectProgressedToProgressedAspects(progressedPositions, config);
  }
  const allAspects = [...pToNAspects, ...pToPAspects];
  const exactAspects = allAspects.filter((a) => a.phase === "exact");
  const applyingAspects = allAspects.filter((a) => a.phase === "applying");
  const separatingAspects = allAspects.filter((a) => a.phase === "separating");
  return {
    aspects: allAspects,
    exactAspects,
    applyingAspects,
    separatingAspects,
    summary: {
      total: allAspects.length,
      exact: exactAspects.length,
      applying: applyingAspects.length,
      separating: separatingAspects.length
    }
  };
}
function calculateProgressedAspects(birth, target, progressionType = "secondary", config = {}) {
  const birthJD = birthToJD(birth);
  const targetJD = targetToJD(target);
  return detectProgressedAspects(birthJD, targetJD, progressionType, config);
}
function getAspectsToNatalBody(aspects, bodyName) {
  return aspects.filter((a) => a.natalBody === bodyName);
}
function getAspectsFromProgressedBody(aspects, bodyName) {
  return aspects.filter((a) => a.progressedBody === bodyName);
}
function getStrongestAspect3(aspects) {
  if (aspects.length === 0) return void 0;
  return aspects.reduce((max, current) => current.strength > max.strength ? current : max);
}
function getAspectsByType(aspects, aspectType) {
  return aspects.filter((a) => a.aspectType === aspectType);
}
function sortByStrength(aspects) {
  return [...aspects].sort((a, b) => b.strength - a.strength);
}
function formatAspect2(aspect) {
  const exactMarker = aspect.phase === "exact" ? "\u2605" : "";
  return `${aspect.progressedBody} ${aspect.symbol} ${aspect.natalBody} (${aspect.deviation.toFixed(2)}\xB0 orb, ${aspect.strength}% strength, ${aspect.phase})${exactMarker}`;
}
function formatAspects(result) {
  const lines = [
    "=== Progression Aspects ===",
    "",
    `Total: ${result.summary.total} aspects`,
    `Exact: ${result.summary.exact}`,
    `Applying: ${result.summary.applying}`,
    `Separating: ${result.summary.separating}`,
    ""
  ];
  if (result.exactAspects.length > 0) {
    lines.push("Exact/Near-Exact Aspects:");
    for (const aspect of result.exactAspects) {
      lines.push(`  ${formatAspect2(aspect)}`);
    }
    lines.push("");
  }
  if (result.aspects.length > 0) {
    lines.push("All Aspects (by strength):");
    const sorted = sortByStrength(result.aspects);
    for (const aspect of sorted.slice(0, 20)) {
      lines.push(`  ${formatAspect2(aspect)}`);
    }
  }
  return lines.join("\n");
}

// src/progressions/progression-summary.ts
function jdToProgressedDate2(jd) {
  const z = Math.floor(jd + 0.5);
  const f = jd + 0.5 - z;
  let a;
  if (z < 2299161) {
    a = z;
  } else {
    const alpha = Math.floor((z - 186721625e-2) / 36524.25);
    a = z + 1 + alpha - Math.floor(alpha / 4);
  }
  const b = a + 1524;
  const c = Math.floor((b - 122.1) / 365.25);
  const d = Math.floor(365.25 * c);
  const e = Math.floor((b - d) / 30.6001);
  const day = b - d - Math.floor(30.6001 * e);
  const month = e < 14 ? e - 1 : e - 13;
  const year = month > 2 ? c - 4716 : c - 4715;
  const hourDecimal = f * 24;
  const hour = Math.floor(hourDecimal);
  const minuteDecimal = (hourDecimal - hour) * 60;
  const minute = Math.floor(minuteDecimal);
  const second = Math.round((minuteDecimal - minute) * 60);
  return { year, month, day, hour, minute, second };
}
function createChartDates(birthJD, targetJD, progressionType) {
  const progressedJD = getProgressedJD(birthJD, targetJD, progressionType);
  const daysFromBirth = progressedJD - birthJD;
  const ageInYears = calculateAge(birthJD, targetJD);
  return {
    natalJD: birthJD,
    natalDate: jdToProgressedDate2(birthJD),
    targetJD,
    targetDate: jdToProgressedDate2(targetJD),
    progressedJD,
    progressedDate: jdToProgressedDate2(progressedJD),
    daysFromBirth,
    ageInYears
  };
}
function createSolarArcPositions(planets, solarArc) {
  return planets.map((planet) => ({
    ...planet,
    longitude: applySolarArc(planet.natalLongitude, solarArc)
  }));
}
function createSignChanges(planets) {
  const SIGN_NAMES2 = [
    "Aries",
    "Taurus",
    "Gemini",
    "Cancer",
    "Leo",
    "Virgo",
    "Libra",
    "Scorpio",
    "Sagittarius",
    "Capricorn",
    "Aquarius",
    "Pisces"
  ];
  return planets.filter((p) => p.hasChangedSign).map((p) => {
    const natalSignIndex = Math.floor(p.natalLongitude / 30);
    return {
      body: p.name,
      bodyEnum: p.body,
      fromSign: SIGN_NAMES2[natalSignIndex],
      toSign: p.signName,
      approximateAge: p.arcFromNatal
      // Rough approximation: 1° ≈ 1 year
    };
  });
}
function createRetrogradeChanges(planets) {
  return planets.filter((p) => p.retrogradeChanged).map((p) => ({
    body: p.name,
    bodyEnum: p.body,
    direction: p.isRetrograde ? "turned-retrograde" : "turned-direct",
    approximateAge: p.arcFromNatal,
    longitude: p.longitude
  }));
}
function createProgressedMoonInfo(moonReport) {
  const currentTransit = moonReport.signTransits.find(
    (t) => t.signName === moonReport.current.signName
  );
  const currentIdx = moonReport.signTransits.findIndex(
    (t) => t.signName === moonReport.current.signName
  );
  return {
    sign: moonReport.current.signName,
    monthsInSign: currentTransit ? moonReport.phase.phaseAngle / 360 * currentTransit.durationYears * 12 : 0,
    monthsUntilNextSign: (moonReport.ageAtNextSignChange - moonReport.zodiacCyclesCompleted) * 12,
    lastSignChange: currentIdx > 0 ? {
      fromSign: moonReport.signTransits[currentIdx - 1].signName,
      toSign: moonReport.current.signName,
      age: currentTransit?.entryAge ?? 0
    } : null,
    nextSignChange: currentIdx < moonReport.signTransits.length - 1 ? {
      fromSign: moonReport.current.signName,
      toSign: moonReport.signTransits[currentIdx + 1]?.signName ?? "",
      age: moonReport.ageAtNextSignChange
    } : null
  };
}
function calculateProgression(birth, target, config) {
  const mergedConfig = {
    type: config?.type ?? DEFAULT_PROGRESSION_CONFIG.type ?? "secondary",
    angleMethod: config?.angleMethod ?? DEFAULT_PROGRESSION_CONFIG.angleMethod ?? "solar-arc",
    bodies: config?.bodies ?? DEFAULT_PROGRESSION_CONFIG.bodies ?? [],
    includeProgressedAspects: config?.includeProgressedAspects ?? DEFAULT_PROGRESSION_CONFIG.includeProgressedAspects ?? false,
    includeNatalAspects: config?.includeNatalAspects ?? DEFAULT_PROGRESSION_CONFIG.includeNatalAspects ?? true,
    aspectTypes: config?.aspectTypes ?? DEFAULT_PROGRESSION_CONFIG.aspectTypes ?? [],
    orbs: config?.orbs ?? DEFAULT_PROGRESSION_CONFIG.orbs ?? {},
    includeSolarArc: config?.includeSolarArc ?? DEFAULT_PROGRESSION_CONFIG.includeSolarArc ?? true,
    minimumStrength: config?.minimumStrength ?? DEFAULT_PROGRESSION_CONFIG.minimumStrength ?? 0,
    exactThreshold: config?.exactThreshold ?? DEFAULT_PROGRESSION_CONFIG.exactThreshold ?? 0.1
  };
  const birthJD = birthToJD(birth);
  const targetJD = targetToJD(target);
  const dates = createChartDates(birthJD, targetJD, mergedConfig.type);
  const solarArc = calculateSolarArc(birthJD, targetJD);
  const planets = getAllProgressedPositions(birthJD, targetJD, mergedConfig.type);
  const solarArcPositions = mergedConfig.includeSolarArc ? createSolarArcPositions(planets, solarArc) : [];
  const anglesResult = calculateProgressedAngles(
    birth,
    target,
    mergedConfig.angleMethod,
    mergedConfig.type
  );
  const angles = {
    ascendant: anglesResult.ascendant,
    midheaven: anglesResult.midheaven,
    descendant: anglesResult.descendant,
    imumCoeli: anglesResult.imumCoeli
  };
  const aspectResult = detectProgressedAspects(birthJD, targetJD, mergedConfig.type, {
    aspectTypes: mergedConfig.aspectTypes,
    orbs: mergedConfig.orbs,
    includeProgressedToProgressed: mergedConfig.includeProgressedAspects,
    minimumStrength: mergedConfig.minimumStrength,
    exactThreshold: mergedConfig.exactThreshold
  });
  const moonReport = getProgressedMoonReport(birth, target);
  const summary = generateSummary(planets, aspectResult, solarArc, moonReport);
  return {
    dates,
    planets,
    angles,
    solarArc,
    solarArcPositions,
    aspectsToNatal: aspectResult.aspects.filter((a) => !a.natalBody.startsWith("P.")),
    aspectsProgressed: aspectResult.aspects.filter((a) => a.natalBody.startsWith("P.")),
    summary,
    config: mergedConfig
  };
}
function generateSummary(planets, aspectResult, solarArc, moonReport) {
  const signChanges = createSignChanges(planets);
  const retrogradeChanges = createRetrogradeChanges(planets);
  const approachingAspects = aspectResult.applyingAspects.filter((a) => a.deviation <= 1);
  const mostSignificant = getStrongestAspect3(aspectResult.aspects);
  return {
    signChanges,
    retrogradeChanges,
    exactAspects: aspectResult.exactAspects,
    approachingAspects,
    progressedMoon: createProgressedMoonInfo(moonReport),
    mostSignificantAspect: mostSignificant ?? null,
    solarArc
  };
}
function getMoonProgressionReport(birth, target) {
  return getProgressedMoonReport(birth, target);
}
function getExactAspects(birth, target, progressionType = "secondary") {
  const birthJD = birthToJD(birth);
  const targetJD = targetToJD(target);
  const result = detectProgressedAspects(birthJD, targetJD, progressionType);
  return result.exactAspects;
}
function getSignChanges(birth, target, progressionType = "secondary") {
  const birthJD = birthToJD(birth);
  const targetJD = targetToJD(target);
  const bodies = getAllProgressedPositions(birthJD, targetJD, progressionType);
  return getBodiesWithSignChange(bodies);
}
function formatProgressedChart(result) {
  const lines = [
    "\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550",
    `  PROGRESSED CHART (${result.config.type.toUpperCase()})`,
    "\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550",
    "",
    `Age at Target: ${result.dates.ageInYears.toFixed(2)} years`,
    `Solar Arc: ${result.solarArc.toFixed(2)}\xB0`,
    "",
    "\u2500\u2500 PROGRESSED POSITIONS \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500"
  ];
  for (const body of result.planets) {
    const signChange = body.hasChangedSign ? " \u2605" : "";
    const retro = body.isRetrograde ? " (R)" : "";
    lines.push(
      `  ${body.name.padEnd(10)} ${body.formatted.padEnd(20)} Arc: ${body.arcFromNatal.toFixed(1)}\xB0${signChange}${retro}`
    );
  }
  lines.push("");
  lines.push("\u2500\u2500 PROGRESSED ANGLES \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500");
  lines.push(`  ASC: ${result.angles.ascendant.formatted}`);
  lines.push(`  MC:  ${result.angles.midheaven.formatted}`);
  if (result.angles.ascendant.hasChangedSign) {
    lines.push("  \u26A0 ASC has changed sign since birth");
  }
  if (result.angles.midheaven.hasChangedSign) {
    lines.push("  \u26A0 MC has changed sign since birth");
  }
  lines.push("");
  lines.push("\u2500\u2500 ASPECTS SUMMARY \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500");
  lines.push(`  To Natal: ${result.aspectsToNatal.length}`);
  lines.push(`  Exact: ${result.summary.exactAspects.length}`);
  lines.push(`  Approaching: ${result.summary.approachingAspects.length}`);
  if (result.summary.signChanges.length > 0) {
    lines.push("");
    lines.push(
      `  Bodies changed sign: ${result.summary.signChanges.map((s) => s.body).join(", ")}`
    );
  }
  if (result.summary.retrogradeChanges.length > 0) {
    lines.push(
      `  Retrograde changes: ${result.summary.retrogradeChanges.map((r) => r.body).join(", ")}`
    );
  }
  if (result.summary.mostSignificantAspect) {
    const aspect = result.summary.mostSignificantAspect;
    lines.push("");
    lines.push(
      `  Most Significant: ${aspect.progressedBody} ${aspect.symbol} ${aspect.natalBody} (${aspect.strength}%)`
    );
  }
  lines.push("");
  lines.push("\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550");
  return lines.join("\n");
}

// src/transits/index.ts
var transits_exports = {};
__export(transits_exports, {
  ALL_TRANSIT_ASPECTS: () => ALL_TRANSIT_ASPECTS,
  ANGLE_ORB_EXTENSION: () => ANGLE_ORB_EXTENSION,
  ASPECT_ANGLES: () => ASPECT_ANGLES3,
  ASPECT_SYMBOLS: () => ASPECT_SYMBOLS3,
  ASTRONOMICAL_EVENTS: () => ASTRONOMICAL_EVENTS,
  AVERAGE_DAILY_MOTION: () => AVERAGE_DAILY_MOTION,
  BODY_NAMES: () => BODY_NAMES3,
  DEFAULT_EXACT_THRESHOLD: () => DEFAULT_EXACT_THRESHOLD,
  DEFAULT_TRANSITING_BODIES: () => DEFAULT_TRANSITING_BODIES,
  DEFAULT_TRANSIT_CONFIG: () => DEFAULT_TRANSIT_CONFIG,
  DEFAULT_TRANSIT_ORBS: () => DEFAULT_TRANSIT_ORBS,
  EXACT_TIME_TOLERANCE: () => EXACT_TIME_TOLERANCE,
  FAST_PLANETS: () => FAST_PLANETS,
  FAST_PLANET_SEARCH_STEP: () => FAST_PLANET_SEARCH_STEP,
  HISTORICAL_TRANSIT_EVENTS: () => HISTORICAL_TRANSIT_EVENTS,
  LUMINARIES: () => LUMINARIES2,
  LUMINARY_ORB_EXTENSION: () => LUMINARY_ORB_EXTENSION,
  MAJOR_TRANSIT_ASPECTS: () => MAJOR_TRANSIT_ASPECTS,
  MAX_BINARY_SEARCH_ITERATIONS: () => MAX_BINARY_SEARCH_ITERATIONS,
  MOON_SEARCH_STEP: () => MOON_SEARCH_STEP,
  OUTER_PLANET_ORB_EXTENSION: () => OUTER_PLANET_ORB_EXTENSION,
  REFERENCE_RETROGRADE_PERIODS: () => REFERENCE_RETROGRADE_PERIODS,
  REFERENCE_STATION_POINTS: () => REFERENCE_STATION_POINTS,
  RETROGRADE_PLANETS: () => RETROGRADE_PLANETS,
  SLOW_PLANETS: () => SLOW_PLANETS,
  SLOW_PLANET_SEARCH_STEP: () => SLOW_PLANET_SEARCH_STEP,
  STATIONARY_SPEED_THRESHOLD: () => STATIONARY_SPEED_THRESHOLD,
  TRANSITING_BODIES: () => TRANSITING_BODIES,
  TYPICAL_RETROGRADE_DURATIONS: () => TYPICAL_RETROGRADE_DURATIONS,
  TYPICAL_TRANSIT_DURATION_DAYS: () => TYPICAL_TRANSIT_DURATION_DAYS,
  TransitCalculationError: () => TransitCalculationError,
  TransitSearchError: () => TransitSearchError,
  angularSeparation: () => angularSeparation3,
  calculateAllIngresses: () => calculateAllIngresses,
  calculateAllIngressesForBodies: () => calculateAllIngressesForBodies,
  calculateSignedDeviation: () => calculateSignedDeviation,
  calculateTransitStrength: () => calculateTransitStrength,
  calculateTransits: () => calculateTransits,
  canRetrograde: () => canRetrograde,
  checkIngressInWindow: () => checkIngressInWindow,
  classifyMotion: () => classifyMotion,
  detectAllTransits: () => detectAllTransits,
  detectHouseIngress: () => detectHouseIngress,
  detectTransit: () => detectTransit,
  estimateNextAspect: () => estimateNextAspect,
  estimatePassCount: () => estimatePassCount,
  filterByAspectType: () => filterByAspectType,
  filterByBodySpeed: () => filterByBodySpeed,
  filterByDuration: () => filterByDuration,
  filterByPhase: () => filterByPhase,
  filterByStrength: () => filterByStrength,
  filterMultiplePasses: () => filterMultiplePasses,
  filterRetrogrades: () => filterRetrogrades,
  findAllExactTimes: () => findAllExactTimes,
  findAllTransits: () => findAllTransits,
  findExactTransitTime: () => findExactTransitTime,
  findIngressToHouse: () => findIngressToHouse,
  findNextIngress: () => findNextIngress,
  findNextStation: () => findNextStation,
  findOrbEntry: () => findOrbEntry,
  findOrbExit: () => findOrbExit,
  findRetrogradePeriods: () => findRetrogradePeriods,
  findStationPoints: () => findStationPoints,
  findTransitPasses: () => findTransitPasses,
  findTransitTiming: () => findTransitTiming,
  formatHouseIngress: () => formatHouseIngress,
  formatRetrogradePeriod: () => formatRetrogradePeriod,
  formatStationPoint: () => formatStationPoint,
  formatTransit: () => formatTransit,
  formatTransitTiming: () => formatTransitTiming,
  formatTransitTimingDetail: () => formatTransitTimingDetail,
  generateSearchSummary: () => generateSearchSummary,
  getActiveTransits: () => getActiveTransits,
  getAllRetrogradePeriods: () => getAllRetrogradePeriods,
  getApplyingTransits: () => getApplyingTransits,
  getBodyHouse: () => getBodyHouse,
  getBodyHouses: () => getBodyHouses,
  getCurrentRetrogradePeriod: () => getCurrentRetrogradePeriod,
  getEffectiveOrb: () => getEffectiveOrb,
  getMostSignificantTransits: () => getMostSignificantTransits,
  getNextTransit: () => getNextTransit,
  getRetrogradeShadow: () => getRetrogradeShadow,
  getSearchStepForBody: () => getSearchStepForBody,
  getSeparatingTransits: () => getSeparatingTransits,
  getSignIndex: () => getSignIndex2,
  getStrongestTransit: () => getStrongestTransit,
  getTransitPhase: () => getTransitPhase,
  getTransitingBodies: () => getTransitingBodies,
  getTransitsForMonth: () => getTransitsForMonth,
  getTransitsForYear: () => getTransitsForYear,
  getTransitsFromBody: () => getTransitsFromBody,
  getTransitsToPoint: () => getTransitsToPoint,
  getUpcomingTransits: () => getUpcomingTransits,
  groupByNatalPoint: () => groupByNatalPoint,
  groupByTransitingBody: () => groupByTransitingBody,
  groupIngressesByBody: () => groupIngressesByBody,
  groupIngressesByHouse: () => groupIngressesByHouse,
  groupTransitsByAspect: () => groupTransitsByAspect,
  groupTransitsByBody: () => groupTransitsByBody,
  groupTransitsByMonth: () => groupTransitsByMonth,
  groupTransitsByNatalPoint: () => groupTransitsByNatalPoint,
  hasCrossingInWindow: () => hasCrossingInWindow,
  isOutOfSign: () => isOutOfSign2,
  isRetrograde: () => isRetrograde4,
  jdToTransitDate: () => jdToTransitDate,
  normalizeAngle: () => normalizeAngle11,
  searchTransits: () => searchTransits,
  searchTransitsForBody: () => searchTransitsForBody,
  searchTransitsToPoint: () => searchTransitsToPoint,
  signedAngularDifference: () => signedAngularDifference,
  summarizeTransits: () => summarizeTransits
});

// src/transits/types.ts
var TransitCalculationError = class extends Error {
  constructor(message, step, details) {
    super(message);
    this.step = step;
    this.details = details;
    this.name = "TransitCalculationError";
  }
};
var TransitSearchError = class extends Error {
  constructor(message, field, value) {
    super(message);
    this.field = field;
    this.value = value;
    this.name = "TransitSearchError";
  }
};

// src/transits/constants.ts
var DEFAULT_TRANSIT_ORBS = {
  // Major aspects (Ptolemaic)
  ["conjunction" /* Conjunction */]: 3,
  ["opposition" /* Opposition */]: 3,
  ["square" /* Square */]: 2,
  ["trine" /* Trine */]: 2,
  ["sextile" /* Sextile */]: 1.5,
  // Minor aspects
  ["quincunx" /* Quincunx */]: 1,
  ["semi-sextile" /* SemiSextile */]: 1,
  ["semi-square" /* SemiSquare */]: 1,
  ["sesquiquadrate" /* Sesquiquadrate */]: 1,
  ["quintile" /* Quintile */]: 0.5,
  ["biquintile" /* Biquintile */]: 0.5,
  // Kepler aspects (very tight orbs for transits)
  ["septile" /* Septile */]: 0.5,
  ["novile" /* Novile */]: 0.5,
  ["decile" /* Decile */]: 0.5
};
var MAJOR_TRANSIT_ASPECTS = [
  "conjunction" /* Conjunction */,
  "sextile" /* Sextile */,
  "square" /* Square */,
  "trine" /* Trine */,
  "opposition" /* Opposition */
];
var ALL_TRANSIT_ASPECTS = Object.values(AspectType);
var LUMINARY_ORB_EXTENSION = 1;
var ANGLE_ORB_EXTENSION = 1;
var OUTER_PLANET_ORB_EXTENSION = 0.5;
var TRANSITING_BODIES = [
  "Sun" /* Sun */,
  "Moon" /* Moon */,
  "Mercury" /* Mercury */,
  "Venus" /* Venus */,
  "Mars" /* Mars */,
  "Jupiter" /* Jupiter */,
  "Saturn" /* Saturn */,
  "Uranus" /* Uranus */,
  "Neptune" /* Neptune */,
  "Pluto" /* Pluto */,
  "Chiron" /* Chiron */,
  "NorthNode" /* NorthNode */
];
var DEFAULT_TRANSITING_BODIES = [
  "Sun" /* Sun */,
  "Mercury" /* Mercury */,
  "Venus" /* Venus */,
  "Mars" /* Mars */,
  "Jupiter" /* Jupiter */,
  "Saturn" /* Saturn */,
  "Uranus" /* Uranus */,
  "Neptune" /* Neptune */,
  "Pluto" /* Pluto */
];
var FAST_PLANETS = [
  "Sun" /* Sun */,
  "Moon" /* Moon */,
  "Mercury" /* Mercury */,
  "Venus" /* Venus */,
  "Mars" /* Mars */
];
var SLOW_PLANETS = [
  "Jupiter" /* Jupiter */,
  "Saturn" /* Saturn */,
  "Uranus" /* Uranus */,
  "Neptune" /* Neptune */,
  "Pluto" /* Pluto */,
  "Chiron" /* Chiron */
];
var RETROGRADE_PLANETS = [
  "Mercury" /* Mercury */,
  "Venus" /* Venus */,
  "Mars" /* Mars */,
  "Jupiter" /* Jupiter */,
  "Saturn" /* Saturn */,
  "Uranus" /* Uranus */,
  "Neptune" /* Neptune */,
  "Pluto" /* Pluto */,
  "Chiron" /* Chiron */
];
var LUMINARIES2 = ["Sun" /* Sun */, "Moon" /* Moon */];
var AVERAGE_DAILY_MOTION = {
  ["Sun" /* Sun */]: 0.9856,
  ["Moon" /* Moon */]: 13.176,
  ["Mercury" /* Mercury */]: 1.383,
  ["Venus" /* Venus */]: 1.2,
  ["Mars" /* Mars */]: 0.524,
  ["Jupiter" /* Jupiter */]: 0.083,
  ["Saturn" /* Saturn */]: 0.034,
  ["Uranus" /* Uranus */]: 0.012,
  ["Neptune" /* Neptune */]: 6e-3,
  ["Pluto" /* Pluto */]: 4e-3,
  ["Chiron" /* Chiron */]: 0.02,
  ["NorthNode" /* NorthNode */]: -0.053,
  ["TrueNorthNode" /* TrueNorthNode */]: -0.053,
  ["SouthNode" /* SouthNode */]: -0.053,
  ["TrueSouthNode" /* TrueSouthNode */]: -0.053,
  ["Lilith" /* Lilith */]: 0.111,
  ["TrueLilith" /* TrueLilith */]: 0.111,
  ["Ceres" /* Ceres */]: 0.21,
  ["Pallas" /* Pallas */]: 0.23,
  ["Juno" /* Juno */]: 0.23,
  ["Vesta" /* Vesta */]: 0.26
};
var TYPICAL_TRANSIT_DURATION_DAYS = {
  ["Sun" /* Sun */]: 6,
  ["Moon" /* Moon */]: 0.5,
  // ~12 hours
  ["Mercury" /* Mercury */]: 4,
  // Can be 3 weeks if retrograde
  ["Venus" /* Venus */]: 5,
  // Can be 6 weeks if retrograde
  ["Mars" /* Mars */]: 11,
  // Can be 2 months if retrograde
  ["Jupiter" /* Jupiter */]: 72,
  // ~2.5 months, often 3 passes
  ["Saturn" /* Saturn */]: 176,
  // ~6 months, usually 3 passes
  ["Uranus" /* Uranus */]: 500,
  // ~16 months, usually 3 passes
  ["Neptune" /* Neptune */]: 1e3,
  // ~2.7 years, usually 3-5 passes
  ["Pluto" /* Pluto */]: 1500,
  // ~4 years, usually 3-5 passes
  ["Chiron" /* Chiron */]: 300,
  // ~10 months
  ["NorthNode" /* NorthNode */]: 113,
  // ~4 months
  ["TrueNorthNode" /* TrueNorthNode */]: 113,
  ["SouthNode" /* SouthNode */]: 113,
  ["TrueSouthNode" /* TrueSouthNode */]: 113,
  ["Lilith" /* Lilith */]: 54,
  ["TrueLilith" /* TrueLilith */]: 54,
  ["Ceres" /* Ceres */]: 29,
  ["Pallas" /* Pallas */]: 26,
  ["Juno" /* Juno */]: 26,
  ["Vesta" /* Vesta */]: 23
};
var FAST_PLANET_SEARCH_STEP = 1;
var SLOW_PLANET_SEARCH_STEP = 3;
var MOON_SEARCH_STEP = 0.25;
var MAX_BINARY_SEARCH_ITERATIONS = 50;
var EXACT_TIME_TOLERANCE = 1e-4;
var DEFAULT_EXACT_THRESHOLD = 0.1;
var STATIONARY_SPEED_THRESHOLD = 1e-3;
var BODY_NAMES3 = {
  ["Sun" /* Sun */]: "Sun",
  ["Moon" /* Moon */]: "Moon",
  ["Mercury" /* Mercury */]: "Mercury",
  ["Venus" /* Venus */]: "Venus",
  ["Mars" /* Mars */]: "Mars",
  ["Jupiter" /* Jupiter */]: "Jupiter",
  ["Saturn" /* Saturn */]: "Saturn",
  ["Uranus" /* Uranus */]: "Uranus",
  ["Neptune" /* Neptune */]: "Neptune",
  ["Pluto" /* Pluto */]: "Pluto",
  ["Chiron" /* Chiron */]: "Chiron",
  ["NorthNode" /* NorthNode */]: "North Node",
  ["TrueNorthNode" /* TrueNorthNode */]: "True North Node",
  ["SouthNode" /* SouthNode */]: "South Node",
  ["TrueSouthNode" /* TrueSouthNode */]: "True South Node",
  ["Lilith" /* Lilith */]: "Lilith",
  ["TrueLilith" /* TrueLilith */]: "True Lilith",
  ["Ceres" /* Ceres */]: "Ceres",
  ["Pallas" /* Pallas */]: "Pallas",
  ["Juno" /* Juno */]: "Juno",
  ["Vesta" /* Vesta */]: "Vesta"
};
var ASPECT_SYMBOLS3 = {
  ["conjunction" /* Conjunction */]: "\u260C",
  ["sextile" /* Sextile */]: "\u26B9",
  ["square" /* Square */]: "\u25A1",
  ["trine" /* Trine */]: "\u25B3",
  ["opposition" /* Opposition */]: "\u260D",
  ["semi-sextile" /* SemiSextile */]: "\u26BA",
  ["semi-square" /* SemiSquare */]: "\u2220",
  ["quintile" /* Quintile */]: "Q",
  ["sesquiquadrate" /* Sesquiquadrate */]: "\u26BC",
  ["biquintile" /* Biquintile */]: "bQ",
  ["quincunx" /* Quincunx */]: "\u26BB",
  ["septile" /* Septile */]: "S",
  ["novile" /* Novile */]: "N",
  ["decile" /* Decile */]: "D"
};
var ASPECT_ANGLES3 = {
  ["conjunction" /* Conjunction */]: 0,
  ["semi-sextile" /* SemiSextile */]: 30,
  ["decile" /* Decile */]: 36,
  ["novile" /* Novile */]: 40,
  ["semi-square" /* SemiSquare */]: 45,
  ["septile" /* Septile */]: 51.4286,
  // 360/7
  ["sextile" /* Sextile */]: 60,
  ["quintile" /* Quintile */]: 72,
  ["square" /* Square */]: 90,
  ["trine" /* Trine */]: 120,
  ["sesquiquadrate" /* Sesquiquadrate */]: 135,
  ["biquintile" /* Biquintile */]: 144,
  ["quincunx" /* Quincunx */]: 150,
  ["opposition" /* Opposition */]: 180
};
var DEFAULT_TRANSIT_CONFIG = {
  aspectTypes: MAJOR_TRANSIT_ASPECTS,
  transitingBodies: DEFAULT_TRANSITING_BODIES,
  includeHouseIngress: false,
  calculateExactTimes: false,
  minimumStrength: 0,
  includeOutOfSign: true,
  exactThreshold: DEFAULT_EXACT_THRESHOLD
};

// src/transits/transit-detection.ts
function angularSeparation3(long1, long2) {
  let diff = Math.abs(long1 - long2);
  if (diff > 180) {
    diff = 360 - diff;
  }
  return diff;
}
function signedAngularDifference(long1, long2) {
  let diff = long2 - long1;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return diff;
}
function normalizeAngle11(angle) {
  let normalized = angle % 360;
  if (normalized < 0) normalized += 360;
  return normalized;
}
function getSignIndex2(longitude) {
  return Math.floor(normalizeAngle11(longitude) / 30);
}
function getEffectiveOrb(aspectType, natalPoint, transitBodyEnum, config) {
  let orb = config?.orbs?.[aspectType] ?? DEFAULT_TRANSIT_ORBS[aspectType] ?? 2;
  if (LUMINARIES2.includes(transitBodyEnum)) {
    orb += LUMINARY_ORB_EXTENSION;
  }
  if (natalPoint.type === "luminary") {
    orb += LUMINARY_ORB_EXTENSION;
  }
  if (natalPoint.type === "angle") {
    orb += ANGLE_ORB_EXTENSION;
  }
  if (SLOW_PLANETS.includes(transitBodyEnum)) {
    orb += OUTER_PLANET_ORB_EXTENSION;
  }
  return orb;
}
function getTransitPhase(transitLongitude, natalLongitude, transitSpeed, aspectAngle, deviation, exactThreshold = DEFAULT_EXACT_THRESHOLD) {
  if (deviation <= exactThreshold) {
    return "exact";
  }
  if (Math.abs(transitSpeed) < STATIONARY_SPEED_THRESHOLD) {
    return "exact";
  }
  const separation = angularSeparation3(transitLongitude, natalLongitude);
  const isPastExact = separation > aspectAngle;
  if (transitSpeed > 0) {
    const signedDiff = signedAngularDifference(transitLongitude, natalLongitude);
    if (aspectAngle === 0) {
      return signedDiff > 0 ? "applying" : "separating";
    }
    if (aspectAngle === 180) {
      return separation < 180 === isPastExact ? "separating" : "applying";
    }
    return isPastExact ? "separating" : "applying";
  }
  if (aspectAngle === 0) {
    const signedDiff = signedAngularDifference(transitLongitude, natalLongitude);
    return signedDiff < 0 ? "applying" : "separating";
  }
  return isPastExact ? "applying" : "separating";
}
function calculateTransitStrength(deviation, orb) {
  if (orb <= 0) return 0;
  const strength = (1 - deviation / orb) * 100;
  return Math.max(0, Math.min(100, strength));
}
function isOutOfSign2(transitLongitude, natalLongitude, aspectAngle) {
  const transitSign = getSignIndex2(transitLongitude);
  const natalSign = getSignIndex2(natalLongitude);
  const expectedSignSeparation = Math.round(aspectAngle / 30) % 12;
  let actualSignSeparation = Math.abs(transitSign - natalSign);
  if (actualSignSeparation > 6) {
    actualSignSeparation = 12 - actualSignSeparation;
  }
  const complementSeparation = (12 - expectedSignSeparation) % 12;
  return actualSignSeparation !== expectedSignSeparation && actualSignSeparation !== complementSeparation;
}
function detectTransit(natalPoint, transitingBody, config) {
  const aspectTypes = config?.aspectTypes ?? MAJOR_TRANSIT_ASPECTS;
  const includeOutOfSign = config?.includeOutOfSign ?? true;
  const minimumStrength = config?.minimumStrength ?? 0;
  const exactThreshold = config?.exactThreshold ?? DEFAULT_EXACT_THRESHOLD;
  for (const aspectType of aspectTypes) {
    const aspectAngle = ASPECT_ANGLES3[aspectType];
    const orb = getEffectiveOrb(aspectType, natalPoint, transitingBody.body, config);
    const separation = angularSeparation3(transitingBody.longitude, natalPoint.longitude);
    const deviation = Math.abs(separation - aspectAngle);
    if (deviation <= orb) {
      const strength = calculateTransitStrength(deviation, orb);
      if (strength < minimumStrength) {
        continue;
      }
      const outOfSign = isOutOfSign2(transitingBody.longitude, natalPoint.longitude, aspectAngle);
      if (outOfSign && !includeOutOfSign) {
        continue;
      }
      const phase = getTransitPhase(
        transitingBody.longitude,
        natalPoint.longitude,
        transitingBody.longitudeSpeed,
        aspectAngle,
        deviation,
        exactThreshold
      );
      return {
        transitingBody: transitingBody.name,
        transitingBodyEnum: transitingBody.body,
        natalPoint: natalPoint.name,
        aspectType,
        symbol: ASPECT_SYMBOLS3[aspectType],
        aspectAngle,
        separation,
        deviation,
        orb,
        phase,
        strength,
        isRetrograde: transitingBody.isRetrograde,
        isOutOfSign: outOfSign
      };
    }
  }
  return null;
}
function findAllTransits(natalPoint, transitingBody, config) {
  const transits = [];
  const aspectTypes = config?.aspectTypes ?? MAJOR_TRANSIT_ASPECTS;
  const includeOutOfSign = config?.includeOutOfSign ?? true;
  const minimumStrength = config?.minimumStrength ?? 0;
  const exactThreshold = config?.exactThreshold ?? DEFAULT_EXACT_THRESHOLD;
  for (const aspectType of aspectTypes) {
    const aspectAngle = ASPECT_ANGLES3[aspectType];
    const orb = getEffectiveOrb(aspectType, natalPoint, transitingBody.body, config);
    const separation = angularSeparation3(transitingBody.longitude, natalPoint.longitude);
    const deviation = Math.abs(separation - aspectAngle);
    if (deviation <= orb) {
      const strength = calculateTransitStrength(deviation, orb);
      if (strength < minimumStrength) {
        continue;
      }
      const outOfSign = isOutOfSign2(transitingBody.longitude, natalPoint.longitude, aspectAngle);
      if (outOfSign && !includeOutOfSign) {
        continue;
      }
      const phase = getTransitPhase(
        transitingBody.longitude,
        natalPoint.longitude,
        transitingBody.longitudeSpeed,
        aspectAngle,
        deviation,
        exactThreshold
      );
      transits.push({
        transitingBody: transitingBody.name,
        transitingBodyEnum: transitingBody.body,
        natalPoint: natalPoint.name,
        aspectType,
        symbol: ASPECT_SYMBOLS3[aspectType],
        aspectAngle,
        separation,
        deviation,
        orb,
        phase,
        strength,
        isRetrograde: transitingBody.isRetrograde,
        isOutOfSign: outOfSign
      });
    }
  }
  return transits;
}
function getTransitingBodies(jd, bodies = DEFAULT_TRANSIT_CONFIG.transitingBodies) {
  return bodies.map((body) => {
    const position = getPosition(body, jd);
    return {
      name: BODY_NAMES3[body],
      body,
      longitude: position.longitude,
      longitudeSpeed: position.longitudeSpeed,
      isRetrograde: position.isRetrograde,
      signIndex: getSignIndex2(position.longitude)
    };
  });
}
function detectAllTransits(natalPoints, transitingBodies, config) {
  const transits = [];
  for (const natalPoint of natalPoints) {
    for (const transitingBody of transitingBodies) {
      const transit = detectTransit(natalPoint, transitingBody, config);
      if (transit) {
        transits.push(transit);
      }
    }
  }
  transits.sort((a, b) => b.strength - a.strength);
  return transits;
}
function groupByNatalPoint(transits) {
  const grouped = {};
  for (const transit of transits) {
    if (!grouped[transit.natalPoint]) {
      grouped[transit.natalPoint] = [];
    }
    grouped[transit.natalPoint].push(transit);
  }
  return grouped;
}
function groupByTransitingBody(transits) {
  const grouped = {};
  for (const transit of transits) {
    if (!grouped[transit.transitingBody]) {
      grouped[transit.transitingBody] = [];
    }
    grouped[transit.transitingBody].push(transit);
  }
  return grouped;
}
function summarizeTransits(transits) {
  const byAspect = {};
  let applying = 0;
  let separating = 0;
  let exact = 0;
  let retrograde = 0;
  let strongest;
  for (const transit of transits) {
    byAspect[transit.aspectType] = (byAspect[transit.aspectType] ?? 0) + 1;
    if (transit.phase === "applying") applying++;
    else if (transit.phase === "separating") separating++;
    else exact++;
    if (transit.isRetrograde) retrograde++;
    if (!strongest || transit.strength > strongest.strength) {
      strongest = transit;
    }
  }
  return {
    total: transits.length,
    byAspect,
    applying,
    separating,
    exact,
    retrograde,
    strongest
  };
}
function jdToTransitDate(jd) {
  const Z = Math.floor(jd + 0.5);
  const F = jd + 0.5 - Z;
  let A;
  if (Z < 2299161) {
    A = Z;
  } else {
    const alpha = Math.floor((Z - 186721625e-2) / 36524.25);
    A = Z + 1 + alpha - Math.floor(alpha / 4);
  }
  const B = A + 1524;
  const C = Math.floor((B - 122.1) / 365.25);
  const D = Math.floor(365.25 * C);
  const E = Math.floor((B - D) / 30.6001);
  const day = B - D - Math.floor(30.6001 * E);
  const month = E < 14 ? E - 1 : E - 13;
  const year = month > 2 ? C - 4716 : C - 4715;
  const totalHours = F * 24;
  const hour = Math.floor(totalHours);
  const totalMinutes = (totalHours - hour) * 60;
  const minute = Math.floor(totalMinutes);
  const second = Math.floor((totalMinutes - minute) * 60);
  return { year, month, day, hour, minute, second };
}
function calculateTransits(natalPoints, jd, config) {
  const fullConfig = {
    aspectTypes: config?.aspectTypes ?? [...MAJOR_TRANSIT_ASPECTS],
    orbs: config?.orbs ?? {},
    transitingBodies: config?.transitingBodies ?? [...DEFAULT_TRANSIT_CONFIG.transitingBodies],
    includeHouseIngress: config?.includeHouseIngress ?? false,
    calculateExactTimes: config?.calculateExactTimes ?? false,
    minimumStrength: config?.minimumStrength ?? 0,
    includeOutOfSign: config?.includeOutOfSign ?? true,
    exactThreshold: config?.exactThreshold ?? DEFAULT_EXACT_THRESHOLD
  };
  const transitingBodies = getTransitingBodies(jd, fullConfig.transitingBodies);
  const transits = detectAllTransits(natalPoints, transitingBodies, fullConfig);
  const byNatalPoint = groupByNatalPoint(transits);
  const byTransitingBody = groupByTransitingBody(transits);
  const summary = summarizeTransits(transits);
  return {
    julianDate: jd,
    date: jdToTransitDate(jd),
    transits,
    byNatalPoint,
    byTransitingBody,
    summary,
    config: fullConfig
  };
}
function formatTransit(transit) {
  const retro = transit.isRetrograde ? " \u211E" : "";
  const oos = transit.isOutOfSign ? " [OOS]" : "";
  return `${transit.transitingBody}${retro} ${transit.symbol} ${transit.natalPoint} (${transit.deviation.toFixed(2)}\xB0, ${transit.strength.toFixed(0)}%, ${transit.phase})${oos}`;
}
function getTransitsToPoint(result, natalPointName) {
  return result.byNatalPoint[natalPointName] ?? [];
}
function getTransitsFromBody(result, bodyName) {
  return result.byTransitingBody[bodyName] ?? [];
}
function filterByAspectType(transits, aspectType) {
  return transits.filter((t) => t.aspectType === aspectType);
}
function filterByPhase(transits, phase) {
  return transits.filter((t) => t.phase === phase);
}
function getApplyingTransits(transits) {
  return filterByPhase(transits, "applying");
}
function getSeparatingTransits(transits) {
  return filterByPhase(transits, "separating");
}
function getStrongestTransit(transits) {
  if (transits.length === 0) return void 0;
  return transits.reduce((strongest, t) => t.strength > strongest.strength ? t : strongest);
}

// src/transits/transit-timing.ts
function calculateSignedDeviation(transitLongitude, natalLongitude, aspectAngle) {
  const signedDiff = signedAngularDifference(natalLongitude, transitLongitude);
  let normalizedDiff = signedDiff;
  if (normalizedDiff < 0) normalizedDiff += 360;
  const separation = angularSeparation3(transitLongitude, natalLongitude);
  let deviation = separation - aspectAngle;
  if (aspectAngle !== 0 && aspectAngle !== 180) {
    if (normalizedDiff < aspectAngle || normalizedDiff > 360 - aspectAngle) {
      deviation = separation - aspectAngle;
    } else {
      const complementAspect = 360 - aspectAngle;
      if (Math.abs(normalizedDiff - complementAspect) < Math.abs(normalizedDiff - aspectAngle)) {
        deviation = separation - aspectAngle;
      }
    }
  }
  return deviation;
}
function hasCrossingInWindow(body, natalLongitude, aspectAngle, startJD, endJD) {
  const pos1 = getPosition(body, startJD);
  const pos2 = getPosition(body, endJD);
  const dev1 = calculateSignedDeviation(pos1.longitude, natalLongitude, aspectAngle);
  const dev2 = calculateSignedDeviation(pos2.longitude, natalLongitude, aspectAngle);
  return dev1 * dev2 < 0;
}
function findExactTransitTime(body, natalLongitude, aspectAngle, startJD, endJD, tolerance = EXACT_TIME_TOLERANCE) {
  const pos1 = getPosition(body, startJD);
  const pos2 = getPosition(body, endJD);
  const dev1 = calculateSignedDeviation(pos1.longitude, natalLongitude, aspectAngle);
  const dev2 = calculateSignedDeviation(pos2.longitude, natalLongitude, aspectAngle);
  if (Math.abs(dev1) < tolerance) {
    return startJD;
  }
  if (Math.abs(dev2) < tolerance) {
    return endJD;
  }
  if (dev1 * dev2 > 0) {
    return null;
  }
  let lo = startJD;
  let hi = endJD;
  let sepLo = dev1;
  for (let i = 0; i < MAX_BINARY_SEARCH_ITERATIONS; i++) {
    const midJD = (lo + hi) / 2;
    const posMid = getPosition(body, midJD);
    const devMid = calculateSignedDeviation(posMid.longitude, natalLongitude, aspectAngle);
    if (Math.abs(devMid) < tolerance) {
      return midJD;
    }
    if (sepLo * devMid < 0) {
      hi = midJD;
    } else {
      lo = midJD;
      sepLo = devMid;
    }
    if (hi - lo < 1e-5) {
      return midJD;
    }
  }
  return (lo + hi) / 2;
}
function findAllExactTimes(body, natalLongitude, aspectAngle, startJD, endJD, scanStep) {
  const exactTimes = [];
  const avgMotion = Math.abs(AVERAGE_DAILY_MOTION[body] ?? 0.1);
  const step = scanStep ?? Math.max(1, Math.min(7, 0.5 / avgMotion));
  let windowStart = startJD;
  while (windowStart < endJD) {
    const windowEnd = Math.min(windowStart + step, endJD);
    const exactJD = findExactTransitTime(body, natalLongitude, aspectAngle, windowStart, windowEnd);
    if (exactJD !== null) {
      if (exactTimes.length === 0 || exactJD - exactTimes[exactTimes.length - 1] > 1) {
        exactTimes.push(exactJD);
      }
    }
    windowStart = windowEnd;
  }
  return exactTimes;
}
function findOrbEntry(body, natalLongitude, aspectAngle, orb, searchStartJD, searchEndJD) {
  const avgMotion = Math.abs(AVERAGE_DAILY_MOTION[body] ?? 0.1);
  const step = Math.max(0.5, 0.25 / avgMotion);
  let prevJD = searchStartJD;
  const prevPos = getPosition(body, prevJD);
  const prevSep = angularSeparation3(prevPos.longitude, natalLongitude);
  let prevDev = Math.abs(prevSep - aspectAngle);
  if (prevDev <= orb) {
    return searchStartJD;
  }
  let currentJD = prevJD + step;
  while (currentJD <= searchEndJD) {
    const currentPos = getPosition(body, currentJD);
    const currentSep = angularSeparation3(currentPos.longitude, natalLongitude);
    const currentDev = Math.abs(currentSep - aspectAngle);
    if (prevDev > orb && currentDev <= orb) {
      return findBoundaryTime(body, natalLongitude, aspectAngle, orb, prevJD, currentJD, "entry");
    }
    prevJD = currentJD;
    prevDev = currentDev;
    currentJD += step;
  }
  return null;
}
function findOrbExit(body, natalLongitude, aspectAngle, orb, searchStartJD, searchEndJD) {
  const avgMotion = Math.abs(AVERAGE_DAILY_MOTION[body] ?? 0.1);
  const step = Math.max(0.5, 0.25 / avgMotion);
  let prevJD = searchStartJD;
  const prevPos = getPosition(body, prevJD);
  const prevSep = angularSeparation3(prevPos.longitude, natalLongitude);
  let prevDev = Math.abs(prevSep - aspectAngle);
  let currentJD = prevJD + step;
  while (currentJD <= searchEndJD) {
    const currentPos = getPosition(body, currentJD);
    const currentSep = angularSeparation3(currentPos.longitude, natalLongitude);
    const currentDev = Math.abs(currentSep - aspectAngle);
    if (prevDev <= orb && currentDev > orb) {
      return findBoundaryTime(body, natalLongitude, aspectAngle, orb, prevJD, currentJD, "exit");
    }
    prevJD = currentJD;
    prevDev = currentDev;
    currentJD += step;
  }
  if (prevDev <= orb) {
    return searchEndJD;
  }
  return null;
}
function findBoundaryTime(body, natalLongitude, aspectAngle, orb, startJD, endJD, boundaryType) {
  const tolerance = 1e-3;
  let lo = startJD;
  let hi = endJD;
  for (let i = 0; i < 30; i++) {
    const midJD = (lo + hi) / 2;
    const pos = getPosition(body, midJD);
    const sep = angularSeparation3(pos.longitude, natalLongitude);
    const dev = Math.abs(sep - aspectAngle);
    const isWithinOrb2 = dev <= orb;
    if (boundaryType === "entry") {
      if (isWithinOrb2) {
        hi = midJD;
      } else {
        lo = midJD;
      }
    } else {
      if (isWithinOrb2) {
        lo = midJD;
      } else {
        hi = midJD;
      }
    }
    if (Math.abs(dev - orb) < tolerance) {
      return midJD;
    }
  }
  return (lo + hi) / 2;
}
function findTransitTiming(body, natalLongitude, aspectAngle, orb, searchStartJD, searchEndJD) {
  const exactJDs = findAllExactTimes(body, natalLongitude, aspectAngle, searchStartJD, searchEndJD);
  if (exactJDs.length === 0) {
    return null;
  }
  const avgMotion = Math.abs(AVERAGE_DAILY_MOTION[body] ?? 0.1);
  const estimatedBuffer = Math.ceil(orb / avgMotion * 2);
  const entrySearchStart = Math.max(searchStartJD, exactJDs[0] - estimatedBuffer);
  const enterOrbJD = findOrbEntry(body, natalLongitude, aspectAngle, orb, entrySearchStart, exactJDs[0]) ?? searchStartJD;
  const lastExactJD = exactJDs[exactJDs.length - 1];
  const exitSearchEnd = Math.min(searchEndJD, lastExactJD + estimatedBuffer);
  const leaveOrbJD = findOrbExit(body, natalLongitude, aspectAngle, orb, lastExactJD, exitSearchEnd) ?? searchEndJD;
  let hasRetrogradePass = false;
  const exactDates = [];
  for (const jd of exactJDs) {
    const pos = getPosition(body, jd);
    if (pos.isRetrograde) {
      hasRetrogradePass = true;
    }
    exactDates.push(jdToTransitDate(jd));
  }
  return {
    enterOrbJD,
    enterOrbDate: jdToTransitDate(enterOrbJD),
    exactJDs,
    exactDates,
    leaveOrbJD,
    leaveOrbDate: jdToTransitDate(leaveOrbJD),
    durationDays: leaveOrbJD - enterOrbJD,
    exactPasses: exactJDs.length,
    hasRetrogradePass
  };
}
function estimateNextAspect(body, natalLongitude, aspectAngle, fromJD) {
  const pos = getPosition(body, fromJD);
  const currentLong = pos.longitude;
  const speed = pos.longitudeSpeed;
  const target1 = normalizeAngle11(natalLongitude + aspectAngle);
  const target2 = normalizeAngle11(natalLongitude - aspectAngle);
  let targetLong;
  if (speed >= 0) {
    const dist1 = normalizeAngle11(target1 - currentLong);
    const dist2 = normalizeAngle11(target2 - currentLong);
    targetLong = dist1 < dist2 ? target1 : target2;
  } else {
    const dist1 = normalizeAngle11(currentLong - target1);
    const dist2 = normalizeAngle11(currentLong - target2);
    targetLong = dist1 < dist2 ? target1 : target2;
  }
  let distance;
  if (speed >= 0) {
    distance = normalizeAngle11(targetLong - currentLong);
  } else {
    distance = normalizeAngle11(currentLong - targetLong);
  }
  const avgMotion = Math.abs(AVERAGE_DAILY_MOTION[body] ?? speed);
  if (avgMotion < 1e-4) return null;
  const estimatedDays = distance / avgMotion;
  return fromJD + estimatedDays;
}
function getSearchStepForBody(body) {
  const avgMotion = Math.abs(AVERAGE_DAILY_MOTION[body] ?? 0.1);
  if (avgMotion > 5) return 0.25;
  if (avgMotion > 1) return 1;
  if (avgMotion > 0.1) return 3;
  if (avgMotion > 0.01) return 7;
  return 7;
}
function formatTransitTiming(timing) {
  const enter = timing.enterOrbDate;
  const exit = timing.leaveOrbDate;
  const lines = [
    `Enters orb: ${enter.year}-${String(enter.month).padStart(2, "0")}-${String(enter.day).padStart(2, "0")}`,
    `Exact passes: ${timing.exactPasses}`
  ];
  for (let i = 0; i < timing.exactDates.length; i++) {
    const d = timing.exactDates[i];
    lines.push(
      `  Pass ${i + 1}: ${d.year}-${String(d.month).padStart(2, "0")}-${String(d.day).padStart(2, "0")}`
    );
  }
  lines.push(
    `Leaves orb: ${exit.year}-${String(exit.month).padStart(2, "0")}-${String(exit.day).padStart(2, "0")}`,
    `Duration: ${timing.durationDays.toFixed(1)} days`
  );
  if (timing.hasRetrogradePass) {
    lines.push("(Includes retrograde period)");
  }
  return lines.join("\n");
}

// src/transits/house-ingress.ts
function detectHouseIngress(houseCusps, currentLongitude, previousLongitude, body, isRetrograde5) {
  if (houseCusps.length !== 12) {
    throw new Error("houseCusps must contain exactly 12 elements");
  }
  const currentHouse = getHousePosition(currentLongitude, houseCusps);
  const previousHouse = getHousePosition(previousLongitude, houseCusps);
  if (currentHouse === previousHouse) {
    return null;
  }
  let direction;
  const isForwardMove = currentHouse > previousHouse && currentHouse - previousHouse < 6 || currentHouse < previousHouse && previousHouse - currentHouse > 6;
  if (isRetrograde5) {
    direction = isForwardMove ? "exiting" : "entering";
  } else {
    direction = isForwardMove ? "entering" : "exiting";
  }
  return {
    body: BODY_NAMES3[body],
    bodyEnum: body,
    house: currentHouse,
    previousHouse,
    direction,
    isRetrograde: isRetrograde5
  };
}
function checkIngressInWindow(body, houseCusps, startJD, endJD) {
  const pos1 = getPosition(body, startJD);
  const pos2 = getPosition(body, endJD);
  const house1 = getHousePosition(pos1.longitude, houseCusps);
  const house2 = getHousePosition(pos2.longitude, houseCusps);
  if (house1 === house2) {
    return null;
  }
  const exactJD = findExactIngressTime(body, houseCusps, startJD, endJD, house2);
  const posAtIngress = getPosition(body, exactJD);
  return {
    body: BODY_NAMES3[body],
    bodyEnum: body,
    house: house2,
    previousHouse: house1,
    direction: posAtIngress.isRetrograde ? "exiting" : "entering",
    isRetrograde: posAtIngress.isRetrograde,
    ingressJD: exactJD,
    ingressDate: jdToTransitDate(exactJD)
  };
}
function findExactIngressTime(body, houseCusps, startJD, endJD, targetHouse) {
  const targetCusp = houseCusps[targetHouse - 1];
  let lo = startJD;
  let hi = endJD;
  for (let i = 0; i < MAX_BINARY_SEARCH_ITERATIONS; i++) {
    const midJD = (lo + hi) / 2;
    const posMid = getPosition(body, midJD);
    const houseMid = getHousePosition(posMid.longitude, houseCusps);
    if (houseMid === targetHouse) {
      hi = midJD;
    } else {
      lo = midJD;
    }
    if (hi - lo < 1e-4) {
      break;
    }
  }
  return refineCuspCrossing(body, targetCusp, lo, hi);
}
function refineCuspCrossing(body, cuspLongitude, lo, hi) {
  const tolerance = 1e-3;
  for (let i = 0; i < 20; i++) {
    const midJD = (lo + hi) / 2;
    const posMid = getPosition(body, midJD);
    const distToCusp = signedDistanceToCusp(posMid.longitude, cuspLongitude);
    if (Math.abs(distToCusp) < tolerance) {
      return midJD;
    }
    if (posMid.longitudeSpeed > 0) {
      if (distToCusp < 0) {
        lo = midJD;
      } else {
        hi = midJD;
      }
    } else {
      if (distToCusp > 0) {
        lo = midJD;
      } else {
        hi = midJD;
      }
    }
  }
  return (lo + hi) / 2;
}
function signedDistanceToCusp(longitude, cuspLongitude) {
  let diff = normalizeAngle11(longitude) - normalizeAngle11(cuspLongitude);
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return diff;
}
function findNextIngress(body, houseCusps, fromJD, maxSearchDays = 365) {
  const avgMotion = Math.abs(AVERAGE_DAILY_MOTION[body] ?? 0.1);
  const stepDays = Math.max(0.5, Math.min(7, 5 / avgMotion));
  let prevJD = fromJD;
  const prevPos = getPosition(body, prevJD);
  let prevHouse = getHousePosition(prevPos.longitude, houseCusps);
  let currentJD = prevJD + stepDays;
  const endJD = fromJD + maxSearchDays;
  while (currentJD <= endJD) {
    const currentPos = getPosition(body, currentJD);
    const currentHouse = getHousePosition(currentPos.longitude, houseCusps);
    if (currentHouse !== prevHouse) {
      const exactJD = findExactIngressTime(body, houseCusps, prevJD, currentJD, currentHouse);
      const posAtIngress = getPosition(body, exactJD);
      return {
        body: BODY_NAMES3[body],
        bodyEnum: body,
        house: currentHouse,
        previousHouse: prevHouse,
        direction: posAtIngress.isRetrograde ? "exiting" : "entering",
        isRetrograde: posAtIngress.isRetrograde,
        ingressJD: exactJD,
        ingressDate: jdToTransitDate(exactJD)
      };
    }
    prevJD = currentJD;
    prevHouse = currentHouse;
    currentJD += stepDays;
  }
  return null;
}
function findIngressToHouse(body, houseCusps, targetHouse, fromJD, maxSearchDays = 365 * 2) {
  const avgMotion = Math.abs(AVERAGE_DAILY_MOTION[body] ?? 0.1);
  const stepDays = Math.max(1, Math.min(14, 10 / avgMotion));
  let prevJD = fromJD;
  const prevPos = getPosition(body, prevJD);
  let prevHouse = getHousePosition(prevPos.longitude, houseCusps);
  let currentJD = prevJD + stepDays;
  const endJD = fromJD + maxSearchDays;
  while (currentJD <= endJD) {
    const currentPos = getPosition(body, currentJD);
    const currentHouse = getHousePosition(currentPos.longitude, houseCusps);
    if (currentHouse === targetHouse && prevHouse !== targetHouse) {
      const exactJD = findExactIngressTime(body, houseCusps, prevJD, currentJD, targetHouse);
      const posAtIngress = getPosition(body, exactJD);
      return {
        body: BODY_NAMES3[body],
        bodyEnum: body,
        house: targetHouse,
        previousHouse: prevHouse,
        direction: posAtIngress.isRetrograde ? "exiting" : "entering",
        isRetrograde: posAtIngress.isRetrograde,
        ingressJD: exactJD,
        ingressDate: jdToTransitDate(exactJD)
      };
    }
    prevJD = currentJD;
    prevHouse = currentHouse;
    currentJD += stepDays;
  }
  return null;
}
function calculateAllIngresses(body, houseCusps, startJD, endJD) {
  const ingresses = [];
  const avgMotion = Math.abs(AVERAGE_DAILY_MOTION[body] ?? 0.1);
  const stepDays = Math.max(0.25, Math.min(7, 3 / avgMotion));
  let prevJD = startJD;
  const prevPos = getPosition(body, prevJD);
  let prevHouse = getHousePosition(prevPos.longitude, houseCusps);
  let currentJD = prevJD + stepDays;
  while (currentJD <= endJD) {
    const currentPos = getPosition(body, currentJD);
    const currentHouse = getHousePosition(currentPos.longitude, houseCusps);
    if (currentHouse !== prevHouse) {
      const exactJD = findExactIngressTime(body, houseCusps, prevJD, currentJD, currentHouse);
      const posAtIngress = getPosition(body, exactJD);
      ingresses.push({
        body: BODY_NAMES3[body],
        bodyEnum: body,
        house: currentHouse,
        previousHouse: prevHouse,
        direction: posAtIngress.isRetrograde ? "exiting" : "entering",
        isRetrograde: posAtIngress.isRetrograde,
        ingressJD: exactJD,
        ingressDate: jdToTransitDate(exactJD)
      });
      prevHouse = currentHouse;
    }
    prevJD = currentJD;
    currentJD += stepDays;
  }
  return ingresses;
}
function calculateAllIngressesForBodies(bodies, houseCusps, startJD, endJD) {
  const allIngresses = [];
  for (const body of bodies) {
    const bodyIngresses = calculateAllIngresses(body, houseCusps, startJD, endJD);
    allIngresses.push(...bodyIngresses);
  }
  allIngresses.sort((a, b) => (a.ingressJD ?? 0) - (b.ingressJD ?? 0));
  return allIngresses;
}
function getBodyHouse(body, houseCusps, jd) {
  const pos = getPosition(body, jd);
  return getHousePosition(pos.longitude, houseCusps);
}
function getBodyHouses(bodies, houseCusps, jd) {
  const result = /* @__PURE__ */ new Map();
  for (const body of bodies) {
    result.set(BODY_NAMES3[body], getBodyHouse(body, houseCusps, jd));
  }
  return result;
}
function formatHouseIngress(ingress) {
  const date = ingress.ingressDate;
  const dateStr = date ? `${date.year}-${String(date.month).padStart(2, "0")}-${String(date.day).padStart(2, "0")}` : "unknown date";
  const retro = ingress.isRetrograde ? " \u211E" : "";
  const direction = ingress.direction === "entering" ? "\u2192" : "\u2190";
  return `${ingress.body}${retro} ${direction} House ${ingress.house} (from ${ingress.previousHouse}) on ${dateStr}`;
}
function groupIngressesByHouse(ingresses) {
  const grouped = {};
  for (const ingress of ingresses) {
    if (!grouped[ingress.house]) {
      grouped[ingress.house] = [];
    }
    grouped[ingress.house].push(ingress);
  }
  return grouped;
}
function groupIngressesByBody(ingresses) {
  const grouped = {};
  for (const ingress of ingresses) {
    if (!grouped[ingress.body]) {
      grouped[ingress.body] = [];
    }
    grouped[ingress.body].push(ingress);
  }
  return grouped;
}

// src/transits/retrograde-transits.ts
function classifyMotion(body, jd) {
  const pos = getPosition(body, jd);
  const speed = pos.longitudeSpeed;
  if (Math.abs(speed) < STATIONARY_SPEED_THRESHOLD) {
    const posBefore = getPosition(body, jd - 1);
    const posAfter = getPosition(body, jd + 1);
    if (posAfter.longitudeSpeed < posBefore.longitudeSpeed) {
      return "stationary-retrograde";
    }
    return "stationary-direct";
  }
  return speed > 0 ? "direct" : "retrograde";
}
function canRetrograde(body) {
  return RETROGRADE_PLANETS.includes(body);
}
function isRetrograde4(body, jd) {
  const pos = getPosition(body, jd);
  return pos.isRetrograde;
}
function findStationPoints(body, startJD, endJD) {
  if (!canRetrograde(body)) {
    return [];
  }
  const stations = [];
  const avgMotion = Math.abs(AVERAGE_DAILY_MOTION[body] ?? 0.1);
  const stepDays = Math.max(1, Math.min(14, 5 / avgMotion));
  let prevJD = startJD;
  let prevPos = getPosition(body, prevJD);
  let currentJD = prevJD + stepDays;
  while (currentJD <= endJD) {
    const currentPos = getPosition(body, currentJD);
    if (prevPos.longitudeSpeed * currentPos.longitudeSpeed < 0) {
      const stationJD = findExactStationTime(body, prevJD, currentJD);
      const stationPos = getPosition(body, stationJD);
      const stationType = prevPos.longitudeSpeed > 0 ? "station-retrograde" : "station-direct";
      stations.push({
        body,
        type: stationType,
        jd: stationJD,
        longitude: stationPos.longitude,
        date: jdToTransitDate(stationJD)
      });
    }
    prevJD = currentJD;
    prevPos = currentPos;
    currentJD += stepDays;
  }
  return stations;
}
function findExactStationTime(body, startJD, endJD) {
  const tolerance = STATIONARY_SPEED_THRESHOLD;
  let lo = startJD;
  let hi = endJD;
  for (let i = 0; i < MAX_BINARY_SEARCH_ITERATIONS; i++) {
    const midJD = (lo + hi) / 2;
    const pos = getPosition(body, midJD);
    if (Math.abs(pos.longitudeSpeed) < tolerance) {
      return midJD;
    }
    const posLo = getPosition(body, lo);
    if (posLo.longitudeSpeed * pos.longitudeSpeed < 0) {
      hi = midJD;
    } else {
      lo = midJD;
    }
    if (hi - lo < 1e-4) {
      break;
    }
  }
  return (lo + hi) / 2;
}
function findNextStation(body, fromJD, maxSearchDays = 365) {
  const stations = findStationPoints(body, fromJD, fromJD + maxSearchDays);
  return stations.length > 0 ? stations[0] : null;
}
function findRetrogradePeriods(body, startJD, endJD) {
  if (!canRetrograde(body)) {
    return [];
  }
  const stations = findStationPoints(body, startJD, endJD);
  const periods = [];
  for (let i = 0; i < stations.length; i++) {
    if (stations[i].type === "station-retrograde") {
      const stationRetro = stations[i];
      const stationDirect = stations[i + 1]?.type === "station-direct" ? stations[i + 1] : null;
      if (stationDirect) {
        periods.push({
          body,
          stationRetroJD: stationRetro.jd,
          stationDirectJD: stationDirect.jd,
          stationRetroLongitude: stationRetro.longitude,
          stationDirectLongitude: stationDirect.longitude,
          durationDays: stationDirect.jd - stationRetro.jd
        });
      }
    }
  }
  if (stations.length > 0 && stations[0].type === "station-direct") {
    const beforeStart = findStationPoints(body, startJD - 180, startJD);
    const prevStationRetro = beforeStart.filter((s) => s.type === "station-retrograde").pop();
    if (prevStationRetro) {
      periods.unshift({
        body,
        stationRetroJD: prevStationRetro.jd,
        stationDirectJD: stations[0].jd,
        stationRetroLongitude: prevStationRetro.longitude,
        stationDirectLongitude: stations[0].longitude,
        durationDays: stations[0].jd - prevStationRetro.jd
      });
    }
  }
  return periods;
}
function getCurrentRetrogradePeriod(body, jd) {
  if (!isRetrograde4(body, jd)) {
    return null;
  }
  const beforeStations = findStationPoints(body, jd - 180, jd);
  const stationRetro = beforeStations.filter((s) => s.type === "station-retrograde").pop();
  const afterStations = findStationPoints(body, jd, jd + 180);
  const stationDirect = afterStations.find((s) => s.type === "station-direct");
  if (!stationRetro || !stationDirect) {
    return null;
  }
  return {
    body,
    stationRetroJD: stationRetro.jd,
    stationDirectJD: stationDirect.jd,
    stationRetroLongitude: stationRetro.longitude,
    stationDirectLongitude: stationDirect.longitude,
    durationDays: stationDirect.jd - stationRetro.jd
  };
}
function findTransitPasses(body, natalLongitude, aspectAngle, startJD, endJD) {
  const passes = [];
  const avgMotion = Math.abs(AVERAGE_DAILY_MOTION[body] ?? 0.1);
  const stepDays = Math.max(0.5, Math.min(7, 2 / avgMotion));
  let prevJD = startJD;
  let prevDev = calculateDeviation(body, prevJD, natalLongitude, aspectAngle);
  let currentJD = prevJD + stepDays;
  let passNumber = 1;
  while (currentJD <= endJD) {
    const currentDev = calculateDeviation(body, currentJD, natalLongitude, aspectAngle);
    if (prevDev * currentDev < 0) {
      const exactJD = findExactCrossingTime(body, natalLongitude, aspectAngle, prevJD, currentJD);
      const pos = getPosition(body, exactJD);
      const motion = classifyMotion(body, exactJD);
      passes.push({
        passNumber,
        exactJD,
        exactDate: jdToTransitDate(exactJD),
        longitude: pos.longitude,
        motionState: motion,
        isRetrogradePass: motion === "retrograde" || motion === "stationary-retrograde"
      });
      passNumber++;
    }
    prevJD = currentJD;
    prevDev = currentDev;
    currentJD += stepDays;
  }
  return passes;
}
function calculateDeviation(body, jd, natalLongitude, aspectAngle) {
  const pos = getPosition(body, jd);
  let diff = pos.longitude - natalLongitude;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return diff - aspectAngle;
}
function findExactCrossingTime(body, natalLongitude, aspectAngle, startJD, endJD) {
  const tolerance = 1e-4;
  let lo = startJD;
  let hi = endJD;
  for (let i = 0; i < MAX_BINARY_SEARCH_ITERATIONS; i++) {
    const midJD = (lo + hi) / 2;
    const dev = calculateDeviation(body, midJD, natalLongitude, aspectAngle);
    if (Math.abs(dev) < tolerance) {
      return midJD;
    }
    const devLo = calculateDeviation(body, lo, natalLongitude, aspectAngle);
    if (devLo * dev < 0) {
      hi = midJD;
    } else {
      lo = midJD;
    }
    if (hi - lo < 1e-4) {
      break;
    }
  }
  return (lo + hi) / 2;
}
function estimatePassCount(body, transitDurationDays) {
  if (!canRetrograde(body)) {
    return 1;
  }
  const retroPeriodDays = {
    ["Mercury" /* Mercury */]: 21,
    ["Venus" /* Venus */]: 42,
    ["Mars" /* Mars */]: 72,
    ["Jupiter" /* Jupiter */]: 121,
    ["Saturn" /* Saturn */]: 140,
    ["Uranus" /* Uranus */]: 150,
    ["Neptune" /* Neptune */]: 158,
    ["Pluto" /* Pluto */]: 160,
    ["Chiron" /* Chiron */]: 140
  };
  const retro = retroPeriodDays[body] ?? 60;
  if (transitDurationDays < retro * 0.5) {
    return 1;
  }
  if (transitDurationDays < retro * 2) {
    return 3;
  }
  return 5;
}
function getRetrogradeShadow(period) {
  const shadowZoneStart = Math.min(period.stationRetroLongitude, period.stationDirectLongitude);
  const shadowZoneEnd = Math.max(period.stationRetroLongitude, period.stationDirectLongitude);
  const avgMotion = Math.abs(AVERAGE_DAILY_MOTION[period.body] ?? 0.1);
  const shadowDegrees = shadowZoneEnd - shadowZoneStart;
  const shadowDays = shadowDegrees / avgMotion;
  return {
    preShadowStartJD: period.stationRetroJD - shadowDays,
    postShadowEndJD: period.stationDirectJD + shadowDays,
    shadowZoneStart,
    shadowZoneEnd
  };
}
function formatRetrogradePeriod(period) {
  const startDate = jdToTransitDate(period.stationRetroJD);
  const endDate = jdToTransitDate(period.stationDirectJD);
  const startStr = `${startDate.year}-${String(startDate.month).padStart(2, "0")}-${String(startDate.day).padStart(2, "0")}`;
  const endStr = `${endDate.year}-${String(endDate.month).padStart(2, "0")}-${String(endDate.day).padStart(2, "0")}`;
  return `${BODY_NAMES3[period.body]} Rx: ${startStr} to ${endStr} (${period.durationDays.toFixed(0)} days)
  Station Rx at ${period.stationRetroLongitude.toFixed(2)}\xB0
  Station Direct at ${period.stationDirectLongitude.toFixed(2)}\xB0`;
}
function formatStationPoint(station) {
  const date = station.date;
  const dateStr = `${date.year}-${String(date.month).padStart(2, "0")}-${String(date.day).padStart(2, "0")}`;
  const typeStr = station.type === "station-retrograde" ? "Stations Retrograde" : "Stations Direct";
  return `${BODY_NAMES3[station.body]} ${typeStr} at ${station.longitude.toFixed(2)}\xB0 on ${dateStr}`;
}
function getAllRetrogradePeriods(bodies, startJD, endJD) {
  const result = /* @__PURE__ */ new Map();
  for (const body of bodies) {
    const periods = findRetrogradePeriods(body, startJD, endJD);
    if (periods.length > 0) {
      result.set(BODY_NAMES3[body], periods);
    }
  }
  return result;
}

// src/transits/transit-search.ts
function searchTransits(params) {
  const { startJD, endJD, natalPoints, config, stepDays } = params;
  const fullConfig = {
    ...DEFAULT_TRANSIT_CONFIG,
    ...config
  };
  const bodies = fullConfig.transitingBodies ?? [...DEFAULT_TRANSITING_BODIES];
  const aspectTypes = fullConfig.aspectTypes ?? DEFAULT_TRANSIT_CONFIG.aspectTypes;
  const transitMap = /* @__PURE__ */ new Map();
  for (const body of bodies) {
    const step = stepDays ?? getSearchStepForBody(body);
    for (const natalPoint of natalPoints) {
      for (const aspectType of aspectTypes) {
        const orb = getEffectiveOrb(aspectType, natalPoint, body, config);
        const aspectAngle = getAspectAngle2(aspectType);
        const exactTimes = findAllExactTimes(
          body,
          natalPoint.longitude,
          aspectAngle,
          startJD,
          endJD,
          step
        );
        for (const exactJD of exactTimes) {
          const key = `${body}-${natalPoint.name}-${aspectType}`;
          if (transitMap.has(key)) {
            const existing = transitMap.get(key);
            const existingFirst = existing.exactJDs[0];
            const existingLast = existing.exactJDs[existing.exactJDs.length - 1];
            if (exactJD >= existingFirst - 30 && exactJD <= existingLast + 30) {
              continue;
            }
          }
          const timing = findTransitTiming(
            body,
            natalPoint.longitude,
            aspectAngle,
            orb,
            startJD,
            endJD
          );
          if (timing) {
            const pos = getPosition(body, exactJD);
            const sep = angularSeparation3(pos.longitude, natalPoint.longitude);
            const deviation = Math.abs(sep - aspectAngle);
            const transit = {
              transitingBody: BODY_NAMES3[body],
              transitingBodyEnum: body,
              natalPoint: natalPoint.name,
              aspectType,
              symbol: getAspectSymbol2(aspectType),
              aspectAngle,
              separation: sep,
              deviation,
              orb,
              phase: "exact",
              strength: 100,
              isRetrograde: pos.isRetrograde,
              isOutOfSign: false,
              exactJD,
              exactDate: jdToTransitDate(exactJD)
            };
            const transitTiming = {
              ...timing,
              transit
            };
            transitMap.set(`${key}-${Math.floor(exactJD)}`, transitTiming);
          }
        }
      }
    }
  }
  const transits = Array.from(transitMap.values()).sort((a, b) => a.exactJDs[0] - b.exactJDs[0]);
  const byMonth = groupTransitsByMonth(transits);
  const summary = generateSearchSummary(transits, startJD, endJD);
  return {
    params,
    transits,
    byMonth,
    summary
  };
}
function searchTransitsForBody(body, natalPoints, startJD, endJD, config) {
  const result = searchTransits({
    startJD,
    endJD,
    natalPoints,
    config: {
      ...config,
      transitingBodies: [body]
    }
  });
  return result.transits;
}
function searchTransitsToPoint(natalPoint, startJD, endJD, config) {
  const result = searchTransits({
    startJD,
    endJD,
    natalPoints: [natalPoint],
    config
  });
  return result.transits;
}
function groupTransitsByMonth(transits) {
  const grouped = {};
  for (const timing of transits) {
    const firstExact = timing.exactDates[0];
    const key = `${firstExact.year}-${String(firstExact.month).padStart(2, "0")}`;
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(timing);
  }
  return grouped;
}
function groupTransitsByBody(transits) {
  const grouped = {};
  for (const timing of transits) {
    const body = timing.transit.transitingBody;
    if (!grouped[body]) {
      grouped[body] = [];
    }
    grouped[body].push(timing);
  }
  return grouped;
}
function groupTransitsByNatalPoint(transits) {
  const grouped = {};
  for (const timing of transits) {
    const point = timing.transit.natalPoint;
    if (!grouped[point]) {
      grouped[point] = [];
    }
    grouped[point].push(timing);
  }
  return grouped;
}
function groupTransitsByAspect(transits) {
  const grouped = {};
  for (const timing of transits) {
    const aspect = timing.transit.aspectType;
    if (!grouped[aspect]) {
      grouped[aspect] = [];
    }
    grouped[aspect].push(timing);
  }
  return grouped;
}
function generateSearchSummary(transits, startJD, endJD) {
  const byAspect = {};
  const byBody = {};
  for (const timing of transits) {
    byAspect[timing.transit.aspectType] = (byAspect[timing.transit.aspectType] ?? 0) + 1;
    byBody[timing.transit.transitingBody] = (byBody[timing.transit.transitingBody] ?? 0) + 1;
  }
  return {
    totalTransits: transits.length,
    byAspect,
    byBody,
    dateRange: {
      start: jdToTransitDate(startJD),
      end: jdToTransitDate(endJD),
      days: endJD - startJD
    }
  };
}
function filterByStrength(transits, minStrength) {
  return transits.filter((t) => t.transit.strength >= minStrength);
}
function filterRetrogrades(transits) {
  return transits.filter((t) => t.hasRetrogradePass);
}
function filterMultiplePasses(transits) {
  return transits.filter((t) => t.exactPasses > 1);
}
function filterByDuration(transits, minDays) {
  return transits.filter((t) => t.durationDays >= minDays);
}
function filterByBodySpeed(transits, type) {
  const fastBodies = FAST_PLANETS.map((b) => BODY_NAMES3[b]);
  if (type === "fast") {
    return transits.filter((t) => fastBodies.includes(t.transit.transitingBody));
  }
  return transits.filter((t) => !fastBodies.includes(t.transit.transitingBody));
}
function getNextTransit(transits, afterJD) {
  for (const transit of transits) {
    if (transit.exactJDs[0] > afterJD) {
      return transit;
    }
  }
  return void 0;
}
function getActiveTransits(transits, jd) {
  return transits.filter((t) => jd >= t.enterOrbJD && jd <= t.leaveOrbJD);
}
function getMostSignificantTransits(transits, limit = 10) {
  return [...transits].sort((a, b) => b.durationDays - a.durationDays).slice(0, limit);
}
function formatTransitTimingDetail(timing) {
  const { transit } = timing;
  const retro = timing.hasRetrogradePass ? " (includes retrograde)" : "";
  const passes = timing.exactPasses > 1 ? ` - ${timing.exactPasses} exact passes` : "";
  const lines = [
    `${transit.transitingBody} ${transit.symbol} ${transit.natalPoint}${retro}${passes}`,
    `  Duration: ${timing.durationDays.toFixed(1)} days`,
    `  Enters orb: ${formatDate(timing.enterOrbDate)}`
  ];
  for (let i = 0; i < timing.exactDates.length; i++) {
    lines.push(`  Exact #${i + 1}: ${formatDate(timing.exactDates[i])}`);
  }
  lines.push(`  Leaves orb: ${formatDate(timing.leaveOrbDate)}`);
  return lines.join("\n");
}
function formatDate(date) {
  return `${date.year}-${String(date.month).padStart(2, "0")}-${String(date.day).padStart(2, "0")}`;
}
function getAspectAngle2(aspectType) {
  const angles = {
    ["conjunction" /* Conjunction */]: 0,
    ["semi-sextile" /* SemiSextile */]: 30,
    ["decile" /* Decile */]: 36,
    ["novile" /* Novile */]: 40,
    ["semi-square" /* SemiSquare */]: 45,
    ["septile" /* Septile */]: 51.4286,
    ["sextile" /* Sextile */]: 60,
    ["quintile" /* Quintile */]: 72,
    ["square" /* Square */]: 90,
    ["trine" /* Trine */]: 120,
    ["sesquiquadrate" /* Sesquiquadrate */]: 135,
    ["biquintile" /* Biquintile */]: 144,
    ["quincunx" /* Quincunx */]: 150,
    ["opposition" /* Opposition */]: 180
  };
  return angles[aspectType];
}
function getAspectSymbol2(aspectType) {
  const symbols = {
    ["conjunction" /* Conjunction */]: "\u260C",
    ["sextile" /* Sextile */]: "\u26B9",
    ["square" /* Square */]: "\u25A1",
    ["trine" /* Trine */]: "\u25B3",
    ["opposition" /* Opposition */]: "\u260D",
    ["semi-sextile" /* SemiSextile */]: "\u26BA",
    ["semi-square" /* SemiSquare */]: "\u2220",
    ["quintile" /* Quintile */]: "Q",
    ["sesquiquadrate" /* Sesquiquadrate */]: "\u26BC",
    ["biquintile" /* Biquintile */]: "bQ",
    ["quincunx" /* Quincunx */]: "\u26BB",
    ["septile" /* Septile */]: "S",
    ["novile" /* Novile */]: "N",
    ["decile" /* Decile */]: "D"
  };
  return symbols[aspectType];
}
function getUpcomingTransits(natalPoints, fromJD, days = 30, config) {
  return searchTransits({
    startJD: fromJD,
    endJD: fromJD + days,
    natalPoints,
    config
  });
}
function getTransitsForMonth(natalPoints, year, month, config) {
  const startJD = dateToJD(year, month, 1);
  const endJD = month === 12 ? dateToJD(year + 1, 1, 1) : dateToJD(year, month + 1, 1);
  return searchTransits({
    startJD,
    endJD,
    natalPoints,
    config
  });
}
function getTransitsForYear(natalPoints, year, config) {
  const startJD = dateToJD(year, 1, 1);
  const endJD = dateToJD(year + 1, 1, 1);
  return searchTransits({
    startJD,
    endJD,
    natalPoints,
    config
  });
}
function dateToJD(year, month, day) {
  if (month <= 2) {
    year -= 1;
    month += 12;
  }
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + B - 1524.5;
}

// src/transits/reference-data/transit-events.ts
var HISTORICAL_TRANSIT_EVENTS = [
  // -----------------
  // Saturn Returns
  // -----------------
  {
    name: "Saturn Return - Example (J2000 epoch)",
    description: "Saturn returns to its J2000 position (~29.5 years)",
    source: "Swiss Ephemeris / Astronomical calculation",
    natal: {
      longitude: 40.44,
      // Saturn at J2000
      zodiacPosition: "10\xB0 Taurus"
    },
    transit: {
      body: "Saturn" /* Saturn */,
      aspectType: "conjunction" /* Conjunction */,
      // Saturn return is ~29.46 years, so J2000 + 29.46 years = late 2029
      exactDate: { year: 2029, month: 6, day: 1 },
      dateTolerance: 60
      // Allow 2 months tolerance for this estimate
    }
  },
  // -----------------
  // Outer Planet Transits
  // -----------------
  {
    name: "Pluto conjunct J2000 Sun position",
    description: "Pluto transiting over the J2000 Sun longitude",
    source: "Swiss Ephemeris",
    natal: {
      longitude: 280.37,
      // Sun at J2000.0
      zodiacPosition: "10\xB022' Capricorn"
    },
    transit: {
      body: "Pluto" /* Pluto */,
      aspectType: "conjunction" /* Conjunction */,
      // Pluto was at ~280° (10° Cap) in early 2023
      exactDate: { year: 2023, month: 2, day: 1 },
      dateTolerance: 30
    }
  },
  // -----------------
  // Great Conjunction 2020
  // -----------------
  {
    name: "Jupiter conjunct Saturn (Great Conjunction 2020)",
    description: 'The "Great Conjunction" of Jupiter and Saturn',
    source: "NASA/JPL / Swiss Ephemeris",
    natal: {
      // Using Saturn's position as "natal" to test Jupiter transit
      longitude: 300.32,
      // Saturn at the conjunction (0°29' Aquarius)
      zodiacPosition: "0\xB029' Aquarius"
    },
    transit: {
      body: "Jupiter" /* Jupiter */,
      aspectType: "conjunction" /* Conjunction */,
      exactDate: { year: 2020, month: 12, day: 21 },
      dateTolerance: 1
      // Very precise, well-documented event
    }
  }
];
var REFERENCE_STATION_POINTS = [
  // -----------------
  // Mercury Stations 2024
  // -----------------
  {
    name: "Mercury Station Retrograde - April 2024",
    source: "Swiss Ephemeris / Astronomical Almanac",
    body: "Mercury" /* Mercury */,
    stationType: "retrograde",
    date: { year: 2024, month: 4, day: 1 },
    longitude: 27,
    // ~27° Aries
    zodiacPosition: "~27\xB0 Aries",
    dateTolerance: 2
  },
  {
    name: "Mercury Station Direct - April 2024",
    source: "Swiss Ephemeris / Astronomical Almanac",
    body: "Mercury" /* Mercury */,
    stationType: "direct",
    date: { year: 2024, month: 4, day: 25 },
    longitude: 15.5,
    // ~15° Aries
    zodiacPosition: "~15\xB0 Aries",
    dateTolerance: 2
  },
  // -----------------
  // Saturn Stations 2024
  // -----------------
  {
    name: "Saturn Station Retrograde - 2024",
    source: "Swiss Ephemeris",
    body: "Saturn" /* Saturn */,
    stationType: "retrograde",
    date: { year: 2024, month: 6, day: 29 },
    longitude: 349.3,
    // ~19° Pisces
    zodiacPosition: "~19\xB0 Pisces",
    dateTolerance: 3
  },
  {
    name: "Saturn Station Direct - 2024",
    source: "Swiss Ephemeris",
    body: "Saturn" /* Saturn */,
    stationType: "direct",
    date: { year: 2024, month: 11, day: 15 },
    longitude: 342.5,
    // ~12° Pisces
    zodiacPosition: "~12\xB0 Pisces",
    dateTolerance: 3
  }
];
var REFERENCE_RETROGRADE_PERIODS = [
  // -----------------
  // Mercury Retrograde 2024 Periods
  // -----------------
  {
    name: "Mercury Retrograde - Spring 2024",
    source: "Astronomical Almanac / Swiss Ephemeris",
    body: "Mercury" /* Mercury */,
    stationRetro: { year: 2024, month: 4, day: 1 },
    stationDirect: { year: 2024, month: 4, day: 25 },
    expectedDuration: 24,
    // ~24 days
    durationTolerance: 3
  },
  // -----------------
  // Jupiter Retrograde 2024
  // -----------------
  {
    name: "Jupiter Retrograde - 2024",
    source: "Swiss Ephemeris",
    body: "Jupiter" /* Jupiter */,
    stationRetro: { year: 2024, month: 10, day: 9 },
    stationDirect: { year: 2025, month: 2, day: 4 },
    expectedDuration: 118,
    // ~4 months
    durationTolerance: 5
  },
  // -----------------
  // Saturn Retrograde 2024
  // -----------------
  {
    name: "Saturn Retrograde - 2024",
    source: "Swiss Ephemeris",
    body: "Saturn" /* Saturn */,
    stationRetro: { year: 2024, month: 6, day: 29 },
    stationDirect: { year: 2024, month: 11, day: 15 },
    expectedDuration: 139,
    // ~4.5 months
    durationTolerance: 5
  }
];
var TYPICAL_RETROGRADE_DURATIONS = {
  ["Sun" /* Sun */]: null,
  // Never retrogrades
  ["Moon" /* Moon */]: null,
  // Never retrogrades
  ["Mercury" /* Mercury */]: { avgDays: 21, minDays: 19, maxDays: 24 },
  ["Venus" /* Venus */]: { avgDays: 42, minDays: 40, maxDays: 43 },
  ["Mars" /* Mars */]: { avgDays: 72, minDays: 58, maxDays: 81 },
  ["Jupiter" /* Jupiter */]: { avgDays: 121, minDays: 118, maxDays: 124 },
  ["Saturn" /* Saturn */]: { avgDays: 140, minDays: 137, maxDays: 142 },
  ["Uranus" /* Uranus */]: { avgDays: 150, minDays: 148, maxDays: 152 },
  ["Neptune" /* Neptune */]: { avgDays: 158, minDays: 156, maxDays: 160 },
  ["Pluto" /* Pluto */]: { avgDays: 160, minDays: 156, maxDays: 164 },
  ["Chiron" /* Chiron */]: { avgDays: 140, minDays: 135, maxDays: 145 },
  // Nodes and other points
  ["NorthNode" /* NorthNode */]: null,
  ["TrueNorthNode" /* TrueNorthNode */]: null,
  ["SouthNode" /* SouthNode */]: null,
  ["TrueSouthNode" /* TrueSouthNode */]: null,
  ["Lilith" /* Lilith */]: null,
  ["TrueLilith" /* TrueLilith */]: null,
  ["Ceres" /* Ceres */]: { avgDays: 90, minDays: 80, maxDays: 100 },
  ["Pallas" /* Pallas */]: { avgDays: 85, minDays: 75, maxDays: 95 },
  ["Juno" /* Juno */]: { avgDays: 80, minDays: 70, maxDays: 90 },
  ["Vesta" /* Vesta */]: { avgDays: 75, minDays: 65, maxDays: 85 }
};
var ASTRONOMICAL_EVENTS = {
  /**
   * Great Conjunction 2020
   * Jupiter-Saturn conjunction on December 21, 2020
   * Separation: 0°06' (closest since 1623)
   */
  greatConjunction2020: {
    date: { year: 2020, month: 12, day: 21, hour: 18, minute: 22 },
    jupiterLongitude: 300.31,
    // 0°29' Aquarius
    saturnLongitude: 300.32,
    // 0°29' Aquarius
    separation: 0.1,
    // degrees
    source: "NASA/JPL/Swiss Ephemeris"
  },
  /**
   * Pluto enters Aquarius
   * First ingress: January 20-21, 2024
   */
  plutoEntersAquarius: {
    date: { year: 2024, month: 1, day: 21 },
    longitude: 300,
    // 0° Aquarius
    source: "Swiss Ephemeris"
  },
  /**
   * Spring Equinox 2024
   * Sun at 0° Aries
   */
  springEquinox2024: {
    date: { year: 2024, month: 3, day: 20 },
    sunLongitude: 0,
    source: "USNO/Swiss Ephemeris"
  }
};

// src/zodiac/index.ts
var zodiac_exports = {};
__export(zodiac_exports, {
  DIGNITY_STRENGTH: () => DIGNITY_STRENGTH,
  DignityState: () => DignityState,
  EXALTATIONS: () => EXALTATIONS,
  Element: () => Element,
  Modality: () => Modality,
  PLANETARY_RULERSHIPS: () => PLANETARY_RULERSHIPS,
  PLANET_SYMBOLS: () => PLANET_SYMBOLS,
  Planet: () => Planet2,
  Polarity: () => Polarity,
  SIGN_DATA: () => SIGN_DATA,
  Sign: () => Sign,
  eclipticToZodiac: () => eclipticToZodiac,
  formatZodiacPosition: () => formatZodiacPosition,
  getPlanetaryDignity: () => getPlanetaryDignity,
  getSignInfo: () => getSignInfo,
  getSignName: () => getSignName,
  getSignSymbol: () => getSignSymbol,
  isDetriment: () => isDetriment,
  isExalted: () => isExalted,
  isFall: () => isFall,
  isRuler: () => isRuler
});

export { ALL_ASPECTS, AspectType, CelestialBody, DEFAULT_ORBS, DignityState, Element, J2000_EPOCH2 as J2000_EPOCH, MAJOR_ASPECTS, Modality, PatternType, Planet2 as Planet, Sign, aspects_exports as aspects, calculateAngles, calculateAspects, calculateChart, calculateHouseCusps, calculateHouses, calculatePlanets, calculateProgressedPositions, calculateProgression, calculateSolarArc, calculateTransits, chart_exports as chart, deltaT, detectAspect, eclipticToZodiac, ephemeris_exports as ephemeris, findPatterns, formatChart, formatProgressedChart, formatTransit, formatZodiacPosition, fromJulianDate, getAllPositions, getAvailableHouseSystems2 as getAvailableHouseSystems, getMoonPosition, getPlanetaryDignity, getPosition, getProgressedMoonReport, getSignInfo, getSunPosition, getTransitsToPoint, greenwichMeanSiderealTime, houses_exports as houses, localSiderealTime, obliquityOfEcliptic, progressions_exports as progressions, time_exports as time, toJulianDate, transits_exports as transits, validateBirth, zodiac_exports as zodiac };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map