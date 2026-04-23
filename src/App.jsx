import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { LayoutGrid, List, Dice5 } from 'lucide-react';
import { collection, onSnapshot, addDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "./firebase";
import GameCard from './components/GameCard';
import GameListItem from './components/GameListItem';
import AddGameModal from './components/AddGameModal';
import GameDetail from './components/GameDetail';
import BggEnricher from './components/BggEnricher';
import './App.css';

// Player count options
const PLAYER_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8];

// Difficulty chip options
const DIFFICULTY_OPTIONS = [
  { value: '1', label: '입문', sub: '~2.0' },
  { value: '2', label: '중급', sub: '2~3' },
  { value: '3', label: '상급', sub: '3~4' },
  { value: '4', label: '헤비', sub: '4~' },
];

function Chip({ label, sub, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '3px',
        padding: '5px 12px',
        borderRadius: '20px',
        border: active ? 'none' : '1px solid var(--border-medium)',
        background: active ? 'var(--accent-primary)' : 'transparent',
        color: active ? '#fff' : 'var(--text-secondary)',
        fontSize: '12px',
        fontWeight: active ? '600' : '400',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        whiteSpace: 'nowrap',
        fontFamily: 'inherit',
      }}
    >
      {label}
      {sub && <span style={{ opacity: 0.75, fontSize: '10px' }}>{sub}</span>}
    </button>
  );
}

