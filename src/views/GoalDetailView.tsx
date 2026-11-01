import React, { useState } from "react";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Layers,
  FileText,
  BookOpen,
  FolderDown,
  Pause,
  Zap,
  CheckCircle2,
  Archive,
  Trash2,
  Edit,
  Sparkles,
  RefreshCw,
  ExternalLink,
  Video,
  Timer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { Goal } from "@/types";
import { formatDuration } from "@/views/LessonView";
import {
  getGoalById,
  updateGoal,
  deleteGoalPermanently,
  getCurrentRoadmapForGoal,
  getDocumentsForGoal,
  getFlashcardsForGoal,
  getExportsForGoal,
  getResourcesForGoal,
  addRoadmap,
} from "@/lib/storage";
import { generateRoadmapForGoal } from "@/lib/ai-generator";

interface GoalDetailViewProps {
  goalId: string;
  onNavigate: (path: string) => void;
}

export function GoalDetailView({ goalId, onNavigate }: GoalDetailViewProps) {
  const [goal, setGoal] = useState<Goal | undefined>(getGoalById(goalId));
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [regenerateOpen, setRegenerateOpen] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  if (!goal) {
    return (
      <PageContainer className="py-12 text-center">
        <h2 className="font-heading text-2xl font-bold mb-4">Goal not found</h2>
        <Button onClick={() => onNavigate("/dashboard")}>Back to Goals</Button>
      </PageContainer>
    );
  }

  const roadmap = getCurrentRoadmapForGoal(goal.id);
  const documents = getDocumentsForGoal(goal.id);
  const flashcards = getFlashcardsForGoal(goal.id);
  const exportsList = getExportsForGoal(goal.id);
  const resources = getResourcesForGoal(goal.id);

  // Compute progress
  const allTopics = roadmap ? roadmap.modules.flatMap((m) => m.topics) : [];
  const completedTopics = allTopics.filter((t) => t.status === "completed");
  const progressPercent = allTopics.length > 0 ? Math.round((completedTopics.length / allTopics.length) * 100) : 0;
  const totalReadingSeconds = allTopics.reduce((acc, t) => acc + (t.reading_time_seconds || 0), 0);

  // Flashcards due
  const dueCards = flashcards.filter((c) => new Date(c.due_at) <= new Date());

  const handleStatusChange = (newStatus: Goal["status"]) => {
    const updated = updateGoal(goal.id, { status: newStatus });
    setGoal(updated);
  };

  const handleDelete = () => {
    deleteGoalPermanently(goal.id);
    setDeleteConfirmOpen(false);
    onNavigate("/dashboard");
  };

  const handleRegenerate = () => {
    setIsRegenerating(true);
    setTimeout(() => {
      const nextVer = (roadmap?.version || 1) + 1;
      const newPlan = generateRoadmapForGoal(goal, nextVer);
      addRoadmap(newPlan);
      setIsRegenerating(false);
      setRegenerateOpen(false);
    }, 1000);
  };

  const isArchived = goal.status === "archived";
  const isPaused = goal.status === "paused";
  const isCompleted = goal.status === "completed";

  return (
    <PageContainer className="py-8 space-y-8 max-w-4xl">
      <div>
        <button
          onClick={() => onNavigate(isArchived ? "/goals/archived" : "/dashboard")}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="size-4" />
          <span>{isArchived ? "Archived goals" : "All goals"}</span>
        </button>

        <PageHeader
          eyebrow={
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <Badge variant={isCompleted ? "success" : isPaused ? "warning" : isArchived ? "secondary" : "default"}>
                {isCompleted ? "Completed" : isPaused ? "Paused" : isArchived ? "Archived" : "Active"}
              </Badge>
              <Badge variant="outline" className="capitalize">
                {goal.current_level}
              </Badge>
              <Badge variant="secondary" className="capitalize">
                {goal.goal_type.replace("_", " ")}
              </Badge>
            </div>
          }
          title={goal.title}
          description={goal.description || undefined}
          actions={
            <div className="flex items-center gap-2 flex-wrap">
              {!isArchived && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onNavigate(`/goals/${goal.id}/edit`)}
                    className="gap-1.5"
                  >
                    <Edit className="size-3.5" />
                    Edit
                  </Button>

                  {isPaused ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange("active")}
                      className="gap-1.5 text-primary"
                    >
                      <Zap className="size-3.5" />
                      Resume
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange("paused")}
                      className="gap-1.5"
                    >
                      <Pause className="size-3.5" />
                      Pause
                    </Button>
                  )}

                  {!isCompleted && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange("completed")}
                      className="gap-1.5 text-success"
                    >
                      <CheckCircle2 className="size-3.5" />
                      Complete
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleStatusChange("archived")}
                    title="Archive goal"
                    className="gap-1.5 text-muted-foreground hover:text-foreground"
                  >
                    <Archive className="size-3.5" />
                    Archive
                  </Button>
                </>
              )}

              {isArchived && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange("active")}
                    className="gap-1.5"
                  >
                    <RefreshCw className="size-3.5" />
                    Restore Goal
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteConfirmOpen(true)}
                    className="gap-1.5"
                  >
                    <Trash2 className="size-3.5" />
                    Delete for Good
                  </Button>
                </>
              )}
            </div>
          }
        />
      </div>

      {isArchived && (
        <Alert variant="info">
          <Archive className="size-4" />
          <AlertDescription>
            This goal is archived and read-only. Restore it to edit preferences, resume lessons, or add documents.
          </AlertDescription>
        </Alert>
      )}

      {/* Goal Details Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 p-4 rounded-xl border border-border bg-card">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
            <Clock className="size-3.5" /> Daily Study
          </p>
          <p className="font-semibold text-foreground text-sm">{goal.daily_minutes} minutes/day</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
            <Calendar className="size-3.5" /> Target Date
          </p>
          <p className="font-semibold text-foreground text-sm">{goal.target_date || "No deadline"}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
            <Timer className="size-3.5 text-primary" /> Study Logged
          </p>
          <p className="font-semibold text-foreground text-sm">
            {totalReadingSeconds > 0 ? formatDuration(totalReadingSeconds) : "0s"}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground font-medium">Languages</p>
          <p className="font-semibold text-foreground text-sm uppercase">
            {goal.preferred_languages.join(", ")}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground font-medium">Curriculum Progress</p>
          <p className="font-semibold text-foreground text-sm">{progressPercent}% ({completedTopics.length}/{allTopics.length})</p>
        </div>
      </div>

      {/* Roadmap Section */}
      <Card className="hover:border-primary/30 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="size-5 text-primary" />
                Study Roadmap
              </CardTitle>
              {roadmap && (
                <Badge variant="info">v{roadmap.version} Current</Badge>
              )}
            </div>
            <CardDescription>
              {roadmap
                ? `${roadmap.modules.length} modules · ${allTopics.length} topics · ~${roadmap.total_estimated_hours} hours total`
                : "No roadmap generated yet."}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {!isArchived && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRegenerateOpen(true)}
                className="gap-1.5"
              >
                <Sparkles className="size-3.5" />
                Regenerate
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => onNavigate(`/goals/${goal.id}/roadmap`)}
              className="gap-1.5"
            >
              Open Roadmap
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground font-medium">
              <span>Overall Completion</span>
              <span>{progressPercent}%</span>
            </div>
            <Progress value={progressPercent} />
          </div>

          {roadmap && (
            <div className="grid gap-2 sm:grid-cols-3 pt-2">
              {roadmap.modules.map((m, idx) => {
                const modCompleted = m.topics.filter((t) => t.status === "completed").length;
                return (
                  <div
                    key={m.id}
                    onClick={() => onNavigate(`/goals/${goal.id}/roadmap`)}
                    className="p-3 rounded-lg border border-border/80 bg-muted/40 hover:bg-muted/70 transition-colors cursor-pointer space-y-1.5"
                  >
                    <p className="text-xs font-semibold text-muted-foreground">Module {idx + 1}</p>
                    <p className="text-sm font-medium line-clamp-1 text-foreground">{m.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {modCompleted}/{m.topics.length} topics done
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Grid: Study Material (Documents) & Spaced Repetition (Flashcards) */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Study Material */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="size-4.5 text-primary" />
                Study Material
              </CardTitle>
              <CardDescription>
                {documents.length} {documents.length === 1 ? "document" : "documents"} indexed
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate(`/goals/${goal.id}/documents`)}
            >
              Manage
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {documents.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">
                No materials added yet. Upload PDFs, notes, or pasted text to cite in your lessons.
              </p>
            ) : (
              <ul className="space-y-2">
                {documents.slice(0, 3).map((doc) => (
                  <li
                    key={doc.id}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-card text-sm"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="size-4 shrink-0 text-muted-foreground" />
                      <span className="truncate font-medium">{doc.title}</span>
                    </div>
                    <Badge variant="success" className="text-[10px]">
                      {doc.chunk_count} passages
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Flashcards */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-base">
                <Layers className="size-4.5 text-primary" />
                Flashcards
              </CardTitle>
              <CardDescription>
                {dueCards.length} due for review · {flashcards.length} total
              </CardDescription>
            </div>
            <Button
              variant={dueCards.length > 0 ? "default" : "outline"}
              size="sm"
              onClick={() => onNavigate(`/goals/${goal.id}/flashcards`)}
            >
              {dueCards.length > 0 ? `Review (${dueCards.length})` : "View Deck"}
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-lg bg-secondary">
                <p className="text-xs text-muted-foreground">Due Now</p>
                <p className="text-lg font-bold text-foreground">{dueCards.length}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-secondary">
                <p className="text-xs text-muted-foreground">Learning</p>
                <p className="text-lg font-bold text-foreground">
                  {flashcards.filter((c) => c.stage === "learning").length}
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-secondary">
                <p className="text-xs text-muted-foreground">Mastered</p>
                <p className="text-lg font-bold text-foreground">
                  {flashcards.filter((c) => c.stage === "mastered").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Video Lectures */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-base">
                <Video className="size-4.5 text-primary" />
                Curated Video Lectures
              </CardTitle>
              <CardDescription>
                {resources.length} verified educational YouTube lectures in {goal.preferred_languages.join(", ").toUpperCase()}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate(`/goals/${goal.id}/resources`)}
            >
              Watch & Discover
            </Button>
          </CardHeader>
          <CardContent>
            {resources.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">
                No curated video lectures assigned yet.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {resources.slice(0, 3).map((res) => (
                  <div
                    key={res.id}
                    className="flex flex-col justify-between p-3 rounded-lg border border-border bg-card text-xs hover:border-primary/40 transition-colors"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <Badge variant="outline" className="text-[10px] uppercase">
                          {res.language}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">⏱️ {res.duration}</span>
                      </div>
                      <p className="font-semibold text-foreground line-clamp-2">{res.title}</p>
                      <p className="text-muted-foreground text-[11px] mt-0.5">{res.channel}</p>
                    </div>
                    <a
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-primary hover:underline text-[11px] font-medium"
                    >
                      Watch on YouTube
                      <ExternalLink className="size-3" />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Export Section Footer Link */}
      <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card/60">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FolderDown className="size-4 text-primary" />
          <span>
            {exportsList.length > 0
              ? `${exportsList.length} downloaded files available (PDF notes, curriculum charts).`
              : "Download copies of your roadmaps and lessons as printable PDFs."}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onNavigate(`/goals/${goal.id}/exports`)}
          className="text-xs"
        >
          Export Center
        </Button>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogHeader>
          <DialogTitle>Delete goal permanently?</DialogTitle>
          <DialogDescription>
            This will delete "{goal.title}" along with its roadmap, lesson history, quizzes, and flashcards. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Confirm Deletion
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Regenerate Roadmap Dialog */}
      <Dialog open={regenerateOpen} onOpenChange={setRegenerateOpen}>
        <DialogHeader>
          <DialogTitle>Revise Roadmap with AI Planner</DialogTitle>
          <DialogDescription>
            Generate a fresh curriculum version based on your current study preferences ({goal.daily_minutes} min/day). Earlier versions are kept in your history.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setRegenerateOpen(false)}>
            Cancel
          </Button>
          <Button loading={isRegenerating} onClick={handleRegenerate}>
            Generate New Roadmap
          </Button>
        </DialogFooter>
      </Dialog>
    </PageContainer>
  );
}
