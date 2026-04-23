import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

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

async function test() {
  try {
    console.log("Testing Firestore connection...");
    const querySnapshot = await getDocs(collection(db, "games"));
    console.log(`Successfully reached Firestore. Found ${querySnapshot.size} games.`);
    process.exit(0);
  } catch (e) {
    console.error("Connection test failed:", e);
    process.exit(1);
  }
}

test();
