import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { FormValidator, ValidationError } from "@/lib/formValidator";
import { useCheckEmail } from "@/hooks/use-User";

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  isLoading: boolean;
}

export function CreateUserModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: CreateUserModalProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<ValidationError[]>([]);
  
  // Check for duplicate email in real-time
  const { data: emailCheckResult, isLoading: isCheckingEmail } = useCheckEmail(
    formData.email,
    isOpen && !!formData.email
  );

  const isDuplicateEmail = emailCheckResult?.exists ?? false;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    setErrors(errors.filter((e) => e.field !== name));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check for duplicate email
    if (isDuplicateEmail) {
      setErrors([{ field: "email", message: "This email is already registered" }]);
      return;
    }

    // Validate form
    const validation = FormValidator.validateCreateUser(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      // Submit without confirmPassword
      const { confirmPassword, ...submitData } = formData;
      await onSubmit(submitData);

      // Reset form on success
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        mobile: "",
        password: "",
        confirmPassword: "",
      });
      setErrors([]);
    } catch (error) {
      console.error("Submit error:", error);
    }
  };

  const getFieldError = (field: string) => {
    return errors.find((e) => e.field === field)?.message;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
          <DialogDescription>
            Add a new user to the system. All fields are required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">
                First Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="firstName"
                name="firstName"
                placeholder="First name"
                value={formData.firstName}
                onChange={handleChange}
                className={getFieldError("firstName") ? "border-destructive" : ""}
              />
              {getFieldError("firstName") && (
                <div className="flex items-center gap-1 text-xs text-destructive">
                  <AlertCircle className="h-3 w-3" />
                  {getFieldError("firstName")}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">
                Last Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="lastName"
                name="lastName"
                placeholder="Last name"
                value={formData.lastName}
                onChange={handleChange}
                className={getFieldError("lastName") ? "border-destructive" : ""}
              />
              {getFieldError("lastName") && (
                <div className="flex items-center gap-1 text-xs text-destructive">
                  <AlertCircle className="h-3 w-3" />
                  {getFieldError("lastName")}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="user@example.com"
                value={formData.email}
                onChange={handleChange}
                className={
                  isDuplicateEmail
                    ? "border-destructive pr-10"
                    : formData.email && !isDuplicateEmail && !isCheckingEmail
                    ? "border-green-600 pr-10"
                    : getFieldError("email")
                    ? "border-destructive pr-10"
                    : "pr-10"
                }
              />
              {isCheckingEmail && formData.email && (
                <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
              )}
              {!isCheckingEmail && isDuplicateEmail && (
                <AlertCircle className="absolute right-3 top-2.5 h-4 w-4 text-destructive" />
              )}
              {!isCheckingEmail && formData.email && !isDuplicateEmail && !getFieldError("email") && (
                <CheckCircle2 className="absolute right-3 top-2.5 h-4 w-4 text-green-600" />
              )}
            </div>
            {isDuplicateEmail && (
              <div className="flex items-center gap-1 text-xs text-destructive">
                <AlertCircle className="h-3 w-3" />
                This email is already registered
              </div>
            )}
            {getFieldError("email") && !isDuplicateEmail && (
              <div className="flex items-center gap-1 text-xs text-destructive">
                <AlertCircle className="h-3 w-3" />
                {getFieldError("email")}
              </div>
            )}
            {!isCheckingEmail && formData.email && !isDuplicateEmail && !getFieldError("email") && (
              <div className="flex items-center gap-1 text-xs text-green-600">
                <CheckCircle2 className="h-3 w-3" />
                Email is available
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="mobile">
              Mobile <span className="text-destructive">*</span>
            </Label>
            <Input
              id="mobile"
              name="mobile"
              placeholder="+1 (555) 123-4567"
              value={formData.mobile}
              onChange={handleChange}
              className={getFieldError("mobile") ? "border-destructive" : ""}
            />
            {getFieldError("mobile") && (
              <div className="flex items-center gap-1 text-xs text-destructive">
                <AlertCircle className="h-3 w-3" />
                {getFieldError("mobile")}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              Password <span className="text-destructive">*</span>
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="At least 6 characters"
              value={formData.password}
              onChange={handleChange}
              className={getFieldError("password") ? "border-destructive" : ""}
            />
            {getFieldError("password") && (
              <div className="flex items-center gap-1 text-xs text-destructive">
                <AlertCircle className="h-3 w-3" />
                {getFieldError("password")}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">
              Confirm Password <span className="text-destructive">*</span>
            </Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Re-enter password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={getFieldError("confirmPassword") ? "border-destructive" : ""}
            />
            {getFieldError("confirmPassword") && (
              <div className="flex items-center gap-1 text-xs text-destructive">
                <AlertCircle className="h-3 w-3" />
                {getFieldError("confirmPassword")}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || isDuplicateEmail || isCheckingEmail}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create User
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
