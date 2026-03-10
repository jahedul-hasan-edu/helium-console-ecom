import { AlertCircle, Upload, X } from "lucide-react";
import { Label } from "@/components/ui/label";

interface OrganizationImageUploadProps {
  label: string;
  helperText: string;
  acceptedExtensions: string;
  previewSrc?: string;
  error?: string;
  disabled?: boolean;
  onFileSelected: (file: File) => void;
  onRemoveImage: () => void;
}

export function OrganizationImageUpload({
  label,
  helperText,
  acceptedExtensions,
  previewSrc,
  error,
  disabled,
  onFileSelected,
  onRemoveImage,
}: OrganizationImageUploadProps) {
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label className="text-sm font-medium">{label}</Label>
        <p className="text-xs text-muted-foreground">{helperText}</p>
      </div>

      {previewSrc ? (
        <div className="relative overflow-hidden rounded-xl border bg-muted/20">
          <img src={previewSrc} alt="Organization preview" className="h-56 w-full object-cover" />
          <button
            type="button"
            onClick={onRemoveImage}
            disabled={disabled}
            className="absolute right-3 top-3 rounded-full bg-destructive p-2 text-destructive-foreground shadow-sm transition hover:bg-destructive/90 disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <label
          className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-10 text-center transition-colors ${
            error ? "border-destructive bg-destructive/5" : "border-border bg-muted/20 hover:bg-muted/40"
          } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
        >
          <input
            type="file"
            accept={acceptedExtensions}
            disabled={disabled}
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                onFileSelected(file);
              }
              event.target.value = "";
            }}
          />
          <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
          <span className="text-sm font-medium">Click to upload a single image</span>
          <span className="mt-1 text-xs text-muted-foreground">Drag-and-drop is not required here. Use JPG, PNG, or WebP.</span>
        </label>
      )}

      {error ? (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      ) : null}
    </div>
  );
}