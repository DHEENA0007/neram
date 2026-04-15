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
  const daySlotDurationMs = (sunset.toMillis() - sunrise.toMillis()) / 12;
  const nightSlotDurationMs = (nextSunrise.toMillis() - sunset.toMillis()) / 12;
  const startIndex = WEEKDAY_HORAI_START_INDEX[weekdayIndex];

  const horai = [];

  // Day Horas
  for (let i = 0; i < 12; i++) {
    const start = DateTime.fromMillis(Math.round(sunrise.toMillis() + daySlotDurationMs * i), { zone: timezone });
    const end = DateTime.fromMillis(Math.round(sunrise.toMillis() + daySlotDurationMs * (i + 1)), { zone: timezone });
    const planet = HORAI_SEQUENCE[(startIndex + i) % 7];
    horai.push({
      index: i + 1,
      period: 'day',
      start: start.toISO({ suppressMilliseconds: true }),
      end: end.toISO({ suppressMilliseconds: true }),
      startLabel: start.toFormat('hh:mm a'),
      endLabel: end.toFormat('hh:mm a'),
      planet,
    });
  }

  // Night Horas
  for (let i = 0; i < 12; i++) {
    const start = DateTime.fromMillis(Math.round(sunset.toMillis() + nightSlotDurationMs * i), { zone: timezone });
    const end = DateTime.fromMillis(Math.round(sunset.toMillis() + nightSlotDurationMs * (i + 1)), { zone: timezone });
    const planet = HORAI_SEQUENCE[(startIndex + 12 + i) % 7];
    horai.push({
      index: i + 13,
      period: 'night',
      start: start.toISO({ suppressMilliseconds: true }),
      end: end.toISO({ suppressMilliseconds: true }),
      startLabel: start.toFormat('hh:mm a'),
      endLabel: end.toFormat('hh:mm a'),
      planet,
    });
  }

  return horai;
}

const RAHU_KAALAM_PARTS = { 0: 8, 1: 2, 2: 7, 3: 5, 4: 6, 5: 4, 6: 3 };
const YAMAGANDAM_PARTS = { 0: 5, 1: 4, 2: 3, 3: 2, 4: 1, 5: 7, 6: 6 };
const KULIKAI_PARTS = { 0: 7, 1: 6, 2: 5, 3: 4, 4: 3, 5: 2, 6: 1 };

function calculateSpecialPeriods({ sunrise, sunset, weekdayIndex, timezone }) {
  const dayDurationMs = sunset.toMillis() - sunrise.toMillis();
  const partDurationMs = dayDurationMs / 8;

  const getPeriod = (partNumber) => {
    const start = DateTime.fromMillis(Math.round(sunrise.toMillis() + partDurationMs * (partNumber - 1)), { zone: timezone });
    const end = DateTime.fromMillis(Math.round(sunrise.toMillis() + partDurationMs * partNumber), { zone: timezone });
    return {
      start: start.toISO({ suppressMilliseconds: true }),
      end: end.toISO({ suppressMilliseconds: true }),
      startLabel: start.toFormat('hh:mm a'),
      endLabel: end.toFormat('hh:mm a'),
    };
  };

  return {
    rahu: getPeriod(RAHU_KAALAM_PARTS[weekdayIndex]),
    yamagandam: getPeriod(YAMAGANDAM_PARTS[weekdayIndex]),
    kulikai: getPeriod(KULIKAI_PARTS[weekdayIndex]),
  };
}

const GOWRI_TYPES = [
  { key: 'amritham', label: 'Amritham', tamil: 'அமிர்தம்', nature: 'good' },
  { key: 'siddham', label: 'Siddham', tamil: 'சித்தம்', nature: 'good' },
  { key: 'rogam', label: 'Rogam', tamil: 'ரோகம்', nature: 'bad' },
  { key: 'labham', label: 'Labham', tamil: 'லாபம்', nature: 'good' },
  { key: 'sugam', label: 'Sugam', tamil: 'சுகம்', nature: 'good' },
  { key: 'soram', label: 'Soram', tamil: 'சோரம்', nature: 'bad' },
  { key: 'dhanam', label: 'Dhanam', tamil: 'தனம்', nature: 'good' },
  { key: 'visham', label: 'Visham', tamil: 'விஷம்', nature: 'bad' },
];

