# Current Home Screen Status

## ✅ Implemented Features

### 1. Immersive Room Layout (Non-Scrollable)
- 8 layers: wall, floor, bluebg, shelf, clock, character, energy bar, speech bubble
- All positioned absolutely using iPhone 15 Pro specs (393x852)
- No scrolling - everything fits on one screen

### 2. Character Display
- Shows selected hamster from onboarding
- Casual character uses GIFs (idle.gif, eating.gif)
- White background circle behind hamster belly (100x100px, invisible)
- Positioned at: right 46px, top 192px

### 3. Water Feature (Casual Only)
- Button shows: "💧 Water (X/8+)"
- Minimum 8 glasses goal, unlimited drinking
- Rewards: +5 energy/coins per glass, +20 energy/+10 coins at 8 glasses
- Animation: eating.gif for 2 seconds
- Feedback via speech bubble only (no alerts)

### 4. Sleep/Wake Cycle (Casual Only)
- **Sleep Button**: "😴 Sleep" (Purple #9C27B0)
- **Wake Button**: "☀️ Woke Up" (Orange #FF9800)
- Automatic duration calculation
- Room dims when sleeping (60% black overlay)
- Animations: sleeping.png, wake-up.png (3s)
- Sleep consequences: <6h = -30% cap, 6-8h = normal, 8+h = +10 energy

### 5. Button Layout
```
┌─────────────────────────────────────┐
│                                     │
│  [Speech Bubble]                    │
│                                     │
│  [💧 Water]  [😴 Sleep/☀️ Woke Up] │
│                                     │
└─────────────────────────────────────┘
```

**Position**: 
- Row container at: left 17px, top 750px, width 355px
- Two buttons side-by-side with 10px gap
- Each button takes 50% width (flex: 1)

## 🎨 Visual Hierarchy (Z-Index)

1. **Z-Index 15**: Buttons & Speech Bubble (top layer, interactive)
2. **Z-Index 10**: Character Hamster
3. **Z-Index 9**: White belly background
4. **Z-Index 8**: Dim overlay (when sleeping)
5. **Z-Index 5**: Energy bar
6. **Z-Index 0**: Room layers (wall, floor, shelf, clock)

## 📱 Screen Layout (iPhone 15 Pro: 393x852)

```
┌─────────────────────────────────────┐ 0px
│ [Clock]                    [Shelf]  │
│                                     │
│                                     │
│              [Hamster]              │ 192px
│                                     │
│                                     │
│                                     │
│         [Energy Bar]                │ 473px
│                                     │
│                                     │
│                                     │
│      [Speech Bubble]                │ 647px
│                                     │
│  [💧 Water]  [😴 Sleep]            │ 750px
│                                     │
└─────────────────────────────────────┘ 852px
```

## 🔧 Current Button Styles

### Water Button
```tsx
waterButton: {
  flex: 1,
  backgroundColor: '#4FC3F7',      // Light blue
  borderColor: '#0288D1',          // Dark blue
  padding: 12px,
  borderRadius: 12,
  borderWidth: 2,
}
```

### Sleep Button (Normal)
```tsx
sleepButton: {
  flex: 1,
  backgroundColor: '#9C27B0',      // Purple
  borderColor: '#6A1B9A',          // Dark purple
  padding: 12px,
  borderRadius: 12,
  borderWidth: 2,
}
```

### Wake Button (When Sleeping)
```tsx
wakeButton: {
  backgroundColor: '#FF9800',      // Orange
  borderColor: '#F57C00',          // Dark orange
}
```

## 🎯 Button Behavior

### Water Button
- Always visible for Casual character
- Shows progress: "X/8+"
- Subtext: "Y to go!" or "Goal met! 🎉"
- Triggers eating.gif animation
- Updates speech bubble with encouragement

### Sleep/Wake Button
- **Before Sleep**: "😴 Sleep" + "Xh last" subtext
- **During Sleep**: "☀️ Woke Up" + "Tap to wake" subtext
- Toggles between sleep/wake states
- Dims room when sleeping
- Calculates duration automatically

## 📋 User Feedback (Speech Bubble)

### Water Messages
- Before 8: "💧 X to go! Keep drinking!"
- At 8: "🎉 Daily goal reached! 8/8 glasses • Bonus +20 Energy!"
- After 8: "Wow! X glasses! 🌊 Extra hydrated! +5 Energy"

### Sleep Messages
- Going to sleep: "💤 {buddyName} is sleeping... Goodnight! Tap 'Woke Up' when you wake."
- < 6 hours: "😴 Only X hours? Max energy reduced by 30%!"
- 6-8 hours: "😊 X hours of sleep! Good rest, {buddyName}!"
- 8+ hours: "⭐ X hours! Amazing! Bonus +10 Energy!"

## ✅ What's Working

1. ✅ Non-scrollable immersive room
2. ✅ Character shows selected hamster
3. ✅ GIF animations (idle, eating)
4. ✅ White belly background (invisible)
5. ✅ Water button with progress tracking
6. ✅ Sleep/wake button with state toggle
7. ✅ Room dimming during sleep
8. ✅ Automatic duration calculation
9. ✅ Speech bubble feedback (no alerts)
10. ✅ Side-by-side button layout

## 🎨 Assets Status

### ✅ Available
- `assets/rooms/walls.png`
- `assets/rooms/floor.png`
- `assets/rooms/clock.png`
- `assets/backgrounds/bluebg.png`
- `assets/study-session/studyroom-shelf.png`
- `assets/hamsters/casual/idle-sit.png` (GIF)
- `assets/hamsters/casual/eating.png` (GIF)

### ⏳ Missing (Fallback to idle)
- `assets/hamsters/casual/sleeping.png`
- `assets/hamsters/casual/wake-up.png`

## 🚀 Next Steps

1. Add sleeping.png asset for sleep animation
2. Add wake-up.png asset for wake animation
3. Test complete sleep/wake cycle flow
4. Consider auto-wake after 12 hours
5. Test button interactions on actual device

## 📝 Notes

- Home screen is intentionally non-scrollable per user request
- All feedback via speech bubble (no Alert notifications)
- Water feature: minimum 8 glasses goal, unlimited drinking
- Sleep system: realistic cycle with automatic duration tracking
- Buttons are side-by-side: water (left, blue), sleep (right, purple/orange)
