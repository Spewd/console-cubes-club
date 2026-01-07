import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { resetDbConfigCache } from '@/lib/dbClient';
import { Loader2, Database, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

interface DbFormData {
  host: string;
  port: string;
  database: string;
  username: string;
  password: string;
  ssl: boolean;
}

export const DatabaseConfig = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'failed'>('unknown');
  
  const [formData, setFormData] = useState<DbFormData>({
    host: '',
    port: '5432',
    database: '',
    username: '',
    password: '',
    ssl: true
  });

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('db_config')
        .select('key, value')
        .in('key', ['db_host', 'db_port', 'db_name', 'db_user', 'db_password', 'db_ssl']);

      if (error) {
        console.error('Error loading config:', error);
        return;
      }

      if (data && data.length > 0) {
        const configMap = new Map(data.map(item => [item.key, item.value]));
        setFormData({
          host: configMap.get('db_host') || '',
          port: configMap.get('db_port') || '5432',
          database: configMap.get('db_name') || '',
          username: configMap.get('db_user') || '',
          password: configMap.get('db_password') || '',
          ssl: configMap.get('db_ssl') === 'true'
        });
        
        if (configMap.get('db_host')) {
          setConnectionStatus('connected');
        }
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setConnectionStatus('unknown');

    try {
      // First save the config temporarily
      await saveConfigValues();
      
      // Then test the connection
      const { data, error } = await supabase.functions.invoke('db-proxy', {
        body: { operation: 'test-connection' }
      });

      if (error || !data?.success) {
        setConnectionStatus('failed');
        toast({
          title: 'Connection Failed',
          description: data?.message || error?.message || 'Could not connect to database',
          variant: 'destructive'
        });
      } else {
        setConnectionStatus('connected');
        toast({
          title: 'Connection Successful',
          description: data.message
        });
      }
    } catch (err) {
      setConnectionStatus('failed');
      toast({
        title: 'Connection Failed',
        description: (err as Error).message,
        variant: 'destructive'
      });
    } finally {
      setTesting(false);
    }
  };

  const saveConfigValues = async () => {
    const configItems = [
      { key: 'db_host', value: formData.host },
      { key: 'db_port', value: formData.port },
      { key: 'db_name', value: formData.database },
      { key: 'db_user', value: formData.username },
      { key: 'db_password', value: formData.password },
      { key: 'db_ssl', value: formData.ssl ? 'true' : 'false' }
    ];

    for (const item of configItems) {
      const { error } = await supabase
        .from('db_config')
        .upsert(
          { key: item.key, value: item.value, updated_at: new Date().toISOString() },
          { onConflict: 'key' }
        );

      if (error) {
        throw new Error(`Failed to save ${item.key}: ${error.message}`);
      }
    }
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      await saveConfigValues();
      resetDbConfigCache();
      
      toast({
        title: 'Configuration Saved',
        description: 'Database configuration has been updated.'
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: (err as Error).message,
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setSaving(true);

    try {
      await supabase
        .from('db_config')
        .delete()
        .in('key', ['db_host', 'db_port', 'db_name', 'db_user', 'db_password', 'db_ssl']);

      setFormData({
        host: '',
        port: '5432',
        database: '',
        username: '',
        password: '',
        ssl: true
      });
      
      setConnectionStatus('unknown');
      resetDbConfigCache();
      
      toast({
        title: 'Configuration Reset',
        description: 'Using default Supabase database.'
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: (err as Error).message,
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Database className="w-5 h-5 text-primary" />
        <div>
          <h3 className="font-semibold text-foreground">External PostgreSQL Database</h3>
          <p className="text-sm text-muted-foreground">
            Configure connection to your self-hosted database
          </p>
        </div>
        <div className="ml-auto">
          {connectionStatus === 'connected' && (
            <div className="flex items-center gap-2 text-sm text-green-500">
              <CheckCircle className="w-4 h-4" />
              Connected
            </div>
          )}
          {connectionStatus === 'failed' && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <XCircle className="w-4 h-4" />
              Failed
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="host">Host</Label>
            <Input
              id="host"
              placeholder="your-server.com"
              value={formData.host}
              onChange={(e) => setFormData({ ...formData, host: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="port">Port</Label>
            <Input
              id="port"
              placeholder="5432"
              value={formData.port}
              onChange={(e) => setFormData({ ...formData, port: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="database">Database Name</Label>
          <Input
            id="database"
            placeholder="hazewave_tetrabas01"
            value={formData.database}
            onChange={(e) => setFormData({ ...formData, database: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              placeholder="postgres"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
        </div>

        <div className="flex items-center justify-between py-2">
          <div className="space-y-0.5">
            <Label>SSL Connection</Label>
            <p className="text-sm text-muted-foreground">
              Require SSL for secure connections
            </p>
          </div>
          <Switch
            checked={formData.ssl}
            onCheckedChange={(checked) => setFormData({ ...formData, ssl: checked })}
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t border-border">
        <Button
          variant="outline"
          onClick={handleTestConnection}
          disabled={testing || !formData.host || !formData.database}
        >
          {testing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Testing...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Test Connection
            </>
          )}
        </Button>
        
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Configuration'
          )}
        </Button>

        <Button variant="ghost" onClick={handleReset} disabled={saving} className="ml-auto">
          Reset to Default
        </Button>
      </div>
    </div>
  );
};
