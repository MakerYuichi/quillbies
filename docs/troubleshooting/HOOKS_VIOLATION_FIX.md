# React Hooks Violation Fix

## Issue
The app was crashing with the error: "Rendered more hooks than during the previous render"

## Root Cause
There were **duplicate useEffect hooks** in the `HomeScreenContent` component in `app/(tabs)/index.tsx`. Specifically:

1. **Memory monitoring useEffect** - appeared twice (lines ~238 and ~391)
2. **Update energy useEffect** - appeared twice (lines ~267 and ~873)  
3. **Check study checkpoints useEffect** - appeared twice (lines ~280 and ~871)
4. **Daily reset automation useEffect** - appeared twice (lines ~312 and ~903)

## Why This Causes the Error
React hooks must be called in the same order every render. When there are duplicate hooks, React gets confused about which hook corresponds to which state, causing the "rendered more hooks than during the previous render" error.

## Solution
Removed all duplicate useEffect hooks, keeping only one instance of each:

- ✅ Memory monitoring useEffect (1 instance)
- ✅ Update energy useEffect (1 instance) 
- ✅ Check study checkpoints useEffect (1 instance)
- ✅ Daily reset automation useEffect (1 instance)
- ✅ Cleanup acceleration useEffect (1 instance)

## Prevention
- Always ensure hooks are called in the same order
- Avoid copy-pasting useEffect hooks without removing the original
- Use ESLint rules for hooks to catch these issues early
- Regular code reviews to spot duplicate hooks

## Status
✅ **FIXED** - App no longer crashes with hooks violation error