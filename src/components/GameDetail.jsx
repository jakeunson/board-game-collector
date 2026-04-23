import React from 'react';
import { Users, Clock, Star, Brain, X, Trash2, ExternalLink, Video, Search, Globe } from 'lucide-react';

function StatBox({ icon, label, value }) {
  if (!value) return null;
  return (
    <div style={{ background: '#f9f9f9', padding: '12px', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
      <div style={{ marginBottom: '4px', color: 'var(--accent-primary)', display: 'flex', justifyContent: 'center' }}>{icon}</div>
      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '2px' }}>{label}</div>
      <div style={{ fontWeight: '600', fontSize: '14px' }}>{value}</div>
    </div>
  );
}

function TagList({ items, color = '#333', bg = '#f0f0f0' }) {
  if (!items) return <span style={{ color: 'var(--text-tertiary)', fontSize: '13px' }}>정보 없음</span>;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
      {items.split(',').map((item, i) => (
        <span key={i} style={{ padding: '3px 10px', background: bg, borderRadius: 'var(--radius-sm)', fontSize: '12px', color }}>{item.trim()}</span>
      ))}
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
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px', background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(10px)'
      }}
    >
      <div
        className="animate-slide-up"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: '900px', maxHeight: '90vh',
          background: '#fff', borderRadius: '12px',
          overflow: 'hidden', display: 'flex', flexDirection: 'column',
          boxShadow: 'var(--shadow-flyout)'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '14px 20px', display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', borderBottom: '1px solid var(--border-subtle)'
        }}>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '500' }}>게임 상세 정보</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', color: 'var(--text-secondary)', display: 'flex' }}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '40px' }}>

            {/* Left: Image + Stats */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ position: 'relative', width: '100%', paddingBottom: '100%', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 8px 30px rgba(0,0,0,0.15)' }}>
                <img
                  src={game.image}
                  alt={game.name}
                  referrerPolicy="no-referrer"
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { e.currentTarget.parentElement.style.display = 'none'; }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <StatBox icon={<Users size={16} />} label="인원" value={players} />
                <StatBox icon={<Clock size={16} />} label="시간" value={game.playingTime ? `${game.playingTime}분` : null} />
                <StatBox icon={<Star size={16} />} label="평점" value={game.rating} />
                <StatBox icon={<Brain size={16} />} label="난이도" value={game.weight} />
              </div>
            </div>

            {/* Right: Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              <div>
                <h1 style={{ fontSize: '28px', fontWeight: '800', lineHeight: '1.2', marginBottom: '6px', color: 'var(--text-primary)' }}>{game.name}</h1>
                {game.year && <div style={{ fontSize: '14px', color: 'var(--text-tertiary)' }}>발매: {game.year}년</div>}
              </div>

              {game.description && (
                <div>
                  <h3 style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-tertiary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>게임 소개</h3>
                  <p style={{ lineHeight: '1.8', color: 'var(--text-primary)', fontSize: '15px' }}>{game.description}</p>
                </div>
              )}

              <div>
                <h3 style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-tertiary)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>카테고리 및 태그</h3>
                <TagList items={game.category} color="var(--accent-primary)" bg="rgba(0,90,158,0.06)" />
              </div>

              {/* External Links Section */}
              <div style={{ marginTop: '10px', borderTop: '1px solid var(--border-subtle)', paddingTop: '20px' }}>
                <h3 style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-tertiary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>외부 링크 및 추가 정보</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <a
                    href={game.bggId ? `https://boardgamegeek.com/boardgame/${game.bggId}` : `https://boardgamegeek.com/search/boardgames?q=${encodeURIComponent(game.name)}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: '#f8f9fa', borderRadius: '8px', textDecoration: 'none', color: 'var(--text-primary)', fontSize: '13px', transition: 'background 0.2s' }}
                    onMouseOver={e => e.currentTarget.style.background = '#f0f1f2'}
                    onMouseOut={e => e.currentTarget.style.background = '#f8f9fa'}
                  >
                    <Globe size={16} style={{ color: '#ff5100' }} /> 보드게임긱 (BGG)
                  </a>
                  <a
                    href={game.boardlifeId ? `https://boardlife.co.kr/game/${game.boardlifeId}` : `https://boardlife.co.kr/bbs_list.php?tb=boardgame_strategy&search_mode=ok&game_id=&search_word=${encodeURIComponent(game.name)}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: '#f8f9fa', borderRadius: '8px', textDecoration: 'none', color: 'var(--text-primary)', fontSize: '13px', transition: 'background 0.2s' }}
                    onMouseOver={e => e.currentTarget.style.background = '#f0f1f2'}
                    onMouseOut={e => e.currentTarget.style.background = '#f8f9fa'}
                  >
                    <ExternalLink size={16} style={{ color: 'var(--accent-primary)' }} /> 보드라이프 (BoardLife)
                  </a>
                  <a
                    href={`https://search.naver.com/search.naver?where=post&query=${encodeURIComponent(game.name + ' 보드게임')}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: '#f8f9fa', borderRadius: '8px', textDecoration: 'none', color: 'var(--text-primary)', fontSize: '13px', transition: 'background 0.2s' }}
                    onMouseOver={e => e.currentTarget.style.background = '#f0f1f2'}
                    onMouseOut={e => e.currentTarget.style.background = '#f8f9fa'}
                  >
                    <Search size={16} style={{ color: '#10b981' }} /> 네이버 블로그 리뷰
                  </a>
                  <a
                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(game.name + ' 보드게임 룰 설명')}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: '#f8f9fa', borderRadius: '8px', textDecoration: 'none', color: 'var(--text-primary)', fontSize: '13px', transition: 'background 0.2s' }}
                    onMouseOver={e => e.currentTarget.style.background = '#f0f1f2'}
                    onMouseOut={e => e.currentTarget.style.background = '#f8f9fa'}
                  >
                    <Video size={16} style={{ color: '#ef4444' }} /> 유튜브 룰 설명 영상
                  </a>
                </div>
              </div>

              {/* Action Section */}
              <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => onDelete(game.id)}
                  style={{
                    background: 'none', border: '1px solid #fee2e2', color: '#dc2626',
                    borderRadius: '8px', padding: '8px 16px', fontSize: '13px', fontWeight: '600',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.borderColor = '#fecaca'; }}
                  onMouseOut={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = '#fee2e2'; }}
                >
                  <Trash2 size={16} /> 컬렉션에서 삭제
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GameDetail;
