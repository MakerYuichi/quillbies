# Modular Architecture - Home Screen

## Overview
The home screen has been refactored into a clean, modular architecture with separate components and hooks for better maintainability and reusability.

## File Structure

```
quillby-app/app/
├── (tabs)/
│   └── index.tsx                    # Main home screen (orchestrator)
├── components/
│   ├── EnergyBar.tsx               # Energy bar display
│   ├── RoomLayers.tsx              # Room background layers
│   ├── HamsterCharacter.tsx        # Hamster character display
│   ├── SpeechBubble.tsx            # Speech bubble with dynamic sizing
│   ├── WaterButton.tsx             # Water tracking button
│   └── SleepButton.tsx             # Sleep/Wake button
└── hooks/
    ├── useWaterTracking.ts         # Water tracking logic
    └── useSleepTracking.ts         # Sleep/Wake cycle logic
```

## Components

### 1. RoomLayers.tsx
**Purpose**: Renders all room background layers (wall, floor, shelf, clock, etc.)

**Props**: None

**Features**:
- Self-contained room decoration
- All positioning based on iPhone 15 Pro specs
- 5 layers: wall, floor, blue bg, shelf, clock

---

### 2. HamsterCharacter.tsx
**Purpose**: Displays the hamster character with appropriate animation

**Props**:
- `selectedCharacter: string` - Character type (casual, energetic, scholar)
- `currentAnimation: string` - Current animation state (idle, eating, sleeping, wake-up)
- `isSleeping: boolean` - Whether hamster is sleeping

**Features**:
- Handles character image selection
- Supports GIF animations for casual character
- Fallback to idle animation if asset missing
- White belly background included

---

### 3. SpeechBubble.tsx
**Purpose**: Displays hamster messages with dynamic font sizing

**Props**:
- `message: string` - Message to display

**Features**:
- **Dynamic font sizing**:
  - < 50 chars: 20px (normal)
  - 50-100 chars: 16px (smaller)
  - 100-150 chars: 14px (even smaller)
  - 150+ chars: 12px (smallest)
- Ensures all text is always visible
- Positioned at bottom of screen

---

### 4. WaterButton.tsx
**Purpose**: Water tracking button for Casual character

**Props**:
- `waterGlasses: number` - Current water count
- `onPress: () => void` - Handler for button press

