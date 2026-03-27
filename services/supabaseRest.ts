const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

const SUPABASE_REST_BASE = SUPABASE_URL ? `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1` : '';

export interface SupabaseRestError {
  message: string;
  status: number;
  details?: string;
}

/**
 * Builds query-string parameters for Supabase PostgREST calls.
 */
function buildQuery(params: Record<string, string | number | undefined>): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      searchParams.set(key, String(value));
    }
  });
  return searchParams.toString();
}

/**
 * Executes a typed Supabase REST request and normalizes errors.
 */
async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!SUPABASE_REST_BASE || !SUPABASE_ANON_KEY) {
    throw new Error('Missing Supabase configuration. Expected VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }

  const response = await fetch(`${SUPABASE_REST_BASE}/${path}`, {
    ...init,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      ...(init.headers || {})
    }
  });

  if (!response.ok) {
    let details: SupabaseRestError | undefined;
    try {
      details = await response.json();
    } catch {
      // Ignore JSON parsing failures and fallback to status text.
    }

    throw new Error(JSON.stringify({
      status: response.status,
      message: details?.message || response.statusText,
      details: details?.details
    }));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

/**
 * Reads rows from a table with optional filtering and ordering.
 */
export async function selectRows<T>(
  table: string,
  params: Record<string, string | number | undefined>,
  options: { count?: 'exact'; head?: boolean } = {}
): Promise<{ data: T[]; count: number | null }> {
  if (!SUPABASE_REST_BASE || !SUPABASE_ANON_KEY) {
    throw new Error('Missing Supabase configuration. Expected VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }
  const query = buildQuery(params);
  const path = query ? `${table}?${query}` : table;

  const response = await fetch(`${SUPABASE_REST_BASE}/${path}`, {
    method: 'GET',
    headers: {
      apikey: SUPABASE_ANON_KEY || '',
      Authorization: `Bearer ${SUPABASE_ANON_KEY || ''}`,
      'Content-Type': 'application/json',
      ...(options.count ? { Prefer: `count=${options.count}` } : {}),
    }
  });

  if (!response.ok) {
    let details: SupabaseRestError | undefined;
    try {
      details = await response.json();
    } catch {
      // Ignore parsing failure.
    }
    throw new Error(JSON.stringify({
      status: response.status,
      message: details?.message || response.statusText,
      details: details?.details
    }));
  }

  const countHeader = response.headers.get('content-range');
  const count = countHeader?.includes('/') ? Number(countHeader.split('/')[1]) : null;
  const data = options.head ? [] as T[] : await response.json() as T[];

  return { data, count: Number.isFinite(count) ? count : null };
}

/**
 * Inserts a row and returns the created payload.
 */
export async function insertRow<T>(table: string, row: Record<string, unknown>): Promise<T> {
  return request<T>(table, {
    method: 'POST',
    headers: {
      Prefer: 'return=representation'
    },
    body: JSON.stringify(row)
  }).then((rows) => (Array.isArray(rows) ? rows[0] : rows) as T);
}

/**
 * Upserts a row using the supplied conflict column list.
 */
export async function upsertRow<T>(table: string, row: Record<string, unknown>, onConflict: string): Promise<T> {
  return request<T>(`${table}?on_conflict=${encodeURIComponent(onConflict)}`, {
    method: 'POST',
    headers: {
      Prefer: 'resolution=merge-duplicates,return=representation'
    },
    body: JSON.stringify(row)
  }).then((rows) => (Array.isArray(rows) ? rows[0] : rows) as T);
}

/**
 * Updates rows that match a filter query and returns updated payloads.
 */
export async function updateRows<T>(
  table: string,
  params: Record<string, string | number | undefined>,
  patch: Record<string, unknown>
): Promise<T[]> {
  const query = buildQuery(params);
  const path = query ? `${table}?${query}` : table;
  return request<T[]>(path, {
    method: 'PATCH',
    headers: {
      Prefer: 'return=representation'
    },
    body: JSON.stringify(patch)
  });
}
