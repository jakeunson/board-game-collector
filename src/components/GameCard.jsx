import React from 'react';
import { Users, Clock, Star } from 'lucide-react';

// Generate a consistent pastel color from a string
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

function GameCard({ game, onClick }) {
  const initial = game.name ? game.name.charAt(0) : '?';
  const colors = nameToColor(game.name);
  const [imgError, setImgError] = React.useState(false);
  const showImage = game.image && !imgError;

  return (
    <div
      onClick={onClick}
      style={{
        background: '#fff',
        borderRadius: '12px',
        overflow: 'hidden',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid var(--border-subtle)',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        transition: 'transform 0.18s ease, box-shadow 0.18s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)';
      }}
    >
      {/* Image / Placeholder */}
      <div style={{ position: 'relative', height: '180px', overflow: 'hidden', flexShrink: 0 }}>
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
                transition: 'transform 0.3s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            />
            {/* Gradient overlay */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to bottom, transparent 35%, rgba(0,0,0,0.72) 100%)',
              pointerEvents: 'none',
            }} />
            {/* Name overlay on image */}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '10px 12px',
            }}>
              <h3 style={{
                fontSize: '14px',
                fontWeight: '700',
                color: '#fff',
                lineHeight: '1.35',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textShadow: '0 1px 3px rgba(0,0,0,0.5)',
              }}>
                {game.name}
              </h3>
            </div>
          </>
        ) : (
          /* Initial Placeholder */
          <div style={{
            width: '100%',
            height: '100%',
            background: colors.bg,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}>
            <span style={{ fontSize: '48px', fontWeight: '800', color: colors.text, lineHeight: 1 }}>
              {initial}
            </span>
          </div>
        )}
      </div>

      {/* Info section (always shown, smaller when image is present) */}
      <div style={{ padding: '10px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {/* Name (only when no image) */}
        {!showImage && (
          <h3 style={{
            fontSize: '14px',
            fontWeight: '600',
            color: 'var(--text-primary)',
            lineHeight: '1.35',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {game.name}
          </h3>
        )}

        {/* Stats */}
        <div style={{ display: 'flex', gap: '10px', color: 'var(--text-secondary)', fontSize: '12px', flexWrap: 'wrap' }}>
          {game.maxPlayers && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Users size={11} />
              {game.minPlayers && game.minPlayers !== game.maxPlayers ? `${game.minPlayers}–` : ''}{game.maxPlayers}인
            </span>
          )}
          {game.playingTime && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Clock size={11} /> {game.playingTime}분
            </span>
          )}
          {game.rating && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Star size={11} style={{ color: '#f59e0b' }} /> {game.rating}
            </span>
          )}
        </div>

        {/* Badges */}
        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginTop: 'auto', paddingTop: '2px' }}>
          {game.weight && (
            <span className="badge badge-weight">W {game.weight}</span>
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

export default GameCard;
