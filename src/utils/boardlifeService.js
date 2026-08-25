/**
 * Boardlife Service Utility
 * Helps extract BGG information from Boardlife pages.
 */

import { proxyFetchHtml } from './proxyFetch';

export const boardlifeService = {
  /**
   * Extract BGG ID from a Boardlife game page
   * @param {string} boardlifeId Boardlife Game ID
   * @returns {Promise<{bggId: string, type: string}|null>}
   */
  async getBggIdFromBoardlife(boardlifeId) {
    if (!boardlifeId) return null;

    try {
      const devPath = `/boardlife/game/${boardlifeId}`;
      const prodUrl = `https://boardlife.co.kr/game/${boardlifeId}`;
      const htmlText = await proxyFetchHtml(devPath, prodUrl);

      // BGG 링크 패턴 추출
      const bggMatch = htmlText.match(/boardgamegeek\.com\/(boardgame|boardgameexpansion)\/(\d+)/i);
      if (bggMatch) {
        return {
          type: bggMatch[1], // 'boardgame' or 'boardgameexpansion'
          bggId: bggMatch[2],
        };
      }
      return null;
    } catch (err) {
      console.error('Boardlife BGG ID Extraction Error:', err);
      return null;
    }
  },

  /**
   * 게임명 또는 BGG ID로 보드라이프 게임 ID를 자동 검색합니다 (베스트 에포트).
   * @param {string} gameName 게임 이름 (한글 또는 영문)
   * @param {string} [englishName] 영문 게임 이름
   * @param {string} [targetBggId] BGG ID (검증용)
   * @returns {Promise<string|null>} 발견된 Boardlife ID 또는 null
   */
  async getBoardlifeIdFromGameName(gameName, englishName = '', targetBggId = '') {
    const searchTerms = [gameName, englishName].filter(Boolean);
    if (searchTerms.length === 0) return null;

    for (const term of searchTerms) {
      try {
        const query = encodeURIComponent(term.trim());
        const devPath = `/boardlife/bbs_list.php?tb=boardgame_strategy&search_mode=ok&search_word=${query}`;
        const prodUrl = `https://boardlife.co.kr/bbs_list.php?tb=boardgame_strategy&search_mode=ok&search_word=${query}`;

        const htmlText = await proxyFetchHtml(devPath, prodUrl);
        if (!htmlText || htmlText.includes('Cloudflare') || htmlText.includes('Attention Required')) {
          continue;
        }

        // 보드라이프 게임 상세 페이지 링크 (/game/숫자) 매칭
        const gameIdMatches = [...htmlText.matchAll(/\/game\/(\d+)/gi)];
        if (gameIdMatches.length === 0) continue;

        // 고유한 Boardlife ID 목록 추출
        const candidateIds = [...new Set(gameIdMatches.map(m => m[1]))];

        // targetBggId가 있으면 candidate들을 순회하여 BGG ID 매칭 확인
        if (targetBggId) {
          for (const candidateId of candidateIds.slice(0, 5)) { // 최대 5개 상위 후보 확인
            const bggInfo = await this.getBggIdFromBoardlife(candidateId);
            if (bggInfo && bggInfo.bggId === String(targetBggId)) {
              return candidateId;
            }
          }
        }

        // targetBggId 매칭이 안되었거나 없으면 첫 번째 검색 결과 반환
        if (candidateIds.length > 0) {
          return candidateIds[0];
        }
      } catch (err) {
        console.warn(`Boardlife ID search failed for term "${term}":`, err);
      }
    }

    return null;
  }
};

