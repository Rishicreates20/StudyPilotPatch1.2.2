import React, { useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { Goal, GoalType, GoalLevel } from "@/types";
import { getGoalById, updateGoal } from "@/lib/storage";

interface EditGoalViewProps {
  goalId: string;
  onNavigate: (path: string) => void;
}

export function EditGoalView({ goalId, onNavigate }: EditGoalViewProps) {
  const goal = getGoalById(goalId);

  const [title, setTitle] = useState(goal?.title || "");
  const [description, setDescription] = useState(goal?.description || "");
  const [goalType, setGoalType] = useState<GoalType>(goal?.goal_type || "professional_skill");
  const [level, setLevel] = useState<GoalLevel>(goal?.current_level || "intermediate");
  const [targetDate, setTargetDate] = useState(goal?.target_date || "");
  const [dailyMinutes, setDailyMinutes] = useState(goal?.daily_minutes || 45);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!goal) {
    return (
      <PageContainer className="py-8 text-center">
        <h2 className="font-heading text-xl font-bold mb-4">Goal not found</h2>
        <Button onClick={() => onNavigate("/dashboard")}>Back to Goals</Button>
      </PageContainer>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      updateGoal(goal.id, {
        title: title.trim(),
        description: description.trim() || null,
        goal_type: goalType,
        current_level: level,
        target_date: targetDate || null,
        daily_minutes: Number(dailyMinutes),
      });
      setIsSubmitting(false);
      onNavigate(`/goals/${goal.id}`);
    }, 400);
  };

  return (
    <PageContainer className="py-8 max-w-2xl space-y-6">
      <button
        onClick={() => onNavigate(`/goals/${goal.id}`)}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to {goal.title}
      </button>

      <PageHeader
        title="Edit your goal"
        description="Update your timeline, daily study commitments, or objectives. Your progress and study history are preserved."
      />

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Goal Title *</Label>
              <Input
                id="edit-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-type">Goal Type</Label>
                <select
                  id="edit-type"
                  value={goalType}
                  onChange={(e) => setGoalType(e.target.value as GoalType)}
                  className="flex h-9 w-full rounded-lg border border-input bg-card px-3 py-1 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="professional_skill">Professional Skill</option>
                  <option value="certification">Certification</option>
                  <option value="exam">Academic Exam</option>
                  <option value="career_pivot">Career Pivot</option>
                  <option value="hobby">Personal Hobby</option>
                  <option value="general">General Knowledge</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-level">Current Level</Label>
                <select
                  id="edit-level"
                  value={level}
                  onChange={(e) => setLevel(e.target.value as GoalLevel)}
                  className="flex h-9 w-full rounded-lg border border-input bg-card px-3 py-1 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-desc">Description</Label>
              <Textarea
                id="edit-desc"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-date">Target Date</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-mins">Daily Study Time (Minutes)</Label>
                <Input
                  id="edit-mins"
                  type="number"
                  min={15}
                  max={240}
                  step={5}
                  value={dailyMinutes}
                  onChange={(e) => setDailyMinutes(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onNavigate(`/goals/${goal.id}`)}
              >
                Cancel
              </Button>
              <Button type="submit" loading={isSubmitting} className="gap-2">
                <Save className="size-4" />
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
