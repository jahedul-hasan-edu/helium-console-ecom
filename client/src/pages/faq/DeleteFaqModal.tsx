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
import { Faq } from "@/models/Faq";

interface DeleteFaqModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
  faq?: Faq;
}

export function DeleteFaqModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  faq,
}: DeleteFaqModalProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete FAQ</AlertDialogTitle>
          <AlertDialogDescription className="pt-4">
            <div className="space-y-3">
              <p>Are you sure you want to delete this FAQ?</p>
              {faq && (
                <div className="bg-gray-50 p-3 rounded border">
                  <p className="font-medium text-sm">{faq.title}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {faq.answer?.substring(0, 100)}...
                  </p>
                </div>
              )}
              <p className="text-sm text-red-600">This action cannot be undone.</p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex justify-end gap-2">
          <AlertDialogCancel disabled={isLoading}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
