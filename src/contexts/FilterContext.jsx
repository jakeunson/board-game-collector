import React, { createContext, useState, useContext, useMemo } from 'react';
import { useGames } from './GameContext';

const FilterContext = createContext();

export function FilterProvider({ children }) {
  const { gameCollection } = useGames();
  const [filters, setFilters] = useState({ search: '', players: '', difficulty: '', category: '' });
  const [viewMode, setViewMode] = useState('grid');

  const allCategories = useMemo(() => {
    return Array.from(new Set(
      gameCollection.flatMap(g => g.category ? g.category.split(',').map(c => c.trim()) : [])
    )).sort();
  }, [gameCollection]);

  const filteredCollection = useMemo(() => {
    return gameCollection
      .filter(game => {
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
        return true;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [gameCollection, filters]);

  const hasActiveFilters = useMemo(() => {
    return !!(filters.search || filters.players || filters.difficulty || filters.category);
  }, [filters]);

  const resetFilters = () => {
    setFilters({ search: '', players: '', difficulty: '', category: '' });
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
