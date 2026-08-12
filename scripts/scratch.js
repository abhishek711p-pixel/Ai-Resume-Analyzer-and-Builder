const crypto = require('crypto');
const buffer = crypto.randomBytes(5 * 1024 * 1024); // 5MB
const rawString = buffer.toString('binary');

console.time('match');
const matches = rawString.match(/\(([^()]{3,})\)/g) || [];
console.timeEnd('match');

console.time('replace1');
let cleanText = rawString.replace(/[^\x20-\x7E\n]/g, ' ');
console.timeEnd('replace1');

console.time('replace2');
cleanText = cleanText.replace(/\s+/g, ' ');
console.timeEnd('replace2');
