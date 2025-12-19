# 🔋 Simplified Energy System - Implementation Complete

## Overview
The energy system has been updated to match the simplified version. Energy is gained through positive actions and only decreases when you spend it on focus sessions or through distraction during sessions.

## Core Changes

### Energy Cap
- **ALWAYS 100** - Never changes regardless of habits or room mess
- No more complex penalty calculations
- Consistent maximum energy across all scenarios

### Smart Energy Cost for Focus Sessions
- **Base Cost**: 20 energy
- **Preparation Bonuses** (reduce energy needed):
  - Ate Breakfast: -5 energy
  - Exercised Today: -5 energy  
  - Well Hydrated (4+ glasses): -5 energy
  - Good Sleep (7+ hours): -5 energy
- **Perfect Preparation**: Can focus with 0 energy needed!

### Morning Energy (Based on Sleep Quality)
- **7+ hours sleep**: Start day with 100 energy
- **5-7 hours sleep**: Start day with 85 energy
- **4-5 hours sleep**: Start day with 50 energy
- **<4 hours sleep**: Start day with 30 energy

### Energy Gains (Immediate)
- **Water**: +5 energy per glass (max 8 glasses = +40 energy total)
- **Breakfast**: +10 energy (once per day)
- **Meals**: +10 energy each (lunch, dinner)
- **Exercise**: +15 energy per session
- **Cleaning**: +5 energy per mess point removed

### Energy Costs
- **Starting Focus Session**: 0-20 energy (based on preparation)
- **Distraction During Focus**: Varies by preparation level
  - Poor prep: -2 energy/min when distracted
  - Good prep: -0.5 energy/min when distracted

### NO Automatic Drains
- Energy does NOT drain automatically over time
- Energy only decreases when:
  1. You start a focus session (pay the cost)
  2. You get distracted during a focus session
- Bad habits (no breakfast, low water, room mess) make focus sessions MORE EXPENSIVE, but don't drain energy passively

## Updated Files
- `quillby-app/app/core/engine.ts` - New energy calculation functions
- `quillby-app/app/state/store.ts` - Updated energy management (removed automatic drains)
- `quillby-app/app/(tabs)/focus.tsx` - Smart energy cost display
- `quillby-app/app/(tabs)/index.tsx` - Updated focus button

## User Experience
- Energy cap always shows 100/100
- Focus button shows actual energy cost (0-20 based on preparation)
- Better preparation = lower energy cost to focus
- Sleep quality determines morning energy
- Energy only goes down when you use it, not passively
- Logging water/meals/exercise immediately increases energy