import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateSubCategory, useCheckSubCategorySlug, useSubCategory } from "@/hooks/use-SubCategory";
import { useCategories } from "@/hooks/use-Category";
import { validateUpdateSubCategory, getFieldError, ValidationError } from "@/lib/formValidator";
import { AlertCircle, Check, ChevronsUpDown } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { SubCategory } from "@/models/SubCategory";

interface EditSubCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  subCategoryId: string;
}

export function EditSubCategoryModal({ isOpen, onClose, subCategoryId }: EditSubCategoryModalProps) {
  const [categoryId, setCategoryId] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [slugExists, setSlugExists] = useState(false);
  const [originalSlug, setOriginalSlug] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [categoryOpen, setCategoryOpen] = useState(false);

  const { data: subCategory } = useSubCategory(subCategoryId);
  const updateSubCategoryMutation = useUpdateSubCategory();
  const checkSlugMutation = useCheckSubCategorySlug();

  // Fetch categories with search
  const { data: categoriesData } = useCategories({
    search: categorySearch,
    pageSize: 50,
  });

  const categories = categoriesData?.items || [];

  useEffect(() => {
    if (isOpen && subCategory) {
      setCategoryId(subCategory.categoryId || "");
      setCategoryName(subCategory.categoryName || "");
      setName(subCategory.name || "");
      setSlug(subCategory.slug || "");
      setOriginalSlug(subCategory.slug || "");
      setValidationErrors([]);
      setSlugExists(false);
      setCategorySearch("");
    }
  }, [isOpen, subCategory]);

  // Update category name when categories are loaded
  useEffect(() => {
    if (categoryId && categories.length > 0) {
      const category = categories.find((c) => c.id === categoryId);
      if (category && !categoryName) {
        setCategoryName(category.name || "");
      }
    }
  }, [categories, categoryId]);

  // Reactive validation
  useEffect(() => {
    const result = validateUpdateSubCategory({ categoryId, name, slug });
    setValidationErrors(result.errors);
  }, [categoryId, name, slug]);

  const handleSlugBlur = async () => {
    if (slug.trim() && slug !== originalSlug) {
      try {
        const result = await checkSlugMutation.mutateAsync(slug);
        setSlugExists(result.exists);
      } catch (error) {
        console.error("Error checking slug:", error);
      }
    }
  };

  const handleSubmit = async () => {
    const result = validateUpdateSubCategory({ categoryId, name, slug });
    setValidationErrors(result.errors);

    if (!result.isValid || slugExists) {
      return;
    }

    try {
      await updateSubCategoryMutation.mutateAsync({
        id: subCategoryId,
        data: {
          categoryId,
          name,
          slug,
        },
      });
      onClose();
    } catch (error) {
      console.error("Error updating sub-category:", error);
    }
  };

  const categoryIdError = getFieldError("categoryId", validationErrors);
  const nameError = getFieldError("name", validationErrors);
  const slugError = getFieldError("slug", validationErrors);

  const isFormValid = !categoryIdError && !nameError && !slugError && !slugExists && categoryId && name && slug;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Sub-Category</DialogTitle>
          <DialogDescription>
            All fields are required. Update the information below to edit the sub-category.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Category Dropdown */}
          <div className="grid gap-2">
            <Label htmlFor="categoryId">
              Category <span className="text-red-500">*</span>
            </Label>
            <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={categoryOpen}
                  className={cn(
                    "w-full justify-between",
                    !categoryId && "text-muted-foreground",
                    categoryIdError && "border-red-500"
                  )}
                >
                  {categoryId ? categoryName : "Select category..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[460px] p-0">
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder="Search category..."
                    value={categorySearch}
                    onValueChange={setCategorySearch}
                  />
                  <CommandList>
                    <CommandEmpty>No category found.</CommandEmpty>
                    <CommandGroup>
                      {categories.map((category) => (
                        <CommandItem
                          key={category.id}
                          value={category.id}
                          onSelect={() => {
                            setCategoryId(category.id);
                            setCategoryName(category.name || "");
                            setCategoryOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              categoryId === category.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div className="flex flex-col">
                            <span>{category.name}</span>
                            <span className="text-xs text-muted-foreground">{category.slug}</span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {categoryIdError && (
              <div className="flex items-center gap-1 text-sm text-red-500">
                <AlertCircle className="h-3 w-3" />
                <span>{categoryIdError}</span>
              </div>
            )}
          </div>

          {/* Name Field */}
          <div className="grid gap-2">
            <Label htmlFor="name">
              Name <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                }}
                placeholder="Enter sub-category name"
                className={nameError ? "border-red-500 pr-8" : ""}
              />
              {nameError && (
                <AlertCircle className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-red-500" />
              )}
            </div>
            {nameError && (
              <div className="flex items-center gap-1 text-sm text-red-500">
                <AlertCircle className="h-3 w-3" />
                <span>{nameError}</span>
              </div>
            )}
          </div>

          {/* Slug Field */}
          <div className="grid gap-2">
            <Label htmlFor="slug">
              Slug <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="slug"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setSlugExists(false);
                }}
                onBlur={handleSlugBlur}
                placeholder="Enter sub-category slug"
                className={slugError || slugExists ? "border-red-500 pr-8" : ""}
              />
              {(slugError || slugExists) && (
                <AlertCircle className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-red-500" />
              )}
            </div>
            {slugError && (
              <div className="flex items-center gap-1 text-sm text-red-500">
                <AlertCircle className="h-3 w-3" />
                <span>{slugError}</span>
              </div>
            )}
            {slugExists && (
              <div className="flex items-center gap-1 text-sm text-red-500">
                <AlertCircle className="h-3 w-3" />
                <span>This slug already exists</span>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isFormValid || updateSubCategoryMutation.isPending}
          >
            {updateSubCategoryMutation.isPending ? "Updating..." : "Update Sub-Category"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
