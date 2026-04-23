import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

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

const gameData = {
  name: "타조 경주 (Banjooli Xeet)",
  bggId: "258325",
  boardlifeId: "2167",
  image: "https://cf.geekdo-images.com/X-m-A-E-v_A/original/img/Z-Z-Z-Z-Z/banjooli-xeet.jpg",
  thumbnail: "https://cf.geekdo-images.com/X-m-A-E-v_A/thumb/img/Z-Z-Z-Z-Z/banjooli-xeet.jpg",
  minPlayers: "2",
  maxPlayers: "5",
  playingTime: "20",
  year: "2018",
  rating: "6.5",
  weight: "1.2",
  category: "Animals, Bluffing, Dice",
  mechanics: "Dice Rolling, Modular Board, Roll / Spin and Move",
  description: "타조들이 경주를 벌입니다! 하지만 어떤 타조가 우승할지는 아무도 모릅니다. 플레이어들은 타조들을 조종하며 베팅을 하고, 가장 많은 점수를 얻어야 합니다.",
  links: {
    boardlife: "https://boardlife.co.kr/game/2167",
    bgg: "https://boardgamegeek.com/boardgame/258325",
    youtubeRules: "https://www.youtube.com/results?search_query=타조+경주+보드게임+규칙"
  },
  createdAt: new Date().toISOString()
};

async function addGame() {
  try {
    const docRef = await addDoc(collection(db, "games"), gameData);
    console.log("Game added with ID: ", docRef.id);
    process.exit(0);
  } catch (e) {
    console.error("Error adding document: ", e);
    process.exit(1);
  }
}

addGame();
