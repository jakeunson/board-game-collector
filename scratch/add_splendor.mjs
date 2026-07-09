import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, where, getDocs, addDoc } from "firebase/firestore";
import fetch from "node-fetch";
import { parseStringPromise } from "xml2js";

const firebaseConfig = {
  apiKey: "AIzaSyDMtnwAIzaSyAg96Jn9klMsoNEXjKb0cvGs9M8LLYKL-A__VjeaWM9UOxGzV12qdwdrfmzb10",
  authDomain: "boardgame-collector.firebaseapp.com",
  projectId: "boardgame-collector",
  storageBucket: "boardgame-collector.firebasestorage.app",
  messagingSenderId: "352579868603",
  appId: "1:352579868603:web:bf79b902e2418ea850169e"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const CATEGORY_MAP = {
  'Deduction': '추리',
  'Murder/Mystery': '미스터리',
  'Puzzle': '퍼즐',
  'Card Game': '카드게임',
  'Fantasy': '판타지',
  'Adventure': '모험',
  'Exploration': '탐험',
  'Economic': '경제',
  'Fighting': '전투',
  'Negotiation': '협상',
  'Party Game': '파티게임',
  'Bluffing': '블러핑',
  'Strategy Games': '전략게임',
  'Family Game': '가족게임',
  'Thematic Games': '테마게임',
  'Ancient': '고대',
  'Animals': '동물',
  'Abstract Strategy': '추상전략',
  'Action / Dexterity': '액션/순발력',
  'City Building': '도시건설',
  'Civilization': '문명',
  'Dice': '주사위',
  'Medieval': '중세',
  'Space Exploration': '우주탐험',
  'Horror': '공포',
  'Miniatures': '피규어',
  'Science Fiction': 'SF',
  'Zombies': '좀비',
  'Renaissance': '르네상스'
};

const MECHANISM_MAP = {
  'Cooperative Game': '협력',
  'Storytelling': '스토리텔링',
  'Hand Management': '핸드 관리',
  'Grid Movement': '격자 이동',
  'Area Majority / Influence': '영향력',
  'Dice Rolling': '주사위 굴리기',
  'Tile Placement': '타일 놓기',
  'Drafting': '드래프트',
  'Action Retrieval': '액션 회수',
  'Variable Player Powers': '가변 능력',
  'Deck, Bag, and Pool Building': '덱빌딩',
  'Solo / Solitaire Game': '1인 전용',
  'Campaign / Battle Card Driven': '캠페인',
  'Worker Placement': '일꾼 놓기',
  'Set Collection': '셋 컬렉션',
  'Memory': '기억력',
  'Pattern Building': '패턴 구축',
  'Take That': '인터랙션',
  'Voting': '투표',
  'Push Your Luck': '운 시험',
  'Simultaneous Action Selection': '동시 행동 선택',
  'Open Drafting': '오픈 드래프트',
  'Contract': '계약',
  'Engine Building': '엔진 빌딩'
};

function translateText(text, map) {
  if (!text) return '';
  return text.split(',').map(item => {
    const trimmed = item.trim();
    return map[trimmed] || trimmed;
  }).join(', ');
}

async function translateToKorean(text) {
  if (!text) return '';
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ko&dt=t&q=${encodeURIComponent(text.substring(0, 1000))}`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data && data[0]) {
        return data[0].map(item => item[0]).join('');
      }
    }
  } catch (e) {
    console.error("Translation error:", e);
  }
  return text;
}

async function addSplendor() {
  const boardlifeId = "3516";
  console.log(`[1/5] Firestore에서 보드라이프 ID ${boardlifeId} (스플렌더) 중복 확인 중...`);
  
  const q = query(collection(db, "games"), where("boardlifeId", "==", boardlifeId));
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    console.log(`이미 등록된 게임입니다! (문서 ID: ${snapshot.docs[0].id}, 이름: ${snapshot.docs[0].data().name})`);
    process.exit(0);
  }

  console.log(`[2/5] 보드라이프 페이지 접속 및 정보 추출 중...`);
  const blUrl = `https://boardlife.co.kr/game/${boardlifeId}`;
  const blHeaders = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
  };
  const blRes = await fetch(blUrl, { headers: blHeaders });
  const blHtml = await blRes.text();

  const titleMatch = blHtml.match(/<title>(.*?)\s*\|/i);
  const blName = titleMatch ? titleMatch[1].trim() : "스플렌더";
  
  const bggMatch = blHtml.match(/boardgamegeek\.com\/(boardgame|boardgameexpansion|thing)\/(\d+)/i);
  const bggId = bggMatch ? bggMatch[2] : "148228";
  const type = (bggMatch && bggMatch[1] === 'boardgameexpansion') ? 'expansion' : 'base';

  console.log(`- 보드라이프 게임명: ${blName}`);
  console.log(`- BGG ID: ${bggId} (${type})`);

  console.log(`[3/5] BGG XML API에서 상세 정보 가져오는 중...`);
  const bggUrl = `https://boardgamegeek.com/xmlapi2/thing?id=${bggId}&stats=1`;
  const bggHeaders = {
    'User-Agent': 'BoardGameCollectorApp/2.0',
    'Authorization': 'Bearer 20e80084-8f01-4d9e-98f1-977374d89ac6'
  };
  const bggRes = await fetch(bggUrl, { headers: bggHeaders });
  const xmlText = await bggRes.text();
  const xmlObj = await parseStringPromise(xmlText);
  const item = xmlObj.items.item[0];

  const getVal = (prop) => item[prop]?.[0]?.$.value || '';
  const englishName = item.name?.find(n => n.$.type === 'primary')?.$.value || getVal('name');
  const year = getVal('yearpublished');
  const minPlayers = Number(getVal('minplayers')) || 2;
  const maxPlayers = Number(getVal('maxplayers')) || 4;
  const playingTime = Number(getVal('playingtime')) || 30;
  
  const stats = item.statistics?.[0]?.ratings?.[0];
  const ratingVal = stats?.average?.[0]?.$.value;
  const rating = ratingVal ? parseFloat(ratingVal).toFixed(1) : '7.4';
  const weightVal = stats?.averageweight?.[0]?.$.value;
  const weight = weightVal ? parseFloat(weightVal).toFixed(2) : '1.80';
  
  const image = item.image?.[0] || '';
  const thumbnail = item.thumbnail?.[0] || '';
  const rawDesc = item.description?.[0] || '';

  const categories = item.link?.filter(l => l.$.type === 'boardgamecategory').map(l => l.$.value) || [];
  const mechanisms = item.link?.filter(l => l.$.type === 'boardgamemechanic').map(l => l.$.value) || [];

  const category = translateText(categories.join(', '), CATEGORY_MAP) || '카드게임, 르네상스';
  const mechanism = translateText(mechanisms.join(', '), MECHANISM_MAP) || '셋 컬렉션, 오픈 드래프트, 엔진 빌딩';

  console.log(`[4/5] 게임 설명 한글 번역 중...`);
  const cleanDesc = rawDesc.replace(/&#10;/g, ' ').replace(/<[^>]+>/g, '').trim();
  const description = await translateToKorean(cleanDesc);

  const newGame = {
    name: blName,
    englishName: englishName,
    type: type,
    year: year,
    bggId: bggId,
    boardlifeId: boardlifeId,
    minPlayers: minPlayers,
    maxPlayers: maxPlayers,
    playingTime: playingTime,
    bestPlayerCount: "3",
    weight: Number(weight),
    rating: Number(rating),
    category: category,
    mechanisms: mechanism,
    theme: "르네상스, 보석상",
    description: description || "르네상스 시대의 부유한 르네상스 상인이 되어 보석 광산과 교통수단, 장인을 획득하고 귀족의 후원을 받아 명성을 쌓는 게임입니다.",
    image: image,
    thumbnail: thumbnail,
    isRented: false
  };

  console.log(`[5/5] Firestore 'games' 컬렉션에 추가 중...`);
  console.log("추가할 데이터:", JSON.stringify(newGame, null, 2));

  const docRef = await addDoc(collection(db, "games"), newGame);
  console.log(`\n🎉 성공적으로 추가되었습니다! 문서 ID: ${docRef.id}`);
  process.exit(0);
}

addSplendor().catch(err => {
  console.error("오류 발생:", err);
  process.exit(1);
});
