
const fs = require('fs');
const path = require('path');

const enPath = path.resolve('d:/AI-KILLS/edu-vibe-code-coaching/src/locales/en/translation.json');
const viPath = path.resolve('d:/AI-KILLS/edu-vibe-code-coaching/src/locales/vi/translation.json');

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const vi = JSON.parse(fs.readFileSync(viPath, 'utf8'));

function getKeys(obj, prefix = '') {
  let keys = [];
  for (let key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      keys = keys.concat(getKeys(obj[key], prefix + key + '.'));
    } else {
      keys.push(prefix + key);
    }
  }
  return keys;
}

const enKeys = getKeys(en);
const viKeys = getKeys(vi);

const missingInEn = viKeys.filter(k => !enKeys.includes(k));
const missingInVi = enKeys.filter(k => !viKeys.includes(k));

console.log('Missing in EN:', JSON.stringify(missingInEn, null, 2));
console.log('Missing in VI:', JSON.stringify(missingInVi, null, 2));
