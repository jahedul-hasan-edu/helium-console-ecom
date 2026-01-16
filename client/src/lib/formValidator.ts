export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export const getFieldError = (field: string, errors: ValidationError[]): string | undefined => {
    return errors.find((e) => e.field === field)?.message;
  }

// Category Validation
export const validateCreateCategory = (data: { mainCategoryId: string; name: string; slug: string }): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!data.mainCategoryId || data.mainCategoryId.trim() === "") {
    errors.push({ field: "mainCategoryId", message: "Main category is required" });
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

export const validateUpdateCategory = (data: { mainCategoryId?: string; name?: string; slug?: string }): ValidationResult => {
  const errors: ValidationError[] = [];

  if (data.mainCategoryId !== undefined && data.mainCategoryId.trim() === "") {
    errors.push({ field: "mainCategoryId", message: "Main category cannot be empty" });
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
