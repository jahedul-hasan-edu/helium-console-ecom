import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useCreateProduct } from "@/hooks/use-Product";
import { useSubCategories } from "@/hooks/use-SubCategory";
import { useSubSubCategories } from "@/hooks/use-SubSubCategory";
import { validateCreateProduct, getFieldError, ValidationError } from "@/lib/formValidator";
import { AlertCircle, Check, ChevronsUpDown } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface CreateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateProductModal({ isOpen, onClose }: CreateProductModalProps) {
  const [subCategoryId, setSubCategoryId] = useState("");
  const [subCategoryName, setSubCategoryName] = useState("");
  const [subSubCategoryId, setSubSubCategoryId] = useState("");
  const [subSubCategoryName, setSubSubCategoryName] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [subCategorySearch, setSubCategorySearch] = useState("");
  const [subSubCategorySearch, setSubSubCategorySearch] = useState("");
  const [subCategoryOpen, setSubCategoryOpen] = useState(false);
  const [subSubCategoryOpen, setSubSubCategoryOpen] = useState(false);

  const createProductMutation = useCreateProduct();

  // Fetch sub categories with search
  const { data: subCategoriesData } = useSubCategories({
    search: subCategorySearch,
    pageSize: 50,
  });

  // Fetch sub-sub categories with search
  const { data: subSubCategoriesData } = useSubSubCategories({
    search: subSubCategorySearch,
    pageSize: 50,
  });

  const subCategories = subCategoriesData?.items || [];
  const subSubCategories = subSubCategoriesData?.items || [];

  useEffect(() => {
    if (isOpen) {
      setSubCategoryId("");
      setSubCategoryName("");
      setSubSubCategoryId("");
      setSubSubCategoryName("");
      setName("");
      setDescription("");
      setPrice("");
      setStock(0);
      setIsActive(true);
      setValidationErrors([]);
      setSubCategorySearch("");
      setSubSubCategorySearch("");
    }
  }, [isOpen]);

  const validateField = () => {
    const result = validateCreateProduct({
      subCategoryId,
      subSubCategoryId,
      name,
      description,
      price,
      stock,
      isActive,
    });
    setValidationErrors(result.errors);
  };

  const handleSubmit = async () => {
    const result = validateCreateProduct({
      subCategoryId,
      subSubCategoryId,
      name,
      description,
      price,
      stock,
      isActive,
    });
    setValidationErrors(result.errors);

    if (!result.isValid) {
      return;
    }

    try {
      await createProductMutation.mutateAsync({
        subCategoryId,
        subSubCategoryId,
        name,
        description,
        price,
        stock,
        isActive,
      });
      onClose();
    } catch (error) {
      console.error("Error creating product:", error);
    }
  };

  const subCategoryIdError = getFieldError("subCategoryId", validationErrors);
  const subSubCategoryIdError = getFieldError("subSubCategoryId", validationErrors);
  const nameError = getFieldError("name", validationErrors);
  const descriptionError = getFieldError("description", validationErrors);
  const priceError = getFieldError("price", validationErrors);
  const stockError = getFieldError("stock", validationErrors);

  const isFormValid =
    !subCategoryIdError &&
    !subSubCategoryIdError &&
    !nameError &&
    !descriptionError &&
    !priceError &&
    !stockError &&
    subCategoryId &&
    subSubCategoryId &&
    name &&
    description &&
    price &&
    stock >= 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Product</DialogTitle>
          <DialogDescription>
            All fields are required. Fill in the information below to create a new product.
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
              <PopoverContent className="w-[560px] p-0">
                <Command>
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
                          value={subCategory.id}
                          onSelect={() => {
                            setSubCategoryId(subCategory.id);
                            setSubCategoryName(subCategory.name || "");
                            setSubCategoryOpen(false);
                            validateField();
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              subCategoryId === subCategory.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {subCategory.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {subCategoryIdError && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {subCategoryIdError}
              </p>
            )}
          </div>

          {/* SubSubCategory Dropdown */}
          <div className="grid gap-2">
            <Label htmlFor="subSubCategoryId">
              Sub Sub Category <span className="text-red-500">*</span>
            </Label>
            <Popover open={subSubCategoryOpen} onOpenChange={setSubSubCategoryOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={subSubCategoryOpen}
                  className={cn(
                    "w-full justify-between",
                    !subSubCategoryId && "text-muted-foreground",
                    subSubCategoryIdError && "border-red-500"
                  )}
                >
                  {subSubCategoryId ? subSubCategoryName : "Select sub sub category..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[560px] p-0">
                <Command>
                  <CommandInput
                    placeholder="Search sub sub category..."
                    value={subSubCategorySearch}
                    onValueChange={setSubSubCategorySearch}
                  />
                  <CommandList>
                    <CommandEmpty>No sub sub category found.</CommandEmpty>
                    <CommandGroup>
                      {subSubCategories.map((subSubCategory) => (
                        <CommandItem
                          key={subSubCategory.id}
                          value={subSubCategory.id}
                          onSelect={() => {
                            setSubSubCategoryId(subSubCategory.id);
                            setSubSubCategoryName(subSubCategory.name || "");
                            setSubSubCategoryOpen(false);
                            validateField();
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              subSubCategoryId === subSubCategory.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {subSubCategory.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {subSubCategoryIdError && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {subSubCategoryIdError}
              </p>
            )}
          </div>

          {/* Name Field */}
          <div className="grid gap-2">
            <Label htmlFor="name">
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                validateField();
              }}
              placeholder="Enter product name"
              className={nameError ? "border-red-500" : ""}
            />
            {nameError && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {nameError}
              </p>
            )}
          </div>

          {/* Description Field */}
          <div className="grid gap-2">
            <Label htmlFor="description">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                validateField();
              }}
              placeholder="Enter product description"
              className={descriptionError ? "border-red-500" : ""}
              rows={3}
            />
            {descriptionError && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {descriptionError}
              </p>
            )}
          </div>

          {/* Price Field */}
          <div className="grid gap-2">
            <Label htmlFor="price">
              Price <span className="text-red-500">*</span>
            </Label>
            <Input
              id="price"
              type="text"
              value={price}
              onChange={(e) => {
                setPrice(e.target.value);
                validateField();
              }}
              placeholder="0.00"
              className={priceError ? "border-red-500" : ""}
            />
            {priceError && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {priceError}
              </p>
            )}
          </div>

          {/* Stock Field */}
          <div className="grid gap-2">
            <Label htmlFor="stock">
              Stock <span className="text-red-500">*</span>
            </Label>
            <Input
              id="stock"
              type="number"
              value={stock}
              onChange={(e) => {
                setStock(parseInt(e.target.value) || 0);
                validateField();
              }}
              placeholder="0"
              className={stockError ? "border-red-500" : ""}
            />
            {stockError && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {stockError}
              </p>
            )}
          </div>

          {/* IsActive Field */}
          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
            <Label htmlFor="isActive">Active</Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isFormValid || createProductMutation.isPending}
          >
            {createProductMutation.isPending ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
