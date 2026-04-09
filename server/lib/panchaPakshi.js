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

export function resolvePaksha(date, timezone, mode = 'auto') {
  if (mode === 'bright' || mode === 'dark') {
    return mode;
  }

  const localNoon = DateTime.fromISO(date, { zone: timezone })
    .set({ hour: 12, minute: 0, second: 0, millisecond: 0 })
    .toJSDate();
  const illumination = SunCalc.getMoonIllumination(localNoon);
  return illumination.phase < 0.5 ? 'bright' : 'dark';
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

function buildYamaRows(rows, { startTime, endTime, timezone, yamaIndex, birdId, palangalList = [] }) {
  const yamaDurationMs = endTime.toMillis() - startTime.toMillis();
  const yamaDurationMinutes = yamaDurationMs / 60000;
  const mappedRows = rows.map(mapRow);
  const mainRow = mappedRows[0];

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

  const paksha = resolvePaksha(date, astronomy.timezone, pakshaMode);
  const pakshaIndex = paksha === 'bright' ? 0 : 1;
  const weekdayIndex = DateTime.fromISO(date, { zone: astronomy.timezone }).weekday % 7;
  const bird = getBirdById(birdId);

  const dayRows = getRowsForKey({
    weekdayIndex,
    pakshaIndex,
    dayNightIndex: 0,
    birdIndex: bird.id - 1,
  });
  const nightRows = getRowsForKey({
    weekdayIndex,
    pakshaIndex,
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
    });
  });

  const weekday = getWeekdayByIndex(weekdayIndex);
  const pakshaLabel = getPakshaByKey(paksha);

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
      key: paksha,
      label: pakshaLabel.label,
      tamil: pakshaLabel.tamil,
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
