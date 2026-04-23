import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import https from 'https';
import { parseStringPromise } from 'xml2js';

const firebaseConfig = {
  apiKey: 'AIzaSyDMtnw__VjeaWM9UOxGzV12qdwdrfmzb10',
  authDomain: 'boardgame-collector.firebaseapp.com',
  projectId: 'boardgame-collector',
  storageBucket: 'boardgame-collector.firebasestorage.app',
  messagingSenderId: '352579868603',
  appId: '1:352579868603:web:bf79b902e2418ea850169e'
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Korean game name → BGG ID (curated list)
const NAME_TO_BGG_ID = {
  // Already updated (skip if image exists)
  '7 원더스': '68448',
  '7 원더스: 리더스': '89241',
  '7 원더스: 시티즈': '111661',
  '7 원더스 : 원더팩': '185399',
  '7 원더스: 대결': '173346',
  '세븐 원더스 대결': '173346',
  '아그리콜라': '31260',
  '글룸헤이븐: 사자의 턱': '291457',
  '캔버스': '295616',
  '캔버스: 리플렉션': '352515',
  '스페이스 크루': '284083',
  '스페이스 크루: 9번째 행성을 찾아서': '284083',
  '티츄': '215',
  '포뮬라 D': '37111',
  '포뮬라 D: 서킷 1': '72993',
  '포뮬라 D: 서킷 2': '83419',
  '포뮬라 D: 서킷 3': '127942',
  '포뮬라 D: 서킷 4': '127943',
  '도미니언: 바다': '40834',
  '도미니언: 번영': '65020',
  '도미니언: 길드를 위하여': '128664',
  '도미니언: 암흑의 시대': '116440',
  '도미니언: 장막 뒤의 사람들': '40841',
  '카르카손: 확장 1 - 여관과 대성당': '822',
  '카르카손: 확장 2 - 상인과 건축가': '2591',
  '카르카손: 확장 3 - 공주와 용': '27833',
  '카르카손: 확장 4 - 타워': '28011',
  '카르카손: 확장 5 - 수도원과 성주': '44455',
  '카르카손: 확장 6 - 왕과 정찰병': '25118',
  '카르카손: 확장 8 - 다리와 성바자르': '85694',
  '티켓 투 라이드: 유럽': '14996',
  '티켓 투 라이드: USA 1910': '37806',
  '석기시대: 확장': '66910',
  '스몰 월드: 귀부인': '123540',
  '스몰 월드: 설화와 전설': '100658',
  '스몰 월드 언더그라운드': '116139',
  '상트페테르부르크': '9217',
  '상트 페테르부르크: 새로운 사회와 향연': '152452',
  '파워 그리드': '2651',
  '파워 그리드: 새로운 발전소 카드': '82527',
  '파워 그리드: 확장 - 로봇': '200784',
  '카탄: 항해사': '325',
  '카탄: 도시와 기사': '327',
  '팬데믹: 벼랑 끝에서': '56986',
  '시즌스': '131991',
  '시즌스: 마법에 걸린 왕국': '160477',
  '촐킨: 마야의 달력': '126163',
  '테라 미스티카': '120677',
  '빌리지': '104006',
  '브뤼헤': '136888',
  '로스트 시티': '50',
  '로스트 시티 (Lost Cities)': '50',
  '라스베가스': '117959',
  '러브 레터': '129622',
  '클루': '1294',
  '클루: 해리포터': '42255',
  '이스케이프: 사원의 저주': '113294',
  '잠보': '8239',
  '잠보 확장': '24961',
  '와사비!': '38465',
  '펠리시티: 자루 속 고양이': '154597',
  '플래시 포인트: 화재 구조': '100901',
  '왕좌의 게임 (2판)': '37111',
  '왕좌의 게임 HBO': '103343',
  '로스트 레거시': '151747',
  '히어로 디텍티드': '211571',
  '8분 제국': '148977',
  '타케노코': '70919',
  '룸 25': '127991',
  '포비든 아일랜드': '65244',
  '쿼런틴': '180692',
  '라 보카': '135680',
  '마지막 유언': '134131',
  '이봐, 그건 내 물고기야!': '8203',
  '와이어트 어프': '5424',
  '스노우 테일즈': '40586',
  '어센션': '69789',
  '어센션: 신들의 귀환': '95861',
  '어센션: 폭풍의 서막': '107006',
  '나이트폴': '83307',
  '나이트폴: 계엄령': '109483',
  '나이트폴: 블러드 인 더 선': '133135',
  '선더스톤': '53953',
  '선더스톤: 파멸의 전조': '66790',
  '선더스톤: 용의 첨탑': '87236',
  '화이트채플에서 온 편지': '59959',
  '서바이브: 아틀란티스 섬으로부터의 탈출!': '2653',
  '서바이브: 아틀란티스 섬으로부터의 탈출! - 돌고래와 다이브 다이스 미니 확장': '100968',
  '서바이브: 아틀란티스 섬으로부터의 탈출! - 거대 오징어 미니 확장': '109864',
  '서바이브: 아틀란티스로부터의 탈출! 5-6인용 미니 확장': '118591',
  '아컴 호러: 카드 게임': '161061',
  '아컴 호러: 카드 게임 – 던위치의 유산': '202462',
  '아컴 호러: 카드 게임 – 돌아온 광신도의 밤': '246648',
  '아컴 호러: 카드 게임 - 시간을 초월한 음모': '308138',
  '아컴 호러: 카드 게임 - 엑셀시어 호텔 살인사건': '253862',
  '아컴 호러: 카드 게임 - 광기의 미궁': '254127',
  '아컴 호러: 카드 게임 - 심연의 수호자': '254128',
  '아컴 호러: 카드게임 - 돌아온 던위치의 유산': '241015',
  '안드로이드: 넷러너': '124742',
  '안드로이드: 넷러너 - 다가오는 무언가': '130132',
  '안드로이드: 넷러너 - 미래 경쟁력': '143945',
  '안드로이드: 넷러너 - 사이버 엑소더스': '140333',
  '안드로이드: 넷러너 - 쌓여진 단서들': '139230',
  '안드로이드: 넷러너 - 인성의 그늘': '148491',
  '안드로이드 : 넷러너 - 창조와 통제': '149632',
  '사건의 재구성': '261523',
  '사건의 재구성: 느와르': '305855',
  '사건의 재구성: 레드뷰에 오신 걸 환영합니다': '341318',
  '서스펙트 게임: 리로드': '361712',
  '서스펙트 게임: 클로즈드 서클 미스터리': '304680',
  '디텍티브: 모던 크라임': '223321',
  '디텍티브: 모던 크라임 - 시즌 1': '269595',
  '언락 1': '213460',
  '언락 2': '235683',
  '언락 3': '249442',
  '언락 4': '261085',
  '어사일럼 이스케이프': '205548',
  '고려': '245644',
  '패치스토리': '269673',
  '스플렌더': '148228',
  '레지스탕스: 아발론': '128882',
  '코드네임': '178900',
  '패치워크': '163412',
  '카멜 업': '153938',
  '할리갈리': '1127',
  '할리갈리 (Halli Galli)': '1127',
  '루미큐브': '811',
  '루미큐브 (Rummikub)': '811',
  '다빈치 코드': '6320',
  '다빈치 코드 (Da Vinci Code)': '6320',
  '보난자': '11',
  '보난자 (Bohnanza)': '11',
  '잭스님트': '432',
  '태양신 라 (Ra)': '12',
  '뱅! (BANG!)': '37111',
  '로보 77 (Lobo 77)': '36211',
  '젠가': '2452',
  '젠가 (Jenga)': '2452',
  '쿼리도': '624',
  '블로커스': '2453',
  '우노': '2223',
  '좀비 사이드: 흑사병': '176189',
  '홈스트레치': '195329',
  '위대한 로마': '187096',
  '도미니언: 장막 뒤의 사람들': '40841',
  '고스트 스토리즈': '37046',
  '고스트 스토리즈: 검은 비밀': '67017',
  '고스트 스토리즈: 하얀달': '56476',
  '팬데믹 레거시 시즌 0': '314040',
  '비바자바 : 커피 게임': '147570',
  '언락!': '213460',
  '언락! 2': '235683',
  '포비든 아일랜드': '65244',
};

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function fetchText(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/xml,application/xml',
      }
    }, (res) => {
      if (res.statusCode === 429) { resolve('RATE_LIMITED'); return; }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.setTimeout(10000, () => { req.destroy(); resolve('TIMEOUT'); });
  });
}

