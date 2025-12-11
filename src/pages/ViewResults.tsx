import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Gift, Search, ArrowLeft, PartyPopper } from 'lucide-react';
import { Snowfall } from '@/components/Snowfall';

const VIEWER_LOG_KEY = 'secretsanta_viewers';

interface Assignment {
  giver: string;
  receiver: string;
}

interface ViewerLogEntry {
  name: string;
  receiver: string;
  viewedAt: string;
}

const ViewResults: React.FC = () => {
  const [name, setName] = useState('');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [myAssignment, setMyAssignment] = useState<Assignment | null>(null);
  const [searched, setSearched] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('secretsanta_assignments');
    if (stored) {
      setAssignments(JSON.parse(stored));
    }
  }, []);

  const recordView = (assignment: Assignment) => {
    try {
      const stored = localStorage.getItem(VIEWER_LOG_KEY);
      const parsed: ViewerLogEntry[] = stored ? JSON.parse(stored) : [];
      const filtered = parsed.filter(
        (entry) => entry.name.toLowerCase() !== assignment.giver.toLowerCase()
      );
      const updated: ViewerLogEntry[] = [
        ...filtered,
        { name: assignment.giver, receiver: assignment.receiver, viewedAt: new Date().toISOString() },
      ];
      localStorage.setItem(VIEWER_LOG_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error("Failed to record viewer", error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const found = assignments.find(
      (a) => a.giver.toLowerCase() === name.toLowerCase().trim()
    );
    setMyAssignment(found || null);
    setSearched(true);

    if (found) {
      recordView(found);
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
              <Search className="w-5 h-5" />
              Enter Your Name
            </CardTitle>
            <CardDescription>
              Find out who you're getting a gift for
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {assignments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Gift className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No assignments have been generated yet.</p>
                <p className="text-sm mt-2">Please wait for the admin to create the Secret Santa draw.</p>
              </div>
            ) : (
              <>
                <form onSubmit={handleSearch} className="space-y-4">
                  <Input
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setSearched(false);
                    }}
                    className="border-christmas-green/30 focus:border-christmas-red"
                  />
                  <Button 
                    type="submit" 
                    className="w-full" 
                    variant="christmas"
                    disabled={!name.trim()}
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Find My Assignment
                  </Button>
                </form>

                {searched && (
                  <div className="mt-6">
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
                      <div className="text-center p-6 bg-destructive/10 rounded-lg border border-destructive/30">
                        <p className="text-destructive font-medium">
                          Name not found in the participant list.
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                          Please check the spelling and try again.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ViewResults;
