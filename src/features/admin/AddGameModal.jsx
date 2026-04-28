import React, { useState } from 'react';
import { X, Loader2, Link, CheckCircle, AlertCircle } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';

const CATEGORY_MAP = {
  'Deduction': '추리',
  'Murder/Mystery': '미스터리',
  'Puzzle': '퍼즐',
  'Card Game': '카드게임',
  'Fantasy': '판타지',
  'Adventure': '모험',
  'Exploration': '탐험',
  'Economic': '경제',
  'Fighting': '전투',
  'Negotiation': '협상',
  'Party Game': '파티게임',
  'Bluffing': '블러핑',
  'Strategy Games': '전략게임',
  'Family Game': '가족게임',
  'Thematic Games': '테마게임',
  'Ancient': '고대',
  'Animals': '동물',
  'Abstract Strategy': '추상전략',
  'Action / Dexterity': '액션/순발력',
  'City Building': '도시건설',
  'Civilization': '문명',
  'Dice': '주사위',
  'Medieval': '중세',
  'Space Exploration': '우주탐험',
  'Horror': '공포',
  'Miniatures': '피규어',
  'Science Fiction': 'SF',
  'Zombies': '좀비'
};

const MECHANISM_MAP = {
  'Cooperative Game': '협력',
  'Storytelling': '스토리텔링',
  'Hand Management': '핸드 관리',
  'Grid Movement': '격자 이동',
  'Area Majority / Influence': '영향력',
  'Dice Rolling': '주사위 굴리기',
  'Tile Placement': '타일 놓기',
  'Drafting': '드래프트',
  'Action Retrieval': '액션 회수',
  'Variable Player Powers': '가변 능력',
  'Deck, Bag, and Pool Building': '덱빌딩',
  'Solo / Solitaire Game': '1인 전용',
  'Campaign / Battle Card Driven': '캠페인',
  'Worker Placement': '일꾼 놓기',
  'Set Collection': '셋 컬렉션',
  'Memory': '기억력',
  'Pattern Building': '패턴 구축',
  'Take That': '인터랙션',
  'Voting': '투표',
  'Push Your Luck': '운 시험',
  'Simultaneous Action Selection': '동시 행동 선택'
};

const translateText = (text, map) => {
  if (!text) return '';
  return text.split(',').map(item => {
    const trimmed = item.trim();
    return map[trimmed] || trimmed;
  }).join(', ');
};

