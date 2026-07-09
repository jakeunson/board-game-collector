import { isDev } from './envUtils.js';

export const THEME_KEYWORDS = [
  'Fantasy', 'Science Fiction', 'Horror', 'Medieval', 'Ancient', 'Animals', 'Zombies',
  'Pirates', 'Mythology', 'Renaissance', 'Space Exploration', 'Western', 'Mafia',
  'Spies/Secret Agents', 'Trains', 'Nautical', 'Prehistoric', 'Age of Reason',
  'American Indian Wars', 'American Civil War', 'American Revolutionary War', 'Arabian',
  'Aviation / Flight', 'Comic Book / Strip', 'Cyberpunk', 'Environmental', 'Medical',
  'Movies / TV / Radio theme', 'Music', 'Novel-based', 'Post-Napoleonic', 'Religious',
  'Sports', 'Video Game Theme', 'World War I', 'World War II', 'Wargame', 'Political',
  'Farming', 'Industry / Manufacturing', 'Adventure', 'Exploration', 'City Building',
  'Civilization', 'Murder/Mystery', 'Humor', 'Territory Building'
];

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
  'Zombies': '좀비',
  'Farming': '농업',
  'Industry / Manufacturing': '산업/제조',
  'Renaissance': '르네상스',
  'Pirates': '해적',
  'Mythology': '신화',
  'Western': '서부시대',
  'Mafia': '마피아',
  'Spies/Secret Agents': '스파이/첩보',
  'Trains': '기차',
  'Nautical': '항해/해양',
  'Prehistoric': '선사시대',
  'Age of Reason': '이성시대',
  'American Indian Wars': '아메리카 원주민 전쟁',
  'American Civil War': '남북전쟁',
  'American Revolutionary War': '독립전쟁',
  'Arabian': '아라비아',
  'Aviation / Flight': '항공/비행',
  'Comic Book / Strip': '코믹북/만화',
  'Cyberpunk': '사이버펑크',
  'Environmental': '환경/자연',
  'Medical': '의학',
  'Movies / TV / Radio theme': '영화/TV',
  'Music': '음악',
  'Novel-based': '소설 기반',
  'Post-Napoleonic': '나폴레옹 이후',
  'Religious': '종교',
  'Sports': '스포츠',
  'Video Game Theme': '비디오게임 테마',
  'World War I': '제1차 세계대전',
  'World War II': '제2차 세계대전',
  'Wargame': '워게임',
  'Political': '정치',
  'Territory Building': '영토 확장',
  'Print & Play': 'PnP(출력 플레이)',
  'Humor': '유머',
  'Children\'s Game': '어린이 게임',
  'Educational': '교육용',
  'Word Game': '단어 게임',
  'Trivia': '퀴즈/상식',
  'Collectible Components': '수집형 컴포넌트',
  'Real-time': '실시간'
};

export const MECHANISM_MAP = {
  'Cooperative Game': '협력',
  'Storytelling': '스토리텔링',
  'Hand Management': '핸드 관리',
  'Grid Movement': '격자 이동',
  'Area Majority / Influence': '영향력 / 지역 장악',
  'Dice Rolling': '주사위 굴리기',
  'Tile Placement': '타일 놓기',
  'Drafting': '드래프트',
  'Action Retrieval': '액션 회수',
  'Variable Player Powers': '가변 플레이어 능력',
  'Deck, Bag, and Pool Building': '덱/백/풀 빌딩',
  'Solo / Solitaire Game': '1인 전용',
  'Campaign / Battle Card Driven': '캠페인 / 전투 카드 구동',
  'Worker Placement': '일꾼 놓기',
  'Set Collection': '셋 컬렉션',
  'Memory': '기억력',
  'Pattern Building': '패턴 구축',
  'Take That': '인터랙션 / 직접 공격',
  'Voting': '투표',
  'Push Your Luck': '운 시험하기',
  'Simultaneous Action Selection': '동시 행동 선택',
  'Automatic Resource Growth': '자원 자동 생성',
  'Closed Drafting': '비공개 드래프트',
  'Enclosure': '울타리 치기 / 영역 둘러싸기',
  'Increase Value of Unchosen Resources': '미선택 자원 가치 증가',
  'Turn Order: Claim Action': '턴 순서: 액션 선점',
  'Turn Order: Stat-Based': '턴 순서: 스탯 기반',
  'Turn Order: Progressive': '턴 순서: 순차적',
  'Turn Order: Auction': '턴 순서: 경매',
  'Auction / Bidding': '경매 / 입찰',
  'Area Movement': '지역 이동',
  'Point to Point Movement': '지점 간 이동',
  'Network and Route Building': '네트워크 및 경로 구축',
  'Trading': '교역 / 거래',
  'Secret Unit Deployment': '비밀 유닛 배치',
  'Role Playing': '역할 수행(RPG)',
  'Hexagon Grid': '육각 격자(헥스)',
  'Modular Board': '모듈식 보드',
  'Paper-and-Pencil': '종이와 연필',
  'Roll / Spin and Move': '굴려서 이동',
  'Team-Based Game': '팀 대항전',
  'Variable Setup': '가변 셋업',
  'Action Points': '액션 포인트',
  'Chaining': '체인(연쇄) 효과',
  'Contracts': '계약 / 의뢰 달성',
  'End Game Bonuses': '게임 종료 보너스',
  'Events': '이벤트',
  'Market': '시장',
  'Tech Trees / Tech Tracks': '테크 트리 / 기술 트랙',
  'Track Movement': '트랙 이동',
  'Income': '수입 시스템',
  'Loans': '대출 시스템',
  'Victory Points as a Resource': '자원으로서의 승점',
  'Scenario / Mission / Campaign Game': '시나리오 / 미션 / 캠페인',
  'Traitor Game': '배신자 시스템',
  'Semi-Cooperative Game': '반협력',
  'Hidden Movement': '비밀 이동',
  'King of the Hill': '고지 점령',
  'Legacy Game': '레거시',
  'Open Drafting': '공개 드래프트',
  'Pick-up and Deliver': '픽업 앤 딜리버리',
  'Player Elimination': '플레이어 탈락',
  'Race': '레이싱',
  'Rock-Paper-Scissors': '가위바위보',
  'Rondel': '론델 시스템',
  'Trick-taking': '트릭 테이킹',
  'Tug of War': '줄다리기'
};

export const separateBggCategoriesAndThemes = (categories = []) => {
  if (!Array.isArray(categories) || categories.length === 0) {
    return { categories: [], themes: [] };
  }
  const cats = [];
  const themes = [];
  
  categories.forEach(item => {
    if (THEME_KEYWORDS.includes(item)) {
      themes.push(item);
    } else {
      cats.push(item);
    }
  });

  if (cats.length === 0) {
    return { categories: [...categories], themes };
  }
  return { categories: cats, themes };
};

export const translateText = (text, map) => {
  if (!text) return '';
  return text.split(',').map(item => {
    const trimmed = item.trim();
    return map[trimmed] || trimmed;
  }).join(', ');
};

export const translateTermList = async (text, map) => {
  if (!text) return '';
  const items = text.split(',').map(item => item.trim()).filter(Boolean);
  const translated = [];
  
  for (const item of items) {
    if (map[item]) {
      translated.push(map[item]);
    } else if (/[a-zA-Z]/.test(item)) {
      try {
        const ko = await translateToKorean(item);
        translated.push(ko || item);
      } catch {
        translated.push(item);
      }
    } else {
      translated.push(item);
    }
  }
  return translated.join(', ');
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
