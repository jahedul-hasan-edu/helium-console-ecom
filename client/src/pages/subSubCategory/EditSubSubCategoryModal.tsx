import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateSubSubCategory, useCheckSubSubCategorySlug, useSubSubCategory } from "@/hooks/use-SubSubCategory";
import { useSubCategories } from "@/hooks/use-SubCategory";
import { getFieldError, ValidationError } from "@/lib/formValidator";
import { AlertCircle, Check, ChevronsUpDown } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { SubSubCategory } from "@/models/SubSubCategory";
import { validateUpdateSubSubCategory } from "./formValidator";

interface EditSubSubCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  subSubCategoryId: string;
}

export function EditSubSubCategoryModal({ isOpen, onClose, subSubCategoryId }: EditSubSubCategoryModalProps) {
  const [subCategoryId, setSubCategoryId] = useState("");
  const [subCategoryName, setSubCategoryName] = useState("");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [slugExists, setSlugExists] = useState(false);
  const [originalSlug, setOriginalSlug] = useState("");
  const [subCategorySearch, setSubCategorySearch] = useState("");
  const [subCategoryOpen, setSubCategoryOpen] = useState(false);

  const { data: subSubCategory } = useSubSubCategory(subSubCategoryId);
  const updateSubSubCategoryMutation = useUpdateSubSubCategory();
  const checkSlugMutation = useCheckSubSubCategorySlug();

  // Fetch sub categories with search
  const { data: subCategoriesData } = useSubCategories({
    search: subCategorySearch,
    pageSize: 50,
  });

  const subCategories = subCategoriesData?.items || [];

  useEffect(() => {
    if (isOpen && subSubCategory) {
      setSubCategoryId(subSubCategory.subCategoryId || "");
      setSubCategoryName(
        subCategories.find((sc) => sc.id === subSubCategory.subCategoryId)?.name || ""
      );
      setName(subSubCategory.name || "");
      setSlug(subSubCategory.slug || "");
      setOriginalSlug(subSubCategory.slug || "");
      setValidationErrors([]);
      setSlugExists(false);
      setSubCategorySearch("");
    }
  }, [isOpen, subSubCategory]);

  // Update sub category name when sub categories are loaded
  useEffect(() => {
    if (subCategoryId && subCategories.length > 0) {
      const subCategory = subCategories.find((sc) => sc.id === subCategoryId);
      if (subCategory && !subCategoryName) {
        setSubCategoryName(subCategory.name || "");
      }
    }
  }, [subCategories, subCategoryId]);

  // Validate on field changes
  useEffect(() => {
    if (subSubCategory && (subCategoryId || name || slug)) {
      const result = validateUpdateSubSubCategory({ subCategoryId, name, slug });
      setValidationErrors(result.errors);
    }
  }, [subSubCategory, subCategoryId, name, slug]);

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
    const result = validateUpdateSubSubCategory({ subCategoryId, name, slug });
    setValidationErrors(result.errors);

    if (!result.isValid || slugExists) {
      return;
    }

    try {
      await updateSubSubCategoryMutation.mutateAsync({
        id: subSubCategoryId,
        data: {
          subCategoryId,
          name,
          slug,
        },
      });
      onClose();
    } catch (error) {
      console.error("Error updating sub-sub-category:", error);
    }
  };

  const subCategoryIdError = getFieldError("subCategoryId", validationErrors);
  const nameError = getFieldError("name", validationErrors);
  const slugError = getFieldError("slug", validationErrors);

  const isFormValid = !subCategoryIdError && !nameError && !slugError && !slugExists && subCategoryId && name && slug;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Sub-Sub-Category</DialogTitle>
          <DialogDescription>
            All fields are required. Update the information below to edit the sub-sub-category.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* SubCategory Dropdown */}
          <div className="grid gap-2">
            <Label htmlFor="subCategoryId">
              Sub Category <span className="text-red-500">*</span>
            </Label>
            <Popover open={subCategoryOpen} onOpenChange={setSubCategoryOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={subCategoryOpen}
                  className={cn(
                    "w-full justify-between",
                    !subCategoryId && "text-muted-foreground",
                    subCategoryIdError && "border-red-500"
                  )}
                >
                  {subCategoryId ? subCategoryName : "Select sub category..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[460px] p-0">
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder="Search sub category..."
                    value={subCategorySearch}
                    onValueChange={setSubCategorySearch}
                  />
                  <CommandList>
                    <CommandEmpty>No sub category found.</CommandEmpty>
                    <CommandGroup>
                      {subCategories.map((subCategory) => (
                        <CommandItem
                          key={subCategory.id}
                          value={`${subCategory.name} ${subCategory.slug}`}
                          onSelect={() => {
                            setSubCategoryId(subCategory.id);
                            setSubCategoryName(subCategory.name || "");
                            setSubCategoryOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              subCategoryId === subCategory.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div className="flex flex-col">
                            <span>{subCategory.name}</span>
                            <span className="text-xs text-muted-foreground">{subCategory.slug}</span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {subCategoryIdError && (
              <div className="flex items-center gap-1 text-sm text-red-500">
                <AlertCircle className="h-3 w-3" />
                <span>{subCategoryIdError}</span>
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
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter sub-sub-category name"
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
                placeholder="Enter sub-sub-category slug"
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
            disabled={!isFormValid || updateSubSubCategoryMutation.isPending}
          >
            {updateSubSubCategoryMutation.isPending ? "Updating..." : "Update Sub-Sub-Category"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
