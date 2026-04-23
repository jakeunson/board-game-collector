import { initializeApp } from "firebase/app";
import { getFirestore, collection, writeBatch, doc } from "firebase/firestore";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

async function sync() {
  try {
    console.log("Reading local games.json...");
    const gamesPath = path.join(__dirname, '../data/games.json');
    const localGames = JSON.parse(fs.readFileSync(gamesPath, 'utf8'));

    console.log("Connecting to Firestore...");
    const batch = writeBatch(db);
    
    // Note: We are NOT deleting existing games to preserve manual additions.
    // We use the 'id' from JSON as the Firestore doc ID to prevent duplicates.
    
    localGames.forEach((game) => {
      // Use the 'id' field as the document ID
      const docId = game.id || `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const docRef = doc(db, "games", docId);
      batch.set(docRef, game, { merge: true });
    });
    
    console.log(`Migrating ${localGames.length} games to Cloud...`);
    await batch.commit();
    console.log("Successfully migrated all local games to Firebase Cloud!");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

sync();
