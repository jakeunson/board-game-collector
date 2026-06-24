
import fetch from 'node-fetch';

async function testFetch(boardlifeId) {
  const targetUrl = `https://boardlife.co.kr/game/${boardlifeId}`;
  const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;
  
  console.log(`Fetching ${targetUrl} via allorigins...`);
  const response = await fetch(proxyUrl);
  const data = await response.json();
  const htmlText = data.contents;
  
  console.log(`HTML Length: ${htmlText.length}`);
  
  const bggMatch = htmlText.match(/boardgamegeek\.com\/(boardgame|boardgameexpansion|thing)\/(\d+)/i);
  if (bggMatch) {
    console.log(`Found BGG ID: ${bggMatch[2]} (${bggMatch[1]})`);
  } else {
    console.log('BGG ID not found in HTML');
    // Print some HTML to see if it's the right page
    console.log(htmlText.substring(0, 500));
  }
}

testFetch('1421'); // Ghost Stories: White Moon