const WEEKDAY_GOWRI_START_INDEX = {
  0: 6, // Sunday -> Dhanam
  1: 0, // Monday -> Amritham
  2: 1, // Tuesday -> Siddham
  3: 2, // Wednesday -> Rogam
  4: 3, // Thursday -> Labham
  5: 4, // Friday -> Sugam
  6: 5, // Saturday -> Soram
};

function calculateGowriSchedule({ sunrise, sunset, nextSunrise, weekdayIndex, timezone }) {
  const daySlotDurationMs = (sunset.toMillis() - sunrise.toMillis()) / 12;
  const nightSlotDurationMs = (nextSunrise.toMillis() - sunset.toMillis()) / 12;
  const startIndex = WEEKDAY_GOWRI_START_INDEX[weekdayIndex];

  const gowri = [];

  // Day Gowri
  for (let i = 0; i < 12; i++) {
    const start = DateTime.fromMillis(Math.round(sunrise.toMillis() + daySlotDurationMs * i), { zone: timezone });
    const end = DateTime.fromMillis(Math.round(sunrise.toMillis() + daySlotDurationMs * (i + 1)), { zone: timezone });
    const type = GOWRI_TYPES[(startIndex + i) % 8];
    gowri.push({
      index: i + 1,
      period: 'day',
      start: start.toISO({ suppressMilliseconds: true }),
      end: end.toISO({ suppressMilliseconds: true }),
      startLabel: start.toFormat('hh:mm a'),
      endLabel: end.toFormat('hh:mm a'),
      type,
    });
  }

  // Night Gowri
  for (let i = 0; i < 12; i++) {
    const start = DateTime.fromMillis(Math.round(sunset.toMillis() + nightSlotDurationMs * i), { zone: timezone });
    const end = DateTime.fromMillis(Math.round(sunset.toMillis() + nightSlotDurationMs * (i + 1)), { zone: timezone });
    const type = GOWRI_TYPES[(startIndex + 12 + i) % 8];
    gowri.push({
      index: i + 13,
      period: 'night',
      start: start.toISO({ suppressMilliseconds: true }),
      end: end.toISO({ suppressMilliseconds: true }),
      startLabel: start.toFormat('hh:mm a'),
      endLabel: end.toFormat('hh:mm a'),
      type,
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
  const day = DateTime.fromISO(date, { zone: responseZone });
  const nextDay = day.plus({ days: 1 }).toISODate();

  const [todayData, nextData] = await Promise.all([
    fetchJsonWithCurl(
      `https://api.sunrise-sunset.org/json?lat=${latitude}&lng=${longitude}&date=${day.toISODate()}&formatted=0`,
    ),
    fetchJsonWithCurl(
      `https://api.sunrise-sunset.org/json?lat=${latitude}&lng=${longitude}&date=${nextDay}&formatted=0`,
    ),
  ]);

  if (todayData.status !== 'OK' || nextData.status !== 'OK') {
    throw new Error('Sunrise/sunset data was incomplete for this date');
  }

  const sunrise = DateTime.fromISO(todayData.results?.sunrise, { zone: 'utc' }).setZone(responseZone);
  const sunset = DateTime.fromISO(todayData.results?.sunset, { zone: 'utc' }).setZone(responseZone);
  const nextSunrise = DateTime.fromISO(nextData.results?.sunrise, { zone: 'utc' }).setZone(responseZone);

  if (!sunrise.isValid || !sunset.isValid || !nextSunrise.isValid) {
    throw new Error('Sunrise/sunset data was incomplete for this date');
  }

  const dayMinutes = sunset.diff(sunrise, 'minutes').minutes;
  const nightMinutes = nextSunrise.diff(sunset, 'minutes').minutes;

  return {
    timezone: responseZone,
    timezoneAbbreviation: responseZone,
    sunrise,
    sunset,
    nextSunrise,
    dayMinutes,
    nightMinutes,
    raw: { todayData, nextData },
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
  return dateTime.toFormat('hh:mm a');
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
}) {
  await loadRows();

  // Build palangal list
  const palangalList = await getPalangal();

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


  if (dayRows.length < 25 || nightRows.length < 25) {
    throw new Error('Pancha Pakshi data was incomplete for the requested combination');
  }

  const dayYamaDurationMs = (astronomy.sunset.toMillis() - astronomy.sunrise.toMillis()) / 5;
  const nightYamaDurationMs =
    (astronomy.nextSunrise.toMillis() - astronomy.sunset.toMillis()) / 5;

  const dayYamas = groupIntoYamas(dayRows).map((rows, index) => {
    const start = DateTime.fromMillis(
      Math.round(astronomy.sunrise.toMillis() + dayYamaDurationMs * index),
      { zone: astronomy.timezone },
    );
    const end =
      index === 4
        ? astronomy.sunset
        : DateTime.fromMillis(
            Math.round(astronomy.sunrise.toMillis() + dayYamaDurationMs * (index + 1)),
            { zone: astronomy.timezone },
          );
    return buildYamaRows(rows, {
      startTime: start,
      endTime: end,
      timezone: astronomy.timezone,
      yamaIndex: index,
      birdId,
      palangalList,
      paksha: dayPaksha,
      intrinsicStrength: dayIntrinsic,
      direction: dayDirection,
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
      startTime: start,
      endTime: end,
      timezone: astronomy.timezone,
      yamaIndex: index,
      birdId,
      palangalList,
      paksha: nightPaksha,
      intrinsicStrength: nightIntrinsic,
      direction: nightDirection,
    });
  });


  const weekday = getWeekdayByIndex(weekdayIndex);
  const dayPakshaLabel = getPakshaByKey(dayPaksha);
  const nightPakshaLabel = getPakshaByKey(nightPaksha);


  return {
    date,
    timezone: astronomy.timezone,
    timezoneAbbreviation: astronomy.timezoneAbbreviation,
    location: {
      latitude,
      longitude,
    },
    weekday,
    bird,
    paksha: {
      day: {
        key: dayPaksha,
        label: dayPakshaLabel.label,
        tamil: dayPakshaLabel.tamil,
        direction: dayDirection,
      },
      night: {
        key: nightPaksha,
        label: nightPakshaLabel.label,
        tamil: nightPakshaLabel.tamil,
        direction: nightDirection,
      }
    },

    astronomy: {
      sunrise: astronomy.sunrise.toISO({ suppressMilliseconds: true }),
      sunset: astronomy.sunset.toISO({ suppressMilliseconds: true }),
      nextSunrise: astronomy.nextSunrise.toISO({ suppressMilliseconds: true }),
      dayMinutes: astronomy.dayMinutes,
      nightMinutes: astronomy.nightMinutes,
      dayYamaMinutes: astronomy.dayMinutes / 5,
      nightYamaMinutes: astronomy.nightMinutes / 5,
    },
    dayYamas,
    nightYamas,
    horai: calculateHoraiSchedule({
      sunrise: astronomy.sunrise,
      sunset: astronomy.sunset,
      nextSunrise: astronomy.nextSunrise,
      weekdayIndex,
      timezone: astronomy.timezone,
    }),
    specialPeriods: calculateSpecialPeriods({
      sunrise: astronomy.sunrise,
      sunset: astronomy.sunset,
      weekdayIndex,
      timezone: astronomy.timezone,
    }),
    gowri: calculateGowriSchedule({
      sunrise: astronomy.sunrise,
      sunset: astronomy.sunset,
      nextSunrise: astronomy.nextSunrise,
      weekdayIndex,
      timezone: astronomy.timezone,
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
