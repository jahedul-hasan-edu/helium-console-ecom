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
import { getFieldError, ValidationError } from "@/lib/formValidator";
import { FormValidator } from "./formValidator";
import { SUBSCRIPTION_PLAN_FORM } from ".";

interface CreateSubscriptionPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  isLoading: boolean;
}

export function CreateSubscriptionPlanModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: CreateSubscriptionPlanModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    durationDays: "",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const validation = FormValidator.validateCreateSubscriptionPlan(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      await onSubmit({
        ...formData,
        durationDays: parseInt(formData.durationDays),
      });

      // Reset form on success
      setFormData({
        name: "",
        price: "",
        durationDays: "",
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
          <DialogTitle>Create New Subscription Plan</DialogTitle>
          <DialogDescription>
            Add a new subscription plan to the system. All fields are required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              {SUBSCRIPTION_PLAN_FORM.NAME_LABEL}
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              placeholder={SUBSCRIPTION_PLAN_FORM.NAME_PLACEHOLDER}
              value={formData.name}
              onChange={handleChange}
              className={
                getFieldError("name", errors) ? "border-destructive" : ""
              }
            />
            {getFieldError("name", errors) && (
              <div className="flex items-center gap-1 text-xs text-destructive">
                <AlertCircle className="h-3 w-3" />
                {getFieldError("name", errors)}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">
              {SUBSCRIPTION_PLAN_FORM.PRICE_LABEL}
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="price"
              name="price"
              placeholder={SUBSCRIPTION_PLAN_FORM.PRICE_PLACEHOLDER}
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={handleChange}
              className={
                getFieldError("price", errors) ? "border-destructive" : ""
              }
            />
            {getFieldError("price", errors) && (
              <div className="flex items-center gap-1 text-xs text-destructive">
                <AlertCircle className="h-3 w-3" />
                {getFieldError("price", errors)}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="durationDays">
              {SUBSCRIPTION_PLAN_FORM.DURATION_DAYS_LABEL}
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="durationDays"
              name="durationDays"
              placeholder={SUBSCRIPTION_PLAN_FORM.DURATION_DAYS_PLACEHOLDER}
              type="number"
              min="1"
              value={formData.durationDays}
              onChange={handleChange}
              className={
                getFieldError("durationDays", errors) ? "border-destructive" : ""
              }
            />
            {getFieldError("durationDays", errors) && (
              <div className="flex items-center gap-1 text-xs text-destructive">
                <AlertCircle className="h-3 w-3" />
                {getFieldError("durationDays", errors)}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.name || !formData.price || !formData.durationDays}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Plan"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
