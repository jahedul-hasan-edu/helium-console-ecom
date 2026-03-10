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
import { Organization } from "@/models/Organization";

interface DeleteOrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
  organization?: Organization;
}

export function DeleteOrganizationModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  organization,
}: DeleteOrganizationModalProps) {
  if (!organization) {
    return null;
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Organization</AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <p>
              Delete this organization profile and its uploaded image. This action cannot be undone.
            </p>
            <div className="space-y-3 rounded-xl border bg-muted/20 p-4 text-left text-sm">
              <div>
                <p className="text-muted-foreground">Title</p>
                <p className="font-medium text-foreground">{organization.title || "N/A"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Logo Title</p>
                <p className="font-medium text-foreground">{organization.logoTitle || "N/A"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Email</p>
                <p className="font-medium text-foreground">{organization.email || "N/A"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Phone</p>
                <p className="font-medium text-foreground">{organization.phone || "N/A"}</p>
              </div>
              {organization.imageUrl ? (
                <img src={organization.imageUrl} alt={organization.title || "Organization"} className="h-28 w-full rounded-lg object-cover" />
              ) : null}
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
              "Delete Organization"
            )}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}