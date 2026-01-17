import { ValidationError, ValidationResult } from "@/lib/formValidator";

// Product Validation
export const validateCreateProduct = (data: {
  subCategoryId: string;
  subSubCategoryId: string;
  name: string;
  description: string;
  price: string;
  stock: number;
  isActive: boolean;
}): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!data.subCategoryId || data.subCategoryId.trim() === "") {
    errors.push({ field: "subCategoryId", message: "Sub category is required" });
  }

  if (!data.subSubCategoryId || data.subSubCategoryId.trim() === "") {
    errors.push({ field: "subSubCategoryId", message: "Sub sub category is required" });
  }

  if (!data.name || data.name.trim() === "") {
    errors.push({ field: "name", message: "Name is required" });
  }

  if (!data.description || data.description.trim() === "") {
    errors.push({ field: "description", message: "Description is required" });
  }

  if (!data.price || data.price.trim() === "") {
    errors.push({ field: "price", message: "Price is required" });
  } else if (isNaN(Number(data.price)) || Number(data.price) < 0) {
    errors.push({ field: "price", message: "Price must be a positive number" });
  }

  if (data.stock === undefined || data.stock === null) {
    errors.push({ field: "stock", message: "Stock is required" });
  } else if (!Number.isInteger(data.stock) || data.stock < 0) {
    errors.push({ field: "stock", message: "Stock must be a positive integer" });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateUpdateProduct = (data: {
  subCategoryId?: string;
  subSubCategoryId?: string;
  name?: string;
  description?: string;
  price?: string;
  stock?: number;
  isActive?: boolean;
}): ValidationResult => {
  const errors: ValidationError[] = [];

  if (data.subCategoryId !== undefined && data.subCategoryId.trim() === "") {
    errors.push({ field: "subCategoryId", message: "Sub category cannot be empty" });
  }

  if (data.subSubCategoryId !== undefined && data.subSubCategoryId.trim() === "") {
    errors.push({ field: "subSubCategoryId", message: "Sub sub category cannot be empty" });
  }

  if (data.name !== undefined && data.name.trim() === "") {
    errors.push({ field: "name", message: "Name cannot be empty" });
  }

  if (data.description !== undefined && data.description.trim() === "") {
    errors.push({ field: "description", message: "Description cannot be empty" });
  }

  if (data.price !== undefined) {
    if (data.price.trim() === "") {
      errors.push({ field: "price", message: "Price cannot be empty" });
    } else if (isNaN(Number(data.price)) || Number(data.price) < 0) {
      errors.push({ field: "price", message: "Price must be a positive number" });
    }
  }

  if (data.stock !== undefined && (!Number.isInteger(data.stock) || data.stock < 0)) {
    errors.push({ field: "stock", message: "Stock must be a positive integer" });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};