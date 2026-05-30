import type { BadgeProps } from "@/components/ui/badge";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatusBadgeStatus = "active" | "inactive" | "system" | "custom" | "disabled";

const STATUS_STYLES: Record<StatusBadgeStatus, { label: string; variant: BadgeProps["variant"]; className?: string }> = {
  active: {
    label: "Active",
    variant: "default",
    className: "bg-green-500 hover:bg-green-600",
  },
  inactive: {
    label: "Inactive",
    variant: "secondary",
  },
  system: {
    label: "System",
    variant: "outline",
  },
  custom: {
    label: "Custom",
    variant: "secondary",
  },
  disabled: {
    label: "Disabled",
    variant: "secondary",
  },
};

interface StatusBadgeProps extends Omit<BadgeProps, "children"> {
  status: StatusBadgeStatus;
  label?: string;
}

export function StatusBadge({ status, label, className, variant, ...props }: StatusBadgeProps) {
  const preset = STATUS_STYLES[status];

  return (
    <Badge
      variant={variant ?? preset.variant}
      className={cn(preset.className, className)}
      {...props}
    >
      {label ?? preset.label}
    </Badge>
  );
}