import { isDev } from './envUtils.js';

export const CATEGORY_MAP = {
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

export const MECHANISM_MAP = {
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

export const translateText = (text, map) => {
  if (!text) return '';
  return text.split(',').map(item => {
    const trimmed = item.trim();
    return map[trimmed] || trimmed;
  }).join(', ');
};

export const splitIntoChunks = (text, maxLength = 1000) => {
  const chunks = [];
  let currentChunk = '';
  
  const sentences = text.split(/([.!?]\s+)/);
  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i];
    if ((currentChunk + sentence).length > maxLength) {
      if (currentChunk) chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += sentence;
    }
  }
  if (currentChunk) chunks.push(currentChunk.trim());
  return chunks;
};

export const translateToKorean = async (text) => {
  if (!text) return '';
  try {
    const chunks = splitIntoChunks(text, 1000);
    const translatedChunks = [];

    for (const chunk of chunks) {
      const baseUrl = isDev ? '/translate-api' : 'https://translate.googleapis.com';
      const url = `${baseUrl}/translate_a/single?client=gtx&sl=en&tl=ko&dt=t&q=${encodeURIComponent(chunk)}`;
      
      try {
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data && data[0]) {
            const translatedText = data[0].map(item => item[0]).join('');
            translatedChunks.push(translatedText);
          } else {
            translatedChunks.push(chunk);
          }
        } else {
          translatedChunks.push(chunk);
        }
      } catch (e) {
        console.error("Translation error for chunk:", e);
        translatedChunks.push(chunk);
      }
    }

    return translatedChunks.join(' ');
  } catch (err) {
    console.error("Failed to translate:", err);
    return text;
  }
};

/**
 * 보드라이프 HTML에서 세부 정보를 추출합니다.
 * 참고: 수치 데이터(인원, 시간, 평점, 난이도, 연도)는 현재 BGG 데이터를 최우선으로 하며,
 * 이 함수에서 추출된 값은 BGG 데이터가 없을 경우의 폴백(Fallback) 용도로 사용됩니다.
 */
export const extractDetailsFromHtml = (htmlText) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlText, "text/html");
  
  let year = '';
  const blYearMatch = htmlText.match(/(\d{4})년/);
  if (blYearMatch) year = blYearMatch[1];

  let minPlayers = '';
  let maxPlayers = '';
  const playersMatch = htmlText.match(/(\d+)\s*~\s*(\d+)\s*인/);
  if (playersMatch) {
    minPlayers = playersMatch[1];
    maxPlayers = playersMatch[2];
  } else {
    const singlePlayerMatch = htmlText.match(/(\d+)\s*인용/);
    if (singlePlayerMatch) {
      minPlayers = singlePlayerMatch[1];
      maxPlayers = singlePlayerMatch[1];
    }
  }

  let playingTime = '';
  const timeMatch = htmlText.match(/(\d+)\s*분/);
  if (timeMatch) playingTime = timeMatch[1];

  // 평점 및 난이도 추출 (보드라이프 상단 영역 - 초강력 정규식)
  // 아이콘 클래스명 뒤에 나오는 첫 번째 숫자를 타겟팅
  let rating = '';
  const rMatch = htmlText.match(/fa-star[^>]*>[\s\S]*?([\d.]+)/i);
  if (rMatch) rating = rMatch[1];
  
  let weight = '';
  const wMatch = htmlText.match(/fa-chart-bar[^>]*>[\s\S]*?([\d.]+)/i);
  if (wMatch) weight = wMatch[1];

  // 정규식 실패 시 DOM으로 2차 시도
  if (!rating || !weight) {
    // 보드라이프 상단 헤더 영역의 숫자들 탐색
    const scoreElements = doc.querySelectorAll('.fa-star, .fa-chart-bar');
    scoreElements.forEach(el => {
      const val = el.parentElement?.textContent?.trim().match(/[\d.]+/)?.[0];
      if (val) {
        if (el.classList.contains('fa-star')) rating = val;
        else if (el.classList.contains('fa-chart-bar')) weight = val;
      }
    });
  }

  let bestPlayerCount = '';
  const bestMatch = htmlText.match(/베스트\s*[:]\s*(\d+)인/);
  if (bestMatch) bestPlayerCount = bestMatch[1];

  let category = '';
  let theme = '';
  let mechanisms = '';

  const creditsBoxes = doc.querySelectorAll('.credits-box');
  creditsBoxes.forEach(box => {
    const titleEl = box.querySelector('.title-info');
    if (titleEl) {
      const titleText = titleEl.textContent.trim();
      const items = Array.from(box.querySelectorAll('a.title'))
        .map(a => a.textContent.trim())
        .filter(t => !t.startsWith('+') && !t.includes('더보기'));
      
      if (titleText.includes('카테고리')) category = items.join(', ');
      else if (titleText.includes('테마')) theme = items.join(', ');
      else if (titleText.includes('진행방식')) mechanisms = items.join(', ');
    }
  });

  return { 
    year, category, theme, mechanisms, 
    minPlayers, maxPlayers, playingTime, 
    rating, weight, bestPlayerCount 
  };
};
