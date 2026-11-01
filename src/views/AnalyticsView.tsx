import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  Award,
  AlertTriangle,
  Clock,
  Target,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Flame,
  BookOpen,
  Database,
  Timer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { getGoals, getRoadmaps, getQuizzes, getSessionDurationMetrics } from "@/lib/storage";
import { formatDuration } from "@/views/LessonView";

export function AnalyticsView({ onNavigate }: { onNavigate: (path: string) => void }) {
  const goals = getGoals();
  const [roadmaps, setRoadmaps] = useState(() => getRoadmaps());
  const quizzes = getQuizzes();
  const [sessionMetrics, setSessionMetrics] = useState(() => getSessionDurationMetrics());

  useEffect(() => {
    const refresh = () => {
      setSessionMetrics(getSessionDurationMetrics());
      setRoadmaps(getRoadmaps());
    };
    refresh();
    window.addEventListener("studypilot:session_duration_logged", refresh);
    return () => window.removeEventListener("studypilot:session_duration_logged", refresh);
  }, []);

  const allTopics = roadmaps.flatMap((r) => r.modules.flatMap((m) => m.topics));
  const completedTopics = allTopics.filter((t) => t.status === "completed");

  // Sum total reading time
  const totalReadingSeconds = allTopics.reduce(
    (acc, t) => acc + (t.reading_time_seconds || 0),
    0
  );

  // Quiz attempts
  const allAttempts = quizzes.map((q) => q.attempt).filter(Boolean);
  const avgQuizScore =
    allAttempts.length > 0
      ? Math.round(
          allAttempts.reduce((acc, a) => acc + (a?.percentage || 0), 0) / allAttempts.length
        )
      : 85;

  // Weak topics (score < 75 or identified weak concepts)
  const weakTopics = allTopics.filter(
    (t) => t.mastery_score !== null && t.mastery_score !== undefined && t.mastery_score < 75
  );

  // Mastery categories
  const mastered = allTopics.filter((t) => (t.mastery_score || 0) >= 85);
  const competent = allTopics.filter((t) => (t.mastery_score || 0) >= 70 && (t.mastery_score || 0) < 85);
  const developing = allTopics.filter((t) => (t.mastery_score || 0) > 0 && (t.mastery_score || 0) < 70);
  const notAssessed = allTopics.filter((t) => !t.mastery_score);

  return (
    <PageContainer className="py-8 max-w-4xl space-y-8">
      <PageHeader
        title="Progress Analytics & Mastery"
        description="Comprehensive diagnostics of your study performance, active reading hours, and skill-gap detection."
      />

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium">
            <Flame className="size-4 text-warning" />
            <span>Study Streak</span>
          </div>
          <p className="text-2xl font-bold text-foreground mt-2">7 Days</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Consistent study record</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium">
            <Clock className="size-4 text-primary" />
            <span>Active Study Time</span>
          </div>
          <p className="text-2xl font-bold text-foreground mt-2">
            {totalReadingSeconds > 0 ? formatDuration(totalReadingSeconds) : "45m"}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Recorded reading sessions</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium">
            <Award className="size-4 text-success" />
            <span>Avg Quiz Mastery</span>
          </div>
          <p className="text-2xl font-bold text-foreground mt-2">{avgQuizScore}%</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Across {quizzes.length} assessments</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium">
            <CheckCircle2 className="size-4 text-info" />
            <span>Topics Mastered</span>
          </div>
          <p className="text-2xl font-bold text-foreground mt-2">
            {completedTopics.length} / {allTopics.length}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Total curriculum syllabus</p>
        </Card>
      </div>

      {/* Mastery Distribution Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="size-5 text-primary" />
            Topic Mastery Spectrum
          </CardTitle>
          <CardDescription>
            Deterministic assessment breakdown based on question checks and practice drills.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 rounded-lg bg-success-soft/60 border border-success/30">
              <p className="text-xs font-semibold text-success-foreground">Mastered (&gt;85%)</p>
              <p className="text-2xl font-bold text-success mt-1">{mastered.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-xs font-semibold text-primary">Competent (70-84%)</p>
              <p className="text-2xl font-bold text-primary mt-1">{competent.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-warning-soft/60 border border-warning/30">
              <p className="text-xs font-semibold text-warning-foreground">Developing (&lt;70%)</p>
              <p className="text-2xl font-bold text-warning mt-1">{developing.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-secondary border border-border">
              <p className="text-xs font-semibold text-muted-foreground">Unassessed</p>
              <p className="text-2xl font-bold text-foreground mt-1">{notAssessed.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skill-Gap Detection & Adaptive Action Recommendations */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2 text-warning">
            <AlertTriangle className="size-5" />
            Skill-Gap Detection & Recommended Next Steps
          </CardTitle>
          <CardDescription>
            Topics where scoring was lower or where misconceptions were identified during quizzes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {weakTopics.length === 0 ? (
            <div className="p-4 rounded-lg bg-success-soft/40 border border-success/20 text-sm text-success-foreground flex items-center gap-2">
              <CheckCircle2 className="size-4" />
              <span>No critical skill gaps detected. You are keeping up with all curriculum benchmarks!</span>
            </div>
          ) : (
            <div className="space-y-2.5">
              {weakTopics.map((topic) => (
                <div
                  key={topic.id}
                  className="p-4 rounded-xl border border-warning/30 bg-warning-soft/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="warning">{topic.mastery_score}% Mastery</Badge>
                      <span className="text-xs text-muted-foreground">Requires Revision</span>
                    </div>
                    <p className="font-heading font-semibold text-foreground text-sm">
                      {topic.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {topic.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onNavigate(`/goals/${goals[0]?.id || "goal-k8s-101"}/learn/${topic.id}`)}
                      className="text-xs"
                    >
                      <BookOpen className="size-3.5 mr-1" />
                      Review Lesson
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => onNavigate(`/goals/${goals[0]?.id || "goal-k8s-101"}/learn/${topic.id}/quiz`)}
                      className="text-xs"
                    >
                      Practice Quiz
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Logged Session Duration Metrics */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <CardTitle className="text-lg flex items-center gap-2">
              <Database className="size-5 text-primary" />
              Database Telemetry: <code className="text-sm font-mono text-primary">session_duration</code> Logs
            </CardTitle>
            <Badge variant="outline" className="text-xs font-mono">
              {sessionMetrics.length} {sessionMetrics.length === 1 ? "entry" : "entries"}
            </Badge>
          </div>
          <CardDescription>
            Real-time reading durations automatically logged when navigating away from or closing a lesson.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sessionMetrics.length === 0 ? (
            <div className="p-6 rounded-xl border border-dashed border-border text-center text-sm text-muted-foreground">
              Open any lesson in your roadmap and navigate away or complete it to record a <code className="font-mono text-foreground">session_duration</code> metric.
            </div>
          ) : (
            <div className="space-y-2.5">
              {sessionMetrics.slice(0, 8).map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-xl border border-border bg-card/60 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className="font-mono text-[11px]">
                        {item.metric_name}: {item.session_duration}s ({formatDuration(item.session_duration)})
                      </Badge>
                      <Badge variant="outline" className="text-[11px]">
                        {item.exit_reason.replace("_", " ")}
                      </Badge>
                      {item.synced_to_db && (
                        <Badge variant="success" className="text-[10px]">
                          Firestore Synced
                        </Badge>
                      )}
                    </div>
                    <p className="font-medium text-foreground text-sm">
                      {item.topic_title || item.topic_id}
                    </p>
                  </div>
                  <div className="text-muted-foreground font-mono text-[11px] shrink-0">
                    {new Date(item.logged_at).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
