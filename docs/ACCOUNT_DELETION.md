# Account Deletion Feature

## Overview
Quillby implements a user-friendly account deletion system with a 30-day grace period, allowing users to permanently delete their account and all associated data while providing a safety window to cancel the request.

## User Flow

### 1. Request Account Deletion
1. User opens Quillby app
2. Navigates to Settings → Account Settings
3. Taps "Delete Account"
4. Reviews deletion information in modal:
   - What will be deleted
   - 30-day grace period details
   - Cancellation option
5. Types "DELETE" to confirm
6. Taps "Delete Account" button
7. Receives confirmation with scheduled deletion date

### 2. Grace Period (30 Days)
- User can still access their account
- Deletion warning banner appears in Settings
- Shows days remaining until deletion
- "Cancel Deletion" button available
- If user logs in, they can cancel the request

### 3. Cancel Deletion
1. User opens app during grace period
2. Sees deletion warning in Settings
3. Taps "Cancel Deletion"
4. Confirms cancellation
5. Account deletion is cancelled
6. User continues using app normally

### 4. Permanent Deletion (After 30 Days)
- Automated process executes deletion
- All user data permanently removed
- User cannot access account anymore

## What Gets Deleted

When an account is deleted, the following data is permanently removed:

### User Profile Data
- User name and buddy name
- Character selection
- Profile settings (timezone, country, student level)

### Progress & Stats
- All achievements and progress
- Study session history
- Focus session records
- Sleep session logs
- Daily progress tracking
- Streaks and check-ins

### Goals & Habits
- Study goals and checkpoints
- Exercise goals
- Hydration goals
- Sleep goals
- Enabled habits configuration

### Deadlines & Tasks
- All deadlines
- Task completion history
- Work hours tracked

### Shop & Customization
- Purchased items
- Room customization
- Q-coins and gems balance
- Purchase history

### Device & Auth
- Unique device identifier
- Authentication session
- Local storage data

## Technical Implementation

### Database Tables Affected
```sql
- user_profiles
- daily_data
- focus_sessions
- sleep_sessions
- deadlines
- user_shop_items
- gem_purchases
- account_deletion_requests
```

### Key Files

#### Frontend
- `app/components/modals/AccountDeletionModal.tsx` - Deletion confirmation UI
- `app/(tabs)/settings.tsx` - Settings screen with deletion option
- `lib/accountDeletion.ts` - Account deletion logic

#### Backend
- `docs/database/migrations/add_account_deletion_requests.sql` - Database schema

### API Functions

#### `requestAccountDeletion()`
Schedules account for deletion after 30 days.

**Returns:**
```typescript
{
  success: boolean;
  scheduledFor?: string; // ISO timestamp
  error?: string;
}
```

#### `cancelAccountDeletion()`
Cancels pending deletion request.

**Returns:**
```typescript
{
  success: boolean;
  error?: string;
}
```

#### `getPendingDeletionRequest()`
Checks if user has pending deletion.

**Returns:**
```typescript
{
  requestedAt: string;
  scheduledFor: string;
  userId: string;
} | null
```

#### `executeAccountDeletion(userId: string)`
Permanently deletes all user data (called by scheduled job).

**Returns:**
```typescript
{
  success: boolean;
  error?: string;
}
```

#### `getDaysUntilDeletion(scheduledFor: string)`
Calculates days remaining until deletion.

**Returns:** `number`

## Database Schema

### account_deletion_requests Table
```sql
CREATE TABLE account_deletion_requests (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  requested_at TIMESTAMPTZ NOT NULL,
  scheduled_for TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'cancelled', 'completed')),
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  UNIQUE(user_id)
);
```

### Indexes
- `idx_account_deletion_requests_user_id`
- `idx_account_deletion_requests_status`
- `idx_account_deletion_requests_scheduled_for`

### Row Level Security (RLS)
- Users can only view/modify their own deletion requests
- Policies enforce user isolation

## Scheduled Job (Backend)

A scheduled job should run daily to process pending deletions:

```typescript
// Pseudocode for scheduled job
async function processPendingDeletions() {
  const now = new Date();
  
  // Find all pending deletions past scheduled date
  const pendingDeletions = await supabase
    .from('account_deletion_requests')
    .select('user_id')
    .eq('status', 'pending')
    .lte('scheduled_for', now.toISOString());
  
  // Execute deletion for each user
  for (const request of pendingDeletions) {
    await executeAccountDeletion(request.user_id);
    
    // Mark as completed
    await supabase
      .from('account_deletion_requests')
      .update({ status: 'completed' })
      .eq('user_id', request.user_id);
  }
}
```

## Security Considerations

### Authentication
- Only authenticated users can request deletion
- Users can only delete their own account
- RLS policies enforce access control

### Data Validation
- Confirmation required ("DELETE" text input)
- Multiple confirmation dialogs
- Clear warnings about permanent deletion

### Grace Period
- 30-day window prevents accidental deletions
- User can cancel anytime during grace period
- Automatic cancellation on login

### Data Cleanup
- All database records removed
- Local storage cleared
- Secure storage (device ID) deleted
- Auth session terminated

## User Support

### Contact Information
- Support email: support@quillby.app
- Displayed in deletion modal
- Available for questions or issues

### Common Questions

**Q: Can I recover my account after deletion?**
A: No, after 30 days, deletion is permanent and irreversible.

**Q: What happens if I log in during the grace period?**
A: You can cancel the deletion request and continue using your account.

**Q: Will I receive reminders before deletion?**
A: The app shows a warning banner with days remaining when you open it.

**Q: Can I export my data before deletion?**
A: Currently not supported, but may be added in future updates.

## Privacy Compliance

This feature helps Quillby comply with:
- GDPR (Right to Erasure / Right to be Forgotten)
- CCPA (Right to Delete)
- Other privacy regulations

## Testing

### Manual Testing Steps

1. **Request Deletion**
   - Open Settings → Account Settings
   - Tap "Delete Account"
   - Verify modal appears with correct information
   - Type "DELETE" and confirm
   - Verify success message with date

2. **Check Pending Status**
   - Close and reopen app
   - Navigate to Settings
   - Verify warning banner appears
   - Verify days remaining is correct

3. **Cancel Deletion**
   - Tap "Cancel Deletion"
   - Confirm cancellation
   - Verify warning banner disappears
   - Verify account works normally

4. **Database Verification**
   - Check `account_deletion_requests` table
   - Verify record created with correct dates
   - Verify status changes (pending → cancelled)

### Automated Testing (Future)

```typescript
describe('Account Deletion', () => {
  it('should schedule account deletion', async () => {
    const result = await requestAccountDeletion();
    expect(result.success).toBe(true);
    expect(result.scheduledFor).toBeDefined();
  });
  
  it('should cancel deletion request', async () => {
    await requestAccountDeletion();
    const result = await cancelAccountDeletion();
    expect(result.success).toBe(true);
  });
  
  it('should calculate days until deletion', () => {
    const future = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const days = getDaysUntilDeletion(future.toISOString());
    expect(days).toBe(30);
  });
});
```

## Future Enhancements

### Potential Improvements
- [ ] Email notifications before deletion
- [ ] Data export before deletion
- [ ] Partial deletion (keep some data)
- [ ] Account suspension instead of deletion
- [ ] Deletion reason feedback
- [ ] Admin dashboard for deletion requests

## Changelog

### Version 1.0 (2024)
- Initial implementation
- 30-day grace period
- Confirmation modal
- Database schema
- Settings integration
- Documentation

---

**Last Updated:** December 2024  
**Status:** ✅ Implemented  
**Compliance:** GDPR, CCPA Ready
