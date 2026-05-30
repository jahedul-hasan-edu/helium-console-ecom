import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useTenants } from "@/hooks/use-Tenant";
import { getFieldError, ValidationError } from "@/lib/formValidator";
import { CreateOrganizationRequest } from "@/models/Organization";
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

interface CreateOrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateOrganizationRequest) => Promise<void>;
  isLoading: boolean;
  tenantId?: string | null;
  requireTenantSelection?: boolean;
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

export function CreateOrganizationModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  tenantId,
  requireTenantSelection = false,
}: CreateOrganizationModalProps) {
  const [formData, setFormData] = useState<OrganizationFormValues>(EMPTY_ORGANIZATION_FORM);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState(tenantId || "");
  const { data: tenantsData, isLoading: tenantsLoading } = useTenants({ pageSize: 100 });

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
      setImagePreview("");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(file);
      setImagePreview(reader.result as string);
      setErrors((prev) => prev.filter((error) => error.field !== "image"));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview("");
    setErrors((prev) => prev.filter((error) => error.field !== "image"));
  };

  const resetForm = () => {
    setFormData(EMPTY_ORGANIZATION_FORM);
    setSelectedImage(null);
    setImagePreview("");
    setErrors([]);
    setSelectedTenantId(tenantId || "");
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const effectiveTenantId = tenantId || selectedTenantId;

    if (requireTenantSelection && !effectiveTenantId) {
      setErrors((prev) => [
        ...prev.filter((error) => error.field !== "tenantId"),
        { field: "tenantId", message: ORGANIZATION_FORM.VALIDATION.TENANT_REQUIRED },
      ]);
      return;
    }

    const validation = FormValidator.validateCreateOrganization({
      ...formData,
      tenantId: effectiveTenantId,
      image: selectedImage,
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      await onSubmit({
        tenantId: effectiveTenantId || undefined,
        ...formData,
        image: selectedImage,
      });

      resetForm();
      onClose();
    } catch {
      // Mutation toasts handle the visible error state.
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[960px] max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Organization</DialogTitle>
          <DialogDescription>
            Create a tenant-scoped organization profile with contact details, branding, and policy content.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {requireTenantSelection ? (
              <div className="space-y-2 md:col-span-2">
                <Label className="text-sm font-medium">{ORGANIZATION_FORM.TENANT_LABEL}</Label>
                <Select
                  value={selectedTenantId}
                  disabled={isLoading || tenantsLoading}
                  onValueChange={(value) => {
                    setSelectedTenantId(value);
                    setErrors((prev) => prev.filter((error) => error.field !== "tenantId"));
                  }}
                >
                  <SelectTrigger className={getFieldError("tenantId", errors) ? "border-destructive focus:ring-destructive" : ""}>
                    <SelectValue placeholder={ORGANIZATION_FORM.TENANT_PLACEHOLDER} />
                  </SelectTrigger>
                  <SelectContent>
                    {tenantsData?.items?.map((tenant) => (
                      <SelectItem key={tenant.id} value={tenant.id}>
                        {tenant.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {getFieldError("tenantId", errors) ? (
                  <div className="flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <span>{getFieldError("tenantId", errors)}</span>
                  </div>
                ) : null}
              </div>
            ) : null}

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
                  Creating...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  {BUTTON_LABELS.CREATE_ORGANIZATION}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}