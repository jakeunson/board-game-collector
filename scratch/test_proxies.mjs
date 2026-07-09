import fetch from 'node-fetch';

async function testProxy(name, url) {
  try {
    console.log(`Testing ${name}: ${url}`);
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
      },
      timeout: 8000
    });
    console.log(`[${name}] Status:`, res.status);
    const text = await res.text();
    if (text.includes('Just a moment...') || text.includes('Attention Required!') || text.includes('Enable JavaScript and cookies')) {
      console.log(`[${name}] -> BLOCKED BY CLOUDFLARE`);
    } else {
      const titleMatch = text.match(/<title>(.*?)<\/title>/i);
      console.log(`[${name}] -> SUCCESS! Title:`, titleMatch ? titleMatch[1] : text.substring(0, 100));
    }
  } catch (e) {
    console.log(`[${name}] -> ERROR:`, e.message);
  }
}

async function run() {
  const target = 'https://boardlife.co.kr/game/3516';
  await testProxy('CodeTabs', `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(target)}`);
  await testProxy('ThingProxy', `https://thingproxy.freeboard.io/fetch/${target}`);
  await testProxy('CorsProxy.io', `https://corsproxy.io/?${encodeURIComponent(target)}`);
  await testProxy('AllOrigins', `https://api.allorigins.win/get?url=${encodeURIComponent(target)}`);
}

run();
