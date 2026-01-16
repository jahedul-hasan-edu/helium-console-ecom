import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, AlertCircle } from "lucide-react";
import { MainCategory } from "@/models/MainCategory";
import { FormValidator } from "./formValidator";
import { getFieldError, ValidationError } from "@/lib/formValidator";

interface EditMainCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  mainCategory?: MainCategory;
  onSubmit: (data: any) => Promise<void>;
  isLoading: boolean;
}

export function EditMainCategoryModal({
  isOpen,
  onClose,
  mainCategory,
  onSubmit,
  isLoading,
}: EditMainCategoryModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    orderIndex: "",
  });

  const [errors, setErrors] = useState<ValidationError[]>([]);

  useEffect(() => {
    if (mainCategory) {
      setFormData({
        name: mainCategory.name || "",
        slug: mainCategory.slug || "",
        orderIndex: mainCategory.orderIndex !== null ? String(mainCategory.orderIndex) : "",
      });
      setErrors([]);
    }
  }, [mainCategory, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    setErrors(errors.filter((e) => e.field !== name));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const validation = FormValidator.validateUpdateMainCategory(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      const submitData: any = {
        name: formData.name,
        slug: formData.slug,
        orderIndex: parseInt(formData.orderIndex, 10),
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error("Submit error:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Main Category</DialogTitle>
          <DialogDescription>
            Update main category information. All fields are required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="Enter category name"
              value={formData.name}
              onChange={handleChange}
              className={getFieldError("name", errors) ? "border-destructive" : ""}
            />
            {getFieldError("name", errors) && (
              <div className="flex items-center gap-1 text-xs text-destructive">
                <AlertCircle className="h-3 w-3" />
                {getFieldError("name", errors)}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">
              Slug <span className="text-destructive">*</span>
            </Label>
            <Input
              id="slug"
              name="slug"
              placeholder="Enter slug"
              value={formData.slug}
              onChange={handleChange}
              className={getFieldError("slug", errors) ? "border-destructive" : ""}
            />
            {getFieldError("slug", errors) && (
              <div className="flex items-center gap-1 text-xs text-destructive">
                <AlertCircle className="h-3 w-3" />
                {getFieldError("slug", errors)}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="orderIndex">
              Order Index <span className="text-destructive">*</span>
            </Label>
            <Input
              id="orderIndex"
              name="orderIndex"
              type="number"
              placeholder="Enter order index"
              value={formData.orderIndex}
              onChange={handleChange}
              className={getFieldError("orderIndex", errors) ? "border-destructive" : ""}
            />
            {getFieldError("orderIndex", errors) && (
              <div className="flex items-center gap-1 text-xs text-destructive">
                <AlertCircle className="h-3 w-3" />
                {getFieldError("orderIndex", errors)}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Main Category
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
