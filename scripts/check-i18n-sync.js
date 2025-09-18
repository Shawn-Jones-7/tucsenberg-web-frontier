// Basic i18n sync check for messages/en.json vs messages/zh.json
// Usage: node scripts/check-i18n-sync.js

/* eslint-disable no-console */
const fs = require('fs');

function flat(obj, pfx = '', out = {}) {
  for (const [k, v] of Object.entries(obj)) {
    const key = pfx ? `${pfx}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) flat(v, key, out);
    else out[key] = true;
  }
  return out;
}

try {
  const en = JSON.parse(fs.readFileSync('messages/en.json', 'utf8'));
  const zh = JSON.parse(fs.readFileSync('messages/zh.json', 'utf8'));

  const enKeys = Object.keys(flat(en));
  const zhKeys = Object.keys(flat(zh));

  const missingInZh = enKeys.filter((k) => !zhKeys.includes(k));
  const extraInZh = zhKeys.filter((k) => !enKeys.includes(k));

  if (missingInZh.length || extraInZh.length) {
    console.error('i18n sync failed', {
      missingInZh,
      extraInZh,
    });
    process.exit(1);
  }

  console.log('i18n sync OK');
} catch (err) {
  console.error('i18n:sync:check error', err);
  process.exit(1);
}

