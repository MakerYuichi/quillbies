# Mess System Flow Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     User Actions                             │
│  (Study sessions, habits, time passing)                      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  Mess Points Update                          │
│  userData.messPoints increases/decreases                     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              RoomLayers Component                            │
│  Receives messPoints as prop                                 │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Determine Mess Level                            │
│  0-5:   Clean (level 0)                                      │
│  6-10:  Light mess (level 1)                                 │
│  11-20: Medium mess (level 2)                                │
│  21+:   Heavy mess (level 3)                                 │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│           Check Room Configuration                           │
│  - Has theme equipped?                                       │
│  - Has redecor furniture equipped?                           │
│  - Default room?                                             │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
┌──────────┐  ┌──────────┐  ┌──────────┐
│  Theme   │  │ Redecor  │  │ Default  │
│ Equipped │  │ Equipped │  │   Room   │
└────┬─────┘  └────┬─────┘  └────┬─────┘
     │             │             │
     ▼             ▼             ▼
┌──────────┐  ┌──────────┐  ┌──────────┐
│getTheme  │  │getRedecor│  │getRoomWall│
│Background│  │  Asset   │  │getRoomFloor│
└────┬─────┘  └────┬─────┘  └────┬─────┘
     │             │             │
     ▼             ▼             ▼
┌─────────────────────────────────────────────────────────────┐
│              Load Appropriate Asset                          │
│  - If mess > 5: Load messy variant                           │
│  - If mess ≤ 5: Load clean variant                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Render Room Visual                              │
│  Display selected asset to user                              │
└─────────────────────────────────────────────────────────────┘
```

## Asset Selection Logic

### Theme Background Selection
```
hasTheme? ──No──> Show default room (walls + floor)
    │
   Yes
    │
    ▼
messPoints > 5? ──No──> Load clean theme asset
    │                   (assets/shop/{rarity}/themes/{name}.png)
   Yes
    │
    ▼
Calculate mess level:
  6-10:  level = 1
  11-20: level = 2
  21+:   level = 3
    │
    ▼
Load messy theme asset
(assets/rooms/mess/themes/{name}/{name}-messy{level}.png)
```

### Redecor Furniture Selection
```
hasRedecorFurniture? ──No──> Show individual furniture items
    │
   Yes
    │
    ▼
messPoints > 5? ──No──> Load clean redecor asset
    │                   (assets/shop/epic/furniture/{name}.png)
   Yes
    │
    ▼
Calculate mess level:
  6-10:  level = 1
  11-20: level = 2
  21+:   level = 3
    │
    ▼
Load messy redecor asset
(assets/rooms/mess/redecor/{base}/{base}-mess{level}.png)
```

### Default Room Selection
```
No theme AND no redecor
    │
    ▼
messPoints > 5? ──No──> Load clean walls + floor
    │                   (assets/rooms/walls.png)
   Yes                  (assets/rooms/floor.png)
    │
    ▼
Calculate mess level:
  6-10:  level = 1
  11-20: level = 2
  21+:   level = 3
    │
    ▼
Load messy walls + floor
(assets/rooms/mess/walls-messy{level}.png)
(assets/rooms/mess/floor-messy{level}.png)
```

## Component Hierarchy

```
RoomLayers (receives messPoints)
│
├── Theme Background Layer (if theme equipped)
│   └── getThemeBackground() → Returns clean or messy asset
│
├── Redecor Layer (if redecor equipped)
│   └── getRedecorAsset() → Returns clean or messy asset
│
└── Default Room Layers (if no theme/redecor)
    ├── Wall Layer
    │   └── getRoomWall() → Returns clean or messy walls
    └── Floor Layer
        └── getRoomFloor() → Returns clean or messy floor
```

## State Management

```
┌─────────────────────────────────────────────────────────────┐
│                  Zustand Store (useQuillbyStore)             │
│                                                              │
│  userData: {                                                 │
│    messPoints: number,                                       │
│    roomCustomization: {                                      │
│      themeType?: string,                                     │
│      furnitureType?: string,                                 │
│      plantType?: string,                                     │
│      lightType?: string                                      │
│    }                                                         │
│  }                                                           │
└─────────────────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              RoomLayers Component                            │
│  const { userData } = useQuillbyStore();                     │
│  const messPoints = userData.messPoints;                     │
│  const roomCustomization = userData.roomCustomization;       │
└─────────────────────────────────────────────────────────────┘
```

## Mess Point Sources

```
Mess Points Increase:
├── Missed study checkpoints (+5 per checkpoint)
├── Skipped meals (+3 per meal)
├── Low water intake (+2 per day)
├── Insufficient sleep (+4 per night)
└── Time passing without habits (+1 per 6 hours)

Mess Points Decrease:
├── Cleaning action (-10 to -30 based on taps)
├── Completing study sessions (-2 per session)
├── Maintaining good habits (-1 per habit)
└── Daily reset bonus (-5 if all habits met)
```

## Performance Considerations

1. **Asset Preloading**: All mess assets are loaded via `require()` at component initialization
2. **Conditional Rendering**: Only one asset type renders at a time (theme OR redecor OR default)
3. **Memoization**: Asset selection functions run on every render but are lightweight
4. **Image Caching**: React Native automatically caches loaded images

## Future Enhancements

- [ ] Animated transitions between mess levels
- [ ] Particle effects for cleaning actions
- [ ] Sound effects for mess level changes
- [ ] Achievement notifications for keeping room clean
- [ ] Weekly mess statistics
