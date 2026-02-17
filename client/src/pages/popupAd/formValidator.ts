import { ERROR_MESSAGES } from "@/pages/popupAd";
import { CreatePopupAdRequest, UpdatePopupAdRequest } from "@/models/PopupAd";

export interface ValidationError {
  field: string;
  message: string;
}

export class FormValidator {
  /**
   * Validate create popup ad form
   */
  static validateCreatePopupAd(data: Partial<CreatePopupAdRequest>): ValidationError[] {
    const errors: ValidationError[] = [];

    // Title validation
    if (!data.title || data.title.trim() === "") {
      errors.push({ field: "title", message: ERROR_MESSAGES.invalidTitle });
    } else if (data.title.trim().length < 1) {
      errors.push({ field: "title", message: "Title must be at least 1 character" });
    } else if (data.title.trim().length > 255) {
      errors.push({ field: "title", message: "Title must be less than 255 characters" });
    }

    // Tenant validation
    if (!data.tenantId || data.tenantId.trim() === "") {
      errors.push({ field: "tenantId", message: ERROR_MESSAGES.invalidTenant });
    }

    // Optional: Image validation
    if (data.image) {
      const imageErrors = this.validateImage(data.image);
      errors.push(...imageErrors);
    }

    return errors;
  }

  /**
   * Validate update popup ad form
   */
  static validateUpdatePopupAd(data: Partial<UpdatePopupAdRequest>): ValidationError[] {
    const errors: ValidationError[] = [];

    // Title validation (if provided)
    if (data.title !== undefined && data.title.trim() === "") {
      errors.push({ field: "title", message: ERROR_MESSAGES.invalidTitle });
    } else if (data.title && data.title.trim().length > 255) {
      errors.push({ field: "title", message: "Title must be less than 255 characters" });
    }

    // Tenant validation (if provided)
    if (data.tenantId !== undefined && data.tenantId.trim() === "") {
      errors.push({ field: "tenantId", message: ERROR_MESSAGES.invalidTenant });
    }

    // Optional: Image validation
    if (data.image) {
      const imageErrors = this.validateImage(data.image);
      errors.push(...imageErrors);
    }

    return errors;
  }

  /**
   * Validate image file
   */
  static validateImage(file: File): ValidationError[] {
    const errors: ValidationError[] = [];
    const maxSizeInMB = 1;
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    const allowedFormats = ["image/jpeg", "image/png", "image/webp"];

    // Check file size
    if (file.size > maxSizeInBytes) {
      errors.push({
        field: "image",
        message: `${ERROR_MESSAGES.imageSizeLimit} (Current: ${(file.size / 1024 / 1024).toFixed(2)}MB)`,
      });
    }

    // Check file format
    if (!allowedFormats.includes(file.type)) {
      errors.push({
        field: "image",
        message: ERROR_MESSAGES.imageFormatError,
      });
    }

    // Check file name
    if (!file.name) {
      errors.push({
        field: "image",
        message: "Invalid file",
      });
    }

    return errors;
  }
}

/**
 * Helper function to get error message for a field
 */
export function getFieldError(field: string, errors: ValidationError[]): string | null {
  const error = errors.find((e) => e.field === field);
  return error ? error.message : null;
}
