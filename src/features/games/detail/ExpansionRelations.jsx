import React from 'react';
import { useGames } from '../../../contexts/GameContext';

/**
 * 기본판/확장판 관계 표시 및 편집 섹션
 * - 뷰 모드: 연결된 확장판 목록(기본판) 또는 기본판 링크(확장판)
 * - 편집 모드: 확장판 체크박스 연결 UI
 */
export default function ExpansionRelations({
  game,
  isEditing,
  editType,
  selectedExpansions,
  onToggleExpansion,
  onGameChange,
}) {
  const { gameCollection } = useGames();

  /* ── 편집 모드 ── */
  if (isEditing) {
    if (editType !== 'base') return null;

    const allExpansions = gameCollection.filter(
      g => g.id !== game.id && g.type === 'expansion'
    );

    return (
      <div className="section-box">
        <label className="form-label">확장판 연결 (체크 시 묶음)</label>
        <div className="expansion-checklist">
          {allExpansions.map(exp => (
            <label key={exp.id} className="expansion-check-item">
              <input
                type="checkbox"
                checked={selectedExpansions.includes(exp.id)}
                onChange={e => onToggleExpansion(exp.id, e.target.checked)}
              />
              {exp.name}
            </label>
          ))}
        </div>
      </div>
    );
  }

  /* ── 뷰 모드 ── */
  if (game.type === 'base') {
    const expansions = gameCollection.filter(
      g => game.id && g.parentGameId === game.id
    );
    return (
      <div style={{ marginBottom: '16px' }}>
        <h3 className="section-label">포함된 확장판</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {expansions.length > 0 ? (
            expansions.map(exp => (
              <span
                key={exp.id}
                onClick={() => onGameChange && onGameChange(exp)}
                className="relation-chip relation-chip--expansion"
                onMouseEnter={e =>
                  (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)')
                }
                onMouseLeave={e =>
                  (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)')
                }
              >
                {exp.name}
              </span>
            ))
          ) : (
            <span className="relation-empty">연결된 확장판이 없습니다.</span>
          )}
        </div>
      </div>
    );
  }

  if (game.type === 'expansion' && game.parentGameId) {
    const parent = gameCollection.find(g => g.id === game.parentGameId);
    return (
      <div style={{ marginBottom: '16px' }}>
        <h3 className="section-label">필요한 기본판</h3>
        {parent ? (
          <span
            onClick={() => onGameChange && onGameChange(parent)}
            className="relation-chip relation-chip--base"
            onMouseEnter={e =>
              (e.currentTarget.style.background = 'rgba(99, 102, 241, 0.2)')
            }
            onMouseLeave={e =>
              (e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)')
            }
          >
            {parent.name}
          </span>
        ) : (
          <span className="relation-empty">기본판 정보가 없습니다.</span>
        )}
      </div>
    );
  }

  return null;
}
