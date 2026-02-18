# Code Migration: Remove `profiles` Table References

## Summary
After dropping the `profiles` table, we need to update 2 files that reference it.

## Files to Update

### 1. `lib/dailyProgress.ts`

**Current Issue**: Creates entries in `profiles` table for foreign key compatibility

**Solution**: Remove the `ensureUserInProfiles` function and its calls since `user_profiles` is the only table now.

**Changes needed**:
- Remove `ensureUserInProfiles()` function (lines 74-123)
- Remove call to `await ensureUserInProfiles(userId);` in `createTodayProgress()` (line 39)
- Update comment on line 37 from "profiles table" to "user_profiles table"

**Why it's safe**: 
- `daily_data` already references `user_profiles`, not `profiles`
- The `ensureUserInProfiles` function was only needed because `daily_progress` referenced `profiles`
- Since we're dropping `daily_progress`, this function is no longer needed

---

### 2. `lib/syncManager.ts`

**Current Issue**: Syncs data to both `user_profiles` AND `profiles` tables

**Solution**: Remove the `profiles` table sync section

**Changes needed**:

**Section 1: Remove profiles sync in `syncAllUserData()` (lines 89-115)**
```typescript
// DELETE THIS ENTIRE SECTION:
// 4. Sync to profiles table
try {
  const { error: profilesError } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      email: user.email,
      buddy_name: userData.buddyName,
      selected_character: userData.selectedCharacter,
      user_name: userData.userName,
      student_level: userData.studentLevel,
      country: userData.country,
      timezone: userData.timezone,
      updated_at: new Date(),
    });

  if (profilesError) {
    console.error('[SyncAll] ❌ profiles table sync error:', profilesError);
  } else {
    console.log('[SyncAll] ✅ profiles synced successfully');
  }
} catch (profilesErr) {
  console.error('[SyncAll] ❌ profiles table exception:', profilesErr);
}
```

**Section 2: Remove profiles load in `loadAllUserData()` (line 141)**
```typescript
// DELETE THIS LINE:
supabase.from('profiles').select('*').eq('id', user.id).single(),
```

**Section 3: Remove profiles ensure in `ensureAllUserProfiles()` (lines 263-285)**
```typescript
// DELETE THIS ENTIRE SECTION:
// 2. Ensure profiles entry exists (for foreign key constraints)
const { data: profile, error: profileError } = await supabase
  .from('profiles')
  .select('id')
  .eq('id', userId)
  .single();

if (profileError || !profile) {
  const { error: createProfileError } = await supabase
    .from('profiles')
    .insert([
      {
        id: userId,
        email: userData.email || null,
        buddy_name: userData.buddyName || 'Quillby',
        selected_character: userData.selectedCharacter || 'casual',
      }
    ]);

  if (createProfileError) {
    console.error('[EnsureProfiles] Failed to create profiles entry:', createProfileError);
  }
}
```

**Why it's safe**:
- All this code was just maintaining duplicate data in `profiles`
- `user_profiles` already has all this data
- Removing this eliminates sync complexity and potential bugs

---

## Testing Checklist

After making these changes, test:

1. ✅ User signup/login still works
2. ✅ User profile data loads correctly
3. ✅ Daily data tracking works
4. ✅ Sync to database works
5. ✅ No console errors about missing tables

---

## Rollback Plan

If issues occur:
1. Restore database from backup (recreate `profiles` table)
2. Revert code changes in the 2 files
3. Investigate the issue

---

## Benefits After Migration

1. ✅ Single source of truth for user profiles
2. ✅ No more sync complexity between two tables
3. ✅ Cleaner, more maintainable code
4. ✅ Faster database operations (one table instead of two)
5. ✅ No risk of data inconsistency between tables

---

## Conclusion

**YES, absolutely do this migration!**

The current setup with two profile tables is:
- ❌ Confusing (which table to use?)
- ❌ Error-prone (data can get out of sync)
- ❌ Inefficient (duplicate writes)
- ❌ Harder to maintain

After migration:
- ✅ Clear and simple
- ✅ One source of truth
- ✅ Better performance
- ✅ Easier to maintain

**Risk Level: LOW** - Only 2 files need updates, changes are straightforward.
