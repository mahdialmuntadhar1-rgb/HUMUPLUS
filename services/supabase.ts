import { createClient } from '@supabase/supabase-js';
import type { Business } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are required.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─── DB category (full name) → UI short-ID ───────────────────────────────────
const DB_CATEGORY_TO_UI: Record<string, string> = {
  'Restaurants & Dining':   'food_drink',
  'Cafés & Coffee':         'food_drink',
  'Hotels & Stays':         'hotels_stays',
  'Shopping & Retail':      'shopping',
  'Health & Wellness':      'health_wellness',
  'Business Services':      'business_services',
  'Essential Services':     'public_essential',
  'Culture & Heritage':     'culture_heritage',
  'Entertainment & Events': 'events_entertainment',
  'Transport & Mobility':   'transport_mobility',
};

// Transform Supabase business row → HUMUPLUS Business format
function transformBusiness(data: any): Business {
  return {
    id: String(data.id || data.fsq_id || ''),
    name: data.name || '',
    nameAr: data.name_ar || data.nameAr || '',
    nameKu: data.name_ku || data.nameKu || '',
    // Map full DB category name → UI short ID (fallback: keep original)
    category: DB_CATEGORY_TO_UI[data.category] || data.category || 'business_services',
    subcategory: data.subcategory || data.user_category || '',
    governorate: data.governorate || '',
    city: data.city || '',
    address: data.address || '',
    phone: data.phone || '',
    website: data.website || '',
    // ✅ FIXED: DB uses latitude/longitude (NOT lat/lng)
    lat: data.latitude ?? data.lat ?? 0,
    lng: data.longitude ?? data.lng ?? 0,
    rating: data.rating || 4.0,
    reviewCount: data.review_count || data.reviewCount || 0,
    isVerified: data.verified ?? data.isVerified ?? false,
    isFeatured: data.is_published ?? data.isFeatured ?? false,
    imageUrl: data.image_url || data.imageUrl || `https://picsum.photos/seed/${data.id || 'business'}/400/300`,
    description: data.description || data.address || '',
    descriptionAr: data.description_ar || '',
    status: data.status || 'active',
    distance: data.distance || 0,
    whatsapp: data.whatsapp || data.phone || '',
    tags: data.tags || [],
  };
}

// ─── UI short-ID → DB full category name(s) ──────────────────────────────────
const UI_CATEGORY_TO_DB: Record<string, string[]> = {
  food_drink:           ['Restaurants & Dining', 'Cafés & Coffee'],
  hotels_stays:         ['Hotels & Stays'],
  shopping:             ['Shopping & Retail'],
  health_wellness:      ['Health & Wellness'],
  business_services:    ['Business Services'],
  public_essential:     ['Essential Services'],
  culture_heritage:     ['Culture & Heritage'],
  events_entertainment: ['Entertainment & Events'],
  transport_mobility:   ['Transport & Mobility'],
};

// Fetch businesses from Supabase
export async function getBusinessesFromSupabase(options?: {
  category?: string;
  city?: string;
  governorate?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ data: Business[]; total: number; hasMore: boolean }> {
  try {
    let query = supabase
      .from('businesses')
      .select('*', { count: 'exact' })
      .not('phone', 'is', null);

    // ✅ FIXED: Map UI category ID → real DB category name(s)
    if (options?.category && options.category !== 'all') {
      const dbCategories = UI_CATEGORY_TO_DB[options.category];
      if (dbCategories && dbCategories.length > 0) {
        query = query.in('category', dbCategories);
      }
    }

    if (options?.city) {
      query = query.ilike('city', `%${options.city}%`);
    }

    if (options?.governorate && options.governorate !== 'all') {
      query = query.ilike('governorate', `%${options.governorate}%`);
    }

    const page = options?.page || 1;
    const pageSize = options?.pageSize || 50;
    const start = (page - 1) * pageSize;

    query = query
      .range(start, start + pageSize - 1)
      .order('name', { ascending: true });

    const { data, error, count } = await query;

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    const businesses = (data || []).map(transformBusiness);
    const hasMore = businesses.length === pageSize && (page * pageSize) < (count || 0);

    return { data: businesses, total: count || 0, hasMore };
  } catch (error) {
    console.error('Error fetching from Supabase:', error);
    return { data: [], total: 0, hasMore: false };
  }
}

// Get business counts by category
export async function getCategoryCounts(): Promise<Record<string, number>> {
  try {
    const { data, error } = await supabase
      .from('businesses')
      .select('category');

    if (error) throw error;

    const counts: Record<string, number> = {};
    data?.forEach((biz: any) => {
      // Map DB category name → UI ID for counts
      const uiCat = DB_CATEGORY_TO_UI[biz.category] || biz.category || 'Uncategorized';
      counts[uiCat] = (counts[uiCat] || 0) + 1;
    });

    return counts;
  } catch (error) {
    console.error('Error fetching category counts:', error);
    return {};
  }
}