function App() {
  const [gameCollection, setGameCollection] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [showEnricher, setShowEnricher] = useState(false);
  const [filters, setFilters] = useState({ search: '', players: '', difficulty: '', category: '' });

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "games"), (snapshot) => {
      const gamesData = snapshot.docs.map(d => ({ ...d.data(), id: d.id }));
      setGameCollection(gamesData);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const addGameToFirebase = async (game) => {
    try {
      await addDoc(collection(db, "games"), game);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error adding game:", error);
    }
  };

  const removeGame = async (id) => {
    if (window.confirm('이 게임을 컬렉션에서 삭제하시겠습니까?')) {
      try {
        await deleteDoc(doc(db, "games", id));
        if (selectedGame?.id === id) setSelectedGame(null);
      } catch (error) {
        console.error("Error removing game:", error);
      }
    }
  };

  const allCategories = Array.from(new Set(
    gameCollection.flatMap(g => g.category ? g.category.split(',').map(c => c.trim()) : [])
  )).sort();

  const filteredCollection = gameCollection
    .filter(game => {
      if (filters.search && !game.name.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      if (filters.players) {
        const p = parseInt(filters.players);
        const min = parseInt(game.minPlayers || 0);
        const max = parseInt(game.maxPlayers || 99);
        if (p < min || p > max) return false;
      }
      if (filters.difficulty) {
        const w = parseFloat(game.weight || 0);
        if (filters.difficulty === '1' && w > 2.0) return false;
        if (filters.difficulty === '2' && (w <= 2.0 || w > 3.0)) return false;
        if (filters.difficulty === '3' && (w <= 3.0 || w > 4.0)) return false;
        if (filters.difficulty === '4' && w <= 4.0) return false;
      }
      if (filters.category && (!game.category || !game.category.includes(filters.category))) return false;
      return true;
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const hasActiveFilters = filters.search || filters.players || filters.difficulty || filters.category;

  return (
    <div className="mica-bg" style={{ minHeight: '100vh' }}>
      <div className="container">

        {/* ── Header ── */}
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '24px 0 20px',
          marginBottom: '4px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px', height: '36px',
              background: 'var(--accent-primary)',
              borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Dice5 size={20} color="#fff" />
            </div>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: '700', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                Board Game Collector
              </h1>
              <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                {loading ? '로딩 중...' : `${gameCollection.length}개의 보드게임`}
              </span>
            </div>
          </div>

          <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
            + AI에게 추가 요청
          </button>
        </header>

        {/* ── Filter Bar ── */}
        <div style={{
          background: 'rgba(255,255,255,0.65)',
          backdropFilter: 'blur(12px)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '12px',
          padding: '14px 16px',
          marginBottom: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}>
          {/* Row 1: Players + Difficulty chips */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginRight: '4px', whiteSpace: 'nowrap' }}>
              인원
            </span>
            {PLAYER_OPTIONS.map(n => (
              <Chip
                key={n}
                label={`${n}인`}
                active={filters.players === String(n)}
                onClick={() => setFilters(f => ({ ...f, players: f.players === String(n) ? '' : String(n) }))}
              />
            ))}

            <div style={{ width: '1px', height: '20px', background: 'var(--border-medium)', margin: '0 4px' }} />

            <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginRight: '4px', whiteSpace: 'nowrap' }}>
              난이도
            </span>
            {DIFFICULTY_OPTIONS.map(opt => (
              <Chip
                key={opt.value}
                label={opt.label}
                sub={opt.sub}
                active={filters.difficulty === opt.value}
                onClick={() => setFilters(f => ({ ...f, difficulty: f.difficulty === opt.value ? '' : opt.value }))}
              />
            ))}
          </div>

          {/* Row 2: Category dropdown + Search input (Side by side) */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                카테고리
              </span>
              <select
                className="input-field"
                value={filters.category}
                onChange={(e) => setFilters(f => ({ ...f, category: e.target.value }))}
                style={{ width: '180px' }}
              >
                <option value="">전체 카테고리</option>
                {allCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flex: 1, maxWidth: '400px' }}>
              <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap', marginLeft: '4px' }}>
                검색
              </span>
              <input
                type="text"
                className="input-field"
                placeholder="게임 제목으로 검색..."
                value={filters.search}
                onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
                style={{ flex: 1 }}
              />
            </div>

            {/* Reserved space for Reset & Result count */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              minWidth: '180px',
              justifyContent: 'flex-end',
              marginLeft: 'auto'
            }}>
              {hasActiveFilters && (
                <>
                  <button
                    onClick={() => setFilters({ search: '', players: '', difficulty: '', category: '' })}
                    style={{
                      background: 'none', border: '1px solid var(--border-medium)',
                      borderRadius: '20px', padding: '4px 12px', fontSize: '11px',
                      color: 'var(--text-secondary)', cursor: 'pointer', whiteSpace: 'nowrap',
                      fontFamily: 'inherit', transition: 'all 0.15s',
                    }}
                  >
                    ✕ 초기화
                  </button>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                    {filteredCollection.length}개 결과
                  </span>
                </>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '1px solid var(--border-subtle)', paddingLeft: '12px' }}>
              {/* View toggle */}
              <div className="view-toggle">
                <button
                  className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  title="카드 뷰"
                >
                  <LayoutGrid size={15} />
                </button>
                <button
                  className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                  title="목록 뷰"
                >
                  <List size={15} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Content ── */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '120px', color: 'var(--text-secondary)' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>🎲</div>
            데이터를 불러오는 중입니다...
          </div>
        ) : filteredCollection.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '80px',
            background: '#fff', borderRadius: '12px',
            border: '1px solid var(--border-subtle)'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔍</div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
              필터 조건에 맞는 게임이 없습니다.
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid-layout animate-slide-up">
            {filteredCollection.map(game => (
              <GameCard key={game.id} game={game} onClick={() => setSelectedGame(game)} />
            ))}
          </div>
        ) : (
          <div className="list-layout animate-slide-up">
            {filteredCollection.map(game => (
              <GameListItem key={game.id} game={game} onClick={() => setSelectedGame(game)} />
            ))}
          </div>
        )}

        {/* ── Footer ── */}
        <footer style={{
          marginTop: '48px', padding: '20px 0',
          borderTop: '1px solid var(--border-subtle)',
          textAlign: 'center',
          color: 'var(--text-tertiary)', fontSize: '11px'
        }}>
          © 2026 Board Game Collector · Firebase Firestore
          <span
            onClick={() => setShowEnricher(true)}
            style={{ marginLeft: '12px', cursor: 'pointer', opacity: 0.3 }}
            title="Admin: BGG Enricher"
          >⚙</span>
        </footer>
      </div>

      {isModalOpen && createPortal(
        <AddGameModal onClose={() => setIsModalOpen(false)} onAdd={addGameToFirebase} />,
        document.body
      )}
      {showEnricher && createPortal(
        <BggEnricher onDone={() => setShowEnricher(false)} />,
        document.body
      )}
      {selectedGame && createPortal(
        <GameDetail game={selectedGame} onClose={() => setSelectedGame(null)} onDelete={removeGame} />,
        document.body
      )}
    </div>
  );
}

export default App;
