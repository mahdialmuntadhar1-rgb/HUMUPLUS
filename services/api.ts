import { supabase } from '../src/lib/supabase';
import type { Business, Post, User, BusinessPostcard } from '../types';

export const api = {
  async getBusinesses(params: {
    category?: string;
    city?: string;
    governorate?: string;
    lastId?: string;
    limit?: number;
    featuredOnly?: boolean;
  } = {}) {
    const pageSize = params.limit || 20;

    const filters: Array<{ key: string; op: 'eq' | 'ilike' | 'gt'; value: string | number | boolean }> = [];

    if (params.category && params.category !== 'all') {
      filters.push({ key: 'category', op: 'eq', value: params.category });
    }

    if (params.city?.trim()) {
      filters.push({ key: 'city', op: 'ilike', value: `%${params.city.trim()}%` });
    }

    if (params.governorate && params.governorate !== 'all') {
      filters.push({ key: 'governorate', op: 'eq', value: params.governorate });
    }

    if (params.featuredOnly) {
      filters.push({ key: 'isFeatured', op: 'eq', value: true });
    }

    if (params.lastId) {
      filters.push({ key: 'id', op: 'gt', value: params.lastId });
    }

    const { data, error } = await supabase.select('businesses', {
      filters,
      order: { column: 'id', ascending: true },
      limit: pageSize,
    });

    if (error) {
      console.error('Supabase getBusinesses error:', error);
      throw error;
    }

    const businesses = ((data as any[]) || []).map((row: any) => ({
      ...row,
      id: row.id,
      isVerified: row.isVerified ?? false,
    })) as Business[];

    const lastId = businesses.length > 0 ? String(businesses[businesses.length - 1].id) : undefined;

    return {
      data: businesses,
      lastId,
      hasMore: businesses.length === pageSize,
    };
  },

  subscribeToPosts(callback: (posts: Post[]) => void) {
    let active = true;

    const pull = async () => {
      const { data, error } = await supabase.select('posts', {
        order: { column: 'createdAt', ascending: false },
        limit: 50,
      });

      if (!active) return;

      if (error) {
        console.error('Supabase posts fetch error:', error);
        return;
      }

      const posts = ((data as any[]) || []).map((post) => ({
        ...post,
        createdAt: post.createdAt ? new Date(post.createdAt) : new Date(),
      })) as Post[];

      callback(posts);
    };

    pull();
    const timer = window.setInterval(pull, 5000);

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  },

  async getDeals() {
    const { data, error } = await supabase.select('deals', {
      order: { column: 'createdAt', ascending: false },
      limit: 10,
    });

    if (error) {
      console.error('Supabase getDeals error:', error);
      return [];
    }

    return (data as any[]) || [];
  },

  async getStories() {
    const { data, error } = await supabase.select('stories', {
      order: { column: 'createdAt', ascending: false },
      limit: 20,
    });

    if (error) {
      console.error('Supabase getStories error:', error);
      return [];
    }

    return (data as any[]) || [];
  },

  async getEvents(params: { category?: string; governorate?: string } = {}) {
    const filters: Array<{ key: string; op: 'eq' | 'ilike' | 'gt'; value: string | number | boolean }> = [];

    if (params.category && params.category !== 'all') {
      filters.push({ key: 'category', op: 'eq', value: params.category });
    }

    if (params.governorate && params.governorate !== 'all') {
      filters.push({ key: 'governorate', op: 'eq', value: params.governorate });
    }

    const { data, error } = await supabase.select('events', {
      filters,
      order: { column: 'date', ascending: true },
    });

    if (error) {
      console.error('Supabase getEvents error:', error);
      return [];
    }

    return ((data as any[]) || []).map((event) => ({
      ...event,
      date: event.date ? new Date(event.date) : new Date(),
    }));
  },

  async createPost(postData: Partial<Post>) {
    const { data, error } = await supabase.insert(
      'posts',
      {
        ...postData,
        createdAt: new Date().toISOString(),
        likes: postData.likes ?? 0,
      },
      true,
    );

    if (error) {
      console.error('Supabase createPost error:', error);
      return { success: false };
    }

    return { success: true, id: (data as any)?.id };
  },

  async getOrCreateProfile(authUser: any, requestedRole: 'user' | 'owner' = 'user') {
    if (!authUser) return null;

    const isAdminEmail = authUser.email === 'safaribosafar@gmail.com';

    const { data: existingUser, error: fetchError } = await supabase.select('users', {
      filters: [{ key: 'id', op: 'eq', value: authUser.id }],
      single: true,
    });

    if (fetchError) {
      console.error('Supabase getOrCreateProfile fetch error:', fetchError);
      return null;
    }

    if (existingUser) {
      const current = existingUser as User;

      if (isAdminEmail && current.role !== 'admin') {
        const { error: updateError } = await supabase.update(
          'users',
          { role: 'admin' },
          [{ key: 'id', value: authUser.id }],
        );

        if (updateError) {
          console.error('Supabase admin update error:', updateError);
          return current;
        }

        return { ...current, role: 'admin' as const };
      }

      return current;
    }

    const newUser: User = {
      id: authUser.id,
      name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
      email: authUser.email || '',
      avatar: authUser.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${authUser.id}`,
      role: isAdminEmail ? 'admin' : requestedRole,
      businessId: requestedRole === 'owner' ? `b_${authUser.id}` : undefined,
    };

    const { data, error } = await supabase.insert('users', newUser, true);

    if (error) {
      console.error('Supabase getOrCreateProfile insert error:', error);
      return null;
    }

    return data as User;
  },

  async upsertPostcard(postcard: BusinessPostcard) {
    const docId = `${postcard.title}_${postcard.city}`.replace(/\s+/g, '_').toLowerCase();

    const { error } = await supabase.upsert(
      'business_postcards',
      {
        ...postcard,
        id: docId,
        updatedAt: new Date().toISOString(),
      },
      'id',
    );

    if (error) {
      console.error('Supabase upsertPostcard error:', error);
      return { success: false };
    }

    return { success: true, id: docId };
  },

  async getPostcards(governorate?: string) {
    const filters: Array<{ key: string; op: 'eq' | 'ilike' | 'gt'; value: string | number | boolean }> = [];

    if (governorate && governorate !== 'all') {
      filters.push({ key: 'governorate', op: 'eq', value: governorate });
    }

    const { data, error } = await supabase.select('business_postcards', {
      filters,
      order: { column: 'updatedAt', ascending: false },
    });

    if (error) {
      console.error('Supabase getPostcards error:', error);
      return [];
    }

    return ((data as any[]) || []).map((postcard) => ({
      ...postcard,
      updatedAt: postcard.updatedAt ? new Date(postcard.updatedAt) : undefined,
    })) as BusinessPostcard[];
  },

  async updateProfile(userId: string, data: Partial<User>) {
    const { error } = await supabase.update(
      'users',
      { ...data, updatedAt: new Date().toISOString() },
      [{ key: 'id', value: userId }],
    );

    if (error) {
      console.error('Supabase updateProfile error:', error);
      return { success: false };
    }

    return { success: true };
  },
};
