# Weight-Based Meal Tracking System ✅

## Overview
Added smart meal tracking with 3 meals per day and portion sizes based on user's weight goal. Users select their weight goal during onboarding, which determines their meal portion sizes and energy rewards.

## Weight Goals & Portion Sizes

| Weight Goal | Meals/Day | Portion Size | Energy per Meal | Description |
|-------------|-----------|--------------|-----------------|-------------|
| **Lose Weight** | 3 | Small (0.7x) | ~11 Energy | 70% of normal portions |
| **Maintain Weight** | 3 | Normal (1.0x) | ~15 Energy | Standard portions |
| **Gain Weight** | 3 | Large (1.3x) | ~20 Energy | 130% of normal portions |

## Implementation

### 1. Updated Types (core/types.ts)

```typescript
export interface UserData {
  // ... existing fields
  mealsLogged: number; // 0-3 meals per day
  weightGoal?: 'lose' | 'maintain' | 'gain';
  mealPortionSize?: number; // 0.7, 1.0, 1.3
}
```

### 2. Store Updates (state/store.ts)

#### New State Fields
```typescript
userData: {
  // ... existing fields
  mealsLogged: 0,
  weightGoal: 'maintain',
  mealPortionSize: 1.0,
}
```

#### logMeal Function
```typescript
logMeal: () => {
  const { userData } = get();
  
  if (userData.mealsLogged >= 3) {
    console.log('[Meal] Already logged 3 meals today');
    return;
  }
  
  // Calculate energy based on portion size
  const baseEnergy = 15;
  const portionMultiplier = userData.mealPortionSize || 1.0;
  const energyGained = Math.round(baseEnergy * portionMultiplier);
  
  set({
    userData: {
      ...userData,
      mealsLogged: userData.mealsLogged + 1,
      energy: Math.min(userData.energy + energyGained, userData.maxEnergyCap),
      qCoins: userData.qCoins + 8
    }
  });
}
```

#### Updated setProfile Function
```typescript
setProfile: (userName, studentLevel, country, timezone, weightGoal) => {
  // Set portion size based on weight goal
  let portionSize = 1.0; // Default maintain
  if (weightGoal === 'lose') portionSize = 0.7;
  if (weightGoal === 'gain') portionSize = 1.3;
  
  set({
    userData: {
      ...userData,
      weightGoal: weightGoal || 'maintain',
      mealPortionSize: portionSize
    }
  });
}
```

#### Updated resetDay Function
```typescript
resetDay: () => {
  set({
    userData: {
      ...userData,
      mealsLogged: 0, // Reset meals daily
      // ... other daily resets
    }
  });
}
```

### 3. Meal Tracking Hook (hooks/useMealTracking.ts)

```typescript
export const useMealTracking = (buddyName: string) => {
  const { userData, logMeal } = useQuillbyStore();
  const [currentAnimation, setCurrentAnimation] = useState<string>('idle');
  const [message, setMessage] = useState<string>('');
  const [messageTimestamp, setMessageTimestamp] = useState<number>(0);

  const handleLogMeal = () => {
    if (userData.mealsLogged >= 3) {
      setMessage(`Already ate 3 meals today! 🐹\nTry again tomorrow, ${buddyName}!`);
      return;
    }

    // Show eating animation
    setCurrentAnimation('eating');
    setTimeout(() => setCurrentAnimation('idle'), 2000);
    
    // Log meal and show feedback
    logMeal();
    
    const mealNames = ['Breakfast', 'Lunch', 'Dinner'];
    const mealName = mealNames[userData.mealsLogged];
    const energyGained = Math.round(15 * (userData.mealPortionSize || 1.0));
    
    setMessage(`🍽️ ${mealName} logged!\n${getPortionDescription()} portion • +${energyGained} Energy`);
    setMessageTimestamp(Date.now());
  };

  return {
    mealsLogged: userData.mealsLogged,
    weightGoal: userData.weightGoal || 'maintain',
    portionDescription: getPortionDescription(),
    handleLogMeal,
    mealAnimation: currentAnimation,
    mealMessage: message,
    mealMessageTimestamp: messageTimestamp,
  };
};
```

