import React from 'react';
import GameCard from './GameCard';
import GameListItem from './GameListItem';

export default function GameList({ viewMode, games, onGameSelect }) {
  if (viewMode === 'grid') {
    return (
      <div className="grid-layout animate-slide-up">
        {games.map(game => (
          <GameCard key={game.id} game={game} onClick={() => onGameSelect(game)} />
        ))}
      </div>
    );
  }

  return (
    <div className="list-layout animate-slide-up">
      {games.map(game => (
        <GameListItem key={game.id} game={game} onClick={() => onGameSelect(game)} />
      ))}
    </div>
  );
}
