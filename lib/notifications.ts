// Device notification system using expo-notifications
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Request notification permissions
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('[Notifications] Permission not granted');
      return false;
    }

    // For Android, set up notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF9800',
      });

      // Study reminders channel
      await Notifications.setNotificationChannelAsync('study-reminders', {
        name: 'Study Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4CAF50',
      });

      // Deadline alerts channel
      await Notifications.setNotificationChannelAsync('deadline-alerts', {
        name: 'Deadline Alerts',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 500, 250, 500],
        lightColor: '#FF5722',
      });
    }

    console.log('[Notifications] Permissions granted and channels configured');
    return true;
  } catch (error) {
    console.error('[Notifications] Error requesting permissions:', error);
    return false;
  }
}

// Schedule a local notification
export async function scheduleNotification(
  title: string,
  body: string,
  trigger: Notifications.NotificationTriggerInput,
  channelId: string = 'default'
): Promise<string | null> {
  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        ...(Platform.OS === 'android' && { channelId }),
      },
      trigger,
    });

    console.log(`[Notifications] Scheduled notification: ${id}`);
    return id;
  } catch (error) {
    console.error('[Notifications] Error scheduling notification:', error);
    return null;
  }
}

// Send immediate notification
export async function sendImmediateNotification(
  title: string,
  body: string,
  channelId: string = 'default'
): Promise<string | null> {
  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        ...(Platform.OS === 'android' && { channelId }),
      },
      trigger: null, // Send immediately
    });

    console.log(`[Notifications] Sent immediate notification: ${id}`);
    return id;
  } catch (error) {
    console.error('[Notifications] Error sending notification:', error);
    return null;
  }
}

// Cancel a scheduled notification
export async function cancelNotification(notificationId: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    console.log(`[Notifications] Cancelled notification: ${notificationId}`);
  } catch (error) {
    console.error('[Notifications] Error cancelling notification:', error);
  }
}

// Cancel all scheduled notifications
export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('[Notifications] Cancelled all notifications');
  } catch (error) {
    console.error('[Notifications] Error cancelling all notifications:', error);
  }
}

// Get all scheduled notifications
export async function getAllScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  try {
    const notifications = await Notifications.getAllScheduledNotificationsAsync();
    console.log(`[Notifications] Found ${notifications.length} scheduled notifications`);
    return notifications;
  } catch (error) {
    console.error('[Notifications] Error getting scheduled notifications:', error);
    return [];
  }
}

// Schedule study checkpoint reminder
export async function scheduleStudyCheckpointReminder(
  checkpointTime: string,
  studyGoalHours: number
): Promise<string | null> {
  const timeMap: Record<string, { hour: number; minute: number }> = {
    '9 AM': { hour: 8, minute: 30 }, // 30 min before
    '12 PM': { hour: 11, minute: 30 },
    '3 PM': { hour: 14, minute: 30 },
    '6 PM': { hour: 17, minute: 30 },
    '9 PM': { hour: 20, minute: 30 },
  };

  const time = timeMap[checkpointTime];
  if (!time) return null;

  return await scheduleNotification(
    '⏰ Study Checkpoint Reminder',
    `Your ${checkpointTime} study checkpoint is in 30 minutes! Time to focus! 📚`,
    {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: time.hour,
      minute: time.minute,
      repeats: true,
    },
    'study-reminders'
  );
}

// Schedule deadline reminder
export async function scheduleDeadlineReminder(
  deadlineTitle: string,
  dueDate: Date,
  daysBefore: number
): Promise<string | null> {
  const reminderDate = new Date(dueDate);
  reminderDate.setDate(reminderDate.getDate() - daysBefore);
  reminderDate.setHours(9, 0, 0, 0); // 9 AM reminder

  const now = new Date();
  if (reminderDate <= now) {
    console.log('[Notifications] Reminder date is in the past, skipping');
    return null;
  }

  const daysLabel = daysBefore === 1 ? 'tomorrow' : `in ${daysBefore} days`;
  
  return await scheduleNotification(
    `📝 Deadline ${daysLabel}!`,
    `${deadlineTitle} is due ${daysLabel}. Time to work on it! 💪`,
    {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: reminderDate,
    },
    'deadline-alerts'
  );
}

// Schedule daily study reminders (morning, afternoon, evening)
export async function scheduleDailyStudyReminders(): Promise<void> {
  try {
    console.log('[Notifications] Setting up daily study reminders...');

    // Cancel existing reminders first
    await cancelAllNotifications();

    // Get current date to calculate next occurrence
    const now = new Date();

    // Morning reminder (9 AM)
    const morning = new Date();
    morning.setHours(9, 0, 0, 0);
    if (morning <= now) {
      morning.setDate(morning.getDate() + 1); // Schedule for tomorrow if time has passed
    }

    await scheduleNotification(
      '☀️ Good Morning!',
      'Time to start your study session! Your hamster is waiting! 📚',
      {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 9,
        minute: 0,
        repeats: true,
      },
      'study-reminders'
    );

    // Afternoon reminder (2 PM)
    const afternoon = new Date();
    afternoon.setHours(14, 0, 0, 0);
    if (afternoon <= now) {
      afternoon.setDate(afternoon.getDate() + 1);
    }

    await scheduleNotification(
      '📚 Afternoon Study Time',
      'Keep up the momentum! Time for an afternoon study session! 💪',
      {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 14,
        minute: 0,
        repeats: true,
      },
      'study-reminders'
    );

    // Evening reminder (7 PM)
    const evening = new Date();
    evening.setHours(19, 0, 0, 0);
    if (evening <= now) {
      evening.setDate(evening.getDate() + 1);
    }

    await scheduleNotification(
      '🌙 Evening Study Session',
      'Finish strong! One more study session before bed! 🎯',
      {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 19,
        minute: 0,
        repeats: true,
      },
      'study-reminders'
    );

    // Log scheduled notifications
    const scheduled = await getAllScheduledNotifications();
    console.log('[Notifications] Daily study reminders scheduled successfully');
    console.log('[Notifications] Total scheduled:', scheduled.length);
    scheduled.forEach(notif => {
      console.log('[Notifications] -', notif.content.title, 'at', notif.trigger);
    });
  } catch (error) {
    console.error('[Notifications] Error scheduling daily reminders:', error);
  }
}
