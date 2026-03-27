import { auth } from '../firebase';
import type { Business, Post, User, BusinessPostcard } from '../types';
import { insertRow, selectRows, updateRows, upsertRow } from './supabaseRest';

export type BusinessCursor = number;

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface DataAccessErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

/**
 * Normalizes and logs Supabase REST access errors while retaining auth context.
 */
function handleDataAccessError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: DataAccessErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Data Access Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Converts timestamp-like values from Supabase into JavaScript Date objects.
 */
function toDate(value: unknown, fallback?: Date): Date {
  if (value instanceof Date) return value;
  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value);
    if (!Number.isNaN(date.valueOf())) {
      return date;
    }
  }
  return fallback ?? new Date();
}

/**
 * Applies the UI-required verified normalization across records.
 */
function withNormalizedVerification<T extends { isVerified?: boolean; verified?: boolean }>(row: T): T {
  return {
    ...row,
    isVerified: row.isVerified ?? row.verified ?? false
  };
}

/**
 * Maps Supabase business rows into the expected UI business shape.
 */
function mapBusiness(row: Record<string, unknown>): Business {
  return withNormalizedVerification({
    ...(row as unknown as Business),
    id: String(row.id)
  });
}

/**
 * Maps Supabase post rows into the expected UI post shape.
 */
function mapPost(row: Record<string, unknown>): Post {
  const mapped = withNormalizedVerification({
    ...(row as unknown as Post),
    id: String(row.id)
  });

  return {
    ...mapped,
    createdAt: toDate((row as any).createdAt)
  };
}

/**
 * Maps Supabase postcard rows into the expected UI postcard shape.
 */
function mapPostcard(row: Record<string, unknown>): BusinessPostcard {
  const mapped = withNormalizedVerification({
    ...(row as unknown as BusinessPostcard),
    id: String(row.id)
  });

  return {
    ...mapped,
    updatedAt: row.updatedAt ? toDate(row.updatedAt, undefined) : undefined
  };
}

/**
 * Adds a polling-based fallback subscription for feeds when direct realtime channels are unavailable.
 */
function createPollingSubscription(callback: (posts: Post[]) => void, intervalMs = 15000) {
  let isCancelled = false;

  const run = async () => {
    try {
      const { data } = await selectRows<Record<string, unknown>>('posts', {
        select: '*',
        order: 'createdAt.desc',
        limit: 50
      });

      if (!isCancelled) {
        callback(data.map(mapPost));
      }
    } catch (error) {
      handleDataAccessError(error, OperationType.GET, 'posts');
    }
  };

  run();
  const timer = window.setInterval(run, intervalMs);

  return () => {
    isCancelled = true;
    window.clearInterval(timer);
  };
}

