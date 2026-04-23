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
  {"name": "7 원더스: 대결", "id": 5222},
  {"name": "석기시대", "id": 41},
  {"name": "푸에르토 리코", "id": 1},
  {"name": "아그리콜라", "id": 183},
  {"name": "보난자", "id": 47},
  {"name": "할리갈리", "id": 22},
  {"name": "다빈치 코드", "id": 364},
  {"name": "루미큐브", "id": 38},
  {"name": "젠가", "id": 154},
  {"name": "쿼리도", "id": 304}
];

async function run() {
  try {
    console.log(`Adding ${batchGames.length} games...`);
    for (const game of batchGames) {
      const docId = `bl_${game.id}`;
      const docRef = doc(db, "games", docId);
      await setDoc(docRef, {
        name: game.name,
        boardlifeId: String(game.id),
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
