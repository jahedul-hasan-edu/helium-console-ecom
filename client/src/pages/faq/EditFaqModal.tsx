import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { getFieldError, ValidationError } from "@/lib/formValidator";
import { Faq } from "@/models/Faq";
import { FormValidator } from "./formValidator";
import { useTenants } from "@/hooks/use-Tenant";
import { FAQ_FORM } from "@/pages/faq";

interface EditFaqModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  isLoading: boolean;
  faq?: Faq;
}

export function EditFaqModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  faq,
}: EditFaqModalProps) {

  const [formData, setFormData] = useState({
    title: "",
    answer: "",
    tenantId: "",
    isActive: true,
  });

  const [errors, setErrors] = useState<ValidationError[]>([]);
  const { data: tenantsData, isLoading: tenantsLoading } = useTenants({
    pageSize: 1000,
  });

  useEffect(() => {
    if (faq && isOpen) {
      setFormData({
        title: faq.title || "",
        answer: faq.answer || "",
        tenantId: faq.tenantId || "",
        isActive: faq.isActive === true,
      });
      setErrors([]);
    }
  }, [faq, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    setErrors(errors.filter((e) => e.field !== name));
  };

  const handleTenantChange = (tenantId: string) => {
    setFormData((prev) => ({
      ...prev,
      tenantId,
    }));
    // Clear error for this field
    setErrors(errors.filter((e) => e.field !== "tenantId"));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const validation = FormValidator.validateUpdateFaq(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      await onSubmit(formData);
      setErrors([]);
    } catch (error) {
      console.error("Submit error:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit FAQ</DialogTitle>
          <DialogDescription>
            Update the FAQ details.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tenant Dropdown */}
          <div className="space-y-2">
            <Label htmlFor="tenantId">{FAQ_FORM.TENANT_LABEL}</Label>
            <Select value={formData.tenantId} onValueChange={handleTenantChange} disabled={isLoading || tenantsLoading}>
              <SelectTrigger id="tenantId" className={getFieldError("tenantId", errors) ? "border-red-500" : ""}>
                <SelectValue placeholder={FAQ_FORM.TENANT_PLACEHOLDER} />
              </SelectTrigger>
              <SelectContent>
                {tenantsData?.items?.map((tenant) => (
                  <SelectItem key={tenant.id} value={tenant.id}>
                    {tenant.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {getFieldError("tenantId", errors) && (
              <div className="flex items-center gap-2 text-red-500 text-sm">
                <AlertCircle className="h-4 w-4" />
                {getFieldError("tenantId", errors)}
              </div>
            )}
          </div>

          {/* Title Field */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              name="title"
              placeholder={FAQ_FORM.TITLE_PLACEHOLDER}
              value={formData.title}
              onChange={handleChange}
              disabled={isLoading}
              className={getFieldError("title", errors) ? "border-red-500" : ""}
            />
            {getFieldError("title", errors) && (
              <div className="flex items-center gap-2 text-red-500 text-sm">
                <AlertCircle className="h-4 w-4" />
                {getFieldError("title", errors)}
              </div>
            )}
          </div>

          {/* Answer Field */}
          <div className="space-y-2">
            <Label htmlFor="answer">Answer *</Label>
            <Textarea
              id="answer"
              name="answer"
              placeholder={FAQ_FORM.ANSWER_PLACEHOLDER}
              value={formData.answer}
              onChange={handleChange}
              disabled={isLoading}
              rows={5}
              className={getFieldError("answer", errors) ? "border-red-500" : ""}
            />
            {getFieldError("answer", errors) && (
              <div className="flex items-center gap-2 text-red-500 text-sm">
                <AlertCircle className="h-4 w-4" />
                {getFieldError("answer", errors)}
              </div>
            )}
          </div>

          {/* Active Checkbox */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => {
                setFormData((prev) => ({
                  ...prev,
                  isActive: Boolean(checked),
                }));
              }}
              disabled={isLoading}
            />
            <Label htmlFor="isActive" className="cursor-pointer text-sm">
              {FAQ_FORM.ACTIVE_LABEL}
            </Label>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-2 pt-4">
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
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Update FAQ
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
