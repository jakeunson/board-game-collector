/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useContext, useMemo } from 'react';
import { useGames } from './GameContext';

const FilterContext = createContext();

export function FilterProvider({ children }) {
  const { gameCollection, isAdmin } = useGames();
  const [filters, setFilters] = useState({ search: '', players: '', difficulty: '', category: '', showBaseOnly: false });
  const [viewMode, setViewMode] = useState('grid');

  const allCategories = useMemo(() => {
    return Array.from(new Set(
      gameCollection.flatMap(g => g.category ? g.category.split(',').map(c => c.trim()) : [])
    )).sort();
  }, [gameCollection]);

  const filteredCollection = useMemo(() => {
    const filtered = gameCollection.filter(game => {
      // 비관리자이면서 비공개 처리된 게임은 목록에서 완전히 제외
      if (!isAdmin && game.isHidden) {
        return false;
      }
      
      if (filters.search && !game.name.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      if (filters.players) {
        const p = parseInt(filters.players);
        const min = parseInt(game.minPlayers || 0);
        const max = parseInt(game.maxPlayers || 99);
        if (p < min || p > max) return false;
      }
      if (filters.difficulty) {
        const w = parseFloat(game.weight || 0);
        if (filters.difficulty === '1' && w > 2.0) return false;
        if (filters.difficulty === '2' && (w <= 2.0 || w > 3.0)) return false;
        if (filters.difficulty === '3' && (w <= 3.0 || w > 4.0)) return false;
        if (filters.difficulty === '4' && w <= 4.0) return false;
      }
      if (filters.category && (!game.category || !game.category.includes(filters.category))) return false;
      
      // 기본판만 보기 필터
      if (filters.showBaseOnly && game.type === 'expansion') {
        return false;
      }

      return true;
    });

    // 1. 기본판 및 독립 게임 정렬 (이름순)
    const baseAndStandalone = filtered
      .filter(g => g.type !== 'expansion' || !g.parentGameId)
      .sort((a, b) => a.name.localeCompare(b.name));

    const finalSorted = [];

    // 2. 확장판 끼워 넣기 (출시년도 오름차순)
    baseAndStandalone.forEach(base => {
      finalSorted.push(base);
      
      const expansions = filtered
        .filter(g => g.type === 'expansion' && g.parentGameId === base.id)
        .sort((a, b) => {
          const yearA = parseInt(a.year || 0);
          const yearB = parseInt(b.year || 0);
          return yearA - yearB;
        });
        
      finalSorted.push(...expansions);
    });

    return finalSorted;
  }, [gameCollection, filters]);

  const hasActiveFilters = useMemo(() => {
    return !!(filters.search || filters.players || filters.difficulty || filters.category || filters.showBaseOnly);
  }, [filters]);

  const resetFilters = () => {
    setFilters({ search: '', players: '', difficulty: '', category: '', showBaseOnly: false });
  };

  const updateFilter = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  return (
    <FilterContext.Provider value={{
      filters,
      setFilters,
      updateFilter,
      viewMode,
      setViewMode,
      filteredCollection,
      allCategories,
      hasActiveFilters,
      resetFilters
    }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
}
