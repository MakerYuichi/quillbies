# Font Download Guide

## Required Fonts for Quillby App

### 1. Caviche (Welcome Screen Title)
- **Download**: https://www.dafont.com/caviche.font
- **File**: `Caviche-Regular.ttf`
- **Location**: `assets/fonts/Caviche-Regular.ttf`
- **Usage**: Welcome screen title "Ready for a Study Partner?"

### 2. Ceviche One (Character Selection Title)
- **Download**: https://fonts.google.com/specimen/Ceviche+One
- **File**: `CevicheOne-Regular.ttf`
- **Location**: `assets/fonts/CevicheOne-Regular.ttf`
- **Usage**: Character selection title "Choose Your COMPANION"

### 3. Caveat Brush (Character Labels)
- **Download**: https://fonts.google.com/specimen/Caveat+Brush
- **File**: `CaveatBrush-Regular.ttf`
- **Location**: `assets/fonts/CaveatBrush-Regular.ttf`
- **Usage**: Character labels (Casual, Energetic, Scholar)

## How to Download from Google Fonts

1. Visit the font page (links above)
2. Click "Download family" button
3. Extract the ZIP file
4. Find the `.ttf` file
5. Rename if needed to match the file name above
6. Place in `assets/fonts/` folder

## How to Download from DaFont

1. Visit the font page
2. Click "Download" button
3. Extract the ZIP file
4. Find the `.ttf` file
5. Place in `assets/fonts/` folder

## Already Installed (via npm)

These fonts are loaded via @expo-google-fonts:
- ✅ Chakra Petch (body text, buttons)
- ✅ Caveat (alternative to Caviche if needed)

## Folder Structure

```
/quillby-app
  /assets
    /fonts
      Caviche-Regular.ttf          ← Download this
      CevicheOne-Regular.ttf       ← Download this
      CaveatBrush-Regular.ttf      ← Download this
      FONT_DOWNLOAD_GUIDE.md       ← This file
```

## After Adding Fonts

1. Restart the app: `npx expo start --clear`
2. Fonts will load automatically
3. Check for any "font not found" errors in console

## Troubleshooting

### Font not loading?
- Check file name matches exactly (case-sensitive)
- Check file is in correct folder
- Restart with `--clear` flag
- Check console for errors

### Can't find the font?
- Try alternative font sites
- Search "[font name] free download"
- Make sure it's the correct variant (Regular, not Bold/Italic)
