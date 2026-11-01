import React, { useState } from "react";
import { ArrowLeft, Archive, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { Goal } from "@/types";
import { getGoals, updateGoal, deleteGoalPermanently } from "@/lib/storage";

export function ArchivedGoalsView({ onNavigate }: { onNavigate: (path: string) => void }) {
  const [goals, setGoals] = useState<Goal[]>(() =>
    getGoals().filter((g) => g.status === "archived")
  );
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const handleRestore = (goalId: string) => {
    updateGoal(goalId, { status: "active" });
    setGoals(getGoals().filter((g) => g.status === "archived"));
  };

  const handleConfirmDelete = () => {
    if (deleteTargetId) {
      deleteGoalPermanently(deleteTargetId);
      setGoals(getGoals().filter((g) => g.status === "archived"));
      setDeleteTargetId(null);
    }
  };

  return (
    <PageContainer className="py-8 max-w-4xl space-y-8">
      <div>
        <button
          onClick={() => onNavigate("/dashboard")}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="size-4" />
          All goals
        </button>

        <PageHeader
          title="Archived Goals"
          description="Goals you have put away. You can restore them at any time to resume study, or delete them for good."
        />
      </div>

      {goals.length === 0 ? (
        <Card className="p-12 text-center space-y-4">
          <Archive className="size-12 mx-auto text-muted-foreground/60" />
          <h3 className="font-heading text-lg font-semibold">Nothing archived</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            When you archive a goal from its detail page, it stays safely here until you restore it.
          </p>
          <Button variant="outline" onClick={() => onNavigate("/dashboard")}>
            Back to your goals
          </Button>
        </Card>
      ) : (
        <div className="grid gap-3">
          {goals.map((goal) => (
            <Card key={goal.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Archived</Badge>
                  <span className="text-xs text-muted-foreground capitalize">
                    {goal.goal_type.replace("_", " ")} · {goal.daily_minutes} min/day
                  </span>
                </div>
                <h4
                  onClick={() => onNavigate(`/goals/${goal.id}`)}
                  className="font-heading font-semibold text-foreground text-base cursor-pointer hover:text-primary transition-colors"
                >
                  {goal.title}
                </h4>
                {goal.description && (
                  <p className="text-xs text-muted-foreground line-clamp-1">{goal.description}</p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRestore(goal.id)}
                  className="gap-1.5"
                >
                  <RefreshCw className="size-3.5" />
                  Restore
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDeleteTargetId(goal.id)}
                  className="gap-1.5"
                >
                  <Trash2 className="size-3.5" />
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTargetId} onOpenChange={() => setDeleteTargetId(null)}>
        <DialogHeader>
          <DialogTitle>Delete goal permanently?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. All roadmaps, lessons, quizzes, and flashcards for this goal will be removed.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDeleteTargetId(null)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirmDelete}>
            Delete Permanently
          </Button>
        </DialogFooter>
      </Dialog>
    </PageContainer>
  );
}
