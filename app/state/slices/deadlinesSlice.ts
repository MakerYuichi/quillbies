// Deadlines-related state and actions
import { StateCreator } from 'zustand';
import { Deadline, DeadlineFormData } from '../../core/types';
import { UserSlice } from './userSlice';

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
  DeadlinesSlice & UserSlice,
  [],
  [],
  DeadlinesSlice
> = (set, get) => ({
  deadlines: [],

  createDeadline: (formData: DeadlineFormData) => {
    const { deadlines } = get();
    
    let normalizedDueDate = formData.dueDate;
    if (normalizedDueDate && !normalizedDueDate.includes('T')) {
      const date = new Date(normalizedDueDate);
      date.setHours(23, 59, 59, 999);
      normalizedDueDate = date.toISOString();
    }

    const newDeadline: Deadline = {
      id: Date.now().toString(),
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
  },

  deleteDeadline: (id: string) => {
    const { deadlines } = get();
    
    set({
      deadlines: deadlines.filter(deadline => deadline.id !== id)
    });
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
    
    return deadlines
      .filter(deadline => {
        if (deadline.isCompleted) return false;
        const dueDate = new Date(deadline.dueDate);
        return dueDate > threeDaysFromNow;
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  },

  getUrgentDeadlines: () => {
    const { deadlines } = get();
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000));
    
    return deadlines
      .filter(deadline => {
        if (deadline.isCompleted) return false;
        const dueDate = new Date(deadline.dueDate);
        return dueDate <= threeDaysFromNow && dueDate >= now;
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