import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateCategory, useCheckCategorySlug, useCategory } from "@/hooks/use-Category";
import { useMainCategories } from "@/hooks/use-MainCategory";
import { getFieldError, ValidationError } from "@/lib/formValidator";
import { AlertCircle, Check, ChevronsUpDown } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { validateUpdateCategory } from "./formValidator";

interface EditCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryId: string;
}

export function EditCategoryModal({ isOpen, onClose, categoryId }: EditCategoryModalProps) {
  const [mainCategoryId, setMainCategoryId] = useState("");
  const [mainCategoryName, setMainCategoryName] = useState("");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [slugExists, setSlugExists] = useState(false);
  const [originalSlug, setOriginalSlug] = useState("");
  const [mainCategorySearch, setMainCategorySearch] = useState("");
  const [mainCategoryOpen, setMainCategoryOpen] = useState(false);

  const { data: category } = useCategory(categoryId);
  const updateCategoryMutation = useUpdateCategory();
  const checkSlugMutation = useCheckCategorySlug();

  // Fetch main categories with search
  const { data: mainCategoriesData } = useMainCategories({
    search: mainCategorySearch,
    pageSize: 50,
  });

  const mainCategories = mainCategoriesData?.items || [];

  useEffect(() => {
    if (isOpen && category) {
      setMainCategoryId(category.mainCategoryId || "");
      setMainCategoryName(category.mainCategoryName || "");
      setName(category.name || "");
      setSlug(category.slug || "");
      setOriginalSlug(category.slug || "");
      setValidationErrors([]);
      setSlugExists(false);
      setMainCategorySearch("");
    }
  }, [isOpen, category]);

  // Update main category name when main categories are loaded
  useEffect(() => {
    if (mainCategoryId && mainCategories.length > 0) {
      const mainCategory = mainCategories.find((mc) => mc.id === mainCategoryId);
      if (mainCategory && !mainCategoryName) {
        setMainCategoryName(mainCategory.name || "");
      }
    }
  }, [mainCategories, mainCategoryId]);

  // Reactive validation
  useEffect(() => {
    const result = validateUpdateCategory({ mainCategoryId, name, slug });
    setValidationErrors(result.errors);
  }, [mainCategoryId, name, slug]);

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
    const result = validateUpdateCategory({ mainCategoryId, name, slug });
    setValidationErrors(result.errors);

    if (!result.isValid || slugExists) {
      return;
    }

    try {
      await updateCategoryMutation.mutateAsync({
        id: categoryId,
        data: {
          mainCategoryId,
          name,
          slug,
        },
      });
      onClose();
    } catch (error) {
      console.error("Error updating category:", error);
    }
  };

  const mainCategoryIdError = getFieldError("mainCategoryId", validationErrors);
  const nameError = getFieldError("name", validationErrors);
  const slugError = getFieldError("slug", validationErrors);

  const isFormValid = !mainCategoryIdError && !nameError && !slugError && !slugExists && mainCategoryId && name && slug;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Category</DialogTitle>
          <DialogDescription>
            All fields are required. Update the information below to edit the category.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Main Category Dropdown */}
          <div className="grid gap-2">
            <Label htmlFor="mainCategoryId">
              Main Category <span className="text-red-500">*</span>
            </Label>
            <Popover open={mainCategoryOpen} onOpenChange={setMainCategoryOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={mainCategoryOpen}
                  className={cn(
                    "w-full justify-between",
                    !mainCategoryId && "text-muted-foreground",
                    mainCategoryIdError && "border-red-500"
                  )}
                >
                  {mainCategoryId ? mainCategoryName : "Select main category..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[460px] p-0">
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder="Search main category..."
                    value={mainCategorySearch}
                    onValueChange={setMainCategorySearch}
                  />
                  <CommandList>
                    <CommandEmpty>No main category found.</CommandEmpty>
                    <CommandGroup>
                      {mainCategories.map((mainCategory) => (
                        <CommandItem
                          key={mainCategory.id}
                          value={mainCategory.id}
                          onSelect={() => {
                            setMainCategoryId(mainCategory.id);
                            setMainCategoryName(mainCategory.name || "");
                            setMainCategoryOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              mainCategoryId === mainCategory.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div className="flex flex-col">
                            <span>{mainCategory.name}</span>
                            <span className="text-xs text-muted-foreground">{mainCategory.slug}</span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {mainCategoryIdError && (
              <div className="flex items-center gap-1 text-sm text-red-500">
                <AlertCircle className="h-3 w-3" />
                <span>{mainCategoryIdError}</span>
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
                placeholder="Enter category name"
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
                placeholder="Enter category slug"
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
            disabled={!isFormValid || updateCategoryMutation.isPending}
          >
            {updateCategoryMutation.isPending ? "Updating..." : "Update Category"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
