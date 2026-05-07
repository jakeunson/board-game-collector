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
  }
};
