import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { getFieldError, ValidationError } from "@/lib/formValidator";
import { Organization, UpdateOrganizationRequest } from "@/models/Organization";
import {
  BUTTON_LABELS,
  EMPTY_ORGANIZATION_FORM,
  IMAGE_CONFIG,
  ORGANIZATION_FORM,
  OrganizationFormValues,
} from "@/pages/organization";
import { FormValidator } from "@/pages/organization/formValidator";
import { OrganizationImageUpload } from "@/pages/organization/OrganizationImageUpload";
import { OrganizationRichTextField } from "@/pages/organization/OrganizationRichTextField";

interface EditOrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  organization?: Organization;
  isLoading: boolean;
  onSubmit: (data: UpdateOrganizationRequest) => Promise<void>;
}

const basicFieldConfig: Array<{
  key: keyof OrganizationFormValues;
  label: string;
  placeholder: string;
  type?: "text" | "email" | "url";
}> = [
  { key: "title", label: ORGANIZATION_FORM.TITLE_LABEL, placeholder: ORGANIZATION_FORM.TITLE_PLACEHOLDER },
  { key: "logoTitle", label: ORGANIZATION_FORM.LOGO_TITLE_LABEL, placeholder: ORGANIZATION_FORM.LOGO_TITLE_PLACEHOLDER },
  { key: "phone", label: ORGANIZATION_FORM.PHONE_LABEL, placeholder: ORGANIZATION_FORM.PHONE_PLACEHOLDER },
  { key: "email", label: ORGANIZATION_FORM.EMAIL_LABEL, placeholder: ORGANIZATION_FORM.EMAIL_PLACEHOLDER, type: "email" },
  { key: "socialFbUrl", label: ORGANIZATION_FORM.SOCIAL_FB_LABEL, placeholder: ORGANIZATION_FORM.SOCIAL_PLACEHOLDER, type: "url" },
  { key: "socialInUrl", label: ORGANIZATION_FORM.SOCIAL_IN_LABEL, placeholder: ORGANIZATION_FORM.SOCIAL_PLACEHOLDER, type: "url" },
  { key: "socialXUrl", label: ORGANIZATION_FORM.SOCIAL_X_LABEL, placeholder: ORGANIZATION_FORM.SOCIAL_PLACEHOLDER, type: "url" },
  { key: "socialUtubeUrl", label: ORGANIZATION_FORM.SOCIAL_UTUBE_LABEL, placeholder: ORGANIZATION_FORM.SOCIAL_PLACEHOLDER, type: "url" },
];

function mapOrganizationToFormValues(organization?: Organization): OrganizationFormValues {
  if (!organization) {
    return EMPTY_ORGANIZATION_FORM;
  }

  return {
    title: organization.title || "",
    logoTitle: organization.logoTitle || "",
    phone: organization.phone || "",
    email: organization.email || "",
    address: organization.address || "",
    socialFbUrl: organization.socialFbUrl || "",
    socialInUrl: organization.socialInUrl || "",
    socialXUrl: organization.socialXUrl || "",
    socialUtubeUrl: organization.socialUtubeUrl || "",
    license: organization.license || "",
    privacyPolicy: organization.privacyPolicy || "",
    returnPolicy: organization.returnPolicy || "",
    isActive: organization.isActive === true,
  };
}

