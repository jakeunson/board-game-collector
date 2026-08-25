export interface BoardGame {
  id: string;
  name: string;
  englishName?: string;
  type: 'base' | 'expansion';
  parentGameId?: string;
  year?: string | number;
  bggId?: string;
  boardlifeId?: string;
  minPlayers?: number | string;
  maxPlayers?: number | string;
  playingTime?: number | string;
  bestPlayerCount?: string;
  weight?: number | string;
  rating?: number | string;
  category?: string;
  mechanisms?: string;
  theme?: string;
  description?: string;
  image?: string;
  thumbnail?: string;
  rulebookUrl?: string;
  youtubeUrl?: string;
  isRented?: boolean;
  isHidden?: boolean;
}

export interface RentalRequest {
  id: string;
  gameId: string;
  gameName: string;
  email: string;
  rentDate: string;
  returnDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'returned';
  requestedAt: string;
}

export interface FilterState {
  search: string;
  players: string;
  difficulty: string;
  category: string;
  showBaseOnly: boolean;
}

export interface BggSearchResult {
  bggId: string;
  type: 'base' | 'expansion';
  name: string;
  year?: string;
}

export interface BggGameDetails {
  bggId: string;
  name: string;
  englishName: string;
  year: string;
  description: string;
  image: string;
  thumbnail: string;
  minPlayers: string;
  maxPlayers: string;
  playingTime: string;
  rating: string;
  weight: string;
  bestPlayerCount: string;
  categories: string[];
  mechanisms: string[];
}
