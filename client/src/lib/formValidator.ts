export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export const getFieldError = (field: string, errors: ValidationError[]): string | undefined => {
    return errors.find((e) => e.field === field)?.message;
  }





