# Exercise Environment - Outdoor Setting

## 🌳 Dynamic Environment Switching

### Concept
When the user starts exercising, the environment changes from the indoor room to an outdoor setting with sky and grass, creating an immersive exercise experience.

## 🎨 Environment Assets

### Required Assets
```
/assets/exercise/
├── sky.png          (Blue sky with clouds - replaces walls.png)
└── grass.png        (Green grass floor - replaces floor.png)
```

### Asset Specifications
- **sky.png**: Same dimensions as walls.png (covers top portion of screen)
- **grass.png**: Same dimensions as floor.png (covers bottom floor area)

## 🔧 Implementation

### ExerciseEnvironment Component
```tsx
// components/ExerciseEnvironment.tsx
export default function ExerciseEnvironment({ pointerEvents = 'auto' }) {
  return (
    <View pointerEvents={pointerEvents}>
      {/* Sky Background */}
      <Image 
        source={require('../../assets/exercise/sky.png')}
        style={styles.skyLayer}
        resizeMode="cover"
      />
      
      {/* Grass Floor */}
      <Image 
        source={require('../../assets/exercise/grass.png')}
        style={styles.grassLayer}
        resizeMode="cover"
      />
    </View>
  );
}
```

### Dynamic Environment Switching
```tsx
// HomeScreen - Conditional rendering based on exercise state
{isExercising ? (
  <ExerciseEnvironment pointerEvents="none" />
) : (
  <RoomLayers pointerEvents="none" />
)}
```

## 📐 Layout Positioning

### Sky Layer (Replaces Walls)
```tsx
skyLayer: {
  position: 'absolute',
  width: SCREEN_WIDTH,
  height: (SCREEN_HEIGHT * 590) / 852,
  top: -8,
  left: 0,
}
```

### Grass Layer (Replaces Floor)
```tsx
grassLayer: {
  position: 'absolute',
  width: (SCREEN_WIDTH * 518) / 393,
  height: (SCREEN_HEIGHT * 336) / 852,
  left: (SCREEN_WIDTH * -90) / 393,
  top: (SCREEN_HEIGHT * 239) / 852,
}
```

## 🎯 User Experience Flow

### Starting Exercise
1. User taps "🏃 Exercise" button
2. **Environment instantly switches** from room to outdoor
3. Sky replaces walls
4. Grass replaces floor
5. Hamster starts jumping animation on grass
6. Speech bubble shows exercise message

### During Exercise
- **Sky background**: Creates open, outdoor feeling
- **Grass floor**: Hamster appears to be exercising outside
- **Jumping animation**: Hamster bounces on grass
- **Timer running**: Duration tracked in background

### Finishing Exercise
1. User taps "✅ Finish" button
2. Duration calculated and rewards given
3. **Environment switches back** to indoor room
4. Walls and floor return
5. Hamster returns to normal idle state

## 🎨 Visual Comparison

### Indoor Room (Normal State)
```
┌─────────────────────────────────┐
│ Walls (brown/beige)             │
│ ┌─────────────────────────────┐ │
│ │ Shelf, Clock decorations    │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Hamster (idle/sitting)      │ │
│ └─────────────────────────────┘ │
│                                 │
│ Floor (brown/tan)               │
└─────────────────────────────────┘
```

### Outdoor Exercise (Exercising State)
```
┌─────────────────────────────────┐
│ Sky (blue with clouds)          │
│ ☁️        ☁️         ☁️         │
│                                 │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Hamster (jumping GIF)       │ │
│ └─────────────────────────────┘ │
│                                 │
│ Grass (green)                   │
│ 🌱🌱🌱🌱🌱🌱🌱🌱🌱🌱🌱🌱🌱🌱🌱    │
└─────────────────────────────────┘
```

## ✅ Benefits

### Immersive Experience
- **Visual Feedback**: Clear indication that exercise mode is active
- **Mood Enhancement**: Outdoor setting feels refreshing and energizing
- **Context Switching**: Helps user mentally transition to exercise mode

### Technical Advantages
- **Simple Implementation**: Just swap two image layers
- **No New Logic**: Uses existing component structure
- **Smooth Transition**: Instant environment change
- **Consistent Positioning**: Same layout coordinates as room

### User Engagement
- **Novel Experience**: Different environment keeps app interesting
- **Motivation**: Outdoor setting encourages physical activity
- **Clear State**: User always knows when they're in exercise mode

## 🔄 State Management

### Environment State Logic
```tsx
// Determined by isExercising boolean
isExercising === true  → Show ExerciseEnvironment (sky + grass)
isExercising === false → Show RoomLayers (walls + floor)
```

### Automatic Switching
- **Start Exercise**: `handleStartExercise()` → `isExercising = true` → Environment switches
- **Finish Exercise**: `handleFinishExercise()` → `isExercising = false` → Environment switches back

## 🎮 Integration with Existing Systems

### Character Animation
- Hamster jumping animation works on both environments
- No changes needed to animation system
- Jumping looks natural on grass floor

### UI Elements
- Speech bubble remains visible
- Energy bar stays in place
- Exercise button changes to "Finish" button
- All UI elements work identically in both environments

### Message System
- Exercise messages display normally
- Speech bubble shows exercise feedback
- Message priority system unchanged

This dynamic environment switching creates an immersive, engaging exercise experience that motivates users to stay active while maintaining all existing functionality!