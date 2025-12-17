# Visual Consequences & Cleaning System

## Overview
Room visual states change based on mess points, with energy cap penalties and a cleaning mini-game to restore cleanliness.

## Features

### 1. Room Visual States
- **Clean Room (0-5 mess)**: Uses existing `walls.png` - pristine condition
- **Light Mess (6-10 mess)**: `wall_messy1.png` - slight clutter and dust
- **Medium Mess (11-20 mess)**: `wall_messy2.png` - noticeable disorder
- **Heavy Mess (21+ mess)**: `wall_messy3.png` - very messy, cluttered room

### 2. Energy Cap Penalties
Mess points directly reduce maximum energy capacity:
- **0-5 mess**: No penalty (100 energy cap)
- **6-10 mess**: -5 energy cap (95 max)
- **11-15 mess**: -10 energy cap (90 max)
- **16-20 mess**: -15 energy cap (85 max)
- **21-25 mess**: -20 energy cap (80 max)
- **26-30 mess**: -25 energy cap (75 max)
- **31+ mess**: -30 energy cap (70 max minimum)

### 3. Clean Button System
- **Visibility**: Only appears when mess points > 5
- **Dynamic Text**: 
  - 6-10 mess: "🧹 Tidy Up"
  - 11-20 mess: "🧽 Clean Room"
  - 21+ mess: "🚿 Deep Clean"
- **Color Coding**: Yellow → Orange → Red based on mess level

### 4. Cleaning Mini-Game
**Game Mechanics:**
- **Tap-based**: User taps to clean different stages
- **Progressive Stages**: 
  - Light cleaning: 2 stages (8 taps each)
  - Medium cleaning: 3 stages (12 taps each)
  - Deep cleaning: 4 stages (15 taps each)
- **Stage Names**: Sweeping → Scrubbing → Washing → Polishing

**Rewards:**
- **Mess Reduction**: 
  - Light cleaning: Up to 6 mess points removed
  - Medium cleaning: Up to 12 mess points removed
  - Deep cleaning: Up to 18 mess points removed
- **Energy Restoration**: +10 energy per mess point cleaned
- **Coin Rewards**: +5 coins per mess point cleaned

### 5. Mess Point Sources
- **Missed Study Checkpoints**: +5 mess points each
- **Skipped Tasks**: +1 mess point each (existing system)
- **Focus Session Completion**: -2 mess points (existing system)

## Technical Implementation

### Components
- `RoomLayers.tsx` - Updated to accept `messPoints` prop and show appropriate wall
- `CleanButton.tsx` - Conditional button with dynamic styling
- `CleaningGameScreen.tsx` - Modal mini-game with tap mechanics
- Updated home screen integration

### Store Actions
- `getMessEnergyCapPenalty()` - Calculate energy cap reduction
- `cleanRoom(messPointsReduced)` - Process cleaning rewards
- `addMissedCheckpoint()` - Add mess and recalculate energy cap
- Updated `calculateMaxEnergyCap()` in engine to include mess penalties

### Visual Assets Needed
Create these room background variants:
- `assets/rooms/wall_messy1.png` - Light mess state
- `assets/rooms/wall_messy2.png` - Medium mess state  
- `assets/rooms/wall_messy3.png` - Heavy mess state

## User Experience Flow

### Normal Progression
1. User starts with clean room (0 mess points)
2. Missing study checkpoints adds mess points
3. Room visually becomes messier, energy cap decreases
4. Clean button appears when mess > 5
5. User plays cleaning mini-game to restore room
6. Energy cap and visual state improve

### Cleaning Game Flow
1. User taps clean button → modal opens
2. Game shows current mess level and required stages
3. User taps repeatedly to complete each cleaning stage
4. Progress bar shows completion for current stage
5. Game completes → mess points reduced, rewards given
6. Room visual state and energy cap automatically update

### Motivation Loop
- **Consequence**: Missed checkpoints → messy room → lower energy cap
- **Solution**: Cleaning mini-game → restored room → full energy cap
- **Reward**: Energy restoration + coins for cleaning effort
- **Prevention**: Stay on study schedule to avoid mess accumulation

## Integration Points
- **Study Accountability**: Missed checkpoints trigger mess accumulation
- **Energy System**: Mess directly impacts maximum energy capacity
- **Room Visuals**: Seamless integration with existing room layer system
- **Habit Buttons**: Clean button appears alongside other habit actions
- **Reward System**: Cleaning provides tangible energy and coin benefits

## Future Enhancements
- **Mess Accumulation Over Time**: Gradual mess buildup if no cleaning
- **Different Mess Types**: Study mess vs general mess with different cleaning methods
- **Cleaning Streaks**: Bonus rewards for consistent room maintenance
- **Room Decorations**: Unlockable room themes based on cleanliness streaks