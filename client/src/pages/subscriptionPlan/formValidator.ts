import { ValidationError, ValidationResult } from "@/lib/formValidator";

export class FormValidator {
  static validateCreateSubscriptionPlan(data: any): ValidationResult {
    const errors: ValidationError[] = [];

    // Name
    if (!data.name?.trim()) {
      errors.push({ field: "name", message: "Plan name is required" });
    }

    // Price
    if (!data.price?.trim()) {
      errors.push({ field: "price", message: "Price is required" });
    } else if (!this.isValidPrice(data.price)) {
      errors.push({ field: "price", message: "Please enter a valid price" });
    }

    // Duration Days
    if (!data.durationDays) {
      errors.push({ field: "durationDays", message: "Duration days is required" });
    } else if (isNaN(parseInt(data.durationDays)) || parseInt(data.durationDays) <= 0) {
      errors.push({
        field: "durationDays",
        message: "Duration days must be a positive number",
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static validateUpdateSubscriptionPlan(data: any): ValidationResult {
    const errors: ValidationError[] = [];

    // Name
    if (!data.name?.trim()) {
      errors.push({ field: "name", message: "Plan name is required" });
    }

    // Price
    if (!data.price?.trim()) {
      errors.push({ field: "price", message: "Price is required" });
    } else if (!this.isValidPrice(data.price)) {
      errors.push({ field: "price", message: "Please enter a valid price" });
    }

    // Duration Days
    if (!data.durationDays) {
      errors.push({ field: "durationDays", message: "Duration days is required" });
    } else if (isNaN(parseInt(data.durationDays)) || parseInt(data.durationDays) <= 0) {
      errors.push({
        field: "durationDays",
        message: "Duration days must be a positive number",
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private static isValidPrice(price: string): boolean {
    const priceRegex = /^\d+(\.\d{1,2})?$/;
    return priceRegex.test(price);
  }
}
