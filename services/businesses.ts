import type { Business } from '../types';
import { supabase } from './supabase';

const BUSINESS_COLUMNS = 'id,name,phone,category,governorate,city,address';

const toBusiness = (row: any): Business => ({
  id: String(row.id),
  name: row.name,
  phone: row.phone ?? undefined,
  category: row.category ?? undefined,
  governorate: row.governorate ?? undefined,
  city: row.city ?? undefined,
  address: row.address ?? undefined,
});

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

  let query = supabase.from('businesses').select(BUSINESS_COLUMNS, { count: 'exact' });

  if (params.q?.trim()) {
    const escaped = params.q.trim().replace(/,/g, ' ');
    query = query.or(`name.ilike.%${escaped}%,city.ilike.%${escaped}%`);
  }
  if (params.governorate) query = query.eq('governorate', params.governorate);
  if (params.category) query = query.eq('category', params.category);

  const { data, error, count } = await query.order('name').range(from, to);

  if (error) throw new Error(error.message);

  return {
    data: (data ?? []).map(toBusiness),
    meta: { page, limit, total: count ?? null },
  };
}

export async function getBusinessById(id: string) {
  const { data, error } = await supabase
    .from('businesses')
    .select(BUSINESS_COLUMNS)
    .eq('id', id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  return toBusiness(data);
}
