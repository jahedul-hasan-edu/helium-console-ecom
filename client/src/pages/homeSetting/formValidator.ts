import { ValidationError } from "@/lib/formValidator";
import { HOME_SETTING_FORM } from ".";

export const FormValidator = {
  validateCreateHomeSetting(data: any): { isValid: boolean; errors: ValidationError[] } {
    const errors: ValidationError[] = [];

    // Tenant ID validation
    if (!data.tenantId) {
      errors.push({
        field: "tenantId",
        message: HOME_SETTING_FORM.VALIDATION.TENANT_REQUIRED,
      });
    }

    // Title validation
    if (!data.title || data.title.trim() === "") {
      errors.push({
        field: "title",
        message: HOME_SETTING_FORM.VALIDATION.TITLE_REQUIRED,
      });
    } else if (data.title.length < 1) {
      errors.push({
        field: "title",
        message: HOME_SETTING_FORM.VALIDATION.TITLE_MIN_LENGTH,
      });
    }

    // Subtitle validation
    if (!data.subTitle || data.subTitle.trim() === "") {
      errors.push({
        field: "subTitle",
        message: HOME_SETTING_FORM.VALIDATION.SUBTITLE_REQUIRED,
      });
    } else if (data.subTitle.length < 1) {
      errors.push({
        field: "subTitle",
        message: HOME_SETTING_FORM.VALIDATION.SUBTITLE_MIN_LENGTH,
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  validateUpdateHomeSetting(data: any): { isValid: boolean; errors: ValidationError[] } {
    const errors: ValidationError[] = [];

    // Title validation (if provided)
    if (data.title !== undefined && data.title !== null && data.title.trim() === "") {
      errors.push({
        field: "title",
        message: HOME_SETTING_FORM.VALIDATION.TITLE_REQUIRED,
      });
    } else if (data.title && data.title.length < 1) {
      errors.push({
        field: "title",
        message: HOME_SETTING_FORM.VALIDATION.TITLE_MIN_LENGTH,
      });
    }

    // Subtitle validation (if provided)
    if (data.subTitle !== undefined && data.subTitle !== null && data.subTitle.trim() === "") {
      errors.push({
        field: "subTitle",
        message: HOME_SETTING_FORM.VALIDATION.SUBTITLE_REQUIRED,
      });
    } else if (data.subTitle && data.subTitle.length < 1) {
      errors.push({
        field: "subTitle",
        message: HOME_SETTING_FORM.VALIDATION.SUBTITLE_MIN_LENGTH,
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },
};
