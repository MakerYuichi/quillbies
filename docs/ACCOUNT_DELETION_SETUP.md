# Account Deletion Setup Guide

Quick guide to set up the account deletion feature in Quillby.

## Prerequisites

- Supabase project set up
- Database access
- Service role key (for scheduled job)

## Setup Steps

### 1. Database Migration

Run the SQL migration to create the `account_deletion_requests` table:

```bash
# Connect to your Supabase database
psql -h your-db-host -U postgres -d postgres

# Or use Supabase SQL Editor in dashboard
```

Execute the migration file:
```sql
-- Copy and paste contents from:
-- docs/database/migrations/add_account_deletion_requests.sql
```

Or use Supabase CLI:
```bash
supabase db push
```

### 2. Install Dependencies

```bash
cd quillby-app
npm install
```

This installs:
- `dotenv` - Environment variable management
- `ts-node` - TypeScript execution
- `@supabase/supabase-js` - Supabase client

### 3. Configure Environment Variables

Create or update `.env` file:

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Service Role Key (for scheduled job only - keep secure!)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Important:** Never commit the service role key to version control!

### 4. Test the Feature

#### A. Test in App

1. Build and run the app:
   ```bash
   npm run android
   # or
   npm run ios
   ```

2. Navigate to Settings → Account Settings
3. Tap "Delete Account"
4. Follow the deletion flow
5. Verify the modal appears correctly
6. Type "DELETE" and confirm
7. Check that the warning banner appears

#### B. Test Database

Check the database:
```sql
-- View pending deletion requests
SELECT * FROM account_deletion_requests WHERE status = 'pending';

-- Check scheduled dates
SELECT 
  user_id,
  requested_at,
  scheduled_for,
  EXTRACT(DAY FROM (scheduled_for - requested_at)) as days_until_deletion
FROM account_deletion_requests
WHERE status = 'pending';
```

#### C. Test Cancellation

1. In the app, tap "Cancel Deletion"
2. Confirm cancellation
3. Verify warning banner disappears
4. Check database:
   ```sql
   SELECT * FROM account_deletion_requests WHERE user_id = 'your-user-id';
   ```

### 5. Set Up Scheduled Job

Choose one of the following options:

#### Option A: Cron Job (Traditional Server)

1. SSH into your server
2. Edit crontab:
   ```bash
   crontab -e
   ```

3. Add the job (runs daily at 2 AM):
   ```bash
   0 2 * * * cd /path/to/quillby-app && npm run process-deletions >> /var/log/quillby-deletions.log 2>&1
   ```

4. Save and exit

#### Option B: Supabase Edge Function + pg_cron

1. Create Edge Function:
   ```bash
   supabase functions new process-deletions
   ```

2. Implement the function (similar to `scripts/process-account-deletions.ts`)

3. Set up pg_cron in Supabase:
   ```sql
   SELECT cron.schedule(
     'process-account-deletions',
     '0 2 * * *', -- Daily at 2 AM
     $$
     SELECT net.http_post(
       url:='https://your-project.supabase.co/functions/v1/process-deletions',
       headers:='{"Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
     );
     $$
   );
   ```

#### Option C: GitHub Actions

1. Create `.github/workflows/process-deletions.yml`:
   ```yaml
   name: Process Account Deletions
   
   on:
     schedule:
       - cron: '0 2 * * *'
     workflow_dispatch:
   
   jobs:
     process:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: actions/setup-node@v3
         - run: npm install
         - run: npm run process-deletions
           env:
             EXPO_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
             SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}
   ```

2. Add secrets in GitHub repository settings

#### Option D: Cloud Function (AWS Lambda, Google Cloud, etc.)

Deploy `scripts/process-account-deletions.ts` as a cloud function with scheduled trigger.

### 6. Test Scheduled Job

Run manually to test:

```bash
npm run process-deletions
```

Expected output:
```
==================================================
🗑️  QUILLBY ACCOUNT DELETION PROCESSOR
==================================================

🗑️  Starting account deletion processing...
⏰ Current time: 2024-12-15T02:00:00.000Z
✅ No pending deletions to process

✅ Processing complete
```

### 7. Monitor and Verify

#### Set Up Monitoring

1. **Log Monitoring**
   - Check cron job logs regularly
   - Set up log aggregation (CloudWatch, Datadog, etc.)

2. **Database Monitoring**
   ```sql
   -- Pending deletions dashboard
   SELECT 
     COUNT(*) as total_pending,
     MIN(scheduled_for) as next_deletion,
     MAX(scheduled_for) as last_deletion
   FROM account_deletion_requests
   WHERE status = 'pending';
   ```

3. **Alerts**
   - Email on job failures
   - Slack notifications for errors
   - Dashboard for metrics

#### Verify Deletion Process

1. Create a test account
2. Request deletion
3. Wait for scheduled job to run (or run manually)
4. Verify all data is deleted:
   ```sql
   -- Check if user data exists
   SELECT * FROM user_profiles WHERE id = 'test-user-id';
   SELECT * FROM daily_data WHERE user_id = 'test-user-id';
   -- Should return no rows
   ```

## Troubleshooting

### Issue: Modal doesn't appear

**Solution:**
- Check import in `settings.tsx`
- Verify modal state management
- Check for console errors

### Issue: Deletion request not created

**Solution:**
- Check Supabase connection
- Verify RLS policies
- Check user authentication
- Review console logs

### Issue: Scheduled job fails

**Solution:**
- Verify environment variables
- Check service role key
- Test database connection
- Review error logs

### Issue: Data not deleted

**Solution:**
- Check foreign key constraints
- Verify table permissions
- Review deletion order
- Check RLS policies (service key should bypass)

## Security Checklist

- [ ] Service role key stored securely
- [ ] Environment variables not committed
- [ ] RLS policies enabled on all tables
- [ ] Scheduled job runs in secure environment
- [ ] Logs don't expose sensitive data
- [ ] Deletion confirmation required
- [ ] Grace period implemented
- [ ] User can cancel deletion

## Compliance Checklist

- [ ] GDPR compliance (Right to Erasure)
- [ ] CCPA compliance (Right to Delete)
- [ ] Privacy policy updated
- [ ] Terms of service updated
- [ ] Data retention policy documented
- [ ] User notification process defined

## Next Steps

1. **Test thoroughly** in development environment
2. **Deploy to staging** and test again
3. **Update privacy policy** with deletion information
4. **Train support team** on deletion process
5. **Monitor metrics** after launch
6. **Set up alerts** for failures
7. **Document** any issues or improvements

## Support

For questions or issues:
- Check [Account Deletion Documentation](./ACCOUNT_DELETION.md)
- Review [Scripts README](../scripts/README.md)
- Contact: support@quillby.app

---

**Last Updated:** December 2024  
**Status:** Ready for Production
