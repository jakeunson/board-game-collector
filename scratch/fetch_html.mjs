const res = await fetch('https://boardlife.co.kr/game/1421');
const text = await res.text();
import fs from 'fs';
fs.writeFileSync('scratch/boardlife_1421.html', text);
console.log('Saved HTML.');
