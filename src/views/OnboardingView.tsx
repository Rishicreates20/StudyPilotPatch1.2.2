import React, { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Sparkles, Clock, Globe, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { UserProfile, Goal, GoalType, GoalLevel } from "@/types";
import { getUserProfile, saveUserProfile, addGoal, addRoadmap } from "@/lib/storage";
import { generateRoadmapForGoal } from "@/lib/ai-generator";

export function OnboardingView({ onNavigate }: { onNavigate: (path: string) => void }) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const user = getUserProfile();

  // Step 1 state
  const [displayName, setDisplayName] = useState(user.display_name || "");
  const [primaryLang, setPrimaryLang] = useState(user.preferences.preferred_languages[0] || "en");

  // Step 2 state
  const [dailyMinutes, setDailyMinutes] = useState(user.preferences.default_daily_minutes || 45);
  const [learningPrefs, setLearningPrefs] = useState<string[]>(
    user.preferences.learning_preferences || ["worked_examples", "active_recall"]
  );

  // Step 3 state
  const [goalTitle, setGoalTitle] = useState("");
  const [goalType, setGoalType] = useState<GoalType>("professional_skill");
  const [level, setLevel] = useState<GoalLevel>("intermediate");
  const [targetDate, setTargetDate] = useState("");

  const togglePref = (pref: string) => {
    if (learningPrefs.includes(pref)) {
      setLearningPrefs(learningPrefs.filter((p) => p !== pref));
    } else {
      setLearningPrefs([...learningPrefs, pref]);
    }
  };

  const handleSkip = () => {
    saveUserProfile({
      ...user,
      onboarding_completed: true,
    });
    onNavigate("/dashboard");
  };

  const handleFinish = () => {
    // Save updated profile
    const updatedProfile: UserProfile = {
      ...user,
      display_name: displayName.trim() || user.display_name,
      onboarding_completed: true,
      preferences: {
        default_daily_minutes: Number(dailyMinutes),
        preferred_languages: [primaryLang],
        learning_preferences: learningPrefs,
      },
    };
    saveUserProfile(updatedProfile);

    // If goal title was entered in step 3, create first goal & roadmap
    if (goalTitle.trim()) {
      const newGoalId = `goal-${Date.now()}`;
      const now = new Date().toISOString();
      const firstGoal: Goal = {
        id: newGoalId,
        title: goalTitle.trim(),
        description: null,
        goal_type: goalType,
        current_level: level,
        status: "active",
        target_date: targetDate || null,
        daily_minutes: Number(dailyMinutes),
        preferred_languages: [primaryLang],
        learning_preferences: learningPrefs,
        created_at: now,
        updated_at: now,
      };
      addGoal(firstGoal);
      const initialRoadmap = generateRoadmapForGoal(firstGoal, 1);
      addRoadmap(initialRoadmap);
      onNavigate(`/goals/${newGoalId}`);
      return;
    }

    onNavigate("/dashboard");
  };

  return (
    <PageContainer className="py-10 max-w-2xl space-y-8">
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs text-muted-foreground font-medium">
          <span>Step {step} of 3</span>
          <button onClick={handleSkip} className="hover:text-foreground transition-colors">
            Skip setup
          </button>
        </div>
        <Progress value={(step / 3) * 100} />
      </div>

      {/* Step 1: About You */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-heading">Welcome to StudyPilot</CardTitle>
            <CardDescription>
              Two quick questions, then your first goal. Everything can be adjusted anytime.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="onb-name">What should we call you?</Label>
              <Input
                id="onb-name"
                placeholder="Your name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="onb-lang">Primary Language</Label>
              <select
                id="onb-lang"
                value={primaryLang}
                onChange={(e) => setPrimaryLang(e.target.value)}
                className="flex h-9 w-full rounded-lg border border-input bg-card px-3 py-1 text-sm shadow-xs focus:ring-2 focus:ring-ring"
              >
                <option value="en">English</option>
                <option value="hi">हिंदी (Hindi)</option>
                <option value="or">ଓଡ଼ିଆ (Odia)</option>
              </select>
            </div>
          </CardContent>
          <CardFooter className="justify-end border-t border-border pt-4">
            <Button onClick={() => setStep(2)} className="gap-2">
              Next: Study Style
              <ArrowRight className="size-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Step 2: Study Style */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-heading">How do you like to study?</CardTitle>
            <CardDescription>
              This sets the starting pace and structure for every curriculum you create.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Clock className="size-4 text-primary" />
                Target Daily Study Commitment
              </Label>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  min={15}
                  max={240}
                  step={5}
                  value={dailyMinutes}
                  onChange={(e) => setDailyMinutes(Number(e.target.value))}
                  className="w-32"
                />
                <span className="text-sm text-muted-foreground">minutes per day</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Preferred Study Modalities</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                {[
                  { id: "worked_examples", label: "Worked step-by-step examples" },
                  { id: "active_recall", label: "Active recall quizzes & checks" },
                  { id: "visual_diagrams", label: "Conceptual diagrams & ASCII" },
                  { id: "concise_notes", label: "Concise summary notes" },
                ].map(({ id, label }) => (
                  <label
                    key={id}
                    className="flex items-center gap-2 p-3 rounded-lg border border-border bg-card/60 hover:bg-secondary cursor-pointer transition-colors"
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
          </CardContent>
          <CardFooter className="justify-between border-t border-border pt-4">
            <Button variant="ghost" onClick={() => setStep(1)} className="gap-1.5">
              <ArrowLeft className="size-4" /> Back
            </Button>
            <Button onClick={() => setStep(3)} className="gap-2">
              Next: First Goal
              <ArrowRight className="size-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Step 3: First Goal */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-heading">What do you want to learn first?</CardTitle>
            <CardDescription>
              Just the essentials. We'll generate your first roadmap immediately.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="first-goal-title">Learning Goal / Topic</Label>
              <Input
                id="first-goal-title"
                placeholder="e.g. Master React 19 & Next.js for senior frontend interviews"
                value={goalTitle}
                onChange={(e) => setGoalTitle(e.target.value)}
                autoFocus
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="first-goal-type">Goal Category</Label>
                <select
                  id="first-goal-type"
                  value={goalType}
                  onChange={(e) => setGoalType(e.target.value as GoalType)}
                  className="flex h-9 w-full rounded-lg border border-input bg-card px-3 py-1 text-sm shadow-xs focus:ring-2 focus:ring-ring"
                >
                  <option value="professional_skill">Professional Skill</option>
                  <option value="certification">Certification</option>
                  <option value="exam">Academic / Exam</option>
                  <option value="career_pivot">Career Pivot</option>
                  <option value="hobby">Hobby</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="first-goal-level">Your Current Level</Label>
                <select
                  id="first-goal-level"
                  value={level}
                  onChange={(e) => setLevel(e.target.value as GoalLevel)}
                  className="flex h-9 w-full rounded-lg border border-input bg-card px-3 py-1 text-sm shadow-xs focus:ring-2 focus:ring-ring"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="first-goal-date">Target Date (Optional)</Label>
              <Input
                id="first-goal-date"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="justify-between border-t border-border pt-4">
            <Button variant="ghost" onClick={() => setStep(2)} className="gap-1.5">
              <ArrowLeft className="size-4" /> Back
            </Button>
            <Button onClick={handleFinish} className="gap-2">
              <Sparkles className="size-4" />
              Complete Setup & Open App
            </Button>
          </CardFooter>
        </Card>
      )}
    </PageContainer>
  );
}
