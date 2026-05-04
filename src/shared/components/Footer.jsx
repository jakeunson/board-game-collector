import React from 'react';
import { useGames } from '../../contexts/GameContext';

export default function Footer({ onOpenAdmin, onOpenRental, onOpenLogin, onOpenChangePassword }) {
  const { isAdmin, logout } = useGames();

  return (
    <footer style={{
      marginTop: 'auto', padding: '32px 0',
      borderTop: '1px solid var(--border-subtle)',
      textAlign: 'center',
      color: 'var(--text-tertiary)', fontSize: '12px'
    }}>
      <p>© 2026 Board Game Collector</p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '12px' }}>
        {!isAdmin ? (
          <span 
            onClick={onOpenLogin} 
            style={{ cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}
          >
            관리자 로그인
          </span>
        ) : (
          <>
            <span 
              onClick={onOpenAdmin} 
              style={{ cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}
            >
              Admin Tools
            </span>
            <span>|</span>
            <span 
              onClick={onOpenRental} 
              style={{ cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}
            >
              대여 관리
            </span>
            <span>|</span>
            <span 
              onClick={onOpenChangePassword} 
              style={{ cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}
            >
              비밀번호 변경
            </span>
            <span>|</span>
            <span 
              onClick={logout} 
              style={{ cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}
            >
              로그아웃
            </span>
          </>
        )}
      </div>
    </footer>
  );
}
