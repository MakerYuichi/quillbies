import { useEffect, useState, useRef } from 'react';
import { useQuillbyStore } from '../state/store-modular';

interface NotificationData {
  id: string;
  type: 
    | 'checkpoint-reminder'
    | 'checkpoint-reached'
    | 'daily-summary'
    | 'deadline-approaching'
    | 'deadline-checkpoint'
    | 'deadline-overdue'
    | 'deadline-complete';
  title: string;
  message: string;
  timestamp: number;
}

export function useNotifications() {
  const { userData, checkStudyCheckpoints, deadlines } = useQuillbyStore();
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [lastNotificationCheck, setLastNotificationCheck] = useState(Date.now());
  
  // Debug logging (reduced to prevent spam)
  useEffect(() => {
    console.log('[useNotifications] Hook initialized');
    console.log('[useNotifications] Study checkpoints enabled:', !!userData.studyCheckpoints?.length);
    console.log('[useNotifications] Deadlines count:', deadlines.length);
  }, []); // Only run once on mount
  
  // Track which notifications have been sent to prevent duplicates
  const sentCheckpointNotificationsRef = useRef<Set<string>>(new Set());
  const sentDeadlineNotificationsRef = useRef<Set<string>>(new Set());
  const celebratedDeadlinesRef = useRef<Set<string>>(new Set());
  const lastMidnightCheckRef = useRef<number>(0);

  // Check for checkpoint and deadline notifications
  useEffect(() => {
    console.log('[useNotifications] Starting notification check interval...');
    
    const checkInterval = setInterval(() => {
      try {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const currentTime = currentHour + (currentMinute / 60);

        // Only log every 10 minutes to reduce spam
        if (currentMinute % 10 === 0) {
          console.log('[useNotifications] Checking notifications at:', now.toLocaleTimeString());
        }

        const checkpointTimes = {
          '9 AM': 9,
          '12 PM': 12,
          '3 PM': 15,
          '6 PM': 18,
          '9 PM': 21
        };

      // === CHECKPOINT NOTIFICATIONS ===
      if (userData.enabledHabits?.includes('study') && userData.studyCheckpoints) {
        for (const checkpoint of userData.studyCheckpoints) {
          const checkpointHour = checkpointTimes[checkpoint as keyof typeof checkpointTimes];
          const reminderTime = checkpointHour - 0.5; // 30 minutes before

          // Check for 30-minute reminders (prevent duplicates)
          if (Math.abs(currentTime - reminderTime) < 0.017) {
            const reminderKey = `reminder-${checkpoint}-${now.getDate()}`;
            if (!sentCheckpointNotificationsRef.current.has(reminderKey)) {
              const studyHours = (userData.studyMinutesToday || 0) / 60;
              const expectedHours = (userData.studyGoalHours || 0) * (checkpointHour / 24);

              const notification: NotificationData = {
                id: `reminder-${checkpoint}-${Date.now()}`,
                type: 'checkpoint-reminder',
                title: '⏰ Study Checkpoint Reminder',
                message: `Study checkpoint in 30 minutes!\nCurrent: ${studyHours.toFixed(1)}h / Expected: ${expectedHours.toFixed(1)}h`,
                timestamp: Date.now()
              };

              sentCheckpointNotificationsRef.current.add(reminderKey);
              setNotifications(prev => [...prev, notification]);
            }
          }

          // Check for checkpoint reached notifications (prevent duplicates)
          if (Math.abs(currentTime - checkpointHour) < 0.017) {
            const checkpointKey = `checkpoint-${checkpoint}-${now.getDate()}`;
            if (!sentCheckpointNotificationsRef.current.has(checkpointKey)) {
              const checkResult = checkStudyCheckpoints();
              
              if (checkResult.isBehind && checkResult.expected && checkResult.actual && checkResult.missing) {
                const notification: NotificationData = {
                  id: `checkpoint-${checkpoint}-${Date.now()}`,
                  type: 'checkpoint-reached',
                  title: '📚 Checkpoint Reached!',
                  message: `Studied: ${checkResult.actual.toFixed(1)}h / Expected: ${checkResult.expected.toFixed(1)}h\nMissing: ${checkResult.missing.toFixed(1)}h → +${checkResult.missing.toFixed(1)} mess`,
                  timestamp: Date.now()
                };

                sentCheckpointNotificationsRef.current.add(checkpointKey);
                setNotifications(prev => [...prev, notification]);
              } else if (!checkResult.isBehind) {
                const notification: NotificationData = {
                  id: `checkpoint-good-${checkpoint}-${Date.now()}`,
                  type: 'checkpoint-reached',
                  title: '✅ Checkpoint Reached!',
                  message: `Great job! You're on track with your study goals! 🎉`,
                  timestamp: Date.now()
                };

                sentCheckpointNotificationsRef.current.add(checkpointKey);
                setNotifications(prev => [...prev, notification]);
              }
            }
          }
        }
      }

      // === DEADLINE NOTIFICATIONS ===
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      deadlines.forEach((deadline) => {
        if (!deadline) return;

        const dueDate = new Date(deadline.dueDate);
        const startOfDue = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
        const diffDays = (startOfDue.getTime() - startOfToday.getTime()) / (1000 * 60 * 60 * 24);

        const totalHours = deadline.estimatedHours;
        const completedHours = deadline.workCompleted;
        const remainingHours = Math.max(0, totalHours - completedHours);

        const keyBase = `deadline-${deadline.id}`;

        // 1) Deadline Approaching (3 days before)
        if (
          !deadline.isCompleted &&
          remainingHours > 0 &&
          Math.round(diffDays) === 3 &&
          deadline.reminders?.threeDaysBefore
        ) {
          const key = `${keyBase}-approaching-3`;
          if (!sentDeadlineNotificationsRef.current.has(key)) {
            const notification: NotificationData = {
              id: key,
              type: 'deadline-approaching',
              title: `📝 ${deadline.title} in 3 days!`,
              message: `You need ${remainingHours.toFixed(1)} more hours to stay on track`,
              timestamp: Date.now(),
            };
            sentDeadlineNotificationsRef.current.add(key);
            setNotifications((prev) => [...prev, notification]);
          }
        }

        // 2) Deadline Checkpoint (1 day before)
        if (
          !deadline.isCompleted &&
          remainingHours > 0 &&
          Math.round(diffDays) === 1 &&
          deadline.reminders?.oneDayBefore
        ) {
          const key = `${keyBase}-checkpoint-1`;
          if (!sentDeadlineNotificationsRef.current.has(key)) {
            const notification: NotificationData = {
              id: key,
              type: 'deadline-checkpoint',
              title: `⚠️ ${deadline.title} due tomorrow!`,
              message: `${remainingHours.toFixed(1)}h of work remaining\nTime to focus!`,
              timestamp: Date.now(),
            };
            sentDeadlineNotificationsRef.current.add(key);
            setNotifications((prev) => [...prev, notification]);
          }
        }

        // 3) Overdue / Critical Warning (due today or overdue)
        if (!deadline.isCompleted && remainingHours > 0 && Math.round(diffDays) <= 0) {
          const key = `${keyBase}-critical-${Math.round(diffDays)}`;
          if (!sentDeadlineNotificationsRef.current.has(key)) {
            const daysLabel = Math.round(diffDays) <= 0 ? 'TODAY' : `${Math.round(diffDays)} DAYS`;
            const notification: NotificationData = {
              id: key,
              type: 'deadline-overdue',
              title: `🚨 CRITICAL: ${deadline.title} ${daysLabel}!`,
              message: `${remainingHours.toFixed(1)}h remaining\nStart working now!`,
              timestamp: Date.now(),
            };
            sentDeadlineNotificationsRef.current.add(key);
            setNotifications((prev) => [...prev, notification]);
          }
        }

        // 4) Completion Celebration (once per deadline)
        if (deadline.isCompleted && !celebratedDeadlinesRef.current.has(deadline.id)) {
          celebratedDeadlinesRef.current.add(deadline.id);
          const notification: NotificationData = {
            id: `${keyBase}-complete`,
            type: 'deadline-complete',
            title: `🎉 You completed ${deadline.title}!`,
            message: `Excellent work! Room cleaned instantly ✨`,
            timestamp: Date.now(),
          };
          setNotifications((prev) => [...prev, notification]);
        }
      });

      // === DAILY SUMMARY (at midnight) ===
      if (currentHour === 0 && currentMinute === 0) {
        const now = Date.now();
        if (now - lastMidnightCheckRef.current > 3600000) { // Only once per hour
          const { generateDailySummary } = useQuillbyStore.getState();
          const summary = generateDailySummary();
          
          if (summary) {
            const notification: NotificationData = {
              id: `daily-summary-${Date.now()}`,
              type: 'daily-summary',
              title: '📊 Daily Summary',
              message: summary,
              timestamp: Date.now()
            };

            setNotifications(prev => [...prev, notification]);
            lastMidnightCheckRef.current = now;
          }
        }
      }

      setLastNotificationCheck(Date.now());
      } catch (error) {
        console.error('[useNotifications] Error in notification check:', error);
      }
    }, 300000); // Check every 5 minutes instead of every minute

    return () => {
      console.log('[useNotifications] Cleaning up notification interval');
      clearInterval(checkInterval);
    };
  }, [userData.enabledHabits, userData.studyGoalHours]); // Removed frequently changing objects from dependencies

  // Auto-dismiss notifications after 10 seconds (increased from 5 to reduce timer churn)
  useEffect(() => {
    if (notifications.length === 0) return;

    const timers = notifications.map(notification => {
      return setTimeout(() => {
        dismissNotification(notification.id);
      }, 10000); // 10 seconds instead of 5
    });

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [notifications.length]); // Only depend on length, not the full array

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Add test notification function for debugging
  const addTestNotification = () => {
    const testNotification: NotificationData = {
      id: `test-${Date.now()}`,
      type: 'checkpoint-reminder',
      title: '🔔 Test Notification',
      message: 'This is a test notification to verify the system is working!',
      timestamp: Date.now()
    };
    
    console.log('[useNotifications] Adding test notification:', testNotification);
    setNotifications(prev => [...prev, testNotification]);
  };

  return {
    notifications,
    dismissNotification,
    clearAllNotifications,
    addTestNotification
  };
}