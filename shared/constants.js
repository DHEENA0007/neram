export const birdOptions = [
  {
    id: 1,
    key: 'vulture',
    label: 'Vulture',
    tamil: 'வல்லூறு',
  },
  {
    id: 2,
    key: 'owl',
    label: 'Owl',
    tamil: 'ஆந்தை',
  },
  {
    id: 3,
    key: 'crow',
    label: 'Crow',
    tamil: 'காகம்',
  },
  {
    id: 4,
    key: 'cock',
    label: 'Cock',
    tamil: 'கோழி',
  },
  {
    id: 5,
    key: 'peacock',
    label: 'Peacock',
    tamil: 'மயில்',
  },
];

export const activityOptions = [
  { key: 'ruling', label: 'Ruling', tamil: 'அரசு' },
  { key: 'eating', label: 'Eating', tamil: 'ஊன்' },
  { key: 'walking', label: 'Walking', tamil: 'நடை' },
  { key: 'sleeping', label: 'Sleeping', tamil: 'தூயில்' },
  { key: 'dying', label: 'Dying', tamil: 'சாவு' },
];

export const relationOptions = [
  { key: 'enemy', label: 'Enemy', tamil: 'பகை' },
  { key: 'same', label: 'Self', tamil: 'சுயம்' },
  { key: 'friend', label: 'Friend', tamil: 'நட்பு' },
];

export const effectOptions = [
  { key: 'very_bad', label: 'Very bad', tamil: 'மிக மோசம்' },
  { key: 'bad', label: 'Bad', tamil: 'மோசம்' },
  { key: 'average', label: 'Average', tamil: 'சாதாரணம்' },
  { key: 'good', label: 'Good', tamil: 'நல்லது' },
  { key: 'very_good', label: 'Very good', tamil: 'மிக நல்லது' },
];

export const weekdayOptions = [
  { index: 0, label: 'Sunday', tamil: 'ஞாயிறு' },
  { index: 1, label: 'Monday', tamil: 'திங்கள்' },
  { index: 2, label: 'Tuesday', tamil: 'செவ்வாய்' },
  { index: 3, label: 'Wednesday', tamil: 'புதன்' },
  { index: 4, label: 'Thursday', tamil: 'வியாழன்' },
  { index: 5, label: 'Friday', tamil: 'வெள்ளி' },
  { index: 6, label: 'Saturday', tamil: 'சனி' },
];

export const pakshaOptions = [
  { key: 'bright', label: 'Bright Half', tamil: 'வளர்பிறை' },
  { key: 'dark', label: 'Dark Half', tamil: 'தேய்பிறை' },
];

export function getBirdById(id) {
  return birdOptions.find((bird) => bird.id === Number(id)) ?? birdOptions[0];
}

export function getActivityByKey(key) {
  return activityOptions.find((item) => item.key === key);
}

export function getRelationByIndex(index) {
  return relationOptions[index] ?? relationOptions[0];
}

export function getEffectByIndex(index) {
  return effectOptions[index] ?? effectOptions[0];
}

export function getWeekdayByIndex(index) {
  return weekdayOptions.find((item) => item.index === Number(index)) ?? weekdayOptions[0];
}

export function getPakshaByKey(key) {
  return pakshaOptions.find((item) => item.key === key) ?? pakshaOptions[0];
}

