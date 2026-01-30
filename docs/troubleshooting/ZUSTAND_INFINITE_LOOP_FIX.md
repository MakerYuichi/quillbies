# Zustand Infinite Loop Fix

## 🚨 Problem
The app was experiencing infinite re-renders with this error:
```
ERROR: Maximum update depth exceeded. This can happen when a component repeatedly calls setState inside componentWillUpdate or componentDidUpdate.
```

## 🔍 Root Cause
The issue was in `habit-setup.tsx` with this Zustand selector:

```tsx
// ❌ WRONG - Creates new object on every render
const { setHabits, setWeightGoal } = useQuillbyStore((state) => ({ 
  setHabits: state.setHabits, 
  setWeightGoal: state.setWeightGoal 
}));
```

**Why this causes infinite loops:**
- The selector function returns a new object `{}` on every render
- Zustand thinks the state changed because the object reference is different
- This triggers a re-render, which creates another new object
- Infinite loop ensues

## ✅ Solution
Split the selector into separate calls:

```tsx
// ✅ CORRECT - Each selector returns the same function reference
const setHabits = useQuillbyStore((state) => state.setHabits);
const setWeightGoal = useQuillbyStore((state) => state.setWeightGoal);
```

**Why this works:**
- Each selector returns the same function reference from the store
- No new objects created on each render
- Zustand correctly identifies that nothing changed
- No infinite re-renders

## 🛡️ Prevention Rules

### ✅ Good Zustand Patterns:
```tsx
// Single value selectors
const userData = useQuillbyStore((state) => state.userData);
const setHabits = useQuillbyStore((state) => state.setHabits);

// Multiple separate selectors
const energy = useQuillbyStore((state) => state.userData.energy);
const coins = useQuillbyStore((state) => state.userData.qCoins);
```

### ❌ Avoid These Patterns:
```tsx
// Creates new object every render
const { userData, setHabits } = useQuillbyStore((state) => ({
  userData: state.userData,
  setHabits: state.setHabits
}));

// Creates new array every render
const [energy, coins] = useQuillbyStore((state) => [
  state.userData.energy,
  state.userData.qCoins
]);
```

## 🎯 Key Takeaway
When using Zustand selectors, avoid creating new objects or arrays in the selector function. Always return primitive values or existing object references from the store to prevent infinite re-renders.

## ✅ Status
Fixed in `habit-setup.tsx` - app should now load without infinite loop errors.