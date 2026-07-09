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
      let xmlText = await proxyFetchHtml(devPath, prodUrl, { headers });
      if (!xmlText || xmlText.includes('Unauthorized')) {
        console.error('BGG API 인증 실패 또는 데이터 없음');
        return null;
      }

      const parser = new DOMParser();
      let xmlDoc = parser.parseFromString(xmlText, 'text/xml');
      let item = xmlDoc.getElementsByTagName('item')[0];

      // BGG 202 큐 대기 상태 대응 (item이 없을 때 최대 2회 재시도)
      for (let attempt = 1; attempt <= 2 && !item; attempt++) {
        console.warn(`BGG XML 준비 중... 1.5초 후 재시도 (${attempt}/2)`);
        await new Promise(r => setTimeout(r, 1500));
        xmlText = await proxyFetchHtml(devPath, prodUrl, { headers });
        if (xmlText && !xmlText.includes('Unauthorized')) {
          xmlDoc = parser.parseFromString(xmlText, 'text/xml');
          item = xmlDoc.getElementsByTagName('item')[0];
        }
      }

      if (!item) return null;

      // XML에서 값 추출을 위한 헬퍼
      const getVal = (parent, tagName) => parent.getElementsByTagName(tagName)[0]?.getAttribute('value') || '';
      const getText = (parent, tagName) => parent.getElementsByTagName(tagName)[0]?.textContent || '';

      // 통계 데이터 (평점, 난이도)
      const stats = item.getElementsByTagName('statistics')[0]?.getElementsByTagName('ratings')[0];
      const rating = stats?.getElementsByTagName('average')[0]?.getAttribute('value') || '';
      const weight = stats?.getElementsByTagName('averageweight')[0]?.getAttribute('value') || '';
      
      // 권장 인원 투표 결과
      // 권장 인원 투표 결과
      const userPlayersPoll = Array.from(item.getElementsByTagName('poll'))
        .find(p => p.getAttribute('name') === 'suggested_numplayers');
      const bestPlayerCount = this.extractBestPlayerCountXml(userPlayersPoll);

      const nameNodes = Array.from(item.getElementsByTagName('name'));
      const primaryNode = nameNodes.find(n => n.getAttribute('type') === 'primary') || nameNodes[0];
      const englishName = primaryNode?.getAttribute('value') || getVal(item, 'name');
      
      // 한국어 이름(한글이 포함된 Alternate Name) 찾기
      const koreanNode = nameNodes.find(n => {
        const val = n.getAttribute('value') || '';
        return /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(val);
      });
      const koreanName = koreanNode?.getAttribute('value') || englishName;

      return {
        bggId: item.getAttribute('id') || '',
        name: koreanName,
        englishName: englishName,
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
   * BGG에서 게임명 또는 ID로 검색합니다.
   * @param {string} query 검색어
   * @returns {Promise<Array>} 검색 결과 목록
   */
  async searchGames(query) {
    if (!query) return [];
    try {
      const trimmed = query.trim();
      const token = (typeof import.meta.env !== 'undefined') 
        ? import.meta.env.VITE_BGG_TOKEN 
        : (typeof process !== 'undefined' ? process.env.VITE_BGG_TOKEN : null);
      
      const headers = {
        'Accept': 'application/xml',
        'User-Agent': 'BoardGameCollectorApp/2.0',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      };

      // 만약 숫자로만 구성된 ID라면 direct ID 조회도 시도
      let idResults = [];
      if (/^\d+$/.test(trimmed)) {
        try {
          const detail = await this.getGameDetails(trimmed, 'boardgame');
          if (detail) {
            idResults.push({
              bggId: detail.bggId,
              type: 'base',
              name: detail.name !== detail.englishName ? `${detail.name} (${detail.englishName})` : detail.name,
              year: detail.year
            });
          }
        } catch {
          // ID 직접 조회 실패 시 일반 검색 계속 진행
        }
      }

      const devPath = `/xmlapi2/search?query=${encodeURIComponent(trimmed)}&type=boardgame,boardgameexpansion`;
      const prodUrl = `https://boardgamegeek.com/xmlapi2/search?query=${encodeURIComponent(trimmed)}&type=boardgame,boardgameexpansion`;

      const xmlText = await proxyFetchHtml(devPath, prodUrl, { headers });
      if (!xmlText || xmlText.includes('Unauthorized')) {
        return idResults;
      }

      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
      const items = Array.from(xmlDoc.getElementsByTagName('item'));

      const searchResults = items.map(item => {
        const bggId = item.getAttribute('id') || '';
        const typeAttr = item.getAttribute('type') || 'boardgame';
        const type = typeAttr === 'boardgameexpansion' ? 'expansion' : 'base';
        
        const nameNode = item.getElementsByTagName('name')[0];
        const name = nameNode?.getAttribute('value') || 'Unknown';
        
        const yearNode = item.getElementsByTagName('yearpublished')[0];
        const year = yearNode?.getAttribute('value') || '';

        return { bggId, type, name, year };
      });

      // ID 검색 결과와 일반 검색 결과 병합 (중복 제거)
      const combined = [...idResults];
      searchResults.forEach(res => {
        if (!combined.some(c => c.bggId === res.bggId)) {
          combined.push(res);
        }
      });

      return combined.slice(0, 20); // 최대 20개까지 반환
    } catch (err) {
      console.error('BGG Search Error:', err);
      return [];
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
