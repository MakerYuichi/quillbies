// Enhanced notification system with smart reminders
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Deadline, UserData } from '../app/core/types';

// Helper function to check if notification type is enabled
function isNotificationEnabled(
  preferences: UserData['notificationPreferences'],
  type: keyof NonNullable<UserData['notificationPreferences']>
): boolean {
  // If no preferences set, default to all enabled
  if (!preferences) return true;
  
  // Check master toggle first
  if (preferences.allEnabled === false) return false;
  
  // Check specific preference (default to true if not set)
  return preferences[type] !== false;
}

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Request permissions and setup channels
export async function setupNotifications(): Promise<boolean> {
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

    // Setup Android channels
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('study-reminders', {
        name: 'Study Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4CAF50',
      });

      await Notifications.setNotificationChannelAsync('deadline-alerts', {
        name: 'Deadline Alerts',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 500, 250, 500],
        lightColor: '#FF5722',
      });

      await Notifications.setNotificationChannelAsync('habit-reminders', {
        name: 'Habit Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#2196F3',
      });

      await Notifications.setNotificationChannelAsync('sleep-reminders', {
        name: 'Sleep Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#9C27B0',
      });

      await Notifications.setNotificationChannelAsync('motivation', {
        name: 'Motivational Messages',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250],
        lightColor: '#FFD700',
      });
    }

    console.log('[Notifications] Setup complete');
    return true;
  } catch (error) {
    console.error('[Notifications] Setup error:', error);
    return false;
  }
}

// Schedule a notification
async function scheduleNotification(
  title: string,
  body: string,
  trigger: Notifications.NotificationTriggerInput,
  channelId: string = 'study-reminders'
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
    return id;
  } catch (error) {
    console.error('[Notifications] Schedule error:', error);
    return null;
  }
}

// 1. DEADLINE NOTIFICATIONS
export async function scheduleDeadlineNotifications(
  deadline: Deadline,
  userName: string,
  preferences?: UserData['notificationPreferences']
): Promise<void> {
  // Check if deadline notifications are enabled
  if (!isNotificationEnabled(preferences, 'deadlines')) {
    console.log('[Notifications] Deadline notifications disabled by user');
    return;
  }
  
  try {
    const dueDate = new Date(deadline.dueDate);
    const now = new Date();
    
    // Calculate hours remaining
    const hoursRemaining = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    // TODAY ALERT: If deadline is due today and work hours match remaining hours
    if (hoursRemaining > 0 && hoursRemaining <= 24) {
      const workRemaining = deadline.estimatedHours - deadline.workCompleted;
      
      if (workRemaining > 0 && Math.abs(workRemaining - hoursRemaining) < 2) {
        // Schedule notification for now + 5 minutes
        const alertTime = new Date(now.getTime() + 5 * 60 * 1000);
        
        await scheduleNotification(
          `⚠️ ${deadline.title} - Time Critical!`,
          `Hey ${userName}! Only ${Math.round(hoursRemaining)}h left and ${workRemaining.toFixed(1)}h of work remaining. Start now! 🚨`,
          {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: alertTime,
          },
          'deadline-alerts'
        );
      }
    }
    
    // 3 DAYS BEFORE
    if (deadline.reminders?.threeDaysBefore) {
      const threeDaysBefore = new Date(dueDate);
      threeDaysBefore.setDate(threeDaysBefore.getDate() - 3);
      threeDaysBefore.setHours(9, 0, 0, 0);
      
      if (threeDaysBefore > now) {
        await scheduleNotification(
          `📝 Deadline in 3 days!`,
          `${deadline.title} is due in 3 days. ${deadline.estimatedHours}h of work needed. Let's plan! 💪`,
          {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: threeDaysBefore,
          },
          'deadline-alerts'
        );
      }
    }
    
    // 1 DAY BEFORE
    if (deadline.reminders?.oneDayBefore) {
      const oneDayBefore = new Date(dueDate);
      oneDayBefore.setDate(oneDayBefore.getDate() - 1);
      oneDayBefore.setHours(9, 0, 0, 0);
      
      if (oneDayBefore > now) {
        const workRemaining = deadline.estimatedHours - deadline.workCompleted;
        await scheduleNotification(
          `📝 Deadline tomorrow!`,
          `${deadline.title} is due tomorrow! ${workRemaining.toFixed(1)}h of work remaining. Time to focus! 🎯`,
          {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: oneDayBefore,
          },
          'deadline-alerts'
        );
      }
    }
    
    console.log(`[Notifications] Deadline notifications scheduled for: ${deadline.title}`);
  } catch (error) {
    console.error('[Notifications] Deadline scheduling error:', error);
  }
}

