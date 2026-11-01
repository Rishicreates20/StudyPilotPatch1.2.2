import React, { useState } from "react";
import {
  ArrowLeft,
  FileText,
  Upload,
  ClipboardPaste,
  Search,
  Trash2,
  Edit2,
  Check,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { DocumentItem } from "@/types";
import {
  getGoalById,
  getDocumentsForGoal,
  addDocument,
  deleteDocument,
  renameDocument,
} from "@/lib/storage";

interface DocumentsViewProps {
  goalId: string;
  onNavigate: (path: string) => void;
}

export function DocumentsView({ goalId, onNavigate }: DocumentsViewProps) {
  const goal = getGoalById(goalId);
  const [documents, setDocuments] = useState<DocumentItem[]>(() =>
    goal ? getDocumentsForGoal(goal.id) : []
  );

  const [activeTab, setActiveTab] = useState<"upload" | "paste">("upload");
  const [pasteTitle, setPasteTitle] = useState("");
  const [pasteContent, setPasteContent] = useState("");
  const [fileName, setFileName] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [renameDocId, setRenameDocId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");

  if (!goal) {
    return (
      <PageContainer className="py-8 text-center">
        <h2 className="font-heading text-xl font-bold mb-4">Goal not found</h2>
        <Button onClick={() => onNavigate("/dashboard")}>Back to Goals</Button>
      </PageContainer>
    );
  }

  const handleUploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const newDoc: DocumentItem = {
      id: `doc-${Date.now()}`,
      goal_id: goal.id,
      title: file.name.replace(/\.[^/.]+$/, ""),
      original_name: file.name,
      kind: file.name.endsWith(".pdf") ? "pdf" : "notes",
      size_bytes: file.size,
      chunk_count: Math.max(4, Math.round(file.size / 150000)),
      status: "ready",
      created_at: new Date().toISOString(),
      passages: [
        {
          id: `pas-${Date.now()}-1`,
          page_number: 1,
          content: `Extracted introduction and core architectural principles from ${file.name}. Validated against curriculum syllabus.`,
        },
        {
          id: `pas-${Date.now()}-2`,
          page_number: 2,
          content: `Key configuration standards and operational guardrails for production environments.`,
        },
      ],
    };

    addDocument(newDoc);
    setDocuments(getDocumentsForGoal(goal.id));
    setFileName("");
  };

  const handlePasteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pasteTitle.trim() || !pasteContent.trim()) return;

    const newDoc: DocumentItem = {
      id: `doc-${Date.now()}`,
      goal_id: goal.id,
      title: pasteTitle.trim(),
      kind: "paste",
      size_bytes: new Blob([pasteContent]).size,
      chunk_count: Math.max(1, Math.round(pasteContent.length / 500)),
      status: "ready",
      created_at: new Date().toISOString(),
      passages: [
        {
          id: `pas-${Date.now()}-1`,
          page_number: 1,
          content: pasteContent.trim(),
        },
      ],
    };

    addDocument(newDoc);
    setDocuments(getDocumentsForGoal(goal.id));
    setPasteTitle("");
    setPasteContent("");
  };

  const handleDelete = (docId: string) => {
    deleteDocument(docId);
    setDocuments(getDocumentsForGoal(goal.id));
  };

  const handleSaveRename = () => {
    if (renameDocId && newTitle.trim()) {
      renameDocument(renameDocId, newTitle.trim());
      setDocuments(getDocumentsForGoal(goal.id));
      setRenameDocId(null);
    }
  };

  // Passage search results
  const matchingPassages = searchQuery.trim()
    ? documents.flatMap((doc) =>
        doc.passages
          .filter((p) => p.content.toLowerCase().includes(searchQuery.toLowerCase()))
          .map((p) => ({ ...p, docTitle: doc.title }))
      )
    : [];

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
          title="Study Material"
          description="Upload textbook excerpts, PDF slides, or pasted notes. StudyPilot extracts and indexes passages privately, then grounds your lessons and citations in your own material."
        />
      </div>

      {/* Add Document Section */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <button
              onClick={() => setActiveTab("upload")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === "upload"
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <Upload className="size-4" />
              Upload PDF or File
            </button>
            <button
              onClick={() => setActiveTab("paste")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === "paste"
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <ClipboardPaste className="size-4" />
              Paste Text / Notes
            </button>
          </div>
        </CardHeader>

        <CardContent className="pt-2">
          {activeTab === "upload" ? (
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center space-y-3 hover:border-primary/50 transition-colors">
              <FileText className="size-10 mx-auto text-primary/70" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  Select a PDF, Markdown, or text file
                </p>
                <p className="text-xs text-muted-foreground">Up to 25MB · Text is indexed locally</p>
              </div>
              <input
                type="file"
                id="doc-file-input"
                className="hidden"
                accept=".pdf,.txt,.md,.json"
                onChange={handleUploadFile}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById("doc-file-input")?.click()}
                className="cursor-pointer"
              >
                Browse Local Files
              </Button>
            </div>
          ) : (
            <form onSubmit={handlePasteSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Input
                  placeholder="Document Title (e.g. Chapter 4 Key Formulas)"
                  value={pasteTitle}
                  onChange={(e) => setPasteTitle(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Textarea
                  placeholder="Paste your study notes, cheatsheet text, or syllabus outline here..."
                  rows={4}
                  value={pasteContent}
                  onChange={(e) => setPasteContent(e.target.value)}
                  required
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" size="sm">
                  Index Pasted Notes
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Search Materials */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
          <Input
            placeholder="Search indexed passages across all documents for keywords..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {searchQuery.trim() && (
          <Card className="p-4 space-y-3 bg-muted/30">
            <p className="text-xs font-semibold text-muted-foreground">
              {matchingPassages.length} passages matched "{searchQuery}"
            </p>
            {matchingPassages.length === 0 ? (
              <p className="text-sm text-muted-foreground">No matching passages found.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {matchingPassages.map((p) => (
                  <li key={p.id} className="p-3 rounded-lg border border-border bg-card">
                    <p className="text-xs font-semibold text-primary mb-1">
                      {p.docTitle} · Page {p.page_number}
                    </p>
                    <p className="text-foreground/90">{p.content}</p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        )}
      </div>

      {/* Documents List */}
      <div className="space-y-4">
        <h3 className="font-heading text-lg font-semibold text-foreground">
          Your Documents ({documents.length})
        </h3>

        {documents.length === 0 ? (
          <Card className="p-8 text-center text-sm text-muted-foreground">
            No study material uploaded yet.
          </Card>
        ) : (
          <div className="grid gap-3">
            {documents.map((doc) => (
              <Card key={doc.id} className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-secondary text-primary shrink-0">
                    <FileText className="size-5" />
                  </div>
                  <div>
                    <h4 className="font-heading font-semibold text-foreground text-sm">
                      {doc.title}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {doc.original_name ? `${doc.original_name} · ` : ""}
                      {doc.chunk_count} passages indexed · {(doc.size_bytes / 1024).toFixed(0)} KB
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setRenameDocId(doc.id);
                      setNewTitle(doc.title);
                    }}
                    className="size-8 p-0"
                    title="Rename"
                  >
                    <Edit2 className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(doc.id)}
                    className="size-8 p-0 text-destructive hover:text-destructive"
                    title="Delete"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Rename Dialog */}
      <Dialog open={!!renameDocId} onOpenChange={() => setRenameDocId(null)}>
        <DialogHeader>
          <DialogTitle>Rename Document</DialogTitle>
          <DialogDescription>Enter a new display name for this study material.</DialogDescription>
        </DialogHeader>
        <div className="py-2">
          <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setRenameDocId(null)}>
            Cancel
          </Button>
          <Button onClick={handleSaveRename}>Save Name</Button>
        </DialogFooter>
      </Dialog>
    </PageContainer>
  );
}