async function getBGGDetails(bggId) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const xml = await fetchText(`https://boardgamegeek.com/xmlapi2/thing?id=${bggId}&stats=1`);
      if (xml === 'RATE_LIMITED') { await sleep(5000); continue; }
      if (xml === 'TIMEOUT') { await sleep(2000); continue; }

      const r = await parseStringPromise(xml, { explicitArray: false });
      const item = r?.items?.item;
      if (!item) return null;

      const image = item.image ? `https:${item.image}` : null;
      const thumbnail = item.thumbnail ? `https:${item.thumbnail}` : null;
      const year = item.yearpublished?.$?.value || null;
      const minPlayers = item.minplayers?.$?.value || null;
      const maxPlayers = item.maxplayers?.$?.value || null;
      const playingTime = item.playingtime?.$?.value || null;
      const rating = item.statistics?.ratings?.average?.$?.value;
      const weight = item.statistics?.ratings?.averageweight?.$?.value;
      const rawDesc = item.description || '';
      const description = rawDesc
        .replace(/&#10;/g, ' ').replace(/&amp;/g, '&').replace(/&mdash;/g, '—')
        .replace(/&rsquo;/g, "'").replace(/&lsquo;/g, "'").replace(/&ndash;/g, '–')
        .replace(/<[^>]+>/g, '').trim().slice(0, 500) || null;

      const links = Array.isArray(item.link) ? item.link : (item.link ? [item.link] : []);
      const category = links.filter(l => l.$?.type === 'boardgamecategory').map(l => l.$?.value).slice(0, 4).join(', ') || null;
      const mechanics = links.filter(l => l.$?.type === 'boardgamemechanic').map(l => l.$?.value).slice(0, 5).join(', ') || null;

      return {
        bggId: String(bggId),
        image: image || thumbnail,
        thumbnail: thumbnail || image,
        year,
        minPlayers,
        maxPlayers,
        playingTime,
        rating: rating && rating !== '0' ? parseFloat(rating).toFixed(1) : null,
        weight: weight && weight !== '0' ? parseFloat(weight).toFixed(2) : null,
        description,
        category,
        mechanics,
      };
    } catch (e) {
      await sleep(2000);
    }
  }
  return null;
}

