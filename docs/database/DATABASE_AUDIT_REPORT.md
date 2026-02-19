# Database Schema Audit Report

## Issues Found

### 1. CRITICAL: Duplicate User Profile Tables
**Problem**: Two separate user profile tables exist with overlapping data
- `profiles` - Minimal profile (buddy_name, selected_character, user_name, etc.)
- `user_profiles` - Full profile (all fields from profiles + energy, coins, goals, etc.)

**Impact**: 
- Data inconsistency risk
- Confusion about which table to use
- Duplicate foreign key references

**Recommendation**: 
- **CONSOLIDATE** into single `user_profiles` table
- Migrate all data from `profiles` to `user_profiles`
- Drop `profiles` table
- Update all foreign keys to reference `user_profiles`

---

### 2. Inconsistent Foreign Key References
**Problem**: Different tables reference different user profile tables

**Tables referencing `user_profiles`:**
- `daily_data`
- `deadlines`
- `focus_sessions`
- `purchased_items`
- `sleep_sessions`

**Tables referencing `profiles`:**
- `daily_progress`

**Recommendation**: 
- Standardize ALL foreign keys to reference `user_profiles(id)`
- Update `daily_progress` foreign key constraint

---

### 3. Duplicate Daily Tracking Tables
**Problem**: Two tables track similar daily data
- `daily_data` - Tracks: study_minutes, water, meals, exercise, consumables
- `daily_progress` - Tracks: energy, coins, mess, water, meals, exercise, study_minutes

**Overlapping Fields:**
- `study_minutes_today` (both)
- `water_glasses` (both)
- `meals_logged` (both)
- `exercise_minutes` (both)
- `missed_checkpoints` (both)
- `ate_breakfast` (both)

**Impact**:
- Data duplication
- Sync issues between tables
- Confusion about source of truth

**Recommendation**:
- **CONSOLIDATE** into single `daily_data` table
- Add missing fields from `daily_progress` (energy, q_coins, mess_points, current_streak)
- Drop `daily_progress` table
- Update all queries to use `daily_data`

---

### 4. Inconsistent Column Naming: Q-Bies/Coins
**Problem**: Currency is named inconsistently across tables

**Variations found:**
- `q_coins` in `user_profiles`
- `q_coins` in `daily_progress`
- `coins_earned` in `sleep_sessions`

**Recommendation**:
- Standardize to `q_coins` everywhere (matches app terminology "Q-Bies")
- Rename `sleep_sessions.coins_earned` → `q_coins_earned`

---

### 5. Inconsistent Timestamp Types
**Problem**: Mix of `timestamp with time zone` and `timestamp without time zone`

**With timezone:**
- `achievement_history.unlocked_at`
- `achievement_history.created_at`
- `calendar_day_notes.created_at`
- `profiles.created_at`
- `device_onboarding.created_at`

**Without timezone:**
- `deadlines.due_date`
- `deadlines.created_at`
- `focus_sessions.start_time`
- `sleep_sessions.start_time`
- `user_profiles.created_at`

**Recommendation**:
- **STANDARDIZE** to `timestamp with time zone` for ALL timestamps
- This prevents timezone-related bugs
- Especially important for multi-timezone users

---

### 6. Inconsistent ID Generation
**Problem**: Mix of `uuid_generate_v4()` and `gen_random_uuid()`

**Using `uuid_generate_v4()`:**
- `achievement_history`
- `calendar_day_notes`

**Using `gen_random_uuid()`:**
- `daily_data`
- `daily_progress`
- `deadlines`
- `device_onboarding`
- `focus_sessions`
- `purchased_items`
- `sleep_sessions`

**Recommendation**:
- **STANDARDIZE** to `gen_random_uuid()` (PostgreSQL built-in, no extension needed)
- `uuid_generate_v4()` requires `uuid-ossp` extension

---

### 7. Missing Indexes
**Problem**: Some frequently queried columns lack indexes

**Missing indexes:**
- `daily_data.user_id` - Should have index (frequently queried)
- `daily_data.date_tracked` - Should have composite index with user_id
- `deadlines.user_id` + `is_completed` - Composite index for filtering
- `deadlines.due_date` - Index for date-based queries
- `focus_sessions.user_id` + `is_completed` - Composite index
- `sleep_sessions.user_id` + `date_assigned` - Composite index

**Recommendation**:
- Add indexes for performance optimization

---

### 8. Inconsistent Default Values
**Problem**: Similar fields have different defaults

**Examples:**
- `buddy_name`: 'Quillby' in `profiles`, 'Hammy' in `user_profiles`
- `energy`: No default in `profiles`, 100 in `user_profiles`

**Recommendation**:
- After consolidation, ensure consistent defaults
- Use 'Quillby' as standard buddy name

---

