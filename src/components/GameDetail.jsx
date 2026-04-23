import React from 'react';
import { Users, Clock, Star, Brain, X, Trash2, ExternalLink, Video, Search, Globe, Calendar, Layers, Puzzle } from 'lucide-react';

function StatCard({ icon, label, value, color }) {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div className="glass" style={{ 
      padding: '12px 8px', 
      borderRadius: '12px', 
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '4px',
      borderBottom: `2px solid ${color || 'var(--accent-primary)'}`
    }}>
      <div style={{ color: color || 'var(--accent-primary)', display: 'flex' }}>
        {React.isValidElement(icon) ? React.cloneElement(icon, { size: 16 }) : icon}
      </div>
      <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontWeight: '700', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontWeight: '800', fontSize: '14px', color: 'var(--text-primary)' }}>{value}</div>
    </div>
  );
}

function TagList({ items, icon, label }) {
  if (!items) return null;
  return (
    <div style={{ marginBottom: '16px' }}>
      <h3 style={{ 
        fontSize: '11px', 
        fontWeight: '800', 
        color: 'var(--text-tertiary)', 
        marginBottom: '8px', 
        textTransform: 'uppercase', 
        letterSpacing: '0.05em',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}>
        {icon} {label}
      </h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {items.split(',').map((item, i) => (
          <span 
            key={i} 
            style={{ 
              padding: '4px 10px', 
              background: 'var(--bg-app)', 
              borderRadius: '8px', 
              fontSize: '12px', 
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-subtle)'
            }}
          >
            {item.trim()}
          </span>
        ))}
      </div>
    </div>
  );
}

function GameDetail({ game, onClose, onDelete }) {
  if (!game) return null;

  const players = game.minPlayers && game.maxPlayers
    ? game.minPlayers === game.maxPlayers ? `${game.maxPlayers}인` : `${game.minPlayers}–${game.maxPlayers}인`
    : game.maxPlayers ? `${game.maxPlayers}인` : null;

  return (
    <div
      onClick={onClose}
      className="animate-fade-in"
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)'
      }}
    >
      {/* Immersive Background Blur */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `url(${game.image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'blur(60px) brightness(0.4)',
        opacity: 0.4,
        zIndex: -1
      }} />

      <div
        className="animate-slide-up glass"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: '800px', maxHeight: '95vh',
          borderRadius: '20px', overflow: 'hidden', display: 'flex',
          flexDirection: 'column', boxShadow: 'var(--shadow-xl)',
          background: 'var(--bg-modal)', border: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '16px 24px', display: 'flex', justifyContent: 'space-between', 
          alignItems: 'center', borderBottom: '1px solid var(--border-subtle)'
        }}>
          <span style={{ fontSize: '13px', color: 'var(--text-tertiary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Game Details
          </span>
          <button 
            onClick={onClose} 
            style={{ 
              background: 'var(--bg-app)', border: 'none', cursor: 'pointer', 
              padding: '6px', color: 'var(--text-secondary)', borderRadius: '50%',
              display: 'flex', transition: 'all 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-primary)'}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '270px 1fr', gap: '32px' }}>
            
            {/* Left Column: Image + Stats */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ 
                width: '100%', 
                borderRadius: '20px', 
                overflow: 'hidden', 
                boxShadow: 'var(--shadow-lg)',
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-app)'
              }}>
                <img
                  src={game.image}
                  alt={game.name}
                  referrerPolicy="no-referrer"
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
              </div>

              {/* Stat Grid (2x2) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <StatCard icon={<Users />} label="인원" value={players} color="#6366f1" />
                <StatCard icon={<Clock />} label="시간" value={game.playingTime ? `${game.playingTime}m` : null} color="#8b5cf6" />
                <StatCard icon={<Star />} label="평점" value={game.rating} color="#f59e0b" />
                <StatCard icon={<Brain />} label="난이도" value={game.weight} color="#ec4899" />
              </div>
            </div>

            {/* Right Column: Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="animate-slide-up">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  {game.category && game.category.split(',').slice(0, 3).map((cat, i) => (
                    <span key={i} className="badge badge-category" style={{ fontSize: '10px' }}>{cat.trim()}</span>
                  ))}
                  {game.year && (
                    <span style={{ fontSize: '13px', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '4px' }}>
                      <Calendar size={13} /> {game.year}
                    </span>
                  )}
                </div>
                <h1 style={{ fontSize: '26px', fontWeight: '900', lineHeight: '1.2', color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
                  {game.name}
                </h1>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {game.description && (
                  <div>
                    <h3 style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-tertiary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>게임 소개</h3>
                    <p style={{ 
                      lineHeight: '1.6', color: 'var(--text-secondary)', fontSize: '13px',
                      display: '-webkit-box', WebkitLineClamp: 6, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                    }}>
                      {game.description}
                    </p>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <TagList items={game.theme} icon={<Layers size={14} />} label="테마" />
                  <TagList items={game.mechanisms} icon={<Puzzle size={14} />} label="진행 방식" />
                </div>
              </div>

              {/* External Links */}
              <div>
                <h3 style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-tertiary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>추가 정보 및 리뷰</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <LinkButton 
                    href={game.bggId ? `https://boardgamegeek.com/boardgame/${game.bggId}` : `https://boardgamegeek.com/search/boardgames?q=${encodeURIComponent(game.name)}`}
                    icon={<Globe size={16} />} 
                    label="BoardGameGeek" 
                    color="#ff5100" 
                  />
                  <LinkButton 
                    href={game.boardlifeId ? `https://boardlife.co.kr/game/${game.boardlifeId}` : `https://boardlife.co.kr/bbs_list.php?tb=boardgame_strategy&search_mode=ok&game_id=&search_word=${encodeURIComponent(game.name)}`}
                    icon={<ExternalLink size={16} />} 
                    label="BoardLife" 
                    color="#005a9e" 
                  />
                  <LinkButton 
                    href={`https://search.naver.com/search.naver?where=post&query=${encodeURIComponent(game.name + ' 보드게임')}`}
                    icon={<Search size={16} />} 
                    label="Naver Review" 
                    color="#10b981" 
                  />
                  <LinkButton 
                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(game.name + ' 보드게임 룰 설명')}`}
                    icon={<Video size={16} />} 
                    label="YouTube Tutorial" 
                    color="#ef4444" 
                  />
                </div>
              </div>

              {/* Delete Button */}
              <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end', paddingTop: '16px' }}>
                <button
                  onClick={() => onDelete(game.id)}
                  style={{
                    background: 'none', border: '1px solid rgba(220, 38, 38, 0.2)', color: '#ef4444',
                    borderRadius: '10px', padding: '8px 16px', fontSize: '13px', fontWeight: '600',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(220, 38, 38, 0.05)'; e.currentTarget.style.borderColor = '#ef4444'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.2)'; }}
                >
                  <Trash2 size={14} /> 컬렉션에서 삭제
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LinkButton({ href, icon, label, color }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      style={{ 
        display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', 
        background: 'var(--bg-app)', borderRadius: '10px', textDecoration: 'none', 
        color: 'var(--text-primary)', fontSize: '12px', fontWeight: '600',
        border: '1px solid var(--border-subtle)', transition: 'all 0.2s' 
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = color;
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = `0 4px 12px ${color}15`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border-subtle)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{ color }}>{icon}</div>
      {label}
    </a>
  );
}

export default GameDetail;
