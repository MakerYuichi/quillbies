# Quillby - Your 24/7 Accountability Companion

A React Native mobile app that uses psychological triggers and gamification to motivate behavior change through a digital companion.

## 🎯 What Is This?

Quillby is a complete accountability system that tracks your daily habits (sleep, meals, water, focus sessions) and reflects them in a living digital companion. The app uses precise mathematical formulas to create an emotional feedback loop that motivates real behavior change.

## 📁 Project Structure

```
quillby-app/
├── app/
│   ├── core/
│   │   ├── engine.ts          ⭐ All math formulas (200 lines)
│   │   └── types.ts           TypeScript interfaces
│   ├── state/
│   │   └── store.ts           Zustand state management (200 lines)
│   ├── components/
│   │   ├── EnergyBar.tsx      Energy visualization
│   │   ├── FocusMeter.tsx     Focus score display
│   │   ├── QuillbyPet.tsx     Animated companion
│   │   └── RoomBackground.tsx Room state visuals
│   ├── _layout.tsx            Navigation setup (Expo Router)
│   ├── index.tsx              Home screen (main hub)
│   └── study-session.tsx      Focus timer screen
├── assets/                    App icons and images
└── package.json
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- iOS Simulator (Mac) or Android Emulator
- Expo Go app (for testing on real device)

### Installation

```bash
cd quillby-app
npm install
```

### Run the App

**iOS Simulator (Mac only):**
```bash
npm run ios
```

**Android Emulator:**
```bash
npm run android
```

**On Your Phone (Recommended):**
```bash
npm start
# Scan QR code with Expo Go app
```

## 🎮 How It Works

### The Core Loop

```
Good Habits → High Energy → Productive Sessions → Rewards → Clean Room
     ↑                                                           ↓
     └────────────── Motivation to Maintain ────────────────────┘
