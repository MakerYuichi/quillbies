# Custom Fonts

## Required Font Files

### Caveat Font (for headlines)
- **File**: `Caveat-Bold.ttf` or `Caveat-Regular.ttf`
- **Download**: https://fonts.google.com/specimen/Caveat
- **Usage**: Main headline "Ready for a Study Partner?"

Note: We're using Caveat from @expo-google-fonts, so no manual file needed!

### Chakra Petch Font (for body text)
- **File**: Loaded via @expo-google-fonts/chakra-petch
- **Usage**: Description text and buttons

## Installation

Both fonts are installed via Expo:
```bash
npx expo install expo-font @expo-google-fonts/caveat @expo-google-fonts/chakra-petch
```

## Usage in Code

```tsx
import { useFonts, Caveat_700Bold } from '@expo-google-fonts/caveat';
import { ChakraPetch_400Regular, ChakraPetch_600SemiBold } from '@expo-google-fonts/chakra-petch';

// In your component
const [fontsLoaded] = useFonts({
  Caveat_700Bold,
  ChakraPetch_400Regular,
  ChakraPetch_600SemiBold,
});

// In styles
fontFamily: 'Caveat_700Bold'
fontFamily: 'ChakraPetch_400Regular'
```
