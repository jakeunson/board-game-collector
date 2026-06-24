const fs = require('fs');
const https = require('https');

const USERNAME = 'silence1003';
const TOKEN = '20e80084-8f01-4d9e-98f1-977374d89ac6';
const URL = `https://boardgamegeek.com/xmlapi2/collection?username=${USERNAME}&own=1`;

// 1. 현재 등록된 게임 ID 목록 가져오기
function getRegisteredIds() {
  try {
    const content = fs.readFileSync('added_games_list.md', 'utf8');
    const ids = new Set();
    const lines = content.split('\n');
    lines.forEach(line => {
      const match = line.match(/\|\s*\d+\s*\|\s*.*?\s*\|\s*.*?\s*\|\s*(\d+)\s*\|/);
      if (match) {
        ids.add(match[1]);
      }
    });
    return ids;
  } catch (err) {
    console.error('등록된 게임 목록 읽기 실패:', err.message);
    return new Set();
  }
}

const registeredIds = getRegisteredIds();

const options = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Authorization': `Bearer ${TOKEN}`
  }
};

function fetchCollection(url, retries = 3) {
  console.log(`${USERNAME}님의 컬렉션 데이터 요청 중...`);
  
  https.get(url, options, (res) => {
    if (res.statusCode === 202) {
      console.log('BGG 서버가 데이터를 준비 중입니다(202). 10초 후 재시도합니다...');
      setTimeout(() => fetchCollection(url, retries), 10000);
      return;
    }

    if (res.statusCode !== 200) {
      console.log(`오류 발생: HTTP ${res.statusCode}`);
      return;
    }

    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      parseAndSave(data);
    });
  }).on('error', (err) => {
    console.error('Error:', err.message);
  });
}

function parseAndSave(xml) {
  const items = [];
  const itemRegex = /<item\s+[^>]*objectid="(\d+)"[^>]*>([\s\S]*?)<\/item>/g;
  const nameRegex = /<name[^>]*>(.*?)<\/name>/;
  const yearRegex = /<yearpublished>(.*?)<\/yearpublished>/;
  
  let itemMatch;
  while ((itemMatch = itemRegex.exec(xml)) !== null) {
    const id = itemMatch[1];
    const content = itemMatch[2];
    
    const nameMatch = nameRegex.exec(content);
    const yearMatch = yearRegex.exec(content);
    
    if (nameMatch) {
      items.push({
        id,
        name: nameMatch[1],
        year: yearMatch ? yearMatch[1] : 'N/A'
      });
    }
  }

  if (items.length === 0) {
    console.log('추출된 게임이 없습니다.');
    return;
  }

  let md = `# BGG Collection - ${USERNAME}\n\n`;
  md += `총 ${items.length}개의 게임을 보유 중입니다. (✅: 등록됨, ❌: 미등록)\n\n`;
  md += `| 번호 | 등록 | 게임 제목 | 출시년도 | BGG ID | 링크 |\n`;
  md += `| :--- | :---: | :--- | :--- | :--- | :--- |\n`;
  
  items.forEach((item, index) => {
    const isRegistered = registeredIds.has(item.id);
    const statusIcon = isRegistered ? '✅' : '❌';
    md += `| ${index + 1} | ${statusIcon} | **${item.name}** | ${item.year} | ${item.id} | [Link](https://boardgamegeek.com/boardgame/${item.id}) |\n`;
  });

  fs.writeFileSync('bgg_collection.md', md);
  console.log(`성공! 'bgg_collection.md' 파일이 업데이트되었습니다. (총 ${items.length}개)`);
}

fetchCollection(URL);
