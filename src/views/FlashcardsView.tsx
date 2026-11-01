import React, { useState } from "react";
import {
  ArrowLeft,
  Layers,
  Plus,
  RotateCw,
  CheckCircle2,
  Trash2,
  Sparkles,
  Check,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { Flashcard } from "@/types";
import {
  getGoalById,
  getFlashcardsForGoal,
  addFlashcard,
  deleteFlashcard,
  updateFlashcardReview,
} from "@/lib/storage";

interface FlashcardsViewProps {
  goalId: string;
  onNavigate: (path: string) => void;
}

export function FlashcardsView({ goalId, onNavigate }: FlashcardsViewProps) {
  const goal = getGoalById(goalId);
  const [cards, setCards] = useState<Flashcard[]>(() =>
    goal ? getFlashcardsForGoal(goal.id) : []
  );

  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // Review mode state
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewQueue, setReviewQueue] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);

  if (!goal) {
    return (
      <PageContainer className="py-8 text-center">
        <h2 className="font-heading text-xl font-bold mb-4">Goal not found</h2>
        <Button onClick={() => onNavigate("/dashboard")}>Back to Goals</Button>
      </PageContainer>
    );
  }

  const dueCards = cards.filter((c) => new Date(c.due_at) <= new Date());
  const learningCards = cards.filter((c) => c.stage === "learning");
  const masteredCards = cards.filter((c) => c.stage === "mastered");

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!front.trim() || !back.trim()) return;

    const newCard: Flashcard = {
      id: `fc-${Date.now()}`,
      goal_id: goal.id,
      front: front.trim(),
      back: back.trim(),
      stage: "learning",
      repetition_count: 0,
      interval_days: 1,
      due_at: new Date().toISOString(),
      last_reviewed_at: null,
    };

    addFlashcard(newCard);
    setCards(getFlashcardsForGoal(goal.id));
    setFront("");
    setBack("");
    setIsAdding(false);
  };

  const handleDeleteCard = (cardId: string) => {
    deleteFlashcard(cardId);
    setCards(getFlashcardsForGoal(goal.id));
  };

  const startReview = () => {
    const queue = dueCards.length > 0 ? dueCards : cards;
    setReviewQueue(queue);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setReviewedCount(0);
    setIsReviewing(true);
  };

  const handleRating = (rating: "again" | "hard" | "good" | "easy") => {
    const card = reviewQueue[currentCardIndex];
    if (!card) return;

    updateFlashcardReview(card.id, rating);
    setReviewedCount((prev) => prev + 1);

    if (currentCardIndex + 1 < reviewQueue.length) {
      setCurrentCardIndex((prev) => prev + 1);
      setIsFlipped(false);
    } else {
      // Completed review
      setIsReviewing(false);
      setCards(getFlashcardsForGoal(goal.id));
    }
  };

  return (
    <PageContainer className="py-8 max-w-3xl space-y-8">
      <div>
        <button
          onClick={() => onNavigate(`/goals/${goal.id}`)}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="size-4" />
          Back to {goal.title}
        </button>

        <PageHeader
          title="Flashcards & Spaced Repetition"
          description="Cards reappear on an expanding schedule right before your brain forgets them (SuperMemo SM-2 model)."
          actions={
            cards.length > 0 && !isReviewing && (
              <Button size="lg" onClick={startReview} className="gap-2">
                <RotateCw className="size-4" />
                {dueCards.length > 0 ? `Review ${dueCards.length} Due` : "Practice All Cards"}
              </Button>
            )
          }
        />
      </div>

      {/* Review Mode Interactive Screen */}
      {isReviewing ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Card {currentCardIndex + 1} of {reviewQueue.length}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsReviewing(false);
                setCards(getFlashcardsForGoal(goal.id));
              }}
            >
              Exit Review
            </Button>
          </div>

          {/* Flashcard Component */}
          {reviewQueue[currentCardIndex] && (
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="min-h-[260px] p-8 rounded-2xl border-2 border-border bg-card shadow-md flex flex-col justify-between cursor-pointer hover:border-primary/50 transition-all select-none"
            >
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span className="font-semibold uppercase tracking-wider">
                  {isFlipped ? "Answer (Back)" : "Question (Front)"}
                </span>
                <span className="text-[11px] bg-secondary px-2 py-0.5 rounded">Click to flip</span>
              </div>

              <div className="my-auto py-6 text-center">
                <p className="font-heading text-xl sm:text-2xl font-medium text-foreground leading-relaxed">
                  {isFlipped
                    ? reviewQueue[currentCardIndex].back
                    : reviewQueue[currentCardIndex].front}
                </p>
              </div>

              <div className="text-center text-xs text-muted-foreground">
                {!isFlipped && "Tap or click anywhere to reveal answer"}
              </div>
            </div>
          )}

          {/* Spaced repetition rating controls */}
          {isFlipped && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 animate-in fade-in-0 duration-200">
              <Button
                variant="outline"
                className="flex flex-col h-auto py-2.5 hover:border-destructive/60 hover:bg-destructive-soft text-destructive-foreground"
                onClick={() => handleRating("again")}
              >
                <span className="font-bold text-sm">Again</span>
                <span className="text-[11px] opacity-80">&lt; 10 min</span>
              </Button>

              <Button
                variant="outline"
                className="flex flex-col h-auto py-2.5 hover:border-warning/60 hover:bg-warning-soft text-warning-foreground"
                onClick={() => handleRating("hard")}
              >
                <span className="font-bold text-sm">Hard</span>
                <span className="text-[11px] opacity-80">1 day</span>
              </Button>

              <Button
                variant="outline"
                className="flex flex-col h-auto py-2.5 hover:border-primary/60 hover:bg-primary/10 text-primary font-semibold"
                onClick={() => handleRating("good")}
              >
                <span className="font-bold text-sm">Good</span>
                <span className="text-[11px] opacity-80">3 days</span>
              </Button>

              <Button
                variant="outline"
                className="flex flex-col h-auto py-2.5 hover:border-success/60 hover:bg-success-soft text-success-foreground"
                onClick={() => handleRating("easy")}
              >
                <span className="font-bold text-sm">Easy</span>
                <span className="text-[11px] opacity-80">7 days</span>
              </Button>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Deck Stats Cards */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="p-4 text-center">
              <p className="text-xs text-muted-foreground font-medium">Due Now</p>
              <p className="text-2xl font-bold text-primary mt-1">{dueCards.length}</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-xs text-muted-foreground font-medium">In Learning</p>
              <p className="text-2xl font-bold text-warning mt-1">{learningCards.length}</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-xs text-muted-foreground font-medium">Mastered</p>
              <p className="text-2xl font-bold text-success mt-1">{masteredCards.length}</p>
            </Card>
          </div>

          {/* Add New Card Section */}
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Add New Flashcard</CardTitle>
                <CardDescription>Single-fact, concise cards yield highest retention.</CardDescription>
              </div>
              {!isAdding && (
                <Button size="sm" variant="outline" onClick={() => setIsAdding(true)}>
                  <Plus className="size-4 mr-1" />
                  Add Card
                </Button>
              )}
            </CardHeader>

            {isAdding && (
              <CardContent>
                <form onSubmit={handleAddCard} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="fc-front">Front (Question or Prompt)</Label>
                    <Input
                      id="fc-front"
                      placeholder="e.g. What does exit code 137 mean in Kubernetes?"
                      value={front}
                      onChange={(e) => setFront(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="fc-back">Back (Answer)</Label>
                    <Textarea
                      id="fc-back"
                      placeholder="e.g. OOMKilled - Process was terminated by SIGKILL due to memory limit exhaustion."
                      rows={2}
                      value={back}
                      onChange={(e) => setBack(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsAdding(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" size="sm">
                      Save Flashcard
                    </Button>
                  </div>
                </form>
              </CardContent>
            )}
          </Card>

          {/* Cards List */}
          <div className="space-y-3">
            <h3 className="font-heading text-lg font-semibold text-foreground">
              Deck Cards ({cards.length})
            </h3>

            {cards.length === 0 ? (
              <Card className="p-8 text-center text-sm text-muted-foreground">
                No cards in this deck yet. Add your first card above.
              </Card>
            ) : (
              <div className="grid gap-2.5">
                {cards.map((card) => {
                  const isDue = new Date(card.due_at) <= new Date();

                  return (
                    <Card
                      key={card.id}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm"
                    >
                      <div className="space-y-1 max-w-xl">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              card.stage === "mastered"
                                ? "success"
                                : card.stage === "review"
                                  ? "info"
                                  : "warning"
                            }
                            className="capitalize text-[10px]"
                          >
                            {card.stage}
                          </Badge>
                          {isDue && (
                            <Badge variant="destructive" className="text-[10px]">
                              Due Now
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            Repetitions: {card.repetition_count}
                          </span>
                        </div>
                        <p className="font-semibold text-foreground">{card.front}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">{card.back}</p>
                      </div>

                      <div className="shrink-0 self-end sm:self-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCard(card.id)}
                          className="size-8 p-0 text-muted-foreground hover:text-destructive"
                          title="Delete card"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </PageContainer>
  );
}
