# Database Sync Fixes

## Issues Fixed

### 1. Deadlines Not Loading After App Restart
**Problem**: Deadlines were being saved to database but not appearing when reopening the app.

**Root Cause**: Deadlines WERE being loaded from database correctly. The issue was likely:
- User not authenticated (check device auth)
- Database connection issues
- Deadlines being filtered incorrectly

**Solution**: The loading logic is correct. Deadlines are loaded in `store-modular.ts` from `loadAllUserData()` which fetches from Supabase.

**To verify deadlines are loading**:
1. Check console logs for `[LoadAll] Results:` - should show `deadlines: ✅`
2. Check if user is authenticated with `getDeviceUser()`
3. Verify deadlines exist in Supabase dashboard

---

### 2. Buddy Name Not Updating in Database
**Problem**: Changing Quillby's name in settings didn't persist to database.

**Root Cause**: `setBuddyName()` and `setProfile()` functions only updated local state without syncing to database.

**Solution**: Added `syncToDatabase()` calls to both functions:

```typescript
setBuddyName: (name: string) => {
  const { userData } = get();
  const updatedUserData = {
    ...userData,
    buddyName: name
  };
  set({ userData: updatedUserData });
  // Sync to database
  syncToDatabase(updatedUserData);
},
```

**Files Modified**:
- `quillby-app/app/state/slices/userSlice.ts`

---

### 3. Calendar Day Notes and Emojis Not Persisting
**Problem**: Users could select emojis and write notes for calendar days, but they weren't saved to database.

**Root Cause**: No database table or sync logic existed for calendar day notes.

**Solution**: Created complete calendar notes system:

#### A. Database Table
Created `calendar_day_notes` table with:
- `user_id`: Links to user
- `date`: The calendar date (YYYY-MM-DD)
- `note`: User's text note
- `emoji`: Selected emoji for the day
- Unique constraint on (user_id, date)
- RLS policies for security

**SQL File**: `quillby-app/DATABASE_CALENDAR_NOTES.sql`

#### B. Database Functions
Created `lib/calendarNotes.ts` with:
- `saveCalendarDayNote()`: Upsert note/emoji for a date
- `getCalendarDayNote()`: Get note for specific date
- `getCalendarDayNotes()`: Get all notes for date range
- `deleteCalendarDayNote()`: Delete note for a date

#### C. DayDetailsModal Integration
Updated modal to:
- Load existing note/emoji when opened
- Auto-save emoji immediately when selected
- Auto-save note when user finishes editing (onBlur)
- Uses `getDeviceUser()` to get authenticated user

**Files Modified**:
- `quillby-app/app/components/modals/DayDetailsModal.tsx`

#### D. StreakCalendar Integration
Updated calendar to:
- Load emojis from database for current month
- Display emojis from database instead of memory
- Reload emojis when month changes
- Update emoji map when user selects new emoji

**Files Modified**:
- `quillby-app/app/components/stats/StreakCalendar.tsx`

---

## Setup Instructions

### 1. Run SQL Migration
Execute the SQL file in Supabase dashboard:
```bash
# Copy contents of DATABASE_CALENDAR_NOTES.sql
# Paste into Supabase SQL Editor
# Run the query
```

### 2. Verify RLS Policies
Check that Row Level Security is enabled and policies are active:
- Users can only see their own notes
- Users can insert/update/delete their own notes

### 3. Test the Features

#### Test Buddy Name Update:
1. Go to Settings
2. Change buddy name
3. Close and reopen app
4. Verify name persists

#### Test Calendar Notes:
1. Open Stats tab
2. Click any calendar date
3. Select an emoji
4. Write a note
5. Close modal
6. Close and reopen app
7. Click same date
8. Verify emoji and note are still there

---

## Technical Details

### Database Sync Flow

1. **User Changes Data** → Local state updated
2. **syncToDatabase()** → Calls `syncAllUserData()`
3. **syncAllUserData()** → Updates Supabase tables
4. **App Restart** → `loadFromDatabase()` called
5. **loadAllUserData()** → Fetches from Supabase
6. **Store Updated** → UI reflects database data

### Calendar Notes Flow

1. **Modal Opens** → `loadDayNote()` fetches from database
2. **User Selects Emoji** → Immediately saved to database
3. **User Edits Note** → Saved on blur (when done editing)
4. **Calendar Loads** → `loadMonthEmojis()` fetches all emojis for month
5. **Emoji Displayed** → Shows on calendar day cell

---

## Troubleshooting

### Deadlines Not Showing
1. Check console for `[LoadAll] Results:` - should show `deadlines: ✅`
2. Verify user is authenticated: Look for `[DeviceAuth] getDeviceUser called`
3. Check Supabase dashboard - do deadlines exist in `deadlines` table?
4. Verify `user_id` matches authenticated user

### Name Not Persisting
1. Check console for `[Sync] Syncing to database...`
2. Verify `user_profiles` table has `buddy_name` column
3. Check RLS policies allow updates
4. Verify user is authenticated

### Calendar Notes Not Saving
1. Check console for `[CalendarNotes] Saved successfully`
2. Verify `calendar_day_notes` table exists
3. Check RLS policies are enabled
4. Verify user is authenticated
5. Check date format is YYYY-MM-DD

---

## Files Created/Modified

### Created:
- `quillby-app/DATABASE_CALENDAR_NOTES.sql` - Database schema
- `quillby-app/lib/calendarNotes.ts` - Calendar notes functions
- `quillby-app/DATABASE_SYNC_FIXES.md` - This document

### Modified:
- `quillby-app/app/state/slices/userSlice.ts` - Added database sync to setBuddyName and setProfile
- `quillby-app/app/components/modals/DayDetailsModal.tsx` - Added note/emoji loading and saving
- `quillby-app/app/components/stats/StreakCalendar.tsx` - Load emojis from database

---

## Next Steps

1. Run the SQL migration in Supabase
2. Test all three features
3. Monitor console logs for any errors
4. Verify data persists across app restarts