### 9. Redundant Constraints
**Problem**: Some constraints are duplicated or unnecessary

**Examples:**
- `user_profiles.id` has both PRIMARY KEY and FOREIGN KEY to auth.users
- `profiles.id` has same pattern

**Recommendation**:
- Keep both (this is correct pattern for user tables)
- No action needed

---

### 10. Missing Cascade Deletes
**Problem**: Some foreign keys don't specify ON DELETE behavior

**Tables without cascade:**
- `daily_data` → `user_profiles`
- `deadlines` → `user_profiles`
- `focus_sessions` → `user_profiles`, `deadlines`
- `purchased_items` → `user_profiles`, `shop_items`
- `sleep_sessions` → `user_profiles`

**Recommendation**:
- Add `ON DELETE CASCADE` to all user_id foreign keys
- This ensures data cleanup when users are deleted

---

## Summary of Critical Issues

### Priority 1 (Must Fix):
1. ✅ Consolidate `profiles` and `user_profiles` into single table
2. ✅ Consolidate `daily_data` and `daily_progress` into single table
3. ✅ Standardize all foreign keys to reference `user_profiles`

### Priority 2 (Should Fix):
4. ✅ Standardize timestamp types to `with time zone`
5. ✅ Standardize UUID generation to `gen_random_uuid()`
6. ✅ Rename `coins_earned` to `q_coins_earned` for consistency

### Priority 3 (Nice to Have):
7. ✅ Add missing indexes for performance
8. ✅ Add CASCADE deletes to foreign keys
9. ✅ Fix buddy_name default inconsistency

---

## Recommended Migration Plan

### Step 1: Consolidate User Profiles
```sql
-- Migrate any unique data from profiles to user_profiles
-- (Most fields already exist in user_profiles)

-- Drop profiles table
DROP TABLE IF EXISTS profiles CASCADE;
```

### Step 2: Consolidate Daily Tracking
```sql
-- Add missing fields to daily_data
ALTER TABLE daily_data
ADD COLUMN IF NOT EXISTS energy integer DEFAULT 100,
ADD COLUMN IF NOT EXISTS q_coins integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS mess_points numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_streak integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_check_in_date date;

-- Migrate data from daily_progress if needed
-- Then drop daily_progress
DROP TABLE IF EXISTS daily_progress CASCADE;
```

### Step 3: Standardize Naming
```sql
-- Rename coins_earned to q_coins_earned
ALTER TABLE sleep_sessions
RENAME COLUMN coins_earned TO q_coins_earned;
```

### Step 4: Add Indexes
```sql
CREATE INDEX IF NOT EXISTS idx_daily_data_user_date 
  ON daily_data(user_id, date_tracked DESC);

CREATE INDEX IF NOT EXISTS idx_deadlines_user_completed 
  ON deadlines(user_id, is_completed);

CREATE INDEX IF NOT EXISTS idx_deadlines_due_date 
  ON deadlines(due_date);

CREATE INDEX IF NOT EXISTS idx_focus_sessions_user_completed 
  ON focus_sessions(user_id, is_completed);

CREATE INDEX IF NOT EXISTS idx_sleep_sessions_user_date 
  ON sleep_sessions(user_id, date_assigned DESC);
```

### Step 5: Add Cascade Deletes
```sql
-- Update foreign key constraints to include CASCADE
-- (Requires dropping and recreating constraints)
```

---

## Current State vs Desired State

### Current Issues:
- 2 user profile tables (profiles, user_profiles)
- 2 daily tracking tables (daily_data, daily_progress)
- Inconsistent foreign key references
- Mixed timestamp types
- Mixed UUID generation methods
- Missing performance indexes

### Desired State:
- 1 user profile table (user_profiles)
- 1 daily tracking table (daily_data)
- All foreign keys reference user_profiles
- All timestamps with timezone
- All UUIDs use gen_random_uuid()
- Proper indexes on frequently queried columns
- Cascade deletes for data cleanup

---

## Impact Assessment

### Breaking Changes:
- Code referencing `profiles` table must be updated
- Code referencing `daily_progress` table must be updated
- Foreign key constraint names will change

### Non-Breaking Changes:
- Adding indexes (improves performance)
- Standardizing UUID generation (internal only)
- Adding cascade deletes (improves data cleanup)

### Estimated Migration Time:
- Database changes: 30 minutes
- Code updates: 1-2 hours
- Testing: 1 hour
- **Total: 2-3 hours**

---

## Conclusion

The database has several inconsistencies that should be addressed:
1. **Duplicate tables** causing confusion and potential data sync issues
2. **Inconsistent naming** making code harder to maintain
3. **Missing indexes** potentially causing performance issues
4. **Mixed standards** (timestamps, UUIDs) reducing code quality

**Recommendation**: Implement the migration plan in a staging environment first, then apply to production after thorough testing.
