import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { LayoutGrid, List, Dice5, Sun, Moon, Search, RotateCcw } from 'lucide-react';
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
        gap: '4px',
        padding: '5px 12px',
        borderRadius: '10px',
        border: '1px solid var(--border-medium)',
        background: active ? 'var(--accent-primary)' : 'transparent',
        color: active ? '#fff' : 'var(--text-secondary)',
        fontSize: '12px',
        fontWeight: active ? '600' : '500',
        cursor: 'pointer',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        whiteSpace: 'nowrap',
        fontFamily: 'inherit',
        boxShadow: active ? '0 4px 10px var(--accent-glow)' : 'none',
      }}
      onMouseEnter={e => {
        if (!active) {
          e.currentTarget.style.background = 'var(--bg-hover)';
          e.currentTarget.style.borderColor = 'var(--accent-primary)';
        }
      }}
      onMouseLeave={e => {
        if (!active) {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.borderColor = 'var(--border-medium)';
        }
      }}
    >
      {label}
      {sub && <span style={{ opacity: 0.7, fontSize: '10px', fontWeight: '400' }}>{sub}</span>}
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
  
  // Theme logic
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

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

  const updateGame = async (id, data) => {
    try {
      const { updateDoc } = await import("firebase/firestore");
      await updateDoc(doc(db, "games", id), data);
      // Local state is updated automatically via onSnapshot
    } catch (error) {
      console.error("Error updating game:", error);
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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="container">

        {/* ── Header ── */}
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 0 24px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '38px', height: '38px',
              background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
              borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 6px 12px var(--accent-glow)',
            }}>
              <Dice5 size={20} color="#fff" />
            </div>
            <div>
              <h1 style={{ 
                fontSize: '20px', 
                fontWeight: '800', 
                letterSpacing: '-0.03em', 
                lineHeight: 1,
                background: 'linear-gradient(135deg, var(--text-primary), var(--accent-primary))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '2px'
              }}>
                Board Game Collector
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="badge badge-category" style={{ fontSize: '9px', padding: '1px 6px' }}>
                  {loading ? '데이터 로드 중...' : `${gameCollection.length} Games`}
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              onClick={toggleTheme}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-medium)',
                borderRadius: '10px',
                width: '34px', height: '34px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'var(--text-secondary)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-medium)'}
              title={theme === 'light' ? '다크 모드로 전환' : '라이트 모드로 전환'}
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
              + AI에게 추가 요청
            </button>
          </div>
        </header>

        {/* ── Filter Bar ── */}
        <div className="glass" style={{
          borderRadius: '16px',
          padding: '16px',
          marginBottom: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}>
          {/* Row 1: Players + Difficulty */}
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                인원
              </span>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {PLAYER_OPTIONS.map(n => (
                  <Chip
                    key={n}
                    label={`${n}인`}
                    active={filters.players === String(n)}
                    onClick={() => setFilters(f => ({ ...f, players: f.players === String(n) ? '' : String(n) }))}
                  />
                ))}
              </div>
            </div>

            <div style={{ width: '1px', height: '24px', background: 'var(--border-medium)' }} />

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                난이도
              </span>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
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
            </div>
          </div>

          {/* Row 2: Search + Category + Reset */}
          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            alignItems: 'center', 
            paddingTop: '12px',
            borderTop: '1px solid var(--border-subtle)' 
          }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: '340px' }}>
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
              <input
                type="text"
                className="input-field"
                placeholder="어떤 게임을 찾으시나요?"
                value={filters.search}
                onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
                style={{ width: '100%', paddingLeft: '34px' }}
              />
            </div>

            <select
              className="input-field"
              value={filters.category}
              onChange={(e) => setFilters(f => ({ ...f, category: e.target.value }))}
              style={{ width: '160px' }}
            >
              <option value="">모든 카테고리</option>
              {allCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>

            {hasActiveFilters && (
              <button
                onClick={() => setFilters({ search: '', players: '', difficulty: '', category: '' })}
                style={{
                  display: 'flex', alignItems: 'center', gap: '5px',
                  background: 'var(--accent-glow)', border: 'none',
                  borderRadius: '8px', padding: '8px 14px', fontSize: '12px',
                  color: 'var(--accent-primary)', fontWeight: '600', cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.filter = 'brightness(0.95)'}
                onMouseLeave={e => e.currentTarget.style.filter = 'none'}
              >
                <RotateCcw size={13} /> 필터 초기화
              </button>
            )}

            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500' }}>
                {filteredCollection.length} Results
              </span>
              <div className="view-toggle">
                <button
                  className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                >
                  <LayoutGrid size={16} />
                </button>
                <button
                  className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Content ── */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <div className="animate-fade-in">
              <Dice5 size={48} className="animate-spin" style={{ color: 'var(--accent-primary)', marginBottom: '16px' }} />
              <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>보드게임을 불러오는 중...</p>
            </div>
          </div>
        ) : filteredCollection.length === 0 ? (
          <div className="glass animate-slide-up" style={{ textAlign: 'center', padding: '80px', borderRadius: '24px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
            <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>검색 결과가 없습니다</h3>
            <p style={{ color: 'var(--text-secondary)' }}>다른 검색어나 필터를 적용해 보세요.</p>
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
          marginTop: '64px', padding: '32px 0',
          borderTop: '1px solid var(--border-subtle)',
          textAlign: 'center',
          color: 'var(--text-tertiary)', fontSize: '12px'
        }}>
          <p>© 2026 Board Game Collector</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '12px' }}>
            <span 
              onClick={() => setShowEnricher(true)} 
              style={{ cursor: 'pointer', hover: { color: 'var(--text-secondary)' } }}
            >
              Admin Tools
            </span>
          </div>
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
        <GameDetail game={selectedGame} onClose={() => setSelectedGame(null)} onDelete={removeGame} onUpdate={updateGame} />,
        document.body
      )}
    </div>
  );
}

export default App;
