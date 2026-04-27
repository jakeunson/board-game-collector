import React from 'react';
import { Users, Clock, Star, Brain } from 'lucide-react';

function nameToGradient(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `linear-gradient(135deg, hsl(${h}, 45%, 65%), hsl(${h}, 45%, 55%))`;
}

function GameListItem({ game, onClick }) {
  const [imgError, setImgError] = React.useState(false);
  const showImage = game.image && !imgError;
  const gradient = nameToGradient(game.name);
  const initial = game.name ? game.name.charAt(0) : '?';

  const players = game.minPlayers && game.maxPlayers
    ? game.minPlayers === game.maxPlayers
      ? `${game.maxPlayers}인`
      : `${game.minPlayers}–${game.maxPlayers}인`
    : game.maxPlayers ? `${game.maxPlayers}인` : null;

  return (
    <div
      onClick={onClick}
      className="glass"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '12px 20px',
        borderRadius: '12px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        borderLeft: '4px solid transparent',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'var(--bg-hover)';
        e.currentTarget.style.borderLeftColor = 'var(--accent-primary)';
        e.currentTarget.style.transform = 'translateX(4px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'var(--bg-card)';
        e.currentTarget.style.borderLeftColor = 'transparent';
        e.currentTarget.style.transform = 'translateX(0)';
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
      }}
    >
      {/* Thumbnail */}
      <div style={{ width: '56px', height: '56px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0 }}>
        {showImage ? (
          <img
            src={game.image}
            alt={game.name}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            background: gradient,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '24px', fontWeight: '900', color: '#ffffff',
          }}>
            {initial}
          </div>
        )}
      </div>

      {/* Name */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h4 style={{
          fontSize: '15px',
          fontWeight: '700',
          color: 'var(--text-primary)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          marginBottom: '4px'
        }} title={game.name}>
          {game.name}
        </h4>
        <div style={{ display: 'flex', gap: '8px' }}>
          {game.category && (
            <span style={{ fontSize: '11px', color: 'var(--accent-primary)', fontWeight: '600' }}>
              {game.category.split(',')[0].trim()}
            </span>
          )}
          {game.year && (
            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{game.year}</span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexShrink: 0 }}>
        {players && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)', width: '70px' }}>
            <Users size={14} style={{ color: 'var(--accent-primary)' }} />
            <span>{players}</span>
          </div>
        )}

        {game.playingTime && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)', width: '60px' }}>
            <Clock size={14} style={{ color: 'var(--accent-primary)' }} />
            <span>{game.playingTime}m</span>
          </div>
        )}

        {game.weight && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)', width: '50px' }}>
            <Brain size={14} style={{ color: 'var(--accent-primary)' }} />
            <span>{game.weight}</span>
          </div>
        )}

        {game.rating && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)', width: '50px' }}>
            <Star size={14} fill="#f59e0b" stroke="#f59e0b" />
            <span style={{ fontWeight: '700' }}>{game.rating}</span>
          </div>
        )}
      </div>

      {/* Weight Badge */}
      <div style={{ marginLeft: '12px', minWidth: '40px', display: 'flex', justifyContent: 'flex-end' }}>
        {game.weight && <span className="badge badge-weight">W {game.weight}</span>}
      </div>
    </div>
  );
}

export default React.memo(GameListItem);
