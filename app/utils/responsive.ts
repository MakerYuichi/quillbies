// Responsive utility for handling different screen sizes
import { Dimensions, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Device type detection
export const isTablet = () => {
  const aspectRatio = SCREEN_HEIGHT / SCREEN_WIDTH;
  // Tablets typically have aspect ratios closer to 4:3 or 16:10
  // Phones are usually 16:9 or taller
  return Math.min(SCREEN_WIDTH, SCREEN_HEIGHT) >= 600;
};

export const isLandscape = () => SCREEN_WIDTH > SCREEN_HEIGHT;

// Get responsive dimensions
export const getResponsiveDimensions = () => {
  const tablet = isTablet();
  const landscape = isLandscape();
  
  return {
    isTablet: tablet,
    isLandscape: landscape,
    screenWidth: SCREEN_WIDTH,
    screenHeight: SCREEN_HEIGHT,
  };
};

// Responsive width with max constraints for tablets
export const responsiveWidth = (percentage: number, maxWidth?: number): number => {
  const width = SCREEN_WIDTH * (percentage / 100);
  
  if (isTablet() && maxWidth) {
    return Math.min(width, maxWidth);
  }
  
  return width;
};

// Responsive height with max constraints for tablets
export const responsiveHeight = (percentage: number, maxHeight?: number): number => {
  const height = SCREEN_HEIGHT * (percentage / 100);
  
  if (isTablet() && maxHeight) {
    return Math.min(height, maxHeight);
  }
  
  return height;
};

// Responsive font size
export const responsiveFontSize = (size: number): number => {
  const tablet = isTablet();
  
  // On tablets, increase font size slightly but not proportionally
  if (tablet) {
    return size * 1.2; // 20% larger on tablets
  }
  
  return size;
};

// Responsive spacing
export const responsiveSpacing = (size: number): number => {
  const tablet = isTablet();
  
  // On tablets, increase spacing slightly
  if (tablet) {
    return size * 1.3; // 30% more spacing on tablets
  }
  
  return size;
};

// Get container width with max constraint
export const getContainerWidth = (percentage: number = 90): number => {
  const tablet = isTablet();
  
  if (tablet) {
    // On tablets, limit container width to 600px max
    return Math.min(SCREEN_WIDTH * (percentage / 100), 600);
  }
  
  return SCREEN_WIDTH * (percentage / 100);
};

// Get modal width with appropriate sizing
export const getModalWidth = (): number => {
  const tablet = isTablet();
  
  if (tablet) {
    // On tablets, modals should be smaller relative to screen
    return Math.min(SCREEN_WIDTH * 0.7, 500);
  }
  
  return SCREEN_WIDTH * 0.9;
};

// Get card width for grid layouts
export const getCardWidth = (columns: number = 2): number => {
  const tablet = isTablet();
  const containerWidth = getContainerWidth();
  const spacing = responsiveSpacing(16);
  
  // Adjust columns for tablets
  const actualColumns = tablet ? Math.max(columns, 3) : columns;
  
  return (containerWidth - (spacing * (actualColumns + 1))) / actualColumns;
};

// Get number of columns based on screen size
export const getGridColumns = (defaultColumns: number = 2): number => {
  const tablet = isTablet();
  const landscape = isLandscape();
  
  if (tablet && landscape) {
    return defaultColumns + 2; // 2 more columns in tablet landscape
  } else if (tablet) {
    return defaultColumns + 1; // 1 more column in tablet portrait
  }
  
  return defaultColumns;
};

// Responsive padding
export const getResponsivePadding = () => {
  const tablet = isTablet();
  
  return {
    small: tablet ? 12 : 8,
    medium: tablet ? 20 : 16,
    large: tablet ? 32 : 24,
    xlarge: tablet ? 48 : 32,
  };
};

// Responsive margins
export const getResponsiveMargins = () => {
  const tablet = isTablet();
  
  return {
    small: tablet ? 12 : 8,
    medium: tablet ? 20 : 16,
    large: tablet ? 32 : 24,
    xlarge: tablet ? 48 : 32,
  };
};

// Get safe content width (centered on large screens)
export const getSafeContentWidth = (): number => {
  const tablet = isTablet();
  
  if (tablet) {
    // Center content with max width on tablets
    return Math.min(SCREEN_WIDTH, 800);
  }
  
  return SCREEN_WIDTH;
};

// Responsive icon size
export const getIconSize = (baseSize: number): number => {
  const tablet = isTablet();
  
  if (tablet) {
    return baseSize * 1.3; // 30% larger on tablets
  }
  
  return baseSize;
};

// Responsive button height
export const getButtonHeight = (): number => {
  const tablet = isTablet();
  
  return tablet ? 56 : 48;
};

// Check if device is in split-screen mode
export const isSplitScreen = (): boolean => {
  // Approximate detection: if width is unusually small for a tablet
  if (isTablet()) {
    return SCREEN_WIDTH < 500;
  }
  return false;
};

// Get layout mode
export type LayoutMode = 'phone-portrait' | 'phone-landscape' | 'tablet-portrait' | 'tablet-landscape';

export const getLayoutMode = (): LayoutMode => {
  const tablet = isTablet();
  const landscape = isLandscape();
  
  if (tablet && landscape) return 'tablet-landscape';
  if (tablet) return 'tablet-portrait';
  if (landscape) return 'phone-landscape';
  return 'phone-portrait';
};

// Responsive styles helper
export const createResponsiveStyle = <T extends Record<string, any>>(
  phoneStyle: T,
  tabletStyle?: Partial<T>
): T => {
  if (isTablet() && tabletStyle) {
    return { ...phoneStyle, ...tabletStyle };
  }
  return phoneStyle;
};

// Export dimensions for backward compatibility
export { SCREEN_WIDTH, SCREEN_HEIGHT };
