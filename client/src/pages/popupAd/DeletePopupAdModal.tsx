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
import { MODAL_CONFIG } from "@/pages/popupAd";
import { PopupAd } from "@/models/PopupAd";

interface DeletePopupAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
  popupAd: PopupAd | undefined;
}

export function DeletePopupAdModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  popupAd,
}: DeletePopupAdModalProps) {
  const handleConfirm = async () => {
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      // Error is handled by the component that calls this
    }
  };

  if (!popupAd) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{MODAL_CONFIG.deleteTitle}</AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <p>{MODAL_CONFIG.deleteDescription}</p>
            {popupAd && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div>
                  <p className="text-sm text-gray-600">Title:</p>
                  <p className="font-medium text-gray-900">{popupAd.title}</p>
                </div>
                {popupAd.imageUrl && (
                  <div>
                    <p className="text-sm text-gray-600">Image:</p>
                    <img
                      src={popupAd.imageUrl}
                      alt={popupAd.title}
                      className="w-full h-24 object-cover rounded mt-2"
                    />
                  </div>
                )}
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex gap-3 justify-end">
          <AlertDialogCancel disabled={isLoading}>
            {isLoading ? "Processing..." : MODAL_CONFIG.deleteCancel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Deleting...
              </>
            ) : (
              MODAL_CONFIG.deleteConfirm
            )}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
