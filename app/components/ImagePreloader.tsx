import React, { useState, useEffect, createContext, useContext } from 'react';
import { View, Image, StyleSheet, ActivityIndicator, Text } from 'react-native';

// Create a context to share loading state across the app
export const ImageLoadingContext = createContext({ imagesLoaded: false });

// This component renders all critical images off-screen to keep them in memory
// Images rendered with opacity: 0 stay in memory and load instantly when needed
export default function ImagePreloader({ children }: { children: React.ReactNode }) {
  const [allLoaded, setAllLoaded] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);
  const [loadStartTime] = useState(Date.now());
  const totalImages = 37;

  useEffect(() => {
    // More aggressive adaptive timeout
    const checkTimeout = setInterval(() => {
      if (!allLoaded && loadedCount > 0) {
        const elapsed = Date.now() - loadStartTime;
        const loadingRate = loadedCount / (elapsed / 1000); // images per second
        
        // More aggressive conditions to proceed faster
        // 1. If we have at least 25 images (68%) loaded, proceed
        if (loadedCount >= 25) {
          console.log('[ImagePreloader] 68% loaded - proceeding with', loadedCount, 'of', totalImages, 'images');
          setAllLoaded(true);
        }
        // 2. If loading is slow (< 8 images/sec) after 2 seconds, proceed
        else if (elapsed > 2000 && loadingRate < 8) {
          console.log('[ImagePreloader] Slow loading detected - proceeding with', loadedCount, 'of', totalImages, 'images');
          console.log('[ImagePreloader] Loading rate:', loadingRate.toFixed(1), 'images/sec');
          setAllLoaded(true);
        }
        // 3. Maximum wait of 5 seconds (reduced from 10)
        else if (elapsed > 5000) {
          console.log('[ImagePreloader] Max timeout (5s) - proceeding with', loadedCount, 'of', totalImages, 'images');
          setAllLoaded(true);
        }
      }
    }, 300); // Check more frequently (every 300ms instead of 500ms)

    return () => clearInterval(checkTimeout);
  }, [allLoaded, loadedCount, loadStartTime]);

  const handleImageLoad = () => {
    setLoadedCount(prev => {
      const newCount = prev + 1;
      console.log('[ImagePreloader] Loaded', newCount, 'of', totalImages);
      if (newCount >= totalImages) {
        console.log('[ImagePreloader] All images loaded and ready');
        setAllLoaded(true);
      }
      return newCount;
    });
  };

  const handleImageError = (error: any) => {
    console.warn('[ImagePreloader] Image failed to load:', error);
    // Still count as loaded to prevent hanging
    setLoadedCount(prev => {
      const newCount = prev + 1;
      if (newCount >= totalImages) {
        setAllLoaded(true);
      }
      return newCount;
    });
  };

  return (
    <ImageLoadingContext.Provider value={{ imagesLoaded: allLoaded }}>
      {/* Render children (the app content) */}
      {children}
      
      {/* Loading overlay - covers entire screen until images are ready */}
      {!allLoaded && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FF9800" />
          <Text style={styles.loadingText}>Loading assets...</Text>
        </View>
      )}

      {/* Off-screen image preloader */}
      <View style={styles.container} pointerEvents="none">
        {/* Theme background */}
        <Image source={require('../../assets/backgrounds/theme.png')} style={styles.image} onLoad={handleImageLoad} onError={handleImageError} />
        
        {/* Room essentials */}
        <Image source={require('../../assets/rooms/walls.png')} style={styles.image} onLoad={handleImageLoad} onError={handleImageError} />
        <Image source={require('../../assets/rooms/floor.png')} style={styles.image} onLoad={handleImageLoad} onError={handleImageError} />
        
        {/* Hamster states */}
        <Image source={require('../../assets/hamsters/casual/idle-sit.png')} style={styles.image} onLoad={handleImageLoad} onError={handleImageError} />
        <Image source={require('../../assets/hamsters/casual/idle-sit-happy.png')} style={styles.image} onLoad={handleImageLoad} onError={handleImageError} />
        <Image source={require('../../assets/hamsters/casual/drinking.png')} style={styles.image} onLoad={handleImageLoad} onError={handleImageError} />
        <Image source={require('../../assets/hamsters/casual/eating-normal.png')} style={styles.image} onLoad={handleImageLoad} onError={handleImageError} />
        <Image source={require('../../assets/hamsters/casual/eating-small.png')} style={styles.image} onLoad={handleImageLoad} onError={handleImageError} />
        <Image source={require('../../assets/hamsters/casual/eating-large.png')} style={styles.image} onLoad={handleImageLoad} onError={handleImageError} />
        <Image source={require('../../assets/hamsters/casual/sleeping.png')} style={styles.image} onLoad={handleImageLoad} onError={handleImageError} />
        <Image source={require('../../assets/hamsters/casual/wake-up.png')} style={styles.image} onLoad={handleImageLoad} onError={handleImageError} />
        <Image source={require('../../assets/hamsters/casual/exercising.png')} style={styles.image} onLoad={handleImageLoad} onError={handleImageError} />
        <Image source={require('../../assets/hamsters/casual/jumping.gif')} style={styles.image} onLoad={handleImageLoad} onError={handleImageError} />
        <Image source={require('../../assets/hamsters/casual/studying.png')} style={styles.image} onLoad={handleImageLoad} onError={handleImageError} />
        <Image source={require('../../assets/hamsters/casual/focus.png')} style={styles.image} onLoad={handleImageLoad} onError={handleImageError} />
        <Image source={require('../../assets/hamsters/casual/sad.png')} style={styles.image} onLoad={handleImageLoad} onError={handleImageError} />
        <Image source={require('../../assets/hamsters/casual/coffee.png')} style={styles.image} onLoad={handleImageLoad} onError={handleImageError} />
        <Image source={require('../../assets/hamsters/casual/apples.png')} style={styles.image} onLoad={handleImageLoad} onError={handleImageError} />
        
        {/* Decorations */}
        <Image source={require('../../assets/backgrounds/bluebg.png')} style={styles.image} onLoad={handleImageLoad} onError={handleImageError} />
        <Image source={require('../../assets/hamsters/casual/photo-frame.png')} style={styles.image} onLoad={handleImageLoad} onError={handleImageError} />
        <Image source={require('../../assets/hamsters/photo-frame2.png')} style={styles.image} onLoad={handleImageLoad} onError={handleImageError} />
        <Image source={require('../../assets/rooms/lamp.png')} style={styles.image} onLoad={handleImageLoad} onError={handleImageError} />
        <Image source={require('../../assets/rooms/fairy-lights.png')} style={styles.image} onLoad={handleImageLoad} onError={handleImageError} />
        <Image source={require('../../assets/rooms/plant.png')} style={styles.image} onLoad={handleImageLoad} onError={handleImageError} />
        <Image source={require('../../assets/overall/qbies.png')} style={styles.image} onLoad={handleImageLoad} onError={handleImageError} />
        
        {/* Exercise environment */}
        <Image source={require('../../assets/exercise/sky.png')} style={styles.image} onLoad={handleImageLoad} onError={handleImageError} />
        <Image source={require('../../assets/exercise/grass.png')} style={styles.image} onLoad={handleImageLoad} onError={handleImageError} />
        
        {/* Shop decorations */}
        <Image source={require('../../assets/shop/fairy-lights/colored.png')} style={styles.image} onLoad={handleImageLoad} onError={handleImageError} />
        <Image source={require('../../assets/shop/common/plants/succulent-plant.png')} style={styles.image} onLoad={handleImageLoad} onError={handleImageError} />
        <Image source={require('../../assets/shop/epic/plants/swiss-cheese-plant.png')} style={styles.image} onLoad={handleImageLoad} onError={handleImageError} />
        
        {/* Mess variants */}
        <Image source={require('../../assets/rooms/mess/walls-messy1.png')} style={styles.image} onLoad={handleImageLoad} onError={handleImageError} />
        <Image source={require('../../assets/rooms/mess/walls-messy2.png')} style={styles.image} onLoad={handleImageLoad} onError={handleImageError} />
        <Image source={require('../../assets/rooms/mess/walls-messy3.png')} style={styles.image} onLoad={handleImageLoad} onError={handleImageError} />
        <Image source={require('../../assets/rooms/mess/floor-messy1.png')} style={styles.image} onLoad={handleImageLoad} onError={handleImageError} />
        <Image source={require('../../assets/rooms/mess/floor-messy2.png')} style={styles.image} onLoad={handleImageLoad} onError={handleImageError} />
        <Image source={require('../../assets/rooms/mess/floor-messy3.png')} style={styles.image} onLoad={handleImageLoad} onError={handleImageError} />
      </View>
    </ImageLoadingContext.Provider>
  );
}

// Hook to use the loading state in other components
export const useImageLoading = () => useContext(ImageLoadingContext);

const styles = StyleSheet.create({
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
  },
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 1,
    height: 1,
    opacity: 0,
    overflow: 'hidden',
    zIndex: -1,
  },
  image: {
    width: 1,
    height: 1,
  },
});
