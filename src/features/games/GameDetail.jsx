/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useRef, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { addDoc, collection } from 'firebase/firestore';
import { storage, db } from '../../firebase';
import { useGames } from '../../contexts/GameContext';
import { extractDetailsFromHtml, translateToKorean } from '../../utils/gameDataExtractor';
import { bggService } from '../../utils/bggService';
import { formatPlayers } from '../../utils/helpers';
import { proxyFetchHtml } from '../../utils/proxyFetch';
import { isDev } from '../../utils/envUtils';

// 서브 컴포넌트
import GameDetailHeader from './detail/GameDetailHeader';
import GameImageSection from './detail/GameImageSection';
import GameInfoSection from './detail/GameInfoSection';
import RentRequestForm from './detail/RentRequestForm';
import ExpansionRelations from './detail/ExpansionRelations';
import ExternalLinks from './detail/ExternalLinks';
import AdminEditFields from './detail/AdminEditFields';
import DangerButton from '../../shared/components/DangerButton';

export default function GameDetail({ game: initialGame, onClose, onDelete, onUpdate, onGameChange }) {
  const { gameCollection, updateGame, isAdmin } = useGames();
  const game = gameCollection.find(g => g.id === initialGame.id) || initialGame;

  const [isUploading, setIsUploading] = useState(false);
  const [isFetchingInfo, setIsFetchingInfo] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [selectedExpansions, setSelectedExpansions] = useState([]);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const fileInputRef = useRef(null);

  // 대여 폼 상태
  const todayStr = new Date().toISOString().split('T')[0];
  const [showRentForm, setShowRentForm] = useState(false);
  const [rentEmail, setRentEmail] = useState('');
  const [rentStartDate, setRentStartDate] = useState(todayStr);
  const [rentEndDate, setRentEndDate] = useState(todayStr);
  const [isSubmittingRent, setIsSubmittingRent] = useState(false);

  // 편집 모드 진입 시 현재 게임 데이터로 폼 초기화
  useEffect(() => {
    if (game && isEditing) {
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
        year: game.year || '',
        isHidden: game.isHidden || false,
      });
      setSelectedExpansions(
        gameCollection.filter(g => g.parentGameId === game.id).map(g => g.id)
      );
    }
  }, [game, isEditing, gameCollection]);

  if (!game) return null;

  const players = formatPlayers(game.minPlayers, game.maxPlayers);

  /* ── 핸들러: 폼 필드 변경 ── */
  const handleInputChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  /* ── 핸들러: 이미지 업로드 ── */
  const handleImageUpload = async e => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('이미지 파일만 업로드 가능합니다.'); return; }
    if (file.size > 5 * 1024 * 1024) { alert('파일 크기는 5MB 이하여야 합니다.'); return; }

    try {
      setIsUploading(true);
      const storageRef = ref(storage, `games/${game.id}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      await onUpdate(game.id, { image: downloadURL, thumbnail: downloadURL });
      alert('이미지가 성공적으로 업데이트되었습니다.');
    } catch (error) {
      console.error('Upload failed:', error);
      alert('이미지 업로드 중 오류가 발생했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  /* ── 핸들러: 저장 ── */
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
        year: editData.year,
        isHidden: editData.isHidden,
      };

      await onUpdate(game.id, updatedFields);

      if (editData.type === 'base') {
        const prevExpansions = gameCollection.filter(g => g.parentGameId === game.id).map(g => g.id);
        const removed = prevExpansions.filter(id => !selectedExpansions.includes(id));
        const added = selectedExpansions.filter(id => !prevExpansions.includes(id));
        await Promise.all([
          ...removed.map(id => updateGame(id, { parentGameId: '' })),
          ...added.map(id => updateGame(id, { parentGameId: game.id, type: 'expansion' })),
        ]);
      }

      setIsEditing(false);
      alert('게임 정보가 수정되었습니다.');
    } catch (error) {
      console.error('Failed to update game data:', error);
      alert('저장하는 동안 오류가 발생했습니다.');
    }
  };

  /* ── 핸들러: 보드라이프/BGG 정보 불러오기 ── */
  const handleFetchGameInfo = async () => {
    if (!game.boardlifeId) { alert('보드라이프 ID가 등록되어 있지 않습니다.'); return; }

    setIsFetchingInfo(true);
    try {
      const devPath = `/boardlife/game/${game.boardlifeId}`;
      const prodUrl = `https://boardlife.co.kr/game/${game.boardlifeId}`;
      
      let htmlText = '';
      try {
        htmlText = await proxyFetchHtml(devPath, prodUrl);
      } catch (blErr) {
        console.warn('보드라이프 수집 실패(보안 차단 가능성):', blErr);
      }

      const bl = htmlText ? extractDetailsFromHtml(htmlText) : {};
      
      let bggId = game.bggId;
      if (!bggId && htmlText) {
        const bggMatch = htmlText.match(/boardgamegeek\.com\/(?:boardgame|boardgameexpansion|thing)\/(\d+)/i);
        if (bggMatch) bggId = bggMatch[1];
      }

      let bggData = null;
      if (bggId) {
        try {
          bggData = await bggService.getGameDetails(bggId, game.type === 'expansion' ? 'boardgameexpansion' : 'boardgame');
        } catch (bggErr) {
          console.error('BGG 보강 실패:', bggErr);
        }
      }

      if (htmlText || bggData) {
        setEditData(prev => ({
          ...prev,
          year: bggData?.year || bl.year || prev.year,
          minPlayers: bggData?.minPlayers || bl.minPlayers || prev.minPlayers,
          maxPlayers: bggData?.maxPlayers || bl.maxPlayers || prev.maxPlayers,
          playingTime: bggData?.playingTime || bl.playingTime || prev.playingTime,
          rating: bggData?.rating || bl.rating || prev.rating,
          weight: bggData?.weight || bl.weight || prev.weight,
          bestPlayerCount: bggData?.bestPlayerCount || bl.bestPlayerCount || prev.bestPlayerCount,
          category: bl.category || prev.category,
          theme: bl.theme || prev.theme,
          mechanisms: bl.mechanisms || prev.mechanisms,
          bggId: bggId || prev.bggId,
        }));

        if (bggData?.description) {
          try {
            const translated = await translateToKorean(
              bggData.description.replace(/<[^>]+>/g, '').replace(/&#10;/g, ' ').trim()
            );
            if (translated) setEditData(prev => ({ ...prev, description: translated }));
          } catch (transErr) {
            console.error('설명 번역 실패:', transErr);
          }
        }
        
        alert('데이터를 성공적으로 불러왔습니다. 내용을 확인하신 후 [저장]을 눌러주세요.');
      } else {
        alert('데이터를 가져오는데 실패했습니다. 보드라이프 보안 차단 여부와 BGG ID를 확인해 주세요.');
      }
    } catch (err) {
      console.error('Fetch Info Error:', err);
      alert('오류가 발생했습니다: ' + err.message);
    } finally {
      setIsFetchingInfo(false);
    }
  };

  /* ── 핸들러: 대여 신청 ── */
  const handleRentSubmit = async e => {
    e.preventDefault();
    if (!rentEmail || !rentStartDate || !rentEndDate) { alert('모든 필드를 입력해주세요.'); return; }
    setIsSubmittingRent(true);
    try {
      await addDoc(collection(db, 'rentalRequests'), {
        gameId: game.id,
        gameName: game.name,
        email: rentEmail,
        rentDate: rentStartDate,
        returnDate: rentEndDate,
        status: 'pending',
        requestedAt: new Date().toISOString(),
      });
      alert('대여 신청이 완료되었습니다.');
      setShowRentForm(false);
      setRentEmail('');
      setRentStartDate(todayStr);
      setRentEndDate(todayStr);
    } catch (error) {
      console.error('Failed to submit rent request:', error);
      alert('대여 신청 중 오류가 발생했습니다.');
    } finally {
      setIsSubmittingRent(false);
    }
  };

  /* ── 핸들러: 확장판 토글 ── */
  const handleToggleExpansion = (id, checked) => {
    setSelectedExpansions(prev =>
      checked ? [...prev, id] : prev.filter(eid => eid !== id)
    );
  };

  /* ── 렌더 ── */
  return (
    <div
      onClick={onClose}
      className="animate-fade-in"
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)',
      }}
    >
      {/* 배경 블러 이미지 */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `url(${game.image})`,
        backgroundSize: 'cover', backgroundPosition: 'center',
        filter: 'blur(60px) brightness(0.4)', opacity: 0.4, zIndex: -1,
      }} />

      <div
        className="animate-slide-up glass detail-modal"
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: '800px', maxHeight: '95vh',
          borderRadius: '20px', overflow: 'hidden', display: 'flex',
          flexDirection: 'column', boxShadow: 'var(--shadow-xl)',
          background: 'var(--bg-modal)', border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        {/* 헤더 */}
        <GameDetailHeader
          game={game}
          isEditing={isEditing}
          isAdmin={isAdmin}
          onEdit={() => setIsEditing(true)}
          onSave={handleSave}
          onCancelEdit={() => setIsEditing(false)}
          onClose={onClose}
        />

        {/* 본문 */}
        <div className="detail-content" style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          <div className="detail-grid" style={{ display: 'grid', gridTemplateColumns: '270px 1fr', gap: '32px' }}>

            {/* 좌측: 이미지 + 통계 + 대여 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {!isEditing && (
                <RentRequestForm
                  game={game}
                  showRentForm={showRentForm}
                  onShowForm={() => setShowRentForm(true)}
                  rentEmail={rentEmail}
                  rentStartDate={rentStartDate}
                  rentEndDate={rentEndDate}
                  isSubmittingRent={isSubmittingRent}
                  onEmailChange={setRentEmail}
                  onStartDateChange={setRentStartDate}
                  onEndDateChange={setRentEndDate}
                  onSubmit={handleRentSubmit}
                  onCancel={() => setShowRentForm(false)}
                />
              )}

              <GameImageSection
                game={game}
                isEditing={isEditing}
                isUploading={isUploading}
                isFetchingInfo={isFetchingInfo}
                editData={editData}
                players={players}
                fileInputRef={fileInputRef}
                onImageClick={() => fileInputRef.current?.click()}
                onImageChange={handleImageUpload}
                onFetchInfo={handleFetchGameInfo}
                onEditDataChange={handleInputChange}
              />
            </div>

            {/* 우측: 상세 정보 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <GameInfoSection
                game={game}
                isEditing={isEditing}
                editData={editData}
                isDescExpanded={isDescExpanded}
                onDescToggle={() => setIsDescExpanded(p => !p)}
                onEditDataChange={handleInputChange}
              />

              {/* 관리자 편집 필드 & 확장판 연결 (편집 모드) */}
              {isEditing && (
                <AdminEditFields editData={editData} onInputChange={handleInputChange}>
                  <ExpansionRelations
                    game={game}
                    isEditing={isEditing}
                    editType={editData.type}
                    selectedExpansions={selectedExpansions}
                    onToggleExpansion={handleToggleExpansion}
                    onGameChange={onGameChange}
                  />
                </AdminEditFields>
              )}

              {/* 확장판 관계 (뷰 모드) */}
              {!isEditing && (
                <ExpansionRelations
                  game={game}
                  isEditing={false}
                  onGameChange={onGameChange}
                />
              )}

              {/* 외부 링크 */}
              {!isEditing && <ExternalLinks game={game} />}

              {/* 삭제 버튼 */}
              {!isEditing && (isDev || isAdmin) && (
                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end', paddingTop: '16px' }}>
                  <DangerButton
                    onClick={async () => {
                      const deleted = await onDelete(game.id);
                      if (deleted) onClose();
                    }}
                    icon={Trash2}
                  >
                    컬렉션에서 삭제
                  </DangerButton>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
