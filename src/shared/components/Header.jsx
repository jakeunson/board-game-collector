import React from 'react';
import { Dice5, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useGames } from '../../contexts/GameContext';

export default function Header({ onOpenAddModal }) {
  const { theme, toggleTheme } = useTheme();
  const { gameCollection, loading, isAdmin } = useGames();
  const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 768);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <header className="header-container" style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: isMobile ? '12px 0' : '16px 0 24px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '12px' }}>
        <div style={{
          width: isMobile ? '32px' : '38px', height: isMobile ? '32px' : '38px',
          background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
          borderRadius: '8px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 8px var(--accent-glow)',
        }}>
          <Dice5 size={isMobile ? 16 : 20} color="#fff" />
        </div>
        <div>
          <h1 style={{ 
            fontSize: isMobile ? '15px' : '20px', 
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

      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '6px' : '12px' }}>
        <button 
          onClick={toggleTheme}
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-medium)',
            borderRadius: '10px',
            width: isMobile ? '32px' : '34px', height: isMobile ? '32px' : '34px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--text-secondary)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-medium)'}
          title={theme === 'light' ? '다크 모드로 전환' : '라이트 모드로 전환'}
        >
          {theme === 'light' ? <Moon size={isMobile ? 16 : 18} /> : <Sun size={isMobile ? 16 : 18} />}
        </button>
        {isAdmin && (
          <button className="btn-primary" onClick={onOpenAddModal} style={{ padding: isMobile ? '6px 12px' : '10px 20px', fontSize: isMobile ? '12px' : '14px' }}>
            {isMobile ? '+ 추가' : '+ 게임 추가'}
          </button>
        )}
      </div>
    </header>
  );
}
