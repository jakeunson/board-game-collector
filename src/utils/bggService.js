/**
 * BGG API Service Utility (JSON API v2)
 * Uses the provided token for authorized requests.
 */

import { isDev } from './envUtils';
import { proxyFetchJson } from './proxyFetch';

const BASE_URL = isDev ? '/bgg-api' : 'https://api.geekdo.com';

export const bggService = {
  /**
   * Fetch game details using JSON API
   * @param {string} bggId BGG ID
   * @param {string} type 'boardgame' or 'boardgameexpansion'
   * @returns {Promise<any>}
   */
  async getGameDetails(bggId, type = 'boardgame') {
    if (!bggId) return null;

    try {
      const token = import.meta.env.VITE_BGG_TOKEN;
      const devHeaders = {
        'Accept': 'application/json',
        'User-Agent': 'BoardGameCollectorApp/2.0',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      };

      const devPath = `/bgg-api/api/geekitems?objecttype=thing&subtype=${type}&objectid=${bggId}&ajax=1&nosession=1`;
      const prodUrl = `https://api.geekdo.com/api/geekitems?objecttype=thing&subtype=${type}&objectid=${bggId}&ajax=1&nosession=1`;

      const data = await proxyFetchJson(devPath, prodUrl, { headers: devHeaders });
      if (!data) {
        console.warn(`BGG API 응답 없음: ${bggId}`);
        return null;
      }

      const item = data?.item;
      if (!item) return null;

      const rating = item.stats?.average ? parseFloat(item.stats.average).toFixed(1) : '';
      const weight = item.stats?.avgweight ? parseFloat(item.stats.avgweight).toFixed(2) : '';

      return {
        bggId: item.id || '',
        name: item.name || '',
        englishName: item.name || '',
        year: item.yearpublished || '',
        description: item.description || '',
        image: item.imageurl || '',
        thumbnail: item.thumburl || '',
        minPlayers: item.minplayers || '',
        maxPlayers: item.maxplayers || '',
        playingTime: item.playingtime || '',
        rating: rating,
        weight: weight,
        bestPlayerCount: this.extractBestPlayerCount(item.polls?.userplayers) || '',
        categories: item.links?.boardgamecategory?.map(c => c.name) || [],
        mechanisms: item.links?.boardgamemechanic?.map(m => m.name) || []
      };
    } catch (err) {
      console.error('BGG API Detail Fetch Error:', err);
      return null;
    }
  },

  extractBestPlayerCount(pollData) {
    if (!pollData) return '';
    try {
      let best = { count: '', votes: -1 };
      Object.entries(pollData).forEach(([count, data]) => {
        const bestVotes = parseInt(data.best) || 0;
        if (bestVotes > best.votes) {
          best = { count, votes: bestVotes };
        }
      });
      return best.count;
    } catch {
      return '';
    }
  }
};
