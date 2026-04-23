import React from 'react';
import { X, MessageSquare, Image, Search, Info } from 'lucide-react';

function AddGameModal({ onClose }) {
  return (
    <div style={{ 
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
    }}>
      <div className="animate-slide-up" style={{ 
        width: '100%', 
        maxWidth: '500px', 
        borderRadius: '16px', 
        overflow: 'hidden',
        background: '#ffffff',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
      }}>
        <div style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700' }}>AI 게임 추가 가이드</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        <div style={{ padding: '32px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
              <div style={{ background: '#f4f4f5', padding: '12px', borderRadius: '8px' }}>
                <Image size={24} style={{ color: '#005a9e' }} />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', marginBottom: '4px', fontWeight: '600' }}>1. 사진 또는 URL 전달</h3>
                <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.6' }}>
                  보드게임 박스 사진이나 보드라이프/BGG URL을 **대화창**에 입력해 주세요.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
              <div style={{ background: '#f4f4f5', padding: '12px', borderRadius: '8px' }}>
                <Search size={24} style={{ color: '#005a9e' }} />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', marginBottom: '4px', fontWeight: '600' }}>2. AI 데이터 수집 및 분석</h3>
                <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.6' }}>
                  Antigravity가 웹을 탐색하여 인원, 시간, 난이도, 고화질 이미지 등을 자동으로 수집합니다.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
              <div style={{ background: '#f4f4f5', padding: '12px', borderRadius: '8px' }}>
                <MessageSquare size={24} style={{ color: '#005a9e' }} />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', marginBottom: '4px', fontWeight: '600' }}>3. 즉시 컬렉션 반영</h3>
                <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.6' }}>
                  분석이 완료되면 AI가 직접 데이터베이스에 게임을 추가합니다. 새로고침만 하면 확인 가능합니다!
                </p>
              </div>
            </div>

            <div style={{ marginTop: '12px', padding: '20px', background: '#f0f7ff', borderRadius: '12px', border: '1px solid #d0e7ff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#005a9e', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                <Info size={18} />
                <span>지금 바로 요청해 보세요</span>
              </div>
              <p style={{ fontSize: '13px', color: '#5d5d5d' }}>
                "이 게임 추가해줘: [URL 또는 이름]" 라고 말씀하시면 제가 바로 처리해 드릴게요.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddGameModal;