// 2. HABIT REMINDERS (Water, Meals, Exercise)
export async function scheduleHabitReminders(
  enabledHabits: string[],
  goals: {
    hydrationGoal?: number;
    mealGoal?: number;
    exerciseGoal?: number;
  },
  userName: string,
  preferences?: UserData['notificationPreferences']
): Promise<void> {
  try {
    // WATER REMINDERS - Every 2 hours from 8 AM to 8 PM
    if (enabledHabits.includes('hydration') && isNotificationEnabled(preferences, 'water')) {
      const waterTimes = [8, 10, 12, 14, 16, 18, 20];
      const glassesPerReminder = Math.ceil((goals.hydrationGoal || 8) / waterTimes.length);
      
      for (const hour of waterTimes) {
        await scheduleNotification(
          '💧 Hydration Time!',
          `Hey ${userName}! Time to drink water. Goal: ${goals.hydrationGoal || 8} glasses today. Stay hydrated! 💦`,
          {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour,
            minute: 0,
          },
          'habit-reminders'
        );
      }
    }
    
    // MEAL REMINDERS
    if (enabledHabits.includes('meals') && isNotificationEnabled(preferences, 'meals')) {
      const mealTimes = [
        { hour: 8, name: 'Breakfast', emoji: '🍳' },
        { hour: 13, name: 'Lunch', emoji: '🥗' },
        { hour: 19, name: 'Dinner', emoji: '🍽️' },
      ];
      
      for (const meal of mealTimes) {
        await scheduleNotification(
          `${meal.emoji} ${meal.name} Time!`,
          `Hey ${userName}! Time for ${meal.name.toLowerCase()}. Don't forget to log your meal! 😊`,
          {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour: meal.hour,
            minute: 0,
          },
          'habit-reminders'
        );
      }
    }
    
    // EXERCISE REMINDERS
    if (enabledHabits.includes('exercise') && isNotificationEnabled(preferences, 'exercise')) {
      const exerciseTimes = [7, 17]; // Morning and evening options
      
      for (const hour of exerciseTimes) {
        await scheduleNotification(
          '💪 Exercise Time!',
          `Hey ${userName}! Time to move! Goal: ${goals.exerciseGoal || 30} minutes today. Let's get active! 🏃`,
          {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour,
            minute: 0,
          },
          'habit-reminders'
        );
      }
    }
    
    console.log('[Notifications] Habit reminders scheduled');
  } catch (error) {
    console.error('[Notifications] Habit scheduling error:', error);
  }
}

// 3. SLEEP REMINDERS
export async function scheduleSleepReminders(
  userName: string,
  petName: string,
  sleepGoalHours: number = 8,
  preferences?: UserData['notificationPreferences']
): Promise<void> {
  // Check if sleep notifications are enabled
  if (!isNotificationEnabled(preferences, 'sleep')) {
    console.log('[Notifications] Sleep notifications disabled by user');
    return;
  }
  
  try {
    // Calculate ideal bedtime (assuming 7 AM wake up)
    const bedtimeHour = 23 - Math.floor(sleepGoalHours);
    
    // 30 minutes before bedtime
    await scheduleNotification(
      `🌙 Bedtime Soon!`,
      `Hey ${userName}! It's almost time for ${petName} to sleep. Start winding down! 😴`,
      {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: bedtimeHour,
        minute: 30,
      },
      'sleep-reminders'
    );
    
    // At bedtime
    await scheduleNotification(
      `💤 Time to Sleep!`,
      `Hey ${userName}! It's time for ${petName} to sleep. Let's get some rest! Good night! 🌙`,
      {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: bedtimeHour + 1,
        minute: 0,
      },
      'sleep-reminders'
    );
    
    console.log('[Notifications] Sleep reminders scheduled');
  } catch (error) {
    console.error('[Notifications] Sleep scheduling error:', error);
  }
}

