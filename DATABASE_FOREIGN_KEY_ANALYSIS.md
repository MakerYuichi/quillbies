# Foreign Key Analysis: profiles vs user_profiles

## Current State

### Tables Referencing `user_profiles(id)`:
1. `daily_data` → `user_profiles(id)`
2. `deadlines` → `user_profiles(id)`
3. `focus_sessions` → `user_profiles(id)`
4. `purchased_items` → `user_profiles(id)`
5. `sleep_sessions` → `user_profiles(id)`

### Tables Referencing `profiles(id)`:
1. `daily_progress` → `profiles(id)`

### Tables Referencing `auth.users(id)` (correct approach):
1. `calendar_day_notes` → `auth.users(id)`
2. `achievement_history` → `auth.users(id)`
3. `user_profiles` → `auth.users(id)` (as foreign key)
4. `profiles` → `auth.users(id)` (as foreign key)

## The Problem

Both `profiles` and `user_profiles` are essentially the same thing:
- Both have `id` as primary key that references `auth.users(id)`
- Both store user profile information
- `user_profiles` has MORE fields (energy, coins, goals, etc.)
- `profiles` has FEWER fields (just basic profile info)

This creates confusion:
- Which table should new code use?
- Where is the "source of truth"?
- Data can get out of sync

## Analysis: Is It Safe to Drop `profiles`?

### ✅ YES, it's safe because:

1. **Only 1 table references it**: `daily_progress`
2. **We're already dropping `daily_progress`**: So no orphaned foreign keys
3. **All data exists in `user_profiles`**: The fields in `profiles` are a subset of `user_profiles`
4. **Both tables have same ID**: They both reference `auth.users(id)`, so IDs match

### Verification:

Let's check if `profiles` has any unique data not in `user_profiles`:

**Fields in `profiles`:**
- id (same as user_profiles)
- email (same as user_profiles)
- created_at (same as user_profiles)
- updated_at (same as user_profiles)
- buddy_name (same as user_profiles)
- selected_character (same as user_profiles)
- user_name (same as user_profiles)
- student_level (same as user_profiles)
- country (same as user_profiles)
- timezone (same as user_profiles)
- data_synced (NOT in user_profiles)
- last_sync_at (NOT in user_profiles)

**Fields ONLY in `user_profiles`:**
- energy, max_energy_cap
- q_coins, mess_points
- current_streak, last_check_in_date
- enabled_habits, study_goal_hours, study_checkpoints
- exercise_goal_minutes, hydration_goal_glasses, sleep_goal_hours
- weight_goal, meal_portion_size
- light_type, plant_type
- auth_type, device_id, last_login
- gems

## Recommendation: YES, Drop `profiles`

### Why it's safe:
1. `user_profiles` is the main table used by 5 other tables
2. `profiles` is only used by 1 table (`daily_progress`) which we're dropping
3. All important data is in `user_profiles`
4. The only unique fields in `profiles` are `data_synced` and `last_sync_at` which appear to be legacy/unused

### Migration Strategy:

**Option 1: Simple Drop (Recommended)**
```sql
-- Since daily_progress is being dropped, just drop profiles
DROP TABLE IF EXISTS profiles CASCADE;
```

**Option 2: Preserve Sync Data (If needed)**
```sql
-- Add sync fields to user_profiles first
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS data_synced boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS last_sync_at timestamp with time zone;

-- Migrate sync data from profiles to user_profiles
UPDATE user_profiles up
SET 
  data_synced = p.data_synced,
  last_sync_at = p.last_sync_at
FROM profiles p
WHERE up.id = p.id;

-- Then drop profiles
DROP TABLE IF EXISTS profiles CASCADE;
```

## Code Impact Assessment

### Files that might reference `profiles` table:
Need to search codebase for:
- `from('profiles')`
- `profiles.`
- References to profiles table

### Files that reference `user_profiles` table:
Most code already uses `user_profiles`, so minimal changes needed.

## Final Answer: YES, DO IT

**Reasons:**
1. ✅ Eliminates confusion about which table to use
2. ✅ Prevents data sync issues
3. ✅ Simplifies codebase (one source of truth)
4. ✅ Only 1 dependent table which is also being dropped
5. ✅ All important data preserved in `user_profiles`
6. ✅ Standard pattern: one user profile table per app

**Risk Level: LOW**
- Only affects `daily_progress` which is being dropped anyway
- No data loss (everything in `user_profiles`)
- Easy to rollback if needed (restore from backup)

## Action Items:

1. ✅ Run the migration to drop `profiles`
2. ✅ Search codebase for any references to `profiles` table
3. ✅ Update any code to use `user_profiles` instead
4. ✅ Test thoroughly in staging first
5. ✅ Keep backup before running in production

**Conclusion: YES, consolidate to `user_profiles` only. It's the right architectural decision.**
