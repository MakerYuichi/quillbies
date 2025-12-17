import { useEffect, useState } from 'react';
import { useQuillbyStore } from '../state/store';

interface NotificationData {
  id: string;
  type: 'checkpoint-reminder' | 'checkpoint-reached' | 'daily-summary';
  title: string;
  message: string;
  timestamp: number;
}

export function useNotifications() {
  const { userData, checkStudyCheckpoints } = useQuillbyStore();
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [lastNotificationCheck, setLastNotificationCheck] = useState(Date.now());

  // Check for checkpoint notifications
  useEffect(() => {
    if (!userData.enabledHabits?.includes('study') || !userData.studyCheckpoints) return;

    const checkInterval = setInterval(() => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTime = currentHour + (currentMinute / 60);

      const checkpointTimes = {
        '9 AM': 9,
        '12 PM': 12,
        '3 PM': 15,
        '6 PM': 18,
        '9 PM': 21
      };

      // Check for 30-minute reminders
      for (const checkpoint of userData.studyCheckpoints) {
        const checkpointHour = checkpointTimes[checkpoint as keyof typeof checkpointTimes];
        const reminderTime = checkpointHour - 0.5; // 30 minutes before

        // If we're within 1 minute of reminder time
        if (Math.abs(currentTime - reminderTime) < 0.017) { // ~1 minute tolerance
          const studyHours = (userData.studyMinutesToday || 0) / 60;
          const expectedHours = (userData.studyGoalHours || 0) * (checkpointHour / 24);

          const notification: NotificationData = {
            id: `reminder-${checkpoint}-${Date.now()}`,
            type: 'checkpoint-reminder',
            title: 'Study Checkpoint Reminder',
            message: `Study checkpoint in 30 minutes!\nCurrent: ${studyHours.toFixed(1)}h / Expected: ${expectedHours.toFixed(1)}h`,
            timestamp: Date.now()
          };

          setNotifications(prev => [...prev, notification]);
        }

        // Check for checkpoint reached notifications
        if (Math.abs(currentTime - checkpointHour) < 0.017) { // ~1 minute tolerance
          const checkResult = checkStudyCheckpoints();
          
          if (checkResult.isBehind && checkResult.expected && checkResult.actual && checkResult.missing) {
            const notification: NotificationData = {
              id: `checkpoint-${checkpoint}-${Date.now()}`,
              type: 'checkpoint-reached',
              title: 'Checkpoint Reached!',
              message: `Studied: ${checkResult.actual.toFixed(1)}h / Expected: ${checkResult.expected.toFixed(1)}h\nMissing: ${checkResult.missing.toFixed(1)}h → +${checkResult.missing.toFixed(1)} mess`,
              timestamp: Date.now()
            };

            setNotifications(prev => [...prev, notification]);
          } else if (!checkResult.isBehind) {
            const notification: NotificationData = {
              id: `checkpoint-good-${checkpoint}-${Date.now()}`,
              type: 'checkpoint-reached',
              title: 'Checkpoint Reached!',
              message: `Great job! You're on track with your study goals! ✅`,
              timestamp: Date.now()
            };

            setNotifications(prev => [...prev, notification]);
          }
        }
      }

      // Check for daily summary (at midnight)
      if (currentHour === 0 && currentMinute === 0) {
        const { generateDailySummary } = useQuillbyStore.getState();
        const summary = generateDailySummary();
        
        if (summary) {
          const notification: NotificationData = {
            id: `daily-summary-${Date.now()}`,
            type: 'daily-summary',
            title: 'Daily Summary',
            message: summary,
            timestamp: Date.now()
          };

          setNotifications(prev => [...prev, notification]);
        }
      }

      setLastNotificationCheck(Date.now());
    }, 60000); // Check every minute

    return () => clearInterval(checkInterval);
  }, [userData.enabledHabits, userData.studyCheckpoints, userData.studyGoalHours, checkStudyCheckpoints]);

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return {
    notifications,
    dismissNotification,
    clearAllNotifications
  };
}