```

### The Math Engine

All formulas are in `app/core/engine.ts`:

**Energy System:**
- Base Max: 100
- Drain: 5%/min (inactive) or 2%/min (distracted)
- Recharge: 20%/sec (active)
- Cap Modifiers:
  - Sleep <6h: -30%
  - No breakfast: -20%
  - Water <5 glasses: -15%
  - Streak 3+ days: +10%

**Focus System:**
- Start Cost: 20 energy
- Gain: +1 point per 30 seconds focused
- Drain: -5% per minute distracted

**Rewards:**
- Q-Coins: Focus Score × 0.5
- XP: Focus Score × 1
- Water: +5 coins per glass (max 8)

**Mess System:**
- +1 per skipped task
- -2 per completed session
- >10 mess = halved energy recharge

## 📱 Features

### Home Screen (`app/index.tsx`)
- Quillby pet with 4 expressions based on energy
- Energy bar (color-coded: green → yellow → red)
- Room background (changes with mess level)
- Habit logging (sleep, breakfast, water)
- Q-Coin counter
- Stats display

### Study Session Screen (`app/study-session.tsx`)
- Full-screen focus mode
- Live focus score and timer
- Distraction detection (AppState monitoring)
- Estimated rewards preview
- Distraction counter

### Real-Time Updates
- Energy updates every second
- Focus score updates every second
- Visual feedback instant

## 🧪 Testing the Core Loop

### 5-Minute Validation

1. **Test Energy System**
   - Open app → See 100 energy
   - Wait 1 minute → Energy drops to ~95
   - Return → Energy recharges

2. **Test Habit Impact**
   - Log sleep (5 hours) → Max cap drops to 70
   - Log breakfast → Max cap increases to 90
   - Log water 5x → Max cap back to 100

3. **Test Focus Session**
   - Start session → Energy drops by 20
   - Focus for 30 seconds → Score increases by 1
   - Leave app → Distraction warning
   - End session → Earn Q-Coins

4. **Test Consequences**
   - Skip task 5x → Room gets messy
   - Complete session → Room gets cleaner

### 7-Day Real Test

Use the app with real habits for a week:
- Log actual sleep hours each morning
- Log real breakfast and water intake
- Do real study/work sessions
- Track emotional engagement

**Success Criteria:**
- [ ] You open it daily without reminders
- [ ] You feel emotion when Quillby is tired
- [ ] You modify habits to help him
- [ ] You want more features

## 🔧 Tuning the Math

All constants are in `app/core/engine.ts` lines 6-24.

**Energy drains too fast?**
```typescript
const ENERGY_DRAIN_INACTIVE = 3;  // was 5
```

**Focus too hard to gain?**
```typescript
// Line 118 - change divisor
const pointsGained = Math.floor(secondsFocused / 20) * FOCUS_GAIN_RATE;
// was 30, now 20
```

**Rewards feel stingy?**
```typescript
const QCOIN_MULTIPLIER = 0.75;  // was 0.5
```

## 🏗️ Architecture

### State Management (Zustand)

The app uses Zustand for global state management. All game logic is in `app/state/store.ts`.

**Key Actions:**
- `updateEnergy()` - Runs every second, handles drain/recharge
- `startFocusSession()` - Deducts 20 energy, creates session
- `endFocusSession()` - Calculates rewards, updates stats
- `updateFocusDuringSession()` - Updates focus score every second
- `handleDistraction()` - Drains focus when user leaves app
- `logWater()`, `logBreakfast()`, `logSleep()` - Habit tracking

### Navigation (Expo Router)

The app uses Expo Router for file-based routing:
- `app/_layout.tsx` - Root layout with Stack navigator
- `app/index.tsx` - Home screen (route: `/`)
- `app/study-session.tsx` - Study screen (route: `/study-session`)

### Components

All components are pure and receive props from the store:
- `QuillbyPet` - Shows expression based on energy
- `EnergyBar` - Visual progress bar
- `FocusMeter` - Score and timer display
- `RoomBackground` - Changes color/visuals based on mess

## 📊 The Psychological Engine

### Positive Reinforcement
- Good habits → Higher energy cap
- Productive sessions → Q-Coins and XP
- Clean room → Visual satisfaction

### Negative Consequences
- Bad habits → Lower energy cap
- Skipped tasks → Messy room
- Low energy → Can't focus

### Recovery Path (Critical!)
- One bad day is recoverable
- Can still do one session even with low cap
- Mess cleans up gradually
- Prevents frustration and uninstall

## 🎨 Visual Feedback

### Quillby Expressions
- 70-100% energy: (◕‿◕) "I'm ready to focus!"
- 40-70% energy: (・_・) "Let's do this together"
- 20-40% energy: (╥_╥) "I'm getting tired..."
- 0-20% energy: (×_×) "I need rest..."

### Room States
- 0-3 mess: ✨ Spotless (green)
- 4-7 mess: 📚 Messy (yellow)
- 8-10 mess: 🗑️ Dirty (orange)
- 11+ mess: 🕸️ Disaster (red)

### Energy Bar Colors
- >60%: Green (healthy)
- 30-60%: Yellow (caution)
- <30%: Red (critical)

## 🚫 What's NOT Built (Yet)

This is a core mechanics prototype. Intentionally excluded:
- User accounts / Backend
- Customization (outfits, room decor)
- Social features (friends, study groups)
- Push notifications
- Onboarding flow
- Analytics dashboard
- Monthly events
- Premium features

**Why?** First prove the core loop is addictive. Then add polish.

## 📈 Next Steps

### If the loop feels addictive:
1. Add Firebase backend
2. Build customization system
3. Implement push notifications
4. Create onboarding flow
5. Add social features
6. Launch beta

### If the loop feels flat:
1. Tune the numbers in `app/core/engine.ts`
2. Test for another week
3. Iterate until it feels right

## 🛠️ Tech Stack

- **Framework:** React Native + Expo
- **Language:** TypeScript
- **State Management:** Zustand
- **Navigation:** Expo Router
- **Platform:** iOS, Android, Web

## 📝 Key Files to Understand

1. **`app/core/engine.ts`** ⭐⭐⭐ - All the math (most important)
2. **`app/state/store.ts`** ⭐⭐ - Game logic and actions
3. **`app/index.tsx`** ⭐ - Main interface
4. **`app/_layout.tsx`** ⭐ - Navigation setup

## 🎯 Success Metrics

After 7 days, you should be able to answer:

**Emotional Engagement:**
- Do you feel attached to Quillby?
- Does seeing him tired motivate you?
- Does the messy room create responsibility?

**Behavior Change:**
- Did you modify real habits?
- Did you open the app 3x per day?
- Did you complete more focus sessions?

**Retention Potential:**
- Would you use this for a month?
- Would you recommend to a friend?
- Would you pay $6/month for premium?

---

**Built with:** React Native, Expo, TypeScript, Zustand  
**Design Philosophy:** Math-driven emotional engagement  
**Goal:** Validate if the psychological engine creates real behavior change

Put this on your phone. Use it for a week. The data will tell you if it works. 🚀
