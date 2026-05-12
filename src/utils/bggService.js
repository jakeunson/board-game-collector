/**
 * BGG API Service Utility (XML API v2)
 */

import { isDev } from './envUtils.js';
import { proxyFetchHtml } from './proxyFetch.js';

export const bggService = {
  /**
   * XML API2를 사용하여 게임 상세 정보를 가져옵니다.
   * @param {string} bggId BGG ID
   * @returns {Promise<any>}
   */
  async getGameDetails(bggId, type = 'boardgame') {
    if (!bggId) return null;

    try {
      const token = (typeof import.meta.env !== 'undefined') 
        ? import.meta.env.VITE_BGG_TOKEN 
        : (typeof process !== 'undefined' ? process.env.VITE_BGG_TOKEN : null);
      
      const headers = {
        'Accept': 'application/xml',
        'User-Agent': 'BoardGameCollectorApp/2.0',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      };

      const devPath = `/xmlapi2/thing?id=${bggId}&stats=1`;
      const prodUrl = `https://boardgamegeek.com/xmlapi2/thing?id=${bggId}&stats=1`;

      // XML 텍스트를 가져오기 위해 proxyFetchHtml 사용
      const xmlText = await proxyFetchHtml(devPath, prodUrl, { headers });
      if (!xmlText || xmlText.includes('Unauthorized')) {
        console.error('BGG API 인증 실패 또는 데이터 없음');
        return null;
      }

      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
      const item = xmlDoc.getElementsByTagName('item')[0];
      if (!item) return null;

      // XML에서 값 추출을 위한 헬퍼
      const getVal = (parent, tagName) => parent.getElementsByTagName(tagName)[0]?.getAttribute('value') || '';
      const getText = (parent, tagName) => parent.getElementsByTagName(tagName)[0]?.textContent || '';

      // 통계 데이터 (평점, 난이도)
      const stats = item.getElementsByTagName('statistics')[0]?.getElementsByTagName('ratings')[0];
      const rating = stats?.getElementsByTagName('average')[0]?.getAttribute('value') || '';
      const weight = stats?.getElementsByTagName('averageweight')[0]?.getAttribute('value') || '';
      
      // 권장 인원 투표 결과
      const userPlayersPoll = Array.from(item.getElementsByTagName('poll'))
        .find(p => p.getAttribute('name') === 'suggested_numplayers');
      const bestPlayerCount = this.extractBestPlayerCountXml(userPlayersPoll);

      return {
        bggId: item.getAttribute('id') || '',
        name: getVal(item, 'name'), // BGG XML에서 name은 보통 첫 번째 항목이 primary
        englishName: getVal(item, 'name'),
        year: getVal(item, 'yearpublished'),
        description: getText(item, 'description'),
        image: getText(item, 'image'),
        thumbnail: getText(item, 'thumbnail'),
        minPlayers: getVal(item, 'minplayers'),
        maxPlayers: getVal(item, 'maxplayers'),
        playingTime: getVal(item, 'playingtime'),
        rating: rating ? parseFloat(rating).toFixed(1) : '',
        weight: weight ? parseFloat(weight).toFixed(2) : '',
        bestPlayerCount: bestPlayerCount || '',
        categories: Array.from(item.getElementsByTagName('link'))
          .filter(l => l.getAttribute('type') === 'boardgamecategory')
          .map(l => l.getAttribute('value')),
        mechanisms: Array.from(item.getElementsByTagName('link'))
          .filter(l => l.getAttribute('type') === 'boardgamemechanic')
          .map(l => l.getAttribute('value'))
      };
    } catch (err) {
      console.error('BGG API Detail Fetch Error:', err);
      return null;
    }
  },

  /**
   * XML Poll 데이터에서 최적 인원을 추출합니다.
   */
  extractBestPlayerCountXml(pollElement) {
    if (!pollElement) return '';
    try {
      const results = Array.from(pollElement.getElementsByTagName('results'));
      let best = { count: '', votes: -1 };
      
      results.forEach(res => {
        const numPlayers = res.getAttribute('numplayers');
        // 'Best'에 투표된 수 확인
        const resultNodes = Array.from(res.getElementsByTagName('result'));
        const bestNode = resultNodes.find(rn => rn.getAttribute('value') === 'Best');
        const bestVotes = parseInt(bestNode?.getAttribute('numvotes')) || 0;
        
        if (bestVotes > best.votes) {
          best = { count: numPlayers, votes: bestVotes };
        }
      });
      return best.count;
    } catch (e) {
      console.error('최적 인원 추출 실패:', e);
      return '';
    }
  }
};