### 4. Meal Button Component (components/MealButton.tsx)

```typescript
interface MealButtonProps {
  mealsLogged: number;
  portionDescription: string; // "Small", "Normal", "Large"
  onPress: () => void;
  disabled?: boolean;
}

export default function MealButton({ mealsLogged, portionDescription, onPress, disabled }) {
  return (
    <TouchableOpacity 
      style={[styles.mealButton, disabled && styles.mealButtonDisabled]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.mealButtonText}>
        🍎 Meal ({mealsLogged}/3)
      </Text>
      <Text style={styles.mealButtonSubtext}>
        {disabled ? 'All done!' : `${portionDescription} portion`}
      </Text>
    </TouchableOpacity>
  );
}
```

### 5. Updated Home Screen (tabs/index.tsx)

#### Three Buttons Layout
```typescript
<View style={styles.buttonsRow}>
  {!isSleeping ? (
    <>
      {/* Water Button */}
      <WaterButton waterGlasses={waterGlasses} onPress={handleDrinkWater} />
      
      {/* Meal Button */}
      <MealButton 
        mealsLogged={mealsLogged}
        portionDescription={portionDescription}
        onPress={handleLogMeal}
        disabled={mealsLogged >= 3}
      />
      
      {/* Sleep Button */}
      <SleepButton isSleeping={false} sleepDisplay={sleepDisplay} onSleep={handleSleepButton} onWakeUp={handleWakeUpButton} />
    </>
  ) : (
    <>
      {/* Wake Button - Full width when sleeping */}
      <SleepButton isSleeping={true} sleepDisplay={sleepDisplay} onSleep={handleSleepButton} onWakeUp={handleWakeUpButton} />
    </>
  )}
</View>
```

#### Message Priority System
```typescript
// Show the most recent message among all features
const messages = [
  { text: waterMessage, timestamp: waterMessageTimestamp },
  { text: sleepMessage, timestamp: sleepMessageTimestamp },
  { text: mealMessage, timestamp: mealMessageTimestamp },
].filter(msg => msg.text);

if (messages.length > 0) {
  const mostRecent = messages.sort((a, b) => b.timestamp - a.timestamp)[0];
  hamsterMessage = mostRecent.text;
}
```

### 6. Onboarding Integration (onboarding/profile.tsx)

#### Weight Goal Selection
```typescript
const [weightGoal, setWeightGoal] = useState<'lose' | 'maintain' | 'gain'>('maintain');

// In form rendering:
<View style={styles.inputCard}>
  <Text style={styles.inputLabel}>Your weight goal</Text>
  <Text style={styles.inputHint}>(Affects meal portion sizes)</Text>
  <View style={styles.weightGoalContainer}>
    <TouchableOpacity
      style={[styles.goalButton, weightGoal === 'lose' && styles.goalButtonSelected]}
      onPress={() => setWeightGoal('lose')}
    >
      <Text style={styles.goalButtonText}>📉 Lose Weight</Text>
      <Text style={styles.goalSubtext}>3 small meals/day</Text>
    </TouchableOpacity>
    
    <TouchableOpacity
      style={[styles.goalButton, weightGoal === 'maintain' && styles.goalButtonSelected]}
      onPress={() => setWeightGoal('maintain')}
    >
      <Text style={styles.goalButtonText}>⚖️ Maintain</Text>
      <Text style={styles.goalSubtext}>3 normal meals/day</Text>
    </TouchableOpacity>
    
    <TouchableOpacity
      style={[styles.goalButton, weightGoal === 'gain' && styles.goalButtonSelected]}
      onPress={() => setWeightGoal('gain')}
    >
      <Text style={styles.goalButtonText}>📈 Gain Weight</Text>
      <Text style={styles.goalSubtext}>3 large meals/day</Text>
    </TouchableOpacity>
  </View>
</View>

// In form submission:
setProfile(userName, studentLevel, country, timezone, weightGoal);
```

