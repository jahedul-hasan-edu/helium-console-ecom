import { ValidationError, ValidationResult } from "@/lib/formValidator";

export class FormValidator {
  static validateCreateTenant(data: any): ValidationResult {
    const errors: ValidationError[] = [];

    // Name
    if (!data.name?.trim()) {
      errors.push({ field: "name", message: "Name is required" });
    } else if (data.name.trim().length < 2) {
      errors.push({ field: "name", message: "Name must be at least 2 characters" });
    } else if (data.name.trim().length > 100) {
      errors.push({ field: "name", message: "Name must not exceed 100 characters" });
    }

    // Domain (optional)
    if (data.domain?.trim()) {
      if (data.domain.trim().length < 3) {
        errors.push({ field: "domain", message: "Domain must be at least 3 characters" });
      } else if (data.domain.trim().length > 100) {
        errors.push({ field: "domain", message: "Domain must not exceed 100 characters" });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static validateUpdateTenant(data: any): ValidationResult {
    const errors: ValidationError[] = [];

    // Name
    if (data.name !== undefined) {
      if (!data.name?.trim()) {
        errors.push({ field: "name", message: "Name is required" });
      } else if (data.name.trim().length < 2) {
        errors.push({ field: "name", message: "Name must be at least 2 characters" });
      } else if (data.name.trim().length > 100) {
        errors.push({ field: "name", message: "Name must not exceed 100 characters" });
      }
    }

    // Domain (optional)
    if (data.domain?.trim()) {
      if (data.domain.trim().length < 3) {
        errors.push({ field: "domain", message: "Domain must be at least 3 characters" });
      } else if (data.domain.trim().length > 100) {
        errors.push({ field: "domain", message: "Domain must not exceed 100 characters" });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}