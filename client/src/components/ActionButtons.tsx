import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ActionButtonsProps {
  onEdit: () => void;
  onDelete: () => void;
  showLabel?: boolean;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "ghost" | "outline";
}

/**
 * Reusable component for rendering action buttons (Edit and Delete)
 * Used in tables to provide consistent action UI
 */
export function ActionButtons({
  onEdit,
  onDelete,
  showLabel = false,
  size = "sm",
  variant = "outline",
}: ActionButtonsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant={variant}
        size={size}
        onClick={onEdit}
        title="Edit"
        className="gap-2"
      >
        <Edit className="h-4 w-4" />
        {showLabel && <span>Edit</span>}
      </Button>
      <Button
        variant={variant}
        size={size}
        onClick={onDelete}
        title="Delete"
        className="gap-2 text-destructive hover:bg-destructive/10"
      >
        <Trash2 className="h-4 w-4" />
        {showLabel && <span>Delete</span>}
      </Button>
    </div>
  );
}
