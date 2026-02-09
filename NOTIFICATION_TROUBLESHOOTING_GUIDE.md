# Notification Troubleshooting Guide

## ✅ Issue Fixed!

The notification system was **commented out** in the main screen file. I've now:

1. **Uncommented the notification hook** in `app/(tabs)/index.tsx`
2. **Enabled the test notification button** for debugging
3. **Verified all configuration** is correct

## 🔔 How to Test Notifications

### 1. Immediate Testing
- Look for the **🔔 Test Notification** button in the Debug Tools section
- Tap it to send both an in-app banner and system notification
- You should see:
  - A notification banner at the top of the screen
  - A system notification (if permissions are granted)

### 2. Study Checkpoint Notifications
To test automatic study notifications:

1. **Enable Study Habit**: Go to Settings → Manage Habits → Enable "Study"
2. **Set Study Goal**: Set study goal hours > 0 (e.g., 8 hours)
3. **Enable Checkpoints**: Choose checkpoint times (9 AM, 12 PM, 3 PM, 6 PM, 9 PM)
4. **Wait for Notifications**: 
   - 30 minutes before each checkpoint: Reminder notification
   - At each checkpoint: Progress check notification

### 3. Deadline Notifications
To test deadline notifications:

1. **Create a Deadline**: Add a deadline with estimated hours
2. **Enable Reminders**: Turn on 3-day and 1-day reminders
3. **Wait for Notifications**:
   - 3 days before: "Deadline approaching" notification
   - 1 day before: "Due tomorrow" notification
   - On due date: "Due today" critical notification

## 🛠️ Troubleshooting Steps

### If No Notifications Appear:

#### 1. Check Device Permissions
- **iOS**: Settings → Notifications → Quillby → Allow Notifications
- **Android**: Settings → Apps → Quillby → Notifications → Allow

#### 2. Check App Settings
- Ensure study habit is enabled
- Verify study goal hours > 0
- Confirm checkpoint times are selected

#### 3. Check Console Logs
Look for these log messages:
```
[App] Notification permissions granted
[useNotifications] Hook initialized
[Notifications] Scheduled notification: [ID]
```

#### 4. Force Refresh
- Close and reopen the app
- Check if permissions dialog appears

### If Only In-App Banners Work:
- This means the notification hook is working
- Issue is with system notification permissions
- Check device notification settings

### If Only System Notifications Work:
- Check if NotificationBanner component is rendering
- Look for JavaScript errors in console

## 📱 Notification Types

### In-App Banners
- Appear at the top of the main screen
- Auto-dismiss after 10 seconds
- Can be manually dismissed by tapping

### System Notifications
- Appear in device notification center
- Work even when app is closed
- Require explicit user permission

## 🔧 Debug Tools Available

1. **🔔 Test Notification**: Send immediate test notification
2. **Console Logging**: Detailed logs for debugging
3. **Diagnostic Script**: Run `node debug-notifications.js`

## 📋 Notification Schedule

### Study Checkpoints
- **8:30 AM**: Reminder for 9 AM checkpoint
- **9:00 AM**: 9 AM checkpoint check
- **11:30 AM**: Reminder for 12 PM checkpoint
- **12:00 PM**: 12 PM checkpoint check
- **2:30 PM**: Reminder for 3 PM checkpoint
- **3:00 PM**: 3 PM checkpoint check
- **5:30 PM**: Reminder for 6 PM checkpoint
- **6:00 PM**: 6 PM checkpoint check
- **8:30 PM**: Reminder for 9 PM checkpoint
- **9:00 PM**: 9 PM checkpoint check

### Deadline Reminders
- **3 days before**: "Deadline approaching" (9 AM)
- **1 day before**: "Due tomorrow" (9 AM)
- **Due date**: "Due today" (9 AM)
- **Completion**: Instant celebration notification

## 🎯 Next Steps

1. **Test the notification button** to verify basic functionality
2. **Set up study checkpoints** for automatic notifications
3. **Create test deadlines** to verify deadline notifications
4. **Check device notification settings** if system notifications don't work

The notification system is now fully enabled and should work as expected!