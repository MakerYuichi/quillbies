// Theme color palettes for UI elements
export const getThemeColors = (themeType?: string) => {
  if (!themeType) {
    return { 
      statusBar: 'transparent', 
      tabBar: '#FFFFFF', 
      tabBarActive: '#2196F3',
      background: '#F5F5F5',
      cardBackground: '#FFFFFF',
      textPrimary: '#000000',
      textSecondary: '#666666',
      buttonPrimary: '#2196F3',
      buttonText: '#FFFFFF',
      isDark: false,
    };
  }
  
  const themeColors: { [key: string]: { 
    statusBar: string; 
    tabBar: string; 
    tabBarActive: string;
    background: string;
    cardBackground: string;
    textPrimary: string;
    textSecondary: string;
    buttonPrimary: string;
    buttonText: string;
    isDark: boolean;
    accentColor?: string;
    accentBorder?: string;
  } } = {
    'library': { 
      statusBar: 'rgba(101, 67, 33, 0.9)', 
      tabBar: '#654321',
      tabBarActive: '#D2691E',
      background: '#F4E8D8',
      cardBackground: '#FFF8E7',
      textPrimary: '#2C1810',
      textSecondary: '#654321',
      buttonPrimary: '#8B4513',
      buttonText: '#FFFFFF',
      isDark: false,
      accentColor: '#D2B48C',
      accentBorder: '#C19A6B',
    },
    'night': { 
      statusBar: 'rgba(15, 23, 42, 0.95)', 
      tabBar: '#0f172a',
      tabBarActive: '#60a5fa',
      background: '#1e293b',
      cardBackground: '#334155',
      textPrimary: '#f8fafc',
      textSecondary: '#e2e8f0',
      buttonPrimary: '#3b82f6',
      buttonText: '#FFFFFF',
      isDark: true,
      accentColor: '#3b82f6',
      accentBorder: '#60a5fa',
    },
    'castle': { 
      statusBar: 'rgba(71, 85, 105, 0.9)', 
      tabBar: '#475569',
      tabBarActive: '#94a3b8',
      background: '#e2e8f0',
      cardBackground: '#f8fafc',
      textPrimary: '#1e293b',
      textSecondary: '#475569',
      buttonPrimary: '#64748b',
      buttonText: '#FFFFFF',
      isDark: false,
      accentColor: '#cbd5e1',
      accentBorder: '#94a3b8',
    },
    'space': { 
      statusBar: 'rgba(17, 24, 39, 0.95)', 
      tabBar: '#111827',
      tabBarActive: '#818cf8',
      background: '#1f2937',
      cardBackground: '#374151',
      textPrimary: '#f9fafb',
      textSecondary: '#e5e7eb',
      buttonPrimary: '#6366f1',
      buttonText: '#FFFFFF',
      isDark: true,
      accentColor: '#4c1d95',
      accentBorder: '#7c3aed',
    },
    'cherry-blossom': { 
      statusBar: 'rgba(252, 231, 243, 0.95)', 
      tabBar: '#fce7f3',
      tabBarActive: '#ec4899',
      background: '#fdf2f8',
      cardBackground: '#fce7f3',
      textPrimary: '#831843',
      textSecondary: '#9f1239',
      buttonPrimary: '#ec4899',
      buttonText: '#FFFFFF',
      isDark: false,
      accentColor: '#fbcfe8',
      accentBorder: '#f9a8d4',
    },
    'galaxy': { 
      statusBar: 'rgba(88, 28, 135, 0.95)', 
      tabBar: '#581c87',
      tabBarActive: '#c084fc',
      background: '#2e1065',
      cardBackground: '#4c1d95',
      textPrimary: '#faf5ff',
      textSecondary: '#f3e8ff',
      buttonPrimary: '#a855f7',
      buttonText: '#FFFFFF',
      isDark: true,
      accentColor: '#6b21a8',
      accentBorder: '#a855f7',
    },
    'japanese-zen': { 
      statusBar: 'rgba(220, 252, 231, 0.95)', 
      tabBar: '#dcfce7',
      tabBarActive: '#22c55e',
      background: '#f0fdf4',
      cardBackground: '#dcfce7',
      textPrimary: '#14532d',
      textSecondary: '#166534',
      buttonPrimary: '#16a34a',
      buttonText: '#FFFFFF',
      isDark: false,
      accentColor: '#bbf7d0',
      accentBorder: '#86efac',
    },
    'ocean': { 
      statusBar: 'rgba(224, 242, 254, 0.95)', 
      tabBar: '#e0f2fe',
      tabBarActive: '#0ea5e9',
      background: '#f0f9ff',
      cardBackground: '#e0f2fe',
      textPrimary: '#0c4a6e',
      textSecondary: '#075985',
      buttonPrimary: '#0284c7',
      buttonText: '#FFFFFF',
      isDark: false,
      accentColor: '#bae6fd',
      accentBorder: '#7dd3fc',
    },
  };
  
  return themeColors[themeType] || { 
    statusBar: 'transparent', 
    tabBar: '#FFFFFF', 
    tabBarActive: '#2196F3',
    background: '#F5F5F5',
    cardBackground: '#FFFFFF',
    textPrimary: '#000000',
    textSecondary: '#666666',
    buttonPrimary: '#2196F3',
    buttonText: '#FFFFFF',
    isDark: false,
  };
};

