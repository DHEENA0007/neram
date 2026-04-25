import { DateTime } from 'luxon';
import SunCalc from 'suncalc';
import dns from 'node:dns';
import { execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import {
  activityOptions,
  activityStrengthFactors,
  birdDirections,
  birdIntrinsicStrengths,
  birdOptions,
  effectOptions,
  getBirdById,
  getEffectByIndex,
  getPakshaByKey,
  getRelationByIndex,
  getWeekdayByIndex,
  pakshaOptions,
  relationOptions,
} from '../../shared/constants.js';
import { getPalangal } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const csvPath = path.join(__dirname, '..', 'data', 'pancha_pakshi_db.csv');
const execFileAsync = promisify(execFile);

dns.setDefaultResultOrder('ipv4first');

let cachedRows = null;
let cachedIndex = null;

export const birdLabelMap = Object.fromEntries(
  birdOptions.map((bird) => [bird.id, bird]),
);

function getBirdByZeroBasedIndex(index) {
  return birdOptions[index] ?? birdOptions[0];
}

// ── Peyar Pakshi: Name → Bird detection ──────────────────────────────────────

const TAMIL_VOWEL_TO_BIRD = {
  0x0B85: 1, // அ  → வல்லூறு
  0x0B86: 1, // ஆ  → வல்லூறு
  0x0B90: 1, // ஐ  → வல்லூறு
  0x0B94: 1, // ஔ  → வல்லூறு
  0x0B87: 2, // இ  → ஆந்தை
  0x0B88: 2, // ஈ  → ஆந்தை
  0x0B89: 3, // உ  → காகம்
  0x0B8A: 3, // ஊ  → காகம்
  0x0B8E: 4, // எ  → கோழி
  0x0B8F: 4, // ஏ  → கோழி
  0x0B92: 5, // ஒ  → மயில்
  0x0B93: 5, // ஓ  → மயில்
};

const TAMIL_SIGN_TO_BIRD = {
  0x0BBE: 1, // ா  (ஆ)  → வல்லூறு
  0x0BC8: 1, // ை  (ஐ)  → வல்லூறு
  0x0BCC: 1, // ௌ  (ஔ)  → வல்லூறு
  0x0BBF: 2, // ி  (இ)  → ஆந்தை
  0x0BC0: 2, // ீ  (ஈ)  → ஆந்தை
  0x0BC1: 3, // ு  (உ)  → காகம்
  0x0BC2: 3, // ூ  (ஊ)  → காகம்
  0x0BC6: 4, // ெ  (எ)  → கோழி
  0x0BC7: 4, // ே  (ஏ)  → கோழி
  0x0BCA: 5, // ொ  (ஒ)  → மயில்
  0x0BCB: 5, // ோ  (ஓ)  → மயில்
};

function getBirdFromTamilName(name) {
  const chars = [...name];
  for (let i = 0; i < chars.length; i++) {
    const code = chars[i].codePointAt(0);

    // Standalone Tamil vowel
    if (TAMIL_VOWEL_TO_BIRD[code]) return TAMIL_VOWEL_TO_BIRD[code];

    // Tamil consonant (U+0B95–U+0BB9)
    if (code >= 0x0B95 && code <= 0x0BB9) {
      const nextCode = chars[i + 1]?.codePointAt(0);
      if (nextCode === 0x0BCD) continue; // pulli (்) = pure consonant, skip
      if (TAMIL_SIGN_TO_BIRD[nextCode]) return TAMIL_SIGN_TO_BIRD[nextCode];
      return 1; // consonant with no vowel sign → inherent 'அ' → Bird 1
    }
  }
  return null;
}

function getBirdFromEnglishName(name) {
  const s = name.toLowerCase().replace(/[^a-z]/g, '');
  if (!s) return null;

  // Skip leading consonant cluster; handle Tamil-style digraphs
  const digraphs = new Set(['th', 'dh', 'sh', 'zh', 'ch', 'ng', 'kh', 'gh', 'ph']);
  let i = 0;
  while (i < s.length && !'aeiou'.includes(s[i])) {
    if (digraphs.has(s.slice(i, i + 2))) { i += 2; } else { i++; }
  }
  if (i >= s.length) return null;

  const v = s.slice(i);

  // Multi-char vowel patterns first (order matters)
  if (v.startsWith('ai') || v.startsWith('ay')) return 1; // ஐ → வல்லூறு
  if (v.startsWith('au') || v.startsWith('aw') || v.startsWith('ou')) return 1; // ஔ → வல்லூறு
  if (v.startsWith('aa') || v.startsWith('ah')) return 1; // ஆ → வல்லூறு
  if (v.startsWith('ee') || v.startsWith('ii') || v.startsWith('ea')) return 2; // ஈ → ஆந்தை
  if (v.startsWith('oo') || v.startsWith('uu')) return 3; // ஊ → காகம்
  if (v.startsWith('oa') || v.startsWith('oh') || v.startsWith('oe')) return 5; // ஓ → மயில்

  // Single vowel
  if (v.startsWith('a')) return 1; // அ → வல்லூறு
  if (v.startsWith('i')) return 2; // இ → ஆந்தை
  if (v.startsWith('u')) return 3; // உ → காகம்
  if (v.startsWith('e')) return 4; // எ → கோழி
  if (v.startsWith('o')) return 5; // ஒ → மயில்

  return null;
}

export function getBirdIdFromName(name) {
  if (!name || !name.trim()) return null;
  const trimmed = name.trim();
  // Detect script: if any Tamil Unicode character present, use Tamil parser
  const isTamil = /[\u0B80-\u0BFF]/.test(trimmed);
  return isTamil ? getBirdFromTamilName(trimmed) : getBirdFromEnglishName(trimmed);
}

// ─────────────────────────────────────────────────────────────────────────────

const HORAI_SEQUENCE = [
  { key: 'sun', label: 'Sun', tamil: 'சூரியன்' },
  { key: 'venus', label: 'Venus', tamil: 'சுக்கிரன்' },
  { key: 'mercury', label: 'Mercury', tamil: 'புதன்' },
  { key: 'moon', label: 'Moon', tamil: 'சந்திரன்' },
  { key: 'saturn', label: 'Saturn', tamil: 'சனி' },
  { key: 'jupiter', label: 'Jupiter', tamil: 'குரு' },
  { key: 'mars', label: 'Mars', tamil: 'செவ்வாய்' },
];

const WEEKDAY_HORAI_START_INDEX = {
  0: 0, // Sunday -> Sun
  1: 3, // Monday -> Moon
  2: 6, // Tuesday -> Mars
  3: 2, // Wednesday -> Mercury
  4: 5, // Thursday -> Jupiter
  5: 1, // Friday -> Venus
  6: 4, // Saturday -> Saturn
};

function calculateHoraiSchedule({ sunrise, sunset, nextSunrise, weekdayIndex, timezone }) {
  const startIndex = WEEKDAY_HORAI_START_INDEX[weekdayIndex];
  const dayMs   = sunset.toMillis()     - sunrise.toMillis();     // actual day length
  const nightMs = nextSunrise.toMillis() - sunset.toMillis();     // actual night length
  const dayHoraMs   = dayMs   / 12;
  const nightHoraMs = nightMs / 12;

  const horai = [];
  // 12 day horas — proportional to actual day length
  for (let i = 0; i < 12; i++) {
    const start = DateTime.fromMillis(Math.round(sunrise.toMillis() + dayHoraMs * i),       { zone: timezone });
    const end   = DateTime.fromMillis(Math.round(sunrise.toMillis() + dayHoraMs * (i + 1)), { zone: timezone });
    horai.push({
      index: i + 1, period: 'day',
      start: start.toISO({ suppressMilliseconds: true }),
      end:   end.toISO({ suppressMilliseconds: true }),
      startLabel: start.toFormat('hh:mm:ss a'),
      endLabel:   end.toFormat('hh:mm:ss a'),
      planet: HORAI_SEQUENCE[(startIndex + i) % 7],
    });
  }
  // 12 night horas — proportional to actual night length
  for (let i = 0; i < 12; i++) {
    const start = DateTime.fromMillis(Math.round(sunset.toMillis() + nightHoraMs * i),       { zone: timezone });
    const end   = DateTime.fromMillis(Math.round(sunset.toMillis() + nightHoraMs * (i + 1)), { zone: timezone });
    horai.push({
      index: i + 13, period: 'night',
      start: start.toISO({ suppressMilliseconds: true }),
      end:   end.toISO({ suppressMilliseconds: true }),
      startLabel: start.toFormat('hh:mm:ss a'),
      endLabel:   end.toFormat('hh:mm:ss a'),
      planet: HORAI_SEQUENCE[(startIndex + 12 + i) % 7],
    });
  }
  return horai;
}

const RAHU_KAALAM_PARTS = { 0: 8, 1: 2, 2: 7, 3: 5, 4: 6, 5: 4, 6: 3 };
const YAMAGANDAM_PARTS = { 0: 5, 1: 4, 2: 3, 3: 2, 4: 1, 5: 7, 6: 6 };
const KULIKAI_PARTS = { 0: 7, 1: 6, 2: 5, 3: 4, 4: 3, 5: 2, 6: 1 };

function calculateSpecialPeriods({ sunrise, sunset, weekdayIndex, timezone }) {
  const dayMs = sunset.toMillis() - sunrise.toMillis();
  const partMs = dayMs / 8;

  const getPeriod = (partNumber) => {
    const start = DateTime.fromMillis(Math.round(sunrise.toMillis() + partMs * (partNumber - 1)), { zone: timezone });
    const end = DateTime.fromMillis(Math.round(sunrise.toMillis() + partMs * partNumber), { zone: timezone });
    return {
      start: start.toISO({ suppressMilliseconds: true }),
      end: end.toISO({ suppressMilliseconds: true }),
      startLabel: start.toFormat('hh:mm:ss a'),
      endLabel: end.toFormat('hh:mm:ss a'),
    };
  };

  return {
    rahu: getPeriod(RAHU_KAALAM_PARTS[weekdayIndex]),
    yamagandam: getPeriod(YAMAGANDAM_PARTS[weekdayIndex]),
    kulikai: getPeriod(KULIKAI_PARTS[weekdayIndex]),
  };
}

// Day Gowri cycle: உத்தி→அமிர்→ரோகம்→லாபம்→தனம்→சுகம்→விஷம்→சோரம்
const GOWRI_DAY_TYPES = [
  { key: 'uthi',     label: 'Uthi',     tamil: 'உத்தி',    nature: 'good' }, // 0
  { key: 'amritham', label: 'Amritham', tamil: 'அமிர்தம்', nature: 'good' }, // 1
  { key: 'rogam',    label: 'Rogam',    tamil: 'ரோகம்',    nature: 'bad'  }, // 2
  { key: 'labham',   label: 'Labham',   tamil: 'லாபம்',    nature: 'good' }, // 3
  { key: 'dhanam',   label: 'Dhanam',   tamil: 'தனம்',     nature: 'good' }, // 4
  { key: 'sugam',    label: 'Sugam',    tamil: 'சுகம்',    nature: 'good' }, // 5
  { key: 'visham',   label: 'Visham',   tamil: 'விஷம்',    nature: 'bad'  }, // 6
  { key: 'soram',    label: 'Soram',    tamil: 'சோரம்',    nature: 'bad'  }, // 7
];

// Night Gowri cycle: சோரம் and விஷம் are swapped compared to day
const GOWRI_NIGHT_TYPES = [
  { key: 'uthi',     label: 'Uthi',     tamil: 'உத்தி',    nature: 'good' }, // 0
  { key: 'amritham', label: 'Amritham', tamil: 'அமிர்தம்', nature: 'good' }, // 1
  { key: 'rogam',    label: 'Rogam',    tamil: 'ரோகம்',    nature: 'bad'  }, // 2
  { key: 'labham',   label: 'Labham',   tamil: 'லாபம்',    nature: 'good' }, // 3
  { key: 'dhanam',   label: 'Dhanam',   tamil: 'தனம்',     nature: 'good' }, // 4
  { key: 'sugam',    label: 'Sugam',    tamil: 'சுகம்',    nature: 'good' }, // 5
  { key: 'soram',    label: 'Soram',    tamil: 'சோரம்',    nature: 'bad'  }, // 6 ← swapped
  { key: 'visham',   label: 'Visham',   tamil: 'விஷம்',    nature: 'bad'  }, // 7 ← swapped
];

const WEEKDAY_GOWRI_START_INDEX = {
  0: 0, // Sunday    -> உத்தி
  1: 1, // Monday    -> அமிர்தம்
  2: 2, // Tuesday   -> ரோகம்
  3: 3, // Wednesday -> லாபம்
  4: 4, // Thursday  -> தனம்
  5: 5, // Friday    -> சுகம்
  6: 7, // Saturday  -> சோரம் (index 7; விஷம்/6 is never a weekday start in traditional Gowri)
};

function calculateGowriSchedule({ sunrise, sunset, nextSunrise, weekdayIndex, timezone }) {
  const startIndex = WEEKDAY_GOWRI_START_INDEX[weekdayIndex];
  const dayMs   = sunset.toMillis()      - sunrise.toMillis();    // actual day length
  const nightMs = nextSunrise.toMillis() - sunset.toMillis();     // actual night length
  const dayGowriMs   = dayMs   / 8;
  const nightGowriMs = nightMs / 8;

  const gowri = [];
  // 8 day sections — proportional to actual day length
  for (let i = 0; i < 8; i++) {
    const start = DateTime.fromMillis(Math.round(sunrise.toMillis() + dayGowriMs * i),       { zone: timezone });
    const end   = DateTime.fromMillis(Math.round(sunrise.toMillis() + dayGowriMs * (i + 1)), { zone: timezone });
    gowri.push({
      index: i + 1, period: 'day',
      start: start.toISO({ suppressMilliseconds: true }),
      end:   end.toISO({ suppressMilliseconds: true }),
      startLabel: start.toFormat('hh:mm:ss a'),
      endLabel:   end.toFormat('hh:mm:ss a'),
      type: GOWRI_DAY_TYPES[(startIndex + i) % 8],
    });
  }
  // 8 night sections — proportional to actual night length
  for (let i = 0; i < 8; i++) {
    const start = DateTime.fromMillis(Math.round(sunset.toMillis() + nightGowriMs * i),       { zone: timezone });
    const end   = DateTime.fromMillis(Math.round(sunset.toMillis() + nightGowriMs * (i + 1)), { zone: timezone });
    gowri.push({
      index: i + 9, period: 'night',
      start: start.toISO({ suppressMilliseconds: true }),
      end:   end.toISO({ suppressMilliseconds: true }),
      startLabel: start.toFormat('hh:mm:ss a'),
      endLabel:   end.toFormat('hh:mm:ss a'),
      type: GOWRI_NIGHT_TYPES[(startIndex + 4 + i) % 8], // night starts 4 positions ahead; uses swapped cycle
    });
  }
  return gowri;
}


export const activityLabelMap = Object.fromEntries(
  activityOptions.map((activity) => [activity.key, activity]),
);

export const relationLabelMap = Object.fromEntries(
  relationOptions.map((relation, index) => [index, relation]),
);

export const effectLabelMap = Object.fromEntries(
  effectOptions.map((effect, index) => [index, effect]),
);

function parseRow(line) {
  return line.split(',').map((value) => Number(value));
}

async function loadRows() {
  if (cachedRows) {
    return cachedRows;
  }

  const raw = await readFile(csvPath, 'utf8');
  const lines = raw.replace(/^\uFEFF/, '').trim().split(/\r?\n/);
  const rows = [];
  const index = new Map();

  for (let lineIndex = 1; lineIndex < lines.length; lineIndex += 1) {
    const line = lines[lineIndex].trim();
    if (!line) {
      continue;
    }

    const values = parseRow(line);
    if (values.length < 14 || values.some((value) => Number.isNaN(value))) {
      continue;
    }

    rows.push(values);

    const [weekdayIndex, pakshaIndex, dayNightIndex, birdIndex] = values;
    const key = `${weekdayIndex}-${pakshaIndex}-${dayNightIndex}-${birdIndex}`;
    if (!index.has(key)) {
      index.set(key, []);
    }
    index.get(key).push(values);
  }

  cachedRows = rows;
  cachedIndex = index;
  return rows;
}

async function fetchJsonWithCurl(url) {
  const { stdout, stderr } = await execFileAsync('curl', ['-sL', url], {
    maxBuffer: 5 * 1024 * 1024,
  });

  if (!stdout) {
    throw new Error(stderr || 'Empty response');
  }

  return JSON.parse(stdout);
}

export async function ensurePanchaPakshiDataLoaded() {
  await loadRows();
  return {
    rowCount: cachedRows.length,
    keyCount: cachedIndex.size,
  };
}

export function formatLocationLabel(location) {
  const parts = [location.name];
  if (location.admin1 && location.admin1 !== location.name) {
    parts.push(location.admin1);
  }
  if (location.country) {
    parts.push(location.country);
  }
  return parts.filter(Boolean).join(', ');
}

export async function searchPlaces(query) {
  const term = String(query || '').trim();
  if (term.length < 2) {
    return [];
  }

  const url = new URL('https://geocoding-api.open-meteo.com/v1/search');
  url.searchParams.set('name', term);
  url.searchParams.set('count', '8');
  url.searchParams.set('language', 'en');

  const data = await fetchJsonWithCurl(url.toString());

  return (data.results || []).map((item) => ({
    id: item.id,
    label: formatLocationLabel(item),
    name: item.name,
    admin1: item.admin1 || '',
    country: item.country || '',
    countryCode: item.country_code || '',
    latitude: item.latitude,
    longitude: item.longitude,
    timezone: item.timezone,
  }));
}

export async function fetchAstronomy({ latitude, longitude, date, timezone }) {
  const responseZone = timezone || 'UTC';
  const day     = DateTime.fromISO(date, { zone: responseZone });
  const nextDay = day.plus({ days: 1 });

  // Compute locally with SunCalc — no external API calls needed
  const todayTimes    = SunCalc.getTimes(day.toJSDate(),     latitude, longitude);
  const nextDayTimes  = SunCalc.getTimes(nextDay.toJSDate(), latitude, longitude);

  const sunrise    = DateTime.fromJSDate(todayTimes.sunrise,   { zone: 'utc' }).setZone(responseZone);
  const sunset     = DateTime.fromJSDate(todayTimes.sunset,    { zone: 'utc' }).setZone(responseZone);
  const nextSunrise = DateTime.fromJSDate(nextDayTimes.sunrise, { zone: 'utc' }).setZone(responseZone);

  if (!sunrise.isValid || !sunset.isValid || !nextSunrise.isValid) {
    throw new Error('Sunrise/sunset data was incomplete for this date');
  }

  const dayMinutes   = sunset.diff(sunrise,     'minutes').minutes;
  const nightMinutes = nextSunrise.diff(sunset, 'minutes').minutes;

  return {
    timezone: responseZone,
    timezoneAbbreviation: responseZone,
    sunrise,
    sunset,
    nextSunrise,
    dayMinutes,
    nightMinutes,
  };
}

export function resolvePaksha(date, timezone, longitude, latitude, mode = 'auto') {
  if (mode === 'bright' || mode === 'dark') {
    return mode;
  }

  const responseZone = timezone || 'UTC';
  const dayStart = DateTime.fromISO(date, { zone: responseZone });
  const sunTimes = SunCalc.getTimes(dayStart.toJSDate(), latitude, longitude);
  const sunrise = DateTime.fromJSDate(sunTimes.sunrise).setZone(responseZone);
  const sunset = DateTime.fromJSDate(sunTimes.sunset).setZone(responseZone);

  // Core Rule: 24 minutes (1 Nazhigai) after sunrise/sunset
  const checkDayPoint = sunrise.plus({ minutes: 24 }).toJSDate();
  const checkNightPoint = sunset.plus({ minutes: 24 }).toJSDate();

  const dayIllumination = SunCalc.getMoonIllumination(checkDayPoint);
  const nightIllumination = SunCalc.getMoonIllumination(checkNightPoint);

  // phase 0-0.5 is bright, 0.5-1.0 is dark
  const dayPaksha = dayIllumination.phase < 0.5 ? 'bright' : 'dark';
  const nightPaksha = nightIllumination.phase < 0.5 ? 'bright' : 'dark';

  return { dayPaksha, nightPaksha };
}


function formatTimeLabel(dateTime) {
  return dateTime.toFormat('hh:mm:ss a');
}

function mapRow(row) {
  const [
    weekdayIndex,
    pakshaIndex,
    dayNightIndex,
    mainBirdIndex,
    mainActivityIndex,
    subBirdIndex,
    subActivityIndex,
    durationFactor,
    relationIndex,
    powerFactor,
    effectIndex,
    rating,
    paduBirdIndex,
    bharanaBirdIndex,
  ] = row;

  return {
    weekdayIndex,
    pakshaIndex,
    dayNightIndex,
    mainBirdIndex,
    mainBird: getBirdByZeroBasedIndex(mainBirdIndex),
    mainActivityIndex,
    mainActivity: activityOptions[mainActivityIndex],
    subBirdIndex,
    subBird: getBirdByZeroBasedIndex(subBirdIndex),
    subActivityIndex,
    subActivity: activityOptions[subActivityIndex],
    durationFactor,
    relationIndex,
    relation: getRelationByIndex(relationIndex),
    powerFactor,
    effectIndex,
    effect: getEffectByIndex(effectIndex),
    rating,
    paduBirdIndex,
    paduBird: getBirdByZeroBasedIndex(paduBirdIndex),
    bharanaBirdIndex,
    bharanaBird: getBirdByZeroBasedIndex(bharanaBirdIndex),
  };
}

function buildYamaRows(rows, { startTime, endTime, timezone, yamaIndex, birdId, palangalList = [], paksha, intrinsicStrength, direction }) {
  const yamaDurationMs = endTime.toMillis() - startTime.toMillis();
  const yamaDurationMinutes = yamaDurationMs / 60000;
  const mappedRows = rows.map(mapRow);
  const mainRow = mappedRows[0];
  const mainActivityKey = mainRow.mainActivity?.key;
  const mainFactor = activityStrengthFactors[mainActivityKey] || 1;

  const parent = {
    index: yamaIndex + 1,
    start: startTime.toISO({ suppressMilliseconds: true }),
    end: endTime.toISO({ suppressMilliseconds: true }),
    startLabel: formatTimeLabel(startTime),
    endLabel: formatTimeLabel(endTime),
    durationMinutes: Math.round(yamaDurationMinutes),
    mainBird: mainRow.mainBird,
    mainActivity: mainRow.mainActivity,
    special:
      mainRow.mainActivity?.key === 'ruling'
        ? { key: 'nectar', label: 'Nectar' }
        : mainRow.mainActivity?.key === 'dying'
          ? { key: 'poison', label: 'Poison' }
          : null,
    paduBird: mainRow.paduBird,
    bharanaBird: mainRow.bharanaBird,
    direction,
  };


  const childRows = [];
  let cursor = startTime;
  mappedRows.forEach((row, index) => {
    const subIdx = index + 1;
    const durationMs = yamaDurationMs * row.durationFactor;
    const roundedCursor = DateTime.fromMillis(Math.round(cursor.toMillis()), { zone: timezone });
    const nextCursor =
      index === mappedRows.length - 1
        ? endTime
        : DateTime.fromMillis(Math.round(cursor.toMillis() + durationMs), { zone: timezone });

    // Look up the best palan
    let bestPalan = '';
    let maxWeight = -1;

    for (const p of palangalList) {
      if (p.activityKey !== row.subActivity?.key) continue;
      if (p.relationKey !== row.relation?.key) continue;

      let weight = 0;
      if (p.effectKey) {
        if (p.effectKey === row.effect?.key) weight += 10;
        else continue;
      }
      if (p.birdId) {
        if (Number(p.birdId) === Number(birdId)) weight += 20;
        else continue;
      }
      if (p.yamaIndex) {
        if (Number(p.yamaIndex) === yamaIndex + 1) weight += 5;
        else continue;
      }
      if (p.subIndex) {
        if (Number(p.subIndex) === subIdx) weight += 5;
        else continue;
      }

      if (weight > maxWeight) {
        maxWeight = weight;
        bestPalan = p.text;
      }
    }

    const subActivityKey = row.subActivity?.key;
    const subFactor = activityStrengthFactors[subActivityKey] || 1;
    const strengthPercentage = intrinsicStrength * mainFactor * subFactor;

    childRows.push({
      index: subIdx,
      start: roundedCursor.toISO({ suppressMilliseconds: true }),
      end: nextCursor.toISO({ suppressMilliseconds: true }),
      startLabel: formatTimeLabel(roundedCursor),
      endLabel: formatTimeLabel(nextCursor),
      durationMinutes: Math.max(1, Math.round(durationMs / 60000)),
      bird: row.subBird,
      direction: birdDirections[paksha]?.[row.subBird?.id],
      activity: row.subActivity,
      relation: row.relation,
      effect: row.effect,
      powerFactor: row.powerFactor,
      rating: row.rating,
      palan: bestPalan,
      strength: strengthPercentage.toFixed(2),
    });


    cursor = nextCursor;
  });

  return {
    ...parent,
    subRows: childRows,
  };
}

function getRowsForKey({ weekdayIndex, pakshaIndex, dayNightIndex, birdIndex }) {
  const key = `${weekdayIndex}-${pakshaIndex}-${dayNightIndex}-${birdIndex}`;
  return cachedIndex?.get(key) || [];
}

function groupIntoYamas(rows) {
  const grouped = [];
  for (let i = 0; i < rows.length; i += 5) {
    grouped.push(rows.slice(i, i + 5));
  }
  return grouped;
}

export async function buildPanchaPakshiSchedule({
  date,
  latitude,
  longitude,
  timezone,
  birdId,
  pakshaMode = 'auto',
  slim = false,   // skip yamas, horai, gowri — for range/special-periods-only queries
}) {
  await loadRows();

  // Build palangal list (skip in slim mode)
  const palangalList = slim ? [] : await getPalangal();

  const astronomy = await fetchAstronomy({
    latitude,
    longitude,
    date,
    timezone,
  });

  const { dayPaksha, nightPaksha } = resolvePaksha(date, astronomy.timezone, longitude, latitude, pakshaMode);
  const dayPakshaIndex = dayPaksha === 'bright' ? 0 : 1;
  const nightPakshaIndex = nightPaksha === 'bright' ? 0 : 1;

  const weekdayIndex = DateTime.fromISO(date, { zone: astronomy.timezone }).weekday % 7;
  const bird = getBirdById(birdId);

  const birdStrengthData = birdIntrinsicStrengths;
  const dayIntrinsic = birdStrengthData[dayPaksha][birdId];
  const nightIntrinsic = birdStrengthData[nightPaksha][birdId];

  const dayDirection = birdDirections[dayPaksha][birdId];
  const nightDirection = birdDirections[nightPaksha][birdId];

  const dayRows = getRowsForKey({
    weekdayIndex,
    pakshaIndex: dayPakshaIndex,
    dayNightIndex: 0,
    birdIndex: bird.id - 1,
  });
  const nightRows = getRowsForKey({
    weekdayIndex,
    pakshaIndex: nightPakshaIndex,
    dayNightIndex: 1,
    birdIndex: bird.id - 1,
  });


  const weekday = getWeekdayByIndex(weekdayIndex);
  const dayPakshaLabel = getPakshaByKey(dayPaksha);
  const nightPakshaLabel = getPakshaByKey(nightPaksha);

  const specialPeriods = calculateSpecialPeriods({
    sunrise: astronomy.sunrise,
    sunset: astronomy.sunset,
    weekdayIndex,
    timezone: astronomy.timezone,
  });

  // Slim mode: return only the lightweight fields (no yamas, horai, gowri)
  if (slim) {
    return {
      date,
      weekday,
      bird,
      paksha: {
        day:   { key: dayPaksha,   label: dayPakshaLabel.label,   tamil: dayPakshaLabel.tamil,   direction: dayDirection },
        night: { key: nightPaksha, label: nightPakshaLabel.label, tamil: nightPakshaLabel.tamil, direction: nightDirection },
      },
      specialPeriods,
    };
  }

  if (dayRows.length < 25 || nightRows.length < 25) {
    throw new Error('Pancha Pakshi data was incomplete for the requested combination');
  }

  const dayYamaDurationMs = 145 * 60 * 1000; // Fixed 2 hours 25 minutes per jamam from sunrise
  const nightYamaDurationMs =
    (astronomy.nextSunrise.toMillis() - astronomy.sunset.toMillis()) / 5;

  const dayYamas = groupIntoYamas(dayRows).map((rows, index) => {
    const start = DateTime.fromMillis(
      Math.round(astronomy.sunrise.toMillis() + dayYamaDurationMs * index),
      { zone: astronomy.timezone },
    );
    const end = DateTime.fromMillis(
      Math.round(astronomy.sunrise.toMillis() + dayYamaDurationMs * (index + 1)),
      { zone: astronomy.timezone },
    );
    return buildYamaRows(rows, {
      startTime: start, endTime: end, timezone: astronomy.timezone,
      yamaIndex: index, birdId, palangalList,
      paksha: dayPaksha, intrinsicStrength: dayIntrinsic, direction: dayDirection,
    });
  });

  const nightYamas = groupIntoYamas(nightRows).map((rows, index) => {
    const start = DateTime.fromMillis(
      Math.round(astronomy.sunset.toMillis() + nightYamaDurationMs * index),
      { zone: astronomy.timezone },
    );
    const end =
      index === 4
        ? astronomy.nextSunrise
        : DateTime.fromMillis(
            Math.round(astronomy.sunset.toMillis() + nightYamaDurationMs * (index + 1)),
            { zone: astronomy.timezone },
          );
    return buildYamaRows(rows, {
      startTime: start, endTime: end, timezone: astronomy.timezone,
      yamaIndex: index, birdId, palangalList,
      paksha: nightPaksha, intrinsicStrength: nightIntrinsic, direction: nightDirection,
    });
  });

  return {
    date,
    timezone: astronomy.timezone,
    timezoneAbbreviation: astronomy.timezoneAbbreviation,
    location: { latitude, longitude },
    weekday,
    bird,
    paksha: {
      day:   { key: dayPaksha,   label: dayPakshaLabel.label,   tamil: dayPakshaLabel.tamil,   direction: dayDirection },
      night: { key: nightPaksha, label: nightPakshaLabel.label, tamil: nightPakshaLabel.tamil, direction: nightDirection },
    },
    astronomy: {
      sunrise:    astronomy.sunrise.toISO({ suppressMilliseconds: true }),
      sunset:     astronomy.sunset.toISO({ suppressMilliseconds: true }),
      nextSunrise: astronomy.nextSunrise.toISO({ suppressMilliseconds: true }),
      dayMinutes: astronomy.dayMinutes,
      nightMinutes: astronomy.nightMinutes,
      dayYamaMinutes: astronomy.dayMinutes / 5,
      nightYamaMinutes: astronomy.nightMinutes / 5,
    },
    dayYamas,
    nightYamas,
    horai: calculateHoraiSchedule({
      sunrise: astronomy.sunrise, sunset: astronomy.sunset,
      nextSunrise: astronomy.nextSunrise, weekdayIndex, timezone: astronomy.timezone,
    }),
    specialPeriods,
    gowri: calculateGowriSchedule({
      sunrise: astronomy.sunrise, sunset: astronomy.sunset,
      nextSunrise: astronomy.nextSunrise, weekdayIndex, timezone: astronomy.timezone,
    }),
  };
}

export async function getPreviewMetadata({ date, latitude, longitude, timezone, birdId, pakshaMode }) {
  const schedule = await buildPanchaPakshiSchedule({
    date,
    latitude,
    longitude,
    timezone,
    birdId,
    pakshaMode,
  });

  return {
    bird: schedule.bird,
    weekday: schedule.weekday,
    paksha: schedule.paksha,
    astronomy: schedule.astronomy,
    timezone: schedule.timezone,
  };
}
