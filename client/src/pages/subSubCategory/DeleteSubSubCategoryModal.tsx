import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useDeleteSubSubCategory } from "@/hooks/use-SubSubCategory";

interface DeleteSubSubCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  subSubCategoryId: string;
  subSubCategoryName: string;
}

export function DeleteSubSubCategoryModal({ isOpen, onClose, subSubCategoryId, subSubCategoryName }: DeleteSubSubCategoryModalProps) {
  const deleteSubSubCategoryMutation = useDeleteSubSubCategory();

  const handleDelete = async () => {
    try {
      await deleteSubSubCategoryMutation.mutateAsync(subSubCategoryId);
      onClose();
    } catch (error) {
      console.error("Error deleting sub-sub-category:", error);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the sub-sub-category "{subSubCategoryName}". This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteSubSubCategoryMutation.isPending}
            className="bg-red-600 hover:bg-red-700"
          >
            {deleteSubSubCategoryMutation.isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
