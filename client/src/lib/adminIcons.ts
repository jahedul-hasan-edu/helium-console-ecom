import {
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
  type LucideIcon,
} from "lucide-react";

export const adminIconMap: Record<string, LucideIcon> = {
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

export function getAdminIcon(iconName?: string | null): LucideIcon {
  if (!iconName) {
    return FileText;
  }

  return adminIconMap[iconName] || FileText;
}