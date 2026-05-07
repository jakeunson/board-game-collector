import React from 'react';
import { Globe, ExternalLink, Search, Video } from 'lucide-react';

/**
 * 외부 링크 버튼 컴포넌트 (BGG, 보드라이프, 네이버, 유튜브)
 */
function LinkButton({ href, icon, label, color }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="external-link-btn"
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = color;
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = `0 4px 12px ${color}22`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border-subtle)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{ color }}>{icon}</div>
      {label}
    </a>
  );
}

/**
 * 게임 상세 외부 링크 섹션
 * BGG / 보드라이프 / 네이버 블로그 / 유튜브 룰 설명 링크를 표시합니다.
 */
export default function ExternalLinks({ game }) {
  return (
    <div>
      <h3 className="section-label">추가 정보 및 리뷰</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <LinkButton
          href={
            game.bggId
              ? `https://boardgamegeek.com/boardgame/${game.bggId}`
              : `https://boardgamegeek.com/search/boardgames?q=${encodeURIComponent(game.name)}`
          }
          icon={<Globe size={16} />}
          label="BoardGameGeek"
          color="#ff5100"
        />
        <LinkButton
          href={
            game.boardlifeId
              ? `https://boardlife.co.kr/game/${game.boardlifeId}`
              : `https://boardlife.co.kr/bbs_list.php?tb=boardgame_strategy&search_mode=ok&search_word=${encodeURIComponent(game.name)}`
          }
          icon={<ExternalLink size={16} />}
          label="BoardLife"
          color="#005a9e"
        />
        <LinkButton
          href={`https://search.naver.com/search.naver?where=post&query=${encodeURIComponent(game.name + ' 보드게임')}`}
          icon={<Search size={16} />}
          label="Naver Review"
          color="#10b981"
        />
        <LinkButton
          href={`https://www.youtube.com/results?search_query=${encodeURIComponent(game.name + ' 보드게임 룰 설명')}`}
          icon={<Video size={16} />}
          label="YouTube Tutorial"
          color="#ef4444"
        />
      </div>
    </div>
  );
}
