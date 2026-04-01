import { createClient } from '@supabase/supabase-js';
import type { Business } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are required.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Transform Supabase business data to HUMUPLUS format
function transformBusiness(data: any): Business {
  return {
    id: data.id || data.fsq_id,
    name: data.name,
    nameAr: data.name_ar || data.local_name,
    nameKu: data.name_ku,
    category: data.category || data.foursquare_category || 'Restaurant',
    subcategory: data.subcategory || data.user_category,
    governorate: data.governorate || data.city,
    city: data.city,
    address: data.address,
    phone: data.phone,
    website: data.website,
    lat: data.latitude,
    lng: data.longitude,
    rating: data.rating || 4.0,
    reviewCount: data.review_count || 0,
    isVerified: data.verified || data.data_quality === 'osm',
    imageUrl: data.image_url || `https://picsum.photos/seed/${data.id || 'business'}/400/300`,
    description: data.description,
    descriptionAr: data.description_ar,
    status: data.status || 'active',
    distance: data.distance,
    whatsapp: data.whatsapp,
    tags: data.tags || [],
  };
}

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
      .select('*', { count: 'exact' });

    if (options?.category && options.category !== 'all') {
      query = query.ilike('category', `%${options.category}%`);
    }
    
    if (options?.city) {
      query = query.ilike('city', `%${options.city}%`);
    }
    
    if (options?.governorate && options.governorate !== 'all') {
      query = query.ilike('governorate', `%${options.governorate}%`);
    }

    const page = options?.page || 1;
    const pageSize = options?.pageSize || 50;  // Show 50 businesses per page
    const start = (page - 1) * pageSize;
    
    query = query.range(start, start + pageSize - 1);
    query = query.order('name', { ascending: true });

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
      const cat = biz.category || 'Uncategorized';
      counts[cat] = (counts[cat] || 0) + 1;
    });

    return counts;
  } catch (error) {
    console.error('Error fetching category counts:', error);
    return {};
  }
}