## User Experience

### Onboarding Flow
1. User selects weight goal during profile setup
2. System automatically sets portion size multiplier
3. User proceeds to habit setup

### Daily Meal Tracking
1. **Button Display**: Shows "🍎 Meal (X/3)" with portion description
2. **Logging**: Tap to log meal, shows eating animation
3. **Feedback**: Speech bubble shows meal name and energy gained
4. **Progression**: Button updates count and disables at 3 meals

### Visual Feedback

#### Button States
- **Active**: Orange button with portion description
- **Disabled**: Gray button with "All done!" text

#### Speech Bubble Messages
- **Breakfast**: "🍽️ Breakfast logged! Small portion • +11 Energy"
- **Lunch**: "🍽️ Lunch logged! Normal portion • +15 Energy"
- **Dinner**: "🍽️ Dinner logged! Large portion • +20 Energy"
- **Limit Reached**: "Already ate 3 meals today! 🐹 Try again tomorrow!"

## Energy & Rewards System

### Energy Calculation
```typescript
const baseEnergy = 15;
const portionMultiplier = userData.mealPortionSize; // 0.7, 1.0, or 1.3
const energyGained = Math.round(baseEnergy * portionMultiplier);
```

### Rewards per Meal
- **Base Coins**: 8 Q-Coins per meal
- **Energy**: Varies by portion size
  - Lose: ~11 Energy (15 × 0.7)
  - Maintain: ~15 Energy (15 × 1.0)
  - Gain: ~20 Energy (15 × 1.3)

### Daily Totals
| Weight Goal | Total Energy | Total Coins |
|-------------|--------------|-------------|
| Lose | ~33 Energy | 24 Coins |
| Maintain | ~45 Energy | 24 Coins |
| Gain | ~60 Energy | 24 Coins |

## Benefits

### 1. Personalized Nutrition
- Portion sizes match user's weight goals
- Encourages healthy eating habits
- Realistic energy rewards

### 2. Goal-Oriented Design
- Clear connection between goals and portions
- Visual feedback reinforces choices
- Sustainable habit formation

### 3. Balanced Gameplay
- Energy rewards scale with goals
- No punishment for weight goals
- Fair progression for all users

### 4. Educational Value
- Teaches portion control awareness
- Connects nutrition to energy levels
- Promotes mindful eating

## Future Enhancements

### 1. Meal Types
- Track specific meal types (breakfast, lunch, dinner)
- Different energy values per meal type
- Time-based meal suggestions

### 2. Nutrition Quality
- Rate meal healthiness (1-5 stars)
- Bonus rewards for healthy choices
- Penalty for junk food

### 3. Meal Planning
- Suggest meals based on weight goal
- Recipe recommendations
- Shopping list generation

### 4. Progress Tracking
- Weekly meal consistency
- Weight goal progress
- Habit streak tracking

### 5. Social Features
- Share meal achievements
- Meal challenges with friends
- Community recipes

## Testing Scenarios

### Test 1: Weight Goal Selection
1. Go through onboarding
2. Select "Lose Weight" → Check portion size = 0.7
3. Select "Maintain" → Check portion size = 1.0
4. Select "Gain Weight" → Check portion size = 1.3

### Test 2: Meal Logging
1. Tap meal button → Check eating animation
2. Check speech bubble shows correct meal name
3. Check energy gained matches portion size
4. Repeat 3 times → Button should disable

### Test 3: Daily Reset
1. Log 3 meals → Button disabled
2. Wait until midnight (or trigger resetDay)
3. Check mealsLogged = 0, button re-enabled

### Test 4: Message Priority
1. Log meal → Check meal message shows
2. Drink water → Check water message shows (newer)
3. Sleep → Check sleep message shows (newest)

## Conclusion

The weight-based meal tracking system provides personalized nutrition guidance while maintaining engaging gameplay. Users can pursue their weight goals through appropriate portion sizes, with energy rewards that scale accordingly. The system encourages healthy eating habits while providing clear progress feedback! 🍎⚖️✨