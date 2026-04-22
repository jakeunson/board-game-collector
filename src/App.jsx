import React, { useState, useEffect } from 'react';
import { Plus, Library, Search, Info } from 'lucide-react';
import { collection, onSnapshot, addDoc, deleteDoc, doc, getDocs, writeBatch } from "firebase/firestore";
import { db } from "./firebase";
import GameCard from './components/GameCard';
import AddGameModal from './components/AddGameModal';
import GameDetail from './components/GameDetail';
import localGames from './data/games.json';
import './App.css';

function App() {
  const [gameCollection, setGameCollection] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Load collection from Firebase Firestore
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "games"), async (snapshot) => {
      let gamesData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      
      // If Firebase is empty, migrate local data
      if (gamesData.length === 0 && localGames.length > 0) {
        console.log("Migrating local data to Firebase...");
        const batch = writeBatch(db);
        localGames.forEach((game) => {
          const newDocRef = doc(collection(db, "games"));
          batch.set(newDocRef, game);
        });
        await batch.commit();
      } else {
        setGameCollection(gamesData);
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  const addGameToFirebase = async (game) => {
    try {
      await addDoc(collection(db, "games"), game);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error adding game: ", error);
      alert("게임 추가 중 오류가 발생했습니다.");
    }
  };

  const removeGame = async (id) => {
    if (window.confirm('이 게임을 컬렉션에서 삭제하시겠습니까?')) {
      try {
        await deleteDoc(doc(db, "games", id));
        if (selectedGame?.id === id) setSelectedGame(null);
      } catch (error) {
        console.error("Error removing game: ", error);
        alert("게임 삭제 중 오류가 발생했습니다.");
      }
    }
  };

  const syncWithLocalData = async () => {
    if (window.confirm('로컬 JSON 데이터로 Firebase를 덮어쓰시겠습니까? (기존 Firebase 데이터가 대체됩니다.)')) {
      setLoading(true);
      const batch = writeBatch(db);
      
      // 1. 기존 데이터 삭제 (간단하게 하기 위해 getDocs 후 반복 삭제)
      const querySnapshot = await getDocs(collection(db, "games"));
      querySnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });
      
      // 2. 새 데이터 추가
      localGames.forEach((game) => {
        const newDocRef = doc(collection(db, "games"));
        batch.set(newDocRef, game);
      });
      
      await batch.commit();
      alert("동기화가 완료되었습니다!");
      setLoading(false);
    }
  };

  const filteredCollection = gameCollection.filter(game => 
    game.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="mica-bg min-h-screen">
      <div className="container animate-slide-up">
        <header style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '40px',
          padding: '20px 0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Library size={32} style={{ color: 'var(--accent-primary)' }} />
            <h1 style={{ fontSize: '28px', fontWeight: '700', letterSpacing: '-0.02em' }}>보드게임 컬렉션 (Firebase)</h1>
            <button 
              onClick={syncWithLocalData}
              style={{ background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', marginLeft: '10px' }}
              title="로컬 데이터와 동기화"
            >
              <Plus size={16} style={{ transform: 'rotate(45deg)' }} /> 
            </button>
          </div>
          
          <button 
            className="btn-primary"
            onClick={() => setIsModalOpen(true)}
          >
            <span>+ 게임 추가 가이드</span>
          </button>
        </header>

        <div style={{ marginBottom: '32px' }}>
          <div style={{ position: 'relative' }}>
            <Search 
              size={18} 
              style={{ 
                position: 'absolute', 
                left: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: 'var(--text-secondary)' 
              }} 
            />
            <input 
              type="text" 
              className="input-field"
              placeholder="컬렉션 내 검색..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '40px' }}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px' }}>
            <p style={{ color: 'var(--text-secondary)' }}>데이터를 불러오는 중입니다...</p>
          </div>
        ) : filteredCollection.length === 0 ? (
          <div className="glass-card" style={{ padding: '100px 20px', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>
              {searchQuery ? '검색 결과가 없습니다.' : '컬렉션이 비어 있습니다.'}
            </p>
          </div>
        ) : (
          <div className="grid-layout">
            {filteredCollection.map(game => (
              <GameCard 
                key={game.id} 
                game={game} 
                onDelete={(e) => {
                  e.stopPropagation();
                  removeGame(game.id);
                }}
                onClick={() => setSelectedGame(game)}
              />
            ))}
          </div>
        )}

        <footer style={{ marginTop: '60px', padding: '40px 0', borderTop: '1px solid var(--border-subtle)', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '12px' }}>
          &copy; 2026 Board Game Collector. Powered by Firebase Firestore.
        </footer>

        {isModalOpen && (
          <AddGameModal 
            onClose={() => setIsModalOpen(false)} 
            onAdd={addGameToFirebase} 
          />
        )}

        {selectedGame && (
          <GameDetail 
            game={selectedGame} 
            onClose={() => setSelectedGame(null)} 
          />
        )}
      </div>
    </div>
  );
}

export default App;
