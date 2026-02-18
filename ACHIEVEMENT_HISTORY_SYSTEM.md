# Achievement History System

## Overview
The Achievement History System stores all achievement unlocks in Supabase, allowing users to view their past accomplishments even after daily/weekly/monthly achievements reset.

## Database Schema

### Table: `achievement_history`
Stores historical records of all achievements unlocked by users.

**Columns:**
- `id` (UUID): Primary key
- `user_id` (UUID): Foreign key to auth.users
- `achievement_id` (TEXT): Achievement identifier (e.g., 'daily-session')
- `achievement_name` (TEXT): Display name of achievement
- `achievement_type` (TEXT): Type - 'daily', 'weekly', 'monthly', or 'secret'
- `unlocked_at` (TIMESTAMP): When the achievement was unlocked
- `period_date` (DATE): The date/period this achievement was earned for
- `gems_earned` (INTEGER): Gems rewarded
- `qbies_earned` (INTEGER): Q-Bies rewarded
- `created_at` (TIMESTAMP): Record creation timestamp

**Indexes:**
- `idx_achievement_history_user_id`: Fast user lookups
- `idx_achievement_history_achievement_id`: Fast achievement lookups
- `idx_achievement_history_period`: Fast period-based queries
- `idx_achievement_history_type`: Fast type-based filtering

**RLS Policies:**
- Users can only view their own achievement history
- Users can insert their own achievement records

## Features

### 1. Automatic History Saving
When an achievement is unlocked, it's automatically saved to the history table with:
- Achievement details (ID, name, type)
- Unlock timestamp
- Period date (for daily/weekly/monthly tracking)
- Rewards earned (gems and Q-Bies)

### 2. Achievement History Modal
A dedicated modal accessible from the Trophy Room that shows:
- **Stats Summary**: Total unlocked, total gems earned, total Q-Bies earned
- **Filter Tabs**: Filter by All, Daily, Weekly, Monthly, or Secret
- **History List**: Chronological list of all achievements with:
  - Achievement icon and name
  - Unlock date
  - Rewards earned
  - Color-coded by type

### 3. Period Tracking
The system tracks which period each achievement was earned for:
- **Daily**: Exact date (e.g., 2026-02-18)
- **Weekly**: Monday of that week (e.g., 2026-02-17 for week starting Monday)
- **Monthly**: First day of month (e.g., 2026-02-01)
- **Secret**: Exact date unlocked

### 4. Reset System
Daily/weekly/monthly achievements reset automatically:
- **Daily**: Reset at midnight every day
- **Weekly**: Reset at midnight every Monday
- **Monthly**: Reset at midnight on the 1st of each month

After reset, users can earn the same achievement again, and each unlock is recorded in history.

## API Functions

### `saveAchievementToHistory()`
Saves an achievement unlock to the history table.

```typescript
await saveAchievementToHistory(
  userId: string,
  achievementId: string,
  achievementName: string,
  achievementType: 'daily' | 'weekly' | 'monthly' | 'secret',
  gemsEarned: number,
  qbiesEarned: number
);
```

### `getAchievementHistory()`
Retrieves achievement history with optional filters.

```typescript
const history = await getAchievementHistory(userId, {
  achievementType?: 'daily' | 'weekly' | 'monthly' | 'secret',
  limit?: number,
  startDate?: Date,
  endDate?: Date
});
```

### `getAchievementStats()`
Gets aggregate statistics about achievements.

```typescript
const stats = await getAchievementStats(userId);
// Returns: totalUnlocked, dailyCount, weeklyCount, monthlyCount, 
//          secretCount, totalGemsEarned, totalQbiesEarned
```

### `getAchievementsForPeriod()`
Gets all achievements for a specific period.

```typescript
const achievements = await getAchievementsForPeriod(
  userId,
  '2026-02-18', // period date
  'daily' // achievement type
);
```

## User Experience

### Viewing History
1. Open Trophy Room (🏆 button in stats or achievements section)
2. Click the 📜 History button in the top right
3. View all past achievements with filters
4. See total stats at the top

### Understanding Repeatable Achievements
- Daily/weekly/monthly achievements can be earned multiple times
- Each time you earn them, they're added to your history
- The Trophy Room shows your current progress
- The History shows all past completions

### Example Flow
1. User completes "Daily Session" achievement on Monday
   - Achievement unlocks in Trophy Room
   - Record saved to history with date 2026-02-17
   - User earns 10 gems and 50 Q-Bies

2. At midnight, daily achievements reset
   - "Daily Session" becomes locked again in Trophy Room
   - History record remains in database

3. User completes "Daily Session" again on Tuesday
   - Achievement unlocks again in Trophy Room
   - New record saved to history with date 2026-02-18
   - User earns another 10 gems and 50 Q-Bies

4. User views history
   - Sees both Monday and Tuesday completions
   - Total shows 2 daily achievements, 20 gems, 100 Q-Bies

## Files Created/Modified

### New Files
- `DATABASE_ACHIEVEMENT_HISTORY.sql`: Database schema
- `lib/achievementHistory.ts`: API functions for history operations
- `app/components/modals/AchievementHistoryModal.tsx`: History viewing UI

### Modified Files
- `app/state/slices/achievementsSlice.ts`: Added reset functions and history saving
- `app/state/slices/userSlice.ts`: Added weekly/monthly reset logic
- `app/components/modals/AchievementsModal.tsx`: Added history button and modal

## Setup Instructions

1. Run the SQL migration:
   ```sql
   -- Execute DATABASE_ACHIEVEMENT_HISTORY.sql in Supabase SQL editor
   ```

2. The system will automatically:
   - Save achievements to history when unlocked
   - Reset daily achievements at midnight
   - Reset weekly achievements on Mondays
   - Reset monthly achievements on the 1st

3. Users can access history via the 📜 button in the Trophy Room

## Benefits

1. **Motivation**: Users can see their progress over time
2. **Accountability**: Historical record of all accomplishments
3. **Rewards Tracking**: See total gems and Q-Bies earned from achievements
4. **Repeatability**: Daily/weekly/monthly challenges stay fresh
5. **Analytics**: Data for future features (streaks, trends, etc.)
