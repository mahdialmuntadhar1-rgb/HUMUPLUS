import type { Business } from '../types';
import { supabase } from './supabase';

export async function listBusinesses(params: {
  q?: string;
  governorate?: string;
  category?: string;
  page?: number;
  limit?: number;
}) {
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(50, Math.max(1, params.limit ?? 20));
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase.from('businesses').select('*', { count: 'exact' });

  if (params.q?.trim()) query = query.ilike('name', `%${params.q.trim()}%`);
  if (params.governorate) query = query.eq('governorate', params.governorate);
  if (params.category) query = query.eq('category', params.category);

  const { data, error, count } = await query.range(from, to);

  if (error) throw new Error(error.message);

  return {
    data: (data ?? []) as Business[],
    meta: { page, limit, total: count ?? null },
  };
}

export async function getBusinessById(id: string | number) {
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  return data as Business;
}
