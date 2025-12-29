# Foreign Key Constraint Fixes

## Issues Fixed

The main problem was that the sync operations were trying to update/create records in tables that had foreign key constraints to user profiles that didn't exist yet.

### 🔧 **Root Cause**
- User authentication created a user ID in Supabase Auth
- But no corresponding entries in `user_profiles` or `profiles` tables
- When sync tried to create `daily_data` or `daily_progress` records, foreign key constraints failed

### ✅ **Solutions Implemented**

#### 1. **Enhanced `updateUserProfile` Function**
- Now automatically creates user profile if it doesn't exist during update
- Handles the "0 rows" error (PGRST116) gracefully
- Creates profile with sensible defaults

#### 2. **Enhanced `dailyData.ts`**
- Added `ensureUserProfileExists` function
- Creates user profile before creating daily data records
- Prevents foreign key constraint violations

#### 3. **Enhanced `syncManager.ts`**
- Added `ensureAllUserProfiles` function that runs FIRST
- Creates entries in both `user_profiles` and `profiles` tables
- Ensures all foreign key dependencies are satisfied before any sync operations

#### 4. **Simplified `deviceAuth.ts`**
- Removed duplicate profile creation logic
- Now just handles authentication
- Profile creation is handled by sync manager when needed

### 🎯 **Execution Order (Fixed)**

1. **Authentication** → Creates user in Supabase Auth
2. **First Sync Operation** → Triggers `ensureAllUserProfiles`
3. **Profile Creation** → Creates entries in `user_profiles` and `profiles`
4. **Data Sync** → All subsequent operations work (foreign keys satisfied)

### 📊 **Expected Behavior Now**

1. **New User Flow:**
   ```
   Auth → First Sync → Profile Creation → Data Sync ✅
   ```

2. **Existing User Flow:**
   ```
   Auth → Profile Check (exists) → Data Sync ✅
   ```

3. **Error Handling:**
   - If profile creation fails → Sync stops gracefully
   - If individual table sync fails → Other tables continue
   - App continues working offline

### 🔍 **Logs to Watch For**

**Success:**
```
[EnsureProfiles] Ensuring user profiles exist in all tables...
[EnsureProfiles] ✅ user_profiles created
[EnsureProfiles] ✅ profiles created
[SyncAll] ✅ User profiles ensured in all tables
[SyncAll] ✅ user_profiles synced successfully
[SyncAll] ✅ daily_data synced successfully
[SyncAll] ✅ daily_progress synced successfully
```

**No More Errors:**
- ❌ `Cannot coerce the result to a single JSON object`
- ❌ `Key is not present in table "user_profiles"`
- ❌ `violates foreign key constraint`

### 🧪 **Testing**

1. **Fresh Install:** Should create all profiles automatically
2. **Focus Session:** Should sync completely without foreign key errors
3. **Daily Actions:** Water, meals, etc. should sync to both tables
4. **App Restart:** Should load data from database successfully

The foreign key constraint issues should now be completely resolved! 🎉