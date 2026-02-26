# Quillby Scripts

This directory contains utility scripts for backend operations and maintenance tasks.

## Available Scripts

### process-account-deletions.ts

Scheduled job that processes pending account deletion requests after the 30-day grace period.

**Purpose:**
- Finds account deletion requests past their scheduled date
- Permanently deletes all user data from database
- Marks deletion requests as completed
- Logs processing results

**Usage:**

```bash
# Run manually
ts-node scripts/process-account-deletions.ts

# Or with npm
npm run process-deletions
```

**Environment Variables Required:**
- `EXPO_PUBLIC_SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (admin access)

**Cron Job Setup:**

Run daily at 2 AM:
```bash
0 2 * * * cd /path/to/quillby-app && ts-node scripts/process-account-deletions.ts >> /var/log/quillby-deletions.log 2>&1
```

Run every 6 hours:
```bash
0 */6 * * * cd /path/to/quillby-app && ts-node scripts/process-account-deletions.ts >> /var/log/quillby-deletions.log 2>&1
```

**Output Example:**

```
==================================================
🗑️  QUILLBY ACCOUNT DELETION PROCESSOR
==================================================

🗑️  Starting account deletion processing...
⏰ Current time: 2024-12-15T02:00:00.000Z
📋 Found 2 account(s) to delete

🔄 Processing deletion request abc-123
  User ID: user-xyz-789
  Requested: 2024-11-15T10:30:00.000Z
  Scheduled: 2024-12-15T10:30:00.000Z
  Deleting data for user: user-xyz-789
  ✅ All data deleted for user user-xyz-789
  ✅ Deletion completed successfully

==================================================
📊 Deletion Processing Summary
==================================================
✅ Successful: 2
❌ Failed: 0
📋 Total: 2
==================================================

✅ Processing complete
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create a `.env` file with:
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Important:** The service role key bypasses Row Level Security (RLS) and should be kept secure. Never commit it to version control.

### 3. Test Locally

```bash
# Dry run to test without making changes
ts-node scripts/process-account-deletions.ts
```

### 4. Deploy to Production

**Option A: Cron Job (Traditional Server)**

1. SSH into your server
2. Edit crontab: `crontab -e`
3. Add the cron job line
4. Save and exit

**Option B: Cloud Functions (Serverless)**

Deploy as a scheduled cloud function:

- **Vercel Cron Jobs**
- **AWS Lambda + EventBridge**
- **Google Cloud Functions + Cloud Scheduler**
- **Supabase Edge Functions + pg_cron**

**Option C: GitHub Actions (CI/CD)**

Create `.github/workflows/process-deletions.yml`:

```yaml
name: Process Account Deletions

on:
  schedule:
    - cron: '0 2 * * *' # Daily at 2 AM UTC
  workflow_dispatch: # Allow manual trigger

jobs:
  process-deletions:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: ts-node scripts/process-account-deletions.ts
        env:
          EXPO_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}
```

## Security Considerations

### Service Role Key
- Has full database access (bypasses RLS)
- Should only be used in secure backend environments
- Never expose in client-side code
- Rotate regularly
- Store in secure environment variables

### Logging
- Log all deletion operations
- Include timestamps and user IDs
- Monitor for unusual patterns
- Set up alerts for failures

### Error Handling
- Script continues if individual deletions fail
- Failed deletions are logged
- Summary report shows success/failure counts
- Manual intervention may be needed for failures

## Monitoring

### Recommended Monitoring

1. **Execution Logs**
   - Check cron job logs regularly
   - Monitor for errors or failures
   - Set up log aggregation (e.g., CloudWatch, Datadog)

2. **Database Metrics**
   - Track deletion request counts
   - Monitor pending vs completed status
   - Alert on stuck deletions

3. **Alerts**
   - Email on script failures
   - Slack notifications for errors
   - Dashboard for deletion metrics

### Example Monitoring Query

```sql
-- Check pending deletions
SELECT 
  COUNT(*) as pending_count,
  MIN(scheduled_for) as oldest_scheduled
FROM account_deletion_requests
WHERE status = 'pending';

-- Check completed deletions (last 7 days)
SELECT 
  DATE(updated_at) as date,
  COUNT(*) as completed_count
FROM account_deletion_requests
WHERE status = 'completed'
  AND updated_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(updated_at)
ORDER BY date DESC;
```

## Troubleshooting

### Script Fails to Run

**Check:**
- Environment variables are set correctly
- Supabase credentials are valid
- Network connectivity to Supabase
- Node.js and TypeScript are installed

### Deletions Not Processing

**Check:**
- Scheduled date has passed
- Status is 'pending'
- No database errors in logs
- RLS policies (service key should bypass)

### Partial Deletion Failures

**Check:**
- Foreign key constraints
- Table permissions
- Database connection stability
- Retry failed deletions manually

## Future Enhancements

- [ ] Email notifications before deletion
- [ ] Deletion confirmation emails
- [ ] Metrics dashboard
- [ ] Automated testing
- [ ] Rollback capability (within grace period)
- [ ] Batch processing optimization
- [ ] Retry logic for failed deletions

## Related Documentation

- [Account Deletion Feature](../docs/ACCOUNT_DELETION.md)
- [Database Schema](../docs/database/DATABASE_SCHEMA.md)
- [Privacy Policy](../docs/PRIVACY_POLICY.md)

---

**Last Updated:** December 2024  
**Maintainer:** Quillby Team
