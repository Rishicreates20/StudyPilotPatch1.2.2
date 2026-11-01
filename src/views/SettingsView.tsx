import React, { useState } from "react";
import {
  Save,
  User,
  Clock,
  BookOpen,
  Check,
  Shield,
  Briefcase,
  Calendar,
  LogOut,
  Database,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { UserProfile } from "@/types";
import { useAuth } from "@/context/AuthContext";

export function SettingsView({
  user,
  onUserUpdate,
}: {
  user: UserProfile;
  onUserUpdate: (u: UserProfile) => void;
}) {
  const { firebaseUser, userProfile, updateProfileData, signOutUser } = useAuth();
  const activeUser = userProfile || user;

  const [displayName, setDisplayName] = useState(activeUser.display_name || "");
  const [email, setEmail] = useState(activeUser.email || "");
  const [bio, setBio] = useState(
    activeUser.bio || "Lifelong learner mastering new technical domains."
  );
  const [targetRole, setTargetRole] = useState(
    activeUser.target_role || "Cloud Solutions Architect"
  );
  const [weeklyHours, setWeeklyHours] = useState(
    activeUser.weekly_goal_hours || 10
  );
  const [timezone, setTimezone] = useState(activeUser.timezone || "UTC");
  const [dailyMinutes, setDailyMinutes] = useState(
    activeUser.preferences?.default_daily_minutes || 45
  );
  const [learningPrefs, setLearningPrefs] = useState<string[]>(
    activeUser.preferences?.learning_preferences || ["worked_examples"]
  );
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    if (activeUser) {
      if (activeUser.display_name) setDisplayName(activeUser.display_name);
      if (activeUser.email) setEmail(activeUser.email);
      if (activeUser.bio) setBio(activeUser.bio);
      if (activeUser.target_role) setTargetRole(activeUser.target_role);
      if (activeUser.weekly_goal_hours) setWeeklyHours(activeUser.weekly_goal_hours);
      if (activeUser.timezone) setTimezone(activeUser.timezone);
      if (activeUser.preferences?.default_daily_minutes) {
        setDailyMinutes(activeUser.preferences.default_daily_minutes);
      }
      if (activeUser.preferences?.learning_preferences) {
        setLearningPrefs(activeUser.preferences.learning_preferences);
      }
    }
  }, [activeUser.display_name, activeUser.email, activeUser.target_role, activeUser.weekly_goal_hours]);

  const togglePref = (pref: string) => {
    if (learningPrefs.includes(pref)) {
      setLearningPrefs(learningPrefs.filter((p) => p !== pref));
    } else {
      setLearningPrefs([...learningPrefs, pref]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const updated: Partial<UserProfile> = {
      display_name: displayName.trim(),
      email: email.trim(),
      bio: bio.trim(),
      target_role: targetRole.trim(),
      weekly_goal_hours: Number(weeklyHours),
      timezone,
      onboarding_completed: true,
      preferences: {
        default_daily_minutes: Number(dailyMinutes),
        preferred_languages: activeUser.preferences?.preferred_languages || ["en"],
        learning_preferences: learningPrefs,
      },
    };

    await updateProfileData(updated);
    onUserUpdate({ ...activeUser, ...updated } as UserProfile);
    setIsSaving(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  const isAdmin =
    activeUser.role === "admin" ||
    activeUser.email === "rishikeshsarangi122004@gmail.com" ||
    firebaseUser?.email === "rishikeshsarangi122004@gmail.com";

  return (
    <PageContainer className="py-8 max-w-3xl space-y-8">
      <PageHeader
        title="User Profile & Settings"
        description="Manage your StudyPilot profile, credentials, target roles, and personalized learning style."
      />

      {savedSuccess && (
        <Alert variant="success" className="animate-in fade-in-0">
          <Check className="size-4" />
          <AlertDescription>
            Profile and study preferences successfully saved to Firestore.
          </AlertDescription>
        </Alert>
      )}

      {/* Account Overview Header Card */}
      <Card className="overflow-hidden border-border bg-card">
        <div className="h-24 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent p-6 flex justify-between items-start" />
        <CardContent className="relative px-6 pb-6 pt-0">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 mb-4">
            <div className="flex items-end gap-4">
              {activeUser.photo_url || firebaseUser?.photoURL ? (
                <img
                  src={activeUser.photo_url || firebaseUser?.photoURL || ""}
                  alt={displayName}
                  className="size-20 rounded-2xl border-4 border-background object-cover shadow-md"
                />
              ) : (
                <div className="flex size-20 items-center justify-center rounded-2xl border-4 border-background bg-primary text-primary-foreground font-heading text-2xl font-bold shadow-md">
                  {(displayName || activeUser.email || "U").charAt(0).toUpperCase()}
                </div>
              )}
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-bold font-heading text-foreground">
                    {displayName || "StudyPilot Learner"}
                  </h2>
                  {isAdmin && (
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-xs gap-1 font-semibold">
                      <Shield className="size-3" />
                      Platform Admin
                    </Badge>
                  )}
                  {firebaseUser && (
                    <Badge variant="secondary" className="text-xs">
                      Firebase Verified
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground break-all">{email}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {firebaseUser ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => signOutUser()}
                  className="text-xs gap-1.5"
                >
                  <LogOut className="size-3.5" />
                  Sign Out
                </Button>
              ) : (
                <Badge variant="outline" className="text-xs text-muted-foreground">
                  Guest / Demo Session
                </Badge>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-border/60 text-xs">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Briefcase className="size-4 text-primary" />
              <span>Target: <strong className="text-foreground">{targetRole || "Engineering"}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="size-4 text-primary" />
              <span>Target: <strong className="text-foreground">{weeklyHours} hrs/week</strong></span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Database className="size-4 text-success" />
              <span className="text-success font-medium">Firestore Persistent</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Settings Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Edit Personal & Learning Profile</CardTitle>
          <CardDescription>
            These details customize your daily roadmap pacing, exam targets, and AI lesson generations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-6">
            {/* Account Details */}
            <div className="space-y-4">
              <h3 className="font-heading text-sm font-semibold flex items-center gap-2 text-foreground">
                <User className="size-4 text-primary" />
                Personal Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="set-name">Full Name / Display Name</Label>
                  <Input
                    id="set-name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="set-email">Email Address</Label>
                  <Input
                    id="set-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="set-role">Career Objective / Target Role</Label>
                  <Input
                    id="set-role"
                    placeholder="e.g. Senior Kubernetes & Cloud Engineer"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="set-tz">Timezone</Label>
                  <select
                    id="set-tz"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="flex h-9 w-full rounded-lg border border-input bg-card px-3 py-1 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="UTC">UTC (Coordinated Universal Time)</option>
                    <option value="America/New_York">Eastern Time (US & Canada)</option>
                    <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
                    <option value="Europe/London">London (GMT / BST)</option>
                    <option value="Asia/Kolkata">India Standard Time (IST)</option>
                    <option value="Asia/Tokyo">Tokyo (JST)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="set-bio">Study Bio & Motivation</Label>
                <textarea
                  id="set-bio"
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share what drives your learning journey..."
                  className="w-full rounded-lg border border-input bg-card p-3 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            {/* Study Commitment */}
            <div className="border-t border-border pt-6 space-y-4">
              <h3 className="font-heading text-sm font-semibold flex items-center gap-2 text-foreground">
                <Clock className="size-4 text-primary" />
                Study Cadence & Weekly Targets
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="set-mins">Daily Study Commitment</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="set-mins"
                      type="number"
                      min={15}
                      max={240}
                      step={5}
                      value={dailyMinutes}
                      onChange={(e) => setDailyMinutes(Number(e.target.value))}
                    />
                    <span className="text-xs text-muted-foreground shrink-0">min/day</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="set-hours">Weekly Target Hours</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="set-hours"
                      type="number"
                      min={2}
                      max={60}
                      step={1}
                      value={weeklyHours}
                      onChange={(e) => setWeeklyHours(Number(e.target.value))}
                    />
                    <span className="text-xs text-muted-foreground shrink-0">hours/week</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Preferred Modalities */}
            <div className="border-t border-border pt-6 space-y-4">
              <h3 className="font-heading text-sm font-semibold flex items-center gap-2 text-foreground">
                <BookOpen className="size-4 text-primary" />
                Preferred Learning Modalities
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                {[
                  { id: "worked_examples", label: "Step-by-step worked examples" },
                  { id: "active_recall", label: "Frequent knowledge quizzes" },
                  { id: "visual_diagrams", label: "Architectural ASCII & diagrams" },
                  { id: "concise_notes", label: "Concise bullet-point summaries" },
                ].map(({ id, label }) => (
                  <label
                    key={id}
                    className="flex items-center gap-2.5 p-3 rounded-lg border border-border bg-card/60 hover:bg-secondary cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={learningPrefs.includes(id)}
                      onChange={() => togglePref(id)}
                      className="rounded border-input text-primary focus:ring-ring"
                    />
                    <span className="text-xs font-medium text-foreground">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Firebase System Metadata Box */}
            <div className="rounded-xl border border-border/80 bg-muted/40 p-4 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <Database className="size-3.5 text-primary" />
                  Cloud Database & Identity Linkage
                </span>
                <span className="text-muted-foreground font-mono">
                  gen-lang-client-0889766233
                </span>
              </div>
              <p className="text-muted-foreground">
                {firebaseUser ? (
                  <>
                    Authenticated as <strong className="text-foreground">{firebaseUser.email}</strong>.
                    Firestore security rules enforce strict read/write ownership on path{" "}
                    <code className="text-primary font-mono">users/{firebaseUser.uid}</code>.
                  </>
                ) : (
                  <>
                    Currently in guest mode. Sign in to synchronize your goals and reading progress
                    across devices.
                  </>
                )}
              </p>
            </div>

            <div className="flex justify-end pt-4 border-t border-border">
              <Button type="submit" loading={isSaving} className="gap-2">
                <Save className="size-4" />
                Save Profile
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
