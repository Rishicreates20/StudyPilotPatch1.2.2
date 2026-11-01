import React, { useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ClipboardCheck,
  Check,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { Goal, Quiz, QuizAttempt, RoadmapTopic } from "@/types";
import {
  getGoalById,
  getCurrentRoadmapForGoal,
  getQuizByTopicId,
  addQuiz,
  saveQuizAttempt,
} from "@/lib/storage";
import { generateQuizForTopic } from "@/lib/ai-generator";

interface QuizViewProps {
  goalId: string;
  topicId: string;
  onNavigate: (path: string) => void;
}

export function QuizView({ goalId, topicId, onNavigate }: QuizViewProps) {
  const goal = getGoalById(goalId);
  const roadmap = goal ? getCurrentRoadmapForGoal(goal.id) : undefined;

  let topic: RoadmapTopic | undefined;
  if (roadmap) {
    for (const m of roadmap.modules) {
      const found = m.topics.find((t) => t.id === topicId);
      if (found) {
        topic = found;
        break;
      }
    }
  }

  const [quiz, setQuiz] = useState<Quiz>(() => {
    let existing = getQuizByTopicId(topicId);
    if (!existing && topic && goal) {
      existing = generateQuizForTopic(topic.id, topic.title, goal.id, "check");
      addQuiz(existing);
    }
    return existing!;
  });

  // User's selections: { [questionId]: optionIndex }
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [attempt, setAttempt] = useState<QuizAttempt | null>(quiz?.attempt || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!goal || !topic || !quiz) {
    return (
      <PageContainer className="py-8 text-center">
        <h2 className="font-heading text-xl font-bold mb-4">Quiz not found</h2>
        <Button onClick={() => onNavigate(`/goals/${goalId}`)}>Back to Goal</Button>
      </PageContainer>
    );
  }

  const handleSelect = (qId: string, optIdx: number) => {
    if (attempt) return; // Read-only once submitted
    setSelectedAnswers((prev) => ({ ...prev, [qId]: optIdx }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate that all questions are answered
    const unanswered = quiz.questions.filter((q) => selectedAnswers[q.id] === undefined);
    if (unanswered.length > 0) {
      setError(`Please answer all questions before submitting (${unanswered.length} remaining).`);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    setTimeout(() => {
      let correctCount = 0;
      const weakConcepts: string[] = [];

      const answers = quiz.questions.map((q) => {
        const selected = selectedAnswers[q.id];
        const isCorrect = selected === q.correct_option_index;
        if (isCorrect) {
          correctCount += 1;
        } else {
          if (!weakConcepts.includes(q.concept)) weakConcepts.push(q.concept);
        }
        return {
          question_id: q.id,
          selected_option_index: selected,
          is_correct: isCorrect,
        };
      });

      const percentage = Math.round((correctCount / quiz.questions.length) * 100);
      const nextStep =
        percentage >= 80
          ? "Excellent mastery! You are ready to proceed to the next topic on your roadmap."
          : percentage >= 60
            ? `Solid progress. We recommend reviewing the ${weakConcepts[0] || "core concepts"} before continuing.`
            : `Needs attention on ${weakConcepts.join(", ")}. Review the lesson worked example and common pitfalls.`;

      const newAttempt: QuizAttempt = {
        id: `att-${Date.now()}`,
        quiz_id: quiz.id,
        topic_id: topic.id,
        goal_id: goal.id,
        score: correctCount,
        total_questions: quiz.questions.length,
        percentage,
        answers,
        weak_concepts: weakConcepts,
        next_step_recommendation: nextStep,
        submitted_at: new Date().toISOString(),
      };

      saveQuizAttempt(newAttempt);
      setAttempt(newAttempt);
      setIsSubmitting(false);
    }, 500);
  };

  const handleRetake = () => {
    setAttempt(null);
    setSelectedAnswers({});
  };

  const handlePracticeQuiz = () => {
    const newQuiz = generateQuizForTopic(topic.id, topic.title, goal.id, "practice");
    addQuiz(newQuiz);
    setQuiz(newQuiz);
    setAttempt(null);
    setSelectedAnswers({});
  };

  return (
    <PageContainer className="py-8 max-w-3xl space-y-8">
      <div>
        <button
          onClick={() => onNavigate(`/goals/${goal.id}/learn/${topic.id}`)}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="size-4" />
          Back to lesson
        </button>

        <PageHeader
          eyebrow={
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <Badge variant="secondary">{topic.title}</Badge>
              <Badge variant={quiz.purpose === "practice" ? "info" : "default"}>
                {quiz.purpose === "practice" ? "Practice Quiz" : "Mastery Assessment"}
              </Badge>
            </div>
          }
          title={quiz.title}
          description="Answer each question based on what you studied. Results and explanations appear immediately after submission."
        />
      </div>

      {/* Results Header Card if Attempt exists */}
      {attempt && (
        <Card className={`border ${attempt.percentage >= 80 ? "border-success/40 bg-success-soft/30" : "border-warning/40 bg-warning-soft/30"}`}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {attempt.percentage >= 80 ? (
                  <CheckCircle2 className="size-8 text-success" />
                ) : (
                  <AlertCircle className="size-8 text-warning" />
                )}
                <div>
                  <CardTitle className="text-xl">
                    Score: {attempt.percentage}% ({attempt.score}/{attempt.total_questions})
                  </CardTitle>
                  <CardDescription>
                    {attempt.percentage >= 80 ? "Mastery Achieved" : "Review Recommended"}
                  </CardDescription>
                </div>
              </div>
              <Badge variant={attempt.percentage >= 80 ? "success" : "warning"} className="text-sm px-3 py-1">
                {attempt.percentage >= 80 ? "Passed" : "Needs Practice"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3.5 rounded-lg bg-card/80 border border-border text-sm">
              <span className="font-semibold text-foreground">Recommendation: </span>
              <span className="text-muted-foreground">{attempt.next_step_recommendation}</span>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button variant="outline" size="sm" onClick={handleRetake} className="gap-1.5">
                <RotateCcw className="size-3.5" />
                Retake Quiz
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handlePracticeQuiz}
                className="gap-1.5 text-primary"
              >
                <Sparkles className="size-3.5" />
                Generate New Questions
              </Button>

              <Button
                size="sm"
                onClick={() => onNavigate(`/goals/${goal.id}/roadmap`)}
                className="gap-1.5"
              >
                Next on Roadmap
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quiz Questions Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {quiz.questions.map((q, qIndex) => {
          const userAns = attempt
            ? attempt.answers.find((a) => a.question_id === q.id)?.selected_option_index
            : selectedAnswers[q.id];
          const isCorrect = attempt && userAns === q.correct_option_index;
          const isWrong = attempt && userAns !== undefined && userAns !== q.correct_option_index;

          return (
            <Card
              key={q.id}
              className={`transition-colors ${
                attempt
                  ? isCorrect
                    ? "border-success/40 bg-card"
                    : "border-destructive/40 bg-card"
                  : "hover:border-primary/30"
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Question {qIndex + 1} of {quiz.questions.length}
                  </span>
                  <Badge variant="outline" className="text-[11px]">
                    {q.concept}
                  </Badge>
                </div>
                <CardTitle className="text-base font-medium text-foreground leading-relaxed">
                  {q.question}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-2.5">
                {q.options.map((option, optIdx) => {
                  const isSelected = userAns === optIdx;
                  const isTheCorrectOne = attempt && optIdx === q.correct_option_index;

                  let optionStyles = "border-border bg-card/70 hover:bg-muted/50 text-foreground";
                  if (attempt) {
                    if (isTheCorrectOne) {
                      optionStyles = "border-success bg-success-soft text-success-foreground font-medium";
                    } else if (isSelected && !isTheCorrectOne) {
                      optionStyles = "border-destructive bg-destructive-soft text-destructive-foreground";
                    } else {
                      optionStyles = "border-border/60 opacity-60";
                    }
                  } else if (isSelected) {
                    optionStyles = "border-primary bg-primary/10 text-primary font-medium ring-1 ring-primary";
                  }

                  return (
                    <label
                      key={optIdx}
                      onClick={() => handleSelect(q.id, optIdx)}
                      className={`flex items-start gap-3 p-3.5 rounded-lg border text-sm transition-all cursor-pointer ${optionStyles}`}
                    >
                      <div className="flex size-5 shrink-0 items-center justify-center rounded-full border border-current mt-0.5">
                        {isSelected && <div className="size-2.5 rounded-full bg-current" />}
                      </div>
                      <span className="leading-snug">{option}</span>
                    </label>
                  );
                })}

                {/* Explanation review */}
                {attempt && (
                  <div className="mt-3 p-3.5 rounded-lg bg-muted/60 border border-border text-xs leading-relaxed space-y-1">
                    <p className="font-semibold text-foreground flex items-center gap-1.5">
                      <HelpCircle className="size-3.5 text-primary" />
                      Explanation:
                    </p>
                    <p className="text-muted-foreground">{q.explanation}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {!attempt && (
          <div className="flex justify-end pt-4">
            <Button type="submit" size="lg" loading={isSubmitting} className="gap-2">
              <ClipboardCheck className="size-5" />
              Submit Answers & Grade
            </Button>
          </div>
        )}
      </form>
    </PageContainer>
  );
}
