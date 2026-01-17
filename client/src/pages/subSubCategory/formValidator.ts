import { ValidationError, ValidationResult } from "@/lib/formValidator";

// SubSubCategory Validation
export const validateCreateSubSubCategory = (data: { subCategoryId: string; name: string; slug: string }): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!data.subCategoryId || data.subCategoryId.trim() === "") {
    errors.push({ field: "subCategoryId", message: "Sub category is required" });
  }

  if (!data.name || data.name.trim() === "") {
    errors.push({ field: "name", message: "Name is required" });
  }

  if (!data.slug || data.slug.trim() === "") {
    errors.push({ field: "slug", message: "Slug is required" });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateUpdateSubSubCategory = (data: { subCategoryId?: string; name?: string; slug?: string }): ValidationResult => {
  const errors: ValidationError[] = [];

  if (data.subCategoryId !== undefined && data.subCategoryId.trim() === "") {
    errors.push({ field: "subCategoryId", message: "Sub category cannot be empty" });
  }

  if (data.name !== undefined && data.name.trim() === "") {
    errors.push({ field: "name", message: "Name cannot be empty" });
  }

  if (data.slug !== undefined && data.slug.trim() === "") {
    errors.push({ field: "slug", message: "Slug cannot be empty" });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};