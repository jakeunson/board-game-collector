import React, { useState, useRef, useEffect } from 'react';
import { Users, Clock, Star, Brain, X, Trash2, ExternalLink, Video, Search, Globe, Calendar, Layers, Puzzle, Camera, Loader2, Edit2, Save, Undo } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { addDoc, collection } from 'firebase/firestore';
import { storage, db } from '../../firebase';
import { useGames } from '../../contexts/GameContext';
import noImage from '../../assets/no-image.jpg';

function StatCard({ icon, label, value, color }) {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div className="glass" style={{
      padding: '12px 8px',
      borderRadius: '12px',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '4px',
      borderBottom: `2px solid ${color || 'var(--accent-primary)'}`
    }}>
      <div style={{ color: color || 'var(--accent-primary)', display: 'flex' }}>
        {React.isValidElement(icon) ? React.cloneElement(icon, { size: 16 }) : icon}
      </div>
      <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontWeight: '700', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontWeight: '800', fontSize: '14px', color: 'var(--text-primary)' }}>{value}</div>
    </div>
  );
}

function TagList({ items, icon, label }) {
  if (!items) return null;
  return (
    <div style={{ marginBottom: '16px' }}>
      <h3 style={{
        fontSize: '11px',
        fontWeight: '800',
        color: 'var(--text-tertiary)',
        marginBottom: '8px',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}>
        {icon} {label}
      </h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {items.split(',').map((item, i) => (
          <span
            key={i}
            style={{
              padding: '4px 10px',
              background: 'var(--bg-app)',
              borderRadius: '8px',
              fontSize: '12px',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-subtle)'
            }}
          >
            {item.trim()}
          </span>
        ))}
      </div>
    </div>
  );
}

function LinkButton({ href, icon, label, color }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      style={{
        display: 'flex', alignItems: 'center', gap: '8px', padding: '10px',
        background: 'var(--bg-app)', borderRadius: '10px', textDecoration: 'none',
        color: 'var(--text-primary)', fontSize: '12px', fontWeight: '600',
        border: '1px solid var(--border-subtle)', transition: 'all 0.2s'
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = color;
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = `0 4px 12px ${color}15`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border-subtle)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{ color }}>{icon}</div>
      {label}
    </a>
  );
}

