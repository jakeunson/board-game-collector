import React, { useState } from 'react';
import { X, Loader2, Link, CheckCircle, AlertCircle } from 'lucide-react';
import { collection, addDoc, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { 
  CATEGORY_MAP, 
  MECHANISM_MAP, 
  translateText, 
  translateToKorean, 
  extractDetailsFromHtml,
  separateBggCategoriesAndThemes,
  translateTermList
} from '../../utils/gameDataExtractor';
import { bggService } from '../../utils/bggService';
import { boardlifeService } from '../../utils/boardlifeService';
import { proxyFetchHtml, proxyFetchJson } from '../../utils/proxyFetch';
import { Dice5, Search } from 'lucide-react';

export default function AddGameModal({ onClose, onAddSuccess }) {
  const [activeTab, setActiveTab] = useState('bgg'); // 'bgg' or 'url'
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchProgress, setBatchProgress] = useState('');

  // BGG Search states
  const [bggQuery, setBggQuery] = useState('');
  const [bggSearching, setBggSearching] = useState(false);
  const [bggResults, setBggResults] = useState([]);
  const [selectedBggGame, setSelectedBggGame] = useState(null);
  const [bggDetailLoading, setBggDetailLoading] = useState(false);
  const [bggDetailData, setBggDetailData] = useState(null);
  const [customKoreanName, setCustomKoreanName] = useState('');

  const extractBoardlifeId = (inputUrl) => {
    const match = inputUrl.match(/\/game\/(\d+)/);
    return match ? match[1] : null;
  };

  const handleBggSearch = async (e) => {
    e.preventDefault();
    if (!bggQuery.trim()) return;
    
    setBggSearching(true);
    setError('');
    setSelectedBggGame(null);
    setBggDetailData(null);
    
    try {
      const results = await bggService.searchGames(bggQuery);
      setBggResults(results);
      if (results.length === 0) {
        setError('검색 결과가 없습니다. 영문 게임명이나 BGG ID로 검색해 보세요.');
      }
    } catch (err) {
      setError('BGG 검색 중 오류가 발생했습니다: ' + err.message);
    } finally {
      setBggSearching(false);
    }
  };

  const handleSelectBggGame = async (game) => {
    setSelectedBggGame(game);
    setBggDetailLoading(true);
    setError('');
    
    try {
      const bggSubtype = game.type === 'expansion' ? 'boardgameexpansion' : 'boardgame';
      const detail = await bggService.getGameDetails(game.bggId, bggSubtype);
      
      if (!detail) {
        throw new Error('BGG에서 게임 상세 정보를 불러오지 못했습니다.');
      }

      // 소개글 및 카테고리 한글화
      let translatedDesc = detail.description || '';
      if (translatedDesc) {
        const docParser = new DOMParser().parseFromString(translatedDesc, "text/html");
        const cleanDesc = docParser.documentElement.textContent;
        translatedDesc = await translateToKorean(cleanDesc);
      }

      const { categories: bggCats, themes: bggThemes } = separateBggCategoriesAndThemes(detail.categories || []);
      
      const translatedCategory = await translateTermList(bggCats.join(', '), CATEGORY_MAP);
      const translatedTheme = await translateTermList(bggThemes.join(', '), CATEGORY_MAP);
      const translatedMechanisms = await translateTermList(detail.mechanisms?.join(', ') || '', MECHANISM_MAP);

      const enrichedData = {
        ...detail,
        description: translatedDesc,
        category: translatedCategory,
        theme: translatedTheme,
        mechanisms: translatedMechanisms,
        type: game.type
      };

      setBggDetailData(enrichedData);
      setCustomKoreanName(detail.name || game.name);
    } catch (err) {
      setError('상세 정보 불러오기 실패: ' + err.message);
      setSelectedBggGame(null);
    } finally {
      setBggDetailLoading(false);
    }
  };

  const handleAddFromBgg = async () => {
    if (!bggDetailData) return;
    
    setLoading(true);
    setError('');
    setStatusMessage('중복 게임 확인 중...');
    
    try {
      const q = query(collection(db, "games"), where("bggId", "==", bggDetailData.bggId));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        alert('이미 컬렉션에 등록된 게임입니다.');
        setError('이미 컬렉션에 등록된 게임입니다.');
        setLoading(false);
        return;
      }

      setStatusMessage('보드라이프 ID 자동 검색 중...');
      let autoBoardlifeId = '';
      try {
        const targetName = customKoreanName.trim() || bggDetailData.name || '';
        autoBoardlifeId = await boardlifeService.getBoardlifeIdFromGameName(
          targetName,
          bggDetailData.englishName,
          bggDetailData.bggId
        ) || '';
      } catch (blErr) {
        console.warn('Boardlife ID auto lookup failed:', blErr);
      }

      setStatusMessage('컬렉션에 게임 저장 중...');
      const newGame = {
        name: customKoreanName.trim() || bggDetailData.name || '',
        englishName: bggDetailData.englishName || bggDetailData.name || '',
        type: bggDetailData.type === 'expansion' ? 'expansion' : 'base',
        year: bggDetailData.year || '',
        bggId: bggDetailData.bggId || '',
        boardlifeId: autoBoardlifeId,
        minPlayers: bggDetailData.minPlayers ? Number(bggDetailData.minPlayers) : '',
        maxPlayers: bggDetailData.maxPlayers ? Number(bggDetailData.maxPlayers) : '',
        playingTime: bggDetailData.playingTime ? Number(bggDetailData.playingTime) : '',
        bestPlayerCount: bggDetailData.bestPlayerCount || '',
        weight: bggDetailData.weight ? Number(bggDetailData.weight) : '',
        rating: bggDetailData.rating ? Number(bggDetailData.rating) : '',
        category: bggDetailData.category || '',
        mechanisms: bggDetailData.mechanisms || '',
        theme: bggDetailData.theme || '',
        description: bggDetailData.description || '',
        image: bggDetailData.image || '',
        thumbnail: bggDetailData.thumbnail || '',
        isRented: false
      };

      await addDoc(collection(db, "games"), newGame);
      setStatusMessage('게임이 성공적으로 추가되었습니다!');
      setSuccess(true);
      setTimeout(() => {
        onAddSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      console.error('BGG 게임 추가 오류:', err);
      setError('게임 추가 중 오류가 발생했습니다: ' + err.message);
    } finally {
      setLoading(false);
    }
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
      setStatusMessage('보드라이프 데이터 분석 중...');
      const targetUrl = `https://boardlife.co.kr/game/${boardlifeId}`;
      const devPath = `/boardlife/game/${boardlifeId}`;
      
      const htmlText = await proxyFetchHtml(devPath, targetUrl);

      if (!htmlText) throw new Error('보드라이프 페이지를 불러오지 못했습니다.');
      
      if (
        htmlText.includes('<title>Just a moment...</title>') ||
        htmlText.includes('<title>Attention Required! | Cloudflare</title>') ||
        htmlText.includes('Enable JavaScript and cookies to continue')
      ) {
        throw new Error('보안 확인(Cloudflare)에 의해 보드라이프 수집이 차단되었습니다. 잠시 후 다시 시도하거나 BGG ID를 확인해 주세요.');
      }

      const doc = new DOMParser().parseFromString(htmlText, 'text/html');
      const bl = extractDetailsFromHtml(htmlText);
      const blName = doc.querySelector('title')?.textContent?.split('|')[0]?.trim() || '';
      
      const bggMatch = htmlText.match(/boardgamegeek\.com\/(boardgame|boardgameexpansion|thing)\/(\d+)/i);
      const bggInfo = bggMatch ? { 
        type: bggMatch[1] === 'boardgameexpansion' ? 'boardgameexpansion' : 'boardgame', 
        bggId: bggMatch[2] 
      } : null;

      if (!bggInfo) {
        throw new Error('이 게임은 보드라이프에 BGG 링크가 연결되어 있지 않습니다.');
      }

      setStatusMessage('BGG에서 상세 정보 보충 중...');
      const bggData = await bggService.getGameDetails(bggInfo.bggId, bggInfo.type);
      
      if (!bggData) throw new Error('BGG에서 데이터를 가져오지 못했습니다.');

      setStatusMessage('데이터 정리 중...');
      
      let description = '';
      if (bggData.description) {
        setStatusMessage('BGG 소개글 한글 번역 중...');
        const docParser = new DOMParser().parseFromString(bggData.description, "text/html");
        const cleanDesc = docParser.documentElement.textContent;
        description = await translateToKorean(cleanDesc);
      } else {
        description = bl.description;
      }

      let category = bl.category;
      if (!category && bggData.categories?.length > 0) {
        category = translateText(bggData.categories.join(', '), CATEGORY_MAP);
      }

      let mechanisms = bl.mechanisms;
      if (!mechanisms && bggData.mechanisms?.length > 0) {
        mechanisms = translateText(bggData.mechanisms.join(', '), MECHANISM_MAP);
      }
      
      const newGame = {
        name: blName || bggData.name || '',
        englishName: bggData.name || '',
        type: bggInfo.type === 'boardgameexpansion' ? 'expansion' : 'base',
        year: bggData.year || bl.year || '',
        bggId: bggData.bggId || '',
        boardlifeId: boardlifeId || '',
        minPlayers: (bggData.minPlayers || bl.minPlayers) ? Number(bggData.minPlayers || bl.minPlayers) : '',
        maxPlayers: (bggData.maxPlayers || bl.maxPlayers) ? Number(bggData.maxPlayers || bl.maxPlayers) : '',
        playingTime: (bggData.playingTime || bl.playingTime) ? Number(bggData.playingTime || bl.playingTime) : '',
        bestPlayerCount: bggData.bestPlayerCount || bl.bestPlayerCount || '',
        weight: (bggData.weight || bl.weight) ? Number(bggData.weight || bl.weight) : '',
        rating: (bggData.rating || bl.rating) ? Number(bggData.rating || bl.rating) : '',
        category: category || '',
        mechanisms: mechanisms || '',
        theme: bl.theme || '',
        description: description || '',
        image: bggData.image || '',
        thumbnail: bggData.thumbnail || '',
        isRented: false
      };

      setStatusMessage('컬렉션에 게임 저장 중...');
      await addDoc(collection(db, "games"), newGame);

      setStatusMessage('게임이 성공적으로 추가되었습니다!');
      setSuccess(true);
      
      setTimeout(() => {
        onAddSuccess();
        onClose();
      }, 1500);

    } catch (err) {
      console.error('게임 추가 오류:', err);
      setError(err.message || '게임 추가 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleBatchUpdate = async () => {
    if (!window.confirm('이미 등록된 모든 게임의 소개글을 BGG에서 다시 가져와 한글로 일괄 업데이트하시겠습니까? (시간이 소요됩니다)')) {
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
            const blTargetUrl = `https://boardlife.co.kr/game/${game.boardlifeId}`;
            const blDevPath = `/boardlife/game/${game.boardlifeId}`;
            const htmlText = await proxyFetchHtml(blDevPath, blTargetUrl);
            
            if (htmlText) {
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
            const targetBggUrl = `https://api.geekdo.com/api/geekitems?objecttype=thing&subtype=${bggSubtype}&objectid=${bggId}&ajax=1&nosession=1`;
            const devBggPath = `/bgg-api/api/geekitems?objecttype=thing&subtype=${bggSubtype}&objectid=${bggId}&ajax=1&nosession=1`;
            const bggData = await proxyFetchJson(devBggPath, targetBggUrl);
            
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
        
        let updateData = {};
        
        // 1. 보드라이프에서 데이터 시도
        if (game.boardlifeId) {
          try {
            const blTargetUrl = `https://boardlife.co.kr/game/${game.boardlifeId}`;
            const blDevPath = `/boardlife/game/${game.boardlifeId}`;
            const htmlText = await proxyFetchHtml(blDevPath, blTargetUrl);
            if (htmlText) {
              const { year: blYear, category, theme, mechanisms } = extractDetailsFromHtml(htmlText);
              if (category) updateData.category = await translateTermList(category, CATEGORY_MAP);
              if (theme) updateData.theme = await translateTermList(theme, CATEGORY_MAP);
              if (mechanisms) updateData.mechanisms = await translateTermList(mechanisms, MECHANISM_MAP);
              if (blYear) updateData.year = blYear;
            }
          } catch (blErr) {
            console.error(`${game.name} 보드라이프 세부 정보 실패:`, blErr);
          }
        }

        // 2. BGG에서 데이터 시도 (BGG 데이터가 있거나 보드라이프 데이터가 비어있을 때 보완 및 한글 번역)
        if (game.bggId) {
          try {
            const bggSubtype = game.type === 'expansion' ? 'boardgameexpansion' : 'boardgame';
            const bggData = await bggService.getGameDetails(game.bggId, bggSubtype);
            
            if (bggData) {
              updateData.year = bggData.year || updateData.year || game.year || '';
              updateData.minPlayers = bggData.minPlayers ? Number(bggData.minPlayers) : (game.minPlayers || '');
              updateData.maxPlayers = bggData.maxPlayers ? Number(bggData.maxPlayers) : (game.maxPlayers || '');
              updateData.playingTime = bggData.playingTime ? Number(bggData.playingTime) : (game.playingTime || '');
              updateData.weight = bggData.weight ? Number(bggData.weight) : (game.weight || '');
              updateData.rating = bggData.rating ? Number(bggData.rating) : (game.rating || '');
              updateData.bestPlayerCount = bggData.bestPlayerCount || game.bestPlayerCount || '';

              // 카테고리/테마 분리 및 번역
              const { categories: bggCats, themes: bggThemes } = separateBggCategoriesAndThemes(bggData.categories || []);
              
              if (!updateData.category && bggCats.length > 0) {
                updateData.category = await translateTermList(bggCats.join(', '), CATEGORY_MAP);
              } else if (updateData.category) {
                updateData.category = await translateTermList(updateData.category, CATEGORY_MAP);
              }
              
              if (!updateData.theme && bggThemes.length > 0) {
                updateData.theme = await translateTermList(bggThemes.join(', '), CATEGORY_MAP);
              } else if (updateData.theme) {
                updateData.theme = await translateTermList(updateData.theme, CATEGORY_MAP);
              }

              if (!updateData.mechanisms && bggData.mechanisms?.length > 0) {
                updateData.mechanisms = await translateTermList(bggData.mechanisms.join(', '), MECHANISM_MAP);
              } else if (updateData.mechanisms) {
                updateData.mechanisms = await translateTermList(updateData.mechanisms, MECHANISM_MAP);
              }
            }
          } catch (bggErr) {
            console.error(`${game.name} BGG 데이터 조회 실패:`, bggErr);
          }
        } else {
          // BGG ID가 없는 경우 기존 보드라이프 데이터라도 한글 번역 보완
          if (updateData.category) updateData.category = await translateTermList(updateData.category, CATEGORY_MAP);
          if (updateData.theme) updateData.theme = await translateTermList(updateData.theme, CATEGORY_MAP);
          if (updateData.mechanisms) updateData.mechanisms = await translateTermList(updateData.mechanisms, MECHANISM_MAP);
        }

        if (Object.keys(updateData).length > 0) {
          await updateDoc(doc(db, "games", game.docId), updateData);
          setBatchProgress(`[${i + 1}/${games.length}] ${game.name} 업데이트 성공`);
        } else {
          setBatchProgress(`[${i + 1}/${games.length}] ${game.name} 업데이트할 데이터 없음`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      
      setBatchProgress('모든 게임의 세부 정보 일괄 업데이트 완료!');
      alert('세부 정보 일괄 업데이트가 완료되었습니다.');
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
        width: '100%', maxWidth: '520px', borderRadius: '20px',
        border: '1px solid var(--border-medium)', overflow: 'hidden',
        maxHeight: '90vh', display: 'flex', flexDirection: 'column'
      }}>
        <div style={{
          padding: '20px', display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', borderBottom: '1px solid var(--border-subtle)',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Dice5 size={20} style={{ color: 'var(--accent-primary)' }} />
            <h3 style={{ fontSize: '16px', fontWeight: '800' }}>새 보드게임 추가</h3>
          </div>
          <button onClick={onClose} disabled={loading || bggSearching} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* 탭 바 */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-app)', flexShrink: 0 }}>
          <button
            type="button"
            onClick={() => { setActiveTab('bgg'); setError(''); setSuccess(false); }}
            style={{
              flex: 1, padding: '14px', border: 'none', background: activeTab === 'bgg' ? 'transparent' : 'rgba(0,0,0,0.15)',
              color: activeTab === 'bgg' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'bgg' ? '800' : '600', fontSize: '13px', cursor: 'pointer',
              borderBottom: activeTab === 'bgg' ? '3px solid var(--accent-primary)' : '3px solid transparent',
              transition: 'all 0.2s'
            }}
          >
            🔍 BGG 검색으로 추가 (추천 ⭐)
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('url'); setError(''); setSuccess(false); }}
            style={{
              flex: 1, padding: '14px', border: 'none', background: activeTab === 'url' ? 'transparent' : 'rgba(0,0,0,0.15)',
              color: activeTab === 'url' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'url' ? '800' : '600', fontSize: '13px', cursor: 'pointer',
              borderBottom: activeTab === 'url' ? '3px solid var(--accent-primary)' : '3px solid transparent',
              transition: 'all 0.2s'
            }}
          >
            🔗 보드라이프 URL로 추가
          </button>
        </div>

        <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {activeTab === 'bgg' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                보드게임긱(BGG)의 데이터를 검색하여 차단 없이 안정적으로 게임을 추가합니다. 영문명, 한글명, 또는 BGG ID로 검색할 수 있습니다.
              </p>

              <form onSubmit={handleBggSearch} style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={bggQuery}
                  onChange={(e) => setBggQuery(e.target.value)}
                  placeholder="게임명 (예: Splendor, 아그리콜라) 또는 BGG ID"
                  disabled={bggSearching || loading}
                  style={{
                    flex: 1, padding: '12px', background: 'var(--bg-app)',
                    border: '1px solid var(--border-subtle)', borderRadius: '10px',
                    color: 'var(--text-primary)', fontSize: '14px'
                  }}
                />
                <button
                  type="submit"
                  disabled={bggSearching || loading || !bggQuery.trim()}
                  className="btn-primary"
                  style={{ padding: '0 18px', fontSize: '14px', fontWeight: '700', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}
                >
                  {bggSearching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                  <span>검색</span>
                </button>
              </form>

              {bggSearching && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: 'var(--accent-primary)', fontSize: '13px', fontWeight: '600', padding: '20px 0' }}>
                  <Loader2 size={18} className="animate-spin" />
                  <span>BGG에서 게임 검색 중...</span>
                </div>
              )}

              {!bggSearching && bggResults.length > 0 && !selectedBggGame && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto', paddingRight: '4px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>검색 결과 ({bggResults.length}건) - 원하는 게임을 선택하세요</span>
                  {bggResults.map((item) => (
                    <div
                      key={`${item.bggId}-${item.type}`}
                      onClick={() => handleSelectBggGame(item)}
                      style={{
                        padding: '12px', borderRadius: '10px', border: '1px solid var(--border-subtle)',
                        background: 'var(--bg-app)', display: 'flex', justifyContent: 'space-between',
                        alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>{item.name}</span>
                          {item.year && <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>({item.year})</span>}
                        </div>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <span style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '4px', background: item.type === 'expansion' ? 'rgba(168, 85, 247, 0.15)' : 'rgba(59, 130, 246, 0.15)', color: item.type === 'expansion' ? '#c084fc' : '#60a5fa', fontWeight: '600' }}>
                            {item.type === 'expansion' ? '확장판' : '기본판'}
                          </span>
                          <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>BGG #{item.bggId}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        style={{ padding: '6px 12px', borderRadius: '6px', background: 'var(--accent-primary)', color: '#fff', border: 'none', fontSize: '12px', fontWeight: '700', cursor: 'pointer', flexShrink: 0 }}
                      >
                        선택
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {bggDetailLoading && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '30px', gap: '10px', color: 'var(--accent-primary)' }}>
                  <Loader2 size={20} className="animate-spin" />
                  <span style={{ fontWeight: '600', fontSize: '13px' }}>{selectedBggGame?.name} 상세 정보 불러오는 중 및 한글 번역 중...</span>
                </div>
              )}

              {bggDetailData && !bggDetailLoading && (
                <div style={{ padding: '16px', borderRadius: '12px', background: 'var(--bg-app)', border: '1px solid var(--border-medium)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      {bggDetailData.thumbnail && (
                        <img src={bggDetailData.thumbnail} alt="" style={{ width: '54px', height: '54px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-subtle)' }} />
                      )}
                      <div>
                        <h4 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)' }}>{bggDetailData.englishName}</h4>
                        <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{bggDetailData.year}년 · {bggDetailData.minPlayers}~{bggDetailData.maxPlayers}인 · 평점 {bggDetailData.rating}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setSelectedBggGame(null); setBggDetailData(null); }}
                      style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', fontSize: '12px', textDecoration: 'underline' }}
                    >
                      다른 게임 선택
                    </button>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>한글 게임명 (필요시 수정 가능)</label>
                    <input
                      type="text"
                      value={customKoreanName}
                      onChange={(e) => setCustomKoreanName(e.target.value)}
                      placeholder="한글 게임명 입력"
                      disabled={loading}
                      style={{
                        width: '100%', padding: '10px', background: 'rgba(0,0,0,0.15)',
                        border: '1px solid var(--border-subtle)', borderRadius: '8px',
                        color: 'var(--text-primary)', marginTop: '4px', fontSize: '14px', fontWeight: '700'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    <div><strong style={{ color: 'var(--text-primary)' }}>카테고리:</strong> {bggDetailData.category || '없음'}</div>
                    <div><strong style={{ color: 'var(--text-primary)' }}>테마:</strong> {bggDetailData.theme || '없음'}</div>
                    <div><strong style={{ color: 'var(--text-primary)' }}>진행 방식:</strong> {bggDetailData.mechanisms || '없음'}</div>
                  </div>
                  
                  <button
                    type="button"
                    onClick={handleAddFromBgg}
                    disabled={loading || !customKoreanName.trim()}
                    className="btn-primary"
                    style={{ width: '100%', padding: '12px', fontSize: '14px', fontWeight: '700', borderRadius: '10px', marginTop: '6px' }}
                  >
                    {loading ? '추가 중...' : '이 게임 컬렉션에 추가하기'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleAddGame} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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

              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button type="submit" disabled={loading} className="btn-primary" style={{ flex: 1, padding: '12px', fontSize: '14px', fontWeight: '700' }}>
                  {loading ? '추가 중...' : '게임 추가하기'}
                </button>
                <button type="button" onClick={onClose} disabled={loading} style={{ flex: 1, padding: '12px', background: 'none', border: '1px solid var(--border-subtle)', borderRadius: '10px', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '14px' }}>
                  취소
                </button>
              </div>
            </form>
          )}

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
        </div>

        {/* Batch Update Section */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-app)', display: 'flex', flexDirection: 'column', gap: '10px', flexShrink: 0 }}>
          <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', lineHeight: '1.4' }}>
            ⚠️ 이미 컬렉션에 등록된 게임들의 정보를 BGG 및 보드라이프에서 다시 가져와 일괄 업데이트합니다.
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              type="button" 
              onClick={handleBatchUpdate} 
              disabled={loading || batchLoading} 
              style={{ 
                flex: 1, padding: '10px', background: 'rgba(0,0,0,0.1)', 
                border: '1px solid var(--border-subtle)', borderRadius: '8px', 
                color: 'var(--text-primary)', cursor: 'pointer', fontSize: '12px', 
                fontWeight: '700', transition: 'all 0.2s' 
              }}
            >
              {batchLoading ? '진행 중...' : '소개글 일괄 업데이트'}
            </button>
            
            <button 
              type="button" 
              onClick={handleBatchDetailUpdate} 
              disabled={loading || batchLoading} 
              style={{ 
                flex: 1, padding: '10px', background: 'rgba(0,0,0,0.1)', 
                border: '1px solid var(--border-subtle)', borderRadius: '8px', 
                color: 'var(--text-primary)', cursor: 'pointer', fontSize: '12px', 
                fontWeight: '700', transition: 'all 0.2s' 
              }}
            >
              {batchLoading ? '진행 중...' : '세부정보 일괄 업데이트'}
            </button>
          </div>

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