export function EditOrganizationModal({
  isOpen,
  onClose,
  organization,
  isLoading,
  onSubmit,
}: EditOrganizationModalProps) {
  const [formData, setFormData] = useState<OrganizationFormValues>(EMPTY_ORGANIZATION_FORM);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [removeImage, setRemoveImage] = useState(false);
  const [errors, setErrors] = useState<ValidationError[]>([]);

  useEffect(() => {
    if (!organization || !isOpen) {
      return;
    }

    setFormData(mapOrganizationToFormValues(organization));
    setSelectedImage(null);
    setImagePreview(organization.imageUrl || "");
    setRemoveImage(false);
    setErrors([]);
  }, [organization, isOpen]);

  const setFieldValue = (field: keyof OrganizationFormValues, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setErrors((prev) => prev.filter((error) => error.field !== field));
  };

  const handleImageSelected = (file: File) => {
    const imageValidationErrors = FormValidator.validateImage(file);
    if (imageValidationErrors.length > 0) {
      setErrors((prev) => [...prev.filter((error) => error.field !== "image"), ...imageValidationErrors]);
      setSelectedImage(null);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(file);
      setImagePreview(reader.result as string);
      setRemoveImage(false);
      setErrors((prev) => prev.filter((error) => error.field !== "image"));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview("");
    setRemoveImage(true);
    setErrors((prev) => prev.filter((error) => error.field !== "image"));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const validation = FormValidator.validateUpdateOrganization({
      ...formData,
      image: selectedImage,
      removeImage,
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      await onSubmit({
        ...formData,
        image: selectedImage,
        removeImage: removeImage || undefined,
      });

      onClose();
    } catch {
      // Mutation toasts handle the visible error state.
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[960px] max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Organization</DialogTitle>
          <DialogDescription>
            Update tenant ownership, branding, contact details, and policy content for this organization.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {basicFieldConfig.map((field) => (
              <div key={field.key} className="space-y-2">
                <Label htmlFor={field.key} className="text-sm font-medium">
                  {field.label}
                </Label>
                <Input
                  id={field.key}
                  type={field.type || "text"}
                  value={String(formData[field.key])}
                  disabled={isLoading}
                  placeholder={field.placeholder}
                  className={getFieldError(field.key, errors) ? "border-destructive focus:ring-destructive" : ""}
                  onChange={(event) => setFieldValue(field.key, event.target.value)}
                />
                {getFieldError(field.key, errors) ? (
                  <div className="flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <span>{getFieldError(field.key, errors)}</span>
                  </div>
                ) : null}
              </div>
            ))}

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="license" className="text-sm font-medium">
                {ORGANIZATION_FORM.LICENSE_LABEL}
              </Label>
              <Textarea
                id="license"
                rows={4}
                value={formData.license}
                disabled={isLoading}
                placeholder={ORGANIZATION_FORM.LICENSE_PLACEHOLDER}
                className={getFieldError("license", errors) ? "border-destructive focus:ring-destructive" : ""}
                onChange={(event) => setFieldValue("license", event.target.value)}
              />
              {getFieldError("license", errors) ? (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <span>{getFieldError("license", errors)}</span>
                </div>
              ) : null}
            </div>

            <div className="md:col-span-2">
              <OrganizationImageUpload
                label={ORGANIZATION_FORM.IMAGE_LABEL}
                helperText={ORGANIZATION_FORM.IMAGE_HELPER}
                acceptedExtensions={IMAGE_CONFIG.ACCEPTED_EXTENSIONS}
                previewSrc={imagePreview}
                error={getFieldError("image", errors)}
                disabled={isLoading}
                onFileSelected={handleImageSelected}
                onRemoveImage={handleRemoveImage}
              />
            </div>

            <div className="md:col-span-2">
              <OrganizationRichTextField
                id="address"
                label={ORGANIZATION_FORM.ADDRESS_LABEL}
                value={formData.address}
                disabled={isLoading}
                placeholder={ORGANIZATION_FORM.ADDRESS_PLACEHOLDER}
                helperText={ORGANIZATION_FORM.ADDRESS_HELPER}
                error={getFieldError("address", errors)}
                onChange={(value) => setFieldValue("address", value)}
              />
            </div>

            <div className="md:col-span-2">
              <OrganizationRichTextField
                id="privacyPolicy"
                label={ORGANIZATION_FORM.PRIVACY_POLICY_LABEL}
                value={formData.privacyPolicy}
                disabled={isLoading}
                placeholder={ORGANIZATION_FORM.PRIVACY_POLICY_PLACEHOLDER}
                helperText={ORGANIZATION_FORM.PRIVACY_POLICY_HELPER}
                error={getFieldError("privacyPolicy", errors)}
                onChange={(value) => setFieldValue("privacyPolicy", value)}
              />
            </div>

            <div className="md:col-span-2">
              <OrganizationRichTextField
                id="returnPolicy"
                label={ORGANIZATION_FORM.RETURN_POLICY_LABEL}
                value={formData.returnPolicy}
                disabled={isLoading}
                placeholder={ORGANIZATION_FORM.RETURN_POLICY_PLACEHOLDER}
                helperText={ORGANIZATION_FORM.RETURN_POLICY_HELPER}
                error={getFieldError("returnPolicy", errors)}
                onChange={(value) => setFieldValue("returnPolicy", value)}
              />
            </div>

            {organization?.createdOn ? (
              <div className="rounded-xl border bg-muted/20 px-4 py-3 text-xs text-muted-foreground md:col-span-2">
                <p>Created: {new Date(organization.createdOn).toLocaleString()}</p>
                {organization.updatedOn ? <p>Updated: {new Date(organization.updatedOn).toLocaleString()}</p> : null}
              </div>
            ) : null}

            <div className="flex items-center justify-between rounded-xl border bg-muted/20 px-4 py-3 md:col-span-2">
              <div>
                <Label htmlFor="isActive" className="text-sm font-medium">
                  {ORGANIZATION_FORM.ACTIVE_LABEL}
                </Label>
                <p className="text-xs text-muted-foreground">{ORGANIZATION_FORM.ACTIVE_HELPER}</p>
              </div>
              <Switch
                id="isActive"
                checked={formData.isActive}
                disabled={isLoading}
                onCheckedChange={(checked) => setFieldValue("isActive", checked)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t pt-4">
            <Button type="button" variant="outline" disabled={isLoading} onClick={onClose}>
              {BUTTON_LABELS.CANCEL}
            </Button>
            <Button type="submit" disabled={isLoading} className="gap-2">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  {BUTTON_LABELS.UPDATE_ORGANIZATION}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}