import { ValidationError, ValidationResult } from "@/lib/formValidator";

export class TenantSubscriptionFormValidator {
  static validateCreateTenantSubscription(data: any): ValidationResult {
    const errors: ValidationError[] = [];

    // Tenant ID
    if (!data.tenantId?.trim()) {
      errors.push({ field: "tenantId", message: "Tenant is required" });
    }

    // Plan ID
    if (!data.planId?.trim()) {
      errors.push({ field: "planId", message: "Subscription plan is required" });
    }

    // Start Date
    if (!data.startDate) {
      errors.push({ field: "startDate", message: "Start date is required" });
    }

    // End Date
    if (!data.endDate) {
      errors.push({ field: "endDate", message: "End date is required" });
    }

    // Validate end date is after start date
    if (data.startDate && data.endDate) {
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);
      if (endDate <= startDate) {
        errors.push({
          field: "endDate",
          message: "End date must be after start date",
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static validateUpdateTenantSubscription(data: any): ValidationResult {
    const errors: ValidationError[] = [];

    // Tenant ID (optional for update)
    if (data.tenantId !== undefined && !data.tenantId?.trim()) {
      errors.push({ field: "tenantId", message: "Tenant cannot be empty" });
    }

    // Plan ID (optional for update)
    if (data.planId !== undefined && !data.planId?.trim()) {
      errors.push({ field: "planId", message: "Subscription plan cannot be empty" });
    }

    // Start Date (optional for update)
    if (data.startDate !== undefined && !data.startDate) {
      errors.push({ field: "startDate", message: "Start date cannot be empty" });
    }

    // End Date (optional for update)
    if (data.endDate !== undefined && !data.endDate) {
      errors.push({ field: "endDate", message: "End date cannot be empty" });
    }

    // Validate end date is after start date if both are provided
    if (data.startDate && data.endDate) {
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);
      if (endDate <= startDate) {
        errors.push({
          field: "endDate",
          message: "End date must be after start date",
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
