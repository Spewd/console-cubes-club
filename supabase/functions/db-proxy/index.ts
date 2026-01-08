import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DbConfig {
  host: string;
  port: string;
  database: string;
  username: string;
  password: string;
  ssl: boolean;
}

interface RequestBody {
  operation: 'select' | 'insert' | 'update' | 'delete' | 'test-connection' | 'get-config';
  table?: string;
  columns?: string;
  filters?: Record<string, unknown>;
  data?: Record<string, unknown> | Record<string, unknown>[];
  order?: { column: string; ascending: boolean };
  limit?: number;
}

// Get Supabase admin client
function getSupabaseAdmin() {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
}

type SupabaseAdmin = ReturnType<typeof getSupabaseAdmin>;

// Get database configuration from db_config table
async function getDbConfig(supabaseAdmin: SupabaseAdmin): Promise<DbConfig | null> {
  const { data, error } = await supabaseAdmin
    .from('db_config')
    .select('key, value')
    .in('key', ['db_host', 'db_port', 'db_name', 'db_user', 'db_password', 'db_ssl']);

  if (error || !data || data.length === 0) {
    console.log('No custom DB config found, using default Supabase');
    return null;
  }

  const configMap = new Map((data as { key: string; value: string }[]).map(item => [item.key, item.value]));
  
  // Check if all required fields are present
  const host = configMap.get('db_host');
  const database = configMap.get('db_name');
  const username = configMap.get('db_user');
  const password = configMap.get('db_password');
  
  if (!host || !database || !username || !password) {
    console.log('Incomplete DB config, using default Supabase');
    return null;
  }

  return {
    host,
    port: configMap.get('db_port') || '3306', // MySQL default port
    database,
    username,
    password,
    ssl: configMap.get('db_ssl') === 'true'
  };
}

