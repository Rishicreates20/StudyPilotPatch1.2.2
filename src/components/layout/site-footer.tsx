import React from "react";
import { Compass, Heart } from "lucide-react";

export function SiteFooter({ onNavigate }: { onNavigate?: (path: string) => void }) {
  return (
    <footer className="border-t border-border bg-card/50 text-muted-foreground text-sm py-8 mt-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Compass className="size-4 text-primary" />
          <span className="font-heading font-medium text-foreground">StudyPilot</span>
          <span>· Personal AI Learning Coach</span>
        </div>
        <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm flex-wrap justify-center">
          <button
            onClick={() => onNavigate?.("/landing")}
            className="hover:text-foreground transition-colors"
          >
            Product Tour
          </button>
          <button
            onClick={() => onNavigate?.("/onboarding")}
            className="hover:text-foreground transition-colors"
          >
            Setup Wizard
          </button>
          <button
            onClick={() => onNavigate?.("/status")}
            className="hover:text-foreground transition-colors"
          >
            System Status
          </button>
          <button
            onClick={() => onNavigate?.("/design")}
            className="hover:text-foreground transition-colors"
          >
            Design Tokens
          </button>
          <button
            onClick={() => onNavigate?.("/settings")}
            className="hover:text-foreground transition-colors"
          >
            Preferences
          </button>
        </div>
      </div>
    </footer>
  );
}
