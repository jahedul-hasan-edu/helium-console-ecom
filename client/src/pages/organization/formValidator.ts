import { ValidationError } from "@/lib/formValidator";
import { CreateOrganizationRequest, UpdateOrganizationRequest } from "@/models/Organization";
import { IMAGE_CONFIG, ORGANIZATION_FORM } from ".";

const PHONE_REGEX = /^[0-9+()\-\s]{7,20}$/;

function isValidUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function pushRequiredStringError(
  errors: ValidationError[],
  field: string,
  value: string | undefined,
  message: string,
  maxLengthMessage?: string
) {
  if (!value || value.trim() === "") {
    errors.push({ field, message });
    return;
  }

  if (maxLengthMessage && value.trim().length > 255) {
    errors.push({ field, message: maxLengthMessage });
  }
}

function pushUrlError(
  errors: ValidationError[],
  field: string,
  value: string | undefined,
  requiredMessage: string,
  isUpdate: boolean
) {
  if (!value || value.trim() === "") {
    if (!isUpdate || value !== undefined) {
      errors.push({ field, message: requiredMessage });
    }
    return;
  }

  if (!isValidUrl(value.trim())) {
    errors.push({ field, message: ORGANIZATION_FORM.VALIDATION.URL_INVALID });
  }
}

function validateCommonOrganizationFields(
  data: Partial<CreateOrganizationRequest & UpdateOrganizationRequest>,
  isUpdate: boolean
) {
  const errors: ValidationError[] = [];

  if (!isUpdate || data.tenantId !== undefined) {
    if (!data.tenantId || data.tenantId.trim() === "") {
      errors.push({ field: "tenantId", message: ORGANIZATION_FORM.VALIDATION.TENANT_REQUIRED });
    }
  }

  if (!isUpdate || data.title !== undefined) {
    pushRequiredStringError(
      errors,
      "title",
      data.title,
      ORGANIZATION_FORM.VALIDATION.TITLE_REQUIRED,
      ORGANIZATION_FORM.VALIDATION.TITLE_MAX_LENGTH
    );
  }

  if (!isUpdate || data.logoTitle !== undefined) {
    pushRequiredStringError(
      errors,
      "logoTitle",
      data.logoTitle,
      ORGANIZATION_FORM.VALIDATION.LOGO_TITLE_REQUIRED,
      ORGANIZATION_FORM.VALIDATION.LOGO_TITLE_MAX_LENGTH
    );
  }

  if (!isUpdate || data.phone !== undefined) {
    if (!data.phone || data.phone.trim() === "") {
      errors.push({ field: "phone", message: ORGANIZATION_FORM.VALIDATION.PHONE_REQUIRED });
    } else if (!PHONE_REGEX.test(data.phone.trim())) {
      errors.push({ field: "phone", message: ORGANIZATION_FORM.VALIDATION.PHONE_INVALID });
    }
  }

  if (!isUpdate || data.email !== undefined) {
    if (!data.email || data.email.trim() === "") {
      errors.push({ field: "email", message: ORGANIZATION_FORM.VALIDATION.EMAIL_REQUIRED });
    } else if (!/^\S+@\S+\.\S+$/.test(data.email.trim())) {
      errors.push({ field: "email", message: ORGANIZATION_FORM.VALIDATION.EMAIL_INVALID });
    }
  }

  if (!isUpdate || data.address !== undefined) {
    pushRequiredStringError(errors, "address", data.address, ORGANIZATION_FORM.VALIDATION.ADDRESS_REQUIRED);
  }

  if (!isUpdate || data.license !== undefined) {
    pushRequiredStringError(errors, "license", data.license, ORGANIZATION_FORM.VALIDATION.LICENSE_REQUIRED);
  }

  if (!isUpdate || data.privacyPolicy !== undefined) {
    pushRequiredStringError(
      errors,
      "privacyPolicy",
      data.privacyPolicy,
      ORGANIZATION_FORM.VALIDATION.PRIVACY_POLICY_REQUIRED
    );
  }

  if (!isUpdate || data.returnPolicy !== undefined) {
    pushRequiredStringError(
      errors,
      "returnPolicy",
      data.returnPolicy,
      ORGANIZATION_FORM.VALIDATION.RETURN_POLICY_REQUIRED
    );
  }

  pushUrlError(errors, "socialFbUrl", data.socialFbUrl, ORGANIZATION_FORM.VALIDATION.SOCIAL_FB_REQUIRED, isUpdate);
  pushUrlError(errors, "socialInUrl", data.socialInUrl, ORGANIZATION_FORM.VALIDATION.SOCIAL_IN_REQUIRED, isUpdate);
  pushUrlError(errors, "socialXUrl", data.socialXUrl, ORGANIZATION_FORM.VALIDATION.SOCIAL_X_REQUIRED, isUpdate);
  pushUrlError(
    errors,
    "socialUtubeUrl",
    data.socialUtubeUrl,
    ORGANIZATION_FORM.VALIDATION.SOCIAL_UTUBE_REQUIRED,
    isUpdate
  );

  if (data.image) {
    errors.push(...FormValidator.validateImage(data.image));
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export const FormValidator = {
  validateCreateOrganization(data: Partial<CreateOrganizationRequest>) {
    return validateCommonOrganizationFields(data, false);
  },

  validateUpdateOrganization(data: Partial<UpdateOrganizationRequest>) {
    return validateCommonOrganizationFields(data, true);
  },

  validateImage(file: File) {
    const errors: ValidationError[] = [];

    if (!IMAGE_CONFIG.ACCEPTED_FORMATS.includes(file.type as typeof IMAGE_CONFIG.ACCEPTED_FORMATS[number])) {
      errors.push({
        field: "image",
        message: ORGANIZATION_FORM.VALIDATION.IMAGE_INVALID_TYPE,
      });
    }

    if (file.size > IMAGE_CONFIG.MAX_FILE_SIZE_MB * 1024 * 1024) {
      errors.push({
        field: "image",
        message: ORGANIZATION_FORM.VALIDATION.IMAGE_TOO_LARGE,
      });
    }

    return errors;
  },
};