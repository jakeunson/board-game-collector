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
  {
    name: "로보 77 (Lobo 77)",
    boardlifeId: "633",
    bggId: "3337",
    image: "https://cf.geekdo-images.com/C7p2-6Y-oU9Z3G-5q_t57A__imagepage/img/L8-GZ2_o-v-vS0Y-k5XyH7S-yU=/fit-in/900x600/filters:no_upscale():strip_icc()/pic144661.jpg"
  },
  {
    name: "뱅! (BANG!)",
    boardlifeId: "475",
    bggId: "3955",
    image: "https://cf.geekdo-images.com/9v6N-M19PZ48A_9_Xy9mEw__imagepage/img/934Z4_v38_0_0_0_0/fit-in/900x600/filters:no_upscale():strip_icc()/pic47451.jpg"
  },
  {
    name: "시타델 (Citadels)",
    boardlifeId: "910",
    bggId: "478",
    image: "https://cf.geekdo-images.com/vHqA_5T8vI8e4_E_Xy9mEw__imagepage/img/vHqA_5T8vI8e4_E_Xy9mEw__imagepage/fit-in/900x600/filters:no_upscale():strip_icc()/pic232230.jpg"
  },
  {
    name: "러브 레터 (Love Letter)",
    boardlifeId: "81",
    bggId: "129622",
    image: "https://cf.geekdo-images.com/Y866872/img/Y866872/fit-in/900x600/filters:no_upscale():strip_icc()/pic1401440.jpg"
  },
  {
    name: "블로커스 (Blokus)",
    boardlifeId: "2217",
    bggId: "2453",
    image: "https://cf.geekdo-images.com/S-K7e39E2Z67A_9_Xy9mEw__imagepage/img/S-K7e39E2Z67A_9_Xy9mEw__imagepage/fit-in/900x600/filters:no_upscale():strip_icc()/pic171542.jpg"
  },
  {
    name: "패치워크 (Patchwork)",
    boardlifeId: "4368",
    bggId: "163412",
    image: "https://cf.geekdo-images.com/m996616/img/m996616/fit-in/900x600/filters:no_upscale():strip_icc()/pic2268677.jpg"
  },
  {
    name: "잭스님트 (6 nimmt!)",
    boardlifeId: "3237",
    bggId: "432",
    image: "https://cf.geekdo-images.com/S_76092S_pA4u2Z_Xy9mEw__imagepage/img/S_76092S_pA4u2Z_Xy9mEw__imagepage/fit-in/900x600/filters:no_upscale():strip_icc()/pic465225.jpg"
  },
  {
    name: "태양신 라 (Ra)",
    boardlifeId: "5481",
    bggId: "12",
    image: "https://cf.geekdo-images.com/7vYpM20LhY9S9A_E_Xy9mEw__imagepage/img/7vYpM20LhY9S9A_E_Xy9mEw__imagepage/fit-in/900x600/filters:no_upscale():strip_icc()/pic465225.jpg"
  },
  {
    name: "카멜 업 (Camel Up)",
    boardlifeId: "10843",
    bggId: "153938",
    image: "https://cf.geekdo-images.com/9v6N-M19PZ48A_9_Xy9mEw__imagepage/img/934Z4_v38_0_0_0_0/fit-in/900x600/filters:no_upscale():strip_icc()/pic4220000.jpg"
  },
  {
    name: "코드네임 (Codenames)",
    boardlifeId: "5516",
    bggId: "178900",
    image: "https://cf.geekdo-images.com/602BE3A1CE55DB0710803983C794B034/img/602BE3A1CE55DB0710803983C794B034/fit-in/900x600/filters:no_upscale():strip_icc()/pic2582929.jpg"
  }
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