// Escape string values for MySQL
function escapeValue(value: unknown): string {
  if (value === null || value === undefined) {
    return 'NULL';
  }
  if (typeof value === 'number') {
    return String(value);
  }
  if (typeof value === 'boolean') {
    return value ? '1' : '0';
  }
  // Escape single quotes by doubling them
  const str = String(value).replace(/'/g, "''").replace(/\\/g, '\\\\');
  return `'${str}'`;
}

// Execute query on external MySQL database
async function executeExternalQuery(config: DbConfig, operation: string, params: RequestBody) {
  // Dynamic import of MySQL driver for Deno
  const { Client } = await import('https://deno.land/x/mysql@v2.12.1/mod.ts');
  
  const client = await new Client().connect({
    hostname: config.host,
    port: parseInt(config.port),
    db: config.database,
    username: config.username,
    password: config.password,
  });

  try {
    switch (operation) {
      case 'test-connection': {
        await client.query('SELECT 1 as connected');
        await client.close();
        return { success: true, message: 'MySQL connection successful!' };
      }
      
      case 'select': {
        const table = params.table!;
        const columns = params.columns || '*';
        const limit = params.limit || 100;
        const order = params.order;
        
        let query = `SELECT ${columns} FROM \`${table}\``;
        
        if (params.filters && Object.keys(params.filters).length > 0) {
          const conditions = Object.entries(params.filters)
            .map(([key, value]) => `\`${key}\` = ${escapeValue(value)}`)
            .join(' AND ');
          query += ` WHERE ${conditions}`;
        }
        
        if (order) {
          query += ` ORDER BY \`${order.column}\` ${order.ascending ? 'ASC' : 'DESC'}`;
        }
        
        query += ` LIMIT ${limit}`;
        
        console.log('MySQL SELECT query:', query);
        const result = await client.query(query);
        await client.close();
        return { data: result, error: null };
      }
      
      case 'insert': {
        const table = params.table!;
        const data = params.data as Record<string, unknown>;
        const keys = Object.keys(data).map(k => `\`${k}\``);
        const values = Object.values(data).map(v => escapeValue(v));
        
        const query = `INSERT INTO \`${table}\` (${keys.join(', ')}) VALUES (${values.join(', ')})`;
        console.log('MySQL INSERT query:', query);
        
        const result = await client.execute(query);
        
        // Fetch the inserted row using LAST_INSERT_ID()
        let insertedData = null;
        if (result.lastInsertId) {
          const selectResult = await client.query(`SELECT * FROM \`${table}\` WHERE id = ${result.lastInsertId}`);
          insertedData = selectResult[0] || null;
        }
        
        await client.close();
        return { data: insertedData, error: null };
      }
      
      case 'update': {
        const table = params.table!;
        const data = params.data as Record<string, unknown>;
        const sets = Object.entries(data)
          .map(([key, value]) => `\`${key}\` = ${escapeValue(value)}`)
          .join(', ');
        
        let query = `UPDATE \`${table}\` SET ${sets}`;
        
        if (params.filters && Object.keys(params.filters).length > 0) {
          const conditions = Object.entries(params.filters)
            .map(([key, value]) => `\`${key}\` = ${escapeValue(value)}`)
            .join(' AND ');
          query += ` WHERE ${conditions}`;
        }
        
        console.log('MySQL UPDATE query:', query);
        await client.execute(query);
        
        // Fetch updated rows
        let selectQuery = `SELECT * FROM \`${table}\``;
        if (params.filters && Object.keys(params.filters).length > 0) {
          const conditions = Object.entries(params.filters)
            .map(([key, value]) => `\`${key}\` = ${escapeValue(value)}`)
            .join(' AND ');
          selectQuery += ` WHERE ${conditions}`;
        }
        const result = await client.query(selectQuery);
        
        await client.close();
        return { data: result, error: null };
      }
      
      case 'delete': {
        const table = params.table!;
        
        if (!params.filters || Object.keys(params.filters).length === 0) {
          await client.close();
          return { error: 'Delete requires filters for safety' };
        }
        
        // Fetch rows before deleting (MySQL doesn't have RETURNING)
        const conditions = Object.entries(params.filters)
          .map(([key, value]) => `\`${key}\` = ${escapeValue(value)}`)
          .join(' AND ');
        
        const selectQuery = `SELECT * FROM \`${table}\` WHERE ${conditions}`;
        const toDelete = await client.query(selectQuery);
        
        const query = `DELETE FROM \`${table}\` WHERE ${conditions}`;
        console.log('MySQL DELETE query:', query);
        await client.execute(query);
        
        await client.close();
        return { data: toDelete, error: null };
      }
      
      default:
        await client.close();
        return { error: 'Unknown operation' };
    }
  } catch (err) {
    console.error('MySQL DB error:', err);
    try {
      await client.close();
    } catch (_) { /* ignore close errors */ }
    return { error: (err as Error).message };
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = getSupabaseAdmin();
    
    // Get auth token from request
    const authHeader = req.headers.get('Authorization');
    let userId: string | null = null;
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabaseAdmin.auth.getUser(token);
      userId = user?.id || null;
    }

    const body: RequestBody = await req.json();
    const { operation } = body;

    console.log(`DB Proxy - Operation: ${operation}, User: ${userId}`);

    // For get-config, just check if external DB is configured
    if (operation === 'get-config') {
      const config = await getDbConfig(supabaseAdmin);
      return new Response(
        JSON.stringify({ 
          isExternalConfigured: config !== null,
          host: config?.host || null
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if external DB is configured
    const dbConfig = await getDbConfig(supabaseAdmin);

    if (dbConfig) {
      // Use external MySQL database
      console.log(`Using external MySQL: ${dbConfig.host}/${dbConfig.database}`);
      const result = await executeExternalQuery(dbConfig, operation, body);
      return new Response(
        JSON.stringify(result),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      // Use default Supabase
      console.log('Using default Supabase database');
      
      // For test-connection with no external config, just confirm Supabase works
      if (operation === 'test-connection') {
        return new Response(
          JSON.stringify({ success: true, message: 'Using default Supabase (no external DB configured)' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Execute on Supabase
      const table = body.table!;
      let query = supabaseAdmin.from(table);

      switch (operation) {
        case 'select': {
          let selectQuery = query.select(body.columns || '*');
          
          if (body.filters) {
            Object.entries(body.filters).forEach(([key, value]) => {
              selectQuery = selectQuery.eq(key, value);
            });
          }
          
          if (body.order) {
            selectQuery = selectQuery.order(body.order.column, { ascending: body.order.ascending });
          }
          
          if (body.limit) {
            selectQuery = selectQuery.limit(body.limit);
          }

          const { data, error } = await selectQuery;
          return new Response(
            JSON.stringify({ data, error: error?.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        case 'insert': {
          const { data, error } = await query.insert(body.data!).select().single();
          return new Response(
            JSON.stringify({ data, error: error?.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        case 'update': {
          let updateQuery = query.update(body.data!);
          
          if (body.filters) {
            Object.entries(body.filters).forEach(([key, value]) => {
              updateQuery = updateQuery.eq(key, value);
            });
          }
          
          const { data, error } = await updateQuery.select();
          return new Response(
            JSON.stringify({ data, error: error?.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        case 'delete': {
          if (!body.filters || Object.keys(body.filters).length === 0) {
            return new Response(
              JSON.stringify({ error: 'Delete requires filters for safety' }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          
          let deleteQuery = query.delete();
          
          Object.entries(body.filters).forEach(([key, value]) => {
            deleteQuery = deleteQuery.eq(key, value);
          });
          
          const { data, error } = await deleteQuery.select();
          return new Response(
            JSON.stringify({ data, error: error?.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        default:
          return new Response(
            JSON.stringify({ error: 'Unknown operation' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
      }
    }
  } catch (err) {
    console.error('DB Proxy error:', err);
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
