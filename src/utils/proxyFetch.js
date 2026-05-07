/**
 * CORS 프록시 통합 유틸리티
 * 개발환경: 직접 fetch (Vite 프록시 사용)
 * 배포환경: allorigins.win 프록시 자동 적용
 */

import { isDev } from './envUtils';

/**
 * 외부 URL을 환경에 맞게 fetch합니다.
 * @param {string} devPath  개발환경 경로 (Vite 프록시 경로, 예: '/boardlife/game/1234')
 * @param {string} prodUrl  배포환경 원본 URL
 * @param {RequestInit} [options] fetch 옵션
 * @returns {Promise<string>} HTML 또는 텍스트 응답
 */
export async function proxyFetchHtml(devPath, prodUrl, options = {}) {
  if (isDev) {
    const res = await fetch(devPath, options);
    if (!res.ok) throw new Error(`Fetch 실패 (${res.status}): ${devPath}`);
    return res.text();
  }

  // 배포환경: allorigins 프록시 → 실패 시 corsproxy.io 폴백
  try {
    const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(prodUrl)}`);
    if (!res.ok) throw new Error('allorigins 응답 실패');
    const data = await res.json();
    return data.contents;
  } catch {
    const res = await fetch(`https://corsproxy.io/?${encodeURIComponent(prodUrl)}`);
    if (!res.ok) throw new Error(`corsproxy 응답 실패 (${res.status})`);
    return res.text();
  }
}

/**
 * BGG JSON API를 환경에 맞게 fetch합니다.
 * @param {string} devPath  개발환경 경로 (Vite 프록시 경로, 예: '/bgg-api/api/...')
 * @param {string} prodUrl  배포환경 원본 URL
 * @param {RequestInit} [devOptions] 개발환경 fetch 옵션
 * @returns {Promise<any>} 파싱된 JSON 객체
 */
export async function proxyFetchJson(devPath, prodUrl, devOptions = {}) {
  if (isDev) {
    const res = await fetch(devPath, devOptions);
    if (!res.ok) throw new Error(`Fetch 실패 (${res.status}): ${devPath}`);
    return res.json();
  }

  const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(prodUrl)}`);
  if (!res.ok) throw new Error(`allorigins 응답 실패 (${res.status})`);
  const data = await res.json();
  return JSON.parse(data.contents);
}
