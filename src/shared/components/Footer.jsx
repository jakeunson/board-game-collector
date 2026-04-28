import React from 'react';

export default function Footer({ onOpenAdmin, onOpenRental }) {
  return (
    <footer style={{
      marginTop: 'auto', padding: '32px 0',
      borderTop: '1px solid var(--border-subtle)',
      textAlign: 'center',
      color: 'var(--text-tertiary)', fontSize: '12px'
    }}>
      <p>© 2026 Board Game Collector</p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '12px' }}>
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
      </div>
    </footer>
  );
}
