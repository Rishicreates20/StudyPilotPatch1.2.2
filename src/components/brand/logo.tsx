import React from "react";
import { Compass } from "lucide-react";

export function Logo({ className = "size-6" }: { className?: string }) {
  return (
    <div className="flex items-center gap-2.5 font-semibold text-foreground tracking-tight select-none">
      <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
        <Compass className={className} />
      </div>
      <span className="font-heading text-xl font-bold tracking-tight">StudyPilot</span>
    </div>
  );
}
