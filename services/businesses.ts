import type { Business } from '../types';
import { supabaseRest } from './supabase';

export interface FetchBusinessesOptions {
  limit?: number;
  offset?: number;
  search?: string;
  category?: string;
  featuredOnly?: boolean;
  signal?: AbortSignal;
}

interface BusinessesResponse {
  data: Business[];
  total: number;
}

export async function fetchBusinesses(governorateId: string, options: FetchBusinessesOptions = {}): Promise<BusinessesResponse> {
  const {
    limit = 20,
    offset = 0,
    search,
    category,
    featuredOnly = false,
    signal,
  } = options;

  const params = new URLSearchParams();
  params.set('select', '*');
  params.set('order', 'created_at.desc,name.asc');
  params.set('limit', String(limit));
  params.set('offset', String(offset));

  if (governorateId && governorateId !== 'all') {
    params.set('governorate_id', `eq.${governorateId}`);
  }

  if (category && category !== 'all') {
    params.set('category', `eq.${category}`);
  }

  if (search && search.trim()) {
    params.set('or', `(name.ilike.*${search.trim()}*,name_ar.ilike.*${search.trim()}*,name_ku.ilike.*${search.trim()}*,city.ilike.*${search.trim()}*)`);
  }

  if (featuredOnly) {
    params.set('or', '(is_featured.eq.true,is_premium.eq.true)');
  }

  const data = await supabaseRest<any[]>(`businesses?${params.toString()}`, { signal });

  return {
    data: data.map(mapBusiness),
    total: data.length,
  };
}

export async function fetchBusinessById(id: string, signal?: AbortSignal): Promise<Business | null> {
  const data = await supabaseRest<any[]>(`businesses?select=*&id=eq.${id}&limit=1`, { signal });
  if (!data.length) {
    return null;
  }
  return mapBusiness(data[0]);
}

function mapBusiness(row: any): Business {
  return {
    id: row.id,
    name: row.name,
    nameAr: row.name_ar,
    nameKu: row.name_ku,
    coverImage: row.cover_image,
    imageUrl: row.image_url,
    image: row.image_url,
    isPremium: row.is_premium,
    isFeatured: row.is_featured,
    category: row.category,
    subcategory: row.subcategory,
    rating: Number(row.rating || 0),
    distance: row.distance_km,
    status: row.status,
    verified: row.is_verified,
    isVerified: row.is_verified,
    reviews: row.review_count,
    reviewCount: row.review_count,
    governorate: row.governorate_name,
    governorateId: row.governorate_id,
    city: row.city,
    address: row.address,
    phone: row.phone,
    whatsapp: row.whatsapp,
    website: row.website,
    description: row.description,
    descriptionAr: row.description_ar,
    descriptionKu: row.description_ku,
    openHours: row.open_hours,
    tags: row.tags || [],
  };
}