// Decorative elements for each theme
export const getThemeDecorations = (themeType?: string) => {
  if (!themeType) return [];
  
  const decorations: { [key: string]: Array<{ emoji: string; top: number; left: number; size: number }> } = {
    'ocean': [
      // Status bar area only (0-10% top)
      { emoji: '🐠', top: 2, left: 5, size: 18 },
      { emoji: '🐟', top: 3, left: 85, size: 16 },
      { emoji: '💧', top: 5, left: 15, size: 12 },
      { emoji: '🐡', top: 6, left: 75, size: 18 },
      { emoji: '💧', top: 8, left: 90, size: 12 },
      { emoji: '🐠', top: 4, left: 50, size: 16 },
      { emoji: '💧', top: 7, left: 35, size: 10 },
      { emoji: '🐟', top: 9, left: 60, size: 14 },
      // Scrollable content area (60-90% top)
      { emoji: '🐠', top: 62, left: 10, size: 20 },
      { emoji: '🐟', top: 65, left: 85, size: 18 },
      { emoji: '🐡', top: 70, left: 25, size: 22 },
      { emoji: '💧', top: 75, left: 70, size: 14 },
      { emoji: '🐠', top: 80, left: 50, size: 18 },
      { emoji: '🌿', top: 85, left: 15, size: 20 },
      { emoji: '🐟', top: 67, left: 55, size: 16 },
      { emoji: '💧', top: 72, left: 40, size: 12 },
      { emoji: '🐡', top: 77, left: 8, size: 20 },
      { emoji: '🐠', top: 83, left: 75, size: 18 },
      { emoji: '🌿', top: 88, left: 35, size: 18 },
      { emoji: '💧', top: 64, left: 90, size: 10 },
      // Tab bar area only (90-100% top)
      { emoji: '🐙', top: 91, left: 10, size: 22 },
      { emoji: '🐠', top: 92, left: 85, size: 18 },
      { emoji: '🌿', top: 94, left: 25, size: 24 },
      { emoji: '🪸', top: 95, left: 65, size: 22 },
      { emoji: '💧', top: 96, left: 45, size: 12 },
      { emoji: '🐟', top: 93, left: 55, size: 16 },
    ],
    'space': [
      // Status bar area only
      { emoji: '⭐', top: 2, left: 10, size: 14 },
      { emoji: '✨', top: 4, left: 80, size: 14 },
      { emoji: '🌟', top: 6, left: 25, size: 16 },
      { emoji: '🚀', top: 3, left: 92, size: 20 },
      { emoji: '⭐', top: 5, left: 50, size: 12 },
      { emoji: '✨', top: 8, left: 35, size: 12 },
      { emoji: '💫', top: 7, left: 65, size: 14 },
      // Scrollable content area
      { emoji: '⭐', top: 62, left: 15, size: 16 },
      { emoji: '✨', top: 68, left: 80, size: 16 },
      { emoji: '🌟', top: 73, left: 30, size: 18 },
      { emoji: '💫', top: 78, left: 65, size: 16 },
      { emoji: '🚀', top: 85, left: 45, size: 22 },
      { emoji: '⭐', top: 66, left: 55, size: 14 },
      { emoji: '✨', top: 71, left: 10, size: 14 },
      { emoji: '🌟', top: 76, left: 85, size: 16 },
      { emoji: '💫', top: 81, left: 20, size: 14 },
      { emoji: '⭐', top: 87, left: 70, size: 12 },
      { emoji: '✨', top: 64, left: 40, size: 12 },
      // Tab bar area only
      { emoji: '⭐', top: 91, left: 8, size: 14 },
      { emoji: '✨', top: 93, left: 88, size: 14 },
      { emoji: '🌟', top: 95, left: 30, size: 16 },
      { emoji: '💫', top: 97, left: 70, size: 14 },
      { emoji: '⭐', top: 94, left: 55, size: 12 },
    ],
    'galaxy': [
      // Status bar area only
      { emoji: '✨', top: 2, left: 8, size: 16 },
      { emoji: '🌟', top: 4, left: 85, size: 16 },
      { emoji: '💫', top: 6, left: 20, size: 18 },
      { emoji: '⭐', top: 8, left: 75, size: 14 },
      { emoji: '✨', top: 5, left: 45, size: 14 },
      { emoji: '🌟', top: 7, left: 60, size: 14 },
      { emoji: '💫', top: 3, left: 35, size: 16 },
      // Scrollable content area
      { emoji: '✨', top: 63, left: 12, size: 18 },
      { emoji: '🌟', top: 68, left: 82, size: 18 },
      { emoji: '💫', top: 74, left: 35, size: 20 },
      { emoji: '⭐', top: 80, left: 60, size: 16 },
      { emoji: '✨', top: 86, left: 20, size: 16 },
      { emoji: '🌟', top: 66, left: 50, size: 16 },
      { emoji: '💫', top: 71, left: 8, size: 18 },
      { emoji: '⭐', top: 77, left: 88, size: 14 },
      { emoji: '✨', top: 83, left: 45, size: 16 },
      { emoji: '🌟', top: 89, left: 70, size: 16 },
      { emoji: '💫', top: 64, left: 75, size: 16 },
      // Tab bar area only
      { emoji: '✨', top: 91, left: 10, size: 16 },
      { emoji: '🌟', top: 93, left: 82, size: 18 },
      { emoji: '💫', top: 95, left: 25, size: 18 },
      { emoji: '⭐', top: 97, left: 65, size: 14 },
      { emoji: '✨', top: 94, left: 50, size: 14 },
    ],
    'cherry-blossom': [
      // Status bar area only
      { emoji: '🌸', top: 2, left: 10, size: 20 },
      { emoji: '🌺', top: 5, left: 85, size: 18 },
      { emoji: '🦋', top: 7, left: 30, size: 22 },
      { emoji: '🌸', top: 4, left: 60, size: 18 },
      { emoji: '🌺', top: 8, left: 45, size: 16 },
      { emoji: '🦋', top: 3, left: 75, size: 20 },
      // Scrollable content area
      { emoji: '🌸', top: 64, left: 15, size: 22 },
      { emoji: '🌺', top: 70, left: 75, size: 20 },
      { emoji: '🦋', top: 76, left: 40, size: 24 },
      { emoji: '🌸', top: 82, left: 60, size: 20 },
      { emoji: '🌺', top: 88, left: 25, size: 18 },
      { emoji: '🦋', top: 67, left: 8, size: 22 },
      { emoji: '🌸', top: 73, left: 88, size: 20 },
      { emoji: '🌺', top: 79, left: 50, size: 18 },
      { emoji: '🦋', top: 85, left: 10, size: 22 },
      { emoji: '🌸', top: 62, left: 45, size: 18 },
      // Tab bar area only
      { emoji: '🌸', top: 92, left: 12, size: 22 },
      { emoji: '🌺', top: 94, left: 80, size: 20 },
      { emoji: '🦋', top: 96, left: 45, size: 24 },
      { emoji: '🌸', top: 93, left: 65, size: 18 },
    ],
    'japanese-zen': [
      // Status bar area only
      { emoji: '🎋', top: 2, left: 5, size: 22 },
      { emoji: '🍃', top: 5, left: 85, size: 16 },
      { emoji: '🎋', top: 7, left: 40, size: 20 },
      { emoji: '🍃', top: 4, left: 60, size: 14 },
      { emoji: '🎋', top: 8, left: 25, size: 18 },
      { emoji: '🍃', top: 3, left: 75, size: 14 },
      // Scrollable content area
      { emoji: '🎋', top: 65, left: 10, size: 24 },
      { emoji: '🍃', top: 71, left: 80, size: 18 },
      { emoji: '🎋', top: 77, left: 35, size: 22 },
      { emoji: '🍃', top: 83, left: 65, size: 16 },
      { emoji: '🎋', top: 88, left: 50, size: 20 },
      { emoji: '🍃', top: 68, left: 15, size: 16 },
      { emoji: '🎋', top: 74, left: 88, size: 22 },
      { emoji: '🍃', top: 80, left: 25, size: 16 },
      { emoji: '🎋', top: 86, left: 70, size: 20 },
      { emoji: '🍃', top: 63, left: 45, size: 14 },
      // Tab bar area only
      { emoji: '🍃', top: 92, left: 10, size: 18 },
      { emoji: '🎋', top: 94, left: 85, size: 22 },
      { emoji: '🍃', top: 96, left: 50, size: 16 },
      { emoji: '🎋', top: 93, left: 35, size: 20 },
    ],
    'castle': [
      // Status bar area only
      { emoji: '⚔️', top: 3, left: 10, size: 18 },
      { emoji: '🛡️', top: 5, left: 85, size: 20 },
      { emoji: '👑', top: 7, left: 45, size: 22 },
      { emoji: '⚔️', top: 4, left: 65, size: 16 },
      { emoji: '🛡️', top: 8, left: 25, size: 18 },
      { emoji: '👑', top: 2, left: 75, size: 20 },
      // Scrollable content area
      { emoji: '⚔️', top: 66, left: 15, size: 20 },
      { emoji: '🛡️', top: 72, left: 75, size: 22 },
      { emoji: '👑', top: 78, left: 40, size: 24 },
      { emoji: '⚔️', top: 84, left: 60, size: 18 },
      { emoji: '🛡️', top: 89, left: 25, size: 20 },
      { emoji: '👑', top: 69, left: 8, size: 22 },
      { emoji: '⚔️', top: 75, left: 88, size: 18 },
      { emoji: '🛡️', top: 81, left: 50, size: 20 },
      { emoji: '👑', top: 87, left: 10, size: 22 },
      { emoji: '⚔️', top: 63, left: 45, size: 16 },
      // Tab bar area only
      { emoji: '👑', top: 92, left: 10, size: 24 },
      { emoji: '⚔️', top: 94, left: 85, size: 18 },
      { emoji: '🛡️', top: 96, left: 50, size: 20 },
      { emoji: '👑', top: 93, left: 35, size: 22 },
    ],
    'library': [
      // Status bar area only
      { emoji: '📕', top: 2, left: 5, size: 20 },
      { emoji: '📗', top: 4, left: 85, size: 18 },
      { emoji: '📘', top: 6, left: 30, size: 20 },
      { emoji: '📙', top: 8, left: 70, size: 18 },
      { emoji: '📕', top: 5, left: 50, size: 18 },
      { emoji: '📗', top: 3, left: 60, size: 16 },
      { emoji: '📘', top: 7, left: 15, size: 18 },
      // Scrollable content area
      { emoji: '📕', top: 64, left: 12, size: 22 },
      { emoji: '📗', top: 69, left: 78, size: 20 },
      { emoji: '📘', top: 75, left: 35, size: 22 },
      { emoji: '📙', top: 81, left: 62, size: 20 },
      { emoji: '📚', top: 87, left: 25, size: 24 },
      { emoji: '📕', top: 67, left: 50, size: 20 },
      { emoji: '📗', top: 72, left: 8, size: 18 },
      { emoji: '📘', top: 78, left: 88, size: 20 },
      { emoji: '📙', top: 84, left: 45, size: 18 },
      { emoji: '📚', top: 62, left: 70, size: 22 },
      // Tab bar area only
      { emoji: '📚', top: 92, left: 10, size: 24 },
      { emoji: '📖', top: 94, left: 85, size: 20 },
      { emoji: '✒️', top: 96, left: 35, size: 16 },
      { emoji: '📜', top: 97, left: 65, size: 18 },
      { emoji: '📕', top: 93, left: 50, size: 18 },
    ],
    'night': [
      // Status bar area only
      { emoji: '🌙', top: 2, left: 85, size: 24 },
      { emoji: '⭐', top: 4, left: 10, size: 14 },
      { emoji: '✨', top: 6, left: 40, size: 12 },
      { emoji: '🌟', top: 8, left: 70, size: 16 },
      { emoji: '⭐', top: 5, left: 55, size: 12 },
      { emoji: '✨', top: 3, left: 25, size: 10 },
      { emoji: '🌟', top: 7, left: 90, size: 14 },
      // Scrollable content area
      { emoji: '🌙', top: 65, left: 75, size: 26 },
      { emoji: '⭐', top: 70, left: 15, size: 16 },
      { emoji: '✨', top: 76, left: 50, size: 14 },
      { emoji: '🌟', top: 82, left: 35, size: 18 },
      { emoji: '⭐', top: 88, left: 65, size: 14 },
      { emoji: '✨', top: 68, left: 8, size: 12 },
      { emoji: '🌟', top: 73, left: 88, size: 16 },
      { emoji: '⭐', top: 79, left: 25, size: 14 },
      { emoji: '✨', top: 85, left: 45, size: 12 },
      { emoji: '🌟', top: 63, left: 55, size: 14 },
      { emoji: '⭐', top: 67, left: 40, size: 12 },
      // Tab bar area only
      { emoji: '🌟', top: 92, left: 12, size: 16 },
      { emoji: '⭐', top: 94, left: 88, size: 14 },
      { emoji: '✨', top: 96, left: 50, size: 12 },
      { emoji: '🌟', top: 93, left: 35, size: 14 },
    ],
  };
  
  return decorations[themeType] || [];
};
