# Mess Points Calculation Fix

## Problem
Mess points were showing as 0 even though the user had only studied 20 minutes out of a 3-hour (180 minutes) goal.

## Root Cause
The app had two ways to add mess points:
1. ✅ Missing checkpoints during focus sessions (WORKING)
2. ❌ Daily calculation for unmet study goals (MISSING)

## Solution Implemented
Added daily mess points calculation in `app/state/slices/userSlice.ts` in the `resetDay()` function.

### Calculation Logic
```typescript
// Calculate study deficit
const studyDeficit = Math.max(0, studyGoal - studyHours);

// Add 2 mess points per hour of unmet study goal
const messPointsToAdd = studyDeficit * 2;
const newMessPoints = userData.messPoints + messPointsToAdd;
```

### Example
- Study goal: 3 hours (180 minutes)
- Studied: 20 minutes (0.33 hours)
- Deficit: 2.67 hours
- Mess points added: 2.67 × 2 = **5.3 mess points**

## Data Flow
1. User studies during the day → `studyMinutesToday` tracked
2. At midnight (or app restart next day) → `resetDay()` is called
3. Calculate study deficit → Add mess points
4. Sync to Supabase → `mess_points` field in `user_profiles` table
5. Stats screen displays → Shows current mess points from database

## Database Fields
- `user_profiles.mess_points` - Total accumulated mess points
- `daily_data.missed_checkpoints` - Checkpoints missed during focus sessions
- `daily_data.study_minutes_today` - Minutes studied today

## Testing Steps
1. Check current mess points in stats screen
2. Study less than your daily goal
3. Wait for day to reset (midnight or restart app next day)
4. Check mess points again - should have increased
5. Check console logs for: `[Daily] 🧹 Adding X mess points for unmet study goal`

## Verification Queries
To check if data is being saved to Supabase:

```sql
-- Check user's current mess points
SELECT id, buddy_name, mess_points, q_coins, current_streak 
FROM user_profiles 
WHERE id = 'YOUR_USER_ID';

-- Check today's study progress
SELECT * FROM daily_data 
WHERE user_id = 'YOUR_USER_ID' 
AND date_tracked = CURRENT_DATE;

-- Check missed checkpoints
SELECT missed_checkpoints, study_minutes_today 
FROM daily_data 
WHERE user_id = 'YOUR_USER_ID' 
ORDER BY date_tracked DESC 
LIMIT 7;
```

## Stats Screen Updates
The stats screen now correctly displays:
- ✅ Mess Points (instead of "Room Status")
- ✅ Colorful activity cards with correct hamster assets
- ✅ Flip functionality to see detailed stats
- ✅ Premium weekly trends graph
- ✅ Calendar with month navigation based on signup date

## Next Steps
1. Test the daily reset to verify mess points accumulate
2. Verify Supabase sync is working (check console logs)
3. Test checkpoint system during focus sessions
4. Verify mess points display updates in stats screen