export default function AddGameModal({ onClose, onAddSuccess }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

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
    setStatusMessage('보드라이프에서 데이터를 가져오는 중...');

    try {
      // 1. Vite 로컬 프록시를 통해 HTML 가져오기 (UTF-8)
      const proxyUrl = `/boardlife/game/${boardlifeId}`;
      const response = await fetch(proxyUrl);
      
      if (!response.ok) throw new Error('페이지를 불러오는데 실패했습니다.');
      
      const htmlText = await response.text();

      setStatusMessage('데이터 분석 중...');

      // 2. JSON-LD 및 정규식 활용 데이터 추출
      let name = '알 수 없는 게임';
      let minPlayers = '';
      let maxPlayers = '';
      let playingTime = '';
      let description = '';
      let year = '';

      // JSON-LD 추출 시도
      const jsonLdMatch = htmlText.match(/<script type="application\/ld\+json">\s*(.*?)\s*<\/script>/is);
      if (jsonLdMatch) {
        try {
          const jsonData = JSON.parse(jsonLdMatch[1]);
          if (jsonData.name) name = jsonData.name;
          if (jsonData.numberOfPlayers) {
            minPlayers = parseInt(jsonData.numberOfPlayers.minValue) || '';
            maxPlayers = parseInt(jsonData.numberOfPlayers.maxValue) || minPlayers;
          }
          if (jsonData.playTime) {
            // 보드라이프 JSON-LD에서 playTime은 주로 최대 시간으로 쓰거나 범위임
            playingTime = parseInt(jsonData.playTime.maxValue) || parseInt(jsonData.playTime.minValue) || '';
          }
        } catch (e) {
          console.error("JSON-LD 파싱 실패", e);
        }
      }

      // JSON-LD로 못 찾은 경우 정규식/DOM 사용 (Fallback)
      if (name === '알 수 없는 게임') {
        const titleMatch = htmlText.match(/<title>(.*?)<\/title>/i);
        if (titleMatch) name = titleMatch[1].replace('보드게임 정보', '').trim();
      }

      // 설명 추출 (og:description)
      const descMatch = htmlText.match(/<meta property="og:description" content="(.*?)"/i);
      if (descMatch) description = descMatch[1].trim();

      // 보드라이프 이미지 추출 (og:image)
      let image = '';
      let thumbnail = '';
      const imageMatch = htmlText.match(/<meta property="og:image" content="(.*?)"/i);
      if (imageMatch) {
        image = imageMatch[1].trim();
        thumbnail = image;
      }

      // 출시년도 (정규식)
      const yearMatch = htmlText.match(/출시(?:년도)?\s*:\s*(\d{4})/i) || htmlText.match(/>\s*(\d{4})\s*</);
      if (yearMatch) year = yearMatch[1];

      let category = '';
      let mechanisms = '';

      // 보드라이프 키워드 기반 카테고리/진행방식 탐색 (우선순위)
      const blCategories = [];
      Object.values(CATEGORY_MAP).forEach(val => {
        if (htmlText.includes(val) && !blCategories.includes(val)) {
          blCategories.push(val);
        }
      });
      if (blCategories.length > 0) {
        category = blCategories.slice(0, 3).join(', ');
      }

      const blMechanisms = [];
      Object.values(MECHANISM_MAP).forEach(val => {
        if (htmlText.includes(val) && !blMechanisms.includes(val)) {
          blMechanisms.push(val);
        }
      });
      if (blMechanisms.length > 0) {
        mechanisms = blMechanisms.slice(0, 4).join(', ');
      }

      // 4. BGG ID 추출 및 데이터 보강
      let bggId = '';
      let weight = '';
      let rating = '';
      let englishName = '';

      const bggMatch = htmlText.match(/boardgamegeek\.com\/boardgame\/(\d+)/i) || htmlText.match(/boardgamegeek\.com\/.*?\/(\d+)/i);
      if (bggMatch) {
        bggId = bggMatch[1];
        setStatusMessage('BGG에서 상세 데이터 수집 중...');
        try {
          const bggRes = await fetch(
            `/bgg-api/api/geekitems?objecttype=thing&subtype=boardgame&objectid=${bggId}&ajax=1&nosession=1`,
            { headers: { 'Accept': 'application/json' } }
          );
          if (bggRes.ok) {
            const bggData = await bggRes.json();
            const item = bggData?.item;
            if (item) {
              if (item.name) englishName = item.name.trim();
              if (item.stats?.average) rating = parseFloat(item.stats.average).toFixed(1);
              if (item.stats?.avgweight) weight = parseFloat(item.stats.avgweight).toFixed(2);
              
              if (!category && item.links?.boardgamecategory) {
                const rawCats = item.links.boardgamecategory.map(l => l.name).slice(0, 3).join(', ');
                category = translateText(rawCats, CATEGORY_MAP);
              }
              if (!mechanisms && item.links?.boardgamemechanic) {
                const rawMechs = item.links.boardgamemechanic.map(l => l.name).slice(0, 4).join(', ');
                mechanisms = translateText(rawMechs, MECHANISM_MAP);
              }

              if (!image && item.images) {
                image = item.images.original || item.images.large || item.images.medium || '';
                thumbnail = item.images.thumb || image;
              }
            }
          }
        } catch (e) {
          console.error("BGG 보강 실패", e);
        }
      }

      // BGG ID를 못 찾았거나 API가 실패했을 경우 보드라이프 내 평점/난이도 정규식 시도
      if (!rating) {
        const ratingMatch = htmlText.match(/평점\s*:?\s*(\d+(\.\d+)?)/i) || htmlText.match(/(\d+(\.\d+)?)\s*점/);
        if (ratingMatch) rating = parseFloat(ratingMatch[1]).toFixed(1);
      }
      if (!weight) {
        const weightMatch = htmlText.match(/난이도\s*:?\s*(\d+(\.\d+)?)/i);
        if (weightMatch) weight = parseFloat(weightMatch[1]).toFixed(2);
      }
      if (!englishName) {
        const engMatch = name.match(/[a-zA-Z\s]{2,}/);
        if (engMatch) englishName = engMatch[0].trim();
      }

      // 5. 확장판 식별 로직
      let type = 'base';
      if (name.includes('확장') || htmlText.includes('확장판') || htmlText.includes('본판 필요')) {
        type = 'expansion';
      }

      setStatusMessage('Firestore에 저장 중...');

      // 6. Firestore 저장
      const newGame = {
        name,
        englishName,
        type,
        year,
        boardlifeId,
        bggId,
        minPlayers: minPlayers ? Number(minPlayers) : '',
        maxPlayers: maxPlayers ? Number(maxPlayers) : '',
        playingTime: playingTime ? Number(playingTime) : '',
        weight: weight ? Number(weight) : '',
        rating: rating ? Number(rating) : '',
        category,
        theme: category, // 테마 데이터가 따로 없을 경우 카테고리를 테마로도 함께 채워 검색 활용
        mechanisms,
        description,
        image: image,
        thumbnail: thumbnail,
        isRented: false
      };

      const docRef = await addDoc(collection(db, "games"), newGame);
      const addedGame = { id: docRef.id, ...newGame };

      setSuccess(true);
      setUrl('');
      setStatusMessage('게임이 성공적으로 추가되었습니다!');

      if (onAddSuccess) {
        setTimeout(() => {
          onAddSuccess(addedGame);
        }, 1000);
      }

      setSuccess(true);
      setUrl('');
      setStatusMessage('게임이 성공적으로 추가되었습니다!');
    } catch (err) {
      console.error(err);
      setError('게임 추가 중 오류가 발생했습니다: ' + err.message);
    } finally {
      setLoading(false);
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
      </div>
    </div>
  );
}
