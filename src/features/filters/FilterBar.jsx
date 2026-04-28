import React from 'react';
import { Search, RotateCcw, LayoutGrid, List } from 'lucide-react';
import { useFilters } from '../../contexts/FilterContext';

const PLAYER_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8];

const DIFFICULTY_OPTIONS = [
  { value: '1', label: '입문', sub: '~2.0' },
  { value: '2', label: '중급', sub: '2~3' },
  { value: '3', label: '상급', sub: '3~4' },
  { value: '4', label: '헤비', sub: '4~' },
];

function Chip({ label, sub, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '5px 12px',
        borderRadius: '10px',
        border: '1px solid var(--border-medium)',
        background: active ? 'var(--accent-primary)' : 'transparent',
        color: active ? '#fff' : 'var(--text-secondary)',
        fontSize: '12px',
        fontWeight: active ? '600' : '500',
        cursor: 'pointer',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        whiteSpace: 'nowrap',
        fontFamily: 'inherit',
        boxShadow: active ? '0 4px 10px var(--accent-glow)' : 'none',
      }}
      onMouseEnter={e => {
        if (!active) {
          e.currentTarget.style.background = 'var(--bg-hover)';
          e.currentTarget.style.borderColor = 'var(--accent-primary)';
        }
      }}
      onMouseLeave={e => {
        if (!active) {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.borderColor = 'var(--border-medium)';
        }
      }}
    >
      {label}
      {sub && <span style={{ opacity: 0.7, fontSize: '10px', fontWeight: '400' }}>{sub}</span>}
    </button>
  );
}

export default function FilterBar() {
  const {
    filters,
    updateFilter,
    viewMode,
    setViewMode,
    allCategories,
    filteredCollection,
    hasActiveFilters,
    resetFilters
  } = useFilters();

  return (
    <div className="glass" style={{
      borderRadius: '16px',
      padding: '16px',
      marginBottom: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    }}>
      {/* Row 1: Players + Difficulty */}
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            인원
          </span>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {PLAYER_OPTIONS.map(n => (
              <Chip
                key={n}
                label={`${n}인`}
                active={filters.players === String(n)}
                onClick={() => updateFilter('players', filters.players === String(n) ? '' : String(n))}
              />
            ))}
          </div>
        </div>

        <div style={{ width: '1px', height: '24px', background: 'var(--border-medium)' }} />

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            난이도
          </span>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {DIFFICULTY_OPTIONS.map(opt => (
              <Chip
                key={opt.value}
                label={opt.label}
                sub={opt.sub}
                active={filters.difficulty === opt.value}
                onClick={() => updateFilter('difficulty', filters.difficulty === opt.value ? '' : opt.value)}
              />
            ))}
          </div>
        </div>

        <div style={{ width: '1px', height: '24px', background: 'var(--border-medium)' }} />

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            기타
          </span>
          <Chip
            label="기본판만 보기"
            active={filters.showBaseOnly}
            onClick={() => updateFilter('showBaseOnly', !filters.showBaseOnly)}
          />
        </div>
      </div>

      {/* Row 2: Search + Category + Reset */}
      <div style={{ 
        display: 'flex', 
        gap: '12px', 
        alignItems: 'center', 
        paddingTop: '12px',
        borderTop: '1px solid var(--border-subtle)' 
      }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '340px' }}>
          <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input
            type="text"
            className="input-field"
            placeholder="어떤 게임을 찾으시나요?"
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            style={{ width: '100%', paddingLeft: '34px' }}
          />
        </div>

        <select
          className="input-field"
          value={filters.category}
          onChange={(e) => updateFilter('category', e.target.value)}
          style={{ width: '160px' }}
        >
          <option value="">모든 카테고리</option>
          {allCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>

        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              background: 'var(--accent-glow)', border: 'none',
              borderRadius: '8px', padding: '8px 14px', fontSize: '12px',
              color: 'var(--accent-primary)', fontWeight: '600', cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.filter = 'brightness(0.95)'}
            onMouseLeave={e => e.currentTarget.style.filter = 'none'}
          >
            <RotateCcw size={13} /> 필터 초기화
          </button>
        )}

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500' }}>
            {filteredCollection.length} Results
          </span>
          <div className="view-toggle">
            <button
              className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
