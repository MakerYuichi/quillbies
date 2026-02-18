// Complete shop items catalog with all plants, furniture, and themes

export interface ShopItem {
  id: string;
  name: string;
  category: 'plant' | 'furniture' | 'theme' | 'light';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  price: number; // Coin price (0 for gem-only items)
  gemPrice?: number; // Optional gem price
  assetPath: string;
  description: string;
  icon: string;
}

export const SHOP_ITEMS: ShopItem[] = [
  // ============================================
  // LIGHTS (existing items)
  // ============================================
  {
    id: 'fairy-lights',
    name: 'Fairy Lights',
    category: 'light',
    rarity: 'common',
    price: 0, // Free default
    assetPath: 'assets/rooms/fairy-lights.png',
    description: 'Warm and cozy fairy lights',
    icon: '✨'
  },
  {
    id: 'lamp',
    name: 'Desk Lamp',
    category: 'light',
    rarity: 'common',
    price: 0, // Free default
    assetPath: 'assets/rooms/lamp.png',
    description: 'Classic desk lamp',
    icon: '💡'
  },
  {
    id: 'colored-fairy-lights',
    name: 'Colored Fairy Lights',
    category: 'light',
    rarity: 'rare',
    price: 300,
    gemPrice: 15,
    assetPath: 'assets/shop/fairy-lights/colored.png',
    description: 'Vibrant colored fairy lights',
    icon: '🌈'
  },

  // ============================================
  // PLANTS - COMMON (Coins Only)
  // ============================================
  {
    id: 'plant',
    name: 'Basic Plant',
    category: 'plant',
    rarity: 'common',
    price: 0, // Free default
    assetPath: 'assets/rooms/plant.png',
    description: 'Simple green plant',
    icon: '🌱'
  },
  {
    id: 'basil',
    name: 'Basil Plant',
    category: 'plant',
    rarity: 'common',
    price: 50,
    assetPath: 'assets/shop/common/plants/basil.png',
    description: 'Fresh basil for your room',
    icon: '🌿'
  },
  {
    id: 'spider',
    name: 'Spider Plant',
    category: 'plant',
    rarity: 'common',
    price: 75,
    assetPath: 'assets/shop/common/plants/spider.png',
    description: 'Easy-care spider plant',
    icon: '🕷️'
  },
  {
    id: 'fern',
    name: 'Fern',
    category: 'plant',
    rarity: 'common',
    price: 100,
    assetPath: 'assets/shop/common/plants/fern.png',
    description: 'Lush green fern',
    icon: '🌿'
  },
  {
    id: 'aloe-vera',
    name: 'Aloe Vera',
    category: 'plant',
    rarity: 'common',
    price: 80,
    assetPath: 'assets/shop/common/plants/aloe-vera.png',
    description: 'Healing aloe vera plant',
    icon: '🌵'
  },
  {
    id: 'succulent-plant',
    name: 'Succulent Plant',
    category: 'plant',
    rarity: 'common',
    price: 60,
    assetPath: 'assets/shop/common/plants/succulent-plant.png',
    description: 'Cute succulent',
    icon: '🌱'
  },
  {
    id: 'money',
    name: 'Money Plant',
    category: 'plant',
    rarity: 'common',
    price: 90,
    assetPath: 'assets/shop/common/plants/money.png',
    description: 'Brings good fortune',
    icon: '💰'
  },
  {
    id: 'peace-lily',
    name: 'Peace Lily',
    category: 'plant',
    rarity: 'common',
    price: 100,
    assetPath: 'assets/shop/common/plants/peace-lily.png',
    description: 'Elegant peace lily',
    icon: '🌸'
  },
  {
    id: 'snake',
    name: 'Snake Plant',
    category: 'plant',
    rarity: 'common',
    price: 85,
    assetPath: 'assets/shop/common/plants/snake.png',
    description: 'Hardy snake plant',
    icon: '🐍'
  },

  // ============================================
  // PLANTS - RARE (Coins or Gems)
  // ============================================
  {
    id: 'blossom',
    name: 'Cherry Blossom',
    category: 'plant',
    rarity: 'rare',
    price: 400,
    gemPrice: 20,
    assetPath: 'assets/shop/rare/plants/blossom.png',
    description: 'Beautiful cherry blossom',
    icon: '🌸'
  },
  {
    id: 'indoor-tree',
    name: 'Indoor Tree',
    category: 'plant',
    rarity: 'rare',
    price: 500,
    gemPrice: 25,
    assetPath: 'assets/shop/rare/plants/indoor-tree.png',
    description: 'Majestic indoor tree',
    icon: '🌳'
  },
  {
    id: 'bamboo',
    name: 'Bamboo',
    category: 'plant',
    rarity: 'rare',
    price: 350,
    gemPrice: 18,
    assetPath: 'assets/shop/rare/plants/bamboo.png',
    description: 'Lucky bamboo plant',
    icon: '🎋'
  },

  // ============================================
  // PLANTS - EPIC (Gems Only)
  // ============================================
  {
    id: 'swiss-cheese-plant',
    name: 'Swiss Cheese Plant',
    category: 'plant',
    rarity: 'epic',
    price: 0,
    gemPrice: 35,
    assetPath: 'assets/shop/epic/plants/swiss-cheese-plant.png',
    description: 'Trendy monstera',
    icon: '🧀'
  },
  {
    id: 'sunflower',
    name: 'Sunflower',
    category: 'plant',
    rarity: 'epic',
    price: 0,
    gemPrice: 40,
    assetPath: 'assets/shop/epic/plants/sunflower.png',
    description: 'Bright sunflower',
    icon: '🌻'
  },
  {
    id: 'rose',
    name: 'Rose',
    category: 'plant',
    rarity: 'epic',
    price: 0,
    gemPrice: 45,
    assetPath: 'assets/shop/epic/plants/rose.png',
    description: 'Classic rose plant',
    icon: '🌹'
  },
  {
    id: 'orchid',
    name: 'Orchid',
    category: 'plant',
    rarity: 'epic',
    price: 0,
    gemPrice: 50,
    assetPath: 'assets/shop/epic/plants/orchid.png',
    description: 'Exotic orchid',
    icon: '🌺'
  },
  {
    id: 'lavender',
    name: 'Lavender',
    category: 'plant',
    rarity: 'epic',
    price: 0,
    gemPrice: 38,
    assetPath: 'assets/shop/epic/plants/lavender.png',
    description: 'Calming lavender',
    icon: '💜'
  },
  {
    id: 'fiddle-leaf',
    name: 'Fiddle Leaf Fig',
    category: 'plant',
    rarity: 'epic',
    price: 0,
    gemPrice: 48,
    assetPath: 'assets/shop/epic/plants/fiddle-leaf.png',
    description: 'Statement fiddle leaf',
    icon: '🌿'
  },
  {
    id: 'tulip',
    name: 'Tulip',
    category: 'plant',
    rarity: 'epic',
    price: 0,
    gemPrice: 42,
    assetPath: 'assets/shop/epic/plants/tulip.png',
    description: 'Colorful tulip',
    icon: '🌷'
  },

  // ============================================
  // FURNITURE - COMMON (Coins Only)
  // ============================================
  {
    id: 'chair',
    name: 'Chair',
    category: 'furniture',
    rarity: 'common',
    price: 200,
    assetPath: 'assets/shop/common/furniture/chair.png',
    description: 'Simple wooden chair',
    icon: '🪑'
  },
  {
    id: 'small-bookshelf',
    name: 'Small Bookshelf',
    category: 'furniture',
    rarity: 'common',
    price: 250,
    assetPath: 'assets/shop/common/furniture/small-bookshelf.png',
    description: 'Compact bookshelf',
    icon: '📚'
  },

  // ============================================
  // FURNITURE - RARE (Coins or Gems)
  // ============================================
  {
    id: 'comfy-sofa',
    name: 'Comfy Sofa',
    category: 'furniture',
    rarity: 'rare',
    price: 600,
    gemPrice: 30,
    assetPath: 'assets/shop/rare/furniture/comfy-sofa.png',
    description: 'Cozy sofa for relaxing',
    icon: '🛋️'
  },
  {
    id: 'canvas-art',
    name: 'Canvas Art',
    category: 'furniture',
    rarity: 'rare',
    price: 400,
    gemPrice: 20,
    assetPath: 'assets/shop/rare/furniture/canvas-art.png',
    description: 'Modern canvas artwork',
    icon: '🎨'
  },
  {
    id: 'gaming-setup',
    name: 'Gaming Setup',
    category: 'furniture',
    rarity: 'rare',
    price: 700,
    gemPrice: 35,
    assetPath: 'assets/shop/rare/furniture/gaming-setup.png',
    description: 'Complete gaming station',
    icon: '🖥️'
  },

  // ============================================
  // FURNITURE - EPIC (Gems Only)
  // ============================================
  {
    id: 'gaming-redecor',
    name: 'Gaming Room Redecor',
    category: 'furniture',
    rarity: 'epic',
    price: 0,
    gemPrice: 80,
    assetPath: 'assets/shop/epic/furniture/gaming-redecor.png',
    description: 'Complete gaming room makeover',
    icon: '🎮'
  },
  {
    id: 'library-redecor',
    name: 'Library Redecor',
    category: 'furniture',
    rarity: 'epic',
    price: 0,
    gemPrice: 85,
    assetPath: 'assets/shop/epic/furniture/library-redecor.png',
    description: 'Scholarly library setup',
    icon: '📖'
  },
  {
    id: 'home-redecor',
    name: 'Home Redecor',
    category: 'furniture',
    rarity: 'epic',
    price: 0,
    gemPrice: 75,
    assetPath: 'assets/shop/epic/furniture/home-redecor.png',
    description: 'Cozy home aesthetic',
    icon: '🏠'
  },
  {
    id: 'throne-chair',
    name: 'Throne Chair',
    category: 'furniture',
    rarity: 'epic',
    price: 0,
    gemPrice: 60,
    assetPath: 'assets/shop/epic/furniture/throne-chair.png',
    description: 'Royal throne chair',
    icon: '👑'
  },

  // ============================================
  // THEMES - RARE (Gems Only)
  // ============================================
  {
    id: 'library',
    name: 'Library Theme',
    category: 'theme',
    rarity: 'rare',
    price: 0,
    gemPrice: 50,
    assetPath: 'assets/shop/rare/theme/library.png',
    description: 'Classic library ambiance',
    icon: '📚'
  },
  {
    id: 'night',
    name: 'Night Theme',
    category: 'theme',
    rarity: 'rare',
    price: 0,
    gemPrice: 50,
    assetPath: 'assets/shop/rare/theme/night.png',
    description: 'Peaceful night setting',
    icon: '🌃'
  },

  // ============================================
  // THEMES - EPIC (Gems Only)
  // ============================================
  {
    id: 'castle',
    name: 'Castle Theme',
    category: 'theme',
    rarity: 'epic',
    price: 0,
    gemPrice: 100,
    assetPath: 'assets/shop/epic/themes/castle.png',
    description: 'Medieval castle atmosphere',
    icon: '🏰'
  },
  {
    id: 'space',
    name: 'Space Theme',
    category: 'theme',
    rarity: 'epic',
    price: 0,
    gemPrice: 100,
    assetPath: 'assets/shop/epic/themes/space.png',
    description: 'Cosmic space adventure',
    icon: '🚀'
  },
  {
    id: 'cherry-blossom',
    name: 'Cherry Blossom Theme',
    category: 'theme',
    rarity: 'epic',
    price: 0,
    gemPrice: 100,
    assetPath: 'assets/shop/epic/themes/cherry-blossom.png',
    description: 'Serene cherry blossom garden',
    icon: '🌸'
  },

  // ============================================
  // THEMES - LEGENDARY (Gems Only)
  // ============================================
  {
    id: 'galaxy',
    name: 'Galaxy Theme',
    category: 'theme',
    rarity: 'legendary',
    price: 0,
    gemPrice: 150,
    assetPath: 'assets/shop/legendary/themes/galaxy.png',
    description: 'Stunning galaxy vista',
    icon: '🌌'
  },
  {
    id: 'japanese-zen',
    name: 'Japanese Zen Theme',
    category: 'theme',
    rarity: 'legendary',
    price: 0,
    gemPrice: 150,
    assetPath: 'assets/shop/legendary/themes/japanese-zen.png',
    description: 'Tranquil zen garden',
    icon: '🏯'
  },
  {
    id: 'ocean',
    name: 'Ocean Theme',
    category: 'theme',
    rarity: 'legendary',
    price: 0,
    gemPrice: 150,
    assetPath: 'assets/shop/legendary/themes/ocean.png',
    description: 'Underwater paradise',
    icon: '🌊'
  },
];

// Helper functions
export const getItemsByCategory = (category: string) => {
  return SHOP_ITEMS.filter(item => item.category === category);
};

export const getItemsByRarity = (rarity: string) => {
  return SHOP_ITEMS.filter(item => item.rarity === rarity);
};

export const getItemById = (id: string) => {
  return SHOP_ITEMS.find(item => item.id === id);
};

export const getRarityColor = (rarity: string): [string, string] => {
  switch (rarity) {
    case 'common':
      return ['#CD7F32', '#8B4513']; // Bronze
    case 'rare':
      return ['#42A5F5', '#1565C0']; // Blue
    case 'epic':
      return ['#AB47BC', '#6A1B9A']; // Purple
    case 'legendary':
      return ['#FFD700', '#FF8C00']; // Gold
    default:
      return ['#9E9E9E', '#616161']; // Gray
  }
};

export const getRarityLabel = (rarity: string): string => {
  return rarity.charAt(0).toUpperCase() + rarity.slice(1);
};
