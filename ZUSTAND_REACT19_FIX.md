# Zustand + React 19 Compatibility Fix

## Problem
The app was experiencing infinite loading screens and "Cannot read property 'stale' of undefined" errors in production builds. This was caused by incompatibility between Zustand 4.x and React 19.

## Root Cause
1. **Zustand 4.5.5 + React 19 incompatibility**: Zustand 4.x was not fully compatible with React 19's new `useSyncExternalStore` implementation
2. **use-sync-external-store shim conflict**: The shim package was conflicting with React 19's built-in implementation
3. **Incorrect storage wrapper**: Using a custom storage wrapper instead of direct AsyncStorage

## Solutions Applied

### 1. Upgraded Zustand to v5
```json
"zustand": "^5.0.11"  // was "^4.5.5"
```
Zustand 5.x has full React 19 support and uses React's built-in `useSyncExternalStore`.

**Key Benefits:**
- Native React 19 compatibility
- Destructuring pattern now works (but selectors still recommended for performance)
- Better TypeScript support
- `useShallow` hook for optimized multi-value destructuring

### 2. Removed use-sync-external-store Shim
Removed the `use-sync-external-store` package from dependencies as React 19 has it built-in.

### 3. Fixed Store Import Pattern
Changed from wrapper function to direct AsyncStorage import:

```typescript
// Before
import { createStorage } from './utils/storageUtils';
storage: createStorage(),

// After
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage } from 'zustand/middleware';
storage: createJSONStorage(() => AsyncStorage),
```

### 4. Fixed Store Usage Pattern (Zustand 5)
Updated critical files to use selector functions for best performance:

```typescript
// ❌ Zustand 4 - Caused "stale" error with React 19
const { userData, deadlines } = useQuillbyStore();

// ✅ Zustand 5 Option 1 - Individual selectors (best performance)
const userData = useQuillbyStore((state) => state.userData);
const deadlines = useQuillbyStore((state) => state.deadlines);

// ✅ Zustand 5 Option 2 - useShallow for multiple values
import { useShallow } from 'zustand/react/shallow';
const { userData, deadlines } = useQuillbyStore(
  useShallow((state) => ({ userData: state.userData, deadlines: state.deadlines }))
);

// ⚠️ Zustand 5 Option 3 - Direct destructuring (works but may cause extra re-renders)
const { userData, deadlines } = useQuillbyStore();
```

### 5. Fixed Critical Files
- ✅ `app/(tabs)/index.tsx` - Changed from `useQuillbyStore((state) => state)` to individual selectors
- ✅ `app/(tabs)/_layout.tsx` - Using correct selector pattern
- ✅ `app/(tabs)/focus.tsx` - Using individual selectors
- ✅ `app/(tabs)/shop.tsx` - Using individual selectors
- ✅ `app/(tabs)/stats.tsx` - Using individual selectors
- ✅ `app/(tabs)/settings.tsx` - Using individual selectors
- ✅ `app/study-session.tsx` - Using individual selectors
- ✅ `app/_layout.tsx` - Using safe fallback pattern

### 6. Added _styles Folder Exclusion
Added explicit exclusion for the `_styles` folder in tab navigation to prevent it from appearing as a tab:

```typescript
<Tabs.Screen
  name="_styles"
  options={{
    href: null, // Explicitly hide this from tabs
  }}
/>
```

## Testing
1. Build compiles successfully with `npx expo run:android`
2. No TypeScript errors
3. Store initialization is now React 19 compatible

## Remaining Work
Other files can optionally be updated to use selectors for better performance (see `FIX_ZUSTAND_PATTERN.md`), but they should work with Zustand 5's destructuring support.

## Installation Steps
```bash
cd quillby-app
rm -rf node_modules package-lock.json
npm install
npx expo run:android
```

## Key Takeaways
1. Zustand 5.x is required for React 19 compatibility
2. Selector functions provide best performance: `const x = useStore((state) => state.x)`
3. `useShallow` can be used for optimized multi-value destructuring
4. Direct destructuring works in Zustand 5 but may cause unnecessary re-renders
5. Don't use the `use-sync-external-store` shim with React 19
6. Use direct AsyncStorage import with `createJSONStorage`

## Zustand 4 vs 5 Differences

### Zustand 4
- ❌ Destructuring caused "stale" errors with React 19
- ✅ Must use selectors

### Zustand 5
- ✅ Destructuring works
- ✅ Selectors still recommended for performance
- ✅ `useShallow` for optimized multi-value selection
- ✅ Full React 19 support
