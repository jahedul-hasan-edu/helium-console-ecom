import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle } from "lucide-react";
import { SubscriptionPlan } from "@/models/SubscriptionPlan";

interface DeleteSubscriptionPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan?: SubscriptionPlan;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
}

export function DeleteSubscriptionPlanModal({
  isOpen,
  onClose,
  plan,
  onConfirm,
  isLoading,
}: DeleteSubscriptionPlanModalProps) {
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
            Delete Subscription Plan
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. Are you sure you want to delete this subscription plan?
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg bg-destructive/10 p-4 text-sm">
          <p className="font-medium text-destructive">Plan Details:</p>
          <p className="mt-1 text-destructive/80">
            <strong>Name:</strong> {plan?.name || "N/A"}
          </p>
          <p className="mt-1 text-destructive/80">
            <strong>Price:</strong> ${plan?.price || "N/A"}
          </p>
          <p className="text-destructive/80">
            <strong>Duration:</strong> {plan?.durationDays || "N/A"} days
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
            Delete Plan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
