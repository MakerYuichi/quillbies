// lib/communityFeed.ts
// Fetch public community feedback — shows buddy names, not real names

import { supabase } from './supabase';

export interface CommunityPost {
  id: string;
  category: string;
  title: string;
  description: string;
  buddy_name: string;
  country: string;
  selected_character?: string; // casual / energetic / scholar
  created_at: string;
}

const PAGE_SIZE = 20;

export async function getCommunityFeed(
  page = 0,
  category?: string
): Promise<CommunityPost[]> {
  try {
    let query = supabase
      .from('feedback')
      .select('id, category, title, description, buddy_name, country, selected_character, created_at')
      .order('created_at', { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[Community] Fetch error:', error);
      return [];
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      category: row.category,
      title: row.title,
      description: row.description,
      buddy_name: row.buddy_name || 'Anonymous Buddy',
      country: row.country || '',
      selected_character: row.selected_character || 'casual',
      created_at: row.created_at,
    }));
  } catch (e) {
    console.error('[Community] Unexpected error:', e);
    return [];
  }
}

/** Format date as "3rd May, 2026" */
export function formatDiaryDate(iso: string): string {
  const d = new Date(iso);
  const day = d.getDate();
  const suffix =
    day % 10 === 1 && day !== 11 ? 'st' :
    day % 10 === 2 && day !== 12 ? 'nd' :
    day % 10 === 3 && day !== 13 ? 'rd' : 'th';
  const month = d.toLocaleDateString(undefined, { month: 'long' });
  const year = d.getFullYear();
  return `${day}${suffix} ${month}, ${year}`;
}
