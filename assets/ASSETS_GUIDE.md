# Assets Folder Structure

This folder contains all images and visual assets for the Quillby app.

## Folder Organization

```
/assets
  /backgrounds          # Full-screen background images
    welcome-bg.png      # Screen 1: Welcome & Permission
    character-bg.png    # Screen 2: Character Selection
    name-bg.png         # Screen 3: Name Your Buddy
    
  /onboarding          # Onboarding-specific assets
    hamster-casual.png      # Character option 1
    hamster-energetic.png   # Character option 2
    hamster-scholar.png     # Character option 3
    cracked-egg.png         # For naming screen
    
  /hamsters            # Main hamster expressions (for gameplay)
    happy.png
    tired.png
    sleeping.png
    excited.png
    sad.png
    
  /rooms               # Room background states
    clean.png
    messy.png
    dirty.png
```

## How to Add Your Background Image

1. **Place your image** in `/assets/backgrounds/welcome-bg.png`
2. The image will automatically be used by the Welcome screen
3. Recommended size: 1080x1920 (portrait) or higher resolution
4. Format: PNG or JPG

## Image Requirements

- **Backgrounds**: High resolution, portrait orientation
- **Characters**: Transparent PNG with consistent sizing
- **Hamster expressions**: 200x200px minimum, transparent background
- **Rooms**: Match screen dimensions, landscape-friendly

## Usage in Code

```tsx
// Import background
<ImageBackground
  source={require('../../assets/backgrounds/welcome-bg.png')}
  style={{ flex: 1 }}
  resizeMode="cover"
/>

// Import character
<Image
  source={require('../../assets/onboarding/hamster-casual.png')}
  style={{ width: 150, height: 150 }}
/>
```

## Next Steps

1. Add your `welcome-bg.png` to `/assets/backgrounds/`
2. Test the Welcome screen to see your background
3. Add character images as you build Screen 2
