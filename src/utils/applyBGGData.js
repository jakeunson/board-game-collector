import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyDMtnw__VjeaWM9UOxGzV12qdwdrfmzb10',
  authDomain: 'boardgame-collector.firebaseapp.com',
  projectId: 'boardgame-collector',
  storageBucket: 'boardgame-collector.firebasestorage.app',
  messagingSenderId: '352579868603',
  appId: '1:352579868603:web:bf79b902e2418ea850169e'
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// BGG CDN image URLs (collected via browser agent from boardgamegeek.com)
const bggData = [
  {
    name: '세븐 원더스 대결', bggId: '173346',
    image: 'https://cf.geekdo-images.com/WzNs1mA_o22gDPhasFqwBQ__original/img/LGiPIuBp-RMNhJIBJoJj3EYFEQk=/0x0/filters:format(jpeg)/pic2576399.jpg',
    year: '2015', minPlayers: '2', maxPlayers: '2', playingTime: '30',
    rating: '8.1', weight: '2.23', category: 'Ancient, Card Game, City Building, Civilization, Economic',
    mechanics: 'Card Drafting, End Game Bonuses, Income, Set Collection, Tug of War',
    description: 'Science? Military? What will you draft to win this head-to-head version of 7 Wonders?'
  },
  {
    name: '푸에르토 리코', bggId: '3076',
    image: 'https://cf.geekdo-images.com/O_FbArHAMteGBtFsZmLDKA__original/img/MSaHbrfWMRFMlKFT7ZHCf9yDfbA=/0x0/filters:format(jpeg)/pic158548.jpg',
    year: '2002', minPlayers: '3', maxPlayers: '5', playingTime: '150',
    rating: '7.9', weight: '3.27', category: 'City Building, Economic, Farming',
    mechanics: 'End Game Bonuses, Market, Roles with Variable Privileges, Variable Phase Order',
    description: 'Ship goods, construct buildings, and choose roles that benefit you more than others.'
  },
  {
    name: '팬데믹', bggId: '30549',
    image: 'https://cf.geekdo-images.com/S3ybV1LAp-8oCLgD5qsTOQ__original/img/K3Y8BSAG6eDoJNWkO7GJj7vOdL4=/0x0/filters:format(jpeg)/pic1534148.jpg',
    year: '2008', minPlayers: '2', maxPlayers: '4', playingTime: '45',
    rating: '7.5', weight: '2.39', category: 'Medical',
    mechanics: 'Action Points, Cooperative Game, Hand Management, Point to Point Movement, Trading, Variable Player Powers',
    description: 'Your team of experts must prevent the world from succumbing to a viral pandemic.'
  },
  {
    name: '버건디의 성', bggId: '84876',
    image: 'https://cf.geekdo-images.com/Vs0j2-BKDX1cgtGkgeFZQQ__original/img/fPiQzYrJRGpUNtYE7XUePcmHKxs=/0x0/filters:format(jpeg)/pic1176894.jpg',
    year: '2011', minPlayers: '2', maxPlayers: '4', playingTime: '90',
    rating: '8.1', weight: '3.00', category: 'Dice, Economic, Medieval, Territory Building',
    mechanics: 'Dice Rolling, Market, Set Collection, Tile Placement, Turn Order: Progressive',
    description: 'Plan, trade, and build your Burgundian estate to prosperity and prominence.'
  },
  {
    name: '카탄의 개척자', bggId: '13',
    image: 'https://cf.geekdo-images.com/W3Bsga_uLP9kO91gZ7H8yw__original/img/M_3Vg1j2HoMjUcLvzmGgO-N8O-E=/0x0/filters:format(jpeg)/pic2419375.jpg',
    year: '1995', minPlayers: '3', maxPlayers: '4', playingTime: '120',
    rating: '7.1', weight: '2.29', category: 'Economic, Negotiation',
    mechanics: 'Dice Rolling, Hexagon Grid, Income, Modular Board, Network and Route Building, Trading',
    description: 'Collect and trade resources to build up the island of Catan in this modern classic.'
  },
  {
    name: '티켓 투 라이드', bggId: '9209',
    image: 'https://cf.geekdo-images.com/ZWJg0dCdrWHxVnc0eFXK8w__original/img/BKT0fdaFCFBKMVT5mHu3WLi0Aqo=/0x0/filters:format(jpeg)/pic38668.jpg',
    year: '2004', minPlayers: '2', maxPlayers: '5', playingTime: '60',
    rating: '7.4', weight: '1.83', category: 'Trains',
    mechanics: 'Card Drafting, Hand Management, Network and Route Building, Set Collection',
    description: 'Build your railroad tracks across North America to connect cities and complete tickets.'
  },
  {
    name: '카르카손', bggId: '822',
    image: 'https://cf.geekdo-images.com/okKf4BosEf_TlNjXhWCYpg__original/img/FQiGGmNV0B-gJOv6pLdPJOhkD4M=/0x0/filters:format(jpeg)/pic5400631.jpg',
    year: '2000', minPlayers: '2', maxPlayers: '5', playingTime: '45',
    rating: '7.4', weight: '1.90', category: 'Medieval, Territory Building',
    mechanics: 'Area Majority / Influence, Map Addition, Tile Placement',
    description: 'Shape the medieval French landscape, claiming cities, monasteries, roads, and farms.'
  },
  {
    name: '도미니언', bggId: '36218',
    image: 'https://cf.geekdo-images.com/j6iQpZ4XkemZP07HNCODBA__original/img/Iq1yVR5MNwm5-rBE8iq5ow-BLFA=/0x0/filters:format(jpeg)/pic394356.jpg',
    year: '2008', minPlayers: '2', maxPlayers: '4', playingTime: '30',
    rating: '7.6', weight: '2.35', category: 'Medieval',
    mechanics: 'Card Drafting, Deck Building, Hand Management, Variable Set-up',
    description: 'Acquire the most valuable lands by building your deck with treasure and power cards.'
  },
  {
    name: '석기시대', bggId: '34635',
    image: 'https://cf.geekdo-images.com/3M5a_e4pEFCCjSmCmMf1HA__original/img/SHJOqBHcXdT6Lp7sKKy3_7O7SM4=/0x0/filters:format(jpeg)/pic301285.jpg',
    year: '2008', minPlayers: '2', maxPlayers: '4', playingTime: '90',
    rating: '7.5', weight: '2.47', category: 'Prehistoric',
    mechanics: 'Dice Rolling, Income, Set Collection, Worker Placement',
    description: 'Prehistoric tribes struggle to survive and adapt. Which one will rise to the top?'
  },
  {
    name: '스몰 월드', bggId: '40692',
    image: 'https://cf.geekdo-images.com/aoPM07XzoceB-RydLh08zA__original/img/wM3FTuFbovVjxhFiABPWwBzWJE8=/0x0/filters:format(jpeg)/pic428828.jpg',
    year: '2009', minPlayers: '2', maxPlayers: '5', playingTime: '80',
    rating: '7.2', weight: '2.35', category: 'Fantasy, Fighting, Mythology, Territory Building',
    mechanics: 'Area Majority / Influence, Dice Rolling, Race, Variable Player Powers',
    description: 'Control one fantasy race after another to expand quickly throughout the land.'
  },
];

async function main() {
  console.log('Fetching all games from Firebase...');
  const snap = await getDocs(collection(db, 'games'));
  const allGames = snap.docs.map(d => ({ docId: d.id, ...d.data() }));

  let updated = 0;
  for (const data of bggData) {
    // Find matching game by name
    const match = allGames.find(g => g.name === data.name);
    if (!match) {
      console.log(`⚠ Not found in Firebase: ${data.name}`);
      continue;
    }

    const update = {
      image: data.image,
      thumbnail: data.image,
      bggId: data.bggId,
    };
    if (!match.year) update.year = data.year;
    if (!match.minPlayers) update.minPlayers = data.minPlayers;
    if (!match.maxPlayers) update.maxPlayers = data.maxPlayers;
    if (!match.playingTime) update.playingTime = data.playingTime;
    if (!match.rating) update.rating = data.rating;
    if (!match.weight) update.weight = data.weight;
    if (!match.category) update.category = data.category;
    if (!match.mechanics) update.mechanics = data.mechanics;
    if (!match.description) update.description = data.description;

    await updateDoc(doc(db, 'games', match.docId), update);
    console.log(`✓ Updated: ${data.name}`);
    updated++;
  }

  console.log(`\nDone! Updated ${updated} games.`);
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
