import { initializeApp } from "firebase/app";
import { getFirestore, collection, setDoc, doc } from "firebase/firestore";

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

const batchGames = [
  { name: "카르카손 (Carcassonne)", boardlifeId: "135", bggId: "822", image: "https://boardlife.co.kr/data/boardgame/135/thumb.jpg" },
  { name: "석기시대 (Stone Age)", boardlifeId: "214", bggId: "34635", image: "https://boardlife.co.kr/data/boardgame/214/thumb.jpg" },
  { name: "푸에르토 리코 (Puerto Rico)", boardlifeId: "90", bggId: "3076", image: "https://boardlife.co.kr/data/boardgame/90/thumb.jpg" },
  { name: "보난자 (Bohnanza)", boardlifeId: "535", bggId: "11", image: "https://boardlife.co.kr/data/boardgame/535/thumb.jpg" },
  { name: "할리갈리 (Halli Galli)", boardlifeId: "2145", bggId: "1127", image: "https://boardlife.co.kr/data/boardgame/2145/thumb.jpg" },
  { name: "다빈치 코드 (Da Vinci Code)", boardlifeId: "2776", bggId: "6320", image: "https://boardlife.co.kr/data/boardgame/2776/thumb.jpg" },
  { name: "루미큐브 (Rummikub)", boardlifeId: "2061", bggId: "811", image: "https://boardlife.co.kr/data/boardgame/2061/thumb.jpg" },
  { name: "젠가 (Jenga)", boardlifeId: "2578", bggId: "2452", image: "https://boardlife.co.kr/data/boardgame/2578/thumb.jpg" },
  { name: "쿼리도 (Quoridor)", boardlifeId: "1340", bggId: "624", image: "https://boardlife.co.kr/data/boardgame/1340/thumb.jpg" },
  { name: "로스트 시티 (Lost Cities)", boardlifeId: "559", bggId: "50", image: "https://boardlife.co.kr/data/boardgame/559/thumb.jpg" }
];

async function run() {
  try {
    console.log(`Adding ${batchGames.length} games with images...`);
    for (const game of batchGames) {
      const docId = `bl_${game.boardlifeId}`;
      const docRef = doc(db, "games", docId);
      await setDoc(docRef, {
        ...game,
        thumbnail: game.image,
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
