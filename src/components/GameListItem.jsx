import React from 'react';
import { Users, Clock, Star, Brain } from 'lucide-react';

function nameToColor(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return {
    bg: `hsl(${hue}, 40%, 80%)`,
    text: `hsl(${hue}, 40%, 25%)`,
  };
}

function GameListItem({ game, onClick, index = 0 }) {
  const [imgError, setImgError] = React.useState(false);
  const showImage = game.image && !imgError;
  const colors = nameToColor(game.name);
  const initial = game.name ? game.name.charAt(0) : '?';
  const isEven = index % 2 === 0;

  const players = game.minPlayers && game.maxPlayers
    ? game.minPlayers === game.maxPlayers
      ? `${game.maxPlayers}인`
      : `${game.minPlayers}–${game.maxPlayers}인`
    : game.maxPlayers ? `${game.maxPlayers}인` : null;

  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        padding: '10px 16px',
        background: isEven ? '#fff' : '#fafafa',
        border: '1px solid var(--border-subtle)',
        borderLeft: '3px solid transparent',
        borderRadius: '6px',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = '#f0f6ff';
        e.currentTarget.style.borderLeftColor = 'var(--accent-primary)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,90,158,0.1)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = isEven ? '#fff' : '#fafafa';
        e.currentTarget.style.borderLeftColor = 'transparent';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Thumbnail or Initial */}
      <div style={{ width: '44px', height: '44px', borderRadius: '6px', overflow: 'hidden', flexShrink: 0 }}>
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
            background: colors.bg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px', fontWeight: '800', color: colors.text,
          }}>
            {initial}
          </div>
        )}
      </div>

      {/* Name */}
      <span style={{
        flex: 1,
        fontSize: '14px',
        fontWeight: '600',
        color: 'var(--text-primary)',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        minWidth: 0,
      }} title={game.name}>
        {game.name}
      </span>

      {/* Players */}
      {players && (
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-secondary)', width: '68px', flexShrink: 0 }}>
          <Users size={12} /> {players}
        </span>
      )}

      {/* Play Time */}
      {game.playingTime && (
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-secondary)', width: '56px', flexShrink: 0 }}>
          <Clock size={12} /> {game.playingTime}분
        </span>
      )}

      {/* Difficulty */}
      {game.weight && (
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-secondary)', width: '52px', flexShrink: 0 }}>
          <Brain size={12} /> {game.weight}
        </span>
      )}

      {/* Rating */}
      {game.rating && (
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-secondary)', width: '44px', flexShrink: 0 }}>
          <Star size={12} style={{ color: '#f59e0b' }} /> {game.rating}
        </span>
      )}

      {/* Badges */}
      <div style={{ display: 'flex', gap: '5px', flexShrink: 0, minWidth: '80px', justifyContent: 'flex-end' }}>
        {game.weight && (
          <span className="badge badge-weight">W {game.weight}</span>
        )}
        {game.category && (
          <span className="badge badge-category" style={{ maxWidth: '100px' }}>
            {game.category.split(',')[0].trim()}
          </span>
        )}
      </div>
    </div>
  );
}

export default GameListItem;
