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
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, AlertCircle, CheckCircle2, Upload, X, Image as ImageIcon } from "lucide-react";
import { getFieldError, ValidationError, FormValidator } from "@/pages/popupAd/formValidator";
import { useTenants } from "@/hooks/use-Tenant";
import { POPUP_AD_FORM, IMAGE_CONFIG } from "@/pages/popupAd";
import { PopupAd, UpdatePopupAdRequest } from "@/models/PopupAd";
import { Tenant } from "@/models/Tenant";

interface EditPopupAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, data: UpdatePopupAdRequest) => Promise<void>;
  isLoading: boolean;
  popupAd: PopupAd | undefined;
}

export function EditPopupAdModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  popupAd,
}: EditPopupAdModalProps) {
  const [formData, setFormData] = useState<UpdatePopupAdRequest>({
    title: "",
    tenantId: "",
    isActive: true,
  });

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [removeImage, setRemoveImage] = useState(false);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const { data: tenantsData } = useTenants();

  const tenants = tenantsData?.items || [];

  useEffect(() => {
    if (popupAd && isOpen) {
      setFormData({
        title: popupAd.title || "",
        tenantId: popupAd.tenantId || "",
        isActive: popupAd.isActive === true,
      });
      setImagePreview(popupAd.imageUrl || "");
      setSelectedImage(null);
      setRemoveImage(false);
      setErrors([]);
    }
  }, [popupAd, isOpen]);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate image
      const imageErrors = FormValidator.validateImage(file);
      if (imageErrors.length > 0) {
        setErrors((prev) => [...prev.filter((e) => e.field !== "image"), ...imageErrors]);
        setSelectedImage(null);
        return;
      }

      setSelectedImage(file);
      setRemoveImage(false);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Clear image errors if any
      setErrors((prev) => prev.filter((e) => e.field !== "image"));
    }
    event.target.value = "";
  };

  const handleRemoveImage = () => {
    setRemoveImage(true);
    setImagePreview("");
    setSelectedImage(null);
    setErrors((prev) => prev.filter((e) => e.field !== "image"));
  };

  const validateForm = () => {
    const validationErrors = FormValidator.validateUpdatePopupAd({
      ...formData,
      image: selectedImage || undefined,
    });
    setErrors(validationErrors);
    return validationErrors.length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as any;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
    // Clear error for this field when user starts typing
    setErrors((prev) => prev.filter((e) => e.field !== name));
  };

  const handleTenantChange = (value: string) => {
    setFormData((prev) => ({ ...prev, tenantId: value }));
    setErrors((prev) => prev.filter((e) => e.field !== "tenantId"));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !popupAd?.id) return;

    try {
      const submitData: UpdatePopupAdRequest = {
        ...formData,
        image: selectedImage || undefined,
        removeImage: removeImage || undefined,
      };
      await onSubmit(popupAd.id, submitData);
      onClose();
    } catch (error) {
      // Error is handled by the component that calls this
    }
  };

  const hasErrors = errors.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Popup Ad</DialogTitle>
          <DialogDescription>Update the popup advertisement details</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tenant Select */}
          <div className="space-y-2">
            <Label htmlFor="tenantId" className="text-sm font-medium">
              {POPUP_AD_FORM.tenantLabel}
            </Label>
            <Select value={formData.tenantId} onValueChange={handleTenantChange}>
              <SelectTrigger
                id="tenantId"
                className={
                  getFieldError("tenantId", errors)
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                }
              >
                <SelectValue placeholder={POPUP_AD_FORM.tenantPlaceholder} />
              </SelectTrigger>
              <SelectContent>
                {tenants.map((tenant: Tenant) => (
                  <SelectItem key={tenant.id} value={tenant.id}>
                    {tenant.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {getFieldError("tenantId", errors) && (
              <div className="flex items-center gap-2 text-sm text-red-500">
                <AlertCircle className="h-4 w-4" />
                <span>{getFieldError("tenantId", errors)}</span>
              </div>
            )}
          </div>

          {/* Title Input */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              {POPUP_AD_FORM.title}
            </Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder={POPUP_AD_FORM.titlePlaceholder}
              disabled={isLoading}
              className={
                getFieldError("title", errors) ? "border-red-500 focus:ring-red-500" : ""
              }
            />
            <p className="text-xs text-gray-500">{POPUP_AD_FORM.titleHelper}</p>
            {getFieldError("title", errors) && (
              <div className="flex items-center gap-2 text-sm text-red-500">
                <AlertCircle className="h-4 w-4" />
                <span>{getFieldError("title", errors)}</span>
              </div>
            )}
          </div>

          {/* Image Upload */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">{POPUP_AD_FORM.imageSection}</Label>
            <p className="text-xs text-gray-500">{POPUP_AD_FORM.imageHelper}</p>

            {!imagePreview || removeImage ? (
              <label
                className={`flex items-center justify-center w-full px-4 py-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                  getFieldError("image", errors)
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300 bg-gray-50 hover:bg-gray-100"
                }`}
              >
                <input
                  type="file"
                  accept={IMAGE_CONFIG.acceptedExtensions}
                  onChange={handleImageSelect}
                  disabled={isLoading}
                  className="hidden"
                />
                <div className="text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600">{POPUP_AD_FORM.dragDropText}</p>
                </div>
              </label>
            ) : (
              <div className="relative w-full">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  disabled={isLoading}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {getFieldError("image", errors) && (
              <div className="flex items-center gap-2 text-sm text-red-500">
                <AlertCircle className="h-4 w-4" />
                <span>{getFieldError("image", errors)}</span>
              </div>
            )}
          </div>

          {/* Active Checkbox */}
          <div className="flex items-center space-x-2">
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
            <Label
              htmlFor="isActive"
              className="text-sm font-medium cursor-pointer"
            >
              {POPUP_AD_FORM.isActive}
            </Label>
            <p className="text-xs text-gray-500">{POPUP_AD_FORM.isActiveHelper}</p>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
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
              disabled={isLoading || hasErrors}
              className="gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Update Popup Ad
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
