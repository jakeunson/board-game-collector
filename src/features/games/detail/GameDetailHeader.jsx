import React, { useState } from 'react';
import { X, Save, Undo, Edit2, Link, Check } from 'lucide-react';

/**
 * GameDetail 모달의 상단 헤더 영역
 * - 모달 제목 및 ID 표시
 * - 편집/저장/취소/닫기 버튼
 */
export default function GameDetailHeader({
  game,
  isEditing,
  isAdmin,
  onEdit,
  onSave,
  onCancelEdit,
  onClose,
}) {
  const isDev =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1');

  const canEdit = isDev || isAdmin;
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="detail-modal-header">
      {/* 좌측: 제목 + ID 뱃지 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span className="detail-header-title">
          {isEditing ? '정보 수정 모드' : 'Game Details'}
        </span>
        <span className="detail-header-badge">
          ID: {game.boardlifeId || game.id}
        </span>
      </div>

      {/* 우측: 액션 버튼 */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {isEditing ? (
          <>
            <button onClick={onSave} className="detail-btn-save">
              <Save size={14} /> 저장
            </button>
            <button onClick={onCancelEdit} className="detail-btn-cancel">
              <Undo size={14} /> 취소
            </button>
          </>
        ) : (
          canEdit && (
            <button onClick={onEdit} className="detail-btn-edit">
              <Edit2 size={14} /> 정보 수정
            </button>
          )
        )}

        <button
          onClick={handleCopyLink}
          className="detail-btn-edit"
          style={{ background: copied ? 'var(--accent-primary)' : 'var(--bg-glass)', color: copied ? 'white' : 'var(--text-primary)', borderColor: copied ? 'var(--accent-primary)' : 'var(--border-subtle)' }}
        >
          {copied ? <Check size={14} /> : <Link size={14} />} {copied ? '복사됨' : '링크'}
        </button>

        <button
          onClick={onClose}
          className="detail-btn-close"
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent-primary)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
