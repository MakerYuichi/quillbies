# Settings Persistence Test Guide

## How to Test if Settings Are Persisting

### Test Procedure

1. **Open the app** and go to Settings

2. **Change ONE setting** (e.g., change hamster style to "Formal")

3. **WAIT 20 SECONDS** (important! Sync is throttled to 15 seconds)
   - Look at console logs for: `[Sync] Background sync completed`
   - Should also see: `[SyncAll] ✅ user_profiles synced successfully`

4. **Close the app completely** (force quit, don't just minimize)

5. **Reopen the app**
   - Look for: `[Load] Loading comprehensive user data from database...`
   - Should see: `[Load] ✅ Database data merged successfully`

6. **Check if the setting persisted**

### Common Issues

#### Issue 1: Testing Too Fast
**Problem**: Changing settings and immediately restarting app
**Solution**: Wait 20 seconds after making changes before restarting

**Why**: Sync is throttled to prevent excessive database writes:
```typescript
const SYNC_THROTTLE_MS = 15000; // Only sync every 15 seconds max
```

#### Issue 2: No Database Connection
**Problem**: App is offline or database is unreachable
**Solution**: Check console for errors like:
- `[Sync] No authenticated user, skipping database sync`
- `[Load] No authenticated user, using local data only`
- Database connection errors

#### Issue 3: Sync Failed Silently
**Problem**: Sync attempted but failed
**Solution**: Look for error logs:
- `[SyncAll] ❌ user_profiles sync failed:`
- `[Sync] Background sync failed:`

### Console Log Checklist

When changing a setting, you should see:

```
✅ [Sync] Starting database sync...
✅ [SyncAll] Starting comprehensive sync...
✅ [SyncAll] ✅ User profiles ensured in all tables
✅ [SyncAll] ✅ user_profiles synced successfully
✅ [SyncAll] ✅ daily_data synced successfully
✅ [SyncAll] ✅ daily_progress synced successfully
✅ [SyncAll] ✅ profiles synced successfully
✅ [Sync] Background sync completed
```

When restarting the app, you should see:

```
✅ [App] Loading data from database...
✅ [Load] Starting database load...
✅ [Load] Loading comprehensive user data from database...
✅ [Load] Comprehensive user data loaded from database
✅ [Load] Merging database data with local state...
✅ [Load] ✅ Database data merged successfully
✅ [App] Database data loaded
```

### What Each Setting Should Do

| Setting | Function Called | Syncs to DB? | Loads from DB? |
|---------|----------------|--------------|----------------|
| Hamster Style | `setCharacter()` | ✅ YES (FIXED) | ✅ YES |
| Buddy Name | `setBuddyName()` | ✅ YES | ✅ YES |
| Habits | `setHabits()` | ✅ YES | ✅ YES |
| Study Goal | `setStudyGoal()` | ✅ YES | ✅ YES |
| Exercise Goal | `setExerciseGoal()` | ✅ YES | ✅ YES |
| Hydration Goal | `setHydrationGoal()` | ✅ YES | ✅ YES |
| Sleep Goal | `setSleepGoal()` | ✅ YES | ✅ YES |
| Profile Info | `setProfile()` | ✅ YES | ✅ YES |

### Advanced Debugging

If settings still don't persist after following the test procedure:

1. **Check Supabase Dashboard**
   - Go to Table Editor → `user_profiles`
   - Find your user row
   - Verify the columns are being updated when you change settings

2. **Check for RLS Issues**
   - Go to Authentication → Policies
   - Ensure `user_profiles` table has UPDATE policy enabled
   - Policy should allow users to update their own row

3. **Check Network Tab**
   - Open React Native Debugger
   - Watch for Supabase API calls
   - Should see POST/PATCH requests to `user_profiles`

4. **Force Fresh Load**
   - Clear app data completely
   - Re-onboard
   - This forces a fresh database load

### Expected Timeline

```
T+0s:  User changes setting
T+0s:  Setting updated in local state (immediate)
T+0s:  syncToDatabase() called
T+0-15s: Sync throttled (waits up to 15 seconds)
T+15s: Actual database sync happens
T+16s: Sync completes
T+20s: Safe to restart app
```

### Quick Test Script

1. Change hamster to "Formal"
2. Wait 20 seconds
3. Restart app
4. Hamster should still be "Formal"

If this works, all settings persistence is working correctly!