async function main() {
  console.log('Fetching games from Firebase...');
  const snap = await getDocs(collection(db, 'games'));
  const allGames = snap.docs.map(d => ({ docId: d.id, ...d.data() }));

  // Filter: needs image AND has a known BGG ID in our map
  const toEnrich = allGames.filter(g => {
    const img = g.image || '';
    const needsImage = !img || img.includes('/thumb.jpg') || img.includes('boardlife.co.kr/game/') || img.includes('boardlife.co.kr/data/boardgame') || img.includes('undefined');
    return needsImage && NAME_TO_BGG_ID[g.name];
  });

  console.log(`\nFound ${toEnrich.length} games to enrich (with known BGG IDs).\n`);

  let success = 0, failed = 0;

  for (let i = 0; i < toEnrich.length; i++) {
    const game = toEnrich[i];
    const bggId = game.bggId || NAME_TO_BGG_ID[game.name];
    console.log(`[${i + 1}/${toEnrich.length}] ${game.name} (BGG: ${bggId})`);

    const details = await getBGGDetails(bggId);
    await sleep(1500);

    if (!details || !details.image) {
      console.log(`  ✗ No data from BGG`);
      failed++;
      continue;
    }

    const update = { image: details.image, thumbnail: details.thumbnail, bggId: details.bggId };
    if (!game.year && details.year) update.year = details.year;
    if (!game.minPlayers && details.minPlayers) update.minPlayers = details.minPlayers;
    if (!game.maxPlayers && details.maxPlayers) update.maxPlayers = details.maxPlayers;
    if (!game.playingTime && details.playingTime) update.playingTime = details.playingTime;
    if (!game.rating && details.rating) update.rating = details.rating;
    if (!game.weight && details.weight) update.weight = details.weight;
    if (!game.description && details.description) update.description = details.description;
    if (!game.category && details.category) update.category = details.category;
    if (!game.mechanics && details.mechanics) update.mechanics = details.mechanics;

    await updateDoc(doc(db, 'games', game.docId), update);
    console.log(`  ✓ Image: ${details.image.slice(0, 65)}...`);
    success++;

    if ((i + 1) % 10 === 0) {
      console.log(`\n⏸ Batch pause (${i + 1} done)...\n`);
      await sleep(3000);
    }
  }

  console.log(`\n✅ Done! ✓ ${success} updated, ✗ ${failed} failed.`);
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
