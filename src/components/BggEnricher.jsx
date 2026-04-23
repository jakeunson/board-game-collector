import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

// Known BGG IDs for Korean games (name → bggId)
const BGG_IDS = {
  '안드로이드: 넷러너': '124742',
  '사건의 재구성': '261523',
  '사건의 재구성: 느와르': '305855',
  '사건의 재구성: 레드뷰에 오신 걸 환영합니다': '341318',
  '디텍티브: 모던 크라임': '223321',
  '아컴 호러: 카드 게임': '161061',
  '아컴 호러: 카드 게임 – 던위치의 유산': '202462',
  '아컴 호러: 카드 게임 – 돌아온 광신도의 밤': '246648',
  '아컴 호러: 카드 게임 - 시간을 초월한 음모': '308138',
  '아컴 호러: 카드게임 - 돌아온 던위치의 유산': '241015',
  '글룸헤이븐: 사자의 턱': '291457',
  '캔버스': '295616',
  '캔버스: 리플렉션': '352515',
  '스페이스 크루': '284083',
  '스페이스 크루: 9번째 행성을 찾아서': '284083',
  '포뮬라 D': '37111',
  '포뮬라 D: 서킷 1': '72993',
  '포뮬라 D: 서킷 2': '83419',
  '포뮬라 D: 서킷 3': '127942',
  '포뮬라 D: 서킷 4': '127943',
  '도미니언: 바다': '40834',
  '도미니언: 번영': '65020',
  '도미니언: 길드를 위하여': '128664',
  '도미니언: 암흑의 시대': '116440',
  '도미니언: 장막 뒤의 사람들': '40841',
  '카르카손: 확장 1 - 여관과 대성당': '2591',
  '카르카손: 확장 2 - 상인과 건축가': '27833',
  '카르카손: 확장 3 - 공주와 용': '28011',
  '카르카손: 확장 4 - 타워': '44455',
  '카르카손: 확장 5 - 수도원과 성주': '25118',
  '카르카손: 확장 8 - 다리와 성바자르': '85694',
  '티켓 투 라이드: 유럽': '14996',
  '티켓 투 라이드: USA 1910': '37806',
  '석기시대: 확장': '66910',
  '스몰 월드: 귀부인': '123540',
  '스몰 월드: 설화와 전설': '100658',
  '스몰 월드 언더그라운드': '116139',
  '상트페테르부르크': '9217',
  '상트 페테르부르크: 새로운 사회와 향연': '152452',
  '파워 그리드': '2651',
  '파워 그리드: 새로운 발전소 카드': '82527',
  '카탄: 항해사': '325',
  '카탄: 도시와 기사': '327',
  '팬데믹: 벼랑 끝에서': '56986',
  '팬데믹 레거시 시즌 0': '314040',
  '시즌스': '131991',
  '시즌스: 마법에 걸린 왕국': '160477',
  '촐킨: 마야의 달력': '126163',
  '테라 미스티카': '120677',
  '빌리지': '104006',
  '브뤼헤': '136888',
  '로스트 시티': '50',
  '로스트 시티 (Lost Cities)': '50',
  '라스베가스': '117959',
  '러브 레터': '129622',
  '클루': '1294',
  '이스케이프: 사원의 저주': '113294',
  '잠보': '8239',
  '잠보 확장': '24961',
  '와사비!': '38465',
  '플래시 포인트: 화재 구조': '100901',
  '왕좌의 게임 (2판)': '103343',
  '로스트 레거시': '151747',
  '타케노코': '70919',
  '룸 25': '127991',
  '포비든 아일랜드': '65244',
  '라 보카': '135680',
  '이봐, 그건 내 물고기야!': '8203',
  '스노우 테일즈': '40586',
  '어센션': '69789',
  '어센션: 신들의 귀환': '95861',
  '어센션: 폭풍의 서막': '107006',
  '나이트폴': '83307',
  '나이트폴: 계엄령': '109483',
  '나이트폴: 블러드 인 더 선': '133135',
  '선더스톤': '53953',
  '선더스톤: 파멸의 전조': '66790',
  '선더스톤: 용의 첨탑': '87236',
  '화이트채플에서 온 편지': '59959',
  '서바이브: 아틀란티스 섬으로부터의 탈출!': '2653',
  '아그리콜라': '31260',
  '안드로이드: 넷러너 - 다가오는 무언가': '130132',
  '안드로이드: 넷러너 - 사이버 엑소더스': '140333',
  '안드로이드: 넷러너 - 쌓여진 단서들': '139230',
  '안드로이드: 넷러너 - 인성의 그늘': '148491',
  '안드로이드: 넷러너 - 미래 경쟁력': '143945',
  '안드로이드 : 넷러너 - 창조와 통제': '149632',
  '고려': '245644',
  '패치스토리': '269673',
  '스플렌더': '148228',
  '레지스탕스: 아발론': '128882',
  '코드네임': '178900',
  '패치워크': '163412',
  '카멜 업': '153938',
  '할리갈리': '1127',
  '할리갈리 (Halli Galli)': '1127',
  '루미큐브': '811',
  '루미큐브 (Rummikub)': '811',
  '다빈치 코드': '6320',
  '다빈치 코드 (Da Vinci Code)': '6320',
  '보난자': '11',
  '보난자 (Bohnanza)': '11',
  '잭스님트': '432',
  '태양신 라 (Ra)': '12',
  '로보 77 (Lobo 77)': '36211',
  '젠가': '2452',
  '젠가 (Jenga)': '2452',
  '쿼리도': '624',
  '블로커스': '2453',
  '우노': '2223',
  '좀비 사이드: 흑사병': '176189',
  '고스트 스토리즈': '37046',
  '고스트 스토리즈: 검은 비밀': '67017',
  '고스트 스토리즈: 하얀달': '56476',
  '티츄': '215',
  '7 원더스': '68448',
  '7 원더스: 리더스': '89241',
  '7 원더스: 시티즈': '111661',
  '7 원더스 : 원더팩': '185399',
  '7 원더스: 대결': '173346',
  '언락 1': '213460',
  '언락 2': '235683',
  '언락 3': '249442',
  '언락 4': '261085',
  '언락!': '213460',
  '언락! 2': '235683',
  '서스펙트 게임: 리로드': '361712',
  '서스펙트 게임: 클로즈드 서클 미스터리': '304680',
  '디텍티브: 모던 크라임 - 시즌 1': '269595',
};

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function fetchBGGData(bggId) {
  // BGG JSON API — supports browser CORS, no proxy needed
  const res = await fetch(
    `https://api.geekdo.com/api/geekitems?objecttype=thing&subtype=boardgame&objectid=${bggId}&ajax=1&nosession=1`,
    { headers: { 'Accept': 'application/json' } }
  );
  if (!res.ok) return null;
  const json = await res.json();
  const item = json?.item;
  if (!item) return null;

  const image = item.images?.original || item.images?.large || item.images?.medium || null;
  const year = item.yearpublished ? String(item.yearpublished) : null;
  const minP = item.minplayers ? String(item.minplayers) : null;
  const maxP = item.maxplayers ? String(item.maxplayers) : null;
  const time = item.maxplaytime ? String(item.maxplaytime) : (item.playingtime ? String(item.playingtime) : null);
  const stats = item.stats || {};
  const rating = stats.average ? parseFloat(stats.average).toFixed(1) : null;
  const weight = stats.avgweight ? parseFloat(stats.avgweight).toFixed(2) : null;
  const description = item.description
    ? item.description.replace(/<[^>]+>/g, '').replace(/&#10;/g, ' ').trim().slice(0, 500)
    : null;
  const cats = (item.links?.boardgamecategory || []).map(l => l.name).slice(0, 4).join(', ') || null;
  const mechs = (item.links?.boardgamemechanic || []).map(l => l.name).slice(0, 5).join(', ') || null;

  return {
    bggId: String(bggId),
    image,
    thumbnail: item.images?.thumb || image,
    year, minPlayers: minP, maxPlayers: maxP, playingTime: time,
    rating: rating && rating !== '0.0' ? rating : null,
    weight: weight && weight !== '0.00' ? weight : null,
    description, category: cats, mechanics: mechs,
  };
}

function needsImage(g) {
  const img = g.image || '';
  return !img || img.includes('/thumb.jpg') || img.includes('boardlife.co.kr/game/') || img.includes('boardlife.co.kr/data/boardgame');
}

export default function BggEnricher({ onDone }) {
  const [log, setLog] = useState([]);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [stats, setStats] = useState({ success: 0, failed: 0, total: 0 });

  const addLog = msg => setLog(prev => [...prev.slice(-60), msg]);

  const run = async () => {
    setRunning(true);
    addLog('Firebase에서 게임 목록 로딩 중...');
    const snap = await getDocs(collection(db, 'games'));
    const allGames = snap.docs.map(d => ({ docId: d.id, ...d.data() }));
    const toEnrich = allGames.filter(g => needsImage(g) && BGG_IDS[g.name]);
    addLog(`이미지 없는 게임: ${toEnrich.length}개 (BGG ID 보유)`);

    let success = 0, failed = 0;
    setStats({ success: 0, failed: 0, total: toEnrich.length });

    for (let i = 0; i < toEnrich.length; i++) {
      const game = toEnrich[i];
      const bggId = BGG_IDS[game.name] || game.bggId;
      addLog(`[${i + 1}/${toEnrich.length}] ${game.name} (BGG: ${bggId})`);

      try {
        const data = await fetchBGGData(bggId);
        await sleep(1500);

        if (!data || !data.image) {
          addLog(`  ✗ 이미지 없음`);
          failed++;
        } else {
          const update = { image: data.image, thumbnail: data.thumbnail || data.image, bggId: data.bggId };
          if (!game.year && data.year) update.year = data.year;
          if (!game.minPlayers && data.minPlayers) update.minPlayers = data.minPlayers;
          if (!game.maxPlayers && data.maxPlayers) update.maxPlayers = data.maxPlayers;
          if (!game.playingTime && data.playingTime) update.playingTime = data.playingTime;
          if (!game.rating && data.rating) update.rating = data.rating;
          if (!game.weight && data.weight) update.weight = data.weight;
          if (!game.description && data.description) update.description = data.description;
          if (!game.category && data.category) update.category = data.category;
          if (!game.mechanics && data.mechanics) update.mechanics = data.mechanics;
          await updateDoc(doc(db, 'games', game.docId), update);
          addLog(`  ✓ 업데이트 완료`);
          success++;
        }
      } catch (e) {
        addLog(`  ✗ 오류: ${e.message}`);
        failed++;
      }
      setStats({ success, failed, total: toEnrich.length });

      if ((i + 1) % 10 === 0) {
        addLog(`--- 잠시 대기 중 (${i + 1}/${toEnrich.length}) ---`);
        await sleep(3000);
      }
    }

    addLog(`\n✅ 완료! ✓ ${success}개 업데이트, ✗ ${failed}개 실패`);
    setRunning(false);
    setDone(true);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        background: '#1a1a2e', color: '#e0e0e0', borderRadius: '12px',
        width: '640px', maxHeight: '80vh', display: 'flex', flexDirection: 'column',
        padding: '24px', fontFamily: 'monospace', fontSize: '12px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ margin: 0, color: '#00d4ff', fontSize: '16px' }}>🎲 BGG 데이터 수집</h2>
          {done && (
            <button onClick={onDone} style={{ background: '#005a9e', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 16px', cursor: 'pointer' }}>
              완료 → 앱으로
            </button>
          )}
        </div>

        {stats.total > 0 && (
          <div style={{ marginBottom: '12px', display: 'flex', gap: '16px', fontSize: '13px' }}>
            <span style={{ color: '#4ade80' }}>✓ {stats.success}</span>
            <span style={{ color: '#f87171' }}>✗ {stats.failed}</span>
            <span style={{ color: '#94a3b8' }}>/ {stats.total}</span>
            <div style={{ flex: 1, height: '6px', background: '#333', borderRadius: '3px', alignSelf: 'center' }}>
              <div style={{ height: '100%', background: '#005a9e', borderRadius: '3px', width: `${((stats.success + stats.failed) / stats.total) * 100}%`, transition: 'width 0.3s' }} />
            </div>
          </div>
        )}

        <div style={{ flex: 1, overflowY: 'auto', background: '#0f0f1a', borderRadius: '8px', padding: '12px', lineHeight: '1.6' }}>
          {log.map((l, i) => (
            <div key={i} style={{ color: l.includes('✓') ? '#4ade80' : l.includes('✗') ? '#f87171' : l.includes('---') ? '#f59e0b' : '#e0e0e0' }}>
              {l}
            </div>
          ))}
          {running && <div style={{ color: '#00d4ff' }}>▌</div>}
        </div>

        {!running && !done && (
          <button onClick={run} style={{
            marginTop: '16px', background: '#005a9e', color: '#fff',
            border: 'none', borderRadius: '8px', padding: '12px',
            fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit'
          }}>
            🚀 수집 시작 (CORS 프록시 사용)
          </button>
        )}
      </div>
    </div>
  );
}
