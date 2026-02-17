# Stats Screen - Conditional Activity Cards Fix

## Changes Made

### Problem
All activity cards (Study, Sleep, Hydration, Meals, Exercise) were showing in the stats screen regardless of which habits the user enabled during onboarding.

### Solution
Added conditional rendering to only show activity cards for habits that are enabled in `userData.enabledHabits`.

## Implementation

### Conditional Rendering Logic

Each activity card now checks if its corresponding habit is enabled:

```typescript
{userData.enabledHabits?.includes('sleep') && (
  <ActivityCard ... />
)}
```

### Habit Mapping

| Card | Habit Key | Always Shown? |
|------|-----------|---------------|
| Study Time | N/A | ✅ Yes (core feature) |
| Sleep | `'sleep'` | ❌ Only if enabled |
| Hydration | `'hydration'` | ❌ Only if enabled |
| Meals | `'meals'` | ❌ Only if enabled |
| Exercise | `'exercise'` | ❌ Only if enabled |

### Code Structure

```typescript
// Study is always shown (core feature)
<ActivityCard title="Study Time" ... />

// Sleep - conditional
{userData.enabledHabits?.includes('sleep') && (
  <ActivityCard title="Sleep" ... />
)}

// Hydration - conditional
{userData.enabledHabits?.includes('hydration') && (
  <ActivityCard title="Hydration" ... />
)}

// Meals - conditional
{userData.enabledHabits?.includes('meals') && (
  <ActivityCard title="Meals" ... />
)}

// Exercise - conditional
{userData.enabledHabits?.includes('exercise') && (
  <ActivityCard title="Exercise" ... />
)}
```

## Additional Fixes

### 1. Total Study Time Format
Fixed the "Total Study Time" display to show in "Xh Ym" format instead of decimal hours:

**Before**: `2.5` (hours as decimal)
**After**: `2h 30m` (formatted time)

**Change**:
```typescript
// Before
<Text>{formatStudyTime(stats.totalStudyHours * 60)}</Text>

// After
<Text>{formatStudyTime(Math.round(stats.totalStudyHours * 60))}</Text>
```

### 2. Premium Section Styles
Added missing styles for the collapsible premium section:
- `premiumHeaderContent`: Container for title and badge
- `expandIcon`: Expand/collapse arrow icon
- `premiumContent`: Content area for graphs

### 3. Style Adjustments
- Removed `marginBottom` from `premiumHeader` (now handled by TouchableOpacity)
- Removed `marginBottom` from `cardTitle` (spacing handled by parent)
- Made premium badge smaller and more compact

## How It Works

### During Onboarding
User selects which habits to track in the goal setup screen. These are stored in `userData.enabledHabits` as an array:

```typescript
enabledHabits: ['study', 'sleep', 'hydration', 'meals', 'exercise']
```

### In Stats Screen
The stats screen checks this array and only renders cards for enabled habits:

```typescript
// If user only enabled sleep and hydration:
enabledHabits: ['sleep', 'hydration']

// Stats screen will show:
// ✅ Study Time (always shown)
// ✅ Sleep (enabled)
// ✅ Hydration (enabled)
// ❌ Meals (not enabled - hidden)
// ❌ Exercise (not enabled - hidden)
```

## Testing

### Test Cases

1. **All habits enabled**:
   - Should show all 5 cards (Study, Sleep, Hydration, Meals, Exercise)

2. **Only sleep and hydration enabled**:
   - Should show 3 cards (Study, Sleep, Hydration)
   - Should NOT show Meals or Exercise

3. **No optional habits enabled**:
   - Should show only Study card
   - Should NOT show any other cards

4. **enabledHabits is undefined**:
   - Should show only Study card (safe fallback with `?.includes()`)

### How to Test

1. Go to Settings → Goals
2. Enable/disable different habits
3. Navigate to Stats screen
4. Verify only enabled habit cards are shown
5. Study card should always be visible

## Database Sync

The `enabledHabits` field is synced to Supabase in the `user_profiles` table:

```sql
SELECT enabled_habits FROM user_profiles WHERE id = 'YOUR_USER_ID';
-- Expected: ["sleep", "hydration", "meals", "exercise"]
```

## Benefits

1. **Cleaner UI**: Users only see stats for habits they care about
2. **Less clutter**: No empty or irrelevant cards
3. **Better UX**: Focused on user's selected goals
4. **Consistent**: Matches the habits shown in home screen and settings

## Files Modified

- `quillby-app/app/(tabs)/stats.tsx` - Added conditional rendering for all activity cards

## Summary

The stats screen now respects the user's habit preferences from onboarding. Only enabled habits show their activity cards, making the stats screen cleaner and more personalized. Study time is always shown as it's the core feature of the app.
