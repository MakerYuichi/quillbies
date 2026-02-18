// Deadlines-related state and actions
import { StateCreator } from 'zustand';
import { Deadline, DeadlineFormData } from '../../core/types';
import { UserSlice } from './userSlice';
import { getDeviceUser } from '../../../lib/deviceAuth';
import { 
  createDeadline as createDeadlineDB, 
  updateDeadline as updateDeadlineDB,
  deleteDeadline as deleteDeadlineDB,
  markDeadlineComplete as markDeadlineCompleteDB,
  addWorkToDeadline as addWorkToDeadlineDB
} from '../../../lib/deadlines';

export interface DeadlinesSlice {
  deadlines: Deadline[];
  
  // Deadline actions
  createDeadline: (formData: DeadlineFormData) => void;
  updateDeadline: (id: string, updates: Partial<Deadline>) => void;
  deleteDeadline: (id: string) => void;
  markDeadlineComplete: (id: string) => void;
  addWorkToDeadline: (id: string, hours: number) => void;
  updateReminders: (id: string, reminders: { oneDayBefore: boolean; threeDaysBefore: boolean }) => void;
  
  // Deadline queries
  getUpcomingDeadlines: () => Deadline[];
  getUrgentDeadlines: () => Deadline[];
  getCompletedDeadlines: () => Deadline[];
}

export const createDeadlinesSlice: StateCreator<
  DeadlinesSlice & UserSlice & { checkAchievements?: () => void; checkSpecificAchievement?: (id: string) => void },
  [],
  [],
  DeadlinesSlice
