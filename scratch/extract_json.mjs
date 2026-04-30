import fs from 'fs';
const text = fs.readFileSync('scratch/boardlife_1421.html', 'utf-8');
const jsonLdMatch = text.match(/<script type="application\/ld\+json">\s*(.*?)\s*<\/script>/is);
if (jsonLdMatch) {
  console.log(JSON.parse(jsonLdMatch[1]));
} else {
  console.log('No JSON-LD found');
}
const releaseYearMatch = text.match(/출시.*?(\d{4})/is);
console.log('Year match:', releaseYearMatch);
