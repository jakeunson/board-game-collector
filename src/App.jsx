import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Dice5 } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';

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
import ChangePasswordModal from './features/admin/ChangePasswordModal';

/**
 * activeModal 가능한 값:
 *   'addGame' | 'enricher' | 'auth' | 'rental' | 'login' | 'changePassword' | null
 */
function AppContent() {
  const { loading, removeGame, updateGame, isAdmin } = useGames();
  const { filteredCollection, viewMode } = useFilters();

  const [activeModal, setActiveModal] = useState(null);
  const [authCallback, setAuthCallback] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);

  const openModal = name => setActiveModal(name);
  const closeModal = () => setActiveModal(null);

  useEffect(() => {
    if (isAdmin) {
      const checkPendingRequests = async () => {
        try {
          const q = query(collection(db, 'rentalRequests'), where('status', '==', 'pending'));
          const snapshot = await getDocs(q);
          if (!snapshot.empty) {
            openModal('rental');
          }
        } catch (error) {
          console.error("Failed to check pending rental requests:", error);
        }
      };
      checkPendingRequests();
    }
  }, [isAdmin]);

  const handleAdminAction = action => {
    if (isAdmin) {
      action();
    } else {
      setAuthCallback(() => action);
      openModal('auth');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="container">

        <Header onOpenAddModal={() => handleAdminAction(() => openModal('addGame'))} />

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
          onOpenAdmin={() => openModal('enricher')}
          onOpenRental={() => openModal('rental')}
          onOpenLogin={() => openModal('login')}
          onOpenChangePassword={() => openModal('changePassword')}
        />
      </div>

      {/* ── Modals via Portals ── */}
      {activeModal === 'addGame' && createPortal(
        <AddGameModal
          onClose={closeModal}
          onAddSuccess={game => { closeModal(); setSelectedGame(game); }}
        />,
        document.body
      )}

      {activeModal === 'enricher' && createPortal(
        <BggEnricher onDone={closeModal} />,
        document.body
      )}

      {activeModal === 'auth' && createPortal(
        <AdminAuthModal
          mode="auth"
          onClose={closeModal}
          onSuccess={() => { if (authCallback) authCallback(); setAuthCallback(null); }}
        />,
        document.body
      )}

      {activeModal === 'login' && createPortal(
        <AdminAuthModal
          mode="login"
          onClose={closeModal}
        />,
        document.body
      )}

      {activeModal === 'rental' && createPortal(
        <RentalManager onClose={closeModal} />,
        document.body
      )}

      {activeModal === 'changePassword' && createPortal(
        <ChangePasswordModal onClose={closeModal} />,
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
