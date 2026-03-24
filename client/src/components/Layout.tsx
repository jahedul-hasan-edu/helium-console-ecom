import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Users, 
  ShoppingBag, 
  ShoppingCart,
  Calendar, 
  Briefcase, 
  Building2,
  Tag, 
  Menu,
  Search,
  LogOut,
  Tags,
  Layers,
  Package,
  HelpCircle,
  Settings,
  Building,
  FolderClosed,
  FolderOpen,
  FolderTree,
  Home,
  Megaphone,
  Shield,
  FileText,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigation } from "@/hooks/use-Navigation";
import type { NavigationItem } from "@/models/Navigation";
import { useQuery } from "@tanstack/react-query";
import { apiService } from "@/lib/apiService";
import type { Tenant } from "@/models/Tenant";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const iconMap: Record<string, LucideIcon> = {
  Briefcase,
  Building,
  Building2,
  Calendar,
  FileText,
  FolderClosed,
  FolderOpen,
  FolderTree,
  HelpCircle,
  Home,
  LayoutDashboard,
  Layers,
  Megaphone,
  Package,
  Search,
  Settings,
  Shield,
  ShoppingBag,
  ShoppingCart,
  Tag,
  Tags,
  Users,
};

function flattenNavigation(items: NavigationItem[]): NavigationItem[] {
  return items.flatMap((item) => [item, ...(item.children ? flattenNavigation(item.children) : [])]);
}

export function Layout({ children }: { children: React.ReactNode }) {
  const [location, navigate] = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { data: navigation = [] } = useNavigation(true);
  const { user, logout, isSuperAdmin, selectedTenantId, setSelectedTenantId } = useAuth();

  const { data: tenantsData } = useQuery({
    queryKey: ["layout-tenants"],
    queryFn: () =>
      apiService.get<{ items: Tenant[] }>("/api/admin/tenants?page=1&pageSize=200", {
        showSuccessToast: false,
        showErrorToast: false,
      }),
    enabled: isSuperAdmin,
    staleTime: 5 * 60 * 1000,
  });

  const sidebarItems = navigation.length > 0 ? navigation : [];
  const allNavigationItems = flattenNavigation(sidebarItems);

  const NavContent = () => (
    <>
      <div className="flex items-center gap-2 px-6 h-16 border-b border-border/50">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <Briefcase className="w-5 h-5 text-primary-foreground" />
        </div>
        <span className="text-xl font-bold font-display tracking-tight">Helium Console</span>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {sidebarItems.map((item) => {
          const Icon = iconMap[item.icon || "FileText"] || FileText;
          const isActive = location === item.routePath || (item.routePath !== '/admin' && location.startsWith(item.routePath));
          return (
            <Link key={item.id} href={item.routePath}>
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer group",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                onClick={() => setIsMobileOpen(false)}
              >
                <Icon className={cn("w-5 h-5 transition-colors", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
                {item.title}
              </div>
            </Link>
          );
        })}
      </nav>
    </>
  );

  return (
    <div className="min-h-screen bg-muted/20 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-card fixed inset-y-0 z-30">
        <NavContent />
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="sticky top-0 z-20 h-16 bg-card/80 backdrop-blur-md border-b border-border px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64">
                <NavContent />
              </SheetContent>
            </Sheet>
            
            <div className="hidden md:flex relative max-w-md w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search anything..."
                className="pl-9 w-64 lg:w-80 bg-muted/30 focus-visible:ring-1 border-transparent hover:border-border transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {isSuperAdmin && (
              <div className="hidden md:block w-52">
                <Select value={selectedTenantId || "all"} onValueChange={(value) => setSelectedTenantId(value === "all" ? null : value)}>
                  <SelectTrigger className="bg-muted/30 border-transparent">
                    <SelectValue placeholder="All tenants" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All tenants</SelectItem>
                    {tenantsData?.items?.map((tenant) => (
                      <SelectItem key={tenant.id} value={tenant.id}>
                        {tenant.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="pl-2 pr-1 h-10 rounded-full gap-2">
                  <Avatar className="h-8 w-8 border border-border">
                    <AvatarImage src="/placeholder-avatar.jpg" />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {`${user?.firstName?.[0] || "A"}${user?.lastName?.[0] || "U"}`}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:flex flex-col items-start text-xs mr-2">
                    <span className="font-semibold">{`${user?.firstName || "Authenticated"} ${user?.lastName || "User"}`.trim()}</span>
                    <span className="text-muted-foreground">{user?.roleName?.replace(/_/g, " ") || "User"}</span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/admin/my-account")}>Account &amp; Security</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive" onClick={() => void logout()}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
