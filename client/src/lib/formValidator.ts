export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export class FormValidator {
  static validateCreateUser(data: any): ValidationResult {
    const errors: ValidationError[] = [];

    // First Name
    if (!data.firstName?.trim()) {
      errors.push({ field: "firstName", message: "First name is required" });
    }

    // Last Name
    if (!data.lastName?.trim()) {
      errors.push({ field: "lastName", message: "Last name is required" });
    }

    // Email
    if (!data.email?.trim()) {
      errors.push({ field: "email", message: "Email is required" });
    } else if (!this.isValidEmail(data.email)) {
      errors.push({ field: "email", message: "Please enter a valid email" });
    }

    // Mobile
    if (!data.mobile?.trim()) {
      errors.push({ field: "mobile", message: "Mobile is required" });
    } else if (!this.isValidMobile(data.mobile)) {
      errors.push({ field: "mobile", message: "Please enter a valid mobile number" });
    }

    // Password
    if (!data.password?.trim()) {
      errors.push({ field: "password", message: "Password is required" });
    } else if (data.password.length < 6) {
      errors.push({ field: "password", message: "Password must be at least 6 characters" });
    }

    // Confirm Password
    if (!data.confirmPassword?.trim()) {
      errors.push({ field: "confirmPassword", message: "Please confirm your password" });
    } else if (data.password !== data.confirmPassword) {
      errors.push({ field: "confirmPassword", message: "Passwords do not match" });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static validateUpdateUser(data: any): ValidationResult {
    const errors: ValidationError[] = [];

    // First Name
    if (!data.firstName?.trim()) {
      errors.push({ field: "firstName", message: "First name is required" });
    }

    // Last Name
    if (!data.lastName?.trim()) {
      errors.push({ field: "lastName", message: "Last name is required" });
    }

    // Mobile
    if (!data.mobile?.trim()) {
      errors.push({ field: "mobile", message: "Mobile is required" });
    } else if (!this.isValidMobile(data.mobile)) {
      errors.push({ field: "mobile", message: "Please enter a valid mobile number" });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private static isValidMobile(mobile: string): boolean {
    const mobileRegex = /^[0-9\-\+\s\(\)]+$/;
    return mobileRegex.test(mobile) && mobile.replace(/\D/g, "").length >= 10;
  }

  static getFieldError(field: string, errors: ValidationError[]): string | undefined {
    return errors.find((e) => e.field === field)?.message;
  }
}
