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
import { Loader2, AlertCircle } from "lucide-react";
import {  getFieldError, ValidationError } from "@/lib/formValidator";
import { Checkbox } from "@/components/ui/checkbox";
import { FormValidator } from "./formValidator";

interface CreateTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  isLoading: boolean;
}

export function CreateTenantModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: CreateTenantModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    domain: "",
    isActive: true,
  });

  const [errors, setErrors] = useState<ValidationError[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    setErrors(errors.filter((e) => e.field !== name));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      isActive: checked,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const validation = FormValidator.validateCreateTenant(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      const submitData: any = {
        name: formData.name,
        isActive: formData.isActive,
      };

      // Only include domain if it's not empty
      if (formData.domain.trim()) {
        submitData.domain = formData.domain;
      }

      await onSubmit(submitData);

      // Reset form on success
      setFormData({
        name: "",
        domain: "",
        isActive: true,
      });
      setErrors([]);
    } catch (error) {
      console.error("Submit error:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Tenant</DialogTitle>
          <DialogDescription>
            Add a new tenant to the system. Name is required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="Enter tenant name"
              value={formData.name}
              onChange={handleChange}
              className={getFieldError("name", errors) ? "border-destructive" : ""}
            />
            {getFieldError("name", errors) && (
              <div className="flex items-center gap-1 text-xs text-destructive">
                <AlertCircle className="h-3 w-3" />
                {getFieldError("name", errors)}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="domain">Domain (Optional)</Label>
            <Input
              id="domain"
              name="domain"
              placeholder="Enter domain (optional)"
              value={formData.domain}
              onChange={handleChange}
              className={getFieldError("domain",errors) ? "border-destructive" : ""}
            />
            {getFieldError("domain", errors) && (
              <div className="flex items-center gap-1 text-xs text-destructive">
                <AlertCircle className="h-3 w-3" />
                {getFieldError("domain", errors)}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={handleCheckboxChange}
            />
            <Label
              htmlFor="isActive"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Active
            </Label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Tenant
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
