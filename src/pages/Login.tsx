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
    
    // Placeholder - will be connected to Lovable Cloud
    toast({
      title: isLogin ? "Login" : "Registration",
      description: "Connect Lovable Cloud to enable authentication!",
    });
  };

  return (
    <ArcadeCabinet title={isLogin ? "LOGIN" : "REGISTER"}>
      <div className="max-w-md mx-auto p-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="mb-6 text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          BACK TO MENU
        </Button>

        <div className="stats-panel-accent p-6 space-y-6 rounded-sm">
          <div className="text-center">
            <h2 
              className="font-arcade text-sm text-primary"
              style={{ textShadow: 'var(--shadow-neon-cyan)' }}
            >
              {isLogin ? 'PLAYER LOGIN' : 'NEW PLAYER'}
            </h2>
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mt-3" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="font-arcade text-[10px] text-muted-foreground flex items-center gap-2">
                <User className="w-3 h-3" />
                USERNAME
              </label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ENTER USERNAME"
                className="font-retro text-lg bg-background/50 border-primary/50"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="font-arcade text-[10px] text-muted-foreground flex items-center gap-2">
                <Lock className="w-3 h-3" />
                PASSWORD
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="ENTER PASSWORD"
                className="font-retro text-lg bg-background/50 border-primary/50"
                required
              />
            </div>

            <Button 
              type="submit" 
              variant="neon" 
              size="lg" 
              className="w-full arcade-button"
            >
              {isLogin ? (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  LOGIN
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5 mr-2" />
                  REGISTER
                </>
              )}
            </Button>
          </form>

          <div className="text-center">
            <Button
              variant="ghost"
              onClick={() => setIsLogin(!isLogin)}
              className="font-retro text-sm text-muted-foreground hover:text-primary"
            >
              {isLogin ? "NEW PLAYER? REGISTER HERE" : "HAVE ACCOUNT? LOGIN HERE"}
            </Button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="font-retro text-muted-foreground/60 text-sm">
            LOGIN TO SAVE YOUR HIGH SCORES
          </p>
        </div>
      </div>
    </ArcadeCabinet>
  );
};

export default Login;
