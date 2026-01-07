import { supabase } from '@/integrations/supabase/client';

interface DbResponse<T> {
  data: T | null;
  error: string | null;
}

// Check if external DB is configured (cached)
let externalDbConfigured: boolean | null = null;

async function checkExternalDbConfig(): Promise<boolean> {
  if (externalDbConfigured !== null) {
    return externalDbConfigured;
  }

  try {
    const { data, error } = await supabase.functions.invoke('db-proxy', {
      body: { operation: 'get-config' }
    });

    if (error) {
      externalDbConfigured = false;
      return false;
    }

    externalDbConfigured = data?.isExternalConfigured === true;
    return externalDbConfigured;
  } catch {
    externalDbConfigured = false;
    return false;
  }
}

export function resetDbConfigCache() {
  externalDbConfigured = null;
}

export const dbClient = {
  async select<T = unknown>(table: string, options: { columns?: string; order?: { column: string; ascending: boolean }; limit?: number } = {}): Promise<DbResponse<T[]>> {
    const useProxy = await checkExternalDbConfig();

    if (useProxy) {
      const { data, error } = await supabase.functions.invoke('db-proxy', {
        body: { operation: 'select', table, ...options }
      });
      return { data: data?.data || null, error: data?.error || error?.message || null };
    }

    // Direct Supabase fallback
    const { data, error } = await supabase
      .from(table as 'high_scores')
      .select(options.columns || '*')
      .order(options.order?.column || 'created_at', { ascending: options.order?.ascending ?? false })
      .limit(options.limit || 100);

    return { data: data as T[] | null, error: error?.message || null };
  },

  async insert<T = unknown>(table: string, insertData: Record<string, unknown>): Promise<DbResponse<T>> {
    const useProxy = await checkExternalDbConfig();

    if (useProxy) {
      const { data, error } = await supabase.functions.invoke('db-proxy', {
        body: { operation: 'insert', table, data: insertData }
      });
      return { data: data?.data || null, error: data?.error || error?.message || null };
    }

    const { data, error } = await supabase
      .from(table as 'high_scores')
      .insert(insertData as never)
      .select()
      .single();

    return { data: data as T | null, error: error?.message || null };
  },

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('db-proxy', {
        body: { operation: 'test-connection' }
      });
      if (error) return { success: false, message: error.message };
      return { success: data?.success || false, message: data?.message || 'Unknown error' };
    } catch (err) {
      return { success: false, message: (err as Error).message };
    }
  }
};
