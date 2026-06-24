import React from 'react';

export default function Chip({ label, sub, active, onClick }) {
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
