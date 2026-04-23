import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, query, where, getDocs, updateDoc, doc, setDoc } from "firebase/firestore";

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

const ostrichRaceImage = "https://cf.geekdo-images.com/uR2VpPzP7-B3_wI7T_B5lQ__imagepage/img/0-t3A3WqY_U0pE7f-X0-fXz9F38=/fit-in/900x600/filters:no_upscale():strip_icc()/pic1573682.jpg";

const collectionGames = [
  {"name": "서스펙트 게임: 리로드", "id": 14523},
  {"name": "서스펙트 게임: 클로즈드 서클 미스터리", "id": 14526},
  {"name": "사건의 재구성: 느와르", "id": 10028},
  {"name": "사건의 재구성: 레드뷰에 오신 걸 환영합니다", "id": 10027},
  {"name": "사건의 재구성", "id": 9352},
  {"name": "방 탈출 D: 보물섬", "id": 14264},
  {"name": "방 탈출 D: 고대 문명", "id": 14263},
  {"name": "방 탈출 D: 유령 기차", "id": 14262},
  {"name": "방 탈출 D: 숲속의 오두막", "id": 14261},
  {"name": "포뮬라 D", "id": 794},
  {"name": "아컴 호러: 카드 게임 – 돌아온 던위치의 유산", "id": 11776},
  {"name": "아컴 호러: 카드 게임 – 돌아온 광신도의 밤", "id": 10444},
  {"name": "아컴 호러: 카드 게임 – 잊힌 시대", "id": 11026},
  {"name": "아컴 호러: 카드 게임 – 카르코사로 가는 길", "id": 9937},
  {"name": "아컴 호러: 카드 게임 – 던위치의 유산", "id": 8179},
  {"name": "아컴 호러: 카드 게임", "id": 7589},
  {"name": "보드게임 카페 라떼", "id": 13726},
  {"name": "언락! 6", "id": 12626},
  {"name": "언락! 5", "id": 12316},
  {"name": "언락! 4", "id": 11488},
  {"name": "언락! 3", "id": 9997},
  {"name": "언락! 2", "id": 8997},
  {"name": "언락!", "id": 8161},
  {"name": "좀비 사이드: 흑사병", "id": 7312},
  {"name": "고스트 스토리즈: 하얀달", "id": 1421},
  {"name": "고스트 스토리즈: 검은 비밀", "id": 1311},
  {"name": "고스트 스토리즈", "id": 118},
  {"name": "시즌스: 마법에 걸린 왕국", "id": 1456},
  {"name": "히어로 디텍티드", "id": 2020},
  {"name": "8분 제국", "id": 1900},
  {"name": "타케노코", "id": 463},
  {"name": "파워 그리드", "id": 17},
  {"name": "티켓 투 라이드", "id": 4},
  {"name": "빌리지", "id": 505},
  {"name": "카르카손", "id": 110},
  {"name": "서바이브: 아틀란티스 섬으로부터의 탈출!", "id": 182},
  {"name": "룸 25", "id": 1933},
  {"name": "7 원더스", "id": 94},
  {"name": "브뤼헤", "id": 2017},
  {"name": "버건디의 성", "id": 421},
  {"name": "카탄의 개척자", "id": 274},
  {"name": "포비든 아일랜드", "id": 1037},
  {"name": "팬데믹", "id": 84},
  {"name": "고려", "id": 2118},
  {"name": "테라 미스티카", "id": 78},
  {"name": "시즌스", "id": 91},
  {"name": "화이트채플에서 온 편지", "id": 423},
  {"name": "레지스탕스: 아발론", "id": 1513},
  {"name": "스플렌더", "id": 2083}
];

async function run() {
  try {
    // 1. Update Ostrich Race Image
    const q = query(collection(db, "games"), where("boardlifeId", "==", "2167"));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const ostrichDoc = querySnapshot.docs[0];
      await updateDoc(ostrichDoc.ref, { image: ostrichRaceImage, thumbnail: ostrichRaceImage });
      console.log("Updated Ostrich Race image.");
    }

    // 2. Add Collection Games (Merge mode)
    console.log(`Adding ${collectionGames.length} collection games...`);
    for (const game of collectionGames) {
      const docId = `bl_${game.id}`;
      const docRef = doc(db, "games", docId);
      await setDoc(docRef, {
        name: game.name,
        boardlifeId: String(game.id),
        image: `https://boardlife.co.kr/game/${game.id}`, // Placeholder or generic
        thumbnail: `https://boardlife.co.kr/game/${game.id}`,
        status: "pending_enrichment",
        createdAt: new Date().toISOString()
      }, { merge: true });
    }

    console.log("Success!");
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

run();
