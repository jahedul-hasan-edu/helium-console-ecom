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
import { SubscriptionPlan } from "@/models/SubscriptionPlan";
import { getFieldError, ValidationError } from "@/lib/formValidator";
import { FormValidator } from "./formValidator";
import { SUBSCRIPTION_PLAN_FORM } from ".";

interface EditSubscriptionPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan?: SubscriptionPlan;
  onSubmit: (data: any) => Promise<void>;
  isLoading: boolean;
}

export function EditSubscriptionPlanModal({
  isOpen,
  onClose,
  plan,
  onSubmit,
  isLoading,
}: EditSubscriptionPlanModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    durationDays: "",
  });

  const [errors, setErrors] = useState<ValidationError[]>([]);

  useEffect(() => {
    if (plan) {
      setFormData({
        name: plan.name || "",
        price: plan.price || "",
        durationDays: plan.durationDays?.toString() || "",
      });
      setErrors([]);
    }
  }, [plan, isOpen]);

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
    const validation = FormValidator.validateUpdateSubscriptionPlan(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      await onSubmit({
        ...formData,
        durationDays: parseInt(formData.durationDays),
      });
    } catch (error) {
      console.error("Submit error:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Subscription Plan</DialogTitle>
          <DialogDescription>
            Update subscription plan information.
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

          <div className="mt-6 rounded-lg bg-muted p-3 text-sm text-muted-foreground space-y-1">
            <p>
              <span className="font-semibold">ID:</span> {plan?.id}
            </p>
            {plan?.createdOn && (
              <p>
                <span className="font-semibold">Created:</span>{" "}
                {new Date(plan.createdOn).toLocaleDateString()}
              </p>
            )}
            {plan?.updatedOn && (
              <p>
                <span className="font-semibold">Last Updated:</span>{" "}
                {new Date(plan.updatedOn).toLocaleDateString()}
              </p>
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
                  Updating...
                </>
              ) : (
                "Update Plan"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
