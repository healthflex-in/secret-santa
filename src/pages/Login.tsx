import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Lock, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Snowfall } from '@/components/Snowfall';

const Login: React.FC = () => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const success = await login(password);
      if (success) {
        toast({
          title: "Welcome, Admin!",
          description: "You now have access to the Secret Santa dashboard.",
        });
        setIsDialogOpen(false);
        setPassword('');
        navigate('/');
      } else {
        toast({
          title: "Invalid Password",
          description: "Please check your admin password and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred during login. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewerAccess = () => {
    navigate('/view');
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        backgroundImage: 'url(/fix-flex-feel-festive.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <Snowfall />
      
      {/* Admin button in top right corner */}
      <div className="absolute top-4 right-4 z-20">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              className="border-christmas-gold/30 hover:bg-christmas-gold/10 text-christmas-snow"
            >
              <Lock className="w-4 h-4 mr-2" />
              Admin
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white border-christmas-gold/30">
            <DialogHeader>
              <DialogTitle className="text-christmas-dark flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Admin Login
              </DialogTitle>
              <DialogDescription>
                Enter the admin password to manage participants
              </DialogDescription>
            </DialogHeader>
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
          </DialogContent>
        </Dialog>
      </div>
      
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
          <CardContent className="pt-6">
            <Button 
              variant="outline" 
              className="w-full border-christmas-green/30 hover:bg-christmas-green/10"
              onClick={handleViewerAccess}
            >
              <Eye className="w-4 h-4 mr-2" />
              View Your Recipient
            </Button>
          </CardContent>
        </Card>

        <p className="text-center text-christmas-snow/60 text-sm mt-6">
          Viewers can only see their assigned recipient
        </p>
      </div>
    </div>
  );
};

export default Login;
