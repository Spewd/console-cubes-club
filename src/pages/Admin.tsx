import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArcadeCabinet } from '@/components/ArcadeCabinet';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Database, Users, Loader2 } from 'lucide-react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { DatabaseConfig } from '@/components/admin/DatabaseConfig';
import { UserManagement } from '@/components/admin/UserManagement';

const Admin = () => {
  const navigate = useNavigate();
  const { isAdmin, loading } = useAdminAuth();

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, loading, navigate]);

  if (loading) {
    return (
      <ArcadeCabinet title="Admin Area">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </ArcadeCabinet>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <ArcadeCabinet title="Admin Area">
      <div className="max-w-3xl mx-auto p-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6 text-muted-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Menu
        </Button>

        <div className="stats-panel p-6">
          <Tabs defaultValue="database" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="database" className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                Database
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Users
              </TabsTrigger>
            </TabsList>

            <TabsContent value="database">
              <DatabaseConfig />
            </TabsContent>

            <TabsContent value="users">
              <UserManagement />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ArcadeCabinet>
  );
};

export default Admin;
