import fs from 'fs';
const text = fs.readFileSync('scratch/boardlife_1421.html', 'utf-8');

const searchAndPrint = (keyword) => {
  const idx = text.indexOf(keyword);
  if (idx !== -1) {
    console.log(`\n--- Found '${keyword}' ---`);
    console.log(text.substring(Math.max(0, idx - 150), idx + 300));
  } else {
    console.log(`\n--- '${keyword}' not found ---`);
  }
};

searchAndPrint('전략게임');
searchAndPrint('고대');
searchAndPrint('핸드 관리');
searchAndPrint('출시');