// 4. MOTIVATIONAL NOTIFICATIONS
export async function scheduleMotivationalNotifications(
  userName: string,
  petName: string,
  preferences?: UserData['notificationPreferences']
): Promise<void> {
  // Check if motivational notifications are enabled
  if (!isNotificationEnabled(preferences, 'motivational')) {
    console.log('[Notifications] Motivational notifications disabled by user');
    return;
  }
  
  try {
    const motivationalMessages = [
      { hour: 10, message: `${petName} believes in you! Keep up the great work! 🌟` },
      { hour: 15, message: `You're doing amazing, ${userName}! ${petName} is proud! 💪` },
      { hour: 21, message: `Great day, ${userName}! ${petName} is happy with your progress! ✨` },
    ];
    
    for (const msg of motivationalMessages) {
      await scheduleNotification(
        `💝 ${petName} says...`,
        msg.message,
        {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: msg.hour,
          minute: 0,
        },
        'motivation'
      );
    }
    
    console.log('[Notifications] Motivational notifications scheduled');
  } catch (error) {
    console.error('[Notifications] Motivation scheduling error:', error);
  }
}

// 5. STUDY CHECKPOINT REMINDERS
export async function scheduleStudyCheckpointReminders(
  checkpoints: string[],
  studyGoalHours: number,
  userName: string,
  preferences?: UserData['notificationPreferences']
): Promise<void> {
  // Check if study checkpoint notifications are enabled
  if (!isNotificationEnabled(preferences, 'studyCheckpoints')) {
    console.log('[Notifications] Study checkpoint notifications disabled by user');
    return;
  }
  
  try {
    const timeMap: Record<string, number> = {
      '9 AM': 9,
      '12 PM': 12,
      '3 PM': 15,
      '6 PM': 18,
      '9 PM': 21,
    };
    
    for (const checkpoint of checkpoints) {
      const hour = timeMap[checkpoint];
      if (!hour) continue;
      
      await scheduleNotification(
        '📚 Study Checkpoint!',
        `Hey ${userName}! Time to check your study progress. Goal: ${studyGoalHours}h today. Keep going! 💪`,
        {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute: 0,
        },
        'study-reminders'
      );
    }
    
    console.log('[Notifications] Study checkpoint reminders scheduled');
  } catch (error) {
    console.error('[Notifications] Checkpoint scheduling error:', error);
  }
}

// MASTER FUNCTION: Schedule all notifications
export async function scheduleAllNotifications(userData: any, deadlines: any[]): Promise<void> {
  try {
    console.log('[Notifications] Scheduling all notifications...');
    
    // Clear existing notifications
    await Notifications.cancelAllScheduledNotificationsAsync();
    
    const userName = userData.userName || 'Friend';
    const petName = userData.buddyName || 'Quillby';
    const preferences = userData.notificationPreferences;
    
    // 1. Habit reminders
    if (userData.enabledHabits) {
      await scheduleHabitReminders(
        userData.enabledHabits,
        {
          hydrationGoal: userData.hydrationGoalGlasses,
          mealGoal: userData.mealGoalCount,
          exerciseGoal: userData.exerciseGoalMinutes,
        },
        userName,
        preferences
      );
    }
    
    // 2. Sleep reminders
    if (userData.enabledHabits?.includes('sleep')) {
      await scheduleSleepReminders(userName, petName, userData.sleepGoalHours, preferences);
    }
    
    // 3. Study checkpoints
    if (userData.studyCheckpoints && userData.studyGoalHours) {
      await scheduleStudyCheckpointReminders(
        userData.studyCheckpoints,
        userData.studyGoalHours,
        userName,
        preferences
      );
    }
    
    // 4. Deadline notifications
    for (const deadline of deadlines) {
      if (!deadline.isCompleted) {
        await scheduleDeadlineNotifications(deadline, userName, preferences);
      }
    }
    
    // 5. Motivational messages
    await scheduleMotivationalNotifications(userName, petName, preferences);
    
    // Log all scheduled notifications
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    console.log(`[Notifications] Total scheduled: ${scheduled.length}`);
    
  } catch (error) {
    console.error('[Notifications] Master scheduling error:', error);
  }
}

// Cancel all notifications
export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('[Notifications] All notifications cancelled');
  } catch (error) {
    console.error('[Notifications] Cancel error:', error);
  }
}
