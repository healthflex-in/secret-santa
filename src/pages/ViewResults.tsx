import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Gift, ArrowLeft, PartyPopper, Mail, LogOut, Search } from 'lucide-react';
import { Snowfall } from '@/components/Snowfall';
import { database, Assignment, ViewerLogEntry } from '@/lib/database';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

const ViewResults: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [myAssignment, setMyAssignment] = useState<Assignment | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const checkEmailAuthorization = async (email: string) => {
    if (!email) return;
    
    const result = await database.isEmailAuthorized(email);
    if (result.authorized && result.name) {
      setIsAuthorized(true);
      setUserName(result.name);
    } else {
      setIsAuthorized(false);
      toast({
        title: "Email not authorized",
        description: "Your email is not in the authorized list. Please contact the admin.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    // Handle OAuth callback - check for hash fragments from redirect
    const handleAuthCallback = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
        setIsLoading(false);
        return;
      }

      if (session?.user) {
        setUser(session.user);
        await checkEmailAuthorization(session.user.email || '');
      }
      setIsLoading(false);
    };

    handleAuthCallback();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        await checkEmailAuthorization(session.user.email || '');
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsAuthorized(false);
        setUserName(null);
        setMyAssignment(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const loadAssignments = async () => {
      const data = await database.getAssignments();
      setAssignments(data);
      
      // If user is authorized and we have their name, auto-load assignment
      if (isAuthorized && userName && data.length > 0) {
        const found = data.find(
          (a) => a.giver.toLowerCase() === userName.toLowerCase()
        );
        if (found) {
          setMyAssignment(found);
          await recordView(found);
        }
      }
    };
    loadAssignments();
  }, [isAuthorized, userName]);

  const recordView = async (assignment: Assignment) => {
    const entry: ViewerLogEntry = {
      name: assignment.giver,
      receiver: assignment.receiver,
      viewedAt: new Date().toISOString(),
    };
    await database.addViewerLogEntry(entry);
  };

  const handleGoogleLogin = async () => {
    try {
      // Use the current origin for redirect (works for both localhost and production)
      // Vercel will automatically use the correct production URL
      const redirectUrl = window.location.origin + '/view';
      
      const { error, data } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            prompt: 'select_account', // Force Google to show account picker every time
            access_type: 'offline',
          },
        },
      });
      
      if (error) {
        if (error.message?.includes('not enabled') || error.message?.includes('Unsupported provider')) {
          toast({
            title: "Google Auth not configured",
            description: "Please enable Google OAuth in your Supabase dashboard. See SUPABASE_SETUP.md for instructions.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
      }
      // The OAuth flow will redirect the user to Google, then back to /view
      // No need to do anything else here - the redirect happens automatically
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Failed to sign in with Google. Please check Supabase configuration.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    try {
      // Sign out from Supabase (clears session)
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({
          title: "Logout error",
          description: error.message || "Failed to logout",
          variant: "destructive",
        });
        return;
      }
      
      // Clear state immediately
      setUser(null);
      setIsAuthorized(false);
      setUserName(null);
      setMyAssignment(null);
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out. Click 'Sign in with Google' to login with a different account.",
      });
    } catch (error: any) {
      toast({
        title: "Logout error",
        description: error.message || "An error occurred during logout",
        variant: "destructive",
      });
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-b from-christmas-dark to-christmas-green flex items-center justify-center p-4 relative overflow-hidden">
      <Snowfall />
      
      <div className="w-full max-w-md z-10">
        <Button 
          variant="ghost" 
          className="text-christmas-snow hover:bg-christmas-snow/10 mb-4"
          onClick={() => navigate('/login')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Login
        </Button>

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
            🎁 Find your match and keep it secret 🎁
          </p>
        </div>

        <Card className="bg-christmas-snow/95 backdrop-blur border-christmas-gold/30">
          <CardHeader className="text-center">
            <CardTitle className="text-christmas-dark flex items-center justify-center gap-2">
              {user ? <Mail className="w-5 h-5" /> : <Search className="w-5 h-5" />}
              {user ? 'Your Secret Santa' : 'Login to View Your Assignment'}
            </CardTitle>
            <CardDescription>
              {user 
                ? isAuthorized 
                  ? `Logged in as ${user.email}` 
                  : 'Your email is not authorized'
                : 'Sign in with Google to view your assignment'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading...</p>
              </div>
            ) : assignments.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground mb-4">
                <Gift className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No assignments have been generated yet.</p>
                <p className="text-xs mt-1">Please wait for the admin to create the Secret Santa draw.</p>
              </div>
            ) : user && isAuthorized ? (
              <>
                {myAssignment ? (
                  <div className="text-center p-6 bg-gradient-to-br from-christmas-green/10 to-christmas-red/10 rounded-lg border border-christmas-gold/30">
                    <PartyPopper className="w-12 h-12 mx-auto mb-4 text-christmas-gold" />
                    <p className="text-sm text-muted-foreground mb-2">You are buying a gift for:</p>
                    <p className="text-3xl font-display font-bold text-christmas-red">
                      {myAssignment.receiver}
                    </p>
                    <p className="text-sm text-muted-foreground mt-4">
                      🤫 Keep it a secret!
                    </p>
                  </div>
                ) : (
                  <div className="text-center p-6 bg-muted/10 rounded-lg border border-muted/30">
                    <p className="text-muted-foreground">
                      No assignment found for {userName}. Please contact the admin.
                    </p>
                  </div>
                )}
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : user && !isAuthorized ? (
              <div className="space-y-4">
                <div className="text-center p-4 bg-destructive/10 rounded-lg border border-destructive/30">
                  <p className="text-destructive font-medium">
                    Email not authorized
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Your email ({user.email}) is not in the authorized list.
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Please contact the admin to get access.
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <Button 
                className="w-full bg-white text-gray-900 hover:bg-gray-100 border border-gray-300"
                onClick={handleGoogleLogin}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign in with Google
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ViewResults;
