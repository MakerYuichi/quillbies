# 📱 Responsive Layout - Quick Reference

## Element Positioning Cheat Sheet

### Title
```typescript
width: '100%'
top: SCREEN_HEIGHT * 0.08  // 8% from top
fontSize: SCREEN_WIDTH * 0.14  // 14% of width
```

### Egg/Hamster
```typescript
width: SCREEN_WIDTH * 0.68  // 68% of width
height: SCREEN_HEIGHT * 0.29  // 29% of height
left: SCREEN_WIDTH * 0.16  // Centered (16% margin)
top: SCREEN_HEIGHT * 0.33  // 33% from top
```

### Orange Section
```typescript
width: SCREEN_WIDTH  // Full width
height: SCREEN_HEIGHT * 0.28  // 28% of height
top: SCREEN_HEIGHT * 0.75  // 75% from top (dynamic with keyboard)
```

### Input Container
```typescript
width: SCREEN_WIDTH * 0.72  // 72% of width
height: SCREEN_HEIGHT * 0.08  // 8% of height
fontSize: SCREEN_WIDTH * 0.12  // 12% of width
```

## Screen Size Examples

### iPhone SE (375 × 667)
- Title: 52.5px font, 53px from top
- Egg: 255px × 193px at (60, 220)
- Orange: 375px wide at 500px from top

### Galaxy F12 (393 × 851)
- Title: 55px font, 68px from top
- Egg: 267px × 247px at (63, 281)
- Orange: 393px wide at 638px from top

### iPhone 14 Pro Max (430 × 932)
- Title: 60px font, 75px from top
- Egg: 292px × 270px at (69, 308)
- Orange: 430px wide at 699px from top

## Keyboard Behavior

```typescript
// Initial position
ORANGE_INITIAL_POSITION = SCREEN_HEIGHT * 0.75

// Keyboard shows (e.g., 300px)
newPosition = ORANGE_INITIAL_POSITION - 300 - 20

// Keyboard hides
newPosition = ORANGE_INITIAL_POSITION
```

## Testing Checklist

- [ ] Title visible and centered on all devices
- [ ] Egg centered horizontally
- [ ] Orange section at bottom (not cut off)
- [ ] Input visible when keyboard appears
- [ ] All text readable (not too small/large)
- [ ] Animations smooth on all devices
- [ ] No overlapping elements

## Quick Math

| Element | % of Width | % of Height |
|---------|-----------|-------------|
| Title | 100% | 8% (top) |
| Egg | 68% | 29% |
| Orange | 100% | 28% |
| Input | 72% | 8% |

**Orange Position**: Always at 75% of screen height (moves up for keyboard)

## Common Screen Sizes

| Device | Width | Height | Egg Size | Orange Top |
|--------|-------|--------|----------|------------|
| iPhone SE | 375 | 667 | 255×193 | 500 |
| iPhone 12 | 390 | 844 | 265×245 | 633 |
| Galaxy F12 | 393 | 851 | 267×247 | 638 |
| iPhone 14 Pro | 393 | 852 | 267×247 | 639 |
| Pixel 5 | 393 | 851 | 267×247 | 638 |
| iPhone 14 Pro Max | 430 | 932 | 292×270 | 699 |

All devices maintain the same proportions! 🎯
