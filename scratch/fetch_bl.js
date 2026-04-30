const res = await fetch('https://boardlife.co.kr/game/1421');
const data = await res.text();

const findContext = (keyword, length = 100) => {
  const idx = data.indexOf(keyword);
  if (idx !== -1) {
    console.log(`\n--- ${keyword} Context ---`);
    console.log(data.substring(Math.max(0, idx - 100), idx + length));
  } else {
    console.log(`\n--- ${keyword} Not Found ---`);
  }
};

findContext('출시년도', 200);
findContext('출시', 200);
findContext('카테고리', 600);
findContext('테마', 600);
findContext('진행방식', 600);
