# Components Structure

This directory contains all React components organized into logical categories for better maintainability and development experience.

## Directory Structure

```
components/
├── character/          # Character-related components
│   ├── HamsterCharacter.tsx
│   ├── QuillbyPet.tsx
│   ├── SpeechBubble.tsx
│   └── index.ts
├── games/              # Interactive game components
│   ├── CleaningGameScreen.tsx
│   ├── ExerciseEnvironment.tsx
│   └── index.ts
├── habits/             # Habit tracking action buttons
│   ├── CleanButton.tsx
│   ├── ExerciseButton.tsx
│   ├── MealButton.tsx
│   ├── SleepButton.tsx
│   ├── WaterButton.tsx
│   └── index.ts
├── modals/             # Modal dialog components
│   ├── CreateDeadlineModal.tsx
│   ├── DeadlineDetailModal.tsx
│   ├── SessionCustomizationModal.tsx
│   └── index.ts
├── progress/           # Progress tracking displays
│   ├── EnergyBar.tsx
│   ├── FocusMeter.tsx
│   ├── StudyProgress.tsx
│   └── index.ts
├── room/               # Room environment components
│   ├── RoomBackground.tsx
│   ├── RoomLayers.tsx
│   └── index.ts
├── ui/                 # Reusable UI components
│   ├── CustomDatePicker.tsx
│   ├── CustomTimePicker.tsx
│   ├── DeadlineDetail.tsx
│   ├── NotificationBanner.tsx
│   ├── RealTimeClock.tsx
│   └── index.ts
└── index.ts            # Main export file
```

## Usage

### Import from main components index
```typescript
import { 
  HamsterCharacter, 
  QuillbyPet, 
  EnergyBar, 
  StudyProgress,
  CleanButton,
  CreateDeadlineModal 
} from '../components';
```

### Import from specific category
```typescript
import { HamsterCharacter, QuillbyPet } from '../components/character';
import { EnergyBar, StudyProgress } from '../components/progress';
```

## Categories

### Character Components
Components related to the pet character display and interactions.

### Game Components  
Interactive game screens and environments for activities like cleaning and exercise.

### Habit Components
Action buttons for different habit tracking (sleep, exercise, meals, water, cleaning).

### Modal Components
Dialog and modal components for user interactions and forms.

### Progress Components
Components that display progress bars, meters, and tracking information.

### Room Components
Components related to the room environment and visual layers.

### UI Components
Reusable utility components like pickers, clocks, and notifications.

## Benefits

1. **Better Organization**: Components are grouped by functionality
2. **Easier Navigation**: Find components faster by category
3. **Cleaner Imports**: Use barrel exports for simpler import statements
4. **Maintainability**: Easier to maintain and refactor related components
5. **Scalability**: Easy to add new components to appropriate categories