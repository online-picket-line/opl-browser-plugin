const https = require('https');

// Test the current key
const apiKey = 'opl_1f05c345fe63a8fc6a374a176d6cea6c36fcba2ba60ed275503fe3f5629c8828';
console.log('Key length:', apiKey.length);
console.log('Key:', apiKey);

// Also test what the obfuscated key produces
const _p1 = 'b3Bs'; // Base64 for 'opl'
const _p2 = () => String.fromCharCode(95); // '_'
const _p3 = () => [49, 102, 48, 53].map(x => String.fromCharCode(x)).join(''); // '1f05'
const _p4 = () => { const c = [89, 122, 77, 48, 89, 122, 77, 48, 78, 87, 90, 108, 78, 106, 77, 61]; return String.fromCharCode(...c); }; // Base64 for 'c345fe63'
const _p5 = () => {
  const x = [97, 56, 102, 99, 54, 97, 51, 55];
  return Buffer.from(String.fromCharCode(...x)).toString('base64');
}; // Base64 for 'a8fc6a37'
const _p6 = () => Buffer.from('4a17' + '6d6c').toString('base64'); // Base64 for '4a176d6c'
const _p8 = 'ZWE2YzM2ZmNiYTJiYTYwZWQyNzU1MDNmZTNmNTYyOWM4ODI4'; // Final part

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
