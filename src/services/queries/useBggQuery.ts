import { useQuery } from '@tanstack/react-query';
import { bggService } from '../../utils/bggService';
import { BggGameDetails, BggSearchResult } from '../../types/game';

/**
 * BGG 게임 검색 쿼리 훅 (TanStack Query)
 * 동일한 검색어에 대해 5분간 캐싱하여 중복 API 요청 방지
 */
export function useBggSearchQuery(query: string) {
  return useQuery<BggSearchResult[]>({
    queryKey: ['bggSearch', query],
    queryFn: () => bggService.searchGames(query),
    enabled: Boolean(query.trim()),
    staleTime: 1000 * 60 * 5, // 5분
    gcTime: 1000 * 60 * 30, // 30분
  });
}

/**
 * BGG 게임 상세 정보 쿼리 훅 (TanStack Query)
 * 동일한 BGG ID에 대해 30분간 캐싱
 */
export function useBggDetailQuery(bggId: string, type: string = 'boardgame') {
  return useQuery<BggGameDetails | null>({
    queryKey: ['bggDetail', bggId, type],
    queryFn: () => bggService.getGameDetails(bggId, type),
    enabled: Boolean(bggId),
    staleTime: 1000 * 60 * 30, // 30분
    gcTime: 1000 * 60 * 60, // 1시간
  });
}
