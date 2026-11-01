import React, { useState, useEffect } from "react";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { SiteHeader } from "./components/layout/site-header";
import { SiteFooter } from "./components/layout/site-footer";
import { DashboardView } from "./views/DashboardView";
import { GoalDetailView } from "./views/GoalDetailView";
import { NewGoalView } from "./views/NewGoalView";
import { EditGoalView } from "./views/EditGoalView";
import { RoadmapView } from "./views/RoadmapView";
import { LessonView } from "./views/LessonView";
import { QuizView } from "./views/QuizView";
import { DocumentsView } from "./views/DocumentsView";
import { FlashcardsView } from "./views/FlashcardsView";
import { ExportsView } from "./views/ExportsView";
import { ArchivedGoalsView } from "./views/ArchivedGoalsView";
import { StatusView } from "./views/StatusView";
import { DesignView } from "./views/DesignView";
import { SettingsView } from "./views/SettingsView";
import { LandingView } from "./views/LandingView";
import { AuthView } from "./views/AuthView";
import { OnboardingView } from "./views/OnboardingView";
import { AnalyticsView } from "./views/AnalyticsView";
import { ResourcesView } from "./views/ResourcesView";
import { getUserProfile } from "./lib/storage";
import { UserProfile } from "./types";

function AppContent() {
  const { firebaseUser, userProfile, updateProfileData } = useAuth();
  const [currentPath, setCurrentPath] = useState<string>(() => {
    // If opening root / or /sign-in, start directly at sign-in so user can test the login flow
    const p = window.location.pathname;
    if (!p || p === "/" || p === "/sign-in") {
      return "/sign-in";
    }
    return p;
  });
  const [localUser, setLocalUser] = useState<UserProfile>(userProfile || getUserProfile());

  useEffect(() => {
    if (userProfile) {
      setLocalUser(userProfile);
    }
  }, [userProfile]);

  useEffect(() => {
    const handlePopState = () => {
      const p = window.location.pathname || "/sign-in";
      setCurrentPath(p === "/" ? "/sign-in" : p);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, "", path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Route matching
  const renderRoute = () => {
    // Exact paths
    if (currentPath === "/landing") {
      return <LandingView onNavigate={navigate} />;
    }
    if (currentPath === "/sign-in" || currentPath === "/signin") {
      return <AuthView initialMode="signin" onNavigate={navigate} />;
    }
    if (currentPath === "/sign-up" || currentPath === "/signup") {
      return <AuthView initialMode="signup" onNavigate={navigate} />;
    }
    if (currentPath === "/onboarding") {
      return <OnboardingView onNavigate={navigate} />;
    }
    if (currentPath === "/analytics") {
      return <AnalyticsView onNavigate={navigate} />;
    }
    if (currentPath === "/resources") {
      return <ResourcesView onNavigate={navigate} />;
    }
    if (currentPath === "/") {
      if (!firebaseUser) {
        return <AuthView initialMode="signin" onNavigate={navigate} />;
      }
      return <DashboardView user={localUser} onNavigate={navigate} />;
    }
    if (currentPath === "/dashboard") {
      return <DashboardView user={localUser} onNavigate={navigate} />;
    }
    if (currentPath === "/goals/new") {
      return <NewGoalView user={localUser} onNavigate={navigate} />;
    }
    if (currentPath === "/goals/archived") {
      return <ArchivedGoalsView onNavigate={navigate} />;
    }
    if (currentPath === "/status") {
      return <StatusView />;
    }
    if (currentPath === "/design") {
      return <DesignView />;
    }
    if (currentPath === "/settings") {
      return (
        <SettingsView
          user={localUser}
          onUserUpdate={(u) => {
            setLocalUser(u);
            updateProfileData(u);
          }}
        />
      );
    }

    // Dynamic paths
    // /goals/:id/resources
    const resMatch = currentPath.match(/^\/goals\/([^/]+)\/resources$/);
    if (resMatch) {
      return <ResourcesView initialGoalId={resMatch[1]} onNavigate={navigate} />;
    }

    // /goals/:id/learn/:topicId/quiz
    const quizMatch = currentPath.match(/^\/goals\/([^/]+)\/learn\/([^/]+)\/quiz$/);
    if (quizMatch) {
      return <QuizView goalId={quizMatch[1]} topicId={quizMatch[2]} onNavigate={navigate} />;
    }

    // /goals/:id/learn/:topicId
    const lessonMatch = currentPath.match(/^\/goals\/([^/]+)\/learn\/([^/]+)$/);
    if (lessonMatch) {
      return <LessonView goalId={lessonMatch[1]} topicId={lessonMatch[2]} onNavigate={navigate} />;
    }

    // /goals/:id/roadmap
    const roadmapMatch = currentPath.match(/^\/goals\/([^/]+)\/roadmap$/);
    if (roadmapMatch) {
      return <RoadmapView goalId={roadmapMatch[1]} onNavigate={navigate} />;
    }

    // /goals/:id/edit
    const editMatch = currentPath.match(/^\/goals\/([^/]+)\/edit$/);
    if (editMatch) {
      return <EditGoalView goalId={editMatch[1]} onNavigate={navigate} />;
    }

    // /goals/:id/documents
    const docMatch = currentPath.match(/^\/goals\/([^/]+)\/documents$/);
    if (docMatch) {
      return <DocumentsView goalId={docMatch[1]} onNavigate={navigate} />;
    }

    // /goals/:id/flashcards
    const fcMatch = currentPath.match(/^\/goals\/([^/]+)\/flashcards$/);
    if (fcMatch) {
      return <FlashcardsView goalId={fcMatch[1]} onNavigate={navigate} />;
    }

    // /goals/:id/exports
    const expMatch = currentPath.match(/^\/goals\/([^/]+)\/exports$/);
    if (expMatch) {
      return <ExportsView goalId={expMatch[1]} onNavigate={navigate} />;
    }

    // /goals/:id
    const goalMatch = currentPath.match(/^\/goals\/([^/]+)$/);
    if (goalMatch) {
      return <GoalDetailView goalId={goalMatch[1]} onNavigate={navigate} />;
    }

    // Fallback
    return <DashboardView user={localUser} onNavigate={navigate} />;
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors selection:bg-primary/20">
      <SiteHeader currentPath={currentPath} onNavigate={navigate} />
      <main className="flex-1 pb-16">{renderRoute()}</main>
      <SiteFooter onNavigate={navigate} />
    </div>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
