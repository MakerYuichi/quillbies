#!/usr/bin/env ts-node
/**
 * Scheduled Job: Process Account Deletions
 * 
 * This script should be run daily (e.g., via cron job) to process
 * pending account deletion requests that have passed their 30-day grace period.
 * 
 * Usage:
 *   ts-node scripts/process-account-deletions.ts
 * 
 * Cron Example (daily at 2 AM):
 *   0 2 * * * cd /path/to/quillby-app && ts-node scripts/process-account-deletions.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Service role key for admin operations

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  console.error('Required: EXPO_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create Supabase client with service role key (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Delete all user data from all tables
 */
async function deleteUserData(userId: string): Promise<boolean> {
  try {
    console.log(`  Deleting data for user: ${userId}`);

    // Delete from all tables (order matters due to foreign keys)
    const deletionPromises = [
      // Activity data (no foreign key constraints)
      supabase.from('focus_sessions').delete().eq('user_id', userId),
      supabase.from('sleep_sessions').delete().eq('user_id', userId),
      supabase.from('deadlines').delete().eq('user_id', userId),
      supabase.from('daily_data').delete().eq('user_id', userId),
      
      // Shop and purchases
      supabase.from('user_shop_items').delete().eq('user_id', userId),
      supabase.from('gem_purchases').delete().eq('user_id', userId),
      
      // User profile (has foreign key to auth.users)
      supabase.from('user_profiles').delete().eq('id', userId),
    ];

    const results = await Promise.allSettled(deletionPromises);
    
    // Check for errors
    let hasErrors = false;
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`    ❌ Failed to delete from table ${index}:`, result.reason);
        hasErrors = true;
      }
    });

    if (hasErrors) {
      console.error(`  ❌ Some deletions failed for user ${userId}`);
      return false;
    }

    console.log(`  ✅ All data deleted for user ${userId}`);
    return true;
  } catch (error) {
    console.error(`  ❌ Error deleting user data:`, error);
    return false;
  }
}

/**
 * Process pending account deletions
 */
async function processPendingDeletions() {
  console.log('🗑️  Starting account deletion processing...');
  console.log(`⏰ Current time: ${new Date().toISOString()}`);

  try {
    // Find all pending deletions that are past their scheduled date
    const now = new Date().toISOString();
    const { data: pendingDeletions, error } = await supabase
      .from('account_deletion_requests')
      .select('id, user_id, requested_at, scheduled_for')
      .eq('status', 'pending')
      .lte('scheduled_for', now);

    if (error) {
      console.error('❌ Error fetching pending deletions:', error);
      return;
    }

    if (!pendingDeletions || pendingDeletions.length === 0) {
      console.log('✅ No pending deletions to process');
      return;
    }

    console.log(`📋 Found ${pendingDeletions.length} account(s) to delete`);

    // Process each deletion
    let successCount = 0;
    let failureCount = 0;

    for (const request of pendingDeletions) {
      console.log(`\n🔄 Processing deletion request ${request.id}`);
      console.log(`  User ID: ${request.user_id}`);
      console.log(`  Requested: ${request.requested_at}`);
      console.log(`  Scheduled: ${request.scheduled_for}`);

      // Delete user data
      const success = await deleteUserData(request.user_id);

      if (success) {
        // Mark deletion request as completed
        const { error: updateError } = await supabase
          .from('account_deletion_requests')
          .update({ 
            status: 'completed',
            updated_at: new Date().toISOString()
          })
          .eq('id', request.id);

        if (updateError) {
          console.error(`  ❌ Failed to mark deletion as completed:`, updateError);
          failureCount++;
        } else {
          console.log(`  ✅ Deletion completed successfully`);
          successCount++;
        }
      } else {
        console.error(`  ❌ Failed to delete user data`);
        failureCount++;
      }
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 Deletion Processing Summary');
    console.log('='.repeat(50));
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Failed: ${failureCount}`);
    console.log(`📋 Total: ${pendingDeletions.length}`);
    console.log('='.repeat(50));

  } catch (error) {
    console.error('❌ Unexpected error during processing:', error);
  }
}

/**
 * Send reminder notifications (optional feature)
 * Notify users 7 days, 3 days, and 1 day before deletion
 */
async function sendDeletionReminders() {
  console.log('\n📧 Checking for deletion reminders...');

  try {
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const oneDayFromNow = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);

    // Find deletions scheduled for 7, 3, or 1 day from now
    const { data: upcomingDeletions, error } = await supabase
      .from('account_deletion_requests')
      .select('user_id, scheduled_for')
      .eq('status', 'pending')
      .or(`scheduled_for.eq.${sevenDaysFromNow.toISOString().split('T')[0]},scheduled_for.eq.${threeDaysFromNow.toISOString().split('T')[0]},scheduled_for.eq.${oneDayFromNow.toISOString().split('T')[0]}`);

    if (error) {
      console.error('❌ Error fetching upcoming deletions:', error);
      return;
    }

    if (!upcomingDeletions || upcomingDeletions.length === 0) {
      console.log('✅ No reminders to send');
      return;
    }

    console.log(`📧 Found ${upcomingDeletions.length} reminder(s) to send`);

    // TODO: Implement notification sending
    // This could be:
    // - Push notifications
    // - Email notifications
    // - In-app notifications
    
    for (const deletion of upcomingDeletions) {
      const daysUntil = Math.ceil((new Date(deletion.scheduled_for).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      console.log(`  📧 Would send reminder to user ${deletion.user_id} (${daysUntil} days until deletion)`);
    }

  } catch (error) {
    console.error('❌ Error sending reminders:', error);
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('\n' + '='.repeat(50));
  console.log('🗑️  QUILLBY ACCOUNT DELETION PROCESSOR');
  console.log('='.repeat(50) + '\n');

  // Process deletions
  await processPendingDeletions();

  // Send reminders (optional)
  // await sendDeletionReminders();

  console.log('\n✅ Processing complete\n');
}

// Run the script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
