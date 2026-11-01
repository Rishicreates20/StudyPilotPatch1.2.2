import React, { useState } from "react";
import {
  Sun,
  Moon,
  Menu,
  X,
  RotateCcw,
  Target,
  Archive,
  Activity,
  Palette,
  Settings,
  BarChart3,
  Video,
  LogIn,
  LogOut,
  Shield,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { resetToDemoData } from "@/lib/storage";

interface SiteHeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export function SiteHeader({ currentPath, onNavigate }: SiteHeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { firebaseUser, userProfile, signOutUser } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (path: string) => {
    onNavigate(path);
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { label: "Goals", path: "/dashboard", icon: Target },
    { label: "Analytics", path: "/analytics", icon: BarChart3 },
    { label: "Lectures", path: "/resources", icon: Video },
    { label: "Archived", path: "/goals/archived", icon: Archive },
    { label: "Status", path: "/status", icon: Activity },
    { label: "Design", path: "/design", icon: Palette },
    { label: "Settings", path: "/settings", icon: Settings },
  ];

  const displayName = firebaseUser?.displayName || userProfile?.display_name || "Rishikesh";
  const userPhoto = firebaseUser?.photoURL || userProfile?.photo_url;
  const initial = (displayName || "U").charAt(0).toUpperCase();
  const isAdmin =
    userProfile?.role === "admin" ||
    userProfile?.email === "rishikeshsarangi122004@gmail.com" ||
    firebaseUser?.email === "rishikeshsarangi122004@gmail.com";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <button
            onClick={() => handleNav("/dashboard")}
            className="flex items-center gap-2 hover:opacity-90 transition-opacity focus:outline-none"
          >
            <Logo />
          </button>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ label, path, icon: Icon }) => {
              const isActive =
                path === "/dashboard"
                  ? currentPath === "/" ||
                    currentPath === "/dashboard" ||
                    (currentPath.startsWith("/goals/") && currentPath !== "/goals/archived")
                  : currentPath.startsWith(path);
              return (
                <button
                  key={path}
                  onClick={() => handleNav(path)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-secondary text-foreground font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  }`}
                >
                  <Icon className="size-4 opacity-80" />
                  {label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="size-9 rounded-lg"
          >
            {theme === "dark" ? (
              <Sun className="size-4.5 text-warning" />
            ) : (
              <Moon className="size-4.5 text-foreground" />
            )}
          </Button>

          {/* User Profile / Auth Button */}
          <div className="hidden sm:flex items-center gap-2 border-l border-border pl-3">
            {firebaseUser ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleNav("/settings")}
                  title={`Logged in as ${firebaseUser.email}`}
                  className="flex items-center gap-2 px-2 py-1 rounded-md text-sm text-foreground hover:bg-secondary transition-colors"
                >
                  {userPhoto ? (
                    <img
                      src={userPhoto}
                      alt={displayName}
                      className="size-7 rounded-full object-cover border border-border"
                    />
                  ) : (
                    <div className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-xs">
                      {initial}
                    </div>
                  )}
                  <div className="text-left leading-tight">
                    <div className="flex items-center gap-1">
                      <span className="font-medium max-w-[110px] truncate text-xs">
                        {displayName}
                      </span>
                      {isAdmin && <Shield className="size-3 text-primary" />}
                    </div>
                  </div>
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 text-muted-foreground hover:text-destructive"
                  onClick={async () => {
                    await signOutUser();
                    handleNav("/sign-in");
                  }}
                  title="Sign out & test login again"
                >
                  <LogOut className="size-3.5" />
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleNav("/sign-in")}
                className="text-xs h-8 gap-1.5"
              >
                <LogIn className="size-3.5 text-primary" />
                Sign In
              </Button>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (confirm("Reset application to sample demo goals and lessons?")) {
                resetToDemoData();
                window.location.reload();
              }
            }}
            title="Reset sample goals & data"
            className="hidden lg:flex text-xs h-8 text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="size-3.5 mr-1" />
            Reset Demo
          </Button>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      {/* Mobile navigation drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-card px-4 pt-2 pb-4 space-y-1 animate-in slide-in-from-top-2">
          {navLinks.map(({ label, path, icon: Icon }) => (
            <button
              key={path}
              onClick={() => handleNav(path)}
              className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-muted"
            >
              <Icon className="size-4 text-muted-foreground" />
              {label}
            </button>
          ))}
          <div className="pt-3 border-t border-border flex justify-between items-center px-1">
            {firebaseUser ? (
              <div className="flex items-center gap-2">
                {userPhoto ? (
                  <img
                    src={userPhoto}
                    alt={displayName}
                    className="size-8 rounded-full object-cover border border-border"
                  />
                ) : (
                  <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-xs">
                    {initial}
                  </div>
                )}
                <div className="text-left">
                  <div className="text-xs font-semibold text-foreground">{displayName}</div>
                  <div className="text-[10px] text-muted-foreground truncate max-w-[160px]">
                    {firebaseUser.email}
                  </div>
                </div>
              </div>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={() => handleNav("/sign-in")}
                className="text-xs h-8 gap-1.5"
              >
                <LogIn className="size-3.5" />
                Sign In
              </Button>
            )}

            {firebaseUser && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOutUser()}
                className="text-xs text-muted-foreground hover:text-destructive gap-1"
              >
                <LogOut className="size-3.5" />
                Sign Out
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
