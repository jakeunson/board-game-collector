/**
 * 환경 감지 유틸리티
 * isDev 체크를 한 곳에서 관리합니다.
 */

export const isDev =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.startsWith('192.168.') ||
    window.location.hostname.startsWith('10.') ||
    window.location.hostname.endsWith('.local'));
