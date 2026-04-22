import React from 'react';
import { Users, Clock, Star, Trash2 } from 'lucide-react';

function GameCard({ game, onDelete, onClick }) {
  return (
    <div 
      className="glass-card animate-slide-up" 
      onClick={onClick}
      style={{ 
        overflow: 'hidden', 
        position: 'relative', 
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <div style={{ height: '160px', overflow: 'hidden', position: 'relative' }}>
        <img 
          src={game.image} 
          alt={game.name} 
          referrerPolicy="no-referrer"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>

      <div style={{ padding: '12px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-primary)' }}>{game.name}</h3>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Users size={12} />
            <span>{game.maxPlayers}인</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={12} />
            <span>{game.playingTime}분</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Star size={12} style={{ color: '#fbbf24' }} />
            <span>{game.rating}</span>
          </div>
        </div>

        <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            onClick={onDelete}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#d1d1d1', 
              cursor: 'pointer',
              padding: '4px',
              transition: 'color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.color = '#ef4444'}
            onMouseOut={(e) => e.currentTarget.style.color = '#d1d1d1'}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default GameCard;
