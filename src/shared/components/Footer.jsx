import React from 'react';

export default function Footer({ onOpenAdmin }) {
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
          style={{ cursor: 'pointer', hover: { color: 'var(--text-secondary)' } }}
        >
          Admin Tools
        </span>
      </div>
    </footer>
  );
}
