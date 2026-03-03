// Responsive utility for handling different screen sizes
import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base dimensions (design reference - iPhone 14)
const BASE_WIDTH = 393;
const BASE_HEIGHT = 852;

// Device type detection
export const isTablet = () => {
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

// Scale size with min/max constraints to prevent extreme scaling
const scaleSize = (size: number, minScale: number = 0.85, maxScale: number = 1.15): number => {
  const scale = SCREEN_WIDTH / BASE_WIDTH;
  const constrainedScale = Math.max(minScale, Math.min(maxScale, scale));
  return Math.round(size * constrainedScale);
};

// Responsive width - scales based on design but with constraints
export const responsiveWidth = (baseWidth: number, minScale?: number, maxScale?: number): number => {
  if (isTablet()) {
    // Tablets use fixed scaling
    return Math.min(baseWidth * 1.2, baseWidth + 100);
  }
  return scaleSize(baseWidth, minScale, maxScale);
};

// Responsive height - scales based on design but with constraints
export const responsiveHeight = (baseHeight: number, minScale?: number, maxScale?: number): number => {
  if (isTablet()) {
    return Math.min(baseHeight * 1.2, baseHeight + 100);
  }
  const scale = SCREEN_HEIGHT / BASE_HEIGHT;
  const constrainedScale = Math.max(minScale || 0.85, Math.min(maxScale || 1.15, scale));
  return Math.round(baseHeight * constrainedScale);
};

// Responsive font size with proper constraints
export const responsiveFontSize = (baseSize: number): number => {
  if (isTablet()) {
    return baseSize * 1.2;
  }
  
  // Use tighter constraints for fonts to prevent readability issues
  const scale = SCREEN_WIDTH / BASE_WIDTH;
  const constrainedScale = Math.max(0.9, Math.min(1.1, scale));
  return Math.round(baseSize * constrainedScale * PixelRatio.getFontScale());
};

// Responsive spacing with constraints
export const responsiveSpacing = (baseSize: number): number => {
  if (isTablet()) {
    return baseSize * 1.3;
  }
  return scaleSize(baseSize, 0.9, 1.1);
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

// Responsive icon size with constraints
export const getIconSize = (baseSize: number): number => {
  if (isTablet()) {
    return baseSize * 1.3;
  }
  return scaleSize(baseSize, 0.9, 1.1);
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

// Helper to convert percentage-based width to responsive fixed width
export const wp = (percentage: number): number => {
  return responsiveWidth((BASE_WIDTH * percentage) / 100);
};

// Helper to convert percentage-based height to responsive fixed height
export const hp = (percentage: number): number => {
  return responsiveHeight((BASE_HEIGHT * percentage) / 100);
};

// Helper for font sizes - converts percentage to fixed size
export const fs = (percentage: number): number => {
  return responsiveFontSize((BASE_WIDTH * percentage) / 100);
};

// Helper for spacing - converts percentage to fixed spacing
export const sp = (percentage: number): number => {
  return responsiveSpacing((BASE_WIDTH * percentage) / 100);
};
