import { ValidationError } from "@/lib/formValidator";
import { CreateOrderRequest, UpdateOrderRequest } from "@/models/Order";
import { ORDER_FORM } from ".";

const PHONE_REGEX = /^[0-9+()\-\s]{7,20}$/;

function pushLengthError(errors: ValidationError[], field: string, value?: string) {
  if (value && value.trim().length > 500) {
    errors.push({
      field,
      message: ORDER_FORM.VALIDATION.FIELD_TOO_LONG,
    });
  }
}

function validateCommonOrderFields(
  data: Partial<CreateOrderRequest & UpdateOrderRequest>,
  isUpdate: boolean
) {
  const errors: ValidationError[] = [];

  if (!isUpdate || data.tenantId !== undefined) {
    if (!data.tenantId || data.tenantId.trim() === "") {
      errors.push({ field: "tenantId", message: ORDER_FORM.VALIDATION.TENANT_REQUIRED });
    }
  }

  if (!isUpdate || data.status !== undefined) {
    if (!data.status || data.status.trim() === "") {
      errors.push({ field: "status", message: ORDER_FORM.VALIDATION.STATUS_REQUIRED });
    } else if (data.status.trim().length > 50) {
      errors.push({ field: "status", message: ORDER_FORM.VALIDATION.STATUS_TOO_LONG });
    }
  }

  if (data.email && data.email.trim() !== "" && !/^\S+@\S+\.\S+$/.test(data.email.trim())) {
    errors.push({ field: "email", message: ORDER_FORM.VALIDATION.EMAIL_INVALID });
  }

  if (data.mobile && data.mobile.trim() !== "" && !PHONE_REGEX.test(data.mobile.trim())) {
    errors.push({ field: "mobile", message: ORDER_FORM.VALIDATION.MOBILE_INVALID });
  }

  pushLengthError(errors, "address", data.address);
  pushLengthError(errors, "deliveryTime", data.deliveryTime);
  pushLengthError(errors, "timeZone", data.timeZone);

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export const FormValidator = {
  validateCreateOrder(data: Partial<CreateOrderRequest>) {
    return validateCommonOrderFields(data, false);
  },

  validateUpdateOrder(data: Partial<UpdateOrderRequest>) {
    return validateCommonOrderFields(data, true);
  },
};