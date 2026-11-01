import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Check,
  Copy,
  Download,
  HelpCircle,
  AlertTriangle,
  Lightbulb,
  FileCheck,
  Sparkles,
  ClipboardCheck,
  Timer,
  Play,
  Pause,
  Clock,
  Award,
  RotateCcw,
  Database,
} from "lucide-react";
import { doc, setDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { Goal, Lesson, RoadmapTopic, SessionDurationMetric } from "@/types";
import {
  getGoalById,
  getCurrentRoadmapForGoal,
  getLessonByTopicId,
  addLesson,
  updateTopicStatus,
  logTopicReadingTime,
  getSessionDurationMetrics,
  saveSessionDurationMetricLocal,
  getUserProfile,
  addExport,
} from "@/lib/storage";
import { auth, db, handleFirestoreError, OperationType } from "@/lib/firebase";
import { generateLessonForTopic } from "@/lib/ai-generator";

interface LessonViewProps {
  goalId: string;
  topicId: string;
  onNavigate: (path: string) => void;
}

export function formatDuration(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  if (mins === 0) return `${secs}s`;
  if (mins >= 60) {
    const hours = Math.floor(mins / 60);
    const remMins = mins % 60;
    return `${hours}h ${remMins}m ${secs}s`;
  }
  return `${mins}m ${secs}s`;
}

export function formatClockTime(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export function calculateElapsedSessionSeconds(
  startedAtMs: number,
  endedAtMs: number,
  pausedDurationMs: number = 0
): number {
  const activeMs = Math.max(0, endedAtMs - startedAtMs - Math.max(0, pausedDurationMs));
  return Math.max(0, Math.round(activeMs / 1000));
}

export function buildSessionDurationPayload(params: {
  id?: string;
  userId: string;
  goalId: string;
  topicId: string;
  topicTitle?: string;
  sessionDurationSeconds: number;
  startedAt: string;
  endedAt?: string;
  exitReason: SessionDurationMetric["exit_reason"];
  syncedToDb?: boolean;
}): SessionDurationMetric {
  const endedIso = params.endedAt || new Date().toISOString();
  const cleanSeconds = Math.max(0, Math.round(params.sessionDurationSeconds));
  return {
    id: params.id || `sdm-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    user_id: params.userId,
    goal_id: params.goalId,
    item_id: params.topicId,
    topic_id: params.topicId,
    topic_title: params.topicTitle || "",
    metric_name: "session_duration",
    session_duration: cleanSeconds,
    duration_seconds: cleanSeconds,
    exit_reason: params.exitReason,
    started_at: params.startedAt,
    ended_at: endedIso,
    logged_at: endedIso,
    synced_to_db: Boolean(params.syncedToDb),
  };
}

export async function persistSessionDurationToDatabase(params: {
  goalId: string;
  topicId: string;
  topicTitle?: string;
  sessionDurationSeconds: number;
  startedAt: string;
  exitReason: SessionDurationMetric["exit_reason"];
  markCompleted?: boolean;
}): Promise<{ metric: SessionDurationMetric; totalSeconds: number }> {
  const currentUser = auth.currentUser;
  const localUser = getUserProfile();
  const userId = currentUser?.uid || localUser.id || "user-default-1";

  const { totalSeconds } = logTopicReadingTime(
    params.goalId,
    params.topicId,
    params.sessionDurationSeconds,
    params.markCompleted || false
  );

  const metric = buildSessionDurationPayload({
    userId,
    goalId: params.goalId,
    topicId: params.topicId,
    topicTitle: params.topicTitle,
    sessionDurationSeconds: params.sessionDurationSeconds,
    startedAt: params.startedAt,
    exitReason: params.exitReason,
    syncedToDb: Boolean(currentUser),
  });

  // Save synchronously to local storage first so unload/navigation never loses data
  saveSessionDurationMetricLocal(metric);

  // Persist to Firestore database when authenticated
  if (currentUser) {
    const path = `users/${currentUser.uid}/progress/${metric.id}`;
    try {
      const docRef = doc(db, "users", currentUser.uid, "progress", metric.id);
      await setDoc(docRef, metric);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  }

  return { metric, totalSeconds };
}

export function useLessonSessionDurationTracker(params: {
  goalId: string;
  topicId: string;
  topicTitle?: string;
  initialLoggedSeconds: number;
  initialIsCompleted: boolean;
}) {
  const { goalId, topicId, topicTitle, initialLoggedSeconds, initialIsCompleted } = params;

  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(true);
  const [totalLoggedSeconds, setTotalLoggedSeconds] = useState(initialLoggedSeconds);
  const [isCompleted, setIsCompleted] = useState(initialIsCompleted);
  const [sessionLogs, setSessionLogs] = useState<SessionDurationMetric[]>(() =>
    getSessionDurationMetrics(goalId, topicId)
  );
  const [lastLoggedMetric, setLastLoggedMetric] = useState<SessionDurationMetric | null>(null);

  const navigationStartMsRef = useRef<number>(Date.now());
  const startedAtIsoRef = useRef<string>(new Date().toISOString());
  const pausedAccumulatedMsRef = useRef<number>(0);
  const pauseStartedAtMsRef = useRef<number | null>(null);
  const sessionSecondsRef = useRef<number>(0);
  sessionSecondsRef.current = sessionSeconds;
  const isCompletedRef = useRef<boolean>(initialIsCompleted);
  isCompletedRef.current = isCompleted;
  const hasLoggedExitRef = useRef<boolean>(false);

  // Reset tracking state when navigating between topics inside LessonView
  useEffect(() => {
    navigationStartMsRef.current = Date.now();
    startedAtIsoRef.current = new Date().toISOString();
    pausedAccumulatedMsRef.current = 0;
    pauseStartedAtMsRef.current = null;
    hasLoggedExitRef.current = false;
    setSessionSeconds(0);
    setIsTimerActive(true);
    setTotalLoggedSeconds(initialLoggedSeconds);
    setIsCompleted(initialIsCompleted);
    setSessionLogs(getSessionDurationMetrics(goalId, topicId));
  }, [goalId, topicId, initialLoggedSeconds, initialIsCompleted]);

  // Real-time ticking effect
  useEffect(() => {
    if (!isTimerActive) return;

    const interval = setInterval(() => {
      setSessionSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerActive]);

  // Track pause/resume timestamps for accurate wall-clock elapsed calculation
  const setTimerActiveWithTracking = useCallback((active: boolean) => {
    setIsTimerActive((prev) => {
      if (prev === active) return prev;
      if (!active) {
        pauseStartedAtMsRef.current = Date.now();
      } else if (pauseStartedAtMsRef.current !== null) {
        pausedAccumulatedMsRef.current += Math.max(0, Date.now() - pauseStartedAtMsRef.current);
        pauseStartedAtMsRef.current = null;
      }
      return active;
    });
  }, []);

  // Page Visibility API: pause timer when browser tab is hidden, resume on return
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTimerActiveWithTracking(false);
      } else {
        setTimerActiveWithTracking(true);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [setTimerActiveWithTracking]);

  // Compute current elapsed seconds since lesson navigation
  const getCurrentElapsedSeconds = useCallback(() => {
    const now = Date.now();
    const ongoingPauseMs =
      pauseStartedAtMsRef.current !== null ? Math.max(0, now - pauseStartedAtMsRef.current) : 0;
    const totalPausedMs = pausedAccumulatedMsRef.current + ongoingPauseMs;
    const wallSeconds = calculateElapsedSessionSeconds(
      navigationStartMsRef.current,
      now,
      totalPausedMs
    );
    return Math.max(sessionSecondsRef.current, wallSeconds);
  }, []);

  // Flush session_duration metric on exit (navigate away or window close)
  const flushOnExit = useCallback(
    (exitReason: "navigate_away" | "window_close") => {
      if (hasLoggedExitRef.current || !goalId || !topicId) return;
      const elapsedSeconds = getCurrentElapsedSeconds();
      if (elapsedSeconds < 1) return;

      hasLoggedExitRef.current = true;
      void persistSessionDurationToDatabase({
        goalId,
        topicId,
        topicTitle,
        sessionDurationSeconds: elapsedSeconds,
        startedAt: startedAtIsoRef.current,
        exitReason,
        markCompleted: isCompletedRef.current,
      });
    },
    [goalId, topicId, topicTitle, getCurrentElapsedSeconds]
  );

  // Listen for window/tab close and unmount navigation
  useEffect(() => {
    const handleWindowClose = () => {
      flushOnExit("window_close");
    };

    window.addEventListener("beforeunload", handleWindowClose);
    window.addEventListener("pagehide", handleWindowClose);

    return () => {
      window.removeEventListener("beforeunload", handleWindowClose);
      window.removeEventListener("pagehide", handleWindowClose);
      flushOnExit("navigate_away");
    };
  }, [flushOnExit]);

  // Explicit log (e.g., Complete Lesson or Log Current Session button)
  const logActiveSessionNow = useCallback(
    async (
      exitReason: "completed" | "manual_log",
      markCompleted: boolean
    ): Promise<{ durationLogged: number; totalSeconds: number; metric: SessionDurationMetric }> => {
      const elapsed = Math.max(1, getCurrentElapsedSeconds());
      const { metric, totalSeconds } = await persistSessionDurationToDatabase({
        goalId,
        topicId,
        topicTitle,
        sessionDurationSeconds: elapsed,
        startedAt: startedAtIsoRef.current,
        exitReason,
        markCompleted,
      });

      // Reset timer baseline so subsequent reading before leaving isn't double-counted
      navigationStartMsRef.current = Date.now();
      startedAtIsoRef.current = new Date().toISOString();
      pausedAccumulatedMsRef.current = 0;
      pauseStartedAtMsRef.current = markCompleted ? Date.now() : null;
      sessionSecondsRef.current = 0;
      setSessionSeconds(0);
      setTotalLoggedSeconds(totalSeconds);
      if (markCompleted) {
        setIsCompleted(true);
        setIsTimerActive(false);
      } else {
        setIsTimerActive(true);
      }
      setLastLoggedMetric(metric);
      setSessionLogs(getSessionDurationMetrics(goalId, topicId));

      return { durationLogged: elapsed, totalSeconds, metric };
    },
    [goalId, topicId, topicTitle, getCurrentElapsedSeconds]
  );

  return {
    sessionSeconds,
    isTimerActive,
    totalLoggedSeconds,
    isCompleted,
    sessionLogs,
    lastLoggedMetric,
    toggleTimer: () => setTimerActiveWithTracking(!isTimerActive),
    flushOnExit,
    logActiveSessionNow,
  };
}

export function LessonView({ goalId, topicId, onNavigate }: LessonViewProps) {
  const goal = getGoalById(goalId);
  const roadmap = goal ? getCurrentRoadmapForGoal(goal.id) : undefined;

  let topic: RoadmapTopic | undefined;
  let moduleTitle = "Module";
  if (roadmap) {
    for (const m of roadmap.modules) {
      const found = m.topics.find((t) => t.id === topicId);
      if (found) {
        topic = found;
        moduleTitle = m.title;
        break;
      }
    }
  }

  const [lesson, setLesson] = useState<Lesson | undefined>(() => {
    let existing = getLessonByTopicId(topicId);
    if (!existing && topic && goal) {
      existing = generateLessonForTopic(topic.id, topic.title, goal.id, "standard");
      addLesson(existing);
    }
    return existing;
  });

  useEffect(() => {
    let existing = getLessonByTopicId(topicId);
    if (!existing && topic && goal) {
      existing = generateLessonForTopic(topic.id, topic.title, goal.id, "standard");
      addLesson(existing);
    }
    setLesson(existing);
  }, [topicId, goal?.id]);

  const [completedSections, setCompletedSections] = useState<Record<string, boolean>>({});
  const [showSimpleDrawer, setShowSimpleDrawer] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [isGeneratingVersion, setIsGeneratingVersion] = useState(false);
  const [completionAlert, setCompletionAlert] = useState<{
    show: boolean;
    sessionTime: number;
    totalTime: number;
  } | null>(null);

  const {
    sessionSeconds,
    isTimerActive,
    totalLoggedSeconds,
    isCompleted,
    sessionLogs,
    toggleTimer,
    flushOnExit,
    logActiveSessionNow,
  } = useLessonSessionDurationTracker({
    goalId: goal?.id || goalId,
    topicId: topic?.id || topicId,
    topicTitle: topic?.title,
    initialLoggedSeconds: topic?.reading_time_seconds || 0,
    initialIsCompleted: topic?.status === "completed",
  });

  const handleNavigateWithSessionFlush = (targetPath: string) => {
    flushOnExit("navigate_away");
    onNavigate(targetPath);
  };

  if (!goal || !topic || !lesson) {
    return (
      <PageContainer className="py-8 text-center space-y-4">
        <h2 className="font-heading text-xl font-bold">Topic not found</h2>
        <Button onClick={() => handleNavigateWithSessionFlush(`/goals/${goalId}`)}>
          Back to Goal
        </Button>
      </PageContainer>
    );
  }

  // Toggle individual section read state
  const toggleSection = (sId: string) => {
    setCompletedSections((prev) => {
      const next = { ...prev, [sId]: !prev[sId] };
      const allSectionsDone = lesson.sections.every((s) => (s.id === sId ? next[s.id] : prev[s.id]));

      if (allSectionsDone && !isCompleted) {
        void handleCompleteAndLog();
      } else {
        updateTopicStatus(goal.id, topic.id, "in_progress");
      }
      return next;
    });
  };

  // Explicit completion action
  const handleCompleteAndLog = async () => {
    const { durationLogged, totalSeconds } = await logActiveSessionNow("completed", true);
    setCompletionAlert({
      show: true,
      sessionTime: durationLogged,
      totalTime: totalSeconds,
    });
  };

  const handleToggleTimer = () => {
    toggleTimer();
  };

  const handleResetSessionTimer = async () => {
    if (sessionSeconds > 0) {
      await logActiveSessionNow("manual_log", isCompleted);
    }
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const switchVersion = (v: "standard" | "simpler" | "deep_dive") => {
    setIsGeneratingVersion(true);
    setTimeout(() => {
      const newLesson = generateLessonForTopic(topic.id, topic.title, goal.id, v);
      addLesson(newLesson);
      setLesson(newLesson);
      setIsGeneratingVersion(false);
    }, 500);
  };

  const handleDownloadPDF = () => {
    addExport({
      id: `exp-${Date.now()}`,
      goal_id: goal.id,
      kind: "lesson",
      title: `Lesson: ${topic.title}.pdf`,
      format: "pdf",
      size_kb: 240,
      created_at: new Date().toISOString(),
      status: "ready",
    });
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const handleNavigateToQuiz = () => {
    handleNavigateWithSessionFlush(`/goals/${goal.id}/learn/${topic.id}/quiz`);
  };

  // Find next topic if available
  const allTopics = roadmap ? roadmap.modules.flatMap((m) => m.topics) : [];
  const currentIdx = allTopics.findIndex((t) => t.id === topic.id);
  const prevTopic = currentIdx > 0 ? allTopics[currentIdx - 1] : null;
  const nextTopic = currentIdx >= 0 && currentIdx < allTopics.length - 1 ? allTopics[currentIdx + 1] : null;

  return (
    <PageContainer className="py-8 max-w-4xl space-y-8">
      <div>
        <button
          onClick={() => handleNavigateWithSessionFlush(`/goals/${goal.id}/roadmap`)}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="size-4" />
          Back to roadmap
        </button>

        <PageHeader
          eyebrow={
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <Badge variant="secondary">{moduleTitle}</Badge>
              {topic.day_number && (
                <Badge variant="outline">Day {topic.day_number}</Badge>
              )}
              <span className="text-xs text-muted-foreground">
                Est: {topic.estimated_minutes} min
              </span>
              {totalLoggedSeconds > 0 && (
                <Badge variant="success" className="gap-1 text-[11px]">
                  <CheckCircle2 className="size-3" />
                  {formatDuration(totalLoggedSeconds)} logged
                </Badge>
              )}
              {isCompleted && (
                <Badge variant="info" className="text-[11px]">
                  Completed
                </Badge>
              )}
            </div>
          }
          title={topic.title}
          description={topic.description}
          actions={
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadPDF}
                className="gap-1.5"
              >
                {downloadSuccess ? (
                  <>
                    <Check className="size-3.5 text-success" />
                    Saved
                  </>
                ) : (
                  <>
                    <Download className="size-3.5" />
                    Download Notes
                  </>
                )}
              </Button>

              <Button
                size="sm"
                onClick={handleNavigateToQuiz}
                className="gap-1.5"
              >
                <ClipboardCheck className="size-4" />
                Take Topic Quiz
              </Button>
            </div>
          }
        />
      </div>

      {/* Real-Time Reading Timer Bar */}
      <div className="sticky top-18 z-30 flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border border-primary/25 bg-card/95 backdrop-blur-md shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary font-mono text-sm font-semibold tracking-wider text-foreground">
            <Timer className={`size-4 ${isTimerActive ? "text-primary animate-pulse" : "text-muted-foreground"}`} />
            <span>{formatClockTime(sessionSeconds)}</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span
              className={`inline-block size-2 rounded-full ${
                isTimerActive ? "bg-success animate-ping" : "bg-muted-foreground"
              }`}
            />
            <span className="font-medium text-foreground">
              {isTimerActive ? "Reading Active" : "Timer Paused"}
            </span>
            <span className="hidden sm:inline">
              · Auto-logs <code className="text-[11px] font-mono text-primary">session_duration</code> on exit
            </span>
            {sessionLogs.length > 0 && (
              <Badge variant="outline" className="ml-1 text-[10px] gap-1 hidden md:inline-flex">
                <Database className="size-2.5 text-primary" />
                {sessionLogs.length} {sessionLogs.length === 1 ? "session" : "sessions"} logged
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleTimer}
            className="h-8 px-2.5 text-xs gap-1.5"
            title={isTimerActive ? "Pause reading timer" : "Resume reading timer"}
          >
            {isTimerActive ? (
              <>
                <Pause className="size-3.5" />
                Pause
              </>
            ) : (
              <>
                <Play className="size-3.5 text-primary" />
                Resume
              </>
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetSessionTimer}
            className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
            title="Log current time and reset session clock"
          >
            <RotateCcw className="size-3.5" />
          </Button>

          {!isCompleted ? (
            <Button
              size="sm"
              onClick={handleCompleteAndLog}
              className="h-8 text-xs font-semibold gap-1.5 bg-success hover:bg-success/90 text-white"
            >
              <Check className="size-3.5" />
              Complete & Log Progress
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCompleteAndLog}
              className="h-8 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <Award className="size-3.5 text-success" />
              Log Current Session
            </Button>
          )}
        </div>
      </div>

      {/* Completion Alert Notification */}
      {completionAlert?.show && (
        <Alert variant="success" className="animate-in fade-in-0 slide-in-from-top-2 border-success/40 bg-success-soft">
          <Award className="size-5 text-success" />
          <AlertTitle className="text-base font-semibold text-success-foreground">
            🎉 Lesson Completed! Reading Duration Logged.
          </AlertTitle>
          <AlertDescription className="text-xs sm:text-sm text-foreground mt-1 space-y-1">
            <p>
              You logged <strong>{formatDuration(completionAlert.sessionTime)}</strong> for this reading session.
              Total accumulated study time on this topic: <strong>{formatDuration(completionAlert.totalTime)}</strong>.
            </p>
            <p className="text-muted-foreground pt-1">
              Your curriculum progress metrics and roadmap have been updated.
            </p>
          </AlertDescription>
        </Alert>
      )}

      {/* Version Selector Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border border-border bg-card">
        <div className="flex items-center gap-1.5 text-sm">
          <span className="text-xs font-semibold text-muted-foreground mr-1">Explanation depth:</span>
          {(
            [
              { id: "standard", label: "Standard" },
              { id: "simpler", label: "Simpler" },
              { id: "deep_dive", label: "Deep Dive" },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              onClick={() => switchVersion(item.id)}
              disabled={isGeneratingVersion}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                lesson.version === item.id
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSimpleDrawer(!showSimpleDrawer)}
          className="text-xs h-7 gap-1"
        >
          <Lightbulb className="size-3.5 text-warning" />
          {showSimpleDrawer ? "Hide Analogy" : "In Simple Terms"}
        </Button>
      </div>

      {/* "In Simple Terms" Analogy Box */}
      {showSimpleDrawer && (
        <Alert variant="warning" className="border-warning/40 animate-in fade-in-0 duration-200">
          <Lightbulb className="size-5 text-warning" />
          <AlertTitle className="text-base font-semibold">Plain-Language Analogy</AlertTitle>
          <AlertDescription className="text-sm mt-1 leading-relaxed">
            {lesson.simple_explanation}
          </AlertDescription>
        </Alert>
      )}

      {/* Learning Objectives */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-primary">
            <CheckCircle2 className="size-4.5" />
            Learning Objectives
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-2 sm:grid-cols-2 text-sm text-foreground/90">
            {lesson.objectives.map((obj, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold mt-0.5">
                  {i + 1}
                </span>
                <span>{obj}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Main Sections */}
      <div className="space-y-6">
        {lesson.sections.map((section) => {
          const isDone = completedSections[section.id];

          return (
            <Card key={section.id} className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-3 bg-muted/20 border-b border-border/40">
                <CardTitle className="text-lg font-heading">{section.title}</CardTitle>
                <button
                  onClick={() => toggleSection(section.id)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                    isDone
                      ? "bg-success-soft text-success border border-success/30 font-semibold"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Check className="size-3.5" />
                  {isDone ? "Completed" : "Mark as read"}
                </button>
              </CardHeader>

              <CardContent className="pt-5 space-y-4 text-foreground/90 leading-relaxed">
                <div className="whitespace-pre-line text-sm sm:text-base">
                  {section.content}
                </div>

                {/* Callout box */}
                {section.callout && (
                  <div
                    className={`p-4 rounded-lg border text-sm flex gap-3 ${
                      section.callout.type === "tip"
                        ? "bg-success-soft border-success/30 text-success-foreground"
                        : section.callout.type === "warning"
                          ? "bg-warning-soft border-warning/30 text-warning-foreground"
                          : "bg-info-soft border-info/30 text-info-foreground"
                    }`}
                  >
                    <Lightbulb className="size-5 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold capitalize text-xs tracking-wide mb-0.5">
                        {section.callout.type}
                      </p>
                      <p>{section.callout.message}</p>
                    </div>
                  </div>
                )}

                {/* Code Snippet */}
                {section.codeSnippet && (
                  <div className="rounded-xl border border-border bg-muted/70 overflow-hidden text-sm font-mono mt-3">
                    <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card/60 text-xs text-muted-foreground">
                      <span>{section.codeSnippet.language.toUpperCase()}</span>
                      <button
                        onClick={() => handleCopy(section.codeSnippet!.code)}
                        className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer"
                      >
                        {copiedCode === section.codeSnippet.code ? (
                          <>
                            <Check className="size-3.5 text-success" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="size-3.5" />
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="p-4 overflow-x-auto text-xs sm:text-sm leading-relaxed text-foreground">
                      <code>{section.codeSnippet.code}</code>
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Key Terms Glossary */}
      {lesson.key_terms && lesson.key_terms.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-heading">Key Terms & Concepts</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 sm:grid-cols-2 text-sm">
              {lesson.key_terms.map((item, idx) => (
                <div key={idx} className="p-3 rounded-lg border border-border bg-muted/20 space-y-1">
                  <dt className="font-semibold text-primary">{item.term}</dt>
                  <dd className="text-muted-foreground text-xs leading-relaxed">
                    {item.definition}
                  </dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      )}

      {/* Worked Example */}
      {lesson.worked_example && (
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base font-heading flex items-center gap-2">
              <Sparkles className="size-4.5 text-primary" />
              Worked Example: {lesson.worked_example.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm font-medium bg-muted/60 p-3 rounded-lg">
              <span className="font-semibold text-foreground">Scenario: </span>
              {lesson.worked_example.problem}
            </p>

            <ol className="space-y-3">
              {lesson.worked_example.steps.map((st) => (
                <li key={st.step_number} className="flex gap-3 text-sm">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary font-semibold text-xs text-foreground">
                    {st.step_number}
                  </span>
                  <div className="space-y-0.5">
                    <p className="font-semibold text-foreground">{st.instruction}</p>
                    <p className="text-muted-foreground text-xs">{st.explanation}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-xs sm:text-sm font-medium text-primary">
              <span className="font-bold">Key Takeaway: </span>
              {lesson.worked_example.takeaway}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Common Mistakes */}
      {lesson.common_mistakes && lesson.common_mistakes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-heading flex items-center gap-2 text-destructive">
              <AlertTriangle className="size-4.5" />
              Common Mistakes & Pitfalls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {lesson.common_mistakes.map((cm, idx) => (
              <div key={idx} className="p-3.5 rounded-lg border border-destructive/20 bg-destructive-soft/50 space-y-1.5 text-sm">
                <p className="font-semibold text-destructive-foreground">✕ {cm.mistake}</p>
                <p className="text-xs text-muted-foreground">{cm.why}</p>
                <p className="text-xs font-medium text-foreground bg-card/80 p-2 rounded border border-border">
                  <span className="text-success font-bold">✓ Fix: </span> {cm.solution}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Summary Box */}
      <Card className="bg-muted/40 p-5 space-y-2">
        <h4 className="font-heading font-semibold text-foreground text-base">Summary</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">{lesson.summary}</p>
      </Card>

      {/* Bottom Action / Completion Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-xl border border-primary/30 bg-primary/5">
        <div className="space-y-1 text-center sm:text-left">
          <h4 className="font-heading font-semibold text-foreground text-base">
            Ready to test your understanding?
          </h4>
          <p className="text-xs text-muted-foreground">
            {sessionSeconds > 0
              ? `Current reading time (${formatDuration(sessionSeconds)}) will be logged to your progress.`
              : "Quizzes are graded with explanations for every answer."}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {!isCompleted && (
            <Button
              variant="outline"
              size="lg"
              onClick={handleCompleteAndLog}
              className="gap-2 bg-card"
            >
              <Check className="size-4.5 text-success" />
              Complete Lesson
            </Button>
          )}

          <Button
            size="lg"
            onClick={handleNavigateToQuiz}
            className="gap-2 shrink-0"
          >
            <ClipboardCheck className="size-5" />
            Take Topic Quiz
          </Button>
        </div>
      </div>

      {/* Previous / Next Topic Links */}
      <div className="flex items-center justify-between pt-4 border-t border-border text-sm">
        {prevTopic ? (
          <button
            onClick={() => handleNavigateWithSessionFlush(`/goals/${goal.id}/learn/${prevTopic.id}`)}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <ArrowLeft className="size-4" />
            <span className="truncate max-w-[200px]">{prevTopic.title}</span>
          </button>
        ) : (
          <div />
        )}

        {nextTopic && (
          <button
            onClick={() => handleNavigateWithSessionFlush(`/goals/${goal.id}/learn/${nextTopic.id}`)}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors ml-auto cursor-pointer"
          >
            <span className="truncate max-w-[200px]">{nextTopic.title}</span>
            <ArrowRight className="size-4" />
          </button>
        )}
      </div>
    </PageContainer>
  );
}
