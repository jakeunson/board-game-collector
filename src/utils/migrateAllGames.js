import { initializeApp } from "firebase/app";
import { getFirestore, collection, setDoc, doc, writeBatch } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDMtnw__VjeaWM9UOxGzV12qdwdrfmzb10",
  authDomain: "boardgame-collector.firebaseapp.com",
  projectId: "boardgame-collector",
  storageBucket: "boardgame-collector.firebasestorage.app",
  messagingSenderId: "352579868603",
  appId: "1:352579868603:web:bf79b902e2418ea850169e"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const allGames = [
  {"name": "사건의 재구성", "id": 9665},
  {"name": "사건의 재구성: 느와르", "id": 10028},
  {"name": "사건의 재구성: 레드뷰에 오신 걸 환영합니다", "id": 10029},
  {"name": "서스펙트 게임: 리로드", "id": 14523},
  {"name": "서스펙트 게임: 클로즈드 서클 미스터리", "id": 14526},
  {"name": "디텍티브: 모던 크라임", "id": 10039},
  {"name": "디텍티브: 모던 크라임 - 시즌 1", "id": 13242},
  {"name": "언락 1", "id": 7929},
  {"name": "언락 2", "id": 14036},
  {"name": "언락 3", "id": 14035},
  {"name": "언락 4", "id": 14397},
  {"name": "어사일럼 이스케이프", "id": 13866},
  {"name": "클루", "id": 1727},
  {"name": "화이트채플에서 온 편지", "id": 423},
  {"name": "서바이브: 아틀란티스 섬으로부터의 탈출!", "id": 369},
  {"name": "서바이브: 아틀란티스 섬으로부터의 탈출! - 돌고래와 다이브 다이스 미니 확장", "id": 1830},
  {"name": "서바이브: 아틀란티스 섬으로부터의 탈출! - 거대 오징어 미니 확장", "id": 1827},
  {"name": "서바이브: 아틀란티스로부터의 탈출! 5-6인용 미니 확장", "id": 1829},
  {"name": "아컴 호러: 카드 게임", "id": 7501},
  {"name": "아컴 호러: 카드 게임 – 던위치의 유산", "id": 7816},
  {"name": "아컴 호러: 카드 게임 - 시간을 초월한 음모", "id": 16305},
  {"name": "아컴 호러: 카드 게임 - 엑셀시어 호텔 살인사건", "id": 11711},
  {"name": "아컴 호러: 카드 게임 - 광기의 미궁", "id": 9559},
  {"name": "아컴 호러: 카드 게임 - 심연의 수호자", "id": 10909},
  {"name": "아컴 호러: 카드게임 - 돌아온 던위치의 유산", "id": 11154},
  {"name": "안드로이드: 넷러너", "id": 10},
  {"name": "안드로이드: 넷러너 - 다가오는 무언가", "id": 813},
  {"name": "안드로이드: 넷러너 - 미래 경쟁력", "id": 786},
  {"name": "안드로이드: 넷러너 - 사이버 엑소더스", "id": 706},
  {"name": "안드로이드: 넷러너 - 쌓여진 단서들", "id": 749},
  {"name": "안드로이드: 넷러너 - 인성의 그늘", "id": 613},
  {"name": "안드로이드 : 넷러너 - 창조와 통제", "id": 2146},
  {"name": "글룸헤이븐: 사자의 턱", "id": 12900},
  {"name": "캔버스", "id": 13807},
  {"name": "캔버스: 리플렉션", "id": 15251},
  {"name": "스페이스 크루", "id": 13426},
  {"name": "티츄", "id": 478},
  {"name": "포뮬라 D", "id": 389},
  {"name": "포뮬라 D: 서킷 1", "id": 1397},
  {"name": "포뮬라 D: 서킷 2", "id": 1522},
  {"name": "포뮬라 D: 서킷 3", "id": 1916},
  {"name": "포뮬라 D: 서킷 4", "id": 594},
  {"name": "도미니언", "id": 127},
  {"name": "도미니언: 바다", "id": 279},
  {"name": "도미니언: 번영", "id": 512},
  {"name": "도미니언: 길드를 위하여", "id": 2049},
  {"name": "도미니언: 암흑의 시대", "id": 616},
  {"name": "도미니언: 장막 뒤의 사람들", "id": 128},
  {"name": "카르카손", "id": 135},
  {"name": "카르카손: 확장 1 - 여관과 대성당", "id": 136},
  {"name": "카르카손: 확장 2 - 상인과 건축가", "id": 137},
  {"name": "카르카손: 확장 3 - 공주와 용", "id": 138},
  {"name": "카르카손: 확장 4 - 타워", "id": 1461},
  {"name": "카르카손: 확장 5 - 수도원과 성주", "id": 1490},
  {"name": "카르카손: 확장 6 - 왕과 정찰병", "id": 140},
  {"name": "카르카손: 확장 8 - 다리와 성바자르", "id": 1500},
  {"name": "티켓 투 라이드", "id": 12},
  {"name": "티켓 투 라이드: 유럽", "id": 43},
  {"name": "티켓 투 라이드: USA 1910", "id": 2012},
  {"name": "7 원더스", "id": 94},
  {"name": "7 원더스: 리더스", "id": 380},
  {"name": "7 원더스: 시티즈", "id": 1018},
  {"name": "7 원더스 : 원더팩", "id": 629},
  {"name": "석기시대", "id": 214},
  {"name": "석기시대: 확장", "id": 1319},
  {"name": "스몰 월드", "id": 187},
  {"name": "스몰 월드: 귀부인", "id": 1813},
  {"name": "스몰 월드: 설화와 전설", "id": 1749},
  {"name": "스몰 월드 언더그라운드", "id": 185},
  {"name": "상트페테르부르크", "id": 416},
  {"name": "상트 페테르부르크: 새로운 사회와 향연", "id": 1654},
  {"name": "파워 그리드", "id": 450},
  {"name": "파워 그리드: 새로운 발전소 카드", "id": 2634},
  {"name": "파워 그리드: 확장 - 로봇", "id": 1307},
  {"name": "카탄의 개척자", "id": 274},
  {"name": "카탄: 항해사", "id": 275},
  {"name": "카탄: 도시와 기사", "id": 276},
  {"name": "팬데믹", "id": 84},
  {"name": "팬데믹: 벼랑 끝에서", "id": 217},
  {"name": "버건디의 성", "id": 421},
  {"name": "시즌스", "id": 91},
  {"name": "시즌스: 마법에 걸린 왕국", "id": 631},
  {"name": "촐킨: 마야의 달력", "id": 77},
  {"name": "테라 미스티카", "id": 78},
  {"name": "빌리지", "id": 565},
  {"name": "브뤼헤", "id": 2017},
  {"name": "로스트 시티", "id": 559},
  {"name": "라스베가스", "id": 682},
  {"name": "러브 레터", "id": 81},
  {"name": "우노", "id": 2034},
  {"name": "클루: 해리포터", "id": 1729},
  {"name": "이스케이프: 사원의 저주", "id": 659},
  {"name": "잠보", "id": 211},
  {"name": "잠보 확장", "id": 2091},
  {"name": "와사비!", "id": 1039},
  {"name": "펠리시티: 자루 속 고양이", "id": 1422},
  {"name": "비바자바 : 커피 게임", "id": 626},
  {"name": "플래시 포인트: 화재 구조", "id": 488},
  {"name": "왕좌의 게임 (2판)", "id": 812},
  {"name": "왕좌의 게임 HBO", "id": 1623},
  {"name": "로스트 레거시", "id": 2139},
  {"name": "히어로 디텍티드", "id": 2221},
  {"name": "8분 제국", "id": 2210},
  {"name": "타케노코", "id": 285},
  {"name": "룸 25", "id": 716},
  {"name": "포비든 아일랜드", "id": 1037},
  {"name": "고려", "id": 2118},
  {"name": "패치스토리", "id": 2119},
  {"name": "쿼런틴", "id": 593},
  {"name": "라 보카", "id": 666},
  {"name": "홈스트레치", "id": 745},
  {"name": "마지막 유언", "id": 505},
  {"name": "이봐, 그건 내 물고기야!", "id": 386},
  {"name": "와이어트 어프", "id": 366},
  {"name": "스노우 테일즈", "id": 462},
  {"name": "위대한 로마", "id": 269},
  {"name": "어센션", "id": 313},
  {"name": "어센션: 신들의 귀환", "id": 1391},
  {"name": "어센션: 폭풍의 서막", "id": 1656},
  {"name": "나이트폴", "id": 348},
  {"name": "나이트폴: 계엄령", "id": 2041},
  {"name": "나이트폴: 블러드 인 더 선", "id": 2042},
  {"name": "선더스톤", "id": 252},
  {"name": "선더스톤: 파멸의 전조", "id": 1445},
  {"name": "선더스톤: 용의 첨탑", "id": 1664}
];

async function migrate() {
  try {
    console.log(`Starting final migration of ${allGames.length} games...`);
    const batch = writeBatch(db);
    
    allGames.forEach(game => {
      const docId = `bl_${game.id}`;
      const docRef = doc(db, "games", docId);
      batch.set(docRef, {
        name: game.name || game.title,
        boardlifeId: String(game.id),
        // Use boardlife thumbnail as default
        image: `https://boardlife.co.kr/data/boardgame/${game.id}/thumb.jpg`,
        thumbnail: `https://boardlife.co.kr/data/boardgame/${game.id}/thumb.jpg`,
        status: "migrated",
        createdAt: new Date().toISOString()
      }, { merge: true });
    });
    
    await batch.commit();
    console.log("Migration successful!");
    process.exit(0);
  } catch (e) {
    console.error("Migration failed:", e);
    process.exit(1);
  }
}

migrate();
