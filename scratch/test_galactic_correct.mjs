
import { bggService } from '../src/utils/bggService.js';

async function testGalacticCruise() {
  const bggId = '391137'; // Correct ID for Galactic Cruise
  console.log(`Galactic Cruise (BGG ID: ${bggId}) 데이터 수집 테스트 시작...`);
  
  try {
    const data = await bggService.getGameDetails(bggId);
    
    if (data) {
      console.log('\n--- 수집된 데이터 ---');
      console.log(`이름: ${data.name}`);
      console.log(`평점: ${data.rating}`);
      console.log(`난이도: ${data.weight}`);
    } else {
      console.log('\n데이터를 가져오지 못했습니다.');
    }
  } catch (err) {
    console.error('\n오류 발생:', err);
  }
}

testGalacticCruise();
