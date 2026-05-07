import React from 'react';
import { Users, Clock, Star, Brain } from 'lucide-react';
import { nameToGradient, formatPlayers } from '../../utils/helpers';

function GameListItem({ game, onClick }) {
  const [imgError, setImgError] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 768);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const showImage = game.image && !imgError;
  const gradient = nameToGradient(game.name);
  const initial = game.name ? game.name.charAt(0) : '?';

  const players = formatPlayers(game.minPlayers, game.maxPlayers);

  return (
    <div
      onClick={onClick}
      className="glass"
      style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'stretch' : 'center',
        gap: isMobile ? '12px' : '16px',
        padding: isMobile ? '12px' : '12px 20px',
        borderRadius: '12px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        borderLeft: '4px solid transparent',
        minWidth: 0,
        overflow: 'hidden',
        width: '100%',
      }}
      onMouseEnter={e => {
        if (!isMobile) {
          e.currentTarget.style.background = 'var(--bg-hover)';
          e.currentTarget.style.borderLeftColor = 'var(--accent-primary)';
          e.currentTarget.style.transform = 'translateX(4px)';
          e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
        }
      }}
      onMouseLeave={e => {
        if (!isMobile) {
          e.currentTarget.style.background = 'var(--bg-card)';
          e.currentTarget.style.borderLeftColor = 'transparent';
          e.currentTarget.style.transform = 'translateX(0)';
          e.currentTarget.style.boxShadow = 'var(--shadow-md)';
        }
      }}
    >
      {/* Top row / Main content */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: 0 }}>
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
            fontSize: isMobile ? '14px' : '15px',
            fontWeight: '700',
            color: 'var(--text-primary)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            marginBottom: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }} title={game.name}>
            {game.isHidden && (
              <span style={{
                background: 'rgba(244, 63, 94, 0.15)',
                color: '#f43f5e',
                padding: '1px 6px',
                borderRadius: '6px',
                fontSize: '10px',
                fontWeight: '800',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                flexShrink: 0
              }}>
                🔒 비공개
              </span>
            )}
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{game.name}</span>
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
      </div>

      {/* Stats */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        flexWrap: isMobile ? 'wrap' : 'nowrap',
        gap: isMobile ? '12px' : '20px', 
        justifyContent: 'flex-start',
        borderTop: isMobile ? '1px solid var(--border-subtle)' : 'none',
        paddingTop: isMobile ? '10px' : '0',
        marginTop: isMobile ? '2px' : '0'
      }}>
        {players && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)', width: isMobile ? 'auto' : '70px' }}>
            <Users size={14} style={{ color: 'var(--accent-primary)' }} />
            <span>{players}</span>
          </div>
        )}

        {game.playingTime && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)', width: isMobile ? 'auto' : '60px' }}>
            <Clock size={14} style={{ color: 'var(--accent-primary)' }} />
            <span>{game.playingTime}m</span>
          </div>
        )}

        {game.weight && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)', width: isMobile ? 'auto' : '50px' }}>
            <Brain size={14} style={{ color: 'var(--accent-primary)' }} />
            <span>{game.weight}</span>
          </div>
        )}

        {game.rating && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)', width: isMobile ? 'auto' : '50px' }}>
            <Star size={14} fill="#f59e0b" stroke="#f59e0b" />
            <span style={{ fontWeight: '700' }}>{game.rating}</span>
          </div>
        )}

        {!isMobile && game.weight && (
          <div style={{ marginLeft: '12px', minWidth: '40px', display: 'flex', justifyContent: 'flex-end' }}>
            <span className="badge badge-weight">W {game.weight}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default React.memo(GameListItem);
