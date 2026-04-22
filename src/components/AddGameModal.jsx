import React from 'react';
import { X, MessageSquare, Image, Search, Info, ExternalLink } from 'lucide-react';

function AddGameModal({ onClose }) {
  return (
    <div className="glass-modal" style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      zIndex: 1000, 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="glass animate-fade-in" style={{ 
        width: '100%', 
        maxWidth: '500px', 
        borderRadius: '4px', 
        overflow: 'hidden',
        position: 'relative',
        background: '#ffffff'
      }}>
        <div style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)' }}>
          <h2 className="font-heading" style={{ fontSize: '20px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>How to Add Games</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        <div style={{ padding: '32px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
              <div style={{ background: '#f4f4f5', padding: '12px', borderRadius: '4px' }}>
                <Image size={24} style={{ color: 'black' }} />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', marginBottom: '4px' }}>1. 사진 업로드</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  보드게임 박스 사진이나 이름을 **AI 어시스턴트(Antigravity)** 대화창에 전달해 주세요.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
              <div style={{ background: '#f4f4f5', padding: '12px', borderRadius: '4px' }}>
                <Search size={24} style={{ color: 'black' }} />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', marginBottom: '4px' }}>2. 정보 수집 및 분석</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  AI가 보드라이프(BoardLife)와 BGG 데이터를 분석하여 한글 정보와 플레이 규칙 영상을 찾아냅니다.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
              <div style={{ background: '#f4f4f5', padding: '12px', borderRadius: '4px' }}>
                <MessageSquare size={24} style={{ color: 'black' }} />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', marginBottom: '4px' }}>3. 자동 업데이트</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  분석된 정보가 앱의 컬렉션 데이터에 즉시 반영됩니다. 새로고침만 하면 확인하실 수 있습니다.
                </p>
              </div>
            </div>

            <div style={{ marginTop: '12px', padding: '16px', background: '#f9fafb', border: '1px solid var(--glass-border)', borderRadius: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'black', fontSize: '13px', marginBottom: '8px' }}>
                <Info size={16} />
                <span>커스텀 추가 (수동)</span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                특정 게임의 정보를 직접 수정하거나 소량의 데이터를 수동으로 관리하고 싶을 때 활용하세요.
              </p>
              <button 
                className="btn-primary" 
                style={{ width: '100%', background: 'transparent', border: '1px solid black', color: 'black' }}
                onClick={() => alert('수동 추가 기능은 추후 업데이트 예정입니다. 현재는 AI에게 요청해 주세요!')}
              >
                수동 입력 폼 열기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddGameModal;
