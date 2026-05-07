import React from 'react';
import { Calendar, Layers, Puzzle } from 'lucide-react';

/**
 * 태그 목록 표시 컴포넌트 (테마, 진행방식 등)
 */
function TagList({ items, icon, label }) {
  if (!items) return null;
  return (
    <div style={{ marginBottom: '16px' }}>
      <h3 className="section-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
        {icon} {label}
      </h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {items.split(',').map((item, i) => (
          <span key={i} className="tag-chip">{item.trim()}</span>
        ))}
      </div>
    </div>
  );
}

/**
 * 게임 우측 정보 컬럼:
 * - 게임명(한/영), 카테고리 뱃지, 출시연도
 * - 게임 소개 (접기/펼치기)
 * - 카테고리, 테마, 진행방식 태그 목록
 * - 편집 모드 시 해당 필드 폼으로 전환
 */
export default function GameInfoSection({
  game,
  isEditing,
  editData,
  isDescExpanded,
  onDescToggle,
  onEditDataChange,
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 게임명 섹션 */}
      <div className="animate-slide-up">
        {isEditing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div className="form-group">
              <label className="form-label">한국어 게임명</label>
              <input
                value={editData.name}
                onChange={e => onEditDataChange('name', e.target.value)}
                className="form-input"
                style={{ fontSize: '16px', fontWeight: '700' }}
              />
            </div>
            <div className="form-group">
              <label className="form-label">영문 게임명</label>
              <input
                value={editData.englishName}
                onChange={e => onEditDataChange('englishName', e.target.value)}
                className="form-input"
                style={{ fontSize: '14px' }}
              />
            </div>
          </div>
        ) : (
          <>
            {/* 뱃지 행 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
              {game.isHidden && (
                <span className="badge-hidden">🔒 비공개</span>
              )}
              {game.category &&
                game.category.split(',').slice(0, 3).map((cat, i) => (
                  <span key={i} className="badge badge-category" style={{ fontSize: '10px' }}>
                    {cat.trim()}
                  </span>
                ))}
              {game.year && (
                <span style={{ fontSize: '13px', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '4px' }}>
                  <Calendar size={13} /> {game.year}
                </span>
              )}
            </div>
            <h1 className="game-title">{game.name}</h1>
            {game.englishName && (
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {game.englishName}
              </p>
            )}
          </>
        )}
      </div>

      {/* 설명 / 태그 섹션 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* 게임 소개 */}
        {isEditing ? (
          <div className="form-group">
            <label className="form-label">게임 소개</label>
            <textarea
              value={editData.description}
              onChange={e => onEditDataChange('description', e.target.value)}
              rows={6}
              className="form-input form-textarea"
            />
          </div>
        ) : (
          game.description && (
            <div>
              <h3 className="section-label">게임 소개</h3>
              <p
                onClick={() => game.description.length > 250 && onDescToggle()}
                style={{
                  lineHeight: '1.6',
                  color: 'var(--text-secondary)',
                  fontSize: '13px',
                  display: '-webkit-box',
                  WebkitLineClamp: isDescExpanded ? 'unset' : 6,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  cursor: game.description.length > 250 ? 'pointer' : 'default',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {game.description}
              </p>
              {game.description.length > 250 && (
                <button onClick={onDescToggle} className="btn-text">
                  {isDescExpanded ? '접기' : '더보기'}
                </button>
              )}
            </div>
          )
        )}

        {/* 카테고리 / 테마 / 진행방식 */}
        {isEditing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">카테고리 (쉼표로 구분)</label>
              <input
                value={editData.category}
                onChange={e => onEditDataChange('category', e.target.value)}
                placeholder="전략게임, 테마게임"
                className="form-input"
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">테마 (쉼표로 구분)</label>
                <input
                  value={editData.theme}
                  onChange={e => onEditDataChange('theme', e.target.value)}
                  placeholder="경제, 농업"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">진행 방식 (쉼표로 구분)</label>
                <input
                  value={editData.mechanisms}
                  onChange={e => onEditDataChange('mechanisms', e.target.value)}
                  placeholder="액션 드래프팅"
                  className="form-input"
                />
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <TagList items={game.theme} icon={<Layers size={14} />} label="테마" />
            <TagList items={game.mechanisms} icon={<Puzzle size={14} />} label="진행 방식" />
          </div>
        )}
      </div>
    </div>
  );
}
