import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useDeleteSubCategory } from "@/hooks/use-SubCategory";

interface DeleteSubCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  subCategoryId: string;
  subCategoryName: string;
}

export function DeleteSubCategoryModal({ isOpen, onClose, subCategoryId, subCategoryName }: DeleteSubCategoryModalProps) {
  const deleteSubCategoryMutation = useDeleteSubCategory();

  const handleDelete = async () => {
    try {
      await deleteSubCategoryMutation.mutateAsync(subCategoryId);
      onClose();
    } catch (error) {
      console.error("Error deleting sub-category:", error);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the sub-category "{subCategoryName}". This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteSubCategoryMutation.isPending}
            className="bg-red-600 hover:bg-red-700"
          >
            {deleteSubCategoryMutation.isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
