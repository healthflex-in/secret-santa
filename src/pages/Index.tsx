import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Gift, Users, Shuffle, Plus, Sparkles, TreePine, ChevronDown, LogOut, Shield, Mail } from "lucide-react";
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
import { database } from "@/lib/database";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const VIEWER_LOG_KEY = "secretsanta_viewers";

interface Exclusion {
  giver: string;
  receiver: string;
}

interface Assignment {
  giver: string;
  receiver: string;
}

interface ViewerLogEntry {
  name: string;
  receiver: string;
  viewedAt: string;
}

const Index = () => {
  const [participants, setParticipants] = useState<string[]>([]);
  const [newName, setNewName] = useState("");
  const [exclusions, setExclusions] = useState<Exclusion[]>([]);
  const [assignments, setAssignments] = useState<Assignment[] | null>(null);
  const [showExclusions, setShowExclusions] = useState(false);
  const [viewerLog, setViewerLog] = useState<ViewerLogEntry[]>([]);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [authorizedEmails, setAuthorizedEmails] = useState<{ email: string; name: string }[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [newEmailName, setNewEmailName] = useState("");
  const [showEmailManagement, setShowEmailManagement] = useState(false);
  const { toast } = useToast();
  const { isAdmin, isAuthenticated, logout, changePassword } = useAuth();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Load saved assignments from Supabase
  useEffect(() => {
    const loadData = async () => {
      const [assignmentsData, participantsData, viewerLogData, emailsData] = await Promise.all([
        database.getAssignments(),
        database.getParticipants(),
        database.getViewerLog(),
        database.getAuthorizedEmails(),
      ]);
      
      if (assignmentsData.length > 0) {
        setAssignments(assignmentsData);
      }
      if (participantsData.length > 0) {
        setParticipants(participantsData);
      }
      if (viewerLogData.length > 0) {
        setViewerLog(viewerLogData);
      }
      if (emailsData.length > 0) {
        setAuthorizedEmails(emailsData);
      }
    };
    
    loadData();
  }, []);

  const clearViewerLog = async () => {
    setViewerLog([]);
    await database.clearViewerLog();
  };

  const addParticipant = async () => {
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
    await database.saveParticipants(newParticipants);
    setNewName("");
    setAssignments(null);
    await database.clearAssignments();
    await clearViewerLog();
  };

  const removeParticipant = async (index: number) => {
    const name = participants[index];
    const newParticipants = participants.filter((_, i) => i !== index);
    setParticipants(newParticipants);
    await database.saveParticipants(newParticipants);
    setExclusions(exclusions.filter((e) => e.giver !== name && e.receiver !== name));
    setAssignments(null);
    await database.clearAssignments();
    await clearViewerLog();
  };

  const handleCSVUpload = async (names: string[]) => {
    setParticipants(names);
    await database.saveParticipants(names);
    setExclusions([]);
    setAssignments(null);
    await database.clearAssignments();
    await clearViewerLog();
  };

  const handleCSVUploadWithEmails = async (data: { name: string; email: string }[]) => {
    // Extract names for participants
    const names = data.map(item => item.name);
    setParticipants(names);
    await database.saveParticipants(names);
    
    // Save authorized emails
    const success = await database.bulkAddAuthorizedEmails(data);
    if (success) {
      // Reload authorized emails to update the UI
      const updatedEmails = await database.getAuthorizedEmails();
      setAuthorizedEmails(updatedEmails);
    }
    
    setExclusions([]);
    setAssignments(null);
    await database.clearAssignments();
    await clearViewerLog();
    
    toast({
      title: "CSV Uploaded!",
      description: `Successfully loaded ${names.length} participants and authorized emails.`,
    });
  };

  const handleGenerate = async () => {
    if (participants.length < 2) {
      toast({
        title: "Need more participants",
        description: "Add at least 2 people to generate Secret Santa pairs.",
        variant: "destructive",
      });
      return;
    }

    const result = generateSecretSanta(participants, exclusions);
    
    if (!result) {
      toast({
        title: "Cannot generate Secret Santa pairs",
        description: "The exclusion rules make it impossible to assign everyone. Try removing some rules.",
        variant: "destructive",
      });
      return;
    }

    await clearViewerLog();
    setAssignments(result);
    const success = await database.saveAssignments(result);
    if (success) {
      toast({
        title: "🎅 Secret Santa Generated!",
        description: "Click reveal to see each person's Secret Santa.",
      });
    } else {
      toast({
        title: "Error saving Secret Santa pairs",
        description: "Secret Santa pairs were generated but couldn't be saved. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReset = async () => {
    setAssignments(null);
    await database.clearAssignments();
    await clearViewerLog();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handlePasswordUpdate = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!currentPassword.trim() || !newPassword.trim()) {
      toast({
        title: "Password required",
        description: "Please enter your current and new password.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Confirm password must match the new password.",
        variant: "destructive",
      });
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const success = await changePassword(currentPassword, newPassword);
      if (success) {
        toast({
          title: "Password updated",
          description: "Your admin password has been changed and synced across all devices.",
        });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast({
          title: "Invalid current password",
          description: "Please verify your current password and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while updating the password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const sortedViewerLog = [...viewerLog].sort(
    (a, b) => new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime()
  );

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
            Stance&apos;s Secret Santa
            <span className="block text-primary">Generator</span>
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            {isAdmin ? "Admin Dashboard - Manage participants, security, and visibility" : "View your Secret Santa"}
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
              <CSVUpload onUpload={handleCSVUpload} onUploadWithEmails={handleCSVUploadWithEmails} />
            </section>
          )}

          {/* Authorized Emails Management - Admin Only */}
          {isAdmin && (
            <section className="bg-card rounded-3xl shadow-festive p-6 sm:p-8 border border-border/50">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-display font-semibold text-foreground">
                    Authorized Emails
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Manage emails that can login via Google Auth
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEmailManagement(!showEmailManagement)}
                >
                  {showEmailManagement ? 'Hide' : 'Show'} Management
                </Button>
              </div>

              {showEmailManagement && (
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <Input
                      type="email"
                      placeholder="Email address"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      type="text"
                      placeholder="Participant name"
                      value={newEmailName}
                      onChange={(e) => setNewEmailName(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      variant="festive"
                      onClick={async () => {
                        if (!newEmail.trim() || !newEmailName.trim()) {
                          toast({
                            title: "Fields required",
                            description: "Please enter both email and name.",
                            variant: "destructive",
                          });
                          return;
                        }
                        // Check if email already exists in local state
                        const emailLower = newEmail.toLowerCase();
                        const existingEmail = authorizedEmails.find(e => e.email.toLowerCase() === emailLower);
                        
                        if (existingEmail) {
                          toast({
                            title: "Email already exists",
                            description: `${newEmail} is already in the authorized list.`,
                            variant: "destructive",
                          });
                          return;
                        }

                        const result = await database.addAuthorizedEmail(newEmail, newEmailName);
                        if (result.success) {
                          // Reload emails from database to get updated list
                          const updatedEmails = await database.getAuthorizedEmails();
                          setAuthorizedEmails(updatedEmails);
                          setNewEmail("");
                          setNewEmailName("");
                          toast({
                            title: "Email added",
                            description: `${newEmail} has been authorized.`,
                          });
                        } else {
                          toast({
                            title: "Error",
                            description: result.message || "Failed to add email. Please try again.",
                            variant: "destructive",
                          });
                        }
                      }}
                      disabled={!newEmail.trim() || !newEmailName.trim()}
                    >
                      <Plus className="h-5 w-5" />
                      Add
                    </Button>
                  </div>

                  {authorizedEmails.length > 0 ? (
                    <div className="space-y-2">
                      {authorizedEmails.map((item) => (
                        <div
                          key={item.email}
                          className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/40"
                        >
                          <div>
                            <p className="font-medium text-foreground">{item.email}</p>
                            <p className="text-sm text-muted-foreground">Name: {item.name}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={async () => {
                              const success = await database.removeAuthorizedEmail(item.email);
                              if (success) {
                                setAuthorizedEmails(authorizedEmails.filter(e => e.email !== item.email));
                                toast({
                                  title: "Email removed",
                                  description: `${item.email} has been removed.`,
                                });
                              }
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Mail className="h-12 w-12 mx-auto mb-3 opacity-30" />
                      <p>No authorized emails yet.</p>
                      <p className="text-sm mt-2">Add emails to enable Google Auth login.</p>
                    </div>
                  )}
                </div>
              )}
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

          {/* Admin password management */}
          {isAdmin && (
            <section className="bg-card rounded-3xl shadow-festive p-6 sm:p-8 border border-border/50">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-display font-semibold text-foreground">
                    Admin Security
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Update the admin password at any time
                  </p>
                </div>
              </div>

              <form onSubmit={handlePasswordUpdate} className="grid gap-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-foreground">
                    Current password
                  </label>
                  <Input
                    type="password"
                    value={currentPassword}
                    onChange={(event) => setCurrentPassword(event.target.value)}
                    placeholder="Enter current admin password"
                    className="bg-background"
                  />
                </div>

                <div className="grid gap-2 md:grid-cols-2 md:gap-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium text-foreground">
                      New password
                    </label>
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      placeholder="Enter a new password"
                      className="bg-background"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium text-foreground">
                      Confirm new password
                    </label>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      placeholder="Re-enter the new password"
                      className="bg-background"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-muted-foreground">
                    Changing the password keeps your admin tools secure.
                  </p>
                  <Button
                    type="submit"
                    disabled={
                      isUpdatingPassword ||
                      !currentPassword ||
                      !newPassword ||
                      !confirmPassword
                    }
                    className="sm:w-fit"
                  >
                    {isUpdatingPassword ? "Updating..." : "Update password"}
                  </Button>
                </div>
              </form>
            </section>
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
                  🎄 Secret Santas Ready!
                </h2>
                <p className="text-muted-foreground">
                  {isAdmin ? "Click reveal on each card to see the Secret Santa pair" : "Find your name and reveal your Secret Santa"}
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
                No Secret Santas Yet
              </h2>
              <p className="text-muted-foreground">
                The admin hasn't generated the Secret Santa pairs yet. Check back soon!
              </p>
            </section>
          )}

          {/* Viewer log - Admin Only */}
          {isAdmin && (
            <section className="bg-card rounded-3xl shadow-festive p-6 sm:p-8 border border-border/50">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/10">
                    <Sparkles className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-display font-semibold text-foreground">
                      Viewer Activity
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      See who has revealed their Secret Santa
                    </p>
                  </div>
                </div>
                {sortedViewerLog.length > 0 && (
                  <Button variant="outline" size="sm" onClick={clearViewerLog}>
                    Clear log
                  </Button>
                )}
              </div>

              {sortedViewerLog.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No one has viewed their assignment yet.</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {sortedViewerLog.map((entry) => (
                    <div
                      key={`${entry.name}-${entry.viewedAt}`}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-2xl border border-border/50 bg-muted/40 px-4 py-3"
                    >
                      <div>
                        <p className="text-foreground font-medium">{entry.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Viewed: buying for {entry.receiver}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(entry.viewedAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
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
