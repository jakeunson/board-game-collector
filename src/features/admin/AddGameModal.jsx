import React, { useState } from 'react';
import { X, Loader2, Link, CheckCircle, AlertCircle } from 'lucide-react';
import { collection, addDoc, query, where, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { 
  CATEGORY_MAP, 
  MECHANISM_MAP, 
  translateText, 
  translateToKorean, 
  extractDetailsFromHtml 
} from '../../utils/gameDataExtractor';
import { boardlifeService } from '../../utils/boardlifeService';
import { bggService } from '../../utils/bggService';
import { Dice5, Search } from 'lucide-react';

export default function AddGameModal({ onClose, onAddSuccess }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchProgress, setBatchProgress] = useState('');

  const extractBoardlifeId = (inputUrl) => {
    const match = inputUrl.match(/\/game\/(\d+)/);
    return match ? match[1] : null;
  };

  const handleAddGame = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    const boardlifeId = extractBoardlifeId(url);
    if (!boardlifeId) {
      setError('올바른 보드라이프 게임 URL을 입력해주세요. (예: https://boardlife.co.kr/game/1421)');
      return;
    }

    setLoading(true);
    setStatusMessage('중복 게임 확인 중...');

    try {
      const q = query(collection(db, "games"), where("boardlifeId", "==", boardlifeId));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        alert('이미 등록된 게임입니다.');
        setError('이미 등록된 게임입니다.');
        setLoading(false);
        return;
      }
    } catch (err) {
      console.error("중복 검사 실패", err);
    }
    setStatusMessage('보드라이프에서 데이터를 가져오는 중...');

    try {
      // 1. 보드라이프 HTML 데이터 수집 (BGG ID 추출용)
      setStatusMessage('보드라이프 데이터 분석 중...');
      const isDev = window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1' || 
                    window.location.hostname.startsWith('192.168.') || 
                    window.location.hostname.startsWith('10.') ||
                    window.location.hostname.endsWith('.local');

      let htmlText = '';
      if (isDev) {
        const response = await fetch(`/boardlife/game/${boardlifeId}`);
        if (!response.ok) throw new Error('보드라이프 페이지를 불러오지 못했습니다.');
        htmlText = await response.text();
      } else {
        const targetUrl = `https://boardlife.co.kr/game/${boardlifeId}`;
        const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`);
        const data = await response.json();
        htmlText = data.contents;
      }

      // 2. 보드라이프에서 기본 정보 추출 (보드라이프 데이터 우선 순위)
      const doc = new DOMParser().parseFromString(htmlText, 'text/html');
      const bl = extractDetailsFromHtml(htmlText);
      const blName = doc.querySelector('title')?.textContent?.split('|')[0]?.trim() || '';
      
      // BGG ID 및 타입 추출 강화
      const bggMatch = htmlText.match(/boardgamegeek\.com\/(boardgame|boardgameexpansion|thing)\/(\d+)/i);
      const bggInfo = bggMatch ? { 
        type: bggMatch[1] === 'boardgameexpansion' ? 'boardgameexpansion' : 'boardgame', 
        bggId: bggMatch[2] 
      } : null;

      if (!bggInfo) {
        throw new Error('이 게임은 보드라이프에 BGG 링크가 연결되어 있지 않습니다.');
      }

      // 3. BGG 상세 정보 수집 (보충용)
      setStatusMessage('BGG에서 상세 정보 보충 중...');
      const bggData = await bggService.getGameDetails(bggInfo.bggId, bggInfo.type);
      
      if (!bggData) throw new Error('BGG에서 데이터를 가져오지 못했습니다.');

      // 4. 데이터 구성 및 번역
      setStatusMessage('데이터 정리 중...');
      
      // 카테고리/메커니즘 병합 (보드라이프 우선)
      const category = bl.category || translateText(bggData.categories.join(', '), CATEGORY_MAP);
      const mechanisms = bl.mechanisms || translateText(bggData.mechanisms.join(', '), MECHANISM_MAP);
      
      let description = bggData.description || '';
      if (description) {
        description = await translateToKorean(description.replace(/<[^>]+>/g, '').replace(/&#10;/g, ' ').trim());
      }

      const newGame = {
        name: blName || bggData.name || '',
        englishName: bggData.name || '',
        type: bggInfo.type === 'boardgameexpansion' ? 'expansion' : 'base',
        year: bl.year || bggData.year || '',
        bggId: bggData.bggId || '',
        boardlifeId: boardlifeId || '',
        minPlayers: (bl.minPlayers || bggData.minPlayers) ? Number(bl.minPlayers || bggData.minPlayers) : '',
        maxPlayers: (bl.maxPlayers || bggData.maxPlayers) ? Number(bl.maxPlayers || bggData.maxPlayers) : '',
        playingTime: (bl.playingTime || bggData.playingTime) ? Number(bl.playingTime || bggData.playingTime) : '',
        bestPlayerCount: bl.bestPlayerCount || bggData.bestPlayerCount || '',
        weight: (bl.weight || bggData.weight) ? Number(bl.weight || bggData.weight) : '',
        rating: (bl.rating || bggData.rating) ? Number(bl.rating || bggData.rating) : '',
        category: category || '',
        mechanisms: mechanisms || '',
        theme: bl.theme || '',
        description: description || '',
        image: bggData.image || '',
        thumbnail: bggData.thumbnail || '',
        isRented: false
      };

      const docRef = await addDoc(collection(db, "games"), newGame);
      const addedGameWithId = { id: docRef.id, ...newGame };

      setSuccess(true);
      setStatusMessage('게임이 성공적으로 추가되었습니다! (BGG 데이터 연동 완료)');
      setUrl('');
      
      if (onAddSuccess) {
        setTimeout(() => onAddSuccess(addedGameWithId), 1500);
      }
    } catch (err) {
      console.error(err);
      setError('게임 추가 중 오류가 발생했습니다: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBatchDetailUpdate = async () => {
    if (!window.confirm('이미 등록된 모든 게임의 세부 정보(출시년도, 카테고리, 테마, 진행방식)를 보드라이프에서 다시 가져와 일괄 업데이트하시겠습니까? (시간이 소요됩니다)')) {
      return;
    }

    setBatchLoading(true);
    setError('');
    
    try {
      setBatchProgress('Firestore에서 게임 목록 가져오는 중...');
      const querySnapshot = await getDocs(collection(db, "games"));
      const games = querySnapshot.docs.map(doc => ({ docId: doc.id, ...doc.data() }));
      
      setBatchProgress(`총 ${games.length}개의 게임 발견. 세부 정보 업데이트를 시작합니다.`);
      
      for (let i = 0; i < games.length; i++) {
        const game = games[i];
        setBatchProgress(`[${i + 1}/${games.length}] ${game.name} 처리 중...`);
        
        if (game.boardlifeId) {
          try {
            const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            let blUrl = `/boardlife/game/${game.boardlifeId}`;
            if (!isDev) {
              blUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(`https://boardlife.co.kr/game/${game.boardlifeId}`)}`;
            }
            
            const blRes = await fetch(blUrl);
            if (blRes.ok) {
              let htmlText = '';
              if (isDev) {
                htmlText = await blRes.text();
              } else {
                const allOriginsData = await blRes.json();
                htmlText = allOriginsData.contents;
              }
              
              const { year, category, theme, mechanisms } = extractDetailsFromHtml(htmlText);
              
              const updateData = {
                year: year || game.year || '',
                category: category || '',
                theme: theme || '',
                mechanisms: mechanisms || ''
              };

              // BGG Fallback for Year
              if (!updateData.year && game.bggId) {
                try {
                  const bggSubtype = game.type === 'expansion' ? 'boardgameexpansion' : 'boardgame';
                  let bggUrl = `/bgg-api/api/geekitems?objecttype=thing&subtype=${bggSubtype}&objectid=${game.bggId}&ajax=1&nosession=1`;
                  if (!isDev) {
                    const targetBggUrl = `https://api.geekdo.com/api/geekitems?objecttype=thing&subtype=${bggSubtype}&objectid=${game.bggId}&ajax=1&nosession=1`;
                    bggUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetBggUrl)}`;
                  }
                  
                  const bggRes = await fetch(bggUrl);
                  if (bggRes.ok) {
                    let bggData;
                    if (isDev) bggData = await bggRes.json();
                    else {
                      const aoData = await bggRes.json();
                      bggData = JSON.parse(aoData.contents);
                    }
                    if (bggData?.item?.yearpublished) {
                      updateData.year = bggData.item.yearpublished;
                    }
                  }
                } catch (bggErr) {
                  console.error("BGG Year Fallback 실패:", bggErr);
                }
              }

              await updateDoc(doc(db, "games", game.docId), updateData);
              setBatchProgress(`[${i + 1}/${games.length}] ${game.name} 업데이트 성공`);
            }
          } catch (blErr) {
            console.error(`${game.name} 세부 정보 업데이트 실패:`, blErr);
          }
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      setBatchProgress('모든 게임의 세부 정보 일괄 업데이트 완료!');
      alert('일괄 업데이트가 완료되었습니다.');
    } catch (err) {
      console.error("일괄 업데이트 실패:", err);
      setError("일괄 업데이트 실패: " + err.message);
    } finally {
      setBatchLoading(false);
    }
  };

  const handleBatchUpdate = async () => {
    if (!window.confirm('이미 등록된 모든 게임의 소개글을 BGG에서 다시 가져와 한글로 일괄 업데이트하시겠습니까? (시간이 다소 소요됩니다)')) {
      return;
    }

    setBatchLoading(true);
    setError('');
    
    try {
      setBatchProgress('Firestore에서 게임 목록 가져오는 중...');
      const querySnapshot = await getDocs(collection(db, "games"));
      const games = querySnapshot.docs.map(doc => ({ docId: doc.id, ...doc.data() }));
      
      setBatchProgress(`총 ${games.length}개의 게임 발견. 업데이트를 시작합니다.`);
      
      for (let i = 0; i < games.length; i++) {
        const game = games[i];
        setBatchProgress(`[${i + 1}/${games.length}] ${game.name} 처리 중...`);
        
        let bggId = game.bggId;
        let bggSubtype = 'boardgame';
        
        if (!bggId && game.boardlifeId) {
          try {
            const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            let blUrl = `/boardlife/game/${game.boardlifeId}`;
            if (!isDev) {
              blUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(`https://boardlife.co.kr/game/${game.boardlifeId}`)}`;
            }
            
            const blRes = await fetch(blUrl);
            if (blRes.ok) {
              let htmlText = '';
              if (isDev) {
                htmlText = await blRes.text();
              } else {
                const allOriginsData = await blRes.json();
                htmlText = allOriginsData.contents;
              }
              
              const bggMatch = htmlText.match(/boardgamegeek\.com\/(boardgame|boardgameexpansion|thing)\/(\d+)/i);
              if (bggMatch) {
                const type = bggMatch[1];
                bggId = bggMatch[2];
                bggSubtype = type === 'boardgameexpansion' ? 'boardgameexpansion' : 'boardgame';
              }
            }
          } catch (blErr) {
            console.error(`${game.name} 보드라이프 BGG ID 추출 실패:`, blErr);
          }
        }
        
        if (bggId) {
          try {
            const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            let bggUrl = `/bgg-api/api/geekitems?objecttype=thing&subtype=${bggSubtype}&objectid=${bggId}&ajax=1&nosession=1`;
            if (!isDev) {
              const targetBggUrl = `https://api.geekdo.com/api/geekitems?objecttype=thing&subtype=${bggSubtype}&objectid=${bggId}&ajax=1&nosession=1`;
              bggUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetBggUrl)}`;
            }

            const bggRes = await fetch(bggUrl, isDev ? { headers: { 'Accept': 'application/json' } } : {});
            if (bggRes.ok) {
              let bggData;
              if (isDev) {
                bggData = await bggRes.json();
              } else {
                const allOriginsData = await bggRes.json();
                bggData = JSON.parse(allOriginsData.contents);
              }
              
              const item = bggData?.item;
              if (item && item.description) {
                const rawDesc = item.description;
                const docParser = new DOMParser().parseFromString(rawDesc, "text/html");
                const cleanDesc = docParser.documentElement.textContent;
                
                setBatchProgress(`[${i + 1}/${games.length}] ${game.name} 설명 번역 중...`);
                const translated = await translateToKorean(cleanDesc);
                
                if (translated && translated.length > 50) {
                  await updateDoc(doc(db, "games", game.docId), {
                    description: translated,
                    bggId: bggId
                  });
                  setBatchProgress(`[${i + 1}/${games.length}] ${game.name} 업데이트 성공`);
                }
              }
            }
          } catch (bggErr) {
            console.error(`${game.name} BGG 소개 업데이트 실패:`, bggErr);
          }
        } else {
          setBatchProgress(`[${i + 1}/${games.length}] ${game.name} BGG ID 없음`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      
      setBatchProgress('모든 게임의 소개글 일괄 업데이트 완료!');
      alert('일괄 업데이트가 완료되었습니다.');
    } catch (err) {
      console.error("일괄 업데이트 실패:", err);
      setError("일괄 업데이트 실패: " + err.message);
    } finally {
      setBatchLoading(false);
    }
  };


  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 1000, padding: '16px'
    }}>
      <div className="glass animate-slide-up" style={{
        width: '100%', maxWidth: '500px', borderRadius: '20px',
        border: '1px solid var(--border-medium)', overflow: 'hidden'
      }}>
        <div style={{
          padding: '20px', display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', borderBottom: '1px solid var(--border-subtle)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Link size={18} style={{ color: 'var(--accent-primary)' }} />
            <h3 style={{ fontSize: '16px', fontWeight: '800' }}>URL로 게임 추가</h3>
          </div>
          <button onClick={onClose} disabled={loading} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleAddGame} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            보드라이프의 게임 상세 페이지 URL을 입력하시면 자동으로 정보를 수집하여 컬렉션에 추가합니다.
          </p>

          <div>
            <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>보드라이프 URL</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://boardlife.co.kr/game/1421"
              disabled={loading}
              required
              style={{
                width: '100%', padding: '12px', background: 'var(--bg-app)',
                border: '1px solid var(--border-subtle)', borderRadius: '10px',
                color: 'var(--text-primary)', marginTop: '6px', fontSize: '14px'
              }}
            />
          </div>

          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent-primary)', fontSize: '13px', fontWeight: '600', padding: '4px 0' }}>
              <Loader2 size={16} className="animate-spin" />
              <span>{statusMessage}</span>
            </div>
          )}

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', fontSize: '13px', fontWeight: '600' }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontSize: '13px', fontWeight: '600' }}>
              <CheckCircle size={16} />
              <span>{statusMessage}</span>
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
            <button type="submit" disabled={loading} className="btn-primary" style={{ flex: 1, padding: '12px', fontSize: '14px', fontWeight: '700' }}>
              {loading ? '추가 중...' : '게임 추가하기'}
            </button>
            <button type="button" onClick={onClose} disabled={loading} style={{ flex: 1, padding: '12px', background: 'none', border: '1px solid var(--border-subtle)', borderRadius: '10px', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '14px' }}>
              취소
            </button>
          </div>
        </form>

        {/* Batch Update Section */}
        <div style={{ padding: '0 20px 20px 20px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', lineHeight: '1.4' }}>
            ⚠️ 이미 컬렉션에 등록된 모든 게임의 소개글을 BGG에서 다시 가져와 한글로 일괄 업데이트합니다. (게임당 약 3~5초가 소요됩니다.)
          </p>
          <button 
            type="button" 
            onClick={handleBatchUpdate} 
            disabled={loading || batchLoading} 
            style={{ 
              width: '100%', padding: '10px', background: 'var(--bg-app)', 
              border: '1px solid var(--border-subtle)', borderRadius: '10px', 
              color: 'var(--text-primary)', cursor: 'pointer', fontSize: '13px', 
              fontWeight: '700', transition: 'all 0.2s' 
            }}
          >
            {batchLoading ? '일괄 업데이트 진행 중...' : '기존 게임 소개글 일괄 업데이트'}
          </button>
          
          <button 
            type="button" 
            onClick={handleBatchDetailUpdate} 
            disabled={loading || batchLoading} 
            style={{ 
              width: '100%', padding: '10px', background: 'var(--bg-app)', 
              border: '1px solid var(--border-subtle)', borderRadius: '10px', 
              color: 'var(--text-primary)', cursor: 'pointer', fontSize: '13px', 
              fontWeight: '700', transition: 'all 0.2s' 
            }}
          >
            {batchLoading ? '일괄 업데이트 진행 중...' : '기존 게임 세부 정보 일괄 업데이트 (카테고리/테마 등)'}
          </button>

            {batchProgress && (
              <div style={{ fontSize: '11px', color: 'var(--accent-primary)', fontFamily: 'monospace', background: 'var(--bg-app)', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                {batchProgress}
              </div>
            )}

          </div>
      </div>
    </div>
  );
}
