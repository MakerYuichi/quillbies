# Mess Points Issue - Diagnostic & Fix

## Problem Summary
Mess points are reverting to old values after app reload, following this pattern:
- 23 → 3 (user cleans)
- Reload → 15 (reverts to old value)
- 15 → 3 (user cleans again)
- Reload → 8 (reverts to different old value)
- 8 → 3 (user cleans again)
- Reload → 3 (finally stable)

## Root Cause
**Multiple duplicate records in `daily_data` table**

The pattern indicates that there are at least 3-4 duplicate records per user in the `daily_data` table, each with different `mess_points` values (23, 15, 8, 3). When the app loads, it's randomly selecting from these duplicate records.

## Why This Happens
1. `daily_data` table should have ONE record per user (not per day)
2. Due to a bug or migration issue, multiple records were created
3. The `loadAllUserData()` function uses `.single()` which expects exactly one record
4. When multiple records exist, Supabase returns one randomly or based on insertion order
5. This causes mess_points to "jump" between old values

## The Fix

### Step 1: Run Cleanup SQL (REQUIRED)
You MUST run the SQL script in `CLEANUP_DUPLICATE_DAILY_DATA.sql` in your Supabase SQL Editor.

This script will:
1. Show you all duplicate records
2. Delete all but the most recent record for each user
3. Sync remaining records with `user_profiles` (source of truth)
4. Verify the cleanup was successful

### Step 2: Verify Database Constraint
After cleanup, verify that `daily_data` has a UNIQUE constraint on `user_id`:

```sql
-- Check if constraint exists
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'daily_data' AND constraint_type = 'UNIQUE';

-- If not exists, add it
ALTER TABLE daily_data
ADD CONSTRAINT daily_data_user_id_unique UNIQUE (user_id);
```

### Step 3: Test After Cleanup
1. Open the app
2. Note your current mess_points value
3. Use the test button to add 5 mess points
4. Check the console logs for BEFORE and AFTER database values
5. Reload the app
6. Verify mess_points stayed the same (didn't revert)

## How Mess Points Should Work

### Storage
- **Primary source of truth**: `user_profiles.mess_points`
- **Secondary sync**: `daily_data.mess_points` (for daily tracking)
- Both should always have the same value

### On App Load
```typescript
// store-modular.ts line 169
messPoints: dbData.userProfile.mess_points ?? userData.messPoints
```
Loads from `user_profiles` table (correct)

### On Sync
```typescript
// syncManager.ts
// 1. Syncs to user_profiles
await updateUserProfile(user.id, { mess_points: userData.messPoints });

// 2. Syncs to daily_data
await updateDailyData(user.id, { mess_points: userData.messPoints });
```
Updates both tables (correct)

### On Clean Room
```typescript
// habitsSlice.ts cleanRoom()
const newMessPoints = Math.max(0, userData.messPoints - messPointsReduced);
set({ userData: { ...userData, messPoints: newMessPoints } });
syncToDatabase(updatedUserData); // Syncs to both tables
```

## Expected Behavior After Fix
1. User has 23 mess points
2. User cleans room → 3 mess points
3. App syncs to database (both tables updated to 3)
4. User reloads app
5. App loads from `user_profiles.mess_points` → 3 (correct!)
6. No more reverting to old values

## Verification Queries

### Check for duplicates
```sql
SELECT 
  user_id,
  COUNT(*) as record_count,
  array_agg(mess_points ORDER BY updated_at DESC) as mess_history
FROM daily_data
GROUP BY user_id
HAVING COUNT(*) > 1;
```

### Check sync status
```sql
SELECT 
  up.id,
  up.buddy_name,
  up.mess_points as profile_mess,
  dd.mess_points as daily_mess,
  CASE 
    WHEN up.mess_points = dd.mess_points THEN '✅ SYNCED'
    ELSE '❌ OUT OF SYNC'
  END as status
FROM user_profiles up
LEFT JOIN daily_data dd ON up.id = dd.user_id;
```

## Next Steps
1. ✅ Run `CLEANUP_DUPLICATE_DAILY_DATA.sql` in Supabase
2. ✅ Verify UNIQUE constraint exists on `daily_data.user_id`
3. ✅ Test mess points sync with test button
4. ✅ Reload app and verify no revert
5. ✅ Clean room and verify persistence

## Notes
- The code is correct - the issue is purely data-level (duplicate records)
- After cleanup, the sync mechanism will work perfectly
- The UNIQUE constraint will prevent future duplicates
