import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Gift, Users, Shuffle, Plus, Sparkles, TreePine, ChevronDown, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Snowfall } from "@/components/Snowfall";
import { ParticipantCard } from "@/components/ParticipantCard";
import { ExclusionSelector } from "@/components/ExclusionSelector";
import { ResultCard } from "@/components/ResultCard";
import CSVUpload from "@/components/CSVUpload";
import { generateSecretSanta } from "@/lib/secretSanta";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface Exclusion {
  giver: string;
  receiver: string;
}

interface Assignment {
  giver: string;
  receiver: string;
}

const Index = () => {
  const [participants, setParticipants] = useState<string[]>([]);
  const [newName, setNewName] = useState("");
  const [exclusions, setExclusions] = useState<Exclusion[]>([]);
  const [assignments, setAssignments] = useState<Assignment[] | null>(null);
  const [showExclusions, setShowExclusions] = useState(false);
  const { toast } = useToast();
  const { isAdmin, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Load saved assignments
  useEffect(() => {
    const stored = localStorage.getItem('secretsanta_assignments');
    if (stored) {
      setAssignments(JSON.parse(stored));
    }
    const storedParticipants = localStorage.getItem('secretsanta_participants');
    if (storedParticipants) {
      setParticipants(JSON.parse(storedParticipants));
    }
  }, []);

  const addParticipant = () => {
    const name = newName.trim();
    if (!name) return;
    
    if (participants.includes(name)) {
      toast({
        title: "Name already exists",
        description: "Please enter a unique name.",
        variant: "destructive",
      });
      return;
    }

    const newParticipants = [...participants, name];
    setParticipants(newParticipants);
    localStorage.setItem('secretsanta_participants', JSON.stringify(newParticipants));
    setNewName("");
    setAssignments(null);
    localStorage.removeItem('secretsanta_assignments');
  };

  const removeParticipant = (index: number) => {
    const name = participants[index];
    const newParticipants = participants.filter((_, i) => i !== index);
    setParticipants(newParticipants);
    localStorage.setItem('secretsanta_participants', JSON.stringify(newParticipants));
    setExclusions(exclusions.filter((e) => e.giver !== name && e.receiver !== name));
    setAssignments(null);
    localStorage.removeItem('secretsanta_assignments');
  };

  const handleCSVUpload = (names: string[]) => {
    setParticipants(names);
    localStorage.setItem('secretsanta_participants', JSON.stringify(names));
    setExclusions([]);
    setAssignments(null);
    localStorage.removeItem('secretsanta_assignments');
  };

  const handleGenerate = () => {
    if (participants.length < 2) {
      toast({
        title: "Need more participants",
        description: "Add at least 2 people to generate Secret Santa assignments.",
        variant: "destructive",
      });
      return;
    }

    const result = generateSecretSanta(participants, exclusions);
    
    if (!result) {
      toast({
        title: "Cannot generate assignments",
        description: "The exclusion rules make it impossible to assign everyone. Try removing some rules.",
        variant: "destructive",
      });
      return;
    }

    setAssignments(result);
    localStorage.setItem('secretsanta_assignments', JSON.stringify(result));
    toast({
      title: "🎅 Secret Santa Generated!",
      description: "Click reveal to see each person's assignment.",
    });
  };

  const handleReset = () => {
    setAssignments(null);
    localStorage.removeItem('secretsanta_assignments');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-festive-subtle relative overflow-hidden">
      <Snowfall />
      
      {/* Header with logout */}
      <div className="absolute top-4 right-4 z-20">
        <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-foreground">
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
      
      {/* Hero Section */}
      <header className="relative z-10 pt-12 pb-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center gap-2 mb-6">
            <TreePine className="h-8 w-8 text-secondary animate-float" />
            <Gift className="h-10 w-10 text-primary animate-float" style={{ animationDelay: "0.5s" }} />
            <TreePine className="h-8 w-8 text-secondary animate-float" style={{ animationDelay: "1s" }} />
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold text-foreground mb-4">
            Secret Santa
            <span className="block text-primary">Generator</span>
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            {isAdmin ? "Admin Dashboard - Manage participants and generate assignments" : "View your Secret Santa assignment"}
          </p>
          
          {isAdmin && (
            <span className="inline-block mt-4 px-4 py-1 bg-christmas-gold/20 text-christmas-gold rounded-full text-sm font-medium">
              👑 Admin Mode
            </span>
          )}
        </div>
      </header>

      <main className="relative z-10 px-4 pb-16">
        <div className="max-w-2xl mx-auto space-y-8">
          
          {/* CSV Upload Section - Admin Only */}
          {isAdmin && (
            <section className="bg-card rounded-3xl shadow-festive p-6 sm:p-8 border border-border/50">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-christmas-gold/10">
                  <Users className="h-5 w-5 text-christmas-gold" />
                </div>
                <h2 className="text-xl font-display font-semibold text-foreground">
                  Import Participants
                </h2>
              </div>
              <CSVUpload onUpload={handleCSVUpload} />
            </section>
          )}

          {/* Add Participants Section - Admin Only */}
          {isAdmin && (
            <section className="bg-card rounded-3xl shadow-festive p-6 sm:p-8 border border-border/50">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl font-display font-semibold text-foreground">
                  Add Participants
                </h2>
                {participants.length > 0 && (
                  <span className="ml-auto text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
                    {participants.length} people
                  </span>
                )}
              </div>

              <div className="flex gap-3 mb-6">
                <Input
                  placeholder="Enter a name..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addParticipant()}
                  className="flex-1 h-12 bg-background"
                />
                <Button
                  variant="festive"
                  size="lg"
                  onClick={addParticipant}
                  disabled={!newName.trim()}
                >
                  <Plus className="h-5 w-5" />
                  Add
                </Button>
              </div>

              {participants.length > 0 ? (
                <div className="grid gap-3">
                  {participants.map((name, index) => (
                    <ParticipantCard
                      key={name}
                      name={name}
                      index={index}
                      onRemove={() => removeParticipant(index)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Gift className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>No participants yet. Upload a CSV or add names manually!</p>
                </div>
              )}
            </section>
          )}

          {/* Exclusions Section - Admin Only */}
          {isAdmin && participants.length >= 2 && (
            <Collapsible open={showExclusions} onOpenChange={setShowExclusions}>
              <CollapsibleTrigger asChild>
                <button className="w-full bg-card rounded-3xl shadow-md p-6 border border-border/50 flex items-center justify-between hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/10">
                      <Sparkles className="h-5 w-5 text-secondary" />
                    </div>
                    <div className="text-left">
                      <h2 className="text-xl font-display font-semibold text-foreground">
                        Exclusion Rules
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Set who can't give to whom (optional)
                      </p>
                    </div>
                  </div>
                  <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${showExclusions ? "rotate-180" : ""}`} />
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="bg-card rounded-3xl shadow-md p-6 sm:p-8 border border-border/50 mt-2">
                  <ExclusionSelector
                    participants={participants}
                    exclusions={exclusions}
                    onAddExclusion={(e) => {
                      setExclusions([...exclusions, e]);
                      setAssignments(null);
                    }}
                    onRemoveExclusion={(index) => {
                      setExclusions(exclusions.filter((_, i) => i !== index));
                      setAssignments(null);
                    }}
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Generate Button - Admin Only */}
          {isAdmin && participants.length >= 2 && !assignments && (
            <div className="flex justify-center">
              <Button
                variant="gold"
                size="xl"
                onClick={handleGenerate}
                className="gap-3 animate-pulse-glow"
              >
                <Shuffle className="h-5 w-5" />
                Generate Secret Santa
              </Button>
            </div>
          )}

          {/* Results Section - All Users */}
          {assignments && (
            <section className="space-y-6 animate-fade-in">
              <div className="text-center">
                <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                  🎄 Assignments Ready!
                </h2>
                <p className="text-muted-foreground">
                  {isAdmin ? "Click reveal on each card to see the assignment" : "Find your name and reveal your Secret Santa assignment"}
                </p>
              </div>

              <div className="grid gap-4">
                {assignments.map((assignment, index) => (
                  <ResultCard
                    key={assignment.giver}
                    giver={assignment.giver}
                    receiver={assignment.receiver}
                    index={index}
                  />
                ))}
              </div>

              {isAdmin && (
                <div className="flex justify-center gap-4">
                  <Button variant="outline" onClick={handleReset}>
                    Regenerate
                  </Button>
                </div>
              )}
            </section>
          )}

          {/* No assignments message for non-admin */}
          {!isAdmin && !assignments && (
            <section className="bg-card rounded-3xl shadow-festive p-8 border border-border/50 text-center">
              <Gift className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <h2 className="text-xl font-display font-semibold text-foreground mb-2">
                No Assignments Yet
              </h2>
              <p className="text-muted-foreground">
                The admin hasn't generated the Secret Santa assignments yet. Check back soon!
              </p>
            </section>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-8 text-muted-foreground text-sm">
        <p>Made with ❤️ for the holiday season</p>
      </footer>
    </div>
  );
};

export default Index;
