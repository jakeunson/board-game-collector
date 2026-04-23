import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";

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

async function deduplicate() {
  try {
    console.log("Fetching all games for deduplication...");
    const querySnapshot = await getDocs(collection(db, "games"));
    const allGames = [];
    querySnapshot.forEach(doc => {
      allGames.push({ docId: doc.id, ...doc.data() });
    });

    const seenNames = new Map();
    const toDelete = [];

    for (const game of allGames) {
      const normalizedName = game.name.trim().toLowerCase();
      if (seenNames.has(normalizedName)) {
        const existingGame = seenNames.get(normalizedName);
        
        // Decide which one to keep
        // Keep the one with an image or BGG ID
        const hasBetterData = (game.image && !existingGame.image) || (game.bggId && !existingGame.bggId);
        
        if (hasBetterData) {
          toDelete.push(existingGame.docId);
          seenNames.set(normalizedName, game);
          console.log(`[DUPE] Keeping "${game.name}" (${game.docId}) instead of (${existingGame.docId})`);
        } else {
          toDelete.push(game.docId);
          console.log(`[DUPE] Deleting redundant "${game.name}" (${game.docId})`);
        }
      } else {
        seenNames.set(normalizedName, game);
      }
    }

    console.log(`Found ${toDelete.length} duplicates to delete.`);
    for (const docId of toDelete) {
      await deleteDoc(doc(db, "games", docId));
    }

    console.log("Deduplication complete!");
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

deduplicate();
