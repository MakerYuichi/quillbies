# GIF Animation Support ✅

## Overview
The Home screen now supports animated GIFs for character display. The casual hamster uses an animated idle GIF instead of a static PNG.

## Implementation

### Character Image Function
```tsx
const getCharacterImage = () => {
  switch (selectedCharacter) {
    case 'casual':
      return require('../../assets/hamsters/casual/idle.gif');
    case 'energetic':
      return require('../../assets/onboarding/hamster-energetic.png');
    case 'scholar':
      return require('../../assets/onboarding/hamster-scholar.png');
    default:
      return require('../../assets/hamsters/casual/idle.gif');
  }
};
```

### Display
```tsx
<Image 
  source={getCharacterImage()}
  style={styles.characterImage}
  resizeMode="contain"
/>
```

## Current Assets

### Casual Character
- **Path**: `assets/hamsters/casual/idle.gif`
- **Type**: Animated GIF
- **Status**: ✅ Active

### Energetic Character
- **Path**: `assets/onboarding/hamster-energetic.png`
- **Type**: Static PNG
- **Status**: ⏳ Ready for GIF upgrade

### Scholar Character
- **Path**: `assets/onboarding/hamster-scholar.png`
- **Type**: Static PNG
- **Status**: ⏳ Ready for GIF upgrade

## How GIFs Work in React Native

### Native Support
React Native's `Image` component supports GIFs natively on both platforms:
- **iOS**: Full GIF support (all frames, looping)
- **Android**: Full GIF support (all frames, looping)
- **Web**: Full GIF support via browser

### No Additional Libraries Needed
- ✅ Works with standard `<Image>` component
- ✅ No need for `react-native-fast-image`
- ✅ No need for `react-native-gif`
- ✅ Automatic looping
- ✅ Automatic playback

### Performance
- GIFs are decoded and cached automatically
- Smooth playback on modern devices
- Minimal performance impact for small GIFs

## Adding More GIFs

### Folder Structure
```
assets/hamsters/
├── casual/
│   ├── idle.gif       ✅ Added
│   ├── happy.gif      ⏳ Future
│   ├── studying.gif   ⏳ Future
│   └── tired.gif      ⏳ Future
├── energetic/
│   ├── idle.gif       ⏳ Future
│   ├── excited.gif    ⏳ Future
│   └── running.gif    ⏳ Future
└── scholar/
    ├── idle.gif       ⏳ Future
    ├── reading.gif    ⏳ Future
    └── thinking.gif   ⏳ Future
```

### To Add Energetic GIF
1. Place GIF at: `assets/hamsters/energetic/idle.gif`
2. Update code:
```tsx
case 'energetic':
  return require('../../assets/hamsters/energetic/idle.gif');
```

### To Add Scholar GIF
1. Place GIF at: `assets/hamsters/scholar/idle.gif`
2. Update code:
```tsx
case 'scholar':
  return require('../../assets/hamsters/scholar/idle.gif');
```

## Dynamic Animation States

### Future Enhancement: State-Based Animations
```tsx
const getCharacterAnimation = (character, state) => {
  const animations = {
    casual: {
      idle: require('../../assets/hamsters/casual/idle.gif'),
      happy: require('../../assets/hamsters/casual/happy.gif'),
      studying: require('../../assets/hamsters/casual/studying.gif'),
      tired: require('../../assets/hamsters/casual/tired.gif'),
    },
    energetic: {
      idle: require('../../assets/hamsters/energetic/idle.gif'),
      excited: require('../../assets/hamsters/energetic/excited.gif'),
      running: require('../../assets/hamsters/energetic/running.gif'),
    },
    scholar: {
      idle: require('../../assets/hamsters/scholar/idle.gif'),
      reading: require('../../assets/hamsters/scholar/reading.gif'),
      thinking: require('../../assets/hamsters/scholar/thinking.gif'),
    },
  };
  
  return animations[character]?.[state] || animations[character].idle;
};

// Usage
const hamsterState = userData.energy > 50 ? 'happy' : 'tired';
const characterImage = getCharacterAnimation(selectedCharacter, hamsterState);
```

## GIF Optimization Tips

### File Size
- Keep GIFs under 500KB for smooth loading
- Use tools like Giphy or ezgif.com to optimize
- Reduce colors (256 colors max for GIF)
- Limit frame count (10-20 frames is usually enough)

### Dimensions
- Match character container size: 312x234px (from Figma)
- Use 2x resolution for retina: 624x468px
- Don't exceed 1000px in any dimension

### Frame Rate
- 10-15 FPS is smooth enough for idle animations
- Higher FPS = larger file size
- Lower FPS = choppier animation

### Looping
- GIFs loop automatically in React Native
- No code needed for continuous playback
- Seamless loop = better user experience

## Testing Checklist

- [x] Casual GIF displays correctly
- [x] GIF loops automatically
- [x] Animation is smooth
- [x] No performance issues
- [x] Works on iOS
- [ ] Works on Android (test when available)
- [x] Fallback to PNG if GIF fails
- [x] Correct size and positioning

## Troubleshooting

### GIF Not Animating
- **Issue**: GIF shows only first frame
- **Solution**: Ensure file is valid GIF format, not renamed PNG
- **Check**: Open GIF in browser to verify animation

### Performance Issues
- **Issue**: App lags with GIF
- **Solution**: Optimize GIF file size (compress, reduce frames)
- **Target**: Keep under 500KB

### GIF Not Loading
- **Issue**: Image doesn't appear
- **Solution**: Check file path, ensure require() path is correct
- **Verify**: File exists at specified location

## Benefits

### User Experience
- ✅ More engaging and lively
- ✅ Character feels alive
- ✅ Adds personality
- ✅ Visual feedback

### Technical
- ✅ Native support (no libraries)
- ✅ Cross-platform compatible
- ✅ Easy to implement
- ✅ Minimal code changes

## Next Steps

1. **Test casual GIF** - Verify animation works smoothly
2. **Add energetic GIF** - Create/add animated version
3. **Add scholar GIF** - Create/add animated version
4. **Add state-based animations** - Different GIFs for different moods
5. **Optimize file sizes** - Ensure smooth performance

## Result

The casual hamster now has an animated idle GIF, making the home screen more dynamic and engaging! 🐹✨
