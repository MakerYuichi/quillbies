# Casual Hamster - Sleep Logging Feature ✅

## Overview
Added sleep logging feature for Casual character with modal input, sleeping animation, and energy consequences based on sleep hours.

## Features Implemented

### 1. Sleep Button
- **Position**: Below water button
- **Color**: Purple (#9C27B0)
- **Shows**: Last night's sleep hours
- **Action**: Opens modal for sleep input

### 2. Sleep Modal
- Clean modal with dark overlay
- Number input for hours (0-12)
- Cancel and Submit buttons
- Validates input

### 3. Sleeping Animation
- Shows sleeping.png when logging sleep
- 3-second animation duration
- Returns to idle after animation

### 4. Sleep Consequences

#### Less than 6 hours (😴 Poor Sleep)
- **Energy Cap**: -30% penalty
- **Message**: "😴 Only {hours} hours? Max energy reduced by 30%!"
- **Effect**: Reduces maxEnergyCap

#### 6-8 hours (😊 Good Sleep)
- **Energy Cap**: Normal (100%)
- **Message**: "😊 {hours} hours of sleep! Good rest, {buddyName}!"
- **Effect**: Maintains normal energy cap

#### More than 8 hours (⭐ Great Sleep)
- **Energy Cap**: Normal (100%)
- **Bonus**: +10 Energy
- **Message**: "⭐ {hours} hours! Amazing! Bonus +10 Energy!"
- **Effect**: Adds bonus energy

## User Flow

### Step 1: Tap Sleep Button
- Button shows: "😴 Log Sleep"
- Subtext: "7h last night"
- Modal opens

### Step 2: Enter Hours
- Input field with number keyboard
- Default value: 7
- Range: 0-12 hours

### Step 3: Submit
1. Hamster shows sleeping animation (3s)
2. Store updates sleep hours
3. Energy cap adjusts based on hours
4. Speech bubble shows result message
5. Modal closes

## Code Structure

### State Management
```tsx
const [showSleepModal, setShowSleepModal] = useState(false);
const [sleepHours, setSleepHours] = useState('7');
```

### Sleep Handlers
```tsx
const handleSleepButton = () => {
  setShowSleepModal(true);
};

const handleSleepSubmit = () => {
  const hours = parseInt(sleepHours);
  
  // Validate
  if (isNaN(hours) || hours < 0 || hours > 12) {
    setHamsterMessage('Please enter valid hours (0-12)');
    return;
  }
  
  // Animate
  setCurrentAnimation('sleeping');
  setTimeout(() => setCurrentAnimation('idle'), 3000);
  
  // Log
  logSleep(hours);
  
  // Update message
  if (hours < 6) {
    setHamsterMessage(`😴 Only ${hours} hours?\nMax energy reduced by 30%!`);
  } else if (hours >= 6 && hours <= 8) {
    setHamsterMessage(`😊 ${hours} hours of sleep!\nGood rest, ${buddyName}!`);
  } else {
    setHamsterMessage(`⭐ ${hours} hours! Amazing!\nBonus +10 Energy!`);
  }
  
  setShowSleepModal(false);
};
```

### Animation Support
```tsx
if (currentAnimation === 'sleeping') {
  try {
    return require('../../assets/hamsters/casual/sleeping.png');
  } catch {
    return require('../../assets/hamsters/casual/idle.gif');
  }
}
```

## Assets Required

### Current
- ✅ `assets/hamsters/casual/idle.gif` - Idle animation

### Missing (Fallback to idle)
- ⏳ `assets/hamsters/casual/sleeping.png` - Sleeping animation

## Styling

### Sleep Button
```tsx
sleepButton: {
  backgroundColor: '#9C27B0',  // Purple
  borderColor: '#6A1B9A',      // Dark purple
  // Same size as water button
}
```

### Modal
```tsx
modalOverlay: {
  backgroundColor: 'rgba(0, 0, 0, 0.5)',  // 50% black overlay
}

modalContent: {
  backgroundColor: '#FFFFFF',
  borderRadius: 16,
  width: 300px,
  padding: 30px,
}
```

## Store Integration

The `logSleep(hours)` function in the store:
- Updates `userData.sleepHours`
- Recalculates `maxEnergyCap` based on hours
- Adds bonus energy for 8+ hours
- Applies penalty for <6 hours

## Benefits

### Health Tracking
- Encourages 6-8 hours of sleep
- Rewards good sleep habits
- Penalizes poor sleep

### Game Mechanics
- Energy cap affected by sleep
- Bonus rewards for great sleep
- Strategic planning required

### User Engagement
- Daily interaction point
- Personalized feedback
- Visual consequences

## Testing Checklist

- [x] Sleep button appears for Casual character
- [x] Button shows last night's hours
- [x] Modal opens on tap
- [x] Number input works
- [x] Validation prevents invalid input
- [x] Sleeping animation triggers (if sleeping.png exists)
- [x] Speech bubble updates with appropriate message
- [x] Energy cap adjusts for <6 hours
- [x] Bonus energy for 8+ hours
- [x] Modal closes after submit
- [x] Cancel button works
- [x] Responsive on all devices

## Future Enhancements

### 1. Sleep Tracking
- Track sleep history
- Show sleep patterns
- Weekly sleep report

### 2. Sleep Quality
- Add sleep quality rating
- Different animations for quality
- Quality affects energy more

### 3. Sleep Reminders
- Bedtime notifications
- Wake-up reminders
- Sleep schedule suggestions

### 4. Sleep Achievements
- 7-day good sleep streak
- Perfect sleep week badge
- Early bird / Night owl badges

## Result

Casual hamster now has a complete sleep logging system with:
- Easy modal input
- Sleeping animation
- Energy consequences
- Encouraging feedback
- Strategic gameplay element

Perfect complement to the water drinking feature! 🐹😴✨
