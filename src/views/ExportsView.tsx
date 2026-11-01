import React, { useState } from "react";
import { ArrowLeft, FolderDown, Download, Trash2, FileText, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { ExportItem } from "@/types";
import { getGoalById, getExportsForGoal, deleteExport } from "@/lib/storage";

interface ExportsViewProps {
  goalId: string;
  onNavigate: (path: string) => void;
}

export function ExportsView({ goalId, onNavigate }: ExportsViewProps) {
  const goal = getGoalById(goalId);
  const [exportsList, setExportsList] = useState<ExportItem[]>(() =>
    goal ? getExportsForGoal(goal.id) : []
  );
  const [downloadedId, setDownloadedId] = useState<string | null>(null);

  if (!goal) {
    return (
      <PageContainer className="py-8 text-center">
        <h2 className="font-heading text-xl font-bold mb-4">Goal not found</h2>
        <Button onClick={() => onNavigate("/dashboard")}>Back to Goals</Button>
      </PageContainer>
    );
  }

  const handleDelete = (exportId: string) => {
    deleteExport(exportId);
    setExportsList(getExportsForGoal(goal.id));
  };

  const handleSimulateDownload = (item: ExportItem) => {
    setDownloadedId(item.id);
    // Create simulated file blob
    const element = document.createElement("a");
    const file = new Blob([`# ${item.title}\nExported from StudyPilot on ${item.created_at}`], {
      type: "text/plain",
    });
    element.href = URL.createObjectURL(file);
    element.download = item.title;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    setTimeout(() => setDownloadedId(null), 2500);
  };

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
          title="Exported Files"
          description="PDF notes, study guides, and roadmaps made from this goal's curriculum. Files are stored securely and downloadable anytime."
        />
      </div>

      {exportsList.length === 0 ? (
        <Card className="p-12 text-center space-y-4">
          <FolderDown className="size-12 mx-auto text-muted-foreground/60" />
          <h3 className="font-heading text-lg font-semibold">No files yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Open a lesson or your roadmap and click "Download PDF". Generated export packages appear here.
          </p>
          <Button variant="outline" onClick={() => onNavigate(`/goals/${goal.id}/roadmap`)}>
            Go to Roadmap
          </Button>
        </Card>
      ) : (
        <div className="grid gap-3">
          {exportsList.map((item) => (
            <Card key={item.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                  <FileText className="size-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="uppercase text-[10px]">
                      {item.format}
                    </Badge>
                    <Badge variant="success" className="text-[10px]">
                      Ready
                    </Badge>
                  </div>
                  <h4 className="font-heading font-semibold text-foreground text-sm mt-0.5">
                    {item.title}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {item.size_kb} KB · Generated {new Date(item.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  onClick={() => handleSimulateDownload(item)}
                  className="gap-1.5"
                >
                  {downloadedId === item.id ? (
                    <>
                      <Check className="size-4 text-success" />
                      Downloaded
                    </>
                  ) : (
                    <>
                      <Download className="size-4" />
                      Download
                    </>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(item.id)}
                  className="size-9 p-0 text-muted-foreground hover:text-destructive"
                  title="Delete"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
