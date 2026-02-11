# Testing Notifications

## Quick Test

To verify notifications are working, add this test button to your home screen temporarily:

```typescript
// Add to home screen (index.tsx) in the test buttons section
<TouchableOpacity
  style={styles.testButton}
  onPress={async () => {
    // Test immediate notification
    const { sendImmediateNotification, getAllScheduledNotifications } = await import('../../lib/notifications');
    
    // Send test notification now
    await sendImmediateNotification(
      '🔔 Test Notification',
      'If you see this, notifications are working!',
      'default'
    );
    
    // Check scheduled notifications
    const scheduled = await getAllScheduledNotifications();
    console.log('[Test] Scheduled notifications:', scheduled.length);
    scheduled.forEach(notif => {
      console.log('[Test] -', notif.content.title);
      console.log('[Test]   Trigger:', notif.trigger);
    });
  }}
>
  <Text style={styles.testButtonText}>🔔 Test Notifications</Text>
  <Text style={styles.testButtonSubtext}>Send test + check scheduled</Text>
</TouchableOpacity>
```

## Expected Results

### Immediate Test
- You should see a notification appear immediately
- Title: "🔔 Test Notification"
- Body: "If you see this, notifications are working!"

### Console Output
```
[Test] Scheduled notifications: 3
[Test] - ☀️ Good Morning!
[Test]   Trigger: { date: 2026-02-11T09:00:00.000Z, repeats: true }
[Test] - 📚 Afternoon Study Time
[Test]   Trigger: { date: 2026-02-10T14:00:00.000Z, repeats: true }
[Test] - 🌙 Evening Study Session
[Test]   Trigger: { date: 2026-02-10T19:00:00.000Z, repeats: true }
```

## Troubleshooting

### No Notification Appears
1. Check notification permissions: Settings → Quillby → Notifications → Allow
2. Check Do Not Disturb is off
3. Check console for errors

### Scheduled Notifications Not Firing
1. Wait until the scheduled time (9 AM, 2 PM, or 7 PM)
2. Keep app in background (notifications only show when app is not active)
3. Check notification settings on device

### Console Shows 0 Scheduled
1. Check if permissions were granted
2. Check console for "[Notifications] Error scheduling daily reminders"
3. Try restarting the app

## Manual Verification

### Android
1. Open Settings → Apps → Quillby → Notifications
2. Verify "Study Reminders" channel is enabled
3. Set importance to "High"

### iOS
1. Open Settings → Notifications → Quillby
2. Verify "Allow Notifications" is ON
3. Enable "Sounds" and "Badges"

## Production Testing

To test in production without waiting for scheduled times:

```typescript
// Temporarily change times to test soon
const testTime = new Date();
testTime.setMinutes(testTime.getMinutes() + 2); // 2 minutes from now

await scheduleNotification(
  '🧪 Test Reminder',
  'This should appear in 2 minutes!',
  {
    date: testTime,
    repeats: false, // Don't repeat for testing
  },
  'study-reminders'
);
```

## Cleanup

After testing, remove the test button and any test notifications:

```typescript
import { cancelAllNotifications } from './lib/notifications';
await cancelAllNotifications();
```

Then restart the app to reschedule the proper daily reminders.
