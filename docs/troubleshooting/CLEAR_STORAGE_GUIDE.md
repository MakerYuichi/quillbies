
## Manual Storage Clearing

### Method 1: Add to your app temporarily
1. Import and use the ClearStorageScreen component
2. It will auto-clear storage on mount
3. Restart your app

### Method 2: Add this code to any component temporarily:
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Add this to useEffect or button press
const clearStorage = async () => {
  await AsyncStorage.clear();
  await AsyncStorage.removeItem('quillby-storage');
  console.log('Storage cleared!');
};
```

### Method 3: Reset app data (iOS/Android)
- iOS: Delete and reinstall the app
- Android: Go to Settings > Apps > Quillby > Storage > Clear Data

### Method 4: Development only
If using Expo:
- Run: `expo r -c` (reset with clear cache)
- Or: Delete node_modules and reinstall
