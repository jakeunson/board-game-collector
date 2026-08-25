import React from 'react';

export default function AdminEditFields({ editData, onInputChange, children }) {
  return (
    <div className="section-box">
      <div className="form-group">
        <label className="form-label">구분 (기본판 / 확장판)</label>
        <select
          value={editData.type}
          onChange={e => onInputChange('type', e.target.value)}
          className="form-input"
        >
          <option value="base">기본판</option>
          <option value="expansion">확장판</option>
        </select>
      </div>

      {children}

      {/* 비공개 토글 */}
      <div style={{ marginTop: '8px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={editData.isHidden}
            onChange={e => onInputChange('isHidden', e.target.checked)}
            style={{ width: '16px', height: '16px', accentColor: '#f43f5e' }}
          />
          <span style={{ color: editData.isHidden ? '#f43f5e' : 'inherit' }}>
            🔒 관리자만 보기 (비공개)
          </span>
        </label>
        <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px', paddingLeft: '24px' }}>
          체크 시 비로그인 사용자의 목록 및 검색 결과에서 제외됩니다.
        </p>
      </div>

      {/* ID 편집 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)', marginTop: '4px' }}>
        <div className="form-group">
          <label className="form-label">보드라이프 ID</label>
          <input value={editData.boardlifeId || ''} onChange={e => onInputChange('boardlifeId', e.target.value)} className="form-input" />
        </div>
        <div className="form-group">
          <label className="form-label">BGG ID</label>
          <input value={editData.bggId || ''} onChange={e => onInputChange('bggId', e.target.value)} className="form-input" />
        </div>
      </div>
    </div>
  );
}
