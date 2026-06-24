import React from 'react';

export default function DangerButton({ onClick, icon: Icon, children }) {
  return (
    <button
      onClick={onClick}
      className="btn-danger"
      onMouseEnter={e => { 
        e.currentTarget.style.background = 'rgba(220, 38, 38, 0.05)'; 
        e.currentTarget.style.borderColor = '#ef4444'; 
      }}
      onMouseLeave={e => { 
        e.currentTarget.style.background = 'none'; 
        e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.2)'; 
      }}
    >
      {Icon && <Icon size={14} />} {children}
    </button>
  );
}
