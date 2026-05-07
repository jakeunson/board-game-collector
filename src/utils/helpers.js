/**
 * 공통 헬퍼 함수
 * 여러 컴포넌트에서 중복 정의된 유틸 함수를 모아 관리합니다.
 */

/**
 * 게임 이름에서 결정론적 그라디언트를 생성합니다.
 * GameCard, GameListItem에서 각각 정의하던 함수를 통합합니다.
 * @param {string} name 게임명
 * @returns {string} CSS gradient 문자열
 */
export function nameToGradient(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h1 = Math.abs(hash) % 360;
  const h2 = (h1 + 40) % 360;
  return `linear-gradient(135deg, hsl(${h1}, 45%, 65%), hsl(${h2}, 45%, 55%))`;
}

/**
 * 최소/최대 인원을 한국어 문자열로 포맷합니다.
 * GameDetail, GameListItem에서 각각 중복 정의하던 로직을 통합합니다.
 * @param {number|string} minPlayers
 * @param {number|string} maxPlayers
 * @returns {string|null} 예: "2–5인", "4인", null
 */
export function formatPlayers(minPlayers, maxPlayers) {
  if (minPlayers && maxPlayers) {
    return minPlayers === maxPlayers
      ? `${maxPlayers}인`
      : `${minPlayers}–${maxPlayers}인`;
  }
  if (maxPlayers) return `${maxPlayers}인`;
  return null;
}
