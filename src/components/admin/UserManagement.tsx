import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Users, Shield, ShieldOff, Search } from 'lucide-react';

interface UserWithRole {
  id: string;
  username: string;
  isAdmin: boolean;
}

export const UserManagement = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      // Get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username')
        .order('username');

      if (profilesError) {
        console.error('Error loading profiles:', profilesError);
        return;
      }

      // Get admin roles
      const { data: adminRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin');

      if (rolesError) {
        console.error('Error loading roles:', rolesError);
      }

      const adminUserIds = new Set(adminRoles?.map(r => r.user_id) || []);

      const usersWithRoles: UserWithRole[] = (profiles || []).map(profile => ({
        id: profile.id,
        username: profile.username,
        isAdmin: adminUserIds.has(profile.id)
      }));

      setUsers(usersWithRoles);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleAdminRole = async (userId: string, currentlyAdmin: boolean) => {
    setUpdating(userId);

    try {
      if (currentlyAdmin) {
        // Remove admin role
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', 'admin');

        if (error) throw error;

        setUsers(users.map(u => 
          u.id === userId ? { ...u, isAdmin: false } : u
        ));

        toast({
          title: 'Role Updated',
          description: 'Admin role has been removed.'
        });
      } else {
        // Add admin role
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: 'admin' });

        if (error) throw error;

        setUsers(users.map(u => 
          u.id === userId ? { ...u, isAdmin: true } : u
        ));

        toast({
          title: 'Role Updated',
          description: 'Admin role has been granted.'
        });
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: (err as Error).message,
        variant: 'destructive'
      });
    } finally {
      setUpdating(null);
    }
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <Users className="w-5 h-5 text-primary" />
        <div>
          <h3 className="font-semibold text-foreground">User Management</h3>
          <p className="text-sm text-muted-foreground">
            Manage user roles and permissions
          </p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="space-y-2">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No users found
          </div>
        ) : (
          filteredUsers.map(user => (
            <div
              key={user.id}
              className="flex items-center justify-between p-3 rounded-lg border border-border bg-card"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-medium text-primary">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-foreground">{user.username}</p>
                  <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                    {user.id}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {user.isAdmin && (
                  <Badge variant="secondary" className="text-xs">
                    <Shield className="w-3 h-3 mr-1" />
                    Admin
                  </Badge>
                )}
                
                <Button
                  variant={user.isAdmin ? 'outline' : 'default'}
                  size="sm"
                  onClick={() => toggleAdminRole(user.id, user.isAdmin)}
                  disabled={updating === user.id}
                >
                  {updating === user.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : user.isAdmin ? (
                    <>
                      <ShieldOff className="w-4 h-4 mr-1" />
                      Remove Admin
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 mr-1" />
                      Make Admin
                    </>
                  )}
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
