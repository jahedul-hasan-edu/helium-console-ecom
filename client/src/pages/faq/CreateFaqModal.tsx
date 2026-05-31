import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { getFieldError, ValidationError } from "@/lib/formValidator";
import { FormValidator } from "./formValidator";
import { FAQ_FORM } from "@/pages/faq";

interface CreateFaqModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  isLoading: boolean;
  tenantId?: string;
}

export function CreateFaqModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  tenantId,
}: CreateFaqModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    answer: "",
    tenantId: "",
    isActive: true,
  });

  const [errors, setErrors] = useState<ValidationError[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    // Clear error for this field when user starts typing
    setErrors(errors.filter((e) => e.field !== name));
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
    const validation = FormValidator.validateCreateFaq({
      ...formData,
      tenantId: tenantId || formData.tenantId,
    });
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      await onSubmit({
        ...formData,
        tenantId: tenantId || formData.tenantId,
      });

      // Reset form on success
      setFormData({
        title: "",
        answer: "",
        tenantId: "",
        isActive: true,
      });
      setErrors([]);
    } catch (error) {
      console.error("Submit error:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>Create New FAQ</DialogTitle>
          <DialogDescription>
            Add a new frequently asked question and its answer.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex max-h-[calc(90vh-88px)] flex-col">
          <div className="space-y-4 overflow-y-auto px-6 py-4">
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
              name="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => handleCheckboxChange("isActive", !!checked)}
              disabled={isLoading}
            />
            <Label htmlFor="isActive" className="cursor-pointer text-sm">
              {FAQ_FORM.ACTIVE_LABEL}
            </Label>
          </div>
          </div>

          <DialogFooter className="border-t px-6 py-4">
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
              disabled={isLoading || !FormValidator.validateCreateFaq(formData).isValid}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Create FAQ
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
