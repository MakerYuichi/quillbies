# Feedback System Setup with Supabase

The feedback form is now connected to Supabase for storing user feedback submissions.

## Quick Fix for RLS Error

If you're getting a "row-level security policy" error, run this SQL in your Supabase SQL Editor:

```sql
-- Run this in Supabase SQL Editor
DROP POLICY IF EXISTS "Allow anonymous feedback submission" ON feedback;

CREATE POLICY "Allow anonymous feedback submission"
  ON feedback
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

GRANT INSERT ON feedback TO anon;
GRANT INSERT ON feedback TO authenticated;
```

Or run the complete fix from `fix-feedback-rls.sql`.

## Setup Instructions

### 1. Create the Feedback Table in Supabase

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Navigate to the **SQL Editor** section
3. Copy the contents of `supabase-feedback-table.sql`
4. Paste it into the SQL Editor and click **Run**

This will create:
- A `feedback` table with all necessary columns
- Indexes for better query performance
- Row Level Security (RLS) policies for secure access
- Proper permissions for anonymous submissions

### 2. Verify the Setup

After running the SQL, verify the table was created:

1. Go to **Table Editor** in Supabase
2. You should see a new `feedback` table
3. Check that the columns match the schema

### 3. Test the Feedback Form

1. Open the Quillby app
2. Go to Settings → Send Feedback
3. Fill out the form and submit
4. Check your Supabase dashboard → Table Editor → feedback table
5. You should see the new feedback entry

## Table Schema

The `feedback` table includes:

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key (auto-generated) |
| category | TEXT | Feedback category (bug, feature, improvement, praise, other) |
| title | TEXT | Brief summary |
| description | TEXT | Detailed feedback |
| email | TEXT | Optional user email for follow-up |
| user_name | TEXT | User's display name |
| device_id | TEXT | Unique device identifier |
| platform | TEXT | OS platform (ios/android) |
| os_version | TEXT | Operating system version |
| device_model | TEXT | Device model name |
| device_name | TEXT | Device name |
| app_version | TEXT | App version number |
| build_number | TEXT | Build number |
| timestamp | TIMESTAMPTZ | When feedback was created (client time) |
| created_at | TIMESTAMPTZ | When record was inserted (server time) |

## Security

- **Row Level Security (RLS)** is enabled
- Anonymous users can INSERT feedback (submit)
- Authenticated users can SELECT their own feedback
- Admins can SELECT all feedback (requires custom JWT claim)

## Querying Feedback

### View all feedback (as admin)
```sql
SELECT * FROM feedback 
ORDER BY created_at DESC 
LIMIT 50;
```

### View feedback by category
```sql
SELECT * FROM feedback 
WHERE category = 'bug' 
ORDER BY created_at DESC;
```

### View feedback from a specific device
```sql
SELECT * FROM feedback 
WHERE device_id = 'your-device-id' 
ORDER BY created_at DESC;
```

### Get feedback statistics
```sql
SELECT 
  category,
  COUNT(*) as count,
  DATE(created_at) as date
FROM feedback
GROUP BY category, DATE(created_at)
ORDER BY date DESC, count DESC;
```

## Troubleshooting

### Feedback not appearing in Supabase

1. Check the browser console/app logs for errors
2. Verify Supabase URL and anon key in `.env` or `app.json`
3. Ensure RLS policies are correctly set up
4. Check that the `feedback` table exists

### Permission errors

1. Verify RLS policies are enabled
2. Check that anon role has INSERT permission
3. Run the SQL migration again if needed

## Future Enhancements

- Add email notifications when feedback is submitted
- Create an admin dashboard to view/manage feedback
- Add feedback status tracking (new, in-progress, resolved)
- Implement feedback voting/prioritization
- Add attachments/screenshots support
