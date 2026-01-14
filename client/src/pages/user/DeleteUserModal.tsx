import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle } from "lucide-react";
import { User } from "@/models/User";

interface DeleteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
}

export function DeleteUserModal({
  isOpen,
  onClose,
  user,
  onConfirm,
  isLoading,
}: DeleteUserModalProps) {
  const handleConfirm = async () => {
    try {
      await onConfirm();
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete User
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. Are you sure you want to delete this user?
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg bg-destructive/10 p-4 text-sm">
          <p className="font-medium text-destructive">User Details:</p>
          <p className="mt-1 text-destructive/80">
            <strong>First Name:</strong> {user?.firstName || "N/A"}
          </p>
          <p className="mt-1 text-destructive/80">
            <strong>Last Name:</strong> {user?.lastName || "N/A"}
          </p>
          <p className="text-destructive/80">
            <strong>Email:</strong> {user?.email || "N/A"}
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete User
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
