import { ValidationError, ValidationResult } from "@/lib/formValidator";

export class FormValidator {
  static validateCreateFaq(data: any): ValidationResult {
    const errors: ValidationError[] = [];

    // Tenant ID
    if (!data.tenantId?.trim()) {
      errors.push({ field: "tenantId", message: "Tenant is required" });
    }

    // Title
    if (!data.title?.trim()) {
      errors.push({ field: "title", message: "Title is required" });
    } else if (data.title.trim().length < 5) {
      errors.push({ field: "title", message: "Title must be at least 5 characters" });
    }

    // Answer
    if (!data.answer?.trim()) {
      errors.push({ field: "answer", message: "Answer is required" });
    } else if (data.answer.trim().length < 10) {
      errors.push({ field: "answer", message: "Answer must be at least 10 characters" });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static validateUpdateFaq(data: any): ValidationResult {
    const errors: ValidationError[] = [];

    // Tenant ID - only validate if provided
    if (data.tenantId !== undefined && data.tenantId !== null) {
      if (!data.tenantId.trim()) {
        errors.push({ field: "tenantId", message: "Tenant is required" });
      }
    }

    // Title - only validate if provided
    if (data.title !== undefined && data.title !== null) {
      if (!data.title.trim()) {
        errors.push({ field: "title", message: "Title is required" });
      } else if (data.title.trim().length < 5) {
        errors.push({ field: "title", message: "Title must be at least 5 characters" });
      }
    }

    // Answer - only validate if provided
    if (data.answer !== undefined && data.answer !== null) {
      if (!data.answer.trim()) {
        errors.push({ field: "answer", message: "Answer is required" });
      } else if (data.answer.trim().length < 10) {
        errors.push({ field: "answer", message: "Answer must be at least 10 characters" });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
