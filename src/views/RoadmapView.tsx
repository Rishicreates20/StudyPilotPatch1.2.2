import React, { useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock,
  Sparkles,
  Download,
  Check,
  ChevronDown,
  ChevronUp,
  FileCheck,
  Timer,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { Goal, Roadmap } from "@/types";
import {
  getGoalById,
  getRoadmapsForGoal,
  setRoadmapCurrent,
  addRoadmap,
  addExport,
} from "@/lib/storage";
import { generateRoadmapForGoal } from "@/lib/ai-generator";

interface RoadmapViewProps {
  goalId: string;
  onNavigate: (path: string) => void;
}

export function RoadmapView({ goalId, onNavigate }: RoadmapViewProps) {
  const goal = getGoalById(goalId);
  const roadmaps = getRoadmapsForGoal(goalId);

  const [selectedRoadmapId, setSelectedRoadmapId] = useState<string>(() => {
    const current = roadmaps.find((r) => r.status === "current");
    return current ? current.id : roadmaps[0]?.id || "";
  });

  const [regenerateOpen, setRegenerateOpen] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Expanded modules state
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

  if (!goal) {
    return (
      <PageContainer className="py-8 text-center">
        <h2 className="font-heading text-xl font-bold mb-4">Goal not found</h2>
        <Button onClick={() => onNavigate("/dashboard")}>Back to Goals</Button>
      </PageContainer>
    );
  }

  const currentRoadmap = roadmaps.find((r) => r.id === selectedRoadmapId) || roadmaps[0];

  if (!currentRoadmap) {
    return (
      <PageContainer className="py-8 max-w-3xl space-y-6">
        <button
          onClick={() => onNavigate(`/goals/${goal.id}`)}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back to {goal.title}
        </button>
        <Card className="p-10 text-center space-y-4">
          <BookOpen className="size-12 mx-auto text-muted-foreground/60" />
          <h2 className="font-heading text-xl font-semibold">No roadmap yet</h2>
          <p className="text-sm text-muted-foreground">
            Generate your personalized curriculum for this goal.
          </p>
          <Button
            onClick={() => {
              const r = generateRoadmapForGoal(goal, 1);
              addRoadmap(r);
              setSelectedRoadmapId(r.id);
            }}
          >
            Generate Roadmap
          </Button>
        </Card>
      </PageContainer>
    );
  }

  const isCurrent = currentRoadmap.status === "current";
  const allTopics = currentRoadmap.modules.flatMap((m) => m.topics);
  const completedTopics = allTopics.filter((t) => t.status === "completed");
  const progressPercent = allTopics.length > 0 ? Math.round((completedTopics.length / allTopics.length) * 100) : 0;

  const toggleModule = (modId: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [modId]: prev[modId] === undefined ? false : !prev[modId],
    }));
  };

  const handleMakeCurrent = () => {
    setRoadmapCurrent(goal.id, currentRoadmap.id);
    onNavigate(`/goals/${goal.id}/roadmap`);
  };

  const handleRegenerate = () => {
    setIsRegenerating(true);
    setTimeout(() => {
      const nextVer = Math.max(...roadmaps.map((r) => r.version), 0) + 1;
      const newPlan = generateRoadmapForGoal(goal, nextVer);
      addRoadmap(newPlan);
      setSelectedRoadmapId(newPlan.id);
      setIsRegenerating(false);
      setRegenerateOpen(false);
    }, 1000);
  };

  const handleExportPDF = () => {
    addExport({
      id: `exp-${Date.now()}`,
      goal_id: goal.id,
      kind: "roadmap",
      title: `${currentRoadmap.title} (v${currentRoadmap.version}).pdf`,
      format: "pdf",
      size_kb: 340,
      created_at: new Date().toISOString(),
      status: "ready",
    });
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <PageContainer className="py-8 max-w-4xl space-y-8">
      <div>
        <button
          onClick={() => onNavigate(`/goals/${goal.id}`)}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="size-4" />
          Back to {goal.title}
        </button>

        <PageHeader
          eyebrow={
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <Badge variant={isCurrent ? "info" : "outline"}>
                Version {currentRoadmap.version} {isCurrent && "· Current"}
              </Badge>
              <span className="text-xs text-muted-foreground">
                ~{currentRoadmap.total_estimated_hours} total study hours
              </span>
            </div>
          }
          title={currentRoadmap.title}
          description={currentRoadmap.description}
          actions={
            <div className="flex items-center gap-2 flex-wrap">
              {!isCurrent && (
                <Button size="sm" variant="outline" onClick={handleMakeCurrent}>
                  Make this version current
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportPDF}
                className="gap-1.5"
              >
                {downloadSuccess ? (
                  <>
                    <Check className="size-3.5 text-success" />
                    Saved to Exports
                  </>
                ) : (
                  <>
                    <Download className="size-3.5" />
                    Download PDF
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigate(`/goals/${goal.id}/resources`)}
                className="gap-1.5"
              >
                <Video className="size-3.5" />
                Lectures
              </Button>
              <Button
                size="sm"
                onClick={() => setRegenerateOpen(true)}
                className="gap-1.5"
              >
                <Sparkles className="size-3.5" />
                Regenerate
              </Button>
            </div>
          }
        />
      </div>

      {/* Progress Card */}
      <Card>
        <CardContent className="pt-6 space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium text-foreground">Roadmap Completion</span>
            <span className="font-semibold text-primary">
              {progressPercent}% ({completedTopics.length}/{allTopics.length} topics)
            </span>
          </div>
          <Progress value={progressPercent} />
        </CardContent>
      </Card>

      {/* Modules and Topics */}
      <div className="space-y-4">
        {currentRoadmap.modules.map((module, mIdx) => {
          const isCollapsed = expandedModules[module.id] === false;
          const modCompleted = module.topics.filter((t) => t.status === "completed").length;

          return (
            <Card key={module.id} className="overflow-hidden border-border/80">
              <div
                onClick={() => toggleModule(module.id)}
                className="flex items-center justify-between p-5 bg-card hover:bg-muted/40 transition-colors cursor-pointer select-none"
              >
                <div className="space-y-1 pr-4">
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-xs">
                      {mIdx + 1}
                    </span>
                    <h3 className="font-heading text-lg font-semibold text-foreground">
                      {module.title}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{module.description}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-medium text-muted-foreground hidden sm:inline">
                    {modCompleted}/{module.topics.length} done
                  </span>
                  {isCollapsed ? (
                    <ChevronDown className="size-5 text-muted-foreground" />
                  ) : (
                    <ChevronUp className="size-5 text-muted-foreground" />
                  )}
                </div>
              </div>

              {!isCollapsed && (
                <div className="border-t border-border divide-y divide-border/60">
                  {module.topics.map((topic) => {
                    const isDone = topic.status === "completed";
                    const inProgress = topic.status === "in_progress";

                    return (
                      <div
                        key={topic.id}
                        className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-secondary/40 transition-colors"
                      >
                        <div className="space-y-1.5 max-w-xl">
                          <div className="flex items-center gap-2 flex-wrap">
                            {topic.day_number && (
                              <Badge variant="outline" className="text-[11px]">
                                Day {topic.day_number}
                              </Badge>
                            )}
                            <Badge
                              variant={topic.kind === "revision" ? "warning" : topic.kind === "enrichment" ? "secondary" : "default"}
                              className="text-[11px] capitalize"
                            >
                              {topic.kind}
                            </Badge>
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="size-3" />
                              {topic.estimated_minutes} min
                            </span>
                            {topic.reading_time_seconds && topic.reading_time_seconds > 0 ? (
                              <Badge variant="outline" className="text-[11px] gap-1 text-primary border-primary/30">
                                <Timer className="size-3" />
                                {Math.round(topic.reading_time_seconds / 60) > 0
                                  ? `${Math.round(topic.reading_time_seconds / 60)}m read`
                                  : `${topic.reading_time_seconds}s read`}
                              </Badge>
                            ) : null}
                            {topic.mastery_score !== null && topic.mastery_score !== undefined && (
                              <Badge variant="success" className="text-[11px]">
                                {topic.mastery_score}% Mastery
                              </Badge>
                            )}
                          </div>

                          <h4 className="font-heading font-semibold text-foreground text-base">
                            {topic.title}
                          </h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {topic.description}
                          </p>

                          {topic.practice_task && (
                            <p className="text-xs text-foreground/80 bg-muted/60 p-2 rounded-md font-mono">
                              <span className="font-sans font-semibold text-muted-foreground">Task: </span>
                              {topic.practice_task}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          <Button
                            variant={isDone ? "outline" : inProgress ? "default" : "secondary"}
                            size="sm"
                            onClick={() => onNavigate(`/goals/${goal.id}/learn/${topic.id}`)}
                            className="gap-1.5"
                          >
                            {isDone ? (
                              <>
                                <CheckCircle2 className="size-4 text-success" />
                                Review Lesson
                              </>
                            ) : (
                              <>
                                <BookOpen className="size-4" />
                                {inProgress ? "Continue Lesson" : "Study Lesson"}
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Version History Selector */}
      {roadmaps.length > 1 && (
        <Card className="p-5 space-y-3">
          <h4 className="font-heading font-semibold text-foreground text-base">Version History</h4>
          <div className="flex flex-wrap gap-2">
            {roadmaps.map((r) => (
              <Button
                key={r.id}
                variant={r.id === selectedRoadmapId ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedRoadmapId(r.id)}
              >
                Version {r.version} {r.status === "current" && "(Current)"}
              </Button>
            ))}
          </div>
        </Card>
      )}

      {/* Regenerate Dialog */}
      <Dialog open={regenerateOpen} onOpenChange={setRegenerateOpen}>
        <DialogHeader>
          <DialogTitle>Generate new curriculum version?</DialogTitle>
          <DialogDescription>
            This asks the AI planner to recalibrate the syllabus. The current version will be archived in your history.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setRegenerateOpen(false)}>
            Cancel
          </Button>
          <Button loading={isRegenerating} onClick={handleRegenerate}>
            Generate New Version
          </Button>
        </DialogFooter>
      </Dialog>
    </PageContainer>
  );
}
