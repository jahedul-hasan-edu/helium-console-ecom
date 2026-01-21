import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle } from "lucide-react";
import { TenantSubscription } from "@/models/TenantSubscription";
import { BUTTON_LABELS, TENANT_SUBSCRIPTION_FORM } from "./index";

interface DeleteTenantSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription?: TenantSubscription;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
}

export function DeleteTenantSubscriptionModal({
  isOpen,
  onClose,
  subscription,
  onConfirm,
  isLoading,
}: DeleteTenantSubscriptionModalProps) {
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
            {TENANT_SUBSCRIPTION_FORM.MODALS.DELETE_TITLE}
          </DialogTitle>
          <DialogDescription>
            {TENANT_SUBSCRIPTION_FORM.MODALS.DELETE_MESSAGE}
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg bg-destructive/10 p-4 text-sm">
          <p className="font-medium text-destructive">Subscription Details:</p>
          <p className="mt-1 text-destructive/80">
            <strong>Start Date:</strong> {subscription?.startDate || "N/A"}
          </p>
          <p className="mt-1 text-destructive/80">
            <strong>End Date:</strong> {subscription?.endDate || "N/A"}
          </p>
          <p className="text-destructive/80">
            <strong>Status:</strong> {subscription?.isActive ? "Active" : "Inactive"}
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {BUTTON_LABELS.CANCEL}
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {BUTTON_LABELS.CONFIRM_DELETE}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
