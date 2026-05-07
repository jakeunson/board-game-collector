import React from 'react';
import { Camera, Loader2, Users, Clock, Star, Brain } from 'lucide-react';
import noImage from '../../../assets/no-image.jpg';

/**
 * 통계 카드 (인원/시간/평점/난이도)
 */
function StatCard({ icon, label, value, color }) {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div
      className="glass stat-card"
      style={{ borderBottom: `2px solid ${color || 'var(--accent-primary)'}` }}
    >
      <div style={{ color: color || 'var(--accent-primary)', display: 'flex' }}>
        {React.isValidElement(icon) ? React.cloneElement(icon, { size: 16 }) : icon}
      </div>
      <div className="stat-card-label">{label}</div>
      <div className="stat-card-value">{value}</div>
    </div>
  );
}

/**
 * 게임 이미지, 이미지 업로드 오버레이, 통계 카드 그리드를 포함하는 좌측 컬럼 섹션.
 * 편집 모드일 때 수치 입력 필드로 전환됩니다.
 */
export default function GameImageSection({
  game,
  isEditing,
  isUploading,
  isFetchingInfo,
  editData,
  players,
  fileInputRef,
  onImageClick,
  onImageChange,
  onFetchInfo,
  onEditDataChange,
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* 이미지 */}
      <div className="image-container" style={{ position: 'relative', width: '100%', borderRadius: '20px', overflow: 'hidden', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-subtle)', background: 'var(--bg-app)' }}>
        <img
          src={game.image || noImage}
          alt={game.name}
          referrerPolicy="no-referrer"
          onError={e => { e.target.onerror = null; e.target.src = noImage; }}
          style={{ width: '100%', height: 'auto', display: 'block', opacity: isUploading ? 0.5 : 1, transition: 'opacity 0.3s' }}
        />

        {isEditing && (
          <div
            className="image-upload-overlay"
            style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: isUploading ? 'default' : 'pointer' }}
            onClick={() => !isUploading && onImageClick()}
          >
            {isUploading ? (
              <div style={{ textAlign: 'center', color: '#fff' }}>
                <Loader2 size={32} className="animate-spin" />
                <p style={{ fontSize: '12px', marginTop: '8px', fontWeight: '600' }}>업로드 중...</p>
              </div>
            ) : (
              <div className="upload-content" style={{ textAlign: 'center', color: '#fff' }}>
                <Camera size={32} />
                <p style={{ fontSize: '12px', marginTop: '8px', fontWeight: '600' }}>이미지 변경</p>
              </div>
            )}
          </div>
        )}

        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept="image/*"
          onChange={onImageChange}
        />
      </div>

      {/* 통계 카드 / 편집 필드 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        {isEditing ? (
          <>
            {[
              { field: 'minPlayers', label: '최소 인원', type: 'number' },
              { field: 'maxPlayers', label: '최대 인원', type: 'number' },
              { field: 'playingTime', label: '시간 (분)', type: 'number' },
              { field: 'weight', label: '난이도 (Weight)', type: 'number', step: '0.1' },
              { field: 'rating', label: '평점', type: 'number', step: '0.1' },
              { field: 'year', label: '출시년도', type: 'text', placeholder: '2021' },
            ].map(({ field, label, type, step, placeholder }) => (
              <div key={field} className="form-group">
                <label className="form-label">{label}</label>
                <input
                  type={type}
                  step={step}
                  placeholder={placeholder}
                  value={editData[field] ?? ''}
                  onChange={e => onEditDataChange(field, e.target.value)}
                  className="form-input"
                />
              </div>
            ))}
          </>
        ) : (
          <>
            <StatCard icon={<Users />} label="인원" value={players} color="#6366f1" />
            <StatCard icon={<Clock />} label="시간" value={game.playingTime ? `${game.playingTime}m` : null} color="#8b5cf6" />
            <StatCard icon={<Star />} label="평점" value={game.rating} color="#f59e0b" />
            <StatCard icon={<Brain />} label="난이도" value={game.weight || game.difficulty} color="#ec4899" />
          </>
        )}
      </div>

      {/* 보드라이프/BGG 정보 불러오기 버튼 */}
      {isEditing && (
        <button
          onClick={onFetchInfo}
          disabled={isFetchingInfo}
          className="btn-fetch-info"
        >
          {isFetchingInfo ? (
            <><Loader2 size={14} className="animate-spin" /> 정보를 가져오는 중...</>
          ) : (
            <>🔍 보드라이프/BGG에서 정보 다시 불러오기</>
          )}
        </button>
      )}
    </div>
  );
}
