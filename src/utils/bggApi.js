const BASE_URL = '/xmlapi2';

/**
 * Searches for a board game by name and returns a list of matching games with their IDs.
 */
export async function searchGame(query) {
  try {
    const response = await fetch(`${BASE_URL}/search?query=${encodeURIComponent(query)}&type=boardgame`);
    const xmlText = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    
    const items = xmlDoc.getElementsByTagName('item');
    const results = [];
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const id = item.getAttribute('id');
      const name = item.getElementsByTagName('name')[0]?.getAttribute('value');
      const year = item.getElementsByTagName('yearpublished')[0]?.getAttribute('value');
      
      results.push({ id, name, year });
    }
    
    return results;
  } catch (error) {
    console.error('BGG Search Error:', error);
    return [];
  }
}

/**
 * Fetches detailed information for a specific board game ID.
 */
export async function getGameDetails(id) {
  try {
    const response = await fetch(`${BASE_URL}/thing?id=${id}&stats=1`);
    const xmlText = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    
    const item = xmlDoc.getElementsByTagName('item')[0];
    if (!item) return null;
    
    const getName = () => {
      const names = item.getElementsByTagName('name');
      for (let i = 0; i < names.length; i++) {
        if (names[i].getAttribute('type') === 'primary') return names[i].getAttribute('value');
      }
      return names[0]?.getAttribute('value');
    };

    const getStat = (tagName) => item.getElementsByTagName(tagName)[0]?.getAttribute('value');
    
    return {
      id: item.getAttribute('id'),
      name: getName(),
      image: item.getElementsByTagName('image')[0]?.textContent,
      thumbnail: item.getElementsByTagName('thumbnail')[0]?.textContent,
      description: item.getElementsByTagName('description')[0]?.textContent,
      year: getStat('yearpublished'),
      minPlayers: getStat('minplayers'),
      maxPlayers: getStat('maxplayers'),
      playingTime: getStat('playingtime'),
      rating: item.getElementsByTagName('average')[0]?.getAttribute('value'),
      weight: item.getElementsByTagName('averageweight')[0]?.getAttribute('value'),
    };
  } catch (error) {
    console.error('BGG Detail Error:', error);
    return null;
  }
}

/**
 * Generates external links for blogs and youtube.
 */
export function generateExternalLinks(gameName) {
  const query = encodeURIComponent(gameName);
  return {
    naverBlog: `https://search.naver.com/search.naver?where=blog&query=${query}+리뷰`,
    tistory: `https://www.google.com/search?q=site:tistory.com+${query}+리뷰`,
    youtubeRules: `https://www.youtube.com/results?search_query=${query}+플레이+규칙`,
    youtubeReview: `https://www.youtube.com/results?search_query=${query}+리뷰`
  };
}
