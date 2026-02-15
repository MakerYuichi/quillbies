// lib/calendarNotes.ts
import { supabase } from './supabase';

export interface CalendarDayNote {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD format
  note: string | null;
  emoji: string | null;
  created_at: string;
  updated_at: string;
}

// Save or update note and emoji for a specific day
export const saveCalendarDayNote = async (
  userId: string,
  date: string,
  note: string | null,
  emoji: string | null
): Promise<CalendarDayNote | null> => {
  try {
    const { data, error } = await supabase
      .from('calendar_day_notes')
      .upsert(
        {
          user_id: userId,
          date: date,
          note: note,
          emoji: emoji,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,date',
        }
      )
      .select()
      .single();

    if (error) {
      console.error('[CalendarNotes] Save error:', error);
      return null;
    }

    console.log('[CalendarNotes] Saved successfully:', data);
    return data;
  } catch (err) {
    console.error('[CalendarNotes] Save exception:', err);
    return null;
  }
};

// Get note for a specific day
export const getCalendarDayNote = async (
  userId: string,
  date: string
): Promise<CalendarDayNote | null> => {
  try {
    const { data, error } = await supabase
      .from('calendar_day_notes')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No data found - this is normal
        return null;
      }
      console.error('[CalendarNotes] Get error:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('[CalendarNotes] Get exception:', err);
    return null;
  }
};

// Get all notes for a user (for a specific month or all)
export const getCalendarDayNotes = async (
  userId: string,
  startDate?: string,
  endDate?: string
): Promise<CalendarDayNote[]> => {
  try {
    let query = supabase
      .from('calendar_day_notes')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (startDate) {
      query = query.gte('date', startDate);
    }
    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[CalendarNotes] Get all error:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('[CalendarNotes] Get all exception:', err);
    return [];
  }
};

// Delete note for a specific day
export const deleteCalendarDayNote = async (
  userId: string,
  date: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('calendar_day_notes')
      .delete()
      .eq('user_id', userId)
      .eq('date', date);

    if (error) {
      console.error('[CalendarNotes] Delete error:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('[CalendarNotes] Delete exception:', err);
    return false;
  }
};
