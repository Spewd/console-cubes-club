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
    port: configMap.get('db_port') || '5432',
    database,
    username,
    password,
    ssl: configMap.get('db_ssl') === 'true'
  };
}

// Execute query on external PostgreSQL using pg driver
async function executeExternalQuery(config: DbConfig, operation: string, params: RequestBody) {
  // Dynamic import of postgres driver
  const postgres = (await import('https://deno.land/x/postgresjs@v3.4.4/mod.js')).default;
  
  const sql = postgres({
    host: config.host,
    port: parseInt(config.port),
    database: config.database,
    username: config.username,
    password: config.password,
    ssl: config.ssl ? 'require' : false,
  });

  try {
    switch (operation) {
      case 'test-connection': {
        await sql`SELECT 1 as connected`;
        await sql.end();
        return { success: true, message: 'Connection successful!' };
      }
      
      case 'select': {
        const table = params.table!;
        const columns = params.columns || '*';
        const limit = params.limit || 100;
        const order = params.order;
        
        let query = `SELECT ${columns} FROM ${table}`;
        
        if (params.filters && Object.keys(params.filters).length > 0) {
          const conditions = Object.entries(params.filters)
            .map(([key, value]) => `${key} = '${value}'`)
            .join(' AND ');
          query += ` WHERE ${conditions}`;
        }
        
        if (order) {
          query += ` ORDER BY ${order.column} ${order.ascending ? 'ASC' : 'DESC'}`;
        }
        
        query += ` LIMIT ${limit}`;
        
        const result = await sql.unsafe(query);
        await sql.end();
        return { data: result, error: null };
      }
      
      case 'insert': {
        const table = params.table!;
        const data = params.data as Record<string, unknown>;
        const keys = Object.keys(data);
        const values = Object.values(data).map(v => 
          typeof v === 'string' ? `'${v}'` : v
        );
        
        const query = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${values.join(', ')}) RETURNING *`;
        const result = await sql.unsafe(query);
        await sql.end();
        return { data: result[0], error: null };
      }
      
      case 'update': {
        const table = params.table!;
        const data = params.data as Record<string, unknown>;
        const sets = Object.entries(data)
          .map(([key, value]) => `${key} = ${typeof value === 'string' ? `'${value}'` : value}`)
          .join(', ');
        
        let query = `UPDATE ${table} SET ${sets}`;
        
        if (params.filters && Object.keys(params.filters).length > 0) {
          const conditions = Object.entries(params.filters)
            .map(([key, value]) => `${key} = '${value}'`)
            .join(' AND ');
          query += ` WHERE ${conditions}`;
        }
        
        query += ' RETURNING *';
        
        const result = await sql.unsafe(query);
        await sql.end();
        return { data: result, error: null };
      }
      
      case 'delete': {
        const table = params.table!;
        
        if (!params.filters || Object.keys(params.filters).length === 0) {
          await sql.end();
          return { error: 'Delete requires filters for safety' };
        }
        
        const conditions = Object.entries(params.filters)
          .map(([key, value]) => `${key} = '${value}'`)
          .join(' AND ');
        
        const query = `DELETE FROM ${table} WHERE ${conditions} RETURNING *`;
        const result = await sql.unsafe(query);
        await sql.end();
        return { data: result, error: null };
      }
      
      default:
        await sql.end();
        return { error: 'Unknown operation' };
    }
  } catch (err) {
    console.error('External DB error:', err);
    await sql.end();
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
      // Use external database
      console.log(`Using external DB: ${dbConfig.host}/${dbConfig.database}`);
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
