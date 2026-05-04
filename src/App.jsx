import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Dice5 } from 'lucide-react';

// Contexts
import { GameProvider, useGames } from './contexts/GameContext';
import { FilterProvider, useFilters } from './contexts/FilterContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Components
import Header from './shared/components/Header';
import Footer from './shared/components/Footer';
import FilterBar from './features/filters/FilterBar';
import GameCard from './features/games/GameCard';
import GameListItem from './features/games/GameListItem';
import GameDetail from './features/games/GameDetail';
import AddGameModal from './features/admin/AddGameModal';
import BggEnricher from './features/admin/BggEnricher';
import AdminAuthModal from './features/admin/AdminAuthModal';
import RentalManager from './features/admin/RentalManager';
import AdminLoginModal from './features/admin/AdminLoginModal';
import ChangePasswordModal from './features/admin/ChangePasswordModal';



function AppContent() {
  const { loading, removeGame, updateGame, isAdmin } = useGames();
  const { filteredCollection, viewMode } = useFilters();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [showEnricher, setShowEnricher] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authCallback, setAuthCallback] = useState(null);
  const [showRentalManager, setShowRentalManager] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  const handleAdminAction = (action) => {
    if (isAdmin) {
      action();
    } else {
      setAuthCallback(() => action);
      setShowAuthModal(true);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="container">

        <Header onOpenAddModal={() => handleAdminAction(() => setIsModalOpen(true))} />

        <FilterBar />

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

        <Footer 
          onOpenAdmin={() => setShowEnricher(true)} 
          onOpenRental={() => setShowRentalManager(true)} 
          onOpenLogin={() => setShowLoginModal(true)}
          onOpenChangePassword={() => setShowChangePasswordModal(true)}
        />
      </div>

      {/* Modals via Portals */}
      {isModalOpen && createPortal(
        <AddGameModal 
          onClose={() => setIsModalOpen(false)} 
          onAddSuccess={(game) => {
            setIsModalOpen(false);
            setSelectedGame(game);
          }} 
        />,
        document.body
      )}
      {showEnricher && createPortal(
        <BggEnricher onDone={() => setShowEnricher(false)} />,
        document.body
      )}
      {showAuthModal && createPortal(
        <AdminAuthModal 
          onClose={() => setShowAuthModal(false)} 
          onSuccess={() => {
            if (authCallback) authCallback();
            setAuthCallback(null);
          }} 
        />,
        document.body
      )}
      {showRentalManager && createPortal(
        <RentalManager onClose={() => setShowRentalManager(false)} />,
        document.body
      )}
      {selectedGame && createPortal(
        <GameDetail
          key={selectedGame.id}
          game={selectedGame}
          onClose={() => setSelectedGame(null)}
          onDelete={removeGame}
          onUpdate={updateGame}
          onGameChange={setSelectedGame}
        />,
        document.body
      )}
      {showLoginModal && createPortal(
        <AdminLoginModal onClose={() => setShowLoginModal(false)} />,
        document.body
      )}
      {showChangePasswordModal && createPortal(
        <ChangePasswordModal onClose={() => setShowChangePasswordModal(false)} />,
        document.body
      )}
    </div>
  );
}

export default function App() {
  return (
    <GameProvider>
      <FilterProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </FilterProvider>
    </GameProvider>
  );
}
