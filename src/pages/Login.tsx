import { useState } from 'react';
import { ArcadeCabinet } from '@/components/ArcadeCabinet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, User, Lock, UserPlus, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    toast({
      title: isLogin ? "Login" : "Registration",
      description: "Connect Lovable Cloud to enable authentication!",
    });
  };

  return (
    <ArcadeCabinet title={isLogin ? "Login" : "Register"}>
      <div className="max-w-md mx-auto p-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="mb-6 text-muted-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Menu
        </Button>

        <div className="stats-panel p-6 space-y-6">
          <div className="text-center">
            <h2 className="text-lg font-medium text-foreground">
              {isLogin ? 'Player Login' : 'New Player'}
            </h2>
            <div className="w-16 h-px bg-border mx-auto mt-3" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground flex items-center gap-2">
                <User className="w-3 h-3" />
                Username
              </label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="bg-background"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-muted-foreground flex items-center gap-2">
                <Lock className="w-3 h-3" />
                Password
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="bg-background"
                required
              />
            </div>

            <Button 
              type="submit" 
              variant="default" 
              size="lg" 
              className="w-full"
            >
              {isLogin ? (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  Login
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5 mr-2" />
                  Register
                </>
              )}
            </Button>
          </form>

          <div className="text-center">
            <Button
              variant="ghost"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground"
            >
              {isLogin ? "New player? Register here" : "Have account? Login here"}
            </Button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-muted-foreground text-sm">
            Login to save your high scores
          </p>
        </div>
      </div>
    </ArcadeCabinet>
  );
};

export default Login;
