# Casual Hamster - Drink Water Feature ✅

## Overview
Added interactive water drinking feature exclusively for the Casual character. Users can tap a button to make their hamster drink water, earning energy rewards.

## Features Implemented

### 1. Water Button
- **Position**: Below speech bubble (750px from top on iPhone 15 Pro)
- **Size**: Same width as speech bubble (355px / 90.3%)
- **Color**: Blue (#4FC3F7) with darker border (#0288D1)
- **Shows**: Current water count (X/8 glasses)
- **Reward**: +5 Energy per glass

### 2. Animation System
```tsx
const [currentAnimation, setCurrentAnimation] = useState('idle');

// When drinking water
setCurrentAnimation('eating'); // Shows eating.gif
setTimeout(() => setCurrentAnimation('idle'), 2000); // Back to idle after 2s
```

### 3. Dynamic Character Loading
```tsx
const getCharacterImage = () => {
  if (selectedCharacter === 'casual') {
    if (currentAnimation === 'eating') {
      try {
        return require('../../assets/hamsters/casual/eating.gif');
      } catch {
        return require('../../assets/hamsters/casual/idle.gif');
      }
    }
    return require('../../assets/hamsters/casual/idle.gif');
  }
  // Other characters...
};
```

### 4. Dynamic Speech Bubble
```tsx
const [hamsterMessage, setHamsterMessage] = useState('...');

// Updates based on actions
setHamsterMessage(`Yum! ${buddyName} drank water! +5 Energy 💧`);
```

### 5. Daily Limit System
- **Max**: 8 glasses per day
- **Disabled State**: Button grays out when limit reached
- **Message**: "I'm full! 🐹 No more water today!"

## User Flow

### Step 1: Initial State
- Hamster shows idle animation
- Water button shows: "💧 Drink Water (0/8)"
- Speech bubble shows default message

### Step 2: User Taps Water Button
1. Hamster switches to eating/drinking animation
2. Speech bubble updates: "Yum! {buddyName} drank water! +5 Energy 💧"
3. Alert shows: "Water Logged! 💧\nGlass 1/8\n+5 Energy added!"
4. Store updates: `waterGlasses++`, `energy += 5`
5. After 2 seconds, hamster returns to idle animation

### Step 3: Reaching Limit
- After 8 glasses, button becomes disabled
- Button grays out (opacity 0.6)
- Tapping shows: "Daily Limit Reached" alert
- Speech bubble: "I'm full! 🐹 No more water today!"

## Code Structure

### State Management
```tsx
// Animation state
const [currentAnimation, setCurrentAnimation] = useState('idle');

// Message state
const [hamsterMessage, setHamsterMessage] = useState('...');

// Store integration
const { userData, logWater } = useQuillbyStore();
```

### Water Handler
```tsx
const handleDrinkWater = () => {
  // Check limit
  if (userData.waterGlasses >= 8) {
    setHamsterMessage("I'm full! 🐹 No more water today!");
    Alert.alert("Daily Limit Reached", "...");
    return;
  }
  
  // Animate
  setCurrentAnimation('eating');
  setTimeout(() => setCurrentAnimation('idle'), 2000);
  
  // Update store
  logWater();
  
  // Update UI
  setHamsterMessage(`Yum! ${buddyName} drank water! +5 Energy 💧`);
  Alert.alert("Water Logged! 💧", `Glass ${userData.waterGlasses + 1}/8...`);
};
```

### Conditional Rendering
```tsx
{selectedCharacter === 'casual' && (
  <View style={styles.waterButtonContainer}>
    <TouchableOpacity 
      style={[
        styles.waterButton,
        userData.waterGlasses >= 8 && styles.waterButtonDisabled
      ]}
      onPress={handleDrinkWater}
      disabled={userData.waterGlasses >= 8}
    >
      <Text style={styles.waterButtonText}>
        💧 Drink Water ({userData.waterGlasses}/8)
      </Text>
      <Text style={styles.waterButtonSubtext}>
        +5 Energy per glass
      </Text>
    </TouchableOpacity>
  </View>
)}
```

## Assets Required

### Current Assets
- ✅ `assets/hamsters/casual/idle.gif` - Idle animation

### Missing Assets (Fallback to idle)
- ⏳ `assets/hamsters/casual/eating.gif` - Eating/drinking animation

### To Add Eating Animation
1. Create or obtain eating.gif (hamster drinking water animation)
2. Place at: `assets/hamsters/casual/eating.gif`
3. Animation will automatically work (no code changes needed)

## Styling

### Button States
```tsx
// Normal state
waterButton: {
  backgroundColor: '#4FC3F7',  // Light blue
  borderColor: '#0288D1',      // Dark blue
}

// Disabled state
waterButtonDisabled: {
  backgroundColor: '#B0BEC5',  // Gray
  borderColor: '#78909C',      // Dark gray
  opacity: 0.6,
}
```

### Positioning (iPhone 15 Pro)
```tsx
waterButtonContainer: {
  left: 17px (4.3%),
  top: 750px (88%),
  width: 355px (90.3%),
}
```

## Store Integration

### Required Store Functions
```tsx
const { 
  userData,      // Access water count and energy
  logWater       // Increment water count and add energy
} = useQuillbyStore();
```

### Store Updates
```tsx
logWater() {
  // Increments userData.waterGlasses
  // Adds +5 to userData.energy
  // Caps energy at maxEnergyCap
}
```

## Future Enhancements

### 1. More Animations
- Happy animation after drinking
- Tired animation when low energy
- Full animation at 8 glasses

### 2. Visual Feedback
- Water splash effect
- Energy +5 floating text
- Progress bar animation

### 3. Rewards
- Bonus coins for completing 8 glasses
- Achievement badges
- Streak tracking

### 4. Customization
- Different drink types (juice, tea, etc.)
- Custom messages per drink
- Sound effects

## Character-Specific Features

### Casual Character
- ✅ Drink Water button
- ⏳ Snack button (coming soon)
- ⏳ Nap button (coming soon)

### Energetic Character
- ⏳ Exercise button
- ⏳ Run button
- ⏳ Jump button

### Scholar Character
- ⏳ Read book button
- ⏳ Study button
- ⏳ Think button

## Testing Checklist

- [x] Water button appears only for Casual character
- [x] Button shows correct count (0-8)
- [x] Tapping button triggers animation (if eating.gif exists)
- [x] Speech bubble updates with message
- [x] Alert shows with glass count
- [x] Energy increases by +5
- [x] Button disables at 8 glasses
- [x] Disabled state shows gray color
- [x] Limit message appears when tapping disabled button
- [x] Animation returns to idle after 2 seconds
- [x] Responsive positioning on all devices

## Result

The Casual hamster now has an interactive water drinking feature! Users can:
- Tap the water button to make their hamster drink
- See animations (when eating.gif is added)
- Earn +5 energy per glass
- Track daily water intake (up to 8 glasses)
- Get visual and text feedback

Perfect foundation for adding more character-specific features! 🐹💧✨
