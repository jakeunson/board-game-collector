import React from 'react';
import { X, Users, Clock, Star, Brain, ExternalLink, Video, BookOpen, Globe } from 'lucide-react';

function GameDetail({ game, onClose }) {
  if (!game) return null;

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      zIndex: 2000, 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '40px',
      background: 'rgba(0,0,0,0.4)',
      backdropFilter: 'blur(10px)'
    }}>
      <div className="animate-slide-up" style={{ 
        width: '100%', 
        maxWidth: '900px', 
        maxHeight: '90vh',
        background: '#ffffff', 
        borderRadius: '8px', 
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
      }}>
        <div style={{ 
          padding: '16px 24px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: '1px solid #eee'
        }}>
          <h2 style={{ fontSize: '14px', fontWeight: '400', color: '#5d5d5d' }}>게임 상세 정보</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '40px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <img 
                src={game.image} 
                alt={game.name} 
                referrerPolicy="no-referrer"
                style={{ width: '100%', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ background: '#f9f9f9', padding: '12px', borderRadius: '4px', textAlign: 'center' }}>
                  <Users size={16} style={{ marginBottom: '4px', color: '#005a9e' }} />
                  <div style={{ fontSize: '12px', color: '#5d5d5d' }}>인원</div>
                  <div style={{ fontWeight: '600' }}>{game.minPlayers}-{game.maxPlayers}인</div>
                </div>
                <div style={{ background: '#f9f9f9', padding: '12px', borderRadius: '4px', textAlign: 'center' }}>
                  <Clock size={16} style={{ marginBottom: '4px', color: '#005a9e' }} />
                  <div style={{ fontSize: '12px', color: '#5d5d5d' }}>시간</div>
                  <div style={{ fontWeight: '600' }}>{game.playingTime}분</div>
                </div>
                <div style={{ background: '#f9f9f9', padding: '12px', borderRadius: '4px', textAlign: 'center' }}>
                  <Star size={16} style={{ marginBottom: '4px', color: '#fbbf24' }} />
                  <div style={{ fontSize: '12px', color: '#5d5d5d' }}>평점</div>
                  <div style={{ fontWeight: '600' }}>{game.rating}</div>
                </div>
                <div style={{ background: '#f9f9f9', padding: '12px', borderRadius: '4px', textAlign: 'center' }}>
                  <Brain size={16} style={{ marginBottom: '4px', color: '#8b5cf6' }} />
                  <div style={{ fontSize: '12px', color: '#5d5d5d' }}>난이도</div>
                  <div style={{ fontWeight: '600' }}>{game.weight}</div>
                </div>
              </div>
            </div>

            <div>
              <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>{game.name}</h1>
                <div style={{ color: '#5d5d5d', fontSize: '14px' }}>발매 연도: {game.year}년</div>
              </div>

              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', borderBottom: '2px solid #005a9e', display: 'inline-block' }}>게임 소개</h3>
                <p style={{ lineHeight: '1.7', color: '#333' }}>{game.description}</p>
              </div>

              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', borderBottom: '2px solid #005a9e', display: 'inline-block' }}>상세 정보</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#5d5d5d', marginBottom: '8px' }}>카테고리</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {game.category?.split(',').map((item, i) => (
                        <span key={i} style={{ padding: '4px 10px', background: '#f0f0f0', borderRadius: '4px', fontSize: '12px', color: '#333' }}>{item.trim()}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#5d5d5d', marginBottom: '8px' }}>테마</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {game.theme?.split(',').map((item, i) => (
                        <span key={i} style={{ padding: '4px 10px', background: '#f0f0f0', borderRadius: '4px', fontSize: '12px', color: '#333' }}>{item.trim()}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#5d5d5d', marginBottom: '8px' }}>진행방식</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {game.mechanics?.split(',').map((item, i) => (
                        <span key={i} style={{ padding: '4px 10px', background: '#e0e7ff', borderRadius: '4px', fontSize: '12px', color: '#4338ca' }}>{item.trim()}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', borderBottom: '2px solid #005a9e', display: 'inline-block' }}>게임 갤러리</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                  {game.additionalImages?.map((url, index) => (
                    <div key={index} style={{ height: '120px', borderRadius: '4px', overflow: 'hidden', border: '1px solid #eee' }}>
                      <img 
                        src={url} 
                        alt={`gallery-${index}`} 
                        referrerPolicy="no-referrer"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600' }}>외부 링크</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <a href={game.links?.naverBlog} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: '#f3f3f3', borderRadius: '4px', textDecoration: 'none', color: '#1a1a1a', fontSize: '14px' }}>
                    <BookOpen size={18} style={{ color: '#10b981' }} />
                    <span>네이버 블로그 리뷰</span>
                  </a>
                  <a href={game.links?.youtubeRules} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: '#f3f3f3', borderRadius: '4px', textDecoration: 'none', color: '#1a1a1a', fontSize: '14px' }}>
                    <Video size={18} style={{ color: '#ef4444' }} />
                    <span>유튜브 규칙 설명</span>
                  </a>
                  <a href={`https://boardgamegeek.com/boardgame/${game.bggId || ''}`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: '#f3f3f3', borderRadius: '4px', textDecoration: 'none', color: '#1a1a1a', fontSize: '14px' }}>
                    <Globe size={18} style={{ color: '#ff5100' }} />
                    <span>BoardGameGeek 상세</span>
                  </a>
                  <a href={`https://boardlife.co.kr/game/${game.boardlifeId || ''}`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: '#f3f3f3', borderRadius: '4px', textDecoration: 'none', color: '#1a1a1a', fontSize: '14px' }}>
                    <ExternalLink size={18} style={{ color: '#005a9e' }} />
                    <span>보드라이프 상세</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GameDetail;