> = (set, get) => ({
  deadlines: [],

  createDeadline: (formData: DeadlineFormData) => {
    const { deadlines, checkSpecificAchievement } = get() as any;
    
    let normalizedDueDate = formData.dueDate;
    if (normalizedDueDate && !normalizedDueDate.includes('T')) {
      const date = new Date(normalizedDueDate);
      date.setHours(23, 59, 59, 999);
      normalizedDueDate = date.toISOString();
    }

    const tempId = Date.now().toString();
    const newDeadline: Deadline = {
      id: tempId,
      title: formData.title,
      dueDate: normalizedDueDate,
      dueTime: formData.dueTime || undefined,
      priority: formData.priority,
      estimatedHours: parseFloat(formData.estimatedHours),
      category: formData.category,
      workCompleted: 0,
      isCompleted: false,
      createdAt: new Date().toISOString(),
      reminders: {
        oneDayBefore: true,
        threeDaysBefore: true,
      }
    };
    
    set({
      deadlines: [...deadlines, newDeadline]
    });
    
    console.log('[Deadline] Created new deadline, checking first deadline achievement...');
    // Check specifically for first deadline achievement
    setTimeout(() => {
      checkSpecificAchievement?.('secret-first-deadline');
    }, 100);
    
    // Sync deadline to database and update with real ID
    (async () => {
      try {
        const user = await getDeviceUser();
        if (user) {
          console.log('[Deadline] Syncing to database:', newDeadline.title);
          const dbDeadline = await createDeadlineDB(user.id, {
            title: formData.title,
            description: '',
            dueDate: formData.dueDate, // Use original format for database
            dueTime: formData.dueTime || null, // Use null instead of empty string
            priority: formData.priority,
            category: formData.category,
            estimatedHours: parseFloat(formData.estimatedHours),
            reminderOneDayBefore: true,
            reminderThreeDaysBefore: true,
          });
          
          if (dbDeadline) {
            console.log('[Deadline] Successfully synced, updating with database ID:', dbDeadline.id);
            // Update the deadline with the real database ID
            const currentDeadlines = get().deadlines;
            set({
              deadlines: currentDeadlines.map(d => 
                d.id === tempId ? { ...d, id: dbDeadline.id } : d
              )
            });
          }
        } else {
          console.log('[Deadline] No user, skipping database sync');
        }
      } catch (error) {
        console.error('[Deadline] Failed to sync to database:', error);
      }
    })();
  },

  updateDeadline: (id: string, updates: Partial<Deadline>) => {
    const { deadlines } = get();
    let normalizedUpdates = { ...updates };

    if (normalizedUpdates.dueDate && !normalizedUpdates.dueDate.includes('T')) {
      const date = new Date(normalizedUpdates.dueDate);
      date.setHours(23, 59, 59, 999);
      normalizedUpdates.dueDate = date.toISOString();
    }

    set({
      deadlines: deadlines.map(deadline => 
        deadline.id === id ? { ...deadline, ...normalizedUpdates } : deadline
      )
    });
    
    // Sync update to database
    (async () => {
      try {
        const user = await getDeviceUser();
        if (user) {
          console.log('[Deadline] Syncing update to database');
          await updateDeadlineDB(id, normalizedUpdates);
        }
      } catch (error) {
        console.error('[Deadline] Failed to sync update:', error);
      }
    })();
  },

  deleteDeadline: (id: string) => {
    const { deadlines } = get();
    
    set({
      deadlines: deadlines.filter(deadline => deadline.id !== id)
    });
    
    // Sync deletion to database
    (async () => {
      try {
        const user = await getDeviceUser();
        if (user) {
          console.log('[Deadline] Syncing deletion to database');
          await deleteDeadlineDB(id);
        }
      } catch (error) {
        console.error('[Deadline] Failed to sync deletion:', error);
      }
    })();
  },

  markDeadlineComplete: (id: string) => {
    const { deadlines, userData } = get();
    const deadline = deadlines.find(d => d.id === id);
    
    if (deadline) {
      let completionBonus = 50;
      if (deadline.priority === 'high') completionBonus += 30;
      else if (deadline.priority === 'medium') completionBonus += 20;
      else completionBonus += 10;
      
      const now = new Date();
      const dueDate = new Date(deadline.dueDate);
      if (now <= dueDate) {
        completionBonus += 25;
      }
      
      const updatedDeadlines = deadlines.map(d => 
        d.id === id ? { ...d, isCompleted: true } : d
      );
      
      const updatedUserData = {
        ...userData,
        qCoins: userData.qCoins + completionBonus
      };
      
      set({
        deadlines: updatedDeadlines,
        userData: updatedUserData
      });
      
      // Sync to database
      (async () => {
        try {
          const user = await getDeviceUser();
          if (user) {
            console.log('[Deadline] Syncing completion to database');
            await markDeadlineCompleteDB(id);
          }
        } catch (error) {
          console.error('[Deadline] Failed to sync completion:', error);
        }
      })();
    }
  },

  addWorkToDeadline: (id: string, hours: number) => {
    const { deadlines } = get();
    const deadline = deadlines.find(d => d.id === id);
    
    if (deadline) {
      const newWorkCompleted = Math.min(
        deadline.workCompleted + hours,
        deadline.estimatedHours
      );
      
      const isCompleted = newWorkCompleted >= deadline.estimatedHours;
      
      set({
        deadlines: deadlines.map(d => 
          d.id === id 
            ? { ...d, workCompleted: newWorkCompleted, isCompleted }
            : d
        )
      });
      
      // Sync to database
      (async () => {
        try {
          const user = await getDeviceUser();
          if (user) {
            console.log('[Deadline] Syncing work progress to database');
            await addWorkToDeadlineDB(id, hours);
          }
        } catch (error) {
          console.error('[Deadline] Failed to sync work progress:', error);
        }
      })();
    }
  },

  updateReminders: (id: string, reminders: { oneDayBefore: boolean; threeDaysBefore: boolean }) => {
    const { deadlines } = get();
    
    set({
      deadlines: deadlines.map(d => 
        d.id === id ? { ...d, reminders } : d
      )
    });
  },

  getUpcomingDeadlines: () => {
    const { deadlines } = get();
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000));
    
    // Set to start of day for comparison
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const threeDaysStart = new Date(threeDaysFromNow.getFullYear(), threeDaysFromNow.getMonth(), threeDaysFromNow.getDate());
    
    return deadlines
      .filter(deadline => {
        if (deadline.isCompleted) return false;
        const dueDate = new Date(deadline.dueDate);
        const dueStart = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
        return dueStart > threeDaysStart;
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  },

  getUrgentDeadlines: () => {
    const { deadlines } = get();
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000));
    
    // Set to start of day for comparison
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const threeDaysStart = new Date(threeDaysFromNow.getFullYear(), threeDaysFromNow.getMonth(), threeDaysFromNow.getDate());
    
    return deadlines
      .filter(deadline => {
        if (deadline.isCompleted) return false;
        const dueDate = new Date(deadline.dueDate);
        const dueStart = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
        return dueStart <= threeDaysStart && dueStart >= todayStart;
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  },

  getCompletedDeadlines: () => {
    const { deadlines } = get();
    
    return deadlines
      .filter(deadline => deadline.isCompleted)
      .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
  }
});