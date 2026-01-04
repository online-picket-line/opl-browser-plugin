const https = require('https');

// Test the current key
const apiKey = 'opl_8677beaeb06c599997ec46f9891036a37a81bee1c32d32cbb4398ab344b1b7cf';
console.log('Key length:', apiKey.length);
console.log('Key:', apiKey);

// Also test what the obfuscated key produces
const _p1 = 'b3Bs'; // Base64 for 'opl'
const _p2 = () => String.fromCharCode(95); // '_'
const _p3 = () => [56, 54, 55, 55].map(x => String.fromCharCode(x)).join(''); // '8677'
const _p4 = () => { const c = [89, 109, 86, 104, 90, 87, 73, 119, 78, 109, 77, 61]; return String.fromCharCode(...c); }; // Base64 for 'beaeb06c'
const _p5 = () => {
  const x = [53, 57, 57, 57, 57, 55, 101, 99];
  return Buffer.from(String.fromCharCode(...x)).toString('base64');
}; // Base64 for '599997ec'
const _p6 = () => Buffer.from('46f9' + '8910').toString('base64'); // Base64 for '46f98910'
const _p8 = 'MzZhMzdhODFiZWUxYzMyZDMyY2JiNDM5OGFiMzQ0YjFiN2Nm'; // Final part

const atob = (s) => Buffer.from(s, 'base64').toString();

const parts = [
  atob(_p1),
  _p2(),
  _p3(),
  atob(_p4()),
  atob(_p5()),
  atob(_p6()),
  atob(_p8)
];

console.log('Parts:', parts);
const assembled = parts.join('');
console.log('Assembled key:', assembled);
console.log('Assembled length:', assembled.length);
console.log('Match:', assembled === apiKey);

const url = 'https://onlinepicketline.com/api/blocklist.json?format=extension&includeInactive=false';

const options = {
  headers: {
    'Accept': 'application/json',
    'X-API-Key': apiKey,
    'User-Agent': 'OPL-Extension/1.0.0'
  }
};

console.log('\nTesting API key...');
https.get(url, options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    if (res.statusCode === 200) {
      try {
        const parsed = JSON.parse(data);
        console.log('Success! Got', parsed.length || Object.keys(parsed).length, 'items');
        console.log('First item:', JSON.stringify(parsed[0] || parsed, null, 2).substring(0, 500));
      } catch (e) {
        console.log('Response (first 500 chars):', data.substring(0, 500));
      }
    } else {
      console.log('Error response:', data);
    }
  });
}).on('error', (e) => {
  console.error(`Error: ${e.message}`);
});
