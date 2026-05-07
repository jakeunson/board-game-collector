import React, { useState } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { bggService } from '../../utils/bggService';
import { BGG_MAPPING } from '../../data/bggMapping';
import { X, Play, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

const sleep = ms => new Promise(r => setTimeout(r, ms));

/**
 * BGG 데이터 일괄 보강 도구
 * - 이미지나 상세 정보가 없는 게임들을 대상으로 BGG에서 데이터를 가져와 업데이트합니다.
 * - BGG ID가 저장되어 있거나, BGG_MAPPING에 정의된 게임을 우선 처리합니다.
 */
export default function BggEnricher({ onDone }) {
  const [log, setLog] = useState([]);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [stats, setStats] = useState({ success: 0, failed: 0, total: 0 });

  const addLog = msg => setLog(prev => [...prev.slice(-100), msg]);

  const needsImage = g => {
    const img = g.image || '';
    return !img || img.includes('boardlife.co.kr') || img.includes('no-image');
  };

  const run = async () => {
    setRunning(true);
    addLog('Firebase에서 게임 목록 로딩 중...');

    try {
      const snap = await getDocs(collection(db, 'games'));
      const allGames = snap.docs.map(d => ({ docId: d.id, ...d.data() }));

      // 보강 대상 필터링: BGG ID가 이미 있거나, 이름 매핑이 존재하는 게임 중 이미지가 부실한 것
      const toEnrich = allGames.filter(g =>
        needsImage(g) && (g.bggId || BGG_MAPPING[g.name])
      );

      if (toEnrich.length === 0) {
        addLog('보강할 대상 게임이 없습니다.');
        setRunning(false);
        return;
      }

      addLog(`이미지/정보 보강 대상: ${toEnrich.length}개 발견`);

      let success = 0, failed = 0;
      setStats({ success: 0, failed: 0, total: toEnrich.length });

      for (let i = 0; i < toEnrich.length; i++) {
        const game = toEnrich[i];
        const bggId = game.bggId || BGG_MAPPING[game.name];

        addLog(`[${i + 1}/${toEnrich.length}] ${game.name} (ID: ${bggId}) 처리 중...`);

        try {
          const data = await bggService.getGameDetails(bggId, game.type === 'expansion' ? 'boardgameexpansion' : 'boardgame');

          if (!data || !data.image) {
            addLog(`  ✗ 데이터를 찾을 수 없거나 이미지가 없습니다.`);
            failed++;
          } else {
            // 필드가 비어있는 경우만 업데이트하거나 BGG 최신 정보로 덮어씀
            const update = {
              image: data.image,
              thumbnail: data.thumbnail || data.image,
              bggId: data.bggId,
              // 기존에 없는 정보만 보강
              ...(!game.year && data.year && { year: data.year }),
              ...(!game.minPlayers && data.minPlayers && { minPlayers: data.minPlayers }),
              ...(!game.maxPlayers && data.maxPlayers && { maxPlayers: data.maxPlayers }),
              ...(!game.playingTime && data.playingTime && { playingTime: data.playingTime }),
              ...(!game.rating && data.rating && { rating: data.rating }),
              ...(!game.weight && data.weight && { weight: data.weight }),
              ...(!game.description && data.description && { description: data.description }),
              ...(!game.category && data.categories && { category: data.categories.join(', ') }),
              ...(!game.mechanisms && data.mechanisms && { mechanisms: data.mechanisms.join(', ') }),
            };

            await updateDoc(doc(db, 'games', game.docId), update);
            addLog(`  ✓ 업데이트 완료`);
            success++;
          }
        } catch (e) {
          addLog(`  ✗ 오류 발생: ${e.message}`);
          failed++;
        }

        setStats({ success, failed, total: toEnrich.length });

        // API 레이트 리밋 방지를 위해 지연 시간 추가
        await sleep(1200);

        // 10개마다 조금 더 길게 휴식
        if ((i + 1) % 10 === 0 && i < toEnrich.length - 1) {
          addLog(`--- API 부하 방지를 위해 3초간 대기합니다 ---`);
          await sleep(3000);
        }
      }

      addLog(`\n✅ 일괄 작업 완료! (성공: ${success}, 실패: ${failed})`);
    } catch (err) {
      addLog(`\n❌ 치명적 오류: ${err.message}`);
    } finally {
      setRunning(false);
      setDone(true);
    }
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
      }}
    >
      <div
        className="glass animate-slide-up"
        style={{
          width: '100%', maxWidth: '640px', maxHeight: '85vh', borderRadius: '24px',
          display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid var(--border-medium)'
        }}
      >
        {/* 헤더 */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '8px', background: 'var(--accent-glow)', borderRadius: '12px' }}>
              <Loader2 className={running ? "animate-spin" : ""} size={20} style={{ color: 'var(--accent-primary)' }} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '800' }}>BGG 데이터 일괄 보강</h2>
              <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>이미지/정보가 부족한 게임 자동 수집</p>
            </div>
          </div>
          <button onClick={onDone} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: '4px' }}>
            <X size={24} />
          </button>
        </div>

        {/* 대시보드 / 통계 */}
        <div style={{ padding: '20px 24px', background: 'rgba(255,255,255,0.02)', display: 'flex', gap: '20px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
              <span style={{ fontWeight: '600' }}>진행 상태</span>
              <span style={{ color: 'var(--text-tertiary)' }}>{stats.success + stats.failed} / {stats.total}</span>
            </div>
            <div style={{ height: '8px', background: 'var(--bg-app)', borderRadius: '4px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%', background: 'var(--accent-primary)', borderRadius: '4px',
                  width: `${stats.total > 0 ? ((stats.success + stats.failed) / stats.total) * 100 : 0}%`,
                  transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontWeight: '700' }}>성공</div>
              <div style={{ fontSize: '16px', fontWeight: '800', color: '#4ade80' }}>{stats.success}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontWeight: '700' }}>실패</div>
              <div style={{ fontSize: '16px', fontWeight: '800', color: '#f87171' }}>{stats.failed}</div>
            </div>
          </div>
        </div>

        {/* 로그 창 */}
        <div style={{ flex: 1, padding: '16px 24px', overflowY: 'auto', background: 'rgba(0,0,0,0.2)', fontFamily: 'monospace', fontSize: '12px' }}>
          {log.length === 0 ? (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', gap: '12px' }}>
              <AlertCircle size={32} opacity={0.5} />
              <p>수집을 시작하면 로그가 여기에 표시됩니다.</p>
            </div>
          ) : (
            log.map((line, idx) => (
              <div
                key={idx}
                style={{
                  padding: '2px 0',
                  color: line.includes('✓') ? '#4ade80' : line.includes('✗') ? '#f87171' : line.includes('✅') ? '#00d4ff' : 'inherit',
                  borderLeft: line.startsWith(' ') ? '1px solid rgba(255,255,255,0.1)' : 'none',
                  paddingLeft: line.startsWith(' ') ? '12px' : '0',
                  marginLeft: line.startsWith(' ') ? '4px' : '0'
                }}
              >
                {line}
              </div>
            ))
          )}
        </div>

        {/* 푸터 버튼 */}
        <div style={{ padding: '20px 24px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          {!running && !done && (
            <button
              onClick={run}
              className="btn-primary"
              style={{ padding: '10px 24px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '700' }}
            >
              <Play size={16} fill="currentColor" /> 수집 시작
            </button>
          )}
          {done && (
            <button
              onClick={onDone}
              className="btn-primary"
              style={{ padding: '10px 24px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '700' }}
            >
              <CheckCircle2 size={16} /> 작업 완료
            </button>
          ) || (
            <button onClick={onDone} className="btn-ghost" style={{ padding: '10px 24px' }}>
              {running ? '중지 및 닫기' : '닫기'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
