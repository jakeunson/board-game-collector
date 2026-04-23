import React from 'react';
import { X, MessageSquare, Image, Search, Info } from 'lucide-react';

function AddGameModal({ onClose }) {
  return (
    <div 
      className="animate-fade-in"
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        zIndex: 1000, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '20px',
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(8px)'
      }}
      onClick={onClose}
    >
      <div 
        className="animate-slide-up glass" 
        style={{ 
          width: '100%', 
          maxWidth: '540px', 
          borderRadius: '24px', 
          overflow: 'hidden',
          background: 'var(--bg-modal)',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--border-subtle)'
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ 
          padding: '24px 32px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          borderBottom: '1px solid var(--border-subtle)' 
        }}>
          <h2 style={{ fontSize: '22px', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            AI 게임 추가 가이드
          </h2>
          <button 
            onClick={onClose} 
            style={{ 
              background: 'var(--bg-app)', border: 'none', color: 'var(--text-secondary)', 
              cursor: 'pointer', width: '36px', height: '36px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-primary)'}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '32px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <GuideItem 
              icon={<Image size={24} />} 
              title="1. 사진 또는 URL 전달" 
              desc="보드게임 박스 사진이나 보드라이프/BGG URL을 대화창에 입력해 주세요."
            />
            <GuideItem 
              icon={<Search size={24} />} 
              title="2. AI 데이터 수집 및 분석" 
              desc="Antigravity가 웹을 탐색하여 인원, 시간, 난이도, 고화질 이미지 등을 자동으로 수집합니다."
            />
            <GuideItem 
              icon={<MessageSquare size={24} />} 
              title="3. 즉시 컬렉션 반영" 
              desc="분석이 완료되면 AI가 직접 데이터베이스에 게임을 추가합니다. 새로고침 없이 확인 가능합니다!"
            />

            <div style={{ 
              marginTop: '8px', 
              padding: '24px', 
              background: 'var(--accent-glow)', 
              borderRadius: '20px', 
              border: '1px solid var(--accent-primary)',
              opacity: 0.9
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px', 
                color: 'var(--accent-primary)', 
                fontSize: '15px', 
                fontWeight: '800', 
                marginBottom: '10px' 
              }}>
                <Info size={20} />
                <span>지금 바로 요청해 보세요</span>
              </div>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                "이 게임 추가해줘: [URL 또는 이름]" 라고 말씀하시면 제가 바로 처리해 드릴게요.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GuideItem({ icon, title, desc }) {
  return (
    <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
      <div style={{ 
        background: 'var(--bg-app)', 
        padding: '12px', 
        borderRadius: '12px', 
        color: 'var(--accent-primary)',
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid var(--border-subtle)'
      }}>
        {icon}
      </div>
      <div>
        <h3 style={{ fontSize: '17px', marginBottom: '6px', fontWeight: '700', color: 'var(--text-primary)' }}>{title}</h3>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{desc}</p>
      </div>
    </div>
  );
}

export default AddGameModal;
