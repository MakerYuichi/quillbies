import { useState, useEffect } from 'react';
import { Image } from 'react-native';

interface ImagePreloaderHook {
  imagesLoaded: boolean;
  loadingProgress: number;
}

export const useImagePreloader = (imageUris: any[]): ImagePreloaderHook => {
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    if (imageUris.length === 0) {
      setImagesLoaded(true);
      setLoadingProgress(100);
      return;
    }

    let loadedCount = 0;
    const totalImages = imageUris.length;

    const preloadImage = (uri: any): Promise<void> => {
      return new Promise((resolve, reject) => {
        Image.prefetch(Image.resolveAssetSource(uri).uri)
          .then(() => {
            loadedCount++;
            setLoadingProgress((loadedCount / totalImages) * 100);
            resolve();
          })
          .catch((error) => {
            console.warn('Failed to preload image:', uri, error);
            loadedCount++; // Still count as "loaded" to prevent hanging
            setLoadingProgress((loadedCount / totalImages) * 100);
            resolve(); // Don't reject, just continue
          });
      });
    };

    const preloadAllImages = async () => {
      try {
        await Promise.all(imageUris.map(preloadImage));
        setImagesLoaded(true);
      } catch (error) {
        console.warn('Error preloading images:', error);
        setImagesLoaded(true); // Set as loaded even if some failed
      }
    };

    preloadAllImages();
  }, [imageUris]);

  return { imagesLoaded, loadingProgress };
};

// Hook specifically for room images
export const useRoomImagePreloader = (messPoints: number = 0): ImagePreloaderHook => {
  const roomImages = [
    // Background theme
    require('../../assets/backgrounds/theme.png'),
    
    // Wall images based on mess points
    require('../../assets/rooms/walls.png'),
    require('../../assets/rooms/mess/walls-messy1.png'),
    require('../../assets/rooms/mess/walls-messy2.png'),
    require('../../assets/rooms/mess/walls-messy3.png'),
    
    // Floor images based on mess points
    require('../../assets/rooms/floor.png'),
    require('../../assets/rooms/mess/floor-messy1.png'),
    require('../../assets/rooms/mess/floor-messy2.png'),
    require('../../assets/rooms/mess/floor-messy3.png'),
    
    // Decorative elements
    require('../../assets/backgrounds/bluebg.png'),
    require('../../assets/hamsters/casual/photo-frame.png'),
    require('../../assets/hamsters/photo-frame2.png'),
    require('../../assets/rooms/lamp.png'),
    require('../../assets/rooms/fairy-lights.png'),
    require('../../assets/rooms/plant.png'),
    require('../../assets/overall/qbies.png'),
    
    // Shop decoration images
    require('../../assets/shop/decoration/fairy-lights/colored.png'),
    require('../../assets/shop/decoration/plants/succulent-plant.png'),
    require('../../assets/shop/decoration/plants/swiss-cheese-plant.png'),
  ];

  return useImagePreloader(roomImages);
};

// Hook specifically for hamster character images
export const useHamsterImagePreloader = (selectedCharacter: string = 'casual'): ImagePreloaderHook => {
  const hamsterImages = [
    // Casual hamster images
    require('../../assets/hamsters/casual/idle-sit.png'),
    require('../../assets/hamsters/casual/idle-sit-happy.png'),
    require('../../assets/hamsters/casual/sleeping.png'),
    require('../../assets/hamsters/casual/wake-up.png'),
    require('../../assets/hamsters/casual/drinking.png'),
    require('../../assets/hamsters/casual/eating-small.png'),
    require('../../assets/hamsters/casual/eating-normal.png'),
    require('../../assets/hamsters/casual/eating-large.png'),
    require('../../assets/hamsters/casual/exercising.png'),
    require('../../assets/hamsters/casual/studying.png'),
    require('../../assets/hamsters/casual/focus.png'),
    require('../../assets/hamsters/casual/sad.png'),
    require('../../assets/hamsters/casual/coffee.png'),
    require('../../assets/hamsters/casual/apples.png'),
    require('../../assets/hamsters/casual/jumping.gif'),
  ];

  return useImagePreloader(hamsterImages);
};