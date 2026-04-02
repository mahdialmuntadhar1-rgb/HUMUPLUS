import { createClient } from '@supabase/supabase-js';
import type { Business } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are required.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─── DB category (full name OR lowercase) → UI short-ID ──────────────────────
const DB_CATEGORY_TO_UI: Record<string, string> = {
  // Full names (from manual import)
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
  // Lowercase (from 18-AGENTS scraper)
  'restaurants':            'food_drink',
  'cafes':                  'food_drink',
  'bakeries':               'food_drink',
  'hotels':                 'hotels_stays',
  'gyms':                   'health_wellness',
  'beauty_salons':          'health_wellness',
  'pharmacies':             'public_essential',
  'supermarkets':           'shopping',
};

// Transform Supabase business row → HUMUPLUS Business format
// Handles BOTH 18-AGENTS schema (business_name, lowercase category) 
// AND manual import schema (name, full category names)
function transformBusiness(data: any): Business {
  // 18-AGENTS uses 'business_name', manual import uses 'name'
  const name = data.business_name || data.name || '';
  
  // 18-AGENTS uses lowercase categories like 'restaurants', manual uses 'Restaurants & Dining'
  const category = data.category || '';
  const uiCategory = DB_CATEGORY_TO_UI[category] || 
                     DB_CATEGORY_TO_UI[category.toLowerCase()] || 
                     'business_services';
  
  return {
    id: String(data.id || ''),
    name: name,
    nameAr: data.name_ar || '',
    nameKu: data.name_ku || '',
    category: uiCategory,
    subcategory: data.subcategory || '',
    governorate: data.governorate || '',
    city: data.city || '',
    address: data.address || '',
    phone: data.phone || '',
    website: data.website || '',
    // ✅ Handle both schemas: latitude/longitude (18-AGENTS uses same names)
    lat: data.latitude ?? 0,
    lng: data.longitude ?? 0,
    rating: data.rating || 4.0,
    reviewCount: data.review_count || 0,
    // 18-AGENTS: verification_status, manual: verified
    isVerified: data.verified || data.verification_status === 'verified' || false,
    isFeatured: data.is_published || false,
    // 18-AGENTS: images[], manual: image_url
    imageUrl: data.image_url || (data.images && data.images[0]) || `https://picsum.photos/seed/${data.id || 'business'}/400/300`,
    description: data.description || data.address || '',
    status: data.status || 'active',
    distance: data.distance || 0,
    whatsapp: data.whatsapp || data.phone || '',
    tags: data.tags || [],
  };
}

// ─── UI short-ID → DB category name(s) ───────────────────────────────────────
// Includes BOTH full names (manual import) AND lowercase (18-AGENTS scraper)
const UI_CATEGORY_TO_DB: Record<string, string[]> = {
  food_drink:           ['Restaurants & Dining', 'Cafés & Coffee', 'restaurants', 'cafes', 'bakeries'],
  hotels_stays:         ['Hotels & Stays', 'hotels'],
  shopping:             ['Shopping & Retail', 'supermarkets'],
  health_wellness:      ['Health & Wellness', 'gyms', 'beauty_salons'],
  business_services:    ['Business Services'],
  public_essential:     ['Essential Services', 'pharmacies'],
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
