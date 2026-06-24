
import { bggService } from '../src/utils/bggService.js';

// Node 환경에서 Vite의 import.meta.env 모사
if (typeof process !== 'undefined') {
  globalThis.import = globalThis.import || {};
  // 실제로는 bggService.js 내의 import.meta.env를 제어하기 어렵지만, 
  // bggService는 토큰이 없어도 공개 데이터를 가져올 수 있습니다.
}

async function testGalacticCruise() {
  // Galactic Cruise BGG ID: 386561
  const bggId = '386561';
  console.log(`Galactic Cruise (BGG ID: ${bggId}) 데이터 수집 테스트 시작...`);
  
  try {
    const data = await bggService.getGameDetails(bggId);
    
    if (data) {
      console.log('\n--- 수집된 데이터 ---');
      console.log(`이름: ${data.name}`);
      console.log(`출시년도: ${data.year}`);
      console.log(`평점: ${data.rating}`);
      console.log(`난이도: ${data.weight}`);
      console.log(`최적 인원: ${data.bestPlayerCount}인`);
      console.log(`설명 요약: ${data.description.substring(0, 100)}...`);
    } else {
      console.log('\n데이터를 가져오지 못했습니다. (응답이 null임)');
    }
  } catch (err) {
    console.error('\n테스트 도중 오류 발생:', err);
  }
}

testGalacticCruise();
