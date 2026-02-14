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
import { Loader2, AlertCircle, CheckCircle2, Upload, X } from "lucide-react";
import { getFieldError, ValidationError } from "@/lib/formValidator";
import { HomeSetting } from "@/models/HomeSetting";
import { FormValidator } from "./formValidator";
import { useTenants } from "@/hooks/use-Tenant";
import { HOME_SETTING_FORM } from "@/pages/homeSetting";

interface EditHomeSettingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  isLoading: boolean;
  homeSetting?: HomeSetting;
}

export function EditHomeSettingModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  homeSetting,
}: EditHomeSettingModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    subTitle: "",
    tenantId: "",
    isActive: true,
  });

  const [images, setImages] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<any[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  
  const { data: tenantsData, isLoading: tenantsLoading } = useTenants({
    pageSize: 1000,
  });

  useEffect(() => {
    if (homeSetting && isOpen) {
      setFormData({
        title: homeSetting.title || "",
        subTitle: homeSetting.subTitle || "",
        tenantId: homeSetting.tenantId || "",
        isActive: homeSetting.isActive === true,
      });
      setExistingImages(homeSetting.images || []);
      setImages([]);
      setImagePreview([]);
      setImagesToDelete([]);
      setErrors([]);
    }
  }, [homeSetting, isOpen]);

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
    setErrors(errors.filter((e) => e.field !== "tenantId"));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validSize = files.filter(f => f.size <= 1024 * 1024);
    
    if (validSize.length !== files.length) {
      setErrors([...errors, {
        field: "images",
        message: HOME_SETTING_FORM.VALIDATION.INVALID_IMAGE_SIZE,
      }]);
    }

    setImages([...images, ...validSize]);
    
    // Create previews
    validSize.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveNewImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    setImagePreview(imagePreview.filter((_, i) => i !== index));
  };

  const handleRemoveExistingImage = (imageId: string) => {
    setExistingImages(existingImages.filter(img => img.id !== imageId));
    setImagesToDelete([...imagesToDelete, imageId]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const validation = FormValidator.validateUpdateHomeSetting(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      const submitData: any = {
        title: formData.title,
        subTitle: formData.subTitle,
        tenantId: formData.tenantId,
        isActive: formData.isActive,
        images,
      };

      if (imagesToDelete.length > 0) {
        submitData.imagesToDelete = imagesToDelete;
      }

      await onSubmit(submitData);
      setErrors([]);
    } catch (error) {
      console.error("Submit error:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Home Setting</DialogTitle>
          <DialogDescription>
            Update the home setting details and images.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tenant Dropdown */}
          <div className="space-y-2">
            <Label htmlFor="tenantId">{HOME_SETTING_FORM.TENANT_LABEL}</Label>
            <Select value={formData.tenantId} onValueChange={handleTenantChange} disabled={isLoading || tenantsLoading}>
              <SelectTrigger id="tenantId" className={getFieldError("tenantId", errors) ? "border-red-500" : ""}>
                <SelectValue placeholder={HOME_SETTING_FORM.TENANT_PLACEHOLDER} />
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
              placeholder={HOME_SETTING_FORM.TITLE_PLACEHOLDER}
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

          {/* Subtitle Field */}
          <div className="space-y-2">
            <Label htmlFor="subTitle">Subtitle *</Label>
            <Textarea
              id="subTitle"
              name="subTitle"
              placeholder={HOME_SETTING_FORM.SUBTITLE_PLACEHOLDER}
              value={formData.subTitle}
              onChange={handleChange}
              disabled={isLoading}
              rows={3}
              className={getFieldError("subTitle", errors) ? "border-red-500" : ""}
            />
            {getFieldError("subTitle", errors) && (
              <div className="flex items-center gap-2 text-red-500 text-sm">
                <AlertCircle className="h-4 w-4" />
                {getFieldError("subTitle", errors)}
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
              {HOME_SETTING_FORM.ACTIVE_LABEL}
            </Label>
          </div>

          {/* Existing Images */}
          {existingImages.length > 0 && (
            <div className="space-y-2">
              <Label>Existing Images</Label>
              <div className="grid grid-cols-3 gap-2">
                {existingImages.map((image) => (
                  <div key={image.id} className="relative group">
                    <img
                      src={image.imageUrl}
                      alt="Existing"
                      className="w-full h-20 object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveExistingImage(image.id)}
                      className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="images">Add More Images</Label>
            <div className="border-2 border-dashed rounded-lg p-4 cursor-pointer hover:border-gray-400">
              <input
                id="images"
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                disabled={isLoading}
                className="hidden"
              />
              <label htmlFor="images" className="flex flex-col items-center gap-2 cursor-pointer">
                <Upload className="h-8 w-8 text-gray-400" />
                <span className="text-sm text-gray-600">Click to upload new images</span>
              </label>
            </div>

            {/* New Image Previews */}
            {imagePreview.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {imagePreview.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${index}`}
                      className="w-full h-20 object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveNewImage(index)}
                      className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Metadata (Read-only) */}
          {homeSetting?.createdOn && (
            <div className="text-xs text-gray-500 pt-2 border-t">
              <p>Created: {new Date(homeSetting.createdOn).toLocaleDateString()}</p>
              {homeSetting?.updatedOn && (
                <p>Updated: {new Date(homeSetting.updatedOn).toLocaleDateString()}</p>
              )}
            </div>
          )}

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
                  Update Home Setting
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
