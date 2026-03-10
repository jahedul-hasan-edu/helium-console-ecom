import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";
import { Order } from "@/models/Order";
import { formatOrderStatusLabel } from ".";

interface DeleteOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
  order?: Order;
}

export function DeleteOrderModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  order,
}: DeleteOrderModalProps) {
  if (!order) {
    return null;
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Order</AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <p>Delete this order record. This action cannot be undone.</p>
            <div className="space-y-3 rounded-xl border bg-muted/20 p-4 text-left text-sm">
              <div>
                <p className="text-muted-foreground">Order ID</p>
                <p className="break-all font-mono text-foreground">{order.id}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <p className="font-medium text-foreground">{formatOrderStatusLabel(order.status)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Email</p>
                <p className="font-medium text-foreground">{order.email || "N/A"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Mobile</p>
                <p className="font-medium text-foreground">{order.mobile || "N/A"}</p>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex justify-end gap-3">
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={async () => {
              try {
                await onConfirm();
                onClose();
              } catch {
                // Mutation toasts handle the visible error state.
              }
            }}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Order"
            )}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}