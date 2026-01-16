import { ValidationError, ValidationResult } from "@/lib/formValidator";

export class FormValidator {
static validateCreateMainCategory(data: any): ValidationResult {
    const errors: ValidationError[] = [];

    // Name (required)
    if (!data.name?.trim()) {
      errors.push({ field: "name", message: "Name is required" });
    } else if (data.name.trim().length < 2) {
      errors.push({ field: "name", message: "Name must be at least 2 characters" });
    } else if (data.name.trim().length > 100) {
      errors.push({ field: "name", message: "Name must not exceed 100 characters" });
    }

    // Slug (required)
    if (!data.slug?.trim()) {
      errors.push({ field: "slug", message: "Slug is required" });
    } else if (data.slug.trim().length < 2) {
      errors.push({ field: "slug", message: "Slug must be at least 2 characters" });
    } else if (data.slug.trim().length > 100) {
      errors.push({ field: "slug", message: "Slug must not exceed 100 characters" });
    }

    // Order Index (required)
    if (data.orderIndex === undefined || data.orderIndex === "") {
      errors.push({ field: "orderIndex", message: "Order index is required" });
    } else {
      const orderIndex = parseInt(data.orderIndex, 10);
      if (isNaN(orderIndex)) {
        errors.push({ field: "orderIndex", message: "Order index must be a number" });
      } else if (orderIndex < 0) {
        errors.push({ field: "orderIndex", message: "Order index must be 0 or greater" });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static validateUpdateMainCategory(data: any): ValidationResult {
    const errors: ValidationError[] = [];

    // Name (required)
    if (!data.name?.trim()) {
      errors.push({ field: "name", message: "Name is required" });
    } else if (data.name.trim().length < 2) {
      errors.push({ field: "name", message: "Name must be at least 2 characters" });
    } else if (data.name.trim().length > 100) {
      errors.push({ field: "name", message: "Name must not exceed 100 characters" });
    }

    // Slug (required)
    if (!data.slug?.trim()) {
      errors.push({ field: "slug", message: "Slug is required" });
    } else if (data.slug.trim().length < 2) {
      errors.push({ field: "slug", message: "Slug must be at least 2 characters" });
    } else if (data.slug.trim().length > 100) {
      errors.push({ field: "slug", message: "Slug must not exceed 100 characters" });
    }

    // Order Index (required)
    if (data.orderIndex === undefined || data.orderIndex === "") {
      errors.push({ field: "orderIndex", message: "Order index is required" });
    } else {
      const orderIndex = parseInt(data.orderIndex, 10);
      if (isNaN(orderIndex)) {
        errors.push({ field: "orderIndex", message: "Order index must be a number" });
      } else if (orderIndex < 0) {
        errors.push({ field: "orderIndex", message: "Order index must be 0 or greater" });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}