import React, { useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Info,
  Layers,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { PageContainer, PageHeader } from "@/components/layout/page";

const swatches = [
  { name: "background", color: "bg-background", border: true },
  { name: "card", color: "bg-card", border: true },
  { name: "muted", color: "bg-muted", border: true },
  { name: "secondary", color: "bg-secondary", border: true },
  { name: "accent", color: "bg-accent", border: true },
  { name: "primary", color: "bg-primary text-primary-foreground", border: false },
  { name: "border", color: "bg-border", border: false },
  { name: "input", color: "bg-input", border: false },
  { name: "ring", color: "bg-ring text-white", border: false },
  { name: "success", color: "bg-success text-white", border: false },
  { name: "warning", color: "bg-warning text-white", border: false },
  { name: "info", color: "bg-info text-white", border: false },
  { name: "destructive", color: "bg-destructive text-white", border: false },
];

export function DesignView() {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <PageContainer className="py-8 max-w-4xl space-y-12">
      <PageHeader
        eyebrow={<Badge variant="warning">Preview · Design Tokens</Badge>}
        title="Design System"
        description="Tokens and reusable components used across StudyPilot. Switch themes from the header to inspect both light and dark modes."
      />

      {/* Colors */}
      <section className="space-y-4">
        <h3 className="font-heading text-xl font-semibold">Colour Tokens</h3>
        <p className="text-sm text-muted-foreground">
          Calm neutral paper surfaces with a restrained indigo accent and WCAG-checked contrast ratios.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {swatches.map((s) => (
            <div key={s.name} className="space-y-1.5">
              <div
                className={`h-14 rounded-lg flex items-center justify-center text-xs font-semibold ${s.color} ${
                  s.border ? "border border-border" : ""
                }`}
              >
                {s.name}
              </div>
              <p className="text-[11px] font-mono text-muted-foreground text-center">{s.name}</p>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      {/* Typography */}
      <section className="space-y-4">
        <h3 className="font-heading text-xl font-semibold">Typography</h3>
        <p className="text-sm text-muted-foreground">
          Inter for user interfaces, Source Serif 4 for headings, and JetBrains Mono for code.
        </p>

        <Card className="p-6 space-y-4">
          <div>
            <span className="text-xs text-muted-foreground font-mono">font-heading text-3xl</span>
            <h1 className="font-heading text-3xl font-bold tracking-tight">
              Understand it, then prove it.
            </h1>
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-mono">font-heading text-xl</span>
            <h2 className="font-heading text-xl font-semibold">
              Module 1: Foundations & Architecture
            </h2>
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-mono">text-sm text-foreground</span>
            <p className="text-sm leading-relaxed text-foreground">
              Body copy is set with comfortable line height for sustained reading and technical lessons.
              Links are styled cleanly like <span className="text-primary underline cursor-pointer">this link</span>.
            </p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-mono">font-mono text-xs</span>
            <p className="font-mono text-xs p-2.5 rounded bg-muted">
              kubectl get pods -n kube-system -l k8s-app=kube-dns
            </p>
          </div>
        </Card>
      </section>

      <Separator />

      {/* Buttons */}
      <section className="space-y-4">
        <h3 className="font-heading text-xl font-semibold">Buttons</h3>
        <div className="flex flex-wrap gap-2.5 items-center">
          <Button variant="default">Primary Action</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link Button</Button>
        </div>
        <div className="flex flex-wrap gap-2.5 items-center pt-2">
          <Button size="sm">Small (sm)</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large (lg)</Button>
          <Button loading>Loading State</Button>
          <Button disabled>Disabled</Button>
        </div>
      </section>

      <Separator />

      {/* Badges & Alerts */}
      <section className="space-y-4">
        <h3 className="font-heading text-xl font-semibold">Badges & Status Alerts</h3>
        <div className="flex flex-wrap gap-2">
          <Badge variant="default">Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="info">Info</Badge>
          <Badge variant="destructive">Destructive</Badge>
        </div>

        <div className="space-y-3 pt-2">
          <Alert variant="info">
            <Info className="size-4" />
            <AlertTitle>Curriculum Information</AlertTitle>
            <AlertDescription>
              Roadmaps are paced according to your daily minutes setting.
            </AlertDescription>
          </Alert>

          <Alert variant="success">
            <CheckCircle2 className="size-4" />
            <AlertTitle>Goal Completed</AlertTitle>
            <AlertDescription>
              You have passed all mastery checks for this curriculum.
            </AlertDescription>
          </Alert>

          <Alert variant="warning">
            <AlertTriangle className="size-4" />
            <AlertTitle>Sample Content</AlertTitle>
            <AlertDescription>
              This is preview data for UI component verification.
            </AlertDescription>
          </Alert>
        </div>
      </section>

      <Separator />

      {/* Interactive Modal Demo */}
      <section className="space-y-4">
        <h3 className="font-heading text-xl font-semibold">Dialogs & Overlays</h3>
        <Button onClick={() => setDialogOpen(true)}>Open Sample Modal</Button>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogHeader>
            <DialogTitle>Interactive Dialog Component</DialogTitle>
            <DialogDescription>
              Accessible, keyboard-navigable dialog with backdrop blur and escape key handling.
            </DialogDescription>
          </DialogHeader>
          <div className="py-3 text-sm text-foreground">
            Dialogs in StudyPilot are used for confirming irreversible deletions and revising AI roadmaps.
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setDialogOpen(false)}>Got It</Button>
          </DialogFooter>
        </Dialog>
      </section>
    </PageContainer>
  );
}
