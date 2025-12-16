# Missing Asset for Hatching Sequence

## ❌ Missing Image

You need to create **1 more image** to complete the hatching sequence:

### `egg-crack3.png`
- **Size**: 268×249px
- **Content**: Fully cracked egg (just before hamster emerges)
- **Description**: The egg should be completely broken open with large cracks and pieces falling away
- **Background**: Transparent PNG
- **Location**: Place in `assets/onboarding/egg-crack3.png`

## ✅ Assets You Already Have

1. ✅ `egg-only.png` - Intact egg (normal state)
2. ✅ `egg-crack1.png` - First crack appears
3. ✅ `egg-crack2.png` - Second crack (more cracks)
4. ❌ `egg-crack3.png` - **NEED THIS** - Fully cracked
5. ✅ `hamster-egghatch.png` - Hamster emerging

## 🎬 How It's Used

```
Tap 1 → egg-only.png → egg-crack1.png (gentle glow)
Tap 2 → egg-crack1.png → egg-crack2.png (stronger glow)
Tap 3 → BLACK SCREEN SEQUENCE:
  1. egg-crack2.png glows and shakes
  2. → egg-crack3.png (fully cracked)
  3. → hamster-egghatch.png fades in
  4. Black screen fades out
  5. Title and input appear
```

## 🎨 Design Notes for egg-crack3.png

- Should look like the egg is about to burst open
- Large cracks radiating from center
- Maybe some shell pieces separating
- More dramatic than crack2
- Sets up the reveal of the hamster

## 🚀 Once You Add It

1. Place `egg-crack3.png` in `assets/onboarding/`
2. Test the hatching sequence:
   - Tap egg 3 times
   - Watch black screen sequence
   - See egg-crack3 appear before hamster
3. Verify smooth transitions between all 5 stages

The code is ready - just needs this one asset!
