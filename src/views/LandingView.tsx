import React from "react";
import {
  ArrowRight,
  BookOpen,
  ClipboardCheck,
  Compass,
  Route,
  Sparkles,
  Zap,
  CheckCircle2,
  Layers,
  FileText,
  Clock,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageContainer } from "@/components/layout/page";

const learningLoop = [
  {
    icon: Compass,
    title: "1. Plan",
    body: "State your target topic, exam date, and daily study time. StudyPilot synthesizes an ordered, paced curriculum you can actually finish.",
  },
  {
    icon: BookOpen,
    title: "2. Learn",
    body: "Every topic is taught with structured sections, worked examples, key terminology, syntax-highlighted code, and 'In Simple Terms' analogies.",
  },
  {
    icon: ClipboardCheck,
    title: "3. Test",
    body: "Knowledge checks prove what you understood. Questions are graded with detailed explanations for why answers are right or wrong.",
  },
  {
    icon: Route,
    title: "4. Adapt",
    body: "Weak concepts trigger practice sessions, and spaced repetition flashcards bring facts back right before you forget them.",
  },
];

export function LandingView({ onNavigate }: { onNavigate: (path: string) => void }) {
  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="border-b border-border bg-gradient-to-b from-secondary/50 via-background to-background py-16 sm:py-24">
        <PageContainer>
          <div className="max-w-3xl space-y-6">
            <div className="flex items-center gap-2">
              <Badge variant="info" className="gap-1.5 px-3 py-1 text-xs">
                <Sparkles className="size-3.5" />
                Your Personal AI Learning Companion
              </Badge>
            </div>

            <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl text-balance">
              Transform goals into structured, measurable learning journeys.
            </h1>

            <p className="max-w-2xl text-lg text-muted-foreground leading-relaxed">
              StudyPilot takes any exam, skill, or uploaded study notes, generates a personalized
              day-by-day roadmap, teaches each topic, tests understanding, and tells you what to study today.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Button size="lg" onClick={() => onNavigate("/dashboard")} className="gap-2">
                Open Your Dashboard
                <ArrowRight className="size-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => onNavigate("/onboarding")}>
                Start Onboarding
              </Button>
              <Button size="lg" variant="ghost" onClick={() => onNavigate("/sign-in")}>
                Sign In
              </Button>
            </div>

            <div className="flex items-center gap-6 pt-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-success" /> Free & Open Architecture
              </span>
              <span className="flex items-center gap-1.5">
                <Shield className="size-3.5 text-primary" /> Private Local Data
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="size-3.5 text-warning" /> Real-Time Reading Timer
              </span>
            </div>
          </div>
        </PageContainer>
      </section>

      {/* The 4-Step Loop */}
      <section className="py-6">
        <PageContainer>
          <div className="max-w-2xl space-y-2 mb-10">
            <h2 className="font-heading text-2xl font-bold sm:text-3xl text-foreground">
              One unified learning loop
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              No generic chatbot conversations or disconnected mockups. Everything connects into a purposeful study path.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {learningLoop.map(({ icon: Icon, title, body }) => (
              <Card key={title} className="h-full flex flex-col justify-between hover:border-primary/40 transition-colors">
                <CardHeader className="space-y-3 pb-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <CardTitle className="text-lg">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed text-foreground/80">
                    {body}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </PageContainer>
      </section>

      {/* Multilingual Support Spotlight */}
      <section className="py-6">
        <PageContainer>
          <div className="rounded-2xl border border-border bg-card p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-3 max-w-xl">
              <Badge variant="outline" className="text-xs">Multilingual Ready</Badge>
              <h3 className="font-heading text-2xl font-bold text-foreground">
                Study in English, Hindi (हिंदी), and Odia (ଓଡ଼ିଆ)
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                StudyPilot includes native typography support and curated educational resources for regional Indian languages alongside English.
              </p>
            </div>
            <div className="flex flex-col gap-2 shrink-0">
              <Button onClick={() => onNavigate("/goals/new")}>
                Create Your First Goal
              </Button>
              <Button variant="outline" onClick={() => onNavigate("/design")}>
                Inspect Design System
              </Button>
            </div>
          </div>
        </PageContainer>
      </section>
    </div>
  );
}
