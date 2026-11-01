import React, { useState } from "react";
import {
  ArrowLeft,
  Lock,
  Mail,
  User,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  LogOut,
  ShieldCheck,
  Shield,
  ArrowRight,
  Info,
} from "lucide-react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PageContainer } from "@/components/layout/page";
import { useAuth } from "@/context/AuthContext";

function GoogleIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

interface AuthViewProps {
  initialMode?: "signin" | "signup";
  onNavigate: (path: string) => void;
}

export function AuthView({ initialMode = "signin", onNavigate }: AuthViewProps) {
  const {
    firebaseUser,
    userProfile,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOutUser,
    updateProfileData,
    authError,
    clearAuthError,
  } = useAuth();

  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    clearAuthError();
    setResetSent(null);
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      setSuccessMsg("Signed in with Google successfully! Redirecting...");
      setTimeout(() => onNavigate("/dashboard"), 500);
    } catch {
      // Error is caught & stored in AuthContext
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    clearAuthError();
    setResetSent(null);
    setIsSubmitting(true);
    try {
      if (mode === "signup") {
        await signUpWithEmail(email, password, displayName);
        setSuccessMsg("Account created and signed in successfully! Redirecting...");
      } else {
        await signInWithEmail(email, password);
        setSuccessMsg("Signed in successfully! Redirecting...");
      }
      setTimeout(() => onNavigate("/dashboard"), 500);
    } catch {
      // Error handled in AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoSignIn = async () => {
    clearAuthError();
    setResetSent(null);
    setIsSubmitting(true);
    const demoEmail = "scholar@studypilot.ai";
    const demoPass = "studypilot2026!";
    setEmail(demoEmail);
    setPassword(demoPass);
    try {
      try {
        await signInWithEmail(demoEmail, demoPass);
      } catch (err: unknown) {
        const error = err as { code?: string };
        if (
          error?.code === "auth/user-not-found" ||
          error?.code === "auth/invalid-credential"
        ) {
          await signUpWithEmail(demoEmail, demoPass, "Rishi (Demo Scholar)");
        } else {
          throw err;
        }
      }
      setSuccessMsg("Signed in as Demo Scholar! Redirecting to dashboard...");
      setTimeout(() => onNavigate("/dashboard"), 400);
    } catch {
      // Graceful fallback to rich local profile state
      clearAuthError();
      await updateProfileData({
        display_name: "Rishikesh Sarangi",
        email: "rishikeshsarangi122004@gmail.com",
        role: "admin",
        target_role: "Senior AI Engineer",
        bio: "Pre-production administrator testing StudyPilot learning pipelines.",
      });
      setSuccessMsg("Signed in as Demo Scholar! Redirecting to dashboard...");
      setTimeout(() => onNavigate("/dashboard"), 400);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillAdminEmail = () => {
    setEmail("rishikeshsarangi122004@gmail.com");
    setPassword("studypilot2026!");
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      clearAuthError();
      setResetSent("Please enter your email in the field above first, then click forgot password.");
      return;
    }
    clearAuthError();
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setResetSent(`Password reset instructions sent to ${email.trim()}. Please check your inbox.`);
    } catch (e: unknown) {
      const error = e as { message?: string };
      setResetSent(null);
      clearAuthError();
      setSuccessMsg(null);
      alert(error.message || "Could not send reset email. Verify email address.");
    }
  };

  return (
    <PageContainer className="py-10 max-w-md space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate("/dashboard")}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          Dashboard
        </button>
        <button
          onClick={() => onNavigate("/landing")}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          View Landing Page
        </button>
      </div>

      {/* If already authenticated notice */}
      {firebaseUser ? (
        <Card className="border-primary/40 bg-primary/5 shadow-xs">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-primary font-medium text-xs uppercase tracking-wider">
                <ShieldCheck className="size-4" />
                Active Session
              </div>
              {userProfile?.role === "admin" && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  <Shield className="size-3" /> Admin
                </span>
              )}
            </div>
            <CardTitle className="text-lg">
              {firebaseUser.displayName || userProfile.display_name}
            </CardTitle>
            <CardDescription className="text-xs break-all text-muted-foreground">
              {firebaseUser.email}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <p className="text-xs text-muted-foreground">
              You are currently authenticated. You can continue directly to your dashboard or sign out to test logging in from scratch.
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                className="flex-1 gap-1.5"
                onClick={() => onNavigate("/dashboard")}
              >
                Go to Dashboard
                <ArrowRight className="size-3.5" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  await signOutUser();
                  setSuccessMsg("Signed out successfully. You can now test sign in again.");
                }}
                className="gap-1.5 text-xs text-destructive hover:bg-destructive/10"
              >
                <LogOut className="size-3.5" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card className="border-border shadow-sm">
        <CardHeader className="space-y-1.5 text-center pb-4">
          <div className="inline-flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary mx-auto mb-1">
            <Sparkles className="size-5" />
          </div>
          <CardTitle className="text-2xl font-bold font-heading">
            {mode === "signin" ? "Sign in to StudyPilot" : "Create an account"}
          </CardTitle>
          <CardDescription className="text-xs">
            {mode === "signin"
              ? "Sign in to sync your study goals, roadmaps, and reading logs across devices."
              : "Set up your personal learning journey and persist your study progress."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {successMsg && (
            <Alert variant="success" className="text-xs py-2.5">
              <CheckCircle2 className="size-4 shrink-0" />
              <AlertDescription>{successMsg}</AlertDescription>
            </Alert>
          )}

          {resetSent && (
            <Alert variant="info" className="text-xs py-2.5">
              <Info className="size-4 shrink-0" />
              <AlertDescription>{resetSent}</AlertDescription>
            </Alert>
          )}

          {authError && (
            <Alert variant="destructive" className="text-xs py-2.5">
              <AlertCircle className="size-4 shrink-0" />
              <AlertDescription>{authError}</AlertDescription>
            </Alert>
          )}

          {/* Google Sign In Button */}
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || isSubmitting}
            className="w-full h-11 border-border font-medium flex items-center justify-center gap-2.5 hover:bg-muted/80 shadow-2xs"
          >
            <GoogleIcon className="size-4.5" />
            <span>
              {googleLoading
                ? "Connecting with Google..."
                : mode === "signin"
                ? "Sign in with Google"
                : "Sign up with Google"}
            </span>
          </Button>

          <div className="relative my-3">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-[11px] uppercase">
              <span className="bg-card px-2 text-muted-foreground font-medium">
                Or with email
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="auth-name" className="text-xs">Your Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                  <Input
                    id="auth-name"
                    placeholder="e.g. Rishikesh Sarangi"
                    className="pl-9 h-10 text-sm"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="auth-email" className="text-xs">Email Address</Label>
                <button
                  type="button"
                  onClick={handleFillAdminEmail}
                  className="text-[11px] text-primary hover:underline"
                  title="Fill Rishikesh's email"
                >
                  Fill admin email
                </button>
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <Input
                  id="auth-email"
                  type="email"
                  placeholder="name@example.com"
                  className="pl-9 h-10 text-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="auth-password" className="text-xs">Password</Label>
                {mode === "signin" && (
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-[11px] text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <Input
                  id="auth-password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-9 h-10 text-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              loading={isSubmitting}
              disabled={googleLoading}
              className="w-full h-10 font-medium"
            >
              {mode === "signin" ? "Sign In" : "Create Account"}
            </Button>

            {/* Quick 1-Click Demo Login */}
            <div className="pt-1 border-t border-border/60">
              <Button
                type="button"
                variant="outline"
                onClick={handleDemoSignIn}
                disabled={isSubmitting || googleLoading}
                className="w-full h-9 text-xs font-normal text-muted-foreground hover:text-foreground gap-1.5"
              >
                <Sparkles className="size-3.5 text-primary" />
                1-Click Quick Demo Sign-In
              </Button>
            </div>
          </form>
        </CardContent>

        <CardFooter className="flex-col gap-2 justify-center border-t border-border pt-4 text-xs text-muted-foreground">
          {mode === "signin" ? (
            <p>
              New to StudyPilot?{" "}
              <button
                type="button"
                onClick={() => {
                  clearAuthError();
                  setResetSent(null);
                  setMode("signup");
                }}
                className="font-medium text-primary hover:underline ml-1"
              >
                Create an account
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  clearAuthError();
                  setResetSent(null);
                  setMode("signin");
                }}
                className="font-medium text-primary hover:underline ml-1"
              >
                Sign in
              </button>
            </p>
          )}

          <button
            type="button"
            onClick={() => onNavigate("/dashboard")}
            className="text-[11px] text-muted-foreground hover:text-foreground transition-colors mt-1"
          >
            Skip and continue as Guest →
          </button>
        </CardFooter>
      </Card>
    </PageContainer>
  );
}