export default function GameDetail({ game: initialGame, onClose, onDelete, onUpdate, onGameChange }) {
  const { gameCollection, updateGame } = useGames();
  const game = gameCollection.find(g => g.id === initialGame.id) || initialGame;

  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [selectedExpansions, setSelectedExpansions] = useState([]);
  const fileInputRef = useRef(null);

  const [showRentForm, setShowRentForm] = useState(false);
  const [rentEmail, setRentEmail] = useState('');
  const [rentStartDate, setRentStartDate] = useState('');
  const [rentEndDate, setRentEndDate] = useState('');
  const [isSubmittingRent, setIsSubmittingRent] = useState(false);

  useEffect(() => {
    if (game) {
      setEditData({
        name: game.name || '',
        englishName: game.englishName || '',
        minPlayers: game.minPlayers || '',
        maxPlayers: game.maxPlayers || '',
        playingTime: game.playingTime || '',
        rating: game.rating || '',
        weight: game.weight || game.difficulty || '',
        description: game.description || '',
        theme: game.theme || '',
        mechanisms: game.mechanisms || '',
        category: game.category || '',
        bggId: game.bggId || '',
        boardlifeId: game.boardlifeId || '',
        type: game.type || 'base',
        year: game.year || ''
      });

      if (isEditing) {
        setSelectedExpansions(
          gameCollection
            .filter(g => g.parentGameId === game.id)
            .map(g => g.id)
        );
      }
    }
  }, [game, isEditing]);

  if (!game) return null;

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기는 5MB 이하여야 합니다.');
      return;
    }

    try {
      setIsUploading(true);
      const storageRef = ref(storage, `games/${game.id}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      await onUpdate(game.id, {
        image: downloadURL,
        thumbnail: downloadURL
      });

      alert('이미지가 성공적으로 업데이트되었습니다.');
    } catch (error) {
      console.error('Upload failed:', error);
      alert('이미지 업로드 중 오류가 발생했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      const updatedFields = {
        name: editData.name,
        englishName: editData.englishName,
        minPlayers: editData.minPlayers ? Number(editData.minPlayers) : null,
        maxPlayers: editData.maxPlayers ? Number(editData.maxPlayers) : null,
        playingTime: editData.playingTime ? Number(editData.playingTime) : null,
        rating: editData.rating ? Number(editData.rating) : null,
        weight: editData.weight ? Number(editData.weight) : null,
        description: editData.description,
        theme: editData.theme,
        mechanisms: editData.mechanisms,
        category: editData.category,
        bggId: editData.bggId,
        boardlifeId: editData.boardlifeId,
        type: editData.type,
        year: editData.year
      };

      await onUpdate(game.id, updatedFields);

      if (editData.type === 'base') {
        const prevExpansions = gameCollection.filter(g => g.parentGameId === game.id).map(g => g.id);
        const removed = prevExpansions.filter(id => !selectedExpansions.includes(id));
        const added = selectedExpansions.filter(id => !prevExpansions.includes(id));

        await Promise.all([
          ...removed.map(id => updateGame(id, { parentGameId: "" })),
          ...added.map(id => updateGame(id, { parentGameId: game.id, type: "expansion" }))
        ]);
      }

      setIsEditing(false);
      alert('게임 정보가 수정되었습니다.');
    } catch (error) {
      console.error('Failed to update game data:', error);
      alert('저장하는 동안 오류가 발생했습니다.');
    }
  };

  const handleRentSubmit = async (e) => {
    e.preventDefault();
    if (!rentEmail || !rentStartDate || !rentEndDate) {
      alert('모든 필드를 입력해주세요.');
      return;
    }
    setIsSubmittingRent(true);
    try {
      await addDoc(collection(db, "rentalRequests"), {
        gameId: game.id,
        gameName: game.name,
        email: rentEmail,
        rentDate: rentStartDate,
        returnDate: rentEndDate,
        status: 'pending',
        requestedAt: new Date().toISOString()
      });
      alert('대여 신청이 완료되었습니다.');
      setShowRentForm(false);
      setRentEmail('');
      setRentStartDate('');
      setRentEndDate('');
    } catch (error) {
      console.error('Failed to submit rent request:', error);
      alert('대여 신청 중 오류가 발생했습니다.');
    } finally {
      setIsSubmittingRent(false);
    }
  };

  const players = game.minPlayers && game.maxPlayers
    ? game.minPlayers === game.maxPlayers ? `${game.maxPlayers}인` : `${game.minPlayers}–${game.maxPlayers}인`
    : game.maxPlayers ? `${game.maxPlayers}인` : null;

  const handleInputChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div
      onClick={onClose}
      className="animate-fade-in"
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)'
      }}
    >
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `url(${game.image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'blur(60px) brightness(0.4)',
        opacity: 0.4,
        zIndex: -1
      }} />

      <div
        className="animate-slide-up glass"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: '800px', maxHeight: '95vh',
          borderRadius: '20px', overflow: 'hidden', display: 'flex',
          flexDirection: 'column', boxShadow: 'var(--shadow-xl)',
          background: 'var(--bg-modal)', border: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '16px 24px', display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', borderBottom: '1px solid var(--border-subtle)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-tertiary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {isEditing ? '정보 수정 모드' : 'Game Details'}
            </span>
            <span style={{
              fontSize: '11px',
              background: 'var(--bg-app)',
              padding: '2px 8px',
              borderRadius: '6px',
              color: 'var(--accent-primary)',
              fontWeight: '700',
              border: '1px solid var(--border-subtle)'
            }}>
              ID: {game.boardlifeId || game.id}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '4px',
                    padding: '6px 12px', background: 'var(--accent-primary)',
                    border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px', fontWeight: '700', cursor: 'pointer'
                  }}
                >
                  <Save size={14} /> 저장
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '4px',
                    padding: '6px 12px', background: 'var(--bg-app)',
                    border: '1px solid var(--border-subtle)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '12px', fontWeight: '700', cursor: 'pointer'
                  }}
                >
                  <Undo size={14} /> 취소
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  padding: '6px 12px', background: 'var(--bg-app)',
                  border: '1px solid var(--border-subtle)', borderRadius: '8px', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: '700', cursor: 'pointer'
                }}
              >
                <Edit2 size={14} /> 정보 수정
              </button>
            )}

            <button
              onClick={onClose}
              style={{
                background: 'var(--bg-app)', border: 'none', cursor: 'pointer',
                padding: '6px', color: 'var(--text-secondary)', borderRadius: '50%',
                display: 'flex', transition: 'all 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-primary)'}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '270px 1fr', gap: '32px' }}>

            {/* Left Column: Image + Stats */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Rent Request Section */}
              {!isEditing && (
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                  {game.isRented ? (
                    <div style={{ textAlign: 'center', color: '#ef4444', fontWeight: '700', fontSize: '14px', padding: '8px' }}>
                      🔒 현재 대여중인 게임입니다.
                    </div>
                  ) : (
                    <>
                      {!showRentForm ? (
                        <button 
                          onClick={() => setShowRentForm(true)}
                          className="btn-primary"
                          style={{ width: '100%', padding: '10px', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                        >
                          <Calendar size={16} /> 대여 신청하기
                        </button>
                      ) : (
                        <form onSubmit={handleRentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>대여 신청 정보 입력</h4>
                          <div>
                            <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-tertiary)' }}>이메일</label>
                            <input type="email" required value={rentEmail} onChange={e => setRentEmail(e.target.value)} placeholder="example@email.com" style={{ width: '100%', padding: '8px', background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: 'var(--text-primary)', marginTop: '4px' }} />
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div>
                              <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-tertiary)' }}>대여 시작일</label>
                              <input type="date" required value={rentStartDate} onChange={e => setRentStartDate(e.target.value)} onClick={(e) => e.target.showPicker()} style={{ width: '100%', padding: '8px', background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: 'var(--text-primary)', marginTop: '4px', cursor: 'pointer' }} />
                            </div>
                            <div>
                              <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-tertiary)' }}>반납 예정일</label>
                              <input type="date" required value={rentEndDate} onChange={e => setRentEndDate(e.target.value)} onClick={(e) => e.target.showPicker()} style={{ width: '100%', padding: '8px', background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: 'var(--text-primary)', marginTop: '4px', cursor: 'pointer' }} />
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                            <button type="submit" disabled={isSubmittingRent} className="btn-primary" style={{ flex: 1, padding: '8px' }}>
                              {isSubmittingRent ? '제출 중...' : '신청 완료'}
                            </button>
                            <button type="button" onClick={() => setShowRentForm(false)} style={{ flex: 1, padding: '8px', background: 'none', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                              취소
                            </button>
                          </div>
                        </form>
                      )}
                    </>
                  )}
                </div>
              )}

              <div
                className="image-container"
                style={{
                  position: 'relative',
                  width: '100%',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-lg)',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-app)'
                }}
              >
                <img
                  src={game.image || noImage}
                  alt={game.name}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = noImage;
                  }}
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                    opacity: isUploading ? 0.5 : 1,
                    transition: 'opacity 0.3s'
                  }}
                />

                {/* Upload Overlay */}
                {isEditing && (
                  <div
                    className="image-upload-overlay"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: isUploading ? 'default' : 'pointer',
                    }}
                    onClick={() => !isUploading && fileInputRef.current?.click()}
                  >
                    {isUploading ? (
                      <div style={{ textAlign: 'center', color: '#fff', opacity: 1 }}>
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
                  onChange={handleImageUpload}
                />
              </div>

              {/* Stat Grid (2x2) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {isEditing ? (
                  <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-tertiary)' }}>최소 인원</label>
                      <input type="number" value={editData.minPlayers} onChange={e => handleInputChange('minPlayers', e.target.value)} style={{ width: '100%', padding: '6px', background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: 'var(--text-primary)' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-tertiary)' }}>최대 인원</label>
                      <input type="number" value={editData.maxPlayers} onChange={e => handleInputChange('maxPlayers', e.target.value)} style={{ width: '100%', padding: '6px', background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: 'var(--text-primary)' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-tertiary)' }}>시간 (분)</label>
                      <input type="number" value={editData.playingTime} onChange={e => handleInputChange('playingTime', e.target.value)} style={{ width: '100%', padding: '6px', background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: 'var(--text-primary)' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-tertiary)' }}>난이도 (Weight)</label>
                      <input type="number" step="0.1" value={editData.weight} onChange={e => handleInputChange('weight', e.target.value)} style={{ width: '100%', padding: '6px', background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: 'var(--text-primary)' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-tertiary)' }}>평점</label>
                      <input type="number" step="0.1" value={editData.rating} onChange={e => handleInputChange('rating', e.target.value)} style={{ width: '100%', padding: '6px', background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: 'var(--text-primary)' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-tertiary)' }}>출시년도</label>
                      <input type="text" value={editData.year} onChange={e => handleInputChange('year', e.target.value)} placeholder="2021" style={{ width: '100%', padding: '6px', background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: 'var(--text-primary)' }} />
                    </div>
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
            </div>

            {/* Right Column: Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="animate-slide-up">
                {isEditing ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-tertiary)' }}>한국어 게임명</label>
                      <input value={editData.name} onChange={e => handleInputChange('name', e.target.value)} style={{ width: '100%', padding: '8px', background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '16px', fontWeight: '700' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-tertiary)' }}>영문 게임명</label>
                      <input value={editData.englishName} onChange={e => handleInputChange('englishName', e.target.value)} style={{ width: '100%', padding: '8px', background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: 'var(--text-secondary)', fontSize: '14px' }} />
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      {game.category && game.category.split(',').slice(0, 3).map((cat, i) => (
                        <span key={i} className="badge badge-category" style={{ fontSize: '10px' }}>{cat.trim()}</span>
                      ))}
                      {game.year && (
                        <span style={{ fontSize: '13px', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '4px' }}>
                          <Calendar size={13} /> {game.year}
                        </span>
                      )}
                    </div>
                    <h1 style={{ fontSize: '26px', fontWeight: '900', lineHeight: '1.2', color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
                      {game.name}
                    </h1>
                    {game.englishName && (
                      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>{game.englishName}</p>
                    )}
                  </>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {isEditing ? (
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-tertiary)', display: 'block', marginBottom: '6px' }}>게임 소개</label>
                    <textarea
                      value={editData.description}
                      onChange={e => handleInputChange('description', e.target.value)}
                      rows={6}
                      style={{ width: '100%', padding: '10px', background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '13px', lineHeight: '1.6', resize: 'vertical' }}
                    />
                  </div>
                ) : (
                  game.description && (
                    <div>
                      <h3 style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-tertiary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>게임 소개</h3>
                      <p style={{
                        lineHeight: '1.6', color: 'var(--text-secondary)', fontSize: '13px',
                        display: '-webkit-box', WebkitLineClamp: 6, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                      }}>
                        {game.description}
                      </p>
                    </div>
                  )
                )}

                {isEditing ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-tertiary)' }}>카테고리 (쉼표로 구분)</label>
                      <input value={editData.category} onChange={e => handleInputChange('category', e.target.value)} placeholder="전략게임, 테마게임" style={{ width: '100%', padding: '8px', background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: 'var(--text-primary)' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-tertiary)' }}>테마 (쉼표로 구분)</label>
                        <input value={editData.theme} onChange={e => handleInputChange('theme', e.target.value)} placeholder="경제, 농업" style={{ width: '100%', padding: '8px', background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: 'var(--text-primary)' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-tertiary)' }}>진행 방식 (쉼표로 구분)</label>
                        <input value={editData.mechanisms} onChange={e => handleInputChange('mechanisms', e.target.value)} placeholder="액션 드래프팅" style={{ width: '100%', padding: '8px', background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: 'var(--text-primary)' }} />
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

              {/* Type and Expansion Selection */}
              {isEditing && (
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-tertiary)' }}>구분 (기본판 / 확장판)</label>
                    <select 
                      value={editData.type} 
                      onChange={e => handleInputChange('type', e.target.value)}
                      style={{ width: '100%', padding: '8px', background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: 'var(--text-primary)', marginTop: '4px' }}
                    >
                      <option value="base">기본판</option>
                      <option value="expansion">확장판</option>
                    </select>
                  </div>

                  {editData.type === 'base' && (
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-tertiary)' }}>확장판 연결 (체크 시 묶음)</label>
                      <div style={{ 
                        maxHeight: '150px', 
                        overflowY: 'auto', 
                        background: 'var(--bg-app)', 
                        border: '1px solid var(--border-subtle)', 
                        borderRadius: '8px', 
                        padding: '8px',
                        marginTop: '4px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}>
                        {gameCollection
                          .filter(g => g.id !== game.id && g.type === 'expansion')
                          .map(exp => (
                            <label key={exp.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                              <input 
                                type="checkbox" 
                                checked={selectedExpansions.includes(exp.id)} 
                                onChange={e => {
                                  if (e.target.checked) {
                                    setSelectedExpansions(prev => [...prev, exp.id]);
                                  } else {
                                    setSelectedExpansions(prev => prev.filter(id => id !== exp.id));
                                  }
                                }} 
                              />
                              {exp.name}
                            </label>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* IDs for Edit */}
              {isEditing && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-tertiary)' }}>보드라이프 ID</label>
                    <input value={editData.boardlifeId} onChange={e => handleInputChange('boardlifeId', e.target.value)} style={{ width: '100%', padding: '6px', background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: 'var(--text-primary)' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-tertiary)' }}>BGG ID</label>
                    <input value={editData.bggId} onChange={e => handleInputChange('bggId', e.target.value)} style={{ width: '100%', padding: '6px', background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: 'var(--text-primary)' }} />
                  </div>
                </div>
              )}

              {/* Base/Expansion Relationship Display */}
              {!isEditing && (
                <div style={{ marginBottom: '16px' }}>
                  {game.type === 'base' && (
                    <>
                      <h3 style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-tertiary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>포함된 확장판</h3>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {gameCollection
                          .filter(g => g.parentGameId === game.id)
                          .map(exp => (
                            <span 
                              key={exp.id} 
                              onClick={() => onGameChange && onGameChange(exp)}
                              style={{ 
                                padding: '6px 12px', 
                                background: 'rgba(239, 68, 68, 0.1)', 
                                border: '1px solid rgba(239, 68, 68, 0.2)', 
                                borderRadius: '8px', 
                                fontSize: '13px', 
                                color: '#ef4444',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                              onMouseLeave={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                            >
                              {exp.name}
                            </span>
                          ))}
                        {gameCollection.filter(g => g.parentGameId === game.id).length === 0 && (
                          <span style={{ fontSize: '13px', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>연결된 확장판이 없습니다.</span>
                        )}
                      </div>
                    </>
                  )}

                  {game.type === 'expansion' && game.parentGameId && (
                    <>
                      <h3 style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-tertiary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>필요한 기본판</h3>
                      {(() => {
                        const parent = gameCollection.find(g => g.id === game.parentGameId);
                        return parent ? (
                          <span 
                            onClick={() => onGameChange && onGameChange(parent)}
                            style={{ 
                              padding: '6px 12px', 
                              background: 'rgba(99, 102, 241, 0.1)', 
                              border: '1px solid rgba(99, 102, 241, 0.2)', 
                              borderRadius: '8px', 
                              fontSize: '13px', 
                              color: '#6366f1',
                              fontWeight: '600',
                              display: 'inline-block',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(99, 102, 241, 0.2)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)'}
                          >
                            {parent.name}
                          </span>
                        ) : (
                          <span style={{ fontSize: '13px', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>기본판 정보가 없습니다.</span>
                        );
                      })()}
                    </>
                  )}
                </div>
              )}

              {/* External Links */}
              {!isEditing && (
                <div>
                  <h3 style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-tertiary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>추가 정보 및 리뷰</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <LinkButton
                      href={game.bggId ? `https://boardgamegeek.com/boardgame/${game.bggId}` : `https://boardgamegeek.com/search/boardgames?q=${encodeURIComponent(game.name)}`}
                      icon={<Globe size={16} />}
                      label="BoardGameGeek"
                      color="#ff5100"
                    />
                    <LinkButton
                      href={game.boardlifeId ? `https://boardlife.co.kr/game/${game.boardlifeId}` : `https://boardlife.co.kr/bbs_list.php?tb=boardgame_strategy&search_mode=ok&game_id=&search_word=${encodeURIComponent(game.name)}`}
                      icon={<ExternalLink size={16} />}
                      label="BoardLife"
                      color="#005a9e"
                    />
                    <LinkButton
                      href={`https://search.naver.com/search.naver?where=post&query=${encodeURIComponent(game.name + ' 보드게임')}`}
                      icon={<Search size={16} />}
                      label="Naver Review"
                      color="#10b981"
                    />
                    <LinkButton
                      href={`https://www.youtube.com/results?search_query=${encodeURIComponent(game.name + ' 보드게임 룰 설명')}`}
                      icon={<Video size={16} />}
                      label="YouTube Tutorial"
                      color="#ef4444"
                    />
                  </div>
                </div>
              )}


              {/* Delete Button */}
              {!isEditing && (
                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end', paddingTop: '16px' }}>
                  <button
                    onClick={async () => {
                      const deleted = await onDelete(game.id);
                      if (deleted) onClose();
                    }}
                    style={{
                      background: 'none', border: '1px solid rgba(220, 38, 38, 0.2)', color: '#ef4444',
                      borderRadius: '10px', padding: '8px 16px', fontSize: '13px', fontWeight: '600',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(220, 38, 38, 0.05)'; e.currentTarget.style.borderColor = '#ef4444'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.2)'; }}
                  >
                    <Trash2 size={14} /> 컬렉션에서 삭제
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