export const api = {
  /**
   * Fetches paginated businesses using Supabase with the same UI-facing filters and shape.
   */
  async getBusinesses(params: { category?: string; city?: string; governorate?: string; lastDoc?: BusinessCursor; limit?: number; featuredOnly?: boolean } = {}) {
    const path = 'businesses';
    try {
      const pageSize = params.limit || 20;
      const offset = params.lastDoc || 0;
      const trimmedCity = params.city?.trim();
      const queryParams: Record<string, string | number | undefined> = {
        select: '*',
        limit: pageSize,
        offset
      };

      if (trimmedCity) {
        queryParams.city = `ilike.${trimmedCity}%`;
        queryParams.order = 'city.asc,name.asc';
      } else {
        queryParams.order = 'name.asc';
      }

      if (params.category && params.category !== 'all') {
        queryParams.category = `eq.${params.category}`;
      }

      if (params.governorate && params.governorate !== 'all') {
        queryParams.governorate = `eq.${params.governorate}`;
      }

      if (params.featuredOnly) {
        queryParams.isFeatured = 'eq.true';
      }

      const { data } = await selectRows<Record<string, unknown>>(path, queryParams);
      const mapped = data.map(mapBusiness);
      const nextCursor = offset + mapped.length;

      return {
        data: mapped,
        lastDoc: mapped.length > 0 ? nextCursor : undefined,
        hasMore: mapped.length === pageSize
      };
    } catch (error) {
      handleDataAccessError(error, OperationType.GET, path);
      return { data: [], hasMore: false as const, lastDoc: undefined };
    }
  },

  /**
   * Subscribes to social posts via polling while preserving callback + unsubscribe contract.
   */
  subscribeToPosts(callback: (posts: Post[]) => void) {
    return createPollingSubscription(callback);
  },

  /**
   * Fetches the latest deals as a one-time read ordered by createdAt descending.
   */
  async getDeals() {
    const path = 'deals';
    try {
      const { data } = await selectRows<Record<string, unknown>>(path, {
        select: '*',
        order: 'createdAt.desc',
        limit: 10
      });
      return data.map(row => ({ id: String(row.id), ...row } as any));
    } catch (error) {
      handleDataAccessError(error, OperationType.GET, path);
      return [];
    }
  },

  /**
   * Fetches recent stories ordered by createdAt descending with a fixed limit.
   */
  async getStories() {
    const path = 'stories';
    try {
      const { data } = await selectRows<Record<string, unknown>>(path, {
        select: '*',
        order: 'createdAt.desc',
        limit: 20
      });
      return data.map(row => ({ id: String(row.id), ...row } as any));
    } catch (error) {
      handleDataAccessError(error, OperationType.GET, path);
      return [];
    }
  },

  /**
   * Fetches events sorted by date ascending and optionally filtered by category and governorate.
   */
  async getEvents(params: { category?: string; governorate?: string } = {}) {
    const path = 'events';
    try {
      const queryParams: Record<string, string | number | undefined> = {
        select: '*',
        order: 'date.asc'
      };

      if (params.category && params.category !== 'all') {
        queryParams.category = `eq.${params.category}`;
      }

      if (params.governorate && params.governorate !== 'all') {
        queryParams.governorate = `eq.${params.governorate}`;
      }

      const { data } = await selectRows<Record<string, unknown>>(path, queryParams);
      return data.map(row => ({
        ...row,
        id: String(row.id),
        date: toDate(row.date)
      }) as any);
    } catch (error) {
      handleDataAccessError(error, OperationType.GET, path);
      return [];
    }
  },

  /**
   * Creates a new post and assigns server-side creation defaults.
   */
  async createPost(postData: Partial<Post>) {
    const path = 'posts';
    try {
      const created = await insertRow<Record<string, unknown>>(path, {
        ...postData,
        createdAt: new Date().toISOString(),
        likes: 0
      });
      return { success: true, id: String(created.id) };
    } catch (error) {
      handleDataAccessError(error, OperationType.WRITE, path);
      return { success: false };
    }
  },

  /**
   * Reads an existing profile and creates one when missing, including admin-email bootstrapping.
   */
  async getOrCreateProfile(firebaseUser: any, requestedRole: 'user' | 'owner' = 'user') {
    if (!firebaseUser) return null;

    const path = `users/${firebaseUser.uid}`;
    try {
      const { data: existingUsers } = await selectRows<User>('users', {
        select: '*',
        id: `eq.${firebaseUser.uid}`,
        limit: 1
      });

      const existingUser = existingUsers[0];
      const adminEmail = 'safaribosafar@gmail.com';
      const isAdminEmail = firebaseUser.email === adminEmail && firebaseUser.emailVerified;

      if (existingUser) {
        if (isAdminEmail && existingUser.role !== 'admin') {
          const [updated] = await updateRows<User>('users', { id: `eq.${firebaseUser.uid}` }, { role: 'admin' });
          return updated;
        }
        return existingUser;
      }

      const newUser: User = {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
        email: firebaseUser.email || '',
        avatar: firebaseUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUser.uid}`,
        role: isAdminEmail ? 'admin' as any : requestedRole,
        businessId: requestedRole === 'owner' ? `b_${firebaseUser.uid}` : undefined
      };

      await insertRow<User>('users', newUser as unknown as Record<string, unknown>);
      return newUser;
    } catch (error) {
      handleDataAccessError(error, OperationType.WRITE, path);
      return null;
    }
  },

  /**
   * Upserts a business postcard record by deterministic id to preserve previous merge behavior.
   */
  async upsertPostcard(postcard: BusinessPostcard) {
    const path = 'business_postcards';
    try {
      const docId = `${postcard.title}_${postcard.city}`.replace(/\s+/g, '_').toLowerCase();
      await upsertRow<Record<string, unknown>>(path, {
        ...postcard,
        id: docId,
        updatedAt: new Date().toISOString()
      }, 'id');

      return { success: true, id: docId };
    } catch (error) {
      handleDataAccessError(error, OperationType.WRITE, path);
      return { success: false };
    }
  },

  /**
   * Fetches postcards sorted by updatedAt and supports governorate filtering.
   */
  async getPostcards(governorate?: string) {
    const path = 'business_postcards';
    try {
      const queryParams: Record<string, string | number | undefined> = {
        select: '*',
        order: 'updatedAt.desc'
      };

      if (governorate && governorate !== 'all') {
        queryParams.governorate = `eq.${governorate}`;
      }

      const { data } = await selectRows<Record<string, unknown>>(path, queryParams);
      return data.map(mapPostcard);
    } catch (error) {
      handleDataAccessError(error, OperationType.GET, path);
      return [];
    }
  },

  /**
   * Applies partial profile updates by user id and stamps updatedAt.
   */
  async updateProfile(userId: string, data: Partial<User>) {
    const path = `users/${userId}`;
    try {
      await updateRows<User>('users', { id: `eq.${userId}` }, {
        ...data,
        updatedAt: new Date().toISOString()
      });
      return { success: true };
    } catch (error) {
      handleDataAccessError(error, OperationType.WRITE, path);
      return { success: false };
    }
  }
};
