import React, { useState } from "react";
import {
  Plus,
  Zap,
  Pause,
  CheckCircle2,
  Target,
  ArrowRight,
  BookOpen,
  Calendar,
  Clock,
  Archive,
  Layers,
  Sparkles,
  LogIn,
  Shield,
  Timer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { Goal, UserProfile } from "@/types";
import { getGoals, getRoadmaps, updateGoal } from "@/lib/storage";
import { useAuth } from "@/context/AuthContext";
import { formatDuration } from "@/views/LessonView";

interface DashboardViewProps {
  user: UserProfile;
  onNavigate: (path: string) => void;
}

export function DashboardView({ user, onNavigate }: DashboardViewProps) {
  const { firebaseUser } = useAuth();
  const [goals, setGoals] = useState<Goal[]>(getGoals());
  const roadmaps = getRoadmaps();

  const activeGoals = goals.filter((g) => g.status === "active");
  const pausedGoals = goals.filter((g) => g.status === "paused");
  const completedGoals = goals.filter((g) => g.status === "completed");
  const archivedGoals = goals.filter((g) => g.status === "archived");

  const inProgressGoals = [...activeGoals, ...pausedGoals];

  // Helper to compute goal completion percentage from roadmap topics
  const getGoalProgress = (goalId: string) => {
    const roadmap = roadmaps.find((r) => r.goal_id === goalId && r.status === "current") ||
      roadmaps.find((r) => r.goal_id === goalId);
    if (!roadmap) return 0;
    const allTopics = roadmap.modules.flatMap((m) => m.topics);
    if (allTopics.length === 0) return 0;
    const completed = allTopics.filter((t) => t.status === "completed").length;
    return Math.round((completed / allTopics.length) * 100);
  };

  const getGoalReadingSeconds = (goalId: string) => {
    const roadmap = roadmaps.find((r) => r.goal_id === goalId && r.status === "current") ||
      roadmaps.find((r) => r.goal_id === goalId);
    if (!roadmap) return 0;
    return roadmap.modules
      .flatMap((m) => m.topics)
      .reduce((acc, t) => acc + (t.reading_time_seconds || 0), 0);
  };

  const totalStudySeconds = roadmaps
    .flatMap((r) => r.modules.flatMap((m) => m.topics))
    .reduce((acc, t) => acc + (t.reading_time_seconds || 0), 0);

  const handleStatusChange = (goalId: string, newStatus: Goal["status"]) => {
    updateGoal(goalId, { status: newStatus });
    setGoals(getGoals());
  };

  return (
    <PageContainer className="py-8 space-y-10">
      <PageHeader
        title="Your learning goals"
        description={`Welcome back, ${user.display_name}. Pick up a goal or create a new one.`}
        actions={
          <Button size="lg" onClick={() => onNavigate("/goals/new")} className="gap-2">
            <Plus className="size-5" />
            New goal
          </Button>
        }
      />

      {/* Guest / Auth Testing Banner */}
      {!firebaseUser ? (
        <Alert variant="default" className="flex items-center justify-between border-dashed bg-secondary/30">
          <div className="flex items-center gap-3">
            <LogIn className="size-4 text-primary shrink-0" />
            <div className="text-xs">
              <span className="font-semibold text-foreground">Testing Authentication?</span>{" "}
              <span className="text-muted-foreground">Sign in with Google or test user accounts to sync your study goals to Firestore.</span>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={() => onNavigate("/sign-in")} className="shrink-0 ml-3 h-8 text-xs">
            Sign In / Test Auth
          </Button>
        </Alert>
      ) : (
        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-primary/5 border border-primary/20 text-xs">
          <div className="flex items-center gap-2">
            <Shield className="size-3.5 text-primary shrink-0" />
            <span className="text-muted-foreground">Signed in as</span>
            <span className="font-semibold text-foreground">{firebaseUser.displayName || user.display_name}</span>
            <span className="text-muted-foreground">({firebaseUser.email})</span>
          </div>
          <button
            onClick={() => onNavigate("/sign-in")}
            className="text-[11px] text-primary hover:underline font-medium"
          >
            Manage / Switch Account →
          </button>
        </div>
      )}

      {/* Onboarding hint if applicable */}
      {!user.onboarding_completed && (
        <Alert variant="info" className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <Sparkles className="size-5 text-info mt-0.5" />
            <div>
              <AlertTitle>Finish setting up StudyPilot</AlertTitle>
              <AlertDescription>
                Customize your daily minutes and preferred study modalities to tailor new roadmaps.
              </AlertDescription>
            </div>
          </div>
          <Button size="sm" onClick={() => onNavigate("/settings")} className="shrink-0 ml-4">
            Preferences
          </Button>
        </Alert>
      )}

      {/* At-a-glance Stat Cards */}
      <section aria-label="Goals statistics" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="flex items-center gap-4 p-5">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Zap className="size-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Active Goals</p>
            <p className="text-2xl font-bold tracking-tight text-foreground">{activeGoals.length}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 p-5">
          <div className="flex size-12 items-center justify-center rounded-xl bg-warning-soft text-warning">
            <Pause className="size-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Paused Goals</p>
            <p className="text-2xl font-bold tracking-tight text-foreground">{pausedGoals.length}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 p-5">
          <div className="flex size-12 items-center justify-center rounded-xl bg-success-soft text-success">
            <CheckCircle2 className="size-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Completed Goals</p>
            <p className="text-2xl font-bold tracking-tight text-foreground">{completedGoals.length}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 p-5">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Timer className="size-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Study Time Logged</p>
            <p className="text-2xl font-bold tracking-tight text-foreground">
              {totalStudySeconds > 0 ? formatDuration(totalStudySeconds) : "0m"}
            </p>
          </div>
        </Card>
      </section>

      {/* In-Progress Goals */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
            In progress
          </h2>
          <span className="text-sm text-muted-foreground font-medium">
            {inProgressGoals.length} {inProgressGoals.length === 1 ? "goal" : "goals"}
          </span>
        </div>

        {inProgressGoals.length === 0 ? (
          <Card className="border-dashed p-10 text-center space-y-4">
            <Target className="size-12 mx-auto text-muted-foreground/60" />
            <div className="space-y-1">
              <h3 className="font-heading text-lg font-semibold">No active goals</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Tell us what you want to learn, how much time you have and when you need to be ready.
              </p>
            </div>
            <Button onClick={() => onNavigate("/goals/new")}>Create your first goal</Button>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {inProgressGoals.map((goal) => {
              const progress = getGoalProgress(goal.id);
              const goalReadingSecs = getGoalReadingSeconds(goal.id);
              const isPaused = goal.status === "paused";

              return (
                <Card
                  key={goal.id}
                  className={`flex flex-col justify-between hover:border-primary/40 transition-colors ${
                    isPaused ? "opacity-85 bg-card/60" : ""
                  }`}
                >
                  <CardHeader className="space-y-2 pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={isPaused ? "warning" : "default"}>
                          {isPaused ? "Paused" : "Active"}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {goal.current_level}
                        </Badge>
                        <Badge variant="secondary" className="capitalize">
                          {goal.goal_type.replace("_", " ")}
                        </Badge>
                      </div>
                    </div>
                    <CardTitle
                      className="cursor-pointer hover:text-primary transition-colors line-clamp-2"
                      onClick={() => onNavigate(`/goals/${goal.id}`)}
                    >
                      {goal.title}
                    </CardTitle>
                    {goal.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {goal.description}
                      </p>
                    )}
                  </CardHeader>

                  <CardContent className="space-y-4 pt-0">
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-medium text-muted-foreground">
                        <span>Curriculum Progress</span>
                        <span className="font-semibold text-foreground">{progress}%</span>
                      </div>
                      <Progress value={progress} />
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-3">
                      <div className="flex items-center gap-1.5">
                        <Clock className="size-3.5" />
                        <span>{goal.daily_minutes} min/day</span>
                      </div>
                      {goalReadingSecs > 0 ? (
                        <div className="flex items-center gap-1 text-primary font-medium">
                          <Timer className="size-3.5" />
                          <span>{formatDuration(goalReadingSecs)} read</span>
                        </div>
                      ) : goal.target_date ? (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="size-3.5" />
                          <span>Target: {goal.target_date}</span>
                        </div>
                      ) : null}
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1">
                      <div className="flex items-center gap-1">
                        {isPaused ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStatusChange(goal.id, "active")}
                            title="Resume goal"
                            className="text-xs h-8"
                          >
                            <Zap className="size-3.5 mr-1 text-primary" />
                            Resume
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStatusChange(goal.id, "paused")}
                            title="Pause goal"
                            className="text-xs h-8"
                          >
                            <Pause className="size-3.5 mr-1" />
                            Pause
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStatusChange(goal.id, "completed")}
                          title="Mark complete"
                          className="text-xs h-8"
                        >
                          <CheckCircle2 className="size-3.5 mr-1 text-success" />
                          Finish
                        </Button>
                      </div>

                      <Button
                        size="sm"
                        onClick={() => onNavigate(`/goals/${goal.id}`)}
                        className="gap-1.5"
                      >
                        Open Goal
                        <ArrowRight className="size-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Completed Goals Section */}
      {completedGoals.length > 0 && (
        <section className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-xl font-semibold tracking-tight text-foreground flex items-center gap-2">
              <CheckCircle2 className="size-5 text-success" />
              Completed
            </h2>
            <span className="text-sm text-muted-foreground font-medium">
              {completedGoals.length}
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {completedGoals.map((goal) => (
              <Card key={goal.id} className="bg-card/70 border-success/30 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="success">Completed</Badge>
                  <span className="text-xs text-muted-foreground">
                    Target: {goal.target_date || "None"}
                  </span>
                </div>
                <h3
                  onClick={() => onNavigate(`/goals/${goal.id}`)}
                  className="font-heading font-semibold text-base cursor-pointer hover:text-primary transition-colors line-clamp-1"
                >
                  {goal.title}
                </h3>
                <div className="flex justify-between items-center pt-2 border-t border-border/60">
                  <span className="text-xs text-muted-foreground">100% Finished</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onNavigate(`/goals/${goal.id}`)}
                    className="text-xs h-7"
                  >
                    Review
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Archived Link */}
      {archivedGoals.length > 0 && (
        <div className="pt-2">
          <button
            onClick={() => onNavigate("/goals/archived")}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Archive className="size-4" />
            <span>View {archivedGoals.length} archived {archivedGoals.length === 1 ? "goal" : "goals"}</span>
          </button>
        </div>
      )}
    </PageContainer>
  );
}
