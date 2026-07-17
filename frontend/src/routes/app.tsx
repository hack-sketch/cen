import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/lib/auth";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

function AppLayout() {
  const { user, loading } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    if (!loading && !user) nav({ to: "/login" });
  }, [loading, user, nav]);

  if (loading || !user) {
    return (
      <div className="grid min-h-screen place-items-center bg-panel/20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-deep-forest/20 border-t-deep-forest rounded-full animate-spin"></div>
          <span className="text-xs font-bold text-ink/65 uppercase tracking-wider">Loading CEN Console...</span>
        </div>
      </div>
    );
  }

  return <AppShell><Outlet /></AppShell>;
}
