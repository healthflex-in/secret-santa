import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Snowfall } from '@/components/Snowfall';

const Login: React.FC = () => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      const success = login(password);
      if (success) {
        toast({
          title: "Welcome, Admin!",
          description: "You now have access to the Secret Santa dashboard.",
        });
        navigate('/');
      } else {
        toast({
          title: "Invalid Password",
          description: "Please check your admin password and try again.",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    }, 500);
  };

  const handleViewerAccess = () => {
    navigate('/view');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-christmas-dark to-christmas-green flex items-center justify-center p-4 relative overflow-hidden">
      <Snowfall />
      
      <div className="w-full max-w-md z-10">
        <div className="text-center mb-8">
          <img
            src="/Stance-christmas-logo.png"
            alt="Stance's Secret Santa"
            className="w-24 h-24 rounded-full object-cover mb-4 shadow-lg mx-auto"
          />
          <h1 className="text-4xl font-display font-bold text-christmas-snow mb-2">
            Stance&apos;s Secret Santa
          </h1>
          <p className="text-christmas-gold font-medium">
            🎄 Gift Exchange Headquarters 🎄
          </p>
        </div>

        <Card className="bg-christmas-snow/95 backdrop-blur border-christmas-gold/30">
          <CardHeader className="text-center">
            <CardTitle className="text-christmas-dark flex items-center justify-center gap-2">
              <Lock className="w-5 h-5" />
              Admin Login
            </CardTitle>
            <CardDescription>
              Enter the admin password to manage participants
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <Input
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-christmas-green/30 focus:border-christmas-red"
              />
              <Button 
                type="submit" 
                className="w-full" 
                variant="christmas"
                disabled={isLoading || !password}
              >
                {isLoading ? "Verifying..." : "Login as Admin"}
              </Button>
            </form>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-christmas-green/20" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-christmas-snow px-2 text-muted-foreground">
                  Or
                </span>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              className="w-full border-christmas-green/30 hover:bg-christmas-green/10"
              onClick={handleViewerAccess}
            >
              <Eye className="w-4 h-4 mr-2" />
              View Results Only
            </Button>
          </CardContent>
        </Card>

        <p className="text-center text-christmas-snow/60 text-sm mt-6">
          Viewers can only see their assigned Secret Santa
        </p>
      </div>
    </div>
  );
};

export default Login;
