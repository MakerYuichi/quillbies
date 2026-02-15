// lib/deadlines.ts
import { supabase } from './supabase';

// Create a new deadline
export const createDeadline = async (userId: string, deadlineData: any) => {
  try {
    const { data, error } = await supabase
      .from('deadlines')
      .insert([
        {
          user_id: userId,
          title: deadlineData.title,
          description: deadlineData.description,
          due_date: deadlineData.dueDate,
          due_time: deadlineData.dueTime || null, // Use null instead of empty string
          priority: deadlineData.priority,
          category: deadlineData.category,
          estimated_hours: deadlineData.estimatedHours,
          work_completed: 0,
          is_completed: false,
          reminder_one_day_before: deadlineData.reminderOneDayBefore ?? true,
          reminder_three_days_before: deadlineData.reminderThreeDaysBefore ?? true,
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('CreateDeadline Error:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('CreateDeadline Exception:', err);
    return null;
  }
};

// Get user's deadlines
export const getUserDeadlines = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('deadlines')
      .select('*')
      .eq('user_id', userId)
      .order('due_date', { ascending: true });

    if (error) {
      console.error('GetDeadlines Error:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('GetDeadlines Exception:', err);
    return [];
  }
};

// Update a deadline
export const updateDeadline = async (deadlineId: string, updates: any) => {
  try {
    const { data, error } = await supabase
      .from('deadlines')
      .update({
        ...updates,
        updated_at: new Date(),
      })
      .eq('id', deadlineId)
      .select()
      .single();

    if (error) {
      console.error('UpdateDeadline Error:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('UpdateDeadline Exception:', err);
    return null;
  }
};

// Delete a deadline
export const deleteDeadline = async (deadlineId: string) => {
  try {
    const { error } = await supabase
      .from('deadlines')
      .delete()
      .eq('id', deadlineId);

    if (error) {
      console.error('DeleteDeadline Error:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('DeleteDeadline Exception:', err);
    return false;
  }
};

// Mark deadline as complete
export const markDeadlineComplete = async (deadlineId: string) => {
  try {
    const { data, error } = await supabase
      .from('deadlines')
      .update({
        is_completed: true,
        completed_at: new Date(),
        updated_at: new Date(),
      })
      .eq('id', deadlineId)
      .select()
      .single();

    if (error) {
      console.error('MarkDeadlineComplete Error:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('MarkDeadlineComplete Exception:', err);
    return null;
  }
};

// Add work to deadline
export const addWorkToDeadline = async (deadlineId: string, hoursWorked: number) => {
  try {
    // Get current work completed
    const { data: deadline, error: fetchError } = await supabase
      .from('deadlines')
      .select('work_completed, estimated_hours')
      .eq('id', deadlineId)
      .single();

    if (fetchError) {
      console.error('FetchDeadline Error:', fetchError);
      return null;
    }

    const newWorkCompleted = (deadline.work_completed || 0) + hoursWorked;
    const isCompleted = newWorkCompleted >= (deadline.estimated_hours || 0);

    const { data, error } = await supabase
      .from('deadlines')
      .update({
        work_completed: newWorkCompleted,
        is_completed: isCompleted,
        completed_at: isCompleted ? new Date() : null,
        updated_at: new Date(),
      })
      .eq('id', deadlineId)
      .select()
      .single();

    if (error) {
      console.error('AddWorkToDeadline Error:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('AddWorkToDeadline Exception:', err);
    return null;
  }
};