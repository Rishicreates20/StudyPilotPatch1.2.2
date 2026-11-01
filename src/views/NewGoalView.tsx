import React, { useState } from "react";
import { ArrowLeft, Sparkles, Clock, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { Goal, GoalType, GoalLevel, UserProfile } from "@/types";
import { addGoal, addRoadmap } from "@/lib/storage";
import { generateRoadmapForGoal } from "@/lib/ai-generator";

interface NewGoalViewProps {
  user: UserProfile;
  onNavigate: (path: string) => void;
}

export function NewGoalView({ user, onNavigate }: NewGoalViewProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [goalType, setGoalType] = useState<GoalType>("professional_skill");
  const [level, setLevel] = useState<GoalLevel>("intermediate");
  const [targetDate, setTargetDate] = useState("");
  const [dailyMinutes, setDailyMinutes] = useState(user.preferences.default_daily_minutes || 45);
  const [learningPrefs, setLearningPrefs] = useState<string[]>(["worked_examples", "active_recall"]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const togglePref = (pref: string) => {
    if (learningPrefs.includes(pref)) {
      setLearningPrefs(learningPrefs.filter((p) => p !== pref));
    } else {
      setLearningPrefs([...learningPrefs, pref]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please describe what you want to learn.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    setTimeout(() => {
      const newGoalId = `goal-${Date.now()}`;
      const now = new Date().toISOString();

      const newGoal: Goal = {
        id: newGoalId,
        title: title.trim(),
        description: description.trim() || null,
        goal_type: goalType,
        current_level: level,
        status: "active",
        target_date: targetDate || null,
        daily_minutes: Number(dailyMinutes),
        preferred_languages: ["en"],
        learning_preferences: learningPrefs,
        created_at: now,
        updated_at: now,
      };

      // Save goal
      addGoal(newGoal);

      // Automatically synthesize initial tailored roadmap
      const generatedRoadmap = generateRoadmapForGoal(newGoal, 1);
      addRoadmap(generatedRoadmap);

      setIsSubmitting(false);
      onNavigate(`/goals/${newGoalId}`);
    }, 600);
  };

  return (
    <PageContainer className="py-8 max-w-2xl space-y-6">
      <button
        onClick={() => onNavigate("/dashboard")}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to goals
      </button>

      <PageHeader
        title="Create a learning goal"
        description="The more precisely you describe what you want to achieve, the better your curriculum plan will fit. You can adjust details later."
      />

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-destructive-soft text-destructive-foreground text-sm font-medium">
                {error}
              </div>
            )}

            {/* Goal Title */}
            <div className="space-y-2">
              <Label htmlFor="goal-title">What do you want to learn? *</Label>
              <Input
                id="goal-title"
                placeholder="e.g. Master System Design for Senior Backend Interviews"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                State an outcome or milestone you want to achieve.
              </p>
            </div>

            {/* Goal Type & Level */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="goal-type">Goal Type</Label>
                <select
                  id="goal-type"
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
                <Label htmlFor="current-level">Current Level</Label>
                <select
                  id="current-level"
                  value={level}
                  onChange={(e) => setLevel(e.target.value as GoalLevel)}
                  className="flex h-9 w-full rounded-lg border border-input bg-card px-3 py-1 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="beginner">Beginner (Starting from scratch)</option>
                  <option value="intermediate">Intermediate (Know the basics)</option>
                  <option value="advanced">Advanced (Deep dive & edge cases)</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="goal-desc">Target Context & Details (Optional)</Label>
              <Textarea
                id="goal-desc"
                placeholder="Specific topics you want to prioritize, prior background, or context about the exam/interviews..."
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Target Date & Daily Study Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="target-date">Target Date (Optional)</Label>
                <Input
                  id="target-date"
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="daily-time" className="flex items-center gap-1.5">
                  <Clock className="size-3.5 text-muted-foreground" />
                  Daily Study Time
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="daily-time"
                    type="number"
                    min={15}
                    max={240}
                    step={5}
                    value={dailyMinutes}
                    onChange={(e) => setDailyMinutes(Number(e.target.value))}
                  />
                  <span className="text-sm text-muted-foreground shrink-0">min/day</span>
                </div>
              </div>
            </div>

            {/* Learning Style Preferences */}
            <div className="space-y-2 pt-2">
              <Label>Preferred Study Modalities</Label>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {[
                  { id: "worked_examples", label: "Worked Examples" },
                  { id: "practical_code", label: "Practical Code Tasks" },
                  { id: "active_recall", label: "Active Recall Quizzes" },
                  { id: "visual_diagrams", label: "Conceptual Breakdowns" },
                ].map(({ id, label }) => (
                  <label
                    key={id}
                    className="flex items-center gap-2 p-2.5 rounded-lg border border-border bg-card/60 hover:bg-secondary cursor-pointer transition-colors"
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

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onNavigate("/dashboard")}
              >
                Cancel
              </Button>
              <Button type="submit" loading={isSubmitting} className="gap-2">
                <Sparkles className="size-4" />
                Create Goal & Generate Roadmap
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
