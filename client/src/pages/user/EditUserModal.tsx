import { useState, useEffect } from "react";
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
import { Loader2, AlertCircle } from "lucide-react";
import { User } from "@/models/User";
import { getFieldError, ValidationError } from "@/lib/formValidator";
import { FormValidator } from "./formValidator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRoles } from "@/hooks/use-Role";

type TwoFactorMode = "disabled" | "email" | "app";

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User;
  onSubmit: (data: any) => Promise<void>;
  isLoading: boolean;
  tenantId?: string | null;
}

export function EditUserModal({
  isOpen,
  onClose,
  user,
  onSubmit,
  isLoading,
  tenantId,
}: EditUserModalProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    mobile: "",
    roleId: "",
    twoFactorMode: "disabled" as TwoFactorMode,
  });

  const [errors, setErrors] = useState<ValidationError[]>([]);
  const { data: roles = [] } = useRoles(tenantId, isOpen && !!tenantId);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        mobile: user.mobile || "",
        roleId: user.roleId || "",
        twoFactorMode:
          user.twoFactorMethod === "email"
            ? "email"
            : user.twoFactorMethod === "app"
              ? "app"
              : "disabled",
      });
      setErrors([]);
    }
  }, [user, isOpen]);

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

    // Validate form
    const validation = FormValidator.validateUpdateUser(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      await onSubmit({
        ...formData,
        twoFactorMethod: formData.twoFactorMode === "disabled" ? null : formData.twoFactorMode,
      });
    } catch (error) {
      console.error("Submit error:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update user information. Email and password cannot be changed here.
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
                className={getFieldError("firstName", errors) ? "border-destructive" : ""}
              />
              {getFieldError("firstName", errors) && (
                <div className="flex items-center gap-1 text-xs text-destructive">
                  <AlertCircle className="h-3 w-3" />
                  {getFieldError("firstName", errors)}
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
                className={getFieldError("lastName", errors) ? "border-destructive" : ""}
              />
              {getFieldError("lastName", errors) && (
                <div className="flex items-center gap-1 text-xs text-destructive">
                  <AlertCircle className="h-3 w-3" />
                  {getFieldError("lastName", errors)}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-muted-foreground">
              Email (Read-only)
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={user?.email || ""}
              disabled
              className="bg-muted"
            />
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
              className={getFieldError("mobile", errors) ? "border-destructive" : ""}
            />
            {getFieldError("mobile", errors) && (
              <div className="flex items-center gap-1 text-xs text-destructive">
                <AlertCircle className="h-3 w-3" />
                {getFieldError("mobile", errors)}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>
              Role <span className="text-destructive">*</span>
            </Label>
            <Select value={formData.roleId} onValueChange={(value) => setFormData((prev) => ({ ...prev, roleId: value }))}>
              <SelectTrigger className={getFieldError("roleId", errors) ? "border-destructive" : ""}>
                <SelectValue placeholder={tenantId ? "Select role" : "Select a tenant first"} />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>{role.displayName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {getFieldError("roleId", errors) && (
              <div className="flex items-center gap-1 text-xs text-destructive">
                <AlertCircle className="h-3 w-3" />
                {getFieldError("roleId", errors)}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>2FA Configuration</Label>
            <Select value={formData.twoFactorMode} onValueChange={(value: TwoFactorMode) => setFormData((prev) => ({ ...prev, twoFactorMode: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select 2FA mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="disabled">Disabled</SelectItem>
                <SelectItem value="email">Email OTP required</SelectItem>
                <SelectItem value="app">Authenticator app setup pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update User
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