**Features**:
- Shows progress: "💧 Water (X/8+)"
- Dynamic subtext: "Y to go!" or "Goal met! 🎉"
- Blue color scheme (#4FC3F7)
- Half-width button (flex: 1)

---

### 5. SleepButton.tsx
**Purpose**: Sleep/Wake button for Casual character

**Props**:
- `isSleeping: boolean` - Current sleep state
- `sleepHours: number` - Last sleep duration
- `onSleep: () => void` - Handler for sleep action
- `onWakeUp: () => void` - Handler for wake action

**Features**:
- **Two states**:
  - Sleep: Purple (#9C27B0), shows "😴 Sleep"
  - Wake: Orange (#FF9800), shows "☀️ Woke Up"
- Dynamic width: half when awake, full when sleeping
- Shows last sleep duration when awake

---

## Hooks

### 1. useWaterTracking.ts
**Purpose**: Manages water tracking logic and state

**Parameters**:
- `buddyName: string` - User's buddy name for messages

**Returns**:
```typescript
{
  waterGlasses: number;        // Current water count
  handleDrinkWater: () => void; // Drink water handler
  waterAnimation: string;       // Current animation state
  waterMessage: string;         // Message for speech bubble
}
```

**Features**:
- Tracks water intake
- Triggers eating animation (2s)
- Generates encouraging messages
- Handles bonus rewards at 8 glasses

---

### 2. useSleepTracking.ts
**Purpose**: Manages sleep/wake cycle logic and state

**Parameters**:
- `buddyName: string` - User's buddy name for messages

**Returns**:
```typescript
{
  isSleeping: boolean;           // Current sleep state
  sleepHours: number;            // Last sleep duration
  handleSleepButton: () => void; // Start sleep handler
  handleWakeUpButton: () => void; // Wake up handler
  sleepAnimation: string;        // Current animation state
  sleepMessage: string;          // Message for speech bubble
}
```

**Features**:
- Tracks sleep start time
- Calculates duration (hours + minutes)
- Triggers sleeping/wake-up animations
- Generates feedback based on sleep quality
- Logs sleep to store with consequences

---

## Main Screen (index.tsx)

### Responsibilities
1. **Orchestration**: Combines all components and hooks
2. **State Management**: Uses custom hooks for features
3. **Energy Updates**: Periodic energy cap enforcement
4. **Layout**: Positions all UI elements

### Code Flow
```typescript
// 1. Get user data
const { userData, updateEnergy } = useQuillbyStore();

// 2. Use custom hooks
const { waterGlasses, handleDrinkWater, waterAnimation, waterMessage } = useWaterTracking(buddyName);
const { isSleeping, handleSleepButton, handleWakeUpButton, sleepAnimation, sleepMessage } = useSleepTracking(buddyName);

// 3. Determine current state
const currentAnimation = sleepAnimation !== 'idle' ? sleepAnimation : waterAnimation;
const hamsterMessage = sleepMessage || waterMessage || defaultMessage;

// 4. Render components
return (
  <View>
    <RoomLayers />
    <HamsterCharacter />
    <EnergyBar />
    <SpeechBubble />
    <WaterButton />
    <SleepButton />
  </View>
);
```

---

## Benefits of Modular Architecture

### 1. Separation of Concerns
- **Components**: Pure UI rendering
- **Hooks**: Business logic and state
- **Main Screen**: Orchestration only

### 2. Reusability
- Components can be used in other screens
- Hooks can be shared across features
- Easy to test in isolation

### 3. Maintainability
- Each file has single responsibility
- Easy to locate and fix bugs
- Clear dependencies

### 4. Scalability
- Easy to add new features
- Can extend hooks without touching UI
- Can modify UI without touching logic

### 5. Readability
- Main screen is now ~100 lines (was ~400)
- Each component is focused and small
- Clear naming conventions

---

## Adding New Features

### Example: Add Breakfast Feature

1. **Create Hook**: `app/hooks/useBreakfastTracking.ts`
```typescript
export const useBreakfastTracking = (buddyName: string) => {
  const { userData, logBreakfast } = useQuillbyStore();
  
  const handleEatBreakfast = () => {
    // Logic here
  };
  
  return { ateBreakfast: userData.ateBreakfast, handleEatBreakfast };
};
```

2. **Create Component**: `app/components/BreakfastButton.tsx`
```typescript
export default function BreakfastButton({ ateBreakfast, onPress }) {
  return <TouchableOpacity onPress={onPress}>...</TouchableOpacity>;
}
```

3. **Use in Main Screen**: `app/(tabs)/index.tsx`
```typescript
const { ateBreakfast, handleEatBreakfast } = useBreakfastTracking(buddyName);

return (
  <View>
    {/* ... other components ... */}
    <BreakfastButton ateBreakfast={ateBreakfast} onPress={handleEatBreakfast} />
  </View>
);
```

---

## Testing Strategy

### Component Testing
- Test each component in isolation
- Mock props and verify rendering
- Test dynamic behaviors (font sizing, button states)

### Hook Testing
- Test logic without UI
- Verify state updates
- Test edge cases (0 water, 24h sleep)

### Integration Testing
- Test main screen orchestration
- Verify component interactions
- Test full user flows

---

## File Sizes (Approximate)

| File | Lines | Purpose |
|------|-------|---------|
| index.tsx | ~100 | Main orchestrator |
| RoomLayers.tsx | ~80 | Room background |
| HamsterCharacter.tsx | ~70 | Character display |
| SpeechBubble.tsx | ~60 | Speech bubble |
| WaterButton.tsx | ~50 | Water button |
| SleepButton.tsx | ~80 | Sleep button |
| useWaterTracking.ts | ~40 | Water logic |
| useSleepTracking.ts | ~70 | Sleep logic |

**Total**: ~550 lines (was ~400 in single file)
**Benefit**: Better organization, easier to navigate

---

## Migration Notes

### What Changed
- ✅ All functionality preserved
- ✅ No breaking changes
- ✅ Same user experience
- ✅ Better code organization

### What's New
- ✅ Modular components
- ✅ Custom hooks for features
- ✅ Cleaner main screen
- ✅ Easier to extend

### What's Next
- Add breakfast feature
- Add task management
- Add shop integration
- Add stats tracking

---

## Conclusion

The modular architecture provides a solid foundation for future development. Each feature is now self-contained, making it easy to add, modify, or remove functionality without affecting other parts of the app.

**Key Principle**: "Do one thing and do it well" - Each file has a single, clear responsibility.
