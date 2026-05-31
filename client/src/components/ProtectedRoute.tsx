import type { ReactNode } from "react";
import { Redirect } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";

const SUPER_ADMIN_ONLY_ROUTE_PREFIXES = [
  "/admin/subscription-plans",
  "/admin/tenants",
  "/admin/tenant-subscriptions",
  "/admin/pages",
];

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isInitializing, isSuperAdmin } = useAuth();
  const [location] = useLocation();

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-muted/20 flex items-center justify-center text-sm text-muted-foreground">
        Checking session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  const isSuperAdminOnlyRoute = SUPER_ADMIN_ONLY_ROUTE_PREFIXES.some(
    (routePrefix) => location === routePrefix || location.startsWith(`${routePrefix}/`)
  );

  if (!isSuperAdmin && isSuperAdminOnlyRoute) {
    return <Redirect to="/admin" />;
  }

  return <>{children}</>;
}