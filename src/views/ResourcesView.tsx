import React, { useState } from "react";
import {
  Video,
  ExternalLink,
  Search,
  Filter,
  Plus,
  Sparkles,
  Check,
  Globe,
  Clock,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { LearningResource } from "@/types";
import { getGoals, getResourcesForGoal, addResource } from "@/lib/storage";

interface ResourcesViewProps {
  initialGoalId?: string;
  onNavigate: (path: string) => void;
}

export function ResourcesView({ initialGoalId, onNavigate }: ResourcesViewProps) {
  const goals = getGoals();
  const [selectedGoalId, setSelectedGoalId] = useState<string>(
    initialGoalId || goals[0]?.id || "goal-k8s-101"
  );
  const [selectedLang, setSelectedLang] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [resources, setResources] = useState<LearningResource[]>(() =>
    getResourcesForGoal(initialGoalId || goals[0]?.id || "goal-k8s-101")
  );

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newChannel, setNewChannel] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newLang, setNewLang] = useState<"en" | "hi" | "or">("en");
  const [newDuration, setNewDuration] = useState("15:00");

  const handleGoalChange = (gId: string) => {
    setSelectedGoalId(gId);
    setResources(getResourcesForGoal(gId));
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim()) return;

    const newRes: LearningResource = {
      id: `res-${Date.now()}`,
      goal_id: selectedGoalId,
      title: newTitle.trim(),
      channel: newChannel.trim() || "Educational Channel",
      youtube_id: "custom",
      url: newUrl.trim(),
      thumbnail_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=60",
      duration: newDuration.trim() || "15:00",
      language: newLang,
      relevance_score: 95,
      description: "User-curated educational video resource.",
    };

    addResource(newRes);
    setResources(getResourcesForGoal(selectedGoalId));
    setAddModalOpen(false);
    setNewTitle("");
    setNewChannel("");
    setNewUrl("");
  };

  // Filter resources
  const filtered = resources.filter((res) => {
    const matchesLang = selectedLang === "all" || res.language === selectedLang;
    const matchesQuery =
      searchQuery.trim() === "" ||
      res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.channel.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLang && matchesQuery;
  });

  return (
    <PageContainer className="py-8 max-w-4xl space-y-8">
      <PageHeader
        title="Educational Resources & Lectures"
        description="Curated educational videos and walkthroughs aligned with your roadmap topics. Multi-language support for English, Hindi (हिंदी), and Odia (ଓଡ଼ିଆ)."
        actions={
          <Button size="sm" onClick={() => setAddModalOpen(true)} className="gap-1.5">
            <Plus className="size-4" />
            Add Resource
          </Button>
        }
      />

      {/* Goal & Language Filter Bar */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground shrink-0">Goal:</span>
            <select
              value={selectedGoalId}
              onChange={(e) => handleGoalChange(e.target.value)}
              className="flex h-9 rounded-lg border border-input bg-card px-3 py-1 text-sm shadow-xs focus:ring-2 focus:ring-ring"
            >
              {goals.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.title}
                </option>
              ))}
            </select>
          </div>

          {/* Language Tabs */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-muted-foreground mr-1">Language:</span>
            {[
              { id: "all", label: "All" },
              { id: "en", label: "English" },
              { id: "hi", label: "हिंदी (Hindi)" },
              { id: "or", label: "ଓଡ଼ିଆ (Odia)" },
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setSelectedLang(id)}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  selectedLang === id
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Search input */}
        <div className="relative pt-1">
          <Search className="absolute left-3 top-3.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search lectures by title or channel..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </Card>

      {/* Resource Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {filtered.length === 0 ? (
          <div className="col-span-2 p-12 text-center border border-dashed rounded-xl space-y-3">
            <Video className="size-10 mx-auto text-muted-foreground/60" />
            <p className="text-sm text-muted-foreground">
              No matching resources found for this filter.
            </p>
          </div>
        ) : (
          filtered.map((res) => (
            <Card key={res.id} className="overflow-hidden hover:border-primary/40 transition-colors flex flex-col justify-between">
              <div>
                <div className="relative aspect-video bg-muted overflow-hidden">
                  <img
                    src={res.thumbnail_url}
                    alt={res.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 text-white font-mono text-[11px] font-semibold flex items-center gap-1">
                    <Clock className="size-3" />
                    {res.duration}
                  </div>
                  <div className="absolute top-2 left-2">
                    <Badge variant={res.language === "hi" ? "warning" : res.language === "or" ? "info" : "secondary"} className="text-[10px]">
                      {res.language === "hi" ? "हिंदी" : res.language === "or" ? "ଓଡ଼ିଆ" : "English"}
                    </Badge>
                  </div>
                </div>

                <CardContent className="pt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">{res.channel}</span>
                    <Badge variant="success" className="text-[10px]">
                      {res.relevance_score}% Match
                    </Badge>
                  </div>

                  <h4 className="font-heading font-semibold text-base text-foreground leading-snug line-clamp-2">
                    {res.title}
                  </h4>

                  {res.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {res.description}
                    </p>
                  )}
                </CardContent>
              </div>

              <div className="p-4 pt-0">
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full gap-1.5"
                  onClick={() => window.open(res.url, "_blank", "noopener,noreferrer")}
                >
                  <Play className="size-3.5 fill-current" />
                  Watch Lecture on YouTube
                  <ExternalLink className="size-3 ml-auto opacity-70" />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Add Resource Dialog */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogHeader>
          <DialogTitle>Add Educational Resource</DialogTitle>
          <DialogDescription>
            Attach a high-yield YouTube lecture, conference talk, or tutorial to this goal.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleAddSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="res-title">Lecture Title</Label>
            <Input
              id="res-title"
              placeholder="e.g. Kubernetes Networking Tutorial for Beginners"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="res-chan">Channel Name</Label>
              <Input
                id="res-chan"
                placeholder="e.g. CNCF"
                value={newChannel}
                onChange={(e) => setNewChannel(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="res-dur">Duration</Label>
              <Input
                id="res-dur"
                placeholder="e.g. 24:15"
                value={newDuration}
                onChange={(e) => setNewDuration(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="res-url">YouTube Video URL</Label>
            <Input
              id="res-url"
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="res-lang">Language</Label>
            <select
              id="res-lang"
              value={newLang}
              onChange={(e) => setNewLang(e.target.value as "en" | "hi" | "or")}
              className="flex h-9 w-full rounded-lg border border-input bg-card px-3 py-1 text-sm shadow-xs focus:ring-2 focus:ring-ring"
            >
              <option value="en">English</option>
              <option value="hi">हिंदी (Hindi)</option>
              <option value="or">ଓଡ଼ିଆ (Odia)</option>
            </select>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Resource</Button>
          </DialogFooter>
        </form>
      </Dialog>
    </PageContainer>
  );
}
