# Caviche Font Setup

## 📥 Download Caviche Font

Caviche is a custom font that needs to be downloaded and added manually.

### Option 1: Download from Font Sites
1. Visit a font site like:
   - https://www.dafont.com/caviche.font
   - https://www.fontspace.com/caviche-font
   
2. Download the font file (usually `Caviche-Regular.ttf` or `Caviche.otf`)

3. Place it in this folder: `quillby-app/assets/fonts/`

### Option 2: Use Similar Google Font (Temporary)
If you can't find Caviche, you can use a similar playful font:
- **Caveat** (already installed) - Handwritten, playful
- **Pacifico** - Cursive, friendly
- **Fredoka One** - Bold, rounded

## 📁 File Placement

After downloading, place the font file here:
```
/quillby-app
  /assets
    /fonts
      Caviche-Regular.ttf    ← Place your font file here
```

## 🔧 Usage in Code

Once the font file is in place, it will be loaded automatically:

```tsx
import * as Font from 'expo-font';

// Load custom font
await Font.loadAsync({
  'Caviche': require('../../assets/fonts/Caviche-Regular.ttf'),
});

// Use in styles
fontFamily: 'Caviche'
```

## ⚠️ Current Status

The welcome screen is currently set up to use 'Caviche' font for the title.

**If you don't have the font file yet:**
- The app will fall back to the system default font
- Or you can temporarily use 'Caveat_700Bold' (already installed)

## 🎯 Next Steps

1. Download Caviche font file
2. Place `Caviche-Regular.ttf` in `assets/fonts/`
3. Restart the app with `npx expo start --clear`
4. The title will display in Caviche font!
