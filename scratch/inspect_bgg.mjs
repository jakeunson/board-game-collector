
import { proxyFetchJson } from '../src/utils/proxyFetch.js';

async function inspectBggJson(bggId) {
  const type = 'boardgame';
  const prodUrl = `https://api.geekdo.com/api/geekitems?objecttype=thing&subtype=${type}&objectid=${bggId}&ajax=1&nosession=1`;
  
  console.log(`BGG API Raw 데이터 확인 중: ${prodUrl}`);
  
  try {
    const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(prodUrl)}`);
    const data = await res.json();
    const contents = JSON.parse(data.contents);
    
    console.log('\n--- JSON 구조 (일부) ---');
    console.log(JSON.stringify(contents.item, null, 2).substring(0, 2000));
    
    if (contents.item && contents.item.stats) {
      console.log('\n--- Stats 데이터 ---');
      console.log(JSON.stringify(contents.item.stats, null, 2));
    } else {
      console.log('\nStats 데이터가 없습니다.');
    }
  } catch (err) {
    console.error('검사 중 오류 발생:', err);
  }
}

// 사용자가 요청한 '갤럭틱 크루즈' BGG ID 확인 필요. 
// 일단 Kariuchi가 나왔던 386561로 다시 확인.
inspectBggJson('386561');
