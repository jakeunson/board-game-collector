import React from 'react';
import { Users, Clock, Star } from 'lucide-react';

function nameToGradient(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h1 = Math.abs(hash) % 360;
  const h2 = (h1 + 40) % 360;
  return `linear-gradient(135deg, hsl(${h1}, 45%, 65%), hsl(${h2}, 45%, 55%))`;
}

function GameCard({ game, onClick }) {
  const initial = game.name ? game.name.charAt(0) : '?';
  const [imgError, setImgError] = React.useState(false);
  const showImage = game.image && !imgError;
  const gradient = nameToGradient(game.name);

  return (
    <div
      onClick={onClick}
      className="glass"
      style={{
        borderRadius: '20px',
        overflow: 'hidden',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
        e.currentTarget.style.boxShadow = 'var(--shadow-xl), 0 0 20px var(--accent-glow)';
        e.currentTarget.style.borderColor = 'var(--accent-primary)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
        e.currentTarget.style.borderColor = 'var(--border-subtle)';
      }}
    >
      {/* Image / Placeholder */}
      <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
        {showImage ? (
          <>
            <img
              src={game.image}
              alt={game.name}
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'transform 0.6s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            />
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.8) 100%)',
              pointerEvents: 'none',
            }} />
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '16px',
            }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '700',
                color: '#ffffff',
                lineHeight: '1.3',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textShadow: '0 2px 4px rgba(0,0,0,0.5)',
              }}>
                {game.name}
              </h3>
            </div>
          </>
        ) : (
          <div style={{
            width: '100%',
            height: '100%',
            background: gradient,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <span style={{ fontSize: '64px', fontWeight: '900', color: '#ffffff', opacity: 0.9 }}>
              {initial}
            </span>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {!showImage && (
          <h3 style={{
            fontSize: '16px',
            fontWeight: '700',
            color: 'var(--text-primary)',
            lineHeight: '1.3',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {game.name}
          </h3>
        )}

        <div style={{ display: 'flex', gap: '12px', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: '500' }}>
          {game.maxPlayers && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Users size={14} className="text-accent" style={{ color: 'var(--accent-primary)' }} />
              {game.minPlayers && game.minPlayers !== game.maxPlayers ? `${game.minPlayers}-` : ''}{game.maxPlayers}인
            </span>
          )}
          {game.playingTime && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={14} className="text-accent" style={{ color: 'var(--accent-primary)' }} />
              {game.playingTime}분
            </span>
          )}
          {game.rating && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Star size={14} fill="#f59e0b" stroke="#f59e0b" />
              {game.rating}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: 'auto' }}>
          {game.weight && (
            <span className="badge badge-weight">
              W {parseFloat(game.weight).toFixed(1)}
            </span>
          )}
          {game.category && (
            <span className="badge badge-category">
              {game.category.split(',')[0].trim()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default React.memo(GameCard);
